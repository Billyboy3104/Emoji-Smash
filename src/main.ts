import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { StartScene } from './scenes/StartScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { UIScene } from './scenes/UIScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  parent: 'app',
  backgroundColor: '#0a0a0a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'app',
    expandParent: true,
    autoRound: true,
    min: {
      width: 360,
      height: 640
    },
    max: {
      width: 720,
      height: 1280
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: import.meta.env.DEV,
    },
  },
  scene: [BootScene, GameScene, UIScene],
  scene: [BootScene, StartScene, GameScene, GameOverScene, UIScene],
};

new Phaser.Game(config);