import { Paddle } from './entities/Paddle.js';
import { Ball } from './entities/Ball.js';
import { LevelBuilder } from './systems/LevelBuilder.js';
import { CollisionManager } from './systems/CollisionManager.js';

export class Game {
    constructor() {
        this.app = null;
        this.paddle = null;
        this.ball = null;
        this.bricks = [];
        
        this.score = 0;
        this.state = 'WAITING'; // 'WAITING', 'PLAYING', 'GAME_OVER', 'VICTORY'
        
        this.scoreText = null;
        this.messageText = null;
        this.tutorialMouseText = null;
        this.tutorialBricksText = null;
    }

    async init() {
        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x222222,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        document.body.appendChild(this.app.view);

        // создаем сущности
        this.paddle = new Paddle(this.app.screen.width, this.app.screen.height);
        this.paddle.addToStage(this.app.stage);

        this.ball = new Ball();
        this.ball.resetToPaddle(this.paddle);
        this.ball.addToStage(this.app.stage);

        this.bricks = LevelBuilder.createBricks(this.app.stage, this.app.screen.width);

        // создаем UI
        this.createUI();

        this.initInteractivity();
        this.setupGameLoop();
    }

    createUI() {
        const scoreStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 20,
            fill: '#ffffff',
            fontWeight: 'bold'
        });

        this.scoreText = new PIXI.Text('Счет: 0', scoreStyle);
        this.scoreText.x = 20;
        this.scoreText.y = 20;
        this.app.stage.addChild(this.scoreText);

        const messageStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 28,
            fill: '#ffffff',
            align: 'center',
            fontWeight: 'bold'
        });

        this.messageText = new PIXI.Text('Кликни, чтобы начать', messageStyle);
        this.messageText.anchor.set(0.5);
        this.messageText.x = this.app.screen.width / 2;
        this.messageText.y = this.app.screen.height / 2 + 50;
        this.app.stage.addChild(this.messageText);

        // обучающие подсказки (онбординг)
        const tutorialStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: '#3498db',
            align: 'center',
            fontWeight: 'bold'
        });

        this.tutorialMouseText = new PIXI.Text('← Двигай мышью для управления →', tutorialStyle);
        this.tutorialMouseText.anchor.set(0.5);
        this.tutorialMouseText.x = this.app.screen.width / 2;
        this.tutorialMouseText.y = this.app.screen.height - 110;
        this.app.stage.addChild(this.tutorialMouseText);

        this.tutorialBricksText = new PIXI.Text(' Сбей все блоки', tutorialStyle);
        this.tutorialBricksText.anchor.set(0.5);
        this.tutorialBricksText.x = this.app.screen.width / 2;
        this.tutorialBricksText.y = 250;
        this.app.stage.addChild(this.tutorialBricksText);
    }

    restartGame() {
        this.score = 0;
        this.scoreText.text = `Счет: ${this.score}`;
        
        // очищаем старые оставшиеся графические элементы блоков на всякий случай
        this.bricks.forEach(brick => {
            if (brick.graphic.parent) {
                this.app.stage.removeChild(brick.graphic);
            }
        });

        this.bricks = LevelBuilder.createBricks(this.app.stage, this.app.screen.width);
        this.ball.resetToPaddle(this.paddle);
        
        this.state = 'WAITING';
        this.messageText.text = 'Кликни, чтобы начать';
        this.messageText.visible = true;

        if (this.tutorialMouseText) this.tutorialMouseText.visible = true;
        if (this.tutorialBricksText) this.tutorialBricksText.visible = true;
    }

    initInteractivity() {
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;

        this.app.stage.on('pointermove', (event) => {
            const pos = event.data.global;
            const newX = pos.x - this.paddle.width / 2;

            this.paddle.setX(newX, this.app.screen.width);

            if (this.state === 'WAITING') {
                this.ball.x = this.paddle.x + this.paddle.width / 2;
                this.ball.updatePosition();
            }
        });

        this.app.stage.on('pointerdown', () => {
            if (this.state === 'WAITING') {
                this.state = 'PLAYING';
                this.messageText.text = '';
                if (this.tutorialMouseText) this.tutorialMouseText.visible = false;
                if (this.tutorialBricksText) this.tutorialBricksText.visible = false;
                this.ball.vx = 3;
                this.ball.vy = -3;
            } else if (this.state === 'GAME_OVER' || this.state === 'VICTORY') {
                this.restartGame();
            }
        });
    }

    setupGameLoop() {
        this.app.ticker.add((delta) => {
            this.update(delta);
        });
    }

    update(delta) {
        if (this.state === 'WAITING') {
            this.ball.x = this.paddle.x + this.paddle.width / 2;
            this.ball.y = this.paddle.y - this.ball.radius;
            this.ball.updatePosition();
            return;
        }

        if (this.state !== 'PLAYING') {
            return;
        }

        // движение мяча
        this.ball.x += this.ball.vx * delta;
        this.ball.y += this.ball.vy * delta;
        this.ball.updatePosition();

        // проверка столкновений со стенами
        CollisionManager.checkWallCollisions(this.ball, this.app.screen.width, () => {
            this.state = 'GAME_OVER';
            this.messageText.text = 'Game Over.\nКликни для рестарта';
        });

        if (this.state !== 'PLAYING') return;

        // проверка столкновения с платформой
        CollisionManager.checkPaddleCollision(this.ball, this.paddle);

        // проверка столкновений с блоками
        CollisionManager.checkBrickCollisions(this.ball, this.bricks, this.app.stage, (brick) => {
            this.score += 10;
            this.scoreText.text = `Счет: ${this.score}`;
        });

        // проверка на победу
        if (this.bricks.length === 0) {
            this.state = 'VICTORY';
            this.messageText.text = 'Победа!\nКликни для рестарта';
        }
    }
}
