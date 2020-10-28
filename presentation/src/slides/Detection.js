import React, { Component } from "react";
import { Slide, Title } from "@sambego/diorama";
import FaceCanvas from "../components/FaceCanvas";

export default class Detection extends Component {
  constructor(props) {
    super(props);

    this.handleImage = this.handleImage.bind(this);
    this.state = {
      file: ""
    }
  }

  async handleImage(e) {
    this.setState({
      file: e.target.files[0]
    });
  }

  render() {
    return (
      <Slide>
        <Title>{this.props.title}</Title>
        <FaceCanvas id="imageCanvas" file={this.state.file} showLandmarks={this.props.showLandmarks} showExpressions={this.props.showExpressions}/>
        <input type="file" id="imageLoader" name="imageLoader" onChange={this.handleImage} />
      </Slide>
    )
  }
}