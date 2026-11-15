

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const groot = execSync('npm root -g').toString().trim();
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(groot, '@playwright', 'cli', 'node_modules', 'playwright-core'));
const out = process.env.SHOTS || path.join(dir, 'shots-iskart'); if (process.env.SHOTS) fs.mkdirSync(out, { recursive: true });
const url = pathToFileURL(path.join(dir, '..', 'index.html')).href + '#test';
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: (process.platform === 'linux' || process.env.YAZILIM_CIZICI === '1') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
const errors = [], checks = [];
const t0 = Date.now(), lap = m => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)} sn] ${m}`);
const ok = (cond, msg) => { checks.push([!!cond, msg]); if (!cond) { errors.push('KONTROL: ' + msg); lap('✗ ' + msg); } else lap('✓ ' + msg); };
const ev = (page, f, a) => page.evaluate(f, a);
const wait = (page, ms) => page.waitForTimeout(ms);
const until = (page, f, a, ms) => page.waitForFunction(f, a, { timeout: ms || 8000, polling: 50 }).then(() => true, () => false);
const shot = async (page, n) => { if (!process.env.SHOTS) return; try { await page.screenshot({ path: path.join(out, n + '.png'), timeout: 120000 }); } catch (e) { lap('ekran görüntüsü alınamadı: ' + n); } };
const wc = t => String(t || '').trim().split(/\s+/).filter(Boolean).length;

const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1, locale: 'tr-TR' });
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_INTERNET|net::|GPU stall|WebGL-/.test(m.text())) errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message + '\n' + e.stack));
await page.goto(url); await wait(page, 900);
await ev(page, () => { try { localStorage.clear(); } catch (e) {   } }); await page.reload(); await wait(page, 1200);


await ev(page, () => { if (window.__uu && !window.__uu.hasWorkQ) window.__uuWORKQ = [
  { id: 'r1', act: 'repair', lv: 1, q: { tr: 'Contayı ne aşındırdı?', en: 'What wore out the seal?' }, a: [{ tr: 'Keskin toz', en: 'Sharp dust' }, { tr: 'Yağmur', en: 'Rain' }], e: { tr: 'Toz cam gibi keskindir, contaları aşındırır.', en: 'Dust is sharp like glass and wears seals.' } },
  { id: 'r2', act: 'repair', lv: 1, q: { tr: 'Onarımdan önce ne yapılır?', en: 'What do you do before a repair?' }, a: [{ tr: 'Makineyi kapat', en: 'Switch it off' }, { tr: 'Hızını artır', en: 'Speed it up' }], e: { tr: 'Çalışan makineye dokunmak tehlikelidir.', en: 'Touching a running machine is dangerous.' } },
  { id: 'b1', act: 'build', lv: 1, q: { tr: 'Paneller nereye kurulur?', en: 'Where do panels go?' }, a: [{ tr: 'Güneş alan yere', en: 'Where the Sun shines' }, { tr: 'Gölgeye', en: 'In the shade' }], e: { tr: 'Panel güneş ışığından elektrik yapar.', en: 'Panels make power from sunlight.' } },
  { id: 'b2', act: 'build', lv: 1, q: { tr: 'Batarya ne saklar?', en: 'What does a battery store?' }, a: [{ tr: 'Elektrik', en: 'Power' }, { tr: 'Su', en: 'Water' }], e: { tr: 'Batarya gündüzün elektriğini geceye saklar.', en: 'A battery saves daytime power for night.' } },
]; });
const has = await ev(page, () => ({ mods: !!(window.__uuMods && window.__uuMods.ISKART), uu: !!window.__uu, egitimAtla: !!(window.__uu && typeof window.__uu.egitimAtla === 'function') }));
ok(has.uu && has.mods, 'ISKART #test adresinde window.__uuMods.ISKART olarak kayıtlı');
if (has.egitimAtla) await ev(page, () => window.__uu.egitimAtla(true));
const cfg0 = await ev(page, () => Object.assign({}, window.__uuMods.ISKART._cfg));
ok(cfg0.gap === 45000 && cfg0.life === 25000, 'varsayılan: kartlar arası 45 sn, yanıtsız 25 sn ' + JSON.stringify(cfg0));

const GAP = 9000, LIFE = 7000, SHOW = 1500, LONG = 120000;
await ev(page, a => Object.assign(window.__uuMods.ISKART._cfg, { gap: a[0], life: a[1], show: a[2], plain: 1200, late: 1500, gapTrain: a[0] }), [GAP, LONG, SHOW]);


await page.click('[data-act="start"]'); await wait(page, 1500);
if (await ev(page, () => window.__uu.UI.modal === 'creator')) { await page.click('#crGo').catch(() => {}); await wait(page, 900); }
await ev(page, () => { const u = window.__uu; try { u.endTutorial(true); } catch (e) {   } });
await page.click('[data-act="tutSumGo"]').catch(() => {}); await wait(page, 500);
await ev(page, () => { const u = window.__uu; if (u.UI.modal) u.ACT.closeModal(); u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); u.UI.s.pending.length = 0; u.setSpeed(1); u.refresh(true); });
const inGame = await ev(page, () => window.__uu.UI.screen === 'game' && !!window.__uu.UI.s);
ok(inGame, 'oyun ekranı açık');
const IK = 'window.__uuMods.ISKART';
const st = () => ev(page, () => window.__uuMods.ISKART._state());
const card = () => ev(page, () => {
  const el = document.getElementById('ikCard'); if (!el || el.hidden) return null;
  const r = el.getBoundingClientRect(), q = el.querySelector('.ik-q'), bs = [...el.querySelectorAll('.ik-ch button')];
  return { kind: el.dataset.kind, act: el.dataset.act, head: (el.querySelector('.ik-head') || {}).textContent || '', q: q ? q.textContent : '', qPx: q ? parseFloat(getComputedStyle(q).fontSize) : 0,
    opts: bs.map(b => ({ t: b.textContent, h: b.getBoundingClientRect().height, v: +b.dataset.ik })), res: (el.querySelector('.ik-res') || {}).textContent || '', why: (el.querySelector('.ik-why') || {}).textContent || '',
    rect: { x: r.x, y: r.y, w: r.width, h: r.height }, band: el.classList.contains('ik-band'), modal: !document.getElementById('modal').hidden };
});
const clock = () => ev(page, () => { const u = window.__uu; return u.UI.s.t + u.UI.acc; });
const budget = (c, tag) => {
  ok(!!c && wc(c.q) <= 12 && c.opts.length >= 2 && c.opts.length <= 3 && c.opts.every(o => wc(o.t) <= 4), `${tag}: soru ≤12 kelime, 2–3 şık ≤4 kelime ${c ? JSON.stringify({ q: c.q, o: c.opts.map(o => o.t) }) : ''}`);
  ok(!!c && c.qPx >= 20 && c.opts.every(o => o.h >= 44), `${tag}: soru ≥20 px, şık ≥44 px ${c ? JSON.stringify({ qPx: c.qPx, h: c.opts.map(o => Math.round(o.h)) }) : ''}`);
};


{
  await ev(page, () => { const u = window.__uu, s = u.UI.s; s.decT = -999; u.pushEvent(s, 'toz'); u.ff(0); });
  const shown = await until(page, () => { const k = window.__uuMods.ISKART._state(); return !!k && k.kind === 'atlas'; }, null, 15000);
  ok(shown, 'ATLAS olayı gelince soru kartı açılır');
  const c = await card();
  ok(c && !c.modal && (await ev(page, () => window.__uu.UI.modal)) == null, 'ortada pencere (#modal) açılmaz');
  ok(c && c.kind === 'atlas' && /ATLAS/.test(c.head), 'ATLAS kartı başlığında ATLAS ' + (c && c.head));
  budget(c, 'ATLAS kartı');
  ok(c && c.opts.length === 2, 'Kâşif: iki şık (gizli tarafsız seçenek görünmez)');
  ok(c && c.band, 'ATLAS kartı altyazının üstündeki bantta');
  const k0 = await clock(); await wait(page, 2500); const k1 = await clock();
  ok(k1 > k0, `kart açıkken oyun zamanı akar (${k0.toFixed(2)} → ${k1.toFixed(2)})`);
  await shot(page, 'ik-01-atlas');
  const wrong = await ev(page, () => { const ev2 = window.__uu.UI.s.pending.find(p => p.id === 'toz'); return ev2 ? { pid: ev2.pid } : null; });
  const right = await ev(page, () => { const ch = document.querySelectorAll('#ikCard .ik-ch button'); return [...ch].map(b => +b.dataset.ik); });
  const okIdx = 0;
  const wIdx = right.find(v => v !== okIdx);
  ok(wIdx != null, 'kartta yanlış şık bulundu ' + JSON.stringify(right));
  await page.click(`#ikCard button[data-ik="${wIdx}"]`); await wait(page, 600);
  const c2 = await card();
  const gone = await ev(page, pid => !window.__uu.UI.s.pending.some(p => p.pid === pid), wrong && wrong.pid);
  ok(gone, 'yanıt → çağrı kalkar');
  ok(c2 && c2.res && /✗/.test(c2.res) && wc(c2.res.replace('✗', '')) <= 12 && c2.why && wc(c2.why) <= 12, 'yanlış yanıt: ✗ sonuç satırı ve doğrusu (≤12 kelime) ' + JSON.stringify(c2 && { res: c2.res, why: c2.why }));
  await shot(page, 'ik-02-atlas-sonuc');
  ok(await until(page, () => !window.__uuMods.ISKART._state(), null, SHOW + 6000), 'sonuçtan sonra kart kendiliğinden kapanır');
}


