"use strict";

/* =========================================================
   MÚSICA — sintetizador suave (flauta, piano, violino, teclado)
   Uma faixa original para cada cenário.
   ========================================================= */

let AC = null;

function audioCtx() {
  if (!AC) {
    AC = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (AC.state === "suspended") AC.resume();
  return AC;
}

const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

/* ---------------------------------------------------------
   Instrumentos
   --------------------------------------------------------- */
const Instruments = {
  piano(c, out, freq, t, dur, vel) {
    const g = c.createGain();
    const o1 = c.createOscillator();
    const o2 = c.createOscillator();
    const g2 = c.createGain();
    o1.type = "triangle";
    o2.type = "sine";
    o1.frequency.value = freq;
    o2.frequency.value = freq * 2;
    g2.gain.value = 0.22;
    o2.connect(g2).connect(g);
    o1.connect(g);
    g.connect(out);

    const peak = Math.max(0.001, vel);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(peak * 0.35, t + Math.min(dur, 0.5));
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(dur + 0.6, 2.4));
    o1.start(t);
    o2.start(t);
    o1.stop(t + Math.min(dur + 0.65, 2.5));
    o2.stop(t + Math.min(dur + 0.65, 2.5));
  },

  glock(c, out, freq, t, dur, vel) {
    const g = c.createGain();
    const o1 = c.createOscillator();
    const o2 = c.createOscillator();
    const g2 = c.createGain();
    o1.type = "sine";
    o2.type = "sine";
    o1.frequency.value = freq;
    o2.frequency.value = freq * 3.01;
    g2.gain.value = 0.28;
    o2.connect(g2).connect(g);
    o1.connect(g);
    g.connect(out);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, vel), t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.5, dur + 0.35));
    o1.start(t);
    o2.start(t);
    o1.stop(t + dur + 0.5);
    o2.stop(t + dur + 0.5);
  },

  flute(c, out, freq, t, dur, vel) {
    const g = c.createGain();
    const o = c.createOscillator();
    const vib = c.createOscillator();
    const vibGain = c.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    vib.frequency.value = 5.1;
    vibGain.gain.value = 3.2;
    vib.connect(vibGain).connect(o.detune);
    o.connect(g);
    g.connect(out);
    const d = Math.max(0.18, dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, vel), t + 0.07);
    g.gain.setValueAtTime(Math.max(0.001, vel), t + d * 0.75);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.18);
    o.start(t);
    vib.start(t);
    o.stop(t + d + 0.2);
    vib.stop(t + d + 0.2);
  },

  violin(c, out, freq, t, dur, vel) {
    const g = c.createGain();
    const o = c.createOscillator();
    const lp = c.createBiquadFilter();
    const vib = c.createOscillator();
    const vibGain = c.createGain();
    o.type = "sawtooth";
    o.frequency.value = freq;
    lp.type = "lowpass";
    lp.frequency.value = 1700;
    lp.Q.value = 0.6;
    vib.frequency.value = 4.8;
    vibGain.gain.value = 4.6;
    vib.connect(vibGain).connect(o.detune);
    o.connect(lp).connect(g);
    g.connect(out);
    const d = Math.max(0.25, dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, vel), t + 0.12);
    g.gain.setValueAtTime(Math.max(0.001, vel), t + Math.max(0.14, d - 0.1));
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.22);
    o.start(t);
    vib.start(t);
    o.stop(t + d + 0.25);
    vib.stop(t + d + 0.25);
  },

  harp(c, out, freq, t, dur, vel) {
    const g = c.createGain();
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = freq;
    o.connect(g).connect(out);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, vel), t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.6, dur + 0.4));
    o.start(t);
    o.stop(t + dur + 0.5);
  }
};

/* ---------------------------------------------------------
   Faixas — uma por cenário
   --------------------------------------------------------- */
const PENTA = [0, 2, 4, 7, 9];
const PENTA_MIN = [0, 3, 5, 7, 10];

