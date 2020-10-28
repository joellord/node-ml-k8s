import React, { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";

const loadModels = async () => {
  const MODELS_PATH = `${process.env.PUBLIC_URL}/models`;
  await faceapi.loadSsdMobilenetv1Model(MODELS_PATH);
  await faceapi.loadFaceLandmarkModel(MODELS_PATH);
  await faceapi.loadFaceRecognitionModel(MODELS_PATH);
  await faceapi.loadFaceExpressionModel(MODELS_PATH);
};

loadModels();


let labeledFaceDescriptors;


const FaceCanvas = props => {
  const canvasRef = useRef(null);

  const loadImage = (ctx, canvas) => {  

    if (!props.file) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    let reader = new FileReader();
    reader.onload = function(event){
        let img = new Image();
        img.onload = async function(){
          let imageRatio = img.width / img.height;
          canvas.height = 300;
          canvas.width = 300 * imageRatio;
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
          let input = img;
          let fullFaceDescriptions = await faceapi
            .detectAllFaces(input)
            .withFaceLandmarks()
            .withFaceDescriptors()
            .withFaceExpressions();
          let dim = new faceapi.Dimensions(canvas.width, canvas.height);
          fullFaceDescriptions = faceapi.resizeResults(fullFaceDescriptions, dim);
          if(!props.recognition) faceapi.draw.drawDetections(canvas, fullFaceDescriptions);
          if(!props.recognition && props.showLandmarks) faceapi.draw.drawFaceLandmarks(canvas, fullFaceDescriptions);
          if(!props.recognition && props.showExpressions) faceapi.draw.drawFaceExpressions(canvas, fullFaceDescriptions);
          if (props.recognition) {
            const maxDescriptorDistance = 0.8;
            const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance);
            const results = fullFaceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor));
            results.forEach((bestMatch, i) => {
              const box = fullFaceDescriptions[i].detection.box;
              const text = bestMatch.toString();
              const drawBox = new faceapi.draw.DrawBox(box, { label: text });
              drawBox.draw(canvas);
            });
          }
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(props.file);     
  }

  useEffect(() => {
    (async () => {
      if (props.recognition) {
        labeledFaceDescriptors = await Promise.all(props.trainingdata.map(async data => {
          const img = await faceapi.fetchImage(data.link);
          const fullFaceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
          return new faceapi.LabeledFaceDescriptors(data.label, [fullFaceDescription.descriptor]);
        }));
      }
    })();
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    loadImage(context, canvas);
  }, [loadImage, props.recognition, props.trainingdata]);
  
  return (
    <canvas ref={canvasRef} {...props}/>
  );
}

export default FaceCanvas