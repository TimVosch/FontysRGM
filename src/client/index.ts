import SocketIO from "socket.io-client";
import { ServerHandler } from "./server.handler";

const rgmID = 51;

const socket = SocketIO();
const handler = new ServerHandler(socket, rgmID);
