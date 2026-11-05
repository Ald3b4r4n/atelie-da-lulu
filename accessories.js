"use strict";

/* =========================================================
   ACESSÓRIOS
   Pulseiras (15) · Brincos (15) · Colares (15) · Óculos (15)
   + extras (laço, tiara, chapéu, orelhas)
   ========================================================= */

const beadedBand = (colors, cy = 363, rx = 11) =>
  colors
    .map((c, i) => {
      const x = 96 - rx + (i * (rx * 2)) / (colors.length - 1 || 1);
      return `<circle cx="${x.toFixed(1)}" cy="${cy}" r="2.7" fill="${c}"/>`;
    })
    .join("");

const PULSEIRAS = {
  micangas: {
    name: "Miçangas",
    vb: "78 350 40 34",
    art: () => both(`<g>${beadedBand(["#FF6FA5", "#FFD166", "#7FDBFF", "#8AE6A1", "#C9A7F5"])}</g>`)
  },
  dourada: {
    name: "Dourada",
    vb: "78 350 40 34",
    art: () => both(`<g><ellipse cx="96" cy="363" rx="11" ry="3.6" fill="none" stroke="#E9C46A" stroke-width="3"/><path d="M89,360 C92,358 96,358 99,359" stroke="#FFF1B8" stroke-width="1.6" fill="none"/></g>`)
  },
  coracao: {
    name: "Coração",
    vb: "76 348 44 44",
    art: () => both(`<g><ellipse cx="96" cy="362" rx="11" ry="3.6" fill="none" stroke="#FF6FA5" stroke-width="3"/>${heart(84, 366, 0.5, "#FF6FA5")}</g>`)
  },
  estrela: {
    name: "Estrela",
    vb: "76 348 44 44",
    art: () => both(`<g><ellipse cx="96" cy="362" rx="11" ry="3.6" fill="none" stroke="#C77DFF" stroke-width="3"/>${star(84, 367, 0.55, "#FFE066")}</g>`)
  },
  perolas: {
    name: "Pérolas",
    vb: "78 350 40 34",
    art: () => both(`<g>${beadedBand(["#FFF7FA", "#F3E6EE", "#FFF7FA", "#EFE0EA", "#FFF7FA"], 363, 11)}
      <circle cx="84" cy="368" r="3" fill="#FFF7FA" stroke="#E3D3E0" stroke-width="1"/></g>`)
  },
  flor: {
    name: "Flor",
    vb: "76 348 44 44",
    art: () => both(`<g><ellipse cx="96" cy="362" rx="11" ry="3.6" fill="none" stroke="#8AE6A1" stroke-width="3"/>${flower(84, 369, 0.55, "#FF9EC4", "#FFE066")}</g>`)
  },
  arcoIris: {
    name: "Arco-íris",
    vb: "78 348 40 40",
    art: () => both(`<g>
      <ellipse cx="96" cy="360" rx="11" ry="3.4" fill="none" stroke="#FF6FA5" stroke-width="2.6"/>
      <ellipse cx="96" cy="363.5" rx="11" ry="3.4" fill="none" stroke="#FFD166" stroke-width="2.6"/>
      <ellipse cx="96" cy="367" rx="11" ry="3.4" fill="none" stroke="#7FDBFF" stroke-width="2.6"/>
    </g>`)
  },
  laco: {
    name: "Laço",
    vb: "76 348 44 44",
    art: () => both(`<g><ellipse cx="96" cy="362" rx="11" ry="3.6" fill="none" stroke="#FF9EC4" stroke-width="3"/>${bow(84, 369, 0.5, "#FF6FA5", "#fff")}</g>`)
  },
  relogio: {
    name: "Relógio",
    vb: "74 346 48 48",
    art: () => both(`<g><ellipse cx="96" cy="361" rx="11" ry="3.4" fill="none" stroke="#B5793F" stroke-width="3"/>
      <circle cx="84" cy="369" r="6" fill="#FFF6EC" stroke="#B5793F" stroke-width="2"/>
      <path d="M84,369 L84,365.5 M84,369 L87,370" stroke="#5B3A24" stroke-width="1.3" stroke-linecap="round"/></g>`)
  },
  couro: {
    name: "De couro",
    vb: "78 350 40 34",
    art: () => both(`<g><ellipse cx="96" cy="363" rx="11.5" ry="4" fill="none" stroke="#8E5A2C" stroke-width="4.5"/>
      <rect x="103" y="361" width="5" height="5" rx="1" fill="#E9C46A"/></g>`)
  },
  conchas: {
    name: "Conchas",
    vb: "76 348 44 40",
    art: () => both(`<g><ellipse cx="96" cy="362" rx="11" ry="3.6" fill="none" stroke="#FFD9B0" stroke-width="3"/>
      <path d="M84,369 C79,365 79,361 84,361 C89,361 89,365 84,369 Z" fill="#FFE6C7" stroke="#E9B98C" stroke-width="1"/></g>`)
  },
  cristal: {
    name: "Cristal",
    vb: "76 348 44 44",
    art: () => both(`<g><ellipse cx="96" cy="362" rx="11" ry="3.6" fill="none" stroke="#7FDBFF" stroke-width="3"/>
      <path d="M84,364 L89,369 L84,376 L79,369 Z" fill="#B8ECFF" stroke="#5FB8E0" stroke-width="1"/></g>`)
  },
  corrente: {
    name: "Corrente",
    vb: "78 350 40 34",
    art: () => both(`<g>${[0, 1, 2, 3, 4].map((i) => `<circle cx="${86 + i * 5}" cy="363" r="2.6" fill="none" stroke="#E9C46A" stroke-width="1.6"/>`).join("")}</g>`)
  },
  neon: {
    name: "Neon",
    vb: "78 348 40 36",
    art: () => both(`<g><ellipse cx="96" cy="363" rx="11" ry="4" fill="none" stroke="#8AE6A1" stroke-width="6" opacity=".35"/>
      <ellipse cx="96" cy="363" rx="11" ry="4" fill="none" stroke="#5FD3A0" stroke-width="2.6"/></g>`)
  },
  flores: {
    name: "Flores",
    vb: "76 346 44 46",
    art: () => both(`<g><ellipse cx="96" cy="362" rx="11" ry="3.6" fill="none" stroke="#FFB3CF" stroke-width="3"/>
      ${flower(82, 368, 0.4, "#FF6FA5", "#FFE066")}
      ${flower(88, 372, 0.36, "#C9A7F5", "#FFE066")}
      ${flower(94, 373, 0.32, "#FFD166", "#FF6FA5")}</g>`)
  }
};

