

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
const out = process.env.SHOTS || path.join(dir, 'shots-model'); fs.mkdirSync(out, { recursive: true });
const src = fs.readFileSync(path.join(dir, '..', 'src', 'modeller.js'), 'utf8');
const cizim = fs.readFileSync(path.join(dir, '..', 'src', 'cizim.js'), 'utf8').replace(/^'use strict';\s*/, '');

const sahne = `
const KEYS = ['hub','gunes','batarya','reaktor','oksijen','su','geri','sera','yasam','spor','anten','maden','atolye','lab','pist'];
let R, S, C, sun, amb, hemi, nightMats = new Set(), base = new Map(), relicBlink = [];
function init() {
  R = new THREE.WebGLRenderer({ antialias: true });
  R.setSize(innerWidth, innerHeight); R.setPixelRatio(1);
  R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.0;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(R.domElement);
  C = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
}
window.build = (world, night) => {
  const mars = world === 'mars';
  S = new THREE.Scene(); nightMats = new Set(); relicBlink = [];
  S.background = new THREE.Color(night ? (mars ? 0x0b0a12 : 0x020306) : (mars ? 0xc99872 : 0x05060a)).convertSRGBToLinear();
  if (mars) S.fog = new THREE.FogExp2(new THREE.Color(night ? 0x0b0a12 : 0xc99872).convertSRGBToLinear(), night ? 0.006 : 0.008);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: new THREE.Color(mars ? 0xb4553a : 0x8a8a86).convertSRGBToLinear(), roughness: 1 }));
  g.rotation.x = -Math.PI / 2; g.receiveShadow = true; S.add(g);
  sun = new THREE.DirectionalLight(mars ? 0xffe2c0 : 0xffffff, night ? 0.08 : (mars ? 2.4 : 3.2));
  sun.position.set(-60, mars ? 45 : 22, 35); sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096); Object.assign(sun.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50, near: 1, far: 250 });
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02; sun.shadow.camera.updateProjectionMatrix(); S.add(sun);
  amb = new THREE.AmbientLight(mars ? 0xffd2b0 : 0x8090b0, night ? 0.05 : (mars ? 0.35 : 0.08)); S.add(amb);
  if (mars && !night) { hemi = new THREE.HemisphereLight(0xe8b890, 0x6a3020, 0.5); S.add(hemi); }
  if (night) { const e = new THREE.DirectionalLight(0x6f8fd0, 0.25); e.position.set(30, 20, -40); S.add(e); }
  const add = (o, x, z) => { o.position.set(x, 0, z); o.userData.z = z; S.add(o); (o.userData.nightMats || []).forEach(m => nightMats.add(m)); return o; };
  const stats = [];
  KEYS.forEach((k, i) => {
    const o = add(MODEL.building(k, world), (i % 5 - 2) * 9, (Math.floor(i / 5) - 1) * 9);
    const u = o.userData;
    stats.push({ k, tris: MODEL.tris(o), h: u.h, r: u.r, anim: u.anim.length, sun: !!u.sunTrack, night: u.nightMats.length, work: u.workMats.length });
  });
  add(MODEL.building('hub', world), -18, 19); add(MODEL.shield('hub', mars ? '#a9583c' : '#8a8a86'), -18, 19);
  add(MODEL.building('yasam', world), -9, 19); add(MODEL.shield('yasam', mars ? '#a9583c' : '#8a8a86'), -9, 19);
  const L = add(MODEL.lander(), 2, 19); L.userData.flame.visible = true; L.position.y = 2;
  ['#d0402c', '#2f6fd0', '#e8a21e', '#3fae5a'].forEach((c, i) => { const a = add(MODEL.astronaut(c), 8 + i * 1.6, 19 + (i % 2)); a.rotation.y = 0.6 - i * 0.5; if (i % 2) { a.userData.legL.rotation.x = 0.5; a.userData.legR.rotation.x = -0.5; a.userData.armL.rotation.x = -0.4; a.userData.armR.rotation.x = 0.4; } });
  { const A = add(MODEL.astronaut('#d0402c'), 0, -30), u = A.userData; u.legL.rotation.x = 0.4; u.legR.rotation.x = -0.4; u.armL.rotation.x = -0.32; u.armR.rotation.x = 0.32; stats.push({ k: 'astronot', tris: MODEL.tris(A), h: u.h, r: u.r }); }
  { const o = add(MODEL.rover(world), 34, 19); o.rotation.y = -0.7; stats.push({ k: 'gezgin', tris: MODEL.tris(o), h: o.userData.h, r: o.userData.r, night: o.userData.lamp ? 1 : 0 }); }
  for (let i = 0; i < 3; i++) { const o = add(MODEL.relic(world, i), -18 + i * 9, 29); stats.push({ k: 'relic' + i, tris: MODEL.tris(o), h: o.userData.h, r: o.userData.r, blink: !!o.userData.blink }); }
  { const o = add(MODEL.capsule(), 24, 19); o.userData.flame.visible = true; o.position.y = 1.2; o.userData.hatch.rotation.y = -1.6; stats.push({ k: 'kapsul', tris: MODEL.tris(o), h: o.userData.h, r: o.userData.r });
    const c = add(MODEL.cookies(), 22, 21); stats.push({ k: 'kurabiye', tris: MODEL.tris(c), h: c.userData.h, r: c.userData.r }); }
  ['i', 'm', 't', 'r', 'c'].forEach((k, i) => { const o = add(MODEL.deposit(k, world, 11 + i), 9 + (i % 2) * 9, 29 + Math.floor(i / 2) * 9 - (i > 1 ? 0 : 0)); stats.push({ k: 'dep-' + k, tris: MODEL.tris(o), r: o.userData.r }); });
  nightMats.forEach(m => { if (!base.has(m)) base.set(m, m.emissiveIntensity); m.emissiveIntensity = base.get(m) * (night ? 2.2 : 1); });
  return stats;
};
// arka çekim için güneşi karakterin arkasına al (oyuncu kamerası güneşi arkasına aldığında böyle görür); null → varsayılan
window.sunAt = p => { const m = !!S.fog; p = p || [-60, m ? 45 : 22, 35]; sun.position.set(p[0], p[1], p[2]); };
window.solo = (z0, z1) => { S.children.forEach(o => { if (o.userData.z != null) o.visible = z0 == null || (o.userData.z >= z0 && o.userData.z <= z1); }); };
window.cam = (px, py, pz, tx, ty, tz, fov) => { C.fov = fov || 45; C.updateProjectionMatrix(); C.position.set(px, py, pz); C.lookAt(tx, ty, tz); R.render(S, C); return R.info.render.triangles; };
// kozmetik denetimi: önbellek büyümez, renkler doğru malzemeye gider
window.lookCheck = () => {
  const L = c => '#' + c.clone().convertLinearToSRGB().getHexString();
  const m = k => MODEL.mat(k);
  const n0 = MODEL.matCount();
  const before = { lander: L(m('craftBand').color), bld: L(m('bldTrim').color) };
  MODEL.setLook({ visor: '#aeb8c4', bld: { trim: '#e8b62c' }, craft: { band: '#1fa3b5', nose: '#2f5fa8' }, rover: { body: '#f2c230', trim: '#2c2f35' },
    patch: { shape: 'kalkan', bg: '#6d4bc4', sym: 'roket', text: 'UFUK-1 · TEST' } });
  const after = { bld: L(m('bldTrim').color), band: L(m('craftBand').color), nose: L(m('craftNose').color), body: L(m('roverBody').color), trim: L(m('roverTrim').color), visor: L(m('visor').color), accent: L(m('accent').color) };
  MODEL.setLook({ visor: 'kırmızı', bld: { trim: 12 } }); // hex olmayan değer yok sayılır
  const ignored = L(m('visor').color) === '#aeb8c4' && L(m('bldTrim').color) === '#e8b62c';
  const n1 = MODEL.matCount();
  const cv = MODEL.patchCanvas(), g = cv.getContext('2d'), px = g.getImageData(0, 0, cv.width, cv.height).data;
  let opaque = 0, cols = new Set();
  for (let i = 0; i < px.length; i += 16) if (px[i + 3] > 200) { opaque++; cols.add(px[i] >> 4 << 8 | px[i + 1] >> 4 << 4 | px[i + 2] >> 4); }
  const corner = px[3];
  return { n0, n1, before, after, ignored, opaque, cols: cols.size, corner, drawPatch: typeof drawPatch === 'function' };
};
window.lookSet = spec => MODEL.setLook(spec);
init();
`;
const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#000;overflow:hidden}</style><body>
<script src="${pathToFileURL(path.join(dir, '..', 'vendor', 'three.min.js')).href}"></script>
<script>(function(){'use strict';\n${cizim}\n${src}\nwindow.MODEL = MODEL; window.drawPatch = drawPatch;\n})();</script>
<script>${sahne}</script>`;
const tmp = path.join(os.tmpdir(), 'ufuk-modeller-onizleme.html'); fs.writeFileSync(tmp, html);

const flags = process.env.SWIFT ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [];
const browser = await chromium.launch({ channel: 'msedge', headless: true, args: flags });
const errors = [];
const page = await (await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })).newPage();
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
await page.goto(pathToFileURL(tmp).href); await page.waitForTimeout(800);
const ok = await page.evaluate(() => typeof THREE !== 'undefined' && typeof MODEL !== 'undefined' && typeof build === 'function');
if (!ok || !(await page.evaluate(() => !!window.cam && !!document.querySelector('canvas')))) { console.log('Sayfa kurulamadı (WebGL?)', errors); await browser.close(); process.exit(1); }
const shot = async (n, ...c) => { const so = c.length > 7 ? c.splice(7) : [null, null]; await page.evaluate(([c, so]) => { window.solo(...so); window.cam(...c); }, [c, so]); await page.screenshot({ path: path.join(out, n + '.png') }); };
let fail = 0;
for (const w of ['ay', 'mars']) {
  const stats = await page.evaluate(w => window.build(w, false), w);
  if (w === 'ay') console.table(stats);

  if (w === 'mars') console.table(stats.filter(s => ['hub', 'astronot', 'gezgin', 'kapsul'].includes(s.k)));
  for (const s of stats) if (s.tris > (s.k === 'astronot' ? 3500 : 1500)) { console.log('ÜÇGEN SINIRI AŞILDI', w, s.k, s.tris); fail++; }
  if (!stats.some(s => s.k === 'gezgin' && s.tris > 100)) { console.log('GEZGİN YOK', w); fail++; }
  await shot(`${w}-1-hepsi`, 0, 34, 58, 0, 0, 10, 45);
  await shot(`${w}-2-sira1`, 4, 7, -9 + 15, 0, 1.8, -9, 50, -9, -9);
  await shot(`${w}-3-sira2`, 4, 7, 0 + 15, 0, 1.8, 0, 50, 0, 0);
  await shot(`${w}-4-sira3`, 4, 7, 9 + 15, 0, 1.8, 9, 50, 9, 9);
  await shot(`${w}-5-ekler`, -3, 7, 32, -3, 2, 19, 50, 19, 20);
  await shot(`${w}-5f-kapsul`, 27, 4.5, 27, 23.5, 2.2, 19.5, 45, 19, 21);
  await shot(`${w}-6-kalintilar`, -9, 6, 39, -9, 0.8, 29, 50, 29, 29);
  await shot(`${w}-6b-yataklar`, 13, 12, 52, 13, 0, 36, 50, 29, 47);
  await shot(`${w}-5e-astronot-arka-golgede`, 0.7, 2.1, -34.4, 0, 1.25, -30, 32, -30, -30);
  await page.evaluate(() => window.sunAt([30, 28, -75]));
  await shot(`${w}-5b-astronot-arka`, 0.7, 2.1, -34.4, 0, 1.25, -30, 32, -30, -30);
  await page.evaluate(() => window.sunAt(null));
  await page.evaluate(() => window.sunAt([60, 30, -10]));
  await shot(`${w}-5c-astronot-yan`, 3.2, 1.3, -30.2, 0, 1.0, -30, 32, -30, -30);
  await page.evaluate(() => window.sunAt(null));
  await shot(`${w}-5d-astronot-on`, -0.8, 1.5, -27, 0, 1.1, -30, 32, -30, -30);
  await shot(`${w}-7-tepeden`, 0, 95, 12.01, 0, 0, 12, 45, null, null);
  await shot(`${w}-7b-tepeden-yakin`, 0, 48, 0.01, 0, 0, 0, 45, -9, 9);

  await shot(`${w}-10-gezgin`, 38.5, 2.6, 23.5, 34, 0.9, 19, 45, 19, 19);
  await shot(`${w}-10b-hub-arma-tepe`, -18, 12, 25, -18, 3.4, 19, 32, 19, 19);
  await shot(`${w}-10c-hub-arma-yan`, -11, 3.5, 19.5, -18, 3, 19, 40, 19, 19);
  await shot(`${w}-10d-gogus-arma`, 8.6, 1.5, 21.2, 8.1, 1.35, 19.1, 22, 19, 20);
  await page.evaluate(w => window.build(w, true), w);
  await shot(`${w}-8-gece`, 0, 30, 52, 0, 0, 8, 45, null, null);
  await shot(`${w}-9-gece-yakin`, 4, 7, 0 + 15, 0, 1.8, 0, 50, 0, 0);
  await shot(`${w}-10e-gezgin-gece`, 38.5, 2.6, 23.5, 34, 0.9, 19, 45, 19, 19);
}

{
  await page.evaluate(() => window.build('ay', false));
  const r = await page.evaluate(() => window.lookCheck());
  console.log('setLook:', JSON.stringify(r));
  if (r.n1 !== r.n0) { console.log('setLook MALZEME ÖNBELLEĞİNİ BÜYÜTTÜ', r.n0, '→', r.n1); fail++; }
  const a = r.after;
  if (a.bld !== '#e8b62c' || a.band !== '#1fa3b5' || a.nose !== '#2f5fa8' || a.body !== '#f2c230' || a.trim !== '#2c2f35' || a.visor !== '#aeb8c4') { console.log('setLook RENKLERİ YANLIŞ', a); fail++; }
  if (a.accent !== '#2f5fa8') { console.log('kurabiye kutusu (accent) boyandı', a.accent); fail++; }
  if (!r.ignored) { console.log('hex olmayan değer uygulandı'); fail++; }
  if (!r.drawPatch || r.opaque < 1000 || r.cols < 6 || r.corner !== 0) { console.log('ARMA ÇİZİLMEDİ ya da köşe saydam değil', r); fail++; }
  await shot('ay-11-kozmetik-hepsi', 0, 34, 58, 0, 0, 10, 45);
  await shot('ay-11b-kozmetik-gezgin-hub', 18, 9, 34, 10, 1.5, 19, 45, 19, 19);
  await page.evaluate(() => window.build('mars', false));
  await shot('mars-11b-kozmetik-gezgin-hub', 18, 9, 34, 10, 1.5, 19, 45, 19, 19);
  await page.evaluate(() => window.lookSet({ visor: '#b8862c', bld: { trim: '#2f5fa8' }, craft: { band: '#2f5fa8', nose: '#c8372d' }, rover: { body: '#e6e5e0', trim: '#2f5fa8' }, patch: null }));
}
await browser.close();
console.log('ekran görüntüleri:', out);
if (errors.length) { console.log('KONSOL HATALARI:\n' + errors.join('\n')); fail++; }
console.log(fail ? `BAŞARISIZ (${fail})` : 'TAMAM');
process.exit(fail ? 1 : 0);
