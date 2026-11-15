'use strict';

const P2 = Math.PI * 2;
const OUT = 'rgba(16,20,28,.62)';

if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath();
  };
}
function mul32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const circ = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, P2); };
const rrect = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
function poly(g, x, y, r, n, rot) { g.beginPath(); for (let i = 0; i < n; i++) { const a = rot + i * P2 / n; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); }
function fs(g, fill, stroke, lw) { if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 1.5; g.stroke(); } }
function lg(g, x0, y0, x1, y1, ...st) { const q = g.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of st) q.addColorStop(o, c); return q; }
function rg(g, x, y, r0, r1, ...st) { const q = g.createRadialGradient(x, y, r0, x, y, r1); for (const [o, c] of st) q.addColorStop(o, c); return q; }
function dome(g, x, y, r, c1, c2) {
  circ(g, x, y, r); fs(g, rg(g, x - r * .35, y - r * .4, r * .1, r * 1.15, [0, c1], [1, c2]), OUT);
  g.beginPath(); g.ellipse(x - r * .34, y - r * .4, r * .3, r * .15, -0.6, 0, P2); g.fillStyle = 'rgba(255,255,255,.5)'; g.fill();
}
const hullG = (g, x, y, w, h) => lg(g, x, y, x, y + h, [0, '#f6f8fa'], [0.55, '#d5dbe3'], [1, '#9aa5b4']);
const SOIL = { ay: ['#8b8d94', '#6d6f76', '#a6a8ae'], mars: ['#a8572f', '#7e3d20', '#c9783f'] };


