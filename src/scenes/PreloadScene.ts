import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload(): void {
    this.load.image("azurefirstcry", "assets/AzureFirstCry.png");
    this.load.image("ripplepropeller", "assets/RipplePropeller.png");
    this.load.image("pulseshadow", "assets/PulseShadow.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.image("vanguard", "assets/Vanguard.png");
    this.load.image("meteorfighter", "assets/MeteorFighter.png");
    this.load.image("arcshooter", "assets/ArcShooter.png");
    this.load.image("beamveilguardian", "assets/BeamveilGuardian.png");
    this.load.image("upshooter", "assets/UpShooter.png");
    this.load.image("ammocarrier", "assets/AmmoCarrier.png");
    this.load.image("dronebot", "assets/DroneBot.png");
    this.load.svg('explosion', 'assets/explosion.svg');
  }

  create(): void {
    // 检查历史最高分
    const savedHighScore = localStorage.getItem('highScore');
    const highScore = savedHighScore ? parseInt(savedHighScore) : 0;

    // 根据历史最高分决定进入选择页面还是直接进入游戏
    if (highScore >= 200) {
      this.scene.start("SelectPlayerScene");
    } else {
      this.scene.start("GameScene", { playerType: "azurefirstcry" });
    }
  }
}
