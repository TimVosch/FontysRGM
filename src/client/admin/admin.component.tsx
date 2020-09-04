import React, { Component } from "react";
import { MessageHandler } from "../message.handler";
import {
  ClientElbowshake,
  ClientType,
} from "../../common/messages/elbowshake.client";
import { listen } from "../../common/decorators/listen.decorator";
import { ServerViewers } from "../../common/messages/viewers.server";
import './admin.component.css'

interface AdminProps {
  socket: SocketIOClient.Socket;
}

interface AdminState {
  viewers: number[];
}

const participants = 100;

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

  participantGrid() {
    let grid = [];

    for (let i = 1; i <= participants; i++) {
      if (this.state.viewers.includes(i)) {
        grid.push(<div className="member member-online">{i}</div>)
      } else {
        grid.push(<div className="member member-offline">{i}</div>)
      }

    }
    return grid;
  }

  render() {
    return (
      <div className="admin-container">
        <h1 className="title">Admin dashboard</h1>
        <h2>Connected clients:</h2>
        <div className="grid-overview">
          {this.participantGrid()}
        </div>
        {/* <ul>
          {this.state.viewers.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul> */}
      </div>
    );
  }
}
