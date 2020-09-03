import React, { Component } from "react";
import { MessageHandler } from "../message.handler";
import {
  ClientElbowshake,
  ClientType,
} from "../../common/messages/elbowshake.client";
import { ClientRequestTransport } from "../../common/messages/rtc/requestTransport.client";
import { listen } from "../../common/decorators/listen.decorator";
import { ServerRequestTransport } from "../../common/messages/rtc/requestTransport.server";
import * as mediasoup from "mediasoup";

interface ViewerProps {
  socket: SocketIOClient.Socket;
}

export class Viewer extends Component<ViewerProps> {
  handler: MessageHandler;
  rtcDevice: mediasoup.types.Device;
  rtcSendTransport: mediasoup.types.Transport;
  rtcRecvTransport: mediasoup.types.Transport;

  constructor(props: Readonly<ViewerProps>) {
    super(props);

    this.handler = new MessageHandler(this, props.socket);
  }

  /**
   * Initialize objects required for WebRTC
   */
  initializeRTC() {
    const req = new ClientRequestTransport();
    this.handler.send(req);
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

  componentDidMount() {
    this.initializeWS();
    this.initializeRTC();
  }

  componentWillUnmount() {
    this.handler.close();
  }

  @listen(ServerRequestTransport)
  async onClientRequestTransport(message: ServerRequestTransport) {
    console.log(`Received RTP Caps`);
    debugger;

    // Create mediasoup device
    this.rtcDevice = new mediasoup.Device();

    await this.rtcDevice.load({
      routerRtpCapabilities: message.rtpCapabilties,
    });

    if (!this.rtcDevice.canProduce("video")) {
      console.warn(`This device cannot produce video`);
      return;
    }

    this.rtcSendTransport = this.rtcDevice.createSendTransport({
      id: message.id,
      iceCandidates: message.iceCandidates,
      iceParameters: message.iceParameters,
      dtlsParameters: message.dtlsParameters,
      sctpParameters: message.sctpParameters,
      iceServers: [],
    });
    this.rtcSendTransport.on("connectionstatechange", (connectionState) => {
      console.log(`RTC Transport ${connectionState}`);
    });

    if (!this.rtcDevice.canProduce("video")) {
      console.warn("RTC device cannot produce video");
    }

    // Create transport
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { source: "device" },
    } as any);
    const track = mediaStream.getVideoTracks()[0];
    const producer = await this.rtcSendTransport.produce({
      track,
      encodings: [
        {
          maxBitrate: 10000,
          maxFramerate: 15,
        },
      ],
      codecOptions: {
        videoGoogleStartBitrate: 1000,
      },
    });
  }

  render() {
    return <h1>Viewer!</h1>;
  }
}
