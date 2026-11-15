

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const srcFiles = ['veri.js', 'gercek.js', 'cekirdek.js', 'hikaye.js'].filter(f => fs.existsSync(path.join(dir, '..', 'src', f)));
const src = srcFiles.map(f => fs.readFileSync(path.join(dir, '..', 'src', f), 'utf8')).join('\n');
const names = ['WORLDS', 'BLD', 'BUILD_ORDER', 'MAPW', 'MAPH', 'newGame', 'tick', 'build', 'canBuild', 'suggestSpot', 'unlockedB', 'currentGoal', 'repair', 'resolve',
  'cargoSuggest', 'explore', 'scan', 'canShield', 'shieldUp', 'shieldCost', 'research', 'techState', 'TECH_ORDER', 'powerOutlook', 'buildOutlook', 'hoursToNight',
  'batteryCap', 'cnt', 'toggle', 'easy', 'demolish', 'undoBuild', 'say', 'stopGainH', 'costOf', 'trainBreak', 'tick0'];
const SB = { console };
const G = vm.runInNewContext(src + `\n;({${names.join(',')}})`, SB);
const AYR = !!process.env.AYRINTI;

let fail = 0, n = 0;
const errs = new Map();
const check = (ok, msg) => { n++; if (!ok) { fail++; errs.set(msg, (errs.get(msg) || 0) + 1); } };
const wc = t => String(t || '').trim().split(/\s+/).filter(Boolean).length;
const okL = (o, k) => !!o && typeof o.tr === 'string' && typeof o.en === 'string' && o.tr.trim() && o.en.trim() && wc(o.tr) <= k && wc(o.en) <= k;
const clone = o => JSON.parse(JSON.stringify(o));
const NIGHT0 = G.WORLDS.ay.night.start * 24, NIGHT1 = NIGHT0 + G.WORLDS.ay.night.len * 24;


function calls(s) {
  for (const p of s.pending.slice()) {
    if (p.type === 'cargo') { const r = G.resolve(s, G.cargoSuggest(s, p.mass), p.pid); if (!r || !r.ok) G.resolve(s, {}, p.pid); }
    else if (G.resolve(s, 0, p.pid) === null) G.resolve(s, 1, p.pid);
  }
}
function put(s, k, at) {
  if (!G.canBuild(s, k).ok) return false;
  let sp = at && at.x != null ? at : G.suggestSpot(s, k);
  if (sp && !G.canBuild(s, k, sp.x, sp.y).ok) sp = G.suggestSpot(s, k);
  if (!sp) return false;
  return G.build(s, k, sp.x, sp.y).ok;
}

function goalAct(s) {
  if (s.t % 2) return;
  const g = G.currentGoal(s); if (!g) return;
  if (g.act === 'build' && g.bk) put(s, g.bk, g.tx != null ? { x: g.tx, y: g.ty } : null);
  else if (g.act === 'repair') { const b = s.b.find(o => o.broken && o.x === g.tx && o.y === g.ty) || s.b.find(o => o.broken); if (b) G.repair(s, b); }
  else if (g.act === 'scan' && g.tx != null) { G.explore(s, g.tx, g.ty); G.scan(s, g.tx, g.ty); }
  else if (g.act === 'walk' && g.id === 'kalkan') { const b = s.b.find(o => G.canShield(s, o)); if (b && s.res.malzeme >= G.shieldCost(s)) G.shieldUp(s, b); }
  else if (g.act === 'walk') { const b = s.b.find(o => o.x === g.tx && o.y === g.ty && !o.on); if (b) G.toggle(s, b); }
  else if (g.act === 'wait') { for (const id of G.TECH_ORDER) if (G.techState(s, id) === 'ok') { G.research(s, id); break; } }
}
function goalBot(s) { calls(s); goalAct(s); }

function warnBot(s, ctx) {
  calls(s);
  for (const w of ctx.inbox.splice(0)) {
    ctx.log.push(w.kind + '@' + w.t);
    if ((w.kind === 'night' || w.kind === 'yaklasan') && w.n) ctx.bat = Math.max(ctx.bat, G.cnt(s, 'batarya') + s.b.filter(b => b.k === 'batarya' && b.left > 0).length + (w.n.addBat || 1));
    if (w.kind === 'over') ctx.pan++;
  }
  const have = s.b.filter(b => b.k === 'batarya').length;
  if (ctx.pan > 0 && put(s, 'gunes')) ctx.pan--;
  else if (have < ctx.bat) put(s, 'batarya');
  else goalAct(s);
}

