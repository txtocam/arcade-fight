J’ai un jeu vidéo 2D en JavaScript (canvas HTML5) avec une architecture en fichiers séparés.

📁 Structure du projet
index.html → interface + canvas + boutons menu
style.css → style du menu et du canvas
js/input.js → gestion clavier (objet keys)
js/fighter.js → classe Fighter (joueur + IA)
js/projectile.js → classe Projectile
js/ai.js → logique IA du bot
js/ui.js → fonctions UI (selectCharacter, startGame)
js/game.js → boucle principale + état du jeu
🎮 Gameplay
2 joueurs :
p1 joueur contrôlé clavier
p2 IA
contrôles :
Q / D = déplacement
Z = saut
F = attaque
E = spécial
R = projectile
S = block
🧠 Système de jeu
Fighter possède :
hp
combo system
dash
block
recoil (knockback)
projectiles


