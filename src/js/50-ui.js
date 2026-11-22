/* =====================================================================
   SON (facultatif, coupé par défaut) — synthétisé, aucun fichier
   ===================================================================== */
const Snd = {
  ctx: null, on: false, lastStep: 0, side: 1,
  init() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    const ctx = this.ctx = new AC(), m = this.master = ctx.createGain(); m.gain.value = 0; m.connect(ctx.destination);
    const n = ctx.sampleRate * 2, buf = this.noise = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0); let last = 0;
    for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380; const g = ctx.createGain(); g.gain.value = .55;
    src.connect(lp); lp.connect(g); g.connect(m); src.start();
    const padLp = ctx.createBiquadFilter(); padLp.type = 'lowpass'; padLp.frequency.value = 700; const padG = ctx.createGain(); padG.gain.value = .5; padLp.connect(padG); padG.connect(m);
    this.pad = [1, 1.5, 2].map((mul, i) => {
      const o = ctx.createOscillator(); o.type = i === 2 ? 'triangle' : 'sine'; o.frequency.value = 110 * mul;
      const og = ctx.createGain(); og.gain.value = i === 2 ? .012 : .028;
      const l = ctx.createOscillator(); l.frequency.value = .06 + i * .035; const lg = ctx.createGain(); lg.gain.value = .01; l.connect(lg); lg.connect(og.gain);
      o.connect(og); og.connect(padLp); o.start(); l.start(); return { o, mul };
    });
    return true;
  },
  toggle() {
    try {
      if (!this.ctx && !this.init()) return false;
      this.ctx.resume(); this.on = !this.on;
      this.master.gain.setTargetAtTime(this.on ? .6 : 0, this.ctx.currentTime, .35);
      if (this.on && G.room >= 0) this.room(G.room);
    } catch (e) { this.on = false; }
    return this.on;
  },
  burst(freq, q, peak, dur, pan = 0, type = 'bandpass') {
    if (!this.on) return; try {
      const ctx = this.ctx, t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = this.noise; s.playbackRate.value = .8 + Math.random() * .5;
      const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(f); f.connect(g);
      if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(this.master); } else g.connect(this.master);
      s.start(t, Math.random()); s.stop(t + dur + .05); return f;
    } catch (e) { /* silencieux */ }
  },
  walk(dist) { if (!this.on || dist - this.lastStep < .8) return; this.lastStep = dist; this.side *= -1; this.burst(140, .9, 1.4, .16, this.side * .22, 'lowpass'); },
  tick() { this.burst(2600, 3, .5, .05); },
  whoosh() { const f = this.burst(300, .8, 1.1, .75); if (f) try { const t = this.ctx.currentTime; f.frequency.exponentialRampToValueAtTime(1300, t + .3); f.frequency.exponentialRampToValueAtTime(220, t + .7); } catch (e) { /* */ } },
  room(i) { if (!this.on) return; try { const roots = [110, 123.47, 98, 130.81, 110, 146.83, 98], t = this.ctx.currentTime; this.pad.forEach(p => p.o.frequency.setTargetAtTime(roots[i % roots.length] * p.mul, t, .9)); } catch (e) { /* */ } },
};

/* =====================================================================
   FICHE ŒUVRE — la caméra se place face au tableau, on passe de l’un à l’autre
   ===================================================================== */
