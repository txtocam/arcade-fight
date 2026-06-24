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

    // ================= KO =================
    this.ko = false;
    this.koRotation = 0;
    this.koVelocity = 0;
    this.koGrounded = false;

    // FIX IMPORTANT (sync avec game.js)
    this.GROUND_Y = 420;
  }

  // ================= KO START =================
  startKO() {
    if (this.ko) return;

    this.ko = true;
    this.dead = true;

    this.koVelocity = -10;
    this.vy = 0;

    const dir = Math.random() > 0.5 ? 1 : -1;

    this.vx = dir * 3;
  }

  update(canvas, GROUND_Y = 350) {
    if (!canvas) return;

    // ================= KO MODE =================
    if (this.ko) {

      // gravité KO
      this.koVelocity += 0.6;
      this.y += this.koVelocity;
      this.x += this.vx;

      this.koRotation += 0.08;

      // IMPORTANT : sol du jeu (fix ton bug ici)
      if (this.y >= this.GROUND_Y) {
        this.y = this.GROUND_Y;
        this.koVelocity = 0;
        this.vx = 0;
        this.koGrounded = true;
      }

      return;
    }

    // ================= NORMAL MODE =================
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

    if (this.weaponTimer > 0) this.weaponTimer--;
    else this.weaponState = "none";

    if (this.slashTimer > 0) this.slashTimer--;

    this.recoil *= 0.85;

    if (this.aiControlled) {
      this.vx *= 0.985;
    } else {
      this.vx *= 0.85;
    }

    if (Math.abs(this.vx) < 0.01) this.vx = 0;
  }

  draw(ctx) {
    if (!ctx) return;

    // ================= KO DRAW =================
    if (this.ko) {

      ctx.save();

      ctx.translate(this.x, this.y);

      if (!this.koGrounded) {
        ctx.rotate(this.koRotation);
      } else {
        ctx.rotate(Math.PI / 2);
      }

      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(0, 10, 22, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.color;
      ctx.fillRect(-8, -55, 16, 35);

      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.arc(0, -65, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "cyan";
      ctx.fillRect(-4, -66, 2, 2);
      ctx.fillRect(2, -66, 2, 2);

      ctx.strokeStyle = "#111";
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(-4, -20);
      ctx.lineTo(-8, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(4, -20);
      ctx.lineTo(8, 0);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // ================= NORMAL DRAW =================
    const x = this.x;
    const y = this.y;

    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];

      ctx.fillStyle =
        `rgba(0,0,0,${i / this.trail.length * 0.2})`;

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
  }

  attack(enemy) {
    if (!enemy) return;

    if (this.cd > 0) {
      this.cd--;
      return;
    }

    this.cd = 8;

    this.weaponState = "knife";
    this.weaponTimer = 10;
    this.slashTimer = 8;

    this.combo++;
    this.comboTimer = 30;

    const dmg = 20;

    const dist = Math.abs(this.x - enemy.x);

    const hitRange = 110;

    if (dist < hitRange) {
      const final = enemy.blocking ? dmg * 0.3 : dmg;

      enemy.hp -= final;

      const dir = this.x < enemy.x ? 1 : -1;

      enemy.vx += dir * 9;
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

    const now = Date.now();

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