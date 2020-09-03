import { LISTEN_METADATA_KEY } from "./decorators/listen.decorator";

const getMethods = (obj: any) => {
  let properties = new Set<string>();
  let currentObj = obj;

  do {
    Object.getOwnPropertyNames(currentObj).map((item) => properties.add(item));
  } while ((currentObj = Object.getPrototypeOf(currentObj)));

  return [...properties.keys()].filter(
    (item: string) => typeof obj[item] === "function"
  );
};

export const extractListeners = (klass: object) => {
  const messageListeners: Record<string, Function> = {};
  const keys = getMethods(klass);

  // Iterate all properties and methods
  keys.forEach((key) => {
    const func = klass[key] as Function;
    const metadataKeys = Reflect.getMetadataKeys(func);

    // Check if listener decorator is present
    if (metadataKeys.includes(LISTEN_METADATA_KEY)) {
      const messageType = Reflect.getMetadata(LISTEN_METADATA_KEY, func);
      const event = Reflect.getMetadata("event", messageType);

      // Register listener
      const listener = messageListeners[event] || null;
      if (listener !== null) {
        console.warn(
          `[UTIL] Multiple listeners for event ${event}. Only one will fire!`
        );
      }
      messageListeners[event] = func;
    }
  });

  return messageListeners;
};

export const extractMessages = (klass: object) => {
  const messages = [];
  const keys = getMethods(klass);

  // Iterate all properties and methods
  keys.forEach((key) => {
    const func = klass[key] as Function;
    const metadataKeys = Reflect.getMetadataKeys(func);

    // Check if listener decorator is present
    if (metadataKeys.includes(LISTEN_METADATA_KEY)) {
      const messageType = Reflect.getMetadata(LISTEN_METADATA_KEY, func);

      // Check for duplicate
      if (!messages.includes(messageType)) {
        messages.push(messageType);
      }
    }
  });

  return messages;
};

export const getEventName = (message: new (...args: any[]) => any) => {
  const event = Reflect.getMetadata("event", message) || null;

  if (event === null) {
    console.error(`[RPCMessage] Cannot pack message that is not registered`);
  }
  return event;
};
