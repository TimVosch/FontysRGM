import { registerMessage } from "../../decorators/message.decorator";

@registerMessage()
export class ResponseRTPCapabilities {
  rtpCapabilities: any;
}
