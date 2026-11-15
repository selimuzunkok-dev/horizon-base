
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const code = fs.readFileSync(path.join(dir, '..', 'src', 'yol.js'), 'utf8');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(code + '\n;globalThis.YOL = YOL;', ctx);
const YOL = ctx.YOL;

let fail = 0, pass = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  HATA:', m); } };
const B = { x0: 0, z0: 0, x1: 192, z1: 120 };
const PAD = 0.4, SPEED = 1.25, DT = 0.05;
function prng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const inside = (obst, x, z) => obst.some(o => o.r > 0 && Math.hypot(x - o.x, z - o.z) < o.r - 1e-6);


function sim(o) {
  let obst = o.obst; const a = { x: o.a.x, z: o.a.z }; YOL.setTarget(a, o.t.x, o.t.z);
  const rand = prng(o.seed || 1);
  const pick = o.pick || (ag => YOL.pickTarget(obst, o.cx != null ? o.cx : ag.x, o.cz != null ? o.cz : ag.z, 3, 20, rand, ag, { pad: PAD, bounds: B }));
  const r = { arrived: false, tArr: -1, dist: 0, insideN: 0, maxStill: 0, firstOut: -1, frames: 0 };
  let still = 0, sx = a.x, sz = a.z, sinceT = 0;
  for (let t = 0; t < o.T; t += DT) {
    const no = o.onT && o.onT(t, a); if (no) obst = no;
    const res = YOL.step(a, obst, DT, SPEED, { pad: PAD, bounds: B, pick });
    r.frames++;
    r.dist += res.moved;
    if (r.firstOut < 0 && !inside(obst, a.x, a.z)) r.firstOut = r.frames;
    if (inside(obst, a.x, a.z)) r.insideN++;
    if (res.arrived && !r.arrived) { r.arrived = true; r.tArr = t; }
    if (res.arrived || a.tx == null) {
      if (o.stopAtArrive) break;
      const p = pick(a); if (p) YOL.setTarget(a, p.x, p.z);
    }

    sinceT += DT;
    if (Math.hypot(a.x - sx, a.z - sz) > 0.1) { sx = a.x; sz = a.z; still = 0; } else still += DT;
    r.maxStill = Math.max(r.maxStill, still);
  }
  return r;
}
const rows = [];
function report(name, r, extra) { rows.push({ name, ...r, ...extra }); }


{
  const obst = []; for (let i = 0; i < 6; i++) obst.push({ x: 60, z: 40 + i * 4.5, r: 3 });
  const a = { x: 50, z: 51 }, t = { x: 70, z: 51 }, straight = Math.hypot(t.x - a.x, t.z - a.z);
  const r = sim({ obst, a, t, T: 60, stopAtArrive: true });
  ok(r.arrived, '1 duvar: varmadı'); ok(r.tArr * SPEED <= straight * 2.5, '1 duvar: süre düz yolun 2,5 katından uzun (' + (r.tArr * SPEED / straight).toFixed(2) + ')');
  ok(r.insideN === 0, '1 duvar: engel içinde');
  const r2 = sim({ obst, a, t, T: 60 });
  ok(r2.dist > 0 && r2.insideN === 0 && r2.maxStill <= 3, '1 duvar 60 sn dolaşma');
  report('1 duvar (6 daire)', r, { oran: (r.tArr * SPEED / straight).toFixed(2), d60: r2.dist.toFixed(0), still60: r2.maxStill.toFixed(1) });
}

{
  const obst = [];
  for (let i = -4; i <= 4; i++) obst.push({ x: 80 + i * 2.5, z: 70, r: 1.6 });
  for (let k = 1; k <= 5; k++) { obst.push({ x: 70, z: 70 - k * 2.5, r: 1.6 }); obst.push({ x: 90, z: 70 - k * 2.5, r: 1.6 }); }
  const a = { x: 80, z: 63 }, t = { x: 80, z: 78 };
  const r = sim({ obst, a, t, T: 60, stopAtArrive: true });
  ok(r.arrived, '2 U: varmadı'); ok(r.insideN === 0, '2 U: engel içinde');
  const r2 = sim({ obst, a, t, T: 60 });
  ok(r2.dist > 0 && r2.insideN === 0 && r2.maxStill <= 3, '2 U 60 sn');
  report('2 U biçimi', r, { d60: r2.dist.toFixed(0), still60: r2.maxStill.toFixed(1) });
}

