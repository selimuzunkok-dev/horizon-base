
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const rd = f => fs.readFileSync(path.join(dir, '..', 'src', f), 'utf8');
const files = ['veri.js', 'gercek.js', 'cekirdek.js', 'hikaye.js'].filter(f => fs.existsSync(path.join(dir, '..', 'src', f)));
const names = ['REAL', 'COSMETICS', 'DEFAULT_LOOK', 'LS', 'L', 'SOURCES', 'SIMPLIFY', 'MISSIONS', 'EVENTS', 'BLD', 'STORY', 'newGame', 'bankEntries', 'NEED', 'WORKQ', 'ACHIEVEMENTS', 'QUIZ', 'SCANS', 'TECHS'];
const G = vm.runInNewContext(files.map(rd).join('\n') + `\n;({${names.map(n => `${n}: typeof ${n} === 'undefined' ? undefined : ${n}`).join(',')}})`, { console });

let fail = 0, n = 0;
const errs = [];
const check = (ok, msg) => { n++; if (!ok) { fail++; errs.push(msg); } };

check(G.REAL, 'REAL tanımlı değil (src/gercek.js)');
check(G.COSMETICS, 'COSMETICS tanımlı değil');
check(G.DEFAULT_LOOK, 'DEFAULT_LOOK tanımlı değil');
check(typeof G.LS === 'function', 'LS tanımlı değil');
if (!G.REAL || !G.COSMETICS) { console.log(errs.join('\n')); process.exit(1); }
const R = G.REAL;


const sentences = t => t.replace(/\b(\d)[.,](\d)/g, '$1$2').split(/[.!?:;]+\s*/).map(x => x.trim()).filter(Boolean);
const words = t => t.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
const hasDigit = t => /\d/.test(t);
const bi = o => o && typeof o.tr === 'string' && typeof o.en === 'string' && o.tr.trim() && o.en.trim();


