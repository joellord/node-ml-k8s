import dotenv from "dotenv";
import amqplib from "amqplib";
import "@tensorflow/tfjs-node";
import faceapi from "face-api.js";
import nodeCanvas from "canvas";
import fs from "fs";
import fetch from "node-fetch";
import util from "util";
import stream from "stream";
import sharp from "sharp";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STD_SIZE = 500;
const MODELS_PATH = `${__dirname}/models`;

dotenv.config({path: __dirname + "/.env"});

console.log("Loading models");
await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);

const { Canvas, Image, ImageData } = nodeCanvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

console.log(`Connecting to amqp://${process.env.MQ_SERVER}`);
const mq = await amqplib.connect(`amqp://${process.env.MQ_SERVER}`);
const channel = await mq.createChannel();

channel.assertQueue("dblink.adddescriptors");
channel.assertQueue("trainer.add");
channel.prefetch(1);

channel.consume("trainer.add", async msg => {
  let data = JSON.parse(msg.content.toString());
  let { id, handle, lastProfilePicture, fromTwitter } = data;

  console.log(`New picture to train for ${handle}, ${lastProfilePicture}`);

  let uri = fromTwitter ? lastProfilePicture.replace("_normal", "") : lastProfilePicture;
  let filename = uri.split("/");
  filename = filename[filename.length - 1];
  let fileExtension = filename.substr(filename.lastIndexOf(".") + 1);
  if (filename === fileExtension) {
    fileExtension = "jpg";
    filename = `${filename}.${fileExtension}`;
  }
  filename = `${__dirname}/tmp/${filename}`;
  await downloadImage(uri, filename);

  console.log(`Image was downloaded, resizing`);
  let modifiedFilename = filename.replace(`.${fileExtension}`, `__resized.jpg`);
  await sharp(filename)
    .resize({width: STD_SIZE, height: STD_SIZE, fit: "cover"})
    .jpeg()
    .toFile(modifiedFilename)
    .catch(e => console.log("Error transforming image", e));
  console.log(`Image resized to ${STD_SIZE}x${STD_SIZE} for ${handle} (${id})`)

  console.log(`Analysing face descriptors`);
  let descriptors = await getDescriptors(filename);
  console.log(`Analysis completed. Cleaning up and sending data to DB`);

  fs.unlinkSync(filename);
  fs.unlinkSync(modifiedFilename);

  channel.sendToQueue("dblink.adddescriptors", Buffer.from(JSON.stringify({
    handle,
    descriptors
  })));

  channel.ack(msg);
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

const getDescriptors = async filename => {
  const input = await nodeCanvas.loadImage(filename);

  const fullFaceDescription = await faceapi.detectSingleFace(input).withFaceLandmarks().withFaceDescriptor();

  if (!fullFaceDescription) {
    console.log(`No faces detected for ${filename}`);
    return;
  }

  const faceDescriptors = fullFaceDescription.descriptor;
  return faceDescriptors;
}