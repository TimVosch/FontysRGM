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
  const messageListeners: Record<string, Function[]> = {};
  const prototype = klass;
  const keys = getMethods(klass);

  // Iterate all properties and methods
  keys.forEach((key) => {
    const func = prototype[key] as Function;
    const metadataKeys = Reflect.getMetadataKeys(func);

    // Check if listener decorator is present
    if (metadataKeys.includes(LISTEN_METADATA_KEY)) {
      const messageType = Reflect.getMetadata(LISTEN_METADATA_KEY, func);
      const event = Reflect.getMetadata("event", messageType);

      // Add to listener list
      const listeners = messageListeners[event] || [];
      listeners.push(func.bind(klass));
      messageListeners[event] = listeners;
    }
  });

  return messageListeners;
};

export const extractMessages = (klass: object) => {
  const messages = [];
  const prototype = Reflect.getPrototypeOf(klass);
  const keys = Reflect.ownKeys(prototype);

  // Iterate all properties and methods
  keys.forEach((key) => {
    const func = prototype[key] as Function;
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
