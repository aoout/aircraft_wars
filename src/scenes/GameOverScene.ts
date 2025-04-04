import Phaser from "phaser";

interface GameOverData {
  score: number;
  playerType: string;
  gameTime: number;
}

interface FontSizes {
  title: number;
  score: number;
  time: number;
  highScore: number;
  button: number;
}

export class GameOverScene extends Phaser.Scene {
  private finalScore!: number;
  private highScore!: number;
  private playerType!: string;
  private gameTime!: number;
  private activeTweens: Phaser.Tweens.Tween[] = [];
  private gamepad?: Phaser.Input.Gamepad.Gamepad;
  private aButtonCooldown = 0;

  constructor() {
    super("GameOverScene");
  }

  init(data: GameOverData) {
    this.highScore = Math.max(
      data.score,
      Number(localStorage.getItem("highScore") || "0")
    );
    localStorage.setItem("highScore", String(this.highScore));
    this.finalScore = data.score;
    this.playerType = data.playerType;
    this.gameTime = data.gameTime;
  }

  create() {
    const { centerX, centerY, width, height } = this.cameras.main;
    const layout = this.calculateLayout(width, height);
    
    this.createBackground(width, height);
    this.createStars(width, height);
    this.createPanel(centerX, centerY, layout);
    this.createUIElements(centerX, centerY, layout); // setupInputEvents 现在在 createUIElements 中调用
    this.initGamepad();
  }

  private calculateLayout(width: number, height: number) {
    const isMobile = width < 768;
    const scale = isMobile ? Math.min(width / 800, height / 600) : 1;
    
    return {
      fontSize: {
        title: Math.floor(48 * scale),
        score: Math.floor(32 * scale),
        time: Math.floor(28 * scale),
        highScore: Math.floor(24 * scale),
        button: Math.floor(28 * scale),
      },
      panel: {
        width: isMobile ? Math.min(500, width * 0.9) : 500,
        height: isMobile ? Math.min(400, height * 0.8) : 400,
      },
      scale: isMobile ? 1.5 : 2.0,
      button: {
        width: isMobile ? 140 : 160,
        height: isMobile ? 45 : 50,
      }
    };
  }

  private createBackground(width: number, height: number) {
    this.add.graphics()
      .fillGradientStyle(0x0a192f, 0x0a192f, 0x112240, 0x112240, 1)
      .fillRect(0, 0, width, height);
  }

  private createStars(width: number, height: number) {
    for (let i = 0; i < 100; i++) {
      const star = this.add.graphics()
        .fillStyle(0x64ffda, Phaser.Math.FloatBetween(0.3, 1))
        .fillCircle(
          Phaser.Math.Between(0, width),
          Phaser.Math.Between(0, height),
          Phaser.Math.Between(1, 3)
        );

      this.activeTweens.push(
        this.add.tween({
          targets: star,
          alpha: 0.1,
          y: `+=${Phaser.Math.Between(-15, 15)}`,
          duration: Phaser.Math.Between(2000, 4000),
          ease: "Sine.easeInOut",
          yoyo: true,
          repeat: -1,
        })
      );
    }
  }