const TRACKS = {
  quarto: {
    title: "Asas de Algodão", tempo: 104, root: 60, scale: PENTA,
    lead: "glock", arp: "harp", pad: "piano", seed: 11,
    progression: [[0, "maj"], [5, "maj"], [9, "min"], [7, "maj"], [0, "maj"], [5, "maj"], [7, "maj"], [0, "maj"]],
    // Cada nota contém a posição em colcheias, o intervalo e a duração.
    melody: [
      [[0, 0, 1], [1, 4, 1], [2, 7, 2], [4, 4, 1], [5, 2, 1], [6, 0, 2]],
      [[0, 5, 1], [1, 9, 1], [2, 12, 2], [4, 9, 1], [5, 7, 1], [6, 5, 2]],
      [[0, 4, 2], [2, 7, 1], [3, 9, 1], [4, 12, 2], [6, 9, 2]],
      [[0, 7, 2], [2, 2, 2], [4, 5, 1], [5, 2, 1], [6, 7, 2]],
      [[0, 0, 1], [1, 4, 1], [2, 7, 2], [4, 12, 2], [6, 7, 2]],
      [[0, 9, 2], [2, 12, 1], [3, 14, 1], [4, 12, 2], [6, 9, 2]],
      [[0, 7, 2], [2, 11, 2], [4, 14, 1], [5, 12, 1], [6, 11, 2]],
      [[0, 12, 2], [2, 7, 1], [3, 4, 1], [4, 0, 4]]
    ]
  },
  praia: {
    title: "Ondinhas do Mar", tempo: 92, root: 62, scale: PENTA,
    lead: "flute", arp: "piano", pad: null, seed: 22,
    progression: [[0, "maj"], [5, "maj"], [7, "maj"], [2, "min"]]
  },
  jardim: {
    title: "Borboletas no Jardim", tempo: 96, root: 65, scale: PENTA,
    lead: "flute", arp: "glock", pad: "violin", seed: 33,
    progression: [[0, "maj"], [9, "min"], [5, "maj"], [7, "maj"]]
  },
  festa: {
    title: "Festa da Lulu", tempo: 108, root: 67, scale: PENTA,
    lead: "glock", arp: "piano", pad: null, seed: 44,
    progression: [[0, "maj"], [7, "maj"], [9, "min"], [5, "maj"]]
  },
  ceu: {
    title: "Estrelinhas", tempo: 72, root: 69, scale: PENTA_MIN,
    lead: "violin", arp: "glock", pad: "piano", seed: 55,
    progression: [[0, "min"], [8, "maj"], [3, "maj"], [10, "maj"]]
  },
  floresta: {
    title: "Mistério Verde", tempo: 88, root: 64, scale: PENTA_MIN,
    lead: "flute", arp: "harp", pad: "violin", seed: 66,
    progression: [[0, "min"], [3, "maj"], [10, "maj"], [8, "maj"]]
  },
  castelo: {
    title: "Salão do Castelo", tempo: 76, root: 60, scale: PENTA,
    lead: "violin", arp: "piano", pad: "violin", seed: 77,
    progression: [[0, "maj"], [7, "maj"], [0, "maj"], [9, "min"]]
  },
  nuvens: {
    title: "Nuvem de Algodão", tempo: 80, root: 65, scale: PENTA,
    lead: "glock", arp: "flute", pad: "piano", seed: 88,
    progression: [[0, "maj"], [5, "maj"], [9, "min"], [7, "maj"]]
  },
  circo: {
    title: "Pipoca e Confete", tempo: 116, root: 62, scale: PENTA,
    lead: "glock", arp: "piano", pad: null, seed: 99,
    progression: [[0, "maj"], [7, "maj"], [0, "maj"], [7, "maj"]]
  },
  fazenda: {
    title: "Dia na Fazenda", tempo: 100, root: 67, scale: PENTA,
    lead: "piano", arp: "flute", pad: null, seed: 101,
    progression: [[0, "maj"], [5, "maj"], [0, "maj"], [7, "maj"]]
  },
  escola: {
    title: "Sininho da Escola", tempo: 96, root: 60, scale: PENTA,
    lead: "glock", arp: "piano", pad: null, seed: 112,
    progression: [[0, "maj"], [9, "min"], [2, "min"], [7, "maj"]]
  },
  piscina: {
    title: "Splash Splash", tempo: 104, root: 69, scale: PENTA,
    lead: "flute", arp: "glock", pad: null, seed: 123,
    progression: [[0, "maj"], [7, "maj"], [9, "min"], [5, "maj"]]
  },
  neve: {
    title: "Flocos de Neve", tempo: 68, root: 70, scale: PENTA,
    lead: "glock", arp: "harp", pad: "violin", seed: 134,
    progression: [[0, "maj"], [9, "min"], [5, "maj"], [7, "maj"]]
  },
  deserto: {
    title: "Sol do Deserto", tempo: 84, root: 64, scale: PENTA_MIN,
    lead: "flute", arp: "harp", pad: null, seed: 145,
    progression: [[0, "min"], [10, "maj"], [8, "maj"], [10, "maj"]]
  },
  mar: {
    title: "Fundo do Mar", tempo: 74, root: 63, scale: PENTA,
    lead: "flute", arp: "glock", pad: "violin", seed: 156,
    progression: [[0, "maj"], [3, "min"], [5, "maj"], [7, "maj"]]
  },
  arcoIris: {
    title: "Arco-íris", tempo: 100, root: 62, scale: PENTA,
    lead: "glock", arp: "flute", pad: "piano", seed: 167,
    progression: [[0, "maj"], [5, "maj"], [9, "min"], [7, "maj"]]
  },
  doceria: {
    title: "Docinho Musical", tempo: 112, root: 65, scale: PENTA,
    lead: "glock", arp: "piano", pad: null, seed: 178,
    progression: [[0, "maj"], [9, "min"], [5, "maj"], [7, "maj"]]
  },
  estacao: {
    title: "Trem das Nuvens", tempo: 92, root: 67, scale: PENTA,
    lead: "piano", arp: "violin", pad: "violin", seed: 189,
    progression: [[0, "maj"], [7, "maj"], [5, "maj"], [9, "min"]]
  },
  cabana: {
    title: "Lareira Acesa", tempo: 70, root: 60, scale: PENTA,
    lead: "violin", arp: "piano", pad: "violin", seed: 200,
    progression: [[0, "maj"], [5, "maj"], [7, "maj"], [9, "min"]]
  },
  espaco: {
    title: "Poeira de Estrelas", tempo: 64, root: 64, scale: PENTA_MIN,
    lead: "glock", arp: "harp", pad: "violin", seed: 211,
    progression: [[0, "min"], [8, "maj"], [5, "min"], [3, "maj"]]
  }
};

