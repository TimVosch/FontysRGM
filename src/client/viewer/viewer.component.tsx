import React, { Component } from "react";
import { MessageHandler } from "../message.handler";
import {
  ClientElbowshake,
  ClientType,
} from "../../common/messages/elbowshake.client";
import { VideoConsumer } from "./videoConsumer.component";
import { Broadcaster } from "./broadcaster.component";

interface ViewerProps {
  socket: SocketIOClient.Socket;
}

export class Viewer extends Component<ViewerProps> {
  handler: MessageHandler;
  broadcaster: Broadcaster;

  constructor(props: Readonly<ViewerProps>) {
    super(props);

    this.state = {
      stats: {}
    }

    this.handler = new MessageHandler(this, props.socket);
    this.initializeWS();
  }

  /**
   * Initialize websocket connection with server
   */
  initializeWS() {
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
    return (<div>
      <h1>Viewer!</h1>
      <VideoConsumer socket={this.props.socket} />
      <Broadcaster socket={this.props.socket} />
    </div>);
  }
}
