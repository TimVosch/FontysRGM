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
import { ServerBroadcastNewProducer } from "../../common/messages/broadcastNewProducers.server";
import { listen } from "../../common/decorators/listen.decorator";
import { ServerRegisterRGM } from "../../common/messages/registerRGM.server";
import { AppBar, Toolbar, Typography } from "@material-ui/core";

interface ViewerProps {
  socket: SocketIOClient.Socket;
}

interface ViewerState {
  producers: { id: number; producerId: string }[];
  broadcaster: boolean;
}

export class Viewer extends Component<ViewerProps, ViewerState> {
  handler: MessageHandler;
  rtcManager: RTCManager;
  broadcaster = React.createRef<Broadcaster>();

  constructor(props: Readonly<ViewerProps>) {
    super(props);

    this.state = {
      producers: [],
      broadcaster: false,
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

    const id = prompt("What's your RGM ID? (Cancel to view only)");

    if (id) {
      elbowshakeMSG.type = ClientType.VIEWER;
      elbowshakeMSG.id = parseInt(id);
      setTimeout(() => this.setState({ broadcaster: true }));
    } else {
      elbowshakeMSG.type = ClientType.SPECTATOR;
    }

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

  @listen(ServerRegisterRGM)
  onRegisterRGM() {
    console.log("server repsodned Register RGM");
  }

  @listen(ServerBroadcastNewProducer)
  onNewBroadcaster(message: ServerBroadcastNewProducer) {
    this.setState({
      producers: message.producers,
    });
  }

  render() {
    const { producers } = this.state;
    console.log(producers);

    const screens = producers.map((producer) =>
      producer.producerId ? (
        <VideoConsumer
          rtcManager={this.rtcManager}
          producerId={producer.producerId}
          key={producer.id}
        />
      ) : (
        <div
          key={producer.id}
          style={{ width: "400px", height: "300px", background: "grey" }}
        ></div>
      )
    );

    return (
      <>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">RGM Streaming Tool</Typography>
          </Toolbar>
        </AppBar>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flex: 1,
            alignItems: "center",
          }}
        >
          {screens}
        </div>
        {this.state.broadcaster && (
          <Broadcaster
            ref={this.broadcaster}
            rtcManager={this.rtcManager}
            onStart={this.onBroadcastStart.bind(this)}
          />
        )}
        {/* <button onClick={this.onTest.bind(this)}>Test</button> */}
      </>
    );
  }
}
