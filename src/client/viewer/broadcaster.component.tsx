import React from "react";
import * as ms from "mediasoup-client";
import { RTCManager } from "../rtc/rtc.manager";

interface BroadcasterProps {
  rtcManager: RTCManager;
  onStart?: (id: string) => any;
}

export class Broadcaster extends React.Component<BroadcasterProps> {
  producer: ms.types.Producer;

  componentWillUnmount() {
    if (this.producer) this.producer.close();
  }

  async startStream() {
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
        {/* <button onClick={this.startStream.bind(this)}>
          Start broadcasting
        </button> */}
        <button onClick={this.onStatsClick.bind(this)}>stats</button>
      </div>
    );
  }
}
