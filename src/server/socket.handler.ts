import SocketIO from "socket.io";
import { Server } from "http";
import { ClientElbowshake } from "../common/messages/elbowshake.client";
import { ClientHandler } from "./client.handler";
import { ServerElbowshake } from "../common/messages/elbowshake.server";
import { MessageParser } from "../common/message.parser";

export class SocketHandler {
  private readonly server: SocketIO.Server;
  private readonly clients: Record<number, ClientHandler> = {};

  constructor(http: Server) {
    this.server = SocketIO(http);

    MessageParser.register(ClientElbowshake);
    this.server.on("connection", this.onConnection.bind(this));
  }

  /**
   * Fired when a new WebSocket client connects
   * @param client
   */
  onConnection(client: SocketIO.Socket) {
    console.log("[SocketHandler] New connection");

    // Listen to client messages
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

    // Reject client if this RGM ID is already in use
    if (!!this.clients[message.id]) {
      const elbowDenied = new ServerElbowshake();
      elbowDenied.error = true;
      elbowDenied.message = "Client with that RGM ID already exists";

      // Send rejection
      client.emit(elbowDenied.constructor.name, elbowDenied);

      client.disconnect();

      console.warn(
        `[SocketHandler] Rejected client with duplicate RGM ID ${message.id}`
      );

      return;
    }

    // Create the client handler
    const clientHandler = new ClientHandler(client, message.id);
    this.clients[message.id] = clientHandler;

    // Free RGM ID when disconnected
    client.once("disconnect", () => {
      delete this.clients[message.id];
      console.log(`[SocketHandler] Freed RGM ID ${message.id}`);
    });

    // Let the client know it has been accepted
    const elbowAccepted = new ServerElbowshake();
    client.emit(elbowAccepted.constructor.name, elbowAccepted);

    console.log(`[SocketHandler] Accepted client with RGM ID ${message.id}`);
  }
}