const mkBroken = () => ev(page, () => {
  const u = window.__uu, s = u.UI.s;
  let b = s.b.find(o => o.k === 'gunes' && o.left === 0);
  if (!b) {
    s.res.malzeme = Math.max(s.res.malzeme, 200);
    for (let y = 2; y < 13 && !b; y++) for (let x = 4; x < 20 && !b; x++) { const r = u.build(s, 'gunes', x, y); if (r && r.ok) b = r.b; }
    if (b) b.left = 0;
  }
  s.wq.ev.length = 0;
  b.broken = true; b.st = 'ariza'; s.res.parca = Math.max(s.res.parca, 20);
  u.refresh(true);
  return b.id;
});
const scanEv = () => ev(page, () => { const s = window.__uu.UI.s; s.stat.scans = Math.max(2, s.stat.scans || 0); if (!s.learn || !s.learn.__all) s.learn = new Proxy(Object.assign({}, s.learn, { __all: 1 }), { get: (o, k) => (k in o ? o[k] : 0) }); s.wq.ev.push({ act: 'scan', t: s.t, x: 12, y: 7, kind: 'i' }); });
{
  await wait(page, GAP + 500);
  await ev(page, () => { const u = window.__uu; try { if (u.UI.mode !== 'drone') u.toggleView(); } catch (e) {   } });
  await wait(page, 800);
  const bid = await mkBroken();
  await ev(page, id => { const u = window.__uu; u.UI.selB = id; u.modalBuilding(id); u.ACT.bRepair(); }, bid);
  await wait(page, 2500);
  ok(!(await st()), 'v5: eski yoldan onarım (ACT.bRepair) iş kartı açmaz (bilerek değişti)');

  await ev(page, () => { const I = window.__uuMods.ISKART; if (I.quickOpen && I.quickOpen()) { const o = document.querySelector('.ik-q-opt[data-ok="1"]'); if (o) o.click(); } });
  await until(page, () => { const I = window.__uuMods.ISKART; const g = document.querySelector('.ik-q-go'); if (g) g.click(); return !(I.quickOpen && I.quickOpen()); }, null, 20000);
  await wait(page, GAP + 500);
  await ev(page, () => { const u = window.__uu; if (u.UI.modal) u.ACT.closeModal(); });
  await ev(page, () => { const u = window.__uu, s = u.UI.s; for (let y = 2; y < 13; y++) for (let x = 4; x < 20; x++) { const r = u.build(s, 'batarya', x, y); if (r && r.ok) { u.refresh(true); return; } } });
  await wait(page, 2500);
  ok(!(await st()), 'v5: inşa iş kartı açmaz (bilerek değişti)');
}

