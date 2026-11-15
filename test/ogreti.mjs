

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const rd = f => fs.readFileSync(path.join(dir, '..', 'src', f), 'utf8');
const has = f => fs.existsSync(path.join(dir, '..', 'src', f));

let fail = 0, n = 0;
const errs = [], notes = [];
const check = (ok, msg) => { n++; if (!ok) { fail++; errs.push(msg); } };

const files = ['veri.js', 'gercek.js', 'cekirdek.js', 'ogret.js'].filter(has);
const names = ['TEACH', 'WORKQ', 'BLD', 'BUILD_ORDER', 'EVENTS', 'RANDOM_EVENTS', 'WORLDS', 'SCANS', 'OGRET'];
const G = vm.runInNewContext(files.map(rd).join('\n') + `\n;({${names.map(k => `${k}: typeof ${k} === 'undefined' ? undefined : ${k}`).join(',')}})`, { console });
check(Array.isArray(G.TEACH), 'TEACH tanımlı değil (src/veri.js)');
if (!Array.isArray(G.TEACH)) { console.log(errs.join('\n')); process.exit(1); }
const TE = G.TEACH, WQ = G.WORKQ || [];
const WORLDS = ['ay', 'mars'];


const words = t => String(t).split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
const bi = o => o && typeof o.tr === 'string' && typeof o.en === 'string' && o.tr.trim() && o.en.trim();
const JARGON = /\bPDA\b|ikmal|resupply|regolit|regolith|ISRU|ECLSS/i;
const YEAR = /\b(1[5-9]\d\d|20\d\d)\b/;
const WHO = /^\s*kim\b|kim (buldu|icat|keşf)|who (invented|discovered|found)|hangi yıl|ne zaman|which year|in what year/i;
const digits = t => /\d/.test(String(t).replace(/CO₂|O₂|H₂O?|3B|3D/g, ''));
function txt(o, where, max, opt) {
  if (o == null) { check(!!opt, `${where}: yok`); return; }
  check(bi(o), `${where}: iki dil dolu değil`);
  if (!bi(o)) return;
  for (const l of ['tr', 'en']) {
    check(words(o[l]) <= max, `${where}.${l}: ${words(o[l])} kelime (≤${max}): "${o[l]}"`);
    check(!JARGON.test(o[l]), `${where}.${l}: jargon: "${o[l]}"`);
    check(!YEAR.test(o[l]), `${where}.${l}: yıl: "${o[l]}"`);
    if (digits(o[l])) check(typeof o.src === 'string' && o.src.length > 3, `${where}.${l}: rakam var ama kaynak (LS src) yok`);
  }
}


const ON = /^(build:[a-z]+|ev:[a-z]+|first:[a-zA-Z]+|tara:[a-z]|gun:\d+)$/;
const FIRST_KEYS = ['gorev', 'kesinti', 'geceBasi', 'geceSonu', 'onarim', 'kargo', 'kalkan'];
const OWN = G.OGRET && Array.isArray(G.OGRET.icons) ? G.OGRET.icons : null;
const CIZ = has('cizim.js') ? rd('cizim.js') : '';
const GLYPHS = new Set([...CIZ.matchAll(/\bG\.(\w+)\s*=/g)].map(m => m[1]).concat(['o2', 'leaf', 'food', 'cube', 'gear', 'ship', 'pda', 'suit']));
const forW = (t, w) => !t.w || t.w === w;
const seenIW = new Set();
TE.forEach((t, i) => {
  const w = `TEACH[${i}:${t.id}${t.w ? '/' + t.w : ''}]`;
  check(typeof t.id === 'string' && /^t_\w+$/.test(t.id), `${w}: id`);
  check(t.w == null || WORLDS.includes(t.w), `${w}: w ${t.w}`);
  for (const wd of WORLDS) if (forW(t, wd)) { const k = t.id + '@' + wd; check(!seenIW.has(k), `${w}: aynı id ${wd} için iki kez`); seenIW.add(k); }
  check(typeof t.on === 'string' && ON.test(t.on), `${w}: on biçimi "${t.on}"`);
  const [kind, arg] = String(t.on).split(':');
  if (kind === 'build') check(!!G.BLD[arg], `${w}: build:${arg} yapı değil`);
  if (kind === 'ev') check(!!(G.EVENTS && G.EVENTS[arg]), `${w}: ev:${arg} olay değil`);
  if (kind === 'tara') check(!!(G.SCANS && G.SCANS[arg]), `${w}: tara:${arg} karo değil`);
  if (kind === 'first') check(FIRST_KEYS.includes(arg), `${w}: first:${arg} bilinen an değil`);
  if (kind === 'gun') check(+arg >= 2, `${w}: gun:${arg} (n ≥ 2)`);
  txt(t.t, w + '.t', 4); txt(t.say, w + '.say', 12); txt(t.more, w + '.more', 25, true);
  check(Array.isArray(t.flow) && t.flow.length >= 2 && t.flow.length <= 7, `${w}: flow 2–7 simge`);
  for (const f of t.flow || []) {
    const okName = (f.startsWith('b:') && !!G.BLD[f.slice(2)]) || GLYPHS.has(f) || (OWN ? OWN.includes(f) : ['ok', 'buz', 'tas', 'dunya', 'ay', 'mars', 'toz', 'kar', 'bulut', 'magara', 'kas'].includes(f));
    check(okName, `${w}: bilinmeyen simge "${f}"`);
  }
});
const find = (id, wd) => TE.find(t => t.id === id && forW(t, wd));
const keyOf = (on, wd) => TE.find(t => t.on === on && forW(t, wd));


