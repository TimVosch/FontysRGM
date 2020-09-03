import * as mediasoup from "mediasoup";
import { WebRtcTransportOptions } from "mediasoup/lib/types";

export class RTCServerClass {
  private worker: mediasoup.types.Worker;
  private router: mediasoup.types.Router;

  private readonly transportConfig: WebRtcTransportOptions = {
    listenIps: ["127.0.0.1"],
    enableTcp: true,
    enableUdp: true,
    preferUdp: true,
    enableSctp: true,
  };

  async start() {
    this.worker = await mediasoup.createWorker({ logLevel: "debug" });
    this.router = await this.worker.createRouter();
    console.log("[RTCServer] Started!");

    this.worker.on("died", () => {
      console.log(`[RTCServer] Worker died`);
    });
  }

  async createRTCTransport(): Promise<mediasoup.types.WebRtcTransport> {
    return this.router.createWebRtcTransport(this.transportConfig);
  }

  getRTPCapabilities() {
    return this.router.rtpCapabilities;
  }
}

export const RTCServer = new RTCServerClass();
