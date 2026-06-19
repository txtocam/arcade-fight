window.selectCharacter = function (c) {
  window.selectedCharacter = c;
};

window.startGame = function () {
  const input = document.getElementById("p1Name");

  window.playerName = input.value || "JOUEUR";

  // 🔥 sécurité : resetGame doit exister globalement
  if (typeof window.resetGame === "function") {
    window.resetGame();
  }

  window.gameStarted = true;
  window.showVS = true;
  window.vsTimer = 120;

  const menu = document.getElementById("menu");
  if (menu) menu.style.display = "none";
};