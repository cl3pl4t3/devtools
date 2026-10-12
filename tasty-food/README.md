# Tasty Food Saint-Gilles : fiches techniques

Deux visuels A3 paysage à afficher en cuisine, un pour les burgers et un pour les sandwichs. Chaque produit a sa colonne : le montage en vue éclatée, numéroté de bas en haut, puis le produit monté.

- `sortie/fiche-burgers.pdf` / `.png` : les 11 burgers
- `sortie/fiche-sandwichs.pdf` / `.png` : les 8 sandwichs
- `data/recettes.json` : les recettes (la seule chose à modifier si une recette change)
- `lib/` : les dessins de chaque ingrédient ; `polices/` : les polices Anton et Oswald (licence libre OFL)
- `verification.md` : contrôle produit par produit

Pour imprimer, utilisez le **PDF** (format A3 paysage, à 100 % / « taille réelle »).

## Regénérer après une modification de recette (Windows + VS Code)

Une seule fois : installez Node.js (version LTS) depuis https://nodejs.org, puis dans le terminal de VS Code (menu *Terminal → Nouveau terminal*) :

```
cd tasty-food
npm install playwright
npx playwright install chromium
```

Ensuite, à chaque modification de `data/recettes.json` :

```
node generer-fiches.js
```

Les nouveaux fichiers apparaissent dans `sortie/`. Aucun service payant n'est utilisé.
