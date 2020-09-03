import * as ms from "mediasoup";
import { mediaCodecs } from "./config.rtc";

export class RTCRoom {
  private readonly router: ms.types.Router;

  constructor(router: ms.types.Router) {
    this.router = router;
  }

  /**
   * Instantiate a room
   * @param worker
   */
  static async create(worker: ms.types.Worker): Promise<RTCRoom> {
    const router = await worker.createRouter({
      mediaCodecs,
    });
    return new RTCRoom(router);
  }
}
