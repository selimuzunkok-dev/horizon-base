

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
const errors = [], checks = [];
const t0 = Date.now(), lap = m => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)} sn] ${m}`);
const ok = (cond, msg) => { checks.push([!!cond, msg]); if (!cond) { errors.push('KONTROL: ' + msg); lap('✗ ' + msg); } else lap('✓ ' + msg); };
const ev = (page, f, a) => page.evaluate(f, a);
const OG = 'window.__uuMods && window.__uuMods.OGRET';

async function open(w, h, touch) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'tr-TR', hasTouch: !!touch, isMobile: !!touch });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_INTERNET|net::|GPU stall|WebGL-/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message + '\n' + e.stack));
  await page.goto(url); await page.waitForTimeout(900);
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {   } }); await page.reload(); await page.waitForTimeout(1500);
  return page;
}
async function mission(page, world) {
  await ev(page, () => { if (window.__uu && window.__uu.egitimAtla) window.__uu.egitimAtla(true); });
  await page.click(`[data-act="start"][data-v="${world}"]`, { timeout: 60000 }); await page.waitForTimeout(1500);
  if (await ev(page, () => window.__uu.UI.modal === 'creator')) { await page.click('#crGo', { timeout: 60000 }); await page.waitForTimeout(900); }
  await page.waitForFunction(() => window.__uu.UI.s && !window.__uu.UI.modal && !window.__uu.UI.train, null, { timeout: 120000 }).catch(() => {});

  await ev(page, () => { const u = window.__uu; if (u.UI.modal) { const b = document.querySelector('[data-act="closeModal"]'); if (b) b.click(); } });
  return ev(page, () => !!(window.__uu.UI.s));
}


const push = (page, id) => ev(page, id => { const IK = window.__uuMods.ISKART; const w = IK && IK.open && IK.open(); if (w && IK.close) IK.close(); window.__ogIK = (window.__ogIK || 0) + (w ? 1 : 0); const s = window.__uu.UI.s; if (s && s.learn) s.learn[id] = s.t; return window.__uuMods.OGRET.push(id); }, id);
const card = page => ev(page, () => { const e = document.getElementById('ogCard'); if (!e || e.hidden || e.style.visibility === 'hidden' || !window.__uuMods.OGRET.open()) return null; const r = e.getBoundingClientRect();
  return { id: e.dataset.id, t: (e.querySelector('.og-t') || {}).textContent, say: (e.querySelector('.og-say') || {}).textContent, n: document.querySelectorAll('#ogCard').length,
    icons: e.querySelectorAll('.og-flow .og-i').length, fs: parseFloat(getComputedStyle(e.querySelector('.og-say')).fontSize), tfs: e.querySelector('.og-t') && getComputedStyle(e.querySelector('.og-t')).display !== 'none' ? parseFloat(getComputedStyle(e.querySelector('.og-t')).fontSize) : null,
    flowOver: (() => { const f = e.querySelector('.og-flow'); return f ? f.scrollWidth - f.clientWidth : 0; })(),
    blank: [...e.querySelectorAll('.og-flow .og-i')].filter(i => { const cv = i.querySelector('canvas'); if (!cv) return !i.querySelector('svg'); try { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; for (let k = 3; k < d.length; k += 8) if (d[k] > 8) return false; } catch (x) { return false; } return true; }).length, r: { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height } }; });
const waitCard = (page, ms) => page.waitForFunction(() => { const e = document.getElementById('ogCard'); return e && !e.hidden && e.style.visibility !== 'hidden' && window.__uuMods.OGRET.open(); }, null, { timeout: ms || 20000 }).then(() => true, () => false);
const waitGone = (page, ms) => page.waitForFunction(() => { const e = document.getElementById('ogCard'); return !e || e.hidden || !window.__uuMods.OGRET.open(); }, null, { timeout: ms || 30000 }).then(() => true, () => false);

const SHOT = process.env.SHOT_DIR || 'test/shots-tmp';
const chipInfo = page => ev(page, () => { const e = document.getElementById('ogCard'), c = e && e.querySelector('.src-chip'); if (!c) return null; const r = c.getBoundingClientRect(), k = e.getBoundingClientRect(), cs = getComputedStyle(c), sp = c.querySelector('span');
  return { text: c.textContent, title: c.title, vis: cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0, fs: parseFloat(cs.fontSize), h: r.height, inCard: r.left >= k.left - 0.5 && r.right <= k.right + 0.5 && r.top >= k.top - 0.5 && r.bottom <= k.bottom + 0.5, over: sp ? sp.scrollWidth - sp.clientWidth : 0 }; });
const over = (a, b) => a && b &&a.l < b.r - 1 && a.r > b.l + 1 && a.t < b.b - 1 && a.b > b.t + 1;
const boxes = page => ev(page, () => { const out = {}; for (const sel of ['#gauges', '#sub', '#drawer', '#hudTL', '#objective', '#acts', '#hrMini', '#pwWarn', '#egShow', '#ikQuick', '#fakeQ']) { const e = document.querySelector(sel); if (!e || e.hidden) continue; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); if (r.width && r.height && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0) out[sel] = { l: r.left, t: r.top, r: r.right, b: r.bottom }; } return out; });
async function noOverlap(page, tag) {
  await page.waitForTimeout(600);
  const c = await card(page), bx = await boxes(page), vw = page.viewportSize();
  ok(c && c.r.l >= 0 && c.r.t >= 0 && c.r.r <= vw.width && c.r.b <= vw.height, `${tag}: kart ekranın içinde ${c ? JSON.stringify(c.r) : 'yok'}`);
  const hit = Object.keys(bx).filter(k => over(c && { l: c.r.l, t: c.r.t, r: c.r.r, b: c.r.b }, bx[k]));
  ok(c && !hit.length, `${tag}: kart başka öğeye binmiyor${hit.length ? ' (' + hit.join(', ') + ')' : ''}`);
  ok(c && (c.r.w <= 300 || c.r.h <= 64), `${tag}: genişlik ≤300 px ya da tek satır ≤64 px (${c && Math.round(c.r.w)}x${c && Math.round(c.r.h)})`);
  ok(c && c.flowOver <= 1, `${tag}: simge şeridi kart genişliğinden taşmıyor (${c && c.flowOver} px)`);
  ok(c && (c.tfs == null || c.tfs >= 12), `${tag}: başlık yazısı ≥12 px (${c && c.tfs})`);
}


async function noOverlapSub(page, tag) {
  await page.waitForTimeout(600);
  const w = await ev(page, () => { const e = document.getElementById('ogCard'), st = window.__uuMods.OGRET._state(); return !!(e && !e.hidden && e.style.visibility === 'hidden' && st.cur && st.cur.wait); });
  if (!w) return noOverlap(page, tag);
  ok(true, `${tag}: yer yok → kart altyazı gidene kadar bekliyor`);
  const ms0 = await ev(page, () => window.__uuMods.OGRET._state().cur.held);
  await page.waitForTimeout(500);
  ok(await ev(page, ms0 => { const c = window.__uuMods.OGRET._state().cur; return !!c && c.held > ms0; }, ms0), `${tag}: beklerken okuma süresi işlemez`);
  await ev(page, () => { const s = document.getElementById('sub'); s.hidden = true; });
  ok(await waitCard(page, 3000), `${tag}: altyazı gidince kart açıldı`);
  await noOverlap(page, tag + ' (altyazı gitti)');
}


let page = await open(1366, 768);
const mod = await ev(page, () => { const O = window.__uuMods && window.__uuMods.OGRET; return O ? { f: ['tick', 'open', 'notebook', 'count', 'fresh', 'seen', 'push'].filter(k => typeof O[k] === 'function').length, icons: O.icons.length } : null; });
ok(mod && mod.f === 7 && mod.icons >= 8, '#test: window.__uuMods.OGRET ve API ' + JSON.stringify(mod));
lap('tarayıcı: ' + how);
ok(await mission(page, 'ay'), 'Ay görevi açıldı');
await page.waitForTimeout(1500);

if (await waitCard(page, 15000)) { await page.click('#ogCard').catch(() => {}); await page.waitForTimeout(500); }
const c0 = await ev(page, () => window.__uuMods.OGRET.count());
ok(c0 && c0.total >= 30, 'count(): Ay için toplam ' + JSON.stringify(c0));


{
  const fl = await ev(page, async () => {
    const O = window.__uuMods.OGRET, ids = O._ids(), bad = [], hud = document.getElementById('hud') || document.body;
    const box = document.createElement('div'); box.id = 'ogProbe'; box.className = 'og-card'; box.style.cssText = 'position:absolute;left:0;top:0;z-index:99'; hud.appendChild(box);
    let icons = 0;
    for (const id of ids) {
      box.innerHTML = `<div class="og-flow">${O._flow(id)}</div>`; O.paint(box);
      await new Promise(r => requestAnimationFrame(() => r()));
      const f = box.querySelector('.og-flow'); const its = [...f.querySelectorAll('.og-i')];
      if (its.length < 2) bad.push(id + ': ' + its.length + ' simge');
      its.forEach((i, k) => {
        icons++;
        const r = i.getBoundingClientRect(), op = +getComputedStyle(i).opacity, cv = i.querySelector('canvas'), sv = i.querySelector('svg');
        let drawn = false;
        if (cv) { try { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; for (let q = 3; q < d.length; q += 8) if (d[q] > 8) { drawn = true; break; } } catch (x) { drawn = false; } }
        else if (sv && !sv.hasAttribute('data-miss')) { try { const bb = sv.getBBox(); drawn = bb.width > 1 && bb.height > 1; } catch (x) { drawn = false; } }
        if (!drawn || op < 0.9 || r.width < 8 || r.height < 8) bad.push(`${id}#${k}: çizilmedi=${!drawn} op=${op} w=${Math.round(r.width)}`);
      });
    }
    box.remove();
    return { n: ids.length, icons, bad };
  });
  ok(fl.n >= 44 && !fl.bad.length, `Ay'daki ${fl.n} Bilgi kaydının şeridi tam çizilir (${fl.icons} simge, ilk karede görünür) ${fl.bad.slice(0, 6).join(' | ')}`);
}


