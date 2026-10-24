// SUPER SIMULATOR · jefes
(() => {
  "use strict";
  const T = SS.T, W = SS.W, H = SS.H;
  const OUT = "#120f1c";

  class Boss {
    constructor(sc, B, o) {
      this.sc = sc; this.B = B;
      this.floorY = B.floor * T;
      Object.assign(this, { w: 20, h: 44, hp: 30, name: "JEFE", dir: -1, t: 0, st: "intro", stT: 1, vx: 0, vy: 0, flash: 0, dead: false, deathT: 0, stun: 0, invuln: false, warns: [], gravity: true, scale: 2, pose: "idle", hpMul: 1 }, o);
      this.maxHp = this.hp;
      this.x = o.x !== undefined ? o.x : B.x1 * T - 70;
      this.y = this.floorY - this.h;
    }
    get cx() { return this.x + this.w / 2; }
    get cy() { return this.y + this.h / 2; }
    get ax0() { return this.B.x0 * T + 8; }
    get ax1() { return this.B.x1 * T - 8; }
    target() { let best = null, bd = 1e9; for (const p of this.sc.players) if (p && !p.dead) { const d = Math.abs(p.cx - this.cx); if (d < bd) { bd = d; best = p; } } return best || this.sc.player; }
    hitbox() { return this.dead || this.invuln ? null : { x: this.x, y: this.y, w: this.w, h: this.h }; }
    damage(n, sc) {
      if (this.dead || this.invuln) return;
      if (this.stun > 0) n *= 1.5;
      this.hp -= n * this.hpMul; this.flash = 0.1;
      SS.audio.sfx("hit");
      if (this.hp <= 0) this.die();
      this.onHurt && this.onHurt();
    }
    die() {
      this.dead = true; this.deathT = 1.4; this.warns = [];
      SS.audio.sfx("crash"); SS.shake = 8;
      this.sc.fx.burst(this.cx, this.cy, 50, ["#ff2bd6", "#ffd23f", "#ffffff", "#2ee6d6"], 160, 200, 1.2, 3);
      this.sc.dropCoins(this.cx, this.y, 10);
      this.sc.eshots = [];
    }
    set(st, t) { this.st = st; this.stT = t; this.enterSt && this.enterSt(st); }
    warn(x, y, w, h, t, fn, col) { this.warns.push({ x, y, w, h, t, max: t, fn, col: col || "#e83b3b" }); }
    shot(o) { this.sc.enemyShot(o); }
    face() { const p = this.target(); this.dir = p.cx > this.cx ? 1 : -1; }
    update(dt, sc) {
      if (this.dead) { this.deathT -= dt; if (Math.random() < 0.4) sc.fx.burst(this.cx + SS.rand(-15, 15), this.cy + SS.rand(-20, 20), 4, ["#ffffff", "#ff2bd6"], 80, 0, 0.4); return; }
      this.t += dt; this.flash = Math.max(0, this.flash - dt); this.stun = Math.max(0, this.stun - dt);
      for (const w of this.warns) { w.t -= dt; if (w.t <= 0 && w.fn) { w.fn(); w.fn = null; } }
      this.warns = this.warns.filter(w => w.t > 0);
      if (this.stun > 0) { this.vx = 0; }
      else { this.stT -= dt; this.think(dt, sc); }
      if (this.gravity) { this.vy = Math.min(this.vy + 900 * dt, 500); SS.collide(sc.level, this, dt); }
      else { this.x += this.vx * dt; this.y += this.vy * dt; }
      this.x = SS.clamp(this.x, this.ax0, this.ax1 - this.w);
      if (!this.noTouch && this.stun <= 0) for (const p of sc.players) if (p && !p.dead && SS.overlap(this, p)) p.hurt(sc, this.cx);
    }
    drawWarns(ctx, cam) {
      for (const w of this.warns) {
        if (Math.floor(w.t * 10) % 2) continue;
        ctx.globalAlpha = 0.35; ctx.fillStyle = w.col; ctx.fillRect(Math.round(w.x - cam.x), Math.round(w.y - cam.y), w.w, w.h); ctx.globalAlpha = 1;
        ctx.fillStyle = w.col; ctx.fillRect(Math.round(w.x - cam.x), Math.round(w.y - cam.y), w.w, 1);
      }
    }
    draw(ctx, cam) {
      this.drawWarns(ctx, cam);
      const x = this.x - cam.x, y = this.y - cam.y;
      if (this.dead) ctx.globalAlpha = Math.max(0, this.deathT / 1.4);
      this.drawBody(ctx, x, y);
      ctx.globalAlpha = 1;
      if (this.flash > 0) { ctx.globalAlpha = 0.5; ctx.fillStyle = "#fff"; ctx.fillRect(Math.round(x), Math.round(y), this.w, this.h); ctx.globalAlpha = 1; }
      if (this.stun > 0) SS.gfx.stars(ctx, x + this.w / 2, y - 8, this.t);
      if (this.invuln && !this.dead) { ctx.strokeStyle = "#9ad0ff"; ctx.globalAlpha = 0.5 + Math.sin(this.t * 10) * 0.3; ctx.strokeRect(Math.round(x) - 3.5, Math.round(y) - 3.5, this.w + 7, this.h + 7); ctx.globalAlpha = 1; }
    }
    drawBody(ctx, x, y) {
      const f = Math.floor(this.t * 6) % 4;
      const moving = Math.abs(this.vx) > 5;
      SS.gfx.drawPerson(ctx, this.spec, this.pose !== "idle" ? this.pose : moving ? "run" : "idle", moving ? f : f % 2, x - 6, y - 4, this.dir, undefined, 2);
    }
    onKazoo() {}
  }

  // ---------------- 1. CÉSAR PRODUCTIVO ----------------
  class CesarPro extends Boss {
    constructor(sc, B, o) { super(sc, B, Object.assign({ name: "CÉSAR PRODUCTIVO", spec: SS.gfx.SPECS.cesarPro, hp: 30 }, o)); }
    think(dt) {
      const p = this.target();
      this.pose = "idle";
      if (this.st === "intro") { if (this.stT <= 0) this.set("walk", 1.6); return; }
      if (this.st === "walk") { this.face(); this.vx = this.dir * 50; if (this.stT <= 0) { this.vx = 0; this.set(SS.pick(["mail", "meeting", "dash"]), 1.4); this.did = false; } return; }
      if (this.st === "mail") {
        this.face(); this.pose = "throw";
        if (!this.did) { this.did = true; for (let i = 0; i < 3; i++) this.shot({ x: this.cx, y: this.y + 12, vx: this.dir * (90 + i * 50), vy: -220 + i * 30, g: 420, look: "correo", w: 10, h: 7 }); SS.audio.sfx("throw"); SS.ui.toast("\"Según mi último correo…\"", 1.2); }
        if (this.stT <= 0) this.set("rest", 0.8);
      } else if (this.st === "meeting") {
        if (!this.did) { this.did = true; SS.ui.toast("¡Junta de emergencia!", 1.2); for (let i = 0; i < 3; i++) { const x = SS.clamp(p.cx + (i - 1) * 50, this.ax0 + 10, this.ax1 - 20); this.warn(x - 8, this.floorY - 120, 16, 120, 0.9, () => this.shot({ x, y: this.floorY - 140, vx: 0, vy: 320, g: 300, look: "box", w: 12, h: 12, ghost: true, life: 1.2 })); } }
        if (this.stT <= 0) this.set("rest", 0.6);
      } else if (this.st === "dash") {
        if (!this.did) { this.did = true; this.face(); this.warn(Math.min(this.cx, this.dir > 0 ? this.ax1 : this.ax0), this.y + 10, Math.abs((this.dir > 0 ? this.ax1 : this.ax0) - this.cx), 24, 0.6, () => { this.vx = this.dir * 300; SS.ui.toast("¡SINERGIA!", 1); }); }
        this.pose = Math.abs(this.vx) > 10 ? "punch" : "idle";
        if (this.stT <= -0.6) { this.vx = 0; this.set("rest", 0.9); }
      } else if (this.st === "rest") { this.vx = 0; if (this.stT <= 0) this.set("walk", 1.2); }
    }
  }

  // ---------------- 2. JESÚS PELÓN ----------------
  class JesusPelon extends Boss {
    constructor(sc, B, o) { super(sc, B, Object.assign({ name: "JESÚS PELÓN", spec: SS.gfx.SPECS.jesusPelon, hp: 34 }, o)); }
    think() {
      const p = this.target();
      this.pose = "idle";
      if (this.st === "intro") { if (this.stT <= 0) this.set("walk", 1.2); return; }
      if (this.st === "walk") { this.face(); this.vx = this.dir * 60; if (this.stT <= 0) { this.vx = 0; this.set(SS.pick(["pound", "flash", "charge"]), 1.6); this.did = false; } return; }
      if (this.st === "pound") {
        if (!this.did && this.onGround) { this.did = true; this.vy = -380; this.landed = false; }
        if (this.did && !this.landed && this.onGround && this.vy === 0 && this.stT < 1.3) {
          this.landed = true; SS.shake = 6; SS.audio.sfx("break");
          for (const d of [-1, 1]) this.shot({ x: this.cx, y: this.floorY - 7, vx: d * 170, vy: 0, look: "ball", col: "#c9c3dc", w: 12, h: 10, ghost: true, life: 2 });
        }
        if (this.stT <= 0) this.set("rest", 0.7);
      } else if (this.st === "flash") {
        if (!this.did) {
          this.did = true; SS.ui.toast("La calva brilla…", 1.2);
          const y = this.floorY - 18;
          this.warn(this.ax0, y - 6, this.ax1 - this.ax0, 12, 0.9, () => { SS.audio.sfx("zap"); this.shot({ x: (this.ax0 + this.ax1) / 2, y, vx: 0, vy: 0, look: "beam", col: "#fff3b0", w: this.ax1 - this.ax0, h: 10, life: 0.4, ghost: true, pierce: true }); });
        }
        if (this.stT <= 0) this.set("rest", 0.6);
      } else if (this.st === "charge") {
        if (!this.did) { this.did = true; this.face(); this.vx = 0; this.warn(Math.min(this.cx, p.cx), this.y + 8, Math.abs(p.cx - this.cx) + 20, 28, 0.5, () => (this.vx = this.dir * 320)); }
        this.pose = Math.abs(this.vx) > 10 ? "punch" : "idle";
        if (this.stT <= 0) { this.vx = 0; this.set("rest", 1); }
      } else if (this.st === "rest") { this.vx = 0; if (this.stT <= 0) this.set("walk", 1); }
    }
  }

  // ---------------- 3. CARLOS CALLADO ----------------
  class CarlosCallado extends Boss {
    constructor(sc, B, o) { super(sc, B, Object.assign({ name: "CARLOS CALLADO", spec: SS.gfx.SPECS.carlosCallado, hp: 24, invuln: true, noTouch: false }, o)); }
    onKazoo(p, r) { if (Math.abs(p.cx - this.cx) < r + 90) { this.stun = 2.6; this.invuln = false; SS.ui.toast("¡El ruido lo desconcentró! Pégale", 1.4); SS.audio.sfx("bonk"); } }
    think() {
      const p = this.target();
      this.invuln = this.stun <= 0;
      this.pose = "idle";
      if (this.st === "intro") { if (this.stT <= 0) this.set("shh", 1.5); return; }
      if (this.st === "shh") {
        this.face();
        if (this.stT <= 1.2 && !this.did) { this.did = true; this.pose = "shout"; SS.audio.sfx("blink"); this.shot({ x: this.cx, y: this.cy, vx: 0, vy: 0, ring: true, grow: 95, look: "ring", col: "#9ad0ff", life: 2.4, stunP: 0.4 }); }
        if (this.stT <= 0) { this.did = false; this.set(SS.pick(["books", "tele", "shh"]), 1.4); }
      } else if (this.st === "books") {
        if (!this.did) { this.did = true; this.face(); for (let i = 0; i < 4; i++) this.shot({ x: this.cx, y: this.y + 10, vx: this.dir * (80 + i * 40), vy: -180 - i * 20, g: 400, look: "reporte", w: 10, h: 8 }); SS.audio.sfx("throw"); }
        if (this.stT <= 0) { this.did = false; this.set("shh", 1.4); }
      } else if (this.st === "tele") {
        if (!this.did) { this.did = true; this.sc.fx.burst(this.cx, this.cy, 14, ["#9ad0ff", "#ffffff"], 80, 0, 0.4); this.x = p.cx > (this.ax0 + this.ax1) / 2 ? this.ax0 + 20 : this.ax1 - 40; this.sc.fx.burst(this.cx, this.cy, 14, ["#9ad0ff", "#ffffff"], 80, 0, 0.4); }
        if (this.stT <= 0) { this.did = false; this.set("shh", 1.2); }
      }
    }
  }

  // ---------------- 4. DANIEL SONRIENTE ----------------
  class DanielSonriente extends Boss {
    constructor(sc, B, o) { super(sc, B, Object.assign({ name: "DANIEL SONRIENTE", spec: SS.gfx.SPECS.danielSonriente, hp: 36 }, o)); }
    think() {
      const p = this.target();
      this.pose = "idle";
      if (this.st === "intro") { if (this.stT <= 0) this.set("approach", 2); return; }
      if (this.st === "approach") {
        this.face(); this.vx = this.dir * 90;
        if (Math.abs(p.cx - this.cx) < 36) { this.vx = 0; this.set("combo", 1.1); this.hits = 0; }
        else if (this.stT <= 0) { this.vx = 0; this.set(SS.pick(["hearts", "upper"]), 1.4); this.did = false; }
      } else if (this.st === "combo") {
        const k = Math.floor((1.1 - this.stT) / 0.3);
        this.pose = k % 2 ? "punch" : "kazoo";
        if (k > this.hits - 1 && k < 3) {
          this.hits = k + 1; SS.audio.sfx("hit");
          const box = { x: this.dir > 0 ? this.x + this.w : this.x - 24, y: this.y + 8, w: 24, h: 24 };
          for (const pl of this.sc.players) if (pl && SS.overlap(box, pl)) pl.hurt(this.sc, this.cx);
          if (k === 0) SS.ui.toast("¡Qué bonito día!", 0.9);
        }
        if (this.stT <= 0) this.set("tired", 1.3);
      } else if (this.st === "tired") { this.vx = 0; this.pose = "hurt"; if (this.stT <= 0) this.set("approach", 1.6); }
      else if (this.st === "hearts") {
        if (!this.did) { this.did = true; this.face(); for (let i = -2; i <= 2; i++) this.shot({ x: this.cx, y: this.y + 12, vx: this.dir * 150, vy: i * 50, look: "heart", w: 8, h: 6 }); SS.audio.sfx("throw"); SS.ui.toast("¡Les mando amor!", 1); }
        if (this.stT <= 0) this.set("approach", 1.6);
      } else if (this.st === "upper") {
        if (!this.did && this.onGround) { this.did = true; this.face(); this.vy = -420; this.vx = this.dir * 120; this.pose = "jump"; }
        if (this.did && this.onGround && this.stT < 1.1) this.vx = 0;
        if (this.stT <= 0) this.set("tired", 0.9);
      }
    }
  }

  // ---------------- 5. LA VILLANA ----------------
  class Villana extends Boss {
    constructor(sc, B, o) { super(sc, B, Object.assign({ name: "LA VILLANA", spec: SS.gfx.SPECS.villana, hp: 40 }, o)); }
    think() {
      const p = this.target();
      this.pose = "idle";
      if (this.st === "intro") { if (this.stT <= 0) this.set("walk", 1.2); return; }
      if (this.st === "walk") { this.face(); this.vx = this.dir * 55; if (this.stT <= 0) { this.vx = 0; this.did = false; this.set(SS.pick(["zoom", "roses", "tears", "zoom"]), 1.6); } return; }
      if (this.st === "zoom") {
        if (!this.did) { this.did = true; this.face(); this.sc.zoomFx = 0.9; SS.audio.sfx("pause"); const bx = this.dir > 0 ? this.x + this.w : this.x - 70; this.warn(bx, this.y, 70, this.h, 0.85, () => { this.pose = "punch"; SS.audio.sfx("crash"); SS.shake = 6; const box = { x: bx, y: this.y, w: 70, h: this.h }; for (const pl of this.sc.players) if (pl && SS.overlap(box, pl)) pl.hurt(this.sc, this.cx, 2); SS.ui.toast("¡ZAS!", 0.8); }); }
        if (this.stT < 0.6) this.pose = "punch";
        if (this.stT <= 0) this.set("faint", 1.2);
      } else if (this.st === "faint") { this.pose = "hurt"; this.stun = Math.max(this.stun, 0.01); if (this.stT <= 0) this.set("walk", 1.2); }
      else if (this.st === "roses") {
        if (!this.did) { this.did = true; this.face(); for (let i = 0; i < 5; i++) this.shot({ x: this.cx, y: this.y + 10, vx: this.dir * (60 + i * 35), vy: -260 + i * 25, g: 420, look: "rosa", w: 8, h: 8 }); SS.audio.sfx("throw"); }
        if (this.stT <= 0) this.set("walk", 1);
      } else if (this.st === "tears") {
        if (!this.did) { this.did = true; SS.ui.toast("*llanto dramático*", 1.2); for (let i = 0; i < 4; i++) { const x = SS.rand(this.ax0 + 20, this.ax1 - 20); this.warn(x - 10, this.floorY - 6, 20, 6, 0.7, () => this.shot({ x, y: this.floorY - 4, vx: 0, vy: 0, look: "ball", col: "#5cc8ff", w: 20, h: 6, life: 3, ghost: true, pierce: true }), "#5cc8ff"); } }
        if (this.stT <= 0) this.set("walk", 1);
      }
    }
  }

  // ---------------- 6. SENPAI SUPREMO ----------------
  class Senpai extends Boss {
    constructor(sc, B, o) { super(sc, B, Object.assign({ name: "SENPAI SUPREMO", spec: SS.gfx.SPECS.senpai, hp: 45, form: 1 }, o)); }
    onHurt() {
      const f = this.hp > 30 ? 1 : this.hp > 15 ? 2 : 3;
      if (f !== this.form) { this.form = f; this.invuln = true; this.set("power", 1.4); this.did = false; this.warns = []; SS.ui.toast(f === 2 ? "¡SEGUNDA FORMA!" : "¡FORMA FINAL! ¡AAAAAAH!", 1.4); SS.shake = 8; SS.audio.sfx("zap"); }
    }
    think() {
      const p = this.target();
      this.pose = "idle";
      if (this.st === "intro") { if (this.stT <= 0) this.set("idle", 0.8); return; }
      if (this.st === "power") { this.pose = "shout"; this.vx = 0; if (Math.random() < 0.5) this.sc.fx.add({ x: this.cx + SS.rand(-14, 14), y: this.y + this.h, vy: -120, life: 0.5, max: 0.5, c: this.form === 3 ? "#ffd23f" : "#2ee6d6", s: 2 }); if (this.stT <= 0) { this.invuln = false; this.set("idle", 0.6); } return; }
      if (this.st === "idle") { this.face(); this.vx = 0; if (this.stT <= 0) { this.did = false; const opts = this.form === 1 ? ["dash", "dash", "barrage"] : this.form === 2 ? ["barrage", "dash", "beam"] : ["beam", "barrage", "dash"]; this.set(SS.pick(opts), 1.6); } return; }
      if (this.st === "dash") {
        if (!this.did) { this.did = true; this.face(); this.warn(Math.min(this.cx, p.cx) - 20, this.y + 10, Math.abs(p.cx - this.cx) + 60, 26, 0.5, () => { this.vx = this.dir * 420; SS.audio.sfx("blink"); }); }
        this.pose = Math.abs(this.vx) > 10 ? "punch" : "idle";
        if (this.stT <= 0.8) this.vx *= 0.9;
        if (this.stT <= 0) this.set("idle", 0.7);
      } else if (this.st === "barrage") {
        this.face(); this.pose = "throw";
        if (Math.floor(this.stT * 6) !== this.lastK && this.stT > 0.3) { this.lastK = Math.floor(this.stT * 6); const a = Math.atan2(p.cy - this.cy, p.cx - this.cx) + SS.rand(-0.25, 0.25); this.shot({ x: this.cx, y: this.cy - 6, vx: Math.cos(a) * 190, vy: Math.sin(a) * 190, look: "ball", col: this.form === 3 ? "#ffd23f" : "#2ee6d6", w: 8, h: 8 }); SS.audio.sfx("blip"); }
        if (this.stT <= 0) this.set("idle", 0.6);
      } else if (this.st === "beam") {
        if (!this.did) {
          this.did = true; this.face(); this.pose = "shout";
          const low = Math.random() < 0.5;
          const y = low ? this.floorY - 10 : this.floorY - 38;
          SS.ui.toast(low ? "¡Rayo bajo! ¡Salta!" : "¡Rayo alto! ¡Quédate en el piso!", 1.4);
          this.warn(this.ax0, y - 8, this.ax1 - this.ax0, 16, 1.1, () => { SS.audio.sfx("zap"); SS.shake = 5; this.shot({ x: (this.ax0 + this.ax1) / 2, y, vx: 0, vy: 0, look: "beam", col: "#2ee6d6", w: this.ax1 - this.ax0, h: 14, life: 0.5, ghost: true, pierce: true }); }, "#2ee6d6");
        }
        if (this.stT <= 0) this.set("idle", 0.7);
      }
    }
  }

  // ---------------- 7. LOS LUCHADORES ----------------
  class Luchador extends Boss {
    constructor(sc, B, o) { super(sc, B, Object.assign({ hp: 20 }, o)); this.outside = !!o.outside; }
    get partner() { return this.sc.bosses.find(b => b !== this); }
    hitbox() { return this.outside ? null : super.hitbox(); }
    think() {
      const p = this.target();
      this.pose = "idle";
      if (this.outside) {
        this.invuln = true; this.vx = 0;
        const edge = this.B.side === "L" ? this.ax0 : this.ax1 - this.w;
        this.x = SS.lerp(this.x, edge, 0.1);
        if (this.partner && this.partner.dead) { this.outside = false; this.invuln = false; this.set("walk", 0.5); }
        return;
      }
      this.invuln = false;
      if (this.st === "intro") { if (this.stT <= 0) this.set("walk", 1.5); return; }
      if (this.st === "walk") { this.face(); this.vx = this.dir * 70; if (this.stT <= 0) { this.vx = 0; this.did = false; this.set(SS.pick(["wrench", "grab", "tag"]), 1.5); } return; }
      if (this.st === "wrench") {
        if (!this.did) { this.did = true; this.face(); for (let i = 0; i < 2; i++) this.shot({ x: this.cx, y: this.y + 10, vx: this.dir * (140 + i * 60), vy: -200, g: 380, look: "wrench", w: 8, h: 8 }); SS.audio.sfx("throw"); }
        if (this.stT <= 0) this.set("walk", 1);
      } else if (this.st === "grab") {
        if (!this.did) { this.did = true; this.face(); this.warn(Math.min(this.cx, p.cx), this.y + 12, Math.abs(p.cx - this.cx) + 20, 24, 0.5, () => (this.vx = this.dir * 280)); }
        this.pose = Math.abs(this.vx) > 10 ? "punch" : "idle";
        if (this.stT <= 0) { this.vx = 0; this.set("walk", 1); }
      } else if (this.st === "tag") {
        const pt = this.partner;
        if (!pt || pt.dead) { this.set("walk", 1); return; }
        SS.ui.toast("¡RELEVO!", 1); SS.audio.sfx("swap");
        this.outside = true; this.B.side = this.x < (this.ax0 + this.ax1) / 2 ? "L" : "R";
        pt.outside = false; pt.gravity = true;
        const tx = SS.clamp(p.cx - 10, this.ax0, this.ax1 - 20);
        pt.x = tx; pt.y = this.floorY - 160; pt.vy = 0;
        this.warn(tx - 6, this.floorY - 6, 32, 6, 0.8, null);
        pt.set("drop", 1.2);
      } else if (this.st === "drop") {
        if (this.onGround && !this.did) { this.did = true; SS.shake = 7; SS.audio.sfx("crash"); for (const d of [-1, 1]) this.shot({ x: this.cx, y: this.floorY - 7, vx: d * 150, vy: 0, look: "ball", col: "#ffd23f", w: 12, h: 10, ghost: true, life: 1.6 }); }
        if (this.stT <= 0) { this.did = false; this.set("walk", 1); }
      }
    }
  }

  // ---------------- 8. TACOSAURIO REX ----------------
  class Tacosaurio extends Boss {
    constructor(sc, B, o) { super(sc, B, Object.assign({ name: "TACOSAURIO REX", hp: 50, w: 52, h: 42 }, o)); }
    think() {
      const p = this.target();
      if (this.st === "intro") { if (this.stT <= 0) this.set("walk", 1.8); return; }
      if (this.st === "walk") { this.face(); this.vx = this.dir * 40; if (this.stT <= 0) { this.vx = 0; this.did = false; this.set(SS.pick(["tortillas", "salsa", "roar"]), 1.6); } return; }
      if (this.st === "tortillas") {
        if (Math.floor(this.stT * 3) !== this.lastK && this.stT > 0.2) { this.lastK = Math.floor(this.stT * 3); this.face(); this.shot({ x: this.dir > 0 ? this.x + this.w : this.x, y: this.y + 12, vx: this.dir * 170, vy: -40, g: 60, look: "tortilla", w: 14, h: 6, ghost: true, life: 3 }); SS.audio.sfx("throw"); }
        if (this.stT <= 0) this.set("walk", 1.2);
      } else if (this.st === "salsa") {
        if (!this.did) { this.did = true; for (let i = 0; i < 3; i++) { const x = SS.clamp(p.cx + (i - 1) * 40, this.ax0 + 10, this.ax1 - 10); this.warn(x - 10, this.floorY - 8, 20, 8, 0.9, () => this.shot({ x, y: this.floorY - 4, vx: 0, vy: 0, look: "salsa", w: 20, h: 6, ghost: true, pierce: true, life: 2.5 })); } SS.ui.toast("¡Salsa del diablo!", 1); }
        if (this.stT <= 0) this.set("walk", 1.2);
      } else if (this.st === "roar") {
        if (!this.did) { this.did = true; SS.shake = 10; SS.audio.sfx("crash"); SS.ui.toast("¡GROOOOAAR!", 1); this.shot({ x: this.cx, y: this.floorY - 10, vx: 0, vy: 0, ring: true, grow: 140, look: "ring", col: "#ff7a1a", life: 1.6 }); }
        if (this.stT <= 0) this.set("walk", 1.4);
      }
    }
    drawBody(ctx, x, y) {
      x = Math.round(x); y = Math.round(y);
      const f = Math.floor(this.t * 6) % 2;
      ctx.save();
      if (this.dir > 0) { ctx.translate(x * 2 + this.w, 0); ctx.scale(-1, 1); }
      ctx.fillStyle = OUT; ctx.fillRect(x + 6, y + 10, 44, 24); ctx.fillRect(x - 2, y, 24, 18); ctx.fillRect(x + 44, y + 16, 14, 8);
      ctx.fillStyle = "#5aa84a"; ctx.fillRect(x + 7, y + 11, 42, 22); ctx.fillRect(x - 1, y + 1, 22, 16); ctx.fillRect(x + 45, y + 17, 12, 6);
      ctx.fillStyle = "#ffd23f"; ctx.fillRect(x + 12, y + 22, 30, 10); ctx.fillStyle = "#2ea84a"; ctx.fillRect(x + 14, y + 20, 26, 3); ctx.fillStyle = "#e83b3b"; ctx.fillRect(x + 18, y + 20, 4, 2); ctx.fillRect(x + 30, y + 20, 5, 2);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(x + 4, y + 4, 4, 4); ctx.fillStyle = OUT; ctx.fillRect(x + 5, y + 5, 2, 2);
      ctx.fillStyle = "#f4f4f4"; for (let i = 0; i < 5; i++) ctx.fillRect(x + 1 + i * 4, y + 13, 2, 3);
      ctx.fillStyle = OUT; ctx.fillRect(x + 14 + f * 4, y + 34, 6, 8); ctx.fillRect(x + 34 - f * 4, y + 34, 6, 8);
      ctx.fillStyle = "#3a7a2a"; for (let i = 0; i < 4; i++) ctx.fillRect(x + 16 + i * 8, y + 8, 4, 3);
      ctx.restore();
    }
  }

  // ---------------- 9. EL ALGORITMO ----------------
  class Algoritmo extends Boss {
    constructor(sc, B, o) { super(sc, B, Object.assign({ name: "EL ALGORITMO", hp: 38, w: 40, h: 36, gravity: false, noTouch: true }, o)); this.y = this.floorY - 96; this.baseY = this.y; this.low = 0; }
    think(dt) {
      const p = this.target();
      this.x += Math.sin(this.t * 0.8) * 40 * dt;
      // entre ataques baja a "cargar" recomendaciones: ahí se le puede pegar desde el piso
      this.low = SS.lerp(this.low, this.st === "idle" ? 50 : 0, Math.min(1, dt * 4));
      this.y = this.baseY + this.low + Math.sin(this.t * 1.7) * 8;
      if (this.st === "intro") { if (this.stT <= 0) this.set("idle", 1.6); return; }
      if (this.st === "idle") { if (this.stT <= 0) { this.did = false; this.set(SS.pick(["thumbs", "laser", "popups", "thumbs"]), 2); } return; }
      if (this.st === "thumbs") {
        if (!this.did) { this.did = true; SS.ui.toast("\"Te recomendamos…\"", 1.2); for (let i = 0; i < 5; i++) { const x = SS.rand(this.ax0 + 10, this.ax1 - 10); this.warn(x - 9, this.floorY - 150, 18, 150, 0.8 + i * 0.15, () => this.shot({ x, y: this.floorY - 160, vx: 0, vy: 260, look: "thumb", w: 16, h: 10, ghost: true, life: 1.2 }), "#ffd23f"); } }
        if (this.stT <= 0) this.set("idle", 1.6);
      } else if (this.st === "laser") {
        if (!this.did) { this.did = true; this.aim = { x: p.cx, y: p.cy }; this.warn(this.aim.x - 8, this.y + this.h, 16, this.floorY - this.y - this.h, 0.9, () => { SS.audio.sfx("zap"); this.shot({ x: this.aim.x, y: (this.y + this.h + this.floorY) / 2, vx: 0, vy: 0, look: "beam", col: "#ff2bd6", w: 14, h: this.floorY - this.y - this.h, life: 0.5, ghost: true, pierce: true }); }, "#ff2bd6"); }
        if (this.stT <= 0.6 && !this.did2) { this.did2 = true; }
        if (this.stT <= 0) { this.did2 = false; this.set("idle", 1.5); }
      } else if (this.st === "popups") {
        if (!this.did) { this.did = true; SS.ui.toast("¡Anuncio! Se salta en 5…", 1.2); for (let i = 0; i < 2; i++) { const e = new SS.Enemy("popup", this.cx + (i ? 30 : -30), this.y + 60, { air: 0 }); this.sc.enemies.push(e); } }
        if (this.stT <= 0) this.set("idle", 1);
      }
    }
    drawBody(ctx, x, y) {
      x = Math.round(x); y = Math.round(y);
      ctx.fillStyle = OUT; ctx.fillRect(x - 2, y - 2, this.w + 4, this.h + 4);
      ctx.fillStyle = "#2a3f9e"; ctx.fillRect(x, y, this.w, this.h); ctx.fillStyle = "#3b5bdb"; ctx.fillRect(x, y, this.w, 6);
      ctx.fillStyle = "#e83b3b"; ctx.fillRect(x + this.w - 7, y + 1, 6, 4);
      const p = this.target(); const ex = SS.clamp((p.cx - this.cx) / 40, -4, 4), ey = SS.clamp((p.cy - this.cy) / 40, -3, 3);
      ctx.fillStyle = "#f4f4f4"; ctx.fillRect(x + 8, y + 10, 24, 20); ctx.fillStyle = "#ff2bd6"; ctx.fillRect(x + 15 + ex, y + 15 + ey, 10, 10); ctx.fillStyle = OUT; ctx.fillRect(x + 18 + ex, y + 18 + ey, 4, 4);
      ctx.fillStyle = "#ffd23f"; for (let i = 0; i < 3; i++) ctx.fillRect(x - 6 - i * 4, y + 8 + i * 8 + Math.round(Math.sin(this.t * 4 + i) * 2), 3, 3);
    }
  }

  // ---------------- 10. SIMULATOR CERO ----------------
  class Cero extends Boss {
    constructor(sc, B, o) {
      super(sc, B, Object.assign({ name: "SIMULATOR CERO", hp: 100, w: 24, h: 24, phase: 1, barName: "SIMULATOR CERO" }, o));
      this.trail = [];
      this.y = this.floorY - this.h;
      this.mode = null; this.modeT = 0;
    }
    get phaseHp() { return [0, 80, 55, 30, 0][this.phase]; }
    onHurt() {
      if (this.hp <= this.phaseHp && this.phase < 4) {
        this.phase++; this.invuln = true; this.waiting = true; this.warns = []; this.sc.eshots = []; this.vx = this.vy = 0;
        this.sc.ceroPhase && this.sc.ceroPhase(this.phase, this);
      }
    }
    enterPhase(n) {
      this.invuln = false; this.waiting = false; this.st = "idle"; this.stT = 1;
      if (n === 2) { this.w = 20; this.h = 44; this.y = this.floorY - this.h; this.faceI = 0; }
      if (n === 4) { this.mode = null; this.modeT = 0; this.modeI = undefined; this.nextMode(); }
    }
    nextMode() {
      const modes = ["peleas", "clicker", "plataformas", "manejo", "escuela"];
      this.modeI = ((this.modeI === undefined ? -1 : this.modeI) + 1) % modes.length;
      this.mode = modes[this.modeI]; this.modeT = 11; this.st = "idle"; this.stT = 0.8; this.clicks = 0; this.backT = 0;
      SS.ui.card("MODO " + this.mode.toUpperCase(), ["Simulator de peleas", "Clicker tycoon: ¡dale clics al botón!", "Plataformas: el piso quema", "Manejo: esquiva el tráfico", "Escuela: pégale cuando no te vea"][this.modeI], 1.6);
      SS.audio.sfx("glitch"); SS.shake = 5;
      const lv = this.sc.level, fl = this.B.floor;
      lv.fill(this.B.x0 + 1, fl, this.B.x1 - 2, fl, "#");
      lv.fill(this.B.x0 + 1, fl - 4, this.B.x1 - 2, fl - 4, ".");
      if (this.mode === "plataformas") { lv.fill(this.B.x0 + 1, fl, this.B.x1 - 2, fl, "L"); for (let x = this.B.x0 + 2; x < this.B.x1 - 2; x += 4) lv.fill(x, fl - 3, x + 1, fl - 3, "="); this.sc.players.forEach(p => { if (p) { p.vy = -300; } }); }
    }
    die() {
      super.die();
      const lv = this.sc.level, fl = this.B.floor;
      lv.fill(this.B.x0 + 1, fl, this.B.x1 - 2, fl, "#");
      lv.fill(this.B.x0 + 1, fl - 4, this.B.x1 - 2, fl - 3, ".");
    }
    hitbox() {
      if (this.phase === 4 && this.mode === "clicker") return null;
      if (this.phase === 4 && this.mode === "escuela" && this.backT <= 0) return null;
      return super.hitbox();
    }
    think(dt, sc) {
      const p = this.target();
      if (this.waiting) { this.vx = 0; return; }
      if (this.st === "intro") { if (this.stT <= 0) this.set("idle", 0.5); return; }
      // fase 1: placeholder que copia tus movimientos con retraso. Ciclo fijo:
      // 3.5 s te sigue (invencible, no hace daño al tocar, dispara con aviso) y 2.5 s se traba (¡pégale!)
      if (this.phase === 1) {
        this.gravity = false;
        this.pauseT = (this.pauseT || 0) + dt;
        if (this.pauseT > 6) this.pauseT = 0;
        const following = this.pauseT < 3.5;
        if (!following && !this.saidPause) { this.saidPause = true; SS.ui.toast("Se trabó el placeholder: ¡pégale!", 1.2); SS.audio.sfx("glitch"); }
        if (following) this.saidPause = false;
        this.invuln = following; this.noTouch = true; // en esta fase solo lastiman las cajas
        this.trail.push({ x: p.x, y: p.y + p.h - this.h });
        if (this.trail.length > 55) { const q = this.trail.shift(); if (following) { this.x = SS.lerp(this.x, q.x, 0.15); this.y = SS.lerp(this.y, q.y, 0.15); } }
        // una caja a la vez: la franja amarilla avisa la altura y entra desde la pared más lejana (se salta)
        if (following && this.pauseT > 0.6 && this.pauseT < 3 && Math.floor(this.pauseT / 1.2) !== this.lastShot) {
          this.lastShot = Math.floor(this.pauseT / 1.2);
          const y = this.floorY - 9, fromL = p.cx > (this.ax0 + this.ax1) / 2;
          this.warn(this.ax0, y - 5, this.ax1 - this.ax0, 10, 0.7, () => this.shot({ x: fromL ? this.ax0 : this.ax1 - 10, y: y - 5, vx: fromL ? 150 : -150, vy: 0, look: "box", w: 10, h: 10, ghost: true, life: 3 }), "#ffd23f");
        }
        return;
      }
      // fase 2: se pone la cara de cada compa y usa sus ataques
      if (this.phase === 2) {
        this.gravity = true;
        const looks = ["cesarPro", "jesusPelon", "carlosCallado", "danielSonriente"];
        this.spec = SS.gfx.SPECS[looks[this.faceI % 4]];
        if (this.st === "idle") { this.face(); this.vx = this.dir * 60; if (this.stT <= 0) { this.vx = 0; this.did = false; this.set("atk", 1.4); } }
        else if (this.st === "atk") {
          if (!this.did) {
            this.did = true; this.face();
            const k = this.faceI % 4;
            if (k === 0) for (let i = 0; i < 3; i++) this.shot({ x: this.cx, y: this.y + 12, vx: this.dir * (90 + i * 50), vy: -220 + i * 30, g: 420, look: "correo", w: 10, h: 7 });
            if (k === 1) for (const d of [-1, 1]) this.shot({ x: this.cx, y: this.floorY - 7, vx: d * 170, vy: 0, look: "ball", col: "#c9c3dc", w: 12, h: 10, ghost: true, life: 2 });
            if (k === 2) this.shot({ x: this.cx, y: this.cy, vx: 0, vy: 0, ring: true, grow: 100, look: "ring", col: "#9ad0ff", life: 2.2, stunP: 0.4 });
            if (k === 3) for (let i = -2; i <= 2; i++) this.shot({ x: this.cx, y: this.y + 12, vx: this.dir * 150, vy: i * 50, look: "heart", w: 8, h: 6 });
            SS.audio.sfx("glitch");
          }
          if (this.stT <= 0) { this.faceI++; this.set("idle", 1.2); }
        }
        return;
      }
      // fase 3: pantalla azul. Le llueven ventanas de error en columnas marcadas antes de caer
      if (this.phase === 3) {
        this.gravity = false; this.spec = null;
        this.y = SS.lerp(this.y, this.floorY - 62 + Math.sin(this.t * 2) * 14, 0.05);
        this.x += Math.sin(this.t * 0.9) * 60 * dt;
        if (this.st === "idle" && this.stT <= 0) {
          this.set("idle", 2.2);
          // dos columnas de error: una donde estás y otra al azar
          for (const cx of [p.cx, SS.rand(this.ax0 + 12, this.ax1 - 12)]) {
            const x = SS.clamp(cx - 12, this.ax0, this.ax1 - 24);
            this.warn(x, this.floorY - 170, 24, 170, 0.9, () => { this.shot({ x: x + 5, y: this.floorY - 170, vx: 0, vy: 220, look: "error", w: 14, h: 10, ghost: true, life: 1.2 }); SS.audio.sfx("bonk"); }, "#6fb7ff");
          }
          // y un disparo apuntado, más lento
          const a = Math.atan2(p.cy - this.cy, p.cx - this.cx);
          this.shot({ x: this.cx, y: this.cy, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110, look: "error", w: 14, h: 10, ghost: true, life: 3 });
        }
        return;
      }
      // fase 4: SUPER SIMULATOR, el género cambia cada rato
      this.modeT -= dt;
      if (this.modeT <= 0) { this.nextMode(); return; }
      this.gravity = this.mode !== "plataformas" && this.mode !== "clicker";
      if (this.mode === "peleas") {
        this.spec = SS.gfx.SPECS.oozak;
        if (this.st === "idle") { this.face(); this.vx = this.dir * 110; if (Math.abs(p.cx - this.cx) < 30 || this.stT <= 0) { this.vx = 0; this.set("hit", 0.5); this.did = false; } }
        else if (this.st === "hit") { if (!this.did && this.stT < 0.3) { this.did = true; const box = { x: this.dir > 0 ? this.x + this.w : this.x - 26, y: this.y + 6, w: 26, h: 30 }; for (const pl of sc.players) if (pl && SS.overlap(box, pl)) pl.hurt(sc, this.cx); SS.audio.sfx("hit"); } if (this.stT <= 0) this.set("idle", 1.2); }
      } else if (this.mode === "clicker") {
        this.spec = null; this.vx = 0; this.y = SS.lerp(this.y, this.floorY - 110, 0.1);
        this.btn = { x: (this.ax0 + this.ax1) / 2 - 16, y: this.floorY - 14, w: 32, h: 14 };
        for (const pl of sc.players) if (pl && !pl.dead && Math.abs(pl.cx - (this.btn.x + 16)) < 24 && pl.onGround && (pl.inp.hit("attack") || pl.inp.hit("confirm"))) { this.clicks++; SS.audio.sfx("blip"); sc.fx.burst(this.btn.x + 16, this.btn.y, 3, ["#ffd23f"], 50, 100, 0.3); if (this.clicks >= 16) { this.clicks = 0; this.hp -= 6; this.flash = 0.2; SS.audio.sfx("crash"); SS.ui.toast("¡CRÍTICO! −6", 1); this.onHurt(); if (this.hp <= 0) this.die(); } }
        if (Math.floor(this.t * 1.5) !== this.lastShot) { this.lastShot = Math.floor(this.t * 1.5); this.shot({ x: SS.rand(this.ax0, this.ax1), y: this.floorY - 170, vx: 0, vy: 160, look: "error", w: 14, h: 10, ghost: true, life: 1.6 }); }
      } else if (this.mode === "plataformas") {
        this.spec = null; this.vx = Math.sin(this.t) * 80; this.y = SS.lerp(this.y, this.floorY - 100, 0.1);
        if (Math.floor(this.t * 1.3) !== this.lastShot) { this.lastShot = Math.floor(this.t * 1.3); const a = Math.atan2(p.cy - this.cy, p.cx - this.cx); this.shot({ x: this.cx, y: this.cy, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130, look: "box", w: 10, h: 10, ghost: true }); }
      } else if (this.mode === "manejo") {
        this.spec = SS.gfx.SPECS.oozak; this.vx = 0;
        if (Math.floor(this.t * 1.1) !== this.lastShot) {
          this.lastShot = Math.floor(this.t * 1.1);
          const fromL = Math.random() < 0.5, low = Math.random() < 0.6;
          const y = low ? this.floorY - 8 : this.floorY - 34, x = fromL ? this.ax0 : this.ax1;
          this.warn(this.ax0, y - 7, this.ax1 - this.ax0, 14, 0.6, () => this.shot({ x, y, vx: fromL ? 260 : -260, vy: 0, look: "box", w: 22, h: 12, ghost: true, life: 2 }), "#ffd23f");
        }
      } else if (this.mode === "escuela") {
        this.spec = SS.gfx.SPECS.profe; this.vx = 0;
        this.backT -= dt;
        if (this.st === "idle" && this.stT <= 0) { this.set("idle", 2.4); this.backT = 1.2; this.dir = -this.dir; SS.ui.toast(this.dir > 0 ? "Se volteó: ¡ahora!" : "", 0.6); }
        if (this.backT <= 0 && Math.floor(this.t * 2) !== this.lastShot) { this.lastShot = Math.floor(this.t * 2); this.face(); this.shot({ x: this.cx, y: this.y + 10, vx: this.dir * 170, vy: -60, g: 120, look: "reporte", w: 10, h: 8 }); }
      }
    }
    drawBody(ctx, x, y) {
      x = Math.round(x); y = Math.round(y);
      if (this.spec) {
        SS.gfx.drawPerson(ctx, this.spec, Math.abs(this.vx) > 5 ? "run" : "idle", Math.floor(this.t * 6) % 4, x - 6, y - 4, this.dir, undefined, 2);
        ctx.globalAlpha = 0.45; for (let r = 0; r < this.h; r += 6) for (let c = 0; c < this.w; c += 6) if (((r + c) / 6 + Math.floor(this.t * 4)) % 3 === 0) { ctx.fillStyle = "#ff2bd6"; ctx.fillRect(x + c, y + r, 6, 6); }
        ctx.globalAlpha = 1;
      } else {
        const s = Math.max(this.w, this.h);
        ctx.fillStyle = OUT; ctx.fillRect(x - 2, y - 2, this.w + 4, this.h + 4);
        for (let r = 0; r < this.h; r += 4) for (let c = 0; c < this.w; c += 4) { ctx.fillStyle = ((r + c) / 4 + Math.floor(this.t * 3)) % 2 ? "#ff2bd6" : "#1a0f2a"; ctx.fillRect(x + c, y + r, 4, 4); }
        ctx.fillStyle = "#ffffff"; ctx.fillRect(x + this.w * 0.25, y + this.h * 0.3, 4, 4); ctx.fillRect(x + this.w * 0.6, y + this.h * 0.3, 4, 4);
        if (this.phase === 3) { ctx.fillStyle = "#1f3fbf"; ctx.fillRect(x, y + this.h - 6, this.w, 6); ctx.fillStyle = "#fff"; ctx.font = '5px "Press Start 2P"'; ctx.textBaseline = "top"; ctx.fillText(":(", x + 2, y + this.h - 6); }
        void s;
      }
      if (this.phase === 4 && this.mode === "clicker" && this.btn) {
        const b = this.btn, cam = this.sc.cam, bx = Math.round(b.x - cam.x), by = Math.round(b.y - cam.y);
        ctx.fillStyle = OUT; ctx.fillRect(bx - 1, by - 1, b.w + 2, b.h + 2); ctx.fillStyle = Math.floor(this.t * 6) % 2 ? "#e83b3b" : "#ff4fa3"; ctx.fillRect(bx, by, b.w, b.h);
        ctx.fillStyle = "#fff"; ctx.font = '5px "Press Start 2P"'; ctx.textBaseline = "top"; ctx.fillText("CLIC", bx + 6, by + 4);
        ctx.fillStyle = "#3d3478"; ctx.fillRect(bx - 8, by - 10, b.w + 16, 4); ctx.fillStyle = "#ffd23f"; ctx.fillRect(bx - 8, by - 10, Math.round((b.w + 16) * this.clicks / 16), 4);
      }
    }
  }

  // ---------------- fábrica ----------------
  SS.makeBosses = (type, sc, B) => {
    switch (type) {
      case "cesarPro": return [new CesarPro(sc, B, {})];
      case "jesusPelon": return [new JesusPelon(sc, B, {})];
      case "carlosCallado": return [new CarlosCallado(sc, B, {})];
      case "danielSonriente": return [new DanielSonriente(sc, B, {})];
      case "villana": return [new Villana(sc, B, {})];
      case "senpai": return [new Senpai(sc, B, {})];
      case "luchadores": {
        const a = new Luchador(sc, B, { name: "EL HIJO DEL CASERO", barName: "LOS CASERO", spec: SS.gfx.SPECS.hijo });
        const b = new Luchador(sc, B, { name: "EL CASERO", spec: SS.gfx.SPECS.casero, outside: true, x: B.x0 * T + 20 });
        B.side = "L";
        return [a, b];
      }
      case "tacosaurio": return [new Tacosaurio(sc, B, {})];
      case "algoritmo": return [new Algoritmo(sc, B, {})];
      case "genericos": {
        const mid = (B.x0 + B.x1) / 2 * T;
        // de uno en uno: GameLevel saca al siguiente cuando cae el anterior
        sc.bossQueue = [() => new JesusPelon(sc, B, { x: mid, hp: 14 }), () => new CarlosCallado(sc, B, { x: mid, hp: 12 }), () => new DanielSonriente(sc, B, { x: mid, hp: 14 })];
        return [new CesarPro(sc, B, { x: mid, hp: 14 })];
      }
      case "cero": return [new Cero(sc, B, {})];
    }
    return [];
  };
})();
