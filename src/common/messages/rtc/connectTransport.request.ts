import { registerMessage } from "../../decorators/message.decorator";
import { IsString, IsNotEmptyObject } from "class-validator";

@registerMessage()
export class RequestConnectTransport {
  @IsString()
  id: string;

  @IsNotEmptyObject()
  dtlsParameters: any;
}
