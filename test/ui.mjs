

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const groot = execSync('npm root -g').toString().trim();
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(groot, '@playwright', 'cli', 'node_modules', 'playwright-core'));
const out = process.env.SHOTS || path.join(dir, 'shots'); fs.mkdirSync(out, { recursive: true });
const url = pathToFileURL(path.join(dir, '..', 'index.html')).href + '#test';
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null, want = n => !ONLY || ONLY.includes(n);
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: (process.platform === 'linux' || process.env.YAZILIM_CIZICI === '1') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
const errors = [], checks = [];
const t0 = Date.now(), lap = m => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)} sn] ${m}`);
const ok = (cond, msg) => { checks.push([!!cond, msg]); if (!cond) { errors.push('KONTROL: ' + msg); lap('✗ ' + msg); } else lap('✓ ' + msg); };

async function open(w, h, touch, locale) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: locale || 'tr-TR', hasTouch: !!touch, isMobile: !!touch });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_INTERNET|net::|GPU stall|WebGL-/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message + '\n' + e.stack));
  await page.goto(url); await page.waitForTimeout(900);
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {   } }); await page.reload(); await page.waitForTimeout(900);
  await skipEg(page);
  return page;
}

const skipEg = page => page.evaluate(() => { if (window.__uu && window.__uu.egitimAtla) window.__uu.egitimAtla(true); if (window.__uu && window.__uu.hizliSoru) window.__uu.hizliSoru(false); });

const ensureTut = page => page.evaluate(() => { const u = window.__uu; if (!u.tut() && u.UI.s && !u.UI.modal) u.startTutorial(true); return !!u.tut(); });
const shot = async (page, n) => { await page.screenshot({ path: path.join(out, n + '.png') }); };
const ev = (page, f, a) => page.evaluate(f, a);
const ff = (page, h) => ev(page, h => window.__uu.ff(h), h);
const settle = (page, ms) => page.waitForTimeout(Math.max(ms || 0, 700));
const clock = page => ev(page, () => { const u = window.__uu; return u.UI.s.t + u.UI.acc; });
const tutNow = page => ev(page, () => window.__uu.tut());
const tutTo = (page, id) => page.waitForFunction(id => { const t = window.__uu.tut(); return id ? !!t && t.id === id && !t.ok : !t; }, id, { timeout: 15000 }).then(() => true, () => false);

const crPass = async (page, name) => { if (await ev(page, () => window.__uu.UI.modal === 'creator')) { if (name != null) await page.fill('#crName', name); await page.click('#crGo'); await settle(page, 900); return true; } return false; };
const SUBF = c => Math.min(30000, Math.max(6000, 3000 + c * 100));


{
  const page = await open(1366, 768);
  const bad = await ev(page, () => Object.entries(window.__uu.STR).filter(([k, v]) => !Array.isArray(v) || v.length !== 2 || !String(v[0]).trim() || !String(v[1]).trim()).map(([k]) => k));
  ok(!bad.length, 'STR: her metin TR ve EN dolu' + (bad.length ? ' (eksik: ' + bad.join(', ') + ')' : ''));
  const feats = await ev(page, () => window.__uu.feats());
  const miss = Object.entries(feats).filter(([k, v]) => !v).map(([k]) => k);
  ok(!miss.length, 'A ve B sözleşmelerinin hepsi projede' + (miss.length ? ' (eksik: ' + miss.join(', ') + ')' : ''));
  lap('v3 sözleşmeleri (false olanlar için arayüzün yedeği kullanılır): ' + JSON.stringify(await ev(page, () => window.__uu.feats3())));
  await page.context().close();
}


if (want('masa')) {
  let page = await open(1366, 768);
  await shot(page, '01-baslik');
  const gl = await ev(page, () => window.__uu.UI.gl);
  lap('WebGL / sahne: ' + (gl ? 'var' : 'YOK'));
  if (!gl) { await page.click('[data-act="start"]'); await settle(page); await shot(page, '01b-webgl-yok'); await browser.close(); console.log('Sahne açılamadı.'); process.exit(errors.length ? 1 : 0); }
  ok(await ev(page, () => !document.getElementById('cmdName')), 'ad alanı başlık ekranında değil (yaratıcıya taşındı)');
  await page.click('[data-act="start"]'); await settle(page, 1500);

  ok(await page.waitForFunction(() => window.__uu.UI.modal === 'creator' && window.__uu.pauseReason() === 'modal', null, { timeout: 15000 }).then(() => true, () => false), 'yeni görev "Astronotunu hazırla" ekranıyla açılır, zaman durur');
  ok(await ev(page, () => document.activeElement && document.activeElement.id === 'crGo'), '"Başla" odaklı açılır');
  const tC = await clock(page); await settle(page, 1500);
  ok(await clock(page) === tC, 'yaratıcı açıkken saat ilerlemez');
  const crIn = await ev(page, () => ({ rows: document.querySelectorAll('#modalBox .cr-row').length, suits: document.querySelectorAll('#modalBox .suits .sw').length, syms: document.querySelectorAll('#modalBox .syms .sw').length, closed: !document.querySelector('#modalBox .cr-more').open, real: !!document.querySelector('#modalBox .fact.real'), on: [...document.querySelectorAll('#modalBox .sw.on')].map(e => e.dataset.v) }));
  ok(crIn.rows === 3 && crIn.suits === 6 && crIn.syms >= 4 && crIn.closed && crIn.real, 'Kâşif yaratıcısı: ad, 6 giysi rengi, arma simgeleri; "Daha fazla" kapalı; "Gerçekte" satırı ' + JSON.stringify(crIn));
  ok(crIn.on.length >= 2, 'her satır varsayılanla dolu gelir (seçili: ' + crIn.on.join(', ') + ')');
  const crFs = await ev(page, () => [...document.querySelectorAll('#modalBox .sw-n, #modalBox .cr-l, #modalBox .fact, #modalBox .cr-foot small')].map(e => parseFloat(getComputedStyle(e).fontSize)));
  ok(Math.min(...crFs) >= 13, 'yaratıcı yazıları ≥ 13 px (en küçük ' + Math.min(...crFs) + ' px)');
  await page.click('.sw[data-v="su_mavi"]'); await settle(page, 300);
  ok(await ev(page, () => window.__uu.look().suit === 'su_mavi' && document.querySelector('.sw[data-v="su_mavi"]').classList.contains('on')), 'giysi rengi seçilir (mavi)');
  await page.fill('#crName', 'Ada'); await settle(page, 300); await shot(page, '01c-yaratici');
  await page.press('#crName', 'Enter'); await settle(page, 1200);
  const cr1 = await ev(page, () => { const u = window.__uu; let ls = null; try { ls = JSON.parse(localStorage.getItem('ufuk-ussu-profil')); } catch (e) {   } return { modal: u.UI.modal, name: u.UI.s.name, suit: u.look().suit, pn: u.prof().name, ps: u.prof().look && u.prof().look.suit, ls }; });
  ok(cr1.modal !== 'creator' && cr1.name === 'Ada' && cr1.suit === 'su_mavi', 'Enter → başladı; ad ve renk kayıtta (s.name, s.look) ' + JSON.stringify({ n: cr1.name, s: cr1.suit }));
  ok(cr1.pn === 'Ada' && cr1.ps === 'su_mavi' && cr1.ls && cr1.ls.name === 'Ada' && cr1.ls.v === 1, 'ad ve görünüş profilde (ufuk-ussu-profil)');
  ok(await ev(page, () => window.__uu.UI.s.level === 'kasif' && window.__uu.UI.mode === 'walk'), 'kamera-3p: Kâşif ilk oyun üçüncü şahısla başlar');

  await ev(page, () => { if (window.__uu.UI.mode === 'walk') window.__uu.toggleView(); }); await settle(page, 500);
  await ensureTut(page);
  ok((await tutNow(page)).id === 'air', 'eğitim oyunun derdiyle başlar (hava)');
  const tA = await clock(page); await settle(page, 1500);
  ok(await clock(page) === tA, 'eğitimde ▶ adımına kadar zaman akmaz');
  await shot(page, '02-egitim-hava');
  await page.click('[data-act="tutGot"]');
  ok(await tutTo(page, 'build'), 'eğitim: hava → elektrik adımı');
  await shot(page, '03-egitim-kur');

  await page.click('#acts [data-act="buildMenu"]'); await settle(page, 900);
  await page.waitForFunction(() => window.__uu.pauseReason() === 'plan', null, { timeout: 15000 }).catch(() => {});
  const pv = await ev(page, () => { const u = window.__uu; return { plan: u.UI.plan, why: u.pauseReason(), drawer: !document.getElementById('drawer').hidden, hl: !!document.querySelector('.dcard.hl[data-v="gunes"]'), sel: u.UI.placing, best: !!u.UI.best, mode: u.S3.mode }; });
  ok(pv.plan && pv.why === 'plan' && pv.drawer, 'Kur → inşa görünümü açık, zaman durdu, çekmece görünür');
  ok(pv.hl && pv.sel === 'gunes' && pv.best, 'Güneş Paneli kartı vurgulu ve seçili, önerilen yer var');
  ok(pv.mode === 'plan', 'inşa görünümü yukarıdan (sahne kipi: ' + pv.mode + ')');
  await page.waitForTimeout(2500);
  const vis = await ev(page, () => { const u = window.__uu, s = u.UI.s, S = u.S3, g = document.getElementById('game').getBoundingClientRect(), top = document.getElementById('drawer').getBoundingClientRect().top - g.top;
    const pts = [u.UI.best].concat(u.starter ? u.starter() : []).filter(Boolean); return pts.map(p => { const w = { x: p.x * 8 + 4, z: p.y * 8 + 4 }, q = S.project(w.x, S.hAt(w.x, w.z), w.z); return { k: p.k || 'best', y: Math.round(q.sy), top: Math.round(top), ok: !q.behind && q.sy < top - 8 && q.sy > 60 }; }); });
  ok(vis.length && vis[0].ok, 'önerilen yerin yıldızı çekmecenin üstünde görünür ' + JSON.stringify(vis[0]));
  const edges = await ev(page, () => [...document.querySelectorAll('#markers .mk.edge')].filter(e => !e.hidden).map(e => { const r = e.getBoundingClientRect(); return { t: e.textContent, y: Math.round(r.top) }; }));
  const drTop = vis.length ? vis[0].top : 768, hiddenN = vis.filter(v => !v.ok).length;
  ok(edges.length >= hiddenN && edges.every(e => e.y < drTop), `çekmecenin altında kalan ${hiddenN} plan diski için çekmece kenarında ok ve ad var ${JSON.stringify(edges.map(e => e.t))}`);
  const cards = await ev(page, () => [...document.querySelectorAll('.dcard')].map(c => ({ k: c.dataset.v, does: !!c.querySelector('.dc-l'), cost: (c.querySelector('.dc-cost') || c.querySelector('.dc-lock') || {}).textContent || '' })));
  ok(cards.length >= 6 && cards.every(c => c.does && c.cost), 'her kartta "Ne verir / Ne ister" ve sözcüklü fiyat ya da kilit nedeni');
  ok(!cards.some(c => /\bkW\b|☼|\bsa\b/.test(c.cost)), 'kartlarda kW/kısaltma yok');
  const tP = await clock(page); await page.mouse.move(683, 380); await settle(page, 1500);
  ok(await clock(page) === tP, 'inşa görünümünde saat durur');
  await shot(page, '04-insa-gorunumu');
  const lab = await ev(page, () => { const l = document.getElementById('planLabel'); return l.hidden ? '' : l.textContent; });
  ok(lab.length > 3, 'imleçteki kare için düz sözlü etiket: "' + lab + '"');
  const n0 = await ev(page, () => window.__uu.UI.s.b.length);
  await page.click('.dcard.sel .dc-go'); await settle(page, 900);
  ok(await ev(page, n => window.__uu.UI.s.b.length === n + 1 && window.__uu.UI.s.b.some(b => b.k === 'gunes'), n0), 'Önerilen yere kur → Güneş Paneli kuruldu');
  ok(await ev(page, () => ![...document.querySelectorAll('.toast')].some(t => /kuruluyor/i.test(t.textContent))), 'geri-g: kurulunca "… kuruluyor" bildirimi YOK (yapı zaten ekranda)');
  ok(await tutTo(page, 'oksijen'), 'eğitim: elektrik → hava makinesi');
  ok(await ev(page, () => window.__uu.UI.placing === 'oksijen'), 'sonraki öneri kendiliğinden seçildi (oksijen)');
  await shot(page, '05-insa-oksijen');

  const why = await ev(page, () => { const u = window.__uu, s = u.UI.s; for (let y = 0; y < 15; y++) for (let x = 0; x < 24; x++) if (s.b.some(b => b.x === x && b.y === y)) { const ok = u.placeAt({ tx: x, ty: y }); return ok ? 'KURULDU' : [...document.querySelectorAll('.toast')].map(t => t.textContent).pop(); } return ''; });
  ok(why && why !== 'KURULDU' && !/^w_/.test(why), 'dolu kareye kurulamaz, neden: "' + why + '"');
  await page.click('.dcard.sel .dc-go'); await settle(page, 900);
  ok(await tutTo(page, 'choice'), 'eğitim: malzeme sınırlı seçimi');
  await page.click('.dcard[data-v="sera"]'); await settle(page, 300);
  const undoOk = await ev(page, () => window.__uu.feats().undoBuild);
  await page.click('.dcard.sel .dc-go'); await settle(page, 900);
  ok(undoOk && await ev(page, () => !document.getElementById('undoBtn').hidden), '"Geri al" düğmesi görünür');
  const ub = await ev(page, () => ({ n: window.__uu.UI.s.b.length, m: window.__uu.UI.s.res.malzeme }));
  await page.click('#undoBtn'); await settle(page, 400);
  const ua = await ev(page, () => ({ n: window.__uu.UI.s.b.length, m: window.__uu.UI.s.res.malzeme }));
  ok(ua.n === ub.n - 1 && ua.m > ub.m, `Geri al: yapı kalktı, malzeme geri geldi (${ub.m} → ${ua.m})`);
  await page.click('.dcard[data-v="sera"]'); await settle(page, 300); await page.click('.dcard.sel .dc-go'); await settle(page, 900);
  await shot(page, '06-insa-secim');
  ok(await tutTo(page, 'time'), 'eğitim: ▶ ile zamanı başlat');
  await shot(page, '07-egitim-baslat');
  await page.click('[data-act="tutPlay"]'); await settle(page, 900);
  ok(await ev(page, () => !window.__uu.UI.plan && window.__uu.UI.mode === 'drone'), 'inşa görünümünden önceki kameraya dönüldü');
  for (const id of ['night', 'ship', 'radio']) { ok(await tutTo(page, id), 'eğitim adımı: ' + id); await shot(page, '08-egitim-' + id); if (id === 'radio') { await page.click('#menuBtn'); await settle(page, 300); await page.click('#radioBtn'); await page.waitForTimeout(300); await shot(page, '09-telsiz-kaydi'); } else await page.click('[data-act="tutGot"]'); }
  ok(await tutTo(page, null), 'eğitim bitti');
  await settle(page, 600); await shot(page, '10-egitim-ozet');
  ok(await ev(page, () => window.__uu.UI.modal === 'tutsum' && window.__uu.UI.speed === 1), 'özet kartı; hız 1× (2×\'e geçirilmedi)');
  await page.click('[data-act="tutSumGo"]'); await settle(page, 1200);
  ok(await clock(page) > tA, 'eğitimden sonra zaman akıyor');
  ok(await ev(page, () => !/∞/.test(document.getElementById('gauges').textContent)), 'halkalarda ∞ işareti yok (sözcük: yeterli)');


  ok(await ev(page, () => window.__uu.UI.clickWalk && window.__uu.S3.mode === 'drone'), 'Kâşif kuşbakışında tıkla-yürü açık');
  const spotAt = (kind) => ev(page, kind => { const u = window.__uu, s = u.UI.s, S = u.S3, P = S.player;
    const hit = (wx, wy, wz) => { const q = S.project(wx, wy, wz); if (q.behind || q.sx < 80 || q.sy < 130 || q.sx > innerWidth - 80 || q.sy > innerHeight - 200) return null; const el = document.elementFromPoint(q.sx, q.sy); return el && el.id === 'c3' ? q : null; };
    if (kind === 'bina') { for (const b of s.b) { if (b.k !== 'hub') continue; const wx = b.x * 8 + 4, wz = b.y * 8 + 4, q = hit(wx, S.hAt(wx, wz) + 1.5, wz); if (q) return { x: q.sx, y: q.sy, id: b.id }; } return null; }
    for (let r = 2; r <= 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const x = P.tx + dx, y = P.ty + dy; if (x < 0 || y < 0 || x >= 24 || y >= 15 || Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      if (s.map.k[y * 24 + x] !== '.' || !s.map.seen[y * 24 + x] || s.b.some(b => Math.abs(b.x - x) <= 1 && Math.abs(b.y - y) <= 1)) continue;
      const wx = x * 8 + 4, wz = y * 8 + 4, q = hit(wx, S.hAt(wx, wz), wz); if (q) return { x: q.sx, y: q.sy, wx, wz, d0: Math.hypot(P.x - wx, P.z - wz) };
    } return null; }, kind);
  const walkT = await spotAt('zemin');
  if (!walkT) ok(false, 'tıkla-yürü: tıklanacak boş zemin bulunamadı');
  else {
    await page.mouse.move(walkT.x, walkT.y); await page.waitForTimeout(300); await page.mouse.click(walkT.x, walkT.y);
    await page.waitForFunction(t => { const P = window.__uu.S3.player; return Math.hypot(P.x - t.wx, P.z - t.wz) < t.d0 - 4; }, walkT, { timeout: 45000 }).catch(() => {});
    const d1 = await ev(page, t => { const P = window.__uu.S3.player; return Math.hypot(P.x - t.wx, P.z - t.wz); }, walkT);
    ok(d1 < walkT.d0 - 4, `tıkla-yürü: boş zemine tıklayınca astronot yürüdü (${Math.round(walkT.d0)} m → ${Math.round(d1)} m)`);
  }
  await page.waitForTimeout(800);
  await ev(page, () => { const m = window.__uuMods && window.__uuMods.ISKART; if (m) m.close(); const oc = document.getElementById('ogCard'); if (oc && !oc.hidden) oc.click(); const u = window.__uu; u.UI.chapUntil = 0; const ch = document.getElementById('chapter'); if (ch) ch.hidden = true; }); await page.waitForTimeout(600);
  const binaT = await spotAt('bina');
  if (!binaT) ok(false, 'tıkla-yürü: tıklanacak yapı bulunamadı ' + JSON.stringify(await ev(page, () => { const u = window.__uu, s = u.UI.s, S = u.S3; return s.b.filter(b => b.k === 'hub').map(h => { const wx = h.x * 8 + 4, wz = h.y * 8 + 4, q = S.project(wx, S.hAt(wx, wz) + 1.5, wz), el = document.elementFromPoint(q.sx, q.sy); return { sx: Math.round(q.sx), sy: Math.round(q.sy), behind: q.behind, el: el ? el.id || el.className : null, mode: S.mode, P: [Math.round(S.player.x), Math.round(S.player.z)] }; }); })));
  else { await page.mouse.move(binaT.x, binaT.y); await page.waitForTimeout(300); await page.mouse.click(binaT.x, binaT.y); await settle(page, 600); ok(await ev(page, () => window.__uu.UI.modal === 'bcard'), 'tıkla-yürü açıkken yapıya tıklayınca yapı penceresi açılır'); await page.keyboard.press('Escape'); await settle(page, 300); }


  await ev(page, () => { const u = window.__uu; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); u.UI.s.pending.length = 0; u.openPda('gorev'); }); await settle(page, 400);
  const rwT = await ev(page, () => { const c = document.querySelector('#pdaBody .rwcard'); return c ? c.textContent.replace(/\s+/g, ' ').trim() : ''; });
  ok(/Sıradaki ödül/.test(rwT), 'Görev sekmesinde "Sıradaki ödül" kartı: ' + rwT.slice(0, 90));
  await shot(page, '10b-gorev-siradaki-odul');
  await page.click('#pdaBody .rwcard [data-act="wardrobe"]'); await settle(page, 600);

  ok(await page.waitForFunction(() => window.__uu.UI.modal === 'wardrobe' && window.__uu.pauseReason() === 'modal', null, { timeout: 15000 }).then(() => true, () => false), 'Görev kartından dolap açılır, zaman durur');
  await page.click('.wd-tabs [data-v="rover"]'); await settle(page, 400);
  const kesifDone = await ev(page, () => window.__uu.UI.s.done.kesif != null || !!window.__uu.prof().have.gz_sari);
  const lockT = await ev(page, () => { const e = document.querySelector('.sw.lock[data-id="gz_sari"]'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; });
  if (kesifDone) lap('(ilk tarama hedefi zaten bitmiş; kilit denemesi atlandı)'); else ok(/tara/i.test(lockT), 'kilitli karo neyle açılacağını düz sözle söylüyor: "' + lockT + '"');
  await shot(page, '10c-dolap-gezgin');
  await page.keyboard.press('Escape'); await settle(page, 300);
  ok(await ev(page, () => !window.__uu.UI.modal), 'Esc dolabı kapatır');
  if (!kesifDone) {
    await ev(page, () => { const u = window.__uu, s = u.UI.s; s.stat.scans = Math.max(1, s.stat.scans); s.done.kesif = s.t; u.ff(1); u.UI.s.pending.length = 0; u.refresh(true); }); await settle(page, 600);
    const unl = await ev(page, () => ({ toast: [...document.querySelectorAll('.toast')].map(t => t.textContent).filter(t => /Yeni renk/.test(t)), dot: window.__uu.UI.rwDot, have: !!window.__uu.prof().have.gz_sari, modal: window.__uu.UI.modal }));
    ok(unl.have && !unl.toast.length && unl.dot > 0 && !unl.modal, 'kural sağlanınca açıldı: geri-g: bildirim yok, yalnız Görev sekmesinde nokta, pencere yok ' + JSON.stringify(unl));
    await ev(page, () => window.__uu.openWardrobe('rover')); await settle(page, 400);
    ok(await ev(page, () => !!document.querySelector('button.sw[data-v="gz_sari"]') && !document.querySelector('.sw.lock[data-id="gz_sari"]')), 'açılan karo artık seçilebilir');
    await page.click('button.sw[data-v="gz_sari"]'); await settle(page, 300);
    ok(await ev(page, () => window.__uu.look().rover === 'gz_sari' && window.__uu.prof().look.rover === 'gz_sari'), 'seçilen gezgin rengi kayıtta ve profilde');
    await ev(page, () => window.__uu.ACT.wdClose()); await settle(page, 300);
  }
  const fu = await ev(page, () => { const u = window.__uu, n = u.forceUnlock('uz_kozmik'); return { n, dot: u.UI.rwDot, toast: [...document.querySelectorAll('.toast')].some(t => /Kozmik/.test(t.textContent)), modal: u.UI.modal }; });
  ok(fu.n === 1 && fu.dot > 0 && !fu.toast && !fu.modal, 'forceUnlock → geri-g: "Yeni renk" bildirimi yok, yalnız nokta, oyun durmaz ' + JSON.stringify(fu));
  await page.keyboard.press('Escape'); await settle(page, 300);
  await page.click('#modalBox [data-act="wardrobe"]'); await settle(page, 400);
  ok(await ev(page, () => window.__uu.UI.modal === 'wardrobe'), 'duraklatma menüsünden "Astronotum ve araçlarım" → dolap');
  await page.keyboard.press('Escape'); await settle(page, 300);


  await ev(page, () => { const u = window.__uu; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); u.UI.s.pending.length = 0; }); await settle(page, 300);
  await page.keyboard.press('Escape'); await settle(page, 300);
  ok(await page.waitForFunction(() => window.__uu.UI.modal === 'menu' && window.__uu.pauseReason() === 'menu', null, { timeout: 15000 }).then(() => true, () => false), 'Esc → duraklatma menüsü');
  const tE = await clock(page); await page.waitForTimeout(2000);
  ok(await clock(page) === tE, 'menü açıkken saat 2 sn boyunca ilerlemedi');
  await shot(page, '11-duraklat-menusu');
  ok(await ev(page, () => !document.querySelector('#modalBox [data-act="save"]') && !!document.querySelector('#modalBox [data-act="quit"]')), 'menüde "Kaydet" yok, "Kaydedip çık" var');
  await page.keyboard.press('Escape'); await page.waitForTimeout(2000);
  ok(await ev(page, () => !window.__uu.UI.modal) && await clock(page) > tE, 'Esc yine → oyuna dönüldü, saat akıyor');

  await ev(page, () => { const u = window.__uu; if (u.UI.mode !== 'walk') u.toggleView(); });
  await settle(page, 500);
  await ev(page, () => { const u = window.__uu; u.UI.selfT = 0; u.onLock(true); u.onLock(false, 'user'); });
  ok(await ev(page, () => window.__uu.UI.modal === 'menu'), "('lock', false, 'user') → duraklatma menüsü");
  await page.waitForTimeout(500); await page.keyboard.press('Escape'); await settle(page, 300);
  await ev(page, () => { const u = window.__uu; u.onLock(true); u.UI.selfT = performance.now(); u.onLock(false); });
  ok(await ev(page, () => !window.__uu.UI.modal), 'oyunun kendi kilit bırakması menü açmaz');
  await ev(page, () => { const u = window.__uu; u.onLock(true); u.UI.selfT = 0; u.onLock(false); });
  ok(await ev(page, () => window.__uu.UI.modal === 'menu'), 'neden bilgisi yokken (eski sahne) kullanıcı bırakması menüyü açar');
  await page.waitForTimeout(500); await page.keyboard.press('Escape'); await settle(page, 300);
  await ev(page, () => window.__uu.toggleView()); await settle(page, 300);


  const LONG = 'Ufuk-1, burası Görev Kontrol. Güneş birkaç gün sonra ufkun altına inecek ve uzun gece başlayacak. Paneller o zaman hiç elektrik üretmez. Bataryaları şimdiden doldur, gereksiz yapıları kapatmayı düşün ve serayı sıcak tut, yoksa bitkiler donar.';
  await ev(page, txt => { const u = window.__uu, s = u.UI.s; u.UI.holdS = 0; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); s.pending.length = 0; s.radio.push({ n: ++s.radioN, t: s.t, from: 'mc', beat: 'test', title: { tr: 'Gece yaklaşıyor', en: 'Night is coming' }, text: { tr: txt, en: txt }, c: 'warn' }); }, LONG);
  const unreadBefore = await ev(page, () => window.__uu.unread());
  await page.waitForFunction(() => window.__uu.subState().text, null, { timeout: 30000 }).catch(() => {});
  await settle(page, 300);
  const s1 = await ev(page, () => window.__uu.subState());
  ok(s1.parts >= 2, `uzun mesaj ${s1.parts} parçaya bölündü (≤ ~12 kelime): "${s1.text}"`);
  const w1 = (s1.text || '').split(/\s+/).filter(Boolean).length;
  ok(s1.text && w1 <= 12, 'altyazı parçası ≤ 12 kelime (' + w1 + ' kelime)');
  ok(s1.total >= Math.min(10000, 2500 + 800 * w1), `süre ${(s1.total / 1000).toFixed(1)} sn ≥ min(10 sn, 2,5 sn + 0,8 sn × ${w1} kelime)`);
  ok(unreadBefore >= 1, 'Telsiz düğmesinde okunmamış rozeti: ' + unreadBefore);
  ok(await ev(page, () => !document.getElementById('radioBadge').hidden), 'okunmamış rozeti görünür');
  await page.waitForFunction(() => window.__uu.pauseReason() === 'radio', null, { timeout: 15000 }).catch(() => {});
  ok(await ev(page, () => window.__uu.pauseReason() === 'radio'), 'Kâşif: hikâye satırı ekrandayken saat bekler');
  const fs1 = parseFloat(await ev(page, () => getComputedStyle(document.querySelector('#sub .s-text')).fontSize));
  ok(fs1 >= 24, 'altyazı yazısı ' + fs1 + ' px (≥ 24)');
  await shot(page, '12-altyazi');
  await page.mouse.move(60, 330);
  const l1 = (await ev(page, () => window.__uu.subState())).left; await page.waitForTimeout(2000);
  const l2 = (await ev(page, () => window.__uu.subState())).left;
  ok(l1 - l2 > 1000 && l1 - l2 < 3500, `süre gerçek zamanla akıyor (${Math.round(l1 - l2)} ms / 2 sn)`);
  await page.keyboard.press('Escape'); await settle(page, 200);
  const l3 = (await ev(page, () => window.__uu.subState())).left; await page.waitForTimeout(1500);
  const l4 = (await ev(page, () => window.__uu.subState())).left;
  ok(l3 === l4, 'duraklatma menüsü açıkken altyazı süresi donar');
  await page.keyboard.press('Escape'); await settle(page, 200);
  await page.keyboard.press('KeyP'); await settle(page, 200);
  const l5 = (await ev(page, () => window.__uu.subState())).left; await page.waitForTimeout(1200);
  ok((await ev(page, () => window.__uu.subState())).left === l5, 'P ile durdurunca altyazı süresi de donar');
  await page.keyboard.press('KeyP'); await settle(page, 200);
  const p0 = (await ev(page, () => window.__uu.subState())).part;
  await page.click('#sub .s-text'); await settle(page, 400);
  await page.waitForFunction(p => window.__uu.subState().part === p + 1, p0, { timeout: 15000 }).catch(() => {});
  ok((await ev(page, () => window.__uu.subState())).part === p0 + 1, 'altyazıya tıklayınca sonraki parça');
  for (let i = 0; i < 6; i++) { const st = await ev(page, () => window.__uu.subState()); if (!st.text) break; await page.keyboard.press('Enter'); await page.waitForTimeout(300); }

  { const st = await ev(page, () => window.__uu.subState()), un = await ev(page, () => window.__uu.unread()); ok(!st.text && un <= 6, `sonuna kadar okununca altyazı boş, okunmamış yalnız düşen hikâye satırları (${un})`); }
  await page.click('#menuBtn'); await settle(page, 400); await page.click('#radioBtn'); await settle(page, 500);
  ok(await ev(page, t => document.getElementById('pdaBody').textContent.includes(t.slice(0, 40)), LONG), 'mesaj Telsiz kaydında tam metniyle duruyor');
  await shot(page, '13-telsiz-kaydi-mesaj');

  const tabs = await ev(page, () => [...document.querySelectorAll('.ptab')].map(b => b.dataset.v));
  ok(tabs.length <= 5 && !tabs.includes('insa') && !tabs.includes('kayit'), 'tablet sekmeleri: ' + tabs.join(', '));
  for (const t of tabs) { await page.click(`.ptab[data-v="${t}"]`); await settle(page, 200); await shot(page, '14-tablet-' + t); }
  const ekipTxt = await ev(page, () => { document.querySelector('.ptab[data-v="ekip"]').click(); return document.getElementById('pdaBody').textContent; });
  ok(!/×1,|MSV|Kademe/.test(ekipTxt), 'Kâşif Ekip sekmesinde ×1,00 / MSV / Kademe yok');
  await page.keyboard.press('Escape'); await settle(page, 200);


  await ev(page, () => { const u = window.__uu, s = u.UI.s; s.decT = -999; u.UI.subQ.length = 0; if (u.UI.sub) u.subNext(); u.pushEvent(s, 'flare', { hit: 120 }); u.ff(0); });
  await settle(page, 1200);
  await page.waitForFunction(() => /^(call|radio)$/.test(window.__uu.pauseReason() || ''), null, { timeout: 15000 }).catch(() => {});
  ok(await ev(page, () => window.__uu.pauseReason() === 'call' || window.__uu.pauseReason() === 'radio'), 'Kâşif: acil çağrı yanıtlanmadan saat bekler');

  await page.waitForFunction(() => !!document.querySelector('.call.big .cbtn') || (() => { const b = document.getElementById('ikCard'); return !!b && !b.hidden && b.dataset.kind === 'atlas'; })(), null, { timeout: 8000 }).catch(() => {});
  const ans = await ev(page, () => { const b = document.getElementById('ikCard'); return { chip: !!document.querySelector('.call.big .cbtn'), card: !!b && !b.hidden && b.dataset.kind === 'atlas' && b.querySelectorAll('.ik-ch button').length >= 2 }; });
  ok(ans.chip || ans.card, 'çağrıda yanıt yüzeyi: büyük "Cevapla" düğmesi ya da açık ATLAS soru kartı ' + JSON.stringify(ans));
  await shot(page, '15-acil-cagri');

  if (ans.chip) { await page.click('.call .cbtn'); await settle(page, 500); }
  if (await ev(page, () => window.__uu.hasIskart())) {

    const ik = await ev(page, () => { const b = document.getElementById('ikCard'); return { vis: !!b && !b.hidden, kind: b && b.dataset.kind, n: b ? b.querySelectorAll('.ik-ch button').length : 0, modal: window.__uu.UI.modal, pv: document.querySelectorAll('#evChoices .pv').length }; });
    ok(ik.vis && ik.kind === 'atlas' && ik.n >= 2 && !ik.modal && ik.pv === 0, 'Cevapla → ATLAS soru kartı (pencere yok, önizleme çipi yok) ' + JSON.stringify(ik));
    await shot(page, '16-karar-onizleme');
    await page.click('#ikCard .ik-ch button'); await settle(page, 400); await shot(page, '16b-karar-sonuc');
    const ir = await ev(page, () => { const b = document.getElementById('ikCard'), r = b && b.querySelector('.ik-res'), re = b && b.querySelector('.ik-real'); const ch = b && b.querySelector('.src-chip'); return { res: r ? r.textContent : '', real: (re ? re.textContent : '') + (ch ? ' ' + ch.textContent : '') }; });
    ok(ir.res.length > 2 && /Kaynak/.test(ir.real), 'ATLAS kartında sonuç ve kaynaklı "gerçekte" satırı: ' + (ir.res + ' | ' + ir.real).slice(0, 120));
    await ev(page,() => { const m = window.__uuMods && window.__uuMods.ISKART; if (m) m.close(); });
  } else {
  ok(await ev(page, () => document.querySelectorAll('#evChoices .pv').length > 0), 'karar seçeneklerinin altında renkli bedel çipleri' + '');
  await shot(page, '16-karar-onizleme');

  const evStub = await ev(page, () => { if (window.__uu.feats3().real) return false; window.REAL = { ev: { flare: { tr: 'Uyarı gelince astronotlar en korunaklı yere geçer.', en: 'When a warning comes, astronauts move to the best-shielded place.', src: 'NASA (test)' } } }; return true; });
  await page.click('#evChoices .choice:not([disabled])'); await settle(page, 300); await shot(page, '16b-karar-sonuc');
  const rl = await ev(page, () => { const e = document.querySelector('#evResult .fact.real'); return e ? { t: e.textContent, h: e.getBoundingClientRect().height } : null; });
  ok(rl && rl.h > 0 && /Gerçekte/.test(rl.t) && (!evStub || /Kaynak:/.test(rl.t)), '"Gerçekte" satırı ve kaynağı karar sonucundan sonra görünür' + (evStub ? ' (sahte REAL)' : '') + ': ' + (rl ? rl.t.slice(0, 90) : 'yok'));
  if (evStub) await ev(page, () => { delete window.REAL; });
  await page.keyboard.press('Escape');
  }

  await ev(page, () => { const u = window.__uu, s = u.UI.s; s.shipAt = s.t + 1; u.ff(1); });
  await settle(page, 2500); await shot(page, '17-gemi-indi');
  if (await ev(page, () => window.__uu.UI.s.pending.some(p => p.type === 'cargo'))) {
    await page.click('.call.ship'); await settle(page, 300);
    await page.click('[data-act="cargoAuto"]'); await settle(page, 150); await shot(page, '18-kargo'); await page.click('[data-act="cargoGo"]'); await settle(page, 300);
  } else errors.push('kargo çağrısı gelmedi');

  await ev(page, () => { const u = window.__uu, b = u.UI.s.b.find(o => o.k !== 'hub'); if (b) { b.left = 0; u.modalBuilding(b.id); } });
  await settle(page, 300); await shot(page, '19-yapi-penceresi');
  ok(await ev(page, () => { const t = [...document.querySelectorAll('#modalBox button')].map(b => b.textContent.trim()); return t.some(x => /Durdur/.test(x)) && t.some(x => x === 'Tamam') && !t.some(x => x === 'Kapat'); }), 'yapı penceresinde "Durdur" ve "Tamam" (iki "Kapat" yok)');
  await page.keyboard.press('Escape');

  await ev(page, () => { const u = window.__uu, s = u.UI.s, target = (u.W().night.start + 1) * 24 + 2; s.pending.length = 0; u.ff(Math.max(1, target - s.t)); s.pending.length = 0; });
  await settle(page, 3000); await shot(page, '20-ay-kutup-gecesi');
  await page.keyboard.press('KeyB'); await settle(page, 600); await page.click('.gchip[data-v="guc"]').catch(() => {}); await settle(page, 300); await page.mouse.move(760, 330); await settle(page, 1200); await shot(page, '21-insa-gece');
  await page.keyboard.press('Escape'); await settle(page, 300);
  ok(await ev(page, () => !window.__uu.UI.plan), 'Esc inşa görünümünden çıkar');

  await page.keyboard.press('Escape'); await settle(page, 200);
  await page.click('#modalBox [data-act="how"]'); await settle(page, 150); await shot(page, '22-yardim');
  await page.click('#modalBox [data-act="closeModal"]'); await page.keyboard.press('Escape'); await settle(page, 150); await page.click('#modalBox [data-act="src"]'); await settle(page, 150); await shot(page, '23-kaynaklar');
  ok(await ev(page, () => /Claude Code/.test(document.getElementById('modalBox').textContent)), 'Veri kaynaklarında yapay zekâ beyanı');
  await page.click('#modalBox [data-act="closeModal"]');
  await ev(page, () => window.__uu.saveGame());
  const t1 = await ev(page, () => window.__uu.UI.s.t);
  await page.reload(); await settle(page, 900); await skipEg(page); await shot(page, '24-devam');

  await ev(page, () => { const k = 'ufuk-ussu-kayit-v3', sv = JSON.parse(localStorage.getItem(k)); delete sv.look; localStorage.setItem(k, JSON.stringify(sv)); });
  await page.click('[data-act="cont"]'); await settle(page, 1200);
  const t2 = await ev(page, () => window.__uu.UI.s && window.__uu.UI.s.t);
  ok(t1 === t2, `kaydet/devam (${t1} = ${t2})`);
  const oldLk = await ev(page, () => ({ modal: window.__uu.UI.modal, suit: window.__uu.look() && window.__uu.look().suit, def: window.__uu.defLook().suit }));
  ok(!oldLk.modal && oldLk.suit === oldLk.def, 'eski kayıt (s.look yok) varsayılan görünüşle sürer, yaratıcı açılmaz ' + JSON.stringify(oldLk));

  const lStub = await ev(page, () => { if (window.__uu.feats3().learnedList) return false; window.learnedList = () => [{ id: 'gece', t: { tr: 'Gece paneller durur. Batarya, gündüzün elektriğini geceye saklar.', en: 'Panels stop at night. Batteries keep daytime power for the night.' }, real: null }]; return true; });
  for (let i = 0; i < 30; i++) { const o = await ev(page, () => { window.__uu.ff(48); return !!window.__uu.UI.s.over; }); if (o) break; }
  await settle(page, 1200); await shot(page, '25-karne');
  const kc = await ev(page, () => { const w = document.querySelector('#modalBox .end-who'); return { patch: !!document.querySelector('#modalBox canvas.end-patch'), name: w ? w.textContent : '', learn: document.querySelectorAll('#modalBox .learned li').length, rw: !!document.querySelector('#modalBox .rwcard'), wd: !!document.querySelector('#modalBox .m-foot [data-act="wardrobe"]') }; });
  ok(kc.patch && /Ada/.test(kc.name), 'karnede oyuncunun adı ve arması: ' + kc.name);
  ok(kc.learn >= 1 && kc.learn <= 3, 'karnede "Bugün öğrendiklerin" ' + kc.learn + ' madde (1-3)' + (lStub ? ' (sahte learnedList)' : ''));
  ok(kc.rw && kc.wd, 'karnede "Sıradaki ödül" ve Dolap düğmesi');
  await page.click('#modalBox .m-foot [data-act="wardrobe"]'); await settle(page, 500);
  ok(await ev(page, () => window.__uu.UI.modal === 'wardrobe'), 'karneden dolap açılır'); await shot(page, '25c-dolap-karneden');
  await page.click('[data-act="wdClose"]'); await settle(page, 500);
  ok(await ev(page, () => window.__uu.UI.modal === 'end'), 'dolap kapanınca karneye dönülür');
  if (lStub) await ev(page, () => { delete window.learnedList; });
  await ev(page, () => document.getElementById('modalBox').scrollTo(0, 9999)); await settle(page, 150); await shot(page, '25b-karne-alt');
  await page.click('[data-act="endNew"]'); await settle(page, 300);

  await page.click('[data-act="start"]'); await settle(page, 1200);
  const pre = await ev(page, () => ({ modal: window.__uu.UI.modal, name: (document.getElementById('crName') || {}).value, on: !!document.querySelector('.sw.on[data-v="su_mavi"]') }));
  ok(pre.modal === 'creator' && pre.name === 'Ada' && pre.on, 'yeniden açılışta yaratıcı profilden dolu gelir ' + JSON.stringify(pre));
  await page.keyboard.press('Escape'); await settle(page, 600);
  ok(await ev(page, () => window.__uu.UI.modal !== 'creator' && window.__uu.UI.s.name === 'Ada' && window.__uu.look().suit === 'su_mavi'), 'Esc de başlatır, seçimler korunur');
  await ev(page, () => window.__uu.endTutorial(true)); await ev(page, () => window.__uu.ff(30));

  await ev(page, () => { const u = window.__uu, s = u.UI.s; s.decT = -999; if (u.pushEvent(s, 'sizinti')) { const p = s.pending.find(q => q.id === 'sizinti'); u.resolve(s, 0, p.pid); } });
  await ev(page, () => { const u = window.__uu, s = u.UI.s; s.over = { win: false, why: 'isyan', t: s.t }; u.UI.endShown = false; });
  await settle(page, 1500);
  if (await ev(page, () => !document.getElementById('skipBtn').hidden)) {
    const st0 = await ev(page, () => { const c = window.__uu.S3.scene; return c ? c.t : null; }); await page.waitForTimeout(3000); const st1 = await ev(page, () => { const c = window.__uu.S3.scene; return c ? c.t : null; });
    ok(st0 != null && st1 - st0 > 2.2 && st1 - st0 < 4, `isyan sahnesi gerçek zamanla akıyor (3 sn'de ${st1 != null && st0 != null ? (st1 - st0).toFixed(1) : '?'} sn)`);
    await shot(page, '26a-isyan-sahnesi'); await page.click('#skipBtn'); }
  await page.waitForFunction(() => window.__uu.UI.modal === 'end', null, { timeout: 25000 }).catch(() => {}); await settle(page, 800);
  const endTxt = await ev(page, () => document.getElementById('modalBox').textContent);
  ok(/kurabiye/.test(endTxt), 'isyan sonu: kapsül + kurabiye metni');
  ok(/Kararların/.test(endTxt) && await ev(page, () => document.querySelectorAll('.kchoices li').length > 0), 'karnede "Kararların" bölümü' + '');
  await shot(page, '26-karne-isyan');
  await ev(page, () => document.getElementById('modalBox').scrollTo(0, 9999)); await settle(page, 150); await shot(page, '26b-karne-isyan-alt');

  await page.click('[data-act="endNew"]'); await settle(page, 300);

  await page.click('[data-act="lang"]'); await page.mouse.move(1000, 300); await page.waitForTimeout(600); await shot(page, '27-title-en-mars');
  await ev(page, () => { const u = window.__uu; u.UI.set.tut = 0; });
  const raw = async where => { const keys = await ev(page, () => Object.keys(window.__uu.STR)); const txt = await ev(page, () => document.body.innerText); const hit = keys.filter(k => /_/.test(k) && new RegExp('(^|\\s)' + k + '(\\s|$)').test(txt)); ok(!hit.length, 'EN ' + where + ': ekranda ham STR anahtarı yok' + (hit.length ? ' (' + hit.join(', ') + ')' : '')); };
  await page.click('[data-act="start"][data-v="mars"]'); await settle(page, 1200);
  ok(await ev(page, () => window.__uu.UI.modal === 'creator' && /Get your astronaut ready/.test(document.getElementById('modalBox').textContent)), 'EN: yaratıcı İngilizce');
  await raw('creator'); await shot(page, '27b-creator-en');
  await crPass(page); await ensureTut(page);
  ok(await ev(page, () => window.__uu.UI.mode === 'walk' && window.__uu.tut().id === 'look'), 'Mühendis (masaüstü) yürüyüşle başlar, eğitim bakmakla başlar');
  await ev(page, () => window.__uu.endTutorial(true)); await page.click('[data-act="tutSumGo"]').catch(() => {});
  await ev(page, () => window.__uu.ff(5)); await settle(page, 2500); await shot(page, '28-mars-gunduz-en');
  await raw('HUD');
  await page.keyboard.press('Tab'); await settle(page, 300);
  for (const t of await ev(page, () => [...document.querySelectorAll('.ptab')].map(b => b.dataset.v))) { await page.click(`.ptab[data-v="${t}"]`); await settle(page, 150); await raw('tablet ' + t); }
  await page.keyboard.press('Escape'); await page.keyboard.press('KeyB'); await settle(page, 600); await raw('build view'); await shot(page, '29-build-en');
  await page.keyboard.press('Escape');
  await ev(page, () => { const u = window.__uu, s = u.UI.s; s.storm = { from: s.t, until: s.t + 40 }; s.stormWarned = true; u.ff(1); });
  await settle(page, 3000); await shot(page, '30-mars-firtina');
  await page.context().close();
}


