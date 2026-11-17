

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const groot = execSync('npm root -g').toString().trim();
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(groot, '@playwright', 'cli', 'node_modules', 'playwright-core'));
const outPng = process.argv[2] || path.join(dir, 'shots-ikon', 'ikon-onizleme.png');
fs.mkdirSync(path.dirname(outPng), { recursive: true });
const cizim = fs.readFileSync(path.join(dir, '..', 'src', 'cizim.js'), 'utf8');

const page = `
const RES = [['o2', 'Oksijen (hava)'], ['su', 'Su'], ['gida', 'Yemek'], ['guc', 'Elektrik'], ['suit', 'Giysi havası'], ['doz', 'Radyasyon'],
  ['moral', 'Mutluluk (moral)'], ['ekip', 'Ekip'], ['malzeme', 'Yapı malzemesi'], ['parca', 'Yedek parça'], ['bilim', 'Bilim'], ['kargo', 'Kargo gemisi']];
const ACT = [['build', 'Kur (inşa)'], ['scan', 'Tara'], ['hand', 'Kullan'], ['wrench', 'Onar'], ['eye', 'Görünüm: bak'], ['drone', 'Görünüm: dron'], ['walk', 'Yürü'],
  ['tablet', 'Tablet'], ['radioLog', 'Telsiz kaydı'], ['undo', 'Geri al'], ['star', 'Önerilen yer'], ['blueprint', 'Başlangıç planı']];
const MISC = [['bed', 'Yatak'], ['crate', 'Kargo kutusu'], ['radio', 'Telsiz'], ['atlas', 'ATLAS'], ['chat', 'Konuşma'], ['tape', 'Eski kayıt'],
  ['sun', 'Güneş'], ['night', 'Gece'], ['flare', 'Güneş patlaması'], ['storm', 'Toz fırtınası'], ['meteor', 'Minik göktaşı'], ['heart', 'Sağlık'],
  ['wave', 'Kalp atışı'], ['loop', 'Kendi üretimin'], ['shield', 'Kalkan'], ['lock', 'Kilitli'], ['check', 'Tamam'], ['x', 'Kapat'],
  ['plus', 'Artı'], ['minus', 'Eksi'], ['info', 'Bilgi'], ['quiz', 'Soru'], ['clock', 'Saat'], ['menu', 'Menü'], ['pause', 'Durdur'],
  ['play', 'Oynat'], ['jump', 'Zıpla'], ['off', 'Kapalı'], ['radar', 'Radar'], ['sprout', 'Filiz'], ['o2Text', 'O₂ (yazı)']];
const BGS = [['Koyu cam (HUD)', 'rgba(10,15,24,.94)', '#e9eef6'], ['Ay gündüz zemini', 'linear-gradient(135deg,#b9b8b2,#8f8e89)', '#10151d'], ['Mars zemini', 'linear-gradient(135deg,#d49a6e,#b3683f)', '#10151d']];
const ACC = '#8fd0ff', WARN = '#f2b23e', BAD = '#ff5d4d';
const svg = (k, px, col) => '<svg width="' + px + '" height="' + px + '" viewBox="0 0 24 24" style="color:' + col + ';display:block">' + ICON_SET[k] + '</svg>';
function badge(k, px, col, st, ink) {
  const b = Math.round(px * 1.4), r = Math.round(b * 0.3);
  // normal rozet: koyu cam taban + kaynak rengi %22 örtü → açık zeminde de okunur
  let bg = 'linear-gradient(' + col + '38,' + col + '38),rgba(8,12,20,.8)', fg = col, ring = '';
  if (st === 'warn') { bg = col; fg = ink; ring = 'box-shadow:0 0 0 2px ' + WARN + ';'; }
  if (st === 'bad') { bg = BAD; fg = '#fff'; }
  if (st === 'off') { bg = 'linear-gradient(rgba(150,160,175,.14),rgba(150,160,175,.14)),rgba(8,12,20,.7)'; fg = 'rgba(170,180,195,.6)'; }
  return '<span style="display:inline-flex;align-items:center;justify-content:center;width:' + b + 'px;height:' + b + 'px;border-radius:' + r + 'px;background:' + bg + ';' + ring + '">' + svg(k, px, fg) + '</span>';
}
const cell = h => '<td>' + h + '</td>';
let h = '<h1>Ufuk Üssü · ikon önizleme</h1><p class="sub">Dolu, tek renkli siluetler · rozet = kaynak rengi %22, ikon tam renk · durumlar: normal, uyarı (dolu + sarı çerçeve), tehlike (kırmızı), kapalı. O₂ varsayılanı: <b>' + O2_STYLE + '</b></p>';
h += '<h2>Kaynaklar</h2><table class="res"><tr><th></th>' + BGS.map(b => '<th colspan="8">' + b[0] + '<br><small>çıplak16 · 16 · 24 · 48 · normal · uyarı · tehlike · kapalı</small></th>').join('') + '</tr>';
for (const [r, lab] of RES) {
  const k = RES_ICON[r], col = RES_COLOR[r], ink = RES_INK[r];
  h += '<tr><th class="lab"><span class="sw" style="background:' + col + '"></span>' + lab + '<small>' + k + ' · ' + col + '</small></th>';
  BGS.forEach(([, bg], i) => {
    h += '<td class="blk" style="background:' + bg + '" colspan="8"><div class="row' + (i === 0 ? ' c16' : '') + '">' + '<span class="bare">' + svg(k, 16, col) + '</span>' + badge(k, 16, col) + badge(k, 24, col) + badge(k, 48, col) +
      '<span class="gap"></span>' + badge(k, 24, col) + badge(k, 24, col, 'warn', ink) + badge(k, 24, col, 'bad') + badge(k, 24, col, 'off') + '</div></td>';
  });
  h += '</tr>';
}
h += '</table>';
h += '<h2>Oksijen: iki seçenek yan yana</h2><div class="o2row">';
for (const [k, lab] of [['o2Bubble', '(a) Kabarcık, içinde O₂ · varsayılan'], ['o2Text', '(b) Kalın O₂ harfleri']]) {
  h += '<div class="o2"><b>' + lab + '</b>';
  for (const [, bg] of BGS) h += '<div class="row" style="background:' + bg + '">' + '<span class="bare">' + svg(k, 16, RES_COLOR.o2) + '</span>' + badge(k, 16, RES_COLOR.o2) + badge(k, 24, RES_COLOR.o2) + badge(k, 48, RES_COLOR.o2) + svg(k, 96, RES_COLOR.o2) + badge(k, 24, RES_COLOR.o2, 'warn', RES_INK.o2) + badge(k, 24, RES_COLOR.o2, 'bad') + '</div>';
  h += '</div>';
}
h += '<div class="o2"><b>Giysi havası (kask) yanında</b><div class="row" style="background:' + BGS[0][1] + '">' + badge('o2', 24, RES_COLOR.o2) + badge('helmet', 24, RES_COLOR.suit) + badge('o2', 48, RES_COLOR.o2) + badge('helmet', 48, RES_COLOR.suit) + '</div></div></div>';
h += '<h2>Eylem düğmeleri</h2><div class="grid">';
for (const [k, lab] of ACT) h += '<div class="it" style="background:' + BGS[0][1] + '"><div class="row">' + svg(k, 16, ACC) + svg(k, 24, ACC) + svg(k, 48, ACC) + '<span class="btn">' + svg(k, 18, ACC) + 'Kur</span>'.replace('Kur', lab.split(' ')[0].replace(':', '')) + '</div><div class="l">' + lab + ' <small>' + k + '</small></div></div>';
h += '</div><h2>Diğer ikonlar</h2><div class="grid">';
for (const [k, lab] of MISC) h += '<div class="it" style="background:' + BGS[0][1] + '"><div class="row">' + svg(k, 16, '#e9eef6') + svg(k, 24, '#e9eef6') + svg(k, 48, '#e9eef6') + '</div><div class="l">' + lab + ' <small>' + k + '</small></div></div>';
h += '</div><h2>3B rozetler (aynı yollar, drawGlyph ile tuvalde)</h2><div class="row" id="b3d" style="background:linear-gradient(135deg,#5c5b57,#2b2a28);padding:14px"></div>';
document.body.innerHTML = h;
// 3B rozet örnekleri: tuval → drawGlyph
const B3 = [['parts', '#ff4b3e', 'Arıza'], ['bolt', RES_COLOR.guc, 'Elektrik yok'], ['crew', RES_COLOR.ekip, 'Çalışan yok'], ['drop', RES_COLOR.su, 'Su yok'], ['bricks', RES_COLOR.malzeme, 'Malzeme yok'], ['pause', '#9fb2c8', 'Sığınakta'], ['off', '#8a94a3', 'Kapalı']];
for (const [k, col, lab] of B3) {
  for (const px of [24, 40, 64]) {
    const c = document.createElement('canvas'); c.width = c.height = px; const g = c.getContext('2d');
    const r = px * 0.3, p = px * 0.06; g.beginPath(); g.roundRect(p, p, px - 2 * p, px - 2 * p, r); g.fillStyle = 'rgba(8,11,18,.9)'; g.fill();
    g.beginPath(); g.roundRect(p * 2.2, p * 2.2, px - 4.4 * p, px - 4.4 * p, r * 0.8); g.fillStyle = col; g.fill();
    drawGlyph(g, k, px / 2, px / 2, px * 0.56, k === 'bolt' || k === 'off' || k === 'pause' ? '#10151d' : '#fff');
    document.getElementById('b3d').appendChild(c);
  }
  const s = document.createElement('span'); s.textContent = lab; s.style.cssText = 'color:#fff;font-size:12px;margin:0 16px 0 4px'; document.getElementById('b3d').appendChild(s);
}
// görev armaları (drawPatch)
{
  const PBG = ['#2f5fa8', '#1fa3b5', '#6d4bc4', '#e9632b', '#2c2f35', '#3fbf5f'];
  const sec = document.createElement('div'); sec.id = 'arma'; sec.innerHTML = '<h2>Görev armaları (drawPatch) · 64 px: her satır bir sembol, 3 şekil × 6 zemin</h2>';
  document.body.appendChild(sec);
  const cv = (spec, px, bg) => { const c = document.createElement('canvas'); c.width = c.height = px; drawPatch(c.getContext('2d'), spec, px); c.style.cssText = 'margin:2px;background:' + bg; return c; };
  for (const page of ['#05070d', '#e9e7e1']) {
    const box = document.createElement('div'); box.style.cssText = 'padding:8px;border-radius:8px;margin:6px 0;background:' + page; sec.appendChild(box);
    for (const sym of PATCH_SYMS) {
      const row = document.createElement('div'); row.className = 'row';
      const l = document.createElement('span'); l.textContent = sym; l.style.cssText = 'width:54px;font-size:12px;color:' + (page === '#05070d' ? '#e9eef6' : '#10151d'); row.appendChild(l);
      for (const shape of PATCH_SHAPES) for (const bg of PBG) row.appendChild(cv({ shape, bg, sym }, 64, page));
      box.appendChild(row);
    }
  }
  const h2 = document.createElement('h2'); h2.textContent = '128 px, kenar yazısıyla (karne ve 3B doku böyle görünür)'; sec.appendChild(h2);
  for (const page of ['#05070d', '#e9e7e1']) {
    const row = document.createElement('div'); row.className = 'row'; row.style.cssText = 'flex-wrap:wrap;padding:8px;border-radius:8px;margin:6px 0;background:' + page; sec.appendChild(row);
    PATCH_SYMS.forEach((sym, i) => row.appendChild(cv({ shape: PATCH_SHAPES[i % 3], bg: PBG[i % 6], sym, text: i % 2 ? 'UFUK-1 · ÖRNEK OYUNCU' : 'UFUK-2 · SELİM' }, 128, page)));
  }
  const u = document.createElement('p'); u.className = 'sub'; u.textContent = 'Bilinmeyen sembol → yıldız: '; u.appendChild(cv({ sym: 'yok-boyle', bg: '#2f5fa8' }, 64, '#05070d')); sec.appendChild(u);
}
window.done = true;
`;
const css = `body{margin:0;padding:18px 22px;background:#05070d;color:#e9eef6;font:13px/1.35 'Segoe UI',system-ui,sans-serif;width:1440px}
h1{font-size:20px;margin:0 0 2px}h2{font-size:15px;margin:18px 0 6px;color:#8fd0ff}.sub{color:#9aa8bc;margin:0}
table{border-collapse:separate;border-spacing:0 3px}th{font-weight:600;text-align:left;padding:0 6px;font-size:12px;color:#9aa8bc}
th.lab{width:150px;color:#e9eef6;font-size:13px;white-space:nowrap}th.lab small{display:block;color:#66748a;font-weight:400;font-size:10.5px}
.sw{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px}
td.blk{padding:4px 10px;border-radius:8px}.row{display:flex;align-items:center;gap:9px;flex-wrap:nowrap}.gap{width:10px}
.bare{display:inline-flex;width:22px;justify-content:center}
.o2row{display:flex;gap:14px}.o2{display:flex;flex-direction:column;gap:5px}.o2 .row{padding:8px 10px;border-radius:8px}
.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.it{border-radius:8px;padding:8px}.it .l{margin-top:4px;font-size:12px}.it small{color:#66748a}
.btn{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 9px;border-radius:8px;background:rgba(6,10,18,.5);border:1px solid rgba(150,200,255,.2);font-size:12px}`;
const html = `<!doctype html><meta charset="utf-8"><style>${css}</style><body><script>(function(){'use strict';\n${cizim}\n${page}\n})();</script>`;
const tmp = path.join(os.tmpdir(), 'ufuk-ikon-sayfasi.html'); fs.writeFileSync(tmp, html);

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];
const ctx = await browser.newContext({ viewport: { width: 1484, height: 900 }, deviceScaleFactor: 1 });
const pg = await ctx.newPage();
pg.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
pg.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
await pg.goto(pathToFileURL(tmp).href);
await pg.waitForFunction(() => window.done === true, null, { timeout: 10000 }).catch(() => errors.push('sayfa bitmedi'));
await pg.screenshot({ path: outPng, fullPage: true });
{ const el = await pg.$('#arma'); if (el) await el.screenshot({ path: outPng.replace(/\.png$/, '-arma.png') }); else errors.push('arma bölümü yok'); }

