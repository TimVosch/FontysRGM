import { registerMessage } from "../../decorators/message.decorator";

@registerMessage()
export class ServerRTPCapabilities {
  rtpCapabilties: any;
}
