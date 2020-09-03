import SocketIO from "socket.io";
import { Server } from "http";
import {
  ClientElbowshake,
  ClientType,
} from "../common/messages/elbowshake.client";
import { MachineHandler } from "./machine.handler";
import { MessageParser } from "../common/message.parser";
import { ViewerHandler } from "./viewer.handler";
import { AdminHandler } from "./admin.handler";
import { ServerRegisterRGM } from "../common/messages/registerRGM.server";
import { MessageHandler } from "./message.handler";
import { ServerViewers } from "../common/messages/viewers.server";

export class SocketHandler {
  private readonly server: SocketIO.Server;

  public static viewers: Record<number, ViewerHandler> = {};
  public static machines: Record<number, MachineHandler> = {};
  public static admins: AdminHandler[] = [];

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

    switch (message.type) {
      case ClientType.ADMIN:
        const adminHandler = new AdminHandler(client);
        SocketHandler.admins.push(adminHandler);
        this.sendViewersToAdmin();
        adminHandler.client.once("disconnect", () => {
          delete SocketHandler.admins[
            SocketHandler.admins.indexOf(adminHandler)
          ];
          console.log(`[SocketHandler] Admin disconnected`);
        });
        break;
      case ClientType.MACHINE:
        const handler = new MessageHandler(this, client);
        // Reject client if this RGM ID is already in use
        if (!!SocketHandler.machines[message.id]) {
          const deniedMSG = new ServerRegisterRGM();
          deniedMSG.error = true;
          deniedMSG.message = "Client with that RGM ID already exists";

          // Send rejection
          handler.send(deniedMSG);
          handler.close();

          console.warn(
            `[SocketHandler] Rejected client with duplicate RGM ID ${message.id}`
          );

          return;
        }

        // Create the client handler
        SocketHandler.machines[message.id] = new MachineHandler(
          client,
          message.id
        );

        // Free RGM ID when disconnected
        SocketHandler.machines[message.id].client.once("disconnect", () => {
          SocketHandler.machines[message.id].onDisconnect();
          delete SocketHandler.machines[message.id];
          console.log(`[SocketHandler] Freed RGM ID ${message.id}`);
        });

        // Let the client know it has been accepted
        const acceptedMSG = new ServerRegisterRGM();
        SocketHandler.machines[message.id].handler.send(acceptedMSG);
        console.log(
          `[SocketHandler] Accepted client with RGM ID ${message.id}`
        );
        break;
      case ClientType.VIEWER:
        SocketHandler.viewers[message.id] = new ViewerHandler(client);
        this.sendViewersToAdmin();
        SocketHandler.viewers[message.id].client.once("disconnect", () => {
          delete SocketHandler.viewers[message.id];
          this.sendViewersToAdmin();
          console.log(`[SocketHandler] Viewer ${message.id} disconnected`);
        });
        break;
    }
  }

  private sendViewersToAdmin() {
    const viewersMessage = new ServerViewers();
    viewersMessage.viewers = Object.keys(SocketHandler.viewers).map((a) =>
      parseInt(a)
    );
    for (const admin of SocketHandler.admins) {
      if (admin) {
        admin.handler.send(viewersMessage);
      }
    }
  }
}
