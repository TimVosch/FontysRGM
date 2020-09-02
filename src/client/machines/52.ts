import { Machine } from "./base";
import { listen } from "../../common/decorators/listen.decorator";
import { PeerMakeAlert } from "../../common/messages/makeAlert.peer";
import { PeerCloseAlert } from "../../common/messages/closeAlert.peer";
import { PeerOpenTerminal } from "../../common/messages/openTerminal.peer";

export default class RGM52 extends Machine {
  readonly id = 52;

  messageBox: HTMLElement = document.getElementById("message");
  popup: HTMLElement = document.getElementById("popup");
  console: HTMLElement = document.getElementById("console");

  constructor(socket: SocketIOClient.Socket) {
    super(socket);
    document.getElementById("RGM51").classList.remove("hide");
  }

  onStart(): void {
    this.finish();
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

  @listen(PeerOpenTerminal)
  openTerminal() {
    this.popup.classList.add("active");
  }
}
