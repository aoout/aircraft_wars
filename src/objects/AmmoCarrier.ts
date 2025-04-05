// src/objects/AmmoCarrier.ts
import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { GameScene } from "../scenes/GameScene";

export class AmmoCarrier extends Enemy {
  name: string = "ammocarrier";
  health: number = 3;
  moveSpeed: number = 1;
  explosionRadius: number = 100;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "ammocarrier");
  }

  shoot(): void {
    // 不发射子弹
    return;
  }

  destroy(): void {
    if (!GameScene.gameOver) {
      // 创建圆形爆炸效果
      const explosion = this.scene.add.circle(this.x, this.y, this.explosionRadius, 0xff0000, 0.5);
      explosion.setDepth(1);

      // 检测范围内的敌机并摧毁
      const gameScene = this.scene as GameScene;
      gameScene.enemies.forEach(enemy => {
        if (enemy !== this && 
            Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= this.explosionRadius) {
          enemy.health = 0;
          enemy.destroy();
        }
      });

      // 爆炸动画
      this.scene.tweens.add({
        targets: explosion,
        alpha: 0,
        scale: 1.5,
        duration: 500,
        onComplete: () => {
          explosion.destroy();
        }
      });
    }

    super.destroy();
  }

  update(): void {
    if (this.y > window.innerHeight) {
      const gameScene = this.scene as GameScene;
      gameScene.basePointsPerSecond = gameScene.basePointsPerSecond + 0.2;
      this.remove();
    }
  }
}