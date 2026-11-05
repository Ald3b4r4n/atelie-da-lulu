"use strict";

/* =========================================================
   ATELIÊ DA LULU — lógica do jogo
   ========================================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ---------------------------------------------------------
   Paletas de cor
   --------------------------------------------------------- */
const SKINS = [
  { id: "#FFE3CB", name: "Pêssego claro" },
  { id: "#F7D2B0", name: "Mel" },
  { id: "#E7B48A", name: "Dourada" },
  { id: "#CE8F5E", name: "Canela" },
  { id: "#A9663B", name: "Chocolate" },
  { id: "#734527", name: "Ébano" }
];

const HAIR_COLORS = [
  { id: "#2B211D", name: "Preto" },
  { id: "#5B3A24", name: "Castanho" },
  { id: "#8B5A2B", name: "Caramelo" },
  { id: "#E4B95E", name: "Loiro" },
  { id: "#C8552E", name: "Ruivo" },
  { id: "#FF6FA5", name: "Rosa" },
  { id: "#B45CFF", name: "Roxo" },
  { id: "#43B6FF", name: "Azul" }
];

const EYES = [
  { id: "#6B4226", name: "Castanho" },
  { id: "#8A5A2B", name: "Mel" },
  { id: "#3E7A5E", name: "Verde" },
  { id: "#2F6FB5", name: "Azul" },
  { id: "#8E5BC6", name: "Violeta" },
  { id: "#2B2B2B", name: "Preto" }
];

const LIPS = [
  { id: "#D98A93", name: "Natural" },
  { id: "#E76A8A", name: "Rosa" },
  { id: "#E0455F", name: "Vermelho" },
  { id: "#C25CC4", name: "Fúcsia" },
  { id: "#FF9E7A", name: "Coral" },
  { id: "#B04A8F", name: "Ameixa" }
];

const BLUSHES = [
  { id: "#FF9BB3", name: "Rosa" },
  { id: "#FFB27A", name: "Pêssego" },
  { id: "#F27FA8", name: "Chiclete" },
  { id: "#D98AE0", name: "Lilás" }
];

const SHADOWS = [
  { id: "#C77DFF", name: "Lilás" },
  { id: "#FF8FB1", name: "Rosa" },
  { id: "#7FD1FF", name: "Azul" },
  { id: "#FFD166", name: "Dourado" },
  { id: "#8AE6A1", name: "Verde" }
];

/* ---------------------------------------------------------
   Estado
   --------------------------------------------------------- */
const defaults = () => ({
  skin: "#F7D2B0",
  hair: "longo",
  hairColor: "#5B3A24",
  eye: "#6B4226",
  lip: "#D98A93",
  blush: "#FF9BB3",
  shadow: null,
  top: null,
  bottom: null,
  dress: "borboleta",
  shoe: "sandalia",
  acc: { pulseira: null, brinco: null, colar: null, oculos: null, extras: [] },
  bg: "quarto"
});

let state = defaults();
let soundOn = true;
let musicOn = true;
let suppressClick = false;
let activeTab = "roupas";
let accTab = "pulseiras";
let started = false;
let studio;
let studioActive = true;
let studioLoading = false;

/* ---------------------------------------------------------
   Render
   --------------------------------------------------------- */
