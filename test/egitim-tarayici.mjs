

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

let chromium = null, how = '';
try { const groot = execSync('npm root -g').toString().trim(); ({ chromium } = require(path.join(groot, '@playwright', 'cli', 'node_modules', 'playwright-core'))); how = 'global playwright-core'; } catch (e) {   }
if (!chromium) { try { ({ chromium } = require('playwright')); how = 'playwright'; } catch (e) {   } }
if (!chromium) { console.log('playwright bulunamadı (bash bulut_kur.sh)'); process.exit(1); }
const url = pathToFileURL(path.join(dir, '..', 'index.html')).href + '#test';
const swArgs = (process.platform === 'linux' || process.env.YAZILIM_CIZICI === '1') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [];
let browser = null;
for (const opt of [{ channel: 'msedge' }, {}, { executablePath: '/opt/pw-browsers/chromium' }]) {
  try { browser = await chromium.launch(Object.assign({ headless: true, args: swArgs }, opt)); how += ' · ' + (opt.channel || opt.executablePath || 'chromium'); break; } catch (e) {   }
}
if (!browser) { console.log('tarayıcı açılamadı'); process.exit(1); }
const FAST = process.env.TUR === 'hizli', K = FAST ? 0.1 : 1;
const errors = [], checks = [];
const t0 = Date.now(), lap = m => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)} sn] ${m}`);
const ok = (cond, msg) => { checks.push([!!cond, msg]); if (!cond) { errors.push('KONTROL: ' + msg); lap('✗ ' + msg); } else lap('✓ ' + msg); };
const words = t => String(t || '').split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'tr-TR' });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_INTERNET|net::|GPU stall|WebGL-/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message + '\n' + e.stack));
  await page.goto(url); await page.waitForTimeout(900);
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {   } }); await page.reload(); await page.waitForTimeout(1200);
  return page;
}
const ev = (page, f, a) => page.evaluate(f, a);

const EG = 'window.__uuMods && window.__uuMods.EGITIM';


let page = await open(1366, 768);
const base = await ev(page, () => { const E = window.__uuMods && window.__uuMods.EGITIM; return E ? { n: E.steps.length, ids: E.steps.map(s => s.id), active: E.active(), needed: E.needed({}) } : null; });
ok(base && base.n >= 9 && base.n <= 11, '#test: window.__uuMods.EGITIM var, adımlar yüklü ' + JSON.stringify(base));
ok(base && base.active === false && base.needed === true, 'EGITIM başta etkin değil; needed({}) true');
const hook = await ev(page, () => !!(window.__uu && typeof window.__uu.egitimAtla === 'function'));
lap(`tarayıcı: ${how} · C'nin eğitim kancası (__uu.egitimAtla): ${hook ? 'var' : 'YOK'}`);
if (!hook) {
  console.log('C\'nin K2 kancası bu dalda yok: tam eğitim oyunu birleşimden sonra (yerelde) koşar.');
  await browser.close();
  console.log(`\n${checks.filter(c => c[0]).length}/${checks.length} kontrol geçti`);
  if (errors.length) { console.log(errors.join('\n')); process.exit(1); }
  process.exit(0);
}
const gl = await ev(page, () => window.__uu.UI.gl);
if (!gl) { console.log('WebGL yok: sahne açılamıyor'); await browser.close(); process.exit(1); }


async function newMission(pg, world) {
  await ev(pg, () => window.__uu.egitimAtla(false));
  await pg.click(`[data-act="start"][data-v="${world}"]`); await pg.waitForTimeout(1500);
  if (await ev(pg, () => window.__uu.UI.modal === 'creator')) { await pg.click('#crGo'); await pg.waitForTimeout(900); }
  return pg.waitForFunction(EG + ' && window.__uuMods.EGITIM.active()', null, { timeout: 30000 }).then(() => true, () => false);
}


