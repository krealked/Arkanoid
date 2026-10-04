import { PowerUp } from '../entities/PowerUp.js';

export class CollisionManager {
    static checkWallCollisions(ball, screenWidth) {
        // отскок от левой границы с принудительным выталкиванием
        if (ball.x - ball.radius <= 0) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx);
        }

        // отскок от правой границы с принудительным выталкиванием
        if (ball.x + ball.radius >= screenWidth) {
            ball.x = screenWidth - ball.radius;
            ball.vx = -Math.abs(ball.vx);
        }

        // отскок от верхней границы с принудительным выталкиванием
        if (ball.y - ball.radius <= 0) {
            ball.y = ball.radius;
            ball.vy = Math.abs(ball.vy);
        }
    }

    static checkPaddleCollision(ball, paddle) {
        const hitPaddle =
            ball.x + ball.radius >= paddle.x &&
            ball.x - ball.radius <= paddle.x + paddle.width &&
            ball.y + ball.radius >= paddle.y &&
            ball.y - ball.radius <= paddle.y + paddle.height &&
            ball.vy > 0; // мяч должен двигаться вниз

        if (hitPaddle) {
            // вычисляем угол отскока в зависимости от точки удара о платформу
            const paddleCenter = paddle.x + paddle.width / 2;
            const hitOffset = (ball.x - paddleCenter) / (paddle.width / 2);
            const maxAngle = Math.PI / 3; // 60 градусов
            const bounceAngle = hitOffset * maxAngle;

            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

            ball.vx = speed * Math.sin(bounceAngle);
            ball.vy = -speed * Math.cos(bounceAngle);

            // корректируем позицию, чтобы мяч не застревал в платформе
            ball.y = paddle.y - ball.radius;
            return true;
        }
        return false;
    }

    static checkBrickCollisions(ball, bricks, stage, onBrickHit, powerUps) {
        for (let i = bricks.length - 1; i >= 0; i--) {
            const brick = bricks[i];
            if (!brick.isAlive) continue;

            const hitBrick =
                ball.x + ball.radius >= brick.x &&
                ball.x - ball.radius <= brick.x + brick.width &&
                ball.y + ball.radius >= brick.y &&
                ball.y - ball.radius <= brick.y + brick.height;

            if (hitBrick) {
                // предотвращение застревания/туннелирования: выталкиваем мяч наружу из блока по оси Y
                if (ball.vy > 0) {
                    // двигался вниз, ударил снизу блока -> выталкиваем наверх
                    ball.y = brick.y - ball.radius;
                } else {
                    // двигался вверх, ударил сверху блока -> выталкиваем вниз
                    ball.y = brick.y + brick.height + ball.radius;
                }

                // изменяем направление движения по Y
                ball.vy *= -1;

                // наносим урон блоку
                const isDestroyed = brick.hit(stage);

                if (isDestroyed) {
                    brick.destroy(stage);
                    bricks.splice(i, 1);

                    // 28% шанс спавна бонусной капсулы
                    if (Math.random() < 0.28) {
                        const types = ['E', 'D', 'S'];
                        const randomType = types[Math.floor(Math.random() * types.length)];
                        const powerUp = new PowerUp(
                            brick.x + brick.width / 2 - 16,
                            brick.y + brick.height / 2 - 7,
                            randomType
                        );
                        powerUp.addToStage(stage);
                        powerUps.push(powerUp);
                    }

                    if (onBrickHit) onBrickHit(brick, true);
                } else {
                    if (onBrickHit) onBrickHit(brick, false);
                }

                break; // обрабатываем по одному столкновению за кадр
            }
        }
    }

    static checkPowerUpPaddleCollision(powerUps, paddle, stage, onCollected) {
        for (let i = powerUps.length - 1; i >= 0; i--) {
            const p = powerUps[i];
            if (!p.isAlive) continue;

            // проверка столкновения капсулы с платформой
            const hit =
                p.x + p.width >= paddle.x &&
                p.x <= paddle.x + paddle.width &&
                p.y + p.height >= paddle.y &&
                p.y <= paddle.y + paddle.height;

            if (hit) {
                p.removeFromStage(stage);
                powerUps.splice(i, 1);
                if (onCollected) onCollected(p.type);
            } else if (p.y > 600) {
                // капсула упала за нижний край
                p.removeFromStage(stage);
                powerUps.splice(i, 1);
            }
        }
    }
}
