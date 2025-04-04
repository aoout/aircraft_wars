import Phaser from "phaser";
import { GameScene } from "../scenes/GameScene";

export abstract class Object extends Phaser.Physics.Matter.Sprite {
  abstract type: string;
  constructor(scene: Phaser.Scene, x: number, y: number, name: string) {
    super(scene.matter.world, x, y, name);
    scene.add.existing(this);

    this.setFixedRotation();
    this.setBounce(0);
    this.setFriction(0);
    this.setMass(1);
    this.setFrictionAir(0);
    this.setSensor(true);
  }

  takeDamage(): void {
    this.destroy();
  }

  destroy(): void {
    this.remove();
  }

  remove(): void {
    if (GameScene.gameOver) return;
    this.scene.events.emit(`${this.type}_Destroyed`, this);
    super.destroy();
  }
}
