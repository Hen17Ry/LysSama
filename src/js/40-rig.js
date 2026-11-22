/* =====================================================================
   CAMÉRA, LUMIÈRES, DÉFILEMENT, RENDU
   ===================================================================== */
const Rig = { x: 0, y: EYE_Y, z: 0, yaw: 0, pitch: 0, fov: 56, ox: 0, oy: 0 };
const Focus = { item: null };
const Scr = { yIntro: 0, yGal: 0, yOutro: 0, total: 0 };
const M_PER_VH = 5.4;                      // mètres parcourus par hauteur d’écran défilée
const _P = new THREE.Vector3(), _Q = new THREE.Vector3();
let lenis = null, portalTl = null;
G.enter = 0; G.bob = 0; G.walk = 0; G.vel = 0; G.ptr = new THREE.Vector2(9, 9); G.ptrDirty = false; G.hover = null;

function roomAtS(s) { for (let i = Gal.rooms.length - 1; i >= 0; i--) if (s >= Gal.rooms[i].s0 - .001) return Gal.rooms[i]; return Gal.rooms[0]; }

/* pose de marche : on regarde devant soi, la tête à peine tournée vers le mur des œuvres */
function walkPose(s, o) {
  pathAt(s, _P); pathAt(s + 4.2, _Q);
  let yaw = Math.atan2(-(_Q.x - _P.x), -(_Q.z - _P.z));
  const room = roomAtS(s);
  if (room.side.length) yaw += -room.artSide * V.bias * sstep(room.sB0, room.sB0 + 4, s) * (1 - sstep(room.sB1 - 3.5, room.sB1, s));
  o.x = _P.x; o.y = EYE_Y; o.z = _P.z; o.yaw = yaw; o.pitch = 0; o.fov = V.fov; o.ox = 0; o.oy = 0;
  return o;
}
function applyRig() {
  const cam = Gal.camera, par = G.par;
  cam.position.set(Rig.x, Rig.y + G.bob, Rig.z);
  cam.rotation.set(Rig.pitch - G.my * rad(4) * par, Rig.yaw - G.mx * rad(13) * par, 0);
  const fov = Rig.fov * lerp(.5, 1, G.enter);
  if (Math.abs(cam.fov - fov) > .005 || Math.abs(cam.aspect - V.asp) > 1e-5) { cam.fov = fov; cam.aspect = V.asp; cam.updateProjectionMatrix(); }
  if (Math.abs(Rig.ox) > 1e-4 || Math.abs(Rig.oy) > 1e-4) cam.setViewOffset(V.w, V.h, Rig.ox * V.w, Rig.oy * V.h, V.w, V.h);
  else if (cam.view && cam.view.enabled) cam.clearViewOffset();
  const fog = Gal.scene.fog; fog.near = lerp(.4, 9, G.enter); fog.far = lerp(7, 62, G.enter);
}

/* les lumières s’allument quand on arrive dans une salle */
function wakeRoom(room, instant) {
  if (room.awake) return; room.awake = true;
  if (instant || REDUCED) { room.amb = 1; room.items.forEach(it => { it.lit = 1; }); return; }
  gsap.to(room, { amb: 1, duration: 1.7, ease: 'power2.out' });
  room.items.forEach((it, k) => gsap.to(it, { lit: 1, duration: 1.1, delay: .5 + k * .34, ease: 'power2.out', onStart: () => Snd.tick() }));
}
function applyLights() {
  const dim = G.dim; let amb = 1;
  for (const room of Gal.rooms) {
    if (!room.group.visible) continue;
    const a = room.amb * dim; if (room.i === G.room) amb = a;
    room.wallMat.color.setScalar(a); room.ceilMat.color.setScalar(lerp(.42, 1, room.amb) * lerp(.4, 1, dim));
    for (const m of room.dimMats) m.color.setScalar(a);
    for (const it of room.items) {
      const fw = it.fw || 0, k = lerp(dim, 1, fw), lv = lerp(.3, 1, it.lit) * k;
      it.artMat.uniforms.uLit.value = lv; it.artMat.uniforms.uSheen.value = lerp(1, .3, fw);
      it.frameMat.color.setScalar(lv); it.labMat.color.setScalar(lv);
      it.poolMat.color.setScalar(it.lit * lerp(.82 * dim, 1.05, fw) + it.hov * .22);
    }
  }
  Gal.floorMat.uniforms.uDim.value = amb;
}
function setVisible(cur) { Gal.rooms.forEach(r => { r.group.visible = Math.abs(r.i - cur) <= 1; }); }

