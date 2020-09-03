import React from "react";
import * as mediasoup from 'mediasoup-client';
import { MessageHandler } from "../message.handler";
import { ClientRequestTransport } from "../../common/messages/rtc/requestTransport.client";
import { ClientTransportStats } from "../../common/messages/rtc/transportStats.client";
import { ServerTransportStats } from "../../common/messages/rtc/transportStats.server";
import { ServerRequestTransport } from "../../common/messages/rtc/requestTransport.server";
import { listen } from "../../common/decorators/listen.decorator";

interface BroadcasterProps {
  socket: SocketIOClient.Socket;
}

export class Broadcaster extends React.Component<BroadcasterProps> {
  private handler: MessageHandler;
  private rtcDevice: mediasoup.types.Device;
  private rtcSendTransport: mediasoup.types.Transport;
  private rtcRecvTransport: mediasoup.types.Transport;
  private rtcProducer: mediasoup.types.Producer;

  constructor(props: Readonly<BroadcasterProps>) {
    super(props);

    this.handler = new MessageHandler(this, props.socket);
  }

  componentDidMount() {
    this.initializeRTC();
  }

  /**
   * Initialize objects required for WebRTC
   */
  initializeRTC() {
    // Create mediasoup device
    this.rtcDevice = new mediasoup.Device();

    // Request a transport
    const req = new ClientRequestTransport();
    this.handler.send(req);
  }

  reqStats() {
    console.log("Requesting stats");

    const msg = new ClientTransportStats();
    msg.id = this.rtcSendTransport.id;
    this.handler.send(msg);
  }

  @listen(ServerTransportStats)
  onTransportStats(message: ServerTransportStats) {
    console.log(message.stats[0]);
  }

  async activateCamera() {
    // Request camera media stream from browser
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { source: "device" },
    } as any);

    // Get the video track
    const track = mediaStream.getVideoTracks()[0];

    // Create a producer on the transport
    this.rtcProducer = await this.rtcSendTransport.produce({
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

  @listen(ServerRequestTransport)
  async onClientRequestTransport(message: ServerRequestTransport) {
    console.log(`Received RTP Caps`);

    // Load device with server capabilities
    await this.rtcDevice.load({
      routerRtpCapabilities: message.rtpCapabilties,
    });

    // Ensure that this device can produce video for the server
    if (!this.rtcDevice.canProduce("video")) {
      console.warn(`This device cannot produce video`);
      alert(`This device cannot produce video`);
      return;
    }

    // Create a counterpart transport
    this.rtcSendTransport = this.rtcDevice.createSendTransport({
      id: message.id,
      iceCandidates: message.iceCandidates,
      iceParameters: message.iceParameters,
      dtlsParameters: message.dtlsParameters,
      sctpParameters: message.sctpParameters,
      iceServers: [],
    });

    this.rtcSendTransport.on("connect", () => {
      console.log(`RTC Transport connected`);
    });
    this.rtcSendTransport.on("produce", () => {
      console.log(`RTC produce`);
    });

    return this.activateCamera();
  }

  render() {
    return (
      <div>
        <h1>Broadcaster</h1>
        <button onClick={this.reqStats.bind(this)}>Req stats</button>
      </div>
    )
  }
}