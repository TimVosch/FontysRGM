import React, { Component } from "react";
import { MessageHandler } from "../message.handler";
import {
  ClientElbowshake,
  ClientType,
} from "../../common/messages/elbowshake.client";

interface ViewerProps {
  socket: SocketIOClient.Socket;
}

export class Viewer extends Component<ViewerProps> {
  handler: MessageHandler;

  constructor(props: Readonly<ViewerProps>) {
    super(props);

    this.handler = new MessageHandler(this, props.socket);
  }

  componentDidMount() {
    this.handler.open();

    const elbowshakeMSG = new ClientElbowshake();
    elbowshakeMSG.type = ClientType.VIEWER;
    elbowshakeMSG.id = parseInt(prompt("What's your RGM ID?"));
    this.handler.send(elbowshakeMSG);
  }

  componentWillUnmount() {
    this.handler.close();
  }

  render() {
    return <h1>Viewer!</h1>;
  }
}
