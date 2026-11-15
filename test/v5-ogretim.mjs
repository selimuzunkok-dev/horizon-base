

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const src = ['veri.js', 'gercek.js', 'cekirdek.js', 'hikaye.js'].map(f => fs.readFileSync(path.join(dir, '..', 'src', f), 'utf8')).join('\n');
const names = ['WORLDS', 'BLD', 'BUILD_ORDER', 'EVENTS', 'TEACH', 'WORKQ', 'SCANS', 'MAPW', 'newGame', 'tick', 'build', 'canBuild', 'suggestSpot', 'unlockedB', 'currentGoal',
  'repair', 'repairCost', 'resolve', 'cargoSuggest', 'explore', 'scan', 'research', 'techState', 'TECH_ORDER', 'quickQ', 'repairQ', 'buildQ', 'cnt', 'toggle', 'canShield', 'shieldUp', 'shieldCost'];
const G = vm.runInNewContext(src + `\n;({${names.join(',')}})`, { console });
const AYR = !!process.env.AYRINTI;

let fail = 0, n = 0;
const errs = [];
const check = (ok, msg) => { n++; if (!ok) { fail++; errs.push(msg); } };

const teachFor = (w, id) => G.TEACH.find(t => t.id === id && (!t.w || t.w === w));
const ayTeach = G.TEACH.filter(t => !t.w || t.w === 'ay');

function put(s, k, at) {
  if (!G.canBuild(s, k).ok) return null;
  let sp = at && at.x != null ? at : G.suggestSpot(s, k);
  if (sp && !G.canBuild(s, k, sp.x, sp.y).ok) sp = G.suggestSpot(s, k);
  if (!sp) return null;
  const r = G.build(s, k, sp.x, sp.y);
  return r.ok ? r : null;
}
function calls(s) {
  for (const p of s.pending.slice()) {
    if (p.type === 'cargo') {

      const wantCore = !s.b.some(b => b.k === 'reaktor') && !s.core && p.mass >= 1500 && s.level === 'kasif';
      const r = G.resolve(s, wantCore ? { core: 1 } : G.cargoSuggest(s, p.mass), p.pid); if (!r || !r.ok) G.resolve(s, {}, p.pid);
    }
    else if (G.resolve(s, 0, p.pid) === null) G.resolve(s, 1, p.pid);
  }
}

function run(level, seed, opt) {
  const o = opt || {};
  const s = G.newGame('ay', level, seed, 'O');
  const R = { level, seed, asked: [], wrong: [], relaxed: [], firstBuild: {}, firstMiss: [], learnedAt: null, buildQs: 0, repairQs: 0, repairsNoQ: 0, kinds: new Set() };
  let ansN = 0;
  const choose = q => { const bad = (ansN++ % 3) === 2; return bad ? 1 + (ansN % (q.a.length - 1)) : 0; };
  const record = (q, act, choice, bid) => {
    const taught = !q.teach || s.learn[q.teach] != null;
    const it = { qi: q.qi, act, t: s.t, teach: q.teach, taught, ok: choice === 0, k: (G.WORKQ[q.qi] || {}).k || null, at: q.k };
    R.asked.push(it); if (!taught) R.relaxed.push(it); if (choice !== 0) R.wrong.push(it);
  };
  const order = G.BUILD_ORDER.slice();
  let i = 0, g = 0;
  while (!s.over && g++ < 5000) {
    calls(s);

    for (const b of s.b) if (b.broken && s.res.parca >= G.repairCost(s, b)) {
      const q = G.quickQ(s, 'repair', b.k);
      if (!q) { G.repair(s, b); R.repairsNoQ++; continue; }
      const c = choose(q); record(q, 'repair', c, b.id); R.repairQs++;
      const r = G.repairQ(s, b, q.qi, c);
      check(r && r.done, `onarım yapıldı (${level} ${seed} t=${s.t})`);
    }

    if (s.t % 2 === 0) {
      const tryK = [];
      const goal = G.currentGoal(s); if (goal && goal.act === 'build' && goal.bk) tryK.push(goal.bk);
      for (const k of order) if (!R.firstBuild[k]) tryK.push(k);
      tryK.push(order[i++ % order.length]);
      if (!o.noBat && s.b.filter(b => b.k === 'batarya').length < 6) tryK.unshift('batarya');
      for (const k of tryK) {
        const first = !s.b.some(b => b.k === k);
        const r = put(s, k, goal && goal.bk === k && goal.tx != null ? { x: goal.tx, y: goal.ty } : null);
        if (!r) continue;
        if (first && !R.firstBuild[k]) {
          const t = ayTeach.find(x => x.on === 'build:' + k);
          R.firstBuild[k] = s.t;
          if (!t || s.learn[t.id] == null) R.firstMiss.push(k);
        }
        const q = G.quickQ(s, 'build', k);
        if (q) { const c = choose(q); record(q, 'build', c, r.b.id); R.buildQs++; G.buildQ(s, r.b.id, q.qi, c); }
        break;
      }
    }

    if (s.t % 6 === 3) {
      for (let y = 0; y < s.map.k.length / G.MAPW; y++) for (let x = 0; x < G.MAPW; x++) {
        const k = s.map.k[y * G.MAPW + x]; if (!G.SCANS[k] || R.kinds.has(k) || s.scanned[y * G.MAPW + x]) continue;
        G.explore(s, x, y); const r = G.scan(s, x, y); if (r && r.ok !== false) R.kinds.add(k);
      }
    }
    if (s.t % 24 === 5) for (const id of G.TECH_ORDER) if (G.techState(s, id) === 'ok') { G.research(s, id); break; }
    if (s.over) break;
    G.tick(s);
  }
  R.s = s;
  R.learned = Object.keys(s.learn).filter(id => ayTeach.some(t => t.id === id));

  R.reasked = 0; R.notReasked = [];
  for (const w of R.wrong) { if (R.asked.some(a => a.qi === w.qi && a.t > w.t)) R.reasked++; else R.notReasked.push(w); }
  return R;
}

