import { Bullet } from "./Bullet";
import { Object } from "./Object";

export abstract class Emitter extends Object {
  abstract name: string;
  abstract shootDelay: number;
  abstract lastShootTime: number;
  abstract bulletSpeed: number;
  bulletAcceleration: number = 0;

  shoot(): Bullet | void {
    const currentTime = Date.now();
    if (currentTime - this.lastShootTime < this.shootDelay) return;

    const bullet = new Bullet(
      this.scene as Phaser.Scene,
      this.type,
      this.x,
      this.y + 20 * Math.sign(this.bulletSpeed),
      this.bulletSpeed,
      this.bulletAcceleration
    );
    this.lastShootTime = currentTime;
    return bullet;
  }
}
