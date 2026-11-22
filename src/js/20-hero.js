/* =====================================================================
   ACCUEIL — photo, nom derrière elle, plongée dans la pupille
   (une seule passe plein écran qui compose aussi la vue de la galerie)
   ===================================================================== */
const Hero = {
  // zt : zoom (0..1, exponentiel) · c : recentrage sur l’œil · lz/win : état « chargement »
  H: { zt: 0, c: 0, blur: 0, dim: 0, dil: 0, pa: 0, text: 0, lz: 1, win: 1, scrim: 1, par: 1 },
  L: null, ready: false, winRect: null, textCv: mkCanvas(4, 4),
};

const HERO_FRAG = /* glsl */`
uniform sampler2D tPhoto, tFace, tMatte, tText, tScene;
uniform vec2 uRes, uView, uPhoto, uAnchor, uC, uC0, uMouse;
uniform vec4 uFace, uWin;
uniform float uDpr, uSZ, uTextZ, uLodP, uLodF, uTap, uPortalR, uPortalA, uText, uWinOn, uScrim, uDim, uHas;
uniform vec3 uPaper, uTint;

vec3 photoAt(vec2 pp) {
  vec2 uv = clamp(pp / uPhoto, 0.001, 0.999);
  vec3 c = textureLod(tPhoto, vec2(uv.x, 1.0 - uv.y), uLodP).rgb;
  vec2 f = (pp - uFace.xy) / (uFace.zw - uFace.xy);
  float m = smoothstep(0.0, 0.1, f.x) * smoothstep(1.0, 0.9, f.x) * smoothstep(0.0, 0.1, f.y) * smoothstep(1.0, 0.9, f.y);
  if (m > 0.0) c = mix(c, textureLod(tFace, vec2(f.x, 1.0 - f.y), uLodF).rgb, m);
  return c;
}
void main() {
  vec2 sp = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;      // px CSS, origine en haut à gauche
  vec2 par = uMouse * vec2(7.0, 4.5);
  vec2 pp = uAnchor + (sp - uC + par) / uSZ;                            // px de la photo
  vec3 col = photoAt(pp);
  if (uTap > 0.01) {
    vec3 acc = col;
    for (int i = 0; i < 8; i++) { float a = float(i) * 0.7853982 + 0.4; acc += photoAt(pp + vec2(cos(a), sin(a)) * uTap); }
    col = acc / 9.0;
  }
  // détourage du sujet : le nom passe derrière elle
  vec2 muv = pp / uPhoto;
  float matte = texture2D(tMatte, vec2(clamp(muv.x, 0.0, 1.0), 1.0 - clamp(muv.y, 0.0, 1.0))).r;
  matte *= step(0.0, muv.x) * step(muv.x, 1.0) * step(0.0, muv.y);
  vec2 tuv = (uC0 + (sp - uC - par * 1.6) / uTextZ) / uView;
  float rev = clamp(uText * 1.7 - tuv.x * 0.7, 0.0, 1.0); rev = rev * rev * (3.0 - 2.0 * rev);
  tuv.y += (1.0 - rev) * 0.05;
  float ta = 0.0;
  if (tuv.x > 0.0 && tuv.x < 1.0 && tuv.y > 0.0 && tuv.y < 1.0) ta = texture2D(tText, vec2(tuv.x, 1.0 - tuv.y)).r * rev;
  col = mix(col * mix(vec3(1.0), uTint, ta), col, matte);
  // fondu bas (portrait) + assombrissement pendant la plongée
  col = mix(col, uPaper, uScrim * smoothstep(0.64, 0.86, sp.y / uView.y));
  col *= 1.0 - uDim * smoothstep(0.2, 1.0, length((sp - uC) / uView.y));
  // la pupille s’ouvre sur la galerie
  if (uPortalA > 0.001) {
    vec2 d = sp - uC; float dist = length(d); float R = uPortalR;
    float edge = max(2.0, R * 0.05);
    float inside = smoothstep(R, R - edge, dist);
    float rim = smoothstep(0.5, 1.0, dist / max(R, 1.0));
    vec2 suv = gl_FragCoord.xy / uRes - vec2(d.x, -d.y) / uView * rim * 0.05;
    vec3 sc = texture2D(tScene, clamp(suv, 0.0, 1.0)).rgb;
    sc *= 1.0 - 0.6 * smoothstep(R - edge * 6.0, R, dist);
    float ang = atan(d.y, d.x);
    float fib = 0.5 + 0.5 * sin(ang * 90.0 + sin(ang * 13.0) * 4.0);
    fib = mix(fib, 0.5 + 0.5 * sin(ang * 37.0 + 1.7), 0.4);
    float band = smoothstep(R * 1.65, R, dist) * (1.0 - inside);
    vec3 irisCol = mix(vec3(0.012, 0.01, 0.012), vec3(0.17, 0.155, 0.15), fib * smoothstep(R, R * 1.4, dist));
    col = mix(col, irisCol, band * 0.72 * uPortalA);
    col = mix(col, sc, inside * uPortalA);
  }
  if (uWinOn > 0.5) {
    float inw = step(uWin.x, sp.x) * step(sp.x, uWin.z) * step(uWin.y, sp.y) * step(sp.y, uWin.w);
    col = mix(uPaper, col, inw);
  }
  col = mix(uPaper, col, uHas);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

Hero.init = function () {
  const photoTex = img => { const t = new THREE.Texture(img); t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = MAXA; t.needsUpdate = true; return t; };
  const blank = () => { const t = new THREE.DataTexture(new Uint8Array([243, 240, 236, 255]), 1, 1); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t; };
  const matte = IMG.matte ? new THREE.Texture(IMG.matte) : blank(); matte.colorSpace = THREE.NoColorSpace; matte.needsUpdate = true;
  Hero.textTex = new THREE.CanvasTexture(Hero.textCv); Hero.textTex.colorSpace = THREE.NoColorSpace; Hero.textTex.generateMipmaps = false; Hero.textTex.minFilter = THREE.LinearFilter;
  Hero.mat = new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: {
      tPhoto: { value: IMG.hero ? photoTex(IMG.hero) : blank() }, tFace: { value: IMG.face ? photoTex(IMG.face) : blank() }, tMatte: { value: matte }, tText: { value: Hero.textTex }, tScene: { value: null },
      uRes: { value: new THREE.Vector2() }, uView: { value: new THREE.Vector2() }, uPhoto: { value: new THREE.Vector2(PHOTO.w, PHOTO.h) },
      uAnchor: { value: new THREE.Vector2() }, uC: { value: new THREE.Vector2() }, uC0: { value: new THREE.Vector2() }, uMouse: { value: new THREE.Vector2() },
      uFace: { value: new THREE.Vector4(PHOTO.face.x0, PHOTO.face.y0, PHOTO.face.x1, PHOTO.face.y1) }, uWin: { value: new THREE.Vector4() },
      uDpr: { value: 1 }, uSZ: { value: 1 }, uTextZ: { value: 1 }, uLodP: { value: 0 }, uLodF: { value: 0 }, uTap: { value: 0 },
      uPortalR: { value: 0 }, uPortalA: { value: 0 }, uText: { value: 0 }, uWinOn: { value: 1 }, uScrim: { value: 0 }, uDim: { value: 0 }, uHas: { value: IMG.hero ? 1 : 0 },
      uPaper: { value: new THREE.Color(P.paper) }, uTint: { value: new THREE.Color(P.wine) },
    },
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: HERO_FRAG,
  });
  if (!IMG.face) Hero.mat.uniforms.uFace.value.set(-10, -10, -9, -9);
  Hero.scene = new THREE.Scene();
  Hero.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), Hero.mat); quad.frustumCulled = false; Hero.scene.add(quad);
  Hero.ready = true;
};

/* cadrage de la photo et du nom selon l’écran */
Hero.layout = function () {
  const L = {}, land = V.asp >= 1.15, hd = PHOTO.head;
  if (land) { L.scale = V.h / 1560; L.ox = V.w * .47 - hd.cx * L.scale; }
  else { L.scale = V.h / 1900; L.ox = V.w / 2 - 990 * L.scale; }
  L.oy = V.h * 1.015 - PHOTO.h * L.scale;
  L.land = land;
  L.C0 = { x: L.ox + PHOTO.eye.x * L.scale, y: L.oy + PHOTO.eye.y * L.scale };
  L.Zmax = (.34 * Math.min(V.w, V.h)) / (PHOTO.iris * L.scale);
  L.DIL = (Math.hypot(V.w, V.h) * .54) / (PHOTO.pupil * L.scale * L.Zmax);
  const wr = Hero.winRect || { x0: V.w * .4, y0: V.h * .44, x1: V.w * .6, y1: V.h * .56 };
  L.win = wr; L.wc = { x: (wr.x0 + wr.x1) / 2, y: (wr.y0 + wr.y1) / 2 };
  L.ZL = Math.max(1, (wr.x1 - wr.x0) / (440 * L.scale));
  /* place libre autour d’elle pour les textes du bas */
  const padPx = parseFloat(getComputedStyle($('.bar')).paddingLeft) || 24, freeL = L.ox + 585 * L.scale - padPx - 16, freeR = V.w - padPx - (L.ox + 1580 * L.scale) - 16;
  const root = document.documentElement.style; root.setProperty('--pitch', Math.max(120, freeL) + 'px'); root.setProperty('--bill', Math.max(150, freeR) + 'px');
  $('.hero-pitch').classList.toggle('is-tight', land && freeL < 200); $('.hero-bill').classList.toggle('is-tight', land && freeR < 330);
  Hero.L = L;
  Hero.drawMast();
};

Hero.drawMast = function () {
  const L = Hero.L, td = Math.min(V.dpr, 2), cv = Hero.textCv, hd = PHOTO.head;
  cv.width = Math.round(V.w * td); cv.height = Math.round(V.h * td);
  const c = cv.getContext('2d'); c.setTransform(td, 0, 0, td, 0, 0);
  c.fillStyle = '#000'; c.fillRect(0, 0, V.w, V.h); c.fillStyle = '#fff'; c.textBaseline = 'alphabetic';
  const font = px => `600 ${px}px Fraunces, Georgia, serif`;
  c.font = font(100); const wA = c.measureText('LYS').width, wB = c.measureText('SAMA').width;
  const bar = ($('.bar') || {}).offsetHeight || 64, headTop = L.oy + hd.top * L.scale;
  if (L.land) {
    const headL = L.ox + hd.l * L.scale, headR = L.ox + hd.r * L.scale, m = V.w * .03, ov = V.w * .012;
    const fs = Math.min(V.h * .27, (V.w - m - (headR - ov)) * 100 / wB, ((headL - V.w * .004) - m) * 100 / wA), cap = fs * .7;
    const y = Math.max(headTop + cap * .66, bar + 6 + cap);
    c.font = font(fs); c.textAlign = 'right'; c.fillText('LYS', headL - V.w * .004, y); c.textAlign = 'left'; c.fillText('SAMA', headR - ov, y);
  } else {
    const fs = Math.min(V.w * .9 * 100 / wB, V.h * .165), cap = fs * .7, bw = wB * fs / 100, x0 = (V.w - bw) / 2;
    const y2 = Math.max(headTop + cap * .12, bar + 34 + cap + fs * .84), y1 = y2 - fs * .84;
    c.font = font(fs); c.textAlign = 'left'; c.fillText('LYS', x0, y1); c.fillText('SAMA', x0, y2);
  }
  if (Hero.textTex) { Hero.textTex.dispose(); Hero.textTex.needsUpdate = true; }
};

Hero.update = function () {
  if (!Hero.ready) return;
  const u = Hero.mat.uniforms, H = Hero.H, L = Hero.L;
  const Zp = Math.exp(H.zt * Math.log(L.Zmax)), Z = lerp(1, L.ZL, H.lz) * Zp * (1 + (REDUCED ? 0 : .006 * (1 + Math.sin(G.time * .5))) * H.par * (1 - H.lz));
  const ax = lerp(PHOTO.eye.x, PHOTO.mid.x, H.lz), ay = lerp(PHOTO.eye.y, PHOTO.mid.y, H.lz);
  const rx = L.ox + ax * L.scale, ry = L.oy + ay * L.scale;
  const Cx = lerp(lerp(rx, V.w / 2, H.c), L.wc.x, H.lz), Cy = lerp(lerp(ry, V.h / 2, H.c), L.wc.y, H.lz);
  u.uRes.value.set(V.w * V.dpr, V.h * V.dpr); u.uView.value.set(V.w, V.h); u.uDpr.value = V.dpr;
  u.uAnchor.value.set(ax, ay); u.uC.value.set(Cx, Cy); u.uC0.value.set(L.C0.x, L.C0.y);
  u.uSZ.value = L.scale * Z; u.uTextZ.value = Math.pow(Zp, .8);
  const tpp = 1 / (L.scale * Z * V.dpr), b = 1 + H.blur * 16 * V.dpr;
  u.uLodP.value = Math.max(0, Math.log2(b * tpp)); u.uLodF.value = Math.max(0, Math.log2(4 * b * tpp));
  u.uTap.value = H.blur * 9 / (L.scale * Z);
  u.uPortalR.value = PHOTO.pupil * L.scale * Zp * lerp(1, L.DIL, H.dil); u.uPortalA.value = H.pa;
  u.uText.value = H.text; u.uDim.value = H.dim; u.uScrim.value = L.land ? 0 : H.scrim * .97;
  u.uMouse.value.set(G.mx * H.par, G.my * H.par);
  if (H.win > .001) { const w = L.win, t = H.win; u.uWin.value.set(lerp(0, w.x0, t), lerp(0, w.y0, t), lerp(V.w, w.x1, t), lerp(V.h, w.y1, t)); u.uWinOn.value = 1; } else u.uWinOn.value = 0;
};