const SPR = {
  hub(g, b, s, vt, fr) {
    g.lineCap = 'round';
    for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      g.beginPath(); g.moveTo(32 + dx * 14, 32 + dy * 14); g.lineTo(32 + dx * 27, 32 + dy * 27); fs(g, null, '#353b46', 4);
      circ(g, 32 + dx * 27, 32 + dy * 27, 4); fs(g, '#5d6777', OUT, 1);
    }
    poly(g, 32, 32, 24, 8, Math.PI / 8); fs(g, lg(g, 10, 10, 54, 54, [0, '#fdfdfe'], [1, '#a3aebd']), OUT);
    poly(g, 32, 32, 18, 8, Math.PI / 8); fs(g, lg(g, 14, 14, 50, 50, [0, '#e6c36a'], [1, '#93701f']), 'rgba(60,40,10,.5)', 1);
    dome(g, 32, 32, 10.5, '#c9ecff', '#2468a8');
    circ(g, 15, 15, 5.5); fs(g, lg(g, 10, 10, 20, 20, [0, '#fff'], [1, '#8f9bac']), OUT, 1); circ(g, 15, 15, 1.5); fs(g, '#39404c');
    circ(g, 50, 14, 2.6); fs(g, (fr * 1.2) % 1 < 0.5 ? '#ff5a4d' : '#6e2622');
  },
  gunes(g, b, s, vt, fr) {
    rrect(g, 29, 8, 6, 48, 2); fs(g, '#8a94a3', OUT, 1);
    for (const x of [5, 35]) {
      rrect(g, x, 12, 24, 40, 2); fs(g, lg(g, x, 12, x + 24, 52, [0, '#2f62b5'], [1, '#12274f']), OUT);
      g.strokeStyle = 'rgba(150,195,255,.42)'; g.lineWidth = 1; g.beginPath();
      for (let i = 1; i < 3; i++) { g.moveTo(x + i * 8, 13); g.lineTo(x + i * 8, 51); }
      for (let i = 1; i < 5; i++) { g.moveTo(x + 1, 12 + i * 8); g.lineTo(x + 23, 12 + i * 8); }
      g.stroke();
    }
    const sun = s && s.pw ? s.pw.sun : 1;
    if (sun > 0.05) {
      g.save(); g.beginPath(); g.rect(5, 12, 24, 40); g.rect(35, 12, 24, 40); g.clip();
      const p = ((fr * 0.25 + (b.x || 0) * 0.13) % 1) * 150 - 40;
      g.globalAlpha = 0.33 * sun; g.fillStyle = '#dff0ff';
      g.beginPath(); g.moveTo(p, 10); g.lineTo(p + 12, 10); g.lineTo(p - 18, 56); g.lineTo(p - 30, 56); g.fill();
      g.restore();
    }
  },
  batarya(g, b, s) {
    rrect(g, 8, 14, 48, 38, 5); fs(g, lg(g, 8, 14, 8, 52, [0, '#5b6474'], [1, '#2c323d']), OUT);
    const f = s && s.pw ? clamp(s.stored / Math.max(1, s.pw.cap), 0, 1) : 0.7;
    for (let i = 0; i < 3; i++) {
      const x = 13 + i * 14;
      rrect(g, x, 19, 10, 28, 2.5); fs(g, '#161a21', 'rgba(255,255,255,.14)', 1);
      const h = 24 * f;
      rrect(g, x + 2, 21 + (24 - h), 6, h, 1.5); fs(g, f > 0.5 ? '#5fe08a' : f > 0.2 ? '#f2c14e' : '#ff6b5a');
      rrect(g, x + 3, 16, 4, 3, 1); fs(g, '#aab3c0');
    }
  },
  reaktor(g, b, s, vt, fr) {
    g.save(); g.translate(32, 32);
    for (let i = 0; i < 4; i++) {
      g.rotate(Math.PI / 2);
      rrect(g, -4, 9, 8, 21, 1.5); fs(g, lg(g, -4, 0, 4, 0, [0, '#e9edf2'], [1, '#98a3b3']), OUT, 1);
      g.strokeStyle = 'rgba(40,50,65,.45)'; g.lineWidth = 1; g.beginPath();
      for (let j = 13; j < 29; j += 4) { g.moveTo(-3, j); g.lineTo(3, j); } g.stroke();
    }
    g.restore();
    poly(g, 32, 32, 13, 6, 0); fs(g, lg(g, 20, 20, 44, 44, [0, '#6c7686'], [1, '#2a303b']), OUT);
    const p = 0.7 + 0.3 * Math.sin(fr * 3);
    circ(g, 32, 32, 6.5); fs(g, rg(g, 32, 32, 0, 7, [0, `rgba(220,255,240,${p})`], [0.5, `rgba(80,240,170,${p})`], [1, 'rgba(20,90,70,.9)']));
  },
  oksijen(g, b, s, vt, fr) {
    rrect(g, 9, 30, 46, 24, 4); fs(g, hullG(g, 9, 30, 46, 24), OUT);
    rrect(g, 13, 44, 38, 5, 2); fs(g, '#30c5e8');
    dome(g, 22, 24, 12, '#ffffff', '#9fb0c4'); dome(g, 43, 24, 10, '#ffffff', '#9fb0c4');
    g.fillStyle = '#1f7e9c'; g.font = '700 9px sans-serif'; g.textAlign = 'center'; g.fillText('O₂', 32, 42);
    if (b.st === 'ok') for (let i = 0; i < 3; i++) {
      const p = (fr * 0.5 + i / 3) % 1;
      circ(g, 53 + Math.sin(p * 6 + i) * 2, 26 - p * 18, 1.5 + p * 2.5); g.fillStyle = `rgba(190,240,255,${0.5 * (1 - p)})`; g.fill();
    }
  },
  su(g, b, s, vt, fr) {
    rrect(g, 8, 8, 34, 34, 3); fs(g, 'rgba(30,36,46,.55)', '#aeb8c6', 2);
    g.strokeStyle = '#d6dce5'; g.lineWidth = 2.5; g.lineCap = 'round'; g.beginPath();
    g.moveTo(8, 8); g.lineTo(42, 42); g.moveTo(42, 8); g.lineTo(8, 42); g.stroke();
    circ(g, 25, 25, 8.5); fs(g, '#222831', '#8a94a3', 2);
    g.save(); g.translate(25, 25); if (b.st === 'ok') g.rotate(fr * 4);
    g.strokeStyle = '#7fd3ff'; g.lineWidth = 2; g.beginPath(); g.moveTo(-6, 0); g.lineTo(6, 0); g.moveTo(0, -6); g.lineTo(0, 6); g.stroke(); g.restore();
    g.strokeStyle = '#6b7686'; g.lineWidth = 3; g.beginPath(); g.moveTo(36, 36); g.lineTo(46, 46); g.stroke();
    dome(g, 47, 47, 11, '#c9efff', '#2f7fc4');
  },
  geri(g, b, s, vt, fr) {
    rrect(g, 8, 12, 48, 40, 6); fs(g, lg(g, 8, 12, 8, 52, [0, '#e9eef3'], [1, '#93a0b0']), OUT);
    for (let i = 0; i < 3; i++) { circ(g, 19 + i * 13, 24, 5.5); fs(g, rg(g, 17 + i * 13, 22, 1, 7, [0, '#b5fff0'], [1, '#17917f']), OUT, 1); }
    g.save(); g.translate(32, 41); if (b.st === 'ok') g.rotate(fr * 1.5);
    g.strokeStyle = '#17917f'; g.lineWidth = 2.5; g.lineCap = 'round';
    for (let i = 0; i < 2; i++) { g.rotate(Math.PI); g.beginPath(); g.arc(0, 0, 6.5, 0.3, 2.5); g.stroke(); g.beginPath(); g.moveTo(-7.5, 3); g.lineTo(-4.4, 6.8); g.lineTo(-8.4, 7.6); g.fillStyle = '#17917f'; g.fill(); }
    g.restore();
  },
  sera(g, b, s, vt, fr) {
    rrect(g, 5, 13, 54, 38, 14); fs(g, '#3b2f27', OUT);
    const lag = s && s.techs && s.techs.hidro ? 72 : 96, gr = clamp((b.grow == null ? lag : b.grow) / lag, 0, 1);
    g.save(); rrect(g, 7, 15, 50, 34, 12); g.clip();
    for (let i = 0; i < 4; i++) {
      const y = 19 + i * 8;
      g.fillStyle = '#5a4433'; g.fillRect(8, y, 48, 5);
      if (gr > 0.02) {
        g.fillStyle = gr >= 1 ? '#45c462' : '#3b8f4c';
        for (let x = 11; x < 54; x += 5) { circ(g, x + (i % 2) * 2, y + 2.5, 0.8 + 2.1 * gr); g.fill(); }
      }
    }
    g.restore();
    rrect(g, 5, 13, 54, 38, 14); fs(g, lg(g, 5, 13, 40, 51, [0, 'rgba(225,245,255,.42)'], [0.5, 'rgba(190,225,255,.10)'], [1, 'rgba(160,210,255,.26)']), 'rgba(235,245,255,.85)', 1.6);
    g.strokeStyle = 'rgba(235,245,255,.5)'; g.lineWidth = 1; g.beginPath();
    for (const x of [19, 32, 45]) { g.moveTo(x, 13.5); g.lineTo(x, 50.5); } g.stroke();
    rrect(g, 27, 49, 10, 7, 2); fs(g, '#cfd6df', OUT, 1);
  },
  yasam(g, b, s) {
    rrect(g, 26, 47, 12, 10, 2.5); fs(g, '#8d98a8', OUT, 1);
    rrect(g, 6, 15, 52, 34, 15); fs(g, hullG(g, 6, 15, 52, 34), OUT);
    rrect(g, 6, 28, 52, 5, 0); fs(g, s && s.world === 'mars' ? '#e2743d' : '#3d9be2');
    const lit = s ? (isDark(s) && b.st === 'ok') : false;
    for (const x of [17, 32, 47]) { circ(g, x, 22, 3.6); fs(g, lit ? '#ffe08a' : '#274868', 'rgba(20,30,45,.7)', 1); }
    rrect(g, 20, 37, 24, 6, 2); fs(g, 'rgba(60,72,90,.35)');
    if (s && isShielded(s, b)) mound(g, s.world, b.id || 1);
  },
  spor(g, b, s, vt, fr) {
    circ(g, 32, 32, 26); fs(g, '#2e3b36', OUT);
    circ(g, 32, 32, 22.5); fs(g, rg(g, 32, 32, 2, 23, [0, '#58c98a'], [1, '#1f7a56']));
    g.strokeStyle = '#f0b36a'; g.lineWidth = 2.5; circ(g, 32, 32, 16.5); g.stroke();
    const a = fr * 1.4; circ(g, 32 + Math.cos(a) * 16.5, 32 + Math.sin(a) * 16.5, 2.2); fs(g, '#fff');
    for (const [x, y, r] of [[26, 28, 4.5], [37, 31, 5.5], [30, 38, 4]]) { circ(g, x, y, r); fs(g, rg(g, x - 1, y - 1, 0.5, r, [0, '#8be0a0'], [1, '#237a45'])); }
    circ(g, 32, 32, 26); fs(g, rg(g, 22, 20, 2, 34, [0, 'rgba(255,255,255,.42)'], [0.45, 'rgba(200,235,255,.08)'], [1, 'rgba(170,215,255,.22)']), 'rgba(235,245,255,.8)', 1.6);
    g.strokeStyle = 'rgba(235,245,255,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(6, 32); g.lineTo(58, 32); g.moveTo(32, 6); g.lineTo(32, 58); g.stroke();
  },
  anten(g, b, s, vt, fr) {
    g.strokeStyle = '#5c6676'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath();
    g.moveTo(32, 40); g.lineTo(16, 55); g.moveTo(32, 40); g.lineTo(48, 55); g.moveTo(32, 40); g.lineTo(32, 57); g.stroke();
    g.save(); g.translate(32, 27); g.rotate(Math.sin(fr * 0.3 + (b.id || 0)) * 0.5);
    g.beginPath(); g.ellipse(0, 0, 22, 17, 0, 0, P2); fs(g, rg(g, -6, -6, 2, 24, [0, '#ffffff'], [0.7, '#c2cbd7'], [1, '#8794a6']), OUT);
    g.beginPath(); g.ellipse(0, 0, 13, 10, 0, 0, P2); fs(g, null, 'rgba(90,100,118,.5)', 1);
    g.strokeStyle = '#4b5565'; g.lineWidth = 2; g.beginPath(); g.moveTo(-13, 9); g.lineTo(0, -1); g.moveTo(13, 9); g.lineTo(0, -1); g.stroke();
    circ(g, 0, -1, 3.2); fs(g, '#ff7a59', OUT, 1); g.restore();
  },
  maden(g, b, s, vt, fr) {
    const so = SOIL[s ? s.world : 'mars'];
    circ(g, 46, 44, 12); fs(g, rg(g, 43, 40, 1, 13, [0, so[2]], [1, so[1]]), 'rgba(0,0,0,.35)', 1);
    circ(g, 51, 37, 6); fs(g, rg(g, 49, 35, 1, 7, [0, so[2]], [1, so[1]]));
    g.save(); g.translate(14, 34); g.rotate(-0.5);
    rrect(g, 0, 0, 34, 8, 3); fs(g, '#2b313b', OUT, 1);
    if (b.st === 'ok') { g.fillStyle = so[2]; for (let i = 0; i < 4; i++) { const p = ((fr * 0.6 + i / 4) % 1) * 30; circ(g, 2 + p, 4, 2); g.fill(); } }
    g.restore();
    g.beginPath(); g.moveTo(6, 10); g.lineTo(34, 10); g.lineTo(28, 34); g.lineTo(12, 34); g.closePath(); fs(g, lg(g, 6, 10, 34, 34, [0, '#ffc94a'], [1, '#d98a1c']), OUT);
    g.save(); g.beginPath(); g.rect(8, 10, 24, 6); g.clip(); g.strokeStyle = '#23272e'; g.lineWidth = 3; g.beginPath();
    for (let x = 2; x < 42; x += 8) { g.moveTo(x, 18); g.lineTo(x + 8, 8); } g.stroke(); g.restore();
  },
  atolye(g, b, s, vt, fr) {
    rrect(g, 7, 9, 50, 46, 4); fs(g, lg(g, 7, 9, 57, 55, [0, '#616b7b'], [1, '#2d333d']), OUT);
    rrect(g, 12, 14, 40, 36, 2); fs(g, '#1b1f26', 'rgba(255,255,255,.12)', 1);
    g.fillStyle = '#ffb84a'; for (const [x, y] of [[7, 9], [47, 9], [7, 45], [47, 45]]) { rrect(g, x, y, 10, 10, 3); g.fill(); }
    rrect(g, 17, 36, 9, 9, 1.5); fs(g, '#7ad3ff'); rrect(g, 28, 39, 6, 6, 1); fs(g, '#7ad3ff');
    const a = b.st === 'ok' ? Math.sin(fr * 2.2) * 0.7 : 0.2;
    g.save(); g.translate(40, 22); g.rotate(a + 2.2);
    g.strokeStyle = '#e8ecf1'; g.lineWidth = 3.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(13, 0); g.stroke();
    g.translate(13, 0); g.rotate(-1 + a); g.beginPath(); g.moveTo(0, 0); g.lineTo(9, 0); g.stroke();
    circ(g, 9, 0, 2.2); fs(g, b.st === 'ok' ? '#ffd76a' : '#8892a0'); g.restore();
    circ(g, 40, 22, 4); fs(g, '#ffb84a', OUT, 1);
  },
  lab(g, b, s, vt, fr) {
    rrect(g, 7, 17, 50, 36, 7); fs(g, hullG(g, 7, 17, 50, 36), OUT);
    poly(g, 25, 35, 12.5, 6, 0); fs(g, rg(g, 22, 31, 1, 14, [0, '#d9ccff'], [1, '#5a3fc0']), OUT);
    g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(12.5, 35); g.lineTo(37.5, 35); g.stroke();
    g.save(); g.translate(46, 28); g.rotate(-0.7 + Math.sin(fr * 0.25) * 0.2);
    rrect(g, -4, -17, 8, 21, 2.5); fs(g, lg(g, -4, 0, 4, 0, [0, '#f4f6f9'], [1, '#9ca7b6']), OUT, 1); rrect(g, -5, -19, 10, 4, 1.5); fs(g, '#3b4350'); g.restore();
    circ(g, 46, 44, 3); fs(g, (fr * 0.8) % 1 < 0.6 ? '#b99cff' : '#4a3a8a');
  },
  pist(g, b, s, vt, fr) {
    circ(g, 32, 32, 29); fs(g, lg(g, 6, 6, 58, 58, [0, '#4a505b'], [1, '#2b3039']), OUT);
    g.setLineDash([6, 5]); circ(g, 32, 32, 22); fs(g, null, '#f0c040', 2); g.setLineDash([]);
    g.strokeStyle = '#e9edf2'; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath();
    g.moveTo(25, 23); g.lineTo(25, 41); g.moveTo(39, 23); g.lineTo(39, 41); g.moveTo(25, 32); g.lineTo(39, 32); g.stroke();
    const on = (fr * 1.5) % 1 < 0.5;
    for (const [x, y] of [[12, 12], [52, 12], [12, 52], [52, 52]]) { circ(g, x, y, 2.4); fs(g, on ? '#ffe27a' : '#6b5a22'); }
  },
};
function mound(g, world, seed) {
  const so = SOIL[world], R = mul32(seed * 7919);
  g.save();
  g.beginPath();
  for (let i = 0; i <= 14; i++) { const a = i / 14 * P2, r = 1 + (R() - 0.5) * 0.16; g[i ? 'lineTo' : 'moveTo'](32 + Math.cos(a) * 29 * r, 31 + Math.sin(a) * 20 * r); }
  g.closePath(); fs(g, rg(g, 26, 24, 3, 32, [0, so[2]], [0.7, so[0]], [1, so[1]]), 'rgba(0,0,0,.4)', 1.2);
  g.fillStyle = 'rgba(0,0,0,.16)'; for (let i = 0; i < 16; i++) { circ(g, 12 + R() * 40, 18 + R() * 26, 0.8 + R() * 1.4); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.2)'; for (let i = 0; i < 10; i++) { circ(g, 12 + R() * 40, 16 + R() * 24, 0.7 + R()); g.fill(); }
  g.restore();

  g.beginPath(); g.moveTo(32, 23); g.lineTo(39, 26); g.lineTo(39, 32); g.quadraticCurveTo(39, 38, 32, 41); g.quadraticCurveTo(25, 38, 25, 32); g.lineTo(25, 26); g.closePath();
  fs(g, 'rgba(120,210,255,.9)', 'rgba(10,40,70,.7)', 1.2);
}
function drawIcon(cv, k, world) {
  const d = window.devicePixelRatio || 1, sz = cv.clientWidth || 44;
  cv.width = cv.height = Math.round(sz * d);
  const g = cv.getContext('2d'); g.setTransform(sz * d / 64, 0, 0, sz * d / 64, 0, 0); g.clearRect(0, 0, 64, 64);
  SPR[k](g, { k, st: 'ok', id: 3, x: 1, grow: 999 }, { world, pw: { sun: 1, cap: 100 }, stored: 70, techs: {}, t: 12, b: [], map: { k: [] }, storm: null }, 12, 0.3);
}



