

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const srcFiles = ['veri.js', 'gercek.js', 'cekirdek.js', 'hikaye.js'].filter(f => fs.existsSync(path.join(dir, '..', 'src', f)));
const SRC = srcFiles.map(f => fs.readFileSync(path.join(dir, '..', 'src', f), 'utf8')).join('\n');
const names = ['WORLDS', 'BLD', 'newGame', 'tick', 'build', 'canBuild', 'suggestSpot', 'repair', 'repairCost', 'costOf', 'resolve', 'pushCargo', 'trainShip', 'scan', 'explore', 'relicTiles',
  'quickQ', 'repairQ', 'buildQ', 'learnKey', 'spendLog', 'repairExtra', 'buildExtra', 'qHash', 'migrate', 'undoBuild', 'demolish', 'workQ', 'workAnswer', 'pushEvent', 'autoEvent', 'ruleProg', 'cnt', 'shieldUp'];
const L = 'const L = (tr, en) => ({ tr, en });';

const FAKE_Q = [
  { id: 'fr1', act: 'repair', lv: 1, k: 'gunes', teach: 'b_gunes', q: { tr: 'Panel neden az elektrik veriyor?', en: 'Why less power?' }, a: [{ tr: 'Tozlandı', en: 'Dusty' }, { tr: 'Yağmur', en: 'Rain' }, { tr: 'Rüzgâr', en: 'Wind' }], e: { tr: 'Toz ışığı keser.', en: 'Dust blocks light.' } },
  { id: 'fr2', act: 'repair', lv: 1, q: { tr: 'Onarımdan önce ne yapılır?', en: 'Before a repair?' }, a: [{ tr: 'Kapat', en: 'Switch off' }, { tr: 'Hızlandır', en: 'Speed up' }], e: { tr: 'Çalışan makine tehlikeli.', en: 'Running machines are dangerous.' } },
  { id: 'fr3', act: 'repair', lv: 2, q: { tr: 'Yedek parça neden önemli?', en: 'Why spares?' }, a: [{ tr: 'Dükkân yok', en: 'No shops' }, { tr: 'Hafif', en: 'Light' }, { tr: 'Güzel', en: 'Nice' }], e: { tr: 'Uzayda dükkân yok.', en: 'No shops in space.' } },
  { id: 'fr4', act: 'repair', lv: 1, teach: 'gizli', q: { tr: 'Öğretilmemiş soru?', en: 'Untaught?' }, a: [{ tr: 'Evet', en: 'Yes' }, { tr: 'Hayır', en: 'No' }], e: { tr: 'Gizli.', en: 'Hidden.' } },
  { id: 'fr5', act: 'repair', lv: 1, w: 'mars', q: { tr: 'Mars sorusu?', en: 'Mars question?' }, a: [{ tr: 'Evet', en: 'Yes' }, { tr: 'Hayır', en: 'No' }], e: { tr: 'Mars.', en: 'Mars.' } },
  { id: 'fb1', act: 'build', lv: 1, teach: 'b_gunes', q: { tr: 'Paneller nereye kurulur?', en: 'Where do panels go?' }, a: [{ tr: 'Güneşe', en: 'In sun' }, { tr: 'Gölgeye', en: 'In shade' }], e: { tr: 'Panel ışıktan elektrik yapar.', en: 'Panels turn light into power.' } },
  { id: 'fb2', act: 'build', lv: 1, k: 'oksijen', q: { tr: 'Hava makinesi ne yapar?', en: 'What does the air maker do?' }, a: [{ tr: 'Oksijen', en: 'Oxygen' }, { tr: 'Su', en: 'Water' }], e: { tr: 'Oksijen yapar.', en: 'It makes oxygen.' } },
  { id: 'fb3', act: 'build', lv: 1, teach: 'gizli', q: { tr: 'Öğretilmemiş inşa?', en: 'Untaught build?' }, a: [{ tr: 'Evet', en: 'Yes' }, { tr: 'Hayır', en: 'No' }], e: { tr: 'Gizli.', en: 'Hidden.' } },
  { id: 'fa1', act: 'any', lv: 1, q: { tr: 'Astronot dışarıda ne giyer?', en: 'What do astronauts wear?' }, a: [{ tr: 'Uzay giysisi', en: 'A spacesuit' }, { tr: 'Yağmurluk', en: 'A raincoat' }], e: { tr: 'Giysi hava verir.', en: 'The suit gives air.' } },
  { id: 'fs1', act: 'scan', lv: 1, q: { tr: 'Tarama sorusu?', en: 'Scan?' }, a: [{ tr: 'A', en: 'A' }, { tr: 'B', en: 'B' }], e: { tr: 'Tarama.', en: 'Scan.' } },
];
const FAKE_T = [
  { id: 'b_gunes', on: 'build:gunes', t: { tr: 'Güneş paneli', en: 'Solar panel' }, say: { tr: 'Panel ışığı elektriğe çevirir.', en: 'A panel turns light into power.' } },
  { id: 'ev_gece', on: 'ev:gece', w: 'ay', t: { tr: 'Uzun gece', en: 'Long night' }, say: { tr: 'Gece paneller çalışmaz.', en: 'Panels stop at night.' } },
  { id: 'mars_only', on: 'build:gunes', w: 'mars', t: { tr: 'Mars paneli', en: 'Mars panel' }, say: { tr: 'Mars güneşi zayıftır.', en: 'Mars sunlight is weak.' } },
  { id: 'onarim', on: 'first:onarim', t: { tr: 'Onarım', en: 'Repair' }, say: { tr: 'Yedek parça uzayda önemlidir.', en: 'Spare parts matter in space.' } },
  { id: 'kargo', on: 'first:kargo', t: { tr: 'Kargo', en: 'Cargo' }, say: { tr: 'Roket az yük taşır.', en: 'Rockets carry little.' } },
  { id: 'gorev', on: 'first:gorev', t: { tr: 'Görev', en: 'Mission' }, say: { tr: 'Üs kurmak sabır ister.', en: 'Building a base takes patience.' } },
  { id: 'tara_m', on: 'tara:s', t: { tr: 'İz', en: 'Trace' }, say: { tr: 'Eski izler bilgi verir.', en: 'Old traces tell stories.' } },
  { id: 'gizli', on: 'hic:olmaz', t: { tr: 'Gizli', en: 'Hidden' }, say: { tr: 'Gizli.', en: 'Hidden.' } },
];
const fakeSrc = SRC.replace(/\bconst WORKQ\b/, 'const WORKQ_D').replace(/\bconst TEACH\b/, 'const TEACH_D');
const mk = (src, ctx) => vm.runInNewContext(src + `\n;({${names.join(',')}})`, Object.assign({ console }, ctx || {}));
const F = mk(fakeSrc, { __uuWORKQ: FAKE_Q, __uuTEACH: FAKE_T });
const R = mk(SRC);

