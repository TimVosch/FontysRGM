import { MessageHandler } from "./message.handler";

export class ViewerHandler {
  private readonly handler: MessageHandler;

  constructor(public readonly client: SocketIO.Socket) {
    this.handler = new MessageHandler(this, client);
  }
}
