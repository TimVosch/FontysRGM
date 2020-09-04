import "source-map-support/register";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { SocketHandler } from "./socket.handler";
import { firebase } from "./firebase";
import { RTCServer } from "./rtc/worker.manager";

const bootstrap = async () => {
  // Load firebase config
  let firebaseConfig = null;
  try {
    firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
  } catch (e) {
    console.error(
      "Could not read/parse firebase config. Make sure to set environment variable FIREBASE_CONFIG"
    );
    process.exit(1);
  }

  // Configure firebase singleton
  firebase(firebaseConfig);

  const app = express();
  const http = createServer(app);
  const socketHandler = new SocketHandler(http);

  // Initialize RTCServer
  await RTCServer.start();

  app.use(express.static("dist"));

  const port = !!process.env.NODE_PORT ? parseInt(process.env.NODE_PORT) : 3000;
  http.listen(port, () => {
    console.log(`[Server] Listening on ${port}`);
  });
};
bootstrap();
