import Phaser from "phaser";
import { Enemy } from "./Enemy";

export class MeteorFighter extends Enemy {
  name: string = "meteorfighter";
  health: number = 2;
  moveSpeed: number = 2;

  shootDelay: number = 1200;
  bulletSpeed: number = 2;
  lastShootTime: number = 0;
  bulletAcceleration: number = 0.1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "meteorfighter");
  }
}
