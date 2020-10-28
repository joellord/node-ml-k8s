import React, { Component } from "react";
import { Slide, Title } from "@sambego/diorama";
import Prism from 'prismjs';

import "./CodeSlide.css";
import 'prismjs/themes/prism.css';
import "prismjs/components/prism-bash.min";
import "prismjs/components/prism-yaml.min";

export default class CodeSlide extends Component {
  render() {
    let code = this.props.children;
    const lang = this.props.lang || "javascript";

    let fontSize = 2;

    let numberOfLinesOfCode = code.split("\n").length;
    if (numberOfLinesOfCode > 10) fontSize = 1.5;
    if (numberOfLinesOfCode > 15) fontSize = 1;
    if (numberOfLinesOfCode > 20) fontSize = 0.8;

    code = Prism.highlight(code, Prism.languages[lang], Prism.languages[lang]);

    return (
      <Slide notes={this.props.notes}>
        {this.props.title &&
          <Title>{this.props.title}</Title>
        }
        <div className="code-snippet">
          <pre>
            <code style={{fontSize: `${fontSize}vw`}} dangerouslySetInnerHTML={{
              __html: code,
            }}>
            </code>
          </pre>
        </div>
      </Slide>
    )
  }
}