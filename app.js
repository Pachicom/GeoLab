const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const pageNames={home:"Обзор",world:"География мира",kazakhstan:"Казахстан",climate:"Климатическая лаборатория",population:"Население",economy:"Мировое хозяйство",ecology:"Экология",quiz:"Викторина",glossary:"Словарь терминов",atlas:"Интерактивный атлас",countries:"Страны мира","earth-guide":"Материки и океаны",mapquiz:"Испытание на карте",coordinates:"Координатный тренажёр",calculators:"Геокалькуляторы",climatelab:"Конструктор климата",ecogame:"Эко-симулятор",missions:"Миссии и достижения"};
const defaultState={xp:0,completed:[],correct:0,answered:0,done:[]};
let state;
try {
  const stored=JSON.parse(localStorage.getItem("geolab9")||"null");
  state=stored&&typeof stored==="object"?{
    xp:Number.isFinite(stored.xp)?stored.xp:0,
    completed:Array.isArray(stored.completed)?stored.completed.filter(Boolean):[],
    correct:Number.isFinite(stored.correct)?stored.correct:0,
    answered:Number.isFinite(stored.answered)?stored.answered:0,
    done:Array.isArray(stored.done)?stored.done.filter(Boolean):[]
  }:JSON.parse(JSON.stringify(defaultState));
} catch (error) {
  state=JSON.parse(JSON.stringify(defaultState));
}
function save(){
  try{localStorage.setItem("geolab9",JSON.stringify(state));}catch(error){console.warn("GeoLab: unable to save progress",error)}
  updateStats();
}
function addXP(n,key){if(key&&state.done.includes(key))return; if(key)state.done.push(key);state.xp+=n;save()}
function updateStats(){let percent=Math.min(100,Math.round(state.xp/600*100)),level=Math.floor(state.xp/150)+1;let xpTotal=$("#xp-total");if(xpTotal)xpTotal.innerHTML=state.xp+' <small>XP</small>';let sideXp=$("#side-xp");if(sideXp)sideXp.textContent=state.xp+" / 600 XP";let sidePercent=$("#side-percent");if(sidePercent)sidePercent.textContent=percent+"%";let sideProgress=$("#side-progress");if(sideProgress)sideProgress.style.width=percent+"%";let lessonsTotal=$("#lessons-total");if(lessonsTotal)lessonsTotal.innerHTML=state.completed.length+' <small>/ 8</small>';let accuracy=$("#accuracy");if(accuracy)accuracy.textContent=state.answered?Math.round(state.correct/state.answered*100)+"%":"—";let levelLabel=$("#level");if(levelLabel)levelLabel.textContent=level+" ур.";let levelHome=$("#level-home");if(levelHome)levelHome.textContent=level}
const learningPages=new Set(["world","kazakhstan","climate","population","economy","ecology","countries","earth-guide"]);
function navigate(page){const resolvedPage=page&&pageNames[page]?page:"home";$$(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+resolvedPage));$$(".nav-link").forEach(a=>a.classList.toggle("active",a.dataset.page===resolvedPage));$("#crumb-current").textContent=pageNames[resolvedPage];location.hash=resolvedPage;window.scrollTo(0,0);if(resolvedPage==="atlas"&&window.geoAtlasMap)window.setTimeout(()=>window.geoAtlasMap.invalidateSize(),80);if(learningPages.has(resolvedPage)&&!state.completed.includes(resolvedPage)){state.completed.push(resolvedPage);save()}}
document.addEventListener("click",e=>{let a=e.target.closest("[data-page]");if(a){e.preventDefault();navigate(a.dataset.page)}});
window.addEventListener("hashchange",()=>navigate(location.hash.slice(1)||"home"));
$("#reset").addEventListener("click",()=>{if(confirm("Сбросить весь прогресс GeoLab 9?")){state=JSON.parse(JSON.stringify(defaultState));save();location.hash="home";navigate("home")}});
const answers={sphere:"Гидросфера",border:"Россия",climate:"Астана",demo:"Естественный прирост",eco:"Сокращать отходы, экономить ресурсы и развивать чистую энергетику"};
$$(".choice-list").forEach(group=>group.addEventListener("click",e=>{let btn=e.target.closest("button");if(!btn||group.dataset.locked)return;let key=group.dataset.question,correct=answers[key],ok=btn.dataset.answer===correct;group.dataset.locked="1";group.querySelectorAll("button").forEach(b=>{b.disabled=true;if(b.dataset.answer===correct)b.classList.add("correct")});if(!ok)btn.classList.add("wrong");let fb=$("#"+key+"-feedback");fb.textContent=ok?"Верно! Отличная работа. +"+(key==="climate"?30:20)+" XP":"Не совсем. Правильный ответ: "+correct+".";fb.style.color=ok?"#65d9a6":"#ff9daa";state.answered++;if(ok)state.correct++;addXP(key==="climate"?30:20,"task-"+key);save()}));
const climates={astana:{name:"Астана",t:[-14,-13,-6,7,15,20,22,20,13,4,-5,-11],r:[18,16,20,25,35,40,45,30,22,25,25,22]},almaty:{name:"Алматы",t:[-4,-2,5,12,17,22,24,23,18,10,3,-2],r:[30,40,75,105,105,55,35,25,25,55,50,35]},aktau:{name:"Актау",t:[1,2,6,13,19,24,27,27,21,14,7,3],r:[18,17,20,22,18,12,8,7,10,20,25,22]}};
function drawClimate(){let d=climates[$("#city-select").value],chart=$("#climate-chart");chart.innerHTML="";let maxRain=Math.max(...d.r),minT=Math.min(...d.t),maxT=Math.max(...d.t);d.t.forEach((t,i)=>{let col=document.createElement("div");col.className="chart-column";let rain=document.createElement("div");rain.className="rain-bar";rain.style.height=(d.r[i]/maxRain*65+8)+"%";col.append(rain);let point=document.createElement("div");point.className="temp-point";point.style.bottom=(18+(t-minT)/(maxT-minT||1)*60)+"%";col.append(point);chart.append(col)});$("#chart-months").innerHTML=["Я","Ф","М","А","М","И","И","А","С","О","Н","Д"].map(x=>`<span>${x}</span>`).join("");let amp=maxT-minT;$("#climate-summary").innerHTML=`<b>${d.name}</b>: средняя температура наиболее тёплого месяца около ${maxT}°C, наиболее холодного — ${minT}°C. Годовая амплитуда: <b>${amp}°C</b>.`}
$("#city-select").addEventListener("change",drawClimate);drawClimate();
function updateDemo(){let b=+$("#birth").value,d=+$("#death").value,m=+$("#migration").value,n=b-d,t=n+m;$("#birth-out").textContent=b+"‰";$("#death-out").textContent=d+"‰";$("#migration-out").textContent=(m>0?"+":"")+m+"‰";$("#natural").textContent=(n>0?"+":"")+n+"‰";$("#total-growth").textContent=(t>0?"+":"")+t+"‰";$("#change").textContent=(t/10>0?"+":"")+(t/10).toFixed(1)+"%"}
["birth","death","migration"].forEach(id=>$("#"+id).addEventListener("input",updateDemo));updateDemo();
const activities=[["Выращивание пшеницы","Первичный"],["Производство автомобилей","Вторичный"],["Работа туристического агентства","Третичный"],["Добыча медной руды","Первичный"],["Выпуск мебели на фабрике","Вторичный"],["Грузовые перевозки","Третичный"]];
$("#classify-list").innerHTML=activities.map((a,i)=>`<div class="classify-item"><span>${i+1}. ${a[0]}</span><select data-c="${i}"><option value="">Выбрать сектор</option><option>Первичный</option><option>Вторичный</option><option>Третичный</option></select></div>`).join("");
$("#check-economy").addEventListener("click",()=>{let selects=$$("#classify-list select"),right=0;if(selects.some(s=>!s.value)){ $("#economy-feedback").textContent="Выбери сектор для каждого примера.";return}selects.forEach(s=>{let ok=s.value===activities[+s.dataset.c][1];if(ok)right++;s.style.borderColor=ok?"#65d9a6":"#ef7e8d"});$("#economy-feedback").textContent=`Правильно: ${right} из ${activities.length}. ${right===6?"Отлично! Все ответы верны.":"Изучи подсказки и попробуй ещё раз."}`;addXP(right*5,"economy-classify")});
const questions=[
["ГЕОГРАФИЯ МИРА","Какой океан является самым большим по площади?",["Атлантический","Тихий","Индийский","Северный Ледовитый"],1,"Тихий океан — крупнейший по площади."],
["КАЗАХСТАН","Какой город является столицей Казахстана?",["Алматы","Шымкент","Астана","Караганда"],2,"Столица Казахстана — Астана."],
["КЛИМАТ","Как называется многолетний режим погоды, характерный для местности?",["Погода","Климат","Сезон","Циклон"],1,"Климат — многолетний режим погоды."],
["НАСЕЛЕНИЕ","Как называется перемещение населения из одного места в другое?",["Урбанизация","Миграция","Рождаемость","Плотность"],1,"Миграция — перемещение населения."],
["ХОЗЯЙСТВО","К какой отрасли относится добыча нефти?",["Первичный сектор","Вторичный сектор","Третичный сектор","Сфера услуг"],0,"Добыча ресурсов относится к первичному сектору."],
["ЭКОЛОГИЯ","Как называется процесс деградации земель в засушливых районах?",["Мелиорация","Опустынивание","Урбанизация","Седиментация"],1,"Опустынивание — деградация земель в засушливых районах."],
["ГЕОГРАФИЯ МИРА","Какая линия делит Землю на Северное и Южное полушария?",["Нулевой меридиан","Тропик Козерога","Экватор","Полярный круг"],2,"Экватор делит Землю на два полушария."],
["КАЗАХСТАН","С каким морем Казахстан имеет побережье на западе?",["Аральское","Каспийское","Чёрное","Средиземное"],1,"На западе Казахстан граничит с Каспийским морем."]
];let qi=0,score=0,selected=null,locked=false;
function renderQuiz(){let q=questions[qi];$("#quiz-counter").textContent=`ВОПРОС ${qi+1} / ${questions.length}`;$("#quiz-score").textContent=score+" правильных";$("#quiz-progress").style.width=(qi/questions.length*100)+"%";$("#quiz-topic").textContent=q[0];$("#quiz-question").textContent=q[1];$("#quiz-options").innerHTML=q[2].map((v,i)=>`<button class="quiz-option" data-i="${i}">${String.fromCharCode(65+i)}. ${v}</button>`).join("");$("#quiz-next").disabled=true;$("#quiz-next").textContent=qi===questions.length-1?"Завершить тест ✓":"Далее →";$("#quiz-feedback").textContent="";selected=null;locked=false}
$("#quiz-options").addEventListener("click",e=>{let b=e.target.closest("button");if(!b||locked)return;locked=true;selected=+b.dataset.i;let q=questions[qi],ok=selected===q[3];if(ok)score++;state.answered++;if(ok)state.correct++;save();$$("#quiz-options button").forEach((x,i)=>{x.disabled=true;if(i===q[3])x.classList.add("correct");else if(i===selected)x.classList.add("wrong")});$("#quiz-feedback").textContent=(ok?"Верно! ":"Неверно. ")+q[4];$("#quiz-feedback").style.color=ok?"#65d9a6":"#ff9daa";$("#quiz-next").disabled=false;$("#quiz-score").textContent=score+" правильных"});
$("#quiz-next").addEventListener("click",()=>{if(!locked)return;if(qi<questions.length-1){qi++;renderQuiz()}else{let earned=score*10;addXP(earned,"quiz-complete-"+Date.now());$("#quiz-question").textContent=`Тест завершён: ${score} из ${questions.length}`;$("#quiz-options").innerHTML=`<div class="term"><b>${Math.round(score/questions.length*100)}% правильных ответов</b><p>Ты получил(а) ${earned} XP. Повтори темы, где были ошибки, и попробуй снова.</p></div>`;$("#quiz-progress").style.width="100%";$("#quiz-next").disabled=true;$("#quiz-next").textContent="Тест пройден";$("#quiz-feedback").textContent="Результат сохранён в твоём прогрессе."}});
$("#restart-quiz").addEventListener("click",()=>{qi=0;score=0;renderQuiz()});renderQuiz();
const terms=[["Атмосфера","Газовая оболочка Земли."],["Биосфера","Оболочка Земли, населённая живыми организмами."],["Гидросфера","Водная оболочка Земли, включающая океаны, моря, реки, озёра, ледники и подземные воды."],["Демография","Наука о населении, его численности, составе и движении."],["Естественный прирост","Разность между числом родившихся и умерших за определённый период."],["Климат","Многолетний режим погоды, характерный для определённой местности."],["Литосфера","Твёрдая оболочка Земли, включающая земную кору и верхнюю часть мантии."],["Миграция","Перемещение людей с изменением места жительства."],["Мировое хозяйство","Исторически сложившаяся система взаимосвязанных национальных хозяйств."],["Опустынивание","Деградация земель в засушливых и полузасушливых районах."],["Плотность населения","Число жителей, приходящееся в среднем на единицу площади территории."],["Урбанизация","Рост городов и доли городского населения."],["Широтная зональность","Закономерная смена природных условий от экватора к полюсам."],["Экономическая география","Раздел географии, изучающий территориальную организацию хозяйства и населения."]];
function renderTerms(){let q=$("#glossary-search").value.toLowerCase();let filtered=terms.filter(t=>t.join(" ").toLowerCase().includes(q));$("#glossary-list").innerHTML=filtered.length?filtered.map(t=>`<div class="term"><b>${t[0]}</b><p>${t[1]}</p></div>`).join(""):'<div class="empty">Ничего не найдено. Попробуй изменить запрос.</div>'}
$("#glossary-search").addEventListener("input",renderTerms);renderTerms();updateStats();navigate(location.hash.slice(1)||"home");

