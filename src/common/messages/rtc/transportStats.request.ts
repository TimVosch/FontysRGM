import { registerMessage } from "../../decorators/message.decorator";
import { IsString } from "class-validator";

@registerMessage()
export class RequestTransportStats {
  @IsString()
  id: string;
}
