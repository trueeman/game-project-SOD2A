const startMenu = document.getElementById('startMenu');
const startButton = document.getElementById('startButton');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
canvas.width = window.innerWidth * 0.75; // Set canvas width to 75% of window width
canvas.height = window.innerHeight * 0.75; // Set canvas height to 75% of window height

// Game world boundaries
const worldWidth = 1500;
const worldHeight = 1000;

// Player properties
const playerCircle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 2.5,
    angle: 0,
    lives: 3, // Initial lives
    lastShotTime: 0, // Timestamp of the last shot
    shootCooldown: 500, // Cooldown time between shots in milliseconds
};

// Enemy properties
const enemyCircle = {
    radius: 20,
    lives: 3, // Initial lives
    shootCooldown: 2500, // 3 seconds cooldown between shots
    x: Math.random() * worldWidth, // Random x position within canvas width
    y: Math.random() * worldHeight // Random y position within canvas height
};

// Triangle properties
const triangle = {
    distance: 35, // Distance from the center of the playerCircle
    size: 10 // Size of the triangle
};

// Bullets array and properties
const bullets = [];
const bulletSpeed = 5;

// Enemy bullets array and properties
const enemyBullets = [];
const enemyBulletSpeed = 2.5;


// Keyboard input tracking
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

let isPaused = false;

// Distortion effect parameters
let distortionLevel = 0; // Initial distortion level
const maxDistortion = 10; // Maximum blur radius

// Player flashing and invincibility variables
let playerFlashTimer = 0; // Timer for player flashing effect
let isPlayerInvincible = false; // Flag to indicate if player is invincible

// Event listeners for keyboard input (on window for global handling)
window.addEventListener('keydown', (e) => {
    if (e.key === 'w') keys.w = true;
    if (e.key === 'a') keys.a = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'd') keys.d = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'w') keys.w = false;
    if (e.key === 'a') keys.a = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'd') keys.d = false;
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        isPaused = !isPaused;
    }
});

// Event listener for mouse movement on the canvas
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    playerCircle.angle = Math.atan2(mouseY - canvas.height / 2, mouseX - canvas.width / 2);
});

// Event listener for mouse click on the canvas (shooting bullets)
canvas.addEventListener('click', () => {
    // Check if enough time has passed since the last shot
    const currentTime = Date.now();
    if (currentTime - playerCircle.lastShotTime > playerCircle.shootCooldown) {
        bullets.push({
            x: playerCircle.x,
            y: playerCircle.y,
            angle: playerCircle.angle
        });
        playerCircle.lastShotTime = currentTime; // Update last shot time
    }
});

