import { MessageParser } from "./message.parser";
import { extractListeners, extractMessages, getEventName } from "./util";
import { classToPlain } from "class-transformer";
import { RPCMessage } from "./messages/rpc.message";

interface Emittable {
  emit(event: string, ...args: any[]): void;
  once(event: string, callback: Function): void;
}

export abstract class MessageHandlerBase<Socket extends Emittable> {
  protected listeners: Record<string, Function>;
  protected target: any;
  protected socket: Socket;

  constructor(target: any, socket: Socket) {
    this.target = target;
    this.socket = socket;
    this.initializeClass();
    this.bindOnMessage();

    MessageParser.register(RPCMessage);
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

  async onRPCMessage(message: RPCMessage) {
    const rpcIn = message as RPCMessage;
    const result = await this.onMessage(rpcIn.event, rpcIn.data);
    const rpcOut = new RPCMessage();
    rpcOut.id = rpcIn.id;

    if (result !== undefined) {
      const msgType = getEventName(result.constructor);

      // if result is of message type then set response
      if (msgType !== null) {
        rpcOut.event = msgType;
        rpcOut.data = result;
      }
    }

    this.socket.emit(rpcIn.id, rpcOut);
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

    // If message is an RPC Message
    if (event === getEventName(RPCMessage)) {
      return this.onRPCMessage(message);
    }

    // Otherwise call listener
    const listener = this.listeners[event];
    if (listener) {
      return await listener(message, client);
    }
    return null;
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

  /**
   *  Request and wait for an answer
   */
  request<A, B>(
    question: A,
    answerType: new (...args: any[]) => B
  ): Promise<B> {
    MessageParser.register(answerType);
    return new Promise((resolve, reject) => {
      const outgoing = RPCMessage.pack(question);

      // Register response listener
      this.socket.once(outgoing.id, async (incoming: RPCMessage) => {
        const answer = await MessageParser.parse(incoming.event, incoming.data);
        if (!(answer instanceof answerType)) {
          return reject({ message: "Unexpect RPC response!" });
        }
        return resolve(answer);
      });

      // Emit question
      this.send(outgoing);
    });
  }

  abstract bindOnMessage(): void;
}
