# 如何添加新敌机

本文档将指导你如何在游戏中添加一个新的敌机类型。

## 1. 基本步骤

### 1.1 创建敌机类文件
在 `src/objects` 目录下创建新的敌机类文件（例如：`NewEnemy.ts`）。所有敌机都必须继承自基类 `Enemy`。

### 1.2 准备资源文件
1. 创建敌机的 svg 图片资源（参考svg文件夹下的svg）
2. 将 svg 图片转换为 png 格式（在命令行调用 tools 目录下的工具实现）
3. 将 png 图片放入 `public/assets` 目录

## 2. 实现敌机类

```typescript
// src/objects/Enemy.ts
import Phaser from "phaser";
import { Enemy } from "./Enemy";

export class NewEnemy extends Enemy {
  name: string = "newenemy";
  moveSpeed: number = 2;

  shootDelay: number = 1000;
  bulletSpeed: number = 3;
  lastShootTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "newenemy");
  }

  //   ...其他方法
}

```

## 3. 在游戏中集成新敌机

### 3.1 预加载资源
在 `PreloadScene.ts` 中添加资源加载：
```typescript
preload() {
  this.load.image('newenemy', 'assets/NewEnemy.png');
}
```

### 3.2 添加到敌机生成池
在 `GameScene.ts` 的 `spawnEnemy` 方法中添加新敌机：
```typescript
const enemies = [
  { constructor: Vanguard, weight: 7 },
  { constructor: MeteorFighter, weight: 3 },
  // 添加新敌机，设置生成权重
  { constructor: NewEnemy, weight: 4 },
];
```

## 4. 将新敌机加入 enemies.md

在 `docs/enemies.md` 中添加新敌机的信息。

## 5. 示例
参考现有敌机实现：
- `Vanguard`: 基础直线移动敌机
- `MeteorFighter`: 快速突袭型敌机
- `ArcShooter`: 弧形射击敌机
- `BeamveilGuardian`: 高防御力敌机
- `UpShooter`: 向上射击敌机