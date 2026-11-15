

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const groot = execSync('npm root -g').toString().trim();
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(groot, '@playwright', 'cli', 'node_modules', 'playwright-core'));
const out = process.env.SHOTS || path.join(dir, 'shots-v5'); fs.mkdirSync(out, { recursive: true });
const url = pathToFileURL(path.join(dir, '..', 'index.html')).href + '#test';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null, want = n => !ONLY || ONLY.includes(n);
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: (process.platform === 'linux' || process.env.YAZILIM_CIZICI === '1') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
const errors = [], checks = [];
const t0 = Date.now(), lap = m => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)} sn] ${m}`);
const ok = (cond, msg) => { checks.push([!!cond, msg]); if (!cond) { errors.push('KONTROL: ' + msg); lap('✗ ' + msg); } else lap('✓ ' + msg); };
const ev = (page, f, a) => page.evaluate(f, a);
const settle = (page, ms) => page.waitForTimeout(Math.max(ms || 0, 500));
const until = (page, f, a, ms) => page.waitForFunction(f, a, { timeout: ms || 20000 }).then(() => true, () => false);
const clock = page => ev(page, () => { const u = window.__uu; return u.UI.s.t + u.UI.acc; });
const shot = async (page, n) => { try { await page.screenshot({ path: path.join(out, n + '.png'), timeout: 120000 }); } catch (e) { lap('ekran görüntüsü alınamadı: ' + n); } };
const words = t => String(t || '').trim().split(/\s+/).filter(Boolean).length;


let REAL = false; const skipped = [];
const okS = (cond, msg) => { if (REAL) { skipped.push(msg); lap('– atlandı (gerçek modül; v5-butun denetler): ' + String(msg).slice(0, 90)); return; } ok(cond, msg); };

async function open(w, h, touch) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'tr-TR', hasTouch: !!touch, isMobile: !!touch });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_INTERNET|net::|GPU stall|WebGL-/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message + '\n' + e.stack));
  await page.goto(url); await page.waitForTimeout(900);
  await ev(page, () => { try { localStorage.clear(); } catch (e) {   } }); await page.reload(); await page.waitForTimeout(900);
  await ev(page, () => { window.__uu.egitimAtla(true); window.__uu.hizliSoru(false); });
  return page;
}
async function startGame(page, touch) {
  await ev(page, () => document.querySelector('[data-act="start"]').click());
  await until(page, () => window.__uu.UI.s && (window.__uu.UI.modal === 'creator' || !window.__uu.UI.modal), null, 30000);
  await ev(page, () => { const u = window.__uu; if (u.UI.modal === 'creator') u.crGo(); });
  await settle(page, 800);
  await ev(page, () => { const u = window.__uu; if (u.tut()) u.endTutorial(true); if (u.UI.modal) u.ACT.closeModal(); });
  await restPrep(page);
}
const restPrep = page => ev(page, () => { const u = window.__uu; { const I = u.mod('ISKART'); if (I && !I.__v5stub && I.quickOpen && I.quickOpen()) { const o = document.querySelector('.ik-q-opt[data-ok="1"]'); if (o) o.click(); const g = document.querySelector('.ik-q-go'); if (g) g.click(); } }   u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); u.UI.s.pending.length = 0; u.UI.chapUntil = 0; const c = document.getElementById('chapter'); if (c) c.hidden = true; document.querySelectorAll('.toast').forEach(t => t.remove()); const sc = document.getElementById('scanCard'); if (sc) sc.hidden = true; if (u.UI.modal) u.ACT.closeModal(); u.refresh(true); });


const stubs = page => ev(page, () => {
  const W = window, u = W.__uu; W.__uuMods = W.__uuMods || {};
  const V = W.__v5 = { q: [], qRet: false, qOpen: false, hr: { t: 0, big: false, hid: null }, og: { t: 0, fresh: 2, seen: 0 }, po: null, bo: {}, real: {} };
  const IK = u.mod('ISKART');
  V.real.quick = !!(IK && typeof IK.quick === 'function' && !IK.__v5stub);
  if (IK && !V.real.quick) { IK.__v5stub = true; IK.quick = (act, ctx) => { V.q.push({ act, bid: ctx && ctx.b ? ctx.b.id : ctx && ctx.bid, k: ctx && ctx.k }); return V.qRet; }; IK.quickOpen = () => V.qOpen; }
  V.real.harita = !!u.mod('HARITA');
  if (!V.real.harita) W.__uuMods.HARITA = {
    tick() { V.hr.t++; let e = document.getElementById('hrMini'); if (!e) { e = document.createElement('div'); e.id = 'hrMini'; e.style.cssText = 'position:absolute;background:rgba(80,160,255,.35);border:2px solid #7cf;border-radius:12px;pointer-events:none'; document.getElementById('hud').appendChild(e); }
      const ph = innerHeight <= 460, sz = ph ? 76 : 132; Object.assign(e.style, { width: sz + 'px', height: sz + 'px', top: (ph ? 6 : 12) + 'px', right: (ph ? 8 : 16) + 'px' }); e.hidden = !!V.hr.hid; },
    toggle(on) { V.hr.big = on === undefined ? !V.hr.big : !!on; }, big() { return V.hr.big; }, hide(v) { V.hr.hid = !!v; },
  };
  V.real.ogret = !!u.mod('OGRET');
  if (!V.real.ogret) W.__uuMods.OGRET = { tick() { V.og.t++; }, open() { return false; }, notebook() { return '<p class="og-test">3/24 · Defter sahtesi</p>'; }, count() { return { have: 3, total: 24 }; }, fresh() { return V.og.fresh; }, seen() { V.og.fresh = 0; V.og.seen++; } };
  V.real.po = u.ext('powerOutlook');
  if (!V.real.po) W.__uuMods.powerOutlook = () => V.po;
  if (!u.ext('buildOutlook')) W.__uuMods.buildOutlook = (s, k) => ({ net: 1, warn: V.bo[k] || null });
  if (typeof TEACH === 'undefined') W.__uuMods.TEACH = [{ id: 'b_gunes', on: 'build:gunes', t: { tr: 'Güneş paneli', en: 'Solar panel' }, say: { tr: 'Güneş paneli güneş ışığını elektriğe çevirir.', en: 'A solar panel turns sunlight into power.' } }];
  u.modTick();
  return V.real;
});
const brokenB = page => ev(page, () => {
  const u = window.__uu, s = u.UI.s; let b = s.b.find(o => o.k !== 'hub' && o.left === 0);
  if (!b) { const sp = u.bestSpot(s, 'gunes'); const r = u.build(s, 'gunes', sp.x, sp.y); b = r.b; }
  b.left = 0; b.broken = true; s.res.parca = 40; return b.id;
});


if (want('masa')) {
  const page = await open(1366, 768);
  await startGame(page);
  if (!(await ev(page, () => window.__uu.UI.gl))) { ok(false, 'sahne yok'); }
  else {
    const real = await stubs(page);
    lap('gerçek modüller: ' + JSON.stringify(real)); REAL = !!(real.quick && real.harita && real.ogret && real.po);
    await settle(page, 400);


    {
      await ev(page, () => { const u = window.__uu; u.UI.egBack = 'real'; u.UI.realS = u.UI.s; u.UI.egWorld = 'ay'; u.UI.egLevel = 'kasif'; u.UI.egQuit = false; u.UI.train = true; u.egFinish(true); });
      await until(page, () => window.__uu.pauseReason() === 'egdone', null, 15000);
      const k = await ev(page, () => { const e = document.getElementById('egDone'), r = e.getBoundingClientRect(); return { vis: !e.hidden && r.width >= innerWidth - 2 && r.height >= innerHeight - 2, h: (e.querySelector('h2') || {}).textContent, li: [...e.querySelectorAll('.egd-l li')].map(x => x.textContent.trim()), now: (e.querySelector('.egd-now b') || {}).textContent, go: (document.getElementById('egDoneGo') || {}).textContent.trim(), goH: document.getElementById('egDoneGo').getBoundingClientRect().height, hud: getComputedStyle(document.getElementById('hud')).visibility, hr: window.__v5.hr.hid }; });
      ok(k.vis && k.h === 'Eğitim bitti!', 'K10: egFinish(true) → tam ekran "Eğitim bitti!" ' + JSON.stringify(k));
      ok(k.li.length >= 2 && k.li.length <= 5 && k.li.every(t => words(t) <= 6), 'K10: "Öğrendiklerin" 2–5 satır (v5f: summary en çok 5), her biri ≤ 6 kelime ' + JSON.stringify(k.li));
      ok(k.now && words(k.now) <= 10, 'K10: "Şimdi gerçek görev" ≤ 10 kelime: ' + k.now);
      ok(/Göreve başla/.test(k.go) && k.goH >= 44, 'K10: tek büyük düğme "Göreve başla" (' + k.goH + ' px)');
      okS(k.hud === 'hidden' && k.hr === true, 'K10: HUD ve mini harita gizli ' + JSON.stringify({ hud: k.hud, hr: k.hr }));
      await shot(page, 'v5-01-egitim-bitti');
      const c0 = await clock(page); await page.waitForTimeout(1500);
      ok(await clock(page) === c0, 'K10: ekran açıkken saat durur');
      await page.keyboard.press('Escape'); await settle(page, 300);
      await page.mouse.click(30, 30); await settle(page, 300);
      ok(await ev(page, () => !!window.__uu.egDone() && !document.getElementById('egDone').hidden && !window.__uu.UI.modal), 'K10: Esc ve dışına tıklamak ekranı kapatmaz, menü açılmaz');
      await page.click('#egDoneGo'); await settle(page, 600);
      const a = await ev(page, () => { const u = window.__uu; return { open: !!u.egDone(), hid: document.getElementById('egDone').hidden, hud: getComputedStyle(document.getElementById('hud')).visibility, sub: (u.subState().text || '') + ' ' + u.UI.subQ.map(q => q.text).join(' ') }; });
      ok(!a.open && a.hid && a.hud === 'visible', 'K10: düğmeyle gerçek göreve geçilir ' + JSON.stringify({ open: a.open, hud: a.hud }));
      ok(!/Eğitim bitti/.test(a.sub), 'K10: "Eğitim bitti. Şimdi gerçek görev!" altyazısı tekrarlanmaz: ' + a.sub.slice(0, 80));

      await ev(page, () => window.__uu.egDoneShow(false, true)); await settle(page, 300);
      const sk = await ev(page, () => { const e = document.getElementById('egDone'); return { h: (e.querySelector('h2') || {}).textContent, sub: (e.querySelector('.egd-sub') || {}).textContent, list: !!e.querySelector('.egd-l'), again: (e.querySelector('.egd-again') || {}).textContent }; });
      ok(sk.h === 'Eğitimi geçtin.' && /Gerçek görev başlıyor/.test(sk.sub) && !sk.list && sk.again, 'K10: atlanınca kısa hâli + Tablet hatırlatması ' + JSON.stringify(sk));
      await page.keyboard.press('Space'); await settle(page, 300);
      ok(await ev(page, () => !window.__uu.egDone()), 'K10: Boşluk düğmeye basar');
      await ev(page, () => window.__uu.egDoneShow(true, false)); await settle(page, 300);
      ok(/Görevime dön/.test(await ev(page, () => document.getElementById('egDoneGo').textContent)), 'K10: kayıtlı göreve dönülürken "Görevime dön"');
      await page.keyboard.press('Enter'); await settle(page, 300);
      ok(await ev(page, () => !window.__uu.egDone()), 'K10: Enter düğmeye basar');
      await restPrep(page);
    }


    {
      const bid = await brokenB(page);
      await ev(page, () => { const u = window.__uu; u.hizliSoru(true); window.__v5.q.length = 0; window.__v5.qRet = true; });
      const r1 = await ev(page, bid => { const u = window.__uu, s = u.UI.s, b = s.b.find(o => o.id === bid), p0 = s.res.parca; const ret = u.doRepair(bid); return { ret, broken: b.broken, spent: p0 - s.res.parca, q: window.__v5.q.slice() }; }, bid);
      okS(r1.ret && r1.broken && r1.spent === 0 && r1.q.length === 1 && r1.q[0].act === 'repair' && r1.q[0].bid === bid, 'K11: ISKART.quick("repair", { b }) true → repair() çağrılmaz (onarımı ISKART yapar) ' + JSON.stringify(r1));

      await ev(page, () => { window.__v5.qOpen = true; });
      await until(page, () => window.__uu.pauseReason() === 'quick', null, 10000);
      const c1 = await clock(page); await page.waitForTimeout(1200);
      ok(await ev(page, () => window.__uu.pauseReason()) === 'quick' && await clock(page) === c1, 'K13: hızlı soru açıkken pauseReason "quick", saat durur');
      await page.keyboard.press('Escape'); await page.keyboard.press('KeyB'); await page.keyboard.press('KeyR'); await settle(page, 300);
      ok(await ev(page, () => !window.__uu.UI.modal && !window.__uu.UI.plan), 'K13: hızlı soru açıkken Esc menü açmaz, B/R kısayolları çalışmaz');
      ok(await ev(page, () => { const b = document.getElementById('banner'); return b.hidden || !/Durdu/.test(b.textContent); }), 'K13: "quick" nedeniyle "Zaman durdu" afişi yok');

      await ev(page, bid => { const u = window.__uu, s = u.UI.s, b = s.b.find(o => o.id === bid); b.broken = false; s.res.parca -= 2; document.querySelectorAll('.toast').forEach(t => t.remove()); window.__v5.qOpen = false; }, bid);
      await until(page, () => document.querySelectorAll('.toast').length > 0, null, 10000);
      const t1 = await ev(page, () => [...document.querySelectorAll('.toast')].map(t => t.textContent));
      okS(t1.filter(t => /onar/i.test(t)).length === 1, 'K11: soru kapanınca onarım bildirimi bir kez ' + JSON.stringify(t1));

      await ev(page, bid => { const u = window.__uu, s = u.UI.s, b = s.b.find(o => o.id === bid); b.broken = true; window.__v5.qRet = false; window.__v5.q.length = 0; document.querySelectorAll('.toast').forEach(t => t.remove()); }, bid);
      const r2 = await ev(page, bid => { const u = window.__uu, s = u.UI.s, b = s.b.find(o => o.id === bid), p0 = s.res.parca; u.doRepair(bid); return { broken: b.broken, spent: p0 - s.res.parca, q: window.__v5.q.length, toasts: [...document.querySelectorAll('.toast')].map(t => t.textContent).filter(t => /onar/i.test(t)).length }; }, bid);
      okS(!r2.broken && r2.spent > 0 && r2.q === 1 && r2.toasts === 1, 'K11: quick false → bugünkü repair() yolu, bildirim bir kez ' + JSON.stringify(r2));

      await until(page, () => { const e = document.getElementById('spendTmp'); return !!e && !e.hidden; }, null, 20000);
      const tmp = await ev(page, () => { const e = document.getElementById('spendTmp'), f = [...document.querySelectorAll('.spend-float')].map(x => x.textContent), a = document.getElementById('acts').getBoundingClientRect(); const r = e ? e.getBoundingClientRect() : null; return { vis: !!e && !e.hidden, txt: e ? e.textContent : '', f, shake: !!e && e.classList.contains('spend-shake'), above: r ? r.bottom <= a.top + 1 : false }; });
      ok(tmp.vis && /yedek parça \d+/.test(tmp.txt) && tmp.f.some(x => /^−\d/.test(x)) && tmp.shake && tmp.above, 'K14: Kâşif\'te onarımda eylem düğmelerinin üstünde geçici parça çipi + "−n" + sallanma ' + JSON.stringify(tmp));
      await shot(page, 'v5-02-onarim-parca');
      const tA = Date.now(); await until(page, () => { const e = document.getElementById('spendTmp'); return !e || e.hidden; }, null, 15000);
      const tGone = (Date.now() - tA) / 1000;
      ok(await ev(page, () => { const e = document.getElementById('spendTmp'); return !!e && e.hidden; }) && tGone <= 4, 'K14: geçici çip ~2,5 sn sonra kaybolur (' + tGone.toFixed(1) + ' sn)');

      await ev(page, bid => { const u = window.__uu, s = u.UI.s, b = s.b.find(o => o.id === bid); b.broken = true; window.__v5.q.length = 0; u.hizliSoru(false); u.doRepair(bid); }, bid);
      ok(await ev(page, () => window.__v5.q.length === 0), 'test kancası __uu.hizliSoru(false) → ISKART.quick çağrılmaz');
      await ev(page, () => window.__uu.hizliSoru(true));
    }


    {
      await ev(page, () => { const u = window.__uu, s = u.UI.s; s.res.malzeme = 300; delete s.fx.spend; window.__v5.q.length = 0; window.__v5.qRet = false; u.enterPlan('gunes'); });
      await settle(page, 600); await until(page, () => window.__v5.hr.hid === true, null, 15000);
      const d0 = await ev(page, () => { const g = id => { const e = document.getElementById(id); return e && !e.hidden && e.getBoundingClientRect().width > 0 ? e.querySelector('b').textContent : null; }; const top = document.querySelector('#drawer .dr-top'), res = document.getElementById('drRes'); return { m: g('dr-malzeme'), p: g('dr-parca'), g: g('dr-guc'), core: g('dr-core'), inTop: !!top && !!res && top.contains(res), nextToTabs: !!res && res.previousElementSibling && res.previousElementSibling.classList.contains('gchips'), have: [...document.querySelectorAll('#drawer .dcard.sel .dc-have')].map(e => e.textContent), hr: window.__v5.hr.hid, pr: Math.floor(window.__uu.UI.s.res.parca) }; });
      ok(d0.inTop && d0.nextToTabs && d0.m === '300' && (d0.p === null || d0.p === String(d0.pr)) && /^[+−]\d/.test(d0.g || ''), 'K14: çekmece şeridinde sekmelerin yanında #drRes (malzeme 300, Kâşif\'te parça yalnız > 0 ise (v5f), elektrik dengesi işaretli) ' + JSON.stringify(d0));
      ok(d0.have.length && /^\d+ \/ 300$/.test(d0.have[0].trim()), 'K14: seçili kartta maliyet / eldeki: ' + JSON.stringify(d0.have));
      okS(d0.hr === true, 'K16: inşa görünümünde mini harita gizli (HARITA.hide(true))');
      const pl = await ev(page, () => { const u = window.__uu, s = u.UI.s, sp = u.bestSpot(s, 'gunes'), m0 = s.res.malzeme; const okp = u.placeAt({ tx: sp.x, ty: sp.y }); return { okp, cost: m0 - s.res.malzeme, chip: document.querySelector('#dr-malzeme b').textContent, q: window.__v5.q.slice(), bid: u.UI.lastB && u.UI.lastB.id }; });
      ok(pl.okp && pl.chip === String(300 - pl.cost), 'K14: yerleştirince #dr-malzeme anında azalır ' + JSON.stringify(pl));
      okS(pl.q.length === 1 && pl.q[0].act === 'build' && pl.q[0].k === 'gunes' && pl.q[0].bid === pl.bid, 'K12: başarılı yerleştirmeden sonra ISKART.quick("build", { bid, k }) ' + JSON.stringify(pl.q));
      await until(page, () => document.querySelectorAll('.spend-float').length > 0, null, 10000);
      const fl = await ev(page, () => ({ f: [...document.querySelectorAll('.spend-float')].map(x => x.textContent), shake: document.getElementById('dr-malzeme').classList.contains('spend-shake') }));
      ok(fl.f.includes('−' + pl.cost) && fl.shake, `K14: yüzen "−${pl.cost}" ve #dr-malzeme sallanır ` + JSON.stringify(fl));
      await shot(page, 'v5-03-insa-harcama');

      await page.waitForTimeout(1800);
      await ev(page, () => { const s = window.__uu.UI.s; s.fx.spend = [{ r: 'malzeme', n: -10, why: 'build', t: s.t }, { r: 'malzeme', n: -5, why: 'build', t: s.t }, { r: 'malzeme', n: -1, why: 'ceza', t: s.t }, { r: 'malzeme', n: 20, why: 'iade', t: s.t }]; });
      await until(page, () => document.querySelectorAll('.spend-float').length >= 1, null, 10000);
      const fq = await ev(page, () => ({ f: [...document.querySelectorAll('.spend-float')].map(x => x.textContent + (x.classList.contains('ceza') ? '#ceza' : '')), left: window.__uu.UI.s.fx.spend.length }));
      ok(fq.f.length === 1 && fq.f[0] === '+4' && fq.left === 0, 'K14 (v5f: kaynak başına tek gösterge): s.fx.spend kuyruğu boşaltılır; aynı kaynak toplanır (−10 −5 −1 +20 = +4) ' + JSON.stringify(fq));

      await ev(page, () => window.__uu.exitPlan()); await page.waitForTimeout(1700);
      await ev(page, () => { const s = window.__uu.UI.s; s.fx.spend = [{ r: 'malzeme', n: -7, why: 'repair', t: s.t }]; });
      await until(page, () => [...document.querySelectorAll('.spend-float')].some(x => x.textContent === '−7'), null, 10000);
      ok(await ev(page, () => document.getElementById('kurM').classList.contains('spend-shake')), 'K14: inşa dışında malzeme eksilmesi Kur düğmesindeki sayıda (#kurM) sallanır');
      await ev(page, () => { delete window.__uu.UI.s.fx.spend; });
    }


    {
      await restPrep(page);
      const pw = () => ev(page, () => { window.__uu.pwTick(); const e = document.getElementById('pwWarn'); return { vis: !e.hidden && e.getBoundingClientRect().height > 0, c: e.dataset.c, m: (e.querySelector('.pw-m') || {}).textContent || '', bar: (() => { const i = e.querySelector('.pw-bar > i'); return i ? i.style.width : null; })(), fix: (e.querySelector('.pw-fix') || {}).textContent || '', guc: (document.querySelector('#g-guc small') || {}).textContent }; });
      await ev(page, () => { window.__v5.po = { gen: 4, need: 9, stored: 30, cap: 100, net: -5, hoursLeft: 6.4, over: true, night: null }; });
      let p = await pw();
      okS(p.vis && p.c === 'bad' && /Çok yapı kurdun/.test(p.m) && words(p.m) <= 12, 'K15: over → "Çok yapı kurdun: elektrik yetmiyor. Güneş paneli ekle." ' + JSON.stringify(p));
      okS(p.guc === 'Batarya 6 saat yeter', 'K15: #g-guc üstünde "Batarya {x} saat yeter": ' + p.guc);
      await ev(page, () => { window.__v5.po = { gen: 9, need: 6, stored: 60, cap: 100, net: 3, hoursLeft: Infinity, over: false, night: { inH: 50, lenH: 96, lastsH: 40, short: true, addBat: 2, addGen: null } }; });
      p = await pw();
      okS(p.vis && /Uzun gece 3 gün sonra/.test(p.m) && words(p.m) <= 12 && p.bar === '42%' && /2 batarya daha kur/.test(p.fix), 'K15: yaklaşan gece → metin + çubuk (yeteceği kısım dolu) + çözüm ' + JSON.stringify(p));
      okS(p.guc === 'Elektrik yetiyor', 'K15: net ≥ 0 iken #g-guc: ' + p.guc);
      await shot(page, 'v5-04-enerji-uyari');
      await ev(page, () => { const s = window.__uu.UI.s; s.fx.pwarn = [{ kind: 'night', k: 'sera', t: s.t }]; });
      p = await pw();
      okS(/Bu yapılarla uzun gecede elektrik yetmez/.test(p.m) && await ev(page, () => window.__uu.UI.s.fx.pwarn.length === 0), 'K15: s.fx.pwarn kuyruğu boşaltılır, "night" metni ' + p.m);
      await page.waitForTimeout(2000); p = await pw();
      okS(p.vis, 'K15: uyarı kalıcı (açık sürdükçe ekranda)');

      await ev(page, () => { const V = window.__v5; for (const k of ['gunes', 'batarya', 'sera', 'oksijen', 'su', 'yasam', 'geri', 'maden', 'spor', 'lab', 'reaktor']) V.bo[k] = 'gece'; V.bo.sera = 'gunduz'; window.__uu.UI.boC = null; window.__uu.enterPlan(); window.__uu.refresh(true); });
      await settle(page, 500); p = await pw();
      const tags = await ev(page, () => [...document.querySelectorAll('#drawer .dc-pw')].map(e => e.dataset.c + ':' + e.textContent.trim()));
      okS(p.vis, 'K15: uyarı inşa görünümünde de görünür');
      okS(tags.some(t => t === 'warn:Gece yetmez') && (tags.some(t => t === 'bad:Elektrik yetmez') || !(await ev(page, () => !!document.querySelector('#drawer [data-v="sera"] .dc-cost')))), 'K15: kart etiketi "Elektrik yetmez" (kırmızı) / "Gece yetmez" (turuncu) ' + JSON.stringify(tags.slice(0, 4)));
      await shot(page, 'v5-05-insa-enerji');
      await ev(page, () => { window.__v5.bo = {}; window.__uu.UI.boC = null; window.__uu.exitPlan(); });

      await ev(page, () => { window.__v5.po = { gen: 9, need: 6, stored: 90, cap: 200, net: 3, hoursLeft: Infinity, over: false, night: { inH: 40, lenH: 96, lastsH: 96, short: false, addBat: 0, addGen: null } }; });
      p = await pw();
      okS(p.vis && p.c === 'good' && p.m === 'Uzun geceye hazırsın', 'K15: açık kapanınca yeşil "Uzun geceye hazırsın" ' + JSON.stringify(p));
      await page.waitForTimeout(4400); p = await pw();
      okS(!p.vis, 'K15: hazır onayı ~4 sn sonra kaybolur');
      await ev(page, () => { window.__v5.po = { gen: 9, need: 6, stored: 90, cap: 200, net: 3, hoursLeft: Infinity, over: false, night: null }; });
    }


    {
      await restPrep(page);
      okS(await ev(page, () => window.__v5.hr.t > 0 && window.__v5.og.t > 0), 'K16: her karede HARITA.tick ve OGRET.tick');
      await page.keyboard.press('KeyM'); await settle(page, 300); await until(page, () => window.__uu.pauseReason() === 'map', null, 15000);
      okS(await ev(page, () => window.__v5.hr.big && window.__uu.pauseReason() === 'map'), 'K16/K13: M → HARITA.toggle(), büyük harita açıkken pauseReason "map"');
      await page.keyboard.press('Escape'); await settle(page, 300);
      ok(await ev(page, () => !window.__v5.hr.big && !window.__uu.UI.modal), 'büyük harita Esc ile kapanır, menü açılmaz');
      const badge = await ev(page, () => { const b = document.getElementById('pdaBadge'); return !!b && !b.hidden; });
      ok(badge, 'K16: yeni Bilgi varken Tablet düğmesinde nokta (OGRET.fresh())');
      await page.click('#menuBtn'); await settle(page, 400); await until(page, () => window.__v5.hr.hid === true, null, 15000);
      const tb = await ev(page, () => ({ map: !!document.getElementById('mapBtn'), radar: !!document.getElementById('radar'), tab: !!document.querySelector('.ptab[data-v="defter"]'), dot: !!document.querySelector('.ptab[data-v="defter"] .dot'), hr: window.__v5.hr.hid }));
      ok(!tb.map && !tb.radar, 'K16: Tablet\'te harita yok (#mapBtn, #radar) ' + JSON.stringify(tb));
      okS(tb.tab && tb.dot && tb.hr === true, 'K16: Tablet\'te "Defterim" sekmesi noktalı; Tablet açıkken mini harita gizli ' + JSON.stringify(tb));
      await page.click('.ptab[data-v="defter"]'); await settle(page, 400);
      okS(await ev(page, () => !!document.querySelector('#pdaBody .og-test') && window.__v5.og.seen >= 1 && window.__v5.og.fresh === 0), 'K16: Defterim içeriği OGRET.notebook(), açılınca OGRET.seen()');
      await shot(page, 'v5-06-defterim');
      await ev(page, () => window.__uu.closePda()); await settle(page, 300);

      const tl = await ev(page, () => { const u = window.__uu, s = u.UI.s, b = s.b.find(o => o.k === 'gunes'); if (!b) return { none: true }; const id = (u.teachOf('gunes') || (typeof TEACH !== 'undefined' ? TEACH : window.__uuMods.TEACH).find(t => t.on === 'build:gunes')).id;   s.learn = s.learn || {}; delete s.learn[id]; u.modalBuilding(b.id); const a = !!document.querySelector('#modalBox .m-teach'); u.ACT.closeModal(); s.learn[id] = s.t; u.modalBuilding(b.id); const t = (document.querySelector('#modalBox .m-teach') || {}).textContent || ''; u.ACT.closeModal(); return { before: a, t }; });
      ok(!tl.before && words(tl.t) >= 3 && words(tl.t) <= 12, 'K16: yapı kartında build:<k> Bilgisi yalnız öğrenildiyse: ' + JSON.stringify(tl));

      const ov = await ev(page, () => {
        const u = window.__uu; document.getElementById('app').dataset.level = 'muhendis'; u.refresh(true);
        for (let i = 0; i < 2; i++) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = 'Deneme bildirimi ' + i; document.getElementById('toasts').appendChild(t); }
        const sc = document.getElementById('scanCard'); sc.innerHTML = '<b>Deneme</b><p>Tarama kartı</p>'; sc.hidden = false;
        const R = id => { const e = document.getElementById(id); const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
        const m = R('hrMini'), to = R('toasts'), s = R('scanCard'), tr = [...document.querySelectorAll('#hudTR .mchip')].map(e => e.getBoundingClientRect()).filter(r => r.width);
        const hit = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
        const res = { map: m, toastsTop: to.t, scanTop: s.t, toastHit: hit(m, to), scanHit: hit(m, s), trHit: tr.some(r => hit(m, { l: r.left, t: r.top, r: r.right, b: r.bottom })), trN: tr.length };
        document.getElementById('app').dataset.level = 'kasif'; sc.hidden = true; document.querySelectorAll('.toast').forEach(t => t.remove());
        return res;
      });
      ok(!ov.toastHit && !ov.scanHit && !ov.trHit && ov.trN > 0, 'K16 (1366×768): bildirimler, tarama kartı ve Mühendis çipleri mini haritayla çakışmıyor ' + JSON.stringify(ov));

      const rest = await ev(page, () => ['pwWarn', 'spendTmp', 'egDone', 'drRes'].filter(id => { const e = document.getElementById(id); if (id === 'pwWarn' && e && e.dataset.kind === 'ok') return false;   return e && !e.hidden && e.getBoundingClientRect().width > 0 && e.getClientRects().length; }));
      const pwD = rest.includes('pwWarn') ? await ev(page, () => { const e = document.getElementById('pwWarn'), u = window.__uu, o = u.outlook ? u.outlook() : null; return e.dataset.kind + ':' + e.textContent.trim().slice(0, 60) + ':' + JSON.stringify(o && o.night && { s: o.night.short, r: o.night.ready, i: o.night.inH }) + ':' + (u.UI.poOver !== undefined); }) : '';
      ok(!rest.length, 'dinlenme anı: v5 öğeleri (#pwWarn, #spendTmp, #egDone, #drRes) görünmüyor ' + JSON.stringify(rest) + ' ' + pwD);
      await shot(page, 'v5-07-dinlenme');
    }
  }
  await page.context().close();
}


