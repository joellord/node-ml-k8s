
import React, { Component } from "react";
import { Slide, Title, Text, Subtitle } from "@sambego/diorama";

export default class ThankYou extends Component {
  constructor(props) {
    super(props);

    let url = this.props.moreInfoUrl || "ezurl.to/LINK";
    url = url.replace(/http[s]*:\/\//, "");

    this.state = {
      title: this.props.title || "TALK TITLE",
      conference: this.props.conference || "CONFERENCE",
      date: this.props.date || "MONTH DAY, YEAR",
      moreInfoUrl: url
    }
  }
  render() {
    return (
      <Slide>
        <Title>{this.props.lang === "fr" ? "Merci" : "Thank You"}</Title>
        <Text>{this.state.title}</Text>
        <Text>{this.state.conference} - {this.state.date}</Text>
        <br/>
        <Subtitle><a href={`http://${this.state.moreInfoUrl}`} style={{"textTransform": "none"}}>{this.state.moreInfoUrl}</a></Subtitle>
      </Slide>
    )
  }
}