{
  const obst = []; for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2; obst.push({ x: 100 + Math.cos(an) * 6, z: 60 + Math.sin(an) * 6, r: 1.6 }); }
  const t = { x: 100, z: 60 }, a = { x: 80, z: 60 };
  ok(YOL.path(obst, a.x, a.z, t.x, t.z, { pad: PAD, bounds: B }) === null, '3 halka: path null değil');
  ok(!YOL.reachable(obst, a.x, a.z, t.x, t.z, { pad: PAD, bounds: B }), '3 halka: ulaşılabilir sanıldı');
  const r = sim({ obst, a, t, T: 60, cx: 100, cz: 60 });
  ok(r.dist > 5 && r.insideN === 0 && r.maxStill <= 3, '3 halka: yeni hedefe yürümedi (yol ' + r.dist.toFixed(1) + ', durma ' + r.maxStill.toFixed(1) + ')');

  const rand = prng(3); let inRing = 0;
  for (let k = 0; k < 200; k++) { const p = YOL.pickTarget(obst, 100, 60, 0, 25, rand, a, { pad: PAD, bounds: B }); if (p && Math.hypot(p.x - 100, p.z - 60) < 6) inRing++; }
  ok(inRing === 0, '3 halka: pickTarget ulaşılamayan iç noktayı seçti');
  report('3 kapalı halka', r, { d60: r.dist.toFixed(0), still60: r.maxStill.toFixed(1) });
}

{
  const obst = [{ x: 50, z: 50, r: 4 }, { x: 55, z: 50, r: 3 }];
  const a = { x: 51, z: 50 }, t = { x: 70, z: 50 };
  const r = sim({ obst, a, t, T: 60 });
  ok(r.firstOut === 1, '4 içte doğma: ilk adımda dışarı çıkmadı (' + r.firstOut + ')');
  ok(r.insideN === 0 && r.dist > 0 && r.maxStill <= 3, '4 içte doğma 60 sn');
  report('4 engel içinde doğma', r, { ilkKare: r.firstOut, d60: r.dist.toFixed(0), still60: r.maxStill.toFixed(1) });
}

{
  const base = [{ x: 60, z: 30, r: 3 }];
  const a = { x: 40, z: 40 }, t = { x: 80, z: 40 };
  let phase = 0;
  const r = sim({ obst: base, a, t, T: 60, onT: (tm) => {
    if (phase === 0 && tm >= 4) { phase = 1; return base.concat([{ x: 80, z: 40, r: 3.2 }]); }
    if (phase === 1 && tm >= 8) { phase = 2; return base.concat([{ x: 80, z: 40, r: 3.2 }, { x: 52, z: 40, r: 3 }, { x: 52, z: 45, r: 3 }, { x: 52, z: 35, r: 3 }]); }
  } });
  ok(r.insideN === 0 && r.dist > 0, '5 hedefe yapı: engel içinde');
  ok(r.maxStill <= 3, '5 hedefe yapı: 3 sn\'den uzun takıldı (' + r.maxStill.toFixed(1) + ')');
  report('5 hedefe yapı kuruldu', r, { d60: r.dist.toFixed(0), still60: r.maxStill.toFixed(1) });
}

{
  const obst = [{ x: 30, z: 30, r: 5 }, { x: 30, z: 30, r: 3 }, { x: 31, z: 30, r: 1 }, { x: 45, z: 30, r: 0 }, { x: 1, z: 1, r: 3 }, { x: 191, z: 60, r: 4 }];
  const a = { x: 30, z: 30 }, t = { x: 0.5, z: 62 };
  const r = sim({ obst, a, t, T: 60, stopAtArrive: true });
  ok(r.arrived && r.insideN === 0 && r.firstOut === 1, '6 iç içe → kenar: varmadı ya da içerde');
  const p = YOL.nearestFree(obst, 191.5, 60, PAD, B);
  ok(p.x >= 0 && p.x <= 192 && YOL.free(obst, p.x, p.z, PAD), '6 kenar: nearestFree sınır dışı/dolu');
  ok(YOL.path(obst, 10, 10, 250, 10, { pad: PAD, bounds: B }) === null, '6 kenar: harita dışı hedefe yol verdi');
  const r2 = sim({ obst, a: { x: 1, z: 1 }, t: { x: 191, z: 119 }, T: 60 });
  ok(r2.insideN === 0 && r2.dist > 0 && r2.maxStill <= 3, '6 köşe 60 sn');
  report('6 iç içe, r=0, kenar', r, { d60: r2.dist.toFixed(0), still60: r2.maxStill.toFixed(1) });
}

