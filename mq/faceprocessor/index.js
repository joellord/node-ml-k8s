import "@tensorflow/tfjs-node";
import nodeCanvas from "canvas";
import faceapi from "face-api.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";
import fetch from "node-fetch";
import util from "util";
import stream from "stream";
import sharp from "sharp";
import amqp from "amqplib/callback_api.js";

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";
const STD_SIZE = 500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MODELS_PATH = `${__dirname}/../ml-models`;

console.log("Loading models");
await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);

const { Canvas, Image, ImageData } = nodeCanvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

console.log(`Connecting to RabbitMQ with URI ${RABBITMQ_URI}`);
amqp.connect(RABBITMQ_URI, (err, conn) => {
  if (err) {
    console.log(err);
    process.exit(2);
  }
  
  conn.createChannel((err, channel) => {
    if (err) {
      console.log(err);
      process.exit(3);
    }
    const recQueue = "faceprocessor.picture.descriptors";
    const sendQueue = "db.follower.add";
    channel.assertQueue(recQueue, { durable: false });
    channel.prefetch(1);
    channel.consume(recQueue, async msg => {
      let follower = JSON.parse(msg.content.toString());
      console.log(`New profile picture for ${follower.handle}, analysing`);

      // Remove the _normal from Twitter filenames to get the full size image
      let uri = follower.lastProfilePicture.replace("_normal", "");
      let filename = uri.split("/");
      filename = filename[filename.length - 1];
      let fileExtension = filename.substr(filename.lastIndexOf(".") + 1);
      if (filename === fileExtension) {
        fileExtension = "jpg";
        filename = `${filename}.${fileExtension}`;
      }
      filename = `${__dirname}/tmp/${filename}`;
      await downloadImage(uri, filename);

      console.log("Image was downloaded, resizing");

      let modifiedFilename = filename.replace(`.${fileExtension}`, `__resized.jpg`);
      await sharp(filename)
      .resize({width: STD_SIZE, height: STD_SIZE, fit: "cover"})
      .jpeg()
      .toFile(modifiedFilename)
      .catch(e => console.log("Error transforming image", e));
      console.log(`Image resized to ${STD_SIZE}x${STD_SIZE} for ${follower.handle}`)

      console.log(`Analysing face descriptors`);
      let descriptors = await getDescriptors(filename);
      if (!follower.faceDescriptors) {
        follower.faceDescriptors = [];
      }
      follower.faceDescriptors.push(descriptors);
      console.log(`Analysis completed. Cleaning up and sending data to DB`);

      fs.unlinkSync(filename);
      fs.unlinkSync(modifiedFilename);

      channel.sendToQueue(sendQueue, Buffer.from(JSON.stringify(follower)), { persistent: false });
      channel.ack(msg);
    });
  })
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