/* ---------------- brincos ---------------- */
const stud = (color = "#E9C46A") =>
  `<circle cx="84" cy="166" r="2.6" fill="${color}"/><circle cx="83" cy="165" r="1" fill="rgba(255,255,255,.8)"/>`;

const BRINCOS = {
  bolinha: {
    name: "Bolinha",
    vb: "68 152 32 40",
    art: () => both(`<g>${stud()}<circle cx="84" cy="174" r="5" fill="#E9C46A"/><circle cx="82" cy="172" r="1.6" fill="#FFF1B8"/></g>`)
  },
  argola: {
    name: "Argola",
    vb: "66 150 36 46",
    art: () => both(`<g>${stud()}<circle cx="84" cy="176" r="7.5" fill="none" stroke="#E9C46A" stroke-width="2.6"/></g>`)
  },
  estrela: {
    name: "Estrela",
    vb: "66 150 36 46",
    art: () => both(`<g>${stud()}<path d="M84,166 L84,170" stroke="#E9C46A" stroke-width="2"/>${star(84, 177, 0.6, "#FFE066")}</g>`)
  },
  coracao: {
    name: "Coração",
    vb: "66 150 36 46",
    art: () => both(`<g>${stud("#FF6FA5")}${heart(84, 170, 0.55, "#FF6FA5")}</g>`)
  },
  flor: {
    name: "Flor",
    vb: "64 150 40 46",
    art: () => both(`<g>${stud()}<path d="M84,166 L84,170" stroke="#8AE6A1" stroke-width="2"/>${flower(84, 177, 0.62, "#FF9EC4", "#FFE066")}</g>`)
  },
  perola: {
    name: "Pérola",
    vb: "68 152 32 42",
    art: () => both(`<g>${stud("#D8C0CE")}<circle cx="84" cy="175" r="5.5" fill="#FFF7FA" stroke="#C9AEC0" stroke-width="1.4"/><circle cx="82" cy="173" r="1.6" fill="#fff"/></g>`)
  },
  gota: {
    name: "Gota",
    vb: "66 150 36 48",
    art: () => both(`<g>${stud("#C9A7F5")}<path d="M84,168 C78,176 78,182 84,183 C90,182 90,176 84,168 Z" fill="#C9A7F5"/><ellipse cx="82" cy="177" rx="1.4" ry="2" fill="#fff" opacity=".6"/></g>`)
  },
  laco: {
    name: "Laço",
    vb: "64 150 40 44",
    art: () => both(`<g>${stud("#FF6FA5")}${bow(84, 174, 0.5, "#FF6FA5", "#fff")}</g>`)
  },
  lua: {
    name: "Lua",
    vb: "64 150 40 48",
    art: () => both(`<g>${stud("#FFD166")}<path d="M88,170 a8,8 0 1,0 5,13 a9,9 0 1,1 -5,-13 Z" fill="#FFE066"/></g>`)
  },
  sol: {
    name: "Sol",
    vb: "62 150 44 46",
    art: () => both(`<g>${stud("#E9C46A")}<circle cx="84" cy="176" r="5" fill="#FFE066"/>
      <g stroke="#E9C46A" stroke-width="1.8" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const rad = (a * Math.PI) / 180; return `<path d="M${(84 + Math.cos(rad) * 7).toFixed(1)},${(176 + Math.sin(rad) * 7).toFixed(1)} L${(84 + Math.cos(rad) * 10).toFixed(1)},${(176 + Math.sin(rad) * 10).toFixed(1)}"/>`; }).join("")}</g></g>`)
  },
  borboleta: {
    name: "Borboleta",
    vb: "62 148 44 50",
    art: () => both(`<g>${stud("#B8E6FF")}<path d="M84,166 L84,172" stroke="#9AA7C7" stroke-width="2"/>${butterfly(84, 177, 0.6, "#B8E6FF", "#FFB3D9")}</g>`)
  },
  cristal: {
    name: "Cristal",
    vb: "64 150 40 48",
    art: () => both(`<g>${stud("#7FDBFF")}<path d="M84,168 L90,176 L84,185 L78,176 Z" fill="#B8ECFF" stroke="#5FB8E0" stroke-width="1"/><path d="M84,172 L84,182" stroke="#fff" stroke-width="1" opacity=".7"/></g>`)
  },
  argolaDupla: {
    name: "Argola dupla",
    vb: "62 148 44 52",
    art: () => both(`<g>${stud()}<circle cx="84" cy="173" r="6" fill="none" stroke="#E9C46A" stroke-width="2"/>
      <circle cx="84" cy="182" r="5" fill="none" stroke="#E9C46A" stroke-width="2"/></g>`)
  },
  cereja: {
    name: "Cerejinha",
    vb: "62 150 44 50",
    art: () => both(`<g>${stud("#8AE6A1")}<path d="M84,166 C82,172 80,176 80,180" stroke="#5FA86F" stroke-width="2" fill="none"/>
      <circle cx="79" cy="182" r="4.5" fill="#FF5C7A"/><circle cx="87" cy="184" r="4" fill="#FF5C7A"/></g>`)
  },
  concha: {
    name: "Conchinha",
    vb: "64 150 40 46",
    art: () => both(`<g>${stud("#FFD9B0")}<path d="M84,169 C77,169 74,175 78,181 C81,185 87,185 90,181 C94,175 91,169 84,169 Z" fill="#FFE6C7" stroke="#E9B98C" stroke-width="1.2"/><path d="M84,170 L84,183 M79,172 L81,182 M89,172 L87,182" stroke="#E9B98C" stroke-width="1"/></g>`)
  }
};

