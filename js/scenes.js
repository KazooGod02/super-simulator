// SUPER SIMULATOR · escenas: título, flashback, Culiacán, Kazoovan, César y pantallas entre niveles
(() => {
  "use strict";
  const T = SS.T, W = SS.W, H = SS.H;
  const S = (SS.scenes = SS.scenes || {});
  const say = SS.say, wait = SS.wait;
  const save = () => SS.writeSave();
  const fmtTime = s => { s = Math.floor(s); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s % 60).padStart(2, "0"); };
  SS.fmtTime = fmtTime;

  // a dónde regresar según el avance guardado
  S.route = () => {
    const st = SS.save.stage;
    if (st === "cold") return () => S.cold();
    if (st === "pre") return () => S.level({ mode: "pre" });
    if (st === "glitch") return () => S.level({ mode: "glitch" });
    if (st === "van1") return () => S.van({ intro: true });
    if (st === "drive") return () => S.drive({ track: "prologue" });
    if (st === "cesar") return () => S.cesar();
    if (st === "act3") {
      const run = SS.save.run && SS.save.run.id ? SS.save.run : (SS.save.run = { id: "chase" });
      const L = SS.LEVELS[run.id];
      const pid = L.parts ? L.parts[run.part || 0] : run.id;
      return () => SS.sceneForPart(pid, false)();
    }
    return () => S.van({});
  };
  S.blank = () => ({ pausable: false, update() {}, draw(ctx) { ctx.fillStyle = "#07051a"; ctx.fillRect(0, 0, W, H); } });

  // ======================================================================
  // CULIACÁN (prólogo)
  // ======================================================================
  class Prologue extends SS.Platform {
    constructor(opts) {
      const lv = SS.buildLevel0();
      super(lv);
      this.mode = opts.mode;
      lv.glitch = this.mode !== "pre";
      this.glitchAmt = lv.glitch ? 1 : 0;
      if (SS.save.flags.garage) lv.fill(66, 9, 66, 10, ".");
      this.pinata = SS.save.flags.pinata ? null : { x: lv.pinata.x, y: lv.pinata.y, hp: 3, ang: 0, va: 0 };
      this.doorOpen = {}; this.lit = {};
      const cp = SS.save.checkpoint;
      let sx = 7 * T;
      if (this.mode === "pre" && cp && cp.mode === "pre") sx = cp.x;
      if (this.mode === "glitch") sx = cp && cp.mode === "glitch" ? cp.x : 145 * T;
      const p = this.addPlayer(sx, 176 - 22, 0, this.mode === "free" ? SS.save.active : "kazoo");
      if (this.mode === "glitch") p.facing = -1;
      for (const l of lv.lamps) if ((this.mode === "pre" && l * T < sx) || (this.mode === "glitch" && l * T > sx)) this.lit[l] = true;
      this.cam.x = SS.clamp(sx - W / 2, 0, lv.w * T - W);
      this.wall = { x: Math.min(158 * T, sx + 300), active: this.mode === "glitch" && !!(cp && cp.mode === "glitch") };
      if (lv.glitch) this.spawnEnemies();
      this.intro = !!opts.intro;
      this.glitchHintT = 0;
    }
    enter() {
      SS.ui.showHud(true); SS.ui.resetHud();
      SS.audio.music(this.mode === "pre" ? "culiacan" : "glitch");
      if (this.intro) this.run(function* () { yield wait(0.6); yield say(SS.TEXT.start); }());
      if (this.mode === "free") this.freeHintT = 6;
    }
    spawnEnemies() { this.enemies = this.level.spawns.map(([type, tx]) => new SS.Enemy(type, tx * T + 3, type === "fly" ? 150 : 176)); }
    delivered() { return Object.keys(SS.save.delivered).length; }
    gkLabel() { const all = this.level.items.filter(i => i.kind === "gk"); return all.filter(i => SS.save.got[i.id]).length + "/" + all.length; }
    extraPause() { return this.mode === "free" ? [{ label: "Regresar a la Kazoovan", action: () => { save(); SS.go(() => S.van({})); } }] : []; }
    checkpointPos() {
      const cp = SS.save.checkpoint;
      const x = cp && cp.mode === this.mode ? cp.x : this.mode === "glitch" ? 145 * T : 7 * T;
      return { x, y: 176 - 22 };
    }
    onRespawn() {
      if (this.wall.active) this.wall.x = Math.max(this.wall.x, this.player.x + 300);
      if (this.level.glitch && this.mode !== "free") this.spawnEnemies();
    }
    onKazoo(p) {
      const sp = this.level.speaker.x * T + 8;
      if (!SS.save.flags.garage && Math.abs(p.cx - sp) < 72) {
        SS.save.flags.garage = true;
        this.speakerT = 1.2;
        this.level.fill(66, 9, 66, 10, ".");
        this.fx.burst(66 * T + 8, 9.5 * T, 18, ["#8a93a6", "#ffd23f"], 90, 200, 0.6);
        SS.audio.sfx("door");
        SS.ui.toast("¡La bocina abrió la cochera!");
      }
    }
    onShot(s, box) {
      const pn = this.pinata;
      if (!pn) return;
      if (SS.overlap(box, { x: pn.x - 10, y: pn.y - 12, w: 20, h: 22 })) {
        s.life = 0;
        pn.hp--; pn.va += 3 * Math.sign(s.vx);
        SS.audio.sfx("hit");
        this.fx.burst(pn.x, pn.y, 8, ["#ff4fa3", "#ffd23f", "#2ee6d6"], 80, 200, 0.5);
        if (pn.hp <= 0) {
          SS.audio.sfx("jingle");
          this.fx.burst(pn.x, pn.y, 30, ["#ff4fa3", "#ffd23f", "#2ee6d6", "#ff7a1a", "#7b4dff"], 140, 300, 0.9, 3);
          this.dropCoins(pn.x, pn.y, 8);
          this.pinata = null;
          SS.save.flags.pinata = true;
          SS.ui.toast("¡Dale, dale, dale!");
        }
      }
    }
    deliver(house) {
      const self = this;
      this.run(function* () {
        self.doorOpen[house.npc] = true;
        SS.audio.sfx("door");
        yield wait(0.35);
        yield say(SS.TEXT[house.npc]);
        SS.save.delivered[house.npc] = true;
        SS.save.feria += 5;
        SS.audio.sfx("jingle");
        SS.ui.toast(`Entrega ${self.delivered()}/3 · +5 de feria`);
        yield wait(0.3);
        self.doorOpen[house.npc] = false;
        SS.audio.sfx("door");
      }());
    }
    openPackage() {
      const self = this, p = this.player, lv = this.level;
      this.run(function* () {
        p.facing = 1;
        yield say(SS.TEXT.package1);
        self.boxOpen = true;
        SS.audio.sfx("open"); self.flash = 0.8;
        self.fx.burst(lv.mystery.x + 8, 160, 30, ["#ff2bd6", "#ffd23f", "#ffffff"], 120, 100, 1, 2);
        yield wait(1);
        SS.save.flags.stone = true;
        SS.ui.toast("Conseguiste la KAZOONITA");
        yield say(SS.TEXT.package2);
        p.doAct("kazoo", 0.7); SS.audio.sfx("kazoo");
        yield wait(0.8);
        lv.glitch = true;
        self.flash = 1.2; SS.shake = 7;
        SS.audio.sfx("glitch"); SS.audio.music("glitch");
        self.spawnEnemies();
        yield wait(1.2);
        yield say(SS.TEXT.package3);
        SS.audio.sfx("glitch"); SS.shake = 4;
        yield say(SS.TEXT.package4);
        p.facing = -1;
        self.mode = "glitch";
        self.lit = {};
        SS.save.stage = "glitch";
        SS.save.checkpoint = { mode: "glitch", x: 145 * T };
        save();
        self.wall.x = 158 * T; self.wall.active = true;
        self.glitchHintT = 7;
      }());
    }
    enterVan() {
      const self = this, p = this.player;
      this.run(function* () {
        self.wall.active = false;
        p.frozen = true;
        if (self.mode !== "free") yield say(SS.TEXT.van1);
        self.inVan = true;
        SS.audio.sfx("door");
        yield wait(0.5);
        if (self.mode === "free") { save(); SS.go(() => S.van({})); return; }
        SS.save.stage = "van1"; SS.save.checkpoint = null; save();
        SS.go(() => S.van({ intro: true }));
      }());
    }
    interactables() {
      const lv = this.level, list = [];
      if (this.mode === "pre") {
        for (const h of lv.houses) if (!SS.save.delivered[h.npc]) list.push({ x: h.door * T + 8, label: "Entregar paquete", act: () => this.deliver(h) });
        if (this.delivered() >= 3 && !this.boxOpen) list.push({ x: lv.mystery.x + 8, r: 18, label: "Revisar el paquete", act: () => this.openPackage() });
      } else if (!this.inVan) list.push({ x: lv.van.x + 32, r: 30, label: "Subir a la Kazoovan", act: () => this.enterVan() });
      return list;
    }
    hints() {
      const p = this.player, x = p.cx / T, dev = SS.input.lastDevice;
      if (this.blocking()) return null;
      if (this.mode === "free") return this.freeHintT > 0 ? "Juego libre: busca los Kazoos Dorados y la foto · sal por la Kazoovan" : null;
      if (this.mode === "glitch") {
        if (this.glitchHintT > 0) return "¡Corre a la Kazoovan! {attack} avienta paquetes · {special} aturde con el kazoo";
        if (x > 119 && x < 138 && !this.learned.blink) return "¡Rejas! Atraviésalas con la Kazoonita: {ability}";
        if (x > 55 && x < 60 && !this.learned.blink2) return "Otra reja: {ability} para atravesarla";
        return null;
      }
      if (x < 12) return "Muévete con {left} {right} · salta con {jump}";
      if (x < 24) return dev === "touch" ? "Mantén {jump} para saltar más alto" : "Mantén {jump} para saltar más alto · corre con {run}";
      if (this.pinata && x > 39 && x < 47) return "Rompe la piñata: avienta paquetes con {attack}";
      if (!SS.save.flags.garage && x > 59 && x < 66 && SS.save.delivered.beto) return "La cochera tiene bocina: toca el kazoo con {special}";
      if (x > 138 && this.delivered() < 3) return `Te faltan entregas: ${this.delivered()}/3`;
      return null;
    }
    onBlink() { const x = this.player.cx / T; if (x < 120) this.learned.blink = true; if (x < 56) this.learned.blink2 = true; }
    update(dt) {
      this.updateCommon(dt);
      const lv = this.level, p = this.player;
      SS.save.time += dt;
      this.glitchAmt = SS.approach(this.glitchAmt, lv.glitch ? 1 : 0, dt * 0.8);
      this.glitchHintT = Math.max(0, this.glitchHintT - dt);
      this.freeHintT = Math.max(0, (this.freeHintT || 0) - dt);
      if (this.speakerT) this.speakerT = Math.max(0, this.speakerT - dt);
      const pn = this.pinata;
      if (pn) { pn.va += -pn.ang * 30 * dt; pn.va *= 0.97; pn.ang += pn.va * dt; }
      for (const it of lv.items) {
        if (SS.save.got[it.id] || (it.glitchOnly && !lv.glitch)) continue;
        if (Math.abs(p.cx - it.px) < 10 && Math.abs(p.cy - it.py) < 16) {
          SS.save.got[it.id] = true;
          if (it.kind === "coin") { SS.save.feria++; SS.audio.sfx("coin"); }
          else if (it.kind === "roll") { p.hearts = Math.min(SS.save.maxHearts, p.hearts + 1); SS.audio.sfx("buy"); SS.ui.toast("Rollo de papel: +1 vida"); }
          else if (it.kind === "gk") { SS.audio.sfx("gold"); this.fx.burst(it.px, it.py, 20, ["#ffd23f", "#fff3b0"], 100, 100, 0.8); if (SS.countGot("gk") === 1) this.run(function* () { yield say(SS.TEXT.gk); }()); else SS.ui.toast(`Kazoo Dorado ${this.gkLabel()}`); }
          else if (it.kind === "photo") { SS.audio.sfx("gold"); this.run(function* () { yield say(SS.TEXT.photo); }()); }
        }
      }
      for (const l of lv.lamps) {
        if (this.lit[l]) continue;
        const lx = l * T + 16;
        const passed = this.mode === "pre" ? p.cx > lx : this.mode === "glitch" ? p.cx < lx : false;
        if (passed) { this.lit[l] = true; SS.save.checkpoint = { mode: this.mode, x: l * T }; save(); SS.audio.sfx("confirm"); SS.ui.toast("Checkpoint guardado"); }
      }
      if (this.wall.active && !this.blocking() && !p.dead) {
        const gap = this.wall.x - p.x;
        this.wall.x -= (gap > 260 ? 80 : 44) * dt;
        if (p.x + p.w > this.wall.x) { p.inv = 0; p.hurt(this, p.x + 50); if (!p.dead) { p.x = this.wall.x - 70; p.vx = -120; } }
        if (Math.random() < dt * 6) this.fx.add({ x: this.wall.x + SS.rand(0, 8), y: SS.rand(0, 220), vx: SS.rand(-60, -20), vy: 0, life: 0.6, max: 0.6, c: SS.pick(["#ff2bd6", "#77737c", "#2a2834"]), s: 3 });
      }
      this.interact(this.interactables());
      SS.ui.hint(this.hints());
    }
    draw(ctx) {
      const lv = this.level, cam = this.cam, t = this.t;
      const sx = x => Math.round(x - cam.x);
      const GY = 176 - cam.y;
      SS.gfx.drawCityBg(ctx, cam.x, this.glitchAmt, t);
      if (lv.glitch) for (const [tx, ty, text] of lv.todos) { const x = sx(tx * T); if (x > -160 && x < W) SS.gfx.todo(ctx, x, ty * T, text, t); }
      for (const l of lv.lamps) { const x = sx(l * T); if (x > -40 && x < W + 10) SS.gfx.lamp(ctx, x, GY, !!this.lit[l], t); }
      for (const pm of lv.palms) { const x = sx(pm * T); if (x > -40 && x < W + 30) SS.gfx.palm(ctx, x, GY, t); }
      for (const h of lv.houses) {
        const x = sx(h.x * T);
        if (x > -h.w * T - 20 && x < W + 20) SS.gfx.house(ctx, x, GY, h.w, h.color, h.trim, h.num, { door: sx(h.door * T), doorOpen: this.doorOpen[h.npc], delivered: SS.save.delivered[h.npc], lit: lv.glitch });
        if (this.doorOpen[h.npc]) SS.gfx.drawPerson(ctx, SS.gfx.SPECS[h.npc], "idle", 0, sx(h.door * T), GY - 24, -1);
      }
      { const s = lv.store, x = sx(s.x * T); if (x > -s.w * T && x < W) SS.gfx.store(ctx, x, GY, s.w, s.label); }
      { const x = sx(lv.speaker.x * T); if (x > -20 && x < W) SS.gfx.speaker(ctx, x, GY, this.speakerT > 0, t); }
      { const x = sx(lv.endSign * T); if (x > -100 && x < W) SS.gfx.sign(ctx, x, GY, "FIN DE LA RUTA"); }
      if (!this.inVan) SS.gfx.van(ctx, sx(lv.van.x), lv.van.y - cam.y, t, lv.glitch);
      if (this.pinata) { const pn = this.pinata, x = sx(pn.x); ctx.fillStyle = "#120f1c"; ctx.fillRect(x - 60, 70 - cam.y, 120, 1); SS.gfx.pinata(ctx, x, pn.y - cam.y, pn.ang, pn.hp); }
      if (this.mode === "pre" && this.delivered() >= 3 && !this.boxOpen) SS.gfx.mystery(ctx, sx(lv.mystery.x), GY, t);
      SS.drawTiles(ctx, lv, cam, t);
      for (const it of lv.items) {
        if (SS.save.got[it.id] || (it.glitchOnly && !lv.glitch)) continue;
        const x = sx(it.px), y = Math.round(it.py - cam.y + Math.sin(t * 4 + it.px) * 1.5);
        if (x < -16 || x > W + 16) continue;
        SS.drawItem(ctx, it, x, y, t);
      }
      this.drawCommon(ctx);
      if (this.wall.active || (this.mode === "glitch" && this.wall.x < lv.w * T)) {
        const wx = sx(this.wall.x);
        if (wx < W) for (let y = 0; y < H; y += 4) {
          const tear = Math.round(SS.hash(y * 1.7 + Math.floor(t * 12)) * 14);
          for (let x = wx + tear - 14; x < W; x += 4) { ctx.fillStyle = (Math.floor(x / 4) + Math.floor(y / 4) + Math.floor(t * 10)) % 3 === 0 ? "#ff2bd6" : (x + y) % 8 ? "#2a2834" : "#77737c"; ctx.fillRect(x, y, 4, 4); }
        }
      }
      if (lv.glitch && Math.random() < 0.04) SS.tear(ctx, 6, 6);
    }
  }
  S.level = opts => new Prologue(opts);

  // ======================================================================
  // LA KAZOOVAN (hub)
  // ======================================================================
  let vanBg = null;
  function buildVanBg() {
    if (vanBg) return vanBg;
    const [c, x] = SS.gfx.mk(640, 216);
    const OUT = "#120f1c";
    x.fillStyle = "#2e2140"; x.fillRect(0, 0, 640, 216);
    x.fillStyle = "#3a2a52"; for (let i = 0; i < 640; i += 24) x.fillRect(i, 30, 22, 140);
    x.fillStyle = "#1d1530"; x.fillRect(0, 0, 640, 26);
    x.fillStyle = "#ffe27a"; for (let i = 60; i < 640; i += 140) x.fillRect(i, 22, 40, 3);
    x.fillStyle = "#4a2a3a"; x.fillRect(0, 176, 640, 40);
    x.fillStyle = "#5a3448"; for (let i = 0; i < 640; i += 8) for (let j = 178; j < 216; j += 8) if (((i + j) / 8) % 2) x.fillRect(i, j, 8, 8);
    x.fillStyle = "#c79a6a"; x.fillRect(0, 172, 640, 4);
    const box = (bx, by, w, h) => { x.fillStyle = OUT; x.fillRect(bx - 1, by - 1, w + 2, h + 2); x.fillStyle = "#b27a45"; x.fillRect(bx, by, w, h); x.fillStyle = "#e8d7a8"; x.fillRect(bx + (w >> 1) - 2, by, 4, h); x.fillStyle = "#8a5a2e"; x.fillRect(bx, by, w, 3); };
    x.fillStyle = OUT; x.fillRect(29, 139, 92, 37); x.fillStyle = "#6b3f22"; x.fillRect(30, 140, 90, 36); x.fillStyle = "#8a5a2e"; x.fillRect(30, 140, 90, 4);
    x.fillStyle = OUT; x.fillRect(43, 89, 64, 52); x.fillStyle = "#4a4659"; x.fillRect(44, 90, 62, 50); x.fillStyle = "#16122e"; x.fillRect(50, 95, 50, 38);
    x.fillStyle = OUT; x.fillRect(51, 145, 48, 14); x.fillStyle = "#c9c3dc"; x.fillRect(52, 146, 46, 12); x.fillStyle = "#7b4dff"; x.fillRect(56, 150, 6, 4); x.fillStyle = "#e83b3b"; x.fillRect(86, 149, 4, 4); x.fillStyle = "#3b5bdb"; x.fillRect(92, 149, 4, 4);
    for (let i = 0; i < 5; i++) { x.fillStyle = OUT; x.fillRect(34 + i * 16, 62, 14, 20); x.fillStyle = ["#ff7a1a", "#ffd23f", "#2ee6d6", "#ff4fa3", "#6fb7ff"][i]; x.fillRect(35 + i * 16, 63, 12, 18); x.fillStyle = "#4a4659"; x.fillRect(35 + i * 16, 63, 12, 4); }
    box(146, 140, 56, 36);
    x.fillStyle = OUT; x.fillRect(149, 109, 50, 31); x.fillStyle = "#2b2b3d"; x.fillRect(150, 110, 48, 29); x.fillStyle = "#5a5580"; x.beginPath(); x.arc(162, 126, 8, 0, 7); x.arc(186, 126, 8, 0, 7); x.fill(); x.fillStyle = "#ffd23f"; x.fillRect(166, 112, 16, 4); x.fillStyle = OUT; x.fillRect(158, 102, 32, 2);
    x.fillStyle = OUT; x.fillRect(249, 60, 82, 60); x.fillStyle = "#8a6a4a"; x.fillRect(250, 61, 80, 58);
    x.fillStyle = "#6b4f34"; for (let i = 0; i < 80; i += 8) for (let j = 0; j < 58; j += 8) x.fillRect(252 + i, 63 + j, 2, 2);
    x.fillStyle = "#9aa3b5"; x.fillRect(262, 70, 3, 22); x.fillRect(258, 70, 11, 4); x.fillRect(282, 72, 18, 3); x.fillRect(296, 68, 3, 11); x.fillStyle = "#e83b3b"; x.fillRect(312, 70, 6, 26); x.fillStyle = "#ffd23f"; x.fillRect(272, 96, 30, 6);
    x.fillStyle = OUT; x.fillRect(244, 139, 92, 37); x.fillStyle = "#6b4f34"; x.fillRect(245, 140, 90, 36); x.fillStyle = "#8a6a4a"; x.fillRect(245, 140, 90, 5);
    x.fillStyle = OUT; x.fillRect(369, 69, 72, 62); x.fillStyle = "#c79a6a"; x.fillRect(370, 70, 70, 60);
    box(480, 146, 30, 30); box(512, 152, 26, 24); box(540, 140, 32, 36); box(494, 118, 28, 28); box(526, 126, 22, 26);
    x.fillStyle = "#ff4fa3"; x.fillRect(484, 141, 24, 6); x.fillStyle = "#2ee6d6"; x.fillRect(543, 135, 26, 6);
    x.fillStyle = OUT; x.fillRect(589, 49, 46, 128); x.fillStyle = "#c9c3dc"; x.fillRect(590, 50, 44, 126); x.fillStyle = "#9a93b0"; x.fillRect(611, 50, 2, 126);
    x.fillStyle = "#3b4a7a"; x.fillRect(594, 58, 14, 30); x.fillRect(616, 58, 14, 30);
    x.fillStyle = "#4a4659"; x.fillRect(603, 112, 6, 3); x.fillRect(615, 112, 6, 3);
    x.font = '6px "Press Start 2P"'; x.textBaseline = "top";
    const label = (lx, ly, text) => { const w = Math.ceil(x.measureText(text).width) + 8; x.fillStyle = OUT; x.fillRect(lx - w / 2 - 1, ly - 1, w + 2, 12); x.fillStyle = "#ffd23f"; x.fillRect(lx - w / 2, ly, w, 10); x.fillStyle = OUT; x.fillText(text, lx - w / 2 + 4, ly + 2); };
    label(75, 40, "CONSOLA"); label(174, 88, "RADIO"); label(290, 40, "TALLER"); label(405, 50, "FOTOS"); label(526, 96, "PLATICAS"); label(612, 34, "SALIDA");
    vanBg = c;
    return c;
  }

  class VanScene extends SS.Platform {
    constructor(opts) {
      const lv = new SS.Level(40, 14, "culiacan");
      lv.fill(0, 11, 39, 13, "#");
      lv.fill(0, 0, 0, 10, "W"); lv.fill(39, 0, 39, 10, "W");
      super(lv);
      const p = this.addPlayer(opts.fromDrive ? 80 : 560, 176 - 22, 0);
      p.facing = -1;
      this.cam.x = SS.clamp(p.cx - W / 2, 0, 640 - W);
      this.intro = !!opts.intro;
      this.radio = 0;
      this.tracks = ["van", "culiacan", "title", "drive", "glitch", "cesar", "jesus", "carlos", "daniel", "telenovela", "anime", "lucha", "prehistoria", "internet", "boss", "cero", "flash"];
      this.usedConsole = false;
      this.charScale = 2;
    }
    enter() {
      SS.ui.showHud(true); SS.ui.resetHud();
      SS.audio.music("van");
      for (const p of this.players) if (p) p.hearts = SS.save.maxHearts;
      const st = SS.save.stage, self = this;
      if (this.intro && st === "van1") this.run(function* () { yield wait(0.4); yield say(SS.TEXT.vanIntro); self.introDone = true; }());
      else if (st === "done" && SS.ACT2.every(id => SS.save.done[id]) && !SS.save.flags.twist) this.twist();
      else if (st === "done" && SS.ACT1.every(id => SS.save.done[id]) && !SS.save.flags.act2) {
        SS.save.flags.act2 = true; save();
        this.run(function* () { yield wait(0.5); SS.ui.card("ACTO II", "Dimensiones nuevas", 2.4); yield wait(2.4); yield say([["kazoo", "Ya estamos los cinco. La consola agarró cartuchos nuevos: dimensiones que nunca habíamos visto."], ["cesar", "¿Hay una de internet?"], ["kazoo", "Hay una de internet."], ["cesar", "Ya me cae bien el multiverso."]]); }());
      }
    }
    twist() {
      const self = this;
      this.run(function* () {
        yield wait(0.6);
        SS.audio.music("glitch"); SS.audio.sfx("glitch"); SS.shake = 6; self.flash = 0.6;
        yield say(SS.TEXT.twist);
        SS.save.flags.twist = true; SS.save.stage = "act3"; SS.save.run = { id: "chase" }; save();
        SS.ui.card("ACTO III", "La Papelera", 2.2);
        yield wait(2.2);
        SS.startLevel("chase");
      }());
    }
    console() {
      const st = SS.save.stage;
      const close = () => SS.ui.closeMenu();
      if (st === "van1" || st === "drive") {
        SS.ui.menu("CONSOLA DEL TABLERO", [
          { label: "Ruta: casa de César", sub: "Manejar por la Carretera Interdimensional", action: () => { close(); SS.save.stage = "drive"; save(); SS.go(() => S.drive({ track: "prologue" })); } },
          { label: "Todavía no", action: close },
        ], { onBack: close });
        return;
      }
      const s = SS.save;
      const act1Done = SS.ACT1.every(id => s.done[id]);
      const post = st === "post";
      const entry = id => {
        const L = SS.LEVELS[id], c = SS.levelItems(id);
        const status = s.done[id] ? `✓ · Kazoos ${c.gkGot}/${c.gk} · Fotos ${c.phGot}/${c.ph}` : "Sin jugar";
        return { label: `${L.title}`, sub: status, action: () => { close(); SS.startLevel(id, !!s.done[id]); } };
      };
      const items = [{ label: "00 · CULIACÁN", sub: "Juego libre del prólogo", action: () => { close(); save(); SS.go(() => S.level({ mode: "free" })); } }];
      SS.ACT1.forEach(id => items.push(entry(id)));
      if (act1Done) SS.ACT2.forEach(id => items.push(entry(id)));
      else items.push({ label: "ACTO II · ???", sub: "Recupera a los cuatro compas primero", off: true });
      if (post) ["abandonados", "papelera", "cero"].forEach(id => items.push(entry(id)));
      const games = Object.keys(SS.MINIGAMES).filter(g => s.games[g]);
      items.push({ label: `Cartuchos secretos (${games.length}/5)`, sub: games.length ? "Minijuegos" : "Están escondidos en las dimensiones del Acto II", off: !games.length, action: () => this.gamesMenu() });
      if (post) items.push({ label: "Finales vistos", sub: ["A", "B", "C", "D", "E"].map(k => (s.endings[k] ? k : "·")).join(" "), action: () => this.endingsMenu() });
      items.push({ label: "Manejar a casa de César", sub: "La carretera del prólogo", action: () => { close(); SS.go(() => S.drive({ track: "prologue" })); } });
      items.push({ label: "Cerrar", action: close });
      SS.ui.menu("CONSOLA DEL TABLERO", items, { onBack: close, allowOff: true, wide: true });
    }
    gamesMenu() {
      const s = SS.save, close = () => SS.ui.closeMenu();
      SS.ui.menu("CARTUCHOS SECRETOS", Object.keys(SS.MINIGAMES).map(g => ({
        label: s.games[g] ? SS.MINIGAMES[g].name : "???", sub: s.games[g] ? `Récord: ${s.games[g + "_best"] || 0}` : "Sin encontrar", off: !s.games[g],
        action: () => { close(); SS.go(() => S.minigame(g)); },
      })).concat([{ label: "Regresar", action: () => this.console() }]), { onBack: () => this.console(), allowOff: true, wide: true });
    }
    endingsMenu() {
      const s = SS.save, E = SS.TEXT.endings;
      SS.ui.menu("FINALES", ["A", "B", "C", "D", "E"].map(k => ({ label: s.endings[k] ? E[k].title : "FINAL " + k + " · ???", sub: s.endings[k] ? "Visto" : ["Todos los Recuerdos en 4+, 15 fotos y termina a Cero", "Gana de cualquier otra forma", "Pierde en la última fase de Cero", "Llena el Glitchómetro", "Junta las 30 notas TODO"][["A", "B", "C", "D", "E"].indexOf(k)], off: false, action: () => {} })).concat([{ label: "Regresar", action: () => this.console() }]), { onBack: () => this.console(), wide: true });
    }
    talks() {
      const s = SS.save, close = () => SS.ui.closeMenu();
      const avail = SS.TEXT.talks.filter(tk => tk.need(s) && !s.talks[tk.id]);
      const b = s.bonds;
      const note = `Recuerdos: César ${b.cesar}/5 · Jesús ${b.jesus}/5 · Carlos ${b.carlos}/5 · Daniel ${b.daniel}/5`;
      if (!avail.length) { const self = this; this.run(function* () { yield say(s.party.length > 1 ? SS.TEXT.boxesNone : SS.TEXT.boxesEmpty); }()); void self; return; }
      SS.ui.menu("PLÁTICAS EN LA VAN", avail.map(tk => ({ label: tk.title, action: () => {
        close();
        const self = this;
        this.run(function* () {
          yield say(tk.lines);
          s.talks[tk.id] = true;
          tk.who.forEach(w => SS.addBond(w, 1));
          save(); SS.audio.sfx("gold");
          SS.ui.toast("+1 Recuerdo para " + tk.who.map(w => SS.CHARS[w].name).join(" y "));
          void self;
        }());
      } })).concat([{ label: "Luego", action: close }]), { onBack: close, note, wide: true });
    }
    taller() {
      const ups = [
        { key: "roll", name: "Rollo extra", desc: "+1 vida máxima", cost: 30, apply: () => (SS.save.maxHearts = Math.max(SS.save.maxHearts, 4)) },
        { key: "turbo", name: "Kazoo turbo", desc: "El kazoo se recarga más rápido", cost: 35 },
        { key: "stone2", name: "Kazoonita+", desc: "Te teletransportas más lejos", cost: 50 },
        { key: "roll2", name: "Paquete de rollos", desc: "+1 vida máxima (otra)", cost: 90, apply: () => (SS.save.maxHearts = 5), need: "roll" },
        { key: "glitchfix", name: "Parche anti-glitch", desc: "Baja el Glitchómetro a 0", cost: 60, repeat: true, apply: () => (SS.save.glitch = 0) },
      ];
      const close = () => SS.ui.closeMenu();
      const open = () => SS.ui.menu(`TALLER · Tienes ${SS.save.feria} de feria`, [
        ...ups.filter(u => !u.need || SS.save.upgrades[u.need]).map(u => ({
          label: () => SS.save.upgrades[u.key] && !u.repeat ? `${u.name} · comprado` : `${u.name} · ${u.cost}`,
          sub: u.desc,
          action: () => {
            if (SS.save.upgrades[u.key] && !u.repeat) { SS.ui.toast("Ya lo tienes"); return; }
            if (SS.save.feria < u.cost) { SS.ui.toast(`Te faltan ${u.cost - SS.save.feria} de feria`); SS.audio.sfx("bonk"); return; }
            SS.save.feria -= u.cost; SS.save.upgrades[u.key] = true; u.apply && u.apply();
            for (const p of this.players) if (p) p.hearts = SS.save.maxHearts;
            save(); SS.audio.sfx("buy"); SS.ui.toast(`${u.name}: listo`);
            open();
          },
        })),
        { label: "Cerrar", action: close },
      ], { onBack: close, wide: true });
      open();
    }
    interactables() {
      const st = SS.save.stage;
      return [
        { x: 75, r: 30, label: "Usar la consola", act: () => { this.usedConsole = true; this.console(); } },
        { x: 174, r: 22, label: "Cambiar la radio", act: () => { this.radio = (this.radio + 1) % this.tracks.length; const tr = this.tracks[this.radio]; SS.audio.music(tr); SS.audio.sfx("select"); SS.ui.toast("Radio: " + SS.audio.trackNames[tr]); } },
        { x: 290, r: 34, label: "Entrar al taller", act: () => this.taller() },
        { x: 405, r: 30, label: "Ver las fotos", act: () => this.run(function* () { yield say(SS.TEXT.photos(SS.countGot("photo"))); }()) },
        { x: 526, r: 36, label: "Sentarse a platicar", act: () => this.talks() },
        { x: 612, r: 20, label: st === "done" || st === "post" ? "Salir a Culiacán" : "Salir", act: () => {
          if (st !== "done" && st !== "post") { SS.ui.toast("Primero vamos con César. Usa la consola."); return; }
          save(); SS.go(() => S.level({ mode: "free" }));
        } },
      ];
    }
    update(dt) {
      this.updateCommon(dt);
      this.cam.x = SS.clamp(this.cam.x, 0, 640 - W);
      this.cam.y = 0; // el fondo de la van no se mueve en vertical
      this.interact(this.interactables());
      const x = this.player.cx;
      if (this.blocking()) SS.ui.hint(null);
      else if (SS.save.stage === "van1" && this.introDone && !this.usedConsole) SS.ui.hint(x > 140 ? "Ve a la CONSOLA, al fondo a la izquierda" : "Usa la consola con {up}");
      else if (SS.save.stage === "done" && SS.save.party.length > 1 && SS.TEXT.talks.some(tk => tk.need(SS.save) && !SS.save.talks[tk.id]) && x > 440) SS.ui.hint("Hay pláticas nuevas en la parte de atrás");
      else SS.ui.hint(null);
    }
    draw(ctx) {
      const cam = this.cam, t = this.t;
      ctx.drawImage(buildVanBg(), Math.round(-cam.x), 0);
      [126, 330, 452].forEach((x0, i) => {
        const wx = Math.round(x0 - cam.x);
        if (wx > W || wx < -50) return;
        ctx.fillStyle = "#120f1c"; ctx.fillRect(wx - 2, 32, 48, 34);
        for (let y = 0; y < 30; y += 3) { ctx.fillStyle = ["#ff7a1a", "#ffd23f", "#2ee6d6", "#ff4fa3", "#6fb7ff", "#7b4dff"][(Math.floor(y / 3) + Math.floor(t * 6) + i) % 6]; ctx.fillRect(wx, 34 + y, 44, 3); }
        ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.fillRect(wx + 3, 36, 8, 26);
      });
      const tvx = Math.round(50 - cam.x);
      for (let y = 0; y < 38; y += 2) { ctx.fillStyle = y % 4 ? "#2a2254" : "#3d3478"; ctx.fillRect(tvx, 95 + y, 50, 2); }
      ctx.fillStyle = "#ff2bd6"; ctx.fillRect(tvx + 18, 108 + Math.round(Math.sin(t * 3) * 2), 14, 10);
      ctx.fillStyle = "#ffd23f"; ctx.fillRect(tvx + 21, 111 + Math.round(Math.sin(t * 3) * 2), 4, 4);
      const n = SS.countGot("photo");
      for (let i = 0; i < 20; i++) {
        const px = Math.round(373 + (i % 5) * 13 - cam.x), py = 74 + Math.floor(i / 5) * 14;
        ctx.fillStyle = "#120f1c"; ctx.fillRect(px - 1, py - 1, 12, 13);
        ctx.fillStyle = i < n ? "#f4f4f4" : "#a47a4c"; ctx.fillRect(px, py, 10, 11);
        if (i < n) { ctx.fillStyle = ["#6fb7ff", "#ff7a1a", "#2ee6d6", "#ff4fa3", "#ffd23f"][i % 5]; ctx.fillRect(px + 1, py + 1, 8, 6); }
      }
      // los compas en la camioneta
      const others = SS.save.party.filter(c => c !== this.player.char && ["kazoo", "cesar", "jesus", "carlos", "daniel"].includes(c));
      const spots = [470, 500, 530, 440];
      others.forEach((c, i) => { if (i < spots.length) SS.gfx.drawPerson(ctx, SS.gfx.SPECS[SS.CHARS[c].spec], "idle", Math.floor(t * 2 + i) % 2, spots[i] - cam.x, 128, -1, undefined, 2); });
      this.drawCommon(ctx);
    }
  }
  S.van = opts => new VanScene(opts || {});

  // ======================================================================
  // TÍTULO
  // ======================================================================
  S.title = () => {
    let started = false, t = 0, tapped = false;
    const parts = Array.from({ length: 220 }, (_, i) => ({ a: Math.random() * 6.283, r: Math.random(), s: 0.15 + Math.random() * 0.5, c: ["#ff7a1a", "#ffd23f", "#2ee6d6", "#ff4fa3", "#6fb7ff"][i % 5] }));
    const onTap = () => { tapped = true; };
    const stage = document.getElementById("stage");
    function mainMenu() {
      const items = [];
      if (SS.hasSave()) items.push({ label: "Continuar", sub: (() => { const s = SS.store.get("supersim_save_v1"); return s ? `Fotos ${Object.keys(s.got || {}).filter(k => k.startsWith("photo")).length}/20 · ${SS.fmtTime(s.time || 0)}` : ""; })(), action: () => { SS.ui.closeMenu(); SS.loadSave(); SS.go(S.route()); } });
      items.push({ label: "Nueva partida", action: () => {
        if (!SS.hasSave()) return startNew();
        SS.ui.menu("¿Borrar la partida guardada?", [{ label: "No, regresar", action: mainMenu }, { label: "Sí, empezar de cero", action: startNew }], { onBack: mainMenu, low: true });
      } });
      items.push({ label: "Cómo se juega", action: howTo });
      items.push({ label: () => "Música: " + (SS.settings.music ? "sí" : "no"), action: () => { SS.settings.music = !SS.settings.music; SS.writeSettings(); SS.audio.applySettings(); SS.ui.refreshMenu(); } });
      SS.ui.menu(null, items, { low: true });
    }
    function startNew() { SS.ui.closeMenu(); SS.save = SS.newSave(); SS.writeSave(); SS.go(() => S.cold()); }
    function howTo() {
      SS.ui.menu("CÓMO SE JUEGA", [{ label: "Regresar", action: mainMenu }], {
        low: true, onBack: mainMenu, wide: true,
        note: SS.ui.fmt("Moverse {left}{right} · saltar {jump} · correr {run}<br>Ataque {attack} · especial {special} · habilidad {ability}<br>Cambiar de compa {swap} · revisar {up} · esconderse {down} · pausa {pause}<br>Cada compa abre caminos distintos. Jugador 2: conecta un control y entra desde la pausa."),
      });
    }
    return {
      pausable: false,
      enter() { SS.ui.title(true); document.getElementById("pressStart").hidden = false; SS.audio.music("title"); stage.addEventListener("pointerdown", onTap); },
      exit() { stage.removeEventListener("pointerdown", onTap); },
      update(dt) {
        t += dt;
        if (!started && (tapped || SS.input.hit("confirm") || SS.input.hit("attack") || SS.input.hit("pause"))) {
          started = true; SS.audio.unlock(); SS.audio.music("title"); SS.audio.sfx("confirm");
          document.getElementById("pressStart").hidden = true;
          mainMenu();
        }
        tapped = false;
      },
      draw(ctx) {
        ctx.fillStyle = "#07051a"; ctx.fillRect(0, 0, W, H);
        const cx = W / 2, cy = 80, R = 260;
        for (const p of parts) {
          p.r -= p.s * 0.0035; p.a += 0.01 + (1 - p.r) * 0.02; if (p.r < 0.03) p.r = 1;
          const rr = p.r * p.r * R;
          ctx.globalAlpha = Math.min(1, p.r * 1.6) * 0.8; ctx.fillStyle = p.c;
          ctx.fillRect(Math.round(cx + Math.cos(p.a) * rr), Math.round(cy + Math.sin(p.a) * rr * 0.55), p.r > 0.6 ? 2 : 1, p.r > 0.6 ? 2 : 1);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#1a1030";
        for (let x = 0; x < W; x += 18) { const h = 20 + ((SS.hash(x) * 40) | 0); ctx.fillRect(x, H - 30 - h, 16, h); }
        ctx.fillStyle = "#120a22"; ctx.fillRect(0, H - 30, W, 30);
        ctx.fillStyle = "#3d3478"; for (let x = (-(t * 60) % 32); x < W; x += 32) ctx.fillRect(Math.round(x), H - 16, 16, 2);
        SS.gfx.van(ctx, W / 2 - 32, H - 58, t, true);
        ctx.globalAlpha = 0.25; ctx.fillStyle = "#ffe27a"; ctx.beginPath(); ctx.moveTo(W / 2 + 32, H - 39); ctx.lineTo(W, H - 60); ctx.lineTo(W, H - 20); ctx.fill(); ctx.globalAlpha = 1;
        // los cinco en el techo
        ["kazoo", "cesar", "jesus", "carlos", "daniel"].forEach((c, i) => SS.gfx.drawPerson(ctx, SS.gfx.SPECS[c], "idle", Math.floor(t * 2 + i) % 2, W / 2 - 40 + i * 16, H - 82, 1));
      },
    };
  };

  // ======================================================================
  // FLASHBACK: DIMENSIÓN 01
  // ======================================================================
  S.cold = () => {
    const FLOOR = 150;
    const k01 = { spec: SS.gfx.SPECS.kazoo01, x: 150, y: FLOOR - 24, facing: 1, pose: "idle", visible: true };
    const ozk = { spec: SS.gfx.SPECS.oozak, x: 236, y: FLOOR - 24, facing: -1, pose: "idle", visible: true };
    const fx = new SS.Particles();
    const cam = { x: 0, y: 0 };
    let portal = 0, portalTarget = 0, stone = { held: true, t: 0, flying: false }, beam = 0, flash = 0, goldK = null, t = 0, script, skip = false;
    const toLevel = () => { SS.save.stage = "pre"; SS.writeSave(); SS.go(() => S.level({ mode: "pre", intro: true })); };
    return {
      pausable: false,
      enter() {
        SS.audio.music("flash");
        SS.ui.card("DIMENSIÓN 01", "Hace mucho tiempo", 2.6);
        SS.ui.hint("{pause} para saltar la escena");
        script = new SS.Script(function* () {
          yield wait(2.8);
          SS.ui.hint(null);
          yield say(SS.TEXT.cold1);
          portalTarget = 1; SS.audio.sfx("glitch");
          yield wait(0.9);
          yield say(SS.TEXT.cold2);
          k01.pose = "throw"; stone.held = false; stone.flying = true; stone.t = 0; SS.audio.sfx("throw");
          yield wait(0.75);
          stone.flying = false; portalTarget = 0; SS.audio.sfx("blink"); k01.pose = "idle";
          yield wait(0.4);
          yield say(SS.TEXT.cold3);
          ozk.pose = "kazoo"; SS.audio.sfx("zap"); beam = 0.7;
          yield wait(0.7);
          flash = 1; SS.shake = 7; k01.visible = false; ozk.pose = "idle";
          fx.burst(k01.x + 8, k01.y + 12, 60, ["#ffd23f", "#fff3b0", "#f4f4f4", "#c79a12"], 120, 40, 1.6, 2);
          goldK = { x: k01.x + 6, y: k01.y + 6, vy: -80, landed: false };
          yield wait(2.4);
          yield say(SS.TEXT.cold4);
          yield wait(0.5);
          SS.ui.card("DIMENSIÓN 02", "Culiacán · Hoy", 2.6);
          yield wait(2.4);
          toLevel();
        }());
      },
      update(dt) {
        t += dt;
        if (!skip && SS.input.hit("pause") && !SS.ui.dialogOpen()) { skip = true; toLevel(); return; }
        script.update(dt);
        portal = SS.approach(portal, portalTarget, dt * 2);
        beam = Math.max(0, beam - dt);
        flash = Math.max(0, flash - dt * 1.5);
        if (stone.flying) stone.t += dt;
        if (goldK && !goldK.landed) { goldK.vy += 500 * dt; goldK.y += goldK.vy * dt; if (goldK.y >= FLOOR - 8) { goldK.y = FLOOR - 8; goldK.landed = true; SS.audio.sfx("clink"); } }
        fx.update(dt);
      },
      draw(ctx) {
        for (let i = 0; i < 10; i++) { ctx.fillStyle = ["#07051a", "#0b0722", "#10092a", "#160b33", "#1d0d3c", "#250f45", "#2d114e", "#361356", "#3f155f", "#481768"][i]; ctx.fillRect(0, i * 15, W, 15); }
        for (let i = 0; i < 60; i++) { if (Math.sin(t * 2 + i) > 0.3) { ctx.fillStyle = "#b0a7dc"; ctx.fillRect((SS.hash(i) * W) | 0, (SS.hash(i + 50) * 130) | 0, 1, 1); } }
        ctx.font = '64px "Press Start 2P"'; ctx.textBaseline = "top"; ctx.fillStyle = "rgba(255,43,214,.07)"; ctx.fillText("01", 128, 30);
        ctx.fillStyle = "#120a22"; ctx.fillRect(0, FLOOR, W, H - FLOOR);
        ctx.fillStyle = "#ff2bd6"; ctx.fillRect(0, FLOOR, W, 1);
        ctx.strokeStyle = "rgba(255,43,214,.35)"; ctx.lineWidth = 1; ctx.beginPath();
        for (let j = -12; j <= 12; j++) { ctx.moveTo(W / 2 + j * 4 + 0.5, FLOOR); ctx.lineTo(W / 2 + j * 50 + 0.5, H); }
        ctx.stroke();
        for (let i = 1; i < 8; i++) { const y = FLOOR + Math.round((H - FLOOR) * Math.pow(((i + (t * 0.5) % 1)) / 8, 2)); ctx.fillStyle = "rgba(255,43,214,.3)"; ctx.fillRect(0, y, W, 1); }
        if (portal > 0.02) {
          for (let r = 0; r < 6; r++) {
            const rad = (24 - r * 3.5) * portal;
            ctx.strokeStyle = ["#ff7a1a", "#ffd23f", "#2ee6d6", "#ff4fa3", "#6fb7ff", "#ffffff"][(r + Math.floor(t * 8)) % 6];
            ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(62, 112, rad * 0.6, rad, 0, 0, Math.PI * 2); ctx.stroke();
          }
        }
        let sxp = null, syp = null;
        if (stone.held && k01.visible) { sxp = k01.x + 13; syp = k01.y + 10; }
        if (stone.flying) { const u = Math.min(1, stone.t / 0.6); sxp = SS.lerp(k01.x + 13, 62, u); syp = SS.lerp(k01.y + 10, 112, u) - Math.sin(u * Math.PI) * 30; }
        if (sxp !== null) { ctx.globalAlpha = 0.4; ctx.fillStyle = "#ff2bd6"; ctx.fillRect(Math.round(sxp) - 5, Math.round(syp) - 5, 10, 10); ctx.globalAlpha = 1; ctx.drawImage(SS.gfx.icon("stone"), Math.round(sxp) - 6, Math.round(syp) - 6); }
        if (k01.visible) SS.gfx.drawPerson(ctx, k01.spec, k01.pose, Math.floor(t * 2) % 2, k01.x, k01.y, k01.facing);
        SS.gfx.drawPerson(ctx, ozk.spec, ozk.pose, Math.floor(t * 2) % 2, ozk.x, ozk.y, ozk.facing);
        if (beam > 0) { const y = ozk.y + 8; for (let i = 0; i < 3; i++) { ctx.fillStyle = ["#ff2bd6", "#ffffff", "#a01a88"][i]; ctx.fillRect(k01.x + 8, y - 2 + i + Math.round(SS.rand(-1, 1)), ozk.x - k01.x - 8, 1 + (i === 1 ? 1 : 0)); } }
        if (goldK) ctx.drawImage(SS.gfx.icon("gk"), Math.round(goldK.x), Math.round(goldK.y));
        fx.draw(ctx, cam);
        if (flash > 0) { ctx.globalAlpha = Math.min(1, flash); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      },
    };
  };

  // ======================================================================
  // CASA DE CÉSAR (final del prólogo)
  // ======================================================================
  S.cesar = () => {
    const lv = new SS.Level(24, 14, "culiacan");
    lv.fill(0, 11, 23, 13, "#");
    const cam = { x: 0, y: 8 };
    const GY = 176 - cam.y;
    const kz = { x: 70, y: 176 - 24 - cam.y, facing: 1, pose: "idle", visible: false };
    const ce = { x: 14 * T, y: 176 - 24 - cam.y, visible: false };
    const fx = new SS.Particles();
    let van = { x: -80 }, doorOpen = false, t = 0, script, glow = 0;
    return {
      pausable: false,
      enter() {
        SS.audio.music("van");
        SS.save.stage = "cesar"; SS.writeSave();
        script = new SS.Script(function* () {
          yield SS.until(() => (van.x = Math.min(30, van.x + 2)) >= 30);
          SS.audio.sfx("door");
          yield wait(0.4);
          kz.visible = true;
          yield SS.moveTo(kz, 14 * T - 18, 70);
          kz.facing = 1;
          yield wait(0.3);
          kz.pose = "knock"; SS.audio.sfx("knock");
          yield wait(0.7);
          kz.pose = "idle";
          yield wait(0.6);
          doorOpen = true; SS.audio.sfx("door"); ce.visible = true;
          yield wait(0.5);
          yield say(SS.TEXT.cesar1);
          doorOpen = false; ce.visible = false; SS.audio.sfx("door"); SS.shake = 2;
          yield wait(1);
          kz.facing = -1;
          yield wait(0.6);
          glow = 1; SS.audio.sfx("open");
          fx.burst(kz.x + 8, kz.y + 12, 26, ["#ff2bd6", "#ffd23f"], 70, -20, 1.2);
          yield say(SS.TEXT.cesar2);
          yield wait(0.4);
          SS.ui.card("FIN DEL PRÓLOGO", "ACTO I · Cargar partida", 3.2);
          yield wait(3.4);
          SS.save.stage = "done"; SS.writeSave();
          SS.go(() => S.end());
        }());
      },
      update(dt) { t += dt; script.update(dt); fx.update(dt); glow = Math.max(0, glow - dt * 0.3); },
      draw(ctx) {
        SS.gfx.drawCityBg(ctx, 600, 0.3, t);
        SS.gfx.palm(ctx, 30, GY, t); SS.gfx.palm(ctx, 330, GY, t); SS.gfx.lamp(ctx, 300, GY, true, t);
        SS.gfx.house(ctx, 9 * T, GY, 9, "#e8d8b0", "#b8a070", "2012", { door: 14 * T, doorOpen, lit: true });
        if (ce.visible) SS.gfx.drawPerson(ctx, SS.gfx.SPECS.cesarPro, "idle", Math.floor(t * 2) % 2, ce.x, ce.y, -1);
        SS.drawTiles(ctx, lv, cam, t);
        SS.gfx.van(ctx, van.x, 144 - cam.y, t, true);
        if (kz.visible) SS.gfx.drawPerson(ctx, SS.gfx.SPECS.kazoo, kz.pose, kz.pose === "run" ? Math.floor(t * 10) % 4 : Math.floor(t * 4) % 2, kz.x, kz.y, kz.facing);
        if (glow > 0) { ctx.globalAlpha = glow * 0.6; ctx.fillStyle = "#ff2bd6"; ctx.fillRect(Math.round(kz.x) + 2, kz.y + 10, 12, 10); ctx.globalAlpha = 1; }
        fx.draw(ctx, { x: 0, y: 0 });
      },
    };
  };

  // fondo de estrellitas para paneles
  const starfield = (ctx, t) => { ctx.fillStyle = "#07051a"; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 80; i++) { ctx.fillStyle = ["#ff7a1a", "#ffd23f", "#2ee6d6", "#ff4fa3", "#6fb7ff"][i % 5]; ctx.fillRect((SS.hash(i) * W) | 0, ((SS.hash(i + 9) * H + t * 20 * (1 + (i % 3))) % H) | 0, 2, 2); } };
  SS.starfield = starfield;

  S.end = () => {
    let ready = 0;
    return {
      pausable: false,
      enter() {
        SS.audio.music("title");
        const s = SS.save;
        SS.ui.panel(`<h2>PRÓLOGO COMPLETADO</h2>
          <div class="row"><span>Feria</span><b>${s.feria}</b></div>
          <div class="row"><span>Kazoos Dorados</span><b>${SS.countGot("gk")}/3</b></div>
          <div class="row"><span>Fotos del grupo</span><b>${SS.countGot("photo")}/20</b></div>
          <div class="row"><span>Glitchómetro</span><b>${Math.round(s.glitch)}%</b></div>
          <div class="row"><span>Tiempo</span><b>${fmtTime(s.time)}</b></div>
          <p>Ahora la consola de la Kazoovan te lleva a las dimensiones de tus compas. Recupéralos en el orden que quieras.<br>${SS.ui.fmt("Presiona {confirm}")}</p>`);
      },
      update(dt) { ready += dt; if (ready > 1 && (SS.input.hit("confirm") || SS.input.hit("attack"))) SS.go(() => S.van({ fromDrive: true })); },
      draw(ctx) { starfield(ctx, ready); },
    };
  };

  S.levelDone = (id, free, first) => {
    let ready = 0;
    return {
      pausable: false,
      enter() {
        SS.audio.music("title");
        const L = SS.LEVELS[id], c = SS.levelItems(id), s = SS.save;
        let extra = "";
        if (first && L.recruit) extra = `<p>${SS.CHARS[L.recruit].name} se unió al equipo.</p>`;
        if (first && SS.ACT1.includes(id) && SS.ACT1.every(l => s.done[l])) extra += "<p>¡Recuperaste a los cuatro! Se desbloqueó el ACTO II.</p>";
        if (first && SS.ACT2.includes(id) && SS.ACT2.every(l => s.done[l])) extra += "<p>Todas las dimensiones nuevas. Algo raro va a pasar en la Kazoovan...</p>";
        SS.ui.panel(`<h2>${free ? "JUEGO LIBRE" : "NIVEL COMPLETADO"}<br>${L.title}</h2>
          <div class="row"><span>Kazoos Dorados</span><b>${c.gkGot}/${c.gk}</b></div>
          <div class="row"><span>Fotos del grupo</span><b>${c.phGot}/${c.ph} · total ${SS.countGot("photo")}/20</b></div>
          <div class="row"><span>Feria</span><b>${s.feria}</b></div>
          <div class="row"><span>Glitchómetro</span><b>${Math.round(s.glitch)}%</b></div>
          ${extra}<p>${SS.ui.fmt("Presiona {confirm}")}</p>`);
      },
      update(dt) { ready += dt; if (ready > 1 && (SS.input.hit("confirm") || SS.input.hit("attack"))) SS.go(() => S.van({ fromDrive: true })); },
      draw(ctx) { starfield(ctx, ready); },
    };
  };

  // ======================================================================
  // PANTALLA AZUL (Final D)
  // ======================================================================
  S.blue = () => {
    let t = 0;
    return {
      pausable: false,
      enter() { SS.audio.music(null); SS.audio.sfx("crash"); SS.save.endings.D = true; if (SS.save.stage === "act3" || SS.save.stage === "post") SS.save.unlocked.cero = true; SS.writeSave(); },
      update(dt) {
        t += dt;
        if (t > 1.5 && (SS.input.hit("confirm") || SS.input.hit("attack") || SS.input.hit("jump"))) { SS.save.glitch = 50; SS.writeSave(); SS.go(S.route()); }
      },
      draw(ctx) {
        ctx.fillStyle = "#1f3fbf"; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#ffffff"; ctx.textBaseline = "top";
        ctx.font = '24px "Press Start 2P"'; ctx.fillText(":(", 30, 24);
        ctx.font = '8px "Press Start 2P"';
        ctx.fillText(SS.TEXT.blueScreen, 30, 72);
        ctx.fillText("El Glitchometro llego a 100%.", 30, 92);
        ctx.fillText("Codigo de error: SIMULATOR_CERO", 30, 108);
        ctx.fillStyle = "#ffd23f"; ctx.fillText("FINAL D · PANTALLA AZUL", 30, 132);
        ctx.fillStyle = "#ffffff";
        if (t > 1.5 && Math.floor(t * 2) % 2) ctx.fillText("Presiona un boton para reiniciar", 30, 170);
      },
    };
  };
})();
