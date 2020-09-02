import SocketIO from "socket.io-client";
import { ServerHandler } from "./server.handler";
import { Machine } from "./machines/base";

const rgmID = 51;
type Klass<T> = new (...args: any[]) => T;

/**
 * Loads a machine
 * @param id The ID to load
 */
const loadMachine = async (id: number): Promise<Klass<Machine>> => {
  if (rgmID === 51) {
    return (await import("./machines/51")).RGM51;
  }
  if (rgmID === 52) {
    return (await import("./machines/52")).RGM52;
  }
  return null;
};

/**
 * Entry
 */
const bootstrap = async () => {
  const socket = SocketIO();
  const handler = new ServerHandler(socket, rgmID);

  const Machine = await loadMachine(rgmID);
  const machine = new Machine(socket);
};
bootstrap();
