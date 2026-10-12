# Vérification des fiches techniques

Chaque dessin est généré automatiquement à partir de `data/recettes.json` (une couche dessinée = une ligne de la fiche) : les quantités ne peuvent pas « dériver » comme avec une photo IA.
J'ai quand même relu chaque case sur les PNG finaux : nombre de pièces, présence de chaque ingrédient, ordre des couches, absence de tomate, de sésame et de toute sauce hors fiche.

| Produit | Attendu (pièces) | Ordre attendu, de bas en haut | Constaté sur la fiche | Résultat |
|---|---|---|---|---|
| Kid | 1 cornichon, 1 steak, 1 cheddar | pain → ketchup → cornichon → steak → cheddar → pain | identique : mêmes pièces, même ordre, numérotation 1→6 | ✅ OK |
| Simple | 1 cornichon, 1 steak, 1 cheddar | pain → biggy → cornichon → steak → cheddar → salade → biggy → pain | identique : mêmes pièces, même ordre, numérotation 1→8 | ✅ OK |
| Double | 2 cornichons, 2 steaks, 2 cheddars | pain → biggy → cornichon → steak → cheddar → steak → cheddar → salade → biggy → pain | identique : mêmes pièces, même ordre, numérotation 1→10 | ✅ OK |
| Triple | 3 cornichons, 3 steaks, 3 cheddars | pain → biggy → cornichon → steak → cheddar → steak → cheddar → steak → cheddar → salade → biggy → pain | identique : mêmes pièces, même ordre, numérotation 1→12 | ✅ OK |
| Suprême | 4 cornichons, 4 steaks, 4 cheddars | pain → biggy → cornichon → steak → cheddar → steak → cheddar → steak → cheddar → steak → cheddar → salade → biggy → pain | identique : mêmes pièces, même ordre, numérotation 1→14 | ✅ OK |
| Pepper | 2 steaks, 2 cheddars | pain → pepper → steak → cheddar → steak → cheddar → salade → biggy → pain | identique : mêmes pièces, même ordre, numérotation 1→9 | ✅ OK |
| Spicy | 2 steaks, 2 cheddars | pain → spicy → oignons rouges → steak → cheddar → steak → cheddar → salade → biggy → pain | identique : mêmes pièces, même ordre, numérotation 1→10 | ✅ OK |
| BBQ | 2 steaks, 2 cheddars | pain → bbq → steak → cheddar → steak → cheddar → ½ bacon → oignons caramélisés → salade → biggy → pain | identique : mêmes pièces, même ordre, numérotation 1→11 | ✅ OK |
| A23 | 3 jalapeños, 3 steaks, 3 cheddars | pain → pepper → jalapeño → steak → cheddar → steak → cheddar → steak → cheddar → oignons caramélisés → salade → biggy → pain | identique : mêmes pièces, même ordre, numérotation 1→13 | ✅ OK |
| Chicken | 1 cheddar | pain → biggy → tender smashé → cheddar → salade → pain | identique : mêmes pièces, même ordre, numérotation 1→6 | ✅ OK |
| Fajitas | 1 steak, 1 cheddar | galette → biggy → oignons frits → oignons rouges → steak → cheddar → salade | identique : mêmes pièces, même ordre, numérotation 1→7 | ✅ OK |
| Sand Steak | 2 steaks, 2 cheddars | pain → biggy → salade → steak → cheddar → steak → cheddar → pain | identique : mêmes pièces, même ordre, numérotation 1→8 | ✅ OK |
| Sand Suprême | 4 steaks, 4 cheddars | pain → biggy → salade → steak → cheddar → steak → cheddar → steak → cheddar → steak → cheddar → pain | identique : mêmes pièces, même ordre, numérotation 1→12 | ✅ OK |
| Sand Pepper | 2 steaks, 2 cheddars | pain → biggy → pepper → salade → steak → cheddar → steak → cheddar → pain | identique : mêmes pièces, même ordre, numérotation 1→9 | ✅ OK |
| Sand Spicy | 2 steaks, 2 cheddars | pain → biggy → spicy → oignons rouges → salade → steak → cheddar → steak → cheddar → pain | identique : mêmes pièces, même ordre, numérotation 1→10 | ✅ OK |
| Sand Fumé | 2 steaks, 2 cheddars | pain → biggy → bbq → salade → steak → cheddar → steak → cheddar → ½ bacon → oignons caramélisés → pain | identique : mêmes pièces, même ordre, numérotation 1→11 | ✅ OK |
| Sand A23 | 5 jalapeños, 2 steaks, 2 cheddars | pain → biggy → pepper → jalapeño → salade → steak → cheddar → steak → cheddar → oignons caramélisés → pain | identique : mêmes pièces, même ordre, numérotation 1→11 | ✅ OK |
| Sand Mixte | 2 steaks, 2 cheddars, 1 tender | pain → biggy → salade → steak → cheddar → steak → cheddar → tender → pain | identique : mêmes pièces, même ordre, numérotation 1→9 | ✅ OK |
| Sand Tenders | 2 tenders, 1 cheddar | pain → biggy → salade → tender → cheddar → pain | identique : mêmes pièces, même ordre, numérotation 1→6 | ✅ OK |

Points de vigilance :
- **Sand A23** : la fiche dit « environ 5 jalapeños ». Le dessin en montre 5 et la légende dit « ~5 ».
- **Sand Tenders** : montage « 2 tenders puis cheddar dessus ». À inverser dans `data/recettes.json` si ce n'est pas la règle en cuisine.
- **Fajitas** : dessinée en vue en coupe. Le bord replié de la galette n'est pas une couche de la fiche ; il montre juste que c'est roulé.
