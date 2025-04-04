import Phaser from "phaser";

interface PlayerInfo {
  sprite: string;
  name: string;
  description: string;
}
export class SelectPlayerScene extends Phaser.Scene {
  private selectedIndex: number = 0;
  private playerSprites: Phaser.GameObjects.Sprite[] = [];
  private playerCards: Phaser.GameObjects.Container[] = [];
  private playerInfoTexts: Phaser.GameObjects.Text[] = [];
  private selectButton!: Phaser.GameObjects.Container;
  private titleText!: Phaser.GameObjects.Text;
  private backgroundPanel!: Phaser.GameObjects.Graphics;
  private players: PlayerInfo[] = [];
  private tweenList: Phaser.Tweens.Tween[] = [];
  private isFirstStart: boolean = true;
  private gamepad?: Phaser.Input.Gamepad.Gamepad; // 添加手柄引用
  private axesCooldown: number = 0;
  private aButtonCooldown: number = 0;
  private bButtonCooldown: number = 0;

  constructor() {
    super("SelectPlayerScene");
    this.dragStartX = 0;
    this.dragDistance = 0;
    this.isDragging = false;
  }

  private dragStartX: number;
  private dragDistance: number;
  private isDragging: boolean;

  create() {
    this.playerCards = [];
    this.tweenList = [];
    this.isFirstStart = true;

    // 添加触摸滑动事件监听
    this.input.on("pointerdown", this.onDragStart, this);
    this.input.on("pointermove", this.onDrag, this);
    this.input.on("pointerup", this.onDragEnd, this);
    this.input.on("pointerout", this.onDragEnd, this);

    const { centerX, centerY } = this.cameras.main;
    const { width, height } = this.cameras.main;

    // 创建背景面板
    this.createBackground(width, height);

    // 创建标题
    this.createTitle(centerX, centerY);

    // 获取玩家解锁信息
    const savedHighScore = localStorage.getItem("highScore");
    const highScore = savedHighScore ? parseInt(savedHighScore) : 0;

    // 定义玩家信息
    this.players = [
      {
        sprite: "azurefirstcry",
        name: "Azure First Cry",
        description: "平衡型战机，具有中等速度和火力。",
      },
      {
        sprite: "ripplepropeller",
        name: "Ripple Propeller",
        description: "高速战机，拥有出色的机动性和加速度。",
      },
    ];

    if (highScore >= 500) {
      this.players.push({
        sprite: "pulseshadow",
        name: "Pulse Shadow",
        description: "高级战机，配备先进的导弹锁定系统。",
      });
    }

    // 创建玩家选择卡片
    this.createPlayerCards(centerX, centerY);

    // 创建选择按钮
    this.createSelectButton(centerX, centerY + 220);

    // 创建导航按钮
    this.createNavigationButtons(centerX, centerY);

    // 初始选中第一个战机
    this.selectPlayer(0);

    // 添加键盘控制
    this.addKeyboardControl();
    this.addControlerControl();
  }

  private createBackground(width: number, height: number) {
    // 创建深邃的背景渐变
    this.backgroundPanel = this.add.graphics();
    this.backgroundPanel.fillGradientStyle(
      0x0a192f,
      0x0a192f,
      0x112240,
      0x112240,
      1
    );
    this.backgroundPanel.fillRect(0, 0, width, height);

    // 创建动态网格
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x4a5568, 0.2);
    const gridSize = 50;
    for (let x = 0; x <= width; x += gridSize) {
      gridGraphics.moveTo(x, 0);
      gridGraphics.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      gridGraphics.moveTo(0, y);
      gridGraphics.lineTo(width, y);
    }
    gridGraphics.strokePath();