ok(await newMission(page, 'ay'), 'yeni görev eğitimle açılır (EGITIM etkin)');
ok(await ev(page, () => window.__uu.UI.train === true && window.__uu.UI.s && window.__uu.UI.s.train === true), 'UI.train ve s.train eğitimde true');
const stepT = {}, stuck = [];
const tStart = Date.now();
let guard = 0, lastId = null, stepStart = Date.now();
const st = () => ev(page, () => { const E = window.__uuMods.EGITIM, x = E._state && E._state(), g = E.goal(); return E.active() && x ? { id: x.id, i: x.i, phase: x.phase, at: g && g.at, sel: g && g.sel, text: g && g.text && g.text.tr } : null; });
const subText = () => ev(page, () => { const s = window.__uu.subState(); return s && s.text ? s.text : ''; });
async function readSub() {
  const t = await subText(); await sleep((2500 + 800 * words(t)) * K);
}
const clickSel = async sel => { if (!sel) return false; const h = await page.$(sel); if (!h) return false; try { await h.click({ timeout: 3000 }); return true; } catch (e) { return false; } };
while (guard++ < 120) {
  const x = await st();
  if (!x) break;
  if (x.id !== lastId) { if (lastId) { stepT[lastId] = Math.round((Date.now() - stepStart) / 100) / 10; } lastId = x.id; stepStart = Date.now(); }
  if (Date.now() - stepStart > 60000 && !stuck.includes(x.id)) stuck.push(x.id);
  if (Date.now() - stepStart > 120000) break;
  if (x.phase !== 'do') {
    if (x.id === 'halka' && await ev(page, () => !!window.__uu.UI.modal)) { await sleep(3000 * K); if (!(await clickSel('[data-act="closeModal"]'))) await ev(page, () => window.__uu.closeModal && window.__uu.closeModal()); }
    await sleep(400); continue; }
  await readSub();
  await sleep((2000 + Math.random() * 2000) * K);
  const id = x.id;
  try {
    if (id === 'amac') {
      await ev(page, () => { const u = window.__uu, h = u.UI.s.b.find(b => b.k === 'hub'); u.modalBuilding(h.id); });
    } else if (id === 'yuru') {
      await ev(page, a => { const P = window.__uu.S3.player; window.__uu.S3.setPlayer(a.x + 2, a.z + 1, P ? P.yaw : 0); }, x.at); await sleep(5000 * K);
    } else if (id === 'halka') {
      await clickSel(x.sel || '#g-o2');
    } else if (id === 'panel' || id === 'hava') {
      const k = id === 'panel' ? 'gunes' : 'oksijen';
      if (!(await ev(page, () => window.__uu.UI.plan))) await clickSel('[data-act="buildMenu"]');
      await sleep(1500 * K);
      if (!(await clickSel(`#drawer [data-k="${k}"]`))) await ev(page, k => window.__uu.pickB(k), k);
      await sleep(2000 * K);
      await ev(page, k => { const u = window.__uu, sp = u.bestSpot(u.UI.s, k); if (sp) u.placeAt({ tx: sp.x, ty: sp.y }); }, k);
      await sleep(1000 * K);
      if (await ev(page, () => window.__uu.UI.plan)) await ev(page, () => window.__uu.exitPlan());
    } else if (id === 'tara') {
      if (x.at) { await ev(page, a => { const P = window.__uu.S3.player; window.__uu.S3.setPlayer(a.x + 3, a.z + 3, P ? P.yaw : 0); }, x.at); await sleep(5000 * K); }
      await ev(page, () => { const u = window.__uu, sp = window.__uuMods.EGITIM._state().st.spot; if (sp) u.doScan(sp.tx, sp.ty); });
    } else if (id === 'onar') {
      await ev(page, () => { const u = window.__uu, E = window.__uuMods.EGITIM, bid = E._state().st.bid; u.modalBuilding(bid); });
      await sleep(1500 * K);
      if (!(await clickSel('[data-act="bRepair"]'))) errors.push('onar: Onar düğmesi yok');
      await sleep(800 * K);
      await ev(page, () => { const b = document.querySelector('[data-act="closeModal"]'); if (b) b.click(); });
      await sleep(1500 * K);

      if (await ev(page, () => { const q = document.getElementById('ikQuick'); return !!(q && !q.hidden && q.getClientRects().length);   })) {
        await sleep(3000 * K); await clickSel('.ik-q-opt[data-i]'); await sleep(4000 * K);
        await clickSel('.ik-q-go');
      } else if (!(await clickSel('#ikCard button[data-ik]'))) {   }
    } else if (id === 'soru') {
      if (!(await clickSel('#ikCard button[data-ik]'))) await ev(page, () => { const u = window.__uu, E = window.__uuMods.EGITIM, pid = E._state().st.pid; if (pid != null) u.resolve(u.UI.s, 0, pid); });
    } else if (id === 'kargo') {
      await page.waitForFunction(() => window.__uu.UI.s.pending.some(p => p.type === 'cargo'), null, { timeout: 30000 }).catch(() => {});
      await ev(page, () => { const u = window.__uu, p = u.UI.s.pending.find(q => q.type === 'cargo'); if (p) u.openCall(p.pid); });
      await sleep(2500 * K);
      if (!(await clickSel('[data-act="cargoAuto"]'))) errors.push('kargo: Öner düğmesi yok');
      await sleep(1500 * K);
      if (!(await clickSel('[data-act="cargoGo"]'))) await ev(page, () => { const u = window.__uu, p = u.UI.s.pending.find(q => q.type === 'cargo'); if (p) u.resolve(u.UI.s, p.def, p.pid); });
    } else if (id === 'tablet') {
      if (!(await clickSel(x.sel))) await ev(page, () => window.__uu.openPda());
    } else if (id === 'son') {
      await sleep(2000 * K); await ev(page, () => window.__uu.closePda());
    }
  } catch (e) { errors.push(`adım ${id}: ${e.message}`); }

  await page.waitForFunction(i => { const E = window.__uuMods.EGITIM, x = E._state && E._state(); return !E.active() || !x || x.i !== i || x.phase !== 'do'; }, x.i, { timeout: 60000 }).catch(() => {});
}
if (lastId) stepT[lastId] = Math.round((Date.now() - stepStart) / 100) / 10;
const total = Math.round((Date.now() - tStart) / 1000);
const done = await page.waitForFunction(() => !window.__uuMods.EGITIM.active(), null, { timeout: 30000 }).then(() => true, () => false);
ok(done, 'eğitim baştan sona bitti');

