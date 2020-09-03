import { registerMessage } from "../../decorators/message.decorator";
import { IsString } from "class-validator";

@registerMessage()
export class ClientTransportStats {
  @IsString()
  id: string;
}
