

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const groot = execSync('npm root -g').toString().trim();
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(groot, '@playwright', 'cli', 'node_modules', 'playwright-core'));
const out = path.join(dir, '..', 'teslim', 'shots'); fs.mkdirSync(out, { recursive: true });
const url = pathToFileURL(path.join(dir, '..', 'index.html')).href + '#test';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const want = n => !ONLY || ONLY.includes(n);
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: (process.platform === 'linux' || process.env.YAZILIM_CIZICI === '1') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
const errors = [];
const t0 = Date.now(), lap = m => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)} sn] ${m}`);
const ev = (page, f, a) => page.evaluate(f, a);
const settle = (page, ms) => page.waitForTimeout(ms);
const shot = async (page, n) => { await page.screenshot({ path: path.join(out, n + '.png') }); lap('çekildi ' + n); };

async function open() {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, locale: 'en-US' });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_INTERNET|net::|GPU stall|WebGL-/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  await page.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('ufuk-ussu-ayar', JSON.stringify({ lang: 'en', sound: false })); } catch (e) {   } });
  await page.goto(url); await page.waitForTimeout(1500);
  await page.evaluate(() => { if (window.__uu.egitimAtla) window.__uu.egitimAtla(true); if (window.__uu.hizliSoru) window.__uu.hizliSoru(false); });

  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
  return page;
}


async function newBase(page, world, level, creatorShot) {
  await page.evaluate(a => window.__uu.startAs(a[0], a[1]), [world, level]); await settle(page, 1500);

  if (await ev(page, () => window.__uu.UI.modal === 'creator')) {
    await page.fill('#crName', 'Nova'); await page.click('.sw[data-v="su_mavi"]').catch(() => {}); await settle(page, 1200);
    if (creatorShot) await shot(page, creatorShot);
    await page.click('#crGo'); await settle(page, 800);
  }
  await ev(page, () => window.__uu.endTutorial(true)); await settle(page, 500);
  return ev(page, () => {
    const u = window.__uu, s = u.UI.s, near = (x, y) => Math.hypot(x - 12, y - 7);
    s.stage = 2; s.res.malzeme = 900; s.res.parca = 300;
    const find = (pred, dmin, dmax) => { let best = null, bd = 1e9; for (let y = 0; y < 15; y++) for (let x = 0; x < 24; x++) {
      const d = near(x, y); if (d < dmin || d > dmax || !s.map.seen[y * 24 + x] || s.b.some(b => b.x === x && b.y === y) || !pred(s.map.k[y * 24 + x])) continue;
      if (s.b.some(b => Math.max(Math.abs(b.x - x), Math.abs(b.y - y)) < 1)) continue; if (d < bd) { bd = d; best = [x, y]; } } return best; };
    const got = [];
    for (const [k, on, dmin, dmax] of [['gunes', '.', 2, 3.6], ['gunes', '.', 2, 4], ['oksijen', '.', 2, 3.6], ['su', 'i', 1, 6], ['sera', '.', 2, 4.5], ['yasam', '.', 2, 4], ['batarya', '.', 2.2, 5], ['lab', '.', 2, 5], ['anten', '.', 2.2, 5.5], ['gunes', '.', 3, 5.5], ['batarya', '.', 2.2, 6], ['batarya', '.', 2.2, 6]]) {
      const p = find(t => t === on, dmin, dmax); if (!p) continue;
      const r = u.build(s, k, p[0], p[1]); if (r.ok) got.push(k + '@' + p);
    }
    u.ff(16);
    return got;
  });
}

const care = (page, days) => ev(page, d => { const u = window.__uu, s = u.UI.s; for (let i = 0; i < d && !s.over; i++) { s.pending.length = 0; for (const b of s.b) { b.broken = false; if (b.k === 'hub' || b.k === 'yasam') b.shield = 1; } for (const k of ['o2', 'su', 'gida']) s.res[k] = Math.max(s.res[k], 150); s.res.parca = Math.max(s.res.parca, 40); s.stored = s.pw.cap; s.dose = Math.min(s.dose, 25 + s.t / 24 * 3); u.ff(24); } s.pending.length = 0; return s.t; }, days);
const clean = page => ev(page, () => { const u = window.__uu; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); u.UI.s.pending.length = 0; const t = document.getElementById('toasts'); if (t) t.innerHTML = ''; });
const nearHub = (page, dx, dz, yaw) => ev(page, ([dx, dz, yaw]) => window.__uu.S3.setPlayer(100 + dx, 60 + dz, yaw), [dx, dz, yaw]);


let page = await open();
if (want('title')) { await settle(page, 1500); await shot(page, '01-title-screen'); }
if (want('about')) {
  await ev(page, () => window.__uu.ACT.about()); await settle(page, 1200);
  await ev(page, () => { const b = document.getElementById('modalBox'), tb = b && b.querySelector('.ab-tbl'); if (tb) b.scrollTo(0, Math.max(0, tb.getBoundingClientRect().top - b.getBoundingClientRect().top + b.scrollTop - 90)); }); await settle(page, 400);
  await shot(page, '13-about-nasa-table'); await ev(page, () => window.__uu.ACT.closeModal()); await settle(page, 400);
}


const built = await newBase(page, 'ay', 'kasif', want('creator') ? '09-astronaut-creator' : null); lap('kurulan: ' + built.join(' '));
await ev(page, () => { const s = window.__uu.UI.s; s.res.o2 = 200; s.res.su = 400; s.res.gida = 300; });
if (want('hero')) {
  await ev(page, () => { const u = window.__uu; if (u.S3.mode === 'drone') u.toggleView(); });
  await nearHub(page, 9, 20, 0.35); await settle(page, 6000); await shot(page, '02-hero-moon-base-daylight');
}


if (want('build')) {
  await clean(page); await page.click('#acts [data-act="buildMenu"]').catch(() => errors.push('Kur düğmesi yok'));
  await page.waitForFunction(() => window.__uu.UI.plan, null, { timeout: 15000 }).catch(() => errors.push('inşa görünümü açılmadı'));
  await page.click('.dcard[data-v="sera"]').catch(() => {}); await clean(page); await settle(page, 3500); await page.mouse.move(960, 400); await settle(page, 1000); await shot(page, '13-build-view');
  await page.keyboard.press('Escape'); await settle(page, 600);
  if (await ev(page, () => window.__uu.UI.plan)) await page.keyboard.press('Escape');
  await ev(page, () => { const u = window.__uu; if (u.S3.mode !== 'walk') u.toggleView(); }); await settle(page, 500);
}


if (want('rover')) {
  await ev(page, () => { const u = window.__uu; if (u.S3.mode === 'drone' || u.S3.mode === 'plan') u.toggleView(); });

  await ev(page, () => window.__uu.setSpeed(window.__uu.featIs && !window.__uu.featIs('hiz4') ? 2 : 3));
  for (let i = 0; i < 40; i++) { const r = await ev(page, () => window.__uu.S3.rover); if (r && r.st === 'park') break; await settle(page, 1500); }
  await ev(page, () => window.__uu.setSpeed(0)); await settle(page, 800); await clean(page);
  const r = await ev(page, () => window.__uu.S3.rover);
  if (r) {
    const hideTC = await page.addStyleTag({ content: '#hudTC{display:none!important}' });
    let okv = false;
    for (const off of [0.45, -0.45, 0.9, -0.9, 0]) {
      await ev(page, ([x, z, off]) => window.__uu.S3.setPlayer(x + 6.5, z + 4.5, Math.atan2(6.5, 4.5) + off), [r.x, r.z, off]); await settle(page, 900);
      const q = await ev(page, ([x, z]) => { const S = window.__uu.S3, p = S.project(x, S.hAt(x, z) + 0.8, z); return { b: p.behind, x: p.sx, y: p.sy }; }, [r.x, r.z]);
      if (!q.b && q.x > 300 && q.x < 750 && q.y > 250 && q.y < 700) { okv = true; break; }
    }
    if (!okv) errors.push('gezgin kadrajda değil');
    await clean(page); await settle(page, 700); await shot(page, '14-rover'); await hideTC.evaluate(e => e.remove());
    await ev(page, () => window.__uu.setSpeed(1));
  } else errors.push('gezgin yok');
}


if (want('hud')) {
  await ev(page, () => { const u = window.__uu; if (u.S3.mode !== 'drone') u.toggleView(); }); await clean(page);
  await ev(page, () => { const u = window.__uu; u.UI.chapUntil = 0; const c = document.getElementById('chapter'); if (c) c.hidden = true; u.refresh(true); });
  await page.mouse.move(1880, 300); await settle(page, 2500); await shot(page, '15-clean-hud');
  await ev(page, () => window.__uu.openPda('gorev')); await settle(page, 1200); await shot(page, '16-tablet-menu');
  await ev(page, () => window.__uu.closePda());
  await ev(page, () => { const u = window.__uu, s = u.UI.s, W = window; W.__uuMods = W.__uuMods || {};
    if (!u.ext('checkAch')) W.__uuMods.ACHIEVEMENTS = W.__uuMods.ACHIEVEMENTS || [{ id: 'sunum_surucu', name: { tr: 'Sürücü', en: 'Driver' }, icon: 'rover', gives: ['feat:surus'], say: { tr: 'Artık gezgini sürebilirsin!', en: 'You can drive the rover now!' } }];
    const a = (typeof W.__uuMods.ACHIEVEMENTS !== 'undefined' && W.__uuMods.ACHIEVEMENTS[0]) || null; s.ach = s.ach || {}; s.ach[a ? a.id : 'sunum_surucu'] = s.t; u.UI.achT = 0; u.refresh(true);
    const t = document.querySelector('.toast.ach'); if (t) document.getElementById('toasts').appendChild(Object.assign(t.cloneNode(true), { id: 'achShot' })); });
  await settle(page, 800); await shot(page, '17-achievement'); await ev(page, () => { const e = document.getElementById('achShot'); if (e) e.remove(); });
}

if (want('wardrobe')) {
  await ev(page, () => { const u = window.__uu; for (const id of ['uz_okyanus', 'us_turkuaz', 'gz_sari', 'vz_gumus']) u.forceUnlock(id); u.openWardrobe('craft'); });
  await clean(page); await settle(page, 2500); await shot(page, '10-wardrobe-rewards');
  await ev(page, () => window.__uu.ACT.wdClose());
}

if (want('scan')) {
  const tgt = await ev(page, () => { const u = window.__uu, s = u.UI.s; for (let y = 0; y < 15; y++) for (let x = 0; x < 24; x++) { const k = s.map.k[y * 24 + x]; if (s.map.seen[y * 24 + x] && k === 'i' && !s.b.some(b => b.x === x && b.y === y)) { u.S3.setPlayer(x * 8 + 4, y * 8 + 12, 0); return [x, y]; } } return null; });
  lap('tarama hedefi ' + tgt); await settle(page, 2500);
  if (tgt) { await ev(page, ([x, y]) => window.__uu.doScan(x, y), tgt); await settle(page, 1800); await shot(page, '03-scanner-data-bank-card'); }
  else errors.push('tarama hedefi yok');
  await page.click('[data-act="cardClose"]').catch(() => {}); await settle(page, 300);
}


if (want('info')) {
  await clean(page); await ev(page, () => { const IK = window.__uuMods && window.__uuMods.ISKART; if (IK && IK.open && IK.open() && IK.close) IK.close(); const s = window.__uu.UI.s; const O = window.__uuMods.OGRET; if (O._clear) O._clear(); if (s.fx && Array.isArray(s.fx.teach)) s.fx.teach.length = 0; if (s.learn) s.learn.t_gece = s.t; return O.push('t_gece'); });
  const okC = await page.waitForFunction(() => { const e = document.getElementById('ogCard'); return e && !e.hidden && e.style.visibility !== 'hidden' && !!e.querySelector('.og-src'); }, null, { timeout: 8000 }).then(() => true, () => false);
  if (okC) { await settle(page, 600); await shot(page, '14-info-card'); } else errors.push('Bilgi kartı (kaynak çipli) açılmadı');
  await ev(page, () => { const O = window.__uuMods.OGRET; if (O._close) O._close(); }); await settle(page, 300);
}

if (want('flare')) {
  await nearHub(page, 5, 16, 0.2);
  await ev(page, () => { const u = window.__uu, s = u.UI.s; u.UI.subQ.length = 0; u.UI.sub = null; u.UI.subGap = 0; s.decT = -999; u.queueSub({ from: 'mc', text: { tr: 'İki yıl önce Öncü adlı küçük bir gezgin burada sustu.', en: 'Two years ago a little rover called Öncü fell silent here.' }, c: 'info', local: true }); u.pushEvent(s, 'flare', { hit: 160 }); });
  await page.waitForFunction(() => { const b = document.getElementById('sub'); return b && !b.hidden && b.textContent.length > 10; }, null, { timeout: 20000 }).catch(async () => { errors.push('altyazı gelmedi'); lap('DBG ' + JSON.stringify(await ev(page, () => { const u = window.__uu; return { sp: u.UI.speed, pr: u.pauseReason(), sub: !!u.UI.sub, q: u.UI.subQ.length, hid: document.getElementById('sub').hidden, tx: document.getElementById('sub').textContent.length, modal: u.UI.modal, mode: u.S3.mode }; }))); }); await settle(page, 800); await shot(page, '04a-flare-radio-call');
  await ev(page, () => window.__uu.openCall()); await settle(page, 1500); await shot(page, '04b-flare-decision-radio');
  await shot(page, '11b-decision-price');
  await page.click('#evChoices .choice[data-v="0"]:not([disabled]), #ikCard .ik-ch button:has-text("Soil-covered")', { timeout: 8000 }).catch(() => errors.push('doğru şık (Toprak örtülü oda) yok')); await settle(page, 800); await shot(page, '11-decision-in-reality');
  await page.click('#evResult [data-act="closeModal"]', { timeout: 3000 }).catch(() => {}); await settle(page, 400);
}


if (want('cargo')) {
  await ev(page, () => { const u = window.__uu, s = u.UI.s; s.shipAt = s.t + 1; u.ff(1); });
  await settle(page, 3500);
  const hasCargo = await ev(page, () => window.__uu.UI.s.pending.some(p => p.type === 'cargo'));
  if (hasCargo) {
    await page.click('.call.ship'); await settle(page, 600);
    await page.click('[data-act="cargoAuto"]'); await settle(page, 1200); await shot(page, '05-cargo-mass-budget');
    await page.click('[data-act="cargoGo"]'); await settle(page, 600);
  } else errors.push('kargo çağrısı gelmedi');
}


if (want('night')) {
  await ev(page, () => { const u = window.__uu, s = u.UI.s, target = (u.W().night.start + 1) * 24 + 2; const n = Math.max(0, Math.floor((target - s.t) / 24)); window.__n = target - s.t - n * 24; return n; }).then(n => care(page, n));
  await ev(page, () => { const u = window.__uu, s = u.UI.s; s.pending.length = 0; for (const b of s.b) b.broken = false; s.stored = s.pw.cap; u.ff(Math.max(0, window.__n)); s.pending.length = 0; s.stored = s.pw.cap; s.dose = 20; });
  await nearHub(page, 9, 20, 0.35); await settle(page, 6500); await shot(page, '06-moon-polar-night-lit-base');
}


if (want('report')) {
  for (let i = 0; i < 40; i++) { await care(page, 2); if (await ev(page, () => !!window.__uu.UI.s.over)) break; }
  await settle(page, 1500);
  if (await ev(page, () => !!window.__uu.UI.s.over)) { await shot(page, '07-end-of-mission-report'); await ev(page, () => document.getElementById('modalBox').scrollTo(0, 9999)); await settle(page, 300); await shot(page, '07b-end-of-mission-report-lower');
    await ev(page, () => { const b = document.getElementById('modalBox'), w = b.querySelector('.end-who'); b.scrollTo(0, 0); const l = b.querySelector('.learned'); if (l) { const h = l.previousElementSibling || l; b.scrollTo(0, Math.max(0, h.getBoundingClientRect().top - b.getBoundingClientRect().top + b.scrollTop - 330)); } }); await settle(page, 400); await shot(page, '12-report-what-you-learned'); }
  else errors.push('görev bitmedi');
}
await page.context().close();


if (want('mars')) {
  page = await open();
  await newBase(page, 'mars', 'muhendis');
  await ev(page, () => { const u = window.__uu, s = u.UI.s; for (const k of ['o2', 'su', 'gida']) s.res[k] = 300; s.storm = { from: s.t, until: s.t + 60 }; s.stormWarned = true; u.ff(1); });
  await ev(page, () => { const u = window.__uu; if (u.S3.mode === 'drone') u.toggleView(); });
  await nearHub(page, 9, 20, 0.35); await settle(page, 6500); await shot(page, '08-mars-dust-storm');
  await page.context().close();
}
await browser.close();
console.log(errors.length ? 'HATALAR:\n' + errors.join('\n') : 'konsol hatası yok');
process.exit(errors.length ? 1 : 0);
