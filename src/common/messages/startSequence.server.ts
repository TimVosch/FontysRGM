import { registerMessage } from "../decorators/message.decorator";

@registerMessage()
export class ServerStartSequence {
  data?: any;
}
