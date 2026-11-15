

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const rd = f => fs.readFileSync(path.join(dir, '..', 'src', f), 'utf8');
const has = f => fs.existsSync(path.join(dir, '..', 'src', f));

let fail = 0, n = 0;
const errs = [];
const check = (ok, msg) => { n++; if (!ok) { fail++; errs.push(msg); } };
const words = t => String(t).split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
const bi = o => o && typeof o.tr === 'string' && typeof o.en === 'string' && o.tr.trim() && o.en.trim();

const base = ['veri.js', 'gercek.js', 'cekirdek.js', 'hikaye.js'].filter(has).map(rd).join('\n');
check(has('egitim.js'), 'src/egitim.js yok');
if (!has('egitim.js')) { console.log(errs.join('\n')); process.exit(1); }
const EG_SRC = rd('egitim.js');
const OUT = ['EGITIM', 'newGame', 'tick', 'build', 'suggestSpot', 'explore', 'scan', 'repair', 'resolve', 'WORLDS', 'dayOf',
  'trainBreak', 'trainShip', 'trainAsk', 'ATLAS_Q', 'WORKQ', 'TEACH'];
const ret = `\n;({${OUT.map(k => `${k}: typeof ${k} === 'undefined' ? undefined : ${k}`).join(',')}})`;


let G0 = null;
try { G0 = vm.runInNewContext(base + '\n' + EG_SRC + ret, { console }); } catch (e) { check(false, 'yükleme hatası (DOM ya da arayüz adına dokunuyor olabilir): ' + e.message); }
check(G0 && G0.EGITIM, 'EGITIM tanımlı değil');
if (!G0 || !G0.EGITIM) { console.log(errs.join('\n')); process.exit(1); }
const E0 = G0.EGITIM;
for (const k of ['needed', 'start', 'tick', 'active', 'goal', 'skip']) check(typeof E0[k] === 'function', `EGITIM.${k} işlev değil`);
check(Array.isArray(E0.steps), 'EGITIM.steps dizi değil');
check(E0.needed({}) === true && E0.needed(null) === true && E0.needed({ egitim: 1 }) === false, 'needed(set): set.egitim yoksa true');
check(E0.active() === false && E0.goal() === null, 'başlamadan etkin değil');


const ST = E0.steps;
check(ST.length >= 9 && ST.length <= 11, `adım sayısı ${ST.length} (9–11)`);
let sum = 0;
const ids = new Set();
for (const [i, S] of ST.entries()) {
  const w = `adım ${i + 1} (${S.id})`;
  check(S.id && !ids.has(S.id), `${w}: id`); ids.add(S.id);
  for (const k of ['say', 'say2', 'goal']) check(bi(S[k]), `${w}.${k}: iki dilli değil`);
  if (S.ok != null) check(bi(S.ok), `${w}.ok: iki dilli değil`);
  for (const lang of ['tr', 'en']) {
    for (const k of ['say', 'say2', 'ok']) if (S[k]) check(words(S[k][lang]) <= 12, `${w}.${k}.${lang}: ${words(S[k][lang])} kelime (≤12)`);
    if (S.goal) check(words(S.goal[lang]) <= 5, `${w}.goal.${lang}: ${words(S.goal[lang])} kelime (≤5)`);
    for (const k of ['say', 'say2', 'goal', 'ok']) if (S[k]) check(!/\bPDA\b|ikmal|resupply/i.test(S[k][lang]), `${w}.${k}.${lang}: jargon`);
  }
  check(typeof S.done === 'function', `${w}: done işlevi yok`);
  check(Number.isFinite(S.sn) && S.sn >= 10 && S.sn <= 60, `${w}: sn ${S.sn}`);
  sum += S.sn || 0;
}
check(sum >= 240 && sum <= 360, `toplam sn ${sum} (240–360)`);
check(ST.filter(S => !S.ok).length <= 1 && ST[ST.length - 1].final, 'son adım kapanış (final), diğerlerinde başarı satırı var');

