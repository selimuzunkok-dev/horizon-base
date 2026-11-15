'use strict';


const HARITA = (() => {
  const TS = 8, WM = MAPW * TS, HM = MAPH * TS;
  const COL = { i: '#8fd8ff', m: '#ff9f43', t: '#b59cff', s: '#ffd84a' };

  const C = { ok: '#f2f5fa', bad: '#ff4b3e', badDim: '#7a2018', build: 'rgba(230,238,250,.5)', crew: '#7dffa8', rover: '#ff6ec7', ship: '#d68bff', goal: '#6ff3ff', you: '#fff36b', walk: '#ffffff', fog: '#3a4658' };
  const GROUND = { ay: ['#858c97', '#7d848f'], mars: ['#a65c40', '#9b553b'] };

  const GCOL = { guc: '#ffd84a', hava: '#a9e4ff', su: '#3d9bff', yemek: '#5fe08a', ev: '#f2f5fa', diger: '#ff9f43' };
  const ICO_K = { batarya: 'pil' };
  const grpOf = k => (typeof BLD !== 'undefined' && BLD[k] && BLD[k].group) || 'diger';
  const CSS = `
#hrMini, #hrBig { --hr-line: var(--gl-line, rgba(255,255,255,.18)); --hr-hi: var(--gl-hi, rgba(255,255,255,.5)); --hr-in: var(--gl-in, inset 0 1px 0 rgba(255,255,255,.18));
  --hr-sh: var(--gl-shadow, 0 10px 34px rgba(0, 0, 0, .45), 0 0 0 1px rgba(0, 0, 0, .25)); --hr-sub: var(--gl-sub, rgba(255,255,255,.07)); --hr-sub2: var(--gl-sub-2, rgba(255,255,255,.12));
  --hr-edge: linear-gradient(180deg, var(--hr-hi), rgba(255,255,255,.04) 45%, rgba(255,255,255,.10)); }
#hrMini { position: absolute; right: var(--gut-r, 16px); top: 12px; width: 176px; border-radius: var(--gl-r-ctl, 14px); overflow: hidden; pointer-events: auto; cursor: pointer; padding: 1px;
  background: var(--gl-fill-1, rgb(var(--gl-tint, 12 20 38) / .38)); border: 1px solid var(--hr-line); box-shadow: var(--hr-in), var(--hr-sh); z-index: 3; touch-action: manipulation;
  transition: transform .15s, border-color .15s, box-shadow .15s; }
#hrMini::before { content: ''; position: absolute; inset: 0; z-index: 1; border-radius: inherit; padding: 1px; pointer-events: none; background: var(--hr-edge);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
#hrMini:hover { border-color: rgba(255,255,255,.3); box-shadow: var(--hr-in), var(--hr-sh), 0 0 14px rgba(143,208,255,.16); }
#hrMini[hidden], #hrBig[hidden] { display: none !important; }
#hrMini canvas { display: block; width: 100%; height: auto; border-radius: calc(var(--gl-r-ctl, 14px) - 2px); }
#hrMini:focus-visible { outline: 2px solid var(--accent, #8fd0ff); outline-offset: 2px; }
#hrBig { position: absolute; inset: 0; z-index: 40; pointer-events: auto; display: flex; align-items: center; justify-content: center;
  background: rgba(3,6,12,.66); }
.hr-box { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 10.5px; border-radius: var(--gl-r-modal, 24px);
  background: linear-gradient(180deg, rgba(255, 255, 255, .12), rgba(255, 255, 255, .03) 45%, rgba(255, 255, 255, .05)), var(--gl-fill-3, rgb(var(--gl-tint, 12 20 38) / .84));
  -webkit-backdrop-filter: var(--gl-bf-3, blur(10px) saturate(160%)); backdrop-filter: var(--gl-bf-3, blur(10px) saturate(160%));
  border: 1px solid var(--hr-line); box-shadow: var(--hr-in), 0 16px 50px rgba(0,0,0,.5); max-width: calc(100% - 16px); max-height: calc(100% - 12px); }
.hr-box::before { content: ''; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; pointer-events: none; background: var(--hr-edge);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
.hr-head { align-self: stretch; display: flex; align-items: center; justify-content: space-between; gap: 12px; font: 600 18px var(--f-display, sans-serif); color: #eef2f8; padding-left: 4px; }
.hr-head .hr-tip { flex: 1; text-align: center; }
.hr-wrap { position: relative; }
.hr-name { position: absolute; transform: translate(-50%, -100%); margin-top: -10px; padding: 4.5px 10.5px; border-radius: 10px; background: rgb(var(--gl-tint, 12 20 38) / .94); border: 1px solid rgba(220,235,255,.5);
  box-shadow: var(--hr-in), 0 4px 14px rgba(0,0,0,.45); color: #fff; font: 600 15px var(--f-body, sans-serif); white-space: nowrap; pointer-events: none; }
.hr-name[hidden] { display: none; }
.hr-x { min-width: 44px; min-height: 44px; border-radius: var(--gl-r-ctl, 14px); border: 1px solid var(--hr-line); background: var(--hr-sub); box-shadow: var(--hr-in); color: #fff; font-size: 22px; cursor: pointer;
  transition: transform .12s, background-color .15s, border-color .15s, box-shadow .15s; }
.hr-x:hover { background: var(--hr-sub2); border-color: rgba(255,255,255,.32); transform: translateY(-1px); }
.hr-x:active { transform: none; box-shadow: inset 0 2px 6px rgba(0,0,0,.35); }
.hr-cv { display: block; border-radius: 10px; cursor: crosshair; touch-action: none; box-shadow: 0 0 0 1px var(--hr-line); }
.hr-leg { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 14px; font: 500 15px var(--f-body, sans-serif); color: #e6ecf4;
  background: var(--hr-sub); box-shadow: 0 0 0 4px var(--hr-sub); border-radius: 8px; }
.hr-leg:empty { background: none; box-shadow: none; }
.hr-leg span { display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
.hr-leg canvas { width: 18px; height: 18px; }
.hr-tip { font: 500 14px var(--f-body, sans-serif); color: #c8d4e3; }
@media (max-height: 460px) {
  #hrMini { width: 96px; top: 6px; right: max(8px, env(safe-area-inset-right, 0px)); border-radius: 12px; }
  #hrMini canvas { border-radius: 10px; }
  .hr-box { padding: 6.5px; gap: 4px; border-radius: var(--gl-r-card, 20px); } .hr-head { font-size: 15px; } .hr-leg { font-size: 13px; gap: 2px 10px; box-shadow: 0 0 0 2px var(--hr-sub); } .hr-tip { font-size: 13px; } .hr-leg.hr-g { display: none; }
}`;
  let st = null, mini = null, miniCv = null, bigEl = null, bigCv = null, nameEl = null, hideF = false, bigOn = false, extT = -1e9, lastDraw = -1e9, looping = false;
  let lastPT = 'mouse', pick = null, walkT = null;
  const ground = { cv: null, key: '', items: [] };
  const dbg = { mini: [], big: [], top: 0, lastWalk: null };
  const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const W = (tr, en) => (typeof tx === 'function' && typeof L === 'function' ? tx(L(tr, en)) : tr);
  const S = () => (typeof UI !== 'undefined' && UI ? UI.s : null);
  const S3x = () => (typeof S3 !== 'undefined' && S3 ? S3 : null);

  function css() { if (st || typeof document === 'undefined') return; st = document.createElement('style'); st.id = 'hrCss'; st.textContent = CSS; document.head.appendChild(st); }
  function ensure() {
    if (mini && mini.isConnected) return true;
    const hud = document.getElementById('hud'); if (!hud) return false;
    css();
    mini = document.createElement('div'); mini.id = 'hrMini'; mini.hidden = true; mini.tabIndex = 0; mini.setAttribute('role', 'button');
    miniCv = document.createElement('canvas'); mini.appendChild(miniCv);
    mini.addEventListener('click', e => { e.stopPropagation(); toggle(true); });
    mini.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(true); } });
    hud.appendChild(mini);
    bigEl = document.createElement('div'); bigEl.id = 'hrBig'; bigEl.hidden = true; bigEl.setAttribute('role', 'dialog');

    bigEl.innerHTML = '<div class="hr-box"><div class="hr-head"><span class="hr-t"></span><span class="hr-tip"></span><button class="hr-x" type="button">✕</button></div><div class="hr-wrap"><canvas class="hr-cv"></canvas><div class="hr-name" hidden></div></div><div class="hr-leg"></div><div class="hr-leg hr-g"></div></div>';
    bigCv = bigEl.querySelector('.hr-cv'); nameEl = bigEl.querySelector('.hr-name');
    bigEl.addEventListener('click', e => { if (e.target === bigEl) toggle(false); });
    bigEl.querySelector('.hr-x').addEventListener('click', e => { e.stopPropagation(); toggle(false); });
    bigCv.addEventListener('click', onBigTap);
    bigCv.addEventListener('pointerdown', e => { lastPT = e.pointerType || 'mouse'; });
    bigCv.addEventListener('pointermove', e => { if ((e.pointerType || 'mouse') === 'mouse') hoverAt(e.clientX, e.clientY); });
    bigCv.addEventListener('pointerleave', e => { if ((e.pointerType || 'mouse') === 'mouse') showName(null); });
    hud.appendChild(bigEl);
    return true;
  }


  function geo(w) { const sc = w / WM; return { sc, w, h: Math.round(HM * sc), tile: TS * sc }; }
  const glyph = {
    i(g, x, y, r) { g.fillStyle = COL.i; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.lineWidth = Math.max(1, r * 0.35); g.strokeStyle = 'rgba(0,0,0,.55)'; g.stroke(); },
    m(g, x, y, r) { g.fillStyle = COL.m; g.fillRect(x - r, y - r, r * 2, r * 2); g.lineWidth = Math.max(1, r * 0.3); g.strokeStyle = 'rgba(0,0,0,.55)'; g.strokeRect(x - r, y - r, r * 2, r * 2); },
    t(g, x, y, r) { g.strokeStyle = COL.t; g.lineWidth = Math.max(1.4, r * 0.55); g.beginPath(); g.arc(x, y, r * 0.85, 0, 7); g.stroke(); },
    s(g, x, y, r) { g.fillStyle = COL.s; g.beginPath(); g.moveTo(x, y - r * 1.25); g.lineTo(x + r, y); g.lineTo(x, y + r * 1.25); g.lineTo(x - r, y); g.closePath(); g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,.55)'; g.stroke(); },
    hub(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); g.moveTo(x, y - r * 1.15); g.lineTo(x + r, y - r * 0.15); g.lineTo(x + r * 0.75, y - r * 0.15); g.lineTo(x + r * 0.75, y + r); g.lineTo(x - r * 0.75, y + r); g.lineTo(x - r * 0.75, y - r * 0.15); g.lineTo(x - r, y - r * 0.15); g.closePath(); g.fill(); g.lineWidth = Math.max(1, r * 0.22); g.strokeStyle = 'rgba(0,0,0,.7)'; g.stroke(); },
    bld(g, x, y, r, col, dash) { if (dash) { g.setLineDash([2, 2]); g.strokeStyle = col; g.lineWidth = 1.2; g.strokeRect(x - r, y - r, r * 2, r * 2); g.setLineDash([]); return; } g.fillStyle = col; g.fillRect(x - r, y - r, r * 2, r * 2); g.lineWidth = Math.max(1, r * 0.25); g.strokeStyle = 'rgba(0,0,0,.65)'; g.strokeRect(x - r, y - r, r * 2, r * 2); },
    broken(g, x, y, r, on) { glyph.bld(g, x, y, r, on ? C.bad : C.badDim); if (on) { g.strokeStyle = C.bad; g.lineWidth = Math.max(1.2, r * 0.3); g.beginPath(); g.arc(x, y, r * 1.9, 0, 7); g.stroke(); } },
    crew(g, x, y, r) { g.fillStyle = C.crew; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,.7)'; g.stroke(); },
    rover(g, x, y, r) { g.fillStyle = C.rover; g.beginPath(); g.ellipse(x, y, r * 1.3, r * 0.85, 0, 0, 7); g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,.7)'; g.stroke(); },
    ship(g, x, y, r) { g.fillStyle = C.ship; g.beginPath(); g.moveTo(x, y - r * 1.4); g.lineTo(x + r, y + r); g.lineTo(x - r, y + r); g.closePath(); g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,.7)'; g.stroke(); },
    goal(g, x, y, r, ph) { g.strokeStyle = C.goal; g.lineWidth = Math.max(1.6, r * 0.35); g.globalAlpha = 0.55 + 0.45 * Math.abs(Math.sin(ph)); g.beginPath(); g.arc(x, y, r * (1 + 0.35 * Math.abs(Math.sin(ph))), 0, 7); g.stroke(); g.globalAlpha = 1; g.beginPath(); g.arc(x, y, Math.max(1.2, r * 0.25), 0, 7); g.fillStyle = C.goal; g.fill(); },

    gico(g, x, y, r, grp) {
      g.save(); g.translate(x, y); g.fillStyle = '#10131a'; g.strokeStyle = '#10131a'; g.lineWidth = Math.max(1, r * 0.18); g.lineJoin = 'round'; g.beginPath();
      if (grp === 'pil') { const w = r * 1.2, h = r * 0.7; g.lineWidth = Math.max(1, r * 0.2); g.strokeRect(-w / 2, -h / 2, w, h); g.fillRect(w / 2, -h * 0.22, r * 0.18, h * 0.44); g.fillRect(-w / 2 + r * 0.12, -h / 2 + r * 0.12, w * 0.55, h - r * 0.24); }
      else if (grp === 'guc') { g.moveTo(r * 0.15, -r * 0.8); g.lineTo(-r * 0.45, r * 0.1); g.lineTo(-r * 0.02, r * 0.1); g.lineTo(-r * 0.2, r * 0.8); g.lineTo(r * 0.45, -r * 0.15); g.lineTo(r * 0.02, -r * 0.15); g.closePath(); g.fill(); }
      else if (grp === 'su') { g.moveTo(0, -r * 0.8); g.quadraticCurveTo(r * 0.6, 0, r * 0.45, r * 0.3); g.arc(0, r * 0.3, r * 0.45, 0, Math.PI); g.quadraticCurveTo(-r * 0.6, 0, 0, -r * 0.8); g.fill(); }
      else if (grp === 'hava') { for (const [cx, cy, rr] of [[-r * 0.3, r * 0.2, r * 0.35], [r * 0.3, -r * 0.25, r * 0.3], [r * 0.25, r * 0.4, r * 0.2]]) { g.moveTo(cx + rr, cy); g.arc(cx, cy, rr, 0, 7); } g.stroke(); }
      else if (grp === 'yemek') { g.moveTo(-r * 0.6, r * 0.6); g.quadraticCurveTo(-r * 0.7, -r * 0.6, r * 0.7, -r * 0.7); g.quadraticCurveTo(r * 0.6, r * 0.6, -r * 0.6, r * 0.6); g.fill(); }
      else if (grp === 'ev') { g.moveTo(0, -r * 0.75); g.lineTo(r * 0.7, -r * 0.05); g.lineTo(r * 0.45, -r * 0.05); g.lineTo(r * 0.45, r * 0.7); g.lineTo(-r * 0.45, r * 0.7); g.lineTo(-r * 0.45, -r * 0.05); g.lineTo(-r * 0.7, -r * 0.05); g.closePath(); g.fill(); }
      else { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g.moveTo(Math.cos(a) * r * 0.35, Math.sin(a) * r * 0.35); g.lineTo(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75); } g.stroke(); g.beginPath(); g.arc(0, 0, r * 0.38, 0, 7); g.fill(); }
      g.restore();
    },
    gbld(g, x, y, r, grp, k) { glyph.bld(g, x, y, r, GCOL[grp] || GCOL.diger); if (r >= 5) glyph.gico(g, x, y, r * 0.95, ICO_K[k] || grp); },
    north(g, x, y, r) { g.save(); g.translate(x, y); g.fillStyle = '#ffffff'; g.strokeStyle = 'rgba(0,0,0,.75)'; g.lineWidth = Math.max(1, r * 0.2); g.beginPath(); g.moveTo(0, -r); g.lineTo(r * 0.75, r * 0.85); g.lineTo(0, r * 0.4); g.lineTo(-r * 0.75, r * 0.85); g.closePath(); g.fill(); g.stroke(); g.restore(); },
    walk(g, x, y, r, ph) { g.strokeStyle = C.walk; g.lineWidth = Math.max(1.5, r * 0.3); g.setLineDash([Math.max(2, r * 0.5), Math.max(2, r * 0.4)]); g.globalAlpha = 0.7 + 0.3 * Math.abs(Math.sin(ph)); g.beginPath(); g.arc(x, y, r * (1 + 0.25 * Math.abs(Math.sin(ph))), 0, 7); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; g.fillStyle = C.walk; g.beginPath(); g.arc(x, y, Math.max(1.2, r * 0.22), 0, 7); g.fill(); },

    youRing(g, x, y, r, ph) { g.strokeStyle = C.you; g.lineWidth = Math.max(1.5, r * 0.22); g.globalAlpha = 0.35 + 0.6 * Math.abs(Math.sin(ph)); g.beginPath(); g.arc(x, y, r * (1.35 + 0.35 * Math.abs(Math.sin(ph))), 0, 7); g.stroke(); g.globalAlpha = 1; },

    you(g, x, y, r, ang) { g.save(); g.translate(x, y); g.rotate(ang); g.beginPath(); g.moveTo(0, -r * 1.4); g.lineTo(r, r); g.lineTo(0, r * 0.45); g.lineTo(-r, r); g.closePath(); g.lineJoin = 'round';
      g.fillStyle = 'rgba(255,243,107,.22)'; g.fill(); g.lineWidth = Math.max(2.4, r * 0.42); g.strokeStyle = 'rgba(0,0,0,.8)'; g.stroke(); g.lineWidth = Math.max(1.3, r * 0.22); g.strokeStyle = C.you; g.stroke(); g.restore(); },
  };


  function groundKey(s, w, dpr) {
    let h = 0; const k = s.map.k, sn = s.map.seen;
    for (let i = 0; i < k.length; i++) h = (h * 31 + (sn[i] ? 7 : 1) * (k[i] ? k[i].charCodeAt(0) : 0)) | 0;
    return s.world + '|' + w + '|' + dpr + '|' + h;
  }
  function buildGround(s, w, dpr) {
    const key = groundKey(s, w, dpr); if (ground.cv && ground.key === key) return ground;
    const G = geo(w), cv = ground.cv || document.createElement('canvas');
    cv.width = Math.round(G.w * dpr); cv.height = Math.round(G.h * dpr);
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gc = GROUND[s.world] || GROUND.ay, t = G.tile, items = [];
    g.fillStyle = C.fog; g.fillRect(0, 0, G.w, G.h);
    let fogN = 0;
    for (let ty = 0; ty < MAPH; ty++) for (let tx2 = 0; tx2 < MAPW; tx2++) {
      const i = ty * MAPW + tx2;
      if (s.map.seen[i] !== 1) { fogN++; if ((tx2 + ty) % 2 === 0) { g.fillStyle = 'rgba(120,140,170,.05)'; g.fillRect(tx2 * t, ty * t, t, t); } continue; }
      g.fillStyle = gc[(tx2 + ty) % 2]; g.fillRect(tx2 * t, ty * t, t + 0.5, t + 0.5);
    }

    g.strokeStyle = 'rgba(160,200,255,.25)'; g.lineWidth = 1;
    for (let ty = 0; ty < MAPH; ty++) for (let tx2 = 0; tx2 < MAPW; tx2++) {
      if (s.map.seen[ty * MAPW + tx2] !== 1) continue;
      const sn = (x, y) => x >= 0 && y >= 0 && x < MAPW && y < MAPH && s.map.seen[y * MAPW + x] === 1;
      g.beginPath();
      if (!sn(tx2, ty - 1)) { g.moveTo(tx2 * t, ty * t); g.lineTo((tx2 + 1) * t, ty * t); }
      if (!sn(tx2, ty + 1)) { g.moveTo(tx2 * t, (ty + 1) * t); g.lineTo((tx2 + 1) * t, (ty + 1) * t); }
      if (!sn(tx2 - 1, ty)) { g.moveTo(tx2 * t, ty * t); g.lineTo(tx2 * t, (ty + 1) * t); }
      if (!sn(tx2 + 1, ty)) { g.moveTo((tx2 + 1) * t, ty * t); g.lineTo((tx2 + 1) * t, (ty + 1) * t); }
      g.stroke();
    }
    const r = Math.max(2.4, t * 0.36);
    for (let ty = 0; ty < MAPH; ty++) for (let tx2 = 0; tx2 < MAPW; tx2++) {
      const i = ty * MAPW + tx2, k = s.map.k[i];
      if (!glyph[k] || COL[k] == null || s.map.seen[i] !== 1) continue;
      if (s.b.some(b => b.x === tx2 && b.y === ty)) continue;
      const x = (tx2 + 0.5) * t, y = (ty + 0.5) * t; glyph[k](g, x, y, r);
      items.push({ tip: 'kaynak', k, col: COL[k], x: Math.round(x), y: Math.round(y), tx: tx2, ty });
    }
    items.push({ tip: 'sis', n: fogN, x: 0, y: 0 });
    ground.cv = cv; ground.key = key; ground.items = items;
    return ground;
  }

  function goalPos(s) {
    try { if (typeof EGITIM !== 'undefined' && EGITIM && typeof EGITIM.active === 'function' && EGITIM.active()) { const g = EGITIM.goal(); if (g && g.at && isFinite(g.at.x)) return { x: g.at.x, z: g.at.z }; } } catch (e) {   }
    try { if (typeof currentGoal === 'function') { const g = currentGoal(s); if (g && g.tx != null && g.ty != null) return { x: (g.tx + 0.5) * TS, z: (g.ty + 0.5) * TS }; } } catch (e) {   }
    const S3o = S3x(); try { const g = S3o && S3o.goal; if (g && isFinite(g.x)) return { x: g.x, z: g.z }; } catch (e) {   }
    return null;
  }


  function draw(cv, w, which, now) {
    const s = S(); if (!s || !s.map) return;
    const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1), G = geo(w);
    if (cv.width !== Math.round(G.w * dpr) || cv.height !== Math.round(G.h * dpr)) { cv.width = Math.round(G.w * dpr); cv.height = Math.round(G.h * dpr); }
    cv.style.width = G.w + 'px'; cv.style.height = G.h + 'px';
    const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
    const gr = buildGround(s, w, dpr); g.drawImage(gr.cv, 0, 0);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const items = gr.items.slice(), sc = G.sc, P = (x, z) => [Math.max(0, Math.min(G.w, x * sc)), Math.max(0, Math.min(G.h, z * sc))];
    const big = which === 'big', base = Math.max(big ? 3.2 : 3.2, G.tile * (big ? 0.36 : 0.42)), blink = Math.floor(now / 380) % 2 === 0;

    for (const b of s.b) {
      const [x, y] = P((b.x + 0.5) * TS, (b.y + 0.5) * TS);
      if (b.k === 'hub') { const col = b.broken ? (blink ? C.bad : C.badDim) : C.ok;   glyph.hub(g, x, y, base * 1.5, col); items.push({ tip: 'us', x: Math.round(x), y: Math.round(y), col, broken: !!b.broken, id: b.id }); continue; }
      if (b.broken) { glyph.broken(g, x, y, base, blink); items.push({ tip: 'yapi', k: b.k, id: b.id, x: Math.round(x), y: Math.round(y), col: C.bad, broken: true }); continue; }
      const yap = b.left > 0, grp = grpOf(b.k);

      let col = yap ? C.build : C.ok;
      if (yap) glyph.bld(g, x, y, base, C.build, true);
      else if (big) { col = GCOL[grp] || GCOL.diger; glyph.gbld(g, x, y, base, grp, b.k); }
      else { col = GCOL[grp] || GCOL.diger; glyph.bld(g, x, y, base, col); }
      items.push({ tip: 'yapi', k: b.k, id: b.id, x: Math.round(x), y: Math.round(y), col, grp, broken: false, yapim: yap, guc: b.st === 'guc', sz: Math.round(base * 2 * 10) / 10 });
    }
    const S3o = S3x();

    const ship = typeof UI !== 'undefined' && UI ? UI.ship : null;
    if (ship) { const [x, y] = P((ship.tx + 0.5) * TS, (ship.ty + 0.5) * TS); glyph.ship(g, x, y, base * 1.2); items.push({ tip: 'gemi', x: Math.round(x), y: Math.round(y), col: C.ship }); }

    let rv = null; try { rv = S3o && typeof S3o.roverPos === 'function' ? S3o.roverPos() : null; } catch (e) { rv = null; }
    const driving = !!(S3o && S3o.driving);
    if (rv && !driving) { const [x, y] = P(rv.x, rv.z); glyph.rover(g, x, y, base * 0.85); items.push({ tip: 'gezgin', x: Math.round(x), y: Math.round(y), col: C.rover }); }
    let crew = []; try { crew = S3o && typeof S3o.crewPos === 'function' ? S3o.crewPos() : []; } catch (e) { crew = []; }
    for (const c of crew) { const [x, y] = P(c.x, c.z); glyph.crew(g, x, y, Math.max(1.5, base * 0.55)); items.push({ tip: 'ekip', x: Math.round(x), y: Math.round(y), col: C.crew, name: c.name }); }

    const wt = walkTarget();
    if (wt) { const [x, y] = P(wt.x, wt.z); glyph.walk(g, x, y, base * 1.6, now / 200); items.push({ tip: 'yurume', x: Math.round(x), y: Math.round(y), col: C.walk }); }

    const gp = goalPos(s);
    if (gp) { const [x, y] = P(gp.x, gp.z); glyph.goal(g, x, y, base * 1.5, now / 260); items.push({ tip: 'hedef', x: Math.round(x), y: Math.round(y), col: C.goal }); }

    let pl = null; try { pl = S3o ? S3o.player : null; } catch (e) { pl = null; }
    if (pl && isFinite(pl.x)) {
      const out = pl.x < 0 || pl.z < 0 || pl.x > WM || pl.z > HM, [x, y] = P(pl.x, pl.z);
      const walk = S3o.mode === 'walk' || driving, yaw = pl.yaw || 0;
      const fx = walk ? -Math.sin(yaw) : Math.sin(pl.face != null ? pl.face : yaw + Math.PI), fz = walk ? -Math.cos(yaw) : Math.cos(pl.face != null ? pl.face : yaw + Math.PI);
      const ang = Math.atan2(fz, fx) + Math.PI / 2;
      const yr = big ? base * 1.35 : Math.max(5, base * 1.6);
      glyph.youRing(g, x, y, yr, now / 300);
      glyph.you(g, x, y, yr, ang);
      items.push({ tip: 'oyuncu', x: Math.round(x), y: Math.round(y), col: C.you, kenar: out });
    }

    if (big) { glyph.north(g, G.w - 18, 20, 11); items.push({ tip: 'kuzey', x: G.w - 18, y: 20 }); }
    dbg[which] = items;
  }


  function autoHide() {
    if (hideF) return true;
    if (typeof UI === 'undefined' || !UI || !UI.s) return true;
    if (UI.screen && UI.screen !== 'game') return true;
    if (UI.plan || UI.pda || UI.modal) return true;
    const gm = document.getElementById('game'); if (gm && gm.hidden) return true;
    const hud = document.getElementById('hud'); if (hud && (hud.classList.contains('cine') || hud.classList.contains('side'))) return true;
    const eg = document.getElementById('egDone'); if (eg && !eg.hidden && eg.offsetParent !== null) return true;
    const S3o = S3x(); try { if (S3o && (S3o.scene || S3o.showing)) return true; } catch (e) {   }
    return false;
  }
  function placeMini() {

    let top = null; const tr = document.getElementById('hudTR'), hud = document.getElementById('hud');
    if (tr && hud && tr.offsetParent !== null && tr.childElementCount) {

      const r = tr.getBoundingClientRect(), h = hud.getBoundingClientRect(), mr = mini.getBoundingClientRect();
      const sc = hud.offsetWidth ? h.width / hud.offsetWidth : 1;
      if (r.height > 0 && r.width > 0 && r.right > mr.left + 1 && r.left < mr.right - 1) top = Math.round((r.bottom - h.top) / (sc || 1) + 6);
    }
    const v = top == null ? '' : top + 'px';
    if (mini.style.top !== v) mini.style.top = v;
    dbg.top = top;
  }
  function miniW() { return mini.clientWidth || (typeof innerHeight !== 'undefined' && innerHeight <= 460 ? 96 : 176); }
  function bigSize() {
    const vw = (typeof innerWidth !== 'undefined' ? innerWidth : 1366), vh = (typeof innerHeight !== 'undefined' ? innerHeight : 768), ph = vh <= 460;
    const w = Math.min(vw - (ph ? 28 : 64), (vh - (ph ? 96 : 170)) * WM / HM, 1100);
    return Math.max(160, Math.floor(w));
  }
  function legend() {
    const box = bigEl.querySelector('.hr-leg:not(.hr-g)'), key = (typeof LANG !== 'undefined' ? LANG : 'tr') + (S() ? S().world : '');
    if (box.dataset.k === key) return; box.dataset.k = key; box.innerHTML = '';
    const rows = [['you', W('Sen', 'You')], ['hub', W('Üs', 'Base')], ['i', W('Buz', 'Ice')], ['m', W('Maden', 'Minerals')], ['broken', W('Bozuk yapı', 'Broken')], ['crew', W('Ekip', 'Crew')], ['rover', W('Gezgin', 'Rover')], ['ship', W('Kargo gemisi', 'Cargo ship')], ['goal', W('Hedef', 'Goal')], ['north', W('Kuzey', 'North')]];
    const G2 = typeof GROUPS !== 'undefined' ? GROUPS : {};
    const grpName = k => (G2[k] && typeof tx === 'function' ? tx(G2[k]) : { guc: W('Elektrik', 'Power'), hava: W('Hava', 'Air'), su: W('Su', 'Water'), yemek: W('Yemek', 'Food'), ev: W('Ev', 'Home'), diger: W('Keşif', 'Discover') }[k]);
    const rows2 = ['guc', 'hava', 'su', 'yemek', 'ev', 'diger'].map(k => ['g:' + k, k === 'diger' ? W('Keşif ve Üretim', 'Make & Discover') : grpName(k)]);
    rows2.splice(1, 0, ['g:guc:batarya', W('Batarya', 'Battery')]);
    const put = (el, list) => { for (const [k, label] of list) {
      const sp = document.createElement('span'), cv = document.createElement('canvas'); cv.width = cv.height = 36; cv.dataset.k = k;
      const g = cv.getContext('2d'); g.scale(2, 2);
      if (k === 'hub') glyph.hub(g, 9, 9.5, 6.5, C.ok); else if (k === 'broken') glyph.broken(g, 9, 9, 3.6, true);
      else if (k === 'you') { glyph.youRing(g, 9, 9.5, 4.2, Math.PI / 2); glyph.you(g, 9, 9.5, 4.2, 0); } else if (k === 'goal') glyph.goal(g, 9, 9, 5, Math.PI / 2);
      else if (k === 'north') glyph.north(g, 9, 9, 7); else if (k.startsWith('g:')) { const [, gp, bk] = k.split(':'); glyph.gbld(g, 9, 9, 7.5, gp, bk); } else if (k === 'ship') glyph.ship(g, 9, 10, 5); else glyph[k](g, 9, 9, 5);
      sp.appendChild(cv); sp.appendChild(document.createTextNode(label)); el.appendChild(sp);
    } };
    put(box, rows);
    const box2 = bigEl.querySelector('.hr-leg.hr-g'); box2.innerHTML = ''; put(box2, rows2);
    bigEl.querySelector('.hr-t').textContent = W('Harita', 'Map');
    bigEl.querySelector('.hr-x').setAttribute('aria-label', W('Kapat', 'Close'));
    bigEl.querySelector('.hr-tip').textContent = W('Bir yere dokun: oraya yürü.', 'Tap a spot to walk there.');
    mini.setAttribute('aria-label', W('Harita', 'Map'));
  }

  function step(now) {
    if (typeof document === 'undefined' || !ensure()) return;
    const hid = autoHide();
    if (hid && bigOn) toggle(false);
    if (mini.hidden !== hid) mini.hidden = hid;
    if (hid) return;
    if (now - lastDraw < 100) return;
    lastDraw = now;
    placeMini();
    draw(miniCv, miniW(), 'mini', now);
    if (bigOn) { legend(); draw(bigCv, bigSize(), 'big', now); }
  }


  function bldAt(cx, cy) {
    const r = bigCv.getBoundingClientRect(); if (!r.width) return null;
    const px = cx - r.left, py = cy - r.top, tol = Math.max(10, r.width / MAPW * 0.6);
    let best = null, bd = 1e9;
    for (const it of dbg.big) { if (it.tip !== 'yapi' && it.tip !== 'us') continue; const d = Math.hypot(it.x - px, it.y - py); if (d < tol && d < bd) { bd = d; best = it; } }
    return best;
  }
  function nameOf(it) {
    const s = S(); let k = it.k; if (it.tip === 'us') k = 'hub';
    let n = ''; try { if (typeof bname === 'function' && s) n = tx(bname(s, k)); else if (typeof BLD !== 'undefined' && BLD[k]) n = tx(BLD[k].name); } catch (e) { n = ''; }
    if (it.broken) n += ' · ' + W('bozuk', 'broken');
    return n;
  }
  function showName(it) {
    if (!nameEl) return;
    if (!it) { if (!nameEl.hidden) nameEl.hidden = true; nameEl.dataset.id = ''; return; }
    const t = nameOf(it); if (!t) { nameEl.hidden = true; return; }
    if (nameEl.textContent !== t) nameEl.textContent = t;
    nameEl.style.left = it.x + 'px'; nameEl.style.top = it.y + 'px'; nameEl.dataset.id = String(it.id != null ? it.id : 'us'); nameEl.hidden = false;
  }
  function hoverAt(cx, cy) { showName(bldAt(cx, cy)); }
  function onBigTap(e) {
    const r = bigCv.getBoundingClientRect(); if (!r.width) return;
    e.stopPropagation();
    const it = bldAt(e.clientX, e.clientY);
    if (lastPT === 'touch' && it) {
      const key = String(it.id != null ? it.id : 'us');
      if (!pick || pick !== key) { pick = key; showName(it); return; }
    }
    pick = null;

    const x = it ? it.x / r.width * WM : (e.clientX - r.left) / r.width * WM, z = it ? it.y / r.height * HM : (e.clientY - r.top) / r.height * HM;
    goTo(x, z);
  }

  function walkTarget() {
    if (!walkT) return null;
    const S3o = S3x(); let pl = null; try { pl = S3o ? S3o.player : null; } catch (e) { pl = null; }
    const n = nowMs(), stopped = S3o && !S3o.walking && !S3o.driving && n - walkT.t > 1500;
    if ((pl && Math.hypot(pl.x - walkT.x, pl.z - walkT.z) < 4) || stopped || n - walkT.t > 120000) { walkT = null; return null; }
    return walkT;
  }

  function goTo(x, z) {
    const S3o = S3x(); let how = null;
    try {
      if (S3o && S3o.driving && typeof S3o.driveTo === 'function') { S3o.driveTo(x, z); how = 'drive'; }
      else if (S3o && typeof S3o.walkTo === 'function') { S3o.walkTo(x, z); how = 'walk'; }
      if (how && S3o && typeof S3o.ping === 'function') S3o.ping(x, z);
    } catch (e) { how = null; }
    dbg.lastWalk = { x, z, how };
    try { if (typeof Snd !== 'undefined' && Snd && Snd.play) Snd.play('click'); } catch (e) {   }
    toggle(false);
    if (how) {
      walkT = { x, z, t: nowMs() }; lastDraw = -1e9;

      try { if (typeof toast === 'function') toast(how === 'drive' ? W('Oraya sürüyorsun.', 'Driving there.') : W('Oraya yürüyorsun.', 'Walking there.'), 'info'); } catch (e) {   }
    }
    return !!how;
  }

  function toggle(on) {
    if (typeof document === 'undefined' || !ensure()) return false;
    const want = on == null ? !bigOn : !!on;
    if (want && autoHide()) { bigOn = false; bigEl.hidden = true; return false; }
    bigOn = want; bigEl.hidden = !want;
    pick = null; if (nameEl) showName(null);
    if (want) { legend(); lastDraw = -1e9; step(nowMs()); try { bigEl.querySelector('.hr-x').focus({ preventScroll: true }); } catch (e) {   } }
    else { try { const c = document.getElementById('c3'); if (c && document.activeElement && bigEl.contains(document.activeElement)) c.focus({ preventScroll: true }); } catch (e) {   } }
    return bigOn;
  }

  if (typeof window !== 'undefined') window.addEventListener('keydown', e => {
    if (!bigOn) return;
    if (e.key === 'Escape' || e.code === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); toggle(false); }
  }, true);

  function loop(t) {
    try { requestAnimationFrame(loop); } catch (e) { return; }
    if (t - extT > 1000) { try { step(t); } catch (e) {   } }
  }
  const api = {
    tick(now) { const n = now == null ? nowMs() : now; extT = n; try { step(n); } catch (e) { if (typeof console !== 'undefined') console.error(e); } },
    toggle,
    big: () => bigOn,
    hide(on) { hideF = !!on; if (hideF && bigOn) toggle(false); if (mini) mini.hidden = hideF || autoHide(); return hideF; },
    goTo,
    _debug(which) { return which === 'big' ? dbg.big.slice() : which === 'all' ? { mini: dbg.mini.slice(), big: dbg.big.slice(), top: dbg.top, lastWalk: dbg.lastWalk, groundKey: ground.key, walkT: walkT ? { x: walkT.x, z: walkT.z } : null } : dbg.mini.slice(); },
  };
  if (typeof window !== 'undefined') {
    if (typeof location !== 'undefined' && location.hash === '#test') { window.__uuMods = window.__uuMods || {}; window.__uuMods.HARITA = api; }
    if (typeof requestAnimationFrame === 'function' && !looping) { looping = true; requestAnimationFrame(loop); }
  }
  return api;
})();