function carelessBot(s, ctx) {
  calls(s);
  for (const b of s.b) if (b.broken) G.repair(s, b);
  const order = G.BUILD_ORDER.filter(k => G.unlockedB(s, k).ok);
  for (let i = 0; i < order.length; i++) {
    const k = order[(ctx.i + i) % order.length];
    if (put(s, k)) { ctx.i = (ctx.i + i + 1) % order.length; break; }
  }
}
function run(world, level, seed, bot, until) {
  const s = G.newGame(world, level, seed, 'E');
  const ctx = { log: [], bat: 0, pan: 0, i: 0, inbox: [] };
  const out = { firstShed: null, shedPre: 0, shedNight: 0, lifeNight: 0, lifeFirst: null, warnFirst: null, yaklasan: [], kinds: {}, frozen: 0, s, ctx };
  const drain = () => { for (const w of s.fx.pwarn.splice(0)) { ctx.inbox.push(w); out.kinds[w.kind] = (out.kinds[w.kind] || 0) + 1; if (w.kind !== 'hazir' && out.warnFirst == null) out.warnFirst = w.t; if (w.kind === 'yaklasan') out.yaklasan.push(w.t); } };
  let g = 0;
  while (!s.over && s.t < (until || 1e9) && g++ < 5000) {
    bot(s, ctx); drain();
    if (s.over) break;
    G.tick(s); drain();
    if (s.pw.shed > 0) {
      if (out.firstShed == null) out.firstShed = s.t;
      if (s.t < NIGHT0) out.shedPre++;
      if (s.t >= NIGHT0 && s.t < NIGHT1) out.shedNight++;
    }
    const life = s.b.some(b => (b.k === 'oksijen' || b.k === 'su') && b.left === 0 && b.on && !b.broken && b.st === 'guc');
    if (life) { if (s.t >= NIGHT0 && s.t < NIGHT1) out.lifeNight++; if (out.lifeFirst == null) out.lifeFirst = s.t; }
  }
  out.frozen = s.stat.frozen;
  return out;
}
const day = t => t == null ? '-' : `g${Math.floor(t / 24) + 1} (${t})`;


const SEEDS = [1, 2, 3, 4, 5, 6];
const table = [];
for (const seed of SEEDS) {
  const a = run('ay', 'kasif', seed, goalBot, NIGHT1 + 2);
  const b = run('ay', 'kasif', seed, warnBot, NIGHT1 + 2);
  const c = run('ay', 'kasif', seed, carelessBot, NIGHT1 + 2);
  table.push({ seed, a, b, c });
  check(a.shedPre === 0, `hedefi izleyen bot: uzun geceden önce kesinti yok (tohum ${seed}, ilk ${day(a.firstShed)})`);
  check(b.lifeNight === 0, `uyarıya uyan bot: uzun gecede hava ve su makineleri kapanmaz (tohum ${seed}, ${b.lifeNight} saat)`);
  check(c.firstShed == null || (c.warnFirst != null && c.warnFirst <= c.firstShed - 24), `dikkatsiz bot: ilk kesintiden ≥24 saat önce uyarı (tohum ${seed}, uyarı ${day(c.warnFirst)}, kesinti ${day(c.firstShed)})`);
  const shortAtNight = c.shedNight > 0;
  check(!shortAtNight || c.yaklasan.some(t => t < NIGHT0), `dikkatsiz bot: uzun geceden önce 'yaklasan' uyarısı (tohum ${seed})`);
}
console.log('Ay · Kâşif · uzun gece t=' + NIGHT0 + '–' + NIGHT1);
console.log('tohum | hedef: ilk kesinti, gece öncesi/gece kesinti sa, hava-su kapalı sa, donan sera | uyarı: gece kesinti sa, hava-su kapalı sa, batarya | dikkatsiz: ilk uyarı, ilk kesinti, gece kesinti sa, hava-su kapalı sa, yaklasan');
for (const { seed, a, b, c } of table) {
  console.log(`${seed} | ${day(a.firstShed)}, ${a.shedPre}/${a.shedNight}, ${a.lifeNight}, ${a.frozen} | ${b.shedNight}, ${b.lifeNight}, ${G.cnt(b.s, 'batarya')} | ${day(c.warnFirst)}, ${day(c.firstShed)}, ${c.shedNight}, ${c.lifeNight}, ${c.yaklasan.join('/') || '-'}`);
  if (AYR) console.log('   uyarı türleri hedef', JSON.stringify(a.kinds), 'uyarı', JSON.stringify(b.kinds), b.ctx.log.join(' '), 'dikkatsiz', JSON.stringify(c.kinds));
}

check(table.some(r => r.a.shedNight > 0 || r.c.shedNight > 0), 'denge: batarya kurmayan oyuncu uzun gecede sıkıntıyı görür');


