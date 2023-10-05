import Phaser from 'phaser';

export default class Menu extends Phaser.Scene {

    preload() {
        this.load.image('table', 'images/table.png');
    }

    constructor() {
        super('Menu');
    }

    create() {
        this.center = { x: this.cameras.main.centerX, y: this.cameras.main.centerY }
        this.screen = { width: this.cameras.main.width, height: this.cameras.main.height }
        let background = this.add.image(this.center.x, this.center.y, 'table');
        background.displayWidth = this.screen.width;
        background.displayHeight = this.screen.height;
        this.showOptions();
    }

    showOptions() {
        let simulationButton = this.add.text(this.center.x, this.center.y - 100, 'Simulation', { fontFamily: 'Arial Black', fontSize: 70 }).setOrigin(0.5);
        let survivalbutton = this.add.text(this.center.x, this.center.y + 100, 'Survival', { fontFamily: 'Arial Black', fontSize: 70 }).setOrigin(0.5);
        simulationButton.setInteractive({ useHandCursor: true });
        simulationButton
            .on('pointerdown', () => this.scene.start('Battle'))
            .on('pointerover', () => simulationButton.setStyle({ fill: '#90EE90' }))
            .on('pointerout', () => simulationButton.setStyle({ fill: '#FFF' }))
        survivalbutton.setInteractive({ useHandCursor: true });
        survivalbutton
            .on('pointerdown', () => this.scene.start('Survival'))
            .on('pointerover', () => survivalbutton.setStyle({ fill: '#90EE90' }))
            .on('pointerout', () => survivalbutton.setStyle({ fill: '#FFF' }))
    }


}