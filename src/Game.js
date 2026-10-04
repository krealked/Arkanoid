import { Paddle } from './entities/Paddle.js';
import { Ball } from './entities/Ball.js';
import { LevelBuilder } from './systems/LevelBuilder.js';
import { CollisionManager } from './systems/CollisionManager.js';

export class Game {
    constructor() {
        this.app = null;
        this.paddle = null;
        this.balls = [];
        this.bricks = [];
        this.powerUps = [];
        
        this.score = 0;
        this.state = 'WAITING'; // 'WAITING', 'PLAYING', 'GAME_OVER', 'VICTORY'
        
        this.scoreText = null;
        this.messageText = null;
        this.tutorialMouseText = null;
        this.tutorialBricksText = null;

        this.expandTimer = null;
        this.slowTimer = null;
    }

    async init() {
        // настройка PixiJS
        if (PIXI.settings) {
            PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        }
        if (PIXI.BaseTexture && PIXI.BaseTexture.defaultOptions) {
            PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
        }

        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            antialias: false,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        document.getElementById('game-container').appendChild(this.app.view);

        // Загрузка и настройка фонового спрайта
        const bgSprite = PIXI.Sprite.from('assets/canvas-bg.png');
        bgSprite.width = 800;
        bgSprite.height = 600;

        if (bgSprite.texture.baseTexture) {
            bgSprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        } else {
            bgSprite.texture.once('update', () => {
                if (bgSprite.texture.baseTexture) {
                    bgSprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
                }
            });
        }

        this.app.stage.addChildAt(bgSprite, 0);

        // создаем сущности
        this.paddle = new Paddle(this.app.screen.width, this.app.screen.height);
        this.paddle.addToStage(this.app.stage);

        const initialBall = new Ball();
        initialBall.resetToPaddle(this.paddle);
        initialBall.addToStage(this.app.stage);
        this.balls.push(initialBall);

        this.bricks = LevelBuilder.createBricks(this.app.stage, this.app.screen.width);

        // создаем UI в ретро-стиле
        this.createUI();

        // инициализируем управление и игровой цикл
        this.initInteractivity();
        this.setupGameLoop();
    }

    createUI() {
        const scoreStyle = new PIXI.TextStyle({
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 16,
            lineHeight: 20,
            fill: '#00ffcc',
            align: 'left',
            padding: 12
        });

        this.scoreText = new PIXI.Text('SCORE: 0', scoreStyle);
        this.scoreText.anchor.set(0, 0);
        this.scoreText.x = 24;
        this.scoreText.y = 20;
        this.app.stage.addChild(this.scoreText);

        const messageStyle = new PIXI.TextStyle({
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 16,
            fill: '#ffffff',
            align: 'center',
            lineHeight: 28
        });

        this.messageText = new PIXI.Text('CLICK TO START', messageStyle);
        this.messageText.anchor.set(0.5);
        this.messageText.x = this.app.screen.width / 2;
        this.messageText.y = this.app.screen.height / 2 + 60;
        this.app.stage.addChild(this.messageText);

        // обучающие подсказки (онбординг) в ретро-стиле
        const tutorialStyle = new PIXI.TextStyle({
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 11,
            fill: '#f1c40f',
            align: 'center',
            lineHeight: 18
        });

        this.tutorialMouseText = new PIXI.Text('< MOVE MOUSE TO CONTROL >', tutorialStyle);
        this.tutorialMouseText.anchor.set(0.5);
        this.tutorialMouseText.x = this.app.screen.width / 2;
        this.tutorialMouseText.y = this.app.screen.height - 100;
        this.app.stage.addChild(this.tutorialMouseText);

        this.tutorialBricksText = new PIXI.Text('DESTROY ALL BRICKS', tutorialStyle);
        this.tutorialBricksText.anchor.set(0.5);
        this.tutorialBricksText.x = this.app.screen.width / 2;
        this.tutorialBricksText.y = 250;
        this.app.stage.addChild(this.tutorialBricksText);
    }

