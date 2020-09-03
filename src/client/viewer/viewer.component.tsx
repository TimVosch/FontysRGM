import React, { Component } from "react";
import { MessageHandler } from "../message.handler";
import { listen } from "../../common/decorators/listen.decorator";

interface ViewerProps {
  socket: SocketIOClient.Socket;
}

export class Viewer extends Component<ViewerProps> {
  handler: MessageHandler;

  constructor(props: Readonly<ViewerProps>) {
    super(props);

    this.handler = new MessageHandler(this, props.socket);
  }

  componentDidMount() {
    this.handler.open();
  }

  componentWillUnmount() {
    this.handler.close();
  }

  render() {
    return <h1>Viewer!</h1>;
  }
}
