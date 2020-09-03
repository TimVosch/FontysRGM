import { MessageParser } from "./message.parser";
import { extractListeners, extractMessages } from "./util";
import { classToPlain } from "class-transformer";

interface Emittable {
  emit(event: string, ...args: any[]): void;
}

export abstract class MessageHandlerBase<Socket extends Emittable> {
  protected listeners: Record<string, Function[]>;
  protected target: any;
  protected socket: Socket;

  constructor(target: any, socket: Socket) {
    this.target = target;
    this.socket = socket;
    this.initializeClass();
    this.bindOnMessage();
  }

  /**
   *
   */
  private initializeClass() {
    const messages = extractMessages(this.target);
    messages.forEach((message) => MessageParser.register(message));

    const listeners = extractListeners(this.target);
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
    console.log(`[MessageHandler] Received ${event}`);

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
    const eventName = Reflect.getMetadata("event", message.constructor) || null;

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
