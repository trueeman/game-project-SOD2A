const startMenu = document.getElementById('startMenu');
const startButton = document.getElementById('startButton');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.75; // Set canvas width to 75% of window width
canvas.height = window.innerHeight * 0.75; // Set canvas height to 75% of window height

startButton.addEventListener('click', () => {
    startMenu.style.display = 'none';
    canvas.style.display = 'block';
    loop();
});

const playerCircle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 2.5,
    angle: 0
};

const triangle = {
    distance: 35, // Distance from the center of the playerCircle
    size: 10 // Size of the triangle
};

const bullets = [];
const bulletSpeed = 5;
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

let distortionLevel = 0; // Initial distortion level
const maxDistortion = 10; // Maximum blur radius

// Game world boundaries
const worldWidth = 2000;
const worldHeight = 2000;

document.addEventListener('keydown', (e) => {
    if (e.key === 'w') keys.w = true;
    if (e.key === 'a') keys.a = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'd') keys.d = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'w') keys.w = false;
    if (e.key === 'a') keys.a = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'd') keys.d = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    playerCircle.angle = Math.atan2(mouseY - canvas.height / 2, mouseX - canvas.width / 2);
});

canvas.addEventListener('click', () => {
    bullets.push({
        x: playerCircle.x,
        y: playerCircle.y,
        angle: playerCircle.angle
    });
});

function update() {
    let dx = 0;
    let dy = 0;

    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;

    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude > 0) {
        dx = (dx / magnitude) * playerCircle.speed;
        dy = (dy / magnitude) * playerCircle.speed;
    }

    playerCircle.x += dx;
    playerCircle.y += dy;

    // Keep player within world boundaries
    playerCircle.x = Math.max(playerCircle.radius, Math.min(worldWidth - playerCircle.radius, playerCircle.x));
    playerCircle.y = Math.max(playerCircle.radius, Math.min(worldHeight - playerCircle.radius, playerCircle.y));

    bullets.forEach((bullet, index) => {
        bullet.x += Math.cos(bullet.angle) * bulletSpeed;
        bullet.y += Math.sin(bullet.angle) * bulletSpeed;

        // Remove bullets that go off-screen
        if (bullet.x < 0 || bullet.x > worldWidth || bullet.y < 0 || bullet.y > worldHeight) {
            bullets.splice(index, 1);
        }
    });

    // Update distortion level based on sine function for pulsating effect
    distortionLevel = Math.sin(Date.now() / 2000) * maxDistortion;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the camera offset to center the player
    const offsetX = canvas.width / 2 - playerCircle.x;
    const offsetY = canvas.height / 2 - playerCircle.y;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Draw game world boundaries
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, worldWidth, worldHeight);

    // Draw bullets
    bullets.forEach(bullet => {
        ctx.save();
        ctx.translate(bullet.x, bullet.y);
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.restore();
    });

    // Draw white outline
    ctx.save();
    ctx.translate(playerCircle.x, playerCircle.y);
    ctx.beginPath();
    ctx.arc(0, 0, playerCircle.radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw playerCircle
    ctx.save();
    ctx.translate(playerCircle.x, playerCircle.y);
    ctx.rotate(playerCircle.angle);
    ctx.beginPath();
    ctx.arc(0, 0, playerCircle.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.restore();

    // Calculate triangle position
    const triangleX = playerCircle.x + Math.cos(playerCircle.angle) * triangle.distance;
    const triangleY = playerCircle.y + Math.sin(playerCircle.angle) * triangle.distance;

    // Draw triangle
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

    ctx.restore(); // Restore the initial context state after applying the camera offset

    // Apply distortion effect
    ctx.save();
    ctx.filter = `blur(${Math.abs(distortionLevel)}px)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