/* ---------- défilement ---------- */
function measureScroll() {
  Scr.yIntro = V.h * 2.6; Scr.yGal = (Gal.S1 - Gal.S0) / M_PER_VH * V.h; Scr.yOutro = V.h * 2.0; Scr.total = Scr.yIntro + Scr.yGal + Scr.yOutro;
  $('#track').style.height = Math.round(Scr.total + V.h) + 'px';
}
const yForS = s => Scr.yIntro + (clamp(s, Gal.S0, Gal.S1) - Gal.S0) / (Gal.S1 - Gal.S0) * Scr.yGal;
const curY = () => lenis ? lenis.scroll : window.scrollY;
function scrollToY(y, opts = {}) {
  if (lenis) lenis.scrollTo(y, { immediate: !opts.duration, force: true, duration: opts.duration, easing: opts.easing, lock: !!opts.duration });
  else window.scrollTo(0, y);
  if (!opts.duration) onScroll(y);
}
function onScroll(y) {
  if (G.mode === 'loading' || !G.built) return;
  if (y <= Scr.yIntro) { G.phase = 'intro'; setPortal(y / Scr.yIntro); G.sT = Gal.S0; }
  else if (y <= Scr.yIntro + Scr.yGal) { G.phase = 'gallery'; setPortal(1); G.sT = Gal.S0 + (y - Scr.yIntro) / Scr.yGal * (Gal.S1 - Gal.S0); }
  else { G.phase = 'outro'; const q = clamp((y - Scr.yIntro - Scr.yGal) / Scr.yOutro); setPortal(1 - q); G.sT = Gal.S1; }
  UI.sync();
}
/* une seule ligne de temps pour entrer dans l’œil… et pour en ressortir à la fin */
function buildPortalTl() {
  const H = Hero.H, o = { immediateRender: false };
  if (portalTl) portalTl.kill();
  portalTl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
    .fromTo('.hero-pitch,.hero-bill', { opacity: 1, y: 0 }, { opacity: 0, y: -22, duration: .07, ...o }, 0)
    .fromTo('.hero-invite', { opacity: 1, y: 0 }, { opacity: 0, y: 18, duration: .06, ...o }, 0)
    .fromTo(H, { scrim: 1 }, { scrim: 0, duration: .12, ...o }, 0)
    .fromTo(H, { zt: 0 }, { zt: 1, duration: .84, ease: 'power2.inOut', ...o }, .03)
    .fromTo(H, { c: 0 }, { c: 1, duration: .5, ease: 'power2.inOut', ...o }, .03)
    .fromTo(H, { text: 1 }, { text: 0, duration: .2, ease: 'power1.in', ...o }, .12)
    .fromTo('.bar', { opacity: 1 }, { opacity: 0, duration: .06, ...o }, .14)
    .fromTo('.lid', { height: '0vh' }, { height: '9vh', duration: .14, ease: 'power2.inOut', ...o }, .2)
    .fromTo(H, { dim: 0 }, { dim: .6, duration: .42, ...o }, .38)
    .fromTo(H, { blur: 0 }, { blur: 1, duration: .42, ease: 'power1.in', ...o }, .44)
    .fromTo(H, { pa: 0 }, { pa: 1, duration: .06, ...o }, .5)
    .fromTo(H, { dil: 0 }, { dil: 1, duration: .37, ease: 'power2.in', ...o }, .54)
    .fromTo(G, { enter: 0 }, { enter: 1, duration: .42, ease: 'power2.out', ...o }, .56)
    .fromTo('.lid', { height: '9vh' }, { height: '0vh', duration: .1, ease: 'power2.inOut', ...o }, .84)
    .fromTo('.bar', { opacity: 0 }, { opacity: 1, duration: .06, ...o }, .93)
    .to({}, { duration: .01 }, .99);
  portalTl.progress(G.portal || 0);
}
function setPortal(p) {
  if (p === G.portal) return;
  const was = G.portal; G.portal = p; portalTl.progress(p);
  if (was < .97 && p >= .97 && G.phase !== 'outro' && G.mode === 'walk') UI.card(Gal.rooms[Math.max(0, G.room)].sec);
  else if (p < .9 && was >= .9) UI.card(false);
  $('.hero').style.visibility = p < .2 ? 'visible' : 'hidden';
}

/* clignement : on ferme les paupières, on change de salle, on rouvre */
function blink(mid) {
  G.busy = true; Snd.whoosh();
  return gsap.timeline()
    .to('.lid', { height: '50.5%', duration: REDUCED ? .2 : .3, ease: 'power3.in' })
    .add(() => { mid(); })
    .to('.lid', { height: '0%', duration: REDUCED ? .25 : .5, ease: 'power3.out' }, '+=.1')
    .add(() => { G.busy = false; });
}
function teleport(s, after) {
  if (G.busy) return;
  return blink(() => { scrollToY(yForS(s)); G.s = G.sT = clamp(s, Gal.S0, Gal.S1); walkPose(G.s, Rig); const r = roomAtS(G.s); wakeRoom(r, true); after && after(); });
}

