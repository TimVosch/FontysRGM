import { MessageHandlerBase } from "../common/message.handler";

export class MessageHandler extends MessageHandlerBase<SocketIOClient.Socket> {
  bindOnMessage(): void {
    Object.keys(this.listeners).forEach((event) => {
      console.log(`bound ${event}`);

      this.socket.on(event, this.onMessage.bind(this, event));
    });
  }

  open() {
    this.socket.open();
  }

  close() {
    this.socket.close();
  }
}
