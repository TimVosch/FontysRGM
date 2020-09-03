import { registerMessage } from "../decorators/message.decorator";
import { IsBoolean, IsOptional, IsString } from "class-validator";

@registerMessage()
export class ServerRegisterRGM {
  @IsBoolean()
  error = false;

  @IsOptional()
  @IsString()
  message?: string;
}