/* ---------------------------------------------------------
   Motor
   --------------------------------------------------------- */
const Music = (() => {
  let master = null;
  let wet = null;
  let dry = null;
  let timer = null;
  let playing = false;
  let enabled = true;
  let currentId = null;
  let track = null;
  let bar = 0;
  let nextTime = 0;
  let phrase = null;
  let phraseSeed = null;
  const BASE_GAIN = 0.5;

  function build() {
    if (master) return;
    const c = audioCtx();
    master = c.createGain();
    master.gain.value = BASE_GAIN;

    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -22;
    comp.knee.value = 20;
    comp.ratio.value = 3;
    comp.attack.value = 0.01;
    comp.release.value = 0.25;

    dry = c.createGain();
    dry.gain.value = 0.82;

    wet = c.createGain();
    wet.gain.value = 0.32;

    const conv = c.createConvolver();
    conv.buffer = makeImpulse(c, 1.9, 2.4);

    dry.connect(comp);
    wet.connect(conv).connect(comp);
    comp.connect(master).connect(c.destination);
  }

  function makeImpulse(c, seconds, decay) {
    const rate = c.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = c.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  function makePhrase(cfg, seed) {
    if (cfg.melody) return cfg.melody.map(bar => bar.map(([slot, note, len]) => ({ slot, note, len })));
    const rnd = mulberry32(seed);
    const scale = cfg.scale;
    const pool = [];
    for (let o = 0; o < 3; o++) scale.forEach((s) => pool.push(s + o * 12));
    let idx = 4;
    const bars = [];
    for (let b = 0; b < 8; b++) {
      const notes = [];
      let slot = 0;
      while (slot < 8) {
        const isDownbeat = slot === 0;
        if (isDownbeat || rnd() < 0.46) {
          idx += Math.floor(rnd() * 5) - 2;
          idx = Math.max(0, Math.min(pool.length - 1, idx));
          const len = rnd() < 0.3 ? 2 : 1;
          notes.push({ slot, note: pool[idx], len });
          slot += len;
        } else {
          slot++;
        }
      }
      bars.push(notes);
    }
    return bars;
  }

  function chordNotes(root, quality) {
    const third = quality === "min" ? 3 : 4;
    return [root, root + third, root + 7];
  }

  function playBar(t0) {
    const c = audioCtx();
    const beat = 60 / track.tempo;
    const barDur = beat * 4;
    const chordIdx = bar % track.progression.length;
    const [off, quality] = track.progression[chordIdx];
    const chordRoot = track.root + off;
    const chord = chordNotes(chordRoot, quality);

    // baixo suave
    const bassInstr = "piano";
    Instruments[bassInstr](c, dry, midiToFreq(chordRoot - 12), t0, beat * 1.6, 0.075);
    Instruments[bassInstr](c, dry, midiToFreq(chordRoot - 12), t0 + beat * 2, beat * 1.2, 0.045);

    // acompanhamento em arpejo (colcheias)
    const arpPattern = [0, 1, 2, 1, 0, 2, 1, 2];
    for (let i = 0; i < 8; i++) {
      const noteMidi = chord[arpPattern[i]] + (i >= 4 ? 12 : 0);
      const t = t0 + i * (beat / 2);
      Instruments[track.arp](c, dry, midiToFreq(noteMidi), t, beat * 0.42, 0.028);
    }

    // acorde sustentado (violino/piano)
    if (track.pad) {
      chord.forEach((n, i) => {
        Instruments[track.pad](c, wet, midiToFreq(n + (i === 2 ? 12 : 0)), t0, barDur * 0.9, 0.02);
      });
    }

    // melodia
    const barNotes = phrase[bar % phrase.length];
    barNotes.forEach(({ slot, note, len }) => {
      const t = t0 + slot * (beat / 2);
      const dur = len * (beat / 2);
      const midi = track.root + note + 12;
      Instruments[track.lead](c, dry, midiToFreq(midi), t + 0.004, dur * 0.92, 0.055);
      // brilho ocasional
      if (slot === 0 && Math.random() < 0.22) {
        Instruments.glock(c, wet, midiToFreq(midi + 12), t + beat / 2, beat * 0.5, 0.018);
      }
    });
  }

  function tick() {
    if (!playing) return;
    const c = audioCtx();
    const beat = 60 / track.tempo;
    const barDur = beat * 4;
    while (nextTime < c.currentTime + 0.45) {
      playBar(nextTime);
      nextTime += barDur;
      bar++;
    }
  }

  function start(id) {
    if (!enabled) return;
    if (!TRACKS[id]) id = "quarto";
    build();
    stopScheduler();
    const c = audioCtx();
    currentId = id;
    track = TRACKS[id];
    if (phraseSeed !== id) {
      phrase = makePhrase(track, track.seed);
      phraseSeed = id;
    }
    bar = 0;
    playing = true;
    nextTime = c.currentTime + 0.12;
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.setValueAtTime(0.0001, c.currentTime);
    master.gain.linearRampToValueAtTime(BASE_GAIN, c.currentTime + 0.4);
    timer = setInterval(tick, 120);
    tick();
    window.dispatchEvent(new CustomEvent("musicchange", { detail: { id, title: track.title } }));
  }

  function stopScheduler() {
    playing = false;
    if (timer) clearInterval(timer);
    timer = null;
    if (master) {
      const c = audioCtx();
      master.gain.cancelScheduledValues(c.currentTime);
      master.gain.setValueAtTime(master.gain.value, c.currentTime);
      master.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.2);
    }
  }

  return {
    start(id) {
      enabled = true;
      start(id);
    },
    stop() {
      enabled = false;
      stopScheduler();
    },
    setEnabled(on) {
      if (on) {
        enabled = true;
        if (currentId) start(currentId);
      } else {
        this.stop();
      }
    },
    isEnabled() {
      return enabled;
    },
    current() {
      return currentId;
    },
    title() {
      return track ? track.title : "";
    }
  };
})();
