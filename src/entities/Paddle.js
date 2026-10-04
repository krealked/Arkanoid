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

        // основной серебристо-серый корпус Vaus
        this.graphic.beginFill(0xcccccc);
        this.graphic.drawRect(4, 2, this.width - 8, this.height - 4);
        this.graphic.endFill();

        // скошенные края
        this.graphic.beginFill(0x95a5a6);
        this.graphic.drawRect(2, 4, 2, this.height - 8);
        this.graphic.drawRect(this.width - 4, 4, 2, this.height - 8);
        this.graphic.endFill();

        // контрастные красные наконечники по бокам
        this.graphic.beginFill(0xe74c3c);
        this.graphic.drawRect(0, 5, 2, this.height - 10);
        this.graphic.drawRect(this.width - 2, 5, 2, this.height - 10);
        this.graphic.endFill();

        // верхний светлый блик (полоса)
        this.graphic.beginFill(0xffffff);
        this.graphic.drawRect(6, 2, this.width - 12, 2);
        this.graphic.endFill();

        // нижняя тень
        this.graphic.beginFill(0x7f8c8d);
        this.graphic.drawRect(4, this.height - 3, this.width - 8, 2);
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