if (want('mobil')) {
  const page = await open(844, 390, true);
  await shot(page, '31-mobil-baslik');
  await page.click('[data-act="start"]'); await settle(page, 1500);
  const crm = await ev(page, () => { const g = document.getElementById('crGo').getBoundingClientRect(), b = document.getElementById('modalBox').getBoundingClientRect(); return { gt: Math.round(g.top), gb: Math.round(g.bottom), br: Math.round(b.right), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }; });
  ok(crm.gt >= 0 && crm.gb <= 390 && crm.br <= 845 && crm.sw <= crm.cw, '844×390 yaratıcı: "Başla" kaydırmadan görünür, yatay taşma yok ' + JSON.stringify(crm));
  await ev(page, () => { const s = document.querySelector('.cr-scroll'); s.scrollTop = s.scrollHeight; }); await settle(page, 200);
  ok(await ev(page, () => { const g = document.getElementById('crGo').getBoundingClientRect(); return g.bottom <= 390 && g.top >= 0; }), '844×390: panel kaydırılınca da "Başla" altta yapışık');
  await shot(page, '31b-mobil-yaratici');
  await page.tap('#crGo'); await settle(page, 1200); await ensureTut(page);
  ok(await ev(page, () => !window.__uu.UI.modal && !!window.__uu.tut()), 'tek dokunuşla "Başla" → eğitim başladı');
  await shot(page, '32-mobil-egitim');
  const boxes = async () => ev(page, () => { const r = id => { const e = document.getElementById(id); if (!e || e.hidden || getComputedStyle(e).display === 'none') return null; const b = e.getBoundingClientRect(); return b.width && b.height ? { x: b.left, y: b.top, r: b.right, b: b.bottom, id } : null; }; return ['hudTL', 'hudTR', 'gauges', 'hudBR', 'sub', 'drawer', 'objective', 'planBar', 'calls'].map(r).filter(Boolean); });
  const overlap = (list, pairs) => { const bad = []; for (const [a, b] of pairs) { const A = list.find(x => x.id === a), B = list.find(x => x.id === b); if (A && B && A.x < B.r - 1 && B.x < A.r - 1 && A.y < B.b - 1 && B.y < A.b - 1) bad.push(a + '×' + b); } return bad; };
  const noOv = async where => { const ov = await ev(page, () => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })); ok(ov.sw <= ov.cw, `844×390 ${where}: yatay taşma yok (${ov.sw}/${ov.cw})`); };
  await ev(page, () => window.__uu.endTutorial(true)); await page.click('[data-act="tutSumGo"]').catch(() => {}); await settle(page, 300);
  await ev(page, () => { const u = window.__uu, s = u.UI.s; u.ff(4); u.queueSub({ from: 'mc', text: { tr: 'Merhaba Ufuk-1! Önce elektrik, sonra hava. Kur düğmesine dokun.', en: 'Hello Ufuk-1!' }, c: 'info', local: true }); });
  await settle(page, 2000); await shot(page, '33-mobil-hud');
  let bx = await boxes();
  const P = [['hudTL', 'hudTR'], ['gauges', 'sub'], ['gauges', 'hudBR'], ['sub', 'hudBR'], ['hudTL', 'sub'], ['hudTR', 'sub'], ['gauges', 'hudTL'], ['objective', 'sub'], ['objective', 'hudTR'], ['objective', 'hudTL']];
  const o1 = overlap(bx, P); ok(!o1.length, '844×390 HUD: kutular çakışmıyor' + (o1.length ? ' (' + o1.join(', ') + ')' : ''));
  await noOv('HUD');
  await page.tap('#acts [data-act="buildMenu"]'); await settle(page, 900); await shot(page, '34-mobil-insa');
  bx = await boxes();
  const o2 = overlap(bx, [['drawer', 'sub'], ['drawer', 'hudTL'], ['drawer', 'hudTR'], ['planBar', 'sub'], ['sub', 'hudTR'], ['sub', 'hudTL']]);
  ok(!o2.length, '844×390 inşa: çekmece ve altyazı çakışmıyor' + (o2.length ? ' (' + o2.join(', ') + ')' : ''));
  ok(await ev(page, () => document.getElementById('drawer').getBoundingClientRect().height <= 130), '844×390 çekmece tek sıra (' + await ev(page, () => Math.round(document.getElementById('drawer').getBoundingClientRect().height)) + ' px)');
  await noOv('inşa');

  const placed = await ev(page, () => { const u = window.__uu; u.pickB('gunes', true); const b = u.UI.best, n = u.UI.s.b.length; if (!b) return 'nobest'; u.UI.pend = { tx: b.x, ty: b.y }; return n; });
  await settle(page, 500); await shot(page, '35-mobil-buraya-kur');
  ok(placed !== 'nobest', 'dokunmatik: seçilen yapı için önerilen yer var'); if (placed !== 'nobest') { await page.tap('#planOk'); await settle(page, 500); ok(await ev(page, n => window.__uu.UI.s.b.length === n + 1, placed), 'dokunmatik: "Buraya kur" ile kuruldu'); }
  await page.tap('[data-act="planDone"]'); await settle(page, 400);
  await page.tap('#menuBtn'); await settle(page, 400); await shot(page, '36-mobil-tablet'); await noOv('tablet');
  await page.tap('.ptab[data-v="telsiz"]'); await settle(page, 300); await shot(page, '36b-mobil-telsiz');
  await page.tap('[data-act="pdaClose"]'); await settle(page, 200);
  await ev(page, () => { const u = window.__uu, s = u.UI.s; s.decT = -999; u.pushEvent(s, 'sizinti'); u.ff(0); }); await settle(page, 1200); await shot(page, '37-mobil-cagri');
  await ev(page, () => window.__uu.openCall()); await settle(page, 1500); await shot(page, '38-mobil-karar'); await noOv('karar');
  await ev(page, () => window.__uu.ACT.closeModal()); await ev(page, () => window.__uu.modalMenu()); await settle(page, 300); await shot(page, '39-mobil-menu');
  await ev(page, () => window.__uu.ACT.closeModal());
  await ev(page, () => window.__uu.openWardrobe('arma')); await settle(page, 600); await shot(page, '39c-mobil-dolap'); await noOv('dolap');
  ok(await ev(page, () => { const b = document.getElementById('modalBox').getBoundingClientRect(); return b.right <= 845 && b.bottom <= 391; }), '844×390 dolap paneli ekranda');
  await ev(page, () => window.__uu.ACT.wdClose());
  await ev(page, () => { const u = window.__uu, s = u.UI.s; s.over = { win: false, why: 'isyan', t: s.t }; u.UI.endShown = false; }); await settle(page, 1200);
  if (await ev(page, () => !document.getElementById('skipBtn').hidden)) { await shot(page, '39b-mobil-isyan-sahnesi'); await page.tap('#skipBtn'); }
  await page.waitForFunction(() => window.__uu.UI.modal === 'end', null, { timeout: 25000 }).catch(() => {}); await settle(page, 800); await shot(page, '40-mobil-karne'); await noOv('karne');
  await page.context().close();

  const p2 = await open(400, 800, true);
  await p2.click('[data-act="start"]'); await settle(p2, 1500); await crPass(p2);
  await ev(p2, () => window.__uu.endTutorial(true)); await p2.click('[data-act="tutSumGo"]').catch(() => {});
  await ev(p2, () => { const s = window.__uu.UI.s; s.res.bilim = 999; window.__uu.ff(80); });
  await p2.click('#menuBtn'); await settle(p2, 300); await shot(p2, '41-dikey-tablet');
  const tw = await ev(p2, () => { const t = document.querySelector('.pda-tabs'); return { sw: t.scrollWidth, cw: t.clientWidth, n: t.children.length }; });
  ok(tw.sw <= tw.cw + 1, `400 px: ${tw.n} tablet sekmesi kaydırmadan sığıyor (${tw.sw}/${tw.cw})`);
  await p2.context().close();
}

