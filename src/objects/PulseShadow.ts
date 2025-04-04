// src/objects/PulseShadow.ts
import Phaser from "phaser";
import { Bullet } from "./Bullet";
import { Player } from "./Player";
import { Enemy } from "./Enemy";
import { GuidedMissile } from "./GuidedMissile";

export class PulseShadow extends Player {
  name: string = "pulseshadow";

  // 引导线相关属性
  guideLine?: Phaser.GameObjects.Graphics;
  guideLineLength: number = 500;
  targetedEnemy?: Enemy;
  targetLockTime: number = 0;
  baseTargetLockDuration: number = 300; // 0.3秒锁定时间
  targetLockDuration: number = 300;

  // 引导线倾斜相关属性
  private currentTiltAngle: number = 0; // 当前倾斜角度
  private targetTiltAngle: number = 0; // 目标倾斜角度
  private readonly maxTiltAngle: number = 0.6; // 最大倾斜角度（弧度）
  private readonly tiltSpeed: number = 0.1; // 倾斜速度
  private readonly returnSpeed: number = 0.005; // 回正速度

  updateStats(score: number): void {
    const multiplier = 1 + Math.min(score / 250, 1);
    this.moveSpeed = this.baseMoveSpeed * multiplier;
    this.targetLockDuration = this.baseTargetLockDuration / multiplier;
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "pulseshadow");
    
    // 创建引导线
    this.guideLine = this.scene.add.graphics();
    this.guideLine.setDepth(1);
  }

  // 重写shoot方法，不再使用
  shoot(): Bullet | void {
    return;
  }

  // 发射导弹攻击目标
  launchMissile(target: Enemy): void {
    const missile = new GuidedMissile(this.scene, this.x, this.y - 20, target);
    this.bullets.push(missile);
    this.lastShootTime = Date.now();
  }

  // 更新引导线
  updateGuideLine(): void {
    if (!this.guideLine) return;
    
    // 根据移动速度更新目标倾斜角度
    const velocityX = this.body?.velocity?.x ?? 0;
    this.targetTiltAngle = (velocityX / this.moveSpeed) * this.maxTiltAngle;

    // 平滑过渡当前倾斜角度
    if (Math.abs(velocityX) > 0.1) {
      this.currentTiltAngle += (this.targetTiltAngle - this.currentTiltAngle) * this.tiltSpeed;
    } else {
      this.currentTiltAngle += (0 - this.currentTiltAngle) * this.returnSpeed;
    }
    
    this.guideLine.clear();
    
    // 绘制渐变引导线
    const segments = 20; // 分段数，用于渐变效果
    const baseAlpha = 0.4; // 基础透明度
    const baseWidth = 1.5; // 基础线宽
    
    // 计算直线的起点和终点
    const startX = this.x;
    const startY = this.y;
    const endX = this.x + Math.sin(this.currentTiltAngle) * this.guideLineLength;
    const endY = this.y - this.guideLineLength;
    
    // 绘制渐变直线
    for (let i = 0; i < segments; i++) {
      const progress = i / segments;
      const alpha = baseAlpha * (1 - progress); // 透明度从下到上渐变
      const width = baseWidth * (1 - progress * 0.5); // 线宽从下到上略微变细
      
      const currentX = startX + (endX - startX) * progress;
      const currentY = startY + (endY - startY) * progress;
      const nextX = startX + (endX - startX) * ((i + 1) / segments);
      const nextY = startY + (endY - startY) * ((i + 1) / segments);
      
      this.guideLine.lineStyle(width, 0xffff00, alpha);
      this.guideLine.beginPath();
      this.guideLine.moveTo(currentX, currentY);
      this.guideLine.lineTo(nextX, nextY);
      this.guideLine.strokePath();
    }
  }

  // 检测引导线与敌人的碰撞
  checkGuideLineCollision(enemies: Enemy[]): void {
    // 重置目标，如果当前目标不在引导线上
    let foundTarget = false;
    const currentTime = Date.now();
    
    for (const enemy of enemies) {
      // 计算敌人在倾斜引导线上的相对位置
      const relativeY = this.y - enemy.y;
      const expectedX = this.x + Math.sin(this.currentTiltAngle) * relativeY;
      
      // 检查敌人是否在倾斜的引导线上
      if (Math.abs(enemy.x - expectedX) < 20 && 
          enemy.y < this.y && 
          enemy.y > this.y - this.guideLineLength) {
        
        // 如果是新目标，重置锁定时间
        if (this.targetedEnemy !== enemy) {
          this.targetedEnemy = enemy;
          this.targetLockTime = currentTime;
        } else {
          // 如果锁定时间达到要求，发射导弹
          if (currentTime - this.targetLockTime >= this.targetLockDuration && 
              currentTime - this.lastShootTime >= this.shootDelay) {
            this.launchMissile(enemy);
          }
        }
        
        foundTarget = true;
        break;
      }
    }
    
    // 如果没有找到目标，清除当前目标
    if (!foundTarget) {
      this.targetedEnemy = undefined;
    }
    
    // 如果有目标，在引导线上标记目标（使用光晕效果）
    if (this.targetedEnemy && this.guideLine) {
      const targetY = this.targetedEnemy.y;
      // 计算敌人在倾斜引导线上的相对位置
      const relativeY = this.y - targetY;
      const targetX = this.x + Math.sin(this.currentTiltAngle) * relativeY;
      
      // 绘制外圈光晕
      this.guideLine.lineStyle(2, 0xff0000, 0.2);
      this.guideLine.strokeCircle(targetX, targetY, 15);
      // 绘制内圈
      this.guideLine.lineStyle(1.5, 0xff0000, 0.4);
      this.guideLine.strokeCircle(targetX, targetY, 10);
      // 绘制中心点
      this.guideLine.lineStyle(1, 0xff0000, 0.6);
      this.guideLine.strokeCircle(targetX, targetY, 5);
    }
  }



  update(): void {
    super.update();
    
    this.updateGuideLine();
    
    // 获取场景中的敌人列表
    const gameScene = this.scene as any;
    if (gameScene.enemies && Array.isArray(gameScene.enemies)) {
      this.checkGuideLineCollision(gameScene.enemies);
    }
    
    this.bullets.slice().forEach(bullet => bullet.update());
  }
}
