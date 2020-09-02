import { registerMessage } from "../decorators/message.decorator";
import { IsNumber } from "class-validator";

@registerMessage()
export class ClientElbowshake {
  @IsNumber()
  id: number;
}
