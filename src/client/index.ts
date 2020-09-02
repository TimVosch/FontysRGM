import SocketIO from "socket.io-client";
import { ServerHandler } from "./server.handler";

const socket = SocketIO();
const handler = new ServerHandler(socket);
