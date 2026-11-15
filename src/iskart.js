

const ISKART = (() => {
  const CFG = { gap: 45000, gapTrain: 3000, life: 25000, show: 4000, plain: 4000, late: 1000, perWord: 350, timeupMs: 20000 };
  const NAME = { scan: L('Yeri inceliyorsun', 'You are scanning the ground'), cargo: L('Kargoyu boşaltıyorsun', 'You are unloading cargo') };
  const DONE = { scan: L('İnceleme bitti.', 'Scan done.'), cargo: L('Kargo boşaldı.', 'Cargo unloaded.') };
  const TIMEUP = L('Süre doldu. Bir şey kaybetmedin.', 'Time is up. Nothing was lost.');
  const ICN = { scan: 'scan', cargo: 'ship' };
  const CARD_ACTS = ['scan', 'cargo'];
  const SRC = L('Kaynak', 'Source');

  const SRC_SVG = '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M4 1.5h5.2L13 5.3v8.2c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1v-11c0-.6.4-1 1-1zm4.8 1.2V6h3.1zM5 8.2v1.1h6V8.2zm0 2.4v1.1h4.6v-1.1z"/></svg>';
  const chip = src => {
    if (!src || typeof src !== 'string') return '';
    const t = src.trim().replace(/^NASA (?!·)/, 'NASA · ').split(';')[0].split(' · ').slice(0, 2).join(' · ').trim();
    return `<span class="src-chip" title="${H(src)}">${SRC_SVG}<span>${H(T_(SRC))}: ${H(t)}</span></span>`;
  };
  const CSS = `
#ikCard, #ikQuick { --ik-f3: var(--gl-fill-3, rgb(var(--gl-tint, 12 20 38) / .84)); --ik-bf3: var(--gl-bf-3, blur(10px) saturate(160%)); --ik-line: var(--gl-line, rgba(255, 255, 255, .18));
  --ik-hi: var(--gl-hi, rgba(255, 255, 255, .5)); --ik-in: var(--gl-in, inset 0 1px 0 rgba(255, 255, 255, .18)); --ik-sh: var(--gl-shadow, 0 10px 34px rgba(0, 0, 0, .45), 0 0 0 1px rgba(0, 0, 0, .25));
  --ik-sub: var(--gl-sub, rgba(255, 255, 255, .07)); --ik-sub2: var(--gl-sub-2, rgba(255, 255, 255, .12)); }
#ikCard { position: absolute; z-index: 6; width: min(420px, calc(100% - 32px)); pointer-events: auto; box-sizing: border-box; padding: 13px 15px 15px;
  border-radius: var(--gl-r-card, 20px); background: linear-gradient(180deg, rgba(255, 255, 255, .12), rgba(255, 255, 255, .03) 45%, rgba(255, 255, 255, .05)), var(--ik-f3); -webkit-backdrop-filter: var(--ik-bf3); backdrop-filter: var(--ik-bf3);
  border: 1px solid rgba(255, 154, 60, .62); color: #f3f6fa; text-shadow: none;
  box-shadow: var(--ik-in), var(--ik-sh), 0 0 18px rgba(255, 154, 60, .2), 0 0 0 0 rgba(255, 154, 60, .5); animation: ik-in .18s ease-out, ik-glow 1.6s ease-out 1; font-size: 16px; line-height: 1.3; }
#ikCard::before { content: ''; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; pointer-events: none;
  background: linear-gradient(180deg, var(--ik-hi), rgba(255, 255, 255, .04) 45%, rgba(255, 255, 255, .10));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
#ikCard.ik-atlas { border-color: rgba(95, 224, 208, .6); box-shadow: var(--ik-in), var(--ik-sh), 0 0 18px rgba(95, 224, 208, .2), 0 0 0 0 rgba(95, 224, 208, .45); }
#ikCard .ik-head { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 15px; letter-spacing: .02em; color: #ffc48a; margin-bottom: 6px; }
#ikCard.ik-atlas .ik-head { color: #9cf0e4; }
#ikCard .ik-head svg { width: 22px; height: 22px; flex: none; }
#ikCard .ik-q { font-size: 21px; font-weight: 700; margin: 2px 0 10px; }
#ikCard .ik-ch { display: grid; gap: 8px; }
#ikCard .ik-ch button { min-height: 48px; padding: 8px 12px; border-radius: var(--gl-r-ctl, 14px); border: 1px solid var(--ik-line); background: var(--ik-sub); box-shadow: var(--ik-in);
  color: inherit; font: inherit; font-size: 18px; font-weight: 600; text-align: left; cursor: pointer; transition: transform .12s, background-color .15s, border-color .15s, box-shadow .15s; }
#ikCard .ik-ch button:hover:not(:disabled) { background: var(--ik-sub2); border-color: rgba(255, 255, 255, .3); transform: translateY(-1px); }
#ikCard .ik-ch button:active:not(:disabled) { transform: none; box-shadow: inset 0 2px 6px rgba(0, 0, 0, .35); }
#ikCard .ik-ch button:disabled { cursor: default; color: rgba(243, 246, 250, .45); background: rgba(255, 255, 255, .03); border-color: rgba(255, 255, 255, .08); box-shadow: none; pointer-events: none; }
#ikCard .ik-sub { margin-top: 4px; font-size: 17px; font-weight: 600; color: #f3f6fa; }
#ikCard .ik-ch button.ik-right { color: #f3f6fa; background: rgba(84, 217, 140, .24); border-color: #54d98c; box-shadow: var(--ik-in), 0 0 14px rgba(84, 217, 140, .32); }
#ikCard .ik-ch button.ik-wrong { color: #f3f6fa; background: rgba(255, 93, 77, .24); border-color: #ff5d4d; box-shadow: var(--ik-in), 0 0 14px rgba(255, 93, 77, .3); }
#ikCard .ik-res { margin-top: 10px; font-size: 18px; font-weight: 700; }
#ikCard .ik-res.ok { color: #7ff0ae; } #ikCard .ik-res.no { color: #ffb0a6; } #ikCard .ik-res.plain { color: #dfe6ee; }
#ikCard .ik-why { margin-top: 4px; font-size: 16px; color: #e8edf3; }
#ikCard .ik-right-l { margin-top: 4px; font-size: 16px; font-weight: 700; color: #8ff3b8; }
#ikCard .ik-go { display: block; margin: 8px 0 0 auto; min-width: 96px; min-height: 44px; padding: 6px 16px; border-radius: var(--gl-r-ctl, 14px); border: 0; color: #1a1408; font: inherit; font-weight: 800; cursor: pointer;
  background: linear-gradient(180deg, color-mix(in srgb, #ffb547 88%, #fff), #ffb547); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .5), 0 4px 16px rgba(255, 181, 71, .32); transition: transform .12s, box-shadow .15s; }
#ikCard .ik-go:hover { transform: translateY(-1px); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .55), 0 6px 20px rgba(255, 181, 71, .42); }
#ikCard .ik-go:active { transform: none; box-shadow: inset 0 2px 6px rgba(0, 0, 0, .28); }
#ikCard .ik-real { margin-top: 6px; font-size: 14px; line-height: 1.35; color: #c3ccd7; } #ikCard .ik-real i { display: block; margin-top: 4px; font-size: 12px; line-height: 1.35; font-style: normal; color: #a9b4c1; }
#ikCard .ik-bar { position: absolute; left: 14px; right: 14px; bottom: 6px; height: 3px; border-radius: 3px; background: var(--ik-sub2); overflow: hidden; }
#ikCard .ik-bar b { display: block; height: 100%; width: 100%; background: currentColor; color: #ff9a3c; transform-origin: left; box-shadow: 0 0 6px currentColor; }
#ikCard.ik-atlas .ik-bar b { color: #5fe0d0; }
#ikCard .ik-tail { position: absolute; width: 14px; height: 14px; background: rgb(var(--gl-tint, 12 20 38) / .92); border: inherit; border-top: 0; border-left: 0; transform: rotate(45deg); bottom: -9px; left: calc(50% - 7px);
  clip-path: polygon(100% -4px, 100% 100%, -4px 100%); }
#ikCard.ik-band .ik-tail { display: none; }
#ikCard.ik-below .ik-tail { bottom: auto; top: -9px; transform: rotate(-135deg); }
#hud:has(#ikCard:not([hidden])) #scanCard { display: none; }
@media (max-height: 460px) {
  #ikCard { width: min(560px, calc(100% - 32px)); padding: 9px 13px 13px; }
  #ikCard .ik-head { font-size: 13px; margin-bottom: 2px; } #ikCard .ik-head svg { width: 18px; height: 18px; }
  #ikCard .ik-q { font-size: 18px; margin: 0 0 6px; }
  #ikCard .ik-ch { grid-template-columns: 1fr 1fr; gap: 6px; } #ikCard .ik-ch button { min-height: 40px; padding: 6px 10px; font-size: 16px; }
  #ikCard .ik-res { margin-top: 6px; font-size: 16px; } #ikCard .ik-why { font-size: 14px; } #ikCard .ik-real { display: none; } }
@keyframes ik-in { from { transform: translateY(10px) scale(.98); } to { transform: none; } }
@keyframes ik-glow { 0% { box-shadow: var(--ik-in), var(--ik-sh), 0 0 18px rgba(255, 200, 120, .2), 0 0 0 0 rgba(255, 200, 120, .55); } 100% { box-shadow: var(--ik-in), var(--ik-sh), 0 0 18px rgba(255, 200, 120, .2), 0 0 0 16px rgba(255, 200, 120, 0); } }
@media (prefers-reduced-motion: reduce) { #ikCard { animation: none; } }`;

  let styled = false, box = null, cur = null, lastClose = -1e9, extT = -1e9, cand = null, seen = {}, looping = false, lastS = null;


  const U = () => { try { return typeof UI !== 'undefined' ? UI : null; } catch (e) { return null; } };
  const S3x = () => { try { return typeof S3 !== 'undefined' ? S3 : null; } catch (e) { return null; } };
  const snd = n => { try { if (typeof Snd !== 'undefined') Snd.play(n); } catch (e) {   } };
  const icon = n => { try { return typeof ico === 'function' ? ico(n) : ''; } catch (e) { return ''; } };
  const after = () => {
    try { if (typeof pumpLog === 'function') pumpLog(); } catch (e) {   }
    try { if (typeof pumpRadio === 'function') pumpRadio(); } catch (e) {   }
    try { if (typeof pumpCalls === 'function') pumpCalls(); } catch (e) {   }
    try { if (typeof refresh === 'function') refresh(true); } catch (e) {   }
  };
  const tile = (x, y) => { try { if (typeof wpos === 'function') return wpos(x, y); } catch (e) {   } return { x: x * 8 + 4, z: y * 8 + 4 }; };
  const gY = (x, z) => { try { return typeof groundY === 'function' ? groundY(x, z) : 0; } catch (e) { return 0; } };
  const H = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const T_ = o => (o == null ? '' : tx(o));
  const now0 = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  function state() {
    const u = U();
    if (!u || u.screen !== 'game' || !u.s || u.s.over) return null;
    return u.s;
  }
  const isTrain = s => !!(s && s.train) || !!(U() && U().train);
  function blocked(act) {
    const u = U(); if (!u) return true;
    if (u.pda) return true;
    if (qk) return true;
    if (u.modal) return true;
    if (u.plan) return true;
    return false;
  }
  const gapOk = (s, t) => t - lastClose >= (isTrain(s) ? CFG.gapTrain : CFG.gap);


  function ensure() {
    if (typeof document === 'undefined') return null;
    if (!styled) { const st = document.createElement('style'); st.id = 'ik-style'; st.textContent = CSS; document.head.appendChild(st); styled = true; }
    if (!box || !box.isConnected) {
      box = document.createElement('div'); box.id = 'ikCard'; box.hidden = true; box.setAttribute('role', 'group');
      (document.getElementById('hud') || document.body).appendChild(box);
      guard(box);
      box.addEventListener('click', e => { const b = e.target.closest('button[data-ik]'); if (b && !b.disabled) { e.stopPropagation(); pick(+b.dataset.ik); return; } if (cur && cur.needGo) { if (e.target.closest('.ik-go') && now0() - cur.doneAt > 400) { e.stopPropagation(); hide(); } return; } if (cur && cur.doneAt && now0() - cur.doneAt > 400) { e.stopPropagation(); hide(); } });
    }
    return box;
  }

  function mix(list, seed) {
    const a = list.slice(); let r = (seed * 2654435761) >>> 0;
    for (let i = a.length - 1; i > 0; i--) { r = (Math.imul(r ^ (r >>> 15), 2246822519) + 0x9e3779b9) >>> 0; const j = r % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    if (a.length > 1 && a[0] === list[0] && seed % 2 === 0) a.push(a.shift());
    return a;
  }


  function anchorOf(s, ev) {
    if (!ev) return null;
    if (ev.act === 'scan' && ev.x != null) return { tx: ev.x, ty: ev.y };
    if (ev.act === 'cargo') { const u = U(); return u && u.ship ? { tx: u.ship.tx, ty: u.ship.ty } : null; }
    return null;
  }
  function openWork(s, ev, q, t) {
    const n = s.level === 'kasif' ? Math.min(2, q.a.length) : q.a.length;
    const order = mix([...Array(n).keys()], (q.qi + 1) * 31 + s.t);
    cur = { kind: 'work', act: ev.act, ev, q, order, t0: t, anchor: anchorOf(s, ev) };
    render(); snd('tick'); ping(cur.anchor);
  }
  function openAtlas(s, p, t) {
    const ev = EVENTS[p.id]; if (!ev || !ev.q) return false;
    let vis = ev.ch.map((c, i) => i).filter(i => !ev.ch[i].hide && (!ev.ch[i].en || ev.ch[i].en(s, p)));
    if (s.level === 'kasif' && vis.length > 2) { const ok = vis.find(i => ev.ch[i].ok); vis = [ok, vis.find(i => i !== ok)]; }
    if (vis.length < 2) return false;
    seen[p.pid] = 1;
    cur = { kind: 'atlas', pid: p.pid, id: p.id, order: mix(vis, p.pid * 17 + s.t), t0: t, anchor: null };
    render(); snd('tick');
    return true;
  }
  function render() {
    const el = ensure(); if (!el || !cur) return;
    const s = state();
    let head, q, opts;
    if (cur.kind === 'work') {
      head = `${icon(ICN[cur.act])}<span>${H(T_(NAME[cur.act]))}</span>`;
      q = T_(cur.q.q);
      opts = cur.order.map(i => `<button type="button" data-ik="${i}">${H(T_(cur.q.a[i]))}</button>`).join('');
    } else {
      const ev = EVENTS[cur.id];
      const tt = T_(ev.title); head = `${icon('atlas')}<span>${/atlas/i.test(tt) ? H(tt) : 'ATLAS · ' + H(tt)}</span>`;
      q = T_(ev.q);
      opts = cur.order.map(i => `<button type="button" data-ik="${i}">${H(T_(ev.ch[i].l))}</button>`).join('');
    }
    el.className = cur.kind === 'work' ? 'ik-work' : 'ik-atlas';
    el.dataset.kind = cur.kind; el.dataset.act = cur.act || ''; el.dataset.pid = cur.pid != null ? String(cur.pid) : '';
    el.innerHTML = `<div class="ik-head">${head}</div><div class="ik-q">${H(q)}</div><div class="ik-ch">${opts}</div><div class="ik-out"></div><div class="ik-bar"><b></b></div><span class="ik-tail"></span>`;
    el.hidden = false;
    void s;
    place();
  }
  function ping(a) { const S = S3x(); if (!a || !S || typeof S.ping !== 'function') return; try { const w = tile(a.tx, a.ty); S.ping(w.x, w.z); } catch (e) {   } }


  function bandLimits() {
    const vh = window.innerHeight || 768, sub = document.getElementById('sub');
    let bottom = vh - 196;
    const tc = document.getElementById('hudTC');
    let top = 86;

    if (sub && !sub.hidden && !sub.classList.contains('held')) { const r = sub.getBoundingClientRect(); if (r.height > 0) { if (r.top > vh / 2) bottom = Math.min(bottom, r.top - 10); else top = Math.max(top, r.bottom + 10); } }
    if (tc) { const r = tc.getBoundingClientRect(); if (r.height > 0 && r.bottom < vh / 2) top = Math.max(top, r.bottom + 8); }
    return { top, bottom };
  }


  function place() {
    if (!box || box.hidden || !cur) return;
    const vw = window.innerWidth || 1366, w = box.offsetWidth || 400, h = box.offsetHeight || 200, lim = bandLimits();
    if (cur.pos && cur.pos.vw === vw) {
      const y0 = Math.max(lim.top, Math.min(lim.bottom - h, cur.pos.y));
      const t = Math.round(y0) + 'px'; if (box.style.top !== t) box.style.top = t;
      return;
    }
    let x = null, y = null, below = false;
    const S = S3x(), vh = window.innerHeight || 768;
    if (cur.anchor && S && typeof S.project === 'function') {
      try {
        const wp = tile(cur.anchor.tx, cur.anchor.ty), p = S.project(wp.x, gY(wp.x, wp.z) + 5, wp.z);
        if (p && !p.behind && p.sx > 0 && p.sx < vw && p.sy > 0 && p.sy < vh) {
          x = p.sx - w / 2; y = p.sy - h - 18;
          if (y < lim.top) { y = p.sy + 26; below = true; }
        }
      } catch (e) { x = null; }
    }
    const band = x == null;
    if (band) { x = (vw - w) / 2; y = lim.bottom - h; }
    x = Math.max(16, Math.min(vw - w - 16, x));
    y = Math.max(lim.top, Math.min(lim.bottom - h, y));
    box.classList.toggle('ik-band', band); box.classList.toggle('ik-below', !band && below);
    box.style.left = Math.round(x) + 'px'; box.style.top = Math.round(y) + 'px';
    cur.pos = { x, y, vw };
  }

  function guard(el) {
    const stop = e => { e.stopPropagation(); };

    for (const ev of ['pointerdown', 'mousedown', 'touchstart', 'wheel', 'contextmenu', 'dblclick']) el.addEventListener(ev, stop);
  }


  function pick(i) {
    const s = state(); if (!cur || cur.doneAt || !s) return;
    if (cur.kind === 'work') {
      const r = workAnswer(s, cur.q.qi, i, cur.ev);
      if (!r) { hide(); return; }
      finish(r.ok, r.line, r.ok ? null : r.e, null, i, 0, null, cur.q.src);
    } else {

      let pv = null; try { const p = s.pending.find(o => o.pid === cur.pid); if (p && typeof choiceDelta === 'function') pv = choiceDelta(s, p, i); } catch (e) { pv = null; }
      const out = resolve(s, i, cur.pid);
      if (!out) { snd('no'); return; }
      after();
      try { if (pv && typeof floatDeltas === 'function') floatDeltas(s, pv); } catch (e) {   }
      const right = EVENTS[cur.id].ch.findIndex(c => c.ok);
      finish(out.ok !== false, out.text, out.ok === false ? out.why : null, out.real || null, i, right, out.sub || null);
    }
  }
  function finish(ok, line, why, real, picked, right, sub, src0) {
    cur.doneAt = now0(); cur.ok = ok;
    cur.showMs = CFG.show + (CFG.show >= 4000 ? 1 : 0) * CFG.perWord * (String(T_(line)).split(/\s+/).length + (why ? String(T_(why)).split(/\s+/).length : 0));
    const el = box; if (!el) return;
    el.querySelectorAll('button[data-ik]').forEach(b => { const v = +b.dataset.ik; b.disabled = true; b.classList.toggle('ik-right', v === right); b.classList.toggle('ik-wrong', v === picked && v !== right); });
    const rs = (real && typeof real.tr === 'string' ? `<div class="ik-real">${H(T_(real))}</div>` : '') + chip((real && real.src) || src0);
    el.querySelector('.ik-out').innerHTML = `<div class="ik-res ${ok ? 'ok' : 'no'}">${ok ? '✓' : '✗'} ${H(T_(line))}</div>${sub ? `<div class="ik-sub">${H(T_(sub))}</div>` : ''}${why ? `<div class="ik-why">${H(T_(why))}</div>` : ''}${rs}`;
    const bar = el.querySelector('.ik-bar'); if (bar) bar.remove();
    snd(ok ? 'good' : 'no');
    place();
  }
  function timeout(s) {
    if (cur.kind === 'work') {
      const r = workSkip(s, cur.q.qi);
      cur.doneAt = now0(); cur.ok = null; cur.showMs = CFG.plain;
      if (box) {
        box.querySelectorAll('button[data-ik]').forEach(b => { b.disabled = true; b.classList.toggle('ik-right', +b.dataset.ik === 0); });
        let html = `<div class="ik-res plain">${H(T_(r && r.line ? r.line : DONE[cur.act]))}</div>`;
        if (cur.act === 'scan') {
          html = `<div class="ik-res plain">${H(T_(TIMEUP))}</div><div class="ik-right-l">${H(T_(QT.right))}: ${H(T_(cur.q.a[0]))}</div>${cur.q.e ? `<div class="ik-why">${H(T_(cur.q.e))}</div>` : ''}${chip(cur.q.src)}<button type="button" class="ik-go">${H(T_(QT.go))}</button>`;
          cur.showMs = CFG.timeupMs; cur.needGo = true;
        }
        box.querySelector('.ik-out').innerHTML = html;
        const bar = box.querySelector('.ik-bar'); if (bar) bar.remove();
        place();
      }
    } else hide();
  }
  function hide() {
    if (cur && cur.kind === 'work' && !cur.doneAt) { const s = state(); if (s) workSkip(s, cur.q.qi); }
    cur = null; lastClose = now0();
    if (box) { box.hidden = true; box.innerHTML = ''; }
  }


  const QCFG = { kasif: 30000, muhendis: 15000, okMin: 3500, perWord: 350, lockMs: 1200, okFloor: 3500 }  ;

  const QT = {
    repair: L('Onarım', 'Repair'), build: L('İnşa', 'Building'),
    right: L('Doğrusu', 'The right answer'), go: L('Tamam', 'OK'), none: L('Ek harcama yok.', 'No extra cost.'),
    why: { repair: L('onarım', 'repair'), ceza: L('yanlış cevap', 'wrong answer'), sure: L('süre doldu', 'time ran out') }, hours: L('saat yapım', 'hours of building'),
    unit: { parca: L('yedek parça', 'spare parts'), malzeme: L('malzeme', 'material') },
  };
  const QCSS = `
#ikQuick { position: fixed; inset: 0; z-index: 60; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box;
  background: rgba(4, 8, 16, .6); pointer-events: auto; animation: ik-q-fade .18s ease-out; text-shadow: none; }
#ikQuick[hidden] { display: none; }
#ikQuick { --ik-f3: var(--gl-fill-3, rgb(var(--gl-tint, 12 20 38) / .84)); --ik-bf3: var(--gl-bf-3, blur(10px) saturate(160%)); --ik-line: var(--gl-line, rgba(255, 255, 255, .18));
  --ik-in: var(--gl-in, inset 0 1px 0 rgba(255, 255, 255, .18)); --ik-sh: var(--gl-shadow, 0 10px 34px rgba(0, 0, 0, .45), 0 0 0 1px rgba(0, 0, 0, .25));
  --ik-sub: var(--gl-sub, rgba(255, 255, 255, .07)); --ik-sub2: var(--gl-sub-2, rgba(255, 255, 255, .12)); --ik-c: 255, 181, 71; }
#ikQuick.ik-q-build { --ik-c: 111, 211, 255; }
#ikQuick .ik-q-card { position: relative; width: min(540px, 100%); max-height: 100%; box-sizing: border-box; overflow: hidden; padding: 20px 20px 18px;
  border-radius: var(--gl-r-modal, 24px); background: linear-gradient(180deg, rgba(255, 255, 255, .12), rgba(255, 255, 255, .03) 45%, rgba(255, 255, 255, .05)), var(--ik-f3); -webkit-backdrop-filter: var(--ik-bf3); backdrop-filter: var(--ik-bf3);
  border: 1px solid rgba(var(--ik-c), .6); color: #f4f7fb; font-size: 17px; line-height: 1.3;
  box-shadow: var(--ik-in), 0 16px 50px rgba(0, 0, 0, .5), 0 0 24px rgba(var(--ik-c), .18), 0 0 0 0 rgba(var(--ik-c), .5); animation: ik-q-pop .18s cubic-bezier(.2, 1.3, .4, 1), ik-q-glow 1.4s ease-out 2; }
#ikQuick .ik-q-time { position: absolute; left: 0; right: 0; top: 0; height: 10px; background: var(--ik-sub2); }
#ikQuick .ik-q-sn { position: absolute; right: 14px; top: 16px; min-width: 2.2em; padding: 2px 8px; border-radius: 999px; background: rgba(255, 181, 71, .18); color: #ffd48a; font-size: 18px; font-weight: 800; text-align: center; font-variant-numeric: tabular-nums;
  box-shadow: inset 0 0 0 1px rgba(255, 181, 71, .3); }
#ikQuick .ik-q-sn.ik-q-late { background: rgba(255, 122, 92, .25); color: #ffb4a3; box-shadow: inset 0 0 0 1px rgba(255, 122, 92, .45), 0 0 10px rgba(255, 122, 92, .25); }
#ikQuick .ik-q-head { padding-right: 64px; }
#ikQuick .ik-q-go:disabled { cursor: default; color: rgba(244, 247, 251, .55); background: var(--ik-sub2); box-shadow: none; }
#ikQuick .ik-q-time b { display: block; height: 100%; width: 100%; background: linear-gradient(180deg, #ffd08a, #ffb547); transform-origin: left; transition: background-color .3s; box-shadow: 0 0 10px rgba(255, 181, 71, .45); }
#ikQuick .ik-q-time.ik-q-late b { background: #ff7a5c; box-shadow: 0 0 10px rgba(255, 122, 92, .5); }
#ikQuick .ik-q-head { display: flex; align-items: center; gap: 10px; margin: 4px 0 8px; font-weight: 700; font-size: 16px; letter-spacing: .03em; color: #ffd48a; text-transform: uppercase; }
#ikQuick.ik-q-build .ik-q-head { color: #a9e6ff; }
#ikQuick .ik-q-head canvas, #ikQuick .ik-q-head svg { width: 40px; height: 40px; flex: none; }
#ikQuick .ik-q-head .ik-q-act { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px; background: rgba(255, 181, 71, .16); box-shadow: inset 0 0 0 1px rgba(255, 181, 71, .28); }
#ikQuick.ik-q-build .ik-q-head .ik-q-act { background: rgba(111, 211, 255, .14); box-shadow: inset 0 0 0 1px rgba(111, 211, 255, .28); }
#ikQuick .ik-q-head .ik-q-act svg { width: 18px; height: 18px; }
#ikQuick .ik-q-q { font-size: 24px; font-weight: 700; margin: 2px 0 14px; }
#ikQuick .ik-q-opts { display: grid; gap: 10px; }
#ikQuick .ik-q-opt { display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 9px 15px; border-radius: var(--gl-r-ctl, 14px); border: 1px solid var(--ik-line);
  background: var(--ik-sub); box-shadow: var(--ik-in); color: inherit; font: inherit; font-size: 20px; font-weight: 600; text-align: left; cursor: pointer;
  transition: transform .08s, background-color .15s, border-color .15s, box-shadow .15s, color .15s; }
#ikQuick .ik-q-opt:hover:not(:disabled) { background: var(--ik-sub2); border-color: rgba(255, 255, 255, .32); transform: translateY(-1px); }
#ikQuick .ik-q-opt:active:not(:disabled) { transform: scale(.98); box-shadow: inset 0 2px 6px rgba(0, 0, 0, .35); }
#ikQuick .ik-q-opt .ik-q-n { display: inline-grid; place-items: center; flex: none; width: 30px; height: 30px; border-radius: 50%; background: var(--ik-sub2); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .16); font-size: 16px; }
#ikQuick .ik-q-opt:disabled { cursor: default; color: rgba(244, 247, 251, .5); background: rgba(255, 255, 255, .03); border-color: rgba(255, 255, 255, .08); box-shadow: none; }
#ikQuick .ik-q-opt.ik-right { color: #f4f7fb; background: rgba(84, 217, 140, .24); border-color: #54d98c; box-shadow: var(--ik-in), 0 0 16px rgba(84, 217, 140, .34); }
#ikQuick .ik-q-opt.ik-wrong { color: #f4f7fb; background: rgba(255, 93, 77, .24); border-color: #ff5d4d; box-shadow: var(--ik-in), 0 0 16px rgba(255, 93, 77, .32); }
#ikQuick .ik-q-res { margin-top: 12px; padding: 10px 12px; border-radius: var(--gl-r-ctl, 14px); font-size: 19px; font-weight: 700; }
#ikQuick .ik-q-res[data-ok="1"] { background: rgba(84, 217, 140, .14); color: #8ff3b8; box-shadow: inset 0 0 0 1px rgba(84, 217, 140, .38); }
#ikQuick .ik-q-res[data-ok="0"] { background: rgba(255, 140, 110, .13); color: #ffc2b4; box-shadow: inset 0 0 0 1px rgba(255, 140, 110, .38); }
#ikQuick .ik-q-cost { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 6px; font-size: 17px; color: #ffe08f; }
#ikQuick .ik-q-cost span { display: inline-flex; align-items: center; gap: 4px; }
#ikQuick .ik-q-cost svg { width: 18px; height: 18px; }
#ikQuick .ik-q-right { margin-top: 6px; font-size: 17px; font-weight: 600; color: #e9f0f7; }
#ikQuick .ik-q-why { margin-top: 2px; font-size: 16px; font-weight: 500; color: #d5dee8; }
#ikQuick .ik-q-go { display: block; margin: 12px 0 0 auto; min-width: 120px; min-height: 48px; padding: 8px 18px; border-radius: var(--gl-r-ctl, 14px); border: 0; color: #1a1408;
  background: linear-gradient(180deg, color-mix(in srgb, #ffb547 88%, #fff), #ffb547); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .5), 0 4px 16px rgba(255, 181, 71, .32);
  font: inherit; font-size: 18px; font-weight: 700; cursor: pointer; transition: transform .12s, box-shadow .15s; }
#ikQuick .ik-q-go:hover:not(:disabled) { transform: translateY(-1px); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .55), 0 6px 20px rgba(255, 181, 71, .42); }
#ikQuick .ik-q-go:active:not(:disabled) { transform: none; box-shadow: inset 0 2px 6px rgba(0, 0, 0, .28); }
@media (max-height: 460px) {
  #ikQuick { padding: 8px 16px; }
  #ikQuick .ik-q-card { width: min(640px, 100%); padding: 13px 15px 11px; border-radius: var(--gl-r-card, 20px); font-size: 15px; animation: ik-q-pop .18s cubic-bezier(.2, 1.3, .4, 1), ik-q-glow-tel 1.4s ease-out 2; }
  #ikQuick .ik-q-head { margin: 2px 0 4px; font-size: 13px; } #ikQuick .ik-q-head canvas, #ikQuick .ik-q-head svg { width: 28px; height: 28px; }
  #ikQuick .ik-q-q { font-size: 19px; margin: 0 0 8px; }
  #ikQuick .ik-q-opts { grid-auto-flow: column; grid-auto-columns: 1fr; gap: 8px; }
  #ikQuick .ik-q-opt { min-height: 56px; padding: 7px 11px; font-size: 17px; gap: 8px; }  #ikQuick .ik-q-opt .ik-q-n { width: 24px; height: 24px; font-size: 13px; }
  #ikQuick .ik-q-res { margin-top: 8px; padding: 6px 10px; font-size: 16px; } #ikQuick .ik-q-cost, #ikQuick .ik-q-right { font-size: 14px; margin-top: 3px; }
  #ikQuick .ik-q-why { font-size: 13px; } #ikQuick .ik-q-go { min-height: 54px; margin-top: 6px; font-size: 16px; } }
@keyframes ik-q-fade { from { background-color: rgba(4, 8, 16, 0); } to { background-color: rgba(4, 8, 16, .6); } }
@keyframes ik-q-pop { from { transform: scale(.94); } to { transform: none; } }
@keyframes ik-q-glow { 0% { box-shadow: var(--ik-in), 0 16px 50px rgba(0, 0, 0, .5), 0 0 24px rgba(var(--ik-c), .18), 0 0 0 0 rgba(255, 200, 110, .55); } 100% { box-shadow: var(--ik-in), 0 16px 50px rgba(0, 0, 0, .5), 0 0 24px rgba(var(--ik-c), .18), 0 0 0 22px rgba(255, 200, 110, 0); } }
@keyframes ik-q-glow-tel { 0% { box-shadow: var(--ik-in), 0 16px 50px rgba(0, 0, 0, .5), 0 0 12px rgba(var(--ik-c), .18), 0 0 0 0 rgba(255, 200, 110, .45); } 100% { box-shadow: var(--ik-in), 0 16px 50px rgba(0, 0, 0, .5), 0 0 12px rgba(var(--ik-c), .18), 0 0 0 11px rgba(255, 200, 110, 0); } }
@keyframes ik-q-shake { 0%, 100% { transform: none; } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
#ikQuick .ik-q-card.ik-q-bad { animation: ik-q-shake .3s ease-in-out 1; }
@media (prefers-reduced-motion: reduce) { #ikQuick, #ikQuick .ik-q-card, #ikQuick .ik-q-card.ik-q-bad { animation: none; } }`;
  let qk = null, qbox = null, qStyled = false, qKeys = false;
  const isTest = () => { try { return typeof location !== 'undefined' && location.hash === '#test'; } catch (e) { return false; } };
  const wcount = o => String(T_(o)).trim().split(/\s+/).filter(Boolean).length;
  function qEnsure() {
    if (typeof document === 'undefined') return null;
    if (!qStyled) { const st = document.createElement('style'); st.id = 'ik-q-style'; st.textContent = QCSS; document.head.appendChild(st); qStyled = true; }
    if (!qbox || !qbox.isConnected) {
      qbox = document.createElement('div'); qbox.id = 'ikQuick'; qbox.hidden = true; qbox.setAttribute('role', 'dialog'); qbox.setAttribute('aria-modal', 'true');
      (document.getElementById('hud') || document.body).appendChild(qbox);
      const stop = e => { e.stopPropagation(); };
      for (const ev of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'wheel', 'contextmenu', 'dblclick']) qbox.addEventListener(ev, stop);
      qbox.addEventListener('click', e => {
        e.stopPropagation();
        const o = e.target.closest('.ik-q-opt'); if (o && !o.disabled) { qAnswer(+o.dataset.i); return; }
        if (e.target.closest('.ik-q-go') && qk && qk.doneAt && now0() - qk.doneAt > QCFG.lockMs) { qClose(); return; }
      });
    }
    if (!qKeys && typeof window !== 'undefined') {
      qKeys = true;
      window.addEventListener('keydown', e => {
        if (!qk) return;
        const k = e.key;
        if (!qk.doneAt && /^[1-3]$/.test(k)) { const i = qk.order[+k - 1]; if (i != null) qAnswer(i); }
        else if (qk.doneAt && (k === 'Enter' || k === ' ') && now0() - qk.doneAt > QCFG.lockMs) qClose();
        if (k === 'Tab') return;
        e.preventDefault(); e.stopImmediatePropagation();
      }, true);
      window.addEventListener('keyup', e => { if (qk) { e.stopImmediatePropagation(); } }, true);
    }
    return qbox;
  }
  function qName(s, k) { try { const n = typeof bname === 'function' ? bname(s, k) : (BLD[k] && BLD[k].name); return n ? T_(n) : ''; } catch (e) { return ''; } }
  function qOpen(s, act, ctx, q) {
    const u = U();
    if (u && u.modal === 'bcard') { try { if (typeof closeModal === 'function') closeModal(); } catch (e) {   } }
    if (cur) hide();
    const el = qEnsure(); if (!el) return false;
    const n = Math.max(2, Math.min(s.level === 'kasif' ? 2 : 3, q.a.length));
    const order = mix([...Array(n).keys()], (q.qi + 1) * 37 + s.t + (ctx.b ? ctx.b.id : ctx.bid || 0));
    const dur = (s.train || isTrain(s)) ? 0 : (s.level === 'kasif' ? QCFG.kasif : QCFG.muhendis);
    qk = { act, s, b: ctx.b || null, bid: ctx.bid != null ? ctx.bid : (ctx.b ? ctx.b.id : null), k: ctx.k || (ctx.b && ctx.b.k) || null, q, order, t0: now0(), dur, doneAt: 0, ok: null };
    const name = qName(s, qk.k);
    el.className = act === 'build' ? 'ik-q-build' : 'ik-q-repair';
    el.dataset.act = act;
    const opts = order.map((i, j) => `<button type="button" class="ik-q-opt" data-i="${i}"${isTest() && i === 0 ? ' data-ok="1"' : ''}><span class="ik-q-n">${j + 1}</span><span>${H(T_(q.a[i]))}</span></button>`).join('');
    el.innerHTML = `<div class="ik-q-card">${dur ? `<div class="ik-q-time"><b></b></div><span class="ik-q-sn" aria-live="off">${Math.ceil(dur / 1000)}</span>` : ''}<div class="ik-q-head"><span class="ik-q-ic"></span><span class="ik-q-act">${icon(act === 'build' ? 'build' : 'wrench')}${H(T_(QT[act]))}</span><span>${H(name)}</span></div>`
      + `<div class="ik-q-q">${H(T_(q.q))}</div><div class="ik-q-opts">${opts}</div><div class="ik-q-out"></div></div>`;
    try {
      const slot = el.querySelector('.ik-q-ic');
      if (typeof drawIcon === 'function' && qk.k && typeof SPR !== 'undefined' && SPR[qk.k]) { const cv = document.createElement('canvas'); slot.appendChild(cv); el.hidden = false; drawIcon(cv, qk.k, s.world); }
      else slot.innerHTML = icon(act === 'build' ? 'build' : 'wrench');
    } catch (e) {   }
    el.hidden = false;
    snd('tick');
    try { const f = el.querySelector('.ik-q-opt'); if (f && f.focus) f.focus({ preventScroll: true }); } catch (e) {   }
    return true;
  }
  function costHtml(r, act, s) {
    const parts = [];
    const item = (res, n, why) => `<span>${icon(typeof RES_ICON !== 'undefined' && RES_ICON[res] ? RES_ICON[res] : 'parts')}−${n} ${H(T_(QT.unit[res]))} (${H(T_(QT.why[why]))})</span>`;
    if (act === 'repair' && r.cost) parts.push(item('parca', r.cost, 'repair'));
    const x = r.extra || {};
    const pw = r.late ? 'sure' : 'ceza';
    if (x.parca) parts.push(item('parca', x.parca, pw));
    if (x.malzeme) parts.push(item('malzeme', x.malzeme, pw));
    if (x.saat) parts.push(`<span>+${x.saat} ${H(T_(QT.hours))}</span>`);
    if (!parts.length) parts.push(`<span>${H(T_(QT.none))}</span>`);
    void s;
    return `<div class="ik-q-cost">${parts.join('')}</div>`;
  }
  function qAnswer(i) {
    if (!qk || qk.doneAt) return;
    const s = state(); if (!s || s !== qk.s) { qClose(true); return; }
    let r;
    if (qk.act === 'repair') {
      r = repairQ(s, qk.b, qk.q.qi, i);
      if (r.done && qk.b) qk.b.st = 'ok';
    } else r = buildQ(s, qk.bid, qk.q.qi, i);
    qk.doneAt = now0(); qk.ok = !!r.ok; qk.r = r;
    const el = qbox; if (!el) return;
    el.querySelectorAll('.ik-q-opt').forEach(b => { const v = +b.dataset.i; b.disabled = true; b.classList.toggle('ik-right', v === 0); b.classList.toggle('ik-wrong', v === i && v !== 0); });
    const tb = el.querySelector('.ik-q-time'); if (tb) tb.remove();
    const sn = el.querySelector('.ik-q-sn'); if (sn) sn.remove();
    const done = r.done !== false;
    const trainNo = !r.ok && (s.train || isTrain(s));
    const right = !r.ok ? `<div class="ik-q-right">${H(T_(QT.right))}: ${H(T_(qk.q.a[0]))}</div>${r.e ? `<div class="ik-q-why">${H(T_(r.e))}</div>` : ''}` : '';
    el.querySelector('.ik-q-out').innerHTML = `<div class="ik-q-res" data-ok="${r.ok ? 1 : 0}">${r.ok ? '✓' : '✗'} ${H(T_(r.line))}${done && !trainNo ? costHtml(r, qk.act, s) : ''}</div>${right}${chip(qk.q && qk.q.src)}`
      + `<button type="button" class="ik-q-go" disabled>${H(T_(QT.go))}</button>`;
    qk.showMs = r.ok ? Math.max(QCFG.okFloor, QCFG.okMin + QCFG.perWord * wcount(r.line)) : 0;
    if (!r.ok) { const c = el.querySelector('.ik-q-card'); if (c) { c.classList.remove('ik-q-bad'); void c.offsetWidth; c.classList.add('ik-q-bad'); } }
    snd(r.ok ? 'good' : 'no');
    try { const g = el.querySelector('.ik-q-go'); if (g && g.focus) g.focus({ preventScroll: true }); } catch (e) {   }
    after();
  }
  function qClose(silent) {
    if (!qk) return;
    if (!qk.doneAt && !silent) return;
    qk = null;
    if (qbox) { qbox.hidden = true; qbox.innerHTML = ''; }
    lastClose = now0();
    if (!silent) after();
  }
  function qStep(s, t) {
    if (!qk) return;
    if (qk.s !== s) { qClose(true); return; }
    if (qk.doneAt) {
      const g = qbox && qbox.querySelector('.ik-q-go'); if (g && g.disabled && t - qk.doneAt > QCFG.lockMs) g.disabled = false;
      if (qk.ok && t - qk.doneAt >= qk.showMs) qClose();
      return;
    }
    if (qk.dur) {
      const left = 1 - (t - qk.t0) / qk.dur;
      if (left <= 0) { qAnswer(-1); return; }
      const bar = qbox && qbox.querySelector('.ik-q-time'); if (bar) { bar.firstChild.style.transform = `scaleX(${Math.max(0, left)})`; bar.classList.toggle('ik-q-late', left * qk.dur < 5000); }
      const sn = qbox && qbox.querySelector('.ik-q-sn'); if (sn) { const v = String(Math.max(0, Math.ceil(left * qk.dur / 1000))); if (sn.textContent !== v) sn.textContent = v; sn.classList.toggle('ik-q-late', left * qk.dur < 5000); }
    }
  }


  function quick(act, ctx) {
    const s = state(); ctx = ctx || {};
    if (!s || (act !== 'repair' && act !== 'build')) return false;
    if (qk) return act === qk.act && ((ctx.b && qk.b === ctx.b) || (ctx.bid != null && qk.bid === ctx.bid));
    let q = null;
    if (act === 'repair') {
      const b = ctx.b; if (!b || !b.broken || !s.b.includes(b)) return false;
      if (s.res.parca < repairCost(s, b)) return false;
      q = quickQ(s, 'repair', b.k);
    } else {
      const b = s.b.find(o => o.id === ctx.bid); if (!b) return false;
      q = quickQ(s, 'build', ctx.k || b.k, ctx.force ? { force: true } : undefined);
      ctx = Object.assign({}, ctx, { k: ctx.k || b.k });
    }
    if (!q) return false;
    return qOpen(s, act, ctx, q);
  }


  function step(t) {
    const s = state();
    if (!s) { if (cur) { cur = null; if (box) { box.hidden = true; box.innerHTML = ''; } } if (qk) qClose(true); cand = null; return; }
    if (s !== lastS) {
      if (lastS && cur) { cur = null; if (box) { box.hidden = true; box.innerHTML = ''; } }
      if (lastS && qk) qClose(true);
      lastS = s; seen = {}; cand = null;
    }
    const q = s.wq && Array.isArray(s.wq.ev) ? s.wq.ev.splice(0) : [];
    if (q.length) { const ev = q[q.length - 1]; if (CARD_ACTS.includes(ev.act) && s.t - (ev.t == null ? s.t : ev.t) <= 2) cand = { ev, at: t }; }
    if (qk) { qStep(s, t); cand = null; return; }
    if (cur) {
      if (cur.doneAt) { if (t - cur.doneAt >= (cur.showMs || CFG.show)) hide(); else place(); }
      else if (cur.kind === 'atlas' && !s.pending.some(p => p.pid === cur.pid)) hide();
      else if (t - cur.t0 >= CFG.life) timeout(s);
      else { const b = box && box.querySelector('.ik-bar b'); if (b) b.style.transform = `scaleX(${Math.max(0, 1 - (t - cur.t0) / CFG.life)})`; place(); }
      if (cand && cur) cand = null;
      return;
    }

    const p = s.pending.find(o => o.type === 'event' && ATLAS_Q.includes(o.id) && !seen[o.pid]);
    if (p && gapOk(s, t) && !blocked('atlas')) { cand = null; openAtlas(s, p, t); return; }
    if (cand) {
      if (t - cand.at > CFG.late) { cand = null; return; }
      if (!gapOk(s, t)) { cand = null; return; }
      if (blocked(cand.ev.act)) return;
      const ev = cand.ev; cand = null;
      const wq = workQ(s, ev.act, ev.k || ev.kind);
      if (wq) openWork(s, ev, wq, t);
    }
  }
  function loop(t) {
    try { requestAnimationFrame(loop); } catch (e) { return; }
    if (t - extT > 1000) { try { step(t); } catch (e) {   } }
  }

  const api = {

    tick(t) { const n = t == null ? now0() : t; extT = n; try { step(n); } catch (e) { if (typeof console !== 'undefined') console.error(e); } },

    ask(p) {
      const s = state(); if (!s || !p || p.type !== 'event' || !ATLAS_Q.includes(p.id)) return false;
      if (cur && cur.kind === 'atlas' && cur.pid === p.pid) return true;
      if (cur) hide();
      return openAtlas(s, s.pending.find(o => o.pid === p.pid) || p, now0());
    },
    showing(pid) { return !!cur && cur.kind === 'atlas' && String(cur.pid) === String(pid); },
    open() { return !!cur || !!qk; },
    holdWalk() { return !!qk || (!!cur && cur.kind === 'work'); },
    close() { if (cur) hide(); },

    quick(act, ctx) { try { return quick(act, ctx); } catch (e) { if (typeof console !== 'undefined') console.error(e); return false; } },
    quickOpen() { return !!qk; },
    _cfg: CFG, _qcfg: QCFG,
    _quick() { return qk ? { act: qk.act, k: qk.k, qi: qk.q.qi, done: !!qk.doneAt, ok: qk.ok, dur: qk.dur, order: qk.order.slice(), r: qk.r || null } : null; },
    _state() { return cur ? { kind: cur.kind, act: cur.act || null, pid: cur.pid != null ? cur.pid : null, done: !!cur.doneAt, ok: cur.ok, anchor: cur.anchor, t0: cur.t0 } : null; },
    _reset() { cur = null; cand = null; seen = {}; lastClose = -1e9; if (box) { box.hidden = true; box.innerHTML = ''; } if (qk) qClose(true); },
  };
  if (typeof window !== 'undefined') {
    if (typeof location !== 'undefined' && location.hash === '#test') { window.__uuMods = window.__uuMods || {}; window.__uuMods.ISKART = api; }
    if (typeof requestAnimationFrame === 'function' && !looping) { looping = true; requestAnimationFrame(loop); }
  }
  return api;
})();
