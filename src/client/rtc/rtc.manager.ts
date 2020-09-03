import * as ms from "mediasoup-client";
import { MessageHandler } from "../message.handler";
import { RequestRTPCapabilities } from "../../common/messages/rtc/rtpCapabilities.request";
import { ResponseRTPCapabilities } from "../../common/messages/rtc/rtpCapabilities.response";

export class RTCManager {
  private readonly handler: MessageHandler;
  private device: ms.types.Device;

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
}