function renderDoll() {
  const st = state;

  $("#lay-scene").innerHTML =
    SCENES[st.bg].art() +
    `<ellipse cx="160" cy="492" rx="66" ry="10" fill="rgba(60,20,50,.14)"/>`;

  $("#lay-hair-back").innerHTML = HAIR[st.hair].back(st.hairColor);
  $("#lay-body").innerHTML = bodySVG(st.skin);
  $("#lay-makeup").innerHTML = makeupSVG(st);
  $("#lay-face").innerHTML = faceSVG(st);

  $("#lay-bottom").innerHTML = st.dress ? "" : st.bottom ? BOTTOMS[st.bottom].art() : "";
  $("#lay-dress").innerHTML = st.dress ? DRESSES[st.dress].art() : "";
  $("#lay-top").innerHTML = st.dress ? "" : st.top ? TOPS[st.top].art() : "";
  $("#lay-shoes").innerHTML = st.shoe ? SHOES[st.shoe].art() : "";

  $("#lay-bracelets").innerHTML = st.acc.pulseira ? PULSEIRAS[st.acc.pulseira].art() : "";
  $("#lay-necklaces").innerHTML = st.acc.colar ? COLARES[st.acc.colar].art() : "";
  $("#lay-hair-front").innerHTML = HAIR[st.hair].front(st.hairColor);
  $("#lay-earrings").innerHTML = st.acc.brinco ? BRINCOS[st.acc.brinco].art() : "";
  $("#lay-glasses").innerHTML = st.acc.oculos ? OCULOS[st.acc.oculos].art() : "";

  const order = ["laco", "orelhas", "tiara", "chapeu"];
  $("#lay-extras").innerHTML = [...st.acc.extras]
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map((id) => EXTRAS[id].art())
    .join("");
  studio?.update(st);
  $("#stage-world").textContent = st.bg === "quarto" ? "Ateliê da Lulu" : SCENES[st.bg].name;
}

/* ---------------------------------------------------------
   Aplicar escolhas
   --------------------------------------------------------- */
function apply(slot, id) {
  switch (slot) {
    case "top":
      state.top = state.top === id ? null : id;
      if (state.top) state.dress = null;
      break;
    case "bottom":
      state.bottom = state.bottom === id ? null : id;
      if (state.bottom) state.dress = null;
      break;
    case "dress":
      if (state.dress === id) {
        state.dress = null;
      } else {
        state.dress = id;
        state.top = null;
        state.bottom = null;
      }
      break;
    case "shoe":
      state.shoe = state.shoe === id ? null : id;
      break;
    case "hair":
      state.hair = id;
      break;
    case "haircolor":
      state.hairColor = id;
      break;
    case "lip":
      state.lip = id;
      break;
    case "blush":
      state.blush = state.blush === id ? null : id;
      break;
    case "shadow":
      state.shadow = state.shadow === id ? null : id;
      break;
    case "eye":
      state.eye = id;
      break;
    case "skin":
      state.skin = id;
      break;
    case "pulseira":
    case "brinco":
    case "colar":
    case "oculos":
      state.acc[slot] = state.acc[slot] === id ? null : id;
      break;
    case "extra": {
      const i = state.acc.extras.indexOf(id);
      if (i >= 0) state.acc.extras.splice(i, 1);
      else state.acc.extras.push(id);
      break;
    }
    case "bg":
      state.bg = id;
      if (started && musicOn) Music.start(id);
      showTrack();
      break;
    default:
      return;
  }

  renderDoll();
  if (slot === "haircolor") buildPalette();
  updateSelection();
  hideHint();
  react(slot);
}

function isSelected(slot, id) {
  if (id === "none") {
    const key = slot === "haircolor" ? "hairColor" : slot;
    return state[key] === null;
  }
  switch (slot) {
    case "top": return state.top === id;
    case "bottom": return state.bottom === id;
    case "dress": return state.dress === id;
    case "shoe": return state.shoe === id;
    case "hair": return state.hair === id;
    case "haircolor": return state.hairColor === id;
    case "lip": return state.lip === id;
    case "blush": return state.blush === id;
    case "shadow": return state.shadow === id;
    case "eye": return state.eye === id;
    case "skin": return state.skin === id;
    case "bg": return state.bg === id;
    case "pulseira":
    case "brinco":
    case "colar":
    case "oculos":
      return state.acc[slot] === id;
    case "extra":
      return state.acc.extras.includes(id);
    default: return false;
  }
}

function updateSelection() {
  $$("[data-slot]").forEach((el) => {
    const selected = isSelected(el.dataset.slot, el.dataset.id);
    el.classList.toggle("selected", selected);
    el.setAttribute("aria-pressed", selected ? "true" : "false");
  });
}

/* ---------------------------------------------------------
   Som
   --------------------------------------------------------- */
