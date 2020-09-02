import express from "express";
import { createServer } from "http";
import { SocketHandler } from "./socket.handler";

const app = express();
const http = createServer(app);
const socketHandler = new SocketHandler(http);

app.use(express.static("dist"));

http.listen(3000, () => {
  console.log("[Server] Listening");
});
