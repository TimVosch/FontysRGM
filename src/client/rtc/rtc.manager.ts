import * as ms from "mediasoup-client";
import { MessageHandler } from "../message.handler";
import { RequestRTPCapabilities } from "../../common/messages/rtc/rtpCapabilities.request";
import { ResponseRTPCapabilities } from "../../common/messages/rtc/rtpCapabilities.response";
import { RequestCreateTransport } from "../../common/messages/rtc/createTransport.request";
import { ResponseCreateTransport } from "../../common/messages/rtc/createTransport.response";
import { RequestConnectTransport } from "../../common/messages/rtc/connectTransport.request";
import { ResponseConnectTransport } from "../../common/messages/rtc/connectTransport.response";
import { RequestNewProducer } from "../../common/messages/rtc/newProducer.request";
import { ResponseNewProducer } from "../../common/messages/rtc/newProducer.response";
import { RequestNewConsumer } from "../../common/messages/rtc/newConsumer.request";
import { ResponseNewConsumer } from "../../common/messages/rtc/newConsumer.response";
import { RequestTransportStats } from "../../common/messages/rtc/transportStats.request";
import { ResponseTransportStats } from "../../common/messages/rtc/transportStats.response";

export class RTCManager {
  private readonly handler: MessageHandler;
  private device: ms.types.Device;
  private transports: Record<string, ms.types.Transport> = {};
  private producingTransport: string;

  constructor(socket: SocketIOClient.Socket) {
    this.device = new ms.Device();
    this.handler = new MessageHandler(this, socket);
  }

  /**
   * Initialize device
   */
  async initialize() {
    const response = await this.handler.request(
      new RequestRTPCapabilities(),
      ResponseRTPCapabilities
    );
    await this.device.load({ routerRtpCapabilities: response.rtpCapabilities });
    console.log("Mediasoup device loaded");
  }

  /**
   * Initializes producer and starts streaming our camera
   */
  async streamCamera() {
    // Create a transport on the serverside
    const {
      id,
      iceCandidates,
      iceParameters,
      dtlsParameters,
      sctpParameters,
    } = await this.handler.request(
      new RequestCreateTransport(),
      ResponseCreateTransport
    );

    // Create our equivelant transport
    const transport = this.device.createSendTransport({
      id,
      iceCandidates,
      iceParameters,
      dtlsParameters,
      sctpParameters,
    });
    this.transports[id] = transport;
    this.producingTransport = id;

    // Send our local parameters to the server
    transport.on("connect", async ({ dtlsParameters }, done) => {
      const req = new RequestConnectTransport();
      req.id = transport.id;
      req.dtlsParameters = dtlsParameters;

      await this.handler.request(req, ResponseConnectTransport);

      console.log(`Produce transport connected!`);

      done();
    });

    // Send our local producer parameters to the server
    transport.on("produce", async ({ kind, rtpParameters }, done) => {
      const req = new RequestNewProducer();
      req.id = transport.id;
      req.kind = kind;
      req.rtpParameters = rtpParameters;

      const { id } = await this.handler.request(req, ResponseNewProducer);

      console.log(`Producer connected!`);

      done({ id });
    });

    // Get browser camera
    const camera = (
      await navigator.mediaDevices.getUserMedia({
        video: {},
      })
    ).getVideoTracks()[0];

    // Start producer
    return await transport.produce({
      track: camera,
      encodings: [
        {
          maxBitrate: 3000000,
          maxFramerate: 60,
        },
      ],
      codecOptions: {
        videoGoogleStartBitrate: 3000000,
      },
    });
  }

  /**
   * Creates a new consumer
   */
  async createConsumer(producerId: string) {
    // Create a transport on the serverside
    const {
      id: transportID,
      iceCandidates,
      iceParameters,
      dtlsParameters,
      sctpParameters,
    } = await this.handler.request(
      new RequestCreateTransport(),
      ResponseCreateTransport
    );

    // Create local equivelant transport
    const transport = this.device.createRecvTransport({
      id: transportID,
      iceCandidates,
      iceParameters,
      dtlsParameters,
      sctpParameters,
    });

    // Send server our local parameters
    transport.on("connect", async ({ dtlsParameters }, done) => {
      const req = new RequestConnectTransport();
      req.id = transport.id;
      req.dtlsParameters = dtlsParameters;

      await this.handler.request(req, ResponseConnectTransport);

      console.log("Receive transport connected!");

      done();
    });

    // Request server to create a consumer for our transport
    const consumeReq = new RequestNewConsumer();
    consumeReq.id = transport.id;
    consumeReq.producerId = producerId;
    consumeReq.rtpCapabilities = this.device.rtpCapabilities;

    const { id: consumerID, rtpParameters } = await this.handler.request(
      consumeReq,
      ResponseNewConsumer
    );

    // Create our consumer equivelant to the server-side consumer
    const consumer = await transport.consume({
      id: consumerID,
      rtpParameters,
      producerId: producerId,
      kind: "video",
    });

    return consumer;
  }

  /**
   * Get transport stats
   */
  async getStats() {
    const req = new RequestTransportStats();
    req.id = this.producingTransport;

    const res = await this.handler.request(req, ResponseTransportStats);
    return res.stats;
  }
}
