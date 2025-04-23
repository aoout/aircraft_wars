import Phaser from "phaser";
import { Enemy } from "./Enemy";

export class Vanguard extends Enemy {
  name: string = "vanguard";
  moveSpeed: number = 2;

  shootDelay: number = 1000;
  bulletSpeed: number = 3;
  lastShootTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "vanguard");
  }
}
