import Phaser from 'phaser';
import { gameConfig, GameConfig } from './config/gameConfig';
import { BootScene } from './scenes/BootScene';
import { GameOverScene } from './scenes/GameOverScene';
import { GameScene } from './scenes/GameScene';
import { PreloadScene } from './scenes/PreloadScene';
import { SelectPlayerScene } from './scenes/SelectPlayerScene';

type SceneType = typeof BootScene | typeof PreloadScene | typeof GameScene;

interface GameConfigWithScenes extends GameConfig {
    scene: SceneType[];
}

const config: GameConfigWithScenes = {
    ...gameConfig,
    scene: [BootScene, PreloadScene, SelectPlayerScene, GameScene, GameOverScene]
};

new Phaser.Game(config);