// generate-sitemap.js
// Version ES Modules pour projets React modernes

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Pour obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de ton site
const SITE_URL = 'https://lyssama.netlify.app';
const TODAY = new Date().toISOString().split('T')[0];

// Définis toutes les routes de ton site React ici
const routes = [
  {
    path: '/',
    changefreq: 'weekly',
    priority: 1.0,
    lastmod: TODAY
  },
  {
    path: '/about',
    changefreq: 'monthly',
    priority: 0.9,
    lastmod: TODAY
  },
  {
    path: '/portfolio',
    changefreq: 'weekly',
    priority: 0.9,
    lastmod: TODAY
  },
  {
    path: '/services',
    changefreq: 'monthly',
    priority: 0.8,
    lastmod: TODAY
  },
  {
    path: '/contact',
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: TODAY
  },
];

// Fonction pour générer le XML
function generateSitemap() {
  const urls = routes.map(route => `
  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  return sitemap;
}

// Écrire le sitemap dans /public
const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
const sitemapContent = generateSitemap();

try {
  // Créer le dossier public s'il n'existe pas
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('📁 Dossier /public créé');
  }

  fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');

  console.log('✅ Sitemap généré avec succès !');
  console.log(`📍 Chemin : ${sitemapPath}`);
  console.log(`📊 ${routes.length} URLs ajoutées au sitemap`);
  console.log(`🌐 Accessible à : ${SITE_URL}/sitemap.xml`);
  console.log('\n🚀 Prochaines étapes :');
  console.log('   1. Commit et push ton code');
  console.log('   2. Vérifie sur https://lyssama.netlify.app/sitemap.xml');
  console.log('   3. Soumets à Google Search Console');
} catch (error) {
  console.error('❌ Erreur lors de la génération du sitemap :', error);
  process.exit(1);
}