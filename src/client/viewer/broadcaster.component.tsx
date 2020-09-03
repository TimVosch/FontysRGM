import React from "react";
import { RTCManager } from "../rtc/rtc.manager";

interface BroadcasterProps {
  rtcManager: RTCManager;
}

export class Broadcaster extends React.Component<BroadcasterProps> {
  rtcManager: RTCManager;

  constructor(props: Readonly<BroadcasterProps>) {
    super(props);

    this.rtcManager = props.rtcManager;
  }

  render() {
    return (
      <div>
        <h1>Broadcaster</h1>
        <button onClick={this.rtcManager.getStats.bind(this.rtcManager)}>getstats</button>
      </div>
    )
  }
}