function beep(freq = 660, dur = 0.09, type = "sine", vol = 0.05, delay = 0) {
  if (!soundOn) return;
  try {
    const c = audioCtx();
    const t = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  } catch (err) {
    /* som é opcional */
  }
}

function chime() {
  beep(660, 0.12, "triangle", 0.045, 0);
  beep(880, 0.12, "triangle", 0.04, 0.08);
  beep(1180, 0.16, "triangle", 0.035, 0.16);
}

/* ---------------------------------------------------------
   Reações
   --------------------------------------------------------- */
const MESSAGES = {
  top: ["Que blusa linda!", "Combinou demais!", "Adorei essa blusa!", "Que estilo!"],
  bottom: ["Que saia fofa!", "Ficou ótimo!", "Uau, que look!", "Amei essa peça!"],
  dress: ["Que vestido de princesa!", "Uau, que chique!", "Você tem bom gosto!", "Que lindo!"],
  shoe: ["Que sapatinho fofo!", "Pronto para dançar!", "Adorei esse sapato!"],
  hair: ["Que cabelo lindo!", "Amei esse penteado!", "Ficou demais!", "Que produção!"],
  haircolor: ["Essa cor ficou incrível!", "Que cor mais linda!", "Uau, mudou tudo!"],
  lip: ["Batom poderoso!", "Que boca mais bonita!", "Ficou chique!"],
  blush: ["Bochechas coradas!", "Que fofura!", "Ficou saudável e lindo!"],
  shadow: ["Que sombra brilhante!", "Olha esse olhar!", "Arrasou na maquiagem!"],
  eye: ["Que olhos lindos!", "Olhar de estrela!"],
  skin: ["Que tom mais lindo!", "Ficou perfeito!", "Adorei!"],
  pulseira: ["Que pulseira fofa!", "Uau, que charme!", "Combinou muito!"],
  brinco: ["Brincos lindos!", "Que detalhe fofo!", "Amei!"],
  colar: ["Que colar mais lindo!", "Ficou chique!", "Combinou demais!"],
  oculos: ["Que óculos estilosos!", "Adorei!", "Ficou demais!"],
  extra: ["Que acessório fofo!", "Uau, que charme!", "Combinou muito!"],
  bg: ["Que cenário lindo!", "Vamos posar aqui?", "Uau!"],
  generic: ["Ficou linda!", "Uau!", "Que look!", "Adorei!"]
};

function react(slot) {
  beep(620 + Math.random() * 260, 0.1, "triangle", 0.045);
  sparkleBurst();
  if (Math.random() < 0.6) {
    const pool = MESSAGES[slot] || MESSAGES.generic;
    say(pick(pool));
  }
}

function sparkleBurst() {
  const stage = $("#stage");
  const icons = ["✨", "💖", "⭐", "🌟", "💫", "🦋"];
  for (let i = 0; i < 7; i++) {
    const s = document.createElement("span");
    s.className = "confetti";
    s.textContent = pick(icons);
    s.style.left = 30 + Math.random() * 40 + "%";
    s.style.top = 28 + Math.random() * 45 + "%";
    s.style.animationDelay = (Math.random() * 0.18).toFixed(2) + "s";
    stage.appendChild(s);
    setTimeout(() => s.remove(), 1200);
  }
}

let bubbleTimer = null;

function say(text) {
  const bubble = $("#bubble");
  bubble.textContent = text;
  bubble.classList.add("show");
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.remove("show"), 2600);
}

function hideHint() {
  $("#hint").classList.add("hide");
}

let toastTimer = null;

