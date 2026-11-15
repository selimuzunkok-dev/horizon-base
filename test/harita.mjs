

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const groot = execSync('npm root -g').toString().trim();
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(groot, '@playwright', 'cli', 'node_modules', 'playwright-core'));
const out = process.env.SHOTS || path.join(dir, 'shots-harita'); if (process.env.SHOTS) fs.mkdirSync(out, { recursive: true });
const url = pathToFileURL(path.join(dir, '..', 'index.html')).href + '#test';
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: (process.platform === 'linux' || process.env.YAZILIM_CIZICI === '1') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
const errors = [], checks = [];
const t0 = Date.now(), lap = m => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)} sn] ${m}`);
const ok = (cond, msg) => { checks.push([!!cond, msg]); if (!cond) { errors.push('KONTROL: ' + msg); lap('✗ ' + msg); } else lap('✓ ' + msg); };
const ev = (page, f, a) => page.evaluate(f, a);
const wait = (page, ms) => page.waitForTimeout(ms);
const until = (page, f, a, ms) => page.waitForFunction(f, a, { timeout: ms || 15000, polling: 100 }).then(() => true, () => false);
const shot = async (page, n) => { if (!process.env.SHOTS) return; try { await page.screenshot({ path: path.join(out, n + '.png'), timeout: 180000 }); } catch (e) { lap('ekran görüntüsü alınamadı: ' + n); } };

async function open(vp, level, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, locale: 'tr-TR', hasTouch: !!touch, isMobile: false });
  const page = await ctx.newPage();
  page.setDefaultTimeout(120000);
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_INTERNET|net::|GPU stall|WebGL-/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message + '\n' + e.stack));
  await page.goto(url); await wait(page, 900);
  await ev(page, () => { try { localStorage.clear(); } catch (e) {   } }); await page.reload(); await wait(page, 1500);
  await ev(page, () => { if (window.__uu && typeof window.__uu.egitimAtla === 'function') window.__uu.egitimAtla(true); });
  await ev(page, lv => window.__uu.startAs('ay', lv || 'kasif'), level || null); await wait(page, 1500);
  if (await ev(page, () => window.__uu.UI.modal === 'creator')) { await page.click('#crGo').catch(() => {}); await wait(page, 900); }
  await ev(page, () => { const u = window.__uu; try { u.endTutorial(true); } catch (e) {   } });
  await page.click('[data-act="tutSumGo"]', { timeout: 3000 }).catch(() => {}); await wait(page, 500);
  await ev(page, () => { const u = window.__uu; if (u.UI.modal) u.ACT.closeModal(); u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); u.UI.s.pending.length = 0; u.setSpeed(0); u.refresh(true); });
  return { ctx, page };
}
const HR = page => ev(page, () => !!(window.__uuMods && window.__uuMods.HARITA));
const miniBox = page => ev(page, () => { const e = document.getElementById('hrMini'); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return r.width > 0 ? { x: r.x, y: r.y, w: r.width, h: r.height } : null; });
const overlaps = page => ev(page, () => {
  const m = document.getElementById('hrMini').getBoundingClientRect(), hit = [];
  const sel = ['#hudTL', '#hudTR', '#objective', '#gauges', '#hudBR', '#acts', '#menuBtn', '#speedBtn', '#ctxAct', '#sub', '#calls'];
  for (const s of sel) for (const el of document.querySelectorAll(s)) {
    if (el.hidden || el.offsetParent === null) continue;
    const kids = s === '#hudTR' || s === '#hudTL' || s === '#gauges' ? [...el.children].filter(k => k.offsetParent !== null) : [el];
    for (const k of kids) { const r = k.getBoundingClientRect(); if (!r.width || !r.height) continue;
      if (r.x < m.x + m.width && r.x + r.width > m.x && r.y < m.y + m.height && r.y + r.height > m.y) hit.push(s + ' ' + (k.id || k.className || k.tagName)); }
  }
  return hit;
});
async function layout(page, tag, want) {
  await until(page, () => { const e = document.getElementById('hrMini'); return !!e && !e.hidden; }, null, 20000);
  await wait(page, 400);
  const b = await miniBox(page);
  ok(!!b, `${tag}: mini harita ana ekranda görünür ${JSON.stringify(b)}`);
  if (!b) return;
  ok(Math.abs(b.w - want) <= 12, `${tag}: mini harita genişliği ~${want} px (${Math.round(b.w)})`);
  const vp = page.viewportSize();
  ok(b.x + b.w <= vp.width - 4 && b.y >= 0 && b.x > vp.width / 2, `${tag}: sağ üst köşede ve ekranın içinde`);
  ok(b.w >= 44 && b.h >= 44, `${tag}: dokunma alanı ≥44 px (${Math.round(b.w)}×${Math.round(b.h)})`);
  const hit = await overlaps(page);
  ok(hit.length === 0, `${tag}: saat, hedef, halkalar, düğmelerle çakışmaz ${hit.join(', ')}`);
  const txt = await ev(page, () => document.getElementById('hrMini').innerText.trim());
  ok(txt === '', `${tag}: mini harita yazı taşımaz`);
}


{
  const { ctx, page } = await open({ width: 1366, height: 768 }, null, false);
  ok(await HR(page), 'HARITA #test adresinde window.__uuMods.HARITA olarak kayıtlı');
  ok(await ev(page, () => window.__uu.UI.screen === 'game' && !window.__uu.UI.pda), 'oyun ekranı açık, Tablet kapalı');
  await layout(page, '1366 Kâşif', 176);
  const api = await ev(page, () => { const S3 = window.__uu.S3; const c = S3.crewPos(), r = S3.roverPos(); return { c: Array.isArray(c) && c.every(o => isFinite(o.x) && isFinite(o.z) && typeof o.name === 'string'), r: r === null || (isFinite(r.x) && isFinite(r.z)), tf: typeof S3.teachFx === 'function' }; });
  ok(api.c && api.r && api.tf, 'S3.crewPos() [{x,z,name}], S3.roverPos() {x,z}|null, S3.teachFx var ' + JSON.stringify(api));
  const tf = await ev(page, () => { const S3 = window.__uu.S3, s = window.__uu.UI.s, hub = s.b.find(b => b.k === 'hub'); return { bad: S3.teachFx(987654, 'yok'), hub: S3.teachFx(hub.id, 'hub') }; });
  ok(tf.bad === false && typeof tf.hub === 'boolean', 'teachFx: olmayan yapıda false, var olanda true|false ' + JSON.stringify(tf));

  const d0 = await ev(page, () => window.__uuMods.HARITA._debug());
  const tips = [...new Set(d0.map(i => i.tip))];
  ok(['us', 'oyuncu', 'sis'].every(t => tips.includes(t)), 'mini harita üs, oyuncu ve sisi çizer ' + tips.join(','));
  ok(d0.some(i => i.tip === 'kaynak'), 'keşfedilmiş kaynaklar çizilir (' + d0.filter(i => i.tip === 'kaynak').map(i => i.k).join('') + ')');
  const kc = {}; d0.filter(i => i.tip === 'kaynak').forEach(i => { kc[i.k] = i.col; });
  ok(new Set(Object.values(kc)).size === Object.keys(kc).length, 'kaynak türleri ayrı renkte (biçimleri de ayrı) ' + JSON.stringify(kc));

  const br = await ev(page, () => {
    const u = window.__uu, s = u.UI.s; let b = s.b.find(o => o.k !== 'hub' && o.left === 0);
    if (!b) { const hub = s.b.find(o => o.k === 'hub'); b = Object.assign({}, hub, { id: 9901, k: 'gunes', x: hub.x + 3, y: hub.y, left: 0, broken: false, st: 'ok' }); s.b.push(b); }
    b.broken = true; return { id: b.id, x: b.x, y: b.y };
  });
  await until(page, id => (window.__uuMods.HARITA._debug().find(i => i.id === id) || {}).broken, br.id, 60000);
  const d1 = await ev(page, id => window.__uuMods.HARITA._debug().find(i => i.id === id), br.id);
  ok(!!d1 && d1.broken && d1.col === '#ff4b3e', 'bozuk yapı çizim listesinde kırmızı ' + JSON.stringify(d1));

  let red = false;
  for (let k = 0; k < 8 && !red; k++) {
    red = await ev(page, d => { const cv = document.querySelector('#hrMini canvas'), g = cv.getContext('2d'), dp = cv.width / cv.clientWidth;
      const im = g.getImageData(Math.max(0, Math.round((d.x - 3) * dp)), Math.max(0, Math.round((d.y - 3) * dp)), Math.round(6 * dp), Math.round(6 * dp)).data;
      for (let i = 0; i < im.length; i += 4) if (im[i] > 200 && im[i + 1] < 110 && im[i + 2] < 100) return true; return false; }, d1 || { x: 0, y: 0 });
    if (!red) await wait(page, 250);
  }
  ok(red, 'bozuk yapı tuvalde kırmızı piksel');

  const yap = await ev(page, () => { const s = window.__uu.UI.s, hub = s.b.find(o => o.k === 'hub'); s.b.push(Object.assign({}, hub, { id: 9902, k: 'batarya', x: hub.x - 3, y: hub.y + 1, left: 5, broken: false, st: 'ok' })); return 9902; });
  await until(page, id => !!window.__uuMods.HARITA._debug().find(i => i.id === id), yap, 60000);
  const dy = await ev(page, id => window.__uuMods.HARITA._debug().find(i => i.id === id), yap);
  ok(!!dy && dy.yapim && dy.col !== '#e9eef6', 'yapımı süren yapı soluk çizilir ' + JSON.stringify(dy));
  await ev(page, () => { const s = window.__uu.UI.s; s.b = s.b.filter(b => b.id !== 9902); });

  const hd = await ev(page, () => window.__uuMods.HARITA._debug().find(i => i.tip === 'hedef') || null);
  ok(!!hd, 'şimdiki hedefin yeri çizilir ' + JSON.stringify(hd));

  const fog0 = (await ev(page, () => window.__uuMods.HARITA._debug().find(i => i.tip === 'sis'))).n;
  const opened = await ev(page, () => { const s = window.__uu.UI.s; const out = []; for (let i = 0; i < s.map.seen.length && out.length < 6; i++) if (!s.map.seen[i]) { s.map.seen[i] = 1; out.push(i); } return out.length; });
  await until(page, n => window.__uuMods.HARITA._debug().find(i => i.tip === 'sis').n !== n, fog0, 60000);
  const fog1 = (await ev(page, () => window.__uuMods.HARITA._debug().find(i => i.tip === 'sis'))).n;
  ok(fog1 === fog0 - opened, `sis keşfedilince açılır (${fog0} → ${fog1})`);
  await shot(page, '1-mini-1366');

  ok(await ev(page, () => window.__uuMods.HARITA.big() === false), 'HARITA.big() başta false');
  await page.click('#hrMini');
  await wait(page, 400);
  const bo = await ev(page, () => { const e = document.getElementById('hrBig'), r = e && e.querySelector('canvas').getBoundingClientRect(); return { big: window.__uuMods.HARITA.big(), vis: !!e && !e.hidden, w: r ? r.width : 0, pda: !!window.__uu.UI.pda, leg: [...e.querySelectorAll('.hr-leg span')].map(s => s.textContent) }; });
  ok(bo.big && bo.vis && bo.w > 600 && !bo.pda, 'mini haritaya dokununca büyük harita açılır (Tablet açılmaz) ' + JSON.stringify({ w: bo.w, pda: bo.pda }));
  ok(bo.leg.length >= 5 && bo.leg.every(t => t.trim().split(/\s+/).length <= 3), 'açıklama satırı simgeli, her biri ≤3 kelime: ' + bo.leg.join(' · '));

  const lg = await ev(page, () => { const e = document.getElementById('hrBig');
    const fs = sel => [...e.querySelectorAll(sel)].filter(x => x.offsetParent !== null).map(x => parseFloat(getComputedStyle(x).fontSize));
    return { k: [...e.querySelectorAll('.hr-leg canvas')].map(c => c.dataset.k), leg: fs('.hr-leg span'), tip: fs('.hr-tip'), tipTxt: e.querySelector('.hr-tip').textContent }; });
  ok(['you', 'hub', 'i', 'm', 'broken', 'crew', 'rover', 'goal', 'north'].every(k => lg.k.includes(k)), 'lejantta Sen, Üs, Buz, Maden, Bozuk, Ekip, Gezgin, Hedef, Kuzey ' + lg.k.join(','));
  ok(['g:guc', 'g:hava', 'g:su', 'g:yemek', 'g:ev', 'g:diger'].every(k => lg.k.includes(k)), 'masaüstü lejantında yapı grupları (renk + simge)');
  ok(lg.leg.length && lg.leg.every(f => f >= 13) && lg.tip.length && lg.tip.every(f => f >= 13), 'lejant ve ipucu yazıları ≥13 px ' + JSON.stringify({ leg: [...new Set(lg.leg)], tip: lg.tip }));
  ok(!bo.leg.some(t => /K ?↑|N ?↑/.test(t)), 'kuzey "K↑" yazısı yok (yalnız ok + lejant)');
  ok(lg.k.includes('ship') && lg.k.includes('g:guc:batarya'), 'v5h: lejantta kargo gemisi (mor üçgen) ve ayrı batarya (pil) simgesi ' + lg.k.join(','));
  { await ev(page, () => { const u = window.__uu, s = u.UI.s, hub = s.b.find(o => o.k === 'hub');
      for (const [dx, dy] of [[2, 2], [-2, 2], [2, -2], [-2, -2], [3, 0], [-3, 0]]) { const r = u.build(s, 'gunes', hub.x + dx, hub.y + dy); if (r && r.ok) { const b = s.b[s.b.length - 1]; b.left = 0; break; } } u.refresh(true); });
    await wait(page, 400);
    const dm = await ev(page, () => window.__uuMods.HARITA._debug('mini').filter(i => i.tip === 'yapi' && !i.broken && !i.yapim));
    ok(dm.length >= 1 && dm.every(i => i.sz >= 5 && i.col !== '#f2f5fa'), 'v5h: mini haritada yapılar ≥5 px ve gruba göre renkli ' + JSON.stringify(dm.map(i => [i.k, i.sz, i.col]))); }
  const dbg2 = await ev(page, () => window.__uuMods.HARITA._debug('big'));
  ok(dbg2.some(i => i.tip === 'kuzey'), 'büyük haritada kuzey oku çizilir');
  const gcols = await ev(page, () => { const s = window.__uu.UI.s, hub = s.b.find(o => o.k === 'hub'), add = [['gunes', 2, 3], ['oksijen', -2, 3], ['sera', 3, -2]];
    add.forEach(([k, dx, dy], i) => { if (!s.b.some(b => b.id === 9950 + i)) s.b.push(Object.assign({}, hub, { id: 9950 + i, k, x: hub.x + dx, y: hub.y + dy, left: 0, broken: false, st: 'ok' })); }); return true; });
  await until(page, () => window.__uuMods.HARITA._debug('big').filter(i => i.id >= 9950 && i.id < 9953).length === 3, null, 60000);
  const gd = await ev(page, () => window.__uuMods.HARITA._debug('big').filter(i => i.id >= 9950 && i.id < 9953).map(i => ({ k: i.k, grp: i.grp, col: i.col })));
  ok(gcols && new Set(gd.map(i => i.col)).size === 3 && gd.find(i => i.k === 'gunes').col === '#ffd84a', 'büyük haritada yapılar grup renginde (elektrik sarı, hava açık mavi, yemek yeşil) ' + JSON.stringify(gd));

  const gp = await ev(page, () => { const it = window.__uuMods.HARITA._debug('big').find(i => i.id === 9950), r = document.querySelector('#hrBig canvas').getBoundingClientRect(); return { x: r.x + it.x, y: r.y + it.y }; });
  await page.mouse.move(gp.x, gp.y); await wait(page, 250);
  const nm = await ev(page, () => { const n = document.querySelector('#hrBig .hr-name'); return { vis: !!n && !n.hidden, t: n ? n.textContent : '', fs: n ? parseFloat(getComputedStyle(n).fontSize) : 0 }; });
  ok(nm.vis && /Güneş/.test(nm.t) && nm.fs >= 13, 'yapının üstüne gelince adı görünür ' + JSON.stringify(nm));
  await ev(page, () => { const s = window.__uu.UI.s; s.b = s.b.filter(b => !(b.id >= 9950 && b.id < 9953)); });
  const dbig = await ev(page, () => window.__uuMods.HARITA._debug('big'));
  ok(dbig.some(i => i.tip === 'us') && dbig.some(i => i.broken), 'büyük harita tüm haritayı çizer (üs, bozuk yapı)');
  await shot(page, '2-buyuk-1366');
  await page.keyboard.press('Escape'); await wait(page, 300);
  ok(await ev(page, () => !window.__uuMods.HARITA.big() && document.getElementById('hrBig').hidden && window.__uu.UI.modal !== 'menu'), 'Esc büyük haritayı kapatır (Esc menüsü açılmaz)');
  await ev(page, () => window.__uuMods.HARITA.toggle()); await wait(page, 200);
  await page.click('#hrBig .hr-x'); await wait(page, 200);
  ok(await ev(page, () => !window.__uuMods.HARITA.big()), 'kapat düğmesi kapatır');
  await ev(page, () => window.__uuMods.HARITA.toggle(true)); await wait(page, 200);
  await page.mouse.click(8, 760); await wait(page, 200);
  ok(await ev(page, () => !window.__uuMods.HARITA.big()), 'dışına dokunmak kapatır');

  await ev(page, () => window.__uuMods.HARITA.toggle(true)); await wait(page, 300);
  const p0 = await ev(page, () => { const p = window.__uu.S3.player; return { x: p.x, z: p.z }; });
  const cvr = await ev(page, () => { const r = document.querySelector('#hrBig canvas').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await page.mouse.click(cvr.x + cvr.w * 0.25, cvr.y + cvr.h * 0.3);
  await wait(page, 300);
  const wk = await ev(page, () => ({ big: window.__uuMods.HARITA.big(), lw: window.__uuMods.HARITA._debug('all').lastWalk, walking: window.__uu.S3.walking, wp: window.__uu.S3.walkPath }));
  ok(!wk.big && wk.lw && wk.lw.how === 'walk' && Math.abs(wk.lw.x - 48) < 3 && Math.abs(wk.lw.z - 36) < 3, 'büyük haritada dokunulan yere yürüme başlar, harita kapanır ' + JSON.stringify(wk.lw));
  ok(wk.walking && wk.wp && wk.wp.path && wk.wp.path.length >= 1, 'dokun-yürü hedefi ve YOL ara noktaları kuruldu ' + JSON.stringify(wk.wp && { n: wk.wp.path.length, found: wk.wp.found }));

  await until(page, () => window.__uuMods.HARITA._debug().some(i => i.tip === 'yurume'), null, 60000);
  const wr = await ev(page, () => ({ ring: window.__uuMods.HARITA._debug().find(i => i.tip === 'yurume') || null, toast: [...document.querySelectorAll('#toasts .toast')].map(t => t.textContent).join(' | ') }));
  ok(!!wr.ring, 'mini haritada yürüyüş hedef halkası görünür ' + JSON.stringify(wr.ring));
  ok(/Oraya yürüyorsun/.test(wr.toast), '"Oraya yürüyorsun." bildirimi çıktı: ' + wr.toast);
  await ev(page, () => window.__uu.setSpeed(1));
  const moved = await until(page, p => { const q = window.__uu.S3.player; return Math.hypot(q.x - p.x, q.z - p.z) > 1.5; }, p0, 60000);
  ok(moved, 'oyuncu yürümeye başladı (yazılım çizimiyle yavaş olabilir)');

  await ev(page, () => { const lw = window.__uuMods.HARITA._debug('all').walkT; if (lw) window.__uu.S3.setPlayer && window.__uu.S3.setPlayer(lw.x, lw.z, 0); });
  const gone = await until(page, () => !window.__uuMods.HARITA._debug('all').walkT && !window.__uuMods.HARITA._debug().some(i => i.tip === 'yurume'), null, 60000);
  ok(gone, 'varınca hedef halkası silinir');
  await ev(page, () => window.__uu.setSpeed(0));

  await ev(page, () => window.__uu.openPda('gorev'));
  ok(await until(page, () => document.getElementById('hrMini').hidden, null, 30000), 'Tablet açıkken mini harita gizli');
  await ev(page, () => window.__uu.closePda());
  ok(await until(page, () => !document.getElementById('hrMini').hidden, null, 30000), 'Tablet kapanınca yeniden görünür');
  await ev(page, () => window.__uu.enterPlan && window.__uu.enterPlan()); await until(page, () => document.getElementById('hrMini').hidden, null, 30000);
  const inPlan = await ev(page, () => ({ plan: !!window.__uu.UI.plan, hid: document.getElementById('hrMini').hidden }));
  ok(!inPlan.plan || inPlan.hid, 'inşa görünümünde mini harita gizli ' + JSON.stringify(inPlan));
  await ev(page, () => window.__uu.exitPlan && window.__uu.exitPlan()); await wait(page, 600);
  await ev(page, () => window.__uuMods.HARITA.hide(true)); await wait(page, 200);
  ok(await ev(page, () => document.getElementById('hrMini').hidden && window.__uuMods.HARITA.toggle(true) === false), 'HARITA.hide(true) gizler, büyük harita açılmaz');
  await ev(page, () => window.__uuMods.HARITA.hide(false)); await wait(page, 300);
  ok(await ev(page, () => !document.getElementById('hrMini').hidden), 'HARITA.hide(false) geri getirir');
  await ctx.close();
}


{
  const { ctx, page } = await open({ width: 1366, height: 768 }, 'muhendis', false);
  const lv = await ev(page, () => window.__uu.UI.s.level);
  lap('seviye: ' + lv);
  await layout(page, '1366 ' + lv, 176);
  await ctx.close();
}


{
  const { ctx, page } = await open({ width: 844, height: 390 }, null, true);
  await layout(page, '844x390', 96);
  await ev(page, () => window.__uuMods.HARITA.toggle(true)); await wait(page, 400);
  const bb = await ev(page, () => { const b = document.querySelector('#hrBig .hr-box').getBoundingClientRect(), x = document.querySelector('#hrBig .hr-x').getBoundingClientRect(); return { b: { x: b.x, y: b.y, w: b.width, h: b.height }, x: { w: x.width, h: x.height } }; });
  ok(bb.b.x >= 0 && bb.b.y >= 0 && bb.b.x + bb.b.w <= 844 && bb.b.y + bb.b.h <= 390, '844x390: büyük harita ekrana sığar ' + JSON.stringify(bb.b));
  ok(bb.x.w >= 44 && bb.x.h >= 44, '844x390: kapat düğmesi ≥44 px');
  const pf = await ev(page, () => { const e = document.getElementById('hrBig'); return { leg: [...e.querySelectorAll('.hr-leg span')].filter(x => x.offsetParent !== null).map(x => parseFloat(getComputedStyle(x).fontSize)), tip: [...e.querySelectorAll('.hr-tip')].filter(x => x.offsetParent !== null).map(x => parseFloat(getComputedStyle(x).fontSize)) }; });
  ok(pf.leg.length >= 9 && pf.leg.every(f => f >= 13) && pf.tip.length === 1 && pf.tip[0] >= 13, '844x390: lejant ve ipucu görünür, ≥13 px ' + JSON.stringify({ n: pf.leg.length, leg: [...new Set(pf.leg)], tip: pf.tip }));
  const hp = await ev(page, () => { const it = window.__uuMods.HARITA._debug('big').find(i => i.tip === 'us'), r = document.querySelector('#hrBig canvas').getBoundingClientRect(); return { x: r.x + it.x, y: r.y + it.y }; });
  await page.touchscreen.tap(hp.x, hp.y); await wait(page, 300);
  const tn = await ev(page, () => { const n = document.querySelector('#hrBig .hr-name'); return { big: window.__uuMods.HARITA.big(), vis: !!n && !n.hidden, t: n ? n.textContent : '' }; });
  ok(tn.big && tn.vis && tn.t.length > 0, '844x390: yapıya ilk dokunuş adını gösterir, harita açık kalır ' + JSON.stringify(tn));
  await page.touchscreen.tap(hp.x, hp.y); await wait(page, 300);
  ok(await ev(page, () => !window.__uuMods.HARITA.big() && !!window.__uuMods.HARITA._debug('all').walkT), '844x390: aynı yapıya ikinci dokunuş oraya yürütür');
  await ev(page, () => window.__uuMods.HARITA.toggle(true)); await wait(page, 300);
  await shot(page, '3-buyuk-844');
  await page.tap('#hrBig .hr-x').catch(() => page.click('#hrBig .hr-x')); await wait(page, 300);
  ok(await ev(page, () => !window.__uuMods.HARITA.big()), '844x390: dokununca kapanır');
  await shot(page, '4-mini-844');
  await ctx.close();
}

await browser.close();
const pass = checks.filter(c => c[0]).length;
console.log(`\nharita: ${pass}/${checks.length} kontrol geçti`);
if (errors.length) { console.log('\nHATALAR:'); errors.forEach(e => console.log(' -', e.slice(0, 400))); }
process.exit(errors.length ? 1 : 0);
