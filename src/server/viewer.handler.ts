import * as mediasoup from "mediasoup";
import { MessageHandler } from "./message.handler";
import { listen } from "../common/decorators/listen.decorator";
import { ClientSendTransport } from "../common/messages/rtc/sendTransport.client";
import { ServerSendTransport } from "../common/messages/rtc/sendTransport.server";
import { RTCServer } from "./rtcserver";
import { ClientTransportStats } from "../common/messages/rtc/transportStats.client";
import { ServerTransportStats } from "../common/messages/rtc/transportStats.server";
import { ClientRTPCapabilities } from "../common/messages/rtc/rtpCapabilities.client";
import { ServerRTPCapabilities } from "../common/messages/rtc/rtpCapabilities.server";
import { ClientRecvTransport } from "../common/messages/rtc/recvTransport.client";
import { ServerRecvTransport } from "../common/messages/rtc/recvTransport.server";
import { ClientConnectTransport } from "../common/messages/rtc/connectTransport.client";

export class ViewerHandler {
  private readonly handler: MessageHandler;
  private transports: Record<string, mediasoup.types.WebRtcTransport> = {};

  constructor(public readonly client: SocketIO.Socket) {
    this.handler = new MessageHandler(this, client);
  }

  @listen(ClientRTPCapabilities)
  async onRTPCapabilities() {
    const msg = new ServerRTPCapabilities();
    msg.rtpCapabilties = RTCServer.getRTPCapabilities();
    this.handler.send(msg);
  }

  @listen(ClientSendTransport)
  async onSendTransport(message: ClientSendTransport) {
    const msg = new ServerSendTransport();

    const transport = await RTCServer.createRTCTransport();

    msg.id = transport.id;
    msg.iceCandidates = transport.iceCandidates;
    msg.iceParameters = transport.iceParameters;
    msg.dtlsParameters = transport.dtlsParameters;
    msg.sctpParameters = transport.sctpParameters;

    this.transports[transport.id] = transport;

    this.handler.send(msg);
  }

  @listen(ClientRecvTransport)
  async onRecvTransport(message: ClientRecvTransport) {
    const msg = new ServerRecvTransport();

    const transport = await RTCServer.createRTCTransport();

    msg.id = transport.id;
    msg.iceCandidates = transport.iceCandidates;
    msg.iceParameters = transport.iceParameters;
    msg.dtlsParameters = transport.dtlsParameters;
    msg.sctpParameters = transport.sctpParameters;

    this.transports[transport.id] = transport;

    this.handler.send(msg);
  }

  @listen(ClientTransportStats)
  async onTransportStats(message: ClientTransportStats) {
    console.log(`[ViewerHandler] Requesting stats`);

    const transport = this.transports[message.id] || null;
    if (transport === null) return;

    const stats = await transport.getStats();

    const msg = new ServerTransportStats();
    msg.stats = stats;
    this.handler.send(msg);
  }

  @listen(ClientConnectTransport)
  async onConnectTransport(message: ClientConnectTransport) {
    const transport = this.transports[message.id] || null;
    if (transport === null) return;

    await transport.connect({
      dtlsParameters: message.dtlsParameters,
    });
    console.log(`[ViewerHandler] Transport to client connected`);
  }
}