function chkLS(o, where, maxW) {
  check(bi(o), `${where}: iki dilli değil`);
  if (!bi(o)) return;
  check(typeof o.src === 'string' && o.src.trim().length > 3, `${where}: kaynak (src) yok`);
  for (const lang of ['tr', 'en'])
    for (const s of sentences(o[lang])) check(words(s) <= maxW, `${where}.${lang}: cümle ${words(s)} kelime (sınır ${maxW}): "${s}"`);
  check(/\[to verify\]|\[doğrula/i.test(o.tr + o.en) === false, `${where}: "[to verify]" kalmış`);
  if (/Chang/.test(o.tr + o.en + o.src)) check(/NASA değil|not NASA/i.test(o.src) || !/NASA/.test(o.src), `${where}: Chang'e-4 NASA diye etiketlenmiş`);
}

function chkL(o, where, maxW, allowDigit) {
  check(bi(o), `${where}: iki dilli değil`);
  if (!bi(o)) return;
  if (!allowDigit) check(!hasDigit(o.tr + o.en), `${where}: kaynaksız metinde rakam var`);
  for (const lang of ['tr', 'en'])
    for (const s of sentences(o[lang])) check(words(s) <= maxW, `${where}.${lang}: cümle ${words(s)} kelime (sınır ${maxW}): "${s}"`);
}
const perWorld = (v, where, maxW) => {
  if (v && v.tr != null) chkLS(v, where, maxW);
  else { check(v && v.ay && v.mars, `${where}: ay/mars eksik`); if (v && v.ay) chkLS(v.ay, where + '.ay', maxW); if (v && v.mars) chkLS(v.mars, where + '.mars', maxW); }
};


const MS_IDS = G.MISSIONS ? G.MISSIONS.map(m => m.id) : [];
check(MS_IDS.length > 0, 'MISSIONS okunamadı');
for (const id of MS_IDS) check(R.ms[id], `REAL.ms.${id} yok`);
for (const id in R.ms) { check(MS_IDS.includes(id), `REAL.ms.${id}: böyle bir hedef yok`); perWorld(R.ms[id], 'ms.' + id, 12); }


const EV_IDS = G.EVENTS ? Object.keys(G.EVENTS) : [];

const decision = EV_IDS.filter(id => Array.isArray(G.EVENTS[id].ch) && !G.EVENTS[id].train);
for (const id of decision) check(R.ev[id], `REAL.ev.${id} yok (karar olayı)`);
for (const id in R.ev) {
  check(EV_IDS.includes(id), `REAL.ev.${id}: böyle bir olay yok`);
  const ws = G.EVENTS[id] && G.EVENTS[id].worlds;
  const v = R.ev[id];
  if (v && v.tr != null) chkLS(v, 'ev.' + id, 12);
  else perWorld(v, 'ev.' + id, 12);
  if (ws && ws.length === 1 && v && v.tr == null) check(v[ws[0]], `REAL.ev.${id}: ${ws[0]} satırı yok`);
}


const s0 = G.newGame('ay', 'kasif', 1, '');
const STAT_KEYS = Object.keys(s0.stat);
const BANK_IDS = new Set(G.bankEntries(s0).filter(e => e.cat !== 'gercek').map(e => e.id));
const RELICS = Math.min(G.STORY.ay.relics.length, G.STORY.mars.relics.length);
const TAG_OK = t => /^(b:(hub|kalkan|[a-z]+)|s:[imtcrs]|r:\d|e:[a-z]+|d:\d+|x:[a-z]+)$/.test(t) && (!t.startsWith('b:') || G.BLD[t.slice(2)] || t === 'b:kalkan')
  && (!t.startsWith('e:') || G.EVENTS[t.slice(2)]) && (!t.startsWith('r:') || +t.slice(2) < RELICS);
const RULE_T = ['mission', 'missions', 'bank', 'sci', 'relics', 'ships', 'tag', 'cause', 'stat', 'built', 'choice', 'event', 'ach', 'stage', 'work', 'train'];
const ACH_IDS = new Set((G.ACHIEVEMENTS || []).map(a => a.id));
function chkRule(r, where) {
  check(r && RULE_T.includes(r.t), `${where}: bilinmeyen kural türü ${r && r.t}`);
  if (!r) return;
  switch (r.t) {
    case 'mission': check(MS_IDS.includes(r.id), `${where}: hedef yok ${r.id}`); break;
    case 'missions': check(Array.isArray(r.all) && r.all.length && r.all.every(id => MS_IDS.includes(id)), `${where}: hedef listesi`); break;
    case 'bank': check(Array.isArray(r.any) && r.any.every(id => BANK_IDS.has(id)) && r.n >= 1 && r.n <= r.any.length, `${where}: banka kuralı ${JSON.stringify(r)}`); break;
    case 'sci': check(Number.isFinite(r.n) && r.n > 0 && r.n <= 400, `${where}: bilim eşiği`); break;
    case 'relics': check(Number.isInteger(r.n) && r.n >= 1 && r.n <= RELICS, `${where}: kalıntı sayısı`); break;
    case 'ships': check(Number.isInteger(r.n) && r.n >= 1 && 'ships' in s0.stat, `${where}: gemi sayısı`); break;
    case 'tag': check(TAG_OK(r.id), `${where}: etiket ${r.id}`); break;
    case 'cause': check(['o2', 'su', 'gida'].includes(r.r), `${where}: neden ${r.r}`); break;
    case 'stat': check(STAT_KEYS.includes(r.key) && Number.isFinite(r.min), `${where}: istatistik ${r.key}`); break;
    case 'built': check(!!G.BLD[r.k], `${where}: yapı ${r.k}`); break;
    case 'choice': check(G.EVENTS[r.id] && Array.isArray(G.EVENTS[r.id].ch) && r.c >= 0 && r.c < G.EVENTS[r.id].ch.length, `${where}: seçim`); break;
    case 'event': check(!!G.EVENTS[r.id], `${where}: olay ${r.id}`); break;
    case 'ach': check(ACH_IDS.has(r.id), `${where}: başarım yok ${r.id}`); break;
    case 'stage': check(Number.isInteger(r.n) && r.n >= 2 && r.n <= 3, `${where}: aşama ${r.n}`); break;
    case 'work': check(Number.isInteger(r.n) && r.n >= 1 && r.n <= 20, `${where}: iş kartı sayısı ${r.n}`); break;
    case 'train': break;
  }
}


check(Array.isArray(R.learn) && R.learn.length >= 4, 'REAL.learn kısa');
const lids = new Set();
for (const it of R.learn) {
  check(it.id && !lids.has(it.id), `learn: yinelenen ya da boş id ${it.id}`); lids.add(it.id);
  chkRule(it.rule, 'learn.' + it.id);
  chkL(it.t, 'learn.' + it.id + '.t', 14);
  perWorld(it.real, 'learn.' + it.id + '.real', 14);
}
check(R.learn.slice(0, 3).every(it => it.rule.t === 'cause'), 'learn: başarısızlık dersleri önde değil');

for (const it of R.learn) if (it.real && typeof it.real.tr === 'string') check(!/MOXIE|InSight|Opportunity|Perseverance|Curiosity|Ingenuity/.test(it.real.tr), 'learn.' + it.id + ': Mars aracı anlatan bilgi dünyaya göre ayrılmalı');
check(R.learn.some(it => it.rule.t === 'cause' && it.rule.r === 'o2'), 'learn: oksijen dersi yok');


const bids = new Set();
for (const p of R.bank) {
  check(/^g:[a-z]+$/.test(p.id) && !bids.has(p.id) && !BANK_IDS.has(p.id), `bank: id ${p.id}`); bids.add(p.id);
  check(/^x:[a-z]+$/.test(p.tag), `bank.${p.id}: etiket ${p.tag}`);
  chkL(p.title, `bank.${p.id}.title`, 6);
  chkL(p.text, `bank.${p.id}.text`, 14);
  chkLS(p.fact, `bank.${p.id}.fact`, 14);
}
for (const id of ['g:gezgin', 'g:dron', 'g:arma', 'g:giysi']) check(bids.has(id), `bank: ${id} yok`);


for (const k of ['suit', 'visor', 'patch', 'rover', 'craft', 'bld']) { check(R.intro[k], `intro.${k} yok`); if (R.intro[k]) chkLS(R.intro[k], 'intro.' + k, 14); }
for (const k of ['oksijenMars', 'hubRtg']) { check(R.scale[k], `scale.${k} yok`); if (R.scale[k]) chkLS(R.scale[k], 'scale.' + k, 14); }
for (const k in R.scale) chkLS(R.scale[k], 'scale.' + k, 14);

check(Math.round(G.NEED.o2 * 1000 / (12 * 24)) === 3, 'scale.oksijenMars: 840 g / (12 g × 24) ≈ 3 değil');
check(Math.round(2000 / 110) === 18, 'scale.hubRtg: 2000 / 110 ≈ 18 değil');
check(/1 kilogram/.test(R.scale.oksijenMars.tr) && /3-4/.test(R.scale.oksijenMars.tr), 'scale.oksijenMars metni hesapla uyuşmuyor');
check(/110/.test(R.scale.hubRtg.tr) && /18/.test(R.scale.hubRtg.tr), 'scale.hubRtg metni hesapla uyuşmuyor');


const OK_NUM = new Set(['4', '80', '43', '12', '382', '1,37', '1.37', '0,67', '0.67', '98', '26', '0,84', '0.84', '3,8', '3.8', '1,8', '1.8', '600', '122',
  '1.319', '1,319', '840', '3', '110', '2', '18',


  '90', '6', '10', '72', '1', '33', '30', '378']);
const nums = t => (t.replace(/Chang'e-4/g, '').match(/\d+(?:[.,]\d+)*/g) || []);
(function walk(o, p) {
  if (!o || typeof o !== 'object') return;
  if (typeof o.tr === 'string') {
    for (const lang of ['tr', 'en']) for (const x of nums(o[lang])) check(OK_NUM.has(x), `${p}.${lang}: doğrulanmamış sayı ${x}`);
    return;
  }
  for (const k in o) if (k !== 'rule') walk(o[k], p + '.' + k);
})(R, 'REAL');


const hexOk = h => /^#[0-9a-f]{6}$/i.test(h);
function lab(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const X = (c[0] * 0.4124 + c[1] * 0.3576 + c[2] * 0.1805) / 0.95047, Y = c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722, Z = (c[0] * 0.0193 + c[1] * 0.1192 + c[2] * 0.9505) / 1.08883;
  const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
const dE = (a, b) => { const p = lab(a), q = lab(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
const CATS = ['suit', 'visor', 'rover', 'craft', 'bld', 'sym', 'shape', 'bg'];
const cids = new Set();
for (const c of G.COSMETICS) {
  const w = 'COSMETICS.' + c.id;
  check(c.id && !cids.has(c.id), `${w}: yinelenen id`); cids.add(c.id);
  check(CATS.includes(c.cat), `${w}: kategori ${c.cat}`);
  chkL(c.name, w + '.name', 4);
  if (['suit', 'visor', 'rover', 'craft', 'bld', 'bg'].includes(c.cat)) check(hexOk(c.hex), `${w}: hex`);
  if (['rover', 'craft'].includes(c.cat)) check(hexOk(c.hex2), `${w}: hex2`);
  if (c.cat === 'sym') check(['ay', 'mars', 'roket', 'yildiz', 'buz', 'tas', 'bitki', 'anten', 'gezgin'].includes(c.sym), `${w}: simge PATCH_SYMS dışında`);
  if (c.cat === 'shape') check(['daire', 'kalkan', 'altigen'].includes(c.id), `${w}: biçim PATCH_SHAPES dışında`);
  if (!c.def) { check(c.rule && c.how, `${w}: kilitli ama rule/how yok`); chkRule(c.rule, w); chkL(c.how, w + '.how', 8, c.rule && ['sci', 'mission', 'ach'].includes(c.rule.t)); }
  else check(!c.rule, `${w}: baştan açık ama kural var`);
  if (c.cat === 'rover') {
    for (const g of ['#8a8a86', '#b4553a']) check(dE(c.hex, g) >= 30, `${w}: gövde zemine çok yakın (ΔE ${dE(c.hex, g).toFixed(1)} / ${g})`);
    check(dE(c.hex2, c.hex) >= 30, `${w}: şerit gövdeye çok yakın (ΔE ${dE(c.hex2, c.hex).toFixed(1)})`);
  }
  if (c.cat === 'bld') check(dE(c.hex, '#e6e5e0') >= 30, `${w}: şerit beyaz gövdeye çok yakın`);
  if (c.cat === 'craft') for (const h of [c.hex, c.hex2]) check(dE(h, '#e6e5e0') >= 30, `${w}: bant beyaz gövdeye çok yakın (${h})`);
  if (c.cat === 'suit') check(dE(c.hex, '#e6e5e0') >= 30, `${w}: şerit beyaz giysiye çok yakın`);
}
for (const cat of ['suit', 'visor', 'rover', 'craft', 'bld', 'sym', 'shape', 'bg']) check(G.COSMETICS.some(c => c.cat === cat && c.def), `${cat}: baştan açık seçenek yok`);
const D = G.DEFAULT_LOOK, byId = id => G.COSMETICS.find(c => c.id === id);
for (const [k, cat] of [['suit', 'suit'], ['visor', 'visor'], ['rover', 'rover'], ['craft', 'craft'], ['bld', 'bld']]) check(byId(D[k]) && byId(D[k]).cat === cat && byId(D[k]).def, `DEFAULT_LOOK.${k}`);
check(D.patch && byId(D.patch.shape) && byId(D.patch.shape).cat === 'shape' && byId(D.patch.bg) && byId(D.patch.bg).cat === 'bg' && D.patch.sym === null, 'DEFAULT_LOOK.patch');

check(G.COSMETICS.filter(c => !c.def).length === 16, 'kilitli öğe sayısı 16 değil');
check(G.COSMETICS.every(c => !c.rule || JSON.stringify(c.rule).indexOf('rnd') < 0), 'kural zar kullanıyor');


const V = rd('veri.js');
const SRC_TXT = G.SOURCES.map(r => r[0].tr + ' ' + r[0].en + ' ' + r[1]).join('\n');
check(/REV2 \(2022\)/.test(SRC_TXT), 'SOURCES: BVAD Rev2 atfı yok');
check(/3,8 L[^\n]*\n?[^\n]*ECLSS/.test(SRC_TXT) && !/3,8 L[^\n]*BVAD/.test(SRC_TXT), 'SOURCES: su rakamı ISS ECLSS\'e bağlı değil');
check(/ambalaj dahil/.test(SRC_TXT), 'SOURCES: "ambalaj dahil" yok');
check(/3,73/.test(SRC_TXT) && !/3,71|3\.71/.test(V), 'Mars yerçekimi 3,73 değil');
check(/586/.test(SRC_TXT) && !/590/.test(V), 'Mars ışınımı 586 değil');
check(/−246/.test(SRC_TXT) && !/−230/.test(V), 'gölgeli krater −246 / −230 kalmış');
check(/−173/.test(SRC_TXT) && !/−170/.test(V), 'Ay gecesi −173 değil');
check(G.SOURCES.some(r => /LROC/.test(r[1]) && !/Horvath/.test(r[1])) && G.SOURCES.some(r => /Horvath/.test(r[1]) && !/LROC/.test(r[1])), 'Ay çukurları atfı ikiye ayrılmamış');
check(/hesaplanmış/.test(SRC_TXT), '330 mSv hesaplanmış değer diye yazılmamış');
check(/%43/.test(G.SIMPLIFY.tr) && /MOXIE/.test(G.SIMPLIFY.tr) && /gezgin/i.test(G.SIMPLIFY.tr), 'SIMPLIFY ekleri eksik');
check(!/\[to verify\]/i.test(V + rd('gercek.js')), '"[to verify]" kalmış');

let lsN = 0;
(function walk(o, p, seen) {
  if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
  if (typeof o.tr === 'string') { if ('src' in o) { lsN++; check(typeof o.src === 'string' && o.src.length > 3, `${p}: boş kaynak`); } return; }
  for (const k in o) walk(o[k], p + '.' + k, seen);
})(G.BLD, 'BLD', new Set());
check(lsN >= 7, 'BLD içinde kaynaklı bilgi az');


const ALL = ['veri.js', 'gercek.js', 'hikaye.js', 'cekirdek.js'].filter(f => fs.existsSync(path.join(dir, '..', 'src', f))).map(rd).join('\n');
check(!/Artemis\s*(I{1,3}V?|IV|[0-9])\b/.test(ALL), 'kartlar: Artemis görev numarası yazılmış');
check(!/Gateway/.test(ALL), 'kartlar: Gateway var olan bir istasyon gibi anlatılmamalı');

const MINE = ['veri.js', 'gercek.js'].map(rd).join('\n');
check(!/4 ila 20|4 to 20|3 dakika\b|about 3 minutes/.test(MINE), 'kartlar: Mars sinyal gecikmesi "yaklaşık 3 ila 22 dakika" olmalı (eski 4–20 / 3 dk kalmış)');
check((ALL.match(/3 ila 22 dakika/g) || []).length >= 3 && (ALL.match(/3 to 22 minutes/g) || []).length >= 3, 'kartlar: Mars gecikmesi üç yerde aynı aralık');

check(!/%90\\'ından|90% of the year|over 90%|%80\\'inden|80% of the year/.test(ALL), 'kartlar: kutup güneşi yıllık yüzdeyle anlatılmamalı');
check(!/%5,6|5\.6 ?%/.test(ALL), 'kartlar: LCROSS için "yaklaşık %6" yazılmalı');
check(!/%40-45|40-45%/.test(ALL), 'kartlar: regolitin %40-45 oksijen olduğu doğrulanamadı');
check(!/CHAPEA[^\n]{0,80}(gösterdi|showed|found|buldu)/.test(ALL), 'kartlar: CHAPEA için bulgu iddiası kurulmamalı');
check(/VIPER/.test(rd('gercek.js')) && !/VIPER[^\n]{0,60}(gitti|went|landed|indi)/.test(ALL), 'kartlar: VIPER "gidecek/planlanıyor" diye yazılmalı');


const QW = t => t.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
const NO_DATE = /\b(1[5-9]\d\d|20\d\d)\b|hangi yıl|ne zaman|kim buldu|kim icat|kim keşf|who (invented|discovered|found)|in what year|which year/i;
check(Array.isArray(G.WORKQ), 'WORKQ tanımlı değil');
const WQ = G.WORKQ || [], ACTS = ['repair', 'scan', 'build', 'cargo'];
const wqIds = new Set();
WQ.forEach((it, i) => {
  const w = `WORKQ[${i}:${it.id}]`;
  check(typeof it.id === 'string' && it.id && !wqIds.has(it.id), `${w}: id boş ya da yinelenmiş`); wqIds.add(it.id);
  check(ACTS.concat('any').includes(it.act), `${w}: eylem ${it.act}`);
  check(it.w == null || ['ay', 'mars'].includes(it.w), `${w}: dünya ${it.w}`);
  check(it.lv === 1 || it.lv === 2, `${w}: seviye ${it.lv}`);
  if (it.k != null) check(!!G.BLD[it.k] || /^[imtcrs]$/.test(it.k), `${w}: k ${it.k} yapı ya da karo değil`);
  if (it.k != null && /^[imtcrs]$/.test(it.k)) check(it.act === 'scan' || it.act === 'any', `${w}: karo türü yalnız taramada`);
  if (it.k != null && G.BLD[it.k]) check(it.act !== 'scan', `${w}: yapı türü taramada olmaz`);
  check(bi(it.q), `${w}: soru iki dilli değil`);
  check(Array.isArray(it.a) && it.a.length >= 2 && it.a.length <= 3 && it.a.every(bi), `${w}: 2–3 iki dilli şık`);
  check(bi(it.e), `${w}: açıklama iki dilli değil`);
  if (!bi(it.q) || !bi(it.e) || !Array.isArray(it.a) || !it.a.every(bi)) return;
  for (const lang of ['tr', 'en']) {
    check(QW(it.q[lang]) <= 12, `${w}.q.${lang}: ${QW(it.q[lang])} kelime (≤12)`);
    check(QW(it.e[lang]) <= 12, `${w}.e.${lang}: ${QW(it.e[lang])} kelime (≤12)`);
    it.a.forEach((a, j) => check(QW(a[lang]) <= 4, `${w}.a${j}.${lang}: ${QW(a[lang])} kelime (≤4): "${a[lang]}"`));
    const set = new Set(it.a.map(a => a[lang].trim().toLowerCase()));
    check(set.size === it.a.length, `${w}.${lang}: şıklar birbirinden farklı değil`);
    const all = [it.q, it.e, ...it.a].map(o => o[lang]).join(' ');
    check(!NO_DATE.test(all), `${w}.${lang}: tarih/yıl/"kim" sorusu`);
  }

  const txt = [it.q, it.e, ...it.a].map(o => o.tr + ' ' + o.en).join(' ').replace(/CO₂|O₂|H₂O?|3B|3D/g, '');
  if (/\d/.test(txt)) {
    check(typeof it.e.src === 'string' && it.e.src.length > 3, `${w}: rakamlı ama e.src yok`);
    for (const x of nums(txt)) check(OK_NUM.has(x) || ['173', '240', '15'].includes(x), `${w}: doğrulanmamış sayı ${x}`);
  }
  if (it.e && 'src' in it.e) check(typeof it.e.src === 'string' && it.e.src.length > 3, `${w}: boş kaynak`);
});
const lv1 = WQ.filter(q => q.lv === 1);
check(lv1.length >= 24, `WORKQ: Kâşif sorusu ${lv1.length} (≥24)`);
const wqTable = {};
for (const act of ACTS) {
  const a = lv1.filter(q => q.act === act || q.act === 'any');
  check(a.length >= 6, `WORKQ: ${act} için ${a.length} soru (≥6)`);
  for (const wd of ['ay', 'mars']) {
    const n = a.filter(q => !q.w || q.w === wd).length;
    wqTable[act + '/' + wd] = n;
    check(n >= 4, `WORKQ: ${act}/${wd} için ${n} soru (≥4)`);
  }
}

check(!WQ.some(q => /kaç uydu|how many moons|en büyük gezegen|largest planet/i.test(q.q.tr + q.q.en)), 'WORKQ: genel bilgi yarışması sorusu');


check(Array.isArray(G.ACHIEVEMENTS), 'ACHIEVEMENTS tanımlı değil');
const AC = G.ACHIEVEMENTS || [];
const ICONS = ['bolt', 'o2', 'drop', 'leaf', 'cube', 'gear', 'flask', 'crew', 'smile', 'rad', 'loop', 'flare', 'night', 'wrench', 'meteor', 'heart', 'wave', 'chat', 'storm', 'ship', 'star', 'check', 'menu', 'pause', 'clock', 'info', 'radio', 'atlas', 'tape', 'scan', 'hand', 'eye', 'drone', 'walk', 'pda', 'build', 'quiz', 'jump', 'x', 'parts', 'bricks', 'helmet', 'rocket', 'tablet', 'radioLog', 'undo', 'blueprint', 'home', 'apple'];
const FEATS = ['surus', 'dron', 'hiz4'], INFOS = ['bld', 'ara'];
const aIds = new Set();
let nFeat = 0, nInfo = 0, nLater = 0;
const featSeen = new Set();
const COS = id => G.COSMETICS.find(c => c.id === id);
const LATE = r => r && ((r.t === 'relics' && r.n >= 3) || (r.t === 'mission' && ['kalici', 'self'].includes(r.id)) || (r.t === 'sci' && r.n >= 100) || (r.t === 'tag' && /^d:(\d+)$/.test(r.id) && +r.id.slice(2) >= 20));
for (const a of AC) {
  const w = 'ACH.' + a.id;
  check(typeof a.id === 'string' && /^[a-z0-9_]+$/.test(a.id) && !aIds.has(a.id), `${w}: id`); aIds.add(a.id);
  check(ICONS.includes(a.icon), `${w}: simge ${a.icon} IC içinde yok`);
  check(a.w == null || ['ay', 'mars'].includes(a.w), `${w}: w`);
  check(a.lv == null || ['kasif', 'muhendis'].includes(a.lv), `${w}: lv`);
  chkRule(a.rule, w + '.rule');
  check(!(a.rule && a.rule.t === 'ach' && a.rule.id === a.id), `${w}: kendine bağlı`);
  for (const [k, mx] of [['name', 3], ['how', 8], ['say', 10]]) {
    check(bi(a[k]), `${w}.${k}: iki dilli değil`);
    if (bi(a[k]) && /\d/.test(a[k].tr + a[k].en)) check(a.rule && ['sci', 'tag', 'work', 'ships', 'relics'].includes(a.rule.t), `${w}.${k}: rakam yalnız kuralın eşiği olabilir`);
    if (bi(a[k])) for (const lang of ['tr', 'en']) check(QW(a[k][lang]) <= mx, `${w}.${k}.${lang}: ${QW(a[k][lang])} kelime (≤${mx})`);
  }
  check(Array.isArray(a.gives), `${w}: gives dizi değil`);
  for (const g of a.gives || []) {
    const [kind, val] = g.split(':');
    if (kind === 'feat') { check(FEATS.includes(val), `${w}: özellik ${val}`); nFeat++; featSeen.add(val); }
    else if (kind === 'info') { check(INFOS.includes(val), `${w}: bilgi ${val}`); nInfo++; }
    else if (kind === 'cosm') {
      const c = COS(val);
      check(c && !c.def, `${w}: kozmetik ${val} yok ya da baştan açık`);
      if (c && c.rule) check((c.rule.t === 'ach' && c.rule.id === a.id) || JSON.stringify(c.rule) === JSON.stringify(a.rule), `${w}: ${val} kuralı bu başarımla aynı anda açılmıyor`);
    } else check(false, `${w}: bilinmeyen ödül ${g}`);
  }
  if (a.w === 'mars' || a.lv === 'muhendis' || LATE(a.rule)) nLater++;
}
check(AC.length >= 12, `ACHIEVEMENTS: ${AC.length} (≥12)`);
check(nFeat >= 3 && FEATS.every(f => featSeen.has(f)), 'ACHIEVEMENTS: üç özellik (sürüş, dron, 4× hız) açılmalı');
check(nInfo >= 1, 'ACHIEVEMENTS: en az bir info: ödülü');
check(nLater >= 5, `ACHIEVEMENTS: ikinci görev için ${nLater} başarım (≥5)`);
check(AC.some(a => a.rule && a.rule.t === 'train'), 'ACHIEVEMENTS: eğitim başarımı (caylak) yok');
const cay = AC.find(a => a.id === 'caylak');
check(cay && cay.gives.some(g => g.startsWith('cosm:')), 'caylak: bir kozmetik açmalı');
const sur = AC.find(a => a.gives.includes('feat:surus'));
check(sur && sur.id === 'caylak' && /bin ve sür/i.test(sur.say.tr), 'düzeltme 1: gezgin ehliyeti eğitimin sonunda (caylak), "bin ve sür" demeli');

for (const c of G.COSMETICS) if (c.rule && c.rule.t === 'ach') check(AC.some(a => a.id === c.rule.id && a.gives.includes('cosm:' + c.id)), `COSMETICS.${c.id}: başarım ödülü listesinde yok`);

for (const c of G.COSMETICS) if (['rover', 'craft', 'bld'].includes(c.cat) && c.rule) check(c.rule.t !== 'ach', `COSMETICS.${c.id}: gezgin/araç/üs rengi ach kuralına bağlanmamalı (sim.mjs)`);
console.log('WORKQ eylem/dünya (Kâşif):', JSON.stringify(wqTable), '· toplam', WQ.length, '(lv1', lv1.length + ')', '· başarım', AC.length, '· ikinci görev', nLater);



const TEMPO = (() => {
  const names2 = ['newGame', 'tick', 'build', 'suggestSpot', 'canBuild', 'research', 'techState', 'TECH_ORDER', 'repair', 'scan', 'explore', 'scanInfo', 'collect', 'canCollect',
    'resolve', 'CARGO', 'beds', 'cnt', 'daysLeft', 'canShield', 'shieldUp', 'shieldCost', 'MAPW', 'MAPH', 'HUBX', 'HUBY', 'buildStage', 'dayOf', 'ruleProg', 'WORLDS', 'ACHIEVEMENTS', 'noteTag'];
  const H = vm.runInNewContext(files.map(rd).join('\n') + `\n;({${names2.map(n => `${n}: typeof ${n} === 'undefined' ? undefined : ${n}`).join(',')}})`, { console });
  if (!H.newGame || !H.tick || !H.ACHIEVEMENTS) return null;
  const total = (s, k) => s.b.filter(b => b.k === k).length;
  const rand = c => { c.r = (c.r * 16807) % 2147483647; return c.r / 2147483647; };
  const tryBuild = (s, k) => { if (!H.canBuild(s, k).ok) return false; const p = H.suggestSpot(s, k); return !!p && H.build(s, k, p.x, p.y).ok; };
  const picks = s => { const o = {}; let left = s.pending.find(p => p.type === 'cargo').mass; const add = (id, n) => { const it = H.CARGO.find(c => c.id === id); n = Math.min(n, Math.floor(left / it.kg)); if (it.max) n = Math.min(n, it.max - (o[id] || 0)); if (n > 0) { o[id] = (o[id] || 0) + n; left -= n * it.kg; } };
    add('crew', Math.floor((H.beds(s) - s.pop) / 2)); add('moral', 1); add('parca', 8); add('gida', 4); add('bilim', 2); add('parca', 20); return o; };
  function bot(s, c, w) {
    for (const p of s.pending.slice()) {
      if (p.type === 'cargo') { if (rand(c) < 0.5) { const r = H.resolve(s, picks(s), p.pid); if (r && r.ok) w.push({ act: 'cargo', t: s.t }); } }
      else if (rand(c) < 0.3) { if (H.resolve(s, 0, p.pid) === null) H.resolve(s, 1, p.pid); }
    }
    if (s.over) return;
    if (s.t % 6 === 0) {
      const R = Math.min(13, 3 + s.t / 24 * 0.4); let best = null;
      for (let y = 0; y < H.MAPH; y++) for (let x = 0; x < H.MAPW; x++) { const i = y * H.MAPW + x; if (!'imtcrs'.includes(s.map.k[i]) || s.scanned[i]) continue; const d = Math.hypot(x - H.HUBX, y - H.HUBY); if (d <= R && (!best || d < best.d)) best = { x, y, d }; }
      if (best) { H.explore(s, best.x, best.y); if (H.scan(s, best.x, best.y).ok) w.push({ act: 'scan', t: s.t }); }
    }
    if (s.t % 3) return;
    for (const b of s.b) if (b.broken && H.repair(s, b).ok !== false) w.push({ act: 'repair', t: s.t });
    for (const id of H.TECH_ORDER) if (H.techState(s, id) === 'ok') { H.research(s, id); break; }
    const want = [], Wd = H.WORLDS[s.world], need = s.pw.need, panels = total(s, 'gunes');
    if (panels < 2) want.push('gunes'); if (!total(s, 'oksijen')) want.push('oksijen'); if (!total(s, 'su')) want.push('su');
    if (2 + panels * (Wd.night ? Wd.solarPeak : Wd.solarPeak * 0.32) < need + 3) want.push('gunes');
    if (!total(s, 'sera')) want.push('sera'); if (!total(s, 'maden')) want.push('maden');
    if (total(s, 'batarya') < 2) want.push('batarya');
    if (total(s, 'maden')) for (const b of s.b) if (H.canShield(s, b) && s.res.malzeme >= H.shieldCost(s) + 30) { H.shieldUp(s, b); break; }
    if (H.cnt(s, 'oksijen') * 4.2 < s.pop * 0.84) want.push('oksijen');
    if (total(s, 'sera') * 4.5 < s.pop * 1.8 + 1 && s.idle > 0) want.push('sera');
    if (s.techs.dongu && total(s, 'geri') * 8 < s.pop) want.push('geri');
    if (H.beds(s) - s.pop < 2 && total(s, 'yasam') < 3) want.push('yasam');
    if (!total(s, 'lab') && s.idle > 0) want.push('lab'); if (!total(s, 'anten')) want.push('anten');
    for (const k of want) { if (tryBuild(s, k)) { w.push({ act: 'build', t: s.t }); break; } else break; }
  }

  const prog = (s, r, X) => {
    if (r.t === 'train') return 1;
    if (r.t === 'stage') return H.buildStage(s) >= r.n ? 1 : 0;
    if (r.t === 'work') return X.workOk >= r.n ? 1 : 0;
    if (r.t === 'ach') return X.got[r.id] != null ? 1 : 0;
    return H.ruleProg(s, r);
  };
  const out = {};
  for (const world of ['ay', 'mars']) for (const seed of [11, 23, 37, 51]) {
    const s = H.newGame(world, 'kasif', seed, 'bot'), c = { r: seed * 7919 }, X = { got: {}, workOk: 0, lastCard: -99 }, w = [];
    let g = 0;
    while (!s.over && g++ < 2000) {
      bot(s, c, w);
      for (const e of w.splice(0)) if (e.t - X.lastCard >= 8) { X.lastCard = e.t; if (rand(c) < 0.5) X.workOk++; }
      if (s.over) break;
      H.tick(s);
      for (const a of H.ACHIEVEMENTS) {
        if (X.got[a.id] != null || (a.w && a.w !== world) || (a.lv && a.lv !== 'kasif')) continue;
        if (prog(s, a.rule, X) >= 1) X.got[a.id] = a.rule.t === 'train' ? 0 : H.dayOf(s);
      }
    }
    for (const a of H.ACHIEVEMENTS) (out[world + '/' + a.id] = out[world + '/' + a.id] || []).push(X.got[a.id]);
  }
  return out;
})();
if (TEMPO) {
  console.log('\nbaşarım açılış günleri, Kâşif orta bot, boş profil (4 tohum; 0 = eğitimde, - = açılmadı):');
  for (const world of ['ay', 'mars']) {
    const row = (G.ACHIEVEMENTS || []).map(a => { const d = TEMPO[world + '/' + a.id].filter(x => x != null); return `${a.id} ${d.length ? Math.min(...d) + '–' + Math.max(...d) + (d.length < 4 ? `(${d.length}/4)` : '') : '-'}`; });
    console.log(` ${world}: ` + row.join(' · '));

    const per = [0, 1, 2, 3].map(i => (G.ACHIEVEMENTS || []).map(a => TEMPO[world + '/' + a.id][i]).filter(x => x != null));
    const med = arr => arr.slice().sort((a, b) => a - b)[Math.floor(arr.length / 2)];
    check(med(per.map(p => p.filter(d => d >= 1 && d <= 1).length)) >= 2, `tempo ${world}: 1. günde en az 2 başarım`);
    check(med(per.map(p => p.filter(d => d >= 1 && d <= 20).length)) >= 8, `tempo ${world}: 20. güne kadar en az 8 başarım`);
    console.log(`  ${world}: 1. gün ${per.map(p => p.filter(d => d === 1).length).join('/')} · 20. güne kadar ${per.map(p => p.filter(d => d >= 1 && d <= 20).length).join('/')}`);
  }
}


const H = fs.existsSync(path.join(dir, '..', 'src', 'hikaye.js')) ? rd('hikaye.js') : '';
const warn = [];
if (/−170/.test(H)) warn.push('hikaye.js: Ay gecesi −170 °C → −173 °C olmalı (Paket A)');
if (/−240 °C\\'ye yakın|close to −240/.test(H)) warn.push('hikaye.js: gölgeli krater "−240\'a yakın" → "−240 altı, −246\'ya kadar" olmalı (Paket A)');


{
  const lit = "(?:'((?:[^'\\\\]|\\\\.)*)'|\"((?:[^\"\\\\]|\\\\.)*)\"|`((?:[^`\\\\]|\\\\.)*)`)";
  const re = new RegExp('(?:\\bLS?\\(|\\[)\\s*' + lit + '\\s*,\\s*' + lit, 'g');
  let pairs = 0;
  for (const f of fs.readdirSync(path.join(dir, '..', 'src')).filter(x => x.endsWith('.js'))) {
    const t = rd(f); let m;
    while ((m = re.exec(t))) {
      const en = m[4] ?? m[5] ?? m[6]; pairs++;
      check(!/ufuk/i.test(en), `${f}: EN tarafında "Ufuk" kaldı: ${en.slice(0, 70)}`);
    }
  }
  check(pairs > 500, 'ad taraması: çok az çift bulundu (' + pairs + ')');
}

console.log(`gercek: ${n} kontrol, ${fail} hata · REAL.ms ${Object.keys(R.ms).length} · ev ${Object.keys(R.ev).length} · learn ${R.learn.length} · bank ${R.bank.length} · COSMETICS ${G.COSMETICS.length}`);
for (const w of warn) console.log('UYARI', w);
if (fail) { console.log(errs.join('\n')); process.exit(1); }
console.log('Tüm kontroller geçti');