const tPush = Date.now();
await push(page, 't_gunes');
const diag = page => ev(page, () => { const O = window.__uuMods.OGRET, u = window.__uu, IK = window.__uuMods.ISKART, H = window.__uuMods.HARITA, e = document.getElementById('ogCard'); return JSON.stringify({ st: O._state(), modal: u.UI.modal, pda: u.UI.pda, ik: IK ? [!!(IK.open && IK.open()), !!(IK.quickOpen && IK.quickOpen())] : null, big: H && H.big ? H.big() : null, ikq: !!document.getElementById('ikQuick'), card: e ? [e.hidden, e.style.visibility, e.className, e.style.top] : null, closedIK: window.__ogIK, open: O.open(), lay: (() => { try { O._layout(); return 'ok'; } catch (x) { return x.message; } })() }); });
ok(await waitCard(page, 20000), 'push(t_gunes) → kart açıldı ' + await diag(page));
let c = await card(page);
ok(c && c.id === 't_gunes' && /Güneş paneli/i.test(c.t) && /elektriğe çevirir/.test(c.say), 'kart: başlık + cümle ' + JSON.stringify(c && { t: c.t, say: c.say }));
ok(c && c.icons >= 3, 'kart: simgeli akış (' + (c && c.icons) + ' simge)');
ok(c && c.fs >= 15, 'kart: cümle yazısı ≥15 px (' + (c && c.fs) + ')');
ok(!(await chipInfo(page)), 'kaynak-k: kaynaksız Bilgi kartında (Ay t_gunes) kaynak çipi yok');
await noOverlap(page, '1366x768');

