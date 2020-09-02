import { registerMessage } from "../decorators/message.decorator";
import { IsNumber } from "class-validator";

@registerMessage()
export class ClientFinished {
  @IsNumber()
  nextID: number;
}
