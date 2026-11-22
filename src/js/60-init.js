/* =====================================================================
   DÉMARRAGE
   ===================================================================== */
function buildAlt() {
  $('#alt').innerHTML = `<h1>Lys Sama — créatrice de contenu</h1><p>Mode, culture et cinématographie. Une exposition en sept salles.</p>` +
    SECTIONS.map(s => `<section><h2>Salle ${s.num} — ${s.title}</h2><p>${s.wall}</p>${s.items.map(it => `<h3>${it.title}</h3><p><em>${it.tech}</em></p>${it.desc.map(p => `<p>${p}</p>`).join('')}`).join('')}</section>`).join('') +
    `<p>Contact : ${CONFIG.email}</p>`;
}
function fallback() {
  document.body.classList.remove('is-loading');
  $('.loader').style.display = 'none'; $('#gl').style.display = 'none'; $('#track').style.display = 'none';
  $('.bar').style.visibility = 'visible'; $('.bar-nav').style.display = 'none';
  const alt = $('#alt'); alt.classList.remove('sr-only'); alt.classList.add('is-on');
  alt.insertAdjacentHTML('afterbegin', '<p><img src="img/hero.jpg" alt="Portrait de Lys Sama" style="width:100%;height:auto;display:block;margin-bottom:24px"></p><p><strong>La visite en 3D a besoin de WebGL.</strong> Voici le contenu de l’exposition en version texte.</p>');
}

async function reveal() {
  const H = Hero.H;
  const tl = gsap.timeline();
  tl.to('.ld-meter', { opacity: 0, duration: .4 }, 0)
    .to('.ld-sub span', { yPercent: -115, duration: .6, ease: 'power3.in' }, 0)
    .to('.ld-w b', { yPercent: -115, duration: .7, ease: 'power3.in', stagger: .06 }, .05)
    .to(H, { win: 0, lz: 0, duration: REDUCED ? .6 : 1.9, ease: 'expo.inOut' }, .3)
    .to(H, { text: 1, duration: 1.5, ease: 'power2.out' }, 1.3)
    .set('.loader', { display: 'none' }, 1.2)
    .set(['.hero', '.bar'], { visibility: 'visible' }, 1.2)
    .from('.bar', { opacity: 0, y: -14, duration: .9, ease: 'power3.out' }, 1.5)
    .from('.hero-pitch > *, .hero-bill > *', { opacity: 0, y: 22, duration: 1, ease: 'power3.out', stagger: .07 }, 1.6)
    .from('.hero-invite', { opacity: 0, y: 26, duration: 1, ease: 'power3.out' }, 1.9);
  await tl;
}

async function boot() {
  const t0 = performance.now();
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  buildAlt();
  let R;
  try { R = new THREE.WebGLRenderer({ canvas: $('#gl'), antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { fallback(); return; }
  Gal.renderer = R; R.setPixelRatio(V.dpr); R.setSize(V.w, V.h, false);
  MAXA = Math.min(8, R.capabilities.getMaxAnisotropy());
  Gal.rt = new THREE.WebGLRenderTarget(Math.round(V.w * V.dpr), Math.round(V.h * V.dpr), { samples: 4 });

  /* écran de chargement */
  gsap.set('.ld-w b', { yPercent: 115 });
  gsap.to('.ld-w b', { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: .09, delay: .1 });
  gsap.from('.ld-sub span', { yPercent: 115, duration: 1, ease: 'expo.out', delay: .4 });
  const meter = { v: 0 }, num = $('.ld-num b');
  const setM = v => gsap.to(meter, { v, duration: .7, ease: 'power2.out', overwrite: true, onUpdate: () => { num.textContent = Math.round(meter.v); } });
  setM(8);

  const faces = ['600 80px Fraunces', 'italic 600 80px Fraunces', 'italic 400 30px Fraunces', '500 30px Fraunces', 'italic 500 30px Fraunces', '400 30px "Hanken Grotesk"', '500 30px "Hanken Grotesk"', '600 30px Antonio', '500 30px Antonio'];
  const fonts = Promise.race([Promise.all(faces.map(f => document.fonts.load(f))).catch(() => {}), sleep(4500)]);
  await Promise.all([loadImg('hero', 'img/hero.jpg'), loadImg('face', 'img/face.jpg'), loadImg('matte', 'img/matte.png'), fonts]);
  setM(24);
  Hero.init(); Hero.winRect = winRect(); Hero.layout();
  gsap.fromTo(Hero.mat.uniforms.uHas, { value: 0 }, { value: IMG.hero ? 1 : 0, duration: 1 });
  gsap.ticker.add(frame); gsap.ticker.lagSmoothing(0);
  addEventListener('resize', onResize);

  await Promise.all(['eyes', 'lens', 'figure', 'portrait', 'hand', 'pattern', 'skirt'].map(k => loadImg(k, `img/a-${k}.jpg`)));
  setM(40);
  await buildGallery(p => setM(40 + p * 54));
  for (const it of ITEMS) R.initTexture(it.artMat.uniforms.map.value);
  measureScroll();
  /* premier rendu à blanc pour compiler les matériaux avant d’entrer */
  G.room = 0; setVisible(0); G.s = G.sT = Gal.S0; walkPose(G.s, Rig); G.enter = 1; applyLights(); applyRig();
  R.setRenderTarget(Gal.rt); R.render(Gal.scene, Gal.camera); R.setRenderTarget(null); R.render(Gal.scene, Gal.camera); G.enter = 0;
  G.built = true;
  setM(100); await sleep(Math.max(850, 2600 - (performance.now() - t0)));

  await reveal();
  document.body.classList.remove('is-loading'); window.scrollTo(0, 0);
  buildPortalTl();
  if (!REDUCED && window.Lenis) { lenis = new Lenis({ lerp: .085, wheelMultiplier: .8 }); lenis.on('scroll', e => onScroll(e.scroll)); }
  else addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
  G.mode = 'walk'; UI.init(); UI.room(Gal.rooms[0]); onScroll(0);
}

/* accès pour les tests */
window.__lys = { G, Gal, Rig, Hero, UI, Scr, ITEMS, openFocus, closeFocus, navFocus, teleport, scrollToY, yForS, byId, get lenis() { return lenis; } };
boot();
