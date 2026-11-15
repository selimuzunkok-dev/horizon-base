'use strict';


const EGITIM = (() => {
  const fn = f => typeof f === 'function';
  const Lx = (tr, en) => ({ tr, en });
  const words = t => String(t).split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;

  const readMs = o => Math.round((2.5 + 0.8 * words(o && o.tr != null ? (typeof LANG !== 'undefined' && o[LANG] != null ? o[LANG] : o.tr) : o)) * 1000);

  const minSay = o => Math.round((1 + 0.5 * words(o && o.tr != null ? (typeof LANG !== 'undefined' && o[LANG] != null ? o[LANG] : o.tr) : o)) * 1000);
  const STUCK_MS = 10000, SHOW_MS = 20000, OK_MS = 1600;


  const countK = (s, k) => s.b.filter(b => b.k === k).length;
  const working = (s, k) => s.b.some(b => b.k === k && b.left === 0 && b.on !== false && !b.broken);
  const hubOf = s => s.b.find(b => b.k === 'hub');
  const tilePos = (x, y) => (typeof wpos === 'function' ? wpos(x, y) : { x: x * 4 + 2, z: y * 4 + 2 });
  const tileK = (s, x, y) => (typeof tileAt === 'function' ? tileAt(s, x, y) : s.map.k[y * MW() + x]);
  const HX = () => (typeof HUBX !== 'undefined' ? HUBX : 12), HY = () => (typeof HUBY !== 'undefined' ? HUBY : 7);
  const MW = () => (typeof MAPW !== 'undefined' ? MAPW : 24), MH = () => (typeof MAPH !== 'undefined' ? MAPH : 15);
  const seen = (s, x, y) => (typeof isSeen === 'function' ? isSeen(s, x, y) : true);
  const busy = (s, x, y) => s.b.some(b => b.x === x && b.y === y);

  function walkSpot(s) {
    let best = null;
    for (let y = 0; y < MH(); y++) for (let x = 0; x < MW(); x++) {
      const d = Math.hypot(x - HX(), y - HY());
      if (d < 2.5 || d > 4.2 || !seen(s, x, y) || tileK(s, x, y) !== '.' || busy(s, x, y)) continue;
      const sc = Math.abs(d - 3.3) + 0.9 * Math.abs(y - HY()) + (x < HX() ? 0.2 : 0);
      if (!best || sc < best.sc) best = { x, y, sc };
    }
    return best ? { tx: best.x, ty: best.y } : { tx: HX() + 3, ty: HY() + 1 };
  }

  function iceSpot(s) {
    let best = null;
    for (let y = 0; y < MH(); y++) for (let x = 0; x < MW(); x++) {
      if (tileK(s, x, y) !== 'i' || (s.scanned && s.scanned[y * MW() + x])) continue;
      const d = Math.hypot(x - HX(), y - HY()) + (seen(s, x, y) ? 0 : 50);
      if (!best || d < best.d) best = { x, y, d };
    }
    return best ? { tx: best.x, ty: best.y } : null;
  }
  const atTile = o => (o ? Object.assign(tilePos(o.tx, o.ty), { tx: o.tx, ty: o.ty }) : null);
  const atB = b => (b ? Object.assign(tilePos(b.x, b.y), { tx: b.x, ty: b.y }) : null);
  const dist = (p, q) => (p && q ? Math.hypot(p.x - q.x, p.z - q.z) : 1e9);


  function doBreak(s, k) {
    if (typeof trainBreak === 'function') { const id = trainBreak(s, k); if (id != null) return id; }
    const b = s.b.find(o => o.k === k && o.left === 0 && !o.broken) || s.b.find(o => o.k !== 'hub' && o.left === 0 && !o.broken);
    if (!b) return null;
    b.broken = true; return b.id;
  }
  function doShip(s) {
    if (typeof trainShip === 'function') return !!trainShip(s);
    if (s.pending.some(p => p.type === 'cargo')) return true;
    if (typeof pushCargo === 'function') { pushCargo(s); return true; }
    s.shipAt = s.t + 1; return true;
  }
  function doAsk(s) {
    const before = s.pending.map(p => p.pid);
    let ok = false;
    if (typeof trainAsk === 'function') ok = !!trainAsk(s);
    else if (typeof pushEvent === 'function' && typeof EVENTS !== 'undefined' && EVENTS.egitim) ok = !!pushEvent(s, 'egitim');
    const p = ok ? s.pending.find(o => o.type === 'event' && !before.includes(o.pid)) : null;
    return p ? p.pid : null;
  }


  const FORCE_Q = { act: 'repair', id: 'r_egt_panel' };
  function forceQ(s) {
    const put = o => { try { if (o) (o.fx || (o.fx = {})).forceQ = Object.assign({}, FORCE_Q); } catch (e) {   } };
    put(s);
    try { if (typeof UI !== 'undefined' && UI && UI.s && UI.s !== s) put(UI.s); } catch (e) {   }
  }



  const BUILD_SEL = '#acts [data-act="buildMenu"], [data-act="buildMenu"]';
  const MENU_SEL = '#menuBtn, #pdaBtn, [data-act="pda"]';
  const buildSel = k => env => (env.ui.plan ? `#drawer [data-k="${k}"]` : BUILD_SEL);
  const steps = [
    { id: 'amac', topic: 'goal', sn: 25, closeCard: true, world: true,
      say: Lx('Merhaba {ad}! Görevimiz: ekibi hayatta tutmak. Üsse dokun.', 'Hi {ad}! Our job: keep the crew alive. Tap the base.'),
      say2: Lx('Parlayan halkanın içindeki yapıya dokun.', 'Tap the building inside the glowing ring.'),
      goal: Lx('Üsse dokun', 'Tap the base'),
      ok: Lx('Harika! Burası ekibin evi.', 'Great! This is the crew\'s home.'),
      at: s => atB(hubOf(s)),
      done: (s, env) => { const h = hubOf(s); return !!h && (env.ui.selB === h.id || env.clicked('hub')); } },
    { id: 'yuru', topic: 'walk', sn: 30, world: true,
      say: Lx('İşarete dokun, astronot oraya yürür.', 'Tap the marker, the astronaut walks there.'),
      say2: Lx('Parlayan yuvarlağa dokun. Sen oraya yürürsün.', 'Tap the glowing circle. You walk there.'),
      goal: Lx('İşarete dokun', 'Tap the marker'),
      ok: Lx('Süper! Artık üste dolaşabilirsin.', 'Super! Now you can get around.'),
      setup: (s, st) => { st.spot = walkSpot(s); },
      at: (s, st) => atTile(st.spot),
      done: (s, env, st) => dist(env.player, atTile(st.spot)) < 9 },
    { id: 'halka', topic: 'rings', sn: 20, waitClose: true,
      say: Lx('Köşedeki halkalar üssü gösterir. Hava halkasına dokun.', 'The rings in the corner show the base. Tap the air ring.'),
      say2: Lx('Sol alttaki ilk halkaya dokun.', 'Tap the first ring at the bottom left.'),
      goal: Lx('Hava halkasına dokun', 'Tap the air ring'),
      ok: Lx('Bu halka havamız. Azalırsa tehlike!', 'This ring is our air. If it drops, danger!'),
      sel: () => '#g-o2',
      done: (s, env) => env.clicked('#g-o2') },
    { id: 'panel', topic: 'build', sn: 40, only: 'gunes',
      say: Lx('Önce elektrik lazım. Kur\'a bas, Güneş Paneli seç.', 'First we need power. Press Build, pick Solar Panel.'),
      say2: Lx('Kur düğmesine bas. Sonra paneli işarete koy.', 'Press the Build button. Then put the panel on the marker.'),
      goal: Lx('Güneş paneli kur', 'Build a solar panel'),
      ok: Lx('Harika! Panel güneşten elektrik yapacak.', 'Great! The panel will make power from sunlight.'),
      okOg: Lx('Harika! Soldaki kart yeni bilgini gösterir.', 'Great! The card on the left shows what you learned.'), okSel: '#ogCard',
      setup: (s, st) => { st.n0 = countK(s, 'gunes'); st.spot = typeof suggestSpot === 'function' ? suggestSpot(s, 'gunes') : null; },
      sel: buildSel('gunes'),
      at: (s, st) => (st.spot ? atTile({ tx: st.spot.x, ty: st.spot.y }) : null),
      done: (s, env, st) => countK(s, 'gunes') > st.n0 },
    { id: 'hava', topic: 'power', sn: 45, fast: true, only: 'oksijen',
      say: Lx('Şimdi Hava Makinesi kur. Panel ona elektrik verir.', 'Now build an Air Maker. The panel powers it.'),
      say2: Lx('Kur\'a bas, Hava Makinesi\'ni seç, yere koy.', 'Press Build, pick Air Maker, put it down.'),
      goal: Lx('Hava makinesi kur', 'Build an Air Maker'),
      ok: Lx('Panel elektrik verir, makine hava yapar.', 'The panel gives power, the machine makes air.'),
      tip: { say: Lx('Malzemen burada. Harcayınca eksi sayı çıkar.', 'Your material is here. Spending shows a minus number.'), sel: '#drRes', when: env => !!env.ui.plan },
      setup: (s, st) => { st.n0 = countK(s, 'oksijen'); st.spot = typeof suggestSpot === 'function' ? suggestSpot(s, 'oksijen') : null; },
      sel: (env, s) => (s && countK(s, 'oksijen') ? null : buildSel('oksijen')(env)),
      at: (s, st) => { const b = s.b.find(o => o.k === 'oksijen'); return b ? atB(b) : (st.spot ? atTile({ tx: st.spot.x, ty: st.spot.y }) : null); },

      done: (s, env, st) => countK(s, 'oksijen') > (st.n0 || 0) },
    { id: 'tara', topic: 'scan', sn: 35, world: true,
      say: Lx('Mavi alanda buz olabilir. Yanına git ve incele.', 'There may be ice on the blue patch. Go and scan it.'),
      say2: Lx('Mavi alana dokun. Yanına varınca İncele\'ye bas.', 'Tap the blue patch. When you arrive, press Scan.'),
      goal: Lx('Buzu incele', 'Scan the ice'),
      ok: Lx('Buz bulduk! Buz eriyince su olur.', 'We found ice! Melted ice becomes water.'),
      tip: { say: Lx('Sağ üstteki harita üssü ve seni gösterir.', 'The map at the top right shows the base and you.'), sel: '#hrMini', when: () => true },
      setup: (s, st) => { st.n0 = s.stat.scans || 0; st.spot = iceSpot(s); if (st.spot && typeof reveal === 'function' && !seen(s, st.spot.tx, st.spot.ty)) reveal(s, st.spot.tx, st.spot.ty, 1); },
      at: (s, st) => atTile(st.spot),
      done: (s, env, st) => (s.stat.scans || 0) > st.n0 },
    { id: 'onar', topic: 'repair', sn: 35, closeCard: true, world: true,
      say: Lx('Panel bozuldu! Onarırken soru gelir; yanlışta fazla yedek parça gider.', 'The panel broke! Fixing brings a question; wrong costs extra spare parts.'),
      say2: Lx('Kırmızı işaretli panele dokun, sonra Onar\'a bas.', 'Tap the panel with the red sign, then press Repair.'),
      goal: Lx('Paneli onar', 'Fix the panel'),
      ok: Lx('Sağlam iş! Bilen astronot iyi onarır.', 'Solid work! A smart astronaut fixes well.'),
      okBad: Lx('Olsun! Doğrusunu öğrendin: gerçek görevde işine yarar.', 'That\'s okay! Now you know the right answer.'),
      bad: (s, st) => (s.stat.qeBad || 0) > (st.qb0 || 0),
      setup: (s, st) => { st.n0 = s.stat.repairs || 0; st.q0 = s.stat.qeN || 0; st.qb0 = s.stat.qeBad || 0; st.bid = doBreak(s, 'gunes'); if (st.bid == null) st.skip = true; if (s.res.parca < 4) s.res.parca = 4; forceQ(s); },
      at: (s, st) => atB(s.b.find(b => b.id === st.bid)),


      done: (s, env, st) => {
        if (st.bid == null) return true;
        const b = s.b.find(o => o.id === st.bid);
        const fixed = !b || !b.broken || (s.stat.repairs || 0) > st.n0;
        return fixed && !env.quickOpen() && !env.cardOpen();
      } },
    { id: 'soru', topic: 'atlas', sn: 30,
      say: Lx('ATLAS bir soru soruyor. Doğru şıkkı seç.', 'ATLAS has a question. Pick the right answer.'),
      say2: Lx('Karttaki şıklardan birine dokun.', 'Tap one of the answers on the card.'),
      goal: Lx('Soruyu yanıtla', 'Answer the question'),
      ok: Lx('Gerçek görevde yanlış yanıt bir şey kaybettirir.', 'In the real mission a wrong answer costs something.'),
      setup: (s, st) => { st.pid = doAsk(s); if (st.pid == null) st.skip = true; },
      sel: () => '#calls, .ik-card',
      done: (s, env, st) => st.pid == null || !s.pending.some(p => p.pid === st.pid) },
    { id: 'kargo', topic: 'cargo', sn: 40,
      say: Lx('Kargo gemisi indi! Yükü seç ve İndir\'e bas.', 'A cargo ship landed! Pick the load and press Unload.'),
      say2: Lx('Üstteki çağrıya dokun. Öner\'e, sonra İndir\'e bas.', 'Tap the call at the top. Press Suggest, then Unload.'),
      goal: Lx('Kargo gemisini boşalt', 'Unload the cargo ship'),
      ok: Lx('Gemi boşaldı! Gemiler az yük taşır, iyi seç.', 'Ship unloaded! Ships carry little, so choose well.'),
      setup: (s, st) => { st.n0 = s.stat.ships || 0; st.asked = doShip(s); if (!st.asked) st.skip = true; },
      sel: () => '#calls',
      done: (s, env, st) => !st.asked || (s.stat.ships || 0) > st.n0 },
    { id: 'tablet', topic: 'menu', sn: 20,
      say: Lx('Tablet\'i aç. Öğrendiklerin Defterim\'de birikir.', 'Open the Tablet. What you learn is saved in My Notebook.'),
      say2: Lx('Sağ alttaki Tablet düğmesine dokun.', 'Tap the Tablet button at the bottom right.'),
      goal: Lx('Tableti aç', 'Open the Tablet'),
      ok: Lx('İşte! Ödüller ve hedefler hep burada.', 'There! Rewards and goals are always here.'),
      sel: () => MENU_SEL,
      done: (s, env) => env.ui.pda != null },
    { id: 'son', topic: 'finish', sn: 20, final: true,
      say: Lx('İlk ödülün geliyor: Çaylak Astronot! Tablet\'i kapat.', 'Your first reward is coming: Rookie Astronaut! Close the Tablet.'),
      say2: Lx('Tablet\'in köşesindeki çarpıya dokun.', 'Tap the cross in the Tablet\'s corner.'),
      goal: Lx('Tableti kapat', 'Close the Tablet'),
      ok: null,
      done: (s, env) => env.ui.pda == null },
  ];

  function finalLine(world) {
    const W = typeof WORLDS !== 'undefined' && WORLDS[world] ? WORLDS[world] : { missionDays: 30 };
    const n = W.missionDays || 30, mars = world === 'mars';
    return Lx(`Şimdi gerçek görev! ${n} ${mars ? 'sol' : 'gün'} boyunca ekibi yaşat.`, `Now the real mission! Keep the crew alive for ${n} ${mars ? 'sols' : 'days'}.`);
  }


  let R = null;
  let lastExt = 0;

  const fill = (o, name) => (o ? { tr: o.tr.split('{ad}').join(name.tr), en: o.en.split('{ad}').join(name.en) } : o);
  function nameOf(ctx) { const n = String((ctx && ctx.name) || '').replace(/\s+/g, ' ').trim().slice(0, 18); return n ? { tr: n, en: n } : { tr: 'Komutan', en: 'Commander' }; }

  function touchDev() {
    try { if (typeof UI !== 'undefined' && UI && UI.touch != null) return !!UI.touch; } catch (e) {   }
    try { return typeof matchMedia === 'function' && !!matchMedia('(pointer: coarse)').matches; } catch (e) { return false; }
  }
  const tapTr = t => String(t).replace(/(^|[\s'’])bas(?=[\s.,!;]|$)/g, '$1dokun').replace(/(^|\s)tıkla(?=[\s.,!;]|$)/g, '$1dokun');
  const tapEn = t => String(t).replace(/\bPress\b/g, 'Tap').replace(/\bpress\b/g, 'tap').replace(/\bClick\b/g, 'Tap').replace(/\bclick\b/g, 'tap');
  const touchL = o => (o && touchDev() ? { tr: tapTr(o.tr), en: tapEn(o.en) } : o);
  function sayL(o, c, inst) {
    if (!o) return;
    const msg = touchL(fill(o, R ? R.name : { tr: '', en: '' }));

    if (R && !R.done && (R.pend.length || now() < R.sayFree)) { R.pend.push({ msg, c, inst }); return; }
    emitSay(msg, c, inst);
  }
  function emitSay(msg, c, inst) {
    if (inst && R) (R.inst || (R.inst = [])).push(msg);
    if (R && c === 'good') (R.good || (R.good = new Set())).add(msg);
    if (R) { R.sayFree = now() + minSay(msg); R.lastMsg = msg; }
    try { if (typeof subLocal === 'function') subLocal('atlas', msg, c || 'info', true); } catch (e) {   }
  }
  function flushSay(t) { while (R && R.pend.length && t >= R.sayFree) { const p = R.pend.shift(); emitSay(p.msg, p.c, p.inst); } }
  function snd(n) { try { if (typeof Snd !== 'undefined' && Snd && fn(Snd.play)) Snd.play(n); } catch (e) {   } }
  function uiState() {
    try { if (typeof UI !== 'undefined' && UI) return { selB: UI.selB, modal: UI.modal, pda: UI.pda, plan: UI.plan, mode: UI.mode }; } catch (e) {   }
    return { selB: null, modal: null, pda: null, plan: false, mode: null };
  }
  function quickOpen() { try { return typeof ISKART !== 'undefined' && ISKART && fn(ISKART.quickOpen) && !!ISKART.quickOpen(); } catch (e) { return false; } }
  const hasQuick = () => { try { return typeof ISKART !== 'undefined' && ISKART && fn(ISKART.quick); } catch (e) { return false; } };
  const ogOn = () => typeof OGRET !== 'undefined' && !!OGRET && typeof learnKey === 'function';
  function envNow() {
    let player = null;
    try { if (typeof S3 !== 'undefined' && S3 && S3.player) player = { x: S3.player.x, z: S3.player.z }; } catch (e) {   }
    const clicks = R ? R.clicks : {};
    return {
      ui: uiState(), player,
      clicked: sel => !!clicks[sel],
      cardOpen: () => { try { return typeof ISKART !== 'undefined' && ISKART && fn(ISKART.open) && !!ISKART.open(); } catch (e) { return false; } },
      quickOpen,
    };
  }


  const CSS = `.eg-skip{position:absolute;top:calc(env(safe-area-inset-top,0px) + 18px);left:204px;z-index:30;font:600 13px/1 'IBM Plex Sans',system-ui,sans-serif;color:#dfe5ef;text-shadow:0 1px 2px rgba(0,0,0,.55);
background:var(--gl-fill-1,rgb(var(--gl-tint,12 20 38) / .38));-webkit-backdrop-filter:var(--gl-bf-1,blur(12px) saturate(160%));backdrop-filter:var(--gl-bf-1,blur(12px) saturate(160%));
border:1px solid var(--gl-line,rgba(255,255,255,.18));box-shadow:var(--gl-in,inset 0 1px 0 rgba(255,255,255,.18)),0 4px 14px rgba(0,0,0,.3);border-radius:999px;padding:7px 12px;cursor:pointer;transition:transform .12s,border-color .15s,color .15s,box-shadow .15s}
@media (pointer:coarse),(max-height:480px){.eg-skip{-webkit-backdrop-filter:var(--gl-bf-1,none);backdrop-filter:var(--gl-bf-1,none);background:var(--gl-fill-1,rgb(var(--gl-tint,12 20 38) / .74))}}
@media (max-height:460px){#egSkip.eg-skip{top:calc(env(safe-area-inset-top,0px) + 60px);left:10px}#egShow.eg-show{top:calc(env(safe-area-inset-top,0px) + 74px);font-size:15px;min-height:44px}}.eg-skip:hover{color:#fff;border-color:rgba(255,255,255,.32);transform:translateY(-1px)}.eg-skip:active{transform:none;box-shadow:inset 0 2px 5px rgba(0,0,0,.35)}.eg-skip[data-arm="1"]{color:#ffe27a;border-color:rgba(255,226,122,.75);box-shadow:var(--gl-in,inset 0 1px 0 rgba(255,255,255,.18)),0 0 12px rgba(255,226,122,.3)}.eg-skip[hidden]{display:none}
.eg-step{position:absolute;top:calc(env(safe-area-inset-top,0px) + 25px);left:270px;z-index:30;font:600 14px/1 'IBM Plex Sans',system-ui,sans-serif;color:#c3cddc;letter-spacing:.04em;text-shadow:0 1px 2px rgba(0,0,0,.7),0 0 8px rgba(0,0,0,.45)}
.eg-hl2{outline:4px solid #ffe27a !important;outline-offset:4px;box-shadow:0 0 0 9px rgba(255,226,122,.28) !important;border-radius:12px;animation:eghl .7s infinite alternate}
.eg-show{position:fixed;top:calc(env(safe-area-inset-top,0px) + 92px);left:50%;transform:translateX(-50%);z-index:2147483000;min-height:48px;min-width:150px;font:700 17px/1 'IBM Plex Sans',system-ui,sans-serif;color:#10131a;
background:linear-gradient(180deg,color-mix(in srgb,#ffe27a 85%,#fff),#ffe27a);border:0;border-radius:999px;padding:12px 22px;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 0 0 6px rgba(255,226,122,.3);animation:eghl .7s infinite alternate}.eg-show[hidden]{display:none}
.eg-show:active{box-shadow:inset 0 2px 6px rgba(0,0,0,.28),0 0 0 6px rgba(255,226,122,.3)}
@keyframes eghl{from{box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 0 0 3px rgba(255,226,122,.2),0 0 10px rgba(255,226,122,.18)}to{box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 0 0 12px rgba(255,226,122,.38),0 0 22px rgba(255,226,122,.3)}}`;
  const SKIP = { tr: ['Geç', 'Emin misin? Geç'], en: ['Skip', 'Sure? Skip'] };
  const lang = () => (typeof LANG !== 'undefined' && LANG === 'en' ? 'en' : 'tr');
  function domInit() {
    if (typeof document === 'undefined' || !R) return;
    try {
      if (!document.getElementById('eg-css')) { const st = document.createElement('style'); st.id = 'eg-css'; st.textContent = CSS; document.head.appendChild(st); }
      const host = document.getElementById('hud') || document.body;
      let a = document.getElementById('egSkip');
      if (!a) {
        a = document.createElement('button'); a.id = 'egSkip'; a.className = 'eg-skip'; a.type = 'button';
        a.addEventListener('click', e => { e.stopPropagation(); onSkipTap(); });
        host.appendChild(a);
      }
      a.hidden = true; a.dataset.arm = ''; a.textContent = SKIP[lang()][0];
      let c = document.getElementById('egStep');
      if (!c) { c = document.createElement('div'); c.id = 'egStep'; c.className = 'eg-step'; host.appendChild(c); }
      c.hidden = true;
      if (!R.listen) {
        R.listen = e => {
          if (!R || !e.target || !fn(e.target.closest)) return;
          for (const sel of ['#g-o2', '#menuBtn', '#pdaBtn', '[data-act="pda"]', '[data-act="buildMenu"]', '#calls']) if (e.target.closest(sel)) R.clicks[sel] = 1;
        };
        document.addEventListener('pointerdown', R.listen, true);
        document.addEventListener('click', R.listen, true);
      }
    } catch (e) {   }
  }
  function domDone() {
    if (typeof document === 'undefined') return;
    try {
      for (const id of ['egSkip', 'egStep', 'egShow']) { const e = document.getElementById(id); if (e) e.remove(); }
      hl(null, false);
      if (R && R.listen) { document.removeEventListener('pointerdown', R.listen, true); document.removeEventListener('click', R.listen, true); }
    } catch (e) {   }
  }
  function hl(sel, strong) {
    if (typeof document === 'undefined') return;
    try {
      const key = (sel || '') + '|' + !!strong;
      if (R && R.hlKey === key && (!sel || document.querySelector('.tut-hl'))) return;
      document.querySelectorAll('.tut-hl, .eg-hl2').forEach(e => { e.classList.remove('tut-hl'); e.classList.remove('eg-hl2'); });
      if (R) R.hlKey = key;
      if (!sel) return;
      const e = document.querySelector(sel);
      if (e) { e.classList.add('tut-hl'); if (strong) e.classList.add('eg-hl2'); }
    } catch (e) {   }
  }
  function marker(at) {
    try { if (typeof S3 !== 'undefined' && S3 && fn(S3.setGoal)) S3.setGoal(at ? { x: at.x, z: at.z } : null); } catch (e) {   }
  }

  const SHOW = { tr: 'Bana göster', en: 'Show me' };
  const CLOSE_HINT = Lx('Okuyunca pencerenin çarpısına bas.', 'When you are done, press the window\'s cross.');
  function showBtn(on) {
    if (typeof document === 'undefined') return;
    try {
      let b = document.getElementById('egShow');
      if (!on) { if (b) b.hidden = true; return; }
      if (!b) {
        b = document.createElement('button'); b.id = 'egShow'; b.type = 'button'; b.className = 'eg-show';
        b.addEventListener('click', e => { e.stopPropagation(); showMe(); });
        document.body.appendChild(b);
      }
      b.textContent = '▶ ' + SHOW[lang()];

      if (showBlocked()) { if (!b.hidden) b.hidden = true; return; }
      if (b.hidden !== false || b.dataset.on !== '1') { b.hidden = false; b.dataset.on = '1'; }
      placeShow(b);
    } catch (e) {   }
  }
  const visR = e => { try { if (!e || e.hidden) return null; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return null; const r = e.getBoundingClientRect(); return r.width && r.height ? r : null; } catch (x) { return null; } };
  function showBlocked() {
    try {
      const u = uiState();
      if (u.modal) return true;
      if (u.pda && !(R && steps[R.i] && steps[R.i].id === 'son')) return true;
      if (quickOpen()) return true;
      if (typeof ISKART !== 'undefined' && ISKART && fn(ISKART.open) && ISKART.open()) return true;
      if (typeof document !== 'undefined') for (const sel of ['#ikQuick', '#scanCard', '.ik-card']) for (const e of document.querySelectorAll(sel)) if (visR(e)) return true;
    } catch (e) {   }
    return false;
  }

  const SHOW_OVER = ['#objective', '#objHow', '#pwWarn', '#calls', '#egStep', '#egSkip', '#planBar', '#planLabel', '#chapter'];
  function showTop(b) {
    const W = window.innerWidth, H = window.innerHeight, bw = b.offsetWidth || 160, bh = b.offsetHeight || 48;
    const x0 = W / 2 - bw / 2 - 8, x1 = W / 2 + bw / 2 + 8;
    let top = 12;
    const rects = [];
    for (const sel of SHOW_OVER) for (const e of document.querySelectorAll(sel)) { const r = visR(e); if (r && r.top < H * 0.6) rects.push(r); }

    let moved = true, guard = 0;
    while (moved && guard++ < 10) { moved = false; for (const r of rects) if (r.right > x0 && r.left < x1 && r.bottom > top && r.top < top + bh) { top = r.bottom + 8; moved = true; } }
    return Math.min(top, Math.max(12, H - bh - 12));
  }
  function placeShow(b) {
    if (typeof window === 'undefined') return;
    try { const t = Math.round(showTop(b)) + 'px'; if (b.style.top !== t) b.style.top = t; } catch (e) {   }
  }
  function showMe() {
    if (!R || R.phase !== 'do') return;
    const S = steps[R.i], s = R.s, st = R.st;
    showBtn(false); R.t0 = now(); R.shown = (R.shown || 0) + 1; st.shownT = now();
    try {
      const at = S.at ? S.at(s, st) : null;
      const walk = p => { try { if (p && typeof S3 !== 'undefined' && S3 && fn(S3.walkTo)) S3.walkTo(p.x, p.z); } catch (e) {   } };
      const tap = sel => { R.clicks[sel] = 1; const e = typeof document !== 'undefined' ? document.querySelector(sel) : null; if (e && fn(e.click)) e.click(); };
      const place = k => {
        const sp = typeof suggestSpot === 'function' ? suggestSpot(s, k) : null;
        if (sp && typeof build === 'function') build(s, k, sp.x, sp.y);
        if (typeof refresh === 'function') refresh(true);
      };
      switch (S.id) {
        case 'amac': R.clicks.hub = 1; { const h = hubOf(s); if (h && typeof modalBuilding === 'function') modalBuilding(h.id); } break;
        case 'yuru': walk(at); break;
        case 'halka': tap('#g-o2'); break;
        case 'panel': place('gunes'); break;
        case 'hava': if (!countK(s, 'oksijen')) place('oksijen'); break;
        case 'tara': if (st.spot) { walk(at); if (typeof scan === 'function') scan(s, st.spot.tx, st.spot.ty); if (typeof refresh === 'function') refresh(true); } break;
        case 'onar': { const b = s.b.find(o => o.id === st.bid); walk(at);
          let asked = false;
          if (b && b.broken && hasQuick()) { try { asked = !!ISKART.quick('repair', { b }); } catch (e) { asked = false; } }
          if (asked) st.quickShown = true;
          else if (b && b.broken && typeof repair === 'function') repair(s, b);
          if (typeof refresh === 'function') refresh(true); } break;
        case 'soru': { const p = s.pending.find(o => o.pid === st.pid); if (p && typeof resolve === 'function') { const ev = typeof EVENTS !== 'undefined' ? EVENTS[p.id] : null; const ci = ev && ev.ch ? Math.max(0, ev.ch.findIndex(c => c.ok)) : 0; resolve(s, ci, p.pid); }
          try { if (typeof ISKART !== 'undefined' && ISKART && fn(ISKART.close)) ISKART.close(); } catch (e) {   } break; }
        case 'kargo': { const p = s.pending.find(o => o.type === 'cargo'); if (p && typeof resolve === 'function') resolve(s, p.def, p.pid); if (typeof closeModal === 'function' && typeof UI !== 'undefined' && UI.modal) closeModal(); if (typeof refresh === 'function') refresh(true); } break;
        case 'tablet': if (typeof openPda === 'function') openPda(); break;
        case 'son': if (typeof closePda === 'function') closePda(); break;
      }
    } catch (e) { console.error(e); }
    snd('click');
  }
  function ping(at) { try { if (at && typeof S3 !== 'undefined' && S3 && fn(S3.ping)) S3.ping(at.x, at.z); } catch (e) {   } }
  function setFast(on) {
    try {
      if (typeof UI === 'undefined' || typeof setSpeed !== 'function' || typeof SPEEDS === 'undefined') return;
      if (on && UI.speed === 1) { setSpeed(SPEEDS.indexOf(2), true); R.fast = true; }
      else if (!on && R.fast) { if (UI.speed === 2) setSpeed(SPEEDS.indexOf(1), true); R.fast = false; }
    } catch (e) {   }
  }
  function onSkipTap() {
    if (!R) return;
    const a = typeof document !== 'undefined' ? document.getElementById('egSkip') : null;
    if (!R.skipArm) { R.skipArm = true; R.skipT = now(); if (a) { a.dataset.arm = '1'; a.textContent = SKIP[lang()][1]; } return; }
    skip();
  }
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());


  function dropInst(hard) {
    let old = R && R.inst; if (!old || !old.length) return;

    const young = now() < R.sayFree && (!hard || (R.good && R.good.has(R.lastMsg))) ? R.lastMsg : null;
    R.inst = young ? [young] : [];
    if (young) old = old.filter(m => m !== young);
    try { if (typeof UI === 'undefined' || !UI) return; if (Array.isArray(UI.subQ)) for (let k = UI.subQ.length - 1; k >= 0; k--) if (old.includes(UI.subQ[k].r && UI.subQ[k].r.text)) UI.subQ.splice(k, 1);
      if (UI.sub && old.includes(UI.sub.r && UI.sub.r.text) && typeof subNext === 'function') subNext(); } catch (e) {   }
  }
  function enterStep(i) {
    const st = {}; R.i = i; R.st = st; R.t0 = now(); R.phase = 'do'; R.hinted = false; R.okT = 0;
    const S = steps[i];
    try { if (S.setup) S.setup(R.s, st); } catch (e) { console.error(e); }
    if (st.skip && !S.final && i + 1 < steps.length) { R.times.push(0); R.skipped.push(S.id); enterStep(i + 1); return; }
    try { R.s.trainOnly = S.only || '-'; } catch (e) {   }
    showBtn(false);
    dropInst(true);
    R.pend = R.pend.filter(p => p.c === 'good');
    if (!(R.good && R.good.has(R.lastMsg))) R.sayFree = 0;
    sayL(S.say, 'info', true);
    marker(S.at ? S.at(R.s, st) : null);
    cam(!!S.world);
    if (typeof document !== 'undefined') { const c = document.getElementById('egStep'); if (c) { c.hidden = false; c.textContent = stepText(i); } }
  }
  const stepText = i => (lang() === 'en' ? `Step ${i + 1}/${steps.length}` : `Adım ${i + 1}/${steps.length}`);
  function cam(on) {
    try { if (R && R.cam !== on && typeof S3 !== 'undefined' && S3 && fn(S3.camFreeze)) { S3.camFreeze(on); R.cam = on; } } catch (e) {   }
  }
  function tipReady(tip) {
    try { if (!tip.when(envNow())) return false; return typeof document !== 'undefined' && !!document.querySelector(tip.sel); } catch (e) { return false; }
  }
  function curSel() {
    const S = steps[R.i]; if (!S || !S.sel) return null;
    try { return S.sel(envNow(), R.s) || null; } catch (e) { return null; }
  }
  function step(t) {
    if (!R || R.done) return;
    const S = steps[R.i], s = R.s;
    flushSay(t);
    if (R.skipArm && t - R.skipT > 5000) { R.skipArm = false; const a = typeof document !== 'undefined' ? document.getElementById('egSkip') : null; if (a) { a.dataset.arm = ''; a.textContent = SKIP[lang()][0]; } }
    if (typeof document !== 'undefined' && t - R.start > 20000) { const a = document.getElementById('egSkip'); if (a && a.hidden) a.hidden = false; }
    if (R.phase === 'do') {
      const env = envNow();
      let ok = false;
      try { ok = !!S.done(s, env, R.st); } catch (e) { ok = false; }
      if (!ok && R.st.shownT && t - R.st.shownT > 5000 && !quickOpen() && !R.st.quickShown) ok = true;
      if (S.fast) setFast(!ok && !!(S.wait && S.wait(s)));
      if (ok) {
        R.phase = 'ok'; R.okT = t; setFast(false); hl(null, false); marker(null); showBtn(false); cam(false);
        R.times.push(Math.round((t - R.t0) / 100) / 10);
        if (S.final) { dropInst(); snd('win'); R.endT = t + 600; return; }
        dropInst(true);
        R.pend = R.pend.filter(p => p.c === 'good');
        if (!(R.good && R.good.has(R.lastMsg))) R.sayFree = 0;
        let bad = false; try { bad = !!(S.okBad && S.bad && S.bad(s, R.st)); } catch (e) { bad = false; }
        const okL = bad ? S.okBad : (S.okOg && ogOn() ? S.okOg : S.ok);
        if (okL) sayL(okL, 'good', true);
        if (S.okSel && okL === S.okOg) R.okHl = S.okSel;
        snd('good');
        return;
      }
      if (S.tip && !R.st.tipT && t - R.t0 > Math.min(4000, readMs(S.say)) && tipReady(S.tip)) { R.st.tipT = t; sayL(S.tip.say, 'info', true); }
      if (R.st.tipT && t - R.st.tipT < 4000) { hl(S.tip.sel, false); return; }
      if (!R.hinted && t - R.t0 > STUCK_MS) { R.hinted = true; dropInst(); sayL(S.say2, 'info', true); ping(S.at ? S.at(s, R.st) : null); snd('click'); }
      if (R.hinted && t - (R.pingT || 0) > 3000) { R.pingT = t; ping(S.at ? S.at(s, R.st) : null); }
      if (t - R.t0 > SHOW_MS) showBtn(true);
      hl(curSel(), R.hinted);
      return;
    }
    if (R.phase === 'ok') {
      if (R.okHl) { hl(R.okHl, false); }
      if (S.final) { if (t >= R.endT) end(true); return; }
      if (t - R.okT >= OK_MS) {
        if (quickOpen()) return;
        if (S.waitClose && uiState().modal) {
          if (!R.st.closeHint && t - R.okT > 10000) { R.st.closeHint = true; sayL(CLOSE_HINT, 'info', true); }
          return;
        }
        if (S.closeCard) try { if (typeof UI !== 'undefined' && (UI.modal === 'bcard' || UI.modal === 'detail') && typeof closeModal === 'function') closeModal(); } catch (e) {   }
        R.okHl = null;
        enterStep(R.i + 1);
      }
    }
  }
  function end(done) {
    if (!R || R.done) return;
    R.done = true;
    const ctx = R.ctx;
    try { R.s.trainOnly = null; } catch (e) {   }

    try { if (typeof closeModal === 'function' && typeof UI !== 'undefined' && UI.modal) closeModal(); } catch (e) {   }
    try { if (typeof closePda === 'function' && typeof UI !== 'undefined' && UI.pda) closePda(); } catch (e) {   }
    try { if (typeof exitPlan === 'function' && typeof UI !== 'undefined' && UI.plan) exitPlan(); } catch (e) {   }
    try { if (typeof ISKART !== 'undefined' && ISKART && fn(ISKART.close)) ISKART.close(); } catch (e) {   }
    setFast(false); marker(null); cam(false); domDone();
    const res = { done, times: R.times.slice(), skipped: R.skipped.slice(), facts: factsOf(R.s, R.i, R.skipped) };
    const world = R.s && R.s.world, fin = !!(R.i === steps.length - 1 && R.phase === 'ok');
    EGITIM.last = res;
    R = null;
    try { if (ctx && fn(ctx.finish)) ctx.finish(done); } catch (e) { console.error(e); }

    if (fin) { let shown = false; try { const d = typeof document !== 'undefined' ? document.getElementById('egDone') : null; shown = !!(d && !d.hidden); } catch (e) { shown = false; } if (!shown) sayL(finalLine(world), 'good'); }
  }



  const SUM = [
    { icon: 'build', text: Lx('Yapı kurmak', 'Building things') },
    { icon: 'o2', text: Lx('Halkaları okumak', 'Reading the rings') },
    { icon: 'wrench', text: Lx('Onarım ve hızlı soru', 'Repairs and quick questions'), step: 'onar' },
    { icon: 'rocket', text: Lx('Kargo gemisi', 'The cargo ship'), step: 'kargo' },
    { icon: 'scan', text: Lx('Buz taramak', 'Scanning for ice'), step: 'tara' },
  ];

  const STEP_FACT = { panel: 't_gunes', hava: 't_oksijen', tara: 't_tara_i', onar: 't_onarim', kargo: 't_kargo' };
  function factsOf(s, iLast, skipped) {
    const w = s && s.world === 'mars' ? 'mars' : 'ay', T = typeof TEACH !== 'undefined' && Array.isArray(TEACH) ? TEACH : [];
    const recOf = id => T.find(t => t.id === id && (!t.w || t.w === w));
    let ids = [];
    const L0 = s && s.learn && typeof s.learn === 'object' ? s.learn : null;
    if (L0 && Object.keys(L0).length) ids = Object.keys(L0).sort((a, b) => L0[a] - L0[b]);
    else { const sk = skipped || []; for (let i = 0; i <= Math.min(iLast == null ? -1 : iLast, steps.length - 1); i++) { const id = STEP_FACT[steps[i].id]; if (id && !sk.includes(steps[i].id)) ids.push(id); } }
    const out = [];
    for (const id of ids) { const r = recOf(id); if (r && r.t) { const v = r.t[lang()] != null ? r.t[lang()] : r.t.tr; if (!out.includes(v)) out.push(v); } if (out.length >= 6) break; }
    return out;
  }
  function summary() {
    const last = EGITIM.last, sk = (last && last.skipped) || [];
    let out = SUM.filter(o => !o.step || !sk.includes(o.step)).slice(0, 5).map(o => ({ icon: o.icon, text: o.text }));
    if (out.length < 2) out = SUM.slice(0, 2).map(o => ({ icon: o.icon, text: o.text }));
    out.facts = last && Array.isArray(last.facts) ? last.facts.slice(0, 6) : [];
    return out;
  }
  function needed(set) { return !(set && set.egitim); }
  function start(ctx) {
    if (R) end(false);
    const world = ctx && ctx.world === 'mars' ? 'mars' : 'ay';
    const seed = (Date.now() % 2147483647) | 0;
    let ts = null;
    try { ts = newGame(world, 'kasif', seed, (ctx && ctx.name) || '', { train: true }); } catch (e) { ts = newGame(world, 'kasif', seed, (ctx && ctx.name) || ''); }
    if (ts.train == null) ts.train = true;
    if (ctx && ctx.look) ts.look = ctx.look;
    R = { ctx, s: ts, i: 0, st: {}, t0: now(), start: now(), phase: 'do', clicks: {}, times: [], skipped: [], name: nameOf(ctx), done: false, skipArm: false, hlKey: '', pend: [], sayFree: 0 };
    try { if (ctx && fn(ctx.enter)) ctx.enter(ts); } catch (e) { console.error(e); }
    try { if (typeof UI !== 'undefined' && UI && UI.s && UI.s !== ts && UI.s.train) R.s = UI.s; } catch (e) {   }
    domInit();
    enterStep(0);
    return ts;
  }
  function tick(dt, t) { lastExt = now(); if (R) step(t != null ? t : now()); }
  function active() { return !!R && !R.done; }
  function goal() {
    if (!R || R.done) return null;

    if (R.phase === 'ok' && !steps[R.i].final && R.i + 1 < steps.length) return { text: steps[R.i + 1].goal, sel: null, at: null, i: R.i + 1, n: steps.length };
    const S = steps[R.i];
    let at = null; try { at = S.at ? S.at(R.s, R.st) : null; } catch (e) { at = null; }
    return { text: S.goal, sel: curSel(), at: at ? { x: at.x, z: at.z } : null, i: R.i, n: steps.length };
  }

  function skip() { if (R) { if (R.skipped) R.skipped.push('*'); end(true); } }


  if (typeof requestAnimationFrame === 'function') {
    const loop = () => { try { if (R && now() - lastExt > 1000) step(now()); } catch (e) {   } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  const api = { needed, start, tick, active, goal, skip, steps, finalLine, readMs, summary, last: null,
    _state: () => (R ? { i: R.i, id: steps[R.i].id, phase: R.phase, hinted: R.hinted, times: R.times.slice(), s: R.s, st: R.st } : null),
    _click: sel => { if (R) R.clicks[sel] = 1; }, _show: () => showMe() };
  try { if (typeof location !== 'undefined' && location.hash === '#test' && typeof window !== 'undefined') { window.__uuMods = window.__uuMods || {}; window.__uuMods.EGITIM = api; } } catch (e) {   }
  return api;
})();
