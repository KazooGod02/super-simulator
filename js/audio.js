// SUPER SIMULATOR · sonido chiptune: efectos y un secuenciador de 3 canales
(() => {
  "use strict";
  const A = (SS.audio = {});
  let ac = null, master, musicGain, sfxGain, noiseBuf;
  let wanted = null, current = null, timer = null, step = 0, nextTime = 0, track = null;

  A.unlock = () => {
    if (!ac) {
      try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
      master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
      musicGain = ac.createGain(); musicGain.connect(master);
      sfxGain = ac.createGain(); sfxGain.connect(master);
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      A.applySettings();
      if (wanted) { const w = wanted; current = null; A.music(w); }
    }
    if (ac.state === "suspended") ac.resume();
  };
  A.ready = () => !!ac;
  A.applySettings = () => {
    if (!ac) return;
    musicGain.gain.value = SS.settings.music ? 0.32 : 0;
    sfxGain.gain.value = SS.settings.sfx ? 0.5 : 0;
  };

  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function freq(n) {
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(n);
    if (!m) return 0;
    let s = SEMI[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
    const midi = 12 * (+m[3] + 1) + s;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  A.freq = freq;

  function tone(f, t, dur, type, vol, dest, opt = {}) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (opt.to) o.frequency.exponentialRampToValueAtTime(Math.max(20, opt.to), t + dur);
    if (opt.vib) {
      const l = ac.createOscillator(), lg = ac.createGain();
      l.frequency.value = opt.vib; lg.gain.value = opt.vibDepth || 12;
      l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + dur + 0.05);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.setValueAtTime(vol, t + Math.max(0.006, dur * 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = o;
    if (opt.band) { const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = opt.band; bp.Q.value = opt.q || 2; o.connect(bp); node = bp; }
    node.connect(g).connect(dest);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(t, dur, vol, dest, hp = 1000, lp = 0) {
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = s.connect(f);
    if (lp) { const l = ac.createBiquadFilter(); l.type = "lowpass"; l.frequency.value = lp; n = n.connect(l); }
    n.connect(g).connect(dest);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }

  // ---------- efectos ----------
  const FX = {
    jump: t => tone(260, t, 0.13, "square", 0.12, sfxGain, { to: 620 }),
    coin: t => { tone(988, t, 0.06, "square", 0.1, sfxGain); tone(1319, t + 0.06, 0.16, "square", 0.1, sfxGain); },
    throw: t => { noise(t, 0.06, 0.15, sfxGain, 2000); tone(520, t, 0.1, "square", 0.08, sfxGain, { to: 220 }); },
    hit: t => { noise(t, 0.09, 0.3, sfxGain, 400); tone(220, t, 0.12, "square", 0.12, sfxGain, { to: 70 }); },
    break: t => { noise(t, 0.18, 0.25, sfxGain, 600); tone(300, t, 0.15, "triangle", 0.15, sfxGain, { to: 60 }); },
    hurt: t => { tone(440, t, 0.28, "sawtooth", 0.12, sfxGain, { to: 90 }); noise(t, 0.12, 0.2, sfxGain, 800); },
    kazoo: t => {
      tone(392, t, 0.22, "sawtooth", 0.2, sfxGain, { vib: 7, vibDepth: 14, band: 1300, q: 1.6 });
      tone(523, t + 0.2, 0.32, "sawtooth", 0.2, sfxGain, { vib: 7, vibDepth: 16, band: 1400, q: 1.6, to: 560 });
    },
    blink: t => { tone(1400, t, 0.16, "sine", 0.16, sfxGain, { to: 180 }); noise(t, 0.1, 0.12, sfxGain, 3000); },
    bonk: t => tone(140, t, 0.12, "square", 0.12, sfxGain, { to: 90 }),
    glitch: t => { for (let i = 0; i < 9; i++) tone(SS.rand(120, 1800), t + i * 0.035, 0.04, "square", 0.07, sfxGain); },
    knock: t => { tone(110, t, 0.08, "triangle", 0.4, sfxGain, { to: 70 }); tone(110, t + 0.18, 0.08, "triangle", 0.4, sfxGain, { to: 70 }); },
    door: t => { noise(t, 0.25, 0.12, sfxGain, 300, 1500); tone(180, t, 0.2, "triangle", 0.15, sfxGain, { to: 120 }); },
    blip: t => tone(820, t, 0.025, "square", 0.04, sfxGain),
    select: t => tone(660, t, 0.04, "square", 0.08, sfxGain),
    confirm: t => { tone(660, t, 0.06, "square", 0.09, sfxGain); tone(990, t + 0.06, 0.1, "square", 0.09, sfxGain); },
    pause: t => { tone(880, t, 0.06, "square", 0.08, sfxGain); tone(660, t + 0.07, 0.08, "square", 0.08, sfxGain); },
    die: t => [523, 440, 349, 262, 196].forEach((f, i) => tone(f, t + i * 0.09, 0.12, "square", 0.11, sfxGain)),
    open: t => { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, t + i * 0.06, 0.2, "square", 0.08, sfxGain)); noise(t + 0.3, 0.6, 0.08, sfxGain, 5000); },
    jingle: t => [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.08, i === 3 ? 0.3 : 0.1, "square", 0.1, sfxGain)),
    gold: t => [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, t + i * 0.05, 0.14, "square", 0.08, sfxGain)),
    crash: t => { noise(t, 0.45, 0.35, sfxGain, 200); tone(160, t, 0.3, "sawtooth", 0.12, sfxGain, { to: 40 }); },
    zap: t => { tone(1800, t, 0.5, "sawtooth", 0.12, sfxGain, { to: 60 }); noise(t, 0.5, 0.2, sfxGain, 1500); },
    clink: t => { tone(2093, t, 0.12, "triangle", 0.15, sfxGain); tone(2637, t + 0.15, 0.2, "triangle", 0.1, sfxGain); },
    buy: t => [659, 880, 1319].forEach((f, i) => tone(f, t + i * 0.05, 0.1, "square", 0.09, sfxGain)),
    swap: t => { tone(500, t, 0.05, "square", 0.08, sfxGain); tone(750, t + 0.05, 0.05, "square", 0.08, sfxGain); },
  };
  A.sfx = name => { if (!ac || !SS.settings.sfx) return; const f = FX[name]; if (f) f(ac.currentTime + 0.005); };

  // ---------- música ----------
  // Cada paso es una corchea. "-" es silencio y "=" alarga la nota anterior.
  // Batería: k bombo, s tarola, h hi-hat, x bombo+hat, o hat abierto.
  const TRACKS = {
    title: { bpm: 132,
      lead: "C5 = = E5 G5 = C6 = | B5 = G5 = A5 = G5 = | F5 = = A5 C6 = F6 = | E6 = D6 = C6 = = - | A5 = = C6 E6 = A6 = | G6 = E6 = D6 = C6 = | D6 = = C6 B5 = G5 = | C6 = = = - - G5 -",
      bass: "C3 - C4 - C3 - C4 - | G2 - G3 - G2 - G3 - | F2 - F3 - F2 - F3 - | C3 - C4 - G2 - G3 - | A2 - A3 - A2 - A3 - | C3 - C4 - C3 - C4 - | G2 - G3 - G2 - G3 - | C3 - C4 - G2 - B2 -",
      drums: "k - h - s - h - | k - h k s - h h" },
    culiacan: { bpm: 150,
      lead: "F5 = A5 = C6 = A5 = | Bb5 = G5 = E5 = C5 = | C5 D5 E5 F5 G5 = A5 = | F5 = = = C5 = = - | D5 = F5 = A5 = D6 = | C6 = Bb5 = A5 = G5 = | A5 G5 F5 E5 D5 = E5 = | F5 = = = - - C5 -",
      bass: "F2 - C3 - F2 - C3 - | C2 - G2 - C2 - G2 - | F2 - C3 - F2 - C3 - | F2 - C3 - F2 - C3 - | Bb1 - F2 - Bb1 - F2 - | F2 - C3 - F2 - C3 - | C2 - G2 - C2 - G2 - | F2 - C3 - F2 - C2 -",
      drums: "k h s h k h s h | k h s h k k s s" },
    glitch: { bpm: 128,
      lead: "E5 - E5 F5 E5 - D#5 - | E5 - G5 - F#5 - D#5 - | E5 - E5 F5 E5 - B4 - | C5 = B4 = A#4 = B4 = | E5 - E5 F5 E5 - D#5 - | G5 - F#5 - F5 - E5 - | A5 - G5 - F#5 - D#5 - | E5 = = = - - - -",
      bass: "E2 E2 E3 E2 E2 E2 E3 E2 | E2 E2 E3 E2 E2 E2 E3 E2 | E2 E2 E3 E2 E2 E2 E3 E2 | C2 C2 C3 C2 B1 B1 B2 B1",
      drums: "k h k h s h k h | k h k k s h s s" },
    van: { bpm: 96,
      lead: "E5 = = C5 D5 = E5 = | F5 = = D5 A4 = = - | G5 = F5 E5 D5 = B4 = | C5 = = = E5 = G5 = | A5 = = G5 E5 = C5 = | D5 = F5 = A5 = G5 = | F5 = E5 = D5 = G4 = | C5 = = = - - - -",
      bass: "A2 - E3 - A2 - G2 - | D2 - A2 - D3 - C3 - | G2 - D3 - G2 - B2 - | C3 - G2 - C3 - E3 -",
      drums: "k - h - s - h h" },
    drive: { bpm: 168,
      lead: "A5 = A5 = C6 = A5 = | G5 = E5 = D5 = E5 = | F5 = F5 = A5 = F5 = | E5 = G#5 = B5 = E6 = | A5 = C6 = E6 = D6 = | C6 = B5 = A5 = G5 = | F5 = A5 = D6 = C6 = | B5 = = = E5 = G#5 =",
      bass: "A2 A3 A2 A3 A2 A3 A2 A3 | G2 G3 G2 G3 G2 G3 G2 G3 | F2 F3 F2 F3 F2 F3 F2 F3 | E2 E3 E2 E3 E2 E3 E2 E3 | A2 A3 A2 A3 A2 A3 A2 A3 | C3 C4 C3 C4 C3 C4 C3 C4 | D2 D3 D2 D3 D2 D3 D2 D3 | E2 E3 E2 E3 E2 E3 E2 E3",
      drums: "k h s h k k s h" },
    flash: { bpm: 70,
      lead: "E5 = = = D#5 = = = | C5 = = = B4 = = = | E5 = G5 = F#5 = D#5 = | E5 = = = = = = -",
      bass: "E2 = = = = = = = | A1 = = = = = = = | C2 = = = = = = = | B1 = = = = = = =",
      drums: "-" },
  };
  Object.assign(TRACKS, {
    cesar: { bpm: 112, lead: "D5 - F5 - A5 - G5 F5 | E5 - - C5 D5 - - - | D5 - F5 - A5 - C6 A5 | G5 = F5 = E5 = D5 -", bass: "D3 - A2 - D3 - A2 - | C3 - G2 - C3 - G2 - | Bb2 - F2 - Bb2 - F2 - | A2 - E2 - A2 - C3 -", drums: "k - h - s - h h" },
    jesus: { bpm: 96, lead: "A5 - - A5 - - C6 - | B5 - - G5 - - E5 - | F5 - - F5 - - A5 - | G5 = = E5 = = - -", bass: "A2 - - A2 - - A2 - | E2 - - E2 - - E2 - | F2 - - F2 - - F2 - | G2 - - G2 - - G2 -", drums: "k - - s k - s -" },
    carlos: { bpm: 140, lead: "C5 C5 E5 G5 C6 - G5 - | A5 A5 G5 E5 D5 - - - | F5 F5 A5 C6 B5 - G5 - | C6 - B5 - C6 - - -", bass: "C3 - G2 - C3 - G2 - | F2 - C3 - G2 - D3 - | F2 - C3 - G2 - D3 - | C3 - G2 - C3 - - -", drums: "s s k s s s k s" },
    daniel: { bpm: 160, lead: "E5 E5 G5 E5 A5 G5 E5 D5 | E5 - B4 - D5 - E5 - | G5 G5 A5 G5 B5 A5 G5 E5 | F#5 - - - D#5 - - -", bass: "E2 E3 E2 E3 E2 E3 E2 E3 | E2 E3 E2 E3 D2 D3 D2 D3 | C2 C3 C2 C3 C2 C3 C2 C3 | B1 B2 B1 B2 B1 B2 B1 B2", drums: "k h s h k k s h" },
    telenovela: { bpm: 84, lead: "A5 = = = C6 = B5 A5 | G#5 = = = E5 = = - | F5 = = = A5 = G5 F5 | E5 = = = = = = -", bass: "A2 = = = E3 = = = | E2 = = = B2 = = = | D2 = = = A2 = = = | E2 = = = E2 = = =", drums: "k - - - s - - -" },
    anime: { bpm: 170, lead: "D5 F#5 A5 D6 C#6 A5 F#5 A5 | B5 = A5 = F#5 = E5 = | G5 B5 D6 G6 F#6 D6 B5 D6 | E6 = = = C#6 = = =", bass: "D3 D3 D3 D3 A2 A2 A2 A2 | B2 B2 B2 B2 F#2 F#2 F#2 F#2 | G2 G2 G2 G2 D3 D3 D3 D3 | A2 A2 A2 A2 A2 A2 A2 A2", drums: "k h s h k h s s" },
    lucha: { bpm: 150, lead: "Bb4 - D5 - F5 - Bb5 - | A5 - F5 - C5 - F5 - | G5 - Eb5 - Bb4 - G5 - | F5 = = = - - - -", bass: "Bb2 - F2 - Bb2 - F2 - | F2 - C3 - F2 - C3 - | Eb2 - Bb2 - Eb2 - Bb2 - | F2 - C3 - F2 - F2 -", drums: "k - s - k k s -" },
    prehistoria: { bpm: 120, lead: "D5 - F5 - G5 - A5 - | C6 - A5 - G5 - - - | F5 - G5 - A5 - D5 - | C5 - D5 - - - - -", bass: "D2 - - D2 - - D2 - | C2 - - C2 - - C2 - | Bb1 - - Bb1 - - Bb1 - | A1 - - A1 - - A1 -", drums: "k - k s - k s s" },
    internet: { bpm: 128, lead: "C5 Eb5 G5 C6 G5 Eb5 C5 G4 | Ab4 C5 Eb5 Ab5 Eb5 C5 Ab4 Eb4 | Bb4 D5 F5 Bb5 F5 D5 Bb4 F4 | G4 B4 D5 G5 D5 B4 G4 D4", bass: "C3 - C3 - C3 - C3 - | Ab2 - Ab2 - Ab2 - Ab2 - | Bb2 - Bb2 - Bb2 - Bb2 - | G2 - G2 - G2 - G2 -", drums: "k h k h s h k h" },
    abandonados: { bpm: 76, lead: "E5 = - - F5 = - - | E5 = - - C5 = - - | D5 = - - Eb5 = - - | D5 = = = - - - -", bass: "A1 = = = = = = = | F1 = = = = = = = | G1 = = = = = = = | E1 = = = = = = =", drums: "-" },
    papelera: { bpm: 118, lead: "A4 - A4 - C5 - A4 - | E5 - D5 - C5 - B4 - | A4 - A4 - C5 - E5 - | F5 - E5 - D#5 - E5 -", bass: "A2 A2 A2 A2 A2 A2 A2 A2 | F2 F2 F2 F2 E2 E2 E2 E2 | A2 A2 A2 A2 A2 A2 A2 A2 | D2 D2 D2 D2 E2 E2 E2 E2", drums: "k - s - k k s -" },
    boss: { bpm: 160, lead: "C5 C5 Eb5 C5 G5 C5 Ab5 G5 | F5 F5 Ab5 F5 C6 F5 B5 G5 | C5 C5 Eb5 C5 G5 C5 Bb5 Ab5 | G5 = F5 = Eb5 = D5 =", bass: "C2 C3 C2 C3 C2 C3 C2 C3 | F2 F3 F2 F3 G2 G3 G2 G3 | C2 C3 C2 C3 Ab2 Ab3 Ab2 Ab3 | G2 G3 G2 G3 G2 G3 G2 G3", drums: "k h s h k k s h" },
    cero: { bpm: 172, lead: "E5 G5 B5 E6 D6 B5 G5 B5 | C6 = B5 = A5 = G5 = | E5 G5 B5 E6 F6 E6 D#6 E6 | B5 = = = G#5 = = =", bass: "E2 E3 E2 E3 E2 E3 E2 E3 | A2 A3 A2 A3 B2 B3 B2 B3 | C3 C4 C3 C4 C3 C4 C3 C4 | B2 B3 B2 B3 B2 B3 B2 B3", drums: "k h s h k s s h" },
  });
  TRACKS.credits = Object.assign({}, TRACKS.title, { bpm: 92, drums: "k - h - s - h -" });
  const parse = s => s.replace(/\|/g, " ").trim().split(/\s+/);
  for (const k in TRACKS) { const t = TRACKS[k]; t.L = parse(t.lead); t.B = parse(t.bass); t.D = parse(t.drums); }
  A.trackNames = { title: "Tema de SUPER SIMULATOR", culiacan: "Corrido del Repartidor", glitch: "Cuadritos Grises", van: "Kazoovan FM", drive: "Carretera a la Colonia", flash: "Dimensión 01", cesar: "Sigilo en el Cuarto", jesus: "Perreo de Pierna", carlos: "Marcha del Lunes", daniel: "Pelea en La Primavera", telenovela: "Amores de Guamúchil", anime: "Opening de Carlos", lucha: "Tercera Caída", prehistoria: "Tambores del Tacosaurio", internet: "400 Pestañas", abandonados: "Proyectos Abandonados", papelera: "La Papelera", boss: "Jefe", cero: "SIMULATOR CERO", credits: "Gracias por Jugar" };

  function holdLen(arr, i) { let n = 1; while (arr[(i + n) % arr.length] === "=" && n < arr.length) n++; return n; }
  function playStep(i, t, spb) {
    const L = track.L, B = track.B, D = track.D;
    const li = i % L.length, l = L[li];
    if (l !== "-" && l !== "=") tone(freq(l), t, spb * holdLen(L, li) * 0.95, "square", 0.07, musicGain);
    const bi = i % B.length, b = B[bi];
    if (b !== "-" && b !== "=") tone(freq(b), t, spb * holdLen(B, bi) * 0.9, "triangle", 0.2, musicGain);
    const d = D[i % D.length];
    if (d === "k" || d === "x") tone(150, t, 0.11, "sine", 0.35, musicGain, { to: 45 });
    if (d === "s") noise(t, 0.1, 0.16, musicGain, 1800);
    if (d === "h" || d === "x") noise(t, 0.03, 0.06, musicGain, 7000);
    if (d === "o") noise(t, 0.12, 0.06, musicGain, 6000);
  }
  function schedule() {
    if (!track) return;
    const spb = 60 / track.bpm / 2;
    while (nextTime < ac.currentTime + 0.15) { playStep(step, nextTime, spb); step++; nextTime += spb; }
  }
  A.music = name => {
    wanted = name;
    if (name === current) return;
    if (!ac) return;
    current = name;
    clearInterval(timer);
    track = name ? TRACKS[name] : null;
    if (!track) return;
    step = 0;
    nextTime = ac.currentTime + 0.08;
    timer = setInterval(schedule, 30);
    schedule();
  };
  A.current = () => wanted;
})();
