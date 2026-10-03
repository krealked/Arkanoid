import { Brick } from '../entities/Brick.js';

export class LevelBuilder {
    static createBricks(stage, screenWidth) {
        const bricks = [];
        const rows = 5;
        const cols = 10;
        const brickWidth = 70;
        const brickHeight = 20;
        const padding = 6;
        const topOffset = 60;

        const totalWidth = cols * brickWidth + (cols - 1) * padding;
        const leftOffset = (screenWidth - totalWidth) / 2;

        // цвета для 5 рядов (сверху вниз)
        const colors = [0xe74c3c, 0xe67e22, 0xf1c40f, 0x2ecc71, 0x3498db];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = leftOffset + c * (brickWidth + padding);
                const y = topOffset + r * (brickHeight + padding);
                const color = colors[r];

                const brick = new Brick(x, y, brickWidth, brickHeight, color);
                
                // начальная позиция для анимации появления (падение сверху + fade-in)
                brick.graphic.y = y - 120;
                brick.graphic.alpha = 0;

                brick.addToStage(stage);
                bricks.push(brick);

                // GSAP анимация появления блоков
                gsap.to(brick.graphic, {
                    y: y,
                    alpha: 1,
                    duration: 0.8,
                    delay: (r * cols + c) * 0.01,
                    ease: 'bounce.out'
                });
            }
        }

        return bricks;
    }
}
