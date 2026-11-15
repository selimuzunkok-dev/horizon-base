

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, '..');
const groot = execSync('npm root -g').toString().trim();
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(groot, '@playwright', 'cli', 'node_modules', 'playwright-core'));
const out = process.env.SHOTS || path.join(dir, 'shots-sahne'); fs.mkdirSync(out, { recursive: true });
const ONLY = process.env.ONLY || '';
const NOSHOT = process.env.NOSHOT === '1';

const src = f => { const p = path.join(root, 'src', f); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null; };
const parts = ['veri.js', 'cekirdek.js', 'hikaye.js', 'cizim.js', 'modeller.js', 'yol.js', 'sahne.js'].map(f => [f, src(f)]).filter(x => x[1]);
console.log('dosyalar:', parts.map(p => p[0]).join(', '));

const demo = `
window.D = (() => {
  const errs = [];
  window.addEventListener('error', e => errs.push(String(e.message)));
  const cv = document.getElementById('cv');
  let S = null, frac = 0;
  function freeTiles(s, rmax) {
    const r = [];
    for (let y = 0; y < MAPH; y++) for (let x = 0; x < MAPW; x++) {
      const d = Math.hypot(x - HUBX, y - HUBY);
      if (d < 0.9 || d > rmax || !isSeen(s, x, y) || bAt(s, x, y)) continue;
      r.push({ x, y, d, k: tileAt(s, x, y) });
    }
    return r.sort((a, b) => a.d - b.d);
  }
  function put(s, k, want, st) {
    const fr = freeTiles(s, 8).filter(t => want ? t.k === want : t.k === '.');
    for (const t of fr) {
      const r = build(s, k, t.x, t.y);
      if (r.ok) { Object.assign(r.b, st || { left: 0, st: 'ok' }); return r.b; }
    }
    return null;
  }
  return {
    errs,
    ok: false,
    setup(world, seed) {
      const s = newGame(world, 'muhendis', seed, 'Demo');
      s.res.malzeme = 99999; s.res.parca = 99999; s.res.bilim = 999; s.core = 5; s.techs.baski = 1; s.techs.dongu = 1;
      reveal(s, HUBX, HUBY, 7.2);
      s.b[0].shield = 1;
      put(s, 'gunes'); put(s, 'gunes'); put(s, 'gunes'); put(s, 'batarya');
      put(s, 'oksijen'); put(s, 'su', 'i'); put(s, 'sera'); put(s, 'yasam'); put(s, 'anten');
      put(s, 'maden', 'm') || put(s, 'maden'); put(s, 'lab', null, { left: 0, st: 'guc' });
      put(s, 'atolye', null, { left: 0, st: 'ariza', broken: true }); put(s, 'spor', null, { left: 5, st: 'insa' });
      put(s, 'geri', null, { left: 7, st: 'insa' });
      s.pop = 6;
      S = s; window.S = s;
      this.ok = S3.init(cv);
      S3.load(s);
      return { ok: this.ok, n: s.b.length, kinds: s.b.map(b => b.k + '@' + b.x + ',' + b.y).join(' ') };
    },
    t(t, f) { S.t = t; frac = f || 0; },
    step(n, dt) { for (let i = 0; i < n; i++) S3.frame(S, dt || 1 / 60, performance.now(), frac); return S3.player; },
    adv(n, dt) { for (let i = 0; i < n; i++) { frac = (frac + 0.0007) % 1; S3.frame(S, dt || 1 / 60, performance.now(), frac); } return S3.rover; }, // zaman akarken (gezgin hareketi)
    perf(n) {
      const gl = cv.getContext('webgl2') || cv.getContext('webgl'), px = new Uint8Array(4);
      S3.frame(S, 1 / 60, 0, frac); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      const t0 = performance.now(); let cpu = 0;
      for (let i = 0; i < n; i++) { const a = performance.now(); S3.frame(S, 1 / 60, 0, frac); cpu += performance.now() - a; }
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      return { ms: +((performance.now() - t0) / n).toFixed(2), cpu: +(cpu / n).toFixed(2), stats: S3.stats() };
    },
    raf(sec) { return new Promise(res => { let n = 0, t0 = 0, last = 0, worst = 0; const f = (t) => { if (!t0) { t0 = last = t; } worst = Math.max(worst, t - last); last = t; S3.frame(S, 1 / 60, t, frac); n++; if (t - t0 < sec * 1000) requestAnimationFrame(f); else res({ fps: +(n * 1000 / (t - t0)).toFixed(1), worst: +worst.toFixed(1) }); }; requestAnimationFrame(f); }); },
    near(kind) { // oyuncuyu verilen türdeki karonun 7 m güneyine koy, ona baksın
      for (let y = 0; y < MAPH; y++) for (let x = 0; x < MAPW; x++) if (tileAt(S, x, y) === kind && !bAt(S, x, y)) { S3.setPlayer(x * 8 + 4, y * 8 + 4 + 7, 0); return [x, y]; }
      return null;
    },
    api() { return { dragLook: S3.dragLook, jump: typeof S3.jump, mode: S3.mode }; },
    free() { const f = freeTiles(S, 9).filter(t => t.k === '.' && t.d > 3); return f.length ? [f[0].x, f[0].y] : [HUBX + 3, HUBY + 2]; },
    hints() { // A paketinin starterPlan/suggestSpot'u varsa onları, yoksa boş karoları kullan
      let plan = typeof starterPlan === 'function' ? starterPlan(S).map(p => ({ tx: p.x, ty: p.y, n: p.n, k: p.k })) : null;
      if (!plan || !plan.length) plan = freeTiles(S, 8).filter(t => t.k === '.' && t.d > 2).slice(0, 5).map((t, i) => ({ tx: t.x, ty: t.y, n: i + 1, k: 'gunes' }));
      const sg = typeof suggestSpot === 'function' ? suggestSpot(S, 'gunes') : null;
      const best = sg ? { tx: sg.x, ty: sg.y } : { tx: plan[0].tx, ty: plan[0].ty };
      S3.setBuildHints({ best, plan: plan.slice(1) });
      return { best, plan };
    },
    prims: 0, hovers: 0, walks: 0,
    hook() { if (this._h) return; this._h = 1; S3.on('primary', () => this.prims++); S3.on('hover', () => this.hovers++); S3.on('walk', () => this.walks++); },
    ghostOn() { const d = S3._dbg(); return !!(d.W.ghost && d.W.ghost.visible) && S3.aim.tx >= 0; },
    tileScreen(tx, ty) { const p = S3.project(tx * 8 + 4, S3.hAt(tx * 8 + 4, ty * 8 + 4), ty * 8 + 4); return [Math.round(p.sx), Math.round(p.sy)]; },
    bTile(k) { const b = S.b.find(o => o.k === k); return b ? [b.x, b.y] : [HUBX, HUBY]; },
    crowd() { // üssün çevresine sık yapılar (komşu karolar dolu) + yapım alanı: ekip bunların arasında takılmamalı
      let n = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [2, 0], [-2, 0], [0, 2], [1, -1], [-1, 1]]) {
        const x = HUBX + dx, y = HUBY + dy; if (bAt(S, x, y)) continue;
        const id = 9000 + n++; S.b.push({ id, k: n % 3 ? 'gunes' : 'batarya', x, y, left: n % 4 === 0 ? 6 : 0, st: n % 4 === 0 ? 'insa' : 'ok', hp: 100 });
      }
      return n;
    },
    crewRun(sec, dt) { // ekibi sec saniye yürüt; her astronot için en uzun hareketsiz süre, engel içinde kare sayısı, toplam yol
      const W = S3._dbg().W, out = W.crew.map(() => ({ still: 0, maxStill: 0, inside: 0, dist: 0, px: null, pz: null, ax: null, az: null }));
      const n = Math.round(sec / dt), R = S3._dbg().R, rr = R.render; R.render = () => {}; // çizim olmadan (yazılımla WebGL'de 60 sn çizmek dakikalar sürer)
      try { for (let i = 0; i < n; i++) {
        frac = (frac + 0.0001) % 1; S3.frame(S, dt, performance.now(), frac);
        const ob = W.obstC || W.obst;
        W.crew.forEach((c, k) => {
          const o = out[k] || (out[k] = { still: 0, maxStill: 0, inside: 0, dist: 0, px: null, pz: null, ax: null, az: null });
          if (o.px != null) o.dist += Math.hypot(c.x - o.px, c.z - o.pz);
          o.px = c.x; o.pz = c.z;
          if (ob.some(q => q.r > 0 && Math.hypot(c.x - q.x, c.z - q.z) < q.r - 0.05)) o.inside++;
          // takılma: hedefi varken (beklemiyorken) 3 sn içinde 0,1 m'den az yer değiştirme
          if (c.wait > 0 || c.tx == null) { o.still = 0; o.ax = c.x; o.az = c.z; }
          else if (o.ax == null || Math.hypot(c.x - o.ax, c.z - o.az) > 0.1) { o.ax = c.x; o.az = c.z; o.still = 0; }
          else { o.still += dt; o.maxStill = Math.max(o.maxStill, o.still); }
        });
      } } finally { R.render = rr; }
      return out.map(o => ({ maxStill: +o.maxStill.toFixed(2), inside: o.inside, dist: +o.dist.toFixed(1) }));
    },
  };
})();
`;
const esc = c => c.replace(/<\/script/gi, '<\\/script');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;background:#000;overflow:hidden}canvas{display:block;width:100vw;height:100vh}</style></head><body>
<canvas id="cv"></canvas>
<script src="${pathToFileURL(path.join(root, 'vendor', 'three.min.js')).href}"></script>
${parts.map(([f, c]) => `<script>/* ${f} */\n${esc(c)}\n</script>`).join('\n')}
<script>${demo}</script></body></html>`;
const file = path.join(out, '_demo.html');
fs.writeFileSync(file, html);

const browser = await chromium.launch({ channel: 'msedge', headless: true, args: (process.platform === 'linux' || process.env.YAZILIM_CIZICI === '1') ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
const errors = [];
const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 });
const page = await ctx.newPage(); page.setDefaultTimeout(+process.env.PW_TIMEOUT || 30000);
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message + '\n' + e.stack));
await page.goto(pathToFileURL(file).href);
await page.waitForFunction(() => typeof THREE !== 'undefined' && window.D, null, { timeout: 20000 });
const ev = (fn, a) => page.evaluate(fn, a);
const shot = async n => { if (NOSHOT) return; await page.screenshot({ path: path.join(out, n + '.png'), timeout: 240000 }); console.log('  ✓', n); };
const step = (n, dt) => ev(([n, dt]) => D.step(n, dt), [n, dt || 1 / 60]);
const perf = [];
const fails = [];
const check = (ok, msg) => { console.log(ok ? '  ✓' : '  ✗', msg); if (!ok) fails.push(msg); };

async function planChecks(w, nightT) {
  await ev(() => { D.hook(); S3.setMode('walk'); }); await step(10);
  const before = await ev(() => D.perf(60));
  await ev(() => { S3.setMode('plan'); S3.setGhost('gunes'); D.hints(); }); await step(50);
  check(await ev(() => S3.mode === 'plan'), w + ': S3.mode === plan');
  const fov = await ev(() => S3._dbg().cam.fov); check(Math.abs(fov - 28) < 0.5, w + ': inşa FOV 28° (' + fov.toFixed(1) + ')');

  for (const [x, y] of [[683, 384], [4, 4], [1360, 6], [6, 760], [1362, 764], [683, 30]]) {
    await page.mouse.move(x, y); await step(3);
    const g = await ev(() => [D.ghostOn(), S3.aim.tx, S3.aim.ty]);
    check(g[0] && g[1] >= 0 && g[1] < 24 && g[2] >= 0 && g[2] < 15, `${w}: önizleme görünür, imleç (${x},${y}) → karo ${g[1]},${g[2]}`);
  }

  const hb = await ev(() => D.hints().best);
  const gs = await ev(([tx, ty]) => D.tileScreen(tx, ty), [hb.tx, hb.ty]);
  await page.mouse.move(gs[0], gs[1]); await step(6);
  check(await ev(([tx, ty]) => S3.aim.tx === tx && S3.aim.ty === ty && canBuild(S, 'gunes', tx, ty).ok, [hb.tx, hb.ty]), w + ': önerilen kare imleçle seçilir ve kurulabilir (yeşil)');
  await shot(w + '-p1-insa-yesil');

  const p0 = await ev(() => D.prims);
  await page.mouse.down(); for (let i = 1; i <= 8; i++) { await page.mouse.move(gs[0] + i * 14, gs[1] + i * 6); await step(1); } await page.mouse.up(); await step(3);
  check(await ev(() => D.prims) === p0, w + ': sürükleyip bırakmak kurma tıkı sayılmaz');
  await page.mouse.move(gs[0], gs[1]); await step(3);
  await page.mouse.down(); await page.mouse.up(); await step(2);
  check(await ev(() => D.prims) === p0 + 1, w + ': kısa tık tam bir kez primary gönderir');
  check(await ev(() => D.hovers) > 0, w + ': hover olayı geliyor');

  const bt = await ev(() => D.bTile('batarya'));
  const bs = await ev(([tx, ty]) => D.tileScreen(tx, ty), bt);
  await page.mouse.move(bs[0], bs[1]); await step(6);
  check(await ev(([tx, ty]) => S3.aim.tx === tx && S3.aim.ty === ty && !canBuild(S, 'gunes', tx, ty).ok, bt), w + ': dolu kare kırmızı (kurulamaz)');
  await shot(w + '-p2-insa-kirmizi');
  const after = await ev(() => D.perf(60));
  perf.push([w + ' inşa önce (yürüyüş)', before], [w + ' inşa görünümü', after]);

  await ev(() => { S3.setGhost('su'); S3.planTint('i'); }); await page.mouse.move(683, 384); await step(20);
  await shot(w + '-p3-insa-buz-vurgu');
  await ev(() => { S3.planTint(null); S3.setGhost('gunes'); });

  await page.keyboard.press('KeyQ'); await step(30); await shot(w + '-p4-insa-dondur'); await page.keyboard.press('KeyE'); await step(30);
  await page.mouse.move(683, 384); await page.mouse.wheel(0, 900); await step(25);
  check(await ev(() => S3.mode === 'plan'), w + ': yakınlaştırmadan sonra hâlâ inşa görünümünde');
  await page.mouse.wheel(0, -900); await step(25);

  await ev(t => D.t(t, 0.5), nightT); await step(30); await page.mouse.move(gs[0], gs[1]); await step(4);
  await shot(w + '-p5-insa-gece');

  await page.setViewportSize({ width: 844, height: 390 }); await step(20);
  await page.mouse.move(422, 195); await step(6);
  check(await ev(() => D.ghostOn()), w + ': 844×390 önizleme görünür');
  await shot(w + '-p6-insa-844x390-gece');
  await page.setViewportSize({ width: 1366, height: 768 }); await step(10);

  await ev(() => { S3.setGhost(null); S3.setBuildHints(null); S3.setMode('walk'); }); await step(40);
  check(await ev(() => S3.mode === 'walk' && Math.abs(S3._dbg().cam.fov - 62) < 0.5), w + ': çıkışta yürüyüş ve FOV 62°');
}

if (!ONLY || ONLY === 'ay') {
  console.log('Ay:', await ev(() => { const t0 = performance.now(); const r = D.setup('ay', 1234); r.loadMs = Math.round(performance.now() - t0); return r; }));
  await ev(() => D.t(24 * 2 + 9, 0.3)); await step(90);
  await shot('ay-01-gunduz');
  perf.push(['ay gündüz yürüme', await ev(() => D.perf(120))]);
  perf.push(['ay rAF 3 sn', await ev(() => D.raf(3))]);
  await ev(() => { S3.setPlayer(S3.player.x, S3.player.z, Math.PI); }); await step(30);
  await shot('ay-02-gunduz-guney');
  await ev(() => { S3.setPlayer(80, 40, -0.9); }); await step(30);
  await shot('ay-03-gunduz-yan');
  await ev(() => { S3.setPlayer(96, 6, -0.25); }); await step(30);
  await shot('ay-03b-krater-kenari');

  await ev(() => { S3.setPlayer(100, 82, 0); }); await step(10);
  await page.keyboard.down('KeyW'); await step(45); await shot('ay-04-yuru-1');
  await page.keyboard.press('Space'); await step(40); await shot('ay-05-ziplama');
  await step(80); await page.keyboard.up('KeyW'); await step(10); await shot('ay-06-yuru-2');

  const ice = await ev(() => D.near('i'));
  await ev(() => { S3.scanFx(0.55); }); await step(20); await shot('ay-07-tarama-buz'); await ev(() => S3.scanFx(null));
  console.log('  nişan:', JSON.stringify(await ev(() => S3.aim)), 'buz', ice);

  await ev(() => { D.t(9 * 24 + 40, 0.5); S3.setPlayer(103, 73, 0.12); }); await step(30);
  await shot('ay-08-kutup-gecesi');
  await ev(() => { D.t(9 * 24 + 3, 0.5); }); await step(10);
  await shot('ay-09-gun-batimi');
  await ev(() => { D.t(9 * 24 + 40, 0.5); S3.setMode('drone'); }); await step(40);
  await shot('ay-09b-gece-dron'); await ev(() => S3.setMode('walk'));

  await ev(() => { D.t(24 * 2 + 9, 0.3); S3.setMode('dron'); S3.setMode('drone'); S3.setGhost('gunes'); }); await step(40);
  await page.mouse.move(760, 330); await step(10);
  await shot('ay-10-dron-hayalet');
  console.log('  nişan:', JSON.stringify(await ev(() => S3.aim)));
  perf.push(['ay dron', await ev(() => D.perf(120))]);
  await ev(() => { S3.setGhost(null); }); await page.mouse.move(683, 384);

  await ev(() => { D.t(24 * 2 + 9, 0.3); S3.setMode('walk'); S3.setPlayer(100, 70, 0); }); await step(20);
  await planChecks('ay', 9 * 24 + 40);
  await ev(() => D.t(24 * 2 + 9, 0.3));

  await ev(() => { S3.clickWalk(true); S3.setMode('drone'); S3.setPlayer(100, 60, 0); }); await step(40);
  const wt = await ev(() => D.free()); const ws = await ev(t => D.tileScreen(t[0], t[1]), wt);
  const pw0 = await ev(() => [S3.player.x, S3.player.z]);
  await page.mouse.move(ws[0], ws[1]); await page.mouse.down(); await page.mouse.up(); await step(120);
  const pw1 = await ev(() => [S3.player.x, S3.player.z]);
  check(Math.hypot(pw1[0] - (wt[0] * 8 + 4), pw1[1] - (wt[1] * 8 + 4)) < Math.hypot(pw0[0] - (wt[0] * 8 + 4), pw0[1] - (wt[1] * 8 + 4)) - 3, 'ay: tıkla-yürü astronotu tıklanan kareye yürütür');
  await ev(() => { S3.clickWalk(false); S3.setMode('walk'); }); await step(10);

  await ev(() => { window.__sc = 0; S3.setPlayer(100, 70, 0); }); await step(5);
  const len = await ev(() => S3.launchScene(() => { window.__sc++; }));
  check(len > 8, 'ay: launchScene süre döndürür (' + len + ' sn)');
  const sceneAt = async (sec, n) => { await ev(s => { const d = s - S3.scene.t; if (d > 0) D.step(Math.round(d * 30), 1 / 30); }, sec); await shot(n); };
  await sceneAt(2.4, 'ay-s1-sahne-tasima'); await sceneAt(5.1, 'ay-s2-sahne-kapsul'); await sceneAt(7.6, 'ay-s3-sahne-el-sallama');
  await sceneAt(9.9, 'ay-s4-sahne-kalkis'); await sceneAt(12.2, 'ay-s5-sahne-yukarida'); await sceneAt(14, 'ay-s6-sahne-son');
  check(await ev(() => window.__sc) === 1, 'ay: sahne bitince geri çağrı tam bir kez');
  await ev(() => D.setup('ay', 1234)); await step(5);
  check(await ev(() => !S3.scene), 'ay: yeniden yüklemede sahne sıfırlanır');

  const ft = await ev(() => D.free());
  await ev(ft => { S3.setMode('walk'); S3.setPlayer(ft[0] * 8 + 4 + 6, ft[1] * 8 + 4 + 26, 0.2); S3.shipLand(ft[0], ft[1]); }, ft); await step(330);
  await shot('ay-11-gemi-inis');
  await step(200); await shot('ay-12-gemi-indi');
  await ev(() => S3.flash('meteor')); await step(4); await shot('ay-13-meteor-flas');
  const pr = await ev(() => { const p = S3.player; return [S3.project(100, 3, 60), p]; });
  console.log('  project(hub):', JSON.stringify(pr[0]));
}
if (!ONLY || ONLY === 'mars') {
  console.log('Mars:', await ev(() => { const t0 = performance.now(); const r = D.setup('mars', 777); r.loadMs = Math.round(performance.now() - t0); return r; }));
  await ev(() => { S3.setMode('walk'); D.t(24 * 3 + 10, 0.2); S3.setPlayer(103, 73, 0.12); }); await step(90);
  await shot('mars-01-gunduz');
  perf.push(['mars gündüz', await ev(() => D.perf(120))]);
  await ev(() => { S3.setPlayer(103, 73, 1.2); }); await step(20);
  await shot('mars-02-gunduz-bati');
  await ev(() => { D.t(24 * 3 + 17, 0.6); S3.setPlayer(110, 66, 1.45); }); await step(30);
  await shot('mars-03-aksam');
  await ev(() => { D.t(24 * 3 + 18, 0.4); }); await step(10);
  await shot('mars-04-alacakaranlik');
  await ev(() => { D.t(24 * 4 + 1, 0.4); S3.setPlayer(103, 73, 0.12); }); await step(30);
  await shot('mars-05-gece');
  await ev(() => { D.t(24 * 5 + 12, 0); S.storm = { from: S.t - 20, until: S.t + 60 }; }); await step(60);
  await shot('mars-06-firtina');
  perf.push(['mars fırtına', await ev(() => D.perf(120))]);
  await ev(() => { S.storm = null; S.fx.flareUntil = S.t + 6; }); await step(20);
  await shot('mars-07-gunes-patlamasi');

  await ev(() => { S.fx.flareUntil = 0; D.t(24 * 5 + 12, 0); S.storm = { from: S.t - 20, until: S.t + 60 }; S3.setMode('plan'); S3.setGhost('gunes'); D.hints(); }); await step(60);
  await page.mouse.move(683, 384); await step(5); await shot('mars-p0-insa-firtina');
  await ev(() => { S.storm = null; S3.setMode('walk'); D.t(24 * 3 + 10, 0.2); }); await step(20);
  await planChecks('mars', 24 * 4 + 1);
  await ev(() => { S3.setPlayer(103, 73, 0.12); window.__sc = 0; S3.launchScene(() => { window.__sc++; }); D.step(Math.round(9.9 * 30), 1 / 30); }); await shot('mars-s4-sahne-kalkis');
  await ev(() => { S3.skipScene(); D.step(3, 1 / 30); }); check(await ev(() => window.__sc) === 1, 'mars: skipScene sahneyi bitirir');
  await ev(() => D.setup('mars', 777)); await ev(() => { S3.setMode('walk'); D.t(24 * 3 + 17, 0.6); }); await step(10);
  await ev(() => { S.fx.flareUntil = 0; S3.setMode('drone'); S3.setGhost('sera'); }); await step(40);
  await page.mouse.move(600, 420); await step(10);
  await shot('mars-08-dron');
  await ev(() => { S.fx.flareUntil = S.t + 6; }); await step(20);
  await shot('mars-08b-dron-patlama'); await ev(() => { S.fx.flareUntil = 0; });
  await ev(() => { S3.setGhost(null); S3.setMode('walk'); S3.quality('low'); }); await step(20);
  await shot('mars-09-dusuk-kalite');
  perf.push(['mars düşük kalite', await ev(() => D.perf(120))]);
  await ev(() => S3.quality('high'));
}

if (!ONLY || ONLY === 'v4') {
  const small = async f => { const vp = page.viewportSize(); await page.setViewportSize({ width: 240, height: 136 }); try { return await f(); } finally { await page.setViewportSize(vp); await step(2); } };
  for (const w of ['ay', 'mars']) {
    const day = w === 'ay' ? 24 * 2 + 9 : 24 * 3 + 10, night = w === 'ay' ? 9 * 24 + 40 : 24 * 4 + 1;
    console.log(w + ' (v4):', await ev(([w, seed]) => D.setup(w, seed), [w, w === 'ay' ? 1234 : 777]));
    check(await ev(() => ['setGoal', 'ping', 'nearRover', 'drive', 'showcaseFlash'].every(k => typeof S3[k] === 'function') && S3.driving === false), w + ': v4 S3 işlevleri var');
    await ev(t => { S3.setMode('walk'); D.t(t, 0.3); S3.setPlayer(100, 78, 0.3); }, day); await step(20);

    const callsN = () => ev(() => { D.step(2); return S3.stats().calls; });
    const g0 = await callsN();
    const gt = await ev(() => D.free());
    check(await ev(t => S3.setGoal({ x: t[0] * 8 + 4, z: t[1] * 8 + 4 }) === true && !!S3.goal, gt), w + ': setGoal açılır');
    const g1 = await callsN();
    await ev(() => S3.ping(S3.goal.x, S3.goal.z)); await step(5);
    await shot(w + '-v1-hedef-yuruyus-gunduz');
    await ev(() => S3.setMode('drone')); await step(40); await shot(w + '-v2-hedef-kusbakisi-halka');
    await ev(() => S3.setMode('plan')); await step(40); await shot(w + '-v3-hedef-insa');
    await ev(t => D.t(t, 0.3), night); await ev(() => S3.setMode('walk')); await step(30); await shot(w + '-v4-hedef-gece');
    await ev(t => D.t(t, 0.3), day); await step(10);
    check(await ev(() => S3.setGoal(null) === false && S3.goal === null), w + ': setGoal(null) gizler');
    await step(60);

    const gA = await ev(p => { const W = S3._dbg().W; W.crew.forEach(c => { c.g.visible = false; }); const m = () => { D.step(2); return S3.stats().calls; };
      const off0 = m(); S3.setGoal(p); const on = m(); S3.setGoal(null); const off1 = m(); W.crew.forEach(c => { c.g.visible = true; }); return [off0, on, off1, W.goal.visible]; }, { x: gt[0] * 8 + 4, z: gt[1] * 8 + 4 });
    check(gA[1] - gA[0] === 2 && gA[0] === gA[2] && gA[3] === false, `${w}: işaret 2 çizim çağrısı, kapalıyken çağrı değişmez (kapalı ${gA[0]} → açık ${gA[1]} → kapalı ${gA[2]}; ilk ölçüm ${g0} → ${g1})`);

    const r0 = await ev(() => S3.rover);
    await ev(r => S3.setPlayer(r.x + 6, r.z + 6, 0), r0); await step(3);
    check(await ev(() => S3.drive(true) === false), w + ': uzaktan binilmez');
    await ev(() => { const V = S3._dbg().W.rover; const a = Math.atan2(S3.player.x - V.x, S3.player.z - V.z); S3.setPlayer(V.x + Math.sin(a) * (V.r + 1.5), V.z + Math.cos(a) * (V.r + 1.5), 0); }); await step(3);
    const nr = await ev(() => S3.nearRover());
    check(nr != null && nr <= 4, w + ': nearRover ≤ 4 m (' + (nr == null ? nr : nr.toFixed(2)) + ')');
    check(await ev(() => S3.drive(true) === true && S3.driving), w + ': drive(true) biner');
    await ev(() => {
      const W = S3._dbg().W, V = W.rover, ob = W.obstC || W.obst;
      for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; if (YOL.segFree(ob, V.x, V.z, V.x + Math.sin(a) * 20, V.z + Math.cos(a) * 20, V.r * 0.8)) { V.yaw = a; return a; } }
    });
    const d0 = await ev(() => S3.rover);
    await small(async () => { await page.keyboard.down('KeyW'); await ev(() => D.step(180, 1 / 60)); await page.keyboard.up('KeyW'); });
    const d1 = await ev(() => [S3.rover, S3.player]);
    const moved = Math.hypot(d1[0].x - d0.x, d1[0].z - d0.z);
    check(moved > 4, `${w}: 3 sn W ile gezgin ilerler (${moved.toFixed(1)} m)`);
    check(Math.hypot(d1[1].x - d1[0].x, d1[1].z - d1[0].z) < 0.01, w + ': sürerken S3.player gezginin konumu');
    await small(async () => { await page.keyboard.down('KeyD'); await page.keyboard.down('KeyW'); await ev(() => D.step(90, 1 / 60)); await page.keyboard.up('KeyW'); await page.keyboard.up('KeyD'); });
    await step(20); await shot(w + '-v5-surus-arkadan');

    await ev(() => S3.setMode('drone')); await step(5);
    const tgt = await ev(() => { const V = S3.rover, a = Math.atan2(100 - V.x, 60 - V.z); return { x: V.x + Math.sin(a) * 15, z: V.z + Math.cos(a) * 15 }; });
    const b0 = await ev(t => Math.hypot(S3.rover.x - t.x, S3.rover.z - t.z), tgt);
    check(await ev(t => S3.driveTo(t.x, t.z), tgt), w + ': driveTo kabul edilir');
    await small(() => ev(() => D.step(300, 1 / 60)));
    const b1 = await ev(t => Math.hypot(S3.rover.x - t.x, S3.rover.z - t.z), tgt);
    check(b1 < b0 - 5, `${w}: kuşbakışında hedefe sürer (${b0.toFixed(1)} → ${b1.toFixed(1)} m)`);
    await shot(w + '-v6-surus-kusbakisi');
    await ev(() => S3.setMode('walk')); await step(5);
    check(await ev(() => S3.drive(false) === true && !S3.driving), w + ': drive(false) iner');
    const off = await ev(() => { const W = S3._dbg().W, p = S3.player, V = W.rover; return { inObst: W.obst.some(o => o.r > 0 && Math.hypot(p.x - o.x, p.z - o.z) < o.r), inRover: Math.hypot(p.x - V.x, p.z - V.z) < V.r, vis: W.player.visible }; });
    check(!off.inObst && !off.inRover && off.vis, w + ': inince oyuncu boş noktada ve görünür ' + JSON.stringify(off));

    check(await ev(() => S3.showcase('player', { side: 'left' })), w + ': showcase(player)');
    await step(30);
    const fl = await ev(() => ['suit', 'visor', 'patch', 'rover', 'craft', 'bld'].map(c => S3.showcaseFlash(c)));
    check(fl.every(Boolean), w + ': showcaseFlash her kategoride true ' + JSON.stringify(fl));
    await ev(() => S3.showcaseFlash('suit')); await step(12); await shot(w + '-v7-vitrin-parlatma');
    await step(40);
    const y0 = await ev(() => S3.showYaw);
    await page.mouse.move(380, 400); await page.mouse.down(); for (let i = 1; i <= 6; i++) { await page.mouse.move(380 + i * 30, 400); await step(1); } await page.mouse.up();
    const y1 = await ev(() => S3.showYaw);
    check(Math.abs(y1 - y0) > 0.5, `${w}: vitrinde sürükleme dönüşü değiştirir (${y0.toFixed(2)} → ${y1.toFixed(2)})`);
    await step(40); await shot(w + '-v8-vitrin-yakin');
    await ev(() => S3.showcase(null)); await step(20);

    await ev(() => { D.crowd(); S.pop = 8; }); await step(5);
    const cr = await ev(() => D.crewRun(60, 1 / 30));
    console.log('  ekip 60 sn:', JSON.stringify(cr));
    check(cr.length >= 2 && cr.every(c => c.maxStill <= 3 && c.inside === 0), w + ': ekip 60 sn takılmadan, engel içine girmeden dolaşır');
    check(cr.every(c => c.dist > 3), w + ': her astronot yürüdü');
    await ev(() => S3.setMode('drone')); await step(30); await shot(w + '-v9-kusbakisi-giysi-halkasi');
    await ev(() => S3.setMode('walk')); await step(5);
  }
}

if (!ONLY || ONLY === 'v5') {
  const small = async f => { const vp = page.viewportSize(); await page.setViewportSize({ width: 240, height: 136 }); try { return await f(); } finally { await page.setViewportSize(vp); await step(2); } };
  for (const w of ['ay', 'mars']) {
    const day = w === 'ay' ? 24 * 2 + 9 : 24 * 3 + 10;
    console.log(w + ' (v5):', await ev(([w, seed]) => D.setup(w, seed), [w, w === 'ay' ? 1234 : 777]));
    check(await ev(() => ['teachFx', 'crewPos', 'roverPos'].every(k => typeof S3[k] === 'function')), w + ': v5 S3 işlevleri var');
    await ev(t => { D.t(t, 0.3); S3.setMode('drone'); }, day); await step(30);
    const cp = await ev(() => ({ c: S3.crewPos(), r: S3.roverPos() }));
    check(Array.isArray(cp.c) && cp.c.every(o => isFinite(o.x) && isFinite(o.z) && o.name) && cp.r && isFinite(cp.r.x), w + ': crewPos [{x,z,name}] (' + cp.c.length + '), roverPos {x,z}');

    const pid = await ev(() => S.b.find(b => b.k === 'gunes').id);
    const c0 = await ev(() => { D.step(2); return S3.stats().calls; });
    check(await ev(id => S3.teachFx(id, 'gunes') === true, pid), w + ': teachFx(gunes) ekrandayken true');
    await step(50);
    const c1 = await ev(() => { D.step(1); return S3.stats().calls; });
    const vis = await ev(() => { const F = S3._dbg().W.tfx; return F ? { p: F.pts.visible, b: F.beam.visible } : null; });
    check(!!vis && vis.p && vis.b, w + ': gunes: ışın ve parçacıklar görünür ' + JSON.stringify(vis));
    check(c1 - c0 <= 5, `${w}: teachFx çizim çağrısı sınırlı (${c0} → ${c1}; v5f: +simge +hale)`);
    await shot(w + '-v5a-teachfx-gunes');
    await step(120);
    check(await ev(() => { const F = S3._dbg().W.tfx; return !F.pts.visible && !F.beam.visible; }), w + ': teachFx ~2 sn sonra kapanır');
    const oid = await ev(() => S.b.find(b => b.k === 'oksijen').id);
    check(await ev(id => S3.teachFx(id, 'oksijen') === true, oid), w + ': teachFx(oksijen) true (beyaz hava akışı)');
    await step(40); await shot(w + '-v5b-teachfx-oksijen'); await step(120);

    await ev(() => { S3.setMode('walk'); S3.setPlayer(4, 4, Math.PI * 0.75); }); await step(10);
    const offs = await ev(id => { const W = S3._dbg().W, e = W.bmap.get(id), p = S3.project(e.x, e.y + 1, e.z); const vis = !p.behind && p.sx >= 0 && p.sy >= 0 && p.sx <= innerWidth && p.sy <= innerHeight; return { vis, r: S3.teachFx(id, 'gunes') }; }, pid);
    check(offs.vis || offs.r === false, w + ': ekranda olmayan yapıda teachFx false ' + JSON.stringify(offs));

    await ev(() => S3.setMode('plan')); await step(10);
    await ev(() => { const a = S.b.find(b => b.k === 'sera'), c = S.b.find(b => b.k === 'yasam'); a.st = 'guc'; a.broken = false; c.broken = true; c.st = 'ariza'; }); await step(3);
    const wk = await ev(() => { const W = S3._dbg().W, lab = S.b.find(b => b.k === 'sera'), at = S.b.find(b => b.k === 'yasam'); return [W.bmap.get(lab.id).warnK, W.bmap.get(at.id).warnK]; });
    check(wk[0] === 'guc' && wk[1] === 'ariza', w + ': inşa görünümünde elektriksiz yapı şimşek, bozuk yapı anahtar rozeti ' + JSON.stringify(wk));

    await ev(() => { D.crowd(); S3.setMode('drone'); }); await step(5);
    const st0 = await ev(() => { const h = { x: HUBX * 8 + 4, z: HUBY * 8 + 4 }; const W = S3._dbg().W, ob = W.obst; const p = YOL.nearestFree(ob, h.x - 10, h.z - 6, 0.6); S3.setPlayer(p.x, p.z, 0); return p; });
    await step(3);
    const tg = { x: 184, z: 112 };
    check(await ev(t => S3.walkTo(t.x, t.z) === true && S3.walking, tg), w + ': walkTo uzak hedef kabul edilir');
    const wp = await ev(() => S3.walkPath);
    await small(() => ev(() => D.step(60 * 50, 1 / 60)));
    const end = await ev(() => ({ p: S3.player, walking: S3.walking, g: S3.walkPath }));
    const dEnd = Math.hypot(end.p.x - wp.goal.x, end.p.z - wp.goal.z);
    check(!end.walking && dEnd < 1.5, `${w}: dokun-yürü uzak hedefe vardı (${dEnd.toFixed(1)} m kaldı, ara nokta ${wp.path.length}, yol ${wp.found ? 'bulundu' : 'yok'})`);
    await ev(() => S3.setMode('walk')); await step(5);
  }
}

if (!ONLY || ONLY === 'v5f') {
  console.log('ay (v5f):', await ev(() => D.setup('ay', 1234)));
  check(await ev(() => typeof S3.camFreeze === 'function'), 'v5f: S3.camFreeze var');
  await ev(() => { D.t(24 * 2 + 9, 0.3); D.hook(); S3.clickWalk(true); S3.setMode('drone'); S3.setPlayer(HUBX * 8 + 4, HUBY * 8 + 20, 0); }); await step(20);

  const camPos = () => ev(() => { const c = S3._dbg().cam.position; return { x: c.x, y: c.y, z: c.z, v: S3._v5f().cam }; });
  await step(10, 1 / 6);
  await ev(() => { S3.camFreeze(true); S3.walkTo(HUBX * 8 + 4 + 40, HUBY * 8 + 20 + 16); });
  const pm0 = await ev(() => S3.player); const f0 = await camPos(); await step(18, 1 / 6); const f1 = await camPos();
  const pm = await ev(() => S3.player);
  check(Math.hypot(f1.x - f0.x, f1.y - f0.y, f1.z - f0.z) < 0.01, `v5f: camFreeze açıkken 3 sn boyunca kamera yerinde (oyuncu ${Math.hypot(pm.x - pm0.x, pm.z - pm0.z).toFixed(1)} m yürüdü, kamera ${Math.hypot(f1.x - f0.x, f1.z - f0.z).toFixed(3)} m)`);
  await ev(() => S3.camFreeze(false)); await step(12, 1 / 6); const f2 = await camPos();
  check(Math.hypot(f2.x - f1.x, f2.z - f1.z) > 0.5, `v5f: camFreeze kapanınca tıkla-yürü izleme geri gelir (${Math.hypot(f2.x - f1.x, f2.z - f1.z).toFixed(1)} m)`);

  await ev(() => { S.train = true; S3.walkTo(S3.player.x, S3.player.z); }); await step(6, 1 / 6);
  const f3 = await camPos(); await step(18, 1 / 6); const f4 = await camPos();
  check(Math.hypot(f4.x - f3.x, f4.z - f3.z) < 0.01, 'v5f: eğitimde oyuncu dururken kamera kendiliğinden kaymaz');

  await ev(() => { S3.camFreeze(true); S3.setMode('plan'); }); await step(10, 1 / 6);
  const pf = await ev(() => { S3.planFocus(HUBX + 4, HUBY + 2); const a = S3._v5f().cam; S3.planFocus(HUBX - 5, HUBY - 3); return { a, b: S3._v5f().cam }; });
  await step(12, 1 / 6); const pf2 = await ev(() => S3._v5f().cam);
  const HX = await ev(() => HUBX);
  check(Math.abs(pf.a.x - ((HX + 4) * 8 + 4)) < 0.01 && Math.hypot(pf2.x - pf.a.x, pf2.z - pf.a.z) < 0.01, 'v5f: donukken inşa odağı bir kez yerleşir, sonra kaymaz ' + JSON.stringify({ a: pf.a, son: pf2 }));
  await ev(() => { S3.camFreeze(false); S3.setMode('drone'); S.train = false; }); await step(10, 1 / 6);

  const gt = await ev(() => { const tx = HUBX + 3, ty = HUBY + 3; S3.setGoal({ x: tx * 8 + 4, z: ty * 8 + 4 }); return { tx, ty }; });
  await ev(() => { S3.setPlayer(HUBX * 8 + 4 - 30, HUBY * 8 + 4 + 30, 0); }); await step(6, 1 / 6);
  const gs = await ev(t => D.tileScreen(t.tx, t.ty), gt);
  const tapAt = async (x, y) => { await page.mouse.move(x, y); await step(1); await page.mouse.down(); await page.mouse.up(); await step(2); return ev(() => ({ tap: S3._v5f().tap, aim: { tx: S3.aim.tx, ty: S3.aim.ty }, wk: S3.walkPath })); };
  const n1 = await tapAt(gs[0] + 30, gs[1] + 8);
  check(n1.tap && n1.tap.what === 'goal' && n1.aim.tx === gt.tx && n1.aim.ty === gt.ty && n1.wk && Math.hypot(n1.wk.goal.x - (gt.tx * 8 + 4), n1.wk.goal.z - (gt.ty * 8 + 4)) < 0.5, 'v5f: işaretin ~31 px yanına dokunuş hedefi seçer ve oraya yürütür ' + JSON.stringify(n1.tap));
  const n2 = await tapAt(gs[0] + 70, gs[1] + 30);
  check(!n2.tap, 'v5f: 70 px uzaktaki dokunuş hedefe yapışmaz');

  await ev(() => { const mk = (id, x, y, w, h) => { const d = document.createElement('div'); d.id = id; d.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:rgba(255,0,0,.25);pointer-events:none;z-index:5`; document.body.appendChild(d); }; mk('egSkip', 10, 60, 56, 44); mk('objective', 480, 10, 406, 46); S.train = true; S3.camFreeze(true); const p = S3.player; S3.setPlayer(p.x, p.z, 0); });
  await step(6, 1 / 6);
  const place = await ev(() => {
    const { cam, THREE } = S3._dbg(), v = new THREE.Vector3(40 / innerWidth * 2 - 1, -(135 / innerHeight) * 2 + 1, 0.5).unproject(cam).sub(cam.position).normalize();
    let t = 0; for (let i = 0; i < 6; i++) { const q = cam.position.clone().addScaledVector(v, t); t = (cam.position.y - S3.hAt(q.x, q.z)) / -v.y; }
    const g = cam.position.clone().addScaledVector(v, t); S3.setGoal({ x: g.x, z: g.z }); const p = S3.project(g.x, S3.hAt(g.x, g.z), g.z); return { d: Math.hypot(p.sx - 40, p.sy - 135) }; });
  await step(4, 1 / 6);
  place.d2 = await ev(() => { const g = S3.goal, p = S3.project(g.x, S3.hAt(g.x, g.z), g.z); return Math.hypot(p.sx - 40, p.sy - 135); });
  const tg = await ev(() => { const r = S3._v5f(); const ov = q => !!r.tagGo && r.tagGo.x0 < q.x + q.w && r.tagGo.x1 > q.x && r.tagGo.y0 < q.y + q.h && r.tagGo.y1 > q.y; return { pos: r.tag.go, r: r.tagGo, skip: ov({ x: 10, y: 60, w: 56, h: 44 }), obj: ov({ x: 480, y: 10, w: 406, h: 46 }) }; });
  check(!tg.skip && !tg.obj && tg.pos !== 'ust', `v5f: "Buraya dokun" etiketi "Geç" ve hedef kartıyla çakışmaz, yeri kaydı (yer: ${tg.pos}, işaret ${place.d2.toFixed(0)} px şaşmalı)`);
  await ev(() => S3.camFreeze(false));
  await shot('ay-v5f-a-etiket');

  await ev(() => { S.train = false; S3.setGoal(null); S3.setMode('plan'); S3.setPlayer(HUBX * 8 + 4 + 8, HUBY * 8 + 4 + 8, 0); }); await step(10, 1 / 6);
  const me0 = await ev(() => S3._v5f());
  check(me0.tag.mePx > 0 && me0.tag.mePx <= 14, `v5f: inşa görünümünde "Sen" yazısı ≤14 px (${me0.tag.mePx} px)`);
  await ev(r => { const d = document.createElement('div'); d.id = 'planLabel'; d.style.cssText = `position:fixed;left:${Math.round(r.x0) - 20}px;top:${Math.round(r.y0) - 4}px;width:${Math.round(r.x1 - r.x0) + 40}px;height:${Math.round(r.y1 - r.y0) + 8}px;background:rgba(0,255,0,.25);pointer-events:none`; document.body.appendChild(d); }, me0.tagMe);
  await step(4, 1 / 6);
  const me1 = await ev(() => { const r = S3._v5f(), q = document.getElementById('planLabel').getBoundingClientRect(); return { pos: r.tag.me, ov: !!r.tagMe && r.tagMe.x0 < q.right && r.tagMe.x1 > q.left && r.tagMe.y0 < q.bottom && r.tagMe.y1 > q.top }; });
  check(!me1.ov && me1.pos !== 'ust', `v5f: "Sen" etiketi inşa etiketinin üstüne binmez (yer: ${me1.pos})`);
  await shot('ay-v5f-b-sen');
  await ev(() => document.getElementById('planLabel').remove());

  const hs = await ev(() => {
    const occ = S.b.find(b => b.k === 'gunes'); S3.setBuildHints({ best: { tx: occ.x, ty: occ.y } }); const a = S3._v5f().hints.best;
    let fog = null; for (let i = 0; i < S.map.seen.length && !fog; i++) if (!S.map.seen[i] && S.map.k[i] === '.') fog = { tx: i % MAPW, ty: Math.floor(i / MAPW) };
    S3.setBuildHints({ best: fog }); const b = S3._v5f().hints.best;
    const fr = D.free(); S3.setBuildHints({ best: { tx: fr[0], ty: fr[1] } }); const c = S3._v5f().hints.best;
    return { dolu: a, karanlik: b, bos: c, fr };
  });
  check(hs.dolu === null && hs.karanlik === null && hs.bos && hs.bos.tx === hs.fr[0], 'v5f: yıldız dolu ve karanlık kareye konmaz, boş kareye konur ' + JSON.stringify(hs));
  await ev(f => S3.planFocus(f[0], f[1]), hs.fr); await step(12, 1 / 6);
  const ss = await ev(f => D.tileScreen(f[0], f[1]), hs.fr);
  const n3 = await tapAt(ss[0] + 28, ss[1] - 40);
  check(n3.tap && n3.tap.what === 'star' && n3.aim.tx === hs.fr[0] && n3.aim.ty === hs.fr[1], 'v5f: yıldızın yakınına dokunuş yıldız karesini seçer ' + JSON.stringify(n3.tap));
  await ev(f => { const r = build(S, 'batarya', f[0], f[1]); return r.ok; }, hs.fr); await step(20, 1 / 6);
  check(await ev(() => S3._v5f().hints.best === null), 'v5f: yıldızın karesine yapı kurulunca yıldız kalkar');
  await ev(() => S3.setBuildHints(null));

  await ev(() => S3.setMode('drone')); await step(10, 1 / 6);
  const oid = await ev(() => S.b.find(b => b.k === 'oksijen').id);
  const c0 = await ev(() => { D.step(2); return S3.stats().calls; });
  check(await ev(id => S3.teachFx(id, 'oksijen') === true, oid), 'v5f: teachFx(oksijen) true');
  await step(20);
  const tf = await ev(() => ({ on: S3.teachFxOn, calls: (D.step(1), S3.stats().calls) }));
  check(tf.on && tf.on.ico && tf.on.grp === 'hava', 'v5f: teachFx yapının üstünde grup renginde simge gösterir ' + JSON.stringify(tf.on));
  check(tf.calls - c0 <= 5, `v5f: teachFx çizim çağrısı sınırlı (${c0} → ${tf.calls})`);
  await shot('ay-v5f-c-teachfx');
  await step(40, 1 / 10);
  check(await ev(() => !S3.teachFxOn && !S3._dbg().W.tfxIco.visible), 'v5f: teachFx ~2,4 sn sonra kapanır (simge dahil)');

  await ev(() => { const b = S.b.find(o => o.k === 'sera'); b.broken = true; b.st = 'ariza'; }); await step(3);
  const bz = await ev(() => { const W = S3._dbg().W, b = S.b.find(o => o.k === 'sera'), e = W.bmap.get(b.id); return { k: e.warnK, vis: !!e.warn && e.warn.visible, sc: e.warn ? e.warn.scale.x : 0 }; });
  check(bz.k === 'ariza' && bz.vis && bz.sc > 1.3, 'v5f: bozuk yapının üstünde kırmızı ünlem rozeti ' + JSON.stringify(bz));
  await shot('ay-v5f-d-bozuk');
}

