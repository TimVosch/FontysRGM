import { Machine } from "./base";

export default class RGM51 extends Machine {
  readonly id = 51;

  onStart(): void {
    alert("51 was triggered!");
  }
}
