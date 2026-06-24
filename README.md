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
js/world.js:WORLD_WIDTH, cameraX,clouds, platforms, updateCamera(),drawSky(),drawClouds(),drawPlatforms()
js/render.js : drawPistol(), drawSaber() drawCrown(), drawEndScreen()
js/physics.js : applyPhysics(),spawnExplosion()gestion collisions plateformes
js/playerController.js : handlePlayer(),setAnimTimers(),input combat joueur
js/main.js :loop(),checkKO(),resetGame(),triggerEnd(),init canvas + context
orchestration générale
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
 A chaque demande 
 supprime aucune fonctionallité, n'allège rien, garde tout le code original intact,  fais juste les modification que je demande ET REND MOI LE CODE EN ENTIER


