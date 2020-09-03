import SocketIO from "socket.io";
import { Server } from "http";
import { ClientElbowshake } from "../common/messages/elbowshake.client";
import { MachineHandler } from "./machine.handler";
import { MessageParser } from "../common/message.parser";

export class SocketHandler {
  private readonly server: SocketIO.Server;

  constructor(http: Server) {
    this.server = SocketIO(http, {
      handlePreflightRequest: (req: any, res: any) => {
        const headers = {
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
          "Access-Control-Allow-Credentials": true,
        };
        res.writeHead(200, headers);
        res.end();
      },
    });

    MessageParser.register(ClientElbowshake);
    this.server.on("connection", this.onConnection.bind(this));
  }

  /**
   * Fired when a new WebSocket client connects
   * @param client
   */
  onConnection(client: SocketIO.Socket) {
    console.log(`[SocketHandler] New connection: ${client.id.substr(0, 4)}`);

    // Listen to client messages
    client.once("disconnect", () => {
      console.log(`[SocketHandler] Disconnected: ${client.id.substr(0, 4)}`);
    });
    client.once(
      ClientElbowshake.name,
      this.onClientElbowshake.bind(this, client)
    );
  }

  /**
   * Fired when the client initiates an Elbowshake
   * @param message
   * @param client
   */
  async onClientElbowshake(client: SocketIO.Socket, data: any) {
    const message: ClientElbowshake = await MessageParser.parse(
      ClientElbowshake.name,
      data
    );

    // Invalid message
    if (message === null) {
      client.disconnect();
      return;
    }

    //
    if (message.viewer) {
    } else {
      new MachineHandler(client);
    }
  }
}
