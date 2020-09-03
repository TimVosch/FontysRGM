import * as ms from "mediasoup";
import { RTCRoom } from "./room.rtc";

export class RTCServerClass {
  private worker: ms.types.Worker;
  private room: RTCRoom;

  async start() {
    this.worker = await ms.createWorker({
      rtcMinPort: 55000,
      rtcMaxPort: 56000,
    });
    console.log("[RTCServer] Worker started!");

    this.worker.on("died", () => {
      console.log(`[RTCServer] Worker died`);
    });

    this.room = await RTCRoom.create(this.worker);
  }

  getWorker() {
    return this.worker;
  }

  /**
   * Single room in our server
   */
  getRoom() {
    return this.room;
  }
}

export const RTCServer = new RTCServerClass();
