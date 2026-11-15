'use strict';

const MAPW = 24, MAPH = 15, HUBX = 12, HUBY = 7;
const PRIO_LIST = ['hub', 'oksijen', 'su', 'geri', 'yasam', 'sera', 'anten', 'spor', 'maden', 'atolye', 'lab', 'gunes', 'batarya', 'reaktor', 'pist'];
const PRIO = {}; PRIO_LIST.forEach((k, i) => PRIO[k] = i);
const LIFE = { hub: 1, oksijen: 1, su: 1, geri: 1, yasam: 1, sera: 1 };
const RES_KEYS = ['o2', 'su', 'gida', 'malzeme', 'parca', 'bilim'];

const idx = (x, y) => y * MAPW + x;
const inMap = (x, y) => x >= 0 && y >= 0 && x < MAPW && y < MAPH;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

function rnd(s) {
  s.rs = (s.rs + 0x6D2B79F5) | 0;
  let t = Math.imul(s.rs ^ (s.rs >>> 15), 1 | s.rs);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const rint = (s, a, b) => a + Math.floor(rnd(s) * (b - a + 1));
const rpick = (s, arr) => arr[Math.floor(rnd(s) * arr.length)];

const tileAt = (s, x, y) => inMap(x, y) ? s.map.k[idx(x, y)] : null;
const isSeen = (s, x, y) => inMap(x, y) && s.map.seen[idx(x, y)] === 1;
const bAt = (s, x, y) => s.b.find(b => b.x === x && b.y === y);
const dayOf = s => Math.floor(s.t / 24) + 1;
const hourOf = s => s.t % 24;
const bname = (s, k) => (BLD[k].nameW ? BLD[k].nameW[s.world] : BLD[k].name);
const bfact = (s, k) => (BLD[k].factW ? BLD[k].factW[s.world] : BLD[k].fact);
const easy = s => s.level === 'kasif';

const dw = s => s.world === 'mars' ? L('sol', 'sols') : L('gün', 'days');

const dosePct = s => Math.round(clamp(s.dose / LIMIT_DOSE, 0, 9.99) * 1000) / 10;


function moodBump(s, n, why) { s.moral = clamp(s.moral + n, 0, 100); s.mmod += n; if (n < 0 && why) moodHit(s, why, -n); }

function moodHit(s, why, v) { if (!s.stat.moodHit) s.stat.moodHit = {}; s.stat.moodHit[why] = (s.stat.moodHit[why] || 0) + v; }
const MOOD_EV = { tahliye: L('eve gönderilen ekip arkadaşı', 'a crewmate sent home') };
function moodNames(s, k) {
  const h = s.stat.moodHit || {}, ids = Object.keys(h).sort((a, b) => h[b] - h[a]).slice(0, k || 3);
  const nm = id => MOOD_EV[id] || (EVENTS[id] && EVENTS[id].title) || null;
  const list = ids.map(nm).filter(Boolean).map(x => L(x.tr.replace(/!$/, ''), x.en.replace(/!$/, '')));
  return list.length ? L(list.map(x => x.tr).join(', '), list.map(x => x.en).join(', ')) : null;
}


function radAmt(s, v, d, plus) {
  if (easy(s)) { const p = v / LIMIT_DOSE * 100, a = p >= 1.5 ? String(Math.round(p)) : p.toFixed(1); return L(`güvenli sınırın %${a.replace('.', ',')} kadarı`, `${a}% of the safe limit`); }
  const a = (plus ? '+' : '') + v.toFixed(d == null ? 0 : d); return L(`${a.replace('.', ',')} mSv`, `${a} mSv`);
}
function cnt(s, k, working) {
  let n = 0;
  for (const b of s.b) if (b.k === k && b.left === 0 && (!working || b.st === 'ok')) n++;
  return n;
}
function log(s, msg, c) {
  if (s.quiet) return;
  s.log.push({ t: s.t, m: msg, c: c || 'info' });
  if (s.log.length > 90) s.log.shift();
  s.logN = (s.logN || 0) + 1;
}


function genMap(s) {
  const n = MAPW * MAPH;
  const k = new Array(n).fill('.'), seen = new Array(n).fill(0), v = new Array(n);
  for (let i = 0; i < n; i++) v[i] = Math.floor(rnd(s) * 1000);
  const dist = (x, y) => Math.hypot(x - HUBX, y - HUBY);
  const cluster = (kind, count, dmin, dmax) => {
    for (let tries = 0; tries < 400; tries++) {
      const x = rint(s, 1, MAPW - 2), y = rint(s, 1, MAPH - 2), d = dist(x, y);
      if (d < dmin || d > dmax || k[idx(x, y)] !== '.') continue;
      k[idx(x, y)] = kind;
      let placed = 1, guard = 0, px = x, py = y;
      while (placed < count && guard++ < 40) {
        const nx = px + rint(s, -1, 1), ny = py + rint(s, -1, 1);
        if (!inMap(nx, ny) || k[idx(nx, ny)] !== '.' || dist(nx, ny) < 2) continue;
        k[idx(nx, ny)] = kind; placed++; px = nx; py = ny;
      }
      return;
    }
  };
  cluster('i', 2, 2.6, 4.0); cluster('i', 3, 6, 9); cluster('i', 2, 7.5, 12);
  cluster('m', 2, 2.4, 4.0); cluster('m', 3, 6, 9.5); cluster('m', 2, 7, 12);
  cluster('t', 2, 4.8, 6.5); cluster('t', 2, 7.5, 11);
  cluster('s', 1, 5.5, 8); cluster('s', 1, 7, 11); cluster('s', 1, 8, 13);

  for (let tries = 0; tries < 2000 && k.filter(c => c === 's').length < 3; tries++) {
    const x = rint(s, 1, MAPW - 2), y = rint(s, 1, MAPH - 2), d = dist(x, y);
    if (d >= 5.5 && d <= 13 && k[idx(x, y)] === '.') k[idx(x, y)] = 's';
  }
  for (let i = 0; i < 46; i++) {
    const x = rint(s, 0, MAPW - 1), y = rint(s, 0, MAPH - 1);
    if (dist(x, y) < 2.3 || k[idx(x, y)] !== '.') continue;
    k[idx(x, y)] = rnd(s) < 0.45 ? 'c' : 'r';
  }
  for (let y = 0; y < MAPH; y++) for (let x = 0; x < MAPW; x++) if (dist(x, y) <= 4.6) seen[idx(x, y)] = 1;
  s.map = { k, seen, v };
}
function reveal(s, cx, cy, r) {
  const found = {};
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if (!inMap(x, y) || Math.hypot(x - cx, y - cy) > r) continue;
      const i = idx(x, y);
      if (s.map.seen[i]) continue;
      s.map.seen[i] = 1; s.mapV = (s.mapV || 0) + 1;
      const t = s.map.k[i];
      if (t !== '.' && t !== 'r' && t !== 'c') found[t] = (found[t] || 0) + 1;
    }
  return found;
}



