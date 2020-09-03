import { registerMessage } from "../../decorators/message.decorator";
import { IsString, IsNotEmptyObject } from "class-validator";

@registerMessage()
export class RequestNewConsumer {
  @IsString()
  id: string;

  @IsString()
  producerId: string;

  @IsNotEmptyObject()
  rtpCapabilities: any;
}
