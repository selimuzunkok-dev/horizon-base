

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), '@playwright', 'cli', 'node_modules', 'playwright-core'));
const out = process.env.SHOTS || path.join(dir, 'shots-giris'); fs.mkdirSync(out, { recursive: true });
const base = pathToFileURL(path.join(dir, '..', 'index.html')).href;
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: (process.platform === 'linux' || process.env.YAZILIM_CIZICI === '1') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
const errors = [], checks = [];
const ok = (c, m) => { checks.push(!!c); console.log((c ? '✓ ' : '✗ ') + m); if (!c) errors.push('KONTROL: ' + m); };
const shot = (p, n) => p.screenshot({ path: path.join(out, n + '.jpg'), type: 'jpeg', quality: 86 });
const ev = (p, f, a) => p.evaluate(f, a);
async function open(w, h, touch) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'tr-TR', hasTouch: !!touch, isMobile: !!touch });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_INTERNET|net::|GPU stall|WebGL-/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  await page.goto(base + '#test'); await page.waitForTimeout(500);
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {   } }); await page.reload(); await page.waitForTimeout(1600);
  await ev(page, () => { window.__uu.intro = true; window.__uu.egitimAtla(false); });
  return page;
}
const state = page => ev(page, () => {
  const u = window.__uu, vis = id => { const e = document.getElementById(id); if (!e || e.hidden) return false; const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05 && e.getBoundingClientRect().height > 0; };
  return { i: u.introNow(), p: u.pauseReason(), m: u.UI.modal, tr: !!u.UI.train, t: u.UI.s ? u.UI.s.t : null, hud: vis('hud'), sub: vis('sub') && !!(document.getElementById('sub').textContent || '').trim(), chap: vis('chapter') && !!(document.getElementById('chapter').textContent || '').trim(), scr: u.UI.screen };
});
for (const [w, h, world, touch] of [[1366, 768, 'ay'], [1366, 768, 'mars'], [844, 390, 'ay', 1], [844, 390, 'mars', 1]]) {
  const tag = `${world} ${w}x${h}`, page = await open(w, h, touch);
  await page.click(`[data-act="start"][data-v="${world}"]`); await page.waitForTimeout(1200);
  ok(await ev(page, () => window.__uu.UI.modal === 'creator'), `${tag}: yarıya tıklayınca karakter ekranı`);
  await ev(page, () => { if (window.__uu.UI.modal === 'creator') window.__uu.crGo(); }); await page.waitForTimeout(700);
  const a = await state(page); await page.waitForTimeout(1000); const b = await state(page);
  ok(a.i && b.i && !a.m && !a.hud && !a.sub && !a.chap && !a.tr, `${tag}: animasyon oynar; HUD, pencere, altyazı, bölüm kartı yok ${JSON.stringify(a)}`);
  ok(a.p === 'intro' && a.t === b.t, `${tag}: animasyonda oyun saati durur (${a.t} → ${b.t})`);
  const lvl = await ev(page, () => window.__uu.UI.s.level);
  ok(lvl === (world === 'mars' ? 'muhendis' : 'kasif'), `${tag}: seviye ${lvl}`);
  if (w === 1366 && world === 'ay') {
    await page.waitForTimeout(1300); await shot(page, 'intro-ay-3sn');
    let n = 0; while (await ev(page, () => window.__uu.introNow()) && n++ < 40) { await shot(page, 'intro-ay-temas'); await page.waitForTimeout(250); }
    await page.waitForTimeout(150); await shot(page, 'intro-ay-sonra');
    await page.waitForFunction(() => !window.__uu.introNow(), null, { timeout: 20000 }).catch(() => {});
  } else {
    const sk = await page.waitForSelector('.cine-skip.cine-on', { timeout: 6000 }).then(() => true, () => false);
    if (sk) await page.click('.cine-skip'); else await ev(page, () => window.__uu.S3.introSkip());
    ok(sk, `${tag}: "Geç" düğmesi görünür`);
    await page.waitForFunction(() => !window.__uu.introNow(), null, { timeout: 5000 }).catch(() => {});
  }
  await page.waitForTimeout(1500);
  const c = await state(page);
  ok(!c.i && c.scr === 'game' && c.hud && c.p !== 'intro', `${tag}: animasyondan sonra oyun (HUD açık) ${JSON.stringify(c)}`);
  ok(c.tr || c.chap || c.m, `${tag}: sonra eğitim/bölüm kartı başlar ${JSON.stringify({ tr: c.tr, chap: c.chap, m: c.m })}`);
  if (w === 1366 && world === 'ay') {
    await ev(page, () => { const u = window.__uu; u.ACT.quit(); u.intro = false; u.egitimAtla(true); u.startAs('ay', 'kasif'); }); await page.waitForTimeout(1000);
    await ev(page, () => { const u = window.__uu; if (u.UI.modal === 'creator') u.crGo(); }); await page.waitForTimeout(800);
    await ev(page, () => { const u = window.__uu; if (u.tut && u.tut()) u.endTutorial(true); u.ACT.quit(); u.intro = true; }); await page.waitForTimeout(800);
    const hasCont = await ev(page, () => !!document.querySelector('[data-act="cont"]'));
    ok(hasCont, 'Devam et düğmesi var');
    if (hasCont) { await page.click('[data-act="cont"]'); await page.waitForTimeout(1200); const d = await state(page); ok(!d.i && d.scr === 'game' && d.p !== 'intro', `Devam et: animasyon oynamaz ${JSON.stringify(d)}`); }
  }
  await page.context().close();
}
await browser.close();
console.log(`\n${checks.filter(Boolean).length}/${checks.length} kontrol geçti`);
console.log(errors.length ? 'HATALAR:\n' + errors.join('\n') : 'Hata yok.');
process.exit(errors.length ? 1 : 0);