await push(page, 't_batarya');
await page.waitForTimeout(600);
c = await card(page);
ok(c && c.n === 1 && c.id === 't_gunes', 'aynı anda tek kart (ikincisi kuyrukta)');

const minMs = await ev(page, () => window.__uuMods.OGRET.minMs({ say: { tr: document.querySelector('#ogCard .og-say').textContent, en: '' } }));
ok(await waitGone(page, 40000), 'kart kendiliğinden kapandı');
const last1 = await ev(page, () => window.__uuMods.OGRET.last);
ok(last1 && !last1.tap && last1.ms >= minMs, `en az 2,5 sn + 0,8 sn × kelime kaldı (${last1 && last1.ms} ms ≥ ${minMs} ms)`);
const tGone = Date.now();
ok(await waitCard(page, 40000), 'kuyruktaki ikinci kart açıldı');
const gap = Date.now() - tGone;
ok(gap >= 7500, `iki kart arası en az 8 sn (${gap} ms)`);
c = await card(page);
ok(c && c.id === 't_batarya', 'ikinci kart t_batarya');

await page.click('#ogCard');
await page.waitForTimeout(500);
const last2 = await ev(page, () => window.__uuMods.OGRET.last);
ok(!(await ev(page, () => window.__uuMods.OGRET.open())) && last2 && last2.tap, 'dokununca kapandı');

