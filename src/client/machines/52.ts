import { Machine } from "./base";
import { listen } from "../../common/decorators/listen.decorator";
import { PeerMakeAlert } from "../../common/messages/makeAlert.peer";
import { PeerCloseAlert } from "../../common/messages/closeAlert.peer";

export default class RGM52 extends Machine {
  readonly id = 52;

  messageBox: HTMLElement = document.getElementById("message");

  onStart(): void {
    alert("52 was triggered!");
  }

  @listen(PeerMakeAlert)
  onAlert({ message }: PeerMakeAlert) {
    this.messageBox.classList.add("active");
    this.messageBox.innerHTML = message;
  }

  @listen(PeerCloseAlert)
  onCloseAlert() {
    this.messageBox.classList.remove("active");
  }
}
