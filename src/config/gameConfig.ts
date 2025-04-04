// src/config/gameConfig.ts
import Phaser from 'phaser';

export interface GameConfig extends Phaser.Types.Core.GameConfig {
    physics: {
        default: 'matter';
        matter: {
            gravity: { x: number; y: number };
            debug: boolean;
        };
    };
    scale: {
        mode: Phaser.Scale.ScaleModes;
        autoCenter: Phaser.Scale.Center;
    };
}

export const gameConfig: GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'matter',
        matter: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
        gamepad: true
    }
};