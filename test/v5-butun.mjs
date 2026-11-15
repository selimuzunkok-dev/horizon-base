

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const groot = execSync('npm root -g').toString().trim();
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(groot, '@playwright', 'cli', 'node_modules', 'playwright-core'));
const url = pathToFileURL(path.join(dir, '..', 'index.html')).href + '#test';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null, want = n => !ONLY || ONLY.includes(n);
const SHOTS = process.env.SHOTS === '1', shotDir = process.env.SHOT_DIR || path.join(dir, '..', 'bulut', 'belgeler', 'v5-goruntu');
if (SHOTS) fs.mkdirSync(shotDir, { recursive: true });
const PLAY_EG = process.env.EGITIM !== '0';
const swArgs = (process.platform === 'linux' || process.env.YAZILIM_CIZICI === '1') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [];
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: swArgs });
const errors = [], checks = [], pageErr = [];
const t0 = Date.now(), lap = m => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)} sn] ${m}`);
const ok = (cond, msg) => { checks.push([!!cond, msg]); if (!cond) { errors.push('KONTROL: ' + msg); lap('✗ ' + msg); } else lap('✓ ' + msg); };
const ev = (page, f, a) => page.evaluate(f, a);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const until = (page, f, a, ms) => page.waitForFunction(f, a, { timeout: ms || 20000, polling: 250 }).then(() => true, () => false);
const words = t => String(t || '').trim().split(/\s+/).filter(Boolean).length;
const clock = page => ev(page, () => { const u = window.__uu; return u.UI.s.t + u.UI.acc; });
const noErr = (label) => { const e = pageErr.splice(0); ok(e.length === 0, `${label}: sayfa hatası yok` + (e.length ? ' → ' + e.slice(0, 3).join(' | ') : '')); };
async function shot(page, name) {
  if (!SHOTS) return;
  const t = Date.now();
  try { await page.screenshot({ path: path.join(shotDir, name + '.jpg'), type: 'jpeg', quality: 70, timeout: 240000 }); lap(`ekran görüntüsü ${name} (${Math.round((Date.now() - t) / 1000)} sn)`); } catch (e) { lap('ekran görüntüsü alınamadı: ' + name + ' · ' + e.message); }
}

const freezeFloat = page => ev(page, () => { const f = [...document.querySelectorAll('.spend-float')].pop(); if (!f) return false; const c = f.cloneNode(true); c.classList.add('v5-frozen'); c.style.animation = 'none'; c.style.opacity = '1'; f.parentNode.appendChild(c); return c.textContent; });
const unfreeze = page => ev(page, () => document.querySelectorAll('.v5-frozen').forEach(e => e.remove()));

async function open(w, h, touch) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'tr-TR', hasTouch: !!touch, isMobile: !!touch });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_INTERNET|ERR_NAME|net::|GPU stall|WebGL-/.test(m.text())) pageErr.push(m.text()); });
  page.on('pageerror', e => pageErr.push('PAGEERROR ' + e.message));
  await page.goto(url); await page.waitForTimeout(900);
  await ev(page, () => { try { localStorage.clear(); } catch (e) {   } }); await page.reload(); await page.waitForTimeout(1200);

  await ev(page, () => {
    const R = window.__rec = { floats: [], shakes: [], toasts: [] };
    new MutationObserver(ms => { for (const m of ms) { for (const n of m.addedNodes) { if (n.nodeType === 1 && n.classList.contains('spend-float') && !n.classList.contains('v5-frozen')) R.floats.push(n.textContent); if (n.nodeType === 1 && n.classList.contains('toast')) R.toasts.push(n.textContent); } if (m.type === 'attributes' && m.target.classList && m.target.classList.contains('spend-shake')) R.shakes.push(m.target.id || m.target.className); } })
      .observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  });
  return page;
}
const tap = async (page, sel, touch) => { const h = await page.$(sel); if (!h) return false; try { if (touch) await h.tap({ timeout: 5000 }); else await h.click({ timeout: 5000 }); return true; } catch (e) { try { await ev(page, s => { const x = document.querySelector(s); if (x) x.click(); return !!x; }, sel); return true; } catch (e2) { return false; } } };
const visible = (page, sel) => ev(page, s => { const e = document.querySelector(s); if (!e || e.hidden) return false; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; }, sel);
const realMods = page => ev(page, () => { const u = window.__uu, IK = u.mod('ISKART'); return { quick: !!(IK && typeof IK.quick === 'function' && !IK.__v5stub), harita: !!u.mod('HARITA') && !(window.__v5), ogret: !!u.mod('OGRET'), egitim: !!u.mod('EGITIM'), po: u.ext('powerOutlook'), bo: u.ext('buildOutlook'), teach: !!u.teachOf, stub: !!window.__v5 }; });
const restPrep = page => ev(page, () => { const u = window.__uu; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); u.UI.chapUntil = 0; const c = document.getElementById('chapter'); if (c) c.hidden = true; if (u.UI.modal && u.UI.modal !== 'creator') u.ACT.closeModal(); });
const closeCalls = page => ev(page, () => { const u = window.__uu, s = u.UI.s; for (const p of s.pending.slice()) { if (p.type === 'cargo') u.resolve(s, {}, p.pid); else if (u.resolve(s, 0, p.pid) === null) u.resolve(s, 1, p.pid); } if (u.UI.modal) u.ACT.closeModal(); });


async function playTutorial(page, touch, label) {
  const st = () => ev(page, () => { const E = window.__uuMods.EGITIM, x = E._state && E._state(), g = E.goal(); return E.active() && x ? { id: x.id, i: x.i, phase: x.phase, at: g && g.at, sel: g && g.sel } : null; });
  const R = { showOpened: null, showAnswered: null, trainCost: null, steps: [] };
  let guard = 0, lastId = null, stepStart = Date.now();
  while (guard++ < 150) {
    const x = await st(); if (!x) break;
    if (x.id !== lastId) { lastId = x.id; stepStart = Date.now(); R.steps.push(x.id); }
    if (Date.now() - stepStart > 240000) { ok(false, `${label}: eğitim adımı "${x.id}" 240 sn'de bitmedi`); break; }
    if (x.phase !== 'do') {
      if (x.id === 'halka' && await ev(page, () => !!window.__uu.UI.modal)) { await sleep(1500); if (!(await tap(page, '#modal [data-act="closeModal"], [data-act="closeModal"]', touch))) await ev(page, () => window.__uu.ACT.closeModal()); }
      await sleep(400); continue;
    }
    await restPrep(page);
    const id = x.id;
    try {
      if (id === 'amac') await ev(page, () => { const u = window.__uu, h = u.UI.s.b.find(b => b.k === 'hub'); u.modalBuilding(h.id); });
      else if (id === 'yuru') { await ev(page, a => { const P = window.__uu.S3.player; window.__uu.S3.setPlayer(a.x + 2, a.z + 1, P ? P.yaw : 0); }, x.at); await sleep(1500); }
      else if (id === 'halka') { if (!(await tap(page, x.sel || '#g-o2', touch))) await tap(page, '#g-o2', touch); }
      else if (id === 'panel' || id === 'hava') {
        const k = id === 'panel' ? 'gunes' : 'oksijen';
        if (!(await ev(page, () => window.__uu.UI.plan))) await tap(page, '[data-act="buildMenu"]', touch);
        await sleep(600);
        if (!(await tap(page, `#drawer [data-k="${k}"]`, touch))) await ev(page, k => window.__uu.pickB(k), k);
        await sleep(600);
        await ev(page, k => { const u = window.__uu, sp = u.bestSpot(u.UI.s, k); if (sp) u.placeAt({ tx: sp.x, ty: sp.y }); }, k);
        await sleep(600);
        if (await ev(page, () => window.__uu.UI.plan)) await ev(page, () => window.__uu.exitPlan());
      } else if (id === 'tara') {
        if (x.at) { await ev(page, a => { const P = window.__uu.S3.player; window.__uu.S3.setPlayer(a.x + 3, a.z + 3, P ? P.yaw : 0); }, x.at); await sleep(1500); }
        await ev(page, () => { const u = window.__uu, sp = window.__uuMods.EGITIM._state().st.spot; if (sp) u.doScan(sp.tx, sp.ty); });
      } else if (id === 'onar') {

        const shown = await until(page, () => { const b = document.getElementById('egShow'); return !!(b && !b.hidden && b.getClientRects().length); }, null, 60000);
        const parca0 = await ev(page, () => window.__uu.UI.s.res.parca);
        const bid = await ev(page, () => window.__uuMods.EGITIM._state().st.bid);
        const rc = await ev(page, b => window.__uu.repairCost(b), bid);
        if (shown) await tap(page, '#egShow', touch);
        let q = await until(page, () => { const q = document.getElementById('ikQuick'); return !!(q && !q.hidden && q.getClientRects().length); }, null, 15000);
        if (shown) { R.showOpened = q; R.showAnswered = await ev(page, () => { const k = window.__uuMods.ISKART._quick(); return k ? k.done : null; }); }
        if (!q) {
          await ev(page, b => window.__uu.modalBuilding(b), bid); await sleep(800);
          await tap(page, '[data-act="bRepair"]', touch);
          q = await until(page, () => { const q = document.getElementById('ikQuick'); return q && !q.hidden; }, null, 15000);
        }
        if (q) {
          await tap(page, '.ik-q-opt[data-i]:not([data-ok="1"])', touch);
          await until(page, () => !!document.querySelector('.ik-q-res'), null, 10000);
          R.trainCost = { d: parca0 - (await ev(page, () => window.__uu.UI.s.res.parca)), rc, line: await ev(page, () => (document.querySelector('.ik-q-res') || {}).textContent || '') };
          await sleep(1300); await tap(page, '.ik-q-go', touch);
        }
      } else if (id === 'soru') { if (!(await tap(page, '#ikCard button[data-ik]', touch))) await ev(page, () => { const u = window.__uu, E = window.__uuMods.EGITIM, pid = E._state().st.pid; if (pid != null) u.resolve(u.UI.s, 0, pid); }); }
      else if (id === 'kargo') {
        await until(page, () => window.__uu.UI.s.pending.some(p => p.type === 'cargo'), null, 60000);
        await ev(page, () => { const u = window.__uu, p = u.UI.s.pending.find(q => q.type === 'cargo'); if (p) u.openCall(p.pid); });
        await sleep(1200);
        await tap(page, '[data-act="cargoAuto"]', touch); await sleep(600);
        if (!(await tap(page, '[data-act="cargoGo"]', touch))) await ev(page, () => { const u = window.__uu, p = u.UI.s.pending.find(q => q.type === 'cargo'); if (p) u.resolve(u.UI.s, p.def, p.pid); });
      } else if (id === 'tablet') { if (!(await tap(page, x.sel || '#menuBtn', touch))) await ev(page, () => window.__uu.openPda()); }
      else if (id === 'son') { await sleep(800); await ev(page, () => window.__uu.closePda()); }
    } catch (e) { ok(false, `${label}: eğitim adımı ${id}: ${e.message}`); }
    await page.waitForFunction(i => { const E = window.__uuMods.EGITIM, x = E._state && E._state(); return !E.active() || !x || x.i !== i || x.phase !== 'do'; }, x.i, { timeout: 90000, polling: 300 }).catch(() => {});
  }
  return R;
}


