import React from "react";
import * as ms from "mediasoup-client";
import { RTCManager } from "../rtc/rtc.manager";

interface VideoConsumerProps {
  rtcManager: RTCManager;
  producerId: string;
}

export class VideoConsumer extends React.Component<VideoConsumerProps> {
  private consumer: ms.types.Consumer;

  componentDidMount() {
    this.startConsuming();
  }

  componentWillUnmount() {
    if (this.consumer) this.consumer.close();
  }

  async startConsuming() {
    console.log("Starting consuming");
    if (this.props.producerId === null) {
      console.warn("ProducerID is null, will not consume!");
    } else {
      this.consumer = await this.props.rtcManager.createConsumer(
        this.props.producerId
      );

      // Set video el source to consumer
      const el = document.getElementById(
        "ConsumerVideoEl-" + this.props.producerId
      ) as HTMLVideoElement;
      const stream = new MediaStream();
      stream.addTrack(this.consumer.track.clone());
      el.srcObject = stream;
    }
  }

  render() {
    return (
      <video
        autoPlay
        playsInline
        muted
        controls={false}
        id={"ConsumerVideoEl-" + this.props.producerId}
        style={{ width: "100%", height: "100%" }}
      ></video>
    );
  }
}
