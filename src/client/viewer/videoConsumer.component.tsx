import React from "react";
import { MessageHandler } from "../message.handler";

interface VideoConsumerProps {
  socket: SocketIOClient.Socket;
}

export class VideoConsumer extends React.Component<VideoConsumerProps> {
  private handler: MessageHandler;

  constructor(props: Readonly<VideoConsumerProps>) {
    super(props);

    this.handler = new MessageHandler(this, props.socket);
  }

  render() {
    return (
      <div>
        <h1>Consumer</h1>
      </div>
    )
  }
}