import "@tensorflow/tfjs-node";
import faceapi from "face-api.js";
import amqp from "amqplib";
import fetch from "node-fetch";
import util from "util";
import stream from "stream";
import fs from "fs";
import sharp from "sharp";
import nodeCanvas from "canvas";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";
const initQueue = "detector.faces.init";
const fetchInitQueue = "db.follower.facedata";
const detectQueue = "detector.faces.detect";
const newFaceQueue = "detector.face.add";

const STD_SIZE = 500;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MODELS_PATH = `${__dirname}/../ml-models`;

const { Canvas, Image, ImageData } = nodeCanvas;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
console.log("Loading Models");
await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);

let labeledFaceDescriptors;

let ready = false;

console.log(`Connecting to RabbitMQ with URI ${RABBITMQ_URI}`);

let connection = await amqp.connect(RABBITMQ_URI);
let channel = await connection.createChannel();
channel.prefetch(1);

channel.assertQueue(fetchInitQueue);
channel.sendToQueue(fetchInitQueue, Buffer.from("faces pls"), {replyTo: initQueue});

channel.assertQueue(initQueue);
channel.consume(initQueue, msg => {
  console.log("Received face data for initial detector");
  let faceData = JSON.parse(msg.content.toString());
  labeledFaceDescriptors = [];
  for (let i = 0; i < faceData.length; i++) {
    let desc = faceData[i];
    for (let j = 0; j < desc.faceDescriptors.length; j++) {
      if (!desc.faceDescriptors[j]) continue;
      let arr = new Float32Array(Object.values(desc.faceDescriptors[j]));
      labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors(`${desc.handle} (${desc.score})`, [new Float32Array(arr)]));
    }
  }

  console.log("Ready to match faces");
  ready = true;
  channel.ack(msg);
});

channel.assertQueue(newFaceQueue, {durable: false});
channel.consume(newFaceQueue, async msg => {
  let follower = JSON.parse(msg.content.toString());
  console.log(`Received face data for ${follower.handle}`);

  let arr = new Float32Array(Object.values(follower.faceDescriptor));
  labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors(`${desc.handle}`, [new Float32Array(arr)]));

  channel.ack(msg);
});

channel.assertQueue(detectQueue, {durable: false});
channel.consume(detectQueue, async msg => {
  if (!ready) {
    console.log(`Service is not ready, delaying this message for 5 seconds.`);
    let content = JSON.parse(msg.content.toString());
    channel.sendToQueue(detectQueue, Buffer.from(JSON.stringify(content)), {"x-delay": 5000});
    channel.ack(msg);
    return;
  }
  let content = JSON.parse(msg.content.toString());
  console.log(`Face detection requested for ${content.url}`);

  let ext = content.url.substr(content.url.lastIndexOf(".") + 1);
  let tmpFile = `${__dirname}/tmp.${ext}`;
  let inputFile = `${__dirname}/input.jpg`;
  let outputFile = `${__dirname}/output.png`;
  await downloadImage(content.url, tmpFile).catch(e => console.log("Error downloading file", e));
  await sharp(tmpFile)
  .resize({width: STD_SIZE, height: STD_SIZE, fit: "cover"})
  .jpeg()
  .toFile(inputFile)
  .catch(e => console.log("Error transforming image", e));
  
  fs.unlinkSync(tmpFile);

  const input = await nodeCanvas.loadImage(inputFile);

  const fullFaceDescriptions = await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceDescriptors();

  const maxDescriptorDistance = 0.6
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance);
  const results = fullFaceDescriptions.map(fd => {
    return faceMatcher.findBestMatch(fd.descriptor);
  });

  channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify({results})));
  channel.ack(msg);

  const canvas = new Canvas(STD_SIZE, STD_SIZE);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(input, 0, 0, STD_SIZE, STD_SIZE);

  results.forEach((bestMatch, i) => {
    const box = fullFaceDescriptions[i].detection.box;
    const text = bestMatch.label;
    const drawBox = new faceapi.draw.DrawBox(box, { label: text });
    drawBox.draw(canvas);
  });

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputFile, buffer);
});

const downloadImage = async (uri, filename) => {
  const streamPipeline = util.promisify(stream.pipeline);
  const response = await fetch(uri);
  if (response.ok) {
    return streamPipeline(response.body, fs.createWriteStream(filename));
  }

  if (response.status === 404) {
    return fs.copyFileSync(`${__dirname}/assets/default_profile.png`, filename);
  }

  throw new Error(`Unexpected response ${response.status} ${response.statusText}`);
};