const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');

// Game Settings
const gridSize = 30; // Large size for easy visibility
const tileCount = canvas.width / gridSize;
let gameSpeed = parseInt(speedRange.value); // Initial speed from slider

// Speed Control Logic
speedRange.addEventListener('input', (e) => {
    gameSpeed = parseInt(e.target.value);
    
    // Update text display
    // Using simple ranges: 100(fast) - 600(slow)
    // Remember: lower number = faster speed
    if (gameSpeed > 500) {
        speedValue.textContent = "Very Slow";
    } else if (gameSpeed > 400) {
        speedValue.textContent = "Slow";
    } else if (gameSpeed > 300) {
        speedValue.textContent = "Normal";
    } else if (gameSpeed > 200) {
        speedValue.textContent = "Fast";
    } else {
        speedValue.textContent = "Super Fast!";
    }

    // If game is running, update speed immediately
    if (isGameRunning) {
        clearInterval(gameLoopId);
        gameLoopId = setInterval(gameLoop, gameSpeed);
    }
});

// Snake and Food
let snake = [];
let food = { x: 10, y: 10 };
let dx = 0;
let dy = 0;
let score = 0;
let gameLoopId;
let isGameRunning = false;

// Colors
const snakeColor = '#32cd32'; // Lime green
const snakeHeadColor = '#006400'; // Dark green
const foodColor = '#ff0000'; // Red apple

// Initialize Game
function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    score = 0;
    dx = 1; // Start moving right
    dy = 0;
    scoreElement.textContent = 'Score: ' + score;
    placeFood();
    isGameRunning = true;

    if (gameLoopId) clearInterval(gameLoopId);
    gameLoopId = setInterval(gameLoop, gameSpeed);
}

// Game Loop
function gameLoop() {
    if (!isGameRunning) return;

    moveSnake();
    if (checkCollision()) {
        gameOver();
        return;
    }
    draw();
}

// Move Snake
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = 'Score: ' + score;
        placeFood();
        // Maybe play a sound or show a "Yum!" message here?
    } else {
        snake.pop();
    }
}

// Check Collision
function checkCollision() {
    const head = snake[0];

    // Wall collision - Forgiving mode: Stop game but don't crash, just show play again
    // Or maybe wrap around? Let's make it hit playing walls for now but clear "Oops!" message
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// Draw Everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food (Apple)
    ctx.fillStyle = foodColor;
    ctx.beginPath();
    ctx.arc((food.x * gridSize) + gridSize / 2, (food.y * gridSize) + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw Snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? snakeHeadColor : snakeColor;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);

        // Eyes for the head
        if (index === 0) {
            ctx.fillStyle = 'white';
            const eyeOffset = gridSize / 4;
            const eyeSize = gridSize / 6;
            // Simple logic to position eyes based on direction
            ctx.beginPath();
            ctx.arc((segment.x * gridSize) + eyeOffset, (segment.y * gridSize) + eyeOffset, eyeSize, 0, Math.PI * 2); // Top-left/right depending on rotation
            ctx.arc((segment.x * gridSize) + gridSize - eyeOffset, (segment.y * gridSize) + eyeOffset, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc((segment.x * gridSize) + eyeOffset, (segment.y * gridSize) + eyeOffset, eyeSize / 2, 0, Math.PI * 2);
            ctx.arc((segment.x * gridSize) + gridSize - eyeOffset, (segment.y * gridSize) + eyeOffset, eyeSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// Place Food
function placeFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // Make sure food doesn't spawn on snake
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood();
        }
    });
}

// Game Over
function gameOver() {
    isGameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '50px Comic Sans MS';
    ctx.textAlign = 'center';
    ctx.fillText('Oops!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '30px Comic Sans MS';
    ctx.fillText('Try Again JoJo!', canvas.width / 2, canvas.height / 2 + 30);
}

// Controls
document.addEventListener('keydown', (e) => {
    // Prevent scrolling with arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    if (!isGameRunning) return;

    switch (e.key) {
        case 'ArrowUp':
            if (dy === 0) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy === 0) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx === 0) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx === 0) { dx = 1; dy = 0; }
            break;
    }
});

restartBtn.addEventListener('click', initGame);

// Start game on load
initGame();
