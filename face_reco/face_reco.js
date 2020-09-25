import "@tensorflow/tfjs-node";
import nodeCanvas from "canvas";
import faceapi from "face-api.js";
import fs from "fs";

const TRAINING_IMAGE = "./JLord.jpg";
const TRAINING_IMAGE_WIDTH = 5540;
const TRAINING_IMAGE_HEIGHT = 3750;
const PROCESSED_IMAGE = "./unknown.jpg";

const MODELS_PATH = "../../face-api.js/weights";

const { Canvas, Image, ImageData, loadImage } = nodeCanvas;
const canvas = new Canvas(TRAINING_IMAGE_WIDTH, TRAINING_IMAGE_HEIGHT);

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const input = await nodeCanvas.loadImage(TRAINING_IMAGE);
console.log("Image loaded, loading models");
await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
// await faceapi.nets.faceExpressionNet.loadFromDisk(MODELS_PATH);
// await faceapi.nets.ageGenderNet.loadFromDisk(MODELS_PATH);
await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);

console.log("Detecting faces");
let fullFaceDescriptions = await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceDescriptors();

let ctx = canvas.getContext("2d");
let image = await loadImage(TRAINING_IMAGE);
ctx.drawImage(image, 0, 0, TRAINING_IMAGE_WIDTH, TRAINING_IMAGE_HEIGHT);
let dim = new faceapi.Dimensions(TRAINING_IMAGE_WIDTH, TRAINING_IMAGE_HEIGHT);
fullFaceDescriptions = faceapi.resizeResults(fullFaceDescriptions, dim)

faceapi.draw.drawDetections(canvas, fullFaceDescriptions);
faceapi.draw.drawFaceLandmarks(canvas, fullFaceDescriptions);

const buffer = canvas.toBuffer("image/png");
fs.writeFileSync("./output.png", buffer);
