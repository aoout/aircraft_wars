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
import { DroneBot } from "../objects/Dronebot";

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private enemies_bullets: Bullet[] = [];
  private spawnTimer: number = 0;
  private pointsPerSecond: number = 1;
  private basePointsPerSecond: number = 1;
  private currentPoints: number = 0;
  private currentIntent: { constructor: typeof Enemy; cost: number } | null = null;
  private gameTime: number = 0;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private lastEnemyPassTime: number = 0;
  private playerType: string = "azurefirstcry";

  static gameOver: boolean = false;

  constructor() {
    super("GameScene");
  }

  init(data: { playerType: string }) {
    this.playerType = data.playerType;
  }

  create(): void {
    this.initializeGameState();
    this.setupEventListeners();
    this.createPlayer();
    this.createScoreDisplay();
    this.setupCollisionDetection();
  }

  update(time: number, delta: number): void {
    if (GameScene.gameOver) return;
    
    this.updateShieldTimer(delta);
    this.updateGameObjects();
    this.updateGameTime(delta);
    this.updateEnemySpawning();
  }

  private initializeGameState(): void {
    GameScene.gameOver = false;
    this.spawnTimer = 0;
    this.gameTime = 0;
    this.score = 0;
    this.lastEnemyPassTime = 0;
    this.basePointsPerSecond = 1;
    this.pointsPerSecond = this.basePointsPerSecond;
    this.currentPoints = 0;
    this.currentIntent = null;
  }

  private createPlayer(): void {
    const playerConstructors = {
      ripplepropeller: RipplePropeller,
      pulseshadow: PulseShadow,
      azurefirstcry: AzureFirstCry
    };
    const PlayerConstructor = playerConstructors[this.playerType as keyof typeof playerConstructors] || AzureFirstCry;
    this.player = new PlayerConstructor(this, 400, 500);
  }

  private createScoreDisplay(): void {
    this.scoreText = this.add.text(50, 50, "分数: 0", {
      fontFamily: "微软雅黑",
      fontSize: "24px",
      color: "#ffffff",
    });
    this.scoreText.setDepth(1);
  }

  private setupEventListeners(): void {
    this.events.on("breakthrough", this.handleBreakthrough, this);
    this.events.on("player_Destroyed", this.handlePlayerDestroyed, this);
    this.events.on("enemy_Destroyed", this.handleEnemyDestroyed, this);
    this.events.on("enemyShoot", this.handleEnemyShoot, this);
    this.events.on("bullet_Destroyed", this.handleBulletDestroyed, this);
  }

  private handleBreakthrough(): void {
    this.lastEnemyPassTime = 0;
  }

  private handlePlayerDestroyed(): void {
    GameScene.gameOver = true;
    this.cleanupGameObjects();
    this.removeEventListeners();
    this.startGameOverScene();
  }

  private cleanupGameObjects(): void {
    this.player.bullets.slice().forEach(bullet => bullet.destroy());
    this.enemies.slice().forEach(enemy => enemy.destroy());
    this.enemies_bullets.slice().forEach(bullet => bullet.destroy());
  }

  private removeEventListeners(): void {
    this.events.removeListener("player_Destroyed");
    this.events.removeListener("enemy_Destroyed");
    this.events.removeListener("enemyShoot");
    this.events.removeListener("bullet_Destroyed");
  }

  private startGameOverScene(): void {
    this.scene.start("GameOverScene", {
      score: this.score,
      playerType: this.playerType,
      gameTime: this.gameTime,
    });
  }

  private handleEnemyDestroyed(enemy: Enemy): void {
    this.enemies.splice(this.enemies.indexOf(enemy), 1);
    if (enemy.health > 0) return;
    
    this.updateScore(enemy);
    this.player.updateStats(this.score);
    this.scoreText.setText(`分数: ${this.score}`);
  }

  private updateScore(enemy: Enemy): void {
    const scoreMap = new Map([
      [Vanguard, 10],
      [MeteorFighter, 20],
      [ArcShooter, 30],
      [BeamveilGuardian, 40]
    ]);
    this.score += scoreMap.get(enemy.constructor as any) || 0;
  }

  private handleEnemyShoot(bullet: Bullet): void {
    this.enemies_bullets.push(bullet);
  }

  private handleBulletDestroyed(bullet: Bullet): void {
    const bulletType = bullet.getData("type");
    if (bulletType === "player_bullet") {
      this.player.bullets.splice(this.player.bullets.indexOf(bullet), 1);
    } else if (bulletType === "enemy_bullet") {
      this.enemies_bullets.splice(this.enemies_bullets.indexOf(bullet), 1);
    }
  }

  private setupCollisionDetection(): void {
    this.matter.world.on("collisionstart", this.handleCollision, this);
  }

  private handleCollision(event: Phaser.Physics.Matter.Events.CollisionStartEvent): void {
    event.pairs.forEach(pair => {
      const objA = pair.bodyA.gameObject as Object;
      const objB = pair.bodyB.gameObject as Object;

      if (!objA || !objB) return;

      const typeA = objA.getData("type");
      const typeB = objB.getData("type");
      const key = `${typeA},${typeB}`;

      this.processCollision(key, objA, objB);
    });
  }

  private processCollision(key: string, objA: Object, objB: Object): void {
    const collisionPairs = new Map([
      ["player_bullet,enemy", [objA, objB]],
      ["enemy,player_bullet", [objB, objA]],
      ["ememy,player", [objA, objB]],
      ["player,enemy", [objB, objA]],
      ["player,enemy_bullet", [objA, objB]],
      ["enemy_bullet,player", [objB, objA]]
    ]);

    if (collisionPairs.has(key)) {
      const [obj1, obj2] = collisionPairs.get(key)!;
      obj1.takeDamage();
      if (!GameScene.gameOver) obj2.takeDamage();
    }
  }

  private updateShieldTimer(delta: number): void {
    this.lastEnemyPassTime += delta;
    if (this.lastEnemyPassTime >= 15000) {
      this.player.addShield();
      this.lastEnemyPassTime = 0;
    }
  }

  private updateGameObjects(): void {
    this.player.update();
    this.enemies.slice().forEach(enemy => enemy.update());
    this.player.bullets.slice().forEach(bullet => bullet.update());
    this.enemies_bullets.slice().forEach(bullet => bullet.update());
  }

  private updateGameTime(delta: number): void {
    this.gameTime += delta;
    this.pointsPerSecond = this.basePointsPerSecond * Math.pow(1.1, Math.floor(this.gameTime / 30000));
    this.currentPoints += (this.pointsPerSecond * delta) / 1000;
  }

  private updateEnemySpawning(): void {
    if (!this.currentIntent) {
      this.generateIntent();
    } else if (this.currentPoints >= this.currentIntent.cost) {
      this.spawnEnemy();
      this.currentPoints -= this.currentIntent.cost;
      this.currentIntent = null;
    }
  }

  private generateIntent(): void {
    const enemies = [
      { constructor: Vanguard, weight: 8, cost: 1 },
      { constructor: MeteorFighter, weight: 3, cost: 2 },
      { constructor: ArcShooter, weight: 2, cost: 4 },
      { constructor: BeamveilGuardian, weight: 3, cost: 3 },
      { constructor: UpShooter, weight: 4, cost: 1 },
      { constructor: AmmoCarrier, weight: 2, cost: 2 },
      { constructor: DroneBot, weight: 4, cost: 1 }
    ];

    const totalWeight = enemies.reduce((sum, enemy) => sum + enemy.weight, 0);
    const random = Phaser.Math.Between(0, totalWeight - 1);
    let weightSum = 0;

    for (const enemyType of enemies) {
      weightSum += enemyType.weight;
      if (random < weightSum) {
        this.currentIntent = {
          constructor: enemyType.constructor,
          cost: enemyType.cost
        };
        return;
      }
    }
  }

  private spawnEnemy(): void {
    if (!this.currentIntent) return;

    const width = this.cameras.main.width;
    const margin = width * 0.1;
    const x = Phaser.Math.Between(margin, width - margin);

    const enemy = new this.currentIntent.constructor(this, x, 50, "enemy");
    this.enemies.push(enemy);
  }
}
