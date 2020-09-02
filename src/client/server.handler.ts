import { MessageHandler } from "../common/message.handler";
import { ClientElbowshake } from "../common/messages/elbowshake.client";
import { listen } from "../common/decorators/listen.decorator";
import { ServerElbowshake } from "../common/messages/elbowshake.server";

export class ServerHandler extends MessageHandler<SocketIOClient.Socket> {
  private readonly rgmID: number;

  constructor(socket: SocketIOClient.Socket, id: number) {
    super(socket);
    this.rgmID = id;

    // Register two listeners that do not cohere to MessageHandler standards
    socket.on("disconnect", this.onDisconnect.bind(this));
    socket.on("connect", this.onConnect.bind(this));
  }

  bindOnMessage(): void {
    // Bind all listeners to onMessage
    Object.keys(this.listeners).forEach((event) => {
      this.socket.on(event, this.onMessage.bind(this, event));
    });
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
