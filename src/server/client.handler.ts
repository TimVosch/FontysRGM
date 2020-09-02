import { MessageHandler } from "../common/message.handler";
import { firebase } from "./firebase";
import { ServerStartSequence } from "../common/messages/startSequence.server";

export class ClientHandler extends MessageHandler {
  protected socket: SocketIO.Socket;
  private readonly id: number;

  constructor(client: SocketIO.Socket, id: number) {
    super();
    this.socket = client;
    this.id = id;

    firebase().on("trigger", (triggeredID) => {
      if (triggeredID === id) {
        this.startClientSequence();
      }
    });
  }

  /**
   * Triggers the client sequence
   */
  startClientSequence() {
    this.send(new ServerStartSequence());
  }
}
