import "@tensorflow/tfjs-node";
import nodeCanvas from "canvas";
import faceapi from "face-api.js";
import fs from "fs";

const TRAINING_IMAGE = "./JLord.jpg";
const TRAINING_IMAGE_WIDTH = 150;
const TRAINING_IMAGE_HEIGHT = 150;
const PROCESSED_IMAGE = "./unknown.jpg";

const MODELS_PATH = "../../face-api.js/weights";
const FACES_PATH = "../fix_images/fixed";

const { Canvas, Image, ImageData, loadImage } = nodeCanvas;
const canvas = new Canvas(TRAINING_IMAGE_WIDTH, TRAINING_IMAGE_HEIGHT);

faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const input = await nodeCanvas.loadImage(TRAINING_IMAGE);
console.log("Image loaded, loading models");
await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);

// console.log("Detecting faces");
let fullFaceDescriptions = await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceDescriptors();

// let ctx = canvas.getContext("2d");
// let image = await loadImage(TRAINING_IMAGE);
// ctx.drawImage(image, 0, 0, TRAINING_IMAGE_WIDTH, TRAINING_IMAGE_HEIGHT);
// let dim = new faceapi.Dimensions(TRAINING_IMAGE_WIDTH, TRAINING_IMAGE_HEIGHT);
// fullFaceDescriptions = faceapi.resizeResults(fullFaceDescriptions, dim)

// faceapi.draw.drawDetections(canvas, fullFaceDescriptions);
// faceapi.draw.drawFaceLandmarks(canvas, fullFaceDescriptions);

// const buffer = canvas.toBuffer("image/png");
// fs.writeFileSync("./output.png", buffer);

let labels = fs.readdirSync(FACES_PATH);

// labels = labels.slice(0,1);

const getDescriptors = async (label) => {
  console.log(`Processing ${label}`);
  const filename = label;
  const handle = label.substr(0, label.lastIndexOf("."));
  const imgUrl = `${FACES_PATH}/${filename}`;
  const extension = filename.substr(filename.lastIndexOf(".") + 1);
  if (extension == "png") {
    console.log("PNG not supported yet");
    return;
  }
  try {
    const input = await nodeCanvas.loadImage(imgUrl);
  } catch (e) {
    console.log(e); 
    return;
  }

  const fullFaceDescription = await faceapi.detectSingleFace(input).withFaceLandmarks().withFaceDescriptor();
  if (!fullFaceDescription) {
    console.log(`No actual face found for ${handle}`);
    return;
  }
  console.log(`Found descriptors for ${handle}`);
  if (!fullFaceDescription.descriptor) {
    console.log(`No descriptor found for ${handle}`);
    return;
  }
  const faceDescriptors = [fullFaceDescription.descriptor];
  return {handle, faceDescriptors};
};

let rawDescriptors = [];
let labeledFaceDescriptors = [];

for (let i = 0; i < labels.length; i++) {
  let labeledDescriptor = await getDescriptors(labels[i]);
  if (labeledDescriptor) {
    rawDescriptors.push(labeledDescriptor);
    labeledFaceDescriptors.push(new faceapi.LabeledFaceDescriptors(labeledDescriptor.handle, labeledDescriptor.faceDescriptors));
  }
}

fs.writeFileSync("descriptors.json", JSON.stringify(rawDescriptors));

// console.log("Getting ready to match faces");

// const maxDescriptorDistance = 0.6;
// const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance);
// const results = fullFaceDescriptions.map(fd => {
//   return faceMatcher.findBestMatch(fd.descriptor);
// });

// console.log(results);