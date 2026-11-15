'use strict';


const S3 = (() => {
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const TS = 8;
  const MW = MAPW * TS, MH = MAPH * TS;
  const GRAV = { ay: 1.62, mars: 3.73 }, JUMPV = { ay: 3.0, mars: 3.7 };
  const REACH = 14, EDGE = 16;
  const cl = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = cl((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const hasModel = () => typeof MODEL !== 'undefined' && !!MODEL;
  const tc = t => t * TS + TS / 2;


  function hsh(a, b, s) {
    let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(s | 0, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function vn(x, z, s) {
    const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
    const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
    const a = hsh(ix, iz, s), b = hsh(ix + 1, iz, s), c = hsh(ix, iz + 1, s), d = hsh(ix + 1, iz + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, z, s, o) {
    let sum = 0, amp = 0.5, f = 1, n = 0;
    for (let i = 0; i < o; i++) { sum += amp * (vn(x * f, z * f, s + i * 17) * 2 - 1); n += amp; amp *= 0.5; f *= 2.03; }
    return sum / n;
  }
  function rdg(x, z, s, o) {
    let sum = 0, amp = 0.5, f = 1, n = 0;
    for (let i = 0; i < o; i++) { let v = 1 - Math.abs(vn(x * f, z * f, s + i * 31) * 2 - 1); v *= v; sum += amp * v; n += amp; amp *= 0.5; f *= 2.1; }
    return sum / n;
  }

  function fbmL(x, z, s, o, base, lmin) {
    let sum = 0, amp = 0.5, f = 1, n = 0;
    for (let i = 0; i < o; i++) {
      const wl = base / f, k = smooth(lmin, lmin * 2, wl);
      if (k > 0) sum += amp * k * (vn(x * f / base, z * f / base, s + i * 17) * 2 - 1);
      n += amp; amp *= 0.5; f *= 2.03;
    }
    return sum / n;
  }
  function rdgL(x, z, s, o, base, lmin) {
    let sum = 0, amp = 0.5, f = 1, n = 0;
    for (let i = 0; i < o; i++) {
      const wl = base / f, k = smooth(lmin, lmin * 2, wl);
      let v = 1 - Math.abs(vn(x * f / base, z * f / base, s + i * 31) * 2 - 1); v *= v;
      sum += amp * lerp(0.45, v, k); n += amp; amp *= 0.5; f *= 2.1;
    }
    return sum / n;
  }
  function vn3(x, y, z, s) {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z), fx = x - ix, fy = y - iy, fz = z - iz;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
    const H = (a, b, c) => hsh(a * 7 + c * 131, b, s + c * 19);
    const l = (a, b, t) => a + (b - a) * t;
    return l(l(l(H(ix, iy, iz), H(ix + 1, iy, iz), u), l(H(ix, iy + 1, iz), H(ix + 1, iy + 1, iz), u), v),
             l(l(H(ix, iy, iz + 1), H(ix + 1, iy, iz + 1), u), l(H(ix, iy + 1, iz + 1), H(ix + 1, iy + 1, iz + 1), u), v), w);
  }
  function prng(a) {
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function craterF(x, z, cell, rmin, rmax, s) {
    const cx = Math.floor(x / cell), cz = Math.floor(z / cell); let h = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const a = cx + i, b = cz + j;
      if (hsh(a, b, s) > 0.62) continue;
      const px = (a + 0.2 + 0.6 * hsh(a, b, s + 1)) * cell, pz = (b + 0.2 + 0.6 * hsh(a, b, s + 2)) * cell;
      const rad = rmin + (rmax - rmin) * Math.pow(hsh(a, b, s + 3), 2);
      const q = Math.hypot(x - px, z - pz) / rad;
      if (q < 1) h -= rad * 0.22 * (1 - q * q);
      if (q < 1.9) h += rad * 0.07 * Math.exp(-(((q - 1) / 0.28) ** 2));
    }
    return h;
  }


  let R = null, canvas = null, scene = null, cam = null, ok = false;
  let W = null;
  let mode = 'walk', inputOn = true, qual = 'high';
  let clockT = 0, cw = 1, ch = 1, pScale = 400;
  const listeners = {};
  const emit = (n, ...a) => { (listeners[n] || []).forEach(f => { try { f(...a); } catch (e) { console.error(e); } }); };
  const aim = { kind: 'none', tx: -1, ty: -1, bid: 0, relic: -1, dist: 0, x: 0, y: 0, z: 0 };

  const PLAN_FOV = 28, PLAN_PITCH = 0.98, WALK_FOV = 62;
  const PL = { x: 0, z: 0, yaw: 0, yawT: 0, dist: 90, distT: 90, prev: 'walk', hintK: '', frozenT: null, frozenN: 0, hover: '' };
  const blend = { t: 1, dur: 0.5, p0: null, q0: null, f0: WALK_FOV };
  const WK = { on: false, goal: null, stuck: 0, lastD: 0, w: null, pi: 0, ref: null, retry: 0, found: false };
  const SC = { on: false, t: 0, done: null, obj: null };
  const P = { x: tc(HUBX), z: tc(HUBY) + 12, y: 0, vx: 0, vz: 0, vy: 0, yaw: 0, pitch: -0.2, onGround: true, moving: false,
    face: 0, phase: 0, camD: 4.4, camDT: 4.4, camY: 0, puff: 0, jumpReq: false };
  const DR = { x: tc(HUBX), z: tc(HUBY), dist: 80, distT: 80, yaw: 0, pitch: 0.95 };
  let ghostK = null, scanP = null, flashA = 0, shake = 0;
  const flashCol = [1, 1, 1];
  let pendingHit = false;


  let sunL, amb, hemi, earthL, hubL, lamp, shipL, droneL, showRim = null, seraL = [];
  const DRONE_FILL = { moon: 0.55, mars: 0.4 };
  let sky, starsA, starsB, earth, earthGlow, overlayV, overlayF;
  const C = {};
  const lin = hex => new THREE.Color(hex).convertSRGBToLinear();


  const matCache = {};
  function fmat(hex, o) {
    const key = hex + JSON.stringify(o || {});
    if (!matCache[key]) matCache[key] = new THREE.MeshStandardMaterial(Object.assign({ color: lin(hex), roughness: 0.8, metalness: 0.05 }, o || {}));
    return matCache[key];
  }
  function canvasTex(w, h, draw, srgb) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.encoding = THREE.sRGBEncoding;
    return t;
  }
  function glowTex(r, g, b) {
    return canvasTex(128, 128, (x, w) => {
      const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(0.25, `rgba(${r},${g},${b},0.45)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      x.fillStyle = gr; x.fillRect(0, 0, w, w);
    });
  }


  let SH = { x: MW / 2, z: -50 - 1100, R: 1100, D: 520 };
  function featOf(s) {
    const f = new Array(MAPW * MAPH).fill(null);
    for (let y = 0; y < MAPH; y++) for (let x = 0; x < MAPW; x++) {
      const i = y * MAPW + x, k = s.map.k[i], v = s.map.v ? s.map.v[i] : (i * 397) % 1000;
      if (k === 'c') f[i] = { k, x: tc(x) + ((v % 10) / 9 - 0.5) * 1.6, z: tc(y) + ((((v / 10) | 0) % 10) / 9 - 0.5) * 1.6, r: 2.5 + ((v / 100) | 0) * 0.09, d: 1.1 + (v % 7) * 0.07 };
      else if (k === 't') f[i] = { k, x: tc(x), z: tc(y), r: 3.3, d: 4.0 };
    }
    return f;
  }
  function tileH(x, z) {
    const tx = Math.floor(x / TS), tz = Math.floor(z / TS); let h = 0;
    for (let j = tz - 1; j <= tz + 1; j++) {
      if (j < 0 || j >= MAPH) continue;
      for (let i = tx - 1; i <= tx + 1; i++) {
        if (i < 0 || i >= MAPW) continue;
        const f = W.feat[j * MAPW + i]; if (!f) continue;
        const q = Math.hypot(x - f.x, z - f.z) / f.r;
        if (f.k === 'c') {
          if (q < 1) h -= f.d * (1 - q * q);
          if (q < 1.9) h += f.d * 0.38 * Math.exp(-(((q - 1.05) / 0.26) ** 2));
        } else {
          if (q < 1.05) h -= f.d * (1 - smooth(0.45, 1.0, q));
          if (q < 1.6) h += 0.35 * Math.exp(-(((q - 1.12) / 0.14) ** 2));
        }
      }
    }
    return h;
  }

  function craters(x, z, d, sd, k) {
    let h = 0;
    if (d < 70) h += craterF(x, z, 24, 2, 7, sd + 50) * (1 - smooth(25, 70, d));
    if (d < 260) h += craterF(x, z, 80, 8, 30, sd + 40) * smooth(8, 40, d) * (1 - smooth(140, 260, d));
    if (d > 150) h += craterF(x, z, 760, 110, 330, sd + 45) * smooth(150, 400, d) * k;
    return h;
  }
  function farMoon(x, z, d) {
    const w = smooth(3, 150, d), sd = W.sd, lm = 0.45 * d + 1;
    const cx = x - MW / 2, cz = z - MH / 2, r = Math.hypot(cx, cz);
    let h = fbmL(x, z, sd + 11, 4, 170, lm) * 16 * w;
    h += craters(x, z, d, sd, 1) * w;
    const dc = Math.hypot(x - SH.x, z - SH.z), sg = dc - SH.R;
    if (sg < 0) { const u = -sg / SH.R; h -= SH.D * (1 - Math.pow(1 - u, 3)) - fbmL(x, z, sd + 3, 3, 260, lm) * 30 * u; }
    else h -= sg * 0.03 * w;
    const ang = Math.abs(Math.atan2(cx, -cz));
    const mk = smooth(0.45, 0.95, ang) * smooth(SH.R + 150, SH.R + 700, dc) * smooth(900, 2300, r);
    if (mk > 0) h += mk * Math.pow(rdgL(x, z, sd + 23, 4, 1100, lm), 1.6) * 520;
    return h;
  }
  function farMars(x, z, d) {
    const w = smooth(3, 150, d), sd = W.sd, lm = 0.45 * d + 1;
    const cx = x - MW / 2, cz = z - MH / 2, r = Math.hypot(cx, cz);
    let h = fbmL(x, z, sd + 11, 4, 210, lm) * 11 * w;
    h += craters(x, z, d, sd, 0.5) * 0.55 * w;
    const dn = smooth(90, 320, r) * (1 - smooth(900, 1500, r));
    if (dn > 0) {
      const v = x * 0.8 + z * 0.55 + fbmL(x, z, sd + 7, 2, 140, lm) * 70;
      h += dn * Math.pow(0.5 + 0.5 * Math.sin(v / 34), 2.6) * 8 * (0.6 + 0.4 * fbmL(x, z, sd + 8, 2, 300, lm));
    }
    const mz = smooth(650, 1400, r);
    if (mz > 0) {
      const n = fbmL(x, z, sd + 31, 4, 800, lm) * 0.5 + 0.5, pl = smooth(0.52, 0.555, n);
      h += mz * (pl * (150 + 45 * fbmL(x, z, sd + 3, 2, 220, lm)) + n * 40);
    }
    return h;
  }
  function hAt(x, z) {
    if (!W) return 0;
    const sd = W.sd;
    const dx = x < 0 ? -x : x > MW ? x - MW : 0, dz = z < 0 ? -z : z > MH ? z - MH : 0, d = dx || dz ? Math.hypot(dx, dz) : 0;
    let h = 0;
    if (d < 60) h = (fbm(x / 38, z / 38, sd, 3) * 0.32 + fbm(x / 7, z / 7, sd + 5, 2) * 0.07) * (1 - smooth(8, 60, d));
    if (dx < 10 && dz < 10) h += tileH(x, z);
    if (d > 0) h += W.moon ? farMoon(x, z, d) : farMars(x, z, d);
    return h;
  }


  function axis(lo, hi, step, nOut, s0, g) {
    const mid = []; for (let v = lo; v <= hi + 1e-6; v += step) mid.push(v);
    const pre = [], post = []; let st = s0, v = lo;
    for (let i = 0; i < nOut; i++) { v -= st; pre.push(v); st *= g; }
    st = s0; v = mid[mid.length - 1];
    for (let i = 0; i < nOut; i++) { v += st; post.push(v); st *= g; }
    return pre.reverse().concat(mid, post);
  }
  function tileW(x, z, kind) {
    const tx = Math.floor(x / TS), tz = Math.floor(z / TS); let w = 0;
    for (let j = tz - 1; j <= tz + 1; j++) for (let i = tx - 1; i <= tx + 1; i++) {
      if (i < 0 || j < 0 || i >= MAPW || j >= MAPH || W.s.map.k[j * MAPW + i] !== kind) continue;
      const d = Math.hypot(x - tc(i), z - tc(j)) + fbm(x / 3, z / 3, W.sd + 70, 2) * 1.6;
      w = Math.max(w, 1 - smooth(2.6, 4.9, d));
    }
    return w;
  }
  function grainTex(mars) {
    const N = 512;
    return canvasTex(N, N, (g) => {
      const img = g.createImageData(N, N), d = img.data;
      const pn = (x, y, per, s) => {
        const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
        const H = (a, b) => hsh(((a % per) + per) % per, ((b % per) + per) % per, s);
        const a = H(ix, iy), b = H(ix + 1, iy), c = H(ix, iy + 1), e = H(ix + 1, iy + 1);
        return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v;
      };
      const rr = prng(mars ? 77 : 33);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        let v = 0.74 + 0.2 * (pn(x / 64, y / 64, 8, 1) - 0.5) + 0.12 * (pn(x / 16, y / 16, 32, 2) - 0.5) + 0.06 * (pn(x / 6.4, y / 6.4, 80, 3) - 0.5);
        if (mars) v += 0.06 * Math.sin((x + y * 0.35 + pn(x / 32, y / 32, 16, 4) * 36) / N * TAU * 12);
        const o = (y * N + x) * 4, c = cl(v, 0, 1) * 255;
        d[o] = d[o + 1] = d[o + 2] = c; d[o + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      const pits = mars ? 10 : 34;
      for (let i = 0; i < pits; i++) {
        const x = rr() * N, y = rr() * N, r = 4 + Math.pow(rr(), 2.5) * (mars ? 12 : 26);
        for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
          const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r * 1.25);
          gr.addColorStop(0, 'rgba(60,60,60,0.28)'); gr.addColorStop(0.7, 'rgba(80,80,80,0.18)'); gr.addColorStop(0.85, 'rgba(225,225,225,0.22)'); gr.addColorStop(1, 'rgba(225,225,225,0)');
          g.beginPath(); g.arc(x + ox, y + oy, r * 1.25, 0, TAU); g.fillStyle = gr; g.fill();
        }
      }
    }, true);
  }

  function bumpTex(gt) {
    const N = gt.image.width, px = gt.image.getContext('2d').getImageData(0, 0, N, N).data;
    const R = 7, SG = 3, w = []; let ws = 0;
    for (let k = -R; k <= R; k++) { const v = Math.exp(-k * k / (2 * SG * SG)); w.push(v); ws += v; }
    for (let k = 0; k < w.length; k++) w[k] /= ws;
    const a = new Float32Array(N * N), b = new Float32Array(N * N);
    for (let i = 0; i < N * N; i++) a[i] = px[i * 4];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let s = 0; for (let k = -R; k <= R; k++) s += a[y * N + ((x + k + N) % N)] * w[k + R]; b[y * N + x] = s; }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { let s = 0; for (let k = -R; k <= R; k++) s += b[((y + k + N) % N) * N + x] * w[k + R]; a[y * N + x] = s; }
    const r = prng(91);
    return canvasTex(N, N, (g) => {
      const img = g.createImageData(N, N), d = img.data;
      for (let i = 0; i < N * N; i++) { const v = cl(Math.round(a[i] + (r() + r() - 1)), 0, 255); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
      g.putImageData(img, 0, 0);
    });
  }
  function buildTerrain() {
    const xs = axis(-24, MW + 24, 1, 46, 1, 1.155), zs = axis(-24, MH + 24, 1, 46, 1, 1.155);
    const nx = xs.length, nz = zs.length, n = nx * nz;
    const pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), col = new Float32Array(n * 3);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const k = j * nx + i, x = xs[i], z = zs[j];
      pos[k * 3] = x; pos[k * 3 + 1] = hAt(x, z); pos[k * 3 + 2] = z;
      uv[k * 2] = x / 6; uv[k * 2 + 1] = z / 6;
    }
    const idx = new Uint32Array((nx - 1) * (nz - 1) * 6); let q = 0;
    for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
      idx[q++] = a; idx[q++] = c; idx[q++] = b; idx[q++] = b; idx[q++] = c; idx[q++] = d;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.computeVertexNormals();
    const nr = geo.attributes.normal.array, sd = W.sd, K = 1.28;
    const tmp = new THREE.Color();
    for (let k = 0; k < n; k++) {
      const x = pos[k * 3], h = pos[k * 3 + 1], z = pos[k * 3 + 2], ny = nr[k * 3 + 1];
      const inMapA = x > -12 && z > -12 && x < MW + 12 && z < MH + 12;
      const dx = x < 0 ? -x : x > MW ? x - MW : 0, dz = z < 0 ? -z : z > MH ? z - MH : 0, lm = 0.45 * Math.hypot(dx, dz) + 1;
      const n1 = fbmL(x, z, sd + 60, 3, 23, lm), n2 = fbmL(x, z, sd + 61, 3, 260, lm);
      if (W.moon) {
        let f = 0.9 + 0.1 * n1 + 0.12 * n2 + (1 - ny) * 0.12;
        tmp.copy(C.soil).multiplyScalar(f * K);
        const dc = Math.hypot(x - SH.x, z - SH.z);
        if (dc < SH.R + 60) tmp.multiplyScalar(lerp(1, 0.06, smooth(6, 110, -h)));
      } else {
        let f = 0.9 + 0.13 * n1 + 0.12 * n2;
        tmp.copy(C.soil).lerp(C.dust, smooth(-0.2, 0.6, n2 + n1 * 0.3) * Math.pow(Math.max(ny, 0), 6) * 0.8);
        tmp.lerp(C.rock, smooth(0.08, 0.35, 1 - ny));
        if (h > 30) f *= 0.92 + 0.1 * Math.sin(h * 0.22);
        tmp.multiplyScalar(f * K);
      }
      if (inMapA) {
        const wi = tileW(x, z, 'i'), wo = tileW(x, z, 'm');
        if (wi > 0) tmp.lerp(C.ice, wi * 0.9);
        if (wo > 0) tmp.lerp(C.ore, wo * 0.85);
        const th = tileH(x, z);
        if (th < -0.3) tmp.multiplyScalar(lerp(1, W.moon ? 0.55 : 0.7, smooth(0.3, 3.5, -th)));
      }
      col[k * 3] = tmp.r; col[k * 3 + 1] = tmp.g; col[k * 3 + 2] = tmp.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const gt = grainTex(!W.moon);

    const bt = bumpTex(gt);
    for (const t of [gt, bt]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = Math.min(8, R.capabilities.getMaxAnisotropy()); }
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, map: gt, bumpMap: bt, bumpScale: W.moon ? 0.55 : 0.45, roughness: 0.97, metalness: 0 });

    W.fogU = { uSeen: { value: null }, uFogK: { value: 0 }, uPlanK: { value: 0 }, uHover: { value: new THREE.Vector4(-1, -1, -1, -1) }, uHoverCol: { value: new THREE.Color(0x49e08a) },
      uKind: { value: null }, uKindSel: { value: 0 }, uKindCol: { value: new THREE.Color(0x4fb8ff) }, uT: { value: 0 } };
    mat.onBeforeCompile = sh => {
      for (const k in W.fogU) sh.uniforms[k] = W.fogU[k];
      sh.vertexShader = 'varying vec2 vFogW;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n  vFogW = (modelMatrix * vec4(transformed, 1.0)).xz;');
      sh.fragmentShader = 'uniform sampler2D uSeen, uKind; uniform float uFogK, uPlanK, uKindSel, uT; uniform vec4 uHover; uniform vec3 uHoverCol, uKindCol; varying vec2 vFogW;\n' + sh.fragmentShader.replace('#include <tonemapping_fragment>', `
        if (uPlanK > 0.001) {
          vec2 mw = vec2(${MW.toFixed(1)}, ${MH.toFixed(1)});
          float inM = step(0.0, vFogW.x) * step(vFogW.x, mw.x) * step(0.0, vFogW.y) * step(vFogW.y, mw.y);
          vec2 tq = vFogW / 8.0, fw = max(fwidth(tq), vec2(1e-4));
          vec2 dl = (0.5 - abs(fract(tq) - 0.5)) / fw;
          float line = (1.0 - smoothstep(0.6, 1.6, min(dl.x, dl.y))) * inM;
          if (uKindSel > 0.5) {
            float kc = floor(texture2D(uKind, vFogW / mw).r * 3.0 + 0.5);
            float on = (1.0 - step(0.5, abs(kc - uKindSel))) * inM;
            gl_FragColor.rgb = mix(gl_FragColor.rgb, uKindCol * (0.7 + 0.2 * sin(uT * 3.0)), on * 0.62 * uPlanK);
          }
          vec2 q = vFogW; float inT = step(uHover.x, q.x) * step(q.x, uHover.z) * step(uHover.y, q.y) * step(q.y, uHover.w);
          vec2 te = min(q - uHover.xy, uHover.zw - q); float edge = (1.0 - smoothstep(0.15, 0.6, min(te.x, te.y))) * inT;
          gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.16, 0.2, 0.26), line * 0.75 * uPlanK);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, uHoverCol * 0.6, inT * (0.32 + 0.06 * sin(uT * 5.0)) * uPlanK);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, uHoverCol * 1.4, edge * 0.9 * uPlanK);
        }
        if (uFogK > 0.001) {
          vec2 fu = vFogW / vec2(${MW.toFixed(1)}, ${MH.toFixed(1)}), px = vec2(${(0.6 / MAPW).toFixed(5)}, ${(0.6 / MAPH).toFixed(5)});
          float sn = 0.0;
          for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) {
            vec2 q = fu + vec2(float(i), float(j)) * px;
            sn += texture2D(uSeen, q).r * step(0.0, q.x) * step(q.x, 1.0) * step(0.0, q.y) * step(q.y, 1.0);
          }
          sn = smoothstep(0.08, 0.92, sn / 9.0);
          gl_FragColor.rgb *= mix(vec3(1.0), vec3(0.42, 0.45, 0.55), uFogK * (1.0 - sn));
        }
        #include <tonemapping_fragment>`);
    };
    own(bt);
    const m = new THREE.Mesh(geo, mat);
    m.receiveShadow = true; m.castShadow = false;
    own(geo, mat, gt);
    return m;
  }


  const SKY_VS = `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const SKY_FS = `
    uniform vec3 uHor, uZen, uSun, uGlow, uSunCol; uniform float uGlowK, uWide, uDisc, uFlare, uTime;
    varying vec3 vDir;
    void main(){
      vec3 d = normalize(vDir);
      float e = d.y;
      vec3 col = mix(uHor, uZen, pow(clamp(e, 0.0, 1.0), 0.42));
      float sd = max(dot(d, uSun), 0.0);
      col += uGlow * uGlowK * (pow(sd, 4.0) * 0.55 * uWide + pow(sd, 32.0) * 1.2 + pow(sd, 400.0) * 3.0);
      col += uSunCol * smoothstep(uDisc, uDisc + 0.00003, sd);
      if (uFlare > 0.0) {
        float w = sin(d.x * 9.0 + uTime * 0.6) * sin(d.z * 7.0 - uTime * 0.45) + 0.6 * sin((d.x - d.z) * 15.0 + uTime * 1.3);
        col += vec3(0.5, 0.06, 0.42) * uFlare * (0.4 + 0.6 * w) * smoothstep(0.08, 0.6, e) * 0.08;
      }
      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <encodings_fragment>
    }`;
  function makeSky() {
    const m = new THREE.ShaderMaterial({
      uniforms: { uHor: { value: new THREE.Color() }, uZen: { value: new THREE.Color() }, uSun: { value: new THREE.Vector3(0, 1, 0) },
        uGlow: { value: new THREE.Color(1, 1, 1) }, uSunCol: { value: new THREE.Color() }, uGlowK: { value: 0 }, uWide: { value: 1 }, uDisc: { value: 0.99995 },
        uFlare: { value: 0 }, uTime: { value: 0 } },
      vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false });
    const s = new THREE.Mesh(new THREE.SphereGeometry(5000, 48, 24), m);
    s.renderOrder = -10; s.frustumCulled = false;
    return s;
  }
  function makeStars(n, size, seed, band) {
    const r = prng(seed), pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const nrm = new THREE.Vector3(0.35, 0.62, 0.7).normalize(), a = new THREE.Vector3(1, 0, 0).cross(nrm).normalize(), b = nrm.clone().cross(a);
    const v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      if (r() < band) {
        const th = r() * TAU, off = (r() + r() + r() - 1.5) * 0.16;
        v.copy(a).multiplyScalar(Math.cos(th)).addScaledVector(b, Math.sin(th)).addScaledVector(nrm, off).normalize();
      } else {
        const u = r() * 2 - 1, th = r() * TAU, s = Math.sqrt(1 - u * u);
        v.set(s * Math.cos(th), u, s * Math.sin(th));
      }
      if (v.y < -0.15) v.y = -v.y;
      pos[i * 3] = v.x * 4800; pos[i * 3 + 1] = v.y * 4800; pos[i * 3 + 2] = v.z * 4800;
      const br = 0.15 + Math.pow(r(), 3.2) * 0.85, t = r();
      col[i * 3] = br * (t < 0.2 ? 1.0 : t > 0.85 ? 0.75 : 0.92); col[i * 3 + 1] = br * 0.92; col[i * 3 + 2] = br * (t > 0.85 ? 1.0 : t < 0.2 ? 0.7 : 0.95);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, depthTest: false, fog: false, toneMapped: false, blending: THREE.AdditiveBlending });
    const p = new THREE.Points(g, m); p.renderOrder = -9; p.frustumCulled = false;
    return p;
  }
  function earthTex() {
    return canvasTex(256, 128, (g, w, h) => {
      const img = g.createImageData(w, h), d = img.data;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const lon = x / w * TAU, lat = (0.5 - y / h) * Math.PI;
        const px = Math.cos(lat) * Math.cos(lon), py = Math.sin(lat), pz = Math.cos(lat) * Math.sin(lon);
        let n = 0, a = 0.5, f = 1.6;
        for (let o = 0; o < 4; o++) { n += a * (vn3(px * f + 5, py * f, pz * f, 11 + o) - 0.5); a *= 0.5; f *= 2.1; }
        let c2 = 0, a2 = 0.5, f2 = 2.4;
        for (let o = 0; o < 3; o++) { c2 += a2 * (vn3(px * f2, py * f2 * 2.2, pz * f2 + 3, 51 + o) - 0.5); a2 *= 0.5; f2 *= 2.3; }
        let r, gg, b;
        if (n > 0.04) { const k = Math.min(1, (n - 0.04) * 6); r = lerp(70, 150, k * 0.6); gg = lerp(110, 120, k); b = lerp(55, 70, k); }
        else { const k = Math.max(0, 0.04 - n) * 5; r = 25 - k * 10; gg = 75 - k * 25; b = 160 - k * 20; }
        if (Math.abs(lat) > 1.15) { r = gg = b = 235; }
        const cl2 = smooth(0.02, 0.16, c2 + Math.abs(lat) * 0.05);
        r = lerp(r, 245, cl2); gg = lerp(gg, 248, cl2); b = lerp(b, 252, cl2);
        const o = (y * w + x) * 4; d[o] = r; d[o + 1] = gg; d[o + 2] = b; d[o + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    });
  }
  function makeEarth() {
    const m = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: earthTex() }, uL: { value: new THREE.Vector3(0, 0, 1) } },
      vertexShader: `varying vec3 vN; varying vec2 vUv; varying vec3 vV;
        void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D uMap; uniform vec3 uL; varying vec3 vN; varying vec2 vUv; varying vec3 vV;
        void main(){
          vec3 c = pow(texture2D(uMap, vUv).rgb, vec3(2.2));
          vec3 n = normalize(vN); float l = dot(n, normalize(uL));
          float day = smoothstep(-0.06, 0.25, l);
          vec3 col = c * day * 2.2 + c * 0.012;
          float rim = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 2.4);
          col += vec3(0.25, 0.5, 1.0) * rim * (0.15 + 1.1 * smoothstep(-0.25, 0.5, l));
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }`,
      depthWrite: false, fog: false });
    const e = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), m);
    e.renderOrder = -8; e.frustumCulled = false; e.rotation.z = 0.41;
    return e;
  }
  const OV_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  function makeOverlays() {
    const geo = new THREE.PlaneGeometry(2, 2);
    const v = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      uniforms: { uK: { value: 0.35 }, uCol: { value: new THREE.Color(0, 0, 0) } },
      vertexShader: OV_VS,
      fragmentShader: `uniform float uK; uniform vec3 uCol; varying vec2 vUv;
        void main(){ vec2 q = vUv - 0.5; float a = smoothstep(0.35, 0.95, length(q * vec2(1.25, 1.0)) * 1.25); gl_FragColor = vec4(uCol, a * uK); }`,
      transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
    const f = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      uniforms: { uCol: { value: new THREE.Color(1, 1, 1) }, uA: { value: 0 }, uFlare: { value: 0 }, uEdge: { value: 0 }, uTime: { value: 0 } },
      vertexShader: OV_VS,
      fragmentShader: `uniform vec3 uCol; uniform float uA, uFlare, uEdge, uTime; varying vec2 vUv;
        void main(){
          vec3 c = uCol * uA;
          float sh = 0.5 + 0.5 * sin(vUv.x * 11.0 + uTime * 1.7) * sin(vUv.y * 5.0 - uTime * 1.1);
          float edge = smoothstep(0.3, 0.75, length((vUv - 0.5) * vec2(1.3, 1.0)) * 1.25); // dron: kenar parlaması, orta temiz
          c += vec3(0.32, 0.03, 0.26) * uFlare * mix(smoothstep(0.35, 1.0, vUv.y), edge, uEdge) * (0.45 + 0.55 * sh);
          gl_FragColor = vec4(c, 1.0); }`,
      transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, toneMapped: false }));
    for (const m of [v, f]) { m.frustumCulled = false; }
    v.renderOrder = 998; f.renderOrder = 999;
    return [v, f];
  }


  const PT_VS = `attribute float aSize; attribute float aAlpha; varying float vA; uniform float uScale;
    void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = min(160.0, aSize * uScale / max(-mv.z, 0.1)); vA = aAlpha; gl_Position = projectionMatrix * mv; }`;
  const PT_FS = `uniform vec3 uCol; uniform float uOp; varying float vA;
    void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c) * 2.0; if (d > 1.0) discard; float k = 1.0 - d; gl_FragColor = vec4(uCol, vA * uOp * k * k); }`;
  function makeParts(N, colHex) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3), sz = new Float32Array(N), al = new Float32Array(N);
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(al, 1).setUsage(THREE.DynamicDrawUsage));
    const m = new THREE.ShaderMaterial({ uniforms: { uCol: { value: new THREE.Color(colHex) }, uOp: { value: 1 }, uScale: { value: pScale } },
      vertexShader: PT_VS, fragmentShader: PT_FS, transparent: true, depthWrite: false, toneMapped: false });
    const p = new THREE.Points(g, m); p.frustumCulled = false;
    own(g, m);
    return { p, g, m, pos, sz, al, vel: new Float32Array(N * 3), life: new Float32Array(N), max: new Float32Array(N), base: new Float32Array(N), N, next: 0 };
  }
  function emit1(S, x, y, z, vx, vy, vz, life, size) {
    const i = S.next; S.next = (S.next + 1) % S.N;
    S.pos[i * 3] = x; S.pos[i * 3 + 1] = y; S.pos[i * 3 + 2] = z;
    S.vel[i * 3] = vx; S.vel[i * 3 + 1] = vy; S.vel[i * 3 + 2] = vz;
    S.life[i] = S.max[i] = life; S.base[i] = size; S.sz[i] = size;
  }
  function burst(x, z, n, spd, up, life, size) {
    if (!W) return;
    const y = hAt(x, z) + 0.2, S = W.dust, r = Math.random;
    for (let i = 0; i < n; i++) {
      const a = r() * TAU, v = spd * (0.4 + 0.6 * r());
      emit1(S, x + Math.cos(a) * 0.4, y, z + Math.sin(a) * 0.4, Math.cos(a) * v, up * (0.3 + r()), Math.sin(a) * v, life * (0.6 + 0.6 * r()), size * (0.6 + 0.8 * r()));
    }
  }
  function stepParts(S, dt) {
    const g = W.moon ? GRAV.ay : GRAV.mars, drag = W.moon ? 0.15 : 1.6;
    for (let i = 0; i < S.N; i++) {
      if (S.life[i] <= 0) { S.al[i] = 0; continue; }
      S.life[i] -= dt;
      const k = i * 3, f = Math.max(0, 1 - drag * dt);
      S.vel[k] *= f; S.vel[k + 2] *= f; S.vel[k + 1] = S.vel[k + 1] * f - g * dt * (W.moon ? 1 : 0.25);
      S.pos[k] += S.vel[k] * dt; S.pos[k + 1] += S.vel[k + 1] * dt; S.pos[k + 2] += S.vel[k + 2] * dt;
      const gy = hAt(S.pos[k], S.pos[k + 2]);
      if (S.pos[k + 1] < gy + 0.05) { S.pos[k + 1] = gy + 0.05; S.vel[k] *= 0.5; S.vel[k + 2] *= 0.5; S.vel[k + 1] = 0; }
      const t = S.life[i] / S.max[i];
      S.al[i] = Math.min(1, t * 1.6) * 0.55;
      S.sz[i] = S.base[i] * (1 + (1 - t) * (W.moon ? 0.6 : 2.2));
    }
    S.g.attributes.position.needsUpdate = S.g.attributes.aSize.needsUpdate = S.g.attributes.aAlpha.needsUpdate = true;
  }
  function makeStorm(N) {
    const S = makeParts(N, 0xffffff), r = prng(91);
    for (let i = 0; i < N; i++) { S.vel[i * 3] = r() * 80; S.vel[i * 3 + 1] = r() * 30; S.vel[i * 3 + 2] = r() * 80; S.base[i] = 0.3 + r() * r() * 1.4; S.life[i] = r() * TAU; }
    S.p.material.blending = THREE.NormalBlending;
    return S;
  }
  function stepStorm(S, amt, dt) {
    const N = amt > 0.01 ? S.N : (W.moon ? 0 : 260);
    S.g.setDrawRange(0, N); S.p.visible = N > 0;
    if (!N) return;
    const cp = cam.position, wx = 16 + 10 * amt, wz = 5;
    for (let i = 0; i < N; i++) {
      const k = i * 3;
      const ox = (((S.vel[k] + wx * clockT * (0.6 + 0.4 * (i % 7) / 7)) % 80) + 80) % 80;
      const oy = (((S.vel[k + 1] + Math.sin(clockT * 0.7 + S.life[i]) * 2 - clockT * 0.6) % 30) + 30) % 30;
      const oz = (((S.vel[k + 2] + wz * clockT) % 80) + 80) % 80;
      S.pos[k] = cp.x - 40 + ox; S.pos[k + 1] = cp.y - 12 + oy; S.pos[k + 2] = cp.z - 40 + oz;
      S.sz[i] = S.base[i] * (amt > 0.01 ? 1 : 0.4);
      S.al[i] = amt > 0.01 ? 0.3 + 0.45 * amt : 0.12;
    }
    S.m.uniforms.uOp.value = amt > 0.01 ? Math.min(1, amt * 1.3) : 0.5;
    S.g.attributes.position.needsUpdate = S.g.attributes.aSize.needsUpdate = S.g.attributes.aAlpha.needsUpdate = true;
  }


  const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  const cyl = (r1, r2, h, m, seg) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg || 16), m);
  function fbBuilding(k) {
    const g = new THREE.Group();
    const white = fmat(0xd9dbe0), dark = fmat(0x323846), cell = fmat(0x1a2a55, { roughness: 0.35, metalness: 0.4 });
    const gold = fmat(0xc9a03a, { roughness: 0.35, metalness: 0.7 });
    const win = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: lin(0xF2A33A), emissiveIntensity: 1.2 });
    let h = 3, r = 2.6, sunTrack = null; const anim = [];
    const add = (m, x, y, z) => { m.position.set(x, y, z); g.add(m); return m; };
    if (k === 'hub') {
      for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + 0.78; const l = add(cyl(0.08, 0.1, 2.2, dark, 6), Math.cos(a) * 2.2, 1.0, Math.sin(a) * 2.2); l.rotation.z = Math.cos(a) * 0.35; l.rotation.x = -Math.sin(a) * 0.35; }
      add(cyl(2.4, 2.6, 2.6, white, 20), 0, 2.4, 0); add(cyl(1.4, 2.4, 1.2, white, 20), 0, 4.3, 0);
      add(cyl(0.05, 0.05, 1.6, dark, 6), 0.6, 5.6, 0); add(box(0.9, 1.3, 0.1, dark), 0, 2.2, 2.55); add(box(1.4, 0.3, 0.1, win), 0, 3.2, 2.5);
      add(box(4.9, 0.25, 4.9, gold), 0, 1.15, 0); h = 5.4; r = 3.0;
    } else if (k === 'gunes') {
      add(cyl(0.12, 0.15, 2.2, dark, 8), 0, 1.1, 0);
      sunTrack = new THREE.Group(); sunTrack.position.y = 2.3; g.add(sunTrack);
      const pn = box(4.2, 0.08, 2.6, cell); pn.rotation.x = -0.9; sunTrack.add(pn);
      h = 3.6; r = 1.3;
    } else if (k === 'pist') {
      add(cyl(3.7, 3.8, 0.15, fmat(0x6c6c6c), 32), 0, 0.07, 0); add(new THREE.Mesh(new THREE.RingGeometry(2.2, 2.5, 32), fmat(0xe8e8e8)), 0, 0.16, 0).rotation.x = -Math.PI / 2;
      h = 0.3; r = 0;
    } else if (k === 'sera') {
      const half = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 6, 16, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.35, roughness: 0.1 }));
      half.rotation.z = Math.PI / 2; half.rotation.y = Math.PI / 2; add(half, 0, 0.1, 0);
      add(box(3, 0.5, 5.4, new THREE.MeshStandardMaterial({ color: 0x2f7d3a, emissive: lin(0xd040c0), emissiveIntensity: 0.6 })), 0, 0.35, 0);
      h = 2.2; r = 3.0;
    } else if (k === 'anten') {
      add(cyl(0.12, 0.18, 3.5, dark, 8), 0, 1.75, 0);
      const dish = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 8, 0, TAU, 0, 1.0), white); dish.rotation.x = -1.0; add(dish, 0, 3.8, 0);
      anim.push({ o: dish, axis: 'y', speed: 0.3 }); h = 5; r = 1.4;
    } else {
      const ht = (BLD[k] && BLD[k].hgt ? BLD[k].hgt : 0.8) * 3.4 + 0.6;
      add(box(4.4, ht, 3.4, white), 0, ht / 2 + 0.1, 0); add(box(4.5, 0.25, 3.5, gold), 0, 0.3, 0);
      add(box(1.6, 0.35, 0.05, win), 0, ht * 0.65, 1.72);
      if (k === 'maden' || k === 'su' || k === 'atolye') { const a = add(box(0.3, 1.2, 0.3, dark), 1.6, ht + 0.6, 0); anim.push({ o: a, axis: 'y', speed: 1.5 }); }
      h = ht + 0.4; r = 2.6;
    }
    g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    g.userData = { h, r, anim, sunTrack, nightMats: [win], workMats: [win] };
    return g;
  }
  function fbAstro(colHex) {
    const g = new THREE.Group(), white = fmat(0xeeeeee), stripe = fmat(colHex), visor = fmat(0xd9a640, { roughness: 0.15, metalness: 0.9 }), dark = fmat(0x555a63);
    const add = (m, p, x, y, z) => { m.position.set(x, y, z); p.add(m); return m; };
    add(box(0.5, 0.62, 0.32, white), g, 0, 1.18, 0); add(box(0.42, 0.55, 0.22, dark), g, 0, 1.2, -0.26);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 10), white), g, 0, 1.62, 0);
    const v = add(new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8, 0, TAU, 0, 1.2), visor), g, 0, 1.63, 0.07); v.rotation.x = 1.45;
    const limb = (x, y, len, w, m) => { const p = new THREE.Group(); p.position.set(x, y, 0); g.add(p); add(box(w, len, w, m), p, 0, -len / 2, 0); return p; };
    const legL = limb(-0.13, 0.86, 0.84, 0.2, white), legR = limb(0.13, 0.86, 0.84, 0.2, white);
    const armL = limb(-0.33, 1.44, 0.62, 0.15, stripe), armR = limb(0.33, 1.44, 0.62, 0.15, stripe);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    g.userData = { legL, legR, armL, armR };
    return g;
  }
  function fbDeposit(kind, seed) {
    const g = new THREE.Group(), r = prng(seed * 7 + 3);
    const rock = fmat(W.moon ? 0x77756f : 0x7a3a28, { flatShading: true, roughness: 0.95 });
    let rad = 0;
    const rockAt = (x, z, s, m) => { const o = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), m || rock); o.position.set(x, s * 0.35, z); o.scale.y = 0.6 + r() * 0.5; o.rotation.set(r() * 3, r() * 3, r() * 3); o.castShadow = o.receiveShadow = true; g.add(o); return o; };
    if (kind === 'i') {
      const ice = fmat(0xbfe3ff, { roughness: 0.15, metalness: 0.1, emissive: lin(0x3a7fbf), emissiveIntensity: 0.25, transparent: true, opacity: 0.88 });
      for (let i = 0; i < 6; i++) { const a = r() * TAU, d = 0.6 + r() * 2.2, s = new THREE.Mesh(new THREE.OctahedronGeometry(0.35 + r() * 0.35, 0), ice); s.scale.y = 1.6 + r(); s.position.set(Math.cos(a) * d, 0.25, Math.sin(a) * d); s.rotation.set(r() * 0.6, r() * 3, r() * 0.6); s.castShadow = true; g.add(s); }
    } else if (kind === 'm') {
      const ore = fmat(0x3b3631, { flatShading: true, roughness: 0.6, metalness: 0.4, emissive: lin(0xb4561e), emissiveIntensity: 0.12 });
      for (let i = 0; i < 6; i++) { const a = r() * TAU, d = 0.5 + r() * 2.4; rockAt(Math.cos(a) * d, Math.sin(a) * d, 0.25 + r() * 0.4, ore); }
    } else if (kind === 't') {
      const bas = fmat(0x2a2826, { flatShading: true, roughness: 0.95 });
      for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + r() * 0.3; rockAt(Math.cos(a) * 3.9, Math.sin(a) * 3.9, 0.4 + r() * 0.4, bas); }
    } else if (kind === 'r') {
      const n = 3 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) { const a = r() * TAU, d = i ? 1 + r() * 1.8 : 0; rockAt(Math.cos(a) * d, Math.sin(a) * d, i ? 0.4 + r() * 0.6 : 1.1 + r() * 0.5); }
      rad = 1.9;
    } else if (kind === 'c') {
      for (let i = 0; i < 3; i++) { const a = r() * TAU; rockAt(Math.cos(a) * 3.4, Math.sin(a) * 3.4, 0.2 + r() * 0.3); }
    }
    g.userData = { r: rad };
    return g;
  }
  function fbRelic(idx) {
    const g = new THREE.Group(), white = fmat(0xcfcfc8), dark = fmat(0x3a3d44), gold = fmat(0xb8902e, { metalness: 0.7, roughness: 0.4 });
    const blink = new THREE.MeshStandardMaterial({ color: 0x220000, emissive: lin(0xff3020), emissiveIntensity: 2 });
    const add = (m, x, y, z) => { m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
    let h = 2, r = 1.2;
    if (idx === 0) {
      for (let i = 0; i < 3; i++) { const a = i * TAU / 3; const l = add(cyl(0.04, 0.05, 2, dark, 6), Math.cos(a) * 0.5, 0.95, Math.sin(a) * 0.5); l.rotation.z = Math.cos(a) * 0.3; l.rotation.x = -Math.sin(a) * 0.3; }
      add(box(0.5, 0.35, 0.5, gold), 0, 2, 0); add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), blink), 0, 2.3, 0); h = 2.4; r = 0.8;
    } else if (idx === 1) {
      const w = add(box(3.4, 0.06, 1.6, fmat(0x1a2a55, { roughness: 0.35, metalness: 0.4 })), 0.4, 0.4, 0); w.rotation.z = 0.25; w.rotation.y = 0.4;
      add(box(0.3, 0.3, 0.3, dark), -1.4, 0.15, 0.6); h = 1.2; r = 1.6;
    } else {
      add(box(2.2, 0.8, 1.5, white), 0, 0.9, 0); add(box(1.6, 0.06, 1.2, fmat(0x1a2a55)), 0, 1.35, 0);
      for (const x of [-0.9, 0.9]) for (const z of [-0.8, 0.8]) add(cyl(0.3, 0.3, 0.2, dark, 12), x, 0.3, z).rotation.x = Math.PI / 2;
      add(cyl(0.03, 0.03, 1, dark, 6), 0.7, 1.8, 0.4); add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), blink), 0.7, 2.3, 0.4);
      g.rotation.z = 0.08; h = 2.3; r = 1.8;
    }
    g.userData = { h, r, blink };
    return g;
  }
  function fbLander() {
    const g = new THREE.Group(), white = fmat(0xe3e3e3), dark = fmat(0x30343c), gold = fmat(0xc9a03a, { metalness: 0.7, roughness: 0.35 });
    const add = (m, x, y, z) => { m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
    add(cyl(1.6, 2.0, 3.6, white, 16), 0, 3.6, 0); add(cyl(0.4, 1.6, 1.4, white, 16), 0, 6.1, 0); add(cyl(2.1, 2.1, 0.6, gold, 16), 0, 1.9, 0);
    add(cyl(0.5, 0.9, 1.0, dark, 12), 0, 1.1, 0);
    for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + 0.78; const l = add(cyl(0.08, 0.1, 2.6, dark, 6), Math.cos(a) * 2.4, 1.1, Math.sin(a) * 2.4); l.rotation.z = Math.cos(a) * 0.45; l.rotation.x = -Math.sin(a) * 0.45; }
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.75, 4, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffb060, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    flame.rotation.x = Math.PI; flame.position.y = -1.3; g.add(flame);
    g.userData = { flame, h: 6.8, r: 2.6 };
    return g;
  }
  function tryModel(fn, fb) {
    if (hasModel()) { try { const g = fn(); if (g && g.isObject3D) return g; } catch (e) { console.warn('MODEL', e); } }
    return fb();
  }


  let _m4 = null, _n3 = null, _v = null;
  function mergeGeo(list, inv) {
    const M = _m4 || (_m4 = new THREE.Matrix4()), N3 = _n3 || (_n3 = new THREE.Matrix3()), v = _v || (_v = new THREE.Vector3());
    const hasN = list.every(o => o.geometry.attributes.normal), hasU = list.every(o => o.geometry.attributes.uv), hasC = list.every(o => o.geometry.attributes.color);
    let nv = 0, ni = 0;
    for (const o of list) { const g = o.geometry; nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
    const P = new Float32Array(nv * 3), Nn = hasN ? new Float32Array(nv * 3) : null, U = hasU ? new Float32Array(nv * 2) : null, Cc = hasC ? new Float32Array(nv * 3) : null;
    const I = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    let vo = 0, io = 0;
    for (const o of list) {
      const g = o.geometry, pa = g.attributes.position, n = pa.count;
      M.multiplyMatrices(inv, o.matrixWorld); N3.getNormalMatrix(M);
      const flip = M.determinant() < 0;
      for (let i = 0; i < n; i++) {
        const k = (vo + i) * 3;
        v.fromBufferAttribute(pa, i).applyMatrix4(M); P[k] = v.x; P[k + 1] = v.y; P[k + 2] = v.z;
        if (Nn) { v.fromBufferAttribute(g.attributes.normal, i).applyMatrix3(N3).normalize(); Nn[k] = v.x; Nn[k + 1] = v.y; Nn[k + 2] = v.z; }
        if (U) { U[(vo + i) * 2] = g.attributes.uv.getX(i); U[(vo + i) * 2 + 1] = g.attributes.uv.getY(i); }
        if (Cc) { const ca = g.attributes.color; Cc[k] = ca.getX(i); Cc[k + 1] = ca.getY(i); Cc[k + 2] = ca.getZ(i); }
      }
      const cnt = g.index ? g.index.count : n;
      for (let j = 0; j < cnt; j += 3) {
        const a = g.index ? g.index.getX(j) : j, b = g.index ? g.index.getX(j + 1) : j + 1, c = g.index ? g.index.getX(j + 2) : j + 2;
        I[io++] = a + vo; I[io++] = (flip ? c : b) + vo; I[io++] = (flip ? b : c) + vo;
      }
      vo += n;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
    if (Nn) geo.setAttribute('normal', new THREE.BufferAttribute(Nn, 3)); else geo.computeVertexNormals();
    if (U) geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    if (Cc) geo.setAttribute('color', new THREE.BufferAttribute(Cc, 3));
    geo.setIndex(new THREE.BufferAttribute(I, 1));
    geo.computeBoundingSphere();
    return geo;
  }

  function bucketsOf(roots, keep) {
    const B = new Map();
    const kept = o => { for (let p = o; p; p = p.parent) if (keep && keep.has(p)) return true; return false; };
    for (const r of roots) r.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || Array.isArray(o.material) || !o.visible || kept(o)) return;
      const g = o.geometry; if (!g || !g.attributes || !g.attributes.position) return;
      if (g.morphAttributes && Object.keys(g.morphAttributes).length) return;
      const key = o.material.uuid + (o.castShadow ? 's' : '-') + (o.receiveShadow ? 'r' : '-') + (g.attributes.uv ? 'u' : '') + (g.attributes.color ? 'c' : '');
      if (!B.has(key)) B.set(key, []);
      B.get(key).push(o);
    });
    return B;
  }
  function mergeInPlace(root, keep) {
    root.updateMatrixWorld(true);
    const inv = root.matrixWorld.clone().invert();
    for (const list of bucketsOf([root], keep).values()) {
      if (list.length < 2) continue;
      const m = new THREE.Mesh(mergeGeo(list, inv), list[0].material);
      m.castShadow = list[0].castShadow; m.receiveShadow = list[0].receiveShadow;
      for (const o of list) o.parent && o.parent.remove(o);
      root.add(m); own(m.geometry);
    }
    return root;
  }


  function own(...a) { if (W) W.own.push(...a); }
  function disposeAll(list) { for (const x of list) { try { x.dispose && x.dispose(); } catch (e) {   } } }


  const holoMat = () => new THREE.MeshBasicMaterial({ color: 0x5fd8ff, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide });
  function personalize(g) {
    const ud = g.userData, map = new Map();
    const cp = m => { if (m && !map.has(m)) { const c = m.clone(); c.userData = { base: m.emissiveIntensity != null ? m.emissiveIntensity : 1 }; map.set(m, c); } };
    (ud.nightMats || []).forEach(cp); (ud.workMats || []).forEach(cp);
    if (map.size) g.traverse(o => { if (o.isMesh) o.material = Array.isArray(o.material) ? o.material.map(m => map.get(m) || m) : (map.get(o.material) || o.material); });
    const night = new Set((ud.nightMats || []).map(m => map.get(m))), work = new Set((ud.workMats || []).map(m => map.get(m)));
    ud.mats = [...map.values()].map(m => ({ m, n: night.has(m), w: work.has(m) }));
    W.own.push(...map.values());
  }
  function makeBuilding(k) {
    const g = tryModel(() => MODEL.building(k, W.world), () => fbBuilding(k));
    g.userData = Object.assign({ h: 3, r: 2.6, anim: [], sunTrack: null, nightMats: [], workMats: [] }, g.userData || {});
    return g;
  }

  const WARN_G = { ariza: ['wrench', '#ff4b3e', '#fff'], guc: ['bolt', 'guc'], isci: ['crew', 'ekip'], girdi: ['drop', 'su'], 'girdi:su': ['drop', 'su'],
    'girdi:malzeme': ['bricks', 'malzeme'], siginak: ['pause', '#9fb2c8', '#10151d'], kapali: ['off', '#7d8796', '#10151d'] };
  function warnKey(b) {
    if (b.left > 0) return '';
    if (b.broken) return 'ariza';
    if (b.st === 'guc' || b.st === 'isci' || b.st === 'ariza') return b.st;
    if (b.st === 'girdi') { const inp = BLD[b.k] && BLD[b.k].inp ? Object.keys(BLD[b.k].inp)[0] : ''; return WARN_G['girdi:' + inp] ? 'girdi:' + inp : 'girdi'; }
    if (b.st === 'siginak' || b.st === 'kapali') return b.st;
    return '';
  }
  function makeWarnTex(kind) {

    if (kind === 'ariza') return canvasTex(128, 128, (x) => {
      x.beginPath(); x.arc(64, 64, 60, 0, TAU); x.fillStyle = 'rgba(8,11,18,0.9)'; x.fill();
      x.beginPath(); x.arc(64, 64, 50, 0, TAU); x.fillStyle = '#ff4b3e'; x.fill();
      x.fillStyle = '#ffffff'; x.beginPath(); x.roundRect(55, 26, 18, 50, 8); x.fill(); x.beginPath(); x.arc(64, 94, 10, 0, TAU); x.fill();
    }, true);
    const G = WARN_G[kind];
    if (G && typeof drawGlyph === 'function') return canvasTex(128, 128, (x) => {
      const rc = typeof RES_COLOR !== 'undefined' ? RES_COLOR : {}, col = rc[G[1]] || G[1];
      const ink = G[2] || (typeof RES_INK !== 'undefined' && RES_INK[G[1]]) || '#fff';
      x.beginPath(); x.roundRect(6, 6, 116, 116, 36); x.fillStyle = 'rgba(8,11,18,0.88)'; x.fill();
      x.beginPath(); x.roundRect(15, 15, 98, 98, 29); x.fillStyle = col; x.fill();
      drawGlyph(x, G[0], 64, 64, 70, ink);
    }, true);
    kind = kind.split(':')[0];
    return canvasTex(64, 64, (x) => {
      const col = { ariza: '#ff4b3e', guc: '#ffb020', isci: '#5fb4ff', girdi: '#ffb020' }[kind];
      x.beginPath(); x.arc(32, 32, 27, 0, TAU); x.fillStyle = 'rgba(10,12,18,0.82)'; x.fill(); x.lineWidth = 4; x.strokeStyle = col; x.stroke();
      x.fillStyle = col; x.strokeStyle = col; x.lineWidth = 5; x.lineCap = 'round';
      if (kind === 'ariza') { x.fillRect(29, 15, 6, 22); x.beginPath(); x.arc(32, 45, 3.6, 0, TAU); x.fill(); }
      else if (kind === 'guc') { x.beginPath(); x.moveTo(36, 12); x.lineTo(22, 35); x.lineTo(31, 35); x.lineTo(27, 52); x.lineTo(43, 27); x.lineTo(34, 27); x.closePath(); x.fill(); }
      else if (kind === 'isci') { x.beginPath(); x.arc(32, 23, 7, 0, TAU); x.fill(); x.beginPath(); x.arc(32, 48, 13, Math.PI, 0); x.fill(); }
      else { x.beginPath(); x.moveTo(32, 13); x.quadraticCurveTo(46, 33, 44, 40); x.arc(32, 40, 12, 0, Math.PI); x.quadraticCurveTo(18, 33, 32, 13); x.fill(); }
    }, true);
  }
  function warnMat(k) {
    if (!W.warnMats[k]) { const t = makeWarnTex(k); W.warnMats[k] = new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true, fog: false }); own(t, W.warnMats[k]); }
    return W.warnMats[k];
  }
  function placeB(e, b) {
    const x = tc(b.x), z = tc(b.y), y = hAt(x, z);
    e.x = x; e.z = z; e.y = y;
    for (const o of [e.obj, e.holo, e.shieldObj]) if (o) o.position.set(x, y, z);
  }
  function buildEntry(b) {
    const e = { id: b.id, k: b.k, stage: '', obj: null, holo: null, shieldObj: null, shieldKey: '', warn: null, warnK: '', ud: null, h: 3, r: 2.6, bx: b.x, by: b.y };
    W.bmap.set(b.id, e);
    return e;
  }
  function setStage(e, b, stage) {
    const grp = W.bgroup;
    if (e.obj) { grp.remove(e.obj); e.obj = null; }
    if (e.holo) { grp.remove(e.holo); e.holo.userData.mats.forEach(m => m.dispose()); e.holo = null; }
    const g = makeBuilding(b.k);
    e.ud = g.userData; e.h = g.userData.h || 3; e.r = g.userData.r != null ? g.userData.r : 2.6;
    if (stage === 'h') {
      const pl1 = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), pl2 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const mS = holoMat(); mS.clippingPlanes = [pl1];
      const mW = holoMat(); mW.wireframe = true; mW.opacity = 0.1; mW.clippingPlanes = [pl2];
      g.traverse(o => { if (o.isMesh) { o.material = mS; o.castShadow = false; o.receiveShadow = false; } if (o.isSprite) o.visible = false; });
      const solid = mergeInPlace(g, null), wire = solid.clone(true), ring = new THREE.Mesh(new THREE.RingGeometry(Math.max(1, e.r) * 0.95, Math.max(1, e.r) * 1.08, 40), holoMat());
      wire.traverse(o => { if (o.isMesh) o.material = mW; });
      ring.rotation.x = -Math.PI / 2; ring.material.opacity = 0.35;
      const h = new THREE.Group(); h.add(solid, wire, ring);
      h.userData = { pl1, pl2, ring, mats: [mS, mW, ring.material] };
      own(ring.geometry);
      e.holo = h; grp.add(h);
    } else {
      personalize(g);
      const keep = new Set((e.ud.anim || []).map(a => a.o).filter(Boolean));
      if (e.ud.sunTrack) keep.add(e.ud.sunTrack);
      mergeInPlace(g, keep);
      e.obj = g; grp.add(g);
      if (e.stage === 'h') pulseAt(tc(b.x), tc(b.y), Math.max(2.5, e.r) + 1);
    }
    e.stage = stage;
    placeB(e, b);
  }
  function syncBuildings(s) {
    const seen = new Set(); let changed = false;
    W.seraOn.length = 0;
    for (const b of s.b) {
      seen.add(b.id);
      let e = W.bmap.get(b.id);
      if (!e) { e = buildEntry(b); changed = true; }
      const stage = b.left > 0 ? 'h' : 'r';
      if (e.stage !== stage || e.k !== b.k) { e.k = b.k; setStage(e, b, stage); changed = true; }
      if (e.bx !== b.x || e.by !== b.y) { e.bx = b.x; e.by = b.y; placeB(e, b); changed = true; }

      const tube = tileAt(s, b.x, b.y) === 't';
      let sk = '';
      if (b.left === 0 && !tube && (b.k === 'hub' || b.k === 'yasam')) {
        if (b.shield === 1 || (typeof isShielded === 'function' && isShielded(s, b) && !tube)) sk = 'on';
        else if (b.shLeft > 0) sk = 'up';
      }
      if (sk !== e.shieldKey) {
        if (e.shieldObj) { W.bgroup.remove(e.shieldObj); e.shieldObj = null; }
        if (sk) {
          const soil = W.moon ? 0x8A8A86 : 0xB4553A;
          e.shieldObj = tryModel(() => MODEL.shield(b.k, soil), () => {
            const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, TAU, 0, Math.PI / 2), fmat(soil, { roughness: 1, flatShading: true }));
            m.scale.set(b.k === 'hub' ? 3.6 : 3.8, b.k === 'hub' ? 4.4 : 3, 3.2); m.castShadow = m.receiveShadow = true;
            const g = new THREE.Group(); g.add(m); return g;
          });
          mergeInPlace(e.shieldObj, null);
          W.bgroup.add(e.shieldObj); placeB(e, b);
        }
        e.shieldKey = sk; changed = true;
      }
      if (e.shieldObj && sk === 'up') e.shieldObj.scale.y = 0.12 + 0.88 * (1 - b.shLeft / 12);
      else if (e.shieldObj) e.shieldObj.scale.y = 1;

      if (e.holo) {
        const tot = (BLD[b.k] && BLD[b.k].h) || 8, p = cl(1 - b.left / tot, 0, 1);
        const lv = e.y + 0.05 + p * (e.h + 0.1) + Math.sin(clockT * 2) * 0.03;
        e.holo.userData.pl1.constant = lv; e.holo.userData.pl2.constant = -lv;
        e.holo.userData.ring.position.y = lv - e.y;
        e.holo.userData.mats[0].opacity = 0.09 + 0.04 * Math.sin(clockT * 4);
      }

      if (e.obj) {
        const work = b.st === 'ok' ? 1 : (b.st === 'siginak' ? 0.5 : 0.12);
        if (b.k === 'sera' && b.st === 'ok') W.seraOn.push(e);
        for (const q of e.ud.mats) q.m.emissiveIntensity = q.m.userData.base * (q.w ? work : 1) * (q.n ? 0.35 + 1.4 * W.dark : 1);
        if (b.st === 'ok' && !W.frozen) for (const a of e.ud.anim || []) if (a.o) a.o.rotation[a.axis || 'y'] += (a.speed || 1) * W.dt;
        if (e.ud.sunTrack && b.st === 'ok') {
          const tr = e.ud.sunTrack, sd = W.sunDir;
          if (sd.y > -0.02 || !e.trackInit) {
            tr.updateMatrixWorld(true);
            const q0 = tr.quaternion.clone(), wp = new THREE.Vector3().setFromMatrixPosition(tr.matrixWorld);
            tr.lookAt(wp.x + sd.x * 10, wp.y + Math.max(sd.y, 0.06) * 10, wp.z + sd.z * 10);
            if (e.trackInit) tr.quaternion.copy(q0.slerp(tr.quaternion, Math.min(1, W.dt * 0.6)));
            e.trackInit = true;
          }
        }
      }
      const wk = warnKey(b);
      if (wk !== e.warnK) {
        if (e.warn) { W.bgroup.remove(e.warn); e.warn = null; }
        if (wk) { e.warn = new THREE.Sprite(warnMat(wk)); e.warn.renderOrder = 50; W.bgroup.add(e.warn); }
        e.warnK = wk;
      }
      if (e.warn) {
        e.warn.visible = !SC.on;
        const dc = cam.position.distanceTo(e.warn.position), sc = Math.max(1.3, dc * 0.035) * (e.warnK === 'ariza' ? 1.3 * (1 + 0.1 * Math.sin(clockT * 6)) : 1);
        e.warn.scale.set(sc, sc, 1);
        e.warn.position.set(e.x, e.y + e.h + 0.9 + sc * 0.4 + Math.sin(clockT * 3 + e.id) * 0.15, e.z);
      }
    }
    for (const [id, e] of W.bmap) if (!seen.has(id)) {
      for (const o of [e.obj, e.holo, e.shieldObj, e.warn]) if (o) W.bgroup.remove(o);
      W.bmap.delete(id); changed = true;
    }
    if (changed) { W.netKey = ''; rebuildObstacles(s); refreshDeposits(s); W.shadowDirty = true; }
    const nk = s.b.map(b => b.id + ':' + b.x + ',' + b.y).join('|');
    if (nk !== W.netKey) { W.netKey = nk; buildCables(s); }
  }
  function buildCables(s) {
    if (W.cable) { W.group.remove(W.cable); W.cable.geometry.dispose(); W.cable = null; }
    const n = s.b.length; if (n < 2) return;
    const inT = new Array(n).fill(false), d = new Array(n).fill(1e9), par = new Array(n).fill(-1), edges = [];
    d[0] = 0;
    for (let it = 0; it < n; it++) {
      let u = -1;
      for (let i = 0; i < n; i++) if (!inT[i] && (u < 0 || d[i] < d[u])) u = i;
      inT[u] = true;
      if (par[u] >= 0) edges.push([s.b[par[u]], s.b[u]]);
      for (let v = 0; v < n; v++) if (!inT[v]) { const q = Math.hypot(s.b[u].x - s.b[v].x, s.b[u].y - s.b[v].y); if (q < d[v]) { d[v] = q; par[v] = u; } }
    }
    const pos = [], ind = [], w = 0.09;
    for (const [a, b] of edges) {
      const x0 = tc(a.x), z0 = tc(a.y), x1 = tc(b.x), z1 = tc(b.y), L = Math.hypot(x1 - x0, z1 - z0), steps = Math.max(2, Math.ceil(L / 0.8));
      const px = -(z1 - z0) / L * w, pz = (x1 - x0) / L * w, base = pos.length / 3;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps, sag = Math.sin(t * Math.PI * 3 + a.id) * 0.25;
        const x = lerp(x0, x1, t) + px * sag * 4, z = lerp(z0, z1, t) + pz * sag * 4, y = hAt(x, z) + 0.06;
        pos.push(x - px, y, z - pz, x + px, y, z + pz);
        if (i) { const k = base + (i - 1) * 2; ind.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(ind); g.computeVertexNormals();
    W.cable = new THREE.Mesh(g, W.cableMat); W.cable.receiveShadow = true;
    W.group.add(W.cable);
  }
  function rebuildObstacles(s) {
    const o = [];
    for (const e of W.bmap.values()) if (e.stage === 'r' && e.r > 0) o.push({ x: e.x, z: e.z, r: e.r, top: e.y + e.h });
    for (const d of W.deps) if (d.vis !== false && d.r > 0) o.push({ x: d.x, z: d.z, r: d.r, top: d.y + 3 });
    for (const r of W.relics) if (r.r > 0) o.push({ x: r.x, z: r.z, r: r.r, top: r.y + r.h });
    if (W.ship && W.ship.st !== 'gone') o.push({ x: W.ship.x, z: W.ship.z, r: W.ship.r, top: W.ship.y + 7, ship: 1 });
    W.obst = o;

    const c = o.map(q => q);
    for (const e of W.bmap.values()) {
      if (e.stage === 'h') c.push({ x: e.x, z: e.z, r: Math.max(1, e.r) + 0.3, top: e.y + e.h });
      else if (e.stage === 'r' && e.shieldObj) c.push({ x: e.x, z: e.z, r: Math.max(e.r, e.k === 'hub' ? 3.7 : 3.9), top: e.y + 4 });
    }
    W.obstC = c;
  }

  const NBX = { x0: 2, z0: 2, x1: MW - 2, z1: MH - 2 }, NB = () => NBX, CREW_PAD = 0.45, CREW_V = 1.25;
  const hasYol = () => typeof YOL !== 'undefined' && YOL && typeof YOL.step === 'function';
  function crewPick(c) { return YOL.pickTarget(W.obstC, tc(HUBX), tc(HUBY), 5, 25, W.rand, c, { pad: CREW_PAD, bounds: NB() }); }
  function refreshDeposits(s) {
    let ch = !W.depMesh;
    for (const d of W.deps) { const v = !bAt(s, d.tx, d.ty); if (v !== d.vis) { d.vis = v; ch = true; } }
    if (!ch) return;
    if (W.depMesh) { W.group.remove(W.depMesh); W.depMesh.children.forEach(m => m.geometry.dispose()); }
    const roots = W.deps.filter(d => d.vis).map(d => d.obj), g = new THREE.Group(), inv = new THREE.Matrix4();
    roots.forEach(r => r.updateMatrixWorld(true));
    for (const list of bucketsOf(roots, null).values()) {
      const m = new THREE.Mesh(mergeGeo(list, inv), list[0].material);
      m.castShadow = list[0].castShadow; m.receiveShadow = list[0].receiveShadow; g.add(m);
    }
    W.depMesh = g; W.group.add(g);
  }
  function pulseAt(x, z, r) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 48), new THREE.MeshBasicMaterial({ color: 0x9ff7c8, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, hAt(x, z) + 0.25, z);
    W.group.add(m); W.pulses.push({ m, t: 0, r });
  }



  const GOAL = { pos: null };


  const CF = { on: false, focused: false };
  function camFreeze(on) { CF.on = !!on; CF.focused = false; if (CF.on) PL.go = null; return CF.on; }
  const autoCamOk = () => !CF.on && !(W && W.s && W.s.train && !P.moving);
  function makeMarks() {
    const col = 0x6ff3ff;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.78, 1, 48), new THREE.MeshBasicMaterial({ color: lin(col), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    ring.rotation.x = -Math.PI / 2; ring.renderOrder = 7;
    const colGeo = new THREE.CylinderGeometry(0.16, 0.16, 12, 10, 1, true); colGeo.translate(0, 6, 0);
    const beam = new THREE.Mesh(colGeo, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
      uniforms: { uCol: { value: lin(col) }, uA: { value: 0.55 } },
      vertexShader: 'varying float vY; void main(){ vY = position.y / 12.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 uCol; uniform float uA; varying float vY; void main(){ gl_FragColor = vec4(uCol * uA * (1.0 - vY) * (0.35 + 0.65 * (1.0 - vY)), 1.0); }',
    }));
    beam.renderOrder = 7;
    const g = new THREE.Group(); g.add(ring, beam); g.visible = false; g.userData = { ring, beam };
    const pr = new THREE.Mesh(new THREE.RingGeometry(0.72, 1, 40), new THREE.MeshBasicMaterial({ color: lin(LOOK.suit), transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    pr.rotation.x = -Math.PI / 2; pr.renderOrder = 6; pr.visible = false;
    W.goal = g; W.pring = pr;
    own(ring.geometry, ring.material, colGeo, beam.material, pr.geometry, pr.material);
    W.group.add(g, pr);
    if (GOAL.pos) setGoal(GOAL.pos);
  }
  function setGoal(p) {
    GOAL.pos = p && isFinite(p.x) && isFinite(p.z) ? { x: +p.x, z: +p.z } : null;
    if (!W || !W.goal) return !!GOAL.pos;
    W.goal.visible = !!GOAL.pos;
    if (GOAL.pos) { W.goal.position.set(GOAL.pos.x, hAt(GOAL.pos.x, GOAL.pos.z) + 0.12, GOAL.pos.z); W.goal.userData.t0 = clockT; }
    return !!GOAL.pos;
  }
  function ping(x, z) { if (!W || !isFinite(x) || !isFinite(z)) return false; pulseAt(+x, +z, 5); return true; }
  function stepMarks(dt) {
    if (!W.goal) return;
    const top = mode !== 'walk' && !SHOW.on;
    W.goal.visible = !!GOAL.pos && !SC.on && !SHOW.on;
    if (W.goal.visible) {
      const u = W.goal.userData, g = W.goal, dc = cam.position.distanceTo(g.position);
      const k = top ? cl(dc * 0.03, 1.2, 5) : cl(dc * 0.05, 1, 2.2), ph = (clockT - (u.t0 || 0)) * 2.4;
      u.ring.scale.setScalar(k * (1 + 0.18 * Math.sin(ph)));
      u.ring.material.opacity = 0.65 + 0.3 * Math.sin(ph);
      u.beam.scale.set(k * 0.8, top ? 1.6 : 1, k * 0.8);
      u.beam.material.uniforms.uA.value = (top ? 0.75 : 0.5) * (0.85 + 0.15 * Math.sin(ph));
    }

    if (!FL.list && hasModel() && MODEL.mat) { try { const m = MODEL.mat('bldTrim'); if (m && m.emissive) m.emissiveIntensity += ((top ? 1.1 : 0.35) - m.emissiveIntensity) * Math.min(1, dt * 6); } catch (e) {   } }

    const pr = W.pring, on = top && !SC.on;
    pr.visible = on;
    if (on) {
      const dc = cam.position.distanceTo(W.player.position), k = cl(dc * 0.02, 0.9, 4) * (DRV.on && W.rover ? 1 + W.rover.r * 0.5 : 1);
      pr.scale.setScalar(k); pr.position.set(P.x, hAt(P.x, P.z) + 0.1, P.z);
      pr.material.opacity = 0.7 + 0.2 * Math.sin(clockT * 3);
    }
    stepTags(!SC.on && !SHOW.on, top);
  }

  function tagSprite(text, bg, fg) {
    let tw = 120; if (text) try { const mc = document.createElement('canvas').getContext('2d'); mc.font = '700 46px system-ui, sans-serif'; tw = mc.measureText(text).width; } catch (e) {   }
    const w = text ? Math.max(160, Math.ceil(tw + 80)) : 96, h = 128;
    const t = canvasTex(w, h, g => {
      g.fillStyle = bg; g.strokeStyle = 'rgba(10,14,22,.85)'; g.lineWidth = 6;
      if (text) {
        const r = 30; g.beginPath(); g.moveTo(16 + r, 8); g.arcTo(w - 16, 8, w - 16, 76, r); g.arcTo(w - 16, 76, 16, 76, r); g.arcTo(16, 76, 16, 8, r); g.arcTo(16, 8, w - 16, 8, r); g.closePath(); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(w / 2 - 22, 74); g.lineTo(w / 2, 120); g.lineTo(w / 2 + 22, 74); g.closePath(); g.fill();
        g.fillStyle = fg; g.font = '700 46px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 44);
      } else { g.beginPath(); g.moveTo(14, 20); g.lineTo(82, 20); g.lineTo(48, 112); g.closePath(); g.fill(); g.stroke(); }
    }, true);
    const m = new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false, fog: false, sizeAttenuation: false });
    const sp = new THREE.Sprite(m); sp.center.set(0.5, 0); sp.renderOrder = 20; sp.userData.ar = w / h;
    return sp;
  }

  function tagRect(sp) {
    const pr = project(sp.position.x, sp.position.y, sp.position.z); if (pr.behind) return null;
    const h = sp.scale.y * ch / (2 * Math.tan(cam.fov * D2R / 2)), w = sp.scale.x * ch / (2 * Math.tan(cam.fov * D2R / 2));
    const x0 = pr.sx - sp.center.x * w, y1 = pr.sy + sp.center.y * h;
    return { x0, x1: x0 + w, y0: y1 - h, y1, h };
  }

  const AV = { t: -1, go: [], me: [] };
  function avoidRects() {
    if (clockT - AV.t < 0.2) return AV; AV.t = clockT; AV.go = []; AV.me = [];
    if (typeof document === 'undefined' || !canvas) return AV;
    const cr = canvas.getBoundingClientRect(), sx = cr.width ? cw / cr.width : 1, sy = cr.height ? ch / cr.height : 1;
    const grab = (ids, out) => { for (const id of ids) { const el = document.getElementById(id); if (!el || el.hidden || !el.getClientRects().length) continue; const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue; out.push({ x0: (r.left - cr.left) * sx - 6, x1: (r.right - cr.left) * sx + 6, y0: (r.top - cr.top) * sy - 6, y1: (r.bottom - cr.top) * sy + 6 }); } };
    grab(['egSkip', 'egStep', 'egShow', 'objective', 'objHow', 'pwWarn', 'chapter', 'planLabel', 'planBar'], AV.go);
    grab(['planLabel', 'planBar'], AV.me);
    return AV;
  }
  const hitAny = (r, list) => !!r && list.some(q => r.x0 < q.x1 && r.x1 > q.x0 && r.y0 < q.y1 && r.y1 > q.y0);

  function placeTag(sp, bx, by, bz, up, list) {
    const opts = [[0.5, 0, up], [0.5, 1, -0.2], [-0.15, 0.5, 0.3], [1.15, 0.5, 0.3]];
    for (const [cx, cy, dy] of opts) {
      sp.center.set(cx, cy); sp.position.set(bx, by + dy, bz);
      let r = tagRect(sp); if (!r) { sp.visible = false; return 'arka'; }
      const w = r.x1 - r.x0, sh = r.x0 < 4 ? 4 - r.x0 : r.x1 > cw - 4 ? cw - 4 - r.x1 : 0;
      if (sh && w > 0) { sp.center.x = cx - sh / w; r = tagRect(sp); }
      if (r.y0 >= 0 && r.x0 >= 0 && r.x1 <= cw && r.y1 <= ch && !hitAny(r, list)) return cx === 0.5 ? (cy === 0 ? 'ust' : 'alt') : cx < 0 ? 'sag' : 'sol';
    }
    sp.center.set(0.5, 0); sp.visible = false; return 'gizli';
  }
  const TAGDBG = { me: '', go: '', mePx: 0 };
  function stepTags(on, top) {
    if (!W || !W.group) return;
    const tr = typeof LANG === 'undefined' || LANG !== 'en';
    if (!W.tagMe) { W.tagMe = tagSprite(tr ? 'Sen' : 'You', '#ffe27a', '#10131a'); W.group.add(W.tagMe); }
    if (!W.tagGo) { W.tagGo = tagSprite(tr ? 'Buraya dokun' : 'Tap here', '#7cf2ff', '#10131a'); W.tagGo.scale.set(0.2, 0.1, 1); W.group.add(W.tagGo); }
    const ph = Math.sin(clockT * 4), sz = ch < 500 ? 0.13 : 0.1, k2t = 2 * Math.tan(cam.fov * D2R / 2) / ch;
    const av = (on && (W.s && W.s.train || mode === 'plan')) ? avoidRects() : null;
    W.tagMe.visible = on && top !== false && !!W.player;
    if (W.tagMe.visible) {
      if (mode === 'plan') {
        const h = 13.5 * 128 / 46 * k2t; W.tagMe.scale.set(h * W.tagMe.userData.ar, h, 1);
        TAGDBG.me = placeTag(W.tagMe, P.x, P.y, P.z, DRV.on ? 3.4 : 2.4, av ? av.me : []);
      } else { W.tagMe.center.set(0.5, 0); W.tagMe.position.set(P.x, P.y + (DRV.on ? 3.4 : 2.4), P.z); W.tagMe.scale.set(sz * W.tagMe.userData.ar * (1 + 0.04 * ph), sz * (1 + 0.04 * ph), 1); TAGDBG.me = 'ust'; }
      TAGDBG.mePx = Math.round(W.tagMe.scale.y / k2t * 46 / 128 * 10) / 10;
    } else TAGDBG.me = '';
    W.tagGo.visible = on && !!GOAL.pos && !!(W.s && W.s.train);
    if (W.tagGo.visible) {
      W.tagGo.scale.set(sz * W.tagGo.userData.ar, sz, 1);
      TAGDBG.go = placeTag(W.tagGo, GOAL.pos.x, hAt(GOAL.pos.x, GOAL.pos.z), GOAL.pos.z, 1.5 + 0.4 * ph, av ? av.go : []);
    } else TAGDBG.go = '';
    W.tagCrew = W.tagCrew || [];
    while (W.tagCrew.length < W.crew.length) { const s2 = tagSprite('', '#7dffa8', '#000'); s2.scale.set(0.03, 0.04, 1); W.group.add(s2); W.tagCrew.push(s2); }
    W.tagCrew.forEach((s2, i) => { const c = W.crew[i]; s2.visible = on && top !== false && !!c && c.g.visible !== false; if (s2.visible) { s2.position.set(c.x, hAt(c.x, c.z) + 2.3 + 0.15 * Math.sin(clockT * 3 + i), c.z); s2.scale.set(sz * 0.32, sz * 0.42, 1); } });
  }


  function relicList(s) {
    if (typeof relicTiles === 'function') { try { const r = relicTiles(s); if (Array.isArray(r)) return r; } catch (e) {   } }
    const out = [];
    for (let y = 0; y < MAPH; y++) for (let x = 0; x < MAPW; x++) if (s.map.k[y * MAPW + x] === 's') out.push({ x, y, d: Math.hypot(x - HUBX, y - HUBY) });
    out.sort((a, b) => a.d - b.d);
    return out.slice(0, 3).map((o, i) => ({ x: o.x, y: o.y, idx: i }));
  }
  function buildStatic(s) {
    W.deps = []; W.relics = [];
    for (let y = 0; y < MAPH; y++) for (let x = 0; x < MAPW; x++) {
      const i = y * MAPW + x, k = s.map.k[i];
      if (!'imtrc'.includes(k) || k === '.') continue;
      const seed = (W.sd ^ (i * 2654435761)) >>> 0;
      const g = tryModel(() => MODEL.deposit(k, W.world, seed), () => fbDeposit(k, seed));
      const cx = tc(x), cz = tc(y), cy = k === 't' || k === 'c' ? hAt(cx + 3.6, cz) : hAt(cx, cz);
      g.position.set(cx, k === 't' || k === 'c' ? 0 : cy, cz);
      if (k === 't' || k === 'c') g.traverse(o => { if (o.isMesh && o.parent === g) o.position.y += hAt(cx + o.position.x, cz + o.position.z); });
      g.rotation.y = (seed % 628) / 100;
      W.deps.push({ obj: g, tx: x, ty: y, x: cx, z: cz, y: cy, r: (g.userData && g.userData.r) || 0, k, vis: null });
    }
    for (const rl of relicList(s)) {
      const g = tryModel(() => MODEL.relic(W.world, rl.idx), () => fbRelic(rl.idx));
      const ud = g.userData || {};
      mergeInPlace(g, null);
      const x = tc(rl.x), z = tc(rl.y), y = hAt(x, z);
      g.position.set(x, y, z); g.rotation.y = rl.idx * 1.3 + 0.4;
      W.group.add(g);

      const bc = new THREE.Sprite(W.beaconMat.clone()); bc.position.set(x, y + (ud.h || 2) + 0.7, z); bc.renderOrder = 40; W.group.add(bc); own(bc.material);
      W.relics.push({ obj: g, idx: rl.idx, tx: rl.x, ty: rl.y, x, y, z, h: ud.h || 2, r: ud.r != null ? ud.r : 1.2, blink: ud.blink || null,
        base: ud.blink ? ud.blink.emissiveIntensity || 1 : 1, halo: ud.blinkHalo || null, hbase: ud.blinkHalo ? ud.blinkHalo.opacity : 0, beacon: bc });
    }
  }
  function buildPebbles() {
    const r = prng(W.sd + 99), hi = qual === 'high';
    const geo = new THREE.IcosahedronGeometry(1, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true });
    const N = 2400, mesh = new THREE.InstancedMesh(geo, mat, N);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3(), c = new THREE.Color();
    let n = 0;
    for (let i = 0; i < N * 3 && n < N; i++) {
      let x, z, s;
      if (n < 1900) { x = -20 + r() * (MW + 40); z = -20 + r() * (MH + 40); s = 0.05 + Math.pow(r(), 4) * 0.45; }
      else { const a = r() * TAU, d = 30 + Math.pow(r(), 1.6) * 420; x = MW / 2 + Math.cos(a) * (MW / 2 + d); z = MH / 2 + Math.sin(a) * (MH / 2 + d); s = 0.3 + Math.pow(r(), 3) * 2.6; }
      if (x > tc(HUBX) - 6 && x < tc(HUBX) + 6 && z > tc(HUBY) - 6 && z < tc(HUBY) + 6) continue;
      if (W.moon && Math.hypot(x - SH.x, z - SH.z) < SH.R + 30) continue;
      e.set(r() * 3, r() * 3, r() * 3); q.setFromEuler(e);
      sc.set(s * (0.8 + r() * 0.5), s * (0.45 + r() * 0.4), s * (0.8 + r() * 0.5));
      p.set(x, hAt(x, z) + sc.y * 0.25, z);
      m4.compose(p, q, sc); mesh.setMatrixAt(n, m4);
      const base = W.moon ? (r() < 0.3 ? 0x9a9993 : 0x6f6e69) : (r() < 0.35 ? 0x5a2d22 : 0x8a4630);
      c.copy(lin(base)).multiplyScalar(0.8 + r() * 0.4); mesh.setColorAt(n, c);
      n++;
    }
    mesh.count = hi ? n : Math.floor(n * 0.4);
    W.pebN = n;
    mesh.castShadow = true; mesh.receiveShadow = true;
    own(geo, mat);
    return mesh;
  }


  function drapeGeo(x0, z0, w, d, step, lift) {
    const nx = Math.round(w / step) + 1, nz = Math.round(d / step) + 1, pos = new Float32Array(nx * nz * 3), ind = [];
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const k = (j * nx + i) * 3, x = x0 + i * step, z = z0 + j * step; pos[k] = x; pos[k + 1] = hAt(x, z) + lift; pos[k + 2] = z; }
    for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, e = c + 1; ind.push(a, c, b, b, c, e); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(ind);
    return g;
  }
  const W_VS = `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
  function makeFogOverlay(s) {
    const data = new Uint8Array(MAPW * MAPH * 4);
    const tex = new THREE.DataTexture(data, MAPW, MAPH, THREE.RGBAFormat);
    tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearFilter;
    own(tex);
    W.fogData = data; W.fogTex = tex; W.fogKey = -1;
    if (W.fogU) W.fogU.uSeen.value = tex;

    const kd = new Uint8Array(MAPW * MAPH * 4), code = { i: 85, m: 170, t: 255 };
    for (let i = 0; i < MAPW * MAPH; i++) { kd[i * 4] = code[s.map.k[i]] || 0; kd[i * 4 + 3] = 255; }
    const kt = new THREE.DataTexture(kd, MAPW, MAPH, THREE.RGBAFormat);
    kt.magFilter = kt.minFilter = THREE.NearestFilter; kt.needsUpdate = true; own(kt);
    if (W.fogU) W.fogU.uKind.value = kt;
  }
  function updateFog(s) {
    const key = (s.mapV || 0) + ':' + s.map.seen.reduce((a, v) => a + v, 0);
    if (key === W.fogKey) return;
    W.fogKey = key;
    for (let i = 0; i < MAPW * MAPH; i++) { const v = s.map.seen[i] ? 255 : 0; W.fogData[i * 4] = v; W.fogData[i * 4 + 3] = 255; }
    W.fogTex.needsUpdate = true;
  }
  function makePatchMat(additive) {
    return new THREE.ShaderMaterial({
      uniforms: { uC: { value: new THREE.Vector2() }, uR: { value: 24 }, uTile: { value: new THREE.Vector4() }, uCol: { value: new THREE.Color(0x49e08a) }, uMode: { value: 0 }, uP: { value: 0 }, uT: { value: 0 } },
      vertexShader: W_VS,
      fragmentShader: `uniform vec2 uC; uniform float uR, uMode, uP, uT; uniform vec4 uTile; uniform vec3 uCol; varying vec3 vW;
        void main(){
          vec2 q = vW.xz; float dc = length(q - uC);
          float fade = 1.0 - smoothstep(uR * 0.35, uR, dc);
          vec2 f = fract(q / 8.0); vec2 e = min(f, 1.0 - f) * 8.0;
          float line = 1.0 - smoothstep(0.04, 0.16, min(e.x, e.y));
          float inT = step(uTile.x, q.x) * step(q.x, uTile.z) * step(uTile.y, q.y) * step(q.y, uTile.w);
          vec2 te = min(q - uTile.xy, uTile.zw - q); float edge = (1.0 - smoothstep(0.06, 0.35, min(te.x, te.y))) * inT;
          vec3 col; float a;
          if (uMode < 0.5) {
            a = line * 0.3 * fade * (1.0 - inT) + inT * (0.13 + 0.05 * sin(uT * 5.0)) + edge * 0.75;
            col = mix(vec3(0.8, 0.92, 1.0), uCol, inT);
          } else {
            float ring = 1.0 - smoothstep(0.0, 0.3, abs(dc - uP * uR));
            float ang = atan(q.y - uC.y, q.x - uC.x); float sw = pow(fract((ang / 6.2832) - uT * 0.6), 6.0);
            a = (ring * 0.9 + sw * 0.35 + 0.08) * (1.0 - smoothstep(uR * 0.92, uR, dc));
            col = uCol;
          }
          gl_FragColor = vec4(col, a);
        }`,
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, toneMapped: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
  }
  function setPatch(P2, cx, cz, half, key) {
    if (P2.key !== key) {
      if (P2.mesh.geometry) P2.mesh.geometry.dispose();
      const x0 = Math.floor(cx - half), z0 = Math.floor(cz - half);
      P2.mesh.geometry = drapeGeo(x0, z0, half * 2, half * 2, 1, 0.05);
      P2.key = key;
    }
  }


  function shipLand(tx, ty, instant) {
    if (!W) return;
    shipRemove();
    const g = tryModel(() => MODEL.lander(), () => fbLander());
    mergeInPlace(g, new Set([g.userData && g.userData.flame].filter(Boolean)));
    const x = tc(tx), z = tc(ty), y = hAt(x, z);
    W.ship = { obj: g, x, z, y, tx, ty, st: instant ? 'down' : 'in', t: 0, r: (g.userData && g.userData.r) || 2.8, flame: g.userData && g.userData.flame };
    g.position.set(x, instant ? y : y + 150, z);
    if (W.ship.flame) W.ship.flame.visible = !instant;
    W.group.add(g);
    rebuildObstacles(W.s);
  }
  function shipLeave() {
    if (!W || !W.ship) return;
    W.ship.st = 'out'; W.ship.t = 0;
    if (W.ship.flame) W.ship.flame.visible = true;
    burst(W.ship.x, W.ship.z, 70, W.moon ? 16 : 8, W.moon ? 2 : 3, W.moon ? 2.2 : 4, W.moon ? 0.9 : 2.2);
  }
  function shipRemove() {
    if (W && W.ship) { W.group.remove(W.ship.obj); W.ship = null; shipL.intensity = 0; rebuildObstacles(W.s); }
  }
  function stepShip(dt) {
    const S = W.ship; if (!S) { if (!SC.on) shipL.intensity = 0; return; }
    S.t += dt;
    let thrust = 0;
    if (S.st === 'in') {
      const T = 7.5, u = Math.min(1, S.t / T), alt = 150 * Math.pow(1 - u, 2.2);
      S.obj.position.y = S.y + alt; thrust = 0.6 + 0.4 * (1 - alt / 150);
      if (alt < 35) burst(S.x, S.z, Math.ceil((1 - alt / 35) * 9), W.moon ? 18 : 9, W.moon ? 1.2 : 2.5, W.moon ? 2 : 3.5, W.moon ? 0.8 : 2);
      if (u >= 1) { S.st = 'down'; shake = Math.max(shake, 0.25); rebuildObstacles(W.s); }
    } else if (S.st === 'out') {
      const a = 9, alt = 0.5 * a * S.t * S.t;
      S.obj.position.y = S.y + alt; thrust = 1;
      if (alt < 20) burst(S.x, S.z, 5, W.moon ? 16 : 8, 1.5, 2, 1.4);
      if (S.t > 7) { shipRemove(); return; }
    }
    if (S.flame) {
      S.flame.visible = thrust > 0;
      if (thrust) { const f = 0.85 + Math.random() * 0.3; S.flame.scale.set(f, thrust * (0.8 + Math.random() * 0.4), f); }
    }
    shipL.position.set(S.x, S.obj.position.y - 1, S.z); shipL.intensity = thrust * 6;
  }



  const ASTRO_FILL = { value: 0.3 }, astroMats = new Map();
  function astroMat(m) {
    if (!m || !m.isMeshStandardMaterial) return m;
    let v = astroMats.get(m); if (v) return v;
    v = m.clone();
    v.onBeforeCompile = sh => {
      sh.uniforms.uFill = ASTRO_FILL;
      sh.fragmentShader = 'uniform float uFill;\n' + sh.fragmentShader.replace('#include <lights_fragment_end>',
        '#include <lights_fragment_end>\n  reflectedLight.indirectDiffuse += diffuseColor.rgb * uFill * (0.35 + 0.65 * max(dot(normal, normalize(vViewPosition)), 0.0));');
    };
    v.customProgramCacheKey = () => 'astroFill';
    astroMats.set(m, v); astroMats.set(v, v);
    return v;
  }
  function makeAstro(col) {
    const g = tryModel(() => MODEL.astronaut(col), () => fbAstro(col)), u = g.userData || {};
    mergeInPlace(g, new Set([u.legL, u.legR, u.armL, u.armR].filter(Boolean)));
    for (const p of [u.legL, u.legR, u.armL, u.armR]) if (p) mergeInPlace(p, null);
    g.traverse(o => { if (o.isMesh) o.material = Array.isArray(o.material) ? o.material.map(astroMat) : astroMat(o.material); });
    return g;
  }
  function stepCrew(s, dt) {
    const want = s.t < ((s.fx && s.fx.lockUntil) || 0) ? 0 : (s.pop >= 2 ? cl(Math.floor(s.pop / 2) + 1, 2, 4) : s.pop);
    const yol = hasYol(), ob = W.obstC || W.obst;
    while (W.crew.length < want) {
      const i = W.crew.length, g = makeAstro(crewCol(i));
      const a = W.rand() * TAU; let x = tc(HUBX) + Math.cos(a) * 6, z = tc(HUBY) + Math.sin(a) * 6;
      if (yol) { const p = YOL.nearestFree(ob, x, z, CREW_PAD + 0.1, NB()); x = p.x; z = p.z; }
      W.group.add(g); W.crew.push({ g, x, z, tx: yol ? null : x, tz: yol ? null : z, wait: W.rand() * 3, face: 0, ph: 0 });
    }
    while (W.crew.length > want) { const c = W.crew.pop(); W.group.remove(c.g); }
    for (const c of W.crew) {
      let sp = 0;
      const x0 = c.x, z0 = c.z;
      if (yol) {

        if (c.wait > 0) {
          c.wait -= dt;
          if (!YOL.free(ob, c.x, c.z, CREW_PAD * 0.9)) { const p = YOL.nearestFree(ob, c.x, c.z, CREW_PAD, NB()); c.x = p.x; c.z = p.z; }
        } else {
          if (c.tx == null) { const p = crewPick(c); if (p) YOL.setTarget(c, p.x, p.z); else c.wait = 2; }
          if (c.tx != null) {
            const r = YOL.step(c, ob, dt, CREW_V, { pad: CREW_PAD, bounds: NB(), pick: crewPick });
            if (r.arrived) { c.tx = c.tz = null; c.wait = 1.5 + W.rand() * 5; }
          }
        }
      } else if (c.wait > 0) c.wait -= dt;
      else {
        const dx = c.tx - c.x, dz = c.tz - c.z, d = Math.hypot(dx, dz);
        if (d < 0.3) {
          c.wait = 1.5 + W.rand() * 5;
          for (let k = 0; k < 8; k++) {
            const a = W.rand() * TAU, r = 5 + W.rand() * 20, x = tc(HUBX) + Math.cos(a) * r, z = tc(HUBY) + Math.sin(a) * r;
            if (!W.obst.some(o => Math.hypot(o.x - x, o.z - z) < o.r + 1)) { c.tx = x; c.tz = z; break; }
          }
        } else { c.x += dx / d * CREW_V * dt; c.z += dz / d * CREW_V * dt; }
        for (const o of W.obst) { const ox = c.x - o.x, oz = c.z - o.z, d = Math.hypot(ox, oz), m = o.r + 0.4; if (d < m && d > 1e-3) { c.x = o.x + ox / d * m; c.z = o.z + oz / d * m; } }
      }
      const V = W.rover;
      if (V) {
        const ox = c.x - V.x, oz = c.z - V.z, d = Math.hypot(ox, oz), m = V.r + ROVER_GAP;
        if (d < m && d > 1e-3) {
          c.x = V.x + ox / d * m; c.z = V.z + oz / d * m;
          if (yol) { if (!YOL.free(ob, c.x, c.z, CREW_PAD * 0.9)) { const p = YOL.nearestFree(ob.concat([{ x: V.x, z: V.z, r: m }]), c.x, c.z, CREW_PAD, NB()); c.x = p.x; c.z = p.z; } c.tx = c.tz = null; }
          else { c.tx = c.x; c.tz = c.z; }
        }
      }

      const mx = c.x - x0, mz = c.z - z0, md = Math.hypot(mx, mz);
      if (md > 1e-4 && dt > 0 && md / dt > 0.3) {
        sp = Math.min(CREW_V, md / dt);
        const want2 = Math.atan2(mx, mz); let df = ((want2 - c.face + Math.PI) % TAU + TAU) % TAU - Math.PI; c.face += df * Math.min(1, dt * 5);
      }
      c.ph += sp * dt * 2.6;
      c.g.position.set(c.x, hAt(c.x, c.z) + (W.moon ? Math.abs(Math.sin(c.ph)) * 0.12 * (sp > 0) : 0), c.z);
      c.g.rotation.y = c.face;
      swing(c.g.userData, sp ? Math.sin(c.ph) * 0.5 : 0, false);
    }
  }


  const SUIT_PAL = [0xff7a2f, 0x3b8ee8, 0x3fbf5f, 0xf2c230, 0x9b6bff, 0xff5fa2];
  const LOOK = { spec: null, suit: 0xff7a2f, crew: [0x3b8ee8, 0x3fbf5f, 0xf2c230, 0x9b6bff] };
  const hexNum = h => typeof h === 'number' && isFinite(h) ? (h & 0xffffff) : (typeof h === 'string' && /^#[0-9a-f]{6}$/i.test(h) ? parseInt(h.slice(1), 16) : null);
  const nearCol = (a, b) => Math.hypot(((a >> 16) & 255) - ((b >> 16) & 255), ((a >> 8) & 255) - ((b >> 8) & 255), (a & 255) - (b & 255)) < 60;
  function crewOf(suit, want) {
    const out = [];
    for (const c of (want || []).map(hexNum).concat(SUIT_PAL)) {
      if (c == null || nearCol(c, suit) || out.some(o => nearCol(o, c))) continue;
      out.push(c); if (out.length === 4) break;
    }
    return out;
  }
  const crewCol = i => LOOK.crew[i % LOOK.crew.length];
  function modelLook() {
    const sp = Object.assign({}, LOOK.spec || {});
    const p = sp.patch && typeof sp.patch === 'object' ? Object.assign({}, sp.patch) : {};
    if (!p.sym) p.sym = W ? (W.moon ? 'ay' : 'mars') : 'yildiz';
    sp.patch = p;
    return sp;
  }
  function syncAstroMats() { for (const [m, v] of astroMats) if (m !== v && m.color && v.color) v.color.copy(m.color); }
  function applyModelLook() {
    if (hasModel() && MODEL.setLook) { try { MODEL.setLook(modelLook()); } catch (e) { console.warn('setLook', e); } }
    syncAstroMats();
  }
  function rebuildPlayer() {
    const old = W.player; if (!old) return;
    const g = makeAstro(LOOK.suit);
    g.position.copy(old.position); g.rotation.copy(old.rotation); g.scale.copy(old.scale); g.visible = old.visible;
    W.group.remove(old); W.group.add(g); W.player = g;
  }
  function rebuildCrew() {
    W.crew.forEach((c, i) => {
      const g = makeAstro(crewCol(i));
      g.position.copy(c.g.position); g.rotation.copy(c.g.rotation); g.visible = c.g.visible;
      W.group.remove(c.g); W.group.add(g); c.g = g;
    });
  }
  function setLook(spec) {
    if (!spec || typeof spec !== 'object') return false;
    const ps = LOOK.suit, pc = LOOK.crew.join();
    LOOK.spec = spec;
    const su = hexNum(spec.suit); if (su != null) LOOK.suit = su;
    LOOK.crew = crewOf(LOOK.suit, Array.isArray(spec.crew) ? spec.crew : null);
    applyModelLook();
    if (W && W.pring) W.pring.material.color.copy(lin(LOOK.suit));
    if (W && !SC.on) {
      if (LOOK.suit !== ps) rebuildPlayer();
      if (LOOK.crew.join() !== pc) rebuildCrew();
    }
    return true;
  }



  const ROVER_V = 2.5, ROVER_GO = { su: 1, maden: 1, pist: 1 }, ROVER_GAP = 0.8;

  function homeStop(home) { const r = (W.rover ? W.rover.r : 1) + 2; return Math.hypot(P.x - home.x, P.z - home.z) < r || W.crew.some(c => Math.hypot(c.x - home.x, c.z - home.z) < r) ? r + 0.5 : 0.4; }
  function roverHome() { return { x: tc(HUBX) - 3.7, z: tc(HUBY) + 3.7 }; }
  function makeRover() {
    if (!hasModel() || !MODEL.rover) return null;
    let g; try { g = MODEL.rover(W.world); } catch (e) { console.warn('rover', e); return null; }
    if (!g || !g.isObject3D) return null;
    const u = g.userData || {};
    mergeInPlace(g, null);
    if (u.lamp) own(u.lamp);
    (u.halos || []).forEach(m => own(m));
    g.rotation.order = 'YXZ';
    W.group.add(g);
    const h = roverHome(), yaw = -Math.PI / 4 + Math.PI;
    return { g, u, x: h.x, z: h.z, y: hAt(h.x, h.z), yaw, st: 'park', wait: 4, tgt: null, n: 0, best: 1e9, stuckT: 0, r: u.r || 1.4, lights: -1 };
  }
  function roverTargets(s) {
    const out = [];
    for (const e of W.bmap.values()) if (e.stage === 'r' && ROVER_GO[e.k]) out.push({ x: e.x, z: e.z, stop: e.r + 2.2 });
    const sc = s.scanned;
    if (sc) for (const k in sc) {
      if (!sc[k]) continue;
      const i = +k; if (!isFinite(i)) continue;
      const tx = i % MAPW, ty = Math.floor(i / MAPW);
      if (Math.hypot(tx - HUBX, ty - HUBY) > 6 || bAt(s, tx, ty)) continue;
      out.push({ x: tc(tx), z: tc(ty), stop: 3.2 });
    }
    return out;
  }
  function roverLights(V, on) {
    if (V.lights === on) return;
    V.lights = on;
    if (V.u.lamp) V.u.lamp.emissiveIntensity = on ? 2.6 : 0.12;
    V.g.traverse(o => { if (o.isSprite) o.visible = !!on; });
  }
  function roverDrive(V, tx, tz, stop, dt) {
    if (hasYol()) {
      if (V.gx !== tx || V.gz !== tz) { V.gx = tx; V.gz = tz; YOL.setTarget(V, tx, tz); V.gaveUp = false; }
      const r = YOL.step(V, W.obstC || W.obst, dt, ROVER_V, { pad: V.r * 0.8, bounds: NB(), arrive: stop, turn: 1.6 });
      if (r.arrived) { V.gx = V.gz = null; return true; }
      if (r.stuck || V.tx == null) { V.gx = V.gz = null; V.gaveUp = true; return true; }
      return false;
    }
    const dx = tx - V.x, dz = tz - V.z, d = Math.hypot(dx, dz);
    if (d <= stop) return true;
    let ux = dx / d, uz = dz / d;
    for (const o of W.obst) {
      const ox = o.x - V.x, oz = o.z - V.z, od = Math.hypot(ox, oz), clr = o.r + V.r + 0.8;
      if (od > clr + 3 || od < 1e-3 || ox * ux + oz * uz <= 0 || Math.hypot(o.x - tx, o.z - tz) < 0.5) continue;
      const side = (ux * oz - uz * ox) > 0 ? -1 : 1, k = cl((clr + 3 - od) / 3, 0, 1) * 1.6;
      ux += side * -oz / od * k; uz += side * ox / od * k;
    }
    const want = Math.atan2(ux, uz);
    let df = ((want - V.yaw + Math.PI) % TAU + TAU) % TAU - Math.PI;
    V.yaw += cl(df, -dt * 1.6, dt * 1.6);
    const sp = ROVER_V * Math.max(0.25, Math.cos(df)) * Math.min(1, d / 3 + 0.3);
    V.x += Math.sin(V.yaw) * sp * dt; V.z += Math.cos(V.yaw) * sp * dt;
    for (const o of W.obst) { const ox = V.x - o.x, oz = V.z - o.z, od = Math.hypot(ox, oz), m = o.r + V.r * 0.8; if (od < m && od > 1e-3) { V.x = o.x + ox / od * m; V.z = o.z + oz / od * m; } }
    V.x = cl(V.x, 2, MW - 2); V.z = cl(V.z, 2, MH - 2);

    if (d < V.best - 0.5) { V.best = d; V.stuckT = 0; } else V.stuckT += dt;
    return V.stuckT > 5;
  }


  const DRIVE_V = 5, DRIVE_BACK = 2.2, BOARD_M = 4;
  const DRV = { on: false, spd: 0, goal: null, camYaw: 0 };
  function nearRover() { const V = W && W.rover; if (!V || SC.on) return null; return Math.max(0, Math.hypot(P.x - V.x, P.z - V.z) - V.r); }
  function drive(on) {
    const V = W && W.rover;
    if (on) {
      if (DRV.on) return true;
      if (!V || SC.on || SHOW.on) return false;
      const d = nearRover(); if (d == null || d > BOARD_M) return false;
      DRV.on = true; DRV.spd = 0; DRV.goal = null; DRV.camYaw = V.yaw;
      try { if (W && W.s && !W.s.train && typeof noteTag === 'function') noteTag(W.s, 'x:surus'); } catch (e) {   }
      V.st = 'drive'; V.tgt = null; V.gx = V.gz = null; if (hasYol()) YOL.setTarget(V, null, null);
      WK.goal = null; P.vx = P.vz = P.vy = 0; P.onGround = true; P.moving = false;
      P.yaw = V.yaw + Math.PI;
      W.player.visible = false;
      emit('drive', true);
      return true;
    }
    if (!DRV.on) return false;
    DRV.on = false; DRV.spd = 0; DRV.goal = null;
    if (V) {

      const lx = V.x + Math.cos(V.yaw) * (V.r + 1.1), lz = V.z - Math.sin(V.yaw) * (V.r + 1.1);
      const ob = (W.obst || []).concat([{ x: V.x, z: V.z, r: V.r + ROVER_GAP }]);
      const p = hasYol() ? YOL.nearestFree(ob, lx, lz, 0.45, { x0: -EDGE + 1, z0: -EDGE + 1, x1: MW + EDGE - 1, z1: MH + EDGE - 1 }) : { x: lx, z: lz };
      setPlayer(p.x, p.z, V.yaw + Math.PI);
      V.st = 'hold'; V.wait = 20; V.tgt = null;
    }
    W.player.visible = true;
    emit('drive', false);
    return true;
  }
  function driveTo(x, z) {
    if (!DRV.on || !W.rover) return false;
    const V = W.rover, b = NB();
    DRV.goal = { x: cl(x, b.x0, b.x1), z: cl(z, b.z0, b.z1) };
    if (hasYol()) {
      const ob = W.obstC || W.obst, pad = V.r * 0.8;

      let g = YOL.nearestFree(ob, DRV.goal.x, DRV.goal.z, pad + 0.2, b);
      if (!YOL.reachable(ob, V.x, V.z, g.x, g.z, { pad, bounds: b })) {
        let best = null, bd = 1e9;
        for (let r = 2; r <= 24 && !best; r += 2) for (let i = 0; i < 16; i++) {
          const a = i / 16 * TAU, px = g.x + Math.cos(a) * r, pz = g.z + Math.sin(a) * r;
          if (YOL.free(ob, px, pz, pad + 0.2) && YOL.reachable(ob, V.x, V.z, px, pz, { pad, bounds: b })) { const d = Math.hypot(px - g.x, pz - g.z); if (d < bd) { bd = d; best = { x: px, z: pz }; } }
        }
        if (!best) { DRV.goal = null; return false; }
        g = best;
      }
      DRV.goal = g; YOL.setTarget(V, g.x, g.z);
    }
    emit('driveTo', Object.assign({}, DRV.goal));
    return true;
  }
  function stepDrive(dt) {
    const V = W.rover; if (!V) { DRV.on = false; W.player.visible = true; return; }
    const ob = W.obstC || W.obst, pad = V.r * 0.8, b = NB();
    const [ix, iz] = mode === 'walk' && inputOn ? moveInput() : [0, 0];
    if (ix || iz) DRV.goal = null;
    if (DRV.goal && hasYol()) {
      const r = YOL.step(V, ob, dt, DRIVE_V, { pad, bounds: b, arrive: 1.2, turn: 2 });
      DRV.spd = r.moved / Math.max(dt, 1e-3);
      if (r.arrived || r.stuck || V.tx == null) { DRV.goal = null; DRV.spd = 0; }
    } else {
      const tgt = iz > 0 ? iz * DRIVE_V : iz * DRIVE_BACK;
      DRV.spd += cl(tgt - DRV.spd, -dt * 6, dt * 4);
      if (Math.abs(DRV.spd) < 0.02 && !iz) DRV.spd = 0;
      V.yaw -= ix * dt * 1.9 * (DRV.spd < -0.1 ? -1 : 1);
      let nx = V.x + Math.sin(V.yaw) * DRV.spd * dt, nz = V.z + Math.cos(V.yaw) * DRV.spd * dt;
      nx = cl(nx, b.x0, b.x1); nz = cl(nz, b.z0, b.z1);
      const fr = hasYol() ? YOL.free(ob, nx, nz, pad) : !ob.some(o => Math.hypot(nx - o.x, nz - o.z) < o.r + pad);
      if (!fr) {
        if (hasYol()) { const p = YOL.nearestFree(ob, nx, nz, pad, b); nx = p.x; nz = p.z; } else { nx = V.x; nz = V.z; }
        DRV.spd *= 0.4;
      }
      V.x = nx; V.z = nz;
    }
    P.x = V.x; P.z = V.z; P.y = P.camY = V.y; P.vx = P.vz = P.vy = 0; P.onGround = true; P.moving = Math.abs(DRV.spd) > 0.3;
    P.face = V.yaw;
    if (P.moving) { P.puff -= dt; if (P.puff <= 0) { P.puff = 0.12; burst(V.x - Math.sin(V.yaw) * V.r, V.z - Math.cos(V.yaw) * V.r, 3, 1.2, 0.6, 1.2, 0.35); } }
    W.player.position.set(V.x, V.y, V.z);
  }
  function camDrive(dt) {
    const V = W.rover; if (!V) { camWalk(dt); return; }
    let df = ((V.yaw - DRV.camYaw + Math.PI) % TAU + TAU) % TAU - Math.PI; DRV.camYaw += df * Math.min(1, dt * 3);
    const fx = Math.sin(DRV.camYaw), fz = Math.cos(DRV.camYaw), d = 6.5 + V.r;
    let x = V.x - fx * d, z = V.z - fz * d, y = V.y + 3.4;
    y = Math.max(y, hAt(x, z) + 1.2);
    cam.position.set(x, y, z);
    cam.lookAt(V.x + fx * 4, V.y + 0.9, V.z + fz * 4);
  }
  function stepRover(s, dt, still) {
    const V = W.rover; if (!V) return;
    V.g.visible = !SC.on;
    if (SC.on) return;
    const night = W.dark > 0.55 || (!W.moon && W.storm > 0.3);
    roverLights(V, night ? 1 : 0);
    const pd = DRV.on ? 1e9 : Math.hypot(P.x - V.x, P.z - V.z);

    const crewNear = W.crew.some(c => { const dx = c.x - V.x, dz = c.z - V.z, d = Math.hypot(dx, dz); if (d >= 4 || d < 1e-3) return false; const tg = V.tgt && V.st !== 'park' ? Math.atan2(V.tgt.x - V.x, V.tgt.z - V.z) : V.yaw; return (dx * Math.sin(tg) + dz * Math.cos(tg)) / d > 0.7; });
    if (DRV.on) {   }
    else if (!still && pd > 4 && !crewNear) {
      const home = roverHome(), go = (st, tgt) => { V.st = st; V.tgt = tgt; V.best = 1e9; V.stuckT = 0; };
      if (night && (V.st === 'go' || V.st === 'work')) go('back', { x: home.x, z: home.z, stop: homeStop(home) });
      if (V.st === 'park') {
        V.wait -= dt;
        if (V.wait <= 0 && !night) {
          const list = roverTargets(s);
          if (list.length) { const t = list[V.n++ % list.length]; go('go', t); } else V.wait = 5;
        }
      } else if (V.st === 'work' || V.st === 'hold' || V.st === 'drive') {
        V.wait -= dt; if (V.wait <= 0) go('back', { x: home.x, z: home.z, stop: homeStop(home) });
      } else if (V.tgt && roverDrive(V, V.tgt.x, V.tgt.z, V.tgt.stop, dt)) {
        if (V.st === 'go') { V.st = 'work'; V.wait = 4 + W.rand() * 3; }
        else { if (V.stuckT > 5) { V.x = home.x; V.z = home.z; } V.st = 'park'; V.wait = 6 + W.rand() * 4; V.yaw = -Math.PI / 4 + Math.PI; }
      }
    }

    if (!DRV.on && pd < V.r + ROVER_GAP && pd > 1e-3) { const m = V.r + ROVER_GAP; P.x = V.x + (P.x - V.x) / pd * m; P.z = V.z + (P.z - V.z) / pd * m; }

    const fx = Math.sin(V.yaw), fz = Math.cos(V.yaw), L = 1.1, Wd = 0.8;
    const hF = hAt(V.x + fx * L, V.z + fz * L), hB = hAt(V.x - fx * L, V.z - fz * L), hl = hAt(V.x + fz * Wd, V.z - fx * Wd), hr = hAt(V.x - fz * Wd, V.z + fx * Wd);
    V.y = (hF + hB + hl + hr) / 4;
    V.g.position.set(V.x, V.y, V.z);
    V.g.rotation.set(-Math.atan2(hF - hB, 2 * L), V.yaw, Math.atan2(hl - hr, 2 * Wd));
  }



  const SHOW = { on: false, target: null, side: 'center', t: 0, inPrev: true, base: 0, yaw: 0, drag: null, idle: 9, vel: 0 };
  const SHOW_FOV = 40;
  function showBase() {
    let best = null, bd = 1e9;
    for (const e of W.bmap.values()) if (e.stage === 'r' && e.k !== 'hub') { const d = Math.hypot(e.x - tc(HUBX), e.z - tc(HUBY)) + (e.k === 'gunes' || e.k === 'pist' ? 100 : 0); if (d < bd) { bd = d; best = e; } }
    return best;
  }

  function showFrame() {
    if (SHOW.target === 'rover' && W.rover) { const V = W.rover; return { x: V.x, z: V.z, y: V.y + 0.9, d: 6.2, h: 1.5 }; }
    const e = SHOW.target === 'base' ? showBase() : null, hx = tc(HUBX), hz = tc(HUBY);
    return e ? { x: e.x, z: e.z, y: e.y + e.h * 0.45, d: Math.max(9, e.r * 3.4), h: e.h * 0.5 + 2.5, self: e } : { x: hx, z: hz, y: hAt(hx, hz) + 2.6, d: 13, h: 3.4 };
  }
  function clearAngle(f, pref) {
    let best = pref, bs = 1e9;
    for (let i = 0; i < 36; i++) {
      const a = pref + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * (TAU / 36);
      let n = 0;
      for (const o of W.obst) {
        const dx = o.x - f.x, dz = o.z - f.z, od = Math.hypot(dx, dz);
        if (od < 0.8 || (f.self && Math.hypot(o.x - f.self.x, o.z - f.self.z) < 0.5)) continue;
        const ux = Math.sin(a), uz = Math.cos(a), along = dx * ux + dz * uz;
        if (Math.hypot(f.x + ux * f.d - o.x, f.z + uz * f.d - o.z) < o.r + 2.5 && o.top > f.y) { n++; continue; }
        if (along <= 0 || along > f.d) continue;
        const side = Math.abs(dx * uz - dz * ux), yLine = f.y + f.h * along / f.d;
        if (side < o.r + 0.5 && o.top > yLine - 0.3) n++;
      }
      if (n < bs) { bs = n; best = a; if (!n) break; }
    }
    return best;
  }
  function showcase(target, opts) {
    if (!ok) return false;
    if (target == null) {
      if (!SHOW.on) return false;
      SHOW.on = false; SHOW.target = null; SHOW.drag = null; cam.clearViewOffset(); showLights(false);
      if (SHOW.inPrev) setInput(true);
      startBlend(0.6); emit('showcase', null);
      return true;
    }
    if (!W || SC.on || !['player', 'rover', 'hub', 'base'].includes(target)) return false;
    if (target === 'rover' && !W.rover) return false;
    if (!SHOW.on) { SHOW.inPrev = inputOn; SHOW.t = 0; }
    const side = opts && opts.side;
    SHOW.side = side === 'left' || side === 'right' ? side : 'center';
    SHOW.target = target; SHOW.on = true; SHOW.t = 0; SHOW.yaw = 0; SHOW.drag = null; SHOW.idle = 9; SHOW.vel = 0;
    SHOW.base = target === 'player' ? Math.atan2(P.x - tc(HUBX), P.z - tc(HUBY)) : target === 'rover' ? W.rover.yaw + 0.9 : 0.5;
    if (target !== 'player') SHOW.base = clearAngle(showFrame(), SHOW.base);
    setInput(false); WK.goal = null; exitLock();
    startBlend(0.8); emit('showcase', target);
    return true;
  }

  function showLights(on, x, y, z, a) {
    if (!showRim) return;
    if (!on) { showRim.intensity = 0; droneL.color.setHex(0xc4d2ff); return; }
    const kx = Math.sin(a + 0.75), kz = Math.cos(a + 0.75), rx = Math.sin(a + Math.PI - 0.5), rz = Math.cos(a + Math.PI - 0.5);
    droneL.color.setRGB(1, 0.97, 0.92); droneL.intensity = 0.35 + 1.3 * W.dark;
    droneL.position.set(x + kx * 20, y + 14, z + kz * 20); droneL.target.position.set(x, y, z);
    showRim.intensity = 1.1 + 0.9 * W.dark; showRim.position.set(x + rx * 20, y + 10, z + rz * 20); showRim.target.position.set(x, y, z);
    amb.color.setRGB(0.75, 0.8, 0.95); amb.intensity = Math.max(amb.intensity, 0.12);
    ASTRO_FILL.value = Math.max(ASTRO_FILL.value, 0.55);
  }
  function camShow(dt) {
    SHOW.t += dt;
    const t = SHOW.t;

    if (!SHOW.drag) { SHOW.idle += dt; SHOW.yaw += SHOW.vel * dt; SHOW.vel *= Math.exp(-dt * 3); }
    let x, y, z, d, h, a;
    if (SHOW.target === 'player') {

      if (!SHOW.drag && SHOW.idle > 1.2) SHOW.yaw += dt * 0.35 * Math.min(1, (SHOW.idle - 1.2) / 1.5);
      x = P.x; z = P.z; y = P.y + 0.98; d = 2.75; h = 0.22;
      a = SHOW.base + 0.12 * Math.sin(t * 0.32);
      W.player.rotation.y = SHOW.base + SHOW.yaw;
      swing(W.player.userData, 0, false);
    } else {

      const f = showFrame(); x = f.x; z = f.z; y = f.y; d = f.d * 0.86; h = f.h;
      a = SHOW.base + SHOW.yaw + (SHOW.idle > 1.2 ? 0.5 * Math.sin(t * (SHOW.target === 'rover' ? 0.3 : 0.2)) : 0);
    }
    let cx = x + Math.sin(a) * d, cz = z + Math.cos(a) * d, cy = y + h;
    cy = Math.max(cy, hAt(cx, cz) + 0.6);
    cam.position.set(cx, cy, cz); cam.lookAt(x, y, z);
    W.player.visible = !DRV.on;
    showLights(true, x, y, z, a);

    const fr = cw < 900 ? 0.45 : 0.55, off = SHOW.side === 'left' ? (0.5 - fr / 2) * cw : SHOW.side === 'right' ? -(0.5 - fr / 2) * cw : 0;
    if (off) cam.setViewOffset(cw, ch, off, 0, cw, ch); else if (cam.view && cam.view.enabled) cam.clearViewOffset();
  }
  function showDrag(dx) {
    const k = 0.011; SHOW.yaw += dx * k; SHOW.vel = SHOW.vel * 0.6 + dx * k * 0.4 / 0.016; SHOW.idle = 0;
  }

  const FL = { list: null, t: 0, dur: 0.6 };
  const FL_KEYS = { visor: ['visor'], patch: ['patch'], rover: ['roverBody', 'roverTrim'], craft: ['craftBand', 'craftNose'], bld: ['bldTrim'] };
  function flashRestore() { if (FL.list) for (const q of FL.list) { q.m.emissive.copy(q.e); q.m.emissiveIntensity = q.i; } FL.list = null; }
  function showcaseFlash(cat) {
    if (!W || !ok) return false;
    flashRestore();
    const set = new Set();
    if (cat === 'suit') {
      const c = lin(LOOK.suit);
      [W.player, ...W.crew.map(q => q.g)].forEach(g => g && g.traverse(o => { if (o.isMesh) [].concat(o.material).forEach(m => { if (m && m.color && m.emissive && Math.abs(m.color.r - c.r) + Math.abs(m.color.g - c.g) + Math.abs(m.color.b - c.b) < 0.02) set.add(m); }); }));
    } else if (FL_KEYS[cat] && hasModel() && MODEL.mat) {
      for (const k of FL_KEYS[cat]) { let m; try { m = MODEL.mat(k); } catch (e) { m = null; } if (m && m.emissive) { set.add(m); const v = astroMats.get(m); if (v && v.emissive) set.add(v); } }
    } else return false;
    FL.list = [...set].map(m => ({ m, e: m.emissive.clone(), i: m.emissiveIntensity }));
    FL.t = 0;
    return true;
  }
  function stepFlash(dt) {
    if (!FL.list) return;
    FL.t += dt; const u = FL.t / FL.dur;
    if (u >= 1) { flashRestore(); return; }
    const k = Math.sin(Math.PI * u);
    for (const q of FL.list) { q.m.emissive.copy(q.e).lerp(q.m.color, 0.5).lerp(new THREE.Color(1, 1, 1), 0.35 * k); q.m.emissiveIntensity = q.i + 1.6 * k; }
  }

  function swing(u, a, air) {
    if (!u) return;
    if (u.legL) u.legL.rotation.x = air ? 0.35 : a;
    if (u.legR) u.legR.rotation.x = air ? -0.2 : -a;
    if (u.armL) u.armL.rotation.x = air ? -0.5 : -a * 0.8;
    if (u.armR) u.armR.rotation.x = air ? -0.4 : a * 0.8;
  }


  const keys = {};
  const ms = { nx: 0, ny: 0, has: false, down: -1, sx: 0, sy: 0, moved: 0, drag: false, lockFails: 0, dragLook: false, locked: false, t0: 0, fired: false };
  const touch = { stick: null, look: null, look2: null, pinch: 0, sx: 0, sy: 0, mx: 0, my: 0, tapX: 0, tapY: 0, t0: 0, moved: 0 };
  let stickEl = null, stickKnob = null, tapAim = false;
  const isField = t => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
  const OWN = { KeyW: 1, KeyA: 1, KeyS: 1, KeyD: 1, ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1, ShiftLeft: 1, ShiftRight: 1, Space: 1, KeyQ: 1, KeyE: 1 };
  const MOVEK = { KeyW: 1, KeyA: 1, KeyS: 1, KeyD: 1, ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1 };
  function onKey(e, down) {
    if (isField(e.target)) return;

    if (!inputOn) { if (down && !e.repeat && MOVEK[e.code]) emit('blockedMove', e.code); return; }
    if (SC.on) return;
    if (!OWN[e.code]) return;
    if ((e.code === 'KeyQ' || e.code === 'KeyE') && mode === 'plan') { if (down && !e.repeat) PL.yawT += (e.code === 'KeyQ' ? 1 : -1) * Math.PI / 2; return; }
    if ((e.code === 'KeyQ' || e.code === 'KeyE') && mode !== 'drone') { keys[e.code] = false; return; }
    if (down && MOVEK[e.code]) WK.goal = null;
    if (down && e.code === 'Space' && !e.repeat && mode === 'walk' && !DRV.on) P.jumpReq = true;
    if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
    keys[e.code] = down;
  }
  function setCursor(e) {
    const r = canvas.getBoundingClientRect();
    ms.nx = ((e.clientX - r.left) / r.width) * 2 - 1; ms.ny = -((e.clientY - r.top) / r.height) * 2 + 1; ms.has = true;
  }
  function tryLock() {
    if (ms.lockFails >= 2 || !canvas.requestPointerLock) { ms.dragLook = true; return; }
    try {
      const p = canvas.requestPointerLock();
      if (p && p.catch) p.catch(() => lockFail());
    } catch (e) { lockFail(); }
    setTimeout(() => { if (!ms.locked && mode === 'walk') ms.dragLook = true; }, 700);
  }
  function lockFail() { ms.lockFails++; ms.dragLook = true; }
  function primary() { emit('primary', Object.assign({}, aim)); }
  function look(dx, dy) {
    if (mode === 'walk') { P.yaw -= dx * 0.0024; P.pitch = cl(P.pitch - dy * 0.0022, -1.25, 0.8); }
  }

  const CLICK_PX = 6, CLICK_MS = 650;
  function onDown(e) {
    if (SHOW.on && !SC.on && e.button === 0) { SHOW.drag = { x: e.clientX }; SHOW.idle = 0; SHOW.vel = 0; return; }
    if (!inputOn || SC.on) return;
    setCursor(e);
    ms.down = e.button; ms.sx = e.clientX; ms.sy = e.clientY; ms.moved = 0; ms.t0 = performance.now(); ms.fired = false;
    if (mode === 'walk' && e.button === 0) {

      if (ms.locked) return;
      ms.dragLook = true;
    }
  }
  function onMove(e) {
    if (e.target === canvas || ms.down >= 0) setCursor(e);
    if (SHOW.drag) { if (!SHOW.on) SHOW.drag = null; else { showDrag(e.clientX - SHOW.drag.x); SHOW.drag.x = e.clientX; } return; }
    if (!inputOn || SC.on) return;
    const dx = e.movementX || 0, dy = e.movementY || 0;
    if (ms.down >= 0) ms.moved += Math.abs(dx) + Math.abs(dy);
    if (ms.locked) { look(dx, dy); return; }
    if (ms.down < 0) return;
    if (mode === 'walk') { if (ms.dragLook || ms.down === 2) look(dx, dy); }
    else if (mode === 'plan') { if (ms.down === 0 || ms.down === 1) planPan(dx, dy); }
    else if (ms.down === 2 || (ms.down === 0 && e.shiftKey)) { DR.yaw -= dx * 0.005; DR.pitch = cl(DR.pitch + dy * 0.004, 0.35, 1.45); }
    else if (ms.down === 0) dronePan(dx, dy);
  }
  function onUp(e) {
    if (SHOW.drag) { SHOW.drag = null; return; }
    if (ms.down < 0) return;
    const b = ms.down; ms.down = -1;
    if (!inputOn || SC.on) return;
    const click = ms.moved < CLICK_PX && performance.now() - ms.t0 < CLICK_MS;
    if (mode === 'plan' && b === 2 && click) { emit('cancel'); return; }
    if (b !== 0 || ms.fired || !click) return;
    if (mode !== 'walk') { computeAim(); topClick(); return; }

    if (ghostK) { computeAim(); primary(); return; }
    if (ms.locked) return;
    tapAim = true; computeAim(); tapAim = false; topClick();
  }


  const TAP_TOL = () => (ms.touchMode ? 44 : 36);
  function tapPx() { return { x: (ms.nx + 1) / 2 * cw, y: (1 - ms.ny) / 2 * ch }; }
  function snapTap() {
    if (!W || !ms.has || (mode === 'walk' && ms.locked)) return null;
    const tp = tapPx(), tol = TAP_TOL(), cands = [];
    if (GOAL.pos && W.goal && W.goal.visible) {
      const gx = GOAL.pos.x, gz = GOAL.pos.z, pr = project(gx, hAt(gx, gz) + 0.12, gz);
      let d = pr.behind ? 1e9 : Math.hypot(pr.sx - tp.x, pr.sy - tp.y);
      const tr = W.tagGo && W.tagGo.visible ? tagRect(W.tagGo) : null;
      if (tr && tp.x >= tr.x0 && tp.x <= tr.x1 && tp.y >= tr.y0 && tp.y <= tr.y1) d = 0;
      cands.push({ d, tx: Math.floor(gx / TS), ty: Math.floor(gz / TS), what: 'goal' });
    }
    const hb = PL.hints && PL.hints.best;
    if (mode === 'plan' && hb && hb.tx >= 0 && W.hints && W.hints.visible) {
      const x = tc(hb.tx), z = tc(hb.ty), y = hAt(x, z) + 0.4, pr = project(x, y, z), pe = project(x + 3.1, y, z);
      const rad = pr.behind ? 0 : Math.hypot(pe.sx - pr.sx, pe.sy - pr.sy);
      cands.push({ d: pr.behind ? 1e9 : Math.max(0, Math.hypot(pr.sx - tp.x, pr.sy - tp.y) - rad), tx: hb.tx, ty: hb.ty, what: 'star' });
    }
    let best = null; for (const c of cands) if (c.d <= tol && (!best || c.d < best.d)) best = c;
    if (!best || best.tx < 0 || best.ty < 0 || best.tx >= MAPW || best.ty >= MAPH) return null;

    if (!(W.s && W.s.train) && aim.kind === 'building' && !(aim.tx === best.tx && aim.ty === best.ty) && best.what === 'goal') return null;
    setAimTile(best.tx, best.ty);
    if (mode === 'plan') PL.pin = { tx: best.tx, ty: best.ty };
    TAPDBG.last = { what: best.what, tx: best.tx, ty: best.ty, d: Math.round(best.d) };
    return best;
  }
  const TAPDBG = { last: null };
  function topClick() {
    TAPDBG.last = null;

    try { if (typeof ISKART !== 'undefined' && ISKART && typeof ISKART.holdWalk === 'function' && ISKART.holdWalk() && mode !== 'plan') return; } catch (e) {   }
    snapTap();
    if (DRV.on && mode !== 'plan' && !ghostK && aim.kind === 'tile') { driveTo(aim.x, aim.z); return; }
    if (WK.on && mode !== 'plan' && !ghostK && (aim.kind === 'tile' || aim.far)) { walkTo(aim.x, aim.z); emit('walk', { x: aim.x, z: aim.z, tx: aim.tx, ty: aim.ty }); return; }
    primary();
  }
  function dronePan(dx, dy) {
    const k = DR.dist / Math.max(300, ch) * 1.6, sy = Math.sin(DR.yaw), cy = Math.cos(DR.yaw);
    DR.x += (-dx * cy - dy * sy) * k; DR.z += (dx * sy - dy * cy) * k;
  }
  function planPan(dx, dy) {
    const k = 2 * PL.dist * Math.tan(cam.fov * D2R / 2) / Math.max(200, ch), kz = k / Math.sin(PLAN_PITCH), sy = Math.sin(PL.yaw), cy = Math.cos(PL.yaw);
    PL.x += -dx * cy * k - dy * sy * kz; PL.z += dx * sy * k - dy * cy * kz;
  }

  function planDistFor(tilesW) { const hf = 2 * Math.atan(Math.tan(PLAN_FOV * D2R / 2) * Math.max(0.3, cw / ch)); return tilesW * TS / (2 * Math.tan(hf / 2)); }
  function planZoom(f) { PL.distT = cl(PL.distT * f, planDistFor(6), planDistFor(20)); }
  function onWheel(e) {
    if (!inputOn || SC.on) return;
    e.preventDefault();
    const f = Math.pow(1.0015, e.deltaY);
    if (mode === 'walk') P.camDT = cl(P.camDT * f + (e.deltaY > 0 ? 0.15 : -0.15), 0, 9);
    else if (mode === 'plan') planZoom(f);
    else DR.distT = cl(DR.distT * f, 16, 280);
  }
  function stickUI(show, x0, y0, x1, y1) {
    if (!stickEl) {
      const par = canvas.parentElement || document.body;
      stickEl = document.createElement('div'); stickKnob = document.createElement('div');
      stickEl.style.cssText = 'position:fixed;width:110px;height:110px;margin:-55px 0 0 -55px;border-radius:50%;border:2px solid rgba(220,235,255,.3);background:radial-gradient(circle,rgba(12,20,38,.12),rgba(12,20,38,.38));box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 8px 28px rgba(0,0,0,.3);pointer-events:none;z-index:40;display:none';
      stickKnob.style.cssText = 'position:fixed;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:radial-gradient(circle at 50% 30%,rgba(255,255,255,.62),rgba(220,235,255,.34) 70%);border:1px solid rgba(255,255,255,.45);box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 4px 14px rgba(0,0,0,.35);pointer-events:none;z-index:41;display:none';
      par.appendChild(stickEl); par.appendChild(stickKnob);
    }
    stickEl.style.display = stickKnob.style.display = show ? 'block' : 'none';
    if (show) { stickEl.style.left = x0 + 'px'; stickEl.style.top = y0 + 'px'; stickKnob.style.left = x1 + 'px'; stickKnob.style.top = y1 + 'px'; }
  }
  const pinchTo = (a, b) => { if (mode === 'plan') planZoom(a / b); else DR.distT = cl(DR.distT * a / b, 16, 280); };
  function onTouch(e, type) {
    if (SHOW.on && !SC.on) {
      e.preventDefault();
      const t = e.changedTouches[0]; if (!t) return;
      if (type === 'start' && !SHOW.drag) { SHOW.drag = { x: t.clientX, id: t.identifier }; SHOW.idle = 0; SHOW.vel = 0; }
      else if (SHOW.drag) for (const q of e.changedTouches) if (q.identifier === SHOW.drag.id) {
        if (type === 'move') { showDrag((q.clientX - SHOW.drag.x) * 1.3); SHOW.drag.x = q.clientX; } else SHOW.drag = null;
      }
      return;
    }
    if (!inputOn || SC.on) return;
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    for (const t of e.changedTouches) {
      if (type === 'start') {
        if (mode === 'walk' && !touch.stick && t.clientX - r.left < r.width * 0.42) { touch.stick = { id: t.identifier, x0: t.clientX, y0: t.clientY, x: t.clientX, y: t.clientY }; stickUI(true, t.clientX, t.clientY, t.clientX, t.clientY); }
        else if (!touch.look) { touch.look = { id: t.identifier, x: t.clientX, y: t.clientY, x0: t.clientX, y0: t.clientY, t0: performance.now(), moved: 0 }; }
        else if (!touch.look2 && mode !== 'walk') { touch.look2 = { id: t.identifier, x: t.clientX, y: t.clientY }; touch.pinch = Math.hypot(t.clientX - touch.look.x, t.clientY - touch.look.y); }
      } else if (type === 'move') {
        if (touch.stick && t.identifier === touch.stick.id) {
          touch.stick.x = t.clientX; touch.stick.y = t.clientY;
          let dx = t.clientX - touch.stick.x0, dy = t.clientY - touch.stick.y0; const d = Math.hypot(dx, dy); if (d > 50) { dx *= 50 / d; dy *= 50 / d; }
          stickUI(true, touch.stick.x0, touch.stick.y0, touch.stick.x0 + dx, touch.stick.y0 + dy);
        } else if (touch.look && t.identifier === touch.look.id) {
          const dx = t.clientX - touch.look.x, dy = t.clientY - touch.look.y; touch.look.x = t.clientX; touch.look.y = t.clientY; touch.look.moved += Math.abs(dx) + Math.abs(dy);
          if (touch.look2) {
            const d = Math.hypot(touch.look.x - touch.look2.x, touch.look.y - touch.look2.y); if (touch.pinch > 0) pinchTo(touch.pinch, Math.max(20, d)); touch.pinch = d;
          } else if (mode === 'walk') look(dx * 1.6, dy * 1.6); else if (mode === 'plan') { if (touch.look.moved >= 10) planPan(dx, dy); } else dronePan(dx, dy);
        } else if (touch.look2 && t.identifier === touch.look2.id) {
          const odx = t.clientX - touch.look2.x; touch.look2.x = t.clientX; touch.look2.y = t.clientY;
          const d = Math.hypot(touch.look.x - touch.look2.x, touch.look.y - touch.look2.y); if (touch.pinch > 0) pinchTo(touch.pinch, Math.max(20, d)); touch.pinch = d;
          if (mode === 'drone') DR.yaw -= odx * 0.002;
        }
      } else {
        if (touch.stick && t.identifier === touch.stick.id) { touch.stick = null; stickUI(false); }
        else if (touch.look && t.identifier === touch.look.id) {
          const tap = touch.look.moved < 10 && performance.now() - touch.look.t0 < 350;
          if (tap) {
            ms.nx = ((t.clientX - r.left) / r.width) * 2 - 1; ms.ny = -((t.clientY - r.top) / r.height) * 2 + 1; ms.has = true; tapAim = true;
            computeAim(); tapAim = false; topClick();
          }
          touch.look = touch.look2 ? { id: touch.look2.id, x: touch.look2.x, y: touch.look2.y, x0: 0, y0: 0, t0: 0, moved: 99 } : null; touch.look2 = null;
        } else if (touch.look2 && t.identifier === touch.look2.id) touch.look2 = null;
      }
    }
  }
  function bindInput() {
    window.addEventListener('keydown', e => onKey(e, true));
    window.addEventListener('keyup', e => onKey(e, false));
    window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('touchstart', e => onTouch(e, 'start'), { passive: false });
    canvas.addEventListener('touchmove', e => onTouch(e, 'move'), { passive: false });
    canvas.addEventListener('touchend', e => onTouch(e, 'end'), { passive: false });
    canvas.addEventListener('touchcancel', e => onTouch(e, 'end'), { passive: false });

    document.addEventListener('pointerlockchange', () => {
      const l = document.pointerLockElement === canvas;
      if (l !== ms.locked) {
        ms.locked = l; if (l) { ms.dragLook = false; ms.lockFails = 0; }
        const why = l ? 'user' : (ms.selfExit ? 'self' : 'user'); ms.selfExit = false;
        emit('lock', l, why);
      }
    });
    document.addEventListener('pointerlockerror', () => { lockFail(); ms.selfExit = false; emit('lock', false, 'self'); });
    canvas.addEventListener('touchstart', () => { ms.touchMode = true; }, { passive: true });
    window.addEventListener('mousemove', e => { if (e.movementX || e.movementY) ms.touchMode = false; });
  }


  function moveInput() {
    let ix = 0, iz = 0;
    if (keys.KeyW || keys.ArrowUp) iz += 1;
    if (keys.KeyS || keys.ArrowDown) iz -= 1;
    if (keys.KeyD || keys.ArrowRight) ix += 1;
    if (keys.KeyA || keys.ArrowLeft) ix -= 1;
    if (touch.stick) { ix += (touch.stick.x - touch.stick.x0) / 50; iz -= (touch.stick.y - touch.stick.y0) / 50; }
    const d = Math.hypot(ix, iz); if (d > 1) { ix /= d; iz /= d; }
    return [ix, iz];
  }
  function stepPlayer(s, dt) {
    const g = GRAV[W.world];
    const [ix, iz] = mode === 'walk' ? moveInput() : [0, 0];
    const run = keys.ShiftLeft || keys.ShiftRight;
    const sp = (run ? 7.2 : 4.2), fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), rx = Math.cos(P.yaw), rz = -Math.sin(P.yaw);
    let tvx = (fx * iz + rx * ix) * sp, tvz = (fz * iz + rz * ix) * sp;
    if (WK.goal && mode !== 'plan') {
      if (WK.ref !== W.obst) wkPlan();
      const nx = hasYol() && WK.w ? YOL.walkNext(WK.w, P.x, P.z) : { x: WK.goal.x, z: WK.goal.z, last: true };
      if (WK.w && WK.w.pi !== WK.pi) { WK.pi = WK.w.pi; WK.lastD = 1e9; WK.stuck = 0; }
      const dx = nx.x - P.x, dz = nx.z - P.z, d = Math.hypot(dx, dz);
      if (nx.last && d < 0.5) { WK.goal = null; WK.w = null; tvx = tvz = 0; }
      else {
        const v = nx.last ? Math.min(4.2, 0.8 + d * 1.4) : 4.2; tvx = dx / d * v; tvz = dz / d * v;
        if (d < WK.lastD - 0.4) { WK.lastD = d; WK.stuck = 0; }
        else if ((WK.stuck += dt) > 1.5) { if (!WK.retry && hasYol()) { WK.retry = 1; wkPlan(); } else { WK.goal = null; WK.w = null; } }
      }
    }
    const acc = P.onGround ? 9 : 1.6;
    P.vx += (tvx - P.vx) * Math.min(1, dt * acc); P.vz += (tvz - P.vz) * Math.min(1, dt * acc);
    P.x += P.vx * dt; P.z += P.vz * dt;

    for (const o of W.obst) {
      if (P.y > o.top - 0.3) continue;
      const dx = P.x - o.x, dz = P.z - o.z, d = Math.hypot(dx, dz), m = o.r + 0.45;
      if (d < m && d > 1e-4) { P.x = o.x + dx / d * m; P.z = o.z + dz / d * m; const vn = (P.vx * dx + P.vz * dz) / d; if (vn < 0) { P.vx -= vn * dx / d; P.vz -= vn * dz / d; } }
    }

    const lo = -EDGE, hx = MW + EDGE, hz = MH + EDGE, k = Math.min(1, dt * 6);
    if (P.x < lo) P.x += (lo - P.x) * k; if (P.x > hx) P.x += (hx - P.x) * k;
    if (P.z < lo) P.z += (lo - P.z) * k; if (P.z > hz) P.z += (hz - P.z) * k;
    const gy = hAt(P.x, P.z);
    if (P.onGround) {
      if (P.jumpReq) { P.vy = JUMPV[W.world]; P.onGround = false; emit('jump'); burst(P.x, P.z, 10, 1.6, 0.8, 1.6, 0.35); }
      else if (gy < P.y - 0.45) { P.onGround = false; P.vy = 0; }
      else P.y = gy;
    }
    P.jumpReq = false;
    if (!P.onGround) {
      P.vy -= g * dt; P.y += P.vy * dt;
      if (P.y <= gy) { P.y = gy; P.onGround = true; if (P.vy < -1.5) burst(P.x, P.z, 16, 2.2, 0.6, 1.8, 0.4); P.vy = 0; }
    }
    const spd = Math.hypot(P.vx, P.vz);
    P.moving = spd > 0.3;
    if (P.moving) { const want = Math.atan2(P.vx, P.vz); let d = ((want - P.face + Math.PI) % TAU + TAU) % TAU - Math.PI; P.face += d * Math.min(1, dt * 8); }
    P.phase += spd * dt * (W.moon ? 1.5 : 2.1);
    if (P.onGround && P.moving) { P.puff -= dt; if (P.puff <= 0) { P.puff = run ? 0.22 : 0.4; burst(P.x, P.z, 2, 0.8, 0.5, 1.2, 0.25); } }

    const m = W.player;
    const hop = P.onGround && P.moving && W.moon ? Math.abs(Math.sin(P.phase)) * 0.14 : 0;
    m.position.set(P.x, P.y + hop, P.z); m.rotation.y = P.face;
    swing(m.userData, P.moving && P.onGround ? Math.sin(P.phase) * 0.55 * Math.min(1, spd / 4) : 0, !P.onGround);
  }
  function camWalk(dt) {
    P.camD += (P.camDT - P.camD) * Math.min(1, dt * 8);
    const cp = Math.cos(P.pitch), fx = -Math.sin(P.yaw) * cp, fy = Math.sin(P.pitch), fz = -Math.cos(P.yaw) * cp;
    const rx = Math.cos(P.yaw), rz = -Math.sin(P.yaw);
    P.camY += (P.y - P.camY) * Math.min(1, dt * (P.onGround ? 12 : 6));
    const fp = P.camD < 0.6;
    W.player.visible = !fp;
    let x, y, z;
    if (fp) { x = P.x + fx * 0.2; y = P.y + 1.62; z = P.z + fz * 0.2; }
    else {
      let d = P.camD; const sh = 0.55 * Math.min(1, d / 3);

      if (W.obst && d > 1) {
        const hy = P.camY + 1.6;
        for (const o of W.obst) {
          if (Math.abs(o.x - P.x) > d + o.r + 1 || Math.abs(o.z - P.z) > d + o.r + 1) continue;
          for (let i = 1; i <= 8; i++) {
            const u = d * i / 8, sx = P.x - fx * u + rx * sh * i / 8, sz = P.z - fz * u + rz * sh * i / 8, sy = hy - fy * u + 0.2;
            if (sy < o.top + 0.3 && Math.hypot(sx - o.x, sz - o.z) < o.r + 0.35) { d = Math.max(0.9, u - d / 8); break; }
          }
        }
      }

      if (P.camOcc == null || !isFinite(P.camOcc)) P.camOcc = d;
      else P.camOcc += (d - P.camOcc) * Math.min(1, dt * (d < P.camOcc ? 14 : 9));
      d = Math.min(P.camD, Math.max(0.9, P.camOcc));
      x = P.x - fx * d + rx * sh; y = P.camY + 1.6 - fy * d + 0.2; z = P.z - fz * d + rz * sh;
      const gy = hAt(x, z) + 0.35; if (y < gy) y = gy;
    }
    cam.position.set(x, y, z);
    cam.lookAt(x + fx, y + fy, z + fz);
  }
  function camDrone(dt) {
    const [ix, iz] = moveInput();
    const k = DR.dist * 0.9 * dt * (keys.ShiftLeft || keys.ShiftRight ? 2 : 1);
    const sy = Math.sin(DR.yaw), cy = Math.cos(DR.yaw);
    DR.x += (-sy * iz + cy * ix) * k; DR.z += (-cy * iz - sy * ix) * k;
    if (keys.KeyQ) DR.yaw += dt * 1.4; if (keys.KeyE) DR.yaw -= dt * 1.4;
    if (WK.goal && autoCamOk()) { const kf = Math.min(1, dt * 1.2); DR.x += (P.x - DR.x) * kf; DR.z += (P.z - DR.z) * kf; }
    DR.x = cl(DR.x, -40, MW + 40); DR.z = cl(DR.z, -40, MH + 40);
    DR.dist += (DR.distT - DR.dist) * Math.min(1, dt * 7);
    const ty = hAt(DR.x, DR.z), cp = Math.cos(DR.pitch);
    const x = DR.x + sy * cp * DR.dist, y = ty + Math.sin(DR.pitch) * DR.dist, z = DR.z + cy * cp * DR.dist;
    cam.position.set(x, Math.max(y, hAt(x, z) + 2), z);
    cam.lookAt(DR.x, ty, DR.z);
    W.player.visible = true;
  }

  function planDefaultDist() {
    const depth7 = 7 * TS * Math.sin(PLAN_PITCH) / (2 * Math.tan(PLAN_FOV * D2R / 2));
    return cl(Math.max(planDistFor(10), depth7), planDistFor(6), planDistFor(20));
  }
  function camPlan(dt) {
    const [ix, iz] = moveInput();
    if (ix || iz) PL.go = null;
    const k = PL.dist * 0.6 * dt * (keys.ShiftLeft || keys.ShiftRight ? 2 : 1);
    PL.yaw += (PL.yawT - PL.yaw) * Math.min(1, dt * 8);
    const sy = Math.sin(PL.yaw), cy = Math.cos(PL.yaw);
    PL.x += (-sy * iz + cy * ix) * k; PL.z += (-cy * iz - sy * ix) * k;
    if (PL.go && CF.on) PL.go = null;
    if (PL.go) { const kf = Math.min(1, dt * 5); PL.x += (PL.go.x - PL.x) * kf; PL.z += (PL.go.z - PL.z) * kf; if (Math.hypot(PL.go.x - PL.x, PL.go.z - PL.z) < 0.05) PL.go = null; }
    PL.x = cl(PL.x, -4, MW + 4); PL.z = cl(PL.z, -4, MH + 4);
    PL.dist += (PL.distT - PL.dist) * Math.min(1, dt * 7);
    const ty = 0, cp = Math.cos(PLAN_PITCH);
    cam.position.set(PL.x + sy * cp * PL.dist, ty + Math.sin(PLAN_PITCH) * PL.dist, PL.z + cy * cp * PL.dist);
    cam.lookAt(PL.x, ty, PL.z);
    W.player.visible = true;
  }


  const WKB = { x0: -EDGE + 1, z0: -EDGE + 1, x1: MW + EDGE - 1, z1: MH + EDGE - 1 }, WK_PAD = 0.5;
  function wkPlan() {
    WK.ref = W ? W.obst : null; WK.stuck = 0; WK.lastD = 1e9; WK.pi = 0;
    if (!W || !hasYol() || !WK.goal || typeof YOL.walkPlan !== 'function') { WK.w = null; return; }
    const pl = YOL.walkPlan(W.obst, P.x, P.z, WK.goal.x, WK.goal.z, { pad: WK_PAD, bounds: WKB });
    WK.goal = { x: pl.x, z: pl.z }; WK.w = { path: pl.path, pi: 0 }; WK.found = pl.found;
  }
  function walkTo(x, z) {
    if (!isFinite(x) || !isFinite(z)) return false;
    WK.goal = { x: cl(x, WKB.x0, WKB.x1), z: cl(z, WKB.z0, WKB.z1) }; WK.retry = 0; wkPlan();
    return true;
  }


  function computeAim() {
    if (!W) return;
    const plan = mode === 'plan';

    if (plan && ms.touchMode && !tapAim && PL.pin) { setAimTile(PL.pin.tx, PL.pin.ty); return; }
    const o = cam.position.clone();
    let nx = 0, ny = 0;
    if ((mode !== 'walk' || ms.dragLook || tapAim) && ms.has && !ms.locked) { nx = ms.nx; ny = ms.ny; }
    if (mode === 'walk' && !ms.dragLook && !tapAim) { nx = 0; ny = 0; }
    const d = new THREE.Vector3(nx, ny, 0.5).unproject(cam).sub(o).normalize();
    const walk = mode === 'walk' && !tapAim;
    const maxT = walk ? P.camD + REACH + 3 : 2500;
    let t = 0.3, prev = 0, hit = -1;
    while (t < maxT) {
      const x = o.x + d.x * t, y = o.y + d.y * t, z = o.z + d.z * t;
      if (y < hAt(x, z)) {
        let a = prev, b = t;
        for (let i = 0; i < 10; i++) { const m = (a + b) / 2; if (o.y + d.y * m < hAt(o.x + d.x * m, o.z + d.z * m)) b = m; else a = m; }
        hit = b; break;
      }
      prev = t; t += walk ? 0.25 : Math.max(0.4, t * 0.012);
    }
    let best = hit >= 0 ? hit : Infinity, kind = hit >= 0 ? 'tile' : 'none', bid = 0, rel = -1, btx = -1, bty = -1;
    const cylHit = (cx, cz, r, y0, h) => {
      const ox = o.x - cx, oz = o.z - cz, A = d.x * d.x + d.z * d.z, B = 2 * (ox * d.x + oz * d.z), Cc = ox * ox + oz * oz - r * r;
      const disc = B * B - 4 * A * Cc; if (disc < 0 || A < 1e-9) return Infinity;
      const sq = Math.sqrt(disc);
      for (const tt of [(-B - sq) / (2 * A), (-B + sq) / (2 * A)]) { if (tt <= 0) continue; const yy = o.y + d.y * tt; if (yy >= y0 - 0.2 && yy <= y0 + h) return tt; }
      if (Cc < 0) return Infinity;
      return Infinity;
    };
    for (const e of W.bmap.values()) {
      const tt = cylHit(e.x, e.z, Math.max(e.r, 1.2) * 0.9, e.y, Math.max(e.h, 1));
      if (tt < best) { best = tt; kind = 'building'; bid = e.id; btx = e.bx; bty = e.by; }
    }
    for (const r of W.relics) {
      const tt = cylHit(r.x, r.z, Math.max(r.r, 0.9), r.y, r.h);
      if (tt < best) { best = tt; kind = 'relic'; rel = r.idx; btx = r.tx; bty = r.ty; }
    }
    if (best === Infinity && plan) { best = d.y < -1e-3 ? (0 - o.y) / d.y : 300; kind = 'tile'; }
    aim.far = false;
    if (best === Infinity && !walk && d.y < -1e-3) { const tt = (0 - o.y) / d.y; aim.kind = 'none'; aim.tx = aim.ty = -1; aim.bid = 0; aim.relic = -1; aim.x = o.x + d.x * tt; aim.z = o.z + d.z * tt; aim.y = 0; aim.dist = tt; aim.far = isFinite(aim.x) && isFinite(aim.z); return; }
    if (best === Infinity) { aim.kind = 'none'; aim.tx = aim.ty = -1; aim.bid = 0; aim.relic = -1; aim.dist = 0; return; }
    const x = o.x + d.x * best, y = o.y + d.y * best, z = o.z + d.z * best;
    let tx = Math.floor(x / TS), ty = Math.floor(z / TS);
    if (kind === 'tile' && plan) { tx = cl(tx, 0, MAPW - 1); ty = cl(ty, 0, MAPH - 1); }
    if (kind === 'tile') {
      if (tx < 0 || ty < 0 || tx >= MAPW || ty >= MAPH) { kind = 'none'; if (!walk) aim.far = true; }
      else {
        const b = bAt(W.s, tx, ty);
        if (b) { kind = 'building'; bid = b.id; }
        else { const r = W.relics.find(q => q.tx === tx && q.ty === ty); if (r) { kind = 'relic'; rel = r.idx; } }
      }
    } else { tx = btx; ty = bty; }
    const dist = Math.hypot(x - P.x, y - (P.y + 1), z - P.z);
    if (walk && dist > REACH) kind = 'none';
    aim.kind = kind; aim.tx = kind === 'none' ? -1 : tx; aim.ty = kind === 'none' ? -1 : ty;
    aim.bid = kind === 'building' ? bid : 0; aim.relic = kind === 'relic' ? rel : -1;
    aim.dist = dist; aim.x = x; aim.y = y; aim.z = z;
    if (plan && tapAim && aim.tx >= 0) PL.pin = { tx: aim.tx, ty: aim.ty };
  }
  function setAimTile(tx, ty) {
    tx = cl(tx, 0, MAPW - 1); ty = cl(ty, 0, MAPH - 1);
    const b = bAt(W.s, tx, ty), r = b ? null : W.relics.find(q => q.tx === tx && q.ty === ty);
    aim.kind = b ? 'building' : r ? 'relic' : 'tile'; aim.tx = tx; aim.ty = ty; aim.bid = b ? b.id : 0; aim.relic = r ? r.idx : -1;
    aim.x = tc(tx); aim.z = tc(ty); aim.y = hAt(aim.x, aim.z); aim.dist = Math.hypot(aim.x - P.x, aim.z - P.z);
  }


  function setGhost(k) {
    if (!W) { ghostK = null; return; }
    if (W.ghost) { W.group.remove(W.ghost); W.ghost = null; }
    ghostK = k && BLD[k] ? k : null;
    if (!ghostK) return;
    const g = makeBuilding(ghostK);
    const st = g.userData && g.userData.sunTrack;
    if (st && W.sunDir) { g.updateMatrixWorld(true); const wp = new THREE.Vector3().setFromMatrixPosition(st.matrixWorld), sd = W.sunDir; st.lookAt(wp.x + sd.x * 6, wp.y + 10, wp.z + sd.z * 6); }
    g.traverse(o => { if (o.isMesh) { o.material = W.ghostMat; o.castShadow = false; o.receiveShadow = false; } if (o.isSprite) o.visible = false; });
    mergeInPlace(g, null);
    W.ghost = g; W.group.add(g);
  }
  function stepGhost(s) {
    const G = W.grid, U = W.fogU, plan = mode === 'plan';
    const okA = aim.kind !== 'none' && aim.tx >= 0;
    if (plan && okA && !SC.on) U.uHover.value.set(aim.tx * TS, aim.ty * TS, aim.tx * TS + TS, aim.ty * TS + TS); else U.uHover.value.set(-1, -1, -1, -1);
    if (plan && !ghostK) U.uHoverCol.value.setHex(0x8fd0ff);
    if (!ghostK || !W.ghost || SC.on) { W.ghost && (W.ghost.visible = false); G.mesh.visible = false; return; }
    W.ghost.visible = okA; G.mesh.visible = okA && !plan;
    if (!okA) return;
    const x = tc(aim.tx), z = tc(aim.ty), y = hAt(x, z);
    W.ghost.position.set(x, y + 0.03, z);
    const okB = canBuild(s, ghostK, aim.tx, aim.ty).ok;
    const col = okB ? 0x49e08a : 0xff4d4d;
    if (plan) U.uHoverCol.value.setHex(col);
    W.ghostMat.color.setHex(col); W.ghostMat.emissive.setHex(col);
    W.ghostMat.opacity = (plan ? 0.8 : 0.38) + (plan ? 0.06 : 0.08) * Math.sin(clockT * 5);
    setPatch(G, x, z, 28, aim.tx + ',' + aim.ty);
    const u = G.mesh.material.uniforms;
    u.uC.value.set(x, z); u.uR.value = 26; u.uTile.value.set(aim.tx * TS, aim.ty * TS, aim.tx * TS + TS, aim.ty * TS + TS);
    u.uCol.value.setHex(col); u.uMode.value = 0; u.uT.value = clockT;
  }
  function stepScan() {
    const F = W.scan;
    if (scanP == null) { F.beam.visible = F.cone.visible = F.cyl.visible = F.patch.mesh.visible = false; return; }
    const p = cl(scanP, 0, 1);
    const fx = -Math.sin(P.face), fz = -Math.cos(P.face);
    const hx = P.x + Math.cos(P.face) * 0.3 + Math.sin(P.face) * 0.35, hz = P.z - Math.sin(P.face) * 0.3 + Math.cos(P.face) * 0.35, hy = P.y + 1.15;
    let tx, ty, tz;
    if (aim.kind !== 'none') { tx = aim.x; ty = aim.y; tz = aim.z; }
    else { tx = P.x - fx * -6; tz = P.z - fz * -6; ty = hAt(tx, tz) + 0.3; }
    const a = new THREE.Vector3(hx, hy, hz), b = new THREE.Vector3(tx, ty, tz), L = a.distanceTo(b);
    for (const m of [F.beam, F.cone]) {
      m.visible = true; m.position.copy(a).add(b).multiplyScalar(0.5);
      m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    }
    F.beam.material.opacity = 0.55 + 0.25 * Math.sin(clockT * 31);
    F.cone.material.opacity = 0.12 + 0.05 * Math.sin(clockT * 17);
    let tgt = null;
    if (aim.kind === 'building') { const e = W.bmap.get(aim.bid); if (e) tgt = { x: e.x, y: e.y, z: e.z, r: Math.max(e.r, 1.2), h: e.h }; }
    else if (aim.kind === 'relic') { const r = W.relics.find(q => q.idx === aim.relic); if (r) tgt = { x: r.x, y: r.y, z: r.z, r: Math.max(r.r, 1), h: r.h }; }
    if (tgt) {
      F.cyl.visible = true; F.patch.mesh.visible = false;
      F.cyl.position.set(tgt.x, tgt.y + (tgt.h + 0.6) / 2 - 0.1, tgt.z); F.cyl.scale.set(tgt.r + 0.45, tgt.h + 0.6, tgt.r + 0.45);
      F.cyl.material.uniforms.uP.value = p; F.cyl.material.uniforms.uT.value = clockT;
    } else if (aim.kind === 'tile') {
      F.cyl.visible = false; F.patch.mesh.visible = true;
      const cx = tc(aim.tx), cz = tc(aim.ty);
      setPatch(F.patch, cx, cz, 6, aim.tx + ',' + aim.ty);
      const u = F.patch.mesh.material.uniforms; u.uC.value.set(cx, cz); u.uR.value = 5.2; u.uMode.value = 1; u.uP.value = p; u.uT.value = clockT;
      u.uTile.value.set(-1, -1, -1, -1);
    } else { F.cyl.visible = false; F.patch.mesh.visible = false; }
  }
  function makeScanFx() {
    const col = 0x6fe8ff;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 1, 6, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.03, 1, 16, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 40, 1, true), new THREE.ShaderMaterial({
      uniforms: { uP: { value: 0 }, uT: { value: 0 }, uCol: { value: new THREE.Color(col) } },
      vertexShader: `varying float vY; void main(){ vY = position.y + 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uP, uT; uniform vec3 uCol; varying float vY;
        void main(){ float band = 1.0 - smoothstep(0.0, 0.06, abs(vY - uP)); float ln = 0.5 + 0.5 * sin(vY * 70.0 - uT * 8.0);
          float a = band * 0.95 + ln * 0.07 * step(vY, uP) + 0.04; gl_FragColor = vec4(uCol * 1.2, a); }`,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    const pm = new THREE.Mesh(new THREE.BufferGeometry(), makePatchMat(true)); pm.renderOrder = 6;
    pm.material.uniforms.uCol.value.setHex(col);
    for (const m of [beam, cone, cyl, pm]) { m.visible = false; m.frustumCulled = false; W.group.add(m); }
    own(beam.geometry, beam.material, cone.geometry, cone.material, cyl.geometry, cyl.material, pm.material);
    return { beam, cone, cyl, patch: { mesh: pm, key: '' } };
  }



  function hintAtlas() {
    return canvasTex(1024, 128, (g) => {
      const cell = (i, f) => { g.save(); g.translate(i * 128 + 64, 64); f(); g.restore(); };
      const disc = (r, fill, ring) => { g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fillStyle = fill; g.fill(); g.lineWidth = 7; g.strokeStyle = ring; g.stroke(); };
      cell(0, () => {
        disc(54, 'rgba(10,14,22,.82)', '#ffd166');
        if (typeof drawGlyph === 'function') drawGlyph(g, 'star', 0, 2, 74, '#ffd166');
        else { g.fillStyle = '#ffd166'; g.font = '700 70px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('★', 0, 4); }
      });
      for (let n = 1; n <= 6; n++) cell(n, () => {
        disc(50, 'rgba(18,58,110,.88)', '#8fd0ff');
        g.setLineDash([10, 8]); g.lineWidth = 3; g.strokeStyle = 'rgba(200,232,255,.7)'; g.beginPath(); g.arc(0, 0, 38, 0, TAU); g.stroke(); g.setLineDash([]);
        g.fillStyle = '#ffffff'; g.font = '700 58px "Segoe UI", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 0, 4);
      });
    }, true);
  }
  function makeHints() {
    const m = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: hintAtlas() }, uT: { value: 0 }, uHide: { value: new THREE.Vector2(-1e4, -1e4) } },
      vertexShader: `attribute vec2 aCorner; attribute float aCell, aSize, aPulse; uniform float uT; uniform vec2 uHide; varying vec2 vUv; varying float vA;
        void main(){
          float s = aSize * (1.0 + aPulse * 0.14 * sin(uT * 4.0));
          vec3 rt = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]), up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
          vec3 p = position + (rt * aCorner.x + up * aCorner.y) * s * 0.5;
          vUv = vec2((aCell + (aCorner.x + 1.0) * 0.5) / 8.0, (aCorner.y + 1.0) * 0.5); vA = distance(position.xz, uHide) < 1.0 ? 0.28 : 1.0;
          gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); }`,
      fragmentShader: `uniform sampler2D uMap; varying vec2 vUv; varying float vA; void main(){ vec4 c = texture2D(uMap, vUv); c.a *= vA; if (c.a < 0.04) discard; gl_FragColor = c; }`,
      transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), m);
    mesh.frustumCulled = false; mesh.renderOrder = 60; mesh.visible = false;
    own(m, m.uniforms.uMap.value);
    return mesh;
  }
  function hintFree(tx, ty) {
    const s = W && W.s; if (!s) return true;
    if (tx < 0 || ty < 0 || tx >= MAPW || ty >= MAPH) return false;
    if (bAt(s, tx, ty)) return false;
    if (typeof isSeen === 'function') { try { if (!isSeen(s, tx, ty)) return false; } catch (e) {   } } else if (s.map && s.map.seen && s.map.seen[ty * MAPW + tx] !== 1) return false;
    const k = typeof UI !== 'undefined' && UI ? UI.placing : null;
    if (k && typeof canBuild === 'function') { try { const r = canBuild(s, k, tx, ty); if (r && !r.ok && r.why !== 'cost' && r.why !== 'core' && r.why !== 'egitim') return false; } catch (e) {   } }
    return true;
  }
  function setBuildHints(h) {
    if (!W) return;
    const M = W.hints, list = [];

    if (h && h.best && h.best.tx >= 0 && !hintFree(h.best.tx, h.best.ty)) h = Object.assign({}, h, { best: null });
    if (h && h.best && h.best.tx >= 0) list.push({ tx: h.best.tx, ty: h.best.ty, cell: 0, size: 6.2, pulse: 1 });
    if (h && Array.isArray(h.plan)) for (const p of h.plan) if (p && p.tx >= 0 && !(h.best && h.best.tx === p.tx && h.best.ty === p.ty)) list.push({ tx: p.tx, ty: p.ty, cell: cl(p.n | 0, 1, 6), size: 4.6, pulse: 0 });
    PL.hints = h || null;
    if (M.geometry) M.geometry.dispose();
    const n = list.length, pos = new Float32Array(n * 12), cor = new Float32Array(n * 8), cel = new Float32Array(n * 4), siz = new Float32Array(n * 4), pul = new Float32Array(n * 4), idx = [];
    const C4 = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    list.forEach((q, i) => {
      const x = tc(q.tx), z = tc(q.ty), y = hAt(x, z) + 0.4;
      for (let k = 0; k < 4; k++) { const j = i * 4 + k; pos.set([x, y, z], j * 3); cor.set(C4[k], j * 2); cel[j] = q.cell; siz[j] = q.size; pul[j] = q.pulse; }
      idx.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aCorner', new THREE.BufferAttribute(cor, 2));
    g.setAttribute('aCell', new THREE.BufferAttribute(cel, 1)); g.setAttribute('aSize', new THREE.BufferAttribute(siz, 1)); g.setAttribute('aPulse', new THREE.BufferAttribute(pul, 1));
    g.setIndex(idx);
    M.geometry = g; M.userData.n = n;
  }
  const KIND_SEL = { i: [1, 0x4fb8ff], m: [2, 0xff9a3c], t: [3, 0xb07cff] };
  function planTint(k) { if (!W) return; const v = KIND_SEL[k]; W.fogU.uKindSel.value = v ? v[0] : 0; if (v) W.fogU.uKindCol.value.setHex(v[1]); }



  function displayColor(c, exp, out) {
    const k = exp / 0.6, r = c.r * k, g = c.g * k, b = c.b * k;
    const f = v => (v * (v + 0.0245786) - 0.000090537) / (v * (0.983729 * v + 0.4329510) + 0.238081);
    const x = f(0.59719 * r + 0.35458 * g + 0.04823 * b), y = f(0.07600 * r + 0.90834 * g + 0.01566 * b), z = f(0.02840 * r + 0.13383 * g + 0.83777 * b);
    const e = v => { v = cl(v, 0, 1); return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; };
    return out.setRGB(e(1.60475 * x - 0.53108 * y - 0.07367 * z), e(-0.10208 * x + 1.10813 * y - 0.00605 * z), e(-0.00327 * x - 0.07276 * y + 1.07602 * z));
  }
  function stormAmt(s, t) {
    if (!s.storm) return 0;
    return smooth(0, 5, t - s.storm.from) * smooth(0, 5, s.storm.until - t);
  }
  function sunVec(s, t, bs, out) {
    if (W.moon) {
      const Pd = WORLDS.ay.night ? WORLDS.ay.night.period * 24 : 672;
      const az = Math.PI / 2 + TAU * (t - 7) / Pd;
      const el = lerp(-6.5, 13 + 3 * Math.sin(TAU * t / Pd * 2), bs) * D2R;
      out.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    } else {
      const h = ((t % 24) + 24) % 24, th = Math.PI * (h - 6) / 12, inc = 58 * D2R;
      out.set(Math.cos(th), Math.sin(th) * Math.sin(inc), Math.sin(th) * Math.cos(inc)).normalize();
    }
    return out;
  }
  function updateEnv(s, t) {
    const top = mode !== 'walk' && !SC.on && !SHOW.on;
    const bs = baseSun(s, t), sd = sunVec(s, t, bs, W.sunDir), sinEl = sd.y;
    const st = W.moon ? 0 : stormAmt(s, t);
    const fl = s.fx && s.fx.flareUntil && t < s.fx.flareUntil ? smooth(0, 1.5, s.fx.flareUntil - t) : 0;
    W.storm = st; W.flare = fl;
    const U = sky.material.uniforms;
    U.uSun.value.copy(sd); U.uFlare.value = fl; U.uTime.value = clockT;
    let exp = 1, dark = 0;
    if (W.moon) {
      const vis = smooth(-0.015, 0.05, sinEl);
      sunL.color.setRGB(1, 0.98, 0.95); sunL.intensity = 4.2 * vis;
      amb.color.setRGB(0.5, 0.62, 1.0); amb.intensity = 0.045 + (top ? 0.3 : 0.06) * (1 - vis);
      hemi.intensity = 0;
      earthL.intensity = 0.08 + 0.2 * (1 - vis);
      U.uHor.value.copy(C.sky); U.uZen.value.copy(C.sky).multiplyScalar(0.6);
      U.uGlow.value.setRGB(1, 0.97, 0.92); U.uGlowK.value = 0.3 * vis; U.uWide.value = 0.06; U.uDisc.value = 0.99993;
      U.uSunCol.value.setRGB(60, 58, 54).multiplyScalar(smooth(-0.03, 0.0, sinEl));
      const so = 0.5 + 0.5 * (1 - vis); starsA.material.opacity = so; starsB.material.opacity = so;
      exp = 1.0 + 0.35 * (1 - vis); dark = 1 - vis;
      scene.fog = null;

      const ed = W.earthDir, L = new THREE.Vector3().copy(sd).multiplyScalar(0.75).addScaledVector(ed, -0.65).normalize();
      L.lerp(ed.clone().negate(), 1 - vis).normalize();
      W.earthL = L;
      earth.visible = earthGlow.visible = true;
    } else {
      const day = smooth(-0.1, 0.25, sinEl), vis = smooth(-0.03, 0.08, sinEl);
      const dusk = smooth(-0.2, 0.02, sinEl) * (1 - smooth(0.04, 0.42, sinEl));
      const low = 1 - smooth(0.05, 0.45, sinEl);
      sunL.color.setRGB(1, lerp(0.9, 0.72, low), lerp(0.8, 0.52, low)); sunL.intensity = 3.2 * vis * (1 - 0.93 * st);
      amb.color.setRGB(0.5, 0.55, 0.75); amb.intensity = 0.05 + (top ? 0.35 : 0.03) * (1 - day);
      hemi.color.copy(C.nightSky).lerp(C.skyDay, day).lerp(C.stormCol, st * 0.6); hemi.groundColor.copy(C.ground); hemi.intensity = 0.14 + 0.8 * day * (1 - 0.55 * st);
      earthL.intensity = 0;
      const hor = C.nightHor.clone().lerp(C.skyDay, day).lerp(C.duskHor, dusk * 0.7);
      const zen = C.nightZen.clone().lerp(C.dayZen, day);
      const sc = C.stormCol.clone().multiplyScalar((0.25 + 0.75 * day) * 0.75);
      hor.lerp(sc, st * 0.92); zen.lerp(sc.clone().multiplyScalar(0.75), st * 0.92);
      U.uHor.value.copy(hor); U.uZen.value.copy(zen);
      U.uGlow.value.copy(C.blue); U.uWide.value = 0.8; U.uGlowK.value = (0.25 + 1.6 * dusk) * (1 - 0.85 * st) * smooth(-0.3, 0.0, sinEl); U.uDisc.value = 0.99996;
      U.uSunCol.value.setRGB(26, 25, 24).multiplyScalar(vis * (1 - 0.97 * st) + 0.0);
      const so = (1 - day) * (1 - st); starsA.material.opacity = so; starsB.material.opacity = so;
      if (!scene.fog) scene.fog = W.fog;
      exp = 1.0 + 0.6 * (1 - day); dark = cl(1 - day * (1 - 0.65 * st), 0, 1);
      displayColor(hor.clone().lerp(zen, 0.12), exp, W.fog.color);

      W.fog.density = 0.0009 + 0.0005 * (1 - day) + st * (top ? 0.75 / Math.max(mode === 'plan' ? PL.dist : DR.dist, 16) : 0.034);
      earth.visible = earthGlow.visible = false;
    }
    if (fl > 0) U.uHor.value.lerp(C.flare, fl * 0.04);
    R.toneMappingExposure = exp;
    W.dark = dark;

    const ext = mode === 'plan' ? cl(PL.dist * 0.8, 40, 150) : mode === 'drone' ? cl(DR.dist * 0.95, 40, 150) : 36;
    const c = mode === 'plan' ? new THREE.Vector3(PL.x, hAt(PL.x, PL.z), PL.z) : mode === 'drone' ? new THREE.Vector3(DR.x, hAt(DR.x, DR.z), DR.z) : new THREE.Vector3(P.x, P.y, P.z);
    const f = sd.clone(); if (f.y < 0.02) f.y = 0.02; f.normalize();
    const right = new THREE.Vector3(0, 1, 0).cross(f).normalize(), up = f.clone().cross(right);
    const tb = Math.max(ext * Math.max(f.y, 0.18), 10);
    const sc = sunL.shadow.camera;
    if (sc.right !== ext || sc.top !== tb) { sc.left = -ext; sc.right = ext; sc.top = tb; sc.bottom = -tb; sc.updateProjectionMatrix(); }
    const sz = sunL.shadow.mapSize.x, tu = 2 * ext / sz, tv = 2 * tb / sz;
    const u = Math.round(c.dot(right) / tu) * tu, v = Math.round(c.dot(up) / tv) * tv, w = c.dot(f);
    const cc = right.multiplyScalar(u).addScaledVector(up, v).addScaledVector(f, w);
    sunL.target.position.copy(cc); sunL.position.copy(cc).addScaledVector(f, 400);
    const liveSh = sunL.intensity > 0.02 && qual === 'high';
    if (W.frozen && liveSh) {

      const key = cc.x.toFixed(2) + ',' + cc.z.toFixed(2) + ',' + ext;
      R.shadowMap.autoUpdate = false;
      if (key !== W.shKey || W.shadowDirty) { R.shadowMap.needsUpdate = true; W.shKey = key; W.shadowDirty = false; }
      W.shadowCleared = false;
    } else {
      W.shKey = '';
      R.shadowMap.autoUpdate = liveSh;
      if (R.shadowMap.autoUpdate === false && qual === 'high' && !W.shadowCleared) { R.shadowMap.needsUpdate = true; W.shadowCleared = true; }
      if (R.shadowMap.autoUpdate) W.shadowCleared = false;
    }

    const dk = top ? Math.max(dark, 0.7 * st) : 0;
    droneL.intensity = (W.moon ? DRONE_FILL.moon : DRONE_FILL.mars) * dk;
    if (dk > 0) {
      const cv = cam.position.clone().sub(c); cv.y = Math.max(cv.y, cv.length() * 0.6); cv.normalize();
      droneL.target.position.copy(c); droneL.position.copy(c).addScaledVector(cv, 100);
    }
    ASTRO_FILL.value = W.moon ? 0.3 - 0.12 * dark : 0.16;

    hubL.intensity = 0.9 * smooth(0.2, 0.9, dark); hubL.position.set(tc(HUBX), hAt(tc(HUBX), tc(HUBY)) + 5.5, tc(HUBY) + 4.5);
    lamp.intensity = 2.0 * smooth(0.25, 0.8, dark);
    const lf = mode === 'walk' ? [-Math.sin(P.yaw), -Math.cos(P.yaw)] : [-Math.sin(P.face), -Math.cos(P.face)];
    lamp.position.set(P.x, P.y + 1.7, P.z); lamp.target.position.set(P.x + lf[0] * 10, P.y - 0.5 + (mode === 'walk' ? Math.sin(P.pitch) * 8 : 0), P.z + lf[1] * 10);
  }


  function init(cv) {
    if (ok) return true;
    canvas = cv;
    if (typeof THREE === 'undefined') return false;
    try {
      R = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch (e) { console.warn('WebGL yok', e); return false; }
    if (!R.getContext()) return false;
    R.outputEncoding = THREE.sRGBEncoding;
    R.toneMapping = THREE.ACESFilmicToneMapping;
    R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
    R.localClippingEnabled = true;
    R.setClearColor(0x000000, 1);
    scene = new THREE.Scene();
    cam = new THREE.PerspectiveCamera(62, 1, 0.12, 12000);
    Object.assign(C, {
      sky: lin(0x05060A), flare: lin(0xd040b0), blue: lin(0x6E8FB3).multiplyScalar(1.7),
      skyDay: lin(0xD9A57A), dayZen: lin(0xB07A55), duskHor: lin(0x6e5246), nightHor: lin(0x161321), nightZen: lin(0x040409), nightSky: lin(0x2a3550),
      stormCol: lin(0x8a5636), ground: lin(0x5a2a1c),
    });
    sunL = new THREE.DirectionalLight(0xffffff, 4);
    sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048);
    sunL.shadow.camera.near = 1; sunL.shadow.camera.far = 900; sunL.shadow.bias = -0.0004; sunL.shadow.normalBias = 0.05;
    amb = new THREE.AmbientLight(0xffffff, 0.05);
    hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 0);
    earthL = new THREE.DirectionalLight(0x6f95ff, 0.2);
    hubL = new THREE.PointLight(0xF2A33A, 0, 26, 2);
    lamp = new THREE.SpotLight(0xe6eeff, 0, 30, 0.42, 0.65, 1.5);
    shipL = new THREE.PointLight(0xffa050, 0, 60, 2);
    seraL = [0, 1].map(() => new THREE.PointLight(0xff4fd8, 0, 13, 2));
    droneL = new THREE.DirectionalLight(0xc4d2ff, 0);
    showRim = new THREE.DirectionalLight(0xcfe0ff, 0);
    scene.add(sunL, sunL.target, amb, hemi, earthL, hubL, lamp, lamp.target, shipL, droneL, droneL.target, showRim, showRim.target, ...seraL);
    sky = makeSky(); starsA = makeStars(3600, 1.3, 7, 0.45); starsB = makeStars(420, 2.4, 8, 0.25);
    earth = makeEarth();
    earthGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(120, 170, 255), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55, fog: false }));
    earthGlow.renderOrder = -8;
    [overlayV, overlayF] = makeOverlays();
    scene.add(sky, starsA, starsB, earth, earthGlow, overlayV, overlayF);
    bindInput();
    ok = true;
    resize();
    return true;
  }
  function load(s) {
    if (!ok) return;
    unload();
    W = { s, world: s.world, moon: s.world === 'ay', sd: (s.seed | 0) ^ 0x5bd1e995, sdRaw: s.seed, own: [], group: new THREE.Group(), bgroup: new THREE.Group(),
      bmap: new Map(), seraOn: [], deps: [], relics: [], obst: [], crew: [], pulses: [], ship: null, cable: null, netKey: '',
      sunDir: new THREE.Vector3(0, 1, 0), earthDir: new THREE.Vector3(0, Math.sin(7 * D2R), -Math.cos(7 * D2R)).normalize(),
      dt: 0, dark: 0, storm: 0, flare: 0, rand: prng((s.seed | 0) + 5) };
    W.feat = featOf(s);
    C.soil = lin(W.moon ? 0x8A8A86 : 0xB4553A); C.dust = lin(0xC97A4B); C.rock = lin(W.moon ? 0x9c9b96 : 0x7A3E2C);
    C.ice = lin(W.moon ? 0xB8C6D6 : 0xE6D8D2); C.ore = lin(W.moon ? 0x4E4943 : 0x4A322C);
    W.fog = new THREE.FogExp2(0xD9A57A, 0.001);
    scene.fog = W.moon ? null : W.fog;
    W.terrain = buildTerrain();
    W.group.add(W.terrain, W.bgroup);
    W.cableMat = new THREE.MeshStandardMaterial({ color: lin(0x2b2e34), roughness: 0.5, metalness: 0.2 });
    W.ghostMat = new THREE.MeshStandardMaterial({ color: 0x49e08a, emissive: 0x49e08a, emissiveIntensity: 0.6, transparent: true, opacity: 0.4, depthWrite: false });
    own(W.cableMat, W.ghostMat);
    { const t = glowTex(140, 225, 255); W.beaconMat = new THREE.SpriteMaterial({ map: t, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }); own(t, W.beaconMat); }
    W.warnMats = {};
    buildStatic(s);
    W.pebbles = buildPebbles(); W.group.add(W.pebbles);
    makeFogOverlay(s);
    W.grid = { mesh: new THREE.Mesh(new THREE.BufferGeometry(), makePatchMat(false)), key: '' };
    W.grid.mesh.renderOrder = 6; W.grid.mesh.frustumCulled = false; W.grid.mesh.visible = false; W.group.add(W.grid.mesh); own(W.grid.mesh.material);
    W.scan = makeScanFx();
    W.hints = makeHints(); W.group.add(W.hints); W.hints.userData.n = 0;
    W.dust = makeParts(700, W.moon ? 0xbdbab2 : 0xd09a72); W.group.add(W.dust.p);
    W.stormP = makeStorm(1800); W.stormP.m.uniforms.uCol.value.copy(new THREE.Color(W.moon ? 0xcccccc : 0xd8a070)); W.group.add(W.stormP.p);
    applyModelLook();
    W.player = makeAstro(LOOK.suit); W.group.add(W.player);
    W.rover = makeRover();

    earth.scale.setScalar(130); earth.position.copy(W.earthDir).multiplyScalar(4500);
    earthGlow.position.copy(earth.position); earthGlow.scale.setScalar(560);
    earthL.position.copy(W.earthDir).multiplyScalar(100); earthL.target.position.set(0, 0, 0);

    if (s.pl && isFinite(s.pl.x)) setPlayer(s.pl.x, s.pl.z, s.pl.yaw || 0);
    else setPlayer(tc(HUBX) + 3, tc(HUBY) + 13, 0.12);
    DR.x = tc(HUBX); DR.z = tc(HUBY) + (s.train ? 5 : 0); DR.yaw = 0.35; DR.dist = DR.distT = s.train ? 40 : 62; DR.pitch = 0.95;
    scene.add(W.group);
    rebuildObstacles(s); refreshDeposits(s);
    ghostK = null; scanP = null;
    SC.on = false; SC.obj = null; SC.done = null; WK.goal = null; PL.hints = null; PL.pin = null;
    DRV.on = false; DRV.spd = 0; DRV.goal = null;
    makeMarks();
    if (SHOW.on) { SHOW.on = false; SHOW.target = null; cam.clearViewOffset(); showLights(false); emit('showcase', null); }
    if (mode === 'plan') { mode = PL.prev === 'drone' ? 'drone' : 'walk'; emit('mode', mode); }
    applyQuality();
  }
  function unload() {
    if (!W) return;
    if (IN.on) introEnd();
    scene.remove(W.group);
    if (!hasModel()) W.group.traverse(o => { if (o.geometry && o.geometry.dispose) o.geometry.dispose(); });
    if (W.depMesh) W.depMesh.children.forEach(m => m.geometry.dispose());
    disposeAll(W.own);
    if (W.cable) W.cable.geometry.dispose();
    if (W.grid && W.grid.mesh.geometry) W.grid.mesh.geometry.dispose();
    if (W.scan && W.scan.patch.mesh.geometry) W.scan.patch.mesh.geometry.dispose();
    if (W.hints && W.hints.geometry) W.hints.geometry.dispose();
    W = null; scene.fog = null; SC.on = false; SC.obj = null; SC.done = null; DRV.on = false; DRV.goal = null; FL.list = null;
    if (SHOW.on) { SHOW.on = false; SHOW.target = null; cam.clearViewOffset(); showLights(false); if (SHOW.inPrev) setInput(true); emit('showcase', null); }
  }
  function resize() {
    if (!ok) return;
    const w = Math.max(1, canvas.clientWidth || canvas.width), h = Math.max(1, canvas.clientHeight || canvas.height);
    cw = w; ch = h;
    R.setPixelRatio(qual === 'high' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1);
    R.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix();
    pScale = R.getDrawingBufferSize(new THREE.Vector2()).y / (2 * Math.tan(cam.fov * D2R / 2));
  }
  function applyQuality() {
    if (!ok) return;
    const hi = qual === 'high';
    if (R.shadowMap.enabled !== hi) {
      R.shadowMap.enabled = hi;
      scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.needsUpdate = true; }); });
    }
    if (W && W.pebbles) W.pebbles.count = hi ? W.pebN : Math.floor(W.pebN * 0.4);
    resize();
  }
  function frame(s, dt, now, frac) {
    if (!ok || !s) return;
    if (!W || W.s !== s) {
      if (!W || W.world !== s.world || W.sdRaw !== s.seed) load(s);
      else { W.s = s; }
    }
    if (dt > 0.5) dt /= 1000;
    dt = cl(dt || 0.016, 0, 0.1);
    clockT += dt; W.dt = dt;
    if ((canvas.clientWidth && canvas.clientWidth !== cw) || (canvas.clientHeight && canvas.clientHeight !== ch)) resize();
    const t = s.t + cl(frac || 0, 0, 1);
    W.stillN = t === W.lastT ? (W.stillN || 0) + 1 : 0; W.lastT = t;
    updateEnv(s, t);
    syncBuildings(s);
    const top = mode !== 'walk' && !SC.on && !SHOW.on;

    if (mode === 'plan' && t === PL.frozenT) PL.frozenN++; else { PL.frozenN = 0; PL.frozenT = t; }
    W.frozen = mode === 'plan' && PL.frozenN > 3 && !SC.on;
    if (IN.on) introFrame(dt);
    else if (HOLD.on) { if (SC.on) SC.last = performance.now(); }
    else if (SC.on) {
      const rn = performance.now(), rdt = Math.min(1, Math.max(dt, SC.last != null ? (rn - SC.last) / 1000 : 0)); SC.last = rn; stepScene(rdt);
    }
    else {
      if (DRV.on) stepDrive(dt); else stepPlayer(s, dt);
      if (SHOW.on) camShow(dt); else if (mode === 'walk') { if (DRV.on) camDrive(dt); else camWalk(dt); } else if (mode === 'plan') camPlan(dt); else camDrone(dt);
      if (DRV.on) W.player.visible = false;
    }
    camBlend(dt);
    if (shake > 0) { shake = Math.max(0, shake - dt); const a = shake * 0.6; cam.position.x += (Math.random() - 0.5) * a; cam.position.y += (Math.random() - 0.5) * a; }
    cam.updateMatrixWorld();
    if (W.moon && W.earthL) earth.material.uniforms.uL.value.copy(W.earthL).transformDirection(cam.matrixWorldInverse);
    sky.position.copy(cam.position); starsA.position.copy(cam.position); starsB.position.copy(cam.position);
    if (W.moon) { earth.position.copy(W.earthDir).multiplyScalar(4500).add(cam.position); earthGlow.position.copy(earth.position); earth.rotation.y = clockT * 0.01; }
    if (!W.frozen && !SC.on) stepCrew(s, dt);
    stepRover(s, dt, W.frozen || W.stillN > 3);
    stepMarks(dt); stepFlash(dt); stepTeach(dt);
    stepShip(dt);
    stepParts(W.dust, dt);
    stepStorm(W.stormP, W.storm, dt);

    for (const r of W.relics) {
      const on = Math.sin(clockT * 3.2 + r.idx) > 0.55;
      if (r.blink) r.blink.emissiveIntensity = r.base * (on ? 1.3 : 0.06);
      if (r.halo) r.halo.opacity = on ? r.hbase : 0.03;
      const done = !!(s.scanned && s.scanned[r.ty * MAPW + r.tx]);
      r.beacon.visible = !done;
      if (!done) {
        const dc = cam.position.distanceTo(r.beacon.position), sc = cl(dc * 0.045, 1.4, 9), pu = 0.5 + 0.5 * Math.sin(clockT * 2.2 + r.idx * 2);
        r.beacon.scale.set(sc * (0.8 + 0.3 * pu), sc * (0.8 + 0.3 * pu), 1); r.beacon.material.opacity = 0.35 + 0.45 * pu;
      }
    }

    const fx = mode === 'plan' ? PL.x : mode === 'drone' ? DR.x : P.x, fz = mode === 'plan' ? PL.z : mode === 'drone' ? DR.z : P.z;
    W.seraOn.sort((a, b) => Math.hypot(a.x - fx, a.z - fz) - Math.hypot(b.x - fx, b.z - fz));
    seraL.forEach((L, i) => { const e = W.seraOn[i]; if (e) { L.position.set(e.x, e.y + 1.6, e.z); L.intensity = 0.35 + 1.3 * W.dark; } else L.intensity = 0; });
    for (let i = W.pulses.length - 1; i >= 0; i--) {
      const p = W.pulses[i]; p.t += dt; const u = p.t / 1.4;
      p.m.scale.setScalar(1 + u * p.r); p.m.material.opacity = 0.8 * (1 - u);
      if (u >= 1) { W.group.remove(p.m); p.m.geometry.dispose(); p.m.material.dispose(); W.pulses.splice(i, 1); }
    }
    if (pendingHit && s.fx && s.fx.hit) {
      pendingHit = false; const e = W.bmap.get(s.fx.hit.id);
      if (e) { burst(e.x, e.z, 50, W.moon ? 10 : 5, 3, 2.5, 0.7); pulseAt(e.x, e.z, 6); }
    }

    if (top) updateFog(s);
    W.fogU.uFogK.value = top ? (0.85 - 0.3 * W.dark) * (1 - 0.6 * W.storm) : 0;
    if (SC.on || SHOW.on) { aim.kind = 'none'; aim.tx = aim.ty = -1; } else computeAim();
    if (mode !== 'walk' && !SC.on && !SHOW.on) {
      const hk = aim.kind + ':' + aim.tx + ',' + aim.ty;
      if (hk !== PL.hover) { PL.hover = hk; emit('hover', Object.assign({}, aim)); }
    } else PL.hover = '';
    stepGhost(s);
    W.fogU.uPlanK.value = cl(W.fogU.uPlanK.value + (mode === 'plan' && !SC.on ? dt : -dt) * 4, 0, 1);
    W.fogU.uT.value = clockT;
    if (PL.hints && PL.hints.best && (W.hintChk = (W.hintChk || 0) + 1) % 15 === 0 && !hintFree(PL.hints.best.tx, PL.hints.best.ty)) setBuildHints(PL.hints);
    W.hints.visible = !!W.hints.userData.n && top;
    W.hints.material.uniforms.uT.value = clockT;
    { const gv = ghostK && W.ghost && W.ghost.visible; W.hints.material.uniforms.uHide.value.set(gv ? tc(aim.tx) : -1e4, gv ? tc(aim.ty) : -1e4); }
    stepScan();

    flashA = Math.max(0, flashA - dt * 1.8);
    const fu = overlayF.material.uniforms; fu.uCol.value.setRGB(flashCol[0], flashCol[1], flashCol[2]); fu.uA.value = flashA * flashA; fu.uTime.value = clockT;

    fu.uFlare.value = top ? W.flare * 0.45 : 0; fu.uEdge.value = 1;
    overlayF.visible = flashA > 0.001 || fu.uFlare.value > 0.001;
    const vu = overlayV.material.uniforms; vu.uK.value = 0.38 + 0.3 * W.storm; vu.uCol.value.setRGB(W.storm * 0.12, W.storm * 0.06, 0.0);
    R.render(scene, cam);
  }
  function flash(kind) {
    if (kind === 'meteor') { flashCol.splice(0, 3, 1, 0.75, 0.45); flashA = 0.65; shake = 0.55; pendingHit = true; }
    else if (kind === 'flare') { flashCol.splice(0, 3, 0.9, 0.25, 0.8); flashA = 0.6; }
    else { flashCol.splice(0, 3, 0.45, 1, 0.75); flashA = 0.4; }
  }

  function exitLock() { if (ms.locked && document.exitPointerLock) { ms.selfExit = true; document.exitPointerLock(); } }
  function startBlend(dur) { if (!ok) return; blend.t = 0; blend.dur = dur || 0.5; blend.p0 = cam.position.clone(); blend.q0 = cam.quaternion.clone(); blend.f0 = cam.fov; }
  function camBlend(dt) {
    const fT = IN.on ? IN.fov : SC.on ? 50 : SHOW.on ? SHOW_FOV : mode === 'plan' ? PLAN_FOV : WALK_FOV;
    let f = fT;
    if (blend.t < 1 && blend.p0) {
      blend.t = Math.min(1, blend.t + dt / blend.dur);
      const u = smooth(0, 1, blend.t), q = cam.quaternion.clone();
      cam.position.lerpVectors(blend.p0, cam.position, u);
      cam.quaternion.copy(blend.q0).slerp(q, u);
      f = lerp(blend.f0, fT, u);
    }
    if (Math.abs(cam.fov - f) > 1e-3) { cam.fov = f; cam.updateProjectionMatrix(); pScale = R.getDrawingBufferSize(new THREE.Vector2()).y / (2 * Math.tan(cam.fov * D2R / 2)); }
  }
  function setMode(m) {
    if (m !== 'walk' && m !== 'drone' && m !== 'plan') return;
    if (m === mode || SC.on) return;
    const prev = mode;
    startBlend(0.5);
    if (m === 'plan') {
      PL.prev = prev;

      const far = Math.hypot(P.x - tc(HUBX), P.z - tc(HUBY)) > 40;
      const fx = prev === 'drone' ? DR.x : far ? P.x : tc(HUBX), fz = prev === 'drone' ? DR.z : far ? P.z : tc(HUBY);
      PL.x = cl(fx, TS * 2, MW - TS * 2); PL.z = cl(fz, TS * 2, MH - TS * 2); PL.go = null; PL.pin = null;
      PL.yaw = PL.yawT = 0; PL.dist = PL.distT = planDefaultDist(); CF.focused = false;
      WK.goal = null; exitLock();
    } else if (m === 'drone') {
      if (prev === 'plan') { DR.x = PL.x; DR.z = PL.z; } else { DR.x = P.x; DR.z = P.z; DR.yaw = P.yaw; }
      exitLock();
    } else {
      if (prev === 'drone') P.yaw = DR.yaw;
      WK.goal = null;
    }
    mode = m;
    for (const k in keys) keys[k] = false;
    emit('mode', m);
  }
  function planFocus(tx, ty) {
    if (tx == null || !isFinite(tx)) return;
    const x = cl(tc(tx), -4, MW + 4), z = cl(tc(ty), -4, MH + 4);
    if (CF.on) { if (CF.focused || mode !== 'plan') return; CF.focused = true; PL.x = x; PL.z = z; PL.go = null; return; }
    PL.go = { x, z };
  }


  const SCENE_LEN = 13.5;
  function launchScene(onDone) {
    if (!W || SC.on) { if (onDone) setTimeout(onDone, 0); return 0; }
    if (SHOW.on) showcase(null);
    const s = W.s, hx = tc(HUBX), hz = tc(HUBY);

    const freeT = (x, y) => x >= 0 && y >= 0 && x < MAPW && y < MAPH && !bAt(s, x, y) && !'rcs'.includes(s.map.k[y * MAPW + x]);
    let spot = null, bestSc = -1e9;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const x = HUBX + dx, y = HUBY + dy, r = Math.hypot(dx, dy);
      if (r < 1.9 || !freeT(x, y)) continue;
      let room = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (freeT(x + i, y + j)) room++;
      const sc = room * 2 - r * 2.2;
      if (sc > bestSc) { bestSc = sc; spot = [x, y]; }
    }
    if (!spot) spot = [HUBX + 2, HUBY];
    const cx = tc(spot[0]), cz = tc(spot[1]), dl = Math.hypot(cx - hx, cz - hz) || 1, dir = [(cx - hx) / dl, (cz - hz) / dl], n = [-dir[1], dir[0]];

    const midP = [(hx + cx) / 2, (hz + cz) / 2], sd = W.sunDir, sl = Math.hypot(sd.x, sd.z) || 1;
    let camA = 0, camSc = -1e9; const camD = Math.max(14, dl * 0.8 + 6);
    for (let k = 0; k < 24; k++) {
      const a = k * TAU / 24, ux = Math.cos(a), uz = Math.sin(a), px = midP[0] + ux * camD, pz = midP[1] + uz * camD;
      let sc = (ux * sd.x + uz * sd.z) / sl * 3 - Math.abs(ux * dir[0] + uz * dir[1]) * 2.5;
      for (const o of W.obst) {
        for (const [qx, qz] of [midP, [cx, cz], [hx + dir[0] * 3.4, hz + dir[1] * 3.4], [(midP[0] + hx) / 2, (midP[1] + hz) / 2]]) {
          const vx = qx - px, vz = qz - pz, L2 = vx * vx + vz * vz, u = cl(((o.x - px) * vx + (o.z - pz) * vz) / L2, 0, 1);
          if (Math.hypot(px + vx * u - o.x, pz + vz * u - o.z) < o.r + 1.4) sc -= 3;
        }
      }
      if (sc > camSc) { camSc = sc; camA = a; }
    }
    const cap = tryModel(() => MODEL.capsule(), () => {
      const g = new THREE.Group(), white = fmat(0xe6e6e6), gold = fmat(0xc9a03a, { metalness: 0.7, roughness: 0.35 });
      const a = cyl(0.5, 1.1, 1.4, white, 16); a.position.y = 2.3; g.add(a); const b = cyl(1.05, 1.05, 1, gold, 16); b.position.y = 1.1; g.add(b);
      const hatch = new THREE.Group(); hatch.position.set(-0.3, 2.2, 0.85); const hp = box(0.6, 0.7, 0.06, fmat(0x9aa0a8)); hp.position.x = 0.3; hatch.add(hp); g.add(hatch);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.6, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffb060, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
      flame.rotation.x = Math.PI; flame.position.y = -1.1; flame.visible = false; g.add(flame);
      g.userData = { h: 3.4, r: 1.3, hatch, flame }; return g;
    });
    const cud = cap.userData || {};
    const gy = hAt(cx, cz);
    cap.position.set(cx, gy, cz); cap.rotation.y = Math.atan2(-dir[0], -dir[1]);
    cap.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    if (cud.flame) cud.flame.castShadow = false;
    if (cud.hatch) cud.hatch.rotation.y = -1.7;
    const cook = tryModel(() => MODEL.cookies(), () => { const g = new THREE.Group(); const c = cyl(0.22, 0.22, 0.16, fmat(0x2f5fa8), 14); c.position.y = 0.08; g.add(c); return g; });
    const actors = [1, 2, 3, 0].map(i => { const g = makeAstro(crewCol(i)); W.group.add(g); return g; });
    let hearts = [];
    if (typeof drawGlyph === 'function') {
      const t = canvasTex(64, 64, g => drawGlyph(g, 'heart', 32, 32, 56, '#ff7aa8'), true), m = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false });
      own(t, m);
      hearts = [0, 1, 2, 3].map(() => { const sp = new THREE.Sprite(m); sp.visible = false; sp.scale.set(0.7, 0.7, 1); W.group.add(sp); return sp; });
    }
    W.group.add(cap, cook);
    for (const c of W.crew) c.g.visible = false;
    if (W.ghost) W.ghost.visible = false;
    WK.goal = null; exitLock();
    const start = [hx + dir[0] * 3.4, hz + dir[1] * 3.4], front = [cx - dir[0] * 1.9, cz - dir[1] * 1.9];
    const mid = [(start[0] + cx) / 2, (start[1] + cz) / 2];
    SC.on = true; SC.t = 0; SC.last = null; SC.done = onDone || null; SC.fired = false;
    SC.obj = { cap, cud, cook, actors, hearts, cx, cz, gy, dir, n, start, front, mid, ph: 0, puff: 0, cu: [Math.cos(camA), Math.sin(camA)], camD };
    for (const k in keys) keys[k] = false;
    startBlend(0.9);
    emit('scene', 'start');
    return SCENE_LEN;
  }
  const HOLD = { on: false };
  function setHold(v) { HOLD.on = !!v; }
  function skipScene() { if (SC.on && !SC.fired) SC.t = Math.max(SC.t, SCENE_LEN); }
  function stepScene(dt) {
    const O = SC.obj, t = (SC.t += dt), [dx, dz] = O.dir, [nx, nz] = O.n, H = (x, z) => hAt(x, z);
    const travelYaw = Math.atan2(dx, dz);

    const p = smooth(0.6, 4.6, t), walking = t > 0.6 && t < 4.6;
    const cxp = lerp(O.start[0], O.front[0], p), czp = lerp(O.start[1], O.front[1], p);
    O.ph += walking ? dt * 7 : 0;
    const A = O.actors, sw = walking ? Math.sin(O.ph) * 0.5 : 0;
    const place = (g, x, z, yaw) => { g.position.set(x, H(x, z), z); g.rotation.y = yaw; };
    const back = smooth(5.9, 7.2, t) * 3.2;
    place(A[0], cxp + nx * 0.62 - dx * back, czp + nz * 0.62 - dz * back, t > 5.9 ? travelYaw : travelYaw);
    place(A[1], cxp - nx * 0.62 - dx * (0.5 + back), czp - nz * 0.62 - dz * (0.5 + back), travelYaw);
    place(A[2], cxp - nx * 1.9 - dx * (1.4 + back * 0.6), czp - nz * 1.9 - dz * (1.4 + back * 0.6), travelYaw + 0.35);
    place(A[3], O.start[0] + nx * 2.2 - dx * (0.6 + back * 0.4), O.start[1] + nz * 2.2 - dz * (0.6 + back * 0.4), travelYaw - 0.5);
    const wave = t > 6.4, wv = Math.sin(t * 9) * 0.45;
    for (let i = 0; i < 4; i++) {
      const u = A[i].userData; if (!u) continue;
      const carry = i < 2 && t < 5.2, mv = walking || (t > 5.9 && t < 7.2);
      if (u.legL) u.legL.rotation.x = mv ? Math.sin(O.ph + i) * 0.5 : 0;
      if (u.legR) u.legR.rotation.x = mv ? -Math.sin(O.ph + i) * 0.5 : 0;
      if (u.armL) u.armL.rotation.x = carry ? -2.85 : wave && i % 2 ? -2.6 + wv : -0.1;
      if (u.armR) u.armR.rotation.x = carry ? -2.85 : wave ? -2.7 - wv : (i === 2 && t < 4.9 ? -1.2 : 0.1);
    }
    if (t > 5.9) for (let i = 0; i < 4; i++) A[i].rotation.y = Math.atan2(O.cx - A[i].position.x, O.cz - A[i].position.z);

    const C = W.player, cu = C.userData || {};
    C.visible = t < 5.4; C.rotation.order = 'YXZ';
    const hatchP = [O.cx - dx * 0.95, O.gy + 2.2, O.cz - dz * 0.95];
    if (t < 4.6) {
      C.position.set(cxp - dx * 0.9, H(cxp, czp) + 1.95, czp - dz * 0.9);
      C.rotation.set(-Math.PI / 2, travelYaw + Math.PI, 0); C.scale.setScalar(1);
    } else {
      const u = smooth(4.6, 5.4, t);
      C.position.set(lerp(O.front[0] - dx * 0.9, hatchP[0], u), lerp(H(O.front[0], O.front[1]) + 1.95, hatchP[1], u), lerp(O.front[1] - dz * 0.9, hatchP[2], u));
      C.rotation.set(-Math.PI / 2, travelYaw + Math.PI, 0); C.scale.setScalar(lerp(1, 0.3, u));
    }
    if (cu.legL) cu.legL.rotation.x = Math.sin(t * 13) * 0.6; if (cu.legR) cu.legR.rotation.x = -Math.sin(t * 13) * 0.6;
    if (cu.armL) cu.armL.rotation.x = -1.4 + Math.sin(t * 10) * 0.7; if (cu.armR) cu.armR.rotation.x = -1.4 - Math.sin(t * 10) * 0.7;

    const hand = [A[2].position.x + Math.sin(A[2].rotation.y) * 0.4, A[2].position.y + 1.1, A[2].position.z + Math.cos(A[2].rotation.y) * 0.4];
    if (t < 4.9) { O.cook.visible = true; O.cook.position.set(hand[0], hand[1], hand[2]); }
    else if (t < 5.7) { const u = (t - 4.9) / 0.8; O.cook.position.set(lerp(hand[0], hatchP[0], u), lerp(hand[1], hatchP[1], u) + Math.sin(u * Math.PI) * 1.6, lerp(hand[2], hatchP[2], u)); O.cook.rotation.x += dt * 9; }
    else O.cook.visible = false;

    if (O.cud.hatch) O.cud.hatch.rotation.y = -1.7 * (1 - smooth(5.6, 6.1, t));
    const fl = O.cud.flame, lift = t > 9.2 ? 2.6 * (t - 9.2) * (t - 9.2) : 0, jit = t > 7.6 && t < 9.6 ? 0.035 : 0;
    O.cap.position.set(O.cx + (Math.random() - 0.5) * jit, O.gy + lift, O.cz + (Math.random() - 0.5) * jit);
    O.cap.rotation.z = lift > 0 ? Math.sin(t * 1.3) * 0.04 : 0;
    if (fl) { const on = t > 8.6; fl.visible = on; if (on) { const k = t > 9.2 ? 1 : 0.35, f = 0.85 + Math.random() * 0.3; fl.scale.set(f * k, k * (0.8 + Math.random() * 0.4), f * k); } }
    if (t > 8.6 && lift < 25 && (O.puff -= dt) <= 0) { O.puff = 0.06; burst(O.cx, O.cz, t > 9.2 ? 8 : 3, W.moon ? 12 : 6, W.moon ? 1.4 : 2.4, W.moon ? 2.2 : 3.4, W.moon ? 0.8 : 1.8); }
    if (t > 9.2 && t < 9.3) shake = Math.max(shake, 0.3);
    shipL.position.set(O.cx, O.gy + lift - 1, O.cz); shipL.intensity = t > 8.6 ? (t > 9.2 ? 6 : 2) : 0;

    O.hearts.forEach((h, i) => { const st = 6.6 + i * 0.7, u = (t - st) / 3; h.visible = u > 0 && u < 1; if (h.visible) { const a = A[i]; h.position.set(a.position.x, a.position.y + 2.2 + u * 3, a.position.z); h.material.opacity = 1 - u; } });

    const camX = O.mid[0] + O.cu[0] * O.camD, camZ = O.mid[1] + O.cu[1] * O.camD, camY = H(camX, camZ) + 4.6 + smooth(9.2, 12, t) * 2;
    cam.position.set(camX, camY, camZ);
    const lk = smooth(9.0, 10.4, t), ly = lerp(H(O.mid[0], O.mid[1]) + 1.7, O.gy + lift + 1.6, lk);
    cam.lookAt(lerp(O.mid[0], O.cx, 0.2 + lk * 0.6), Math.min(ly, camY + 60), lerp(O.mid[1], O.cz, 0.2 + lk * 0.6));
    if (t >= SCENE_LEN && !SC.fired) { SC.fired = true; emit('scene', 'end'); const f = SC.done; SC.done = null; if (f) try { f(); } catch (e) { console.error(e); } }
  }


  const IN = { on: false, t: 0, last: null, done: null, o: null, hold: false, fov: 50 };
  const IN_T1 = 1.2, IN_TD = 5.5, IN_T3 = 6.3, IN_END = 8.0, IN_PH = 2.2, IN_PX = 3.2, IN_X0 = 520;
  const IN_H0 = 120 / Math.pow(1 - IN_T1 / IN_TD, IN_PH);
  const IN_V1 = IN_H0 * IN_PH * Math.pow(1 - IN_T1 / IN_TD, IN_PH - 1) / IN_TD;
  const inTx = (tr, en) => { const o = L(tr, en); return (typeof LANG !== 'undefined' && o[LANG]) || o.tr; };
  const IN_CSS = `
.cine-root{position:fixed;inset:0;z-index:9000;pointer-events:none;font-family:inherit;color:#fff;--cine-bar:clamp(26px,9vh,84px)}
.cine-block{position:absolute;inset:0;pointer-events:auto;background:transparent}
.cine-bar{position:absolute;left:0;right:0;height:var(--cine-bar);background:#000;will-change:transform}
.cine-top{top:0;transform:translateY(-100%)}.cine-bot{bottom:0;transform:translateY(100%)}
.cine-fade{position:absolute;inset:0;background:#000;opacity:1}
.cine-gauge{position:absolute;left:max(16px,env(safe-area-inset-left));bottom:calc(var(--cine-bar) + 14px);min-width:168px;padding:10px 14px;border-radius:14px;
  background:var(--gl-fill-1,rgb(12 20 38 / .38));border:1px solid var(--gl-line,rgba(255,255,255,.16));-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);opacity:0;
  box-shadow:0 8px 24px rgb(0 0 0 / .35);font-variant-numeric:tabular-nums}
.cine-root,.cine-sub,.cine-row span{font-family:var(--f-body,'IBM Plex Sans','Segoe UI',system-ui,sans-serif)}
.cine-h,.cine-gk,.cine-row b,.cine-skip{font-family:var(--f-display,'Chakra Petch','Trebuchet MS','Segoe UI',system-ui,sans-serif);font-variant-numeric:tabular-nums}
.cine-gk{font-size:11px;font-weight:600;letter-spacing:.18em;opacity:.75;margin-bottom:4px}
.cine-row{display:flex;justify-content:space-between;gap:18px;font-size:15px;line-height:1.5}.cine-row span{opacity:.8}.cine-row b{font-weight:700}
.cine-title{position:absolute;left:16px;right:16px;top:calc(var(--cine-bar) + 6%);text-align:center;opacity:0;text-shadow:0 2px 6px #000,0 0 30px rgba(0,0,0,.9)}
.cine-h{font-size:clamp(30px,7vw,72px);font-weight:700;letter-spacing:.12em;line-height:1.05}
.cine-h::after{content:'';display:block;width:min(360px,60%);height:2px;margin:14px auto 0;border-radius:2px;background:linear-gradient(90deg,transparent,rgba(255,214,150,.95),transparent);box-shadow:0 0 14px rgba(255,190,110,.85)}
.cine-sub{margin-top:12px;font-size:clamp(14px,2.2vw,22px);letter-spacing:.04em;opacity:.95}
.cine-skip{position:absolute;right:max(16px,env(safe-area-inset-right));bottom:calc(var(--cine-bar) + 12px);min-width:88px;min-height:44px;padding:0 18px;border-radius:22px;
  font-size:16px;font-weight:600;color:#fff;text-shadow:0 1px 3px rgb(0 0 0 / .6);cursor:pointer;pointer-events:auto;opacity:0;visibility:hidden;
  background:var(--gl-fill-2,rgb(12 20 38 / .56));border:1px solid var(--gl-line,rgba(255,255,255,.22));-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.cine-skip:focus-visible{outline:2px solid #8fd3ff;outline-offset:2px}
#app.cine #hud{visibility:hidden}`;
  function inDom() {
    if (typeof document === 'undefined') return null;
    if (!document.getElementById('cine-style')) { const st = document.createElement('style'); st.id = 'cine-style'; st.textContent = IN_CSS; document.head.appendChild(st); }
    const r = document.createElement('div'); r.className = 'cine-root';
    r.innerHTML = '<div class="cine-block"></div><div class="cine-bar cine-top"></div><div class="cine-bar cine-bot"></div>' +
      '<div class="cine-gauge"><div class="cine-gk"></div><div class="cine-row"><span class="cine-l1"></span><b class="cine-alt"></b></div><div class="cine-row"><span class="cine-l2"></span><b class="cine-spd"></b></div></div>' +
      '<div class="cine-title"><div class="cine-h"></div><div class="cine-sub"></div></div><div class="cine-fade"></div><button type="button" class="cine-skip"></button>';
    const q = c => r.querySelector('.' + c);
    q('cine-gk').textContent = inTx('ALÇALMA', 'DESCENT'); q('cine-l1').textContent = inTx('Yükseklik', 'Altitude'); q('cine-l2').textContent = inTx('Hız', 'Speed');
    q('cine-h').textContent = inTx('İNİŞ TAMAM', 'TOUCHDOWN');
    q('cine-sub').textContent = W.moon ? inTx('Shackleton Krateri · Ay\'ın güney kutbu', 'Shackleton Crater · lunar south pole') : inTx('Arcadia Planitia · Mars', 'Arcadia Planitia · Mars');
    const sk = q('cine-skip'); sk.textContent = inTx('Geç ›', 'Skip ›'); sk.setAttribute('aria-label', inTx('Animasyonu geç', 'Skip animation'));
    const stop = e => { e.stopPropagation(); };
    for (const n of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'wheel', 'contextmenu', 'dblclick']) r.addEventListener(n, stop);
    r.addEventListener('click', e => { e.stopPropagation(); if (e.target === sk && IN.on) introSkip(); });
    (document.getElementById('app') || document.body).appendChild(r);
    return { r, top: q('cine-top'), bot: q('cine-bot'), fade: q('cine-fade'), gauge: q('cine-gauge'), alt: q('cine-alt'), spd: q('cine-spd'), title: q('cine-title'), skip: sk, cache: {} };
  }
  function inKey(e) {
    if (!IN.on) return;
    const k = e.key, skipK = k === 'Escape' || k === 'Enter' || k === ' ' || k === 'Spacebar';
    e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    if (!skipK) return;
    e.preventDefault();
    if (e.type === 'keydown' && !e.repeat && IN.t > 0.3) introSkip();
  }
  function inSet(el, key, prop, val, D) { if (D.cache[key] !== val) { D.cache[key] = val; el.style[prop] = val; } }
  function inUi(t) {
    const D = IN.o && IN.o.dom; if (!D) return;
    inSet(D.fade, 'f', 'opacity', (1 - smooth(0.05, 0.95, t)).toFixed(3), D);
    const b = smooth(0, 0.8, t) * (1 - smooth(6.5, 7.7, t));
    inSet(D.top, 'bt', 'transform', `translateY(${((b - 1) * 100).toFixed(2)}%)`, D);
    inSet(D.bot, 'bb', 'transform', `translateY(${((1 - b) * 100).toFixed(2)}%)`, D);
    inSet(D.gauge, 'g', 'opacity', (smooth(IN_T1, IN_T1 + 0.4, t) * (1 - smooth(5.9, 6.4, t))).toFixed(3), D);
    const O = IN.o, alt = O.alt, spd = t < IN_TD ? Math.min(12, 12 * O.vv / IN_V1) : 0;
    const at = (alt < 10 ? alt.toFixed(1) : String(Math.round(alt))) + ' m', st = spd.toFixed(1) + ' ' + inTx('m/sn', 'm/s');
    if (D.cache.a !== at) { D.cache.a = at; D.alt.textContent = at; }
    if (D.cache.s !== st) { D.cache.s = st; D.spd.textContent = st; }
    const ti = smooth(IN_TD + 0.1, IN_TD + 0.5, t) * (1 - smooth(7.2, 7.9, t));
    inSet(D.title, 'ti', 'opacity', ti.toFixed(3), D);
    inSet(D.title, 'ts', 'transform', `scale(${(1.08 - 0.08 * smooth(IN_TD + 0.1, IN_TD + 0.8, t)).toFixed(4)})`, D);
    const so = smooth(1.0, 1.25, t) * (1 - smooth(6.5, 7.7, t));
    inSet(D.skip, 'so', 'opacity', so.toFixed(3), D); inSet(D.skip, 'sv', 'visibility', so > 0.02 ? 'visible' : 'hidden', D);
    const on = t > 1; if (D.cache.sk !== on) { D.cache.sk = on; D.skip.classList.toggle('cine-on', on); }
  }
  function normalCam(dt) {
    if (SHOW.on) camShow(dt); else if (mode === 'walk') { if (DRV.on) camDrive(dt); else camWalk(dt); } else if (mode === 'plan') camPlan(dt); else camDrone(dt);
  }
  const normalFov = () => SHOW.on ? SHOW_FOV : mode === 'plan' ? PLAN_FOV : WALK_FOV;
  function inSnd(n) { if (IN.hold) return; try { if (typeof Snd !== 'undefined' && Snd && Snd.play) Snd.play(n); } catch (e) {   } }
  function intro(opts) {
    const onDone = opts && typeof opts.onDone === 'function' ? opts.onDone : null;
    if (!ok || !W || !W.s || IN.on || SC.on) return false;
    try {
      syncBuildings(W.s);
      const hb = W.s.b.find(b => b.k === 'hub'), e = hb && W.bmap.get(hb.id);
      if (!e || !e.obj) return false;
      if (SHOW.on) showcase(null);
      const hx = e.x, hz = e.z, gy = e.y, touchDev = typeof matchMedia === 'function' ? matchMedia('(pointer: coarse)').matches : (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);

      blend.t = 1; shake = 0;
      normalCam(0);
      const aEnd = Math.atan2(cam.position.z - hz, cam.position.x - hx);
      const sd = W.sunDir, sw = (Math.cos(aEnd - 1) * sd.x + Math.sin(aEnd - 1) * sd.z) >= (Math.cos(aEnd + 1) * sd.x + Math.sin(aEnd + 1) * sd.z) ? -2.0 : 2.0;
      const a0 = aEnd + sw, ad = [-Math.cos(a0 + 0.35), -Math.sin(a0 + 0.35)];
      const box = new THREE.Box3().setFromObject(e.obj), h = Math.max(2, box.max.y - gy);

      const coneGeo = (r, len) => { const g = new THREE.ConeGeometry(r, len, 18, 1, true); g.rotateX(Math.PI); g.translate(0, -len / 2, 0); return g; };
      const fm = (c, op) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false });
      const flame = new THREE.Group(), fIn = new THREE.Mesh(coneGeo(0.55, 1), fm(0xfff0c8, 0.95)), fOut = new THREE.Mesh(coneGeo(1.05, 1), fm(W.moon ? 0xffa050 : 0xff8a3a, 0.5));
      flame.add(fOut, fIn); fIn.renderOrder = fOut.renderOrder = 7;
      const gTex = glowTex(255, 196, 130), gMat = new THREE.SpriteMaterial({ map: gTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false, toneMapped: false });
      const glow = new THREE.Sprite(gMat); glow.renderOrder = 8;
      const nOwn = W.own.length, dust = makeParts(touchDev ? 132 : 376, W.moon ? 0xc4c1b8 : 0xd09468), sparks = makeParts(touchDev ? 18 : 24, 0xffc070); W.own.length = nOwn;
      sparks.m.blending = THREE.AdditiveBlending;
      const spot = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: gTex, color: 0xffb070, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      spot.rotation.x = -Math.PI / 2; spot.renderOrder = 6; spot.position.set(hx, gy + 0.12, hz);
      W.group.add(flame, glow, dust.p, sparks.p, spot);
      const hid = [];
      const hide = o => { if (o && o.visible) { o.visible = false; hid.push(o); } };
      hide(W.player); for (const c of W.crew) hide(c.g); hide(e.shieldObj); if (W.ghost) W.ghost.visible = false;
      const O = { e, hx, hz, gy, h, aEnd, sw, ad, flame, fIn, fOut, glow, gTex, gMat, dust, sparks, spot, hid, touch: touchDev, pos0: e.obj.position.clone(), q0: e.obj.quaternion.clone(),
        alt: IN_H0, vv: IN_V1, burst: false, snd: 0, acc: 0, useL: !W.ship, pi: new THREE.Vector3(), qi: new THREE.Quaternion(), dom: null, wd: null, vis: 0, wl: performance.now() };
      IN.o = O; IN.on = true; IN.t = 0; IN.last = null; IN.done = onDone; IN.hold = false; IN.fov = 50;
      SC.on = true; WK.goal = null; exitLock();
      for (const k in keys) keys[k] = false;
      O.dom = inDom();
      window.addEventListener('keydown', inKey, true); window.addEventListener('keyup', inKey, true);
      const app = document.getElementById('app'); if (app) app.classList.add('cine');
      O.wd = setInterval(() => {
        const n = performance.now(); if (!document.hidden) O.vis += n - O.wl; O.wl = n;
        if (IN.on && IN.o === O && O.vis > 12000) introEnd();
      }, 250);
      inStep(0);
      try { R.compile(scene, cam); } catch (er) {   }
      emit('intro', 'start');
      return true;
    } catch (err) {
      console.error(err);
      if (IN.on) { IN.done = null; introEnd(); }
      return false;
    }
  }
  let _v1, _v2, _v3, _up, _q1, _q2;
  function inStep(dt) {
    const O = IN.o, e = O.e;
    if (!_up) { _v1 = new THREE.Vector3(); _v2 = new THREE.Vector3(); _v3 = new THREE.Vector3(); _up = new THREE.Vector3(0, 1, 0); _q1 = new THREE.Quaternion(); _q2 = new THREE.Quaternion(); }
    if (!IN.hold) IN.t += dt;
    const t = IN.t, k = cl(1 - t / IN_TD, 0, 1), r = Math.random;

    const alt = IN_H0 * Math.pow(k, IN_PH), off = IN_X0 * Math.pow(k, IN_PX);
    O.alt = alt; O.vv = t < IN_TD ? IN_H0 * IN_PH * Math.pow(k, IN_PH - 1) / IN_TD : 0;
    const q = t - IN_TD, bounce = q > 0 ? -0.22 * Math.exp(-5 * q) * Math.sin(q * 15) : 0;
    const lx = O.hx + O.ad[0] * off, lz = O.hz + O.ad[1] * off, ly = O.gy + alt + bounce;
    e.obj.position.set(lx, ly, lz);
    const vh = t < IN_TD ? IN_X0 * IN_PX * Math.pow(k, IN_PX - 1) / IN_TD : 0, tilt = Math.min(0.22, vh * 0.0035);
    _v1.set(O.ad[0] * Math.sin(tilt), Math.cos(tilt), O.ad[1] * Math.sin(tilt));
    e.obj.quaternion.setFromUnitVectors(_up, _v1).multiply(O.q0).multiply(_q1.setFromAxisAngle(_up, 0.7 * k * k));

    const thr = t < IN_TD ? 0.72 + 0.28 * smooth(3.2, 5.0, t) : Math.max(0, 1 - q / 0.14);
    const fl = 0.5 + 0.5 * Math.sin(t * 53) * Math.sin(t * 31 + 1.3) + (IN.hold ? 0 : (r() - 0.5) * 0.25);
    const nzY = ly + 0.45;
    O.flame.visible = thr > 0.01;
    O.flame.position.set(lx, nzY, lz); O.flame.quaternion.copy(e.obj.quaternion);
    const len = (3.0 + 3.2 * thr) * (0.88 + 0.24 * fl) * Math.max(0.15, thr);
    O.fIn.scale.set(0.9 + 0.15 * fl, len * 0.62, 0.9 + 0.15 * fl); O.fOut.scale.set(1 + 0.2 * fl, len, 1 + 0.2 * fl);
    O.fIn.material.opacity = 0.95 * thr; O.fOut.material.opacity = (0.42 + 0.12 * fl) * thr;
    const dc = cam.position.distanceTo(O.flame.position);
    O.glow.position.set(lx, nzY - 0.5, lz);
    const gs = Math.max((2.6 + 2.2 * thr) * (0.9 + 0.2 * fl), dc * 0.032 * (1 - smooth(1.0, 2.6, t) * 0.6));
    O.glow.scale.set(gs, gs, 1); O.glow.material.opacity = Math.min(1, thr * 1.2);
    O.glow.visible = thr > 0.01;
    if (O.useL) { shipL.position.set(lx, nzY - 1.2, lz); shipL.intensity = thr * (5 + 2.5 * fl) + (q > 0 ? 6 * Math.exp(-q * 9) : 0); }

    const D = O.dust, rate = alt < 22 && t < IN_TD ? (O.touch ? 60 : 150) * Math.pow(1 - alt / 22, 1.3) : 0;
    const emitN = (n, sp, burst) => {
      for (let i = 0; i < n; i++) {
        const a = r() * TAU, rr = 1.2 + r() * 2.2, v = sp * (0.55 + 0.6 * r());
        const x = O.hx + Math.cos(a) * rr, z = O.hz + Math.sin(a) * rr;
        if (W.moon) emit1(D, x, O.gy + 0.15, z, Math.cos(a) * v, 0.15 + r() * (burst ? 1.4 : 0.8), Math.sin(a) * v, 1.4 + r() * 1.2, 0.7 + r() * 0.9);
        else emit1(D, x, O.gy + 0.25, z, Math.cos(a) * v, 0.5 + r() * (burst ? 2.6 : 1.6), Math.sin(a) * v, 2.2 + r() * 1.4, 0.9 + r() * 1.0);
      }
    };
    if (!IN.hold && dt > 0) {
      O.acc += rate * dt; const n = Math.floor(O.acc); O.acc -= n;
      if (n) emitN(n, W.moon ? 13 : 7, false);
      if (q >= 0 && !O.burst) { O.burst = true; emitN(O.touch ? 60 : 140, W.moon ? 16 : 9, true); }
      const drag = W.moon ? 0 : 1.25;
      for (let i = 0; i < D.N; i++) {
        if (D.life[i] <= 0) { D.al[i] = 0; continue; }
        D.life[i] -= dt;
        const j = i * 3, f = Math.max(0, 1 - drag * dt);
        D.vel[j] *= f; D.vel[j + 2] *= f;
        D.vel[j + 1] = W.moon ? D.vel[j + 1] - GRAV.ay * dt : D.vel[j + 1] * f + 0.3 * dt;
        D.pos[j] += D.vel[j] * dt; D.pos[j + 1] += D.vel[j + 1] * dt; D.pos[j + 2] += D.vel[j + 2] * dt;
        const g = hAt(D.pos[j], D.pos[j + 2]) + 0.05;
        if (D.pos[j + 1] < g) { D.pos[j + 1] = g; D.vel[j + 1] = 0; D.vel[j] *= 0.55; D.vel[j + 2] *= 0.55; }
        const u = Math.max(0, D.life[i] / D.max[i]);
        D.al[i] = Math.min(1, u * 2.2) * Math.min(1, (D.max[i] - D.life[i]) * 8) * (W.moon ? 0.7 : 0.55);
        D.sz[i] = D.base[i] * (1 + (1 - u) * (W.moon ? 0.5 : 2.6));
      }
      D.g.attributes.position.needsUpdate = D.g.attributes.aSize.needsUpdate = D.g.attributes.aAlpha.needsUpdate = true;
    }
    D.m.uniforms.uScale.value = pScale;

    const near = 1 - cl(alt / 70, 0, 1), sr = 3 + 11 * near;
    O.spot.scale.set(sr, sr, 1); O.spot.material.opacity = Math.min(1, thr * near * near * 1.15 * (0.9 + 0.1 * fl));
    O.spot.visible = O.spot.material.opacity > 0.01;

    const SP = O.sparks, tipY = nzY - len;
    if (!IN.hold && dt > 0) {
      O.sacc = (O.sacc || 0) + (thr > 0.3 ? 40 * thr : 0) * dt; const ns = Math.floor(O.sacc); O.sacc -= ns;
      for (let i = 0; i < ns; i++) emit1(SP, lx + (r() - 0.5) * 0.6, tipY, lz + (r() - 0.5) * 0.6, (r() - 0.5) * 6, -9 - r() * 8, (r() - 0.5) * 6, 0.25 + r() * 0.3, 0.18 + r() * 0.16);
      for (let i = 0; i < SP.N; i++) {
        if (SP.life[i] <= 0) { SP.al[i] = 0; continue; }
        SP.life[i] -= dt; const j = i * 3;
        SP.pos[j] += SP.vel[j] * dt; SP.pos[j + 1] += SP.vel[j + 1] * dt; SP.pos[j + 2] += SP.vel[j + 2] * dt;
        const g = hAt(SP.pos[j], SP.pos[j + 2]) + 0.05; if (SP.pos[j + 1] < g) { SP.pos[j + 1] = g; SP.vel[j + 1] = 0; }
        SP.al[i] = Math.max(0, SP.life[i] / SP.max[i]); SP.sz[i] = SP.base[i];
      }
      SP.g.attributes.position.needsUpdate = SP.g.attributes.aSize.needsUpdate = SP.g.attributes.aAlpha.needsUpdate = true;
    }
    SP.m.uniforms.uScale.value = pScale;

    const ang = O.aEnd + O.sw * (1 - smooth(0, 6.8, t)), rad = lerp(22, 16, smooth(0, 6, t)), ch2 = lerp(1.7, 4.8, smooth(0.5, 6, t));
    const cx = O.hx + Math.cos(ang) * rad, cz = O.hz + Math.sin(ang) * rad, cy = Math.max(hAt(cx, cz) + ch2, O.gy + 1.2);
    const amp = t < IN_T1 ? 0.012 : t < IN_TD ? 0.015 + 0.1 * Math.pow(smooth(IN_T1, IN_TD, t), 2) : 0.26 * Math.exp(-q * 7);
    const sx = Math.sin(t * 41) * 0.6 + Math.sin(t * 67 + 2) * 0.4, sy = Math.sin(t * 47 + 1) * 0.6 + Math.sin(t * 73) * 0.4;
    cam.position.set(cx + sx * amp, cy + sy * amp, cz);

    _v3.set(lx - cx, ly + O.h * 0.5 - cy, lz - cz);
    const dL = Math.max(1, _v3.length()), fovZ = cl(2 * Math.atan(O.h / (0.42 * dL)) / D2R, 12, 50), fovC = lerp(50, fovZ, smooth(IN_T1, 2.2, t));
    _v2.set(O.hx - cx, O.gy + 1.6 - cy, O.hz - cz).normalize(); _v3.normalize();
    const th = Math.max(1e-3, Math.acos(cl(_v2.dot(_v3), -1, 1)));
    const wG = lerp(0.45, Math.min(0.45, 0.32 * fovC * D2R / th), smooth(IN_T1, 2.2, t));
    _v2.multiplyScalar(wG); _v3.multiplyScalar(1 - wG);
    _v2.add(_v3).normalize();
    cam.lookAt(cam.position.x + _v2.x, cam.position.y + _v2.y, cam.position.z + _v2.z);
    IN.fov = fovC;
    const u = smooth(IN_T3, IN_END, t);
    if (u > 0) {
      O.pi.copy(cam.position); O.qi.copy(cam.quaternion);
      normalCam(Math.max(dt, 1e-4));
      _q2.copy(cam.quaternion);
      cam.position.lerpVectors(O.pi, cam.position, u);
      cam.quaternion.copy(O.qi).slerp(_q2, u);
      IN.fov = lerp(fovC, normalFov(), u);
      if (t < 6.9) W.player.visible = false;
    }
    if (W.ghost) W.ghost.visible = false;

    if (O.snd === 0 && t >= IN_T1 - 0.1) { O.snd = 1; inSnd('ship'); }
    else if (O.snd === 1 && t >= 2.7) { O.snd = 2; inSnd('ship'); }
    else if (O.snd === 2 && t >= 4.1) { O.snd = 3; inSnd('ship'); }
    else if (O.snd === 3 && q >= 0) { O.snd = 4; inSnd('place'); }
    else if (O.snd === 4 && q >= 0.25) { O.snd = 5; inSnd('done'); }
    inUi(t);
    if (t >= IN_END) introEnd();
  }
  function introEnd() {
    if (!IN.on) return;
    const O = IN.o, f = IN.done;
    IN.on = false; IN.done = null; IN.o = null; IN.hold = false;
    try {
      if (O.wd) clearInterval(O.wd);
      window.removeEventListener('keydown', inKey, true); window.removeEventListener('keyup', inKey, true);
      if (O.dom && O.dom.r.parentNode) O.dom.r.parentNode.removeChild(O.dom.r);
      const app = document.getElementById('app'); if (app) app.classList.remove('cine');
    } catch (e) { console.error(e); }
    try {
      if (O.e.obj) { O.e.obj.position.copy(O.pos0); O.e.obj.quaternion.copy(O.q0); }
      for (const o of O.hid) o.visible = true;
      if (W) W.group.remove(O.flame, O.glow, O.dust.p, O.sparks.p, O.spot);
      O.sparks.g.dispose(); O.sparks.m.dispose(); O.spot.geometry.dispose(); O.spot.material.dispose();
      if (O.useL) shipL.intensity = 0;
      for (const m of [O.fIn, O.fOut]) { m.geometry.dispose(); m.material.dispose(); }
      O.gTex.dispose(); O.gMat.dispose(); O.dust.g.dispose(); O.dust.m.dispose();
    } catch (e) { console.error(e); }
    try {
      SC.on = false; blend.t = 1; shake = 0;
      for (const k in keys) keys[k] = false;
      if (W) {
        normalCam(1 / 60);
        const fv = normalFov(); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); pScale = R.getDrawingBufferSize(new THREE.Vector2()).y / (2 * Math.tan(cam.fov * D2R / 2)); }
        cam.updateMatrixWorld();
      }
    } catch (e) { console.error(e); }
    emit('intro', 'end');
    if (f) try { f(); } catch (e) { console.error(e); }
  }
  function introSkip() { if (IN.on) introEnd(); return true; }
  function introFrame(dt) {
    const n = performance.now();
    let rdt = IN.last != null ? (n - IN.last) / 1000 : dt; IN.last = n;
    rdt = (HOLD.on || (typeof document !== 'undefined' && document.hidden)) ? 0 : Math.min(0.1, Math.max(0, rdt));
    try { inStep(rdt); } catch (e) { console.error(e); introEnd(); }
  }
  function introSeek(t) {
    if (typeof location === 'undefined' || location.hash !== '#test' || !IN.on) return false;
    if (t == null) { IN.hold = false; IN.last = null; return true; }
    IN.hold = false;
    try { while (IN.on && IN.t < t - 1e-6) inStep(Math.min(1 / 30, t - IN.t)); } catch (e) { console.error(e); introEnd(); }
    if (IN.on) IN.hold = true;
    return IN.on;
  }
  function setPlayer(x, z, yaw) {
    P.x = x; P.z = z; P.y = P.camY = hAt(x, z); P.vx = P.vz = P.vy = 0; P.onGround = true;
    if (yaw != null && isFinite(yaw)) { P.yaw = yaw; P.face = yaw + Math.PI; }
  }
  function setInput(en) {
    inputOn = !!en;
    if (!inputOn) {
      for (const k in keys) keys[k] = false;
      ms.down = -1; touch.stick = touch.look = touch.look2 = null; if (stickEl) stickUI(false);
      exitLock();
    }
  }
  function project(x, y, z) {
    if (!ok) return { sx: 0, sy: 0, behind: true, dist: 0 };
    const v = new THREE.Vector3(x, y, z), dist = v.distanceTo(cam.position);
    const cs = v.clone().applyMatrix4(cam.matrixWorldInverse), behind = cs.z > 0;
    v.project(cam);
    let sx = (v.x * 0.5 + 0.5) * cw, sy = (-v.y * 0.5 + 0.5) * ch;
    if (behind) { sx = cw - sx; sy = ch - sy; }
    return { sx, sy, behind, dist };
  }


  const TFX = { on: false, t: 0, len: 2.4, a: null, b: null, beam: false, n: 24 };
  const TFX_COL = { guc: 0xffd84a, su: 0x4aa8ff, hava: 0xffffff, yemek: 0x5fe08a };
  const TFX_IN = { batarya: 1 };


  const TFX_ICO = { guc: ['bolt', '#ffd84a'], su: ['drop', '#3d9bff'], hava: ['o2', '#a9e4ff'], yemek: ['apple', '#5fe08a'], ev: ['bed', '#f2f5fa'], diger: ['parts', '#ff9f43'] };
  function tfxIconMat(grp) {
    W.tfxMats = W.tfxMats || {};
    if (W.tfxMats[grp]) return W.tfxMats[grp];
    const G = TFX_ICO[grp] || TFX_ICO.diger;
    const t = canvasTex(128, 128, (x) => {
      x.beginPath(); x.arc(64, 64, 58, 0, TAU); x.fillStyle = 'rgba(8,11,18,0.9)'; x.fill();
      x.beginPath(); x.arc(64, 64, 50, 0, TAU); x.fillStyle = G[1]; x.fill();
      if (typeof drawGlyph !== 'function' || !drawGlyph(x, G[0], 64, 66, 70, '#10131a')) { x.fillStyle = '#10131a'; x.font = '700 64px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('★', 64, 68); }
    }, true);
    const m = new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false, fog: false, sizeAttenuation: false });
    own(t, m); W.tfxMats[grp] = m; return m;
  }
  function tfxGlowMat() {
    if (W.tfxGlow) return W.tfxGlow;
    const t = canvasTex(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }, true);
    W.tfxGlow = new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false, fog: false, sizeAttenuation: false, blending: THREE.AdditiveBlending });
    own(t, W.tfxGlow); return W.tfxGlow;
  }
  function teachFx(bid, k) {
    if (!ok || !W || SC.on) return false;
    const e = W.bmap.get(bid) || (k ? [...W.bmap.values()].find(q => q.k === k && q.stage === 'r') : null);
    if (!e) return false;
    const pr = project(e.x, e.y + e.h * 0.5, e.z);
    if (pr.behind || pr.sx < 0 || pr.sy < 0 || pr.sx > cw || pr.sy > ch) return false;
    const kk = k || e.k, grp = (typeof BLD !== 'undefined' && BLD[kk] && BLD[kk].group) || '';
    const col = TFX_COL[grp] != null ? TFX_COL[grp] : 0x9fe8ff;
    if (!W.tfx) {
      const N = TFX.n, g = new THREE.BufferGeometry(), pos = new Float32Array(N * 3);
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
      const m = new THREE.PointsMaterial({ size: 9, sizeAttenuation: false, color: 0xffffff, transparent: true, depthWrite: false, depthTest: false, fog: false, blending: THREE.AdditiveBlending });
      const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 60;
      const bg = new THREE.CylinderGeometry(0.35, 1.4, 1, 12, 1, true); bg.translate(0, 0.5, 0);
      const bm = new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
      const beam = new THREE.Mesh(bg, bm); beam.renderOrder = 59;
      pts.visible = beam.visible = false;
      own(g, m, bg, bm); W.group.add(pts, beam);
      W.tfx = { pts, pos, beam };
    }
    const hx = tc(HUBX), hz = tc(HUBY), isHub = kk === 'hub';
    const a = { x: e.x, y: e.y + Math.max(0.6, e.h * 0.6), z: e.z }, b = { x: hx, y: hAt(hx, hz) + 2, z: hz };
    if (isHub) { b.x = a.x + 6; b.z = a.z + 6; b.y = hAt(b.x, b.z) + 1; }
    TFX.a = TFX_IN[kk] ? b : a; TFX.b = TFX_IN[kk] ? a : b;
    TFX.beam = kk === 'gunes'; TFX.on = true; TFX.t = 0; TFX.e = e;
    if (!W.tfxIco) { W.tfxIco = new THREE.Sprite(tfxIconMat(grp || 'diger')); W.tfxIco.center.set(0.5, 0.5); W.tfxIco.renderOrder = 62; W.tfxHalo = new THREE.Sprite(tfxGlowMat()); W.tfxHalo.renderOrder = 61; W.tfxIco.visible = W.tfxHalo.visible = false; W.group.add(W.tfxHalo, W.tfxIco); }
    W.tfxIco.material = tfxIconMat(grp || 'diger'); W.tfxHalo.material.color.setHex(col); TFX.grp = grp || 'diger';
    W.tfx.pts.material.color.setHex(col);
    if (TFX.beam) {
      const sd = W.sunDir.clone(); sd.y = Math.max(sd.y, 0.35); sd.normalize();
      const bm = W.tfx.beam; bm.position.set(e.x, e.y + e.h * 0.5, e.z);
      bm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), sd); bm.scale.set(1, 26, 1);
    }
    return true;
  }
  function stepTeach(dt) {
    if (!W || !W.tfx) return;
    const F = W.tfx;
    const icoOff = () => { if (W.tfxIco) W.tfxIco.visible = W.tfxHalo.visible = false; };
    if (!TFX.on || SC.on) { F.pts.visible = F.beam.visible = false; TFX.on = false; icoOff(); return; }
    TFX.t += dt; const u = TFX.t / TFX.len;
    if (u >= 1) { TFX.on = false; F.pts.visible = F.beam.visible = false; icoOff(); return; }
    if (W.tfxIco && TFX.e) {
      const e = TFX.e, k2t = 2 * Math.tan(cam.fov * D2R / 2) / ch, px = ch < 500 ? 54 : 72, pop = Math.min(1, TFX.t / 0.25), ease = 1 - Math.pow(1 - pop, 3);
      const a = Math.min(1, (1 - u) * 4), hy = e.y + e.h + 1.2 + u * 4.5;
      W.tfxIco.position.set(e.x, hy, e.z); W.tfxHalo.position.set(e.x, hy, e.z);
      const si = px * k2t * (0.6 + 0.4 * ease) * (1 + 0.06 * Math.sin(TFX.t * 10));
      W.tfxIco.scale.set(si, si, 1); W.tfxHalo.scale.set(si * 2.6, si * 2.6, 1);
      W.tfxIco.material.opacity = a; W.tfxHalo.material.opacity = 0.95 * a * (0.8 + 0.2 * Math.sin(TFX.t * 14));
      W.tfxIco.visible = W.tfxHalo.visible = true;
    }
    const fade = Math.min(1, u * 5, (1 - u) * 5), A = TFX.a, B = TFX.b, N = TFX.n;
    const L = Math.hypot(B.x - A.x, B.z - A.z), hop = Math.min(6, 1 + L * 0.12);
    const t0 = TFX.beam ? Math.max(0, TFX.t - 0.5) : TFX.t;
    for (let i = 0; i < N; i++) {
      let f = t0 * 0.9 - i / N; f = f < 0 ? 0 : f % 1;
      const k = i * 3;
      F.pos[k] = A.x + (B.x - A.x) * f; F.pos[k + 2] = A.z + (B.z - A.z) * f;
      F.pos[k + 1] = A.y + (B.y - A.y) * f + Math.sin(f * Math.PI) * hop;
    }
    F.pts.geometry.attributes.position.needsUpdate = true;
    F.pts.visible = t0 > 0; F.pts.material.opacity = 0.95 * fade;
    F.beam.visible = TFX.beam; if (TFX.beam) F.beam.material.opacity = 0.32 * fade * (0.8 + 0.2 * Math.sin(TFX.t * 12));
  }
  function crewPos() {
    if (!W) return [];
    const names = ['Ece', 'Kerem', 'Nil', 'Arda'];
    return W.crew.filter(c => c.g.visible !== false).map((c, i) => ({ x: c.x, z: c.z, name: names[i % names.length] }));
  }
  function roverPos() { const V = W && W.rover; return V ? { x: V.x, z: V.z } : null; }

  function on(name, fn) { (listeners[name] = listeners[name] || []).push(fn); }
  function quality(q) {
    if (q === 'low' || q === 'high') { qual = q; applyQuality(); }
    return qual;
  }
  function stats() {
    return ok ? { calls: R.info.render.calls, tris: R.info.render.triangles, geo: R.info.memory.geometries, tex: R.info.memory.textures, progs: (R.info.programs || []).length } : null;
  }

  return {
    init, load, unload, resize, frame, setMode, setPlayer, setGhost, project, on, setInput, shipLand, shipLeave, flash, quality, hAt, stats,
    planFocus, setBuildHints, planTint, walkTo, launchScene, skipScene, setLook, showcase, setHold,
    setGoal, ping, nearRover, drive, driveTo, showcaseFlash, showDrag, teachFx, crewPos, roverPos, camFreeze,
    get frozen() { return CF.on; },
    get teachFxOn() { return TFX.on ? { t: TFX.t, grp: TFX.grp, ico: !!(W && W.tfxIco && W.tfxIco.visible) } : null; },
    _v5f: () => ({ tag: Object.assign({}, TAGDBG), tap: TAPDBG.last, hints: PL.hints ? { best: PL.hints.best || null } : null, cam: mode === 'plan' ? { x: PL.x, z: PL.z } : { x: DR.x, z: DR.z }, tagGo: W && W.tagGo && W.tagGo.visible ? tagRect(W.tagGo) : null, tagMe: W && W.tagMe && W.tagMe.visible ? tagRect(W.tagMe) : null }),
    get driving() { return DRV.on; },
    get goal() { return GOAL.pos ? { x: GOAL.pos.x, z: GOAL.pos.z } : null; },
    get showYaw() { return SHOW.on ? SHOW.yaw : 0; },
    get showing() { return SHOW.on ? SHOW.target : null; },
    get rover() { const V = W && W.rover; return V ? { x: V.x, z: V.z, tx: Math.floor(V.x / TS), ty: Math.floor(V.z / TS), st: V.st, lights: !!V.lights } : null; },
    clickWalk(on) { WK.on = !!on; if (!on) WK.goal = null; return WK.on; },
    get walking() { return !!WK.goal; },
    get walkPath() { return WK.goal ? { goal: { x: WK.goal.x, z: WK.goal.z }, path: WK.w ? WK.w.path.map(p => ({ x: p.x, z: p.z })) : null, found: !!WK.found } : null; },
    intro, introSkip, introActive: () => IN.on, _introSeek: introSeek, _intro: () => IN.on ? { t: IN.t, n: IN.o.dust.N + IN.o.sparks.N } : null,
    get scene() { return SC.on && !IN.on ? { t: SC.t, len: SCENE_LEN, done: !!SC.fired } : null; },
    _dbg: () => ({ R, scene, cam, W, THREE: typeof THREE !== 'undefined' ? THREE : null }),
    scanFx(p) { scanP = p == null ? null : +p; },
    jump() { if (inputOn && mode === 'walk') P.jumpReq = true; },
    get dragLook() { return !!ms.dragLook && !ms.locked; },
    get mode() { return mode; },
    get player() { return { x: P.x, y: P.y, z: P.z, yaw: P.yaw, face: P.face, tx: Math.floor(P.x / TS), ty: Math.floor(P.z / TS), moving: P.moving, onGround: P.onGround }; },
    get aim() { return aim; },
  };
})();