  private createPanel(centerX: number, centerY: number, layout: ReturnType<typeof this.calculateLayout>) {
    const { width: panelWidth, height: panelHeight } = layout.panel;
    const panelX = centerX - panelWidth / 2;
    const panelY = centerY - panelHeight / 2;

    const panel = this.add.graphics()
      .fillStyle(0x0a192f, 0.6)
      .fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20)
      .lineStyle(2, 0x64ffda, 0.4)
      .strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20)
      .lineGradientStyle(2, 0x64ffda, 0x4d80e4, 0x805ad5, 0x805ad5, 0.8)
      .strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);

    return { panelX, panelY, panelWidth, panelHeight };
  }

  private createUIElements(centerX: number, centerY: number, layout: ReturnType<typeof this.calculateLayout>) {
    const { panelX, panelY, panelWidth, panelHeight } = this.createPanel(centerX, centerY, layout);
    const { fontSize } = layout;
  
    // Title
    const title = this.addText(centerX, panelY + panelHeight * 0.15, "游戏结束", {
      fontSize: fontSize.title,
      color: "#ffffff",
      stroke: "#1a75ff",
      strokeThickness: 6,
      shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 5, stroke: true, fill: true },
    });
  
    // Player sprite
    const playerSprite = this.add.image(
      centerX - panelWidth * 0.2,
      panelY + panelHeight * 0.4,
      this.playerType
    ).setScale(layout.scale);
    this.activeTweens.push(
      this.add.tween({
        targets: playerSprite,
        y: centerY - 20,
        duration: 1500,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      })
    );
  
    // Score and time - 调整坐标并确保可见
    const timeStr = this.formatTime(this.gameTime);
    const texts = [
      { x: panelX + panelWidth * 0.5, y: panelY + panelHeight * 0.3, text: `最终分数: ${this.finalScore}`, size: fontSize.score, color: "#64ffda" },
      { x: panelX + panelWidth * 0.5, y: panelY + panelHeight * 0.45, text: `游戏时长: ${timeStr}`, size: fontSize.time, color: "#64ffda" },
      { x: panelX + panelWidth * 0.5, y: panelY + panelHeight * 0.6, text: `历史最高分: ${this.highScore}`, size: fontSize.highScore, color: "#4d80e4" },
    ].map(t => {
      const textObj = this.addText(t.x, t.y, t.text, { fontSize: t.size, color: t.color }, 0, 0.5);
      textObj.setDepth(1); // 确保文本在面板之上
      return textObj;
    });
  
    // Button
    const button = this.createButton(centerX, panelY + panelHeight - layout.button.height - 20, layout);
    
    // Text animation
    this.activeTweens.push(
      this.add.tween({
        targets: [title, ...texts],
        y: "-=5",
        duration: 1500,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      })
    );
  
    // 调用输入事件设置
    this.setupInputEvents(button);
  }

  private addText(x: number, y: number, text: string, style: Partial<Phaser.Types.GameObjects.Text.TextStyle>, originX = 0.5, originY = originX) {
    return this.add.text(x, y, text, {
      fontFamily: "微软雅黑",
      fontSize: `${style.fontSize}px`,
      color: style.color,
      stroke: style.stroke,
      strokeThickness: style.strokeThickness || 3,
      shadow: style.shadow,
    }).setOrigin(originX, originY);
  }

  private createButton(centerX: number, y: number, layout: ReturnType<typeof this.calculateLayout>) {
    const { width, height } = layout.button;
    const x = centerX - width / 2;
    
    const bg = this.add.graphics();
    const text = this.addText(centerX, y + height / 2, "重新开始", { fontSize: layout.fontSize.button, color: "#ffffff" });
    const container = this.add.container(0, 0, [bg, text])
      .setInteractive(new Phaser.Geom.Rectangle(x, y, width, height), Phaser.Geom.Rectangle.Contains);
  
    const updateButtonStyle = (opacity: number, textColor: string) => {
      bg.clear()
        .fillStyle(0x64ffda, opacity)
        .fillRoundedRect(x, y, width, height, 10)
        .lineStyle(2, 0x64ffda, opacity === 0.2 ? 0.8 : 1)
        .strokeRoundedRect(x, y, width, height, 10);
      text.setStyle({ color: textColor });
    };
  
    updateButtonStyle(0.2, "#ffffff");
    container
      .on("pointerover", () => updateButtonStyle(0.4, "#64ffda"))
      .on("pointerout", () => updateButtonStyle(0.2, "#ffffff"))
      .on("pointerdown", () => this.restartGame());
  
    return { x, y, width, height }; // 确保返回所有必要属性
  }

  private formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  private setupInputEvents(button: { x: number; y: number; width: number; height: number }) {
    this.input.keyboard?.on("keydown-ENTER", () => this.restartGame());
    
    if (this.sys.game.device.input.touch) {
      this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        if (Phaser.Geom.Rectangle.Contains(
          new Phaser.Geom.Rectangle(button.x, button.y, button.width, button.height),
          pointer.x,
          pointer.y
        )) {
          this.restartGame();
        }
      });
    }
  }

  private initGamepad() {
    if (this.input.gamepad?.gamepads.length) {
      this.gamepad = this.input.gamepad.gamepads[0];
    }

    this.input.gamepad?.on("connected", (pad: Phaser.Input.Gamepad.Gamepad) => {
      if (!this.gamepad) {
        this.gamepad = pad;
      }
    }).on("disconnected", (pad: Phaser.Input.Gamepad.Gamepad) => {
      if (this.gamepad === pad) {
        this.gamepad = undefined;
      }
    });
  }

  private restartGame() {
    this.activeTweens.forEach(tween => tween.stop().remove());
    this.activeTweens = [];
    this.scene.start("PreloadScene");
  }

  update() {
    if (this.gamepad?.B && this.aButtonCooldown <= 0) {
      this.restartGame();
      this.aButtonCooldown = 20;
    } else if (!this.gamepad?.A && this.aButtonCooldown > 0) {
      this.aButtonCooldown--;
    }
  }
}