
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));

const srcFiles = ['veri.js', 'gercek.js', 'cekirdek.js', 'hikaye.js'].filter(f => fs.existsSync(path.join(dir, '..', 'src', f)));
let src = srcFiles.map(f => fs.readFileSync(path.join(dir, '..', 'src', f), 'utf8')).join('\n');
const SAMPLE_COS = `const COSMETICS = [
  { id: 'su_turuncu', cat: 'suit', name: L('Turuncu', 'Orange'), hex: '#ff7a2f', def: true }, { id: 'su_mavi', cat: 'suit', name: L('Mavi', 'Blue'), hex: '#3b8ee8', def: true },
  { id: 'su_yesil', cat: 'suit', name: L('Yeşil', 'Green'), hex: '#3fbf5f', def: true }, { id: 'su_sari', cat: 'suit', name: L('Sarı', 'Yellow'), hex: '#f2c230', def: true },
  { id: 'su_mor', cat: 'suit', name: L('Mor', 'Purple'), hex: '#9b6bff', def: true }, { id: 'su_pembe', cat: 'suit', name: L('Pembe', 'Pink'), hex: '#ff5fa2', def: true },
  { id: 'vz_altin', cat: 'visor', name: L('Altın', 'Gold'), hex: '#b8862c', def: true }, { id: 'gz_beyaz', cat: 'rover', name: L('Beyaz', 'White'), hex: '#e6e5e0', hex2: '#2f5fa8', def: true },
  { id: 'uz_klasik', cat: 'craft', name: L('Klasik', 'Classic'), hex: '#2f5fa8', hex2: '#c8372d', def: true }, { id: 'us_lacivert', cat: 'bld', name: L('Lacivert', 'Navy'), hex: '#2f5fa8', def: true },
  { id: 'us_turkuaz', cat: 'bld', name: L('Turkuaz', 'Turquoise'), hex: '#1fa3b5', rule: { t: 'missions', all: ['guc', 'o2', 'su'] }, how: L('Güç, hava ve su hedeflerini bitir', 'Finish power, air and water') },
  { id: 'vz_gumus', cat: 'visor', name: L('Gümüş', 'Silver'), hex: '#aeb8c4', rule: { t: 'sci', n: 30 }, how: L('30 bilim kazan', 'Earn 30 science') },
  { id: 'gz_sari', cat: 'rover', name: L('Kâşif sarısı', 'Explorer yellow'), hex: '#f2c230', hex2: '#2c2f35', rule: { t: 'mission', id: 'kesif' }, how: L('İlk taramanı yap', 'Make your first scan') },
  { id: 'sym_buz', cat: 'sym', name: L('Buz kristali', 'Ice crystal'), sym: 'buz', rule: { t: 'bank', any: ['s:i'] }, how: L('Buz tara', 'Scan ice') },
  { id: 'sym_tas', cat: 'sym', name: L('Taş', 'Rock'), sym: 'tas', rule: { t: 'bank', any: ['s:m'] }, how: L('Maden tara', 'Scan minerals') },
  { id: 'sym_bitki', cat: 'sym', name: L('Filiz', 'Sprout'), sym: 'bitki', rule: { t: 'tag', id: 'x:hasat' }, how: L('İlk hasadı yap', 'Get your first harvest') },
  { id: 'uz_okyanus', cat: 'craft', name: L('Okyanus', 'Ocean'), hex: '#1fa3b5', hex2: '#2f5fa8', rule: { t: 'mission', id: 'kalkan' }, how: L('İniş Modülünü toprakla ört', 'Cover the Landing Module') },
  { id: 'us_sari', cat: 'bld', name: L('Güneş sarısı', 'Sun yellow'), hex: '#e8b62c', rule: { t: 'mission', id: 'dongu' }, how: L('Geri dönüştürücü çalıştır', 'Run a recycler') },
  { id: 'vz_mavi', cat: 'visor', name: L('Gece mavisi', 'Night blue'), hex: '#3a5f9e', rule: { t: 'sci', n: 80 }, how: L('80 bilim kazan', 'Earn 80 science') },
  { id: 'gz_mavi', cat: 'rover', name: L('Gök mavisi', 'Sky blue'), hex: '#3f8cff', hex2: '#e6e5e0', rule: { t: 'bank', any: ['s:i', 's:m', 's:t', 's:c', 's:r'], n: 3 }, how: L('3 farklı alan tara', 'Scan 3 kinds of ground') },
  { id: 'uz_gunes', cat: 'craft', name: L('Gün doğumu', 'Sunrise'), hex: '#e9632b', hex2: '#f2c230', rule: { t: 'ships', n: 1 }, how: L('İlk kargoyu boşalt', 'Unload your first cargo') },
  { id: 'sym_anten', cat: 'sym', name: L('Anten', 'Antenna'), sym: 'anten', rule: { t: 'bank', any: ['b:anten'] }, how: L('Anten kur', 'Build an antenna') },
  { id: 'us_mor', cat: 'bld', name: L('Mor', 'Purple'), hex: '#6d4bc4', rule: { t: 'mission', id: 'self' }, how: L('%80 kendi kendine yet', 'Reach 80% self-reliance') },
  { id: 'uz_kozmik', cat: 'craft', name: L('Kozmik', 'Cosmic'), hex: '#6d4bc4', hex2: '#e8b62c', rule: { t: 'sci', n: 150 }, how: L('150 bilim kazan', 'Earn 150 science') },
  { id: 'gz_yesil', cat: 'rover', name: L('İz sürücü', 'Tracker'), hex: '#7ccf4a', hex2: '#2c2f35', rule: { t: 'relics', n: 3 }, how: L('Üç izi de bul', 'Find all three traces') },
  { id: 'sym_gezgin', cat: 'sym', name: L('Gezgin', 'Rover'), sym: 'gezgin', rule: { t: 'relics', id: 2 }, how: L('Son izi bul', 'Find the last trace') },
];`;
const LS_ = 'const LS_ = (tr, en, src) => ({ tr, en, src });';
const SAMPLE_REAL = `const REAL = {
  ms: { o2: { ay: LS_('Gerçekte: Uzayda hava makinesi sudan oksijen yapar.', 'In real life: in space an air maker makes oxygen from water.'), mars: LS_('MOXIE, Mars havasından saatte 12 gram oksijen yaptı.', 'MOXIE made 12 grams of oxygen an hour from Martian air.', 'NASA/JPL · MOXIE') },
        dongu: LS_('Uzay İstasyonu suyunun %98\\'ini geri kazanır.', 'The Space Station recovers 98% of its water.', 'NASA · ISS ECLSS') },
  ev: { toz: { mars: LS_('Toz, InSight\\'ın panellerini kapladı.', 'Dust covered InSight\\'s panels.', 'NASA/JPL · InSight'), ay: LS_('Ay tozu çok yapışkandır.', 'Moon dust is very sticky.') },
        ozlem: LS_('NASA, uzun görevlerde ekibin iyi olmasını inceliyor.', 'NASA studies how crews stay well on long missions.'),
        flare: LS_('Uyarı gelince astronotlar en korunaklı yere geçer.', 'When warned, astronauts move to the best-shielded spot.'),
        sizinti: LS_('Uzay İstasyonunda da sızıntılar aranır.', 'Leaks are hunted on the Space Station too.'),
        teklif: LS_('Uzayda deneyler zaman ister.', 'Experiments in space take time.') },
  learn: [
    { id: 'hava', rule: { t: 'cause', r: 'o2' }, t: L('Hava bitince ekip eve döner. Önce Hava Makinesi kurulmalı.', 'When the air runs out the crew goes home. Build an Air Maker first.'), real: LS_('Bir insan günde 0,84 kg oksijen solur.', 'One person breathes 0.84 kg of oxygen a day.', 'NASA BVAD Rev2') },
    { id: 'pil', rule: { t: 'stat', key: 'blackDark', min: 1 }, t: L('Gece paneller durur. Batarya, gündüzün elektriğini geceye saklar.', 'Panels stop at night. A battery saves daytime power for the night.'), real: null },
    { id: 'dongu', rule: { t: 'built', k: 'geri' }, t: L('Kullanılmış su temizlenip yeniden içilir.', 'Used water is cleaned and drunk again.'), real: LS_('Uzay İstasyonu suyunun %98\\'ini geri kazanır.', 'The Space Station recovers 98% of its water.', 'NASA · ISS ECLSS') },
    { id: 'kesif', rule: { t: 'mission', id: 'kesif' }, t: L('Kazmadan önce tarayıp bakmak gerekir.', 'Scan before you dig.'), real: null },
  ],
  bank: [{ id: 'g:ziplama', tag: 'x:jump', title: L('Zıplamak', 'Jumping'), text: L('Az yerçekiminde yüksek zıplarsın.', 'In low gravity you jump high.'), fact: LS_('Ay yerçekimi 1,62 m/s².', 'Moon gravity is 1.62 m/s².', 'NASA NSSDCA') }],
};`;

