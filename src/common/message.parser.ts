import "reflect-metadata";
import { Packet } from "socket.io";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

type ctor = new () => any;

export class MessageParserClass {
  private readonly messages: Record<string, ctor> = {};

  /**
   * Registers a new message
   * @param message The message to register
   */
  register(message: ctor) {
    const event = Reflect.getMetadata("event", message);

    if (event === null || event === undefined) {
      console.error(
        `[Parser] Could not register ${message.name}. Did you forget @registerMessage(...)?`
      );
      return;
    }

    this.messages[event] = message;
  }

  /**
   *
   * @param param0 The Socket.IO Packet
   */
  async parse(event: string, data: any) {
    const ctor = this.messages[event] || null;

    // Dont continue if we don't know this message
    if (ctor === null) {
      return null;
    }

    // Convert
    const message = plainToClass(ctor, data);
    const errors = await validate(message);
    if (errors.length > 0) {
      console.log(errors);
      console.error(`Failed to parse message for ${event}!`);
      return null;
    }

    return message;
  }
}

export const MessageParser = new MessageParserClass();