function toast(text) {
  const el = $("#toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

/* ---------------------------------------------------------
   Música / faixa atual
   --------------------------------------------------------- */
let npTimer = null;

function showTrack() {
  const chip = $("#now-playing");
  const title = TRACKS[state.bg]?.title || "";
  $("#np-title").textContent = title;
  if (!musicOn) {
    chip.classList.remove("show");
    return;
  }
  chip.classList.add("show");
  clearTimeout(npTimer);
  npTimer = setTimeout(() => chip.classList.remove("show"), 7000);
}

window.addEventListener("musicchange", (e) => {
  $("#np-title").textContent = e.detail.title;
  $("#now-playing").classList.add("show");
});

/* ---------------------------------------------------------
   Paleta
   --------------------------------------------------------- */
const TABS = [
  { id: "roupas", label: "👗 Roupas" },
  { id: "cabelo", label: "💇 Cabelo" },
  { id: "maquiagem", label: "💄 Maquiagem" },
  { id: "pele", label: "🤎 Pele" },
  { id: "sapatos", label: "👟 Sapatos" },
  { id: "acessorios", label: "👑 Acessórios" },
  { id: "cenario", label: "🌈 Cenário" }
];

const ACC_TABS = [
  { id: "pulseiras", label: "Pulseiras", icon: "📿", data: () => PULSEIRAS, slot: "pulseira" },
  { id: "brincos", label: "Brincos", icon: "💎", data: () => BRINCOS, slot: "brinco" },
  { id: "colares", label: "Colares", icon: "📿", data: () => COLARES, slot: "colar" },
  { id: "oculos", label: "Óculos", icon: "🕶️", data: () => OCULOS, slot: "oculos" },
  { id: "extras", label: "Extras", icon: "🎀", data: () => EXTRAS, slot: "extra" }
];

function buildTabs() {
  const nav = $("#tabs");
  nav.innerHTML = "";
  TABS.forEach((tab) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tab" + (tab.id === activeTab ? " active" : "");
    b.textContent = tab.label;
    b.addEventListener("click", () => {
      activeTab = tab.id;
      $$(".tab", nav).forEach((t) => t.classList.toggle("active", t.textContent === tab.label));
      buildSubbar();
      buildPalette();
      $("#palette").scrollTop = 0;
      beep(520, 0.06, "sine", 0.03);
    });
    nav.appendChild(b);
  });
}

function buildSubbar() {
  const bar = $("#subbar");
  if (activeTab !== "acessorios") {
    bar.hidden = true;
    bar.innerHTML = "";
    return;
  }
  bar.hidden = false;
  bar.innerHTML = "";
  ACC_TABS.forEach((sub) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "subtab" + (sub.id === accTab ? " active" : "");
    b.textContent = `${sub.icon} ${sub.label}`;
    b.addEventListener("click", () => {
      accTab = sub.id;
      $$(".subtab", bar).forEach((t) => t.classList.toggle("active", t.textContent.includes(sub.label)));
      buildPalette();
      $("#palette").scrollTop = 0;
      beep(600, 0.05, "sine", 0.03);
    });
    bar.appendChild(b);
  });
}

function makeTile(slot, id, name, vb, art) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "tile";
  b.dataset.slot = slot;
  b.dataset.id = id;
  b.innerHTML = `
    <span class="tile-art"><svg viewBox="${vb}" preserveAspectRatio="xMidYMid meet">${art}</svg></span>
    <span class="tile-label">${name}</span>`;
  b.addEventListener("click", () => {
    if (suppressClick) return;
    apply(slot, id);
  });
  attachDrag(b, slot, id);
  return b;
}

function gridOf(items, slot, artBuilder) {
  const grid = document.createElement("div");
  grid.className = "grid";
  Object.entries(items).forEach(([id, item]) => {
    grid.appendChild(makeTile(slot, id, item.name, item.vb, artBuilder(item, id)));
  });
  return grid;
}

function swatchRow(list, slot, { none = false, noneLabel = "Nenhum" } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "swatches";

  if (none) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "swatch none";
    b.dataset.slot = slot;
    b.dataset.id = "none";
    b.title = noneLabel;
    b.setAttribute("aria-label", noneLabel);
    b.textContent = "∅";
    b.addEventListener("click", () => {
      if (suppressClick) return;
      state[slot] = null;
      renderDoll();
      updateSelection();
      react("generic");
    });
    wrap.appendChild(b);
  }

  list.forEach((item) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "swatch";
    b.dataset.slot = slot;
    b.dataset.id = item.id;
    b.style.background = item.id;
    b.title = item.name;
    b.setAttribute("aria-label", item.name);
    b.addEventListener("click", () => {
      if (suppressClick) return;
      apply(slot, item.id);
    });
    wrap.appendChild(b);
  });

  return wrap;
}

