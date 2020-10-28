import React, { Component } from "react";
import { Slide, Title } from "@sambego/diorama";
import FaceCanvas from "../components/FaceCanvas";

const possibleImages = [
  {link: "https://res.cloudinary.com/dkhriiiko/image/upload/v1603388696/node-ml-k8s/input1.jpg", label: "Joel"},
  {link: "https://res.cloudinary.com/dkhriiiko/image/upload/v1603388759/node-ml-k8s/jlord.jpg", label: "Joel"},
  {link: "https://res.cloudinary.com/dkhriiiko/image/upload/v1603388687/node-ml-k8s/Profile.png", label: "Joel"},
  {link: "https://res.cloudinary.com/dkhriiiko/image/upload/v1603462798/node-ml-k8s/IMG_20181103_121823.jpg", label: "Natacha"},
  {link: "https://res.cloudinary.com/dkhriiiko/image/upload/v1603462769/node-ml-k8s/IMG_20181108_175218.jpg", label: "Natacha"},
  {link: "https://res.cloudinary.com/dkhriiiko/image/upload/v1603462769/node-ml-k8s/IMG_20200409_191308_Bokeh.jpg", label: "Natacha"}
]

export default class Face extends Component {
  constructor(props) {
    super(props);

    this.handleImage = this.handleImage.bind(this);
    this.addTraining = this.addTraining.bind(this);

    this.state = {
      file: "",
      trainingImages: [
        possibleImages[0]
      ]
    }
  }

  async handleImage(e) {
    this.setState({
      file: e.target.files[0]
    });
  }

  addTraining() {
    if(this.state.trainingImages.length < possibleImages.length) {
      let newImages = [...this.state.trainingImages];
      newImages.push(possibleImages[newImages.length]);
      this.setState({trainingImages: newImages, file: undefined});
      document.querySelector("input").value = "";
    }
  }

  render() {
    return (
      <Slide>
        <Title>Face Recognition</Title>
        <p>
          Trained with 
          {this.state.trainingImages.map((i, index) => {
            return (<img src={i.link.replace("image/upload", "image/upload/c_scale,h_50")} width="50" height="50" key={index} alt="Training data" />)    
          })}
          <button onClick={this.addTraining}>+</button>
        </p>
        <FaceCanvas id="imageCanvas" file={this.state.file} recognition={true} trainingdata={this.state.trainingImages} />
        <input type="file" id="imageLoader" name="imageLoader" onChange={this.handleImage} />
      </Slide>
    )
  }
}