let fail = 0, n = 0;
const errs = new Map();
const check = (ok, msg) => { n++; if (!ok) { fail++; errs.set(msg, (errs.get(msg) || 0) + 1); } };
const wc = t => String(t || '').trim().split(/\s+/).filter(Boolean).length;
const okL = (o, k) => !!o && typeof o.tr === 'string' && typeof o.en === 'string' && o.tr.trim() && o.en.trim() && wc(o.tr) <= k && wc(o.en) <= k;
const clone = o => JSON.parse(JSON.stringify(o));
const nonNeg = s => ['o2', 'su', 'gida', 'malzeme', 'parca', 'bilim'].every(r => s.res[r] >= 0) && s.core >= 0;
function put(G, s, k) { const sp = G.suggestSpot(s, k); if (!sp) return null; const r = G.build(s, k, sp.x, sp.y); return r.ok ? r.b : null; }
function broken(G, s, k) { k = k || 'gunes'; const b = s.b.find(o => o.k === k && !o.broken) || put(G, s, k); b.left = 0; b.st = 'ok'; b.broken = true; return b; }
const game = (G, w, lv, seed, o) => { const s = G.newGame(w || 'ay', lv || 'kasif', seed || 5, 'Q', o); s.res.malzeme = 900; s.res.parca = 200; s.stage = 2; return s; };