{
  await ev(page, () => { const s = window.__uu.UI.s; s.wq.last = -99; });
  await scanEv();
  const shown = await until(page, () => { const k = window.__uuMods.ISKART._state(); return !!k && k.kind === 'work' && k.act === 'scan'; }, null, 6000);
  if (!shown) lap('tarama kartı durumu: ' + JSON.stringify(await ev(page, () => { const u = window.__uu, I = window.__uuMods.ISKART; return { modal: u.UI.modal, pda: u.UI.pda, plan: u.UI.plan, q: I.quickOpen(), ev: u.UI.s.wq.ev.length, last: u.UI.s.wq.last, t: u.UI.s.t, st: I._state() }; })));
  ok(shown, 'tarama iş kartı açılır (v4 gibi)');
  const c = await card();
  ok(c && /inceliyorsun/.test(c.head), 'başlık "Yeri inceliyorsun" ' + (c && c.head));
  budget(c, 'Tarama kartı');
  await shot(page, 'ik-03-tarama');
  await ev(page, a => { window.__uuMods.ISKART._cfg.life = a; }, LIFE);
  const plain = await until(page, () => { const el = document.getElementById('ikCard'); return !!el && !el.hidden && !!el.querySelector('.ik-res.plain'); }, null, LIFE + 6000);
  ok(plain, 'yanıtsız → düz sonuç');
  const tu = await ev(page, () => { const el = document.getElementById('ikCard'); return { right: !!el.querySelector('.ik-right-l'), go: !!el.querySelector('.ik-go'), t: el.querySelector('.ik-out').textContent }; });
  ok(tu.right && tu.go && /Süre doldu/.test(tu.t), 'v5f tarama süre doldu: doğrusu + neden + Tamam ' + JSON.stringify(tu));
  await wait(page, 1500);
  ok(!!(await st()), 'v5f tarama süre doldu: kart kendiliğinden kaybolmaz');
  await page.click('#ikCard .ik-go').catch(() => {});
  ok(await until(page, () => !window.__uuMods.ISKART._state(), null, 6000), '"Tamam" ile kapanır');
  await ev(page, a => { window.__uuMods.ISKART._cfg.life = a; }, LONG);
  await ev(page, () => { const s = window.__uu.UI.s; s.wq.last = -99; });
  await scanEv(); await wait(page, 2500);
  ok(!(await st()), 'kartlar arası bekleme içinde yapılan eylemde kart açılmaz');
  await wait(page, GAP);
  ok(!(await st()), 'bekleme bitince de o eylemin kartı sonradan açılmaz');
}

