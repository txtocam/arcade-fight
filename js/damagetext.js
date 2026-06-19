class DamageText {
  constructor(x, y, value, color) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.color = color;
    this.life = 60;
    this.alpha = 1;
  }

  update() {
    this.y -= 1;
    this.life--;
    this.alpha = this.life / 60;
  }

  draw(ctx) {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.font = "18px Arial";
    ctx.fillText("-" + Math.round(this.value), this.x, this.y);
    ctx.globalAlpha = 1;
  }
}