const GLYPH = (() => {
  const D = Math.PI / 180;
  const f = v => String(Math.round(v * 100) / 100);
  const area = p => { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[i], r = p[(i + 1) % p.length]; a += q[0] * r[1] - r[0] * q[1]; } return a; };
  const orient = (p, hole) => ((area(p) > 0) === !hole ? p : p.slice().reverse());

  function rp(p, r, hole) {
    p = orient(p, hole); const n = p.length; let d = '';
    for (let i = 0; i < n; i++) {
      const a = p[(i - 1 + n) % n], b = p[i], c = p[(i + 1) % n];
      const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, l2 = Math.hypot(c[0] - b[0], c[1] - b[1]) || 1;
      const u = [(b[0] - a[0]) / l1, (b[1] - a[1]) / l1], v = [(c[0] - b[0]) / l2, (c[1] - b[1]) / l2];
      const turn = Math.abs(Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]));
      const t = turn < 0.3 ? 0 : Math.min(r, l1 * 0.48, l2 * 0.48);
      d += (i ? 'L' : 'M') + f(b[0] - u[0] * t) + ' ' + f(b[1] - u[1] * t);
      if (t) d += 'Q' + f(b[0]) + ' ' + f(b[1]) + ' ' + f(b[0] + v[0] * t) + ' ' + f(b[1] + v[1] * t);
    }
    return d + 'Z';
  }
  const C = (cx, cy, r, hole) => { const s = hole ? 0 : 1, a = `A${f(r)} ${f(r)} 0 1 ${s} `; return `M${f(cx - r)} ${f(cy)}${a}${f(cx + r)} ${f(cy)}${a}${f(cx - r)} ${f(cy)}Z`; };
  const E = (cx, cy, rx, ry, hole) => { const s = hole ? 0 : 1, a = `A${f(rx)} ${f(ry)} 0 1 ${s} `; return `M${f(cx - rx)} ${f(cy)}${a}${f(cx + rx)} ${f(cy)}${a}${f(cx - rx)} ${f(cy)}Z`; };
  const RR = (x, y, w, h, r, hole) => rp([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], r, hole);
  const arc = (cx, cy, r, a0, a1, n) => { n = n || Math.max(4, Math.ceil(Math.abs(a1 - a0) / 12)); const o = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * D; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };
  const cub = (p0, p1, p2, p3, n) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, s = 1 - t; o.push([0, 1].map(k => s * s * s * p0[k] + 3 * s * s * t * p1[k] + 3 * s * t * t * p2[k] + t * t * t * p3[k])); } return o; };

  function stroke(p, w, hole) {
    const h = w / 2, n = p.length, L = [], R = [];
    const nrm = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
    const ns = [];
    for (let i = 0; i < n; i++) {
      let q, k = 1;
      if (i === 0) q = nrm(p[0], p[1]);
      else if (i === n - 1) q = nrm(p[n - 2], p[n - 1]);
      else { const a = nrm(p[i - 1], p[i]), b = nrm(p[i], p[i + 1]); q = [a[0] + b[0], a[1] + b[1]]; const l = Math.hypot(q[0], q[1]) || 1; q = [q[0] / l, q[1] / l]; k = 1 / Math.max(0.55, q[0] * a[0] + q[1] * a[1]); }
      ns.push(q);
      L.push([p[i][0] + q[0] * h * k, p[i][1] + q[1] * h * k]); R.push([p[i][0] - q[0] * h * k, p[i][1] - q[1] * h * k]);
    }
    const cap = (c, q, from) => { const a0 = Math.atan2(q[1], q[0]) / D + from, o = []; for (let i = 1; i < 8; i++) { const a = (a0 - i * 180 / 8) * D; o.push([c[0] + Math.cos(a) * h, c[1] + Math.sin(a) * h]); } return o; };
    const pts = L.concat(cap(p[n - 1], ns[n - 1], 0), R.reverse(), cap(p[0], ns[0], 180));
    return rp(pts, 0, hole);
  }
  const seg = (x1, y1, x2, y2, w, hole) => stroke([[x1, y1], [x2, y2]], w, hole);
  const band = (cx, cy, r, w, a0, a1, hole) => stroke(arc(cx, cy, r, a0, a1), w, hole);
  const star = (cx, cy, ro, ri, n, rot, rr, hole) => { const o = []; for (let i = 0; i < n * 2; i++) { const a = (rot + i * 180 / n) * D, r = i % 2 ? ri : ro; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return rp(o, rr, hole); };
  const cross = (cx, cy, a, t, hole) => rp([[cx - t, cy - a], [cx + t, cy - a], [cx + t, cy - t], [cx + a, cy - t], [cx + a, cy + t], [cx + t, cy + t], [cx + t, cy + a], [cx - t, cy + a], [cx - t, cy + t], [cx - a, cy + t], [cx - a, cy - t], [cx - t, cy - t]], 0.7, hole);
  function crescent(ax, ay, ra, bx, by, rb) {
    const d = Math.hypot(bx - ax, by - ay), a = (ra * ra - rb * rb + d * d) / (2 * d);
    const tAB = Math.atan2(by - ay, bx - ax) / D, be = Math.acos(a / ra) / D, tBA = tAB + 180, ga = Math.acos((d - a) / rb) / D;
    const o = arc(ax, ay, ra, tAB + be, tAB + 360 - be, 40), last = o[o.length - 1];
    let ib = arc(bx, by, rb, tBA - ga, tBA + ga, 20);
    const d0 = Math.hypot(ib[0][0] - last[0], ib[0][1] - last[1]), d1 = Math.hypot(ib[ib.length - 1][0] - last[0], ib[ib.length - 1][1] - last[1]);
    if (d1 < d0) ib = ib.reverse();
    return rp(o.concat(ib.slice(1, -1)), 1.2);
  }

  function wrench(x, y, x2, y2, r, w) {
    const dx = x - x2, dy = y - y2, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, nx = -uy, ny = ux, hw = r * 0.37, b = r * 0.08;
    const th = Math.atan2(uy, ux) / D, dl = Math.asin(hw / r) / D;
    const head = arc(x, y, r, th + dl, th + 360 - dl, 26).concat([[x + ux * b - nx * hw, y + uy * b - ny * hw], [x + ux * b + nx * hw, y + uy * b + ny * hw]]);
    return rp(head, 0.7) + seg(x - ux * r * 0.55, y - uy * r * 0.55, x2, y2, w);
  }
  const G = {};

  G.o2Bubble = C(10.6, 13.4, 9) + C(7.6, 12.6, 4, true) + C(7.6, 12.6, 1.9) +
    stroke(arc(13.7, 12.8, 1.8, 192, 372, 10).concat([[11.9, 17.4], [15.7, 17.4]]), 2.2, true) + C(20.4, 4.2, 2.6);
  G.o2Text = C(8.6, 10.4, 7) + C(8.6, 10.4, 3.2, true) + stroke(arc(19.1, 16.4, 2.5, 195, 370).concat([[15.9, 21.6]]), 2.7) + seg(15.9, 21.6, 21.9, 21.6, 2.7);
  G.drop = 'M10.9 3.3Q12 2 13.1 3.3C15.9 6.6 19 10.7 19 14.8A7 7 0 0 1 5 14.8C5 10.7 8.1 6.6 10.9 3.3Z';
  G.apple = 'M12 7.4C9.6 5.6 3.9 5.8 3.5 11.8C3.1 17.4 6.9 21.9 9.5 21.9C10.7 21.9 11.1 21.3 12 21.3C12.9 21.3 13.3 21.9 14.5 21.9C17.1 21.9 20.9 17.4 20.5 11.8C20.1 5.8 14.4 5.6 12 7.4Z' +
    seg(11.8, 7, 12.6, 3, 2.2) + 'M14.2 5.4Q14.8 1.4 19.6 1.6Q19 5.6 14.2 5.4Z';
  G.sprout = seg(12, 21.5, 12, 11.5, 3) +
    'M11.2 12.9Q3 13.6 2.6 5.4Q10.8 4.8 11.2 12.9Z' + 'M12.6 11.4Q12.6 2.6 21.6 2.4Q22 11.4 12.6 11.4Z';
  G.bolt = rp([[14.6, 1.8], [4.6, 13.6], [11, 13.6], [9.4, 22.2], [19.4, 10.2], [13, 10.2]], 1.3);
  G.helmet = C(11, 10.8, 8.4) + E(11, 10.2, 5.2, 3.5, true) + RR(4.8, 16.2, 12.4, 5.6, 1.8) + C(21, 3.6, 2.2);
  G.rad = C(12, 12, 2.6) + [-150, -30, 90].map(c => rp(arc(12, 12, 10.4, c - 30, c + 30, 8).concat(arc(12, 12, 4.4, c + 30, c - 30, 4)), 1.1)).join('');
  G.smile = C(12, 12, 9.8) + E(8.6, 9.3, 1.7, 2.2, true) + E(15.4, 9.3, 1.7, 2.2, true) + band(12, 12.2, 5.4, 2.5, 28, 152, true);
  G.crew = C(12, 6.8, 4.5) + 'M3.4 21.2C3.4 16.3 7.2 13.2 12 13.2C16.8 13.2 20.6 16.3 20.6 21.2Q20.6 22 19.8 22H4.2Q3.4 22 3.4 21.2Z';
  G.bricks = RR(2.2, 13.4, 9, 8.2, 1.7) + RR(12.8, 13.4, 9, 8.2, 1.7) + RR(6.9, 3.6, 10.2, 8.2, 1.7);
  G.parts = wrench(17.2, 6.8, 4.4, 19.6, 4.4, 3.4) + seg(9, 9, 18.6, 18.6, 3.2) + rp(arc(6.8, 6.8, 4.4, 15, 375, 6).slice(0, 6), 0.8);
  G.flask = RR(7.6, 2, 8.8, 3, 1.2) + RR(9.4, 3, 5.2, 7, 0.5) + rp([[9.4, 8.6], [14.6, 8.6], [21.2, 19.4], [19.8, 21.9], [4.2, 21.9], [2.8, 19.4]], 1.8);
  G.rocket = rp(cub([12, 1.6], [16.4, 4.4], [16.6, 8.6], [16.4, 17.6], 8).concat([[7.6, 17.6]], cub([7.6, 17.6], [7.4, 8.6], [7.6, 4.4], [12, 1.6], 8).slice(1, -1)), 0.8) + C(12, 9.6, 2.1, true) +
    rp([[7.8, 11.8], [3.6, 16.6], [3.6, 20.6], [7.8, 18.6]], 1) + rp([[16.2, 11.8], [20.4, 16.6], [20.4, 20.6], [16.2, 18.6]], 1) + RR(9.6, 17, 4.8, 4.8, 1.4);
  G.tablet = RR(4.6, 1.8, 14.8, 20.4, 3) + RR(7.3, 4.6, 9.4, 12.6, 1, true) + C(12, 19.6, 1.1, true);

  G.build = rp([[12, 2.2], [22.2, 11.2], [19.6, 11.2], [19.6, 21.8], [4.4, 21.8], [4.4, 11.2], [1.8, 11.2]], 1.2) + cross(12, 15.4, 4.1, 1.45, true);
  G.scan = C(9.8, 9.8, 7.6) + C(9.8, 9.8, 4.5, true) + seg(15.4, 15.4, 20.6, 20.6, 4);
  G.radar = C(5.2, 18.8, 3) + band(5.2, 18.8, 8.6, 2.9, -88, -2, false) + band(5.2, 18.8, 14.1, 2.9, -86, -4, false);
  G.bed = RR(1.8, 5, 3.6, 16, 1.4) + RR(1.8, 12.4, 20.4, 5, 1.6) + RR(6.6, 8.2, 6, 3.2, 1.4) + RR(18.6, 15, 3.6, 6, 1.2);
  G.crate = RR(2.8, 4, 18.4, 16.6, 2.4) + RR(5.6, 7, 12.8, 3.4, 0.8, true) + RR(5.6, 14.2, 12.8, 3.4, 0.8, true);
  G.hand = RR(6.2, 10.4, 12.2, 11.8, 4.2) + seg(7.6, 13, 7.6, 7.9, 2.8) + seg(10.7, 12, 10.7, 4.7, 2.8) + seg(13.8, 12, 13.8, 5.1, 2.8) + seg(16.9, 13, 16.9, 7.6, 2.8) + seg(7.2, 17.4, 3.4, 12.8, 3.1);
  G.wrench = wrench(16.2, 7.8, 4.2, 19.8, 5.4, 4.4);
  G.eye = 'M1.6 12Q12 0 22.4 12Q12 24 1.6 12Z' + C(12, 12, 4.1, true) + C(12, 12, 2.1);
  G.drone = RR(8.6, 9, 6.8, 6, 1.8) + seg(9.6, 10, 5.4, 5.8, 2.4) + seg(14.4, 10, 18.6, 5.8, 2.4) + seg(9.6, 14, 5.4, 18.2, 2.4) + seg(14.4, 14, 18.6, 18.2, 2.4) +
    C(4.9, 5.3, 3.3) + C(19.1, 5.3, 3.3) + C(4.9, 18.7, 3.3) + C(19.1, 18.7, 3.3);
  G.walk = C(13.6, 3.9, 2.6) + seg(12.8, 8.6, 11.2, 14.4, 3.6) + seg(11.2, 14.6, 7.6, 21.2, 3.1) + stroke([[11.4, 14.6], [15, 17.4], [15.4, 21.4]], 3.1) +
    seg(12.4, 9.4, 8.4, 12.6, 2.7) + seg(13, 9.6, 16.8, 12.2, 2.7);
  G.radio = seg(12, 11, 12, 21.6, 3.2) + C(12, 9, 2.8) + band(12, 9, 6.4, 2.5, 140, 220) + band(12, 9, 6.4, 2.5, -40, 40) + band(12, 9, 10.4, 2.5, 148, 212) + band(12, 9, 10.4, 2.5, -32, 32);
  G.radioLog = RR(2.2, 3.2, 19.6, 13.8, 3.4) + rp([[6, 15], [12, 15], [6, 21.6]], 1) + seg(7, 8, 17, 8, 2.5, true) + seg(7, 12.2, 13.4, 12.2, 2.5, true);
  G.chat = RR(2.2, 3.2, 19.6, 13.8, 3.4) + rp([[6, 15], [12, 15], [6, 21.6]], 1) + C(7.6, 10.1, 1.6, true) + C(12, 10.1, 1.6, true) + C(16.4, 10.1, 1.6, true);
  G.undo = stroke([[8.6, 7.4], [14, 7.4]].concat(arc(14, 13.2, 5.8, -90, 90, 12), [[8.4, 19]]), 3.2) + rp([[2.6, 7.4], [9.6, 1.8], [9.6, 13]], 1.1);
  G.star = star(12, 12.8, 10.8, 4.8, 5, -90, 1.5);
  G.blueprint = RR(2.6, 2.6, 18.8, 18.8, 3.4) + RR(5.6, 5.6, 5.6, 5.6, 1, true) + RR(12.8, 5.6, 5.6, 5.6, 1, true) + RR(5.6, 12.8, 5.6, 5.6, 1, true) + RR(12.8, 12.8, 5.6, 5.6, 1, true);

  G.loop = (() => { const a = 238 * D, ex = 12 + Math.cos(a) * 7.4, ey = 12.6 + Math.sin(a) * 7.4, tx = -Math.sin(a), ty = Math.cos(a), nx = Math.cos(a), ny = Math.sin(a);
    return band(12, 12.6, 7.4, 3.1, -40, 236) + rp([[ex + tx * 4.4, ey + ty * 4.4], [ex + nx * 4.6 - tx * 0.6, ey + ny * 4.6 - ty * 0.6], [ex - nx * 4.6 - tx * 0.6, ey - ny * 4.6 - ty * 0.6]], 0.9); })();
  G.sun = C(12, 12, 5.2) + [0, 45, 90, 135, 180, 225, 270, 315].map(a => seg(12 + Math.cos(a * D) * 8, 12 + Math.sin(a * D) * 8, 12 + Math.cos(a * D) * 10.2, 12 + Math.sin(a * D) * 10.2, 2.6)).join('');
  G.flare = star(12, 12, 11, 6, 8, -90, 1) + C(12, 12, 3, true);
  G.night = crescent(11, 12.6, 9.2, 17.4, 7, 7.2);
  G.meteor = C(15, 15, 6) + rp([[15 + 4.24, 15 - 4.24], [2.6, 2.6], [15 - 4.24, 15 + 4.24]], 1.2);
  G.heart = 'M12 21.4C10.6 20.4 2 14.6 2 8.6C2 5.3 4.5 2.8 7.6 2.8C9.5 2.8 11.1 3.8 12 5.4C12.9 3.8 14.5 2.8 16.4 2.8C19.5 2.8 22 5.3 22 8.6C22 14.6 13.4 20.4 12 21.4Z';
  G.wave = [[1.8, 12.6], [6.8, 12.6], [9.2, 5.6], [12.8, 18.6], [15.4, 9.6], [17, 12.6], [22.2, 12.6]].map((q, i, a) => i ? seg(a[i - 1][0], a[i - 1][1], q[0], q[1], 2.8) : '').join('');
  G.storm = stroke([[2.4, 8], [14.2, 8]].concat(arc(14.2, 5, 3, 90, -170, 10)), 2.7) + seg(2.4, 12.8, 20.4, 12.8, 2.7) + stroke([[5, 17.6], [14.8, 17.6]].concat(arc(14.8, 20.2, 2.6, -90, 160, 10)), 2.7);
  G.check = stroke([[4.2, 12.6], [9.6, 18], [19.8, 6.4]], 3.9);
  G.lock = stroke([[7.4, 12], [7.4, 8.8]].concat(arc(12, 8.8, 4.6, 180, 360, 10).slice(1), [[16.6, 12]]), 2.9) + RR(4.2, 10.6, 15.6, 11.6, 2.6) + C(12, 15.8, 2, true);
  G.menu = seg(4.4, 6.2, 19.6, 6.2, 3.3) + seg(4.4, 12, 19.6, 12, 3.3) + seg(4.4, 17.8, 19.6, 17.8, 3.3);
  G.shield = rp([[12, 2], [20.4, 5.2], [20.4, 11.2]].concat(cub([20.4, 11.2], [20.4, 16.4], [16.8, 20.2], [12, 22.2], 6).slice(1), cub([12, 22.2], [7.2, 20.2], [3.6, 16.4], [3.6, 11.2], 6).slice(1, -1), [[3.6, 11.2], [3.6, 5.2]]), 1.6);
  G.pause = RR(5.6, 4.2, 4.8, 15.6, 1.7) + RR(13.6, 4.2, 4.8, 15.6, 1.7);
  G.play = rp([[6.6, 3.6], [20.4, 12], [6.6, 20.4]], 2.4);
  G.clock = C(12, 12, 9.8) + stroke([[12, 6.2], [12, 12.4], [16.2, 15]], 2.7, true);
  G.plus = cross(12, 12, 8.4, 1.8);
  G.minus = seg(4.6, 12, 19.4, 12, 3.6);
  G.x = seg(6, 6, 18, 18, 3.8) + seg(18, 6, 6, 18, 3.8);
  G.info = C(12, 12, 9.8) + C(12, 7.2, 1.8, true) + seg(12, 11, 12, 17.4, 3.1, true);
  G.quiz = C(12, 12, 9.8) + stroke(arc(12, 9.2, 3.1, 195, 410, 12).concat([[12, 13.8]]), 2.7, true) + C(12, 17.6, 1.6, true);
  G.atlas = RR(3.6, 7.4, 16.8, 13, 4) + RR(7, 11.6, 3.4, 4.4, 1.6, true) + RR(13.6, 11.6, 3.4, 4.4, 1.6, true) + seg(12, 7.6, 12, 4.4, 2.4) + C(12, 3.4, 2.2);
  G.tape = RR(2.2, 4.8, 19.6, 14.4, 2.6) + C(8.2, 11, 2.4, true) + C(15.8, 11, 2.4, true) + rp([[7, 19.2], [8.6, 15.8], [15.4, 15.8], [17, 19.2]], 0.6, true);
  G.jump = rp([[12, 2.2], [19.4, 9.6], [14.7, 9.6], [14.7, 16.2], [9.3, 16.2], [9.3, 9.6], [4.6, 9.6]], 1.1) + seg(4, 20.6, 20, 20.6, 2.9);
  G.off = band(12, 12.8, 7.8, 3, -55, 235) + seg(12, 2.6, 12, 11, 3.2);

  Object.assign(G, { o2: G.o2Bubble, leaf: G.apple, food: G.apple, cube: G.bricks, gear: G.parts, ship: G.rocket, pda: G.tablet, suit: G.helmet });
  return G;
})();
const O2_STYLE = 'bubble';
if (O2_STYLE === 'text') GLYPH.o2 = GLYPH.o2Text;
const ICONS_APPROVED = true;
const ICON_SET = {};
for (const k in GLYPH) ICON_SET[k] = `<path fill="currentColor" stroke="none" d="${GLYPH[k]}"/>`;
const UI_ICONS = ICONS_APPROVED ? ICON_SET : null;

