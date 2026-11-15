'use strict';


const OGRET = (() => {
  const fn = f => typeof f === 'function';
  const GAP_MS = 12000;
  const words = t => String(t).split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
  const lang = () => (typeof LANG !== 'undefined' && LANG === 'en' ? 'en' : 'tr');
  const tt = o => (o == null ? '' : typeof o === 'string' ? o : (o[lang()] != null ? o[lang()] : o.tr));
  const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const list = () => (typeof TEACH !== 'undefined' && Array.isArray(TEACH) ? TEACH : []);
  const uiS = () => { try { return typeof UI !== 'undefined' && UI ? UI.s : null; } catch (e) { return null; } };
  const worldOf = s => (s && s.world === 'mars' ? 'mars' : 'ay');
  const forW = (t, w) => !t.w || t.w === w;
  const rec = (id, w) => list().find(t => t.id === id && forW(t, w)) || null;
  const minMs = t => Math.round((2.5 + 0.8 * words(tt(t.say))) * 1000);


  const OWN = {
    ok: '<path fill="#e9eef5" d="M3 9.6h11V5.2L21.4 12 14 18.8v-4.4H3z"/>',
    buz: '<path fill="#9fe3ff" d="M12 2l8.2 5v10L12 22l-8.2-5V7z"/><path fill="#e8f9ff" d="M12 5.4l5 3v2.2l-5-3-5 3V8.4z"/>',
    tas: '<path fill="#a6a8ae" d="M3.4 18.6l1.8-7.4 5-4.6 6.2 1.6 3.6 5.6-1.6 4.8z"/><path fill="#7e8088" d="M10.2 6.6l2 6.6 7.8.6-3.6-5.6z"/>',
    dunya: '<circle cx="12" cy="12" r="10" fill="#2f7fd6"/><path fill="#4cc777" d="M6 7.4c2-1.6 4.6-1 5 .8.4 2-2 2.2-1.6 4.4.4 2.4-2.6 3.4-4.2 1.6C3.8 12 4.2 8.8 6 7.4zM14.6 13.4c1.6-.8 4-.2 4.6 1.4-.6 2-2.6 3.8-4.6 4.2-1.2-1.6-1.4-4.6 0-5.6z"/>',
    ay: '<circle cx="12" cy="12" r="10" fill="#c9cbd1"/><circle cx="8.4" cy="9" r="2.4" fill="#9a9ca4"/><circle cx="15" cy="14.6" r="3" fill="#9a9ca4"/><circle cx="14.4" cy="6.8" r="1.3" fill="#9a9ca4"/>',
    mars: '<circle cx="12" cy="12" r="10" fill="#d0643a"/><path fill="#a3502a" d="M4.6 9.4c3 .8 5.4-.6 8-.2 2.4.4 4.4 1.8 6.8 1.2l.4 2.6c-2.6.8-4.6-.6-7-.8-2.6-.2-5.4 1.2-8.4.2z"/>',
    toz: '<circle cx="6" cy="15" r="2.2" fill="#c9b79a"/><circle cx="11" cy="11" r="2.6" fill="#c9b79a"/><circle cx="16.6" cy="14.4" r="2" fill="#c9b79a"/><circle cx="13.6" cy="18.4" r="1.6" fill="#c9b79a"/><circle cx="8.4" cy="19.4" r="1.4" fill="#c9b79a"/><circle cx="17.4" cy="8.4" r="1.4" fill="#c9b79a"/>',
    kar: '<g stroke="#bfe8ff" stroke-width="2.4" stroke-linecap="round"><path d="M12 2.6v18.8M3.9 7.3l16.2 9.4M3.9 16.7l16.2-9.4"/></g>',
    bulut: '<path fill="#d9dee8" d="M6.6 18.6a4.2 4.2 0 0 1-.6-8.4 6 6 0 0 1 11.4-1.4 4.9 4.9 0 0 1 .8 9.8z"/><text x="12" y="16.4" text-anchor="middle" font-size="6.4" font-weight="700" fill="#3b4250" font-family="system-ui,sans-serif">CO₂</text>',
    magara: '<path fill="#8b8d94" d="M1.6 20.4C2.6 9 7 4 12 4s9.4 5 10.4 16.4z"/><path fill="#22252c" d="M6.6 20.4C7.2 13.2 9.4 10 12 10s4.8 3.2 5.4 10.4z"/>',
    kas: '<g fill="#ff9a3c"><rect x="1.6" y="8" width="3.6" height="8" rx="1.2"/><rect x="18.8" y="8" width="3.6" height="8" rx="1.2"/><rect x="5" y="6.4" width="3" height="11.2" rx="1"/><rect x="16" y="6.4" width="3" height="11.2" rx="1"/><rect x="8" y="10.6" width="8" height="2.8" rx="1"/></g>',
  };
  const COLOR = { sun: '#ffc53d', bolt: '#ffc53d', o2: '#38c6f0', drop: '#3f8cff', apple: '#4cc777', sprout: '#4cc777', rad: '#ff6fb5', flare: '#ff8a3c',
    night: '#8fa2ff', meteor: '#ff9a3c', wrench: '#9fb2c8', parts: '#9fb2c8', bricks: '#d39a5c', flask: '#8f7cff', rocket: '#e9eef5', crate: '#d39a5c',
    loop: '#2fd3b5', bed: '#b79cff', smile: '#ff9a3c', radio: '#2fd3b5', chat: '#9cf0d2', clock: '#cfd6e4', check: '#54d98c', x: '#ff5d4d', off: '#ff5d4d',
    shield: '#7fd0ff', storm: '#d6b48a', wave: '#cfd6e4' };
  function iconHtml(name, sz) {
    if (name.startsWith('b:')) return `<canvas class="og-b" data-k="${escH(name.slice(2))}" style="width:${sz + 6}px;height:${sz + 6}px"></canvas>`;
    const own = OWN[name];
    if (own) return `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" aria-hidden="true">${own}</svg>`;
    let p = null;
    try { if (typeof ICON_SET !== 'undefined' && ICON_SET && ICON_SET[name]) p = ICON_SET[name]; } catch (e) { p = null; }
    if (p) return `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" style="color:${COLOR[name] || '#e9eef5'}" aria-hidden="true">${p}</svg>`;
    return `<svg data-miss="1" viewBox="0 0 24 24" width="${sz}" height="${sz}" aria-hidden="true"><circle cx="12" cy="12" r="6" fill="#cfd6e4"/></svg>`;
  }

  const B_GLYPH = { hub: 'home', gunes: 'sun', batarya: 'bolt', reaktor: 'rad', oksijen: 'o2', su: 'drop', geri: 'loop', sera: 'sprout', yasam: 'bed', spor: 'smile', anten: 'radio', maden: 'bricks', atolye: 'parts', lab: 'flask', pist: 'rocket' };
  function blankCv(cv) {
    try { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; for (let i = 3; i < d.length; i += 8) if (d[i] > 8) return false; return true; } catch (e) { return false; }
  }
  function paintB(root, w) {
    if (!root) return;
    root.querySelectorAll('canvas.og-b').forEach(cv => {
      let bad = typeof drawIcon !== 'function';
      try { cv.getContext('2d', { willReadFrequently: true }); } catch (e) {   }
      if (!bad) try { drawIcon(cv, cv.dataset.k, w); } catch (e) { bad = true; }
      if (bad || blankCv(cv)) {
        try {
          const sz = Math.max(16, (parseFloat(cv.style.width) || 44) - 6), sp = document.createElement('span');
          sp.className = 'og-bf'; sp.dataset.k = cv.dataset.k; sp.innerHTML = iconHtml(B_GLYPH[cv.dataset.k] || 'gear', sz);
          sp.style.cssText = 'display:inline-flex;padding:2px;border-radius:10px;background:var(--gl-sub-2,rgba(255,255,255,.12));box-shadow:inset 0 1px 0 rgba(255,255,255,.14)';
          cv.replaceWith(sp);
        } catch (e) {   }
      }
    });
  }
  function flowHtml(t, sz, anim) {
    const f = Array.isArray(t.flow) && t.flow.length ? t.flow : ['info'];
    return f.map((n, i) => `<span class="og-i${n === 'ok' ? ' og-ar' : ''}"${anim ? ` style="animation-delay:${(i * 0.12).toFixed(2)}s"` : ''}>${iconHtml(n, n === 'ok' ? Math.round(sz * 0.62) : sz)}</span>`).join('');
  }


  const CSS = `#ogCard.og-card{position:absolute;z-index:26;left:16px;top:200px;width:min(280px,42vw);box-sizing:border-box;padding:10.5px 12.5px 9.5px;border-radius:var(--gl-r-card,20px);
background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.03) 45%,rgba(255,255,255,.05)),linear-gradient(rgb(var(--gl-tint,12 20 38) / .18),rgb(var(--gl-tint,12 20 38) / .18)),var(--gl-fill-2,rgb(var(--gl-tint,12 20 38) / .56));-webkit-backdrop-filter:var(--gl-bf-2,blur(22px) saturate(160%));backdrop-filter:var(--gl-bf-2,blur(22px) saturate(160%));
border:1px solid rgba(255,214,102,.5);box-shadow:var(--gl-in,inset 0 1px 0 rgba(255,255,255,.18)),var(--gl-shadow,0 10px 34px rgba(0,0,0,.45),0 0 0 1px rgba(0,0,0,.25)),0 0 18px rgba(255,214,102,.14);color:#eef2f8;
font-family:'IBM Plex Sans',system-ui,sans-serif;text-shadow:0 1px 2px rgba(0,0,0,.35);cursor:pointer;pointer-events:auto;animation:ogin .18s ease-out both;transition:transform .15s,box-shadow .15s}
#ogCard.og-card::before{content:'';position:absolute;inset:-1px;border-radius:inherit;padding:1px;pointer-events:none;background:linear-gradient(180deg,var(--gl-hi,rgba(255,255,255,.5)),rgba(255,255,255,.04) 45%,rgba(255,255,255,.10));
-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
#ogCard.og-card:hover{border-color:rgba(255,214,102,.75);box-shadow:var(--gl-in,inset 0 1px 0 rgba(255,255,255,.18)),var(--gl-shadow,0 10px 34px rgba(0,0,0,.45),0 0 0 1px rgba(0,0,0,.25)),0 0 22px rgba(255,214,102,.24)}
#ogCard.og-card[hidden]{display:none}#ogCard.og-out{animation:ogout .3s ease both}
.og-flow{display:flex;align-items:center;gap:4px;flex-wrap:nowrap;min-height:46px;margin-bottom:6px}
.og-i{display:inline-flex;align-items:center;justify-content:center;animation:ogpop .35s ease backwards}.og-i svg,.og-i canvas{display:block}
.og-ar{animation:ogar .4s ease backwards}
.og-t{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#ffd666;margin:0 0 2px}
.og-say{font-size:17px;line-height:1.32;font-weight:500;margin:0}
.og-foot{margin-top:7px;padding-top:5px;border-top:1px solid var(--gl-line,rgba(255,255,255,.18));font-size:12px;color:#b8c2d1;display:flex;align-items:center;gap:6px}
.og-foot b{color:#ffd666;font-weight:700}
#ogCard.og-sm{padding:7.5px 9.5px 7.5px;width:min(250px,40vw)}#ogCard.og-sm .og-flow{min-height:32px;margin-bottom:3px}#ogCard.og-sm .og-say{font-size:15px}#ogCard.og-sm .og-t{font-size:12px}#ogCard.og-sm .og-foot{display:none}
.og-flow{overflow:hidden;max-width:100%}
#ogCard.og-line{display:flex;align-items:center;gap:8px;padding:6.5px 10.5px;width:min(420px,60vw);max-height:64px}#ogCard.og-line .og-flow{flex:0 0 auto;max-width:42%;min-height:0;margin:0}
#ogCard .og-src{margin-top:5px}#ogCard.og-sm .og-src{margin-top:3px;font-size:12px}#ogCard.og-line .og-src{display:none}
#ogCard.og-line .og-t,#ogCard.og-line .og-foot{display:none}#ogCard.og-line .og-say{font-size:14px;line-height:1.25;flex:1;min-width:0;max-height:52px;overflow:hidden}
@keyframes ogin{from{transform:translateX(-12px)}to{transform:none}}@keyframes ogout{to{opacity:0;transform:translateX(-14px)}}
@keyframes ogpop{from{transform:scale(.6)}to{transform:none}}@keyframes ogar{from{transform:translateX(-6px)}to{transform:none}}
@media (prefers-reduced-motion:reduce){#ogCard.og-card{animation:none}}
.og-nb{font-family:'IBM Plex Sans',system-ui,sans-serif}.og-nb-top{display:flex;align-items:center;gap:10px;margin:0 0 10px}.og-nb-top b{font-size:18px}
.og-bar{flex:1;height:10px;border-radius:99px;background:var(--gl-sub-2,rgba(255,255,255,.12));box-shadow:inset 0 1px 2px rgba(0,0,0,.35);overflow:hidden}.og-bar i{display:block;height:100%;background:linear-gradient(180deg,#ffe49a,#ffd666);border-radius:99px;box-shadow:0 0 8px rgba(255,214,102,.45)}
.og-n{font-weight:700;color:#ffd666;font-size:16px;white-space:nowrap}
.og-g{margin:12px 0 4px;font-size:13px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#b8c2d1;display:flex;justify-content:space-between}
.og-row{display:flex;gap:10px;align-items:flex-start;padding:8px 6px;border-bottom:1px solid var(--gl-line,rgba(255,255,255,.18));border-radius:var(--gl-r-ctl,14px) var(--gl-r-ctl,14px) 0 0;transition:background-color .15s}
.og-row:hover{background:var(--gl-sub,rgba(255,255,255,.07))}
.og-row .og-ic{flex:0 0 auto;display:flex;align-items:center;gap:2px;min-width:52px}.og-row .og-tx{flex:1;min-width:0}
.og-row .og-rt{font-weight:700;font-size:14px;color:#ffd666}.og-row .og-rs{font-size:15px;line-height:1.35}
.og-row details{margin-top:3px;font-size:14px;color:#cfd6e4}.og-row summary{cursor:pointer;color:#9cf0d2;min-height:28px;display:flex;align-items:center}
.og-row small{display:block;color:#98a2b3;font-size:12px;margin-top:2px}
.og-lock{display:flex;flex-wrap:wrap;gap:6px;padding:8px 6px}.og-lock span{width:30px;height:30px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;
background:var(--gl-sub,rgba(255,255,255,.07));border:1px dashed rgba(255,255,255,.22);color:#98a2b3;font-weight:700}
.og-lock em{font-style:normal;color:#98a2b3;font-size:13px;align-self:center;margin-left:4px}`;
  const FOOT = { tr: ['Defterim\'e eklendi', 'Defterim'], en: ['Added to My Notebook', 'My Notebook'] };

  const SRC_SVG = '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M4 1.5h5.2L13 5.3v8.2c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1v-11c0-.6.4-1 1-1zm4.8 1.2V6h3.1zM5 8.2v1.1h6V8.2zm0 2.4v1.1h4.6v-1.1z"/></svg>';
  const srcOf = t => { const v = (t.say && t.say.src) || (t.more && t.more.src) || t.src; return typeof v === 'string' && v.trim() ? v.trim() : null; };
  function srcChip(t) {
    const src = srcOf(t); if (!src) return '';
    const s = src.replace(/^NASA (?!·)/, 'NASA · ').split(';')[0].split(' · ').slice(0, 2).join(' · ').trim();
    return `<span class="src-chip og-src" title="${escH(src)}">${SRC_SVG}<span>${lang() === 'en' ? 'Source:' : 'Kaynak:'} ${escH(s)}</span></span>`;
  }
  let el = null;
  function css() {
    if (typeof document === 'undefined') return;
    try { if (!document.getElementById('og-css')) { const st = document.createElement('style'); st.id = 'og-css'; st.textContent = CSS; document.head.appendChild(st); } } catch (e) {   }
  }
  function cardEl() {
    if (typeof document === 'undefined') return null;
    if (el && el.isConnected) return el;
    css();
    try {
      el = document.getElementById('ogCard');
      if (!el) {
        el = document.createElement('div'); el.id = 'ogCard'; el.className = 'og-card'; el.hidden = true;
        el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
        el.addEventListener('pointerdown', e => { e.stopPropagation(); });
        el.addEventListener('click', e => { e.stopPropagation(); close(true); });
        (document.getElementById('hud') || document.body).appendChild(el);
      }
    } catch (e) { el = null; }
    return el;
  }


  const vis = e => { if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); if (!r.width || !r.height) return null; try { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return null; } catch (x) {   } return r; };
  const OBST = ['#gauges', '#sub', '#drawer', '#drawer .gchips', '#drRes', '#hudTL', '#hudTC', '#objective', '#objHow', '#pwWarn', '#egShow', '.ik-card', '#ikQuick', '#scanCard', '#acts', '#hrMini', '#egSkip', '#egStep', '#toasts', '#calls'];

  function fitFlow(e) {
    const f = e && e.querySelector('.og-flow'); if (!f || !cur) return;
    const r = rec(cur.id, worldOf(uiS())); if (!r) return;
    let sz = cur.sz || 38;
    for (let k = 0; k < 4 && f.scrollWidth > f.clientWidth + 1 && sz > 16; k++) {
      sz = Math.max(16, Math.floor(sz * f.clientWidth / f.scrollWidth) - 1);
      f.innerHTML = flowHtml(r, sz, false); paintB(f, worldOf(uiS()));
    }
    cur.sz = sz;
  }
  function layout(line) {
    if (!el || el.hidden || typeof document === 'undefined') return;
    try {
      const W = window.innerWidth, H = window.innerHeight;
      const hostR = (el.offsetParent || document.body).getBoundingClientRect();
      const g = vis(document.getElementById('gauges'));
      const col = g && g.height > g.width * 1.3;
      el.classList.toggle('og-sm', H < 520 || W < 560);
      if (!line) el.classList.remove('og-line'); else el.classList.add('og-line');
      fitFlow(el);
      let left = col ? g.right + 8 : Math.max(16, g ? g.left : 16);
      const w = el.offsetWidth;
      if (left + w > W - 8) left = Math.max(16, W - 8 - w);
      const x0 = left, x1 = left + w;
      const rects = [];
      for (const sel of OBST) document.querySelectorAll(sel).forEach(e => { if (e === el || el.contains(e)) return; const r = vis(e); if (r && r.right > x0 && r.left < x1 && !(r.width >= W * 0.98 && r.height >= H * 0.9)) rects.push(r); });

      let segs = [[8, H - 8]];
      for (const r of rects) {
        const next = [];
        for (const [a, b] of segs) { if (r.bottom <= a || r.top >= b) { next.push([a, b]); continue; } if (r.top - a > 0) next.push([a, r.top]); if (b - r.bottom > 0) next.push([r.bottom, b]); }
        segs = next;
      }
      const h = el.offsetHeight;
      const fit = segs.filter(([a, b]) => b - a >= h + 16);
      let top;
      if (fit.length) { const [a, b] = col ? fit[0] : fit[fit.length - 1]; top = col ? a + 8 : b - 8 - h; }
      else if (!line) { return layout(true); }
      else if (vis(document.getElementById('sub'))) return false;
      else { const big = segs.reduce((m, s) => (s[1] - s[0] > m[1] - m[0] ? s : m), [8, 8]); top = big[0] + Math.max(0, (big[1] - big[0] - h) / 2); }
      el.style.left = Math.round(left - hostR.left) + 'px';
      el.style.top = Math.round(top - hostR.top) + 'px';

      try {
        const tf = getComputedStyle(el).transform, m = tf && tf !== 'none' && typeof DOMMatrixReadOnly === 'function' ? new DOMMatrixReadOnly(tf) : null;
        const rr = el.getBoundingClientRect(), rl = rr.left - (m ? m.m41 : 0), rt = rr.top - (m ? m.m42 : 0);
        if (Math.abs(rl - left) > 1) el.style.left = Math.round(parseFloat(el.style.left) + left - rl) + 'px';
        if (Math.abs(rt - top) > 1) el.style.top = Math.round(parseFloat(el.style.top) + top - rt) + 'px';
      } catch (x) {   }
    } catch (e) {   }
    return true;
  }

  function place() { const okL = layout() !== false; if (el) el.style.visibility = okL ? '' : 'hidden'; if (cur) cur.wait = !okL; return okL; }


  let Q = [];
  let cur = null;
  let lastClose = -1e9, lastExt = 0, lastLay = 0, lastT = 0, lastBlock = -1e9;
  const UNBLOCK_MS = 1000;
  let sRef = null, seenSet = {}, localLearn = {};
  const learned = s => (s && s.learn && typeof s.learn === 'object' ? s.learn : localLearn);
  function syncS(s) {
    if (s === sRef) return;
    sRef = s; seenSet = {}; localLearn = {}; Q = [];
    if (cur) close(false);
  }
  function blocked() {
    try {
      if (typeof ISKART !== 'undefined' && ISKART && fn(ISKART.quickOpen) && ISKART.quickOpen()) return true;
      if (typeof ISKART !== 'undefined' && ISKART && fn(ISKART.open) && ISKART.open()) return true;
      if (typeof HARITA !== 'undefined' && HARITA && fn(HARITA.big) && HARITA.big()) return true;
      if (typeof UI !== 'undefined' && UI && (UI.modal || UI.pda)) return true;
      if (typeof document !== 'undefined') for (const id of ['egDone', 'ikQuick']) if (vis(document.getElementById(id))) return true;
      if (typeof document !== 'undefined') {
        const ch = document.getElementById('chapter');
        if (ch && !ch.hidden && ch.classList.contains('go') && fn(ch.getAnimations) && ch.getAnimations().some(a => a.playState === 'running')) return true;
      }
    } catch (e) {   }
    return false;
  }
  function show(id, t) {
    const s = uiS(), w = worldOf(s), r = rec(id, w);
    if (!r) return false;
    const e = cardEl(); if (!e) return false;
    const L2 = lang();
    e.dataset.id = id;
    e.innerHTML = `<div class="og-flow">${flowHtml(r, 38, true)}</div><p class="og-t">${escH(tt(r.t))}</p><p class="og-say">${escH(tt(r.say))}</p>${srcChip(r)}` +
      `<div class="og-foot">${iconHtml('blueprint', 14)}<span>${escH(FOOT[L2][0])}</span></div>`;
    e.classList.remove('og-out'); e.hidden = false;
    paintB(e, w);
    cur = { id, t0: t, min: minMs(r), held: 0 };
    place(); lastLay = t;
    try { if (typeof Snd !== 'undefined' && Snd && fn(Snd.play)) Snd.play('scan'); } catch (x) {   }
    try { if (typeof S3 !== 'undefined' && S3 && fn(S3.teachFx) && s) { const k = String(r.on).startsWith('build:') ? r.on.slice(6) : null; const b = k && s.b ? s.b.filter(o => o.k === k).pop() : null; S3.teachFx(b ? b.id : null, k); } } catch (x) {   }
    return true;
  }
  function close(byTap) {
    if (!cur) return;
    const t = now();
    if (el) { el.classList.add('og-out'); const e2 = el; setTimeout(() => { if (!cur && e2) e2.hidden = true; }, 300); }
    api.last = { id: cur.id, ms: Math.round(t - cur.t0 - cur.held), tap: !!byTap };
    cur = null; lastClose = t;
  }
  function pull(s) {
    try {
      if (s && s.fx && Array.isArray(s.fx.teach) && s.fx.teach.length) for (const id of s.fx.teach.splice(0)) if (!Q.includes(id) && (!cur || cur.id !== id)) Q.push(id);
    } catch (e) {   }
  }
  function step(t) {
    const s = uiS();
    syncS(s);
    pull(s);
    const dt = lastT ? Math.max(0, Math.min(1000, t - lastT)) : 0; lastT = t;
    const b0 = blocked();
    if (b0) lastBlock = t;
    const b = b0 || t - lastBlock < UNBLOCK_MS;
    if (cur) {
      if (b) { cur.held += dt; if (el && !el.hidden) el.style.visibility = 'hidden'; return; }
      if ((el && el.style.visibility === 'hidden' && !cur.wait) || t - lastLay > 300) { place(); lastLay = t; }
      if (cur.wait) { cur.held += dt; return; }
      if (t - cur.t0 - cur.held >= cur.min + 1200) { close(false); return; }
      return;
    }
    if (!Q.length || b || t - lastClose < GAP_MS) return;
    while (Q.length && !show(Q.shift(), t)) {   }
  }

  function tick() { lastExt = now(); try { step(now()); } catch (e) {   } }


  const GROUPS = [
    { id: 'yapi', tr: 'Yapılar', en: 'Buildings', is: t => String(t.on).startsWith('build:') },
    { id: 'olay', tr: 'Olaylar', en: 'Events', is: t => String(t.on).startsWith('ev:') || /^first:(?!gorev)/.test(t.on) },
    { id: 'yer', tr: { ay: 'Ay', mars: 'Mars' }, en: { ay: 'The Moon', mars: 'Mars' }, is: t => String(t.on).startsWith('tara:') || String(t.on).startsWith('gun:') || t.on === 'first:gorev' },
  ];
  function count() {
    const s = uiS(), w = worldOf(s), L0 = learned(s);
    const all = list().filter(t => forW(t, w));
    const ids = [...new Set(all.map(t => t.id))];
    return { have: ids.filter(id => L0[id] != null).length, total: ids.length };
  }
  function notebook() {
    const s = uiS(), w = worldOf(s), L2 = lang(), L0 = learned(s);
    const all = list().filter(t => forW(t, w));
    const c = count();
    const pct = c.total ? Math.round(100 * c.have / c.total) : 0;
    const title = L2 === 'en' ? 'My Notebook' : 'Defterim';
    let h = `<div class="og-nb" data-have="${c.have}" data-total="${c.total}"><div class="og-nb-top"><b>${title}</b><span class="og-bar"><i style="width:${pct}%"></i></span><span class="og-n">${c.have}/${c.total}</span></div>`;
    for (const g of GROUPS) {
      const items = all.filter(g.is);
      if (!items.length) continue;
      const got = items.filter(t => L0[t.id] != null).sort((a, b) => L0[a.id] - L0[b.id]);
      const lock = items.length - got.length;
      const gn = typeof g[L2] === 'object' ? g[L2][w] : g[L2];
      h += `<div class="og-g" data-g="${g.id}"><span>${escH(gn)}</span><span>${got.length}/${items.length}</span></div>`;
      for (const t of got) {
        const f = (t.flow || []).filter(n => n !== 'ok');
        const ic = [f[0], f[f.length - 1]].filter((v, i, a) => v && a.indexOf(v) === i).map(n => iconHtml(n, 24)).join('');
        const more = t.more ? `<details><summary>${L2 === 'en' ? 'More' : 'Daha fazla'}</summary>${escH(tt(t.more))}${t.more.src ? `<small>${escH(t.more.src)}</small>` : ''}</details>` : '';
        h += `<div class="og-row" data-id="${escH(t.id)}"><span class="og-ic">${ic}</span><span class="og-tx"><span class="og-rt">${escH(tt(t.t))}</span><div class="og-rs">${escH(tt(t.say))}</div>${more}</span></div>`;
      }
      if (lock) h += `<div class="og-lock" data-lock="${lock}">${'<span>?</span>'.repeat(lock)}<em>${L2 === 'en' ? `${lock} still to discover` : `${lock} tane daha keşfedilecek`}</em></div>`;
    }
    return h + '</div>';
  }

  function paint(root) { paintB(root || (typeof document !== 'undefined' ? document : null), worldOf(uiS())); }
  function fresh() {
    const s = uiS(); syncS(s);
    const L0 = learned(s), w = worldOf(s);
    return [...new Set(list().filter(t => forW(t, w)).map(t => t.id))].filter(id => L0[id] != null && !seenSet[id]).length;
  }
  function seen() { const s = uiS(); syncS(s); const L0 = learned(s); for (const id in L0) seenSet[id] = 1; }
  function open() { return !!cur && !!el && !el.hidden; }

  function push(id) {
    const s = uiS(); syncS(s);
    if (!s || !s.learn) localLearn[id] = s ? s.t || 0 : 0;
    if (!Q.includes(id)) Q.push(id);
    return true;
  }


  if (typeof requestAnimationFrame === 'function') {
    const loop = () => { try { if (now() - lastExt > 1000) step(now()); } catch (e) {   } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  var api = { tick, open, notebook, count, fresh, seen, push, paint, icons: Object.keys(OWN), minMs, last: null,
    _state: () => ({ q: Q.slice(), cur: cur ? Object.assign({}, cur) : null, lastClose }), _close: () => close(true), _clear: () => { if (cur) close(true); Q = []; lastClose = 0; }, _layout: () => place(),
    _flow: id => { const r = rec(id, worldOf(uiS())); return r ? flowHtml(r, 38, true) : null; }, _ids: w => [...new Set(list().filter(t => forW(t, w || worldOf(uiS()))).map(t => t.id))] };
  try { if (typeof location !== 'undefined' && location.hash === '#test' && typeof window !== 'undefined') { window.__uuMods = window.__uuMods || {}; window.__uuMods.OGRET = api; } } catch (e) {   }
  return api;
})();