if (want('mobil')) {
  const page = await open(844, 390, true);
  await startGame(page, true);
  if (await ev(page, () => window.__uu.UI.gl)) {
    await stubs(page); await settle(page, 500);
    const ov = await ev(page, () => {
      const u = window.__uu; u.modTick(); document.getElementById('app').dataset.level = 'muhendis'; u.refresh(true);
      for (let i = 0; i < 2; i++) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = 'Deneme ' + i; document.getElementById('toasts').appendChild(t); }
      const sc = document.getElementById('scanCard'); sc.innerHTML = '<b>Deneme</b><p>Tarama kartı</p>'; sc.hidden = false;
      const R = id => { const r = document.getElementById(id).getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
      const m = R('hrMini'), to = R('toasts'), s = R('scanCard'), tr = [...document.querySelectorAll('#hudTR .mchip')].map(e => e.getBoundingClientRect()).filter(r => r.width);
      const hit = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
      const res = { map: m, toastHit: hit(m, to), scanHit: hit(m, s), trHit: tr.some(r => hit(m, { l: r.left, t: r.top, r: r.right, b: r.bottom })), trOut: tr.some(r => r.left < 0) };
      document.getElementById('app').dataset.level = 'kasif'; sc.hidden = true; document.querySelectorAll('.toast').forEach(t => t.remove());
      return res;
    });
    ok(!ov.toastHit && !ov.scanHit && !ov.trHit && !ov.trOut, 'K16 (844×390): mini haritayla çakışma yok ' + JSON.stringify(ov));

    await ev(page, () => window.__uu.egDoneShow(true, true)); await settle(page, 400);
    const eg = await ev(page, () => { const e = document.getElementById('egDoneGo'), b = e.getBoundingClientRect(); return { h: e.offsetHeight, inView: b.bottom <= innerHeight && b.top >= 0 }; });
    ok(eg.h >= 44 && eg.inView, 'K10 (844×390): "Göreve başla" ekranda ve ≥ 44 px ' + JSON.stringify(eg));
    await shot(page, 'v5-m1-egitim-bitti');
    await page.tap('#egDoneGo'); await settle(page, 300);

    await ev(page, () => { const u = window.__uu; window.__v5.po = { gen: 4, need: 9, stored: 30, cap: 100, net: -5, hoursLeft: 6, over: false, night: { inH: 30, lenH: 96, lastsH: 30, short: true, addBat: 3, addGen: null } }; u.enterPlan('gunes'); u.pwTick(); });
    await settle(page, 600);
    const dm = await ev(page, () => {
      const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, h: r.height }; };
      const chips = [...document.querySelectorAll('#drRes .drc')].filter(e => !e.hidden).map(R), done = R(document.querySelector('#drawer .dr-top .primary')), pw = R(document.getElementById('pwWarn'));
      const hit = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
      return { n: chips.length, minH: Math.min(...chips.map(c => c.h)), inView: chips.every(c => c.l >= 0 && c.r <= innerWidth), doneHit: chips.some(c => hit(c, done)), pwIn: pw.l >= 0 && pw.r <= innerWidth && pw.b <= innerHeight, pwH: pw.h };
    });
    ok(dm.n >= 2 && dm.minH >= 40 && dm.inView && !dm.doneHit, 'K14 (844×390): #drRes çipleri ekranda, ≥ 40 px (v5f), "Bitti"ye binmiyor ' + JSON.stringify(dm));
    ok(dm.pwIn, 'K15 (844×390): enerji uyarısı ekrana sığıyor ' + JSON.stringify(dm));
    await shot(page, 'v5-m2-insa');
  } else ok(false, 'telefon: sahne yok');
  await page.context().close();
}