for (const lv of ['kasif', 'muhendis']) {
  const G = F, s = game(G, 'ay', lv);
  G.learnKey(s, 'build:gunes');
  let asked = 0;
  for (let i = 0; i < 12; i++) { const b = broken(G, s, 'gunes'); const q = G.quickQ(s, 'repair', b.k); if (q) asked++; G.repairQ(s, b, q && q.qi, 0); }
  check(asked === 12, `onarım: her onarımda soru (oyun saati sınırı yok) ${lv} (${asked}/12)`);
  const b = broken(G, s, 'gunes'), q = G.quickQ(s, 'repair', 'gunes');
  check(q && Number.isInteger(q.qi) && q.act === 'repair' && q.k === 'gunes' && q.a.length >= 2 && okL(q.q, 12) && q.a.every(a => okL(a, 4)), 'quickQ: biçim');
  check(lv !== 'kasif' || FAKE_Q[q.qi].lv === 1, 'quickQ: Kâşif yalnız lv 1');
  const p0 = s.res.parca, c = G.repairCost(s, b);
  const r = G.repairQ(s, b, q.qi, 0);
  check(r.done && r.ok && r.cost === c && s.res.parca === p0 - c && !b.broken && Object.keys(r.extra).length === 0 && okL(r.line, 12), `repairQ doğru: yalnız ${c} parça ${lv}`);
  const b2 = broken(G, s, 'gunes'), q2 = G.quickQ(s, 'repair', 'gunes'), p1 = s.res.parca, x = G.repairExtra(s, b2);
  const r2 = G.repairQ(s, b2, q2.qi, 1);
  check(r2.done && !r2.ok && !b2.broken && r2.extra.parca === x && s.res.parca === p1 - c - x && okL(r2.line, 12) && r2.e, `repairQ yanlış: onarım yapılır + ${x} ek parça ${lv}`);
  const b3 = broken(G, s, 'gunes'), q3 = G.quickQ(s, 'repair', 'gunes'), p2 = s.res.parca;
  const r3 = G.repairQ(s, b3, q3.qi, -1);
  check(r3.done && !r3.ok && !b3.broken && s.res.parca === p2 - c - x && /Süre|Time/.test(r3.line.tr + r3.line.en), `repairQ süre doldu = yanlış ${lv}`);
  check(s.stat.qeN === 15 && s.stat.qeOk === 13 && s.stat.qeBad === 2, `sayaçlar qeN/qeOk/qeBad ${lv} (${s.stat.qeN}/${s.stat.qeOk}/${s.stat.qeBad})`);
}
{
  const G = F, s = game(G), b = broken(G, s); s.res.parca = G.repairCost(s, b) - 1; const s0 = clone(s.res);
  const r = G.repairQ(s, b, G.quickQ(s, 'repair', b.k).qi, 0);
  check(!r.done && b.broken && JSON.stringify(s.res) === JSON.stringify(s0), 'repairQ: parça yetmezse done:false, harcama yok');
}
{
  const G = F, s = game(G, 'ay', 'muhendis'), b = broken(G, s), c = G.repairCost(s, b), x = G.repairExtra(s, b);
  s.res.parca = c; s.res.malzeme = 50;
  const r = G.repairQ(s, b, G.quickQ(s, 'repair', b.k).qi, 1);
  check(r.done && !b.broken && s.res.parca === 0 && r.extra.malzeme === 2 * x && s.res.malzeme === 50 - 2 * x && !r.extra.parca, 'ek harcama: parça yoksa malzemeden');
  const b2 = broken(G, s); s.res.parca = G.repairCost(s, b2); s.res.malzeme = 1;
  const r2 = G.repairQ(s, b2, G.quickQ(s, 'repair', b2.k).qi, -1);
  check(r2.done && !b2.broken && nonNeg(s) && s.res.malzeme === 0, 'ek harcama: kaynak eksiye düşmez, onarımı engellemez');
}
{
  const G = F, s = game(G, 'ay', 'kasif');
  G.learnKey(s, 'build:gunes');
  const seq = [];
  const ask = (ans) => { const b = broken(G, s, 'gunes'); const q = G.quickQ(s, 'repair', 'gunes'); seq.push(FAKE_Q[q.qi].id); G.repairQ(s, b, q.qi, ans(q)); s.t++; return q; };
  const q1 = ask(() => 1);
  check(FAKE_Q[q1.qi].id === 'fr1', 'seçim: önce bu yapıya özel, öğretilmiş, hiç sorulmamış');
  ask(() => 0); ask(() => 0);
  check(seq[1] === 'fr2' && seq[2] === 'fa1', 'seçim: sonra genel sorular (' + seq.join(',') + ')');
  const q4 = ask(() => 0);
  check(FAKE_Q[q4.qi].id === 'fr1', 'yanlış yanıtlanan soru yeniden gelir');
  const q5 = ask(() => 0);
  check(FAKE_Q[q5.qi].id === 'fr2', 'doğru bilinince işaret kalkar; en uzun süredir sorulmayan');
  check(!seq.includes('fr4') && !seq.includes('fr3') && !seq.includes('fr5'), 'öğretilmemiş Bilgi, lv 2 ve Mars sorusu sorulmaz');
}
{
  const G = F, s = game(G);
  const b = broken(G, s, 'gunes'); delete s.learn.b_gunes; const q = G.quickQ(s, 'repair', 'gunes');
  check(q && FAKE_Q[q.qi].id !== 'fr1' && !FAKE_Q[q.qi].teach, 'öğretilmemiş (b_gunes yok): özel soru atlanır');
  G.repairQ(s, b, q.qi, 0);
  const only = [FAKE_Q[3]], H = mk(fakeSrc, { __uuWORKQ: only, __uuTEACH: FAKE_T }), h = game(H), hb = broken(H, h, 'gunes');
  const hq = H.quickQ(h, 'repair', 'gunes');
  check(hq && hq.qi === 0, 'onarım sorusuz kalmaz: aday yoksa öğretilmemiş kuralı gevşer');
  check(H.quickQ(h, 'build', 'oksijen', { force: true }) === null, 'inşada gevşeme yok');
}
{
  const G = F, s = game(G, 'mars', 'kasif'), b = broken(G, s, 'oksijen');
  const seen = new Set(); for (let i = 0; i < 6; i++) { const bb = broken(G, s, 'oksijen'); const q = G.quickQ(s, 'repair', 'oksijen'); seen.add(FAKE_Q[q.qi].id); G.repairQ(s, bb, q.qi, i % 2); }
  check(seen.has('fr5') && !seen.has('fr1'), 'Mars: dünya süzgeci (' + [...seen].join(',') + ')');
  check(G.repairQ(s, b, G.quickQ(s, 'repair', 'oksijen').qi, 1).done && nonNeg(s), 'Mars: onarım çalışır');
}
{
  const G = F, s = game(G, 'ay', 'kasif', 5, { train: true }); s.res.parca = 50;
  const b = broken(G, s), c = G.repairCost(s, b), q = G.quickQ(s, 'repair', b.k), p0 = s.res.parca, m0 = s.res.malzeme;
  const r = G.repairQ(s, b, q.qi, 1);
  check(r.done && !r.ok && Object.keys(r.extra).length === 0 && s.res.parca === p0 - c && s.res.malzeme === m0 && /Gerçek görevde/.test(r.line.tr) && okL(r.line, 12), 'eğitim: yanlışta ek harcama yok');
  check(G.quickQ(s, 'build', 'gunes') === null, 'eğitim: inşada soru yalnız EGITIM isterse');
  const fb = G.quickQ(s, 'build', 'oksijen', { force: true });
  check(!!fb && fb.act === 'build', 'eğitim: force ile inşa sorusu');
  const bb = put(G, s, 'oksijen'), m1 = s.res.malzeme, r2 = G.buildQ(s, bb.id, fb.qi, 1);
  check(!r2.ok && Object.keys(r2.extra).length === 0 && s.res.malzeme === m1, 'eğitim: inşa yanlışında ek harcama yok');
}


