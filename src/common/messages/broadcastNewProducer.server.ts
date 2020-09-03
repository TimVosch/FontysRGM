import { registerMessage } from "../decorators/message.decorator";

@registerMessage()
export class ServerBroadcastNewProducer {
  producerId: string;
}
