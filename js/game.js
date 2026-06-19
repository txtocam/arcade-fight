const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ================= WORLD =================
const WORLD_WIDTH = 2200;
let cameraX = 0;

// ================= GLOBAL =================
window.p1 = null;
window.p2 = null;

window.gameStarted = false;
window.gameOver = false;
window.showVS = false;
window.vsTimer = 0;

window.selectedCharacter = "red";
window.playerName = "JOUEUR";
window.winnerName = "";

window.ko = false;
window.koTimer = 0;

// ================= SYSTEM =================
window.projectiles = window.projectiles || [];
const projectiles = window.projectiles;

window.particles = window.particles || [];

// ================= BACKGROUND =================
const clouds = [
  { x: 120, y: 70, speed: 0.2 },
  { x: 400, y: 50, speed: 0.15 },
  { x: 700, y: 90, speed: 0.25 }
];

// ================= PLATFORMS =================
const platforms = [
  { x: 0, y: 420, w: 2200, h: 100 },
  { x: 250, y: 340, w: 220, h: 20 },
  { x: 550, y: 290, w: 200, h: 20 },
  { x: 850, y: 250, w: 220, h: 20 },
  { x: 1200, y: 300, w: 240, h: 20 },
  { x: 1600, y: 260, w: 220, h: 20 }
];

// ================= CAMERA =================
function updateCamera() {
  if (!p1) return;

  cameraX = p1.x - canvas.width / 2;
  cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - canvas.width));
}

// ================= DRAW =================
function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#6ec6ff");
  g.addColorStop(1, "#e6f7ff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawClouds() {
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  for (let c of clouds) {
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, 45, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    c.x += c.speed;
    if (c.x > WORLD_WIDTH) c.x = -80;
  }
}

function drawPlatforms() {
  for (let p of platforms) {
    const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
    grad.addColorStop(0, "#aaaaaa");
    grad.addColorStop(1, "#666666");

    ctx.fillStyle = grad;
    ctx.fillRect(p.x, p.y, p.w, p.h);

    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(p.x, p.y, p.w, 3);
  }
}

// ================= PHYSICS (PROPRE + COLLISION FIX) =================
function applyPhysics(player) {
  const prevY = player.y;

  player.vy += 0.6;
  player.x += player.vx;
  player.y += player.vy;

  player.onGround = false;
  player.touchingWall = false;

  for (let p of platforms) {
    const halfW = 15;
    const bottom = player.y;
    const prevBottom = prevY;

    const inX =
      player.x > p.x - halfW &&
      player.x < p.x + p.w + halfW;

    const wasAbove = prevBottom <= p.y;
    const falling = player.vy >= 0;

    if (inX && falling && wasAbove && bottom >= p.y) {
      player.y = p.y;
      player.vy = 0;
      player.onGround = true;
    }
  }

  // WALL COLLISION (pour wall jump)
  if (player.x <= 0) {
    player.x = 0;
    player.touchingWall = true;
    player.wallDir = 1;
  }

  if (player.x >= WORLD_WIDTH - 40) {
    player.x = WORLD_WIDTH - 40;
    player.touchingWall = true;
    player.wallDir = -1;
  }
}

// ================= INPUT =================
document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (gameOver && e.key.toLowerCase() === "r") resetGame();
});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

// ================= PLAYER =================
function handlePlayer() {
  if (!p1 || !p2 || ko) return;

  p1.vx = 0;

  if (keys["q"]) p1.vx = -4;
  if (keys["d"]) p1.vx = 4;

  // JUMP
  if (keys["z"]) {
    if (p1.onGround) {
      p1.vy = -12;
    } 
    else if (p1.touchingWall) {
      // WALL JUMP
      p1.vy = -12;
      p1.vx = 6 * p1.wallDir;
    }
  }

  if (keys["f"]) p1.attack(p2);
  if (keys["e"]) p1.specialAttack && p1.specialAttack(p2);

  if (keys["r"]) {
    p1.shoot && p1.shoot(projectiles, Projectile, p2);
  }
}

// ================= RESET =================
function resetGame() {
  p1 = new Fighter(100, selectedCharacter);
  p2 = new Fighter(700, "blue");

  gameOver = false;
  showVS = true;
  vsTimer = 120;

  projectiles.length = 0;
  window.particles.length = 0;

  ko = false;
  koTimer = 0;
}

// ================= LOOP =================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawSky();

  updateCamera();

  ctx.save();
  ctx.translate(-cameraX, 0);

  drawClouds();
  drawPlatforms();

  if (!gameStarted || !p1 || !p2) {
    ctx.restore();
    requestAnimationFrame(loop);
    return;
  }

  if (showVS) {
    vsTimer--;
    if (vsTimer <= 0) showVS = false;
    ctx.restore();
    requestAnimationFrame(loop);
    return;
  }

  if (ko) {
    koTimer--;
    if (koTimer <= 0) resetGame();
    ctx.restore();
    requestAnimationFrame(loop);
    return;
  }

  handlePlayer();

  applyPhysics(p1);
  applyPhysics(p2);

  p1.draw(ctx);
  p2.draw(ctx);

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const pr = projectiles[i];

    pr.update();
    pr.draw(ctx);

    const target = pr.owner === p1 ? p2 : p1;

    if (pr.hit(target)) {
      target.hp -= 10;
      projectiles.splice(i, 1);
    }
  }

  ctx.restore();

  requestAnimationFrame(loop);
}

loop();