if (want('depo')) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1, locale: 'tr-TR' });
  await ctx.addInitScript(() => { try { Object.defineProperty(window, 'localStorage', { get() { throw new Error('depo kapalı'); }, configurable: true }); } catch (e) {   } });
  const page = await ctx.newPage(), pe = [];
  page.on('pageerror', e => pe.push(e.message));
  await page.goto(url); await page.waitForTimeout(1500); await skipEg(page);
  await page.click('[data-act="start"]'); await settle(page, 1500);
  const c1 = await ev(page, () => window.__uu.UI.modal);
  await page.fill('#crName', 'Deniz').catch(() => {}); await page.click('#crGo').catch(() => {}); await settle(page, 900);
  const c2 = await ev(page, () => ({ modal: window.__uu.UI.modal, name: window.__uu.UI.s && window.__uu.UI.s.name, tut: !!window.__uu.tut() }));
  ok(c1 === 'creator' && c2.modal !== 'creator' && c2.name === 'Deniz' && !pe.length, 'yerel depo hata verse de yaratıcı ve oyun çalışır ' + JSON.stringify(c2) + (pe.length ? ' ' + pe.join(' | ') : ''));
  await ctx.close();
}

if (want('tara')) {
  const page = await open(1366, 768);
  await page.click('[data-act="start"][data-v="ay"]'); await settle(page, 1500); await crPass(page, 'Ece');
  await ev(page, () => { const u = window.__uu, s = u.UI.s; u.endTutorial(true); for (const id of ['guc', 'o2', 'su', 'sera', 'pil', 'maden', 'kalkan']) s.done[id] = s.done[id] || 1; s.stage = 2; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); s.pending.length = 0; u.refresh(true); });
  await settle(page, 900);
  const kt = await ev(page, () => window.__uu.kesifTarget());
  ok(!!kt, '"Bilinmeyene" sıradayken taranacak alan seçili: ' + JSON.stringify(kt && { x: kt.x, y: kt.y }));
  const mk = await ev(page, () => [...document.querySelectorAll('#markers .mk.tut')].filter(m => !m.hidden).map(m => m.textContent.trim()));
  ok(mk.some(t => /Buraya tıkla|İncele düğmesine bas/.test(t)), 'alanın üstünde "Buraya tıkla" ya da (menzildeyse) "İncele düğmesine bas" işareti: ' + JSON.stringify(mk));

  const obj = await ev(page, () => (document.querySelector('#objective .o-msg') || {}).textContent || '');
  const gw = await ev(page, () => { const g = window.__uu.goal(); return g ? (g.why || '') : ''; });
  ok(obj.split(/\s+/).filter(Boolean).length <= 5 && /İncele/.test(gw), 'hedef satırı kısa ("' + obj + '"), dokununca söylenen neden düğmenin adını içeriyor: "' + gw.slice(0, 120) + '"');

  const sp = await ev(page, t => { const S3 = window.__uu.S3, w = t.w; const p = S3.project(w.x, S3.hAt(w.x, w.z), w.z); return p && !p.behind ? { x: p.sx, y: p.sy } : null; }, kt);
  if (sp) { await page.mouse.move(sp.x, sp.y); await page.waitForTimeout(150); await page.mouse.click(sp.x, sp.y); }
  await page.waitForFunction(() => { const u = window.__uu, t = u.kesifTarget(); if (!t) return true; const P = u.S3.player; return Math.hypot(P.x - t.w.x, P.z - t.w.z) < 12; }, null, { timeout: 30000 }).catch(() => {});
  await page.mouse.move(sp ? sp.x : 683, sp ? sp.y : 384); await settle(page, 500);
  const hl = await page.waitForFunction(() => { const e = document.getElementById('ctxAct'); return !!e && !e.hidden && e.dataset.t === 'scan'; }, null, { timeout: 5000 }).then(() => true, () => false);
  ok(hl, 'astronot alana varınca bağlam düğmesi "İncele" oluyor (#ctxAct)');

  const b = await (await page.$('#ctxAct')).boundingBox();
  if (b) await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else { lap('(#ctxAct gizli: ' + JSON.stringify(await ev(page, () => { const u = window.__uu, t = u.kesifTarget(), P = u.S3.player; return { ctx: u.ctx(), d: t ? Math.round(Math.hypot(P.x - t.w.x, P.z - t.w.z)) : null, modal: u.UI.modal }; })) + ')'); await page.keyboard.press('KeyF'); }
  await page.waitForFunction(() => window.__uu.UI.s.stat.scans >= 1, null, { timeout: 15000 }).catch(() => {});
  const sc = await ev(page, () => ({ scans: window.__uu.UI.s.stat.scans, done: !!window.__uu.UI.s.done.kesif }));
  ok(sc.scans >= 1, 'Kâşif: İncele tek tıkla taradı ' + JSON.stringify(sc));
  await shot(page, '42-tek-tik-tarama');

  if (await ev(page, () => window.__uu.hasIskart())) {

    await ev(page, () => { const u = window.__uu, s = u.UI.s, m = window.__uuMods.ISKART; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); s.pending.length = 0; m._reset(); s.decT = -999; u.pushEvent(s, 'toz', {}); u.ff(0); }); await settle(page, 1200);
    const wrongI = await ev(page, () => window.__uu.EVENTS.toz.ch.findIndex(c => !c.ok && !c.hide));
    const hadBtn = await page.$(`#ikCard button[data-ik="${wrongI}"]`);
    if (hadBtn) await hadBtn.click(); await settle(page, 500);
    const fl = await ev(page, () => [...document.querySelectorAll('.dfloat')].map(e => ({ k: e.dataset.k, t: e.textContent })));
    const res = await ev(page, () => { const r = document.querySelector('#ikCard .ik-res'); return r ? r.className + ' ' + r.textContent : ''; });
    ok(!!hadBtn && /no/.test(res) && fl.length > 0 && fl.some(x => x.k === 'su' && /^−/.test(x.t)), 'yanlış ATLAS yanıtı: kartta ✗ sonuç, Su halkasının yanında eksi: ' + JSON.stringify({ res: res.slice(0, 80), fl }));
    await shot(page, '47-karar-etkisi-hud');
    await ev(page, () => window.__uuMods.ISKART.close());
  } else {
  await ev(page, () => { const u = window.__uu, s = u.UI.s; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); s.decT = -999; u.pushEvent(s, 'flare', { hit: 120 }); u.ff(0); }); await settle(page, 1000);
  await ev(page, () => window.__uu.openCall()); await settle(page, 600);
  await page.click('#evChoices .choice:not([disabled])'); await settle(page, 300);
  const exp = await ev(page, () => [...document.querySelectorAll('#evChoices .choice.picked .pv')].map(e => e.textContent.trim()));
  await page.click('#evResult [data-act="closeModal"]'); await settle(page, 600);
  const fl = await ev(page, () => [...document.querySelectorAll('.dfloat')].map(e => ({ k: e.dataset.k, t: e.textContent })));
  ok(fl.length > 0 && fl.every(x => /^[+−]/.test(x.t)) && fl.every(x => exp.some(e => e.startsWith(x.t))), 'karar etkisi halkaların yanında, penceredeki sayılarla aynı: ' + JSON.stringify({ fl, exp }));
  await shot(page, '47-karar-etkisi-hud');
  }
  await ev(page, () => { const u = window.__uu, s = u.UI.s; s.fx.dustUntil = s.t + 48; u.refresh(true); }); await settle(page, 500);
  const ef = await ev(page, () => ({ ring: document.getElementById('g-guc').dataset.eff, chip: !!document.querySelector('#effects .eff .resb') }));
  ok(ef.ring === 'neg' && ef.chip, 'süren etki (tozlu paneller): şeritte Elektrik simgesi, Elektrik halkasında ▼ ' + JSON.stringify(ef));
  await ev(page, () => { const u = window.__uu, s = u.UI.s; s.fx.dustUntil = 0; s.fx.lockUntil = 0; u.refresh(true); });

  await ev(page, () => { const u = window.__uu; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); u.UI.s.pending.length = 0; if (u.UI.toastQ) u.UI.toastQ.length = 0; u.UI.toastGap = 0; document.querySelectorAll('.toast').forEach(t => t.remove()); }); await settle(page, 300);
  await page.click('#menuBtn'); await settle(page, 400);
  const wdb = await ev(page, () => { const e = document.getElementById('aWd'); if (!e) return null; const r = e.getBoundingClientRect(); return { w: r.width, h: r.height, t: e.textContent.trim() }; });
  ok(wdb && wdb.w > 0 && /Dolap/.test(wdb.t), 'Tablet\'te Dolap düğmesi: ' + JSON.stringify(wdb));
  await page.click('[data-act="pdaClose"]'); await settle(page, 300);
  await ev(page, () => { const m = window.__uuMods && window.__uuMods.ISKART; if (m) m.close(); });

  const fu2 = await ev(page, () => window.__uu.forceUnlock('gz_mavi')); await settle(page, 600);
  const rw = await ev(page, () => ({ toast: !!document.querySelector('.toast.rw'), badge: !document.getElementById('wdBadge').hidden }));
  ok(fu2 === 1 && !rw.toast && rw.badge && await ev(page, () => !document.getElementById('pdaBadge').hidden), 'yeni açılım: bildirim yok, Dolap rozeti ve Tablet noktası ' + JSON.stringify(rw));
  await ev(page, () => window.__uu.ACT.wearNew({ dataset: { v: 'gz_mavi' }, closest: () => null })); await settle(page, 400);
  ok(await ev(page, () => window.__uu.look().rover === 'gz_mavi' && window.__uu.prof().look.rover === 'gz_mavi'), '"Giy" yeni rengi giydirdi (kayıt ve profil)');
  ok(await ev(page, () => window.__uu.forceUnlock('uz_kozmik')) === 1, 'ikinci açılım (Kozmik)');
  await settle(page, 600);
  ok(await ev(page, () => !document.querySelector('.toast.rw') && !document.getElementById('pdaBadge').hidden), 'ikinci açılım da yalnız rozet');
  await page.click('#menuBtn'); await settle(page, 400); await page.click('#aWd'); await settle(page, 600);
  ok(await ev(page, () => window.__uu.UI.modal === 'wardrobe'), 'Tablet\'teki Dolap düğmesi dolabı açar');
  await page.click('.wd-tabs [data-v="craft"]'); await settle(page, 400);
  const lk = await page.$('.sw.lock'); if (lk) { await lk.click(); await settle(page, 300); }
  const tip = await ev(page, () => [...document.querySelectorAll('.toast')].map(t => t.textContent).find(t => /kilitli/.test(t)) || '');
  ok(!!lk && /Açmak için/.test(tip), 'kilitli karoya dokununca nasıl açılacağı yazıyor: "' + tip + '"');
  await shot(page, '46-dolap-kilit-ipucu');
  await page.context().close();
}

