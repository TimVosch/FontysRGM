import React from "react";
import { Machine, MachineProps } from "../machine.base";
import { PeerOpenTerminal } from "../../../common/messages/openTerminal.peer";
import { PeerMakeAlert } from "../../../common/messages/makeAlert.peer";
import "./rgm51.component.css";

interface RGMState {
  cursor: {
    x: string;
    y: string;
  };
  popup: {
    active: boolean;
  };
  console: string[];
}

export class RGM51Page extends Machine<MachineProps, RGMState> {
  readonly id = 51;
  socket: SocketIOClient.Socket;

  constructor(props: Readonly<MachineProps>) {
    super(props);

    this.state = {
      cursor: {
        x: "-100px",
        y: "500px",
      },
      popup: {
        active: false,
      },
      console: [],
    };
    (window as any).start = () => this.onStart({ top: 500 });
  }

  onStart(data: any): void {
    this.resetMachine();
    // Move cursor to corresponding location
    if (data.top === undefined || data.top === null) {
      let top = data.top;
      if (typeof data.top === "string") {
        try {
          top = parseInt(data.top);
        } catch (e) {
          top = window.innerHeight / 2;
        }
      }
      this.moveCursor(-100, top);
    }

    this.openTerminal();

    // setTimeout(() => {
    //   this.finish();
    // }, 4000);
  }

  /**
   *
   * @param x
   * @param y
   */
  moveCursor(x: number, y: number) {
    this.setState({
      cursor: {
        x: `${x}px`,
        y: `${y}px`,
      },
    });
  }

  /**
   *
   * @param txt
   */
  writeConsoleLine(txt: string, noDelay: boolean = false) {
    return new Promise((resolve) => {
      const { console } = this.state;
      const ix = console.length;

      const writeCharacter = (len: number) => {
        //
        console[ix] = txt.substr(0, len);

        // Update
        this.setState({
          console,
        });

        // next char
        if (len < txt.length) {
          setTimeout(() => {
            writeCharacter(len + 1);
          }, 100);
        } else {
          resolve();
        }
      };

      if (noDelay) {
        console[ix] = txt;
        this.setState({
          console,
        });
        resolve();
      } else {
        writeCharacter(0);
      }
    });
  }

  async clearConsole() {
    await this.writeConsoleLine("$ clear");
    await this.wait(500);
    this.setState({
      console: [],
    });
  }

  /**
   *
   */
  async openTerminal() {
    let msg;
    this.moveCursor(1200 + 75, 350 + 75);

    // activate terminal
    await this.wait(2000);
    this.setState({
      popup: {
        active: true,
      },
    });

    await this.wait(300);
    await this.writeConsoleLine("$ ping screen52");

    this.writeConsoleLine("Connecting...", true);
    await this.wait(1300);
    this.writeConsoleLine("screen52 is alive", true);

    await this.wait(900);
    await this.clearConsole();
    await this.writeConsoleLine("$ ./leet-hackz-intruder.sh screen52");
    await this.writeConsoleLine("Piping l33t hacks to screen 52", true);

    await this.wait(500);

    msg = new PeerMakeAlert();
    msg.message = "Security Breach Detected!";
    this.sendToPeer(52, msg);

    await this.wait(2500);
    await this.writeConsoleLine("Initiating reverse shell", true);
    await this.wait(500);

    msg = new PeerOpenTerminal();
    this.sendToPeer(52, msg);

    await this.wait(500);
    await this.writeConsoleLine("Reverse shell success, bye!", true);

    await this.wait(2000);
    this.resetMachine();
  }

  wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  resetMachine() {
    this.setState({
      cursor: {
        x: "-100px",
        y: "500px",
      },
      popup: {
        active: false,
      },
      console: [],
    });
  }

  render() {
    const { cursor, popup, console } = this.state;
    const popupClasses = ["popup"];
    popup.active && popupClasses.push("active");

    const consoleText = console.map((line, ix) => <p key={ix}>{line}</p>);

    return (
      <div id="rgm51">
        <img
          id="cursor"
          src="https://icon-library.com/images/cursor-icon/cursor-icon-3.jpg"
          width="50px"
          height="50px"
          style={{ top: cursor.y, left: cursor.x, zIndex: 12000 }}
        />
        <img
          id="terminal-icon"
          src="https://icon-library.com/images/hacking-icon/hacking-icon-1.jpg"
          width="150px"
          height="150px"
          style={{ top: "350px", left: "1200px" }}
        />
        {/* Terminal */}
        <div id="popup" className={popupClasses.join(" ")}>
          <div className="popup-toolbar">l33t h4ck3r Terminal</div>
          <div className="popup-container">
            <div id="console">{consoleText}</div>
          </div>
        </div>
      </div>
    );
  }
}
