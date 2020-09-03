import { registerMessage } from "../../decorators/message.decorator";
import { IsString } from "class-validator";

@registerMessage()
export class ClientConnectTransport {
  @IsString()
  id: string;
  dtlsParameters: any;
}
