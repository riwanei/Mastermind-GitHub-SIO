# Mastermind

Jeu de Mastermind jouable dans le navigateur, écrit en HTML, CSS et JavaScript (sans bibliothèque).

Trouve la combinaison secrète de pions colorés en un minimum d'essais. Après chaque proposition, le jeu indique le nombre de pions de la bonne couleur bien placés et mal placés.

## Fonctionnalités

- **Jouer seul** : le code secret est tiré au hasard.
- **Mode 2 joueurs** : un joueur crée le code, l'autre le devine.
- **L'ordinateur devine** : tu penses à un code, l'ordinateur propose et tu lui donnes les indices.
- **3 niveaux** : Facile (6 couleurs, 4 pions, 12 essais), Normal (6 couleurs, 4 pions, 10 essais), Difficile (8 couleurs, 5 pions, 10 essais).
- **Meilleurs scores** : les 5 meilleurs par niveau, sauvegardés dans le navigateur (`localStorage`).
- **Clavier** : touches 1 à 8 pour poser un pion, Retour arrière pour en retirer un, Entrée pour valider.

## Règles

1. Une couleur peut apparaître plusieurs fois dans le code.
2. Pastille verte : nombre de pions de la bonne couleur **bien placés**.
3. Pastille orange : nombre de pions de la bonne couleur **mal placés**.
4. Tu gagnes si tu trouves le code avant la fin des essais.

## Lancer le jeu

Aucune installation n'est nécessaire.

1. Récupère le dossier du projet.
2. Ouvre `index.html` dans ton navigateur (ou utilise l'extension *Live Server* de VS Code).

## Structure du projet

```
mastermind/
├── index.html   # structure de la page (menu, jeu, scores)
├── style.css    # apparence
├── script.js    # logique du jeu
└── README.md
```

## Personnaliser

Les réglages sont en haut de `script.js` :

- `COULEURS` : la liste des couleurs des pions.
- `NIVEAUX` : nombre de couleurs, longueur du code et nombre d'essais par niveau.

## Mise en ligne (GitHub Pages)

1. Pousse le dossier sur un dépôt GitHub.
2. Va dans **Settings > Pages**, choisis la branche `main` et le dossier `/ (root)`.
3. Le site est disponible à l'adresse `https://TON-PSEUDO.github.io/NOM-DU-DEPOT/`.

## Technologies

HTML5, CSS3 et JavaScript (ES6).

## Auteure

Projet réalisé par Riri dans le cadre de ses études (BTS SIO).