if (!ONLY || ONLY === 'look') {
  const LOOKS = {
    a: { suit: '#ff7a2f', visor: '#b8862c', rover: { body: '#e6e5e0', trim: '#2f5fa8' }, craft: { band: '#2f5fa8', nose: '#c8372d' }, bld: { trim: '#2f5fa8' }, patch: { shape: 'daire', bg: '#2f5fa8', sym: null, text: 'UFUK-1 · DEMO' } },
    b: { suit: '#3b8ee8', visor: '#aeb8c4', rover: { body: '#f2c230', trim: '#2c2f35' }, craft: { band: '#1fa3b5', nose: '#2f5fa8' }, bld: { trim: '#e8b62c' }, patch: { shape: 'kalkan', bg: '#6d4bc4', sym: 'roket', text: 'UFUK-1 · DEMO' } },
    c: { suit: '#9b6bff', visor: '#3a5f9e', rover: { body: '#3f8cff', trim: '#e6e5e0' }, craft: { band: '#6d4bc4', nose: '#e8b62c' }, bld: { trim: '#6d4bc4' }, patch: { shape: 'altigen', bg: '#1fa3b5', sym: 'buz', text: 'UFUK-2 · DEMO' } },
  };
  const calls = () => ev(() => { D.step(2); return S3.stats().calls; });

  const fastAdv = async n => { const vp = page.viewportSize(); await page.setViewportSize({ width: 240, height: 136 }); await ev(n => D.adv(n, 1 / 30), n); await page.setViewportSize(vp); await step(2); };
  for (const w of ['ay', 'mars']) {

    const day = w === 'ay' ? 24 * 2 + 9 : 24 * 3 + 10, night = w === 'ay' ? 9 * 24 + 40 : 24 * 4 + 1;
    console.log(w + ' (görünüş):', await ev(([w, seed]) => D.setup(w, seed), [w, w === 'ay' ? 1234 : 777]));
    await ev(t => { S3.setMode('walk'); D.t(t, 0.3); S3.setPlayer(100, 72, 0.4); }, day); await step(20);
    check(await ev(() => !!S3.rover && typeof S3.setLook === 'function' && typeof S3.showcase === 'function'), w + ': S3.setLook, S3.showcase, S3.rover var');

    await ev(L => S3.setLook(L), LOOKS.a); await calls();
    const c0 = await calls();
    await ev(L => S3.setLook(L), LOOKS.b); const c1 = await calls();
    await ev(L => S3.setLook(L), LOOKS.c); const c2 = await calls();
    await ev(L => S3.setLook(L), LOOKS.a); const c3 = await calls();
    check(c0 === c1 && c1 === c2 && c2 === c3, `${w}: setLook çizim çağrısını değiştirmez (${c0}, ${c1}, ${c2}, ${c3})`);
    check(await ev(() => { const r = S3.setLook({ suit: 'turuncu', bld: { trim: 5 } }); return r === true; }), w + ': hex olmayan değerler hatasız yok sayılır');
    check(await ev(() => S3.setLook(null) === false), w + ': setLook(null) false döner');

    const crewOk = await ev(() => { const W = S3._dbg().W; return W.crew.length > 0; });
    check(crewOk, w + ': ekip sahnede');

    const r0 = await ev(() => S3.rover);
    await fastAdv(420);
    const r1 = await ev(() => S3.rover);
    check(Math.hypot(r1.x - r0.x, r1.z - r0.z) > 3 || r1.st !== 'park', `${w}: gezgin gündüz yola çıkar (${r0.st} → ${r1.st}, ${Math.hypot(r1.x - r0.x, r1.z - r0.z).toFixed(1)} m)`);
    const rz = await ev(() => S3.rover);
    await ev(() => D.step(30));
    const rz2 = await ev(() => S3.rover);
    check(rz.x === rz2.x && rz.z === rz2.z, w + ': zaman durunca gezgin durur');
    await ev(([x, z]) => { S3.setPlayer(x + 1.5, z + 9, Math.atan2(1.5, 9)); }, [r1.x, r1.z]); await step(20);
    await shot(w + '-k1-gezgin-gunduz');
    await ev(t => D.t(t, 0.3), night); await fastAdv(700);
    const rn = await ev(() => S3.rover);
    check(rn.lights && (rn.st === 'park' || rn.st === 'back'), `${w}: gece gezgin üsse döner, farlar yanık (${rn.st}, ışık ${rn.lights})`);
    await ev(([x, z]) => { S3.setPlayer(x + 1.5, z + 9, Math.atan2(1.5, 9)); }, [rn.x, rn.z]); await step(20);
    await shot(w + '-k2-gezgin-gece');
    await ev(t => D.t(t, 0.3), day); await step(10);

    check(await ev(() => S3.showcase('player', { side: 'left' }) === true && S3.showing === 'player'), w + ': showcase(player) açılır');
    for (const k of ['a', 'b', 'c']) {
      await ev(L => S3.setLook(L), LOOKS[k]); await step(40);
      if (w === 'ay' || k === 'a') await shot(`${w}-k3-vitrin-astronot-${k}`);
    }
    const cs = await calls();
    check(cs > 0, w + ': vitrin çizer (' + cs + ' çağrı)');
    await page.setViewportSize({ width: 844, height: 390 }); await step(30);
    await shot(w + '-k4-vitrin-844x390');
    await page.setViewportSize({ width: 1366, height: 768 }); await step(10);

    for (const tg of ['rover', 'hub', 'base']) {
      check(await ev(tg => S3.showcase(tg, { side: 'left' }), tg), `${w}: showcase(${tg})`);
      await step(70); if (w === 'ay' || tg === 'hub') await shot(`${w}-k5-vitrin-${tg}`);
    }
    check(await ev(() => S3.showcase(null) === true && S3.showing === null), w + ': showcase(null) kapatır');
    await step(30);
    check(await ev(() => !S3._dbg().cam.view || !S3._dbg().cam.view.enabled), w + ': kapatınca kamera kayması sıfırlanır');

    await ev(() => { S3.setMode('plan'); }); await step(40);
    await shot(w + '-k6-insa-gorunus-c');
    await ev(L => S3.setLook(L), LOOKS.b); await step(10);
    await shot(w + '-k7-insa-gorunus-b');
    await ev(t => D.t(t, 0.3), night); await step(30);
    await shot(w + '-k8-insa-gece-b');
    await ev(t => { S3.setMode('walk'); D.t(t, 0.3); S3.setPlayer(100, 72, 0.4); }, day); await step(30);
    await ev(L => S3.setLook(L), LOOKS.a); await step(5);
  }

  await ev(L => S3.setLook(L), LOOKS.c);
  await ev(() => D.setup('ay', 99)); await step(10);
  check(await ev(() => { const W = S3._dbg().W; return W && !!W.player; }), 'ay: setLook sonrası load hatasız');
}

