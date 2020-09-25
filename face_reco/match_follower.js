import "@tensorflow/tfjs-node";
import nodeCanvas from "canvas";
import faceapi from "face-api.js";
import fs from "fs";

const WHOISTHIS_IMAGE = process.argv[2] || "./whoisthis.jpg";
const IMAGE_WIDTH = 300;
const IMAGE_HEIGHT = 300;

const MODELS_PATH = "../../face-api.js/weights";

const { Canvas, Image, ImageData, loadImage } = nodeCanvas;
const canvas = new Canvas(IMAGE_WIDTH, IMAGE_HEIGHT);

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const input = await nodeCanvas.loadImage(WHOISTHIS_IMAGE);
console.log("Image loaded, loading models");
await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);

let fullFaceDescriptions = await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceDescriptors();

let descriptors = JSON.parse(fs.readFileSync("./descriptors.json"));
let labeledFaceDescriptors = descriptors.map(desc => {
  let arr = new Float32Array(Object.values(desc.faceDescriptors[0]));
  return new faceapi.LabeledFaceDescriptors(desc.handle, [new Float32Array(arr)]);
});


console.log("Getting ready to match faces");

const maxDescriptorDistance = 0.6;
const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance);
const results = fullFaceDescriptions.map(fd => {
  return faceMatcher.findBestMatch(fd.descriptor);
});

results.forEach((bestMatch, i) => {
  console.log(bestMatch.toString());
})