const SEEDS = [1, 2, 3, 4];
const runs = [];
for (const level of ['kasif', 'muhendis']) for (const seed of SEEDS) runs.push(run(level, seed));


const all14 = G.BUILD_ORDER.length;
check(all14 === 14, `Ay'da 14 yapı (${all14})`);
const builtAny = new Set(), missAny = new Set();
for (const R of runs) { Object.keys(R.firstBuild).forEach(k => builtAny.add(k)); R.firstMiss.forEach(k => missAny.add(k)); }
check(builtAny.size === 14, `(a) bot 14 yapının hepsini kurdu: ${[...builtAny].join(',')} · eksik: ${G.BUILD_ORDER.filter(k => !builtAny.has(k)).join(',') || '-'}`);
check(missAny.size === 0, `(a) her yapının Bilgisi ilk yerleştirmede öğrenildi (eksik: ${[...missAny].join(',') || '-'})`);
for (const k of G.BUILD_ORDER) check(!!ayTeach.find(t => t.on === 'build:' + k), `(a) build:${k} için Ay Bilgisi var`);


const relaxed = runs.flatMap(R => R.relaxed.map(x => ({ ...x, run: R.level + '/' + R.seed })));
const relaxedBuild = relaxed.filter(x => x.act === 'build');
check(relaxedBuild.length === 0, `(b) inşa sorularında kural hiç gevşemedi (${relaxedBuild.length})`);
const askedAll = runs.reduce((a, R) => a + R.asked.length, 0);
check(askedAll > 0, `(b) sorular soruldu (${askedAll})`);
for (const R of runs) for (const a of R.asked) if (a.teach) check(!!teachFor('ay', a.teach), `(b) soru teach'i Ay'da çözülür: ${a.teach}`);


const wrongAll = runs.reduce((a, R) => a + R.wrong.length, 0), reaskedAll = runs.reduce((a, R) => a + R.reasked, 0);
const notRe = runs.flatMap(R => R.notReasked.map(w => ({ ...w, run: R.level + '/' + R.seed, lastT: R.s.t })));
check(wrongAll > 0, `(c) yanlış yanıt verildi (${wrongAll})`);



const KNOWN_FIRST = ['gorev', 'kesinti', 'geceBasi', 'geceSonu', 'onarim', 'kargo', 'kalkan'];
const ayTiles = new Set(); { const s0 = G.newGame('ay', 'kasif', 1, 'X'); s0.map.k.forEach(k => ayTiles.add(k)); for (const sd of [2, 3, 4, 5]) G.newGame('ay', 'kasif', sd, 'X').map.k.forEach(k => ayTiles.add(k)); }
const deadWhy = t => {
  const [p, v] = String(t.on).split(':');
  if (p === 'build') return G.BUILD_ORDER.includes(v) ? null : 'yapı Ay listesinde yok';
  if (p === 'ev') { const e = G.EVENTS[v]; if (!e) return 'olay yok'; if (e.train) return 'yalnız eğitim olayı'; if (Array.isArray(e.worlds) && !e.worlds.includes('ay')) return 'olay Ay\'da gelmez'; return null; }
  if (p === 'tara') return ayTiles.has(v) && G.SCANS[v] ? null : 'Ay haritasında bu karo yok';
  if (p === 'first') return KNOWN_FIRST.includes(v) ? null : 'bilinmeyen first: anahtarı';
  if (p === 'gun') return /^\d+$/.test(v) && +v >= 2 && +v <= 30 ? null : 'gun:<n> 2..30 olmalı';
  return 'bilinmeyen önek';
};
const hit = {}; for (const R of runs) for (const id of R.learned) hit[id] = (hit[id] || 0) + 1;

