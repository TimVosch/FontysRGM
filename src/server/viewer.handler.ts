import * as mediasoup from "mediasoup";
import { MessageHandler } from "./message.handler";
import { ClientRegisterRGM } from "../common/messages/registerRGM.client";
import { listen } from "../common/decorators/listen.decorator";
import { ClientRequestTransport } from "../common/messages/rtc/requestTransport.client";
import { RTCServer } from "./rtcserver";
import { ServerRequestTransport } from "../common/messages/rtc/requestTransport.server";

export class ViewerHandler {
  private readonly handler: MessageHandler;
  private transport: mediasoup.types.WebRtcTransport;

  constructor(client: SocketIO.Socket) {
    this.handler = new MessageHandler(this, client);
  }

  @listen(ClientRegisterRGM)
  onRegister(message: ClientRegisterRGM) {
    console.log(`[ViewerHandler] Client connected ${message.id}`);
  }

  @listen(ClientRequestTransport)
  async onTransportRequest(message: ClientRequestTransport) {
    const msg = new ServerRequestTransport();
    msg.rtpCapabilties = RTCServer.getRTPCapabilities();

    this.transport = await RTCServer.createRTCTransport();

    this.transport.on("connect", () => {
      console.log(`[ViewerHandler] Client connected to transport`);
    });
    this.transport.on("produce", () => {
      console.log(`[ViewerHandler] Client produced on transport`);
    });

    msg.id = this.transport.id;
    msg.iceCandidates = this.transport.iceCandidates;
    msg.iceParameters = this.transport.iceParameters;
    msg.dtlsParameters = this.transport.dtlsParameters;
    msg.sctpParameters = this.transport.sctpParameters;

    this.handler.send(msg);
  }
}