{
  for (const act of ['repair', 'build']) {
    const G = F, a = game(G), b = game(G);
    G.learnKey(a, 'build:gunes'); G.learnKey(b, 'build:gunes');
    let ra, rb;
    if (act === 'repair') { const ba = broken(G, a), bb = broken(G, b); a.fx.spend = []; b.fx.spend = []; ra = G.repairQ(a, ba, G.quickQ(a, 'repair', 'gunes').qi, 1); rb = G.repairQ(b, bb, G.quickQ(b, 'repair', 'gunes').qi, -1); }
    else { const ba = put(G, a, 'oksijen'), bb = put(G, b, 'oksijen'); a.fx.spend = []; b.fx.spend = []; ra = G.buildQ(a, ba.id, 0, 1); rb = G.buildQ(b, bb.id, 0, -1); }
    check(JSON.stringify(ra.extra) === JSON.stringify(rb.extra) && JSON.stringify(a.res) === JSON.stringify(b.res), `süre doldu: bedel yanlışla aynı (${act})`);
    check(rb.late === true && /^Süre doldu\./.test(rb.line.tr) && /^Time is up\./.test(rb.line.en) && !/yanlış cevap|wrong answer/i.test(rb.line.tr + rb.line.en), `süre doldu: satır (${act}) ${rb.line.tr}`);
    check(b.fx.spend.some(o => o.why === 'sure') && !b.fx.spend.some(o => o.why === 'ceza') && a.fx.spend.some(o => o.why === 'ceza'), `süre doldu: spend why 'sure' (${act})`);
  }

  const G = F, e = game(G, 'ay', 'kasif', 5, { train: true }); e.res.parca = 50;
  const be = broken(G, e), r = G.repairQ(e, be, G.quickQ(e, 'repair', 'gunes').qi, -1);
  check(/Eğitimde bir şey kaybetmedin/.test(r.line.tr) && /Nothing lost in training/.test(r.line.en) && okL(r.line, 12) && Object.keys(r.extra).length === 0, 'eğitim süre doldu: kayıp yok satırı');
  const bq = put(G, e, 'oksijen'), r2 = G.buildQ(e, bq.id, 0, 1);
  check(r2.line.tr === 'Eğitimde bir şey kaybetmedin. Gerçek görevde malzeme giderdi.' && okL(r2.line, 12), 'eğitim inşa yanlış: kayıp yok satırı');
}
{
  const G = F, s = game(G);
  s.fx.forceQ = { act: 'repair', id: 'fr2' };
  const b = broken(G, s), q = G.quickQ(s, 'repair', 'gunes');
  check(FAKE_Q[q.qi].id === 'fr2' && s.fx.forceQ == null, 'forceQ: o kayıt döner ve alan silinir');
  s.fx.forceQ = { act: 'repair', id: 'yok-boyle' }; const q2 = G.quickQ(s, 'repair', 'gunes');
  check(!!q2 && s.fx.forceQ == null, 'forceQ: id yoksa yok sayılır');
  s.fx.forceQ = { act: 'build', id: 'fb2' }; const q3 = G.quickQ(s, 'repair', 'gunes');
  check(FAKE_Q[q3.qi].id !== 'fb2' && s.fx.forceQ && s.fx.forceQ.id === 'fb2', 'forceQ: başka act çağrısı dokunmaz');
  G.repairQ(s, b, q.qi, 0);
}
{
  const Q6 = [
    { id: 'b_bat', act: 'build', lv: 1, k: 'batarya', teach: 't_bat', q: { tr: 'Batarya ne yapar?', en: 'What does a battery do?' }, a: [{ tr: 'Saklar', en: 'Stores' }, { tr: 'Üretir', en: 'Makes' }], e: { tr: 'Saklar.', en: 'Stores.' } },
    { id: 'b_hava', act: 'build', lv: 1, k: 'oksijen', teach: 't_hava', q: { tr: 'Ay\'da hava nereden gelir?', en: 'Where does air come from?' }, a: [{ tr: 'Taştan', en: 'Rocks' }, { tr: 'Gökten', en: 'Sky' }], e: { tr: 'Taştan.', en: 'Rocks.' } },
    { id: 'b_gun', act: 'build', lv: 1, k: 'gunes', teach: 't_gun', q: { tr: 'Panel ne ister?', en: 'What does a panel need?' }, a: [{ tr: 'Işık', en: 'Light' }, { tr: 'Su', en: 'Water' }], e: { tr: 'Işık.', en: 'Light.' } },
    { id: 'b_gen', act: 'build', lv: 1, q: { tr: 'Genel soru?', en: 'General?' }, a: [{ tr: 'A', en: 'A' }, { tr: 'B', en: 'B' }], e: { tr: 'A.', en: 'A.' } },
    { id: 'r_gun', act: 'repair', lv: 1, k: 'lab', teach: 'gizli6', q: { tr: 'Öğretilmemiş onarım?', en: 'Untaught repair?' }, a: [{ tr: 'A', en: 'A' }, { tr: 'B', en: 'B' }], e: { tr: 'A.', en: 'A.' } },
    { id: 'b_lab', act: 'build', lv: 1, k: 'lab', teach: 't_lab', q: { tr: 'Laboratuvar ne yapar?', en: 'What does a lab do?' }, a: [{ tr: 'Bilim', en: 'Science' }, { tr: 'Su', en: 'Water' }], e: { tr: 'Bilim.', en: 'Science.' } },
  ];
  const T6 = [{ id: 't_bat', on: 'build:batarya' }, { id: 't_hava', on: 'build:oksijen' }, { id: 't_gun', on: 'build:gunes' }, { id: 't_lab', on: 'build:lab' }, { id: 'gizli6', on: 'hic' }]
    .map(t => Object.assign({ t: { tr: t.id, en: t.id }, say: { tr: t.id, en: t.id } }, t));
  const H6 = mk(fakeSrc, { __uuWORKQ: Q6, __uuTEACH: T6 });
  const s = game(H6); s.t = 30;
  H6.learnKey(s, 'build:oksijen'); s.t++; H6.learnKey(s, 'build:batarya'); s.t++;
  const q = H6.quickQ(s, 'build', 'batarya', { force: true });
  check(Q6[q.qi].id === 'b_bat', 'inşa: batarya kurarken batarya sorusu (hava sorusu değil)');
  H6.buildQ(s, 0, q.qi, 0);

  const q2 = H6.quickQ(s, 'build', 'batarya', { force: true });
  check(Q6[q2.qi].id === 'b_bat', 'v5g E8: yapının kendi sorusu varsa (en uzun süredir sorulmamış) yine o gelir, ilgisiz Bilgi sorusu gelmez (' + Q6[q2.qi].id + ')');
  const t2 = game(H6); const q3 = H6.quickQ(t2, 'build', 'reaktor', { force: true });
  check(q3 === null, 'inşa: hiçbir Bilgiye bağlı soru yoksa soru yok (ilgisiz/genel soru gelmez)');

  const u = game(H6); H6.learnKey(u, 'build:lab');
  const lb = put(H6, u, 'lab'); lb.left = 0; lb.broken = true;
  const rq = H6.quickQ(u, 'repair', 'lab');
  check(rq && Q6[rq.qi].id === 'b_lab' && rq.act === 'repair', 'onarım: öğretilmiş onarım sorusu yoksa yapının inşa sorusu (' + (rq && Q6[rq.qi].id) + ')');
  const v = game(H6); const vb = put(H6, v, 'lab'); vb.left = 0; vb.broken = true; delete v.learn.t_lab;
  const vq = H6.quickQ(v, 'repair', 'lab');
  check(vq && ['r_gun', 'b_gen'].includes(Q6[vq.qi].id), 'onarım: inşa sorusu da yoksa eski gevşeme (' + (vq && Q6[vq.qi].id) + ')');
}
{
  const Q7 = [];
  for (let i = 0; i < 9; i++) Q7.push({ id: 'g' + i, act: 'repair', lv: 1, q: { tr: 'Soru ' + i + '?', en: 'Q ' + i + '?' }, a: [{ tr: 'A', en: 'A' }, { tr: 'B', en: 'B' }], e: { tr: 'A.', en: 'A.' } });
  const H7 = mk(fakeSrc, { __uuWORKQ: Q7, __uuTEACH: FAKE_T });
  const s = game(H7), seq = [], ans = {};
  for (let n = 0; n < 30; n++) {
    const b = broken(H7, s, 'gunes'), q = H7.quickQ(s, 'repair', 'gunes'), id = Q7[q.qi].id;
    seq.push(id);
    const wrong = (id === 'g0' && !ans.g0) || (id === 'g4' && (ans.g4 || 0) < 2);
    ans[id] = (ans[id] || 0) + 1;
    H7.repairQ(s, b, q.qi, wrong ? 1 : 0); s.t++;
  }
  let okGap = true, badBack = true;
  const last = {}, lastOk = {};
  seq.forEach((id, i) => { if (lastOk[id] != null && i - lastOk[id] - 1 < 5) okGap = false; last[id] = i; });

  { const okIdx = {}; const cnt = {}; seq.forEach((id, i) => { cnt[id] = (cnt[id] || 0) + 1; const wrong = (id === 'g0' && cnt[id] === 1) || (id === 'g4' && cnt[id] <= 2); if (okIdx[id] != null && i - okIdx[id] - 1 < 5) okGap = false; if (!wrong) okIdx[id] = i; }); }
  const g0 = seq.map((x, i) => x === 'g0' ? i : -1).filter(i => i >= 0);
  badBack = g0.length >= 2 && g0[1] - g0[0] - 1 >= 2 && g0[1] - g0[0] - 1 <= 3;
  check(okGap, 'tekrar: doğru yanıtlanan soru araya en az 5 soru girmeden gelmez (' + seq.join(',') + ')');
  check(badBack, 'tekrar: yanlış yanıtlanan soru 2–3 soru sonra geri gelir (' + g0.join(',') + ')');
}

