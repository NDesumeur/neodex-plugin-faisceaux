# Faisceaux

Un jeu d'esquive en pixel art : un petit robot doit survivre dans une salle d'essai où des émetteurs, cachés dans les murs, tirent des rayons. Tiens le plus longtemps possible.

*English version: [README.en.md](README.en.md)*

## Commandes

- **Flèches** ou **ZQSD** (WASD aussi) : bouger, dans les 8 directions.
- **Maj** ou **X** : élan, le robot file d'un coup. La jauge jaune en haut montre quand il est rechargé.
- **Souris** ou **doigt** : le robot suit le pointeur tant que tu appuies ; deux appuis rapides donnent l'élan.
- **P** ou **Échap** : pause.

## Comment ça marche

- **Chaque tir est annoncé** : un trait pointillé clignote, de plus en plus vite, puis le rayon part. Les émetteurs dans les murs s'allument.
- Les **lignes** traversent la salle d'un mur à l'autre. Plus tard, certaines sont deux fois plus épaisses.
- Les **grilles** alignent plusieurs lignes : il reste toujours un passage.
- Les **croix** visent l'endroit où tu es au moment de l'alerte : il faut bouger.
- Les **balayages** partent d'un mur et tournent. Les deux traits de l'alerte montrent l'angle qu'ils couvrent : sors de cet angle.
- Les **piles** apparaissent loin de toi : 50 points chacune. Chaque seconde survécue donne 10 points.
- Les rayons arrivent de plus en plus souvent, avec moins d'alerte, jusqu'à 100 secondes.

## Statistiques

Le panneau Records garde ton **meilleur score**, le nombre de **parties**, les **piles** ramassées et le **temps survécu** au total.

## Données et synchronisation

Ton record et tes totaux sont enregistrés par NeoDex, sauvegardés et synchronisés entre tes PC si la synchro est activée.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Faisceaux → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
