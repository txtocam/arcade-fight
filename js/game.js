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

// ================= KO SYSTEM =================
window.ko = false;
window.koTimer = 0;

// ================= CINEMATIC ADD (NEW ONLY) =================
window.endMatch = false;
window.winner = null;
window.slowMo = false;

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

  // ================= NEW : CAMERA FOCUS WINNER =================
  if (endMatch && winner) {
    const target = winner === "p1" ? p1 : p2;
    cameraX = target.x - canvas.width / 2;
    cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - canvas.width));
  }
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

// ================= CINEMATIC NEW =================
function spawnExplosion(x, y) {
  for (let i = 0; i < 60; i++) {
    window.particles.push(new Particle(x, y));
  }
}

function drawCrown(player) {
  ctx.fillStyle = "gold";
  ctx.beginPath();
  ctx.moveTo(player.x - 10, player.y - 60);
  ctx.lineTo(player.x - 5, player.y - 80);
  ctx.lineTo(player.x, player.y - 65);
  ctx.lineTo(player.x + 5, player.y - 80);
  ctx.lineTo(player.x + 10, player.y - 60);
  ctx.closePath();
  ctx.fill();
}

// ================= NEW : END SCREEN =================
function drawEndScreen() {
  if (!endMatch) return;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "60px Arial";
  ctx.textAlign = "center";

  if (winner === "p1") {
    ctx.fillText("VICTOIRE !", canvas.width / 2, canvas.height / 2);
  } else {
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  }

  ctx.font = "20px Arial";
  ctx.fillText("Appuie sur R ou ENTER pour rejouer", canvas.width / 2, canvas.height / 2 + 60);

  ctx.restore();
}

// ================= CINEMATIC TRIGGER =================
function triggerEnd(win) {
  if (endMatch) return;

  endMatch = true;
  winner = win;
  ko = true;
  gameOver = true;

  const target = win === "p1" ? p1 : p2;
  spawnExplosion(target.x, target.y);
}

// ================= PHYSICS =================
function applyPhysics(player) {
  const prevY = player.y;

  player.vy += 0.6;
  player.x += player.vx;
  player.y += player.vy;

  player.onGround = false;

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

  if (player.x <= 0) player.x = 0;
  if (player.x >= WORLD_WIDTH - 40) player.x = WORLD_WIDTH - 40;
}

// ================= INPUT =================
document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (gameOver && (e.key.toLowerCase() === "r" || e.key === "Enter")) {
    resetGame();
  }
});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

// ================= PLAYER =================
function handlePlayer() {
  if (!p1 || !p2 || ko || endMatch) return;

  p1.vx = 0;

  if (keys["q"]) p1.vx = -4;
  if (keys["d"]) p1.vx = 4;

  if (keys["z"] && p1.onGround) {
    p1.vy = -12;
  }

  if (keys["f"]) p1.attack(p2);
  if (keys["e"]) p1.specialAttack?.(p2);

  if (keys["r"]) {
    p1.shoot?.(projectiles, Projectile, p2);
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
  endMatch = false;
  winner = null;
}

// ================= KO CHECK =================
function checkKO() {
  if (endMatch) return;

  if (p1.hp <= 0) triggerEnd("p2");
  if (p2.hp <= 0) triggerEnd("p1");
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

  if (!endMatch) handlePlayer();

  applyPhysics(p1);
  applyPhysics(p2);

  if (!endMatch && window.updateAI) {
    window.updateAI(p2, p1);
  }

  checkKO();

  p1.draw(ctx);
  p2.draw(ctx);

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const pr = projectiles[i];

    pr.update();
    pr.draw(ctx);

    const target = pr.owner === p1 ? p2 : p1;

    if (pr.hit(target)) {
      target.hp -= 10;
      spawnParticles(target.x, target.y, "hit");
      projectiles.splice(i, 1);
    }
  }

  // ================= CROWN =================
  if (endMatch) {
    const win = winner === "p1" ? p1 : p2;
    drawCrown(win);
  }

  ctx.restore();

  // ================= END SCREEN (NEW) =================
  drawEndScreen();

  requestAnimationFrame(loop);
}

loop();