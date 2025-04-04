import Phaser from "phaser";
import { Bullet } from "./Bullet";
import { Emitter } from "./Emitter";

export abstract class Player extends Emitter {
  type: string = "player";
  baseMoveSpeed: number = 5;
  moveSpeed: number = this.baseMoveSpeed;

  bullets: Bullet[] = [];
  baseShootDelay: number = 600;
  shootDelay: number = this.baseShootDelay;
  bulletSpeed: number = -5;
  lastShootTime: number = 0;

  hasShield: boolean = false;
  shieldGraphics?: Phaser.GameObjects.Graphics;

  gamepad?: Phaser.Input.Gamepad.Gamepad;
  isDragging: boolean = false;

  abstract updateStats(score: number): void;

  constructor(scene: Phaser.Scene, x: number, y: number, name: string) {
    super(scene, x, y, name);

    this.setData("type", "player");
    this.shieldGraphics = this.scene.add.graphics();
    this.shieldGraphics.setDepth(1);
    this.shieldGraphics.lineStyle(2, 0x00ffff);
    this.shieldGraphics.fillStyle(0x00ffff, 0.2);
    this.shieldGraphics.setVisible(false);

    this.setInteractive();
    this.scene.input.on("pointerdown", this.onDragStart, this);
    this.scene.input.on("pointermove", this.onDrag, this);
    this.scene.input.on("pointerup", this.onDragEnd, this);

    this.initGamepad();
  }

  initGamepad() {
    if (
      this.scene.input.gamepad &&
      this.scene.input.gamepad.gamepads.length > 0
    ) {
      this.gamepad = this.scene.input.gamepad.gamepads[0]; // 默认使用第一个手柄
    }

    this.scene.input.gamepad &&
      this.scene.input.gamepad.on(
        "connected",
        (pad: Phaser.Input.Gamepad.Gamepad) => {
          if (!this.gamepad) {
            // 只绑定第一个手柄
            this.gamepad = pad;
          }
        }
      );

    this.scene.input.gamepad &&
      this.scene.input.gamepad.on(
        "disconnected",
        (pad: Phaser.Input.Gamepad.Gamepad) => {
          if (this.gamepad === pad) {
            this.gamepad = undefined;
          }
        }
      );
  }

  shoot(): Bullet | void {
    const bullet = super.shoot();
    if (bullet) this.bullets.push(bullet);
  }

  addShield(): void {
    this.hasShield = true;
    if (this.shieldGraphics) {
      this.shieldGraphics.clear();
      this.shieldGraphics.lineStyle(2, 0x00ffff);
      this.shieldGraphics.fillStyle(0x00ffff, 0.2);
      this.shieldGraphics.strokeCircle(this.x, this.y, 40);
      this.shieldGraphics.fillCircle(this.x, this.y, 40);
      this.shieldGraphics.setVisible(true);
    }
  }

  removeShield(): void {
    this.hasShield = false;
    if (this.shieldGraphics) {
      this.shieldGraphics.clear();
      this.shieldGraphics.setVisible(false);
    }
  }

  updateShield(): void {
    if (this.hasShield && this.shieldGraphics) {
      this.shieldGraphics.clear();
      this.shieldGraphics.lineStyle(2, 0x00ffff);
      this.shieldGraphics.fillStyle(0x00ffff, 0.2);
      this.shieldGraphics.strokeCircle(this.x, this.y, 40);
      this.shieldGraphics.fillCircle(this.x, this.y, 40);
    }
  }

  updateSpeed(keyboard: Phaser.Input.Keyboard.KeyboardPlugin): void {
    let velocityX = 0;
    let velocityY = 0;

    if (keyboard.addKey("A").isDown) {
      velocityX = -this.moveSpeed;
    } else if (keyboard.addKey("D").isDown) {
      velocityX = this.moveSpeed;
    }

    if (keyboard.addKey("W").isDown) {
      velocityY = -this.moveSpeed;
    } else if (keyboard.addKey("S").isDown) {
      velocityY = this.moveSpeed;
    }

    if (!this.isDragging && !this.gamepad) {
      this.setVelocity(velocityX, velocityY);
    }
  }

  updateGamepadSpeed(): void {
    if (!this.gamepad || this.isDragging) return;

    const leftStickX = this.gamepad.leftStick.x; // -1 到 1
    const leftStickY = this.gamepad.leftStick.y; // -1 到 1

    const deadZone = 0.1;

    let velocityX = 0;
    let velocityY = 0;

    if (Math.abs(leftStickX) > deadZone) {
      velocityX = leftStickX * this.moveSpeed;
    }
    if (Math.abs(leftStickY) > deadZone) {
      velocityY = leftStickY * this.moveSpeed;
    }

    this.setVelocity(velocityX, velocityY);
  }

  clampPosition(): void {
    this.x = Phaser.Math.Clamp(
      this.x,
      0 + this.width / 2,
      this.scene.game.canvas.width - this.width / 2
    );
    this.y = Phaser.Math.Clamp(
      this.y,
      0 + this.height / 2,
      this.scene.game.canvas.height - this.height / 2
    );
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
      const velocityX = (dirX / distance) * this.moveSpeed;
      const velocityY = (dirY / distance) * this.moveSpeed;
      this.setVelocity(velocityX, velocityY);
    } else {
      this.setVelocity(0, 0);
    }
  }

  onDragEnd(): void {
    this.isDragging = false;
    this.setVelocity(0, 0);
  }

  update(): void {
    const keyboard = this.scene.input.keyboard;
    if (!keyboard) return;

    this.updateShield();

    this.updateSpeed(keyboard);

    this.updateGamepadSpeed();

    this.clampPosition();

    this.shoot();
  }

  removeBullet(bullet: Bullet): void {
    const index = this.bullets.indexOf(bullet);
    if (index > -1) {
      this.bullets.splice(index, 1);
    }
  }

  takeDamage(): void {
    if (this.hasShield) {
      this.removeShield();
    } else {
      this.destroy();
    }
  }
}