const CK_KASIF_M = 1.3, CK_KASIF_DIG = 1.25;
function newGame(world, level, seed, name, opts) {
  const W = WORLDS[world];
  const k = level === 'kasif' ? 1.3 : 1;
  const s = {
    v: 3, world, level, name: String(name || '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX), seed, rs: seed | 0, t: 7,
    res: { o2: W.start.o2 * k, su: W.start.su * k, gida: W.start.gida * k, malzeme: Math.round(W.start.malzeme * k * (level === 'kasif' ? CK_KASIF_M : 1)), parca: Math.round(W.start.parca * k), bilim: 0 },
    core: 0, pop: 4, moral: 65, mmod: 0, dose: W.startDose, stored: 24,
    b: [], nid: 1, techs: {}, done: {}, pending: [], pidN: 1, decT: -99, log: [], logN: 0,
    radio: [], radioN: 0, quiz: { open: [], done: {} }, tags: {}, bank: {}, scanned: {}, picked: {},
    story: { ch: 0, beats: {}, relics: {}, last: -99, held: [], react: {}, goalQ: [], goalT: -99 }, unl: {},
    rate: {}, selfE: 0, short: { o2: 0, su: 0, gida: 0 },
    pw: { gen: 0, use: 0, need: 0, cap: 30, shed: 0, sun: 1 }, idle: 0,
    storm: null, stormWarned: false, fx: { busy: [], chapter: 0, chapterT: 7, cleanUntil: 0, crowdH: 0, spend: [], teach: [], pwarn: [] }, seenInfo: {}, learn: {},
    hist: [], lastEv: '', over: null, free: false, mapV: 0, stage: 1,
    mut: { lvl: 0, low: 0, good: 0, at: -99, max: 0 },
    stat: { evac: 0, black: 0, blackDark: 0, hours: 0, sh: { o2: 0, su: 0, gida: 0 }, causes: [], quizOk: 0, quizN: 0,
      flares: 0, flareOpen: 0, flareDose: 0, built: 0, moralSum: 0, explored: 0, storms: 0, ships: 0, frozen: 0, repairs: 0,
      scans: 0, relics: 0, collects: 0, defaults: 0, genEver: false, choices: [], wqN: 0, wqOk: 0, wqSkip: 0, drones: 0, qeN: 0, qeOk: 0, qeBad: 0, pwarn: 0 },
    wq: { ev: [], n: 0, last: -99, asked: {}, cur: null, qa: {}, bp: 0, bq: 0 }, ach: {}, achP: {},
  };
  const o = opts || {};
  if (o.ach && typeof o.ach === 'object') for (const id in o.ach) if (o.ach[id]) s.achP[id] = 1;
  if (o.train === true) s.train = true;
  for (const r of RES_KEYS) s.rate[r] = { p: 0, c: 0 };
  genMap(s);
  s.b.push({ id: s.nid++, k: 'hub', x: HUBX, y: HUBY, left: 0, on: true, broken: false, shield: 0, shLeft: 0, st: 'ok' });
  s.shipAt = (W.firstShip || W.shipEvery) * 24 + 12;
  s.nextFlare = rint(s, W.firstFlare[0], W.firstFlare[1]) * 24 + rint(s, 0, 20);
  s.nextStorm = W.storm ? rint(s, W.storm.first[0], W.storm.first[1]) * 24 + rint(s, 0, 20) : 0;
  s.nextEv = 60 + rint(s, 0, 24);
  if (s.train) {
    const cs = STAGE1.map(k => costOf(s, k).m).sort((a, b) => b - a);
    s.res.malzeme = Math.max(s.res.malzeme, cs[0] + cs[1]); s.res.parca = Math.max(s.res.parca, 12);
  }
  bankOpen(s, 'b:hub');
  noteTag(s, 'd:1');
  log(s, L('İniş başarılı. Üs kuruluyor: önce güç, hava ve su.', 'Touchdown confirmed. Setting up base: power, air and water first.'), 'good');
  return s;
}


const RADIO_MAX = 100;



const NAME_MAX = 18;
function cmdName(s) {
  const n = String((s && s.name) || '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
  return n ? L(n, n) : L('Komutan', 'Commander');
}
function fillName(s, o) {
  if (!o || typeof o !== 'object' || typeof o.tr !== 'string' || (o.tr.indexOf('{ad}') < 0 && String(o.en).indexOf('{ad}') < 0)) return o;
  const n = cmdName(s), out = Object.assign({}, o);
  out.tr = o.tr.split('{ad}').join(n.tr); out.en = String(o.en).split('{ad}').join(n.en);
  return out;
}
function say(s, from, title, text, opts) {
  if (s.quiet) return null;
  const o = opts || {};
  const e = { n: 0, t: s.t, from, title: fillName(s, title), text: fillName(s, text), c: o.c || 'info' };
  for (const key of ['fact', 'src', 'res', 'call', 'beat', 'ev', 'def', 'who', 'hint', 'mut', 'goal']) if (o[key] != null) e[key] = key === 'hint' ? fillName(s, o[key]) : o[key];
  if (from === 'mc' && conjOn(s)) { s.story.held.push(e); return null; }
  e.n = ++s.radioN;
  s.radio.push(e);
  if (s.radio.length > RADIO_MAX) s.radio.shift();
  return e;
}
function bankOpen(s, id) {
  if (s.bank[id] != null) return false;
  s.bank[id] = s.t;
  return true;
}

function noteTag(s, tag) {
  if (s.tags[tag] != null) return false;
  s.tags[tag] = s.t;
  for (const g of realBank()) if (g.tag === tag) bankOpen(s, g.id);
  QUIZ.forEach((q, i) => {
    if (q.tag !== tag || (q.w && q.w !== s.world) || (q.lv === 2 && easy(s))) return;
    if (s.quiz.done[i] != null || s.quiz.open.includes(i)) return;
    s.quiz.open.push(i);
  });
  return true;
}

function answerQuiz(s, qi, choice) {
  const at = s.quiz.open.indexOf(qi);
  if (at < 0) return null;
  s.quiz.open.splice(at, 1);
  const ok = choice === 0;
  s.quiz.done[qi] = ok ? 1 : 0;
  s.stat.quizN++;
  if (ok) { s.stat.quizOk++; s.res.bilim += 6; moodBump(s, MOOD.soru); }
  return { ok, expl: QUIZ[qi].e };
}

function conjOn(s) {
  const C = WORLDS[s.world].conj;
  if (!C) return false;
  const d = dayOf(s);
  return d >= C.from && d < C.from + C.len;
}


function relicTiles(s) {
  const out = [];
  for (let i = 0; i < s.map.k.length; i++) if (s.map.k[i] === 's') out.push({ x: i % MAPW, y: Math.floor(i / MAPW) });
  const d = o => Math.hypot(o.x - HUBX, o.y - HUBY);
  out.sort((a, b) => d(a) - d(b) || a.y - b.y || a.x - b.x);
  return out.slice(0, 3).map((o, i) => ({ x: o.x, y: o.y, idx: i }));
}
function relicAt(s, x, y) {
  const r = relicTiles(s).find(o => o.x === x && o.y === y);
  return r ? r.idx : -1;
}

function explore(s, x, y) {
  const before = s.mapV;
  const f = reveal(s, x, y, 2.6);
  s.stat.explored += s.mapV - before;
  return f;
}
function scanInfo(s, x, y) {
  if (!inMap(x, y) || !isSeen(s, x, y)) return null;
  const k = tileAt(s, x, y);
  if (!SCANS[k]) return null;
  const done = !!s.scanned[idx(x, y)];
  if (k === 's') {
    const r = relicAt(s, x, y);
    if (r < 0) return null;
    return { kind: 's', relic: r, done, name: done ? STORY[s.world].relics[r].name : SCANS.s.name };
  }
  return { kind: k, done, name: SCANS[k].name };
}
function revealIce(s, near) {
  const ice = [];
  for (let i = 0; i < s.map.k.length; i++) if (s.map.k[i] === 'i') ice.push({ x: i % MAPW, y: Math.floor(i / MAPW) });
  if (!ice.length) return 0;
  if (near) {
    const fresh = ice.filter(o => !isSeen(s, o.x, o.y));
    const pool = fresh.length ? fresh : ice;
    pool.sort((a, b) => Math.hypot(a.x - near.x, a.y - near.y) - Math.hypot(b.x - near.x, b.y - near.y));
    const f = reveal(s, pool[0].x, pool[0].y, 1.6);
    return Object.keys(f).length;
  }
  for (const o of ice) reveal(s, o.x, o.y, 1);
  return ice.length;
}
function scan(s, x, y) {
  const inf = scanInfo(s, x, y);
  if (!inf) return { ok: false, why: 'yok' };
  if (inf.done) return { ok: false, why: 'done', kind: inf.kind };
  s.scanned[idx(x, y)] = 1; s.stat.scans++;
  let out;
  if (inf.kind === 's') {
    const R = STORY[s.world].relics[inf.relic], rw = R.reward || {};
    const bil = 12 + (rw.bilim || 0);
    s.res.bilim += bil;
    if (rw.parca) s.res.parca += rw.parca;
    if (rw.malzeme) s.res.malzeme += rw.malzeme;
    if (rw.reveal === 'ice1') revealIce(s, { x, y });
    if (rw.reveal === 'iceAll') revealIce(s, null);
    s.story.relics[inf.relic] = s.t; s.stat.relics++;
    bankOpen(s, 'r:' + inf.relic);
    noteTag(s, 's:s'); noteTag(s, 'r:' + inf.relic);
    say(s, 'kayit', R.name, R.log, { fact: R.fact, src: R.src, c: 'good' });
    say(s, R.after.from, R.after.title || R.name, R.after.text, { c: 'good' });
    out = { ok: true, first: true, bilim: bil, entry: { id: 'r:' + inf.relic, title: R.name, text: R.log, fact: R.fact, src: R.src || null }, reward: rw, relic: inf.relic };
  } else {
    const k = inf.kind, first = bankOpen(s, 's:' + k), bil = first ? 8 : 2;
    s.res.bilim += bil;
    noteTag(s, 's:' + k);
    out = { ok: true, first, bilim: bil, entry: { id: 's:' + k, title: SCANS[k].name, text: SCANS[k].text[s.world], fact: SCANS[k].fact[s.world] } };
  }
  wqPush(s, { act: 'scan', t: s.t, x, y, kind: inf.kind });
  learnKey(s, 'tara:' + inf.kind);
  checkMissions(s);
  return out;
}
const GATHER = { m: { res: 'malzeme', n: 6 }, i: { res: 'su', n: 8 } }, GATHER_MAX = 4;

function canCollect(s, x, y) {
  if (!inMap(x, y) || !isSeen(s, x, y)) return { ok: false, why: 'yok' };
  const G = GATHER[tileAt(s, x, y)];
  if (!G) return { ok: false, why: 'yok' };
  if (bAt(s, x, y)) return { ok: false, why: 'dolu', res: G.res, n: G.n, left: 0 };
  if (s.t < (s.fx.lockUntil || 0)) return { ok: false, why: 'siginak', res: G.res, n: G.n, left: 0 };
  const left = GATHER_MAX - (s.picked[idx(x, y)] || 0);
  return left > 0 ? { ok: true, res: G.res, n: G.n, left } : { ok: false, why: 'bos', res: G.res, n: G.n, left: 0 };
}
function collect(s, x, y) {
  const c = canCollect(s, x, y);
  if (!c.ok) return c;
  const i = idx(x, y);
  s.picked[i] = (s.picked[i] || 0) + 1;
  s.res[c.res] += c.n; s.stat.collects++;
  return { ok: true, res: c.res, n: c.n, left: c.left - 1 };
}


const evInWorld = (s, id) => {
  const ev = EVENTS[id];
  if (ev.worlds && !ev.worlds.includes(s.world)) return false;
  if (id === 'firtina') return !!WORLDS[s.world].storm;
  if (id === 'gece') return !!WORLDS[s.world].night;
  return true;
};

function bankEntries(s) {
  const out = [], B = s.bank, w = s.world;
  const add = (id, cat, title, text, fact) => out.push({ id, cat, title, text, fact: fact || null, open: B[id] != null, t: B[id] != null ? B[id] : null });
  for (const k of ['hub'].concat(BUILD_ORDER)) add('b:' + k, 'bina', bname(s, k), bfact(s, k));
  add('b:kalkan', 'bina', L('Radyasyon kalkanı', 'Radiation shielding'), SHIELD_FACT);
  for (const id of TECH_ORDER) add('t:' + id, 'tek', TECHS[id].name, TECHS[id].fact);
  for (const id in EVENTS) if (evInWorld(s, id) && !EVENTS[id].train) add('e:' + id, 'olay', EVENTS[id].title, evFact(s, EVENTS[id]));
  for (const k of ['i', 'm', 't', 'c', 'r']) add('s:' + k, 'kesif', SCANS[k].name, SCANS[k].text[w], SCANS[k].fact[w]);
  STORY[w].relics.forEach((R, i) => {
    const id = 'r:' + i, open = B[id] != null;
    out.push({ id, cat: 'kayit', title: open ? R.name : SCANS.s.name, text: open ? R.log : null, fact: open ? R.fact : null, open, t: open ? B[id] : null });
  });
  for (const g of realBank()) {
    const t = B[g.id] != null ? B[g.id] : (g.tag && s.tags[g.tag] != null ? s.tags[g.tag] : null);
    out.push({ id: g.id, cat: 'gercek', title: g.title, text: g.text, fact: g.fact || null, open: t != null, t });
  }
  return out;
}


function costOf(s, k) {
  const d = BLD[k];

  return { m: Math.round((d.m || 0) * (s.techs.beton ? 0.75 : 1)), p: easy(s) ? 0 : (d.p || 0) };
}
const workersOf = (s, k) => (s.techs.oto && (k === 'maden' || k === 'su')) ? 0 : (BLD[k].w || 0);
const shieldCost = s => s.techs.beton ? 25 : 50;
const isHab = b => b.k === 'hub' || b.k === 'yasam';
const isShielded = (s, b) => isHab(b) && b.left === 0 && (b.shield === 1 || (b.k === 'yasam' && tileAt(s, b.x, b.y) === 't'));
function beds(s) {
  let n = 0;
  for (const b of s.b) if (isHab(b) && b.left === 0 && (b.k === 'hub' || b.st === 'ok')) n += BLD[b.k].beds;
  return n;
}
function shieldedBeds(s) {
  let n = 0;
  for (const b of s.b) if (isShielded(s, b)) n += BLD[b.k].beds;
  return n;
}
const shieldFrac = s => s.pop > 0 ? Math.min(1, shieldedBeds(s) / s.pop) : 1;
const batteryCap = s => 30 + cnt(s, 'batarya') * BLD.batarya.store * (s.techs.sebeke ? 1.5 : 1);
const stormOn = s => !!(s.storm && s.t >= s.storm.from && s.t < s.storm.until);

function nightPhase(s, t) {
  const N = WORLDS[s.world].night, P = N.period * 24;
  return (((t - N.start * 24) % P) + P) % P;
}
function baseSun(s, t) {
  const W = WORLDS[s.world];
  if (W.night) {
    const ph = nightPhase(s, t), len = W.night.len * 24, ramp = 6;
    if (ph >= len) return 1;
    if (ph < ramp) return 1 - ph / ramp;
    if (ph > len - ramp) return (ph - (len - ramp)) / ramp;
    return 0;
  }
  const h = ((t % 24) + 24) % 24;
  return Math.max(0, Math.sin(Math.PI * (h - 6) / 12));
}
function sunFactor(s, t) {
  let f = baseSun(s, t);
  if (stormOn(s)) f *= s.techs.toz ? 0.55 : WORLDS[s.world].storm.factor;
  return f;
}
const isDark = s => baseSun(s, s.t) < 0.05;
function hoursToNight(s) {
  const W = WORLDS[s.world]; if (!W.night) return Infinity;
  const ph = nightPhase(s, s.t), P = W.night.period * 24;
  return ph < W.night.len * 24 ? 0 : P - ph;
}
function near(s, b, kinds, r) {
  for (const o of s.b) if (o !== b && o.left === 0 && kinds.includes(o.k) && Math.max(Math.abs(o.x - b.x), Math.abs(o.y - b.y)) <= r) return true;
  return false;
}
const dusty = (s, b) => !s.techs.toz && near(s, b, ['maden', 'pist'], 1);


const HUB_NIGHT_KASIF = 4;
const hubNight = (s, sun) => (easy(s) && WORLDS[s.world].night ? HUB_NIGHT_KASIF * (1 - clamp(sun == null ? 1 : sun, 0, 1)) : 0);
function genOf(s, b, sun) {
  if (b.k === 'hub') return 2 + hubNight(s, sun);
  if (b.k === 'reaktor') return BLD.reaktor.gen;
  if (b.k === 'gunes') {
    let g = WORLDS[s.world].solarPeak * sun;
    if (s.techs.panel) g *= 1.25;
    if (dusty(s, b)) g *= 0.75;
    if (s.t < (s.fx.devilUntil || 0)) g *= 1.15;
    if (s.t < (s.fx.dustUntil || 0) && !s.techs.toz) g *= 0.8;
    if (s.t < (s.fx.cleanUntil || 0)) g *= 1.05;
    return g;
  }
  return 0;
}

const makesPower = (s, k) => k !== 'hub' && genOf(s, { k, x: -99, y: -99 }, 1) > 0;
function reactorNearHab(s) {
  let n = 0;
  for (const b of s.b) if (b.k === 'reaktor' && b.left === 0 && near(s, b, ['hub', 'yasam'], 2)) n++;
  return n;
}
function doseFactors(s) {
  const W = WORLDS[s.world], sf = shieldFrac(s), f = [];
  f.push({ l: L('Yüzey radyasyonu', 'Surface radiation'), v: W.doseRate });
  if (sf > 0) f.push({ l: L(`Korunaklı yataklar (%${Math.round(sf * 100)})`, `Protected beds (${Math.round(sf * 100)}%)`), v: -W.doseRate * 0.5 * sf });
  const rn = reactorNearHab(s);
  if (rn) f.push({ l: L('Reaktör yaşam alanına çok yakın', 'Reactor too close to living area'), v: 0.4 * rn });
  return f;
}
const doseRate = s => doseFactors(s).reduce((a, f) => a + f.v, 0);
const busyWorkers = s => s.fx.busy.reduce((a, o) => a + (o.until > s.t ? o.n : 0), 0);
function daysLeft(s, r) {
  const net = s.rate[r].c - s.rate[r].p;
  return net <= 1e-6 ? Infinity : s.res[r] / net;
}
function selfSuff(s) {
  let sum = 0;
  for (const r of ['o2', 'su', 'gida']) { const c = s.rate[r].c, p = s.rate[r].p; sum += c <= 1e-6 ? 1 : Math.min(1, p / c); }
  return sum / 3;
}
function seraGrown(s) {
  const lag = s.techs.hidro ? 72 : 96;
  return s.b.some(b => b.k === 'sera' && b.left === 0 && (b.grow || 0) >= lag);
}


function bedPenalty(s) {
  const miss = s.pop - beds(s);
  if (miss <= 0) return 0;
  return -(Math.min(25, 10 + 5 * miss) + Math.min(15, Math.floor((s.fx.crowdH || 0) / 6)));
}

function moraleFactors(s) {
  const f = [{ id: 'temel', l: L('Temel', 'Base'), v: 55 }];
  if (conjOn(s)) f.push({ id: 'baglantiyok', l: L('Dünya ile bağlantı yok', 'No contact with Earth'), v: -4 });
  else if (cnt(s, 'anten', 1)) f.push({ id: 'baglanti', l: L('Dünya ile iletişim', 'Contact with Earth'), v: 5 });
  const sp = Math.min(2, cnt(s, 'spor', 1));
  if (sp) f.push({ id: 'spor', l: L('Dinlenme Kubbesi', 'Recreation Dome'), v: 10 * sp });
  if (seraGrown(s)) f.push({ id: 'sebze', l: L('Taze sebze', 'Fresh vegetables'), v: 5 });
  if (s.b.some(b => b.k === 'sera' && b.left === 0 && near(s, b, ['hub', 'yasam'], 1))) f.push({ id: 'yesil', l: L('Pencereden yeşil görmek', 'Green view from the window'), v: 3 });
  if (s.techs.bio) f.push({ id: 'bitki', l: L('Bitki yaşam sistemi', 'Plant life support'), v: 5 });
  const bp = bedPenalty(s);
  if (bp) f.push({ id: 'yatak', l: L(`Yatak yetmiyor (${s.pop - beds(s)} kişi yerde yatıyor)`, `Not enough beds (${s.pop - beds(s)} sleeping on the floor)`), v: bp });
  if (s.short.o2 || s.short.su || s.short.gida) f.push({ id: 'tukendi', l: L('Hava, su ya da yemek bitti', 'Air, water or food has run out'), v: -20 });
  else if (Math.min(daysLeft(s, 'o2'), daysLeft(s, 'su'), daysLeft(s, 'gida')) < 2) f.push({ id: 'stok', l: L('Stoklar bitmek üzere', 'Stocks nearly gone'), v: -8 });
  if (WORLDS[s.world].night && isDark(s)) f.push({ id: 'gece', l: L('Uzun gece', 'The long night'), v: -8 });
  if (stormOn(s)) f.push({ id: 'firtina', l: L('Toz fırtınası', 'Dust storm'), v: -8 });
  if (s.dose >= 450) f.push({ id: 'radyasyon', l: L('Radyasyon endişesi', 'Worry about radiation'), v: -10 });
  if (Math.abs(s.mmod) >= 0.5) { const mn = s.mmod < 0 ? moodNames(s, 2) : null; f.push({ id: 'olaylar', l: mn ? L(`Son olaylar: ${mn.tr}`, `Recent events: ${mn.en}`) : L('Son olaylar', 'Recent events'), v: Math.round(s.mmod) }); }
  return f;
}

const MOR_WHY = {
  yatak: L('yatak yetmedi', 'not enough beds'), tukendi: L('hava, su ya da yemek bitti', 'air, water or food ran out'),
  stok: L('stoklar hep azdı', 'stocks were always low'), gece: L('uzun gece', 'the long night'), firtina: L('toz fırtınası', 'dust storms'),
  radyasyon: L('radyasyon endişesi', 'worry about radiation'), olaylar: L('kötü geçen olaylar', 'bad recent events'),
  baglantiyok: L('Dünya ile bağlantı yoktu', 'no contact with Earth'),
};
const MOR_HINT = {
  yatak: L('Yaşam Modülü kur ya da kapalı olanı aç.', 'Build a Habitat Module or switch one back on.'),
  tukendi: L('Biten şeyi yapan makineyi kur ya da onar.', 'Build or repair the machine that makes what ran out.'),
  stok: L('Hava, su ve yemek makinelerini artır.', 'Add more air, water and food makers.'),
  gece: L('Dinlenme Kubbesi kur ya da ekibe izin ver.', 'Build a Recreation Dome or give the crew a day off.'),
  firtina: L('Dinlenme Kubbesi kur ya da ekibe izin ver.', 'Build a Recreation Dome or give the crew a day off.'),
  radyasyon: L('Yatakları toprakla ört: radyasyon azalır.', 'Cover the beds with soil: less radiation.'),
  olaylar: L('Dinlenme Kubbesi kur ya da ekibe izin ver.', 'Build a Recreation Dome or give the crew a day off.'),
  baglantiyok: L('Dinlenme Kubbesi kur: ekip rahatlar.', 'Build a Recreation Dome: the crew relaxes.'),
};

const moraleMinus = (s, n) => moraleFactors(s).filter(f => f.v < 0).sort((a, b) => a.v - b.v).slice(0, n || 3).map(f => f.id);
const moraleTarget = s => clamp(moraleFactors(s).reduce((a, f) => a + f.v, 0), 0, 100);
const moraleMult = s => 0.85 + 0.3 * s.moral / 100;
const techCount = s => Object.keys(s.techs).length;
function techState(s, id) {
  if (s.techs[id]) return 'own';
  const t = TECHS[id];
  if (t.tier > 1) {
    let n = 0;
    for (const o of TECH_ORDER) if (TECHS[o].tier === t.tier - 1 && s.techs[o]) n++;
    if (n < 2) return 'kilit';
  }
  return s.res.bilim >= t.cost ? 'ok' : 'bilim';
}
const cargoBudget = s => Math.round(WORLDS[s.world].cargoMass * (cnt(s, 'pist') ? 1.3 : 1) / 10) * 10;
const repairCost = (s, b) => Math.max(2, Math.ceil((BLD[b.k].p || 4) * 0.3));



function buildStage(s) {
  const dn = ['guc', 'o2', 'su'].filter(id => s.done[id]).length;
  const st = Math.max(s.stage || 1, dn >= 2 || dayOf(s) >= 3 ? 2 : 1);
  return st >= 2 && (s.techs.dongu || s.techs.baski) ? 3 : st;
}

function unlockedB(s, k) {
  const d = BLD[k];
  if (!d || k === 'hub') return { ok: false, why: L('Bu yapı kurulamaz.', 'This cannot be built.') };
  if (d.tech && !s.techs[d.tech]) {
    const tn = TECHS[d.tech].name;
    return { ok: false, why: L(`Önce araştır: ${tn.tr}.`, `Research it first: ${tn.en}.`), at: L(`Araştırma: ${tn.tr}`, `Research: ${tn.en}`) };
  }
  if (!STAGE1.includes(k) && buildStage(s) < 2) {
    const dw3 = s.world === 'mars' ? L('3. solda', 'on sol 3') : L('3. günde', 'on day 3');
    return { ok: false, why: L('Önce ilk yapılarını kur: elektrik, hava ve su.', 'Build your first machines first: power, air and water.'),
      at: L(`İlk görevlerden ikisini bitirince açılır, en geç ${dw3.tr}.`, `Opens after two of the first goals, ${dw3.en} at the latest.`) };
  }
  return { ok: true };
}

function stageStep(s) {
  const st = buildStage(s);
  if (st <= (s.stage || 1)) return;
  const was = s.stage || 1; s.stage = st;
  if (was < 2) {
    say(s, 'atlas', L('Yeni yapılar açıldı', 'New buildings unlocked'),
      L('Harika! Kur menüsünde yeni yapılar var.', 'Great! There are new buildings in the Build menu.'), { c: 'good' });
  }
}



function buildMsg(s, k, why, c) {
  const n = BLD[k] ? bname(s, k) : L('Yapı', 'Building');
  switch (why) {
    case 'cost': {
      const tr = [], en = [];
      if (c.m) { tr.push(`${c.m} malzeme`); en.push(`${c.m} material`); }
      if (c.p) { tr.push(`${c.p} yedek parça`); en.push(`${c.p} spare parts`); }
      return L(`${tr.join(' ve ')} eksik.`, `You are ${en.join(' and ')} short.`);
    }
    case 'core': return L('Jeneratör yakıtı yok. Kargo gemisinden iste.', 'No generator fuel. Order it from the cargo ship.');
    case 'fog': return L('Burası karanlık. Yanına yürü, sonra yine dene.', 'This spot is dark. Walk next to it, then try again.');
    case 'dolu': return L('Burada yapı var. Boş bir kareye dokun.', 'A building is here. Tap an empty square.');
    case 'egitim': { if (!BLD[s.trainOnly]) return L('Şimdi kurma zamanı değil. Üstteki hedefe bak.', 'Not time to build now. Check the goal at the top.'); const o = bname(s, s.trainOnly); return L(`Önce ${o.tr} seç.`, `Pick the ${o.en} first.`); }
    case 'zemin': return L('Buraya kurulmaz: kaya, krater ya da eski bir kalıntı var.', 'Not here: there is a rock, a crater or an old wreck.');
    case 'buzgerek': return L(`${n.tr} yalnızca mavi buz alanına kurulur. Mavi parlayan karelere bak.`, `${n.en} only goes on a blue ice patch. Look for the glowing blue tiles.`);
    case 'buz': return L('Buz alanını Buz Çıkarıcıya sakla.', 'Keep ice patches for the Ice Extractor.');
    default: return L('Bu yapı kurulamaz.', 'This cannot be built.');
  }
}
const WARN_MSG = {
  toz: L('Toz yapan bir yapının yanında: panel %25 az elektrik yapar.', 'Next to a dusty building: the panel makes 25% less power.'),
  toz2: L('Panellerin yanında: tozu onları %25 yavaşlatır.', 'Next to panels: its dust slows them by 25%.'),
  rad: L('Jeneratör evlere çok yakın: ekip fazladan radyasyon alır.', 'The generator is too close to homes: the crew gets extra radiation.'),
  tup: L('Lav mağarası: bedava radyasyon kalkanı!', 'Lava cave: free radiation shield!'),
  mineral: L('Maden alanı: %50 daha çok malzeme.', 'Mineral patch: 50% more material.'),
  yesil: L('Evin yanında: yeşil görmek moral verir (+3).', 'Next to a home: seeing green lifts morale (+3).'),
};

function placeCheck(s, k, x, y) {
  const d = BLD[k];
  if (s.train && s.trainOnly && k !== s.trainOnly) return 'egitim';
  if (!inMap(x, y) || !isSeen(s, x, y)) return 'fog';
  if (bAt(s, x, y)) return 'dolu';
  const t = tileAt(s, x, y);
  if (t === 'r' || t === 'c' || t === 's') return 'zemin';
  if (d.on && t !== d.on) return 'buzgerek';
  if (!d.on && t === 'i') return 'buz';
  return '';
}

function canBuild(s, k, x, y) {
  const d = BLD[k];
  const no = (why, extra) => Object.assign({ ok: false, why, msg: buildMsg(s, k, why, extra && extra.miss) }, extra || {});
  if (!d || k === 'hub') return no('x');
  if (d.tech && !s.techs[d.tech]) return Object.assign(no('tech'), { msg: unlockedB(s, k).why });
  const u = unlockedB(s, k);
  if (!u.ok) return { ok: false, why: 'stage', msg: L(`${bname(s, k).tr} henüz kapalı. ${u.at.tr}`, `${bname(s, k).en} is not open yet. ${u.at.en}`) };
  if (d.core && s.core < 1) return no('core');
  const c = costOf(s, k);
  if (s.res.malzeme < c.m || s.res.parca < c.p) {
    const miss = { m: Math.max(0, Math.ceil(c.m - s.res.malzeme)), p: Math.max(0, Math.ceil(c.p - s.res.parca)) };
    return no('cost', { miss });
  }
  if (x == null) return { ok: true };
  const pw = placeCheck(s, k, x, y);
  if (pw) return no(pw);
  const t = tileAt(s, x, y);
  const warn = [];
  const fake = { x, y, k };
  if (k === 'gunes' && !s.techs.toz && near(s, fake, ['maden', 'pist'], 1)) warn.push('toz');
  if ((k === 'maden' || k === 'pist') && !s.techs.toz && near(s, fake, ['gunes'], 1)) warn.push('toz2');
  if (k === 'reaktor' && near(s, fake, ['hub', 'yasam'], 2)) warn.push('rad');
  if (k === 'yasam' && near(s, fake, ['reaktor'], 2)) warn.push('rad');
  if (k === 'yasam' && t === 't') warn.push('tup');
  if (k === 'maden' && t === 'm') warn.push('mineral');
  if (k === 'sera' && near(s, fake, ['hub', 'yasam'], 1)) warn.push('yesil');
  return { ok: true, warn, warnMsg: warn.map(w => WARN_MSG[w]) };
}


function suggestSpot(s, k) {
  if (!BLD[k] || k === 'hub') return null;
  const far = (kinds, x, y, r) => !s.b.some(b => kinds.includes(b.k) && Math.max(Math.abs(b.x - x), Math.abs(b.y - y)) <= r);
  const best = pred => {
    let out = null, bd = 1e9;
    for (let y = 0; y < MAPH; y++) for (let x = 0; x < MAPW; x++) {
      if (placeCheck(s, k, x, y)) continue;
      const t = tileAt(s, x, y);
      if (!pred(t, x, y)) continue;
      const d = Math.hypot(x - HUBX, y - HUBY);
      if (d < bd) { bd = d; out = { x, y }; }
    }
    return out;
  };
  const at = (o, why) => o ? { x: o.x, y: o.y, why } : null;
  const home = (x, y) => s.b.some(b => (b.k === 'hub' || b.k === 'yasam') && Math.max(Math.abs(b.x - x), Math.abs(b.y - y)) <= 1);
  if (k === 'su') return at(best(t => t === 'i'), L('Mavi buz alanı: buzdan su çıkar.', 'Blue ice patch: water comes from the ice.'));
  if (k === 'maden') return at(best((t, x, y) => t === 'm' && far(['gunes'], x, y, 1)), L('Turuncu maden alanı: %50 daha çok malzeme.', 'Orange mineral patch: 50% more material.'))
    || at(best((t, x, y) => t === '.' && far(['gunes'], x, y, 1)), L('Panellerden uzak: tozu onları kirletmez.', 'Away from panels: its dust stays off them.'));
  if (k === 'gunes') return at(best((t, x, y) => t === '.' && far(['maden', 'pist'], x, y, 1)), L('Tozlu yapılardan uzak: tam güç.', 'Away from dusty buildings: full power.'));
  if (k === 'pist') return at(best((t, x, y) => t === '.' && far(['gunes'], x, y, 1)), L('Panellerden uzak: tozu onları kirletmez.', 'Away from panels: its dust stays off them.'));
  if (k === 'reaktor') return at(best((t, x, y) => t === '.' && far(['hub', 'yasam'], x, y, 2)), L('Evlerden 3 kare uzak: radyasyon ulaşmaz.', '3 tiles from homes: the radiation stays away.'));
  if (k === 'yasam') return at(best((t, x, y) => t === 't' && far(['reaktor'], x, y, 2)), L('Lav mağarası: bedava radyasyon kalkanı.', 'Lava cave: a free radiation shield.'))
    || at(best((t, x, y) => t === '.' && far(['reaktor'], x, y, 2)), L('Üsse yakın, jeneratörden uzak.', 'Close to base, away from the generator.'));
  if (k === 'sera') return at(best((t, x, y) => t === '.' && home(x, y)), L('Evin yanında: yeşil görmek moral verir.', 'Next to a home: seeing green lifts morale.'))
    || at(best(t => t === '.'), L('Üsse yakın boş bir kare.', 'A free spot close to base.'));
  return at(best(t => t === '.'), L('Üsse yakın boş bir kare.', 'A free spot close to base.'));
}

const STARTER = ['gunes', 'oksijen', 'su', 'sera', 'batarya'];
function starterPlan(s) {
  const v = Object.assign({}, s, { b: s.b.slice() }), out = [];
  STARTER.forEach((k, i) => {
    const p = suggestSpot(v, k);
    if (!p) return;
    out.push({ k, x: p.x, y: p.y, n: i + 1 });
    v.b.push({ id: -1 - i, k, x: p.x, y: p.y, left: 0, on: true, st: 'ok' });
  });
  return out;
}
function build(s, k, x, y) {
  const r = canBuild(s, k, x, y);
  if (!r.ok) return r;
  const c = costOf(s, k);
  const pw0 = (!s.quiet && !s.train) ? pwCore(s) : null;
  s.res.malzeme -= c.m; s.res.parca -= c.p;
  if (BLD[k].core) s.core--;
  spendLog(s, 'malzeme', -c.m, 'build'); spendLog(s, 'parca', -c.p, 'build'); if (BLD[k].core) spendLog(s, 'core', -1, 'build');
  const b = { id: s.nid++, k, x, y, left: BLD[k].h, on: true, broken: false, shield: 0, shLeft: 0, st: 'insa', grow: 0, off: 0, pm: c.m, pp: c.p };
  if (s.train) { b.left = Math.max(1, Math.ceil(BLD[k].h / 4)); b.h0 = b.left; }
  s.b.push(b);

  learnKey(s, 'build:' + k);
  pwAfterBuild(s, k, pw0);
  return { ok: true, b, warn: r.warn, warnMsg: r.warnMsg };
}

function undoBuild(s, b) {
  if (!b || b.k === 'hub' || !s.b.includes(b) || b.left !== (b.h0 || BLD[b.k].h)) return false;
  const c = b.pm != null ? { m: b.pm, p: b.pp || 0 } : costOf(s, b.k);
  s.res.malzeme += c.m; s.res.parca += c.p;
  if (BLD[b.k].core) s.core++;
  spendLog(s, 'malzeme', c.m, 'iade'); spendLog(s, 'parca', c.p, 'iade'); if (BLD[b.k].core) spendLog(s, 'core', 1, 'iade');
  s.b.splice(s.b.indexOf(b), 1);
  return true;
}
function demolish(s, b) {
  if (!b || b.k === 'hub') return false;
  const c = costOf(s, b.k);
  s.res.malzeme += Math.floor(c.m * 0.5); s.res.parca += Math.floor(c.p * 0.5);
  if (BLD[b.k].core) s.core++;
  spendLog(s, 'malzeme', Math.floor(c.m * 0.5), 'iade'); spendLog(s, 'parca', Math.floor(c.p * 0.5), 'iade'); if (BLD[b.k].core) spendLog(s, 'core', 1, 'iade');
  s.b.splice(s.b.indexOf(b), 1);
  return true;
}
function toggle(s, b) { if (b && b.k !== 'hub' && b.left === 0) { b.on = !b.on; return true; } return false; }
function repair(s, b) {
  if (!b || !b.broken) return false;
  const c = repairCost(s, b);
  if (s.res.parca < c) return false;
  s.res.parca -= c; b.broken = false; s.stat.repairs++;
  spendLog(s, 'parca', -c, 'repair');
  learnKey(s, 'first:onarim');
  return true;
}
function canShield(s, b) {
  return !!b && isHab(b) && b.left === 0 && !isShielded(s, b) && !b.shLeft;
}
function shieldUp(s, b) {
  if (!canShield(s, b) || s.res.malzeme < shieldCost(s)) return false;
  s.res.malzeme -= shieldCost(s); b.shLeft = 12;
  return true;
}
function research(s, id) {
  if (techState(s, id) !== 'ok') return false;
  s.res.bilim -= TECHS[id].cost; s.techs[id] = 1;
  bankOpen(s, 't:' + id);
  log(s, L(`Yeni buluş: ${TECHS[id].name.tr}.`, `New invention: ${TECHS[id].name.en}.`), 'good');
  checkMissions(s);
  return true;
}



function pickTarget(s) {
  const c = s.b.filter(b => b.k !== 'hub' && b.left === 0 && !b.broken);
  return c.length ? rpick(s, c) : null;
}
const breakRes = (s, p) => {
  const b = s.b.find(o => o.id === p.bid), c = b ? repairCost(s, b) : 0;
  return L(`Onarmak için yanına git. ${c} yedek parça gerekiyor.`, `Walk to it to repair it. It needs ${c} spare parts.`);
};

const fin = (x, d = 0) => Number.isFinite(x) ? x : d;


const qText = (sit, id) => { const q = EVENTS[id].q; return L(sit.tr + ' ' + q.tr, sit.en + ' ' + q.en); };
const capDose = (s, g) => Math.max(0, Math.min(fin(g), LIMIT_DOSE - 12 - s.dose));


const EVENTS = {
  flare: {
    fill: (s, p) => { p.hit = fin(p.hit, Math.round(WORLDS[s.world].flareHit[0])); },
    icon: 'flare', from: 'atlas', c: 'bad', due: 12, def: 2, title: L('Güneş Patlaması!', 'Solar Flare!'),
    q: L('Güneş patlamasında en iyi nerede korunuruz?', 'Where is the best shelter in a solar flare?'),
    why: L('Doğrusu toprak örtülü oda: kalın toprak ışınları durdurur.', 'A soil-covered room: thick soil stops the rays.'),
    text: s => qText(s.world === 'ay' ? L('Güneş\'te patlama var ve Ay\'da bizi koruyacak hava yok.', 'The Sun just blasted, and the Moon has no air to shield us.')
      : L('Güneş\'te patlama var, Mars\'ın ince havası az korur.', 'The Sun just blasted, and thin Martian air helps only a little.'), 'flare'),
    fact: L('Dünya\'da bizi manyetik alan ve kalın atmosfer korur. mSv bir radyasyon ölçüsüdür. 600 mSv, NASA\'nın bir astronota tüm kariyeri boyunca izin verdiği toplam dozdur.',
            'On Earth we are protected by the magnetic field and thick atmosphere. mSv is a unit of radiation. 600 mSv is the total dose NASA allows an astronaut over a whole career.'),
    ch: [
      { l: L('Toprak örtülü odada', 'Soil-covered room'), ok: true, dur: 12,
        fx: (s, p) => {
          const sf = shieldFrac(s), gain = capDose(s, p.hit * ((1 - sf) * 0.5 + sf * 0.04));
          s.dose += gain; s.fx.lockUntil = s.t + 12; s.fx.flareUntil = s.t + 12;
          s.stat.flares++; s.stat.flareDose += gain; if (sf < 0.999) s.stat.flareOpen++;

          const open = Math.max(0, Math.ceil(s.pop - shieldedBeds(s)));
          p.sub = sf >= 0.999 ? L('Herkes korundu.', 'Everyone was safe.')
            : L(`${open} kişi açıkta kaldı: korunaklı yatak az.`, `${open} ${open === 1 ? 'person was' : 'people were'} exposed: too few protected beds.`);
          p.more = sf >= 0.999 ? L(`Ekip yalnız ${radAmt(s, gain, 1).tr} aldı.`, `The crew took only ${radAmt(s, gain, 1).en}.`)
            : L(`Ekip ortalaması ${radAmt(s, gain, null, true).tr}.`, `Crew average ${radAmt(s, gain, null, true).en}.`);
          return L('Doğru! Toprak ışını keser.', 'Correct! Soil blocks the rays.');
        } },
      { l: L('Cam kubbede', 'Under a glass dome'), dur: 12,
        fx: (s, p) => {
          const gain = capDose(s, p.hit);
          s.dose += gain; moodBump(s, MOOD.devamFlare, 'flare'); s.fx.flareUntil = s.t + 12;
          s.stat.flares++; s.stat.flareDose += gain; s.stat.flareOpen++;
          return L(`Cam ışını durdurmadı: ${radAmt(s, gain, null, true).tr}, moral −${-MOOD.devamFlare}.`, `Glass let the rays in: ${radAmt(s, gain, null, true).en}, morale −${-MOOD.devamFlare}.`);
        } },
      { l: L('ATLAS geç sakladı', 'ATLAS sheltered us late'), hide: true, idle: true, dur: 12,
        fx: (s, p) => {
          const sf = shieldFrac(s), gain = capDose(s, p.hit * ((1 - sf) * 0.5 + sf * 0.04 + 0.25));
          s.dose += gain; s.fx.lockUntil = s.t + 12; s.fx.flareUntil = s.t + 12;
          s.stat.flares++; s.stat.flareDose += gain; s.stat.flareOpen++;
          return L(`Geç saklandık: ekip ortalaması ${radAmt(s, gain, null, true).tr}.`, `We hid late: crew average ${radAmt(s, gain, null, true).en}.`);
        } },
    ],
  },
  firtina: {
    auto: true, icon: 'storm', from: 'atlas', c: 'warn', title: L('Toz Fırtınası', 'Dust Storm'),
    text: (s, p) => easy(s) ? L(`Toz fırtınası geldi, yaklaşık ${p.len} sol sürecek. Paneller çok az elektrik yapacak.`, `A dust storm is here for about ${p.len} sols. Panels will make very little power.`)
      : L(`Ufuk karardı: toz fırtınası geldi. Yaklaşık ${p.len} sol sürecek. Paneller çok az elektrik yapacak. Elektrik yetmezse önce kazıcı ve laboratuvar kapanır.`,
                     `The horizon went dark: a dust storm is here. It will last about ${p.len} sols. Panels will make very little power. If power runs short, diggers and the lab stop first.`),
    fact: L('Mars\'ta toz fırtınaları bazen tüm gezegeni sarar ve haftalarca sürer. Güneş enerjili Opportunity gezgini böyle bir fırtınada sustu.',
            'Dust storms on Mars sometimes wrap the whole planet and last for weeks. The solar-powered Opportunity rover fell silent in one.'),
    fx: () => null,
  },
  gece: {
    auto: true, icon: 'night', from: 'atlas', c: 'warn', title: L('Uzun Gece Geliyor', 'The Long Night Is Coming'),
    text: s => { const a = ckPwAdvice(s) || L('Bataryaların geceye yetecek.', 'Your batteries will last the night.');
      return easy(s) ? L(`2 gün sonra 4 günlük uzun gece başlıyor. ${a.tr}`, `In 2 days a 4-day night begins. ${a.en}`)
      : L(`2 gün sonra Güneş batacak. 4 gün boyunca doğmayacak. Paneller hiç elektrik yapmayacak. ${a.tr}`,
                  `In 2 days the Sun will set. It will not rise for 4 days. Panels will make no power at all. ${a.en}`); },
    fact: L('Ay\'da bir gün, gün doğumundan gün doğumuna, yaklaşık 29,5 Dünya günü sürer. Kutup tepelerinde karanlık birkaç gün sürer; ekvatorda ise iki hafta.',
            'A day on the Moon, sunrise to sunrise, lasts about 29.5 Earth days. On polar peaks darkness lasts a few days; at the equator, two weeks.'),
    fx: () => null,
  },
  ariza: {
    auto: true, icon: 'wrench', from: 'atlas', c: 'warn', title: L('Bir Makine Bozuldu', 'A Machine Broke'), w: 2,
    ok: s => !!pickTarget(s),
    make: (s, p) => { const b = pickTarget(s); if (!b) return false; b.broken = true; p.bid = b.id; p.bk = b.k; s.fx.hit = { id: b.id, t: s.t }; },
    text: (s, p) => easy(s) ? L(`${bname(s, p.bk).tr} bozuldu: toz bir contayı aşındırdı. Onarılana kadar çalışmaz.`, `${bname(s, p.bk).en} broke: dust wore out a seal. It stops until repaired.`)
      : L(`${bname(s, p.bk).tr} bozuldu. İnce toz bir contayı aşındırmış. Onarılana kadar çalışmaz.`,
                     `${bname(s, p.bk).en} broke down. Fine dust wore out a seal. It will not work until repaired.`),
    factW: {
      ay: L('Ay tozu cam kırığı gibi keskindir, çünkü onu yuvarlayacak rüzgâr ya da su yoktur. Apollo astronotlarının giysilerini birkaç günde aşındırmıştı.',
            'Moon dust is as sharp as broken glass because there is no wind or water to round it. It wore down the Apollo astronauts\' suits in days.'),
      mars: L('Mars tozu un kadar incedir ve her yere girer: contaları, filtreleri ve hareketli parçaları yıpratır. Ayrıca perklorat adlı zehirli tuzlar içerir.',
              'Martian dust is as fine as flour and gets everywhere: it wears out seals, filters and moving parts. It also contains toxic salts called perchlorates.'),
    },
    fx: breakRes,
  },
  meteor: {
    auto: true, icon: 'meteor', from: 'atlas', c: 'bad', title: L('Minik Göktaşı Çarptı', 'Tiny Meteorite Strike'), w: 2, worlds: ['ay'],
    ok: s => !!pickTarget(s),
    make: (s, p) => { const b = pickTarget(s); if (!b) return false; b.broken = true; p.bid = b.id; p.bk = b.k; s.fx.hit = { id: b.id, t: s.t }; },
    text: (s, p) => L(`Kum tanesi kadar bir göktaşı ${bname(s, p.bk).tr} yapısını deldi. Ay'da onu yakacak hava yok.`,
                     `A meteorite the size of a sand grain punched through the ${bname(s, p.bk).en}. The Moon has no air to burn it up.`),
    fact: L('Dünya\'da "kayan yıldız" dediğimiz şey, atmosferde yanan küçük göktaşlarıdır. Ay\'da hepsi yüzeye saniyede onlarca kilometre hızla çarpar.',
            'What we call a "shooting star" on Earth is a small meteoroid burning up in the air. On the Moon they all hit the surface at tens of kilometres per second.'),
    fx: breakRes,
  },
  ozlem: {
    icon: 'heart', from: 'crew', who: 'kerem', c: 'warn', due: 48, def: 2, title: L('Ev Özlemi', 'Homesick'), w: 1,
    ok: s => dayOf(s) >= 5,
    q: L('Ekibin moralini ne yükseltir?', 'What lifts the crew\'s spirits?'),
    why: L('Doğrusu evle konuşmak: sevdiklerini görmek iyi gelir.', 'Talking with home: seeing loved ones helps.'),
    text: () => qText(L('Ekip yorgun ve evini özlüyor.', 'The crew is tired and homesick.'), 'ozlem'),
    fact: L('Uzun görevlerde psikoloji de bir mühendislik sorunudur. Antarktika istasyonları ve Mars-500 gibi izolasyon deneyleri bunu incelemek için kullanılır.',
            'On long missions psychology is an engineering problem too. Antarctic stations and isolation experiments like Mars-500 are used to study it.'),
    ch: [
      { l: L('Evle görüntülü konuşma', 'A video call home'), ok: true, dur: 24,
        fx: s => { moodBump(s, MOOD.izin); return L(`Herkes ailesiyle konuştu. Moral +${MOOD.izin}.`, `Everyone talked with family. Morale +${MOOD.izin}.`); } },
      { l: L('Ara vermeden çalışmak', 'Working without breaks'), dur: 24,
        fx: s => { moodBump(s, 2 * MOOD.devam, 'ozlem'); return L(`Ekip daha da yoruldu. Moral −${-2 * MOOD.devam}.`, `The crew got even more tired. Morale −${-2 * MOOD.devam}.`); } },
      { l: L('Programa devam', 'Stick to the schedule'), hide: true, idle: true, dur: 24,
        fx: s => { moodBump(s, MOOD.devam, 'ozlem'); return L(`İşler sürdü ama ekip gergin. Moral −${-MOOD.devam}.`, `Work went on, but the crew is tense. Morale −${-MOOD.devam}.`); } },
    ],
  },
  kuf: {
    icon: 'leaf', from: 'crew', who: 'nil', c: 'warn', due: 48, def: 2, title: L('Serada Küf', 'Mould in the Greenhouse'), w: 1,
    ok: s => seraGrown(s),
    q: L('Küf en çok neyi sever?', 'What does mould love most?'),
    why: L('Doğrusu nem: hava kuruyunca küf yayılamaz.', 'Damp air: when the air is dry, mould cannot spread.'),
    text: () => qText(L('Bir sera tepsisinde küf gördüm.', 'I found mould on a greenhouse tray.'), 'kuf'),
    fact: L('Uzay istasyonunda da küf ve bakteri sorunu yaşanır. Kapalı bir yaşam alanında mikroplar da ekibin parçasıdır.',
            'The space station fights mould and bacteria too. In a sealed habitat, microbes are part of the crew.'),
    ch: [
      { l: L('Nemli havayı', 'Damp air'), ok: true, dur: 72,
        fx: s => { const n = Math.min(5, s.res.gida); s.res.gida -= n; return L(`Havayı kuruttuk, tek tepsi atıldı: −${Math.round(n)} kg yemek.`, `We dried the air and binned one tray: −${Math.round(n)} kg food.`); } },
      { l: L('Soğuk havayı', 'Cold air'), dur: 72,
        fx: s => { s.fx.moldUntil = s.t + 72; return L(`Küf yayıldı: seralar 3 ${dw(s).tr} ürün vermeyecek.`, `The mould spread: no crops for 3 ${dw(s).en}.`); } },
      { l: L('Küflü bitkileri sök', 'Pull the mouldy plants'), hide: true, idle: true, dur: 72,
        fx: s => { const n = Math.min(15, s.res.gida); s.res.gida -= n; return L(`Küflü bitkiler söküldü: −${Math.round(n)} kg yemek.`, `The mouldy plants were pulled: −${Math.round(n)} kg food.`); } },
    ],
  },
  sizinti: {
    icon: 'drop', from: 'atlas', c: 'warn', due: 48, def: 2, title: L('Su Sızıntısı', 'Water Leak'), w: 1,
    ok: s => s.res.su >= 60,
    q: L('Boru neden çatladı?', 'Why did the pipe crack?'),
    why: L('Doğrusu donan su: su donunca genleşir, boruyu çatlatır.', 'Freezing water: it expands as it freezes and cracks pipes.'),
    text: () => qText(L('Bir su borusu çatladı, tank su kaçırıyor.', 'A water pipe cracked and the tank is leaking.'), 'sizinti'),
    fact: L('Su donarken genleşir: hacmi yaklaşık %9 artar. Boruları çatlatan şey budur.', 'Water expands as it freezes: its volume grows by about 9%. That is what cracks pipes.'),
    ch: [
      { l: L('Su donup genleşti', 'Water froze and expanded'), ok: true, dur: 24,
        fx: s => { const n = Math.min(2, Math.max(0, s.res.parca)); s.res.parca -= n; return L('Boruyu ısıttık, vanayı değiştirdik: su kaybı yok.', 'We heated the pipe and swapped the valve: no water lost.'); } },
      { l: L('Güneş boruyu ısıttı', 'The Sun heated it'), dur: 24,
        fx: s => { const lost = s.res.su * 0.3; s.res.su -= lost; return L(`Yanlış onarım: boru yine dondu, ${Math.round(lost)} L su kaçtı.`, `Wrong fix: the pipe froze again, ${Math.round(lost)} L of water lost.`); } },
      { l: L('Boruyu kapat', 'Shut the pipe'), hide: true, idle: true, dur: 24,
        fx: s => { const lost = s.res.su * 0.15; s.res.su -= lost; return L(`Boru kapatıldı: ${Math.round(lost)} L su kaçtı.`, `The pipe was shut: ${Math.round(lost)} L of water escaped.`); } },
    ],
  },
  seytan: {
    auto: true, icon: 'sun', from: 'atlas', c: 'good', title: L('Toz Hortumu', 'Dust Devil'), w: 1, worlds: ['mars'],
    ok: s => cnt(s, 'gunes') >= 1 && !stormOn(s),
    text: () => L('Küçük bir hortum panellerin tozunu süpürdü. Paneller 3 sol boyunca %15 fazla elektrik yapacak.',
                  'A small whirlwind swept the dust off the panels. They will make 15% more power for 3 sols.'),
    fact: L('Spirit ve Opportunity gezginlerinin ömrü, panellerini temizleyen bu tür rüzgârlar sayesinde defalarca uzadı.',
            'The Spirit and Opportunity rovers had their lives extended again and again by winds like this cleaning their panels.'),
    fx: s => { s.fx.devilUntil = s.t + 72; return null; },
  },
  deprem: {
    auto: true, icon: 'wave', from: 'atlas', c: 'info', title: L('Sarsıntı', 'Tremor'), w: 2,
    text: s => s.world === 'ay'
      ? L('Zemin hafifçe titredi: bir Ay depremi. Yapılarda hasar yok.', 'The ground trembled: a moonquake. No damage to the buildings.')
      : L('Zemin hafifçe titredi: bir Mars depremi. Yapılarda hasar yok.', 'The ground trembled: a marsquake. No damage to the buildings.'),
    fact: L('Depremler bir gezegenin içini gösteren röntgen gibidir. InSight, Mars\'ın çekirdeğinin sıvı olduğunu deprem dalgalarından anladı.',
            'Quakes are like an X-ray of a planet\'s interior. InSight learned that Mars has a liquid core from quake waves.'),
    fx: s => {
      const g = cnt(s, 'lab', 1) ? 8 : 2; s.res.bilim += g;
      return cnt(s, 'lab', 1) ? L(`Laboratuvar sarsıntıyı kaydetti: +${g} bilim.`, `The lab recorded the tremor: +${g} science.`)
                               : L(`Laboratuvar olmadan kaba bir kayıt alındı: +${g} bilim.`, `Without a lab only a rough record was made: +${g} science.`);
    },
  },
  okul: {
    auto: true, icon: 'chat', from: 'mc', who: 'deniz', c: 'good', title: L('Dünya\'dan Bağlantı', 'Call from Earth'), w: 2,
    ok: s => dayOf(s) >= 3 && !conjOn(s),
    text: () => L('Bir okul üsle bağlantı kurdu. Öğrenciler ne yediğinizi ve gökyüzünü sordu.',
                  'A school linked up with the base. The students asked what you eat and what the sky looks like.'),
    fact: L('Uzay istasyonundaki astronotlar, amatör telsizle (ARISS) dünyanın dört bir yanındaki okullarla düzenli olarak konuşur.',
            'Astronauts on the space station talk regularly with schools around the world by amateur radio (ARISS).'),
    fx: s => {
      moodBump(s, MOOD.okul); const a = cnt(s, 'anten', 1) ? 4 : 0; s.res.bilim += a;
      return a ? L(`Ekip çok eğlendi: moral +${MOOD.okul}. Anten sayesinde ders de yapıldı: +4 bilim.`, `The crew loved it: morale +${MOOD.okul}. Thanks to the dish they gave a lesson too: +4 science.`)
               : L(`Ekip çok eğlendi: moral +${MOOD.okul}.`, `The crew loved it: morale +${MOOD.okul}.`);
    },
  },
  teklif: {
    icon: 'flask', from: 'mc', who: 'deniz', c: 'info', due: 48, def: 2, title: L('Görev Kontrol Teklifi', 'Offer from Mission Control'), w: 1,
    ok: s => dayOf(s) >= 4 && !conjOn(s),
    q: L('Bir görevde en kıt şey hangisi?', 'What is scarcest on a mission?'),
    why: L('Doğrusu astronotun zamanı: her dakika önceden planlanır.', 'Astronaut time: every minute is planned ahead.'),
    text: () => qText(L('Dünya\'daki bilim ekibi ek bir deney istiyor.', 'The science team on Earth wants an extra experiment.'), 'teklif'),
    fact: L('Astronotun zamanı görevin en kıt kaynağıdır. Uzay istasyonunda her beş dakika önceden planlanır.',
            'Astronaut time is the scarcest resource of a mission. On the space station every five minutes is planned ahead.'),
    ch: [
      { l: L('Astronotun zamanı', 'Astronaut time'), ok: true, dur: 48,
        fx: s => { s.fx.busy.push({ until: s.t + 24, n: 1, id: 'teklif' }); s.res.bilim += 14;
          return L('Deneyi boş saatlere yerleştirdik: +14 bilim.', 'We fitted it into spare hours: +14 science.'); } },
      { l: L('Kâğıt ve kalem', 'Paper and pens'), dur: 48,
        fx: s => { s.fx.busy.push({ until: s.t + 48, n: 1, id: 'teklif' }); s.res.bilim += 8; moodBump(s, MOOD.teklif, 'teklif');
          return L(`Plansız deney 2 gün sürdü: +8 bilim, moral −${-MOOD.teklif}.`, `The unplanned test took 2 days: +8 science, morale −${-MOOD.teklif}.`); } },
      { l: L('Reddet', 'Decline'), hide: true, idle: true, dur: 48, none: true,
        fx: () => L('Ekip kendi programına devam ediyor.', 'The crew sticks to its own schedule.') },
    ],
  },
  damar: {
    auto: true, icon: 'drop', from: 'crew', who: 'arda', c: 'good', title: L('Bol Buz Bulundu', 'Rich Ice Found'), w: 1,
    ok: s => cnt(s, 'su', 1) >= 1,
    text: () => L('Buz Çıkarıcı çok temiz bir buz damarı buldu.', 'The Ice Extractor found a vein of very clean ice.'),
    fact: L('Buz yalnızca içme suyu değildir: elektrolizle oksijene ve roket yakıtı olan hidrojene ayrılır.', 'Ice is not just drinking water: electrolysis splits it into oxygen and hydrogen, which is rocket fuel.'),
    fx: s => { s.res.su += 60; return L('Tanklar doldu: +60 L su.', 'The tanks are full: +60 L water.'); },
  },
  toz: {
    icon: 'sun', from: 'atlas', c: 'warn', due: 48, def: 2, title: L('Paneller Tozlandı', 'Dusty Arrays'), w: 1,
    ok: s => cnt(s, 'gunes') >= 2 && !s.techs.toz,
    q: L('Paneldeki tozu nasıl temizleriz?', 'How do we clean dust off the panels?'),
    why: L('Doğrusu fırça: havasız yerde su donar ya da uçup gider.', 'A brush: with no air, water freezes or boils away.'),
    text: s => qText(s.world === 'ay' ? L('Ay tozu panellere yapıştı.', 'Moon dust is stuck to the panels.') : L('Mars tozu panellere çöktü.', 'Martian dust settled on the panels.'), 'toz'),
    fact: L('Ay tozu güneş ışığıyla elektrik yüklenir ve her şeye yapışır. Mars\'ta ise toz her gün panellerin üzerine yavaşça yağar.',
            'Moon dust gets charged by sunlight and sticks to everything. On Mars dust slowly rains onto the panels every day.'),
    ch: [
      { l: L('Yumuşak fırçayla', 'With a soft brush'), ok: true, dur: 96,
        fx: s => {
          const n = Math.min(2, s.pop), h = 8;
          s.fx.busy.push({ until: s.t + h, n, id: 'toz' });
          s.res.o2 = Math.max(0, s.res.o2 - n * EVA.o2);
          s.dose += fin(n * h / 24 * WORLDS[s.world].doseRate * EVA.k / Math.max(1, s.pop));
          s.fx.dustUntil = 0; s.fx.cleanUntil = s.t + 96;
          return L(`${n} astronot panelleri fırçalıyor. 4 ${dw(s).tr} tertemiz kalacaklar.`, `${n} astronauts are brushing the panels. They stay spotless for 4 ${dw(s).en}.`);
        } },
      { l: L('Suyla yıkayarak', 'Washing with water'), dur: 96,
        fx: s => { const lost = Math.min(20, s.res.su * 0.25); s.res.su -= lost; s.fx.dustUntil = s.t + 96;
          return L(`Su hemen dondu: ${Math.round(lost)} L gitti, paneller hâlâ tozlu.`, `The water froze at once: ${Math.round(lost)} L lost, panels still dusty.`); } },
      { l: L('Böyle kalsın', 'Leave it'), hide: true, idle: true, dur: 96,
        fx: s => { s.fx.dustUntil = s.t + 96; return L(`Paneller tozlu: 4 ${dw(s).tr} %20 az elektrik.`, `Dusty panels: 20% less power for 4 ${dw(s).en}.`); } },
    ],
  },

  egitim: {
    train: true, icon: 'chat', from: 'atlas', c: 'info', due: 48, def: 2, title: L('ATLAS\'ın bir sorusu var', 'ATLAS has a question'),
    q: L('Üsse neden hava makinesi gerekir?', 'Why does the base need an Air Maker?'),
    why: L('Doğrusu: dışarıda solunacak hava yok, makine onu yapar.', 'There is no air to breathe outside; the machine makes it.'),
    text: () => qText(L('Küçük bir soru, {ad}.', 'A quick question, {ad}.'), 'egitim'),
    fact: L('Ay\'da hava yoktur. Mars\'ın havası ise çok incedir ve solunamaz.', 'The Moon has no air. The air on Mars is very thin and cannot be breathed.'),
    ch: [
      { l: L('Solunacak hava yok', 'No breathable air outside'), ok: true, dur: 24,
        fx: s => { s.res.bilim += 4; return L('Aynen öyle! +4 bilim.', 'Exactly! +4 science.'); } },
      { l: L('Üssü ısıtmak için', 'To warm the base'), dur: 24,
        fx: s => { s.res.bilim += 1; return L('Güzel deneme: +1 bilim.', 'Nice try: +1 science.'); } },
      { l: L('ATLAS anlattı', 'ATLAS explained'), hide: true, idle: true, dur: 24, none: true,
        fx: () => L('Makine, solunacak havayı yapar.', 'The machine makes the air we breathe.') },
    ],
  },
};

for (const id in EVENTS) {
  const ev = EVENTS[id];
  if (!ev.ch) continue;
  ev.ch.forEach((o, i) => { o.h = (s, p) => choiceHint(s, p, id, i); });
}
const evFact = (s, ev) => (ev.factW ? ev.factW[s.world] : ev.fact);

const ATLAS_Q = Object.keys(EVENTS).filter(id => EVENTS[id].ch && EVENTS[id].q);
const RANDOM_EVENTS = ['ariza', 'meteor', 'ozlem', 'kuf', 'sizinti', 'seytan', 'deprem', 'okul', 'teklif', 'damar', 'toz'];
const DEC_GAP = 30;
const isDecision = p => p.type === 'event' && !EVENTS[p.id].auto;
const decisionPending = s => s.pending.some(isDecision);
const decisionAllowed = s => !decisionPending(s) && s.t - s.decT >= DEC_GAP;


function autoEvent(s, id, data) {
  const ev = EVENTS[id], p = Object.assign({ id }, data || {});
  if (ev.make && ev.make(s, p) === false) return false;
  const res = ev.fx ? ev.fx(s, p) : null;
  bankOpen(s, 'e:' + id); noteTag(s, 'e:' + id);
  say(s, ev.from, ev.title, ev.text(s, p), { fact: evFact(s, ev), res, c: ev.c, ev: id, who: ev.who });
  learnKey(s, 'ev:' + id);
  return true;
}

function pushEvent(s, id, data) {
  const ev = EVENTS[id];
  const p = Object.assign({ pid: s.pidN++, type: 'event', id, due: s.t + (ev.due || 48), def: ev.def || 0 }, data || {});
  if (ev.fill) ev.fill(s, p);
  if (ev.make && ev.make(s, p) === false) return false;
  s.pending.push(p);
  s.decT = s.t;
  say(s, ev.from, ev.title, ev.text(s, p), { c: ev.c, call: p.pid, ev: id, who: ev.who });
  learnKey(s, 'ev:' + id);
  return true;
}
function randomEvent(s) {
  const pool = [];
  for (const id of RANDOM_EVENTS) {
    const ev = EVENTS[id];
    if (id === s.lastEv) continue;
    if (ev.worlds && !ev.worlds.includes(s.world)) continue;
    if (ev.ok && !ev.ok(s)) continue;
    for (let i = 0; i < (ev.w || 1); i++) pool.push(id);
  }
  if (!pool.length) return true;
  const id = rpick(s, pool);
  if (!EVENTS[id].auto && !decisionAllowed(s)) return false;
  if (EVENTS[id].auto ? autoEvent(s, id) : pushEvent(s, id)) s.lastEv = id;
  return true;
}
function pushCargo(s) {
  const mass = cargoBudget(s);
  const p = { pid: s.pidN++, type: 'cargo', mass, due: s.train ? s.t + 72 : s.shipAt - 1, def: cargoSuggest(s, mass) };
  s.pending.push(p);
  say(s, 'atlas', L('Kargo gemisi indi', 'Cargo ship down'),
    L(`Kargo gemisi indi. ${mass} kg yük seçebilirsin. Sen seçmezsen bir sonraki gemiden önce ben seçerim.`,
      `The cargo ship has landed. You can pick ${mass} kg of cargo. If you do not, I will pick before the next ship.`),
    { c: 'good', call: p.pid, hint: L('Gemiye git ya da üstteki çağrıya dokun.', 'Walk to the ship or tap the call at the top.') });
}

function cargoSuggest(s, mass) {
  const picks = {}; let left = mass == null ? cargoBudget(s) : mass;
  const add = (id, n) => { const it = CARGO.find(c => c.id === id); n = Math.min(n, Math.floor(left / it.kg)); if (it.max) n = Math.min(n, it.max - (picks[id] || 0)); if (n > 0) { picks[id] = (picks[id] || 0) + n; left -= n * it.kg; } };
  const horizon = WORLDS[s.world].shipEvery + 3;
  const lack = r => { const net = s.rate[r].c - s.rate[r].p; return Math.max(0, net * horizon - s.res[r]); };
  add('o2', Math.ceil(lack('o2') / 30)); add('su', Math.ceil(lack('su') / 100)); add('gida', Math.ceil(lack('gida') / 60));
  const fb = beds(s) - s.pop; if (fb >= 2) add('crew', 1);
  add('parca', 6); add('moral', 1); add('bilim', 1); add('gida', 3); add('parca', 4); add('su', 2);
  return picks;
}


function previewCargo(s, picks) {
  const acc = {}, order = [];
  const put = (r, n) => { if (!(r in acc)) { acc[r] = 0; order.push(r); } acc[r] += n; };
  for (const it of CARGO) {
    const n = (picks && picks[it.id]) | 0; if (n <= 0) continue;
    if (it.res) for (const r in it.res) put(r, it.res[r] * n);
    if (it.id === 'moral') put('moral', MOOD.paket * n);
    if (it.id === 'crew') put('pop', 2 * n);
    if (it.id === 'core') put('core', n);
  }
  return order.map(r => {
    const per = NEED[r] ? NEED[r] * Math.max(1, s.pop) : 0;
    return { r, add: acc[r], days: per ? Math.round(acc[r] / per * 10) / 10 : null };
  });
}
function applyCargo(s, p, picks) {
  let kg = 0, crew = 0;
  for (const it of CARGO) {
    const n = picks[it.id] | 0;
    if (n < 0 || (it.max && n > it.max)) return { ok: false, why: 'max' };
    kg += n * it.kg;
    if (it.id === 'crew') crew = n * 2;
  }
  if (kg > p.mass) return { ok: false, why: 'mass' };
  if (crew > Math.max(0, beds(s) - s.pop)) return { ok: false, why: 'beds' };
  const W = WORLDS[s.world];
  for (const it of CARGO) {
    const n = picks[it.id] | 0; if (!n) continue;
    if (it.res) for (const r in it.res) s.res[r] += it.res[r] * n;
    if (it.id === 'moral') moodBump(s, MOOD.paket);
    if (it.id === 'core') s.core += n;
  }
  if (crew) {
    s.dose = (s.dose * s.pop + W.startDose * crew) / (s.pop + crew);
    s.pop += crew;
  }
  s.stat.ships++;
  log(s, L(`Kargo boşaltıldı: ${kg} kg${crew ? `, ${crew} yeni ekip üyesi` : ''}.`, `Cargo unloaded: ${kg} kg${crew ? `, ${crew} new crew` : ''}.`), 'good');
  return { ok: true, kg, crew };
}
function applyChoice(s, p, c) {
  const ev = EVENTS[p.id], ch = ev.ch[c] || ev.ch[0];
  if (ch.en && !ch.en(s, p)) return null;
  bankOpen(s, 'e:' + p.id); noteTag(s, 'e:' + p.id);
  const q = !!ev.q, ok = q ? ch.ok === true : null;
  const text = ch.fx(s, p) || null;
  return { text, fact: evFact(s, ev), real: realLine(s, 'ev', p.id), ok, why: q && !ok ? ev.why : null, sub: p.sub || null, more: p.more || null };
}
function afterResolve(s, p) {
  s.pending.splice(s.pending.indexOf(p), 1);
  if (p.type === 'event') s.decT = s.t;
  if (s.dose >= LIMIT_DOSE && !s.over && !s.train) finish(s, false, 'doz');
  checkMissions(s);
}

const TRACK = RES_KEYS.concat(['dose', 'moral', 'pop']);
function snapOf(s) { const o = {}; for (const k of RES_KEYS) o[k] = s.res[k]; o.dose = s.dose; o.moral = s.moral; o.pop = s.pop; o.busy = busyWorkers(s); return o; }
function deltaOf(a, b) { const d = {}; for (const k in a) { const v = b[k] - a[k]; if (Math.abs(v) > 1e-9) d[k] = v; } return d; }


function idlePv(s, p, c) {
  if (s.quiet || !p || p.type !== 'event') return null;
  const i = EVENTS[p.id].ch.findIndex(o => o.idle);
  return i >= 0 && i !== c ? previewChoice(s, p.pid, i) : null;
}
function logChoice(s, p, c, by, pv, pv0) {
  if (s.quiet) return;
  if (p.type === 'cargo') {
    const d = {}; for (const o of previewCargo(s, c || {})) d[o.r] = o.add;
    const nm = CARGO.filter(it => (c || {})[it.id] > 0);
    s.stat.choices.push({ t: s.t, id: 'cargo', c: Object.assign({}, c || {}), by, d, stops: [],
      pick: L(nm.map(it => `${c[it.id]}× ${it.name.tr}`).join(', ') || 'Boş', nm.map(it => `${c[it.id]}× ${it.name.en}`).join(', ') || 'Empty'),
      title: L('Kargo gemisi', 'Cargo ship') });
    return;
  }
  const ev = EVENTS[p.id], ch = ev.ch[c] || ev.ch[0];
  s.stat.choices.push({ t: s.t, id: p.id, c, by, d: pv ? Object.assign({}, pv.d) : {}, stops: pv ? pv.stops.map(o => ({ k: o.k, h: o.h })) : [], pick: ch.l, title: ev.title,
    h: pv ? pv.h : (ch.dur || 24), idle: !!ch.idle, d0: pv0 ? Object.assign({}, pv0.d) : null, stops0: pv0 ? pv0.stops.map(o => ({ k: o.k, h: o.h })) : null });
}
const normC = (p, c) => { const n = EVENTS[p.id].ch.length; return Number.isInteger(c) && c >= 0 && c < n ? c : 0; };


function resolve(s, c, pid) {
  const p = pid == null ? s.pending[0] : s.pending.find(o => o.pid === pid);
  if (!p) return null;
  let out = null;
  const before = snapOf(s);
  if (p.type === 'event') {
    c = normC(p, c);
    const ch = EVENTS[p.id].ch[c];
    if (ch.en && !ch.en(s, p)) return null;
    const pv = s.quiet ? null : previewChoice(s, p.pid, c), pv0 = idlePv(s, p, c);
    out = applyChoice(s, p, c);
    if (!out) return null;
    out.deltas = deltaOf(before, snapOf(s));
    logChoice(s, p, c, 'you', pv, pv0);
    if (out.more && !s.quiet) log(s, out.more, 'info');
  } else if (p.type === 'cargo') {
    const r0 = resSnap(s);
    out = applyCargo(s, p, c || {});
    if (!out.ok) return out;
    spendDiff(s, r0, 'kargo', 'kargo'); learnKey(s, 'first:kargo');
    wqPush(s, { act: 'cargo', t: s.t });
    out.real = realLine(s, 'ev', 'cargo');
    out.deltas = deltaOf(before, snapOf(s));
    logChoice(s, p, c || {}, 'you', null);
  }
  afterResolve(s, p);
  return out;
}

function dueStep(s) {
  for (const p of s.pending.slice()) {
    if (p.due == null || s.t < p.due || s.over) continue;
    s.stat.defaults++;
    if (p.type === 'cargo') {
      let picks = cargoSuggest(s, p.mass), r = applyCargo(s, p, picks);
      if (!r.ok) { delete picks.crew; r = applyCargo(s, p, picks); }
      if (!r.ok) { picks = {}; r = applyCargo(s, p, {}); }
      logChoice(s, p, picks, 'atlas', null);
      afterResolve(s, p);
      say(s, 'atlas', L('Kargoyu ben seçtim', 'I chose the cargo'),
        L(`Kimse seçmedi. Önerdiğim yükü indirdim: ${r.kg} kg${r.crew ? `, ${r.crew} yeni ekip üyesi` : ''}.`,
          `Nobody chose, so I unloaded my suggested load: ${r.kg} kg${r.crew ? `, ${r.crew} new crew` : ''}.`), { c: 'info', def: p.pid });
      continue;
    }
    const ev = EVENTS[p.id];
    let c = p.def;
    if (ev.ch[c].en && !ev.ch[c].en(s, p)) c = ev.ch.findIndex(o => !o.en || o.en(s, p));
    const pv = previewChoice(s, p.pid, c), pv0 = idlePv(s, p, c);
    const out = applyChoice(s, p, c);
    logChoice(s, p, c, 'atlas', pv, pv0);
    afterResolve(s, p);
    const lab = ev.ch[c].l, res = out && out.text;
    const body = ev.q
      ? L(`Yanıt gelmedi.${res ? ' ' + res.tr : ''} ${ev.why.tr}`, `No answer came.${res ? ' ' + res.en : ''} ${ev.why.en}`)
      : L(`Yanıt gelmedi. Ben "${lab.tr}" dedim.${res ? ' ' + res.tr : ''}`, `No answer came, so I chose "${lab.en}".${res ? ' ' + res.en : ''}`);
    say(s, 'atlas', L(`ATLAS karar verdi: ${ev.title.tr}`, `ATLAS decided: ${ev.title.en}`), body,
      { fact: out && out.fact, c: 'info', def: p.pid, ev: p.id });
  }
}



const PV_KEYS = RES_KEYS.concat(['dose', 'moral', 'pop', 'guc']);
const PV_WORD = {
  o2: L('oksijen', 'oxygen'), su: L('su', 'water'), gida: L('yemek', 'food'), malzeme: L('malzeme', 'material'), parca: L('yedek parça', 'spare parts'),
  bilim: L('bilim', 'science'), dose: L('radyasyon', 'radiation'), moral: L('moral', 'morale'), pop: L('kişi', 'people'), guc: L('elektrik', 'power'),
};
const PV_MIN = { guc: 1 };

function pvNum(v, lang) {
  const a = Math.abs(v), r = a >= 1.5 ? String(Math.round(a)) : a.toFixed(1);
  return (v < 0 ? '−' : '+') + (lang === 'tr' ? r.replace('.', ',') : r);
}
function pvParts(s, d, stops) {
  const tr = [], en = [];
  for (const k of PV_KEYS) {
    const v = d[k]; if (!(Math.abs(v) >= (PV_MIN[k] || 0.5))) continue;
    tr.push(`${pvNum(v, 'tr')} ${PV_WORD[k].tr}`); en.push(`${pvNum(v, 'en')} ${PV_WORD[k].en}`);
  }
  for (const o of stops) {
    const n = bname(s, o.k), hh = Math.abs(o.h);
    if (o.h > 0) { tr.push(`${n.tr} ${hh} saat durur`); en.push(`${n.en} stops for ${hh} h`); }
    else { tr.push(`${n.tr} ${hh} saat fazla çalışır`); en.push(`${n.en} runs ${hh} h longer`); }
  }
  return { tr, en };
}

function pvKid(s, d, stops, h) {
  const tr = [], en = [], hh = Math.max(1, h || 24);
  for (const k of PV_KEYS) {
    let v = d[k]; if (!isFinite(v)) continue;
    if (k === 'guc') { v = v / hh; if (Math.abs(v) < 0.3) continue; const a = (v < 0 ? '−' : '+') + (Math.abs(v) >= 2 ? String(Math.round(Math.abs(v))) : Math.abs(v).toFixed(1)); tr.push(a.replace('.', ',') + ' elektrik'); en.push(a + ' power'); continue; }
    if (k === 'dose' && easy(s)) { v = v / LIMIT_DOSE * 100; if (Math.abs(v) < 0.5) continue; const a = Math.abs(v) >= 1.5 ? String(Math.round(Math.abs(v))) : Math.abs(v).toFixed(1); tr.push((v < 0 ? '−%' : '+%') + a.replace('.', ',') + ' radyasyon'); en.push((v < 0 ? '−' : '+') + a + '% radiation'); continue; }
    if (!(Math.abs(v) >= 0.5)) continue;
    tr.push(`${pvNum(v, 'tr')} ${PV_WORD[k].tr}${k === 'dose' ? ' (mSv)' : ''}`); en.push(`${pvNum(v, 'en')} ${PV_WORD[k].en}${k === 'dose' ? ' (mSv)' : ''}`);
  }
  const p2 = pvParts(s, {}, stops || []); tr.push(...p2.tr); en.push(...p2.en);
  return { tr, en };
}
function pvSub(a, b) { const d = {}; for (const k of PV_KEYS) d[k] = (a[k] || 0) - ((b && b[k]) || 0); return d; }
function stopSub(a, b) { const m = {}; for (const o of a || []) m[o.k] = (m[o.k] || 0) + o.h; for (const o of b || []) m[o.k] = (m[o.k] || 0) - o.h; return Object.keys(m).filter(k => Math.abs(m[k]) >= 1).map(k => ({ k, h: m[k] })); }
function pvText(s, d, stops, h, bad) {
  const { tr, en } = pvParts(s, d, stops);
  const bt = tr.length ? tr.join(' · ') : 'fark yok', be = en.length ? en.join(' · ') : 'no change';
  const mars = s.world === 'mars', dd = h >= 48 && h % 24 === 0;
  const sp = dd ? L(`${h / 24} ${mars ? 'solde' : 'günde'}`, `${h / 24} ${mars ? 'sols' : 'days'}`) : L(`${h} saatte`, `${h} hours`);
  return bad ? L(`Şanssızsan ${sp.tr}: ${bt}.`, `If unlucky, in ${sp.en}: ${be}.`) : L(`${sp.tr[0].toUpperCase() + sp.tr.slice(1)}: ${bt}.`, `In ${sp.en}: ${be}.`);
}

function pvRun(c, H) {
  const acc = { guc: 0, stop: {} };
  c.quiet = true;
  for (let i = 0; i < H && !c.over; i++) {
    tick(c);
    acc.guc += c.pw.gen - c.pw.use;
    for (const b of c.b) if (b.left === 0 && b.st !== 'ok') acc.stop[b.id] = (acc.stop[b.id] || 0) + 1;
  }
  return acc;
}
function pvDiff(s, A, B, ra, rb, H, bad, extra) {
  const d = {};
  for (const k of RES_KEYS) d[k] = A.res[k] - B.res[k];
  d.dose = A.dose - B.dose; d.moral = A.moral - B.moral; d.pop = A.pop - B.pop; d.guc = ra.guc - rb.guc;
  const by = {};
  for (const b of A.b) { const v = (ra.stop[b.id] || 0) - (rb.stop[b.id] || 0); if (v) by[b.k] = (by[b.k] || 0) + v; }
  for (const b of B.b) if (!A.b.some(o => o.id === b.id) && rb.stop[b.id]) by[b.k] = (by[b.k] || 0) - rb.stop[b.id];
  const stops = Object.keys(by).filter(k => Math.abs(by[k]) >= 1).map(k => ({ k, h: by[k] })).sort((a, b) => Math.abs(b.h) - Math.abs(a.h));
  return Object.assign({ d, stops, h: H, risk: null, text: pvText(s, d, stops, H, bad) }, extra || {});
}
const PV_CACHE = new Map();


const pvKey = (s, tag) => [tag, s.world, s.level, s.seed, s.t, s.rs, s.nid, s.pop, s.dose, s.moral, s.mmod, s.stored, s.core,
  s.pending.map(p => p.pid + ':' + (p.id || p.type)).join(','), s.b.map(b => b.id + (b.on ? 'a' : 'k') + (b.broken ? 'b' : '') + b.left + ':' + (b.grow || 0)).join(','),
  s.fx.busy.map(o => o.until + 'x' + o.n).join(','), RES_KEYS.map(k => s.res[k]).join(','), Object.keys(s.techs).join('')].join('|');
function pvCached(key, f) {
  if (PV_CACHE.has(key)) return PV_CACHE.get(key);
  const v = f();
  if (PV_CACHE.size > 48) PV_CACHE.clear();
  PV_CACHE.set(key, v);
  return v;
}


function previewChoice(s, pid, c) {
  const p = s.pending.find(o => o.pid === pid);
  if (!p || p.type !== 'event') return null;
  c = normC(p, c);
  const ch = EVENTS[p.id].ch[c], H = Math.min(96, ch.dur || 24);
  return pvCached(pvKey(s, `c${pid}:${c}`), () => {
    const A = JSON.parse(JSON.stringify(s)), B = JSON.parse(JSON.stringify(s));
    A.quiet = true; B.quiet = true;
    if (ch.risky) A.forceRoll = 'bad';
    const off = !(resolve(A, c, pid));
    B.pending = B.pending.filter(o => o.pid !== pid);
    const ra = pvRun(A, H), rb = pvRun(B, H);
    const out = pvDiff(s, A, B, ra, rb, H, !!ch.risky, off ? { off: true } : null);
    if (ch.risky) out.risk = L('Yarı yarıya şans: şanssızsan bu olur.', 'A 50-50 chance: this happens if you are unlucky.');
    return out;
  });
}

function previewToggle(s, b) {
  if (!b || b.k === 'hub' || b.left !== 0) return null;
  const H = 24;
  return pvCached(pvKey(s, `t${b.id}`), () => {
    const A = JSON.parse(JSON.stringify(s)), B = JSON.parse(JSON.stringify(s));
    A.quiet = true; B.quiet = true;
    toggle(A, A.b.find(o => o.id === b.id));
    const ra = pvRun(A, H), rb = pvRun(B, H);
    return pvDiff(s, A, B, ra, rb, H, false);
  });
}

function choiceHint(s, p, id, i) {
  const ch = EVENTS[id].ch[i], lead = typeof ch.lead === 'function' ? ch.lead(s, p) : (ch.lead || L('', ''));
  const pv = p && p.pid != null && s.pending.some(o => o.pid === p.pid) ? previewChoice(s, p.pid, i) : null;
  if (!pv) return lead;
  if (pv.off) return L(`${lead.tr} Şu an yapılamaz: yeterli yedek parça yok.`, `${lead.en} Not possible now: not enough spare parts.`);
  return L(`${lead.tr} ${pv.text.tr}`, `${lead.en} ${pv.text.en}`);
}

function activeEffects(s) {
  const out = [], t = s.t, fx = s.fx;
  const add = (id, icon, until, label, c) => { if (until > t) out.push({ id, icon, label, left: until - t, c }); };
  add('siginak', 'flare', fx.lockUntil || 0, L('Herkes sığınakta: dışarıda iş yok', 'Everyone in shelter: no outside work'), 'bad');
  add('izin', 'heart', fx.restUntil || 0, L('İzin günü: herkes yarım çalışıyor', 'Day off: everyone works half time'), 'warn');
  add('kuf', 'leaf', fx.moldUntil || 0, L('Küf: seralar ürün vermiyor', 'Mould: greenhouses give no food'), 'bad');
  if (!s.techs.toz) add('tozlu', 'sun', fx.dustUntil || 0, L('Tozlu paneller: %20 az elektrik', 'Dusty panels: 20% less power'), 'warn');
  add('temiz', 'sun', fx.cleanUntil || 0, L('Tertemiz paneller: %5 fazla elektrik', 'Spotless panels: 5% more power'), 'good');
  add('hortum', 'sun', fx.devilUntil || 0, L('Hortum paneli sildi: %15 fazla elektrik', 'Whirlwind cleaned the panels: 15% more power'), 'good');
  for (const o of fx.busy) {
    if (o.until <= t) continue;
    const lab = o.id === 'toz' ? L(`Panel temizliği: ${o.n} kişi dışarıda`, `Panel cleaning: ${o.n} people outside`)
      : o.id === 'teklif' ? L(`Deney: ${o.n} kişi meşgul`, `Experiment: ${o.n} person busy`) : L(`${o.n} kişi meşgul`, `${o.n} busy`);
    out.push({ id: 'mesgul' + (o.id ? ':' + o.id : ''), icon: o.id === 'toz' ? 'sun' : 'flask', label: lab, left: o.until - t, c: 'info' });
  }
  if (stormOn(s)) out.push({ id: 'firtina', icon: 'storm', label: L('Toz fırtınası: paneller zayıf', 'Dust storm: panels are weak'), left: s.storm.until - t, c: 'bad' });
  if (WORLDS[s.world].night && isDark(s)) {
    const N = WORLDS[s.world].night;
    out.push({ id: 'gece', icon: 'night', label: L('Uzun gece: paneller çalışmıyor', 'Long night: panels make nothing'), left: Math.max(1, N.len * 24 - nightPhase(s, t)), c: 'warn' });
  }
  return out;
}

function keyChoices(s) {
  const W = WORLDS[s.world], pop = Math.max(1, s.pop);
  const norm = { o2: pop * NEED.o2, su: pop * NEED.su, gida: pop * NEED.gida, malzeme: 12, parca: 3, bilim: 4, dose: W.doseRate, moral: 5, pop: 1, guc: 24 };
  const list = (s.stat.choices || []).filter(o => o.id !== 'cargo').map(o => {
    let w = 0;
    for (const k in norm) w += Math.abs(o.d[k] || 0) / norm[k];
    for (const st of o.stops || []) w += Math.abs(st.h) / 24;
    return { o, w };
  });

  list.sort((a, b) => (a.o.by === 'atlas') - (b.o.by === 'atlas') || b.w - a.w || a.o.t - b.o.t);
  return list.slice(0, 3).sort((a, b) => a.o.t - b.o.t).map(({ o }) => {

    const vs = o.d0 ? pvKid(s, pvSub(o.d, o.d0), stopSub(o.stops, o.stops0), o.h) : pvKid(s, o.d, o.stops || [], o.h);
    const lead = o.d0 ? L('Hiçbir şey yapmamaya göre: ', 'Compared with doing nothing: ') : o.idle ? L('Hiçbir şey yapmadın: ', 'You did nothing: ') : L('', '');
    const body = L(lead.tr + (vs.tr.join(' · ') || 'fark olmadı') + '.', lead.en + (vs.en.join(' · ') || 'no change') + '.');
    const eff = body;
    return { day: Math.floor(o.t / 24) + 1, title: o.title, pick: o.pick, effect: eff, by: o.by };
  });
}

const MISSIONS = [
  { id: 'guc', t: L('Işıkları yak', 'Lights on'), d: L('2 Güneş Paneli kur.', 'Build 2 Solar Panels.'), chk: s => cnt(s, 'gunes') >= 2, r: { parca: 4 } },
  { id: 'o2', t: L('İlk nefes', 'First breath'), d: L('Bir Hava Makinesi kur ve çalıştır.', 'Build an Air Maker and get it running.'), chk: s => cnt(s, 'oksijen', 1) >= 1, r: { malzeme: 20 } },
  { id: 'su', t: L('Buzdan suya', 'Ice to water'), d: L('Mavi buz alanına bir Buz Çıkarıcı kur.', 'Build an Ice Extractor on a blue ice patch.'), chk: s => cnt(s, 'su', 1) >= 1, r: { parca: 4 } },
  { id: 'sera', t: L('İlk tohum', 'First seeds'), d: L('Bir Sera kur. İlk ürün 4 günde gelir, erken kur.', 'Build a Greenhouse. The first crop takes 4 days, so start early.'), chk: s => cnt(s, 'sera') >= 1, r: { malzeme: 20 } },
  { id: 'pil', t: L('Karanlığa hazırlık', 'Ready for the dark'), d: L('2 Batarya kur.', 'Build 2 Battery Banks.'), chk: s => cnt(s, 'batarya') >= 2, r: { parca: 5 } },
  { id: 'maden', t: L('Yerel kaynak', 'Living off the land'), d: L('Bir Toprak Kazıcı kur. Turuncu maden alanında daha çok verir.', 'Build a Soil Digger. It gives more on an orange mineral patch.'), chk: s => cnt(s, 'maden') >= 1, r: { parca: 5 } },
  { id: 'kalkan', t: L('Radyasyon kalkanı', 'Radiation shield'), d: L('İniş Modülüne git ve üstünü toprakla ört.', 'Go to the Landing Module and cover it with soil.'), chk: s => shieldedBeds(s) >= 4, r: { bilim: 10 } },
  { id: 'kesif', t: L('Bilinmeyene', 'Into the unknown'), d: L('Mavi buz ya da turuncu maden alanına dokun. Astronot yanına gidince İncele düğmesine dokun.', 'Tap a blue ice or orange mineral patch. When the astronaut is next to it, tap the Scan button.'), chk: s => s.stat.scans >= 1, r: { bilim: 8 } },
  { id: 'ekip', t: L('Büyüyen ekip', 'A growing crew'), d: L('Ekibi 6 kişi yap. Önce bir Yaşam Modülü kur. Sonra kargo gemisi inince yükten "2 kişilik ekip"i seç.', 'Grow the crew to 6. First build a Habitat Module. Then, when the cargo ship lands, pick "Crew of 2" from its load.'), chk: s => s.pop >= 6, r: { malzeme: 30 } },
  { id: 'bilim', t: L('Araştırma', 'Research'), d: L('2 buluş yap.', 'Make 2 inventions.'), chk: s => techCount(s) >= 2, r: { parca: 6 } },
  { id: 'dongu', t: L('Hiçbir şey boşa gitmesin', 'Waste nothing'), d: L('Bir Su ve Hava Geri Dönüştürücü çalıştır.', 'Get a Water & Air Recycler running.'), chk: s => cnt(s, 'geri', 1) >= 1, r: { bilim: 10 } },
  { id: 'self', t: L('Kendi ayakların üzerinde', 'On your own feet'), d: L('Kendi kendine yetmeyi %80 yap: havanın, suyun ve yemeğin çoğunu kendin yap.', 'Reach 80% self-reliance: make most of your own air, water and food.'), chk: s => s.selfE >= 0.8, r: { parca: 8 } },
  { id: 'kalici', t: L('Kalıcı üs', 'A permanent base'), d: L('8 kişilik ekip ve %100 kendi kendine yetme.', 'A crew of 8 and 100% self-reliance.'), chk: s => s.pop >= 8 && s.selfE >= 0.99, r: { bilim: 20 } },
];
function checkMissions(s) {
  for (const m of MISSIONS) {
    if (s.done[m.id] || !m.chk(s)) continue;
    s.done[m.id] = s.t || 1;
    for (const r in m.r) s.res[r] += m.r[r];
    s.fx.missionT = s.t; s.fx.missionId = m.id;
    if (!s.quiet) { if (!s.story.goalQ) s.story.goalQ = []; s.story.goalQ.push(m.id); }
  }
  checkCosmetics(s);
  checkAch(s);
}
const missionCount = s => Object.keys(s.done).length;


const GOAL_GAP = 6;
function goalStep(s) {
  const st = s.story, q = st.goalQ;
  if (!q || !q.length || s.t - (st.goalT == null ? -99 : st.goalT) < GOAL_GAP) return false;
  const last = s.radio.length ? s.radio[s.radio.length - 1] : null;
  if (last && last.t === s.t) return false;
  const m = MISSIONS.find(o => o.id === q[0]);
  q.shift(); st.goalT = s.t;
  if (!m) return false;
  const rw = Object.keys(m.r).map(k => [`+${m.r[k]} ${PV_WORD[k].tr}`, `+${m.r[k]} ${PV_WORD[k].en}`]);
  const head = L(`Hedef tamam!${rw.length ? ' Ödül: ' + rw.map(x => x[0]).join(', ') + '.' : ''}`,
    `Goal complete!${rw.length ? ' Reward: ' + rw.map(x => x[1]).join(', ') + '.' : ''}`);
  const real = realLine(s, 'ms', m.id), title = m.t;
  const nx0 = currentGoal(s), nx = nx0 && nx0.act === 'build' && nx0.bk && s.b.some(b => b.k === nx0.bk && b.left > 0) ? null : nx0;
  const tail = nx ? L(` Sıradaki: ${nx.k.tr}.`, ` Next: ${nx.k.en}.`) : L('', '');
  if (!real) { say(s, 'atlas', title, L(head.tr + tail.tr, head.en + tail.en), { c: 'good', goal: m.id }); return true; }

  const strip = (t, re) => String(t).replace(re, '');
  say(s, 'atlas', title, L('Hedef tamam! Gerçekte: ' + strip(real.tr, /^\s*Gerçekte\s*:\s*/i) + tail.tr, 'Goal complete! In real life: ' + strip(real.en, /^\s*(In real life|In reality|Really)\s*:\s*/i) + tail.en),
    { c: 'good', goal: m.id, src: real.src || null });
  return true;
}



const hasReal = () => typeof REAL !== 'undefined' && !!REAL;
const cosmetics = () => (typeof COSMETICS !== 'undefined' && Array.isArray(COSMETICS)) ? COSMETICS : [];
const realBank = () => (hasReal() && Array.isArray(REAL.bank)) ? REAL.bank : [];

function realLine(s, tab, id) {
  if (!hasReal() || !REAL[tab] || !REAL[tab][id]) return null;
  let v = REAL[tab][id];
  if (v && typeof v.tr !== 'string' && (v.ay || v.mars)) v = v[s.world];
  return v && typeof v.tr === 'string' && typeof v.en === 'string' ? v : null;
}

function sciTotal(s) {
  let n = fin(s.res.bilim);
  for (const id in s.techs) if (TECHS[id]) n += TECHS[id].cost || 0;
  return n;
}


function ruleProg(s, r) {
  if (!r || typeof r !== 'object') return 0;
  const frac = (have, need) => { need = Math.max(1, need || 1); return clamp(fin(have) / need, 0, 1); };
  const yes = b => b ? 1 : 0;
  switch (r.t) {
    case 'mission': return yes(s.done[r.id] != null);
    case 'missions': { const a = r.all || []; return a.length ? a.filter(id => s.done[id] != null).length / a.length : 0; }
    case 'bank': { const a = r.any || (r.id ? [r.id] : []); return frac(a.filter(id => s.bank[id] != null).length, r.n || 1); }
    case 'sci': return frac(sciTotal(s), r.n);
    case 'relics': return r.id != null ? yes(s.story.relics[r.id] != null) : frac(Object.keys(s.story.relics).length, r.n || 1);
    case 'ships': return frac(s.stat.ships, r.n || 1);
    case 'tag': return yes(s.tags[r.id] != null);
    case 'cause': return yes(s.stat.causes.some(c => c.r === r.r && (!r.why || c.why === r.why)));
    case 'stat': { const v = s.stat[r.key]; return frac(typeof v === 'object' && v ? Object.values(v).reduce((a, x) => a + fin(x), 0) : (v === true ? 1 : v), r.min == null ? 1 : r.min); }
    case 'built': return r.n ? frac(cnt(s, r.k), r.n) : yes(s.bank['b:' + r.k] != null);
    case 'choice': return yes((s.stat.choices || []).some(o => o.id === r.id && (r.c == null || o.c === r.c)));
    case 'event': return yes(s.tags['e:' + r.id] != null || s.bank['e:' + r.id] != null);
    case 'ach': return yes(achHave(s, r.id));
    case 'stage': return frac(buildStage(s), r.n || 2);
    case 'work': return frac((s.stat.wqOk || 0) + (s.stat.qeOk || 0), r.n || 1);
    case 'train': return yes(s.tags['x:egitim'] != null);
  }
  return 0;
}
const ruleMet = (s, r) => ruleProg(s, r) >= 1;

function checkCosmetics(s) {
  const list = cosmetics();
  if (!list.length) return [];
  if (!s.unl) s.unl = {};
  if (s.train) return [];
  const got = [];
  for (const c of list) {
    if (c.def || !c.rule || s.unl[c.id] != null) continue;
    if (ruleMet(s, c.rule)) { s.unl[c.id] = s.t; got.push(c.id); }
  }
  return got;
}

function nextRewards(s, have) {
  const h = have || {}, u = s.unl || {};
  return cosmetics().map((c, i) => ({ c, i }))
    .filter(({ c }) => !c.def && c.rule && !h[c.id] && u[c.id] == null)
    .map(({ c, i }) => ({ id: c.id, cat: c.cat, name: c.name, how: c.how || null, prog: ruleProg(s, c.rule), i }))
    .sort((a, b) => b.prog - a.prog || a.i - b.i).slice(0, 3)
    .map(({ i, ...o }) => o);
}



const WORK_ACTS = ['repair', 'scan', 'build', 'cargo'];
const WQ_GAP = 8;
const workList = () => (typeof WORKQ !== 'undefined' && Array.isArray(WORKQ)) ? WORKQ
  : (typeof globalThis !== 'undefined' && Array.isArray(globalThis.__uuWORKQ)) ? globalThis.__uuWORKQ : [];
function wqInit(s) {
  if (!s.wq || typeof s.wq !== 'object') s.wq = { ev: [], n: 0, last: -99, asked: {}, cur: null };
  if (!Array.isArray(s.wq.ev)) s.wq.ev = [];
  if (!s.wq.asked) s.wq.asked = {};
  if (s.wq.n == null) s.wq.n = 0;
  if (s.wq.last == null) s.wq.last = -99;
  return s.wq;
}

function wqPush(s, o) {
  if (s.quiet) return;
  const w = wqInit(s);
  w.ev.push(o);
  while (w.ev.length > 4) w.ev.shift();
}
const WQ_TRAIN = {};
const wqKey = (q, i) => (q && q.id != null ? String(q.id) : 'i' + i);

function workQ(s, act, k) {
  const list = workList();
  if (!list.length || !WORK_ACTS.includes(act)) return null;
  const w = wqInit(s);
  if (!s.train && s.t - w.last < WQ_GAP) return null;

  if (act === 'scan' && !s.train && (s.stat.scans || 0) < 2) return null;
  const fit = [];
  list.forEach((q, i) => {
    if (!q || !q.q || !Array.isArray(q.a) || q.a.length < 2) return;
    if (q.act !== act && q.act !== 'any') return;
    if (act === 'scan' && q.teach && !learned(s, q.teach)) return;
    if (q.w && q.w !== s.world) return;
    if (easy(s) && (q.lv || 1) !== 1) return;
    if (k != null && q.k && q.k !== k) return;
    fit.push(i);
  });
  if (!fit.length) return null;
  if (!w.shown) w.shown = {};

  const notT = i => !!s.train || !WQ_TRAIN[wqKey(list[i], i)];
  const fresh = fit.filter(i => w.asked[wqKey(list[i], i)] == null && !w.shown[wqKey(list[i], i)] && notT(i));
  const fitT = fit.filter(notT);
  const pool = fresh.length ? fresh : (fitT.length ? fitT : fit);
  const qi = pool[w.n % pool.length];
  w.shown[wqKey(list[qi], qi)] = 1; if (s.train) WQ_TRAIN[wqKey(list[qi], qi)] = 1;
  w.n++; w.last = s.t; w.cur = { qi, act, t: s.t };
  const q = list[qi];
  return { qi, q: q.q, a: q.a.slice(), act, e: q.e || null, src: q.src || (q.e && q.e.src) || null };
}
const WQ_PLAIN = {
  repair: L('Onarım bitti.', 'Repair done.'), scan: L('Tarama bitti.', 'Scan done.'),
  build: L('Kurulum sürüyor.', 'Setup under way.'), cargo: L('Kargo boşaltıldı.', 'Cargo unloaded.'),
};

function workAnswer(s, qi, choice, ev) {
  const w = wqInit(s), q = workList()[qi];
  if (!q || !w.cur || w.cur.qi !== qi) return null;
  const act = (ev && WORK_ACTS.includes(ev.act)) ? ev.act : (q.act !== 'any' ? q.act : w.cur.act);
  w.cur = null;
  const ok = choice === 0;
  w.asked[wqKey(q, qi)] = ok ? 1 : 0;
  s.stat.wqN = (s.stat.wqN || 0) + 1;
  if (ok) s.stat.wqOk = (s.stat.wqOk || 0) + 1;
  const b = ev && ev.bid != null ? s.b.find(o => o.id === ev.bid) : null;
  const r0 = resSnap(s);
  let line;
  if (act === 'repair') {
    if (ok) { s.res.parca += 1; line = L('Sağlam onarım! 1 parça geri kazandın.', 'Solid repair! You got 1 spare part back.'); }
    else { if (b) b.slow = s.t + 3; line = L('Zayıf yama: makine 3 saat yarım hızda.', 'Weak patch: the machine runs at half speed for 3 hours.'); }
  } else if (act === 'scan') {
    if (ok) { s.res.bilim += 3; line = L('Dikkatli tarama! +3 bilim.', 'Careful scan! +3 science.'); }
    else { s.res.bilim = Math.max(0, s.res.bilim - 1); line = L('Aceleci tarama: 1 bilim eksik.', 'Rushed scan: 1 science less.'); }
  } else if (act === 'build') {
    if (ok) { if (b && b.left > 1) b.left = Math.ceil(b.left / 2); line = L('Sağlam kurulum! Yapım yarı sürede biter.', 'Solid setup! It will be ready in half the time.'); }
    else if (b && b.left > 0) { b.left += 2; line = L('Hatalı kurulum: yapım 2 saat uzadı.', 'Faulty setup: building takes 2 hours longer.'); }
    else { if (b) b.slow = s.t + 2; line = L('Hatalı kurulum: yapı 2 saat yarım hızda.', 'Faulty setup: half speed for 2 hours.'); }
  } else {
    if (ok) { s.res.parca += 4; line = L('Düzenli boşaltma! +4 yedek parça.', 'Neat unloading! +4 spare parts.'); }
    else { const n = Math.min(5, Math.max(0, s.res.malzeme)); s.res.malzeme -= n; line = L(`Hırpalanan yük: ${n} malzeme kayıp.`, `Rough unloading: ${n} material lost.`); }
  }
  spendDiff(s, r0, 'odul', 'ceza');
  checkMissions(s);
  return { ok, line, e: q.e || null };
}

function workSkip(s, qi) {
  const w = wqInit(s), q = workList()[qi];
  if (!q || !w.cur || w.cur.qi !== qi) return null;
  const act = w.cur.act;
  w.cur = null;
  w.asked[wqKey(q, qi)] = -1;
  s.stat.wqSkip = (s.stat.wqSkip || 0) + 1;
  return { ok: null, line: WQ_PLAIN[act] || WQ_PLAIN.repair, e: null };
}



const SPEND_MAX = 12, SPEND_WHY = ['build', 'repair', 'ceza', 'iade', 'kargo', 'odul', 'sure'];
function spendLog(s, r, n, why) {
  if (s.quiet || !n || !Number.isFinite(n)) return;
  if (s.train && n < 0 && (why === 'repair' || why === 'ceza' || why === 'sure')) return;
  if (!s.fx) s.fx = {};
  if (!Array.isArray(s.fx.spend)) s.fx.spend = [];
  s.fx.spend.push({ r, n: Math.round(n * 100) / 100, why: SPEND_WHY.includes(why) ? why : 'build', t: s.t });
  while (s.fx.spend.length > SPEND_MAX) s.fx.spend.shift();
}

function spendDiff(s, before, whyPlus, whyMinus) {
  for (const r of RES_KEYS) { const d = s.res[r] - before[r]; if (Math.abs(d) > 1e-9) spendLog(s, r, d, d > 0 ? whyPlus : whyMinus); }
  if (before.core != null && s.core !== before.core) spendLog(s, 'core', s.core - before.core, s.core > before.core ? whyPlus : whyMinus);
}
const resSnap = s => { const o = { core: s.core }; for (const r of RES_KEYS) o[r] = s.res[r]; return o; };



const TEACH_MAX = 6;
const teachList = () => (typeof TEACH !== 'undefined' && Array.isArray(TEACH)) ? TEACH
  : (typeof globalThis !== 'undefined' && Array.isArray(globalThis.__uuTEACH)) ? globalThis.__uuTEACH : [];
function learnInit(s) {
  if (!s.learn || typeof s.learn !== 'object') s.learn = {};
  if (!s.fx) s.fx = {};
  if (!Array.isArray(s.fx.teach)) s.fx.teach = [];
  return s.learn;
}
function learnKey(s, key) {
  const list = teachList();
  if (!list.length || !key) return [];
  learnInit(s);
  const out = [];
  for (const t of list) {
    if (!t || t.id == null || t.on !== key) continue;
    if (t.w && t.w !== s.world) continue;
    if (s.learn[t.id] != null) continue;
    s.learn[t.id] = s.t; out.push(t.id);
    if (!s.quiet) { s.fx.teach.push(t.id); while (s.fx.teach.length > TEACH_MAX) s.fx.teach.shift(); }
  }
  return out;
}
const learned = (s, id) => !!s.learn && s.learn[id] != null;



const QE_TIME = { kasif: 30, muhendis: 15 };
function qInit(s) {
  const w = wqInit(s);
  if (!w.qa || typeof w.qa !== 'object') w.qa = {};
  if (w.bp == null) w.bp = 0;
  if (w.bq == null) w.bq = 0;
  return w;
}
function qHash(seed, n) {
  let h = (Math.imul((seed | 0) ^ 0x5bd1e995, 0x2c1b3c6d) + Math.imul(n | 0, 0x297a2d39)) | 0;
  h ^= h >>> 15; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return h >>> 0;
}

function buildMoment(s, w, k) {
  const first = s.b.filter(b => b.k === k).length <= 1;
  if (first) return false;
  const d = w.bp - w.bq;
  if (d < 2) return false;
  if (d >= 4) return true;
  return qHash(s.seed, w.bp) % 3 === 0;
}


const ckRecentTeach = (s, n) => Object.keys(s.learn || {}).sort((a, b) => s.learn[b] - s.learn[a]).slice(0, n);
function quickQ(s, act, k, opts) {
  if (act !== 'repair' && act !== 'build') return null;
  const list = workList();
  if (!list.length) return null;
  const w = qInit(s), o = opts || {};
  if (w.qn == null) w.qn = 0;
  if (act === 'build') {
    if (s.train && !o.force) return null;
    if (!o.force) { w.bp++; if (!buildMoment(s, w, k)) return null; }
  }
  const base = q => !!q && !!q.q && Array.isArray(q.a) && q.a.length >= 2 && (!q.w || q.w === s.world) && !(easy(s) && (q.lv || 1) !== 1);
  const actOk = (q, a) => q.act === a || q.act === 'any';
  const taught = q => !q.teach || learned(s, q.teach);
  const key = i => wqKey(list[i], i), rec = i => w.qa[key(i)];
  const ask = qi => {
    const r = w.qa[key(qi)] || { n: 0, t: -99, bad: 0 };
    r.n++; r.t = s.t; r.at = w.qn; w.qn++; w.qa[key(qi)] = r;
    if (act === 'build' && !o.force) w.bq = w.bp;
    w.qcur = { qi, act, k: k == null ? null : k, t: s.t };
    const q = list[qi];
    return { qi, q: q.q, a: q.a.slice(), act, k: k == null ? null : k, teach: q.teach || null, e: q.e || null, src: q.src || (q.e && q.e.src) || null };
  };

  const fq = s.fx && s.fx.forceQ;
  if (fq && fq.act === act) {
    delete s.fx.forceQ;
    const fi = list.findIndex(q => q && q.id != null && q.id === fq.id);
    if (fi >= 0 && list[fi].q && Array.isArray(list[fi].a) && list[fi].a.length >= 2) return ask(fi);
  }
  const ownT = k == null ? [] : teachList().filter(t => t && t.on === 'build:' + k && (!t.w || t.w === s.world)).map(t => t.id);
  const own = q => k != null && (q.k === k || (!!q.teach && ownT.includes(q.teach)));
  const idx = []; list.forEach((q, i) => { if (base(q)) idx.push(i); });
  const gap = i => { const r = rec(i); return r ? w.qn - (r.at == null ? -1e9 : r.at) - 1 : Infinity; };
  const pickIn = g => {
    if (!g.length) return null;
    const bad = g.filter(i => rec(i) && rec(i).bad && gap(i) >= 2).sort((a, b) => (rec(a).at ?? -1e9) - (rec(b).at ?? -1e9) || a - b);
    if (bad.length) return bad[0];
    const never = g.filter(i => !rec(i));
    const nv = never.filter(i => list[i].k && list[i].k === k)[0] ?? never.filter(i => !list[i].k)[0] ?? never[0];
    if (nv != null) return nv;
    const okR = g.filter(i => rec(i) && !rec(i).bad && gap(i) >= 5).sort((a, b) => rec(a).t - rec(b).t || a - b);
    return okR.length ? okR[0] : null;
  };
  const relax = g => g.length ? (g.filter(i => rec(i) && rec(i).bad).sort((a, b) => rec(a).t - rec(b).t || a - b)[0]
    ?? g.filter(i => !rec(i))[0] ?? g.slice().sort((a, b) => rec(a).t - rec(b).t || a - b)[0]) : null;
  let qi = null;
  if (act === 'repair') {
    const fit = idx.filter(i => { const q = list[i]; return actOk(q, 'repair') && !(q.k && (k == null || q.k !== k)); });
    const tFit = fit.filter(i => taught(list[i]));
    const bOwn = idx.filter(i => list[i].act === 'build' && own(list[i]) && taught(list[i]));
    if (tFit.length) qi = pickIn(tFit) ?? relax(tFit);
    else if (bOwn.length) qi = pickIn(bOwn) ?? relax(bOwn);
    else qi = relax(fit);
  } else {
    const ownG = idx.filter(i => actOk(list[i], 'build') && own(list[i]) && taught(list[i]));
    const r5 = ckRecentTeach(s, 5);
    const recG = idx.filter(i => actOk(list[i], 'build') && list[i].teach && r5.includes(list[i].teach) && taught(list[i]) && !(list[i].k && list[i].k !== k && !list[i].teach));
    const ownA = idx.filter(i => actOk(list[i], 'build') && own(list[i]));
    qi = ownG.length ? (pickIn(ownG) ?? relax(ownG)) : (pickIn(recG) ?? (ownA.length ? relax(ownA) : relax(recG)));
  }
  if (qi == null) return null;
  return ask(qi);
}

function qMark(s, qi, ok) {
  const w = qInit(s), list = workList(), q = list[qi];
  if (q) { const r = w.qa[wqKey(q, qi)] || { n: 1, t: s.t, bad: 0 }; r.bad = ok ? 0 : 1; w.qa[wqKey(q, qi)] = r; }
  w.qcur = null;
  s.stat.qeN = (s.stat.qeN || 0) + 1;
  if (ok) s.stat.qeOk = (s.stat.qeOk || 0) + 1; else s.stat.qeBad = (s.stat.qeBad || 0) + 1;
  return q || null;
}


const repairExtra = (s, b) => Math.max(1, Math.ceil(repairCost(s, b) / 2));
const buildExtra = (s, b) => Math.max(2, Math.ceil(((b && b.pm != null) ? b.pm : costOf(s, b.k).m) / 5));
const QE_PART_M = 2, QE_SLOW_H = 3;
const qeWord = { parca: L('yedek parça', 'spare parts'), malzeme: L('malzeme', 'material') };

function repairQ(s, b, qi, choice) {
  if (!b || !b.broken) return { done: false, ok: false, cost: 0, extra: {}, line: L('Bu makine bozuk değil.', 'This machine is not broken.'), e: null };
  const c = repairCost(s, b);
  if (s.res.parca < c) return { done: false, ok: false, cost: c, extra: {}, line: L(`${c} yedek parça gerekiyor.`, `It needs ${c} spare parts.`), e: null };
  const ok = choice === 0, late = choice === -1;
  const q = qMark(s, qi, ok);
  s.res.parca -= c; b.broken = false; s.stat.repairs++;
  spendLog(s, 'parca', -c, 'repair');
  const extra = {};
  if (!ok && !s.train) {
    let n = repairExtra(s, b);
    const fromP = Math.min(n, Math.max(0, Math.floor(s.res.parca))); n -= fromP;
    if (fromP) { s.res.parca -= fromP; extra.parca = fromP; spendLog(s, 'parca', -fromP, late ? 'sure' : 'ceza'); }
    const m = Math.min(n * QE_PART_M, Math.max(0, Math.floor(s.res.malzeme)));
    if (m) { s.res.malzeme -= m; extra.malzeme = m; spendLog(s, 'malzeme', -m, late ? 'sure' : 'ceza'); }
  }
  learnKey(s, 'first:onarim');
  const xs = qeExtraText(extra);
  let line;
  if (ok) line = L('Doğru! Makine yine çalışıyor.', 'Correct! The machine works again.');
  else if (s.train && late) line = L('Süre doldu. Eğitimde bir şey kaybetmedin. Gerçek görevde yedek parça giderdi.', 'Time is up. Nothing lost in training. Real missions cost spare parts.');
  else if (s.train) line = L('Eğitimde bir şey kaybetmedin. Gerçek görevde yedek parça giderdi.', 'Nothing lost in training. In the real mission this costs spare parts.');
  else if (late) line = L(`Süre doldu. Onarıldı ama ${xs.tr} gitti.`, `Time is up. Fixed, but it cost ${xs.en}.`);
  else line = L(`Onarıldı ama yanlış cevap ${xs.tr} harcattı.`, `Fixed, but the wrong answer cost ${xs.en}.`);
  checkMissions(s);
  return { done: true, ok, late, cost: c, extra, line, e: q && q.e ? q.e : null };
}
function qeExtraText(extra) {
  const tr = [], en = [];
  for (const r of ['parca', 'malzeme']) if (extra[r]) { tr.push(`${extra[r]} ${qeWord[r].tr}`); en.push(`${extra[r]} ${qeWord[r].en}`); }
  return { tr: tr.join(' ve ') || 'hiç kaynak', en: en.join(' and ') || 'nothing' };
}

function buildQ(s, bid, qi, choice) {
  const b = s.b.find(o => o.id === bid);
  const ok = choice === 0, late = choice === -1;
  const q = qMark(s, qi, ok);
  const extra = {};
  let slow = 0;
  if (!ok && !s.train && b) {
    const want = buildExtra(s, b), m = Math.min(want, Math.max(0, Math.floor(s.res.malzeme)));
    if (m) { s.res.malzeme -= m; extra.malzeme = m; spendLog(s, 'malzeme', -m, late ? 'sure' : 'ceza'); }
    if (m < want && b.left > 0) { b.left += QE_SLOW_H; slow = QE_SLOW_H; extra.saat = QE_SLOW_H; }
  }
  const xs = qeExtraText(extra);
  let line;
  if (ok) line = L('Doğru! Yapı sağlam kuruluyor.', 'Correct! It is being built well.');
  else if (s.train && late) line = L('Süre doldu. Eğitimde bir şey kaybetmedin. Gerçek görevde malzeme giderdi.', 'Time is up. Nothing lost in training. Real missions cost material.');
  else if (s.train) line = L('Eğitimde bir şey kaybetmedin. Gerçek görevde malzeme giderdi.', 'Nothing lost in training. In the real mission this costs material.');
  else if (slow && !extra.malzeme) line = L(`${late ? 'Süre doldu. ' : ''}Malzeme yetmedi: yapım ${slow} saat uzadı.`, `${late ? 'Time is up. ' : ''}Not enough material: building takes ${slow} hours longer.`);
  else if (late) line = L(`Süre doldu. Yapı kuruluyor ama ${xs.tr} gitti.`, `Time is up. It is being built, but cost ${xs.en}.`);
  else line = L(`Yapı kuruluyor ama yanlış cevap ${xs.tr} harcattı.`, `It is being built, but the wrong answer cost ${xs.en}.`);
  checkMissions(s);
  return { ok, late, extra, line, e: q && q.e ? q.e : null };
}



const PW_CACHE = new Map();
function pwKey(s, tag) {
  return [tag, s.world, s.t, s.pop, Math.round(s.stored * 100), Object.keys(s.techs).join(''), s.storm ? s.storm.from + ':' + s.storm.until : '',
    busyWorkers(s), s.fx.devilUntil || 0, s.fx.dustUntil || 0, s.fx.cleanUntil || 0,
    s.b.map(b => b.id + b.k + (b.on ? 'a' : 'k') + (b.broken ? 'b' : '') + b.left + (b.x + ',' + b.y)).join(';')].join('|');
}
function pwCached(key, f) {
  if (PW_CACHE.has(key)) return PW_CACHE.get(key);
  const v = f();
  if (PW_CACHE.size > 64) PW_CACHE.clear();
  PW_CACHE.set(key, v);
  return v;
}

const pwSun = (s, t) => { let f = baseSun(s, t); if (s.storm && t >= s.storm.from && t < s.storm.until) f *= s.techs.toz ? 0.55 : WORLDS[s.world].storm.factor; return f; };

function nightWin(s) {
  const W = WORLDS[s.world]; if (!W.night) return null;
  const ph = nightPhase(s, s.t), len = W.night.len * 24, P = W.night.period * 24;
  const ts = ph < len ? s.t - ph : s.t + (P - ph), te = ts + len;
  if (!s.free && ts >= W.missionDays * 24) return null;
  return { ts, te };
}




const ckNightFix = (s, b) => !!b.broken && !(b.left > 0) && b.k !== 'batarya' && !makesPower(s, b.k);
function pwSim(s, extra, addBat, addGen, off) {
  const W = WORLDS[s.world], per = BLD.batarya.store * (s.techs.sebeke ? 1.5 : 1);
  const L0 = s.b.filter(b => BLD[b.k]).map(b => ({ id: b.id, k: b.k, x: b.x, y: b.y, left: b.left, on: b.on && !(off && off.has(b.id)), broken: b.broken }));
  (extra || []).forEach((k, i) => L0.push({ id: 1e6 + i, k, x: -99, y: -99, left: BLD[k].h, on: true, broken: false }));
  L0.sort((a, b) => PRIO[a.k] - PRIO[b.k] || a.id - b.id);
  const free0 = Math.max(0, s.pop - busyWorkers(s));
  const alloc = list => {
    let free = free0; const ok = [];
    for (const b of list) {
      if (b.left > 0 || !b.on || b.broken) continue;
      const need = workersOf(s, b.k);
      if (need > free) continue;
      free -= need; ok.push(b);
    }
    return ok;
  };
  const genAt = (b, sun) => genOf(s, b, sun);

  const all = alloc(L0.map(b => Object.assign({}, b, { left: 0 })));
  const needFull = all.reduce((a, b) => a + (BLD[b.k].kw || 0), 0);
  let dayGen;
  if (W.night) dayGen = all.reduce((a, b) => a + genAt(b, 1), 0) + (addGen || 0);
  else { let g = 0; for (let h = 0; h < 24; h++) { const sun = baseSun(s, h); g += all.reduce((a, b) => a + genAt(b, sun), 0); } dayGen = g / 24 + (addGen || 0); }
  const nw = nightWin(s);
  let firstShed = null, night = null;
  if (nw) {
    const list = L0.map(b => Object.assign({}, b, ckNightFix(s, b) ? { broken: false } : null));
    let stored = s.stored, lastsH = null, deficit = 0, lifeCut = false, minSt = Infinity;
    for (let t = s.t + 1; t < nw.te; t++) {
      for (const b of list) if (b.left > 0) b.left--;
      const ok = alloc(list), sun = pwSun(s, t);
      let gen = (addGen || 0);
      for (const b of ok) gen += genAt(b, sun);
      const nb = list.filter(b => b.k === 'batarya' && b.left === 0).length + (addBat || 0);
      const cap = 30 + nb * per;
      let avail = gen + stored, use = 0, shed = 0, want = 0;
      for (const b of ok) {
        const kw = BLD[b.k].kw || 0; if (!kw) continue;
        want += kw;
        if (avail >= kw) { avail -= kw; use += kw; } else { shed++; if (LIFE[b.k]) lifeCut = lifeCut || t >= nw.ts; }
      }
      if (shed && firstShed == null) firstShed = t;
      stored = Math.min(cap, Math.max(0, stored + gen - use));
      if (t >= nw.ts) {
        deficit += Math.max(0, want - gen);
        if (shed && lastsH == null) lastsH = t - Math.max(nw.ts, s.t + 1);
        if (want > gen) minSt = Math.min(minSt, stored);
      }
    }
    const lenH = nw.te - Math.max(nw.ts, s.t + 1);
    const lh = lastsH == null ? lenH : lastsH;
    const lastsX = lastsH != null ? lastsH : (deficit <= 1e-9 || lenH <= 0) ? Infinity : lenH + (minSt === Infinity ? 0 : minSt) / (deficit / lenH);
    night = { ts: nw.ts, te: nw.te, lenH, lastsH: lh, lastsX, deficit, lifeCut };
  }
  return { dayGen, needFull, night, firstShed };
}
const pwCore = (s, extra) => pwCached(pwKey(s, 'c' + (extra || []).join(',')), () => pwSim(s, extra, 0, 0));

const ckPwMargin = 1.1, ckPwStable = 6;
const ckPwSt = s => (s.pwSt && typeof s.pwSt === 'object') ? s.pwSt : { sh: false, okT: null };

function ckPwSig(s) {
  let kw = 0, pr = 0, bt = 0;
  for (const b of s.b) {
    const d = BLD[b.k]; if (!d || !b.on || (b.broken && !ckNightFix(s, b))) continue;
    if (b.k === 'batarya') bt++;
    else if (makesPower(s, b.k)) pr++;
    kw += d.kw || 0;
  }
  return { kw, pr, bt };
}


const ckPwWorse = (s, st) => { if (!st.sig) return true; const g = ckPwSig(s); return g.kw > st.sig.kw + 1e-9 || g.pr < st.sig.pr || g.bt < st.sig.bt; };
const ckPwShort = (s, n) => { const st = ckPwSt(s); if (st.sh) return n.lastsX < n.lenH * ckPwMargin; if (n.lastsH >= n.lenH) return false; return !(n.ts > s.t && st.okT != null && !ckPwWorse(s, st)); };
const ckPwFits = n => !!n && n.lastsX >= n.lenH * ckPwMargin;



const ckPwLag = 12;
function ckPwFast(s, lag) {
  const LG = lag == null ? ckPwLag : lag;
  const nw = nightWin(s); if (!nw) return null;
  const per = BLD.batarya.store * (s.techs.sebeke ? 1.5 : 1), hG = BLD.gunes.h, hB = BLD.batarya.h;
  const list = s.b.filter(b => BLD[b.k]).map(b => ({ id: b.id, k: b.k, x: b.x, y: b.y, left: b.left, on: b.on, broken: b.broken && !ckNightFix(s, b) }))
    .sort((a, b) => PRIO[a.k] - PRIO[b.k] || a.id - b.id);
  const free0 = Math.max(0, s.pop - busyWorkers(s)), H = [];
  for (let t = s.t + 1; t < nw.te; t++) {
    for (const b of list) if (b.left > 0) b.left--;
    let free = free0, gen = 0, nb = 0; const kws = [];
    const sun = pwSun(s, t);
    for (const b of list) {
      if (b.left > 0 || !b.on || b.broken) continue;
      const need = workersOf(s, b.k); if (need > free) continue;
      free -= need; gen += genOf(s, b, sun);
      if (b.k === 'batarya') nb++;
      const kw = BLD[b.k].kw || 0; if (kw) kws.push(kw);
    }
    H.push({ t, gen, nb, kws, want: kws.reduce((x, y) => x + y, 0), dt: t - s.t, g1: genOf(s, { k: 'gunes', x: -99, y: -99 }, sun) });
  }
  const lenH = nw.te - Math.max(nw.ts, s.t + 1);
  return (n1, n2) => {
    let stored = s.stored, lastsH = null, deficit = 0, minSt = Infinity;
    for (const h of H) {
      const gen = h.gen + (h.dt >= hG + LG ? n1 * h.g1 : 0);
      const cap = 30 + (h.nb + (h.dt >= hB + LG ? n2 : 0)) * per;
      let avail = gen + stored, use = 0, shed = 0;
      const want = h.want;
      if (avail >= want) use = want;
      else for (const kw of h.kws) { if (avail >= kw) { avail -= kw; use += kw; } else shed++; }
      stored = Math.min(cap, Math.max(0, stored + gen - use));
      if (h.t >= nw.ts) {
        deficit += Math.max(0, want - gen);
        if (shed && lastsH == null) lastsH = h.t - Math.max(nw.ts, s.t + 1);
        if (want > gen) minSt = Math.min(minSt, stored);
      }
    }
    const lastsX = lastsH != null ? lastsH : (deficit <= 1e-9 || lenH <= 0) ? Infinity : lenH + (minSt === Infinity ? 0 : minSt) / (deficit / lenH);
    return { lenH, lastsH: lastsH == null ? lenH : lastsH, lastsX };
  };
}

function ckPwPlan(s) {
  const gk = 'gunes', okG = unlockedB(s, gk).ok, okB = unlockedB(s, 'batarya').ok;
  if (!okG && !okB) return [];
  const sim = ckPwFast(s); if (!sim) return [];
  const cg = costOf(s, gk).m, cb = costOf(s, 'batarya').m;
  const fits = (n1, n2) => ckPwFits(sim(n1, n2));
  let best = null, top = 40;
  for (let n1 = 0; n1 <= 12; n1++) {
    if (n1 && !okG) break;
    if (best && n1 * cg > best.cost) break;
    let cap = okB ? top : 0;
    if (best) cap = Math.min(cap, Math.floor((best.cost - n1 * cg) / cb));
    if (cap < 0) break;
    let n2 = null;
    if (fits(n1, 0)) n2 = 0;
    else if (cap > 0 && fits(n1, cap)) { let lo = 0, hi = cap; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (fits(n1, m)) hi = m; else lo = m; } n2 = hi; }
    if (n2 == null) continue;
    top = n2;
    const cost = n1 * cg + n2 * cb;
    if (!best || cost < best.cost || (cost === best.cost && n1 + n2 < best.n1 + best.n2)) best = { n1, n2, cost };
  }
  if (!best || best.n1 + best.n2 === 0) return [];
  const out = [];
  if (best.n1) out.push({ kind: 'uretim', k: gk, n: best.n1 });
  if (best.n2) out.push({ kind: 'batarya', k: 'batarya', n: best.n2 });
  return out;
}

const CK_PLAN = new Map();


function ckPlanStruct(s) { return s.b.filter(b => BLD[b.k] && ((b.k !== 'gunes' && b.k !== 'batarya') || !b.on)).map(b => b.id + b.k + (b.on ? 'a' : 'k')).join(';') + '|' + s.pop + '|' + Object.keys(s.techs).join(''); }
function ckPlanCached(s) {
  const nw = nightWin(s), nG = s.b.filter(b => b.k === 'gunes' && b.on && !b.broken).length, nB = s.b.filter(b => b.k === 'batarya' && b.on && !b.broken).length;
  if (s.b.some(b => b.broken && !ckNightFix(s, b))) return ckPlanFresh(s);
  const sp = s.pwPlan && typeof s.pwPlan === 'object' ? s.pwPlan : null, st = ckPlanStruct(s);
  if (sp && nw && sp.ts === nw.ts && sp.st === st) {
    const n1 = Math.max(0, sp.n1 - Math.max(0, nG - sp.g0)), n2 = Math.max(0, sp.n2 - Math.max(0, nB - sp.b0));
    const sim = ckPwFast(s, 0);
    if (sim && n1 + n2 > 0 && ckPwFits(sim(n1, n2))) {
      const out = []; if (n1) out.push({ kind: 'uretim', k: 'gunes', n: n1 }); if (n2) out.push({ kind: 'batarya', k: 'batarya', n: n2 });
      return out;
    }
  }
  const v = ckPlanFresh(s);
  if (!s.quiet && nw) { const pg = v.find(p => p.kind === 'uretim'), pb = v.find(p => p.kind === 'batarya'); s.pwPlan = v.length ? { ts: nw.ts, st, g0: nG, b0: nB, n1: pg ? pg.n : 0, n2: pb ? pb.n : 0 } : null; }
  return v;
}
function ckPlanFresh(s) {
  const key = [s.seed, s.world, Math.floor(s.t / 6), s.pop, Object.keys(s.techs).join(''), busyWorkers(s), Math.round(s.res.malzeme > 0 ? 1 : 0),
    s.b.map(b => b.id + b.k + (b.on ? 'a' : 'k') + (b.broken ? 'b' : '') + (b.left > 0 ? 'i' : '')).join(';')].join('|');
  if (CK_PLAN.has(key)) return CK_PLAN.get(key).map(p => Object.assign({}, p));
  const v = ckPwPlan(s);
  if (CK_PLAN.size > 64) CK_PLAN.clear();
  CK_PLAN.set(key, v);
  return v.map(p => Object.assign({}, p));
}

function stopGainH(s, b) {
  if (!b || !BLD[b.k] || b.left > 0 || !b.on || b.broken || !(BLD[b.k].kw > 0)) return 0;
  const base = pwCore(s).night; if (!base) return 0;
  const r = pwCached(pwKey(s, 'off' + b.id), () => pwSim(s, null, 0, 0, new Set([b.id]))).night;
  const cap = base.lenH * ckPwMargin, a = Math.min(cap, base.lastsX), z = Math.min(cap, r.lastsX);
  return Math.max(0, Math.round(z - a));
}

function ckPwStop(s) {
  let best = null;
  for (const b of s.b) {
    if (LIFE[b.k] || b.k === 'hub' || !BLD[b.k] || b.left > 0 || !b.on || b.broken || !(BLD[b.k].kw > 0)) continue;
    const g = stopGainH(s, b);
    if (g > 0 && (!best || g > best.gainH || (g === best.gainH && b.id < best.bid))) best = { bid: b.id, k: b.k, gainH: g };
  }
  return best;
}
function powerOutlook(s) {
  const st = ckPwSt(s);
  return pwCached(pwKey(s, 'o' + (st.sh ? 1 : 0) + ':' + st.okT + ':' + (st.sig ? st.sig.kw + '/' + st.sig.pr + '/' + st.sig.bt : '')), () => {
    const gen = s.pw.gen, need = s.pw.need, net = gen - need;
    const c = pwCore(s);
    const out = { gen, need, stored: s.stored, cap: batteryCap(s), net, hoursLeft: net >= 0 ? Infinity : s.stored / -net, over: c.dayGen + 1e-9 < c.needFull, night: null };
    if (c.night) {
      const n = c.night, inH = Math.max(0, n.ts - s.t), short = ckPwShort(s, n);
      const plan = short && inH > 0 ? ckPlanCached(s) : [];
      const stop = short ? ckPwStop(s) : null;
      const pb = plan.find(p => p.kind === 'batarya'), pg = plan.find(p => p.kind === 'uretim');
      const ready = !short && inH > 0 && st.okT != null && s.t - st.okT >= ckPwStable;
      const cost = plan.reduce((m, p) => m + (BLD[p.k] ? costOf(s, p.k).m * p.n : 0), 0);
      out.night = { inH, lenH: n.lenH, lastsH: n.lastsH, short, addBat: pb ? pb.n : 0, addGen: pg ? pg.k : null, plan, stop, ready, cost };
    }
    return out;
  });
}

function ckPwState(s) {
  const o = powerOutlook(s);
  if (!o.night || s.quiet) return o;
  const st = ckPwSt(s), sh = o.night.short;
  const nst = { sh, okT: sh ? null : (st.okT != null && !st.sh ? st.okT : s.t), sig: sh ? null : ckPwSig(s) };
  const sigCh = JSON.stringify(nst.sig || null) !== JSON.stringify(st.sig || null);
  if (nst.sh !== st.sh || nst.okT !== st.okT || !s.pwSt || sigCh) { s.pwSt = nst; return powerOutlook(s); }
  return o;
}

function buildOutlook(s, k) {
  if (!BLD[k] || k === 'hub') return { net: s.pw.gen - s.pw.need, warn: null };
  const d = BLD[k], sun = s.pw.sun != null ? s.pw.sun : 1;
  const net = s.pw.gen - s.pw.need + genOf(s, { k, x: -99, y: -99 }, sun) - (d.kw || 0);
  if (k === 'batarya') return { net, warn: null };
  const c = pwCore(s, [k]);
  let warn = null;
  if (c.dayGen + 1e-9 < c.needFull) warn = 'gunduz';
  else if (c.night && c.night.lastsH < c.night.lenH) warn = 'gece';
  return { net, warn };
}


const ckPlanW = { gunes: [L('güneş paneli', 'solar panel'), L('güneş paneli', 'solar panels')], batarya: [L('batarya', 'battery'), L('batarya', 'batteries')] };
function ckPlanText(plan) {
  if (!plan || !plan.length) return null;
  const tr = [], en = [];
  for (const p of plan) { const w = ckPlanW[p.k] || [ckBname(p.k), ckBname(p.k)], one = p.n === 1 ? w[0] : w[1]; tr.push(`${p.n} ${one.tr}`); en.push(`${p.n} ${one.en}`); }
  return L(tr.join(' + '), en.join(' + '));
}
const ckBname = k => (BLD[k] ? BLD[k].name : L(k, k));
function ckPwFix(s, n) {
  const p = n && ckPlanText(n.inH > 0 ? n.plan : null);
  if (p) return L(`Plan: ${p.tr}.`, `Plan: ${p.en}.`);
  if (n && n.stop) { const nm = bname(s, n.stop.k); return L(`Durdur: ${nm.tr}.`, `Switch off: ${nm.en}.`); }
  return L('Bazı yapıları kapat.', 'Turn some buildings off.');
}

function ckPwAdvice(s) {
  let o = null; try { o = powerOutlook(s); } catch (e) { o = null; }
  if (!o) return null;
  const n = o.night;
  if (n && n.short) {
    const p = n.inH > 0 ? ckPlanText(n.plan) : null;
    if (p) return L(`Uzun gece için: ${p.tr} kur.`, `For the long night: build ${p.en}.`);
    if (n.stop) { const nm = bname(s, n.stop.k); return L(`Elektrik yetsin diye durdur: ${nm.tr}.`, `To save power, switch off: ${nm.en}.`); }
    return L('Bazı yapıları kapat, elektrik yetsin.', 'Switch some buildings off so power lasts.');
  }
  if (o.over) return L('Elektrik yetmiyor: güneş paneli ekle ya da bir yapıyı kapat.', 'Not enough power: add a solar panel or switch a building off.');
  return null;
}
function pwLine(s, kind, o, k) {
  const n = o && o.night;
  if (kind === 'ariza') { const nm = k && BLD[k] ? bname(s, k) : L('Bir yapı', 'A building'); return L(`${nm.tr} bozuk: elektrik azaldı. Onar.`, `${nm.en} is broken: less power. Repair it.`); }
  if (kind === 'over') {
    if (hoursToNight(s) === 0) return L('Çok yapı kurdun: elektrik yetmiyor. Bazı yapıları kapat.', 'Too many buildings: not enough power. Turn some buildings off.');
    if (n && n.short && n.plan && n.plan.length) { const f = ckPwFix(s, n); return L(`Elektrik yetmiyor. ${f.tr}`, `Not enough power. ${f.en}`); }
    return L('Çok yapı kurdun: elektrik yetmiyor. Güneş paneli ekle.', 'Too many buildings: not enough power. Add a solar panel.');
  }
  if (kind === 'night') { const f = ckPwFix(s, n); return L(`Uzun gecede elektrik yetmez. ${f.tr}`, `Power fails in the long night. ${f.en}`); }
  if (kind === 'yaklasan' && n) {
    if (!(n.inH > 0)) { const f = ckPwFix(s, n); return L(`Uzun gece: elektrik yetmeyecek. ${f.tr}`, `Long night: power will run out. ${f.en}`); }
    const hrs = n.inH < 24, c = hrs ? Math.max(1, Math.ceil(n.inH)) : Math.ceil(n.inH / 24), W = WORLDS[s.world];
    const uTr = hrs ? 'saat' : W.dayWord.tr.toLocaleLowerCase('tr'), uEn = hrs ? (c === 1 ? 'hour' : 'hours') : W.dayWord.en.toLowerCase() + (c === 1 ? '' : 's');
    const f = ckPwFix(s, n);
    return L(`Uzun gece ${c} ${uTr} sonra. ${f.tr}`, `Long night in ${c} ${uEn}. ${f.en}`);
  }
  if (kind === 'hazir') return L('Uzun geceye hazırsın. Bataryalar geceyi çıkarır.', 'You are ready for the long night. The batteries will last.');
  return null;
}
const PWARN_MAX = 6, YAKLASAN_H = [72, 48, 24, 6];

function pwPush(s, kind, k, o, sayIt, bid) {
  if (s.quiet || (s.train && kind !== 'ariza')) return;
  if (!Array.isArray(s.fx.pwarn)) s.fx.pwarn = [];
  const m = pwLine(s, kind, o, k), n = o && o.night;
  const it = { kind, k: k || null, t: s.t, m };
  if (bid != null) it.bid = bid;
  if (n) it.n = { inH: n.inH, lenH: n.lenH, lastsH: n.lastsH, addBat: n.addBat, addGen: n.addGen, plan: (n.plan || []).map(p => Object.assign({}, p)), stop: n.stop ? Object.assign({}, n.stop) : null };
  s.fx.pwarn.push(it);
  while (s.fx.pwarn.length > PWARN_MAX) s.fx.pwarn.shift();
  s.stat.pwarn = (s.stat.pwarn || 0) + 1;
  if (kind === 'night' || kind === 'yaklasan') s.fx.pwShort = 1;
  if (kind === 'hazir') s.fx.pwShort = 0;
  if (!s.fx.pwSay || typeof s.fx.pwSay !== 'object') s.fx.pwSay = {};
  const day = Math.floor(s.t / 24);
  if (sayIt !== false && m && s.fx.pwSay[kind] !== day) {
    s.fx.pwSay[kind] = day;
    say(s, 'atlas', kind === 'hazir' ? L('Uzun geceye hazır', 'Ready for the night') : L('Elektrik uyarısı', 'Power warning'), m, { c: kind === 'hazir' ? 'good' : 'warn' });
  }
}
const PW_NIGHT_GAP = 24, PW_READY_H = 96;

function ckPwAriza(s, force) {
  if (s.quiet) return false;
  if (!s.fx.pwArz || typeof s.fx.pwArz !== 'object') s.fx.pwArz = {};
  for (const id in s.fx.pwArz) if (!s.b.some(b => b.id === +id && b.broken)) delete s.fx.pwArz[id];
  const br = s.b.find(b => b.broken && b.left === 0 && makesPower(s, b.k) && !s.fx.pwArz[b.id]);
  if (!br) return false;
  if (!force && !(s.pw && s.pw.shed > 0)) { const c = pwCore(s); if (!(c.dayGen + 1e-9 < c.needFull)) return false; }
  s.fx.pwArz[br.id] = 1;
  pwPush(s, 'ariza', br.k, null, true, br.id);
  return true;
}

function pwAfterBuild(s, k, before) {
  if (s.quiet || s.train || !before) return;
  const after = pwCore(s);
  const bOver = before.dayGen + 1e-9 < before.needFull, aOver = after.dayGen + 1e-9 < after.needFull;
  if (aOver && !bOver) { if (!ckPwAriza(s, true)) pwPush(s, 'over', k, ckPwState(s)); else ckPwState(s); return; }
  const bShort = before.night && before.night.lastsH < before.night.lenH, aShort = after.night && after.night.lastsH < after.night.lenH;
  if (aShort && !bShort && s.t - (s.fx.pwNightT == null ? -99 : s.fx.pwNightT) >= PW_NIGHT_GAP) { s.fx.pwNightT = s.t; pwPush(s, 'night', k, ckPwState(s)); return; }
  ckPwState(s);
}

function pwHour(s) {
  if (s.quiet) return;
  ckPwAriza(s);
  if (s.train) return;
  const W = WORLDS[s.world]; if (!W.night) return;
  const o = ckPwState(s), n = o.night;
  if (!n) return;
  const hn = hoursToNight(s);
  if (YAKLASAN_H.includes(hn) && n.short) pwPush(s, 'yaklasan', null, o, hn !== 48);
  if (s.fx.pwShort && !n.short && n.inH > PW_READY_H) { s.fx.pwShort = 0; return; }
  if (s.fx.pwShort && n.ready && !s.fx.pwHazir && n.inH > 0) { s.fx.pwHazir = 1; pwPush(s, 'hazir', null, null); }
}



const achList = () => (typeof ACHIEVEMENTS !== 'undefined' && Array.isArray(ACHIEVEMENTS)) ? ACHIEVEMENTS : [];
const achFits = (s, a) => (!a.w || a.w === s.world) && (!a.lv || a.lv === s.level);
const achHave = (s, id) => (!!s.ach && s.ach[id] != null) || (!!s.achP && !!s.achP[id]);
function checkAch(s) {
  const list = achList();
  if (!list.length) return [];
  if (!s.ach) s.ach = {};
  if (!s.achP) s.achP = {};
  if (s.train) return [];
  const got = [];
  for (const a of list) {
    if (!a || !a.id || !a.rule || achHave(s, a.id) || !achFits(s, a)) continue;
    if (ruleMet(s, a.rule)) { s.ach[a.id] = s.t; got.push(a.id); }
  }
  return got;
}

function achNext(s, have) {
  const h = have || {};
  return achList().map((a, i) => ({ a, i }))
    .filter(({ a }) => a && a.id && a.rule && !achHave(s, a.id) && !h[a.id] && achFits(s, a))
    .map(({ a, i }) => ({ id: a.id, name: a.name, how: a.how || null, prog: ruleProg(s, a.rule), gives: (a.gives || []).slice(), i }))
    .sort((x, y) => y.prog - x.prog || x.i - y.i).slice(0, 2)
    .map(({ i, ...o }) => o);
}

function featOn(s, f) {
  const tag = 'feat:' + f;
  return achList().some(a => a && Array.isArray(a.gives) && a.gives.includes(tag) && achHave(s, a.id));
}

const DRONE_GAP = 12;
const droneWait = s => (s.fx && s.fx.droneAt != null ? Math.max(0, DRONE_GAP - (s.t - s.fx.droneAt)) : 0);
function droneScout(s, tx, ty) {
  if (!featOn(s, 'dron') || !inMap(tx, ty) || droneWait(s) > 0) return false;
  s.fx.droneAt = s.t;
  reveal(s, tx, ty, 3);
  s.stat.drones = (s.stat.drones || 0) + 1;
  return true;
}



const FAIL_STATS = { black: 1, blackDark: 1, evac: 1, frozen: 1, flareOpen: 1, sh: 1, defaults: 1 };
const LEARN_BASE = [
  { id: 'hava', grp: 'o2', rule: { t: 'cause', r: 'o2' }, t: L('Hava bitince ekip eve döner. Önce Hava Makinesi kurulur.', 'When the air runs out, the crew goes home. Build an Air Maker first.') },
  { id: 'su', grp: 'su', rule: { t: 'cause', r: 'su' }, t: L('Su bitince ekip eve döner. Buz Çıkarıcı buzdan su yapar.', 'When water runs out, the crew goes home. An Ice Extractor turns ice into water.') },
  { id: 'yemek', grp: 'gida', rule: { t: 'cause', r: 'gida' }, t: L('Sera ilk ürünü geç verir. Bu yüzden erken kurulur.', 'A greenhouse is slow to give its first crop. So build it early.') },
  { id: 'karanlik', grp: 'pil', rule: { t: 'stat', key: 'blackDark', min: 1 }, t: L('Karanlıkta paneller durur. Batarya, gündüzün elektriğini saklar.', 'Panels stop in the dark. A battery saves daytime power for later.') },
  { id: 'donma', grp: 'sera', rule: { t: 'stat', key: 'frozen', min: 1 }, t: L('Elektriksiz kalan sera donar. Seraya gece de elektrik lazım.', 'A greenhouse without power freezes. It needs power at night too.') },
  { id: 'doz', grp: 'kalkan', rule: { t: 'stat', key: 'flareOpen', min: 1 }, t: L('Güneş patlamasında herkes korunaklı yatakta olmalı.', 'In a solar flare everyone needs a protected bed.') },
  { id: 'dongu', grp: 'dongu', rule: { t: 'built', k: 'geri' }, t: L('Kullanılmış su temizlenip yeniden içilir.', 'Used water is cleaned and drunk again.') },
  { id: 'kalkan', grp: 'kalkan', rule: { t: 'mission', id: 'kalkan' }, t: L('Kalın bir toprak örtüsü radyasyonu durdurur.', 'A thick cover of soil stops radiation.') },
  { id: 'hasat', grp: 'sera', rule: { t: 'tag', id: 'x:hasat' }, t: L('Bitkiler hem yemek hem hava verir.', 'Plants give both food and air.') },
  { id: 'pil', grp: 'pil', rule: { t: 'built', k: 'batarya' }, t: L('Batarya, gündüzün elektriğini geceye saklar.', 'A battery saves daytime power for the night.') },
  { id: 'buz', grp: 'su', rule: { t: 'built', k: 'su' }, t: L('Buz eritilince içme suyu olur.', 'Melted ice becomes drinking water.') },
  { id: 'kesif', grp: 'kesif', rule: { t: 'mission', id: 'kesif' }, t: L('Kazmadan önce tarayıp bakmak gerekir.', 'Scan the ground before you dig.') },
];
const LEARN_MAX = 3;
const isFailRule = r => !!r && (r.t === 'cause' || (r.t === 'stat' && !!FAIL_STATS[r.key]));
function learnedList(s) {
  const src = hasReal() && Array.isArray(REAL.learn) && REAL.learn.length ? REAL.learn : LEARN_BASE;
  const hit = src.filter(o => o && o.t && ruleMet(s, o.rule));
  const order = hit.filter(o => o.fail || isFailRule(o.rule)).concat(hit.filter(o => !(o.fail || isFailRule(o.rule))));
  const all = [], grp = {};
  for (const o of order) {
    const g = o.grp || o.id;
    if (grp[g]) continue;
    grp[g] = 1;
    let real = o.real || null;
    if (real && typeof real.tr !== 'string' && (real.ay || real.mars)) real = real[s.world] || null;
    let t = o.t;
    if (t && typeof t.tr !== 'string' && (t.ay || t.mars)) t = t[s.world];
    if (!t) continue;
    all.push({ id: o.id, t, real: real || null, fail: !!(o.fail || isFailRule(o.rule)) });
  }

  const keep = new Set(all.filter(x => !(x.real && shownBefore(s, x.real))).slice(0, LEARN_MAX));
  for (const x of all) if (keep.size < LEARN_MAX) keep.add(x);
  return all.filter(x => keep.has(x));
}

function shownBefore(s, real) {
  const words = t => new Set(String(t || '').toLocaleLowerCase('tr-TR').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(w => w.length > 2));
  const a = words(real.tr); if (!a.size) return false;
  return (s.radio || []).some(m => { const b = words(m.text && m.text.tr); let n = 0; for (const w of a) if (b.has(w)) n++; return n / a.size >= 0.75; });
}


function whyStop(s, b) {
  if (!b || b.left > 0 || b.k === 'hub') return null;
  const nm = k => bname(s, k);
  switch (b.st) {
    case 'kapali': return { why: L('Bu yapıyı sen kapattın.', 'You switched this building off.'), fix: L('Kartındaki Çalıştır düğmesine bas.', 'Press Start on its card.') };
    case 'ariza': return { why: L('Bir parçası bozuldu.', 'One of its parts broke.'), fix: L('Yanına git ve onar.', 'Go to it and repair it.') };
    case 'siginak': return { why: L('Güneş patlaması var, ekip sığınakta.', 'There is a solar flare. The crew is in the shelter.'), fix: L('Patlama geçince kendiliğinden çalışır.', 'It starts again when the flare is over.') };
    case 'isci': return { why: L('Burada çalışacak kimse kalmadı.', 'There is nobody left to run it.'), fix: L('Ekip getir ya da başka bir yapıyı kapat.', 'Bring more crew or switch another building off.') };
    case 'guc': {
      if (WORLDS[s.world].night && isDark(s)) return { why: L('Güneş yok, bataryadaki elektrik bitti.', 'There is no Sun and the battery is empty.'), fix: L('Batarya kur ya da gereksiz yapıları kapat.', 'Build batteries or switch off what you can spare.') };
      if (stormOn(s)) return { why: L('Toz fırtınası panelleri zayıflattı.', 'The dust storm made the panels weak.'), fix: L('Batarya kur ya da gereksiz yapıları kapat.', 'Build batteries or switch off what you can spare.') };
      if (s.pw.sun < 0.05) return { why: L('Gece oldu, bataryadaki elektrik bitti.', 'It is night and the battery is empty.'), fix: L(`Bir ${nm('batarya').tr} daha kur.`, `Build another ${nm('batarya').en}.`) };
      return { why: L('Elektrik bütün yapılara yetmiyor.', 'There is not enough power for every building.'), fix: L(`${nm('gunes').tr} kur ya da bir yapıyı kapat.`, `Build ${/^[AEIOU]/i.test(nm('gunes').en) ? 'an' : 'a'} ${nm('gunes').en} or switch a building off.`) };
    }
    case 'girdi': {
      const inp = BLD[b.k] && BLD[b.k].inp, miss = inp ? Object.keys(inp).find(r => s.res[r] < inp[r] / 24) || Object.keys(inp)[0] : null;
      if (miss === 'su') return { why: L('Bu yapıya su gelmiyor.', 'This building gets no water.'), fix: L(`${nm('su').tr} kur, depoda su olsun.`, `Build an ${nm('su').en} so there is water in store.`) };
      if (miss && PV_WORD[miss]) return { why: L(`Depoda ${PV_WORD[miss].tr} kalmadı.`, `There is no ${PV_WORD[miss].en} left in store.`), fix: L(`Önce ${PV_WORD[miss].tr} yap.`, `Make some ${PV_WORD[miss].en} first.`) };
      return { why: L('Çalışmak için gereken şey yok.', 'Something it needs has run out.'), fix: L('Kartta ne istediğine bak.', 'Check what it needs on its card.') };
    }
  }
  return null;
}



function envStep(s, W) {
  const t = s.t;
  if (t === s.shipAt - 48 && !s.train) log(s, L('Kargo gemisi 2 gün sonra geliyor. Yeni ekip istiyorsan boş yatak hazırla.', 'A cargo ship arrives in 2 days. Have free beds ready if you want more crew.'), 'info');
  if (t >= s.shipAt && !s.quiet && !s.train) { s.shipAt += W.shipEvery * 24; s.fx.shipT = t; pushCargo(s); }
  if (W.night) {
    const ph = nightPhase(s, t), P = W.night.period * 24;
    if (ph === P - 48) {
      if (s.train) {   } else if (!s.seenInfo.gece) { s.seenInfo.gece = 1; autoEvent(s, 'gece'); }
      else log(s, L('Uzun gece 2 gün sonra başlıyor.', 'The long night begins in 2 days.'), 'warn');
    }
    if (ph === 0) {
      log(s, L('Uzun gece başladı: 4 gün güneş yok.', 'The long night has begun: no sun for 4 days.'), 'bad'); learnKey(s, 'first:geceBasi');

      if (!s.train && hubNight(s, 0) > 0) say(s, 'atlas', L('Yedek güç', 'Backup power'), L('Üssün yedek gücü hava ve su makinesini çalıştırır. Gerisi bataryaya bağlı.', 'The base\'s backup power runs air and water. The rest needs batteries.'), { c: 'info' });
    }
    if (ph === W.night.len * 24) { log(s, L('Güneş geri döndü. Paneller yeniden çalışıyor.', 'The Sun is back. Panels are working again.'), 'good'); learnKey(s, 'first:geceSonu'); }
  }
  if (W.storm) {
    const lead = cnt(s, 'anten', 1) ? 48 : 12;
    if (!s.storm && !s.stormWarned && !s.train && t >= s.nextStorm - lead) {
      s.stormWarned = true;
      const h = Math.max(1, s.nextStorm - t);
      log(s, L(`Toz fırtınası geliyor: yaklaşık ${h} saat sonra burada.`, `Dust storm coming: here in about ${h} hours.`), 'warn');
    }
    if (!s.storm && t >= s.nextStorm && !s.quiet && !s.train) {
      const len = rint(s, W.storm.len[0], W.storm.len[1]);
      s.storm = { from: t, until: t + len * 24 }; s.stat.storms++;
      if (!s.seenInfo.firtina) { s.seenInfo.firtina = 1; autoEvent(s, 'firtina', { len }); }
      log(s, L(`Toz fırtınası başladı (${len} sol).`, `Dust storm has begun (${len} sols).`), 'bad');
    }
    if (s.storm && t >= s.storm.until) {
      s.storm = null; s.stormWarned = false;
      s.nextStorm = t + rint(s, W.storm.every[0], W.storm.every[1]) * 24;
      log(s, L('Toz fırtınası dindi.', 'The dust storm has cleared.'), 'good');
    }
  }
  if (s.quiet || s.train) return;
  if (t >= s.nextFlare) {
    if (decisionPending(s)) s.nextFlare = t + 12;
    else {
      const hit = Math.round(rint(s, W.flareHit[0], W.flareHit[1]) * (easy(s) ? 0.7 : 1) * (cnt(s, 'anten', 1) ? 0.75 : 1));
      pushEvent(s, 'flare', { hit });
      s.nextFlare = t + rint(s, W.flareEvery[0], W.flareEvery[1]) * 24 + rint(s, 0, 12);
    }
  }
  if (t >= s.nextEv) s.nextEv = randomEvent(s) ? t + Math.round(rint(s, 60, 96) * (easy(s) ? 1.25 : 1)) : t + 12;
}


const CK_ARZ_GAP = 144, CK_ARZ_PRI = ['gunes', 'maden', 'anten', 'lab'];
function ckArzAt(s) { const h = qHash(s.seed, 4242); return (2 + h % 3) * 24 + 9 + ((h >>> 8) % 8); }
function ckGuarStep(s) {
  if (s.quiet || s.train || !easy(s)) return false;
  if (s.b.some(b => b.broken)) { s.fx.arzT = s.t; return false; }
  const W = WORLDS[s.world], first = ckArzAt(s);
  if (s.t < first) return false;
  const last = s.fx.arzT;
  const due = (last == null || last < first - 24) ? true : s.t - last >= CK_ARZ_GAP;
  if (!due) return false;
  if (W.night && hoursToNight(s) === 0) return false;
  if (!W.night) { const h = s.t % 24; if (h < 9 || h > 16) return false; }
  let b = null;
  for (const k of CK_ARZ_PRI) { b = s.b.filter(o => o.k === k && o.left === 0 && o.on && !o.broken).sort((x, y) => x.id - y.id)[0]; if (b) break; }
  if (!b) return false;
  const ev = EVENTS.ariza, p = { id: 'ariza', bid: b.id, bk: b.k };
  b.broken = true; b.st = 'ariza'; s.fx.hit = { id: b.id, t: s.t }; s.fx.arzT = s.t;
  s.stat.arzG = (s.stat.arzG || 0) + 1;
  const res = ev.fx ? ev.fx(s, p) : null;
  bankOpen(s, 'e:ariza'); noteTag(s, 'e:ariza');
  say(s, ev.from, ev.title, ev.text(s, p), { fact: evFact(s, ev), res, c: ev.c, ev: 'ariza', who: ev.who });
  learnKey(s, 'ev:ariza');
  return true;
}
function recordCause(s, r) {
  const k = { o2: 'oksijen', su: 'su', gida: 'sera' }[r];
  const all = s.b.filter(b => b.k === k && b.left === 0);
  let why = 'az';
  if (!all.length) why = 'yok';
  else if (all.some(b => b.st === 'guc')) why = 'guc';
  else if (all.some(b => b.st === 'isci' || b.st === 'siginak')) why = 'isci';
  else if (all.some(b => b.st === 'ariza')) why = 'ariza';
  else if (all.some(b => b.st === 'girdi' || b.st === 'kapali')) why = 'girdi';
  s.stat.causes.push({ r, why, d: dayOf(s), dark: isDark(s) || stormOn(s) });
}
function evacuate(s, r) {
  s.pop--; s.stat.evac++; s.mmod -= 10; moodHit(s, 'tahliye', 10);
  const nm = { o2: L('oksijen', 'oxygen'), su: L('su', 'water'), gida: L('yemek', 'food') }[r];
  log(s, L(`${nm.tr[0].toUpperCase() + nm.tr.slice(1)} bitti. Bir ekip üyesi acil kapsülle Dünya'ya geri gönderildi.`, `With no ${nm.en} left, a crew member was sent back to Earth in the emergency capsule.`), 'bad');
  if (s.pop <= 0) finish(s, false, r);
}
function finish(s, win, why) {
  s.stat.selfEnd = s.selfE;
  s.stat.selfParts = {};
  for (const r of ['o2', 'su', 'gida']) { const c = s.rate[r].c, p = s.rate[r].p; s.stat.selfParts[r] = c <= 1e-6 ? 1 : Math.min(1, p / c); }
  s.over = { win, why: why || '', t: s.t };
}



const MUT_LINES = [
  null,
  { who: 'kerem', title: L('Ekip çok yorgun', 'The crew is worn out'),
    text: L('{ad}, ekip çok yorgun. Biraz ilgi bekliyoruz.', '{ad}, the crew is worn out. We could use some care.') },
  { who: 'ece', title: L('Ekip toplantısı', 'Crew meeting'),
    text: L('Toplantı yaptık. Böyle giderse seni eve göndermeyi konuşacağız.', 'We had a meeting. If this goes on, we will talk about sending you home.') },
  { who: 'ece', title: L('Kapsül hazır', 'The capsule is ready'),
    text: L('Kapsülü hazırladık. Kurabiye kutun bile içinde. Bir şeyleri düzeltmezsen…', 'We have packed the capsule. Your cookie tin is already inside. Unless things change…') },
];
function mutinyHint(s) { const top = moraleMinus(s, 1)[0]; return MOR_HINT[top] || MOR_HINT.olaylar; }

function mutinyInfo(s) {
  const m = s.mut || { lvl: 0, low: 0 };
  const risk = m.lvl >= 3 && s.moral < 30 ? 'ciddi' : m.lvl >= 2 ? 'dusuk' : 'yok';
  return { lvl: m.lvl, hoursLow: m.low, risk };
}
function mutStep(s) {
  const m = s.mut, W = WORLDS[s.world];
  m.low = s.moral < 30 ? m.low + 1 : 0;
  m.good = s.moral >= 35 ? m.good + 1 : 0;
  if (m.lvl < 3 && m.low >= 24 && s.t - m.at >= 24) {
    m.lvl++; m.at = s.t; m.max = Math.max(m.max || 0, m.lvl);
    const ln = MUT_LINES[m.lvl];
    say(s, 'crew', ln.title, ln.text, { c: m.lvl >= 2 ? 'bad' : 'warn', who: ln.who, hint: mutinyHint(s), mut: m.lvl });
  } else if (m.lvl > 0 && m.good >= 24) {
    m.lvl--; m.good = 0; m.at = s.t;
    say(s, 'crew', L('Daha iyiyiz', 'We feel better'), L('Teşekkürler {ad}, daha iyiyiz.', 'Thank you, {ad}. We feel better.'), { c: 'good', who: 'kerem', mut: 0 });
  }
  if (m.lvl === 3 && s.moral < 30 && hourOf(s) === 8 && dayOf(s) >= 5 && s.t < W.missionDays * 24 - 24) {
    if (rnd(s) < (easy(s) ? 0.12 : 0.20)) {
      s.stat.mut = { day: dayOf(s), lvl: m.lvl, low: m.low, why: moraleMinus(s, 3) };
      finish(s, false, 'isyan');
      say(s, 'crew', L('İyi yolculuklar {ad}!', 'Safe trip, {ad}!'),
        L('Seni nazikçe kapsüle oturttuk. Kurabiyeler ve bir teşekkür kartı yanında. Dünya\'da biraz dinlen!', 'We gently sat you in the capsule. Cookies and a thank-you card are with you. Have a rest on Earth!'),
        { c: 'bad', who: 'ece', mut: 3 });
    }
  }
}



const BEAT_GAP = 6;
function sayBeat(s, b, extra) {
  const parts = (Array.isArray(b.text) ? b.text : [b.text]).slice();
  const more = typeof b.more === 'function' ? b.more(s) : null;
  if (more) parts.push(more);
  parts.forEach((tx0, i) => say(s, b.from, b.title, tx0, Object.assign({ c: b.c || 'info', who: b.who },
    i === 0 ? { fact: b.fact, src: b.src } : {}, i === parts.length - 1 ? { hint: typeof b.hint === 'function' ? b.hint(s) : b.hint } : {}, extra)));
}
function storyStep(s) {
  const S = STORY[s.world], st = s.story;

  if (s.tags && s.tags['x:egitim'] != null) for (const id of ['selam', 'atlas', 'varis']) if (st.beats[id] == null && S.beats.some(b => b.id === id)) { st.beats[id] = -1; }
  const nx = S.chapters[st.ch + 1];
  if (nx && nx.when(s)) { st.ch++; s.fx.chapter = st.ch; s.fx.chapterT = s.t; }
  if (st.held.length && !conjOn(s)) for (const e of st.held.splice(0)) say(s, e.from, e.title, e.text, e);
  if (s.t - st.last < BEAT_GAP) { goalStep(s); return; }
  for (const b of S.beats) {
    if (st.beats[b.id] != null) continue;
    if (b.skip && b.skip(s)) { st.beats[b.id] = -1; continue; }
    if ((b.from === 'mc' && conjOn(s)) || !b.when(s)) break;
    st.beats[b.id] = s.t; st.last = s.t;
    sayBeat(s, b, { beat: b.id });
    return;
  }
  for (const b of S.react || []) {
    if (st.react[b.id] != null || !b.when(s)) continue;
    st.react[b.id] = s.t; st.last = s.t;
    sayBeat(s, b, { beat: 'r:' + b.id });
    return;
  }
  goalStep(s);
}


function tick(s) {
  if (!s.train) return tick0(s);
  const keep = { t: s.t, o2: s.res.o2, su: s.res.su, gida: s.res.gida, stored: s.stored, dose: s.dose, moral: s.moral };
  const r = tick0(s);
  s.t = keep.t; s.res.o2 = Math.max(keep.o2, s.res.o2); s.res.su = Math.max(keep.su, s.res.su); s.res.gida = Math.max(keep.gida, s.res.gida);
  s.stored = Math.max(keep.stored, s.stored); s.dose = keep.dose; s.moral = Math.max(keep.moral, s.moral);
  return r;
}
function tick0(s) {
  migrate(s);
  if (s.over) return false;
  const W = WORLDS[s.world], T = s.techs;
  s.t++;
  if (!s.train && !s.fx.gorev) { s.fx.gorev = 1; learnKey(s, 'first:gorev'); }
  if (s.t % 24 === 0 && !s.train) noteTag(s, 'd:' + dayOf(s));
  if (s.t % 24 === 8 && !s.train && dayOf(s) >= 2) learnKey(s, 'gun:' + dayOf(s));
  if (!s.quiet) dueStep(s);
  if (s.over) return true;
  envStep(s, W);


  for (const b of s.b) {
    if (b.left > 0 && --b.left === 0) {
      s.stat.built++; b.st = 'ok';
      if (BLD[b.k] && makesPower(s, b.k)) s.stat.genEver = true;
      const n = bname(s, b.k);
      log(s, L(`${n.tr} tamamlandı.`, `${n.en} is complete.`), 'info');
      bankOpen(s, 'b:' + b.k); noteTag(s, 'b:' + b.k);
      if (isShielded(s, b)) { bankOpen(s, 'b:kalkan'); noteTag(s, 'x:kalkan'); }
    }
    if (b.shLeft > 0 && --b.shLeft === 0) {
      b.shield = 1;
      learnKey(s, 'first:kalkan');
      log(s, L('Toprak örtüsü bitti: bu modül artık bir sığınak.', 'The soil cover is done: this module is now a shelter.'), 'good');
      bankOpen(s, 'b:kalkan'); noteTag(s, 'x:kalkan');
    }
  }
  const list = s.b.filter(b => b.left === 0).sort((a, b) => PRIO[a.k] - PRIO[b.k] || a.id - b.id);


  let free = Math.max(0, s.pop - busyWorkers(s));
  const lock = s.t < (s.fx.lockUntil || 0);
  for (const b of list) {
    if (!b.on) { b.st = 'kapali'; continue; }
    if (b.broken) { b.st = 'ariza'; continue; }
    const need = workersOf(s, b.k);
    if (lock && need > 0 && !LIFE[b.k]) { b.st = 'siginak'; continue; }
    if (need > free) { b.st = 'isci'; continue; }
    free -= need; b.st = 'ok';
  }
  s.idle = free;


  const sun = sunFactor(s, s.t);
  let gen = 0;
  const half = b => (b.slow && b.slow > s.t ? 0.5 : 1);
  for (const b of list) if (b.st === 'ok') gen += genOf(s, b, sun) * half(b);
  let avail = gen + s.stored, use = 0, need = 0, shed = 0;
  for (const b of list) {
    if (b.st !== 'ok') continue;
    const kw = BLD[b.k].kw || 0;
    if (!kw) continue;
    need += kw;
    if (avail >= kw) { avail -= kw; use += kw; } else { b.st = 'guc'; shed++; }
  }
  const cap = batteryCap(s);
  s.stored = clamp(s.stored + gen - use, 0, cap);
  s.pw = { gen, use, need, cap, shed, sun };
  s.stat.hours++;
  if (shed) { s.stat.black++; if (sun < 0.35) s.stat.blackDark++; if (s.stat.black === 1) learnKey(s, 'first:kesinti'); }


  const mm = moraleMult(s) * (s.t < (s.fx.restUntil || 0) ? 0.5 : 1);
  const P = { o2: 0, su: 0, gida: 0, malzeme: 4 / 24, parca: 0, bilim: 1 / 24 }, C = { o2: 0, su: 0, gida: 0, malzeme: 0, parca: 0, bilim: 0 };
  const lag = T.hidro ? 72 : 96, mold = s.t < (s.fx.moldUntil || 0);
  for (const b of list) {
    const d = BLD[b.k];
    if (b.k === 'sera') {
      if (b.st !== 'ok') {
        b.off = (b.off || 0) + 1;
        if (b.off === 24 && b.grow > 0) {
          b.grow = 0; s.stat.frozen++;
          log(s, L('Bir sera 24 saat elektriksiz kaldı. Bitkiler dondu, yeniden ekmek gerek.', 'A greenhouse had no power for 24 hours. The plants froze and must be replanted.'), 'bad');
        }
        continue;
      }
      const wn = d.inp.su / 24;
      if (s.res.su < wn) { b.st = 'girdi'; continue; }
      b.off = 0; s.res.su -= wn; C.su += wn; b.grow = (b.grow || 0) + 1;
      if (b.grow === lag) noteTag(s, 'x:hasat');

      if (b.grow >= lag && !mold) { P.gida += d.out.gida / 24 * mm * (T.hidro ? 1.35 : 1) * (lock ? 0.8 : 1) * half(b); P.o2 += d.out.o2 / 24 * (T.bio ? 3 : 1) * half(b); }
      continue;
    }
    if (b.st !== 'ok' || !d.out) continue;
    if (d.inp) {
      let ok = true;
      for (const r in d.inp) if (s.res[r] < d.inp[r] / 24) ok = false;
      if (!ok) { b.st = 'girdi'; continue; }
      for (const r in d.inp) { s.res[r] -= d.inp[r] / 24; C[r] += d.inp[r] / 24; }
    }
    for (const r in d.out) {
      let v = d.out[r] / 24 * (r === 'bilim' && b.k === 'anten' ? 1 : mm);
      if (b.k === 'maden' && tileAt(s, b.x, b.y) === 'm') v *= 1.5;
      if (b.k === 'maden' && easy(s)) v *= CK_KASIF_DIG;
      P[r] += v * half(b);
    }
  }
  for (const r of RES_KEYS) s.res[r] += P[r];


  const ec = Math.min(1, 8 * cnt(s, 'geri', 1) / Math.max(1, s.pop));
  const needs = { o2: s.pop * NEED.o2 / 24 * (1 - 0.4 * ec), su: s.pop * NEED.su / 24 * (1 - 0.85 * ec), gida: s.pop * NEED.gida / 24 };
  const RULE = { o2: [3, 3], su: [24, 12], gida: [48, 24] };
  if (s.train) for (const r of ['o2', 'su', 'gida']) s.res[r] = Math.max(s.res[r], 2 * NEED[r] * Math.max(1, s.pop));
  for (const r of ['o2', 'su', 'gida']) {
    if (s.res[r] >= needs[r]) { s.res[r] -= needs[r]; C[r] += needs[r]; s.short[r] = 0; continue; }
    C[r] += needs[r]; s.res[r] = 0; s.short[r]++; s.stat.sh[r]++;
    if (s.short[r] === 1) {
      recordCause(s, r);
      const nm = { o2: L('Oksijen', 'Oxygen'), su: L('Su', 'Water'), gida: L('Yemek', 'Food') }[r];
      log(s, L(`${nm.tr} bitti! Hemen çözmezsen ekipten biri Dünya'ya geri gönderilir.`, `${nm.en} has run out! Fix it now or a crew member is sent back to Earth.`), 'bad');
    }
    const [grace, every] = RULE[r];
    if (s.short[r] >= grace && (s.short[r] - grace) % every === 0) { evacuate(s, r); if (s.over) return true; }
  }
  const a = s.stat.hours <= 2 ? 1 : 1 / 6;
  for (const r of RES_KEYS) { s.rate[r].p += (P[r] * 24 - s.rate[r].p) * a; s.rate[r].c += (C[r] * 24 - s.rate[r].c) * a; }
  s.selfE += (selfSuff(s) - s.selfE) * (s.stat.hours <= 2 ? 1 : 1 / 24);


  s.dose += fin(doseRate(s) / 24);
  if (s.dose >= LIMIT_DOSE) { if (s.train) s.dose = LIMIT_DOSE - 1; else { finish(s, false, 'doz'); return true; } }
  s.fx.crowdH = s.pop > beds(s) ? (s.fx.crowdH || 0) + 1 : 0;
  s.mmod *= 0.985;
  s.moral += (moraleTarget(s) - s.moral) * 0.03;
  s.stat.moralSum += s.moral;
  if (!s.quiet && !s.train) { mutStep(s); if (s.over) return true; }

  stageStep(s);
  if (!s.train) storyStep(s);
  ckGuarStep(s);
  checkMissions(s);
  pwHour(s);

  if (s.t % 24 === 0 && !s.train) {
    s.hist.push({ d: dayOf(s) - 1, o2: s.res.o2, su: s.res.su, gida: s.res.gida, e: s.stored / cap, dose: s.dose, moral: s.moral, pop: s.pop, self: s.selfE });
    s.dirty = true;
  }
  if (!s.free && !s.train && s.t >= W.missionDays * 24 - 1) finish(s, true, '');
  return true;
}



const GOAL_B = { guc: ['gunes', 2], o2: ['oksijen', 1], su: ['su', 1], sera: ['sera', 1], pil: ['batarya', 2], maden: ['maden', 1], dongu: ['geri', 1] };

const GOAL_NEED = { guc: 'gunes', o2: 'oksijen', su: 'su', sera: 'sera', pil: 'batarya', maden: 'maden', ekip: 'yasam', dongu: 'geri' };
const goalReady = (s, m) => !GOAL_NEED[m.id] || unlockedB(s, GOAL_NEED[m.id]).ok;
function nextGoal(s) {
  for (const m of MISSIONS) {
    if (s.done[m.id] || !goalReady(s, m)) continue;
    const g = GOAL_B[m.id];
    if (g && s.b.filter(b => b.k === g[0]).length >= g[1] && s.b.some(b => b.k === g[0] && b.left > 0)) continue;
    return m;
  }
  return null;
}
function goalText(s, nm) {
  const g = GOAL_B[nm.id];
  let tr = `Sıradaki hedef: ${nm.t.tr}. ${nm.d.tr}`, en = `Next goal: ${nm.t.en}. ${nm.d.en}`;
  if (g) {
    const nb = s.b.filter(b => b.k === g[0] && b.left > 0).length;
    if (nb) { tr += ` (${nb} tanesi kuruluyor)`; en += ` (${nb} being built)`; }
    const c = costOf(s, g[0]);
    if (s.res.malzeme < c.m) {
      const d = Math.max(1, Math.ceil((s.shipAt - s.t) / 24)), dws = dw(s), mk = bname(s, 'maden');
      tr += ` Malzeme yetmiyor (${c.m} gerekir). Kargo gemisi ${d} ${dws.tr} sonra gelir; ${mk.tr} da malzeme yapar.`;
      en += ` Not enough material (${c.m} needed). The cargo ship comes in ${d} ${dws.en}; a ${mk.en} also makes material.`;
    }
  }
  return L(tr, en);
}


const MISSION_K = {
  guc: [L('İki güneş paneli kur', 'Build two solar panels'), L('Makineler elektrikle çalışır.', 'Machines run on power.')],
  o2: [L('Hava makinesi kur', 'Build an Air Maker'), L('Ekibin nefes alacak havası olmalı.', 'The crew needs air to breathe.')],
  su: [L('Buz çıkarıcı kur', 'Build an Ice Extractor'), L('Buz eriyince içme suyu olur.', 'Melted ice becomes drinking water.')],
  sera: [L('Sera kur', 'Build a Greenhouse'), L('Bitkiler yemek ve hava verir.', 'Plants give food and air.')],
  pil: [L('İki batarya kur', 'Build two batteries'), L('Batarya elektriği karanlığa saklar.', 'Batteries save power for the dark.')],
  maden: [L('Toprak kazıcı kur', 'Build a Soil Digger'), L('Kazıcı yapı malzemesi çıkarır.', 'The digger makes building material.')],
  kalkan: [L('Üssü toprakla ört', 'Cover the base with soil'), L('Kalın toprak radyasyonu durdurur.', 'Thick soil stops radiation.')],
  kesif: [L('Buzu ya da madeni tara', 'Scan ice or minerals'), L('Taramak yeni şeyler öğretir.', 'Scanning teaches you new things.')],
  ekip: [L('Ekibi 6 kişi yap', 'Grow the crew to 6'), L('Daha çok el, daha çok iş.', 'More hands get more work done.')],
  bilim: [L('İki buluş yap', 'Make two inventions'), L('Buluşlar makineleri güçlendirir.', 'Inventions make machines better.')],
  dongu: [L('Geri dönüştürücü kur', 'Build a Recycler'), L('Kullanılmış su yeniden içilir.', 'Used water is drunk again.')],
  self: [L('Kendi kaynağını üret', 'Make your own supplies'), L('Dünya\'ya daha az bağlı kal.', 'Rely less on Earth.')],
  kalici: [L('Ekibi 8 kişi yap', 'Grow the crew to 8'), L('Kalıcı bir üs kur.', 'Build a base that lasts.')],
};
for (const m of MISSIONS) if (MISSION_K[m.id]) { m.k = MISSION_K[m.id][0]; m.why = MISSION_K[m.id][1]; }
const RES_BLD = { o2: 'oksijen', su: 'su', gida: 'sera' };
const BLD_K = {
  oksijen: L('Hava makinesi kur', 'Build an Air Maker'), su: L('Buz çıkarıcı kur', 'Build an Ice Extractor'), sera: L('Sera kur', 'Build a Greenhouse'),
  gunes: L('Güneş paneli ekle', 'Add a solar panel'), batarya: L('Batarya kur', 'Build a battery'), yasam: L('Yaşam modülü kur', 'Build a Habitat Module'),
};

function scanTarget(s, kinds) {
  let best = null, bd = 1e9;
  for (let y = 0; y < MAPH; y++) for (let x = 0; x < MAPW; x++) {
    const i = idx(x, y), k = s.map.k[i];
    if (!kinds.includes(k) || s.scanned[i] || !SCANS[k]) continue;
    if (k === 's' && relicAt(s, x, y) < 0) continue;
    const d = Math.hypot(x - HUBX, y - HUBY) + (s.map.seen[i] ? 0 : 100);
    if (d < bd) { bd = d; best = { x, y }; }
  }
  return best;
}



const CK_HOW = {
  kalkan: L('İniş Modülü\'ne dokun → Toprakla ört', 'Tap the Landing Module → Cover with soil'),
  bilim: L('Tablet → Araştır', 'Tablet → Research'),
  ekip: L('Yatak kur, kargo gemisini bekle', 'Build beds, wait for the cargo ship'),
  stop: L('Bir yapıya dokun → Durdur', 'Tap a building → Stop'),
  repair: L('Bozuk yapıya dokun → Onar', 'Tap the broken building → Repair'),
  ship: L('Kargo gemisine dokun → Yükü seç', 'Tap the cargo ship → Pick the load'),
  call: L('ATLAS kartında bir yanıt seç', 'Pick an answer on the ATLAS card'),
  scan: L('Buz ya da maden karesine dokun → İncele', 'Tap an ice or mineral tile → Scan'),
  sur: L('Gezgine dokun → Sür', 'Tap the rover → Drive'),
  on: L('Makineye dokun → Çalıştır', 'Tap the machine → Start'),
  look: L('Makineye dokun, ne beklediğine bak', 'Tap the machine to see what it needs'),
  wait: L('Bekle: zaman ilerlesin', 'Wait: let time pass'),
  grow: L('Kur → yeni bir yapı seç', 'Build → pick a new building'),
};
function ckHowBuild(s, bk) {
  const g = BLD[bk] && BLD[bk].group, gn = g && typeof GROUPS !== 'undefined' ? GROUPS[g] : null;
  return gn ? L(`Kur → ${gn.tr}`, `Build → ${gn.en}`) : CK_HOW.grow;
}
function ckGoalHow(s, g) {
  if (!g) return null;
  if (g.id === 'sur') return CK_HOW.sur;
  if (g.id === 'ekip' || g.id === 'kalici') return CK_HOW.ekip;
  if (g.act === 'build' && g.bk) return ckHowBuild(s, g.bk);
  if (g.act === 'repair') return CK_HOW.repair;
  if (g.act === 'ship') return CK_HOW.ship;
  if (g.act === 'call') return CK_HOW.call;
  if (g.act === 'scan') return CK_HOW.scan;
  if (g.id === 'kalkan') return CK_HOW.kalkan;
  if (g.id === 'acil:guc') return CK_HOW.stop;
  if (g.id === 'bilim' && g.act === 'wait') return CK_HOW.bilim;
  if (g.id === 'ekip' || g.id === 'kalici') return CK_HOW.ekip;
  if (g.act === 'walk') return g.k && /çalıştır/i.test(g.k.tr) ? CK_HOW.on : CK_HOW.look;
  if (g.id === 'buyut') return CK_HOW.grow;
  return CK_HOW.wait;
}
function currentGoal(s) {
  const g = ckGoal0(s);
  if (g && g.id === 'pil' && g.act === 'build' && g.bk === 'batarya') {
    let n = 0; try { const pn = powerOutlook(s).night; n = pn && pn.short ? pn.addBat || 0 : 0; } catch (e) { n = 0; }
    if (n > GOAL_B.pil[1]) g.k = L(`${n} batarya kur`, `Build ${n} batteries`);
  }
  if (g) g.how = ckGoalHow(s, g);
  return g;
}
function ckGoal0(s) {
  if (!s || s.over) return null;
  const G = (id, k, why, act, bk, at, urgent) => ({ id, k, why: why || null, act, bk: bk && BLD[bk] && unlockedB(s, bk).ok ? bk : null,
    tx: at && inMap(at.x, at.y) ? at.x : null, ty: at && inMap(at.x, at.y) ? at.y : null, urgent: !!urgent });
  const spot = k => (unlockedB(s, k).ok ? suggestSpot(s, k) : null);
  const repairG = (b, urgent) => G('onar:' + b.id, L('Bozuk makineyi onar', 'Repair the broken machine'),
    s.res.parca < repairCost(s, b) ? L('Yedek parça gerekiyor: kargodan iste.', 'You need spare parts: order them by cargo.') : L('Bozuk makine çalışmaz.', 'A broken machine does not work.'),
    'repair', b.k, { x: b.x, y: b.y }, urgent);
  const cargo = s.pending.find(p => p.type === 'cargo');

  if (!s.train) {
    for (const r of ['o2', 'su', 'gida']) {
      if (!s.short[r] && !(daysLeft(s, r) < 2)) continue;
      const k = RES_BLD[r], br = s.b.find(b => b.k === k && b.broken);
      if (br) return repairG(br, true);
      if (cargo) return G('acil:' + r, L('Kargo gemisine git', 'Go to the cargo ship'), L('Gemide yedek kaynak var.', 'The ship carries supplies.'), 'ship', null, null, true);
      if (unlockedB(s, k).ok) return G('acil:' + r, BLD_K[k], L(`${PV_WORD[r].tr[0].toUpperCase() + PV_WORD[r].tr.slice(1)} 2 günden az kaldı.`, `Less than 2 days of ${PV_WORD[r].en} left.`), 'build', k, spot(k), true);
    }
    if (s.pw.shed > 0) {
      const br = s.b.find(b => b.broken && b.left === 0 && makesPower(s, b.k));
      if (br) return repairG(br, true);
      if (isDark(s) || stormOn(s)) return G('acil:guc', L('Bir makineyi durdur', 'Switch a machine off'), L('Elektrik az: gereksiz makineyi kapat.', 'Power is low: switch off what you do not need.'), 'wait', null, null, true);
      return G('acil:guc', BLD_K.gunes, L('Elektrik yetmiyor.', 'There is not enough power.'), 'build', 'gunes', spot('gunes'), true);
    }
  }

  const br = s.b.filter(b => b.broken && b.left === 0).sort((a, b) => a.id - b.id)[0];
  if (br) return repairG(br, true);

  if (cargo) return G('kargo', L('Kargo gemisine git', 'Go to the cargo ship'), L('Yükünü sen seç.', 'Pick your own cargo.'), 'ship', null, null, false);
  const ask = s.pending.find(p => p.type === 'event' && ATLAS_Q.includes(p.id));
  if (ask) return G('soru:' + ask.pid, L('ATLAS\'ın sorusunu yanıtla', 'Answer ATLAS\'s question'), null, 'call', null, null, false);

  const m = nextGoal(s);

  if (!s.train && m && m.id === 'kesif' && s.tags && s.tags['x:surus'] == null && (s.tags['x:egitim'] != null || featOn(s, 'surus'))
    && s.t - Math.max(0, ...Object.values(s.done || {}).map(Number).filter(Number.isFinite)) < 24)
    return G('sur', L('Gezgini sür', 'Drive the rover'), L('Ehliyetin hazır: gezgine dokun, Sür\'e dokun.', 'Licence ready: tap the rover, then tap Drive.'), 'walk', null, null, false);
  if (!m) return G('buyut', L('Üssü büyüt', 'Grow the base'), L('Yeni makine kur, ekibi büyüt.', 'Add machines and grow the crew.'), 'wait', null, null, false);
  const k = m.k || m.t, why = m.why || null;
  const shipWait = () => G(m.id, k, L('Kargo gemisi yeni ekip getirir.', 'The cargo ship brings new crew.'), 'wait', null, null, false);
  const buildG = bk => {
    const gb = GOAL_B[m.id], have = s.b.filter(b => b.k === bk);
    if (gb && have.length >= gb[1] && !have.some(b => b.left > 0)) {
      const st = have.find(b => b.st !== 'ok');
      if (st && st.st === 'kapali') return G(m.id, L('Makineyi çalıştır', 'Switch the machine on'), L('Bu makine kapalı.', 'This machine is switched off.'), 'walk', null, { x: st.x, y: st.y }, false);
      if (st && st.st === 'guc') return G(m.id, BLD_K.gunes, L('Makine elektrik bekliyor.', 'The machine is waiting for power.'), 'build', 'gunes', spot('gunes'), false);
      if (st) return G(m.id, k, L('Makine bir şey bekliyor: üstüne dokun.', 'The machine is waiting: tap it.'), 'walk', null, { x: st.x, y: st.y }, false);
    }
    return G(m.id, k, why, 'build', bk, spot(bk), false);
  };
  switch (m.id) {
    case 'ekip': case 'kalici': return beds(s) - s.pop >= 2 ? shipWait() : G(m.id, k, L('Yeni ekibe yatak gerekir.', 'New crew needs beds.'), 'build', 'yasam', spot('yasam'), false);
    case 'kalkan': { const b = s.b.find(o => canShield(s, o)) || s.b.find(o => o.k === 'hub'); return G(m.id, k, why, 'walk', null, b ? { x: b.x, y: b.y } : null, false); }
    case 'kesif': return G(m.id, k, why, 'scan', null, scanTarget(s, ['i', 'm']) || scanTarget(s, ['i', 'm', 't', 'c', 'r']), false);
    case 'bilim': {
      if (TECH_ORDER.some(id => techState(s, id) === 'ok')) return G(m.id, k, L('Tablet\'te bir buluş seç.', 'Pick an invention on the Tablet.'), 'wait', null, null, false);
      const at = scanTarget(s, ['i', 'm', 't', 'c', 'r', 's']);
      return at ? G(m.id, k, L('Taramak bilim kazandırır.', 'Scanning earns science.'), 'scan', null, at, false) : G(m.id, k, L('Bilim birikiyor.', 'Science is adding up.'), 'wait', null, null, false);
    }
    case 'self': {
      let lo = null, lv = 2;
      for (const r of ['o2', 'su', 'gida']) { const c = s.rate[r].c, p = s.rate[r].p, v = c <= 1e-6 ? 1 : p / c; if (v < lv) { lv = v; lo = r; } }
      const bk = RES_BLD[lo || 'gida'];
      return G(m.id, k, why, 'build', bk, spot(bk), false);
    }
  }
  if (GOAL_NEED[m.id]) return buildG(GOAL_NEED[m.id]);
  return G(m.id, k, why, 'wait', null, null, false);
}

function missionGoal(s) {
  if (s.train) return L('Üssü tanı, işleri öğren', 'Get to know the base');
  const n = WORLDS[s.world].missionDays, d = dw(s);
  return L(`${n} ${d.tr} boyunca ekibi hayatta tut`, `Keep the crew safe for ${n} ${d.en}`);
}

function trainBreak(s, k) {
  const c = s.b.filter(b => b.k !== 'hub' && b.left === 0 && !b.broken && (!k || b.k === k)).sort((a, b) => a.id - b.id);
  if (!c.length) return null;
  const b = c[0];
  b.broken = true; b.st = 'ariza'; s.fx.hit = { id: b.id, t: s.t };
  return b.id;
}

function trainShip(s) {
  if (s.over || s.pending.some(p => p.type === 'cargo')) return false;
  s.fx.shipT = s.t;
  pushCargo(s);
  return true;
}

function trainAsk(s) {
  if (s.over || decisionPending(s)) return false;
  return pushEvent(s, 'egitim');
}
function advice(s) {
  const W = WORLDS[s.world], out = [];
  const A = (tr, en, c) => out.push({ m: L(tr, en), c: c || 'warn' });
  const dws = dw(s);
  const mi = mutinyInfo(s);
  if (mi.lvl >= 1) { const h = mutinyHint(s); A(`Ekip huzursuz (${mi.lvl}. uyarı). ${h.tr}`, `The crew is unhappy (warning ${mi.lvl}). ${h.en}`, 'bad'); }
  for (const [r, k, tr, en] of [['o2', 'oksijen', 'Oksijen', 'Oxygen'], ['su', 'su', 'Su', 'Water'], ['gida', 'sera', 'Yemek', 'Food']]) {
    const dl = daysLeft(s, r), nb = bname(s, k), dtr = dl.toFixed(1).replace('.', ',');
    if (s.short[r]) A(`${tr} bitti! Tek çare üretmek: ${nb.tr}.`, `${en} is gone! The only fix is to make it: ${nb.en}.`, 'bad');
    else if (dl < 5) {
      if (!cnt(s, k)) A(`${tr} ${dtr} ${dws.tr} yeter. Bir ${nb.tr} kur.`, `${en} lasts ${dl.toFixed(1)} ${dws.en}. Build ${/^[AEIOU]/i.test(nb.en) ? 'an' : 'a'} ${nb.en}.`, dl < 2.5 ? 'bad' : 'warn');
      else A(`${tr} ${dtr} ${dws.tr} yeter. Yaptığın, harcadığından az.`, `${en} lasts ${dl.toFixed(1)} ${dws.en}. You use more than you make.`, dl < 2.5 ? 'bad' : 'warn');
    }
  }
  if (s.b.some(b => b.broken)) A('Bozuk bir yapı var. Kırmızı anahtarlı yapıya dokun, Onar\'a dokun.', 'A building is broken. Tap the building with the red wrench, then tap Repair.');
  if (s.pw.shed) {
    if (W.night && isDark(s)) A('Uzun gece: elektrik yetmiyor. Şu an gerekmeyen bir yapıya dokun, Durdur\'a dokun.', 'Long night: not enough power. Tap a building you do not need now, then tap Stop.');
    else if (stormOn(s)) A('Fırtına panelleri kesti. Batarya bitince yapılar sırayla kapanır.', 'The storm cut the panels. When batteries run out, buildings stop one by one.');
    else if (s.pw.sun < 0.05) A('Gece batarya yetmiyor. Batarya ekle.', 'Batteries do not last the night. Add a Battery Bank.');
    else A('Elektrik yetmiyor. Güneş Paneli ekle.', 'Not enough power. Add Solar Panels.');
  }
  if (s.b.some(b => b.st === 'isci')) A('Çalışacak kişi yetmiyor. Kargo gemisiyle ekip getir ya da bir yapıya dokunup Durdur\'a dokun.', 'Not enough workers. Bring crew on the cargo ship, or tap a building, then tap Stop.');
  if (s.b.some(b => b.st === 'girdi' && b.k === 'sera')) A('Seraya su yetmiyor.', 'The greenhouse has no water.');
  const hn = hoursToNight(s);
  if (hn > 0 && hn < 96) {
    const pn = powerOutlook(s).night, d = Math.ceil(hn / 24);
    if (pn && pn.short) A(`Uzun geceye ${d} gün var. Elektriğin ${pn.lastsH} saat yeter: batarya ekle.`, `${d} ${d === 1 ? 'day' : 'days'} to the long night. Power lasts ${pn.lastsH} hours: add batteries.`);
  }
  if (shieldFrac(s) < 1 && s.world === 'ay' && s.t > 96) A(`Korunaklı yatak herkese yetmiyor. Güneş patlamasından önce ${bname(s, 'hub').tr}'ne ya da bir Yaşam Modülü'ne dokun, "Toprakla ört"e dokun.`, `Not everyone has a protected bed. Before a solar flare, tap the ${bname(s, 'hub').en} or a Habitat Module, then tap "Cover with soil".`);
  if (s.pop > beds(s)) A('Yatak yetmiyor. Yaşam Modülü kur.', 'Not enough beds. Build a Habitat Module.');
  if (s.pending.some(p => p.type === 'cargo')) A('Kargo gemisi seni bekliyor. Yanına git ve yükünü seç.', 'The cargo ship is waiting. Go to it and pick your cargo.', 'info');
  if (mi.lvl < 1 && s.moral < 35) A('Ekip mutsuzlaşıyor. Dinlenme Kubbesi kur ya da Yaşam Modülü ile yatak ekle.', 'The crew is getting unhappy. Build a Recreation Dome or add beds with a Habitat Module.');
  const ng = nextGoal(s);
  if (out.length && ng && (missionCount(s) < 6 || s.idle < 2)) out.goal = goalText(s, ng);
  if (!out.length) {
    const nm = ng;
    if (nm && (missionCount(s) < 6 || s.idle < 2)) { const g = goalText(s, nm); A(g.tr, g.en, 'info'); }
    else if (s.idle >= 2) A(`${s.idle} kişi boşta. Yeni bir makine kur.`, `${s.idle} people are idle. Build another machine.`, 'info');
    else if (TECH_ORDER.some(id => techState(s, id) === 'ok')) A('Yeni bir buluş yapabilirsin (Araştırma).', 'You can make a new invention (Research).', 'info');
    else if (relicTiles(s).some(r => !s.scanned[idx(r.x, r.y)])) A('Çevreyi keşfet. Tarayıcın yeni alanlar ve eski izler bulabilir.', 'Explore around. Your scanner can find new patches and old traces.', 'info');
    else if (shieldFrac(s) < 1) A('Sırada radyasyon var: yaşam modüllerini toprakla ört.', 'Next up, radiation: cover living modules with soil.', 'info');
    else A('Üs dengede. Büyümeyi düşün: yeni modül, yeni ekip.', 'The base is steady. Think about growing: new modules, new crew.', 'good');
  }
  return out;
}


function gradeOf(v, cuts) { const g = ['A', 'B', 'C', 'D']; for (let i = 0; i < 4; i++) if (v >= cuts[i]) return g[i]; return 'F'; }

function migrate(s) {
  const st = s.stat;
  if (typeof st.genEver !== 'boolean') st.genEver = s.b.some(b => b.left === 0 && BLD[b.k] && makesPower(s, b.k));
  if (!st.choices) st.choices = [];
  if (!s.mut) s.mut = { lvl: 0, low: 0, good: 0, at: -99, max: 0 };
  if (s.fx.cleanUntil == null) s.fx.cleanUntil = 0;
  if (s.fx.crowdH == null) s.fx.crowdH = 0;
  if (!s.story.react) s.story.react = {};
  if (!s.story.goalQ) s.story.goalQ = [];
  if (!s.unl) s.unl = {};
  if (s.stage == null) s.stage = buildStage(s);
  wqInit(s);
  if (!s.ach) s.ach = {};
  if (!s.achP) s.achP = {};
  for (const k of ['wqN', 'wqOk', 'wqSkip', 'drones', 'qeN', 'qeOk', 'qeBad', 'pwarn']) if (st[k] == null) st[k] = 0;
  qInit(s); learnInit(s);
  if (!Array.isArray(s.fx.spend)) s.fx.spend = [];
  if (!Array.isArray(s.fx.pwarn)) s.fx.pwarn = [];
}
function debrief(s) {
  migrate(s);
  const W = WORLDS[s.world], st = s.stat, H = Math.max(1, st.hours);
  const sp = st.selfParts || { o2: 0, su: 0, gida: 0 };
  const cause = r => st.causes.find(c => c.r === r);
  const WHY = {
    yok: L('üretim yapısı hiç kurulmadı, depodaki stok bitti', 'no production building was ever built and the stock ran out'),
    guc: L('üretim yapısı elektriksiz kaldı', 'the production building lost power'),
    isci: L('üretim yapısında çalışacak kişi yoktu', 'there was nobody to run the production building'),
    ariza: L('üretim yapısı bozuktu ve onarılmadı', 'the production building was broken and not repaired'),
    girdi: L('üretim yapısı çalışmıyordu', 'the production building was not running'),
    az: L('üretim, büyüyen ekibe yetişemedi', 'production could not keep up with the growing crew'),
  };
  const out = [];

  const up = 1 - st.black / H;
  let n;
  if (!st.genEver) n = L('Hiç elektrik yapısı kurmadın; yalnız iniş aracının bataryasıyla idare ettin.', 'You never built a power source; you got by on the lander battery alone.');
  else if (st.black === 0) n = L('Elektrik hiç kesilmedi.', 'Power never failed.');
  else if (st.blackDark / st.black > 0.6) n = W.night
    ? L(`${st.black} saat elektrik yetmedi; çoğu uzun gecedeydi. Panel karanlıkta çalışmaz: batarya ya da jeneratör gerekir.`, `Power fell short for ${st.black} hours, mostly in the long night. Panels do not work in the dark: you need batteries or a generator.`)
    : L(`${st.black} saat elektrik yetmedi; çoğu gece ya da fırtınadaydı. Panel tek başına yetmez: batarya ya da jeneratör gerekir.`, `Power fell short for ${st.black} hours, mostly at night or in storms. Panels alone are not enough: you need batteries or a generator.`);
  else n = L(`${st.black} saat elektrik yetmedi. Yeni yapı kurmadan önce elektriğe bak.`, `Power fell short for ${st.black} hours. Check your power before adding buildings.`);
  out.push({ id: 'guc', name: L('Elektrik', 'Power'), g: st.genEver ? gradeOf(up, [0.97, 0.9, 0.8, 0.65]) : 'F', note: n });

  const lifeV = (sp.o2 + sp.su) / 2 - Math.min(0.6, (st.sh.o2 * 8 + st.sh.su * 3) / H);
  const c1 = cause('o2') || cause('su');
  if (c1) { const nm = c1.r === 'o2' ? L('Oksijen', 'Oxygen') : L('Su', 'Water'); n = L(`${nm.tr} ${c1.d}. gün bitti: ${WHY[c1.why].tr}.`, `${nm.en} ran out on day ${c1.d}: ${WHY[c1.why].en}.`); }
  else if ((sp.o2 + sp.su) / 2 >= 0.95) n = L('Hava ve suyun tamamını kendin yaptın.', 'You made all your air and water yourself.');
  else n = L(`Hava ve suyun %${Math.round((sp.o2 + sp.su) * 50)}'sini kendin yaptın; gerisi Dünya'dan geldi.`, `You made ${Math.round((sp.o2 + sp.su) * 50)}% of your air and water yourself; the rest came from Earth.`);
  out.push({ id: 'yasam', name: L('Hava ve Su', 'Air & Water'), g: gradeOf(lifeV, [0.9, 0.7, 0.5, 0.3]), note: n });

  const foodV = sp.gida - Math.min(0.6, st.sh.gida * 3 / H);
  const c2 = cause('gida');
  if (c2) n = L(`Yemek ${c2.d}. gün bitti: ${WHY[c2.why].tr}. Sera ilk ürünü 4 günde verir, erken kurulmalı.`, `Food ran out on day ${c2.d}: ${WHY[c2.why].en}. A greenhouse takes 4 days to yield, so build early.`);
  else if (st.frozen) n = L(`Yemeğin %${Math.round(sp.gida * 100)}'ünü seralar karşıladı. ${st.frozen} kez bitkiler dondu: seraya kesintisiz elektrik gerekir.`, `Greenhouses covered ${Math.round(sp.gida * 100)}% of food. Plants froze ${st.frozen} time(s): a greenhouse needs unbroken power.`);
  else n = L(`Yemeğin %${Math.round(sp.gida * 100)}'ünü seralar karşıladı.`, `Greenhouses covered ${Math.round(sp.gida * 100)}% of food.`);
  out.push({ id: 'gida', name: L('Yemek', 'Food'), g: gradeOf(foodV, [0.85, 0.6, 0.4, 0.2]), note: n });

  const gained = s.dose - W.startDose, base = W.doseRate * Math.max(1, s.t / 24), ratio = gained / base;
  const rg = ratio <= 0.85 ? 'A' : ratio <= 1.3 ? 'B' : ratio <= 2.2 ? 'C' : ratio <= 3.5 ? 'D' : 'F';
  if (st.flareOpen) n = L(`Ekip görevde ${radAmt(s, gained, null, true).tr} aldı. ${st.flares} güneş patlamasının ${st.flareOpen} tanesinde herkes korunakta değildi.`, `The crew took ${radAmt(s, gained, null, true).en} on the mission. In ${st.flareOpen} of ${st.flares} solar flares not everyone was protected.`);
  else n = L(`Ekip görevde ${radAmt(s, gained, null, true).tr} aldı. Korunaklı yataklar güneş patlamalarını etkisiz kıldı.`, `The crew took ${radAmt(s, gained, null, true).en} on the mission. Protected beds took the sting out of solar flares.`);
  out.push({ id: 'rad', name: L('Radyasyon', 'Radiation'), g: s.over && s.over.why === 'doz' ? 'F' : rg, note: n });

  const mAvg = st.moralSum / H, crewV = mAvg - st.evac * 15;
  if (s.over && s.over.why === 'isyan') {
    const ids = (st.mut && st.mut.why) || [];
    const ws = ids.map(id => (id === 'olaylar' && moodNames(s, 3)) || MOR_WHY[id]).filter(Boolean);
    n = L(`Moral günlerce 30'un altında kaldı ve ekip seni eve gönderdi.${ws.length ? ' En çok etkileyenler: ' + ws.map(w => w.tr).join(', ') + '.' : ''}`,
          `Morale stayed below 30 for days and the crew sent you home.${ws.length ? ' The biggest reasons: ' + ws.map(w => w.en).join(', ') + '.' : ''}`);
    out.push({ id: 'ekip', name: L('Ekip', 'Crew'), g: 'F', note: n });
    return out;
  }
  if (st.evac) n = L(`${st.evac} kişi Dünya'ya geri gönderildi. Ortalama moral ${Math.round(mAvg)}.`, `${st.evac} crew sent back to Earth. Average morale ${Math.round(mAvg)}.`);
  else n = L(`Kimse eve gönderilmedi. Ortalama moral ${Math.round(mAvg)}.`, `Nobody was sent home. Average morale ${Math.round(mAvg)}.`);
  out.push({ id: 'ekip', name: L('Ekip', 'Crew'), g: gradeOf(crewV, [70, 60, 50, 38]), note: n });
  return out;
}
function score(s) {
  const W = WORLDS[s.world], st = s.stat, H = Math.max(1, st.hours);
  const self = st.selfEnd != null ? st.selfEnd : s.selfE;
  const win = !!(s.over && s.over.win);
  const grades = debrief(s);
  const parts = [
    [L('Görev süresi', 'Mission time'), win ? 400 : Math.round(300 * Math.min(1, s.t / (W.missionDays * 24)))],
    [L('Ekip büyüklüğü', 'Crew size'), Math.min(12, s.pop) * 40],
    [L('Kendi kendine yetme', 'Self-reliance'), Math.round(self * 400)],
    [L('Buluşlar', 'Inventions'), techCount(s) * 30],
    [L('Hedefler', 'Goals'), missionCount(s) * 25],
    [L('Moral', 'Morale'), Math.round(st.moralSum / H * 2)],
    [L('Bilgi soruları', 'Quiz answers'), st.quizOk * 15],
    [L('Keşifler', 'Discoveries'), ['i', 'm', 't', 'c', 'r'].filter(k => s.bank['s:' + k] != null).length * 8 + (st.relics || 0) * 30],
    [L('Eve gönderilenler', 'Sent home'), -st.evac * 120],
    [L('Radyasyon', 'Radiation'), -Math.min(300, Math.max(0, Math.round(s.dose - W.startDose - 100)))],
  ];
  for (const p of parts) p[1] = fin(p[1]);
  const total = Math.max(0, parts.reduce((a, p) => a + p[1], 0));
  let stars = 0;
  if (win) {
    stars = 1;
    if (st.evac === 0 && self >= 0.7) stars = 2;
    if (stars === 2 && s.pop >= 8 && self >= 0.9 && !grades.some(g => g.g === 'F' || g.g === 'D')) stars = 3;
  }
  const rank = total >= 2100 ? L('Koloni Mimarı', 'Colony Architect') : total >= 1700 ? L('Üs Komutanı', 'Base Commander')
    : total >= 1300 ? L('Sistem Mühendisi', 'Systems Engineer') : total >= 900 ? L('Görev Uzmanı', 'Mission Specialist') : L('Aday Astronot', 'Astronaut Candidate');
  return { total, parts, stars, rank, grades, self };
}
