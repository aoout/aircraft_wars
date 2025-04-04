// src/objects/Enemy.ts
import Phaser from "phaser";
import { Enemy } from "./Enemy";

export class UpShooter extends Enemy {
  name: string = "upshooter";
  health: number = 1;
  moveSpeed: number = 2;

  shootDelay: number = 1000;
  bulletSpeed: number = -4;
  lastShootTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "upshooter");
  }
}