const egd = await ev(page, () => { const d = document.getElementById('egDone'); return d && !d.hidden ? d.textContent.replace(/\s+/g, ' ').trim() : null; });
lap('Eğitim bitti ekranı: ' + (egd == null ? 'yok (C bu dalda değil)' : egd));
if (egd != null) await clickSel('#egDoneGo');
lap('adım süreleri (sn): ' + JSON.stringify(stepT) + ' · toplam ' + total + ' sn');

if (!FAST) ok(total >= 150 && total <= 360, `toplam süre 2,5–6 dk (${total} sn; yazılımla çizimde yavaşlık ortam farkıdır)`);
ok(!stuck.length, 'hiçbir adımda 60 sn\'den uzun takılma yok' + (stuck.length ? ' (' + stuck.join(', ') + ')' : ''));
await page.waitForTimeout(2500);
const after = await ev(page, () => { const u = window.__uu, s = u.UI.s, o = document.getElementById('objective'); let save = null; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i), v = localStorage.getItem(k); if (/"world"/.test(v) && /"map"/.test(v)) save = JSON.parse(v); } } catch (e) {   } return { train: !!u.UI.train, sTrain: !!(s && s.train), t: s && s.t, obj: o ? o.textContent.trim() : '', saveTrain: save ? !!save.train : null, egitim: (u.UI.set || {}).egitim, tag: !!(s && s.tags && s.tags['x:egitim'] != null) }; });
ok(!after.train && !after.sTrain, 'eğitim bitince gerçek görev açıldı ' + JSON.stringify(after));
ok(after.obj.length > 0, 'gerçek görevde hedef satırı dolu: "' + after.obj + '"');
ok(after.saveTrain !== true, 'eğitim durumu kaydedilmedi');
ok(after.tag, 'gerçek görevde x:egitim etiketi (caylak başarımı)');
await page.context().close();


