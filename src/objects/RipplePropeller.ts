// src/objects/Player.ts
import Phaser from "phaser";
import { Bullet } from "./Bullet";
import { Player } from "./Player";

export class RipplePropeller extends Player {
  name: string = "ripplepropeller";
  baseMoveSpeed: number = 3;
  maxMoveSpeed: number = 10;
  acceleration: number = 0.1;
  baseDeceleration: number = 0.3;
  deceleration: number = 0.5;
  currentSpeedX: number = 0;
  currentSpeedY: number = 0;
  isDragging: boolean = false;

  bullets: Bullet[] = [];
  baseShootDelay: number = 600;
  shootDelay: number = this.baseShootDelay;
  bulletSpeed: number = -7;
  lastShootTime: number = 0;

  hasShield: boolean = false;
  shieldGraphics?: Phaser.GameObjects.Graphics;

  updateStats(score: number): void {
    const multiplier = 1 + Math.min(score / 250, 1);
    this.deceleration = this.baseDeceleration * multiplier;
    this.shootDelay = this.baseShootDelay / multiplier;
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "ripplepropeller");
  }

  updateSpeed(keyboard: Phaser.Input.Keyboard.KeyboardPlugin): void {
    // 水平方向加速度
    if (keyboard.addKey("A").isDown) {
      this.currentSpeedX = Math.max(-this.maxMoveSpeed, this.currentSpeedX - this.acceleration);
    } else if (keyboard.addKey("D").isDown) {
      this.currentSpeedX = Math.min(this.maxMoveSpeed, this.currentSpeedX + this.acceleration);
    } else {
      // 没有按键时逐渐减速
      if (this.currentSpeedX > 0) {
        this.currentSpeedX = Math.max(0, this.currentSpeedX - this.deceleration);
      } else if (this.currentSpeedX < 0) {
        this.currentSpeedX = Math.min(0, this.currentSpeedX + this.deceleration);
      }
    }

    // 垂直方向加速度
    if (keyboard.addKey("W").isDown) {
      this.currentSpeedY = Math.max(-this.maxMoveSpeed, this.currentSpeedY - this.acceleration);
    } else if (keyboard.addKey("S").isDown) {
      this.currentSpeedY = Math.min(this.maxMoveSpeed, this.currentSpeedY + this.acceleration);
    } else {
      // 没有按键时逐渐减速
      if (this.currentSpeedY > 0) {
        this.currentSpeedY = Math.max(0, this.currentSpeedY - this.deceleration);
      } else if (this.currentSpeedY < 0) {
        this.currentSpeedY = Math.min(0, this.currentSpeedY + this.deceleration);
      }
    }

    this.setVelocity(this.currentSpeedX * this.baseMoveSpeed, this.currentSpeedY * this.baseMoveSpeed);
  }

  onDragStart(pointer: Phaser.Input.Pointer): void {
    this.isDragging = true;
  }

  onDrag(pointer: Phaser.Input.Pointer): void {
    if (!this.isDragging) return;
    
    const dirX = pointer.x - this.x;
    const dirY = pointer.y - this.y;
    const distance = Math.sqrt(dirX * dirX + dirY * dirY);
    
    if (distance > 6) {
      const accelerationX = (dirX / distance) * this.acceleration;
      const accelerationY = (dirY / distance) * this.acceleration;
      
      const speedX = this.currentSpeedX + accelerationX;
      const speedY = this.currentSpeedY + accelerationY;

      this.currentSpeedX = Math.max(-this.maxMoveSpeed, Math.min(speedX, this.maxMoveSpeed));
      this.currentSpeedY = Math.max(-this.maxMoveSpeed, Math.min(speedY, this.maxMoveSpeed));

      this.setVelocity(this.currentSpeedX, this.currentSpeedY);
      
      
    } else {
      // 没有拖动时逐渐减速
      const decelerationX = this.currentSpeedX * this.deceleration;
      const decelerationY = this.currentSpeedY * this.deceleration;

      this.currentSpeedX -= decelerationX;
      this.currentSpeedY -= decelerationY;

      this.setVelocity(this.currentSpeedX, this.currentSpeedY);
    }
  }

  onDragEnd(): void {
    this.isDragging = false;
    this.currentSpeedX = 0;
    this.currentSpeedY = 0;
    this.setVelocity(0, 0);
  }
}
