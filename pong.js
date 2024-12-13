// Canvas und Kontext einrichten
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Spielobjekte
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speedX: 7,
    speedY: 7
};

const paddleHeight = 100;
const paddleWidth = 10;

const leftPaddle = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    speed: 8
};

const rightPaddle = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    speed: 8
};

// Punktestand
let leftScore = 0;
let rightScore = 0;

// Tastatursteuerung
const keys = {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false
};

// Event Listener für Tastensteuerung
document.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

// Paddle Bewegung
function movePaddles() {
    // Linkes Paddle (W und S)
    if (keys.w && leftPaddle.y > 0) {
        leftPaddle.y -= leftPaddle.speed;
    }
    if (keys.s && leftPaddle.y < canvas.height - paddleHeight) {
        leftPaddle.y += leftPaddle.speed;
    }

    // Rechtes Paddle (Pfeiltasten)
    if (keys.ArrowUp && rightPaddle.y > 0) {
        rightPaddle.y -= rightPaddle.speed;
    }
    if (keys.ArrowDown && rightPaddle.y < canvas.height - paddleHeight) {
        rightPaddle.y += rightPaddle.speed;
    }
}

// Kollisionserkennung
function checkCollision() {
    // Kollision mit oberem und unterem Rand
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
    }

    // Kollision mit Paddles
    const paddles = [
        { x: leftPaddle.x, y: leftPaddle.y },
        { x: rightPaddle.x, y: rightPaddle.y }
    ];

    paddles.forEach(paddle => {
        if (ball.x + ball.radius > paddle.x && 
            ball.x - ball.radius < paddle.x + paddleWidth &&
            ball.y + ball.radius > paddle.y && 
            ball.y - ball.radius < paddle.y + paddleHeight) {
            ball.speedX = -ball.speedX;
        }
    });

    // Punkt vergeben
    if (ball.x + ball.radius > canvas.width) {
        leftScore++;
        resetBall();
    } else if (ball.x - ball.radius < 0) {
        rightScore++;
        resetBall();
    }
}

// Ball zurücksetzen
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = -ball.speedX;
}

// Zeichenfunktionen
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(x, y) {
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, paddleWidth, paddleHeight);
}

function drawScore() {
    document.getElementById('leftScore').textContent = leftScore;
    document.getElementById('rightScore').textContent = rightScore;
}

// Hauptspielschleife
function gameLoop() {
    // Canvas leeren
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spiellogik
    movePaddles();
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    checkCollision();

    // Zeichnen
    drawBall();
    drawPaddle(leftPaddle.x, leftPaddle.y);
    drawPaddle(rightPaddle.x, rightPaddle.y);
    drawScore();

    requestAnimationFrame(gameLoop);
}

// Spiel starten
gameLoop(); 