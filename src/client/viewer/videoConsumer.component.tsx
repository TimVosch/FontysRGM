import React from "react";
import { RTCManager } from "../rtc/rtc.manager";

interface VideoConsumerProps {
  rtcManager: RTCManager;
}

export class VideoConsumer extends React.Component<VideoConsumerProps> {
  rtcManager: RTCManager;

  constructor(props: Readonly<VideoConsumerProps>) {
    super(props);
    this.rtcManager = props.rtcManager;
  }

  render() {
    return (
      <div>
        <h1>Consumer</h1>
      </div>
    )
  }
}