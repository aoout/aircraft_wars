// src/main.ts
import Phaser from 'phaser';
import { gameConfig, GameConfig } from './config/gameConfig';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { SelectPlayerScene } from './scenes/SelectPlayerScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

type SceneType = typeof BootScene | typeof PreloadScene | typeof GameScene;

interface GameConfigWithScenes extends GameConfig {
    scene: SceneType[];
}

const config: GameConfigWithScenes = {
    ...gameConfig,
    scene: [BootScene, PreloadScene, SelectPlayerScene, GameScene, GameOverScene]
};

new Phaser.Game(config);