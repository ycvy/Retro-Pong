// Canvas und Kontext einrichten
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Grundeinstellungen für Paddle und Ball
const paddleWidth = 10;
let paddleHeight = 100;

// Spielobjekte mit korrekten Startpositionen
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speedX: 7,
    speedY: 7
};

const leftPaddle = {
    x: 0, // Linker Rand
    y: canvas.height / 2 - paddleHeight / 2,
    speed: 8
};

const rightPaddle = {
    x: canvas.width - paddleWidth, // Rechter Rand
    y: canvas.height / 2 - paddleHeight / 2,
    speed: 8
};

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
        ballSpeed: 8,
        paddleHeight: 80,
        paddleSpeed: 10,
        ballSize: 8,
        backgroundColor: '#001a00'
    },
    extreme: {
        ballSpeed: 10,
        paddleHeight: 60,
        paddleSpeed: 12,
        ballSize: 6,
        backgroundColor: '#003300'
    }
};

let currentMode = 'classic';
let isGameRunning = false;
let gameLoopRunning = false;
let leftScore = 0;
let rightScore = 0;

// Tastatursteuerung
const keys = {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false
};

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

function drawBall() {
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(x, y) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(x, y, paddleWidth, paddleHeight);
}

function drawScore() {
    document.getElementById('leftScore').textContent = leftScore;
    document.getElementById('rightScore').textContent = rightScore;
}

function drawGameMode() {
    ctx.font = '16px Courier New';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`Modus: ${currentMode.toUpperCase()}`, 10, 30);
}

function checkCollision() {
    // Kollision mit oberem und unterem Rand
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.speedY = -ball.speedY;
        // Leichte Zufallsvariation bei Wandkollision
        ball.speedY += (Math.random() - 0.5) * 2;
    }

    // Kollision mit Paddles
    if (ball.x - ball.radius < leftPaddle.x + paddleWidth &&
        ball.y > leftPaddle.y &&
        ball.y < leftPaddle.y + paddleHeight) {
        
        // Berechne Aufprallposition relativ zur Paddlemitte
        const relativeIntersectY = (leftPaddle.y + (paddleHeight / 2)) - ball.y;
        const normalizedIntersect = relativeIntersectY / (paddleHeight / 2);
        
        // Berechne neuen Winkel (-60 bis 60 Grad)
        const bounceAngle = normalizedIntersect * Math.PI/3;
        
        // Geschwindigkeit basierend auf aktuellem Modus
        const speed = gameModes[currentMode].ballSpeed * 1.1;
        
        // Neue Geschwindigkeiten berechnen
        ball.speedX = speed * Math.cos(bounceAngle);
        ball.speedY = -speed * Math.sin(bounceAngle);
        
        // Zusätzliche Zufallsvariation
        ball.speedY += (Math.random() - 0.5) * 2;
    }

    // Ähnliche Logik für das rechte Paddle
    if (ball.x + ball.radius > rightPaddle.x &&
        ball.y > rightPaddle.y &&
        ball.y < rightPaddle.y + paddleHeight) {
        
        const relativeIntersectY = (rightPaddle.y + (paddleHeight / 2)) - ball.y;
        const normalizedIntersect = relativeIntersectY / (paddleHeight / 2);
        const bounceAngle = normalizedIntersect * Math.PI/3;
        const speed = gameModes[currentMode].ballSpeed * 1.1;
        
        ball.speedX = -speed * Math.cos(bounceAngle);
        ball.speedY = -speed * Math.sin(bounceAngle);
        
        ball.speedY += (Math.random() - 0.5) * 2;
    }

    // Geschwindigkeitsbegrenzung an den aktuellen Modus anpassen
    const config = gameModes[currentMode];
    const maxSpeed = config.ballSpeed * 1.5; // Maximale Geschwindigkeit relativ zur Basis-Geschwindigkeit

    // Geschwindigkeit begrenzen
    if (Math.abs(ball.speedX) > maxSpeed) {
        ball.speedX = maxSpeed * Math.sign(ball.speedX);
    }
    if (Math.abs(ball.speedY) > maxSpeed) {
        ball.speedY = maxSpeed * Math.sign(ball.speedY);
    }

    // Punkt vergeben
    if (ball.x + ball.radius > canvas.width) {
        leftScore++;
        resetBall();
    } else if (ball.x - ball.radius < 0) {
        rightScore++;
        resetBall();
    }
}

function resetBall() {
    const config = gameModes[currentMode];
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Exakte Anfangsgeschwindigkeit aus der Moduskonfiguration
    ball.speedX = config.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.speedY = config.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
}

function initGame(mode) {
    currentMode = mode;
    const config = gameModes[mode];

    // Ball vollständig zurücksetzen
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Exakte Geschwindigkeit aus der Moduskonfiguration setzen
    ball.speedX = config.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.speedY = config.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.radius = config.ballSize;

    // Paddle-Einstellungen
    paddleHeight = config.paddleHeight;
    leftPaddle.y = canvas.height / 2 - paddleHeight / 2;
    rightPaddle.y = canvas.height / 2 - paddleHeight / 2;
    leftPaddle.speed = config.paddleSpeed;
    rightPaddle.speed = config.paddleSpeed;

    // Punktestand zurücksetzen
    leftScore = 0;
    rightScore = 0;
}

// Globale Variable für den Animation Frame
let animationFrameId = null;

function gameLoop() {
    if (!isGameRunning) {
        // Wenn das Spiel nicht läuft, Animation Frame abbrechen
        cancelAnimationFrame(animationFrameId);
        gameLoopRunning = false;
        return;
    }

    // Canvas leeren
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Hintergrund zeichnen
    ctx.fillStyle = gameModes[currentMode].backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    drawGameMode();

    // Speichere die ID des nächsten Frames
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Event Listener für Spielstart aktualisieren
document.getElementById('startGame').addEventListener('click', () => {
    // Wenn bereits ein Game Loop läuft, diesen zuerst stoppen
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        gameLoopRunning = false;
    }

    const selectedMode = document.getElementById('gameMode').value;
    initGame(selectedMode);
    isGameRunning = true;
    gameLoopRunning = true;
    gameLoop();
}); 