await ev(page, () => window.__uu.openPda());
await page.waitForTimeout(400);
await push(page, 't_oksijen');
await page.waitForTimeout(9500);
ok(!(await ev(page, () => window.__uuMods.OGRET.open())), 'Tablet açıkken kart beklemede');
await ev(page, () => window.__uu.closePda());
ok(await waitCard(page, 20000), 'Tablet kapanınca kart açıldı');
c = await card(page);
ok(c && c.blank === 0, 'kartta boş simge yok (' + (c && c.id) + ', ' + (c && c.blank) + ' boş)');

await ev(page, () => window.__uuMods.OGRET._close());
await page.waitForTimeout(400);
await ev(page, () => { const q = document.createElement('div'); q.id = 'ikQuick'; q.style.cssText = 'position:fixed;left:30%;top:30%;width:40%;height:40%;background:#123'; q.textContent = 'soru'; document.body.appendChild(q); });
await push(page, 't_su');
await page.waitForTimeout(9500);
ok(!(await ev(page, () => window.__uuMods.OGRET.open())), 'hızlı soru açıkken kart beklemede');
await ev(page, () => document.getElementById('ikQuick').remove());
const tq = Date.now();
ok(await waitCard(page, 20000), 'soru kapanınca kart açıldı');
ok(Date.now() - tq >= 900, `soru kapandıktan en az 1 sn sonra (${Date.now() - tq} ms)`);

await ev(page, () => window.__uuMods.OGRET._close());
await page.waitForTimeout(8500);
await ev(page, () => { const ch = document.getElementById('chapter'); ch.hidden = false; ch.classList.remove('go'); void ch.offsetWidth; ch.classList.add('go'); });
await push(page, 't_onarim');
await page.waitForTimeout(3000);
const chWait = await ev(page, () => ({ open: (() => { const e = document.getElementById('ogCard'); return !!(e && !e.hidden && e.style.visibility !== 'hidden'); })(), run: document.getElementById('chapter').getAnimations().some(a => a.playState === 'running') }));
ok(chWait.run && !chWait.open, 'bölüm kartı ekrandayken Bilgi kartı beklemede ' + JSON.stringify(chWait));
ok(await waitCard(page, 20000) && !(await ev(page, () => document.getElementById('chapter').getAnimations().some(a => a.playState === 'running'))), 'bölüm kartı bitince Bilgi kartı açıldı');

await ev(page, () => { window.__uu.UI.chapUntil = 0; const ch = document.getElementById('chapter'); if (ch) ch.hidden = true; const s = document.getElementById('sub'); s.hidden = false; s.classList.remove('out', 'held'); if (!s.textContent.trim()) s.innerHTML = '<div class="s-body"><div class="s-text">Bu bir deneme altyazısıdır, on iki kelimeye yakın uzunlukta bir satır.</div></div>'; window.__uuMods.OGRET._layout(); });
await page.waitForTimeout(400);
await noOverlap(page, '1366x768 + altyazı');

