'use strict';


const GIRIS = (() => {
  let R = null, failed = false, tex = null, lastNow = 0;
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  const lay = { split: 0.5, zA: 1, zM: 1 };


  function noiseFn(seed) {
    const P = new Float32Array(65536); let a = seed >>> 0;
    for (let i = 0; i < 65536; i++) { a = (a * 1664525 + 1013904223) >>> 0; P[i] = a / 4294967296; }
    return (x, y, per) => {
      const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      const X0 = ((xi % per) + per) % per, X1 = (X0 + 1) % per, Y0 = yi & 255, Y1 = (yi + 1) & 255;
      const g = (X, Y) => P[(Y << 8) | (X & 255)];
      const t = g(X0, Y0) + (g(X1, Y0) - g(X0, Y0)) * sx, b = g(X0, Y1) + (g(X1, Y1) - g(X0, Y1)) * sx;
      return t + (b - t) * sy;
    };
  }
  const fbm = (n, u, v, oct, base) => { let s = 0, a = 0.5, f = base, k = 0; for (let o = 0; o < oct; o++) { s += a * n(u * f, v * f * 0.5, f); k += a; a *= 0.5; f *= 2; } return s / k; };
  const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function rnd(seed) { let a = seed >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }

  function craters(ctx, W, H, r, n, maxR, dark, rim) {
    for (let i = 0; i < n; i++) {
      const v = 0.08 + r() * 0.84, u = r(), lat = (v - 0.5) * Math.PI, st = Math.min(3, 1 / Math.max(0.2, Math.cos(lat)));
      const rad = Math.max(1.5, maxR * Math.pow(r(), 2.6)), x = u * W, y = v * H;
      for (const ox of [-W, 0, W]) {
        const cx = x + ox; if (cx + rad * st < 0 || cx - rad * st > W) continue;
        ctx.save(); ctx.translate(cx, y); ctx.scale(st, 1);
        let g = ctx.createRadialGradient(-rad * 0.15, -rad * 0.1, 0, 0, 0, rad);
        g.addColorStop(0, `rgba(${dark},0.26)`); g.addColorStop(0.8, `rgba(${dark},0.16)`); g.addColorStop(1, `rgba(${dark},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rad, 0, 7); ctx.fill();
        ctx.lineWidth = Math.max(0.6, rad * 0.06); ctx.strokeStyle = `rgba(${rim},0.08)`; ctx.beginPath(); ctx.arc(0, 0, rad * 0.92, Math.PI * 0.9, Math.PI * 1.9); ctx.stroke();
        ctx.strokeStyle = `rgba(${dark},0.1)`; ctx.beginPath(); ctx.arc(0, 0, rad * 0.92, Math.PI * 1.95, Math.PI * 2.85); ctx.stroke();
        if (rad > maxR * 0.45) { g = ctx.createRadialGradient(0, 0, rad, 0, 0, rad * 2.2); g.addColorStop(0, `rgba(${rim},0.07)`); g.addColorStop(1, `rgba(${rim},0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rad * 2.2, 0, 7); ctx.fill(); }
        ctx.restore();
      }
    }
  }
  function makeMoon() {
    const W = 1024, H = 512, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), d = img.data, n = noiseFn(11), m = noiseFn(29);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H, f = fbm(n, u, v, 5, 8), mar = sstep(0.52, 0.66, fbm(m, u, v, 4, 2));
      let g = 104 + (f - 0.5) * 130 - mar * 48; g = Math.max(30, Math.min(220, g));
      const i = (y * W + x) * 4; d[i] = g; d[i + 1] = g + 2; d[i + 2] = g + 6; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    craters(ctx, W, H, rnd(7), 200, 34, '22,24,30', '235,238,245');
    return cv;
  }
  function makeMars() {
    const W = 1024, H = 512, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), d = img.data, n = noiseFn(5), m = noiseFn(41), c = noiseFn(77);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H, f = fbm(n, u, v, 5, 8), dk = sstep(0.5, 0.68, fbm(m, u, v, 4, 2)) * (0.55 + 0.45 * sstep(0.25, 0.5, Math.abs(v - 0.55) < 0.32 ? 1 : 0.3));
      let r = 150 + (f - 0.5) * 110, g = 66 + (f - 0.5) * 60, b = 34 + (f - 0.5) * 30;
      r = r * (1 - dk * 0.5); g = g * (1 - dk * 0.45); b = b * (1 - dk * 0.3);
      const vm = Math.abs(v - 0.53) * 140 + (fbm(c, u, v, 3, 4) - 0.5) * 10;
      if (u > 0.55 && u < 0.78 && vm < 1.6) { const k = 1 - vm / 1.6; r -= 55 * k; g -= 30 * k; b -= 12 * k; }
      const cap = Math.max(sstep(0.11, 0.06, v + (fbm(c, u, v, 4, 8) - 0.5) * 0.05), sstep(0.92, 0.96, v + (fbm(c, u, v, 4, 8) - 0.5) * 0.05));
      r += (240 - r) * cap; g += (236 - g) * cap; b += (230 - b) * cap;
      const i = (y * W + x) * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    craters(ctx, W, H, rnd(3), 120, 22, '60,24,12', '230,150,100');
    return cv;
  }
  function makeLander() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d');
    let g = c.createRadialGradient(64, 104, 0, 64, 104, 26); g.addColorStop(0, 'rgba(255,240,200,.95)'); g.addColorStop(0.35, 'rgba(255,170,80,.6)'); g.addColorStop(1, 'rgba(255,120,40,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(64, 106, 16, 22, 0, 0, 7); c.fill();
    c.fillStyle = '#0d121c'; c.strokeStyle = '#0d121c'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(44, 46); c.lineTo(84, 46); c.lineTo(90, 72); c.lineTo(38, 72); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(52, 46); c.lineTo(56, 30); c.lineTo(72, 30); c.lineTo(76, 46); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(42, 70); c.lineTo(28, 94); c.moveTo(86, 70); c.lineTo(100, 94); c.moveTo(22, 94); c.lineTo(34, 94); c.moveTo(94, 94); c.lineTo(106, 94); c.stroke();
    c.beginPath(); c.moveTo(58, 72); c.lineTo(56, 84); c.lineTo(72, 84); c.lineTo(70, 72); c.fill();
    c.strokeStyle = 'rgba(190,220,255,.55)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(45, 47); c.lineTo(83, 47); c.moveTo(57, 31); c.lineTo(71, 31); c.stroke();
    c.fillStyle = 'rgba(255,90,70,.9)'; c.beginPath(); c.arc(64, 26, 2.2, 0, 7); c.fill();
    return cv;
  }

  const haloVS = 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
  const haloFS = 'uniform vec3 c; uniform float k; varying vec3 vN; void main(){ float f = pow(max(0.0, 0.72 - dot(vN, vec3(0.0, 0.0, 1.0))), 3.0); gl_FragColor = vec4(c, 1.0) * f * k; }';
  const starVS = 'attribute float ph; attribute float sz; attribute vec3 col; uniform float t; uniform float pr; varying float a; varying vec3 vc; void main(){ vc = col; a = 0.55 + 0.45 * sin(t * (0.7 + fract(ph * 7.31) * 2.2) + ph * 6.283); gl_PointSize = sz * pr; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
  const starFS = 'varying float a; varying vec3 vc; void main(){ float r = length(gl_PointCoord - 0.5); float m = smoothstep(0.5, 0.0, r); m *= m; gl_FragColor = vec4(vc * m * a, 1.0); }';
  const meteorFS = 'uniform float o; varying vec2 vU; void main(){ float h = 1.0 - abs(vU.y - 0.5) * 2.0; float f = pow(vU.x, 2.4) * h * h * o; gl_FragColor = vec4(vec3(1.0, 0.95, 0.88) * f, 1.0); }';

  function setup(host) {
    if (typeof THREE === 'undefined') { failed = true; return false; }
    const cv = document.createElement('canvas'); cv.className = 'gs-gl'; cv.setAttribute('aria-hidden', 'true');
    let rd;
    try { rd = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'low-power' }); if (!rd.getContext()) throw new Error('gl'); } catch (e) { failed = true; return false; }
    host.insertBefore(cv, host.firstChild);
    rd.setClearColor(0x000000, 0); rd.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
    if (!tex) tex = { moon: makeMoon(), mars: makeMars(), lander: makeLander() };
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, 0.1, 300); cam.position.set(0, 0, 10);
    const T = [], M = [], G = [];
    const ct = c => { const t = new THREE.CanvasTexture(c); t.anisotropy = 4; T.push(t); return t; };
    const mat = m => { M.push(m); return m; }, geo = g => { G.push(g); return g; };
    const sphere = geo(new THREE.SphereGeometry(1, 72, 48));
    const mk = (cvTex, bump, rough) => { const t = ct(cvTex); return new THREE.Mesh(sphere, mat(new THREE.MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: bump, roughness: rough, metalness: 0 }))); };
    const moon = mk(tex.moon, 0.022, 1), mars = mk(tex.mars, 0.02, 0.95);
    mars.rotation.z = 0.44; moon.rotation.z = 0.03;
    const halo = (col, k, s) => { const h = new THREE.Mesh(sphere, mat(new THREE.ShaderMaterial({ uniforms: { c: { value: new THREE.Color(col) }, k: { value: k } }, vertexShader: haloVS, fragmentShader: haloFS, side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }))); h.scale.setScalar(s); return h; };
    const mGrp = new THREE.Group(), aGrp = new THREE.Group();
    aGrp.add(moon); aGrp.add(halo(0x9fc6ff, 0.3, 1.04));
    mGrp.add(mars); mGrp.add(halo(0xff7a3c, 0.75, 1.07));
    sc.add(aGrp); sc.add(mGrp);

    const sun = new THREE.PointLight(0xfff4e6, 1.7, 0, 0); sun.position.set(0, 2.2, 6); sc.add(sun);
    sc.add(new THREE.AmbientLight(0x2a3a55, 0.22));

    const N = 1700, pos = new Float32Array(N * 3), ph = new Float32Array(N), sz = new Float32Array(N), col = new Float32Array(N * 3), r = rnd(91);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (r() - 0.5) * 150; pos[i * 3 + 1] = (r() - 0.5) * 90; pos[i * 3 + 2] = -40 - r() * 40;
      ph[i] = r(); sz[i] = 1.2 + Math.pow(r(), 6) * 5.5;
      const w = r(); col.set(w < 0.2 ? [1, 0.82, 0.66] : w < 0.45 ? [0.72, 0.84, 1] : [0.95, 0.96, 1], i * 3);
    }
    const sg = geo(new THREE.BufferGeometry());
    sg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); sg.setAttribute('ph', new THREE.BufferAttribute(ph, 1)); sg.setAttribute('sz', new THREE.BufferAttribute(sz, 1)); sg.setAttribute('col', new THREE.BufferAttribute(col, 3));
    const stU = { t: { value: 0 }, pr: { value: rd.getPixelRatio() } };
    const stars = new THREE.Points(sg, mat(new THREE.ShaderMaterial({ uniforms: stU, vertexShader: starVS, fragmentShader: starFS, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })));
    sc.add(stars);

    const mU = { o: { value: 0 } };
    const met = new THREE.Mesh(geo(new THREE.PlaneGeometry(1, 1)), mat(new THREE.ShaderMaterial({ uniforms: mU, vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: meteorFS, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })));
    met.visible = false; sc.add(met);

    const lander = new THREE.Sprite(mat(new THREE.SpriteMaterial({ map: ct(tex.lander), transparent: true, depthWrite: false })));
    sc.add(lander);
    R = { rd, cv, sc, cam, moon, mars, aGrp, mGrp, stars, stU, met, mU, lander, T, M, G, W: 0, H: 0, metT: 0, metNext: 2500, t0: performance.now() };
    if (!R._mv) { R._mv = e => { ptr.x = (e.clientX / (window.innerWidth || 1)) * 2 - 1; ptr.y = (e.clientY / (window.innerHeight || 1)) * 2 - 1; }; window.addEventListener('pointermove', R._mv, { passive: true }); }
    return true;
  }
  function stop() {
    if (!R) return;
    try {
      window.removeEventListener('pointermove', R._mv);
      R.T.forEach(t => t.dispose()); R.M.forEach(m => m.dispose()); R.G.forEach(g => g.dispose());
      R.rd.dispose(); if (typeof R.rd.forceContextLoss === 'function') R.rd.forceContextLoss();
      R.cv.remove();
    } catch (e) {   }
    R = null;
  }
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function frame(now, host, st) {
    if (failed) return false;
    if (document.hidden) return true;
    if (!R && !setup(host)) return false;
    st = st || {};
    const dt = Math.min(0.1, Math.max(0, (now - (lastNow || now)) / 1000)); lastNow = now;
    const W = host.clientWidth || window.innerWidth, H = host.clientHeight || window.innerHeight;
    if (W !== R.W || H !== R.H) { R.W = W; R.H = H; R.rd.setSize(W, H, false); R.cam.aspect = W / H; R.cam.updateProjectionMatrix(); }
    const stacked = W < 600 && H > W;
    const k = 1 - Math.exp(-dt * 9);
    const dive = st.dive, dp = dive ? Math.min(1, (now - dive.t0) / 700) : 0;
    const tSplit = dive ? (dive.w === 'ay' ? 1.12 : -0.12) : st.focus === 'ay' ? 0.58 : st.focus === 'mars' ? 0.42 : 0.5;
    lay.split += (tSplit - lay.split) * (dive ? Math.min(1, k * 1.6) : k);
    lay.zA += ((st.focus === 'ay' ? 1.1 : st.focus === 'mars' ? 0.94 : 1) - lay.zA) * k;
    lay.zM += ((st.focus === 'mars' ? 1.1 : st.focus === 'ay' ? 0.94 : 1) - lay.zM) * k;
    ptr.sx += (ptr.x - ptr.sx) * k * 0.5; ptr.sy += (ptr.y - ptr.sy) * k * 0.5;

    const vh = 2 * R.cam.position.z * Math.tan(THREE.MathUtils.degToRad(R.cam.fov / 2)), ppu = H / vh;
    const place = (grp, cx, cy, rad) => { grp.position.set((cx - W / 2) / ppu, (H / 2 - cy) / ppu, 0); grp.scale.setScalar(Math.max(0.001, rad / ppu)); };
    const s = Math.max(0, Math.min(1, lay.split)), shortH = H < 460;
    let a, m;
    if (stacked) {
      const top = 64, aH = s * H;
      a = { x: W / 2, y: top + (aH - top) * 0.3, r: Math.min(W * 0.27, aH * 0.24) };
      m = { x: W / 2, y: aH + (H - aH) * 0.3, r: Math.min(W * 0.27, (H - aH) * 0.24) };
    } else {
      const aw = s * W, mw = W - aw, cy = H * (shortH ? 0.33 : 0.335), rr = H * (shortH ? 0.19 : 0.215);
      a = { x: aw * 0.5, y: cy, r: Math.min(aw * 0.34, rr) }; m = { x: aw + mw * 0.5, y: cy, r: Math.min(mw * 0.34, rr) };
    }
    a.r = Math.max(a.r, 10) * lay.zA; m.r = Math.max(m.r, 10) * lay.zM;
    if (dive) {
      const e = ease(dp), big = Math.max(W, H) * 1.1, o = dive.w === 'ay' ? a : m, q = dive.w === 'ay' ? m : a;
      o.x += (W / 2 - o.x) * e; o.y += (H / 2 - o.y) * e; o.r += (big - o.r) * e; q.r *= 1 - e;
    }
    place(R.aGrp, a.x, a.y, a.r); place(R.mGrp, m.x, m.y, m.r);
    R.moon.rotation.y += dt * 0.045; R.mars.rotation.y += dt * 0.06;
    R.cam.position.x = ptr.sx * 0.22; R.cam.position.y = -ptr.sy * 0.14;
    R.stars.position.set(-ptr.sx * 1.6, ptr.sy * 1.0, 0); R.stars.rotation.z += dt * 0.0035;
    R.stU.t.value = (now - R.t0) / 1000;

    R.metT += dt * 1000;
    if (!R.met.visible && R.metT > R.metNext && !dive) {
      const rr = Math.random, len = 4 + rr() * 4, ang = -0.35 - rr() * 0.4, dir = rr() < 0.5 ? 1 : -1;
      R.met.userData = { x: (rr() - 0.5) * 30, y: 6 + rr() * 6, vx: Math.cos(ang) * 26 * dir, vy: Math.sin(ang) * 26, len, t: 0 };
      R.met.scale.set(len, 0.06, 1); R.met.rotation.z = dir > 0 ? ang : Math.PI - ang; R.met.visible = true;
    }
    if (R.met.visible) {
      const u = R.met.userData; u.t += dt; u.x += u.vx * dt; u.y += u.vy * dt; R.met.position.set(u.x, u.y, -20);
      R.mU.o.value = Math.sin(Math.min(1, u.t / 0.9) * Math.PI) * 0.9;
      if (u.t > 0.9) { R.met.visible = false; R.metT = 0; R.metNext = 4000 + Math.random() * 6000; }
    }

    const lt = ((now - R.t0) / 28000) % 1, fy = 0.12 + lt * 0.7, sk = 0.04;
    let lx, ly;
    if (stacked) { lx = W * (0.1 + lt * 0.8); ly = H * (s + sk * (1 - 2 * (lx / W))) - 26; } else { lx = W * (s + sk * (1 - 2 * fy)) + Math.sin(now / 1700) * 10; ly = H * fy; }
    const ls = Math.max(26, Math.min(W, H) * 0.075) / ppu;
    R.lander.position.set((lx - W / 2) / ppu, (H / 2 - ly) / ppu, 1); R.lander.scale.set(ls, ls, 1);
    R.lander.material.rotation = Math.sin(now / 2300) * 0.12; R.lander.material.opacity = dive ? 1 - dp : Math.min(1, Math.sin(lt * Math.PI) * 3);
    R.rd.render(R.sc, R.cam);
    return true;
  }
  return { frame, stop, ok: () => !failed, running: () => !!R };
})();
