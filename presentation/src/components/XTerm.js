import React, { Component } from "react";
import { Terminal } from "xterm";
import { AttachAddon } from "xterm-addon-attach";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

const protocol = (window.location.protocol === 'https:') ? 'wss://' : 'ws://';
// const port = window.location.port ? `:${window.location.port}` : '';
const port = ":8080";
const socketUrl = `${protocol}${window.location.hostname}${port}/shell`;
const socket = new WebSocket(socketUrl);

class XTerm extends Component {
  componentDidMount() {
    this.term = new Terminal({cursorBlink: true});
    this.term.open(document.getElementById("term"));
    this.term.writeln("Welcome to \x1B[1;3;31mxterm.js\x1B[0m");

    this.term.attachCustomKeyEventHandler(e => {
      if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        console.log("Trapping arrow keys inside terminal");
        e.stopPropagation();
      }
    });

    this.term.setOption("fontSize", 16);
    this.term.setOption("fontWeight", "bold");

    const attachAddon = new AttachAddon(socket);
    this.fitAddon = new FitAddon();
    this.term.loadAddon(attachAddon);
    this.term.loadAddon(this.fitAddon);
    this.fitAddon.fit();
  }

  render() {
    return (
      <div id="term" className="ReactXTerm"></div>
    );
  }
}

export { Terminal, XTerm };