{
  const TT = [{ id: 'g2', on: 'gun:2' }, { id: 'g11', on: 'gun:11' }, { id: 'g1', on: 'gun:1' }, { id: 'kal', on: 'first:kalkan' }].map(t => Object.assign({ t: { tr: t.id, en: t.id }, say: { tr: t.id, en: t.id } }, t));
  const HG = mk(fakeSrc, { __uuWORKQ: FAKE_Q, __uuTEACH: TT });
  const s = HG.newGame('ay', 'kasif', 3, 'G'); let at2 = null, at11 = null;
  while (s.t < 24 * 11 + 10) { s.pending.length = 0; s.res.o2 = s.res.su = s.res.gida = 999; HG.tick(s); if (at2 == null && s.learn.g2 != null) at2 = s.t; if (at11 == null && s.learn.g11 != null) at11 = s.t; }
  check(at2 === 24 + 8 && s.learn.g1 == null, `gun:2 → 2. günün 08:00'i (t=${at2}), gun:1 yok`);
  check(at11 === 24 * 10 + 8, `gun:11 uzun gecede de gelir (t=${at11})`);
  const e = HG.newGame('ay', 'kasif', 3, 'G', { train: true }); for (let i = 0; i < 60; i++) HG.tick(e); e.t = 24 + 7; HG.tick(e);
  check(e.learn.g2 == null, 'gun:<n> eğitimde yok');
  const k = HG.newGame('ay', 'kasif', 3, 'K'); k.res.malzeme = 999; const hub = k.b.find(b => b.k === 'hub');
  HG.shieldUp && HG.shieldUp(k, hub); hub.shLeft = 1; HG.tick(k);
  check(k.learn.kal != null, 'first:kalkan ilk toprak örtüsü bitince');
}