{
  const s = G.newGame('ay', 'kasif', 11, 'P');
  G.tick(s);
  const o = G.powerOutlook(s);
  check(['gen', 'need', 'stored', 'cap', 'net', 'hoursLeft', 'over', 'night'].every(k => k in o), 'powerOutlook: alanlar');
  check(o.net === o.gen - o.need && (o.net >= 0 ? o.hoursLeft === Infinity : o.hoursLeft > 0), 'powerOutlook: net ve hoursLeft');
  check(o.night && o.night.inH === G.hoursToNight(s) && o.night.lenH === 96 && typeof o.night.short === 'boolean', 'powerOutlook: Ay gecesi (inH, lenH)');
  const snap = JSON.stringify(s);
  G.powerOutlook(s); G.buildOutlook(s, 'oksijen'); G.buildOutlook(s, 'lab');
  check(JSON.stringify(s) === snap, 'powerOutlook/buildOutlook: s değişmez');

  const t = G.newGame('ay', 'kasif', 12, 'P'); t.res.malzeme = 2000; t.res.parca = 500; t.stage = 2;
  for (const k of ['oksijen', 'su', 'sera', 'lab']) put(t, k);
  for (const b of t.b) b.left = 0;
  t.pop = 12; G.tick(t);
  const ov = G.powerOutlook(t);
  check(ov.over === true, 'powerOutlook: panelsiz tüketiciler → over');
  check(G.buildOutlook(t, 'lab').warn === 'gunduz', 'buildOutlook: daha fazla tüketici → gunduz');
  for (let i = 0; i < 6; i++) put(t, 'gunes');
  for (const b of t.b) b.left = 0;
  G.tick(t);
  const ov2 = G.powerOutlook(t);
  check(ov2.over === false, 'powerOutlook: paneller eklenince over kalkar');
  check(ov2.night && ov2.night.short === true && ov2.night.addBat >= 1 && ov2.night.lastsH < ov2.night.lenH, 'powerOutlook: bataryasız gece kısa, addBat ≥ 1');
  const nb = ov2.night.addBat;
  for (let i = 0; i < nb; i++) put(t, 'batarya');
  for (const b of t.b) b.left = 0;
  G.tick(t);
  const ov3 = G.powerOutlook(t);
  check(ov3.night && (!ov3.night.short || ov3.night.lastsH > ov2.night.lastsH), `powerOutlook: önerilen ${nb} batarya geceyi uzatır/kapatır (${ov2.night.lastsH} → ${ov3.night.lastsH} / ${ov3.night.lenH})`);

  const u = clone(t); u.quiet = true;
  const pr = G.powerOutlook(u).night; let real = null;
  const ts = u.t + pr.inH;
  while (u.t < ts + pr.lenH + 1 && !u.over) { G.tick(u); u.res.o2 = u.res.su = u.res.gida = 999; if (u.t >= ts && u.pw.shed && real == null) real = u.t - ts; }
  const realL = real == null ? pr.lenH : real;
  check(Math.abs(realL - pr.lastsH) <= 2, `powerOutlook: tahmin (${pr.lastsH} sa) gerçekle (${realL} sa) tutar`);

  const m = G.newGame('mars', 'kasif', 3, 'M'); G.tick(m);
  check(G.powerOutlook(m).night === null, 'powerOutlook: Mars night null');
  check(G.buildOutlook(m, 'oksijen').warn !== 'gece', 'buildOutlook: Mars gece uyarısı yok');
}


