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
        this.ballRadius = 8;
        this.ballSpeed = { x: 3, y: -3 };
    }

    async init() {
        // Appending the canvas view to body
        document.body.appendChild(this.app.view);

        // Create game objects
        this.createPaddle();
        this.createBall();

        // Initialize interactivity and game loop
        this.initMouseControl();
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

    initMouseControl() {
        // Делаем канвас интерактивным для отслеживания указателя мыши
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;

        this.app.stage.on('pointermove', (event) => {
            const pos = event.data.global;
            const newX = pos.x - this.paddle.width / 2;

            // Ограничиваем движение платформы в пределах экрана
            const minX = 0;
            const maxX = this.app.screen.width - this.paddle.width;
            this.paddle.x = Math.max(minX, Math.min(newX, maxX));
        });
    }

    setupGameLoop() {
        this.app.ticker.add((delta) => {
            this.update(delta);
        });
    }

    update(delta) {
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

        // Падение за нижнюю границу
        if (this.ball.y > this.app.screen.height + this.ballRadius) {
            this.resetBall();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new ArkanoidGame();
    game.init();
});
