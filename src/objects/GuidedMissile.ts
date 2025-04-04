// src/objects/GuidedMissile.ts
import Phaser from "phaser";
import { Bullet } from "./Bullet";
import { Enemy } from "./Enemy";

// 定义导弹类，继承自Bullet
export class GuidedMissile extends Bullet {
  target: Enemy;
  trackingSpeed: number = 0.1;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy) {
    super(scene, "player", x, y, -5);
    this.target = target;
    this.setTint(0xff0000); // 红色导弹
    this.setScale(1.2); // 稍大一些
  }

  private currentAngle: number = 0;
  private maxTurnRate: number = 0.1; // 最大转向速率
  private baseSpeed: number = 5; // 基础速度
  private maxSpeed: number = 8; // 最大速度

  public update(): void {
    // 如果目标已被销毁，导弹直线飞行
    if (!this.target || !this.target.active) {
      if (this.y < 0) this.destroy();
      return;
    }

    // 计算导弹与目标之间的角度
    const targetAngle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
    
    // 计算角度差
    let angleDiff = Phaser.Math.Angle.Wrap(targetAngle - this.currentAngle);
    
    // 平滑转向
    if (Math.abs(angleDiff) > this.maxTurnRate) {
      angleDiff = Math.sign(angleDiff) * this.maxTurnRate;
    }
    
    // 更新当前角度
    this.currentAngle = Phaser.Math.Angle.Wrap(this.currentAngle + angleDiff);
    
    // 根据与目标的距离动态调整速度
    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    const speedFactor = Math.min(1, distance / 200); // 距离越近速度越慢
    const speed = this.baseSpeed + (this.maxSpeed - this.baseSpeed) * speedFactor;
    
    // 计算导弹的速度向量
    const vx = Math.cos(this.currentAngle) * speed;
    const vy = Math.sin(this.currentAngle) * speed;
    
    // 设置导弹的速度
    this.setVelocity(vx, vy);
    
    // 设置导弹的旋转角度，使其朝向运动方向
    this.setRotation(this.currentAngle + Math.PI/2);
    
    // 检查是否击中目标
    if (distance < 20) {
      this.target.takeDamage();
      this.destroy();
    }
  }
}