page = await open(1366, 768);
ok(await newMission(page, 'mars'), 'Mars: yeni görev eğitimle açılır');
ok(await ev(page, () => { const a = document.getElementById('egSkip'); return !a || a.hidden; }), '"Geç" ilk 20 sn görünmez');
await page.waitForFunction(() => { const a = document.getElementById('egSkip'); return a && !a.hidden; }, null, { timeout: 40000 }).catch(() => {});
await page.click('#egSkip').catch(() => {}); await page.waitForTimeout(300);
ok(await ev(page, () => window.__uuMods.EGITIM.active() && document.getElementById('egSkip').dataset.arm === '1'), 'ilk dokunuş yalnız onay ister');
await page.click('#egSkip').catch(() => {}); await page.waitForTimeout(1500);
ok(await ev(page, () => !window.__uuMods.EGITIM.active() && !window.__uu.UI.train && window.__uu.UI.s && !window.__uu.UI.s.train), 'ikinci dokunuş eğitimi geçer, gerçek görev açılır');
await page.context().close();


for (const [w, h] of [[1366, 768], [844, 390]]) {
  const ctx2 = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'tr-TR', hasTouch: h < 500, isMobile: h < 500 });
  page = await ctx2.newPage();
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  await page.goto(url); await page.waitForTimeout(900);
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {   } }); await page.reload(); await page.waitForTimeout(1200);
  const tag = `${w}x${h}`;
  ok(await newMission(page, 'ay'), tag + ': eğitim açıldı');
  const stp = await ev(page, () => { const c = document.getElementById('egStep'); return c ? { t: c.textContent, fs: parseFloat(getComputedStyle(c).fontSize) } : null; });
  ok(stp && /^Adım 1\/\d+$/.test(stp.t) && stp.fs >= 14, tag + ': adım sayacı ' + JSON.stringify(stp));

  await ev(page, () => { let p = document.getElementById('pwWarn'); if (!p) { p = document.createElement('div'); p.id = 'pwWarn'; (document.getElementById('hud') || document.body).appendChild(p); }
    const o = document.getElementById('objective'), ob = o ? o.getBoundingClientRect() : { bottom: 60 };
    p.hidden = false; p.textContent = 'Uzun gece: elektrik yetmeyecek'; p.style.cssText = `position:fixed;left:50%;transform:translateX(-50%);top:${Math.round(ob.bottom + 4)}px;width:320px;height:40px;display:block;visibility:visible;opacity:1;background:#422;z-index:5`; });
  const shown = await page.waitForFunction(() => { const b = document.getElementById('egShow'); return b && !b.hidden; }, null, { timeout: 60000 }).then(() => true, () => false);
  ok(shown, tag + ': 20 sn takılınca "Bana göster" göründü');
  await page.waitForTimeout(1500);
  const ov = await ev(page, () => { const R = e => { if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return r.width && r.height ? r : null; }, b = R(document.getElementById('egShow'));
    const hit = []; for (const sel of ['#objective', '#pwWarn', '#calls', '#egStep', '#egSkip']) { const r = R(document.querySelector(sel)); if (b && r && b.left < r.right - 1 && b.right > r.left + 1 && b.top < r.bottom - 1 && b.bottom > r.top + 1) hit.push(sel); }
    return { b: b && { t: Math.round(b.top), b: Math.round(b.bottom) }, hit, H: innerHeight }; });
  ok(ov.b && !ov.hit.length && ov.b.b <= ov.H, tag + ': "Bana göster" şeritlere binmiyor ' + JSON.stringify(ov));

  await ev(page, () => { const q = document.createElement('div'); q.id = 'ikQuick'; q.style.cssText = 'position:fixed;left:30%;top:30%;width:40%;height:40%;background:#123;z-index:40'; document.body.appendChild(q); });
  await page.waitForTimeout(2500);
  ok(await ev(page, () => { const b = document.getElementById('egShow'); return !b || b.hidden; }), tag + ': hızlı soru açıkken "Bana göster" gizli');
  await ev(page, () => document.getElementById('ikQuick').remove());
  await page.context().close();
}

await browser.close();
console.log(`\n${checks.filter(c => c[0]).length}/${checks.length} kontrol geçti`);
if (errors.length) { console.log(errors.join('\n')); process.exit(1); }
