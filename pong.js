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

// Spielmodi-Konfigurationen
const gameModes = {
    classic: {
        ballSpeed: 7,
        paddleHeight: 100,
        paddleSpeed: 8,
        ballSize: 10,
        backgroundColor: '#000000'
    },
    fast: {
        ballSpeed: 12,
        paddleHeight: 80,
        paddleSpeed: 10,
        ballSize: 8,
        backgroundColor: '#001a00'
    },
    extreme: {
        ballSpeed: 15,
        paddleHeight: 60,
        paddleSpeed: 12,
        ballSize: 6,
        backgroundColor: '#003300'
    }
};

let currentMode = 'classic';
let isGameRunning = false;

// Spielinitialisierung
function initGame(mode) {
    currentMode = mode;
    const config = gameModes[mode];

    // Ball zurücksetzen
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = config.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.speedY = config.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.radius = config.ballSize;

    // Paddle-Einstellungen
    leftPaddle.y = canvas.height / 2 - config.paddleHeight / 2;
    rightPaddle.y = canvas.height / 2 - config.paddleHeight / 2;
    leftPaddle.speed = config.paddleSpeed;
    rightPaddle.speed = config.paddleSpeed;
    paddleHeight = config.paddleHeight;

    // Punktestand zurücksetzen
    leftScore = 0;
    rightScore = 0;
}

// Event Listener für Spielstart
document.getElementById('startGame').addEventListener('click', () => {
    const selectedMode = document.getElementById('gameMode').value;
    initGame(selectedMode);
    isGameRunning = true;
    if (!gameLoopRunning) {
        gameLoop();
    }
});

// Modifizierte gameLoop
let gameLoopRunning = false;

function gameLoop() {
    gameLoopRunning = true;

    if (!isGameRunning) {
        return;
    }

    // Canvas leeren mit Hintergrundfarbe des aktuellen Modus
    ctx.fillStyle = gameModes[currentMode].backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Spiellogik
    movePaddles();
    
    // Ballgeschwindigkeit aus aktuellem Modus verwenden
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    checkCollision();

    // Zeichnen
    drawBall();
    drawPaddle(leftPaddle.x, leftPaddle.y);
    drawPaddle(rightPaddle.x, rightPaddle.y);
    drawScore();

    // Modus-Anzeige
    drawGameMode();

    requestAnimationFrame(gameLoop);
}

// Funktion zum Anzeigen des aktuellen Spielmodus
function drawGameMode() {
    ctx.font = '16px "Press Start 2P"';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`Modus: ${currentMode.toUpperCase()}`, 10, 30);
}

// Modifizierte Kollisionserkennung für verschiedene Paddle-Größen
function checkCollision() {
    const currentPaddleHeight = gameModes[currentMode].paddleHeight;

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
            ball.y - ball.radius < paddle.y + currentPaddleHeight) {
            ball.speedX = -ball.speedX;
            
            // Geschwindigkeit leicht erhöhen bei Paddle-Treffer
            ball.speedX *= 1.05;
            ball.speedY *= 1.05;
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

// Modifizierte resetBall Funktion
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    const config = gameModes[currentMode];
    ball.speedX = config.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.speedY = config.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
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

// Spiel starten
gameLoop(); 