import Phaser from "phaser";
import { Enemy } from "./Enemy";

export class DroneBot extends Enemy {
  name: string = "dronebot";
  health: number = 2;
  moveSpeed: number = 1.5;

  shootDelay: number = 3000;
  bulletSpeed: number = 4;
  lastShootTime: number = 0;

  private initialX: number;
  initialY: number;
  radius: number = 120;
  angle: number = 0;
  rotationSpeed: number = 0.05;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "dronebot");
    this.initialX = x;
    this.initialY = y;
    this.setScale(0.6);
  }

  update(): void {
    // 圆周运动
    this.angle += this.rotationSpeed;
    const newX = this.initialX + Math.cos(this.angle) * this.radius;
    const newY = this.initialY + Math.sin(this.angle) * this.radius + this.moveSpeed;
    this.x = newX;
    this.y = newY;
    this.initialY += this.moveSpeed; // 更新初始Y坐标，使圆心也向下移动

    // 射击
    this.shoot();

    // 检查是否超出屏幕
    if (this.y > window.innerHeight) {
      this.scene.events.emit("breakthrough");
      this.remove();
    }
  }
}