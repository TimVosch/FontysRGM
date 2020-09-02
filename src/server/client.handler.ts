import { MessageHandler } from "../common/message.handler";
import { firebase } from "./firebase";
import { ServerStartSequence } from "../common/messages/startSequence.server";

export class ClientHandler extends MessageHandler<SocketIO.Socket> {
  private readonly id: number;
  private firebaseCallbackValue: any;

  constructor(client: SocketIO.Socket, id: number) {
    super(client);
    this.socket = client;
    this.id = id;

    this.firebaseCallbackValue = firebase().onChange(
      this.onFirebaseUpdate.bind(this)
    );
  }

  onFirebaseUpdate(node) {
    if (node.nextScreen === this.id) {
      this.startClientSequence(node);
    }
  }

  bindOnMessage(): void {
    this.socket.use(([event, data, _], next) => {
      this.onMessage(event, data);
      next();
    });
  }

  /**
   * Triggers the client sequence
   */
  startClientSequence(data: any) {
    console.log(`[ClientHandler] Triggering client for ${this.id}`);
    const msg = new ServerStartSequence();
    this.send(msg);
  }

  onDisconnect() {
    console.log(`[ClientHandler] disconnected`);
    firebase().stop(this.firebaseCallbackValue);
  }
}
