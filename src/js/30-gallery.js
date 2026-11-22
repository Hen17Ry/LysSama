/* =====================================================================
   LE BÂTIMENT — sept salles reliées par des portes, une par section
   ===================================================================== */
const ROOM_W = 6.6, ROOM_H = 4.3, WALL_T = .5, DOOR_W = 2.5, DOOR_H = 3.05, EXIT_E = 3.6, WALK_OFF = 1.45, EYE_Y = 1.6;
const Gal = { rooms: [], hits: [], scene: null, camera: null, pts: [], N: 0, len: 0, S0: 0, S1: 0, tex: {}, floorMat: null };

class Batch {
  constructor() { this.p = []; this.u = []; this.c = []; }
  quad(a, b, c, d, col, uv, cols) {
    const Pn = [a, b, c, a, c, d], U = uv ? [uv[0], uv[1], uv[2], uv[0], uv[2], uv[3]] : null, C = cols ? [cols[0], cols[1], cols[2], cols[0], cols[2], cols[3]] : null;
    for (let i = 0; i < 6; i++) { this.p.push(Pn[i][0], Pn[i][1], Pn[i][2]); const t = U ? U[i] : [0, 0]; this.u.push(t[0], t[1]); const k = C ? C[i] : (col || [1, 1, 1]); this.c.push(k[0], k[1], k[2]); }
  }
  /* même chose, mais la face est orientée vers le point `to` */
  quadTo(a, b, c, d, to, col, uv, cols) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (nx * (to[0] - a[0]) + ny * (to[1] - a[1]) + nz * (to[2] - a[2]) >= 0) this.quad(a, b, c, d, col, uv, cols);
    else this.quad(a, d, c, b, col, uv && [uv[0], uv[3], uv[2], uv[1]], cols && [cols[0], cols[3], cols[2], cols[1]]);
  }
  box(cx, cy, cz, sx, sy, sz, col) {
    const x0 = cx - sx / 2, x1 = cx + sx / 2, y0 = cy - sy / 2, y1 = cy + sy / 2, z0 = cz - sz / 2, z1 = cz + sz / 2, s = k => [col[0] * k, col[1] * k, col[2] * k], far = 99;
    this.quadTo([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [cx, far, cz], s(1));
    this.quadTo([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [cx, -far, cz], s(.35));
    this.quadTo([x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [cx, cy, -far], s(.72));
    this.quadTo([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [cx, cy, far], s(.72));
    this.quadTo([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-far, cy, cz], s(.6));
    this.quadTo([x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [far, cy, cz], s(.6));
  }
  geo() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.computeBoundingSphere(); return g;
  }
}

const WALL_VS = [0, .12, .3, .6, 1.0, 1.6, 2.3, DOOR_H, 3.5, 3.9, 4.12, ROOM_H];
function addWall(b, fr, ops, base) {
  const L = fr.len, us = [0, L]; for (let u = .6; u < L - .3; u += .6) us.push(u); ops.forEach(o => us.push(o.u0, o.u1)); us.sort((x, y) => x - y);
  const U = us.filter((v, i) => i === 0 || v - us[i - 1] > 1e-4);
  const ao = (u, v) => { let a = 1 - .25 * Math.exp(-v / .3) - .08 * Math.exp(-(ROOM_H - v) / .5) - .09 * (Math.exp(-u / .6) + Math.exp(-(L - u) / .6)); for (const o of ops) if (v < o.h + .25) a -= .06 * Math.exp(-Math.min(Math.abs(u - o.u0), Math.abs(u - o.u1)) / .22); return lin(Math.max(.35, a)); };
  const Pt = (u, v) => [fr.o[0] + fr.u[0] * u, v, fr.o[2] + fr.u[2] * u], cc = (u, v) => { const a = ao(u, v); return [base[0] * a, base[1] * a, base[2] * a]; };
  for (let i = 0; i < U.length - 1; i++) for (let j = 0; j < WALL_VS.length - 1; j++) {
    const u0 = U[i], u1 = U[i + 1], v0 = WALL_VS[j], v1 = WALL_VS[j + 1], um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
    if (ops.some(o => um > o.u0 && um < o.u1 && vm < o.h)) continue;
    b.quad(Pt(u0, v0), Pt(u1, v0), Pt(u1, v1), Pt(u0, v1), null, [[u0 / 2, v0 / 2], [u1 / 2, v0 / 2], [u1 / 2, v1 / 2], [u0 / 2, v1 / 2]], [cc(u0, v0), cc(u1, v0), cc(u1, v1), cc(u0, v1)]);
  }
}
function addBase(b, fr, ops, col) {
  const cuts = [0, ...ops.flatMap(o => [o.u0, o.u1]), fr.len], off = .012, hh = .09;
  const Pt = (u, v) => [fr.o[0] + fr.u[0] * u + fr.n[0] * off, v, fr.o[2] + fr.u[2] * u + fr.n[2] * off], dk = [col[0] * .55, col[1] * .55, col[2] * .55];
  for (let i = 0; i < cuts.length; i += 2) { const u0 = cuts[i], u1 = cuts[i + 1]; if (u1 - u0 < .01) continue;
    b.quad(Pt(u0, 0), Pt(u1, 0), Pt(u1, hh), Pt(u0, hh), null, null, [dk, dk, col, col]); }
}
function wallPoint(fr, u, y, off) { return new THREE.Vector3(fr.o[0] + fr.u[0] * u + fr.n[0] * off, y, fr.o[2] + fr.u[2] * u + fr.n[2] * off); }
function mount(obj, fr, u, y, off) { obj.position.copy(wallPoint(fr, u, y, off)); obj.rotation.y = Math.atan2(fr.n[0], fr.n[2]); return obj; }

/* matériau d’une œuvre : image + reflet discret des lumières du plafond sur le verre */
function makeArtMat(tex) {
  const m = new THREE.ShaderMaterial({
    fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { map: { value: null }, uLit: { value: 1 }, uSheen: { value: 1 }, uCeil: { value: ROOM_H } }]),
    vertexShader: /* glsl */`
      #include <common>
      #include <fog_pars_vertex>
      varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main() {
        vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vN = normalize(mat3(modelMatrix) * normal);
        vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */`
      #include <common>
      #include <fog_pars_fragment>
      uniform sampler2D map; uniform float uLit, uSheen, uCeil;
      varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main() {
        vec3 c = texture2D(map, vUv).rgb * uLit;
        vec3 Vd = normalize(cameraPosition - vW), R = reflect(-Vd, vN);
        float t = (uCeil - vW.y) / max(R.y, 0.001);
        float dn = dot(R * t, vN);
        float band = smoothstep(0.42, 0.0, abs(dn - 0.85)) * step(0.0, R.y);
        float fres = pow(1.0 - max(dot(Vd, vN), 0.0), 3.0);
        c += vec3(1.0, 0.98, 0.95) * (band * (0.035 + 0.3 * fres) + fres * 0.05) * uSheen * uLit;
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  m.uniforms.map.value = tex;
  return m;
}
function makeFloorMat() {
  const m = new THREE.ShaderMaterial({
    fog: true, transparent: true, vertexColors: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { map: { value: null }, uDim: { value: 1 } }]),
    vertexShader: /* glsl */`
      #include <common>
      #include <color_pars_vertex>
      #include <fog_pars_vertex>
      varying vec3 vW;
      void main() {
        #include <color_vertex>
        vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz;
        vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */`
      #include <common>
      #include <color_pars_fragment>
      #include <fog_pars_fragment>
      uniform sampler2D map; uniform float uDim;
      varying vec3 vW;
      void main() {
        vec3 c = texture2D(map, vW.xz / 4.2).rgb * vColor.rgb * uDim;
        vec2 g = abs(fract(vW.xz / 3.3 + 0.5) - 0.5) * 3.3; float dj = min(g.x, g.y);
        float j = 1.0 - smoothstep(0.004, 0.012 + fwidth(dj) * 1.5, dj);
        c *= 1.0 - 0.2 * j;
        vec3 Vd = normalize(cameraPosition - vW);
        float fres = pow(1.0 - clamp(Vd.y, 0.0, 1.0), 2.4);
        gl_FragColor = vec4(c, mix(0.9, 0.6, fres));
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  m.uniforms.map.value = Gal.tex.concrete;
  return m;
}

function planRooms() {
  let door = null, th = 0;
  SECTIONS.forEach((sec, i) => {
    const n = sec.items.length;
    const side = sec.last ? [] : (sec.screen ? sec.items.slice() : sec.items.slice(0, n - 1));
    const end = sec.last ? sec.items[0] : (sec.screen ? null : sec.items[n - 1]);
    const first = sec.screen ? 9.5 : 9.9, gap = sec.screen ? 3.15 : 4.0;
    side.forEach((it, k) => { it.D = first + k * gap; it.wall = 'side'; });
    if (end) end.wall = 'end';
    const lastD = side.length ? side[side.length - 1].D : 6.0;
    const len = sec.last ? 14 : lastD + 7.0;
    const exit = sec.last ? 0 : (i % 2 === 0 ? 1 : -1);
    const artSide = sec.last ? (i % 2 === 0 ? 1 : -1) : exit;       // les œuvres sont du côté où l’on tournera
    const off = -exit * WALK_OFF;                                    // on marche de l’autre côté, pour mieux les voir
    const cs = Math.cos(th), sn = Math.sin(th), ox = door ? door.x - off * cs : 0, oz = door ? door.z + off * sn : 0;
    const room = { i, sec, len, exit, artSide, off, x: ox, z: oz, th, side, end, lastD, amb: .34, awake: false,
      toWorld: (x, y, z) => new THREE.Vector3(ox + x * cs + z * sn, y, oz - x * sn + z * cs) };
    Gal.rooms.push(room); sec.room = room; sec.items.forEach(it => { it.room = room; });
    if (exit) { const lx = exit * (ROOM_W / 2 + WALL_T), lz = -(len - EXIT_E); door = { x: ox + lx * cs + lz * sn, z: oz - lx * sn + lz * cs }; th -= exit * Math.PI / 2; }
  });
}

function buildPainting(it) {
  const f = it.frame === 'oak' ? .06 : .045, m = it.frame === 'white' ? .07 : .09, d = .05, md = d * .5;
  const aH = it.h, aW = it.h * it.ratio, W = aW + 2 * (m + f), H = aH + 2 * (m + f);
  Object.assign(it, { aW, aH, W, H, yc: Math.max(1.72, H / 2 + .5) });
  const b = new Batch(), fc = hexLin(FRAMES[it.frame]), sh = k => [Math.min(1, fc[0] * k), Math.min(1, fc[1] * k), Math.min(1, fc[2] * k)];
  const X0 = -W / 2, X1 = W / 2, Y0 = -H / 2, Y1 = H / 2, x0 = X0 + f, x1 = X1 - f, y0 = Y0 + f, y1 = Y1 - f, F = [0, 0, 9];
  b.quadTo([X0, y1, d], [X1, y1, d], [X1, Y1, d], [X0, Y1, d], F, sh(1));
  b.quadTo([X0, Y0, d], [X1, Y0, d], [X1, y0, d], [X0, y0, d], F, sh(.9));
  b.quadTo([X0, y0, d], [x0, y0, d], [x0, y1, d], [X0, y1, d], F, sh(.95));
  b.quadTo([x1, y0, d], [X1, y0, d], [X1, y1, d], [x1, y1, d], F, sh(.95));
  b.quadTo([X0, Y1, 0], [X1, Y1, 0], [X1, Y1, d], [X0, Y1, d], [0, 9, 0], sh(1.2));
  b.quadTo([X0, Y0, 0], [X1, Y0, 0], [X1, Y0, d], [X0, Y0, d], [0, -9, 0], sh(.45));
  b.quadTo([X0, Y0, 0], [X0, Y1, 0], [X0, Y1, d], [X0, Y0, d], [-9, 0, 0], sh(.7));
  b.quadTo([X1, Y0, 0], [X1, Y1, 0], [X1, Y1, d], [X1, Y0, d], [9, 0, 0], sh(.7));
  const ctr = [0, 0, d];
  b.quadTo([x0, y1, md], [x1, y1, md], [x1, y1, d], [x0, y1, d], ctr, sh(.45));
  b.quadTo([x0, y0, md], [x1, y0, md], [x1, y0, d], [x0, y0, d], ctr, sh(1.1));
  b.quadTo([x0, y0, md], [x0, y1, md], [x0, y1, d], [x0, y0, d], ctr, sh(.65));
  b.quadTo([x1, y0, md], [x1, y1, md], [x1, y1, d], [x1, y0, d], ctr, sh(.65));
  const wm = [lin(.975), lin(.968), lin(.955)], ws = [lin(.86), lin(.85), lin(.835)];
  b.quadTo([x0, y0, md], [x1, y0, md], [x1, y1, md], [x0, y1, md], F, null, null, [wm, wm, ws, ws]);
  const g = new THREE.Group();
  it.frameMat = new THREE.MeshBasicMaterial({ vertexColors: true });
  g.add(new THREE.Mesh(b.geo(), it.frameMat));
  it.canvas = makeArt(it);
  it.artMat = makeArtMat(mkTex(it.canvas));
  const art = new THREE.Mesh(Gal.unit, it.artMat); art.scale.set(aW, aH, 1); art.position.z = md + .003; g.add(art);
  return g;
}

function buildRoom(room) {
  const { len, exit, artSide, sec } = room, W2 = ROOM_W / 2, T = Gal.tex;
  const g = new THREE.Group(); g.position.set(room.x, 0, room.z); g.rotation.y = room.th;
  const solid = new THREE.Group(), flat = new THREE.Group(); g.add(solid, flat);
  Object.assign(room, { group: g, solid, flat });
  const fr = room.fr = {
    L: { o: [-W2, 0, 0], u: [0, 0, -1], n: [1, 0, 0], len },
    R: { o: [W2, 0, -len], u: [0, 0, 1], n: [-1, 0, 0], len },
    E: { o: [-W2, 0, -len], u: [1, 0, 0], n: [0, 0, 1], len: ROOM_W },
    B: { o: [W2, 0, 0], u: [-1, 0, 0], n: [0, 0, -1], len: ROOM_W },
  };
  const artKey = room.artKey = artSide < 0 ? 'L' : 'R', exitKey = exit > 0 ? 'R' : 'L';
  const uOf = (key, D) => key === 'L' ? D : len - D;
  const Dx = room.Dx = len - EXIT_E;
  const WHITE = hexLin('#E8E4DE'), WINE = hexLin('#6A0E1C'), accent = { white: WHITE, wine: WINE, ink: hexLin('#1d181a') }[sec.end];

  /* murs, plinthes, embrasure de la porte */
  const b = new Batch(), op = { L: [], R: [], E: [], B: [] };
  if (room.i > 0) op.B.push({ u0: W2 - room.off - DOOR_W / 2, u1: W2 - room.off + DOOR_W / 2, h: DOOR_H });
  if (exit) { const uc = uOf(exitKey, Dx); op[exitKey].push({ u0: uc - DOOR_W / 2, u1: uc + DOOR_W / 2, h: DOOR_H }); }
  addWall(b, fr.L, op.L, WHITE); addWall(b, fr.R, op.R, WHITE); addWall(b, fr.B, op.B, WHITE); addWall(b, fr.E, op.E, accent);
  const baseCol = hexLin('#D2CDC6');
  for (const key of ['L', 'R', 'B', 'E']) addBase(b, fr[key], op[key], key === 'E' && sec.end !== 'white' ? accent.map(v => v * .75) : baseCol);
  if (exit) {
    const xin = exit * W2, xout = exit * (W2 + WALL_T), z0 = -Dx - DOOR_W / 2, z1 = -Dx + DOOR_W / 2, ctr = [(xin + xout) / 2, DOOR_H / 2, -Dx], s = k => WINE.map(v => v * k);
    b.quadTo([xin, 0, z0], [xout, 0, z0], [xout, DOOR_H, z0], [xin, DOOR_H, z0], ctr, null, null, [s(.7), s(.7), s(1.05), s(1.05)]);
    b.quadTo([xin, 0, z1], [xout, 0, z1], [xout, DOOR_H, z1], [xin, DOOR_H, z1], ctr, null, null, [s(.7), s(.7), s(1.05), s(1.05)]);
    b.quadTo([xin, DOOR_H, z0], [xout, DOOR_H, z0], [xout, DOOR_H, z1], [xin, DOOR_H, z1], ctr, s(.55));
  }
  room.wallMat = new THREE.MeshBasicMaterial({ map: T.plaster, vertexColors: true });
  solid.add(new THREE.Mesh(b.geo(), room.wallMat));

  /* plafond */
  const cb = new Batch(), ua = artSide < 0 ? 0 : 1, ub = 1 - ua;
  cb.quadTo([-W2, ROOM_H, 0], [W2, ROOM_H, 0], [W2, ROOM_H, -len], [-W2, ROOM_H, -len], [0, 0, -len / 2], [1, 1, 1], [[ua, 0], [ub, 0], [ub, len / 3.6], [ua, len / 3.6]]);
  room.ceilMat = new THREE.MeshBasicMaterial({ map: T.ceil });
  solid.add(new THREE.Mesh(cb.geo(), room.ceilMat));

  /* sol (réfléchissant) */
  const fb = new Batch(), up = [0, 99, 0], st = .6;
  const aoF = (x, z) => {
    let dd = Math.min(exit > 0 ? x + W2 : W2 - x, z + len);
    const dExit = exit > 0 ? W2 - x : x + W2, inExit = exit && Math.abs(z + Dx) < DOOR_W / 2, inEntry = room.i > 0 && Math.abs(x - room.off) < DOOR_W / 2;
    if (!inExit) dd = Math.min(dd, dExit); if (!inEntry) dd = Math.min(dd, -z);
    const a = lin(1 - .26 * Math.exp(-Math.max(0, dd) / .42)); return [a, a, a];
  };
  const nx = Math.ceil(ROOM_W / st), nz = Math.ceil(len / st);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const xa = -W2 + i * ROOM_W / nx, xb = -W2 + (i + 1) * ROOM_W / nx, za = -j * len / nz, zb = -(j + 1) * len / nz;
    fb.quadTo([xa, 0, za], [xb, 0, za], [xb, 0, zb], [xa, 0, zb], up, null, null, [aoF(xa, za), aoF(xb, za), aoF(xb, zb), aoF(xa, zb)]);
  }
  if (exit) { const xin = exit * W2, xout = exit * (W2 + WALL_T), z0 = -Dx - DOOR_W / 2, z1 = -Dx + DOOR_W / 2, e = [lin(.72), lin(.72), lin(.72)], m = [lin(.9), lin(.9), lin(.9)];
    fb.quadTo([xin, 0, z0], [xout, 0, z0], [xout, 0, -Dx], [xin, 0, -Dx], up, null, null, [e, e, m, m]);
    fb.quadTo([xin, 0, -Dx], [xout, 0, -Dx], [xout, 0, z1], [xin, 0, z1], up, null, null, [m, m, e, e]); }
  const floor = new THREE.Mesh(fb.geo(), Gal.floorMat); floor.renderOrder = -5; flat.add(floor);

  room.dimMats = [];
  const decal = (tex, w, h, opts = {}) => { const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, ...opts }); const me = new THREE.Mesh(Gal.unit, mat); me.scale.set(w, h, 1); return me; };

  /* texte de salle sur le mur des œuvres */
  const wt = decal(texWallText(sec), 3.3, 2.2); mount(wt, fr[artKey], uOf(artKey, 6.6), 2.02, .006); solid.add(wt); room.dimMats.push(wt.material);

  /* grand chiffre de salle sur le mur d’en face */
  { const key = artKey === 'L' ? 'R' : 'L', nm = decal(texNumeral(sec.num), 2.9, 2.9); mount(nm, fr[key], uOf(key, 4.7), 2.12, .006); solid.add(nm); room.dimMats.push(nm.material); }

  /* œuvres */
  const hang = (it, key, u) => {
    const pg = buildPainting(it), f = fr[key];
    mount(pg, f, u, it.yc, .012); solid.add(pg);
    it.poolMat = new THREE.MeshBasicMaterial({ map: T.pool, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const pool = new THREE.Mesh(Gal.unit, it.poolMat); pool.scale.set(it.W + 2.0, Math.min(ROOM_H - .1, it.H + 1.9), 1);
    mount(pool, f, u, Math.min(ROOM_H - .05 - pool.scale.y / 2, it.yc + .3), .004); solid.add(pool);
    const shd = decal(T.shadow, it.W * 1.3, it.H * 1.3, { opacity: .42, color: 0x2a1f1a }); mount(shd, f, u + .02, it.yc - .08, .008); solid.add(shd);
    const lab = new THREE.Mesh(Gal.unit, new THREE.MeshBasicMaterial({ map: texCartel(it) })); lab.scale.set(.34, .22, 1);
    mount(lab, f, u + it.W / 2 + .36, 1.32, .011); solid.add(lab); it.labMat = lab.material;
    const hit = new THREE.Mesh(Gal.unit, new THREE.MeshBasicMaterial({ visible: false })); hit.scale.set(it.W + .1, it.H + .1, 1); mount(hit, f, u, it.yc, .09); hit.userData.item = it; flat.add(hit); Gal.hits.push(hit);
    /* spot sur rail */
    const sp = new THREE.Mesh(Gal.spotGeo, Gal.spotMat), dist = key === 'E' ? 1.9 : 1.72;
    sp.position.copy(wallPoint(f, u, ROOM_H - .16, dist)); sp.lookAt(wallPoint(f, u, it.yc, 0)); solid.add(sp);
    const stem = new THREE.Mesh(Gal.stemGeo, Gal.spotMat); stem.position.copy(wallPoint(f, u, ROOM_H - .06, dist)); solid.add(stem);
    it.local = wallPoint(f, u, it.yc, .06); it.nLocal = new THREE.Vector3(f.n[0], 0, f.n[2]); it.maxD = key === 'E' ? 9 : ROOM_W - .7;
  };
  room.side.forEach(it => hang(it, artKey, uOf(artKey, it.D)));
  if (room.end) hang(room.end, 'E', W2);

  /* plaque de la salle suivante, près de la porte */
  if (exit) { const nxt = SECTIONS[room.i + 1], pl = new THREE.Mesh(Gal.unit, new THREE.MeshBasicMaterial({ map: texPlaque(nxt) })); pl.scale.set(.6, .24, 1);
    mount(pl, fr[exitKey], uOf(exitKey, Dx + DOOR_W / 2 + .62), 1.56, .012); solid.add(pl); room.dimMats.push(pl.material); }

  /* banc contre le mur opposé aux œuvres */
  if (exit && room.side.length) {
    const bb = new Batch(), bx = -exit * (W2 - .44), bz = -(room.side[0].D + room.lastD) / 2 - (room.side.length === 1 ? 1.2 : 0), seat = hexLin('#6A0E1C'), leg = hexLin('#1b1618');
    bb.box(bx, .41, bz, .5, .1, 1.9, seat); bb.box(bx, .18, bz - .78, .42, .36, .06, leg); bb.box(bx, .18, bz + .78, .42, .36, .06, leg);
    room.benchMat = new THREE.MeshBasicMaterial({ vertexColors: true }); solid.add(new THREE.Mesh(bb.geo(), room.benchMat)); room.dimMats.push(room.benchMat);
    const bl = decal(T.blob, 1.1, 2.6, { opacity: .8 }); bl.rotation.x = -Math.PI / 2; bl.position.set(bx, .005, bz); flat.add(bl);
  }

  /* salle VI : vitrine du manuscrit */
  if (sec.vitrine) {
    const vb = new Batch(), vx = artSide * .7, vz = -6.6, white = hexLin('#EEEAE4');
    vb.box(vx, .47, vz, .8, .94, .8, white); vb.box(vx, .965, vz, .46, .05, .34, hexLin('#F4EFE6')); vb.box(vx, 1.0, vz, .48, .022, .36, hexLin('#6A0E1C'));
    const vm = new THREE.MeshBasicMaterial({ vertexColors: true }); solid.add(new THREE.Mesh(vb.geo(), vm)); room.dimMats.push(vm);
    const glassG = new THREE.BoxGeometry(.8, .5, .8), glass = new THREE.Mesh(glassG, new THREE.MeshBasicMaterial({ color: 0xe6f0f0, transparent: true, opacity: .13, depthWrite: false }));
    glass.position.set(vx, 1.19, vz); solid.add(glass);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(glassG), new THREE.LineBasicMaterial({ color: 0x8f9796, transparent: true, opacity: .7 })); edges.position.copy(glass.position); solid.add(edges);
    const bl = decal(T.blob, 1.7, 1.7, { opacity: .9 }); bl.rotation.x = -Math.PI / 2; bl.position.set(vx, .005, vz); flat.add(bl);
  }

  /* salle IV : projection sur le mur du fond */
  if (sec.screen) {
    drawFilm(0);
    const scr = new THREE.Mesh(Gal.unit, new THREE.MeshBasicMaterial({ map: FILM.tex, fog: false })); scr.scale.set(3.9, 2.19, 1); mount(scr, fr.E, W2, 2.05, .012); solid.add(scr); room.screen = scr;
    const pb = new Batch(), pz = -len + 4.6, dark = hexLin('#1b1618');
    pb.box(0, ROOM_H - .42, pz, .34, .18, .42, dark); pb.box(0, ROOM_H - .17, pz, .05, .34, .05, dark);
    solid.add(new THREE.Mesh(pb.geo(), new THREE.MeshBasicMaterial({ vertexColors: true })));
    const kb = new Batch(), a = [[-.05, ROOM_H - .45, pz - .21], [.05, ROOM_H - .45, pz - .21], [.05, ROOM_H - .39, pz - .21], [-.05, ROOM_H - .39, pz - .21]], zs = -len + .02, s2 = [[-1.95, .955, zs], [1.95, .955, zs], [1.95, 3.145, zs], [-1.95, 3.145, zs]];
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; kb.quad(a[i], a[j], s2[j], s2[i], [1, 1, 1]); }
    const cone = new THREE.Mesh(kb.geo(), new THREE.MeshBasicMaterial({ color: 0xfff4e8, transparent: true, opacity: .04, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); flat.add(cone);
  }

  /* salle VII : adresse en lettres collées au-dessus de l’œuvre */
  if (sec.last) { const vt = decal(texVinyl([CONFIG.email, 'INSTAGRAM  @' + CONFIG.instagram + '   ·   TIKTOK  @' + CONFIG.tiktok]), 4.6, 1.26); mount(vt, fr.E, W2, 3.62, .006); solid.add(vt); room.dimMats.push(vt.material); }

  /* reflet : la salle retournée sous le sol */
  const mir = solid.clone(true); mir.scale.y = -1;
  mir.traverse(o => { if (o.material && o.material.transparent) o.renderOrder = -10; });
  g.add(mir);
  Gal.scene.add(g);
}

function buildPath() {
  const pts = [], rr = [];
  Gal.rooms.forEach(room => {
    const off = room.off;
    if (room.i === 0) { pts.push(room.toWorld(off, 0, -1.0)); rr.push(0); }
    if (room.exit) { pts.push(room.toWorld(off, 0, -room.Dx)); rr.push(1.6); }
    else { pts.push(room.toWorld(0, 0, -(room.len - 6.9))); rr.push(0); }
  });
  const cp = new THREE.CurvePath(); let prev = pts[0];
  for (let i = 1; i < pts.length - 1; i++) {
    const Vt = pts[i], din = Vt.clone().sub(pts[i - 1]), dout = pts[i + 1].clone().sub(Vt), li = din.length(), lo = dout.length();
    const r = Math.min(rr[i], li * .48, lo * .48); din.normalize(); dout.normalize();
    const A = Vt.clone().addScaledVector(din, -r), B = Vt.clone().addScaledVector(dout, r);
    cp.add(new THREE.LineCurve3(prev, A)); cp.add(new THREE.QuadraticBezierCurve3(A, Vt, B)); prev = B;
  }
  cp.add(new THREE.LineCurve3(prev, pts[pts.length - 1]));
  Gal.len = cp.getLength(); Gal.N = Math.ceil(Gal.len / .05); Gal.pts = cp.getSpacedPoints(Gal.N);
  Gal.S0 = 0; Gal.S1 = Gal.len;
}
function pathAt(s, out) {
  const f = clamp(s / Gal.len, 0, 1) * Gal.N, i = Math.min(Gal.N - 1, Math.floor(f)), t = f - i, a = Gal.pts[i], b = Gal.pts[i + 1];
  out.set(lerp(a.x, b.x, t), 0, lerp(a.z, b.z, t));
  if (s > Gal.len) { const p = Gal.pts[Gal.N - 1], q = Gal.pts[Gal.N]; const dl = Math.hypot(q.x - p.x, q.z - p.z) || 1; out.x += (q.x - p.x) / dl * (s - Gal.len); out.z += (q.z - p.z) / dl * (s - Gal.len); }
  return out;
}
function sNear(p) { let best = 0, bd = 1e9; for (let i = 0; i <= Gal.N; i++) { const q = Gal.pts[i], d = (q.x - p.x) ** 2 + (q.z - p.z) ** 2; if (d < bd) { bd = d; best = i; } } return best / Gal.N * Gal.len; }

async function buildGallery(onProgress) {
  const T = Gal.tex;
  T.plaster = texPlaster(); T.concrete = texConcrete(); T.ceil = texCeiling(); T.pool = texPool(); T.shadow = texShadow(); T.blob = texBlob();
  Gal.unit = new THREE.PlaneGeometry(1, 1);
  Gal.spotGeo = new THREE.CylinderGeometry(.062, .042, .2, 12).rotateX(Math.PI / 2);
  Gal.stemGeo = new THREE.CylinderGeometry(.012, .012, .12, 6);
  Gal.spotMat = new THREE.MeshBasicMaterial({ color: 0x1a1617 });
  Gal.floorMat = makeFloorMat();
  Gal.scene = new THREE.Scene();
  Gal.fogCol = new THREE.Color('#ECE8E2');
  Gal.scene.background = Gal.fogCol; Gal.scene.fog = new THREE.Fog(Gal.fogCol, 9, 62);
  Gal.camera = new THREE.PerspectiveCamera(V.fov, V.asp, .08, 150);
  Gal.camera.rotation.order = 'YXZ';
  planRooms();
  let done = 0;
  for (const room of Gal.rooms) { buildRoom(room); done++; onProgress(done / Gal.rooms.length); await nextFrame(); }
  buildPath();
  Gal.scene.updateMatrixWorld(true);
  /* repères du parcours pour chaque salle et chaque œuvre */
  Gal.rooms.forEach(room => {
    const off = room.off;
    room.s0 = room.i === 0 ? 0 : sNear(room.toWorld(off, 0, 0));
    room.sB0 = room.s0 - 1.0;
    room.sB1 = room.side.length ? sNear(room.toWorld(off, 0, -(room.lastD + 2.8))) : room.s0;
    room.side.forEach(it => { it.sAt = sNear(room.toWorld(off, 0, -it.D)); it.sView = Math.max(room.s0 + .5, it.sAt - 3.0); });
    if (room.end) { const d = room.exit ? room.Dx - 4.4 : room.len - 7.8; room.end.sAt = sNear(room.toWorld(off, 0, -d)); room.end.sView = room.end.sAt; }
    room.items = room.sec.items;
    room.items.forEach(it => { it.center = room.group.localToWorld(it.local.clone()); it.normal = it.nLocal.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), room.th).normalize(); it.lit = 0; it.hov = 0; it.fw = 0; });
    const c = [[-1, 0], [1, 0], [1, -1], [-1, -1]].map(([sx, sz]) => room.toWorld(sx * ROOM_W / 2, 0, sz * room.len)); room.corners = c;
  });
  Gal.rooms.forEach((room, i) => { room.s1 = i < Gal.rooms.length - 1 ? Gal.rooms[i + 1].s0 : Gal.len; });
  /* fil rouge peint au sol */
  const rp = [], w = .02;
  for (let i = 0; i < Gal.N; i++) { const a = Gal.pts[i], b2 = Gal.pts[i + 1], dx = b2.x - a.x, dz = b2.z - a.z, l = Math.hypot(dx, dz) || 1, nx = dz / l * w, nz = -dx / l * w;
    rp.push(a.x + nx, .004, a.z + nz, a.x - nx, .004, a.z - nz, b2.x - nx, .004, b2.z - nz, a.x + nx, .004, a.z + nz, b2.x - nx, .004, b2.z - nz, b2.x + nx, .004, b2.z + nz); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3));
  const line = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: 0x6E0F1E, side: THREE.DoubleSide })); line.renderOrder = -4; line.frustumCulled = false; Gal.scene.add(line);
  /* poussière dans la lumière */
  const DN = V.small ? 700 : 1500, dp = new Float32Array(DN * 3), R = rng(5);
  for (let i = 0; i < DN; i++) { const q = Gal.pts[Math.floor(R() * Gal.N)]; dp[i * 3] = q.x + (R() - .5) * 5; dp[i * 3 + 1] = .3 + R() * 3.6; dp[i * 3 + 2] = q.z + (R() - .5) * 5; }
  Gal.dust = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(dp, 3)), new THREE.PointsMaterial({ color: 0xffffff, size: .013, transparent: true, opacity: .5, depthWrite: false }));
  Gal.dust.frustumCulled = false; Gal.scene.add(Gal.dust);
}
