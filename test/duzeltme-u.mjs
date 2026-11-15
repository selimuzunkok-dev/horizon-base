

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const groot = execSync('npm root -g').toString().trim();
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(groot, '@playwright', 'cli', 'node_modules', 'playwright-core'));
const url = pathToFileURL(path.join(dir, '..', 'index.html')).href + '#test';
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: [] });
const errors = [], checks = [];
const ok = (c, m) => { checks.push(!!c); if (!c) errors.push(m); console.log((c ? '✓ ' : '✗ ') + m); };
const ev = (p, f, a) => p.evaluate(f, a);

async function open(vw, vh, touch) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1, locale: 'tr-TR', hasTouch: !!touch, isMobile: false });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_INTERNET|net::|GPU stall|WebGL-/.test(m.text())) errors.push(m.text()); });
  await page.goto(url); await page.waitForTimeout(800);
  await ev(page, () => { window.__uu.egitimAtla(true); if (window.__uu.hizliSoru) window.__uu.hizliSoru(false); });
  await page.click('[data-act="start"]'); await page.waitForTimeout(1500);
  if (await ev(page, () => window.__uu.UI.modal === 'creator')) { await page.click('#crGo').catch(() => {}); await page.waitForTimeout(900); }
  await ev(page, () => { const u = window.__uu; try { u.endTutorial(true); } catch (e) {   } if (u.UI.modal) u.ACT.closeModal(); u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); u.setSpeed(1); u.refresh(true); });
  return { ctx, page };
}
const box = (p, sel) => ev(p, s => { const e = document.querySelector(s); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom, r: r.right }; }, sel);

{
  const { ctx, page } = await open(1366, 768);
  const k0 = await box(page, '[data-act="buildMenu"]');
  await ev(page, () => { const e = document.getElementById('ctxAct'); e.hidden = false; e.innerHTML = '<span>İncele</span>'; });
  await page.waitForTimeout(100);
  const k1 = await box(page, '[data-act="buildMenu"]');
  ok(k0 && k1 && Math.abs(k0.x - k1.x) < 1 && Math.abs(k0.y - k1.y) < 1, `Kur İncele görününce yerinde kalır (${k0 && Math.round(k0.x)} → ${k1 && Math.round(k1.x)})`);
  const c1 = await box(page, '#ctxAct');
  ok(c1 && k1 && c1.r <= k1.x + 1, 'İncele Kur\'un solunda kendi yuvasında');

  await ev(page, () => { document.getElementById('ctxAct').hidden = true; });
  await page.mouse.click(k0.x + k0.w / 2, k0.y + k0.h / 2); await page.waitForTimeout(500);
  ok(await ev(page, () => !!window.__uu.UI.plan), 'Kur\'un yerine tık inşa görünümünü açar');
  await ev(page, () => window.__uu.exitPlan());

  const sp = [];
  for (let i = 0; i < 5; i++) { await page.click('#speedBtn'); sp.push(await ev(page, () => window.__uu.UI.speed)); }
  ok(!sp.includes(0), 'hız düğmesi döngüsünde duraklatma yok: ' + sp.join(','));

  const g = await ev(page, () => { const u = window.__uu, s = u.UI.s; u.pushEvent(s, 'flare'); u.refresh(true); const o = document.getElementById('objective'); return { vis: !o.hidden && !o.classList.contains('off') && o.textContent.trim().length > 0, calls: document.getElementById('calls').children.length }; });
  ok(g.vis, `hedef çipi çağrı varken görünür (çağrı satırı: ${g.calls})`);

  const q = await ev(page, () => { const u = window.__uu; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext();
    for (let i = 0; i < 8; i++) u.queueSub({ from: 'mc', text: 'Hikâye satırı numara ' + i + '. Ekip bugün çok mutlu ve çalışkan.', beat: 'b' + i });
    const a = u.UI.subQ.length; u.queueSub({ from: 'atlas', text: 'Kur düğmesine bas.', local: true, c: 'info' }); u.queueSub({ from: 'atlas', text: 'Hava makinesini seç.', local: true, c: 'info' });
    return { a, b: u.UI.subQ.length, ins: u.UI.subQ.filter(x => x.ins).map(x => x.text) }; });
  ok(q.a <= 3 && q.b <= 3, `altyazı kuyruğu en çok 3 (${q.a}, ${q.b})`);
  ok(q.ins.length === 1 && /Hava/.test(q.ins[0]), 'yeni talimat eskisinin yerine geçer: ' + JSON.stringify(q.ins));
  const d = await ev(page, () => window.__uu.subMs(14));
  const dur = await ev(page, () => { const u = window.__uu; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); u.queueSub({ from: 'mc', text: 'bir iki üç dört beş altı yedi sekiz dokuz on on bir on iki', beat: 'x' }); u.subNext(); return null; });
  void d; void dur;
  await ctx.close();
}
{
  const { ctx, page } = await open(844, 390, true);
  const bid = await ev(page, () => { const u = window.__uu, s = u.UI.s; const b = s.b.find(o => o.k !== 'hub') || s.b[0]; u.modalBuilding(b.id); return b.id; });
  await page.waitForTimeout(400);
  const mb = await box(page, '#modalBox'), okb = await box(page, '#modalBox .m-foot .primary');
  ok(mb && mb.b <= 390 && mb.y >= 0, `yapı kartı ekrana sığar (alt ${mb && Math.round(mb.b)} ≤ 390, yapı ${bid})`);
  ok(okb && okb.b <= 390 && okb.h >= 40, `Tamam görünür ve ≥ 40 px (${okb && Math.round(okb.h)})`);
  const fact = await ev(page, () => { const d = document.querySelector('#modalBox details.dyk'); const f = [...document.querySelectorAll('#modalBox .fact')].filter(x => x.checkVisibility()); return { d: !!d, open: d ? d.open : null, factVis: f.length > 0, out: f.map(x => x.parentElement.className + ':' + x.textContent.slice(0, 40)) }; });
  ok(!fact.factVis, 'Kâşif: "Gerçekte" kutusu kapalı (Biliyor muydun?) ' + JSON.stringify(fact));
  await ev(page, () => window.__uu.ACT.closeModal());
  await ev(page, () => { const u = window.__uu; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); u.UI.chapUntil = 0; const c = document.getElementById('chapter'); if (c) c.hidden = true; u.queueSub({ from: 'mc', text: 'Bir okul üsle bağlantı kurdu. Öğrenciler ne yediğinizi ve gökyüzünü merak ediyor.', beat: 'z' }); });
  await page.waitForFunction(() => { const e = document.querySelector('#sub .s-next'); return e && !document.getElementById('sub').hidden && e.getBoundingClientRect().height > 0; }, null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(600);
  console.log(JSON.stringify(await ev(page, () => ({ st: window.__uu.subState(), modal: window.__uu.UI.modal, sp: window.__uu.UI.speed, hid: document.getElementById('sub').hidden, cls: document.getElementById('sub').className }))));
  const nx = await box(page, '#sub .s-next');
  ok(nx && nx.w >= 40 && nx.h >= 40, `altyazı › ≥ 40 px (${nx && nx.w}x${nx && nx.h})`);
  const kur = await box(page, '[data-act="buildMenu"]'), sb = await box(page, '#speedBtn');
  ok(kur && kur.h >= 40 && sb && sb.h >= 40 && sb.w >= 40, 'Kur ve hız ≥ 40 px');
  await ctx.close();
}
await browser.close();
console.log(`\n${checks.filter(Boolean).length}/${checks.length} kontrol geçti`);
if (errors.length) { console.log('HATALAR:\n' + errors.join('\n')); process.exit(1); }
