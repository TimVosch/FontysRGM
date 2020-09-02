import { MessageHandler } from "../common/message.handler";
import { ClientElbowshake } from "../common/messages/elbowshake.client";
import { listen } from "../common/decorators/listen.decorator";
import { ServerElbowshake } from "../common/messages/elbowshake.server";

export class ServerHandler extends MessageHandler {
  private readonly rgmID: number;
  protected readonly socket: SocketIOClient.Socket;

  constructor(socket: SocketIOClient.Socket, id: number) {
    super(socket);
    this.rgmID = id;

    // Bind all listeners to onMessage
    Object.keys(this.listeners).forEach((event) => {
      socket.on(event, this.onMessage.bind(this, event));
    });

    // Register two listeners that do not cohere to MessageHandler standards
    socket.on("disconnect", this.onDisconnect.bind(this));
    socket.on("connect", this.onConnect.bind(this));
  }

  @listen(ServerElbowshake)
  onElbowshake(message: ServerElbowshake) {
    if (message.error) {
      console.log("Elbowshake rejected by server: " + message.message);
      return;
    }
    console.log("Elbowshake accepted by server");
  }

  /**
   *
   */
  onConnect() {
    console.log("Connected, sending elbowshake");

    // Create elbowshake
    const elbowshake = new ClientElbowshake();
    elbowshake.id = this.rgmID;

    this.send(elbowshake);
  }

  /**
   *
   */
  onDisconnect() {
    alert("Disconnected, you will have to reload the page");
  }
}
