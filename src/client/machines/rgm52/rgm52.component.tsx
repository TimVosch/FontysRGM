import React from "react";
import "./rgm52.component.css";
import { Machine } from "../machine.base";
import { PeerMakeAlert } from "../../../common/messages/makeAlert.peer";
import { PeerCloseAlert } from "../../../common/messages/closeAlert.peer";
import { PeerOpenTerminal } from "../../../common/messages/openTerminal.peer";
import { listen } from "../../../common/decorators/listen.decorator";

interface RGM52PageState {
  messagebox: {
    active: boolean;
    message: string;
  };
  popup: {
    active: boolean;
  };
  console: string[];
}

export class RGM52Page extends Machine<undefined, RGM52PageState> {
  readonly id = 52;

  constructor(props) {
    super(props);

    this.state = {
      messagebox: {
        active: false,
        message: "",
      },
      popup: {
        active: false,
      },
      console: [],
    };
  }

  onStart(): void {
    this.finish();
  }

  @listen(PeerMakeAlert)
  onAlert({ message }: PeerMakeAlert) {
    const { messagebox } = this.state;

    messagebox.active = true;
    messagebox.message = message;

    this.setState({
      messagebox,
    });
  }

  @listen(PeerCloseAlert)
  onCloseAlert() {
    const { messagebox } = this.state;

    messagebox.active = false;

    this.setState({
      messagebox,
    });
  }

  @listen(PeerOpenTerminal)
  openTerminal() {
    const { popup } = this.state;

    popup.active = true;

    this.setState({
      popup,
    });

    let texts = [
      "Hello Toon",
      "Your pc has been hacked...",
      "by....",
      "screen 51....",
      "Let's jump to the next one!",
      "5",
      "4",
      "3",
      "2",
      "1",
      "Here we go!",
      "YEET",
    ];
    setInterval(() => {
      if (texts.length > 0) {
        this.setState({ console: [...this.state.console, texts[0]] });
        texts.splice(0, 1);
      }
    }, 1000);
  }

  render() {
    const { messagebox, popup } = this.state;
    const msgboxClasses = ["msg"];
    const popupClasses = ["popup"];

    messagebox.active && msgboxClasses.push("active");
    popup.active && popupClasses.push("active");

    return (
      <div id="rgm52">
        <div id="popup" className={popupClasses.join(" ")}>
          <div className="popup-toolbar">Terminal - Hacked By Tim</div>
          <div className="popup-container">
            <div id="console">
              {this.state.console.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          </div>
        </div>
        <div id="message" className={msgboxClasses.join(" ")}>
          {messagebox.message}
        </div>
      </div>
    );
  }
}
