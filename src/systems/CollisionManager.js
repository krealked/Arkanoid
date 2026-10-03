export class CollisionManager {
    static checkWallCollisions(ball, screenWidth, onBottomHit) {
        // отскок от левой границы
        if (ball.x <= ball.radius) {
            ball.x = ball.radius;
            ball.vx *= -1;
        }

        // отскок от правой границы
        if (ball.x >= screenWidth - ball.radius) {
            ball.x = screenWidth - ball.radius;
            ball.vx *= -1;
        }

        // отскок от верхней границы
        if (ball.y <= ball.radius) {
            ball.y = ball.radius;
            ball.vy *= -1;
        }

        // падение за нижнюю границу
        if (ball.y > screenHeight + ball.radius) {
            if (onBottomHit) onBottomHit();
        }
    }

    static checkPaddleCollision(ball, paddle) {
        const hitPaddle =
            ball.x + ball.radius >= paddle.x &&
            ball.x - ball.radius <= paddle.x + paddle.width &&
            ball.y + ball.radius >= paddle.y &&
            ball.y - ball.radius <= paddle.y + paddle.height &&
            ball.vy > 0; 

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

    static checkBrickCollisions(ball, bricks, stage, onBrickHit) {
        for (let i = bricks.length - 1; i >= 0; i--) {
            const brick = bricks[i];
            if (!brick.isAlive) continue;

            const hitBrick =
                ball.x + ball.radius >= brick.x &&
                ball.x - ball.radius <= brick.x + brick.width &&
                ball.y + ball.radius >= brick.y &&
                ball.y - ball.radius <= brick.y + brick.height;

            if (hitBrick) {
                // изменяем направление движения по Y
                ball.vy *= -1;

                // удаляем блок через его метод разрушения
                brick.destroy(stage, () => {
                });

                bricks.splice(i, 1);

                if (onBrickHit) onBrickHit(brick);

                break; // обрабатываем по одному столкновению за кадр
            }
        }
    }
}
const screenHeight = 600;
