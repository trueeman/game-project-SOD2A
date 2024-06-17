const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.69; // Set canvas width to 69% of window width
canvas.height = window.innerHeight * 0.75; // Set canvas height to 75% of window height

const playerCircle = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  speed: 2.5,
  angle: 0
};

const triangle = {
  distance: 35, // Distance from the center of the circle
  size: 10 // Size of the triangle
};

const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

let distortionLevel = 0; // Initial distortion level
const maxDistortion = 10; // Maximum blur radius

const bullets = []; // Array to store bullets

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
  playerCircle.angle = Math.atan2(mouseY - playerCircle.y, mouseX - playerCircle.x);
});

canvas.addEventListener('mousedown', (e) => {
  if (e.button === 0) { // Left mouse button
    shootBullet();
  }
});

function shootBullet() {
  const bulletSpeed = 3.5;
  const bulletAngle = playerCircle.angle;
  const bulletX = playerCircle.x + Math.cos(bulletAngle) * playerCircle.radius;
  const bulletY = playerCircle.y + Math.sin(bulletAngle) * playerCircle.radius;

  bullets.push({
    x: bulletX,
    y: bulletY,
    speed: bulletSpeed,
    angle: bulletAngle
  });
}

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

  // Update distortion level based on sine function for pulsating effect
  distortionLevel = Math.sin(Date.now() / 500) * maxDistortion;

  // Update bullets
  bullets.forEach((bullet) => {
    bullet.x += Math.cos(bullet.angle) * bullet.speed;
    bullet.y += Math.sin(bullet.angle) * bullet.speed;
  });

  // Remove bullets that are out of bounds
  bullets.forEach((bullet, index) => {
    if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
      bullets.splice(index, 1);
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply distortion effect
  ctx.save();
  ctx.filter = `blur(${distortionLevel}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.restore();

  // Draw white outline
  ctx.save();
  ctx.translate(playerCircle.x, playerCircle.y);
  ctx.beginPath();
  ctx.arc(0, 0, playerCircle.radius + 2, 0, Math.PI * 2);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Draw circle
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

  // Draw bullets
  bullets.forEach((bullet) => {
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.restore();
  });
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
