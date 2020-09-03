import { registerMessage } from "../../decorators/message.decorator";

@registerMessage()
export class ClientNewProducer {
  rtpParameters: any;
}