async function scenario(label, w, h, touch) {
  const P = touch ? 't' : 'd';
  const page = await open(w, h, touch);
  ok(await ev(page, () => !!window.__uu && window.__uu.UI.gl), `${label}: sayfa ve WebGL açıldı`);
  const rm = await realMods(page);
  ok(rm.quick && rm.harita && rm.ogret && rm.egitim && rm.po && rm.bo && !rm.stub, `${label}: gerçek modüller (sahte yok) ${JSON.stringify(rm)}`);


  await ev(page, () => { window.__uu.egitimAtla(false); window.__uu.hizliSoru(true); });
  await ev(page, () => document.querySelector('[data-act="start"]').click());
  await until(page, () => window.__uu.UI.s && (window.__uu.UI.modal === 'creator' || window.__uuMods.EGITIM.active()), null, 60000);
  if (await ev(page, () => window.__uu.UI.modal === 'creator')) await ev(page, () => window.__uu.crGo());
  ok(await until(page, () => window.__uuMods.EGITIM.active(), null, 60000), `${label}: yeni görev eğitim göreviyle açılır`);
  if (PLAY_EG) {
    const T0 = Date.now();
    const R = await playTutorial(page, touch, label);
    lap(`${label}: eğitim adımları ${R.steps.join(' → ')} (${Math.round((Date.now() - T0) / 1000)} sn)`);
    if (R.showOpened != null) ok(R.showOpened && R.showAnswered === false, `${label}: "Bana göster" hızlı soruyu açar, yanıtlamaz (${JSON.stringify({ open: R.showOpened, done: R.showAnswered })})`);
    else ok(false, `${label}: onar adımında "Bana göster" 60 sn'de görünmedi`);
    ok(R.trainCost && R.trainCost.d === R.trainCost.rc, `${label}: eğitimde yanlış yanıt ek harcama getirmez (giden ${R.trainCost && R.trainCost.d}, ana maliyet ${R.trainCost && R.trainCost.rc}) · "${R.trainCost && R.trainCost.line.trim()}"`);
  } else await ev(page, () => window.__uuMods.EGITIM.skip && 0);
  if (!PLAY_EG) await ev(page, () => { const u = window.__uu; u.UI.egBack = u.UI.egBack || 'real'; u.egFinish(true); });
  ok(await until(page, () => { const d = document.getElementById('egDone'); return d && !d.hidden; }, null, 60000), `${label}: eğitim bitince #egDone görünür`);
  const eg = await ev(page, () => { const d = document.getElementById('egDone'), r = d.getBoundingClientRect(), b = document.getElementById('egDoneGo').getBoundingClientRect(), hud = getComputedStyle(document.getElementById('hud')).visibility, hm = document.getElementById('hrMini');
    const box = d.querySelector('.egd-box'), br = box ? box.getBoundingClientRect() : r;
    return { h: (d.querySelector('h2') || {}).textContent, li: [...d.querySelectorAll('.egd-l li')].map(x => x.textContent.trim()), full: r.width >= innerWidth - 2 && r.height >= innerHeight - 2, hud, hr: !hm || hm.hidden || hm.offsetParent === null || getComputedStyle(hm).visibility === 'hidden',
      goH: b.height, goW: b.width, inView: br.top >= -1 && br.bottom <= innerHeight + 1 && br.left >= -1 && br.right <= innerWidth + 1, scroll: box ? box.scrollHeight - box.clientHeight : 0, pr: window.__uu.pauseReason(), train: window.__uu.UI.train }; });
  ok(eg.h === 'Eğitim bitti!' && eg.full, `${label}: tam ekran "Eğitim bitti!" ${JSON.stringify({ h: eg.h, full: eg.full })}`);
  const sumN = await ev(page, () => { const E = window.__uuMods.EGITIM; return typeof E.summary === 'function' ? E.summary().length : -1; });
  ok(eg.li.length >= 2 && eg.li.length === sumN, `${label}: "Öğrendiklerin" EGITIM.summary() satırları (${eg.li.length}/${sumN}): ${eg.li.join(' · ')}`);
  ok(eg.hud === 'hidden' && eg.hr, `${label}: HUD ve mini harita gizli (${eg.hud}, ${eg.hr})`);
  ok(eg.goH >= 44 && eg.inView && eg.scroll <= 1, `${label}: #egDone kaydırmasız sığar, düğme ≥44 px (${Math.round(eg.goH)} px, kaydırma ${eg.scroll})`);
  const c0 = await clock(page); await sleep(2500); const c1 = await clock(page);
  ok(c1 === c0 && eg.pr === 'egdone', `${label}: "Eğitim bitti" ekranında saat durur (${c0} → ${c1}, ${eg.pr})`);
  if (!touch) await shot(page, '01-egitim-bitti'); else await shot(page, 't4-egitim-bitti');
  await tap(page, '#egDoneGo', touch);
  await until(page, () => !window.__uu.UI.train && window.__uu.UI.s && !window.__uu.UI.s.train && !window.__uu.UI.egDone, null, 30000);
  await sleep(1500);
  const g1 = await ev(page, () => { const u = window.__uu, s = u.UI.s; return { day: Math.floor(s.t / 24) + 1, obj: (document.getElementById('objective') || {}).textContent || '', train: !!s.train, lv: s.level, world: s.world }; });
  ok(g1.day === 1 && !g1.train && g1.obj.trim().length > 0 && g1.lv === 'kasif' && g1.world === 'ay', `${label}: #egDoneGo → gerçek görev günü 1, hedef satırı dolu ("${g1.obj.trim()}")`);
  noErr(label + ' · geçiş');


  await closeCalls(page); await restPrep(page);
  await ev(page, () => { const s = window.__uu.UI.s; s.res.malzeme = Math.max(s.res.malzeme, 400); s.res.parca = Math.max(s.res.parca, 40); s.res.o2 = s.res.su = s.res.gida = 999; window.__uu.refresh(true); });


  const og0 = await ev(page, () => { const O = window.__uu.mod('OGRET'); return O.count(); });
  await tap(page, '[data-act="buildMenu"]', touch); await sleep(800);
  const dr = await ev(page, () => { const r = document.getElementById('drRes'), m = document.getElementById('dr-malzeme'), tabs = document.querySelector('#drawer .dr-top'), s = window.__uu.UI.s;
    if (!r || !m) return null; const rr = r.getBoundingClientRect(), tr = tabs ? tabs.getBoundingClientRect() : null;
    const tb = [...document.querySelectorAll('#drawer .dr-top [data-g], #drawer .dr-top button')].filter(b => !r.contains(b)).map(b => b.getBoundingClientRect()).filter(x => x.width);
    const minT = Math.min(...[...r.querySelectorAll('[id^="dr-"]')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().height));
    const gc = r.previousElementSibling, gcr = gc ? gc.getBoundingClientRect() : null, gap = gcr ? Math.round(rr.left - gcr.right) : null;
    return { gap, inTop: !!(tr && rr.top >= tr.top - 2 && rr.bottom <= tr.bottom + 2), next: tb.length > 0 && tb.some(b => Math.abs(b.top - rr.top) < 30), num: (m.querySelector('b') || m).textContent.replace(/\D/g, ''), res: Math.floor(s.res.malzeme), minT }; });
  ok(dr && dr.inTop && dr.next, `${label}: inşa menüsünde #drRes grup sekmelerinin yanında ${JSON.stringify(dr)}`);
  ok(dr && dr.gap != null && dr.gap >= -1 && dr.gap <= 16, `${label}: #drRes çipleri sekmelerin hemen sağında (boşluk ${dr && dr.gap} px ≤ 16)`);
  ok(dr && +dr.num === dr.res, `${label}: #dr-malzeme = s.res.malzeme (${dr && dr.num} / ${dr && dr.res})`);
  if (touch) ok(dr && dr.minT >= 40, `${label}: #drRes çipleri ≥40 px (v5f C) (${dr && Math.round(dr.minT)})`);
  const cg = await ev(page, () => window.__uu.costOf('gunes'));
  await ev(page, () => { window.__rec.floats.length = 0; window.__rec.shakes.length = 0; });
  const m0 = await ev(page, () => window.__uu.UI.s.res.malzeme);
  if (!(await tap(page, '#drawer [data-k="gunes"]', touch))) await ev(page, () => window.__uu.pickB('gunes'));
  await sleep(500);
  const placed = await ev(page, () => { const u = window.__uu, sp = u.bestSpot(u.UI.s, 'gunes'); return sp ? u.placeAt({ tx: sp.x, ty: sp.y }) : false; });
  await until(page, () => window.__rec.floats.length > 0, null, 15000);
  const sp = await ev(page, () => ({ m: window.__uu.UI.s.res.malzeme, f: window.__rec.floats.slice(), sh: window.__rec.shakes.slice(), qo: window.__uu.mod('ISKART').quickOpen() }));
  ok(placed !== false && m0 - sp.m === cg.m && cg.m === 10, `${label}: güneş paneli kuruldu, malzeme ${cg.m} azaldı (${m0} → ${sp.m})`);
  ok(sp.f.includes('−10'), `${label}: .spend-float "−10" ${JSON.stringify(sp.f)}`);
  ok(sp.sh.includes('dr-malzeme'), `${label}: #dr-malzeme .spend-shake aldı ${JSON.stringify(sp.sh)}`);
  ok(!sp.qo, `${label}: türün ilk yerleştirmesinde hızlı soru açılmaz`);
  if (!touch) { const fz = await freezeFloat(page); await shot(page, '02-insa-kaynaklar'); await unfreeze(page); lap('dondurulan gösterge: ' + fz); }
  else { await freezeFloat(page); await shot(page, 't2-insa-kaynaklar'); await unfreeze(page); }

  const tg = await ev(page, () => { const T = window.__uu.teachOf('gunes'); const s = window.__uu.UI.s; return { learned: Object.keys(s.learn || {}), teach: T ? { id: T.id, say: T.say.tr } : null }; });
  ok(tg.teach && tg.learned.includes(tg.teach.id), `${label}: s.learn ilk panelle doldu (${tg.teach && tg.teach.id})`);
  const ogSeen = await until(page, say => { const c = document.getElementById('ogCard'); return c && !c.hidden && c.textContent.includes(say); }, tg.teach ? tg.teach.say : '???', 60000);
  ok(ogSeen, `${label}: #ogCard görünür ve cümlesi TEACH ile aynı ("${tg.teach && tg.teach.say}")`);
  if (ogSeen) {
    await until(page, () => { const c = document.getElementById('ogCard').getBoundingClientRect(), d = document.getElementById('drawer').getBoundingClientRect(); return c.bottom <= d.top + 1 || c.top >= d.bottom - 1 || c.right <= d.left || c.left >= d.right; }, null, 8000);
    const ov = await ev(page, () => { const c = document.getElementById('ogCard').getBoundingClientRect(); const hit = []; for (const sel of ['#drRes', '#pwWarn', '#hrMini', '#toasts', '#drawer', '#gauges', '#sub', '#ikQuick']) { const e = document.querySelector(sel); if (!e || e.hidden || !e.offsetParent || getComputedStyle(e).visibility === 'hidden') continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.left < c.right - 1 && r.right > c.left + 1 && r.top < c.bottom - 1 && r.bottom > c.top + 1) hit.push(sel); } return { hit, w: Math.round(c.width) }; });
    ok(!ov.hit.length && ov.w <= 300, `${label}: Bilgi kartı (${ov.w} px) #drRes/#pwWarn/#hrMini/#toasts/çekmeceyle çakışmaz ${JSON.stringify(ov.hit)}`);
    if (!touch) await shot(page, '03-bilgi-karti');
  }
  await ev(page, () => window.__uu.exitPlan()); await sleep(400);
  const og1 = await ev(page, () => window.__uu.mod('OGRET').count());
  ok(og1.have > og0.have, `${label}: Defterim sayısı arttı (${og0.have} → ${og1.have} / ${og1.total})`);
  await ev(page, () => { window.__uu.openPda('defter'); });
  await sleep(800);
  const df = await ev(page, () => { const b = document.getElementById('pdaBody'); return { tab: window.__uu.UI.pda, txt: b ? b.textContent.replace(/\s+/g, ' ').slice(0, 200) : '', tabs: window.__uu.tabs(), painted: b ? [...b.querySelectorAll('canvas, svg, img')].length : 0, map: !!document.querySelector('#pdaBody #radar, #psMap, #mapBtn') }; });
  ok(df.tab === 'defter' && df.tabs.includes('defter') && new RegExp(og1.have + '\\s*/\\s*' + og1.total).test(df.txt), `${label}: Tablet "Defterim" ${og1.have}/${og1.total} gösterir ("${df.txt.slice(0, 80)}")`);
  ok(df.painted > 0, `${label}: Defterim yapı çizimleri boyandı (OGRET.paint) · ${df.painted} çizim`);
  ok(!df.map, `${label}: Tablet'te harita yok`);
  ok(await ev(page, () => { const m = document.getElementById('hrMini'); return !m || m.hidden || m.offsetParent === null || getComputedStyle(m).visibility === 'hidden'; }), `${label}: Tablet açıkken mini harita gizli`);
  if (!touch) await shot(page, '10-defterim');
  await ev(page, () => window.__uu.closePda()); await sleep(400);
  const bc = await ev(page, () => { const u = window.__uu, b = u.UI.s.b.filter(o => o.k === 'gunes').pop(); u.modalBuilding(b.id); const t = (document.querySelector('#modalBox .m-teach') || {}).textContent || ''; u.ACT.closeModal(); return t; });
  ok(bc.length > 0, `${label}: yapı kartında Bilgi satırı ("${bc.trim().slice(0, 60)}")`);
  noErr(label + ' · inşa ve Bilgi');


  await restPrep(page);
  let qAt = 0, qb = null;
  await tap(page, '[data-act="buildMenu"]', touch); await sleep(500);
  for (let i = 1; i <= 5 && !qAt; i++) {
    await ev(page, () => { window.__uu.pickB('gunes'); });
    const m1 = await ev(page, () => window.__uu.UI.s.res.malzeme);
    const r = await ev(page, () => { const u = window.__uu, sp = u.bestSpot(u.UI.s, 'gunes'); if (!sp) return null; const ok = u.placeAt({ tx: sp.x, ty: sp.y }); const b = u.UI.s.b.filter(o => o.k === 'gunes').pop(); return { ok, bid: b && b.id }; });
    if (await until(page, () => { const q = document.getElementById('ikQuick'); return !!(q && !q.hidden && q.getClientRects().length); }, null, 3000)) { qAt = i; qb = { bid: r && r.bid, m1 }; }
  }
  ok(qAt >= 1 && qAt <= 4, `${label}: inşa hızlı sorusu en geç 4. yerleştirmede açıldı (ilk panelden sonra ${qAt}. yerleştirme)`);
  if (qAt) {
    const mq = await ev(page, () => window.__uu.UI.s.res.malzeme);
    await ev(page, () => { window.__rec.floats.length = 0; });
    if (SHOTS) await until(page, () => { const c = document.querySelector('#ikQuick .ik-q-card'); return c && +getComputedStyle(c).opacity > 0.98 && +getComputedStyle(document.getElementById('ikQuick')).opacity > 0.98; }, null, 90000);
    if (!touch) await shot(page, '06-hizli-soru-insa'); else await shot(page, 't1-hizli-soru');
    if (touch) {
      const fit = await ev(page, () => { const q = document.getElementById('ikQuick'), c = q.querySelector('.ik-q-card'), r = c.getBoundingClientRect(); const opts = [...q.querySelectorAll('.ik-q-opt')].map(o => o.getBoundingClientRect().height); return { inView: r.top >= -1 && r.bottom <= innerHeight + 1, scroll: c.scrollHeight - c.clientHeight, minOpt: Math.min(...opts) }; });
      ok(fit.inView && fit.scroll <= 1 && fit.minOpt >= 44, `${label}: #ikQuick 844×390'da kaydırmasız sığar, şıklar ≥44 px ${JSON.stringify(fit)}`);
    }
    await tap(page, '.ik-q-opt[data-i]:not([data-ok="1"])', touch);
    await until(page, () => !!document.querySelector('.ik-q-res'), null, 10000);
    await until(page, () => window.__rec.floats.some(f => /yanlış cevap/.test(f)), null, 10000);
    const qr = await ev(page, a => { const u = window.__uu, s = u.UI.s, b = s.b.find(o => o.id === a.bid); const res = document.querySelector('.ik-q-res'); return { exists: !!b, ok: res && res.dataset.ok, m: s.res.malzeme, right: (document.querySelector('.ik-q-right') || {}).textContent || '', floats: window.__rec.floats.slice() }; }, qb);
    ok(qr.exists && qr.ok === '0', `${label}: inşa sorusunda yanlış → yapı yine kuruldu`);
    ok(qr.m < mq, `${label}: yanlışta malzeme ek olarak azaldı (${mq} → ${qr.m})`);
    ok(/Doğrusu/.test(qr.right), `${label}: doğrusu yazılır ("${qr.right.trim()}")`);
    ok(qr.floats.some(f => /yanlış cevap/.test(f)), `${label}: ceza göstergesi ${JSON.stringify(qr.floats)}`);
    await sleep(1300); await tap(page, '.ik-q-go', touch);
    await until(page, () => !window.__uu.mod('ISKART').quickOpen(), null, 10000);
  }
  await ev(page, () => window.__uu.exitPlan()); await sleep(300);
  noErr(label + ' · inşa sorusu');


  await restPrep(page);
  const breakOne = () => ev(page, () => { const u = window.__uu, s = u.UI.s; const b = s.b.find(o => o.k === 'gunes' && !o.broken); b.left = 0; b.broken = true; b.st = 'bozuk'; s.res.parca = Math.max(s.res.parca, 40); u.refresh(true); return b.id; });
  const askRepair = async bid => { await ev(page, b => window.__uu.modalBuilding(b), bid); await sleep(600); await tap(page, '[data-act="bRepair"]', touch); return until(page, () => { const q = document.getElementById('ikQuick'); return !!(q && !q.hidden && q.getClientRects().length); }, null, 15000); };

  let bid = await breakOne();
  const p0 = await ev(page, () => window.__uu.UI.s.res.parca), rc = await ev(page, b => window.__uu.repairCost(b), bid);
  await ev(page, () => { window.__rec.floats.length = 0; window.__rec.toasts.length = 0; });
  ok(await askRepair(bid), `${label}: Onar → #ikQuick açılır`);
  await page.keyboard.press('Escape'); await sleep(400);
  if (touch) await page.touchscreen.tap(8, Math.round(h / 2)); else await page.mouse.click(8, Math.round(h / 2));
  await sleep(400);
  await until(page, () => window.__uu.pauseReason() === 'quick', null, 5000);
  const still = await ev(page, () => ({ open: window.__uu.mod('ISKART').quickOpen(), modal: window.__uu.UI.modal, pr: window.__uu.pauseReason() }));
  ok(still.open && !still.modal, `${label}: Esc ve dışa dokunma hızlı soruyu kapatmaz, menü açılmaz ${JSON.stringify(still)}`);
  const q0 = await clock(page); await sleep(2000); const q1 = await clock(page);
  ok(q1 === q0 && still.pr === 'quick', `${label}: hızlı soru açıkken saat durur (${q0} → ${q1}, ${still.pr})`);
  if (!touch) await shot(page, '04-hizli-soru-onarim');
  await tap(page, '.ik-q-opt[data-i]:not([data-ok="1"])', touch);
  await sleep(90); await ev(page, () => { const g = document.querySelector('.ik-q-go'); if (g) g.click(); const o = document.querySelector('.ik-q-opt[data-i]'); if (o) o.click(); });
  await sleep(150);
  const dbl = await ev(page, () => ({ open: window.__uu.mod('ISKART').quickOpen(), res: !!document.querySelector('.ik-q-res') }));
  ok(dbl.open && dbl.res, `${label}: yanlış şıktan 90 ms sonra ikinci dokunuş sonuç kartını kapatmaz ${JSON.stringify(dbl)}`);
  await until(page, () => !!document.querySelector('.ik-q-res'), null, 10000);
  await until(page, () => window.__rec.floats.some(f => /^−/.test(f)) && !!document.getElementById('spendTmp'), null, 10000);
  const r1 = await ev(page, b => { const s = window.__uu.UI.s, x = s.b.find(o => o.id === b); const tmp = document.getElementById('spendTmp'); return { broken: x.broken, parca: s.res.parca, ok: document.querySelector('.ik-q-res').dataset.ok, tmp: !!(tmp && tmp.getClientRects().length), floats: window.__rec.floats.slice(), k: window.__uuMods.ISKART._quick() }; }, bid);
  ok(!r1.broken && r1.ok === '0', `${label}: yanlış şık → yapı onarıldı`);
  ok(p0 - r1.parca > rc, `${label}: parça repairCost + ek kadar azaldı (${p0} → ${r1.parca}, ana ${rc})`);
  ok(r1.tmp && r1.floats.some(f => /^−/.test(f)), `${label}: Kâşif'te geçici parça çipi ve "−" göstergesi ${JSON.stringify(r1.floats)}`);
  if (!touch) { await freezeFloat(page); await shot(page, '05-hizli-soru-yanlis'); await unfreeze(page); }
  await sleep(1300); await tap(page, '.ik-q-go', touch);
  await until(page, () => !window.__uu.mod('ISKART').quickOpen(), null, 10000);
  await until(page, () => window.__rec.toasts.some(t => /onarıldı/.test(t)), null, 10000); await sleep(2500);

  const toastN = await ev(page, () => window.__rec.toasts.filter(t => /onarıldı/.test(t)).length);
  ok(toastN === 1, `${label}: "… onarıldı" bildirimi bir kez (${toastN})`);

  bid = await breakOne();
  ok(await askRepair(bid), `${label}: ikinci arıza → #ikQuick`);
  const late = await until(page, () => { const r = document.querySelector('.ik-q-res'); return !!r; }, null, 90000);
  const r2 = await ev(page, b => ({ ok: (document.querySelector('.ik-q-res') || {}).dataset ? document.querySelector('.ik-q-res').dataset.ok : null, broken: window.__uu.UI.s.b.find(o => o.id === b).broken, line: (document.querySelector('.ik-q-res') || {}).textContent || '' }), bid);
  ok(late && r2.ok === '0' && !r2.broken, `${label}: süre dolunca yanlış sayılır, yapı yine onarılır ("${r2.line.trim().slice(0, 60)}")`);
  await sleep(1300); await tap(page, '.ik-q-go', touch);
  await until(page, () => !window.__uu.mod('ISKART').quickOpen(), null, 10000);

  bid = await breakOne();
  const p2 = await ev(page, () => window.__uu.UI.s.res.parca), rc2 = await ev(page, b => window.__uu.repairCost(b), bid);
  ok(await askRepair(bid), `${label}: üçüncü arıza → #ikQuick`);
  await tap(page, '.ik-q-opt[data-ok="1"]', touch);
  await until(page, () => !!document.querySelector('.ik-q-res'), null, 10000);
  const r3 = await ev(page, () => ({ parca: window.__uu.UI.s.res.parca, ok: document.querySelector('.ik-q-res').dataset.ok }));
  ok(r3.ok === '1' && p2 - r3.parca === rc2, `${label}: doğru yanıt → yalnız ana maliyet (${p2} → ${r3.parca}, ${rc2})`);
  await until(page, () => !window.__uu.mod('ISKART').quickOpen(), null, 20000);
  noErr(label + ' · onarım sorusu');


  await restPrep(page); await sleep(800);
  const hm = await ev(page, () => { const m = document.getElementById('hrMini'); return !!(m && !m.hidden && m.offsetParent && getComputedStyle(m).visibility !== 'hidden'); });
  ok(hm, `${label}: Tablet kapalıyken #hrMini ana ekranda görünür`);
  if (!touch) await shot(page, '08-ana-ekran-harita'); else await shot(page, 't3-ana-ekran');
  if (!touch) { await page.keyboard.press('m'); } else { await tap(page, '#hrMini', true); }
  ok(await until(page, () => { const b = document.getElementById('hrBig'); return b && !b.hidden; }, null, 10000), `${label}: ${touch ? 'mini haritaya dokunma' : 'M'} → #hrBig açılır`);
  await until(page, () => window.__uu.pauseReason() === 'map', null, 5000);
  const mb = await ev(page, () => { const b = document.getElementById('hrBig'), x = b.querySelector('.hr-x'), r = (b.firstElementChild || b).getBoundingClientRect(); const box = [...b.children].map(c => c.getBoundingClientRect()); return { pr: window.__uu.pauseReason(), xs: x ? Math.min(x.getBoundingClientRect().width, x.getBoundingClientRect().height) : 0, inView: box.every(r => r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1), scroll: b.scrollHeight - b.clientHeight }; });
  ok(mb.pr === 'map', `${label}: büyük harita açıkken saat durur (${mb.pr})`);
  if (touch) ok(mb.inView && mb.scroll <= 1 && mb.xs >= 44, `${label}: #hrBig 844×390'da kaydırmasız sığar, kapatma ≥44 px ${JSON.stringify(mb)}`);
  const cm0 = await clock(page); await sleep(1500); ok((await clock(page)) === cm0, `${label}: büyük haritada saat ilerlemez`);
  if (!touch) await shot(page, '09-buyuk-harita');
  await page.keyboard.press('Escape'); await sleep(600);
  const af = await ev(page, () => ({ big: !document.getElementById('hrBig').hidden, modal: window.__uu.UI.modal }));
  ok(!af.big && !af.modal, `${label}: Esc büyük haritayı kapatır, menüyü açmaz ${JSON.stringify(af)}`);
  if (!touch) { await page.keyboard.press('m'); await sleep(500); await page.keyboard.press('m'); await sleep(500); ok(await ev(page, () => document.getElementById('hrBig').hidden && !window.__uu.UI.modal), `${label}: M aç / M kapat, tek basışta tek davranış`); }
  noErr(label + ' · harita');


  await ev(page, () => { window.__uu.UI.s && document.querySelectorAll('.toast').forEach(t => t.remove()); });
  await ev(page, () => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = 'Deneme bildirimi'; document.getElementById('toasts').appendChild(t); const c = document.getElementById('scanCard'); c.hidden = false; c.innerHTML = '<header><small>Tarama</small></header><b>Buz</b><p>Deneme</p>'; window.__uu.modTick(); });
  await sleep(900);
  const lay = await ev(page, () => { const R = id => { const e = document.getElementById(id); if (!e || e.hidden || !e.offsetParent) return null; const r = e.getBoundingClientRect(); return r.width && r.height ? r : null; }; const hm = R('hrMini'), to = R('toasts'), sc = R('scanCard'), tr = R('hudTR');
    const ov = (a, b) => !!(a && b && a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1);
    return { hm: hm && [Math.round(hm.left), Math.round(hm.top), Math.round(hm.right), Math.round(hm.bottom)], toTop: to && Math.round(to.top), scTop: sc && Math.round(sc.top), hit: { toasts: ov(hm, to), scan: ov(hm, sc), hudTR: ov(hm, tr), toastScan: ov(to, sc) } }; });
  ok(lay.hm && !lay.hit.toasts && !lay.hit.scan && !lay.hit.hudTR, `${label}: #toasts ve #scanCard haritanın altında, çakışma yok ${JSON.stringify(lay)}`);
  await ev(page, () => { document.querySelectorAll('.toast').forEach(t => t.remove()); const c = document.getElementById('scanCard'); c.hidden = true; c.innerHTML = ''; });


  await restPrep(page); await closeCalls(page);
  await ev(page, () => { window.__uu.hizliSoru(false); const s = window.__uu.UI.s; s.res.malzeme = 3000; s.res.o2 = s.res.su = s.res.gida = 999; });
  let over = false, tag = '';

  await ev(page, () => { const s = window.__uu.UI.s; s.b.filter(b => b.k === 'gunes').slice(1).forEach(b => { b.on = false; }); window.__uu.ff(1); });
  await tap(page, '[data-act="buildMenu"]', touch); await sleep(400);
  for (const k of ['oksijen', 'su', 'sera', 'lab', 'spor', 'oksijen', 'sera', 'su', 'lab', 'sera', 'oksijen', 'sera']) {
    await ev(page, k => { const u = window.__uu, sp = u.bestSpot(u.UI.s, k); if (sp) { u.pickB(k); u.placeAt({ tx: sp.x, ty: sp.y }); } for (const b of u.UI.s.b) b.left = 0; u.ff(1); }, k);
    const o = await ev(page, () => window.__uu.outlook());
    if (o && o.over) { over = true; break; }
  }
  await ev(page, () => window.__uu.pwTick()); await sleep(600);
  const pw1 = await ev(page, () => { const e = document.getElementById('pwWarn'); window.__uu.pickB('sera'); window.__uu.refresh(true); const c = document.querySelector('#drawer .dc-pw'); return { vis: !!(e && !e.hidden), m: e ? e.textContent.trim() : '', c: e && e.dataset.c, tag: c ? c.textContent.trim() : '' }; });
  tag = pw1.tag;
  ok(over && pw1.vis && /Elektrik yetmiyor/.test(pw1.m) && /güneş paneli kur|Durdur/.test(pw1.m) && words(pw1.m) <= 14, `${label}: fazla yapı → #pwWarn "Elektrik yetmiyor" + çözüm satırı (v5f) ("${pw1.m}")`);
  ok(/Elektrik yetmez/.test(tag), `${label}: kart etiketi "Elektrik yetmez" ("${tag}")`);
  if (!touch) await shot(page, '07a-enerji-cok-yapi');

  await ev(page, () => { const u = window.__uu; u.UI.s.b.filter(b => b.k === 'gunes').forEach(b => { b.on = true; }); u.ff(1); for (let i = 0; i < 20 && u.outlook().over; i++) { const sp = u.bestSpot(u.UI.s, 'gunes'); if (!sp) break; u.pickB('gunes'); u.placeAt({ tx: sp.x, ty: sp.y }); for (const b of u.UI.s.b) b.left = 0; u.ff(1); } });
  await ev(page, () => window.__uu.exitPlan());
  const ffTo = await ev(page, () => { const u = window.__uu, s = u.UI.s; for (const b of s.b.filter(o => o.k === 'batarya')) b.on = false; let g = 0; while (g++ < 400 && !s.over) { const o = u.outlook(); if (o && o.night && o.night.inH < 70 && o.night.inH > 30) break; s.res.o2 = s.res.su = s.res.gida = 999; s.pending.length = 0; u.ff(1); } if (u.UI.modal) u.ACT.closeModal(); const o = u.outlook(); return { t: s.t, night: o && o.night, over: o && o.over, broken: s.b.filter(b => b.broken).map(b => b.k) }; });
  lap(`${label}: saat ${ffTo.t}, gece ${JSON.stringify(ffTo.night)}, bozuk [${ffTo.broken}]`);
  await ev(page, () => { const u = window.__uu; for (const b of u.UI.s.b) if (b.broken) { b.broken = false; b.st = 'ok'; } u.UI.pwAriza = null; });
  await restPrep(page); await ev(page, () => window.__uu.pwTick()); await sleep(700);

  const pw2 = await ev(page, () => { const e = document.getElementById('pwWarn'), on = window.__uu.outlook().night; return { short: !!(on && on.short), vis: !!(e && !e.hidden), m: (e.querySelector('.pw-m') || {}).textContent || '', bar: !!e.querySelector('.pw-bar'), fix: (e.querySelector('.pw-fix') || {}).textContent || '' }; });
  ok(ffTo.night && pw2.short && pw2.vis && /Uzun gece .* sonra\. Elektriğin yetmeyecek!/.test(pw2.m) && pw2.bar && /batarya|Güneş Paneli|Nükleer/.test(pw2.fix), `${label}: geceye <72 saat, batarya yok → "Uzun gece … Elektriğin yetmeyecek!" + çubuk + çözüm (batarya ya da, batarya dolamıyorsa, üretim) ${JSON.stringify(pw2)}`);
  const radio = await ev(page, () => window.__uu.UI.s.radio.filter(r => r.from === 'atlas' && /Elektrik uyarısı|Power warning/.test((r.title || {}).tr || r.title)).map(r => r.text.tr).slice(-3));
  ok(radio.every(t => !/\d+ saat yeter/.test(t)), `${label}: ATLAS telsiz satırı uyarıyla aynı cümle, saat rakamları yalnız uyarıda ${JSON.stringify(radio)}`);
  const ob = await ev(page, () => { const c = document.getElementById('ogCard'); if (!c || c.hidden) return null; const a = c.getBoundingClientRect(), p = document.getElementById('pwWarn').getBoundingClientRect(); return a.left < p.right && a.right > p.left && a.top < p.bottom && a.bottom > p.top; });
  ok(ob !== true, `${label}: Bilgi kartı #pwWarn ile çakışmaz`);
  if (!touch) await shot(page, '07-enerji-uyarisi');
  const need = (ffTo.night && ffTo.night.addBat) || 3;
  const batLog = await ev(page, n => { const u = window.__uu, s = u.UI.s, log = []; s.res.malzeme = Math.max(s.res.malzeme, 2000); for (const b of s.b.filter(o => o.k === 'batarya')) b.on = true; if (!u.UI.plan) u.enterPlan();
    for (let i = 0; i < n + 16 && u.outlook().night && u.outlook().night.short; i++) { const nt = u.outlook().night, k = nt.addBat > 0 ? 'batarya' : (nt.addGen && nt.addGen !== 'reaktor' ? nt.addGen : 'gunes');
      const sp = u.bestSpot(s, k); if (!sp) { log.push('yer yok'); break; } u.pickB(k); log.push((u.placeAt({ tx: sp.x, ty: sp.y }) ? '' : 'x:') + k); for (const b of s.b) b.left = 0; s.res.o2 = s.res.su = s.res.gida = 999; u.ff(1); }
    u.exitPlan(); u.pwTick(); return log; }, need);
  lap(`${label}: batarya kurulumu ${JSON.stringify(batLog)}`);
  await ev(page, () => { const u = window.__uu; for (const b of u.UI.s.b) if (b.broken) { b.broken = false; b.st = 'ok'; } u.UI.pwAriza = null; });
  await ev(page, () => window.__uu.pwTick());

  const pwMid = await ev(page, () => { const e = document.getElementById('pwWarn'), o = window.__uu.outlook(); return { short: o.night.short, ready: o.night.ready, kind: e.hidden ? '' : e.dataset.kind }; });
  ok(!pwMid.short && pwMid.kind !== 'yaklasan' && pwMid.kind !== 'gece', `${label}: plan kurulunca "yetmeyecek" kalkar ${JSON.stringify(pwMid)}`);
  await ev(page, () => { const u = window.__uu, s = u.UI.s; for (let i = 0; i < 12 && !u.outlook().night.ready; i++) { s.res.o2 = s.res.su = s.res.gida = 999; s.pending.length = 0; u.ff(1); for (const b of s.b) if (b.broken) { b.broken = false; b.st = 'ok'; } } u.UI.pwAriza = null; u.pwTick(); });
  await sleep(700);
  const pw3 =await ev(page, () => { const e = document.getElementById('pwWarn'), o = window.__uu.outlook(); return { st: JSON.stringify(window.__uu.UI.s.pwSt) + '@' + window.__uu.UI.s.t + '/' + o.night.ready, short: o.night && o.night.short, vis: !!(e && !e.hidden), m: e ? e.textContent.trim() : '', c: e && e.dataset.c }; });
  ok(!pw3.short && pw3.vis && pw3.c === 'good' && /Uzun geceye hazırsın/.test(pw3.m), `${label}: yeterli batarya → "Uzun geceye hazırsın" ${JSON.stringify(pw3)}`);
  const pwTl = [];
  for (let i = 0; i < 13; i++) { await sleep(i < 12 ? 1000 : 600);   pwTl.push(await ev(page, () => { const e = document.getElementById('pwWarn'), u = window.__uu, s = u.UI.s, n = (u.outlook() || {}).night || {}; return `${s.t}:${e.hidden ? '-' : e.dataset.kind}:${n.short ? 'S' : 's'}${n.ready ? 'R' : 'r'}${s.b.some(b => b.broken) ? 'B' : ''}:${JSON.stringify(s.pwSt)}:${n.lastsH}`; })); }
  await ev(page, () => window.__uu.pwTick());
  ok(await ev(page, () => document.getElementById('pwWarn').hidden), `${label}: onaydan sonra uyarı kalkar ${pwTl.join(' ')}`);
  await ev(page, () => window.__uu.hizliSoru(true));
  noErr(label + ' · enerji');
  await page.context().close();
}


