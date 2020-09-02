import { Machine } from "./base";
import { listen } from "../../common/decorators/listen.decorator";
import { PeerMakeAlert } from "../../common/messages/makeAlert.peer";

export default class RGM52 extends Machine {
  readonly id = 52;

  onStart(): void {
    alert("52 was triggered!");
  }

  @listen(PeerMakeAlert)
  onAlert(message: PeerMakeAlert) {
    alert(message.message);
  }
}