{
  await ev(page, () => { const s = window.__uu.UI.s; s.wq.last = s.t; });
  await scanEv(); await wait(page, 2500);
  ok(!(await st()), 'hız sınırına (oyun saati) takılan taramada kart açılmaz');
}

const QSEL = '#ikQuick';
const quick = () => ev(page, () => {
  const el = document.getElementById('ikQuick'); if (!el || el.hidden) return null;
  const cd = el.querySelector('.ik-q-card'), r = cd.getBoundingClientRect(), q = el.querySelector('.ik-q-q');
  const os = [...el.querySelectorAll('.ik-q-opt')];
  const res = el.querySelector('.ik-q-res');
  return { act: el.dataset.act, head: (el.querySelector('.ik-q-head') || {}).textContent || '', q: q ? q.textContent : '', qPx: q ? parseFloat(getComputedStyle(q).fontSize) : 0,
    opts: os.map(b => ({ t: b.textContent.replace(/^\d/, ''), h: b.getBoundingClientRect().height, i: +b.dataset.i, ok: b.dataset.ok === '1', dis: b.disabled })),
    res: res ? { ok: res.dataset.ok, t: res.textContent } : null, right: (el.querySelector('.ik-q-right') || {}).textContent || '', why: (el.querySelector('.ik-q-why') || {}).textContent || '',
    go: !!el.querySelector('.ik-q-go'), timer: !!el.querySelector('.ik-q-time'), cost: !!el.querySelector('.ik-q-cost'),
    barH: (() => { const b = el.querySelector('.ik-q-time'); return b ? b.getBoundingClientRect().height : 0; })(),
    sn: (() => { const n = el.querySelector('.ik-q-sn'); return n ? { t: n.textContent, px: parseFloat(getComputedStyle(n).fontSize), vis: n.getBoundingClientRect().width > 0 } : null; })(),
    rect: { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom, r: r.right }, vw: innerWidth, vh: innerHeight, scroll: cd.scrollHeight > cd.clientHeight + 1,
    full: (() => { const b = el.getBoundingClientRect(); return b.width >= innerWidth - 1 && b.height >= innerHeight - 1; })() };
});
const qBudget = (c, tag) => {
  ok(!!c && wc(c.q) <= 12 && c.opts.every(o => wc(o.t) <= 4), `${tag}: soru ≤12, şık ≤4 kelime ${c ? JSON.stringify({ q: c.q, o: c.opts.map(o => o.t) }) : ''}`);
  ok(!!c && c.qPx >= 18 && c.opts.every(o => o.h >= 44), `${tag}: soru ≥18 px, şık ≥44 px ${c ? JSON.stringify({ qPx: c.qPx, h: c.opts.map(o => Math.round(o.h)) }) : ''}`);
};
const openRepair = () => ev(page, id => { const u = window.__uu, s = u.UI.s, b = s.b.find(o => o.id === id); return window.__uuMods.ISKART.quick('repair', { b }); }, null);
{
  await ev(page, () => window.__uuMods.ISKART.close());
  const q0 = await ev(page, () => Object.assign({}, window.__uuMods.ISKART._qcfg));
  ok(q0.kasif === 30000 && q0.muhendis === 15000, 'hızlı soru süresi: Kâşif 30 sn, Mühendis 15 sn ' + JSON.stringify(q0));

  const bid = await mkBroken();
  const opened = await ev(page, id => { const u = window.__uu, s = u.UI.s, b = s.b.find(o => o.id === id); u.UI.selB = id; u.modalBuilding(id); return window.__uuMods.ISKART.quick('repair', { b }); }, bid);
  await wait(page, 400);
  let c = await quick();
  ok(opened === true && !!c && c.act === 'repair', 'ISKART.quick(repair) → true, #ikQuick açılır');
  ok(await ev(page, () => window.__uuMods.ISKART.quickOpen() && window.__uuMods.ISKART.open()), 'quickOpen() ve open() → true');
  ok(await ev(page, () => window.__uu.UI.modal == null), 'yapı kartı (bcard) kapanır');
  ok(c && c.full && Math.abs((c.rect.x + c.rect.w / 2) - c.vw / 2) < 4, 'ekran ortasında, tam ekran karartma');
  ok(c && /Onarım/.test(c.head) && /Güneş Paneli/.test(c.head), 'başlık: Onarım + yapı adı ' + (c && c.head));
  ok(c && c.opts.length === 2 && c.opts.filter(o => o.ok).length === 1, 'Kâşif: 2 şık, biri doğru (data-ok yalnız #test)');
  ok(c && c.timer, 'geri sayım çubuğu var');
  ok(c && c.barH >= 8 && c.sn && c.sn.vis && c.sn.px >= 16 && /^\d+$/.test(c.sn.t) && +c.sn.t <= 30 && +c.sn.t >= 25, 'v5f: çubuk ≥8 px ve yanında kalan saniye (.ik-q-sn ≥16 px) ' + JSON.stringify(c && { barH: c.barH, sn: c.sn }));
  qBudget(c, 'Hızlı soru (onarım)');
  await shot(page, 'ik-05-hizli-onarim');

  await page.keyboard.press('Escape'); await wait(page, 300);
  await page.mouse.click(8, 8); await wait(page, 300);
  await ev(page, () => window.__uuMods.ISKART.close());
  c = await quick();
  ok(!!c && !c.res, 'kapatılamaz: Esc, dışa dokunma ve close() kapatmaz');
  ok(await ev(page, () => window.__uu.UI.modal == null), 'Esc oyun menüsünü de açmaz (yakalanır)');

  const before = await ev(page, id => { const s = window.__uu.UI.s; return { p: s.res.parca, m: s.res.malzeme, br: s.b.find(o => o.id === id).broken }; }, bid);
  const wrongI = c.opts.find(o => !o.ok).i;
  await page.click(`${QSEL} .ik-q-opt[data-i="${wrongI}"]`);

  await wait(page, 150);
  await page.click(`${QSEL} .ik-q-go`, { force: true }).catch(() => {}); await wait(page, 100);
  ok(!!(await quick()), 'v5f: ilk 1,2 sn "Tamam" kilitli (kart kapanmaz)');
  await wait(page, 250);
  c = await quick();
  const after = await ev(page, id => { const s = window.__uu.UI.s, k = window.__uuMods.ISKART._quick(); return { p: s.res.parca, m: s.res.malzeme, br: s.b.find(o => o.id === id).broken, cost: k && k.r ? k.r.cost : null, extra: k && k.r ? k.r.extra : {} }; }, bid);
  ok(c && c.res && c.res.ok === '0' && /−/.test(c.res.t) && c.right && c.go, 'yanlış: .ik-q-res[data-ok=0], harcanan (−), doğrusu, Tamam ' + JSON.stringify(c && { res: c.res, right: c.right }));
  ok(!after.br && before.p - after.p === after.cost + (after.extra.parca || 0) && (!after.extra.malzeme || before.m - after.m >= after.extra.malzeme - 0.5) && (after.extra.parca || after.extra.malzeme), `yanlış: onarım YİNE yapılır, ana maliyet + ek harcama gider (${before.p} → ${after.p}, ek ${JSON.stringify(after.extra)})`);
  const line = c && c.res ? c.res.t.split(/−/)[0].replace(/[✓✗]/, '') : '';
  ok(wc(line) <= 12 && wc(c && c.why) <= 12, 'sonuç satırı ve neden ≤12 kelime ' + JSON.stringify({ line, why: c && c.why }));
  await shot(page, 'ik-06-hizli-yanlis');
  await wait(page, 2500);
  ok(!!(await quick()), 'yanlışta kart kendiliğinden kapanmaz (çocuk okusun)');
  await page.click(`${QSEL} .ik-q-q`).catch(() => {}); await wait(page, 200);
  ok(!!(await quick()), 'v5f: karta (Tamam dışına) dokunmak kapatmaz');
  await page.click(`${QSEL} .ik-q-go`); await wait(page, 400);
  ok(!(await quick()) && !(await ev(page, () => window.__uuMods.ISKART.quickOpen())), '"Tamam" ile kapanır');

  await ev(page, () => Object.assign(window.__uuMods.ISKART._qcfg, { okMin: 800, perWord: 50 }));
  const bid2 = await mkBroken();
  await ev(page, id => { const u = window.__uu, s = u.UI.s; window.__uuMods.ISKART.quick('repair', { b: s.b.find(o => o.id === id) }); }, bid2);
  await wait(page, 300);
  c = await quick();
  const key = c ? c.opts.findIndex(o => o.ok) + 1 : 1;
  const p0 = await ev(page, () => window.__uu.UI.s.res.parca);
  await page.keyboard.press(String(key)); await wait(page, 300);
  c = await quick();
  const p1 = await ev(page, () => window.__uu.UI.s.res.parca);
  ok(c && c.res && c.res.ok === '1' && /✓/.test(c.res.t), `doğru (${key} tuşu): .ik-q-res[data-ok=1] ✓ ` + (c && c.res && c.res.t));
  ok(p0 - p1 === after.cost, `doğru: yalnız normal maliyet (${p0 - p1} = ${after.cost})`);
  ok(await until(page, () => !window.__uuMods.ISKART.quickOpen(), null, 8000), 'doğruda okuma süresinden sonra kendiliğinden kapanır');

  {
    const bidD = await mkBroken();
    await ev(page, id => { const u = window.__uu, s = u.UI.s; window.__uuMods.ISKART.quick('repair', { b: s.b.find(o => o.id === id) }); }, bidD);
    await wait(page, 300);
    const cD = await quick();
    const n0 = await ev(page, () => window.__uu.UI.s.stat.qeN);
    const wi = cD.opts.find(o => !o.ok).i;

    const dd = await page.evaluate(wi => new Promise(res => {
      const t0 = performance.now(), log = [];
      const at = (ms, f) => setTimeout(() => { try { f(); } catch (e) { log.push('hata ' + e.message); } }, ms);
      const opt = () => document.querySelector(`#ikQuick .ik-q-opt[data-i="${wi}"]`);
      const go = () => document.querySelector('#ikQuick .ik-q-go');
      at(0, () => { opt().click(); log.push(['opt', Math.round(performance.now() - t0)]); });
      at(90, () => { const o = opt(); if (o) o.click(); log.push(['opt2', Math.round(performance.now() - t0)]); });
      at(180, () => { const g = go(); if (g) { g.disabled = false; g.click(); g.disabled = true; } log.push(['go', Math.round(performance.now() - t0)]); });
      at(270, () => { const g = go(); if (g) g.click(); log.push(['go2', Math.round(performance.now() - t0)]); });
      at(400, () => { const el = document.getElementById('ikQuick'); res({ open: !!el && !el.hidden, log }); });
    }), wi);
    lap('çift dokunuş zamanları ' + JSON.stringify(dd.log));
    await wait(page, 100);
    const cD2 = await quick();
    const n1 = await ev(page, () => window.__uu.UI.s.stat.qeN);
    ok(dd.open && !!cD2 && cD2.res && cD2.res.ok === '0' && n1 - n0 === 1 && cD2.opts.every(o => o.dis), `v5f çift dokunuş: tek seçim, kart açık kalır, şıklar kilitli (qeN +${n1 - n0}, açık ${dd.open}, ${JSON.stringify(cD2 && cD2.res)})`);
    await wait(page, 1300);
    await page.click(`${QSEL} .ik-q-go`).catch(() => {}); await wait(page, 300);
    ok(!(await quick()), 'v5f çift dokunuş: 1,2 sn sonra "Tamam" kapatır');
  }

  {
    const bidT = await mkBroken();
    await ev(page, id => { const u = window.__uu, s = u.UI.s; s.train = true; window.__uuMods.ISKART.quick('repair', { b: s.b.find(o => o.id === id) }); }, bidT);
    await wait(page, 300);
    const cT = await quick();
    if (cT) { const wi = cT.opts.find(o => !o.ok).i; await page.click(`${QSEL} .ik-q-opt[data-i="${wi}"]`); await wait(page, 300); }
    const cT2 = await quick();
    ok(!!cT2 && cT2.res && !cT2.cost && /Eğitimde bir şey kaybetmedin/.test(cT2.res.t) && !cT2.timer, 'v5f eğitim: yanlışta harcama satırı yok, kayıp yok satırı ' + JSON.stringify(cT2 && cT2.res));
    await wait(page, 1300);
    await page.click(`${QSEL} .ik-q-go`).catch(() => {}); await wait(page, 300);
    await ev(page, () => { window.__uu.UI.s.train = false; });
  }

  await ev(page, () => { window.__uuMods.ISKART._qcfg.kasif = 2500; });
  const bid3 = await mkBroken();
  await ev(page, id => { const u = window.__uu, s = u.UI.s; window.__uuMods.ISKART.quick('repair', { b: s.b.find(o => o.id === id) }); }, bid3);
  const late = await until(page, () => { const r = document.querySelector('#ikQuick .ik-q-res'); return !!r && r.dataset.ok === '0'; }, null, 15000);
  c = await quick();
  ok(late && c && /Süre doldu/.test(c.res.t), 'süre dolunca yanlış sayılır ("Süre doldu") ' + (c && c.res && c.res.t));
  ok(c && c.res && /^✗ Süre doldu\./.test(c.res.t.trim()) && !/yanlış cevap/i.test(c.res.t), 'v5f: süre dolunca "Süre doldu." ile başlar, "yanlış cevap" yazmaz ' + (c && c.res && c.res.t));
  await wait(page, 1300);
  ok(await ev(page, id => !window.__uu.UI.s.b.find(o => o.id === id).broken, bid3), 'süre dolsa da onarım yapılır');
  await page.click(`${QSEL} .ik-q-go`).catch(() => {}); await wait(page, 300);
  await ev(page, () => { window.__uuMods.ISKART._qcfg.kasif = 30000; });

  const noPart = await ev(page, () => { const u = window.__uu, s = u.UI.s, b = s.b.find(o => o.k === 'gunes' && o.left === 0); b.broken = true; const p = s.res.parca; s.res.parca = 0; const r = window.__uuMods.ISKART.quick('repair', { b }); s.res.parca = p; b.broken = false; return r; });
  ok(noPart === false && !(await quick()), 'parça yetmezse hızlı soru açılmaz (false)');

  await ev(page, () => { const u = window.__uu; try { u.enterPlan(); } catch (e) {   } });
  await wait(page, 800);
  const bq = await ev(page, () => {
    const u = window.__uu, s = u.UI.s; s.res.malzeme = Math.max(s.res.malzeme, 300);
    for (let y = 2; y < 13; y++) for (let x = 4; x < 20; x++) { const r = u.build(s, 'gunes', x, y); if (r && r.ok) { u.refresh(true); return { id: r.b.id, open: window.__uuMods.ISKART.quick('build', { bid: r.b.id, k: 'gunes', force: true }) }; } }
    return null;
  });
  await wait(page, 400);
  c = await quick();
  ok(bq && bq.open === true && c && c.act === 'build' && /İnşa/.test(c.head), 'inşa hızlı sorusu inşa görünümünde açılır ' + (c && c.head));
  qBudget(c, 'Hızlı soru (inşa)');
  await shot(page, 'ik-07-hizli-insa');
  if (c) { await page.click(`${QSEL} .ik-q-opt[data-i="0"]`); await wait(page, 300); }
  ok(await until(page, () => !window.__uuMods.ISKART.quickOpen(), null, 8000), 'inşa: doğru yanıttan sonra kapanır');
  await ev(page, () => { const u = window.__uu; try { u.exitPlan(); } catch (e) {   } });

  await page.setViewportSize({ width: 844, height: 390 }); await wait(page, 800);
  const bid4 = await mkBroken();
  await ev(page, id => { const u = window.__uu, s = u.UI.s; window.__uuMods.ISKART.quick('repair', { b: s.b.find(o => o.id === id) }); }, bid4);
  await wait(page, 400);
  c = await quick();
  const fits = q => !!q && q.rect.y >= 0 && q.rect.x >= 0 && q.rect.b <= q.vh + 0.5 && q.rect.r <= q.vw + 0.5 && !q.scroll;
  ok(fits(c) && c.opts.every(o => o.h >= 44), 'telefon 844x390: soru kaydırmasız sığar, şık ≥44 px ' + JSON.stringify(c && { rect: c.rect, h: c.opts.map(o => Math.round(o.h)) }));
  await shot(page, 'ik-08-telefon');
  if (c) { const wi = c.opts.find(o => !o.ok).i; await page.click(`${QSEL} .ik-q-opt[data-i="${wi}"]`); await wait(page, 400); }
  c = await quick();
  ok(fits(c), 'telefon 844x390: yanlış sonucu (doğrusu + neden + Tamam) da sığar ' + JSON.stringify(c && c.rect));
  await shot(page, 'ik-09-telefon-sonuc');
  await wait(page, 1300);
  await page.click(`${QSEL} .ik-q-go`).catch(() => {}); await wait(page, 300);
  await page.setViewportSize({ width: 1366, height: 768 }); await wait(page, 800);
  await ev(page, () => Object.assign(window.__uuMods.ISKART._qcfg, { okMin: 2500, perWord: 350 }));
}