await pg.setViewportSize({ width: 1484, height: await pg.evaluate(() => document.documentElement.scrollHeight) });
const boxes = await pg.evaluate(() => [...document.querySelectorAll('.c16')].map(r => { const a = r.children[0].getBoundingClientRect(), b = r.children[2].getBoundingClientRect(); return { x: a.left - 4, y: a.top - 4, w: b.left - a.left + 4, h: Math.max(a.height, b.height) + 8 }; }));
const crops = [];
for (const b of boxes) { const c = { x: Math.floor(b.x), y: Math.floor(b.y), width: Math.ceil(b.w), height: Math.ceil(b.h) }; crops.push([(await pg.screenshot({ clip: c })).toString('base64'), c.width, c.height]); }
await pg.setViewportSize({ width: 1120, height: 200 });
await pg.setContent(`<body style="margin:0;background:#05070d;padding:8px;width:1100px">${crops.map(([c, w, h]) => `<img src="data:image/png;base64,${c}" style="image-rendering:pixelated;width:${w * 4}px;height:${h * 4}px;margin:4px">`).join('')}</body>`);
await pg.waitForTimeout(200);
await pg.screenshot({ path: outPng.replace(/\.png$/, '-16px-4x.png'), fullPage: true });
await browser.close();
console.log('yazıldı:', outPng);
console.log(errors.length ? 'HATALAR:\n' + errors.join('\n') : 'hata yok');
process.exit(errors.length ? 1 : 0);
