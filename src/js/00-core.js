import * as THREE from 'three';

/* =====================================================================
   RÉGLAGES — à compléter avec les vraies infos de Lys
   ===================================================================== */
const CONFIG = {
  email: 'contact@lyssama.com',   // TODO : vrai e-mail
  instagram: 'lyssama',           // TODO : vrai pseudo
  tiktok: 'lyssama',              // TODO : vrai pseudo
};

/* Photo d’accueil : repères mesurés sur img/hero.jpg (2060 × 1650 px) */
const PHOTO = {
  w: 2060, h: 1650,
  eye: { x: 1140.5, y: 704.5 },          // centre de l’iris (œil à droite de l’image)
  mid: { x: 1066, y: 716 },              // entre les deux yeux
  pupil: 4.2, iris: 11.5,
  face: { x0: 880, y0: 520, x1: 1340, y1: 940 },   // zone de img/face.jpg (×4)
  head: { l: 905, r: 1318, top: 415, cx: 1110 },
};

/* =====================================================================
   CONTENU — brouillons à valider avec Lys
   ===================================================================== */
const SECTIONS = [
  { id: 'essence', num: 'I', title: 'L’Essence', sub: 'Ikigai, vision, cap', end: 'white',
    wall: 'Avant les images, il y a une raison de les faire. Cette salle dit pourquoi je crée, ce que je vois et où je vais.',
    items: [
      { id: 'ikigai', art: 'ikigai', ratio: 1, h: 1.9, frame: 'oak', title: 'Ikigai', tech: 'Quatre cercles, un seul centre',
        desc: ['L’ikigai, c’est le point où se croisent ce que j’aime, ce que je sais faire, ce dont le monde a besoin et ce qui me fait vivre.', 'Le mien tient en une phrase : raconter des histoires par la mode, la culture et l’image, et aider d’autres créateurs à faire de leur passion un métier.'],
        facts: [['J’aime', 'Raconter, habiller, filmer'], ['Je sais faire', 'Le récit en images'], ['Le monde a besoin', 'De récits africains ambitieux'], ['Ce qui me fait vivre', 'Contenus, campagnes, outils']] },
      { id: 'vision', art: 'vision', ratio: 1.6, h: 1.35, frame: 'ink', title: 'La Vision', tech: 'Regard, tirage noir et vin',
        desc: ['Je crois à une création africaine qui n’attend plus qu’on lui donne la parole.', 'Chaque contenu se pense comme une œuvre : une idée, un cadre, une lumière. Et il relie des marques, des créateurs et une culture qui a beaucoup à montrer.'] },
      { id: 'horizon', art: 'horizon', ratio: 1.5, h: 2.0, frame: 'white', title: 'Le Cap', tech: 'Objectif à long terme',
        desc: ['Mon objectif : bâtir une maison créative. Un lieu où la mode, la culture et le cinéma se rencontrent, et où les créateurs du continent trouvent de quoi vivre de leur art.'],
        facts: [['Cap', 'Une maison créative'], ['Pour', 'La nouvelle génération de créateurs']] },
    ] },
  { id: 'parcours', num: 'II', title: 'Le Parcours', sub: 'Trois chapitres', end: 'wine',
    wall: 'Trois chapitres, dans l’ordre du tournage. Rien n’a été coupé au montage.',
    items: [
      { id: 'debuts', art: 'debuts', ratio: .8, h: 2.05, frame: 'ink', title: 'Les débuts', tech: 'Chapitre I — planche-contact',
        desc: ['Un téléphone, une idée, et l’envie de montrer le monde comme je le vois.', 'Les premiers contenus sont des essais de cadre, de lumière et de voix. La signature est déjà là.'] },
      { id: 'camera', art: 'camera', ratio: .8, h: 2.05, frame: 'ink', title: 'Derrière la caméra', tech: 'Chapitre II — tirage argentique',
        desc: ['Je passe de l’autre côté de l’objectif : écrire, réaliser, monter.', 'Créer du contenu devient une langue, puis un métier.'] },
      { id: 'stairs', art: 'stairs', ratio: 1.33, h: 1.9, frame: 'oak', title: 'L’entrepreneuse', tech: 'Chapitre III — marche après marche',
        desc: ['Je fabrique mes propres outils, je signe des collaborations de marque, je transmets ce que j’apprends.', 'Le contenu devient une entreprise, et l’entreprise un terrain de création.'] },
    ] },
  { id: 'realisations', num: 'III', title: 'Les Réalisations', sub: 'Ce que j’ai construit', end: 'white',
    wall: 'Ce que j’ai construit, signé, lancé. La preuve par l’œuvre.',
    items: [
      { id: 'lab', art: 'lab', ratio: .8, h: 2.1, frame: 'wine', title: 'Du Lab à la Collab', tech: 'Outil pour créateurs — media kit',
        desc: ['Un constat de départ : beaucoup de créateurs talentueux ne savent pas se présenter aux marques.', 'L’outil les guide pas à pas pour construire un media kit professionnel (chiffres, univers, offres) et décrocher leurs premières collaborations.'],
        facts: [['Pour', 'Créateurs de contenu'], ['Format', 'Media kit guidé']], actions: [{ label: 'En parler', to: 'contact' }] },
      { id: 'pricing', art: 'pricing', ratio: 1, h: 1.75, frame: 'ink', title: 'Pricing Studio', tech: 'Code, tableurs et sens des affaires',
        desc: ['Un outil de gestion que j’ai codé pour piloter mon activité : clients, devis, tarifs, finances.', 'Une créatrice est aussi une cheffe d’entreprise.'],
        facts: [['Type', 'Outil interne'], ['Usage', 'Clients et finances']] },
      { id: 'brands', art: 'braid', ratio: .75, h: 2.05, frame: 'oak', title: 'Collaborations de marque', tech: 'Campagnes mode et beauté',
        desc: ['Des campagnes pensées comme des courts-métrages : concept, script, tournage, publication, bilan.', 'Je raconte les marques avec la même exigence que mes propres histoires.'],
        facts: [['Formats', 'Reels, TikTok, stories'], ['Méthode', 'Du concept au bilan chiffré']] },
      { id: 'mode', art: 'mode', ratio: .64, h: 2.75, frame: 'ink', title: 'Silhouettes', tech: 'Série mode',
        desc: ['La mode comme écriture : chaque tenue raconte un lieu, une époque, une humeur.', 'Une série où le vêtement devient un personnage.'] },
    ] },
  { id: 'processus', num: 'IV', title: 'Le Processus créatif', sub: 'Quatre gestes', end: 'ink', screen: true,
    wall: 'Une idée devient une image en quatre gestes. Toujours les mêmes, jamais de la même façon.',
    items: [
      { id: 'observer', art: 'observe', ratio: 1, h: 1.42, frame: 'ink', title: 'Observer', tech: 'Premier geste',
        desc: ['Tout part du regard : une rue, un marché, un tissu, une lumière de fin d’après-midi.', 'Je note, je photographie, je garde. Rien ne se crée sans avoir d’abord été vu.'] },
      { id: 'ecrire', art: 'write', ratio: 1, h: 1.42, frame: 'ink', title: 'Écrire', tech: 'Deuxième geste',
        desc: ['Un script, même pour trente secondes : une accroche, une tension, une chute.', 'L’histoire d’abord, la tendance ensuite.'] },
      { id: 'tourner', art: 'shoot', ratio: 1, h: 1.42, frame: 'ink', title: 'Tourner', tech: 'Troisième geste',
        desc: ['Je réalise comme au cinéma, avec ce que j’ai, là où je suis.', 'Le cadre est une intention, la lumière une émotion.'] },
      { id: 'monter', art: 'edit', ratio: 1, h: 1.42, frame: 'ink', title: 'Monter', tech: 'Quatrième geste',
        desc: ['Le montage est une deuxième écriture.', 'Couper, rythmer, affiner, jusqu’à ce que l’émotion soit juste.'] },
    ] },
  { id: 'services', num: 'V', title: 'Les Services', sub: 'Travaillons ensemble', end: 'wine',
    wall: 'Pour les marques qui veulent être racontées, pas seulement montrées.',
    items: [
      { id: 'contenu', art: 'content', ratio: .75, h: 2.0, frame: 'ink', title: 'Création de contenu', tech: 'Reels, TikTok, UGC, photo',
        desc: ['Des formats courts qui arrêtent le pouce et racontent quelque chose.', 'Écriture, tournage, montage : vous recevez des contenus prêts à publier.'],
        facts: [['Formats', 'Reels, TikTok, UGC'], ['Tarif', 'Sur devis']], actions: [{ label: 'Demander un devis', to: 'contact' }] },
      { id: 'influence', art: 'ripple', ratio: .8, h: 2.0, frame: 'wine', title: 'Campagnes d’influence', tech: 'Portée, stratégie, résultats',
        desc: ['Des campagnes conçues de A à Z, diffusées sur mes réseaux et suivies avec des chiffres clairs.', 'Les concepts sont validés avant publication, les résultats partagés après.'],
        facts: [['Livrables', 'Vidéos et stories'], ['Suivi', 'Bilan chiffré']], actions: [{ label: 'Lancer une campagne', to: 'contact' }] },
      { id: 'direction', art: 'direction', ratio: .8, h: 2.0, frame: 'oak', title: 'Direction créative', tech: 'Concept, moodboard, réalisation',
        desc: ['Pour un lancement, une collection, un événement : un concept fort, un moodboard, une réalisation cohérente.', 'La règle d’or du cadre, appliquée à votre marque.'], actions: [{ label: 'Parler de votre projet', to: 'contact' }] },
      { id: 'accompagnement', art: 'kit', ratio: .8, h: 2.25, frame: 'ink', title: 'Accompagnement créateurs', tech: 'Media kit, positionnement, tarifs',
        desc: ['J’aide les créateurs à se professionnaliser : positionnement, media kit, grille tarifaire.', 'C’est la suite logique de « Du Lab à la Collab ».'], actions: [{ label: 'Être accompagné·e', to: 'contact' }] },
    ] },
  { id: 'livre', num: 'VI', title: 'Le Livre', sub: 'Manuscrit en cours', end: 'white', vitrine: true,
    wall: 'Certaines histoires ne tiennent pas en soixante secondes.',
    items: [
      { id: 'carnet', art: 'notes', ratio: .78, h: 1.7, frame: 'oak', title: 'Carnet d’écriture', tech: 'Notes, ratures, fragments',
        desc: ['Les coulisses du manuscrit : des fragments, des idées, des chapitres en chantier.', 'Un livre s’écrit comme un film se monte, couche après couche.'] },
      { id: 'livre', art: 'book', ratio: 1.5, h: 1.85, frame: 'ink', title: 'Le Livre', tech: 'Manuscrit — titre à venir', form: 'notify',
        desc: ['J’écris un livre. Il parle de création, d’audace et de ce que l’on construit quand personne ne regarde encore.', 'Le titre, la date et les premières pages seront dévoilés ici en premier.'] },
    ] },
  { id: 'contact', num: 'VII', title: 'Contact', sub: 'La dernière salle est une porte', end: 'wine', last: true,
    wall: 'Une idée, une marque, un projet ? La suite s’écrit à deux.',
    items: [
      { id: 'contact', art: 'contact', ratio: 1.4, h: 1.95, frame: 'ink', title: 'Parlons.', tech: 'Œuvre à écrire ensemble', form: 'contact',
        desc: ['Collaboration de marque, création de contenu, direction créative, presse ou livre : racontez-moi votre projet.'] },
    ] },
];
SECTIONS.forEach((sec, i) => { sec.i = i; sec.items.forEach(it => { it.sec = sec; }); });
const ITEMS = SECTIONS.flatMap(s => s.items);
ITEMS.forEach((it, i) => { it.n = i + 1; });
const byId = id => ITEMS.find(i => i.id === id);