/* ---------- rendu ---------- */
function render() {
  const R = Gal.renderer; if (!R) return;
  if (G.built && G.portal >= .999) { R.setRenderTarget(null); R.render(Gal.scene, Gal.camera); return; }
  if (G.built && Hero.H.pa > .001) { R.setRenderTarget(Gal.rt); R.render(Gal.scene, Gal.camera); Hero.mat.uniforms.tScene.value = Gal.rt.texture; }
  R.setRenderTarget(null); R.render(Hero.scene, Hero.cam);
}
const raycaster = new THREE.Raycaster();
function pick(ndc) {
  raycaster.setFromCamera(ndc, Gal.camera);
  const h = raycaster.intersectObjects(Gal.hits.filter(m => m.userData.item.room.group.visible), false)[0];
  return h && h.distance < 16 ? h.object.userData.item : null;
}
let loopT = 0;
function frame(time, dt) {
  const dts = Math.min(.05, (dt || 16) / 1000); G.time = time;
  if (lenis) lenis.raf(time * 1000);
  const f = 1 - Math.exp(-dts * 5);
  G.mx += (G.tmx - G.mx) * f; G.my += (G.tmy - G.my) * f;
  if (G.built) {
    if (G.mode === 'walk') {
      const prev = G.s; G.s += (G.sT - G.s) * (1 - Math.exp(-dts * 4.2)); G.vel = (G.s - prev) / dts;
      walkPose(G.s, Rig);
      const step = Math.abs(G.s - prev); G.walk += step; if (step > 1e-4) Snd.walk(G.walk);
      G.bob = REDUCED ? 0 : Math.sin(G.walk * 4.3) * .011 * clamp(Math.abs(G.vel) / 1.4);
      G.par += ((REDUCED ? 0 : 1) - G.par) * f;
    } else { G.par += ((REDUCED ? 0 : .22) - G.par) * f; G.bob *= .9; }
    const cur = G.mode === 'focus' && Focus.item ? Focus.item.room : roomAtS(G.s);
    if (cur.i !== G.room) { G.room = cur.i; setVisible(cur.i); UI.room(cur); }
    if (G.portal > .68) { wakeRoom(cur); const nx = Gal.rooms[cur.i + 1]; if (nx && G.s > nx.s0 - 6) wakeRoom(nx); }
    applyLights(); applyRig();
    if (Math.abs(G.room - 3) <= 1) drawFilm(time);
    Gal.dust.position.y = Math.sin(time * .2) * .05;
    if (G.mode === 'walk' && G.phase === 'gallery' && !TOUCH && G.ptrDirty && !G.busy) { G.ptrDirty = false; UI.hover(G.overUI ? null : pick(G.ptr)); }
    UI.tick(dts);
    /* fin de visite : une fois ressorti de l’œil, on se retrouve à l’accueil, prêt à recommencer */
    if (G.phase === 'outro' && G.portal <= .004 && G.mode === 'walk') { loopT += dts; if (loopT > .25 && (!lenis || Math.abs(lenis.velocity) < .5)) { loopT = 0; scrollToY(0); G.s = G.sT = Gal.S0; } } else loopT = 0;
  }
  Hero.update(); render();
}

function onResize() {
  const pw = V.w, ph = V.h, pl = V.land; measure();
  if (G.mode !== 'loading' && Math.abs(V.w - pw) < 1 && Math.abs(V.h - ph) < 1 && pl === V.land) return;
  if (Gal.renderer) { Gal.renderer.setPixelRatio(V.dpr); Gal.renderer.setSize(V.w, V.h, false); Gal.rt && Gal.rt.setSize(Math.round(V.w * V.dpr), Math.round(V.h * V.dpr)); }
  if (G.mode === 'loading') { Hero.winRect = winRect(); Hero.layout(); return; }
  Hero.layout();
  if (G.built) {
    const s = G.sT, ph0 = G.phase, y = curY(), q = ph0 === 'intro' ? y / Math.max(1, Scr.yIntro) : ph0 === 'outro' ? (y - Scr.yIntro - Scr.yGal) / Math.max(1, Scr.yOutro) : 0;
    measureScroll();
    scrollToY(ph0 === 'intro' ? q * Scr.yIntro : ph0 === 'outro' ? Scr.yIntro + Scr.yGal + q * Scr.yOutro : yForS(s));
    UI.resize();
  }
}
function winRect() { const r = $('.ld-win').getBoundingClientRect(); return { x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }; }
