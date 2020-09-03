import React from "react";
import { RTCManager } from "../rtc/rtc.manager";

interface BroadcasterProps {
  rtcManager: RTCManager;
}

export class Broadcaster extends React.Component<BroadcasterProps> {
  onStart() {
    console.log("Starting camera stream");
    this.props.rtcManager.streamCamera();
  }

  render() {
    return (
      <div>
        <h1>Broadcaster</h1>
        <button onClick={this.onStart.bind(this)}>start</button>
      </div>
    );
  }
}