/* ---------------- colares ---------------- */
const chain = (color, w = 2.4) => `<path d="M134,257 C141,273 179,273 186,257" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;

const COLARES = {
  perolas: {
    name: "Pérolas",
    vb: "120 244 80 56",
    art: () => `<g>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
      const t = i / 8;
      const x = 134 + t * 52;
      const y = 257 + Math.sin(t * Math.PI) * 16;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="#FFF7FA" stroke="#E3D3E0" stroke-width="1"/>`;
    }).join("")}</g>`
  },
  coracao: {
    name: "Coração",
    vb: "120 244 80 56",
    art: () => `<g>${chain("#E9C46A")}${heart(160, 270, 0.7, "#FF5C9F")}</g>`
  },
  estrela: {
    name: "Estrela",
    vb: "120 244 80 56",
    art: () => `<g>${chain("#E9C46A")}${star(160, 278, 0.8, "#FFE066")}</g>`
  },
  lua: {
    name: "Lua",
    vb: "120 244 80 56",
    art: () => `<g>${chain("#C9A7F5")}<path d="M165,268 a8,8 0 1,0 5,13 a9,9 0 1,1 -5,-13 Z" fill="#FFE066"/></g>`
  },
  flor: {
    name: "Flor",
    vb: "120 244 80 56",
    art: () => `<g>${chain("#8AE6A1")}${flower(160, 274, 0.85, "#FF9EC4", "#FFE066")}</g>`
  },
  borboleta: {
    name: "Borboleta",
    vb: "118 242 84 60",
    art: () => `<g>${chain("#C9A7F5")}<path d="M160,268 L160,274" stroke="#9AA7C7" stroke-width="2"/>${butterfly(160, 280, 0.8, "#B8E6FF", "#FFB3D9")}</g>`
  },
  choker: {
    name: "Gargantilha",
    vb: "124 246 72 34",
    art: () => `<g><path d="M136,258 C144,266 176,266 184,258" stroke="#3B3B4F" stroke-width="5" fill="none" stroke-linecap="round"/>${heart(160, 260, 0.45, "#FF5C9F")}</g>`
  },
  corrente: {
    name: "Corrente",
    vb: "120 244 80 52",
    art: () => `<g>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
      const t = i / 9;
      const x = 134 + t * 52;
      const y = 257 + Math.sin(t * Math.PI) * 16;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="none" stroke="#E9C46A" stroke-width="1.6"/>`;
    }).join("")}</g>`
  },
  cristal: {
    name: "Cristal",
    vb: "120 244 80 58",
    art: () => `<g>${chain("#7FDBFF")}<path d="M160,268 L167,276 L160,287 L153,276 Z" fill="#B8ECFF" stroke="#5FB8E0" stroke-width="1.2"/><path d="M160,272 L160,284" stroke="#fff" stroke-width="1.2" opacity=".8"/></g>`
  },
  concha: {
    name: "Concha",
    vb: "120 244 80 56",
    art: () => `<g>${chain("#FFD9B0")}<path d="M160,268 C152,268 149,275 154,282 C157,286 163,286 166,282 C171,275 168,268 160,268 Z" fill="#FFE6C7" stroke="#E9B98C" stroke-width="1.2"/><path d="M160,269 L160,284 M155,271 L157,282 M165,271 L163,282" stroke="#E9B98C" stroke-width="1"/></g>`
  },
  letraL: {
    name: "Letra L",
    vb: "120 244 80 56",
    art: () => `<g>${chain("#E9C46A")}<circle cx="160" cy="274" r="9" fill="#FFF6EC" stroke="#E9C46A" stroke-width="2"/><path d="M157,268 L157,279 L164,279" stroke="#C94F8B" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`
  },
  arcoIris: {
    name: "Arco-íris",
    vb: "120 244 80 56",
    art: () => `<g>${chain("#FF9EC4")}<path d="M148,282 A12,12 0 0,1 172,282" stroke="#FF6FA5" stroke-width="4" fill="none"/><path d="M151,282 A9,9 0 0,1 169,282" stroke="#FFD166" stroke-width="4" fill="none"/><path d="M154,282 A6,6 0 0,1 166,282" stroke="#7FDBFF" stroke-width="4" fill="none"/></g>`
  },
  cereja: {
    name: "Cerejas",
    vb: "120 244 80 56",
    art: () => `<g>${chain("#8AE6A1")}<path d="M160,272 C156,278 152,282 150,286 M160,272 C164,278 168,282 170,286" stroke="#5FA86F" stroke-width="2" fill="none"/><circle cx="149" cy="288" r="4.5" fill="#FF5C7A"/><circle cx="171" cy="288" r="4.5" fill="#FF5C7A"/></g>`
  },
  doisCoracoes: {
    name: "Dois corações",
    vb: "120 244 80 60",
    art: () => `<g>${chain("#FF9EC4")}${heart(152, 270, 0.5, "#FF5C9F")}${heart(168, 276, 0.5, "#FF8FBF")}</g>`
  },
  gota: {
    name: "Gota",
    vb: "120 244 80 58",
    art: () => `<g>${chain("#C9A7F5")}<path d="M160,268 C153,277 153,285 160,286 C167,285 167,277 160,268 Z" fill="#C9A7F5"/><ellipse cx="157" cy="279" rx="1.8" ry="2.6" fill="#fff" opacity=".55"/></g>`
  }
};

/* ---------------- óculos ---------------- */
const lensFrame = (stroke, fill = "rgba(255,255,255,0)") =>
  `<circle cx="137" cy="156" r="23" fill="${fill}" stroke="${stroke}" stroke-width="4"/>`;

const temples = (color, w = 4) =>
  `<path d="M114,152 L98,148 M206,152 L222,148" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;

