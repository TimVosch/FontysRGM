import * as ms from "mediasoup";
import { mediaCodecs } from "./config.rtc";

export class RTCRoom {
  private readonly router: ms.types.Router;
  private readonly transports: Record<string, ms.types.WebRtcTransport> = {};

  constructor(router: ms.types.Router) {
    this.router = router;
  }

  getRTPCapabilities() {
    return this.router.rtpCapabilities;
  }

  /**
   * Create a new transport
   */
  async createTransport() {
    const transport = await this.router.createWebRtcTransport({
      listenIps: ["127.0.0.1"],
    });
    this.transports[transport.id] = transport;

    // Remove when closed
    transport.on("close", () => {
      delete this.transports[transport.id];
    });

    return transport;
  }

  /**
   *
   */
  async connectTransport(id: string, dtlsParameters: ms.types.DtlsParameters) {
    const transport = this.transports[id] || null;
    if (transport === null) {
      throw "Tried to connect to non-existant transport?!";
    }

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
    const transport = this.transports[id] || null;
    if (transport === null) {
      throw "Tried to create producer for non-existant transport?!";
    }

    // TODO: Do something with the producer
    const producer = await transport.produce({
      kind,
      rtpParameters,
    });

    console.log(`[RTCRoom] Created new producer ${producer.id}`);
    return producer;
  }

  /**
   * Instantiate a room
   * @param worker
   */
  static async create(worker: ms.types.Worker): Promise<RTCRoom> {
    const router = await worker.createRouter({
      mediaCodecs,
    });
    return new RTCRoom(router);
  }
}