{

  for (const w of ['ay', 'mars']) {
    const s = G.newGame(w, 'kasif', 21, 'W'); s.res.malzeme = 3000; s.stage = 2; s.pop = 16; G.tick(s); s.fx.pwarn.length = 0; s.radio.length = 0;
    let got = null;
    for (const k of ['oksijen', 'su', 'sera', 'lab', 'spor', 'maden', 'oksijen', 'sera']) { put(s, k); const ov = s.fx.pwarn.find(x => x.kind === 'over'); if (ov) { got = ov; break; } }
    check(!!got && got.k && got.t === s.t && okL(got.m, 12), `uyarı 'over' ${w}: yerleştirmeyle gelir, ≤12 kelime`);
    check(s.radio.some(r => r.from === 'atlas' && /elektrik|power/i.test(r.text.tr + ' ' + r.text.en)), `uyarı 'over' ${w}: ATLAS telsiz satırı`);
    const n0 = s.fx.pwarn.filter(x => x.kind === 'over').length; put(s, 'lab');
    check(s.fx.pwarn.filter(x => x.kind === 'over').length === n0, `uyarı 'over' ${w}: zaten yetmiyorken tekrar gelmez`);
  }

  {
    const s = G.newGame('ay', 'muhendis', 22, 'W'); s.res.malzeme = 3000; s.res.parca = 500; s.stage = 2; G.tick(s); s.fx.pwarn.length = 0;
    for (let i = 0; i < 6; i++) put(s, 'gunes');
    let night = null;
    for (const k of ['oksijen', 'su', 'sera', 'lab', 'yasam', 'spor', 'anten', 'maden']) { put(s, k); night = s.fx.pwarn.find(x => x.kind === 'night'); if (night) break; }
    check(!!night && night.n && night.n.addBat >= 1 && okL(night.m, 12), "uyarı 'night': gece çıkmaz olunca gelir, addBat ve ≤12 kelime");

    const early = clone(s); for (let i = 0; i < 30; i++) put(early, 'batarya'); for (const b of early.b) b.left = 0; G.tick(early);
    check(!early.fx.pwarn.some(x => x.kind === 'hazir') && !early.fx.pwShort, "uyarı 'hazir': gece günler sonraysa onay yok, açık sessizce kapanır");
    while (G.hoursToNight(s) > 90) { s.pending.length = 0; s.res.o2 = s.res.su = s.res.gida = 999; G.tick(s); }
    s.fx.pwarn.length = 0;
    let ready = null;
    for (let i = 0; i < 30 && !ready; i++) { put(s, 'batarya'); for (const b of s.b) b.left = 0; ready = s.fx.pwarn.find(x => x.kind === 'hazir'); if (!ready) { G.tick(s); ready = s.fx.pwarn.find(x => x.kind === 'hazir'); } }
    check(!!ready && okL(ready.m, 12), "uyarı 'hazir': açık kapanınca tek satır onay");
    const q = clone(s); q.quiet = true; q.fx.pwarn = []; q.stage = 2; for (let i = 0; i < 4; i++) put(q, 'lab');
    check(q.fx.pwarn.length === 0, 'uyarı: önizleme (quiet) yazmaz');
    const e = G.newGame('ay', 'kasif', 22, 'T', { train: true }); e.res.malzeme = 3000;
    for (const k of ['oksijen', 'su', 'sera', 'oksijen']) put(e, k);
    check(e.fx.pwarn.length === 0, 'uyarı: eğitimde yazılmaz');
    check(s.fx.pwarn.length <= 6, 'uyarı: kuyruk en çok 6');
  }

  {
    const s = G.newGame('ay', 'kasif', 23, 'Y'); s.res.malzeme = 3000; s.stage = 2;
    for (const k of ['gunes', 'gunes', 'gunes', 'oksijen', 'su', 'sera', 'lab']) put(s, k);
    const seen = [];
    while (s.t < NIGHT0) { s.pending.length = 0; s.res.o2 = s.res.su = s.res.gida = 999; G.tick(s); for (const w of s.fx.pwarn.splice(0)) if (w.kind === 'yaklasan') seen.push(NIGHT0 - w.t); }
    check(JSON.stringify(seen) === JSON.stringify([72, 48, 24, 6]), `uyarı 'yaklasan': 72/48/24/6 saat kala (${seen.join(',')})`);
    const s2 = G.newGame('ay', 'kasif', 23, 'Y'); s2.res.malzeme = 3000; s2.stage = 2;
    for (let i = 0; i < 4; i++) put(s2, 'gunes'); for (let i = 0; i < 8; i++) put(s2, 'batarya');
    const seen2 = [];
    while (s2.t < NIGHT0) { s2.pending.length = 0; s2.res.o2 = s2.res.su = s2.res.gida = 999; G.tick(s2); for (const w of s2.fx.pwarn.splice(0)) seen2.push(w.kind); }
    check(!seen2.includes('yaklasan'), "uyarı 'yaklasan': elektrik yetecekse gelmez");
  }

  {
    const s = G.newGame('ay', 'kasif', 24, 'Y'); s.res.malzeme = 3000; s.stage = 2; for (const k of ['gunes', 'oksijen', 'su']) put(s, k);
    while (G.hoursToNight(s) !== 72) { s.pending.length = 0; s.res.o2 = s.res.su = s.res.gida = 999; G.tick(s); }
    G.tick(s);
    const o = G.powerOutlook(s);
    check(o.night.inH === 71, 'powerOutlook: inH saat saat azalır');
  }
}



