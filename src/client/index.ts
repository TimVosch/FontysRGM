import SocketIO from "socket.io-client";
import { ServerHandler } from "./server.handler";
import { Machine } from "./machines/base";

const rgmID = parseInt(getQueryVariable("id"));

type Klass<T> = new (...args: any[]) => T;

/**
 * Loads a machine
 * @param id The ID to load
 */
const loadMachine = async (id: number): Promise<Klass<Machine>> => {
  if (rgmID === 51) {
    return (await import("./machines/51")).default;
  }
  if (rgmID === 52) {
    return (await import("./machines/52")).default;
  }
  return null;
};

/**
 * Entry
 */
const bootstrap = async () => {
  const socket = SocketIO();
  const handler = new ServerHandler(socket, rgmID);

  const MachineCTOR = await loadMachine(rgmID);
  const machine = new MachineCTOR(socket);
};

function getQueryVariable(variable: string): string {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  console.log("Query variable %s not found", variable);
}

bootstrap();
