export class Brick {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.isAlive = true;
        
        this.graphic = new PIXI.Graphics();
        this.draw();
        
        this.updatePosition();
    }

    draw() {
        this.graphic.clear();
        this.graphic.beginFill(this.color);
        this.graphic.drawRect(0, 0, this.width, this.height);
        this.graphic.endFill();
    }

    updatePosition() {
        this.graphic.x = this.x;
        this.graphic.y = this.y;
    }

    destroy(stage, onComplete) {
        this.isAlive = false;
        
        // анимация уничтожения (увеличение + исчезновение) через GSAP
        gsap.to(this.graphic.scale, {
            x: 1.3,
            y: 1.3,
            duration: 0.2,
            ease: 'power1.out'
        });
        
        gsap.to(this.graphic, {
            alpha: 0,
            duration: 0.2,
            onComplete: () => {
                stage.removeChild(this.graphic);
                if (onComplete) onComplete();
            }
        });
    }

    addToStage(stage) {
        stage.addChild(this.graphic);
    }
}
