import React, { Component } from "react";
import { MessageHandler } from "../message.handler";
import {
  ClientElbowshake,
  ClientType,
} from "../../common/messages/elbowshake.client";
import { VideoConsumer } from "./videoConsumer.component";
import { Broadcaster } from "./broadcaster.component";
import { RTCManager } from "../rtc/rtc.manager";

interface ViewerProps {
  socket: SocketIOClient.Socket;
}

export class Viewer extends Component<ViewerProps> {
  handler: MessageHandler;
  rtcManager: RTCManager;

  constructor(props: Readonly<ViewerProps>) {
    super(props);

    this.handler = new MessageHandler(this, props.socket);
    this.rtcManager = new RTCManager(props.socket);
    this.initializeWS();

    this.rtcManager.initialize();
    this.rtcManager.on("initialized", this.startMedia.bind(this));
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

  startMedia() {
    this.rtcManager.startProducer();
    this.rtcManager.startConsumer();
  }

  componentWillUnmount() {
    this.handler.close();
  }

  render() {
    return (
      <div>
        <h1>Viewer!</h1>
        <VideoConsumer rtcManager={this.rtcManager} />
        <Broadcaster rtcManager={this.rtcManager} />
        <button onClick={this.rtcManager.join.bind(this.rtcManager)}>
          Start
        </button>
      </div>
    );
  }
}
