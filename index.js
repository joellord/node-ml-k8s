require("@tensorflow/tfjs-node");

const canvas = require("canvas");

const faceapi = require("face-api.js");
const { FaceMatcher } = require("face-api.js");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({Canvas, Image, ImageData});
const MODEL_URL = "../face-api.js/weights";

const UNKNOWN = process.argv.splice(2)[0] || "./unknown.jpg";

async function main() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODE_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);

  let input = await canvas.loadImage(UNKNOWN);
  let fullFaceDescriptions = await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceDescriptors();

  const labels = ["iamjerdog", "joel__lord", "kimmaida", "liran_tal", "macdonst", "notmyself", "stevegrunwell"];

  const labeledFaceDescriptors = await Promise.all(
    labels.map(async label => {
      const imgUrl = `./known_faces/${label}.jpg`;
      let img = await canvas.loadImage(imgUrl);
      const fullFaceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

      if (!fullFaceDescription) {
        throw new Error (`no faces detected for ${label}`);
      }

      const faceDescriptors = [fullFaceDescription.descriptor];

      return new faceapi.LabeledFaceDescriptors(label, faceDescriptor);
    })
  );

  const maxDescriptorDistance = 0.6;
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance);
  const results = fullFaceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor));

  console.log(results);
}

main().catch(e => console.error(e));
