'use strict';


const STORY = (() => {
  const day = s => Math.floor(s.t / 24) + 1;
  const nightAt = (s, d) => s.t >= (WORLDS.ay.night.start + d) * 24;
  const relicDone = (s, i) => s.story.relics[i] != null;
  const ATL = L('ATLAS', 'ATLAS');
  const bedsShort = s => { let n = 0; for (const b of s.b) if ((b.k === 'hub' || b.k === 'yasam') && b.left === 0 && (b.k === 'hub' || b.st === 'ok')) n += BLD[b.k].beds; return s.pop > n; };

  const cast = {
    deniz: { name: L('Deniz', 'Deniz'), role: L('Görev Kontrol', 'Mission Control'), from: 'mc' },
    atlas: { name: L('ATLAS', 'ATLAS'), role: L('Üssün yardımcı yapay zekâsı', 'The base\'s helper AI'), from: 'atlas' },
    ece: { name: L('Ece', 'Ece'), role: L('Mühendis', 'Engineer'), from: 'crew', suit: '#ff7a2f' },
    kerem: { name: L('Kerem', 'Kerem'), role: L('Doktor', 'Doctor'), from: 'crew', suit: '#3b8ee8' },
    nil: { name: L('Nil', 'Nil'), role: L('Bitki bilimci', 'Botanist'), from: 'crew', suit: '#3fbf5f' },
    arda: { name: L('Arda', 'Arda'), role: L('Jeolog (taş bilimci)', 'Geologist (rock scientist)'), from: 'crew', suit: '#f2c230' },
  };


  const CREW = ['ece', 'kerem', 'nil', 'arda'];
  const SUITS = ['#ff7a2f', '#3b8ee8', '#3fbf5f', '#f2c230', '#9b6bff', '#ff5fa2'];
  const rgb = h => { const n = parseInt(String(h).replace('#', '').slice(0, 6), 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const near = (a, b) => {
    const p = rgb(a), q = rgb(b), r = (p[0] + q[0]) / 2, d = [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
    return Math.sqrt((2 + r / 256) * d[0] * d[0] + 4 * d[1] * d[1] + (2 + (255 - r) / 256) * d[2] * d[2]) < 120;
  };
  const hexOf = v => typeof v === 'number' ? '#' + v.toString(16).padStart(6, '0') : String(v || '').toLowerCase();
  function crewColors(player) {
    const pl = hexOf(player);
    let pal = SUITS;
    if (typeof COSMETICS !== 'undefined' && Array.isArray(COSMETICS)) {
      const c = COSMETICS.filter(o => o && o.cat === 'suit' && /^#[0-9a-f]{6}$/i.test(o.hex || '')).map(o => o.hex.toLowerCase());
      if (c.length >= 5) pal = c;
    }

    const out = CREW.map(() => null), taken = [], free = h => !(pl && near(h, pl)) && !taken.some(u => near(u, h));
    CREW.forEach((id, i) => { const h = cast[id].suit; if (free(h)) { out[i] = h; taken.push(h); } });
    CREW.forEach((id, i) => { if (out[i]) return; const h = pal.find(free) || SUITS.find(free) || cast[id].suit; out[i] = h; taken.push(h); });
    return out;
  }


  const WHY = {
    yok: L('hiç kurulmadı', 'was never built'), guc: L('elektriksiz kaldı', 'had no power'), isci: L('çalıştıracak kimse yoktu', 'had nobody to run it'),
    ariza: L('bozuktu', 'was broken'), girdi: L('çalışmıyordu', 'was not running'), az: L('büyüyen ekibe yetmedi', 'could not keep up with the crew'),
  };
  const MAKER = { o2: 'oksijen', su: 'su', gida: 'sera' };
  const causeLine = s => {
    const c = s.stat.causes[s.stat.causes.length - 1];
    if (!c || !WHY[c.why] || !MAKER[c.r]) return null;
    const n = BLD[MAKER[c.r]].nameW ? BLD[MAKER[c.r]].nameW[s.world] : BLD[MAKER[c.r]].name;
    return L(`Neden: ${n.tr} ${WHY[c.why].tr}.`, `Why: the ${n.en} ${WHY[c.why].en}.`);
  };
  const WHYT = L('Neden oldu?', 'Why did it happen?');
  const react = [
    { id: 'tahliye', when: s => s.stat.evac > 0, from: 'crew', who: 'ece', c: 'bad', title: L('Bir arkadaşımız gitti', 'A friend has gone'),
      text: [L('Bir arkadaşımızı kapsülle eve gönderdik.', 'We sent a friend home in the capsule.'), L('Hava, su ve yemek bitmemeli.', 'Air, water and food must not run out.')],
      more: causeLine,
      hint: L('Biten şeyi yapan makineyi kur.', 'Build the machine that makes what ran out.') },

    { id: 'karanlik', when: s => s.stat.blackDark > 0, from: 'atlas', c: 'warn', title: WHYT,
      text: [L('Elektrik kesildi: batarya boşaldı.', 'The power went out: the battery ran empty.'),
             L('Gece için gündüzden daha çok elektrik saklamalıyız.', 'We must save more daytime power for the night.')],
      hint: s => (typeof ckPwAdvice === 'function' ? ckPwAdvice(s) : null),
      fact: L('Uzay İstasyonu da Dünya\'nın gölgesindeyken bataryayla çalışır.', 'The Space Station also runs on batteries while it is in Earth\'s shadow.') },
    { id: 'donma', when: s => s.stat.frozen > 0, from: 'atlas', c: 'warn', title: WHYT,
      text: [L('Sera durdu: elektrik kesilince bitkiler dondu.', 'The greenhouse stopped: the plants froze when the power went out.'),
             L('Bitkiler ılık kalmak için elektrik ister.', 'Plants need power to stay warm.')],
      hint: L('Seraya gece de elektrik lazım: batarya kur.', 'The greenhouse needs power at night too: build batteries.') },
    { id: 'doz', when: s => s.stat.flareOpen > 0, from: 'atlas', c: 'warn', title: WHYT,
      text: [L('Ekip fazla radyasyon aldı: patlamada herkes korunakta değildi.', 'The crew got extra radiation: not everyone was sheltered in the flare.'),
             L('Güneş patlamasında açıkta kalan fazla radyasyon alır.', 'In a solar flare, anyone left outside gets extra radiation.')],
      hint: L('Modülleri toprakla ört, korunaklı yatak yap.', 'Cover modules with soil to make protected beds.'),
      fact: L('Gerçek astronotlar da güneş patlamasında en korunaklı yere geçer.', 'Real astronauts also move to the best-shielded spot during a solar flare.') },
    { id: 'isci', when: s => s.b.some(b => b.left === 0 && b.st === 'isci'), from: 'atlas', c: 'warn', title: WHYT,
      text: [L('Bir yapı durdu: onu çalıştıracak kimse yok.', 'A building stopped: nobody is free to run it.'),
             L('Bazı makinelere bir ekip üyesi bakmalı.', 'Some machines need a crew member to run them.')],
      hint: L('Ekip getir ya da bir yapıyı kapat.', 'Bring more crew or switch a building off.') },
    { id: 'yatak', when: bedsShort, from: 'crew', who: 'kerem', c: 'warn', title: L('Yatak yok', 'No beds'),
      text: [L('{ad}, bazılarımız yerde yatıyor.', '{ad}, some of us sleep on the floor.'),
             L('Uykusuz ekip mutsuz olur.', 'A sleepless crew is an unhappy crew.')],
      hint: L('Yaşam Modülü kur ya da kapalı olanı aç.', 'Build a Habitat Module or switch one back on.') },
    { id: 'hasat', when: s => s.tags['x:hasat'] != null, from: 'crew', who: 'nil', c: 'good', title: L('İlk hasat', 'First harvest'),
      text: [L('İlk marullar hazır!', 'The first lettuce is ready!'), L('Taze yeşillik herkesi sevindirdi.', 'Fresh greens made everyone happy.')],
      hint: L('Ekip büyüdükçe bir sera daha kur.', 'Build another greenhouse as the crew grows.') },
    { id: 'maden', when: s => s.bank['s:m'] != null, from: 'crew', who: 'arda', c: 'good', title: L('Turuncu taşlar', 'Orange rocks'),
      text: [L('Bu turuncu taşlar harika!', 'These orange rocks are great!'), L('İçlerinden bol yapı malzemesi çıkar.', 'They hold lots of building material.')],
      hint: L('Toprak Kazıcıyı turuncu alana kur.', 'Put a Soil Digger on the orange patch.') },
  ];

  const ay = {
    title: L('Shackleton\'ın Kıyısında', 'On Shackleton\'s Rim'),
    chapters: [
      { id: 'inis', name: L('İniş', 'Landing'), sub: L('Shackleton Krateri\'nin kıyısı · 1. gün', 'Rim of Shackleton Crater · Day 1'), when: () => true,
        goal: L('Bu bölümde: elektrik, hava ve su makinelerini kur.', 'In this chapter: build power, air and water machines.') },
      { id: 'iz', name: L('Öncü\'nün İzi', 'Öncü\'s Trail'), sub: L('İki yıl önce burada bir gezgin sustu', 'A rover fell silent here two years ago'), when: s => day(s) >= 4,
        goal: L('Bu bölümde: çevreyi keşfet ve yemek için sera kur.', 'In this chapter: explore and build a greenhouse for food.') },
      { id: 'gece', name: L('Uzun Gece', 'The Long Night'), sub: L('Dört gün boyunca Güneş yok', 'Four days without the Sun'), when: s => nightAt(s, 0),
        goal: L('Bu bölümde: bataryayla geceyi atlat, gereksizleri kapat.', 'In this chapter: get through the night on batteries.') },
      { id: 'safak', name: L('Gün Doğumu', 'Sunrise'), sub: L('Işık geri döndü', 'The light is back'), when: s => nightAt(s, WORLDS.ay.night.len),
        goal: L('Bu bölümde: ekibi büyüt ve yeni yataklar kur.', 'In this chapter: grow the crew and add beds.') },
      { id: 'kalici', name: L('Kalıcı Üs', 'A Permanent Base'), sub: L('Ufuk-2 için bir ev', 'A home for Horizon-2'), when: s => day(s) >= 22,
        goal: L('Bu bölümde: hava, su ve yemeğin hepsini kendin yap.', 'In this chapter: make all your own air, water and food.') },
    ],
    beats: [
      { id: 'selam', when: () => true, from: 'mc', who: 'deniz', title: L('Hoş geldiniz', 'Welcome'),
        text: [L('Ufuk-1, ben Deniz, Görev Kontrol. İnişiniz kusursuzdu!', 'Horizon-1, this is Deniz at Mission Control. A perfect landing!'),
               L('Sesim size 1,3 saniye geç ulaşır. Ama hep buradayız.', 'My voice reaches you 1.3 seconds late. But we are always here.')],
        fact: L('Radyo dalgaları ışık hızıyla yol alır. Ay 384.400 km uzakta olduğu için sinyal Dünya\'ya yaklaşık 1,3 saniyede ulaşır.',
                'Radio waves travel at the speed of light. The Moon is 384,400 km away, so a signal reaches Earth in about 1.3 seconds.'), src: 'NASA NSSDCA Moon Fact Sheet' },
      { id: 'atlas', when: () => true, from: 'atlas', title: ATL,
        text: [L('Merhaba {ad}! Ben ATLAS, üssün yardımcı yapay zekâsıyım.', 'Hello, {ad}! I am ATLAS, the base\'s helper AI.'),
               L('Önce elektrik, sonra hava gerekir.', 'First we need power, then air.')],
        hint: L('Bir Güneş Paneli, sonra bir Hava Makinesi kur.', 'Build a Solar Panel, then an Air Maker.') },
      { id: 'oncu', when: s => day(s) >= 2, from: 'mc', who: 'deniz', title: L('Öncü', 'Öncü'),
        text: [L('İki yıl önce Öncü adlı küçük bir gezgin burada sustu.', 'Two years ago a little rover called Öncü fell silent here.'),
               L('Son sinyali size yakın bir yerden geldi.', 'Its last signal came from somewhere near you.')],
        hint: L('Gezerken tarayıcınla sarı sinyalleri ara.', 'As you explore, look for yellow signals with your scanner.') },
      { id: 'izler', when: s => day(s) >= 4, from: 'crew', who: 'arda', title: L('Tekerlek izleri', 'Wheel tracks'),
        text: [L('Kıyıda tekerlek izleri gördüm!', 'I saw wheel tracks on the rim!'),
               L('Burada rüzgâr yok, izler yıllarca kalır.', 'There is no wind here, so tracks last for years.')],
        fact: L('Apollo astronotlarının ayak izleri hâlâ Ay\'da duruyor. Onları silecek rüzgâr ya da yağmur yok.',
                'The Apollo astronauts\' footprints are still on the Moon. There is no wind or rain to wipe them away.') },
      { id: 'alacakaranlik', when: s => day(s) >= 8, from: 'mc', who: 'deniz', title: L('Güneş alçalıyor', 'The Sun is sinking'),
        text: [L('Güneş ufka iniyor. Birkaç gün sonra uzun gece başlar.', 'The Sun is sinking. In a few days the long night begins.'),
               L('Sanırım Öncü de bu gece yüzünden sustu.', 'We think the night is why Öncü fell silent.')],
        hint: L('Batarya kur, gece için elektrik biriktir.', 'Build batteries and save power for the night.'),
        fact: L('Ay\'ın ekseni yalnızca 1,5 derece eğiktir. Bu yüzden kutupta Güneş hep ufka yakın dolaşır ve derin kraterlerin dibine hiç ulaşmaz.',
                'The Moon\'s axis is tilted only 1.5 degrees. So at the pole the Sun always circles close to the horizon and never reaches the bottom of deep craters.') },
      { id: 'gunbatimi', when: s => nightAt(s, 0), from: 'atlas', title: L('Gün battı', 'Sunset'),
        text: [L('Güneş battı. Paneller artık elektrik yapmıyor.', 'The Sun has set. The panels make no power now.'),
               L('Elimizde yalnız bataryadaki elektrik var.', 'All we have is the power in the batteries.')],
        hint: s => (typeof ckPwAdvice === 'function' ? ckPwAdvice(s) : null),
        fact: L('Ay\'da ısıyı tutacak hava yoktur. Bu yüzden Güneş batınca yüzey çok hızlı soğur.',
                'The Moon has no air to hold heat. That is why the surface cools very fast once the Sun goes down.') },
      { id: 'dunya', when: s => nightAt(s, 2), from: 'mc', who: 'deniz', title: L('Gökyüzünde Dünya', 'Earth in the sky'),
        text: [L('Ufkun üstünde Dünya\'yı görüyor musunuz? Biz de size bakıyoruz.', 'Can you see Earth above the horizon? We are looking up at you.'),
               L('Gecenin yarısı geride kaldı.', 'Half the night is behind you.')],
        fact: L('Ay\'ın hep aynı yüzü Dünya\'ya döner. Oradan bakınca Dünya gökyüzünde neredeyse hiç yer değiştirmez; yalnızca evreleri değişir.',
                'The Moon always turns the same face to Earth. Seen from there, Earth hardly moves in the sky; only its phases change.') },
      { id: 'safak', when: s => nightAt(s, WORLDS.ay.night.len), from: 'mc', who: 'deniz', title: L('Günaydın', 'Good morning'),
        text: L('Günaydın Ufuk-1! Öncü bu geceyi atlatamadı. Siz atlattınız!', 'Good morning, Horizon-1! Öncü did not survive this night. You did!'),
        hint: L('Şimdi ekibi büyütmek için yatak kur.', 'Now build beds to grow the crew.') },
      { id: 'sonsinyal', when: s => day(s) >= 17, skip: s => relicDone(s, 2), from: 'atlas', title: L('Son sinyal', 'Last signal'),
        text: [L('Öncü\'nün son sinyali karanlık kraterin yanından geliyor.', 'Öncü\'s last signal comes from near the dark crater.'),
               L('Tarayıcın onu ancak yakından duyar.', 'Your scanner will only hear it up close.')],
        hint: L('Üsten uzağa yürü ve sarı sinyali tara.', 'Walk far from the base and scan the yellow signal.') },
      { id: 'ufuk2', when: s => day(s) >= 22, from: 'mc', who: 'deniz', title: L('Ufuk-2', 'Horizon-2'),
        text: [L('Güzel haber: Ufuk-2 ekibi hazır. Senin üssüne gelecekler.', 'Good news: the Horizon-2 crew is ready. They will come to your base.'),
               L('Üs kendi havasını, suyunu ve yemeğini yaparsa işleri kolaylaşır.', 'If the base makes its own air, water and food, their job is easier.')],
        hint: L('Hava, su ve yemeğin hepsini kendin yapmaya çalış.', 'Try to make all your own air, water and food.'),
        fact: L('NASA\'nın Artemis programı, Ay\'ın güney kutbu yakınında insanların uzun süre kalabileceği bir varlık kurmayı hedefliyor.',
                'NASA\'s Artemis programme aims to set up a long-term human presence near the Moon\'s south pole.') },
      { id: 'veda', when: s => day(s) >= 28, from: 'crew', who: 'ece', title: L('Son günler', 'The last days'),
        text: [L('Son günlerdeyiz.', 'These are our last days.'), L('Pencereden Dünya\'ya bakınca gitmek tuhaf geliyor.', 'Looking at Earth from the window, leaving feels strange.')] },
    ],
    relics: [
      { name: L('Öncü\'nün işaret feneri', 'Öncü\'s beacon'),
        log: L('ÖNCÜ · 3. GÜN\nNötron sayacı gölgeli çukurda hidrojen görüyor.\nBuz olabilir. Kenarından yaklaşıyorum.',
               'ÖNCÜ · DAY 3\nNeutron counter sees hydrogen in the shadowed hollow.\nCould be ice. Approaching along the rim.'),
        fact: L('LCROSS 2009\'da güney kutbundaki Cabeus Krateri\'ne bir roket gövdesi çarptırdı. Yükselen toz bulutunda su buzu ölçüldü.',
                'In 2009 LCROSS crashed a rocket stage into Cabeus Crater near the south pole. Water ice was measured in the cloud of dust it threw up.'), src: 'NASA · LCROSS',
        reward: { reveal: 'ice1' },
        after: { from: 'mc', text: L('Öncü buz arıyormuş! En yakın buz alanını haritana işledik.',
                                     'So Öncü was hunting for ice! We marked the nearest ice patch on your map.') } },
      { name: L('Düşmüş güneş kanadı', 'Fallen solar wing'),
        log: L('ÖNCÜ · 9. GÜN\nPanel çıkışı %12. Batarya ısıtıcıları besleyemiyor.\nKış uykusuna geçiyorum.\nGüneş dönünce uyanacağım.',
               'ÖNCÜ · DAY 9\nPanel output 12%. Battery cannot feed the heaters.\nEntering hibernation.\nWill wake when the Sun returns.'),
        fact: L('Ay gecesinde sıcaklık yaklaşık −173 °C\'ye iner. Güneş enerjili araçlar bu geceyi yalnızca bataryada sakladıkları enerjiyle atlatmak zorundadır.',
                'In the lunar night the temperature drops to about −173 °C. Solar-powered machines must survive it on the energy stored in their batteries alone.'), src: 'NASA · Weather on the Moon',
        reward: { parca: 8, malzeme: 10 },
        after: { from: 'atlas', text: L('Sağlam parçaları aldık: +8 yedek parça, +10 malzeme. Gece için elektrik biriktir.',
                                        'We took the good parts: +8 spare parts, +10 material. Save power for the night.') } },
      { name: L('Öncü', 'Öncü'),
        log: L('ÖNCÜ · SON KAYIT\nGölgede buz doğrulandı.\nAnten donuyor.\nBiri gelirse: buz burada.',
               'ÖNCÜ · LAST ENTRY\nIce confirmed in the shadow.\nAntenna freezing.\nIf someone comes: the ice is here.'),
        fact: L('LRO\'nun Diviner aracı, kalıcı gölgedeki bazı kraterlerde −240 °C\'nin altında, −246 °C\'ye kadar sıcaklıklar ölçtü. Buralar Güneş Sistemi\'nin bilinen en soğuk yerlerindendir.',
                'LRO\'s Diviner instrument measured temperatures below −240 °C, down to −246 °C, in some permanently shadowed craters, among the coldest known places in the Solar System.'), src: 'NASA · LRO Diviner',
        reward: { bilim: 15, reveal: 'iceAll' },
        after: { from: 'mc', text: L('Öncü\'nün bütün buz alanlarını haritana ekledik. Onun görevini sen bitirdin, Ufuk-1.',
                                     'We added all of Öncü\'s ice patches to your map. You finished its mission, Horizon-1.') } },
    ],
    epilogue: {
      win: L('Ufuk-1 görevini tamamladı. Shackleton\'ın kıyısında ışıklar yanıyor, buz suya dönüşüyor. Öncü\'nün aradığı buz artık bir üssü yaşatıyor. Ufuk-2 ekibi, senin bıraktığın yerden devam edecek.',
             'Horizon-1 has completed its mission. Lights are burning on Shackleton\'s rim and ice is turning into water. The ice Öncü was looking for now keeps a base alive. The Horizon-2 crew will carry on from where you left off.'),
      lose: L('Ekip güvenle Dünya\'ya geri gönderildi ve üs sessizliğe gömüldü. Ama kayıtların Dünya\'ya ulaştı: neyin işe yaradığını artık biliyoruz. Ufuk-2, senin verinle daha hazırlıklı gelecek.',
              'The crew was sent safely back to Earth and the base fell silent. But your logs reached Earth: now we know what worked. Horizon-2 will arrive better prepared, thanks to your data.'),
      isyan: L('Kapsül Dünya\'ya doğru süzülüyor; kurabiyeler hâlâ sıcak. Gerçekte de uzun görevlerde ekibin iyi olması, oksijen kadar önemlidir.',
               'The capsule glides towards Earth; the cookies are still warm. On real long missions, too, a happy crew matters as much as oxygen.'),
    },
  };

  const mars = {
    title: L('Sessiz Sollar', 'The Silent Sols'),
    chapters: [
      { id: 'varis', name: L('Yedi Ay Sonra', 'Seven Months Later'), sub: L('Arcadia Planitia · 1. sol (sol = Mars günü)', 'Arcadia Planitia · Sol 1 (sol = a Mars day)'), when: () => true,
        goal: L('Bu bölümde: elektrik, hava ve su makinelerini kur.', 'In this chapter: build power, air and water machines.') },
      { id: 'toz', name: L('Toz', 'Dust'), sub: L('Ufukta kızıl bir duvar', 'A red wall on the horizon'), when: s => s.stormWarned || s.stat.storms > 0 || day(s) >= 12,
        goal: L('Bu bölümde: fırtına için batarya kur, elektrik biriktir.', 'In this chapter: build batteries and save power for the storm.') },
      { id: 'sessiz', name: L('Sessiz Sollar', 'The Silent Sols'), sub: L('Güneş, Dünya ile aramızda', 'The Sun stands between us and Earth'), when: s => day(s) >= WORLDS.mars.conj.from,
        goal: L('Bu bölümde: Dünya\'dan yardım yok, kararları sen ver.', 'In this chapter: no help from Earth; you decide.') },
      { id: 'temas', name: L('Yeniden Temas', 'Contact Again'), sub: L('Dünya\'dan ilk ses', 'The first voice from Earth'), when: s => day(s) >= WORLDS.mars.conj.from + WORLDS.mars.conj.len,
        goal: L('Bu bölümde: ekibi büyüt ve yeni yataklar kur.', 'In this chapter: grow the crew and add beds.') },
      { id: 'bekleyis', name: L('Ufuk-2\'yi Beklerken', 'Waiting for Horizon-2'), sub: L('Yedi ay uzakta bir ekip', 'A crew seven months away'), when: s => day(s) >= 32,
        goal: L('Bu bölümde: hava, su ve yemeğin hepsini kendin yap.', 'In this chapter: make all your own air, water and food.') },
    ],
    beats: [
      { id: 'selam', when: () => true, from: 'mc', who: 'deniz', title: L('11 dakika önce', '11 minutes ago'),
        text: [L('Ufuk-1, ben Deniz. Bu mesajı 11 dakika önce gönderdim.', 'Horizon-1, this is Deniz. I sent this message 11 minutes ago.'),
               L('Mars\'la canlı konuşamayız. Kararlar artık sizin.', 'We cannot talk live with Mars. The decisions are yours now.')],
        fact: L('Mars\'taki gezginler komutlarını her gün bir paket hâlinde alır ve günü kendi başlarına yürütür. Sinyal yaklaşık 3 ila 22 dakikada ulaşır.',
                'Rovers on Mars get their commands as one package each day and carry out the day on their own. A signal takes about 3 to 22 minutes to arrive.'), src: 'NASA NSSDCA Mars Fact Sheet' },
      { id: 'atlas', when: () => true, from: 'atlas', title: ATL,
        text: [L('Merhaba {ad}! Ben ATLAS, üssün yardımcı yapay zekâsıyım.', 'Hello, {ad}! I am ATLAS, the base\'s helper AI.'),
               L('Yolculuk bitti. Önce elektrik, sonra hava gerekir.', 'The journey is over. First power, then air.')],
        hint: L('Bir Güneş Paneli, sonra bir Hava Makinesi kur.', 'Build a Solar Panel, then an Air Maker.') },
      { id: 'kervan', when: s => day(s) >= 2, from: 'mc', who: 'deniz', title: L('Kervan-2', 'Kervan-2'),
        text: [L('Önden yolladığımız kargo aracı Kervan-2 sert indi.', 'Kervan-2, the cargo lander we sent ahead, landed hard.'),
               L('Parçaları ovaya dağıldı. Enkazda işe yarar şeyler olabilir.', 'Its pieces are scattered. The wreck may hold useful things.')],
        hint: L('Gezerken tarayıcınla sarı sinyalleri ara.', 'As you explore, look for yellow signals with your scanner.') },
      { id: 'tozbulutu', when: s => s.stormWarned || s.stat.storms > 0 || day(s) >= 12, from: 'atlas', title: L('Ufukta toz', 'Dust on the horizon'),
        text: [L('Ufukta kızıl bir duvar var: toz fırtınası.', 'There is a red wall on the horizon: a dust storm.'),
               L('Opportunity gezgini böyle bir fırtınada sustu.', 'The Opportunity rover fell silent in a storm like this.')],
        hint: L('Bataryaları doldur, gerekirse batarya ekle.', 'Fill your batteries, and add more if you can.'),
        fact: L('Opportunity yalnızca 90 sol çalışmak için tasarlanmıştı ama 15 yıl dayandı. 2018\'de gezegeni saran bir toz fırtınasında sustu.',
                'Opportunity was built to work for just 90 sols but lasted 15 years. It fell silent in 2018 during a dust storm that wrapped the whole planet.') },
      { id: 'kavusum', when: s => day(s) >= WORLDS.mars.conj.from - 2, from: 'mc', who: 'deniz', title: L('Güneş araya giriyor', 'The Sun gets in the way'),
        text: [L('Önemli: 16. solda Güneş, Mars ile Dünya\'nın arasına giriyor.', 'Important: on sol 16 the Sun moves between Mars and Earth.'),
               L('8 sol boyunca size ulaşamayacağız.', 'For 8 sols we will not be able to reach you.')],
        hint: L('Stok yap: hava, su ve yemek yetsin.', 'Stock up so air, water and food last.'),
        fact: L('Bu olaya güneş kavuşumu denir ve yaklaşık 26 ayda bir yaşanır. Güneş sinyali bozabileceği için NASA bu sürede Mars\'a komut göndermez.',
                'This is called solar conjunction and happens about every 26 months. Because the Sun can scramble signals, NASA sends no commands to Mars during it.'), src: 'NASA · Mars solar conjunction' },
      { id: 'sessizlik', when: s => day(s) >= WORLDS.mars.conj.from, from: 'atlas', title: L('Sessizlik', 'Silence'),
        text: [L('Dünya ile bağlantı kesildi. Güneş tam aramızda.', 'Contact with Earth is lost. The Sun is right between us.'),
               L('Bizi kimse duymuyor. Ama ben buradayım, {ad}.', 'Nobody can hear us. But I am here, {ad}.')] },
      { id: 'nobet', when: s => day(s) >= WORLDS.mars.conj.from + 3, from: 'crew', who: 'nil', title: L('Gece nöbeti', 'Night watch'),
        text: [L('Bu gece gökyüzüne baktık. Dünya, Güneş\'in arkasında kaldı.', 'We looked at the sky tonight. Earth is hidden behind the Sun.'),
               L('Ama birbirimiz varız.', 'But we have each other.')] },
      { id: 'temas', when: s => day(s) >= WORLDS.mars.conj.from + WORLDS.mars.conj.len, from: 'mc', who: 'deniz', title: L('Yeniden temas', 'Contact again'),
        text: [L('Ufuk-1, beni duyuyor musunuz?', 'Horizon-1, do you read me?'),
               L('8 sol boyunca kararları tek başınıza verdiniz. Mars\'ta yaşamak budur.', 'For 8 sols you decided alone. That is what living on Mars means.')] },
      { id: 'govde', when: s => day(s) >= 27, skip: s => relicDone(s, 2), from: 'atlas', title: L('Kayıp gövde', 'The missing hull'),
        text: [L('Kervan-2\'nin ana gövdesi hâlâ kayıp.', 'Kervan-2\'s main hull is still missing.'),
               L('Üsten uzakta olmalı. Tarayıcın onu ancak yakından duyar.', 'It must be far away. Your scanner only hears it up close.')],
        hint: L('Üsten uzağa yürü ve sarı sinyali tara.', 'Walk far from the base and scan the yellow signal.') },
      { id: 'ufuk2', when: s => day(s) >= 32, from: 'mc', who: 'deniz', title: L('Ufuk-2', 'Horizon-2'),
        text: [L('Ufuk-2 ekibi yola çıkmaya hazır. Yolculuk yedi ay sürecek.', 'The Horizon-2 crew is ready to leave. The trip takes seven months.'),
               L('Geldiklerinde üs kendi ayakları üzerinde durmalı.', 'When they arrive, the base must stand on its own feet.')],
        hint: L('Hava, su ve yemeğin hepsini kendin yapmaya çalış.', 'Try to make all your own air, water and food.'),
        fact: L('Dünya ile Mars en uygun hizaya ancak 26 ayda bir gelir. Mars görevleri bu fırlatma pencerelerine göre planlanır.',
                'Earth and Mars only line up well once every 26 months. Mars missions are planned around these launch windows.'), src: 'NASA · Mars launch windows' },
      { id: 'veda', when: s => day(s) >= 38, from: 'crew', who: 'kerem', title: L('Son sollar', 'The last sols'),
        text: [L('Kırk sol önce burası boş bir ovaydı.', 'Forty sols ago this was an empty plain.'), L('Şimdi pencereden ışıklar görüyoruz.', 'Now we see lights from the window.')] },
    ],
    relics: [
      { name: L('Kervan-2 kargo sandığı', 'Kervan-2 cargo crate'),
        log: L('KERVAN-2 · İNİŞ KAYDI\nParaşüt açıldı, hız yeterince düşmedi.\nRetro roketler 2 saniye geç ateşlendi.\nTemas sert. Yük dağıldı.',
               'KERVAN-2 · LANDING LOG\nParachute open, speed did not drop enough.\nRetro-rockets fired 2 seconds late.\nHard touchdown. Cargo scattered.'),
        fact: L('Mars\'a inişe "yedi dakikalık dehşet" denir. Hava, ısı kalkanını kızdıracak kadar kalın ama paraşütün tek başına frenlemesine yetmeyecek kadar incedir. Son metrelerde roketler gerekir.',
                'Landing on Mars is called "seven minutes of terror". The air is thick enough to make the heat shield glow, but too thin for a parachute to brake alone. Rockets are needed for the last stretch.'),
        reward: { malzeme: 25, parca: 8 },
        after: { from: 'atlas', text: L('Sandıktan sağlam ne varsa aldık: +25 malzeme, +8 yedek parça.',
                                        'We took everything intact from the crate: +25 material, +8 spare parts.') } },
      { name: L('Kervan-2 hava direği', 'Kervan-2 weather mast'),
        log: L('KERVAN-2 · HAVA DİREĞİ\nSol 12: toz artıyor.\nSol 41: panel çıkışı %18.\nSol 67: son paket gönderildi.',
               'KERVAN-2 · WEATHER MAST\nSol 12: dust rising.\nSol 41: panel output 18%.\nSol 67: last packet sent.'),
        fact: L('InSight iniş aracı dört yıl boyunca 1300\'den fazla Mars depremi kaydetti. Panelleri tozla kaplanınca enerjisi tükendi ve 2022\'de sustu.',
                'The InSight lander recorded more than 1,300 marsquakes over four years. When dust covered its panels it ran out of power and fell silent in 2022.'), src: 'NASA/JPL · InSight',
        reward: { bilim: 10 },
        after: { from: 'mc', text: L('Direğin kaydında 67 sollük toz verisi var. Fırtınaları artık daha iyi bileceğiz.',
                                     'The mast holds 67 sols of dust data. We will predict storms better now.') } },
      { name: L('Kervan-2 ana gövdesi', 'Kervan-2 main hull'),
        log: L('KERVAN-2 · KARGO LİSTESİ\n1. Sabatier yakıt deneyi: hasarlı\n2. Hidrojen tankı: boş\nNot: Dönüş yakıtı Mars\'ta üretilecek.',
               'KERVAN-2 · CARGO MANIFEST\n1. Sabatier fuel experiment: damaged\n2. Hydrogen tank: empty\nNote: return fuel to be made on Mars.'),
        fact: L('Dönüş yolculuğunun yakıtını Dünya\'dan taşımak çok ağırdır. Plan, Sabatier tepkimesiyle Mars havasındaki karbondioksitten metan yakıtı üretmektir.',
                'Carrying the fuel for the trip home from Earth is far too heavy. The plan is to make methane fuel from the carbon dioxide in Martian air with the Sabatier reaction.'),
        reward: { bilim: 15, parca: 10 },
        after: { from: 'mc', text: L('Bu yakıt verisi Ufuk-2 için çok değerli. Sağlam parçalar senin: +10 yedek parça.',
                                     'This fuel data is precious for Horizon-2. The intact parts are yours: +10 spare parts.') } },
    ],
    epilogue: {
      win: L('Kırk sol geçti. Ufuk-1 kendi havasını, suyunu ve yemeğini üreten bir üs kurdu ve sessiz sollarda bile ayakta kaldı. Yedi ay sonra Ufuk-2 indiğinde ışıklar onları bekliyor olacak.',
             'Forty sols have passed. Horizon-1 built a base that makes its own air, water and food, and it held on even through the silent sols. When Horizon-2 lands seven months from now, the lights will be waiting.'),
      lose: L('Ekip güvenle Dünya\'ya geri gönderildi. Arcadia ovasında boş modüller ve Kervan-2\'nin enkazı yan yana duruyor. Ama her kayıt Dünya\'ya ulaştı: Ufuk-2, senin öğrendiklerinle gelecek.',
              'The crew was sent safely back to Earth. Empty modules stand beside the wreck of Kervan-2 on the Arcadia plain. But every log reached Earth: Horizon-2 will come with what you learned.'),
      isyan: L('Kapsül Dünya\'ya doğru yola çıktı; kurabiye kutusu kucağında. Gerçekte de uzun görevlerde ekibin iyi olması, oksijen kadar önemlidir.',
               'The capsule is on its way to Earth, cookie tin on your lap. On real long missions, too, a happy crew matters as much as oxygen.'),
    },
  };
  for (const w of [ay, mars]) {
    w.relics.forEach(r => { r.after.title = r.name; });
    w.react = react;
  }
  return { ay, mars, cast, crew: CREW, crewColors };
})();
