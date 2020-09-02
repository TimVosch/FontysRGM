import "reflect-metadata";

export const LISTEN_METADATA_KEY = "event:listener";

/**
 * Listen for a specific message
 * @param messageType
 */
export const listen = (messageType: Function) => {
  return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      LISTEN_METADATA_KEY,
      messageType,
      target[propertyKey]
    );
  };
};
