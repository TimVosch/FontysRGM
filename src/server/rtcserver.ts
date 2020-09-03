import * as mediasoup from "mediasoup";
import { WebRtcTransportOptions } from "mediasoup/lib/types";

export class RTCServerClass {
  private worker: mediasoup.types.Worker;
  private router: mediasoup.types.Router;
  private mediaCodecs: mediasoup.types.RtpCodecCapability[] = [{
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters:
    {
      'x-google-start-bitrate': 1000
    }
  },
  {
    kind: 'video',
    mimeType: 'video/VP9',
    clockRate: 90000,
    parameters:
    {
      'profile-id': 2,
      'x-google-start-bitrate': 1000
    }
  },
  {
    kind: 'video',
    mimeType: 'video/h264',
    clockRate: 90000,
    parameters:
    {
      'packetization-mode': 1,
      'profile-level-id': '4d0032',
      'level-asymmetry-allowed': 1,
      'x-google-start-bitrate': 1000
    }
  },
  {
    kind: 'video',
    mimeType: 'video/h264',
    clockRate: 90000,
    parameters:
    {
      'packetization-mode': 1,
      'profile-level-id': '42e01f',
      'level-asymmetry-allowed': 1,
      'x-google-start-bitrate': 1000
    }
  }]

  private readonly transportConfig: WebRtcTransportOptions = {
    listenIps: ["127.0.0.1"],
    enableTcp: true,
    enableUdp: true,
    preferUdp: true,
    enableSctp: true,
  };

  async start() {
    this.worker = await mediasoup.createWorker({ logLevel: "debug" });
    this.router = await this.worker.createRouter({
      mediaCodecs: this.mediaCodecs,
    });
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