const R5 = `const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
  const hit = (a, b) => !!a && !!b && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;`;

async function v5fDrawer(page, tag) {
  return ev(page, src => {
    const { R, hit } = new Function(src + ' return { R, hit };')();
    const u = window.__uu, s = u.UI.s, top = document.querySelector('#drawer .dr-top'), tabs = [...document.querySelectorAll('#drawer .gchip')], tb = R(document.querySelector('#drawer .gchips'));
    const chips = [...document.querySelectorAll('#drRes .drc')].filter(e => !e.hidden && e.getClientRects().length);
    const done = R(document.querySelector('#drawer .dr-top .primary'));
    const cr = chips.map(R), first = cr[0];
    return { tag: 0, n: chips.length, ids: chips.map(e => e.id), gap: first ? Math.round(first.l - tb.r) : null, doneRight: done.r >= Math.max(...cr.map(c => c.r)), doneHit: cr.some(c => hit(c, done)),
      tabsHit: cr.some(c => hit(c, tb)), minH: Math.min(...cr.map(c => c.h)), minF: Math.min(...chips.map(e => parseFloat(getComputedStyle(e.querySelector('b')).fontSize))), inView: cr.every(c => c.l >= 0 && c.r <= innerWidth),
      tabMinH: Math.min(...tabs.map(t => t.getBoundingClientRect().height)), doneH: done.h, txt: Object.fromEntries(chips.map(e => [e.id, e.querySelector('b').textContent])),
      res: { m: Math.floor(s.res.malzeme), p: Math.floor(s.res.parca) }, tabsScroll: getComputedStyle(document.querySelector('#drawer .gchips')).overflowX };
  }, R5);
}
async function v5fChecks(page, W) {
  const P = `(${W}) `;

  await ev(page, () => { const u = window.__uu, s = u.UI.s; s.res.malzeme = 300; s.res.parca = 0; delete u.UI.poOver; u.enterPlan('gunes'); });
  await settle(page, 700);
  let d = await v5fDrawer(page);
  ok(d.ids.join() === 'dr-malzeme,dr-guc,dr-o2,dr-su,dr-gida', P + 'P1-1: çip sırası Malzeme, Elektrik, Hava, Su, Yemek (Kâşif, parça 0 → parça yok) ' + d.ids.join());
  ok(d.gap !== null && d.gap >= 0 && d.gap <= 16 && !d.tabsHit, P + 'P1-1: çipler son sekmenin hemen sağında (aralık ≤16 px) ' + d.gap);
  ok(d.doneRight && !d.doneHit && d.inView, P + 'P1-1: "Bitti" en sağda, çiplerle çakışmıyor, çipler ekranda');
  ok(d.minH >= 40 && d.minF >= 13, P + `P1-1: çip yüksekliği ≥40 (${d.minH}), yazı ≥13 px (${d.minF})`);
  ok(d.txt['dr-malzeme'] === String(d.res.m), P + 'P1-1: malzeme çipi s.res ile aynı ' + d.txt['dr-malzeme']);
  ok(/^[+−]\d+ (artıyor|eksik)$/.test(d.txt['dr-guc']), P + 'P1-1: elektrik çipi "+N artıyor" / "−N eksik": ' + d.txt['dr-guc']);
  ok(['dr-o2', 'dr-su', 'dr-gida'].every(id => /^(\d+|30\+) g$/.test(d.txt[id])), P + 'P1-1: Hava/Su/Yemek "N g" / "30+ g" ' + JSON.stringify([d.txt['dr-o2'], d.txt['dr-su'], d.txt['dr-gida']]));
  ok(d.tabsScroll === 'auto', P + 'P1-1: sekme şeridi yatay kayar');
  await ev(page, () => { const u = window.__uu; u.UI.s.res.parca = 7; u.refresh(true); }); await settle(page, 300);
  d = await v5fDrawer(page);
  ok(d.ids[1] === 'dr-parca' && d.txt['dr-parca'] === '7', P + 'P1-1: Kâşif\'te parça > 0 ise Yedek parça çipi ikinci ' + d.ids.join());
  await ev(page, () => { const u = window.__uu; u.UI.s.res.parca = 0; u.UI.poOver = { gen: 2, need: 4, net: -2, stored: 10, cap: 80, hoursLeft: 5, over: true, night: null }; u.refresh(true); }); await settle(page, 300);
  d = await v5fDrawer(page);
  ok(d.txt['dr-guc'] === '−2 eksik', P + 'P1-1: eksikte "−2 eksik" ' + d.txt['dr-guc']);

  const fl = await ev(page, src => {
    const { R, hit } = new Function(src + ' return { R, hit };')();
    const u = window.__uu, s = u.UI.s; document.querySelectorAll('.spend-float').forEach(x => x.remove());
    s.fx.spend = [{ r: 'malzeme', n: -10, why: 'build', t: s.t }, { r: 'malzeme', n: -2, why: 'build', t: s.t }]; u.spendTick();
    const fs = [...document.querySelectorAll('.spend-float')], chip = R(document.getElementById('dr-malzeme')), f = R(fs[0]);
    const ov = f && chip ? Math.max(0, Math.min(f.r, chip.r) - Math.max(f.l, chip.l)) / f.w : 0, vg = f && chip ? Math.round(chip.t - f.b) : null;
    const undo = document.getElementById('undoBtn'), uR = undo && !undo.hidden ? R(undo) : null;
    return { n: fs.length, txt: fs.map(x => x.textContent), ov: Math.round(ov * 100) / 100, vg, shake: document.getElementById('dr-malzeme').classList.contains('spend-shake'), undoHit: uR ? hit(f, uR) : false };
  }, R5);
  ok(fl.n === 1 && fl.txt[0] === '−12', P + 'P1-1: aynı harcama için tek gösterge "−12" ' + JSON.stringify(fl.txt));
  ok(fl.ov >= 0.5 && fl.vg != null && fl.vg >= -2 && fl.vg <= 10, P + 'E7: gösterge çiple yatayda hizalı, çipin hemen üstünde (sayıyı örtmez) ' + fl.ov + ' / ' + fl.vg);
  ok(fl.shake && !fl.undoHit, P + 'P1-1: çip sallanır, gösterge "Geri al"ın üstüne gelmez');
  await page.waitForTimeout(420);
  ok(await ev(page, () => document.getElementById('dr-malzeme').classList.contains('spend-shake')), P + 'P1-1: .spend-shake ≥400 ms kalır');
  const fl2 = await ev(page, () => { const u = window.__uu, s = u.UI.s; document.querySelectorAll('.spend-float').forEach(x => x.remove()); const c = document.getElementById('dr-malzeme'); c.classList.remove('spend-shake');
    s.fx.spend = [{ r: 'malzeme', n: -3, why: 'sure', t: s.t }]; u.spendTick(); const a = [...document.querySelectorAll('.spend-float')].map(x => x.textContent);
    document.querySelectorAll('.spend-float').forEach(x => x.remove()); c.classList.remove('spend-shake');
    s.fx.spend = [{ r: 'malzeme', n: 5, why: 'iade', t: s.t }]; u.spendTick(); const g = [...document.querySelectorAll('.spend-float')].map(x => x.textContent + ':' + x.dataset.c);
    return { a, g, shake: c.classList.contains('spend-shake') }; });
  ok(fl2.a.length === 1 && fl2.a[0] === '−3 süre doldu', P + 'P1-1: süre dolunca etiket "süre doldu" ' + JSON.stringify(fl2.a));
  ok(fl2.g[0] === '+5:pos' && !fl2.shake, P + 'P1-1: kazançta yeşil "+5", sallanma yok ' + JSON.stringify(fl2));
  await shot(page, 'v5f-' + W + '-insa');

  await ev(page, () => { const u = window.__uu; u.UI.poOver = { gen: 6, need: 4, net: 2, stored: 40, cap: 80, hoursLeft: Infinity, over: false, night: { inH: 50, lenH: 96, lastsH: 30, short: true, addBat: 3, addGen: null, plan: [{ kind: 'uretim', k: 'gunes', n: 2 }, { kind: 'batarya', k: 'batarya', n: 3 }], stop: null, ready: false } }; u.pwTick(); });
  await settle(page, 300);
  const pwo = await ev(page, src => {
    const { R, hit } = new Function(src + ' return { R, hit };')();
    const el = document.getElementById('pwWarn'), r = R(el), kids = [...el.querySelectorAll('.pw-m, .pw-fix')].map(R);
    const other = ['objective', 'hrMini', 'egShow'].map(id => document.getElementById(id)).filter(e => e && !e.hidden && e.getClientRects().length && getComputedStyle(e).display !== 'none').map(e => [e.id, R(e)]);
    return { vis: !el.hidden, w: r.w, sw: el.scrollWidth, cw: el.clientWidth, inside: kids.every(k => k.l >= r.l - 1 && k.r <= r.r + 1), hits: other.filter(([id, o]) => hit(o, r) && id !== 'objective').map(x => x[0]), objHit: other.some(([id, o]) => id === 'objective' && hit(o, r)) };
  }, R5);
  ok(pwo.vis && pwo.sw <= pwo.cw + 1 && pwo.inside && !pwo.hits.length && !pwo.objHit, P + 'P1-2: inşa kipinde enerji şeridi yazısı kutusundan taşmaz, hedef/harita/"Bana göster" ile çakışmaz ' + JSON.stringify(pwo));
  await ev(page, () => { const u = window.__uu; delete u.UI.poOver; u.exitPlan(); });
}
if (want('v5f')) {

  const page = await open(1366, 768);
  await startGame(page);
  if (!(await ev(page, () => window.__uu.UI.gl))) ok(false, 'v5f: sahne yok');
  else {
    await restPrep(page); await settle(page, 300);
    await v5fChecks(page, 'masa');

    const pw = async (po, extra) => ev(page, ([po, extra]) => { const u = window.__uu, s = u.UI.s; u.UI.poOver = po; if (extra === 'ariza') { let b = s.b.find(o => o.k === 'gunes') || s.b.find(o => o.k !== 'hub'); if (!b) { const sp = u.bestSpot(s, 'gunes'); b = u.build(s, 'gunes', sp.x, sp.y).b; b.left = 0; } b.broken = true; s.fx.pwarn.push({ kind: 'ariza', k: b.k, bid: b.id, t: s.t }); } u.pwTick();
      const el = document.getElementById('pwWarn'); return { vis: !el.hidden, m: (el.querySelector('.pw-m') || {}).textContent || '', fix: (el.querySelector('.pw-fix') || {}).textContent || '', c: el.dataset.c, guc: ((document.querySelector('#g-guc small') || {}).textContent || '') }; }, [po, extra || null]);
    const N = (o) => Object.assign({ gen: 6, need: 4, net: 2, stored: 40, cap: 80, hoursLeft: Infinity, over: false }, o);
    let p = await pw(N({ night: { inH: 50, lenH: 96, lastsH: 30, short: true, addBat: 3, addGen: null, plan: [{ kind: 'uretim', k: 'gunes', n: 2 }, { kind: 'batarya', k: 'batarya', n: 3 }], stop: { bid: 1, k: 'lab', gainH: 9 }, ready: false } }));
    ok(p.vis && p.m === 'Uzun gece 3 gün sonra. Elektriğin yetmeyecek!' && /Çözüm: 2 güneş paneli \+ 3 batarya kur$/.test(p.fix.trim()), 'P1-2: yaklaşan gece + plan → "Çözüm: 2 güneş paneli + 3 batarya kur" ' + JSON.stringify(p));
    ok(p.guc === 'Şimdi yetiyor, gece yetmez', 'P1-2: gösterge etiketi "Şimdi yetiyor, gece yetmez": ' + p.guc);
    p = await pw(N({ night: { inH: 50, lenH: 96, lastsH: 30, short: true, addBat: 3, addGen: null, plan: [], stop: { bid: 1, k: 'lab', gainH: 9 }, ready: false } }));
    ok(/Çözüm: Laboratuvar → Durdur$/.test(p.fix.trim()) || /Çözüm: .+ → Durdur$/.test(p.fix.trim()), 'P1-2: plan boşsa "Çözüm: <Yapı> → Durdur" ' + p.fix);
    p = await pw(N({ net: -3, hoursLeft: 20.6, night: { inH: 0, lenH: 60, lastsH: 20, short: true, addBat: 2, addGen: null, plan: [], stop: { bid: 1, k: 'lab', gainH: 9 }, ready: false } }));
    ok(p.m === 'Elektrik 20 saat sonra bitecek.' && /→ Durdur$/.test(p.fix.trim()) && !/panel|batarya/i.test(p.fix), 'P1-2: gece sürerken "Elektrik N saat sonra bitecek." + durdurma, panel/batarya önerilmez ' + JSON.stringify(p));
    p = await pw(N({ net: -1, over: true, hoursLeft: 30, night: null }));
    ok(p.m === 'Elektrik yetmiyor.' && /Çözüm: güneş paneli kur ya da bir yapıyı durdur$/.test(p.fix.trim()) && p.c === 'bad', 'P1-2: gündüz açığı metni ' + JSON.stringify(p));
    p = await pw(N({ night: null }), 'ariza');
    ok(/bozuk: elektrik azaldı\.$/.test(p.m) && /Çözüm: onar$/.test(p.fix.trim()), 'P1-2: arıza → "<Yapı> bozuk: elektrik azaldı." + "Çözüm: onar" ' + JSON.stringify(p));
    const tr = await ev(page, () => { const u = window.__uu, s = u.UI.s; s.train = true; u.pwTick(); const a = !document.getElementById('pwWarn').hidden; s.b.forEach(b => { b.broken = false; }); u.UI.poOver = { gen: 2, need: 4, net: -2, over: true, hoursLeft: 5, night: null }; u.pwTick(); const b = !document.getElementById('pwWarn').hidden; s.train = false; return { ariza: a, over: b }; });
    ok(tr.ariza && !tr.over, 'P1-2: eğitimde yalnız arıza gösterilir ' + JSON.stringify(tr));
    p = await pw(N({ night: { inH: 40, lenH: 96, lastsH: 120, short: false, addBat: 0, addGen: null, plan: [], stop: null, ready: true } }));
    const okT = await ev(page, () => Math.round((window.__uu.UI.pwOk - performance.now()) / 1000));
    ok(p.vis && p.m === 'Uzun geceye hazırsın ✓' && p.c === 'good' && okT >= 11 && okT <= 12, 'P1-2 (v5g E5): "Uzun geceye hazırsın ✓" bir kez, 12 sn ' + JSON.stringify(p) + ' ' + okT);
    p = await pw(N({ night: { inH: 40, lenH: 96, lastsH: 120, short: false, addBat: 0, addGen: null, plan: [], stop: null, ready: true } }));
    const again = await ev(page, () => { const u = window.__uu; u.UI.pwOk = 0; u.pwTick(); return !document.getElementById('pwWarn').hidden; });
    ok(!again, 'P1-2: "hazırsın" yeniden yanıp sönmez');
    p = await pw(N({ night: { inH: 0, lenH: 50, lastsH: 120, short: false, addBat: 0, addGen: null, plan: [], stop: null, ready: true } }));
    ok(!p.vis, 'P1-2: gece sırasında "hazırsın" yok ' + JSON.stringify(p));

    const rd = await ev(page, () => { const u = window.__uu, s = u.UI.s; u.UI.poOver = { gen: 6, need: 4, net: 2, over: false, hoursLeft: Infinity, night: { inH: 50, lenH: 96, lastsH: 30, short: true, plan: [], stop: null } };
      s.radio.push({ n: ++s.radioN, t: s.t, from: 'atlas', title: { tr: 'Elektrik uyarısı', en: 'Power warning' }, text: { tr: 'Bu yapılarla uzun gecede elektrik yetmez. Batarya ekle.', en: 'x' }, c: 'warn' });
      u.tick && 0; return true; });
    await settle(page, 600);
    const rs = await ev(page, () => { const u = window.__uu; return [u.subState().text || '', ...u.UI.subQ.map(q => q.text)].join(' | '); });
    ok(!/elektrik yetmez/i.test(rs), 'P1-2: ATLAS enerji satırı şeritle çelişmesin diye altyazıya basılmaz: ' + rs.slice(0, 80));

    ok(await ev(page, () => window.__uu.pwTag('batarya') === '' && window.__uu.pwTag('gunes') === ''), 'P1-2: batarya / güneş paneli kartında "Gece yetmez" rozeti yok');

    const bw = await ev(page, () => { const u = window.__uu, s = u.UI.s; window.__uuMods = window.__uuMods || {}; window.__uuMods.stopGainH = () => 7; delete u.UI.poOver;
      let b = s.b.find(o => o.k !== 'hub' && o.left === 0 && o.on); if (!b) { const sp = u.bestSpot(s, 'gunes'); b = u.build(s, 'gunes', sp.x, sp.y).b; b.left = 0; b.on = true; } u.modalBuilding(b.id);
      const box = document.getElementById('modalBox'), g = box.querySelector('.m-gain'), first = box.querySelector('.m-head').nextElementSibling;
      const r = { g: g ? g.textContent.trim() : '', first: first === g, more: !!box.querySelector('details.m-more summary') || !box.querySelector('.note') };
      delete window.__uuMods.stopGainH; u.ACT.closeModal(); return r; });
    okS(bw && bw.g === 'Durdurursan gecede +7 saat elektrik kazanırsın.' && bw.first, 'P1-2: yapı penceresi ilk satırı durdurma kazancı ' + JSON.stringify(bw));
    ok(bw && bw.more, 'P1-2: açma/kapama sayı dizisi "Daha fazla" altında');
    await ev(page, () => { delete window.__uu.UI.poOver; window.__uu.pwTick(); });

    const eg = await ev(page, () => { const u = window.__uu, EG = u.mod('EGITIM'); const o = EG.summary; EG.summary = () => { const l = [{ icon: 'build', text: 'Yapı kurdun' }, { icon: 'scan', text: 'Buz taradın' }]; l.facts = ['Güneş paneli', 'Batarya', 'Buz']; return l; };
      u.egDoneShow(true, true); EG.summary = o; const e = document.getElementById('egDone'); return { facts: [...e.querySelectorAll('.eg-facts span')].map(x => x.textContent), nw: (e.querySelector('.eg-new') || {}).textContent }; });
    ok(eg.facts.join() === 'Güneş paneli,Batarya,Buz', 'P1-3: "Öğrendiğin bilgiler" satırı (.eg-facts) ' + JSON.stringify(eg.facts));
    ok(eg.nw === 'Gerçek görev yeni, boş bir üste başlar.', 'P1-3: .eg-new cümlesi ' + eg.nw);
    await ev(page, () => window.__uu.egDoneGo()); await restPrep(page);

    const tq = await ev(page, () => { const u = window.__uu; document.querySelectorAll('.toast').forEach(t => t.remove()); const sc = document.getElementById('scanCard'); sc.innerHTML = '<b>Deneme</b>'; sc.hidden = false;
      u.toast('Bir', 'info'); u.toast('İki', 'info'); u.toast('Üç', 'info'); return { shown: document.querySelectorAll('.toast').length, q: u.toastQ() }; });
    ok(tq.shown === 0 && tq.q === 3, 'P1-4: tarama kartı açıkken bildirim gösterilmez, kuyruğa girer ' + JSON.stringify(tq));
    await ev(page, () => { window.__tT = []; new MutationObserver(m => m.forEach(r => r.addedNodes.forEach(() => window.__tT.push(performance.now())))).observe(document.getElementById('toasts'), { childList: true }); document.getElementById('scanCard').hidden = true; });
    await until(page, () => window.__tT.length >= 2, null, 10000);
    const gap = Math.round(await ev(page, () => window.__tT[1] - window.__tT[0]));
    await page.waitForTimeout(2500);
    const tN = await ev(page, () => document.querySelectorAll('.toast').length);
    ok(gap >= 1300 && tN <= 2, `P1-4: kart kapanınca sırayla (aralık ${gap} ms ≥1,5 sn), aynı anda en çok 2 bildirim (${tN})`);
    const ch = await ev(page, () => { const u = window.__uu; u.showChapter(1); return Math.round((u.UI.chapUntil - performance.now()) / 1000); });
    ok(ch >= 7, 'P1-4: bölüm kartı en az 8 sn ' + ch);
    await ev(page, () => document.getElementById('chapter').click()); await settle(page, 200);
    ok(await ev(page, () => document.getElementById('chapter').hidden), 'P1-4: bölüm kartı dokununca kapanır');
    const sp = await ev(page, () => { const u = window.__uu, s = u.UI.s; u.setSpeed(2, true); for (let i = 0; i < 4; i++) s.radio.push({ n: ++s.radioN, t: s.t, from: 'mc', title: { tr: 'Not', en: 'Note' }, text: { tr: 'Deneme mesajı ' + i + '.', en: 'Test ' + i + '.' }, c: 'info' }); return true; });
    await until(page, () => window.__uu.UI.speed === 1, null, 20000);
    const s1 = await ev(page, () => ({ sp: window.__uu.UI.speed, back: window.__uu.UI.spdBack }));
    await ev(page, () => { const u = window.__uu; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); });
    await until(page, () => window.__uu.UI.speed === 2, null, 20000);
    ok(s1.sp === 1 && await ev(page, () => window.__uu.UI.speed) === 2, 'P1-4: telsiz hızı 1×\'e düşürür, mesajlar bitince 2×\'e döner ' + JSON.stringify(s1));
    ok(await ev(page, () => window.__uu.uiReadMs(10) === 6000), 'P1-4: okuma alt sınırı 1 sn + 0,5 sn × kelime');


    const hw = await ev(page, () => { const u = window.__uu; u.UI.cgOver = { id: 'kalkan', k: { tr: 'Üssü toprakla ört', en: 'Cover the base' }, why: null, act: 'build', how: { tr: 'İniş Modülü\'ne dokun → Toprakla ört', en: 'Tap the Lander → Cover' } };
      u.renderObjective(); const a = document.getElementById('objHow').hidden; u.UI.goalT0 = performance.now() - 26000; u.renderObjective(); const e = document.getElementById('objHow');
      const r = { before: a, after: !e.hidden, txt: e.textContent.trim(), fs: parseFloat(getComputedStyle(e).fontSize) }; delete u.UI.cgOver; u.renderObjective(); return r; });
    ok(hw.before && hw.after && hw.txt === 'İniş Modülü\'ne dokun → Toprakla ört' && hw.fs >= 13, 'P2-1: #objHow hedef 25 sn ilerlemeyince görünür, ≥13 px ' + JSON.stringify(hw));
    const nh = await ev(page, () => { const u = window.__uu, s = u.UI.s; let b = s.b.find(o => o.k === 'gunes'); if (!b) { const sp = u.bestSpot(s, 'gunes'); b = u.build(s, 'gunes', sp.x, sp.y).b; } b.left = 0; b.broken = true; s.res.parca = 0; u.modalBuilding(b.id);
      const t = (document.querySelector('#modalBox .need-have') || {}).textContent || ''; b.broken = false; u.ACT.closeModal(); return t; });
    ok(/^\d+ yedek parça lazım, sende 0$/.test(nh), 'P2-1: sönük Onar düğmesi nedenini yazar: ' + nh);
    const gv = await ev(page, () => { const u = window.__uu; u.openPda('gorev'); const t = document.getElementById('pdaBody').textContent; u.closePda(); return { t, st: u.T('star2') + ' ' + u.T('star3') + ' ' + u.T('c_self') }; });
    ok(!/kendi kendine yetme|karnede|D ve F/i.test(gv.st) && /Dünya'ya geri gönderilmesin/.test(gv.t), 'P2-1: Tablet → Görev yıldız koşulları çocuk dilinde ' + gv.st);

    const st = await ev(page, () => { const u = window.__uu, s = u.UI.s, EG = u.mod('EGITIM'), og = EG.goal, oa = EG.active; s.train = true; u.UI.train = true; EG.goal = () => ({ text: { tr: 'Paneli onar', en: 'Fix it' }, i: 2, n: 11 });
      u.renderObjective(); const o = document.querySelector('#objective .o-step'), tl = document.getElementById('timeLbl'); const r = { step: o ? o.textContent : '', fs: o ? parseFloat(getComputedStyle(o).fontSize) : 0, clock: getComputedStyle(tl).visibility };
      EG.goal = og; s.train = false; u.UI.train = false; u.renderObjective(); r.clock2 = getComputedStyle(tl).visibility; return r; });
    ok(st.step === 'Adım 3/11' && st.fs >= 14, 'P2-3: hedef kartında "Adım 3/11", ≥14 px ' + JSON.stringify(st));
    ok(st.clock === 'hidden' && st.clock2 === 'visible', 'P2-3: eğitimde saat gizli, görevde görünür');

    const p3 = await ev(page, () => { const u = window.__uu; u.openPda('defter'); const d = getComputedStyle(document.getElementById('pdaStat')).display; u.closePda(); return { d, core: u.T('dr_core'), aq: u.T('atlasQLine') }; });
    ok(p3.d === 'none', 'P3: Defterim açıkken üst blok gizli');
    ok(p3.core === 'Jeneratör yakıtı' && p3.aq === 'ATLAS\'ın bir sorusu var: T\'ye bas.', 'P3: "Jeneratör yakıtı" ve ATLAS çağrı metni ' + JSON.stringify(p3));
  }
  await page.context().close();

  const pg = await open(844, 390, true);
  await startGame(pg, true);
  if (await ev(pg, () => window.__uu.UI.gl)) {
    await restPrep(pg); await settle(pg, 300);
    await v5fChecks(pg, 'tel');


    const tg = await ev(pg, () => { const u = window.__uu, s = u.UI.s; const bad = []; const chk = (sel, min) => document.querySelectorAll(sel).forEach(e => { const r = e.getBoundingClientRect(); if (r.width && e.getClientRects().length && r.height < min) bad.push(sel + ' ' + Math.round(r.height)); });
      chk('#hudBR .abtn', 44); let b = s.b.find(o => o.k === 'gunes'); if (!b) { const sp = u.bestSpot(s, 'gunes'); b = u.build(s, 'gunes', sp.x, sp.y).b; } b.left = 0; b.broken = true; s.res.parca = 40; u.modalBuilding(b.id);
      chk('#modalBox .acts .btn', 44); chk('#modalBox .m-foot .primary', 44); const mb = document.getElementById('modalBox').getBoundingClientRect(); b.broken = false; u.ACT.closeModal();
      u.openPda('gorev'); chk('#pda .x', 44); chk('#pda .tbtn', 44); u.closePda();
      const small = []; document.querySelectorAll('#gauges .ring b').forEach(e => { if (e.getClientRects().length) { const f = parseFloat(getComputedStyle(e).fontSize) * (e.getBoundingClientRect().height / (e.offsetHeight || 1)); if (f < 12) small.push(f.toFixed(1)); } });
      s.res.o2 = 99999; s.res.su = 99999; u.refresh(true); const o2 = document.querySelector('#g-o2 b').textContent;
      return { bad, small, mb: [mb.top, mb.bottom], o2, ship: u.T('shipLine'), scan: u.T('scanHow') }; });
    ok(!tg.bad.length, '(tel) P2-2: alt çubuk, hız, yapı penceresi düğmeleri, Tablet × ve alt düğmeleri ≥44 px ' + JSON.stringify(tg.bad));
    ok(!tg.small.length, '(tel) P2-2: gösterge sayıları ≥12 px ' + JSON.stringify(tg.small));
    ok(tg.mb[0] >= 0 && tg.mb[1] <= 390, '(tel) P2-2: yapı penceresi 390 px yüksekliğe sığar ' + JSON.stringify(tg.mb));
    ok(tg.o2 === '30+ ✓', '(tel) P2-2: Hava halkasında "30+ ✓" ' + tg.o2);
    ok(!/E'ye bas|tıkla/.test(tg.ship + tg.scan), '(tel) P2-2: dokunmatikte tuşsuz metin: ' + tg.ship);
    await ev(pg, () => { const u = window.__uu, EG = u.mod('EGITIM'), o = EG.summary; EG.summary = () => { const l = [1, 2, 3, 4, 5].map(i => ({ icon: 'build', text: 'Madde ' + i })); l.facts = ['Güneş paneli', 'Batarya', 'Buz', 'Hava']; return l; }; u.egDoneShow(true, true); EG.summary = o; });
    await settle(pg, 400);
    const e2 = await ev(pg, () => { const box = document.querySelector('#egDone .egd-box'), b = box.getBoundingClientRect(), go = document.getElementById('egDoneGo').getBoundingClientRect(), eg = document.getElementById('egDone'); return { top: b.top, bot: b.bottom, goH: go.height, goB: go.bottom, sc: eg.scrollHeight <= eg.clientHeight + 1 }; });
    ok(e2.top >= 0 && e2.bot <= 390 && e2.goB <= 390 && e2.sc && e2.goH >= 52, '(tel) P1-3: 5 maddelik özet + Bilgiler kaydırmadan sığar, düğme ≥52 px ' + JSON.stringify(e2));
    await shot(pg, 'v5f-tel-egitim-bitti');
    await ev(pg, () => window.__uu.egDoneGo());
  } else ok(false, 'v5f telefon: sahne yok');
  await pg.context().close();
}


if (want('kaynak')) {
  const SHOT = process.env.SHOT_DIR || 'test/shots-tmp';
  for (const [w, h, touch] of [[1366, 768, false], [844, 390, true]]) {
    const pg = await open(w, h, touch), tag = `${w}x${h}`;
    await startGame(pg, touch);
    await ev(pg, () => { const u = window.__uu, s = u.UI.s; s.level = 'kasif'; document.getElementById('app').dataset.level = 'kasif'; s.decT = -999; u.pushEvent(s, 'flare', { hit: 160 }); u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); });
    await settle(pg, 400);
    await ev(pg, () => { const u = window.__uu, I = u.mod('ISKART'); if (I && I.open && I.open() && I.close) I.close(); const s = u.UI.s, p = s.pending.find(q => q.id === 'flare'); if (p) u.modalEvent(p); });
    await settle(pg, 500);
    const hasCh = await ev(pg, () => !!document.querySelector('#evChoices .choice:not([disabled])'));
    if (hasCh) await ev(pg, () => document.querySelector('#evChoices .choice:not([disabled])').click());
    await settle(pg, 600);
    const r = await ev(pg, () => { const box = document.getElementById('evResult'), c = box && box.querySelector('.src-chip'), d = box && box.querySelector('details.dyk'), mb = document.getElementById('modalBox').getBoundingClientRect();
      if (!c) return { chip: null, dyk: !!d, html: box ? box.innerHTML.slice(0, 300) : null };
      const r = c.getBoundingClientRect(), cs = getComputedStyle(c);
      return { chip: c.textContent, title: c.title, vis: cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0, inDetails: !!c.closest('details'), dyk: !!d, dykOpen: d ? d.open : null, fs: parseFloat(cs.fontSize), h: r.height, inBox: r.left >= mb.left && r.right <= mb.right + 0.5, vw: r.right <= window.innerWidth, over: c.scrollWidth - c.clientWidth <= 1 }; });
    ok(hasCh && r.chip && r.vis && !r.inDetails && !r.dykOpen, `kaynak-k (${tag}): Kâşif'te karar sonucunda çip düğmeye basmadan görünür ` + JSON.stringify(r));
    ok(r.chip && /^Kaynak: NASA · /.test(r.chip.trim()) && /Orion Radiation Protection Plan|What is a Solar Flare/.test(r.title), `kaynak-k (${tag}): çip veride duran künyeyi taşır (${r.title})`);
    ok(r.chip && r.fs >= 12 && r.h <= 26 && r.inBox && r.vw && r.over, `kaynak-k (${tag}): çip ≥12 px, tek satır, pencerenin içinde ` + JSON.stringify(r && { fs: r.fs, h: r.h, inBox: r.inBox }));
    try { fs.mkdirSync(SHOT, { recursive: true }); await pg.screenshot({ path: path.join(SHOT, touch ? 'tel-karar-sonucu.jpg' : 'karar-sonucu.jpg'), quality: 85 }); } catch (e) { lap('görüntü yok: ' + e.message); }
    await pg.context().close();
  }
}

await browser.close();
const pass = checks.filter(c => c[0]).length;
console.log(`\n${pass}/${checks.length} kontrol geçti`);
if (errors.length) { console.log('\nHATALAR:\n' + errors.join('\n')); process.exit(1); }