/* =====================================================================
   Outils
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const rad = d => d * Math.PI / 180;
const pad2 = n => String(n).padStart(2, '0');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));
const lin = v => Math.pow(v, 2.2);
const hexLin = hex => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
const TOUCH = matchMedia('(hover:none),(pointer:coarse)').matches;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const P = { paper: '#F3F0EC', white: '#FBFAF8', cream: '#EDE4D8', blush: '#E6D2CB', rose: '#C48A86', wine: '#6E0F1E', wine2: '#8A1C2D', deep: '#35070F', ink: '#161214', grey: '#BDB6B1', mute: '#6c6460' };
const FRAMES = { ink: '#1b1618', wine: '#5E0C18', oak: '#B08C64', white: '#F1EEE9' };

/* Écran */
const V = { w: 1, h: 1, asp: 1, dpr: 1, small: false, fov: 56, bias: 0 };
function measure() {
  const cv = document.getElementById('gl');
  V.w = Math.max(1, (cv && cv.clientWidth) || innerWidth); V.h = Math.max(1, (cv && cv.clientHeight) || innerHeight); V.asp = V.w / V.h;
  V.small = Math.min(V.w, V.h) < 600;
  V.dpr = Math.min(window.devicePixelRatio || 1, V.small ? 1.6 : 1.75);
  V.fov = lerp(74, 56, sstep(.6, 1.4, V.asp));                 // champ vertical
  V.bias = rad(lerp(34, 22, sstep(.6, 1.3, V.asp)));           // regard vers le mur des œuvres
}
measure();

/* État global */
const G = {
  mode: 'loading',          // loading | walk | focus
  phase: 'intro',           // intro | gallery | outro
  portal: 0,                // 0 = accueil, 1 = dans la galerie
  s: 0, sT: 0,              // position sur le parcours (m)
  room: -1, dim: 1, par: 1,
  mx: 0, my: 0, tmx: 0, tmy: 0,
  time: 0, built: false, busy: false, sound: false,
};
