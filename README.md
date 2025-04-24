# 飞机大战游戏

一个基于 Phaser 3 引擎开发的现代化飞机大战游戏。游戏采用 TypeScript 开发，具有流畅的游戏体验和丰富的游戏特性。

## 技术栈

- 游戏引擎：Phaser 3
- 开发语言：TypeScript
- 构建工具：Vite
- 物理引擎：Matter.js

## 开发环境设置

1. 克隆项目
```bash
git clone https://github.com/aoout/aircraft_wars
cd aircraft_wars
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建项目
```bash
npm run build
```

## 项目结构

```
src/
├── config/       # 游戏配置
├── objects/      # 游戏对象（玩家、敌人、子弹等）
├── scenes/       # 游戏场景
└── main.ts       # 游戏入口
```