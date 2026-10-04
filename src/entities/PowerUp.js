export class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'E' (Expand), 'D' (Disruption), 'S' (Slow)
        this.width = 32;
        this.height = 14;
        this.vy = 2.2;
        this.isAlive = true;

        this.container = new PIXI.Container();
        this.container.x = this.x;
        this.container.y = this.y;

        this.draw();
    }

    draw() {
        this.graphic = new PIXI.Graphics();
        
        let color = 0x3498db; 
        if (this.type === 'D') color = 0x00cec9; 
        if (this.type === 'S') color = 0xe67e22; 

        // форма пилюли
        this.graphic.beginFill(color);
        this.graphic.drawRoundedRect(0, 0, this.width, this.height, 6);
        this.graphic.endFill();

        // световой контур
        this.graphic.lineStyle(1, 0xffffff, 0.8);
        this.graphic.drawRoundedRect(0, 0, this.width, this.height, 6);

        this.container.addChild(this.graphic);

        // буква по центру
        const textStyle = new PIXI.TextStyle({
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 10,
            fill: '#ffffff',
            fontWeight: 'bold'
        });

        this.text = new PIXI.Text(this.type, textStyle);
        this.text.anchor.set(0.5);
        this.text.x = this.width / 2;
        this.text.y = this.height / 2;
        this.container.addChild(this.text);
    }

    update(delta) {
        this.y += this.vy * delta;
        this.container.y = this.y;
    }

    addToStage(stage) {
        stage.addChild(this.container);
    }

    removeFromStage(stage) {
        if (this.container.parent) {
            stage.removeChild(this.container);
        }
        this.isAlive = false;
    }
}
