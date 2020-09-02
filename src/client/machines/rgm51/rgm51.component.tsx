import React from "react";
import SocketIO from "socket.io-client";
import { ServerHandler } from "../server.handler";
import { Machine } from "../machine.base";
import RGM51 from "./51";

export class RGM51Page extends React.Component {
  socket: SocketIOClient.Socket;
  handler: ServerHandler;
  machine: Machine;

  componentDidMount() {
    this.socket = SocketIO();
    this.handler = new ServerHandler(this.socket, 51);
    this.machine = new RGM51(this.socket);
  }

  render() {
    return <h1>Machine 52</h1>;
  }
}
