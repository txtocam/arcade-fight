function ai(enemy, target) {
  if (!enemy || !target) return;

  const dist = enemy.x - target.x;
  const abs = Math.abs(dist);

  // déplacement agressif
  if (abs > 100) {
    enemy.vx = dist > 0 ? -3 : 3;
  } else {
    enemy.vx = 0;
  }

  // attaque plus régulière (pas random inutile)
  if (abs < 110) {
    enemy.attack(target);
  }

  // spécial si chargé
  if (abs < 90 && enemy.special >= 100) {
    enemy.specialAttack?.(target);
  }
}