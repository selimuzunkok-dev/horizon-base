
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), '@playwright', 'cli', 'node_modules', 'playwright-core'));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await (await browser.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
page.on('console', m => { if (m.type() === 'error') console.log('KONSOL', m.text()); });
page.on('pageerror', e => console.log('SAYFA HATASI', e.message, '\n', e.stack));
await page.goto(pathToFileURL(path.join(dir, '..', 'index.html')).href + '#test'); await page.waitForTimeout(500);
await page.evaluate(() => { if (window.__uu.egitimAtla) window.__uu.egitimAtla(true); if (window.__uu.hizliSoru) window.__uu.hizliSoru(false); });
await page.click('[data-act="start"]'); await page.waitForTimeout(300); await page.evaluate(() => { const u = window.__uu; if (u.UI.modal === 'creator') u.crGo(); u.endTutorial(true); });
const r = await page.evaluate(() => {
  const u = window.__uu, s = u.UI.s; u.UI.speed = 0; let n = 0;
  while (!s.over && n++ < 9000) { if (s.pending.length) { const p = s.pending[0]; if (p.type === 'cargo') u.resolve(s, { o2: 4, su: 4, gida: 6 }); else if (u.resolve(s, 0) === null) u.resolve(s, 1); continue; } u.tick(s); }
  return { over: s.over, modal: u.UI.modal, endShown: u.UI.endShown, t: s.t };
});
console.log(JSON.stringify(r));
await page.waitForTimeout(1200);
console.log(await page.evaluate(() => ({ modal: window.__uu.UI.modal, endShown: window.__uu.UI.endShown, box: document.getElementById('modalBox').innerText.slice(0, 200) })));
if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
await browser.close();
