import Phaser from "phaser";
import { GameScene } from "../scenes/GameScene";
import { Bullet } from "./Bullet";
import { Emitter } from "./Emitter";

export class Enemy extends Emitter {
  name: string = "";
  type: string = "enemy";

  health: number = 1;

  moveSpeed: number = 2;

  shootDelay: number = 600;
  bulletSpeed: number = 4;
  lastShootTime: number = 0;

  private explosionSprite?: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number, name: string) {
    super(scene, x, y, name);

    this.setData("type", "enemy");
    
    this.setVelocityY(this.moveSpeed);
  }

  shoot(): Bullet | void {
    const bullet = super.shoot();
    if (bullet) this.scene.events.emit("enemyShoot", bullet);
  }

  update(): void {
    this.shoot();
    if (this.y > window.innerHeight) {
      this.scene.events.emit("breakthrough");
      this.remove();
    }
  }

  takeDamage(): void {
    this.health -= 1;
    if (this.health <= 0) {
      this.destroy();
    } 
  }

  destroy(): void {

    if(!GameScene.gameOver){
      this.explosionSprite = this.scene.add.sprite(this.x, this.y, 'explosion');
      this.explosionSprite.setDepth(1);
      this.explosionSprite.setScale(0.05);
      this.explosionSprite.setAlpha(1);
  
      this.scene.tweens.add({
        targets: this.explosionSprite,
        alpha: { from: 1, to: 0 },
        scale: { from: 0.05, to: 2.5 },
        duration: 600,
        ease: 'Expo.easeOut',
        onComplete: () => {
          if (this.explosionSprite) {
            this.explosionSprite.destroy();
          }
        }
      });
      this.scene.cameras.main.shake(200, 0.004);
    }

    this.remove();
  }
}