const ORDER = ['goal', 'walk', 'rings', 'build', 'power', 'scan', 'repair', 'atlas', 'cargo', 'menu', 'finish'];
const topics = ST.map(S => S.topic);
let at = -1;
for (const t of ORDER) { const j = topics.indexOf(t); check(j > at, `konu sırası: ${t} (${j}) önceki konudan sonra gelmeli`); if (j >= 0) at = j; }
check(/Merhaba \{ad\}/.test(ST[0].say.tr) && /ekibi hayatta tutmak/.test(ST[0].say.tr), 'adım 1: "Merhaba {ad}! Görevimiz: ekibi hayatta tutmak."');
check(ST.some(S => /Bu halka havamız\. Azalırsa tehlike!/.test((S.ok || S.say).tr)), 'halka adımı: "Bu halka havamız. Azalırsa tehlike!"');
check(ST.some(S => /Panel elektrik verir, makine hava yapar\./.test((S.ok || S.say).tr)), 'elektrik adımı: "Panel elektrik verir, makine hava yapar."');
for (const w of ['ay', 'mars']) {
  const fl = E0.finalLine(w), d = G0.WORLDS[w].missionDays;
  check(bi(fl) && words(fl.tr) <= 12 && words(fl.en) <= 12 && fl.tr.includes(String(d)) && /^Şimdi gerçek görev!/.test(fl.tr), `kapanış satırı ${w}: "${fl.tr}"`);
}

const STRSRC = has('arayuz.js') ? rd('arayuz.js') : '';
for (const [word, key] of [['Kur', 'k_build'], ['İncele', 'k_scan'], ['Onar', 'k_repair']]) {
  if (STRSRC.includes(`${key}: ['${word}'`)) check(ST.some(S => S.say.tr.includes(word) || S.say2.tr.includes(word)), `düğme adı "${word}" eğitimde geçmiyor`);
}



