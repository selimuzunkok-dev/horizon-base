'use strict';


const STR = {
  tagline: ['3B Ay ve Mars üssü', 'Horizon Base · a 3D Moon and Mars outpost'],
  lead: ['Uzay giysini giy, yüzeye in, üssünü kendin kur. Hava, su ve yemek yap, ekibini mutlu tut, eski bir görevin izini sür.', 'Suit up, step onto the surface and build your own base. Make air, water and food, keep your crew happy and follow the trail of an earlier mission.'],
  chooseWorld: ['Nereye iniyoruz?', 'Where do we land?'],
  lvKasif: ['Kolay · Kâşif', 'Easy · Explorer'], lvKasifD: ['İlk kez oynayanlar için · bol malzeme, yumuşak olaylar', 'For first-time players · plenty of material, gentle events'],
  lvMuh: ['Zor · Mühendis', 'Hard · Engineer'], lvMuhD: ['Oynamış olanlar için · dar stok, sert olaylar', 'For experienced players · tight stock, harsh events'],
  cmdName: ['Komutan adı', 'Commander name'], cmdPh: ['Adını yaz', 'Type your name'],
  start: ['Görevi başlat', 'Start mission'], cont: ['Devam et · {0}, {1} {2}', 'Continue · {0}, {1} {2}'],
  about: ['Proje hakkında', 'About the project'], abSub: ['NASA Space Apps Challenge 2026 · takım Alt + Space', 'NASA Space Apps Challenge 2026 · team Alt + Space'],
  ab1H: ['Sorun ve kimin için', 'Problem and audience'], ab1: ['Ay\'da ya da Mars\'ta bir üste yaşamak için elektrik, su, oksijen, yemek ve radyasyondan korunma arasında sürekli seçim yapmak gerekir: bir işe harcanan elektrik başka bir işe kalmaz. Ufuk Üssü bu dengeyi öğrencilere okutarak değil, bir üssü kendilerine yönettirerek öğretir. Ay görevi kolaydır (Kâşif seviyesi, ortaokul için), Mars görevi zordur (Mühendis seviyesi, lise için); oyun Türkçe ve İngilizce oynanır.', 'Living in a base on the Moon or Mars means always choosing between power, water, oxygen, food and staying safe from radiation: power spent on one job is not there for another. Horizon Base teaches this balance by letting students run a base themselves instead of only reading about it. The Moon mission is the easy one (Explorer level, for middle school) and the Mars mission is the hard one (Engineer level, for high school); it can be played in Turkish or English.'],
  ab2H: ['NASA verisi oyunu nasıl sürüyor', 'How NASA data drives the game'], abC1: ['Oyunda ne olur', 'What happens in the game'], abC2: ['Gerçek rakam', 'Real figure'], abC3: ['Kaynak', 'Source'],
  ab2N: ['Bazı değerler oynanabilirlik için sadeleştirildi ya da büyütüldü (örneğin Hava Makinesi ve İniş Modülü\'nün nükleer pili gerçeklerinden çok daha güçlüdür); Veri kaynakları penceresi gerçek rakamları kaynaklarıyla listeler ve neyin sadeleştirildiğini açıklar.', 'Some values are simplified or scaled up for gameplay (for example the Air Maker and the Landing Module\'s nuclear battery are far stronger than the real ones); the Data sources window lists the real figures with their sources and explains what was simplified.'],
  ab3H: ['Sınıfta kullanım', 'Classroom use'], ab3: ['Bir ders (yaklaşık 40 dakika) şöyle geçebilir. İlk 5 dakikada öğretmen sorunu anlatır: bir üste insanlar neye ihtiyaç duyar? Sonraki 25 dakikada öğrenciler tek başına ya da ikişer kişi oynar; oyunun başındaki eğitim bölümü kontrolleri adım adım öğretir. Son 10 dakikada sınıf Görev Karnesi üzerine konuşur.', 'One lesson (about 40 minutes) can go like this. In the first 5 minutes the teacher sets the problem: what do people need to live in a base? For the next 25 minutes students play alone or in pairs; the training part at the start teaches the controls step by step. In the last 10 minutes the class talks about the Mission Report.'],
  ab3b: ['Görev bitince çıkan Görev Karnesi beş alana harf notu verir: Elektrik, Hava ve Su, Yemek, Radyasyon ve Ekip. Her notun yanında kısa bir neden yazar. Öğretmen bunları tartışmada kullanabilir: hangi seçim hangi sonuca yol açtı? Görev bir derste bitmezse oyun kendini kaydeder ve aynı cihazda sonraki derste kalınan yerden sürer. Öğrenci seviyeyi gezegeni seçerek seçer: Ay görevi kolaydır (Kâşif, ortaokul), Mars görevi zordur (Mühendis, lise).','When a mission ends, the Mission Report gives a letter grade in five areas: Power, Air & Water, Food, Radiation and Crew. Each grade comes with a short reason. A teacher can use these in a class discussion: which choice led to which result? If a mission does not end in one lesson, the game saves itself and continues on the same device in the next lesson. Students pick the level by picking the world: the Moon mission is easy (Explorer, middle school) and the Mars mission is hard (Engineer, high school).'],
  ab4H: ['Maliyet ve erişim', 'Cost and access'], ab4: ['Oyun tek bir HTML dosyasıdır (2 MB\'tan küçük) ve ücretsizdir. Sunucu, hesap ya da kurulum gerekmez: dosya bir web tarayıcısında açılır. İnternet olmadan da çalışır; internetten gelen tek şey yazı tipleridir, bağlantı yoksa cihazın kendi yazı tipi kullanılır. Telefonda ya da yavaş bir bilgisayarda oyun kendiliğinden hafif görünüme geçer; duraklatma menüsünden grafik kalitesi de düşürülebilir.', 'The game is a single HTML file (under 2 MB) and it is free. It needs no server, no account and no installation: the file opens in a web browser. It also works without the internet; the only thing it loads from the internet is its fonts, and without a connection it uses the device\'s own font. On a phone or a slow computer the game switches to a lighter look by itself, and the graphics quality can also be lowered from the pause menu.'],
  abNasa: ['Bu proje NASA tarafından onaylanmış ya da desteklenmiş değildir; NASA\'nın açık verileri yalnız kaynak olarak kullanılmıştır.', 'This project is not endorsed or sponsored by NASA; NASA\'s open data is used only as a source.'],
  gs_sub: ["Ay'da ya da Mars'ta kendi üssünü kur", 'Build your own base on the Moon or Mars'],
  gs_pill_ay: ['Kolay · ilk kez oynayanlar', 'Easy · first-time players'], gs_pill_mars: ['Zor · deneyimliler', 'Hard · experienced players'],
  gs_line_ay: ['Dünya yakın, yardım sık gelir. Üs kurmayı burada öğren.', 'Earth is close and help comes often. Learn to build here.'],
  gs_line_mars: ['Dünya çok uzak, toz fırtınası güneşi keser. Kendin üret.', 'Earth is far and dust storms hide the Sun. Make your own.'],
  gs_go_ay: ["Ay'a in", 'Land on the Moon'], gs_go_mars: ["Mars'a in", 'Land on Mars'],
  gs_dist: ['Uzaklık', 'Distance'], gs_grav: ['Yerçekimi', 'Gravity'], gs_len: ['Görev', 'Mission'],
  gs_len_ay: ['{0} gün', '{0} days'], gs_len_mars: ['{0} sol', '{0} sols'],
  how: ['Nasıl oynanır', 'How to play'], sources: ['Veri kaynakları', 'Data sources'], best: ['En iyi puanın: {0}', 'Your best score: {0}'],
  days: ['gün', 'days'], dayW: ['gün', 'days'], hoursShort: ['saat', 'h'], perDay: ['/gün', '/day'],
  ship: ['Kargo gemisi', 'Cargo ship'], shipWait: ['İndi, seni bekliyor', 'Landed, waiting'], pause: ['Durdur (P)', 'Pause (P)'], speed: ['Hız {0} ({1})', 'Speed {0} ({1})'], menu: ['Duraklat', 'Pause'],
  c_guc: ['Elektrik', 'Power'], c_o2: ['Oksijen', 'Oxygen'], c_su: ['Su', 'Water'], c_gida: ['Yemek', 'Food'], c_malzeme: ['Malzeme', 'Material'], c_parca: ['Yedek parça', 'Spare parts'],
  c_bilim: ['Bilim', 'Science'], c_ekip: ['Ekip', 'Crew'], c_moral: ['Moral', 'Morale'], c_doz: ['Radyasyon', 'Radiation'], c_self: ['Üssün kendi ürettiği', 'Made by the base'], c_suit: ['Giysi havası', 'Suit air'],
  idle: ['{0} boşta', '{0} idle'], enough: ['{0} gün yeter', 'lasts {0} days'], stable: ['dengede', 'stable'], shedN: ['{0} yapı elektriksiz', '{0} without power'],
  t_gorev: ['Görev', 'Mission'], t_ekip: ['Ekip', 'Crew'], t_ara: ['Araştır', 'Research'], t_banka: ['Ansiklopedi', 'Encyclopedia'], t_telsiz: ['Telsiz', 'Radio'],
  pdaPaused: ['Zaman durdu', 'Time paused'], tablet: ['Tablet', 'Tablet'],
  goal: ['Ana görev', 'Main goal'], goalTxt: ['{0} {1} dayan', 'Last {0} {1}'], goalSub: ['Kimseyi kaybetme, radyasyonu güvenli sınırın altında tut.', 'Lose nobody and keep radiation under the safe limit.'],
  dayOfN: ['{0}. {1} / {2}', '{1} {0} of {2}'], nowDo: ['Şimdi yap', 'Do next'], allGoals: ['Tüm hedefler · {0} / {1}', 'All goals · {0} / {1}'], allDone: ['Bütün hedefleri bitirdin!', 'You finished every goal!'],
  star1: ['Görev süresini tamamla', 'Complete the mission time'], star2: ['Kimse Dünya\'ya geri gönderilmesin. Üs yemeğinin çoğunu kendi yapsın.', 'Nobody is sent back to Earth. The base makes most of its own food.'], star3: ['En az 8 kişi olun. Üs neredeyse her şeyini kendi yapsın. Hiçbir işte kötü not alma.', 'Have 8 or more people. The base makes almost everything itself. No bad marks.'],
  chapters: ['Bölümler', 'Chapters'], chapterN: ['Bölüm {0}', 'Chapter {0}'], chapLock: ['Henüz değil', 'Not yet'], chapGoal: ['Bu bölümde: {0}', 'In this chapter: {0}'], missions: ['Hedefler', 'Goals'],
  sciPts: ['Bilim puanı', 'Science points'], tier: ['{0}. seviye', 'Level {0}'], tierReq: ['Önceki seviyeden 2 buluş gerekir', 'Needs 2 inventions from the level before'],
  crewN: ['Ekip', 'Crew'], bedsN: ['Yatak', 'Beds'], shieldedBeds: ['Korunaklı yatak', 'Protected beds'], workers: ['Çalışanlar', 'Workers'], busy: ['Görevde, dışarıda', 'Away on a task'],
  moralEff: ['Üretime etkisi', 'Effect on production'], doseNow: ['Günlük radyasyon', 'Radiation per day'], doseTot: ['Toplam radyasyon', 'Total radiation'],
  inReal: ['Gerçekte', 'In real life'], cost: ['Fiyatı', 'Cost'],
  needTech: ['Araştırma gerek: {0}', 'Needs research: {0}'], needCore: ['Jeneratör yakıtı gerek (Dünya\'dan, kargo gemisiyle, 1500 kg)', 'Needs generator fuel (from Earth by cargo ship, 1500 kg)'],
  st_ok: ['Çalışıyor', 'Running'], st_insa: ['Kuruluyor · {0} saat', 'Under construction · {0} h'], st_kapali: ['Kapalı', 'Switched off'], st_ariza: ['Bozuk', 'Broken'],
  st_guc: ['Elektrik yok', 'No power'], st_isci: ['Çalışan yok', 'No worker'], st_girdi: ['Malzeme yok', 'No material'], st_girdiSu: ['Su yok', 'No water'], st_siginak: ['Ekip sığınakta', 'Crew in shelter'], st_gece: ['Güneş yok', 'No sunlight'],
  st_buyume: ['Bitkiler büyüyor · hasada {0} saat', 'Plants growing · {0} h to harvest'], st_dust: ['Tozlu: %25 az üretiyor', 'Dusty: making 25% less'],
  turnOff: ['Durdur', 'Stop'], turnOn: ['Çalıştır', 'Start'], repair: ['Onar · {0} parça', 'Repair · {0} parts'], shield: ['Toprakla ört · {0} malzeme', 'Cover with soil · {0} material'],
  shielding: ['Kalkan yapılıyor · {0} saat', 'Shielding · {0} h'], shielded: ['Korunaklı: radyasyondan korur', 'Protected: keeps radiation out'], demolish: ['Sök', 'Dismantle'], demolish2: ['Emin misin? Yarısı geri gelir', 'Sure? Half comes back'],
  nowKw: ['Şu an {0} kW (güç birimi)', '{0} kW right now (unit of power)'], nowEl: ['Şu an {0} elektrik', '{0} power right now'], stored: ['{0} / {1} kWh (enerji birimi)', '{0} / {1} kWh (unit of energy)'],
  offPrev: ['Durdurursan, 1 gün boyunca: {0}', 'If you stop it, over 1 day: {0}'], onPrev: ['Çalıştırırsan, 1 gün boyunca: {0}', 'If you start it, over 1 day: {0}'],
  tl_i: ['Buz alanı', 'Ice field'], tl_m: ['Maden taşları', 'Ore rocks'], tl_t: ['Yeraltı mağarası', 'Lava cave'], tl_s: ['İz', 'A trace'], tl_r: ['Kayalık', 'Rocks'], tl_c: ['Krater', 'Crater'], tl_fog: ['Keşfedilmemiş', 'Unexplored'],
  w_fog: ['Burası henüz keşfedilmedi. Önce oraya yürü.', 'Not explored yet. Walk there first.'], w_dolu: ['Burada zaten bir yapı var.', 'There is already a building here.'], w_zemin: ['Kaya ya da krater: buraya kurulamaz.', 'Rock or crater: you cannot build here.'],
  w_buzgerek: ['Buz Çıkarıcı yalnızca mavi buz alanına kurulur. Mavi karelere bak.', 'The Ice Extractor only goes on a blue ice field. Look for the blue tiles.'],
  w_buz: ['Buz alanına yalnızca Buz Çıkarıcı kurulur.', 'Only an Ice Extractor goes on an ice field.'], w_cost: ['Malzeme yetmiyor.', 'Not enough material.'], w_x: ['Bu yapı kurulamaz.', 'This cannot be built.'], w_stage: ['Bu yapı henüz açılmadı.', 'This building is not unlocked yet.'],
  missM: ['{0} malzeme eksik', '{0} material short'], missP: ['{0} parça eksik', '{0} parts short'],
  w_toz: ['Toz: yandaki yapı bu paneli %25 yavaşlatır', 'Dust: the neighbour slows this panel by 25%'], w_toz2: ['Toz: yandaki paneller %25 yavaşlar', 'Dust: panels next to it slow down by 25%'],
  w_rad: ['Dikkat: nükleer jeneratör evlere çok yakın, radyasyon artar', 'Careful: nuclear generator too close to homes, more radiation'], w_tup: ['Yeraltı mağarası: ev kendiliğinden korunaklı', 'Lava cave: the home is protected for free'],
  w_mineral: ['Maden taşları: %50 fazla malzeme', 'Ore rocks: 50% more material'], w_yesil: ['Evin yanında: moral +3', 'Next to a home: morale +3'], w_ok: ['Buraya kurulabilir', 'You can build here'],
  aimMap: ['Fareyi bir karenin üstüne getir', 'Move the mouse over a tile'], aimTap: ['Bir kareye dokun', 'Tap a tile'], cancel: ['Vazgeç', 'Cancel'],
  planHead: ['Zaman durdu', 'Time paused'], planDone: ['Bitti', 'Done'], planPick: ['Aşağıdan bir yapı seç', 'Pick a building below'],
  planClick: ['Yeşil kareye tıkla: kurulur', 'Click a green tile to build'], planTap: ['Kareye dokun, sonra "Buraya kur"', 'Tap a tile, then "Build here"'],
  buildHere: ['Buraya kur', 'Build here'], buildBest: ['Önerilen yere kur', 'Build at the suggested spot'], okHere: ['Buraya kurulabilir · {0}', 'You can build here · {0}'],
  undo: ['Geri al', 'Undo'], undone: ['{0} geri alındı, malzemen geri geldi.', '{0} undone, your material is back.'], placed: ['{0} kuruluyor: {1} sonra hazır.', '{0} is being built: ready in {1}.'],
  starTip: ['En iyi yer', 'Best spot'], lockAt: ['{0} açılır', 'Opens {0}'], lockTech: ['Araştırma: {0}', 'Research: {0}'], allG: ['Hepsi', 'All'],
  g_hava: ['Hava', 'Air'], g_su: ['Su', 'Water'], g_yemek: ['Yemek', 'Food'], g_guc: ['Elektrik', 'Power'], g_ev: ['Ev', 'Home'], g_diger: ['Keşif ve Üretim', 'Make & Discover'],
  cw_m: ['{0} malzeme', '{0} material'], cw_p: ['{0} parça', '{0} parts'], cw_h: ['{0} saatte biter', 'done in {0} h'], cw_w: ['{0} kişi çalışır', '{0} worker'], cw_kw: ['−{0} elektrik', '−{0} power'],
  cw_gen: ['+{0} elektrik', '+{0} power'], cw_sun: ['+{0} elektrik (gündüz)', '+{0} power (daytime)'], cw_core: ['1 jeneratör yakıtı', '1 generator fuel'],
  doesL: ['Ne verir', 'Gives'], needsL: ['Ne ister', 'Needs'],
  nd_ice: ['Mavi buz alanı', 'Blue ice field'], nd_w: ['{0} kişi', '{0} worker'], nd_kw: ['elektrik', 'power'], nd_sun: ['Güneş ışığı, gece çalışmaz', 'Sunlight, does not work at night'], nd_su: ['su', 'water'], nd_m: ['malzeme', 'material'], nd_core: ['jeneratör yakıtı', 'generator fuel'], nd_none: ['Hiçbir şey', 'Nothing'],
  kTap: ['Dokun', 'Tap'], k_jump: ['Zıpla', 'Jump'], kClick: ['Tık', 'Click'], k_scan: ['İncele', 'Scan'], k_use: ['Kullan', 'Use'], k_collect: ['Topla', 'Collect'], k_repair: ['Onar', 'Repair'], k_build: ['Kur', 'Build'],
  k_view: ['Kuşbakışı', 'Bird\'s-eye'], k_viewWalk: ['Astronot', 'Astronaut'], k_pda: ['Tablet', 'Tablet'], k_radio: ['Telsiz', 'Radio'],
  p_scan: ['İncele: {0}', 'Scan: {0}'], p_scanned: ['{0} · incelendi', '{0} · scanned'], p_collect: ['Topla {0}', 'Collect {0}'], p_far: ['{0} · çok uzakta, yaklaş', '{0} · too far, walk closer'],
  p_repair: ['Onar ({0} parça)', 'Repair ({0} parts)'], p_ship: ['Kargo gemisi: kargoyu seç', 'Cargo ship: choose the cargo'], p_open: ['{0} · {1}', '{0} · {1}'],
  keysWalk: ['WASD yürü · Shift koş · Boşluk zıpla', 'WASD walk · Shift run · Space jump'], keysDrone: ['WASD kaydır · Q/E döndür · teker yakınlaş', 'WASD pan · Q/E rotate · wheel zoom'],
  scanned: ['+{0} bilim · {1}', '+{0} science · {1}'], scanNo: ['Burada incelenecek bir şey yok', 'Nothing to scan here'], scanNew: ['Ansiklopedide yeni sayfa', 'New encyclopedia page'], relicLog: ['Eski kayıt bulundu', 'Old log recovered'], openBank: ['Ansiklopedide aç', 'Open in the encyclopedia'],
  got: ['+{0} {1} · {2} kez daha toplanabilir', '+{0} {1} · {2} more pickups here'], gotLast: ['+{0} {1} · burası tükendi', '+{0} {1} · this spot is used up'], noCollect: ['Burada toplanacak bir şey kalmadı', 'Nothing left to collect here'],
  found: ['Yeni keşif: {0}', 'Discovered: {0}'], repaired: ['{0} onarıldı', '{0} repaired'], noParts: ['Onarım için parça yetmiyor', 'Not enough parts to repair'], goNear: ['Onarmak için yanına yürü', 'Walk up to it to repair'],
  fr_mc: ['Görev Kontrol (Dünya)', 'Mission Control (Earth)'], fr_atlas: ['ATLAS', 'ATLAS'], fr_crew: ['Ekip', 'Crew'], fr_kayit: ['Eski kayıt', 'Old log'], atlasRole: ['robot yardımcı', 'helper robot'],
  callIn: ['{0} arıyor', '{0} is calling'], callAns: ['Cevapla', 'Answer'], callLine: ['{0} seni arıyor: {1}{2} Hazır olunca T\'ye bas.', '{0} is calling you: {1}{2} Press T when you are ready.'],
  callLineT: ['{0} seni arıyor: {1}{2} Hazır olunca üstteki çağrıya dokun.', '{0} is calling you: {1}{2} Tap the call at the top when you are ready.'],
  shipChip: ['Kargo gemisi indi · kargo seç', 'Cargo ship down · pick cargo'], shipLine: ['Kargo gemisi iniyor. Yanına yürüyüp E\'ye bas ya da üstteki düğmeye tıkla.', 'The cargo ship is landing. Walk to it and press E, or click the button at the top.'],
  defaultIs: ['Yanıt vermezsen {0} sonra ATLAS şunu seçecek: {1}', 'If you do not answer, in {0} ATLAS will choose: {1}'], pendingN: ['Bekleyen çağrılar', 'Pending calls'], history: ['Mesajlar', 'Messages'], noCalls: ['Bekleyen çağrı yok.', 'No pending calls.'],
  f_all: ['Hepsi', 'All'], f_radio: ['Telsiz', 'Radio'], f_log: ['Olaylar', 'Events'], newN: ['{0} yeni', '{0} new'], noMsgs: ['Henüz mesaj yok.', 'No messages yet.'],
  subNext: ['Sonraki', 'Next'], subHint: ['İpucu', 'Tip'], radioSlow: ['Telsizde mesaj var, hız 1×', 'Radio messages waiting, speed 1×'],
  quizT: ['Kendini dene', 'Test yourself'], quizD: ['İsteğe bağlı. Doğru yanıt: +6 bilim. Tek hak.', 'Optional. Correct answer: +6 science. One try.'], quizGo: ['Dene · +6', 'Try · +6'], quizNone: ['Kur, tara ve keşfet: yeni sorular açılır.', 'Build, scan and explore: new questions unlock.'],
  quizOk: ['Doğru yanıtladın', 'Answered correctly'], quizNo: ['Yanlış yanıtladın', 'Answered wrong'], quizNew: ['Yeni soru: Ansiklopedi', 'New question: Encyclopedia'],
  right: ['Doğru! +6 bilim', 'Correct! +6 science'], wrong: ['Yanlış. Doğrusu: {0}', 'Not quite. The answer: {0}'], go: ['Devam', 'Continue'], didYouKnow: ['Biliyor muydun?', 'Did you know?'], later: ['Sonra', 'Later'],
  bankN: ['Sayfalar: {0} / {1}', 'Pages: {0} / {1}'], bankLock: ['Kur, araştır, tara ya da yaşa: sayfa açılır.', 'Build, research, scan or live through it to unlock.'], isNew: ['Yeni', 'New'],
  cat_bina: ['Yapılar', 'Buildings'], cat_tek: ['Teknolojiler', 'Technologies'], cat_olay: ['Olaylar', 'Events'], cat_kesif: ['Taramalar', 'Scans'], cat_kayit: ['Kayıp görevin izleri', 'Traces of the lost mission'],
  cargoT: ['Kargo Gemisi', 'Cargo Ship'], cargoD: ['Ne indirilsin? Gemi az yük taşır: her kilogram bir seçim.', 'What do we unload? The ship carries little: every kilogram is a choice.'],
  cargoMass: ['Ağırlık', 'Weight'], cargoAuto: ['Öner', 'Suggest'], cargoGo: ['İndir', 'Unload'], cargoBeds: ['Boş yatak: {0}', 'Free beds: {0}'], cargoClear: ['Sıfırla', 'Clear'], cargoStock: ['Şu an ne kadar yeter', 'How long things last now'], cargoGets: ['Bu yükle', 'With this load'],
  h1: ['Hareket', 'Moving'], h1d: ['WASD ya da oklarla yürü, Shift ile koş, Boşluk ile zıpla. Fareyle sürükleyerek etrafa bakarsın; bir yere tıklarsan oraya yürürsün. V ile kuş bakışına geçersin.', 'Walk with WASD or the arrows, run with Shift, jump with Space. Drag with the mouse to look around; click a spot to walk there. V switches to the bird\'s-eye view.'],
  h2: ['Kur', 'Building'], h2d: ['B ya da Kur düğmesi inşa ekranını açar; o sırada zaman durur. Aşağıdan bir yapı seç, yeşil kareye tıkla. Yıldız en iyi yeri gösterir. Haritayı WASD ya da sürükleyerek kaydır, tekerle yakınlaş, Q/E ile döndür. Bitince Bitti\'ye bas.', 'B or the Build button opens the build view; time stops while you build. Pick a building below and click a green tile. The star shows the best spot. Move the map with WASD or by dragging, zoom with the wheel, turn with Q/E. Press Done when you finish.'],
  h3: ['Tara ve topla', 'Scan and collect'], h3d: ['F tuşunu basılı tutarak buzu, madeni, kraterleri ve eski görevin izlerini tara: bilim puanı ve Ansiklopedi\'ye yeni sayfa kazanırsın. E ile yakındaki buzu ya da madeni elle toplarsın.', 'Hold F to scan ice, ore, craters and the traces of the earlier mission: you earn science and new Encyclopedia pages. E collects nearby ice or ore by hand.'],
  h4: ['Telsiz', 'Radio'], h4d: ['Önemli kararlar telsiz çağrısı olarak gelir. Hazır olunca Cevapla düğmesine (ya da T tuşuna) bas. Kâşif seviyesinde acil bir çağrıda oyun bir süre seni bekler. Süre dolarsa ATLAS seçer. Kaçırdığın mesajlar Tablet\'te, Telsiz düğmesinde.', 'Big decisions arrive as radio calls. Press Answer (or T) when you are ready. At the Explorer level the game waits a while for you on an urgent call. If time runs out ATLAS chooses. Missed messages wait under the Radio button in the Tablet.'],
  h5: ['Hayatta kal', 'Stay alive'], h5d: ['Sol alttaki halkalar havanın, suyun ve yemeğin kaç gün yeteceğini gösterir. Bir yapının üstünde işaret varsa çalışmıyordur (bozuk, elektriksiz, çalışansız, sığınakta ya da durdurulmuş): üstüne tıkla, nedenini yazar. Üsten uzaklaşınca giysi havan azalır; üsse ya da bir eve dönünce dolar.', 'The rings at the bottom left show how many days your air, water and food last. A sign above a building means it is not working (broken, no power, no worker, crew in shelter or stopped): click it to see why. Away from the base your suit air drains; it refills at the base or a home.'],
  h6: ['Kısayollar', 'Shortcuts'], h6d: ['B kur · F tara · E kullan · R onar · Tab tablet · V kuş bakışı · T çağrıyı yanıtla · P durdur · 1 2 3 hız · Esc duraklat', 'B build · F scan · E use · R repair · Tab tablet · V bird\'s-eye · T answer call · P pause · 1 2 3 speed · Esc pause menu'],
  close: ['Kapat', 'Close'], resume: ['Oyuna dön', 'Back to game'], saved: ['Kaydedildi.', 'Saved.'], soundOn: ['Ses: açık', 'Sound: on'], soundOff: ['Ses: kapalı', 'Sound: off'],
  pauseH: ['Duraklatıldı', 'Paused'], pauseSub: ['Esc ile devam', 'Esc to continue'], autoSave: ['Oyun kendiliğinden kaydedilir.', 'The game saves by itself.'],
  awayT: ['Duraklatıldı', 'Paused'], awayD: ['Devam etmek için tıkla ya da bir tuşa bas', 'Click or press a key to continue'],
  qHigh: ['Grafik: yüksek', 'Graphics: high'], qLow: ['Grafik: düşük', 'Graphics: low'], tutAgain: ['Eğitimi yeniden oyna', 'Replay the tutorial'],
  quit: ['Ana menü', 'Main menu'], quit2: ['Kaydedip çık', 'Save and exit'], lang: ['English', 'Türkçe'],
  winT: ['Görev Başarılı', 'Mission Accomplished'], loseT: ['Görev Sona Erdi', 'Mission Ended'],
  winD: ['{0} üssü {1} {2} boyunca ayakta kaldı.', 'The {0} base stayed alive for {1} {2}.'],
  lose_o2: ['Oksijen bitti; tüm ekip Dünya\'ya geri gönderildi.', 'Oxygen ran out; the whole crew was sent back to Earth.'], lose_su: ['Su bitti; tüm ekip Dünya\'ya geri gönderildi.', 'Water ran out; the whole crew was sent back to Earth.'],
  lose_gida: ['Yemek bitti; tüm ekip Dünya\'ya geri gönderildi.', 'Food ran out; the whole crew was sent back to Earth.'], lose_doz: ['Ekip 600 mSv (radyasyon ölçüsü) güvenli sınırını aştı. Sağlıkları için görev bitti.', 'The crew passed the 600 mSv (a radiation measure) safe limit. The mission was ended for their health.'],
  lose_isyan: ['Ekip seni nazikçe dönüş kapsülüne oturttu, eline bir kutu kurabiye ve bir teşekkür kartı verdi. "Dünya\'da biraz dinlen komutan!" Kapsül yola çıktı.', 'The crew gently sat you in the return capsule and handed you a box of cookies and a thank-you card. "Get some rest on Earth, Commander!" Off went the capsule.'],
  report: ['Görev Karnesi', 'Mission Report'], scoreL: ['Puan', 'Score'], rankL: ['Unvan', 'Rank'], charts: ['Görev boyunca', 'Over the mission'], breakdown: ['Puan dökümü', 'Score breakdown'],
  yourChoices: ['Kararların', 'Your decisions'], byAtlas: ['Sen yanıtlamadın, ATLAS seçti', 'You did not answer, ATLAS chose'], dayN: ['{0}. gün', 'Day {0}'],
  newGame: ['Yeni görev', 'New mission'], freePlay: ['Serbest devam et', 'Keep playing'], cmdr: ['Komutan {0}', 'Commander {0}'],
  ch_bat: ['Pil %', 'Battery %'], ch_doz: ['Radyasyon mSv', 'Radiation mSv'], ch_dozP: ['Radyasyon (güvenli sınırın %)', 'Radiation (% of safe limit)'],
  d_gen: ['Üretim', 'Generation'], d_use: ['Tüketim', 'Consumption'], d_sun: ['Güneş ışığı', 'Sunlight'], d_bat: ['Pil', 'Battery'], d_prio: ['Elektrik yetmezse önce kazıcı, atölye ve laboratuvar durur; hava, su ve yemek yapan makineler en son.', 'When power runs short the digger, workshop and lab stop first; air, water and food makers go last.'],
  d_prod: ['Üretim', 'Production'], d_cons: ['Tüketim', 'Consumption'], d_stock: ['Depoda', 'In store'], d_need: ['Bir insan günde {0} {1} tüketir.', 'One person uses {0} {1} a day.'],
  d_rule: ['Üçler kuralı: insan havasız 3 dakika, susuz 3 gün, yemeksiz 3 hafta dayanır.', 'Rule of threes: a person lasts 3 minutes without air, 3 days without water, 3 weeks without food.'],
  d_dose: ['600 mSv (radyasyon ölçüsü), NASA\'nın bir astronota tüm kariyeri için izin verdiği sınırdır. Dünya\'da yılda yaklaşık 2-3 mSv alırız.', '600 mSv (a radiation measure) is the limit NASA allows an astronaut for a whole career. On Earth we get about 2-3 mSv a year.'],
  d_doseMars: ['Mars ekibi yolculukta yaklaşık 330 mSv alarak geldi.', 'The Mars crew arrived having taken about 330 mSv on the trip.'],
  d_self: ['Kendi üretimin: kullandığın hava, su ve yemeğin ne kadarını burada yaptığın. %100: Dünya\'dan hiçbir şey gerekmez.', 'Home-made share: how much of the air, water and food you use is made here. 100%: nothing needed from Earth.'],
  d_moral: ['Moral işleri etkiler: 0 moralde %85, 100 moralde %115 üretim.', 'Morale affects work: 85% output at 0 morale, 115% at 100.'],
  d_suit: ['Giysinin sırt çantası üsten uzakta sana hava verir. Ana üssün ya da bir evin kapısında hızla dolar.', 'The suit backpack gives you air away from the base. It refills fast at the door of the home base or a home.'],
  simpl: ['Oyunlaştırma notu', 'A note on simplification'], aiNote: ["Bu oyunun kodu, metinleri ve prosedürel modelleri, takımın yönlendirmesiyle Claude Code (Anthropic) yapay zekâ aracıyla üretildi.", "This game's code, texts and procedural models were generated with the AI tool Claude Code (Anthropic) under the team's direction."],
  nonNasa: ['Kaynakların tamamı kamuya açık görev verileridir.', 'All sources are publicly available mission data.'],
  stormB: ['Toz fırtınası · {0} kaldı', 'Dust storm · {0} left'], nightB: ['Uzun gece · {0} kaldı', 'Long night · {0} left'], flareB: ['Güneş fırtınası · ekip sığınakta', 'Solar storm · crew sheltering'],
  conjB: ['Sessiz günler: Güneş araya girdi, Dünya\'yla konuşulamıyor', 'Silent days: the Sun is in the way, no talking to Earth'], paused: ['Durdurdun · P ile devam', 'Paused · P to resume'], pausedT: ['Durdurdun', 'Paused'],
  o2Warn: ['Giysi havası %25. Üsse ya da bir eve dön.', 'Suit air at 25%. Head back to the base or a home.'],
  o2Recall: ['Giysi havan bitti; seni uçan robotla üsse geri getirdim. Ekip biraz endişelendi.', 'Your suit air ran out; I flew you back with the helper robot. The crew got a little worried.'],
  noGlT: ['3B grafik açılamadı', '3D graphics could not start'], noGlD: ['Bu cihaz ya da tarayıcı WebGL desteklemiyor (ya da kapalı). Ufuk Üssü 3B bir oyun; güncel bir Chrome, Edge, Firefox ya da Safari ile, donanım hızlandırma açıkken dene.', 'This device or browser does not support WebGL (or it is switched off). Horizon Base is a 3D game; try a recent Chrome, Edge, Firefox or Safari with hardware acceleration on.'],
  back: ['Geri', 'Back'],
  mood_a: ['Mutlu', 'Happy'], mood_b: ['İyi', 'Fine'], mood_c: ['Yorgun', 'Tired'], mood_d: ['Mutsuz', 'Unhappy'], topReasons: ['En çok etkileyenler', 'Biggest reasons'],
  rad_a: ['güvenli', 'safe'], rad_b: ['dikkat', 'careful'], rad_c: ['tehlike', 'danger'], radLimit: ['güvenli sınır {0} mSv', 'safe limit {0} mSv'],
  workersLine: ['{0} kişi: {1} çalışıyor, {2} boşta', '{0} people: {1} working, {2} idle'], awayN: ['{0} kişi görevde, dışarıda', '{0} away on a task'], perBuilding: ['Yapı yapı çalışanlar', 'Workers per building'], bedsLine: ['Yatak: {0} · Korunaklı: {1}', 'Beds: {0} · Protected: {1}'],
  mutChip: ['Huzursuz', 'Restless'], sceneCap: ['Ekip seni bir kutu kurabiyeyle Dünya\'ya gönderiyor!', 'The crew is sending you home to Earth with a box of cookies!'], mutLadder: ['Ekip seni uyarıyor', 'The crew is warning you'], mut1: ['1. uyarı', '1st warning'], mut2: ['2. uyarı', '2nd warning'], mut3: ['3. uyarı', '3rd warning'],
  mutCapsule: ['kapsül', 'capsule'], mutRisk: ['Eve gönderilme ihtimali: {0}', 'Chance of being sent home: {0}'], risk_yok: ['yok', 'none'], risk_dusuk: ['düşük', 'low'], risk_ciddi: ['ciddi', 'serious'],
  mutHow: ['Morali yükselt: izin ver, yatak ekle ya da Dinlenme Kubbesi kur.', 'Raise morale: give a day off, add beds or build a Recreation Dome.'],
  prevIn: ['{0} içinde:', 'Over {0}:'], prevStop: ['{0} {1} durur', '{0} stops for {1}'], prevNone: ['Hemen hiçbir şey değişmez', 'Almost nothing changes'], prevRisk: ['Şans işi', 'A gamble'],
  rw_dose: ['radyasyon', 'radiation'], rw_moral: ['moral', 'morale'], cargoDays: ['≈ {0} gün {1}', '≈ {0} days of {1}'],
  tutTitle: ['Eğitim', 'Tutorial'], tutSkip: ['Eğitimi geç', 'Skip tutorial'], tutNext: ['Atla', 'Skip step'], tutGot: ['Anladım', 'Got it'],
  tutDone: ['Eğitim tamam. Üs senin, komutan.', 'Tutorial done. The base is yours, Commander.'],
  tutDoneT: ['Eğitim tamam. Biri telsizden arayınca üstteki çağrıya dokun.', 'Tutorial done. When someone calls on the radio, tap the call at the top.'],
  tut_look: ['Fareyle sürükleyerek etrafına bak.', 'Drag with the mouse to look around.'], tut_lookT: ['Sağ tarafta parmağını sürükleyerek etrafına bak.', 'Drag a finger on the right side to look around.'],
  tut_walk: ['W A S D ile yürü: parlayan işarete git.', 'Walk with W A S D: go to the glowing marker.'], tut_walkT: ['Sol alttaki çubukla yürü: parlayan işarete git.', 'Walk with the stick at the bottom left: go to the glowing marker.'],
  tut_jump: ['Boşluk ile zıpla. Düşük yerçekimini hisset.', 'Press Space to jump. Feel the low gravity.'], tut_jumpT: ['Zıpla düğmesine dokun. Düşük yerçekimini hisset.', 'Tap the jump button. Feel the low gravity.'],
  tut_rings: ['Sol alttaki halkalar havanın, suyun ve yemeğin kaç gün yeteceğini gösterir.', 'The rings at the bottom left show how many days your air, water and food will last.'],
  tut_ringsT: ['Soldaki halkalar havanın, suyun ve yemeğin kaç gün yeteceğini gösterir.', 'The rings on the left show how many days your air, water and food will last.'],
  tut_build: ['Makineler elektrikle çalışır. Önce {0} kur: Kur\'a (B) bas, yıldızlı kareye koy.', 'Machines run on power. Build a {0} first: press Build (B), put it on the star tile.'], tut_buildT: ['Makineler elektrikle çalışır. Önce {0} kur: Kur\'a dokun, yıldızlı kareye koy.', 'Machines run on power. Build a {0} first: tap Build, put it on the star tile.'],
  tut_oksijen: ['Şimdi hava: {0} kur. Elektrik ister: panel {1} verir, makine {2} yer.', 'Now air: build the {0}. It needs power: the panel gives {1}, the machine uses {2}.'], tut_su: ['Şimdi su: {0} mavi buz alanına kurulur. Yıldızlı kareye koy.', 'Now water: the {0} goes on blue ice. Put it on the star tile.'],
  srcCn: ['Çin\'in Chang\'e-4 aracı (NASA değil)', 'China\'s Chang\'e-4 lander (not NASA)'],
  wear: ['Giy', 'Wear'], worn: ['Giydin: {0}', 'Now wearing: {0}'], lockTip: ['{0} kilitli. Açmak için: {1}', '{0} is locked. To unlock: {1}'],
  scanHere: ['Buraya tıkla', 'Click here'], scanHereT: ['Buraya dokun', 'Tap here'],
  scanHowT: ['Önce mavi buz ya da turuncu maden alanına dokun. Astronot yanına gidince İncele düğmesine dokun.', 'First tap a blue ice or orange mineral patch. When the astronaut is next to it, tap Scan.'],
  shipLineT: ['Kargo gemisi iniyor. Yanına yürü ya da üstteki düğmeye dokun.', 'The cargo ship is landing. Walk to it or tap the button at the top.'],
  awayDT: ['Devam etmek için dokun', 'Tap to continue'], planClickT: ['Kareye dokun, sonra "Buraya kur"', 'Tap a tile, then "Build here"'],
  h1dT: ['Sol alttaki çubukla yürü, sağ tarafta parmağını sürükleyerek etrafa bak. Kuş bakışında yere dokununca astronot oraya yürür.', 'Walk with the stick at the bottom left and drag on the right to look around. From above, tap the ground and the astronaut walks there.'],
  h2dT: ['Kur düğmesi inşa ekranını açar; o sırada zaman durur. Aşağıdan bir yapı seç, kareye dokun, sonra "Buraya kur". Yıldız en iyi yeri gösterir. Haritayı parmağınla kaydır, iki parmakla yakınlaş.', 'The Build button opens the build view; time stops. Pick a building below, tap a tile, then "Build here". The star shows the best spot. Drag the map with a finger, pinch to zoom.'], scanPress: ['Şimdi İncele düğmesine bas', 'Now press Scan'],
  scanHow: ['Önce mavi buz ya da turuncu maden alanına tıkla. Astronot yanına gidince İncele düğmesine bas.', 'First click a blue ice or orange mineral patch. When the astronaut is next to it, press Scan.'],
  tut_scan: ['F tuşunu basılı tut: işaretli kayayı ya da buzu tara.', 'Hold F: scan the marked rock or ice.'], tut_scanT: ['Tara düğmesini basılı tut: işaretli kayayı ya da buzu tara.', 'Hold the Scan button: scan the marked rock or ice.'],
  tut_radio: ['Biri telsizden arayınca üstteki Cevapla\'ya bas. Kaçırdığın mesajlar Tablet\'te, Telsiz\'de.', 'When someone calls on the radio, press Answer at the top. Missed messages wait in the Tablet, under Radio.'],
  tut_time: ['▶ düğmesine bas, gün başlasın.', 'Press ▶ to start the day.'], tut_timeT: ['Sağ alttaki ▶ düğmesine dokun, gün başlasın.', 'Tap ▶ at the bottom right to start the day.'],
  tutWalkMode: ['Önce V ile astronot görünümüne geç.', 'First press V for the astronaut view.'], tutWalkModeT: ['Önce Astronot düğmesiyle astronota geç.', 'First tap Astronaut to switch to the astronaut.'],
  tutDoneBuild: ['Bitti\'ye basınca inşa ekranı kapanır.', 'Press Done to close the build view.'],
  tutTarget: ['Buraya', 'Here'], hubFar: ['Ana üs', 'Home base'],
  ring_o2: ['Hava', 'Air'],
  chipM: ['Malzeme', 'Material'],
  chipP: ['Yedek parça', 'Parts'], chipPs: ['Parça', 'Parts'],
  chipB: ['Bilim', 'Science'],
  chipE: ['Ekip / yatak', 'Crew / beds'],
  chipMo: ['Moral', 'Morale'],
  dayT: ['Gündüz', 'Day'],
  nightT: ['Gece', 'Night'],
  ok: ['Tamam', 'OK'],
  preview: ['önizleme', 'preview'],
  defaultCargo: ['Yanıt vermezsen {0} sonra ATLAS yükü kendi seçer.', 'If you do not answer, in {0} ATLAS picks the load itself.'],
  radPct: ['Güvenli sınırın %{0}\'i', '{0}% of the safe limit'],
  radPctD: ['Radyasyon: vücuda giren görünmez ışın. Çubuk dolarsa görev biter. Korunaklı yataklar ve toprakla örtülü evler korur.', 'Radiation: invisible rays that get into the body. If the bar fills up, the mission ends. Protected beds and soil-covered homes keep it low.'],
  callAnsBig: ['Cevapla', 'Answer'], shipAnsBig: ['Yükü seç', 'Choose cargo'],
  callWait: ['Zaman durdu', 'Time paused'], keyHints: ['Kısayol ipuçları: {0}', 'Shortcut hints: {0}'], khOn: ['Açık', 'On'], khOff: ['Kapalı', 'Off'],
  radioWait: ['Okuyunca › düğmesine dokun', 'Read it, then tap ›'],
  buildFor: ['{0} kur', 'Build a {0}'],
  tut_air: ['Ay\'dasın. Havan {0} gün yeter. Bitmeden hava yapmalısın.', 'You are on the Moon. Your air lasts {0} days. Make air before it runs out.'],
  tut_airM: ['Mars\'tasın. Havan {0} gün yeter. Bitmeden hava yapmalısın.', 'You are on Mars. Your air lasts {0} days. Make air before it runs out.'],
  tut_choice: ['Malzemen sınırlı. Hangisi önce: {0} (yemek) mı, {1} (gece elektriği) mi? Birini kur.', 'Material is limited. Which first: {0} (food) or {1} (power at night)? Build one.'],
  tutChoseSera: ['Sera 4 gün sonra yemek verir. Gece elektrik az olacak: sonra Batarya kur.', 'The greenhouse gives food after 4 days. Power will be short at night: build a battery next.'],
  tutChoseBat: ['Batarya geceyi kurtarır. Yemek için sonra Sera kur: ilk ürün 4 gün sürer.', 'The battery saves the night. Build a greenhouse next for food: the first crop takes 4 days.'],
  tutPlay: ['▶ Başlat', '▶ Start'],
  tut_night: ['Güneş batınca paneller durur. Gece elektriği bataryadan gelir.', 'When the Sun sets, panels stop. Night power comes from batteries.'],
  tut_ship: ['Dünya\'dan kargo gemisi gelir ama az yük taşır. Ne zaman geleceği Tablet\'te yazar.', 'A cargo ship comes from Earth, but it carries little. The Tablet shows when it arrives.'],
  tutSumT: ['Öğrendiklerin', 'What you learned'],
  tutSum1: ['Elektrik olmadan makine çalışmaz.', 'Machines do not work without power.'],
  tutSum2: ['Gece paneller durur.', 'Panels stop at night.'],
  tutSum3: ['Gemi her şeyi getiremez.', 'The ship cannot bring everything.'],
  tutSumGo: ['Şimdi {0} {1} dayan!', 'Now last {0} {1}!'],
  tutStart: ['Başla', 'Let\'s go'],
  hold: ['Telsizi oku', 'Read the radio'],
  mutCalm: ['Ekip sakin.', 'The crew is calm.'],
  w_siginak: ['Güneş fırtınası: herkes içeride, şimdi dışarıda iş yok.', 'Solar storm: everyone is inside, no outside work now.'],
  rw_pop: ['kişi', 'people'],
  rw_busy: ['kişi meşgul', 'people busy'],
  rw_guc: ['elektrik', 'power'],
  radPctS: ['%{0}', '{0}%'],
  radOfLimit: ['güvenli sınırın yüzdesi', 'of the safe limit'],
  skipScene: ['Geç', 'Skip'],
  planKeys: ['WASD ya da sürükle: kaydır · teker: yakınlaş · Q/E: döndür', 'WASD or drag: move · wheel: zoom · Q/E: turn'],
  ringOk: ['yeterli', 'plenty'],
  prevIdle: ['Hiçbir şey yapmazsan, {0} boyunca:', 'If you do nothing, over {0}:'],
  prevVsIdle: ['Hiçbir şey yapmamaya göre, {0} boyunca:', 'Compared with doing nothing, over {0}:'],
  prevRun: ['{0} {1} fazla çalışır', '{0} runs {1} longer'],

  cr_title: ['Astronotunu hazırla', 'Get your astronaut ready'], cr_hint: ['Her şey hazır. İstersen değiştir, istersen hemen başla.', 'Everything is ready. Change things if you like, or start right away.'],
  cr_name: ['Adın', 'Your name'], cr_defName: ['Komutan', 'Commander'], cr_suit: ['Giysi şeridin', 'Your suit stripe'], cr_patch: ['Görev arman', 'Your mission patch'],
  cr_more: ['Daha fazla', 'More'], cr_visor: ['Kask camı', 'Helmet visor'], cr_shape: ['Armanın şekli', 'Patch shape'], cr_bg: ['Armanın zemini', 'Patch background'],
  cr_go: ['Başla', 'Start'], cr_later: ['Gezgin, uzay aracı ve üs renkleri görev yaptıkça açılır.', 'Rover, spacecraft and base colours unlock as you play.'],
  real: ['Gerçekte', 'In real life'], srcL: ['Kaynak:', 'Source:'], learnT: ['Bugün öğrendiklerin', 'What you learned today'],
  whyT: ['Neden durdu?', 'Why did it stop?'], whyFix: ['Ne yapmalı?', 'What to do?'],
  rw_next: ['Sıradaki ödül', 'Next reward'], rw_new: ['Yeni renk: {0} ({1}) · Dolapta', 'New colour: {0} ({1}) · in the Wardrobe'], rw_all: ['Bütün ödülleri açtın!', 'You unlocked every reward!'],
  wd_title: ['Dolap', 'Wardrobe'], wd_open: ['Dolabı aç', 'Open wardrobe'], wd_menu: ['Astronotum ve araçlarım', 'My astronaut and vehicles'], wd_close: ['Tamam', 'Done'],
  wd_sub: ['Renkler yalnız görünüşü değiştirir, oyunu değiştirmez.', 'Colours only change the look, not the game.'], wd_lock: ['Kilitli', 'Locked'],
  wd_t_astro: ['Astronot', 'Astronaut'], wd_t_arma: ['Arma', 'Patch'], wd_t_rover: ['Gezgin', 'Rover'], wd_t_craft: ['Uzay aracı', 'Spacecraft'], wd_t_bld: ['Üs', 'Base'],
  wd_c_suit: ['giysi şeridi', 'suit stripe'], wd_c_visor: ['kask camı', 'visor'], wd_c_rover: ['gezgin', 'rover'], wd_c_craft: ['uzay aracı', 'spacecraft'], wd_c_bld: ['üs', 'base'],
  wd_c_sym: ['arma simgesi', 'patch symbol'], wd_c_shape: ['arma şekli', 'patch shape'], wd_c_bg: ['arma zemini', 'patch background'], wd_sym: ['Simge', 'Symbol'],
  wd_patchD: ['Bütün ekip aynı armayı taşır. Arma, İniş Modülünde ve araçlarda da görünür.', 'The whole crew wears the same patch. It also appears on the Landing Module and the vehicles.'],
  wd_roverD: ['Gezgin, üs ile yapıların arasında gidip gelen araçtır.', 'The rover drives between the base and your buildings.'],
  wd_craftD: ['İniş Modülü, kargo gemisi ve dönüş kapsülü bu renkleri taşır.', 'The Landing Module, the cargo ship and the return capsule wear these colours.'],
  wd_bldD: ['Bütün yapıların şeridi bu renkte olur.', 'Every building gets a stripe in this colour.'],
  endWd: ['Dolap', 'Wardrobe'],

  menuBtn: ['Tablet', 'Tablet'], speedBtn: ['Hız', 'Speed'], ctx_scan: ['İncele', 'Scan'], ctx_fix: ['Onar', 'Repair'], ctx_use: ['Kullan', 'Use'], ctx_drive: ['Sür', 'Drive'], ctx_exit: ['İn', 'Get out'], ctx_drone: ['Dron', 'Drone'],
  buildTip: ['Kur (B) · malzemen', 'Build (B) · your material'], ringTip: ['{0}: kaç gün yeter', '{0}: days left'], ringTipG: ['Elektrik: bataryada ne kadar var', 'Power: how full the batteries are'],
  ban_pause: ['Durdu', 'Paused'], ban_flare: ['Sığınağa!', 'Take shelter!'], ban_storm: ['Toz fırtınası', 'Dust storm'], ban_night: ['Uzun gece', 'Long night'], ban_conj: ['Sinyal yok', 'No signal'],
  tb_base: ['Üs', 'Base'], tb_tools: ['Araçlar', 'Tools'], tb_map: ['Harita', 'Map'], tb_view: ['Görünüm', 'View'], tb_help: ['Yardım', 'Help'], tb_quit: ['Ana menü', 'Main menu'],
  tb_sound: ['Ses', 'Sound'], tb_lang: ['English', 'Türkçe'], tb_train: ['Eğitimi tekrar oyna', 'Play the training again'], tb_day: ['{0} {1} / {2}', '{0} {1} / {2}'],
  goalTap: ['Dokun: neden?', 'Tap: why?'], goalNone: ['Üssü büyüt', 'Grow the base'], egGo: ['Eğitim bitti. Şimdi gerçek görev!', 'Training done. Now the real mission!'],
  ach_T: ['Başarımlar', 'Achievements'], ach_next: ['Sıradaki', 'Up next'], ach_new: ['Başarım!', 'Achievement!'], ach_none: ['Henüz başarım yok.', 'No achievements yet.'], ach_gives: ['Açar: {0}', 'Unlocks: {0}'],
  feat_surus: ['gezgini sürmek', 'driving the rover'], feat_dron: ['dron keşfi', 'drone scouting'], feat_hiz4: ['4× hız', '4× speed'],
  droneArm: ['Keşif için zemine dokun', 'Tap the ground to scout'], droneNo: ['Dron şu an hazır değil', 'The drone is not ready yet'], droneOk: ['Dron çevreyi açtı', 'The drone mapped the area'],
  driveOn: ['Gezgindesin. Sürmek için zemine dokun.', 'You are in the rover. Tap the ground to drive.'], driveOff: ['Gezginden indin.', 'You got out of the rover.'],
  qRight: ['Doğru!', 'Right!'], qWrong: ['Olmadı.', 'Not quite.'],
  dyk: ['Biliyor muydun?', 'Did you know?'], lowWhy: ['{0} azalıyor!', '{0} is running low!'], k_more: ['Daha fazla', 'More'],

  egdT: ['Eğitim bitti!', 'Training complete!'], egdSkipT: ['Eğitimi geçtin.', 'You skipped the training.'], egdLearn: ['Öğrendiklerin', 'What you learned'], egdNow: ['Şimdi gerçek görev', 'Now the real mission'],
  egdGo: ['Göreve başla', 'Start the mission'], egdBack: ['Görevime dön', 'Back to my mission'], egdSkipD: ['Gerçek görev başlıyor!', 'The real mission begins!'],
  egdAgain: ['Eğitimi Tablet\'ten yeniden oynayabilirsin.', 'You can replay the training from the Tablet.'],
  egdL1: ['Yapı kurmak', 'Building'], egdL2: ['Alanı incelemek', 'Scanning the ground'], egdL3: ['Kaynakları izlemek', 'Watching your supplies'],
  dr_m: ['Malzeme', 'Material'], dr_p: ['Yedek parça', 'Spare parts'], dr_g: ['Elektrik dengesi', 'Power balance'], dr_core: ['Jeneratör yakıtı', 'Generator fuel'],
  sp_ceza: ['yanlış cevap', 'wrong answer'], sp_sure: ['süre doldu', 'time ran out'], dr_gPos: ['{0} artıyor', '{0} spare'], dr_gNeg: ['{0} eksik', '{0} short'], dr_dU: ['g', 'd'], sp_parca: ['yedek parça {0}', 'spare parts {0}'],
  pw_over: ['Elektrik yetmiyor.', 'Not enough power.'], pw_overFix: ['Çözüm: güneş paneli kur ya da bir yapıyı durdur', 'Fix: build a solar panel or stop a building'],
  pw_nowH: ['Elektrik {0} saat sonra bitecek.', 'Power runs out in {0} hours.'], pw_stopFix: ['Çözüm: {0} → Durdur', 'Fix: {0} → Stop'], pw_planFix: ['Çözüm: {0} kur', 'Fix: build {0}'],
  pw_offFix: ['Bazı yapıları kapat.', 'Turn some buildings off.'], pw_ariza: ['{0} bozuk: elektrik azaldı.', '{0} is broken: less power.'], pw_arizaFix: ['Çözüm: onar', 'Fix: repair it'],
  pw_okNight: ['Şimdi yetiyor, gece yetmez', 'OK now, not for the night'], pw_nightOk: ['Batarya gece bitene kadar yeter ✓', 'Battery lasts until morning ✓'], pw_altStop: ['Malzeme yetmezse: {0} → Durdur', 'Short of material: {0} → Stop'], pw_altCargo: ['Malzeme yetmezse: kargo gemisinden malzeme iste', 'Short of material: ask the cargo ship for material'], pw_gain: ['Durdurursan gecede +{0} saat elektrik kazanırsın.', 'Stopping it gives +{0} hours of night power.'],
  atlasQLine: ['ATLAS\'ın bir sorusu var: T\'ye bas.', 'ATLAS has a question: press T.'], atlasQLineT: ['ATLAS\'ın bir sorusu var: ATLAS\'a dokun.', 'ATLAS has a question: tap ATLAS.'],
  storedEl: ['{0} / {1} elektrik saklı', '{0} / {1} power stored'], doseU: ['(ışın birimi)', '(radiation unit)'],
  egStepN: ['Adım {0}/{1}', 'Step {0}/{1}'],
  egdFacts: ['Öğrendiğin bilgiler', 'Facts you learned'], egdNew: ['Gerçek görev yeni, boş bir üste başlar.', 'The real mission starts at a new, empty base.'],
  needHave: ['{0} {1} lazım, sende {2}', 'Need {0} {1}, you have {2}'],
  pw_night: ['Bu yapılarla uzun gecede elektrik yetmez. Batarya ekle.', 'With these buildings, power fails in the long night. Add batteries.'],
  pw_soon: ['Uzun gece {0} {1} sonra. Elektriğin yetmeyecek!', 'Long night in {0} {1}. Your power will run out!'],
  rw_o2: ['Hava', 'Air'], rw_su: ['Su', 'Water'], rw_gida: ['Yemek', 'Food'], rw_soon: ['{0} {1} {2} sonra bitecek!', '{0} runs out in {1} {2}!'], rw_today: ['{0} bugün bitecek!', '{0} runs out today!'],
  rw_fixB: ['Çözüm: {0} kur', 'Fix: build {0}'], rw_fixR: ['Çözüm: {0} → Onar', 'Fix: {0} → Repair'], rw_fixOn: ['Çözüm: {0} → Çalıştır', 'Fix: {0} → Turn on'], rw_fixP: ['Çözüm: elektrik üret (güneş paneli / batarya)', 'Fix: make power (solar panel / battery)'],
  pw_now: ['Uzun gece: elektrik yetmeyecek.', 'Long night: power will run out.'],
  pw_fix: ['{0} batarya daha kur', 'Build {0} more batteries'], pw_fix1: ['1 batarya daha kur', 'Build 1 more battery'], pw_fixG: ['Çözüm: {0}', 'Fix: {0}'],
  pw_ok: ['Uzun geceye hazırsın ✓', 'You are ready for the long night ✓'], pw_lastL: ['Elektrik yeter', 'Power lasts'], pw_nightL: ['Gece', 'Night'],
  pw_cg: ['Elektrik yetmez', 'Not enough power'], pw_cn: ['Gece yetmez', 'Fails at night'],
  pw_hrs: ['Batarya {0} saat yeter', 'Battery lasts {0} hours'], pw_inf: ['Elektrik yetiyor', 'Power is enough'],
  t_defter: ['Defterim', 'My notebook'], teachL: ['Bilgi', 'Fact'],
};
let uiTouchF = false;
const T = (k, ...a) => { const e = (uiTouchF && STR[k + 'T']) || STR[k]; let v = e ? e[LANG === 'en' ? 1 : 0] : k; a.forEach((x, i) => { v = v.split('{' + i + '}').join(x); }); return v; };
const dayUnit = (W, n) => { const w = tx(W.dayWord).toLowerCase(); return LANG === 'en' && n !== 1 ? w + 's' : w; };
const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NOVAL = '–';
const isNum = v => v != null && v !== '' && Number.isFinite(+v);
const num = (v, d) => (isNum(v) ? (+v).toLocaleString(LANG === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: d || 0, minimumFractionDigits: d || 0 }) : NOVAL);
const sgn = (v, d) => !isNum(v) ? NOVAL : (v >= 0 ? '+' : '−') + num(Math.abs(v), d == null ? 1 : d);
const pct = v => !isNum(v) ? NOVAL : (LANG === 'en' ? Math.round(v * 100) + '%' : '%' + Math.round(v * 100));

const fmtH = h => { if (!isNum(h)) return NOVAL; const s = UI && UI.s, mars = s && s.world === 'mars'; const dw0 = s && typeof dw === 'function' ? tx(dw(s)) : (mars ? 'sol' : T('days')); return h >= 48 ? `${Math.ceil(h / 24)} ${dw0}` : `${Math.max(0, Math.ceil(h))} ${T('hoursShort')}`; };
const txa = v => (Array.isArray(v) ? v.map(x => tx(x)).join(' ') : tx(v));
const low = t => String(t).toLocaleLowerCase(LANG === 'en' ? 'en-US' : 'tr-TR');

const IC = {
  bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6z" fill="currentColor" stroke="none"/>',
  o2: '<circle cx="9" cy="10" r="6"/><circle cx="18" cy="17" r="3.2"/>',
  drop: '<path d="M12 2.5c4 5 6.5 8.2 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10.7 8 7.5 12 2.5z"/>',
  leaf: '<path d="M5 19C5 11 10 5 20 5c0 10-6 15-14 15zM5 19l8-8"/>',
  cube: '<path d="M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10"/>',
  gear: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 15h9"/>',
  crew: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2M9 10h.01M15 10h.01"/>',
  rad: '<g fill="currentColor" stroke="none"><circle cx="12" cy="12" r="1.8"/><path d="M12 3a9 9 0 0 1 7.8 4.5l-5.2 3A3 3 0 0 0 12 9z"/><path transform="rotate(120 12 12)" d="M12 3a9 9 0 0 1 7.8 4.5l-5.2 3A3 3 0 0 0 12 9z"/><path transform="rotate(240 12 12)" d="M12 3a9 9 0 0 1 7.8 4.5l-5.2 3A3 3 0 0 0 12 9z"/></g>',
  loop: '<path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5"/>',
  flare: '<circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>',
  night: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L3 18l3 3 6.2-6.2a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.5-.5-.5-2.5z"/>',
  meteor: '<circle cx="16.5" cy="16.5" r="4"/><path d="M3 3l9.5 9.5M9 3l6 6M3 9l6 6"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  wave: '<path d="M2 12h3l2-6 3 12 3-9 2 5 2-2h5"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  storm: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
  ship: '<path d="M12 2c3 3 4 6 4 10l2 4h-4l-1 3h-2l-1-3H6l2-4c0-4 1-7 4-10z"/><circle cx="12" cy="9" r="1.6"/>',
  star: '<path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', shield: '<path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/>',
  pause: '<path d="M8 5v14M16 5v14" stroke-width="3"/>', play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  radio: '<path d="M12 13v8M8.5 21h7"/><circle cx="12" cy="11" r="2"/><path d="M7.8 6.8a6 6 0 0 0 0 8.4M16.2 6.8a6 6 0 0 1 0 8.4M5 4a10 10 0 0 0 0 14M19 4a10 10 0 0 1 0 14"/>',
  atlas: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  tape: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8.5" cy="12" r="2"/><circle cx="15.5" cy="12" r="2"/><path d="M8.5 14h7"/>',
  scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8c0 4-2.5 7-6.5 7S5 18.5 4 15l-1-3a1.5 1.5 0 0 1 2.7-1.2L8 13"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  drone: '<rect x="9" y="10" width="6" height="4" rx="1"/><path d="M9 11 5 8M15 11l4-3M9 13l-4 3M15 13l4 3"/><circle cx="4.5" cy="7.5" r="2.5"/><circle cx="19.5" cy="7.5" r="2.5"/><circle cx="4.5" cy="16.5" r="2.5"/><circle cx="19.5" cy="16.5" r="2.5"/>',
  walk: '<circle cx="13" cy="4" r="2"/><path d="m9 21 3-6 3 3v3M7 12l3-4 4 1 3 3M10 8l2 7"/>',
  pda: '<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M9 6.5h6M9 10h6M9 13.5h4M11 18.5h2"/>',
  build: '<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
  jump: '<path d="M12 20V6M6 12l6-6 6 6M5 21h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',

  parts: '<path d="M15.5 3.5a4 4 0 0 0-4.6 5.4L3.5 16.3l3.2 3.2 7.4-7.4a4 4 0 0 0 5.4-4.6l-2.7 2.7-2.6-.6-.6-2.6z"/><circle cx="18" cy="18" r="2.6"/>',
  bricks: '<rect x="3" y="13" width="8" height="6" rx="1"/><rect x="13" y="13" width="8" height="6" rx="1"/><rect x="8" y="5" width="8" height="6" rx="1"/>',
  helmet: '<path d="M5 15a7 7 0 0 1 14 0v3H5z"/><path d="M8 15a4 4 0 0 1 8 0"/><circle cx="19" cy="6" r="2"/>',
  rocket: '<path d="M12 2c3 3 4 6 4 10l2 4h-4l-1 3h-2l-1-3H6l2-4c0-4 1-7 4-10z"/><circle cx="12" cy="9" r="1.6"/>',
  tablet: '<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M9 6.5h6M9 10h6M9 13.5h4M11 18.5h2"/>',
  radioLog: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  undo: '<path d="M9 7 4 12l5 5M4 12h10a6 6 0 0 1 0 12"/>',
  blueprint: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>',
  home: '<path d="M3 11 12 4l9 7M6 9.5V20h12V9.5"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>', sound: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9l5 6M21 9l-5 6"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  school: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>', rover: '<rect x="4" y="8" width="16" height="6" rx="1.5"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M12 8V4h4"/>',
  trophy: '<path d="M7 4h10v5a5 5 0 01-10 0z"/><path d="M7 6H4a3 3 0 003 4M17 6h3a3 3 0 01-3 4M12 14v4M8 21h8"/>',
  apple: '<path d="M5 19C5 11 10 5 20 5c0 10-6 15-14 15zM5 19l8-8"/>',
};

const iconSet = () => (typeof UI_ICONS !== 'undefined' && UI_ICONS) || null;
const ico = (n, cls) => { const S = iconSet(); return S && S[n] ? `<svg class="ic f ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${S[n]}</svg>` : `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`; };

const RES_IC = { o2: 'o2', su: 'drop', gida: 'apple', malzeme: 'bricks', parca: 'parts', bilim: 'flask', guc: 'bolt', suit: 'helmet', doz: 'rad', moral: 'smile', ekip: 'crew', kargo: 'rocket', self: 'loop' };
const badge = (r, n, cls) => `<span class="resb ${cls || ''}" style="--rc:var(--c-${r});--ri:var(--i-${r}, #fff)">${ico(n || RES_IC[r] || r)}</span>`;
const RES_UNIT = { o2: 'kg', su: 'L', gida: 'kg', malzeme: '', parca: '', bilim: '' };
const CHIP_IC = RES_IC;
const FROM_IC = { mc: 'radio', atlas: 'atlas', crew: 'crew', kayit: 'tape' };
const PDA_TABS = ['gorev', 'defter', 'ekip', 'ara', 'banka', 'telsiz'];

const KID_GROUP = { oksijen: 'hava', su: 'su', geri: 'su', sera: 'yemek', gunes: 'guc', batarya: 'guc', reaktor: 'guc', yasam: 'ev', spor: 'ev', maden: 'diger', atolye: 'diger', lab: 'diger', anten: 'diger', pist: 'diger' };
const KID_GROUPS = ['hava', 'su', 'yemek', 'guc', 'ev', 'diger'];
const GRP_RES = { hava: 'o2', su: 'su', yemek: 'gida', guc: 'guc', ev: 'ekip', diger: 'bilim' };

const planScene = () => UI.gl && typeof S3 !== 'undefined' && typeof S3.setBuildHints === 'function';
const castOf = () => (typeof STORY !== 'undefined' && STORY && STORY.cast) || null;
const feats = () => ({
  icons: !!iconSet(), resColor: typeof RES_COLOR !== 'undefined' && !!RES_COLOR, drawGlyph: typeof drawGlyph === 'function', planScene: !!planScene(), cast: !!castOf(),
  groups: typeof GROUPS !== 'undefined' && !!GROUPS, unlockedB: typeof unlockedB === 'function', buildStage: typeof buildStage === 'function', suggestSpot: typeof suggestSpot === 'function', starterPlan: typeof starterPlan === 'function',
  undoBuild: typeof undoBuild === 'function', mutinyInfo: typeof mutinyInfo === 'function', previewChoice: typeof previewChoice === 'function', previewToggle: typeof previewToggle === 'function',
  previewCargo: typeof previewCargo === 'function', activeEffects: typeof activeEffects === 'function', keyChoices: typeof keyChoices === 'function',
});

const TESTMODE = typeof location !== 'undefined' && location.hash === '#test';
const stub = n => (TESTMODE && typeof window !== 'undefined' && window.__uuMods && window.__uuMods[n] != null ? window.__uuMods[n] : null);
function mod(n) {
  if (n === 'EGITIM' && typeof EGITIM !== 'undefined' && EGITIM) return EGITIM;
  if (n === 'ISKART' && typeof ISKART !== 'undefined' && ISKART) return ISKART;
  if (n === 'OGRET' && typeof OGRET !== 'undefined' && OGRET) return OGRET;
  if (n === 'HARITA' && typeof HARITA !== 'undefined' && HARITA) return HARITA;
  const m = stub(n); return m && typeof m === 'object' ? m : null;
}

function ext(n) {
  let f = null;
  switch (n) {
    case 'currentGoal': f = typeof currentGoal === 'function' ? currentGoal : null; break;
    case 'missionGoal': f = typeof missionGoal === 'function' ? missionGoal : null; break;
    case 'achNext': f = typeof achNext === 'function' ? achNext : null; break;
    case 'featOn': f = typeof featOn === 'function' ? featOn : null; break;
    case 'droneScout': f = typeof droneScout === 'function' ? droneScout : null; break;
    case 'checkAch': f = typeof checkAch === 'function' ? checkAch : null; break;
    case 'powerOutlook': f = typeof powerOutlook === 'function' ? powerOutlook : null; break;
    case 'buildOutlook': f = typeof buildOutlook === 'function' ? buildOutlook : null; break;
    case 'stopGainH': f = typeof stopGainH === 'function' ? stopGainH : null; break;
    default: f = null;
  }
  if (!f) { const m = stub(n); if (typeof m === 'function') f = m; }
  return f;
}
const callExt = (n, ...a) => { const f = ext(n); if (!f) return undefined; try { return f(...a); } catch (e) { console.error(e); return undefined; } };
const uiAchList = () => { if (typeof ACHIEVEMENTS !== 'undefined' && Array.isArray(ACHIEVEMENTS)) return ACHIEVEMENTS; const m = stub('ACHIEVEMENTS'); return Array.isArray(m) ? m : []; };
const atlasQ = () => { if (typeof ATLAS_Q !== 'undefined' && Array.isArray(ATLAS_Q)) return ATLAS_Q; const m = stub('ATLAS_Q'); return Array.isArray(m) ? m : []; };

function featIs(f) {
  const s = UI.s; if (!s) return false;
  const fo = ext('featOn');
  if (!fo) return f === 'hiz4';
  try { return !!fo(s, f); } catch (e) { return f === 'hiz4'; }
}
const SPEEDS = [0, 1, 2, 4], HOUR_S = 1.5;
const TILE_M = 8, REACH_M = 16, AIR_M = 14;
const SCAN_MS = 1200;
const SAVE_KEY = 'ufuk-ussu-kayit-v3', SET_KEY = 'ufuk-ussu-ayar', BEST_KEY = 'ufuk-ussu-skor';

const UI = {
  s: null, screen: 'title', world: 'ay', level: 'kasif', speed: 1, prevSpeed: 1, acc: 0, frac: 0, modal: null, sound: true, endShown: false,
  cache: {}, cargo: null, pda: null, placing: null, gl: false, touch: false, locked: false, mode: 'walk', mouse: null,
  logN: 0, radioN: 0, subQ: [], sub: null, subGap: 0, seenPid: {}, ship: null, ctx: null, scanH: null, card: null,
  tut: null, chapT: null, chapUntil: 0, bankT: -1, ptx: -1, pty: -1, o2Warned: false, recallT: 0, demolishArm: 0, selB: null, set: {},
  paused: null, away: null, plan: false, prevMode: 'walk', grp: 'all', pend: null, lastB: null, undoUntil: 0, selfT: 0, lockMenuT: 0, subHover: false, atlasN: 0, telF: 'all', telSeen: 0,
};


const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) {   } },
};
function saveSettings() { store.set(SET_KEY, Object.assign(UI.set, { lang: LANG, sound: UI.sound })); }
function syncPl() {
  const s = UI.s; if (!s || !UI.gl) return;
  const p = S3.player; if (!p) return;
  s.pl = s.pl || { o2: 1 };
  s.pl.x = p.x; s.pl.z = p.z; s.pl.yaw = p.yaw;
}

function saveGame() { const s = UI.s; if (!s || s.over || s.train || UI.train) return false; syncPl(); s.dirty = false; return store.set(SAVE_KEY, s); }
function loadSave() { const s = store.get(SAVE_KEY); return s && s.v === 3 && s.map && WORLDS[s.world] && !s.train ? s : null; }


const Snd = {
  ctx: null,
  tone(f, t0, dur, type, vol, f2) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, c.currentTime + t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, c.currentTime + t0 + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime + t0); g.gain.exponentialRampToValueAtTime(vol || 0.05, c.currentTime + t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.02);
  },
  play(n) {
    if (!UI.sound) return;
    try {
      if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; this.ctx = new AC(); }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const t = (...a) => this.tone(...a);
      if (n === 'click') t(700, 0, 0.05, 'triangle', 0.03);
      else if (n === 'place') { t(330, 0, 0.09, 'triangle', 0.05); t(495, 0.07, 0.12, 'triangle', 0.05); }
      else if (n === 'done') { t(523, 0, 0.1, 'sine', 0.04); t(784, 0.09, 0.16, 'sine', 0.04); }
      else if (n === 'good') { t(523, 0, 0.12, 'triangle', 0.05); t(659, 0.1, 0.12, 'triangle', 0.05); t(784, 0.2, 0.22, 'triangle', 0.05); }
      else if (n === 'warn') { t(392, 0, 0.14, 'square', 0.025); t(392, 0.2, 0.14, 'square', 0.025); }
      else if (n === 'bad') { t(220, 0, 0.3, 'sawtooth', 0.035, 110); }
      else if (n === 'no') t(160, 0, 0.12, 'square', 0.025);
      else if (n === 'ship') { t(90, 0, 1.6, 'sawtooth', 0.04, 40); t(180, 0, 1.4, 'triangle', 0.03, 70); }
      else if (n === 'win') { [523, 659, 784, 1047].forEach((f, i) => t(f, i * 0.14, 0.3, 'triangle', 0.05)); }
      else if (n === 'scanHum') t(420, 0, SCAN_MS / 1000, 'sine', 0.014, 980);
      else if (n === 'scan') { t(880, 0, 0.07, 'sine', 0.04); t(1320, 0.08, 0.09, 'sine', 0.04); t(1760, 0.18, 0.2, 'sine', 0.035); }
      else if (n === 'radio') { t(1250, 0, 0.035, 'square', 0.016); t(940, 0.05, 0.05, 'square', 0.016); t(1250, 0.12, 0.03, 'square', 0.012); }
      else if (n === 'chapter') { t(392, 0, 0.9, 'triangle', 0.03); t(523, 0.18, 0.9, 'triangle', 0.03); t(659, 0.36, 1.2, 'triangle', 0.03); }
      else if (n === 'tick') { t(988, 0, 0.06, 'sine', 0.035); t(1480, 0.07, 0.12, 'sine', 0.035); }
    } catch (e) {   }
  },
};


const wpos = (tx, ty) => ({ x: tx * TILE_M + TILE_M / 2, z: ty * TILE_M + TILE_M / 2 });
const hubPos = () => wpos(HUBX, HUBY);
const story = s => (typeof STORY !== 'undefined' && STORY && STORY[s.world]) || null;
const inConj = s => typeof conjOn === 'function' && conjOn(s);
const kasif = () => !!UI.s && UI.s.level === 'kasif';
const topView = () => UI.mode !== 'walk';
function plDist(x, z) { if (!UI.gl || !S3.player) return 1e9; const p = S3.player; return Math.hypot(p.x - x, p.z - z); }
function groundY(x, z) { try { return UI.gl && S3.hAt ? S3.hAt(x, z) : 0; } catch (e) { return 0; } }
function foundKinds(r) { return !r ? [] : Array.isArray(r) ? r : Object.keys(r); }

function missTxt(s, k, miss) {
  const c = costOf(s, k), m = miss || { m: Math.max(0, c.m - s.res.malzeme), p: Math.max(0, c.p - s.res.parca) }, out = [];
  if (m.m > 0) out.push(T('missM', num(Math.ceil(m.m))));
  if (m.p > 0) out.push(T('missP', num(Math.ceil(m.p))));
  return out.join(' · ');
}
function whyTxt(r, k) {
  if (r && r.msg) return tx(r.msg);
  if (r && r.why === 'egitim' && UI.s && typeof buildMsg === 'function') return tx(buildMsg(UI.s, k, 'egitim'));
  const s = UI.s;
  if (r.why === 'tech') return T('needTech', tx(TECHS[BLD[k].tech].name));
  if (r.why === 'core') return T('needCore');
  if (r.why === 'cost' && s) return missTxt(s, k, r.miss) || T('w_cost');
  if (r.why === 'stage') { const l = lockOf(s, k); return l ? l.why + (l.at ? ' · ' + l.at : '') : T('w_stage'); }
  return STR['w_' + r.why] ? T('w_' + r.why) : T('w_x');
}
const warnTxts = r => (r.warnMsg && r.warnMsg.length ? r.warnMsg.map(tx) : (r.warn || []).map(w => STR['w_' + w] ? T('w_' + w) : ''));
function nearAir(s) {
  const h = hubPos(); if (plDist(h.x, h.z) <= AIR_M) return true;
  for (const b of s.b) if (b.k === 'yasam' && b.left === 0) { const p = wpos(b.x, b.y); if (plDist(p.x, p.z) <= AIR_M) return true; }
  return false;
}

function applyResColors() {
  if (typeof RES_COLOR === 'undefined' || !RES_COLOR) return;
  const st = document.documentElement.style;
  for (const k in RES_COLOR) if (typeof RES_COLOR[k] === 'string') st.setProperty('--c-' + k, RES_COLOR[k]);
  if (typeof RES_INK !== 'undefined' && RES_INK) for (const k in RES_INK) if (typeof RES_INK[k] === 'string') st.setProperty('--i-' + k, RES_INK[k]);
}

function s3Mode(m) { UI.selfT = performance.now(); try { S3.setMode(m); } catch (e) {   } UI.mode = S3.mode || UI.mode; }
function s3Input(en) { if (!en) UI.selfT = performance.now(); try { if (UI.gl) S3.setInput(en); } catch (e) {   } }


function setLang(l) {
  LANG = l; document.documentElement.lang = l; saveSettings();
  renderTitle();
  if (UI.s) { buildHud(); UI.cache = {}; refresh(true); }
}
function showScreen(n) {
  UI.screen = n; $('title').hidden = n !== 'title'; $('game').hidden = n !== 'game';
  if (n !== 'title') { uiGs.dive = null; uiGs.focus = null; if (typeof GIRIS !== 'undefined') try { GIRIS.stop(); } catch (e) {   } }
}


const uiGs = { focus: null, dive: null };
const uiGsLv = w => (w === 'mars' ? 'muhendis' : 'kasif');
function uiGsFocus(w) {
  if (uiGs.dive) return;
  uiGs.focus = w || null; const g = $('titleInner'); if (g) { if (w) g.dataset.focus = w; else delete g.dataset.focus; }
}
function renderTitle() {
  document.title = LANG === 'en' ? 'Horizon Base' : 'Ufuk Üssü';
  const sv = loadSave(), best = store.get(BEST_KEY) || {};
  const half = id => {
    const W = WORLDS[id], short = v => String(v).split(' · ')[0];
    const chip = (k, v) => `<span class="gs-chip"><i>${T(k)}</i><b>${esc(v)}</b></span>`;
    const name = String(tx(W.name)).toLocaleUpperCase(LANG === 'tr' ? 'tr-TR' : 'en-US');
    return `<button class="wcard gs-half" data-act="start" data-v="${id}" data-w="${id}" aria-label="${esc(T('gs_go_' + id))} · ${esc(T('gs_pill_' + id))}">
      <span class="gs-in">
        <span class="gs-pill">${T('gs_pill_' + id)}</span>
        <span class="gs-name">${esc(name)}</span>
        <span class="gs-line">${T('gs_line_' + id)}</span>
        <span class="gs-chips">${chip('gs_dist', short(tx(W.facts[0][1])))}${chip('gs_grav', tx(W.facts[1][1]))}${chip('gs_len', T('gs_len_' + id, W.missionDays))}</span>
        <span class="gs-go">${ico('rocket')}<span>${T('gs_go_' + id)}</span></span>
      </span>
    </button>`;
  };
  const bA = best['ay-kasif'] || 0, bM = best['mars-muhendis'] || 0, b = Math.max(bA, bM);
  const g = $('titleInner');
  g.className = 'gs'; delete g.dataset.dive; uiGs.dive = null; UI.launching = false;
  if (uiGs.focus) g.dataset.focus = uiGs.focus; else delete g.dataset.focus;
  g.innerHTML = `
    <div class="gs-bg a" aria-hidden="true"></div><div class="gs-bg m" aria-hidden="true"></div>
    ${half('ay')}${half('mars')}
    <div class="gs-seam g" aria-hidden="true"></div><div class="gs-seam" aria-hidden="true"></div>
    <header class="gs-logo"><h1>${LANG === 'en' ? 'HORIZON BASE' : 'UFUK ÜSSÜ'}</h1><p>${T('gs_sub')}</p></header>
    <button class="ghost gs-lang" data-act="lang">${T('lang')}</button>
    <footer class="gs-foot t-foot">${sv ? `<button class="btn gs-cont" data-act="cont" data-w="${sv.world}">${ico('rocket')} ${T('cont', tx(WORLDS[sv.world].name), tx(WORLDS[sv.world].dayWord), dayOf(sv))}</button>` : ''}<button class="link" data-act="how">${T('how')}</button><button class="link" data-act="src">${T('sources')}</button><button class="btn about-btn" data-act="about">${ico('info')} ${T('about')}</button>${b ? `<span class="best">${T('best', num(b))}</span>` : ''}</footer>
    <div class="gs-fade" aria-hidden="true"></div>`;
  $('app').dataset.world = UI.world;
}

function uiLaunch(world, level) {
  if (UI.launching || UI.screen !== 'title') return;
  UI.world = world === 'mars' ? 'mars' : 'ay'; UI.level = level || uiGsLv(UI.world);
  const go = () => { UI.launching = false; uiGs.dive = null; const g = $('titleInner'); if (g) delete g.dataset.dive; if (UI.screen !== 'title') return; enterGame(newMission(UI.world, UI.level, prof().name || UI.name || ''), true); };
  if (/test/.test(location.hash) || !UI.gl) { go(); return; }
  UI.launching = true;
  uiGs.focus = UI.world; uiGs.dive = { w: UI.world, t0: performance.now() };
  const g = $('titleInner'); if (g) { g.dataset.focus = UI.world; g.dataset.dive = UI.world; }
  setTimeout(go, 720); setTimeout(() => Snd.play('place'), 0);
}


function uiIntroNow() { if (!UI.introOn) return false; try { return typeof S3.introActive !== 'function' || !!S3.introActive(); } catch (e) { return false; } }
function uiIntro(done) {
  if (!UI.gl || typeof S3 === 'undefined' || typeof S3.intro !== 'function') return false;
  if (/test/.test(location.hash) && !(window.__uu && window.__uu.intro === true)) return false;
  let fired = false;
  const fin = () => { if (fired) return; fired = true; UI.introOn = false; if (UI.s && UI.screen === 'game') done(); };
  let ok = false; UI.introOn = true;
  try { ok = S3.intro({ onDone: fin }) === true; } catch (e) { console.error(e); ok = false; }
  if (!ok) UI.introOn = false;
  return ok || fired;
}
function enterGame(s, fresh, opts) {
  opts = opts || {};
  if (!UI.gl) { modalNoGl(); return; }
  closeModal(); closePda(); if (UI.plan) exitPlan();
  if (!s.achP || typeof s.achP !== 'object') s.achP = Object.assign({}, prof().ach);
  Object.assign(UI, { s, acc: 0, frac: 0, endShown: false, ship: null, cache: {}, speed: 1, prevSpeed: 1, pda: null, placing: null, ctx: null, scanH: null, card: null,
    subQ: [], sub: null, subGap: 0, seenPid: {}, tut: null, chapUntil: 0, ptx: -1, pty: -1, o2Warned: false, recallT: 0, demolishArm: 0, selB: null, jumped: false,
    paused: null, away: null, plan: false, pend: null, lastB: null, undoUntil: 0, atlasN: 0, callWait: {}, hintSeen: {}, sceneOn: false, sceneDone: false, sceneEnd: null,
    achSeen: Object.assign({}, s.ach || {}), achQ: [], achT: 0, goalK: '', goalId: null, goalFlip: 0, droneArm: false, setGoalK: null });
  $('toasts').innerHTML = '';
  UI.logN = s.logN || 0;
  UI.radioN = fresh ? 0 : (s.radioN || 0);
  UI.chapT = fresh ? null : (s.fx && s.fx.chapterT != null ? s.fx.chapterT : null);
  $('app').dataset.world = s.world; $('app').dataset.level = s.level;
  showScreen('game');
  try { S3.load(s); S3.resize(); } catch (e) { console.error(e); }
  const h = hubPos();
  if (!s.pl || !isFinite(s.pl.x)) s.pl = { x: h.x, z: h.z + 14, yaw: 0, o2: 1 };
  if (s.pl.o2 == null) s.pl.o2 = 1;
  if (s.pl.radioRead == null) s.pl.radioRead = fresh ? 0 : (s.radioN || 0);
  UI.bankT = s.pl.bankT != null ? s.pl.bankT : -1;
  S3.setPlayer(s.pl.x, s.pl.z, s.pl.yaw || 0);

  s3Mode(UI.viewPref === 'drone' ? 'drone' : 'walk');
  S3.setGhost(null); s3Input(true);
  UI.clickWalk = false;
  if (typeof S3.clickWalk === 'function') try { UI.clickWalk = !!S3.clickWalk(true); } catch (e) { UI.clickWalk = false; }
  buildHud();

  if (!fresh) for (const p of s.pending) { UI.seenPid[pidOf(p)] = 1; if (p.type === 'cargo') landShip(p, true); }
  s.look = lookFix(s.look, fresh);
  applyLook(); cosmTick(s, true); UI.rwDot = 0;
  refresh(true);
  if (fresh && !opts.noCreator) openCreator();
  else if (!UI.train && !opts.quiet) showChapter();
  Snd.play('place');
}


const egOn = () => !!mod('EGITIM') && !UI.egSkip;
function egNeeded() { const EG = mod('EGITIM'); if (!EG || UI.egSkip) return false; try { return typeof EG.needed === 'function' ? !!EG.needed(UI.set) : !UI.set.egitim; } catch (e) { return false; } }
function startEgitim(fromMenu) {
  const EG = mod('EGITIM'), s = UI.s; if (!EG || typeof EG.start !== 'function' || !s) return false;
  if (fromMenu) { saveGame(); UI.realS = null; UI.egBack = loadSave() ? 'save' : 'none'; } else { UI.realS = s; UI.egBack = 'real'; }
  UI.egWorld = s.world; UI.egLevel = s.level; UI.egName = s.name || ''; UI.egQuit = false;
  closeModal(); closePda(); if (UI.plan) exitPlan();
  try {
    EG.start({
      world: s.world, name: s.name || '', look: s.look ? JSON.parse(JSON.stringify(s.look)) : lookFix(prof().look, true),
      enter(ts) { UI.train = true; if (ts) { ts.train = true; if (!ts.look) ts.look = lookFix(s.look); if (ts.name == null) ts.name = s.name; } enterGame(ts, true, { noCreator: true }); },
      finish(done) { egFinish(done); },
    });
  } catch (e) { console.error(e); UI.train = false; return false; }
  return true;
}
function egFinish(done) {
  UI.train = false;
  if (UI.egQuit) { UI.realS = null; return; }
  UI.set.egitim = 1; saveSettings();

  try { if (UI.pda) closePda(); if (UI.modal && UI.modal !== 'end') closeModal(); } catch (e) {   }
  let s = null, fresh = true;
  if (UI.egBack === 'save') { s = loadSave(); fresh = false; }
  else if (UI.egBack === 'real') s = UI.realS;
  UI.realS = null;
  if (!s) s = newMission(UI.egWorld || UI.world, UI.egLevel || UI.level, UI.egName);
  enterGame(s, fresh, { noCreator: true, quiet: true });
  if (done) { try { if (typeof noteTag === 'function') noteTag(s, 'x:egitim'); else { s.tags = s.tags || {}; s.tags['x:egitim'] = s.t; } } catch (e) {   } }

  let skipped = false; try { const EG = mod('EGITIM'); skipped = !!(EG && EG.last && Array.isArray(EG.last.skipped) && EG.last.skipped.includes('*')); } catch (e) { skipped = false; }
  egDoneShow(s, !!done && !skipped, fresh);
}


const missionTxt = s => { const mg = callExt('missionGoal', s), W = WORLDS[s.world]; return mg ? tx(mg) : T('goalTxt', W.missionDays, dayUnit(W, W.missionDays)); };
function egSummary() {
  const EG = mod('EGITIM'); let l = null;
  if (EG && typeof EG.summary === 'function') { try { l = EG.summary(); } catch (e) { l = null; } }
  UI.egFacts = l && Array.isArray(l.facts) ? l.facts.map(x => (typeof x === 'string' ? x : x ? tx(x) : '')).filter(Boolean).slice(0, 4) : [];
  if (!Array.isArray(l) || !l.length) l = [{ icon: 'build', text: T('egdL1') }, { icon: 'scan', text: T('egdL2') }, { icon: 'o2', text: T('egdL3') }];
  return l.slice(0, 5).map(it => ({ icon: it && it.icon, text: it ? (typeof it.text === 'string' ? it.text : tx(it.text)) : '' })).filter(it => it.text);
}
function egDoneShow(s, done, fresh) {
  const el = $('egDone'); if (!el || !s) { if (fresh) missionStart(s); else showChapter(); return; }
  UI.egDone = { done, fresh };
  closeModal(); closePda(); if (UI.plan) exitPlan(); scanStop(); s3Input(false);
  const icn = n => { const S = iconSet(); return n && (IC[n] || (S && S[n])) ? ico(n) : ico('check'); };
  const learn = done ? `<div class="egd-l"><small>${T('egdLearn')}</small><ul>${egSummary().map(it => `<li>${icn(it.icon)}<span>${esc(it.text)}</span></li>`).join('')}</ul>${(UI.egFacts || []).length ? `<p class="eg-facts"><small>${T('egdFacts')}</small>${UI.egFacts.map(t => `<span>${esc(t)}</span>`).join('')}</p>` : ''}</div>` : `<p class="egd-again">${T('egdAgain')}</p>`;
  const go = fresh ? T('egdGo') : T('egdBack');
  el.innerHTML = `<div class="egd-box" role="dialog" aria-modal="true" aria-labelledby="egdH">
    <div class="egd-burst" aria-hidden="true">${ico(done ? 'trophy' : 'rocket')}</div>
    <h2 id="egdH">${done ? T('egdT') : T('egdSkipT')}</h2>${done ? '' : `<p class="egd-sub">${T('egdSkipD')}</p>`}
    ${learn}
    <div class="egd-now"><small>${T('egdNow')}</small><b>${esc(missionTxt(s))}</b>${fresh ? `<p class="eg-new">${T('egdNew')}</p>` : ''}</div>
    <button class="primary big" id="egDoneGo" data-act="egDoneGo">${ico('play')} ${go}</button></div>`;
  el.hidden = false; $('hud').classList.add('egd');
  Snd.play(done ? 'win' : 'good');
  try { $('egDoneGo').focus({ preventScroll: true }); } catch (e) {   }
}
function egDoneGo() {
  const st = UI.egDone; if (!st) return;
  UI.egDone = null; const el = $('egDone'); if (el) { el.hidden = true; el.innerHTML = ''; } $('hud').classList.remove('egd');
  s3Input(true); Snd.play('click');
  const s = UI.s; if (!s) return;
  if (st.fresh) missionStart(s); else showChapter();
  refresh(true);
}

function missionStart(s) {
  showChapter();
  renderObjective();
}

function newMission(world, level, name) {
  const ach = Object.assign({}, prof().ach);
  const s = newGame(world, level, (Date.now() % 2147483647) | 0, name || '', { ach });
  if (!s.achP) s.achP = Object.assign({}, ach);
  s.look = lookFix(prof().look, true);
  return s;
}


function ring(id, label, act, v) {
  const tip = id === 'guc' ? T('ringTipG') : ['o2', 'su', 'gida'].includes(id) ? T('ringTip', label) : label;
  return `<button class="ring" id="g-${id}" data-act="${act}" data-v="${v || id}" title="${tip}" aria-label="${label}" style="--c:var(--c-${id === 'o2' ? 'o2' : id})">
    <svg viewBox="0 0 44 44" aria-hidden="true"><circle class="rbk" cx="22" cy="22" r="18.5"/><circle class="rf" cx="22" cy="22" r="18.5" pathLength="100"/></svg>
    <span class="ri">${ico(RES_IC[id])}</span><b></b><small>${label}</small></button>`;
}
const CHIPS = [['malzeme', 'chipM'], ['parca', 'chipP', 'chipPs'], ['bilim', 'chipB'], ['ekip', 'chipE'], ['moral', 'chipMo']];


function buildHud() {
  $('hudTL').innerHTML = `<div class="clockbox"><canvas id="sky" width="60" height="36"></canvas><div class="clock"><b id="dayLbl"></b><span id="timeLbl"></span></div></div>`;

  $('hudTR').innerHTML = ['malzeme', 'parca', 'bilim'].map(c => `<button class="mchip" id="m-${c}" data-act="chip" data-v="${c}" title="${T('c_' + c)}" aria-label="${T('c_' + c)}">${badge(c)}<b></b></button>`).join('');
  $('gauges').innerHTML = ring('o2', T('ring_o2'), 'chip') + ring('su', T('c_su'), 'chip') + ring('gida', T('c_gida'), 'chip') + ring('guc', T('c_guc'), 'chip') +
    `<span class="gsep"></span>` + ring('suit', T('c_suit'), 'suit') +
    `<button class="radm" id="g-doz" data-act="chip" data-v="doz" title="${T('c_doz')}">${badge('doz')}<span class="rtx"><small>${T('c_doz')}</small><b></b></span><i class="rbar"><i></i></i></button>`;

  $('acts').innerHTML = `<span class="ctxslot"><button class="abtn ctx" id="ctxAct" hidden>${ico('scan')}<span></span></button></span>
    <button class="abtn kur" data-act="buildMenu" title="${T('buildTip')}" aria-label="${T('k_build')}">${ico('build')}<span>${T('k_build')}</span>${kh('B')}<em id="kurM"></em></button>
    <button class="abtn sq" id="speedBtn" data-act="speedCycle" title="${T('speedBtn')} (P · 1 · 2 · 3)" aria-label="${T('speedBtn')}"></button>
    <button class="abtn menu" id="menuBtn" data-act="pda" title="${T('menuBtn')} (Tab)" aria-label="${T('menuBtn')}">${ico('tablet')}<span>${T('menuBtn')}</span>${kh('Tab')}<i class="badge" id="pdaBadge" hidden></i></button>`;

  const hasMap = !!mod('HARITA');
  const tool = (act, ic, lbl, id, extra) => `<button class="tbtn" ${id ? `id="${id}"` : ''} data-act="${act}" ${extra || ''}>${ico(ic)}<span>${lbl}</span>${id === 'radioBtn' ? '<i class="badge" id="radioBadge" hidden></i>' : id === 'aWd' ? '<i class="badge" id="wdBadge" hidden></i>' : ''}</button>`;
  $('pdaStat').innerHTML = `<div class="ps-goal"><b id="psGoal"></b><span id="psDay"></span><i class="mbar"><i id="mbarFill"></i></i></div>
    <div class="ps-res">${CHIPS.map(([c, l, sh]) => `<button class="rchip" id="r-${c}" data-act="chip" data-v="${c}" title="${T(l)}">${badge(c)}<span class="rcv"><b></b><small>${T(l)}</small>${sh ? `<small class="sh">${T(sh)}</small>` : ''}</span></button>`).join('')}
      <div class="shipc" id="shipBox" title="${T('ship')}">${badge('kargo')}<span><small>${T('ship')}</small><b id="shipLbl"></b></span></div></div>
    <div class="ps-tools">${tool('radioLog', 'radioLog', T('k_radio'), 'radioBtn')}${tool('wardrobe', 'helmet', T('wd_title'), 'aWd')}${tool('view', 'eye', T('tb_view'), 'aView')}
      ${hasMap ? '' : tool('mapT', 'compass', T('tb_map'), 'mapBtn')}${tool('how', 'info', T('tb_help'))}${tool('src', 'flask', T('sources'))}
      ${tool('sound', UI.sound ? 'sound' : 'mute', T('tb_sound') + (UI.sound ? '' : ' ✕'), 'soundBtn')}${tool('lang', 'globe', T('tb_lang'))}
      ${tool('tutAgain', 'school', T('tb_train'), 'trainBtn')}${tool('quit', 'home', T('tb_quit'))}</div>
    ${hasMap ? '<div class="ps-keys"><span id="keys"></span></div>' : `<div class="ps-map" id="psMap" ${UI.mapOn ? '' : 'hidden'}><canvas id="radar" width="150" height="150"></canvas><span id="keys"></span></div>`}`;
  bindCtx($('ctxAct')); uiApplyKeys();
  UI.cache = {};
}

function bindCtx(el) {
  if (!el) return;
  const down = e => { if (!UI.ctxA || UI.ctxA.t !== 'scan') return; e.preventDefault(); scanStart(); }, up = () => { if (UI.ctxA && UI.ctxA.t === 'scan') scanRelease(); };
  el.addEventListener('pointerdown', down); el.addEventListener('pointerup', up); el.addEventListener('pointerleave', up); el.addEventListener('pointercancel', up);
  el.addEventListener('click', e => { e.stopPropagation(); const a = UI.ctxA; if (!a || a.t === 'scan') return; ctxRun(a); });
}
function bindHold(el) {
  if (!el) return;
  const down = e => { e.preventDefault(); scanStart(); }, up = () => scanRelease();
  el.addEventListener('pointerdown', down); el.addEventListener('pointerup', up); el.addEventListener('pointerleave', up); el.addEventListener('pointercancel', up);
}

function ctxPick() {
  const s = UI.s; if (!s || UI.plan || UI.modal || UI.pda || s.over) return null;
  const S = UI.gl && typeof S3 !== 'undefined' ? S3 : null;
  if (S && S.driving) return { t: 'exit', ic: 'walk' };
  const c = UI.ctx;
  if (c && c.r && c.r.near) return { t: 'fix', ic: 'wrench' };

  if (!UI.scanH && S && typeof S.nearRover === 'function' && typeof S.drive === 'function' && featIs('surus') && safeB(() => { const d = S.nearRover(); return isNum(d) && d <= 5; })) return { t: 'drive', ic: 'rover' };
  if (UI.scanH || (c && c.f) || (kasif() && scanLatchF())) return { t: 'scan', ic: 'scan' };
  if (c && c.e && (c.e.type === 'ship' || c.e.type === 'collect')) return { t: 'use', ic: 'hand' };
  if (S && typeof S.nearRover === 'function' && typeof S.drive === 'function' && featIs('surus')) { let d = null; try { d = S.nearRover(); } catch (e) { d = null; } if (isNum(d) && d < 12) return { t: 'drive', ic: 'rover' }; }
  if (topView() && featIs('dron') && ext('droneScout')) return { t: 'drone', ic: 'compass', on: !!UI.droneArm };
  return null;
}
function ctxRun(a) {
  const s = UI.s; if (!s || !a) return;
  if (a.t === 'fix') repairAim();
  else if (a.t === 'use') interact();
  else if (a.t === 'scan') { scanStart(); if (UI.scanH && !UI.scanH.latch) setTimeout(scanRelease, SCAN_MS + 120); }
  else if (a.t === 'drive' || a.t === 'exit') {
    let ok = false; try { ok = !!S3.drive(a.t === 'drive'); } catch (e) { ok = false; }

    if (!ok && a.t === 'drive') { const V = S3.rover; if (V && typeof S3.walkTo === 'function') { S3.walkTo(V.x, V.z); UI.driveWant = performance.now() + 10000; Snd.play('click'); UI._ctxK = null; return; } }
    if (ok) { Snd.play('click'); subLocal('atlas', T(a.t === 'drive' ? 'driveOn' : 'driveOff'), 'info', true); } else Snd.play('no');
  } else if (a.t === 'drone') { UI.droneArm = !UI.droneArm; Snd.play('click'); if (UI.droneArm) toast(T('droneArm'), 'info'); }
  UI._ctxK = null;
}
function renderCtx() {
  const el = $('ctxAct'); if (!el) return;
  const a = ctxPick(); UI.ctxA = a;
  const k = a ? a.t + (a.on ? '1' : '') + LANG : '';
  if (UI._ctxK === k) return; UI._ctxK = k;
  el.hidden = !a; if (!a) return;
  el.dataset.t = a.t; el.classList.toggle('on', !!a.on);
  const key = { scan: 'F', fix: 'R', use: 'E' }[a.t];
  el.title = T('ctx_' + a.t) + (key && !UI.touch ? ` (${key})` : '');
  el.innerHTML = `${ico(a.ic)}<span>${T('ctx_' + a.t)}</span>`;
}
function renderSpeed() {
  const el = $('speedBtn'); if (!el) return;
  const k = UI.speed + '|' + LANG; if (el._k === k) return; el._k = k;
  el.innerHTML = (UI.speed === 0 ? ico('play') : `<b>${UI.speed}×</b>`) + kh('P');
  el.dataset.v = UI.speed; el.classList.toggle('paused', UI.speed === 0);
}

function speedCycle() {

  const order = [1, 2].concat(featIs('hiz4') ? [4] : []);
  const i = order.indexOf(UI.speed), nx = i < 0 ? 1 : order[(i + 1) % order.length];
  setSpeed(SPEEDS.indexOf(nx));
}
function setRing(id, frac, txt, state) {
  const el = $('g-' + id); if (!el) return;
  const k = Math.round(frac * 100) + '|' + txt + '|' + state;
  if (el._k === k) return; el._k = k;
  el.querySelector('.rf').style.strokeDasharray = `${clamp(frac, 0, 1) * 100} 100`;
  el.querySelector('b').textContent = txt; el.dataset.state = state || '';
}
function setTxt(id, v, state) { const el = $(id); if (!el) return; if (el._k !== v + state) { el._k = v + state; el.querySelector('b').textContent = v; el.dataset.state = state || ''; } }
const mutInfo = s => { if (typeof mutinyInfo !== 'function') return null; try { return mutinyInfo(s); } catch (e) { return null; } };
const radFrac = s => clamp((typeof dosePct === 'function' ? dosePct(s) / 100 : s.dose / LIMIT_DOSE), 0, 1);
function updateHud() {
  const s = UI.s, W = WORLDS[s.world];
  cosmTick(s); achTick(s);

  $('hud').classList.toggle('egtrain', !!s.train);
  $('dayLbl').textContent = `${tx(W.dayWord)} ${dayOf(s)}`;
  const sun = s.pw && s.pw.sun != null ? s.pw.sun : 1;
  $('timeLbl').textContent = String(hourOf(s)).padStart(2, '0') + ':' + String(Math.floor(UI.frac * 60)).padStart(2, '0');
  $('timeLbl').title = T(sun > 0.05 ? 'dayT' : 'nightT');
  $('mbarFill').style.width = clamp(s.t / (W.missionDays * 24) * 100, 0, 100) + '%';
  { const pd = $('psDay'); if (pd) pd.textContent = s.free ? `${tx(W.dayWord)} ${dayOf(s)}` : T('tb_day', tx(W.dayWord), dayOf(s), W.missionDays); }
  { const pg = $('psGoal'); if (pg) { const mg = callExt('missionGoal', s), t = mg ? tx(mg) : T('goalTxt', W.missionDays, dayUnit(W, W.missionDays)); if (pg.textContent !== t) pg.textContent = t; } }
  const cargoP = s.pending.find(p => p.type === 'cargo');
  $('shipLbl').textContent = cargoP ? T('shipWait') : fmtH(s.shipAt - s.t);
  $('shipBox').classList.toggle('on', !!cargoP);
  const sky = $('sky'); if (sky) drawSky(sky, s, s.t + UI.frac);
  renderSpeed();
  { const km = $('kurM'); if (km) { const v = num(Math.floor(s.res.malzeme)); if (km.textContent !== v) km.textContent = v; } }

  for (const r of ['o2', 'su', 'gida']) {
    const dl = (s.rate[r].c || s.rate[r].p) ? daysLeft(s, r) : s.res[r] / Math.max(1e-6, s.pop * NEED[r]);
    setRing(r, dl === Infinity ? 1 : dl / 15, dl === Infinity || dl > 30 ? '30+ ✓' : num(dl, dl < 10 && !kasif() ? 1 : 0),   s.short[r] || dl < 3 ? 'bad' : dl < 8 ? 'warn' : 'ok');
  }
  const bat = s.stored / Math.max(1, s.pw.cap);
  setRing('guc', bat, pct(bat), s.pw.shed ? 'bad' : (s.pw.gen < s.pw.need && bat < 0.3 ? 'warn' : 'ok'));
  const o2 = s.pl ? s.pl.o2 : 1;
  setRing('suit', o2, pct(o2), o2 < 0.15 ? 'bad' : o2 < 0.3 ? 'warn' : 'ok');
  $('g-suit').classList.toggle('fill', !!s.pl && UI.gl && nearAir(s) && o2 < 0.999);

  const flareOn = s.t < (s.fx.lockUntil || 0) || s.pending.some(p => p.id === 'flare');
  const ks = kasif(), showSuit = !ks || ((UI.mode === 'walk' || UI.clickWalk) && o2 < 0.999), showRad = !ks || radFrac(s) >= 0.5 || flareOn;
  $('g-suit').hidden = !showSuit; $('g-doz').hidden = !showRad; $('gauges').querySelector('.gsep').hidden = !showSuit && !showRad;
  const dz = $('g-doz'), dk = Math.round(s.dose) + '|' + ks + LANG;
  if (dz._k !== dk) { dz._k = dk; dz.querySelector('b').textContent = ks ? T('radPctS', Math.round(radFrac(s) * 100)) : `${num(s.dose)} mSv`; dz.querySelector('.rbar i').style.width = radFrac(s) * 100 + '%'; dz.dataset.state = s.dose >= 450 ? 'bad' : s.dose >= 300 && s.world === 'ay' ? 'warn' : ''; }

  setTxt('r-malzeme', num(Math.floor(s.res.malzeme)), '');
  setTxt('r-parca', num(Math.floor(s.res.parca)), '');
  setTxt('r-bilim', num(Math.floor(s.res.bilim)), TECH_ORDER.some(id => techState(s, id) === 'ok') ? 'good' : '');
  setTxt('m-malzeme', num(Math.floor(s.res.malzeme)), ''); setTxt('m-parca', num(Math.floor(s.res.parca)), ''); setTxt('m-bilim', num(Math.floor(s.res.bilim)), '');
  setTxt('r-ekip', `${s.pop}/${beds(s)}`, s.pop > beds(s) ? 'warn' : '');
  const mi = mutInfo(s), mut = mi && mi.lvl >= 1;
  setTxt('r-moral', num(s.moral), mut ? 'mut' : s.moral < 35 ? 'bad' : s.moral < 50 ? 'warn' : '');
  const ml = $('r-moral') && $('r-moral').querySelector('small'); if (ml) { const t = mut ? T('mutChip') : T('chipMo'); if (ml.textContent !== t) ml.textContent = t; }

  setBadge('radioBadge', unreadN(s) + s.pending.length);

  setBadge('pdaBadge', badgeCount(s) + (UI.rwDot || 0) + (UI.achDot || 0) + (UI.pda === 'defter' ? 0 : ogFresh())); setBadge('wdBadge', UI.rwDot || 0);
  renderStrip();
  const kk = UI.mode + LANG, ke = $('keys'); if (ke && ke._k !== kk) { ke._k = kk; ke.textContent = UI.touch ? '' : T(UI.mode === 'walk' ? 'keysWalk' : 'keysDrone'); }
  const av = $('aView'), vk = UI.mode + LANG;
  if (av && av._k !== vk) { av._k = vk; av.querySelector('svg').outerHTML = ico(UI.mode === 'walk' ? 'eye' : 'walk'); av.querySelector('span').textContent = T(UI.mode === 'walk' ? 'k_view' : 'k_viewWalk'); }
  const tb = $('trainBtn'); if (tb && tb.hidden !== !!UI.train) tb.hidden = !!UI.train;
}
function setBadge(id, n) { const be = $(id); if (!be || be._k === n) return; be._k = n; be.hidden = !n; if (id === 'pdaBadge') { be.textContent = ''; be.classList.add('dotb'); be.title = String(n); return; } be.textContent = n > 9 ? '9+' : n; }
function badgeCount(s) {
  let n = 0;
  if (typeof bankEntries === 'function') for (const e of bankEntries(s)) if (e.open && s.bank && s.bank[e.id] > UI.bankT) n++;
  if (s.quiz) n += s.quiz.open.filter(q => s.quiz.done[q] == null).length;
  return n;
}

function renderStrip() {
  const s = UI.s;
  renderObjective();
  const W = WORLDS[s.world];

  let ban = '', bc = '', bt = '';
  if (UI.speed === 0 && !UI.modal && !UI.pda && !UI.plan) { ban = T('ban_pause'); bt = UI.touch ? T('pausedT') : T('paused'); bc = 'pause'; }
  else if (s.t < (s.fx.lockUntil || 0)) { ban = T('ban_flare'); bt = T('flareB'); bc = 'flare'; }
  else if (stormOn(s)) { ban = T('ban_storm'); bt = T('stormB', fmtH(s.storm.until - s.t)); bc = 'storm'; }
  else if (W.night && hoursToNight(s) === 0) { ban = T('ban_night'); bt = T('nightB', fmtH(W.night.len * 24 - nightPhase(s, s.t))); bc = 'night'; }
  else if (inConj(s)) { ban = T('ban_conj'); bt = T('conjB'); bc = 'conj'; }
  const IK = mod('ISKART'), calls = callList(s).filter(p => !(IK && typeof IK.showing === 'function' && safeB(() => IK.showing(pidOf(p))))), obj = $('objective'), ks = kasif() && !UI.tut;
  let showObj = !obj.hidden, showBan = !!ban, nCalls = calls.length, hidden = 0;
  if (ks) {
    const objBad = obj.dataset.c === 'bad';

    if (bc === 'pause') { hidden = nCalls; nCalls = 0; }
    else if (nCalls) { hidden = (showBan ? 1 : 0) + nCalls - 1; showBan = false; nCalls = 1; }
    else if (objBad && showBan) { hidden = 1; showBan = false; }
  }
  if (UI.tut) { showBan = bc === 'pause'; nCalls = 0; }
  obj.classList.toggle('off', !showObj);
  const BAN_IC = { pause: 'pause', flare: 'flare', storm: 'storm', night: 'night', conj: 'radio' };
  const bn = $('banner'), bk = ban + showBan + bt; if (bn._k !== bk) { bn._k = bk; bn.innerHTML = ban ? `${ico(BAN_IC[bc] || 'info')}<span>${esc(ban)}</span>` : ''; bn.title = bt; bn.hidden = !showBan; bn.dataset.c = bc; }
  renderCalls(calls.slice(0, nCalls), hidden);
  renderEffects(s);
}
const safeB = f => { try { return !!f(); } catch (e) { return false; } };
const safeN = f => { try { const v = f(); return isNum(v) ? +v : Infinity; } catch (e) { return Infinity; } };


const roverAt = () => { try { const r = UI.gl && S3.rover; return r && isFinite(r.x) && isFinite(r.z) ? { x: r.x, z: r.z } : null; } catch (e) { return null; } };
const GOAL_IC = { build: 'build', scan: 'scan', repair: 'wrench', ship: 'rocket', call: 'radio', walk: 'walk', wait: 'clock' };

const GOAL_HOW = { build: { tr: 'Kur düğmesine bas.', en: 'Press Build.' }, scan: { tr: 'Yanına git, İncele\'ye bas.', en: 'Walk there, press Scan.' }, repair: { tr: 'Yanına git, Onar\'a bas.', en: 'Walk there, press Repair.' } };
const words = t => String(t || '').split(/\s+/).filter(Boolean);
const capWords = (t, n) => { const w = words(t); return w.length <= n ? w.join(' ') : w.slice(0, n).join(' ').replace(/[,;:.]+$/, '') + '…'; };
function goalNow(s) {
  const EG = UI.train ? mod('EGITIM') : null;
  if (EG && typeof EG.goal === 'function') {
    let g = null; try { g = EG.goal(); } catch (e) { g = null; }
    if (g && g.text) return { id: 'eg:' + (g.i != null ? g.i : g.text), text: capWords(tx(g.text), 5), why: null, ic: 'school', at: g.at && isNum(g.at.x) ? { x: g.at.x, z: g.at.z } : null, c: 'tut', eg: g };
    if (EG.active && safeB(() => EG.active())) return null;
  }
  const cg = UI.cgOver !== undefined ? UI.cgOver : callExt('currentGoal', s);

  if (kasif() && !s.train && !(cg && cg.urgent)) for (const r of ['o2', 'su', 'gida']) {
    const dl = safeN(() => daysLeft(s, r)), fk = FIX_K[r];
    if (!(dl < 4) || !fk || !BLD[fk] || (cg && cg.bk === fk)) continue;
    if (typeof unlockedB === 'function' && !safeB(() => unlockedB(s, fk).ok)) continue;
    const k = typeof BLD_K !== 'undefined' && BLD_K[fk] ? tx(BLD_K[fk]) : tx(bname(s, fk));
    return { id: 'low:' + r, text: capWords(k, 5), why: T('lowWhy', T(r === 'o2' ? 'ring_o2' : 'c_' + r)) + ' ' + tx(GOAL_HOW.build), ic: 'build', at: null, c: 'warn' };
  }
  if (cg && cg.k) return { how: cg.how ? capWords(tx(cg.how), 8) : null, id: String(cg.id != null ? cg.id : tx(cg.k)), text: capWords(tx(cg.k), 5), why: [cg.why ? tx(cg.why) : '', GOAL_HOW[cg.act] ? tx(GOAL_HOW[cg.act]) : ''].filter(Boolean).join(' ') || null, ic: GOAL_IC[cg.act] || 'star', at: isNum(cg.tx) && isNum(cg.ty) ? wpos(cg.tx, cg.ty) : (cg.id === 'sur' ? roverAt() : null), c: cg.urgent ? 'warn' : 'info' };
  let adl = []; try { adl = advice(s) || []; } catch (e) { adl = []; }
  const ad = adl[0]; if (!ad) return null;
  const full = tx(ad.m), first = (full.replace(/^\s*(Sıradaki hedef|Next goal)\s*:\s*/i, '').match(/^[^.!?]+/) || [full])[0].trim();
  return { id: 'ad:' + first, text: capWords(first, 5), why: full, ic: ad.c === 'bad' || ad.c === 'warn' ? 'info' : 'star', at: null, c: ad.c };
}
function renderObjective() {
  const s = UI.s, el = $('objective'); let h, c = '';
  if (!UI.tut) {
    const g = goalNow(s); UI.goal = g;
    const id = g ? g.id : null;
    if (id !== UI.goalId) { if (UI.goalId != null && id != null) UI.goalFlip = performance.now() + 700; UI.goalId = id; UI.goalT0 = performance.now(); }
    const flip = UI.goalFlip > performance.now();
    uiHowUpd(g); $('hud').classList.toggle('egtrain', !!(s && s.train));
    const stp = g && g.eg && isNum(g.eg.i) && isNum(g.eg.n) ? `<span class="o-step">${T('egStepN', g.eg.i + 1, g.eg.n)}</span>` : '';
    h = g ? `${stp}<span class="o-ic">${ico(flip ? 'check' : g.ic)}</span><span class="o-msg">${esc(g.text)}</span>` : '';
    c = g ? (g.c || 'info') + (flip ? ' flip' : '') : '';
    goalMark(g);
    if (el._k !== h + c) { el._k = h + c; el.innerHTML = h; el.dataset.c = c; el.hidden = !h; el.dataset.act = 'goalWhy'; el.title = T('goalTap'); }
    return;
  }
  el.removeAttribute('data-act');
  if (UI.tut) {
    const st = TUT[UI.tut.step], okNow = UI.tut.okT && performance.now() - UI.tut.okT < 900;
    let msg = tutMsg(s, st);
    if ((st === 'walk' || st === 'look') && UI.mode !== 'walk') msg = T(UI.touch ? 'tutWalkModeT' : 'tutWalkMode') + ' ' + msg;
    const btn = st === 'time' ? `<button class="o-go" data-act="tutPlay">${T('tutPlay')}</button>` : TUT_INFO[st] ? `<button class="o-go" data-act="tutGot">${T('tutGot')} ›</button>` : '';
    h = `<span class="o-tag">${T('tutTitle')} ${UI.tut.step + 1}/${TUT.length}</span><span class="o-msg">${esc(msg)}</span>${okNow ? `<span class="o-ok">${ico('check')}</span>` : btn}
      ${performance.now() - UI.tut.t0 > 12000 && !TUT_INFO[st] && st !== 'time' ? `<button class="o-skip" data-act="tutNext">${T('tutNext')} ›</button>` : ''}<button class="o-skip" data-act="tutSkip">${T('tutSkip')}</button>`;
    c = 'tut' + (okNow ? ' ok' : '');
  }
  if (el._k !== h + c) { el._k = h + c; el.innerHTML = h; el.dataset.c = c; el.hidden = !h; }
}


function uiHowUpd(g) {
  const el = $('objHow'); if (!el) return;
  const show = !!(g && g.how && !UI.plan && (performance.now() - (UI.goalT0 || 0) > 25000 || UI.howOpen === g.id));
  const t = show ? g.how : ''; if (el._t !== t) { el._t = t; el.innerHTML = t ? `${ico('info')} ${esc(t)}` : ''; el.hidden = !t; }
}
function goalMark(g) {
  const at = g && g.at ? g.at : null, k = at ? Math.round(at.x) + ',' + Math.round(at.z) : '';
  UI.goalAt = at;
  if (UI.setGoalK === k) return; UI.setGoalK = k;
  if (UI.gl && typeof S3 !== 'undefined' && typeof S3.setGoal === 'function') try { S3.setGoal(at ? { x: at.x, z: at.z } : null); } catch (e) { console.error(e); }
}
function goalWhy() {
  const g = UI.goal; if (!g) return;
  if (g.how) { UI.howOpen = g.id; uiHowUpd(g); }
  Snd.play('click');
  if (g.why) subLocal('atlas', g.why, 'info', true);
  if (g.at && UI.gl && typeof S3.ping === 'function') try { S3.ping(g.at.x, g.at.z); } catch (e) {   }
}
const EFF_RES = { tozlu: 'guc', temiz: 'guc', hortum: 'guc', firtina: 'guc', gece: 'guc', kuf: 'gida', izin: 'moral', mesgul: 'ekip' };
function renderEffects(s) {
  const el = $('effects'); if (!el) return;
  let list = [];
  if (typeof activeEffects === 'function') try { list = activeEffects(s) || []; } catch (e) { list = []; }
  const bc = $('banner').hidden ? '' : $('banner').dataset.c, dup = { night: 'gece', storm: 'firtina', flare: 'siginak' }[bc];
  if (dup) list = list.filter(e => e.id !== dup);
  const max = kasif() ? 2 : 3;

  const iconOnly = kasif();
  const h = list.slice(0, max).map(e => { const rk = EFF_RES[e.id.split(':')[0]], tip = tx(e.label) + (isNum(e.left) ? ' · ' + fmtH(e.left) : ''); return `<span class="eff${iconOnly ? ' ico' : ''}" data-c="${esc(e.c || 'info')}" title="${esc(tip)}">${rk ? badge(rk) : ico(e.icon || 'clock')}${iconOnly ? '' : `<span>${esc(tx(e.label))}</span>${isNum(e.left) ? `<em>${fmtH(e.left)}</em>` : ''}`}</span>`; }).join('') + (list.length > max && !iconOnly ? `<span class="eff more">+${list.length - max}</span>` : '');

  const mark = {}; for (const e of list) { const rk = EFF_RES[e.id.split(':')[0]]; if (rk && !mark[rk]) mark[rk] = e.c === 'good' ? 'pos' : e.c === 'info' ? '' : 'neg'; }
  for (const rk of ['guc', 'gida', 'moral', 'ekip']) { const re = $(rk === 'moral' || rk === 'ekip' ? 'r-' + rk : 'g-' + rk); if (re && (re.dataset.eff || '') !== (mark[rk] || '')) re.dataset.eff = mark[rk] || ''; }
  if (el._k !== h) { el._k = h; el.innerHTML = h; el.hidden = !h || !!UI.tut; }
}


const pidOf = p => (p.pid != null ? p.pid : (p.type + ':' + (p.id || '') + ':' + (p.due || '')));
const CALL_WAIT_MS = 60000;
function callerOf(s, p) { const ev = p.type === 'event' ? EVENTS[p.id] : null; return (ev && ev.from) || (inConj(s) ? 'atlas' : 'mc'); }
const isUrgent = (s, p) => p.type === 'event' && p.due != null && (((EVENTS[p.id] && (EVENTS[p.id].due || 48)) <= 24) || p.due - s.t <= 12);
const callList = s => s.pending.slice().sort((a, b) => (isUrgent(s, b) ? 1 : 0) - (isUrgent(s, a) ? 1 : 0));

function callHold(s) {
  if (!kasif() || UI.tut) return null;
  for (const p of s.pending) if (isUrgent(s, p) && ((UI.callWait || {})[pidOf(p)] || 0) < CALL_WAIT_MS) return p;
  return null;
}
function renderCalls(list, hidden) {
  const s = UI.s, el = $('calls'), big = kasif(), hp = UI.paused === 'call' ? callHold(s) : null, hold = !!hp;
  const h = list.map(p => {
    const left = p.due != null ? fmtH(p.due - s.t) : '';
    if (p.type === 'cargo') return `<button class="call ship${big ? ' big' : ''}" data-act="call" data-v="${esc(pidOf(p))}">${ico('rocket')}<b>${T('shipChip')}</b>${left ? `<em>${left}</em>` : ''}${big ? `<span class="cbtn">${T('shipAnsBig')}</span>` : ''}</button>`;
    const ev = EVENTS[p.id]; if (!ev) return '';
    const tot = (ev.due || 48), fr = p.due != null ? clamp((p.due - s.t) / tot, 0, 1) : 1;
    return `<button class="call${big ? ' big' : ''}${isUrgent(s, p) ? ' urgent' : ''}" data-act="call" data-v="${esc(pidOf(p))}">${ico('radio')}<b>${T('callIn', speakerOf({ from: callerOf(s, p) }).name)}</b><span>${esc(tx(ev.title))}</span>${left ? `<em>${left}</em>` : ''}${UI.touch ? '' : '<kbd>T</kbd>'}${big ? `<span class="cbtn">${T('callAnsBig')}</span>` : ''}<i class="cbar"><i style="width:${Math.round(fr * 100)}%"></i></i>${hold && hp === p ? `<small class="cwait">${ico('pause')} ${T('callWait')}</small>` : ''}</button>`;
  }).join('') + (hidden > 0 ? `<button class="bell" data-act="radioLog" title="${T('k_radio')}">${ico('radioLog')}+${hidden}</button>` : '');
  if (el._k !== h) { el._k = h; el.innerHTML = h; }
}
function pumpCalls() {
  const s = UI.s;
  for (const p of s.pending) {
    const id = pidOf(p);
    if (UI.seenPid[id]) continue;
    UI.seenPid[id] = 1;
    Snd.play('radio');
    if (UI.speed > 1) setSpeed(1, true);
    if (p.type === 'cargo') landShip(p);
  }
  if (UI.ship && !s.pending.some(p => pidOf(p) === UI.ship.pid)) { shipGone(); }
}
function landShip(p, quiet) {
  const s = UI.s, pad = s.b.find(b => b.k === 'pist' && b.left === 0);
  let x = HUBX + 2, y = HUBY + 1;
  if (pad) { x = pad.x; y = pad.y; }
  else { let bd = 1e9; for (let ty = 0; ty < MAPH; ty++) for (let tx2 = 0; tx2 < MAPW; tx2++) { const d = Math.hypot(tx2 - HUBX, ty - HUBY); if (d >= 1.9 && d < bd && isSeen(s, tx2, ty) && !bAt(s, tx2, ty) && tileAt(s, tx2, ty) === '.') { bd = d; x = tx2; y = ty; } } }
  UI.ship = { pid: pidOf(p), tx: x, ty: y };
  try { S3.shipLand(x, y); } catch (e) { console.error(e); }
  if (!quiet) Snd.play('ship');
}
function shipGone() {
  UI.ship = null;
  setTimeout(() => { try { if (UI.s && UI.gl) S3.shipLeave(); } catch (e) {   } }, 2500);
}




const SUB_MS = c => clamp(3000 + c * 100, 6000, 30000);
const subMs = w => Math.max(4000, 2500 + 800 * Math.max(1, w));
const uiReadMs = w => 1000 + 500 * Math.max(1, w | 0);

function splitSub(text, maxW) {
  const mw = maxW || 12, out = [];
  const wc = t => words(t).length;
  const even = ws => { const n = Math.ceil(ws.length / mw), sz = Math.ceil(ws.length / n), r = []; for (let i = 0; i < ws.length; i += sz) r.push(ws.slice(i, i + sz).join(' ')); return r; };
  const chunks = sn => {
    if (wc(sn) <= mw) return [sn];
    const cl = sn.match(/[^,;:]+[,;:]?/g) || [sn], r = []; let cur = '';
    for (const c0 of cl.map(x => x.trim()).filter(Boolean)) {
      if (wc(c0) > mw) { if (cur) { r.push(cur); cur = ''; } r.push(...even(words(c0))); continue; }
      if (cur && wc(cur) + wc(c0) > mw) { r.push(cur); cur = c0; } else cur = cur ? cur + ' ' + c0 : c0;
    }
    if (cur) r.push(cur);

    for (let i = r.length - 1; i > 0; i--) if (wc(r[i]) <= 2 && wc(r[i - 1]) + wc(r[i]) <= mw) { r[i - 1] += ' ' + r[i]; r.splice(i, 1); }
    return r;
  };
  const sents = String(text).split(/\n+/).flatMap(p => p.match(/[^.!?…]+(?:[.!?…]+["'»”)]*|$)/g) || [p]).map(x => x.trim()).filter(Boolean);
  let cur = '';
  for (const sn of sents) for (const ch of chunks(sn)) {
    if (cur && wc(cur) + wc(ch) > mw) { out.push(cur); cur = ch; } else cur = cur ? cur + ' ' + ch : ch;
  }
  if (cur) out.push(cur);
  return out.length ? out : [String(text)];
}
const unreadN = s => { const rd = (s.pl && s.pl.radioRead) || 0; return (s.radio || []).filter(r => r.n > rd).length; };
function markRead(n) { const s = UI.s; if (!s || !s.pl || !isNum(n)) return; if (n > (s.pl.radioRead || 0)) s.pl.radioRead = n; }

function speakerOf(r) {
  const cast = castOf(), from = r.from || 'mc';
  let id = r.who && cast && cast[r.who] ? r.who : null;
  if (!id && cast && (from === 'mc' || from === 'atlas')) id = Object.keys(cast).find(k => cast[k] && cast[k].from === from) || null;
  if (id) { const c = cast[id]; return { id, name: tx(c.name), role: c.role ? tx(c.role) : '', f: c.from || from }; }
  if (from === 'atlas') return { id: 'atlas', name: 'ATLAS', role: T('atlasRole'), f: 'atlas' };
  return { id: from, name: T('fr_' + from), role: '', f: from };
}
function pumpRadio() {
  const s = UI.s; if (!s.radio || s.radioN == null || s.radioN === UI.radioN) return;
  const n = Math.min(s.radioN - UI.radioN, s.radio.length); UI.radioN = s.radioN;
  for (const r of s.radio.slice(-n)) { if (uiPwRadio(r)) { Snd.play('warn'); UI.atlasPing = performance.now() + 1500; continue; } queueSub(r); }
  if (UI.subQ.length > 2 && UI.speed > 1) { UI.spdBack = SPEEDS.indexOf(UI.speed); setSpeed(1, true); toast(T('radioSlow'), 'info'); }
}

const uiPwRadio = r => !!r && r.from === 'atlas' && (UI.poOver !== undefined || !!ext('powerOutlook')) && /^(Elektrik uyarısı|Power warning|Uzun geceye hazır|Ready for the night)$/.test(tx(r.title || ''));

function uiSpeedBack() { if (UI.spdBack > 1 && !UI.sub && !UI.subQ.length && UI.speed === 1) setSpeed(UI.spdBack, true); if (UI.spdBack && !UI.sub && !UI.subQ.length) UI.spdBack = 0; }
function queueSub(r, front) {

  let text = txa(r.text);
  if (r.call != null) text = r.ev ? (speakerOf(r).id === 'atlas' && EVENTS[r.ev] && EVENTS[r.ev].q ? T('atlasQLine')   : T(UI.touch ? 'callLineT' : 'callLine', speakerOf(r).name, tx(r.title), /[.!?…]$/.test(tx(r.title)) ? '' : '.')) : T('shipLine');
  else if (r.res) text += '\n' + tx(r.res);

  const hint = r.hint ? tx(r.hint).replace(/^\s*(İpucu|Tip)\s*:\s*/i, '') : '';
  const parts = splitSub(text).map(t => ({ t, h: false })).concat(hint ? splitSub(hint).map(t => ({ t, h: true })) : []);
  const ins = subInstr(r);
  const at = performance.now(), items = parts.map((p, i) => ({ r, text: p.t, i, n: parts.length, isHint: p.h, hint: '', ins: ins || p.h, at }));

  if (ins) for (let k = UI.subQ.length - 1; k >= 0; k--) if (UI.subQ[k].ins && UI.subQ[k].r !== r) UI.subQ.splice(k, 1);

  if (front) { let at = 0; while (at < UI.subQ.length && UI.sub && UI.subQ[at].r === UI.sub.r) at++; UI.subQ.splice(at, 0, ...items); } else UI.subQ.push(...items);

  while (UI.subQ.length > SUBQ_MAX) {
    let k = -1; for (let j = UI.subQ.length - 1; j >= 0; j--) if (!UI.subQ[j].ins && UI.subQ[j].r !== r && !(UI.sub && UI.subQ[j].r === UI.sub.r)) { k = j; break; }
    if (k < 0) k = UI.subQ.findIndex(x => x.r !== r && !(UI.sub && x.r === UI.sub.r));
    if (k < 0) break;
    const dr = UI.subQ[k].r; for (let j = UI.subQ.length - 1; j >= 0; j--) if (UI.subQ[j].r === dr) UI.subQ.splice(j, 1);
  }
  if (ins && UI.sub && UI.sub.q.ins && UI.sub.r !== r && !UI.tut) UI.sub.left = Math.max(Math.min(UI.sub.left, 1200), uiReadMs(UI.sub.words) - (UI.sub.total - UI.sub.left));
}
const SUBQ_MAX = 3;

const subInstr = r => !!r && (!!r.local || r.call != null || r.def != null || r.c === 'warn' || r.c === 'bad');

function placeSub() {
  const el = $('sub'); if (!el) return;
  const ts = $('toasts');
  if (UI.plan) {
    const tc = $('hudTC'), g = $('game'); let bot = 0;
    if (tc && g) for (const c of [...tc.children, ...document.querySelectorAll('#hudTL')]) { if (c.hidden || getComputedStyle(c).display === 'none') continue; const r = c.getBoundingClientRect(); if (r.height) bot = Math.max(bot, r.bottom - g.getBoundingClientRect().top); }
    const v = bot ? Math.round(bot + 6) + 'px' : ''; if (el.style.top !== v) el.style.top = v;
  }
  if (innerHeight > 460) { if (!UI.plan && el.style.top) el.style.top = ''; if (ts && ts.style.bottom) ts.style.bottom = ''; return; }
  { const dr = $('drawer'), dh = UI.plan && dr && !dr.hidden ? Math.round(dr.getBoundingClientRect().height) : 0, v = dh ? (dh + 18) + 'px' : ''; if (ts && ts.style.bottom !== v) ts.style.bottom = v; }
  if (!UI.plan) { if (el.style.top) el.style.top = ''; return; }
  const tc = $('hudTC'), g = $('game'); if (!tc || !g) return;
  let bot = 0; for (const c of tc.children) { if (c.hidden || getComputedStyle(c).display === 'none') continue; const r = c.getBoundingClientRect(); if (r.height) bot = Math.max(bot, r.bottom); }
  const top = bot ? Math.round(bot - g.getBoundingClientRect().top + 6) : 0, v = top ? top + 'px' : '';
  if (el.style.top !== v) el.style.top = v;
}
function subLocal(from, text, c, front) { queueSub({ from, text, c: c || 'info', local: true }, front); }

const UI_SUB_NEXT_RE = /\s*(Sıradaki|Next)\s*:\s*([^.!?]+)\.?\s*$/;
function uiSubFresh(q) {
  const r = q.r, m = r && r.goal != null && r.call == null ? UI_SUB_NEXT_RE.exec(q.text || '') : null;
  if (!m) return q.text;
  const s = UI.s; let cg = null; try { cg = UI.cgOver !== undefined ? UI.cgOver : callExt('currentGoal', s); } catch (e) { cg = null; }
  const k = cg && cg.k, name = m[2].trim();
  const building = cg && cg.act === 'build' && cg.bk && s && Array.isArray(s.b) && s.b.some(b => b.k === cg.bk && b.left > 0);
  const same = k && !building && [k.tr, k.en, tx(k)].some(v => typeof v === 'string' && v.trim() === name);
  void same; return q.text.slice(0, m.index).trim();
}


const uiSubChat = q => !q.ins && !storyLine(q.r) && ['atlas', 'crew'].includes(speakerOf(q.r).f);
function uiSubPick(now) {
  for (let j = UI.subQ.length - 1; j >= 0; j--) {
    const x = UI.subQ[j]; if (x.ins || !x.at || (UI.sub && x.r === UI.sub.r)) continue;
    if (UI.plan) x.pl = 1;
    const age = now - x.at; if ((x.pl && !UI.plan && age > 60000) || (uiSubChat(x) && age > 45000)) UI.subQ.splice(j, 1);
  }
  return UI.subQ.findIndex(q => (!UI.tut || q.r.local) && (!UI.plan || q.ins) && !(uiSubChat(q) && q.i === 0 && now - (UI.chatT || -1e9) < 25000));
}
function subShow(q) {
  { const ft = uiSubFresh(q); if (ft !== q.text) { if (!ft) { UI.sub = null; UI.subGap = 0; return; } q = Object.assign({}, q, { text: ft }); } }
  const box = $('sub'), r = q.r, sp = speakerOf(r);
  if (sp.id === 'atlas') UI.atlasN++;
  const role = sp.id === 'atlas' && UI.atlasN > 3 ? '' : sp.role, title = r.title && q.i === 0 ? tx(r.title) : '';

  const wn = words(q.text).length, chars = (title + ' ' + q.text).length, dur = Math.min(r.call != null && r.ev ? 30000 : 10000, Math.max(subMs(wn), r.def != null ? 7000 : 0));
  UI.sub = { q, r, left: dur, total: dur, chars, words: wn, t0: performance.now() };
  const cast = castOf(), av = cast && sp.id && cast[sp.id] && sp.id !== 'atlas' ? `<b>${esc(sp.name.charAt(0))}</b>` : ico(FROM_IC[sp.f] || 'radio');
  box.innerHTML = `<span class="s-ic" data-f="${esc(sp.f)}" data-who="${esc(sp.id || '')}">${av}</span><div class="s-body"><div class="s-head"><b class="s-name">${esc(sp.name)}</b>${role ? `<span class="s-role">${esc(role)}</span>` : ''}${title ? `<span class="s-title">${esc(title)}</span>` : ''}<span class="s-cnt" hidden></span></div>
    <p class="s-text${q.isHint ? ' hint' : ''}">${q.isHint ? `<b class="s-hb">${ico('info')}</b> ` : ''}${esc(q.text)}</p><p class="s-wait" hidden>${ico('pause')} ${T('radioWait')}</p></div><button class="s-next" data-act="subNext" title="${T('subNext')} (Enter)" aria-label="${T('subNext')}">›</button>`;
  box.dataset.c = r.def != null ? 'warn' : (r.c || 'info'); box.dataset.def = r.def != null ? '1' : ''; box.hidden = false; box.classList.remove('out');
  box.style.animation = 'none'; void box.offsetWidth; box.style.animation = '';
  subCount();
  Snd.play('radio');
}
function subCount() { const c = $('sub').querySelector('.s-cnt'); if (!c) return; const n = UI.subQ.length; c.hidden = !n; c.textContent = `1/${n + 1}`; }
function subDone(skipped) {
  const box = $('sub'), cur = UI.sub; if (!cur) return;
  if (cur.q.i === cur.q.n - 1 && cur.r.n) markRead(cur.r.n);
  UI.sub = null; box.classList.add('out'); UI.subGap = skipped ? 120 : 650;
  setTimeout(() => { if (!UI.sub) box.hidden = true; }, skipped ? 60 : 300);
}
function subNext() {
  if (!UI.sub) return false;
  subDone(true);
  const q = uiSubPick(performance.now());
  if (q >= 0 && !UI.modal && !UI.pda && !UI.away) { UI.subGap = 0; subShow(UI.subQ.splice(q, 1)[0]); }
  return true;
}

function subTick(dtMs, now) {
  const box = $('sub'), chap = now < UI.chapUntil;
  const ikHide = innerHeight <= 460 && safeB(() => { const m = mod('ISKART'); return !!(m && m.open()); });
  const planHold = !!(UI.plan && UI.sub && !UI.sub.q.ins);
  const freeze = !!(UI.modal || UI.pda || UI.away || UI.speed === 0 || chap || ikHide || UI.egDone || UI.paused === 'quick' || UI.paused === 'map' || planHold);
  box.classList.toggle('held', chap || !!UI.pda || ikHide || planHold);
  if (planHold && !chap) { const k = UI.subQ.findIndex(q => q.ins && (!UI.tut || q.r.local)); if (k >= 0) { const cur = UI.sub.q, nq = UI.subQ.splice(k, 1)[0]; UI.sub = null; UI.subQ.unshift(cur); box.classList.remove('held'); subShow(nq); return; } }
  if (UI.sub) {
    if (UI.subHover) UI.sub.hov = (UI.sub.hov || 0) + dtMs;
    if (!freeze && (!UI.subHover || UI.sub.hov > 8000)) UI.sub.left -= dtMs;
    const w = box.querySelector('.s-wait'); if (w) w.hidden = UI.paused !== 'radio';
    if (UI.sub.left <= 0) subDone(false);
    return;
  }
  if (freeze || !UI.subQ.length) return;
  if (UI.subGap > 0) { UI.subGap -= dtMs; return; }

  const i = uiSubPick(now); if (i < 0) return;
  const nq = UI.subQ.splice(i, 1)[0]; if (uiSubChat(nq) && nq.i === 0) UI.chatT = now;
  subShow(nq);
}



const storyLine = r => !!r && !r.local && r.call == null && ((typeof r.beat === 'string' && !/^r:/.test(r.beat)) || r.from === 'kayit');
const HOLD_MAX = 24 * HOUR_S / 3;
const radioHold = () => kasif() && !!UI.sub && storyLine(UI.sub.r) && !((UI.holdS || 0) >= HOLD_MAX);




function uiChapPlace(el) {
  const hud = $('hud'); if (!el || !hud) return;
  const tp = UI.mode !== 'plan'; el.classList.toggle('tp', tp);
  if (!tp) { el.style.removeProperty('--chTop'); el.style.removeProperty('--chMax'); return; }
  const H = hud.getBoundingClientRect(), R = id => { const e = $(id); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return r.width && r.height ? r : null; };
  const tc = R('objective') || R('hudTC'); let top = tc ? tc.bottom - H.top + 6 : 12;
  const ob = R('objHow'); if (ob && tc && ob.top < tc.bottom + 40) top = Math.max(top, ob.bottom - H.top + 6);
  const cx = H.left + H.width / 2, est = H.height < 460 ? 64 : 120; let half = H.width / 2 - 12;
  ['hudTL', 'hudTR'].forEach(id => { const e = $(id); if (!e) return; [...e.children, e].forEach(c => {
    const r = c.getBoundingClientRect(); if (!r.width || !r.height || r.top - H.top > top + est || r.bottom - H.top < top) return;
    half = Math.min(half, r.left > cx ? r.left - cx - 8 : r.right < cx ? cx - r.right - 8 : half); }); });
  el.style.setProperty('--chTop', Math.round(top) + 'px'); el.style.setProperty('--chMax', Math.max(240, Math.round(half * 2)) + 'px');
}
function showChapter(idx) {
  const s = UI.s, st = story(s); if (!st || !st.chapters) return;
  const i = idx != null ? idx : (s.story ? s.story.ch : (s.fx.chapter || 0)) || 0, ch = st.chapters[i]; if (!ch) return;
  const el = $('chapter');
  el.innerHTML = `${i === 0 && st.title ? `<small class="ch-story">${esc(tx(st.title))}</small>` : ''}<small>${T('chapterN', i + 1)}</small><h2>${esc(tx(ch.name))}</h2>${ch.sub ? `<p>${esc(tx(ch.sub))}</p>` : ''}${ch.goal ? `<p class="ch-goal">${esc(tx(ch.goal))}</p>` : ''}`;
  el.hidden = false; el.classList.remove('go'); uiChapPlace(el); void el.offsetWidth; el.classList.add('go');
  setTimeout(() => { if (!el.hidden) uiChapPlace(el); }, 250);
  UI.chapUntil = performance.now() + 8000;
  clearTimeout(UI.chapTO); UI.chapTO = setTimeout(() => { el.hidden = true; }, 8800);
  el.onclick = () => { el.hidden = true; UI.chapUntil = 0; clearTimeout(UI.chapTO); };
  Snd.play('chapter');
  UI.chapT = s.fx.chapterT != null ? s.fx.chapterT : UI.chapT;
}




const TOAST_MAX = 1, TOAST_GAP = 4000, TOAST_DUP = 30000;
function uiToastHold() {
  if (UI.egDone || quickOpen()) return true;
  const I = mod('ISKART'); if (I && typeof I.open === 'function') { try { if (I.open()) return true; } catch (e) {   } }
  const sc = $('scanCard'); return !!(sc && !sc.hidden && sc.getClientRects().length);
}
function uiToastPush(f, a) {
  const now = performance.now();
  if (uiToastHold() || (UI.toastQ && UI.toastQ.length) || now < (UI.toastGap || 0)) { (UI.toastQ || (UI.toastQ = [])).push([f, a]); if (UI.toastQ.length > 8) UI.toastQ.shift(); return true; }
  return false;
}
function uiToastPump(now) {
  if (!UI.toastQ || !UI.toastQ.length) { UI.toastHeld = false; return; }
  if (uiToastHold()) { UI.toastHeld = true; UI.toastGap = now + 1500; return; }
  if (now < (UI.toastGap || 0)) return;
  const [f, a] = UI.toastQ.shift(); UI.toastGap = now + TOAST_GAP; UI.toastHeld = UI.toastQ.length > 0;
  UI.toastPumping = true; try { f(...a); } finally { UI.toastPumping = false; }
}
const toastTrim = box => { while (box.children.length > TOAST_MAX) box.removeChild(box.firstChild); };
function toast(msg, c) {
  if (!UI.toastPumping && uiToastPush(toast, [msg, c])) return;
  const box = $('toasts'), last = box.lastChild, tn = performance.now(), seen = UI.toastSeen || (UI.toastSeen = {});
  if (last && last.textContent === msg && !last.classList.contains('out')) return;
  if (tn - (seen[msg] || -1e9) < TOAST_DUP) return; seen[msg] = tn; UI.toastGap = tn + TOAST_GAP;
  const el = document.createElement('div'); el.className = 'toast'; el.dataset.c = c || 'info'; el.textContent = msg;
  box.appendChild(el);
  toastTrim(box);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, Math.max(6000, uiReadMs(words(String(msg)).length)));
}

function toastRw(it) {
  if (!UI.toastPumping && uiToastPush(toastRw, [it])) return;
  const box = $('toasts'); if (!box) return;
  const el = document.createElement('div'); el.className = 'toast rw'; el.dataset.c = 'good';
  el.innerHTML = `<span class="rw-msg" data-act="wardrobe" data-v="${esc(WD_CAT_TAB[it.cat] || 'astro')}">${ico('star')} ${esc(T('rw_new', tx(it.name), catWord(it.cat)))}</span><button class="btn acc" data-act="wearNew" data-v="${esc(it.id)}">${T('wear')}</button>`;
  box.appendChild(el);
  toastTrim(box);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 15000);
}


const achById = id => uiAchList().find(a => a && a.id === id) || null;
function achTick(s) {
  if (!s) return;
  if (typeof checkAch !== 'function' && ext('checkAch') && !s.over) { const nw = callExt('checkAch', s); if (Array.isArray(nw)) for (const id of nw) if (s.ach && s.ach[id] == null) s.ach[id] = s.t; }
  const a = s.ach; if (!a || typeof a !== 'object') return;
  const seen = UI.achSeen || (UI.achSeen = {}), p = prof(); let nw = 0;
  for (const id of Object.keys(a)) {
    if (seen[id] != null) continue; seen[id] = 1;
    if (!p.ach[id]) { p.ach[id] = 1; nw++; }
    if (s.achP && s.achP[id]) continue;
    UI.achQ.push(id); UI.achDot = (UI.achDot || 0) + 1;
  }
  if (nw) profSave();
  pumpAch();
}
const ACH_BIG = { gece1: 1, yari: 1 };
function pumpAch() {
  if (!UI.achQ || !UI.achQ.length || performance.now() < (UI.achT || 0)) return;
  const id = UI.achQ.shift(), it = achById(id); if (!it) return;

  const day = UI.s ? Math.floor(UI.s.t / 24) : 0;
  if (ACH_BIG[id] && UI.achBigDay !== day) { UI.achBigDay = day; toastAch(it); UI.achT = performance.now() + 5400; } else Snd.play('click');
}
function toastAch(it) {
  if (!UI.toastPumping && uiToastPush(toastAch, [it])) return;
  const box = $('toasts'); if (!box) return;
  const el = document.createElement('div'); el.className = 'toast ach'; el.dataset.c = 'good'; el.dataset.act = 'achOpen'; el.dataset.v = it.id; el.setAttribute('role', 'button');
  const icn = it.icon && (IC[it.icon] || (iconSet() || {})[it.icon]) ? ico(it.icon) : ico('trophy');
  el.innerHTML = `<span class="a-ic">${icn}</span><span class="a-tx"><small>${T('ach_new')}</small><b>${esc(tx(it.name))}</b>${it.say ? `<span>${esc(tx(it.say))}</span>` : ''}</span>`;
  box.appendChild(el);
  toastTrim(box);
  Snd.play('win');
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 5000);
}
function pumpLog() {
  const s = UI.s; if (s.logN === UI.logN) return;
  const n = Math.min(s.logN - UI.logN, s.log.length); UI.logN = s.logN;
  let snd = '';
  for (const l of s.log.slice(-n)) {
    if (l.c === 'info' || /^(Kargo boşaltıldı|Cargo unloaded)/.test(tx(l.m))) { if (!snd) snd = 'done'; continue; }
    toast(tx(l.m), l.c);
    snd = l.c === 'bad' ? 'bad' : l.c === 'warn' && snd !== 'bad' ? 'warn' : snd === 'bad' || snd === 'warn' ? snd : 'good';
  }
  if (snd) Snd.play(snd);
}
function showScanCard(r) {
  const e = r.entry; if (!e) return;
  const el = $('scanCard');
  el.innerHTML = `<header><small>${r.relic != null ? T('relicLog') : T('scanNew')}</small><button class="x" data-act="cardClose" aria-label="${T('close')}">×</button></header>
    <b>${esc(tx(e.title))}</b><p>${esc(tx(e.text))}</p>${e.fact ? factHtml(e.fact) : ''}
    <button class="link" data-act="pda" data-v="banka">${T('openBank')} ›</button>`;
  el.hidden = false; el.classList.remove('out');
  clearTimeout(UI.cardTO); UI.cardTO = setTimeout(() => ACT.cardClose(), kasif() ? 25000 : 15000);
}


function statusOf(s, b) {
  if (b.left > 0) return ['insa', T('st_insa', b.left)];
  if (b.st === 'ok') {
    const lag = s.techs.hidro ? 72 : 96;
    if (b.k === 'sera' && (b.grow || 0) < lag) return ['buyume', T('st_buyume', lag - (b.grow || 0))];
    if (b.k === 'gunes' && (s.pw.sun < 0.05 || (WORLDS[s.world].night && hoursToNight(s) === 0))) return ['gece', T('st_gece')];
    if (b.k === 'gunes' && (dusty(s, b) || s.t < (s.fx.dustUntil || 0))) return ['warn', T('st_dust')];
    return ['ok', T('st_ok')];
  }
  if (b.st === 'girdi') return ['girdi', T(BLD[b.k].inp && BLD[b.k].inp.su ? 'st_girdiSu' : 'st_girdi')];
  return [b.st, STR['st_' + b.st] ? T('st_' + b.st) : b.st];
}
const kE = () => (UI.touch ? T('kTap') : UI.mode !== 'walk' ? T('kClick') : 'E');
function readCtx(aim) {
  const s = UI.s, a = aim || (UI.gl && S3.aim) || { kind: 'none' }, c = { a, lines: [] };
  if (UI.placing || UI.plan) return c;
  if (UI.ship) {
    const p = wpos(UI.ship.tx, UI.ship.ty);
    if (plDist(p.x, p.z) <= 14 || (a.kind === 'tile' && a.tx === UI.ship.tx && a.ty === UI.ship.ty)) { c.e = { type: 'ship' }; c.lines.push([kE(), T('p_ship'), 'acc']); return c; }
  }
  if (a.kind === 'building') {
    const b = s.b.find(o => o.id === a.bid);
    if (b) {
      c.e = { type: 'card', b }; c.lines.push([kE(), T('p_open', tx(bname(s, b.k)), statusOf(s, b)[1]), '']);
      if (b.broken) { const w = wpos(b.x, b.y), nearB = plDist(w.x, w.z) <= 22; c.r = { b, near: nearB }; c.lines.push([UI.touch ? T('k_repair') : 'R', nearB ? T('p_repair', repairCost(s, b)) : T('goNear'), nearB && s.res.parca >= repairCost(s, b) ? 'warn' : 'dim']); }
      return c;
    }
  }
  if ((a.kind === 'tile' || a.kind === 'relic') && inMap(a.tx, a.ty)) {
    if (!isSeen(s, a.tx, a.ty)) { c.lines.push(['', T('tl_fog'), 'dim']); return c; }
    const w = wpos(a.tx, a.ty), near = plDist(w.x, w.z) <= REACH_M;
    const info = typeof scanInfo === 'function' ? scanInfo(s, a.tx, a.ty) : null;
    const nm = info ? tx(info.name) : (STR['tl_' + tileAt(s, a.tx, a.ty)] ? T('tl_' + tileAt(s, a.tx, a.ty)) : '');
    if (info && !info.done) {
      if (near) { c.f = { tx: a.tx, ty: a.ty, key: a.tx + ',' + a.ty }; c.lines.push([UI.touch ? T('k_scan') : 'F', T('p_scan', nm), 'acc']); }
      else c.lines.push(['', T('p_far', nm), 'dim']);
    } else if (info) c.lines.push(['', T('p_scanned', nm), 'dim']);
    const cc = typeof canCollect === 'function' ? canCollect(s, a.tx, a.ty) : null;
    if (cc && cc.why === 'siginak') c.lines.push(['', T('w_siginak'), 'dim']);
    if (cc && cc.ok !== false) {
      const k = tileAt(s, a.tx, a.ty), gain = k === 'i' ? '+8 L ' + low(T('c_su')) : '+6 ' + low(T('c_malzeme'));
      if (near) { c.e = { type: 'collect', tx: a.tx, ty: a.ty }; c.lines.push([kE(), T('p_collect', gain), '']); }
      else if (!info || info.done) c.lines.push(['', T('p_far', nm), 'dim']);
    }
    if (!c.lines.length && nm) c.lines.push(['', nm, 'dim']);
  }
  return c;
}
function renderPrompt(now) {
  const c = UI.ctx, el = $('prompt');
  const h = c && c.lines.length && !UI.plan ? c.lines.map(([k, t, cl]) => `<span class="pl ${cl}">${k ? `<kbd>${k}</kbd>` : ''}${esc(t)}</span>`).join('') : '';
  if (el._k !== h) { el._k = h; el.innerHTML = h; el.hidden = !h; }

  const free = topView() || (UI.dragLook && !UI.locked), m = UI.mouse;
  const game = $('game'), cx = free && m ? m.x : game.clientWidth / 2, cy = free && m ? m.y : game.clientHeight / 2;
  const k = (cx | 0) + ',' + (cy | 0) + free;
  if (UI._xk !== k) {
    UI._xk = k;
    $('cross').style.transform = `translate(${cx}px, ${cy}px)`;
    el.style.transform = `translate(${cx}px, ${cy + (free ? 26 : 30)}px)`;
    $('cross').classList.toggle('free', free);
  }
  $('cross').hidden = (topView() && !UI.scanH) || UI.plan;
  const arc = UI.scanH ? clamp((now - UI.scanH.t0) / SCAN_MS, 0, 1) : 0;
  $('scanArc').style.strokeDasharray = `${arc * 100} 100`;
}



function kesifTarget(s) {
  if (!s || !kasif() || s.done.kesif || typeof nextGoal !== 'function' || (nextGoal(s) || {}).id !== 'kesif') return null;
  let best = null, bd = 1e9;
  for (let y = 0; y < MAPH; y++) for (let x = 0; x < MAPW; x++) {
    const k = s.map.k[y * MAPW + x]; if ((k !== 'i' && k !== 'm') || s.scanned[y * MAPW + x] || !isSeen(s, x, y)) continue;
    const w = wpos(x, y), d = plDist(w.x, w.z); if (d < bd) { bd = d; best = { x, y, w }; }
  }
  return best;
}
function scanNear(f) {
  const s = UI.s; if (!s || !f) return false;
  const info = typeof scanInfo === 'function' ? scanInfo(s, f.tx, f.ty) : null, w = wpos(f.tx, f.ty);
  return !!info && !info.done && plDist(w.x, w.z) <= REACH_M;
}

function nearestScanF(s) {
  let best = null, bd = REACH_M;
  for (let y = 0; y < MAPH; y++) for (let x = 0; x < MAPW; x++) {
    if (s.scanned[y * MAPW + x] || !isSeen(s, x, y)) continue;
    const w = wpos(x, y), d = plDist(w.x, w.z); if (d > bd) continue;
    const info = typeof scanInfo === 'function' ? scanInfo(s, x, y) : null; if (!info || info.done) continue;
    bd = d; best = { tx: x, ty: y, key: x + ',' + y };
  }
  return best;
}
const scanLatchF = () => (!kasif() || !UI.s ? null : (UI.lastF && performance.now() - UI.lastF.t < 20000 && scanNear(UI.lastF.f) ? UI.lastF.f : nearestScanF(UI.s)));
function scanStart() {
  if (!UI.s || UI.modal || UI.pda || UI.scanH || UI.plan) return;
  const c = UI.ctx, latch = kasif(), f = (c && c.f) || (latch ? scanLatchF() : null);
  if (!f) { Snd.play('no'); toast(c && c.a && c.a.kind !== 'none' && c.lines.length ? c.lines[0][1] : latch ? T('scanHow') : T('scanNo'), 'info'); return; }
  UI.scanH = { t0: performance.now(), key: f.key, f, latch };
  Snd.play('scanHum');
}
const scanRelease = () => { if (UI.scanH && UI.scanH.latch) return; scanStop(); };
function scanStop() { if (!UI.scanH) return; UI.scanH = null; try { S3.scanFx(null); } catch (e) {   } }
function scanTick(now) {
  const h = UI.scanH; if (!h) return;
  if (h.latch ? !scanNear(h.f) : (!UI.ctx || !UI.ctx.f || UI.ctx.f.key !== h.key)) { scanStop(); return; }
  const p = clamp((now - h.t0) / SCAN_MS, 0, 1);
  try { S3.scanFx(p); } catch (e) {   }
  if (p >= 1) { const f = h.f; scanStop(); doScan(f.tx, f.ty); }
}
function doScan(x, y) {
  const s = UI.s, r = scan(s, x, y);
  if (!r || !r.ok) { Snd.play('no'); toast(T('scanNo'), 'info'); return; }
  Snd.play('scan'); try { S3.flash('done'); } catch (e) {   }
  const name = r.entry ? tx(r.entry.title) : '';
  toast(T('scanned', r.bilim || 0, name), 'good');
  if (r.first || r.relic != null) showScanCard(r);
  tutEvent('scan');
  refresh(true);
}
function doCollect(x, y) {
  const s = UI.s, r = collect(s, x, y);
  if (!r || !r.ok) { Snd.play('no'); toast(T(r && r.why === 'siginak' ? 'w_siginak' : 'noCollect'), 'info'); return; }
  const unit = r.res === 'su' ? 'L ' + low(T('c_su')) : low(T('c_' + r.res));
  toast(r.left > 0 ? T('got', num(r.n), unit, r.left) : T('gotLast', num(r.n), unit), 'good');
  Snd.play('place'); refresh(true);
}
function interact(a) {
  const s = UI.s; if (!s) return;
  const c = a ? readCtx(a) : UI.ctx; if (!c || !c.e) { if (a == null) Snd.play('no'); return; }
  if (c.e.type === 'ship') { const p = s.pending.find(q => q.type === 'cargo'); if (p) modalCargo(p); }
  else if (c.e.type === 'card') modalBuilding(c.e.b.id);
  else if (c.e.type === 'collect') doCollect(c.e.tx, c.e.ty);
}
function repairAim() {
  const c = UI.ctx; if (!c || !c.r) { Snd.play('no'); return; }
  if (!c.r.near) { Snd.play('no'); toast(T('goNear'), 'info'); return; }
  doRepair(c.r.b, false);
}


function doRepair(b, fromCard) {
  const s = UI.s; if (!s || !b || !b.broken) { Snd.play('no'); return false; }
  if (s.res.parca < repairCost(s, b)) { Snd.play('no'); toast(T('noParts'), 'warn'); return false; }
  if (askQuick('repair', { b })) { UI.repW = { bid: b.id }; if (fromCard && UI.modal === 'bcard') closeModal(); return true; }
  if (repair(s, b)) { repairedFx(s, b, fromCard); return true; }
  Snd.play('no'); toast(T('noParts'), 'warn'); return false;
}
function repairedFx(s, b, fromCard) {
  b.st = 'ok'; Snd.play('place'); toast(T('repaired', tx(bname(s, b.k))), 'good');
  if (fromCard && UI.modal === 'bcard') modalBuilding(b.id);
  refresh(true);
}

const quickOpen = () => { const IK = mod('ISKART'); return !!(IK && typeof IK.quickOpen === 'function' && safeB(() => IK.quickOpen())); };
const mapBig = () => { const H = mod('HARITA'); return !!(H && typeof H.big === 'function' && safeB(() => H.big())); };
function mapToggle(on) { const H = mod('HARITA'); if (!H || typeof H.toggle !== 'function') return false; try { H.toggle(on); } catch (e) { console.error(e); } Snd.play('click'); return true; }
function askQuick(act, ctx) {
  if (UI.quickQ === false) return false;
  const IK = mod('ISKART'); if (!IK || typeof IK.quick !== 'function') return false;
  try { return IK.quick(act, ctx) === true; } catch (e) { console.error(e); return false; }
}


function spendTarget(r) {
  const vis = el => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const ids = UI.plan ? ['dr-' + r] : [];
  if (r === 'malzeme') ids.push(kasif() ? 'kurM' : 'm-malzeme', 'kurM');
  else if (r === 'parca' || r === 'bilim') ids.push('m-' + r);
  else if (r === 'o2' || r === 'su' || r === 'gida') ids.push('g-' + r);
  else if (r === 'core' && UI.plan) ids.push('dr-core');
  for (const id of ids) { const el = $(id); if (vis(el)) return el; }
  return r === 'parca' ? tempChip(r) : null;
}
function tempChip(r) {
  const s = UI.s, hud = $('hud'); if (!s || !hud) return null;
  let el = $('spendTmp');
  if (!el) { el = document.createElement('div'); el.id = 'spendTmp'; el.className = 'spend-tmp'; hud.appendChild(el); }
  el.innerHTML = `${badge(r)}<b>${esc(T('sp_parca', num(Math.floor(s.res.parca))))}</b>`;
  el.hidden = false; clearTimeout(UI.tmpT); UI.tmpT = setTimeout(() => { el.hidden = true; }, 2500);
  return el;
}

function spendFloat(el, n, why) {
  const g = $('game'), hud = $('hud'); if (!el || !g || !hud) return;
  const gr = g.getBoundingClientRect(), r = el.getBoundingClientRect(), ceza = (why === 'ceza' || why === 'sure') && n < 0;
  const old = hud.querySelector('.spend-float[data-for="' + (el.id || '') + '"]'); if (old) old.remove();
  const f = document.createElement('div'); f.className = 'spend-float' + (ceza ? ' ceza' : ''); f.dataset.c = n < 0 ? 'neg' : 'pos'; f.dataset.for = el.id || ''; if (why) f.dataset.why = why;
  f.textContent = (n < 0 ? '−' : '+') + num(Math.abs(n)) + (ceza ? ' ' + T(why === 'sure' ? 'sp_sure' : 'sp_ceza') : '');
  f.style.left = Math.round(r.left - gr.left + r.width / 2) + 'px'; f.style.top = Math.round(r.top - gr.top - 2) + 'px';
  hud.appendChild(f); setTimeout(() => f.remove(), ceza ? 2600 : 1600);
  if (n >= 0) return;
  el.classList.remove('spend-shake'); void el.offsetWidth; el.classList.add('spend-shake');
  clearTimeout(el._shT); el._shT = setTimeout(() => el.classList.remove('spend-shake'), 650);
}


const uiPO = s => (UI.poOver !== undefined ? UI.poOver : callExt('powerOutlook', s)) || null;
const uiBN = (s, k) => (k && BLD[k] ? tx(bname(s, k)) : '');
function uiPlanTxt(s, plan) {
  const en = n => (n.endsWith('y') ? n.slice(0, -1) + 'ies' : n + 's');
  return plan.filter(p => p && p.n > 0 && BLD[p.k]).map(p => { const nm = uiBN(s, p.k); return LANG === 'en' ? p.n + ' ' + (p.n > 1 ? en(nm.toLowerCase()) : nm.toLowerCase()) : p.n + ' ' + nm.toLocaleLowerCase('tr'); }).join(' + ');
}
function uiPwState(s, now) {
  const o = uiPO(s); if (!o) return null;
  const nt = o.night || null, inNight = !!(nt && !(nt.inH > 0)), shortN = !!(nt && nt.short);

  const ar = UI.pwAriza && s.b.find(x => x.id === UI.pwAriza.bid && x.broken);
  if (ar || (UI.pwAriza && !UI.pwAriza.bid && UI.pwAriza.until > now)) { const k = ar ? ar.k : UI.pwAriza.k; return { kind: 'ariza', c: 'bad', m: T('pw_ariza', uiBN(s, k) || T('c_guc')), fix: T('pw_arizaFix'), icon: 'wrench' }; }
  if (UI.pwAriza && !ar) UI.pwAriza = null;
  if (s.train) return null;
  const stopFix = () => (nt && nt.stop && BLD[nt.stop.k] ? T('pw_stopFix', uiBN(s, nt.stop.k)) : T('pw_offFix'));
  if (inNight && shortN) { const h = isNum(o.hoursLeft) && o.hoursLeft !== Infinity ? Math.max(1, Math.floor(o.hoursLeft)) : Math.max(1, Math.floor(nt.lastsH || 0)); return { kind: 'gece', c: 'bad', m: T('pw_nowH', num(h)), fix: stopFix(), icon: 'night' }; }
  if (o.over && !inNight) return { kind: 'over', c: 'bad', m: T('pw_over'), fix: T('pw_overFix'), icon: 'bolt' };
  if (shortN && nt.inH < 72) {
    const W = WORLDS[s.world], hrs = nt.inH < 24, n = hrs ? Math.max(1, Math.ceil(nt.inH)) : Math.ceil(nt.inH / 24);
    const m = T('pw_soon', n, hrs ? (LANG === 'en' ? (n === 1 ? 'hour' : 'hours') : 'saat') : dayUnit(W, n));
    let plan = Array.isArray(nt.plan) ? nt.plan : null;
    if (!plan) plan = nt.addBat > 0 ? [{ kind: 'batarya', k: 'batarya', n: nt.addBat }] : nt.addGen && BLD[nt.addGen] ? [{ kind: 'uretim', k: nt.addGen, n: 1 }] : [];
    const pt = uiPlanTxt(s, plan);
    const alt = pt && isNum(nt.cost) && nt.cost > s.res.malzeme ? (nt.stop && BLD[nt.stop.k] ? T('pw_altStop', uiBN(s, nt.stop.k)) : T('pw_altCargo')) : '';
    return { kind: 'yaklasan', c: nt.inH <= 24 ? 'bad' : 'warn', m, fix: pt ? T('pw_planFix', pt) : stopFix(), alt, icon: 'night', f: isNum(nt.lenH) && nt.lenH > 0 ? clamp((+nt.lastsH || 0) / nt.lenH, 0, 1) : null };
  }

  const ready = nt && !inNight && (nt.ready === true || (nt.ready === undefined && !shortN && UI.pwWas));
  if (ready && !UI.pwOkDone) { UI.pwOkDone = true; UI.pwOk = now + 12000; Snd.play('good'); }
  if (inNight) UI.pwOk = 0;
  if (!nt || inNight) UI.pwOkDone = false;
  if (UI.pwOk > now) return { kind: 'ok', c: 'good', m: T('pw_ok'), fix: '', icon: 'check' };
  return null;
}


function uiResWarn(s) {
  if (!s || s.train || UI.train || typeof daysLeft !== 'function') return null;
  let best = null;
  for (const r of ['o2', 'su', 'gida']) {
    const dl = safeN(() => daysLeft(s, r)); if (!(dl < 3) || !(s.rate && s.rate[r] && s.rate[r].c - s.rate[r].p > 1e-6)) continue;
    if (best && best.d <= dl) continue;
    const fk = FIX_K[r], nm = BLD[fk] ? uiBN(s, fk) : '', bs = s.b.filter(b => b.k === fk && !(b.left > 0));
    let fix = T('rw_fixB', nm);
    if (bs.length && bs.every(b => b.broken)) fix = T('rw_fixR', nm);
    else if (bs.length && bs.every(b => b.on === false)) fix = T('rw_fixOn', nm);
    else if (bs.length && powerNet(s) < 0) fix = T('rw_fixP');
    const n = Math.max(0, Math.floor(dl));
    best = { kind: 'res:' + r, c: dl < 1 ? 'bad' : 'warn', d: dl, m: n < 1 ? T('rw_today', T('rw_' + r)) : T('rw_soon', T('rw_' + r), n, dayUnit(WORLDS[s.world], n)), fix, icon: r === 'o2' ? 'o2' : r === 'su' ? 'drop' : 'leaf' };
  }
  return best;
}
function uiPickWarn(pw, rw) {
  if (!rw) return pw; if (!pw || pw.kind === 'ok') return rw;
  const pd = pw.kind === 'yaklasan' && UI.s ? safeN(() => (uiPO(UI.s).night.inH || 0) / 24) : 0;
  return rw.d <= pd ? rw : pw;
}
function pwTick(now) {
  const s = UI.s, el = $('pwWarn'); if (!s || !el) return;
  const q = s.fx && Array.isArray(s.fx.pwarn) && s.fx.pwarn.length ? s.fx.pwarn.splice(0) : [];
  if (!ext('powerOutlook') && UI.poOver === undefined) { if (!el.hidden) { el.hidden = true; el._k = ''; } return; }
  for (const e of q) if (e && e.kind) {
    if (e.kind === 'ariza') { UI.pwAriza = { bid: e.bid, k: e.k, until: now + 20000 }; if (!UI.paused) Snd.play('warn'); }
    else if (e.kind !== 'hazir' && !s.train && !UI.paused) Snd.play('warn');
  }
  if (!q.length && UI.pwNext > now) return; UI.pwNext = now + 300;
  let st = uiPickWarn(uiPwState(s, now), uiResWarn(s)); const o = uiPO(s), nt = o && o.night;
  {
    const wk = st && st.kind !== 'ok' ? st.kind + '|' + st.c : '', hz = UI.pwHid || (UI.pwHid = {});
    if (UI.pwShownK && UI.pwShownK !== wk) hz[UI.pwShownK] = now;
    UI.pwShownK = wk;
    if (wk && hz[wk] && now - hz[wk] < 60000 && el.hidden) { UI.pwShownK = ''; st = null; }
  }
  UI.pwState = st;
  if (st && st.kind !== 'ok') { UI.pwWas = true; UI.pwOkDone = false; UI.pwOk = 0; } else if (!st) UI.pwWas = false;
  let h = '';
  if (st) {
    h = `<div class="pw-l">${ico(st.icon)}<span class="pw-m">${esc(st.m)}</span></div>`;
    if (st.fix) h += `<div class="pw-cmp">${st.f != null ? `<span class="pw-bar" role="img" aria-label="${esc(T('pw_lastL') + ' ' + Math.round(st.f * 100) + '%')}"><i style="width:${Math.round(st.f * 100)}%"></i><em>${ico('night')}</em></span>` : ''}<b class="pw-fix">${ico(st.kind === 'ariza' ? 'wrench' : 'build')} ${esc(st.fix)}</b></div>` + (st.alt ? `<div class="pw-alt">${esc(st.alt)}</div>` : '');
  }
  const c = st ? st.c : '', k = h + c; if (el._k !== k) { el._k = k; el.innerHTML = h; el.dataset.c = c; el.dataset.kind = st ? st.kind : ''; el.hidden = !h; }

  const g = $('g-guc'); if (g && o) {
    const nowOk = !(isNum(o.net) && o.net < 0);
    const inN = !!(nt && !(nt.inH > 0)), note = !!(nt && ((nowOk && nt.short && nt.inH > 0) || (inN && !nt.short))); g.classList.toggle('pwnote', note);
    const t = nowOk && nt && nt.short && nt.inH > 0 ? T('pw_okNight') : inN && !nt.short ? T('pw_nightOk') : isNum(o.hoursLeft) && o.hoursLeft !== Infinity ? T('pw_hrs', num(Math.max(0, Math.floor(o.hoursLeft)))) : T('pw_inf');
    const sm = g.querySelector('small'); if (sm && sm.textContent !== t) { sm.textContent = t; g.title = t; }
  }
}
function spendTick() {
  const s = UI.s; if (!s || !s.fx) return;
  const q = (s.fx && Array.isArray(s.fx.spend) && s.fx.spend.length) ? s.fx.spend.splice(0) : [];
  if (!q.length) return;
  refresh(true);
  const sum = {}, why = {};
  for (const e of q) { if (!e || !isNum(e.n) || !e.n) continue; sum[e.r] = (sum[e.r] || 0) + +e.n; if (e.why === 'ceza' || e.why === 'sure') why[e.r] = e.why; else if (!why[e.r]) why[e.r] = e.why || ''; }
  for (const r in sum) { if (!sum[r]) continue; const el = spendTarget(r); if (el) spendFloat(el, sum[r], why[r]); }
}



const grpOf = k => BLD[k].group || KID_GROUP[k] || BLD[k].cat;
const grpOrder = () => (typeof GROUP_ORDER !== 'undefined' && Array.isArray(GROUP_ORDER) && GROUP_ORDER.length) ? GROUP_ORDER : KID_GROUPS;
const grpName = g => (typeof GROUPS !== 'undefined' && GROUPS && GROUPS[g]) ? tx(GROUPS[g]) : STR['g_' + g] ? T('g_' + g) : (CATS[g] ? tx(CATS[g]) : g);
function lockOf(s, k) {
  if (typeof unlockedB === 'function') { let u = null; try { u = unlockedB(s, k); } catch (e) { u = null; } if (u && u.ok === false) return { why: u.why ? tx(u.why) : T('w_stage'), at: u.at ? tx(u.at) : '' }; }
  const d = BLD[k];
  if (d.tech && !s.techs[d.tech]) return { why: T('lockTech', tx(TECHS[d.tech].name)), at: '' };
  if (d.core && s.core < 1) return { why: T('needCore'), at: '' };
  return null;
}

function makesOf(k) {
  const d = BLD[k];
  if (k === 'gunes' || k === 'reaktor' || k === 'batarya' || d.gen) return 'guc';
  if (d.out) for (const r of ['o2', 'su', 'gida', 'malzeme', 'parca', 'bilim']) if (d.out[r]) return r;
  if (k === 'geri') return 'su';
  if (d.beds) return 'ekip';
  if (k === 'spor') return 'moral';
  return null;
}
const doesTxt = k => tx(BLD[k].does || BLD[k].desc);
function needsTxt(s, k) {
  const d = BLD[k]; if (d.needs) return tx(d.needs);
  const out = [];
  if (d.on === 'i') out.push(T('nd_ice'));
  if (workersOf(s, k)) out.push(T('nd_w', workersOf(s, k)));
  if (k === 'gunes') out.push(T('nd_sun'));
  if (d.kw) out.push(T('nd_kw'));
  if (d.inp) for (const r in d.inp) out.push(T(r === 'su' ? 'nd_su' : 'nd_m'));
  if (d.core) out.push(T('nd_core'));
  return out.length ? out.join(', ') : T('nd_none');
}
function powerWords(s, k) {
  const d = BLD[k];
  if (k === 'gunes') return [T('cw_sun', num(WORLDS[s.world].solarPeak * (s.techs.panel ? 1.25 : 1), 0)), 'pos'];
  if (d.gen) return [T('cw_gen', num(d.gen, 0)), 'pos'];
  if (d.kw) return [T('cw_kw', num(d.kw, 0)), 'neg'];
  return null;
}

function costWords(s, k) {
  const c = costOf(s, k), d = BLD[k], out = [];
  out.push(s.res.malzeme >= c.m ? [T('cw_m', num(c.m)), ''] : [T('missM', num(Math.ceil(c.m - s.res.malzeme))), 'no']);
  if (c.p > 0) out.push(s.res.parca >= c.p ? [T('cw_p', num(c.p)), ''] : [T('missP', num(Math.ceil(c.p - s.res.parca))), 'no']);
  if (d.core) out.push([T('cw_core'), s.core ? '' : 'no']);
  if (d.h) out.push([T('cw_h', d.h), '']);
  const pw = powerWords(s, k); if (pw) out.push(pw);
  return out;
}
const costHtml = (s, k) => costWords(s, k).map(([t, c]) => `<span class="${c}">${esc(t)}</span>`).join('');
const costShort = (s, k) => { const c = costOf(s, k); return T('cw_m', num(c.m)) + (c.p ? ' · ' + T('cw_p', num(c.p)) : ''); };

function bestSpot(s, k) {
  if (!k) return null;
  if (typeof suggestSpot === 'function') { try { const r = suggestSpot(s, k); if (r && inMap(r.x, r.y)) return r; } catch (e) {   } return null; }
  let best = null, bd = 1e9;
  const good = { tup: -2, mineral: -2, yesil: -1 }, bad = { toz: 4, toz2: 4, rad: 9 };
  for (let ty = 0; ty < MAPH; ty++) for (let tx2 = 0; tx2 < MAPW; tx2++) {
    const r = canBuild(s, k, tx2, ty); if (!r.ok) continue;
    let d = Math.hypot(tx2 - HUBX, ty - HUBY); if (d < 1.9) d += 3;
    for (const w of r.warn || []) d += (good[w] || 0) + (bad[w] || 0);
    if (d < bd) { bd = d; best = { x: tx2, y: ty }; }
  }
  return best;
}
const starterList = s => { if (typeof starterPlan !== 'function' || !UI.tut) return []; try { return (starterPlan(s) || []).filter(p => !bAt(s, p.x, p.y)); } catch (e) { return []; } };
const planTile = k => { const d = BLD[k]; return d.on || (k === 'maden' ? 'm' : k === 'yasam' ? 't' : null); };
function updateHints() {
  const s = UI.s; if (!s || !UI.gl) return;
  const k = UI.placing, b = UI.plan && k ? bestSpot(s, k) : null;
  UI.best = b;
  if (planScene()) {
    try { S3.setBuildHints(UI.plan ? { best: b ? { tx: b.x, ty: b.y } : null, plan: starterList(s).map(p => ({ tx: p.x, ty: p.y, n: p.n, k: p.k })) } : null); } catch (e) { console.error(e); }
    if (typeof S3.planTint === 'function') try { S3.planTint(UI.plan && k ? planTile(k) : null); } catch (e) {   }
    if (b) planFocusVisible(); else UI.focusAt = 0;
  }
}


function planFocusVisible() {
  const b = UI.best; if (!b || !UI.plan || typeof S3.planFocus !== 'function') return;
  UI.fTile = { x: b.x, y: b.y }; UI.focusIter = 0; UI.focusAt = performance.now() + 600;
  try { S3.planFocus(b.x, b.y); } catch (e) {   }
}
function planFocusStep() {
  const s = UI.s, b = UI.best, f = UI.fTile; if (!s || !b || !f || !UI.plan || typeof S3.planFocus !== 'function') return;
  const sy = (x, y) => { const w = wpos(x, y); try { const p = S3.project(w.x, groundY(w.x, w.z), w.z); return p && !p.behind ? p.sy : null; } catch (e) { return null; } };
  const y0 = sy(b.x, b.y), y1 = sy(b.x, b.y + 1); if (y0 == null || y1 == null || y1 - y0 < 4) return;
  const dy = y1 - y0, gTop = $('game').getBoundingClientRect().top, H = $('game').clientHeight, dr = $('drawer');
  const bot = (dr && !dr.hidden ? dr.getBoundingClientRect().top - gTop : H) - 40, tc0 = $('hudTC');
  const top = Math.min(bot - 2 * dy, (tc0 ? tc0.getBoundingClientRect().bottom - gTop : 110) + 34);
  const all = [y0].concat(starterList(s).map(p => sy(p.x, p.y)).filter(v => v != null)), lo = Math.min(...all), hi = Math.max(...all);
  const delta = hi - lo <= bot - top ? (lo + hi) / 2 - (top + bot) / 2 : y0 - (top + bot) / 2;
  if (Math.abs(delta) < 12) return;
  f.y += delta / dy;
  try { S3.planFocus(f.x, f.y); } catch (e) {   }
}
function enterPlan(k) {
  const s = UI.s; if (!s || s.over || UI.modal || !UI.gl) return;
  if (s.train && s.trainOnly && !BLD[s.trainOnly] && typeof buildMsg === 'function') { Snd.play('no'); toast(tx(buildMsg(s, 'gunes', 'egitim')), 'warn'); return; }
  closePda(); scanStop();
  { const ch = $('chapter'); if (ch && !ch.hidden) { ch.hidden = true; UI.chapUntil = 0; clearTimeout(UI.chapTO); } }
  if (!UI.plan) {
    UI.prevMode = UI.mode === 'drone' ? 'drone' : 'walk';
    UI.plan = true; UI.grp = 'all'; UI.pend = null;
    s3Mode(planScene() ? 'plan' : 'drone');
    $('hud').classList.add('plan');
  }
  const want = s.train && s.trainOnly && BLD[s.trainOnly] ? s.trainOnly : (k || tutBuildK());
  if (want && BLD[want]) pickB(want, true); else { UI.placing = null; S3.setGhost(null); updateHints(); }
  UI.cache.drawer = null; renderDrawer();
  Snd.play('click'); tutEvent('plan');
}
function exitPlan() {
  if (!UI.plan) return;
  UI.plan = false; UI.placing = null; UI.pend = null; UI.best = null; UI.focusAt = 0;
  try { S3.setGhost(null); } catch (e) {   }
  updateHints();
  s3Mode(UI.viewPref === 'drone' ? 'drone' : 'walk');
  $('hud').classList.remove('plan');
  renderDrawer(); renderPlanUi();
}
function pickB(k, quiet) {
  const s = UI.s; if (!s || !BLD[k]) return;
  if (s.train && s.trainOnly && k !== s.trainOnly) { if (!quiet) { Snd.play('no'); toast(whyTxt({ ok: false, why: 'egitim' }, k), 'warn'); } return; }
  const lk = lockOf(s, k), r = canBuild(s, k);
  if (lk || !r.ok) { if (!quiet) { Snd.play('no'); toast(lk ? lk.why + (lk.at ? ' · ' + lk.at : '') : whyTxt(r, k), 'warn'); } UI.sel = k; UI.placing = null; S3.setGhost(null); updateHints(); UI.cache.drawer = null; renderDrawer(); return; }
  UI.placing = k; UI.sel = k; UI.pend = null; UI.focusAt = 0;
  try { S3.setGhost(k); } catch (e) {   }
  updateHints(); UI.cache.drawer = null; renderDrawer();
  if (!quiet) Snd.play('click');
}
function placeAt(a) {
  const s = UI.s, k = UI.placing; if (!k || !a || !inMap(a.tx, a.ty)) { Snd.play('no'); return false; }
  const r = build(s, k, a.tx, a.ty);
  if (!r.ok) { Snd.play('no'); toast(whyTxt(r, k), 'warn'); return false; }
  Snd.play('place');

  for (const w of warnTxts(r)) if (w && /toz|dust|rad|reakt/i.test(w)) toast(w, 'warn');
  UI.lastB = r.b; UI.lastBUntil = performance.now() + 7000; UI.undoUntil = typeof undoBuild === 'function' ? performance.now() + 8000 : 0; UI.pend = null;
  if (!canBuild(s, k).ok) { UI.placing = null; try { S3.setGhost(null); } catch (e) {   } }
  tutEvent('build:' + k);
  updateHints(); UI.cache.drawer = null;
  refresh(true);
  if (r.b) askQuick('build', { bid: r.b.id, k });
  return true;
}
function doUndo() {
  const s = UI.s, b = UI.lastB; if (!s || !b || typeof undoBuild !== 'function') return;
  if (undoBuild(s, b)) { toast(T('undone', tx(bname(s, b.k))), 'info'); Snd.play('click'); } else Snd.play('no');
  UI.lastB = null; UI.undoUntil = 0; updateHints(); UI.cache.drawer = null; refresh(true);
}
function cancelPlace() { UI.placing = null; UI.pend = null; try { S3.setGhost(null); } catch (e) {   } updateHints(); }

function drResEl() {
  let el = UI.drRes;
  if (!el) {
    el = document.createElement('div'); el.id = 'drRes'; el.className = 'dr-res';
    const chip = (id, r, lbl) => `<button class="drc" id="dr-${id}" data-r="${r}" title="${lbl}" aria-label="${lbl}">${badge(r)}<b></b><small>${lbl}</small></button>`;
    el.innerHTML = chip('malzeme', 'malzeme', T('dr_m')) + chip('parca', 'parca', T('dr_p')) + chip('guc', 'guc', T('dr_g')) +
      chip('o2', 'o2', T('ring_o2')) + chip('su', 'su', T('c_su')) + chip('gida', 'gida', T('c_gida')) + chip('core', 'bilim', T('dr_core'));
    el.querySelector('#dr-malzeme').classList.add('drc-big'); ['o2', 'su', 'gida'].forEach(r => el.querySelector('#dr-' + r).classList.add('drc-sm'));
    UI.drRes = el; el._lang = LANG;
  }
  return el;
}

function uiDaysLeft(s, r) {
  let d = Infinity; try { d = (s.rate && s.rate[r] && (s.rate[r].c || s.rate[r].p)) ? daysLeft(s, r) : s.res[r] / Math.max(1e-6, s.pop * NEED[r]); } catch (e) { d = Infinity; }
  return isNum(d) || d === Infinity ? d : Infinity;
}
const uiDayTxt = d => (d === Infinity || d > 30 ? '30+' : num(Math.max(0, Math.floor(d)))) + ' ' + T('dr_dU');
function powerNet(s) { const po = uiPO(s); return po && isNum(po.net) ? +po.net : (s.pw.gen - s.pw.need); }
function drResUpd(s) {
  if (UI.drRes && UI.drRes._lang !== LANG) { UI.drRes.remove(); UI.drRes = null; if ($('drawer')) $('drawer')._k = ''; }
  const el = drResEl(), set = (id, v, c, show) => { const e = el.querySelector('#dr-' + id); if (!e) return; e.hidden = !show; const b = e.querySelector('b'); if (b.textContent !== v) b.textContent = v; e.dataset.c = c || ''; };
  set('malzeme', num(Math.floor(s.res.malzeme)), '', true);
  set('parca', num(Math.floor(s.res.parca)), '', !kasif() || s.res.parca >= 1);
  const n = powerNet(s), nr = Math.round(n * (kasif() ? 1 : 10)) / (kasif() ? 1 : 10);
  set('guc', T(nr >= 0 ? 'dr_gPos' : 'dr_gNeg', (nr >= 0 ? '+' : '−') + num(Math.abs(nr), kasif() ? 0 : 1)), nr >= 0 ? 'pos' : 'neg', true);
  for (const r of ['o2', 'su', 'gida']) { const d = uiDaysLeft(s, r); set(r, uiDayTxt(d), d < 5 ? 'neg' : d < 12 ? 'warn' : '', true); }
  set('core', num(s.core || 0), '', (s.core || 0) >= 1);
}

function haveHtml(s, k) {
  const c = costOf(s, k), out = [`<span class="dc-have ${s.res.malzeme >= c.m ? '' : 'no'}">${badge('malzeme')}${num(c.m)} / ${num(Math.floor(s.res.malzeme))}</span>`];
  if (c.p > 0) out.push(`<span class="dc-have ${s.res.parca >= c.p ? '' : 'no'}">${badge('parca')}${num(c.p)} / ${num(Math.floor(s.res.parca))}</span>`);
  return out.join('');
}

function pwTag(s, k) {
  if (!ext('buildOutlook') || k === 'batarya' || k === 'gunes' || (BLD[k] && BLD[k].gen > 0)) return '';
  const key = s.t + '|' + s.b.length + '|' + Math.round(s.stored) + '|' + k;
  const C = UI.boC || (UI.boC = {}); if (C._t !== s.t + '|' + s.b.length) { UI.boC = { _t: s.t + '|' + s.b.length }; }
  let w = UI.boC[key]; if (w === undefined) { const o = callExt('buildOutlook', s, k); w = UI.boC[key] = o ? o.warn || null : null; }
  return w === 'gunduz' ? `<span class="dc-pw" data-c="bad">${ico('bolt')} ${T('pw_cg')}</span>` : w === 'gece' ? `<span class="dc-pw" data-c="warn">${ico('night')} ${T('pw_cn')}</span>` : '';
}

const uiTeachList = () => { if (typeof TEACH !== 'undefined' && Array.isArray(TEACH)) return TEACH; const m = stub('TEACH'); return Array.isArray(m) ? m : []; };
function teachOf(s, k) {
  const l = s && s.learn; if (!l) return null;
  return uiTeachList().find(t => t && t.on === 'build:' + k && (!t.w || t.w === s.world) && l[t.id] != null) || null;
}
function teachHtml(s, k, cls) { const t = teachOf(s, k); return t && t.say ? `<span class="${cls}">${ico('info')} ${esc(tx(t.say))}</span>` : ''; }
function renderDrawer() {
  const el = $('drawer'), s = UI.s;
  if (!UI.plan || !s) { if (!el.hidden) { el.hidden = true; el._k = ''; } return; }
  const order = grpOrder(), ks = BUILD_ORDER.filter(k => BLD[k] && k !== 'hub');
  const gi = k => { const i = order.indexOf(grpOf(k)); return i < 0 ? 99 : i; };
  const list = ks.filter(k => UI.grp === 'all' || grpOf(k) === UI.grp).map(k => ({ k, lk: lockOf(s, k) }))
    .sort((a, b) => (a.lk ? 1 : 0) - (b.lk ? 1 : 0) || gi(a.k) - gi(b.k));
  const groups = order.filter(g => ks.some(k => grpOf(k) === g));
  const hlK = tutBuildK(), hlS = UI.tut && TUT[UI.tut.step] === 'choice' ? ['sera', 'batarya'] : [hlK];
  const chips = `<button class="gchip ${UI.grp === 'all' ? 'on' : ''}" data-act="grp" data-v="all">${T('allG')}</button>` +
    groups.map(g => `<button class="gchip ${UI.grp === g ? 'on' : ''}" data-act="grp" data-v="${g}">${badge(GRP_RES[g] || 'bilim')}${esc(grpName(g))}</button>`).join('');
  const cards = list.map(({ k, lk }) => {
    const r = canBuild(s, k), poor = !lk && !r.ok, sel = UI.sel === k, mk = makesOf(k);
    return `<div class="dcard ${sel ? 'sel' : ''} ${hlS.includes(k) ? 'hl' : ''}" role="button" tabindex="0" data-act="pick" data-v="${k}" data-state="${lk ? 'lock' : poor ? 'poor' : ''}">
      <span class="dc-pic"><canvas class="bic" data-k="${k}" width="56" height="56"></canvas>${mk ? badge(mk, null, 'dmk') : ''}</span>
      <span class="dc-tx"><b class="dc-name">${esc(tx(bname(s, k)))}</b>
        <span class="dc-l"><i>${T('doesL')}:</i> ${esc(doesTxt(k))}</span>
        ${teachHtml(s, k, 'dc-l dc-teach')}
        <span class="dc-l dc-needs"><i>${T('needsL')}:</i> ${esc(needsTxt(s, k))}</span>
        ${lk ? `<span class="dc-lock">${ico('lock')} ${esc(lk.why)}${lk.at ? ' · ' + esc(lk.at) : ''}</span>` : `<span class="dc-cost">${pwTag(s, k)}${sel ? haveHtml(s, k) : ''}${costHtml(s, k)}</span>`}
        ${sel && !lk && r.ok && UI.best ? `<button class="btn acc dc-go" data-act="buildBest">${ico('star')} ${T('buildBest')}</button>` : ''}</span></div>`;
  }).join('');
  const h = `<div class="dr-top"><div class="gchips">${chips}</div><span class="dr-res-slot"></span><button class="primary" data-act="planDone">${ico('check')} ${T('planDone')}</button></div><div class="dcards">${cards}</div>`;
  drResUpd(s);
  if (el._k === h) return;
  const sc = el.querySelector('.dcards'), sl = sc ? sc.scrollLeft : 0;
  el._k = h; el.innerHTML = h; el.hidden = false;
  { const sl2 = el.querySelector('.dr-res-slot'); if (sl2) sl2.replaceWith(drResEl()); }
  el.querySelectorAll('canvas.bic').forEach(cv => drawIcon(cv, cv.dataset.k, s.world));
  const nc = el.querySelector('.dcards'); if (nc) nc.scrollLeft = sl;
  const se = el.querySelector('.dcard.sel'); if (se && UI._selK !== UI.sel) { UI._selK = UI.sel; try { se.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {   } }
}


function uiPlanKeys(bar) {
  let pk = $('planKeys');
  if (!pk) { pk = document.createElement('div'); pk.id = 'planKeys'; pk.className = 'khint'; bar.insertAdjacentElement('afterend', pk); }
  const show = UI.plan && !UI.touch && !bar.hidden, k = LANG + show;
  if (pk._k !== k) { pk._k = k; pk.innerHTML = show ? (LANG === 'en' ? '<kbd>WASD</kbd> move · <kbd>Q</kbd><kbd>E</kbd> turn · wheel zoom · <kbd>Esc</kbd> done' : '<kbd>WASD</kbd> kaydır · <kbd>Q</kbd><kbd>E</kbd> döndür · teker yakınlaş · <kbd>Esc</kbd> bitir') : ''; }
  pk.hidden = !show;
}
const uiKeysOn = () => !UI.touch && !(UI.set && UI.set.keys === false);
function uiApplyKeys() { const a = $('app'); if (a) a.classList.toggle('nokeys', !uiKeysOn()); }
const kh = k => (UI.touch ? '' : `<kbd class="kh">${k}</kbd>`);
function renderPlanUi() {
  const s = UI.s, bar = $('planBar'), lab = $('planLabel'), okb = $('planOk'), ub = $('undoBtn');
  if (!UI.plan || !s) { bar.hidden = true; { const pk = $('planKeys'); if (pk) pk.hidden = true; } lab.hidden = true; okb.hidden = true; ub.hidden = true; return; }
  if (UI.focusAt > 1 && performance.now() > UI.focusAt) { UI.focusIter = (UI.focusIter || 0) + 1; UI.focusAt = UI.focusIter < 5 ? performance.now() + 600 : 1; planFocusStep(); }
  const k = UI.placing;
  const hint = !k ? T('planPick') : UI.touch ? T('planTap') : T('planClick');
  const bh = `<span class="pb-p">${ico('pause')} ${T('planHead')}</span>`; void hint;
  if (bar._k !== bh) { bar._k = bh; bar.innerHTML = bh; }
  bar.hidden = UI.paused === 'quick' || UI.paused === 'map';
  uiPlanKeys(bar);
  ub.hidden = !(UI.lastB && performance.now() < UI.undoUntil);

  const dr = $('drawer'), dh = dr && !dr.hidden ? Math.round(dr.getBoundingClientRect().height) : 0, bp = (dh + 18) + 'px';
  if (okb.style.bottom !== bp) { okb.style.bottom = bp; ub.style.bottom = bp; }
  if (!ub.hidden && ub._k !== LANG) ub._k = LANG, ub.innerHTML = `${ico('undo')} ${T('undo')}`;

  let a = UI.touch ? UI.pend : (UI.gl && S3.aim) || null, txt = '', cl = '';
  if (k && a && inMap(a.tx, a.ty)) {
    const r = canBuild(s, k, a.tx, a.ty);
    if (!r.ok) { txt = whyTxt(r, k); cl = 'bad'; }
    else { const w = warnTxts(r).filter(Boolean); txt = (w.length ? w.join(' · ') + ' · ' : '') + T('okHere', costShort(s, k)); cl = w.length ? 'warn' : 'good'; }
  } else if (k) { txt = UI.touch ? T('aimTap') : T('aimMap'); cl = 'dim'; a = null; }
  okb.hidden = !(UI.touch && k && UI.pend && canBuild(s, k, UI.pend.tx, UI.pend.ty).ok);
  if (!okb.hidden && okb._k !== LANG) { okb._k = LANG; okb.innerHTML = ico('check') + ' ' + T('buildHere'); }
  if (!txt) { lab.hidden = true; return; }
  let px = null;
  if (a) { const w = wpos(a.tx, a.ty); try { px = S3.project(w.x, groundY(w.x, w.z) + 5, w.z); } catch (e) { px = null; } }
  const g = $('game');
  let x = px && !px.behind ? px.sx : (UI.mouse ? UI.mouse.x : g.clientWidth / 2), y = px && !px.behind ? px.sy : (UI.mouse ? UI.mouse.y - 30 : g.clientHeight / 2);
  if (!a && UI.touch) { x = g.clientWidth / 2; y = (dh ? g.clientHeight - dh - 6 : g.clientHeight - 60) - 8; }
  const lk = txt + cl; if (lab._k !== lk) { lab._k = lk; lab.textContent = txt; lab.dataset.c = cl; }
  lab.hidden = false;

  const gT = g.getBoundingClientRect().top, topB = ['planBar', 'objective', 'objHow', 'pwWarn'].reduce((m, id) => { const e = $(id); if (!e || e.hidden || !e.offsetParent) return m; const r = e.getBoundingClientRect(); return r.height ? Math.max(m, r.bottom - gT) : m; }, 0);
  const yMin = Math.max(70, topB + (lab.offsetHeight || 34) + 8);
  lab.style.transform = `translate(${Math.round(clamp(x, 120, g.clientWidth - 120))}px, ${Math.round(clamp(y, yMin, Math.max(yMin, g.clientHeight - 60)))}px)`;
}


function markerTargets(s) {
  const out = [], h = hubPos();
  if (UI.plan) {

    if (!planScene()) {
      if (UI.best && UI.placing) { const w = wpos(UI.best.x, UI.best.y); out.push({ x: w.x, z: w.z, up: 2, label: T('starTip'), cls: 'star', icon: 'star', always: true, nod: true }); }
      for (const p of starterList(s)) { const w = wpos(p.x, p.y); out.push({ x: w.x, z: w.z, up: 1.5, label: `${p.n}. ${tx(bname(s, p.k))}`, cls: 'plan', icon: 'blueprint', always: true, nod: true }); }
    } else {

      const g = $('game'), dr = $('drawer'), lim = (dr && !dr.hidden ? dr.getBoundingClientRect().top - g.getBoundingClientRect().top : g.clientHeight) - 10;
      const hid = (x, y) => { const w = wpos(x, y); let p = null; try { p = S3.project(w.x, groundY(w.x, w.z), w.z); } catch (e) { p = null; } return !p || p.behind || p.sy > lim || p.sy < 50 || p.sx < 20 || p.sx > g.clientWidth - 20; };
      if (UI.best && UI.placing && hid(UI.best.x, UI.best.y)) { const w = wpos(UI.best.x, UI.best.y); out.push({ x: w.x, z: w.z, up: 0, label: T('starTip'), cls: 'star', icon: 'star', always: true, nod: true, edge: true }); }
      for (const p of starterList(s)) if (hid(p.x, p.y)) { const w = wpos(p.x, p.y); out.push({ x: w.x, z: w.z, up: 0, label: `${p.n}. ${tx(bname(s, p.k))}`, cls: 'plan', icon: 'blueprint', always: true, nod: true, edge: true }); }
    }
    return out;
  }
  if (UI.tut && UI.tut.target) out.push({ x: UI.tut.target.x, z: UI.tut.target.z, up: 1.2, label: T('tutTarget'), cls: 'tut', always: true });

  if (!UI.tut && UI.goalAt && UI.goal) out.push({ x: UI.goalAt.x, z: UI.goalAt.z, up: 1.5, label: '', cls: 'goal', icon: UI.goal.ic, always: true, nod: true, edgeOnly: typeof S3.setGoal === 'function' });
  if (plDist(h.x, h.z) > 48) out.push({ x: h.x, z: h.z, up: 7, label: T('hubFar'), cls: 'hub', icon: 'home' });
  for (const b of s.b) if (b.broken) { const p = wpos(b.x, b.y); out.push({ x: p.x, z: p.z, up: 6, label: tx(bname(s, b.k)), cls: 'bad', icon: 'wrench' }); }

  if (!UI.scanH) { const kt = kesifTarget(s); if (kt) out.push({ x: kt.w.x, z: kt.w.z, up: 1.2, label: T(scanLatchF() ? 'scanPress' : 'scanHere'), cls: 'tut', always: true }); }
  if (UI.ship) { const p = wpos(UI.ship.tx, UI.ship.ty); out.push({ x: p.x, z: p.z, up: 9, label: T('cargoT'), cls: 'acc', icon: 'rocket' }); }
  for (const p of s.pending) if (p.type === 'event' && p.bid != null) { const b = s.b.find(o => o.id === p.bid); if (b && !b.broken) { const w = wpos(b.x, b.y); out.push({ x: w.x, z: w.z, up: 6, label: tx(EVENTS[p.id].title), cls: 'warn', icon: 'radio' }); } }

  if (UI.lastB && performance.now() < (UI.lastBUntil || 0) && s.b.includes(UI.lastB)) { const b = UI.lastB, w = wpos(b.x, b.y); out.push({ x: w.x, z: w.z, up: 6, label: `${tx(bname(s, b.k))} · ${statusOf(s, b)[1]}`, cls: 'acc', icon: 'build', always: true, nod: true }); }
  return out;
}
function renderMarkers() {
  const s = UI.s, box = $('markers'), game = $('game'), W = game.clientWidth, H = game.clientHeight, m = 36;
  const list = UI.gl ? markerTargets(s) : [], tc = $('hudTC'), gTop = game.getBoundingClientRect().top;
  const dr = $('drawer'), drH = UI.plan && dr && !dr.hidden ? dr.getBoundingClientRect().height : 0;
  while (box.children.length < list.length) { const e = document.createElement('div'); e.className = 'mk'; e.innerHTML = '<i class="mk-ar"></i><span class="mk-ic"></span><span class="mk-tx"></span>'; box.appendChild(e); }
  for (let i = 0; i < box.children.length; i++) {
    const el = box.children[i], t = list[i];
    if (!t) { el.hidden = true; continue; }
    let p = null; try { p = S3.project(t.x, groundY(t.x, t.z) + t.up, t.z); } catch (e) { p = null; }
    if (!p) { el.hidden = true; continue; }
    const d = plDist(t.x, t.z);
    if (!t.always && d < 7) { el.hidden = true; continue; }

    const tcb = tc ? tc.getBoundingClientRect().bottom - gTop : 0, top = Math.max(UI.plan ? 60 : 112, tcb + 22), bot = UI.plan ? drH + 62 : 130;
    let sx = p.sx, sy = p.sy, off = t.edge || p.behind || sx < m || sx > W - m || sy < top || sy > H - bot, ang = 0;
    if (off) {
      let dx = sx - W / 2, dy = sy - H / 2; if (Math.abs(dy) < 1 && Math.abs(dx) < 1) dy = 1;
      const k = Math.min((W / 2 - m) / Math.max(1e-6, Math.abs(dx)), (H / 2 - Math.max(top, bot)) / Math.max(1e-6, Math.abs(dy)));
      sx = W / 2 + dx * k; sy = clamp(H / 2 + dy * k, top, H - bot); ang = Math.atan2(dy, dx);
    }
    if (t.edgeOnly && !off) { el.hidden = true; continue; }
    el.hidden = false; el.className = 'mk ' + t.cls + (off ? ' edge' : '');
    el.style.transform = `translate(${sx | 0}px, ${sy | 0}px)`;
    el.firstChild.style.transform = `rotate(${ang}rad)`;
    const k2 = t.label + '|' + (t.nod ? '' : Math.round(d)) + t.icon;
    if (el._k !== k2) { el._k = k2; el.children[1].innerHTML = t.icon ? ico(t.icon) : ''; el.children[2].textContent = t.nod || !t.label ? t.label : `${t.label} · ${Math.round(d)} m`; }
  }
}
const RADAR_M = 56;
const RADAR_COL = { i: '#8fd8ff', m: '#f0a050', t: '#9a7cff', s: '#ffd166' };
function drawRadar() {
  const cv = $('radar'), s = UI.s; if (!cv || !UI.gl || !S3.player || !UI.pda || !UI.mapOn) return;
  const d = Math.min(2, window.devicePixelRatio || 1), sz = cv.clientWidth || 150;
  if (cv.width !== Math.round(sz * d)) { cv.width = cv.height = Math.round(sz * d); }
  const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, sz, sz);
  const c = sz / 2, R = c - 3, sc = R / RADAR_M, P = S3.player;
  g.save(); circ(g, c, c, R); g.fillStyle = 'rgba(6,10,18,.62)'; g.fill(); g.clip();
  g.strokeStyle = 'rgba(160,200,255,.14)'; g.lineWidth = 1;
  for (const f of [0.33, 0.66]) { circ(g, c, c, R * f); g.stroke(); }
  g.beginPath(); g.moveTo(c - R, c); g.lineTo(c + R, c); g.moveTo(c, c - R); g.lineTo(c, c + R); g.stroke();
  const at = (wx, wz) => [c + (wx - P.x) * sc, c + (wz - P.z) * sc];

  const [x0, y0] = at(0, 0), [x1, y1] = at(MAPW * TILE_M, MAPH * TILE_M);
  g.strokeStyle = 'rgba(160,200,255,.22)'; g.setLineDash([3, 3]); g.strokeRect(x0, y0, x1 - x0, y1 - y0); g.setLineDash([]);
  for (let ty = 0; ty < MAPH; ty++) for (let tx2 = 0; tx2 < MAPW; tx2++) {
    const k = s.map.k[ty * MAPW + tx2]; if (!RADAR_COL[k] || !isSeen(s, tx2, ty)) continue;
    const w = wpos(tx2, ty), [px, py] = at(w.x, w.z); if (Math.hypot(px - c, py - c) > R + 4) continue;
    g.fillStyle = RADAR_COL[k];
    if (k === 's') { g.beginPath(); g.moveTo(px, py - 4); g.lineTo(px + 4, py); g.lineTo(px, py + 4); g.lineTo(px - 4, py); g.fill(); }
    else { g.globalAlpha = 0.75; circ(g, px, py, 2.6); g.fill(); g.globalAlpha = 1; }
  }
  for (const b of s.b) {
    const w = wpos(b.x, b.y), [px, py] = at(w.x, w.z), r = b.k === 'hub' ? 4.5 : 3;
    g.fillStyle = b.broken ? '#ff5d4d' : b.left > 0 ? 'rgba(220,230,245,.45)' : b.k === 'hub' ? getAcc() : '#e9eef6';
    g.fillRect(px - r, py - r, r * 2, r * 2);
  }
  if (UI.ship) { const w = wpos(UI.ship.tx, UI.ship.ty), [px, py] = at(w.x, w.z); g.fillStyle = getAcc(); g.beginPath(); g.moveTo(px, py - 5); g.lineTo(px + 4, py + 4); g.lineTo(px - 4, py + 4); g.fill(); }
  if (UI.tut && UI.tut.target) { const [px, py] = at(UI.tut.target.x, UI.tut.target.z); g.strokeStyle = '#ffe27a'; g.lineWidth = 2; circ(g, px, py, 4 + (performance.now() / 300 % 3)); g.stroke(); }
  g.restore();

  const fx = -Math.sin(P.yaw || 0), fz = -Math.cos(P.yaw || 0);
  g.save(); g.translate(c, c); g.rotate(Math.atan2(fz, fx) + Math.PI / 2);
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, -7); g.lineTo(5, 5); g.lineTo(0, 2.5); g.lineTo(-5, 5); g.closePath(); g.fill();
  g.restore();
  g.fillStyle = 'rgba(233,238,246,.8)'; g.font = '600 10px Chakra Petch, Segoe UI, sans-serif'; g.textAlign = 'center'; g.fillText(LANG === 'en' ? 'N' : 'K', c, 12);
}
let accCache = null;
function getAcc() { if (!accCache || accCache.w !== UI.s.world) accCache = { w: UI.s.world, c: getComputedStyle($('app')).getPropertyValue('--accent').trim() || '#8fd0ff' }; return accCache.c; }


function suitTick(dt, running) {
  const s = UI.s; if (!s.pl || !UI.gl) return;
  if (!running || (UI.mode !== 'walk' && !UI.clickWalk) || UI.recallT) return;
  if (nearAir(s)) { s.pl.o2 = Math.min(1, s.pl.o2 + dt / 6); if (s.pl.o2 > 0.5) UI.o2Warned = false; return; }
  s.pl.o2 = Math.max(0, s.pl.o2 - dt / (s.level === 'kasif' ? 360 : 240));
  if (s.pl.o2 <= 0.25 && !UI.o2Warned) { UI.o2Warned = true; subLocal('atlas', T('o2Warn'), 'warn', true); Snd.play('warn'); }
  if (s.pl.o2 <= 0) recall();
}
function recall() {
  const s = UI.s, f = $('fade'); UI.recallT = 1; scanStop();
  f.hidden = false; f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
  setTimeout(() => {
    if (UI.s !== s) return;
    const h = hubPos(); S3.setPlayer(h.x, h.z + 12, 0);
    s.pl.o2 = 1; s.mmod = (s.mmod || 0) - 3; UI.o2Warned = false;
    subLocal('atlas', T('o2Recall'), 'warn', true);
  }, 700);
  setTimeout(() => { f.hidden = true; UI.recallT = 0; }, 1800);
}



const TUT_CORE = ['air', 'build', 'oksijen', 'choice', 'time', 'night', 'ship', 'radio'];
const TUT_INFO = { air: 1, night: 1, ship: 1, radio: 1 };
const TUT_HL = { air: '#g-o2', build: '#acts [data-act="buildMenu"]', time: '#speedBtn', night: '#g-guc', ship: '#menuBtn', radio: '#menuBtn' };
let TUT = TUT_CORE.slice();
function startTutorial(gate) {
  const s = UI.s;
  TUT = (UI.mode === 'walk' && !UI.touch ? ['look', 'walk'] : []).concat(TUT_CORE);
  UI.tut = { step: -1, gate: !!gate && !s.b.some(b => b.k === 'gunes'), yaw: null, turn: 0, drag: 0 };
  tutGo(0);
}
const tutBuildK = () => { const t = UI.tut; if (!t) return null; const st = TUT[t.step]; return st === 'build' ? 'gunes' : st === 'oksijen' ? 'oksijen' : null; };
function tutMsg(s, st) {
  const nm = k => tx(bname(s, k)), T2 = k => T(k + (UI.touch && STR[k + 'T'] ? 'T' : ''));
  if (st === 'look' || st === 'walk') return T2('tut_' + st);
  if (st === 'air') { const dl = s.res.o2 / Math.max(1e-6, s.pop * NEED.o2); return T(s.world === 'mars' ? 'tut_airM' : 'tut_air', num(Math.floor(dl))); }
  if (st === 'build') return T(UI.touch ? 'tut_buildT' : 'tut_build', nm('gunes'));
  if (st === 'oksijen') return T('tut_oksijen', nm('oksijen'), num(WORLDS[s.world].solarPeak, 0), num(BLD.oksijen.kw || 0, 0));
  if (st === 'choice') return T('tut_choice', nm('sera'), nm('batarya'));
  return T2('tut_' + st);
}
function tutGo(i) {
  const s = UI.s, t = UI.tut; if (!t) return;
  if (i >= TUT.length) { endTutorial(false); return; }
  t.step = i; t.t0 = performance.now(); t.target = null; t.okT = 0;
  const st = TUT[i];
  if (st === 'walk') t.target = tutWalkTarget(s);
  if (st === 'look') { t.yaw = UI.gl && S3.player ? S3.player.yaw : 0; t.turn = 0; t.drag = 0; }
  if (UI.plan && tutBuildK()) pickB(tutBuildK(), true);
  if (st === 'choice') { UI.placing = null; UI.sel = null; UI.best = null; UI.pend = null; try { S3.setGhost(null); } catch (e) {   } updateHints(); }
  if (UI.plan) { UI.cache.drawer = null; renderDrawer(); }
  renderObjective(); tutHighlight();
}
function tutOk() {
  const t = UI.tut; if (!t || t.okT) return;
  t.okT = performance.now(); Snd.play('tick'); renderObjective();
  setTimeout(() => { if (UI.tut === t) { t.okT = 0; tutGo(t.step + 1); } }, 900);
}
function tutEvent(ev) {
  const t = UI.tut; if (!t || t.okT) return;
  const st = TUT[t.step];
  if (ev === st || (st === 'build' && ev === 'build:gunes') || (st === 'oksijen' && ev === 'build:oksijen') || (st === 'radio' && ev === 'radioLog')) { tutOk(); return; }
  if (st === 'choice' && (ev === 'build:sera' || ev === 'build:batarya')) { subLocal('atlas', T(ev === 'build:sera' ? 'tutChoseSera' : 'tutChoseBat'), 'info', true); tutOk(); }
}
function tutHighlight() {
  const t = UI.tut, sel = t ? TUT_HL[TUT[t.step]] : null, key = (sel || '') + UI.plan;
  if (UI._hlk === key && (!sel || document.querySelector(sel + '.tut-hl'))) return;
  UI._hlk = key;
  document.querySelectorAll('.tut-hl').forEach(e => e.classList.remove('tut-hl'));
  if (sel && !(UI.plan && TUT[t.step] === 'build')) { const e = document.querySelector(sel); if (e) e.classList.add('tut-hl'); }
}
function tutTick() {
  const t = UI.tut; if (!t) { if (UI._hlk) { UI._hlk = ''; document.querySelectorAll('.tut-hl').forEach(e => e.classList.remove('tut-hl')); } return; }
  tutHighlight();
  if (t.okT || !UI.gl) return;
  const st = TUT[t.step], P = S3.player;
  if (st === 'look' && P) {
    if (t.yaw != null) { let d = P.yaw - t.yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; t.turn += Math.abs(d); }
    t.yaw = P.yaw;
    if (t.turn > 1.2 || t.drag > 260) tutOk();
  } else if (st === 'walk' && t.target) { if (plDist(t.target.x, t.target.z) < 9) tutOk(); }
}
function tutWalkTarget(s) {
  let best = null, bd = 1e9; const P = S3.player || hubPos();
  for (let ty = 0; ty < MAPH; ty++) for (let tx2 = 0; tx2 < MAPW; tx2++) {
    const k = tileAt(s, tx2, ty), dh = Math.hypot(tx2 - HUBX, ty - HUBY);
    if (!isSeen(s, tx2, ty) || !'mir'.includes(k) || dh < 2.2 || dh > 6) continue;
    const w = wpos(tx2, ty), d0 = Math.hypot(w.x - P.x, w.z - P.z), d = d0 + (k === 'r' ? 10 : 0);
    if (d0 < 20) continue;
    if (d < bd) { bd = d; best = { tx: tx2, ty, x: w.x, z: w.z }; }
  }
  if (!best) { const w = wpos(HUBX + 3, HUBY + 2); best = { tx: HUBX + 3, ty: HUBY + 2, x: w.x, z: w.z }; }

  const dx = best.x - P.x, dz = best.z - P.z, L0 = Math.hypot(dx, dz) || 1;
  return Object.assign(best, { x: best.x - dx / L0 * 5, z: best.z - dz / L0 * 5 });
}
function endTutorial(skipped) {
  UI.tut = null; UI.set.tut = 1; saveSettings();
  renderObjective(); tutTick();
  if (!skipped) modalTutSum(); else showChapter();
}
const tutGate = () => !!(UI.tut && UI.tut.gate && UI.tut.step <= TUT.indexOf('time'));


function tabsFor(s) {
  const araOn = UI.pda === 'ara' || techCount(s) > 0 || TECH_ORDER.some(id => techState(s, id) === 'ok') || (!kasif() && dayOf(s) >= 3);
  const og = !!mod('OGRET');
  return PDA_TABS.filter(t => (t !== 'ara' || araOn) && (t !== 'defter' || og));
}

const ogFresh = () => { const O = mod('OGRET'); return O && typeof O.fresh === 'function' ? safeN0(() => O.fresh()) : 0; };
const safeN0 = f => { try { const v = +f(); return Number.isFinite(v) && v > 0 ? v : 0; } catch (e) { return 0; } };
function ogSeen() { const O = mod('OGRET'); if (O && typeof O.seen === 'function') try { O.seen(); } catch (e) { console.error(e); } }
function openPda(tab) {
  if (!UI.s || UI.modal) return;
  scanStop(); if (UI.plan) exitPlan();
  UI.pda = PDA_TABS.includes(tab) && (tab !== 'defter' || mod('OGRET')) ? tab : (UI.pda || 'gorev');
  $('pda').hidden = false; s3Input(false);
  if (UI.pda === 'defter') ogSeen();
  if (UI.pda === 'telsiz') telsizSeen();
  $('pda').dataset.tab = UI.pda;
  UI.cache.pda = null; renderPda(); $('pdaBody').scrollTop = 0;
  Snd.play('click'); tutEvent('pda');
}
function telsizSeen() { const s = UI.s; UI.telSeen = (s.pl && s.pl.radioRead) || 0; markRead(s.radioN || 0); tutEvent('radioLog'); }
function closePda() {
  if (!UI.pda) return;
  if (UI.pda === 'banka') markBankSeen();
  UI.pda = null; $('pda').hidden = true;
  if (!UI.modal) s3Input(true);
}
function markBankSeen() { const s = UI.s; UI.bankT = s.t; if (s.pl) s.pl.bankT = s.t; }
function pdaHead() {
  const s = UI.s, nb = typeof bankEntries === 'function' ? bankEntries(s).filter(e => e.open && s.bank && s.bank[e.id] > UI.bankT).length : 0;
  const nq = s.quiz ? s.quiz.open.filter(q => s.quiz.done[q] == null).length : 0;
  const dot = { banka: nb + nq, telsiz: s.pending.length + unreadN(s), ara: TECH_ORDER.filter(id => techState(s, id) === 'ok').length, gorev: UI.pda === 'gorev' ? 0 : (UI.rwDot || 0), defter: UI.pda === 'defter' ? 0 : ogFresh() };
  return `<nav class="pda-tabs">${tabsFor(s).map(t => `<button class="ptab ${UI.pda === t ? 'on' : ''}" data-act="pdaTab" data-v="${t}">${T('t_' + t)}${dot[t] ? `<i class="dot">${dot[t]}</i>` : ''}</button>`).join('')}</nav>
    <span class="pda-note">${ico('pause')}${T('pdaPaused')}</span><button class="x" data-act="pdaClose" aria-label="${T('close')}">×</button>`;
}
const rewardTxt = r => Object.keys(r).map(k => `<span class="rw1">${badge(k)}+${r[k]} ${esc(low(T('c_' + k)))}</span>`).join(' ');
const msLi = (s, m) => { const d = !!s.done[m.id], rl = realMs(s, m.id); return `<li class="ms ${d ? 'done' : ''}"><span class="ck">${d ? ico('check') : ''}</span><div><b>${esc(tx(m.t))}</b><p>${esc(tx(m.d))}</p>${rl ? `<p class="ms-real"><i>${T('real')}:</i> ${esc(tx(rl))}${srcHtml(rl)}</p>` : ''}</div><span class="rw">${rewardTxt(m.r)}</span></li>`; };
const moodOf = v => T(v >= 70 ? 'mood_a' : v >= 50 ? 'mood_b' : v >= 35 ? 'mood_c' : 'mood_d');
const radWord = f => T(f < 0.5 ? 'rad_a' : f < 0.75 ? 'rad_b' : 'rad_c');
function mutLadderHtml(s) {
  const mi = mutInfo(s), mx = Math.max(mi ? mi.lvl : 0, (s.mut && s.mut.max) || 0); if (!mi || mx < 1) return '';
  const li = i => `<li class="${mi.lvl >= i ? 'on' : mx >= i ? 'was' : ''}">${T('mut' + i)} ${mi.lvl >= i ? ico('check') : '○'}</li>`;
  return `<div class="mlad ${mi.lvl ? '' : 'calm'}"><b>${ico('crew')} ${mi.lvl ? T('mutLadder') : T('mutCalm')}</b><ol>${li(1)}${li(2)}${li(3)}<li class="cap">→ ${T('mutCapsule')}</li></ol>
    ${mi.lvl ? `<p>${T('mutRisk', T('risk_' + (mi.risk || 'yok')))}</p><p class="note">${T('mutHow')}</p>` : ''}</div>`;
}
function topReasons(s, n) {
  return moraleFactors(s).slice(1).filter(f => Math.abs(f.v) >= 1).sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, n || 3);
}

const uiAchHave = s => Object.assign({}, prof().ach, (s && s.achP) || {}, (s && s.ach) || {});
const giveWord = g => { const m = /^feat:(\w+)$/.exec(g || ''); return m && STR['feat_' + m[1]] ? T('feat_' + m[1]) : ''; };
function achNextHtml(s) {
  let list = callExt('achNext', s, uiAchHave(s));
  { const hv = uiAchHave(s); if (Array.isArray(list)) list = list.filter(a => a && !hv[a.id]); }
  if (!Array.isArray(list)) { const have = uiAchHave(s); list = uiAchList().filter(a => a && !have[a.id] && (!a.w || a.w === s.world) && (!a.lv || a.lv === s.level)).slice(0, 2).map(a => ({ id: a.id, name: a.name, how: a.how, prog: 0, gives: a.gives })); }
  if (!list.length) return '';
  return `<div class="achnext"><small>${ico('trophy')} ${T('ach_next')}</small>${list.slice(0, 2).map(a => { const p = clamp(+a.prog || 0, 0, 1), gv = (a.gives || []).map(giveWord).filter(Boolean).join(', ');
    return `<div class="an1"><b>${esc(tx(a.name))}</b>${a.how ? `<p>${esc(tx(a.how))}</p>` : ''}${gv ? `<p class="an-g">${ico('star')} ${esc(T('ach_gives', gv))}</p>` : ''}<div class="pbar"><i style="width:${Math.round(p * 100)}%"></i></div></div>`; }).join('')}</div>`;
}
function achListHtml(s) {
  const all = uiAchList(); if (!all.length) return '';
  const have = uiAchHave(s), n = all.filter(a => have[a.id]).length;
  return `<details class="fold ach" id="achSec" ${UI.achOpen ? 'open' : ''}><summary>${ico('trophy')} ${T('ach_T')} · ${n} / ${all.length}</summary><ul class="achl">${all.map(a => `<li class="${have[a.id] ? 'got' : ''}" data-id="${esc(a.id)}"><span class="ck">${have[a.id] ? ico('check') : ico('lock')}</span><div><b>${esc(tx(a.name))}</b>${a.how ? `<p>${esc(tx(a.how))}</p>` : ''}</div></li>`).join('')}</ul></details>`;
}
function pdaBody() {
  const s = UI.s, W = WORLDS[s.world], tab = UI.pda;
  if (tab === 'defter') { const O = mod('OGRET'); let h = ''; try { h = O && typeof O.notebook === 'function' ? String(O.notebook() || '') : ''; } catch (e) { console.error(e); h = ''; } return `<div class="defter">${h}</div>`; }
  if (tab === 'gorev') {
    const st = story(s), chI = s.story ? s.story.ch : 0, dn = dayOf(s), md = W.missionDays;
    const chs = st && st.chapters ? `<details class="fold"><summary>${T('chapters')}${st.title ? ' · ' + esc(tx(st.title)) : ''}</summary><ol class="chaps">${st.chapters.map((c, i) => `<li class="${i < chI ? 'done' : i === chI ? 'now' : 'lock'}"><span>${i + 1}</span><div><b>${i <= chI ? esc(tx(c.name)) : T('chapLock')}</b>${i <= chI && c.sub ? `<p>${esc(tx(c.sub))}</p>` : ''}${i <= chI && c.goal ? `<p>${esc(tx(c.goal))}</p>` : ''}</div></li>`).join('')}</ol></details>` : '';
    const stars = `<ol class="stars"><li>${ico('star')}${T('star1')}</li><li>${ico('star')}${ico('star')}${T('star2')}</li><li>${ico('star')}${ico('star')}${ico('star')}${T('star3')}</li></ol>`;
    const open = MISSIONS.filter(m => !s.done[m.id]), nd = MISSIONS.length - open.length;
    const now = open.filter(m => typeof goalReady !== 'function' || goalReady(s, m)).slice(0, 2).map(m => msLi(s, m)).join('');
    const all = MISSIONS.slice().sort((a, b) => (s.done[a.id] ? 1 : 0) - (s.done[b.id] ? 1 : 0)).map(m => msLi(s, m)).join('');
    const mg = callExt('missionGoal', s);
    return `<div class="gmain"><small>${T('goal')}</small><h3>${mg ? esc(tx(mg)) : T('goalTxt', md, dayUnit(W, md))}</h3><p>${T('goalSub')}</p>
        <div class="pbar"><i style="width:${clamp(s.t / (md * 24) * 100, 0, 100)}%"></i></div><span class="gday">${T('dayOfN', Math.min(dn, md), low(tx(W.dayWord)), md)}</span>${stars}</div>
      ${achNextHtml(s)}${rwCard(s, true)}<h4>${T('nowDo')}</h4>${now ? `<ul class="mlist">${now}</ul>` : `<p class="note">${T('allDone')}</p>`}
      ${achListHtml(s)}
      <details class="fold"><summary>${T('allGoals', nd, MISSIONS.length)}</summary><ul class="mlist">${all}</ul></details>${chs}`;
  }
  if (tab === 'ara') {
    let h = `<div class="sci">${badge('bilim')}<b>${num(Math.floor(s.res.bilim))}</b><span>${T('sciPts')} · ${sgn(s.rate.bilim.p)}${T('perDay')}</span></div>`;
    for (const tier of [1, 2, 3]) {
      h += `<h4>${T('tier', tier)}${tier > 1 ? `<small>${T('tierReq')}</small>` : ''}</h4><div class="tgrid">`;
      for (const id of TECH_ORDER) {
        const t = TECHS[id]; if (t.tier !== tier) continue;
        const st = techState(s, id);
        h += `<div class="tech" data-state="${st}"><div><b>${esc(tx(t.name))}</b><p>${esc(tx(t.desc))}</p></div>` +
          (st === 'own' ? `<span class="own">${ico('check')}</span>` : st === 'kilit' ? `<span class="lk">${ico('lock')}</span>` : `<button class="btn acc" data-act="tech" data-v="${id}" ${st === 'ok' ? '' : 'disabled'}>${ico('flask')}${t.cost}</button>`) + `</div>`;
      }
      h += '</div>';
    }
    return h;
  }
  if (tab === 'ekip') {
    const ks = kasif(), bd = beds(s), sb = shieldedBeds(s), busy = busyWorkers(s), rf = radFrac(s);
    const need = {}; for (const b of s.b) if (b.left === 0 && b.on && !b.broken && workersOf(s, b.k)) { const n = need[b.k] || (need[b.k] = [0, 0]); n[0]++; if (b.st !== 'isci' && b.st !== 'siginak') n[1]++; }
    const wl = Object.keys(need).map(k => `<li><span>${esc(tx(bname(s, k)))}</span><b class="${need[k][1] < need[k][0] ? 'neg' : ''}">${need[k][1]} / ${need[k][0]}</b></li>`).join('');
    const reasons = topReasons(s, 3).map(f => `<li><span>${esc(tx(f.l))}</span><b class="${f.v < 0 ? 'neg' : 'pos'}">${sgn(f.v, 0)}</b></li>`).join('');
    const idleN = Math.max(0, Math.min(s.idle, s.pop - busy)), working = Math.max(0, s.pop - busy - idleN);
    return `<div class="ecards">
      <section class="ecard"><h4>${badge('moral')} ${T('c_moral')}</h4><div class="ebig"><b>${num(s.moral)}</b><span>${moodOf(s.moral)}</span></div>
        ${reasons ? `<small>${T('topReasons')}</small><ul class="fl">${reasons}</ul>` : ''}${ks ? '' : `<p class="note">${T('moralEff')}: ${pct(moraleMult(s))}</p>`}${mutLadderHtml(s)}</section>
      <section class="ecard"><h4>${badge('doz')} ${T('c_doz')}</h4><div class="ebig"><b>${ks ? T('radPctS', Math.round(rf * 100)) : `${num(s.dose)} mSv <small>${T('doseU')}</small>`}</b><span data-c="${rf < 0.5 ? 'good' : rf < 0.75 ? 'warn' : 'bad'}">${radWord(rf)}</span></div>
        <div class="dbar"><i style="width:${rf * 100}%"></i></div><small>${ks ? T('radPctD') : T('radLimit', LIMIT_DOSE) + ' · ' + T('doseNow') + ': ' + num(doseRate(s), 2) + ' mSv'}</small></section>
      <section class="ecard"><h4>${badge('ekip')} ${T('workers')}</h4><p class="ewl">${T('workersLine', s.pop, working, idleN)}</p>${busy ? `<p class="note">${T('awayN', busy)}</p>` : ''}
        <p>${T('bedsLine', bd, sb)}</p>${wl ? `<details class="fold"><summary>${T('perBuilding')}</summary><ul class="fl">${wl}</ul></details>` : ''}</section></div>`;
  }
  if (tab === 'banka') {
    const list = typeof bankEntries === 'function' ? bankEntries(s) : [], n = list.filter(e => e.open).length;
    let h = `<div class="bank-top"><div class="sci">${ico('info')}<span>${T('bankN', n, list.length)}</span></div><button class="btn" data-act="src">${T('sources')}</button></div>`;
    const qo = s.quiz ? s.quiz.open : [];
    h += `<section class="quizbox"><h4>${ico('quiz')} ${T('quizT')}<small>${T('quizD')}</small></h4>`;
    if (!qo.length) h += `<p class="note">${T('quizNone')}</p>`;
    else h += '<ul class="qlist">' + qo.slice().sort((a, b) => (s.quiz.done[a] == null ? 0 : 1) - (s.quiz.done[b] == null ? 0 : 1)).map(qi => {
      const q = QUIZ[qi], dn = s.quiz.done[qi];
      return `<li class="${dn == null ? 'open' : dn ? 'ok' : 'no'}"><p>${esc(tx(q.q))}</p>${dn == null ? `<button class="btn acc" data-act="quizOpen" data-v="${qi}">${T('quizGo')}</button>` : `<span class="qres">${dn ? ico('check') + T('quizOk') : ico('x') + T('quizNo')}</span>`}</li>`;
    }).join('') + '</ul>';
    h += '</section>';
    const order = ['kayit', 'kesif', 'bina', 'tek', 'olay'], cats = {};
    for (const e of list) (cats[e.cat] || (cats[e.cat] = [])).push(e);
    for (const c of order.concat(Object.keys(cats).filter(c => !order.includes(c)))) {
      const arr = cats[c]; if (!arr) continue;
      const op = arr.filter(e => e.open), shut = arr.length - op.length;
      h += `<h4>${STR['cat_' + c] ? T('cat_' + c) : esc(c)}<small>${op.length} / ${arr.length}</small></h4><div class="fgrid">` + op.map(e => {
        const nw = s.bank && s.bank[e.id] > UI.bankT;
        return `<div class="fcard ${nw ? 'new' : ''}" data-cat="${esc(c)}"><b>${nw ? `<i class="newtag">${T('isNew')}</i>` : ''}${esc(tx(e.title))}</b><p>${esc(tx(e.text))}</p>${e.fact && tx(e.fact) !== tx(e.text) ? factHtml(e.fact) : ''}</div>`;
      }).join('') + (shut ? `<div class="fcard off"><b>${ico('lock')} ${shut}</b><p>${T('bankLock')}</p></div>` : '') + '</div>';
    }
    return h;
  }
  if (tab === 'telsiz') {
    const pend = callList(s).map(p => {
      const ev = p.type === 'event' ? EVENTS[p.id] : null, left = p.due != null ? fmtH(p.due - s.t) : '';
      const title = ev ? tx(ev.title) : T('cargoT');
      return `<li class="pcall"><span class="s-ic">${ico(ev ? 'radio' : 'rocket')}</span><div><b>${esc(title)}</b>${left ? `<small>${left}</small>` : ''}</div><button class="btn acc" data-act="call" data-v="${esc(pidOf(p))}">${T('callAns')}</button></li>`;
    }).join('');
    const items = [];
    if (UI.telF !== 'log') (s.radio || []).forEach(r => items.push({ t: r.t, o: 1e6 + (r.n || 0), r }));
    if (UI.telF !== 'radio') (s.log || []).forEach((l, i) => items.push({ t: l.t, o: i, l }));
    items.sort((a, b) => b.t - a.t || b.o - a.o);
    const when = t => `${tx(W.dayWord)} ${Math.floor(t / 24) + 1} · ${String(t % 24).padStart(2, '0')}:00`;
    const hist = items.slice(0, 120).map(it => {
      if (it.l) return `<li class="ev" data-c="${it.l.c}"><span class="s-ic" data-f="ev">${ico('info')}</span><div><time>${when(it.l.t)}</time><p>${esc(tx(it.l.m))}</p></div></li>`;
      const r = it.r, sp = speakerOf(r), nw = r.n > UI.telSeen;
      return `<li data-c="${r.c || 'info'}" class="${r.def != null ? 'def' : ''} ${nw ? 'new' : ''}"><span class="s-ic" data-f="${esc(sp.f)}">${ico(FROM_IC[sp.f] || 'radio')}</span><div><time>${esc(sp.name)} · ${when(r.t)}${nw ? ` <i class="newtag">${T('isNew')}</i>` : ''}</time>${r.title ? `<b>${esc(tx(r.title))}</b>` : ''}<p>${esc(txa(r.text))}</p>${r.hint ? `<p class="s-hint"><b>${T('subHint')}</b> ${esc(tx(r.hint))}</p>` : ''}${r.fact ? factHtml(r.src && !r.fact.src ? Object.assign({}, r.fact, { src: r.src }) : r.fact) : ''}</div></li>`;
    }).join('');
    const fch = ['all', 'radio', 'log'].map(f => `<button class="gchip ${UI.telF === f ? 'on' : ''}" data-act="telF" data-v="${f}">${T('f_' + f)}</button>`).join('');
    return `${pend ? `<h4>${T('pendingN')}</h4><ul class="pcalls">${pend}</ul>` : ''}<div class="telf"><h4>${T('history')}</h4><div class="gchips">${fch}</div></div>${hist ? `<ul class="rlog">${hist}</ul>` : `<p class="note">${T('noMsgs')}</p>`}`;
  }
  return '';
}
function renderPda() {
  { const pe = $('pda'); if (pe && pe.dataset.tab !== (UI.pda || '')) pe.dataset.tab = UI.pda || ''; }
  if (!UI.pda || !UI.s) return;
  if (UI.pda === 'gorev' && UI.rwDot) UI.rwDot = 0;
  if (UI.pda === 'gorev' && UI.achDot) UI.achDot = 0;
  const hh = pdaHead() + LANG; if ($('pdaHead')._k !== hh) { $('pdaHead')._k = hh; $('pdaHead').innerHTML = pdaHead(); }
  const h = pdaBody();
  if (UI.cache.pda === h) return;
  const el = $('pdaBody'), sc = el.scrollTop, op = [...el.querySelectorAll('details')].map(d => d.open);
  UI.cache.pda = h; el.innerHTML = h; el.scrollTop = sc; el.dataset.tab = UI.pda;
  el.querySelectorAll('details').forEach((d, i) => { if (op[i]) d.open = true; });
  if (UI.pda === 'defter') { const O = mod('OGRET'); if (O && typeof O.paint === 'function') try { O.paint(el); } catch (e) { console.error(e); } }
  if (UI.achOpen) { UI.achOpen = false; const a = $('achSec'); if (a) { a.open = true; try { a.scrollIntoView({ block: 'start' }); } catch (e) {   } } }
}
function refresh(force) {
  if (!UI.s || UI.screen !== 'game') return;
  if (force) { UI.cache = {}; }
  updateHud(); renderPda(); renderDrawer(); renderPlanUi();
}


function openModal(html, cls) {
  scanStop();
  UI.modal = cls || 'm'; $('modalBox').className = cls || ''; $('modalBox').innerHTML = html; $('modal').hidden = false; $('modal').dataset.kind = cls || ''; $('hud').classList.toggle('side', cls === 'creator' || cls === 'wardrobe');
  $('modalBox').scrollTop = 0;
  s3Input(false);
  const f = $('modalBox').querySelector('button:not([disabled])'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {   }
}
function closeModal() {
  UI.modal = null; $('modal').hidden = true; $('modalBox').innerHTML = ''; $('modal').dataset.kind = ''; $('hud').classList.remove('side');
  if (UI.screen === 'game' && !UI.pda) s3Input(true);
}
const SOFT = { about: 1, help: 1, src: 1, detail: 1, menu: 1, bcard: 1, nogl: 1, tutsum: 1 };
function modalNoGl() {
  openModal(`<div class="m-head"><span class="m-ic">${ico('info')}</span><div><h2>${T('noGlT')}</h2></div></div><p class="m-text">${T('noGlD')}</p>
    <div class="m-foot"><button class="primary" data-act="closeModal">${T('back')}</button></div>`, 'nogl');
}
function modalHelp() {
  openModal(`<div class="m-head"><span class="m-ic">${ico('info')}</span><div><h2>${T('how')}</h2></div></div>
    <dl class="help">${[1, 2, 3, 4, 5, 6].map(i => `<dt>${T('h' + i)}</dt><dd>${T('h' + i + 'd')}</dd>`).join('')}</dl>
    <div class="m-foot"><button class="primary" data-act="closeModal">${T('ok')}</button></div>`, 'help');
}
function modalSources() {
  openModal(`<div class="m-head"><span class="m-ic">${ico('flask')}</span><div><h2>${T('sources')}</h2><small>${T('nonNasa')}</small></div></div>
    <p class="note">${T('aiNote')}</p>
    <ul class="srcs">${SOURCES.map(r => `<li><b>${esc(tx(r[0]))}</b><span>${esc(r[1])}</span></li>`).join('')}</ul>
    <p class="note"><b>${T('simpl')}.</b> ${esc(tx(SIMPLIFY))}</p>
    <div class="m-foot"><button class="primary" data-act="closeModal">${T('ok')}</button></div>`, 'src');
}


function modalAbout() {
  const rows = [
    [L('Her kişi her gün su kullanır (içme, yemek, temizlik).', 'Each person uses water every day (drinking, food, washing).'), L('Kişi başı günde yaklaşık 3,8 L (bir galon)', 'About 3.8 L (one gallon) per person per day'), 'NASA · NASA Achieves Water Recovery Milestone on International Space Station'],
    [L('Su ve Hava Geri Dönüştürücü kullanılmış suyu temizler (oyunda su ihtiyacını %85 azaltır).', 'The Water & Air Recycler cleans used water (in the game it cuts the water need by 85%).'), L('Uzay İstasyonu suyun %98\'ini geri kazanır', 'The space station recovers 98% of its water'), 'NASA · NASA Achieves Water Recovery Milestone on International Space Station'],
    [L('Mars\'ta radyasyon dozu her gün artar.', 'On Mars the radiation dose rises every day.'), L('Yüzeyde günde 0,67 mSv', '0.67 mSv a day on the surface'), 'NASA · Curiosity RAD (Hassler et al. 2014)'],
    [L('Mars ekibi yolculuktan bir dozla gelir.', 'The Mars crew arrives with a dose from the trip.'), L('Yolda günde 1,8 mSv; 6 ayda yaklaşık 330 mSv (bizim hesabımız: 360 günlük gidiş-dönüşün 0,66 Sv\'sinin yarısı)', '1.8 mSv a day in transit; about 330 mSv for 6 months (our calculation: half of 0.66 Sv for a 360-day round trip)'), 'NASA · Curiosity RAD (Zeitlin et al. 2013)'],
    [L('Doz sınıra ulaşırsa görev biter.', 'If the dose reaches the limit, the mission ends.'), L('Astronot kariyer sınırı 600 mSv', 'Astronaut career limit 600 mSv'), 'NASA-STD-3001, Vol. 1 · NASA OCHMO'],
    [L('Ay üssü Shackleton krateri kenarında kurulur (güneş paneli için ışık).', 'The Moon base sits on the rim of Shackleton crater (light for solar panels).'), L('Kenardaki üç nokta yılın %90\'ından fazlasında güneş alır', 'Three rim points get sunlight more than 90% of the year'), 'NASA Science · Shackleton Crater\'s Illuminated Rim & Shadowed Interior'],
    [L('Mars\'ta toz fırtınası güneş elektriğini düşürür.', 'On Mars, dust storms cut solar power.'), L('InSight\'ın elektriği onda birine düştü (sol başına yaklaşık 5.000 Wh\'den 500 Wh\'e)', 'InSight\'s power fell to about one tenth (about 5,000 to 500 Wh per sol)'), 'NASA Science · InSight\'s Power Generation'],
    [L('Her kişi her gün yemek tüketir (oyunda kişi başı günde 1,8 kg).', 'Each person eats every day (1.8 kg per person per day in the game).'), L('Uzay İstasyonu\'nda kişi başı günde 1,83 kg ambalajlı yemek (bugün 2,39 kg)', '1.83 kg of packaged food per person per day on the Space Station (now 2.39 kg)'), 'NASA · Life Support Baseline Values and Assumptions Document (BVAD), Rev 2'],
    [L('Nükleer Jeneratör gece gündüz 10 kW elektrik yapar; yakıtı Dünya\'dan 1.500 kg\'lık kargoyla gelir.', 'The Nuclear Generator makes 10 kW day and night; its fuel comes from Earth as 1,500 kg of cargo.'), L('Kilopower: 10 kW\'ta tüm sistem yaklaşık 1.500 kg', 'Kilopower: about 1,500 kg for the complete system at 10 kW'), 'NASA Glenn · Kilopower: Small & Affordable Fission Power Systems for Space'],
  ];
  const tr = rows.map(r => `<tr><td>${esc(tx(r[0]))}</td><td><b>${esc(tx(r[1]))}</b></td><td class="ab-src">${esc(tx(r[2]))}</td></tr>`).join('');
  openModal(`<div class="m-head"><span class="m-ic">${ico('info')}</span><div><h2>${T('about')}</h2><small>${T('abSub')}</small></div></div>
    <section class="ab-sec"><h3>${T('ab1H')}</h3><p class="m-text">${T('ab1')}</p></section>
    <section class="ab-sec"><h3>${T('ab2H')}</h3><div class="ab-scroll"><table class="ab-tbl"><thead><tr><th>${T('abC1')}</th><th>${T('abC2')}</th><th>${T('abC3')}</th></tr></thead><tbody>${tr}</tbody></table></div>
      <p class="note">${T('ab2N')}</p></section>
    <section class="ab-sec"><h3>${T('ab3H')}</h3><p class="m-text">${T('ab3')}</p><p class="m-text">${T('ab3b')}</p></section>
    <section class="ab-sec"><h3>${T('ab4H')}</h3><p class="m-text">${T('ab4')}</p></section>
    <p class="note">${T('abNasa')}</p>
    <div class="m-foot"><button class="btn" data-act="src">${ico('flask')} ${T('sources')}</button><button class="primary" data-act="closeModal">${T('ok')}</button></div>`, 'about');
}

function modalMenu() {
  closePda(); if (UI.plan) exitPlan();
  openModal(`<div class="m-head pause-head"><span class="m-ic">${ico('pause')}</span><div><h2>${T('pauseH')}</h2><small>${T('pauseSub')}</small></div></div>
    <button class="primary big wide" data-act="closeModal">${ico('play')} ${T('resume')}</button>
    <div class="mlistb two"><button class="btn" data-act="sound">${UI.sound ? T('soundOn') : T('soundOff')}</button><button class="btn" data-act="quality">${UI.set.q === 'low' ? T('qLow') : T('qHigh')}</button>
    <button class="btn" data-act="lang">${T('lang')}</button><button class="btn" data-act="tutAgain">${T('tutAgain')}</button>${UI.touch ? '' : `<button class="btn" data-act="keyHints">${T('keyHints', T(uiKeysOn() ? 'khOn' : 'khOff'))}</button>`}
    <button class="btn" data-act="how">${T('how')}</button><button class="btn" data-act="src">${T('sources')}</button></div>
    <button class="btn wide" data-act="wardrobe" data-from="menu">${ico('helmet')} ${T('wd_menu')}</button>
    <button class="btn dim wide" data-act="quit">${T('quit2')}</button><p class="note center">${T('autoSave')}</p>`, 'menu');
}

const UI_PVK = ['o2', 'su', 'gida', 'guc', 'malzeme', 'parca', 'bilim', 'dose', 'moral', 'pop', 'busy'];
const fmtD = v => Math.abs(v - Math.round(v)) < 0.05 ? sgn(v, 0) : sgn(v, 1);
function pvWord(k) { return k === 'dose' ? T('rw_dose') : k === 'moral' ? T('rw_moral') : k === 'pop' ? T('rw_pop') : k === 'busy' ? T('rw_busy') : k === 'guc' ? T('rw_guc') : low(T('c_' + k)); }


function pvList(s, d, h) {
  const out = [], hh = Math.max(1, h || 1);
  for (const k of UI_PVK) {
    let v = d && d[k]; if (!isNum(v)) continue;
    if (k === 'guc') { v = v / hh; if (Math.abs(v) < 0.3) continue; out.push({ k, good: v > 0, t: `${sgn(v, Math.abs(v) >= 2 ? 0 : 1)} ${pvWord(k)}` }); continue; }
    if (Math.abs(v) < 0.5 && !(k === 'dose' && kasif() && Math.abs(v / LIMIT_DOSE * 100) >= 0.5)) continue;
    const good = k === 'dose' || k === 'busy' ? v < 0 : v > 0, val = k === 'dose' ? (kasif() ? (LANG === 'en' ? fmtD(v / LIMIT_DOSE * 100) + '%' : fmtD(v / LIMIT_DOSE * 100).replace(/^([+−])/, '$1%')) : fmtD(v) + ' mSv') : fmtD(v);
    if (k === 'dose' && kasif() && Math.abs(v / LIMIT_DOSE * 100) < 0.5) continue;
    out.push({ k, good, t: `${val} ${pvWord(k)}` });
  }
  return out;
}
function pvHtml(s, pv, head) {
  if (!pv) return '';
  const ch = pvList(s, pv.d, pv.h).map(x => `<span class="pv ${x.good ? 'pos' : 'neg'}">${badge(x.k === 'dose' ? 'doz' : x.k === 'pop' || x.k === 'busy' ? 'ekip' : x.k)}${esc(x.t)}</span>`);
  for (const st of pv.stops || []) if (st && BLD[st.k] && Math.abs(st.h) >= 1) ch.push(`<span class="pv ${st.h > 0 ? 'neg' : 'pos'}">${ico(st.h > 0 ? 'pause' : 'play')}${esc(T(st.h > 0 ? 'prevStop' : 'prevRun', tx(bname(s, st.k)), fmtH(Math.abs(st.h))))}</span>`);
  if (pv.risk) ch.push(`<span class="pv warn">${ico('info')}${esc(tx(pv.risk))}</span>`);
  const words = pvList(s, pv.d, pv.h).map(x => x.t).join(', ');
  return `<span class="pvs" title="${esc(words)}">${head ? `<i>${esc(head)}</i>` : ''}${ch.length ? ch.join('') : `<span class="pv">${T('prevNone')}</span>`}</span>`;
}
function pvMinus(a, b) {
  const d = {}; for (const k of new Set(Object.keys(a.d || {}).concat(Object.keys(b.d || {})))) d[k] = ((a.d || {})[k] || 0) - ((b.d || {})[k] || 0);
  const m = {}; for (const o of a.stops || []) m[o.k] = (m[o.k] || 0) + o.h; for (const o of b.stops || []) m[o.k] = (m[o.k] || 0) - o.h;
  return { d, stops: Object.keys(m).filter(k => Math.abs(m[k]) >= 1).map(k => ({ k, h: m[k] })), h: a.h, risk: a.risk };
}


const DELTA_EL = { o2: 'g-o2', su: 'g-su', gida: 'g-gida', guc: 'g-guc', malzeme: 'r-malzeme', parca: 'r-parca', bilim: 'r-bilim', moral: 'r-moral', dose: 'g-doz', pop: 'r-ekip', busy: 'r-ekip' };
function choiceDelta(s, p, i) {
  if (typeof previewChoice !== 'function') return null;
  try {
    const pv = previewChoice(s, p.pid, i); if (!pv) return null;
    const iI = EVENTS[p.id].ch.findIndex(o => o.idle);
    if (iI < 0 || iI === i) return pv;
    const p0 = previewChoice(s, p.pid, iI); return p0 ? pvMinus(pv, p0) : pv;
  } catch (e) { return null; }
}
function floatDeltas(s, pv) {
  if (!pv) return 0;
  let n = 0;
  for (const x of pvList(s, pv.d, pv.h)) {
    const el = $(DELTA_EL[x.k]); if (!el || el.hidden || getComputedStyle(el).display === 'none') continue;
    const r = el.getBoundingClientRect(); if (!r.width) continue;

    const f = document.createElement('div'); f.className = 'dfloat ' + (x.good ? 'pos' : 'neg') + (r.top < innerHeight / 2 ? ' below' : ''); f.dataset.k = x.k;
    f.textContent = x.t.split(' ')[0]; f.title = x.t;
    el.appendChild(f); n++;
    setTimeout(() => { f.classList.add('out'); setTimeout(() => f.remove(), 600); }, 6000);
  }
  return n;
}
function choicePv(s, p, i) {
  if (typeof previewChoice !== 'function') return '';
  try {
    const pv = previewChoice(s, p.pid, i); if (!pv) return '';
    const iI = EVENTS[p.id].ch.findIndex(o => o.idle);
    if (iI < 0) return pvHtml(s, pv, T('prevIn', fmtH(pv.h)));
    if (iI === i) return pvHtml(s, pv, T('prevIdle', fmtH(pv.h)));
    const p0 = previewChoice(s, p.pid, iI);
    return p0 ? pvHtml(s, pvMinus(pv, p0), T('prevVsIdle', fmtH(pv.h))) : pvHtml(s, pv, T('prevIn', fmtH(pv.h)));
  } catch (e) { console.error(e); return ''; }
}
function modalEvent(p) {
  const s = UI.s, ev = EVENTS[p.id]; if (!ev) return;
  closePda(); if (UI.plan) exitPlan();
  s.seenInfo['e_' + p.id] = 1;

  const isQ = !!ev.q;
  UI.evQ = isQ;
  const ch = ev.ch.map((c, i) => {
    if (isQ && c.hide) return '';
    const en = !c.en || c.en(s, p);
    if (isQ) return `<button class="choice" data-act="evChoice" data-v="${i}" ${en ? '' : 'disabled'}><b>${esc(tx(c.l))}</b></button>`;
    const pv = en && !c.none ? choicePv(s, p, i) : '', lead = c.lead ? (typeof c.lead === 'function' ? c.lead(s, p) : c.lead) : null;
    const sm = (pv || c.none) && lead ? tx(lead) : c.h ? tx(c.h(s, p)) : '';
    return `<button class="choice" data-act="evChoice" data-v="${i}" ${en ? '' : 'disabled'}><b>${esc(tx(c.l))}</b>${sm ? `<small>${esc(sm)}</small>` : ''}${pv}</button>`;
  }).join('');
  const from = callerOf(s, p), def = p.def != null && ev.ch[p.def] ? ev.ch[p.def] : null, sp = speakerOf({ from });
  UI.evPid = pidOf(p);
  openModal(`<div class="m-head ev-${ev.icon}"><span class="m-ic">${ico(ev.icon)}</span><div><small>${ico(FROM_IC[sp.f] || 'radio')} ${esc(sp.name)} · ${tx(WORLDS[s.world].dayWord)} ${dayOf(s)}</small><h2>${esc(tx(ev.title))}</h2></div></div>
    <p class="m-text${isQ ? ' q' : ''}">${esc(tx(isQ ? ev.q : ev.text(s, p)))}</p><div class="choices${isQ ? ' qch' : ''}" id="evChoices">${ch}</div>
    <div id="evResult">${def && p.due != null && !(isQ && def.hide) ? `<p class="note">${ico('clock')} ${T('defaultIs', fmtH(p.due - s.t), esc(tx(def.l)))}</p><div class="m-foot"><button class="link" data-act="closeModal">${T('later')}</button></div>` : def && p.due != null ? `<div class="m-foot"><button class="link" data-act="closeModal">${T('later')}</button></div>` : ''}</div>`, 'event');
  Snd.play(p.id === 'flare' || p.id === 'meteor' ? 'bad' : 'warn');
}
function modalQuiz(qi) {
  const s = UI.s, q = QUIZ[qi]; if (!q) return;
  closePda();
  const PERM = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]][(qi * 7 + 3) % 6];
  UI.quizQ = qi;
  openModal(`<div class="m-head ev-chat"><span class="m-ic">${ico('quiz')}</span><div><small>${T('quizD')}</small><h2>${T('quizT')}</h2></div></div>
    <p class="m-text q">${esc(tx(q.q))}</p><div class="choices" id="evChoices">${PERM.map(i => `<button class="choice" data-act="quiz" data-v="${i}"><b>${esc(tx(q.a[i]))}</b></button>`).join('')}</div>
    <div id="evResult"><div class="m-foot"><button class="link" data-act="closeModal">${T('later')}</button></div></div>`, 'event');
}
function cargoKg() { let kg = 0; for (const it of CARGO) kg += (UI.cargo.picks[it.id] || 0) * it.kg; return kg; }
function cargoGets(s) {
  if (typeof previewCargo !== 'function') return '';
  let list = []; try { list = previewCargo(s, UI.cargo.picks) || []; } catch (e) { list = []; }
  const h = list.filter(x => x && x.add).map(x => `<span>${badge(x.r === 'pop' ? 'ekip' : x.r === 'core' ? 'guc' : x.r)}+${num(x.add)} ${RES_UNIT[x.r] ? RES_UNIT[x.r] + ' ' : ''}${esc(x.r === 'pop' ? T('rw_pop') : x.r === 'core' ? T('nd_core') : x.r === 'moral' ? T('rw_moral') : low(T('c_' + x.r)))}${isNum(x.days) && x.days > 0 ? ' ' + esc(T('cargoDays', num(x.days, x.days < 10 ? 1 : 0), low(T(x.r === 'o2' ? 'ring_o2' : 'c_' + x.r)))) : ''}</span>`).join('');
  return h ? `<div class="cgets"><small>${T('cargoGets')}</small>${h}</div>` : '';
}
function modalCargo(p) {
  closePda(); if (UI.plan) exitPlan();
  if (!UI.cargo || UI.cargo.pid !== pidOf(p)) UI.cargo = { p, pid: pidOf(p), mass: p.mass, picks: {} };
  UI.cargo.p = p;
  const s = UI.s, kg = cargoKg(), fb = Math.max(0, beds(s) - s.pop);
  const rows = CARGO.map(it => {
    const n = UI.cargo.picks[it.id] || 0;
    const canAdd = kg + it.kg <= p.mass && (!it.max || n < it.max) && (it.id !== 'crew' || (n + 1) * 2 <= fb);
    return `<li class="${n ? 'on' : ''}"><div><b>${esc(tx(it.name))}</b><small>${esc(tx(it.give))}</small></div><span class="kg">${num(it.kg)} kg</span>
      <div class="step"><button data-act="cargo" data-v="${it.id}" data-d="-1" ${n ? '' : 'disabled'} aria-label="−">${ico('minus')}</button><b>${n}</b><button data-act="cargo" data-v="${it.id}" data-d="1" ${canAdd ? '' : 'disabled'} aria-label="+">${ico('plus')}</button></div></li>`;
  }).join('');
  const stock = ['o2', 'su', 'gida'].map(r => { const dl = daysLeft(s, r); return `<span data-c="${dl < 5 ? 'bad' : dl < 12 ? 'warn' : 'good'}">${badge(r)}${esc(T(r === 'o2' ? 'ring_o2' : 'c_' + r))}: ${dl === Infinity || dl > 30 ? T('enough', '30+') : T('enough', num(dl, 0))}</span>`; }).join('');
  const html = `<div class="m-head ev-ship"><span class="m-ic">${ico('rocket')}</span><div><small>${T('cargoD')}</small><h2>${T('cargoT')}</h2></div></div>
    <div class="cstock"><small>${T('cargoStock')}</small>${stock}<span>${badge('ekip')}${T('cargoBeds', fb)}</span></div>
    <ul class="cargo">${rows}</ul>
    <div class="cmass"><div class="mb"><i style="width:${kg / p.mass * 100}%"></i></div><b>${T('cargoMass')}: ${num(kg)} / ${num(p.mass)} kg</b></div>${cargoGets(s)}
    ${p.due != null ? `<p class="note">${ico('clock')} ${T('defaultCargo', fmtH(p.due - s.t))}</p>` : ''}
    <div class="m-foot"><button class="link" data-act="closeModal">${T('later')}</button><button class="btn" data-act="cargoAuto">${T('cargoAuto')}</button><button class="btn dim" data-act="cargoClear">${T('cargoClear')}</button><button class="primary" data-act="cargoGo">${ico('rocket')} ${T('cargoGo')}</button></div>`;
  if (UI.modal === 'cargo') { const sc = $('modalBox').scrollTop; $('modalBox').innerHTML = html; $('modalBox').scrollTop = sc; } else { openModal(html, 'cargo'); Snd.play('good'); }
}

function uiNeedHave(s, r, n) { const h = Math.floor(s.res[r] || 0); return h >= n ? '' : `<span class="need-have">${esc(T('needHave', num(n), low(T('c_' + r)), num(h)))}</span>`; }
function togglePv(s, b) {
  if (typeof previewToggle !== 'function') return '';
  let pv = null; try { pv = previewToggle(s, b); } catch (e) { pv = null; }
  if (!pv) return '';
  const words = pvList(s, pv.d, pv.h).map(x => x.t).concat((pv.stops || []).filter(o => BLD[o.k] && o.h >= 1).map(o => T('prevStop', tx(bname(s, o.k)), fmtH(o.h)))).join(' · ');
  return words ? `<p class="note">${esc(T(b.on ? 'offPrev' : 'onPrev', words))}</p>` : '';
}
function modalBuilding(bid) {
  const s = UI.s, b = s.b.find(o => o.id === bid); if (!b) return;
  closePda(); UI.selB = bid;
  const d = BLD[b.k], st = statusOf(s, b), acts = [];
  let live = '', tpv = '';
  if (b.left === 0) {
    if (b.k === 'gunes' || b.k === 'reaktor' || b.k === 'hub') live = T(kasif() ? 'nowEl' : 'nowKw', num(b.st === 'ok' || b.k === 'hub' ? genOf(s, b, s.pw.sun) : 0, kasif() ? 0 : 1));
    if (b.k === 'batarya' || b.k === 'hub') live += (live ? ' · ' : '') + T(b.k === 'hub' || kasif() ? 'storedEl' : 'stored', num(s.stored), num(s.pw.cap));
    if (b.k !== 'hub') { acts.push(`<button class="btn" data-act="bToggle">${ico(b.on ? 'pause' : 'play')} ${b.on ? T('turnOff') : T('turnOn')}</button>`); tpv = togglePv(s, b); if (tpv) tpv = `<details class="m-more"><summary>${T('k_more')}</summary>${tpv}</details>`; }
    if (b.broken) acts.push(`<button class="btn warn" data-act="bRepair" ${s.res.parca >= repairCost(s, b) ? '' : 'disabled'}>${ico('wrench')} ${T('repair', repairCost(s, b))}</button>`, uiNeedHave(s, 'parca', repairCost(s, b)));
    if (canShield(s, b)) acts.push(`<button class="btn acc" data-act="bShield" ${s.res.malzeme >= shieldCost(s) ? '' : 'disabled'}>${ico('shield')} ${T('shield', shieldCost(s))}</button>`, uiNeedHave(s, 'malzeme', shieldCost(s)));
  }
  if (b.k !== 'hub') acts.push(`<span class="acts-gap"></span><button class="btn dim demol" data-act="bDemolish">${UI.demolishArm === b.id ? T('demolish2') : T('demolish')}</button>`);
  let sh = '';
  if (isHab(b)) sh = b.shLeft ? `<p class="tagline sh">${ico('shield')} ${T('shielding', b.shLeft)}</p>` : isShielded(s, b) ? `<p class="tagline sh">${ico('shield')} ${T('shielded')}</p>` : '';
  const gH = b.left === 0 && b.on && ext('stopGainH') ? Math.round(+callExt('stopGainH', s, b) || 0) : 0;
  const html = `<div class="m-head"><span class="m-ic bic-wrap"><canvas class="bic" width="52" height="52"></canvas></span><div><small class="status" data-c="${st[0]}">${esc(st[1])}${live ? ` · ${esc(live)}` : ''}</small><h2>${esc(tx(bname(s, b.k)))}</h2></div></div>${gH > 0 ? `<p class="m-text m-gain">${ico('night')} ${esc(T('pw_gain', num(gH)))}</p>` : ''}${sh}${whyHtml(s, b)}
    <p class="m-text"><b>${T('doesL')}:</b> ${esc(doesTxt(b.k))}</p>${teachOf(s, b.k) ? `<p class="m-text m-teach">${teachHtml(s, b.k, 'mt-in')}</p>` : ''}${d.does ? `<p class="m-text"><b>${T('needsL')}:</b> ${esc(needsTxt(s, b.k))}</p>` : ''}<div class="acts">${acts.join('')}</div>${tpv}
    ${bfactBox(s, b)}
    <div class="m-foot"><button class="primary" data-act="closeModal">${T('ok')}</button></div>`;
  if (UI.modal === 'bcard') { $('modalBox').innerHTML = html; } else openModal(html, 'bcard');
  drawIcon($('modalBox').querySelector('canvas'), b.k, s.world);
}
function spark(cv, vals, col, max) {
  const d = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight; cv.width = w * d; cv.height = h * d;
  const g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0);
  if (vals.length < 2) return;
  const mx = max || Math.max(1, ...vals) * 1.08, X = i => 2 + i / (vals.length - 1) * (w - 4), Y = v => h - 3 - clamp(v / mx, 0, 1) * (h - 8);
  g.beginPath(); vals.forEach((v, i) => g[i ? 'lineTo' : 'moveTo'](X(i), Y(v)));
  g.strokeStyle = col; g.lineWidth = 2; g.lineJoin = 'round'; g.stroke();
  g.lineTo(X(vals.length - 1), h); g.lineTo(X(0), h); g.closePath(); g.globalAlpha = 0.16; g.fillStyle = col; g.fill(); g.globalAlpha = 1;
  circ(g, X(vals.length - 1), Y(vals[vals.length - 1]), 3); g.fillStyle = col; g.fill();
}

function choicesHtml(s) {
  if (typeof keyChoices !== 'function') return '';
  let list = []; try { list = keyChoices(s) || []; } catch (e) { list = []; }
  if (!list.length) return '';
  return `<h3>${T('yourChoices')}</h3><ul class="kchoices">${list.slice(0, 3).map(c => `<li class="${c.by === 'atlas' ? 'atlas' : ''}"><small>${isNum(c.day) ? T('dayN', c.day) + ' · ' : ''}${esc(tx(c.title))}</small><p><b>"${esc(tx(c.pick))}"</b>${c.effect ? ` → ${esc(tx(c.effect))}` : ''}</p>${c.by === 'atlas' ? `<em>${T('byAtlas')}</em>` : ''}</li>`).join('')}</ul>`;
}
function modalEnd(again) {
  const s = UI.s, W = WORLDS[s.world], sc = score(s), win = s.over.win, st = story(s), why = s.over.why;
  UI.endShown = true; store.del(SAVE_KEY); closePda(); if (UI.plan) exitPlan();
  const best = store.get(BEST_KEY) || {}, bk = s.world + '-' + s.level;
  if (!best[bk] || sc.total > best[bk]) { best[bk] = sc.total; store.set(BEST_KEY, best); }
  const stars = [1, 2, 3].map(i => `<span class="${i <= sc.stars ? 'on' : ''}">${ico('star')}</span>`).join('');
  const grades = sc.grades.map(g => `<li data-g="${g.g}"><span class="g">${g.g}</span><div><b>${esc(tx(g.name))}</b><p>${esc(tx(g.note))}</p></div></li>`).join('');
  const charts = [['o2', T('c_o2') + ' kg', 'var(--c-o2)'], ['su', T('c_su') + ' L', 'var(--c-su)'], ['gida', T('c_gida') + ' kg', 'var(--c-gida)'], ['e', T('ch_bat'), 'var(--c-guc)'], ['dose', T(s.level === 'kasif' ? 'ch_dozP' : 'ch_doz'), 'var(--c-doz)'], ['moral', T('c_moral'), 'var(--c-moral)']]
    .map(c => `<figure><figcaption>${c[1]}</figcaption><canvas data-k="${c[0]}" data-col="${c[2]}"></canvas></figure>`).join('');
  const parts = sc.parts.filter(p => p[1]).map(p => `<li><span>${esc(tx(p[0]))}</span><b class="${p[1] < 0 ? 'neg' : ''}">${sgn(p[1], 0)}</b></li>`).join('');
  const ep = st && st.epilogue ? st.epilogue : null, epi = ep ? (win ? ep.win : (ep[why] || ep.lose)) : null;
  const loseTxt = STR['lose_' + why] ? T('lose_' + why) : '';
  openModal(`<div class="end-top ${win ? 'win' : 'lose'} ${why === 'isyan' ? 'isyan' : ''}"><small>${esc(tx(W.name))} · ${s.level === 'kasif' ? T('lvKasif') : T('lvMuh')}</small>
      <h2>${win ? T('winT') : T('loseT')}</h2><p>${win ? T('winD', tx(W.name), W.missionDays, dayUnit(W, W.missionDays)) : loseTxt}</p>
      <div class="bigstars">${stars}</div>
      <div class="end-who"><canvas class="end-patch" width="128" height="128" aria-hidden="true"></canvas><b>${esc(cmdrTitle())}</b></div>
      <div class="scoreline"><div><small>${T('scoreL')}</small><b>${num(sc.total)}</b></div><div><small>${T('rankL')}</small><b>${esc(tx(sc.rank))}</b></div><div><small>${T('c_self')}</small><b>${pct(sc.self)}</b></div><div><small>${T('c_ekip')}</small><b>${s.pop}</b></div></div></div>
    ${epi ? `<blockquote class="epi"><span class="s-ic" data-f="mc">${ico('radio')}</span><p>${esc(tx(epi.text || epi))}</p></blockquote>` : ''}
    ${learnHtml(s)}
    <h3>${T('report')}</h3><ul class="grades">${grades}</ul>
    ${choicesHtml(s)}
    <h3>${T('charts')}</h3><div class="charts">${charts}</div>
    <details class="bd"><summary>${T('breakdown')}</summary><ul class="fl">${parts}</ul></details>
    ${rwCard(s, false)}
    <div class="m-foot"><button class="btn dim" data-act="endMenu">${T('quit')}</button><button class="btn" data-act="wardrobe">${ico('helmet')} ${T('endWd')}</button>${win ? `<button class="btn" data-act="endFree">${T('freePlay')}</button>` : ''}<button class="primary" data-act="endNew">${T('newGame')}</button></div>`, 'end');
  const cs = getComputedStyle($('app'));
  $('modalBox').querySelectorAll('.charts canvas').forEach(cv => {
    const k = cv.dataset.k, cm = /var\((--[\w-]+)\)/.exec(cv.dataset.col), col = (cm && cs.getPropertyValue(cm[1]).trim()) || '#8fd0ff';
    const pct = k === 'dose' && s.level === 'kasif';
    spark(cv, s.hist.map(h => k === 'e' ? h.e * 100 : pct ? h[k] / LIMIT_DOSE * 100 : h[k]), col, k === 'e' || k === 'moral' ? 100 : k === 'dose' ? (pct ? Math.max(25, s.dose / LIMIT_DOSE * 110) : Math.max(LIMIT_DOSE * 0.25, s.dose * 1.1)) : 0);
  });
  paintPatch($('modalBox').querySelector('.end-patch'), patchSpec(lookFix(s.look)));
  if (!again) Snd.play(win ? 'win' : 'bad');
}
const FIX_K = { o2: 'oksijen', su: 'su', gida: 'sera', guc: 'gunes' };
function modalDetail(id) {
  const s = UI.s; let body = '';
  const li = (a, b, c) => `<li><span>${a}</span><b class="${c || ''}">${b}</b></li>`;
  if (id === 'ekip') { openPda('ekip'); return; }
  if (id === 'bilim') { openPda('ara'); return; }
  closePda();
  if (id === 'guc') {
    const gen = {}, use = {};
    for (const b of s.b) { if (b.left > 0) continue; const g = (b.st === 'ok' || b.k === 'hub') ? genOf(s, b, s.pw.sun) : 0; if (g > 0 || b.k === 'gunes' || b.k === 'reaktor') { const e = gen[b.k] || (gen[b.k] = [0, 0]); e[0]++; e[1] += g; }
      const kw = BLD[b.k].kw || 0; if (kw && b.on && !b.broken) { const e = use[b.k] || (use[b.k] = [0, 0, 0]); e[0]++; e[1] += kw; if (b.st === 'guc') e[2]++; } }
    body = `<ul class="fl">${li(T('d_sun'), pct(s.pw.sun))}${li(T('d_bat'), T('stored', num(s.stored), num(s.pw.cap)))}</ul>
      <h4>${T('d_gen')} · ${num(s.pw.gen, 1)} kW</h4><ul class="fl">${Object.keys(gen).map(k => li(`${esc(tx(bname(s, k)))} ×${gen[k][0]}`, `+${num(gen[k][1], 1)} kW`, 'pos')).join('')}</ul>
      <h4>${T('d_use')} · ${num(s.pw.use, 1)} / ${num(s.pw.need, 1)} kW</h4><ul class="fl">${Object.keys(use).sort((a, b) => PRIO[a] - PRIO[b]).map(k => li(`${esc(tx(bname(s, k)))} ×${use[k][0]}` + (use[k][2] ? ` <em class="neg">(${T('shedN', use[k][2])})</em>` : ''), `−${num(use[k][1], 1)} kW`, 'neg')).join('')}</ul><p class="note">${T('d_prio')}</p>`;
  } else if (id === 'o2' || id === 'su' || id === 'gida') {
    const r = s.rate[id], dl = daysLeft(s, id), u = RES_UNIT[id];

    if (kasif()) body = `<p class="m-text big1">${dl === Infinity || dl > 30 ? T('enough', '30+') : T('enough', num(dl, 0))}</p><details class="dyk"><summary>${T('k_more')}</summary><ul class="fl">${li(T('d_stock'), `${num(s.res[id], 1)} ${u}`)}${li(T('d_prod'), `+${num(r.p, 1)} ${u}${T('perDay')}`, 'pos')}${li(T('d_cons'), `−${num(r.c, 1)} ${u}${T('perDay')}`, 'neg')}</ul></details>`;
    else body = `<ul class="fl">${li(T('d_stock'), `${num(s.res[id], 1)} ${u}`)}${li(T('d_prod'), `+${num(r.p, 1)} ${u}${T('perDay')}`, 'pos')}${li(T('d_cons'), `−${num(r.c, 1)} ${u}${T('perDay')}`, 'neg')}${li('', dl === Infinity ? T('stable') : T('enough', num(dl, 1)), dl < 5 ? 'neg' : 'pos')}</ul>
      <p class="note">${T('d_need', num(NEED[id], 2), u)}</p><p class="note">${T('d_rule')}</p>`;
  } else if (id === 'moral') {
    body = `<div class="ebig"><b>${num(s.moral)}</b><span>${moodOf(s.moral)}</span></div><ul class="fl">${moraleFactors(s).map(f => li(esc(tx(f.l)), sgn(f.v, 0), f.v < 0 ? 'neg' : 'pos')).join('')}</ul>${mutLadderHtml(s)}<p class="note">${T('d_moral')}</p>`;
  } else if (id === 'doz') {
    const ks = kasif(), rf = radFrac(s);
    body = `<div class="ebig"><b>${ks ? T('radPctS', Math.round(rf * 100)) : `${num(s.dose)} / ${LIMIT_DOSE} mSv`}</b><span>${radWord(rf)}</span></div><div class="dbar"><i style="width:${rf * 100}%"></i></div>` +
      (ks ? `<p class="note">${T('radPctD')}</p><ul class="fl">${li(T('shieldedBeds'), `${shieldedBeds(s)} / ${s.pop}`)}</ul>`
        : `<ul class="fl">${li(T('doseTot'), `${num(s.dose)} / ${LIMIT_DOSE} mSv`)}${doseFactors(s).map(f => li(esc(tx(f.l)), `${sgn(f.v, 2)} mSv${T('perDay')}`, f.v < 0 ? 'pos' : 'neg')).join('')}${li(T('shieldedBeds'), `${shieldedBeds(s)} / ${s.pop}`)}</ul>
      <p class="note">${T('d_dose')}${s.world === 'mars' ? ' ' + T('d_doseMars') : ''}</p>`);
  } else if (id === 'suit') {
    body = `<ul class="fl">${li(T('c_suit'), pct(s.pl ? s.pl.o2 : 1))}</ul><p class="note">${T('d_suit')}</p>`;
  } else { const r = s.rate[id]; body = `<ul class="fl">${li(T('d_stock'), num(Math.floor(s.res[id])))}${li(T('d_prod'), `+${num(r.p, 1)}${T('perDay')}`, 'pos')}${li(T('d_cons'), `−${num(r.c, 1)}${T('perDay')}`, 'neg')}</ul>`; }
  const fk = FIX_K[id], fix = fk && BLD[fk] && !s.over ? `<button class="btn acc" data-act="buildFor" data-v="${fk}">${ico('build')} ${T('buildFor', tx(bname(s, fk)))} ›</button>` : '';
  const ttl = id === 'o2' ? `${T('ring_o2')} (${T('c_o2')})` : T('c_' + id);
  openModal(`<div class="m-head"><span class="m-ic">${badge(id === 'doz' ? 'doz' : id)}</span><div><h2>${ttl}</h2></div></div>${body}<div class="m-foot">${fix}<button class="primary" data-act="closeModal">${T('ok')}</button></div>`, 'detail');
}
function modalTutSum() {
  const s = UI.s, W = WORLDS[s.world]; closePda(); if (UI.plan) exitPlan();
  openModal(`<div class="m-head"><span class="m-ic">${ico('star')}</span><div><h2>${T('tutSumT')}</h2><small>${T('tutDone')}</small></div></div>
    <ol class="learn"><li>${T('tutSum1')}</li><li>${T('tutSum2')}</li><li>${T('tutSum3')}</li></ol>
    <p class="m-text q">${T('tutSumGo', W.missionDays, dayUnit(W, W.missionDays))}</p>
    <div class="m-foot"><button class="primary big" data-act="tutSumGo">${ico('play')} ${T('tutStart')}</button></div>`, 'tutsum');
}
function openCall(pid) {
  const s = UI.s, p = pid != null ? s.pending.find(q => String(pidOf(q)) === String(pid)) : (callList(s).find(q => q.type === 'event') || s.pending[0]);
  if (!p) { Snd.play('no'); return; }
  if (p.type === 'cargo') { modalCargo(p); return; }

  const IK = mod('ISKART');
  if (IK && typeof IK.ask === 'function') { let took = false; try { took = !!IK.ask(p); } catch (e) { console.error(e); took = false; } if (took) return; }
  modalEvent(p);
}




const PROF_KEY = 'ufuk-ussu-profil';
const LOOK_CATS = ['suit', 'visor', 'rover', 'craft', 'bld'];

const C_COSM = [
  { id: 'su_turuncu', cat: 'suit', name: L('Turuncu', 'Orange'), hex: '#ff7a2f', def: true },
  { id: 'su_mavi', cat: 'suit', name: L('Mavi', 'Blue'), hex: '#3b8ee8', def: true },
  { id: 'su_yesil', cat: 'suit', name: L('Yeşil', 'Green'), hex: '#3fbf5f', def: true },
  { id: 'su_sari', cat: 'suit', name: L('Sarı', 'Yellow'), hex: '#f2c230', def: true },
  { id: 'su_mor', cat: 'suit', name: L('Mor', 'Purple'), hex: '#9b6bff', def: true },
  { id: 'su_pembe', cat: 'suit', name: L('Pembe', 'Pink'), hex: '#ff5fa2', def: true },
  { id: 'vz_altin', cat: 'visor', name: L('Altın', 'Gold'), hex: '#b8862c', def: true },
  { id: 'vz_gumus', cat: 'visor', name: L('Gümüş', 'Silver'), hex: '#aeb8c4', rule: { t: 'sci', n: 30 }, how: L('30 bilim puanı topla.', 'Earn 30 science points.') },
  { id: 'vz_mavi', cat: 'visor', name: L('Gece mavisi', 'Night blue'), hex: '#3a5f9e', rule: { t: 'sci', n: 80 }, how: L('80 bilim puanı topla.', 'Earn 80 science points.') },
  { id: 'gz_beyaz', cat: 'rover', name: L('Beyaz', 'White'), hex: '#e6e5e0', hex2: '#2f5fa8', def: true },
  { id: 'gz_sari', cat: 'rover', name: L('Kâşif sarısı', 'Explorer yellow'), hex: '#f2c230', hex2: '#2c2f35', rule: { t: 'mission', id: 'kesif' }, how: L('İlk taramanı yap.', 'Do your first scan.') },
  { id: 'gz_mavi', cat: 'rover', name: L('Gök mavisi', 'Sky blue'), hex: '#3f8cff', hex2: '#e6e5e0', rule: { t: 'bank', any: ['s:i', 's:m', 's:t', 's:c', 's:r'], n: 3 }, how: L('3 farklı zemin tara.', 'Scan 3 different kinds of ground.') },
  { id: 'gz_yesil', cat: 'rover', name: L('İz sürücü', 'Trail finder'), hex: '#7ccf4a', hex2: '#2c2f35', rule: { t: 'relics', n: 3 }, how: L('Eski görevin 3 izini de tara.', 'Scan all 3 traces of the old mission.') },
  { id: 'uz_klasik', cat: 'craft', name: L('Klasik', 'Classic'), hex: '#2f5fa8', hex2: '#c8372d', def: true },
  { id: 'uz_okyanus', cat: 'craft', name: L('Okyanus', 'Ocean'), hex: '#1fa3b5', hex2: '#2f5fa8', rule: { t: 'mission', id: 'kalkan' }, how: L('İniş Modülünü toprakla ört.', 'Cover the Landing Module with soil.') },
  { id: 'uz_gunes', cat: 'craft', name: L('Gün doğumu', 'Sunrise'), hex: '#e9632b', hex2: '#f2c230', rule: { t: 'ships', n: 1 }, how: L('İlk kargo gemisini boşalt.', 'Unload the first cargo ship.') },
  { id: 'uz_kozmik', cat: 'craft', name: L('Kozmik', 'Cosmic'), hex: '#6d4bc4', hex2: '#e8b62c', rule: { t: 'sci', n: 150 }, how: L('150 bilim puanı topla.', 'Earn 150 science points.') },
  { id: 'us_lacivert', cat: 'bld', name: L('Lacivert', 'Navy'), hex: '#2f5fa8', def: true },
  { id: 'us_turkuaz', cat: 'bld', name: L('Turkuaz', 'Turquoise'), hex: '#1fa3b5', rule: { t: 'missions', all: ['guc', 'o2', 'su'] }, how: L('Elektrik, hava ve su hedeflerini bitir.', 'Finish the power, air and water goals.') },
  { id: 'us_sari', cat: 'bld', name: L('Güneş sarısı', 'Sun yellow'), hex: '#e8b62c', rule: { t: 'mission', id: 'dongu' }, how: L('Geri Dönüştürücüyü çalıştır.', 'Get the Recycler running.') },
  { id: 'us_mor', cat: 'bld', name: L('Mor', 'Purple'), hex: '#6d4bc4', rule: { t: 'mission', id: 'self' }, how: L('Üs ihtiyacının çoğunu kendi yapsın.', 'Make the base produce most of what it needs.') },
  { id: 'sym_ay', cat: 'sym', sym: 'ay', name: L('Ay', 'Moon'), def: true },
  { id: 'sym_mars', cat: 'sym', sym: 'mars', name: L('Mars', 'Mars'), def: true },
  { id: 'sym_roket', cat: 'sym', sym: 'roket', name: L('Roket', 'Rocket'), def: true },
  { id: 'sym_yildiz', cat: 'sym', sym: 'yildiz', name: L('Yıldız', 'Star'), def: true },
  { id: 'sym_buz', cat: 'sym', sym: 'buz', name: L('Buz kristali', 'Ice crystal'), rule: { t: 'bank', any: ['s:i'], n: 1 }, how: L('Bir buz alanı tara.', 'Scan an ice patch.') },
  { id: 'sym_tas', cat: 'sym', sym: 'tas', name: L('Taş', 'Rock'), rule: { t: 'bank', any: ['s:m'], n: 1 }, how: L('Bir maden alanı tara.', 'Scan a mineral patch.') },
  { id: 'sym_bitki', cat: 'sym', sym: 'bitki', name: L('Filiz', 'Sprout'), rule: { t: 'tag', id: 'x:hasat' }, how: L('Seradan ilk ürünü al.', 'Get the first crop from a greenhouse.') },
  { id: 'sym_anten', cat: 'sym', sym: 'anten', name: L('Anten', 'Antenna'), rule: { t: 'bank', any: ['b:anten'], n: 1 }, how: L('Bir anten kur.', 'Build an antenna.') },
  { id: 'sym_gezgin', cat: 'sym', sym: 'gezgin', name: L('Gezgin', 'Rover'), rule: { t: 'tag', id: 'r:2' }, how: L('Eski görevin son izini tara.', 'Scan the last trace of the old mission.') },
  { id: 'daire', cat: 'shape', shape: 'daire', name: L('Daire', 'Circle'), def: true },
  { id: 'kalkan', cat: 'shape', shape: 'kalkan', name: L('Kalkan', 'Shield'), def: true },
  { id: 'altigen', cat: 'shape', shape: 'altigen', name: L('Altıgen', 'Hexagon'), def: true },
  { id: 'bg_lacivert', cat: 'bg', name: L('Lacivert', 'Navy'), hex: '#1d3a6e', def: true },
  { id: 'bg_gece', cat: 'bg', name: L('Gece', 'Night'), hex: '#161b28', def: true },
  { id: 'bg_kizil', cat: 'bg', name: L('Kızıl', 'Crimson'), hex: '#8e2b25', def: true },
  { id: 'bg_orman', cat: 'bg', name: L('Orman', 'Forest'), hex: '#1f5e3a', def: true },
  { id: 'bg_mor', cat: 'bg', name: L('Mor', 'Purple'), hex: '#4b2f7a', def: true },
  { id: 'bg_bakir', cat: 'bg', name: L('Bakır', 'Copper'), hex: '#a4542a', def: true },
];
const C_DEF_LOOK = { suit: 'su_turuncu', visor: 'vz_altin', rover: 'gz_beyaz', craft: 'uz_klasik', bld: 'us_lacivert', patch: { shape: 'daire', bg: 'bg_mor', sym: null } };

const C_INTRO = {
  suit: L('Gerçek uzay giysileri beyazdır, Güneş\'in ısısını geri yansıtsın diye. Renkli şerit, kimin kim olduğunu gösterir.', 'Real spacesuits are white so they reflect the Sun\'s heat. A coloured stripe shows who is who.'),
  visor: L('Kaskın altın kaplı camı, güçlü güneş ışığını geri yansıtır.', 'The helmet\'s gold-coated visor reflects strong sunlight.'),
  patch: L('Gerçek ekipler görev armalarını çoğu zaman kendileri tasarlar.', 'Real crews often design their own mission patches.'),
};
const realOn = () => typeof REAL !== 'undefined' && !!REAL;
const cosmAll = () => (typeof COSMETICS !== 'undefined' && Array.isArray(COSMETICS) && COSMETICS.length) ? COSMETICS : C_COSM;
const defLook = () => (typeof DEFAULT_LOOK !== 'undefined' && DEFAULT_LOOK) || C_DEF_LOOK;
const cosmById = id => (id == null ? null : cosmAll().find(c => c.id === id) || null);
const cosmOf = cat => cosmAll().filter(c => c.cat === cat);
const shapeVal = it => it.shape || String(it.id).replace(/^sh_/, '');
const symVal = it => it.sym || String(it.id).replace(/^sym_/, '');
const shapeItem = v => cosmOf('shape').find(it => it.id === v || shapeVal(it) === v) || null;
const symItem = v => cosmOf('sym').find(it => it.id === v || symVal(it) === v) || null;
const realOf = (v, s) => { if (!v) return null; if (v.tr != null || v.en != null) return v; s = s || UI.s; return (s && v[s.world]) || null; };


function srcShort(src) {
  const t = String(src || '').trim().replace(/^NASA (?!·)/, 'NASA · ');
  return t.split(';')[0].split(' · ').slice(0, 2).join(' · ').trim();
}
const SRC_ICO = '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M4 1.5h5.2L13 5.3v8.2c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1v-11c0-.6.4-1 1-1zm4.8 1.2V6h3.1zM5 8.2v1.1h6V8.2zm0 2.4v1.1h4.6v-1.1z"/></svg>';
const srcHtml = v => (v && v.src ? `<span class="src-chip" title="${esc(String(v.src))}">${SRC_ICO}<span>${T('srcL')} ${esc(srcShort(v.src))}</span></span>` : '');

const didYou = (h, v) => (kasif() ? `<details class="dyk"><summary>${ico('info')} ${T('dyk')}</summary>${h}</details>${srcHtml(v)}` : h);
const realHtml = (v, lbl) => (v ? didYou(`<p class="fact real"><i>${lbl || T('real')}</i>${esc(tx(v))}${kasif() ? '' : srcHtml(v)}</p>`, v) : '');
const factHtml = (v, lbl) => (v && tx(v) ? didYou(`<p class="fact"><i>${lbl || T('inReal')}</i>${esc(tx(v))}${kasif() ? '' : srcHtml(v)}</p>`, v) : '');
const feats3 = () => ({
  cosmetics: typeof COSMETICS !== 'undefined', defaultLook: typeof DEFAULT_LOOK !== 'undefined', real: realOn(), ruleMet: typeof ruleMet === 'function', ruleProg: typeof ruleProg === 'function',
  sciTotal: typeof sciTotal === 'function', checkCosmetics: typeof checkCosmetics === 'function', nextRewards: typeof nextRewards === 'function', learnedList: typeof learnedList === 'function', whyStop: typeof whyStop === 'function',
  setLook: !!(UI.gl && typeof S3.setLook === 'function'), showcase: !!(UI.gl && typeof S3.showcase === 'function'), drawPatch: typeof drawPatch === 'function',
});


function prof() {
  if (!UI.prof) {
    const p = store.get(PROF_KEY);
    UI.prof = p && typeof p === 'object' && p.v === 1 ? p : { v: 1, name: '', look: null, have: {}, ach: {} };
    if (!UI.prof.have || typeof UI.prof.have !== 'object') UI.prof.have = {};
    if (!UI.prof.ach || typeof UI.prof.ach !== 'object') UI.prof.ach = {};
    if (typeof UI.prof.name !== 'string') UI.prof.name = '';
  }
  return UI.prof;
}
function profSave() { store.set(PROF_KEY, prof()); }
const cmdrTitle = () => { const v = UI.s ? UI.s.name : prof().name; return v && String(v).trim() ? T('cmdr', String(v).trim()) : T('cr_defName'); };
const cmdrName = n => { const v = n != null ? n : (UI.s ? UI.s.name : prof().name); return (v && String(v).trim()) || T('cr_defName'); };
function owned(id, s) {
  const it = cosmById(id); if (!it) return false;
  if (it.def || !it.rule) return true;
  if (prof().have[id]) return true;
  s = s || UI.s; return !!(s && s.unl && s.unl[id] != null);
}

function lookFix(lk, strict) {
  const d = defLook(), dp = d.patch || C_DEF_LOOK.patch, o = {}; lk = lk && typeof lk === 'object' ? lk : {};
  const ok = (id, cat) => { const it = cosmById(id); return !!it && it.cat === cat && (!strict || owned(id)); };
  for (const c of LOOK_CATS) o[c] = ok(lk[c], c) ? lk[c] : d[c];
  const p = lk.patch && typeof lk.patch === 'object' ? lk.patch : {};
  const sh = shapeItem(p.shape), sy = p.sym != null ? symItem(p.sym) : null;
  o.patch = {
    shape: sh && (!strict || owned(sh.id)) ? shapeVal(sh) : dp.shape || 'daire',
    bg: ok(p.bg, 'bg') ? p.bg : dp.bg,
    sym: sy && (!strict || owned(sy.id)) ? sy.id : null,
  };
  return o;
}
const hexMix = (a, b, f) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * f).toString(16).padStart(2, '0')).join(''); };
const lumOf = h => { const p = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]; };
const ringOf = bg => (lumOf(bg) > 0.55 ? hexMix(bg, '#1a1d24', 0.55) : hexMix(bg, '#0c0f16', 0.42));
function patchSpec(lk, name) {
  const p = (lk && lk.patch) || {}, bgI = cosmById(p.bg), syI = p.sym != null ? symItem(p.sym) : null;
  const bg = (bgI && /^#[0-9a-f]{6}$/i.test(bgI.hex) && bgI.hex) || '#1d3a6e';
  const sym = syI ? symVal(syI) : (UI.s && UI.s.world === 'mars' ? 'mars' : 'ay');
  const nm = cmdrName(name).toLocaleUpperCase(LANG === 'en' ? 'en-US' : 'tr-TR').slice(0, 12);
  return { shape: p.shape || 'daire', bg, sym, ring: ringOf(bg), text: (LANG === 'en' ? 'HORIZON-1 · ' : 'UFUK-1 · ') + nm };
}

function lookSpec(lk, name) {
  lk = lk || lookFix(UI.s && UI.s.look);
  const g = id => cosmById(id) || {}, suit = g(lk.suit).hex || '#ff7a2f';
  const crew = cosmOf('suit').map(i => i.hex).filter(h => h && h.toLowerCase() !== suit.toLowerCase()).slice(0, 4);
  const rv = g(lk.rover), cr = g(lk.craft), bl = g(lk.bld);
  return { suit, visor: g(lk.visor).hex || '#b8862c', crew, rover: { body: rv.hex, trim: rv.hex2 }, craft: { band: cr.hex, nose: cr.hex2 }, bld: { trim: bl.hex }, patch: patchSpec(lk, name) };
}
function applyLook(name) {
  const s = UI.s; if (!s || !UI.gl || typeof S3.setLook !== 'function') return false;
  try { S3.setLook(lookSpec(lookFix(s.look), name)); return true; } catch (e) { console.error(e); return false; }
}

function paintPatch(cv, spec) {
  if (!cv) return; const g = cv.getContext('2d'); if (!g) return; const S = cv.width;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S, cv.height);
  if (typeof drawPatch === 'function') { try { drawPatch(g, spec, S); return; } catch (e) { console.error(e); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, S, cv.height); } }
  g.beginPath(); g.arc(S / 2, S / 2, S * 0.44, 0, Math.PI * 2); g.fillStyle = spec.bg; g.fill(); g.lineWidth = S * 0.06; g.strokeStyle = spec.ring; g.stroke();
  const it = symItem(spec.sym), nm = it ? tx(it.name) : String(spec.sym || '?');
  g.fillStyle = '#ffffff'; g.font = `700 ${Math.round(S * 0.4)}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(nm.charAt(0).toLocaleUpperCase(LANG === 'en' ? 'en-US' : 'tr-TR'), S / 2, S / 2 + S * 0.02);
}

function paintFigure(cv, lk, name) {
  if (!cv) return; const g = cv.getContext('2d'); if (!g) return;
  const W = cv.width, H = cv.height, sp = lookSpec(lk, name), k = W / 120;
  g.setTransform(k, 0, 0, k, 0, 0); g.clearRect(0, 0, 120, H / k);
  const rr = (x, y, w, h, r, c) => { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = c; g.fill(); };
  rr(26, 50, 68, 70, 16, '#9aa3ad'); rr(30, 48, 60, 72, 14, '#eef1f4');
  rr(14, 56, 18, 52, 9, '#e3e7ec'); rr(88, 56, 18, 52, 9, '#e3e7ec');
  rr(14, 70, 18, 7, 2, sp.suit); rr(88, 70, 18, 7, 2, sp.suit);
  rr(36, 118, 20, 44, 8, '#e3e7ec'); rr(64, 118, 20, 44, 8, '#e3e7ec');
  rr(36, 130, 20, 7, 2, sp.suit); rr(64, 130, 20, 7, 2, sp.suit);
  rr(30, 108, 60, 8, 3, sp.suit);
  g.beginPath(); g.arc(60, 30, 25, 0, Math.PI * 2); g.fillStyle = '#eef1f4'; g.fill();
  g.beginPath(); g.ellipse(60, 32, 17, 13, 0, 0, Math.PI * 2); g.fillStyle = sp.visor; g.fill();
  g.beginPath(); g.ellipse(54, 27, 6, 3, -0.5, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.45)'; g.fill();
  const pc = document.createElement('canvas'); pc.width = pc.height = 64; paintPatch(pc, sp.patch);
  g.drawImage(pc, 64, 60, 20, 20);
}

const sciGot = s => { if (typeof sciTotal === 'function') { try { return +sciTotal(s) || 0; } catch (e) {   } } return (s.res.bilim || 0) + TECH_ORDER.reduce((a, id) => a + (s.techs && s.techs[id] ? (TECHS[id].cost || 0) : 0), 0); };
function ruleP(s, r, local) {
  if (!local && typeof ruleProg === 'function') { try { const v = +ruleProg(s, r); if (isFinite(v)) return clamp(v, 0, 1); } catch (e) {   } }
  if (!r || !s) return 0;
  const has = (o, k) => !!(o && o[k] != null), st = s.stat || {}, fr = (a, b) => clamp(a / Math.max(1, b), 0, 1);
  switch (r.t) {
    case 'mission': return has(s.done, r.id) ? 1 : 0;
    case 'missions': return fr((r.all || []).filter(id => has(s.done, id)).length, (r.all || []).length);
    case 'bank': return fr((r.any || []).filter(k => has(s.bank, k)).length, r.n || 1);
    case 'sci': return fr(sciGot(s), r.n);
    case 'relics': return fr(st.relics || 0, r.n);
    case 'ships': return fr(st.ships || 0, r.n);
    case 'tag': return has(s.tags, r.id) ? 1 : 0;
    case 'stat': return fr(st[r.key] || 0, r.min || 1);
    case 'built': return s.b.some(b => b.k === r.k && b.left === 0) ? 1 : 0;
    case 'event': return has(s.tags, 'e:' + r.id) ? 1 : 0;
    case 'cause': return (st.causes || []).some(c => c.r === r.r) ? 1 : 0;
    default: return 0;
  }
}
function ruleOk(s, r) { if (typeof ruleMet === 'function') { try { return !!ruleMet(s, r); } catch (e) {   } } return ruleP(s, r, true) >= 1; }
const haveMap = s => { const m = {}; for (const it of cosmAll()) if (owned(it.id, s)) m[it.id] = 1; return m; };
function nextRw(s) {
  if (!s) return [];
  if (typeof nextRewards === 'function') { try { const r = nextRewards(s, haveMap(s)); if (Array.isArray(r)) return r.filter(x => x && !owned(x.id, s)); } catch (e) {   } }
  return cosmAll().filter(it => it.rule && !owned(it.id, s)).map(it => ({ id: it.id, cat: it.cat, name: it.name, how: it.how, prog: ruleP(s, it.rule) }))
    .sort((a, b) => b.prog - a.prog).slice(0, 3);
}
const catWord = c => (STR['wd_c_' + c] ? T('wd_c_' + c) : c);
const WD_TABS = ['astro', 'arma', 'rover', 'craft', 'bld'];
const WD_CAT_TAB = { suit: 'astro', visor: 'astro', sym: 'arma', shape: 'arma', bg: 'arma', rover: 'rover', craft: 'craft', bld: 'bld' };
const WD_SHOW = { astro: 'player', arma: 'player', rover: 'rover', craft: 'hub', bld: 'base' };
function swatchOf(it, sz) {
  if (it.cat === 'sym' || it.cat === 'shape') return `<canvas class="sw-pc" width="${sz || 72}" height="${sz || 72}" data-sym="${it.cat === 'sym' ? esc(it.id) : ''}" data-shape="${it.cat === 'shape' ? esc(it.id) : ''}"></canvas>`;
  return `<i class="sw-c" style="--sw:${esc(it.hex || '#888')};--sw2:${esc(it.hex2 || it.hex || '#888')}"></i>`;
}

function rwCard(s, btn) {
  const list = nextRw(s);
  if (!list.length) return `<div class="rwcard done">${ico('star')}<b>${T('rw_all')}</b>${btn ? `<button class="btn acc" data-act="wardrobe">${T('wd_open')}</button>` : ''}</div>`;
  const r = list[0], it = cosmById(r.id) || r, p = clamp(+r.prog || 0, 0, 1);
  return `<div class="rwcard">${swatchOf(it, 56)}<div class="rw-t"><small>${T('rw_next')}</small><b>${esc(tx(r.name || it.name))} · ${esc(catWord(r.cat || it.cat))}</b><p>${esc(tx(r.how || it.how))}</p>${p > 0 && p < 1 ? `<div class="pbar"><i style="width:${Math.round(p * 100)}%"></i></div>` : ''}</div>${btn ? `<button class="btn acc" data-act="wardrobe" data-v="${WD_CAT_TAB[r.cat || it.cat] || 'astro'}">${T('wd_open')}</button>` : ''}</div>`;
}

function cosmTick(s, quiet) {
  if (!s) return 0;
  if (!s.unl || typeof s.unl !== 'object') s.unl = {};
  if (typeof checkCosmetics !== 'function') for (const it of cosmAll()) if (it.rule && s.unl[it.id] == null && ruleOk(s, it.rule)) s.unl[it.id] = s.t;
  const p = prof(); let nw = 0;
  for (const id of Object.keys(s.unl)) {
    if (p.have[id]) continue; const it = cosmById(id); if (!it) continue;
    p.have[id] = 1; nw++;
    if (!quiet) { UI.rwDot = (UI.rwDot || 0) + 1; }
  }
  if (nw) { profSave(); UI.cache.pda = null; if (!quiet) Snd.play('good'); }
  return nw;
}
function setLookPart(cat, id) {
  const s = UI.s; if (!s) return false;
  const it = cosmById(id); if (!it || it.cat !== cat) return false;
  if (!owned(id, s)) { toast(`${T('wd_lock')}: ${tx(it.how || '')}`, 'warn'); Snd.play('no'); return false; }
  const lk = lookFix(s.look);
  if (LOOK_CATS.includes(cat)) lk[cat] = id;
  else if (cat === 'sym') lk.patch.sym = id;
  else if (cat === 'shape') lk.patch.shape = shapeVal(it);
  else if (cat === 'bg') lk.patch.bg = id;
  else return false;
  s.look = lk; const p = prof(); p.look = JSON.parse(JSON.stringify(lk)); profSave();
  applyLook(UI.creator ? UI.creator.name : null); Snd.play('click');

  const fc = cat === 'sym' || cat === 'shape' || cat === 'bg' ? 'patch' : cat;
  if (UI.gl && typeof S3.showcaseFlash === 'function') try { S3.showcaseFlash(fc); } catch (e) {   }
  return true;
}
const isOn = (lk, it) => (LOOK_CATS.includes(it.cat) ? lk[it.cat] === it.id : it.cat === 'sym' ? (lk.patch.sym ? lk.patch.sym === it.id : symVal(it) === (UI.s && UI.s.world === 'mars' ? 'mars' : 'ay'))
  : it.cat === 'shape' ? lk.patch.shape === shapeVal(it) : it.cat === 'bg' ? lk.patch.bg === it.id : false);
function swBtn(it, lk, act, withLock) {
  const on = isOn(lk, it), own = owned(it.id);
  if (!own && !withLock) return '';
  if (!own) {
    const p = clamp(ruleP(UI.s, it.rule), 0, 1);
    return `<div class="sw lock" data-id="${esc(it.id)}" data-act="lockTip" data-v="${esc(it.id)}" role="button" tabindex="0"><span class="sw-lk">${swatchOf(it)}<i class="sw-badge" aria-hidden="true">${ico('lock')}</i></span><span class="sw-n">${ico('lock')} ${esc(tx(it.name))}</span><small class="sw-how">${esc(tx(it.how || ''))}</small>${p > 0 && p < 1 ? `<span class="pbar"><i style="width:${Math.round(p * 100)}%"></i></span>` : ''}</div>`;
  }
  return `<button class="sw ${on ? 'on' : ''}" data-act="${act}" data-c="${esc(it.cat)}" data-v="${esc(it.id)}" aria-pressed="${on}">${swatchOf(it)}<span class="sw-n">${esc(tx(it.name))}</span></button>`;
}
function paintSwatches(root, lk, name) {
  const sp = patchSpec(lk, name);
  root.querySelectorAll('canvas.sw-pc').forEach(cv => {
    const sy = cv.dataset.sym ? symItem(cv.dataset.sym) : null, sh = cv.dataset.shape ? shapeItem(cv.dataset.shape) : null;
    paintPatch(cv, Object.assign({}, sp, sy ? { sym: symVal(sy) } : {}, sh ? { shape: shapeVal(sh) } : {}, { text: '' }));
  });
}
function showcase(target) {
  if (!UI.gl || typeof S3.showcase !== 'function') return false;
  try { return !!S3.showcase(target, target ? { side: 'left' } : undefined); } catch (e) { console.error(e); return false; }
}


function openCreator() {
  const s = UI.s; if (!s) return;
  if (!s.look) s.look = lookFix(prof().look, true);
  UI.creator = { mode: UI.mode, row: 'suit', more: false, name: s.name || '' };
  UI.creator.show = showcase('player');
  renderCreator(true);
}
function renderCreator(first) {
  const s = UI.s, c = UI.creator; if (!s || !c) return;
  const box = $('modalBox'), moreEl = first ? null : box.querySelector('.cr-more'), sc = first ? 0 : (box.querySelector('.cr-scroll') || {}).scrollTop || 0;
  if (moreEl) c.more = moreEl.open;
  const lk = lookFix(s.look), W = WORLDS[s.world];
  const suits = cosmOf('suit').map(it => swBtn(it, lk, 'crPick')).join('');
  const syms = cosmOf('sym').filter(it => owned(it.id)).map(it => swBtn(it, lk, 'crPick')).join('');
  const more = `<div class="cr-sub"><span class="cr-l2">${T('cr_visor')}</span><div class="sw-row">${cosmOf('visor').filter(it => owned(it.id)).map(it => swBtn(it, lk, 'crPick')).join('')}</div></div>
    <div class="cr-sub"><span class="cr-l2">${T('cr_shape')}</span><div class="sw-row">${cosmOf('shape').filter(it => owned(it.id)).map(it => swBtn(it, lk, 'crPick')).join('')}</div></div>
    <div class="cr-sub"><span class="cr-l2">${T('cr_bg')}</span><div class="sw-row">${cosmOf('bg').filter(it => owned(it.id)).map(it => swBtn(it, lk, 'crPick')).join('')}</div></div>`;
  const intro = realOn() && REAL.intro ? REAL.intro : null, row = c.row === 'name' ? 'patch' : c.row;
  const line = (intro && realOf(intro[row])) || C_INTRO[row] || C_INTRO.suit;
  const html = `<div class="cr-scroll">
      <div class="m-head"><span class="m-ic">${ico('helmet')}</span><div><small>${esc(tx(W.name))} · ${s.level === 'kasif' ? T('lvKasif') : T('lvMuh')}</small><h2>${T('cr_title')}</h2></div></div>
      <p class="cr-hint">${T('cr_hint')}</p>
      ${c.show ? '' : `<canvas class="cr-fig" width="240" height="330" aria-hidden="true"></canvas>`}
      <label class="cr-row" data-row="name"><span class="cr-l">${T('cr_name')}</span><input id="crName" maxlength="18" autocomplete="off" spellcheck="false" placeholder="${T('cr_defName')}" value="${esc(c.name)}"></label>
      <div class="cr-row" data-row="suit"><span class="cr-l">${T('cr_suit')}</span><div class="sw-row suits">${suits}</div></div>
      <div class="cr-row" data-row="patch"><span class="cr-l">${T('cr_patch')}</span><div class="cr-patch"><canvas id="crPatch" width="192" height="192" aria-hidden="true"></canvas><div class="sw-row syms">${syms}</div></div></div>
      <details class="fold cr-more" ${c.more ? 'open' : ''}><summary>${T('cr_more')}</summary>${more}</details>
      ${realHtml(line)}
    </div>
    <div class="cr-foot"><button class="primary big wide" id="crGo" data-act="crGo">${T('cr_go')} ▶</button><small>${T('cr_later')}</small></div>`;
  if (first) openModal(html, 'creator'); else { box.innerHTML = html; const sb = box.querySelector('.cr-scroll'); if (sb) sb.scrollTop = sc; }
  crPaint();
  const inp = $('crName');
  inp.addEventListener('input', () => { c.name = inp.value.slice(0, 18); crPaint(); });
  inp.addEventListener('focus', () => { if (c.row !== 'name') { c.row = 'name'; crLine(); } });
  const go = $('crGo'); if (first && go) try { go.focus({ preventScroll: true }); } catch (e) {   }
}
function crLine() {
  const c = UI.creator; if (!c) return; const el = $('modalBox').querySelector('.cr-scroll > .fact.real'); if (!el) return;
  const intro = realOn() && REAL.intro ? REAL.intro : null, row = c.row === 'name' ? 'patch' : c.row;
  const line = (intro && realOf(intro[row])) || C_INTRO[row] || C_INTRO.suit;
  el.outerHTML = realHtml(line);
}
function crPaint() {
  const s = UI.s, c = UI.creator; if (!s || !c) return;
  const lk = lookFix(s.look), box = $('modalBox');
  paintPatch($('crPatch'), patchSpec(lk, c.name));
  paintFigure(box.querySelector('.cr-fig'), lk, c.name);
  paintSwatches(box, lk, c.name);
  clearTimeout(UI.crTO); UI.crTO = setTimeout(() => applyLook(c.name), 120);
}
function crGo() {
  const s = UI.s, c = UI.creator; if (!s || !c || UI.modal !== 'creator') return;
  const inp = $('crName'), name = String(inp ? inp.value : c.name).trim().slice(0, 18);
  s.name = name; s.look = lookFix(s.look);
  const p = prof(); p.name = name; p.look = JSON.parse(JSON.stringify(s.look)); profSave();
  UI.name = name; clearTimeout(UI.crTO);
  UI.creator = null; closeModal();
  if (c.show) { showcase(null); if (UI.gl && S3.mode && S3.mode !== c.mode) s3Mode(c.mode); }
  applyLook(); s3Input(true);
  refresh(true); Snd.play('place');

  const next = () => {
    if (mod('EGITIM')) { if (egNeeded() && startEgitim(false)) return; missionStart(s); return; }
    if (!UI.set.tut) startTutorial(true); else showChapter();
  };

  if (!uiIntro(next)) next();
}


function openWardrobe(tab, from) {
  const s = UI.s; if (!s) return;
  closePda(); if (UI.plan) exitPlan(); scanStop();
  if (!s.look) s.look = lookFix(prof().look);
  UI.wd = { from: from || (s.over && !s.free ? 'end' : 'game'), mode: UI.mode, show: false };
  UI.wardrobeTab = WD_TABS.includes(tab) ? tab : (UI.wardrobeTab || 'astro');
  renderWardrobe(true);
}
function renderWardrobe(first) {
  const s = UI.s, w = UI.wd; if (!s || !w) return;
  const tab = UI.wardrobeTab, lk = lookFix(s.look), box = $('modalBox');
  const sc = first ? 0 : box.scrollTop;
  const grid = (cat, lbl) => `<div class="wd-sec">${lbl ? `<h4>${lbl}</h4>` : ''}<div class="sw-grid">${cosmOf(cat).map(it => swBtn(it, lk, 'wdPick', true)).join('')}</div></div>`;
  let body = '';
  if (tab === 'astro') body = grid('suit', T('cr_suit')) + grid('visor', T('cr_visor'));
  else if (tab === 'arma') body = `<div class="wd-patch"><canvas id="wdPatch" width="192" height="192" aria-hidden="true"></canvas><p class="note">${T('wd_patchD')}</p></div>` + grid('sym', T('wd_sym')) + grid('shape', T('cr_shape')) + grid('bg', T('cr_bg'));
  else body = `<p class="note">${T('wd_' + tab + 'D')}</p>` + grid(tab);
  const tabs = WD_TABS.map(t => `<button class="ptab ${t === tab ? 'on' : ''}" data-act="wdTab" data-v="${t}">${T('wd_t_' + t)}</button>`).join('');
  const html = `<div class="m-head"><span class="m-ic">${ico('helmet')}</span><div><small>${esc(cmdrTitle())}</small><h2>${T('wd_title')}</h2></div></div>
    <nav class="pda-tabs wd-tabs">${tabs}</nav>${rwCard(s, false)}${body}<p class="note">${T('wd_sub')}</p>
    <div class="m-foot"><button class="primary" data-act="wdClose">${T('wd_close')}</button></div>`;
  if (first) openModal(html, 'wardrobe'); else { box.innerHTML = html; box.scrollTop = sc; }
  paintPatch($('wdPatch'), patchSpec(lk));
  paintSwatches(box, lk);
  w.show = showcase(WD_SHOW[tab]) || w.show;
}
function wdClose() {
  const w = UI.wd; if (!w) { closeModal(); return; }
  UI.wd = null; closeModal();
  if (w.show) { showcase(null); if (UI.gl && S3.mode && S3.mode !== w.mode) s3Mode(w.mode); }
  if (w.from === 'end' && UI.s && UI.s.over) modalEnd(true);
  else refresh(true);
}


function learnItems(s) {
  let list = null;
  if (typeof learnedList === 'function') { try { list = learnedList(s); } catch (e) { list = null; } }
  if (!Array.isArray(list) && realOn() && Array.isArray(REAL.learn)) list = REAL.learn.filter(it => it && it.rule && ruleOk(s, it.rule)).map(it => ({ id: it.id, t: it.t, real: it.real || null }));
  return Array.isArray(list) ? list.slice(0, s.level === 'kasif' ? 3 : 4) : [];
}
function learnHtml(s) {
  const list = learnItems(s); if (!list.length) return '';
  return `<h3>${T('learnT')}</h3><ul class="learned">${list.map(it => `<li><span class="ck">${ico('check')}</span><div><p>${esc(tx(it.t))}</p>${it.real ? `<p class="lr"><i>${T('real')}:</i> ${esc(tx(realOf(it.real)))}${srcHtml(realOf(it.real))}</p>` : ''}</div></li>`).join('')}</ul>`;
}

function whyHtml(s, b) {
  if (typeof whyStop !== 'function') return '';
  let w = null; try { w = whyStop(s, b); } catch (e) { w = null; }
  if (!w || !w.why) return '';
  return `<div class="why"><p><b>${T('whyT')}</b> ${esc(tx(w.why))}</p>${w.fix ? `<p><b>${T('whyFix')}</b> ${esc(tx(w.fix))}</p>` : ''}</div>`;
}

const realMs = (s, id) => (realOn() && REAL.ms ? realOf(REAL.ms[id], s) : null);


function bfactBox(s, b) {
  const f = isHab(b) && isShielded(s, b) ? SHIELD_FACT : bfact(s, b.k), sc = scaleOf(s, b.k);
  if (!sc) return factHtml(f);
  if (!f || !tx(f)) return realHtml(sc);
  const src = [f.src, sc.src].filter(Boolean).join('; ');
  return factHtml({ tr: f.tr + ' ' + sc.tr, en: f.en + ' ' + sc.en, src });
}
function scaleOf(s, k) {
  if (!realOn() || !REAL.scale) return null;
  if (k === 'oksijen' && s.world === 'mars') return realOf(REAL.scale.oksijenMars, s);
  if (k === 'hub') return realOf(REAL.scale.hubRtg, s);
  return null;
}

function seeTags(now) {
  const s = UI.s; if (!s || typeof noteTag !== 'function' || !UI.gl || now - (UI.tagT || 0) < 1000) return;
  UI.tagT = now;
  try {
    if (s.world === 'mars' && UI.mode === 'drone' && !(s.tags && s.tags['x:dron'] != null)) noteTag(s, 'x:dron');
    if (!(s.tags && s.tags['x:gezgin'] != null)) { const r = S3.rover, p = S3.player; if (r && p && isFinite(r.x) && Math.hypot(r.x - p.x, r.z - p.z) < 30) noteTag(s, 'x:gezgin'); }
  } catch (e) {   }
}

const ACT = {
  lang() { setLang(LANG === 'tr' ? 'en' : 'tr'); if (UI.modal === 'menu') modalMenu(); },
  world(el) { UI.world = el.dataset.v; UI.level = uiGsLv(UI.world); renderTitle(); Snd.play('click'); },
  level(el) { UI.level = el.dataset.v; renderTitle(); Snd.play('click'); },
  start(el) { const w = (el && el.dataset.v) || UI.world; uiLaunch(w, uiGsLv(w)); },
  speedCycle() { speedCycle(); },
  goalWhy() { goalWhy(); },
  achOpen() { UI.achOpen = true; UI.achDot = 0; if (UI.modal) return; openPda('gorev'); },
  mapT() { if (mod('HARITA')) { closePda(); mapToggle(true); return; } UI.mapOn = !UI.mapOn; const m = $('psMap'); if (m) m.hidden = !UI.mapOn; Snd.play('click'); },
  cont() { const s = loadSave(); if (s) enterGame(s, false); },
  how() { modalHelp(); }, about() { modalAbout(); }, src() { modalSources(); }, menu() { modalMenu(); },
  closeModal() { if (UI.deltaShow && UI.modal === 'event') { UI.deltaShow = false; const s = UI.s, d = UI.lastDelta; closeModal(); if (s) setTimeout(() => floatDeltas(s, d), 60); return; } if (UI.modal === 'creator') { crGo(); return; } if (UI.modal === 'wardrobe') { wdClose(); return; } closeModal(); if (UI.screen === 'title') renderTitle(); },
  crPick(el) { const c = el.dataset.c; if (setLookPart(c, el.dataset.v) && UI.creator) { UI.creator.row = c === 'suit' ? 'suit' : c === 'visor' ? 'visor' : 'patch'; renderCreator(); const b = $('modalBox').querySelector(`.sw[data-v="${el.dataset.v}"]`); if (b) try { b.focus({ preventScroll: true }); } catch (e) {   } } },
  crGo() { crGo(); },
  wardrobe(el) { openWardrobe(el && el.dataset.v, el && el.dataset.from); },
  wdTab(el) { UI.wardrobeTab = el.dataset.v; renderWardrobe(); Snd.play('click'); },
  wdPick(el) { if (setLookPart(el.dataset.c, el.dataset.v)) renderWardrobe(); },
  wdClose() { wdClose(); },
  wearNew(el) { const it = cosmById(el.dataset.v); if (!it) return; if (setLookPart(it.cat, it.id)) { toast(T('worn', tx(it.name)), 'good'); UI.rwDot = Math.max(0, (UI.rwDot || 0) - 1); } const t = el.closest('.toast'); if (t) t.remove(); },
  lockTip(el) { const it = cosmById(el.dataset.v); if (!it) return; Snd.play('click'); toast(T('lockTip', tx(it.name), tx(it.how || '')), 'info'); el.classList.remove('nudge'); void el.offsetWidth; el.classList.add('nudge'); },
  keyHints() { UI.set.keys = !uiKeysOn(); saveSettings(); uiApplyKeys(); if (UI.modal === 'menu') modalMenu(); Snd.play('click'); },
  sound() { UI.sound = !UI.sound; saveSettings(); if (UI.modal === 'menu') modalMenu(); else if (UI.s) { buildHud(); refresh(true); } Snd.play('click'); },
  quality() { UI.set.q = UI.set.q === 'low' ? 'high' : 'low'; saveSettings(); try { S3.quality(UI.set.q); } catch (e) {   } modalMenu(); },

  tutAgain() { closeModal(); closePda(); if (UI.train) return; if (mod('EGITIM')) { startEgitim(true); return; } startTutorial(false); },
  tutSkip() { endTutorial(true); }, tutNext() { if (UI.tut) tutGo(UI.tut.step + 1); },
  tutGot() { if (UI.tut && TUT_INFO[TUT[UI.tut.step]]) tutOk(); },
  tutPlay() { if (UI.plan) exitPlan(); setSpeed(1); },
  tutSumGo() { closeModal(); showChapter(); },
  quit() {
    saveGame(); closeModal(); closePda(); exitPlan();
    if (UI.train) { const EG = mod('EGITIM'); UI.egQuit = true; try { if (EG && typeof EG.skip === 'function') EG.skip(); } catch (e) {   } UI.train = false; UI.realS = null; }
    UI.s = null; try { if (typeof S3 !== 'undefined' && typeof S3.setGoal === 'function') S3.setGoal(null); } catch (e) {   } UI.setGoalK = null;
    try { S3.unload(); } catch (e) {   } showScreen('title'); renderTitle();
  },
  speed(el) { setSpeed(+el.dataset.v); },
  chip(el) { Snd.play('click'); modalDetail(el.dataset.v); },
  suit() { Snd.play('click'); modalDetail('suit'); },
  pda(el) { if (UI.pda && !(el && el.dataset.v)) closePda(); else { ACT.cardClose(); openPda(el && el.dataset.v); } },
  pdaTab(el) { if (UI.pda === 'banka' && el.dataset.v !== 'banka') markBankSeen(); UI.pda = el.dataset.v; if (UI.pda === 'telsiz') telsizSeen(); if (UI.pda === 'defter') ogSeen(); UI.cache.pda = null; renderPda(); $('pdaBody').scrollTop = 0; Snd.play('click'); },
  pdaClose() { closePda(); },
  radioLog() { if (UI.pda === 'telsiz') closePda(); else { if (UI.modal) closeModal(); openPda('telsiz'); } },
  telF(el) { UI.telF = el.dataset.v; UI.cache.pda = null; renderPda(); },
  buildMenu() { if (UI.plan) exitPlan(); else enterPlan(); },
  buildFor(el) { closeModal(); enterPlan(el.dataset.v); },
  pick(el) { pickB(el.dataset.v); },
  grp(el) { UI.grp = el.dataset.v; renderDrawer(); Snd.play('click'); },
  buildBest() { if (UI.best && UI.placing) placeAt({ tx: UI.best.x, ty: UI.best.y }); },
  planDone() { exitPlan(); Snd.play('click'); },
  egDoneGo() { egDoneGo(); },
  planOk() { if (UI.pend) placeAt(UI.pend); },
  undo() { doUndo(); },
  subNext() { subNext(); },
  awayGo() { UI.away = null; },
  skipScene() { try { if (typeof S3.skipScene === 'function') S3.skipScene(); } catch (e) {   } if (UI.sceneEnd) setTimeout(() => UI.sceneEnd && UI.sceneEnd(), 400); },
  use() { interact(); }, fix() { repairAim(); },
  jump() {   window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space' })); setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space' })), 120); },
  view() { closePda(); toggleView(); },
  call(el) { openCall(el.dataset.v); },
  cardClose() { const el = $('scanCard'); if (el.hidden) return; el.classList.add('out'); setTimeout(() => { el.hidden = true; }, 300); },
  cancelPlace() { cancelPlace(); renderDrawer(); },
  bToggle() { const s = UI.s, b = s.b.find(o => o.id === UI.selB); if (toggle(s, b)) { b.st = b.on ? 'ok' : 'kapali'; Snd.play('click'); modalBuilding(b.id); refresh(true); } },
  bRepair() { const s = UI.s, b = s.b.find(o => o.id === UI.selB); doRepair(b, true); },
  bShield() { const s = UI.s, b = s.b.find(o => o.id === UI.selB); if (shieldUp(s, b)) { Snd.play('place'); modalBuilding(b.id); refresh(true); } else Snd.play('no'); },
  bDemolish() { const s = UI.s, b = s.b.find(o => o.id === UI.selB); if (!b) return; if (UI.demolishArm !== b.id) { UI.demolishArm = b.id; modalBuilding(b.id); return; } UI.demolishArm = 0; if (demolish(s, b)) { closeModal(); Snd.play('no'); refresh(true); } },
  tech(el) { if (research(UI.s, el.dataset.v)) { Snd.play('good'); refresh(true); } else Snd.play('no'); },
  evChoice(el) {
    const s = UI.s, p = s.pending.find(q => String(pidOf(q)) === String(UI.evPid)); if (!p) { closeModal(); return; }
    const dlt = choiceDelta(s, p, +el.dataset.v);
    const out = resolve(s, +el.dataset.v, p.pid);
    if (out === null || out === undefined) { Snd.play('no'); return; }
    UI.lastDelta = dlt; UI.deltaShow = true;
    document.querySelectorAll('#evChoices .choice').forEach(b => { b.disabled = true; b.classList.toggle('picked', b === el); });
    const rl = out.real !== undefined ? realOf(out.real, s) : (realOn() && REAL.ev ? realOf(REAL.ev[p.id], s) : null);
    const qOk = out.ok === true ? true : out.ok === false ? false : null;
    if (qOk != null) document.querySelectorAll('#evChoices .choice').forEach(b => { const c = EVENTS[p.id].ch[+b.dataset.v]; b.classList.toggle('right', !!(c && c.ok)); b.classList.toggle('wrongp', b === el && !qOk); });
    const qHead = qOk == null ? '' : `<p class="m-res ${qOk ? 'ok' : 'no'}">${T(qOk ? 'qRight' : 'qWrong')}</p>`;
    $('evResult').innerHTML = `${qHead}${out.text ? `<p class="m-res">${esc(tx(out.text))}</p>` : ''}${qOk === false && out.why ? `<p class="fact"><i>${T('didYouKnow')}</i>${esc(tx(out.why))}</p>` : ''}${qOk != null ? '' : rl ? realHtml(rl) : out.fact ? factHtml(out.fact, T('didYouKnow')) : ''}<div class="m-foot">${qOk != null ? srcHtml(rl) : ''}<button class="primary" data-act="closeModal">${T('go')}</button></div>`;
    Snd.play(qOk === true ? 'good' : qOk === false ? 'no' : 'click'); if (p.id === 'meteor') Snd.play('bad');

    if (out.deltas && !(dlt && pvList(s, dlt.d, dlt.h).length)) { const w = pvList(s, out.deltas).map(x => x.t).join(' · '); if (w) toast(w, 'info'); }
    const f = $('evResult').querySelector('button'); if (f) f.focus();
    pumpLog(); pumpRadio();
  },
  quiz(el) {
    const s = UI.s, qi = UI.quizQ, q = QUIZ[qi], v = +el.dataset.v;
    if (s.quiz && s.quiz.done[qi] != null) return;
    const out = (typeof answerQuiz === 'function' && answerQuiz(s, qi, v)) || { ok: v === 0, expl: q.e };
    document.querySelectorAll('#evChoices .choice').forEach(b => { b.disabled = true; b.classList.toggle('right', +b.dataset.v === 0); b.classList.toggle('wrongp', b === el && v !== 0); });
    $('evResult').innerHTML = `<p class="m-res ${out.ok ? 'ok' : 'no'}">${out.ok ? T('right') : T('wrong', esc(tx(q.a[0])))}</p><p class="fact"><i>${T('didYouKnow')}</i>${esc(tx(out.expl || q.e))}</p><div class="m-foot"><button class="primary" data-act="quizDone">${T('go')}</button></div>`;
    Snd.play(out.ok ? 'good' : 'no');
    const f = $('evResult').querySelector('button'); if (f) f.focus();
  },
  quizOpen(el) { modalQuiz(+el.dataset.v); },
  quizDone() { closeModal(); openPda('banka'); },
  cargo(el) { const id = el.dataset.v, d = +el.dataset.d; UI.cargo.picks[id] = Math.max(0, (UI.cargo.picks[id] || 0) + d); Snd.play('click'); modalCargo(UI.cargo.p); },
  cargoAuto() { UI.cargo.picks = Object.assign({}, (typeof cargoSuggest === 'function' && cargoSuggest(UI.s, UI.cargo.mass)) || {}); Snd.play('click'); modalCargo(UI.cargo.p); },
  cargoClear() { UI.cargo.picks = {}; modalCargo(UI.cargo.p); },
  cargoGo() { const out = resolve(UI.s, UI.cargo.picks, UI.cargo.p.pid); if (!out || !out.ok) { Snd.play('no'); return; } UI.cargo = null; closeModal(); pumpLog(); pumpCalls(); refresh(true); },
  endNew() { closeModal(); UI.s = null; try { S3.unload(); } catch (e) {   } showScreen('title'); renderTitle(); },
  endMenu() { ACT.endNew(); },
  endFree() { const s = UI.s; s.over = null; s.free = true; UI.endShown = false; closeModal(); refresh(true); },
};
function keepName() { const i = $('cmdName'); if (i) UI.name = i.value.trim().slice(0, 18); }
function setSpeed(i, quiet) {
  const v = SPEEDS[i]; if (v == null) return;
  if (v === 0 && UI.speed === 0) UI.speed = UI.prevSpeed || 1; else { if (UI.speed) UI.prevSpeed = UI.speed; UI.speed = v; }
  if (!quiet) { UI.spdBack = 0; Snd.play('click'); if (UI.speed > 0) tutEvent('time'); }
  if (UI.s) updateHud();
}
function toggleView() {
  if (!UI.gl || !UI.s || UI.plan) return;
  s3Mode(S3.mode === 'drone' ? 'walk' : 'drone');
  UI.viewPref = UI.mode === 'drone' ? 'drone' : 'walk';
  scanStop(); Snd.play('click'); updateHud();
}



function pauseReason(s) {
  if (!s || s.over) return null;
  if (uiIntroNow()) return 'intro';
  if (UI.egDone) return 'egdone';
  if (quickOpen()) return 'quick';
  if (mapBig()) return 'map';
  if (UI.modal === 'menu') return 'menu';
  if (UI.modal) return 'modal';
  if (UI.pda) return 'tablet';
  if (UI.plan) return 'plan';
  if (UI.away) return UI.away;
  if (UI.speed > 0 && radioHold()) return 'radio';
  if (UI.speed > 0 && callHold(s)) return 'call';
  return null;
}
let lastT = 0, lastHud = 0, glErr = 0;


const uiLiteW = { n: 0, ms: 0, on: false, manual: false, g0: 0 };
function uiLiteSet(v) { uiLiteW.on = !!v; const a = $('app'); if (a) a.classList.toggle('lite', uiLiteW.on); return uiLiteW.on; }
function uiLiteTick(ms) {
  if (uiLiteW.on || uiLiteW.manual || UI.screen !== 'game' || document.hidden || !(ms > 0) || ms > 250) return;
  const nw = performance.now(); if (!uiLiteW.g0) uiLiteW.g0 = nw; if (nw - uiLiteW.g0 < 5000) return;
  uiLiteW.n++; uiLiteW.ms += ms;
  if (uiLiteW.ms < 3000) return;
  const fps = uiLiteW.n * 1000 / uiLiteW.ms; uiLiteW.n = 0; uiLiteW.ms = 0;
  if (fps < 28) uiLiteSet(true);
}
function uiLite(v) { if (v === undefined) return uiLiteW.on; uiLiteW.manual = true; return uiLiteSet(v); }
function frame(now) {
  requestAnimationFrame(frame);
  const rawMs = Math.min(1000, Math.max(0, now - lastT)), dt = Math.min(0.1, rawMs / 1000); lastT = now; UI.rawMs = rawMs;
  if (UI.screen === 'title') {
    let gl = false; if (typeof GIRIS !== 'undefined') try { gl = GIRIS.frame(now, $('title'), uiGs); } catch (e) { if (glErr++ < 3) console.error(e); gl = false; }
    const bg = $('titleBg'); if (bg.hidden !== gl) bg.hidden = gl;
    if (!gl) drawTitle(bg, UI.world, now);
    return;
  }
  const s = UI.s; if (!s) return;
  if (uiIntroNow()) { UI.paused = 'intro'; if (UI.gl) try { S3.frame(s, dt, now, UI.frac); } catch (e) { if (glErr++ < 3) console.error(e); } return; }
  uiLiteTick(rawMs);
  UI.paused = pauseReason(s);
  { const dk = Math.floor(s.t / 24); if (UI.holdDay !== dk) { UI.holdDay = dk; UI.holdS = 0; } if (UI.paused === 'radio') UI.holdS = (UI.holdS || 0) + rawMs / 1000; }
  if (UI.paused === 'call') { const p = callHold(s); if (p) { const id = pidOf(p); UI.callWait[id] = (UI.callWait[id] || 0) + (now - (UI.lastFrameT || now)); } }
  UI.lastFrameT = now;
  const run = !UI.paused && !s.over && UI.speed > 0 && !tutGate();
  let ticked = false;
  if (run) {
    UI.acc += dt * UI.speed / HOUR_S;
    let n = 0;
    while (UI.acc >= 1 && n++ < 8) {
      UI.acc -= 1; tick(s); ticked = true;
      pumpLog(); pumpRadio(); pumpCalls();
      if (s.dirty) saveGame();
      if (s.over) { UI.acc = 0; break; }
    }
    UI.frac = Math.min(0.999, UI.acc);
  }
  if (UI.gl) {
    if (typeof S3.setHold === 'function') S3.setHold(UI.modal === 'menu');
    try { S3.frame(s, dt, now, UI.frac); } catch (e) { if (glErr++ < 3) console.error(e); }
    live(dt, now, run);
  }
  modTick(dt, now);
  if (s.over && !s.train && !UI.train && !UI.endShown && !UI.modal && !endScene(s)) modalEnd();
  if (ticked || now - lastHud > 250) { lastHud = now; refresh(); }
}
function live(dt, now, run) {
  const s = UI.s, P = S3.player;
  if (P) {
    if (s.pl) { s.pl.x = P.x; s.pl.z = P.z; s.pl.yaw = P.yaw; }
    if ((P.tx !== UI.ptx || P.ty !== UI.pty) && inMap(P.tx, P.ty)) {
      UI.ptx = P.tx; UI.pty = P.ty;
      if (typeof explore === 'function') for (const k of foundKinds(explore(s, P.tx, P.ty))) if (STR['tl_' + k]) { toast(T('found', T('tl_' + k)), 'good'); Snd.play('done'); }
    }
  }
  UI.mode = S3.mode || UI.mode;
  placeSub();
  UI.ctx = UI.modal || UI.pda ? null : readCtx();
  if (UI.ctx && UI.ctx.f) UI.lastF = { f: UI.ctx.f, t: performance.now() };
  { const sb = $('aScan'); if (sb) { const s = UI.s, hl = !!s && kasif() && !s.done.kesif && !UI.scanH && !!((UI.ctx && UI.ctx.f) || scanLatchF()); if (sb._hl !== hl) { sb._hl = hl; sb.classList.toggle('scan-hl', hl); } } }
  scanTick(now); renderPrompt(now); renderPlanUi(); seeTags(now); renderCtx(); pumpAch();
  if (UI.goalFlip && performance.now() > UI.goalFlip) { UI.goalFlip = 0; renderObjective(); }
  suitTick(dt, !UI.paused && UI.speed > 0 && !s.over);
  tutTick(); subTick(UI.rawMs || dt * 1000, now);
  if (!UI.tut && s.fx && s.fx.chapterT != null && s.fx.chapterT !== UI.chapT && !UI.modal && !UI.pda && !UI.plan) showChapter(s.fx.chapter);
  renderMarkers(); drawRadar();
  const v = $('veil'); if (v) { if (UI.away && v._k !== LANG) { v._k = LANG; v.querySelector('.veil-t').textContent = T('awayT'); v.querySelector('.veil-d').textContent = T('awayD'); } v.hidden = !UI.away; }
  $('hud').dataset.pause = UI.paused || '';
}



function mapClear() {
  const m = $('hrMini'), hud = $('hud'); if (!hud) return;
  let b = null;
  if (m && !m.hidden && m.getClientRects().length && getComputedStyle(m).visibility !== 'hidden') {
    const r = m.getBoundingClientRect(), h = hud.getBoundingClientRect(), sc = hud.offsetWidth ? h.width / hud.offsetWidth : 1;
    if (r.height > 0) b = Math.ceil((r.bottom - h.top) / (sc || 1) + 8);
  }
  for (const id of ['toasts', 'scanCard']) {
    const el = $(id); if (!el) continue;
    if (b == null || UI.plan) { if (el.style.top) el.style.top = ''; continue; }
    el.style.top = ''; const css = parseFloat(getComputedStyle(el).top);
    const v = isNum(css) && css >= b ? '' : b + 'px';
    if (v) el.style.top = v;
  }
}

function modTick(dt, now) {
  if (UI.screen !== 'game' || !UI.s) return;
  const IK = mod('ISKART'); if (IK && typeof IK.tick === 'function') try { IK.tick(now); } catch (e) { if (glErr++ < 3) console.error(e); }
  const EG = mod('EGITIM'); if (EG && typeof EG.tick === 'function') try { EG.tick(dt, now); } catch (e) { if (glErr++ < 3) console.error(e); }

  const OG = mod('OGRET'); if (OG && typeof OG.tick === 'function') try { OG.tick(now); } catch (e) { if (glErr++ < 3) console.error(e); }
  const HR = mod('HARITA');
  { const on = !!HR, ap = $('app'); if (ap && ap._map !== on) { ap._map = on; ap.classList.toggle('hasmap', on); } if (on === !!$('mapBtn')) { buildHud(); refresh(true); } }
  if (HR) {
    const hide = !!(UI.plan || UI.pda || UI.modal || UI.egDone || UI.sceneOn);
    if (UI.mapHid !== hide && typeof HR.hide === 'function') { UI.mapHid = hide; try { HR.hide(hide); } catch (e) { if (glErr++ < 3) console.error(e); } }
    if (typeof HR.tick === 'function') try { HR.tick(now); } catch (e) { if (glErr++ < 3) console.error(e); }
    if (!(UI.mapClrAt > now)) { UI.mapClrAt = now + 300; mapClear(); }
  }

  if (UI.repW && !quickOpen()) { const s = UI.s, w = UI.repW; UI.repW = null; const b = s.b.find(o => o.id === w.bid); if (b && !b.broken) repairedFx(s, b, false); }
  spendTick(); pwTick(now); uiToastPump(now); uiSpeedBack(); { const hd = $('hud'); if (hd) hd.classList.toggle('subon', !!UI.sub); }
  if (UI.driveWant) {
    if (now > UI.driveWant || S3.driving) UI.driveWant = 0;
    else { let d = null; try { d = S3.nearRover(); } catch (e) { d = null; } if (isNum(d) && d <= 3.5 && safeB(() => S3.drive(true))) { UI.driveWant = 0; Snd.play('click'); subLocal('atlas', T('driveOn'), 'info', true); } }
  }
}

function endScene(s) {
  if (s.over.why !== 'isyan' || !UI.gl || typeof S3.launchScene !== 'function' || UI.sceneDone) return false;
  if (!UI.sceneOn) {
    UI.sceneOn = true; closePda(); if (UI.plan) exitPlan(); s3Input(false);
    $('hud').classList.add('cine'); const b = $('skipBtn'); b.textContent = T('skipScene') + ' ›'; b.hidden = false; const cap = $('sceneCap'); if (cap) { cap.textContent = T('sceneCap'); cap.hidden = false; }
    const done = () => { if (!UI.sceneOn) return; UI.sceneOn = false; UI.sceneDone = true; $('hud').classList.remove('cine'); $('skipBtn').hidden = true; if ($('sceneCap')) $('sceneCap').hidden = true; };
    UI.sceneEnd = done;
    try { S3.launchScene(done); } catch (e) { console.error(e); done(); }
  }
  return !UI.sceneDone;
}


function onKey(e) {
  if (UI.modal === 'creator' && (e.key === 'Escape' || (e.key === 'Enter' && !(e.target && e.target.tagName === 'BUTTON' && e.target.id !== 'crGo')))) { e.preventDefault(); crGo(); return; }
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (UI.screen === 'title') {
    if (e.key === 'Escape') { if (UI.modal) { e.preventDefault(); ACT.closeModal(); } return; }
    if (!UI.modal && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      const h = document.querySelector(`#titleInner .gs-half[data-w="${e.key === 'ArrowLeft' ? 'ay' : 'mars'}"]`);
      if (h) { e.preventDefault(); h.focus(); uiGsFocus(h.dataset.w); }
    }
    return;
  }
  if (UI.screen !== 'game' || !UI.s) return;
  if (uiIntroNow()) return;
  const c = e.code;
  if (UI.egDone) { if ((e.key === 'Enter' || c === 'Space') && !e.repeat) { e.preventDefault(); egDoneGo(); } else if (e.key === 'Escape' || c === 'Space' || c === 'Tab') e.preventDefault(); return; }
  if (quickOpen()) { if (e.key === 'Escape' || c === 'Tab') e.preventDefault(); return; }
  if (mapBig()) { if (e.key === 'Escape' || c === 'KeyM') { e.preventDefault(); mapToggle(false); } return; }
  if (UI.away) { UI.away = null; if (e.key === 'Escape' || c === 'Space') e.preventDefault(); return; }
  if (e.key === 'Escape') {
    if (performance.now() - UI.lockMenuT < 400) return;
    if (UI.modal) { if (UI.modal !== 'end') ACT.closeModal(); return; }
    if (UI.pda) { closePda(); return; }
    if (UI.plan) { exitPlan(); return; }
    if (UI.scanH) { scanStop(); return; }
    if (UI.locked) return;
    modalMenu(); return;
  }
  if ((e.key === 'Enter' || c === 'Space') && UI.sub && !UI.modal && !UI.pda && !e.repeat) { if (e.key === 'Enter') e.preventDefault(); subNext(); if (e.key === 'Enter') return; }
  if (UI.modal) return;
  if (c === 'Tab' || c === 'KeyI') { e.preventDefault(); if (UI.pda) closePda(); else openPda(); return; }
  if (UI.pda) { if (c === 'KeyB') { closePda(); enterPlan(); } return; }
  if (e.repeat && c !== 'KeyF') return;
  if (c === 'KeyP') { setSpeed(0); return; }
  if (c === 'Digit1' || c === 'Digit2' || c === 'Digit3') { if (c === 'Digit3' && !featIs('hiz4')) { Snd.play('no'); return; } setSpeed(+c.slice(5)); return; }
  if (c === 'KeyB') { ACT.buildMenu(); return; }
  if (c === 'KeyM' && mod('HARITA')) { mapToggle(); return; }
  if (UI.plan) return;
  if (c === 'KeyF') { if (!e.repeat) scanStart(); }
  else if (c === 'KeyE') { if (UI.mode === 'walk') interact(); }
  else if (c === 'KeyR') repairAim();
  else if (c === 'KeyV') toggleView();
  else if (c === 'KeyT') openCall();
}

function onLock(v, why) {
  const was = UI.locked; UI.locked = !!v;
  if (v) { UI.dragLook = false; return; }
  if (!was || UI.screen !== 'game' || !UI.s || UI.s.over) return;
  if (UI.modal || UI.pda || UI.plan || UI.mode !== 'walk') return;
  const user = why ? why === 'user' : performance.now() - UI.selfT > 300;
  if (!user) return;
  UI.lockMenuT = performance.now(); modalMenu();
}
function droneTap(tx2, ty) {
  const s = UI.s; UI.droneArm = false; UI._ctxK = null;
  const ok = callExt('droneScout', s, tx2, ty);
  if (!ok) { Snd.play('no'); toast(T('droneNo'), 'info'); return; }
  const w = wpos(tx2, ty);
  if (UI.gl && typeof S3.droneFx === 'function') try { S3.droneFx(w.x, w.z); } catch (e) {   }
  Snd.play('scan'); toast(T('droneOk'), 'good'); refresh(true);
}
function planCancel() { if (!UI.plan) return; if (UI.placing) { cancelPlace(); UI.sel = null; UI.cache.drawer = null; renderDrawer(); } else exitPlan(); }
function setAway(r) { if (UI.screen === 'game' && UI.s && !UI.s.over && !UI.modal) { UI.away = r; scanStop(); } }
function bindScene() {
  S3.on('primary', a => {
    if (!UI.s || UI.modal || UI.pda || UI.egDone || quickOpen() || mapBig()) return;
    if (UI.plan) {
      if (UI.placing) { if (UI.touch) { if (a && inMap(a.tx, a.ty)) UI.pend = { tx: a.tx, ty: a.ty }; } else placeAt(a); return; }
      const sp = a && starterList(UI.s).find(p => p.x === a.tx && p.y === a.ty);
      if (sp) { pickB(sp.k); UI.pend = { tx: a.tx, ty: a.ty }; return; }
      { const hk = document.querySelector('#drawer .dcard.tut-hl, #drawer .dcard.eg-hl2');
        if (hk && hk.dataset.v && a && inMap(a.tx, a.ty) && a.kind !== 'building') { pickB(hk.dataset.v); if (UI.placing === hk.dataset.v) { if (UI.touch) UI.pend = { tx: a.tx, ty: a.ty }; else placeAt(a); } return; } }
      if (a && a.kind === 'building') modalBuilding(a.bid);
      return;
    }
    if (UI.placing) { placeAt(a); return; }
    if (UI.droneArm && a && inMap(a.tx, a.ty)) { droneTap(a.tx, a.ty); return; }
    if (a && a.kind === 'building') { const b = UI.s.b.find(o => o.id === a.bid); if (b) { modalBuilding(b.id); return; } }
    interact(a);
  });
  S3.on('hover', () => {   });
  S3.on('jump', () => { const s = UI.s; if (!s) return; if (!UI.jumped) { UI.jumped = true; if (typeof noteTag === 'function') noteTag(s, 'x:jump'); } tutEvent('jump'); });
  S3.on('mode', m => { UI.mode = m || S3.mode; scanStop(); });
  S3.on('lock', (v, why) => onLock(v, why));
  S3.on('cancel', () => planCancel());
  S3.on('scene', st => { if (st === 'end' && UI.sceneEnd) UI.sceneEnd(); });

  S3.on('blockedMove', () => { if (UI.modal && (UI.modal === 'bcard' || UI.modal === 'detail') && !UI.pda) ACT.closeModal(); });

  $('c3').addEventListener('pointerdown', e => {
    if (e.button === 2) UI.rdown = { x: e.clientX, y: e.clientY };
    if (e.pointerType === 'mouse' && UI.mode === 'walk' && !UI.locked) setTimeout(() => { if (!UI.locked && UI.mode === 'walk') UI.dragLook = true; }, 800);
  });
}
function boot() {
  const set = store.get(SET_KEY) || {};
  UI.set = set;
  LANG = 'en';
  if (set.lang === 'en' || set.lang === 'tr') LANG = set.lang;
  UI.sound = set.sound !== false;
  if (location.hash === '#en') LANG = 'en'; else if (location.hash === '#tr') LANG = 'tr';
  document.documentElement.lang = LANG;
  UI.touch = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); uiTouchF = UI.touch;
  $('app').classList.toggle('touch', UI.touch);
  applyResColors();
  UI.name = prof().name || '';
  renderTitle();
  try { UI.gl = typeof S3 !== 'undefined' && typeof THREE !== 'undefined' && S3.init($('c3')) === true; } catch (e) { console.error(e); UI.gl = false; }
  if (UI.gl) { bindScene(); if (set.q) try { S3.quality(set.q); } catch (e) {   } }
  document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el || el.disabled) return; const f = ACT[el.dataset.act]; if (f) { e.stopPropagation(); f(el, e); } });
  $('modal').addEventListener('click', e => { if (e.target === $('modal') && SOFT[UI.modal]) { if (UI.modal === 'tutsum') ACT.tutSumGo(); else ACT.closeModal(); } });
  $('pda').addEventListener('click', e => { if (e.target === $('pda')) closePda(); });
  { const t = $('title'), hw = e => { const h = e.target && e.target.closest && e.target.closest('.gs-half'); return h ? h.dataset.w : null; };
    t.addEventListener('pointerover', e => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') { const w = hw(e); if (w) uiGsFocus(w); } });
    t.addEventListener('pointerleave', () => uiGsFocus(null));
    t.addEventListener('focusin', e => { const w = hw(e); if (w) uiGsFocus(w); }); }
  window.addEventListener('resize', () => { if (UI.gl) try { S3.resize(); } catch (e) {   } });
  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', e => { if (e.code === 'KeyF') scanRelease(); });
  const sub = $('sub');
  sub.addEventListener('mouseenter', () => { UI.subHover = true; }); sub.addEventListener('mouseleave', () => { UI.subHover = false; });
  sub.addEventListener('touchstart', () => { UI.subHover = true; }, { passive: true }); sub.addEventListener('touchend', () => { UI.subHover = false; }); sub.addEventListener('touchcancel', () => { UI.subHover = false; });
  const cv = $('c3');
  cv.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect(); UI.mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (UI.tut && e.buttons && TUT[UI.tut.step] === 'look') UI.tut.drag += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
  });
  cv.addEventListener('pointerleave', () => { if (UI.mode !== 'walk') UI.mouse = null; });

  cv.addEventListener('contextmenu', e => {
    e.preventDefault(); if (!UI.plan || planScene()) return;
    const d = UI.rdown ? Math.hypot(e.clientX - UI.rdown.x, e.clientY - UI.rdown.y) : 0; UI.rdown = null;
    if (d > 6) return;
    planCancel();
  });
  const persist = () => { if (UI.s && UI.screen === 'game') saveGame(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) { persist(); setAway('hidden'); } });
  window.addEventListener('blur', () => { if (!document.hasFocus()) setAway('blur'); });
  document.addEventListener('pointerdown', () => { if (UI.away) UI.away = null; }, true);
  window.addEventListener('pagehide', persist);
  requestAnimationFrame(frame);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

if (location.hash === '#test') window.__uu = {
  UI, ACT, STR, T, tick, resolve, build, refresh, score, saveGame, setSpeed, openPda, closePda, openCall, modalEvent, modalCargo, modalQuiz, modalBuilding, modalMenu, modalEnd, startTutorial, endTutorial, tutGo, tutEvent, showChapter,
  doScan, doCollect, landShip, placeAt, pickB, toggleView, enterPlan, exitPlan, subNext, queueSub, onLock, bestSpot, feats, splitSub, starter: () => (UI.s ? starterList(UI.s) : []),
  scanInfo: (s, x, y) => (typeof scanInfo === 'function' ? scanInfo(s, x, y) : null),
  pushEvent: (s, id, d) => (typeof pushEvent === 'function' ? pushEvent(s, id, d) : false),
  ff(n) { const s = UI.s; for (let i = 0; i < n && !s.over; i++) tick(s); UI.logN = s.logN; UI.radioN = s.radioN || 0; pumpCalls(); refresh(true); return s.t; },
  pauseReason: () => UI.paused, tut: () => (UI.tut ? { step: UI.tut.step, id: TUT[UI.tut.step], n: TUT.length, ok: !!UI.tut.okT } : null),
  subState: () => (UI.sub ? { text: UI.sub.q.text, title: UI.sub.r.title ? tx(UI.sub.r.title) : '', hint: UI.sub.q.hint, left: UI.sub.left, total: UI.sub.total, chars: UI.sub.chars, part: UI.sub.q.i, parts: UI.sub.q.n, q: UI.subQ.length, n: UI.sub.r.n || 0 } : { q: UI.subQ.length }),
  unread: () => (UI.s ? unreadN(UI.s) : 0),
  W: () => WORLDS[UI.s.world],
  kesifTarget: () => (UI.s ? kesifTarget(UI.s) : null), scanStart, scanRelease,
  feats3, defLook: () => defLook(), openCreator, openWardrobe, crGo, look: () => (UI.s ? UI.s.look : null), prof: () => prof(), nextRw: () => (UI.s ? nextRw(UI.s) : []), learn: () => (UI.s ? learnItems(UI.s) : []), cosm: () => cosmAll(),
  forceUnlock(id) { const s = UI.s; if (!s) return false; if (!s.unl) s.unl = {}; s.unl[id] = s.t; const n = cosmTick(s); refresh(true); return n; },
  get S3() { return typeof S3 !== 'undefined' ? S3 : null; },

  egitimAtla(v) { UI.egSkip = !!v; return UI.egSkip; }, hasEgitim: () => typeof EGITIM !== 'undefined', hasIskart: () => typeof ISKART !== 'undefined', hasCore: () => typeof currentGoal === 'function' && typeof ACHIEVEMENTS !== 'undefined',
  mod, ext: n => !!ext(n), goal: () => (UI.goal ? Object.assign({}, UI.goal, { eg: undefined }) : null), renderObjective, achTick: () => (UI.s ? achTick(UI.s) : null), prof2: () => prof(),

  hizliSoru(v) { UI.quickQ = v !== false; return UI.quickQ; }, egDoneShow: (done, fresh) => egDoneShow(UI.s, done !== false, fresh !== false), egDoneGo, egDone: () => (UI.egDone ? Object.assign({}, UI.egDone) : null), egFinish,
  spendTick, pwTick: () => { UI.pwNext = 0; pwTick(performance.now()); }, doRepair: bid => doRepair(UI.s.b.find(o => o.id === bid), false), tabs: () => (UI.s ? tabsFor(UI.s) : []), teachOf: k => teachOf(UI.s, k), modTick: () => modTick(0, performance.now()),
  outlook: () => (UI.s ? callExt('powerOutlook', UI.s) : null), costOf: k => (UI.s ? costOf(UI.s, k) : null), repairCost: bid => (UI.s ? repairCost(UI.s, UI.s.b.find(o => o.id === bid)) : null),
  pwTag: k => (UI.s ? pwTag(UI.s, k) : ''), pwState: () => UI.pwState || null, toast, toastQ: () => (UI.toastQ || []).length, uiReadMs,
  startAs(world, level) { if (UI.screen !== 'title') return null; UI.world = world === 'mars' ? 'mars' : 'ay'; UI.level = level || uiGsLv(UI.world); const s = newMission(UI.world, UI.level, prof().name || UI.name || ''); enterGame(s, true); return s.level; },
  intro: false, introNow: () => uiIntroNow(), gsState: () => ({ focus: uiGs.focus, dive: !!uiGs.dive, gl: typeof GIRIS !== 'undefined' && GIRIS.running() }),
  startEgitim, missionStart, subMs, ctx: () => (UI.ctxA ? UI.ctxA.t : null), speedCycle, featIs, newMission, newGame, enterGame, loadSave, get EVENTS() { return EVENTS; },
};
if (window.__uu) window.__uu.lite = uiLite;
