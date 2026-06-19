class Fighter {
  constructor(x, color) {
    this.x = x;
    this.y = 350;

    this.vx = 0;
    this.vy = 0;

    this.color = color;

    this.hp = 100;
    this.special = 0;

    this.onGround = true;

    this.cd = 0;
    this.lastShot = 0;

    this.blocking = false;

    this.combo = 0;
    this.comboTimer = 0;

    this.dashCd = 0;

    this.weaponState = "none";
    this.weaponTimer = 0;

    this.slashTimer = 0;
    this.recoil = 0;

    this.trail = [];

    this.dead = false;

    this.aiControlled = false;
  }

  update(canvas, GROUND_Y = 350) {
    if (!canvas) return;

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();

    this.x += this.vx;
    this.y += this.vy;

    if (!this.onGround) {
      this.vy += 0.8;
    }

    this.x = Math.max(20, Math.min(canvas.width - 20, this.x));

    this.special = Math.min(100, this.special + 0.1);

    if (this.cd > 0) this.cd--;
    if (this.dashCd > 0) this.dashCd--;

    if (this.comboTimer > 0) this.comboTimer--;
    else this.combo = 0;

    if (this.weaponTimer > 0) {
      this.weaponTimer--;
    } else {
      this.weaponState = "none";
    }

    if (this.slashTimer > 0) this.slashTimer--;

    this.recoil *= 0.85;

    // ================= FIX IMPORTANT =================
    // évite blocage total de mouvement
    if (this.aiControlled) {
      this.vx *= 0.985;
    } else {
      this.vx *= 0.85;
    }

    if (Math.abs(this.vx) < 0.01) this.vx = 0;
  }

  draw(ctx) {
    if (!ctx) return;

    const x = this.x;
    const y = this.y;

    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      ctx.fillStyle = `rgba(0,0,0,${i / this.trail.length * 0.2})`;
      ctx.fillRect(t.x - 8, t.y - 50, 16, 50);
    }

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.color;
    ctx.fillRect(x - 8, y - 55, 16, 35);

    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(x, y - 65, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "cyan";
    ctx.fillRect(x - 4, y - 66, 2, 2);
    ctx.fillRect(x + 2, y - 66, 2, 2);

    const legOffset = Math.sin(Date.now() * 0.01 + x) * 3;

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(x - 4, y - 20);
    ctx.lineTo(x - 8 + legOffset, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 4, y - 20);
    ctx.lineTo(x + 8 - legOffset, y);
    ctx.stroke();

    ctx.fillStyle = "red";
    ctx.fillRect(x - 18, y - 85, 36, 4);

    ctx.fillStyle = "lime";
    ctx.fillRect(x - 18, y - 85, Math.max(0, this.hp * 0.36), 4);

    ctx.fillStyle = "blue";
    ctx.fillRect(x - 18, y - 92, this.special * 0.36, 3);

    if (this.weaponState === "knife") {
      ctx.fillStyle = "silver";
      ctx.fillRect(x + 10, y - 40, 10, 2);

      if (this.slashTimer > 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.beginPath();
        ctx.arc(x + 10, y - 40, 20, 0, Math.PI);
        ctx.stroke();
      }
    }

    if (this.weaponState === "gun") {
      ctx.fillStyle = "#111";
      ctx.fillRect(x + 10 + this.recoil, y - 40, 14, 6);

      ctx.fillStyle = "#555";
      ctx.fillRect(x + 22 + this.recoil, y - 38, 6, 2);
    }

    if (window.debugHitbox) {
      ctx.strokeStyle = "yellow";
      ctx.strokeRect(x - 15, y - 60, 30, 60);
    }
  }

  // ================= ATTACK FIX FINAL =================
  attack(enemy) {
  if (!enemy) return;

  // ================= COOLDOWN NORMAL =================
  if (this.cd > 0) {
    this.cd--;
    return;
  }

  this.cd = 8; // 🔥 plus rapide = combats plus dynamiques

  this.weaponState = "knife";
  this.weaponTimer = 10;
  this.slashTimer = 8;

  this.combo++;
  this.comboTimer = 30;

  const dmg = 20;

  const dist = Math.abs(this.x - enemy.x);

  // ================= HIT PLUS LARGE =================
  // (avant 90 → maintenant plus permissif)
  const hitRange = 110;

  if (dist < hitRange) {
    const final = enemy.blocking ? dmg * 0.3 : dmg;

    enemy.hp -= final;

    const dir = this.x < enemy.x ? 1 : -1;
    enemy.vx += dir * 9; // 🔥 un peu plus de push
    enemy.vy -= 2;
  }
}

  specialAttack(enemy) {
    if (!enemy || this.special < 100) return;

    this.special = 0;

    const dmg = 20;

    enemy.hp -= dmg;

    const dir = this.x < enemy.x ? 1 : -1;
    enemy.vx += dir * 12;
    enemy.vy -= 4;
  }

  shoot(projectiles, ProjectileClass, enemy) {
    if (!enemy) return;
    if (!projectiles || !ProjectileClass) return;

    const now = Date.now();

    if (!this.lastShot) this.lastShot = 0;

    if (now - this.lastShot < 320) return;

    this.lastShot = now;

    this.weaponState = "gun";
    this.weaponTimer = 8;

    this.recoil = 6;

    const dir = this.x < enemy.x ? 1 : -1;

    projectiles.push(
      new ProjectileClass(this.x, this.y - 30, dir, this)
    );
  }

  dash(dir) {
    if (this.dashCd > 0) return;

    this.vx += dir * 12;
    this.dashCd = 30;

    this.trail = [];
  }

  block(state) {
    this.blocking = state;
  }
}