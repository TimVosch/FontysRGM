import { registerMessage } from "../../decorators/message.decorator";

@registerMessage()
export class ServerTransportStats {
  stats: any[];
}
