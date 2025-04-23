import Phaser from "phaser";
import { Bullet } from "./Bullet";
import { Enemy } from "./Enemy";

export class BeamveilGuardian extends Enemy {
  name = "beamveilguardian";
  moveSpeed = 1.5;

  shootDelay: number = 1200;
  bulletSpeed: number = 3;
  lastShootTime: number = 0;

  laserDelay = 1500;
  lastLaserTime = 0;
  health = 2;
  detectionRadius = 100;

  detectionCircle = this.scene.add.circle(this.x, this.y, this.detectionRadius, 0x00ffff, 0.1)
    .setStrokeStyle(2, 0x00ffff, 0.5)
    .setDepth(-1);

  activeLaser: { laser: Phaser.GameObjects.Rectangle; laserBody: MatterJS.BodyType; timer: Phaser.Time.TimerEvent } | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "beamveilguardian");
  }

  emitLaser(): void {
    if (this.scene.time.now - this.lastLaserTime < this.laserDelay || !this.active || this.activeLaser) return;

    const playerBullets = (this.scene as any).player?.bullets || [];
    const targetBullet = playerBullets.find((bullet: Bullet) =>
      Phaser.Math.Distance.Between(this.x, this.y, bullet.x, bullet.y) <= this.detectionRadius
    );

    if (!targetBullet) return;

    const distance = Phaser.Math.Distance.Between(this.x, this.y, targetBullet.x, targetBullet.y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetBullet.x, targetBullet.y);

    const laser = this.scene.add.rectangle(this.x, this.y, 4, distance, 0x00ffff)
      .setOrigin(0, 0)
      .setAngle(Phaser.Math.RadToDeg(angle));

    const laserBody = this.scene.matter.add.rectangle(
      (this.x + targetBullet.x) / 2,
      (this.y + targetBullet.y) / 2,
      4,
      distance,
      { isStatic: true, label: "laser", angle }
    );

    targetBullet.destroy();
    this.activeLaser = {
      laser,
      laserBody,
      timer: this.scene.time.delayedCall(100, () => {
        laser.destroy();
        this.scene.matter.world.remove(laserBody);
        this.activeLaser = null;
      })
    };

    this.lastLaserTime = this.scene.time.now;
    this.scene.events.emit("enemyLaser", laser);
  }

  update(): void {
    this.emitLaser();
    this.detectionCircle?.setPosition(this.x, this.y);
    super.update();
  }

  remove(): void {
    this.activeLaser?.laser.destroy();
    this.activeLaser?.timer.remove();
    this.activeLaser = null;

    this.detectionCircle?.destroy();

    super.remove();
  }
}