{
  const G = F;
  for (const [w, lv, seed] of [['ay', 'kasif', 1], ['ay', 'muhendis', 2], ['mars', 'kasif', 3], ['mars', 'muhendis', 4], ['ay', 'kasif', 77], ['ay', 'kasif', 1234]]) {
    const s = game(G, w, lv, seed); G.learnKey(s, 'build:gunes'); s.res.malzeme = 9000; s.res.parca = 900;
    const kinds = ['gunes', 'batarya', 'oksijen', 'gunes', 'gunes', 'batarya', 'sera', 'gunes', 'batarya', 'gunes', 'oksijen', 'gunes', 'batarya', 'gunes', 'sera', 'gunes', 'gunes', 'batarya', 'gunes', 'oksijen'];
    const hit = [], firsts = [];
    const rs = s.rs;
    kinds.forEach((k, i) => {
      const first = !s.b.some(b => b.k === k);
      const b = put(G, s, k); if (!b) return;
      const q = G.quickQ(s, 'build', k);
      hit.push(q ? 1 : 0); if (first) firsts.push(i);
      if (q) G.buildQ(s, b.id, q.qi, 0);
    });
    check(firsts.every(i => hit[i] === 0), `inşa: türün ilk yerleştirmesinde soru yok ${w}/${lv}/${seed}`);
    check(!hit.some((h, i) => h && hit[i - 1]), `inşa: art arda iki yerleştirmede soru yok ${w}/${lv}/${seed} (${hit.join('')})`);
    let run = 0, maxRun = 0; hit.forEach((h, i) => { if (h || firsts.includes(i)) run = h ? 0 : run; if (!h) { run++; maxRun = Math.max(maxRun, firsts.includes(i) ? 0 : run); } });
    let gap = 0, worst = 0; hit.forEach((h, i) => { if (h) gap = 0; else if (!firsts.includes(i)) { gap++; worst = Math.max(worst, gap); } });
    check(worst <= 3, `inşa: 4 yerleştirme sorusuz geçmez (ilk yerleştirmeler hariç) ${w}/${lv}/${seed} (${hit.join('')})`);
    const rate = hit.reduce((a, b) => a + b, 0) / hit.length;
    check(rate >= 0.2 && rate <= 0.45, `inşa: yaklaşık her 3 yerleştirmeden 1'inde (${(rate * 100).toFixed(0)}%) ${w}/${lv}/${seed}`);
    check(s.rs === rs, `quickQ zar tüketmez ${w}/${lv}/${seed}`);
  }

  const s = game(G, 'ay', 'muhendis', 9); s.res.malzeme = 900;
  const b = put(G, s, 'lab') || put(G, s, 'oksijen'); const m0 = s.res.malzeme, x = G.buildExtra(s, b);
  const r = G.buildQ(s, b.id, 0, 0);
  check(r.ok && s.res.malzeme === m0 && Object.keys(r.extra).length === 0 && okL(r.line, 12), 'buildQ doğru: ek harcama yok');
  const r2 = G.buildQ(s, b.id, 0, 1);
  check(!r2.ok && r2.extra.malzeme === x && s.res.malzeme === m0 - x && okL(r2.line, 12), `buildQ yanlış: ${x} ek malzeme`);
  check(x === Math.max(2, Math.ceil(b.pm / 5)), 'buildQ: ek = malzeme maliyetinin beşte biri, en az 2');
  s.res.malzeme = 1; const left0 = b.left;
  const r3 = G.buildQ(s, b.id, 0, -1);
  check(!r3.ok && r3.extra.malzeme === 1 && s.res.malzeme === 0 && b.left === left0 + 3 && r3.extra.saat === 3 && nonNeg(s), 'buildQ: malzeme yetmezse olan kadarı + yapım 3 saat uzar');
  s.res.malzeme = 0; const r4 = G.buildQ(s, b.id, 0, 1);
  check(!r4.ok && !r4.extra.malzeme && b.left === left0 + 6 && okL(r4.line, 12) && nonNeg(s), 'buildQ: hiç malzeme yoksa yalnız yapım uzar');
}


