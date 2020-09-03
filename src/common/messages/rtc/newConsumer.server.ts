import { registerMessage } from "../../decorators/message.decorator";

@registerMessage()
export class ServerNewConsumer {
  id: any;
  producerId: any;
  kind: any;
  rtpParameters: any;
}
