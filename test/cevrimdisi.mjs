
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const groot = execSync('npm root -g').toString().trim();
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(groot, '@playwright', 'cli', 'node_modules', 'playwright-core'));
const out = path.join(dir, 'shots'); fs.mkdirSync(out, { recursive: true });
const url = pathToFileURL(path.join(dir, '..', 'index.html')).href + '#test';
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: (process.platform === 'linux' || process.env.YAZILIM_CIZICI === '1') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1, locale: 'tr-TR' });
const page = await ctx.newPage();
const errors = [], aborted = [];
await page.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file:') || u.startsWith('data:') || u.startsWith('blob:') || u.startsWith('about:')) return r.continue(); aborted.push(u); return r.abort(); });
page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_FAILED|ERR_INTERNET|net::|GPU stall|WebGL-/.test(m.text())) errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
await page.goto(url); await page.waitForTimeout(1500);
const three = await page.evaluate(() => typeof window.THREE === 'object' && !!window.THREE.WebGLRenderer ? window.THREE.REVISION : null);
const gl = await page.evaluate(() => window.__uu.UI.gl);
await page.evaluate(() => { if (window.__uu.egitimAtla) window.__uu.egitimAtla(true); if (window.__uu.hizliSoru) window.__uu.hizliSoru(false); });
await page.click('[data-act="start"]'); await page.waitForTimeout(2500);

if (await page.evaluate(() => window.__uu.UI.modal === 'creator')) { await page.fill('#crName', 'Ada'); await page.click('#crGo'); await page.waitForTimeout(1500); }
await page.screenshot({ path: path.join(out, 'cevrimdisi.png') });
await browser.close();
console.log('iptal edilen istekler:', aborted.length ? aborted.join(' | ') : '(yok)');
console.log('THREE sürüm:', three, '· UI.gl (sahne):', gl, '· konsol hatası:', errors.length);
errors.forEach(e => console.log('  HATA', e));
const ok = three && gl && !errors.length && aborted.every(u => /fonts\.g/.test(u));
console.log(ok ? 'CEVRIMDISI TAMAM' : 'CEVRIMDISI BASARISIZ');
process.exit(ok ? 0 : 1);