function section(title, node) {
  const frag = document.createDocumentFragment();
  if (title) {
    const h = document.createElement("div");
    h.className = "section-title";
    h.textContent = title;
    frag.appendChild(h);
  }
  frag.appendChild(node);
  return frag;
}

const hairPreview = (item) =>
  `${item.back(state.hairColor)}<circle cx="160" cy="150" r="78" fill="${state.skin}" opacity=".4"/>${item.front(state.hairColor)}`;

function buildPalette() {
  const p = $("#palette");
  p.innerHTML = "";

  if (activeTab === "roupas") {
    p.appendChild(section(`Vestidos (${Object.keys(DRESSES).length})`, gridOf(DRESSES, "dress", (it) => it.art())));
    p.appendChild(section(`Partes de cima (${Object.keys(TOPS).length})`, gridOf(TOPS, "top", (it) => it.art())));
    p.appendChild(section(`Partes de baixo (${Object.keys(BOTTOMS).length})`, gridOf(BOTTOMS, "bottom", (it) => it.art())));
  }

  if (activeTab === "cabelo") {
    p.appendChild(section(`Penteados (${Object.keys(HAIR).length})`, gridOf(HAIR, "hair", (it) => hairPreview(it))));
    p.appendChild(section("Cor do cabelo", swatchRow(HAIR_COLORS, "haircolor")));
  }

  if (activeTab === "maquiagem") {
    p.appendChild(section("Batom", swatchRow(LIPS, "lip")));
    p.appendChild(section("Blush", swatchRow(BLUSHES, "blush", { none: true, noneLabel: "Sem blush" })));
    p.appendChild(section("Sombra", swatchRow(SHADOWS, "shadow", { none: true, noneLabel: "Sem sombra" })));
    p.appendChild(section("Cor dos olhos", swatchRow(EYES, "eye")));
  }

  if (activeTab === "pele") {
    p.appendChild(section("Tom de pele", swatchRow(SKINS, "skin")));
  }

  if (activeTab === "sapatos") {
    p.appendChild(section(`Calçados (${Object.keys(SHOES).length})`, gridOf(SHOES, "shoe", (it) => it.art())));
  }

  if (activeTab === "acessorios") {
    const sub = ACC_TABS.find((s) => s.id === accTab) || ACC_TABS[0];
    const data = sub.data();
    p.appendChild(section(`${sub.icon} ${sub.label} (${Object.keys(data).length})`, gridOf(data, sub.slot, (it) => it.art())));
    if (sub.id === "extras") {
      const tip = document.createElement("p");
      tip.className = "tip";
      tip.textContent = "Pode combinar vários extras de uma vez! 💕";
      p.appendChild(tip);
    }
  }

  if (activeTab === "cenario") {
    const grid = document.createElement("div");
    grid.className = "grid";
    Object.entries(SCENES).forEach(([id, item]) => {
      grid.appendChild(makeTile("bg", id, item.name, "0 0 320 560", item.art()));
    });
    p.appendChild(section(`Cenários (${Object.keys(SCENES).length})`, grid));
    const tip = document.createElement("p");
    tip.className = "tip";
    tip.textContent = "Cada cenário tem a sua própria música 🎵 (use o botão 🎵 para pausar)";
    p.appendChild(tip);
  }

  updateSelection();
}

/* ---------------------------------------------------------
   Arrastar e soltar
   --------------------------------------------------------- */
let drag = null;

function attachDrag(el, slot, id) {
  el.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.pointerType && e.pointerType !== "mouse") return;
    drag = { el, slot, id, startX: e.clientX, startY: e.clientY, active: false, ghost: null };
  });
}

