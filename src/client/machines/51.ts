import { Machine } from "./base";
import { PeerMakeAlert } from "../../common/messages/makeAlert.peer";

export default class RGM51 extends Machine {
  readonly id = 51;

  onStart(): void {
    const msg = new PeerMakeAlert();
    msg.message = "Hello world!";
    this.sendToPeer(52, msg);
  }
}
