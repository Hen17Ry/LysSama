# Lys Sama — La Galerie intérieure

Site vitrine immersif : on entre par l'œil de Lys et on visite une exposition en sept salles
(Essence, Parcours, Réalisations, Processus créatif, Services, Livre, Contact).

Three.js pour le bâtiment, GSAP pour les animations, Lenis pour le défilement. Aucun framework, aucune étape d'installation.

## Structure

- `public/` : le site tel qu'il est servi (`index.html` + `img/`). C'est ce dossier que Vercel publie.
- `src/` : les sources. `index.tpl.html`, `style.css` et les modules `js/` sont assemblés en une seule page.
- `build.py` : assemble `src/` vers `public/index.html`.

## Modifier le site

```bash
python3 build.py                 # régénère public/index.html
python3 -m http.server -d public # aperçu sur http://localhost:8000
```

Les réglages à compléter sont en haut de `src/js/00-core.js` :

- `CONFIG` : e-mail, Instagram, TikTok (valeurs provisoires).
- `SECTIONS` : les sept salles, leurs œuvres et leurs textes (brouillons à valider).
- `PHOTO` : repères de la photo d'accueil (position de l'œil), à remesurer si la photo change.

Les affiches des tableaux sont dessinées dans `src/js/10-art.js` en attendant les vrais visuels.

## À faire avant l'ouverture au public

- Remplacer les textes, l'e-mail et les pseudos provisoires.
- Brancher le formulaire de contact (il n'envoie rien pour l'instant).
- Retirer `<meta name="robots" content="noindex">` dans `src/index.tpl.html`.
