export class Ball {
    constructor() {
        this.radius = 8;
        this.graphic = new PIXI.Graphics();
        this.vx = 3;
        this.vy = -3;
        
        this.draw();
        this.x = 0;
        this.y = 0;
    }

    draw() {
        this.graphic.clear();
        this.graphic.beginFill(0xf1c40f); // желтый цвет
        this.graphic.drawCircle(0, 0, this.radius);
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
