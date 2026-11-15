

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const groot = execSync('npm root -g').toString().trim();
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(groot, '@playwright', 'cli', 'node_modules', 'playwright-core'));
const out = process.env.SHOTS || path.join(dir, 'shots-geri'); fs.mkdirSync(out, { recursive: true });
const base = pathToFileURL(path.join(dir, '..', 'index.html')).href;
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: (process.platform === 'linux' || process.env.YAZILIM_CIZICI === '1') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
const errors = []; let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; errors.push('KONTROL: ' + m); } console.log((c ? '✓ ' : '✗ ') + m); };
const shot = (p, n) => p.screenshot({ path: path.join(out, n + '.jpg'), type: 'jpeg', quality: 86 });
const ev = (p, f, a) => p.evaluate(f, a);
async function open(w, h, touch, keep) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'tr-TR', hasTouch: !!touch, isMobile: !!touch });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_INTERNET|net::|GPU stall|WebGL-/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  await page.goto(base + '#test'); await page.waitForTimeout(600);
  if (!keep) { await ev(page, () => { try { localStorage.clear(); } catch (e) {   } }); await page.reload(); await page.waitForTimeout(1200); }
  return page;
}
async function start(page) {
  await ev(page, () => { const u = window.__uu; u.egitimAtla(true); u.hizliSoru(false); u.startAs('ay', 'kasif'); if (u.UI.modal === 'creator') u.crGo(); });
  await page.waitForTimeout(1500);
  await ev(page, () => { const u = window.__uu; if (u.UI.modal) document.querySelector('#modal [data-act]') && null; u.setSpeed(0, true); u.UI.subQ.length = 0; if (u.UI.sub) u.subNext(); const c = document.getElementById('chapter'); if (c) c.click(); u.UI.chapUntil = 0; });
  await page.waitForTimeout(400);
}
const box = (p, sel) => ev(p, s => { const e = document.querySelector(s); if (!e || e.hidden || !e.getClientRects().length || getComputedStyle(e).visibility === 'hidden') return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; }, sel);
const inter = (a, b) => !!(a && b && a.x < b.r && b.x < a.r && a.y < b.b && b.y < a.b);

