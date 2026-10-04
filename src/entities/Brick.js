export class Brick {
    constructor(x, y, width, height, color, hp = 1) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.maxHp = hp;
        this.hp = hp;
        this.isAlive = true;
        
        this.graphic = new PIXI.Graphics();
        this.draw();
        this.updatePosition();
    }

    draw() {
        this.graphic.clear();
        
        // для серебряных блоков (2 HP) базовый цвет металлический серебряный
        const baseColor = this.maxHp > 1 ? 0xbdc3c7 : this.color;
        
        this.graphic.beginFill(baseColor);
        this.graphic.drawRect(2, 2, this.width - 4, this.height - 4);
        this.graphic.endFill();

        // если блок поврежден (для 2 HP блоков при первом ударе), рисуем трещины
        if (this.maxHp > 1 && this.hp < this.maxHp) {
            this.graphic.beginFill(0x2c3e50);
            this.graphic.drawRect(10, 6, 2, 8);
            this.graphic.drawRect(12, 12, 6, 2);
            this.graphic.drawRect(18, 10, 2, 6);
            this.graphic.endFill();
        }

        // верхняя и левая грани (блик / highlight)
        const highlightColor = this.getLightenColor(baseColor, 0.4);
        this.graphic.beginFill(highlightColor);
        this.graphic.drawRect(0, 0, this.width, 2);
        this.graphic.drawRect(0, 2, 2, this.height - 2);
        this.graphic.endFill();

        // нижняя и правая грани (тень / shadow)
        const shadowColor = this.getDarkenColor(baseColor, 0.4);
        this.graphic.beginFill(shadowColor);
        this.graphic.drawRect(0, this.height - 2, this.width, 2);
        this.graphic.drawRect(this.width - 2, 0, 2, this.height);
        this.graphic.endFill();
    }

    hit(stage) {
        if (this.hp > 1) {
            this.hp--;
            this.draw();
            this.spawnRicochetParticles(stage);
            return false; // еще не уничтожен
        }
        return true; // уничтожен
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
        this.spawnParticles(stage);

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

    spawnRicochetParticles(stage) {
        for (let i = 0; i < 3; i++) {
            const p = new PIXI.Graphics();
            p.beginFill(0xffffff);
            p.drawRect(0, 0, 3, 3);
            p.endFill();

            p.x = this.x + this.width / 2;
            p.y = this.y + this.height / 2;
            stage.addChild(p);

            const angle = Math.random() * Math.PI * 2;

            gsap.to(p, {
                x: p.x + Math.cos(angle) * 12,
                y: p.y + Math.sin(angle) * 12,
                alpha: 0,
                duration: 0.3,
                onComplete: () => stage.removeChild(p)
            });
        }
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

            gsap.to(p, {
                x: p.x + Math.cos(angle) * 18,
                y: p.y + Math.sin(angle) * 18,
                alpha: 0,
                duration: 0.35 + Math.random() * 0.25,
                ease: 'power2.out',
                onComplete: () => stage.removeChild(p)
            });
        }
    }

    addToStage(stage) {
        stage.addChild(this.graphic);
    }
}
