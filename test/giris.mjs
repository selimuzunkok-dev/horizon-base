

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const groot = execSync('npm root -g').toString().trim();
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(groot, '@playwright', 'cli', 'node_modules', 'playwright-core'));
const out = process.env.SHOTS || path.join(dir, 'shots-giris'); fs.mkdirSync(out, { recursive: true });
const base = pathToFileURL(path.join(dir, '..', 'index.html')).href;
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: (process.platform === 'linux' || process.env.YAZILIM_CIZICI === '1') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
const errors = [], checks = [];
const ok = (c, m) => { checks.push([!!c, m]); console.log((c ? '✓ ' : '✗ ') + m); if (!c) errors.push('KONTROL: ' + m); };
const shot = (p, n) => p.screenshot({ path: path.join(out, n + '.jpg'), type: 'jpeg', quality: 86 });
async function open(w, h, opt = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: opt.locale || 'tr-TR', hasTouch: !!opt.touch, isMobile: !!opt.touch });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_INTERNET|net::|GPU stall|WebGL-/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
  await page.goto(base + (opt.hash != null ? opt.hash : '#test'));
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {   } }); await page.reload(); await page.waitForTimeout(1600);
  return page;
}
const ev = (p, f, a) => p.evaluate(f, a);

{
  const page = await open(1366, 768);
  const L = await ev(page, () => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
    const hit = (x, y) => { const e = document.elementFromPoint(x, y); const h = e && e.closest('.gs-half'); return h ? h.dataset.w : null; };
    return { ay: r('.gs-half[data-w="ay"]'), mars: r('.gs-half[data-w="mars"]'), lv: document.querySelectorAll('[data-act="level"], .lv').length, name: !!document.getElementById('cmdName') || !!document.querySelector('#title input'),
      hitL: hit(200, 300), hitR: hit(1166, 300), hitLB: hit(200, 600), hitRB: hit(1166, 600), gl: window.__uu.gsState().gl, about: !!document.querySelector('#title [data-act="about"]'),
      how: !!document.querySelector('#title [data-act="how"]'), src: !!document.querySelector('#title [data-act="src"]'), cont: !!document.querySelector('#title [data-act="cont"]'),
      go: [...document.querySelectorAll('.gs-go')].map(e => e.getBoundingClientRect().height), txt: document.getElementById('title').innerText,
      sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight };
  });
  ok(L.ay && L.mars && L.ay.x <= 0 && L.mars.x + L.mars.w >= 1366 && L.ay.w + L.mars.w >= 1366 && L.ay.h >= 760 && L.mars.h >= 760, 'iki yarı görünür ve ekranı kaplar');
  ok(L.hitL === 'ay' && L.hitR === 'mars' && L.hitLB === 'ay' && L.hitRB === 'mars', `sol yarı Ay, sağ yarı Mars (isabet: ${L.hitL}/${L.hitR}/${L.hitLB}/${L.hitRB})`);
  ok(L.lv === 0 && !L.name, 'seviye kartı ve ad kutusu yok');
  ok(L.about && L.how && L.src && !L.cont, 'alt şerit: Proje hakkında, Nasıl oynanır, Veri kaynakları (kayıt yokken Devam et yok)');
  ok(L.go.length === 2 && L.go.every(h => h >= 56), `"in" düğmeleri ≥56 px (${L.go.join(', ')})`);
  ok(/AY/.test(L.txt) && /MARS/.test(L.txt) && /Kolay/.test(L.txt) && /Zor/.test(L.txt) && /Ay'a in/.test(L.txt) && /Mars'a in/.test(L.txt) && /30 gün/.test(L.txt) && /40 sol/.test(L.txt), 'TR metinler: ad, zorluk, düğmeler, görev süresi');
  ok(L.gl, '3B arka plan (GIRIS) çalışıyor');
  ok(L.sw <= 1366 && L.sh <= 768, 'masaüstünde taşma yok');
  await shot(page, 'baslik-masa');
  await page.mouse.move(300, 380); await page.waitForTimeout(900);
  const fa = await ev(page, () => ({ f: document.getElementById('titleInner').dataset.focus, w: document.querySelector('.gs-half[data-w="ay"] .gs-in').getBoundingClientRect().width }));
  ok(fa.f === 'ay' && fa.w > 1366 * 0.5, `Ay'ın üstüne gelince Ay yarısı genişler (${Math.round(fa.w)} px)`);
  await shot(page, 'baslik-ay-hover');
  await page.mouse.move(1060, 380); await page.waitForTimeout(900);
  ok(await ev(page, () => document.getElementById('titleInner').dataset.focus) === 'mars', 'Mars\'ın üstüne gelince odak Mars');
  await shot(page, 'baslik-mars-hover');

  for (const [act, sel] of [['how', 'how'], ['src', 'src'], ['about', 'about']]) {
    await page.click(`#title [data-act="${act}"]`); await page.waitForTimeout(350);
    const m = await ev(page, () => ({ open: !document.getElementById('modal').hidden, n: (document.getElementById('modalBox').innerText || '').length }));
    ok(m.open && m.n > 40, `"${sel}" penceresi açılır`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    ok(await ev(page, () => document.getElementById('modal').hidden), `"${sel}" penceresi Esc ile kapanır`);
  }
  const ab = await ev(page, () => window.__uu.STR.ab1[0] + ' ' + window.__uu.STR.ab3b[1]);
  ok(/Ay görevi kolaydır/.test(ab) && /Mars mission is hard/.test(ab), 'Proje hakkında metni: Ay kolay (Kâşif), Mars zor (Mühendis)');

  await page.mouse.move(683, 20);
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
  ok(await ev(page, () => document.activeElement && document.activeElement.dataset.w) === 'mars', '→ Mars yarısına odaklar');
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(100);
  ok(await ev(page, () => document.activeElement && document.activeElement.dataset.w) === 'ay', '← Ay yarısına odaklar');

  await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
  let s = await ev(page, () => { const u = window.__uu; return u.UI.s ? { w: u.UI.s.world, lv: u.UI.s.level, scr: u.UI.screen, gl: u.gsState().gl } : null; });
  ok(s && s.w === 'ay' && s.lv === 'kasif' && s.scr === 'game', `Ay yarısı Kâşif başlatır (${JSON.stringify(s)})`);
  ok(s && !s.gl, 'oyuna geçince 3B giriş sahnesi bırakıldı');
  await ev(page, () => { const u = window.__uu; u.UI.egSkip = true; if (u.UI.modal === 'creator') u.crGo(); });
  await page.waitForTimeout(300);
  await ev(page, () => { const u = window.__uu; u.UI.egSkip = true; if (u.UI.modal) u.ACT.closeModal(); u.saveGame(); u.ACT.quit(); });
  await page.waitForTimeout(1200);
  const k = await ev(page, () => ({ cont: (document.querySelector('#title [data-act="cont"]') || {}).innerText || '', gl: window.__uu.gsState().gl, scr: window.__uu.UI.screen }));
  ok(k.scr === 'title' && /Devam et/.test(k.cont), `kayıt varken "Devam et" görünür ("${k.cont}")`);
  ok(k.gl, 'başlığa dönünce 3B arka plan yeniden kuruldu');
  await shot(page, 'baslik-kayitli');

  await page.click('.gs-half[data-w="mars"]', { position: { x: 400, y: 250 } }); await page.waitForTimeout(1500);
  s = await ev(page, () => { const u = window.__uu; return u.UI.s ? { w: u.UI.s.world, lv: u.UI.s.level } : null; });
  ok(s && s.w === 'mars' && s.lv === 'muhendis', `Mars yarısı Mühendis başlatır (${JSON.stringify(s)})`);
  await page.context().close();
}
{
  const page = await open(1280, 720);
  const lv = await ev(page, () => window.__uu.startAs('ay', 'muhendis')); await page.waitForTimeout(800);
  const s = await ev(page, () => ({ w: window.__uu.UI.s.world, lv: window.__uu.UI.s.level }));
  ok(lv === 'muhendis' && s.w === 'ay' && s.lv === 'muhendis', '__uu.startAs("ay","muhendis")');
  await page.context().close();
}
{
  const page = await open(1366, 768);
  if (await ev(page, () => !!(window.__uu.S3 && typeof window.__uu.S3.intro === 'function'))) {
    await ev(page, () => { window.__uu.intro = true; window.__uu.egitimAtla(false); });
    await page.click('[data-act="start"][data-v="ay"]'); await page.waitForTimeout(1200);
    await ev(page, () => { if (window.__uu.UI.modal === 'creator') window.__uu.crGo(); }); await page.waitForTimeout(600);
    const on = await ev(page, () => ({ i: window.__uu.introNow(), p: window.__uu.pauseReason(), m: window.__uu.UI.modal, tr: !!window.__uu.UI.train }));
    ok(on.i && !on.m && !on.tr, `yaratıcıdan sonra iniş animasyonu oynar, pencere/eğitim yok (${JSON.stringify(on)})`);
    await page.waitForFunction(() => !window.__uu.introNow(), null, { timeout: 20000 }).catch(() => {}); await page.waitForTimeout(1500);
    const af = await ev(page, () => ({ i: window.__uu.introNow(), tr: !!window.__uu.UI.train }));
    ok(!af.i && af.tr, `animasyon bitince eğitim başlar (${JSON.stringify(af)})`);
    ok(await ev(page, () => window.__uu.S3.mode === 'walk'), 'kamera-3p: iniş animasyonundan sonra (eğitimde) görünüm üçüncü şahıs');
  } else console.log('- S3.intro yok (giris-l birleşmedi): iniş animasyonu kontrolü atlandı');
  await page.context().close();
}
{
  const page = await open(1366, 768, { locale: 'en-US', hash: '#test' });
  await ev(page, () => { if (window.__uu && document.documentElement.lang !== 'en') window.__uu.ACT.lang(); }); await page.waitForTimeout(600);
  const t = await ev(page, () => document.getElementById('title').innerText);
  ok(/MOON/.test(t) && /Land on the Moon/.test(t) && /Land on Mars/.test(t) && /Easy · first-time players/.test(t) && /Hard · experienced players/.test(t) && /30 days/.test(t) && /40 sols/.test(t), 'EN metinler');
  await shot(page, 'baslik-en');
  await page.context().close();
}
for (const [w, h, n] of [[844, 390, 'baslik-tel'], [390, 844, 'baslik-tel-dikey']]) {
  const page = await open(w, h, { touch: true });
  const r = await ev(page, () => {
    const W = innerWidth, H = innerHeight, bad = [];
    for (const e of document.querySelectorAll('#title button, #title .gs-pill, #title .gs-name, #title .gs-chip, #title .gs-logo h1')) {
      if (!e.getClientRects().length || getComputedStyle(e).display === 'none') continue;
      const b = e.getBoundingClientRect(); if (e.classList.contains('gs-half')) continue;
      if (b.left < -1 || b.top < -1 || b.right > W + 1 || b.bottom > H + 1) bad.push((e.className || e.tagName) + ' ' + [b.left, b.top, b.right, b.bottom].map(Math.round));
    }
    const tgt = [...document.querySelectorAll('#title .gs-foot button, #title .gs-lang, #title .gs-go')].filter(e => e.getClientRects().length).map(e => Math.round(e.getBoundingClientRect().height));
    const ov = []; const els = [...document.querySelectorAll('.gs-half[data-w="ay"] .gs-in, .gs-half[data-w="mars"] .gs-in, .gs-logo, .gs-foot')].map(e => [e.className, e.getBoundingClientRect()]);
    for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) { const a = els[i][1], b = els[j][1]; if (a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2) ov.push(els[i][0] + '×' + els[j][0]); }
    return { bad, tgt, ov, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight };
  });
  ok(!r.bad.length && r.sw <= w && r.sh <= h, `${w}x${h}: taşma yok ${r.bad.join(' | ')}`);
  ok(r.tgt.every(x => x >= 44), `${w}x${h}: dokunma hedefleri ≥44 px (${r.tgt.join(',')})`);
  ok(!r.ov.length, `${w}x${h}: içerik blokları çakışmıyor ${r.ov.join(' | ')}`);
  await shot(page, n);
  if (w === 844) { await page.tap('.gs-half[data-w="ay"] .gs-go'); await page.waitForTimeout(1500); ok(await ev(page, () => window.__uu.UI.screen === 'game' && window.__uu.UI.s.level === 'kasif'), '844x390: dokununca Ay (Kâşif) başlar'); }
  await page.context().close();
}
{
  const page = await open(1366, 768, { hash: '' });
  await ev(page, () => { const g = document.getElementById('titleInner'); window.__dv = ''; new MutationObserver(() => { if (g.dataset.dive) window.__dv = g.dataset.dive; }).observe(g, { attributes: true }); });
  await page.mouse.move(300, 300); await page.mouse.click(300, 300);
  await page.waitForFunction(() => window.__dv, null, { timeout: 5000 }).catch(() => {}); await page.waitForTimeout(250);
  const d = await ev(page, () => window.__dv);
  ok(d === 'ay', 'tıklanınca dalış geçişi başlar');
  await shot(page, 'baslik-dalis');
  await page.waitForTimeout(1600);
  ok(await ev(page, () => document.getElementById('title').hidden && !document.getElementById('game').hidden), 'dalıştan sonra oyun ekranı');
  await page.context().close();
}
{
  for (const [w, h, touch, n] of [[1366, 768, false, 'masaüstü'], [844, 390, true, 'telefon']]) {
    const page = await open(w, h, { touch });
    const md = () => ev(page, () => window.__uu.S3.mode);
    const go = async (wo, lv) => {
      if (await ev(page, () => window.__uu.UI.screen !== 'title')) { await ev(page, () => { const u = window.__uu; if (u.UI.modal) u.ACT.closeModal(); u.ACT.quit(); }); await page.waitForTimeout(1300); }
      const r = await ev(page, a => { window.__uu.UI.egSkip = true; return window.__uu.startAs(a[0], a[1]); }, [wo, lv]); await page.waitForTimeout(500);
      await ev(page, () => { const u = window.__uu; if (u.UI.modal === 'creator') u.crGo(); }); await page.waitForTimeout(500);
      await ev(page, () => { const u = window.__uu; if (u.UI.modal) u.ACT.closeModal(); }); await page.waitForTimeout(200);
      return r;
    };
    for (const [wo, lv] of [['ay', 'kasif'], ['mars', 'muhendis'], ['ay', 'muhendis'], ['mars', 'kasif']]) {
      const r = await go(wo, lv);
      ok(r === lv && await md() === 'walk', `${n}: yeni görev ${wo}/${lv} üçüncü şahısla açılır (${r})`);
    }
    await ev(page, () => window.__uu.toggleView()); await page.waitForTimeout(300);
    ok(await md() === 'drone', `${n}: Kuşbakışı (V) tepeden görünüme geçer`);
    await ev(page, () => window.__uu.toggleView()); await page.waitForTimeout(300);
    ok(await md() === 'walk', `${n}: yine V ile üçüncü şahısa döner`);
    await ev(page, () => { window.__uu.enterPlan(); }); await page.waitForTimeout(400);
    const pm = await md();
    await ev(page, () => { window.__uu.exitPlan(); }); await page.waitForTimeout(400);
    ok(pm === 'plan' && await md() === 'walk', `${n}: inşa tepeden plan (${pm}), kapanınca üçüncü şahıs`);
    await ev(page, () => window.__uu.toggleView()); await page.waitForTimeout(300);
    await ev(page, () => { window.__uu.enterPlan(); }); await page.waitForTimeout(400);
    await ev(page, () => { window.__uu.exitPlan(); }); await page.waitForTimeout(400);
    ok(await md() === 'drone', `${n}: oyuncu kuşbakışı seçtiyse inşadan sonra kuşbakışı kalır`);
    await go('mars', 'muhendis');
    ok(await md() === 'drone', `${n}: oyuncunun kuşbakışı seçimi oturumda yeni görevde de kalır`);
    await page.context().close();
  }
}
await browser.close();
const n = checks.filter(c => c[0]).length;
console.log(`\n${n}/${checks.length} kontrol geçti`);
if (errors.length) { console.log('HATALAR:\n' + errors.join('\n')); process.exit(1); }