if (want('mobil3')) {
  const page = await open(844, 390, true);
  await page.tap('[data-act="start"][data-v="ay"]'); await settle(page, 1500); await crPass(page); await ensureTut(page);
  await ev(page, () => { const u = window.__uu; if (u.tut() && u.tut().id === 'air') u.tutGo(u.tut().step + 1); });
  await page.waitForFunction(() => { const t = window.__uu.tut(); return t && t.id === 'build'; }, null, { timeout: 20000 }).catch(() => {});
  const rects = () => ev(page, () => {
    const r = el => { if (!el || el.hidden || getComputedStyle(el).display === 'none' || getComputedStyle(el).visibility === 'hidden') return null; const b = el.getBoundingClientRect(); return b.width && b.height ? { x: b.left, y: b.top, r: b.right, b: b.bottom } : null; };
    const u = window.__uu, out = {};
    for (const id of ['objective', 'planBar', 'planLabel', 'planOk', 'undoBtn', 'drawer', 'sub', 'calls', 'effects', 'banner']) out[id] = r(document.getElementById(id));
    out.toasts = [...document.querySelectorAll('#toasts .toast')].map(r).filter(Boolean);
    out.bells = [...document.querySelectorAll('#hudTC .bell')].map(r).filter(Boolean);
    const b = u.UI.best; if (b && u.UI.plan) { const w = u.W ? null : null; }
    return out;
  });
  const starPt = () => ev(page, () => { const u = window.__uu, b = u.UI.best; if (!b || !u.UI.plan) return null; const T = 8, x = (b.x + 0.5) * T, z = (b.y + 0.5) * T; const p = u.S3.project(x, u.S3.hAt(x, z) + 1, z); return p && !p.behind ? { x: p.sx - 18, y: p.sy - 30, r: p.sx + 18, b: p.sy + 6 } : null; });
  const hit = (A, B) => !!A && !!B && A.x < B.r - 1 && B.x < A.r - 1 && A.y < B.b - 1 && B.y < A.b - 1;
  await page.tap('#acts [data-act="buildMenu"]'); await settle(page, 900);
  await ev(page, () => window.__uu.pickB('gunes', true)); await settle(page, 1500);
  let R = await rects(), st = await starPt();
  await shot(page, '43-mobil-insa-yildiz');
  ok(st && !hit(st, R.objective) && !hit(st, R.planBar) && !hit(st, R.planLabel) && !hit(st, R.drawer), '844×390 inşa: yıldız eğitim şeridi, üst çubuk, etiket ve çekmecenin altında kalmıyor ' + JSON.stringify({ st, o: R.objective, p: R.planBar, l: R.planLabel }));

  await ev(page, () => { const u = window.__uu, b = u.UI.best; u.UI.pend = { tx: b.x, ty: b.y }; }); await settle(page, 400);
  await page.tap('#planOk'); await settle(page, 700);
  R = await rects(); await shot(page, '44-mobil-kuruldu');
  const tb = R.toasts.filter(t => [R.planBar, R.objective, R.drawer, R.planOk, R.undoBtn].some(x => hit(t, x)));
  const ogOn = await ev(page, () => { const c = document.getElementById('ogCard'); return !!(c && !c.hidden); });
  ok((R.toasts.length > 0 || ogOn) && !tb.length, '844×390 inşa: bildirim çubuklara ve düğmelere binmiyor ' + JSON.stringify({ n: R.toasts.length, bad: tb.length, t: R.toasts, pb: R.planBar, o: R.objective, ok: R.planOk, u: R.undoBtn }));
  await page.tap('[data-act="planDone"]').catch(() => {}); await settle(page, 400);

  await ev(page, () => { const u = window.__uu, s = u.UI.s; u.endTutorial(true); s.decT = -999; u.pushEvent(s, 'sizinti'); u.ff(0); u.queueSub({ from: 'mc', text: { tr: 'Ufuk-1, ben Deniz. İnişiniz kusursuzdu!', en: 'Hi' }, c: 'info', local: true }); });
  await page.click('[data-act="tutSumGo"]').catch(() => {}); await settle(page, 1500);
  R = await rects(); await shot(page, '45-mobil-cagri-altyazi');
  const cb = [R.calls, ...R.bells, R.objective, R.effects, R.banner].filter(Boolean).filter(x => hit(x, R.sub));
  ok(R.sub && R.calls && !cb.length, '844×390: altyazı çağrı şeridinin, zilin ve hedef satırının altına girmiyor ' + JSON.stringify({ sub: R.sub, calls: R.calls, bad: cb.length }));
  await page.context().close();
}

