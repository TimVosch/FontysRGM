import { firebase } from "./firebase";
import { ServerStartSequence } from "../common/messages/startSequence.server";
import { listen } from "../common/decorators/listen.decorator";
import { PeerMessage } from "../common/messages/message.peer";
import { ClientFinished } from "../common/messages/finished.client";
import { MessageHandler } from "./message.handler";
import { ClientRegisterRGM } from "../common/messages/registerRGM.client";
import { ServerRegisterRGM } from "../common/messages/registerRGM.server";

export class MachineHandler {
  private static clients: Record<number, MachineHandler> = {};
  private readonly client: SocketIO.Socket;
  private readonly handler: MessageHandler;
  private id: number;
  private firebaseCallbackValue: any;

  constructor(client: SocketIO.Socket) {
    this.client = client;
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

  @listen(ClientRegisterRGM)
  onRegister(message: ClientRegisterRGM) {
    // Reject client if this RGM ID is already in use
    if (!!MachineHandler.clients[message.id]) {
      const deniedMSG = new ServerRegisterRGM();
      deniedMSG.error = true;
      deniedMSG.message = "Client with that RGM ID already exists";

      // Send rejection
      this.handler.send(deniedMSG);
      this.handler.close();

      console.warn(
        `[SocketHandler] Rejected client with duplicate RGM ID ${message.id}`
      );

      return;
    }

    // Create the client handler
    MachineHandler.clients[message.id] = this;
    this.id = message.id;

    // Free RGM ID when disconnected
    this.client.once("disconnect", () => {
      this.onDisconnect();
      delete MachineHandler.clients[message.id];
      console.log(`[SocketHandler] Freed RGM ID ${message.id}`);
    });

    // Let the client know it has been accepted
    const acceptedMSG = new ServerRegisterRGM();
    this.handler.send(acceptedMSG);

    console.log(`[SocketHandler] Accepted client with RGM ID ${message.id}`);
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
    this.handler.send(msg);
  }

  onDisconnect() {
    console.log(`[ClientHandler] disconnected`);
    firebase().stop(this.firebaseCallbackValue);
  }

  static getClient(id: number): MachineHandler {
    return MachineHandler.clients[id] || null;
  }
}