async function skipScreen() {
  const page = await open(1366, 768, false);
  await ev(page, () => { window.__uu.egitimAtla(false); });
  await ev(page, () => document.querySelector('[data-act="start"][data-v="ay"]').click());
  await until(page, () => window.__uu.UI.s && (window.__uu.UI.modal === 'creator' || window.__uuMods.EGITIM.active()), null, 60000);
  if (await ev(page, () => window.__uu.UI.modal === 'creator')) await ev(page, () => window.__uu.crGo());
  await until(page, () => window.__uuMods.EGITIM.active(), null, 60000);
  await until(page, () => { const a = document.getElementById('egSkip'); return a && !a.hidden; }, null, 60000);
  await page.click('#egSkip').catch(() => {}); await sleep(300); await page.click('#egSkip').catch(() => {});
  ok(await until(page, () => { const d = document.getElementById('egDone'); return d && !d.hidden; }, null, 20000), 'eğitim atlanınca kısa "Eğitimi geçtin" ekranı');
  const t = await ev(page, () => ({ h: (document.querySelector('#egDone h2') || {}).textContent, li: document.querySelectorAll('#egDone .egd-l li').length }));
  ok(t.h === 'Eğitimi geçtin.' && t.li === 0, 'kısa ekran: başlık "Eğitimi geçtin.", öğrenilenler listesi yok ' + JSON.stringify(t));
  await page.click('#egDoneGo'); await sleep(1500);
  ok(await ev(page, () => !window.__uu.UI.train && !window.__uu.UI.egDone && window.__uu.UI.s.t < 24), 'kısa ekrandan gerçek göreve geçilir');
  noErr('eğitim atlama');
  await page.context().close();
}


