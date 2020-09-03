import { registerMessage } from "../../decorators/message.decorator";
import { IsNotEmptyObject, IsString } from "class-validator";

@registerMessage()
export class ResponseNewConsumer {
  @IsString()
  id: string;

  @IsNotEmptyObject()
  rtpParameters: any;
}
