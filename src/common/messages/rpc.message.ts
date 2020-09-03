import { registerMessage } from "../decorators/message.decorator";
import { IsString, IsOptional } from "class-validator";
import { v4 as uuid } from "uuid";
import { getEventName } from "../util";

@registerMessage()
export class RPCMessage {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  event: string;

  data: any;

  /**
   * Packs another message as RPC message
   * @param message
   * @param id
   */
  static pack(message: any, id?: string): RPCMessage {
    const msg = new RPCMessage();

    msg.id = id || uuid();
    msg.event = getEventName(message.constructor);
    msg.data = message;
    return msg;
  }
}