// Function to update game state
function update() {
    if (isPaused) return; // Skip update if the game is paused
    
    let dx = 0;
    let dy = 0;

    // Handle player movement based on keyboard input
    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;

    // Normalize movement vector if needed
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude > 0) {
        dx = (dx / magnitude) * playerCircle.speed;
        dy = (dy / magnitude) * playerCircle.speed;
    }

    // Update player position
    playerCircle.x += dx;
    playerCircle.y += dy;

    // Keep player within world boundaries
    playerCircle.x = Math.max(playerCircle.radius, Math.min(worldWidth - playerCircle.radius, playerCircle.x));
    playerCircle.y = Math.max(playerCircle.radius, Math.min(worldHeight - playerCircle.radius, playerCircle.y));

    // Check collision with enemy circle
    const distanceToEnemy = Math.sqrt((playerCircle.x - enemyCircle.x) ** 2 + (playerCircle.y - enemyCircle.y) ** 2);
    if (distanceToEnemy < playerCircle.radius + enemyCircle.radius && !isPlayerInvincible) {
        // Player touches the enemy circle and is not invincible
        playerCircle.lives--;

        // Move enemy to a new random position - Comment this out to prevent changing enemy position
        // enemyCircle.x = Math.random() * canvas.width;
        // enemyCircle.y = Math.random() * canvas.height;

        // Activate flashing and invincibility for 2 seconds
        playerFlashTimer = 2000;
        isPlayerInvincible = true;

        // Reset invincibility after 2 seconds
        setTimeout(() => {
            isPlayerInvincible = false;
        }, 2000);

        // Check if player is out of lives
        if (playerCircle.lives <= 0) {
            gameOver();
        }
    }

    // Update bullet positions and remove bullets that go off-screen
    bullets.forEach((bullet, index) => {
        bullet.x += Math.cos(bullet.angle) * bulletSpeed;
        bullet.y += Math.sin(bullet.angle) * bulletSpeed;

        if (bullet.x < 0 || bullet.x > worldWidth || bullet.y < 0 || bullet.y > worldHeight) {
            bullets.splice(index, 1);
        }

        const distanceSq = (enemyCircle.x - bullet.x) ** 2 + (enemyCircle.y - bullet.y) ** 2;
        const minDistance = enemyCircle.radius + 3; // Enemy circle radius + bullet radius
    
        if (distanceSq < minDistance ** 2) {
            // Enemy hit by player bullet
            enemyCircle.lives--;
            bullets.splice(index, 1); // Remove the bullet
        
            // Check if enemy is out of lives
            if (enemyCircle.lives <= 0) {
                // Move enemy to a new random position
                enemyCircle.x = Math.random() * worldWidth;
                enemyCircle.y = Math.random() * worldHeight;
                enemyCircle.lives = 3; // Reset enemy lives
            
                // Update score
                score += 100;
                scoreElement.textContent = score;
            }
        }
    });


    // Update enemy behavior
    updateEnemy();

    // Update enemy bullet positions and remove bullets that go off-screen
    enemyBullets.forEach((bullet, index) => {
        bullet.x += Math.cos(bullet.angle) * enemyBulletSpeed;
        bullet.y += Math.sin(bullet.angle) * enemyBulletSpeed;

        if (bullet.x < 0 || bullet.x > worldWidth || bullet.y < 0 || bullet.y > worldHeight) {
            enemyBullets.splice(index, 1);
        }
    });

    // Update distortion level based on time for pulsating effect
    distortionLevel = Math.sin(Date.now() / 2000) * maxDistortion;

    // Update player flash timer and invincibility
    if (playerFlashTimer > 0) {
        playerFlashTimer -= 16; // Decrease by frame time (assuming 60 FPS)
    } else {
        isPlayerInvincible = false; // End invincibility after flashing period
    }

    // Check for collisions
    checkCollisions();
}


function updateEnemy() {
    // Calculate angle from enemy to player
    const angleToPlayer = Math.atan2(playerCircle.y - enemyCircle.y, playerCircle.x - enemyCircle.x);

    // Check if enough time has passed since the last enemy shot
    const currentTime = Date.now();
    if (currentTime - enemyCircle.lastShotTime > enemyCircle.shootCooldown) {
        // Enemy shoots a bullet towards the player
        enemyBullets.push({
            x: enemyCircle.x,
            y: enemyCircle.y,
            angle: angleToPlayer
        });
        enemyCircle.lastShotTime = currentTime; // Update last shot time
    }
}

