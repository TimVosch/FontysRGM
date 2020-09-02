import React from "react";
import { Machine } from "../machine.base";
import { PeerOpenTerminal } from "../../../common/messages/openTerminal.peer";
import { PeerMakeAlert } from "../../../common/messages/makeAlert.peer";

export class RGM51Page extends Machine {
  socket: SocketIOClient.Socket;

  readonly id = 51;

  onStart(): void {
    setTimeout(() => {
      const msg = new PeerOpenTerminal();
      this.sendToPeer(52, msg);
    }, 1000);

    setTimeout(() => {
      const msg = new PeerMakeAlert();
      msg.message = "Security Breach Detected!";
      this.sendToPeer(52, msg);
    }, 2000);

    setTimeout(() => {
      this.finish();
    }, 4000);
  }

  render() {
    return <h1>Machine 51</h1>;
  }
}