for (const [W, H, touch, tag] of [[1366, 768, false, 'masa'], [844, 390, true, 'tel']]) {
  const page = await open(W, H, touch);
  await start(page);

  const fs1 = await ev(page, () => { const e = document.querySelector('#objective .o-msg'); return e ? parseFloat(getComputedStyle(e).fontSize) : 0; });
  ok(fs1 >= (touch ? 14 : 16) && fs1 <= (touch ? 15 : 17), `${tag}: hedef yazısı ${fs1}px (masaüstü 16, telefon 14)`);
  if (!touch) await shot(page, 'hedef-yazi');

  await ev(page, () => { const u = window.__uu; u.enterPlan(); u.setSpeed(1, true); });
  await page.waitForTimeout(500);
  const pb = await ev(page, () => document.getElementById('planBar').innerText.trim());
  ok(/^Zaman durdu$/.test(pb), `${tag}: şerit yalnız "Zaman durdu" (${JSON.stringify(pb)})`);
  await ev(page, () => window.__uu.queueSub({ from: 'mc', text: 'Sıradan bir hikâye satırı burada duruyor.', c: 'info' }));
  await page.waitForTimeout(1500);
  ok(!(await box(page, '#sub')), `${tag}: inşa açıkken sıradan telsiz satırı görünmez`);

  await ev(page, () => window.__uu.queueSub({ from: 'mc', text: 'Yeşil kareye tıkla, güneş paneli orada kurulur.', c: 'info', local: true }));
  await page.waitForTimeout(1200);
  const sb = await box(page, '#sub'), lab = await box(page, '#planLabel'), bar = await box(page, '#planBar');
  ok(!!sb && sb.h <= 44.5 && sb.w <= W * 0.46 + 1, `${tag}: talimat inşada dar (${sb ? Math.round(sb.w) + 'x' + Math.round(sb.h) : 'yok'})`);
  ok(!!sb && sb.x < W / 2 - 40, `${tag}: talimat solda`);
  ok(!inter(sb, lab), `${tag}: talimat #planLabel ile çakışmaz`);
  ok(!!sb && !inter(sb, bar), `${tag}: talimat şeridin altında`);
  const mid = { x: W / 2 - 30, y: H / 2 - 30, r: W / 2 + 30, b: H / 2 + 30 };
  ok(!inter(sb, mid), `${tag}: talimat ekran ortasını örtmez`);
  await shot(page, touch ? 'tel-insa' : 'insa-altyazi');
  if (!touch) { await ev(page, () => { const u = window.__uu; u.UI.subQ.length = 0; if (u.UI.sub) u.subNext(); }); await page.waitForTimeout(400); await shot(page, 'insa-sade'); }

  const kb = await ev(page, () => [...new Set([...document.querySelectorAll('kbd')].filter(e => e.getClientRects().length && getComputedStyle(e).display !== 'none' && e.offsetParent).map(e => e.textContent.trim()))]);
  if (touch) ok(kb.length === 0, `tel: dokunmatikte kbd ipucu yok (${kb.join(',')})`);
  else ok(kb.length >= 4, `masa: en az 4 farklı kbd ipucu (${kb.join(',')})`);
  await ev(page, () => window.__uu.exitPlan());
  await page.waitForTimeout(2500);
  ok(!!(await box(page, '#sub')), `${tag}: inşa kapanınca bekleyen satır görünür`);

  const rs = await ev(page, () => {
    const u = window.__uu, s = u.UI.s, o = {}; u.setSpeed(0, true);
    const keep = JSON.parse(JSON.stringify({ res: s.res, rate: s.rate }));
    const fix = r => { s.rate[r] = { c: 10, p: 0 }; s.res[r] = 15; u.pwTick(); const e = document.getElementById('pwWarn'); return e.hidden ? '' : e.innerText.replace(/\s+/g, ' '); };
    o.o2 = fix('o2'); s.res.o2 = keep.res.o2; s.rate.o2 = keep.rate.o2;
    o.su = fix('su'); s.res.su = keep.res.su; s.rate.su = keep.rate.su;
    o.gida = fix('gida');
    o.both = document.querySelectorAll('#pwWarn').length;
    o.sw = document.documentElement.scrollWidth;
    s.res.gida = keep.res.gida; s.rate.gida = keep.rate.gida; u.pwTick(); o.after = document.getElementById('pwWarn').hidden || !/Yemek/.test(document.getElementById('pwWarn').innerText);
    return o;
  });
  ok(/Hava 1 gün sonra bitecek!/.test(rs.o2) && /Çözüm: .+ kur/.test(rs.o2), `${tag}: hava şeridi (${rs.o2})`);
  ok(/Su 1 gün sonra bitecek!/.test(rs.su) && /Çözüm:/.test(rs.su), `${tag}: su şeridi (${rs.su})`);
  ok(/Yemek 1 gün sonra bitecek!/.test(rs.gida) && /Çözüm:/.test(rs.gida), `${tag}: yemek şeridi (${rs.gida})`);
  ok(rs.after, `${tag}: kaynak düzelince şerit kalkar`);
  ok(rs.sw <= W, `${tag}: taşma yok (${rs.sw})`);
  if (!touch) {

    await ev(page, () => { window.__uu.ACT.keyHints(); });
    const n0 = await ev(page, () => [...document.querySelectorAll('kbd')].filter(e => e.getClientRects().length && getComputedStyle(e).display !== 'none').length);
    ok(n0 === 0, `masa: ayar kapalıyken görünen kbd yok (${n0})`);
    const p2 = page; await page.reload(); await page.waitForTimeout(1200); await start(p2);
    const n1 = await ev(p2, () => ({ set: window.__uu.UI.set.keys, cls: document.getElementById('app').classList.contains('nokeys') }));
    ok(n1.set === false && n1.cls, `masa: yenileyince "Kapalı" korunur (${JSON.stringify(n1)})`);
    await ev(p2, () => { window.__uu.ACT.keyHints(); });
  }
}
await browser.close();
console.log(`\ngeri-g: ${pass}/${pass + fail} kontrol geçti`);
if (errors.length) { console.log(errors.join('\n')); process.exit(1); }
