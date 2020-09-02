import "source-map-support/register";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { SocketHandler } from "./socket.handler";
import { firebase } from "./firebase";

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

const app = express();
const http = createServer(app);
const socketHandler = new SocketHandler(http);

// Configure firebase singleton
firebase(firebaseConfig);

app.use(express.static("dist"));

http.listen(3000, () => {
  console.log("[Server] Listening");
});
