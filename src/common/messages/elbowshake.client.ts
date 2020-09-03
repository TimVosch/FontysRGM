import { registerMessage } from "../decorators/message.decorator";
import { IsNumber, IsBoolean } from "class-validator";

@registerMessage()
export class ClientElbowshake {
  @IsBoolean()
  viewer: boolean = false;
}
