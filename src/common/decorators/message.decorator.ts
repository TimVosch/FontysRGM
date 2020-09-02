import "reflect-metadata";

/**
 *
 * @param eventName The event that this message belongs to
 */
export const registerMessage = () => {
  return function (constructor: Function) {
    Reflect.defineMetadata("event", constructor.name, constructor);
  };
};
