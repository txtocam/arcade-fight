function ai(enemy, target) {
  if (!enemy || !target) return;

  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const abs = Math.abs(dx);

  const dir = dx > 0 ? 1 : -1;

  // ================= IA STATE =================
  enemy.aiControlled = true;

  enemy.aiAttackCd = enemy.aiAttackCd || 0;
  if (enemy.aiAttackCd > 0) enemy.aiAttackCd--;

  // ================= FLEE SYSTEM =================
  // fuite MAIS sans bloquer totalement l’IA
  let fleeing = false;

  if (enemy.hp < 25) {
    enemy.vx = -dir * 5;
    fleeing = true;

    if (enemy.onGround && Math.random() < 0.04) {
      enemy.vy = -12;
    }
  }

  // ================= PLATFORM / HEIGHT =================
  if (!fleeing) {
    if (target.y < enemy.y - 40 && enemy.onGround && Math.random() < 0.06) {
      enemy.vy = -12;
    }

    if (abs < 120 && target.y < enemy.y && enemy.onGround && Math.random() < 0.05) {
      enemy.vy = -12;
    }
  }

  // ================= MOVEMENT =================
  const idealRange = 75;

  if (!fleeing) {
    if (abs > idealRange + 20) {
      enemy.vx = dir * 4.8;
    } else if (abs < idealRange - 20) {
      enemy.vx = -dir * 3.8;
    } else {
      enemy.vx = dir * 0.5; // pression constante (IMPORTANT)
    }
  }

  // ================= ANTI WALL =================
  if (enemy.touchingWall) {
    enemy.vx = dir * 5;
    enemy.vy = -10;
  }

  // ================= MELEE ATTACK (FIX PRINCIPAL) =================
  // 🔥 plus large + plus fréquent + pas bloqué par fuite
  const meleeRange = 95;

  if (abs < meleeRange && enemy.aiAttackCd === 0) {
    enemy.attack(target);
    enemy.aiAttackCd = 8; // plus agressif
  }

  // ================= SPECIAL =================
  if (enemy.special >= 100 && abs < 140 && !fleeing) {
    enemy.specialAttack?.(target);
  }

  // ================= PROJECTILES =================
  if (abs > 200 && abs < 500 && !fleeing) {
    if (Math.random() < 0.18) {
      enemy.shoot?.(window.projectiles, Projectile, target);
    }
  }

  // ================= FINISH =================
  if (target.hp < 30 && abs < 110) {
    enemy.attack(target);
  }

  // ================= MICRO MOVEMENT =================
  enemy.vx += (Math.random() - 0.5) * 0.9;
}

window.updateAI = ai;