if (!ONLY || ONLY === 'intro') {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(pathToFileURL(file).href + '#test');
  await page.waitForFunction(() => typeof THREE !== 'undefined' && window.D, null, { timeout: 20000 });
  const SDIR = process.env.INTRO_SHOTS || out; fs.mkdirSync(SDIR, { recursive: true });
  const jshot = async n => { if (NOSHOT) return; await page.screenshot({ path: path.join(SDIR, n + '.jpg'), type: 'jpeg', quality: 86, timeout: 240000 }); console.log('  ✓', n + '.jpg'); };
  const snap = () => ev(() => {
    const d = S3._dbg(), c = d.cam.position, hub = [...d.W.bmap.values()].find(e => e.k === 'hub');
    let n = 0; d.scene.traverse(() => n++);
    return { cam: [c.x, c.y, c.z], fov: d.cam.fov, hub: [hub.obj.position.x, hub.obj.position.y, hub.obj.position.z], n, pl: [S3.player.x, S3.player.z] };
  });
  const same = (a, b) => a.cam.every((v, i) => Math.abs(v - b.cam[i]) < 0.01) && a.hub.every((v, i) => Math.abs(v - b.hub[i]) < 0.01) && Math.abs(a.fov - b.fov) < 0.01 && a.n === b.n;
  const prep = async (w, seed) => {
    await ev(([w, seed]) => {
      if (!document.getElementById('app')) { const a = document.createElement('div'); a.id = 'app'; a.innerHTML = '<div id="hud" style="position:fixed;left:8px;top:8px;color:#fff;font:14px sans-serif">HUD</div>'; document.body.appendChild(a); }
      D.setup(w, seed); S3.setMode('walk'); D.t(w === 'ay' ? 10 : 24 * 3 + 10, 0.2);
      window.__IL = { done: 0, run: false };
      window.__ILrun = () => { const L = window.__IL; L.run = true; let last = performance.now(); const f = now => { if (!L.run) return; const dt = Math.min(0.1, (now - last) / 1000); last = now; S3.frame(window.S, dt || 1 / 60, now, 0.2); requestAnimationFrame(f); }; requestAnimationFrame(f); };
    }, [w, seed]);
    await step(40);
  };
  const start = () => ev(() => { window.__IL.t0 = performance.now(); return S3.intro({ onDone: () => { window.__IL.done++; window.__IL.at = performance.now() - window.__IL.t0; } }); });
  for (const [w, seed] of [['ay', 7], ['mars', 777]]) {
    await prep(w, seed);
    const pre = await snap();
    check(await ev(() => S3.introActive()) === false, w + ': önce introActive() yanlış');
    check(await start() === true, w + ': S3.intro true döner');
    check(await ev(() => S3.introActive()), w + ': introActive() doğru');
    check(await ev(() => document.getElementById('app').classList.contains('cine') && getComputedStyle(document.getElementById('hud')).visibility === 'hidden'), w + ': #app.cine ve HUD gizli');
    const pn = await ev(() => S3._intro().n); check(pn > 0 && pn <= 400, w + ': parçacık sayısı ≤ 400 (' + pn + ')');
    await ev(() => window.__ILrun());
    await page.waitForTimeout(400);
    check(await ev(() => { const b = document.querySelector('.cine-skip'); return !b.classList.contains('cine-on'); }), w + ': atla düğmesi ilk saniyede görünmez');
    await page.waitForTimeout(1000);
    const sk = await ev(() => { const b = document.querySelector('.cine-skip'), r = b.getBoundingClientRect(), cs = getComputedStyle(b); return { vis: cs.visibility, h: r.height, w: r.width, x: r.right, y: r.bottom, txt: b.textContent }; });
    check(sk.vis === 'visible' && sk.h >= 44 && sk.x > 1000 && sk.y > 500, w + ': 1 sn sonra sağ altta atla düğmesi (' + sk.txt + ', ' + Math.round(sk.w) + 'x' + Math.round(sk.h) + ')');
    await page.mouse.click(400, 300); await page.keyboard.press('KeyW');
    check(await ev(() => S3.introActive() && window.__IL.done === 0), w + ': ekrana tık ve W atlamaz');
    await page.waitForFunction(() => window.__IL.done > 0, null, { timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(300);
    await ev(() => { window.__IL.run = false; }); await page.waitForTimeout(60);
    const at = await ev(() => window.__IL.at || 0);
    check(at >= 7000 && at <= 9500, w + ': kendi kendine 7–9,5 sn içinde biter (' + (at / 1000).toFixed(2) + ' sn)');
    check(await ev(() => window.__IL.done) === 1, w + ': onDone tam bir kez');
    await step(2);
    const post = await snap();
    check(await ev(() => !S3.introActive() && !document.getElementById('app').classList.contains('cine') && !document.querySelector('.cine-root') && getComputedStyle(document.getElementById('hud')).visibility === 'visible'), w + ': bittikten sonra introActive yanlış, cine yok, katman kalktı');
    check(same(pre, post), w + ': kamera, iniş modülü, FOV ve nesne sayısı önceki gibi ' + JSON.stringify({ pre, post }));
    check(Math.abs(pre.pl[0] - post.pl[0]) < 0.01 && Math.abs(pre.pl[1] - post.pl[1]) < 0.01, w + ': astronot yerinde (W ile yürümedi)');

    await ev(() => { window.__IL.done = 0; window.__IL.at = 0; });
    check(await start() === true, w + ': ikinci koşu başlar');
    await ev(() => window.__ILrun()); await page.waitForTimeout(1500);
    await page.keyboard.press('Escape');
    check(await ev(() => !S3.introActive() && window.__IL.done === 1), w + ': Esc anında bitirir, onDone bir kez');
    await page.waitForTimeout(200); await ev(() => { window.__IL.run = false; }); await page.waitForTimeout(60); await step(2);
    check(same(pre, await snap()) && await ev(() => window.__IL.done === 1), w + ': atlamadan sonra aynı son durum');

    const at3 = async (t, n) => { await ev(t => S3._introSeek(t), t); await step(2); await jshot(n); };
    await ev(() => S3.intro({ onDone: () => { window.__IL.done++; } }));
    if (w === 'ay') { await at3(1.0, 'inis-ay-1'); await at3(3.5, 'inis-ay-3'); await at3(6.0, 'inis-ay-6'); }
    else { await at3(3.5, 'inis-mars-3'); await at3(6.0, 'inis-mars-6'); }
    await ev(() => S3.introSkip()); await step(2);
    check(await ev(() => window.__IL.done === 2) && same(pre, await snap()), w + ': introSkip bitirir, son durum aynı');
    if (w === 'ay') {
      await page.setViewportSize({ width: 844, height: 390 }); await step(10);
      await ev(() => S3.intro({})); await at3(3.5, 'inis-tel-3');
      const tl = await ev(() => { const b = document.querySelector('.cine-skip').getBoundingClientRect(), g = document.querySelector('.cine-gauge').getBoundingClientRect(); return { b: [b.left, b.top, b.right, b.bottom], g: [g.left, g.top, g.right, g.bottom] }; });
      check(tl.b[2] <= 844 && tl.b[3] <= 390 && tl.g[0] >= 0 && tl.b[0] > tl.g[2], 'tel: düğme ve gösterge ekranda, çakışmıyor ' + JSON.stringify(tl));
      await ev(() => S3.introSkip()); await page.setViewportSize({ width: 1366, height: 768 }); await step(4);
    }
  }
}
const pageErrs = await ev(() => D.errs);
console.log('\nKare süresi (zorla senkron, ms/kare; cpu = S3.frame JS süresi):');
for (const [n, p] of perf) console.log('  ' + n.padEnd(20), JSON.stringify(p));
const all = errors.concat(pageErrs).filter(e => !/GPU stall|WebGL-|ReadPixels/.test(e));
console.log(all.length ? '\nHATALAR:\n' + all.join('\n') : '\nHata yok.');
console.log(fails.length ? `\nBAŞARISIZ DENETİM (${fails.length}):\n` + fails.join('\n') : 'Denetimler tamam.');
await browser.close();
process.exit(all.some(e => /PAGEERROR|error:/.test(e)) || fails.length ? 1 : 0);