{
  await ev(page, () => { const u = window.__uu, s = u.UI.s; s.pending = s.pending.filter(p => p.type !== 'event'); s.decT = -999; u.pushEvent(s, 'sizinti'); u.ff(0); });
  await wait(page, 2500);
  ok(!(await st()), 'iki kart arasında bekleme: ikinci kart hemen açılmaz');
  const later = await until(page, () => { const k = window.__uuMods.ISKART._state(); return !!k && k.kind === 'atlas'; }, null, GAP + 8000);
  ok(later, 'bekleme dolunca ATLAS sorusu açılır (ATLAS önce)');

  const pid = await ev(page, () => { const p = window.__uu.UI.s.pending.find(o => o.id === 'sizinti'); return p ? p.pid : null; });
  const askR = await ev(page, pid => { const I = window.__uuMods.ISKART, p = window.__uu.UI.s.pending.find(o => o.pid === pid); return { ask: p ? I.ask(p) : null, showing: I.showing(pid) }; }, pid);
  ok(askR.ask === true && askR.showing === true, 'ISKART.ask(p) → true, showing(pid) → true');
  const k5 = await ev(page, pid => { const u = window.__uu; u.openCall(pid); return { modal: u.UI.modal }; }, pid);
  lap(k5.modal ? `K5 (openCall → ISKART.ask) bu dalda yok: openCall pencere açtı (${k5.modal}) · birleşimden sonra denenecek` : 'K5 var: openCall pencere açmadı');
  await ev(page, () => { const u = window.__uu; if (u.UI.modal) u.ACT.closeModal(); });
  await page.click('#ikCard button[data-ik="0"]').catch(() => {}); await wait(page, 500);
  const c = await card();
  ok(c && /✓/.test(c.res), 'doğru yanıt: ✓ ' + (c && c.res));
}

