import { registerMessage } from "../decorators/message.decorator";
import { IsOptional, IsString, IsBoolean } from "class-validator";

@registerMessage()
export class ServerElbowshake {
  @IsBoolean()
  error = false;

  @IsOptional()
  @IsString()
  message?: string;
}
