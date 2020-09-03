import React from "react";
import * as ms from "mediasoup-client";
import { RTCManager } from "../rtc/rtc.manager";

interface VideoConsumerProps {
  rtcManager: RTCManager;
  producerId: string;
}

interface VideoConsumerState {
  consumer: ms.types.Consumer;
}

export class VideoConsumer extends React.Component<
  VideoConsumerProps,
  VideoConsumerState
> {
  constructor(props: Readonly<VideoConsumerProps>) {
    super(props);

    this.state = {
      consumer: null,
    };
  }

  async onStart() {
    console.log("Starting consuming");
    if (this.props.producerId === null) {
      console.warn("ProducerID is null, will not consume!");
    } else {
      const consumer = await this.props.rtcManager.createConsumer(
        this.props.producerId
      );

      const el = document.getElementById("ConsumerVideoEl") as HTMLVideoElement;
      const stream = new MediaStream();
      stream.addTrack(consumer.track.clone());
      el.srcObject = stream;
    }
  }

  render() {
    return (
      <div>
        <h1>Consumer</h1>
        <button onClick={this.onStart.bind(this)}>Start consuming</button>
        <video
          autoPlay
          playsInline
          muted
          controls={false}
          id="ConsumerVideoEl"
          style={{ width: "400px", height: "300px" }}
        ></video>
      </div>
    );
  }
}
