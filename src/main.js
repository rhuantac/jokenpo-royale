import Phaser from 'phaser'

import Game from './scenes/Game';

const config = {
    type: Phaser.AUTO,
    parent: 'app',
    width: 1920,
    height: 1080,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
    },
    scene: [Game]
};
export default new Phaser.Game(config);