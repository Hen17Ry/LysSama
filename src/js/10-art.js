/* =====================================================================
   Images, textures et affiches (les « œuvres » provisoires)
   ===================================================================== */
const IMG = {};
function loadImg(key, src) {
  return new Promise(res => { const im = new Image(); im.decoding = 'async'; im.onload = () => { IMG[key] = im; res(im); }; im.onerror = () => { console.warn('image manquante', src); res(null); }; im.src = src; });
}

let MAXA = 4;
function mkTex(cv, o = {}) {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = o.data ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.anisotropy = o.aniso ?? MAXA;
  if (o.repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function mkCanvas(w, h) { const cv = document.createElement('canvas'); cv.width = Math.round(w); cv.height = Math.round(h); return cv; }
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const fSerif = (px, w = 600, it = false) => `${it ? 'italic ' : ''}${w} ${px}px Fraunces, Georgia, serif`;
const fSans = (px, w = 500) => `${w} ${px}px "Hanken Grotesk", Arial, sans-serif`;
const fCaps = (px, w = 600) => `${w} ${px}px Antonio, "Arial Narrow", sans-serif`;
function txt(c, s, x, y, font, col, o = {}) {
  c.font = font; c.fillStyle = col; c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic';
  if ('letterSpacing' in c) c.letterSpacing = (o.ls || 0) + 'px';
  c.fillText(s, x, y);
  if ('letterSpacing' in c) c.letterSpacing = '0px';
}
function wrapText(c, s, x, y, maxW, lh) {
  let line = '';
  for (const w of s.split(' ')) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { c.fillText(line, x, y); y += lh; line = w; } else line = t; }
  if (line) c.fillText(line, x, y);
  return y;
}
const fillAll = (c, w, h, col) => { c.fillStyle = col; c.fillRect(0, 0, w, h); };
const circ = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); };
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return { r: n >> 16, g: n >> 8 & 255, b: n & 255 }; }
function mixHex(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return `rgb(${lerp(A.r, B.r, t) | 0},${lerp(A.g, B.g, t) | 0},${lerp(A.b, B.b, t) | 0})`; }

function cover(c, img, dx, dy, dw, dh, fx = .5, fy = .5, zoom = 1) {
  if (!img) { c.fillStyle = '#b9b2ac'; c.fillRect(dx, dy, dw, dh); return; }
  const ir = img.width / img.height, dr = dw / dh; let sw, sh;
  if (ir > dr) { sh = img.height / zoom; sw = sh * dr; } else { sw = img.width / zoom; sh = sw / dr; }
  const sx = clamp((img.width - sw) * fx, 0, img.width - sw), sy = clamp((img.height - sh) * fy, 0, img.height - sh);
  c.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}