    // 添加星星背景
    for (let i = 0; i < 150; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 4);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);

      const star = this.add.graphics();
      star.fillStyle(0x64ffda, alpha);
      star.fillCircle(x, y, size);

      // 添加星星闪烁和移动动画
      this.tweenList.push(
        this.add.tween({
          targets: star,
          alpha: { from: alpha, to: 0.1 },
          y: { from: y, to: y + Phaser.Math.Between(-20, 20) },
          duration: Phaser.Math.Between(2000, 5000),
          ease: "Sine.easeInOut",
          yoyo: true,
          repeat: -1,
        })
      );
    }

    // 添加光晕效果
    const glowGraphics = this.add.graphics();
    glowGraphics.lineGradientStyle(
      100,
      0x4a5568,
      0x2d3748,
      0x1a202c,
      0x1a202c,
      0.3
    );
    glowGraphics.fillRect(0, 0, width, height);
    glowGraphics.setBlendMode(Phaser.BlendModes.OVERLAY);
  }

  private createTitle(centerX: number, centerY: number) {
    // 创建标题文本
    this.titleText = this.add
      .text(centerX, centerY - 200, "选择战机", {
        fontFamily: "微软雅黑",
        fontSize: "48px",
        color: "#ffffff",
        stroke: "#1a75ff",
        strokeThickness: 6,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000",
          blur: 5,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5);

    // 添加标题动画
    this.tweenList.push(
      this.add.tween({
        targets: this.titleText,
        y: centerY - 210,
        duration: 1500,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      })
    );
  }

  private createPlayerCards(centerX: number, centerY: number) {
    const cardWidth = 280;
    const cardHeight = 320;
    const cardSpacing = 350;

    this.players.forEach((player, index) => {
      // 计算卡片位置
      const x = centerX + (index - 1) * cardSpacing;

      // 创建卡片容器
      const card = this.add.container(x, centerY);
      this.playerCards.push(card);

      // 创建玻璃态背景效果
      const cardBg = this.add.graphics();
      // 主背景
      cardBg.fillStyle(0x0a192f, 0.6);
      cardBg.fillRoundedRect(
        -cardWidth / 2,
        -cardHeight / 2,
        cardWidth,
        cardHeight,
        20
      );
      // 内发光效果
      cardBg.lineStyle(2, 0x64ffda, 0.4);
      cardBg.strokeRoundedRect(
        -cardWidth / 2,
        -cardHeight / 2,
        cardWidth,
        cardHeight,
        20
      );
      // 渐变边框
      cardBg.lineGradientStyle(2, 0x64ffda, 0x4d80e4, 0x805ad5, 0x805ad5, 0.8);
      cardBg.strokeRoundedRect(
        -cardWidth / 2,
        -cardHeight / 2,
        cardWidth,
        cardHeight,
        20
      );
      card.add(cardBg);

      // 创建战机精灵
      const sprite = this.add.sprite(0, -60, player.sprite).setScale(2);
      this.playerSprites.push(sprite);
      card.add(sprite);

      // 创建战机名称
      const nameText = this.add
        .text(0, 40, player.name, {
          fontFamily: "微软雅黑",
          fontSize: "28px",
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5);
      card.add(nameText);

      // 创建战机描述
      const descText = this.add
        .text(0, 90, player.description, {
          fontFamily: "微软雅黑",
          fontSize: "16px",
          color: "#cccccc",
          align: "center",
          wordWrap: { width: cardWidth - 40 },
        })
        .setOrigin(0.5);
      card.add(descText);

      // 添加信息文本引用
      this.playerInfoTexts.push(descText);

      // 设置卡片为交互式
      cardBg.setInteractive(
        new Phaser.Geom.Rectangle(
          -cardWidth / 2,
          -cardHeight / 2,
          cardWidth,
          cardHeight
        ),
        Phaser.Geom.Rectangle.Contains
      );

      // 添加卡片悬停效果
      cardBg.on("pointerover", () => {
        if (this.selectedIndex !== index) {
          this.add.tween({
            targets: card,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 200,
            ease: "Power1",
          });
        }
      });

      cardBg.on("pointerout", () => {
        if (this.selectedIndex !== index) {
          this.add.tween({
            targets: card,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: "Power1",
          });
        }
      });

      // 添加点击选择效果
      cardBg.on("pointerdown", () => {
        this.selectPlayer(index);
      });

      // 添加战机旋转动画
      this.tweenList.push(
        this.add.tween({
          targets: sprite,
          y: { from: -60, to: -50 },
          duration: 2000,
          ease: "Sine.easeInOut",
          yoyo: true,
          repeat: -1,
        })
      );
    });
  }

  private createSelectButton(x: number, y: number) {
    // 创建按钮容器
    this.selectButton = this.add.container(x, y);

    // 创建现代风格按钮
    const buttonBg = this.add.graphics();
    // 主体背景
    buttonBg.fillStyle(0x112240, 0.9);
    buttonBg.fillRoundedRect(-120, -30, 240, 60, 30);
    // 内发光
    buttonBg.lineStyle(2, 0x64ffda, 0.4);
    buttonBg.strokeRoundedRect(-120, -30, 240, 60, 30);
    // 渐变边框
    buttonBg.lineGradientStyle(2, 0x64ffda, 0x64ffda, 0x4d80e4, 0x4d80e4, 0.8);
    buttonBg.strokeRoundedRect(-120, -30, 240, 60, 30);
    this.selectButton.add(buttonBg);

    // 创建按钮文本
    const buttonText = this.add
      .text(0, 0, "选择战机", {
        fontFamily: "微软雅黑",
        fontSize: "28px",
        color: "#64ffda",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5);
    this.selectButton.add(buttonText);

    // 设置按钮为交互式
    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(-100, -25, 200, 50),
      Phaser.Geom.Rectangle.Contains
    );

    // 添加按钮悬停效果
    buttonBg.on("pointerover", () => {
      this.add.tween({
        targets: this.selectButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
      buttonBg.clear();
      buttonBg.fillStyle(0x66ccff, 1);
      buttonBg.fillRoundedRect(-100, -25, 200, 50, 25);
      buttonBg.lineStyle(2, 0x99eeff, 1);
      buttonBg.strokeRoundedRect(-100, -25, 200, 50, 25);
    });

    buttonBg.on("pointerout", () => {
      this.add.tween({
        targets: this.selectButton,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
      buttonBg.clear();
      buttonBg.fillStyle(0x4d80e4, 1);
      buttonBg.fillRoundedRect(-100, -25, 200, 50, 25);
      buttonBg.lineStyle(2, 0x66ccff, 1);
      buttonBg.strokeRoundedRect(-100, -25, 200, 50, 25);
    });

    // 添加按钮点击效果
    buttonBg.on("pointerdown", () => {
      // 添加点击动画
      this.add.tween({
        targets: this.selectButton,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: () => {
          // 添加场景过渡动画
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once("camerafadeoutcomplete", () => {
            // 启动游戏场景
            this.scene.start("GameScene", {
              playerType: this.players[this.selectedIndex].sprite,
            });
          });
        },
      });
    });

    // 添加按钮脉动动画
    this.tweenList.push(
      this.add.tween({
        targets: buttonBg,
        alpha: { from: 1, to: 0.8 },
        duration: 1000,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      })
    );
  }

  private createNavigationButtons(centerX: number, centerY: number) {
    if (this.players.length <= 1) return;

    // 创建左箭头
    const leftArrow = this.add.graphics();
    leftArrow.fillStyle(0xffffff, 0.8);
    leftArrow.fillTriangle(-15, 0, 0, -15, 0, 15);
    leftArrow.setPosition(centerX - 200, centerY);
    leftArrow.setInteractive(
      new Phaser.Geom.Rectangle(-15, -15, 15, 30),
      Phaser.Geom.Rectangle.Contains
    );

    // 创建右箭头
    const rightArrow = this.add.graphics();
    rightArrow.fillStyle(0xffffff, 0.8);
    rightArrow.fillTriangle(15, 0, 0, -15, 0, 15);
    rightArrow.setPosition(centerX + 200, centerY);
    rightArrow.setInteractive(
      new Phaser.Geom.Rectangle(0, -15, 15, 30),
      Phaser.Geom.Rectangle.Contains
    );

    // 添加箭头悬停效果
    leftArrow.on("pointerover", () => {
      leftArrow.clear();
      leftArrow.fillStyle(0x66ccff, 1);
      leftArrow.fillTriangle(-15, 0, 0, -15, 0, 15);
    });

    leftArrow.on("pointerout", () => {
      leftArrow.clear();
      leftArrow.fillStyle(0xffffff, 0.8);
      leftArrow.fillTriangle(-15, 0, 0, -15, 0, 15);
    });

    rightArrow.on("pointerover", () => {
      rightArrow.clear();
      rightArrow.fillStyle(0x66ccff, 1);
      rightArrow.fillTriangle(15, 0, 0, -15, 0, 15);
    });

    rightArrow.on("pointerout", () => {
      rightArrow.clear();
      rightArrow.fillStyle(0xffffff, 0.8);
      rightArrow.fillTriangle(15, 0, 0, -15, 0, 15);
    });

    // 添加箭头点击效果
    leftArrow.on("pointerdown", () => {
      const newIndex =
        (this.selectedIndex - 1 + this.players.length) % this.players.length;
      this.selectPlayer(newIndex, "left");
    });

    rightArrow.on("pointerdown", () => {
      const newIndex = (this.selectedIndex + 1) % this.players.length;
      this.selectPlayer(newIndex, "right");
    });

    // 添加箭头脉动动画
    this.tweenList.push(
      this.add.tween({
        targets: [leftArrow, rightArrow],
        alpha: { from: 0.8, to: 0.4 },
        duration: 800,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      })
    );
  }

  private selectPlayer(
    index: number,
    direction: "left" | "right" | null = null
  ) {
    this.selectedIndex = index;

    // 更新所有卡片的位置和缩放
    const { centerX } = this.cameras.main;
    const cardSpacing = 350;

    this.playerCards.forEach((card, i) => {
      // 计算目标位置
      const targetX = centerX + (i - this.selectedIndex) * cardSpacing;

      // 添加移动动画
      this.add.tween({
        targets: card,
        x: targetX,
        scaleX: i === this.selectedIndex ? 1.1 : 0.9,
        scaleY: i === this.selectedIndex ? 1.1 : 0.9,
        alpha: i === this.selectedIndex ? 1 : 0.7,
        duration: 300,
        ease: "Power2",
      });

      // 更新深度，使选中的卡片显示在最上层
      card.setDepth(i === this.selectedIndex ? 10 : 1);
    });

    // 为选中的战机添加特殊动画
    if (this.playerSprites[this.selectedIndex]) {
      // 添加旋转动画
      this.add.tween({
        targets: this.playerSprites[this.selectedIndex],
        angle: { from: -5, to: 5 },
        duration: 1000,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });

      // 添加光晕效果
      const selectedCard = this.playerCards[this.selectedIndex];
      const glow = this.add.graphics();
      glow.fillStyle(0x4d80e4, 0.3);
      glow.fillCircle(0, -60, 60);
      selectedCard.add(glow);
      selectedCard.sendToBack(glow);

      // 添加光晕动画
      this.add.tween({
        targets: glow,
        alpha: { from: 0.3, to: 0.6 },
        scale: { from: 1, to: 1.2 },
        duration: 1500,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private onDragStart(pointer: Phaser.Input.Pointer): void {
    this.isDragging = true;
    this.dragStartX = pointer.x;
    this.dragDistance = 0;
  }

  private onDrag(pointer: Phaser.Input.Pointer): void {
    if (!this.isDragging) return;

    this.dragDistance = pointer.x - this.dragStartX;

    // 实时更新卡片位置，创建拖动效果
    const { centerX } = this.cameras.main;
    const cardSpacing = 350;

    this.playerCards.forEach((card, i) => {
      const baseX = centerX + (i - this.selectedIndex) * cardSpacing;
      card.setX(baseX + this.dragDistance);
    });
  }

  private onDragEnd(pointer: Phaser.Input.Pointer): void {
    if (!this.isDragging) return;

    this.isDragging = false;

    // 根据滑动距离判断是否切换战机
    const threshold = 100; // 切换阈值

    if (Math.abs(this.dragDistance) > threshold) {
      if (this.dragDistance > 0) {
        // 向右滑动，选择上一个
        const newIndex =
          (this.selectedIndex - 1 + this.players.length) % this.players.length;
        this.selectPlayer(newIndex, "left");
      } else {
        // 向左滑动，选择下一个
        const newIndex = (this.selectedIndex + 1) % this.players.length;
        this.selectPlayer(newIndex, "right");
      }
    } else {
      // 滑动距离不够，恢复原位
      this.selectPlayer(this.selectedIndex);
    }
  }

  private addKeyboardControl() {
    // 添加键盘左右控制
    this.input.keyboard?.on("keydown-LEFT", () => {
      const newIndex =
        (this.selectedIndex - 1 + this.players.length) % this.players.length;
      this.selectPlayer(newIndex, "left");
    });

    this.input.keyboard?.on("keydown-RIGHT", () => {
      const newIndex = (this.selectedIndex + 1) % this.players.length;
      this.selectPlayer(newIndex, "right");
    });

    // 添加WASD控制
    this.input.keyboard?.on("keydown-A", () => {
      const newIndex =
        (this.selectedIndex - 1 + this.players.length) % this.players.length;
      this.selectPlayer(newIndex, "left");
    });

    this.input.keyboard?.on("keydown-D", () => {
      const newIndex = (this.selectedIndex + 1) % this.players.length;
      this.selectPlayer(newIndex, "right");
    });

    // 添加键盘确认选择
    this.input.keyboard?.on("keydown-ENTER", () => {
      // 模拟点击选择按钮的完整点击流程
      const buttonBg = this.selectButton.list[0] as Phaser.GameObjects.Graphics;
      buttonBg.emit("pointerdown");
    });
  }

  private addControlerControl() {
    // 添加手柄控制
    this.input.gamepad?.on("connected", (pad: Phaser.Input.Gamepad.Gamepad) => {
      this.gamepad = pad;
    });
    // 监听手柄断开事件
    this.input.gamepad?.on("disconnected", () => {
      this.gamepad = undefined;
    });
    this.events.on("update", this.handleGamepadInput, this);
  }

  private handleGamepadInput() {
    if (!this.gamepad) return;

    // 左摇杆或方向键左右切换战机
    const leftStickX = this.gamepad.leftStick.x; // -1 到 1
    const dPadLeft = this.gamepad.left; // 方向键左
    const dPadRight = this.gamepad.right; // 方向键右

    if (this.axesCooldown <= 0) {
      if (leftStickX < -0.5 || dPadLeft) {
        const newIndex =
          (this.selectedIndex - 1 + this.players.length) % this.players.length;
        this.selectPlayer(newIndex, "left");
        this.axesCooldown = 20; // 冷却帧数，约0.33秒（假设60fps）
      } else if (leftStickX > 0.5 || dPadRight) {
        const newIndex = (this.selectedIndex + 1) % this.players.length;
        this.selectPlayer(newIndex, "right");
        this.axesCooldown = 20;
      }
    } else {
      this.axesCooldown--;
    }

    // A 按钮确认选择
    if (this.gamepad.A && this.aButtonCooldown <= 0) {
      const buttonBg = this.selectButton.list[0] as Phaser.GameObjects.Graphics;
      buttonBg.emit("pointerdown"); // 模拟点击选择按钮
      this.aButtonCooldown = 20; // 防止连续触发
    } else if (!this.gamepad.A && this.aButtonCooldown > 0) {
      this.aButtonCooldown--;
    }

    // 可选：B 按钮返回（如果需要）
    if (this.gamepad.B && this.bButtonCooldown <= 0) {
      this.bButtonCooldown = 20;
    } else if (!this.gamepad.B && this.bButtonCooldown > 0) {
      this.bButtonCooldown--;
    }
  }
}
