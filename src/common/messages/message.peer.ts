import { IsString, IsObject, IsNumber } from "class-validator";
import { registerMessage } from "../decorators/message.decorator";

@registerMessage()
export class PeerMessage {
  @IsNumber()
  target: number;

  @IsString()
  event: string;

  @IsObject()
  data: any;
}
