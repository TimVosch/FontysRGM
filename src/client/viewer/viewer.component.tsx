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
import { ServerBroadcastNewProducer } from "../../common/messages/broadcastNewProducer.server";
import { listen } from "../../common/decorators/listen.decorator";

interface ViewerProps {
  socket: SocketIOClient.Socket;
}

interface ViewerState {
  producers: string[];
}

export class Viewer extends Component<ViewerProps, ViewerState> {
  handler: MessageHandler;
  rtcManager: RTCManager;

  constructor(props: Readonly<ViewerProps>) {
    super(props);

    this.state = {
      producers: [],
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
    console.log(`Broadcast started. We are: ${producerId}`);
  }

  @listen(ServerBroadcastNewProducer)
  onNewBroadcaster(message: ServerBroadcastNewProducer) {
    const { producers } = this.state;
    this.setState({
      producers: [...producers, message.producerId],
    });
  }

  render() {
    const { producers } = this.state;
    console.log(producers);

    const screens = producers.map((id) => (
      <VideoConsumer rtcManager={this.rtcManager} producerId={id} key={id} />
    ));

    return (
      <div>
        <h1>Viewer!</h1>
        {screens}
        <Broadcaster
          rtcManager={this.rtcManager}
          onStart={this.onBroadcastStart.bind(this)}
        />
        <button onClick={this.onTest.bind(this)}>Test</button>
      </div>
    );
  }
}