async function smoke(world, level, w, h, touch) {
  const label = `duman ${world}/${level} ${w}×${h}`;
  const page = await open(w, h, touch);
  await ev(page, () => { window.__uu.egitimAtla(true); window.__uu.hizliSoru(true); });
  await ev(page, a => window.__uu.startAs(a[0], a[1]), [world, level]);
  await until(page, () => window.__uu.UI.s && (window.__uu.UI.modal === 'creator' || !window.__uu.UI.modal), null, 60000);
  if (await ev(page, () => window.__uu.UI.modal === 'creator')) await ev(page, () => window.__uu.crGo());
  await sleep(1500);
  if (level === 'muhendis' && await ev(page, () => window.__uu.UI.s.level !== 'muhendis')) await ev(page, () => { const u = window.__uu; u.UI.s.level = 'muhendis'; document.getElementById('app').dataset.level = 'muhendis'; u.refresh(true); });
  const s0 = await ev(page, () => ({ w: window.__uu.UI.s.world, lv: window.__uu.UI.s.level }));
  ok(s0.w === world && s0.lv === level, `${label}: görev açıldı ${JSON.stringify(s0)}`);
  await closeCalls(page); await restPrep(page);
  await ev(page, () => { const s = window.__uu.UI.s; s.res.malzeme = 2000; s.res.parca = 60; s.res.o2 = s.res.su = s.res.gida = 999; });

  await ev(page, () => window.__uu.enterPlan()); await sleep(500);
  const d = await ev(page, () => ({ m: !!document.getElementById('dr-malzeme'), p: (() => { const e = document.getElementById('dr-parca'); return !!(e && e.offsetParent); })() }));
  ok(d.m && (level !== 'muhendis' || d.p), `${label}: #drRes (malzeme; parça Mühendis'te hep, Kâşif'te varsa — v5f) ${JSON.stringify(d)}`);
  let q = false;
  const tries = [];
  for (let i = 0; i < 6 && !q; i++) { tries.push(await ev(page, () => { const u = window.__uu, s = u.UI.s, sp = u.bestSpot(s, 'gunes'); if (!sp) return 'yer yok'; u.pickB('gunes'); const r = u.placeAt({ tx: sp.x, ty: sp.y }); return r ? 'ok' : 'x:' + (u.UI.placing || '-'); })); q = await until(page, () => { const q = document.getElementById('ikQuick'); return !!(q && !q.hidden && q.getClientRects().length); }, null, 3000); }
  ok(q, `${label}: inşa hızlı sorusu açıldı ${JSON.stringify(tries)}`);
  if (q) { const n = await ev(page, () => document.querySelectorAll('#ikQuick .ik-q-opt').length); ok(n === (level === 'muhendis' ? 3 : 2), `${label}: şık sayısı ${n}`); await tap(page, '.ik-q-opt[data-ok="1"]', touch); await until(page, () => !window.__uu.mod('ISKART').quickOpen(), null, 20000); }
  await ev(page, () => window.__uu.exitPlan());
  const bid = await ev(page, () => { const u = window.__uu, s = u.UI.s, b = s.b.find(o => o.k === 'gunes'); for (const x of s.b) x.left = 0; b.broken = true; return b.id; });
  await ev(page, b => window.__uu.doRepair(b), bid);
  ok(await until(page, () => { const q = document.getElementById('ikQuick'); return q && !q.hidden; }, null, 15000), `${label}: onarım hızlı sorusu`);
  await tap(page, '.ik-q-opt[data-ok="1"]', touch); await until(page, () => !window.__uu.mod('ISKART').quickOpen(), null, 20000);
  ok(await ev(page, b => !window.__uu.UI.s.b.find(o => o.id === b).broken, bid), `${label}: onarıldı`);
  await restPrep(page); await sleep(800);
  await ev(page, () => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = 'Deneme bildirimi'; document.getElementById('toasts').appendChild(t); window.__uu.modTick(); }); await sleep(900);
  const lay = await ev(page, () => { const R = id => { const e = document.getElementById(id); if (!e || e.hidden || !e.offsetParent) return null; const r = e.getBoundingClientRect(); return r.width && r.height ? r : null; }; const hm = R('hrMini'), to = R('toasts'), tr = R('hudTR');
    const ov = (a, b) => !!(a && b && a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1); const tl = R('hudTL'), tc = R('hudTC');
    return { hm: !!hm, tr: !!tr, hit: { toasts: ov(hm, to), hudTR: ov(hm, tr), hudTC: ov(hm, tc), tlTr: ov(tl, tr) }, hmTop: hm && Math.round(hm.top), toTop: to && Math.round(to.top) }; });
  ok(lay.hm && !lay.hit.toasts && !lay.hit.hudTR && !lay.hit.hudTC, `${label}: sağ üst köşe (harita, çipler, bildirim) çakışmasız ${JSON.stringify(lay)}`);
  await ev(page, () => document.querySelectorAll('.toast').forEach(t => t.remove()));
  noErr(label);
  await page.context().close();
}


