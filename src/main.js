import Phaser from 'phaser'

import Battle from './scenes/Battle';
import Survival from './scenes/Survival';
import Menu from './scenes/Menu';

const config = {
    type: Phaser.AUTO,
    parent: 'app',
    width: 1920,
    height: 1080,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 }
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
    },
    scene: [Menu, Battle, Survival]
};
export default new Phaser.Game(config);