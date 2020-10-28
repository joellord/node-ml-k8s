import React, { Component } from "react";
import { Slide, Image, Subtitle, Columns, List } from '@sambego/diorama';
import Speaker from "../assets/Profile.png";


export default class TalkTitle extends Component {
  render() {
    return (
      <Slide>
        <Columns>
          <div>
            <Image src={Speaker} style={{width: "50vw", top: "0px"}} color="#ccc" />
          </div>
          <div>
            <Subtitle>Hi, I'm Joel</Subtitle>
            <List className="align-left">
              <li> <span role="img" aria-label="Proud Canadian">🇨🇦</span></li>
              <li>Developer Advocate</li>
              <li>Red Hat OpenShift</li>
              <li><span role="img" aria-label="I heart">❤</span> Twitter @joel__lord</li>
            </List>
          </div>
        </Columns>
      </Slide>
    )
  }
}