const RES_COLOR = { o2: '#38c6f0', su: '#3f8cff', gida: '#4cc777', guc: '#ffc53d', suit: '#2fd3b5', doz: '#ff6fb5', moral: '#ff9a3c', ekip: '#b79cff', malzeme: '#d39a5c', parca: '#9fb2c8', bilim: '#8f7cff', kargo: '#e9eef5' };
const RES_INK = {};
for (const k in RES_COLOR) { const h = RES_COLOR[k], n = parseInt(h.slice(1), 16), l = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; RES_INK[k] = l > 0.62 ? '#10151d' : '#ffffff'; }
const RES_ICON = { o2: 'o2', su: 'drop', gida: 'apple', guc: 'bolt', suit: 'helmet', doz: 'rad', moral: 'smile', ekip: 'crew', malzeme: 'bricks', parca: 'parts', bilim: 'flask', kargo: 'rocket' };
const _glyphP = {};
function drawGlyph(ctx, key, x, y, size, color) {
  const d = GLYPH[key]; if (!d || typeof Path2D === 'undefined') return false;
  const p = _glyphP[key] || (_glyphP[key] = new Path2D(d));
  ctx.save(); ctx.translate(x - size / 2, y - size / 2); ctx.scale(size / 24, size / 24);
  if (color) ctx.fillStyle = color;
  ctx.fill(p); ctx.restore();
  return true;
}


