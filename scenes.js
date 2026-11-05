"use strict";

/* =========================================================
   CENÁRIOS (20)
   ========================================================= */
const cloud = (x, y, s, color = "#fff", opacity = 0.92) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="${color}" opacity="${opacity}">
    <ellipse cx="0" cy="0" rx="34" ry="17"/><ellipse cx="22" cy="-6" rx="24" ry="16"/>
    <ellipse cx="-24" cy="-2" rx="22" ry="14"/>
  </g>`;

const pine = (x, y, s, color = "#4E9E6A", trunk = "#8B5A2B") =>
  `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-5" y="32" width="10" height="26" rx="3" fill="${trunk}"/>
    <path d="M0,-42 L34,10 L-34,10 Z" fill="${color}"/>
    <path d="M0,-18 L40,38 L-40,38 Z" fill="${color}" opacity=".92"/>
  </g>`;

const fish = (x, y, s, color = "#FFB3D9", dir = 1) =>
  `<g transform="translate(${x} ${y}) scale(${dir * s} ${s})">
    <ellipse cx="0" cy="0" rx="13" ry="8" fill="${color}"/>
    <path d="M-11,0 L-20,-7 L-20,7 Z" fill="${color}"/>
    <circle cx="6" cy="-2" r="1.6" fill="#3B2B45"/>
  </g>`;

const SCENES = {
  quarto: {
    name: "Quarto",
    art: () => `
      <rect width="320" height="560" fill="#FFE6F2"/>
      <rect y="438" width="320" height="122" fill="#F8CBE0"/>
      <g fill="#FFC6DE" opacity=".8">
        <circle cx="40" cy="70" r="9"/><circle cx="110" cy="120" r="5"/><circle cx="270" cy="80" r="8"/>
        <circle cx="230" cy="190" r="5"/><circle cx="60" cy="230" r="7"/><circle cx="300" cy="260" r="6"/>
        <circle cx="160" cy="220" r="4"/><circle cx="100" cy="330" r="6"/><circle cx="240" cy="340" r="5"/>
      </g>
      <ellipse cx="160" cy="506" rx="118" ry="28" fill="#F3A9C9" opacity=".55"/>
      <ellipse cx="160" cy="506" rx="86" ry="18" fill="#FFC6DE" opacity=".8"/>`
  },

  praia: {
    name: "Praia",
    art: () => `
      <rect width="320" height="560" fill="#BFEBFF"/>
      <circle cx="58" cy="70" r="34" fill="#FFE066"/>
      ${cloud(150, 84, 0.8)}
      <rect y="250" width="320" height="150" fill="#63C7E8"/>
      <rect y="248" width="320" height="7" fill="#fff" opacity=".7"/>
      <path d="M20,300 q22,-16 44,0 q22,-16 44,0 q22,-16 44,0 q22,-16 44,0 q22,-16 44,0 q22,-16 44,0" stroke="#fff" stroke-width="5" fill="none" opacity=".55"/>
      <rect y="396" width="320" height="164" fill="#F7E3B5"/>
      <ellipse cx="160" cy="500" rx="120" ry="20" fill="#E9D09A" opacity=".7"/>`
  },

  jardim: {
    name: "Jardim",
    art: () => `
      <rect width="320" height="560" fill="#CDEFFF"/>
      <circle cx="266" cy="64" r="30" fill="#FFE066"/>
      ${cloud(96, 78, 0.75)}
      <rect y="380" width="320" height="180" fill="#9BE08E"/>
      <path d="M0,380 q40,-26 80,0 q40,-26 80,0 q40,-26 80,0 q40,-26 80,0 L320,400 L0,400 Z" fill="#8AD57D"/>
      ${flower(52, 470, 2.4, "#FF8FB1", "#FFE066")}
      ${flower(268, 442, 2.0, "#C77DFF", "#FFE066")}
      ${flower(232, 508, 1.7, "#FFD166", "#FF8FB1")}
      <ellipse cx="160" cy="504" rx="118" ry="20" fill="#7CC970" opacity=".45"/>`
  },

  festa: {
    name: "Festa",
    art: () => `
      <rect width="320" height="560" fill="#3B2A5A"/>
      <g opacity=".9">
        <ellipse cx="56" cy="90" rx="26" ry="32" fill="#FF6FA5"/><path d="M56,122 L56,150" stroke="#FF9EC4" stroke-width="3"/>
        <ellipse cx="110" cy="60" rx="22" ry="28" fill="#FFD166"/><path d="M110,88 L110,116" stroke="#FFE066" stroke-width="3"/>
        <ellipse cx="262" cy="80" rx="24" ry="30" fill="#7FDBFF"/><path d="M262,110 L262,140" stroke="#B6ECFF" stroke-width="3"/>
      </g>
      <g>
        <rect x="30" y="240" width="8" height="16" rx="3" fill="#FF8FB1" transform="rotate(18 34 248)"/>
        <rect x="280" y="200" width="8" height="16" rx="3" fill="#FFE066" transform="rotate(-24 284 208)"/>
        <rect x="250" y="300" width="7" height="14" rx="3" fill="#7FDBFF" transform="rotate(32 253 307)"/>
        <rect x="60" y="330" width="7" height="14" rx="3" fill="#C77DFF" transform="rotate(-14 63 337)"/>
        <circle cx="140" cy="250" r="3" fill="#fff" opacity=".7"/><circle cx="200" cy="220" r="2.5" fill="#fff" opacity=".6"/>
        <circle cx="90" cy="200" r="2.5" fill="#fff" opacity=".6"/>
      </g>
      <ellipse cx="160" cy="506" rx="120" ry="30" fill="#5A4480" opacity=".8"/>`
  },

  ceu: {
    name: "Céu estrelado",
    art: () => `
      <rect width="320" height="560" fill="#2B2D5E"/>
      <path d="M236,64 a34,34 0 1,0 22,58 a28,28 0 1,1 -22,-58 Z" fill="#FFE9A8"/>
      <g fill="#fff">
        <circle cx="46" cy="60" r="2.6"/><circle cx="96" cy="110" r="2"/><circle cx="150" cy="50" r="2.2"/>
        <circle cx="200" cy="120" r="1.8"/><circle cx="70" cy="180" r="2.2"/><circle cx="270" cy="210" r="2"/>
        <circle cx="120" cy="210" r="1.8"/><circle cx="40" cy="280" r="2"/><circle cx="290" cy="300" r="2.2"/>
        <circle cx="180" cy="300" r="1.8"/><circle cx="100" cy="360" r="2"/>
      </g>
      <path d="M60,320 C100,290 140,330 100,352 C120,340 118,318 60,320 Z" fill="#6E6BA8" opacity=".6"/>
      <ellipse cx="160" cy="506" rx="120" ry="26" fill="#43457F" opacity=".7"/>`
  },

  floresta: {
    name: "Floresta encantada",
    art: () => `
      <rect width="320" height="560" fill="#CFE8D6"/>
      <rect width="320" height="560" fill="url(#none)" />
      <circle cx="160" cy="90" r="120" fill="#E8F7E4" opacity=".5"/>
      ${pine(40, 250, 1.5, "#3F8A62")}
      ${pine(286, 270, 1.7, "#356F52")}
      ${pine(92, 320, 1.1, "#4E9E6A")}
      ${pine(246, 330, 1.0, "#4E9E6A")}
      <rect y="400" width="320" height="160" fill="#7FCB8E"/>
      <path d="M0,400 q40,-22 80,0 q40,-22 80,0 q40,-22 80,0 q40,-22 80,0 L320,420 L0,420 Z" fill="#6FBB7E"/>
      <g>
        <rect x="70" y="452" width="7" height="16" rx="3" fill="#FFF6EC"/>
        <ellipse cx="73.5" cy="450" rx="12" ry="7" fill="#FF9EC4"/><circle cx="66" cy="452" r="2" fill="#fff"/>
        <rect x="248" y="470" width="6" height="14" rx="3" fill="#FFF6EC"/>
        <ellipse cx="251" cy="468" rx="10" ry="6" fill="#C9A7F5"/>
      </g>
      <g fill="#FFF1B8">
        <circle cx="60" cy="200" r="2.6"/><circle cx="120" cy="150" r="2"/><circle cx="250" cy="180" r="2.4"/>
        <circle cx="210" cy="250" r="1.8"/><circle cx="150" cy="280" r="2"/><circle cx="285" cy="120" r="1.8"/>
      </g>
      <ellipse cx="160" cy="500" rx="112" ry="18" fill="#5FA86F" opacity=".4"/>`
  },

  castelo: {
    name: "Castelo",
    art: () => `
      <rect width="320" height="560" fill="#CFE9FF"/>
      <circle cx="58" cy="66" r="28" fill="#FFE066"/>
      ${cloud(160, 80, 0.9)}
      <g fill="#D9C6F5" stroke="#B9A0E0" stroke-width="2">
        <rect x="96" y="220" width="128" height="240" rx="6"/>
        <rect x="60" y="270" width="44" height="190" rx="4"/>
        <rect x="216" y="270" width="44" height="190" rx="4"/>
      </g>
      <g fill="#B9A0E0">
        <path d="M96,220 L110,190 L124,220 Z"/><path d="M124,220 L138,186 L152,220 Z"/>
        <path d="M152,220 L166,182 L180,220 Z"/><path d="M180,220 L194,186 L208,220 Z"/><path d="M208,220 L224,190 L238,220 Z"/>
        <path d="M60,270 L72,244 L84,270 Z"/><path d="M84,270 L96,240 L108,270 Z"/>
        <path d="M212,270 L224,240 L236,270 Z"/><path d="M236,270 L248,244 L260,270 Z"/>
      </g>
      <path d="M136,460 L136,360 a24,24 0 0,1 48,0 L184,460 Z" fill="#8B5A9E"/>
      <path d="M150,460 L150,372 a10,10 0 0,1 20,0 L170,460 Z" fill="#6B3F7A"/>
      <g fill="#7FDBFF">
        <rect x="76" y="300" width="12" height="18" rx="6"/>
        <rect x="232" y="300" width="12" height="18" rx="6"/>
        <rect x="146" y="252" width="12" height="18" rx="6"/>
        <rect x="168" y="252" width="12" height="18" rx="6"/>
      </g>
      <rect y="460" width="320" height="100" fill="#A8D8A0"/>
      <path d="M0,460 q80,-20 160,0 q80,20 160,0 L320,480 L0,480 Z" fill="#95CB8D"/>
      <ellipse cx="160" cy="500" rx="110" ry="16" fill="#6FAE6A" opacity=".4"/>`
  },

  nuvens: {
    name: "Reino das nuvens",
    art: () => `
      <rect width="320" height="560" fill="#FFE1F0"/>
      <ellipse cx="160" cy="120" rx="210" ry="150" fill="#FFD1E8" opacity=".7"/>
      <path d="M30,260 A130,130 0 0,1 290,260" stroke="#FF9EC4" stroke-width="16" fill="none" opacity=".55"/>
      <path d="M54,260 A106,106 0 0,1 266,260" stroke="#FFD166" stroke-width="16" fill="none" opacity=".55"/>
      <path d="M78,260 A82,82 0 0,1 242,260" stroke="#8AE6A1" stroke-width="16" fill="none" opacity=".55"/>
      <path d="M102,260 A58,58 0 0,1 218,260" stroke="#7FDBFF" stroke-width="16" fill="none" opacity=".55"/>
      ${cloud(60, 300, 1.5, "#fff", 0.95)}
      ${cloud(260, 320, 1.3, "#fff", 0.95)}
      ${cloud(160, 340, 2.1, "#fff", 1)}
      <rect y="420" width="320" height="140" fill="#FFF3FA"/>
      ${cloud(40, 470, 1.2, "#FFE6F2", 1)}
      ${cloud(286, 490, 1.1, "#FFE6F2", 1)}
      <ellipse cx="160" cy="500" rx="110" ry="18" fill="#FFD1E8" opacity=".6"/>`
  },

  circo: {
    name: "Circo",
    art: () => `
      <rect width="320" height="560" fill="#3B2A5A"/>
      <path d="M0,0 L320,0 L320,120 C240,180 80,180 0,120 Z" fill="#E1548B"/>
      <g fill="#FFD166" opacity=".9">
        <path d="M40,0 L70,0 L50,140 Z"/><path d="M120,0 L150,0 L135,160 Z"/><path d="M200,0 L230,0 L215,160 Z"/><path d="M280,0 L310,0 L295,140 Z"/>
      </g>
      <g>
        <circle cx="60" cy="200" r="18" fill="#FFE066" opacity=".25"/>
        <circle cx="60" cy="200" r="10" fill="#FFE066" opacity=".35"/>
        <circle cx="260" cy="200" r="18" fill="#7FDBFF" opacity=".25"/>
        <circle cx="260" cy="200" r="10" fill="#7FDBFF" opacity=".35"/>
      </g>
      <path d="M0,440 L320,440 L320,560 L0,560 Z" fill="#C94F8B"/>
      <g fill="#FFE066">
        <rect x="30" y="240" width="7" height="14" rx="3" transform="rotate(20 33 247)"/>
        <rect x="280" y="300" width="7" height="14" rx="3" transform="rotate(-16 283 307)"/>
        <circle cx="140" cy="220" r="3"/><circle cx="210" cy="260" r="2.4"/><circle cx="90" cy="320" r="2.4"/>
      </g>
      <ellipse cx="160" cy="506" rx="120" ry="30" fill="#A83A73" opacity=".7"/>`
  },

  fazenda: {
    name: "Fazendinha",
    art: () => `
      <rect width="320" height="560" fill="#CBE9FF"/>
      <circle cx="270" cy="66" r="28" fill="#FFE066"/>
      ${cloud(90, 80, 0.8)}
      <rect y="330" width="320" height="230" fill="#A8DB8A"/>
      <path d="M0,340 q80,-24 160,0 q80,24 160,0 L320,560 L0,560 Z" fill="#94CC77"/>
      <g>
        <rect x="60" y="270" width="88" height="70" fill="#E1548B"/>
        <path d="M52,270 L104,232 L156,270 Z" fill="#C94F8B"/>
        <rect x="88" y="300" width="26" height="40" fill="#FFF6EC"/>
        <rect x="72" y="286" width="14" height="14" fill="#FFE066"/>
        <rect x="120" y="286" width="14" height="14" fill="#FFE066"/>
      </g>
      <g stroke="#FFF6EC" stroke-width="6" stroke-linecap="round">
        <path d="M210,380 L210,440"/><path d="M240,380 L240,440"/><path d="M270,380 L270,440"/>
        <path d="M200,396 L280,396"/><path d="M200,424 L280,424"/>
      </g>
      <g fill="#FFE066">
        <circle cx="50" cy="430" r="3"/><circle cx="150" cy="450" r="2.5"/><circle cx="290" cy="470" r="3"/>
      </g>
      <ellipse cx="160" cy="504" rx="118" ry="20" fill="#7FBF62" opacity=".4"/>`
  },

  escola: {
    name: "Escolinha",
    art: () => `
      <rect width="320" height="560" fill="#FFF1DC"/>
      <rect y="360" width="320" height="200" fill="#F0D9B8"/>
      <rect x="30" y="80" width="260" height="150" rx="10" fill="#3F6B52"/>
      <rect x="30" y="80" width="260" height="150" rx="10" fill="none" stroke="#B5793F" stroke-width="8"/>
      <g stroke="#FFF6EC" stroke-width="3" fill="none" opacity=".9">
        <path d="M60,120 C70,110 80,130 90,120"/><path d="M110,120 L130,120"/><path d="M150,110 L150,140"/>
        <text x="200" y="135" font-family="Trebuchet MS" font-size="30" fill="#FFF6EC" stroke="none">A B</text>
        <path d="M60,160 C64,150 72,150 76,160 C80,150 88,150 92,160"/>
        <path d="M120,160 L140,160 M130,150 L130,170"/>
        <circle cx="220" cy="162" r="10" stroke="#FFF6EC"/><path d="M240,170 L250,150 L260,170"/>
      </g>
      <rect x="150" y="100" width="20" height="8" rx="4" fill="#FFF6EC" opacity=".7"/>
      <g>
        <rect x="20" y="300" width="280" height="14" rx="7" fill="#D9A86C"/>
        <rect x="34" y="314" width="10" height="50" fill="#B5793F"/><rect x="276" y="314" width="10" height="50" fill="#B5793F"/>
        ${[60, 130, 200, 260].map((x) => `<g transform="translate(${x} 296)"><rect x="-14" y="0" width="28" height="6" rx="3" fill="#FFD166"/><rect x="4" y="-18" width="5" height="18" fill="#FF9EC4"/></g>`).join("")}
      </g>
      <ellipse cx="160" cy="506" rx="120" ry="26" fill="#D9B88A" opacity=".5"/>`
  },

  piscina: {
    name: "Piscina",
    art: () => `
      <rect width="320" height="560" fill="#BFEBFF"/>
      <circle cx="262" cy="60" r="30" fill="#FFE066"/>
      ${cloud(80, 70, 0.8)}
      <rect y="300" width="320" height="260" fill="#7FDBFF"/>
      <g stroke="#B8ECFF" stroke-width="4" fill="none" opacity=".8">
        <path d="M0,340 q40,-12 80,0 q40,12 80,0 q40,-12 80,0 q40,12 80,0"/>
        <path d="M0,400 q40,-12 80,0 q40,12 80,0 q40,-12 80,0 q40,12 80,0"/>
        <path d="M0,470 q40,-12 80,0 q40,12 80,0 q40,-12 80,0 q40,12 80,0"/>
      </g>
      <g>
        <ellipse cx="60" cy="450" rx="36" ry="14" fill="none" stroke="#FF6FA5" stroke-width="10"/>
        <ellipse cx="60" cy="450" rx="36" ry="14" fill="none" stroke="#FFE066" stroke-width="4"/>
      </g>
      <g fill="#fff" opacity=".7">
        <circle cx="250" cy="360" r="6"/><circle cx="268" cy="392" r="4"/><circle cx="240" cy="420" r="3"/>
      </g>
      <rect y="470" width="320" height="90" fill="#FFE6C7"/>
      <ellipse cx="160" cy="510" rx="120" ry="18" fill="#E9CBA0" opacity=".6"/>`
  },

  neve: {
    name: "Neve",
    art: () => `
      <rect width="320" height="560" fill="#DCEEFF"/>
      <circle cx="64" cy="70" r="28" fill="#FFF6EC"/>
      <path d="M0,260 L70,150 L140,260 Z" fill="#C9DDF5"/>
      <path d="M110,280 L200,130 L290,280 Z" fill="#B8D0EE"/>
      <path d="M70,150 L92,196 L48,196 Z" fill="#fff"/>
      <path d="M200,130 L230,188 L170,188 Z" fill="#fff"/>
      <rect y="320" width="320" height="240" fill="#F4F9FF"/>
      ${pine(50, 360, 1.2, "#3F7A66", "#6B4F3A")}
      ${pine(270, 380, 1.4, "#356F52", "#6B4F3A")}
      ${pine(110, 420, 0.9, "#4E9E6A", "#6B4F3A")}
      <g fill="#fff">
        ${[[40, 120], [110, 90], [200, 70], [280, 140], [70, 220], [250, 230], [160, 180], [300, 320], [30, 330]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${2 + ((x + y) % 3)}" opacity=".9"/>`).join("")}
      </g>
      <ellipse cx="160" cy="506" rx="118" ry="22" fill="#DCE8F7" opacity=".8"/>`
  },

  deserto: {
    name: "Deserto",
    art: () => `
      <rect width="320" height="560" fill="#FFE3B8"/>
      <circle cx="252" cy="80" r="38" fill="#FFC46B"/>
      <path d="M0,320 C60,260 120,300 200,280 C260,264 300,300 320,320 L320,560 L0,560 Z" fill="#F2C078"/>
      <path d="M0,380 C70,330 140,370 220,350 C270,338 300,360 320,372 L320,560 L0,560 Z" fill="#E8AE62"/>
      <g fill="#8FAE5C">
        <rect x="52" y="400" width="16" height="80" rx="8"/>
        <path d="M60,420 C40,410 40,390 46,382 C52,392 58,400 60,408 Z"/>
        <path d="M60,432 C80,422 80,402 74,394 C68,404 62,412 60,420 Z"/>
      </g>
      <g fill="#FFF1C9" opacity=".8">
        <ellipse cx="240" cy="470" rx="26" ry="8"/><ellipse cx="70" cy="500" rx="20" ry="6"/>
      </g>
      <path d="M232,300 L258,262 L284,300 Z" fill="#E8B87A" opacity=".6"/>
      <ellipse cx="160" cy="506" rx="118" ry="20" fill="#D99A50" opacity=".35"/>`
  },

  mar: {
    name: "Fundo do mar",
    art: () => `
      <rect width="320" height="560" fill="#3FA9D6"/>
      <rect width="320" height="560" fill="#2E8FC0" opacity=".5"/>
      <path d="M0,90 C60,60 120,110 180,80 C240,50 290,90 320,70 L320,0 L0,0 Z" fill="#7FD1E8" opacity=".5"/>
      <g fill="#E9F9FF" opacity=".55">
        <circle cx="60" cy="140" r="8"/><circle cx="76" cy="110" r="4"/><circle cx="250" cy="180" r="6"/>
        <circle cx="270" cy="220" r="9"/><circle cx="40" cy="260" r="5"/><circle cx="200" cy="120" r="5"/>
      </g>
      <rect y="440" width="320" height="120" fill="#F2D9A8"/>
      <g fill="#5FA86F">
        <path d="M40,470 C30,430 44,410 40,380 C56,404 52,436 58,470 Z"/>
        <path d="M80,480 C70,450 84,430 78,404 C94,424 92,452 96,480 Z"/>
        <path d="M262,476 C252,440 266,418 260,392 C276,414 272,446 278,476 Z"/>
      </g>
      ${fish(120, 250, 1.1, "#FFB3D9")}
      ${fish(230, 320, 0.9, "#FFE066", -1)}
      ${fish(90, 360, 0.7, "#C9A7F5")}
      <g fill="#FF8FB1">
        <path d="M200,450 l10,-16 l10,16 Z"/><circle cx="210" cy="450" r="7"/>
      </g>
      <path d="M0,440 q40,-14 80,0 q40,14 80,0 q40,-14 80,0 q40,14 80,0 L320,470 L0,470 Z" fill="#E8C894"/>
      <ellipse cx="160" cy="508" rx="116" ry="18" fill="#C9A56F" opacity=".5"/>`
  },

  arcoIris: {
    name: "Arco-íris",
    art: () => `
      <rect width="320" height="560" fill="#DFF3FF"/>
      <g fill="none" stroke-width="14" opacity=".65">
        <path d="M20,330 A140,140 0 0,1 300,330" stroke="#FF9EC4"/>
        <path d="M40,330 A120,120 0 0,1 280,330" stroke="#FFD166"/>
        <path d="M60,330 A100,100 0 0,1 260,330" stroke="#8AE6A1"/>
        <path d="M80,330 A80,80 0 0,1 240,330" stroke="#7FDBFF"/>
        <path d="M100,330 A60,60 0 0,1 220,330" stroke="#C9A7F5"/>
      </g>
      ${cloud(46, 342, 1.5, "#fff")}
      ${cloud(276, 346, 1.4, "#fff")}
      ${cloud(160, 380, 1.8, "#fff")}
      <rect y="420" width="320" height="140" fill="#BFEAD3"/>
      <path d="M0,420 q40,-18 80,0 q40,18 80,0 q40,-18 80,0 q40,18 80,0 L320,440 L0,440 Z" fill="#A8E0BC"/>
      ${heart(70, 470, 1.2, "#FF9EC4", 0.8)}
      ${heart(250, 486, 1, "#C9A7F5", 0.8)}
      <ellipse cx="160" cy="504" rx="114" ry="20" fill="#8FCFA5" opacity=".4"/>`
  },

  doceria: {
    name: "Doceria",
    art: () => `
      <rect width="320" height="560" fill="#FFF1F8"/>
      <g opacity=".5">
        ${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 40}" y="0" width="20" height="560" fill="#FFD1E5"/>`).join("")}
      </g>
      <rect y="430" width="320" height="130" fill="#F7C9DE"/>
      <g>
        <rect x="36" y="300" width="64" height="70" rx="8" fill="#FFD166"/>
        <path d="M30,300 L68,270 L106,300 Z" fill="#FF9EC4"/>
        <circle cx="68" cy="286" r="7" fill="#FF5C7A"/>
        <g stroke="#FFE066" stroke-width="2"><path d="M48,316 L88,316"/><path d="M48,330 L88,330"/><path d="M48,344 L88,344"/></g>
      </g>
      <g>
        <rect x="240" y="330" width="10" height="70" fill="#FFF6EC"/>
        <circle cx="245" cy="316" r="22" fill="#FF9EC4"/>
        <path d="M245,294 A22,22 0 0,1 267,316" stroke="#FFD166" stroke-width="6" fill="none"/>
        <path d="M245,294 A22,22 0 0,0 223,316" stroke="#C9A7F5" stroke-width="6" fill="none"/>
      </g>
      <g>
        <ellipse cx="160" cy="440" rx="90" ry="14" fill="#FFC2DC"/>
        <ellipse cx="160" cy="428" rx="70" ry="12" fill="#FFE6F2"/>
      </g>
      <g fill="#FF8FB1" opacity=".6">
        <circle cx="290" cy="150" r="4"/><circle cx="50" cy="180" r="3"/><circle cx="270" cy="250" r="3"/>
      </g>
      <ellipse cx="160" cy="506" rx="118" ry="24" fill="#E9A8C4" opacity=".4"/>`
  },

  estacao: {
    name: "Estação",
    art: () => `
      <rect width="320" height="560" fill="#EAF1F8"/>
      <rect x="0" y="140" width="320" height="300" fill="#F5D9C0"/>
      <g stroke="#E9C3A2" stroke-width="3" opacity=".8">
        ${Array.from({ length: 7 }, (_, i) => `<path d="M0,${160 + i * 40} L320,${160 + i * 40}"/>`).join("")}
        ${Array.from({ length: 9 }, (_, i) => `<path d="M${20 + i * 40},140 L${20 + i * 40},440"/>`).join("")}
      </g>
      <rect x="0" y="60" width="320" height="60" fill="#8FB8C9"/>
      <path d="M0,60 L320,60 L320,86 L0,86 Z" fill="#7AA6B8"/>
      <g>
        <circle cx="160" cy="180" r="26" fill="#FFF6EC" stroke="#6B4E5E" stroke-width="5"/>
        <path d="M160,180 L160,164 M160,180 L172,186" stroke="#6B4E5E" stroke-width="3" stroke-linecap="round"/>
      </g>
      <rect y="440" width="320" height="120" fill="#B9C4CC"/>
      <g stroke="#8E9AA3" stroke-width="6">
        <path d="M0,470 L320,470"/><path d="M0,500 L320,500"/>
      </g>
      <g stroke="#6F7A82" stroke-width="4">
        ${Array.from({ length: 9 }, (_, i) => `<path d="M${10 + i * 38},460 L${10 + i * 38},510"/>`).join("")}
      </g>
      <g><rect x="220" y="330" width="60" height="60" rx="6" fill="#C94F8B"/><circle cx="250" cy="360" r="16" fill="#FFE066"/></g>
      <ellipse cx="160" cy="508" rx="120" ry="18" fill="#98A5AE" opacity=".5"/>`
  },

  cabana: {
    name: "Cabana aconchegante",
    art: () => `
      <rect width="320" height="560" fill="#F2DFC9"/>
      <g stroke="#D9BE9E" stroke-width="4" opacity=".7">
        ${Array.from({ length: 6 }, (_, i) => `<path d="M0,${90 + i * 70} L320,${90 + i * 70}"/>`).join("")}
      </g>
      <rect y="140" width="320" height="200" fill="#F7E9D7"/>
      <rect x="30" y="70" width="90" height="80" rx="8" fill="#8FCFE8" stroke="#B5793F" stroke-width="7"/>
      <path d="M75,70 L75,150 M30,110 L120,110" stroke="#B5793F" stroke-width="5"/>
      <g>
        <rect x="210" y="330" width="86" height="70" rx="8" fill="#C97A4A"/>
        <path d="M210,360 L296,360" stroke="#A85F36" stroke-width="4"/>
        <ellipse cx="253" cy="404" rx="40" ry="12" fill="#A85F36"/>
        <path d="M236,404 C236,376 270,376 270,404 Z" fill="#FFB347" opacity=".8"/>
        <path d="M245,404 C245,386 261,386 261,404 Z" fill="#FFE066"/>
      </g>
      <g>
        <rect x="36" y="360" width="70" height="70" rx="10" fill="#B5793F"/>
        <rect x="36" y="360" width="70" height="22" rx="10" fill="#8E5A2C"/>
        <path d="M36,410 L106,410" stroke="#8E5A2C" stroke-width="4"/>
      </g>
      <rect y="430" width="320" height="130" fill="#D9A86C"/>
      <g stroke="#B5793F" stroke-width="3" opacity=".55">
        ${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 46},430 L${i * 46 + 18},560"/>`).join("")}
      </g>
      <ellipse cx="160" cy="508" rx="110" ry="22" fill="#C08F57" opacity=".4"/>`
  },

  espaco: {
    name: "Espaço",
    art: () => `
      <rect width="320" height="560" fill="#1E2147"/>
      <circle cx="60" cy="90" r="34" fill="#F4B8D8"/>
      <ellipse cx="60" cy="90" rx="50" ry="10" fill="none" stroke="#FFE066" stroke-width="4" transform="rotate(-18 60 90)"/>
      <circle cx="256" cy="140" r="22" fill="#7FD1FF"/>
      <circle cx="248" cy="132" r="5" fill="#3C7FB0" opacity=".7"/>
      <circle cx="264" cy="150" r="4" fill="#3C7FB0" opacity=".7"/>
      <g fill="#fff">
        ${[[30, 200], [100, 60], [170, 40], [230, 90], [290, 50], [70, 250], [200, 210], [280, 260], [40, 340], [140, 300], [240, 330], [300, 380], [90, 390]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${1.4 + (i % 3)}" opacity="${0.6 + (i % 4) * 0.1}"/>`).join("")}
      </g>
      <g>
        <path d="M150,240 L164,214 L178,240 Z" fill="#FF8FB1"/>
        <path d="M138,240 L160,200 L182,240 Z" fill="#C94F8B" opacity=".0"/>
        <rect x="146" y="240" width="28" height="48" rx="12" fill="#FFD1E8"/>
        <circle cx="160" cy="256" r="6" fill="#7FDBFF"/>
        <path d="M146,286 L138,306 L146,300 L152,294 Z" fill="#FFD166"/>
        <path d="M174,286 L182,306 L174,300 L168,294 Z" fill="#FFD166"/>
      </g>
      <rect y="470" width="320" height="90" fill="#3E3A7A"/>
      <ellipse cx="160" cy="512" rx="120" ry="20" fill="#5A559E" opacity=".6"/>`
  }
};