await ev(page, () => { const b = document.querySelector('[data-act="buildMenu"]'); if (b) b.click(); else window.__uu.enterPlan(); });
await page.waitForTimeout(1500);
await ev(page, () => window.__uuMods.OGRET._layout());
await page.waitForTimeout(300);
if (await card(page)) await noOverlap(page, '1366x768 inşa görünümü'); else ok(false, 'inşa görünümünde kart görünür');
await ev(page, () => { if (window.__uu.UI.plan) window.__uu.exitPlan(); });
await ev(page, () => window.__uuMods.OGRET._close());


await ev(page, () => { const s = document.getElementById('sub'); if (s) s.hidden = true; });
await push(page, 't_gece');
{
  let ci = null;
  for (let k = 0; k < 3; k++) { if (!(await waitCard(page, 25000))) break; if ((await card(page) || {}).id === 't_gece') break; await ev(page, () => window.__uuMods.OGRET._close()); }
  await page.waitForTimeout(700);
  ci = await chipInfo(page);
  ok(ci && ci.vis && ci.title === 'NASA NSSDCA Moon Fact Sheet' && /^Kaynak: NASA · NSSDCA Moon Fact Sheet$/.test(ci.text.trim()), 'kaynak-k: kaynaklı Bilgi kartında çip görünür, künyeyi taşır ' + JSON.stringify(ci));
  ok(ci && ci.fs >= 12 && ci.h <= 26 && ci.inCard, 'kaynak-k: çip ≥12 px, tek satır, kartın içinde ' + JSON.stringify(ci && { fs: ci.fs, h: ci.h, inCard: ci.inCard }));
  await noOverlap(page, '1366x768 kaynaklı kart');
  try { fs.mkdirSync(SHOT, { recursive: true }); await page.screenshot({ path: path.join(SHOT, 'bilgi-karti.jpg'), quality: 85 }); } catch (e) { lap('görüntü yok: ' + e.message); }
  await ev(page, () => window.__uuMods.OGRET._close());
}


const nb = await ev(page, () => { const O = window.__uuMods.OGRET, h = O.notebook(), d = document.createElement('div'); d.innerHTML = h; const c = O.count();
  return { have: c.have, total: c.total, top: (d.querySelector('.og-n') || {}).textContent, rows: [...d.querySelectorAll('.og-row')].map(r => r.dataset.id), groups: [...d.querySelectorAll('.og-g span:first-child')].map(e => e.textContent), lock: d.querySelectorAll('.og-lock span').length, more: d.querySelectorAll('.og-row details').length }; });
ok(nb.have >= 3 && nb.top === `${nb.have}/${nb.total}`, 'Defterim: üstte ilerleme "' + nb.top + '"');
ok(['t_gunes', 't_batarya', 't_oksijen'].every(id => nb.rows.includes(id)), 'Defterim: öğrenilenler listede ' + JSON.stringify(nb.rows));
ok(nb.groups.join('|') === 'Yapılar|Olaylar|Ay', 'Defterim: gruplar ' + nb.groups.join('|'));
ok(nb.lock === nb.total - nb.have, `Defterim: kilitli "?" sayısı ${nb.lock} = ${nb.total - nb.have}`);
ok(nb.more >= 1, 'Defterim: "Daha fazla" ayrıntısı var');
const fr = await ev(page, () => { const O = window.__uuMods.OGRET, a = O.fresh(); O.seen(); return [a, O.fresh()]; });
ok(fr[0] >= 3 && fr[1] === 0, 'fresh() ' + fr[0] + ' → seen() sonrası ' + fr[1]);
await page.context().close();


