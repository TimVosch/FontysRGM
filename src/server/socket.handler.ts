import SocketIO from "socket.io";
import { Server } from "http";
import { MessageParser } from "../common/message.parser";
import { ClientElbowshake } from "../common/messages/elbowshake.client";
import { ClientHandler } from "./client.handler";
import { ServerElbowshake } from "../common/messages/elbowshake.server";
import { MessageHandler } from "../common/message.handler";
import { listen } from "../common/decorators/listen.decorator";

export class SocketHandler extends MessageHandler {
  private readonly server: SocketIO.Server;
  private readonly clients: Record<number, ClientHandler> = {};

  constructor(http: Server) {
    super();
    this.server = SocketIO(http);

    this.server.on("connection", this.onConnection.bind(this));
  }

  onConnection(client: SocketIO.Socket) {
    console.log("[SocketHandler] New connection");

    // Listen to client messages
    client.use(([event, data, _], next) => {
      this.onMessage(event, data, client);
      next();
    });
  }

  @listen(ClientElbowshake)
  onClientElbowshake(message: ClientElbowshake, client: SocketIO.Socket) {
    // Reject client if this RGM ID is already in use
    if (!!this.clients[message.id]) {
      const elbowDenied = new ServerElbowshake();
      elbowDenied.error = true;
      elbowDenied.message = "Client with that RGM ID already exists";

      // Send rejection
      this.send(elbowDenied, client);

      client.disconnect();

      console.warn(
        `[SocketHandler] Rejected client with duplicate RGM ID ${message.id}`
      );

      return;
    }

    // Create the client handler
    const clientHandler = new ClientHandler(client);
    this.clients[message.id] = clientHandler;

    // Free RGM ID when disconnected
    client.once("disconnect", () => {
      delete this.clients[message.id];
      console.log(`[SocketHandler] Freed RGM ID ${message.id}`);
    });

    // Let the client know it has been accepted
    const elbowAccepted = new ServerElbowshake();
    this.send(elbowAccepted, client);

    console.log(`[SocketHandler] Accepted client with RGM ID ${message.id}`);
  }
}
