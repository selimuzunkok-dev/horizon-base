

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const build = fs.readFileSync(path.join(dir, 'build.mjs'), 'utf8');
const m = build.match(/const ORDER = \[([^\]]*)\]/);
if (!m) { console.error('HATA: build.mjs içinde ORDER bulunamadı'); process.exit(1); }
const ORDER = [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);


function declNames(rest) {
  const names = [];
  let i = 0, depth = 0, expectName = true, inStr = null;
  const takePattern = () => {
    const open = rest[i], close = open === '{' ? '}' : ']';
    let d = 0, j = i;
    for (; j < rest.length; j++) { if (rest[j] === open) d++; else if (rest[j] === close && --d === 0) break; }
    const body = rest.slice(i + 1, j);
    for (const part of body.split(',')) {
      const p = part.split('=')[0].trim();
      const nm = (p.includes(':') ? p.split(':')[1] : p).replace('...', '').trim();
      if (/^[A-Za-z_$][\w$]*$/.test(nm)) names.push(nm);
    }
    i = j + 1;
  };
  while (i < rest.length) {
    const c = rest[i];
    if (inStr) { if (c === '\\') i++; else if (c === inStr) inStr = null; i++; continue; }
    if (expectName) {
      if (/\s/.test(c)) { i++; continue; }
      if (depth === 0 && (c === '{' || c === '[')) { takePattern(); expectName = false; continue; }
      const id = rest.slice(i).match(/^[A-Za-z_$][\w$]*/);
      if (id) { names.push(id[0]); i += id[0].length; }
      expectName = false; continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; i++; continue; }
    if (c === '/' && rest[i + 1] === '/') break;
    if ('([{'.includes(c)) depth++;
    else if (')]}'.includes(c)) depth--;
    else if (c === ',' && depth === 0) expectName = true;
    else if (c === ';' && depth === 0) break;
    i++;
  }
  return names;
}

const seen = new Map();
for (const f of ORDER) {
  const p = path.join(dir, 'src', f);
  if (!fs.existsSync(p)) continue;
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  lines.forEach((ln, idx) => {
    let names = [];
    let r;
    if ((r = ln.match(/^(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/))) names = [r[1]];
    else if ((r = ln.match(/^class\s+([A-Za-z_$][\w$]*)/))) names = [r[1]];
    else if ((r = ln.match(/^(?:const|let|var)\s+(.*)$/))) names = declNames(r[1]);
    for (const n of names) {
      if (!seen.has(n)) seen.set(n, []);
      seen.get(n).push(`${f}:${idx + 1}`);
    }
  });
}

let bad = 0;
for (const [n, where] of seen) {
  const files = new Set(where.map(w => w.split(':')[0]));
  if (where.length > 1) {
    bad++;
    console.log(`ÇAKIŞMA ${n}: ${where.join(', ')}${files.size === 1 ? ' (aynı dosyada)' : ''}`);
  }
}
console.log(`ad-cakisma: ${ORDER.length} dosya, ${seen.size} üst düzey ad, ${bad} çakışma`);
process.exit(bad ? 1 : 0);