{
  const G = F;
  const play = (asks) => {
    const s = G.newGame('ay', 'kasif', 4242, 'Z'); G.learnKey(s, 'build:gunes');
    const plan = { 3: 'gunes', 5: 'gunes', 7: 'oksijen', 9: 'su', 12: 'gunes', 15: 'sera', 20: 'batarya', 26: 'batarya', 33: 'gunes', 40: 'maden', 50: 'gunes', 60: 'batarya' };
    for (let h = 0; h < 24 * 14 && !s.over; h++) {
      for (const p of s.pending.slice()) { if (p.type === 'cargo') G.resolve(s, {}, p.pid); else if (G.resolve(s, 0, p.pid) === null) G.resolve(s, 1, p.pid); }
      if (h % 40 === 39) { const bb = s.b.find(o => o.k !== 'hub' && o.left === 0 && !o.broken); if (bb) bb.broken = true; }
      const k = plan[h];
      if (k) { const b = put(G, s, k); if (b && asks) { const q = G.quickQ(s, 'build', k); if (q) G.buildQ(s, b.id, q.qi, 0); } }
      for (const b of s.b) if (b.broken && s.res.parca >= G.repairCost(s, b)) { if (asks) { const q = G.quickQ(s, 'repair', b.k); G.repairQ(s, b, q.qi, 0); } else G.repair(s, b); }
      s.res.o2 = Math.max(s.res.o2, 20); s.res.su = Math.max(s.res.su, 50); s.res.gida = Math.max(s.res.gida, 50);
      G.tick(s);
    }
    return { rs: s.rs, ev: s.radio.map(r => (r.ev || '') + '@' + r.t).join(','), res: JSON.stringify(s.res), rep: s.stat.repairs, qe: s.stat.qeN };
  };
  const A = play(true), B = play(false);
  check(A.qe > 0 && A.rep > 0, `zar: soru sorulan koşuda soru ve onarım oldu (soru ${A.qe}, onarım ${A.rep})`);
  check(A.rs === B.rs && A.ev === B.ev, 'zar: soru sorulan ve sorulmayan koşu aynı olay akışı');
  check(A.res === B.res, 'zar: doğru yanıtla kaynaklar aynı (doğru = normal maliyet)');
}


{
  const G = F, s = game(G);
  const b = broken(G, s), p0 = s.res.parca, c = G.repairCost(s, b);
  check(G.repair(s, b) && s.res.parca === p0 - c && s.stat.qeN === 0, 'repair(): doğrudan çağrı soru sormaz, ek harcama yok');
  check(s.wq.ev.length === 0, 'repair()/build(): eski iş kartı kuyruğuna yazmaz');

  const old = clone(s); delete old.learn; delete old.wq.qa; delete old.wq.bp; delete old.wq.bq; delete old.fx.spend; delete old.fx.pwarn; delete old.fx.teach;
  for (const k of ['qeN', 'qeOk', 'qeBad', 'pwarn']) delete old.stat[k];
  G.migrate(old);
  check(old.learn && old.wq.qa && old.wq.bp === 0 && old.wq.bq === 0 && Array.isArray(old.fx.spend) && Array.isArray(old.fx.pwarn) && Array.isArray(old.fx.teach) && old.stat.qeN === 0, 'eski kayıt: alanlar tamamlanır');
  G.tick(old); const ob = broken(G, old); const oq = G.quickQ(old, 'repair', ob.k);
  check(oq && G.repairQ(old, ob, oq.qi, 0).done, 'eski kayıt: hızlı soru çalışır');

  const j = JSON.parse(JSON.stringify(s)); check(j.wq && j.wq.qa && j.learn, 'kayıt: s.wq.qa ve s.learn saklanır');

  const t = game(G); t.stat.wqOk = 1; t.stat.qeOk = 1; check(G.ruleProg(t, { t: 'work', n: 2 }) === 1, "başarım 'work': iş kartı + hızlı soru");
}


