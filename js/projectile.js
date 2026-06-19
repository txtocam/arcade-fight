class Projectile {
  constructor(x, y, dir, owner) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.owner = owner;
    this.damage = 15;
  }

  update() {
    this.x += this.dir * 7;
  }

  draw(ctx) {
    ctx.fillStyle = "purple";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  hit(target) {
    return (
      this.x > target.x - 20 &&
      this.x < target.x + 20 &&
      this.y > target.y - 40 &&
      this.y < target.y + 40
    );
  }
}