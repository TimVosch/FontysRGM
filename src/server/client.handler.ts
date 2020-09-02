import { MessageHandler } from "../common/message.handler";

export class ClientHandler extends MessageHandler {
  protected socket: SocketIO.Socket;

  constructor(client: SocketIO.Socket) {
    super();
    this.socket = client;
  }
}