page = await open(844, 390, true);
ok(await mission(page, 'ay'), 'telefon: Ay görevi açıldı');
await page.waitForTimeout(1500);
await push(page, 't_sera');
ok(await waitCard(page, 20000), 'telefon: kart açıldı');
await noOverlap(page, '844x390');
await ev(page, () => { window.__uu.UI.chapUntil = 0; const ch = document.getElementById('chapter'); if (ch) ch.hidden = true; const s = document.getElementById('sub'); s.hidden = false; s.classList.remove('out', 'held'); if (!s.textContent.trim()) s.innerHTML = '<div class="s-body"><div class="s-text">Bu bir deneme altyazısıdır, on iki kelimeye yakın uzunlukta bir satır.</div></div>'; window.__uuMods.OGRET._layout(); });
await page.waitForTimeout(400);
await noOverlapSub(page, '844x390 + altyazı');
c = await card(page);
ok(c && c.r.h >= 44, 'telefon: dokunma alanı ≥44 px (' + (c && Math.round(c.r.h)) + ')');
await page.tap('#ogCard').catch(() => page.click('#ogCard'));
await page.waitForTimeout(500);
ok(!(await ev(page, () => window.__uuMods.OGRET.open())), 'telefon: dokununca kapandı');

await ev(page, () => { const s = document.getElementById('sub'); if (s) s.hidden = true; });
await push(page, 't_gece');
let gOk = false;
for (let k = 0; k < 3; k++) { if (!(await waitCard(page, 25000))) break; if ((await card(page) || {}).id === 't_gece') { gOk = true; break; } lap('telefon: araya giren kart ' + (await card(page) || {}).id); await ev(page, () => window.__uuMods.OGRET._close()); }
if (gOk) {
  await page.waitForTimeout(700);
  const ci = await chipInfo(page), cc = await card(page);
  const line = await ev(page, () => document.getElementById('ogCard').classList.contains('og-line'));
  ok(cc && cc.id === 't_gece' && (line ? !ci || !ci.vis : ci && ci.vis && ci.inCard && ci.fs >= 12), 'kaynak-k: 844x390 çip kartın içinde ' + JSON.stringify({ line, ci, r: cc && cc.r }));
  await noOverlap(page, '844x390 kaynaklı kart');
  try { fs.mkdirSync(SHOT, { recursive: true }); await page.screenshot({ path: path.join(SHOT, 'tel-bilgi-karti.jpg'), quality: 85 }); } catch (e) { lap('görüntü yok: ' + e.message); }
  await ev(page, () => window.__uuMods.OGRET._close());
} else ok(false, 'kaynak-k: telefonda t_gece kartı açıldı');

await ev(page, () => { const b = document.querySelector('[data-act="buildMenu"]'); if (b) b.click(); else window.__uu.enterPlan(); });
await page.waitForTimeout(1500);
await push(page, 't_batarya');
ok(await waitCard(page, 20000), 'telefon inşa: kart açıldı');
await noOverlap(page, '844x390 inşa görünümü');
await ev(page, () => { window.__uu.UI.chapUntil = 0; const ch = document.getElementById('chapter'); if (ch) ch.hidden = true; const s = document.getElementById('sub'); s.hidden = false; s.classList.remove('out', 'held'); if (!s.textContent.trim()) s.innerHTML = '<div class="s-body"><div class="s-text">Bu bir deneme altyazısıdır, on iki kelimeye yakın uzunlukta bir satır.</div></div>'; window.__uuMods.OGRET._layout(); });
await page.waitForTimeout(400);
await noOverlapSub(page, '844x390 inşa + altyazı');
await ev(page, () => { if (window.__uu.UI.plan) window.__uu.exitPlan(); });

await ev(page, () => window.__uuMods.OGRET._close());
await push(page, 't_oksijen');
let cx = null;
for (let k = 0; k < 3; k++) { if (!(await waitCard(page, 25000))) break; cx = await card(page); if (cx && cx.id === 't_oksijen') break; await ev(page, () => window.__uuMods.OGRET._close()); }
ok(cx && cx.id === 't_oksijen' && cx.blank === 0 && cx.icons >= 5, 'Hava Makinesi kartı: simgelerin hepsi dolu ' + JSON.stringify(cx && { id: cx.id, blank: cx.blank, icons: cx.icons }));
await page.context().close();

await browser.close();
console.log(`\n${checks.filter(x => x[0]).length}/${checks.length} kontrol geçti`);
if (errors.length) { console.log(errors.join('\n')); process.exit(1); }