{
  await ev(page, () => window.__uuMods.ISKART.close());
  ok(!(await st()), 'ISKART.close() kartı kapatır');
}

{
  await wait(page, GAP + 500);
  await ev(page, () => { const u = window.__uu; if (u.UI.modal) u.ACT.closeModal(); try { if (u.UI.mode !== 'drone') u.toggleView(); } catch (e) {   } u.UI.s.wq.last = -99; });
  await wait(page, 500);
  await scanEv();
  const shown = await until(page, () => { const k = window.__uuMods.ISKART._state(); return !!k && k.kind === 'work' && k.act === 'scan' && !k.done; }, null, 6000);
  ok(shown, 'v5h: tarama kartı açıldı');
  await wait(page, 600);

  await ev(page, () => { const S3 = window.__uu.S3, p = S3.player; try { S3.clickWalk(true); } catch (e) {   } S3.walkTo(p.x + 40, p.z + 24); });
  await wait(page, 300);
  const R = c => (c ? [c.rect.x, c.rect.y, c.rect.w, c.rect.h].map(v => Math.round(v)) : null);
  const r1 = R(await card()); await wait(page, 1000); const r2 = R(await card());
  const mv = await ev(page, () => !!window.__uu.S3.walking);
  ok(r1 && r2 && JSON.stringify(r1) === JSON.stringify(r2), `v5h: kart açıkken 1 sn arayla iki ölçümde kart kutusu aynı (astronot yürüyor: ${mv}) ${JSON.stringify([r1, r2])}`);
  const gA = await ev(page, () => { const w = window.__uu.S3.walkPath; return w ? w.goal : null; });
  let clicked = true; await page.click('#ikCard button[data-ik]', { timeout: 5000 }).catch(() => { clicked = false; });
  await wait(page, 250);
  const af = await ev(page, () => { const w = window.__uu.S3.walkPath; return { st: window.__uuMods.ISKART._state(), g: w ? w.goal : null }; });
  ok(clicked && af.st && af.st.done, 'v5h: şıkka gerçek (fare) tıklama yanıtı seçti ' + JSON.stringify(af.st));
  ok(JSON.stringify(af.g) === JSON.stringify(gA), `v5h: tık zemine geçmedi, astronotun hedefi değişmedi ${JSON.stringify([gA, af.g])}`);

  await ev(page, () => { const S3 = window.__uu.S3, p = S3.player; S3.walkTo(p.x, p.z); });
  await wait(page, 300);
  const cv = await ev(page, () => { const c = document.getElementById('c3') || document.querySelector('canvas'), r = c.getBoundingClientRect(), k = document.getElementById('ikCard').getBoundingClientRect(); const x = k.right + 120 < r.right ? k.right + 100 : k.left - 100; return { x, y: Math.min(r.bottom - 120, k.top + 40) }; });
  await page.mouse.click(cv.x, cv.y); await wait(page, 300);
  const g2 = await ev(page, () => ({ open: !!window.__uuMods.ISKART._state(), walking: !!window.__uu.S3.walking }));
  ok(!g2.open || !g2.walking, 'v5h: iş kartı açıkken zemine tık astronotu yürütmez ' + JSON.stringify(g2));
  await ev(page, () => window.__uuMods.ISKART.close());
}

await ctx.close();
await browser.close();
const nOk = checks.filter(c => c[0]).length;
console.log(`kontroller: ${nOk}/${checks.length} geçti`);
console.log(errors.length ? 'HATALAR:\n' + errors.join('\n') : 'konsol hatası yok');
process.exit(errors.length ? 1 : 0);
