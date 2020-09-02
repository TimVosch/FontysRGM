import { MessageParser } from "./message.parser";
import { extractListeners, extractMessages } from "./util";
import { classToPlain } from "class-transformer";
import { debug } from "webpack";

interface Emittable {
  emit(event: string, ...args: any[]): void;
}

export abstract class MessageHandler<Socket extends Emittable> {
  protected socket: Socket;

  protected listeners: Record<string, Function[]>;

  constructor(socket: Socket) {
    this.socket = socket;
    this.initializeClass();
    this.bindOnMessage();
  }

  /**
   *
   */
  private initializeClass() {
    const messages = extractMessages(this);
    messages.forEach((message) => MessageParser.register(message));

    const listeners = extractListeners(this);
    this.listeners = listeners;
  }

  /**
   *
   * @param event
   * @param data
   * @param client
   */
  async onMessage(event: string, data: any, client?: any) {
    const message = await MessageParser.parse(event, data);

    // Drop message if it wasn't parsed
    if (message === null) {
      return;
    }

    // Call listeners
    this.listeners[event].forEach((listener) => listener(message, client));
  }

  /**
   * Send a message to a client
   * @param target
   * @param message
   */
  async send(message: any) {
    const socket = this.socket;

    // Make sure that either a client is provided or that we have a default client set
    if (!socket) {
      console.error(
        `[MessageHandler] Cannot send message. No default socket set and no socket given.`
      );
      return;
    }

    // Get event name
    const eventName = Reflect.getMetadata("event", message.constructor);

    // Invalid message
    if (eventName === null) {
      console.error(
        "[MessageHandler] Cannot send message. Did you forget @registerMessage?"
      );
      return;
    }

    socket.emit(eventName, classToPlain(message));
  }

  abstract bindOnMessage(): void;
}
