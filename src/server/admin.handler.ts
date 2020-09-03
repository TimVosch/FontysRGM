import { MessageHandler } from "./message.handler";
import { listen } from "../common/decorators/listen.decorator";

export class AdminHandler {
  public readonly handler: MessageHandler;

  constructor(public readonly client: SocketIO.Socket) {
    this.handler = new MessageHandler(this, client);
  }
}
