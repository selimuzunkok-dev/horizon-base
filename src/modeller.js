

const MODEL = (() => {
  const T = THREE, PI = Math.PI;
  const lin = h => new T.Color(h).convertSRGBToLinear();


  const TX = {};
  function tex(key, w, h, draw, rx, ry) {
    if (TX[key]) return TX[key];
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4;
    if (rx) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry || rx); }
    return (TX[key] = t);
  }
  let seedR = 7;
  const r0 = () => { seedR = (seedR * 16807) % 2147483647; return seedR / 2147483647; };
  const TEX = {
    hull: () => tex('hull', 256, 256, (g, w, h) => {
      g.fillStyle = '#ecebe6'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${r0() * 0.035})`; g.fillRect(r0() * w, r0() * h, 3, 3); }
      g.strokeStyle = 'rgba(120,118,110,.35)'; g.lineWidth = 2;
      for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
      for (let y = 0; y <= h; y += 128) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.fillStyle = 'rgba(90,90,90,.35)';
      for (let x = 6; x < w; x += 64) for (let y = 8; y < h; y += 16) { g.fillRect(x - 1, y, 2, 2); g.fillRect(x + 50, y, 2, 2); }
    }),
    foil: () => tex('foil', 128, 128, (g, w, h) => {
      g.fillStyle = '#c99a3a'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 140; i++) {
        const x = r0() * w, y = r0() * h, s = 6 + r0() * 18, l = r0();
        g.fillStyle = l > 0.5 ? `rgba(255,226,140,${(l - 0.5) * 0.9})` : `rgba(90,55,10,${(0.5 - l) * 0.7})`;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + s, y + r0() * s * 0.6); g.lineTo(x + r0() * s * 0.5, y + s); g.fill();
      }
    }, 2, 2),
    cells: () => tex('cells', 128, 128, (g, w, h) => {
      g.fillStyle = '#0d1d4d'; g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 16) for (let y = 0; y < h; y += 16) {
        g.fillStyle = (x + y) % 32 ? '#1a3378' : '#17306f'; g.fillRect(x + 1, y + 1, 14, 14);
        g.fillStyle = 'rgba(160,190,255,.25)'; g.fillRect(x + 1, y + 1, 14, 2);
      }
      g.fillStyle = 'rgba(210,215,225,.55)'; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 2, h);
    }, 2, 2),
    pad: () => tex('pad', 512, 512, (g, w, h) => {
      g.fillStyle = '#86847d'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 4000; i++) { const v = 90 + r0() * 70 | 0; g.fillStyle = `rgba(${v},${v - 2},${v - 6},.35)`; g.fillRect(r0() * w, r0() * h, 2, 2); }
      const c = w / 2;
      g.strokeStyle = '#e8b62c'; g.lineWidth = 18; g.beginPath(); g.arc(c, c, 224, 0, PI * 2); g.stroke();
      g.strokeStyle = '#f2f0ea'; g.lineWidth = 10; g.beginPath(); g.arc(c, c, 150, 0, PI * 2); g.stroke();
      g.setLineDash([26, 22]); g.lineWidth = 6; g.beginPath(); g.arc(c, c, 190, 0, PI * 2); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#f2f0ea'; g.fillRect(c - 70, c - 85, 30, 170); g.fillRect(c + 40, c - 85, 30, 170); g.fillRect(c - 40, c - 15, 80, 30);
      g.fillStyle = '#e8b62c';
      for (let k = 0; k < 4; k++) { g.save(); g.translate(c, c); g.rotate(k * PI / 2 + PI / 4); g.beginPath(); g.moveTo(-26, -205); g.lineTo(0, -180); g.lineTo(26, -205); g.lineTo(26, -190); g.lineTo(0, -165); g.lineTo(-26, -190); g.fill(); g.restore(); }
      g.strokeStyle = 'rgba(40,38,34,.35)'; g.lineWidth = 2;
      for (let x = 0; x < w; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); }
    }),
    hazard: () => tex('hazard', 64, 16, (g, w, h) => {
      g.fillStyle = '#e8b62c'; g.fillRect(0, 0, w, h); g.fillStyle = '#1d1d1f';
      for (let x = -16; x < w; x += 16) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 8, h); g.lineTo(x + 16, 0); g.lineTo(x + 8, 0); g.fill(); }
    }, 6, 1),
    grille: () => tex('grille', 64, 64, (g, w, h) => {
      g.fillStyle = '#3a3c42'; g.fillRect(0, 0, w, h); g.fillStyle = '#121316';
      for (let y = 4; y < h; y += 8) g.fillRect(3, y, w - 6, 4);
    }),
    radiator: () => tex('radiator', 128, 128, (g, w, h) => {
      g.fillStyle = '#d9dde2'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(70,80,95,.45)';
      for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 2, h);
    }),
    chute: () => tex('chute', 256, 128, (g, w, h) => {
      for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 3 === 0 ? '#e9632b' : '#f3efe6'; g.fillRect(i * 16, j * 32, 16, 32); }
      g.strokeStyle = 'rgba(80,60,40,.4)'; for (let i = 0; i < 16; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, h); g.stroke(); }
      g.fillStyle = 'rgba(170,110,70,.35)'; for (let i = 0; i < 300; i++) g.fillRect(r0() * w, r0() * h, 4, 3);
    }),
    tread: () => tex('tread', 32, 128, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(25,25,28,.55)'; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(10,10,12,.75)'; for (let y = 0; y < h; y += 12) g.fillRect(2, y, w - 4, 5);
    }, 1, 4),
    ore: () => tex('ore', 128, 128, (g, w, h) => {
      g.fillStyle = '#3a3533'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { const l = r0(); g.fillStyle = l > 0.7 ? '#e88a35' : l > 0.4 ? '#56504c' : '#211e1d'; g.fillRect(r0() * w, r0() * h, 2 + r0() * 4, 2 + r0() * 3); }
    }),
    soil: () => tex('soil', 128, 128, (g, w, h) => {
      g.fillStyle = '#cfcfcf'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 1400; i++) { const v = 150 + r0() * 105 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(r0() * w, r0() * h, 1 + r0() * 3, 1 + r0() * 3); }
    }, 3, 3),
    halo: () => tex('halo', 64, 64, (g, w) => {
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, w);
    }),
    patch: () => patchTex(),
    flame: () => tex('flame', 64, 128, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, 'rgba(255,250,230,1)'); gr.addColorStop(0.3, 'rgba(255,190,90,.9)'); gr.addColorStop(1, 'rgba(255,90,20,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }),
  };


  const PATCH_DEF = { shape: 'daire', bg: '#2f5fa8', sym: 'yildiz', text: '' };
  let patchCv = null, patchTx = null, patchSpec = PATCH_DEF, patchKey = '';
  const isHex = h => typeof h === 'string' && /^#[0-9a-f]{6}$/i.test(h);
  function drawPatchCv() {
    if (!patchCv) return;
    const g = patchCv.getContext('2d'), S = patchCv.width;
    if (typeof drawPatch === 'function') { try { drawPatch(g, patchSpec, S); return; } catch (e) {   } }
    g.clearRect(0, 0, S, S);
    g.beginPath(); g.arc(S / 2, S / 2, S * 0.47, 0, PI * 2); g.fillStyle = isHex(patchSpec.ring) ? patchSpec.ring : '#e6e5e0'; g.fill();
    g.beginPath(); g.arc(S / 2, S / 2, S * 0.38, 0, PI * 2); g.fillStyle = isHex(patchSpec.bg) ? patchSpec.bg : '#2f5fa8'; g.fill();
  }
  function patchTex() {
    if (patchTx) return patchTx;
    patchCv = document.createElement('canvas'); patchCv.width = patchCv.height = 256;
    drawPatchCv();
    patchTx = new T.CanvasTexture(patchCv); patchTx.encoding = T.sRGBEncoding; patchTx.anisotropy = 4;
    return patchTx;
  }
  function setPatch(p) {
    const sp = p && typeof p === 'object' ? Object.assign({}, PATCH_DEF, p) : PATCH_DEF, k = JSON.stringify(sp);
    if (k === patchKey) return false;
    patchSpec = sp; patchKey = k;
    if (patchTx) { drawPatchCv(); patchTx.needsUpdate = true; }
    return true;
  }


  const DEF = {
    hull: { c: '#ffffff', map: 'hull', r: 0.62, m: 0.05 },
    hull2: { c: '#b4b8be', r: 0.55, m: 0.15 },
    white: { c: '#e6e5e0', r: 0.6, m: 0.05 },
    dark: { c: '#2c2f35', r: 0.5, m: 0.35 },
    metal: { c: '#9aa0a8', r: 0.38, m: 0.55 },
    gold: { c: '#ffffff', map: 'foil', r: 0.4, m: 0.45, flat: true },
    solar: { c: '#ffffff', map: 'cells', r: 0.25, m: 0.3 },
    back: { c: '#d0d0cb', r: 0.7, m: 0.1 },
    pack: { c: '#f2f1ec', r: 0.5, m: 0.05, e: '#dfe3ea', ei: 0.1 },
    glass: { c: '#cfe9ff', r: 0.08, m: 0.1, op: 0.22 },
    win: { c: '#2a1a06', e: '#f2a33a', ei: 1.1 },
    lampR: { c: '#300806', e: '#ff3b2e', ei: 1.8 },
    lampA: { c: '#2a1a06', e: '#ffb347', ei: 1.6 },
    lampG: { c: '#062a10', e: '#4cff7a', ei: 1.6 },
    lampC: { c: '#06202a', e: '#38d6ff', ei: 1.6 },
    slit: { c: '#331000', e: '#ff6a1a', ei: 2.6 },
    grow: { c: '#2a0a28', e: '#e04bd8', ei: 2.4 },
    growGlass: { c: '#f0c8ff', r: 0.08, m: 0.1, op: 0.3, e: '#d03cc8', ei: 0.35 },
    plant: { c: '#4fae46', r: 0.85, flat: true },
    plant2: { c: '#2f8a3c', r: 0.85, flat: true },
    trough: { c: '#e0ddd5', r: 0.7 },
    ind: { c: '#e8a21e', r: 0.5, m: 0.15 },
    belt: { c: '#1d1e21', r: 0.9 },
    accent: { c: '#2f5fa8', r: 0.5, m: 0.1 },

    bldTrim: { c: '#2f5fa8', r: 0.5, m: 0.1, e: '#2f5fa8', ei: 0.35 },
    craftBand: { c: '#2f5fa8', r: 0.5, m: 0.1 },
    craftNose: { c: '#c8372d', r: 0.5 },
    roverBody: { c: '#e6e5e0', r: 0.55, m: 0.08 },
    roverTrim: { c: '#2f5fa8', r: 0.5, m: 0.1 },
    teal: { c: '#2fb6c9', r: 0.5, m: 0.1 },
    red: { c: '#c8372d', r: 0.5 },
    radiator: { c: '#ffffff', map: 'radiator', r: 0.45, m: 0.25 },
    hazard: { c: '#ffffff', map: 'hazard', r: 0.6 },
    grille: { c: '#ffffff', map: 'grille', r: 0.6, m: 0.3 },
    pad: { c: '#ffffff', map: 'pad', r: 0.92 },
    padSide: { c: '#6d6b66', r: 0.95 },
    berm: { c: '#8a8a86', r: 0.95, flat: true },
    tire: { c: '#1a1a1c', r: 0.9 },
    visor: { c: '#b8862c', r: 0.16, m: 0.75 },
    ice: { c: '#d8f1ff', r: 0.18, m: 0.05, e: '#5fb8ff', ei: 0.25, op: 0.88, flat: true },
    iceSheet: { c: '#bfe0f2', r: 0.3, e: '#3f8fd0', ei: 0.12, flat: true },
    ore: { c: '#ffffff', map: 'ore', r: 0.7, m: 0.3, flat: true },
    fleck: { c: '#e88a35', r: 0.3, m: 0.7, e: '#c25a10', ei: 0.35, flat: true },
    rockAy: { c: '#7b7b78', r: 0.95, flat: true },
    rockMars: { c: '#7a3a27', r: 0.95, flat: true },
    basaltAy: { c: '#3a3a3d', r: 0.9, flat: true },
    basaltMars: { c: '#3d2621', r: 0.9, flat: true },
    dustAy: { c: '#a3a29c', r: 0.95 },
    dustMars: { c: '#b9774f', r: 0.95 },
    frost: { c: '#e9f6ff', r: 0.3, e: '#9fd4ff', ei: 0.15 },
    chute: { c: '#ffffff', map: 'chute', r: 0.85, side: 2 },
    tread: { c: '#ffffff', map: 'tread', r: 1, op: 1, alphaTest: 0.02 },
    printed: { c: '#9b948a', r: 0.95, flat: true },
    patch: { c: '#ffffff', map: 'patch', r: 0.7, alphaTest: 0.5, po: true },
  };
  const MC = {};
  function mat(key) {
    if (MC[key]) return MC[key];
    const d = DEF[key], o = { color: lin(d.c), roughness: d.r == null ? 0.6 : d.r, metalness: d.m || 0 };
    if (d.map) o.map = TEX[d.map]();
    if (d.e) { o.emissive = lin(d.e); o.emissiveIntensity = d.ei; }
    if (d.op != null) { o.transparent = true; o.opacity = d.op; if (d.op < 0.6) o.depthWrite = false; }
    if (d.alphaTest) o.alphaTest = d.alphaTest;
    if (d.flat) o.flatShading = true;
    if (d.side || d.op != null) o.side = T.DoubleSide;
    if (d.map === 'tread' || d.po) { o.polygonOffset = true; o.polygonOffsetFactor = -2; }
    return (MC[key] = new T.MeshStandardMaterial(o));
  }
  function soilMat(hex) {
    const k = 'soil' + hex;
    return MC[k] || (MC[k] = new T.MeshStandardMaterial({ color: lin(hex), map: TEX.soil(), roughness: 0.97 }));
  }
  function suitMat(hex) {
    const k = 'suit' + hex;
    return MC[k] || (MC[k] = new T.MeshStandardMaterial({ color: lin(hex), roughness: 0.55 }));
  }
  const SPRM = {};
  function haloMat(hex) {
    return SPRM[hex] || (SPRM[hex] = new T.SpriteMaterial({ map: TEX.halo(), color: lin(hex), blending: T.AdditiveBlending, transparent: true, opacity: 0.55, depthWrite: false }));
  }


  const GC = {};
  const gk = (k, f) => GC[k] || (GC[k] = f());
  const box = (w, h, d) => gk(`b${w},${h},${d}`, () => new T.BoxGeometry(w, h, d));
  const cyl = (rt, rb, h, s = 12, open = false, ts = 0, tl = PI * 2) => gk(`c${rt},${rb},${h},${s},${open},${ts},${tl}`, () => new T.CylinderGeometry(rt, rb, h, s, 1, open, ts, tl));
  const sph = (r, ws = 12, hs = 8, ps = 0, pl = PI * 2, ts = 0, tl = PI) => gk(`s${r},${ws},${hs},${ps},${pl},${ts},${tl}`, () => new T.SphereGeometry(r, ws, hs, ps, pl, ts, tl));
  const tor = (r, t, rs, ts, arc = PI * 2) => gk(`t${r},${t},${rs},${ts},${arc}`, () => new T.TorusGeometry(r, t, rs, ts, arc));
  const UP = new T.Vector3(0, 1, 0);

  function mk(p, geo, mt, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
    const o = new T.Mesh(geo, mt); o.position.set(x, y, z); o.rotation.set(rx, ry, rz);
    const shadow = !(mt.transparent || (mt.emissiveIntensity > 1));
    o.castShadow = shadow; o.receiveShadow = true; p.add(o); return o;
  }
  function strut(p, a, b, r, mt) {
    const A = new T.Vector3(a[0], a[1], a[2]), d = new T.Vector3(b[0], b[1], b[2]).sub(A), L = d.length();
    const m = new T.Mesh(gk('strut', () => new T.CylinderGeometry(1, 1, 1, 6, 1, true)), mt);
    m.scale.set(r, L, r); m.position.copy(A).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(UP, d.normalize());
    m.castShadow = true; m.receiveShadow = true; p.add(m); return m;
  }
  function halo(p, x, y, z, hex, s = 0.9) {
    const sp = new T.Sprite(haloMat(hex)); sp.position.set(x, y, z); sp.scale.set(s, s, s); p.add(sp); return sp;
  }

  function patchAt(p, x, y, z, rx, ry, rz, size) {
    const o = mk(p, gk('patchG', () => new T.PlaneGeometry(1, 1)), mat('patch'), x, y, z, rx, ry, rz);
    o.scale.set(size, size, 1); o.castShadow = false; o.name = 'patch'; return o;
  }
  function lattice(p, n, rb, rt, y0, h, lv, r, mt, rot = 0) {
    const pt = (i, f) => { const a = rot + i / n * PI * 2, rr = rb + (rt - rb) * f; return [Math.sin(a) * rr, y0 + h * f, Math.cos(a) * rr]; };
    for (let i = 0; i < n; i++) {
      strut(p, pt(i, 0), pt(i, 1), r, mt);
      for (let k = 0; k < lv; k++) {
        const f0 = k / lv, f1 = (k + 1) / lv;
        strut(p, pt(i, f1), pt(i + 1, f1), r * 0.6, mt);
        strut(p, pt(i, f0), pt(i + 1, f1), r * 0.5, mt);
      }
    }
  }
  function newGroup(h, r) {
    const g = new T.Group();
    g.userData = { h, r, anim: [], sunTrack: null, nightMats: [], workMats: [] };
    return g;
  }
  const nm = (g, key) => { const m = mat(key); if (!g.userData.nightMats.includes(m)) g.userData.nightMats.push(m); return m; };
  const wm = (g, key) => { const m = mat(key).clone(); g.userData.workMats.push(m); return m; };
  function radiusOf(g) {
    let r = 0; const v = new T.Vector3();
    g.updateMatrixWorld(true);
    g.traverse(o => { if (o.isMesh) { o.geometry.computeBoundingSphere(); const bs = o.geometry.boundingSphere; v.copy(bs.center).applyMatrix4(o.matrixWorld); const s = o.matrixWorld.getMaxScaleOnAxis(); r = Math.max(r, Math.hypot(v.x, v.z) + bs.radius * s * 0.7); } });
    return r;
  }


  function tankX(p, x, y, z, r, len, band) {
    const t = new T.Group(); t.position.set(x, y, z); p.add(t);
    mk(t, cyl(r, r, len, 12), mat('white'), 0, 0, 0, 0, 0, PI / 2);
    mk(t, sph(r, 12, 6, 0, PI * 2, 0, PI / 2), mat('white'), len / 2, 0, 0, 0, 0, -PI / 2).scale.set(1, 0.5, 1);
    mk(t, sph(r, 12, 6, 0, PI * 2, 0, PI / 2), mat('white'), -len / 2, 0, 0, 0, 0, PI / 2).scale.set(1, 0.5, 1);
    if (band) mk(t, cyl(r * 1.03, r * 1.03, 0.16, 12, true), mat(band), 0, 0, 0, 0, 0, PI / 2);
    for (const sx of [-len * 0.3, len * 0.3]) mk(t, box(0.18, r + 0.05, r * 1.4), mat('hull2'), sx, -r * 0.55, 0);
    return t;
  }
  function door(p, x, y, z, ry, g, w = 0.85, h = 1.25) {
    const d = new T.Group(); d.position.set(x, y, z); d.rotation.y = ry; p.add(d);
    mk(d, box(w + 0.2, h + 0.2, 0.1), mat('hull2'), 0, h / 2, 0);
    mk(d, box(w, h, 0.12), mat('dark'), 0, h / 2, 0.02);
    mk(d, box(0.32, 0.22, 0.13), nm(g, 'win'), 0, h * 0.72, 0.03);
    mk(d, box(w + 0.1, 0.06, 0.14), nm(g, 'lampA'), 0, h + 0.14, 0.02);
    halo(d, 0, h + 0.2, 0.2, '#f2a33a', 0.9);
    return d;
  }
  function windowRing(p, g, r, y, n, a0, a1, w = 0.42, h = 0.3) {
    for (let i = 0; i < n; i++) {
      const a = a0 + (a1 - a0) * (n === 1 ? 0.5 : i / (n - 1));
      mk(p, box(w, h, 0.1), nm(g, 'win'), Math.sin(a) * r, y, Math.cos(a) * r, 0, a, 0);
    }
  }
  function beacon(p, g, x, y, z, key = 'lampR', hex = '#ff3b2e') {
    mk(p, sph(0.09, 8, 6), nm(g, key), x, y, z); halo(p, x, y, z, hex, 0.8);
  }


  const B = {};

  B.hub = (w) => {
    const g = newGroup(5.4, 2.9);

    for (let i = 0; i < 4; i++) {
      const a = PI / 4 + i * PI / 2, s = Math.sin(a), c = Math.cos(a);
      const fx = s * 2.75, fz = c * 2.75;
      strut(g, [s * 1.6, 1.7, c * 1.6], [fx, 0.12, fz], 0.09, mat('metal'));
      strut(g, [s * 1.7, 0.95, c * 1.7], [fx, 0.12, fz], 0.06, mat('metal'));
      mk(g, cyl(0.38, 0.42, 0.1, 10), mat('hull2'), fx, 0.05, fz);
    }

    mk(g, cyl(1.9, 1.9, 1.2, 8), mat('gold'), 0, 1.5, 0, 0, PI / 8, 0);
    mk(g, cyl(1.92, 1.92, 0.08, 8), mat('dark'), 0, 2.08, 0, 0, PI / 8, 0);
    mk(g, cyl(0.32, 0.62, 0.6, 12, true), mat('dark'), 0, 0.62, 0);

    mk(g, cyl(1.5, 1.5, 1.6, 12), mat('hull'), 0, 2.9, 0);
    mk(g, cyl(0.95, 1.5, 0.5, 12), mat('hull'), 0, 3.95, 0);
    mk(g, cyl(1.52, 1.52, 0.14, 12, true), mat('craftBand'), 0, 3.45, 0);
    mk(g, cyl(0.45, 0.45, 0.16, 10), mat('hull2'), 0, 4.28, 0);
    patchAt(g, 0, 4.37, 0, -PI / 2, 0, 0, 0.84);
    patchAt(g, 1.525, 2.85, 0, 0, PI / 2, 0, 0.95);
    patchAt(g, 0, 3.96, 1.255, -0.833, 0, 0, 0.5);
    windowRing(g, g, 1.47, 3.1, 2, -0.75, 0.75, 0.36, 0.3);
    windowRing(g, g, 1.47, 3.1, 2, PI - 0.6, PI + 0.6, 0.36, 0.3);

    door(g, 0, 2.18, 1.44, 0, g);
    mk(g, box(1.2, 0.08, 0.7), mat('hull2'), 0, 2.12, 2.05);
    for (const sx of [-0.32, 0.32]) strut(g, [sx, 2.1, 2.35], [sx, 0.05, 2.95], 0.035, mat('metal'));
    for (let i = 1; i < 7; i++) { const f = i / 7; mk(g, box(0.64, 0.04, 0.05), mat('metal'), 0, 2.1 - 2.05 * f, 2.35 + 0.6 * f); }

    const rtg = new T.Group(); rtg.position.set(-2.35, 1.9, 0); g.add(rtg);
    mk(rtg, cyl(0.22, 0.22, 1.1, 10), mat('dark'));
    for (let i = 0; i < 8; i++) { const a = i * PI / 4; mk(rtg, box(0.02, 0.95, 0.32), mat('dark'), Math.sin(a) * 0.32, 0, Math.cos(a) * 0.32, 0, a, 0); }
    mk(rtg, cyl(0.12, 0.12, 0.08, 8), wm(g, 'slit'), 0, 0.59, 0);
    strut(g, [-1.75, 1.5, 0], [-2.2, 1.7, 0], 0.05, mat('metal')); strut(g, [-1.75, 2.0, 0], [-2.2, 2.2, 0], 0.05, mat('metal'));

    strut(g, [0, 4.3, 0], [0, 5.0, 0], 0.05, mat('metal'));
    const ant = new T.Group(); ant.position.set(0, 5.0, 0); g.add(ant);
    const dish = mk(ant, sph(0.5, 12, 4, 0, PI * 2, 0, 0.9), mat('white'), 0.2, 0.1, 0, 0, 0, -1.0); dish.material = mat('white');
    strut(ant, [0, 0, 0], [0.35, 0.05, 0], 0.03, mat('metal'));
    g.userData.anim.push({ o: ant, axis: 'y', speed: 0.15 });
    strut(g, [0.6, 4.1, -0.5], [0.6, 5.4, -0.5], 0.015, mat('metal'));
    beacon(g, g, 0.6, 5.42, -0.5);

    for (const sx of [-1, 1]) { mk(g, box(0.3, 0.18, 0.18), nm(g, 'lampA'), sx * 1.05, 4.0, 0.95, -0.4, sx * 0.6, 0); halo(g, sx * 1.1, 4.0, 1.05, '#ffb347', 1.1); }
    return g;
  };

  B.gunes = (w) => {
    const g = newGroup(4.0, 1.0);
    for (let i = 0; i < 3; i++) { const a = i * PI * 2 / 3; strut(g, [0, 0.9, 0], [Math.sin(a) * 1.1, 0.02, Math.cos(a) * 1.1], 0.06, mat('metal')); }
    mk(g, cyl(0.12, 0.16, 2.7, 8), mat('hull2'), 0, 1.35, 0);
    mk(g, box(0.4, 0.4, 0.4), mat('white'), 0, 2.75, 0);
    const tr = new T.Group(); tr.position.set(0, 2.8, 0); tr.rotation.x = -0.6; g.add(tr);
    g.userData.sunTrack = tr;
    mk(tr, box(6.2, 0.1, 0.1), mat('metal'), 0, 0, -0.12);
    const pm = [mat('metal'), mat('metal'), mat('metal'), mat('metal'), mat('solar'), mat('back')];
    for (const sx of [-1.55, 1.55]) {
      const pn = mk(tr, box(2.9, 2.3, 0.06), pm, sx, 0, 0); pn.material = pm;
      for (const yy of [-1.15, 1.15]) mk(tr, box(2.92, 0.05, 0.09), mat('white'), sx, yy, 0);
    }
    mk(g, box(0.3, 0.25, 0.2), wm(g, 'lampG'), 0, 2.3, 0.17);
    return g;
  };

  B.batarya = (w) => {
    const g = newGroup(2.0, 2.2);
    mk(g, box(3.8, 0.22, 2.6), mat('hull2'), 0, 0.11, 0);
    for (const x of [-1.2, 0, 1.2]) {
      mk(g, cyl(0.52, 0.52, 1.5, 14), mat('hull'), x, 0.97, -0.35);
      mk(g, cyl(0.54, 0.54, 0.22, 14, true), mat('bldTrim'), x, 1.25, -0.35);
      mk(g, cyl(0.36, 0.44, 0.14, 14), mat('metal'), x, 1.78, -0.35);
      mk(g, cyl(0.08, 0.08, 0.16, 6), mat('dark'), x, 1.9, -0.35);
    }
    mk(g, box(3.4, 0.95, 0.55), mat('dark'), 0, 0.7, 0.85);
    const lm = wm(g, 'lampG');
    for (let i = 0; i < 6; i++) mk(g, box(0.38, 0.12, 0.03), i < 4 ? lm : mat('hull2'), -1.15 + i * 0.46, 0.92, 1.13);
    mk(g, box(3.0, 0.05, 0.03), nm(g, 'lampA'), 0, 0.5, 1.13);
    strut(g, [-1.7, 0.9, 0.7], [-1.7, 0.9, -0.35], 0.05, mat('metal'));
    strut(g, [1.7, 0.9, 0.7], [1.7, 0.9, -0.35], 0.05, mat('metal'));
    return g;
  };

  B.reaktor = (w) => {
    const g = newGroup(4.7, 1.8);
    mk(g, cyl(1.6, 2.3, 0.55, 14), mat('berm'), 0, 0.27, 0);
    mk(g, cyl(0.85, 0.85, 0.4, 14), mat('metal'), 0, 0.7, 0);
    mk(g, cyl(0.87, 0.87, 0.14, 14, true), mat('hazard'), 0, 0.72, 0);
    mk(g, cyl(0.18, 0.24, 2.7, 8), mat('hull2'), 0, 2.2, 0);
    for (let i = 0; i < 4; i++) { const a = i * PI / 2 + PI / 4; mk(g, cyl(0.15, 0.15, 0.7, 8), mat('gold'), Math.sin(a) * 0.38, 1.4, Math.cos(a) * 0.38); }

    mk(g, cyl(0.12, 2.6, 1.3, 12, true), mat('radiator'), 0, 3.85, 0);
    for (let i = 0; i < 12; i++) { const a = i * PI / 6; strut(g, [0, 4.5, 0], [Math.sin(a) * 2.62, 3.2, Math.cos(a) * 2.62], 0.035, mat('dark')); }
    mk(g, cyl(0.2, 0.2, 0.3, 8), mat('dark'), 0, 4.55, 0);
    mk(g, sph(0.1, 8, 6), wm(g, 'lampC'), 0, 4.75, 0); halo(g, 0, 4.75, 0, '#38d6ff', 0.8);
    beacon(g, g, 0, 1.1, 0.9);
    return g;
  };

  B.oksijen = (w) => {
    const g = newGroup(3.2, 2.6);
    if (w === 'mars') {

      mk(g, box(2.4, 1.7, 1.8), mat('gold'), -0.3, 0.95, 0);
      mk(g, box(2.5, 0.12, 1.9), mat('white'), -0.3, 1.86, 0);
      mk(g, box(1.3, 1.0, 0.06), mat('grille'), -0.3, 1.0, 0.92);
      const fan = new T.Group(); fan.position.set(-0.3, 1.0, 0.98); g.add(fan);
      mk(fan, cyl(0.1, 0.1, 0.1, 8), mat('metal'), 0, 0, 0, PI / 2, 0, 0);
      for (let i = 0; i < 4; i++) mk(fan, box(0.08, 0.42, 0.02), mat('metal'), Math.sin(i * PI / 2) * 0.22, Math.cos(i * PI / 2) * 0.22, 0, 0, 0, -i * PI / 2 + 0.3);
      g.userData.anim.push({ o: fan, axis: 'z', speed: 6 });
      mk(g, cyl(0.3, 0.38, 0.6, 10), mat('hull2'), -1.1, 2.1, -0.4);
      mk(g, box(0.5, 0.1, 0.03), wm(g, 'lampG'), 0.4, 1.6, 0.92);
    } else {

      mk(g, box(2.4, 1.9, 1.9), mat('hull2'), -0.3, 0.95, 0);
      mk(g, box(2.5, 0.2, 2.0), mat('dark'), -0.3, 0.1, 0);
      mk(g, cyl(0.95, 0.45, 0.8, 4), mat('metal'), -0.3, 2.3, 0, 0, PI / 4, 0);
      mk(g, box(1.7, 0.16, 0.06), wm(g, 'slit'), -0.3, 1.0, 0.95);
      mk(g, box(1.9, 0.5, 0.04), mat('dark'), -0.3, 1.0, 0.94);
      halo(g, -0.3, 1.0, 1.15, '#ff6a1a', 1.2);
      mk(g, cyl(0.16, 0.2, 1.3, 8), mat('dark'), -1.2, 2.5, -0.6);
      mk(g, box(0.6, 0.6, 0.06), mat('radiator'), 0.92, 1.3, 0, 0, PI / 2, 0);
    }
    tankX(g, 1.9, 0.75, 0, 0.5, 1.6, 'lampC').rotation.y = PI / 2;
    strut(g, [0.9, 1.4, 0], [1.9, 1.25, 0], 0.06, mat('metal'));
    return g;
  };

  B.su = (w) => {
    const g = newGroup(5.2, 2.6);
    mk(g, box(2.4, 0.2, 2.4), mat('hull2'), -0.6, 0.1, 0);
    const dr = new T.Group(); dr.position.x = -0.6; g.add(dr);
    lattice(dr, 4, 1.05, 0.32, 0.2, 4.4, 4, 0.06, mat('ind'), PI / 4);
    const top = new T.Group(); top.position.set(-0.6, 4.4, 0); g.add(top);
    mk(top, box(0.55, 0.5, 0.55), mat('white'));
    mk(top, box(0.57, 0.12, 0.57), mat('bldTrim'), 0, 0.1, 0);
    g.userData.anim.push({ o: top, axis: 'y', speed: 1.4 });
    mk(g, cyl(0.08, 0.08, 4.2, 6), mat('metal'), -0.6, 2.2, 0);
    mk(g, cyl(0.32, 0.32, 0.4, 10), mat('dark'), -0.6, 0.4, 0);

    mk(g, cyl(0.85, 0.85, 1.9, 14), mat('hull'), 1.6, 1.0, -0.4);
    mk(g, sph(0.85, 14, 6, 0, PI * 2, 0, PI / 2), mat('hull'), 1.6, 1.95, -0.4).scale.set(1, 0.45, 1);
    mk(g, box(0.2, 1.3, 0.05), wm(g, 'lampC'), 1.6, 1.0, 0.46);
    mk(g, cyl(0.87, 0.87, 0.12, 14, true), mat('bldTrim'), 1.6, 0.4, -0.4);
    strut(g, [-0.3, 0.45, 0], [0.8, 0.45, -0.2], 0.07, mat('metal'));
    beacon(g, g, -0.6, 4.8, 0, 'lampA', '#ffb347');
    return g;
  };

  B.geri = (w) => {
    const g = newGroup(3.2, 2.4);
    mk(g, box(3.8, 0.2, 2.2), mat('hull2'), 0, 0.1, 0);
    mk(g, cyl(1.0, 1.0, 2.5, 16), mat('hull'), 0, 1.45, 0);
    mk(g, cyl(0.6, 1.0, 0.4, 16), mat('hull'), 0, 2.9, 0);
    mk(g, cyl(0.25, 0.25, 0.3, 8), mat('metal'), 0, 3.2, 0);
    mk(g, cyl(1.02, 1.02, 0.12, 16, true), wm(g, 'lampC'), 0, 2.1, 0);
    for (const sx of [-1.55, 1.55]) {
      mk(g, cyl(0.42, 0.42, 1.7, 12), mat('white'), sx, 1.05, 0);
      mk(g, sph(0.42, 12, 5, 0, PI * 2, 0, PI / 2), mat('white'), sx, 1.9, 0).scale.set(1, 0.5, 1);
      mk(g, cyl(0.44, 0.44, 0.12, 12, true), mat(sx < 0 ? 'bldTrim' : 'ind'), sx, 1.3, 0);

      for (const yy of [0.8, 1.6]) mk(g, tor(0.36, 0.06, 4, 8, PI), mat('metal'), sx * 0.66, yy, 0, 0, 0, sx < 0 ? PI / 2 : -PI / 2);
    }
    mk(g, tor(1.1, 0.06, 4, 16), mat('metal'), 0, 0.65, 0, PI / 2, 0, 0);
    mk(g, tor(1.1, 0.06, 4, 16), mat('metal'), 0, 2.45, 0, PI / 2, 0, 0);
    mk(g, box(0.7, 0.5, 0.2), mat('dark'), 0, 1.2, 1.05);
    mk(g, box(0.5, 0.08, 0.03), nm(g, 'lampA'), 0, 1.35, 1.16);
    return g;
  };

  B.sera = (w) => {
    const g = newGroup(2.4, 3.3);
    mk(g, box(6.4, 0.3, 4.0), mat('hull2'), 0, 0.15, 0);
    const gl = wm(g, 'growGlass');
    mk(g, cyl(1.85, 1.85, 6.0, 16, true, 0, PI), gl, 0, 0.3, 0, 0, 0, PI / 2);
    for (const sx of [-3, 3]) mk(g, gk('semi', () => new T.CircleGeometry(1.85, 16, 0, PI)), gl, sx, 0.3, 0, 0, PI / 2, 0);
    for (const sx of [-3, -1.5, 0, 1.5, 3]) mk(g, tor(1.86, 0.05, 4, 14, PI), mat('white'), sx, 0.3, 0, 0, PI / 2, 0);
    mk(g, box(6.0, 0.08, 0.08), mat('white'), 0, 2.15, 0);
    for (const sz of [-1.85, 1.85]) mk(g, box(6.0, 0.1, 0.1), mat('white'), 0, 0.35, sz);

    for (const sz of [-0.95, 0, 0.95]) {
      mk(g, box(5.4, 0.35, 0.5), mat('trough'), 0, 0.5, sz);
      for (let i = 0; i < 7; i++) {
        const p = mk(g, gk('leaf', () => new T.IcosahedronGeometry(0.3, 0)), mat(i % 2 ? 'plant' : 'plant2'), -2.4 + i * 0.8, 0.82, sz, i, i * 1.3, 0);
        p.scale.set(1.2, 0.8 + (i * 7 % 3) * 0.15, 0.9);
      }
    }
    const gr = wm(g, 'grow');
    for (const sz of [-0.95, 0, 0.95]) mk(g, box(5.2, 0.05, 0.14), gr, 0, 1.75 - Math.abs(sz) * 0.35, sz);
    halo(g, -1.5, 1.4, 0, '#e04bd8', 2.4); halo(g, 1.5, 1.4, 0, '#e04bd8', 2.4);

    mk(g, box(0.9, 1.6, 1.3), mat('hull'), 3.35, 1.05, 0);
    door(g, 3.81, 0.3, 0, PI / 2, g, 0.7, 1.15);
    return g;
  };

  B.yasam = (w) => {
    const g = newGroup(3.6, 3.2);
    const c = new T.Group(); c.position.y = 1.85; g.add(c);
    mk(c, cyl(1.55, 1.55, 5.0, 16), mat('hull'), 0, 0, 0, 0, 0, PI / 2);
    for (const sx of [-1, 1]) mk(c, sph(1.55, 16, 6, 0, PI * 2, 0, PI / 2), mat('hull'), sx * 2.5, 0, 0, 0, 0, -sx * PI / 2).scale.set(1, 0.42, 1);
    for (const sx of [-2.5, 0, 2.5]) mk(c, cyl(1.58, 1.58, 0.12, 16, true), mat('hull2'), sx, 0, 0, 0, 0, PI / 2);
    mk(c, cyl(1.565, 1.565, 4.6, 16, true, PI * 0.42, PI * 0.16), mat('bldTrim'), 0, 0, 0, 0, 0, PI / 2);

    for (const sz of [-1, 1]) for (let i = 0; i < 4; i++) {
      const x = -1.75 + i * 1.15 + (i > 1 && sz > 0 ? 0.6 : 0) - (i < 2 && sz > 0 ? 0.6 : 0);
      if (sz > 0 && Math.abs(x) < 0.7) continue;
      mk(c, box(0.5, 0.36, 0.1), nm(g, 'win'), x, 0.35, sz * 1.48, -sz * 0.22, 0, 0);
    }

    for (const sx of [-1.6, 1.6]) { mk(g, box(0.35, 0.7, 2.4), mat('hull2'), sx, 0.35, 0); mk(g, box(0.7, 0.08, 2.8), mat('dark'), sx, 0.04, 0); }

    mk(g, cyl(0.75, 0.75, 1.1, 12), mat('white'), 0, 1.6, 1.85, PI / 2, 0, 0);
    mk(g, cyl(0.78, 0.78, 0.1, 12, true), mat('bldTrim'), 0, 1.6, 2.1, PI / 2, 0, 0);
    mk(g, box(1.0, 1.0, 1.0), mat('hull2'), 0, 0.5, 2.0);
    door(g, 0, 1.0, 2.42, 0, g, 0.75, 1.15);
    mk(g, box(1.2, 0.08, 0.7), mat('hull2'), 0, 0.95, 2.75);

    mk(g, box(2.4, 0.06, 1.2), mat('radiator'), -0.9, 3.5, 0, 0.15, 0, 0);
    strut(g, [-0.9, 3.35, 0], [-0.9, 3.5, 0], 0.08, mat('metal'));
    strut(g, [1.5, 3.2, -0.3], [1.5, 3.9, -0.3], 0.02, mat('metal'));
    beacon(g, g, 1.5, 3.92, -0.3);
    return g;
  };

  B.spor = (w) => {
    const g = newGroup(3.1, 3.2);
    const dg = gk('dome', () => new T.IcosahedronGeometry(3.0, 2));
    const d = mk(g, dg, mat('white'), 0, -0.15, 0); d.scale.set(1, 1.05, 1);
    const ed = new T.LineSegments(gk('domeE', () => new T.EdgesGeometry(dg, 1)), gk('lineM', () => new T.LineBasicMaterial({ color: lin('#6b7078') })));
    ed.position.y = -0.15; ed.scale.set(1.003, 1.053, 1.003); g.add(ed);
    mk(g, cyl(0.6, 0.6, 0.3, 10), nm(g, 'win'), 0, 2.98, 0);
    halo(g, 0, 3.1, 0, '#f2a33a', 1.3);
    mk(g, cyl(3.05, 3.1, 0.3, 24), mat('hull2'), 0, 0.12, 0);
    for (let i = 0; i < 8; i++) { const a = i * PI / 4 + PI / 8; mk(g, box(0.55, 0.12, 0.1), nm(g, 'win'), Math.sin(a) * 3.05, 0.3, Math.cos(a) * 3.05, 0, a, 0); }

    mk(g, box(1.3, 1.7, 1.4), mat('hull'), 0, 0.85, 2.6);
    mk(g, box(1.42, 0.12, 1.5), mat('bldTrim'), 0, 1.65, 2.6);
    door(g, 0, 0.15, 3.31, 0, g, 0.8, 1.2);
    return g;
  };

  B.anten = (w) => {
    const g = newGroup(6.6, 1.4);
    mk(g, cyl(0.9, 1.0, 0.25, 6), mat('hull2'), 0, 0.12, 0);
    lattice(g, 3, 0.75, 0.25, 0.25, 4.3, 4, 0.055, mat('white'));
    const y = new T.Group(); y.position.set(0, 4.55, 0); g.add(y);
    mk(y, cyl(0.3, 0.3, 0.35, 10), mat('hull2'));
    const tilt = new T.Group(); tilt.position.y = 0.45; tilt.rotation.x = 1.0; y.add(tilt);
    mk(tilt, box(0.5, 0.4, 0.5), mat('dark'), 0, -0.1, 0);
    const prof = []; for (let i = 0; i <= 8; i++) { const r = 1.7 * i / 8; prof.push(new T.Vector2(r, r * r * 0.17)); }
    const dsh = gk('dishL', () => new T.LatheGeometry(prof, 20));
    const dm = mk(tilt, dsh, mat('back'), 0, 0.1, 0); dm.material = gk('dishM', () => new T.MeshStandardMaterial({ color: lin('#f1f0ec'), roughness: 0.5, side: T.DoubleSide }));
    for (let i = 0; i < 3; i++) { const a = i * PI * 2 / 3; strut(tilt, [Math.sin(a) * 1.6, 0.55, Math.cos(a) * 1.6], [0, 1.25, 0], 0.025, mat('metal')); }
    mk(tilt, cyl(0.06, 0.14, 0.3, 8), mat('gold'), 0, 1.3, 0);
    g.userData.anim.push({ o: y, axis: 'y', speed: 0.12 });
    strut(g, [0.3, 4.4, 0], [0.3, 6.3, 0], 0.02, mat('metal'));
    beacon(g, g, 0.3, 6.35, 0);
    mk(g, box(0.5, 0.35, 0.3), mat('dark'), 0, 0.4, 0.8);
    mk(g, box(0.3, 0.06, 0.02), wm(g, 'lampG'), 0, 0.45, 0.96);
    return g;
  };

  B.maden = (w) => {
    const g = newGroup(3.6, 3.0);

    for (const [sx, sz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) strut(g, [sx + 0.6, 0, sz], [sx * 0.7 + 0.6, 2.2, sz * 0.7], 0.08, mat('metal'));
    mk(g, cyl(1.35, 0.5, 1.2, 4, false), mat('ind'), 0.6, 2.75, 0, 0, PI / 4, 0);
    mk(g, box(1.95, 0.1, 1.95), mat('dark'), 0.6, 3.36, 0);
    mk(g, box(1.0, 0.7, 1.4), mat('hull2'), 0.6, 0.35, 0);
    for (let i = 0; i < 5; i++) mk(g, gk('ch', () => new T.DodecahedronGeometry(0.16, 0)), mat('ore'), 0.3 + (i % 3) * 0.3, 0.78, -0.3 + (i % 2) * 0.5, i, i, 0);

    const cv = new T.Group(); cv.position.set(-1.25, 1.75, 0); cv.rotation.z = -0.78; g.add(cv);
    mk(cv, box(3.6, 0.12, 0.6), mat('belt'));
    for (const sz of [-0.34, 0.34]) mk(cv, box(3.6, 0.22, 0.06), mat('ind'), 0, 0.03, sz);
    for (let i = 0; i < 5; i++) mk(cv, box(0.12, 0.08, 0.5), mat('ore'), -1.4 + i * 0.7, 0.1, 0);
    strut(g, [-1.6, 0, 0], [-1.6, 1.4, 0], 0.07, mat('metal'));

    const wh = new T.Group(); wh.position.set(-2.5, 0.85, 0); g.add(wh);
    mk(wh, tor(0.65, 0.08, 6, 16), mat('ind'));
    mk(wh, cyl(0.15, 0.15, 0.5, 8), mat('dark'), 0, 0, 0, PI / 2, 0, 0);
    for (let i = 0; i < 8; i++) { const a = i * PI / 4; mk(wh, box(0.3, 0.26, 0.42), mat('dark'), Math.sin(a) * 0.72, Math.cos(a) * 0.72, 0, 0, 0, -a); }
    g.userData.anim.push({ o: wh, axis: 'z', speed: 1.2 });
    mk(g, sph(0.12, 8, 6), wm(g, 'lampA'), 0.6, 3.5, 0.9); halo(g, 0.6, 3.5, 0.9, '#ffb347', 1.1);
    return g;
  };

  B.atolye = (w) => {
    const g = newGroup(3.6, 3.1);

    mk(g, box(2.6, 2.3, 3.4), mat('hull'), -1.3, 1.15, 0);
    mk(g, box(2.7, 0.15, 3.5), mat('bldTrim'), -1.3, 2.3, 0);
    mk(g, box(0.05, 1.7, 2.0), mat('grille'), 0.03, 0.9, 0);
    mk(g, box(0.06, 0.08, 2.2), nm(g, 'lampA'), 0.05, 1.85, 0); halo(g, 0.25, 1.85, 0, '#ffb347', 1.4);
    mk(g, box(1.6, 0.06, 1.2), mat('radiator'), -1.3, 2.55, 0, 0, 0, 0.2);
    door(g, -1.3, 0, 1.71, 0, g, 0.8, 1.4);

    const cx = 1.6;
    mk(g, cyl(1.35, 1.35, 0.9, 20, true), mat('printed'), cx, 0.45, 0);
    mk(g, cyl(1.1, 1.1, 0.9, 20, true), mat('printed'), cx, 0.45, 0);
    mk(g, tor(1.22, 0.13, 4, 20), mat('printed'), cx, 0.9, 0, PI / 2, 0, 0);
    mk(g, cyl(0.16, 0.2, 3.2, 8), mat('ind'), cx, 1.6, 0);
    const arm = new T.Group(); arm.position.set(cx, 3.0, 0); g.add(arm);
    mk(arm, box(1.6, 0.18, 0.22), mat('ind'), 0.7, 0, 0);
    mk(arm, box(0.3, 0.3, 0.3), mat('dark'), 1.2, -0.05, 0);
    strut(arm, [1.22, -0.2, 0], [1.22, -1.95, 0], 0.04, mat('metal'));
    mk(arm, cyl(0.02, 0.09, 0.2, 6), wm(g, 'slit'), 1.22, -2.0, 0);
    g.userData.anim.push({ o: arm, axis: 'y', speed: 0.7 });
    return g;
  };

  B.lab = (w) => {
    const g = newGroup(4.6, 2.7);
    for (let i = 0; i < 4; i++) { const a = i * PI / 2 + PI / 4; mk(g, box(0.3, 0.5, 0.3), mat('dark'), Math.sin(a) * 1.2, 0.25, Math.cos(a) * 1.2); }
    mk(g, cyl(1.6, 1.6, 2.3, 16), mat('hull'), 0, 1.6, 0);
    mk(g, sph(1.6, 16, 6, 0, PI * 2, 0, PI / 2), mat('hull'), 0, 2.75, 0).scale.set(1, 0.45, 1);
    mk(g, cyl(1.62, 1.62, 0.22, 16, true), mat('teal'), 0, 2.45, 0);
    windowRing(g, g, 1.57, 1.85, 3, PI * 0.55, PI * 1.45, 0.45, 0.32);
    windowRing(g, g, 1.57, 1.85, 2, -1.2, -0.65, 0.45, 0.32);
    door(g, 0, 0.5, 1.56, 0, g, 0.8, 1.25);
    mk(g, box(1.2, 0.08, 0.7), mat('hull2'), 0, 0.46, 1.95);
    mk(g, box(0.8, 0.06, 0.03), wm(g, 'lampC'), 0, 2.2, 1.6);

    strut(g, [1.95, 0, -0.6], [1.95, 3.6, -0.6], 0.06, mat('white'));
    mk(g, box(0.4, 0.15, 0.4), mat('hull2'), 1.95, 0.08, -0.6);
    const hd = new T.Group(); hd.position.set(1.95, 3.75, -0.6); g.add(hd);
    mk(hd, box(0.55, 0.3, 0.3), mat('white'));
    for (const sx of [-0.13, 0.13]) mk(hd, cyl(0.07, 0.07, 0.1, 8), mat('dark'), sx, 0, 0.18, PI / 2, 0, 0);
    g.userData.anim.push({ o: hd, axis: 'y', speed: 0.5 });

    strut(g, [-1.4, 2.9, -1.0], [-1.4, 4.4, -1.0], 0.025, mat('metal'));
    mk(g, box(0.9, 0.03, 0.03), mat('metal'), -1.4, 4.2, -1.0);
    for (const sx of [-0.45, 0.45]) mk(g, sph(0.07, 6, 4), mat('white'), -1.4 + sx, 4.2, -1.0);

    mk(g, box(0.9, 0.7, 0.6), mat('hull2'), -2.0, 0.35, 0.9);
    strut(g, [-2.0, 0.7, 0.9], [-2.3, 1.3, 1.3], 0.04, mat('metal'));
    strut(g, [-2.3, 1.3, 1.3], [-2.1, 0.9, 1.7], 0.035, mat('metal'));
    mk(g, box(0.5, 0.5, 0.06), mat('solar'), -2.0, 0.85, 0.55, -0.6, 0, 0);
    beacon(g, g, 0, 3.5, 0, 'lampR', '#ff3b2e');
    return g;
  };

  B.pist = (w) => {
    const g = newGroup(0.3, 0);
    mk(g, cyl(3.4, 3.45, 0.14, 32), [mat('padSide'), mat('pad'), mat('padSide')], 0, 0.04, 0, 0, PI / 8, 0);
    mk(g, cyl(3.5, 3.6, 0.08, 32, true), mat('berm'), 0, 0.03, 0);
    for (let i = 0; i < 8; i++) {
      const a = i * PI / 4, x = Math.sin(a) * 3.28, z = Math.cos(a) * 3.28;
      mk(g, cyl(0.1, 0.12, 0.12, 8), mat('dark'), x, 0.14, z);
      const k = i % 2 ? 'lampA' : 'lampR';
      mk(g, sph(0.08, 8, 4, 0, PI * 2, 0, PI / 2), nm(g, k), x, 0.2, z);
      halo(g, x, 0.26, z, i % 2 ? '#ffb347' : '#ff3b2e', 0.9);
    }
    return g;
  };

  function building(k, world) {
    const f = B[k];
    if (!f) { const g = newGroup(2, 1.5); mk(g, box(2, 2, 2), mat('hull2'), 0, 1, 0); return g; }
    const g = f(world === 'mars' ? 'mars' : 'ay');
    g.name = 'bld-' + k;
    return g;
  }


  function shield(k, soilHex) {
    const g = new T.Group(), m = soilMat(soilHex || '#8a8a86');
    const yas = k === 'yasam';
    const sx = yas ? 3.55 : 3.3, sy = yas ? 3.9 : 4.4, sz = yas ? 2.5 : 3.2;
    const geo = gk('shieldG' + (yas ? 1 : 0), () => {
      const ge = new T.SphereGeometry(1, 24, 10, 0, PI * 2, 0, PI / 2), p = ge.attributes.position;
      const sp = (c, e) => Math.sign(c) * Math.pow(Math.abs(c), e);
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const n = 1 + 0.035 * Math.sin(x * 7.1 + z * 3.3) * Math.cos(z * 5.7 - y * 4.1) + 0.02 * Math.sin(x * 13 + y * 11);
        p.setXYZ(i, sp(x, yas ? 0.45 : 0.7) * n * sx, sp(y, 0.6) * n * sy, sp(z, 0.7) * n * sz);
      }
      ge.computeVertexNormals(); return ge;
    });
    const mo = mk(g, geo, m, 0, -0.1, 0);

    const dz = yas ? 2.35 : 2.5, th = yas ? 2.6 : 2.0;
    mk(g, box(1.8, th, 1.3), mat('hull2'), 0, th / 2, dz);
    mk(g, box(1.0, 1.5, 0.1), mat('dark'), 0, 0.85, dz + 0.66);
    mk(g, box(0.32, 0.22, 0.12), mat('win'), 0, 1.25, dz + 0.68);
    mk(g, box(1.2, 0.08, 0.12), mat('lampA'), 0, th - 0.2, dz + 0.67);
    halo(g, 0, th - 0.15, dz + 0.85, '#f2a33a', 1.0);
    for (let i = 0; i < 10; i++) { const a = i / 10 * PI * 2; mk(g, gk('sb', () => new T.BoxGeometry(0.8, 0.45, 0.5)), m, Math.sin(a) * sx * 0.98, 0.15, Math.cos(a) * sz * 0.98, 0, a, 0); }
    g.userData = { h: sy, r: Math.max(sx, sz) * 0.95, nightMats: [mat('lampA'), mat('win')] };
    void mo;
    return g;
  }


  function rnd(seed) { let a = (seed >>> 0) || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function rockGeo(R, det, amt) {
    const geo = new T.IcosahedronGeometry(1, det), p = geo.attributes.position, s = R() * 100;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const n = 1 + amt * (Math.sin(x * 4.3 + s) * Math.cos(y * 3.7 + s * 0.7) + 0.5 * Math.sin(z * 6.1 + s * 1.3));
      p.setXYZ(i, x * n, y * n * (y < 0 ? 0.5 : 1), z * n);
    }
    geo.computeVertexNormals(); return geo;
  }
  function rock(p, R, mt, x, z, s, flat = 0.75, det = 1) {
    const o = mk(p, rockGeo(R, det, 0.22), mt, x, s * 0.25, z, 0, R() * 6, 0);
    o.scale.set(s * (0.8 + R() * 0.5), s * flat * (0.7 + R() * 0.4), s * (0.8 + R() * 0.5)); return o;
  }

  function deposit(kind, world, seed) {
    const mars = world === 'mars', R = rnd((seed | 0) * 31 + kind.charCodeAt(0) * 977 + (mars ? 7 : 0));
    const g = new T.Group(); g.userData = { r: 0 };
    if (kind === 'i') {
      for (let i = 0; i < 5; i++) {
        const a = R() * PI * 2, d = i ? 0.8 + R() * 1.6 : 0;
        mk(g, cyl(1, 1, 0.06, 6), mat('iceSheet'), Math.sin(a) * d, 0.02 + i * 0.005, Math.cos(a) * d, 0, R() * 6, 0).scale.set(0.5 + R() * 0.7, 1, 0.3 + R() * 0.5);
      }
      const n = 9 + (R() * 4 | 0);
      for (let i = 0; i < n; i++) {
        const cl = i < 5, a = R() * PI * 2, d = cl ? R() * 0.7 : 0.6 + R() * 2.2, h = (cl ? 0.8 : 0.35) + R() * (mars ? 0.5 : 0.9);
        mk(g, gk('shard', () => new T.ConeGeometry(0.22, 1, 5)), mat('ice'), Math.sin(a) * d, h * 0.4, Math.cos(a) * d, (R() - 0.5) * 0.8, R() * 6, (R() - 0.5) * 0.8).scale.set(0.7 + R(), h, 0.7 + R());
      }
      if (mars) for (let i = 0; i < 3; i++) rock(g, R, mat('rockMars'), (R() - 0.5) * 4, (R() - 0.5) * 4, 0.35);
    } else if (kind === 'm') {
      const n = 7 + (R() * 4 | 0);
      for (let i = 0; i < n; i++) { const a = R() * PI * 2, d = R() * 2.6; rock(g, R, mat('ore'), Math.sin(a) * d, Math.cos(a) * d, 0.3 + R() * 0.45, 0.7, 0); }
      for (let i = 0; i < 6; i++) { const a = R() * PI * 2, d = R() * 2.4; mk(g, gk('fleck', () => new T.OctahedronGeometry(0.14, 0)), mat('fleck'), Math.sin(a) * d, 0.12, Math.cos(a) * d, R() * 3, R() * 3, 0).scale.set(1, 1.6, 1); }
    } else if (kind === 't') {
      const n = 10 + (R() * 3 | 0), mt = mat(mars ? 'basaltMars' : 'basaltAy');
      for (let i = 0; i < n; i++) {
        const a = i / n * PI * 2 + R() * 0.3, d = 3.0 + R() * 0.5;
        const o = mk(g, box(1, 1, 1), mt, Math.sin(a) * d, 0.2, Math.cos(a) * d, (R() - 0.5) * 0.5, a + (R() - 0.5) * 0.6, (R() - 0.5) * 0.4);
        o.scale.set(0.6 + R() * 0.7, 0.4 + R() * 0.6, 0.5 + R() * 0.5);
      }
    } else if (kind === 'r') {
      const n = 3 + (R() * 3 | 0), mt = mat(mars ? 'rockMars' : 'rockAy'); let rr = 0;
      for (let i = 0; i < n; i++) {
        const a = R() * PI * 2, d = i ? 0.8 + R() * 1.6 : R() * 0.5, s = i ? 0.5 + R() * 0.6 : 1.1 + R() * 0.4;
        rock(g, R, mt, Math.sin(a) * d, Math.cos(a) * d, s, 0.7);
        rr = Math.max(rr, d + s * 0.9);
      }
      g.userData.r = Math.min(3.2, rr);
    } else if (kind === 'c') {
      const n = 4 + (R() * 4 | 0), mt = mat(mars ? 'rockMars' : 'rockAy');
      for (let i = 0; i < n; i++) { const a = R() * PI * 2, d = 2.6 + R() * 1.0; rock(g, R, mt, Math.sin(a) * d, Math.cos(a) * d, 0.2 + R() * 0.35, 0.6, 0); }
    }
    return g;
  }


  function relic(world, idx) {
    const mars = world === 'mars', g = new T.Group(), R = rnd(idx * 101 + (mars ? 50 : 3));
    const dust = mat(mars ? 'dustMars' : 'dustAy');
    let h = 1.5, r = 1.2, blink = null;
    if (!mars && idx === 0) {

      for (let i = 0; i < 3; i++) { const a = i * PI * 2 / 3; strut(g, [0, 1.2, 0], [Math.sin(a) * 0.75, 0, Math.cos(a) * 0.75], 0.04, mat('metal')); }
      mk(g, box(0.45, 0.35, 0.45), mat('gold'), 0, 1.3, 0);
      mk(g, box(0.5, 0.06, 0.5), mat('white'), 0, 1.5, 0);
      mk(g, box(0.5, 0.4, 0.03), mat('solar'), 0.35, 1.25, 0, 0, PI / 2, -0.5);
      strut(g, [-0.15, 1.5, 0], [-0.15, 2.3, 0], 0.012, mat('metal'));
      blink = new T.MeshStandardMaterial({ color: lin('#400'), emissive: lin('#ff3020'), emissiveIntensity: 2.2 });
      mk(g, sph(0.1, 10, 8), blink, 0, 1.65, 0);
      const hs = halo(g, 0, 1.65, 0, '#ff3020', 1.2); hs.material = haloMat('#ff3020').clone(); g.userData.blinkHalo = hs.material;
      h = 2.3; r = 0.8;
    } else if (!mars && idx === 1) {

      const wing = new T.Group(); wing.position.set(0, 0.25, 0); wing.rotation.set(-1.35, 0.4, 0.15); g.add(wing);
      const pm = [mat('metal'), mat('metal'), mat('metal'), mat('metal'), mat('solar'), mat('back')];
      const a = mk(wing, box(2.4, 1.6, 0.05), pm, -0.6, 0, 0); a.material = pm;
      const b = mk(wing, box(1.3, 1.6, 0.05), pm, 1.35, 0.15, -0.12, 0.25, 0.2, 0.1); b.material = pm;
      strut(wing, [-1.8, 0, -0.05], [2.0, 0.1, -0.1], 0.04, mat('metal'));
      mk(g, box(0.6, 0.35, 0.4), dust, -1.6, 0.15, 0.9, 0.3, 0.6, 0.2);
      const tg = gk('trk', () => new T.PlaneGeometry(0.32, 3.2));
      for (let s = 0; s < 3; s++) for (const off of [-0.7, 0.7]) {
        const ang = 0.25 * s, cx = -2.4 + s * 0.6, cz = -3.0 + s * 2.7;
        const o = mk(g, tg, mat('tread'), cx + Math.cos(ang) * off, 0.06, cz - Math.sin(ang) * off, -PI / 2, 0, ang);
        o.castShadow = false;
      }
      h = 0.9; r = 1.6;
    } else if (!mars && idx === 2) {

      const rv = new T.Group(); rv.rotation.set(0.06, 0.7, -0.08); g.add(rv);
      mk(rv, box(1.7, 0.55, 1.1), mat('gold'), 0, 0.85, 0);
      mk(rv, box(1.9, 0.08, 1.4), mat('white'), 0, 1.15, 0);
      mk(rv, box(1.7, 0.04, 1.2), mat('solar'), 0, 1.21, 0);
      for (let i = 0; i < 5; i++) mk(rv, box(0.3 + R() * 0.3, 0.03, 0.2 + R() * 0.3), mat('frost'), -0.7 + R() * 1.4, 1.24, -0.5 + R(), 0, R() * 3, 0);
      for (const sx of [-0.7, 0, 0.7]) for (const sz of [-0.7, 0.7]) {
        mk(rv, cyl(0.28, 0.28, 0.22, 12), mat('tire'), sx, 0.28, sz, PI / 2, 0, 0);
        mk(rv, cyl(0.12, 0.12, 0.24, 8), mat('metal'), sx, 0.28, sz, PI / 2, 0, 0);
        strut(rv, [sx, 0.3, sz], [sx * 0.6, 0.75, sz * 0.75], 0.04, mat('metal'));
      }
      strut(rv, [0.6, 1.2, 0.35], [0.7, 2.1, 0.35], 0.04, mat('white'));
      const hd = mk(rv, box(0.4, 0.2, 0.25), mat('white'), 0.75, 2.05, 0.4, 0, 0, -0.7);
      mk(rv, cyl(0.04, 0.3, 0.08, 10), mat('white'), -0.6, 1.5, -0.3, 0.3, 0, 0.4);
      strut(rv, [-0.6, 1.2, -0.3], [-0.6, 1.45, -0.3], 0.025, mat('metal'));
      void hd;
      rock(g, R, mat('rockAy'), -2.0, -1.4, 1.3, 0.8);
      rock(g, R, mat('rockAy'), -1.2, -2.2, 0.8, 0.7);
      for (let i = 0; i < 4; i++) mk(g, box(0.5 + R(), 0.02, 0.4 + R() * 0.6), mat('frost'), (R() - 0.7) * 3, 0.03, (R() - 0.5) * 3, 0, R() * 3, 0).castShadow = false;
      h = 2.2; r = 1.5;
    } else if (mars && idx === 0) {

      mk(g, box(1.6, 1.0, 1.2), mat('white'), 0, 0.45, 0, 0.05, 0.3, 0.1);
      mk(g, box(1.62, 0.12, 1.22), mat('ind'), 0, 0.75, 0, 0.05, 0.3, 0.1);
      mk(g, box(1.6, 0.06, 1.2), mat('white'), 0.9, 0.9, -0.9, 0.2, 0.4, 1.2);
      mk(g, box(0.9, 0.05, 0.7), mat('white'), -1.3, 0.04, 0.9, 0, 1.1, 0);
      mk(g, box(0.4, 0.3, 0.3), mat('gold'), 1.1, 0.15, 0.9, 0, 0.6, 0);
      mk(g, cyl(0.2, 0.2, 0.7, 10), mat('metal'), -0.8, 0.2, 1.4, PI / 2, 0.7, PI / 2);
      const cg = new T.PlaneGeometry(4.2, 3.2, 14, 10), cp = cg.attributes.position;
      for (let i = 0; i < cp.count; i++) { const x = cp.getX(i), y = cp.getY(i); cp.setZ(i, 0.22 * Math.sin(x * 2.2 + y) + 0.15 * Math.cos(y * 3.1) + (y > 1.0 ? (y - 1.0) * 0.9 : 0) * Math.max(0, 1 - Math.abs(x - 0.3))); }
      cg.computeVertexNormals();
      const ch = mk(g, cg, mat('chute'), -0.6, 0.25, -2.0, -PI / 2 + 0.05, 0, 0.2); ch.castShadow = true;
      for (let i = 0; i < 5; i++) strut(g, [-0.3, 0.6, -0.3], [-2.4 + i * 0.9, 0.05, -0.6], 0.008, mat('back'));
      h = 1.3; r = 1.4;
    } else if (mars && idx === 1) {

      const m = new T.Group(); m.rotation.set(0.12, 0, -0.2); g.add(m);
      mk(m, box(0.8, 0.5, 0.8), dust, 0, 0.15, 0);
      strut(m, [0, 0.3, 0], [0, 2.6, 0], 0.05, dust);
      for (const [y, l] of [[1.6, 0.9], [2.3, 0.7]]) {
        mk(m, box(l * 2, 0.04, 0.04), dust, 0, y, 0);
        mk(m, box(0.2, 0.12, 0.12), dust, l, y, 0); mk(m, box(0.2, 0.12, 0.12), dust, -l, y, 0);
      }
      const cups = new T.Group(); cups.position.set(0, 2.7, 0); m.add(cups);
      for (let i = 0; i < 3; i++) { const a = i * PI * 2 / 3; strut(cups, [0, 0, 0], [Math.sin(a) * 0.3, 0, Math.cos(a) * 0.3], 0.012, dust); mk(cups, sph(0.07, 8, 6, 0, PI * 2, 0, PI / 2), dust, Math.sin(a) * 0.3, 0, Math.cos(a) * 0.3, 0, 0, PI / 2); }
      mk(g, box(1.0, 0.04, 0.7), mat('solar'), 0.9, 0.12, 0.5, 0.15, 0.4, -0.1);
      mk(g, box(1.0, 0.03, 0.7), dust, 0.9, 0.15, 0.5, 0.15, 0.4, -0.1).scale.set(0.8, 1, 0.8);
      for (let i = 0; i < 3; i++) rock(g, R, mat('rockMars'), (R() - 0.5) * 3, (R() - 0.5) * 3, 0.25);
      h = 2.8; r = 0.7;
    } else {

      const L = new T.Group(); L.rotation.set(0.25, 0.4, 0.18); L.position.y = -0.2; g.add(L);
      mk(L, cyl(1.7, 1.7, 1.6, 8), mat('white'), 0, 1.4, 0, 0, PI / 8, 0);
      mk(L, cyl(1.72, 1.72, 0.3, 8, true), dust, 0, 2.05, 0, 0, PI / 8, 0);
      mk(L, cyl(1.1, 1.7, 0.6, 8), mat('white'), 0, 2.5, 0, 0, PI / 8, 0);
      mk(L, cyl(0.35, 0.8, 0.8, 10, true), mat('dark'), 0, 0.3, 0);

      mk(L, box(1.2, 1.1, 0.1), mat('dark'), 0, 1.4, 1.52);
      mk(L, sph(0.36, 10, 8), mat('gold'), -0.28, 1.35, 1.25); mk(L, sph(0.3, 10, 8), mat('gold'), 0.32, 1.5, 1.25);
      mk(L, box(1.0, 1.0, 0.05), mat('white'), 0.95, 0.55, 2.0, 1.1, 0.4, 0.3);
      for (let i = 0; i < 3; i++) { const a = PI / 4 + i * PI / 2; const s = Math.sin(a), c = Math.cos(a); strut(L, [s * 1.4, 1.0, c * 1.4], [s * 2.5, 0.0, c * 2.5], 0.07, mat('metal')); mk(L, cyl(0.3, 0.34, 0.08, 8), mat('hull2'), s * 2.5, 0, c * 2.5); }
      strut(g, [-1.6, 0.1, 0.6], [-2.6, 0.1, 1.6], 0.07, mat('metal'));
      for (let i = 0; i < 4; i++) mk(g, box(0.5 + R() * 0.6, 0.04, 0.3 + R() * 0.4), mat(i % 2 ? 'white' : 'gold'), (R() - 0.5) * 5, 0.03, 1.5 + R() * 1.5, 0, R() * 3, 0);
      h = 3.2; r = 2.2;
    }
    g.userData = Object.assign(g.userData || {}, { h, r, blink });
    return g;
  }


  function lander() {
    const g = new T.Group();
    for (let i = 0; i < 4; i++) {
      const a = PI / 4 + i * PI / 2, s = Math.sin(a), c = Math.cos(a);
      strut(g, [s * 1.4, 2.2, c * 1.4], [s * 3.0, 0.1, c * 3.0], 0.1, mat('metal'));
      strut(g, [s * 1.5, 1.3, c * 1.5], [s * 3.0, 0.1, c * 3.0], 0.07, mat('metal'));
      mk(g, cyl(0.4, 0.45, 0.1, 10), mat('hull2'), s * 3.0, 0.05, c * 3.0);
    }
    mk(g, cyl(1.65, 1.65, 0.9, 8), mat('gold'), 0, 1.75, 0, 0, PI / 8, 0);
    mk(g, cyl(0.35, 0.85, 1.2, 14, true), mat('dark'), 0, 0.8, 0);
    mk(g, cyl(1.5, 1.5, 3.2, 14), mat('hull'), 0, 3.8, 0);
    mk(g, cyl(1.52, 1.52, 0.3, 14, true), mat('craftBand'), 0, 2.4, 0);
    mk(g, cyl(1.52, 1.52, 0.12, 14, true), mat('craftNose'), 0, 5.2, 0);
    mk(g, cyl(0.5, 1.5, 1.4, 14), mat('hull'), 0, 6.1, 0);
    mk(g, cyl(0.5, 0.5, 0.2, 10), mat('hull2'), 0, 6.9, 0);
    mk(g, box(1.4, 1.8, 0.1), mat('hull2'), 0, 3.7, 1.47);
    patchAt(g, 0, 3.7, 1.53, 0, 0, 0, 1.2);
    for (let i = 0; i < 4; i++) { const a = i * PI / 2; mk(g, box(0.25, 0.3, 0.25), mat('dark'), Math.sin(a) * 1.55, 5.5, Math.cos(a) * 1.55, 0, a, 0); }
    beacon(g, { userData: { nightMats: [] } }, 0, 7.05, 0);
    const fm = gk('flameM', () => new T.MeshBasicMaterial({ map: TEX.flame(), color: 0xffffff, transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    const flame = new T.Mesh(gk('flameG', () => new T.ConeGeometry(0.8, 3.4, 14, 1, true)), fm);
    flame.rotation.x = PI; flame.position.y = -1.5; flame.visible = false;
    const core = new T.Mesh(gk('flameC', () => new T.ConeGeometry(0.4, 1.8, 10, 1, true)), fm); core.position.y = 0.8; flame.add(core);
    g.add(flame);
    g.userData = { h: 7.1, r: 2.2, flame };
    return g;
  }


  function capsule() {
    const g = new T.Group();
    for (let i = 0; i < 3; i++) {
      const a = i * PI * 2 / 3 + PI / 6, s = Math.sin(a), c = Math.cos(a);
      strut(g, [s * 0.95, 1.1, c * 0.95], [s * 1.7, 0.05, c * 1.7], 0.07, mat('metal'));
      mk(g, cyl(0.28, 0.3, 0.08, 10), mat('hull2'), s * 1.7, 0.04, c * 1.7);
    }
    mk(g, cyl(1.05, 1.05, 1.0, 16), mat('gold'), 0, 1.1, 0);
    mk(g, cyl(0.45, 0.7, 0.45, 12, true), mat('dark'), 0, 0.45, 0);
    mk(g, cyl(1.12, 1.12, 0.12, 16, true), mat('craftBand'), 0, 1.62, 0);
    mk(g, cyl(0.5, 1.12, 1.35, 16), mat('hull'), 0, 2.36, 0);
    mk(g, cyl(0.5, 0.5, 0.18, 12), mat('hull2'), 0, 3.12, 0);
    mk(g, sph(0.2, 10, 6), mat('craftNose'), 0, 3.25, 0);
    for (const sx of [-1, 1]) patchAt(g, sx * 1.065, 1.1, 0, 0, sx * PI / 2, 0, 0.72);

    for (const a of [PI / 2, -PI / 2]) mk(g, cyl(0.16, 0.16, 0.06, 10), mat('lampC'), Math.sin(a) * 0.86, 2.3, Math.cos(a) * 0.86, 0, 0, PI / 2);
    const hatch = new T.Group(); hatch.position.set(-0.32, 2.2, 0.86); g.add(hatch);
    mk(hatch, box(0.64, 0.74, 0.07), mat('hull2'), 0.32, 0, 0, -0.43, 0, 0);
    mk(hatch, box(0.4, 0.07, 0.08), mat('ind'), 0.32, -0.05, 0.03, -0.43, 0, 0);

    mk(g, cyl(1.03, 1.08, 0.1, 16, true), mat('ind'), 0, 1.86, 0);
    const fm = gk('flameM', () => new T.MeshBasicMaterial({ map: TEX.flame(), color: 0xffffff, transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    const flame = new T.Mesh(gk('flameG2', () => new T.ConeGeometry(0.55, 2.6, 12, 1, true)), fm);
    flame.rotation.x = PI; flame.position.y = -1.1; flame.visible = false; g.add(flame);
    g.userData = { h: 3.4, r: 1.3, hatch, flame };
    return g;
  }

  function cookies() {
    const g = new T.Group();
    mk(g, cyl(0.22, 0.22, 0.14, 14), mat('accent'), 0, 0.07, 0);
    mk(g, cyl(0.23, 0.23, 0.04, 14), mat('ind'), 0, 0.15, 0);
    for (let i = 0; i < 3; i++) mk(g, cyl(0.07, 0.07, 0.03, 8), mat('printed'), Math.cos(i * 2.1) * 0.1, 0.18, Math.sin(i * 2.1) * 0.1);
    g.userData = { h: 0.2, r: 0.23 };
    return g;
  }


  function rover(world) {
    const mars = world === 'mars', g = new T.Group(), body = mat('roverBody'), trim = mat('roverTrim');
    const lamp = mat('lampA').clone(), halos = [];
    const wheel = (x, y, z, r, w) => {
      mk(g, cyl(r, r, w, 14), mat('tire'), x, y, z, 0, 0, PI / 2);
      mk(g, cyl(r * 0.45, r * 0.45, w + 0.02, 8), mat('metal'), x, y, z, 0, 0, PI / 2);
    };
    const light = (x, y, z) => {
      mk(g, box(0.16, 0.1, 0.05), lamp, x, y, z);
      const h = halo(g, x, y, z + 0.06, '#ffb347', 0.9); h.material = haloMat('#ffb347').clone(); halos.push(h.material);
    };
    let h, r;
    if (!mars) {

      mk(g, box(1.5, 0.12, 2.6), body, 0, 0.62, 0);
      for (const sx of [-1, 1]) {
        mk(g, box(0.06, 0.3, 1.2), body, sx * 0.75, 0.78, 0);
        mk(g, box(0.07, 0.08, 1.22), trim, sx * 0.76, 0.9, 0);
        patchAt(g, sx * 0.79, 0.74, 0.05, 0, sx * PI / 2, 0, 0.3);
        for (const sz of [-0.95, 0.95]) {
          wheel(sx * 0.82, 0.4, sz, 0.4, 0.24);
          mk(g, cyl(0.46, 0.46, 0.3, 10, true, 0, PI), body, sx * 0.82, 0.4, sz, 0, 0, PI / 2);
          strut(g, [sx * 0.55, 0.6, sz], [sx * 0.72, 0.4, sz], 0.035, mat('metal'));
        }
      }

      for (const sx of [-0.35, 0.35]) {
        mk(g, box(0.5, 0.08, 0.5), mat('dark'), sx, 0.74, -0.05);
        mk(g, box(0.5, 0.5, 0.08), mat('dark'), sx, 0.98, -0.32, -0.15, 0, 0);
      }

      mk(g, box(1.2, 0.35, 0.3), body, 0, 0.86, 0.95);
      mk(g, box(1.22, 0.06, 0.32), trim, 0, 1.03, 0.95);
      mk(g, box(0.5, 0.22, 0.04), mat('dark'), 0, 0.9, 1.11);
      light(-0.45, 0.85, 1.12); light(0.45, 0.85, 1.12);

      mk(g, box(1.3, 0.4, 0.55), mat('hull2'), 0, 0.88, -1.0);
      mk(g, box(1.32, 0.07, 0.57), trim, 0, 1.0, -1.0);

      strut(g, [0.45, 0.68, 1.0], [0.45, 1.75, 1.0], 0.03, mat('metal'));
      mk(g, sph(0.36, 12, 4, 0, PI * 2, 0, 0.8), mat('white'), 0.45, 1.8, 1.0, -0.9, 0, 0);
      mk(g, box(0.18, 0.18, 0.14), mat('gold'), -0.45, 1.12, 0.98);
      h = 2.0; r = 1.45;
    } else {

      mk(g, box(1.25, 0.45, 1.8), body, 0, 1.0, 0);
      mk(g, box(1.29, 0.08, 1.84), trim, 0, 0.84, 0);
      mk(g, box(1.3, 0.06, 1.85), mat('white'), 0, 1.25, 0);
      for (const sx of [-1, 1]) {
        patchAt(g, sx * 0.635, 1.05, 0.15, 0, sx * PI / 2, 0, 0.36);
        for (const sz of [-0.75, 0, 0.75]) wheel(sx * 0.86, 0.3, sz, 0.3, 0.26);

        strut(g, [sx * 0.66, 0.95, 0.15], [sx * 0.8, 0.62, 0.75], 0.045, mat('metal'));
        strut(g, [sx * 0.66, 0.95, 0.15], [sx * 0.8, 0.6, -0.35], 0.045, mat('metal'));
        strut(g, [sx * 0.8, 0.6, -0.35], [sx * 0.86, 0.3, 0], 0.04, mat('metal'));
        strut(g, [sx * 0.8, 0.6, -0.35], [sx * 0.86, 0.3, -0.75], 0.04, mat('metal'));
        strut(g, [sx * 0.8, 0.62, 0.75], [sx * 0.86, 0.3, 0.75], 0.04, mat('metal'));
      }

      strut(g, [0.38, 1.28, 0.65], [0.38, 2.15, 0.65], 0.05, mat('white'));
      mk(g, box(0.42, 0.2, 0.26), mat('white'), 0.38, 2.24, 0.68);
      mk(g, box(0.44, 0.05, 0.28), trim, 0.38, 2.12, 0.68);
      for (const sx of [-0.1, 0.1]) mk(g, cyl(0.055, 0.055, 0.06, 8), mat('dark'), 0.38 + sx, 2.25, 0.83, PI / 2, 0, 0);

      const rtg = new T.Group(); rtg.position.set(0, 1.3, -1.05); rtg.rotation.x = -0.75; g.add(rtg);
      mk(rtg, cyl(0.17, 0.17, 0.7, 10), mat('dark'));
      for (let i = 0; i < 6; i++) { const a = i * PI / 3; mk(rtg, box(0.02, 0.6, 0.18), mat('dark'), Math.sin(a) * 0.22, 0, Math.cos(a) * 0.22, 0, a, 0); }

      strut(g, [-0.35, 0.95, 0.92], [-0.35, 0.75, 1.15], 0.04, mat('metal'));
      strut(g, [-0.35, 0.75, 1.15], [0.15, 0.75, 1.15], 0.04, mat('metal'));
      mk(g, box(0.2, 0.16, 0.16), mat('hull2'), 0.2, 0.75, 1.15);

      mk(g, cyl(0.26, 0.26, 0.05, 12), mat('white'), -0.38, 1.38, -0.45, 0.4, 0, 0);
      mk(g, box(0.36, 0.08, 0.04), mat('dark'), 0, 0.98, 0.91);
      light(-0.4, 1.0, 0.92); light(0.4, 1.0, 0.92);
      h = 2.4; r = 1.35;
    }
    g.name = 'rover';
    g.userData = { h, r, lamp, lampBase: lamp.emissiveIntensity, halos, haloBase: 0.55, kind: 'rover' };
    return g;
  }


  function astronaut(colorHex) {
    const g = new T.Group(), suit = mat('white'), soft = mat('hull2'), dark = mat('dark');
    const acc = suitMat(colorHex == null ? '#d0402c' : (typeof colorHex === 'number' ? '#' + colorHex.toString(16).padStart(6, '0') : colorHex));
    const lathe = (k, seg, pts) => gk('aL2' + k, () => new T.LatheGeometry(pts.map(([r, y]) => new T.Vector2(Math.max(r, 0.001), y)), seg));

    const arc = (cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [r * Math.cos(a), cy + r * Math.sin(a)]; });
    const low = (cy, r, n = 5) => arc(cy, r, -PI / 2, 0, n), top = (cy, r, n = 5) => arc(cy, r, 0, PI / 2, n);
    const sc = (o, x, y, z) => { o.scale.set(x, y, z); return o; };
    const pivot = (x, y) => { const p = new T.Group(); p.position.set(x, y, 0); g.add(p); return p; };

    const leg = x => {
      const p = pivot(x, 0.9);
      mk(p, lathe('leg', 12, [[0.066, -0.78], [0.088, -0.58], [0.094, -0.46], [0.1, -0.24], ...top(0, 0.102, 3)]), suit);
      mk(p, cyl(0.104, 0.104, 0.03, 14, true), acc, 0, -0.2, 0);

      sc(mk(p, lathe('boot', 12, [[0.001, -0.9], [0.08, -0.9], [0.08, -0.9], [0.097, -0.88], [0.1, -0.85], [0.093, -0.78], [0.07, -0.69]]), soft, 0, 0, 0.022), 1, 1, 1.38);
      return p;
    };

    const arm = (x, s) => {
      const p = pivot(x, 1.43), q = new T.Group(); q.rotation.z = 0.07 * s; p.add(q);
      mk(q, lathe('uarm', 12, [...low(-0.27, 0.066, 3), [0.084, -0.1], ...top(0, 0.092, 3)]), suit);
      mk(q, cyl(0.086, 0.088, 0.03, 12, true), acc, 0, -0.13, 0);
      const e = new T.Group(); e.position.set(0, -0.27, 0); e.rotation.x = -0.28; q.add(e);
      mk(e, lathe('farm', 12, [[0.058, -0.25], [0.07, -0.08], ...top(0, 0.066, 3)]), suit);
      sc(mk(e, sph(0.064, 9, 6), soft, 0, -0.3, 0.008), 0.92, 1.18, 1.08);
      return p;
    };
    const legL = leg(0.11), legR = leg(-0.11);

    sc(mk(g, lathe('torso', 20, [...low(0.87, 0.07, 2), [0.17, 0.9], [0.2, 1.0], [0.195, 1.1], [0.222, 1.28], [0.226, 1.4], [0.212, 1.465], [0.17, 1.51], [0.1, 1.55]]), suit), 1.15, 1, 0.8);
    mk(g, cyl(0.19, 0.2, 0.045, 20, true), soft, 0, 1.45, 0);

    sc(mk(g, sph(0.1, 12, 6), soft, 0, 1.26, 0.158), 1.15, 0.62, 0.32);
    mk(g, box(0.05, 0.022, 0.02), mat('lampG'), 0.04, 1.275, 0.19);

    patchAt(g, 0.105, 1.375, 0.172, 0, 0.31, 0, 0.095);

    mk(g, sph(0.264, 24, 11, 0, PI * 2, 0, 2.4), suit, 0, 1.585, 0);
    mk(g, sph(0.271, 20, 5, PI / 2 - 0.95, 1.9, 0.72, 1.18), mat('visor'), 0, 1.585, 0);

    const PK = 1.15, PZ = 0.48, pz = -0.27;
    sc(mk(g, lathe('plss', 18, [[0.001, 1.06], [0.15, 1.062], [0.185, 1.07], [0.203, 1.095], [0.208, 1.13], [0.208, 1.43], [0.203, 1.465], [0.185, 1.49], [0.15, 1.5], [0.001, 1.505]]), mat('pack'), 0, 0, pz), PK, 1, PZ);
    sc(mk(g, cyl(0.211, 0.211, 0.05, 18, true), acc, 0, 1.2, pz), PK, 1, PZ);
    mk(g, box(0.17, 0.065, 0.016), dark, 0, 1.42, -0.37);
    mk(g, box(0.05, 0.035, 0.014), mat('lampG'), -0.04, 1.42, -0.38);
    mk(g, box(0.05, 0.035, 0.014), mat('lampA'), 0.04, 1.42, -0.38);
    mk(g, cyl(0.026, 0.026, 0.05, 10, true), dark, 0.25, 1.2, pz, 0, 0, PI / 2);
    mk(g, tor(0.08, 0.016, 6, 12, PI), dark, 0.25, 1.2, -0.19, 0, PI / 2, PI);
    const armL = arm(0.3, 1), armR = arm(-0.3, -1);
    g.userData = { legL, legR, armL, armR, h: 1.8, r: 0.4 };
    return g;
  }


  function tris(o) {
    let n = 0;
    o.traverse(m => { if (m.isMesh) { const gm = m.geometry; n += (gm.index ? gm.index.count : gm.attributes.position.count) / 3; } });
    return Math.round(n);
  }


  function setCol(key, h) { if (!isHex(h)) return false; const m = mat(key), c = lin(h); if (m.color.equals(c)) return false; m.color.copy(c); if (key === 'bldTrim' && m.emissive) m.emissive.copy(c); return true; }
  function setLook(spec) {
    if (!spec || typeof spec !== 'object') return false;
    setCol('visor', spec.visor);
    if (spec.bld) setCol('bldTrim', spec.bld.trim);
    if (spec.craft) { setCol('craftBand', spec.craft.band); setCol('craftNose', spec.craft.nose); }
    if (spec.rover) { setCol('roverBody', spec.rover.body); setCol('roverTrim', spec.rover.trim); }
    if ('patch' in spec) setPatch(spec.patch);
    return true;
  }

  return { building, shield, relic, deposit, lander, capsule, cookies, astronaut, rover, tris, mat, setLook, KEYS: Object.keys(B),
    patchCanvas: () => { patchTex(); return patchCv; }, matCount: () => Object.keys(MC).length };
})();
