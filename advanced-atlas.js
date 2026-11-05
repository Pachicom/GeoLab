(() => {
  const countryData = Array.isArray(window.geoCountries) ? window.geoCountries : [];
  const countryGrid = document.querySelector("#country-grid");
  const countryDetail = document.querySelector("#country-detail");
  const countryRegions = document.querySelector("#country-region");
  const countryCount = document.querySelector("#country-count");
  const numberFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const formatNumber = value => Number.isFinite(Number(value)) && Number(value) > 0
    ? numberFormat.format(Number(value))
    : "нет данных";
  const countryByCode = new Map(countryData.map(country => [country.code, country]));

  function showCountry(country) {
    countryDetail.dataset.code = country.code;
    const neighbors = country.borders.map(code => countryByCode.get(code)?.name || code);
    const coordinates = country.latlng.length === 2
      ? `${country.latlng[0].toFixed(2)}°, ${country.latlng[1].toFixed(2)}°`
      : "нет координат";
    countryDetail.innerHTML = `
      <div class="eyebrow">СПРАВКА О СТРАНЕ</div>
      <div class="country-flag">${escapeHTML(country.flag)}</div>
      <h2>${escapeHTML(country.name)}</h2>
      <p class="country-official">${escapeHTML(country.official)}</p>
      <div class="country-facts">
        <div><small>Столица</small><b>${escapeHTML(country.capital)}</b></div>
        <div><small>Часть света</small><b>${escapeHTML(country.region)} · ${escapeHTML(country.subregion)}</b></div>
        <div><small>Площадь</small><b>${formatNumber(country.area)} км²</b></div>
        <div><small>Население</small><b>${country.population ? `${formatNumber(country.population)} (${country.populationYear})` : "нет наблюдения за 2023 год"}</b></div>
        <div><small>Языки</small><b>${escapeHTML(country.languages)}</b></div>
        <div><small>Валюта</small><b>${escapeHTML(country.currency)}</b></div>
        <div><small>Координаты центра</small><b>${coordinates}</b></div>
        <div><small>Выход к морю</small><b>${country.landlocked ? "Нет, внутриконтинентальная страна" : "Есть побережье"}</b></div>
        <div class="country-neighbors"><small>Соседние государства</small><b>${neighbors.length ? neighbors.map(escapeHTML).join(", ") : "Сухопутных границ нет"}</b></div>
      </div>
      <a class="secondary-btn country-map-link" href="#atlas" data-page="atlas">Перейти к карте ↗</a>`;
    document.querySelector(".country-map-link").addEventListener("click", () => {
      const input = document.querySelector("#atlas-country-search");
      const searchButton = document.querySelector("#atlas-search-btn");
      if (input) input.value = country.name;
      if (searchButton) window.setTimeout(() => searchButton.click(), 0);
    });
    document.querySelectorAll(".country-card").forEach(card => {
      card.classList.toggle("selected", card.dataset.code === country.code);
    });
  }

  function renderCountries() {
    if (!countryGrid) return;
    const query = document.querySelector("#country-search").value.trim().toLocaleLowerCase("ru");
    const region = countryRegions.value;
    const membersOnly = document.querySelector("#country-members").checked;
    const sort = document.querySelector("#country-sort").value;
    const filtered = countryData.filter(country => {
      const matchesQuery = !query || [
        country.name, country.official, country.capital, country.code, country.subregion,
        country.languages, country.currency
      ].join(" ").toLocaleLowerCase("ru").includes(query);
      return matchesQuery && (!region || country.region === region) && (!membersOnly || country.unMember);
    });
    filtered.sort((a, b) => {
      if (sort === "area" || sort === "population") {
        return (Number(b[sort]) || 0) - (Number(a[sort]) || 0);
      }
      return a.name.localeCompare(b.name, "ru");
    });
    countryCount.textContent = `Показано ${numberFormat.format(filtered.length)} из ${numberFormat.format(countryData.length)} стран и территорий`;
    countryGrid.innerHTML = filtered.length ? filtered.map(country => `
      <button class="country-card${countryDetail.dataset.code === country.code ? " selected" : ""}" type="button" data-code="${escapeHTML(country.code)}">
        <span class="country-card-flag">${escapeHTML(country.flag)}</span>
        <span class="country-card-name">${escapeHTML(country.name)}</span>
        <span class="country-card-meta">${escapeHTML(country.region)} · ${escapeHTML(country.capital)}</span>
        <span class="country-card-meta">${formatNumber(country.area)} км²</span>
      </button>`).join("") : '<div class="panel country-empty">Ничего не найдено. Измени запрос или фильтр.</div>';
    countryGrid.querySelectorAll(".country-card").forEach(card => {
      card.addEventListener("click", () => {
        const selected = countryByCode.get(card.dataset.code);
        if (selected) showCountry(selected);
      });
    });
  }

  if (countryGrid && countryRegions && countryData.length) {
    [...new Set(countryData.map(country => country.region))].sort((a, b) => a.localeCompare(b, "ru"))
      .forEach(region => countryRegions.add(new Option(region, region)));
    ["#country-search", "#country-region", "#country-sort", "#country-members"].forEach(selector => {
      document.querySelector(selector).addEventListener("input", renderCountries);
      document.querySelector(selector).addEventListener("change", renderCountries);
    });
    renderCountries();
    showCountry(countryByCode.get("KAZ") || countryData[0]);
  } else if (countryCount) {
    countryCount.textContent = "Не удалось загрузить локальную базу стран. Проверьте countries-data.js.";
  }

  const regionProfiles = {
    continents: [
      { id:"Евразия", icon:"🌏", area:54.8, position:"Самый крупный материк, объединяющий Европу и Азию; омывается четырьмя океанами.", coast:"Береговая линия особенно расчленена на западе и востоке; крупные полуострова — Скандинавский, Аравийский, Индостан, Индокитай и Камчатка.", relief:"Соседствуют крупнейшие равнины мира и высокие горные пояса. Высшая вершина — Эверест (8849 м).", mountains:"Гималаи, Каракорум, Тянь-Шань, Памир, Альпы, Кавказ.", waters:"Обь, Енисей, Лена, Янцзы, Хуанхэ, Ганг, Инд, Волга; Байкал и Каспийское море.", climate:"От арктического и умеренного до тропического и экваториального; велика роль муссонов и континентальности.", nature:"Арктические пустыни, тундра, тайга, степи, пустыни, субтропические и влажные тропические леса.", people:"Здесь живёт большая часть населения планеты; расположены крупнейшие города и древние центры цивилизаций.", resources:"Нефть, газ, уголь, железные и цветные руды, лесные и водные ресурсы.", issues:"Загрязнение воздуха в агломерациях, дефицит воды, деградация земель, сокращение биоразнообразия.", fact:"В Евразии находятся и самая высокая вершина суши, и крупнейшее по площади озеро — Каспий." },
      { id:"Африка", icon:"🌍", area:30.3, position:"Пересекается экватором и обоими тропиками; омывается Атлантическим и Индийским океанами.", coast:"Береговая линия сравнительно слабо изрезана; крупные заливы — Гвинейский и Аденский.", relief:"Преобладают плато и плоскогорья; на востоке проходит система Восточно-Африканских разломов.", mountains:"Атлас, Драконовы горы, Эфиопское нагорье; вулкан Килиманджаро.", waters:"Нил, Конго, Нигер, Замбези; озёра Виктория, Танганьика и Малави.", climate:"Экваториальный, субэкваториальные, тропические и субтропические пояса; выражена симметрия относительно экватора.", nature:"Влажные леса, саванны, тропические редколесья, пустыни Сахара, Намиб и Калахари.", people:"Население быстро растёт и отличается большим языковым и культурным разнообразием.", resources:"Нефть, газ, фосфориты, золото, алмазы, медь, кобальт и солнечная энергия.", issues:"Опустынивание, водный стресс, потеря лесов и местообитаний, уязвимость к засухам.", fact:"Сахара — крупнейшая жаркая пустыня Земли, а бассейн Конго — один из главных массивов влажных тропических лесов." },
      { id:"Северная Америка", icon:"🌎", area:24.7, position:"Расположена преимущественно в Северном и Западном полушариях; от Арктики до тропиков.", coast:"Берега омывают Северный Ледовитый, Атлантический и Тихий океаны; много заливов и островов.", relief:"Кордильеры тянутся на западе, Аппалачи — на востоке; между ними лежат Великие и Центральные равнины.", mountains:"Скалистые горы, Аляскинский хребет, Аппалачи, Сьерра-Мадре.", waters:"Миссисипи—Миссури, Маккензи, Святого Лаврентия; Великие озёра.", climate:"От арктического до тропического; открытые с севера равнины способствуют вторжениям холодных и тёплых воздушных масс.", nature:"Тундра, тайга, смешанные леса, прерии, пустыни и тропические леса.", people:"Высокая урбанизация, крупные мегаполисы и разнообразный этнический состав.", resources:"Нефть, газ, уголь, уран, цветные металлы, плодородные земли и гидроэнергия.", issues:"Ураганы, лесные пожары, засухи, загрязнение вод и трансформация природных ландшафтов.", fact:"Великие озёра — крупнейшая система пресных озёр по площади." },
      { id:"Южная Америка", icon:"🌎", area:17.8, position:"От экваториальных широт до субантарктических; омывается Атлантическим и Тихим океанами.", coast:"Западное побережье вытянуто вдоль Анд; на юге много островов, проливов и фьордов.", relief:"Анды на западе, Амазонская низменность в центре и Бразильское и Гвианское плоскогорья на востоке.", mountains:"Анды — крупнейшая по протяжённости континентальная горная система.", waters:"Амазонка, Ориноко, Парана; озёра Титикака и Маракайбо.", climate:"Преобладают экваториальные и тропические условия; на климат влияют Анды, пассаты и океанические течения.", nature:"Амазонские леса, саванны, степи Пампы, высокогорные пояса Анд и пустыня Атакама.", people:"Большинство населения живёт в городах и прибрежных районах; важны коренные культуры.", resources:"Медь, железные руды, литий, нефть, лесные, водные и сельскохозяйственные ресурсы.", issues:"Вырубка лесов, пожары, добыча ресурсов в уязвимых экосистемах, деградация почв.", fact:"Амазонка — самая полноводная река мира; её бассейн занимает огромную часть материка." },
      { id:"Австралия", icon:"🦘", area:7.7, position:"Самый малый материк; лежит в Южном и Восточном полушариях.", coast:"Берега омывают Индийский и Тихий океаны; на северо-востоке расположен Большой Барьерный риф.", relief:"Западное плоскогорье, Центральная низменность и Большой Водораздельный хребет на востоке.", mountains:"Большой Водораздельный хребет и Австралийские Альпы.", waters:"Муррей и Дарлинг; озеро Эйр — солёное озеро, площадь которого сильно меняется.", climate:"Большая часть территории засушлива; север имеет тропический муссонный режим, юг — субтропический и умеренный.", nature:"Пустыни и полупустыни, саванны, эвкалиптовые леса и кустарниковые сообщества.", people:"Население сосредоточено главным образом на восточном и юго-восточном побережьях.", resources:"Железная руда, уголь, бокситы, золото, уран и пастбищные земли.", issues:"Засухи, пожары, инвазивные виды, нагрузка на рифовые экосистемы и дефицит пресной воды.", fact:"Австралия — одновременно материк и государство; многие местные виды являются эндемиками." },
      { id:"Антарктида", icon:"❄️", area:14.0, position:"Окружает Южный полюс и почти полностью лежит южнее Южного полярного круга.", coast:"Береговая линия включает крупные шельфовые ледники и моря Южного океана.", relief:"Материк покрывает мощный ледниковый щит; подо льдом есть горы, впадины и озёра.", mountains:"Трансантарктические горы и горы Элсуэрт; высочайшая вершина — массив Винсон.", waters:"Ледниковый покров хранит основную долю мировых запасов пресной воды в твёрдом состоянии.", climate:"Самый холодный, сухой и ветреный материк; фиксируются экстремально низкие температуры.", nature:"Жизнь особенно богата в прибрежных водах: криль, пингвины, тюлени и морские птицы.", people:"Постоянного коренного населения нет; работают научные станции разных стран.", resources:"Главная ценность — научные данные, ледяной архив климата и морские экосистемы; добыча ресурсов ограничена международным договором.", issues:"Потепление и потеря льда в отдельных районах, влияние человека на хрупкие экосистемы.", fact:"Антарктический договор закрепляет использование материка в мирных и научных целях." },
      { id:"Океания", icon:"🏝️", area:8.5, position:"Островной регион центральной и юго-западной части Тихого океана; включает Меланезию, Микронезию и Полинезию.", coast:"Состоит из тысяч островов вулканического и кораллового происхождения.", relief:"Сочетает высокие вулканические острова, атоллы и подводные вулканические хребты.", mountains:"Горные хребты Новой Гвинеи и вулканические вершины островов Меланезии.", waters:"Коралловые рифы, лагуны и небольшие островные реки; вокруг региона лежат моря Тихого океана.", climate:"От экваториального до субтропического; характерны пассаты, циклоны и сильная океаническая зависимость.", nature:"Коралловые рифы, мангры, влажные тропические леса и уникальные островные виды.", people:"Малые островные государства и территории, многие сообщества зависят от прибрежных ресурсов.", resources:"Рыбные ресурсы, туризм, геотермальная энергия и отдельные месторождения полезных ископаемых.", issues:"Подъём уровня моря, циклоны, обесцвечивание кораллов, пресноводный стресс и удалённость рынков.", fact:"Многие низкие атоллы находятся всего на несколько метров выше уровня моря." }
    ],
    oceans: [
      { id:"Тихий океан", icon:"🌊", area:165.2, position:"Между Азией и Австралией на западе и Северной и Южной Америкой на востоке; крупнейший океан Земли.", depth:"Средняя глубина около 4 000 м; максимальная — около 10 900 м в Марианском жёлобе.", seas:"Берингово, Охотское, Японское, Южно-Китайское, Коралловое и Тасманово моря.", straits:"Берингов, Малаккский, Торресов и пролив Дрейка.", islands:"Японские, Филиппинские, Гавайские острова, Новая Гвинея, Новая Зеландия и многочисленные архипелаги.", currents:"Куросио, Оясио, Северное и Южное Пассатные, Перуанское течение.", climate:"От полярных широт до экватора; тропическая часть подвержена тайфунам и явлениям Эль-Ниньо/Ла-Нинья.", resources:"Рыбные ресурсы, морские перевозки, шельфовые ресурсы; освоение должно учитывать экологические ограничения.", issues:"Пластиковое загрязнение, перегрузка рыболовством, потепление и уязвимость коралловых рифов.", fact:"В Тихом океане находится крупнейшая океаническая впадина — Марианская." },
      { id:"Атлантический океан", icon:"🌊", area:106.5, position:"Между Америками на западе и Европой и Африкой на востоке; соединяет полярные и тропические широты.", depth:"Средняя глубина около 3 600 м; максимальная — около 8 400 м в желобе Пуэрто-Рико.", seas:"Карибское, Средиземное, Северное, Норвежское и Балтийское моря.", straits:"Гибралтарский, Ла-Манш, Флоридский и Датские проливы.", islands:"Гренландия, Исландия, Британские острова, Азорские, Канарские и Карибские острова.", currents:"Гольфстрим и его продолжение, Северо-Атлантическое, Канарское и Бразильское течения.", climate:"Важен для переноса тепла; над тропической Атлантикой формируются ураганы.", resources:"Интенсивное судоходство, рыболовство и освоение отдельных шельфовых месторождений.", issues:"Пластик, загрязнение побережий, промысловая нагрузка, закисление и изменение морских экосистем.", fact:"Срединно-Атлантический хребет проходит через большую часть океана." },
      { id:"Индийский океан", icon:"🌊", area:70.6, position:"Между Африкой, Азией, Австралией и Южным океаном; значительная часть лежит в Южном полушарии.", depth:"Средняя глубина около 3 700 м; максимальная — около 7 300 м в Яванском желобе.", seas:"Аравийское, Красное, Андаманское и Тиморское моря.", straits:"Ормузский, Баб-эль-Мандебский, Малаккский и Мозамбикский проливы.", islands:"Мадагаскар, Шри-Ланка, Мальдивские, Сейшельские и Маскаренские острова.", currents:"Сомалийское, Мозамбикское, Агульяс и сезонные муссонные течения.", climate:"Муссоны меняют направления ветров и течений; север океана особенно чувствителен к сезонности.", resources:"Морские пути, рыболовство и отдельные нефтегазовые районы шельфа.", issues:"Потепление вод, коралловое обесцвечивание, муссонные экстремумы и загрязнение пластиком.", fact:"Индийский океан — самый тёплый из крупных океанов по средней температуре поверхности." },
      { id:"Северный Ледовитый океан", icon:"🧊", area:14.1, position:"Окружает Северный полюс и омывает северные берега Евразии и Северной Америки.", depth:"Средняя глубина около 1 200 м; максимальная — свыше 5 500 м в районе котловины Моллой.", seas:"Баренцево, Карское, Лаптевых, Восточно-Сибирское, Чукотское и море Бофорта.", straits:"Берингов пролив и проливы Канадского Арктического архипелага.", islands:"Гренландия, Канадский Арктический архипелаг, Новая Земля, Шпицберген и остров Врангеля.", currents:"Трансарктическое течение и круговорот Бофорта; важен приток вод Атлантики.", climate:"Полярный климат, сезонный морской лёд, полярный день и ночь.", resources:"Рыбные ресурсы, судоходные маршруты и потенциальные шельфовые ресурсы при строгом экологическом контроле.", issues:"Быстрое сокращение морского льда, уязвимость пищевых цепей, загрязнение и риски судоходства.", fact:"Площадь морского льда меняется по сезонам и сокращается в долгосрочной перспективе." },
      { id:"Южный океан", icon:"🌊", area:20.3, position:"Окружает Антарктиду; его северную границу в учебной географии обычно проводят около 60° ю. ш.", depth:"Средняя глубина около 3 200 м; глубокие участки превышают 7 000 м.", seas:"Уэдделла, Росса, Амундсена и Беллинсгаузена.", straits:"Пролив Дрейка и широкие проходы между южными океаническими бассейнами.", islands:"Южные Шетландские, Южные Оркнейские, Южная Георгия и остров Буве.", currents:"Антарктическое циркумполярное течение — мощный непрерывный поток вокруг Антарктиды.", climate:"Холодные воды, сильные западные ветры, штормы и сезонный морской лёд.", resources:"Ключевая роль в глобальном поглощении тепла и углерода; промысел криля регулируется международными соглашениями.", issues:"Потеря морского льда, изменение экосистем, влияние промысла и накопление загрязнителей.", fact:"Антарктическое циркумполярное течение связывает воды Атлантического, Индийского и Тихого океанов." }
    ]
  };

  let activeGuide = "continents";
  let activeRegion = regionProfiles.continents[0];
  const guideList = document.querySelector("#guide-list");
  const guideDetail = document.querySelector("#guide-detail");

  function renderGuideList() {
    const regions = regionProfiles[activeGuide];
    if (!regions.includes(activeRegion)) activeRegion = regions[0];
    guideList.innerHTML = regions.map(region => `
      <button type="button" class="guide-item${region.id === activeRegion.id ? " active" : ""}" data-region="${escapeHTML(region.id)}">
        <span>${region.icon}</span><b>${escapeHTML(region.id)}</b><small>${formatNumber(region.area)} млн км²</small>
      </button>`).join("");
    guideList.querySelectorAll(".guide-item").forEach(button => button.addEventListener("click", () => {
      activeRegion = regions.find(region => region.id === button.dataset.region);
      renderGuideList();
      renderGuideDetail();
      addXP(1, `guide-${activeGuide}-${activeRegion.id}`);
    }));
    renderGuideDetail();
  }

  function renderGuideDetail() {
    const r = activeRegion;
    const fields = activeGuide === "continents"
      ? [
          ["Географическое положение", r.position], ["Береговая линия", r.coast], ["Рельеф", r.relief],
          ["Горные системы", r.mountains], ["Реки и озёра", r.waters], ["Климатические пояса", r.climate],
          ["Природные зоны и живой мир", r.nature], ["Население", r.people], ["Ресурсы", r.resources],
          ["Экологические проблемы", r.issues], ["Географический факт", r.fact]
        ]
      : [
          ["Географическое положение", r.position], ["Глубины", r.depth], ["Моря", r.seas],
          ["Проливы", r.straits], ["Острова", r.islands], ["Течения", r.currents],
          ["Климат", r.climate], ["Ресурсы", r.resources], ["Экологические проблемы", r.issues],
          ["Географический факт", r.fact]
        ];
    guideDetail.innerHTML = `
      <div class="eyebrow">${activeGuide === "continents" ? "МАТЕРИК И РЕГИОН" : "МИРОВОЙ ОКЕАН"}</div>
      <div class="guide-hero-icon">${r.icon}</div><h2>${escapeHTML(r.id)}</h2>
      <div class="guide-area"><b>${formatNumber(r.area)} млн км²</b><span>приблизительная площадь</span></div>
      <div class="guide-facts">${fields.map(([title, text]) => `<section><h3>${escapeHTML(title)}</h3><p>${escapeHTML(text)}</p></section>`).join("")}</div>`;
  }

  document.querySelectorAll(".guide-tab").forEach(tab => tab.addEventListener("click", () => {
    activeGuide = tab.dataset.guide;
    document.querySelectorAll(".guide-tab").forEach(button => {
      const selected = button === tab;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    renderGuideList();
  }));
  renderGuideList();

  const compareA = document.querySelector("#compare-a");
  const compareB = document.querySelector("#compare-b");
  const compareSet = [...regionProfiles.continents, ...regionProfiles.oceans];
  compareSet.forEach(region => {
    compareA.add(new Option(region.id, `${regionProfiles.continents.includes(region) ? "continents" : "oceans"}:${region.id}`));
    compareB.add(new Option(region.id, `${regionProfiles.continents.includes(region) ? "continents" : "oceans"}:${region.id}`));
  });
  compareA.value = "continents:Евразия";
  compareB.value = "continents:Африка";

  function getCompared(value) {
    const [category, name] = value.split(":");
    return regionProfiles[category].find(region => region.id === name);
  }
  function updateComparison() {
    const a = getCompared(compareA.value);
    const b = getCompared(compareB.value);
    const difference = Math.abs(a.area - b.area);
    const larger = a.area === b.area ? "одинакова" : `${a.area > b.area ? a.id : b.id} больше`;
    document.querySelector("#compare-result").innerHTML =
      `<b>${escapeHTML(larger)}</b> по площади. Разница — ${difference.toLocaleString("ru-RU", {maximumFractionDigits:1})} млн км².`;
    document.querySelector("#compare-explanation").hidden = true;
  }
  compareA.addEventListener("change", updateComparison);
  compareB.addEventListener("change", updateComparison);
  updateComparison();
  document.querySelector("#compare-explain").addEventListener("click", () => {
    const a = getCompared(compareA.value);
    const b = getCompared(compareB.value);
    const explanation = document.querySelector("#compare-explanation");
    explanation.textContent = `1) Найди площади: ${a.id} — ${formatNumber(a.area)} млн км², ${b.id} — ${formatNumber(b.area)} млн км². 2) Вычти меньшее значение из большего: ${Math.abs(a.area - b.area).toLocaleString("ru-RU", {maximumFractionDigits:1})} млн км². 3) Сравни: ${a.area === b.area ? "площади равны." : `${a.area > b.area ? a.id : b.id} занимает большую площадь.`} Значения округлены и нужны для учебного сравнения.`;
    explanation.hidden = false;
  });
})();
