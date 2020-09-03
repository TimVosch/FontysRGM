import * as ms from "mediasoup";
import { mediaCodecs } from "./config.rtc";
import { ResponseNewConsumer } from "../../common/messages/rtc/newConsumer.response";

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
      listenIps: ["31.201.105.120"],
      enableTcp: true,
      enableUdp: true,
      preferUdp: true,
      enableSctp: true,
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