const OCULOS = {
  redondo: {
    name: "Redondo",
    vb: "96 118 128 76",
    art: () => `${both(lensFrame("#3B3B4F", "rgba(180,230,255,.28)"))}${temples("#3B3B4F")}`
  },
  sol: {
    name: "Óculos de sol",
    vb: "96 118 128 76",
    art: () => `${both(lensFrame("#2F2F40", "rgba(50,50,70,.6)"))}${temples("#2F2F40", 5)}`
  },
  coracao: {
    name: "Coração",
    vb: "96 112 128 86",
    art: () => `${both(`<path d="${HEART_PATH}" transform="translate(137 146) scale(2.1)" fill="rgba(255,182,213,.4)" stroke="#FF5C9F" stroke-width="2.4"/>`)}${temples("#FF5C9F")}`
  },
  estrela: {
    name: "Estrela",
    vb: "96 108 128 94",
    art: () => `${both(`<path d="${STAR_PATH}" transform="translate(137 158) scale(2.5)" fill="rgba(255,241,184,.45)" stroke="#E9C46A" stroke-width="2"/>`)}${temples("#E9C46A")}`
  },
  gatinho: {
    name: "Gatinho",
    vb: "96 118 128 76",
    art: () => `${both(`<path d="M114,160 C114,140 128,132 140,136 C154,140 158,150 160,158 C154,170 138,176 126,170 C118,166 114,164 114,160 Z" fill="rgba(255,255,255,.25)" stroke="#3B3B4F" stroke-width="3.6"/>`)}${temples("#3B3B4F")}${both(`<path d="M151,134 L156,128" stroke="#3B3B4F" stroke-width="3" stroke-linecap="round"/>`)}`
  },
  dourado: {
    name: "Dourado",
    vb: "96 118 128 76",
    art: () => `${both(lensFrame("#D4A93C", "rgba(255,241,184,.18)"))}${temples("#D4A93C", 2.6)}${both(`<circle cx="137" cy="156" r="26" fill="none" stroke="#FFF1B8" stroke-width="1"/>`)}`
  },
  quadrado: {
    name: "Quadrado",
    vb: "96 118 128 76",
    art: () => `${both(`<rect x="112" y="132" width="50" height="44" rx="10" fill="rgba(200,240,255,.25)" stroke="#5C6BC0" stroke-width="4"/>`)}<path d="M160,150 L162,150" stroke="#5C6BC0" stroke-width="4"/>${temples("#5C6BC0")}`
  },
  arcoIris: {
    name: "Arco-íris",
    vb: "96 118 128 76",
    art: () => `${both(`<circle cx="137" cy="156" r="23" fill="rgba(255,255,255,.2)" stroke="#FF6FA5" stroke-width="5"/><path d="M116,146 A23,23 0 0,1 158,146" stroke="#FFD166" stroke-width="2.4" fill="none"/><path d="M116,140 A23,23 0 0,1 158,140" stroke="#7FDBFF" stroke-width="2.4" fill="none"/>`)}${temples("#FF6FA5", 3)}`
  },
  mascara: {
    name: "Máscara de festa",
    vb: "94 116 132 82",
    art: () => `${both(`<path d="M112,148 C112,132 130,128 141,136 C150,142 152,152 152,162 C144,172 124,174 114,164 C112,158 112,152 112,148 Z" fill="rgba(199,125,255,.35)" stroke="#B45CFF" stroke-width="3"/>`)}${temples("#B45CFF")}${star(104, 132, 0.4, "#FFE066")}${star(216, 132, 0.4, "#FFE066")}`
  },
  praia: {
    name: "Óculos de praia",
    vb: "96 118 128 76",
    art: () => `${both(lensFrame("#FFFFFF", "rgba(255,255,255,.2)"))}${temples("#FFFFFF", 5)}`
  },
  magico: {
    name: "Óculos mágico",
    vb: "96 116 128 80",
    art: () => `${both(lensFrame("#7FDBFF", "rgba(180,236,255,.3)"))}${temples("#7FDBFF", 3)}${star(112, 132, 0.45, "#FFE066")}${star(208, 134, 0.35, "#FFE066")}${star(160, 122, 0.3, "#fff")}`
  },
  solRosa: {
    name: "Sol rosa",
    vb: "96 118 128 76",
    art: () => `${both(lensFrame("#FF6FA5", "rgba(255,143,177,.5)"))}${temples("#FF6FA5", 4.5)}${both(`<path d="M124,144 L132,140" stroke="#FFC2DC" stroke-width="3" stroke-linecap="round"/>`)}`
  },
  redondoAzul: {
    name: "Redondo azul",
    vb: "96 118 128 76",
    art: () => `${both(lensFrame("#5C8DF0", "rgba(180,220,255,.35)"))}${temples("#5C8DF0", 3.4)}`
  },
  aviador: {
    name: "Aviador",
    vb: "94 118 132 76",
    art: () => `${both(`<path d="M112,150 C112,136 126,132 137,136 C148,140 152,150 152,160 C144,170 126,172 116,162 C112,158 112,154 112,150 Z" fill="rgba(90,120,80,.4)" stroke="#C9A45C" stroke-width="3.2"/>`)}${temples("#C9A45C", 3)}`
  },
  flor: {
    name: "Óculos de flor",
    vb: "96 116 128 80",
    art: () => `${both(lensFrame("#FF9EC4", "rgba(255,214,232,.35)"))}${temples("#FF9EC4", 3)}${flower(110, 136, 0.7, "#FF6FA5", "#FFE066")}${flower(210, 136, 0.7, "#FF6FA5", "#FFE066")}`
  }
};