    restartGame() {
        this.score = 0;
        this.scoreText.text = 'SCORE: 0';
        
        // очищаем оставшиеся блоки
        this.bricks.forEach(brick => {
            if (brick.graphic.parent) {
                this.app.stage.removeChild(brick.graphic);
            }
        });

        // очищаем капсулы бонусов
        this.powerUps.forEach(p => p.removeFromStage(this.app.stage));
        this.powerUps = [];

        // очищаем старые мячи
        this.balls.forEach(b => {
            if (b.graphic.parent) this.app.stage.removeChild(b.graphic);
        });
        this.balls = [];

        this.bricks = LevelBuilder.createBricks(this.app.stage, this.app.screen.width);

        const newBall = new Ball();
        newBall.resetToPaddle(this.paddle);
        newBall.addToStage(this.app.stage);
        this.balls.push(newBall);

        // сбрасываем размер платформы
        this.paddle.width = 100;
        this.paddle.draw();

        if (this.expandTimer) clearTimeout(this.expandTimer);
        if (this.slowTimer) clearTimeout(this.slowTimer);

        this.state = 'WAITING';
        this.messageText.text = 'CLICK TO START';
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

            if (this.state === 'WAITING' && this.balls.length > 0) {
                this.balls[0].x = this.paddle.x + this.paddle.width / 2;
                this.balls[0].updatePosition();
            }
        });

        this.app.stage.on('pointerdown', () => {
            if (this.state === 'WAITING') {
                this.state = 'PLAYING';
                this.messageText.text = '';
                if (this.tutorialMouseText) this.tutorialMouseText.visible = false;
                if (this.tutorialBricksText) this.tutorialBricksText.visible = false;
                if (this.balls.length > 0) {
                    this.balls[0].vx = 3;
                    this.balls[0].vy = -3;
                }
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
            if (this.balls.length > 0) {
                this.balls[0].x = this.paddle.x + this.paddle.width / 2;
                this.balls[0].y = this.paddle.y - this.balls[0].radius;
                this.balls[0].updatePosition();
            }
            return;
        }

        if (this.state !== 'PLAYING') {
            return;
        }

        // обновление падающих капсул бонусов
        for (let i = 0; i < this.powerUps.length; i++) {
            this.powerUps[i].update(delta);
        }

        // проверка сбора бонусов платформой
        CollisionManager.checkPowerUpPaddleCollision(this.powerUps, this.paddle, this.app.stage, (type) => {
            this.activatePowerUp(type);
        });

        // обновление всех активных мячей
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];

            ball.x += ball.vx * delta;
            ball.y += ball.vy * delta;
            ball.updatePosition();

            // отскок от стен
            CollisionManager.checkWallCollisions(ball, this.app.screen.width);

            // отскок от верхней границы
            if (ball.y - ball.radius <= 0) {
                ball.y = ball.radius;
                ball.vy = Math.abs(ball.vy);
            }

            // падение мяча за нижний край
            if (ball.y > this.app.screen.height + ball.radius) {
                if (ball.graphic.parent) {
                    this.app.stage.removeChild(ball.graphic);
                }
                this.balls.splice(i, 1);
                continue;
            }

            // столкновение с платформой
            CollisionManager.checkPaddleCollision(ball, this.paddle);

            // столкновение с блоками (передаем this.powerUps)
            CollisionManager.checkBrickCollisions(ball, this.bricks, this.app.stage, (brick, isDestroyed) => {
                if (isDestroyed) {
                    this.score += (brick.maxHp > 1 ? 20 : 10);
                    this.scoreText.text = `SCORE: ${this.score}`;
                }
            }, this.powerUps);
        }

        // проверка поражения (все мячи потеряны)
        if (this.balls.length === 0) {
            this.state = 'GAME_OVER';
            this.messageText.text = 'GAME OVER\n\nCLICK TO RESTART';
            return;
        }

        // проверка на победу
        if (this.bricks.length === 0) {
            this.state = 'VICTORY';
            this.messageText.text = 'VICTORY!\n\nCLICK TO RESTART';
        }
    }

    activatePowerUp(type) {
        if (type === 'E') {
            // Expand: увеличение платформы на 35% на 12 секунд
            this.paddle.width = 135;
            this.paddle.draw();
            if (this.expandTimer) clearTimeout(this.expandTimer);
            this.expandTimer = setTimeout(() => {
                if (this.paddle) {
                    this.paddle.width = 100;
                    this.paddle.draw();
                }
            }, 12000);
        } else if (type === 'D') {
            // Disruption: разделение текущего мяча на 3 мяча
            const newBalls = [];
            this.balls.forEach(ball => {
                for (let angleOffset of [-0.4, 0.4]) {
                    const b = new Ball();
                    b.x = ball.x;
                    b.y = ball.y;
                    
                    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                    const currentAngle = Math.atan2(ball.vy, ball.vx);
                    const newAngle = currentAngle + angleOffset;

                    b.vx = speed * Math.cos(newAngle);
                    b.vy = speed * Math.sin(newAngle);

                    b.updatePosition();
                    b.addToStage(this.app.stage);
                    newBalls.push(b);
                }
            });
            this.balls.push(...newBalls);
        } else if (type === 'S') {
            // Slow: снижение скорости всех мячей на 30% на 10 секунд
            this.balls.forEach(ball => {
                ball.vx *= 0.7;
                ball.vy *= 0.7;
            });
            if (this.slowTimer) clearTimeout(this.slowTimer);
            this.slowTimer = setTimeout(() => {
                this.balls.forEach(ball => {
                    ball.vx /= 0.7;
                    ball.vy /= 0.7;
                });
            }, 10000);
        }
    }
}