// ===== Extended interactive modules =====
const atlasPlaces=[
  {name:"Казахстан", coords:[48.0196,66.9237], emoji:"🇰🇿", summary:"Казахстан — крупнейшая страна в Центральной Азии, с обширными степями, горами и внутренними водоёмами.", fact:"Страна расположена в центре Евразии и имеет выход к Каспийскому морю."},
  {name:"Россия", coords:[61.524,105.3188], emoji:"🇷🇺", summary:"Россия — самая большая страна мира по площади, охватывающая огромные районы Европы и Азии.", fact:"Её территории включают тайгу, степь, тундру, горы и многочисленные реки."},
  {name:"Китай", coords:[35.8617,104.1954], emoji:"🇨🇳", summary:"Китай — крупнейшая по численности населения страна мира и важный центр мировой экономики.", fact:"На территории страны находятся Гималаи, пустыни, великие реки и большие города."},
  {name:"США", coords:[37.0902,-95.7129], emoji:"🇺🇸", summary:"США — крупная страна Северной Америки с разнообразием ландшафтов и крупнейшими городами.", fact:"Здесь расположены Скалистые горы, Великие равнины, Большой каньон и Великие озёра."},
  {name:"Бразилия", coords:[-14.235,-51.9253], emoji:"🇧🇷", summary:"Бразилия — крупнейшая страна Южной Америки и главный центр Амазонии.", fact:"Она охватывает большую часть бассейна реки Амазонки и тропических лесов."},
  {name:"Нигерия", coords:[9.082,8.6753], emoji:"🇳🇬", summary:"Нигерия — крупнейшая страна Африки по населению, располагается в западной части континента.", fact:"В стране много этносов, крупных городов и богатых природных ресурсов."},
  {name:"Австралия", coords:[-25.2744,133.7751], emoji:"🇦🇺", summary:"Австралия — материк и страна в Океании, известная пустынями и уникальной флорой.", fact:"Здесь находится Большой Барьерный риф и центральные пустыни континента."},
  {name:"Египет", coords:[26.8206,30.8025], emoji:"🇪🇬", summary:"Египет — страна на северо-востоке Африки, где расположена долина Нила.", fact:"Здесь сосредоточены древние города, оазисы и важнейшие сельскохозяйственные земли."}
];
if(Array.isArray(window.geoCountries)&&window.geoCountries.length){
  atlasPlaces.length=0;
  window.geoCountries.forEach(country=>{
    if(country.latlng.length!==2)return;
    atlasPlaces.push({
      name:country.name,
      coords:country.latlng,
      emoji:country.flag,
      summary:`Столица: ${country.capital}. Регион: ${country.subregion}.`,
      fact:`Площадь: ${Number(country.area||0).toLocaleString("ru-RU")} км². ${country.landlocked?"Не имеет выхода к морю.":"Имеет морское побережье."}`,
      area:country.area,
      population:country.population,
      code:country.code
    });
  });
}