{
  const G = F, s = game(G, 'ay', 'muhendis'); s.fx.spend.length = 0;
  const b = put(G, s, 'oksijen'), c = G.costOf(s, 'oksijen');
  check(s.fx.spend.some(o => o.r === 'malzeme' && o.n === -c.m && o.why === 'build') && s.fx.spend.some(o => o.r === 'parca' && o.n === -c.p && o.why === 'build'), 'harcama: build');
  s.fx.spend.length = 0; G.undoBuild(s, b);
  check(s.fx.spend.some(o => o.r === 'malzeme' && o.n === c.m && o.why === 'iade'), 'harcama: geri alma iadesi');
  const bb = broken(G, s); s.fx.spend.length = 0; const q = G.quickQ(s, 'repair', bb.k); G.repairQ(s, bb, q.qi, 1);
  check(s.fx.spend.some(o => o.r === 'parca' && o.why === 'repair' && o.n < 0) && s.fx.spend.some(o => o.why === 'ceza' && o.n < 0), 'harcama: repairQ (repair + ceza)');
  s.fx.spend.length = 0; bb.broken = true; G.repair(s, bb);
  check(s.fx.spend.length === 1 && s.fx.spend[0].why === 'repair', 'harcama: repair()');
  s.fx.spend.length = 0; G.demolish(s, bb);
  check(s.fx.spend.every(o => o.why === 'iade' && o.n > 0) && s.fx.spend.length > 0, 'harcama: yıkma iadesi');
  s.fx.spend.length = 0; G.pushCargo(s); const cp = s.pending.find(p => p.type === 'cargo'); G.resolve(s, { parca: 2 }, cp.pid);
  check(s.fx.spend.some(o => o.why === 'kargo' && o.r === 'parca' && o.n > 0), 'harcama: oyuncunun kargo boşaltması');
  s.fx.spend.length = 0; const wq = G.workQ(s, 'scan'); if (wq) { G.workAnswer(s, wq.qi, 1, { act: 'scan' }); }
  check(!wq || s.fx.spend.every(o => o.why === 'ceza' || o.why === 'odul'), 'harcama: iş kartı ödül/ceza');
  for (let i = 0; i < 30; i++) G.spendLog(s, 'malzeme', -1, 'build');
  check(s.fx.spend.length === 12, 'harcama: en çok 12 öğe');
  check(s.fx.spend.every(o => typeof o.r === 'string' && Number.isFinite(o.n) && typeof o.why === 'string' && Number.isFinite(o.t)), 'harcama: öğe biçimi { r, n, why, t }');
  const qc = clone(s); qc.quiet = true; qc.fx.spend = []; put(G, qc, 'gunes'); check(qc.fx.spend.length === 0, 'harcama: önizleme (quiet) yazmaz');
}


{
  const G = F, s = game(G, 'ay', 'kasif');
  check(s.learn && Object.keys(s.learn).length === 0 && s.fx.teach.length === 0, 'Bilgi: yeni oyunda boş');
  G.tick(s);
  check(s.learn.gorev != null && s.fx.teach.includes('gorev'), 'Bilgi: first:gorev gerçek görevin ilk saatinde');
  put(G, s, 'gunes');
  check(s.learn.b_gunes === s.t && s.fx.teach.includes('b_gunes') && s.learn.mars_only == null, 'Bilgi: build:<k> + dünya süzgeci');
  const n0 = s.fx.teach.length; put(G, s, 'gunes'); check(s.fx.teach.length === n0, 'Bilgi: yalnız ilki öğretir');
  const b = broken(G, s); G.repairQ(s, b, G.quickQ(s, 'repair', b.k).qi, 0); check(s.learn.onarim != null, 'Bilgi: first:onarim');
  G.pushCargo(s); G.resolve(s, {}, s.pending.find(p => p.type === 'cargo').pid); check(s.learn.kargo != null, 'Bilgi: first:kargo');
  G.autoEvent(s, 'gece'); check(s.learn.ev_gece != null, 'Bilgi: ev:<olay>');
  const r = G.relicTiles(s)[0]; G.explore(s, r.x, r.y); G.scan(s, r.x, r.y); check(s.learn.tara_m != null, 'Bilgi: tara:<karo>');
  for (let i = 0; i < 10; i++) s.fx.teach.push('x' + i); G.learnKey(s, 'hic:olmaz'); check(s.fx.teach.length <= 6, 'Bilgi: kuyruk en çok 6');
  const q = clone(s); q.quiet = true; q.fx.teach = []; delete q.learn.b_gunes; G.learnKey(q, 'build:gunes'); check(q.learn.b_gunes != null && q.fx.teach.length === 0, 'Bilgi: önizleme yalnız s.learn\'e yazar');
  const e = game(G, 'ay', 'kasif', 5, { train: true }); G.tick(e); put(G, e, 'gunes');
  check(e.learn.gorev == null && e.learn.b_gunes != null, 'Bilgi: eğitimde learnKey çalışır, first:gorev yok');
  check(R.learnKey(R.newGame('ay', 'kasif', 1, 'x'), 'build:gunes') !== undefined, 'Bilgi: gerçek tabloyla (ya da TEACH yokken) hata yok');
}


{
  const s = R.newGame('ay', 'kasif', 3, 'R'); s.res.parca = 99; s.stage = 2;
  const b = put(R, s, 'gunes'); b.left = 0; b.broken = true;
  const q = R.quickQ(s, 'repair', 'gunes');
  check(!!q && q.a.length >= 2, 'gerçek WORKQ: onarım sorusu var');
  check(R.repairQ(s, b, q.qi, 1).done && !b.broken, 'gerçek WORKQ: repairQ');
}

console.log(`hızlı soru: ${n} kontrol, ${fail} hata`);
if (fail) { for (const [m, c] of errs) console.log(' HATA ' + (c > 1 ? `(${c}×) ` : '') + m); process.exit(1); }
console.log('Tüm kontroller geçti');
