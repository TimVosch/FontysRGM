import { Machine } from "./base";
import { PeerOpenTerminal } from "../../common/messages/openTerminal.peer";
import { PeerMakeAlert } from "../../common/messages/makeAlert.peer";
import { PeerCloseAlert } from "../../common/messages/closeAlert.peer";

export default class RGM51 extends Machine {
  readonly id = 51;

  onStart(): void {
    document.getElementById("RGM51").classList.remove("hide");
    document.querySelector("#RGM51 #popup").classList.add("active");

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
}