async function kasifAriza(w, h, touch) {
  const label = `Kâşif arıza ${w}×${h}`;
  const page = await open(w, h, touch);
  await ev(page, () => { window.__uu.egitimAtla(true); window.__uu.hizliSoru(true); });
  await ev(page, () => document.querySelector('[data-act="start"][data-v="ay"]').click());
  await until(page, () => window.__uu.UI.s && (window.__uu.UI.modal === 'creator' || !window.__uu.UI.modal), null, 60000);
  if (await ev(page, () => window.__uu.UI.modal === 'creator')) await ev(page, () => window.__uu.crGo());
  await sleep(1500);
  await closeCalls(page); await restPrep(page);
  const s0 = await ev(page, () => { const u = window.__uu, s = u.UI.s; s.res.malzeme = 2000; for (let i = 0; i < 2; i++) { const sp = u.bestSpot(s, 'gunes'); if (sp) { const r = u.build(s, 'gunes', sp.x, sp.y); if (r && r.b) r.b.left = 0; } } return { lv: s.level, train: !!s.train, day: Math.floor(s.t / 24) + 1 }; });
  ok(s0.lv === 'kasif' && !s0.train, `${label}: gerçek Kâşif görevi açıldı ${JSON.stringify(s0)}`);
  let br = null;
  for (let i = 0; i < 40 && !br; i++) {
    br = await ev(page, () => { const u = window.__uu, s = u.UI.s; s.res.o2 = s.res.su = s.res.gida = 999; s.res.parca = Math.max(s.res.parca, 20); u.ff(4); const b = s.b.find(o => o.broken); return b ? { id: b.id, k: b.k, day: Math.floor(s.t / 24) + 1 } : (s.t >= 7 * 24 ? { none: true, day: Math.floor(s.t / 24) + 1 } : null); });
    await closeCalls(page);
    if (br && br.none) break;
  }
  ok(br && !br.none && br.day <= 7, `${label}: 7. güne kadar arıza çıktı ${JSON.stringify(br)}`);
  if (br && !br.none) {
    await restPrep(page);
    await ev(page, b => window.__uu.modalBuilding(b), br.id); await sleep(600);
    await tap(page, '[data-act="bRepair"]', touch);
    const q = await until(page, () => { const q = document.getElementById('ikQuick'); return !!(q && !q.hidden && q.getClientRects().length); }, null, 15000);
    const qa = q ? await ev(page, () => { const k = window.__uuMods.ISKART._quick(); return k ? { act: k.act, q: (document.querySelector('#ikQuick .ik-q-q, #ikQuick h3, #ikQuick b') || {}).textContent || '' } : null; }) : null;
    ok(q && qa && qa.act === 'repair', `${label}: arızayı onarınca hızlı soru açılır ${JSON.stringify(qa)}`);
  }
  noErr(label);
  await page.context().close();
}

if (want('ariza')) await kasifAriza(1366, 768, false);
if (want('masa')) await scenario('masaüstü 1366×768', 1366, 768, false);
if (want('tel')) await scenario('telefon 844×390', 844, 390, true);
if (want('atla')) await skipScreen();
if (want('duman')) {
  await smoke('ay', 'muhendis', 1366, 768, false);
  await smoke('ay', 'muhendis', 844, 390, true);
  await smoke('mars', 'kasif', 1366, 768, false);
  await smoke('mars', 'kasif', 844, 390, true);
}
await browser.close();
const pass = checks.filter(c => c[0]).length;
console.log(`\nv5-butun: ${pass}/${checks.length} kontrol geçti (${Math.round((Date.now() - t0) / 1000)} sn)`);
if (errors.length) { console.log(errors.join('\n')); process.exit(1); }