const B14 = G.BUILD_ORDER || [];
check(B14.length === 14, `BUILD_ORDER ${B14.length} yapı`);
for (const wd of WORLDS) for (const k of B14) check(!!keyOf('build:' + k, wd), `${wd}: build:${k} Bilgisi yok`);


const REQ_AY = ['first:gorev', 'ev:gece', 'first:geceBasi', 'first:geceSonu', 'ev:ariza', 'first:onarim', 'ev:meteor', 'ev:flare', 'first:kesinti', 'first:kargo', 'tara:i', 'tara:m', 'tara:t', 'tara:c', 'tara:r'];
for (const k of REQ_AY) check(!!keyOf(k, 'ay'), `ay: zorunlu anahtar ${k} Bilgisi yok`);

const evFor = wd => Object.keys(G.EVENTS || {}).filter(id => {
  const ev = G.EVENTS[id];
  if (id === 'egitim') return false;
  if (ev.worlds && !ev.worlds.includes(wd)) return false;
  if (id === 'firtina' && !G.WORLDS[wd].storm) return false;
  if (id === 'gece' && !G.WORLDS[wd].night) return false;
  return true;
});
for (const wd of WORLDS) for (const id of evFor(wd)) check(!!keyOf('ev:' + id, wd), `${wd}: olay ${id} için Bilgi yok`);
for (const k of ['first:gorev', 'first:onarim', 'first:kesinti', 'first:kargo', 'tara:i', 'tara:m', 'tara:t', 'tara:c', 'tara:r']) check(!!keyOf(k, 'mars'), `mars: ${k} Bilgisi yok`);


const isQ = q => q.act === 'repair' || q.act === 'build';
WQ.forEach((q, i) => {
  const w = `WORKQ[${i}:${q.id}]`;
  if (isQ(q)) check(typeof q.teach === 'string', `${w}: onarım/inşa sorusunda teach yok`);
  if (q.teach != null) for (const wd of WORLDS) if (!q.w || q.w === wd) check(!!find(q.teach, wd), `${w}: teach "${q.teach}" ${wd} için TEACH'te yok`);
  for (const l of ['tr', 'en']) check(!WHO.test(q.q[l]) && !YEAR.test([q.q, q.e, ...q.a].map(o => o[l]).join(' ')), `${w}.${l}: kim/yıl sorusu`);
  if (q.k && G.BLD[q.k] && q.teach) { const t = find(q.teach, q.w || 'ay'); if (t && t.on.startsWith('build:') && t.on !== 'build:' + q.k) notes.push(`${q.id}: ${q.k} sorusu başka yapının Bilgisi'ne bağlı (${t.on})`); }
});
const ayK = WQ.filter(q => q.lv === 1 && (!q.w || q.w === 'ay'));
const table = [];
for (const k of B14) {
  const nb = ayK.filter(q => q.act === 'build' && q.k === k).length, nr = ayK.filter(q => q.act === 'repair' && q.k === k).length;
  const t = keyOf('build:' + k, 'ay');
  const nt = t ? WQ.filter(q => q.teach === t.id && (!q.w || q.w === 'ay')).length : 0;
  check(nb >= 2, `ay/Kâşif: ${k} için ${nb} inşa sorusu (≥2)`);
  check(nr >= 1, `ay/Kâşif: ${k} için ${nr} onarım sorusu (≥1)`);
  table.push({ k, bilgi: t ? 1 : 0, insa: nb, onarim: nr, bilgiyeBagli: nt });
}
const gen = ayK.filter(q => q.act === 'repair' && !q.k);
check(gen.length >= 8, `ay/Kâşif: genel onarım sorusu ${gen.length} (≥8)`);


const ayT = TE.filter(t => forW(t, 'ay'));
const noQ = ayT.filter(t => !WQ.some(q => q.teach === t.id && (!q.w || q.w === 'ay')));
const pct = Math.round(100 * (ayT.length - noQ.length) / ayT.length);
check(pct >= 80, `ay: Bilgi'lerin %${pct}'i sorulu (≥%80)`);