{

  function planBot(s, ctx) {
    calls(s);
    for (const w of ctx.inbox.splice(0)) {
      if ((w.kind === 'night' || w.kind === 'yaklasan' || w.kind === 'over') && w.n && (w.n.plan.length || w.n.stop)) {
        ctx.todo = (w.n.plan || []).map(p => ({ k: p.k, n: p.n }));
        ctx.stop = w.n.stop;
        ctx.plans.push(JSON.stringify(w.n.plan) + '@' + w.t);
        for (const p of w.n.plan || []) if (p.k === 'gunes' && w.n.inH === 0) ctx.panelAtNight++;
      }
      if (/güneş paneli|solar panel/i.test(((w.m && w.m.tr) || '') + ' ' + ((w.m && w.m.en) || '')) && G.hoursToNight(s) === 0) ctx.panelAtNight++;
    }
    const o = G.powerOutlook(s), n = o.night;
    if (n && n.inH === 0 && n.short && n.stop) { const b = s.b.find(x => x.id === n.stop.bid); if (b && b.on) { G.toggle(s, b); ctx.stops++; } }
    if (ctx.todo.length) {
      const it = ctx.todo[0];
      if (put(s, it.k)) { if (--it.n <= 0) ctx.todo.shift(); return; }
      if (s.res.malzeme < G.costOf(s, it.k).m && ctx.stop) { const b = s.b.find(x => x.id === ctx.stop.bid); if (b && b.on) { G.toggle(s, b); ctx.stops++; } ctx.stop = null; }
      return;
    }
    goalAct(s);
  }
  const rows = [];
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const s = G.newGame('ay', 'kasif', seed, 'E');
    const ctx = { inbox: [], todo: [], stop: null, plans: [], stops: 0, panelAtNight: 0 };
    let shedN = 0, shortAt = null, flips = 0, flips0 = 0, lastReady = null, upTrue = 0, g = 0;
    const drain = () => { for (const w of s.fx.pwarn.splice(0)) ctx.inbox.push(w); };
    while (!s.over && s.t < NIGHT1 + 2 && g++ < 5000) {
      planBot(s, ctx); drain(); if (s.over) break;
      G.tick(s); drain();
      if (s.t >= NIGHT0 && s.t < NIGHT1 && s.pw.shed > 0) shedN++;
      if (s.t === NIGHT0 - 12) shortAt = G.powerOutlook(s).night.short;
      const r = G.powerOutlook(s).night; const nC = s.b.filter(b => (G.BLD[b.k].kw || 0) > 0).length;
      if (r) { if (lastReady === true && r.ready === false && r.inH > 0) { flips++; if (nC === ctx.nC) flips0++; } if (lastReady === false && r.ready === true) upTrue++; lastReady = r.ready; }
      ctx.nC = nC;
      if (AYR && seed === +process.env.AYRINTI) console.log(s.t, 'm', Math.round(s.res.malzeme), JSON.stringify(r && { s: r.short, l: r.lastsH, p: r.plan, st: r.stop, rd: r.ready }), s.b.filter(b => b.left > 0).map(b => b.k).join(','));
      if (r && r.inH === 0) check(r.plan.length === 0, `plan: gece sürerken plan boş (tohum ${seed}, t=${s.t})`);
    }
    rows.push(`${seed} | kesinti ${shedN} sa | gece−12: short=${shortAt} | planlar ${ctx.plans.join(' ')} | durdurma ${ctx.stops} | ready düşüş ${flips}/${flips0}`);
    check(shedN === 0, `öneriye uyan kazanır: uzun gecede kesinti yok (tohum ${seed}, ${shedN} sa)`);
    check(shortAt === false, `öneriye uyan kazanır: gece başlamadan 12 saat önce short=false (tohum ${seed})`);
    check(ctx.panelAtNight === 0, `gecede panel önerisi yok (tohum ${seed})`);
    check(flips <= 2 && flips0 === 0, `yanıp sönme yok: ready true→false en çok 2, yeni tüketici olmadan 0 (tohum ${seed}, ${flips}/${flips0})`);
  }
  console.log('\nv5f öneriye uyan bot (Ay, Kâşif)'); rows.forEach(r => console.log(r));


  let e1n = 0;
  for (const seed of [1, 2, 3, 4]) {
    const s = G.newGame('ay', 'kasif', seed, 'E');
    const ctx = { inbox: [], todo: [], stop: null, plans: [], stops: 0, panelAtNight: 0 };
    let g = 0; const drain = () => { s.fx.pwarn.length = 0; };
    while (!s.over && s.t < NIGHT0 - 80 && g++ < 5000) { goalBot(s); drain(); G.tick(s); drain(); }
    s.res.malzeme = Math.max(s.res.malzeme, 400); for (const k of ['lab', 'sera', 'spor', 'lab']) put(s, k);
    while (!s.over && s.t < NIGHT0 - 72) { calls(s); s.res.o2 = s.res.su = s.res.gida = 999; G.tick(s); drain(); }
    const p0 = JSON.stringify(G.powerOutlook(s).night.plan), n0 = G.powerOutlook(s).night;
    if (!n0.short || !n0.plan.length) continue;
    e1n++;
    check(n0.cost === n0.plan.reduce((m, p) => m + G.costOf(s, p.k).m * p.n, 0), `E1/E2: night.cost planın malzemesi (tohum ${seed})`);
    const seen = [], pop0 = s.pop;
    for (let h = 0; h < 24 && !s.over; h++) { calls(s); s.res.o2 = s.res.su = s.res.gida = 999; for (const b of s.b) if (b.broken) G.repair(s, b); G.tick(s); drain(); const n = G.powerOutlook(s).night; if (s.pop === pop0 && !s.b.some(b => b.broken)) seen.push(n.short ? JSON.stringify(n.plan) : "ok"); if (process.env.E1D) console.log(s.t, s.pop, n.inH, n.lastsH, JSON.stringify(n.plan), JSON.stringify(s.pwPlan)); }
    check(seen.length >= 6 && seen.every(x => x === p0 || x === 'ok'), `E1: hiçbir şey kurmayınca plan 24 saat aynı (tohum ${seed}, ${p0} → ${[...new Set(seen)].join(' | ')})`);
  }
  check(e1n > 0, `E1: en az bir tohumda 72 saat kala plan vardı (${e1n})`);


  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const s = G.newGame('ay', 'kasif', seed, 'E');
    const ctx = { inbox: [], todo: [], stop: null, plans: [], stops: 0, panelAtNight: 0 };
    let g = 0, planned = false, doneT = null;
    const drain = () => { for (const w of s.fx.pwarn.splice(0)) ctx.inbox.push(w); };
    while (!s.over && s.t < NIGHT0 - 60 && g++ < 5000) { planBot(s, ctx); drain(); G.tick(s); drain(); }

    s.res.malzeme = Math.max(s.res.malzeme, 800);
    for (const k of ['lab', 'sera', 'spor']) put(s, k);
    for (let i = 0; i < 40 && !s.over; i++) {
      calls(s); s.res.o2 = s.res.su = s.res.gida = 999;
      const n = G.powerOutlook(s).night;
      if (n && n.short && n.plan.length) { planned = true; const p = n.plan[0]; s.res.malzeme = Math.max(s.res.malzeme, 400); put(s, p.k); }
      else if (planned && n && !n.short && !s.b.some(b => b.left > 0)) { doneT = s.t; break; }
      G.tick(s);
    }
    let bad = [];
    if (doneT != null) for (let h = 0; s.t < NIGHT0 && !s.over && h < 200; h++) {
      calls(s); s.res.o2 = s.res.su = s.res.gida = 999; for (const b of s.b) if (b.broken) G.repair(s, b);
      if ((s.t - doneT) % 6 === 0) { const n = G.powerOutlook(s).night; if (n && n.inH > 0 && n.short) bad.push(s.t); }
      G.tick(s);
    }
    check(!planned || doneT != null, `v5g plan kuruldu ve short=false oldu (tohum ${seed})`);
    check(bad.length === 0, `v5g plan kurulduktan sonra geceye kadar her 6 saatte short=false (tohum ${seed}, kısa: ${bad.join(',')})`);

    if (doneT != null && !s.over) { const c0 = G.powerOutlook(s).night; check(!!c0, `v5g gece penceresi var (tohum ${seed})`); }
  }


  {
    const r = run('ay', 'kasif', 3, goalBot, NIGHT1 + 2);
    check(r.shedNight > 0, 'öneriye uymayan: uzun gecede kesinti olur');
    check(r.s.learn && r.s.learn.t_kesinti != null, 'öneriye uymayan: first:kesinti Bilgisi gelir');
  }


  for (const seed of [11, 12, 13]) {
    const s = G.newGame('ay', 'kasif', seed, 'P'); s.res.malzeme = 3000; s.stage = 2;
    for (const k of ['gunes', 'gunes', 'oksijen', 'su', 'sera', 'lab', 'maden']) put(s, k);
    for (let i = 0; i < 40; i++) { s.pending.length = 0; s.res.o2 = s.res.su = s.res.gida = 999; G.tick(s); }
    const tot = o => o.night.plan.reduce((a, p) => a + p.n, 0);
    let o = G.powerOutlook(s);
    check(o.night.short && o.night.plan.length > 0, `tekdüzelik: başlangıçta plan var (tohum ${seed})`);
    check(o.night.addBat === ((o.night.plan.find(p => p.kind === 'batarya') || {}).n || 0) && o.night.addGen === ((o.night.plan.find(p => p.kind === 'uretim') || {}).k || null), `plan: addBat/addGen planla tutarlı (tohum ${seed})`);
    check(o.night.plan.every((p, i, a) => i === 0 || (a[0].kind === 'uretim' && p.kind === 'batarya')), `plan: sıra önce uretim sonra batarya (tohum ${seed})`);
    let guard = 0, ok = true, prev = tot(o);
    while (o.night.plan.length && guard++ < 60) {
      const p = o.night.plan[0];
      if (!put(s, p.k)) break;
      o = G.powerOutlook(s);
      if (tot(o) > prev - 1 + 0) ok = ok && tot(o) <= prev;
      prev = tot(o);
    }
    check(ok, `tekdüzelik: adım kurulunca plan toplamı artmaz (tohum ${seed})`);
    check(!o.night.short || o.night.plan.length === 0, `tekdüzelik: plan tamamlanınca short=false (tohum ${seed})`);

    const u = clone(s); let ready = false;
    for (let i = 0; i < 30 && !ready; i++) { u.pending.length = 0; u.res.o2 = u.res.su = u.res.gida = 999; G.tick(u); ready = G.powerOutlook(u).night.ready; }
    check(ready, `ready: plan bitince 6 saat kararlı olunca true (tohum ${seed})`);
  }


  {
    const s = G.newGame('ay', 'kasif', 31, 'S'); s.res.malzeme = 3000; s.stage = 2;
    for (const k of ['gunes', 'gunes', 'oksijen', 'su', 'sera', 'lab', 'anten', 'maden']) put(s, k);
    while (G.hoursToNight(s) > 0 || s.t < NIGHT0 + 4) { s.pending.length = 0; s.res.o2 = s.res.su = s.res.gida = 999; G.tick(s); }
    const n = G.powerOutlook(s).night;
    check(n.inH === 0 && n.plan.length === 0, 'gece: plan boş');
    check(!!n.stop && !['oksijen', 'su', 'sera', 'yasam', 'geri', 'hub'].includes(n.stop.k) && Number.isInteger(n.stop.gainH) && n.stop.gainH > 0, `gece: stop yaşam dışı yapı, gainH tam sayı (${n.stop && n.stop.k}, ${n.stop && n.stop.gainH})`);
    const b = s.b.find(x => x.id === n.stop.bid);
    check(G.stopGainH(s, b) === n.stop.gainH, 'stopGainH = stop.gainH');
    const m = G.newGame('mars', 'kasif', 3, 'M'); G.tick(m);
    check(G.stopGainH(m, m.b[0]) === 0, 'stopGainH: Mars (gece yok) 0');
  }


  {
    const t = G.newGame('ay', 'kasif', 12, 'P'); t.res.malzeme = 2000; t.stage = 2; t.pop = 12;
    for (const k of ['oksijen', 'su', 'sera', 'lab', 'lab']) put(t, k);
    for (const b of t.b) b.left = 0; G.tick(t);
    check(G.buildOutlook(t, 'batarya').warn === null, 'buildOutlook(batarya).warn null');
  }


  {
    const e = G.newGame('ay', 'kasif', 41, 'T', { train: true }); e.res.malzeme = 3000; e.stage = 2;
    for (const k of ['gunes', 'oksijen', 'su', 'sera']) put(e, k);
    for (let i = 0; i < 6; i++) G.tick(e);
    e.fx.pwarn.length = 0; e.radio.length = 0;
    const bid = G.trainBreak(e, 'gunes');
    for (let i = 0; i < 3; i++) G.tick(e);
    const kinds = e.fx.pwarn.map(w => w.kind);
    check(kinds.includes('ariza') && !kinds.some(k => ['over', 'night', 'yaklasan', 'hazir'].includes(k)), `eğitim: yalnız 'ariza' (${kinds.join(',')})`);
    const w = e.fx.pwarn.find(x => x.kind === 'ariza');
    check(w && w.bid === bid && w.k === 'gunes' && okL(w.m, 12) && /bozuk/.test(w.m.tr) && /broken/.test(w.m.en), "'ariza': bid, k, metin");
    check(e.fx.pwarn.filter(x => x.kind === 'ariza').length === 1, "'ariza': bir arıza için bir kez");
  }


  {
    const s = G.newGame('ay', 'kasif', 23, 'Y'); s.res.malzeme = 3000; s.stage = 2;
    for (const k of ['gunes', 'gunes', 'gunes', 'oksijen', 'su', 'sera', 'lab']) put(s, k);
    const said = {}; let planTxt = true;
    while (s.t < NIGHT0) {
      s.pending.length = 0; s.res.o2 = s.res.su = s.res.gida = 999; s.radio.length = 0; G.tick(s);
      for (const w of s.fx.pwarn.splice(0)) if (w.kind === 'yaklasan' && w.n.plan.length) planTxt = planTxt && /Plan:/.test(w.m.tr) && w.n.plan.every(p => w.m.tr.includes(String(p.n)));
      for (const r of s.radio) if (r.from === 'atlas' && /Elektrik uyarısı/.test(r.title ? r.title.tr : '')) { const d = Math.floor(s.t / 24); said[d] = (said[d] || 0) + 1; }
    }
    check(Object.values(said).every(v => v <= 1), `telsiz: günde en çok bir elektrik uyarısı (${JSON.stringify(said)})`);
    check(planTxt, "telsiz: 'yaklasan' metni plandaki sayıları söyler");
  }
}


