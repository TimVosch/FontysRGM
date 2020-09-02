import { Machine } from "./base";

export default class RGM52 extends Machine {
  onStart(): void {
    alert("52 was triggered!");
  }

  getID(): number {
    return 52;
  }
}
