import React, { Component } from "react";
//import Parser from "html-react-parser";
import { Slide, Image, Title } from '@sambego/diorama';

const DARK = "#333333";
const LIGHT = "#cccccc";

const fgColor = (c) => {
  let color = c.replace("#", "");
  color = color.match(/.{1,2}/g);
  const r = parseInt(`0x${color[0]}`);
  const g = parseInt(`0x${color[1]}`);
  const b = parseInt(`0x${color[2]}`);
  const hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );
  return (hsp>127.5) ? DARK : LIGHT;
}

export default class ImageWithTitle extends Component {
  constructor(props) {
    super(props);
    const bg = props.color || "#ffffff";
    this.state = {
      fgColor: fgColor(bg),
      boxBg: fgColor(bg) === DARK ? LIGHT + "aa" : DARK + "aa",
      bgColor: bg
    }
  }

  render() {
    const titleStyle = {
      position: 'absolute', 
      left: '50%', 
      top: '50%', 
      transform: 'translate3d(-50%, -50%, 0)', 
      color: this.state.fgColor, 
      margin: 0,
      background: this.state.boxBg
    };

    return (
      <Slide notes={this.props.notes}>
        <Image src={this.props.img} full color={this.state.bgColor} />
        <Title style={titleStyle}>
          {this.props.title}
        </Title>
      </Slide>
    )
  }
}