const SAMPLE_WQ = `const WORKQ = [
  { id: 'r1', act: 'repair', lv: 1, q: L('Contayı ne aşındırdı?', 'What wore out the seal?'), a: [L('Keskin toz', 'Sharp dust'), L('Yağmur', 'Rain')], e: L('Toz cam gibi keskindir, contaları aşındırır.', 'Dust is sharp like glass and wears seals.') },
  { id: 'r2', act: 'repair', lv: 1, q: L('Onarımdan önce ne yapılır?', 'What do you do before a repair?'), a: [L('Makineyi kapat', 'Switch it off'), L('Hızını artır', 'Speed it up')], e: L('Çalışan makineye dokunmak tehlikelidir.', 'Touching a running machine is dangerous.') },
  { id: 'r3', act: 'repair', lv: 2, q: L('Yedek parça neden önemlidir?', 'Why do spare parts matter?'), a: [L('Dükkân yok', 'There are no shops'), L('Daha hafif', 'They are lighter'), L('Daha güzel', 'They look nicer')], e: L('Uzayda bozulanı yanında getirdiğinle onarırsın.', 'In space you fix things with what you brought.') },
  { id: 's1', act: 'scan', lv: 1, q: L('Buz en çok nerede saklanır?', 'Where does ice hide best?'), a: [L('Gölgeli kraterde', 'In shady craters'), L('Güneşli tepede', 'On sunny hills')], e: L('Hiç güneş görmeyen yerler çok soğuktur.', 'Places that never see sunlight stay very cold.') },
  { id: 's2', act: 'scan', lv: 1, q: L('Tarayıcı neye bakar?', 'What does the scanner look at?'), a: [L('Topraktaki maddelere', 'What the soil holds'), L('Yıldızlara', 'The stars')], e: L('Tarayıcı toprağın içinde ne olduğunu gösterir.', 'The scanner shows what is in the ground.') },
  { id: 's3', act: 'scan', lv: 1, w: 'mars', k: 'i', q: L('Mars buzu nerede bulunur?', 'Where is ice found on Mars?'), a: [L('Toprağın altında', 'Under the soil'), L('Göllerde', 'In lakes')], e: L('Yüzeyde sıvı su kalmaz; buz toprağın altındadır.', 'Liquid water cannot last on top; ice hides underground.') },
  { id: 's4', act: 'scan', lv: 1, w: 'ay', q: L('Ay\\'da neden rüzgâr yoktur?', 'Why is there no wind on the Moon?'), a: [L('Havası yok', 'It has no air'), L('Çok küçük', 'It is too small')], e: L('Rüzgâr hareket eden havadır; Ay\\'da hava yoktur.', 'Wind is moving air; the Moon has none.') },
  { id: 's5', act: 'scan', lv: 2, q: L('Taramada önce ne kaydedilir?', 'What is recorded first in a scan?'), a: [L('Yer ve saat', 'Place and time'), L('Hava durumu', 'The weather'), L('Müzik', 'Music')], e: L('Bilim, neyin nerede bulunduğunu bilmek ister.', 'Science needs to know where things were found.') },
  { id: 'b1', act: 'build', lv: 1, q: L('Paneller nereye kurulur?', 'Where do panels go?'), a: [L('Güneş alan yere', 'Where the Sun shines'), L('Gölgeye', 'In the shade')], e: L('Panel güneş ışığından elektrik yapar.', 'Panels make power from sunlight.') },
  { id: 'b2', act: 'build', lv: 1, q: L('Ağır parçayı nasıl taşırız?', 'How do we carry a heavy part?'), a: [L('İki kişiyle', 'With two people'), L('Fırlatarak', 'By throwing it')], e: L('Az yerçekiminde bile ağır şeyi durdurmak zordur.', 'Even in low gravity, heavy things are hard to stop.') },
  { id: 'b3', act: 'build', lv: 1, k: 'sera', q: L('Seraya ne gerekir?', 'What does a greenhouse need?'), a: [L('Işık ve su', 'Light and water'), L('Kum ve taş', 'Sand and rocks')], e: L('Bitkiler ışık ve suyla büyür.', 'Plants grow with light and water.') },
  { id: 'b4', act: 'build', lv: 2, q: L('Yapılar neden toprakla örtülür?', 'Why are buildings covered with soil?'), a: [L('Radyasyona karşı', 'Against radiation'), L('Süs için', 'For decoration'), L('Isınmak için', 'To get warm')], e: L('Kalın toprak ışınları durdurur.', 'Thick soil stops the rays.') },
  { id: 'c1', act: 'cargo', lv: 1, q: L('Kargoda önce ne boşaltılır?', 'What is unloaded first?'), a: [L('Hava ve su', 'Air and water'), L('Oyuncaklar', 'Toys')], e: L('Hayatta kalmak için önce hava ve su gerekir.', 'Air and water come first to stay alive.') },
  { id: 'c2', act: 'cargo', lv: 1, q: L('Roket neden az yük taşır?', 'Why does a rocket carry little?'), a: [L('Her kilo pahalı', 'Every kilo is costly'), L('Kapı küçük', 'The door is small')], e: L('Her kilo için çok yakıt gerekir.', 'Each kilo needs a lot of fuel.') },
  { id: 'c3', act: 'cargo', lv: 2, q: L('Kargo neden sıkı bağlanır?', 'Why is cargo strapped down?'), a: [L('Kalkışta sarsılır', 'Launch shakes it'), L('Çalınmasın diye', 'So nobody steals it'), L('Güzel dursun', 'To look neat')], e: L('Fırlatma sırasında roket çok sarsılır.', 'A rocket shakes hard during launch.') },
  { id: 'a1', act: 'any', lv: 1, q: L('Astronot dışarıda ne giyer?', 'What does an astronaut wear outside?'), a: [L('Uzay giysisi', 'A spacesuit'), L('Yağmurluk', 'A raincoat')], e: L('Giysi hava verir ve ışınlardan korur.', 'The suit gives air and blocks rays.') },
];`;
const SAMPLE_ACH = `const ACHIEVEMENTS = [
  { id: 'ilk_panel', name: L('İlk ışık', 'First light'), icon: 'sun', rule: { t: 'built', k: 'gunes' }, how: L('Bir güneş paneli kur', 'Build a solar panel'), gives: ['info:bld'], say: L('İlk elektrik geldi!', 'First power is on!') },
  { id: 'ilk_tarama', name: L('Meraklı göz', 'Curious eye'), icon: 'scan', rule: { t: 'stat', key: 'scans', min: 1 }, how: L('Bir alanı tara', 'Scan a patch'), gives: ['feat:surus'], say: L('Gezgin artık senin!', 'The rover is yours now!') },
  { id: 'ilk_nefes', name: L('İlk nefes', 'First breath'), icon: 'o2', rule: { t: 'mission', id: 'o2' }, how: L('Hava makinesini çalıştır', 'Run an Air Maker'), gives: [], say: L('Hava var!', 'We have air!') },
  { id: 'bilgin', name: L('Bilgili eller', 'Clever hands'), icon: 'star', rule: { t: 'work', n: 2 }, how: L('2 iş kartını doğru yanıtla', 'Answer 2 work cards right'), gives: ['info:ara'], say: L('İşini biliyorsun!', 'You know your job!') },
  { id: 'su_var', name: L('Buzdan su', 'Ice to water'), icon: 'drop', rule: { t: 'mission', id: 'su' }, how: L('Buz çıkarıcı çalıştır', 'Run an Ice Extractor'), gives: [], say: L('Musluktan su akıyor!', 'Water from the tap!') },
  { id: 'asama', name: L('Yeni yapılar', 'New buildings'), icon: 'build', rule: { t: 'stage', n: 2 }, how: L('İlk hedefleri bitir', 'Finish the first goals'), gives: [], say: L('Yeni yapılar açıldı!', 'New buildings unlocked!') },
  { id: 'dron', name: L('Gökteki göz', 'Eye in the sky'), icon: 'scan', rule: { t: 'stat', key: 'scans', min: 4 }, how: L('4 alan tara', 'Scan 4 patches'), gives: ['feat:dron'], say: L('Dronun hazır!', 'Your drone is ready!') },
  { id: 'hasat', name: L('İlk hasat', 'First harvest'), icon: 'leaf', rule: { t: 'tag', id: 'x:hasat' }, how: L('Seradan ürün al', 'Harvest the greenhouse'), gives: [], say: L('Taze yemek!', 'Fresh food!') },
  { id: 'bilgin2', name: L('Usta işçi', 'Master worker'), icon: 'star', rule: { t: 'work', n: 6 }, how: L('6 iş kartını doğru yanıtla', 'Answer 6 work cards right'), gives: ['feat:hiz4'], say: L('Artık 4 kat hız var!', '4x speed unlocked!') },
  { id: 'bes', name: L('Sağlam temel', 'Solid start'), icon: 'star', rule: { t: 'missions', all: ['guc', 'o2', 'su', 'sera', 'pil'] }, how: L('İlk beş hedefi bitir', 'Finish the first five goals'), gives: [], say: L('Üs ayakta!', 'The base stands!') },
  { id: 'bilim40', name: L('Araştırmacı', 'Researcher'), icon: 'flask', rule: { t: 'sci', n: 40 }, how: L('40 bilim kazan', 'Earn 40 science'), gives: [], say: L('Bilim birikiyor!', 'Science adds up!') },
  { id: 'kalkan', name: L('Sığınak', 'Shelter'), icon: 'shield', rule: { t: 'mission', id: 'kalkan' }, how: L('Üssü toprakla ört', 'Cover the base with soil'), gives: [], say: L('Artık güvendeyiz!', 'Now we are safe!') },
  { id: 'kendi', name: L('Kendi ayağında', 'Own two feet'), icon: 'star', rule: { t: 'mission', id: 'self' }, how: L('Kaynaklarının çoğunu kendin yap', 'Make most of your supplies'), gives: [], say: L('Kendi kendine yetiyorsun!', 'You are self-reliant!') },
  { id: 'egitimli', name: L('Hazır aday', 'Ready cadet'), icon: 'star', rule: { t: 'train' }, how: L('Eğitimi bitir', 'Finish training'), gives: [], say: L('Eğitim tamam!', 'Training done!') },
  { id: 'zincir', name: L('Koleksiyoncu', 'Collector'), icon: 'star', rule: { t: 'ach', id: 'bilgin2' }, how: L('Usta işçi ol', 'Become a master worker'), gives: [], say: L('Harika gidiyorsun!', 'Great going!') },
  { id: 'm_buz', name: L('Mars buzu', 'Martian ice'), icon: 'drop', w: 'mars', rule: { t: 'bank', any: ['s:i'] }, how: L('Mars\\'ta buz tara', 'Scan ice on Mars'), gives: [], say: L('Mars\\'ta su var!', 'Water on Mars!') },
  { id: 'm_kasif', name: L('Kızıl kâşif', 'Red explorer'), icon: 'scan', w: 'mars', rule: { t: 'stat', key: 'scans', min: 3 }, how: L('Mars\\'ta 3 alan tara', 'Scan 3 patches on Mars'), gives: [], say: L('Mars seni tanıyor!', 'Mars knows you now!') },
  { id: 'm_iz', name: L('İz sürücü', 'Tracker'), icon: 'star', w: 'mars', rule: { t: 'relics', n: 1 }, how: L('Mars\\'ta bir iz bul', 'Find a trace on Mars'), gives: [], say: L('Bir iz bulduk!', 'We found a trace!') },
  { id: 'e_guc', name: L('Mühendis gücü', 'Engineer power'), icon: 'sun', lv: 'muhendis', rule: { t: 'mission', id: 'guc' }, how: L('Mühendis\\'te 2 panel kur', 'Build 2 panels as Engineer'), gives: [], say: L('Mühendis işi!', 'Engineer work!') },
  { id: 'e_hava', name: L('Mühendis havası', 'Engineer air'), icon: 'o2', lv: 'muhendis', rule: { t: 'mission', id: 'o2' }, how: L('Mühendis\\'te hava yap', 'Make air as Engineer'), gives: [], say: L('Temiz hava!', 'Clean air!') },
  { id: 'e_tara', name: L('Dikkatli göz', 'Sharp eye'), icon: 'scan', lv: 'muhendis', rule: { t: 'stat', key: 'scans', min: 2 }, how: L('Mühendis\\'te 2 alan tara', 'Scan 2 patches as Engineer'), gives: [], say: L('Gözünden kaçmıyor!', 'Nothing escapes you!') },
];`;
const sampleCos = !/\bconst COSMETICS\b/.test(src), sampleReal = !/\bconst REAL\b/.test(src);
const sampleWQ = !/\bconst WORKQ\b/.test(src), sampleAch = !/\bconst ACHIEVEMENTS\b/.test(src);
const pre = (sampleCos ? SAMPLE_COS + '\n' : '') + (sampleReal ? LS_ + '\n' + SAMPLE_REAL + '\n' : '') + (sampleWQ ? SAMPLE_WQ + '\n' : '') + (sampleAch ? SAMPLE_ACH + '\n' : '');
src = src.replace(/(\nconst MAPW\b)/, '\n' + pre + '$1');
const srcNoWQ = sampleWQ ? src.replace(SAMPLE_WQ, '') : null;
const srcOff = src.replace('function checkCosmetics(s) {', 'function checkCosmetics(s) { return [];');
const names = ['WORLDS', 'BLD', 'TECHS', 'TECH_ORDER', 'CARGO', 'QUIZ', 'MISSIONS', 'EVENTS', 'STORY', 'SCANS', 'MAPW', 'MAPH', 'HUBX', 'HUBY', 'newGame', 'tick', 'canBuild', 'build',
  'research', 'techState', 'resolve', 'cnt', 'tileAt', 'isSeen', 'bAt', 'beds', 'shieldFrac', 'shieldUp', 'canShield', 'shieldCost', 'costOf', 'daysLeft',
  'score', 'dayOf', 'advice', 'repair', 'repairCost', 'hoursToNight', 'batteryCap', 'missionCount', 'isShielded', 'demolish', 'toggle', 'moraleFactors', 'doseFactors',
  'cargoSuggest', 'say', 'answerQuiz', 'noteTag', 'explore', 'scanInfo', 'scan', 'canCollect', 'collect', 'relicTiles', 'bankEntries', 'conjOn', 'storyStep',
  'pushEvent', 'baseSun', 'sunFactor', 'stormOn', 'isDark', 'nightPhase', 'hourOf', 'bname',
  'suggestSpot', 'starterPlan', 'undoBuild', 'unlockedB', 'buildStage', 'previewChoice', 'previewToggle', 'previewCargo', 'activeEffects', 'keyChoices',
  'mutinyInfo', 'moraleMinus', 'dosePct', 'GROUPS', 'GROUP_ORDER', 'MUT_LINES', 'PV_KEYS', 'PV_WORD', 'MOR_WHY', 'MOR_HINT', 'WARN_MSG', 'migrate', 'LIMIT_DOSE',
  'STAGE1', 'BUILD_ORDER', 'TECHS', 'busyWorkers', 'SCANS', 'SIMPLIFY', 'MOOD', 'EVA', 'debrief', 'finish',
  'RADIO_MAX', 'sciTotal', 'ruleMet', 'ruleProg', 'checkCosmetics', 'nextRewards', 'learnedList', 'whyStop', 'realLine', 'cmdName', 'COSMETICS', 'REAL', 'LEARN_BASE', 'GOAL_GAP', 'checkMissions', 'nextGoal', 'goalReady', 'GOAL_NEED',
  'RANDOM_EVENTS', 'ATLAS_Q', 'WORK_ACTS', 'WQ_GAP', 'workQ', 'workAnswer', 'workSkip', 'currentGoal', 'missionGoal', 'trainBreak', 'trainShip', 'trainAsk',
  'checkAch', 'achNext', 'featOn', 'droneScout', 'droneWait', 'WORKQ', 'ACHIEVEMENTS', 'NEED', 'pushCargo',
  'quickQ', 'repairQ', 'buildQ', 'learnKey', 'powerOutlook', 'buildOutlook', 'spendLog', 'repairExtra', 'buildExtra', 'qHash'];
const G_ON = vm.runInNewContext(src + `\n;({${names.join(',')}})`, { console });
const G_OFF = vm.runInNewContext(srcOff + `\n;({${names.join(',')}})`, { console });
const G_NOWQ = srcNoWQ ? vm.runInNewContext(srcNoWQ + `\n;({workQ, newGame})`, { console }) : null;
let G = G_ON;

let fail = 0;
const errs = new Map();
const check = (ok, msg) => { if (!ok) { fail++; errs.set(msg, (errs.get(msg) || 0) + 1); } };