function drawSky(cv, s, vt) {
  const g = cv.getContext('2d'), d = window.devicePixelRatio || 1, w = cv.clientWidth || 68, h = cv.clientHeight || 40;
  if (cv.width !== Math.round(w * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
  g.setTransform(d, 0, 0, d, 0, 0);
  const W = WORLDS[s.world], hz = h * 0.74;
  if (W.night) {
    g.fillStyle = '#02030a'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 14; i++) g.fillRect((i * 37 % 61) / 61 * w, (i * 23 % 29) / 29 * hz, 1, 1);
    circ(g, w * 0.2, h * 0.3, 5); fs(g, rg(g, w * 0.2 - 2, h * 0.3 - 2, 0.5, 6, [0, '#bfe3ff'], [0.6, '#3d86d8'], [1, '#184a8f']));
    const ph = nightPhase(s, vt), P = W.night.period * 24, len = W.night.len * 24;
    const a = ph / P * P2, sx = w * 0.56 + Math.sin(a + 0.4) * w * 0.34, sy = hz - 5 - Math.cos((ph - len / 2) / P * P2) * -9 - 4;
    circ(g, sx, sy, 9); g.fillStyle = rg(g, sx, sy, 1, 10, [0, 'rgba(255,255,255,1)'], [0.3, 'rgba(255,244,200,.9)'], [1, 'rgba(255,240,180,0)']); g.fill();
    g.fillStyle = '#585a61'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, hz + 2); g.lineTo(w * 0.3, hz - 3); g.lineTo(w * 0.55, hz + 1); g.lineTo(w * 0.8, hz - 2); g.lineTo(w, hz + 2); g.lineTo(w, h); g.fill();
  } else {
    const hr = ((vt % 24) + 24) % 24, a = Math.PI * (hr - 6) / 12, el = Math.sin(a), day = clamp(el * 3 + 0.25, 0, 1), dusk = clamp(1 - Math.abs(el) * 4, 0, 1);
    const st = stormOn(s);
    const top = st ? [96, 58, 34] : [20 + 150 * day, 16 + 110 * day, 30 + 70 * day], bot = st ? [140, 84, 46] : [40 + 190 * day - 60 * dusk, 28 + 130 * day, 40 + 70 * day + 90 * dusk];
    g.fillStyle = lg(g, 0, 0, 0, hz, [0, `rgb(${top.map(Math.round)})`], [1, `rgb(${bot.map(Math.round)})`]); g.fillRect(0, 0, w, h);
    if (day < 0.5) { g.fillStyle = `rgba(255,255,255,${0.8 * (1 - day * 2)})`; for (let i = 0; i < 14; i++) g.fillRect((i * 37 % 61) / 61 * w, (i * 23 % 29) / 29 * hz, 1, 1); }
    if (el > -0.15) { const sx = w * 0.5 - Math.cos(a) * w * 0.4, sy = hz - el * hz * 0.72; circ(g, sx, sy, 8); g.fillStyle = rg(g, sx, sy, 1, 8, [0, '#ffffff'], [0.35, dusk > 0.4 ? '#cfe4ff' : '#fff0c4'], [1, 'rgba(255,240,200,0)']); g.fill(); }
    g.fillStyle = st ? '#5a3118' : '#7a3a1e'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, hz + 1); g.lineTo(w * 0.25, hz - 3); g.lineTo(w * 0.5, hz + 1); g.lineTo(w * 0.72, hz - 4); g.lineTo(w, hz); g.lineTo(w, h); g.fill();
  }
}
const TB = { stars: null };
function drawTitle(cv, world, now) {
  const d = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
  if (!w || !h) return;
  if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)) { cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
  const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0);
  g.fillStyle = '#04060c'; g.fillRect(0, 0, w, h);
  if (!TB.stars) { const R = mul32(77); TB.stars = []; for (let i = 0; i < 260; i++) TB.stars.push([R(), R(), 0.4 + R() * 1.3, R() * 6]); }
  for (const [x, y, r, p] of TB.stars) { g.globalAlpha = 0.35 + 0.5 * Math.abs(Math.sin(now / 1400 + p)); g.fillStyle = '#dfe9ff'; g.fillRect(x * w, y * h, r, r); }
  g.globalAlpha = 1;
  const moon = world === 'ay', R = Math.max(w, h) * 0.95, cx = w * 0.5, cy = h + R * 0.62;
  if (!moon) { circ(g, cx, cy, R + 26); g.fillStyle = rg(g, cx, cy, R - 4, R + 26, [0, 'rgba(255,170,110,.35)'], [1, 'rgba(255,170,110,0)']); g.fill(); }
  circ(g, cx, cy, R); g.fillStyle = rg(g, cx - R * 0.25, cy - R * 0.9, R * 0.1, R * 1.25, [0, moon ? '#c9cbd1' : '#e08a52'], [0.55, moon ? '#7b7d84' : '#a3502a'], [1, moon ? '#2c2d33' : '#3b1a0d']); g.fill();
  g.save(); circ(g, cx, cy, R); g.clip();
  const Q = mul32(moon ? 5 : 9);
  for (let i = 0; i < 46; i++) {
    const a = -Math.PI / 2 + (Q() - 0.5) * 1.1, rr = R * (0.8 + Q() * 0.19), x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr, r = 5 + Q() * Q() * (moon ? 46 : 26);
    g.beginPath(); g.ellipse(x, y, r, r * 0.42, 0, 0, P2); g.fillStyle = moon ? 'rgba(0,0,0,.2)' : 'rgba(60,20,8,.22)'; g.fill();
    g.beginPath(); g.ellipse(x, y, r, r * 0.42, 0, Math.PI, P2); g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1.5; g.stroke();
  }
  g.restore();
  g.fillStyle = lg(g, 0, h * 0.3, 0, h, [0, 'rgba(4,6,12,0)'], [1, 'rgba(4,6,12,.62)']); g.fillRect(0, 0, w, h);

  if (w < 620 && moon) return;
  const ex = w * 0.82, ey = h * 0.2, er = moon ? 26 : 3.2;
  circ(g, ex, ey, er * 2.4); g.fillStyle = rg(g, ex, ey, er * 0.6, er * 2.4, [0, 'rgba(90,160,255,.3)'], [1, 'rgba(90,160,255,0)']); g.fill();
  circ(g, ex, ey, er); g.fillStyle = rg(g, ex - er * 0.4, ey - er * 0.4, er * 0.1, er * 1.2, [0, '#bfe3ff'], [0.5, '#2f7fd6'], [1, '#0b2a5c']); g.fill();
  if (moon) { g.save(); circ(g, ex, ey, er); g.clip(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(ex - 6, ey - 8, 13, 4, 0.3, 0, P2); g.fill(); g.beginPath(); g.ellipse(ex + 7, ey + 6, 11, 3.4, -0.2, 0, P2); g.fill(); g.fillStyle = 'rgba(70,160,90,.55)'; g.beginPath(); g.ellipse(ex + 2, ey - 1, 8, 6, 0.6, 0, P2); g.fill(); g.fillStyle = 'rgba(2,4,10,.55)'; circ(g, ex + er * 0.75, ey + er * 0.3, er * 1.05); g.fill(); g.restore(); }
}



