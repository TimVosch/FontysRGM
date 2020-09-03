import React, { Component } from "react";
import { MessageHandler } from "../message.handler";
import {
  ClientElbowshake,
  ClientType,
} from "../../common/messages/elbowshake.client";
import { listen } from "../../common/decorators/listen.decorator";
import { ServerViewers } from "../../common/messages/viewers.server";

interface AdminProps {
  socket: SocketIOClient.Socket;
}

interface AdminState {
  viewers: number[];
}

export class Admin extends Component<AdminProps, AdminState> {
  handler: MessageHandler;

  constructor(props: Readonly<AdminProps>) {
    super(props);

    this.handler = new MessageHandler(this, props.socket);
    this.state = { viewers: [] };
  }

  componentDidMount() {
    this.handler.open();

    const elbowshakeMSG = new ClientElbowshake();
    elbowshakeMSG.type = ClientType.ADMIN;
    this.handler.send(elbowshakeMSG);
  }

  componentWillUnmount() {
    this.handler.close();
  }

  @listen(ServerViewers)
  onViewers({ viewers }: ServerViewers) {
    this.setState({ viewers });
  }

  render() {
    return (
      <>
        <h1>Admin!</h1>
        <h2>Clients:</h2>
        <ul>
          {this.state.viewers.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </>
    );
  }
}