const nearAngle = (a, ref) => a + Math.round((ref - a) / (Math.PI * 2)) * Math.PI * 2;
function focusLayout() { const p = $('.panel'), r = p.getBoundingClientRect(); return { side: getComputedStyle(p).getPropertyValue('--layout').trim() !== 'sheet', pw: r.width, ph: r.height }; }
function focusPose(it, o = {}) {
  const L = focusLayout(), tan = Math.tan(rad(V.fov / 2)); let wF, hF, cx, cy;
  if (L.side) { const av = V.w - L.pw; wF = av / V.w * .76; hF = .66; cx = av / 2 / V.w; cy = .5; }
  else { const top = $('.bar').offsetHeight * .7, av = V.h - L.ph - top; hF = av / V.h * .84; wF = .86; cx = .5; cy = (top + av / 2) / V.h; }
  const d = clamp(Math.max(it.H / (2 * tan * hF), it.W / (2 * tan * V.asp * wF)), 1.4, it.maxD);
  o.x = it.center.x + it.normal.x * d; o.y = it.center.y; o.z = it.center.z + it.normal.z * d;
  o.yaw = Math.atan2(it.normal.x, it.normal.z); o.pitch = 0; o.fov = V.fov; o.ox = .5 - cx; o.oy = .5 - cy;
  return o;
}
function panelSet(hidden) { const L = focusLayout(); gsap.set('.panel', L.side ? { xPercent: hidden ? 103 : 0, yPercent: 0 } : { yPercent: hidden ? 103 : 0, xPercent: 0 }); }
function panelMove(show, dur = 1.1) { const L = focusLayout(), v = show ? 0 : 103; return gsap.to('.panel', { ...(L.side ? { xPercent: v } : { yPercent: v }), duration: dur, ease: show ? 'expo.out' : 'power3.inOut', overwrite: true }); }