{
  let arrN = 0, stuckN = 0, inN = 0, movedN = 0; const times = [];
  for (let k = 0; k < 50; k++) {
    const R = prng(1000 + k), obst = [];
    const n = 25 + Math.floor(R() * 25);
    for (let i = 0; i < n; i++) obst.push({ x: 50 + R() * 90, z: 20 + R() * 80, r: 0.8 + R() * 3.4 });
    const fr = () => { for (;;) { const x = 50 + R() * 90, z = 20 + R() * 80; if (YOL.free(obst, x, z, PAD + 0.2)) return { x, z }; } };
    const a = fr(); let t = fr();
    for (let q = 0; q < 50 && (Math.hypot(t.x - a.x, t.z - a.z) > 50 || !YOL.reachable(obst, a.x, a.z, t.x, t.z, { pad: PAD, bounds: B })); q++) t = fr();
    const t0 = process.hrtime.bigint(); YOL.path(obst, a.x, a.z, t.x, t.z, { pad: PAD, bounds: B }); times.push(Number(process.hrtime.bigint() - t0) / 1e6);
    const r = sim({ obst, a, t, T: 60, seed: k + 7 });
    if (r.arrived) arrN++; if (r.maxStill > 3) stuckN++; if (r.insideN) inN++; if (r.dist > 0) movedN++;
  }
  ok(arrN >= 48, '7 rastgele: varış < %95 (' + arrN + '/50)');
  ok(stuckN === 0, '7 rastgele: 3 sn+ takılma ' + stuckN);
  ok(inN === 0, '7 rastgele: engel içinde ' + inN);
  ok(movedN === 50, '7 rastgele: hareketsiz');
  report('7 rastgele ×50', { arrived: arrN + '/50' }, { takilma: stuckN, icerde: inN });
}

{
  const R = prng(77), obst = [];
  for (let ty = 0; ty < 15; ty++) for (let tx = 0; tx < 24; tx++) if (R() < 0.35) obst.push({ x: tx * 8 + 4, z: ty * 8 + 4, r: 2 + R() * 2 });
  const O = { pad: PAD, bounds: B }; let tot = 0, n = 0, mx = 0; const t0 = process.hrtime.bigint();
  YOL.path(obst, 1, 1, 190, 118, O); const build = Number(process.hrtime.bigint() - t0) / 1e6;
  for (let k = 0; k < 200; k++) {
    const ax = R() * 192, az = R() * 120, bx = R() * 192, bz = R() * 120;
    const s = process.hrtime.bigint(); YOL.path(obst, ax, az, bx, bz, O); const ms = Number(process.hrtime.bigint() - s) / 1e6;
    tot += ms; n++; mx = Math.max(mx, ms);
  }
  const avg = tot / n;
  ok(avg < 2, 'perf: ortalama yol ' + avg.toFixed(2) + ' ms (sınır 2)');
  rows.push({ name: 'performans (200 yol, 192×120 m)', ort_ms: avg.toFixed(2), en_cok_ms: mx.toFixed(1), izgara_ms: build.toFixed(1) });
}


