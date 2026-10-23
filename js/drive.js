// SUPER SIMULATOR · la Carretera Interdimensional (pseudo-3D estilo Super Nintendo)
(() => {
  "use strict";
  const W = SS.W, H = SS.H;
  const OUT = "#120f1c";

  // ---------- sprites de la carretera ----------
  const SPR = {};
  function sprites() {
    if (SPR.ready) return SPR;
    const mk = SS.gfx.mk;
    {
      const [c, x] = mk(48, 30);
      x.fillStyle = OUT; x.fillRect(1, 2, 46, 24); x.fillRect(4, 0, 40, 4);
      x.fillStyle = "#f4f4f4"; x.fillRect(2, 3, 44, 22); x.fillRect(5, 1, 38, 3);
      x.fillStyle = "#c9c3dc"; x.fillRect(2, 19, 44, 6);
      x.fillStyle = "#3b4a7a"; x.fillRect(7, 4, 15, 9); x.fillRect(26, 4, 15, 9);
      x.fillStyle = "rgba(255,255,255,.4)"; x.fillRect(8, 5, 4, 2); x.fillRect(27, 5, 4, 2);
      x.fillStyle = "#7b4dff"; x.fillRect(2, 14, 44, 3);
      x.fillStyle = "#e83b3b"; x.fillRect(2, 17, 5, 3); x.fillRect(41, 17, 5, 3);
      x.fillStyle = "#ffd23f"; x.fillRect(19, 19, 10, 3);
      x.fillStyle = OUT; x.fillRect(23, 4, 2, 15);
      x.fillStyle = OUT; x.fillRect(3, 25, 9, 5); x.fillRect(36, 25, 9, 5);
      x.fillStyle = "#2b2b3d"; x.fillRect(4, 25, 7, 4); x.fillRect(37, 25, 7, 4);
      SPR.van = c;
    }
    {
      const [c, x] = mk(32, 64);
      x.fillStyle = OUT; x.fillRect(13, 14, 6, 50);
      x.fillStyle = "#8a6a4a"; for (let i = 14; i < 64; i += 5) x.fillRect(14, i, 4, 4);
      const fr = (dx, dy, w) => { x.fillStyle = OUT; x.fillRect(dx - 1, dy - 1, w + 2, 4); x.fillStyle = "#2ea84a"; x.fillRect(dx, dy, w, 2); };
      fr(1, 12, 14); fr(17, 12, 14); fr(0, 16, 8); fr(24, 16, 8); fr(6, 8, 20); fr(3, 10, 10); fr(19, 10, 10);
      SPR.palm = c;
    }
    {
      const [c, x] = mk(14, 56);
      x.fillStyle = OUT; x.fillRect(5, 4, 4, 52); x.fillRect(2, 0, 10, 6);
      x.fillStyle = "#4a4659"; x.fillRect(6, 6, 2, 50); x.fillStyle = "#ffe27a"; x.fillRect(3, 2, 8, 3);
      SPR.lamp = c;
    }
    SPR.houses = ["#f2b35a", "#7fd3c4", "#c9a3ff", "#ff8fb1", "#e8d8b0"].map(col => {
      const [c, x] = mk(64, 48);
      x.fillStyle = OUT; x.fillRect(0, 6, 64, 42);
      x.fillStyle = col; x.fillRect(1, 7, 62, 41);
      x.fillStyle = "rgba(0,0,0,.18)"; x.fillRect(1, 7, 62, 3);
      x.fillStyle = OUT; x.fillRect(44, 0, 14, 8); x.fillStyle = "#24222c"; x.fillRect(45, 1, 12, 7);
      x.fillStyle = OUT; x.fillRect(6, 16, 20, 16); x.fillStyle = "#3b4a7a"; x.fillRect(7, 17, 18, 14);
      x.fillStyle = OUT; for (let i = 10; i < 25; i += 4) x.fillRect(i, 17, 1, 14);
      x.fillStyle = OUT; x.fillRect(36, 22, 16, 26); x.fillStyle = "#7a4a2a"; x.fillRect(37, 23, 14, 25);
      return c;
    });
    {
      const [c, x] = mk(40, 24);
      x.fillStyle = OUT; x.fillRect(0, 4, 40, 17); x.fillRect(6, 0, 28, 6);
      x.fillStyle = "#e8e4dc"; x.fillRect(1, 5, 38, 15); x.fillRect(7, 1, 26, 5);
      x.fillStyle = "#3b4a7a"; x.fillRect(9, 2, 22, 4);
      x.fillStyle = "#e83b3b"; x.fillRect(2, 9, 6, 3); x.fillRect(32, 9, 6, 3);
      x.fillStyle = "#c9c3dc"; x.fillRect(1, 15, 38, 5);
      x.fillStyle = "#ffd23f"; x.fillRect(15, 14, 10, 3);
      x.fillStyle = OUT; x.fillRect(2, 20, 7, 4); x.fillRect(31, 20, 7, 4);
      SPR.tsuru = c;
    }
    {
      const [c, x] = mk(24, 24);
      x.fillStyle = OUT; x.fillRect(0, 0, 24, 24);
      for (let r = 1; r < 23; r += 4) for (let q = 1; q < 23; q += 4) { x.fillStyle = ((r + q) / 4) % 2 < 1 ? "#ff2bd6" : "#1a0f2a"; x.fillRect(q, r, 4, 4); }
      x.fillStyle = "#fff"; x.fillRect(6, 8, 4, 4); x.fillRect(14, 8, 4, 4);
      x.fillStyle = OUT; x.fillRect(7, 9, 2, 3); x.fillRect(15, 9, 2, 3);
      SPR.cube = c;
    }
    {
      const [c, x] = mk(10, 12);
      x.fillStyle = OUT; x.fillRect(3, 0, 4, 2); x.fillRect(2, 2, 6, 8); x.fillRect(0, 10, 10, 2);
      x.fillStyle = "#ff7a1a"; x.fillRect(4, 1, 2, 2); x.fillRect(3, 3, 4, 6); x.fillStyle = "#f4f4f4"; x.fillRect(3, 5, 4, 2); x.fillStyle = "#ff7a1a"; x.fillRect(1, 10, 8, 1);
      SPR.cone = c;
    }
    {
      const [c, x] = mk(48, 28);
      x.fillStyle = OUT; x.fillRect(22, 14, 4, 14); x.fillRect(0, 0, 48, 16);
      x.fillStyle = "#2ea84a"; x.fillRect(1, 1, 46, 14);
      x.fillStyle = "#f4f4f4"; x.font = '6px "Press Start 2P"'; x.textBaseline = "top"; x.fillText("CESAR", 4, 2); x.fillText("2 KM", 4, 9);
      SPR.sign = c;
    }
    SPR.coin = SS.gfx.icon("coin");
    {
      const [c, x] = mk(40, 24);
      x.drawImage(SPR.tsuru, 0, 0);
      x.globalCompositeOperation = "source-atop"; x.fillStyle = "rgba(255,79,163,.55)"; x.fillRect(0, 0, 40, 16); x.globalCompositeOperation = "source-over";
      x.fillStyle = "#ffd23f"; x.fillRect(16, 6, 8, 2);
      SPR.rival = c;
    }
    {
      const [c, x] = mk(48, 30);
      x.drawImage(SPR.van, 0, 0);
      x.globalCompositeOperation = "source-atop"; x.fillStyle = "rgba(26,15,42,.75)"; x.fillRect(0, 0, 48, 30); x.globalCompositeOperation = "source-over";
      x.fillStyle = "#ff2bd6"; x.fillRect(2, 14, 44, 2); x.fillRect(2, 17, 5, 3); x.fillRect(41, 17, 5, 3);
      SPR.vanDark = c;
    }
    {
      const [c, x] = mk(16, 14);
      x.fillStyle = OUT; x.fillRect(0, 0, 16, 14); x.fillStyle = "#c79a6a"; x.fillRect(1, 1, 14, 12); x.fillStyle = "#ff2bd6"; x.fillRect(7, 1, 2, 12);
      SPR.box = c;
    }
    SPR.ready = true;
    return SPR;
  }

  const easeIn = (a, b, p) => a + (b - a) * p * p;
  const easeInOut = (a, b, p) => a + (b - a) * (-Math.cos(p * Math.PI) / 2 + 0.5);

  class Drive {
    constructor(opts = {}) {
      this.pausable = true;
      this.segLen = 200; this.rumble = 3; this.roadW = 2000; this.camH = 1000; this.drawDist = 110;
      this.camDepth = 1 / Math.tan((100 / 2) * Math.PI / 180);
      this.playerZ = this.camH * this.camDepth;
      this.maxSpeed = this.segLen * 60;
      this.track = opts.track || "prologue";
      this.free = !!opts.free;
      this.segments = [];
      this.build();
      this.trackLength = this.segments.length * this.segLen;
      this.position = 0; this.speed = 0; this.playerX = 0; this.t = 0;
      this.hitT = 0; this.cd = 0; this.inv = 0; this.count = 3.2; this.finished = false; this.skyX = 0; this.coins = 0;
      this.replay = this.track === "prologue" && (SS.save.stage === "done" || SS.save.stage === "post");
      this.fx = new SS.Particles();
      this.cars = [];
      if (this.track === "mocorito") {
        // los Senpais de Mocorito: tres carros rosas
        for (let i = 0; i < 3; i++) this.cars.push({ z: this.playerZ + (3 + i * 4) * this.segLen, x: [-0.5, 0.4, 0][i], speed: this.maxSpeed * [0.74, 0.7, 0.66][i], img: "rival", rival: true });
      }
      if (this.track === "chase") this.van = { z: this.playerZ + 18 * this.segLen, x: 0, speed: this.maxSpeed * 0.86, hp: 6, throwT: 2, hitT: 0 };
    }
    lastY() { const s = this.segments; return s.length ? s[s.length - 1].p2.world.y : 0; }
    seg(curve, y) {
      const n = this.segments.length;
      this.segments.push({ index: n, p1: { world: { y: this.lastY(), z: n * this.segLen }, camera: {}, screen: {} }, p2: { world: { y, z: (n + 1) * this.segLen }, camera: {}, screen: {} }, curve, sprites: [], dark: Math.floor(n / this.rumble) % 2 === 1 });
    }
    road(enter, hold, leave, curve, height) {
      const y0 = this.lastY(), y1 = y0 + height * this.segLen, total = enter + hold + leave;
      for (let n = 0; n < enter; n++) this.seg(easeIn(0, curve, n / enter), easeInOut(y0, y1, n / total));
      for (let n = 0; n < hold; n++) this.seg(curve, easeInOut(y0, y1, (enter + n) / total));
      for (let n = 0; n < leave; n++) this.seg(easeInOut(curve, 0, n / leave), easeInOut(y0, y1, (enter + hold + n) / total));
    }
    build() {
      const R = (a, b, c, cu, h) => this.road(a, b, c, cu, h);
      if (this.track === "mocorito") {
        R(0, 40, 0, 0, 0); R(30, 60, 30, 3, 20); R(0, 60, 0, 0, -10); R(30, 50, 30, -4, 30); R(20, 40, 20, 2, -30); R(0, 80, 0, 0, 0);
        R(30, 60, 30, -3, 20); R(30, 60, 30, 4, -20); R(0, 100, 0, 0, 0); R(25, 40, 25, -2, 10); R(0, 120, 0, 0, 0);
        return this.decorate(0.5, false);
      }
      if (this.track === "chase") {
        for (let k = 0; k < 4; k++) { R(0, 60, 0, 0, 0); R(30, 50, 30, 3, 20); R(25, 40, 25, -3, -20); R(0, 80, 0, 0, 0); R(30, 60, 30, -2, 30); R(25, 50, 25, 4, -30); }
        R(0, 120, 0, 0, 0);
        return this.decorate(0.3, true);
      }
      R(0, 50, 0, 0, 0);
      R(25, 40, 25, 2, 0);
      R(25, 50, 25, -2, 20);
      R(0, 80, 0, 0, 0);
      R(25, 25, 25, 3, -20);
      R(25, 60, 25, -3, 0);
      R(25, 25, 25, 0, 40);
      R(0, 60, 0, 0, 0);
      R(25, 40, 25, 4, -30);
      R(25, 40, 25, -4, 10);
      R(0, 100, 0, 0, 0);
      R(25, 50, 25, 2, 20);
      R(25, 50, 25, -2, -20);
      R(0, 80, 0, 0, 0);
      R(25, 25, 25, -3, 0);
      R(25, 60, 25, 3, 30);
      R(0, 80, 0, 0, 0);
      R(50, 100, 50, 0, -50);
      R(0, 140, 0, 0, 0);
      this.decorate(1, false);
    }
    decorate(obstacleRate, voidSky) {
      this.voidSky = voidSky;
      const S = sprites();
      const add = (n, img, offset, worldW, kind) => { const s = this.segments[n]; if (s) s.sprites.push({ img, offset, worldW, kind }); };
      const N = this.segments.length;
      if (obstacleRate < 1) {
        for (let n = 10; n < N - 20; n += 12) { add(n, voidSky ? S.cube : S.palm, -1.4 - SS.hash(n) * 0.3, voidSky ? 300 : 380); add(n + 6, voidSky ? S.cube : S.palm, 1.4 + SS.hash(n + 1) * 0.3, voidSky ? 300 : 380); }
        if (!voidSky) for (let n = 5; n < N - 20; n += 22) { add(n + 3, S.houses[(n / 22) % 5 | 0], -2.4 - SS.hash(n * 3) * 0.8, 900); add(n + 14, S.houses[((n / 22) + 2) % 5 | 0], 2.4 + SS.hash(n * 5) * 0.8, 900); }
        for (let n = 140; n < N - 140; n += 60 + ((SS.hash(n) * 30) | 0)) { const off = Math.round((SS.hash(n * 11) * 1.4 - 0.7) * 10) / 10; add(n, SS.hash(n * 7) < 0.5 ? S.cube : S.cone, off, 300, "solid"); }
        for (let n = 60; n < N - 60; n += 70) { const off = Math.round((SS.hash(n * 3.3) * 1.2 - 0.6) * 10) / 10; for (let k = 0; k < 5; k++) add(n + k * 3, S.coin, off, 150, "coin"); }
        return;
      }
      for (let n = 10; n < N - 20; n += 12) { add(n, S.palm, -1.4 - SS.hash(n) * 0.3, 380); add(n + 6, S.palm, 1.4 + SS.hash(n + 1) * 0.3, 380); }
      for (let n = 20; n < N - 20; n += 30) { add(n, S.lamp, -1.15, 130); add(n + 15, S.lamp, 1.15, 130); }
      for (let n = 5; n < N - 20; n += 22) { add(n + 3, S.houses[(n / 22) % 5 | 0], -2.4 - SS.hash(n * 3) * 0.8, 900); add(n + 14, S.houses[((n / 22) + 2) % 5 | 0], 2.4 + SS.hash(n * 5) * 0.8, 900); }
      for (const n of [300, 900, N - 260]) add(n, S.sign, 1.25, 520);
      // obstáculos: cuadros grises, tsurus descompuestos y conos
      for (let n = 120; n < N - 120; n += 26 + ((SS.hash(n) * 14) | 0)) {
        const r = SS.hash(n * 7);
        const off = Math.round((SS.hash(n * 11) * 1.4 - 0.7) * 10) / 10;
        if (r < 0.45) add(n, S.cube, off, 380, "solid");
        else if (r < 0.75) add(n, S.tsuru, off, 520, "solid");
        else { add(n, S.cone, off - 0.2, 150, "solid"); add(n, S.cone, off + 0.2, 150, "solid"); }
      }
      for (let n = 60; n < N - 60; n += 70) { const off = Math.round((SS.hash(n * 3.3) * 1.2 - 0.6) * 10) / 10; for (let k = 0; k < 5; k++) add(n + k * 3, S.coin, off, 150, "coin"); }
      // la casa de César al final
      add(N - 40, S.houses[4], 1.9, 1100);
    }
    findSeg(z) { return this.segments[Math.floor(z / this.segLen) % this.segments.length]; }
    project(p, camX, camY, camZ) {
      p.camera.x = (p.world.x || 0) - camX;
      p.camera.y = (p.world.y || 0) - camY;
      p.camera.z = (p.world.z || 0) - camZ;
      p.screen.scale = this.camDepth / p.camera.z;
      p.screen.x = Math.round(W / 2 + p.screen.scale * p.camera.x * W / 2);
      p.screen.y = Math.round(H / 2 - p.screen.scale * p.camera.y * H / 2);
      p.screen.w = Math.round(p.screen.scale * this.roadW * W / 2);
    }
    enter() {
      SS.audio.music(this.track === "chase" ? "boss" : "drive");
      SS.ui.hint("{left}{right} manejar · {down} frenar · {ability} esquivar con la Kazoonita");
      if (this.track === "mocorito") { this.count = 99; const self = this; this.script = new SS.Script(function* () { yield SS.say([["narr", "Los Senpais de Mocorito te cierran el paso en tres carros rosas."], ["jesusPelon", "Si me ganan a Mocorito, los dejo pelear conmigo. Si no, se regresan a su dimensión."], ["kazoo", "Trato."]]); self.count = 3.2; }()); }
      if (this.track === "chase") { this.count = 99; const self = this; this.script = new SS.Script(function* () { yield SS.say([["narr", "Cero maneja la Kazoovan robada. El equipo va atrás en un Tsuru prestado."], ["kazoo", "¡Embístanla seis veces y se detiene!"], ["cero", "Atrápenme si pueden. Les dejo regalitos en la carretera."]]); self.count = 3.2; }()); }
    }
    pauseItems() {
      if (this.replay || this.free) return [{ label: "Regresar a la Kazoovan", action: () => SS.go(() => SS.scenes.van({ fromDrive: true })) }];
      return [{ label: "Reiniciar la carrera", action: () => SS.go(() => SS.scenes.drive({ track: this.track })) }];
    }
    finish(win, msg) {
      if (this.finished) return;
      this.finished = true;
      const self = this;
      SS.audio.sfx(win ? "jingle" : "die");
      SS.ui.toast(msg, 2.4);
      this.endT = 1.8;
      this.onEnd = () => {
        if (!win) { SS.go(() => SS.scenes.drive({ track: self.track, free: self.free })); return; }
        if (self.track === "prologue") { SS.go(() => (self.replay ? SS.scenes.van({ fromDrive: true }) : SS.scenes.cesar())); return; }
        SS.completeLevel("race_" + self.track, self.free);
      };
      if (this.track === "prologue" && !this.replay && win) { SS.save.stage = "cesar"; SS.writeSave(); }
    }
    updateCars(dt) {
      const pz = this.position + this.playerZ;
      for (const c of this.cars) {
        const seg = this.findSeg(c.z);
        // si se escapan mucho te esperan tantito, para que la carrera siempre se pueda ganar
        c.z += c.speed * (c.z - pz > this.segLen * 25 ? 0.75 : 1) * dt;
        c.x += (Math.sin(this.t * 0.7 + c.speed) * 0.3 - c.x) * dt * 0.5 - seg.curve * 0.002;
        c.x = SS.clamp(c.x, -0.8, 0.8);
        if (this.inv <= 0 && Math.abs(c.z - pz) < this.segLen * 0.8 && Math.abs(c.x - this.playerX) < 0.4) {
          this.inv = 0.8; this.hitT = 0.5; this.speed *= 0.6; SS.audio.sfx("crash"); SS.shake = 4;
          if (c.z < pz) c.z = pz - this.segLen; else c.z = pz + this.segLen;
        }
      }
      if (this.van) {
        const v = this.van;
        v.hitT = Math.max(0, v.hitT - dt);
        const gap = v.z - pz;
        v.speed = this.maxSpeed * (gap < this.segLen * 8 ? 0.98 : gap > this.segLen * 40 ? 0.7 : 0.86);
        v.z += v.speed * dt;
        v.x += (Math.sin(this.t * 0.9) * 0.6 - v.x) * dt;
        v.throwT -= dt;
        if (v.throwT <= 0) {
          v.throwT = 1.6 + Math.random();
          const seg = this.segments[Math.floor(v.z / this.segLen) - 2];
          if (seg) { seg.sprites.push({ img: sprites().box, offset: v.x + SS.rand(-0.3, 0.3), worldW: 260, kind: "solid" }); SS.audio.sfx("throw"); }
        }
        if (v.hitT <= 0 && gap > 0 && gap < this.segLen * 1.2 && Math.abs(v.x - this.playerX) < 0.45) {
          v.hp--; v.hitT = 1.2; v.z = pz + this.segLen * 14; this.speed *= 0.7;
          SS.audio.sfx("crash"); SS.shake = 8; this.fx.burst(W / 2, H / 2, 24, ["#ff2bd6", "#ffd23f", "#ffffff"], 140, 200, 0.7, 3);
          SS.ui.toast(v.hp > 0 ? `¡Le diste! Faltan ${v.hp}` : "¡La Kazoovan Oscura se detuvo!", 1.4);
          if (v.hp <= 0) this.finish(true, "¡Alcanzaste a Cero! Se metió corriendo a la Papelera");
        }
      }
    }
    update(dt) {
      this.t += dt;
      const I = SS.input, blocking = SS.ui.blocking();
      this.fx.update(dt);
      if (this.script) { this.script.update(dt); if (this.script.done) this.script = null; return; }
      if (this.endT !== undefined) { this.endT -= dt; this.speed = Math.max(0, this.speed - this.maxSpeed * dt); this.position += dt * this.speed; if (this.endT <= 0 && this.onEnd) { const f = this.onEnd; this.onEnd = null; f(); } return; }
      if (this.count > 0) {
        const before = Math.ceil(this.count);
        this.count -= dt;
        const now = Math.ceil(this.count);
        if (now !== before && now > 0) SS.audio.sfx("select");
        if (this.count <= 0) { SS.audio.sfx("confirm"); SS.ui.toast("¡VÁMONOS!", 1); }
        return;
      }
      if (this.t > 9) SS.ui.hint(null);
      SS.save.time += dt;
      const pSeg = this.findSeg(this.position + this.playerZ);
      const sp = this.speed / this.maxSpeed;
      const dx = dt * 2 * sp;
      this.cd = Math.max(0, this.cd - dt); this.inv = Math.max(0, this.inv - dt); this.hitT = Math.max(0, this.hitT - dt);
      if (!this.finished && !blocking) {
        if (I.held("left")) this.playerX -= dx;
        if (I.held("right")) this.playerX += dx;
        if (I.hit("ability") && this.cd <= 0) {
          const dir = I.held("left") ? -1 : I.held("right") ? 1 : (this.playerX > 0 ? -1 : 1);
          this.playerX += dir * 0.55; this.inv = 0.5; this.cd = 1.1;
          SS.audio.sfx("blink");
          this.fx.burst(W / 2, H - 20, 14, ["#ff2bd6", "#ffd23f", "#fff"], 90, 0, 0.4);
        }
      }
      this.playerX -= dx * sp * pSeg.curve * 0.3;
      if (this.finished || I.held("down")) this.speed += -this.maxSpeed * dt;
      else this.speed += (this.maxSpeed / 4.5) * dt;
      if ((this.playerX < -1 || this.playerX > 1) && this.speed > this.maxSpeed / 4) this.speed += (-this.maxSpeed / 2) * dt;
      this.playerX = SS.clamp(this.playerX, -1.7, 1.7);
      this.speed = SS.clamp(this.speed, 0, this.maxSpeed);
      this.position += dt * this.speed;
      this.skyX += pSeg.curve * sp * dt * 30;

      // choques y monedas
      const pw = 0.32;
      for (const s of pSeg.sprites) {
        if (s.taken) continue;
        const sw = s.worldW / this.roadW;
        if (Math.abs(this.playerX - s.offset) < (pw + sw) / 2) {
          if (s.kind === "coin") { s.taken = true; SS.save.feria++; this.coins++; SS.audio.sfx("coin"); }
          else if (s.kind === "solid" && this.inv <= 0) {
            s.taken = true;
            this.speed *= 0.3; this.hitT = 0.7; this.inv = 1;
            SS.save.glitch += 2; SS.shake = 6; SS.audio.sfx("crash");
            this.fx.burst(W / 2, H - 30, 20, ["#ff2bd6", "#9aa3b5", "#ffffff"], 120, 200, 0.6, 3);
          }
        }
      }
      if (SS.save.glitch >= 100) { SS.go(() => SS.scenes.blue()); return; }
      this.updateCars(dt);

      if (!this.finished && this.position >= this.trackLength - this.playerZ - this.segLen * 30) {
        if (this.track === "prologue") this.finish(true, "¡Llegaste a la colonia de César!");
        else if (this.track === "mocorito") { const pz = this.position + this.playerZ; const place = 1 + this.cars.filter(c => c.z > pz).length; this.finish(place === 1, place === 1 ? "¡PRIMER LUGAR! Los Senpais te abren paso" : `Llegaste en ${place}º lugar. Otra vez`); }
        else if (this.track === "chase") this.finish(false, "Cero se escapó. Otra vez");
      }
      if (this.position > this.trackLength - this.playerZ - this.segLen * 3) this.position = this.trackLength - this.playerZ - this.segLen * 3;
    }
    draw(ctx) {
      const prog = this.position / this.trackLength;
      const g = this.track === "chase" ? 0.85 : this.track === "mocorito" ? 0 : SS.clamp(prog * 1.2, 0, 0.85);
      const mix = SS.gfx.mixHex;
      // cielo
      const SKY = ["#2a1648", "#3d1a5a", "#5a1f66", "#7a2468", "#a02f62", "#c94a52", "#e8703e", "#f59a3c"];
      const SKYG = ["#1d1b26", "#25222f", "#2e2b38", "#383542", "#43404d", "#4f4b58", "#5c5864", "#6a6670"];
      for (let i = 0; i < SKY.length; i++) { ctx.fillStyle = mix(SKY[i], SKYG[i], g); ctx.fillRect(0, i * 14, W, 15); }
      const sunX = Math.round(W / 2 + 40 - this.skyX * 0.5);
      for (let yy = -26; yy <= 0; yy++) { const hw = Math.round(Math.sqrt(26 * 26 - yy * yy)); if (yy > -12 && (yy + 30) % 4 < 2) continue; ctx.fillStyle = mix("#ffe27a", "#9a97a6", g); ctx.fillRect(sunX - hw, 108 + yy, hw * 2, 1); }
      ctx.fillStyle = mix("#4a2052", "#2e2b38", g);
      for (let x = -40; x < W + 40; x += 20) { const bx = ((x - this.skyX * 2) % (W + 80) + W + 80) % (W + 80) - 40; const h = 10 + ((SS.hash(Math.floor((x - this.skyX * 2) / (W + 80)) * 13 + x) * 26) | 0); ctx.fillRect(Math.round(bx), 108 - h, 18, h); }
      for (let i = 0; i < 10; i++) {
        if (g < 0.15) break;
        const bx = (SS.hash(i * 3 + Math.floor(this.t * 2)) * W) | 0, by = (SS.hash(i * 7 + Math.floor(this.t * 2)) * 100) | 0;
        ctx.globalAlpha = g; ctx.fillStyle = i % 3 ? "#2a2834" : "#ff2bd6"; ctx.fillRect(bx, by, 8, 8); ctx.globalAlpha = 1;
      }

      // carretera
      const base = this.findSeg(this.position);
      const basePct = (this.position % this.segLen) / this.segLen;
      const pSeg = this.findSeg(this.position + this.playerZ);
      const pPct = ((this.position + this.playerZ) % this.segLen) / this.segLen;
      const playerY = SS.lerp(pSeg.p1.world.y, pSeg.p2.world.y, pPct);
      let maxy = H, x = 0, dx = -(base.curve * basePct);
      const drawn = [];
      for (let n = 0; n < this.drawDist; n++) {
        const s = this.segments[base.index + n];
        if (!s) break;
        this.project(s.p1, this.playerX * this.roadW - x, playerY + this.camH, this.position);
        this.project(s.p2, this.playerX * this.roadW - x - dx, playerY + this.camH, this.position);
        x += dx; dx += s.curve;
        s.clip = maxy;
        if (s.p1.camera.z <= this.camDepth || s.p2.screen.y >= s.p1.screen.y || s.p2.screen.y >= maxy) continue;
        maxy = s.p2.screen.y;
        drawn.push(s);
      }
      // de atrás hacia adelante: si no, la arena de los tramos lejanos tapa la carretera
      for (let i = drawn.length - 1; i >= 0; i--) this.drawSeg(ctx, drawn[i], g);
      // carros que se mueven: se acomodan en su segmento este cuadro
      for (const s of drawn) s.cars = null;
      const movers = this.cars.slice();
      if (this.van) movers.push({ z: this.van.z, x: this.van.x, img: "vanDark" });
      for (const c of movers) { const s = this.segments[Math.floor(c.z / this.segLen)]; if (s) (s.cars = s.cars || []).push({ img: sprites()[c.img], offset: c.x, worldW: c.img === "vanDark" ? 700 : 560 }); }
      // sprites de atrás hacia adelante
      for (let i = drawn.length - 1; i >= 0; i--) {
        const s = drawn[i];
        for (const sp of s.sprites.concat(s.cars || [])) {
          if (sp.taken && sp.kind === "coin") continue;
          const sc = s.p1.screen.scale;
          const dw = sp.worldW * sc * W / 2;
          if (dw < 1) continue;
          const dh = dw * sp.img.height / sp.img.width;
          const sx = s.p1.screen.x + sc * sp.offset * this.roadW * W / 2;
          const sy = s.p1.screen.y;
          const clipH = Math.max(0, sy - s.clip);
          if (clipH >= dh) continue;
          const srcH = sp.img.height * (1 - clipH / dh);
          ctx.globalAlpha = sp.taken ? 0.35 : 1;
          ctx.drawImage(sp.img, 0, 0, sp.img.width, srcH, Math.round(sx - dw / 2), Math.round(sy - dh), Math.round(dw), Math.round(dh - clipH));
          ctx.globalAlpha = 1;
        }
      }
      // la Kazoovan
      const bounce = this.speed > 0 && Math.floor(this.t * 12) % 2 ? 1 : 0;
      const lean = SS.input.held("left") ? -2 : SS.input.held("right") ? 2 : 0;
      if (!(this.inv > 0 && Math.floor(this.t * 16) % 2)) ctx.drawImage(sprites().van, Math.round(W / 2 - 24 + lean), H - 36 - bounce + (this.hitT > 0 ? Math.round(Math.sin(this.t * 40) * 2) : 0));
      this.fx.draw(ctx, { x: 0, y: 0 });

      // HUD de manejo
      ctx.fillStyle = "rgba(7,5,26,.75)"; ctx.fillRect(W / 2 - 92, 6, 184, 18);
      ctx.fillStyle = "#3d3478"; ctx.fillRect(W / 2 - 80, 18, 160, 3);
      ctx.fillStyle = "#ffd23f"; ctx.fillRect(W / 2 - 80, 18, Math.round(160 * SS.clamp(prog / 0.97, 0, 1)), 3);
      ctx.font = '6px "Press Start 2P"'; ctx.textBaseline = "top"; ctx.fillStyle = "#f3efff";
      const label = this.track === "mocorito" ? "A MOCORITO · LUGAR " + (1 + this.cars.filter(c => c.z > this.position + this.playerZ).length) + "/4" : this.track === "chase" ? "KAZOOVAN OSCURA · " + "■".repeat(Math.max(0, this.van.hp)) : "A CASA DE CESAR";
      ctx.fillText(label, Math.round(W / 2 - ctx.measureText(label).width / 2), 9);
      ctx.fillStyle = "#f3efff"; ctx.fillText(Math.round(this.speed / this.maxSpeed * 140) + " KM/H", 8, H - 14);
      ctx.drawImage(SS.gfx.icon("coin"), W - 54, H - 15); ctx.fillText(String(SS.save.feria), W - 42, H - 14);
      ctx.fillStyle = "#2a0f3a"; ctx.fillRect(8, 8, 64, 4); ctx.fillStyle = "#ff2bd6"; ctx.fillRect(8, 8, Math.round(SS.clamp(SS.save.glitch, 0, 100) * 0.64), 4);
      if (this.count > 0) {
        const n = Math.ceil(this.count);
        ctx.font = '24px "Press Start 2P"'; ctx.fillStyle = "#120f1c"; ctx.fillText(String(n), W / 2 - 10, 72); ctx.fillStyle = "#ffd23f"; ctx.fillText(String(n), W / 2 - 12, 70);
      }
    }
    drawSeg(ctx, s, g) {
      const mix = SS.gfx.mixHex;
      const x1 = s.p1.screen.x, y1 = s.p1.screen.y, w1 = s.p1.screen.w, x2 = s.p2.screen.x, y2 = s.p2.screen.y, w2 = s.p2.screen.w;
      const d = s.dark;
      const glitchSeg = g > 0.3 && SS.hash(s.index * 1.7) < g * 0.12;
      ctx.fillStyle = glitchSeg ? "#2a0f3a" : mix(d ? "#b8a47a" : "#c8b48a", d ? "#4a4659" : "#55525f", g);
      ctx.fillRect(0, y2, W, y1 - y2 + 1);
      const poly = (ax, ay, bx, by, cx, cy, ddx, ddy, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.lineTo(ddx, ddy); ctx.closePath(); ctx.fill(); };
      const r1 = w1 / 6, r2 = w2 / 6;
      const rumble = glitchSeg ? "#ff2bd6" : mix(d ? "#e83b3b" : "#f4f4f4", d ? "#77737c" : "#9a97a6", g);
      poly(x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, rumble);
      poly(x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2, rumble);
      poly(x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, glitchSeg ? "#1a0f2a" : mix(d ? "#45415a" : "#4a4659", "#3a3846", g));
      if (!d) {
        const l1 = w1 / 40, l2 = w2 / 40;
        poly(x1 - l1, y1, x1 + l1, y1, x2 + l2, y2, x2 - l2, y2, mix("#ffd23f", "#9a97a6", g));
      }
    }
  }
  SS.scenes.drive = opts => new Drive(opts || {});
})();
