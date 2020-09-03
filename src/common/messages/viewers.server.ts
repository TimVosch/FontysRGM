import { registerMessage } from "../decorators/message.decorator";
import { IsArray } from "class-validator";

@registerMessage()
export class ServerViewers {
  @IsArray()
  viewers: number[];
}
