import { MessageHandler } from "../../common/message.handler";
import { listen } from "../../common/decorators/listen.decorator";
import { ServerStartSequence } from "../../common/messages/startSequence.server";
import { PeerMessage } from "../../common/messages/message.peer";
import { ClientFinished } from "../../common/messages/finished.client";

export abstract class Machine extends MessageHandler<SocketIOClient.Socket> {
  abstract readonly id: number;

  bindOnMessage(): void {
    // Bind all listeners to onMessage
    Object.keys(this.listeners).forEach((event) => {
      console.log(`Bound for ${event}`);
      this.socket.on(event, this.onMessage.bind(this, event));
    });
  }

  /**
   * Triggers the abstract onStart function
   * which subclass must implement
   */
  @listen(ServerStartSequence)
  onStartSequence() {
    console.log(`[MachineBase] Triggered`);
    this.onStart();
  }

  /**
   * Treat peer messages as regular messages
   * @param message
   */
  @listen(PeerMessage)
  onPeerMessage(message: PeerMessage) {
    this.onMessage(message.event, message.data);
  }

  /**
   * Send a message to another machine
   * @param id The machine ID
   * @param message the message
   */
  sendToPeer(id: number, message: any) {
    const event = Reflect.getMetadata("event", message.constructor);
    if (!event) {
      console.error(
        "[MachineBase] Cannot send message to server. Did you forget @registerMessage?"
      );
      return;
    }

    const peerMessage = new PeerMessage();
    peerMessage.target = id;
    peerMessage.event = event;
    peerMessage.data = message;
    this.send(peerMessage);
  }

  /**
   * Finished the animation and triggers the given or next RGMID
   */
  protected finish(id?: number) {
    const next = id || this.id + 1;
    console.log(`[MachineBase] Finished, triggering ${next}`);

    const msg = new ClientFinished();
    msg.nextID = next;
    this.send(msg);
  }

  /**
   * Triggered when the animation should start
   */
  abstract onStart(): void;
}
