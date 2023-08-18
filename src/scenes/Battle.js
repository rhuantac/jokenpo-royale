import Phaser from 'phaser';
import CountdownController from './CountdownController';

export default class Battle extends Phaser.Scene {

    preload() {
        this.load.image('table', 'images/table.png');
        this.load.image('stone', 'images/stone.png');
        this.load.image('scissor', 'images/scissor.png');
        this.load.image('paper', 'images/paper.png');
    }

    constructor() {
        super('Battle');
        this.OBJECT_QUANTITY = 10;
        let scissor, stone, paper;
        this.gameObjects = { scissor, stone, paper };
        this.gameOver = false;
        this.scissorScoreText;
        this.stoneScoreText;
        this.paperScoreText;
        this.winnerName;
        this.player;
        this.battleBorderTween;
        this.center;
        this.screen;
    }

    create() {
        this.center = { x: this.cameras.main.centerX, y: this.cameras.main.centerY }
        this.screen = { width: this.cameras.main.width, height: this.cameras.main.height }
        let background = this.add.image(this.center.x, this.center.y, 'table');
        background.displayWidth = this.screen.width;
        background.displayHeight = this.screen.height;

        this.scissorScoreText = this.add.text(50, 2, this.OBJECT_QUANTITY, { fontFamily: 'Arial Black', fontSize: 20 });
        this.stoneScoreText = this.add.text(50, 52, this.OBJECT_QUANTITY, { fontFamily: 'Arial Black', fontSize: 20 });
        this.paperScoreText = this.add.text(50, 102, this.OBJECT_QUANTITY, { fontFamily: 'Arial Black', fontSize: 20 });

        this.add.image(20, 14, 'scissor').setScale(0.3, 0.3);
        this.add.image(20, 64, 'stone').setScale(0.3, 0.3);
        this.add.image(20, 114, 'paper').setScale(0.3, 0.3);


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
            child.setData('name', 'scissor');
        });

        this.gameObjects.stone = this.physics.add.group({
            key: 'stone',
            quantity: this.OBJECT_QUANTITY,
            setXY: { x: this.screen.width - 200, y: this.screen.height - 200, stepX: -100 },
            setScale: { x: 0.5, y: 0.5 }
        });
        this.gameObjects.stone.children.iterate((child) => {
            let directions = [-1, 1];
            let directionIndex = Math.round(Math.random())
            child.setBounce(1);
            child.setCollideWorldBounds(true);
            child.setVelocity(Phaser.Math.Between(100, 200) * directions[directionIndex], Phaser.Math.Between(100, 200) * directions[directionIndex]);
            child.body.drag = 0;
            child.setData('name', 'stone');
        });

        this.gameObjects.paper = this.physics.add.group({
            key: 'paper',
            quantity: this.OBJECT_QUANTITY,
            setXY: { x: 200, y: this.screen.height - 200, stepX: 100 },
            setScale: { x: 0.5, y: 0.5 }
        });
        this.gameObjects.paper.children.iterate((child) => {
            let directions = [-1, 1];
            let directionIndex = Math.round(Math.random())
            child.setBounce(1);
            child.setCollideWorldBounds(true);
            child.setVelocity(Phaser.Math.Between(100, 200) * directions[directionIndex], Phaser.Math.Between(100, 200) * directions[directionIndex]);
            child.body.drag = 0;
            child.setData('name', 'paper');
        });
        this.cursors = this.input.keyboard.createCursorKeys();

        this.drawBattleBorder();
        this.physics.add.collider(this.gameObjects.stone, this.gameObjects.scissor, this.objectCollide, null, this)
        this.physics.add.collider(this.gameObjects.stone, this.gameObjects.paper, this.objectCollide, null, this)
        this.physics.add.collider(this.gameObjects.paper, this.gameObjects.scissor, this.objectCollide, null, this)
        this.freezeGame();
        this.startCountdown();
    }

    objectCollide(objectA, objectB, info) {
        let nameA = objectA.getData('name');
        let nameB = objectB.getData('name')
        let winner = this.calcDuelWinner(objectA.getData('name'), objectB.getData('name'))
        if (winner === nameA) {
            this.replaceOldObject(objectB, objectA, this);
        } else if (winner === nameB) {
            this.replaceOldObject(objectA, objectB, this);
        }
    }

    replaceOldObject(loserObject, winnerObject, context) {
        let winnerObjectName = winnerObject.getData('name');
        let winnerObjectVelocity = winnerObject.body.velocity;
        let createdObject = context.physics.add.sprite(loserObject.x + 10, loserObject.y + 10, winnerObjectName);
        this.gameObjects[winnerObjectName].add(createdObject);
        createdObject.setVelocity(loserObject.body.velocity.x, loserObject.body.velocity.y)
        createdObject.setData('name', winnerObjectName);
        createdObject.setTexture(winnerObjectName);
        createdObject.setScale(winnerObject.scaleX, winnerObject.scaleY);
        createdObject.setBounce(1);
        createdObject.setCollideWorldBounds(true);
        createdObject.body.drag = 0;
        this.gameObjects[loserObject.getData("name")].remove(loserObject);
        loserObject.destroy();

        winnerObject.body.setVelocity(winnerObjectVelocity.x, winnerObjectVelocity.y);
        this.renderScore();
        this.checkGameFinished()
    }

    renderScore() {
        this.scissorScoreText.setText(this.gameObjects.scissor.getLength());
        this.stoneScoreText.setText(this.gameObjects.stone.getLength());
        this.paperScoreText.setText(this.gameObjects.paper.getLength());
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

    checkGameFinished() {
        let winnerName;
        let isOver = false;
        for (const [key, group] of Object.entries(this.gameObjects)) {
            console.log(group.getLength(), this.OBJECT_QUANTITY);
            let groupWon = group.getLength() === this.OBJECT_QUANTITY * 3;
            if (groupWon) {
                isOver = true;
                winnerName = key;
            }
        };

        if (isOver) {
            console.log("GAME OVER - " + winnerName);
            this.gameOver = isOver;
            this.freezeGame();
            this.showWinner(winnerName);
        }
    }

    showWinner(winnerName) {
        this.gameOverGroup = this.add.group();
        let gameOverText = this.add.text(this.center.x, 70, 'Winner', { fontFamily: 'Arial Black', fontSize: 80, shadowColor: '#F1F1A0', shadowBlur: 10, shadowFill: true }).setOrigin(0.5);
        let icon = this.add.image(this.center.x, 170, winnerName);
        let playAgainButton = this.add.text(this.center.x, this.screen.height - 100, 'Play again', { fontFamily: 'Arial Black', fontSize: 70 }).setOrigin(0.5);
        playAgainButton.setInteractive({ useHandCursor: true });
        playAgainButton
            .on('pointerdown', this.restartGame.bind(this))
            .on('pointerover', () => playAgainButton.setStyle({ fill: '#90EE90' }))
            .on('pointerout', () => playAgainButton.setStyle({ fill: '#FFF' }))


        this.add.tween({
            targets: [gameOverText, icon],
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        this.gameOverGroup.add(gameOverText).add(icon).add(playAgainButton);

    }

    restartGame() {
        this.scene.start();
    }

    freezeGame() {
        this.physics.world.disable([this.gameObjects.paper, this.gameObjects.scissor, this.gameObjects.stone]);
        this.battleBorderTween.pause();
    }

    unfreezeGame() {
        this.physics.world.enable([this.gameObjects.paper, this.gameObjects.scissor, this.gameObjects.stone]);
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