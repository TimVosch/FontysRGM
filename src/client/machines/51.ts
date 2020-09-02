import { Machine } from "./base";

export default class RGM51 extends Machine {
  onStart(): void {
    alert("51 was triggered!");
  }

  getID(): number {
    return 51;
  }
}