function renderAtlasCard({emoji,name,summary,fact}){
  $("#atlas-info").innerHTML=`<div class="eyebrow">КАРТОЧКА ОБЪЕКТА</div><div class="atlas-big">${emoji}</div><h2>${name}</h2><div class="atlas-facts"><div><b>Кратко</b><small>${summary}</small></div><div><b>Географическая особенность</b><small>${fact}</small></div></div>`;
}

function createFallbackAtlasMap(){
  const mapEl = $("#world-map");
  if (!mapEl) return;
  const width = 900;
  const height = 470;
  const svgMarkup = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Карта мира">
      <defs>
        <linearGradient id="atlas-sea" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#123c5f"/>
          <stop offset="100%" stop-color="#0a213a"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="18" fill="url(#atlas-sea)"/>
      <g opacity="0.22" stroke="#9bd7d9" stroke-width="1">
        <path d="M0 90H900M0 180H900M0 270H900M0 360H900M150 0V470M300 0V470M450 0V470M600 0V470M750 0V470" fill="none"/>
      </g>
      <g class="atlas-markers"></g>
    </svg>
  `;
  mapEl.innerHTML = svgMarkup;

  const markerLayer = mapEl.querySelector(".atlas-markers");
  const createMarker = (place) => {
    const x = ((place.coords[1] + 180) / 360) * width;
    const y = ((90 - place.coords[0]) / 180) * height;
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 6);
    circle.setAttribute("class", "atlas-pin");
    circle.dataset.name = place.name;
    circle.addEventListener("click", () => {
      $$(".atlas-pin").forEach(pin => pin.classList.toggle("atlas-pin-active", pin === circle));
      renderAtlasCard(place);
      addXP(2, "atlas-" + place.name);
    });
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x + 10);
    label.setAttribute("y", y - 10);
    label.setAttribute("class", "atlas-pin-label");
    label.textContent = place.name;
    markerLayer.appendChild(circle);
    markerLayer.appendChild(label);
  };

  atlasPlaces.forEach(createMarker);

  const searchAtlas = () => {
    const query = ($("#atlas-country-search")?.value || "").trim().toLowerCase();
    if (!query) {
      renderAtlasCard(atlasPlaces[0]);
      return;
    }
    const match = atlasPlaces.find(place =>
      place.name.toLowerCase().includes(query) ||
      place.summary.toLowerCase().includes(query) ||
      place.fact.toLowerCase().includes(query)
    );
    if (!match) {
      $("#atlas-info").innerHTML='<div class="eyebrow">КАРТОЧКА ОБЪЕКТА</div><div class="atlas-big">🧭</div><h2>Объект не найден</h2><p class="muted">Попробуйте искать: Казахстан, Китай, Россия, Египет, Бразилия, Австралия.</p>';
      return;
    }
    renderAtlasCard(match);
    addXP(2, "atlas-search-" + match.name);
    const target = [...mapEl.querySelectorAll(".atlas-pin")].find(pin => pin.dataset.name === match.name);
    if (target) {
      $$(".atlas-pin").forEach(pin => pin.classList.toggle("atlas-pin-active", pin === target));
    }
  };

  $("#atlas-search-btn")?.addEventListener("click", searchAtlas);
  $("#atlas-country-search")?.addEventListener("keydown", e => { if (e.key === "Enter") searchAtlas(); });
}

function initAtlasMap(){
  const mapEl = $("#world-map");
  if (!mapEl) return;
  if (typeof L === "undefined") {
    createFallbackAtlasMap();
    return;
  }

  const atlasMap = L.map("world-map", { worldCopyJump: true, zoomControl: true, attributionControl: true });
  window.geoAtlasMap=atlasMap;
  atlasMap.setView([24, 20], 2);

  const baseLayers = {
    "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      subdomains: ["a", "b", "c"],
      attribution: '&copy; OpenStreetMap contributors'
    }),
    "Топографический": L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      maxZoom: 17,
      subdomains: ["a", "b", "c"],
      attribution: 'Map data: &copy; OpenStreetMap contributors, &copy; OpenTopoMap'
    })
  };

  baseLayers["OpenStreetMap"].addTo(atlasMap);
  L.control.layers(baseLayers, {}, { position: "topright" }).addTo(atlasMap);

  atlasPlaces.forEach(place => {
    const marker = L.marker(place.coords).addTo(atlasMap);
    marker.bindPopup(`<strong>${place.emoji} ${place.name}</strong><br>${place.summary}`);
    marker.on("click", () => {
      renderAtlasCard(place);
      addXP(2, "atlas-" + place.name);
    });
  });

  const searchAtlas = () => {
    const query = ($("#atlas-country-search")?.value || "").trim().toLowerCase();
    if (!query) return;
    const match = atlasPlaces.find(place => place.name.toLowerCase().includes(query) || place.summary.toLowerCase().includes(query));
    if (!match) {
      $("#atlas-info").innerHTML='<div class="eyebrow">КАРТОЧКА ОБЪЕКТА</div><div class="atlas-big">🧭</div><h2>Объект не найден</h2><p class="muted">Попробуйте искать: Казахстан, Китай, Россия, Египет, Бразилия, Австралия.</p>';
      return;
    }
    atlasMap.flyTo(match.coords, 3, { duration: 1.5 });
    renderAtlasCard(match);
    addXP(2, "atlas-search-" + match.name);
  };

  $("#atlas-search-btn")?.addEventListener("click", searchAtlas);
  $("#atlas-country-search")?.addEventListener("keydown", e => { if (e.key === "Enter") searchAtlas(); });
  renderAtlasCard(atlasPlaces[0]);
}

if ($("#world-map")) {
  renderAtlasCard(atlasPlaces[0]);
  initAtlasMap();
}
const geoObjects={"нил":"Нил — одна из крупнейших рек Африки; традиционно считается одной из самых длинных рек мира.","эверест":"Эверест (Джомолунгма) — высочайшая вершина Земли, находится в Гималаях на границе Непала и Китая.","байкал":"Байкал — озеро в Азии, самое глубокое озеро мира и крупнейший природный резервуар пресной воды по объёму.","амазонка":"Амазонка — крупнейшая река мира по водности, протекает в Южной Америке.","сахара":"Сахара — крупнейшая жаркая пустыня мира, расположенная в Северной Африке.","арал":"Аральское море — бессточное солёное озеро в Центральной Азии, экологическая катастрофа которого связана с отводом речных вод.","каспий":"Каспийское море — крупнейший замкнутый водоём Земли, омывает запад Казахстана."};
$("#object-find").addEventListener("click",()=>{let q=$("#object-search").value.trim().toLowerCase(),found=Object.entries(geoObjects).find(([k])=>q.includes(k));$("#object-result").textContent=found?found[1]:"Объект не найден в кратком справочнике. Попробуй: Нил, Эверест, Байкал, Амазонка, Сахара, Арал или Каспий.";});
$("#object-search").addEventListener("keydown",e=>{if(e.key==="Enter")$("#object-find").click()});
const mapQuestions=[
{q:"Какой океан самый большой по площади?",s:"Выбери Тихий океан.",a:["Тихий океан","Атлантический океан","Индийский океан"],c:0},
{q:"На каком материке расположена пустыня Сахара?",s:"Самая большая жаркая пустыня мира.",a:["Австралия","Африка","Южная Америка"],c:1},
{q:"Где находятся Анды?",s:"Это длинная горная система западной окраины материка.",a:["Южная Америка","Европа","Азия"],c:0},
{q:"Какой материк пересекает Южный полюс?",s:"Самый холодный материк Земли.",a:["Антарктида","Северная Америка","Австралия"],c:0},
{q:"Какой материк является самым большим?",s:"Он занимает большую часть восточного полушария.",a:["Африка","Азия","Европа"],c:1},
{q:"На каком материке находится река Амазонка?",s:"Её бассейн занимает огромную площадь тропиков.",a:["Южная Америка","Африка","Азия"],c:0},
{q:"Какой океан омывает восточное побережье Африки?",s:"Он расположен между Африкой, Азией и Австралией.",a:["Атлантический","Индийский","Северный Ледовитый"],c:1},
{q:"Где расположен Большой Барьерный риф?",s:"Крупнейшая система коралловых рифов.",a:["У берегов Австралии","У берегов Африки","У берегов Европы"],c:0}
];let mapQ=0,mapCorrect=0,mapTotal=0,mapLocked=false;
function renderMapQ(){let q=mapQuestions[mapQ%mapQuestions.length];$("#map-task").textContent=q.q;$("#map-subtask").textContent=q.s;$("#map-round").textContent=String(mapTotal+1).padStart(2,"0");$("#map-choices").innerHTML=q.a.map((a,i)=>`<button class="map-choice" data-i="${i}">${a}</button>`).join("");$("#map-result").textContent="Выбери ответ, чтобы продолжить экспедицию.";$("#map-next").disabled=true;mapLocked=false}
$("#map-choices").addEventListener("click",e=>{let b=e.target.closest("button");if(!b||mapLocked)return;mapLocked=true;let q=mapQuestions[mapQ%mapQuestions.length],i=+b.dataset.i,ok=i===q.c;mapTotal++;if(ok)mapCorrect++;$$("#map-choices button").forEach((x,j)=>{x.disabled=true;if(j===q.c)x.classList.add("correct");else if(j===i)x.classList.add("wrong")});$("#map-result").textContent=ok?"Верно! Экспедиция продолжается. +15 XP":"Пока не получилось. Правильный ответ: "+q.a[q.c]+".";$("#map-result").style.color=ok?"#65d9a6":"#ff9daa";$("#map-next").disabled=false;$("#map-correct").textContent=mapCorrect;$("#map-total").textContent=mapTotal;$("#map-accuracy").textContent=Math.round(mapCorrect/mapTotal*100)+"%";addXP(ok?15:3,"map-round-"+mapTotal)});
$("#map-next").addEventListener("click",()=>{mapQ++;renderMapQ()});renderMapQ();
const cities=[["Каир",30,31],["Астана",51,71],["Лондон",52,0],["Токио",36,140],["Сидней",-34,151],["Рио-де-Жанейро",-23,-43],["Нью-Дели",29,77],["Буэнос-Айрес",-35,-58],["Алматы",43,77],["Найроби",-1,37],["Париж",49,2],["Мехико",19,-99]];
let currentCity=null,coordAnswered=false;
function newCoord(){currentCity=cities[Math.floor(Math.random()*cities.length)];$("#coord-place").textContent=currentCity[0];$("#lat-input").value="";$("#lon-input").value="";$("#coord-feedback").textContent="";coordAnswered=false}
$("#coord-new").addEventListener("click",newCoord);
$("#coord-check").addEventListener("click",()=>{if(coordAnswered)return;let lat=Number($("#lat-input").value),lon=Number($("#lon-input").value);if($("#lat-input").value===""||$("#lon-input").value===""){ $("#coord-feedback").textContent="Заполни оба поля.";return}let ok=Math.abs(lat-currentCity[1])<=3&&Math.abs(lon-currentCity[2])<=4;coordAnswered=true;$("#coord-feedback").textContent=ok?`Отлично! Примерные координаты: ${currentCity[1]}° широты, ${currentCity[2]}° долготы. +20 XP`:`Почти! Для ${currentCity[0]} ориентир: ${currentCity[1]}° широты и ${currentCity[2]}° долготы.`;$("#coord-feedback").style.color=ok?"#65d9a6":"#ff9daa";addXP(ok?20:5,"coord-"+currentCity[0]+"-"+Date.now())});
newCoord();
$("#hemisphere-options").addEventListener("click",e=>{let b=e.target.closest("button");if(!b||b.disabled)return;let ok=b.textContent.startsWith("Северном и Восточном");$$("#hemisphere-options button").forEach(x=>{x.disabled=true;if(x.textContent.startsWith("Северном и Восточном"))x.classList.add("correct")});if(!ok)b.classList.add("wrong");$("#hemisphere-feedback").textContent=ok?"Верно! Северная широта и восточная долгота. +10 XP":"Правильный ответ: Северном и Восточном.";addXP(ok?10:2,"hemisphere-one")});
function calc(id,fn){$$(id).forEach(x=>x.addEventListener("input",fn));fn()}
calc("#map-cm,#map-scale",()=>{let cm=+$("#map-cm").value,s=+$("#map-scale").value;$("#scale-output").textContent=s>0&&cm>=0?`На местности: ${(cm*s/100000).toLocaleString("ru-RU",{maximumFractionDigits:3})} км`:"Проверь значения"});
calc("#pop-number,#pop-area",()=>{let p=+$("#pop-number").value,a=+$("#pop-area").value;$("#density-output").textContent=a>0?`Плотность: ${(p/a).toLocaleString("ru-RU",{maximumFractionDigits:2})} чел./км²`:"Площадь должна быть больше нуля"});
calc("#longitude-a,#longitude-b",()=>{let d=Math.abs(+$("#longitude-b").value-(+$("#longitude-a").value));$("#time-output").textContent=`Разница долгот: ${d}°. Разница времени: ${(d/15).toFixed(2)} ч (≈ ${Math.round(d*4)} мин)`});
calc("#temp-max,#temp-min",()=>{$("#amplitude-output").textContent=`Амплитуда: ${Math.abs(+$("#temp-max").value-(+$("#temp-min").value))}°C`});
function updateClimateBuilder(){let jan=+$("#jan").value,jul=+$("#jul").value,r=+$("#precip").value,amp=jul-jan;$("#jan-out").textContent=(jan>0?"+":"")+jan+"°C";$("#jul-out").textContent=(jul>0?"+":"")+jul+"°C";$("#precip-out").textContent=r+" мм";let type,desc;if(r<200){type="Очень сухой (аридный) профиль";desc="Осадков мало: вероятны условия пустынь и полупустынь."}else if(amp>35){type="Резко континентальный профиль";desc="Большая годовая амплитуда указывает на сильную сезонность температур."}else if(amp<12&&r>800){type="Влажный мягкий профиль";desc="Небольшая годовая амплитуда и большое количество осадков."}else if($("#rain-season").value==="summer"){type="Континентальный профиль с летним максимумом осадков";desc="Летний максимум осадков может быть связан с конвекцией и сезонной циркуляцией."}else if($("#rain-season").value==="winter"){type="Профиль с зимним максимумом осадков";desc="Зимний максимум может быть связан с западным переносом и циклонами."}else{type="Умеренный профиль с равномерными осадками";desc="Осадки распределены относительно равномерно в течение года."}$("#climate-verdict").innerHTML=`<span>РЕЗУЛЬТАТ АНАЛИЗА • АМПЛИТУДА ${amp}°C</span><h2>${type}</h2><p>${desc}</p>`}
["jan","jul","precip","rain-season"].forEach(id=>$("#"+id).addEventListener("input",updateClimateBuilder));updateClimateBuilder();
const ecoRounds=[
{title:"Раунд 1: транспорт",scenario:"В городе растут пробки и загрязнение воздуха. Какое решение ты примешь?",opts:[["Развивать общественный транспорт и велодорожки",{n:12,m:-10,l:12},"Сокращение выбросов и удобный транспорт улучшают среду, но требуют вложений."],["Строить больше дорог для автомобилей",{n:-8,m:-5,l:2},"Новые дороги могут временно облегчить движение, но стимулируют автомобильный трафик."],["Ничего не менять",{n:-8,m:0,l:-7},"Проблема продолжит накапливаться."]]},
{title:"Раунд 2: энергия",scenario:"Городу нужно больше электроэнергии. Какой путь выбрать?",opts:[["Инвестировать в солнечную и ветровую энергетику",{n:13,m:-12,l:7},"Чистая энергетика снижает загрязнение, но требует первоначальных инвестиций."],["Построить угольную электростанцию",{n:-14,m:4,l:2},"Угольная генерация может быть доступной, но увеличивает выбросы."],["Откладывать модернизацию",{n:-4,m:0,l:-5},"Изношенная инфраструктура снижает надёжность системы."]]},
{title:"Раунд 3: отходы",scenario:"Свалка переполняется. Что предпримешь?",opts:[["Раздельный сбор, переработка и компостирование",{n:12,m:-5,l:8},"Снижается объём отходов и появляются вторичные ресурсы."],["Расширить свалку без сортировки",{n:-8,m:-3,l:-3},"Это откладывает проблему, но не устраняет её причины."],["Сжигать весь мусор без очистки выбросов",{n:-13,m:1,l:-8},"Сжигание без контроля выбросов загрязняет атмосферу."]]},
{title:"Раунд 4: вода",scenario:"В регионе растёт дефицит воды. Как действовать?",opts:[["Внедрить водосберегающее орошение и ремонт сетей",{n:12,m:-7,l:10},"Экономия воды уменьшает потери и помогает сельскому хозяйству."],["Увеличить водозабор без ограничений",{n:-13,m:-4,l:1},"Чрезмерный водозабор угрожает рекам и озёрам."],["Не следить за утечками",{n:-8,m:0,l:-7},"Потери воды и затраты будут расти."]]},
{title:"Раунд 5: зелёные зоны",scenario:"Жители просят больше парков и деревьев. Какой проект поддержишь?",opts:[["Создать сеть парков и защитить городские деревья",{n:13,m:-8,l:13},"Зелёные зоны улучшают микроклимат, отдых и качество городской среды."],["Застроить свободные участки без озеленения",{n:-9,m:8,l:-8},"Краткосрочная выгода может ухудшить качество жизни."],["Посадить деревья без дальнейшего ухода",{n:2,m:-1,l:1},"Без ухода часть посадок может не прижиться."]]}
];let ecoIndex=0,ecoStats={n:55,m:60,l:55},ecoFinished=false;
function paintEco(){["n","m","l"].forEach(k=>{let id=k==="n"?"nature":k==="m"?"money":"life";$("#eco-"+id).textContent=ecoStats[k];$("#eco-"+id+"-bar").style.width=ecoStats[k]+"%"});}
function renderEco(){let r=ecoRounds[ecoIndex];$("#eco-round-title").textContent=r.title;$("#eco-round").textContent=(ecoIndex+1)+" / 5";$("#eco-scenario").textContent=r.scenario;$("#eco-decisions").innerHTML=r.opts.map((o,i)=>`<button class="eco-decision" data-i="${i}">${String.fromCharCode(65+i)}. ${o[0]}</button>`).join("");$("#eco-feedback").textContent="";$("#eco-next").disabled=true;$("#eco-next").textContent=ecoIndex===4?"Подвести итоги":"Следующая ситуация →";ecoFinished=false}
$("#eco-decisions").addEventListener("click",e=>{let b=e.target.closest("button");if(!b||ecoFinished)return;ecoFinished=true;let opt=ecoRounds[ecoIndex].opts[+b.dataset.i];ecoStats.n=Math.max(0,Math.min(100,ecoStats.n+opt[1].n));ecoStats.m=Math.max(0,Math.min(100,ecoStats.m+opt[1].m));ecoStats.l=Math.max(0,Math.min(100,ecoStats.l+opt[1].l));paintEco();$$("#eco-decisions button").forEach(x=>{x.disabled=true;if(x===b)x.classList.add("chosen")});$("#eco-feedback").textContent=opt[2];$("#eco-next").disabled=false});
$("#eco-next").addEventListener("click",()=>{if(!ecoFinished)return;if(ecoIndex<4){ecoIndex++;renderEco()}else{let avg=Math.round((ecoStats.n+ecoStats.m+ecoStats.l)/3);$("#eco-round-title").textContent="Город будущего: "+(avg>=70?"отличный результат!":avg>=45?"есть потенциал для улучшения":"город нуждается в новых решениях");$("#eco-scenario").textContent=`Итоговые показатели: экология ${ecoStats.n}/100, бюджет ${ecoStats.m}/100, качество жизни ${ecoStats.l}/100. Средний индекс: ${avg}/100.`;$("#eco-decisions").innerHTML="";$("#eco-feedback").textContent="Симуляция завершена. +50 XP";$("#eco-next").disabled=true;addXP(50,"eco-simulation-"+Date.now())}});
$("#eco-restart").addEventListener("click",()=>{ecoIndex=0;ecoStats={n:55,m:60,l:55};paintEco();renderEco()});paintEco();renderEco();
const achievements=[
["🧭","Первый шаг","Открой первую лабораторию",()=>state.completed.length>=1],
["📚","Любознательный","Изучи три лаборатории",()=>state.completed.length>=3],
["🧠","Эрудит","Набери 100 XP",()=>state.xp>=100],
["🌍","Картограф","Изучи пять стран в атласе",()=>state.done.filter(x=>x.startsWith("atlas-")&&!x.startsWith("atlas-search-")).length>=5],
["🎯","Меткий ответ","Ответь правильно на 5 вопросов",()=>state.correct>=5],
["🏅","Опытный исследователь","Набери 300 XP",()=>state.xp>=300],
["🌱","Защитник природы","Заверши эко-симуляцию",()=>state.done.some(x=>x.startsWith("eco-simulation-"))],
["🚀","Геоэксперт","Набери 600 XP",()=>state.xp>=600]
];
function renderAchievements(){let count=0;$("#achievement-grid").innerHTML=achievements.map((a,i)=>{let unlocked=a[3]();if(unlocked)count++;return `<div class="achievement ${unlocked?"unlocked":""}"><div class="achievement-icon">${a[0]}</div><b>${a[1]}</b><small>${a[2]}</small><small>${unlocked?"✓ Открыто":"🔒 Пока закрыто"}</small></div>`}).join("");$("#achievement-count").textContent=count+" / "+achievements.length+" открыто";$("#mission-xp").textContent=state.xp;$("#mission-lessons").textContent=state.completed.length;$("#mission-accuracy").textContent=state.answered?Math.round(state.correct/state.answered*100)+"%":"0%"}
const oldUpdateStats=updateStats;updateStats=function(){oldUpdateStats();if($("#achievement-grid"))renderAchievements()};
renderAchievements();
$("#daily-start").addEventListener("click",()=>{let pool=[...questions].sort(()=>Math.random()-.5).slice(0,3);let idx=0,points=0;let panel=$("#daily-start").parentElement;function show(){if(idx>=3){panel.innerHTML=`<div><div class="eyebrow">ИСПЫТАНИЕ ЗАВЕРШЕНО</div><h2>Результат: ${points} / 3</h2><p>Ты получил(а) ${points*15} XP за разминку.</p></div><div class="daily-icon">🏆</div><button class="primary-btn" id="daily-again">Повторить ↻</button>`;addXP(points*15,"daily-"+new Date().toDateString()+"-"+Math.random());$("#daily-again").addEventListener("click",()=>location.reload());return}let q=pool[idx];panel.innerHTML=`<div><div class="eyebrow">ВОПРОС ${idx+1} / 3 • ${q[0]}</div><h2>${q[1]}</h2><div class="daily-options">${q[2].map((v,i)=>`<button class="eco-decision" data-i="${i}">${v}</button>`).join("")}</div><p id="daily-feedback"></p></div><div class="daily-icon">✦</div>`;panel.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{let ok=+b.dataset.i===q[3];if(ok)points++;panel.querySelectorAll("button").forEach(x=>x.disabled=true);$("#daily-feedback").textContent=ok?"Верно!":"Правильный ответ: "+q[2][q[3]];setTimeout(()=>{idx++;show()},850)}))}show()});
