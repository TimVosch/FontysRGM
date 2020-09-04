import { registerMessage } from "../decorators/message.decorator";

@registerMessage()
export class ServerBroadcastNewProducer {
  producers: { id: number; producerId: string }[];
  currentRGM: number;
}