function rand(ctx) {
  ctx.r = (ctx.r + 0x6D2B79F5) | 0;
  let t = Math.imul(ctx.r ^ (ctx.r >>> 15), 1 | ctx.r);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function findTile(s, pred) {
  let best = null, bd = 1e9;
  for (let y = 0; y < G.MAPH; y++) for (let x = 0; x < G.MAPW; x++) {
    if (!G.isSeen(s, x, y) || G.bAt(s, x, y)) continue;
    const t = G.tileAt(s, x, y);
    if (!pred(t, x, y)) continue;
    const d = Math.hypot(x - G.HUBX, y - G.HUBY);
    if (d < bd) { bd = d; best = [x, y]; }
  }
  return best;
}

let suggestN = 0;
function tryBuild(s, k) {
  if (!G.canBuild(s, k).ok) return false;
  const spot = G.suggestSpot(s, k);
  if (!spot) return false;
  suggestN++;
  check(spot.why && spot.why.tr && spot.why.en, 'suggestSpot: why iki dilde');
  const r = G.build(s, k, spot.x, spot.y);
  check(r.ok, 'suggestSpot: önerilen kare canBuild geçmeli (' + k + ' ' + spot.x + ',' + spot.y + ' ' + r.why + ')');
  return r.ok;
}
const total = (s, k) => s.b.filter(b => b.k === k).length;

function smartPicks(s, p) {
  const picks = {}; let left = p.mass;
  const add = (id, n) => { const it = G.CARGO.find(c => c.id === id); n = Math.min(n, Math.floor(left / it.kg)); if (it.max) n = Math.min(n, it.max - (picks[id] || 0)); if (n > 0) { picks[id] = (picks[id] || 0) + n; left -= n * it.kg; } };
  const freeBeds = G.beds(s) - s.pop;
  if (s.world === 'ay' && !G.cnt(s, 'reaktor') && !s.core && G.dayOf(s) > 6) add('core', 1);
  if (s.world === 'mars' && !G.cnt(s, 'reaktor') && !s.core && G.dayOf(s) > 20) add('core', 1);
  add('crew', Math.floor(freeBeds / 2));
  if (G.daysLeft(s, 'gida') < 12) add('gida', 6);
  if (G.daysLeft(s, 'o2') < 8) add('o2', 2);
  if (G.daysLeft(s, 'su') < 8) add('su', 2);
  add('moral', 1);
  add('parca', 8); add('gida', 4); add('bilim', 2); add('parca', 20);
  return picks;
}

function answerCalls(s, ctx, mode, cargoPicks) {
  for (const p of s.pending.slice()) {
    if (s.over) return;
    if (p.type === 'cargo') {
      if (mode === 'yok' || (mode === 'bazen' && rand(ctx) > 0.15)) continue;
      const r = G.resolve(s, cargoPicks(s, p), p.pid);
      if (!r || !r.ok) G.resolve(s, {}, p.pid);
    } else {
      if (mode === 'yok' || mode === 'kargo' || (mode === 'bazen' && rand(ctx) > 0.06)) continue;
      if (G.resolve(s, 0, p.pid) === null) G.resolve(s, 1, p.pid);
    }
  }
}
const SCAN_K = 'imtcrs';

function wander(s, ctx, every, growth) {
  if (s.t % every) return;
  const R = Math.min(13, 3 + s.t / 24 * growth);
  let best = null;
  for (let y = 0; y < G.MAPH; y++) for (let x = 0; x < G.MAPW; x++) {
    const i = y * G.MAPW + x;
    if (!SCAN_K.includes(s.map.k[i]) || s.scanned[i]) continue;
    const d = Math.hypot(x - G.HUBX, y - G.HUBY) + rand(ctx) * 0.5;
    if (d <= R && (!best || d < best.d)) best = { x, y, d };
  }
  if (best) {
    G.explore(s, best.x, best.y);
    const inf = G.scanInfo(s, best.x, best.y);
    check(inf && !inf.done, 'taranacak kare okunamadı');
    const r = G.scan(s, best.x, best.y);
    check(r.ok && r.entry && r.entry.title, 'tarama sonucu eksik');
    check(!G.scan(s, best.x, best.y).ok, 'aynı kare iki kez tarandı');
  }
  if (s.t < 24 * 4 && s.res.malzeme < 100) {
    const m = findTile(s, (t, x, y) => t === 'm' && G.canCollect(s, x, y).ok);
    if (m) { const r = G.collect(s, m[0], m[1]); check(r.ok && r.res === 'malzeme' && r.n === 6, 'elle toplama'); }
  }
}
function quizzes(s, ctx, skill) {
  for (const qi of s.quiz.open.slice()) {
    const r = G.answerQuiz(s, qi, rand(ctx) < skill ? 0 : 1);
    check(r && typeof r.ok === 'boolean' && r.expl, 'soru yanıtı');
    check(G.answerQuiz(s, qi, 0) === null, 'soru iki kez yanıtlandı');
  }
}

function smartBot(s, ctx, skill) {
  answerCalls(s, ctx, skill > 0.6 ? 'hepsi' : 'bazen', smartPicks);
  if (s.over) return;
  if (s.t === 10) G.noteTag(s, 'x:jump');
  wander(s, ctx, skill > 0.6 ? 4 : 8, skill > 0.6 ? 0.6 : 0.4);
  quizzes(s, ctx, skill);
  if (s.t % 3) return;
  for (const b of s.b) if (b.broken) G.repair(s, b);
  for (const id of G.TECH_ORDER) if (G.techState(s, id) === 'ok') { G.research(s, id); break; }
  const want = [];
  const need = s.pw.need, panels = total(s, 'gunes');
  const W = G.WORLDS[s.world];
  const avgPer = W.night ? W.solarPeak : W.solarPeak * 0.32;
  const genAvg = 2 + panels * avgPer + total(s, 'reaktor') * 10;
  if (panels < 2) want.push('gunes');
  if (!total(s, 'oksijen')) want.push('oksijen');
  if (!total(s, 'su')) want.push('su');
  if (genAvg < need + 3) want.push('gunes');
  if (!total(s, 'sera')) want.push('sera');
  if (!total(s, 'maden')) want.push('maden');
  if (total(s, 'batarya') < (W.night ? 2 : Math.ceil((need - 2) * 12 / 80) + 1)) want.push('batarya');
  if (s.core > 0) want.push('reaktor');
  if (total(s, 'maden')) for (const b of s.b) if (G.canShield(s, b) && s.res.malzeme >= G.shieldCost(s) + 30) { G.shieldUp(s, b); break; }
  const o2need = s.pop * 0.84, foodNeed = s.pop * 1.8;
  if (G.cnt(s, 'oksijen') * 4.2 < o2need * (s.techs.dongu && total(s, 'geri') ? 0.6 : 1)) want.push('oksijen');
  if (total(s, 'sera') * 4.5 < foodNeed + 1 && s.idle > 0) want.push('sera');
  if (s.rate.su.c > s.rate.su.p + 2 && findTile(s, t => t === 'i') && s.idle > 0) want.push('su');
  if (s.techs.dongu && total(s, 'geri') * 8 < s.pop) want.push('geri');
  if (G.beds(s) - s.pop < 2 && total(s, 'yasam') < 3) want.push('yasam');
  if (!total(s, 'lab') && s.idle > 0) want.push('lab');
  if (!total(s, 'anten')) want.push('anten');
  if (s.techs.baski && !total(s, 'atolye') && s.idle > 0) want.push('atolye');
  if (total(s, 'spor') < 1 && s.pop >= 6) want.push('spor');
  if (W.night && total(s, 'batarya') < 5 && !total(s, 'reaktor')) want.push('batarya');
  if (total(s, 'maden') < 2 && s.idle > 0 && s.pop >= 6) want.push('maden');
  const n = skill > 0.6 ? 2 : 1;
  let done = 0;
  for (const k of want) { if (tryBuild(s, k)) { if (++done >= n) break; } else if (skill < 0.6) break; }
}
function lazyBot() {   }


function badBot(s, ctx) {
  smartBot(s, ctx, 0.9);
  if (s.over || s.pop <= 4 || s.pending.some(p => p.type === 'cargo')) return;
  for (const b of s.b) if (b.on && b.left === 0 && ['yasam', 'spor', 'anten'].includes(b.k)) G.toggle(s, b);
}
function importBot(s, ctx) {
  answerCalls(s, ctx, 'kargo', () => ({ o2: 6, su: 8, gida: 6 }));
}


function invariants(s, before, prevCh) {
  if (!s.over) check(s.t === before + 1, 'tick durdu (bekleyen çağrı varken saat ilerlemeli)');
  check(s.pending.filter(p => p.type === 'event').length <= 1, 'aynı anda iki karar çağrısı');
  if (!s.over) check(!s.pending.some(p => p.due <= s.t), 'süresi dolan çağrı varsayılanla kapanmadı');
  check(s.pending.every(p => p.pid > 0 && p.due > 0 && p.def != null), 'çağrı alanları (pid, due, def)');
  if (s.fx.chapter !== prevCh) check(s.fx.chapter === prevCh + 1 && s.fx.chapterT === s.t, 'bölümler sırayla açılmalı');
  return s.fx.chapter;
}
function storyChecks(s, won) {
  const S = G.STORY[s.world], B = s.story.beats;
  let lastT = -1, gap = false;
  S.beats.forEach(b => {
    const t = B[b.id];
    if (t == null) { gap = true; return; }
    check(!gap, 'hikâye mesajı sırası atlandı');
    if (t < 0) return;
    check(t >= lastT, 'hikâye mesajları sırayla gelmeli'); lastT = t;
  });
  const beatsT = S.beats.map(b => B[b.id]).filter(t => t >= 0).sort((a, b) => a - b);
  for (let i = 1; i < beatsT.length; i++) check(beatsT[i] - beatsT[i - 1] >= 6, 'hikâye mesajları en az 6 saat arayla');
  if (won) {
    check(s.story.ch === S.chapters.length - 1, 'kazanan oyunda tüm bölümler açılmalı');
    check(S.beats.every(b => B[b.id] != null), 'kazanan oyunda tüm hikâye mesajları gelmeli');
  }
  if (s.world === 'mars') {
    const C = G.WORLDS.mars.conj;
    check(!s.radio.some(r => r.from === 'mc' && r.t >= (C.from - 1) * 24 && r.t < (C.from - 1 + C.len) * 24), 'kavuşumda Görev Kontrol konuştu');
  }
  check(s.radio.length <= 100 && s.radioN >= s.radio.length, 'telsiz sınırı');
}


const wc = t => String(t || '').trim().split(/\s+/).filter(Boolean).length;
const okL = (o, n) => !!o && typeof o.tr === 'string' && typeof o.en === 'string' && o.tr.trim() && o.en.trim() && wc(o.tr) <= n && wc(o.en) <= n;
const GOAL_ACTS = ['build', 'scan', 'repair', 'ship', 'call', 'walk', 'wait'];
let goalN = 0;

function goalCheck(s) {
  const g = G.currentGoal(s);
  if (s.over) { check(g === null, 'currentGoal: görev bitince null'); return; }
  goalN++;
  check(!!g, 'currentGoal: görev bitene dek null olmamalı');
  if (!g) return;
  check(typeof g.id === 'string' && okL(g.k, 5), 'currentGoal: k ≤5 kelime iki dilde → ' + JSON.stringify(g.k));
  check(g.why === null || okL(g.why, 10), 'currentGoal: why ≤10 kelime → ' + JSON.stringify(g.why));
  check(GOAL_ACTS.includes(g.act) && typeof g.urgent === 'boolean', 'currentGoal: act/urgent ' + g.act);
  if (g.bk != null) check(G.unlockedB(s, g.bk).ok, 'currentGoal: kilitli yapı gösterilmemeli ' + g.bk);
  check((g.tx === null && g.ty === null) || (Number.isInteger(g.tx) && Number.isInteger(g.ty) && g.tx >= 0 && g.ty >= 0 && g.tx < G.MAPW && g.ty < G.MAPH), 'currentGoal: tx/ty harita içinde');
  if (g.act === 'build') check(!!g.bk, 'currentGoal: inşa hedefinde yapı var');
}

function run(world, level, seed, bot, skill) {
  const s = G.newGame(world, level, seed, 'bot');
  const ctx = { r: seed * 7919 }, unlDay = {}, rwPrev = {};
  let guard = 0, ch = s.fx.chapter, minMoral = 100, lastMut = 0, mutT = -99;
  check(!Object.keys(s.unl || {}).length, 'kozmetik: yeni oyunda (t = 7) hiçbir kilit açık değil');
  check(ch === 0 && s.v === 3, 'yeni oyun: bölüm 0, sürüm 3');
  while (!s.over && guard++ < 5000) {
    bot(s, ctx, skill);
    const t0 = s.t;
    if (s.over) break;
    G.tick(s);
    ch = invariants(s, t0, ch);
    minMoral = Math.min(minMoral, s.moral);
    if (G.dayOf(s) >= 3) check(G.buildStage(s) >= 2, 'aşama: 3. günde her şey açık olmalı');
    { const ng = G.nextGoal(s); if (ng && G.GOAL_NEED[ng.id]) check(G.unlockedB(s, G.GOAL_NEED[ng.id]).ok, 'hedef: sıradaki hedefin yapısı açık olmalı (' + ng.id + ')'); }
    if (s.mut.lvl > lastMut) { check(s.mut.lvl === lastMut + 1 && s.t - mutT >= 24, 'isyan: uyarılar sırayla ve en az 24 saat arayla'); mutT = s.t; }
    lastMut = s.mut.lvl;
    if (s.over && s.over.why === 'isyan') check(s.mut.lvl === 3 && s.stat.mut && s.stat.mut.why.length > 0, 'isyan: kapsül yalnız 3. düzeyde kalkar');
    if (s.over && s.over.why === 'isyan' && s.stat.moodHit && Object.keys(s.stat.moodHit).length) { const ek = (G.debrief(s) || []).find(o => o.id === 'ekip'); check(ek && !/kötü geçen olaylar/.test(ek.note.tr) && (!(s.stat.mut.why || []).includes('olaylar') || /Ev Özlemi|Güneş Fırtınası|Görev Kontrol|eve gönderilen/.test(ek.note.tr)), 'isyan notu morali düşüren olayları adıyla yazar'); }
    for (const id in s.unl || {}) if (unlDay[id] == null) unlDay[id] = G.dayOf({ t: s.unl[id] });
    if (s.t % 24 === 0) paketA_periodic(s, rwPrev);
    goalCheck(s);
  }
  storyChecks(s, s.over && s.over.win);
  paketA_end(s);
  return { s, sc: G.score(s), minMoral, unlDay };
}

function paketA_periodic(s, rwPrev) {
  for (const b of s.b) {
    const w = G.whyStop(s, b), stopped = b.left === 0 && b.k !== 'hub' && b.st !== 'ok';
    check(stopped ? !!(w && w.why.tr && w.why.en && w.fix.tr && w.fix.en) : w === null, 'whyStop: durum ' + b.k + ' ' + b.st + ' → ' + JSON.stringify(w));
  }
  const nr = G.nextRewards(s, {});
  check(nr.length <= 3 && nr.every((o, i) => o.id && o.cat && o.name.tr && o.how && o.how.en && o.prog >= 0 && o.prog <= 1 && (i === 0 || nr[i - 1].prog >= o.prog)), 'nextRewards: şekil ve sıra');
  for (const c of G.COSMETICS) if (c.rule) { const p = G.ruleProg(s, c.rule); check(p >= (rwPrev[c.id] || 0) - 1e-9 || c.rule.t === 'bank', 'ruleProg geri gitmemeli ' + c.id); rwPrev[c.id] = p; }
}
function paketA_end(s) {
  const radio = s.radio;
  check(!radio.some(m => /\{ad\}/.test(m.text.tr + m.text.en + m.title.tr + m.title.en + (m.hint ? m.hint.tr + m.hint.en : ''))), 'telsiz: {ad} yer tutucusu kalmamalı');

  const heads = radio.filter(m => m.goal);
  const ids = heads.map(m => m.goal);
  check(new Set(ids).size === ids.length, 'hedef telsizi: hedef başına bir kez');
  for (let i = 1; i < heads.length; i++) check(heads[i].t - heads[i - 1].t >= G.GOAL_GAP, 'hedef telsizi: en az GOAL_GAP saat arayla');
  if (s.radioN <= 100) for (const id in s.done) if (!(s.story.goalQ || []).includes(id)) check(ids.includes(id), 'hedef telsizi: tamamlanan hedef duyurulmalı ' + id);
  for (const m of radio.filter(m => m.goal && /Gerçekte/.test(m.text.tr))) check(/^Hedef tamam! Gerçekte: /.test(m.text.tr) && /^Goal complete! In real life: /.test(m.text.en) && !/Gerçekte: Gerçekte/.test(m.text.tr) && m.src, 'hedef telsizi: gerçek satırı biçimi');

  const rb = {}; for (const m of radio) if (m.beat && m.beat.startsWith('r:')) { rb[m.beat] = rb[m.beat] || new Set(); rb[m.beat].add(m.t); }
  for (const k in rb) check(rb[k].size === 1, 'tepki mesajı tek seferlik ' + k);

  const ll = G.learnedList(s), src = (G.REAL && G.REAL.learn && G.REAL.learn.length) ? G.REAL.learn : G.LEARN_BASE;
  check(ll.length <= 3 && ll.every(o => o.t.tr && o.t.en && src.some(x => x.id === o.id && G.ruleMet(s, x.rule))), 'learnedList: yalnız yaşanmış olaylar');
  const fi = ll.map(o => o.fail); check(fi.every((f, i) => i === 0 || f <= fi[i - 1]), 'learnedList: önce başarısızlık dersleri');
  for (const o of ll) for (const lg of ['tr', 'en']) for (const c of o.t[lg].split(/[.!?]+\s*/)) check(c.split(/\s+/).filter(Boolean).length <= 15, 'learnedList: cümle ≤ 15 kelime');
  for (const o of ll) if (o.real && /\d/.test(o.real.tr)) check(!!o.real.src, 'learnedList: rakamlı gerçek satırının kaynağı');
}
const fmt = (r) => {
  const { s, sc } = r;
  return `${s.over.win ? 'KAZANDI ' : 'KAYBETTI'} gün ${String(G.dayOf(s)).padStart(2)} ${String(s.over.why || '-').padEnd(4)} pop ${String(s.pop).padStart(2)} puan ${String(sc.total).padStart(4)} ★${sc.stars} self ${(sc.self * 100).toFixed(0).padStart(3)}% doz ${s.dose.toFixed(0).padStart(3)} tah ${s.stat.evac} kes ${String(s.stat.black).padStart(3)}s tek ${Object.keys(s.techs).length} gör ${String(G.missionCount(s)).padStart(2)} tara ${String(s.stat.scans).padStart(2)} kal ${s.stat.relics} soru ${s.stat.quizOk}/${s.stat.quizN} vars ${s.stat.defaults} bölüm ${s.story.ch} | ${sc.grades.map(g => g.g).join('')}`;
};
const table = {}, mutT = {}, minM = {}, unlT = {};
for (const world of ['ay', 'mars']) for (const level of ['kasif', 'muhendis']) {
  console.log(`\n── ${world} / ${level} ──`);
  for (const [name, bot, skill] of [['usta', smartBot, 0.9], ['orta', smartBot, 0.5], ['ithal', importBot, 0], ['tembel', lazyBot, 0], ['kotu', badBot, 0.9]]) {
    for (let i = 1; i <= 4; i++) {
      try {
        const r = run(world, level, 1000 * i + 7, bot, skill);
        console.log(name.padEnd(7), fmt(r), `| moral≥${r.minMoral.toFixed(0)} isyan-düzey ${r.s.mut.max}`);
        const key = `${world}/${level}/${name}`;
        table[key] = (table[key] || 0) + (r.s.over.win ? 1 : 0);
        mutT[name] = mutT[name] || { isyan: 0, maxLvl: 0 };
        if (r.s.over.why === 'isyan') mutT[name].isyan++;
        mutT[name].maxLvl = Math.max(mutT[name].maxLvl, r.s.mut.max);
        minM[name] = Math.min(minM[name] == null ? 100 : minM[name], r.minMoral);
        (unlT[key] = unlT[key] || []).push(r.unlDay);
      } catch (e) { fail++; console.log(name, 'HATA', e.stack); }
    }
  }
}

for (const world of ['ay', 'mars']) for (const level of ['kasif', 'muhendis']) {
  check(table[`${world}/${level}/usta`] === 4, `denge: usta ${world}/${level} hep kazanmalı`);
  check(!table[`${world}/${level}/tembel`], `denge: tembel ${world}/${level} kaybetmeli`);
}

for (const name of ['usta', 'orta', 'ithal', 'tembel']) check(mutT[name].maxLvl === 0 && mutT[name].isyan === 0, `isyan: ${name} hiç uyarı almamalı`);
check(mutT.kotu.isyan >= 2, 'isyan: kasıtlı kötü bot en az iki oyunda kapsüle binmeli');
console.log('\nisyan tablosu:', Object.entries(mutT).map(([n, o]) => `${n} isyan ${o.isyan}/16 en yüksek düzey ${o.maxLvl} en düşük moral ${minM[n].toFixed(0)}`).join(' · '));
console.log('suggestSpot ile yerleştirme:', suggestN);

{
  const big = G.COSMETICS.filter(c => !c.def && c.rule && ['rover', 'craft', 'bld'].includes(c.cat)).map(c => c.id);
  console.log('\nkozmetik açılış günleri (en erken–en geç, açılmayan: -):');
  for (const world of ['ay', 'mars']) for (const level of ['kasif', 'muhendis']) {
    const U = unlT[`${world}/${level}/usta`], T = unlT[`${world}/${level}/tembel`], O = unlT[`${world}/${level}/orta`];
    for (const id of big) check(U.every(u => u[id] != null), `kozmetik: usta ${world}/${level} ${id} açmalı`);
    check(T.every(u => !big.some(id => u[id] != null)), `kozmetik: tembel ${world}/${level} gezgin/araç/üs rengi açmamalı`);
    check(U.every(u => u.us_turkuaz != null && u.us_turkuaz <= 3), `kozmetik: usta ${world}/${level} ilk renk 3. günde açılmalı`);
    const span = (L2, id) => { const d = L2.map(u => u[id]).filter(x => x != null); return d.length ? `${Math.min(...d)}–${Math.max(...d)}${d.length < L2.length ? '(' + d.length + '/4)' : ''}` : '-'; };
    if (level === 'kasif') console.log(` ${world}/${level} ` + G.COSMETICS.filter(c => !c.def && c.rule).map(c => `${c.id} u${span(U, c.id)} o${span(O, c.id)}`).join(' · '));
  }
}


for (const world of ['ay', 'mars']) {
  const s = G.newGame(world, 'muhendis', 77, 'izle');
  const seen = new Map(); let defs = 0, maxDec = 0;
  while (!s.over) {
    Object.assign(s.res, { o2: 999, su: 999, gida: 999 });
    for (const p of s.pending) if (!seen.has(p.pid)) seen.set(p.pid, p);
    const ids = new Set(s.pending.map(p => p.pid)), t0 = s.t;
    G.tick(s);
    check(s.t === t0 + 1 || s.over, 'izle: saat ilerlemeli');
    for (const pid of ids) if (!s.pending.some(p => p.pid === pid)) {
      const p = seen.get(pid);
      check(s.t === p.due, `izle: varsayılan tam due saatinde (${p.type} ${p.id || ''} due ${p.due} t ${s.t})`);
      check(s.radio.some(r => r.def === pid), 'izle: varsayılan telsizden söylenmeli');
      defs++;
    }
    maxDec = Math.max(maxDec, s.pending.filter(p => p.type === 'event').length);
  }
  const calls = [...seen.values()];
  const decs = calls.filter(p => p.type === 'event');
  decs.forEach((p, i) => {
    if (i && p.id !== 'flare') check(p.due - G.EVENTS[p.id].due - decs[i - 1].due >= 30, 'izle: karar çağrıları arası 30 saat');
  });
  console.log(`\nizle ${world}: ${calls.length} çağrı (${decs.length} karar: ${decs.map(p => p.id).join(' ')}, ${calls.length - decs.length} kargo), ${defs} varsayılan, en çok ${maxDec} karar aynı anda, ${s.radioN} telsiz mesajı, bölüm ${s.story.ch}`);
  check(defs === calls.length - s.pending.length && defs > 0, 'izle: her çağrı varsayılanla kapanmalı');
  check(s.stat.choices.length === defs && s.stat.choices.every(o => o.by === 'atlas' && o.pick.tr && o.pick.en && o.title.tr && o.title.en), 'karar günlüğü: kapanan her çağrı için bir kayıt (ATLAS)');
  const kc = G.keyChoices(s);
  check(kc.length <= 3 && kc.length > 0 && kc.every(o => o.day >= 1 && o.title.tr && o.pick.en && o.effect.tr && o.effect.en && o.by === 'atlas' && !/ATLAS/.test(o.effect.tr)), 'keyChoices: en çok 3, iki dilde; ATLAS notu efektte tekrar yazılmaz (arayüz byAtlas ile bir kez yazar)');
  storyChecks(s, true);
}


{
  const s = G.newGame('mars', 'muhendis', 42, 'bot'), ctx = { r: 42 };
  while (s.t < 300) { smartBot(s, ctx, 0.9); G.tick(s); }
  const j = JSON.stringify(s), s2 = JSON.parse(j), ctx2 = { ...ctx };
  for (let i = 0; i < 400 && !s.over; i++) { smartBot(s, ctx, 0.9); G.tick(s); smartBot(s2, ctx2, 0.9); G.tick(s2); }
  check(JSON.stringify(s) === JSON.stringify(s2), 'kaydet/yükle: kopya aynı devam etmeli');
  const s3 = JSON.parse(JSON.stringify(s)); s3.over = null; s3.free = true;
  for (let i = 0; i < 48; i++) { smartBot(s3, ctx, 0.9); G.tick(s3); }
  console.log('\nkaydet/yükle + serbest mod: tamam, boyut', j.length);
}

{
  const s = G.newGame('ay', 'muhendis', 3, 'api');
  const rel = G.relicTiles(s);
  check(rel.length === 3 && rel.every((r, i) => r.idx === i && G.tileAt(s, r.x, r.y) === 's'), 'relicTiles: üç kalıntı');
  const be = G.bankEntries(s);
  check(be.length > 30 && be.every(e => e.id && e.cat && e.title && typeof e.open === 'boolean'), 'bankEntries şekli');
  check(be.find(e => e.id === 'b:hub').open && !be.find(e => e.id === 'r:0').open, 'bankEntries: hub açık, kalıntı kapalı');
  const cs = G.cargoSuggest(s, 2600);
  check(Object.keys(cs).length > 0 && Object.entries(cs).reduce((a, [id, n]) => a + n * G.CARGO.find(c => c.id === id).kg, 0) <= 2600, 'cargoSuggest kütle sınırı');
  check(G.scanInfo(s, 0, 0) === null || typeof G.scanInfo(s, 0, 0).kind === 'string', 'scanInfo');
  for (const k of 'imtcr') for (const w of ['ay', 'mars']) check(G.SCANS[k].text[w] && G.SCANS[k].fact[w], 'SCANS metni ' + k + w);
  check(G.QUIZ.every(q => q.tag && (!q.w || q.w === 'ay' || q.w === 'mars')), 'QUIZ etiketleri');
  const r = rel[0]; G.explore(s, r.x, r.y); const sc = G.scan(s, r.x, r.y);
  check(sc.ok && sc.relic === 0 && sc.bilim >= 12 && s.radio.some(m => m.from === 'kayit'), 'kalıntı taraması');
  check(G.bankEntries(s).find(e => e.id === 'r:0').open, 'kalıntı veri bankasına girdi');
}

for (const w of ['ay', 'mars']) {
  const s = G.newGame(w, 'muhendis', 3, 'bot');
  G.pushEvent(s, 'flare');
  const p = s.pending.find(o => o.id === 'flare');
  check(p && Number.isFinite(p.hit), 'verisiz flare: hit sonlu ' + w);
  G.resolve(s, 1, p.pid);
  check(Number.isFinite(s.dose) && Number.isFinite(G.score(s).total), 'verisiz flare: doz ve puan sonlu ' + w);
}

for (const w of ['ay', 'mars']) {
  const { s } = run(w, 'muhendis', 11, lazyBot, 0);
  const gr = G.score(s).grades;
  check(gr.length === 5 && gr.find(g => g.id === 'guc').g === 'F', 'tembel karne: güç notu düşük ' + w);
  check(gr.filter(g => g.g === 'A' || g.g === 'B').length <= 2, 'tembel karne: çoğu not düşük ' + w + ' ' + gr.map(g => g.id + g.g).join(','));
}

for (const [kind, expectNever] of [['solar', false], ['none', true]]) {
  const s = G.newGame('ay', 'kasif', 3, 'T'); s.res.malzeme = 500; s.res.parca = 100;
  if (kind === 'solar') { const t = findTile(s, t2 => t2 === '.'); check(!!t && G.build(s, 'gunes', t[0], t[1]).ok, 'güç notu: panel kurulamadı'); }
  for (let i = 0; i < 8; i++) { s.pending.length = 0; G.tick(s); }
  const note = G.score(s).grades.find(g => g.id === 'guc').note;
  check(/Hiç elektrik yapısı/.test(note.tr) === expectNever && /never built a power source/.test(note.en) === expectNever, 'güç notu (' + kind + '): beklenen "hiç kurmadın"=' + expectNever + ' → ' + note.tr);
}

{
  const s = G.newGame('ay', 'muhendis', 9, 'T');
  const r = G.canBuild(s, 'lab');
  check(r.why === 'stage' && r.msg && r.msg.tr && r.msg.en, 'aşama: kapalı yapı "stage" ile reddedilir');
  check(G.canBuild(s, 'gunes').ok && G.STAGE1.every(k => G.unlockedB(s, k).ok), 'aşama: 1. aşama baştan açık');
  const u = G.unlockedB(s, 'geri'); check(!u.ok && u.why.tr && u.at.en, 'aşama: araştırma kilidi nedenini söyler');
  check(G.canBuild(s, 'geri').why === 'tech', 'aşama: araştırma kilidi "tech" kalır');
  const poor = Object.assign(JSON.parse(JSON.stringify(s)), {}); poor.res.malzeme = 3;
  const rc = G.canBuild(poor, 'gunes'); check(rc.why === 'cost' && rc.miss.m === 7 && /7 malzeme eksik/.test(rc.msg.tr), 'canBuild: eksik miktarı söyler');
  check(G.costOf(G.newGame('ay', 'kasif', 9, 'T'), 'lab').p === 0 && G.costOf(s, 'lab').p > 0, 'Kâşif: yapılar yedek parça istemez');

  const before = JSON.stringify(s.res), sp = G.suggestSpot(s, 'gunes'), b = G.build(s, 'gunes', sp.x, sp.y).b;
  check(G.undoBuild(s, b) && JSON.stringify(s.res) === before && !s.b.includes(b), 'undoBuild: tam iade');
  const b2 = G.build(s, 'gunes', sp.x, sp.y).b; G.tick(s);
  check(!G.undoBuild(s, b2), 'undoBuild: inşaat başladıktan sonra yok');

  const s2 = G.newGame('mars', 'muhendis', 9, 'T');
  while (G.dayOf(s2) < 3) { s2.pending.length = 0; G.tick(s2); }
  check(G.buildStage(s2) >= 2 && G.canBuild(s2, 'lab').why !== 'stage' && s2.radio.some(m => /Yeni yapılar/.test(m.title.tr)), 'aşama: 3. günde açılır ve duyurulur');

  for (const w of ['ay', 'mars']) for (let i = 1; i <= 8; i++) {
    const g = G.newGame(w, 'muhendis', 100 + i * 37, 'P'); g.res.malzeme = 999; g.res.parca = 999;
    const pl = G.starterPlan(g), keys = new Set(pl.map(o => o.x + ',' + o.y));
    check(pl.length === 5 && keys.size === 5 && pl.every((o, j) => o.n === j + 1 && G.canBuild(g, o.k, o.x, o.y).ok), 'starterPlan: 5 ayrı geçerli kare ' + w + i);
  }
  check(Math.abs(G.dosePct(G.newGame('mars', 'muhendis', 1, 'D')) - 55) < 0.01, 'dosePct: güvenli sınırın yüzdesi');
}


const clone = o => JSON.parse(JSON.stringify(o));
const fmtN = (v, lang) => { const a = Math.abs(v), r = a >= 1.5 ? String(Math.round(a)) : a.toFixed(1); return (v < 0 ? '−' : '+') + (lang === 'tr' ? r.replace('.', ',') : r); };
function midState(world, idleWanted) {
  const s = G.newGame(world, 'muhendis', 1007, 'M'), ctx = { r: 3 };
  while (s.t < 260) { smartBot(s, ctx, 0.9); G.tick(s); }
  delete s.techs.toz; delete s.techs.oto; s.pending.length = 0; s.decT = -999; s.res.parca = Math.max(s.res.parca, 20);
  for (const b of s.b) { b.broken = false; if (b.k === 'sera') b.grow = Math.max(b.grow || 0, 100); }
  G.tick(s);
  for (let i = 0; i < 12 && s.idle !== idleWanted; i++) { s.pop += s.idle < idleWanted ? 1 : -1; s.pending.length = 0; G.tick(s); }
  s.pending.length = 0; s.decT = -999;
  return s;
}
let pvN = 0;
for (const world of ['ay', 'mars']) for (const idleW of [0, 2]) {
  const base = midState(world, idleW);
  check(idleW === 0 ? base.idle === 0 : base.idle >= 2, `önizleme durumu: boşta ${idleW} (${world}, gerçek ${base.idle})`);
  for (const id in G.EVENTS) {
    const ev = G.EVENTS[id]; if (!ev.ch) continue;
    const s = clone(base);
    check(G.pushEvent(s, id, id === 'flare' ? { hit: G.WORLDS[world].flareHit[0] } : undefined), 'önizleme: olay eklenemedi ' + id);
    const p = s.pending[s.pending.length - 1];
    const ds = [];
    ev.ch.forEach((ch, c) => {
      const j0 = JSON.stringify(s), rs0 = s.rs;
      const pv = G.previewChoice(s, p.pid, c);
      check(JSON.stringify(s) === j0 && s.rs === rs0, `önizleme durumu değiştirmemeli ${id}/${c}`);
      pvN++;
      const moved = G.PV_KEYS.some(k => Math.abs(pv.d[k]) >= (k === 'guc' ? 1 : 0.5)) || pv.stops.some(o => Math.abs(o.h) >= 1);
      if (ch.none) check(!moved, `boş seçenek gerçekten boş olmalı ${id}/${c}`);
      else check(moved, `her seçenek bir şeyi değiştirmeli ${world} boşta${idleW} ${id}/${c} ${JSON.stringify(pv.d)}`);
      ds.push(JSON.stringify(G.PV_KEYS.map(k => Math.round(pv.d[k] * 10))) + JSON.stringify(pv.stops));

      const R = clone(s), B = clone(s); R.quiet = true; B.quiet = true; if (ch.risky) R.forceRoll = 'bad';
      G.resolve(R, c, p.pid); B.pending = B.pending.filter(o => o.pid !== p.pid);
      for (let i = 0; i < pv.h; i++) { G.tick(R); G.tick(B); }
      const real = { dose: R.dose - B.dose, moral: R.moral - B.moral, pop: R.pop - B.pop };
      for (const k of ['o2', 'su', 'gida', 'malzeme', 'parca', 'bilim']) real[k] = R.res[k] - B.res[k];
      check(Object.keys(real).every(k => Math.abs(real[k] - pv.d[k]) < 1e-6), `önizleme = gerçek ${world} ${id}/${c}`);

      const h = ch.h(s, p);
      check(h.tr.includes(pv.text.tr) && h.en.includes(pv.text.en), `seçenek metni önizlemeden gelmeli ${id}/${c}`);
      for (const k of G.PV_KEYS) if (Math.abs(pv.d[k]) >= (k === 'guc' ? 1 : 0.5))
        check(pv.text.tr.includes(fmtN(pv.d[k], 'tr') + ' ' + G.PV_WORD[k].tr) && pv.text.en.includes(fmtN(pv.d[k], 'en') + ' ' + G.PV_WORD[k].en), `metindeki sayı gerçek değer ${id}/${c}/${k}`);
      check(typeof ch.dur === 'number' && ch.dur > 0 && pv.h === Math.min(96, ch.dur), 'ch.dur saat ' + id);
      if (ch.risky) check(pv.risk && pv.risk.tr && pv.risk.en, 'şans seçeneği riskini söyler ' + id);
    });
    check(new Set(ds).size === ds.length, `seçenekler birbirinden farklı olmalı ${world} ${id}`);

    const s3 = clone(s), out = G.resolve(s3, 0, p.pid);
    check(out && out.deltas && s3.stat.choices.length === s.stat.choices.length + 1 && s3.stat.choices.at(-1).by === 'you', 'resolve: deltas ve karar günlüğü ' + id);
    if (id === 'toz') {
      check(Math.abs(out.deltas.o2 + 2 * G.EVA.o2) < 1e-9 && out.deltas.busy === 2, 'toz temizliği: −2 oksijen, 2 kişi dışarıda (anlık)');
      const fx = G.activeEffects(s3).map(e => e.id);
      check(fx.includes('temiz') && fx.includes('mesgul:toz'), 'activeEffects: temizlik etkileri görünür');
    }
    if (id === 'teklif' && idleW === 0) check(G.previewChoice(s, p.pid, 0).stops.some(o => o.h > 0), 'teklif: kimse boşta değilse bir yapı durur ve adı söylenir');
  }
  const lab = base.b.find(b => b.k === 'lab' && b.left === 0 && b.st === 'ok');
  if (lab) { const pt = G.previewToggle(base, lab); check(pt.stops.some(o => o.k === 'lab' && o.h >= 20) && pt.d.bilim < 0 && pt.text.tr, 'previewToggle: laboratuvar durur, bilim azalır'); }
}
{
  const s = G.newGame('ay', 'muhendis', 3, 'C'), pc = G.previewCargo(s, { o2: 1, moral: 1, crew: 1 });
  const o2 = pc.find(o => o.r === 'o2');
  check(o2 && o2.add === 30 && Math.abs(o2.days - 30 / (0.84 * 4)) < 0.06 && pc.find(o => o.r === 'moral').add === G.MOOD.paket && pc.find(o => o.r === 'pop').add === 2, 'previewCargo: miktar ve gün');
  const m0 = s.moral; s.pending.push({ pid: 999, type: 'cargo', mass: 2600, due: 999, def: {} });
  const r = G.resolve(s, { moral: 1 }, 999);
  check(r.ok && Math.abs(s.moral - m0 - G.MOOD.paket) < 1e-9 && Math.abs(r.deltas.moral - G.MOOD.paket) < 1e-9, 'kargo paketi: moral yazdığı kadar hemen artar');
}
console.log(`\nönizleme kontrolleri: ${pvN} seçenek`);


{
  const s = G.newGame('ay', 'muhendis', 5, 'I'), lines = [];
  let lvl3 = null;
  while (!s.over && s.t < 24 * 25) {
    Object.assign(s.res, { o2: 999, su: 999, gida: 999 }); s.mmod = -60; s.pending.length = 0;
    G.tick(s);
    if (s.mut.lvl === 3 && !lvl3) { lvl3 = clone(s); check(G.mutinyInfo(s).risk === 'ciddi' && /huzursuz/.test(G.advice(s)[0].m.tr), 'isyan: 3. düzeyde risk ciddi, öneri en başta'); }
  }
  for (const m of s.radio) if (m.mut != null) lines.push(m);
  check(lines.length >= 3 && lines[0].mut === 1 && lines[1].mut === 2 && lines[2].mut === 3 && lines[1].t - lines[0].t >= 24 && lines[2].t - lines[1].t >= 24, 'isyan: 1→2→3 uyarı sırası, 24 saat arayla');
  check(lines.slice(0, 3).every(m => m.who && m.hint && m.hint.tr && m.hint.en), 'isyan: uyarılarda konuşan ve ipucu');
  check(s.over && s.over.why === 'isyan' && s.stat.mut.lvl === 3, 'isyan: zorla düşük moralde kapsül kalkar');
  const ek = G.debrief(s).find(g => g.id === 'ekip');
  check(ek.g === 'F' && /30'un altında/.test(ek.note.tr) && ek.note.en, 'isyan: karnede Ekip F ve neden');
  check(G.STORY.ay.epilogue.isyan.tr && G.STORY.mars.epilogue.isyan.en, 'isyan: son metni');

  const r = lvl3; r.over = null;
  let down = false;
  for (let i = 0; i < 24 * 4 && !r.over; i++) { Object.assign(r.res, { o2: 999, su: 999, gida: 999 }); r.mmod = 40; r.pending.length = 0; G.tick(r); if (r.mut.lvl < 3) { down = true; break; } }
  check(down && r.radio.some(m => m.mut === 0), 'isyan: moral düzelince uyarı düzeyi iner ve teşekkür gelir');
}


{
  const JR = /ECLSS|RTG|MOXIE|regolit|mSv|PDA|ikmal|fisyon|kütle/i, KW = /\bkWh?\b/;
  const bad = [];
  const look = (o, where) => { if (!o) return; for (const lg of ['tr', 'en']) if (JR.test(o[lg]) || KW.test(o[lg])) bad.push(where + ' ' + o[lg]); };
  for (const k in G.BLD) { const d = G.BLD[k]; look(d.name, k); look(d.does, k); look(d.needs, k); if (d.nameW) for (const w in d.nameW) look(d.nameW[w], k); }
  for (const k in G.TECHS) { look(G.TECHS[k].name, k); look(G.TECHS[k].desc, k); }
  for (const c of G.CARGO) { look(c.name, c.id); look(c.give, c.id); }
  for (const m of G.MISSIONS) { look(m.t, m.id); look(m.d, m.id); }
  for (const id in G.EVENTS) look(G.EVENTS[id].title, id);
  check(!bad.length, 'jargon: ' + bad.join(' | '));

  let nL = 0;
  const empty = [];
  const walk = (o, path, seen) => {
    if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
    if ('tr' in o && 'en' in o && Object.keys(o).length === 2) { nL++; if (typeof o.tr !== 'string' || typeof o.en !== 'string' || !o.tr.trim() || !o.en.trim()) empty.push(path); return; }
    for (const k in o) walk(o[k], path + '.' + k, seen);
  };
  for (const [n, o] of Object.entries({ BLD: G.BLD, TECHS: G.TECHS, CARGO: G.CARGO, MISSIONS: G.MISSIONS, EVENTS: G.EVENTS, STORY: G.STORY, GROUPS: G.GROUPS,
    MUT_LINES: G.MUT_LINES, MOR_WHY: G.MOR_WHY, MOR_HINT: G.MOR_HINT, WARN_MSG: G.WARN_MSG, SCANS: G.SCANS, PV_WORD: G.PV_WORD, SIMPLIFY: { x: G.SIMPLIFY } })) walk(o, n, new Set());
  check(!empty.length, 'iki dil: boş metin ' + empty.join(', '));
  check(G.BUILD_ORDER.every(k => G.BLD[k].does && G.BLD[k].needs && G.GROUPS[G.BLD[k].group]) && G.GROUP_ORDER.every(g => G.GROUPS[g]), 'yapılar: does/needs/group');
  check(['deniz', 'atlas', 'ece', 'kerem', 'nil', 'arda'].every(k => G.STORY.cast[k] && G.STORY.cast[k].name.tr && ['mc', 'atlas', 'crew'].includes(G.STORY.cast[k].from)), 'STORY.cast');

  const long = [];
  const sent = (o, w) => { if (!o) return; for (const lg of ['tr', 'en']) for (const c of o[lg].split(/[.!?…]+\s*/)) if (c.split(/\s+/).filter(Boolean).length > 14) long.push(w + ': ' + c); };
  for (const w of ['ay', 'mars']) {
    const S = G.STORY[w];
    for (const b of S.beats.concat(S.react)) { (Array.isArray(b.text) ? b.text : [b.text]).forEach(t => sent(t, b.id)); sent(typeof b.hint === 'function' ? b.hint(G.newGame(w, 'kasif', 1, 'H')) : b.hint, b.id); }
    for (const c of S.chapters) { check(c.goal && c.goal.tr && c.goal.en, 'chapter.goal ' + w + c.id); sent(c.goal, c.id); }
  }
  for (const k of G.BUILD_ORDER) for (const f of ['does', 'needs']) for (const lg of ['tr']) if (G.BLD[k][f][lg].split(/\s+/).length > 8) long.push(k + '.' + f + ': ' + G.BLD[k][f][lg]);
  check(!long.length, 'çocuk dili (uzun cümle): ' + long.join(' | '));
  console.log(`iki dil kontrolü: ${nL} metin`);
}


{
  const strip = o => { const c = JSON.parse(JSON.stringify(o)); delete c.unl; return JSON.stringify(c); };

  for (const world of ['ay', 'mars']) for (const level of ['kasif', 'muhendis']) for (const [bot, sk] of [[smartBot, 0.9], [smartBot, 0.5]]) {
    G = G_ON; const a = run(world, level, 2024, bot, sk);
    G = G_OFF; const b = run(world, level, 2024, bot, sk);
    G = G_ON;
    check(Object.keys(a.s.unl).length > 0 && !Object.keys(b.s.unl || {}).length, 'kozmetik açık/kapalı: açık koşu kilit açmalı ' + world);
    check(strip(a.s) === strip(b.s) && a.s.rs === b.s.rs && a.sc.total === b.sc.total, `kozmetik açık/kapalı koşular birebir aynı olmalı ${world}/${level}/${sk}`);
  }

  {
    const s = G.newGame('ay', 'muhendis', 5, 'K'); s.done.kesif = 8; s.res.bilim = 200;
    const rs = s.rs, res = JSON.stringify(s.res), logN = s.logN, radioN = s.radioN;
    const got = G.checkCosmetics(s);
    check(got.includes('gz_sari') && got.includes('uz_kozmik') && s.rs === rs && JSON.stringify(s.res) === res && s.logN === logN && s.radioN === radioN, 'checkCosmetics: yalnız s.unl değişir');
    check(G.checkCosmetics(s).length === 0 && JSON.parse(JSON.stringify(s.unl)).gz_sari === s.t, 'checkCosmetics: bir kez açar, JSON güvenli');
    check(G.sciTotal(s) === 200 && (s.techs.panel = 1, G.sciTotal(s) === 200 + G.TECHS.panel.cost), 'sciTotal: eldeki + buluşlara harcanan');
    const nr = G.nextRewards(s, { vz_gumus: 1 });
    check(!nr.some(o => o.id === 'vz_gumus' || o.id === 'gz_sari') && nr.length === 3, 'nextRewards: profilde ve açılmış olanlar çıkar');
    check(G.ruleProg(s, { t: 'sci', n: 1000 }) > 0.2 && G.ruleProg(s, { t: 'sci', n: 1000 }) < 0.3 && G.ruleProg(s, { t: 'nope' }) === 0 && !G.ruleMet(s, null), 'ruleProg: oransal, bilinmeyen kural 0');
  }

  for (const world of ['ay', 'mars']) for (const id in G.EVENTS) {
    const ev = G.EVENTS[id]; if (!ev.ch) continue;
    const s = midState(world, 2); s.pending.length = 0; s.decT = -999;
    if (!G.pushEvent(s, id, id === 'flare' ? { hit: 5 } : undefined)) continue;
    const p = s.pending[s.pending.length - 1], out = G.resolve(s, 0, p.pid) || G.resolve(s, 1, p.pid);
    const want = G.realLine(s, 'ev', id);
    check(out && (want ? out.real && out.real.tr && out.real.en && out.real === want : out.real === null), `resolve().real ${world}/${id}`);
    if (out && out.real && /\d/.test(out.real.tr)) check(!!out.real.src, 'resolve().real: rakamlı satırın kaynağı ' + id);
  }

  {
    const s = G.newGame('mars', 'muhendis', 9, 'Ada'); s.res.malzeme = 999;
    const sp = G.suggestSpot(s, 'oksijen'); G.build(s, 'oksijen', sp.x, sp.y); const sg = G.suggestSpot(s, 'gunes'); G.build(s, 'gunes', sg.x, sg.y);
    for (let i = 0; i < 40; i++) { s.pending.length = 0; G.tick(s); }
    const ms = s.radio.filter(m => m.goal === 'o2');
    const hasR = !!G.realLine(s, 'ms', 'o2');
    check(s.done.o2 && ms.length === 1 && ms[0].title.tr === 'İlk nefes' && (hasR || (/^Hedef tamam! Ödül: \+20 malzeme\.( Sıradaki: [^.]+\.)?$/.test(ms[0].text.tr) && /^Goal complete! Reward: \+20 material\.( Next: [^.]+\.)?$/.test(ms[0].text.en))), 'hedef telsizi: başlık, tek mesaj');
    if (hasR) check(/^Hedef tamam! Gerçekte: MOXIE/.test(ms[0].text.tr) && /^Goal complete! In real life: MOXIE/.test(ms[0].text.en) && ms[0].src, 'hedef telsizi: gerçek satırı ve kaynak');
    check(!s.log.some(l => /Görev tamamlandı/.test(l.m.tr)), 'hedef: eski "Görev tamamlandı" bildirimi telsize taşındı');

    check(s.radio.some(m => /Merhaba Ada!/.test(m.text.tr) && /Hello, Ada!/.test(m.text.en)), 'ad: ATLAS oyuncuyu adıyla selamlar');
    const s2 = G.newGame('ay', 'kasif', 9, '   '); for (let i = 0; i < 8; i++) { s2.pending.length = 0; G.tick(s2); }
    check(s2.name === '' && s2.radio.some(m => /Merhaba Komutan!/.test(m.text.tr) && /Hello, Commander!/.test(m.text.en)), 'ad: boş ad "Komutan" olur');
    check(G.newGame('ay', 'kasif', 9, 'x'.repeat(40)).name.length === 18 && G.cmdName({ name: '  Ay  Su ' }).tr === 'Ay Su', 'ad: en çok 18 karakter, boşluklar sadeleşir');
  }

  {
    const near = (a, b) => { const p = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), q = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 60; };
    for (const pl of ['#ff7a2f', '#3b8ee8', '#3fbf5f', '#f2c230', '#9b6bff', '#ff5fa2', '#e8743b', 0xff7a2f]) {
      const cc = G.STORY.crewColors(pl), ph = typeof pl === 'number' ? '#' + pl.toString(16) : pl;
      check(cc.length === 4 && new Set(cc).size === 4 && cc.every(h => /^#[0-9a-f]{6}$/i.test(h) && !near(h, ph)), 'ekip renkleri: oyuncununkinden farklı ' + ph + ' → ' + cc.join(','));
    }
    check(G.STORY.crewColors('#3b8ee8')[0] === '#ff7a2f' && G.STORY.crewColors(null).join() === '#ff7a2f,#3b8ee8,#3fbf5f,#f2c230', 'ekip renkleri: çakışma yoksa herkes kendi rengini giyer');
    check(G.STORY.crew.join() === 'ece,kerem,nil,arda', 'ekip sırası (CREW_COL ile aynı)');
  }

  {
    const s = G.newGame('mars', 'kasif', 42, 'eski'), ctx = { r: 4 };
    while (s.t < 200) { smartBot(s, ctx, 0.9); G.tick(s); }
    const old = JSON.parse(JSON.stringify(s)); delete old.unl; delete old.story.goalQ; delete old.story.goalT;
    for (let i = 0; i < 100 && !old.over; i++) { smartBot(old, ctx, 0.9); G.tick(old); }
    check(old.v === 3 && old.unl && Object.keys(old.unl).length > 0 && Array.isArray(old.story.goalQ), 'eski kayıt: s.v 3, migrate yeni alanları doldurur');
    check(Array.isArray(G.learnedList(old)) && Array.isArray(G.nextRewards(old)) && G.score(old).total >= 0, 'eski kayıt: karne işlevleri çalışır');
  }

  for (const w of ['ay', 'mars']) {
    const lz = run(w, 'kasif', 11, lazyBot, 0).s, l0 = G.learnedList(lz);
    check(l0.length >= 1 && l0[0].fail && /Hava|hava/.test(l0[0].t.tr), 'learnedList: tembel önce hava dersini alır ' + w + ' ' + l0.map(o => o.id));
    for (const sk of [0.9, 0.5]) { const ll = G.learnedList(run(w, 'muhendis', 1007, smartBot, sk).s); check(ll.length >= 1 && ll.length <= 3, 'learnedList: 1–3 madde ' + w + sk); }
  }

  if ((G.REAL && G.REAL.bank || []).length) {
    const g = G.REAL.bank[0], s = G.newGame('ay', 'kasif', 3, 'B');
    check(!G.bankEntries(s).find(e => e.id === g.id).open, 'gercek sayfası başta kapalı');
    G.noteTag(s, g.tag);
    const e = G.bankEntries(s).find(o => o.id === g.id);
    check(e && e.cat === 'gercek' && e.open && s.bank[g.id] === s.t, 'gercek sayfası etiketle açılır');
  }

  for (const id of ['karanlik', 'donma', 'doz', 'isci']) {
    const b = G.STORY.ay.react.find(o => o.id === id);
    check(b && b.from === 'atlas' && b.hint, 'neden satırı var ' + id);
    const hn = b && typeof b.hint === 'function' ? b.hint(G.newGame('ay', 'kasif', 1, 'H')) : b && b.hint;
    for (const o of (b ? b.text.concat(hn ? [hn] : []) : [])) for (const lg of ['tr', 'en']) for (const c of o[lg].split(/[.!?:]+\s*/)) check(c.split(/\s+/).filter(Boolean).length <= 12, 'neden satırı ≤ 12 kelime ' + id + ': ' + c);
  }

  for (const w of ['ay', 'mars']) { const r = run(w, 'kasif', 1007, smartBot, 0.5); const n = r.s.radioN, g = r.s.radio.filter(m => m.goal).length, why = r.s.radio.filter(m => m.beat && /^r:(karanlik|donma|doz|isci)/.test(m.beat)).length; console.log(`telsiz yoğunluğu ${w}/kasif/orta: ${n} mesaj (hedef ${g}, neden ${why})`); }
}


{
  const ids = ['flare', 'toz', 'sizinti', 'kuf', 'ozlem', 'teklif', 'egitim'];
  check(G.ATLAS_Q.length === ids.length && ids.every(id => G.ATLAS_Q.includes(id)), 'ATLAS_Q: yedi bilgi sorusu ' + G.ATLAS_Q.join(','));
  check(!G.RANDOM_EVENTS.includes('egitim'), 'egitim sorusu rastgele olaylarda yok');
  const s0 = G.newGame('ay', 'kasif', 5, 'Q');
  for (const id of G.ATLAS_Q) {
    const ev = G.EVENTS[id], vis = ev.ch.filter(c => !c.hide);
    check(okL(ev.q, 12), 'ATLAS_Q: soru ≤12 kelime ' + id);
    check(vis.length >= 2 && vis.length <= 3 && vis.every(c => okL(c.l, 4)), 'ATLAS_Q: 2–3 görünür şık, ≤4 kelime ' + id);
    check(ev.ch.filter(c => c.ok === true).length === 1 && vis.some(c => c.ok === true), 'ATLAS_Q: tam bir doğru şık ' + id);
    check(ev.ch.filter(c => c.hide).length === 1 && ev.ch[ev.def] && ev.ch[ev.def].hide === true && !ev.ch[ev.def].ok, 'ATLAS_Q: gizli tarafsız seçenek def ' + id);
    check(okL(ev.why, 12), 'ATLAS_Q: why ≤12 kelime ' + id);
    for (const w of ['ay', 'mars']) {
      const t = ev.text(Object.assign(G.newGame(w, 'kasif', 5, 'Q'), {}), { hit: 20 });
      for (const lg of ['tr', 'en']) check(t[lg].split(/[.!?]+/).filter(x => x.trim()).length <= 2 && t[lg].includes(ev.q[lg]), `ATLAS_Q: telsiz metni en çok iki cümle ve soruyu söyler ${id}/${w}/${lg}: ${t[lg]}`);
    }
  }
  void s0;
}

{
  let nState = 0, nWrong = 0;
  for (const world of ['ay', 'mars']) for (const level of ['kasif', 'muhendis']) {
    const states = [];
    for (const [seed, skill] of [[301, 0.5], [302, 0.9]]) {
      const s = G.newGame(world, level, seed, 'W'), ctx = { r: seed };
      const wantT = new Set(); const pick = { r: seed * 13 };
      while (wantT.size < 25) wantT.add(8 + Math.floor(rand(pick) * (G.WORLDS[world].missionDays * 24 - 20)));
      while (!s.over && states.filter(x => x.seed === seed).length < 25 && s.t < G.WORLDS[world].missionDays * 24) {
        smartBot(s, ctx, skill); if (s.over) break; G.tick(s);
        if (wantT.has(s.t) && !s.over) states.push({ seed, s: clone(s) });
      }
    }
    for (const { s: base } of states) {
      nState++;
      for (const id of G.ATLAS_Q) {
        const s = clone(base); s.pending = s.pending.filter(p => p.type !== 'event'); s.decT = -999;
        if (!G.pushEvent(s, id, id === 'flare' ? { hit: G.WORLDS[world].flareHit[1] } : undefined)) continue;
        const p = s.pending[s.pending.length - 1], ev = G.EVENTS[id];
        ev.ch.forEach((ch, c) => {
          const A = clone(s), B = clone(s); A.quiet = true; B.quiet = true;
          const out = G.resolve(A, c, p.pid);
          check(!!out && okL(out.text, 12), `ATLAS_Q: sonuç metni ≤12 kelime ${id}/${c} → ${out && JSON.stringify(out.text)}`);
          if (!out) return;
          check(out.ok === (ch.ok === true) && (ch.ok ? out.why === null : out.why === ev.why), 'ATLAS_Q: resolve ok/why ' + id + '/' + c);
          check(!A.over, `ATLAS_Q: yanıt görevi o anda bitirmemeli ${world}/${level} ${id}/${c}`);
          B.pending = B.pending.filter(o => o.pid !== p.pid);
          G.tick(A); G.tick(B);
          check(!A.over || B.over, `ATLAS_Q: yanlış yanıt görevi o saatte bitirmemeli ${world}/${level} ${id}/${c} (${A.over && A.over.why})`);
          if (!ch.ok) nWrong++;
          for (const r of ['o2', 'su', 'gida']) check(!(A.short[r] > B.short[r]), `ATLAS_Q: yanıt kaynağı sıfırlamamalı ${id}/${c}/${r}`);
          if (id === 'egitim') for (const r of ['o2', 'su', 'gida', 'malzeme', 'parca', 'bilim']) check(A.res[r] >= B.res[r] - 1e-9, 'egitim sorusu kayıpsız ' + c + r);
        });
      }
    }
  }
  console.log(`\nATLAS soruları: ${nState} durum, ${nWrong} yanlış/yanıtsız yanıt denendi`);
}

for (const world of ['ay', 'mars']) for (const id of ['flare', 'toz', 'sizinti', 'kuf', 'ozlem', 'teklif', 'egitim']) {
  const s = midState(world, 2); s.pending.length = 0; s.decT = -999;
  check(G.pushEvent(s, id, id === 'flare' ? { hit: 10 } : undefined), 'dueStep: olay ' + id);
  const p = s.pending[s.pending.length - 1], n0 = s.stat.choices.length;
  while (s.pending.some(o => o.pid === p.pid) && !s.over) { s.pending = s.pending.filter(o => o.pid === p.pid); G.tick(s); }
  const last = s.stat.choices[n0];
  check(last && last.id === id && last.by === 'atlas' && last.c === G.EVENTS[id].def, `dueStep: yanıtsız soruda gizli seçenek ${world}/${id}`);
  const msg = s.radio.find(m => m.def === p.pid);
  check(msg && msg.text.tr.includes(G.EVENTS[id].why.tr) && msg.text.en.includes(G.EVENTS[id].why.en), 'dueStep: ATLAS doğrusunu söyler ' + id);
}


{
  const W = G.WORKQ, wl = () => W.map((q, i) => i);

  check(Array.isArray(W) && W.length >= 4, 'WORKQ var');
  for (const q of W) check(['repair', 'scan', 'build', 'cargo', 'any'].includes(q.act) && [1, 2].includes(q.lv) && okL(q.q, 12) && q.a.length >= 2 && q.a.length <= 3 && q.a.every(a => okL(a, 4)) && okL(q.e, 12), 'WORKQ biçimi ' + q.id);
  if (G_NOWQ) check(G_NOWQ.workQ(G_NOWQ.newGame('ay', 'kasif', 1, 'x'), 'repair') === null, 'workQ: WORKQ yoksa null');

  const s = G.newGame('ay', 'muhendis', 21, 'K'), rs = s.rs;
  const q1 = G.workQ(s, 'repair');
  check(q1 && Number.isInteger(q1.qi) && q1.act === 'repair' && q1.a.length >= 2 && q1.q.tr, 'workQ: soru döner');
  const sk = G.workSkip(s, q1.qi);
  check(sk && sk.ok === null && okL(sk.line, 12) && s.wq.asked[W[q1.qi].id] === -1 && s.stat.wqN === 0, 'workSkip: tarafsız, yalnız "soruldu" kaydı');
  check(G.workQ(s, 'repair') === null, 'workQ: hız sınırı (aynı saat)');
  for (let i = 0; i < G.WQ_GAP - 1; i++) { s.pending.length = 0; G.tick(s); }
  check(G.workQ(s, 'scan') === null, 'workQ: hız sınırı (WQ_GAP − 1 saat)');
  s.pending.length = 0; G.tick(s);

  check(G.workQ(clone(s), 'scan') === null, 'v5f workQ: ilk taramadan önce tarama sorusu yok');
  { const u = clone(s); u.stat.scans = 2; const qq = G.workQ(u, 'scan'); check(!qq || !W[qq.qi].teach || (u.learn && u.learn[W[qq.qi].teach] != null), 'v5f workQ: öğretilmemiş tarama sorusu sorulmaz'); }
  const learnAll = g => { g.learn = g.learn || {}; for (const q of W) if (q.teach) g.learn[q.teach] = 0; };
  learnAll(s); s.stat.scans = 2; s.done.kesif = s.t;
  const q2 = G.workQ(s, 'scan');
  check(q2 && q2.act === 'scan', 'workQ: WQ_GAP saat sonra yeniden');
  check(G.workAnswer(s, q2.qi, 0, { act: 'scan' }) && G.workAnswer(s, q2.qi, 0, { act: 'scan' }) === null, 'workAnswer: tek yanıt');
  check(s.rs === rs, 'workQ/workAnswer/workSkip zar dizisini değiştirmez');
  check(G.workQ(s, 'zzz') === null, 'workQ: bilinmeyen eylem');

  for (const [world, level] of [['ay', 'kasif'], ['mars', 'kasif'], ['ay', 'muhendis'], ['mars', 'muhendis']]) for (const act of G.WORK_ACTS) {
    const t = G.newGame(world, level, 3, 'T', { train: true }); learnAll(t);
    const fit = wl().filter(i => (W[i].act === act || W[i].act === 'any') && (!W[i].w || W[i].w === world) && (level === 'muhendis' || W[i].lv === 1));
    const seen = [];
    for (let i = 0; i < fit.length * 2; i++) { const q = G.workQ(t, act); if (!q) break; seen.push(q.qi); G.workAnswer(t, q.qi, i % 2, { act }); }
    check(seen.length === fit.length * 2, `workQ eğitimde hız sınırı yok ${world}/${level}/${act}`);
    check(new Set(seen.slice(0, fit.length)).size === fit.length, `workQ: soru tükenmeden tekrar yok ${world}/${level}/${act}`);
    check(seen.every(i => fit.includes(i)), `workQ: dünya/seviye/eylem süzgeci ${world}/${level}/${act}`);
    if (level === 'kasif') check(seen.every(i => W[i].lv === 1), 'workQ: Kâşif yalnız lv 1');
  }

  const T = () => { const t = G.newGame('ay', 'muhendis', 9, 'E', { train: true }); t.res.malzeme = 500; t.res.parca = 50; t.res.bilim = 10; learnAll(t); return t; };
  const eff = (act, ok, prep) => { const t = T(); const ev = prep ? prep(t) : { act }; const q = G.workQ(t, act); const before = clone(t); const r = G.workAnswer(t, q.qi, ok ? 0 : 1, ev); return { t, before, r, ev }; };
  { const { t, before, r } = eff('repair', true); check(r.ok && t.res.parca === before.res.parca + 1 && okL(r.line, 12) && r.e && /Sağlam onarım/.test(r.line.tr), 'iş kartı: doğru onarım +1 parça'); }
  { const { t, r, ev } = eff('repair', false, t => { const sp = G.suggestSpot(t, 'gunes'); const b = G.build(t, 'gunes', sp.x, sp.y).b; b.left = 0; return { act: 'repair', bid: b.id, k: 'gunes' }; });
    const b = t.b.find(o => o.id === ev.bid); check(!r.ok && b.slow === t.t + 3 && /Zayıf yama/.test(r.line.tr) && okL(r.e, 12), 'iş kartı: yanlış onarım 3 saat yarım hız');
    const A = clone(t), B = clone(t); delete B.b.find(o => o.id === ev.bid).slow; A.pending.length = 0; B.pending.length = 0; G.tick(A); G.tick(B);
    check(A.pw.gen < B.pw.gen - 1e-9 || A.pw.sun < 0.01, 'iş kartı: yarım hız gerçekten elektriği azaltır'); }
  { const { t, before, r } = eff('scan', true); check(r.ok && t.res.bilim === before.res.bilim + 3, 'iş kartı: doğru tarama +3 bilim'); }
  { const { t, before, r } = eff('scan', false); check(!r.ok && t.res.bilim === before.res.bilim - 1, 'iş kartı: yanlış tarama −1 bilim'); }
  { const t = T(); t.res.bilim = 0; const q = G.workQ(t, 'scan'); G.workAnswer(t, q.qi, 1, { act: 'scan' }); check(t.res.bilim === 0, 'iş kartı: bilim 0\'ın altına inmez'); }
  { const { t, r, ev } = eff('build', true, t => { const sp = G.suggestSpot(t, 'lab') || G.suggestSpot(t, 'gunes'); const k = G.canBuild(t, 'lab').ok ? 'lab' : 'gunes'; const b = G.build(t, k, sp.x, sp.y).b; b.left = 9; return { act: 'build', bid: b.id, k }; });
    check(r.ok && t.b.find(o => o.id === ev.bid).left === 5, 'iş kartı: doğru inşa kalan süre yarıya'); }
  { const { t, r, ev } = eff('build', false, t => { const sp = G.suggestSpot(t, 'gunes'); const b = G.build(t, 'gunes', sp.x, sp.y).b; b.left = 3; return { act: 'build', bid: b.id, k: 'gunes' }; });
    check(!r.ok && t.b.find(o => o.id === ev.bid).left === 5, 'iş kartı: yanlış inşa +2 saat'); }
  { const { t, before, r } = eff('cargo', true); check(r.ok && t.res.parca === before.res.parca + 4, 'iş kartı: doğru kargo +4 parça'); }
  { const { t, before, r } = eff('cargo', false); check(!r.ok && t.res.malzeme === before.res.malzeme - 5, 'iş kartı: yanlış kargo −5 malzeme'); }
  { const t = T(); t.res.malzeme = 2; const q = G.workQ(t, 'cargo'); G.workAnswer(t, q.qi, 1, { act: 'cargo' }); check(t.res.malzeme === 0, 'iş kartı: malzeme 0\'ın altına inmez'); }
  check(T().stat.wqN === 0 && (() => { const t = T(); const q = G.workQ(t, 'scan'); G.workAnswer(t, q.qi, 0, { act: 'scan' }); const q3 = G.workQ(t, 'scan'); G.workAnswer(t, q3.qi, 1, { act: 'scan' }); return t.stat.wqN === 2 && t.stat.wqOk === 1; })(), 'iş kartı: wqN / wqOk sayılır');

  {
    const t = T(); const sp = G.suggestSpot(t, 'gunes'); const b = G.build(t, 'gunes', sp.x, sp.y).b;

    check(t.wq.ev.length === 0, 'kuyruk: inşa kaydı yok (v5)');
    b.left = 0; b.broken = true; G.repair(t, b);
    check(t.wq.ev.length === 0, 'kuyruk: onarım kaydı yok (v5)');
    const r = G.relicTiles(t)[0]; G.explore(t, r.x, r.y); G.scan(t, r.x, r.y);
    check(t.wq.ev.at(-1).act === 'scan' && t.wq.ev.at(-1).x === r.x && t.wq.ev.at(-1).kind === 's', 'kuyruk: tarama kaydı');
    G.trainShip(t); const cp = t.pending.find(p => p.type === 'cargo'); G.resolve(t, {}, cp.pid);
    check(t.wq.ev.at(-1).act === 'cargo', 'kuyruk: oyuncu kargoyu boşalttı');
    for (let i = 0; i < 4; i++) { const rt = G.relicTiles(t)[0]; t.scanned = {}; G.scan(t, rt.x, rt.y); }
    check(t.wq.ev.length === 4, 'kuyruk: en çok 4 kayıt');
    const qc = clone(t); qc.quiet = true; qc.wq.ev = []; qc.scanned = {}; { const rt = G.relicTiles(qc)[0]; G.scan(qc, rt.x, rt.y); }
    check(qc.wq.ev.length === 0, 'kuyruk: önizleme (quiet) kopyası yazmaz');
    const d = G.newGame('ay', 'muhendis', 77, 'D'); Object.assign(d.res, { o2: 999, su: 999, gida: 999 });
    while (!d.pending.some(p => p.type === 'cargo')) G.tick(d);
    while (d.pending.some(p => p.type === 'cargo')) { Object.assign(d.res, { o2: 999, su: 999, gida: 999 }); G.tick(d); }
    check(!d.wq.ev.some(e => e.act === 'cargo'), 'kuyruk: ATLAS\'ın kargo varsayılanı yazılmaz');
  }
}


for (const world of ['ay', 'mars']) {
  const s = G.newGame(world, 'kasif', 55, 'E', { train: true });
  check(s.train === true && s.v === 3, 'eğitim: s.train, sürüm 3');
  const cs = G.STAGE1.map(k => G.costOf(s, k).m).sort((a, b) => b - a);
  check(s.res.malzeme >= cs[0] + cs[1], 'eğitim: iki yapıya yetecek malzeme');
  const sp = G.suggestSpot(s, 'gunes'), b = G.build(s, 'gunes', sp.x, sp.y).b;
  check(b.left === Math.max(1, Math.ceil(G.BLD.gunes.h / 4)), 'eğitim: yapım süresi dörtte bir');
  check(G.undoBuild(s, b) && G.build(s, 'gunes', sp.x, sp.y).ok, 'eğitim: geri al çalışır');
  const radio0 = s.radioN;
  for (let i = 0; i < 24 * 5; i++) G.tick(s);
  check(!s.over, 'eğitim: tembel 5 günde kaybetmez ' + world);
  for (const r of ['o2', 'su', 'gida']) check(s.res[r] >= 1.9 * G.NEED[r] * s.pop && s.stat.sh[r] === 0, 'eğitim: kaynak tabanın üstünde ' + r);
  check(!s.pending.length && !s.stat.flares && !s.storm && s.stat.ships === 0 && !s.radio.some(m => m.n > radio0 && m.ev && m.ev !== 'egitim'), 'eğitim: rastgele olay, patlama, fırtına, gemi yok ' + world);
  for (let i = 0; i < 24 * 40; i++) G.tick(s);
  check(!s.over && s.mut.lvl === 0, 'eğitim: görev hiç bitmez, isyan yok ' + world);

  const id = G.trainBreak(s, 'gunes'), bb = s.b.find(o => o.id === id);
  check(id && bb.broken && bb.k === 'gunes', 'trainBreak: istenen türü bozar');
  check(G.trainBreak(s, 'lab') === null, 'trainBreak: yoksa null');
  check(G.trainShip(s) && s.pending.some(p => p.type === 'cargo' && p.due > s.t + 24) && !G.trainShip(s), 'trainShip: kargo çağrısı (bir kez)');
  check(G.trainAsk(s) && s.pending.some(p => p.id === 'egitim') && !G.trainAsk(s), 'trainAsk: egitim sorusu (bir kez)');
  const tq = G.workQ(s, 'repair'); check(tq && (G.workSkip(s, tq.qi), G.workQ(s, 'repair')), 'eğitim: iş kartında hız sınırı yok');
}

check(goalN > 10000, 'currentGoal: bot koşularında denetlendi ' + goalN);
for (const w of ['ay', 'mars']) { const s = G.newGame(w, 'kasif', 3, 'G'); check(okL(G.missionGoal(s), 10) && okL(G.missionGoal(Object.assign(s, { train: true })), 10), 'missionGoal ≤10 kelime ' + w); }
{
  const s = G.newGame('ay', 'kasif', 3, 'G'), g = G.currentGoal(s);
  check(g.act === 'build' && g.bk === 'gunes' && g.id === 'guc' && g.tx != null, 'currentGoal: ilk hedef panel');
  G.pushEvent(s, 'toz'); check(G.currentGoal(s).act === 'call', 'currentGoal: bekleyen ATLAS sorusu');
  G.pushCargo(s); check(G.currentGoal(s).act === 'ship', 'currentGoal: kargo sorudan önce');
  const sp = G.suggestSpot(s, 'gunes'); const b = G.build(s, 'gunes', sp.x, sp.y).b; b.left = 0; b.broken = true;
  const gr = G.currentGoal(s); check(gr.act === 'repair' && gr.tx === b.x && gr.ty === b.y && gr.urgent, 'currentGoal: bozuk yapı öncelikli');
  s.res.o2 = 0.5; s.rate.o2 = { p: 0, c: 4 }; b.broken = false; s.pending.length = 0;
  const gu = G.currentGoal(s); check(gu.urgent && gu.bk === 'oksijen' && gu.act === 'build', 'currentGoal: acil hava');
  const MS = G.MISSIONS.filter(m => m.k); check(MS.length === G.MISSIONS.length && MS.every(m => okL(m.k, 5) && okL(m.why, 10)), 'MISSIONS: k ≤5, why ≤10 kelime');
}


const A_ = G.ACHIEVEMENTS;
function cardBot(s, ctx, skill) {
  smartBot(s, ctx, skill);
  while (s.wq && s.wq.ev.length) {
    const ev = s.wq.ev.shift(), q = G.workQ(s, ev.act, ev.k || ev.kind);
    if (!q) continue;
    ctx.cards = (ctx.cards || 0) + 1;
    G.workAnswer(s, q.qi, ctx.cards % 3 === 0 ? 1 : 0, ev);
  }
}
function achRun(world, level, seed, bot, skill, opts) {
  const s = G.newGame(world, level, seed, 'A', opts), ctx = { r: seed };
  const start = { feats: ['surus', 'dron', 'hiz4'].filter(f => G.featOn(s, f)), next: G.achNext(s, opts && opts.ach), ach0: G.checkAch(s) };
  let g = 0;
  while (!s.over && g++ < 5000) { bot(s, ctx, skill); if (s.over) break; G.tick(s); }
  return { s, start };
}
{
  const days = o => Object.entries(o).map(([id, t]) => ({ id, d: Math.floor(t / 24) + 1, t })).sort((a, b) => a.t - b.t);
  const feats = a => (A_.find(x => x.id === a.id) || {}).gives || [];
  console.log(`\nbaşarım açılış günleri (${sampleAch ? 'örnek tablo' : 'D tablosu'}, Kâşif orta bot + iş kartı 2/3 doğru, boş profil):`);
  const first = {};
  for (const world of ['ay', 'mars']) {
    const { s } = achRun(world, 'kasif', 1007, cardBot, 0.5);
    first[world] = s;
    const L2 = days(s.ach);
    console.log(` ${world}: ` + L2.map(o => `${o.id} g${o.d}`).join(' · ') + ` | iş kartı ${s.stat.wqOk}/${s.stat.wqN} doğru`);
    const by20 = L2.filter(o => o.d <= 20).length, f12 = L2.filter(o => o.d <= 12 && feats(o).some(x => /^feat:/.test(x))).length;
    let gap = 0; for (let i = 1; i < Math.min(8, L2.length); i++) gap = Math.max(gap, (L2[i].t - L2[i - 1].t) / 24);
    const ok1 = L2.length && L2[0].d === 1, ok2 = by20 >= 8, ok3 = gap <= 4, ok4 = f12 >= 2;
    const lz = achRun(world, 'kasif', 1007, lazyBot, 0).s, nLazy = Object.keys(lz.ach).length;
    console.log(`   ilk ${L2[0] ? 'g' + L2[0].d : '-'} · 20. güne kadar ${by20} · ilk 8 arası en uzun boşluk ${gap.toFixed(1)} gün · 12. güne kadar ${f12} özellik · tembel ${nLazy}`);
    const chk = (c, m) => (sampleAch ? check(c, m) : (!c && console.log('   UYARI (D tablosu): ' + m)));
    chk(ok1, 'başarım tempo: ilk başarım 1. günde ' + world);
    chk(ok2, 'başarım tempo: 20. güne kadar en az 8 ' + world);
    chk(ok3, 'başarım tempo: ilk 8 arasında 4 günden uzun boşluk yok ' + world);
    chk(ok4, 'başarım tempo: 12. güne kadar en az 2 özellik açılışı ' + world);
    chk(nLazy <= 2, 'başarım tempo: tembel en çok 2 ' + world);
    for (const id in s.ach) { const a = A_.find(x => x.id === id); check(a && (!a.w || a.w === world) && (!a.lv || a.lv === 'kasif'), 'başarım: dünya/seviye süzgeci ' + id); }
  }

  const prof = {}; for (const id in first.ay.ach) prof[id] = 1;
  const pf = Object.keys(prof).flatMap(id => (A_.find(a => a.id === id).gives || []).filter(x => /^feat:/.test(x)).map(x => x.slice(5)));
  for (const [w, lv] of [['mars', 'kasif'], ['ay', 'muhendis']]) {
    const { s, start } = achRun(w, lv, 2025, cardBot, 0.5, { ach: prof });
    check(pf.every(f => start.feats.includes(f)), `ikinci görev: kazanılmış özellikler t=0'da açık ${w}/${lv} (${pf.join(',')})`);
    check(!start.ach0.length && !Object.keys(s.ach).some(id => prof[id]), `ikinci görev: profildekiler yeniden açılmaz ${w}/${lv}`);
    check(start.next.length > 0 && start.next.length <= 2 && start.next.every(o => !prof[o.id] && o.name && o.how && o.prog >= 0 && Array.isArray(o.gives)), `ikinci görev: achNext boş değil ${w}/${lv}`);
    const nNew = Object.keys(s.ach).length;
    console.log(` ikinci görev ${w}/${lv}: ${nNew} yeni başarım (${Object.keys(s.ach).join(', ')})`);
    (sampleAch ? check : (c, m) => !c && console.log('   UYARI (D tablosu): ' + m))(nNew >= 3, `ikinci görev: en az 3 yeni başarım ${w}/${lv}`);
  }

  {
    const s = G.newGame('ay', 'kasif', 8, 'F');
    check(!G.featOn(s, 'surus') && !G.featOn(s, 'dron') && !G.droneScout(s, 3, 3), 'featOn: boş profilde kapalı, dron çalışmaz');
    const dr = A_.find(a => (a.gives || []).includes('feat:dron'));
    if (dr) {
      s.achP[dr.id] = 1;
      check(G.featOn(s, 'dron'), 'featOn: profildeki başarım özelliği açar');
      const seen0 = s.map.seen.reduce((a, v) => a + v, 0), rs = s.rs;
      check(G.droneScout(s, 2, 2) && s.map.seen.reduce((a, v) => a + v, 0) > seen0 && s.rs === rs, 'droneScout: sis açılır, zar yok');
      check(!G.droneScout(s, 20, 12) && G.droneWait(s) === 12, 'droneScout: 12 saat bekleme');
      for (let i = 0; i < 12; i++) { s.pending.length = 0; G.tick(s); }
      check(G.droneScout(s, 20, 12), 'droneScout: bekleme sonrası yeniden');
      check(!G.droneScout(s, 99, 99), 'droneScout: harita dışı');
    }
    const s2 = G.newGame('ay', 'kasif', 8, 'F'); s2.done.o2 = 8; s2.stat.scans = 9; s2.bank['b:gunes'] = 8;
    const before = clone(s2), got = G.checkAch(s2);
    const a = clone(s2), bf = clone(before); delete a.ach; delete bf.ach;
    check(got.length > 0 && got.every(id => s2.ach[id] === s2.t) && JSON.stringify(a) === JSON.stringify(bf), 'checkAch: yalnız s.ach değişir');
    check(G.checkAch(s2).length === 0, 'checkAch: ikinci çağrı bir şey açmaz');
    check(G.ruleProg(s2, { t: 'ach', id: got[0] }) === 1 && G.ruleProg(s2, { t: 'stage', n: 2 }) === 0.5 && G.ruleProg(s2, { t: 'work', n: 4 }) === 0 && G.ruleProg(s2, { t: 'train' }) === 0, 'ruleProg: yeni kural türleri');
    G.noteTag(s2, 'x:egitim'); check(G.ruleProg(s2, { t: 'train' }) === 1, 'ruleProg: train etiketi');
    const mz = G.newGame('mars', 'muhendis', 8, 'F'); check(G.achNext(mz).every(o => { const x = A_.find(y => y.id === o.id); return (!x.w || x.w === 'mars') && (!x.lv || x.lv === 'muhendis'); }), 'achNext: bu dünyada/seviyede açılamayan yok');
  }
}


if (process.env.HIKAYE) for (const world of ['ay', 'mars']) {
  const { s } = run(world, 'muhendis', 1007, smartBot, 0.9);
  console.log(`\n══ ${world} telsiz ══`);
  for (const m of s.radio) console.log(`${String(G.dayOf({ t: m.t })).padStart(2)}.${String(m.t % 24).padStart(2, '0')} ${m.from.padEnd(5)} ${(m.beat || m.ev || (m.call ? 'çağrı' : m.def ? 'vars' : '')).padEnd(13)} ${m.title.tr} · ${m.text.tr.replace(/\n/g, ' / ')}`);
}
{ const { s } = run('ay', 'muhendis', 5, smartBot, 0.9); console.log('\n' + G.advice(s).map(a => a.m.tr).join(' | ')); }
{
  const ts = G.newGame('ay', 'kasif', 9, 'egt', { train: true });
  const t0 = ts.t, o0 = ts.res.o2, e0 = ts.stored;
  for (let i = 0; i < 200; i++) G.tick(ts);
  check(ts.t === t0 && G.dayOf(ts) === 1 && ts.res.o2 >= o0 - 1e-9 && ts.stored >= e0 - 1e-9, 'D1 eğitimde saat ve halkalar donar');
  ts.trainOnly = 'oksijen';
  if (typeof G.suggestSpot === 'function' && typeof G.build === 'function') { const sp = G.suggestSpot(ts, 'gunes'), n0 = ts.b.length, r = sp ? G.build(ts, 'gunes', sp.x, sp.y) : { ok: false };
    check(r && r.ok === false && ts.b.length === n0, 'D1 eğitim adımı yalnız istenen yapıyı kurdurur'); }
  ts.trainOnly = null;
  const qt = []; for (let i = 0; i < 3; i++) { const q = G.workQ(ts, 'build'); if (q) { qt.push(q.qi); G.workSkip(ts, q.qi); } }
  const ms = G.newGame('ay', 'kasif', 10, 'gorev');
  const qm = []; for (let i = 0; i < 6; i++) { ms.t += 24; const q = G.workQ(ms, 'build'); if (q) { qm.push(q.qi); G.workSkip(ms, q.qi); } }
  const bankN = (G.workList ? G.workList() : []).filter(q => q && (q.act === 'build' || q.act === 'any') && (q.lv || 1) === 1 && (!q.w || q.w === 'ay')).length;
  check(qm.every(i => !qt.includes(i)) || bankN <= qt.length, 'D1 eğitim soruları görevde sorulmaz');
  check(new Set(qm.slice(0, Math.max(0, bankN - qt.length))).size === Math.min(qm.length, Math.max(0, bankN - qt.length)), 'D1 görevde soru banka bitmeden tekrar etmez');
  ms.tags['x:egitim'] = ms.t;
  check(G.currentGoal(ms).id === 'guc', 'v5f: eğitimden sonra da gerçek görevin ilk hedefi iki güneş paneli (bilerek değişti)');
  for (const id of ['guc', 'o2', 'su', 'sera', 'pil', 'maden', 'kalkan']) ms.done[id] = ms.t;
  const g = G.currentGoal(ms);
  check(g && g.id === 'sur', 'v5f: "Gezgini sür" ilk tarama hedefinden hemen önce');
  check(g && g.how && /Gezgin/.test(g.how.tr), 'v5f: sur hedefinin how satırı');
  { const m2 = clone(ms); m2.t += 25; check(G.currentGoal(m2).id === 'kesif', 'v5f: sürmezse 24 saat sonra tarama hedefi'); }
  ms.tags['x:surus'] = ms.t; check(G.currentGoal(ms).id !== 'sur', 'D1 sürünce hedef ilerler');

  {
    const wc8 = o => !!o && ['tr', 'en'].every(l => String(o[l]).trim().split(/\s+/).length <= 8);
    const s = G.newGame('ay', 'kasif', 4, 'H'); s.res.malzeme = 2000; s.stage = 2;
    const seenIds = new Set(); let allHow = true;
    for (const m of G.MISSIONS) {
      const g = G.currentGoal(s); if (!g) break;
      seenIds.add(g.id); if (!wc8(g.how)) allHow = false;
      s.done[m.id] = s.t; s.t++;
    }
    check(allHow, 'v5f how: bütün Ay hedeflerinde dolu ve ≤8 kelime');
    const t = G.newGame('ay', 'kasif', 4, 'H'); t.stage = 2;
    const how = id => { const u = clone(t); for (const m of G.MISSIONS) { if (m.id === id) break; u.done[m.id] = 1; } return G.currentGoal(u); };
    check(how('kalkan').how.tr === "İniş Modülü'ne dokun → Toprakla ört", 'v5f how: toprakla ört ' + how('kalkan').how.tr);
    check(how('maden').how.tr === 'Kur → Keşif ve Üretim', 'v5f how: toprak kazıcı ' + how('maden').how.tr);
    const e = how('ekip'); check(e.how.tr === 'Yatak kur, kargo gemisini bekle', 'v5f how: ekip ' + e.how.tr);
    const u = clone(t); u.done = {}; for (const m of G.MISSIONS) { if (m.id === 'bilim') break; u.done[m.id] = 1; } u.res.bilim = 999;
    const gb = G.currentGoal(u); check(gb.id === 'bilim' && gb.how.tr === 'Tablet → Araştır', 'v5f how: iki buluş ' + gb.how.tr);
    const v = clone(t); v.res.o2 = 0; v.short.o2 = 0; v.pw.shed = 1; v.t = 250;
    const gs = G.currentGoal(v); check(gs && (gs.id !== 'acil:guc' || gs.how.tr === 'Bir yapıya dokun → Durdur'), 'v5f how: makine durdur ' + (gs && gs.id));
  }
}

{
  G = G_ON;
  const putG = (s, k, at) => {
    if (!G.canBuild(s, k).ok) return false;
    let sp = at && at.x != null ? at : G.suggestSpot(s, k);
    if (sp && !G.canBuild(s, k, sp.x, sp.y).ok) sp = G.suggestSpot(s, k);
    return !!sp && G.build(s, k, sp.x, sp.y).ok;
  };
  const goalStepBot = s => {
    for (const p of s.pending.slice()) {
      if (p.type === 'cargo') { const r = G.resolve(s, G.cargoSuggest(s, p.mass), p.pid); if (!r || !r.ok) G.resolve(s, {}, p.pid); }
      else if (G.resolve(s, 0, p.pid) === null) G.resolve(s, 1, p.pid);
    }
    if (s.t % 2) return;
    const g = G.currentGoal(s); if (!g) return;
    if (g.act === 'build' && g.bk) putG(s, g.bk, g.tx != null ? { x: g.tx, y: g.ty } : null);
    else if (g.act === 'repair') { const b = s.b.find(o => o.broken && o.x === g.tx && o.y === g.ty) || s.b.find(o => o.broken); if (b) G.repair(s, b); }
    else if (g.act === 'scan' && g.tx != null) { G.explore(s, g.tx, g.ty); G.scan(s, g.tx, g.ty); }
    else if (g.act === 'walk' && g.id === 'kalkan') { const b = s.b.find(o => G.canShield(s, o)); if (b && s.res.malzeme >= G.shieldCost(s)) G.shieldUp(s, b); }
    else if (g.act === 'walk') { const b = s.b.find(o => o.x === g.tx && o.y === g.ty && !o.on); if (b) G.toggle(s, b); }
    else if (g.act === 'wait') { for (const id of G.TECH_ORDER) if (G.techState(s, id) === 'ok') { G.research(s, id); break; } }
  };
  const rows = [];
  for (const [w, lv] of [['ay', 'kasif'], ['mars', 'kasif'], ['ay', 'muhendis']]) {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      if (lv === 'muhendis' && seed > 2) continue;
      const s = G.newGame(w, lv, seed, 'A');
      let n7 = 0, nAll = 0, inNight = 0, g = 0;
      const was = new Set();
      while (!s.over && g++ < 2000) {
        goalStepBot(s); if (s.over) break;
        G.tick(s);
        for (const b of s.b) { if (b.broken && !was.has(b.id)) { nAll++; if (s.t < 7 * 24) n7++; if (w === 'ay' && G.hoursToNight(s) === 0 && s.radio.some(r => r.t === s.t && r.ev === 'ariza')) inNight++; was.add(b.id); } if (!b.broken) was.delete(b.id); }
      }
      rows.push(`${w}/${lv}/${seed}: 7. gün ${n7}, toplam ${nAll}, garantili ${s.stat.arzG || 0}, kazandı ${s.over && s.over.win ? "evet" : "hayır"}`);
      if (lv === 'kasif' && w === 'ay') {
        check(n7 >= 1, `v5f arıza: Kâşif Ay 7. gün sonuna kadar ≥1 arıza (tohum ${seed}, ${n7})`);
        check(nAll >= 4, `v5f arıza: Kâşif Ay 30 günde ≥4 arıza (tohum ${seed}, ${nAll})`);
        check(!!(s.over && s.over.win), `v5f arıza: hedef izleyen bot yine kazanır (tohum ${seed})`);
      }
      if (lv === 'kasif' && w === 'mars') check(n7 >= 1, `v5f arıza: Kâşif Mars 7. sol sonuna kadar ≥1 arıza (tohum ${seed})`);
      if (lv === 'muhendis') check(!(s.stat.arzG > 0), `v5f arıza: Mühendis'te garantili arıza yok (tohum ${seed})`);
    }
  }
  if (process.env.AYRINTI) rows.forEach(r => console.log(r));

  { const e = G.newGame('ay', 'kasif', 3, 'T', { train: true }); for (let i = 0; i < 200; i++) G.tick(e); check(!(e.stat.arzG > 0), 'v5f arıza: eğitimde garantili arıza yok'); }
  {
    const s = G.newGame('ay', 'kasif', 5, 'N'); s.res.malzeme = 999; s.stage = 2;
    for (const k of ['gunes', 'gunes', 'maden', 'oksijen', 'su']) putG(s, k);
    const nightG = [];
    while (s.t < 420) { s.pending.length = 0; s.res.o2 = s.res.su = s.res.gida = 999; const a = s.stat.arzG || 0; G.tick(s); if ((s.stat.arzG || 0) > a && G.hoursToNight(s) === 0) nightG.push(s.t); for (const b of s.b) if (b.broken) G.repair(s, b); }
    check(nightG.length === 0, `v5f arıza: uzun gecede (240–336) garantili arıza üretilmez (${nightG.join(',')})`);
    check((s.stat.arzG || 0) >= 2, `v5f arıza: onarıldıkça 6 günde bir yenisi (${s.stat.arzG})`);
  }
}
if (errs.size) { console.log('\nHATALAR:'); for (const [m, n] of errs) console.log(` ✗ ${m} (${n})`); }
console.log(fail ? `\n${fail} kontrol başarısız` : '\nTüm kontroller geçti');
process.exit(fail ? 1 : 0);
