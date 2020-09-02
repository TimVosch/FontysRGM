import { MessageHandler } from "../common/message.handler";
import { firebase } from "./firebase";
import { ServerStartSequence } from "../common/messages/startSequence.server";
import { listen } from "../common/decorators/listen.decorator";
import { PeerMessage } from "../common/messages/message.peer";
import { SocketHandler } from "./socket.handler";
import { ClientFinished } from "../common/messages/finished.client";

export class ClientHandler extends MessageHandler<SocketIO.Socket> {
  private readonly id: number;
  private readonly socketHandler: SocketHandler;
  private firebaseCallbackValue: any;

  constructor(
    client: SocketIO.Socket,
    socketHandler: SocketHandler,
    id: number
  ) {
    super(client);
    this.socket = client;
    this.socketHandler = socketHandler;
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

  @listen(PeerMessage)
  onClientPeerMessage(message: PeerMessage): void {
    const target = this.socketHandler.getClient(message.target);
    target.send(message);
  }

  @listen(ClientFinished)
  onClientFinish(message: ClientFinished) {
    console.log(
      `[ClientHandler] Client has finished, triggering ${message.nextID}`
    );
    firebase().set({ nextScreen: message.nextID });
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
