import React from "react";

import { listen } from "../../common/decorators/listen.decorator";
import { ServerStartSequence } from "../../common/messages/startSequence.server";
import { PeerMessage } from "../../common/messages/message.peer";
import { ClientFinished } from "../../common/messages/finished.client";
import { MessageHandler } from "../message.handler";
import { ServerElbowshake } from "../../common/messages/elbowshake.server";
import { ClientElbowshake } from "../../common/messages/elbowshake.client";

interface MachineProps {
  socket: SocketIOClient.Socket;
}

export abstract class Machine<
  P extends MachineProps = MachineProps,
  S = {},
  SS = {}
> extends React.Component<MachineProps, S, SS> {
  abstract readonly id: number;
  protected handler: MessageHandler;

  constructor(props: Readonly<P>) {
    super(props);
    this.handler = new MessageHandler(this, props.socket);
  }

  componentDidMount() {
    this.handler.open();
    console.log("Sending elbowshake");

    // Create elbowshake
    const elbowshake = new ClientElbowshake();
    elbowshake.id = this.id;

    this.handler.send(elbowshake);
  }

  componentWillUnmount() {
    this.handler.close();
  }

  @listen(ServerElbowshake)
  onElbowshake(message: ServerElbowshake) {
    if (message.error) {
      console.log("Elbowshake rejected by server: " + message.message);
      return;
    }
    console.log("Elbowshake accepted by server");
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
    this.handler.onMessage(message.event, message.data);
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
    this.handler.send(peerMessage);
  }

  /**
   * Finished the animation and triggers the given or next RGMID
   */
  protected finish(id?: number) {
    const next = id || this.id + 1;
    console.log(`[MachineBase] Finished, triggering ${next}`);

    const msg = new ClientFinished();
    msg.nextID = next;
    this.handler.send(msg);
  }

  /**
   * Triggered when the animation should start
   */
  abstract onStart(): void;
}