/* deux tons : les noirs deviennent `dark`, les blancs `light` */
function duo(img, w, h, dark, light, fx = .5, fy = .5, zoom = 1) {
  const cv = mkCanvas(w, h), c = cv.getContext('2d');
  cover(c, img, 0, 0, cv.width, cv.height, fx, fy, zoom);
  c.globalCompositeOperation = 'saturation'; c.fillStyle = '#808080'; c.fillRect(0, 0, cv.width, cv.height);
  const D = hexRgb(dark), L = hexRgb(light);
  c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgb(${Math.max(0, L.r - D.r)},${Math.max(0, L.g - D.g)},${Math.max(0, L.b - D.b)})`; c.fillRect(0, 0, cv.width, cv.height);
  c.globalCompositeOperation = 'lighter'; c.fillStyle = dark; c.fillRect(0, 0, cv.width, cv.height);
  c.globalCompositeOperation = 'source-over';
  return cv;
}
const NOISE = (() => { const n = mkCanvas(128, 128), x = n.getContext('2d'), d = x.createImageData(128, 128); const R = rng(7); for (let i = 0; i < d.data.length; i += 4) { const v = R() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return n; })();
function paperGrain(c, w, h, a = .07) { c.save(); c.globalAlpha = a; c.globalCompositeOperation = 'overlay'; c.fillStyle = c.createPattern(NOISE, 'repeat'); c.fillRect(0, 0, w, h); c.restore(); }
function credit(c, w, h, k, n, light) {
  const col = light ? 'rgba(243,240,236,.72)' : 'rgba(22,18,20,.62)';
  txt(c, 'N° ' + pad2(n), w - 36 * k, 50 * k, fCaps(19 * k, 600), col, { align: 'right', ls: 3 * k });
  txt(c, 'LYS SAMA', w - 36 * k, h - 32 * k, fCaps(17 * k, 600), col, { align: 'right', ls: 4 * k });
}
function scribble(c, x0, y, len, k, R, col, lw) {
  c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); let x = x0; c.moveTo(x, y);
  while (x < x0 + len) { const st = (7 + R() * 9) * k, amp = (3 + R() * 9) * k; c.quadraticCurveTo(x + st * .5, y - amp, x + st, y + (R() - .5) * 3 * k); x += st; if (R() < .07) { x += 12 * k; c.moveTo(x, y); } }
  c.stroke();
}

const ART = {
  ikigai(c, w, h, k, n) {
    fillAll(c, w, h, P.cream);
    const cx = w / 2, cy = h * .45, r = w * .235, o = w * .145;
    c.globalCompositeOperation = 'multiply';
    [[0, -1, 'rgba(196,138,134,.85)'], [-1, 0, 'rgba(110,15,30,.5)'], [1, 0, 'rgba(22,18,20,.3)'], [0, 1, 'rgba(138,28,45,.62)']].forEach(([dx, dy, col]) => { c.fillStyle = col; circ(c, cx + dx * o, cy + dy * o, r); c.fill(); });
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = P.paper; circ(c, cx, cy, 11 * k); c.fill();
    c.strokeStyle = P.paper; c.lineWidth = 2 * k; circ(c, cx, cy, 25 * k); c.stroke();
    [[0, -1, ['J’AIME']], [-1, 0, ['JE SAIS', 'FAIRE']], [1, 0, ['LE MONDE', 'EN A BESOIN']], [0, 1, ['ME FAIT', 'VIVRE']]].forEach(([dx, dy, lines]) => lines.forEach((t, i) =>
      txt(c, t, cx + dx * (o + r * .48), cy + dy * (o + r * .5) + (i - (lines.length - 1) / 2) * 26 * k + 8 * k, fCaps(21 * k, 600), dx > 0 || dy > 0 ? P.paper : P.ink, { align: 'center', ls: 3 * k })));
    txt(c, 'Ikigai', 44 * k, h - 50 * k, fSerif(92 * k, 600, true), P.wine);
    credit(c, w, h, k, n);
  },
  vision(c, w, h, k, n) {
    c.drawImage(duo(IMG.eyes, w, h, '#1d0509', '#F4ECE6', .5, .5, 1), 0, 0);
    const bar = h * .1; c.fillStyle = '#100b0c'; c.fillRect(0, 0, w, bar); c.fillRect(0, h - bar, w, bar);
    txt(c, 'LA VISION', 40 * k, bar * .66, fCaps(26 * k, 600), 'rgba(243,240,236,.9)', { ls: 7 * k });
    txt(c, 'Voir plus loin que le cadre.', 40 * k, h - bar * .34, fSerif(30 * k, 500, true), 'rgba(243,240,236,.92)');
    txt(c, 'N° ' + pad2(n), w - 40 * k, bar * .66, fCaps(22 * k, 600), 'rgba(243,240,236,.7)', { align: 'right', ls: 4 * k });
    txt(c, 'LYS SAMA', w - 40 * k, h - bar * .34, fCaps(20 * k, 600), 'rgba(243,240,236,.7)', { align: 'right', ls: 5 * k });
  },
  horizon(c, w, h, k, n) {
    fillAll(c, w, h, P.paper);
    const hy = h * .62, sx = w * .64, sr = h * .36;
    const g = c.createLinearGradient(0, hy - sr, 0, hy); g.addColorStop(0, P.wine2); g.addColorStop(1, P.wine);
    c.fillStyle = g; c.beginPath(); c.arc(sx, hy, sr, Math.PI, 0); c.fill();
    c.fillStyle = P.ink; c.fillRect(0, hy, w, 3 * k);
    for (let i = 1; i < 16; i++) { const y = hy + i * i * 1.25 * k + 8 * k; if (y > h - 10 * k) break; c.fillStyle = `rgba(22,18,20,${.62 - i * .035})`; c.fillRect(w * .05 + i * 8 * k, y, w * .9 - i * 16 * k, 1.8 * k); }
    c.fillStyle = 'rgba(110,15,30,.62)';
    for (let i = 0; i < 9; i++) { const ww = sr * 2 * (1 - i * .1); c.fillRect(sx - ww / 2 + (i % 2 ? 9 : -9) * k, hy + 12 * k + i * 14 * k, ww, 4.5 * k); }
    txt(c, 'Le Cap.', 54 * k, 168 * k, fSerif(128 * k, 600, true), P.ink);
    txt(c, 'L’OBJECTIF EST UN HORIZON', 58 * k, 226 * k, fCaps(24 * k, 600), P.ink, { ls: 5 * k });
    txt(c, 'PAS UNE LIGNE D’ARRIVÉE', 58 * k, 262 * k, fCaps(24 * k, 600), P.wine, { ls: 5 * k });
    credit(c, w, h, k, n);
  },
  debuts(c, w, h, k, n) {
    fillAll(c, w, h, '#191415');
    const src = [['portrait', .5, .15, 1.15], ['eyes', .5, .5, 1], ['hand', .5, .5, 1], ['lens', .5, .5, 1], ['portrait', .5, .0, 1.9], ['skirt', .3, .5, 1.2], ['figure', .5, .28, 1.5], ['pattern', .5, .5, 1.3], ['hand', .15, .5, 1.6], ['eyes', .82, .5, 1.9], ['lens', .5, .6, 1.6], ['portrait', .62, .42, 2.4]];
    const mx = 44 * k, top = 96 * k, sw = w - 2 * mx, gap = 14 * k, sh = (h - top - 150 * k - 3 * gap) / 4, hole = 9 * k;
    let i = 0;
    for (let r = 0; r < 4; r++) {
      const y = top + r * (sh + gap);
      c.fillStyle = '#0b0809'; c.fillRect(mx, y, sw, sh);
      c.fillStyle = '#3a3334';
      for (let x = mx + 10 * k; x < mx + sw - hole; x += 26 * k) { c.fillRect(x, y + 5 * k, hole, hole * .7); c.fillRect(x, y + sh - 5 * k - hole * .7, hole, hole * .7); }
      const fw = (sw - 4 * 10 * k) / 3, fh = sh - 2 * (hole * .7 + 12 * k), fy = y + hole * .7 + 12 * k;
      for (let q = 0; q < 3; q++, i++) {
        const fx = mx + 10 * k + q * (fw + 10 * k), s = src[i];
        c.drawImage(duo(IMG[s[0]], fw, fh, '#0d0a0a', '#EFE9E2', s[1], s[2], s[3]), fx, fy, fw, fh);
        txt(c, pad2(i + 1) + (i % 2 ? 'A' : ''), fx + 4 * k, y + sh - 5 * k - hole * .7 - 3 * k + 2 * k, fCaps(11 * k, 600), 'rgba(239,233,226,.75)', { ls: 1 * k });
        s.rect = [fx, fy, fw, fh];
      }
    }
    const R = rng(12);
    const mark = (rc, cross) => { const [x, y, ww, hh] = rc; c.strokeStyle = '#B3263D'; c.lineWidth = 6 * k; c.lineCap = 'round'; c.beginPath();
      if (cross) { c.moveTo(x + ww * .15, y + hh * .15); c.lineTo(x + ww * .85, y + hh * .85); c.moveTo(x + ww * .85, y + hh * .12); c.lineTo(x + ww * .15, y + hh * .88); }
      else for (let a = 0; a <= 6.9; a += .25) { const rr = 1 + (R() - .5) * .06 + a * .012; const px = x + ww / 2 + Math.cos(a - 1) * ww * .58 * rr, py = y + hh / 2 + Math.sin(a - 1) * hh * .62 * rr; a ? c.lineTo(px, py) : c.moveTo(px, py); }
      c.stroke(); };
    mark(src[4].rect, false); mark(src[8].rect, true);
    txt(c, 'PLANCHE-CONTACT', mx, 62 * k, fCaps(22 * k, 600), 'rgba(239,233,226,.85)', { ls: 6 * k });
    txt(c, 'Les débuts', mx, h - 62 * k, fSerif(72 * k, 600, true), '#EFE9E2');
    credit(c, w, h, k, n, true);
  },
  camera(c, w, h, k, n) {
    c.drawImage(duo(IMG.lens, w, h, '#0c090a', '#F1ECE6', .42, .45, 1.05), 0, 0);
    const m = 46 * k, L = 54 * k; c.strokeStyle = 'rgba(243,240,236,.92)'; c.lineWidth = 3 * k; c.beginPath();
    [[m, m, 1, 1], [w - m, m, -1, 1], [m, h * .76, 1, -1], [w - m, h * .76, -1, -1]].forEach(([x, y, sx, sy]) => { c.moveTo(x + sx * L, y); c.lineTo(x, y); c.lineTo(x, y + sy * L); });
    c.moveTo(w / 2 - 20 * k, h * .4); c.lineTo(w / 2 + 20 * k, h * .4); c.moveTo(w / 2, h * .4 - 20 * k); c.lineTo(w / 2, h * .4 + 20 * k); c.stroke();
    c.fillStyle = '#C62B43'; circ(c, m + 26 * k, m + 34 * k, 9 * k); c.fill();
    txt(c, 'REC', m + 46 * k, m + 42 * k, fCaps(24 * k, 600), 'rgba(243,240,236,.95)', { ls: 4 * k });
    txt(c, '00:02:14:08', w - m - 18 * k, m + 42 * k, fCaps(24 * k, 500), 'rgba(243,240,236,.95)', { align: 'right', ls: 3 * k });
    c.fillStyle = P.wine; c.fillRect(0, h * .8, w, h * .2);
    txt(c, 'CHAPITRE II', m, h * .8 + 46 * k, fCaps(20 * k, 600), 'rgba(243,240,236,.8)', { ls: 6 * k });
    txt(c, 'Derrière la caméra', m, h * .8 + 112 * k, fSerif(58 * k, 600), P.paper);
    credit(c, w, h, k, n, true);
  },
  stairs(c, w, h, k, n) {
    fillAll(c, w, h, P.cream);
    const N = 7, sx = w * .1, base = h * .88, stepW = (w * .8) / N, stepH = h * .078;
    for (let i = 0; i < N; i++) { c.fillStyle = mixHex(P.blush, P.wine, i / (N - 1)); c.fillRect(sx + i * stepW, base - (i + 1) * stepH, stepW + 1, (i + 1) * stepH); }
    c.fillStyle = P.ink; circ(c, sx + (N - .5) * stepW, base - (N + 1) * stepH + 4 * k, 26 * k); c.fill();
    txt(c, 'L’entrepreneuse', 46 * k, 128 * k, fSerif(78 * k, 600, true), P.ink);
    txt(c, 'MARCHE APRÈS MARCHE', 50 * k, 178 * k, fCaps(24 * k, 600), P.wine, { ls: 6 * k });
    credit(c, w, h, k, n);
  },
  lab(c, w, h, k, n) {
    fillAll(c, w, h, P.paper);
    const cx = w / 2, top = h * .3, nw = w * .11, bw = w * .62, sh = h * .14, bottom = h * .76;
    const flask = () => { c.beginPath(); c.moveTo(cx - nw / 2, top); c.lineTo(cx - nw / 2, top + sh); c.lineTo(cx - bw / 2, bottom - 10 * k); c.quadraticCurveTo(cx - bw / 2 - 4 * k, bottom + 14 * k, cx - bw / 2 + 22 * k, bottom + 14 * k); c.lineTo(cx + bw / 2 - 22 * k, bottom + 14 * k); c.quadraticCurveTo(cx + bw / 2 + 4 * k, bottom + 14 * k, cx + bw / 2, bottom - 10 * k); c.lineTo(cx + nw / 2, top + sh); c.lineTo(cx + nw / 2, top); c.closePath(); };
    c.save(); flask(); c.clip();
    const ly = h * .55, g = c.createLinearGradient(0, ly, 0, bottom); g.addColorStop(0, P.wine2); g.addColorStop(1, P.deep);
    c.fillStyle = g; c.beginPath(); c.moveTo(0, ly); for (let x = 0; x <= w; x += 8 * k) c.lineTo(x, ly + Math.sin(x / (34 * k)) * 6 * k); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fill();
    c.fillStyle = 'rgba(243,240,236,.55)'; const R = rng(11); for (let i = 0; i < 14; i++) { circ(c, cx + (R() - .5) * bw * .6, ly + 20 * k + R() * (bottom - ly - 40 * k), (3 + R() * 8) * k); c.fill(); }
    c.restore();
    flask(); c.strokeStyle = P.ink; c.lineWidth = 5 * k; c.lineJoin = 'round'; c.stroke();
    c.fillStyle = P.ink; c.fillRect(cx - nw / 2 - 12 * k, top - 5 * k, nw + 24 * k, 10 * k);
    [[-1], [0], [1]].forEach(([d], i) => { c.strokeStyle = i === 1 ? P.wine : P.ink; c.lineWidth = 5 * k; circ(c, cx + d * 34 * k, top - 66 * k - i * 26 * k, (16 + i * 6) * k); c.stroke(); });
    txt(c, 'DU LAB', cx, h * .1, fCaps(34 * k, 600), P.ink, { align: 'center', ls: 12 * k });
    txt(c, 'à la Collab', cx, h - 56 * k, fSerif(84 * k, 600, true), P.wine, { align: 'center' });
    credit(c, w, h, k, n);
  },
  pricing(c, w, h, k, n) {
    fillAll(c, w, h, P.white);
    c.fillStyle = 'rgba(22,18,20,.07)'; for (let x = 0; x < w; x += 40 * k) c.fillRect(x, 0, 1, h); for (let y = 0; y < h; y += 40 * k) c.fillRect(0, y, w, 1);
    const base = h * .82, bw = w * .07, gap = w * .035, x0 = w * .1, hs = [.18, .26, .22, .34, .3, .44, .4, .56];
    hs.forEach((v, i) => { c.fillStyle = i === hs.length - 1 ? P.wine : i % 3 === 1 ? P.rose : P.ink; c.fillRect(x0 + i * (bw + gap), base - v * h, bw, v * h); });
    c.strokeStyle = P.wine; c.lineWidth = 6 * k; c.lineJoin = 'round'; c.beginPath();
    hs.forEach((v, i) => { const x = x0 + i * (bw + gap) + bw / 2, y = base - v * h - 34 * k; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke();
    c.save(); c.translate(w * .7, h * .17); c.rotate(.2); c.fillStyle = P.wine; c.beginPath(); c.moveTo(0, 0); c.lineTo(150 * k, 0); c.lineTo(184 * k, 40 * k); c.lineTo(150 * k, 80 * k); c.lineTo(0, 80 * k); c.closePath(); c.fill();
    c.fillStyle = P.white; circ(c, 152 * k, 40 * k, 8 * k); c.fill(); txt(c, 'FCFA', 18 * k, 55 * k, fCaps(40 * k, 600), P.white, { ls: 4 * k }); c.restore();
    c.fillStyle = P.ink; c.fillRect(0, base, w, 3 * k);
    txt(c, 'Pricing', 46 * k, 118 * k, fSerif(84 * k, 600), P.ink); txt(c, 'Studio', 46 * k, 196 * k, fSerif(84 * k, 600, true), P.wine);
    credit(c, w, h, k, n);
  },
  braid(c, w, h, k, n) {
    c.drawImage(duo(IMG.pattern, w, h, '#3b0911', '#F2E6DF', .5, .4, 1.25), 0, 0);
    const g = c.createLinearGradient(0, 0, 0, h * .42); g.addColorStop(0, 'rgba(40,6,12,.85)'); g.addColorStop(1, 'rgba(40,6,12,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h * .42);
    txt(c, 'Brand', 44 * k, 124 * k, fSerif(92 * k, 600, true), P.paper);
    txt(c, 'stories', 44 * k, 208 * k, fSerif(92 * k, 600, true), P.paper);
    c.fillStyle = P.paper; c.fillRect(0, h - 78 * k, w, 78 * k);
    txt(c, 'MODE · BEAUTÉ · LIFESTYLE', 44 * k, h - 30 * k, fCaps(22 * k, 600), P.wine, { ls: 5 * k });
    txt(c, 'N° ' + pad2(n), w - 36 * k, 50 * k, fCaps(19 * k, 600), 'rgba(243,240,236,.8)', { align: 'right', ls: 3 * k });
  },
  mode(c, w, h, k, n) {
    fillAll(c, w, h, P.paper);
    cover(c, IMG.figure, 0, 0, w, h, .5, .5, 1);
    txt(c, 'Silhouettes', 40 * k, 104 * k, fSerif(76 * k, 600, true), P.wine);
    c.fillStyle = P.ink; c.fillRect(0, h - 84 * k, w, 84 * k);
    txt(c, 'SÉRIE MODE', 40 * k, h - 32 * k, fCaps(26 * k, 600), P.paper, { ls: 8 * k });
    txt(c, 'N° ' + pad2(n) + ' — LYS SAMA', w - 40 * k, h - 32 * k, fCaps(20 * k, 500), 'rgba(243,240,236,.75)', { align: 'right', ls: 4 * k });
  },
  observe(c, w, h, k, n) {
    fillAll(c, w, h, P.paper);
    const cx = w / 2, cy = h * .48, r = w * .33;
    c.save(); circ(c, cx, cy, r); c.clip(); c.drawImage(duo(IMG.lens, r * 2, r * 2, '#0c090a', '#F1ECE6', .4, .5, 1.5), cx - r, cy - r); c.restore();
    c.strokeStyle = P.wine; c.lineWidth = 5 * k; circ(c, cx, cy, r + 14 * k); c.stroke();
    txt(c, '01', 44 * k, 112 * k, fSerif(92 * k, 600), P.wine);
    txt(c, 'OBSERVER', cx, h - 46 * k, fCaps(34 * k, 600), P.ink, { align: 'center', ls: 12 * k });
    credit(c, w, h, k, n);
  },
  write(c, w, h, k, n) {
    fillAll(c, w, h, P.cream);
    const R = rng(21);
    for (let i = 0; i < 8; i++) { const y = h * .3 + i * h * .066; scribble(c, 74 * k, y, w * (.5 + R() * .3), k, R, i === 4 ? P.wine : 'rgba(22,18,20,.78)', (i === 4 ? 4.4 : 3) * k); }
    c.fillStyle = P.wine; c.fillRect(74 * k, h * .3 + 4 * h * .066 + 15 * k, w * .44, 4 * k);
    txt(c, '02', 44 * k, 112 * k, fSerif(92 * k, 600), P.wine);
    txt(c, 'ÉCRIRE', w / 2, h - 46 * k, fCaps(34 * k, 600), P.ink, { align: 'center', ls: 12 * k });
    credit(c, w, h, k, n);
  },
  shoot(c, w, h, k, n) {
    fillAll(c, w, h, P.ink);
    const cx = w * .46, cy = h * .47, r = w * .27;
    const strip = () => { c.beginPath(); c.moveTo(cx + r * .7, cy + r * .7); c.bezierCurveTo(cx + r * 1.3, cy + r * 1.2, w * .9, h * .72, w + 20 * k, h * .64); c.stroke(); };
    c.strokeStyle = P.wine; c.lineWidth = 36 * k; strip();
    c.strokeStyle = P.ink; c.lineWidth = 4 * k; c.setLineDash([8 * k, 10 * k]); strip(); c.setLineDash([]);
    c.fillStyle = P.paper; circ(c, cx, cy, r); c.fill();
    c.fillStyle = P.ink; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2; circ(c, cx + Math.cos(a) * r * .56, cy + Math.sin(a) * r * .56, r * .22); c.fill(); }
    c.fillStyle = P.wine; circ(c, cx, cy, r * .14); c.fill();
    txt(c, '03', 44 * k, 112 * k, fSerif(92 * k, 600), P.rose);
    txt(c, 'TOURNER', w / 2, h - 46 * k, fCaps(34 * k, 600), P.paper, { align: 'center', ls: 12 * k });
    credit(c, w, h, k, n, true);
  },
  edit(c, w, h, k, n) {
    fillAll(c, w, h, P.white);
    const R = rng(33), y0 = h * .31, rh = 46 * k, gp = 14 * k, cols = [P.ink, P.wine, P.rose, P.grey, P.wine2];
    for (let r = 0; r < 5; r++) { let x = 50 * k; while (x < w - 60 * k) { const len = (40 + R() * 150) * k; if (R() > .25) { c.fillStyle = cols[(r + (R() * 3 | 0)) % cols.length]; c.fillRect(x, y0 + r * (rh + gp), Math.min(len, w - 50 * k - x), rh); } x += len + 6 * k; } }
    const px = w * .6; c.fillStyle = P.wine; c.fillRect(px - 2 * k, y0 - 30 * k, 4 * k, 5 * (rh + gp) + 40 * k);
    c.beginPath(); c.moveTo(px - 13 * k, y0 - 46 * k); c.lineTo(px + 13 * k, y0 - 46 * k); c.lineTo(px, y0 - 28 * k); c.fill();
    txt(c, '00:00:12:08', px, y0 - 60 * k, fCaps(24 * k, 600), P.wine, { align: 'center', ls: 3 * k });
    txt(c, '04', 44 * k, 112 * k, fSerif(92 * k, 600), P.wine);
    txt(c, 'MONTER', w / 2, h - 46 * k, fCaps(34 * k, 600), P.ink, { align: 'center', ls: 12 * k });
    credit(c, w, h, k, n);
  },
  content(c, w, h, k, n) {
    fillAll(c, w, h, P.blush);
    const ph = h * .64, pw = ph * 9 / 17.5, px = w / 2 - pw / 2, py = h * .09, rr = (x, y, ww, hh, r) => { c.beginPath(); c.roundRect ? c.roundRect(x, y, ww, hh, r) : c.rect(x, y, ww, hh); };
    c.fillStyle = 'rgba(22,18,20,.18)'; rr(px + 14 * k, py + 22 * k, pw, ph, 38 * k); c.fill();
    c.fillStyle = P.ink; rr(px, py, pw, ph, 38 * k); c.fill();
    c.save(); rr(px + 12 * k, py + 12 * k, pw - 24 * k, ph - 24 * k, 28 * k); c.clip();
    cover(c, IMG.figure, px + 12 * k, py + 12 * k, pw - 24 * k, ph - 24 * k, .5, .2, 1.35);
    const g = c.createLinearGradient(0, py + ph * .6, 0, py + ph); g.addColorStop(0, 'rgba(22,18,20,0)'); g.addColorStop(1, 'rgba(22,18,20,.75)'); c.fillStyle = g; c.fillRect(px, py + ph * .6, pw, ph * .4);
    c.restore();
    c.fillStyle = 'rgba(243,240,236,.94)'; circ(c, w / 2, py + ph * .46, 34 * k); c.fill();
    c.fillStyle = P.wine; c.beginPath(); c.moveTo(w / 2 - 10 * k, py + ph * .46 - 15 * k); c.lineTo(w / 2 + 16 * k, py + ph * .46); c.lineTo(w / 2 - 10 * k, py + ph * .46 + 15 * k); c.closePath(); c.fill();
    c.fillStyle = 'rgba(243,240,236,.9)'; [0, 1, 2].forEach(i => { circ(c, px + pw - 40 * k, py + ph * .58 + i * 46 * k, 12 * k); c.fill(); });
    c.fillRect(px + 34 * k, py + ph - 78 * k, pw * .48, 8 * k); c.fillRect(px + 34 * k, py + ph - 58 * k, pw * .32, 8 * k);
    txt(c, 'Création de contenu', 44 * k, h - 86 * k, fSerif(60 * k, 600, true), P.ink);
    txt(c, 'REELS · TIKTOK · UGC', 46 * k, h - 42 * k, fCaps(22 * k, 600), P.wine, { ls: 5 * k });
    credit(c, w, h, k, n);
  },
  ripple(c, w, h, k, n) {
    fillAll(c, w, h, P.paper);
    const sx = w * .32, sy = h * .6, R = rng(5);
    for (let i = 0; i < 26; i++) { const r = 26 * k + i * 30 * k; c.strokeStyle = `rgba(110,15,30,${.9 - i * .03})`; c.lineWidth = Math.max(1, 5 - i * .16) * k; circ(c, sx, sy, r); c.stroke(); }
    c.fillStyle = P.ink; for (let i = 0; i < 26; i++) { const r = (60 + R() * 600) * k, a = R() * Math.PI * 2; circ(c, sx + Math.cos(a) * r, sy + Math.sin(a) * r, 5 * k); c.fill(); }
    c.fillStyle = P.wine; circ(c, sx, sy, 15 * k); c.fill();
    txt(c, 'Portée', 44 * k, 124 * k, fSerif(96 * k, 600, true), P.ink);
    txt(c, 'CAMPAGNES D’INFLUENCE', 48 * k, 172 * k, fCaps(22 * k, 600), P.wine, { ls: 5 * k });
    credit(c, w, h, k, n);
  },
  direction(c, w, h, k, n) {
    c.drawImage(duo(IMG.skirt, w, h, '#0e0b0c', '#8f8a86', .5, .5, 1.1), 0, 0);
    c.fillStyle = 'rgba(14,11,12,.35)'; c.fillRect(0, 0, w, h);
    const phi = 1.618, W = w * .84, H = W / phi; let r = { x: (w - W) / 2, y: h * .33, w: W, h: H };
    c.strokeStyle = 'rgba(243,240,236,.6)'; c.lineWidth = 2 * k; c.strokeRect(r.x, r.y, r.w, r.h);
    const arcs = [];
    for (let i = 0; i < 9; i++) {
      const d = i % 4; let s;
      if (d === 0) { s = r.h; c.strokeRect(r.x, r.y, s, s); arcs.push([r.x + s, r.y + s, s, Math.PI, Math.PI * 1.5]); r = { x: r.x + s, y: r.y, w: r.w - s, h: r.h }; }
      else if (d === 1) { s = r.w; c.strokeRect(r.x, r.y, s, s); arcs.push([r.x, r.y + s, s, Math.PI * 1.5, Math.PI * 2]); r = { x: r.x, y: r.y + s, w: r.w, h: r.h - s }; }
      else if (d === 2) { s = r.h; c.strokeRect(r.x + r.w - s, r.y, s, s); arcs.push([r.x + r.w - s, r.y, s, 0, Math.PI * .5]); r = { x: r.x, y: r.y, w: r.w - s, h: r.h }; }
      else { s = r.w; c.strokeRect(r.x, r.y + r.h - s, s, s); arcs.push([r.x + s, r.y + r.h - s, s, Math.PI * .5, Math.PI]); r = { x: r.x, y: r.y, w: r.w, h: r.h - s }; }
    }
    c.strokeStyle = '#C62B43'; c.lineWidth = 6 * k; c.beginPath(); arcs.forEach(([x, y, s, a0, a1]) => c.arc(x, y, s, a0, a1)); c.stroke();
    txt(c, 'Direction', 44 * k, 122 * k, fSerif(86 * k, 600), P.paper);
    txt(c, 'créative', 44 * k, 204 * k, fSerif(86 * k, 600, true), '#E7B7B2');
    txt(c, 'LA RÈGLE D’OR DU CADRE', 46 * k, h - 42 * k, fCaps(22 * k, 600), 'rgba(243,240,236,.85)', { ls: 5 * k });
    credit(c, w, h, k, n, true);
  },
  kit(c, w, h, k, n) {
    fillAll(c, w, h, P.cream);
    const cw = w * .52, ch = cw * 1.36, cx = w * .5, cy = h * .47;
    const card = (dx, dy, rot, col) => { c.save(); c.translate(cx + dx, cy + dy); c.rotate(rot); c.fillStyle = col; c.shadowColor = 'rgba(22,18,20,.2)'; c.shadowBlur = 30 * k; c.shadowOffsetY = 14 * k; c.fillRect(-cw / 2, -ch / 2, cw, ch); c.restore(); };
    card(-44 * k, -10 * k, -.12, P.rose); card(32 * k, 0, .08, P.ink); card(0, 14 * k, -.02, P.white);
    c.save(); c.translate(cx, cy + 14 * k); c.rotate(-.02);
    const L = -cw / 2 + 30 * k, T = -ch / 2;
    txt(c, 'MEDIA KIT', L, T + 56 * k, fCaps(24 * k, 600), P.wine, { ls: 7 * k });
    c.save(); circ(c, L + 44 * k, T + 132 * k, 44 * k); c.clip(); c.drawImage(duo(IMG.portrait, 88 * k, 88 * k, '#1d0509', '#F4ECE6', .52, .12, 2.1), L, T + 88 * k); c.restore();
    txt(c, 'Lys Sama', L + 104 * k, T + 126 * k, fSerif(30 * k, 600), P.ink);
    txt(c, 'CRÉATRICE DE CONTENU', L + 104 * k, T + 154 * k, fCaps(14 * k, 600), P.mute, { ls: 3 * k });
    [.82, .56, .7].forEach((v, i) => { const y = T + 214 * k + i * 46 * k; c.fillStyle = 'rgba(22,18,20,.09)'; c.fillRect(L, y, cw - 60 * k, 14 * k); c.fillStyle = i === 1 ? P.wine : P.ink; c.fillRect(L, y, (cw - 60 * k) * v, 14 * k); });
    [0, 1, 2].forEach(i => { c.fillStyle = i === 0 ? P.wine : 'rgba(22,18,20,.1)'; c.fillRect(L + i * ((cw - 60 * k) / 3 + 0), T + ch - 150 * k, (cw - 60 * k) / 3 - 10 * k, 96 * k); });
    c.restore();
    txt(c, 'Media kit', 44 * k, h - 84 * k, fSerif(70 * k, 600, true), P.ink);
    txt(c, 'ACCOMPAGNEMENT CRÉATEURS', 46 * k, h - 42 * k, fCaps(22 * k, 600), P.wine, { ls: 5 * k });
    credit(c, w, h, k, n);
  },
  notes(c, w, h, k, n) {
    fillAll(c, w, h, P.white);
    c.fillStyle = 'rgba(196,138,134,.4)'; for (let y = 160 * k; y < h - 40 * k; y += 36 * k) c.fillRect(0, y, w, 2 * k);
    c.fillStyle = P.wine; c.fillRect(88 * k, 0, 2.5 * k, h);
    const R = rng(44);
    for (let i = 0; i < 12; i++) { const y = 188 * k + i * 36 * k - 8 * k; if (y > h - 90 * k) break; scribble(c, 110 * k, y, w * (.45 + R() * .3), k, R, 'rgba(22,18,20,.75)', 2.6 * k); if (i === 3) { c.fillStyle = P.wine; c.fillRect(106 * k, y - 4 * k, w * .5, 4 * k); } }
    txt(c, 'Carnet', 110 * k, 116 * k, fSerif(76 * k, 600, true), P.ink);
    credit(c, w, h, k, n);
  },
  book(c, w, h, k, n) {
    fillAll(c, w, h, P.wine);
    const cx = w / 2, by = h * .25, bh = h * .6, pw = w * .36;
    c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(cx - pw - 10 * k, by + 22 * k, pw * 2 + 20 * k, bh);
    const page = s => { c.beginPath(); c.moveTo(cx, by + 14 * k); c.quadraticCurveTo(cx + s * pw * .5, by - 14 * k, cx + s * pw, by + 4 * k); c.lineTo(cx + s * pw, by + bh); c.quadraticCurveTo(cx + s * pw * .5, by + bh - 18 * k, cx, by + bh + 10 * k); c.closePath(); c.fillStyle = P.paper; c.fill(); };
    page(-1); page(1);
    const g = c.createLinearGradient(cx - 40 * k, 0, cx + 40 * k, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, 'rgba(0,0,0,.2)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(cx - 40 * k, by, 80 * k, bh + 10 * k);
    txt(c, 'Chapitre I', cx - pw + 36 * k, by + 76 * k, fSerif(38 * k, 600, true), P.wine);
    const R = rng(9);
    for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(22,18,20,.36)'; c.fillRect(cx - pw + 36 * k, by + 108 * k + i * 22 * k, (pw - 80 * k) * (.7 + R() * .3), 6 * k); }
    for (let i = 0; i < 13; i++) { c.fillStyle = 'rgba(22,18,20,.36)'; c.fillRect(cx + 40 * k, by + 54 * k + i * 22 * k, (pw - 80 * k) * (i === 12 ? .3 : .7 + R() * .3), 6 * k); }
    c.fillStyle = P.ink; c.beginPath(); c.moveTo(cx + 18 * k, by); c.lineTo(cx + 42 * k, by); c.lineTo(cx + 42 * k, h * .96); c.lineTo(cx + 30 * k, h * .93); c.lineTo(cx + 18 * k, h * .96); c.closePath(); c.fill();
    txt(c, 'MANUSCRIT — EN COURS D’ÉCRITURE', cx, h * .14, fCaps(26 * k, 600), 'rgba(243,240,236,.9)', { align: 'center', ls: 8 * k });
    credit(c, w, h, k, n, true);
  },
  contact(c, w, h, k, n) {
    fillAll(c, w, h, P.paper);
    c.strokeStyle = 'rgba(110,15,30,.28)'; c.lineWidth = 2 * k; circ(c, w * .8, h * .36, h * .3); c.stroke(); circ(c, w * .8, h * .36, h * .21); c.stroke();
    txt(c, 'Parlons.', 56 * k, h * .6, fSerif(250 * k, 600, true), P.wine);
    txt(c, 'UNE IDÉE · UNE MARQUE · UN PROJET', 66 * k, h * .6 + 78 * k, fCaps(28 * k, 600), P.ink, { ls: 8 * k });
    c.fillStyle = P.ink; c.fillRect(66 * k, h * .6 + 118 * k, 190 * k, 3 * k);
    c.beginPath(); c.moveTo(256 * k, h * .6 + 110 * k); c.lineTo(274 * k, h * .6 + 119.5 * k); c.lineTo(256 * k, h * .6 + 129 * k); c.fill();
    credit(c, w, h, k, n);
  },
};
function makeArt(it) {
  const long = V.small ? 768 : 1100;
  const w = it.ratio >= 1 ? long : Math.round(long * it.ratio), h = it.ratio >= 1 ? Math.round(long / it.ratio) : long;
  const cv = mkCanvas(w, h), c = cv.getContext('2d');
  ART[it.art](c, w, h, Math.min(w, h) / 800, it.n);
  paperGrain(c, w, h);
  return cv;
}

/* ---------- textures du bâtiment ---------- */
function texPlaster() {
  const cv = mkCanvas(256, 256), c = cv.getContext('2d'); fillAll(c, 256, 256, '#fafafa');
  const R = rng(3), d = c.getImageData(0, 0, 256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = 244 + R() * 11; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; }
  c.putImageData(d, 0, 0);
  for (let i = 0; i < 40; i++) { const x = R() * 256, y = R() * 256, r = 20 + R() * 50, a = (R() - .5) * .05; for (const ox of [0, -256, 256]) for (const oy of [0, -256, 256]) { const g = c.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r); g.addColorStop(0, a > 0 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${-a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x + ox - r, y + oy - r, r * 2, r * 2); } }
  return mkTex(cv, { repeat: true });
}
function texConcrete() {
  const S = 512, cv = mkCanvas(S, S), c = cv.getContext('2d'); fillAll(c, S, S, '#c9c4bd');
  const R = rng(17);
  for (let i = 0; i < 220; i++) { const x = R() * S, y = R() * S, r = 30 + R() * 110, a = (R() - .5) * .11; for (const ox of [0, -S, S]) for (const oy of [0, -S, S]) { if (x + ox + r < 0 || x + ox - r > S || y + oy + r < 0 || y + oy - r > S) continue; const g = c.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r); g.addColorStop(0, a > 0 ? `rgba(255,255,255,${a})` : `rgba(40,34,30,${-a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x + ox - r, y + oy - r, r * 2, r * 2); } }
  const d = c.getImageData(0, 0, S, S); for (let i = 0; i < d.data.length; i += 4) { const v = (R() - .5) * 12; d.data[i] += v; d.data[i + 1] += v; d.data[i + 2] += v; } c.putImageData(d, 0, 0);
  return mkTex(cv, { repeat: true });
}
/* plafond : verrière + gorge lumineuse côté œuvres + rail de spots. 6,6 m × 3,6 m par motif */
function texCeiling() {
  const W = 512, H = 280, pm = W / 6.6, cv = mkCanvas(W, H), c = cv.getContext('2d'); fillAll(c, W, H, '#e2ded8');
  const glow = (x0, x1, y0, y1, s) => { for (let i = 6; i > 0; i--) { c.fillStyle = `rgba(255,255,255,${.05})`; c.fillRect(x0 - i * s, y0 - i * s, x1 - x0 + 2 * i * s, y1 - y0 + 2 * i * s); } };
  const px0 = 2.0 * pm, px1 = 4.6 * pm, py0 = .42 * pm, py1 = 3.18 * pm;
  glow(px0, px1, py0, py1, 5); c.fillStyle = '#c4beb7'; c.fillRect(px0 - 3, py0 - 3, px1 - px0 + 6, py1 - py0 + 6);
  const g = c.createLinearGradient(px0, 0, px1, 0); g.addColorStop(0, '#f6f4f1'); g.addColorStop(.5, '#ffffff'); g.addColorStop(1, '#f6f4f1'); c.fillStyle = g; c.fillRect(px0, py0, px1 - px0, py1 - py0);
  c.fillStyle = '#d8d3cd'; c.fillRect((px0 + px1) / 2 - 1, py0, 2, py1 - py0); c.fillRect(px0, (py0 + py1) / 2 - 1, px1 - px0, 2);
  const sx0 = .72 * pm, sx1 = .96 * pm; glow(sx0, sx1, -20, H + 20, 3); c.fillStyle = '#ffffff'; c.fillRect(sx0, 0, sx1 - sx0, H);
  c.fillStyle = '#1d1a1a'; c.fillRect(1.72 * pm, 0, 3.4, H);
  const t = mkTex(cv, { repeat: true }); return t;
}
function texPool() {
  const S = 256, cv = mkCanvas(S, S), c = cv.getContext('2d'); fillAll(c, S, S, '#000');
  c.save(); c.translate(S / 2, S * .56); c.scale(1, .92);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, S * .5); g.addColorStop(0, 'rgba(255,250,240,.95)'); g.addColorStop(.45, 'rgba(255,250,240,.55)'); g.addColorStop(.8, 'rgba(255,250,240,.12)'); g.addColorStop(1, 'rgba(255,250,240,0)');
  c.fillStyle = g; c.fillRect(-S, -S, 2 * S, 2 * S); c.restore();
  const g2 = c.createLinearGradient(0, 0, 0, S * .5); g2.addColorStop(0, 'rgba(255,250,240,.5)'); g2.addColorStop(1, 'rgba(255,250,240,0)');
  c.globalCompositeOperation = 'lighter'; c.fillStyle = g2; c.beginPath(); c.moveTo(S * .47, 0); c.lineTo(S * .53, 0); c.lineTo(S * .78, S * .5); c.lineTo(S * .22, S * .5); c.closePath(); c.filter = 'blur(10px)'; c.fill(); c.filter = 'none';
  return mkTex(cv, { aniso: 1 });
}
function texShadow() {
  const cv = mkCanvas(256, 256), c = cv.getContext('2d');
  c.shadowColor = 'rgba(0,0,0,1)'; c.shadowBlur = 26; c.shadowOffsetX = 1000; c.fillStyle = '#000'; c.fillRect(46 - 1000, 46, 164, 164);
  return mkTex(cv, { aniso: 1 });
}
function texBlob() {
  const cv = mkCanvas(128, 128), c = cv.getContext('2d'); const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(.6, 'rgba(0,0,0,.2)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  return mkTex(cv, { aniso: 1 });
}
function fitFont(c, s, maxW, px, mk) { let p = px; c.font = mk(p); while (c.measureText(s).width > maxW && p > 20) { p -= 4; c.font = mk(p); } return p; }
function texWallText(sec) {
  const W = V.small ? 1024 : 1536, H = W * 2 / 3, k = W / 1536, cv = mkCanvas(W, H), c = cv.getContext('2d');
  txt(c, 'SALLE ' + sec.num, 2, 96 * k, fCaps(58 * k, 600), P.wine, { ls: 16 * k });
  const p = fitFont(c, sec.title, W * .96, 190 * k, x => fSerif(x, 600));
  txt(c, sec.title, 0, 96 * k + p * 1.08, fSerif(p, 600), P.ink);
  let y = 96 * k + p * 1.08 + 88 * k;
  txt(c, sec.sub, 2, y, fSerif(66 * k, 500, true), P.ink2 || '#3b3437');
  y += 58 * k; c.fillStyle = P.wine; c.fillRect(2, y, 150 * k, 6 * k); y += 96 * k;
  c.font = fSans(50 * k, 400); c.fillStyle = '#231d1f'; c.textAlign = 'left'; wrapText(c, sec.wall, 2, y, W * .86, 74 * k);
  return mkTex(cv);
}
function texNumeral(num) {
  const S = 768, cv = mkCanvas(S, S), c = cv.getContext('2d');
  const p = fitFont(c, num, S * .92, 620, x => fSerif(x, 600));
  txt(c, num, S / 2, S / 2 + p * .35, fSerif(p, 600), P.wine, { align: 'center' });
  return mkTex(cv);
}
function texCartel(it) {
  const cv = mkCanvas(512, 330), c = cv.getContext('2d'); fillAll(c, 512, 330, '#FCFBF9');
  c.font = fSerif(42, 600); c.fillStyle = P.ink; let y = wrapText(c, it.title, 30, 70, 450, 46);
  txt(c, 'Lys Sama, 2026', 30, y + 46, fSans(25, 500), P.ink);
  c.font = fSerif(25, 400, true); c.fillStyle = P.mute; wrapText(c, it.tech, 30, y + 84, 450, 31);
  txt(c, 'N° ' + pad2(it.n), 30, 300, fCaps(24, 600), P.wine, { ls: 4 });
  return mkTex(cv);
}
function texPlaque(sec) {
  const cv = mkCanvas(640, 256), c = cv.getContext('2d'); fillAll(c, 640, 256, P.wine);
  txt(c, 'SALLE ' + sec.num, 36, 92, fCaps(50, 600), 'rgba(243,240,236,.8)', { ls: 12 });
  const p = fitFont(c, sec.title, 480, 76, x => fSerif(x, 600));
  txt(c, sec.title, 36, 196, fSerif(p, 600), P.paper);
  c.strokeStyle = P.paper; c.lineWidth = 6; c.beginPath(); c.moveTo(540, 128); c.lineTo(606, 128); c.moveTo(580, 102); c.lineTo(606, 128); c.lineTo(580, 154); c.stroke();
  return mkTex(cv);
}
function texVinyl(lines) {
  const W = 1536, H = 420, cv = mkCanvas(W, H), c = cv.getContext('2d');
  txt(c, lines[0], W / 2, 150, fSerif(fitFont(c, lines[0], W * .96, 150, x => fSerif(x, 600)), 600), P.paper, { align: 'center' });
  txt(c, lines[1], W / 2, 290, fCaps(60, 500), 'rgba(243,240,236,.86)', { align: 'center', ls: 14 });
  return mkTex(cv);
}
/* projection de la salle IV : amorce de film + les quatre gestes */
const FILM = { cv: null, c: null, tex: null, last: -1 };
function drawFilm(t) {
  if (!FILM.cv) { FILM.cv = mkCanvas(512, 288); FILM.c = FILM.cv.getContext('2d'); FILM.tex = mkTex(FILM.cv, { aniso: 2 }); }
  const fr = Math.floor(t * 12); if (fr === FILM.last) return; FILM.last = fr;
  const c = FILM.c, W = 512, H = 288, T = t % 15, R = rng(fr);
  if (T < 4.5) {
    const nb = 3 - Math.floor(T / 1.5), ph = (T % 1.5) / 1.5;
    fillAll(c, W, H, '#d9d2c8');
    c.strokeStyle = '#2a2224'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.moveTo(W / 2, 0); c.lineTo(W / 2, H); c.stroke();
    circ(c, W / 2, H / 2, 108); c.stroke(); circ(c, W / 2, H / 2, 92); c.stroke();
    c.fillStyle = 'rgba(42,34,36,.3)'; c.beginPath(); c.moveTo(W / 2, H / 2); c.arc(W / 2, H / 2, 108, -Math.PI / 2, -Math.PI / 2 + ph * Math.PI * 2); c.closePath(); c.fill();
    txt(c, String(nb), W / 2, H / 2 + 52, fSerif(150, 600), '#1c1618', { align: 'center' });
  } else {
    const idx = Math.min(3, Math.floor((T - 4.5) / 2.6)), ph = ((T - 4.5) % 2.6) / 2.6, words = ['Observer', 'Écrire', 'Tourner', 'Monter'];
    fillAll(c, W, H, idx % 2 ? '#6E0F1E' : '#16110f');
    txt(c, pad2(idx + 1) + ' / 04', 28, 44, fCaps(20, 600), 'rgba(243,240,236,.75)', { ls: 4 });
    txt(c, '00:00:' + pad2(Math.floor(T)) + ':' + pad2(fr % 24), W - 28, 44, fCaps(20, 500), 'rgba(243,240,236,.75)', { align: 'right', ls: 3 });
    c.globalAlpha = sstep(0, .14, ph) * (1 - sstep(.9, 1, ph));
    txt(c, words[idx], W / 2, H / 2 + 32 + (1 - sstep(0, .2, ph)) * 14, fSerif(92, 600, true), '#F3F0EC', { align: 'center' });
    c.globalAlpha = 1;
    c.fillStyle = 'rgba(243,240,236,.8)'; c.fillRect(28, H - 34, (W - 56) * ((idx + ph) / 4), 3);
  }
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; for (let i = 0; i < 2; i++) if (R() < .5) { const x = R() * W; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (R() - .5) * 6, H); c.stroke(); }
  c.fillStyle = `rgba(0,0,0,${R() * .06})`; c.fillRect(0, 0, W, H);
  FILM.tex.needsUpdate = true;
}
