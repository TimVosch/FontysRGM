import { MessageHandler } from "./message.handler";
import { listen } from "../common/decorators/listen.decorator";
import { ClientTest } from "../common/messages/test.client";
import { ServerTest } from "../common/messages/test.server";
import { RequestRTPCapabilities } from "../common/messages/rtc/rtpCapabilities.request";
import { RTCServer } from "./rtc/worker.manager";
import { ResponseRTPCapabilities } from "../common/messages/rtc/rtpCapabilities.response";
import { RequestCreateTransport } from "../common/messages/rtc/createTransport.request";
import { ResponseCreateTransport } from "../common/messages/rtc/createTransport.response";
import { RequestConnectTransport } from "../common/messages/rtc/connectTransport.request";
import { ResponseConnectTransport } from "../common/messages/rtc/connectTransport.response";
import { RequestNewProducer } from "../common/messages/rtc/newProducer.request";
import { ResponseNewProducer } from "../common/messages/rtc/newProducer.response";
import { RequestNewConsumer } from "../common/messages/rtc/newConsumer.request";
import { ResponseNewConsumer } from "../common/messages/rtc/newConsumer.response";
import { RequestTransportStats } from "../common/messages/rtc/transportStats.request";
import { ResponseTransportStats } from "../common/messages/rtc/transportStats.response";

export class ViewerHandler {
  private readonly handler: MessageHandler;

  constructor(public readonly client: SocketIO.Socket) {
    this.handler = new MessageHandler(this, client);
  }

  @listen(RequestRTPCapabilities)
  onRTPCapabilitiesRequest() {
    const msg = new ResponseRTPCapabilities();
    msg.rtpCapabilities = RTCServer.getRoom().getRTPCapabilities();
    return msg;
  }

  @listen(RequestCreateTransport)
  async onRequestCreateTransport() {
    const transport = await RTCServer.getRoom().createTransport();

    // Build response
    const msg = new ResponseCreateTransport();
    msg.id = transport.id;
    msg.iceCandidates = transport.iceCandidates;
    msg.iceParameters = transport.iceParameters;
    msg.dtlsParameters = transport.dtlsParameters;
    msg.sctpParameters = transport.sctpParameters;

    return msg;
  }

  @listen(RequestConnectTransport)
  async onRequestConnectTransport(message: RequestConnectTransport) {
    try {
      await RTCServer.getRoom().connectTransport(
        message.id,
        message.dtlsParameters
      );
      return new ResponseConnectTransport();
    } catch (e) {
      console.error(e);
      return;
    }
  }

  @listen(RequestNewProducer)
  async onRequestNewProducer({ id, kind, rtpParameters }: RequestNewProducer) {
    const producer = await RTCServer.getRoom().newProducer(
      id,
      kind as any,
      rtpParameters
    );

    const msg = new ResponseNewProducer();
    msg.id = producer.id;
    return msg;
  }

  @listen(RequestNewConsumer)
  async onRequestNewConsumer({
    id,
    producerId,
    rtpCapabilities,
  }: RequestNewConsumer) {
    const consumer = await RTCServer.getRoom().newConsumer(
      id,
      producerId,
      rtpCapabilities
    );

    // Respond
    const msg = new ResponseNewConsumer();
    msg.id = consumer.id;
    msg.rtpParameters = consumer.rtpParameters;
    return msg;
  }

  @listen(RequestTransportStats)
  async onRequestTransportStats({ id }: RequestTransportStats) {
    const stats = await RTCServer.getRoom().getTransport(id).getStats();

    const msg = new ResponseTransportStats();
    msg.stats = stats;
    return msg;
  }

  @listen(ClientTest)
  onTest() {
    const msg = new ServerTest();
    return msg;
  }
}
