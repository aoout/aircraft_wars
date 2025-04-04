// src/scenes/GameScene.ts
import Phaser from "phaser";
import { Player } from "../objects/Player";
import { Enemy } from "../objects/Enemy";
import { Bullet } from "../objects/Bullet";
import { Object } from "../objects/Object";
import { Vanguard } from "../objects/Vanguard";
import { MeteorFighter } from "../objects/MeteorFighter";
import { ArcShooter } from "../objects/ArcShooter";
import { BeamveilGuardian } from "../objects/BeamveilGuardian";
import { AzureFirstCry } from "../objects/AzureFirstCry";
import { RipplePropeller } from "../objects/RipplePropeller";
import { PulseShadow } from "../objects/PulseShadow";
import { UpShooter } from "../objects/UpShooter";
import { AmmoCarrier } from "../objects/AmmoCarrier";

export class GameScene extends Phaser.Scene {
  player!: Player;
  enemies: Enemy[] = [];
  enemies_bullets: Bullet[] = [];
  spawnTimer: number = 0;
  spawnInterval: number = 2000;
  baseSpawnInterval: number = 2000;
  minSpawnInterval: number = 450;
  gameTime: number = 0;
  score: number = 0;
  scoreText!: Phaser.GameObjects.Text;
  lastEnemyPassTime: number = 0;

  static gameOver: boolean = false;

  private playerType: string = "azurefirstcry";

  constructor() {
    super("GameScene");
  }

  init(data: { playerType: string }) {
    this.playerType = data.playerType;
  }

  create(): void {
    GameScene.gameOver = false;
    this.spawnTimer = 0;
    this.gameTime = 0;
    this.spawnInterval = this.baseSpawnInterval;
    this.score = 0;
    this.lastEnemyPassTime = 0;

    this.events.on("breakthrough", () => {
      this.lastEnemyPassTime = 0;
    });

    // 根据playerType创建玩家飞机
    if (this.playerType === "ripplepropeller") {
      this.player = new RipplePropeller(this, 400, 500);
    } else if (this.playerType === "pulseshadow") {
      this.player = new PulseShadow(this, 400, 500);
    } else {
      this.player = new AzureFirstCry(this, 400, 500);
    }

    // 添加分数显示
    this.scoreText = this.add.text(50, 50, "分数: 0", {
      fontFamily: "微软雅黑",
      fontSize: "24px",
      color: "#ffffff",
    });
    this.scoreText.setDepth(1);

    this.events.on("player_Destroyed", () => {
      GameScene.gameOver = true;
      this.player.bullets.slice().forEach((bullet) => bullet.destroy());
      this.enemies.slice().forEach((enemy) => enemy.destroy());
      this.enemies_bullets.slice().forEach((bullet) => bullet.destroy());
      this.events.removeListener("player_Destroyed");
      this.events.removeListener("enemy_Destroyed");
      this.events.removeListener("enemyShoot");
      this.events.removeListener("bullet_Destroyed");
      this.scene.start("GameOverScene", {
        score: this.score,
        playerType: this.playerType,
        gameTime: this.gameTime,
      });
    });

    this.enemies = [];

    this.events.on("enemy_Destroyed", (enemy: Enemy) => {
      this.enemies.splice(this.enemies.indexOf(enemy), 1);
      if (enemy.health > 0) return;
      if (enemy instanceof Vanguard) this.score += 10;
      else if (enemy instanceof MeteorFighter) this.score += 20;
      else if (enemy instanceof ArcShooter) this.score += 30;
      else if (enemy instanceof BeamveilGuardian) this.score += 40;
      this.player.updateStats(this.score);
      this.scoreText.setText(`分数: ${this.score}`);
    });

    this.enemies_bullets = [];

    this.events.on("enemyShoot", (bullet: Bullet) => {
      this.enemies_bullets.push(bullet);
    });

    this.events.on("bullet_Destroyed", (bullet: Bullet) => {
      if (bullet.getData("type") === "player_bullet")
        this.player.bullets.splice(this.player.bullets.indexOf(bullet), 1);
      else if (bullet.getData("type") === "enemy_bullet")
        this.enemies_bullets.splice(this.enemies_bullets.indexOf(bullet), 1);
    });

    this.matter.world.on(
      "collisionstart",
      (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
        event.pairs.forEach((pair) => {
          const objA = pair.bodyA.gameObject as Object;
          const objB = pair.bodyB.gameObject as Object;

          if (!objA || !objB) return;

          const typeA = objA.getData("type");
          const typeB = objB.getData("type");

          const collisionPairs = new Map([
            ["player_bullet,enemy", [objA, objB]],
            ["enemy,player_bullet", [objB, objA]],
            ["ememy,player", [objA, objB]],
            ["player,enemy", [objB, objA]],
            ["player,enemy_bullet", [objA, objB]],
            ["enemy_bullet,player", [objB, objA]],
          ]);

          const key = `${typeA},${typeB}`;

          if (collisionPairs.has(key)) {
            const [obj1, obj2] = collisionPairs.get(key)!;
            obj1.takeDamage();
            if (!GameScene.gameOver) obj2.takeDamage();
          }
        });
      }
    );
  }

  update(time: number, delta: number): void {
    if (GameScene.gameOver) return;
    this.lastEnemyPassTime += delta;
    if (this.lastEnemyPassTime >= 15000) {
      this.player.addShield();
      this.lastEnemyPassTime = 0;
    }
    this.player.update();
    this.enemies.slice().forEach((enemy) => enemy.update());

    this.player.bullets.slice().forEach((bullet) => bullet.update());
    this.enemies_bullets.slice().forEach((bullet) => bullet.update());

    this.gameTime += delta;
    this.spawnInterval = Math.max(
      this.minSpawnInterval,
      this.baseSpawnInterval * Math.pow(0.95, Math.floor(this.gameTime / 10000))
    );

    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }
  }

  private spawnEnemy(): void {
    // 获取当前游戏画布的宽度
    const width = this.cameras.main.width;
    // 设置边距，防止敌机生成在屏幕边缘
    const margin = width * 0.1;
    // 根据屏幕宽度动态计算敌机生成位置
    const x = Phaser.Math.Between(margin, width - margin);

    const enemies = [
      { constructor: Vanguard, weight: 8 },
      { constructor: MeteorFighter, weight: 3 },
      { constructor: ArcShooter, weight: 2 },
      { constructor: BeamveilGuardian, weight: 3 },
      { constructor: UpShooter, weight: 4 },
      { constructor: AmmoCarrier, weight: 2 },
    ];

    const totalWeight = enemies.reduce((sum, enemy) => sum + enemy.weight, 0);

    const random = Phaser.Math.Between(0, totalWeight - 1);
    let weightSum = 0;

    for (const enemyType of enemies) {
      weightSum += enemyType.weight;
      if (random < weightSum) {
        const enemy = new enemyType.constructor(this, x, 50);
        this.enemies.push(enemy);
        return;
      }
    }
  }
}
