import { Machine } from "./base";

export default class RGM51 extends Machine {
  constructor(socket: SocketIOClient.Socket) {
    super(socket);
  }

  onStart(): void {
    alert("51 was triggered!");
  }

  getID(): number {
    return 51;
  }
}
