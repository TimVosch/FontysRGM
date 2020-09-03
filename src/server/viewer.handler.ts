import { MessageHandler } from "./message.handler";
import { listen } from "../common/decorators/listen.decorator";
import { ClientTest } from "../common/messages/test.client";
import { ServerTest } from "../common/messages/test.server";
import { RequestRTPCapabilities } from "../common/messages/rtc/rtpCapabilities.request";
import { RTCServer } from "./rtc/worker.manager";
import { ResponseRTPCapabilities } from "../common/messages/rtc/rtpCapabilities.response";

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

  @listen(ClientTest)
  onTest() {
    const msg = new ServerTest();
    return msg;
  }
}
