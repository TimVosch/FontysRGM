import { MessageHandlerBase } from "../common/message.handler";

export class MessageHandler extends MessageHandlerBase<SocketIO.Socket> {
  bindOnMessage(): void {
    this.socket.use(([event, data, _], next) => {
      this.onMessage(event, data);
      next();
    });
  }
}