function isOverStage(x, y) {
  const r = $("#stage").getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function makeGhost(el, x, y) {
  const svg = el.querySelector("svg");
  const div = document.createElement("div");
  div.className = "ghost";
  if (svg) div.innerHTML = svg.outerHTML;
  div.style.left = x + "px";
  div.style.top = y + "px";
  document.body.appendChild(div);
  return div;
}

window.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
  if (!drag.active && dist > 10) {
    drag.active = true;
    drag.ghost = makeGhost(drag.el, e.clientX, e.clientY);
    $("#stage").classList.add("drop-ready");
  }
  if (drag.active && drag.ghost) {
    drag.ghost.style.left = e.clientX + "px";
    drag.ghost.style.top = e.clientY + "px";
    $("#stage").classList.toggle("over", isOverStage(e.clientX, e.clientY));
  }
});

function endDrag(e) {
  if (!drag) return;
  if (drag.active) {
    const dropped = isOverStage(e.clientX, e.clientY);
    if (drag.ghost) drag.ghost.remove();
    $("#stage").classList.remove("drop-ready", "over");
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 60);
    if (dropped) {
      apply(drag.slot, drag.id);
      hideHint();
      chime();
    }
  }
  drag = null;
}

window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", () => {
  if (drag && drag.ghost) drag.ghost.remove();
  if (drag) $("#stage").classList.remove("drop-ready", "over");
  drag = null;
});

/* ---------------------------------------------------------
   Botões
   --------------------------------------------------------- */
function surprise() {
  const useDress = Math.random() < 0.4;
  const acc = { pulseira: null, brinco: null, colar: null, oculos: null, extras: [] };
  if (Math.random() < 0.6) acc.pulseira = pick(Object.keys(PULSEIRAS));
  if (Math.random() < 0.6) acc.brinco = pick(Object.keys(BRINCOS));
  if (Math.random() < 0.5) acc.colar = pick(Object.keys(COLARES));
  if (Math.random() < 0.35) acc.oculos = pick(Object.keys(OCULOS));
  if (Math.random() < 0.35) acc.extras = [pick(Object.keys(EXTRAS))];

  state = {
    skin: pick(SKINS).id,
    hair: pick(Object.keys(HAIR)),
    hairColor: pick(HAIR_COLORS).id,
    eye: pick(EYES).id,
    lip: pick(LIPS).id,
    blush: pick(BLUSHES).id,
    shadow: Math.random() < 0.6 ? pick(SHADOWS).id : null,
    top: useDress ? null : pick(Object.keys(TOPS)),
    bottom: useDress ? null : pick(Object.keys(BOTTOMS)),
    dress: useDress ? pick(Object.keys(DRESSES)) : null,
    shoe: pick(Object.keys(SHOES)),
    acc,
    bg: pick(Object.keys(SCENES))
  };

  renderDoll();
  buildPalette();
  buildSubbar();
  if (started && musicOn) Music.start(state.bg);
  showTrack();
  chime();
  sparkleBurst();
  say("Surpresa! Gostou do look? 💫");
  hideHint();
}

function clearAll() {
  state = defaults();
  renderDoll();
  buildPalette();
  buildSubbar();
  if (started && musicOn) Music.start(state.bg);
  showTrack();
  beep(440, 0.12, "sine", 0.04);
  beep(330, 0.16, "sine", 0.04, 0.1);
  say("Tudo limpinho! Vamos começar de novo? 🧼");
  hideHint();
}

function downloadLook(blob) {
  if (!blob) {
    toast("Não consegui salvar 😢");
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "lulu-" + Date.now() + ".png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast("Foto salva! 💾");
  chime();
  say("Sorria! 📸");
}

function savePhoto() {
  if (studio && studioActive) {
    studio.capture().then(downloadLook).catch(() => downloadLook(null));
    return;
  }
  const svg = $("#doll");
  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", "640");
  clone.setAttribute("height", "1120");

  const data = new XMLSerializer().serializeToString(clone);
  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(data);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 1120;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(downloadLook, "image/png");
  };
  img.onerror = () => toast("Não consegui salvar 😢");
  img.src = url;
}