const PATCH_SYMS = ['ay', 'mars', 'roket', 'yildiz', 'buz', 'tas', 'bitki', 'anten', 'gezgin'];
const PATCH_SHAPES = ['daire', 'kalkan', 'altigen'];
const drawPatch = (() => {
  const hexOk = h => typeof h === 'string' && /^#[0-9a-f]{6}$/i.test(h);
  const rgbOf = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const mix = (h, t, k) => { const a = rgbOf(h), b = rgbOf(t); return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
  const lum = h => { const [r, g, b] = rgbOf(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  const INK = '#f6f4ee', EDGE = 'rgba(246,244,238,.92)';
  function shapePath(g, shape, cx, cy, r) {
    g.beginPath();
    if (shape === 'altigen') { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); }
    else if (shape === 'kalkan') {
      g.moveTo(cx - 0.86 * r, cy - 0.9 * r); g.lineTo(cx + 0.86 * r, cy - 0.9 * r); g.lineTo(cx + 0.86 * r, cy + 0.08 * r);
      g.quadraticCurveTo(cx + 0.8 * r, cy + 0.74 * r, cx, cy + r); g.quadraticCurveTo(cx - 0.8 * r, cy + 0.74 * r, cx - 0.86 * r, cy + 0.08 * r); g.closePath();
    } else g.arc(cx, cy, r, 0, Math.PI * 2);
  }

  const SYM = {
    yildiz(g) {
      g.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.42 : 1; g[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r + 0.06); }
      g.closePath(); g.fillStyle = '#f7cf45'; g.fill(); g.lineWidth = 0.07; g.strokeStyle = 'rgba(90,60,0,.45)'; g.stroke();
    },
    ay(g, bg) {
      g.save(); g.beginPath(); g.arc(0, 0, 0.9, 0, Math.PI * 2); g.clip();
      g.fillStyle = '#e9e7df'; g.fillRect(-1, -1, 2, 2);
      g.fillStyle = 'rgba(120,118,110,.45)'; for (const [x, y, r] of [[-0.45, -0.2, 0.17], [-0.2, 0.45, 0.12], [-0.6, 0.3, 0.09]]) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = bg; g.beginPath(); g.arc(0.5, -0.22, 0.82, 0, Math.PI * 2); g.fill();
      g.restore();
    },
    mars(g) {
      g.save(); g.beginPath(); g.arc(0, 0, 0.88, 0, Math.PI * 2); g.clip();
      g.fillStyle = '#d4643c'; g.fillRect(-1, -1, 2, 2);
      g.fillStyle = 'rgba(110,40,18,.55)'; for (const [x, y, rx, ry] of [[-0.3, 0.1, 0.38, 0.16], [0.35, 0.35, 0.3, 0.12], [0.2, -0.25, 0.2, 0.09]]) { g.beginPath(); g.ellipse(x, y, rx, ry, -0.3, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#f4f1ea'; g.beginPath(); g.ellipse(0, -0.86, 0.42, 0.2, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.arc(0.35, 0.3, 0.95, 0, Math.PI * 2); g.arc(0, 0, 0.88, 0, Math.PI * 2, true); g.fill();
      g.restore();
      g.beginPath(); g.arc(0, 0, 0.9, 0, Math.PI * 2); g.lineWidth = 0.07; g.strokeStyle = INK; g.stroke();
    },
    roket(g, bg, ring) {
      g.fillStyle = '#ffb347'; g.beginPath(); g.moveTo(-0.17, 0.62); g.quadraticCurveTo(0, 1.12, 0.17, 0.62); g.closePath(); g.fill();
      g.fillStyle = ring; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 0.2, 0.15); g.lineTo(s * 0.48, 0.6); g.lineTo(s * 0.2, 0.55); g.closePath(); g.fill(); }
      g.fillStyle = INK; g.beginPath(); g.moveTo(0, -0.98); g.quadraticCurveTo(0.3, -0.6, 0.24, 0.0); g.lineTo(0.22, 0.62); g.lineTo(-0.22, 0.62); g.lineTo(-0.24, 0.0); g.quadraticCurveTo(-0.3, -0.6, 0, -0.98); g.closePath(); g.fill();
      g.fillStyle = bg; g.beginPath(); g.arc(0, -0.22, 0.12, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(40,40,50,.35)'; g.lineWidth = 0.05; g.beginPath(); g.moveTo(-0.23, 0.3); g.lineTo(0.23, 0.3); g.stroke();
    },
    buz(g) {
      g.strokeStyle = '#c6ecff'; g.lineCap = 'round'; g.lineWidth = 0.13;
      for (let i = 0; i < 6; i++) {
        g.save(); g.rotate(i * Math.PI / 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -0.92);
        for (const [y, l] of [[-0.42, 0.24], [-0.68, 0.17]]) { g.moveTo(0, y); g.lineTo(-l, y - l); g.moveTo(0, y); g.lineTo(l, y - l); }
        g.stroke(); g.restore();
      }
      g.fillStyle = '#eaf8ff'; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g[i ? 'lineTo' : 'moveTo'](Math.cos(a) * 0.2, Math.sin(a) * 0.2); } g.closePath(); g.fill();
    },
    tas(g) {
      const P = [[-0.85, 0.55], [-0.7, -0.15], [-0.25, -0.62], [0.3, -0.55], [0.8, -0.05], [0.88, 0.55]];
      g.fillStyle = '#a8a59d'; g.beginPath(); P.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y)); g.closePath(); g.fill();
      g.lineWidth = 0.07; g.strokeStyle = INK; g.stroke();
      g.fillStyle = '#cfccc4'; g.beginPath(); g.moveTo(-0.7, -0.15); g.lineTo(-0.25, -0.62); g.lineTo(0.3, -0.55); g.lineTo(0.05, 0.0); g.closePath(); g.fill();
      g.fillStyle = '#7c7972'; g.beginPath(); g.moveTo(0.05, 0.0); g.lineTo(0.8, -0.05); g.lineTo(0.88, 0.55); g.lineTo(0.2, 0.55); g.closePath(); g.fill();
      g.fillStyle = '#e88a35'; for (const [x, y] of [[-0.35, 0.2], [0.45, 0.25], [-0.05, -0.3]]) { g.beginPath(); g.arc(x, y, 0.07, 0, Math.PI * 2); g.fill(); }
    },
    bitki(g) {
      g.strokeStyle = '#5fc65a'; g.lineCap = 'round'; g.lineWidth = 0.14; g.beginPath(); g.moveTo(0, 0.85); g.quadraticCurveTo(0.08, 0.2, 0, -0.25); g.stroke();
      g.lineWidth = 0.07; g.strokeStyle = INK;
      g.fillStyle = '#7ee078';
      g.beginPath(); g.moveTo(0, -0.1); g.quadraticCurveTo(-0.85, -0.25, -0.8, -0.85); g.quadraticCurveTo(-0.15, -0.75, 0, -0.1); g.fill(); g.stroke();
      g.fillStyle = '#4fb04a';
      g.beginPath(); g.moveTo(0.02, 0.2); g.quadraticCurveTo(0.85, 0.05, 0.85, -0.55); g.quadraticCurveTo(0.15, -0.45, 0.02, 0.2); g.fill(); g.stroke();
      g.fillStyle = '#8a5a34'; g.beginPath(); g.ellipse(0, 0.86, 0.5, 0.13, 0, 0, Math.PI * 2); g.fill();
    },
    anten(g) {
      g.strokeStyle = INK; g.lineCap = 'round'; g.lineWidth = 0.12;
      g.beginPath(); g.moveTo(-0.05, 0.1); g.lineTo(-0.35, 0.85); g.moveTo(-0.05, 0.1); g.lineTo(0.25, 0.85); g.moveTo(-0.5, 0.85); g.lineTo(0.4, 0.85); g.stroke();
      g.fillStyle = INK; g.beginPath(); g.ellipse(-0.15, -0.15, 0.62, 0.28, -0.7, 0, Math.PI); g.closePath(); g.fill();
      g.lineWidth = 0.07; g.beginPath(); g.moveTo(-0.15, -0.15); g.lineTo(0.22, -0.55); g.stroke();
      g.strokeStyle = '#ffd36a'; g.lineWidth = 0.09;
      for (const r of [0.35, 0.6]) { g.beginPath(); g.arc(0.22, -0.55, r, -1.35, -0.15); g.stroke(); }
    },
    gezgin(g, bg, ring) {
      g.strokeStyle = INK; g.lineWidth = 0.08; g.beginPath(); g.moveTo(0.45, -0.1); g.lineTo(0.45, -0.75); g.stroke();
      g.fillStyle = INK; g.fillRect(0.3, -0.88, 0.32, 0.16);
      g.fillStyle = INK; g.beginPath(); g.moveTo(-0.85, 0.2); g.lineTo(-0.7, -0.15); g.lineTo(0.75, -0.15); g.lineTo(0.85, 0.2); g.closePath(); g.fill();
      g.fillStyle = ring; g.fillRect(-0.72, 0.0, 1.44, 0.1);
      g.fillStyle = '#1f2228'; for (const x of [-0.6, 0, 0.6]) { g.beginPath(); g.arc(x, 0.5, 0.24, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#9aa0a8'; for (const x of [-0.6, 0, 0.6]) { g.beginPath(); g.arc(x, 0.5, 0.09, 0, Math.PI * 2); g.fill(); }
      g.strokeStyle = INK; g.lineWidth = 0.06; g.beginPath(); g.moveTo(-0.6, 0.5); g.lineTo(-0.4, 0.2); g.moveTo(0.6, 0.5); g.lineTo(0.4, 0.2); g.moveTo(0, 0.5); g.lineTo(0, 0.2); g.stroke();
    },
  };
  function rimText(g, text, cx, cy, r, band, size, shape) {
    const fs0 = Math.max(7, band * 0.62);
    g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
    let f = fs0;
    const font = s => `700 ${s}px "Chakra Petch", "IBM Plex Sans", system-ui, sans-serif`;
    if (shape === 'kalkan') {
      g.font = font(f); while (f > 6 && g.measureText(text).width > r * 1.5) { f -= 0.5; g.font = font(f); }
      g.fillText(text, cx, cy - 0.9 * r + band * 0.55);
      return;
    }
    const hx = shape === 'altigen' ? 0.866 : 1;
    const rr = hx * (r - band * 0.5);
    f *= hx; g.font = font(f);
    const wOf = () => [...text].map(c => g.measureText(c).width * 1.08);
    let ws = wOf(), tot = ws.reduce((a, b) => a + b, 0);
    while (f > 6 && tot / rr > Math.PI * 1.15) { f -= 0.5; g.font = font(f); ws = wOf(); tot = ws.reduce((a, b) => a + b, 0); }
    let a = -Math.PI / 2 - tot / rr / 2;
    [...text].forEach((c, i) => {
      const da = ws[i] / rr; a += da / 2;
      g.save(); g.translate(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); g.rotate(a + Math.PI / 2); g.fillText(c, 0, 0); g.restore();
      a += da / 2;
    });

  }
  return function drawPatch(ctx, spec, size) {
    const sp = spec || {}, g = ctx, S = size || 128;
    const shape = PATCH_SHAPES.includes(sp.shape) ? sp.shape : 'daire';
    const bg = hexOk(sp.bg) ? sp.bg : '#2f5fa8';
    const ring = hexOk(sp.ring) ? sp.ring : (lum(bg) > 0.55 ? mix(bg, '#1a1d24', 0.55) : mix(bg, '#0c0f16', 0.42));
    const sym = SYM[sp.sym] ? sp.sym : 'yildiz';
    const cx = S / 2, cy = S / 2, r = S * 0.47, band = S * (S >= 96 ? 0.13 : 0.1), ri = r - band;
    g.save();
    g.clearRect(0, 0, S, S);

    shapePath(g, shape, cx, cy, r); g.fillStyle = ring; g.fill();
    g.lineWidth = Math.max(1, S * 0.018); g.strokeStyle = EDGE; g.stroke();

    g.save(); shapePath(g, shape, cx, cy, ri); g.clip();
    g.fillStyle = bg; g.fillRect(0, 0, S, S);
    const sky = g.createLinearGradient(0, cy - ri, 0, cy + ri); sky.addColorStop(0, 'rgba(255,255,255,.14)'); sky.addColorStop(1, 'rgba(0,0,0,.12)');
    g.fillStyle = sky; g.fillRect(0, 0, S, S);
    const hy = cy + ri * 0.52, ground = mix(bg, '#000000', 0.45);
    g.beginPath(); g.moveTo(cx - ri * 1.2, S); g.lineTo(cx - ri * 1.2, hy + ri * 0.12); g.quadraticCurveTo(cx, hy - ri * 0.14, cx + ri * 1.2, hy + ri * 0.12); g.lineTo(cx + ri * 1.2, S); g.closePath();
    g.fillStyle = ground; g.fill();
    g.beginPath(); g.moveTo(cx - ri * 1.2, hy + ri * 0.12); g.quadraticCurveTo(cx, hy - ri * 0.14, cx + ri * 1.2, hy + ri * 0.12);
    g.strokeStyle = 'rgba(255,236,190,.55)'; g.lineWidth = Math.max(1, S * 0.012); g.stroke();

    g.save(); g.translate(cx, cy - ri * 0.1); const k = ri * 0.56; g.scale(k, k);
    try { SYM[sym](g, bg, ring); } catch (e) {   }
    g.restore();
    g.restore();
    shapePath(g, shape, cx, cy, ri); g.lineWidth = Math.max(1, S * 0.012); g.strokeStyle = 'rgba(246,244,238,.7)'; g.stroke();

    const txt = typeof sp.text === 'string' ? sp.text.trim().toLocaleUpperCase('tr-TR').slice(0, 26) : '';
    if (txt && S >= 96) rimText(g, txt, cx, cy, r, band, S, shape);
    g.restore();
    return true;
  };
})();