{
  let hit = 0, seen = 0;
  for (const seed of [51, 52, 53]) {
    const s = G.newGame('ay', 'kasif', seed, 'H'); s.res.malzeme = 3000; s.res.parca = 500; s.stage = 2;
    for (const k of ['gunes', 'gunes', 'oksijen', 'su', 'sera', 'lab', 'oksijen', 'su']) put(s, k);
    let g = null;
    for (let i = 0; i < 400 && s.t < NIGHT0 - 2; i++) {
      s.pending.length = 0; s.res.o2 = s.res.su = s.res.gida = 999; s.res.malzeme = Math.max(s.res.malzeme, 3000); G.tick(s);
      g = G.currentGoal(s);
      if (!g || g.id !== 'pil') continue;
      seen++;
      const pn = G.powerOutlook(s).night, nb = pn && pn.short ? pn.addBat : 0;
      if (nb > 2) { hit++; check(g.k.tr === `${nb} batarya kur` && g.k.en === `Build ${nb} batteries`, `hedef plandaki batarya sayısını söyler (${nb}): ${g.k.tr}`); }
      else check(/İki batarya kur/.test(g.k.tr), `plan 2'yi aşmıyorsa hedef 'İki batarya kur' kalır: ${g.k.tr}`);
    }
    if (g && g.id === 'pil') { put(s, 'batarya'); put(s, 'batarya'); for (let i = 0; i < 12; i++) { s.pending.length = 0; s.res.o2 = s.res.su = s.res.gida = 999; G.tick(s); }
      const g2 = G.currentGoal(s); check(!g2 || g2.id !== 'pil', `2 batarya kurulunca batarya hedefi tamamlanır (koşul aynı): ${g2 && g2.id}`); }
  }
  check(seen > 0, 'test kurulumu: batarya hedefi görüldü');
  check(hit > 0, `test kurulumu: hedef batarya iken gece planı 2'den çok batarya istedi (görülen ${seen})`);
}