const A_STUB = `
if (typeof trainBreak === 'undefined') globalThis.trainBreak = (s, k) => { const b = s.b.find(o => (!k || o.k === k) && o.left === 0 && !o.broken && o.k !== 'hub'); if (!b) return null; b.broken = true; return b.id; };
if (typeof trainShip === 'undefined') globalThis.trainShip = s => { if (s.pending.some(p => p.type === 'cargo')) return false; pushCargo(s); return true; };
if (typeof trainAsk === 'undefined') globalThis.trainAsk = s => pushEvent(s, 'ozlem') !== false;
`;
function harness(world, opts) {
  const o = opts || {};
  const said = [];
  const env = { clock: 0 };
  const sandbox = {
    console,
    performance: { now: () => env.clock },
    UI: { s: null, selB: null, modal: null, pda: null, plan: false, mode: 'drone', speed: 1, touch: !!o.touch },
    S3: { player: { x: 50, z: 50 }, goal: null, frozen: false, freezeN: 0, setGoal(g) { this.goal = g; }, ping() { this.pinged = (this.pinged || 0) + 1; }, camFreeze(on) { this.frozen = !!on; if (on) this.freezeN++; } },
    subLocal: (from, text, c) => said.push({ from, text, c, t: env.clock }),
    Snd: { play: () => {} },
  };
  if (o.quick) {
    sandbox.ISKART = { cur: null, n: 0,
      quick(act, ctx) { if (act !== 'repair' || !ctx || !ctx.b) return false; this.cur = { b: ctx.b, res: null }; this.n++; return true; },
      quickOpen() { return !!this.cur; }, open() { return !!this.cur; },
      answer(G, s, choice) { const c = this.cur; if (!c || c.res) return; G.repair(s, c.b); if (choice !== 0) s.res.parca = Math.max(0, s.res.parca - 1); s.stat.qeN = (s.stat.qeN || 0) + 1; if (choice !== 0) s.stat.qeBad = (s.stat.qeBad || 0) + 1; c.res = { ok: choice === 0 }; },
      closeQ() { this.cur = null; } };
  }
  if (o.og) { sandbox.OGRET = { tick() {} }; sandbox.learnKey = () => []; }
  const G = vm.runInNewContext(base + '\n' + (o.stubA ? A_STUB : '') + EG_SRC + ret, sandbox);
  return { G, E: G.EGITIM, said, env, UI: sandbox.UI, S3: sandbox.S3, sandbox, quick: !!o.quick };
}
function play(world, slowStep, stubA, extra) {
  const H = harness(world, Object.assign({ stubA }, extra || {}));
  const { G, E, said, env, UI, S3 } = H;
  let fin = null, ts = null;
  const t0 = env.clock;
  ts = E.start({ world, name: 'Ece', look: { suit: 'su_mavi' }, enter(s) { UI.s = s; }, finish(d) { fin = d; } });
  check(ts && ts.world === world && ts.level === 'kasif' && UI.s === ts && ts.look && ts.look.suit === 'su_mavi', `${world}: start → ctx.enter(ts), Kâşif, look`);
  check(ts.train === true, `${world}: eğitim durumu s.train`);
  check(E.active() && E.goal() && E.goal().i === 0 && E.goal().n === E.steps.length, `${world}: goal() ilk adım`);
  check(said.length === 1 && /Merhaba Ece!/.test(said[0].text.tr), `${world}: ilk satır adla söylendi`);
  const sim = h => { for (let i = 0; i < h; i++) { G.tick(ts); env.clock += 1500 / Math.max(1, UI.speed); E.tick(16, env.clock); } };
  const wait = ms => { const end = env.clock + ms; while (env.clock < end) { env.clock += 250; E.tick(16, env.clock); } };
  const per = {}, path2 = {};
  let guard = 0;
  while (E.active() && guard++ < 200) {
    const g = E.goal(), S = E.steps[g.i], st = E._state();
    if (st.phase !== 'do') { wait(300); continue; }
    if (slowStep === S.id && !st.hinted) {
      const before = said.length; wait(26000);
      check(E._state().hinted && said.length <= before + 3 && said[said.length - 1].text.tr === S.say2.tr, `${world}: 25 sn takılınca ikinci, daha basit satır (${S.id})`);
      continue;
    }
    wait(2500 + 800 * words(S.say.tr));
    wait(3000);
    const s = ts, sst = st.st;
    switch (S.id) {
      case 'amac': UI.selB = s.b.find(b => b.k === 'hub').id; UI.modal = 'bcard'; wait(1500); UI.modal = null; break;
      case 'yuru': { const a = g.at; check(a && Number.isFinite(a.x), `${world}: yürüme hedefi var`); S3.player = { x: a.x + 2, z: a.z + 1 }; break; }
      case 'halka': { E._click('#g-o2'); UI.modal = 'detail'; wait(6000);
        check(E._state().id === 'halka' && UI.modal === 'detail', `${world}: hava penceresi kendiliğinden kapanmadı, adım bekliyor`);
        UI.modal = null; break; }
      case 'panel': { const sp = G.suggestSpot(s, 'gunes'); check(sp && G.build(s, 'gunes', sp.x, sp.y).ok, `${world}: panel kuruldu`); break; }
      case 'hava': { const sp = G.suggestSpot(s, 'oksijen'); check(sp && G.build(s, 'oksijen', sp.x, sp.y).ok, `${world}: hava makinesi kuruldu`); let h = 0; while (E.active() && E._state().id === 'hava' && E._state().phase === 'do' && h++ < 40) sim(1); path2.havaH = h; check(h <= 1, `${world}: hava makinesi YERLEŞTİRİLİNCE adım geçti (yapım beklenmedi, ${h} sim adımı)`); break; }
      case 'tara': { const sp = sst.spot; check(!!sp, `${world}: buz hedefi`); if (sp) { G.explore(s, sp.tx, sp.ty); check(G.scan(s, sp.tx, sp.ty).ok, `${world}: buz tarandı`); } break; }
      case 'onar': { const fq = s.fx && s.fx.forceQ, wq = (G.WORKQ || []).find(q => fq && q.id === fq.id);
        check(fq && fq.act === 'repair' && fq.id === 'r_egt_panel' && wq && wq.act === 'repair' && wq.k === 'gunes' && wq.teach === 't_gunes', `${world}: onarım adımı s.fx.forceQ yazdı (r_egt_panel, güneş paneli Bilgisi)`);
        check(S3.frozen === true, `${world}: onarım adımında kamera sabit (camFreeze)`);
        const b = s.b.find(o => o.id === sst.bid); check(b && b.broken, `${world}: panel bozuldu (${G.trainBreak ? 'trainBreak' : 'yedek yol'})`);
        if (b && H.quick) {
          const IK = H.sandbox.ISKART; check(IK.quick('repair', { b }) === true, `${world}: hızlı soru açıldı`);
          wait(8000); check(E._state().id === 'onar' && E._state().phase === 'do', `${world}: soru açıkken onarım adımı bitmedi`);
          IK.answer(G, s, 1); wait(3000); check(!b.broken && E._state().id === 'onar' && E._state().phase === 'do', `${world}: yanlış yanıtta da onarıldı, kart açıkken adım sürüyor`);
          IK.closeQ(); path2.quick = 'ISKART.quick'; wait(2000);
          { const S = E.steps.find(x => x.id === 'onar'); check(said.some(x => x.text.tr === S.okBad.tr) && !said.some(x => x.text.tr === S.ok.tr), `${world}: yanlış yanıttan sonra "Olsun!" satırı ("Sağlam iş" değil)`); }
        } else if (b) check(G.repair(s, b) !== false, `${world}: onarıldı`); break; }
      case 'soru': { path2.soru = sst.pid != null ? (G.trainAsk ? 'trainAsk' : 'pushEvent') : 'atlandı (A yok)'; if (sst.pid != null) { const r = G.resolve(s, 0, sst.pid); check(r != null, `${world}: soru yanıtlandı`); } break; }
      case 'kargo': { let h = 0; while (!s.pending.some(p => p.type === 'cargo') && h++ < 6) sim(1); const p = s.pending.find(q => q.type === 'cargo'); path2.kargo = G.trainShip ? 'trainShip' : 'yedek yol'; check(!!p, `${world}: kargo gemisi indi`); if (p) { const r = G.resolve(s, p.def, p.pid); check(r && r.ok !== false, `${world}: kargo boşaltıldı`); } break; }
      case 'tablet': UI.pda = 'gorev'; break;
      case 'son': wait(2000); UI.pda = null; break;
      default: check(false, 'bilinmeyen adım ' + S.id);
    }
    const i0 = g.i;
    let w2 = 0; while (E.active() && E.goal() && E.goal().i === i0 && E._state().phase === 'do' && w2++ < 40) wait(500);
    per[S.id] = Math.round((env.clock - (per._t || t0)) / 1000); per._t = env.clock;
    check(!E.active() || E._state().phase !== 'do' || E.goal().i !== i0, `${world}: ${S.id} adımı ilerlemedi`);
    if (E.active() && E._state().phase === 'do' && E.goal().i === i0) break;
  }
  let g2 = 0; while (E.active() && g2++ < 200) wait(500);
  delete per._t;
  check(fin === true, `${world}: eğitim bitince ctx.finish(true)`);
  check(!E.active() && E.goal() === null, `${world}: bitince etkin değil`);
  const last = said[said.length - 1];
  check(last && last.text.tr === E.finalLine(world).tr, `${world}: son satır kapanış`);
  check(S3.goal === null, `${world}: hedef işareti temizlendi`);
  check(said.filter(x => x.c === 'good').length >= E.steps.length - 1 - (E.last ? E.last.skipped.length : 0), `${world}: her adımda başarı satırı`);
  for (const x of said) check(words(x.text.tr) <= 12 && words(x.text.en) <= 12, `${world}: altyazı ≤12 kelime: "${x.text.tr}"`);
  const total = Math.round((env.clock - t0) / 1000);
  check(E.last && Array.isArray(E.last.skipped) && E.last.skipped.every(id => ['onar', 'soru', 'kargo'].includes(id)), `${world}: yalnız A'ya bağlı adımlar atlanabilir`);
  if (G.trainAsk && G.trainBreak && G.trainShip) check(E.last.skipped.length === 0, `${world}: A varken hiçbir adım atlanmaz`);
  path2.atlanan = E.last ? E.last.skipped : [];
  const sum = E.summary();
  check(Array.isArray(sum.facts) && sum.facts.length >= 1 && sum.facts.length <= 6 && sum.facts.every(x => typeof x === 'string' && x.length > 0), `${world}: summary().facts 1–6 Bilgi başlığı: ${JSON.stringify(sum.facts)}`);
  check(E.last && JSON.stringify(E.last.facts) === JSON.stringify(sum.facts), `${world}: facts EGITIM.last içinde de`);
  { const gun = G.TEACH.find(t => t.id === 't_gunes' && (!t.w || t.w === world)); check(sum.facts.includes(gun.t.tr), `${world}: facts içinde "${gun.t.tr}"`); }
  if (!(E.last && E.last.skipped.length)) { const kg = G.TEACH.find(t => t.id === 't_kargo' && (!t.w || t.w === world)); if (kg) check(sum.facts.includes(kg.t.tr), `${world}: v5h facts 4'te kesilmez, "${kg.t.tr}" da var`); }
  check(S3.freezeN >= 3 && S3.frozen === false, `${world}: dokunuş bekleyen adımlarda camFreeze(true), bitince false`);

  const SAYS = new Set(E.steps.map(S => S.say && S.say.tr.replace('{ad}', 'Ece')));
  for (let k = 0; k + 1 < said.length; k++) { const need = 1000 + 500 * words(said[k].text.tr); if (said[k].c !== 'good' && (said[k + 1].c === 'good' || SAYS.has(said[k + 1].text.tr))) continue; check(said[k + 1].t - said[k].t >= need, `${world}: altyazı "${said[k].text.tr}" ${said[k + 1].t - said[k].t} ms kaldı (≥${need})`); }
  if (extra && extra.touch) check(!said.some(x => /(^|[\s'’])bas([\s.,!]|$)/.test(x.text.tr) || /\bpress\b/i.test(x.text.en)), `${world}: dokunmatikte "bas/press" yok`);
  check(Array.isArray(sum) && sum.length >= 2 && sum.length <= 5 && sum.every(x => typeof x.icon === 'string' && bi(x.text) && words(x.text.tr) <= 6 && words(x.text.en) <= 6), `${world}: summary() 2–5 öğe, ≤6 kelime`);
  if (extra && extra.og) check(said.some(x => x.text.tr === E.steps.find(S => S.id === 'panel').okOg.tr), `${world}: OGRET varken panel adımı Bilgi kartına işaret eder`);
  else check(!said.some(x => /Soldaki kart/.test(x.text.tr)), `${world}: OGRET yokken Bilgi kartından söz edilmez`);
  for (const S of E.steps) for (const k of ['okOg']) if (S[k]) for (const l of ['tr', 'en']) check(words(S[k][l]) <= 12, `${S.id}.${k}.${l} ≤12`);
  for (const S of E.steps) if (S.tip) for (const l of ['tr', 'en']) check(words(S.tip.say[l]) <= 12 && typeof S.tip.sel === 'string', `${S.id}.tip ≤12 ve seçici`);
  return { per, total, path: path2, times: E.last && E.last.times };
}
const res = {};
for (const w of ['ay', 'mars']) res[w] = play(w, w === 'ay' ? 'halka' : null);
res['ay+A-sahte'] = play('ay', 'onar', true);
res['mars+A-sahte'] = play('mars', null, true);
res['ay+A+hızlı soru+OGRET'] = play('ay', null, true, { quick: true, og: true });
res['mars+A+dokunmatik'] = play('mars', null, true, { touch: true });


{
  const H = harness('ay'); let fin = null;
  H.E.start({ world: 'ay', name: '', enter(s) { H.UI.s = s; }, finish(d) { fin = d; } });
  check(/Merhaba Komutan!/.test(H.said[0].text.tr), 'ad boşsa "Komutan"');
  H.E.skip();
  check(fin === true && !H.E.active() && H.E.goal() === null, 'skip → ctx.finish(true) (atlamak ceza değil: ehliyet gelir)');}

console.log(`egitim: ${n} kontrol, ${fail} hata · ${ST.length} adım · toplam sn ${sum} · A işlevleri: ${['trainBreak', 'trainShip', 'trainAsk'].map(k => k + (G0[k] ? '✓' : '✗')).join(' ')}`);
console.log('adım tablosu (söz | hedef | sn):');
for (const S of ST) console.log(`  ${S.id.padEnd(6)} | ${S.say.tr} | ${S.goal.tr} | ${S.sn}`);
for (const w in res) console.log(`sahte çocuk oyunu ${w}: toplam ${res[w].total} sn · adım (sn) ${JSON.stringify(res[w].per)} · yol ${JSON.stringify(res[w].path)}`);
if (fail) { console.log(errs.join('\n')); process.exit(1); }
console.log('Tüm kontroller geçti');