const restMeasure = page => ev(page, () => {
  const hud = document.getElementById('hud'), sub = document.getElementById('sub'), pr = document.getElementById('prompt');
  const vis = e => { for (let x = e; x && x !== document.body; x = x.parentElement) { const cs = getComputedStyle(x); if (x.hidden || cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; } const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; };
  const og = document.getElementById('ogCard'), skip = e => sub.contains(e) || pr.contains(e) || (!!og && og.contains(e));
  const btns = [...hud.querySelectorAll('button, [role="button"]')].filter(e => !skip(e) && !e.classList.contains('ring') && vis(e)).map(e => e.id || e.className);
  const tw = document.createTreeWalker(hud, NodeFilter.SHOW_TEXT), toks = []; let n;
  while ((n = tw.nextNode())) { const el = n.parentElement; if (skip(el) || !vis(el)) continue; toks.push(...n.textContent.split(/\s+/).filter(Boolean)); }
  return { btns, words: toks.filter(t => /\p{L}/u.test(t)), nums: toks.filter(t => !/\p{L}/u.test(t) && /\d/.test(t)) };
});
const restPrep = page => ev(page, () => { const u = window.__uu; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); u.UI.s.pending.length = 0; u.UI.chapUntil = 0; const c = document.getElementById('chapter'); if (c) c.hidden = true; document.querySelectorAll('.toast').forEach(t => t.remove()); const sc = document.getElementById('scanCard'); if (sc) sc.hidden = true; u.refresh(true); });
const v4Stubs = page => ev(page, () => {
  const W = window; W.__uuMods = W.__uuMods || {}; W.__v4 = { started: 0, egTicks: 0, ikTicks: 0, asked: [], setGoal: [] };
  W.__uuMods.EGITIM = {
    needed: set => !(set && set.egitim),
    start(ctx) { W.__v4.started++; W.__v4.ctx = ctx; const u = W.__uu, ts = u.newGame(ctx.world, 'kasif', 7, ctx.name, { train: true }); ts.train = true; ts.look = ctx.look; ctx.enter(ts); },
    tick() { W.__v4.egTicks++; }, active: () => !!W.__v4.ctx,
    goal: () => (W.__v4.ctx ? { text: { tr: 'Paneli kur', en: 'Build the panel' }, sel: null, at: null, i: 0, n: 3 } : null),
    skip() { const c = W.__v4.ctx; W.__v4.ctx = null; if (c) c.finish(false); }, steps: [],
  };
  W.__uuMods.ISKART = { ask(p) { W.__v4.asked.push(p.id); return W.__v4.askOk !== false; }, showing: () => W.__v4.askOk !== false, tick() { W.__v4.ikTicks++; }, open: () => false, close() {} };
});
if (want('v4')) {
  const page = await open(1366, 768);
  if (!(await ev(page, () => window.__uu.UI.gl))) { ok(false, 'v4: sahne yok'); }
  else {
    const realEg = await ev(page, () => window.__uu.hasEgitim()), realIk = await ev(page, () => window.__uu.hasIskart());
    lap(`v4: gerçek EGITIM ${realEg ? 'var' : 'yok'}, gerçek ISKART ${realIk ? 'var' : 'yok'} (yoksa sahteler)`);

    await ev(page, () => window.__uu.egitimAtla(false));
    if (!realEg) {
      await v4Stubs(page);
      await page.click('[data-act="start"][data-v="ay"]'); await settle(page, 1500);
      await ev(page, () => { window.__uu.UI.s.__real = 'gercek'; });
      await crPass(page, 'Ada');
      const k2 = await ev(page, () => { const u = window.__uu; let sv = null; try { sv = localStorage.getItem('ufuk-ussu-kayit-v3'); } catch (e) {   } return { started: window.__v4.started, train: !!u.UI.train, sTrain: !!(u.UI.s && u.UI.s.train), real: !!(u.UI.realS && u.UI.realS.__real), save: u.saveGame(), sv, tut: !!u.tut(), modal: u.UI.modal }; });
      ok(k2.started === 1 && k2.train && k2.sTrain && k2.real && !k2.tut && !k2.modal, 'K2: ilk oyunda "Başla" → eğitim görevi (gerçek görev bellekte bekler, eski eğitim başlamaz) ' + JSON.stringify(k2));
      ok(k2.save === false && !k2.sv, 'K7: eğitim durumu kaydedilmiyor');
      await page.waitForTimeout(1500);
      const k1 = await ev(page, () => ({ eg: window.__v4.egTicks, ik: window.__v4.ikTicks, obj: (document.querySelector('#objective .o-msg') || {}).textContent }));
      ok(k1.eg > 0 && k1.ik > 0, 'K1: kare döngüsü EGITIM.tick ve ISKART.tick çağırıyor ' + JSON.stringify(k1));
      ok(k1.obj === 'Paneli kur', 'K4: eğitimde hedef satırı EGITIM.goal() metni: ' + k1.obj);
      await page.click('#menuBtn'); await settle(page, 300);
      ok(await ev(page, () => document.getElementById('trainBtn').hidden), 'eğitimin içinde "Eğitimi tekrar oyna" görünmüyor');
      await page.click('[data-act="pdaClose"]'); await settle(page, 200);
      await shot(page, 'v4-01-egitim-sahte');
      await ev(page, () => { const c = window.__v4.ctx; window.__v4.ctx = null; c.finish(true); }); await settle(page, 1200);

      ok(await ev(page, () => { const e = document.getElementById('egDone'); return !!e && !e.hidden && window.__uu.pauseReason() === 'egdone'; }), 'K10: finish(true) → "Eğitim bitti" ekranı, saat durur');
      await page.click('#egDoneGo'); await settle(page, 600);
      const k2b = await ev(page, () => { const u = window.__uu, s = u.UI.s; return { train: !!u.UI.train, real: s.__real, tag: !!(s.tags && s.tags['x:egitim'] != null), set: u.UI.set.egitim, sub: u.subState().text || '', q: u.UI.subQ.map(x => x.text).join(' ') }; });
      ok(!k2b.train && k2b.real === 'gercek' && k2b.tag && k2b.set === 1, 'K2: finish(true) → gerçek görev açıldı, x:egitim etiketi yazıldı, ayar kaydedildi ' + JSON.stringify(k2b));
      ok(!/Eğitim bitti/.test(k2b.sub + ' ' + k2b.q), 'v5: "Eğitim bitti" altyazısı tekrarlanmıyor (ekranda söylendi): ' + (k2b.sub + ' ' + k2b.q).slice(0, 100));

      await ev(page, () => window.__uu.ff(5)); await settle(page, 300);
      const tReal = await ev(page, () => window.__uu.UI.s.t);
      await page.click('#menuBtn'); await settle(page, 300);
      ok(await ev(page, () => { const b = document.getElementById('trainBtn'); return !!b && !b.hidden && b.getBoundingClientRect().width > 0; }), 'Tablet\'te "Eğitimi tekrar oyna" görünür');
      await page.click('#trainBtn'); await settle(page, 1200);
      const k3 = await ev(page, () => { const u = window.__uu; let sv = null; try { sv = JSON.parse(localStorage.getItem('ufuk-ussu-kayit-v3')); } catch (e) {   } return { started: window.__v4.started, train: !!u.UI.train, svT: sv && sv.t, svTrain: sv && sv.train }; });
      ok(k3.started === 2 && k3.train && k3.svT === tReal && !k3.svTrain, 'K3: tekrar oyna → önce gerçek görev kaydedildi, sonra eğitim ' + JSON.stringify(k3));
      await ev(page, () => window.__uu.ACT.cont && null);
      ok(await ev(page, () => { const s = window.__uu.loadSave(); return !!s && !s.train; }), 'K7: "Devam" eğitim durumunu yüklemez');
      await ev(page, () => window.__uu.UI.s && window.__uu.modalMenu()); await settle(page, 300);
      ok(await ev(page, () => !!document.querySelector('#modalBox [data-act="tutAgain"]')), 'duraklatma menüsünde de "Eğitimi tekrar oyna" var');
      await ev(page, () => window.__uu.ACT.closeModal()); await settle(page, 200);
      await ev(page, () => { const c = window.__v4.ctx; window.__v4.ctx = null; c.finish(false); }); await settle(page, 1200);
      ok(/Görevime dön/.test(await ev(page, () => (document.getElementById('egDoneGo') || {}).textContent || '')), 'K10: kayıtlı göreve dönülürken düğme "Görevime dön"');
      if (await ev(page, () => !!window.__uu.egDone())) { await page.click('#egDoneGo'); await settle(page, 400); }
      ok(await ev(page, t => !window.__uu.UI.train && window.__uu.UI.s.t === t && window.__uu.UI.s.__real === 'gercek', tReal), 'K3: eğitim bitince kayıtlı görev geri açıldı');
    } else lap('v4: gerçek EGITIM var; sahte K2/K3 denemesi atlandı (D\'nin egitim-tarayici.mjs testi)');
    await skipEg(page);

    if (realEg) { await page.click('[data-act="start"][data-v="ay"]'); await settle(page, 1500); await crPass(page); }
    await ev(page, () => { const u = window.__uu; if (u.tut()) u.endTutorial(true); if (u.UI.modal) u.ACT.closeModal(); });
    await restPrep(page); await page.mouse.move(1300, 300); await settle(page, 1500); await restPrep(page); await settle(page, 800);
    const r1 = await restMeasure(page);
    lap('dinlenme 1366×768: ' + JSON.stringify(r1));
    ok(r1.btns.length <= 6, `dinlenme: görünür düğme ${r1.btns.length} ≤ 6 (halkalar hariç) ${JSON.stringify(r1.btns)}`);
    ok(r1.words.length <= 12, `dinlenme: görünür kelime ${r1.words.length} ≤ 12 (altyazı hariç) ${JSON.stringify(r1.words)}`);
    ok(r1.nums.length <= 8, `dinlenme: görünür sayı ${r1.nums.length} ≤ 8 ${JSON.stringify(r1.nums)}`);
    await shot(page, 'v4-02-dinlenme-1366');
    const tb = await ev(page, () => { window.__uu.openPda('gorev'); const v = id => { const e = document.getElementById(id); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }; return ['r-malzeme', 'r-parca', 'r-bilim', 'r-ekip', 'r-moral', 'shipBox', 'radioBtn', 'aWd', 'aView', 'trainBtn'].concat(window.__uu.mod('HARITA') ? [] : ['mapBtn']).filter(id => !v(id)); });
    ok(!tb.length, 'Tablet açılınca taşınanlar orada (kaynak çipleri, kargo, telsiz kaydı, dolap, görünüm, harita, eğitim)' + (tb.length ? ' eksik: ' + tb.join(', ') : ''));
    await settle(page, 500); await shot(page, 'v4-03-tablet');
    await ev(page, () => window.__uu.closePda());

    const realCore = await ev(page, () => window.__uu.hasCore());
    if (realCore) {

      const gr = await ev(page, () => {
        const u = window.__uu, S = u.S3; window.__v4 = window.__v4 || {}; window.__v4.setGoal = [];
        const orig = S.setGoal; window.__v4.origSetGoal = orig || null;
        S.setGoal = p => { window.__v4.setGoal.push(p); if (orig) try { orig.call(S, p); } catch (e) {   } };
        u.UI.goalId = 'eski-hedef'; u.UI.setGoalK = '#'; u.renderObjective();
        const g = u.goal(), t = (document.querySelector('#objective .o-msg') || {}).textContent || '';
        return { n: document.querySelectorAll('#objective').length, t, at: g && g.at, why: g && g.why, c: document.getElementById('objective').dataset.c, calls: window.__v4.setGoal.slice() };
      });
      ok(gr.n === 1 && gr.t && gr.t.split(/\s+/).length <= 5, 'hedef satırı tek ve ≤ 5 kelime (gerçek currentGoal): ' + gr.t);
      ok(!gr.at || gr.calls.some(p => p && Math.abs(p.x - gr.at.x) < 0.01 && Math.abs(p.z - gr.at.z) < 0.01), 'hedefin karosu varsa S3.setGoal(wpos) çağrıldı ' + JSON.stringify({ at: gr.at, calls: gr.calls }));
      ok(/flip/.test(gr.c || ''), 'hedef değişince kısa "tamam" kıpırtısı ' + gr.c);
      await ev(page, () => { const u = window.__uu; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); });
      await page.click('#objective'); await settle(page, 900);
      const wt = await ev(page, () => (window.__uu.subState().text || '') + ' ' + window.__uu.UI.subQ.map(q => q.text).join(' '));
      ok(!gr.why || wt.trim().length > 3, 'hedefe dokununca "neden" altyazıda: ' + wt.slice(0, 80));
      await ev(page, () => { if (window.__v4.origSetGoal) window.__uu.S3.setGoal = window.__v4.origSetGoal; window.__uu.renderObjective(); });
    } else {
    const g1 = await ev(page, () => {
      const u = window.__uu, S = u.S3, s = u.UI.s; window.__uuMods = window.__uuMods || {};
      const orig = S.setGoal; window.__v4 = window.__v4 || {}; window.__v4.setGoal = [];
      S.setGoal = p => { window.__v4.setGoal.push(p); if (orig) try { orig.call(S, p); } catch (e) {   } };
      window.__v4.origSetGoal = orig || null;
      window.__uuMods.currentGoal = () => ({ id: 'g-test', k: { tr: 'Güneş paneli kur', en: 'Build a solar panel' }, why: { tr: 'Makineler elektrikle çalışır, önce elektrik.', en: 'Machines need power first.' }, act: 'build', bk: 'gunes', tx: 3, ty: 4, urgent: false });
      u.renderObjective();
      return { n: document.querySelectorAll('#objective').length, t: (document.querySelector('#objective .o-msg') || {}).textContent, calls: window.__v4.setGoal.slice() };
    });
    ok(g1.n === 1 && g1.t === 'Güneş paneli kur' && g1.t.split(/\s+/).length <= 5, 'hedef satırı tek ve ≤ 5 kelime: ' + g1.t);
    ok(g1.calls.length >= 1 && Math.abs(g1.calls[g1.calls.length - 1].x - (3 * 8 + 4)) < 0.01 && Math.abs(g1.calls[g1.calls.length - 1].z - (4 * 8 + 4)) < 0.01, 'currentGoal tx/ty verince S3.setGoal(wpos) çağrıldı ' + JSON.stringify(g1.calls));
    await ev(page, () => { const u = window.__uu; u.UI.subQ.length = 0; while (u.UI.sub) u.subNext(); });
    await page.click('#objective'); await settle(page, 900);
    ok(/elektrikle/.test(await ev(page, () => (window.__uu.subState().text || '') + window.__uu.UI.subQ.map(q => q.text).join(' '))), 'hedefe dokununca "neden" altyazıda');
    await ev(page, () => { window.__uuMods.currentGoal = () => ({ id: 'g-test2', k: { tr: 'Hava makinesi kur', en: 'Build an oxygen maker' }, why: null, act: 'build', bk: 'oksijen', tx: null, ty: null, urgent: false }); window.__uu.renderObjective(); });
    const g2 = await ev(page, () => ({ c: document.getElementById('objective').dataset.c, last: window.__v4.setGoal[window.__v4.setGoal.length - 1] }));
    ok(/flip/.test(g2.c || '') && g2.last === null, 'hedef değişince kısa "tamam" kıpırtısı; konumsuz hedefte S3.setGoal(null) ' + JSON.stringify(g2));
    await ev(page, () => { delete window.__uuMods.currentGoal; if (window.__v4.origSetGoal) window.__uu.S3.setGoal = window.__v4.origSetGoal; else delete window.__uu.S3.setGoal; window.__uu.renderObjective(); });
    }

    const LONG2 = 'Ufuk-1, burası Görev Kontrol. Güneş birkaç gün sonra ufkun altına inecek ve uzun gece başlayacak. Paneller o zaman hiç elektrik üretmez, bataryaları şimdiden doldur ve gereksiz yapıları kapat.';
    await restPrep(page);
    await ev(page, txt => { const W = window, u = W.__uu; W.__subLog = []; let last = null; u.queueSub({ from: 'mc', text: { tr: txt, en: txt }, c: 'info', local: true });
      W.__subIv = setInterval(() => { const st = u.subState(), k = st.text ? st.part + '|' + st.text : null; if (k !== last) { const now = performance.now(); if (last) W.__subLog[W.__subLog.length - 1].end = now; if (k) W.__subLog.push({ text: st.text, start: now, name: (document.querySelector('#sub .s-name') || {}).textContent || '', fs: parseFloat(getComputedStyle(document.querySelector('#sub .s-text')).fontSize) }); last = k; } }, 40); }, LONG2);
    await page.mouse.move(1300, 120);
    await page.waitForFunction(() => window.__subLog.length && !window.__uu.subState().text && !window.__uu.UI.subQ.length, null, { timeout: 120000 }).catch(() => {});
    await page.waitForTimeout(400);
    const sl = await ev(page, () => { clearInterval(window.__subIv); const L = window.__subLog; if (L.length && L[L.length - 1].end == null) L[L.length - 1].end = performance.now(); return L; });
    const bad = sl.filter(x => x.text.split(/\s+/).length > 12 || !(x.end - x.start >= Math.min(10000, 2500 + 800 * x.text.split(/\s+/).length) - 120));
    ok(sl.length >= 2 && !bad.length, `altyazı: ${sl.length} parça, her biri ≤ 12 kelime ve ≥ min(10, 2,5 + 0,8 × kelime) sn ekranda ` + JSON.stringify(sl.map(x => [x.text.split(/\s+/).length, Math.round((x.end - x.start) / 100) / 10])) + (bad.length ? ' düşen: ' + JSON.stringify(bad.map(x => x.text)) : ''));
    ok(sl.length && sl.every(x => x.fs >= 24 && x.name.trim()), 'altyazı yazısı ≥ 24 px ve konuşanın adı görünür: ' + (sl[0] ? sl[0].fs + ' px, ' + sl[0].name : ''));

    if (!realIk) {
      await v4Stubs(page); await skipEg(page);
      const k5 = await ev(page, () => { const u = window.__uu, s = u.UI.s; s.decT = -999; u.pushEvent(s, 'flare', { hit: 120 }); u.ff(0); const p = s.pending.find(q => q.id === 'flare'); if (!p) return null; u.openCall(p.pid); u.refresh(true); return { modal: u.UI.modal, asked: window.__v4.asked.slice(), strip: document.querySelectorAll('#calls .call').length }; });
      ok(k5 && !k5.modal && k5.asked.includes('flare') && k5.strip === 0, 'K5: ISKART.ask → true iken #modal açılmıyor ve çağrı şeritte gösterilmiyor ' + JSON.stringify(k5));
      const k5b = await ev(page, () => { const u = window.__uu, s = u.UI.s, E = u.EVENTS.flare; window.__v4.askOk = false; const keep = { q: E.q }; if (!E.q) E.q = { tr: 'Güneş fırtınasında nereye gidilir?', en: 'Where do you go in a solar storm?' };
        const hid = E.ch.findIndex(c => c.idle); const hk = hid >= 0 ? E.ch[hid].hide : undefined; if (hid >= 0) E.ch[hid].hide = true;
        const p = s.pending.find(q => q.id === 'flare'); u.openCall(p.pid);
        const r = { modal: u.UI.modal, text: (document.querySelector('#modalBox .m-text') || {}).textContent, n: document.querySelectorAll('#evChoices .choice').length, pv: document.querySelectorAll('#evChoices .pv').length, all: E.ch.length };
        if (hid >= 0) { if (hk === undefined) delete E.ch[hid].hide; else E.ch[hid].hide = hk; } if (!keep.q) delete E.q; u.ACT.closeModal(); delete window.__uuMods.ISKART; return r; });
      ok(k5b.modal === 'event' && /Güneş fırtınasında|\?/.test(k5b.text || '') && k5b.pv === 0 && k5b.n <= k5b.all, 'K5: ISKART yokken pencere soruyu (ev.q) ve görünür şıkları gösterir, önizleme çipi yok ' + JSON.stringify(k5b));
      await ev(page, () => { const u = window.__uu; u.UI.s.pending.length = 0; u.refresh(true); });
    }

    await restPrep(page);

    const A1 = realCore ? 'surucu' : 'v4_surucu', A2 = realCore ? 'dron' : 'v4_ikinci', A1RE = realCore ? /İlk sürüş/ : /Sürücü/;
    await ev(page, a => { const u = window.__uu, s = u.UI.s; u.UI.achQ.length = 0; u.UI.achT = 0; document.querySelectorAll('.toast').forEach(t => t.remove()); for (const id of a) { if (s.ach) delete s.ach[id]; if (s.achP) delete s.achP[id]; delete u.prof2().ach[id]; if (u.UI.achSeen) delete u.UI.achSeen[id]; } }, [A1, A2]);
    const k6 = await ev(page, A1 => { const W = window, u = W.__uu, s = u.UI.s; W.__uuMods = W.__uuMods || {};
      W.__uuMods.ACHIEVEMENTS = [{ id: 'v4_surucu', name: { tr: 'Sürücü', en: 'Driver' }, icon: 'rover', rule: { t: 'tag', id: 'x:gezgin' }, how: { tr: 'Gezgine yaklaş', en: 'Get near the rover' }, gives: ['feat:surus'], say: { tr: 'Artık gezgini sürebilirsin!', en: 'Now you can drive the rover!' } },
        { id: 'v4_ikinci', name: { tr: 'Gözcü', en: 'Scout' }, icon: 'compass', rule: { t: 'tag', id: 'x:dron' }, how: { tr: 'Kuşbakışına geç', en: 'Use the bird view' }, gives: ['feat:dron'], say: { tr: 'Dron keşfi açıldı!', en: 'Drone scouting unlocked!' } }];
      W.__uuMods.featOn = (st, f) => W.__uuMods.ACHIEVEMENTS.some(a => ((st.ach && st.ach[a.id] != null) || (st.achP && st.achP[a.id])) && (a.gives || []).includes('feat:' + f));
      s.ach = s.ach || {}; s.ach[A1] = s.t; u.refresh(true);
      let lp = null; try { lp = JSON.parse(localStorage.getItem('ufuk-ussu-profil')); } catch (e) {   }
      return { toasts: document.querySelectorAll('.toast.ach').length, txt: (document.querySelector('.toast.ach') || {}).textContent || '', modal: u.UI.modal, prof: !!u.prof2().ach[A1], ls: !!(lp && lp.ach && lp.ach[A1]), feat: u.featIs('surus') }; }, A1);
    void A1RE; ok(k6.toasts === 0 && !k6.modal && await ev(page, () => !document.getElementById('pdaBadge').hidden), 'K6 (geri-g 4c): yeni başarım → büyük bildirim yok, Tablet rozeti, pencere açılmadı ' + JSON.stringify(k6));
    await ev(page, () => window.__uu.ACT.achOpen()); await settle(page, 600);
    ok(k6.prof && k6.ls && k6.feat, 'K6: başarım profilde (bellek + yerel depo) ve özellik açık');
    ok(await ev(page, () => window.__uu.UI.pda === 'gorev' && !!document.querySelector('#achSec[open] li.got')), 'başarım açılınca Tablet\'in başarım bölümü açılır, kazanılan işaretli');
    await ev(page, () => window.__uu.closePda());

    await ev(page, A2 => { const u = window.__uu, s = u.UI.s; s.ach[A2] = s.t; u.UI.achT = 0; u.refresh(true); const t = document.querySelector('.toast.ach'); if (t) document.getElementById('toasts').appendChild(Object.assign(t.cloneNode(true), { id: 'achShot' })); }, A2);
    await settle(page, 300); await shot(page, 'v4-04-basarim');
    await ev(page, () => { const e = document.getElementById('achShot'); if (e) e.remove(); });
    await ev(page, () => { const u = window.__uu; u.ACT.quit(); u.ACT.start(); }); await settle(page, 1500); await crPass(page);
    const k6b = await ev(page, A1 => { const u = window.__uu, s = u.UI.s; u.refresh(true); return { achP: !!(s.achP && s.achP[A1]), feat: u.featIs('surus'), toasts: document.querySelectorAll('.toast.ach').length }; }, A1);
    ok(k6b.achP && k6b.feat && k6b.toasts === 0, 'profil: yeni görevde kazanılmış özellik baştan açık (gezgini sür), başarım yeniden duyurulmadı ' + JSON.stringify(k6b));

    await page.setViewportSize({ width: 844, height: 390 }); await settle(page, 800);
    await ev(page, () => { const u = window.__uu; if (u.tut()) u.endTutorial(true); if (u.UI.modal) u.ACT.closeModal(); });
    await restPrep(page); await page.mouse.move(820, 200); await settle(page, 1200); await restPrep(page); await settle(page, 600);
    const r2 = await restMeasure(page);
    lap('dinlenme 844×390: ' + JSON.stringify(r2));
    ok(r2.btns.length <= 6 && r2.words.length <= 12 && r2.nums.length <= 8, `844×390 dinlenme: düğme ${r2.btns.length}, kelime ${r2.words.length}, sayı ${r2.nums.length} (≤ 6 / 12 / 8)`);
    await shot(page, 'v4-05-dinlenme-844');
    await ev(page, () => window.__uu.queueSub({ from: 'atlas', text: { tr: 'Önce elektrik, sonra hava. Kur düğmesine dokun.', en: 'Power first.' }, c: 'info', local: true }));
    await page.waitForFunction(() => !!window.__uu.subState().text, null, { timeout: 15000 }).catch(() => {}); await settle(page, 600);
    const fs2 = await ev(page, () => parseFloat(getComputedStyle(document.querySelector('#sub .s-text')).fontSize));
    ok(fs2 >= 20, '844×390 altyazı yazısı ' + fs2 + ' px (≥ 20)');
    await shot(page, 'v4-06-altyazi-844');

    await page.setViewportSize({ width: 1366, height: 768 }); await settle(page, 600);
    await ev(page, () => window.__uu.openWardrobe('astro')); await settle(page, 600);
    const k9 = await ev(page, () => { const st = document.getElementById('crStage'), r = st.getBoundingClientRect(), b = document.getElementById('modalBox').getBoundingClientRect(); return { w: Math.round(r.width), pe: getComputedStyle(document.getElementById('modal')).pointerEvents, stPe: getComputedStyle(st).pointerEvents, box: Math.round(b.width) }; });
    ok(k9.w >= 1366 * 0.5 - 30 && k9.pe === 'none' && k9.stPe === 'none', 'K9: dolap/yaratıcıda önizleme alanı geniş ve sürükleme tuvale geçiyor ' + JSON.stringify(k9));
    await shot(page, 'v4-07-dolap-onizleme');
    await ev(page, () => window.__uu.ACT.wdClose());
  }
  await page.context().close();
}