/* ---------------- extras ---------------- */
const EXTRAS = {
  laco: {
    name: "Laço",
    vb: "176 34 100 104",
    art: () => `${bow(224, 88, 1.05, "#FF6FA5", "#FF9EC4")}`
  },
  tiara: {
    name: "Tiara",
    vb: "96 28 128 72",
    art: () => `<path d="M112,86 L124,50 L146,74 L160,40 L174,74 L196,50 L208,86 Z" fill="#FFD166" stroke="#E0A800" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="160" cy="62" r="5" fill="#FF6FA5"/><circle cx="132" cy="74" r="4" fill="#7FDBFF"/><circle cx="188" cy="74" r="4" fill="#7FDBFF"/>`
  },
  chapeu: {
    name: "Chapéu",
    vb: "54 34 212 80",
    art: () => `<ellipse cx="160" cy="86" rx="96" ry="20" fill="#FFE066"/>
      <path d="M112,86 C112,48 208,48 208,86 Z" fill="#FFD166"/>
      <path d="M112,82 C130,92 190,92 208,82 L208,88 C190,98 130,98 112,88 Z" fill="#FF6FA5"/>`
  },
  orelhas: {
    name: "Orelhas de gato",
    vb: "56 26 208 108",
    art: () => both(`<path d="M98,114 L84,42 L148,80 Z" fill="#4B3F5E"/><path d="M102,102 L94,60 L134,82 Z" fill="#FF9EC4"/>`)
  }
};
