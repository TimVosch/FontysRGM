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

export class RTCManager {
  private readonly handler: MessageHandler;
  private device: ms.types.Device;
  private transports: Record<string, ms.types.Transport> = {};

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

    // Send our local parameters to the server
    transport.on("connect", async ({ dtlsParameters }, done) => {
      const req = new RequestConnectTransport();
      req.id = transport.id;
      req.dtlsParameters = dtlsParameters;

      await this.handler.request(req, ResponseConnectTransport);

      done();
    });

    // Send our local producer parameters to the server
    transport.on("produce", async ({ kind, rtpParameters }, done) => {
      const req = new RequestNewProducer();
      req.id = transport.id;
      req.kind = kind;
      req.rtpParameters = rtpParameters;

      const { id } = await this.handler.request(req, ResponseNewProducer);
      done({ id });
    });

    // Get browser camera
    const camera = (
      await navigator.mediaDevices.getUserMedia({
        video: {},
      })
    ).getVideoTracks()[0];

    // Start producer
    const cameraProducer = await transport.produce({
      track: camera,
    });
  }
}