const NEW7 = { t_kutup: 'gun:2', t_cekim: 'gun:3', t_sicak: 'gun:4', t_gok: 'gun:5', t_ihtiyac: 'gun:6', t_gecikme: 'gun:7', t_isin: 'first:kalkan' };
for (const [id, on] of Object.entries(NEW7)) {
  const t = find(id, 'ay');
  check(t && t.on === on, `ay: ${id} Bilgisi ${on} anahtarında`);
  check(WQ.some(q => q.teach === id && (q.act === 'build' || q.act === 'repair') && (!q.w || q.w === 'ay')), `ay: ${id} için en az bir onarım/inşa sorusu`);
}
check(find('t_ihtiyac', 'mars') && !TE.find(t => t.id === 't_ihtiyac').w, 'mars: t_ihtiyac her iki dünyada (w yok)');
const uniq = wd => new Set(TE.filter(t => forW(t, wd)).map(t => t.id)).size;
check(uniq('ay') === 44, `ay: Defterim toplamı ${uniq('ay')} (44 olmalı)`);
check(uniq('mars') === 36, `mars: Defterim toplamı ${uniq('mars')} (36 olmalı)`);


const longest = l => WQ.filter(q => q.a.slice(1).every(a => a[l].length < q.a[0][l].length)).length;
const lr = { tr: Math.round(100 * longest('tr') / WQ.length), en: Math.round(100 * longest('en') / WQ.length) };
check(lr.tr <= 40 && lr.en <= 40, `biçim ipucu: doğru şık en uzun TR %${lr.tr}, EN %${lr.en} (≤%40)`);
notes.push(`biçim ipucu (doğru şık tek başına en uzun): TR %${lr.tr}, EN %${lr.en} (${WQ.length} soru)`);

const wq = id => WQ.find(q => q.id === id);
check(!/İkisi de yakıttır|Both are rocket fuel/.test(wq('c_ay_yakit').e.tr + wq('c_ay_yakit').e.en), 'D-1: oksijen yakıt değildir');
check(!/fırtına|storm/i.test(find('t_anten', 'ay').say.tr + find('t_anten', 'ay').say.en), 'D-3: Ay anteni fırtına uyarısı almaz');
check(/eritir/.test(find('t_oksijen', 'ay').say.tr) && /melts/.test(find('t_oksijen', 'ay').say.en), 'D-17: Ay hava makinesi taşları eritir (Seçenek A)');
check(!/kaynat/.test(find('t_maden', 'ay').more.tr), 'D-15: toprak kaynatılmaz');
check(/30 santimetre/.test(find('t_tara_i', 'mars').more.tr) && /krater/.test(find('t_tara_i', 'ay').more.tr), 'D-16: Mars buz Bilgisi ayrı');
check(find('t_gece', 'ay').more.src === 'NASA NSSDCA Moon Fact Sheet', 'B-30: t_gece kaynaklı');
for (const id of ['r_pil', 'r_reak']) check(/onarılmazsa/.test(wq(id).q.tr), `D-31/32: ${id} onarımla ilgili`);
check(wq('r_egt_panel') && wq('r_egt_panel').teach === 't_gunes' && wq('r_egt_panel').act === 'repair', 'P1-2: r_egt_panel güneş paneli Bilgisine bağlı onarım sorusu');


if (G.OGRET) {
  for (const f of ['tick', 'open', 'notebook', 'count', 'fresh', 'seen']) check(typeof G.OGRET[f] === 'function', `OGRET.${f} işlev değil`);
}


const cnt = (wd, lv) => ({ bilgi: TE.filter(t => forW(t, wd)).length,
  soru: WQ.filter(q => isQ(q) && (!q.w || q.w === wd) && (lv === 2 || q.lv === 1)).length });
console.log(`ogreti: ${n} kontrol, ${fail} hata`);
console.log(`Bilgi/soru (onarım+inşa): Ay/Kâşif ${JSON.stringify(cnt('ay', 1))} · Ay/Mühendis ${JSON.stringify(cnt('ay', 2))} · Mars/Kâşif ${JSON.stringify(cnt('mars', 1))} · Mars/Mühendis ${JSON.stringify(cnt('mars', 2))}`);
console.log(`Ay: genel onarım sorusu ${gen.length} · sorulu Bilgi %${pct} · sorusuz: ${noQ.map(t => t.id).join(', ') || '-'}`);
console.log('kapsam tablosu (Ay, Kâşif):');
console.log('  yapı      | Bilgi | inşa sorusu | onarım sorusu | Bilgiye bağlı soru');
for (const r of table) console.log(`  ${r.k.padEnd(9)} | ${String(r.bilgi).padEnd(5)} | ${String(r.insa).padEnd(11)} | ${String(r.onarim).padEnd(13)} | ${r.bilgiyeBagli}`);
console.log('olay Bilgileri (Ay):', REQ_AY.concat(evFor('ay').map(e => 'ev:' + e)).filter((v, i, a) => a.indexOf(v) === i).map(k => k + (keyOf(k, 'ay') ? '✓' : '✗')).join(' '));
console.log('olay Bilgileri (Mars):', evFor('mars').map(e => 'ev:' + e + (keyOf('ev:' + e, 'mars') ? '✓' : '✗')).join(' '));
if (notes.length) console.log('notlar:\n  ' + notes.join('\n  '));
if (fail) { console.log(errs.join('\n')); process.exit(1); }
console.log('Tüm kontroller geçti');
