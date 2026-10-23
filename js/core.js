// SUPER SIMULATOR · núcleo: pantalla, controles, guardado, escenas y bucle principal
(() => {
  "use strict";
  const SS = (window.SS = {});
  SS.W = 384;
  SS.H = 216;
  SS.T = 16;
  SS.time = 0;

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  SS.canvas = canvas;
  SS.ctx = ctx;
  const stage = document.getElementById("stage");

  function fit() {
    const vw = window.innerWidth, vh = window.innerHeight;
    let s = Math.min(vw / SS.W, vh / SS.H);
    if (s >= 2) s = Math.floor(s);
    const w = Math.floor(SS.W * s), h = Math.floor(SS.H * s);
    stage.style.width = w + "px";
    stage.style.height = h + "px";
    stage.style.left = Math.floor((vw - w) / 2) + "px";
    stage.style.top = Math.floor((vh - h) / 2) + "px";
    stage.style.setProperty("--u", s + "px");
    SS.scale = s;
  }
  window.addEventListener("resize", fit);
  fit();

  // ---------- utilidades ----------
  SS.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  SS.lerp = (a, b, t) => a + (b - a) * t;
  SS.rand = (a, b) => a + Math.random() * (b - a);
  SS.pick = arr => arr[(Math.random() * arr.length) | 0];
  SS.approach = (v, t, d) => (v < t ? Math.min(v + d, t) : Math.max(v - d, t));
  SS.hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
  // la fuente pixel no trae mayúsculas con acento: les quitamos el acento (la Ñ se queda)
  SS.caps = s => String(s).normalize("NFD").replace(/[́̀̈]/g, "").normalize("NFC");

  // ---------- guardado (si el navegador lo bloquea, el juego sigue sin guardar) ----------
  SS.store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const SAVE_KEY = "supersim_save_v1";
  SS.newSave = () => ({
    v: 1, stage: "cold", feria: 0, got: {}, glitch: 0, maxHearts: 3, upgrades: {},
    party: ["kazoo"], active: "kazoo", flags: {}, delivered: {}, checkpoint: null, time: 0,
    done: {}, run: null, bonds: { cesar: 0, jesus: 0, carlos: 0, daniel: 0 }, talks: {}, missions: {},
    endings: {}, unlocked: {}, games: {}, deaths: 0,
  });
  SS.save = null;
  SS.hasSave = () => !!SS.store.get(SAVE_KEY);
  SS.loadSave = () => { SS.save = Object.assign(SS.newSave(), SS.store.get(SAVE_KEY) || {}); return SS.save; };
  SS.writeSave = () => { if (SS.save) SS.store.set(SAVE_KEY, SS.save); };
  SS.wipeSave = () => SS.store.del(SAVE_KEY);
  SS.settings = Object.assign({ music: true, sfx: true }, SS.store.get("supersim_settings") || {});
  SS.writeSettings = () => SS.store.set("supersim_settings", SS.settings);
  SS.countGot = prefix => Object.keys(SS.save ? SS.save.got : {}).filter(k => k.startsWith(prefix)).length;

  // ---------- controles: teclado, control y pantalla táctil ----------
  const KEYMAP = {
    ArrowLeft: ["left"], KeyA: ["left"], ArrowRight: ["right"], KeyD: ["right"],
    ArrowUp: ["up"], KeyW: ["up"], ArrowDown: ["down"], KeyS: ["down"],
    Space: ["jump", "confirm"], Enter: ["confirm"], KeyJ: ["attack"], KeyZ: ["attack"],
    KeyK: ["special"], KeyX: ["special"], KeyL: ["ability"], KeyC: ["ability"],
    ShiftLeft: ["run"], ShiftRight: ["run"], KeyQ: ["swapL"], KeyE: ["swapR"],
    Escape: ["pause", "back"], KeyP: ["pause"], Backspace: ["back"],
  };
  // "tapped" guarda las teclas que se presionaron y soltaron entre dos cuadros, para no perder toques rápidos
  const input = (SS.input = { keys: {}, tapped: {}, touch: {}, touchTapped: {}, down: {}, prev: {}, digit: 0, lastDevice: "kb", autoRun: false });

  window.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (KEYMAP[e.code] || /^Digit[1-5]$/.test(e.code)) e.preventDefault();
    input.keys[e.code] = true;
    input.tapped[e.code] = true;
    input.lastDevice = "kb";
    if (/^Digit[1-5]$/.test(e.code) && !e.repeat) input.digit = +e.code.slice(5);
    SS.audio && SS.audio.unlock();
  });
  window.addEventListener("keyup", e => { input.keys[e.code] = false; });
  window.addEventListener("blur", () => { input.keys = {}; input.touch = {}; });
  window.addEventListener("pointerdown", () => SS.audio && SS.audio.unlock());

  // jugador 2: un control propio (input.p2Pad). El resto de los controles son del jugador 1.
  input.p2Pad = null;
  input.lastPad = null;
  input.down2 = {}; input.prev2 = {};
  function readPad(gp, d) {
    const b = i => gp.buttons[i] && gp.buttons[i].pressed;
    const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    if (b(14) || ax < -0.4) d.left = true;
    if (b(15) || ax > 0.4) d.right = true;
    if (b(12) || ay < -0.6) d.up = true;
    if (b(13) || ay > 0.6) d.down = true;
    if (b(0)) d.jump = d.confirm = true;
    if (b(2)) d.attack = true;
    if (b(3)) d.special = true;
    if (b(1)) d.ability = d.back = true;
    if (b(4)) d.swapL = true;
    if (b(5)) d.swapR = true;
    if (b(6) || b(7)) d.run = true;
    if (b(9)) d.pause = true;
    return gp.buttons.some(x => x.pressed);
  }
  input.update = () => {
    input.prev = input.down; input.prev2 = input.down2;
    const d = {}, d2 = {};
    for (const code in input.keys) if (input.keys[code] && KEYMAP[code]) KEYMAP[code].forEach(a => (d[a] = true));
    for (const code in input.tapped) if (KEYMAP[code]) KEYMAP[code].forEach(a => (d[a] = true));
    input.tapped = {};
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of pads) {
      if (!gp) continue;
      if (gp.index === input.p2Pad) { readPad(gp, d2); continue; }
      if (readPad(gp, d)) { input.lastDevice = "pad"; input.lastPad = gp.index; }
    }
    for (const a in input.touch) if (input.touch[a] || input.touchTapped[a]) { d[a] = true; if (a === "jump") d.confirm = true; }
    input.touchTapped = {};
    input.down = d; input.down2 = d2;
  };
  // busca un control libre para el jugador 2
  input.joinP2 = () => {
    const pads = (navigator.getGamepads ? Array.from(navigator.getGamepads()) : []).filter(Boolean);
    const free = pads.find(gp => !(input.lastDevice === "pad" && gp.index === input.lastPad));
    if (!free) return false;
    input.p2Pad = free.index;
    return true;
  };
  input.leaveP2 = () => { input.p2Pad = null; input.down2 = {}; input.prev2 = {}; };
  input.p2 = { held: a => !!input.down2[a], hit: a => !!input.down2[a] && !input.prev2[a], takeDigit: () => 0 };
  input.held = a => !!input.down[a];
  input.hit = a => !!input.down[a] && !input.prev[a];
  input.takeDigit = () => { const v = input.digit; input.digit = 0; return v; };
  input.p1 = { held: input.held, hit: input.hit, takeDigit: input.takeDigit };

  // botones táctiles
  const touchEl = document.getElementById("touch");
  function enableTouch() {
    if (!touchEl.hidden) return;
    touchEl.hidden = false;
    document.body.classList.add("touch");
    input.autoRun = true;
  }
  window.addEventListener("touchstart", () => { input.lastDevice = "touch"; enableTouch(); }, { passive: true });
  if (window.matchMedia && matchMedia("(pointer: coarse)").matches) { input.lastDevice = "touch"; enableTouch(); }
  touchEl.querySelectorAll("button").forEach(btn => {
    const act = btn.dataset.act;
    const on = e => { e.preventDefault(); input.touch[act] = true; input.touchTapped[act] = true; btn.classList.add("on"); SS.audio && SS.audio.unlock(); try { btn.setPointerCapture(e.pointerId); } catch (err) {} };
    const off = e => { e.preventDefault(); input.touch[act] = false; btn.classList.remove("on"); };
    btn.addEventListener("pointerdown", on);
    btn.addEventListener("pointerup", off);
    btn.addEventListener("pointercancel", off);
    btn.addEventListener("lostpointercapture", off);
  });

  // ---------- escenas y transición pixelada ----------
  SS.scene = null;
  SS.trans = null;
  SS.shake = 0;
  SS.paused = false;
  SS.go = (make, fast) => {
    if (SS.trans) return;
    SS.trans = { make, t: 0, out: true, dur: fast ? 0.22 : 0.45 };
  };
  SS.startScene = make => { SS.scene = make(); SS.scene.enter && SS.scene.enter(); };

  function tick(dt) {
    SS.time += dt;
    input.update();
    SS.ui.update(dt);
    SS.shake = Math.max(0, SS.shake - dt * 18);
    if (SS.trans) {
      const tr = SS.trans;
      tr.t += dt / tr.dur;
      if (tr.out && tr.t >= 1) {
        if (SS.scene && SS.scene.exit) SS.scene.exit();
        SS.ui.clearScene();
        SS.paused = false;
        SS.scene = tr.make();
        SS.scene.enter && SS.scene.enter();
        tr.out = false;
        tr.t = 0;
      } else if (!tr.out && tr.t >= 1) SS.trans = null;
      if (!tr.out && SS.scene) SS.scene.update(dt);
      return;
    }
    if (SS.paused) return;
    if (SS.scene) SS.scene.update(dt);
  }

  function drawTrans(p) {
    const B = 16;
    ctx.fillStyle = "#07051a";
    for (let y = 0; y < SS.H; y += B) for (let x = 0; x < SS.W; x += B) {
      if (SS.hash(x * 7.13 + y * 3.71) < p) ctx.fillRect(x, y, B, B);
    }
  }

  function draw() {
    ctx.save();
    if (SS.shake > 0.5) ctx.translate(Math.round(SS.rand(-SS.shake, SS.shake)), Math.round(SS.rand(-SS.shake, SS.shake)));
    if (SS.scene) SS.scene.draw(ctx);
    ctx.restore();
    if (SS.trans) drawTrans(SS.trans.out ? SS.trans.t : 1 - SS.trans.t);
  }

  const STEP = 1 / 60;
  let last = performance.now(), acc = 0;
  function frame(now) {
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    while (acc >= STEP) { tick(STEP); acc -= STEP; }
    draw();
    requestAnimationFrame(frame);
  }
  SS.run = () => requestAnimationFrame(t => { last = t; frame(t); });
  // para pruebas: avanza n cuadros a mano aunque la pestaña esté en segundo plano
  SS.step = n => { for (let i = 0; i < n; i++) tick(STEP); draw(); };

  // rasgadura de pantalla tipo glitch (copia una franja del canvas sobre sí mismo, sin leer pixeles)
  SS.tear = (c, h, amp) => {
    const y = (Math.random() * (SS.H - h)) | 0;
    c.drawImage(SS.canvas, 0, y, SS.W, h, Math.round(SS.rand(-amp, amp)), y, SS.W, h);
  };

  // ---------- guiones de escenas (corrutinas) ----------
  SS.Script = class {
    constructor(gen) { this.gen = gen; this.cur = null; this.done = false; this.advance(); }
    advance() { const r = this.gen.next(); if (r.done) { this.done = true; this.cur = null; } else this.cur = r.value; }
    update(dt) {
      let guard = 0;
      while (!this.done && guard++ < 50) {
        if (!this.cur) { this.advance(); continue; }
        if (this.cur.update(dt)) { this.advance(); dt = 0; } else break;
      }
    }
  };
  SS.wait = s => ({ t: 0, update(dt) { return (this.t += dt) >= s; } });
  SS.say = lines => ({ started: false, update() { if (!this.started) { this.started = true; SS.ui.dialog(lines); return false; } return !SS.ui.dialogOpen(); } });
  SS.until = fn => ({ update: () => !!fn() });
  SS.call = fn => ({ update() { fn(); return true; } });
  SS.moveTo = (actor, x, speed = 60) => ({ update(dt) {
    const d = x - actor.x;
    if (Math.abs(d) < 1) { actor.x = x; actor.pose = "idle"; return true; }
    actor.facing = d > 0 ? 1 : -1;
    actor.x += Math.sign(d) * Math.min(Math.abs(d), speed * dt);
    actor.pose = "run";
    return false;
  } });
})();