{
  const sig = o => JSON.stringify({ short: !!(o.night && o.night.short), plan: o.night ? o.night.plan : null, lastsH: o.night && o.night.lastsH });
  let cmp = 0, shortCase = 0, readyCase = 0;
  for (const seed of [61, 62, 63]) {
    for (const extra of [[], ['sera', 'lab'], ['gunes', 'gunes', 'gunes', 'gunes', 'batarya', 'batarya', 'batarya', 'batarya', 'batarya', 'batarya', 'batarya', 'batarya']]) {
      const s = G.newGame('ay', 'kasif', seed, 'K'); s.res.malzeme = 3000; s.res.parca = 500; s.stage = 2;
      for (const k of ['gunes', 'gunes', 'oksijen', 'su', 'sera', 'lab', ...extra]) put(s, k);
      while (s.t < NIGHT0 - 60) { s.pending.length = 0; s.res.o2 = s.res.su = s.res.gida = 999; for (const b of s.b) b.broken = false; G.tick(s); }
      for (const b of s.b) b.broken = false;
      for (const k of ['lab', 'sera', 'oksijen', 'gunes']) {
        const b = s.b.find(o => o.k === k && o.left === 0); if (!b) continue;
        const o1 = G.powerOutlook(s), net1 = o1.net;
        b.broken = true; const o2 = G.powerOutlook(s); b.broken = false;
        if (k === 'gunes') { check(!(o1.night && o1.night.short) || (o2.night && o2.night.short), `bozuk üretici gece öngörüsünü iyileştirmez (${seed}/${k})`); continue; }
        cmp++; if (o1.night && o1.night.short) shortCase++;
        check(sig(o1) === sig(o2), `bozuk tüketici (${k}) gece öngörüsünü değiştirmez: sağlam ${sig(o1)} · bozuk ${sig(o2)}`);
        check(o1.net === net1 && G.powerOutlook(s).net === net1, `anlık denge (net) değişmez (${k})`);
      }

      const lab = s.b.find(o => o.k === 'lab' && o.left === 0);
      if (lab) {
        lab.broken = true; let ready = false;
        for (let h = 0; h < 10 && s.t < NIGHT0 - 4; h++) { s.pending.length = 0; s.res.o2 = s.res.su = s.res.gida = 999; for (const b of s.b) if (b !== lab) b.broken = false; lab.broken = true; G.tick(s); const o = G.powerOutlook(s); ready = ready || !!(o.night && o.night.ready); }
        const before = G.powerOutlook(s).night;
        lab.broken = false; lab.st = 'ok'; s.pending.length = 0; G.tick(s);
        const after = G.powerOutlook(s).night;
        if (ready) { readyCase++; check(after && !after.short, `bozuk tüketiciyle "hazırsın" olduysa onarım "yetmeyecek" getirmez (önce ${JSON.stringify(before && { sh: before.short, r: before.ready })}, sonra short=${after && after.short})`); }
        else check(!before || before.short === (after && after.short) || !(after && after.short) || before.short, `onarım short'u false → true çevirmez (${seed})`);
      }
    }
  }
  check(cmp >= 6, `test kurulumu: bozuk/sağlam tüketici karşılaştırması (${cmp})`);
  check(readyCase > 0, `test kurulumu: bozuk tüketiciyle 'hazırsın' durumu denendi (${readyCase})`);
  check(shortCase > 0, `test kurulumu: gece yetmezken bozuk tüketici durumu da denendi (${shortCase})`);
  if (AYR) console.log('bozuk tüketici:', { cmp, shortCase, readyCase });
}

console.log(`\nenerji: ${n} kontrol, ${fail} hata`);
if (fail) { for (const [m, c] of errs) console.log(' HATA ' + (c > 1 ? `(${c}×) ` : '') + m); process.exit(1); }
console.log('Tüm kontroller geçti');
