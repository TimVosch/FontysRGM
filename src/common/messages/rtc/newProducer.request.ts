import { registerMessage } from "../../decorators/message.decorator";

@registerMessage()
export class RequestNewProducer {
  id: string;
  kind: string;
  rtpParameters: any;
}