const extra = [run('kasif', 1, { noBat: true }), ...[5, 6, 7, 8, 9, 10, 11, 12].map(sd => run('kasif', sd))];
const hitX = {}; for (const R of extra) for (const id of R.learned) hitX[id] = (hitX[id] || 0) + 1;
const keyRows = [];
for (const t of ayTeach) {
  const dead = deadWhy(t), h = hit[t.id] || 0;
  check(!dead, `(d) ${t.id} (${t.on}) ölü değil${dead ? ': ' + dead : ''}`);
  let why = '';
  if (!h && !dead) { const [p] = t.on.split(':'); why = p === 'ev' ? 'olay ana koşularda gelmedi (rastgele olay)' : t.on === 'first:kesinti' ? 'ana bot batarya kurdu, kesinti olmadı' : 'tetiklenmedi'; if (hitX[t.id]) why += `; ek koşularda ${hitX[t.id]}/${extra.length} tetiklendi`; }
  keyRows.push({ id: t.id, on: t.on, hit: h, hitX: hitX[t.id] || 0, why });
}
const unexplained = keyRows.filter(r => !r.hit && /^(build|first:gorev|first:geceBasi|first:geceSonu|first:onarim|gun:|tara)/.test(r.on));
check(keyRows.find(r => r.on === 'first:kesinti').hit + keyRows.find(r => r.on === 'first:kesinti').hitX > 0, '(d) first:kesinti batarya kurmayan botta tetiklenir');
check(unexplained.length === 0, `(d) yapı/görev/gece/onarım/tarama anahtarlarının hepsi tetiklendi (eksik: ${unexplained.map(r => r.on).join(',') || '-'})`);


console.log('\n(e) Özet · Ay, 30 gün, bot her yapıyı kurar, her arızayı hızlı soruyla onarır, yanıtların 1/3\'ü yanlış');
console.log('seviye/tohum | gün | soru (inşa+onarım) | yanlış | yeniden soruldu | gevşeyen | soruysuz onarım | Bilgi (Ay ' + ayTeach.length + ')');
for (const R of runs) console.log(`${(R.level + '/' + R.seed).padEnd(12)} | ${String(Math.floor(R.s.t / 24) + 1).padStart(3)} | ${String(R.asked.length).padStart(3)} (${R.buildQs}+${R.repairQs}) | ${String(R.wrong.length).padStart(6)} | ${String(R.reasked).padStart(15)} | ${String(R.relaxed.length).padStart(8)} | ${String(R.repairsNoQ).padStart(15)} | ${R.learned.length}`);
const byLv = lv => runs.filter(R => R.level === lv);
for (const lv of ['kasif', 'muhendis']) { const rs = byLv(lv), avg = f => (rs.reduce((a, R) => a + f(R), 0) / rs.length).toFixed(1); console.log(`ortalama ${lv}: soru ${avg(R => R.asked.length)}, Bilgi ${avg(R => R.learned.length)}/${ayTeach.length}, ayrı soru ${avg(R => new Set(R.asked.map(a => a.qi)).size)}`); }
console.log(`\n(b) onarımda gevşeyen kural: ${relaxed.length} kez` + (relaxed.length ? ' → ' + [...new Set(relaxed.map(x => `${x.teach}@${x.act}`))].join(', ') : ''));
console.log(`(c) yanlış ${wrongAll}, yeniden soruldu ${reaskedAll}, sorulamadı ${notRe.length} (görev bitmeden o soruya sıra gelmedi: önce hiç sorulmamış ya da daha eski yanlış sorular geldi)`);
console.log('(d) hiç tetiklenmeyen Ay anahtarları: ' + (keyRows.filter(r => !r.hit).map(r => `${r.on} (${r.why})`).join('; ') || '-'));
if (AYR) for (const r of keyRows) console.log(`   ${r.id.padEnd(12)} ${r.on.padEnd(16)} ${r.hit}/${runs.length}`);


for (const w of notRe) {
  const R = runs.find(r => r.level + '/' + r.seed === w.run);

  const later = R.asked.filter(a => a.act === w.act && a.t > w.t && (!w.k || a.at === w.k));

  const prevOf = a => R.asked.filter(b => b.qi === a.qi && b.t < a.t).pop();

  const ownB = a => a.act === 'build' && a.at && (a.k === a.at || (a.teach && (teachFor('ay', a.teach) || {}).on === 'build:' + a.at));
  const fair = later.every(a => { const p = prevOf(a); return !p || !p.ok || ownB(a); });
  w.laterRel = later.length;
  check(fair, `(c) ${w.run} soru ${w.qi} (${w.act}${w.k ? ' ' + w.k : ''}) yeniden sorulmadı ama sonra doğru bilinmiş bir soru yeniden soruldu`);
}

console.log(`\nv5-ogretim: ${n - fail}/${n} kontrol`);
if (fail) { console.log([...new Set(errs)].map(e => ' HATA ' + e).join('\n')); process.exit(1); }
console.log('Tüm kontroller geçti');
