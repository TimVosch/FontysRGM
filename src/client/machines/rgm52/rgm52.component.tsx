import React from "react";
import "./rgm52.component.css";
import { Machine } from "../machine.base";
import { PeerMakeAlert } from "../../../common/messages/makeAlert.peer";
import { PeerCloseAlert } from "../../../common/messages/closeAlert.peer";
import { PeerOpenTerminal } from "../../../common/messages/openTerminal.peer";
import { listen } from "../../../common/decorators/listen.decorator";

export class RGM52Page extends Machine {
  readonly id = 52;

  messageBox: HTMLElement = document.getElementById("message");
  popup: HTMLElement = document.getElementById("popup");
  console: HTMLElement = document.getElementById("console");

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

  render() {
    return (
      <div id="rgm52">
        <div id="popup" className="popup">
          <div className="popup-toolbar">Terminal - Hacked By Tim</div>
          <div className="popup-container">
            <div id="console">
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
              <p>jifejiowfjioewaijo</p>
            </div>
          </div>
        </div>
        <div id="message" className="msg"></div>
      </div>
    );
  }
}
