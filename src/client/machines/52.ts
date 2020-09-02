import { Machine } from "./base";

export default class RGM52 extends Machine {
  readonly id = 52;

  onStart(): void {
    alert("52 was triggered!");
  }
}
