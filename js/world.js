// SUPER SIMULATOR · mundo de plataformas: tiles, física, jugadores, enemigos y objetos
(() => {
  "use strict";
  const T = SS.T;
  const SOLID = new Set(["#", "Q", "F", "X", "W", "G", "B", "V"]);
  const ONEWAY = new Set(["=", "-", "R"]);
  const HAZARD = new Set(["^", "L"]);
  SS.SOLID = SOLID; SS.ONEWAY = ONEWAY;

  // ---------- nivel ----------
  class Level {
    constructor(w, h, theme = "culiacan") {
      this.w = w; this.h = h; this.theme = theme;
      const g = () => Array.from({ length: h }, () => Array(w).fill("."));
      this.base = g(); this.over = g();
      this.glitch = false;
      this.decor = []; this.spawns = []; this.items = []; this.lamps = []; this.objects = []; this.guards = []; this.arenas = []; this.todos = [];
    }
    fill(x0, y0, x1, y1, ch, layer = "base") {
      const g = this[layer];
      for (let y = Math.max(0, y0); y <= Math.min(this.h - 1, y1); y++)
        for (let x = Math.max(0, x0); x <= Math.min(this.w - 1, x1); x++) g[y][x] = ch;
    }
    at(tx, ty) {
      if (tx < 0 || tx >= this.w) return "W";
      if (ty < 0 || ty >= this.h) return ".";
      if (this.glitch) { const o = this.over[ty][tx]; if (o !== ".") return o === "_" ? "." : o; }
      return this.base[ty][tx];
    }
    solidAt(tx, ty) { return SOLID.has(this.at(tx, ty)); }
    blinkOn(tx) { return Math.floor((SS.time + Math.floor(tx / 3) * 0.8) / 1.7) % 2 === 0; }
    set(tx, ty, ch) { if (tx >= 0 && tx < this.w && ty >= 0 && ty < this.h) { this.base[ty][tx] = ch; if (this.over[ty][tx] !== ".") this.over[ty][tx] = "."; } }
  }
  SS.Level = Level;

  // ---------- colisión con tiles ----------
  SS.collide = (lv, b, dt) => {
    let hitWall = false;
    b.x += b.vx * dt;
    const y0 = Math.floor(b.y / T), y1 = Math.floor((b.y + b.h - 0.01) / T);
    if (b.vx > 0) {
      const tx = Math.floor((b.x + b.w - 0.01) / T);
      for (let ty = y0; ty <= y1; ty++) if (lv.solidAt(tx, ty)) { b.x = tx * T - b.w; b.vx = 0; hitWall = true; break; }
    } else if (b.vx < 0) {
      const tx = Math.floor(b.x / T);
      for (let ty = y0; ty <= y1; ty++) if (lv.solidAt(tx, ty)) { b.x = (tx + 1) * T; b.vx = 0; hitWall = true; break; }
    }
    const prevBottom = b.y + b.h;
    b.onGround = false;
    b.y += b.vy * dt;
    const x0 = Math.floor(b.x / T), x1 = Math.floor((b.x + b.w - 0.01) / T);
    if (b.vy > 0) {
      const ty = Math.floor((b.y + b.h - 0.01) / T);
      for (let tx = x0; tx <= x1; tx++) {
        const c = lv.at(tx, ty);
        const top = prevBottom <= ty * T + 0.5 && !b.dropT;
        const plat = (ONEWAY.has(c) || (c === "!" && lv.blinkOn(tx)) || (c === "~" && b.walkWater));
        if (SOLID.has(c) || (plat && top)) {
          b.y = ty * T - b.h; b.vy = 0; b.onGround = true;
          if (c === "R" && b.bouncy) { b.vy = -560; b.onGround = false; b.sprung = true; }
          break;
        }
      }
    } else if (b.vy < 0) {
      const ty = Math.floor(b.y / T);
      for (let tx = x0; tx <= x1; tx++) if (lv.solidAt(tx, ty)) { b.y = (ty + 1) * T; b.vy = 0; break; }
    }
    return hitWall;
  };
  SS.overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  function tilesUnder(lv, x, y, w, h, fn) {
    for (let ty = Math.floor(y / T); ty <= Math.floor((y + h - 0.01) / T); ty++)
      for (let tx = Math.floor(x / T); tx <= Math.floor((x + w - 0.01) / T); tx++) if (fn(lv.at(tx, ty), tx, ty)) return true;
    return false;
  }
  SS.tilesUnder = tilesUnder;

  // ---------- partículas ----------
  SS.Particles = class {
    constructor() { this.list = []; }
    burst(x, y, n, cols, speed = 90, grav = 300, life = 0.6, size = 2) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = speed * (0.4 + Math.random() * 0.8);
        this.list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - speed * 0.3, g: grav, life: life * (0.6 + Math.random() * 0.6), max: life, c: SS.pick(cols), s: size });
      }
    }
    add(p) { this.list.push(Object.assign({ vx: 0, vy: 0, g: 0, life: 0.5, max: 0.5, c: "#fff", s: 2 }, p)); }
    update(dt) {
      for (const p of this.list) { p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
      if (this.list.length > 600) this.list.splice(0, this.list.length - 600);
      this.list = this.list.filter(p => p.life > 0);
    }
    draw(ctx, cam) {
      for (const p of this.list) {
        ctx.globalAlpha = Math.min(1, (p.life / p.max) * 2);
        ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x - cam.x), Math.round(p.y - cam.y), p.s, p.s);
      }
      ctx.globalAlpha = 1;
    }
  };

  // ---------- jugador ----------
  SS.Player = class {
    constructor(x, y, opts = {}) {
      this.idx = opts.idx || 0;
      this.inp = this.idx === 1 ? SS.input.p2 : SS.input.p1;
      this.char = opts.char || SS.save.active || "kazoo";
      const [w, h] = (SS.CHARS[this.char] || SS.CHARS.kazoo).size || [10, 22];
      Object.assign(this, {
        x, y, w, h, vx: 0, vy: 0, facing: 1, onGround: false, coyote: 0, buffer: 0,
        hearts: SS.save.maxHearts, inv: 0, hurtT: 0, anim: 0, actT: 0, act: null, dropT: 0,
        cds: {}, dead: false, frozen: false, ghosts: [], safeT: 0,
        invis: 0, disguise: 0, hidden: false, combo: 0, comboT: 0, zip: null, flaps: 0, bouncy: true,
      });
      this.y = y + 22 - h;
      this.lastSafe = { x, y: this.y };
    }
    get def() { return SS.CHARS[this.char] || SS.CHARS.kazoo; }
    // cada compa tiene sus propios tiempos de recarga (cambiar de compa no los reinicia)
    get cd() { return this.cds[this.char] || (this.cds[this.char] = { attack: 0, special: 0, ability: 0 }); }
    get cx() { return this.x + this.w / 2; }
    get cy() { return this.y + this.h / 2; }
    get walkWater() { return !!this.def.walkWater; }
    setChar(id) {
      const [w, h] = SS.CHARS[id].size || [10, 22];
      const feet = this.y + this.h, mid = this.cx;
      this.char = id; this.w = w; this.h = h;
      this.x = mid - w / 2; this.y = feet - h;
      this.invis = this.disguise = 0;
    }
    update(dt, sc) {
      const I = this.inp, lv = sc.level, D = this.def;
      for (const c in this.cds) for (const k in this.cds[c]) this.cds[c][k] = Math.max(0, this.cds[c][k] - dt);
      this.inv = Math.max(0, this.inv - dt);
      this.hurtT = Math.max(0, this.hurtT - dt);
      this.actT = Math.max(0, this.actT - dt);
      this.dropT = Math.max(0, this.dropT - dt);
      this.invis = Math.max(0, this.invis - dt);
      this.disguise = Math.max(0, this.disguise - dt);
      this.comboT = Math.max(0, this.comboT - dt);
      if (this.comboT <= 0) this.combo = 0;
      this.ghosts = this.ghosts.filter(g => (g.life -= dt) > 0);
      const control = !this.frozen && !this.dead && !sc.blocking();
      const inverted = sc.invertControls && sc.invertControls();

      // escondido detrás de algo
      const hideObj = control && I.held("down") && this.onGround ? sc.findObj && sc.findObj(this, ["hide"], 14) : null;
      this.hidden = !!hideObj;

      // jalón con las greñas (Daniel)
      if (this.zip) {
        const z = this.zip, dx = z.x - this.x, dy = z.y - this.y, d = Math.hypot(dx, dy);
        if (d < 8 || (z.t -= dt) <= 0) { this.zip = null; this.vy = -280; this.vx = this.facing * 80; }
        else { this.vx = (dx / d) * 360; this.vy = (dy / d) * 360; this.x += this.vx * dt; this.y += this.vy * dt; this.anim += dt * 10; return; }
      }

      let dir = 0;
      if (control && !this.hidden) dir = (I.held("right") ? 1 : 0) - (I.held("left") ? 1 : 0);
      if (inverted) dir = -dir;
      if (this.hurtT > 0) dir = 0;
      const run = I.held("run") || (this.idx === 0 && SS.input.autoRun);
      const maxV = (run ? 150 : 95) * (D.speed || 1);
      if (dir) { this.vx = SS.approach(this.vx, dir * maxV, (this.onGround ? 1000 : 650) * dt); this.facing = dir; }
      else this.vx = SS.approach(this.vx, 0, (this.onGround ? 1200 : 260) * dt);

      if (this.onGround) this.flaps = 0;
      this.coyote = this.onGround ? 0.1 : this.coyote - dt;
      this.buffer = control && I.hit("jump") ? 0.12 : this.buffer - dt;
      if (this.buffer > 0 && this.onGround && control && I.held("down") && this.standingOnOneWay(lv)) {
        this.dropT = 0.25; this.buffer = 0; this.y += 2;
      } else if (this.buffer > 0 && this.coyote > 0) {
        this.vy = -340 * (D.jump || 1); this.coyote = 0; this.buffer = 0;
        SS.audio.sfx("jump");
        sc.fx.burst(this.cx, this.y + this.h, 5, ["#d8cfb8", "#f0e8d2"], 40, 100, 0.3);
      } else if (this.buffer > 0 && D.flaps && this.flaps < D.flaps) {
        this.flaps++; this.vy = -240; this.buffer = 0; SS.audio.sfx("jump");
      }
      if (!(control && I.held("jump")) && this.vy < -130 && !this.sprung) this.vy = -130;
      if (this.vy >= 0) this.sprung = false;
      this.vy = Math.min(this.vy + 980 * dt * (D.gravity || 1), D.fall || 430);

      if (control && !this.hidden) {
        if (I.hit("attack") && this.cd.attack <= 0) { this.cd.attack = D.cd.attack; D.attack(this, sc); }
        if (I.hit("special") && this.cd.special <= 0) { this.cd.special = D.cd.special; D.special(this, sc); }
        if (I.hit("ability") && this.cd.ability <= 0) { this.cd.ability = D.cd.ability; D.ability(this, sc); }
        const digit = I.takeDigit();
        if (I.hit("swapL")) sc.swapCharacter(this, -1);
        else if (I.hit("swapR")) sc.swapCharacter(this, 1);
        else if (digit) sc.swapCharacter(this, 0, digit - 1);
      }

      if (SS.collide(lv, this, dt) && this.sprung) this.sprung = false;
      if (this.sprung && this.onGround === false && this.vy === -560) { SS.audio.sfx("jump"); }

      // peligros
      if (tilesUnder(lv, this.x + 2, this.y + 4, this.w - 4, this.h - 4, c => HAZARD.has(c))) { this.hurt(sc, this.cx - this.facing); if (!this.dead) sc.respawnSafe(this); }
      if (!this.walkWater && tilesUnder(lv, this.x + 2, this.y + this.h - 6, this.w - 4, 6, c => c === "~")) { SS.ui.toast("¡Te mojaste! Jesús sí camina sobre el agua"); this.inv = 0; this.hurt(sc, this.cx); if (!this.dead) sc.respawnSafe(this); }
      if (this.y > lv.h * T + 30 && !this.dead) {
        this.hearts--; SS.save.glitch += 1; SS.audio.sfx("hurt");
        if (this.hearts <= 0) sc.playerDie(this); else sc.respawnSafe(this);
      }

      if (this.onGround) {
        this.safeT += dt;
        if (this.safeT > 0.4) {
          this.safeT = 0;
          const below = lv.at(Math.floor(this.cx / T), Math.floor((this.y + this.h + 2) / T));
          const risky = tilesUnder(lv, this.x - 20, this.y + this.h + 2, this.w + 40, 4, c => c === "." || HAZARD.has(c) || c === "~");
          if ((SOLID.has(below) || ONEWAY.has(below)) && !risky && !(sc.arenaLock)) this.lastSafe = { x: this.x, y: this.y };
        }
      }
      if (this.onGround && Math.abs(this.vx) > 10) this.anim += dt * Math.abs(this.vx) / 11;
      else this.anim += dt * 2;
    }
    standingOnOneWay(lv) {
      const ty = Math.floor((this.y + this.h + 1) / T);
      const ok = c => ONEWAY.has(c) || c === "!";
      return ok(lv.at(Math.floor((this.x + 1) / T), ty)) && ok(lv.at(Math.floor((this.x + this.w - 1) / T), ty));
    }
    blink(sc, passes, dist) {
      const lv = sc.level, dir = this.facing;
      let best = 0;
      for (let d = 2; d <= dist; d += 2) {
        const nx = this.x + dir * d;
        if (nx < 0 || nx + this.w > lv.w * T) break;
        if (tilesUnder(lv, nx, this.y, this.w, this.h, c => SOLID.has(c) && !passes.includes(c))) break;
        if (!tilesUnder(lv, nx, this.y, this.w, this.h, c => SOLID.has(c))) best = d;
      }
      if (best < 6) { SS.audio.sfx("bonk"); this.cd.ability = 0.2; return false; }
      for (let i = 0; i < 4; i++) this.ghosts.push({ x: this.x + dir * best * (i / 4), y: this.y, life: 0.12 + i * 0.05, f: this.facing });
      sc.fx.burst(this.cx, this.cy, 10, ["#ff2bd6", "#ffd23f", "#ffffff"], 70, 0, 0.35);
      this.x += dir * best;
      this.vx = dir * 60;
      this.vy = Math.min(this.vy, 0);
      this.inv = Math.max(this.inv, 0.25);
      sc.fx.burst(this.cx, this.cy, 10, ["#ff2bd6", "#ffd23f", "#ffffff"], 70, 0, 0.35);
      SS.audio.sfx("blink");
      sc.onBlink && sc.onBlink(this);
      return true;
    }
    hurt(sc, fromX, dmg = 1) {
      if (this.inv > 0 || this.dead) return;
      if (sc.godMode) return;
      this.hearts -= dmg;
      this.inv = 1.3; this.hurtT = 0.3; this.zip = null;
      this.vx = (this.cx < fromX ? -1 : 1) * 150; this.vy = -200;
      SS.save.glitch += 1;
      SS.audio.sfx("hurt"); SS.shake = 3;
      sc.fx.burst(this.cx, this.cy, 8, ["#f4f4f4", "#e83b3b"], 80, 200, 0.4);
      if (this.hearts <= 0) sc.playerDie(this);
    }
    pose() {
      if (this.zip) return ["hang", 0];
      if (this.hurtT > 0) return ["hurt", 0];
      if (this.actT > 0 && this.act) return [this.act, 0];
      if (!this.onGround) return [this.vy < 0 ? "jump" : "fall", 0];
      if (Math.abs(this.vx) > 10) return ["run", Math.floor(this.anim) % 4];
      return ["idle", Math.floor(this.anim) % 2];
    }
    doAct(name, t = 0.18) { this.act = name; this.actT = t; }
    draw(ctx, cam) {
      for (const g of this.ghosts) SS.gfx.drawPerson(ctx, SS.gfx.SPECS.oozak, "run", 0, g.x - 3 - cam.x, g.y - 2 - cam.y, g.f, 0.35);
      if (this.inv > 0 && Math.floor(this.inv * 14) % 2 === 0 && this.hurtT <= 0) return;
      const [pose, f] = this.pose();
      const D = this.def;
      let alpha = this.invis > 0 ? 0.3 : this.hidden ? 0.45 : 1;
      const x = this.x - cam.x, y = this.y - cam.y;
      if (D.draw === "parrot") SS.gfx.parrot(ctx, x - 3, y - 4, Math.floor(SS.time * 10), this.facing);
      else if (D.draw === "husky") SS.gfx.husky(ctx, x - 2, y - 4, this.onGround && Math.abs(this.vx) > 10 ? Math.floor(this.anim) : 0, this.facing);
      else {
        const spec = this.disguise > 0 ? SS.gfx.SPECS.testigo : SS.gfx.SPECS[D.spec || this.char];
        SS.gfx.drawPerson(ctx, spec, pose, f, x - 3, y - 2, this.facing, alpha);
        if (this.disguise > 0) { ctx.fillStyle = "#ffcf3a"; ctx.fillRect(Math.round(x + 1), Math.round(y - 4), 8, 2); }
      }
      if (this.idx === 1) { ctx.fillStyle = "#2ee6d6"; ctx.font = '5px "Press Start 2P"'; ctx.textBaseline = "top"; ctx.fillText("P2", Math.round(x), Math.round(y - 10)); }
    }
  };

  // ---------- enemigos ----------
  const ET = (SS.ENEMY_TYPES = {
    blob: { w: 14, h: 12, hp: 2, ai: "walker", speed: 28, draw: "blob" },
    temp: { w: 10, h: 22, hp: 3, ai: "chaser", speed: 22, chase: 50, draw: "person", spec: "temp", tag: true },
    fly: { w: 8, h: 8, hp: 1, ai: "flyer", draw: "fly" },
    testigo: { w: 10, h: 22, hp: 3, ai: "chaser", speed: 20, chase: 46, draw: "person", spec: "testigo" },
    correo: { w: 10, h: 7, hp: 1, ai: "flyer", draw: "critter", look: "correo" },
    tlacuache: { w: 15, h: 10, hp: 2, ai: "walker", speed: 44, draw: "critter", look: "tlacuache" },
    poli: { w: 10, h: 22, hp: 4, ai: "chaser", speed: 26, chase: 62, draw: "person", spec: "poli" },
    ninja: { w: 10, h: 22, hp: 3, ai: "jumper", speed: 50, draw: "person", spec: "ninja" },
    extra: { w: 10, h: 22, hp: 3, ai: "chaser", speed: 24, chase: 55, draw: "person", spec: "extra" },
    luchador: { w: 10, h: 22, hp: 5, ai: "jumper", speed: 40, draw: "person", spec: "luchador" },
    raptor: { w: 16, h: 16, hp: 3, ai: "chaser", speed: 36, chase: 85, draw: "critter", look: "raptor" },
    popup: { w: 16, h: 12, hp: 1, ai: "flyer", draw: "critter", look: "popup" },
    bot: { w: 12, h: 16, hp: 3, ai: "shooter", speed: 18, draw: "critter", look: "bot", bullet: "bit" },
    papel: { w: 12, h: 10, hp: 2, ai: "walker", speed: 34, draw: "critter", look: "papel" },
    petalo: { w: 8, h: 8, hp: 1, ai: "flyer", draw: "critter", look: "petalo" },
    profeShoot: { w: 10, h: 22, hp: 4, ai: "shooter", speed: 0, draw: "person", spec: "profe", bullet: "reporte" },
    mama: { w: 10, h: 22, hp: 99, ai: "guard", speed: 26, draw: "person", spec: "lupe", guard: true },
    prefecto: { w: 10, h: 22, hp: 99, ai: "guard", speed: 40, draw: "person", spec: "prefecto", guard: true },
    profe: { w: 10, h: 22, hp: 99, ai: "guard", speed: 18, draw: "person", spec: "profe", guard: true },
  });
  SS.Enemy = class {
    constructor(type, x, y, opts = {}) {
      const d = ET[type];
      Object.assign(this, { type, d, x, y: y - d.h, w: d.w, h: d.h, hp: d.hp, vx: 0, vy: 0, dir: opts.dir || -1, stun: 0, flash: 0, t: Math.random() * 10, dead: false, baseX: x, baseY: y - d.h - (opts.air || 20), anim: 0, shootT: 1 + Math.random() * 2, hopT: 1 });
      if (d.ai === "guard") { this.x0 = opts.x0 !== undefined ? opts.x0 : x - 60; this.x1 = opts.x1 !== undefined ? opts.x1 : x + 60; this.turnT = 0; this.alert = 0; this.view = opts.view || 110; }
    }
    get cx() { return this.x + this.w / 2; }
    nearest(sc) { let best = null, bd = 1e9; for (const p of sc.players) { if (p.dead) continue; const d = Math.abs(p.cx - this.cx) + Math.abs(p.cy - this.y); if (d < bd) { bd = d; best = p; } } return best || sc.players[0]; }
    canSee(p) { return !(p.invis > 0 || p.disguise > 0 || p.hidden); }
    update(dt, sc) {
      const lv = sc.level, p = this.nearest(sc), d = this.d;
      this.t += dt; this.flash = Math.max(0, this.flash - dt); this.alert = Math.max(0, (this.alert || 0) - dt);
      if (this.stun > 0) { this.stun -= dt; this.vx = 0; }
      else if (d.ai === "flyer") {
        if (Math.abs(p.cx - this.baseX) < 140 && this.canSee(p)) this.baseX += Math.sign(p.cx - this.baseX) * 22 * dt;
        this.x = this.baseX + Math.sin(this.t * 1.6) * 28;
        this.y = this.baseY + Math.sin(this.t * 3.2) * 10;
      } else if (d.ai === "guard") {
        this.vx = this.dir * d.speed;
        if ((this.dir > 0 && this.x > this.x1) || (this.dir < 0 && this.x < this.x0)) { this.turnT = 1.2; this.dir *= -1; }
        if (this.turnT > 0) { this.turnT -= dt; this.vx = 0; }
        for (const pl of sc.players) {
          if (pl.dead || !this.canSee(pl)) continue;
          const dx = (pl.cx - this.cx) * this.dir;
          if (dx > 0 && dx < this.view && Math.abs(pl.cy - (this.y + 8)) < 28) { sc.caught && sc.caught(this, pl); break; }
        }
      } else {
        let speed = d.speed;
        const sees = this.canSee(p);
        if ((d.ai === "chaser" || d.ai === "jumper") && sees && Math.abs(p.cx - this.cx) < 150 && Math.abs(p.cy - (this.y + this.h / 2)) < 60) { this.dir = Math.sign(p.cx - this.cx) || this.dir; speed = d.chase || d.speed; }
        if (d.ai === "shooter") {
          speed = d.speed; this.shootT -= dt;
          if (sees && Math.abs(p.cx - this.cx) < 200 && this.shootT <= 0) {
            this.shootT = 2.2; this.dir = Math.sign(p.cx - this.cx) || this.dir;
            sc.enemyShot({ x: this.cx, y: this.y + 6, vx: this.dir * 120, vy: -30, g: 120, look: d.bullet });
          }
        }
        if (d.ai === "jumper" && this.onGround) { this.hopT -= dt; if (this.hopT <= 0) { this.vy = -280; this.hopT = 1.2 + Math.random(); } }
        this.vx = this.dir * speed;
        const aheadX = Math.floor((this.dir > 0 ? this.x + this.w + 2 : this.x - 2) / T);
        const footY = Math.floor((this.y + this.h + 2) / T);
        const ground = lv.at(aheadX, footY);
        if (this.onGround && !SOLID.has(ground) && !ONEWAY.has(ground) && d.ai !== "jumper") { this.dir *= -1; this.vx = 0; }
      }
      if (d.ai !== "flyer") {
        this.vy = Math.min(this.vy + 900 * dt, 400);
        if (SS.collide(lv, this, dt)) this.dir *= -1;
        if (this.y > lv.h * T + 40) this.dead = true;
      }
      this.anim += dt * 8;
      if (!d.guard && this.stun <= 0) for (const pl of sc.players) if (!pl.dead && SS.overlap(this, pl)) pl.hurt(sc, this.cx);
    }
    damage(n, sc) {
      if (this.d.guard) { this.stun = Math.max(this.stun, 2.5); SS.audio.sfx("bonk"); return; }
      if (this.stun > 0) n *= 2;
      this.hp -= n; this.flash = 0.12;
      SS.audio.sfx("hit");
      if (this.hp <= 0 && !this.dead) {
        this.dead = true;
        SS.audio.sfx("break");
        sc.fx.burst(this.cx, this.y + this.h / 2, 16, ["#ff2bd6", "#2a0f3a", "#9aa3b5", "#ffffff"], 110, 260, 0.6, 3);
        sc.dropCoins(this.cx, this.y, this.h > 16 ? 3 : 1);
        sc.onEnemyDead && sc.onEnemyDead(this);
      }
    }
    draw(ctx, cam) {
      const x = this.x - cam.x, y = this.y - cam.y, d = this.d;
      if (d.guard) {
        const cone = this.stun > 0 ? null : (this.alert > 0 ? "rgba(232,59,59,.35)" : "rgba(255,226,122,.22)");
        if (cone) { ctx.fillStyle = cone; ctx.beginPath(); const ex = x + this.w / 2, ey = y + 8; ctx.moveTo(ex, ey); ctx.lineTo(ex + this.dir * this.view, ey - 26); ctx.lineTo(ex + this.dir * this.view, ey + 26); ctx.fill(); }
      }
      if (d.draw === "blob") SS.gfx.blob(ctx, x, y, this.t, this.stun > 0, this.flash > 0);
      else if (d.draw === "fly") SS.gfx.fly(ctx, x, y, this.t, this.flash > 0);
      else if (d.draw === "critter") SS.gfx.critter(ctx, d.look, x, y, this.t, this.dir, this.flash > 0);
      else {
        const f = Math.floor(this.anim) % 4;
        SS.gfx.drawPerson(ctx, SS.gfx.SPECS[d.spec], this.stun > 0 ? "hurt" : Math.abs(this.vx) > 1 ? "walk" : "idle", Math.abs(this.vx) > 1 ? f : f % 2, x - 3, y - 2, this.dir);
        if (d.tag) { ctx.fillStyle = "#ff2bd6"; ctx.fillRect(Math.round(x - 1), Math.round(y - 7), 12, 4); ctx.fillStyle = "#1a0f2a"; ctx.fillRect(Math.round(x), Math.round(y - 6), 10, 2); }
        if (this.flash > 0) { ctx.globalAlpha = 0.6; ctx.fillStyle = "#fff"; ctx.fillRect(Math.round(x), Math.round(y), this.w, this.h); ctx.globalAlpha = 1; }
      }
      if (this.stun > 0) SS.gfx.stars(ctx, x + this.w / 2, y - 6, this.t);
    }
  };

  // ---------- tiles en pantalla ----------
  SS.drawTiles = (ctx, lv, cam, t) => {
    const x0 = Math.max(0, Math.floor(cam.x / T)), x1 = Math.min(lv.w - 1, Math.ceil((cam.x + SS.W) / T));
    const y0 = Math.max(0, Math.floor(cam.y / T)), y1 = Math.min(lv.h - 1, Math.ceil((cam.y + SS.H) / T));
    const TL = SS.gfx.TILES, th = lv.theme;
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const c = lv.at(tx, ty);
      if (c === "." || c === "-") continue;
      const px = Math.round(tx * T - cam.x), py = Math.round(ty * T - cam.y);
      let img = null;
      switch (c) {
        case "#": img = SOLID.has(lv.at(tx, ty - 1)) ? TL.ground(th, tx % 3) : TL.groundTop(th, tx % 4); break;
        case "=": img = TL.plat(th, Math.floor(tx / 3) % 4); break;
        case "Q": img = TL.crate(); break;
        case "F": img = TL.fence(lv.glitch && lv.over[ty][tx] === "F"); break;
        case "X": img = TL.glitch((tx + ty + Math.floor(t * 4)) % 2); break;
        case "^": img = TL.spikes(); break;
        case "L": img = TL.lava(Math.floor(t * 4) % 4); break;
        case "~": img = TL.water(Math.floor(t * 3) % 4); break;
        case "W": img = TL.wall(th, tx % 3); break;
        case "G": img = TL.garage(); break;
        case "B": img = TL.cracked(); break;
        case "V": img = TL.glass(); break;
        case "R": img = TL.spring(0); break;
        case "!": img = TL.blink(lv.blinkOn(tx)); break;
      }
      if (img) ctx.drawImage(img, px, py);
    }
  };
})();
