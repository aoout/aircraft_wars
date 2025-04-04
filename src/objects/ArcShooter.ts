// src/objects/Enemy.ts
import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { Bullet } from "./Bullet";

export class ArcShooter extends Enemy {
  name: string = "arcshooter";
  health: number = 4;
  moveSpeed: number = 2;

  shootDelay: number = 1200;
  bulletSpeed: number = 4;
  lastShootTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "arcshooter");
  }

  shoot(): Bullet | void {
    const currentTime = this.scene.time.now;

    if (currentTime - this.lastShootTime < this.shootDelay) {
      return;
    }

    const bulletCount = 5;
    const spreadAngle = Phaser.Math.DegToRad(40);
    const angleStep = spreadAngle / (bulletCount - 1);
    const startAngle = -spreadAngle / 2;

    for (let i = 0; i < bulletCount; i++) {
      const angle = startAngle + i * angleStep;
      const bullet = new Bullet(
        this.scene,
        this.type,
        this.x,
        this.y,
        this.bulletSpeed * Math.cos(angle)
      );
      bullet.setVelocityX(this.bulletSpeed * Math.sin(angle))
      this.scene.add.existing(bullet);
      this.scene.events.emit("enemyShoot", bullet);
    }

    this.lastShootTime = currentTime;
  }
}
