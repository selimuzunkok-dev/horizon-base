

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const rd = f => fs.readFileSync(path.join(dir, 'src', f), 'utf8');
const ORDER = ['veri.js', 'gercek.js', 'cekirdek.js', 'hikaye.js', 'cizim.js', 'modeller.js', 'yol.js', 'sahne.js', 'harita.js', 'iskart.js', 'egitim.js', 'ogret.js', 'giris.js', 'arayuz.js'];
const missing = ORDER.filter(f => !fs.existsSync(path.join(dir, 'src', f)));
if (missing.length) console.warn('UYARI: eksik kaynak atlandı:', missing.join(', '));
const css = rd('stil.css'), body = rd('govde.html');
const js = ORDER.filter(f => !missing.includes(f)).map(f => `/* ── ${f} ── */\n` + rd(f).replace(/^'use strict';\s*/, '')).join('\n');
const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap">';
const lib = fs.readFileSync(path.join(dir, 'vendor', 'three.min.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
const THREE = `<script>
${lib}
</script>`;
const AI = "This game's code, texts and procedural 3D models were generated with Claude Code (Anthropic's AI coding agent) under the team's direction. Three.js r128 (MIT license) is embedded.";
const head = `<!-- AI acknowledgment: ${AI} -->
<title>Ufuk Üssü</title>\n<meta name="claude:viewport-fit-sides" content="cover">
<meta name="ai-generated" content="${AI}">\n${FONTS}\n<style>\n${css}</style>`;
const script = `${THREE}\n<script>\n(function () {\n'use strict';\n${js}\n})();\n</script>`;
fs.writeFileSync(path.join(dir, 'artifact.html'), `${head}\n${body}\n${script}\n`);
fs.writeFileSync(path.join(dir, 'index.html'),
  `<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="description" content="Ufuk Üssü: öğrenciler için 3B Ay ve Mars üssü kurma oyunu.">\n${head}\n</head>\n<body>\n${body}\n${script}\n</body>\n</html>\n`);
const kb = f => (fs.statSync(path.join(dir, f)).size / 1024).toFixed(0) + ' KB';
console.log('index.html', kb('index.html'), '· artifact.html', kb('artifact.html'));
