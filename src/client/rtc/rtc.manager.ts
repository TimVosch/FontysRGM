import { MessageHandler } from "../message.handler";
import * as mediasoup from "mediasoup-client";
import { ClientRTPCapabilities } from "../../common/messages/rtc/rtpCapabilities.client";
import { ServerRTPCapabilities } from "../../common/messages/rtc/rtpCapabilities.server";
import { listen } from "../../common/decorators/listen.decorator";
import { ClientSendTransport } from "../../common/messages/rtc/sendTransport.client";
import { ServerSendTransport } from "../../common/messages/rtc/sendTransport.server";
import { ClientRecvTransport } from "../../common/messages/rtc/recvTransport.client";
import { ServerRecvTransport } from "../../common/messages/rtc/recvTransport.server";
import { EventEmitter } from "events";
import { ClientConnectTransport } from "../../common/messages/rtc/connectTransport.client";
import { ClientTransportStats } from "../../common/messages/rtc/transportStats.client";
import { ServerTransportStats } from "../../common/messages/rtc/transportStats.server";

export class RTCManager extends EventEmitter {
  private handler: MessageHandler;
  private device: mediasoup.types.Device;
  private sendTransport: mediasoup.types.Transport;
  private recvTransport: mediasoup.types.Transport;
  private producer: mediasoup.types.Producer;

  constructor(socket: SocketIOClient.Socket) {
    super();
    this.handler = new MessageHandler(this, socket);
    this.device = new mediasoup.Device();
  }

  initialize() {
    this.handler.send(new ClientRTPCapabilities());
  }

  startProducer() {
    this.handler.send(new ClientSendTransport());
  }
  startConsumer() {
    this.handler.send(new ClientRecvTransport());
  }

  getStats() {
    const msg = new ClientTransportStats();
    msg.id = this.sendTransport.id;
    this.handler.send(msg);
  }

  async activateCamera() {
    // Request camera media stream from browser
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { source: "device" },
    } as any);

    // Get the video track
    const track = mediaStream.getVideoTracks()[0];

    // Create a producer on the transport
    this.producer = await this.sendTransport.produce({
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

  onSendTransportConnect({ dtlsParameters }, callback, error) {
    console.log(`Send transport is connected`);

    const msg = new ClientConnectTransport();
    msg.id = this.sendTransport.id;
    msg.dtlsParameters = dtlsParameters;
    this.handler.send(msg);

    setTimeout(callback, 200);
  }

  onSendTransportProduce() {
    console.log(`Send transport produce`);
  }

  onRecvTransportConnect({ dtlsParameters }) {
    console.log(`Recv transport is connected`);

    const msg = new ClientConnectTransport();
    msg.id = this.sendTransport.id;
    msg.dtlsParameters = dtlsParameters;
    this.handler.send(msg);
  }

  @listen(ServerRTPCapabilities)
  async onServerRTPCapabilities(message: ServerRTPCapabilities) {
    console.log(`Received RTP Caps`);

    // Load device with server capabilities
    await this.device.load({
      routerRtpCapabilities: message.rtpCapabilties,
    });

    this.emit("initialized");
  }

  @listen(ServerSendTransport)
  async onSendTransport(message: ServerSendTransport) {
    const {
      id,
      iceCandidates,
      iceParameters,
      dtlsParameters,
      sctpParameters,
    } = message;

    this.sendTransport = this.device.createSendTransport({
      id,
      iceCandidates,
      iceParameters,
      dtlsParameters,
      sctpParameters,
    });

    this.sendTransport.on("connect", this.onSendTransportConnect.bind(this));
    this.sendTransport.on("produce", this.onSendTransportProduce.bind(this));

    console.log("Created SEND transport");
    await this.activateCamera();
  }

  @listen(ServerRecvTransport)
  onRecvTransport(message: ServerRecvTransport) {
    const {
      id,
      iceCandidates,
      iceParameters,
      dtlsParameters,
      sctpParameters,
    } = message;

    this.recvTransport = this.device.createRecvTransport({
      id,
      iceCandidates,
      iceParameters,
      dtlsParameters,
      sctpParameters,
    });

    this.recvTransport.on("connect", this.onRecvTransportConnect.bind(this));

    console.log("Created RECV transport");
  }

  @listen(ServerTransportStats)
  onTransportStats(message: ServerTransportStats) {
    console.log(message.stats[0]);
  }
}
