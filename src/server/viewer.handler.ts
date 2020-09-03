import { MessageHandler } from "./message.handler";
import { ClientRegisterRGM } from "../common/messages/registerRGM.client";
import { listen } from "../common/decorators/listen.decorator";

export class ViewerHandler {
  private readonly handler: MessageHandler;

  constructor(client: SocketIO.Socket) {
    this.handler = new MessageHandler(this, client);
  }

  @listen(ClientRegisterRGM)
  onRegister(message: ClientRegisterRGM) {
    console.log(`Viewer client is registering ${message.id}`);
  }
}
