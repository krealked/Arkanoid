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
        
        // центральное тело блока
        this.graphic.beginFill(this.color);
        this.graphic.drawRect(2, 2, this.width - 4, this.height - 4);
        this.graphic.endFill();

        // верхняя и левая грани 
        const highlightColor = this.getLightenColor(this.color, 0.4);
        this.graphic.beginFill(highlightColor);
        this.graphic.drawRect(0, 0, this.width, 2); // верх
        this.graphic.drawRect(0, 2, 2, this.height - 2); // лево
        this.graphic.endFill();

        // нижняя и правая грани (тень / shadow)
        const shadowColor = this.getDarkenColor(this.color, 0.4);
        this.graphic.beginFill(shadowColor);
        this.graphic.drawRect(0, this.height - 2, this.width, 2); // низ
        this.graphic.drawRect(this.width - 2, 0, 2, this.height); // право
        this.graphic.endFill();
    }

    getLightenColor(hex, amount) {
        let r = (hex >> 16) & 0xff;
        let g = (hex >> 8) & 0xff;
        let b = hex & 0xff;
        r = Math.min(255, Math.floor(r + (255 - r) * amount));
        g = Math.min(255, Math.floor(g + (255 - g) * amount));
        b = Math.min(255, Math.floor(b + (255 - b) * amount));
        return (r << 16) | (g << 8) | b;
    }

    getDarkenColor(hex, amount) {
        let r = (hex >> 16) & 0xff;
        let g = (hex >> 8) & 0xff;
        let b = hex & 0xff;
        r = Math.max(0, Math.floor(r * (1 - amount)));
        g = Math.max(0, Math.floor(g * (1 - amount)));
        b = Math.max(0, Math.floor(b * (1 - amount)));
        return (r << 16) | (g << 8) | b;
    }

    updatePosition() {
        this.graphic.x = this.x;
        this.graphic.y = this.y;
    }

    destroy(stage, onComplete) {
        this.isAlive = false;
        
        // спавн пиксельных частиц (искры / дебрис)
        this.spawnParticles(stage);

        // анимация уничтожения (увеличение + исчезновение)
        gsap.to(this.graphic.scale, {
            x: 1.2,
            y: 1.2,
            duration: 0.15,
            ease: 'power1.out'
        });
        
        gsap.to(this.graphic, {
            alpha: 0,
            duration: 0.15,
            onComplete: () => {
                stage.removeChild(this.graphic);
                if (onComplete) onComplete();
            }
        });
    }

    spawnParticles(stage) {
        const particleCount = 7;
        for (let i = 0; i < particleCount; i++) {
            const p = new PIXI.Graphics();
            p.beginFill(this.color);
            p.drawRect(0, 0, 4, 4);
            p.endFill();

            p.x = this.x + this.width / 2;
            p.y = this.y + this.height / 2;
            stage.addChild(p);

            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            gsap.to(p, {
                x: p.x + vx * 18,
                y: p.y + vy * 18,
                alpha: 0,
                duration: 0.35 + Math.random() * 0.25,
                ease: 'power2.out',
                onComplete: () => {
                    stage.removeChild(p);
                }
            });
        }
    }

    addToStage(stage) {
        stage.addChild(this.graphic);
    }
}
