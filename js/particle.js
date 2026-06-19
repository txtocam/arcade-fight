class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6;

    this.life = 40;
    this.size = 3;

    // 🔥 AJOUT : couleur (par défaut sang rouge)
    this.color = "red";
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    this.life--;

    // petite gravité légère (effet plus naturel)
    this.vy += 0.1;

    // 🔥 AJOUT : ralentissement léger pour effet plus “blood”
    this.vx *= 0.98;
    this.vy *= 0.98;
  }

  draw(ctx) {
    // 🔥 AJOUT : fade progressif
    ctx.globalAlpha = Math.max(this.life / 40, 0);

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);

    // reset alpha (important sinon ça casse tout le rendu)
    ctx.globalAlpha = 1;
  }
}

// ================= UTILITAIRE =================

function spawnParticles(x, y, type = "blood") {
  for (let i = 0; i < 10; i++) {
    const p = new Particle(x, y);

    // 🔥 AJOUT : types d’effets
    if (type === "blood") {
      p.color = "red";
      p.size = 2 + Math.random() * 2;
      p.vx *= 1.2;
      p.vy *= 1.2;
    }

    if (type === "hit") {
      p.color = "orange";
      p.size = 2;
    }

    if (type === "ko") {
      p.color = "white";
      p.size = 3;
      p.vx *= 0.5;
      p.vy *= 0.5;
    }

    particles.push(p);
  }
}