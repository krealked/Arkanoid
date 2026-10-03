export class Paddle {
    constructor(appWidth, appHeight) {
        this.width = 100;
        this.height = 15;
        this.graphic = new PIXI.Graphics();
        
        this.draw();
        
        // позиционируем внизу по центру
        this.x = (appWidth - this.width) / 2;
        this.y = appHeight - 60;
        this.updatePosition();
    }

    draw() {
        this.graphic.clear();
        this.graphic.beginFill(0x3498db); // синий цвет
        this.graphic.drawRect(0, 0, this.width, this.height);
        this.graphic.endFill();
    }

    updatePosition() {
        this.graphic.x = this.x;
        this.graphic.y = this.y;
    }

    setX(x, screenWidth) {
        const minX = 0;
        const maxX = screenWidth - this.width;
        this.x = Math.max(minX, Math.min(x, maxX));
        this.updatePosition();
    }

    addToStage(stage) {
        stage.addChild(this.graphic);
    }
}