function toggleSound() {
  soundOn = !soundOn;
  const btn = $("#btn-sound");
  btn.classList.toggle("on", soundOn);
  btn.classList.toggle("off", !soundOn);
  btn.setAttribute("aria-pressed", String(soundOn));
  btn.textContent = soundOn ? "🔊" : "🔇";
  if (soundOn) chime();
}

function toggleMusic() {
  musicOn = !musicOn;
  const btn = $("#btn-music");
  btn.classList.toggle("on", musicOn);
  btn.classList.toggle("off", !musicOn);
  btn.setAttribute("aria-pressed", String(musicOn));
  btn.title = musicOn ? "Pausar a música" : "Tocar a música";
  if (musicOn) {
    Music.start(state.bg);
    showTrack();
  } else {
    Music.stop();
    $("#now-playing").classList.remove("show");
    toast("Música pausada 🎵");
  }
}

/* ---------------------------------------------------------
   Início
   --------------------------------------------------------- */
buildTabs();
buildSubbar();
buildPalette();
renderDoll();
updateSelection();

$("#btn-random").addEventListener("click", surprise);
$("#btn-clear").addEventListener("click", clearAll);
$("#btn-save").addEventListener("click", savePhoto);
$("#btn-sound").addEventListener("click", toggleSound);
$("#btn-music").addEventListener("click", toggleMusic);

function tapLulu() {
  if (Math.random() < 0.5) {
    beep(700, 0.07, "sine", 0.03);
    say(pick(["Hehe, cócegas!", "Oi, eu sou a Lulu!", "Vamos brincar mais?", "Você é demais!"]));
  }
}
$("#doll").addEventListener("click", tapLulu);

async function loadStudio() {
  if (studio || studioLoading || location.protocol === "file:") return;
  studioLoading = true;
  try {
    const { mountStudio } = await import("./assets/studio.bundle.js");
    studio = await mountStudio($("#stage"), {
      hair: HAIR, tops: TOPS, bottoms: BOTTOMS, dresses: DRESSES, shoes: SHOES,
      bracelets: PULSEIRAS, necklaces: COLARES, earrings: BRINCOS, glasses: OCULOS, scenes: SCENES
    }, tapLulu, state);
    studio.update(state);
    $("#studio-tools").hidden = false;
    $("#stage-label").hidden = false;
    $("#btn-view").hidden = false;
    $("#hint").textContent = "Arraste para girar a Lulu";
  } catch (error) {
    console.warn("O ateliê 3D não pôde ser carregado.", error);
    toast("O modo clássico está pronto para brincar.");
  } finally {
    studioLoading = false;
  }
}

$("#btn-view").addEventListener("click", () => {
  studioActive = !studioActive;
  studio.setActive(studioActive);
  $("#btn-view").textContent = studioActive ? "Clássico" : "Voltar ao 3D";
  $("#studio-tools").hidden = !studioActive;
  $("#stage-label").hidden = !studioActive;
  $("#hint").textContent = studioActive ? "Arraste para girar a Lulu" : "Toque nas roupinhas para vestir 👆";
});
$("#btn-turn").addEventListener("click", () => studio.rotate(Math.PI / 4));
$("#btn-close").addEventListener("click", event => {
  const button = event.currentTarget;
  const close = button.getAttribute("aria-pressed") === "false";
  button.setAttribute("aria-pressed", String(close));
  studio.frame(close);
});

$("#btn-start").addEventListener("click", () => {
  if (started) return;
  started = true;
  loadStudio();
  $("#welcome").classList.add("hidden");
  $("#app").removeAttribute("aria-hidden");
  audioCtx();
  if (musicOn) {
    Music.start(state.bg);
    showTrack();
  }
  setTimeout(() => hideHint(), 9000);
  beep(880, 0.12, "triangle", 0.05);
  beep(1180, 0.2, "triangle", 0.04, 0.1);
  say("Oi! Escolha um look bem lindo! 💕");
});

$("#welcome").addEventListener("keydown", (e) => {
  if (e.key === "Enter") $("#btn-start").click();
});

setTimeout(() => $("#btn-start").focus(), 400);
