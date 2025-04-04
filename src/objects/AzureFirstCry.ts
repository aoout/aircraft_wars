// src/objects/Player.ts
import Phaser from "phaser";
import { Bullet } from "./Bullet";
import { Player } from "./Player";

export class AzureFirstCry extends Player {
  name: string = "azurefirstcry";
  baseMoveSpeed: number = 5;
  moveSpeed: number = this.baseMoveSpeed;

  bullets: Bullet[] = [];
  baseShootDelay: number = 600;
  shootDelay: number = this.baseShootDelay;
  bulletSpeed: number = -5;
  lastShootTime: number = 0;

  hasShield: boolean = false;
  shieldGraphics?: Phaser.GameObjects.Graphics;

  updateStats(score: number): void {
    const multiplier = 1 + Math.min(score / 250, 1);
    this.moveSpeed = this.baseMoveSpeed * multiplier;
    this.shootDelay = this.baseShootDelay / multiplier;
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "azurefirstcry");
  }
}