function checkCollisions() {
    // Check collisions between player and enemy bullets
    enemyBullets.forEach((bullet, index) => {
        const distanceSq = (playerCircle.x - bullet.x) ** 2 + (playerCircle.y - bullet.y) ** 2;
        const minDistance = playerCircle.radius + 3; // Player circle radius + bullet radius

        if (distanceSq < minDistance ** 2 && !isPlayerInvincible) {
            // Player hit by enemy bullet
            playerCircle.lives--;
            enemyBullets.splice(index, 1);

            // Activate flashing and invincibility for 2 seconds
            playerFlashTimer = 2000;
            isPlayerInvincible = true;

            // Reset invincibility after 2 seconds
            setTimeout(() => {
                isPlayerInvincible = false;
            }, 2000);

            // Check if player is out of lives
            if (playerCircle.lives <= 0) {
                gameOver();
            }
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lives indicator on the top left side
    const livesX = 25; // Starting X position for lives indicator
    const livesY = 25; // Starting Y position for lives indicator
    const livesSpacing = 20; // Spacing between each life indicator
    const lifeRadius = 10; // Radius of each life indicator

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'black';

    // Draw player lives
    for (let i = 0; i < playerCircle.lives; i++) {
        const lifeX = livesX + i * (2 * lifeRadius + livesSpacing);

        // Draw white outline for each life
        ctx.beginPath();
        ctx.arc(lifeX, livesY, lifeRadius + 2, 0, Math.PI * 2);
        ctx.stroke();

        // Draw black filled circle for each life
        ctx.beginPath();
        ctx.arc(lifeX, livesY, lifeRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Calculate the camera offset to center the player
    const offsetX = canvas.width / 2 - playerCircle.x;
    const offsetY = canvas.height / 2 - playerCircle.y;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Draw game world boundaries with white outline
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, worldWidth, worldHeight);

    // Draw bullets
    bullets.forEach(bullet => {
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.restore();
    });

    // Draw enemy circle
    ctx.beginPath();
    ctx.arc(enemyCircle.x, enemyCircle.y, enemyCircle.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();

    // Draw enemy bullets
    enemyBullets.forEach(bullet => {
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.restore();
    });

    // Draw white outline for player circle and triangle
    if (!isPlayerInvincible || (isPlayerInvincible && playerFlashTimer % 200 < 100)) {
        ctx.save();
        ctx.translate(playerCircle.x, playerCircle.y);
        ctx.rotate(playerCircle.angle);
        ctx.beginPath();
        ctx.arc(0, 0, playerCircle.radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Draw player circle
        ctx.save();
        ctx.translate(playerCircle.x, playerCircle.y);
        ctx.rotate(playerCircle.angle);
        ctx.beginPath();
        ctx.arc(0, 0, playerCircle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.restore();

        // Draw triangle
        const triangleX = playerCircle.x + Math.cos(playerCircle.angle) * triangle.distance;
        const triangleY = playerCircle.y + Math.sin(playerCircle.angle) * triangle.distance;

        ctx.save();
        ctx.translate(triangleX, triangleY);
        ctx.rotate(playerCircle.angle + Math.PI / 2); // Rotate the triangle 90 degrees to align with the cursor direction
        ctx.beginPath();
        ctx.moveTo(0, -triangle.size / 2);
        ctx.lineTo(triangle.size / 1, triangle.size / 2);
        ctx.lineTo(-triangle.size / 1, triangle.size / 2);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.restore();
    }

    ctx.restore(); // Restore the initial context state after applying the camera offset

    // Apply distortion effect
    ctx.save();
    ctx.filter = `blur(${Math.abs(distortionLevel)}px)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();

    // If player has no lives left, display game over
    if (playerCircle.lives <= 0) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }

    // Draw "Paused" text if the game is paused
    if (isPaused) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
}


// Define a variable to track game over state
let isGameOver = false;

// Game over function
function gameOver() {
    // Stop the game loop or perform any necessary game over actions
    // For now, we'll just log a message to the console
    console.log('Game Over!');

    // Set game over state to true
    isGameOver = true;
}

// Game loop
function loop() {
    if (isGameOver) {
        return; // Exit the loop if game over
    }

    update();
    draw();
    requestAnimationFrame(loop);
}

// Start the game when the start button is clicked
startButton.addEventListener('click', () => {
    startMenu.style.display = 'none';
    canvas.style.display = 'block';
    loop();
});

// Interval for enemy shooting
setInterval(() => {
    const angleToPlayer = Math.atan2(playerCircle.y - enemyCircle.y, playerCircle.x - enemyCircle.x);
    enemyBullets.push({
        x: enemyCircle.x,
        y: enemyCircle.y,
        angle: angleToPlayer
    });
}, enemyCircle.shootCooldown);

// Collision detection function
function checkCollisions() {
    // Check collisions between player and enemy bullets
    enemyBullets.forEach((bullet, index) => {
        const distanceSq = (playerCircle.x - bullet.x) ** 2 + (playerCircle.y - bullet.y) ** 2;
        const minDistance = playerCircle.radius + 3; // Player circle radius + bullet radius

        if (distanceSq < minDistance ** 2 && !isPlayerInvincible) {
            // Player hit by enemy bullet
            playerCircle.lives--;
            enemyBullets.splice(index, 1);

            // Activate flashing and invincibility for 2 seconds
            playerFlashTimer = 2000;
            isPlayerInvincible = true;

            // Reset invincibility after 2 seconds
            setTimeout(() => {
                isPlayerInvincible = false;
            }, 2000);

            // Check if player is out of lives
            if (playerCircle.lives <= 0) {
                gameOver();
            }
        }
    });
}

// Initialize game function
function initializeGame() {
    // Reset player position and lives
    playerCircle.x = canvas.width / 2;
    playerCircle.y = canvas.height / 2;
    playerCircle.lives = 3;

    // Reset enemy position randomly
    enemyCircle.x = Math.random() * canvas.width;
    enemyCircle.y = Math.random() * canvas.height;
    enemyCircle.lives = 3;

    // Reset score
    score = 0;
    scoreElement.textContent = score;

    isGameOver = false; // Reset game over state
}


// Initialize the game
initializeGame();
