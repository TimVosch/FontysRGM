import { MessageHandler } from "../../common/message.handler";
import { listen } from "../../common/decorators/listen.decorator";
import { ServerStartSequence } from "../../common/messages/startSequence.server";

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
   * Finished the animation and triggers the given or next RGMID
   */
  protected finish(id?: number) {
    const next = id || this.id + 1;
    console.log(`[MachineBase] Finished, triggering ${next}`);
  }

  /**
   * Triggered when the animation should start
   */
  abstract onStart(): void;
}
