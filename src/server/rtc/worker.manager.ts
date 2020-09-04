import * as ms from "mediasoup";
import { mediaCodecs } from "./config.rtc";

export class RTCServerClass {
  private readonly transports: Record<string, ms.types.WebRtcTransport> = {};
  private worker: ms.types.Worker;
  private router: ms.types.Router;

  async start() {
    this.worker = await ms.createWorker({
      rtcMinPort: 55000,
      rtcMaxPort: 56000,
    });
    console.log("[RTCServer] Worker started!");

    this.worker.on("died", () => {
      console.log(`[RTCServer] Worker died`);
    });

    this.router = await this.worker.createRouter({
      mediaCodecs,
    });
  }

  /**
   * Create a new transport
   */
  async createTransport() {
    const listenIps = !!process.env.LISTEN_IPS
      ? JSON.parse(process.env.LISTEN_IPS)
      : ["127.0.0.1"];
    const transport = await this.router.createWebRtcTransport({
      listenIps: listenIps,
      enableTcp: true,
      enableUdp: true,
      preferUdp: true,
      enableSctp: true,
    });
    this.transports[transport.id] = transport;

    transport.on("dtlsstatechange", (state) => {
      if (state === "closed" || state === "failed") {
        console.log(`[RTCRoom] Transport ${transport.id} closed`);
        delete this.transports[transport.id];
      }
    });

    return transport;
  }

  /**
   *
   */
  async connectTransport(id: string, dtlsParameters: ms.types.DtlsParameters) {
    const transport = this.getTransport(id);

    await transport.connect({ dtlsParameters });
    console.log(`[RTCRoom] Connected transport ${transport.id}`);
  }

  /**
   *
   */
  async newProducer(
    id: string,
    kind: ms.types.MediaKind,
    rtpParameters: ms.types.RtpParameters
  ) {
    const transport = this.getTransport(id);

    const producer = await transport.produce({
      kind,
      rtpParameters,
    });

    console.log(`[RTCRoom] Created new producer ${producer.id}`);
    return producer;
  }

  /**
   * Create a new consumer for a transport
   * @param id
   * @param producerId
   * @param rtpCapabilities The device its capabilities
   */
  async newConsumer(
    id: string,
    producerId: string,
    rtpCapabilities: ms.types.RtpCapabilities
  ) {
    const transport = this.getTransport(id);

    // Create consumer
    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
    });

    console.log(`[RTCRoom] Created new consumer ${consumer.id}`);
    return consumer;
  }

  getTransport(id: string) {
    const transport = this.transports[id] || null;
    if (transport === null) {
      throw "Tried to get non-existant transport?!";
    }
    return transport;
  }

  getWorker() {
    return this.worker;
  }

  getRTPCapabilities() {
    return this.router.rtpCapabilities;
  }
}

export const RTCServer = new RTCServerClass();
