export class Ball {
    constructor() {
        this.radius = 8; // сохраняет радиус для коллизий
        this.graphic = new PIXI.Graphics();
        this.vx = 3;
        this.vy = -3;
        
        this.draw();
        this.x = 0;
        this.y = 0;
    }

    draw() {
        this.graphic.clear();
        
        
        const size = this.radius * 2;
        
        // внешняя рамка
        this.graphic.beginFill(0xd35400);
        this.graphic.drawRect(-this.radius, -this.radius, size, size);
        this.graphic.endFill();

        // основное тело мяча (оранжево-красное)
        this.graphic.beginFill(0xe67e22);
        this.graphic.drawRect(-this.radius + 1, -this.radius + 1, size - 2, size - 2);
        this.graphic.endFill();

        // яркое белое ядро в центре
        this.graphic.beginFill(0xffffff);
        this.graphic.drawRect(-2, -2, 4, 4);
        this.graphic.endFill();
    }

    updatePosition() {
        this.graphic.x = this.x;
        this.graphic.y = this.y;
    }

    resetToPaddle(paddle) {
        this.x = paddle.x + paddle.width / 2;
        this.y = paddle.y - this.radius;
        this.vx = 3;
        this.vy = -3;
        this.updatePosition();
    }

    addToStage(stage) {
        stage.addChild(this.graphic);
    }
}
