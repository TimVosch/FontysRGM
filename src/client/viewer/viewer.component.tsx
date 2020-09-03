import React, { Component } from "react";
import { MessageHandler } from "../message.handler";
import {
  ClientElbowshake,
  ClientType,
} from "../../common/messages/elbowshake.client";
import { VideoConsumer } from "./videoConsumer.component";
import { Broadcaster } from "./broadcaster.component";
import { ClientTest } from "../../common/messages/test.client";
import { ServerTest } from "../../common/messages/test.server";
import { RTCManager } from "../rtc/rtc.manager";

interface ViewerProps {
  socket: SocketIOClient.Socket;
}

interface ViewerState {
  producerId: string;
}

export class Viewer extends Component<ViewerProps, ViewerState> {
  handler: MessageHandler;
  rtcManager: RTCManager;

  constructor(props: Readonly<ViewerProps>) {
    super(props);

    this.state = {
      producerId: null,
    };

    this.handler = new MessageHandler(this, props.socket);
    this.initializeWS();
    this.rtcManager = new RTCManager(props.socket);
    this.rtcManager.initialize();
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

  async onTest() {
    const msg = new ClientTest();
    const response = await this.handler.request(msg, ServerTest);
    console.log(response);
  }

  async onBroadcastStart(producerId: string) {
    console.log("Broadcast started");

    this.setState({
      producerId,
    });
  }

  render() {
    const { producerId } = this.state;
    return (
      <div>
        <h1>Viewer!</h1>
        <VideoConsumer rtcManager={this.rtcManager} producerId={producerId} />
        <Broadcaster
          rtcManager={this.rtcManager}
          onStart={this.onBroadcastStart.bind(this)}
        />
        <button onClick={this.onTest.bind(this)}>Test</button>
      </div>
    );
  }
}
