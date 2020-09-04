import { firebase } from "./firebase";
import { ServerStartSequence } from "../common/messages/startSequence.server";
import { listen } from "../common/decorators/listen.decorator";
import { PeerMessage } from "../common/messages/message.peer";
import { ClientFinished } from "../common/messages/finished.client";
import { MessageHandler } from "./message.handler";
import { ServerRegisterRGM } from "../common/messages/registerRGM.server";
import { SocketHandler } from "./socket.handler";

export class MachineHandler {
  public readonly handler: MessageHandler;
  private firebaseCallbackValue: any;

  constructor(public readonly client: SocketIO.Socket, private id: number) {
    this.handler = new MessageHandler(this, client);

    this.firebaseCallbackValue = firebase().onChange(
      this.onFirebaseUpdate.bind(this)
    );
  }

  onFirebaseUpdate(node) {
    if (node.nextScreen === this.id) {
      this.startClientSequence(node);
    }
  }

  @listen(PeerMessage)
  onClientPeerMessage(message: PeerMessage): void {
    const target = MachineHandler.getClient(message.target);
    if (target !== null) {
      target.handler.send(message);
    }
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
    msg.data = data;
    this.handler.send(msg);
  }

  onDisconnect() {
    console.log(`[ClientHandler] disconnected`);
    firebase().stop(this.firebaseCallbackValue);
  }

  static getClient(id: number): MachineHandler {
    return SocketHandler.machines[id] || null;
  }
}
