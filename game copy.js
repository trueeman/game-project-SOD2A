const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const playercircle = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 30,
  speed: 2.5,
  angle: 0
};

const triangle = {
  distance: 50, // Distance from the center of the playercircle
  size: 20 // Size of the triangle
};

const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

let distortionLevel = 0; // Initial distortion level
const maxDistortion = 10; // Maximum blur radius

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
  playercircle.angle = Math.atan2(mouseY - playercircle.y, mouseX - playercircle.x);
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
    dx = (dx / magnitude) * playercircle.speed;
    dy = (dy / magnitude) * playercircle.speed;
  }

  playercircle.x += dx;
  playercircle.y += dy;

  // Update distortion level based on sine function for pulsating effect
  distortionLevel = Math.sin(Date.now() / 500) * maxDistortion;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw white outline
  ctx.save();
  ctx.translate(playercircle.x, playercircle.y);
  ctx.beginPath();
  ctx.arc(0, 0, playercircle.radius + 2, 0, Math.PI * 2);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Draw playercircle
  ctx.save();
  ctx.translate(playercircle.x, playercircle.y);
  ctx.rotate(playercircle.angle);
  ctx.beginPath();
  ctx.arc(0, 0, playercircle.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'black';
  ctx.fill();
  ctx.restore();

  // Calculate triangle position
  const triangleX = playercircle.x + Math.cos(playercircle.angle) * triangle.distance;
  const triangleY = playercircle.y + Math.sin(playercircle.angle) * triangle.distance;

  // Draw triangle
  ctx.save();
  ctx.translate(triangleX, triangleY);
  ctx.rotate(playercircle.angle + Math.PI / 2); // Rotate the triangle 90 degrees to align with the cursor direction
  ctx.beginPath();
  ctx.moveTo(0, -triangle.size / 2);
  ctx.lineTo(triangle.size / 1, triangle.size / 2);
  ctx.lineTo(-triangle.size / 1, triangle.size / 2);
  ctx.closePath();
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.restore();

  // Apply distortion effect
  ctx.save();
  ctx.filter = `blur(${distortionLevel}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.restore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();