if (want('v4')) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1, locale: 'tr-TR' });
  await ctx.addInitScript(() => { try { Object.defineProperty(window, 'localStorage', { get() { throw new Error('depo kapalı'); }, configurable: true }); } catch (e) {   } });
  const page = await ctx.newPage(), pe = [];
  page.on('pageerror', e => pe.push(e.message));
  await page.goto(url); await page.waitForTimeout(1500); await skipEg(page);
  await page.click('[data-act="start"]'); await settle(page, 1500); await crPass(page, 'Deniz');
  const d1 = await ev(page, () => { const u = window.__uu, s = u.UI.s; s.ach = s.ach || {}; s.ach.v4_depo = s.t; u.refresh(true); u.ACT.quit(); u.ACT.start(); return true; });
  await settle(page, 1200); await crPass(page);
  const d2 = await ev(page, () => { const u = window.__uu, s = u.UI.s; return { achP: !!(s.achP && s.achP.v4_depo), prof: !!u.prof2().ach.v4_depo, name: s.name }; });
  ok(d1 && d2.achP && d2.prof && !pe.length, 'yerel depo yokken oyun açılır, başarım profili aynı oturumda korunur ' + JSON.stringify(d2) + (pe.length ? ' ' + pe.join(' | ') : ''));
  await ctx.close();
}
await browser.close();
const nOk = checks.filter(c => c[0]).length;
console.log(`kontroller: ${nOk}/${checks.length} geçti`);
console.log(errors.length ? 'HATALAR:\n' + errors.join('\n') : 'konsol hatası yok');
process.exit(errors.length ? 1 : 0);
