import { registerMessage } from "../decorators/message.decorator";
import { IsEnum, IsNumber, IsOptional } from "class-validator";

export enum ClientType {
  ADMIN = "ADMIN",
  VIEWER = "VIEWER",
  SPECTATOR = "SPECTATOR",
  MACHINE = "MACHINE",
}

@registerMessage()
export class ClientElbowshake {
  @IsEnum(ClientType)
  type: ClientType;

  @IsOptional()
  @IsNumber()
  id?: number;
}
