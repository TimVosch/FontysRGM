import { registerMessage } from "../../decorators/message.decorator";
import { IsString } from "class-validator";

@registerMessage()
export class ResponseCreateTransport {
  @IsString()
  id: string;
  iceCandidates: any;
  iceParameters: any;
  dtlsParameters: any;
  sctpParameters: any;
}
