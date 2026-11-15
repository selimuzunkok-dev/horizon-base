

const YOL = (() => {
  const DEF_B = { x0: 0, z0: 0, x1: 192, z1: 120 };
  const SQ2 = Math.SQRT2;
  const cache = new WeakMap();

  function bnd(o) { const b = (o && o.bounds) || DEF_B; return b; }
  function free(obst, x, z, pad) {
    pad = pad || 0;
    for (let i = 0; i < obst.length; i++) { const o = obst[i], m = (o.r || 0) + pad; if (m > 0 && (x - o.x) * (x - o.x) + (z - o.z) * (z - o.z) < m * m) return false; }
    return true;
  }
  const inB = (b, x, z) => x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1;

  function nearestFree(obst, x, z, pad, bounds) {
    pad = pad || 0; const b = bounds || DEF_B;
    const cx = Math.min(b.x1, Math.max(b.x0, x)), cz = Math.min(b.z1, Math.max(b.z0, z));
    if (free(obst, cx, cz, pad)) return { x: cx, z: cz };
    let best = null, bd = 1e18;
    const tryP = (px, pz) => { if (!inB(b, px, pz) || !free(obst, px, pz, pad)) return; const d = (px - x) * (px - x) + (pz - z) * (pz - z); if (d < bd) { bd = d; best = { x: px, z: pz }; } };
    for (const o of obst) {
      const dx = cx - o.x, dz = cz - o.z, d = Math.hypot(dx, dz), m = (o.r || 0) + pad + 0.02;
      if (d >= m) continue;
      if (d > 1e-6) tryP(o.x + dx / d * m, o.z + dz / d * m); else tryP(o.x + m, o.z);
    }
    if (best) return best;
    for (let r = 0.25; r < 200; r += r < 4 ? 0.25 : 0.5) {
      const n = Math.max(12, Math.ceil(r * 8));
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; tryP(cx + Math.cos(a) * r, cz + Math.sin(a) * r); }
      if (best) return best;
    }
    return { x: cx, z: cz };
  }

  function segFree(obst, ax, az, bx, bz, pad) {
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
    for (let i = 0; i < obst.length; i++) {
      const o = obst[i], m = (o.r || 0) + pad; if (m <= 0) continue;
      let t = L2 > 0 ? ((o.x - ax) * dx + (o.z - az) * dz) / L2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const px = ax + dx * t - o.x, pz = az + dz * t - o.z;
      if (px * px + pz * pz < m * m) return false;
    }
    return true;
  }

  function grid(obst, pad, b, cell) {
    let m = cache.get(obst); if (!m) { m = new Map(); cache.set(obst, m); }
    const key = pad.toFixed(3) + '|' + cell + '|' + b.x0 + ',' + b.z0 + ',' + b.x1 + ',' + b.z1;
    let g = m.get(key); if (g) return g;
    const nx = Math.max(1, Math.ceil((b.x1 - b.x0) / cell)), nz = Math.max(1, Math.ceil((b.z1 - b.z0) / cell));
    const blk = new Uint8Array(nx * nz), inf = pad + cell * 0.36;
    for (const o of obst) {
      const R = (o.r || 0) + inf; if ((o.r || 0) <= 0 && pad <= 0) continue;
      const i0 = Math.max(0, Math.floor((o.x - R - b.x0) / cell)), i1 = Math.min(nx - 1, Math.floor((o.x + R - b.x0) / cell));
      const j0 = Math.max(0, Math.floor((o.z - R - b.z0) / cell)), j1 = Math.min(nz - 1, Math.floor((o.z + R - b.z0) / cell));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const px = b.x0 + (i + 0.5) * cell - o.x, pz = b.z0 + (j + 0.5) * cell - o.z;
        if (px * px + pz * pz < R * R) blk[j * nx + i] = 1;
      }
    }
    g = { nx, nz, cell, b, blk, comp: null, pad };
    m.set(key, g);
    return g;
  }
  function comps(g) {
    if (g.comp) return g.comp;
    const { nx, nz, blk } = g, c = new Int32Array(nx * nz), st = new Int32Array(nx * nz); let lab = 0;
    for (let s = 0; s < nx * nz; s++) {
      if (blk[s] || c[s]) continue;
      lab++; let sp = 0; st[sp++] = s; c[s] = lab;
      while (sp) {
        const k = st[--sp], i = k % nx, j = (k - i) / nx;
        for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue;
          const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue;
          const q = jj * nx + ii; if (blk[q] || c[q]) continue;
          if (di && dj && (blk[j * nx + ii] || blk[jj * nx + i])) continue;
          c[q] = lab; st[sp++] = q;
        }
      }
    }
    g.comp = c; return c;
  }
  const cellOf = (g, x, z) => {
    const i = Math.min(g.nx - 1, Math.max(0, Math.floor((x - g.b.x0) / g.cell))), j = Math.min(g.nz - 1, Math.max(0, Math.floor((z - g.b.z0) / g.cell)));
    return j * g.nx + i;
  };
  function nearCell(g, k, maxR) {
    if (!g.blk[k]) return k;
    const i0 = k % g.nx, j0 = (k - i0) / g.nx;
    for (let r = 1; r <= maxR; r++) {
      let best = -1, bd = 1e9;
      for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
        const i = i0 + di, j = j0 + dj; if (i < 0 || j < 0 || i >= g.nx || j >= g.nz) continue;
        const q = j * g.nx + i; if (g.blk[q]) continue;
        const d = di * di + dj * dj; if (d < bd) { bd = d; best = q; }
      }
      if (best >= 0) return best;
    }
    return -1;
  }

  function Heap(n) { this.k = new Int32Array(n); this.f = new Float64Array(n); this.n = 0; }
  Heap.prototype.push = function (key, f) {
    let i = this.n++; const K = this.k, F = this.f;
    while (i > 0) { const p = (i - 1) >> 1; if (F[p] <= f) break; K[i] = K[p]; F[i] = F[p]; i = p; }
    K[i] = key; F[i] = f;
  };
  Heap.prototype.pop = function () {
    const K = this.k, F = this.f, top = K[0], n = --this.n; if (n <= 0) return top;
    const lk = K[n], lf = F[n]; let i = 0;
    for (;;) { let c = 2 * i + 1; if (c >= n) break; if (c + 1 < n && F[c + 1] < F[c]) c++; if (F[c] >= lf) break; K[i] = K[c]; F[i] = F[c]; i = c; }
    K[i] = lk; F[i] = lf; return top;
  };
  let work = null;
  function astar(g, s, t) {
    const N = g.nx * g.nz, nx = g.nx, blk = g.blk;
    if (!work || work.N !== N) work = { N, gs: new Float64Array(N), par: new Int32Array(N), seen: new Uint32Array(N), closed: new Uint32Array(N), stamp: 0, heap: new Heap(N * 8 + 16) };
    const W = work; W.stamp++; if (W.stamp > 4e9) { W.stamp = 1; W.seen.fill(0); W.closed.fill(0); }
    const st = W.stamp, gs = W.gs, par = W.par, seen = W.seen, closed = W.closed, H = W.heap; H.n = 0;
    const ti = t % nx, tj = (t - ti) / nx;
    const h = k => { const i = k % nx, j = (k - i) / nx, dx = Math.abs(i - ti), dz = Math.abs(j - tj); return (dx + dz) + (SQ2 - 2) * Math.min(dx, dz); };
    gs[s] = 0; par[s] = -1; seen[s] = st; H.push(s, h(s));
    let it = 0;
    while (H.n) {
      const k = H.pop(); if (closed[k] === st) continue; closed[k] = st;
      if (k === t) break;
      if (++it > N * 2) return null;
      const i = k % nx, j = (k - i) / nx, gk = gs[k];
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= g.nz) continue;
        const q = jj * nx + ii; if (blk[q] || closed[q] === st) continue;
        if (di && dj && (blk[j * nx + ii] || blk[jj * nx + i])) continue;
        const ng = gk + (di && dj ? SQ2 : 1);
        if (seen[q] !== st || ng < gs[q]) { seen[q] = st; gs[q] = ng; par[q] = k; H.push(q, ng + h(q)); }
      }
    }
    if (closed[t] !== st) return null;
    const out = []; for (let k = t; k >= 0; k = par[k]) { out.push(k); if (k === s) break; }
    return out.reverse();
  }


  function path(obst, ax, az, bx, bz, opts) {
    const pad = (opts && opts.pad) || 0, b = bnd(opts), cell = (opts && opts.cell) || 1;
    if (!inB(b, bx, bz) || !free(obst, bx, bz, pad)) return null;
    if (segFree(obst, ax, az, bx, bz, pad)) return [{ x: bx, z: bz }];
    const g = grid(obst, pad, b, cell);
    const s = nearCell(g, cellOf(g, ax, az), 12), t = nearCell(g, cellOf(g, bx, bz), 3);
    if (s < 0 || t < 0) return null;
    const cm = comps(g); if (cm[s] !== cm[t]) return null;
    const ks = astar(g, s, t); if (!ks) return null;
    const pts = ks.map(k => { const i = k % g.nx, j = (k - i) / g.nx; return { x: b.x0 + (i + 0.5) * cell, z: b.z0 + (j + 0.5) * cell }; });
    pts[pts.length - 1] = { x: bx, z: bz };

    const out = []; let cx = ax, cz = az, i = 0;
    while (i < pts.length) {
      let j = pts.length - 1;
      while (j > i && !segFree(obst, cx, cz, pts[j].x, pts[j].z, pad)) j--;
      out.push(pts[j]); cx = pts[j].x; cz = pts[j].z; i = j + 1;
    }
    return out;
  }

  function reachable(obst, ax, az, bx, bz, opts) {
    const pad = (opts && opts.pad) || 0, b = bnd(opts), cell = (opts && opts.cell) || 1;
    if (!inB(b, bx, bz) || !free(obst, bx, bz, pad)) return false;
    const g = grid(obst, pad, b, cell), cm = comps(g);
    const s = nearCell(g, cellOf(g, ax, az), 12), t = nearCell(g, cellOf(g, bx, bz), 3);
    return s >= 0 && t >= 0 && cm[s] === cm[t];
  }


  function pickTarget(obst, cx, cz, rMin, rMax, rand, from, opts) {
    const pad = (opts && opts.pad) || 0, b = bnd(opts); rand = rand || Math.random;
    for (let k = 0; k < 24; k++) {
      const a = rand() * Math.PI * 2, r = rMin + rand() * Math.max(0, rMax - rMin), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      if (!inB(b, x, z) || !free(obst, x, z, pad + 0.6)) continue;
      if (from && !reachable(obst, from.x, from.z, x, z, opts)) continue;
      return { x, z };
    }
    return null;
  }


  function retarget(a, opts) {
    a.path = null; a.fails = 0; a.mon = null;
    const t = opts && typeof opts.pick === 'function' ? opts.pick(a) : null;
    if (t) { a.tx = t.x; a.tz = t.z; return true; }
    a.tx = a.tz = null; return false;
  }
  function step(a, obst, dt, speed, opts) {
    opts = opts || {};
    const pad = opts.pad || 0, b = bnd(opts), arr = opts.arrive != null ? opts.arrive : 0.3;
    const res = { moved: 0, arrived: false, stuck: false };
    const x0 = a.x, z0 = a.z;
    if (!free(obst, a.x, a.z, pad * 0.9)) { const p = nearestFree(obst, a.x, a.z, pad, b); a.x = p.x; a.z = p.z; a.path = null; }
    if (a.tx == null) { res.arrived = true; res.moved = Math.hypot(a.x - x0, a.z - z0); return res; }
    if (Math.hypot(a.tx - a.x, a.tz - a.z) <= arr) { res.arrived = true; a.path = null; res.moved = Math.hypot(a.x - x0, a.z - z0); return res; }
    if (a.ref !== obst) { a.ref = obst; a.path = null; }
    if (!a.path) {

      if (!free(obst, a.tx, a.tz, pad)) {
        const p = nearestFree(obst, a.tx, a.tz, pad, b);
        if (Math.hypot(p.x - a.tx, p.z - a.tz) <= arr + 0.01) { a.tx = p.x; a.tz = p.z; }
      }
      a.path = path(obst, a.x, a.z, a.tx, a.tz, opts); a.pi = 0;
      if (!a.path) { res.stuck = true; if (!retarget(a, opts)) return res; a.path = path(obst, a.x, a.z, a.tx, a.tz, opts); a.pi = 0; if (!a.path) { a.tx = a.tz = null; return res; } }
    }

    let wp = a.path[a.pi];
    while (wp && a.pi < a.path.length - 1 && Math.hypot(wp.x - a.x, wp.z - a.z) < 0.25) wp = a.path[++a.pi];
    const dx = wp.x - a.x, dz = wp.z - a.z, d = Math.hypot(dx, dz), last = a.pi === a.path.length - 1;
    let ux = d > 1e-6 ? dx / d : 0, uz = d > 1e-6 ? dz / d : 0, sp = speed;
    if (opts.turn) {
      const want = Math.atan2(ux, uz); let df = ((want - (a.yaw || 0) + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      a.yaw = (a.yaw || 0) + Math.max(-dt * opts.turn, Math.min(dt * opts.turn, df));
      sp = speed * Math.max(0.25, Math.cos(df)) * Math.min(1, (last ? d - arr : d) / 3 + 0.3);
      ux = Math.sin(a.yaw); uz = Math.cos(a.yaw);
    }
    const stepL = Math.min(sp * dt, opts.turn ? sp * dt : d);
    let nxp = a.x + ux * stepL, nzp = a.z + uz * stepL;
    nxp = Math.min(b.x1, Math.max(b.x0, nxp)); nzp = Math.min(b.z1, Math.max(b.z0, nzp));
    if (!free(obst, nxp, nzp, pad * 0.9)) { const p = nearestFree(obst, nxp, nzp, pad, b); nxp = p.x; nzp = p.z; }
    a.x = nxp; a.z = nzp;
    if (opts.face && stepL > 1e-6) a.face = Math.atan2(ux, uz);
    if (Math.hypot(a.tx - a.x, a.tz - a.z) <= arr) { res.arrived = true; a.path = null; }

    const m = a.mon || (a.mon = { t: 0, x: a.x, z: a.z });
    m.t += dt;
    if (m.t >= 1.5) {
      if (Math.hypot(a.x - m.x, a.z - m.z) < 0.2 && !res.arrived) {
        a.fails = (a.fails || 0) + 1; a.path = null;
        if (a.fails >= 3) { res.stuck = true; retarget(a, opts); }
      } else a.fails = 0;
      m.t = 0; m.x = a.x; m.z = a.z;
    }
    res.moved = Math.hypot(a.x - x0, a.z - z0);
    return res;
  }
  function setTarget(a, x, z) { a.tx = x; a.tz = z; a.path = null; a.fails = 0; a.mon = null; }


  function walkPlan(obst, ax, az, bx, bz, opts) {
    const pad = (opts && opts.pad) || 0, b = bnd(opts);
    const g = nearestFree(obst, bx, bz, pad + 0.05, b);
    let p = null;
    try { p = path(obst, ax, az, g.x, g.z, opts); } catch (e) { p = null; }
    return { x: g.x, z: g.z, path: p && p.length ? p : [{ x: g.x, z: g.z }], found: !!(p && p.length) };
  }
  function walkNext(w, x, z) {
    if (!w || !w.path || !w.path.length) return null;
    let i = w.pi || 0;
    while (i < w.path.length - 1 && Math.hypot(w.path[i].x - x, w.path[i].z - z) < 0.7) i++;
    w.pi = i;
    const p = w.path[i];
    return { x: p.x, z: p.z, last: i === w.path.length - 1 };
  }
  return { free, nearestFree, segFree, path, reachable, pickTarget, step, setTarget, walkPlan, walkNext, _grid: grid };
})();
