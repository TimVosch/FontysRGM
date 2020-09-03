import React from "react";
import { RTCManager } from "../rtc/rtc.manager";

interface BroadcasterProps {
  rtcManager: RTCManager;
  onStart?: (id: string) => any;
}

export class Broadcaster extends React.Component<BroadcasterProps> {
  async onStart() {
    console.log("Starting camera stream");
    const producer = await this.props.rtcManager.streamCamera();

    if (this.props.onStart) this.props.onStart(producer.id);
  }

  async onStatsClick() {
    const stats = await this.props.rtcManager.getStats();
    console.log(stats);
  }

  render() {
    return (
      <div>
        <h1>Broadcaster</h1>
        <button onClick={this.onStart.bind(this)}>Start broadcasting</button>
        <button onClick={this.onStatsClick.bind(this)}>stats</button>
      </div>
    );
  }
}
