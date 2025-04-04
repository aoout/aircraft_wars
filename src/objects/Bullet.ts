// src/objects/Bullet.ts
import Phaser from "phaser";
import { Object } from "./Object";

export class Bullet extends Object {
  acceleration: number = 0;
  type: string = "bullet";
  constructor(
    scene: Phaser.Scene,
    type: string,
    x: number,
    y: number,
    speed: number,
    acceleration: number = 0
  ) {
    super(scene, x, y, "bullet");
    this.acceleration = acceleration;

    this.setData("type", `${type}_bullet`);

    this.setVelocityY(speed);
  }

  public update(): void {
    if (this.y < 0 || this.y > window.innerHeight || this.x < 0 || this.x > window.innerWidth)
      this.destroy();
    if (this.body) this.setVelocityY(this.body.velocity.y + this.acceleration);
  }
}