function renderPanel(it) {
  const sec = it.sec, i = ITEMS.indexOf(it), nx = ITEMS[i + 1];
  let h = `<p class="p-kicker">Salle ${sec.num} — ${sec.title}<span>N° ${pad2(it.n)}</span></p>
    <h2 class="p-title">${it.title.split(' ').map(w => `<span class="w"><span>${w}</span></span>`).join(' ')}</h2>
    <p class="p-tech">${it.tech}</p>
    <div class="p-desc">${it.desc.map(p => `<p>${p}</p>`).join('')}</div>`;
  if (it.facts) h += `<dl class="p-facts">${it.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  if (it.form === 'contact') h += `<form class="p-form" novalidate>
      <div class="row"><label>Nom<input name="name" autocomplete="name"></label><label>E-mail<input name="email" type="email" autocomplete="email"></label></div>
      <label>Votre projet<select name="type"><option>Collaboration de marque</option><option>Création de contenu</option><option>Direction créative</option><option>Accompagnement créateur</option><option>Presse / Livre</option><option>Autre</option></select></label>
      <label>Message<textarea name="msg" rows="4"></textarea></label>
      <button class="btn" type="submit">Envoyer</button><p class="p-note" role="status"></p></form>
    <p class="p-direct">Ou directement : <strong>${CONFIG.email}</strong><br>Instagram <a href="https://instagram.com/${CONFIG.instagram}" target="_blank" rel="noopener">@${CONFIG.instagram}</a> · TikTok <a href="https://www.tiktok.com/@${CONFIG.tiktok}" target="_blank" rel="noopener">@${CONFIG.tiktok}</a></p>`;
  if (it.form === 'notify') h += `<form class="p-form" novalidate><label>Être prévenu·e de la sortie<input name="email" type="email" placeholder="votre@email.com" autocomplete="email"></label><button class="btn" type="submit">Me prévenir</button><p class="p-note" role="status"></p></form>`;
  if (it.actions) h += `<div class="p-actions">${it.actions.map(a => `<button class="btn" data-go="${a.to}">${a.label}</button>`).join('')}</div>`;
  const body = $('.p-body'); body.innerHTML = h; $('.p-scroll').scrollTop = 0;
  $('.p-count').innerHTML = `<b>${pad2(i + 1)}</b> / ${ITEMS.length}`;
  $('.p-prev').disabled = i === 0;
  const nb = $('.p-next'); nb.disabled = !nx; $('.pn-t').textContent = nx ? nx.title : 'Fin de la visite';
  $$('form', body).forEach(f => f.addEventListener('submit', ev => { ev.preventDefault(); $('.p-note', f).textContent = `Formulaire de démonstration : rien n’a été envoyé. Écrivez à ${CONFIG.email}.`; }));
}
function panelTextIn(dir = 1, delay = 0) {
  const body = $('.p-body');
  gsap.fromTo($$('.p-title .w > span', body), { yPercent: 115 }, { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: .06, delay });
  gsap.fromTo([...body.children].filter(e => !e.classList.contains('p-title')), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .06, delay: delay + .12 });
  gsap.fromTo('.p-nav > *', { opacity: 0 }, { opacity: 1, duration: .6, delay: delay + .3, stagger: .05, clearProps: 'opacity' });
}
function panelTextOut() { const body = $('.p-body'); return gsap.to([...body.children], { opacity: 0, y: -18, duration: .32, ease: 'power2.in', stagger: .025 }); }
const setFw = (it, v, dur = 1) => gsap.to(it, { fw: v, duration: dur, ease: 'power2.inOut', overwrite: 'auto' });

function openFocus(it) {
  if (G.busy || G.mode !== 'walk' || !G.built || G.phase !== 'gallery') return;
  G.busy = true; UI.hover(null); Focus.item = it; G.mode = 'focus'; document.body.classList.add('is-focus');
  lenis && lenis.stop(); UI.setHud(false); UI.card(false);
  wakeRoom(it.room, true); renderPanel(it); panelSet(true); $('.panel').style.visibility = 'visible'; $('.panel').setAttribute('aria-hidden', 'false');
  const to = focusPose(it); to.yaw = nearAngle(to.yaw, Rig.yaw);
  gsap.to(G, { dim: .17, duration: 1.2, ease: 'power2.inOut' }); setFw(it, 1, 1.2);
  Snd.whoosh();
  gsap.timeline({ onComplete: () => { G.busy = false; } })
    .to(Rig, { x: to.x, y: to.y, z: to.z, yaw: to.yaw, ox: to.ox, oy: to.oy, duration: REDUCED ? .4 : 1.55, ease: 'power3.inOut' }, 0)
    .add(panelMove(true, 1.15), .45)
    .add(() => panelTextIn(1), .6);
}
function closeFocus() {
  if (G.busy || G.mode !== 'focus') return; G.busy = true;
  const it = Focus.item, s = clamp(it.sView, Gal.S0, Gal.S1);
  scrollToY(yForS(s)); G.s = G.sT = s;
  const to = walkPose(s, {}); to.yaw = nearAngle(to.yaw, Rig.yaw);
  panelMove(false, .8); setFw(it, 0, 1.1);
  gsap.to(G, { dim: 1, duration: 1.2, ease: 'power2.inOut' });
  gsap.to(Rig, { x: to.x, y: to.y, z: to.z, yaw: to.yaw, ox: 0, oy: 0, duration: REDUCED ? .4 : 1.35, ease: 'power3.inOut', onComplete: () => {
    Focus.item = null; G.mode = 'walk'; document.body.classList.remove('is-focus'); $('.panel').style.visibility = 'hidden'; $('.panel').setAttribute('aria-hidden', 'true');
    lenis && lenis.start(); G.busy = false; UI.sync();
  } });
}
function navFocus(dir, target) {
  const from = Focus.item, it = target || ITEMS[ITEMS.indexOf(from) + dir];
  if (!it || it === from || G.busy || G.mode !== 'focus') return;
  const to = focusPose(it); to.yaw = nearAngle(to.yaw, Rig.yaw);
  if (it.room === from.room && !REDUCED) {
    /* même salle : travelling le long du mur (ou quart de tour vers le mur du fond) */
    G.busy = true; const same = it.wall === from.wall, dur = same ? 1.5 : 1.9, A = { x: Rig.x, z: Rig.z }, n = from.normal, pr = { t: 0 };
    panelTextOut(); setFw(from, 0, dur * .7); setFw(it, 1, dur * .9);
    gsap.timeline({ onComplete: () => { G.busy = false; } })
      .to(pr, { t: 1, duration: dur, ease: 'power3.inOut', onUpdate: () => { const e = pr.t, bump = same ? Math.sin(Math.PI * e) * .5 : 0; Rig.x = lerp(A.x, to.x, e) + n.x * bump; Rig.z = lerp(A.z, to.z, e) + n.z * bump; } }, 0)
      .to(Rig, { y: to.y, yaw: to.yaw, ox: to.ox, oy: to.oy, duration: dur, ease: 'power3.inOut' }, 0)
      .add(() => { Focus.item = it; renderPanel(it); panelTextIn(dir); }, dur * .4);
  } else {
    /* autre salle : clignement */
    panelTextOut();
    blink(() => {
      from.fw = 0; it.fw = 1; gsap.killTweensOf(from, 'fw'); gsap.killTweensOf(it, 'fw');
      Focus.item = it; wakeRoom(it.room, true); renderPanel(it); panelTextIn(dir, .25);
      gsap.killTweensOf(Rig); Object.assign(Rig, { x: to.x + it.normal.x * .55, y: to.y, z: to.z + it.normal.z * .55, yaw: to.yaw, ox: to.ox, oy: to.oy });
      gsap.to(Rig, { x: to.x, z: to.z, duration: 1.8, ease: 'power2.out' });
    });
  }
}

/* =====================================================================
   INTERFACE — visite, cartons de salle, plan, pointeur
   ===================================================================== */
const UI = {
  hudOn: false, capItem: null, cardTl: null, moved: 0, hintGone: false,
  init() {
    const hud = $('.hud-prog'); hud.innerHTML = Gal.rooms.map(r => `<i style="--f:${(r.s1 - r.s0).toFixed(2)}"></i>`).join(''); this.segs = $$('i', hud);
    this.buildPlan();
    $('.hud-hint span').textContent = TOUCH ? 'Glissez pour avancer · Touchez une œuvre' : 'Défilez pour avancer · Cliquez sur une œuvre';
    const cv = $('#gl');
    addEventListener('pointermove', e => {
      G.tmx = e.clientX / V.w * 2 - 1; G.tmy = e.clientY / V.h * 2 - 1; G.ptr.set(G.tmx, -G.tmy); G.ptrDirty = true; G.overUI = e.target !== cv;
      this.cx && (this.cx(e.clientX), this.cy(e.clientY));
    }, { passive: true });
    if (!TOUCH) { const c = $('.cursor'); this.cx = gsap.quickTo(c, 'x', { duration: .3, ease: 'power3' }); this.cy = gsap.quickTo(c, 'y', { duration: .3, ease: 'power3' }); }
    cv.addEventListener('click', e => { if (G.mode !== 'walk' || G.phase !== 'gallery' || G.busy) return; const it = pick(new THREE.Vector2(e.clientX / V.w * 2 - 1, -(e.clientY / V.h * 2 - 1))); if (it) openFocus(it); });
    let tx = 0, ty = 0;
    cv.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    cv.addEventListener('touchend', e => { if (G.mode !== 'focus') return; const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.5) navFocus(dx < 0 ? 1 : -1); }, { passive: true });
    $('.hud-cap').addEventListener('click', () => { if (this.capItem) openFocus(this.capItem); });
    $('.p-close').addEventListener('click', closeFocus);
    $('.panel').addEventListener('click', e => { const nav = e.target.closest('[data-nav]'); if (nav) navFocus(+nav.dataset.nav); const go = e.target.closest('[data-go]'); if (go) navFocus(1, byId(go.dataset.go)); });
    $('[data-contact]').addEventListener('click', () => this.goContact());
    $('[data-enter]').addEventListener('click', () => { const y = Scr.yIntro + V.h * .5; if (lenis) scrollToY(y, { duration: 6.5, easing: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 }); else window.scrollTo({ top: y, behavior: 'smooth' }); });
    $$('[data-home]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); this.plan(false); if (G.mode !== 'walk' || G.busy || G.phase === 'intro' && curY() < 4) return; blink(() => { scrollToY(0); G.s = G.sT = Gal.S0; }); }));
    $('[data-plan]').addEventListener('click', () => this.plan(true));
    $('[data-plan-close]').addEventListener('click', () => this.plan(false));
    $('[data-sound]').addEventListener('click', e => { const on = Snd.toggle(); e.currentTarget.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    addEventListener('keydown', e => {
      if (e.key === 'Escape') { if (this.planOpen) this.plan(false); else closeFocus(); }
      if (G.mode === 'focus' && !e.target.closest('input,textarea,select')) { if (e.key === 'ArrowRight') navFocus(1); if (e.key === 'ArrowLeft') navFocus(-1); }
    });
    panelSet(true);
  },
  goContact() {
    const it = byId('contact'); this.plan(false);
    if (G.mode === 'focus') return navFocus(1, it);
    if (G.busy) return;
    const tl = teleport(it.sView); if (tl) tl.then(() => openFocus(it));
  },
  setHud(on) { if (on === this.hudOn) return; this.hudOn = on; gsap.to('.hud', { autoAlpha: on ? 1 : 0, duration: .5, overwrite: true }); if (!on) this.cap(null); },
  sync() {
    this.setHud(G.phase === 'gallery' && G.mode === 'walk' && G.portal >= .999);
    if (!this.segs) return;
    this.segs.forEach((el, i) => { const r = Gal.rooms[i]; el.style.setProperty('--p', clamp((G.sT - r.s0) / (r.s1 - r.s0)).toFixed(3)); });
    if (!this.hintGone && G.phase === 'gallery' && G.sT > 9) { this.hintGone = true; gsap.to('.hud-hint', { autoAlpha: 0, y: -10, duration: .6 }); }
    const end = G.phase === 'gallery' && G.sT > Gal.S1 - 2.2;
    if (end !== !!this.endOn) { this.endOn = end; if (end) $('.hud-hint span').textContent = 'Continuez pour ressortir'; gsap.to('.hud-hint', { autoAlpha: end ? 1 : 0, y: end ? 0 : -10, duration: .6, overwrite: true }); }
  },
  room(room) {
    const sec = room.sec;
    $('.hr-num').textContent = sec.num; $('.hr-title').textContent = sec.title;
    $$('.plan-list button').forEach((b, i) => b.classList.toggle('on', i === room.i)); $$('.plan-map .rm').forEach((b, i) => b.classList.toggle('on', i === room.i));
    Snd.room(room.i);
    if (G.mode === 'walk' && G.portal > .6 && G.phase !== 'outro') this.card(sec);
  },
  card(sec) {
    if (this.cardTl) { this.cardTl.kill(); this.cardTl = null; }
    if (!sec) { gsap.to('.card', { autoAlpha: 0, duration: .3, overwrite: true }); return; }
    $('.card-k').textContent = 'Salle ' + sec.num; $('.card-t span').textContent = sec.title; $('.card-s').textContent = sec.sub;
    this.cardTl = gsap.timeline()
      .fromTo('.card', { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, 0)
      .fromTo('.card-t span', { yPercent: 112 }, { yPercent: 0, duration: 1.1, ease: 'expo.out' }, .05)
      .fromTo(['.card-k', '.card-s'], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .12 }, .2)
      .to('.card-t span', { yPercent: -112, duration: .7, ease: 'power3.in' }, 2.1)
      .to(['.card-k', '.card-s'], { opacity: 0, duration: .4 }, 2.1)
      .to('.card', { autoAlpha: 0, duration: .5 }, 2.5);
  },
  cap(it) {
    if (it === this.capItem) return; this.capItem = it; const el = $('.hud-cap');
    if (it) { $('.hc-n').textContent = 'N° ' + pad2(it.n); $('.hc-t').textContent = it.title; el.tabIndex = 0; gsap.to(el, { autoAlpha: 1, y: 0, duration: .45, ease: 'power3.out', overwrite: true }); }
    else { el.tabIndex = -1; gsap.to(el, { autoAlpha: 0, y: 10, duration: .3, overwrite: true }); }
  },
  hover(it) {
    if (it === G.hover) return;
    if (G.hover) gsap.to(G.hover, { hov: 0, duration: .5, overwrite: 'auto' });
    G.hover = it; if (it) gsap.to(it, { hov: 1, duration: .5, overwrite: 'auto' });
    $('#gl').classList.toggle('is-pointing', !!it);
    gsap.to('.cursor', { scale: it ? 1 : 0, duration: .45, ease: it ? 'back.out(1.6)' : 'power3.in', overwrite: 'auto' });
  },
  tick() {
    if (!this.hudOn) return;
    let best = null, bd = 1e9;
    for (const it of Gal.rooms[G.room].items) { const d = Math.abs(it.sView + (it.wall === 'end' ? 0 : .8) - G.s), lim = it.wall === 'end' ? 4.2 : 2.6; if (d < lim && d < bd) { bd = d; best = it; } }
    this.cap(G.hover || best);
  },
  resize() { if (G.mode === 'focus' && Focus.item && !G.busy) { const to = focusPose(Focus.item); to.yaw = nearAngle(to.yaw, Rig.yaw); Object.assign(Rig, to); panelSet(false); } else panelSet(true); },

  /* ---------- plan de l’exposition ---------- */
  buildPlan() {
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    Gal.rooms.forEach(r => r.corners.forEach(c => { x0 = Math.min(x0, c.x); x1 = Math.max(x1, c.x); z0 = Math.min(z0, c.z); z1 = Math.max(z1, c.z); }));
    const pd = 1.5, f = v => v.toFixed(2);
    let s = `<svg viewBox="${f(x0 - pd)} ${f(z0 - pd)} ${f(x1 - x0 + 2 * pd)} ${f(z1 - z0 + 2 * pd)}" role="img" aria-label="Plan des sept salles">`;
    Gal.rooms.forEach(r => { s += `<polygon class="rm" data-room="${r.i}" points="${r.corners.map(c => f(c.x) + ',' + f(c.z)).join(' ')}"/>`; });
    Gal.rooms.forEach(r => { if (!r.exit) return; const a = r.toWorld(r.exit * ROOM_W / 2, 0, -r.Dx - DOOR_W / 2), b = r.toWorld(r.exit * ROOM_W / 2, 0, -r.Dx + DOOR_W / 2), a2 = r.toWorld(r.exit * (ROOM_W / 2 + WALL_T), 0, -r.Dx - DOOR_W / 2), b2 = r.toWorld(r.exit * (ROOM_W / 2 + WALL_T), 0, -r.Dx + DOOR_W / 2);
      s += `<line class="dr" x1="${f(a.x)}" y1="${f(a.z)}" x2="${f(b.x)}" y2="${f(b.z)}"/><line class="dr" x1="${f(a2.x)}" y1="${f(a2.z)}" x2="${f(b2.x)}" y2="${f(b2.z)}"/>`; });
    let d = ''; for (let i = 0; i <= Gal.N; i += 20) { const q = Gal.pts[Math.min(i, Gal.N)]; d += (i ? 'L' : 'M') + f(q.x) + ' ' + f(q.z); }
    s += `<path class="pt" d="${d}"/>`;
    Gal.rooms.forEach(r => { const c = r.toWorld(-r.artSide * 1.6, 0, -r.len / 2); s += `<text class="rn" x="${f(c.x)}" y="${f(c.z)}" style="font-size:2.3px">${r.sec.num}</text>`; });
    s += `<circle class="me-r" r="1.1"/><circle class="me" r=".75"/></svg>`;
    $('.plan-map').innerHTML = s;
    $('.plan-list').innerHTML = Gal.rooms.map(r => `<li><button data-room="${r.i}"><i>${r.sec.num}</i><b>${r.sec.title}</b><span>${r.sec.screen ? '4 œuvres + film' : r.sec.items.length + (r.sec.items.length > 1 ? ' œuvres' : ' œuvre')}</span></button></li>`).join('');
    $('.plan-mail').textContent = CONFIG.email;
    $('.plan').addEventListener('click', e => { const b = e.target.closest('[data-room]'); if (!b) return; const r = Gal.rooms[+b.dataset.room]; this.plan(false); if (G.mode === 'walk') teleport(r.i === 0 ? Gal.S0 : r.s0 + 1.4, () => this.card(r.sec)); });
  },
  plan(open) {
    if (open === !!this.planOpen || (open && (G.mode !== 'walk' || G.busy))) return; this.planOpen = open;
    $('[data-plan]').setAttribute('aria-expanded', open ? 'true' : 'false'); $('.plan').setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) {
      lenis && lenis.stop(); pathAt(G.phase === 'gallery' ? G.s : G.phase === 'outro' ? Gal.S1 : Gal.S0, _P);
      $$('.plan-map .me,.plan-map .me-r').forEach(c => { c.setAttribute('cx', _P.x.toFixed(2)); c.setAttribute('cy', _P.z.toFixed(2)); });
      gsap.to('.plan', { autoAlpha: 1, duration: .45, overwrite: true });
      gsap.fromTo('.plan-list li', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .045, delay: .08 });
      gsap.fromTo('.plan-map', { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: 1, ease: 'power3.out', delay: .1 });
    } else { gsap.to('.plan', { autoAlpha: 0, duration: .35, overwrite: true }); if (G.mode === 'walk') lenis && lenis.start(); }
  },
};
