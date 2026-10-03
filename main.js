class ArkanoidGame {
    constructor() {
        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x222222,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        this.paddle = null;
        this.ball = null;
        this.bricks = [];
        this.ballRadius = 8;
        this.ballSpeed = { x: 3, y: -3 };
        
        this.score = 0;
        this.state = 'WAITING'; // 'WAITING', 'PLAYING', 'GAME_OVER', 'VICTORY'
        
        this.scoreText = null;
        this.messageText = null;
        this.tutorialMouseText = null;
        this.tutorialBricksText = null;
    }

    async init() {
        // Appending the canvas view to body
        document.body.appendChild(this.app.view);

        // Create game objects and UI
        this.createPaddle();
        this.createBall();
        this.createBricks();
        this.createUI();

        // Initialize interactivity and game loop
        this.initInteractivity();
        this.setupGameLoop();
    }

    createPaddle() {
        const width = 100;
        const height = 15;
        
        this.paddle = new PIXI.Graphics();
        this.paddle.beginFill(0x3498db); // Синий цвет
        this.paddle.drawRect(0, 0, width, height);
        this.paddle.endFill();

        // Позиционируем внизу по центру
        this.paddle.x = (this.app.screen.width - width) / 2;
        this.paddle.y = this.app.screen.height - 60;

        this.app.stage.addChild(this.paddle);
    }

    createBall() {
        this.ball = new PIXI.Graphics();
        this.ball.beginFill(0xf1c40f); // Желтый цвет
        this.ball.drawCircle(0, 0, this.ballRadius);
        this.ball.endFill();

        this.resetBall();

        this.app.stage.addChild(this.ball);
    }

    createBricks() {
        // Удаляем старые блоки со сцены, если они есть
        this.bricks.forEach(brick => this.app.stage.removeChild(brick));
        this.bricks = [];

        const rows = 5;
        const cols = 10;
        const brickWidth = 70;
        const brickHeight = 20;
        const padding = 6;
        const topOffset = 60;

        const totalWidth = cols * brickWidth + (cols - 1) * padding;
        const leftOffset = (this.app.screen.width - totalWidth) / 2;

        // Цвета для 5 рядов (сверху вниз)
        const colors = [0xe74c3c, 0xe67e22, 0xf1c40f, 0x2ecc71, 0x3498db];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const brick = new PIXI.Graphics();
                brick.beginFill(colors[r]);
                brick.drawRect(0, 0, brickWidth, brickHeight);
                brick.endFill();

                const targetX = leftOffset + c * (brickWidth + padding);
                const targetY = topOffset + r * (brickHeight + padding);

                // Начальная позиция для анимации появления (падение сверху + fade-in)
                brick.x = targetX;
                brick.y = targetY - 120;
                brick.alpha = 0;
                brick.isAlive = true;
                brick.width = brickWidth;
                brick.height = brickHeight;

                this.app.stage.addChild(brick);
                this.bricks.push(brick);

                // GSAP анимация появления блоков
                gsap.to(brick, {
                    y: targetY,
                    alpha: 1,
                    duration: 0.8,
                    delay: (r * cols + c) * 0.01,
                    ease: 'bounce.out'
                });
            }
        }
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

        // Обучающие подсказки (онбординг)
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

    resetBall() {
        if (this.paddle) {
            this.ball.x = this.paddle.x + this.paddle.width / 2;
            this.ball.y = this.paddle.y - this.ballRadius;
        } else {
            this.ball.x = this.app.screen.width / 2;
            this.ball.y = this.app.screen.height / 2;
        }
        this.ballSpeed = { x: 3, y: -3 };
    }

    restartGame() {
        this.score = 0;
        this.scoreText.text = `Счет: ${this.score}`;
        this.createBricks();
        this.resetBall();
        this.state = 'WAITING';
        this.messageText.text = 'Кликни, чтобы начать';
        this.messageText.visible = true;

        if (this.tutorialMouseText) this.tutorialMouseText.visible = true;
        if (this.tutorialBricksText) this.tutorialBricksText.visible = true;
    }

    initInteractivity() {
        // Делаем канвас интерактивным для отслеживания указателя мыши и кликов
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;

        this.app.stage.on('pointermove', (event) => {
            const pos = event.data.global;
            const newX = pos.x - this.paddle.width / 2;

            // Ограничиваем движение платформы в пределах экрана
            const minX = 0;
            const maxX = this.app.screen.width - this.paddle.width;
            this.paddle.x = Math.max(minX, Math.min(newX, maxX));

            // В состоянии ожидания мяч следует за платформой
            if (this.state === 'WAITING') {
                this.ball.x = this.paddle.x + this.paddle.width / 2;
            }
        });

        this.app.stage.on('pointerdown', () => {
            if (this.state === 'WAITING') {
                this.state = 'PLAYING';
                this.messageText.text = '';
                if (this.tutorialMouseText) this.tutorialMouseText.visible = false;
                if (this.tutorialBricksText) this.tutorialBricksText.visible = false;
                this.ballSpeed = { x: 3, y: -3 };
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
            // Мяч удерживается на платформе
            this.ball.x = this.paddle.x + this.paddle.width / 2;
            this.ball.y = this.paddle.y - this.ballRadius;
            return;
        }

        if (this.state !== 'PLAYING') {
            return;
        }

        // Движение мяча
        this.ball.x += this.ballSpeed.x * delta;
        this.ball.y += this.ballSpeed.y * delta;

        // Отскок от левой границы
        if (this.ball.x <= this.ballRadius) {
            this.ball.x = this.ballRadius;
            this.ballSpeed.x *= -1;
        }

        // Отскок от правой границы
        if (this.ball.x >= this.app.screen.width - this.ballRadius) {
            this.ball.x = this.app.screen.width - this.ballRadius;
            this.ballSpeed.x *= -1;
        }

        // Отскок от верхней границы
        if (this.ball.y <= this.ballRadius) {
            this.ball.y = this.ballRadius;
            this.ballSpeed.y *= -1;
        }

        // Падение за нижнюю границу -> Game Over
        if (this.ball.y > this.app.screen.height + this.ballRadius) {
            this.state = 'GAME_OVER';
            this.messageText.text = 'Game Over.\nКликни для рестарта';
            return;
        }

        // Столкновение с платформой
        this.checkPaddleCollision();

        // Столкновение с блоками
        this.checkBrickCollisions();

        // Проверка на победу
        if (this.bricks.length === 0) {
            this.state = 'VICTORY';
            this.messageText.text = 'Победа!\nКликни для рестарта';
        }
    }

    checkPaddleCollision() {
        const hitPaddle =
            this.ball.x + this.ballRadius >= this.paddle.x &&
            this.ball.x - this.ballRadius <= this.paddle.x + this.paddle.width &&
            this.ball.y + this.ballRadius >= this.paddle.y &&
            this.ball.y - this.ballRadius <= this.paddle.y + this.paddle.height &&
            this.ballSpeed.y > 0; // Мяч должен двигаться вниз

        if (hitPaddle) {
            // Вычисляем угол отскока в зависимости от точки удара о платформу
            const paddleCenter = this.paddle.x + this.paddle.width / 2;
            const hitOffset = (this.ball.x - paddleCenter) / (this.paddle.width / 2);
            const maxAngle = Math.PI / 3; // 60 градусов
            const bounceAngle = hitOffset * maxAngle;

            const speed = Math.sqrt(this.ballSpeed.x * this.ballSpeed.x + this.ballSpeed.y * this.ballSpeed.y);

            this.ballSpeed.x = speed * Math.sin(bounceAngle);
            this.ballSpeed.y = -speed * Math.cos(bounceAngle);

            // Корректируем позицию, чтобы мяч не застревал в платформе
            this.ball.y = this.paddle.y - this.ballRadius;
        }
    }

    checkBrickCollisions() {
        for (let i = this.bricks.length - 1; i >= 0; i--) {
            const brick = this.bricks[i];
            if (!brick.isAlive) continue;

            const hitBrick =
                this.ball.x + this.ballRadius >= brick.x &&
                this.ball.x - this.ballRadius <= brick.x + brick.width &&
                this.ball.y + this.ballRadius >= brick.y &&
                this.ball.y - this.ballRadius <= brick.y + brick.height;

            if (hitBrick) {
                // Изменяем направление движения по Y
                this.ballSpeed.y *= -1;

                // Помечаем блок как неактивный
                brick.isAlive = false;
                this.bricks.splice(i, 1);

                // Анимация уничтожения блока (увеличение + исчезновение)
                gsap.to(brick.scale, {
                    x: 1.3,
                    y: 1.3,
                    duration: 0.2,
                    ease: 'power1.out'
                });
                gsap.to(brick, {
                    alpha: 0,
                    duration: 0.2,
                    onComplete: () => {
                        this.app.stage.removeChild(brick);
                    }
                });

                // Обновляем счет
                this.score += 10;
                this.scoreText.text = `Счет: ${this.score}`;

                break; // Обрабатываем по одному столкновению за кадр
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new ArkanoidGame();
    game.init();
});
