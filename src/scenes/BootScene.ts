import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    console.log("Game is booting...");

    this.scene.start("PreloadScene");
  }
}
