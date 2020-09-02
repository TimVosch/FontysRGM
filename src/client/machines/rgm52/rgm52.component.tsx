import React from "react";
import SocketIO from "socket.io-client";
import { ServerHandler } from "../server.handler";
import "./rgm52.component.css";
import { Machine } from "../machine.base";
import RGM52 from "./52";

export class RGM52Page extends React.Component {
  socket: SocketIOClient.Socket;
  handler: ServerHandler;
  machine: Machine;

  componentDidMount() {
    this.socket = SocketIO();
    this.handler = new ServerHandler(this.socket, 52);
    this.machine = new RGM52(this.socket);
  }

  render() {
    return (
      <div id="rgm52">
        <div id="popup" className="popup">
          <div className="popup-toolbar">Terminal - Hacked By Tim</div>
          <div className="popup-container">
            <div id="console">
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
            </div>
          </div>
        </div>
        <div id="message" className="msg"></div>
      </div>
    );
  }
}