{
  const EDGE = 16, WB = { x0: -EDGE + 1, z0: -EDGE + 1, x1: 192 + EDGE - 1, z1: 120 + EDGE - 1 }, WPAD = 0.5;
  function walkSim(obst, a, t, usePath, T) {
    const P = { x: a.x, z: a.z, vx: 0, vz: 0 };
    const plan = usePath ? YOL.walkPlan(obst, P.x, P.z, t.x, t.z, { pad: WPAD, bounds: WB }) : { x: t.x, z: t.z, path: [{ x: t.x, z: t.z }] };
    const w = { path: plan.path, pi: 0 }; let stuck = 0, lastD = 1e9, lastPi = 0;
    for (let tm = 0; tm < T; tm += DT) {
      const nx = YOL.walkNext(w, P.x, P.z); if (!nx) return { arrived: false };
      if (w.pi !== lastPi) { lastPi = w.pi; lastD = 1e9; stuck = 0; }
      const dx = nx.x - P.x, dz = nx.z - P.z, d = Math.hypot(dx, dz);
      if (nx.last && d < 0.5) return { arrived: true, t: tm, goal: plan };
      const v = Math.min(4.2, 0.8 + d * 1.4) * (nx.last ? 1 : 1); let tvx = dx / d * (nx.last ? v : 4.2), tvz = dz / d * (nx.last ? v : 4.2);
      if (d < lastD - 0.4) { lastD = d; stuck = 0; } else if ((stuck += DT) > 1.5) return { arrived: false, stuck: true, x: P.x, z: P.z };
      P.vx += (tvx - P.vx) * Math.min(1, DT * 9); P.vz += (tvz - P.vz) * Math.min(1, DT * 9);
      P.x += P.vx * DT; P.z += P.vz * DT;
      for (const o of obst) { const ox = P.x - o.x, oz = P.z - o.z, q = Math.hypot(ox, oz), m = o.r + 0.45; if (q < m && q > 1e-4) { P.x = o.x + ox / q * m; P.z = o.z + oz / q * m; const vn = (P.vx * ox + P.vz * oz) / q; if (vn < 0) { P.vx -= vn * ox / q; P.vz -= vn * oz / q; } } }
    }
    return { arrived: false };
  }

  const wall = []; for (let i = 0; i < 8; i++) wall.push({ x: 96, z: 40 + i * 4.5, r: 3 });
  const nw = walkSim(wall, { x: 80, z: 56 }, { x: 112, z: 56 }, true, 60), ow = walkSim(wall, { x: 80, z: 56 }, { x: 112, z: 56 }, false, 60);
  ok(nw.arrived, 'dokun-yürü: duvar arkasına varmadı'); ok(!ow.arrived, 'dokun-yürü (bilgi): eski düz yürüyüş de vardı (senaryo zayıf)');

  const R = prng(5), base = [];
  for (let ty = 2; ty < 13; ty++) for (let tx = 6; tx < 18; tx++) if (R() < 0.45 && !(tx === 12 && ty === 8)) base.push({ x: tx * 8 + 4, z: ty * 8 + 4, r: 2 + R() * 1.6 });
  let arr = 0, oldArr = 0; const N = 30, R2 = prng(9);
  for (let k = 0; k < N; k++) {
    const a = YOL.nearestFree(base, 100, 68, 0.6, WB), t = { x: -10 + R2() * 212, z: -10 + R2() * 140 };
    if (walkSim(base, a, t, true, 120).arrived) arr++;
    if (walkSim(base, a, t, false, 120).arrived) oldArr++;
  }
  ok(arr === N, 'dokun-yürü: uzak dokunuşların ' + arr + '/' + N + ' varıldı');

  const inP = YOL.walkPlan(wall, 80, 56, 96, 49, { pad: WPAD, bounds: WB });
  ok(YOL.free(wall, inP.x, inP.z, WPAD), 'dokun-yürü: engel içindeki hedef boşa kaymadı');
  rows.push({ name: 'v5 dokun-yürü (oyuncu)', duvar_yeni: nw.arrived ? 'vardı' : 'varmadı', duvar_eski: ow.arrived ? 'vardı' : 'takıldı', uzak_yeni: arr + '/' + N, uzak_eski: oldArr + '/' + N });
}


function oldSim(obst, a0, t, T) {
  const c = { x: a0.x, z: a0.z }; let still = 0, maxStill = 0, sx = c.x, sz = c.z, arrived = false;
  for (let tm = 0; tm < T; tm += DT) {
    const dx = t.x - c.x, dz = t.z - c.z, d = Math.hypot(dx, dz);
    if (d < 0.3) { arrived = true; break; }
    c.x += dx / d * SPEED * DT; c.z += dz / d * SPEED * DT;
    for (const o of obst) { const ox = c.x - o.x, oz = c.z - o.z, q = Math.hypot(ox, oz), m = o.r + 0.4; if (q < m && q > 1e-3) { c.x = o.x + ox / q * m; c.z = o.z + oz / q * m; } }
    if (Math.hypot(c.x - sx, c.z - sz) > 0.1) { sx = c.x; sz = c.z; still = 0; } else { still += DT; maxStill = Math.max(maxStill, still); }
  }
  return { arrived, maxStill: +maxStill.toFixed(1) };
}
{
  const wall = []; for (let i = 0; i < 6; i++) wall.push({ x: 60, z: 40 + i * 4.5, r: 3 });
  const u = []; for (let i = -4; i <= 4; i++) u.push({ x: 80 + i * 2.5, z: 70, r: 1.6 }); for (let k = 1; k <= 5; k++) { u.push({ x: 70, z: 70 - k * 2.5, r: 1.6 }); u.push({ x: 90, z: 70 - k * 2.5, r: 1.6 }); }
  const o1 = oldSim(wall, { x: 50, z: 51 }, { x: 70, z: 51 }, 60), o2 = oldSim(u, { x: 80, z: 63 }, { x: 80, z: 78 }, 60);
  rows.push({ name: 'ESKİ algoritma, 1 duvar (bilgi)', ...o1 }, { name: 'ESKİ algoritma, 2 U (bilgi)', ...o2 });
}
console.log('\nsenaryo tablosu:');
for (const r of rows) console.log(' -', Object.entries(r).map(([k, v]) => k === 'name' ? v : k + '=' + (typeof v === 'number' ? +v.toFixed(2) : v)).join('  '));
console.log(`\nyol: ${pass} geçti, ${fail} hata`);
process.exit(fail ? 1 : 0);
