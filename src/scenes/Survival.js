import Phaser from 'phaser';
import CountdownController from './CountdownController';

export default class Survival extends Phaser.Scene {

    preload() {
        this.load.image('table', 'images/table.png');
        this.load.image('stone', 'images/stone.png');
        this.load.image('scissor', 'images/scissor.png');
        this.load.image('paper', 'images/paper.png');
    }

    constructor() {
        super('Survival');
        this.OBJECT_QUANTITY = 20;
        let scissor, stone, paper;
        this.gameObjects = { scissor, paper };
        this.gameOver = false;
        this.scissorScoreText;
        this.stoneScoreText;
        this.paperScoreText;
        this.winnerName;
        this.player;
        this.battleBorderTween;
        this.center;
        this.screen;
        //this.player;
        //this.cursors;
    }

    create() {
        this.center = { x: this.cameras.main.centerX, y: this.cameras.main.centerY }
        this.screen = { width: this.cameras.main.width, height: this.cameras.main.height }
        let background = this.add.image(this.center.x, this.center.y, 'table');
        background.displayWidth = this.screen.width;
        background.displayHeight = this.screen.height;

        this.gameObjects.scissor = this.physics.add.group({
            key: 'scissor',
            quantity: this.OBJECT_QUANTITY,
            setXY: { x: 200, y: 200, stepX: 100 },
            setScale: { x: 0.5, y: 0.5 }
        });
        this.gameObjects.scissor.children.iterate((child) => {
            let directions = [-1, 1];
            let directionIndex = Math.round(Math.random())
            child.setBounce(1);
            child.setCollideWorldBounds(true);
            child.setVelocity(Phaser.Math.Between(100, 200) * directions[directionIndex], Phaser.Math.Between(100, 200) * directions[directionIndex]);
            child.body.drag = 0;
            child.body.setSize(80, 80)
            child.setData('name', 'scissor');
        });

        this.gameObjects.paper = this.physics.add.group();
        this.cursors = this.input.keyboard.createCursorKeys();

        this.player = this.physics.add.sprite(500, 500, 'paper');
        this.gameObjects.paper.add(this.player, true);
        this.player.setData('name', 'paper');
        this.player.setData('isPlayer', true);
        this.player.setBounce(1);
        this.player.setCollideWorldBounds(true);
        this.player.setTexture('paper');
        this.player.setScale(0.5, 0.5);
        this.player.body.setSize(90, 60)

        this.drawBattleBorder();
        this.physics.add.collider(this.gameObjects.paper, this.gameObjects.scissor, this.objectCollide, null, this);
        this.freezeGame();
        this.startCountdown();
    }

    update(delta) {

        if (this.gameOver) {
            return;
        }

        let isIdle = true;
        let velocityX = 0;
        let velocityY = 0;

        if (this.cursors.left.isDown) {
            isIdle = false;
            velocityX = -160;
        }
        if (this.cursors.right.isDown) {
            isIdle = false;
            velocityX = 160;
        }
        if (this.cursors.down.isDown) {
            isIdle = false;
            velocityY = 160;
        }
        if (this.cursors.up.isDown) {
            isIdle = false;
            velocityY = -160;
        }
        if (isIdle) {
            velocityX = 0;
            velocityY = 0;
        }

        this.player.setVelocity(velocityX, velocityY);
    }

    objectCollide() {
        this.gameOver = true;
        this.physics.world.disable([this.gameObjects.paper, this.gameObjects.scissor]);
        this.battleBorderTween.stop();
        this.showLoseMsg();

    }

    calcDuelWinner(objectNameA, objectNameB) {
        if (objectNameA === objectNameB)
            return 'draw'

        if (objectNameA === 'scissor') {
            if (objectNameB === 'paper') {
                return 'scissor'
            } else {
                return 'stone'
            }
        } else if (objectNameA === 'paper') {
            if (objectNameB === 'stone') {
                return 'paper'
            } else {
                return 'scissor'
            }
        } else if (objectNameA === 'stone') {
            if (objectNameB === 'scissor') {
                return 'stone'
            } else {
                return 'paper'
            }
        }

        throw Error("Unknown object name")
    }

    drawBattleBorder() {
        let rect = Phaser.Geom.Rectangle.Clone(this.cameras.main);
        let { x, y, width, height } = rect;


        let battleBorder = this.add.rectangle(width / 2, height / 2, width - 200, height - 200);
        battleBorder.setStrokeStyle(4, "0xFF0000");
        this.syncWorldBounds(battleBorder);
        this.battleBorderTween = this.tweens.add({
            targets: battleBorder,
            scale: 0.3,
            duration: 30000,
            ease: 'linear',
            onUpdate: (tween, target, param) => {
                this.syncWorldBounds(target);
            }

        });
        this.physics.add.collider(battleBorder, this.gameObjects.scissor);
        this.physics.add.collider(battleBorder, this.gameObjects.paper);
        this.physics.add.collider(battleBorder, this.gameObjects.stone);
    }

    syncWorldBounds(battleBorder) {
        let rectRealBounds = battleBorder.getBounds();
        this.physics.world.setBounds(rectRealBounds.x, rectRealBounds.y, rectRealBounds.width, rectRealBounds.height);
    }

    showLoseMsg() {
        this.gameOverGroup = this.add.group();
        let gameOverText = this.add.text(this.center.x, 70, 'You lose', { fontFamily: 'Arial Black', fontSize: 80, color: '#CC0000' }).setOrigin(0.5);
        let playAgainButton = this.add.text(this.center.x, this.screen.height - 100, 'Play again', { fontFamily: 'Arial Black', fontSize: 70 }).setOrigin(0.5);
        playAgainButton.setInteractive({ useHandCursor: true });
        playAgainButton
            .on('pointerdown', this.restartGame.bind(this))
            .on('pointerover', () => playAgainButton.setStyle({ fill: '#90EE90' }))
            .on('pointerout', () => playAgainButton.setStyle({ fill: '#FFF' }))


        this.add.tween({
            targets: [gameOverText],
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        this.gameOverGroup.add(gameOverText).add(playAgainButton);

    }

    restartGame() {
        this.scene.start();
        this.gameOver = false;
    }

    freezeGame() {
        this.physics.world.disable([this.gameObjects.paper, this.gameObjects.scissor]);
        this.battleBorderTween.pause();
    }

    unfreezeGame() {
        this.physics.world.enable([this.gameObjects.paper, this.gameObjects.scissor]);
        this.battleBorderTween.resume();
    }

    startCountdown() {
        const countdownDuration = 3000;
        let countdownText = this.add.text(this.center.x, this.center.y, (countdownDuration / 1000).toString(), { fontFamily: 'Arial Black', fontSize: 200 }).setOrigin(0.5)
        new CountdownController(this, countdownText).start(countdownDuration, () => {
            countdownText.text = "GO!"
            this.add.tween({
                targets: [countdownText],
                scale: 0.03,
                duration: 500,
                onComplete: () => {
                    this.unfreezeGame();
                    countdownText.destroy();
                },
            })

        })

    }

}