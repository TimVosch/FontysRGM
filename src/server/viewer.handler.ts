import { MessageHandler } from "./message.handler";
import { listen } from "../common/decorators/listen.decorator";
import { ClientTest } from "../common/messages/test.client";
import { ServerTest } from "../common/messages/test.server";

export class ViewerHandler {
  private readonly handler: MessageHandler;

  constructor(public readonly client: SocketIO.Socket) {
    this.handler = new MessageHandler(this, client);
  }

  @listen(ClientTest)
  onTest() {
    const msg = new ServerTest();
    return msg;
  }
}
