// SUPER SIMULATOR · escenas de plataformas: la base compartida y el nivel genérico
(() => {
  "use strict";
  const T = SS.T, W = SS.W, H = SS.H;
  const say = SS.say, wait = SS.wait;
  const NEEDS = { F: ["kazoo", "Una reja: Kazoo la atraviesa con la Kazoonita"], B: ["jesus", "Pared agrietada: Jesús la rompe con su habilidad"], V: ["carlos", "Vidrio: el GRITO de Carlos lo rompe"], "~": ["jesus", "Agua: solo Jesús camina sobre ella"] };
  const OBJ_NEEDS = { terminal: ["cesar", "Una compu: César la puede hackear"], lever: ["cesar", "Palanca pesada: la Mano Derecha de César la jala"], sensor: ["carlos", "Sensor de ruido: necesita EL GRITO de Carlos"], switch: ["daniel", "Botón alto: Pancho lo pica (especial de Daniel)"], hook: ["daniel", "Gancho: Daniel se cuelga con las greñas"] };

  class Platform {
    constructor(level) {
      this.level = level;
      this.pausable = true;
      this.fx = new SS.Particles();
      this.players = []; this.enemies = []; this.shots = []; this.eshots = []; this.drops = []; this.blasts = []; this.bosses = [];
      this.cam = { x: 0, y: Math.max(0, level.h * T - H) };
      this.script = null; this.t = 0; this.flash = 0; this.learned = {}; this.arenaLock = null; this.hack = null;
    }
    get player() { return this.players[0]; }
    blocking() { return SS.ui.blocking() || !!this.script; }
    run(gen) { this.script = new SS.Script(gen); }
    addPlayer(x, y, idx = 0, char) {
      const p = new SS.Player(x, y, { idx, char: char || (idx === 0 ? SS.save.active : this.freeChar()) });
      if (!SS.save.party.includes(p.char)) p.setChar("kazoo");
      this.players[idx] = p;
      return p;
    }
    freeChar() { const used = this.players.map(p => p && p.char); return SS.save.party.find(c => !used.includes(c)) || "kazoo"; }
    joinP2() {
      if (this.players[1]) return;
      if (!SS.input.joinP2()) { SS.ui.toast("Conecta un segundo control para el jugador 2"); return; }
      const p1 = this.player;
      const p = this.addPlayer(p1.x - 14, p1.y + p1.h - 22, 1);
      p.inv = 1.5;
      SS.audio.sfx("confirm"); SS.ui.toast("¡Entró el jugador 2!");
    }
    leaveP2() { this.players.length = 1; SS.input.leaveP2(); SS.ui.toast("El jugador 2 salió"); }
    pauseItems() {
      const items = [];
      if (SS.save.party.length > 1) items.push(this.players[1] ? { label: "Jugador 2: salir", action: () => this.leaveP2() } : { label: "Jugador 2: entrar (con control)", action: () => this.joinP2() });
      return items.concat(this.extraPause ? this.extraPause() : []);
    }

    // ----- disparos y daño -----
    spawnShot(p, o) { this.shots.push(Object.assign({ w: 6, h: 6, owner: p, hits: new Set(), t: 0, x0: o.x }, o)); }
    enemyShot(o) { this.eshots.push(Object.assign({ w: 6, h: 6, g: 0, life: 4, dmg: 1, look: "bit" }, o)); }
    targets() {
      const list = this.enemies.slice();
      for (const b of this.bosses) { const hb = b.hitbox && b.hitbox(); if (hb && !b.dead) list.push({ x: hb.x, y: hb.y, w: hb.w, h: hb.h, boss: b, cx: hb.x + hb.w / 2 }); }
      return list;
    }
    hitTarget(t, dmg, knockDir, knock) {
      if (t.boss) { t.boss.damage(dmg, this); return; }
      t.damage(dmg, this);
      if (knock && !t.d.guard && t.d.ai !== "flyer") { t.vx = knockDir * knock; t.vy = -120; }
    }
    melee(p, box, dmg, knock) {
      for (const t of this.targets()) if (SS.overlap(box, t)) { this.hitTarget(t, dmg, p.facing, knock); this.fx.burst(t.cx, box.y + box.h / 2, 5, ["#ffffff", "#ffd23f"], 70, 100, 0.25); }
      for (const o of this.level.objects) if (o.kind === "switch" && !o.done && SS.overlap(box, { x: o.x, y: o.y - 2, w: 16, h: 14 }) && p.char === "daniel") this.activate(o, p);
    }
    scream(p, range, dmg, stun, big) {
      this.blasts.push({ x: p.cx + p.facing * 8, y: p.y + 8, t: 0, r: range, col: "#ff4fa3", cone: p.facing, big });
      for (const b of this.bosses) if (b.onKazoo && !b.dead) b.onKazoo(p, range, this);
      for (const t of this.targets()) {
        const dx = (t.cx - p.cx) * p.facing, dy = (t.y + t.h / 2) - p.cy;
        if (dx > -8 && dx < range && Math.abs(dy) < (big ? 60 : 30)) { this.hitTarget(t, dmg, p.facing, 120); if (!t.boss) t.stun = Math.max(t.stun, stun); }
      }
    }
    kazooBlast(p, r = 64, dur = 2.2) {
      SS.audio.sfx("kazoo");
      this.blasts.push({ x: p.cx + p.facing * 6, y: p.y + 8, t: 0, r, col: "#ffd23f" });
      for (const e of this.enemies) if (Math.hypot(e.cx - p.cx, e.y + e.h / 2 - p.cy) < r) e.stun = Math.max(e.stun, e.d.guard ? 3 : dur);
      for (const b of this.bosses) if (b.onKazoo && !b.dead) b.onKazoo(p, r, this);
      this.onKazoo && this.onKazoo(p);
    }
    damageBosses(p, n, x, range) { for (const b of this.bosses) { const hb = b.hitbox && b.hitbox(); if (hb && Math.abs(hb.x + hb.w / 2 - x) < range) b.damage(n, this); } }
    healParty(n) { for (const p of this.players) if (p && !p.dead) p.hearts = Math.min(SS.save.maxHearts, p.hearts + n); }
    dropCoins(x, y, n) { for (let i = 0; i < n; i++) this.drops.push({ x: x - 3, y, w: 6, h: 6, vx: SS.rand(-60, 60), vy: SS.rand(-200, -120), life: 8 }); }

    // ----- objetos -----
    findObj(p, kinds, range) {
      let best = null, bd = range;
      for (const o of this.level.objects) if (kinds.includes(o.kind)) { const d = Math.hypot(o.x + 8 - p.cx, (o.y - 10) - p.cy); if (d < bd) { bd = d; best = o; } }
      return best;
    }
    activate(o, p) {
      if (o.done) return;
      o.done = true;
      if (this.levelId) SS.save.got[`obj_${this.levelId}_${o.id}`] = true;
      for (const r of o.opens || []) { this.level.fill(r[0], r[1], r[2], r[3], ".", "base"); this.level.fill(r[0], r[1], r[2], r[3], ".", "over"); for (let tx = r[0]; tx <= r[2]; tx++) this.fx.burst(tx * T + 8, r[1] * T + 8, 6, ["#8a93a6", "#ffd23f"], 80, 200, 0.5); }
      for (const r of o.makes || []) this.level.fill(r[0], r[1], r[2], r[3], r[4] || "=", "base");
      SS.audio.sfx("door");
      SS.ui.toast(o.msg || "¡Se abrió algo!");
      this.onActivate && this.onActivate(o, p);
    }
    hackPc(o, p) { this.hack = { o, p, prog: 0, time: 6 }; p.frozen = true; SS.audio.sfx("confirm"); }

    // ----- vida y muerte -----
    respawnSafe(p) { p.x = p.lastSafe.x; p.y = p.lastSafe.y; p.vx = p.vy = 0; p.zip = null; p.inv = Math.max(p.inv, 1); }
    checkpointPos() { return null; }
    playerDie(p) {
      if (p.dead) return;
      p.dead = true;
      SS.audio.sfx("die");
      SS.save.deaths = (SS.save.deaths || 0) + 1;
      this.fx.burst(p.cx, p.cy, 24, ["#7b4dff", "#3b5bdb", "#ffd23f", "#ffffff"], 120, 200, 0.8, 3);
      if (p.idx === 1) { setTimeoutScene(this, 2, () => { const p1 = this.player; Object.assign(p, { x: p1.x, y: p1.y + p1.h - p.h, dead: false, hearts: SS.save.maxHearts, inv: 2, vx: 0, vy: 0 }); }); return; }
      const self = this;
      this.run(function* () {
        yield wait(1.3);
        SS.save.glitch += 8;
        if (self.onPlayerDied && self.onPlayerDied()) return;
        if (SS.save.glitch >= 100) { SS.go(() => SS.scenes.blue()); return; }
        const cp = self.checkpointPos();
        for (const pl of self.players) {
          Object.assign(pl, { x: cp.x, y: cp.y + 22 - pl.h, vx: 0, vy: 0, dead: false, hearts: SS.save.maxHearts, inv: 1.5, zip: null });
          pl.lastSafe = { x: pl.x, y: pl.y };
        }
        self.onRespawn && self.onRespawn();
      }());
    }
    caught(guard, p) {
      if (this.caughtT > 0 || p.dead || this.script) return;
      this.caughtT = 1.5; guard.alert = 1.5;
      SS.audio.sfx("hurt"); SS.ui.toast("¡TE VIERON! Regresas al último checkpoint");
      p.inv = 0; p.hurt(this, guard.cx);
      if (!p.dead) { const cp = this.checkpointPos(); p.x = cp.x; p.y = cp.y + 22 - p.h; p.vx = p.vy = 0; p.inv = 1.5; p.lastSafe = { x: p.x, y: p.y }; }
    }
    swapCharacter(p, dir, idx) {
      const party = SS.PARTY_ORDER.filter(c => SS.save.party.includes(c));
      if (party.length < 2) { SS.ui.toast("Todavía no recuperas a ningún compa"); SS.audio.sfx("bonk"); return; }
      const other = this.players.find(q => q && q !== p);
      const taken = other ? other.char : null;
      let next;
      if (idx !== undefined) { next = SS.PARTY_ORDER[idx]; if (!party.includes(next) || next === taken) { SS.audio.sfx("bonk"); return; } }
      else { let i = party.indexOf(p.char); for (let k = 0; k < party.length; k++) { i = (i + dir + party.length) % party.length; if (party[i] !== taken) break; } next = party[i]; }
      if (next === p.char) return;
      p.setChar(next);
      if (p.idx === 0) SS.save.active = next;
      SS.audio.sfx("swap");
      this.fx.burst(p.cx, p.cy, 14, ["#ffd23f", "#ffffff", "#ff2bd6"], 80, 0, 0.4);
      SS.ui.toast(SS.CHARS[next].name + ": " + SS.CHARS[next].labels.join(" · "), 2.2);
    }

    // ----- actualización -----
    updateCommon(dt) {
      this.t += dt;
      this.flash = Math.max(0, this.flash - dt * 2.5);
      this.caughtT = Math.max(0, (this.caughtT || 0) - dt);
      if (this.timers) { for (const tm of this.timers) if ((tm.t -= dt) <= 0) tm.fn(); this.timers = this.timers.filter(tm => tm.t > 0); }
      if (this.script) { this.script.update(dt); if (this.script && this.script.done) this.script = null; }
      const lv = this.level;
      for (const p of this.players) if (p) p.update(dt, this);
      // compañero 2 muy lejos: lo traemos
      const p1 = this.player, p2 = this.players[1];
      if (p2 && !p2.dead && !p1.dead && Math.abs(p2.cx - p1.cx) > W * 0.9) { p2.x = p1.x; p2.y = p1.y + p1.h - p2.h; p2.inv = 1; }
      if (this.arenaLock) for (const p of this.players) if (p) p.x = SS.clamp(p.x, this.arenaLock.x0, this.arenaLock.x1 - p.w);
      // en diálogos y escenas los enemigos y las balas se quedan congelados
      const frozen = this.blocking();
      if (!frozen) for (const e of this.enemies) e.update(dt, this);
      this.enemies = this.enemies.filter(e => !e.dead);
      for (const b of this.bosses) if (!b.dead || b.deathT > 0) b.update(dt, this);
      if (!frozen) this.updateShots(dt);
      for (const d of this.drops) {
        const vyBefore = d.vy;
        d.vy = Math.min(d.vy + 600 * dt, 400); d.vx *= 0.99;
        SS.collide(lv, d, dt);
        if (d.onGround && vyBefore > 90) d.vy = -vyBefore * 0.45;
        d.life -= dt;
        for (const p of this.players) if (p && SS.overlap(d, p)) { d.life = 0; SS.save.feria++; SS.audio.sfx("coin"); break; }
      }
      this.drops = this.drops.filter(d => d.life > 0);
      for (const b of this.blasts) b.t += dt;
      this.blasts = this.blasts.filter(b => b.t < 0.5);
      this.fx.update(dt);
      if (this.hack) this.updateHack(dt);
      this.updateCamera(dt);
      const p = this.player, D = p.def;
      SS.ui.setHud({ hearts: p.hearts, hearts2: p2 ? p2.hearts : null, char: p.char, cd: { attack: p.cd.attack / D.cd.attack, special: p.cd.special / D.cd.special, ability: p.cd.ability / D.cd.ability }, gk: this.gkLabel ? this.gkLabel() : null, todos: this.todoLabel ? this.todoLabel() : null });
      if (SS.save.glitch >= 100 && !this.script && !SS.trans) { SS.go(() => SS.scenes.blue()); }
    }
    updateShots(dt) {
      const lv = this.level;
      for (const s of this.shots) {
        s.t += dt; s.life -= dt;
        if (s.kind === "pancho") {
          // Pancho busca solo el botón más cercano; si no hay, vuela en arco
          let target = null, bd = 190;
          for (const o of lv.objects) if (o.kind === "switch" && !o.done) { const d = Math.hypot(o.x + 8 - s.x, o.y + 4 - s.y); if (d < bd) { bd = d; target = o; } }
          if (target) { const dx = target.x + 8 - s.x, dy = target.y + 4 - s.y, d = Math.hypot(dx, dy) || 1; s.vx = dx / d * 240; s.vy = dy / d * 240; }
          else s.vy += (s.t < 0.5 ? 120 : -60) * dt;
        }
        else s.vy += (s.g || 0) * dt;
        if (s.back && s.t > s.life * 0.5 + 0.05 && !s.returning) { s.returning = true; }
        if (s.returning && s.owner) { const dx = s.owner.cx - s.x, dy = s.owner.cy - s.y, d = Math.hypot(dx, dy) || 1; s.vx = dx / d * 300; s.vy = dy / d * 300; if (d < 10) s.life = 0; }
        s.x += s.vx * dt; s.y += s.vy * dt;
        const box = { x: s.x, y: s.y, w: s.w, h: s.h };
        if (s.kind !== "pancho" && s.kind !== "chancla" && lv.solidAt(Math.floor((s.x + 3) / T), Math.floor((s.y + 3) / T))) {
          s.life = 0; this.fx.burst(s.x + 3, s.y + 3, 6, ["#c79a6a", "#e8d7a8"], 60, 300, 0.4); continue;
        }
        if (s.kind === "pancho") for (const o of lv.objects) if (o.kind === "switch" && !o.done && SS.overlap(box, { x: o.x - 2, y: o.y - 6, w: 20, h: 20 })) this.activate(o, s.owner);
        for (const t of this.targets()) {
          if (!SS.overlap(box, t) || s.hits.has(t.boss || t)) continue;
          s.hits.add(t.boss || t);
          this.hitTarget(t, s.dmg, Math.sign(s.vx) || 1, 60);
          this.fx.burst(s.x + 3, s.y + 3, 5, ["#ffffff", "#ffd23f"], 60, 200, 0.3);
          if (!s.pierce) { s.life = 0; break; }
        }
        if (s.life > 0 && this.onShot) this.onShot(s, box);
      }
      this.shots = this.shots.filter(s => s.life > 0);
      for (const s of this.eshots) {
        s.vy += s.g * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
        if (s.ring) { s.r = (s.r || 4) + s.grow * dt; }
        const box = s.ring ? null : { x: s.x - s.w / 2, y: s.y - s.h / 2, w: s.w, h: s.h };
        if (!s.ring && !s.ghost && lv.solidAt(Math.floor(s.x / T), Math.floor(s.y / T))) { s.life = 0; continue; }
        for (const p of this.players) {
          if (!p || p.dead) continue;
          let hit = false;
          if (s.ring) { const d = Math.hypot(p.cx - s.x, p.cy - s.y); hit = Math.abs(d - s.r) < 7; }
          else hit = SS.overlap(box, p);
          if (hit) { p.hurt(this, s.x, s.dmg); if (s.stunP) p.hurtT = s.stunP; if (!s.ring && !s.pierce) s.life = 0; }
        }
      }
      this.eshots = this.eshots.filter(s => s.life > 0 && s.y < lv.h * T + 40 && s.x > -40 && s.x < lv.w * T + 40);
    }
    updateHack(dt) {
      const h = this.hack, I = h.p.inp;
      h.time -= dt; h.prog = Math.max(0, h.prog - dt * 0.18);
      if (I.hit("attack") || I.hit("confirm")) { h.prog += 0.075; SS.audio.sfx("blip"); }
      if (h.prog >= 1) { h.p.frozen = false; this.hack = null; SS.audio.sfx("jingle"); this.activate(h.o, h.p); }
      else if (h.time <= 0) { h.p.frozen = false; this.hack = null; SS.audio.sfx("bonk"); SS.ui.toast("Se trabó la compu. Intenta otra vez"); }
    }
    updateCamera(dt) {
      const lv = this.level;
      const ps = this.players.filter(p => p && !p.dead);
      const base = ps.length ? ps : [this.player];
      let tx = base.reduce((s, p) => s + p.cx, 0) / base.length - W / 2 + (base.length === 1 ? base[0].facing * 28 : 0);
      let ty = base.reduce((s, p) => s + p.cy, 0) / base.length - H / 2 - 6;
      let minX = 0, maxX = lv.w * T - W;
      if (this.arenaLock) { minX = this.arenaLock.x0; maxX = Math.max(minX, this.arenaLock.x1 - W); }
      tx = SS.clamp(tx, minX, maxX); ty = SS.clamp(ty, 0, Math.max(0, lv.h * T - H));
      this.cam.x = SS.clamp(SS.lerp(this.cam.x, tx, Math.min(1, dt * 6)), minX, maxX);
      this.cam.y = SS.clamp(SS.lerp(this.cam.y, ty, Math.min(1, dt * 6)), 0, Math.max(0, lv.h * T - H));
    }
    interact(list) {
      const p = this.player;
      let near = null;
      if (!this.blocking() && p.onGround && !p.dead) for (const it of list) if (Math.abs(p.cx - it.x) < (it.r || 14) && Math.abs(p.cy - (it.y !== undefined ? it.y : p.cy)) < 30) { near = it; break; }
      if (near) { SS.ui.prompt("{up} " + near.label); if (p.inp.hit("up")) { SS.ui.prompt(null); near.act(); } }
      else SS.ui.prompt(null);
    }
    gateHint() {
      const p = this.player, lv = this.level, party = SS.save.party;
      const msg = (need, text) => party.includes(need) ? (p.char === need ? null : text + " (cambia de compa con {swap})") : text + " · todavía no tienes a ese compa";
      for (const o of lv.objects) { const n = OBJ_NEEDS[o.kind]; if (n && !o.done && Math.abs(o.x + 8 - p.cx) < 56 && Math.abs(o.y - 12 - p.cy) < 80) { const m = msg(n[0], n[1]); if (m) return m; } }
      let found = null;
      SS.tilesUnder(lv, p.cx - 40, p.y - 20, 80, p.h + 40, c => { if (NEEDS[c] && !(c === "F" && !lv.glitch && lv.over && false)) { found = c; return true; } return false; });
      if (found) { const n = NEEDS[found]; if (found === "F" && !SS.save.flags.stone) return null; return msg(n[0], n[1]); }
      return null;
    }

    // ----- dibujo -----
    drawObjects(ctx) {
      const cam = this.cam;
      for (const o of this.level.objects) { const x = o.x - cam.x; if (x > -40 && x < W + 40) SS.gfx.object(ctx, o, x, o.y - cam.y, this.t); }
    }
    drawCommon(ctx) {
      const cam = this.cam;
      for (const d of this.drops) { if (d.life < 2 && Math.floor(d.life * 10) % 2) continue; ctx.drawImage(SS.gfx.icon("coin"), Math.round(d.x - cam.x - 1), Math.round(d.y - cam.y - 1)); }
      for (const e of this.enemies) if (e.x + e.w > cam.x - 140 && e.x < cam.x + W + 140) e.draw(ctx, cam);
      for (const b of this.bosses) if (!b.dead || b.deathT > 0) b.draw(ctx, cam);
      for (const s of this.shots) drawShot(ctx, s, cam, this.t);
      for (const s of this.eshots) drawEShot(ctx, s, cam, this.t);
      for (const p of this.players) {
        if (!p || p.dead) continue;
        const s = this.charScale || 1;
        if (s === 1) { p.draw(ctx, cam); continue; }
        // escala desde los pies (la Kazoovan dibuja a los compas más grandes)
        const fx = Math.round(p.cx - cam.x), fy = Math.round(p.y + p.h - cam.y);
        ctx.save(); ctx.translate(fx, fy); ctx.scale(s, s); ctx.translate(-fx, -fy); p.draw(ctx, cam); ctx.restore();
      }
      for (const b of this.blasts) {
        const r = 8 + b.t * (b.r || 64) * 1.8, x = b.x - cam.x, y = b.y - cam.y;
        ctx.globalAlpha = Math.max(0, 1 - b.t * 2);
        ctx.strokeStyle = b.col || "#ffd23f"; ctx.lineWidth = b.big ? 3 : 2;
        ctx.beginPath();
        if (b.cone) ctx.arc(Math.round(x), Math.round(y), r, b.cone > 0 ? -0.7 : Math.PI - 0.7, b.cone > 0 ? 0.7 : Math.PI + 0.7);
        else ctx.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2);
        ctx.stroke();
        if (!b.cone) { ctx.fillStyle = b.col; for (let i = 0; i < 6; i++) { const a = i * 1.047 + b.t * 3; const nx = Math.round(x + Math.cos(a) * r * 0.8), ny = Math.round(y + Math.sin(a) * r * 0.8); ctx.fillRect(nx, ny, 2, 4); ctx.fillRect(nx + 2, ny, 2, 1); ctx.fillRect(nx - 2, ny + 3, 3, 2); } }
        ctx.globalAlpha = 1;
      }
      this.fx.draw(ctx, cam);
      if (this.hack) {
        const h = this.hack;
        ctx.fillStyle = "rgba(7,5,26,.85)"; ctx.fillRect(W / 2 - 90, 60, 180, 46);
        ctx.fillStyle = "#3d3478"; ctx.fillRect(W / 2 - 80, 84, 160, 8); ctx.fillStyle = "#2ee6a0"; ctx.fillRect(W / 2 - 80, 84, Math.round(160 * Math.min(1, h.prog)), 8);
        ctx.fillStyle = "#f3efff"; ctx.font = '6px "Press Start 2P"'; ctx.textBaseline = "top";
        ctx.fillText("HACKEANDO... ¡DALE CLICS!", W / 2 - 74, 68); ctx.fillText(Math.ceil(h.time) + "s", W / 2 + 64, 96);
      }
      if (this.flash > 0) { ctx.globalAlpha = Math.min(1, this.flash); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    }
  }
  function setTimeoutScene(sc, t, fn) { (sc.timers = sc.timers || []).push({ t, fn }); }
  SS.Platform = Platform;

  function drawShot(ctx, s, cam, t) {
    const x = Math.round(s.x - cam.x), y = Math.round(s.y - cam.y);
    switch (s.kind) {
      case "box": ctx.fillStyle = "#120f1c"; ctx.fillRect(x - 1, y - 1, 8, 8); ctx.fillStyle = "#c79a6a"; ctx.fillRect(x, y, 6, 6); ctx.fillStyle = "#e8d7a8"; ctx.fillRect(x + 2, y, 2, 6); break;
      case "cursor": ctx.drawImage(SS.gfx.icon("cursor"), x - 2, y - 3); break;
      case "cube": ctx.drawImage(SS.gfx.icon("cube"), x - 3, y - 3); break;
      case "chancla": ctx.save(); ctx.translate(x + 3, y + 3); ctx.rotate(t * 20); ctx.drawImage(SS.gfx.icon("chancla"), -6, -6); ctx.restore(); break;
      case "pancho": SS.gfx.parrot(ctx, x - 5, y - 5, Math.floor(t * 12), s.vx > 0 ? 1 : -1); break;
    }
  }
  function drawEShot(ctx, s, cam, t) {
    const x = Math.round(s.x - cam.x), y = Math.round(s.y - cam.y);
    const O = "#120f1c";
    switch (s.look) {
      case "ring": ctx.strokeStyle = s.col || "#9ad0ff"; ctx.lineWidth = 2; ctx.globalAlpha = Math.min(1, s.life); ctx.beginPath(); ctx.arc(x, y, Math.max(1, s.r), 0, 7); ctx.stroke(); ctx.globalAlpha = 1; break;
      case "correo": SS.gfx.critter(ctx, "correo", x - 5, y - 3, t, s.vx > 0 ? 1 : -1); break;
      case "reporte": ctx.fillStyle = O; ctx.fillRect(x - 5, y - 4, 10, 8); ctx.fillStyle = "#f4f4f4"; ctx.fillRect(x - 4, y - 3, 8, 6); ctx.fillStyle = "#e83b3b"; ctx.fillRect(x - 3, y - 2, 6, 1); break;
      case "rosa": ctx.fillStyle = O; ctx.fillRect(x - 4, y - 4, 8, 8); ctx.fillStyle = "#e83b3b"; ctx.fillRect(x - 3, y - 3, 6, 5); ctx.fillStyle = "#2ea84a"; ctx.fillRect(x - 1, y + 2, 2, 3); break;
      case "ball": ctx.fillStyle = s.col || "#2ee6d6"; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); ctx.fillStyle = "#ffffff"; ctx.fillRect(x - 1, y - 2, 2, 2); break;
      case "tortilla": ctx.fillStyle = O; ctx.fillRect(x - 7, y - 3, 14, 6); ctx.fillStyle = "#ffd88a"; ctx.fillRect(x - 6, y - 2, 12, 4); ctx.fillStyle = "#c79a4a"; ctx.fillRect(x - 3, y - 1, 2, 1); ctx.fillRect(x + 2, y, 2, 1); break;
      case "heart": ctx.fillStyle = "#ff4fa3"; ctx.fillRect(x - 4, y - 3, 3, 3); ctx.fillRect(x + 1, y - 3, 3, 3); ctx.fillRect(x - 4, y - 1, 8, 2); ctx.fillRect(x - 2, y + 1, 4, 2); break;
      case "wrench": ctx.save(); ctx.translate(x, y); ctx.rotate(t * 15); ctx.fillStyle = "#9aa3b5"; ctx.fillRect(-1, -6, 3, 12); ctx.fillRect(-3, -7, 7, 3); ctx.restore(); break;
      case "error": ctx.fillStyle = O; ctx.fillRect(x - 8, y - 6, 16, 12); ctx.fillStyle = "#1f3fbf"; ctx.fillRect(x - 7, y - 5, 14, 10); ctx.fillStyle = "#ffffff"; ctx.fillRect(x - 5, y - 3, 3, 1); ctx.fillRect(x - 5, y, 9, 1); break;
      case "thumb": ctx.fillStyle = O; ctx.fillRect(x - 9, y - 6, 18, 12); ctx.fillStyle = ["#e83b3b", "#ffd23f", "#2ee6d6"][Math.floor(s.x) % 3]; ctx.fillRect(x - 8, y - 5, 16, 10); ctx.fillStyle = "#ffffff"; ctx.fillRect(x - 2, y - 2, 3, 4); break;
      case "beam": ctx.fillStyle = s.col || "#2ee6d6"; ctx.globalAlpha = 0.85; ctx.fillRect(x - s.w / 2, y - s.h / 2, s.w, s.h); ctx.globalAlpha = 1; ctx.fillStyle = "#ffffff"; ctx.fillRect(x - s.w / 2, y - 1, s.w, 2); break;
      case "rock": ctx.fillStyle = O; ctx.fillRect(x - 6, y - 6, 12, 12); ctx.fillStyle = "#8a7a6a"; ctx.fillRect(x - 5, y - 5, 10, 10); ctx.fillStyle = "#ff7a1a"; ctx.fillRect(x - 3, y + 2, 6, 2); break;
      case "salsa": ctx.fillStyle = "#c0301a"; ctx.fillRect(x - 4, y - 4, 8, 8); ctx.fillStyle = "#ff7a1a"; ctx.fillRect(x - 2, y - 3, 3, 2); break;
      case "box": ctx.fillStyle = O; ctx.fillRect(x - 5, y - 5, 10, 10); ctx.fillStyle = "#c79a6a"; ctx.fillRect(x - 4, y - 4, 8, 8); ctx.fillStyle = "#ff2bd6"; ctx.fillRect(x - 1, y - 4, 2, 8); break;
      default: ctx.fillStyle = O; ctx.fillRect(x - 4, y - 4, 8, 8); ctx.fillStyle = s.col || "#2ee6d6"; ctx.fillRect(x - 3, y - 3, 6, 6);
    }
  }

  // ======================================================================
  // NIVEL GENÉRICO (todas las dimensiones después del prólogo)
  // ======================================================================
  class GameLevel extends Platform {
    constructor(id, opts = {}) {
      const def = SS.LEVELS[id];
      const lv = def.build();
      super(lv);
      this.levelId = id; this.def = def; this.free = !!opts.free;
      // objetos ya resueltos
      lv.objects.forEach((o, i) => { if (o.id === undefined) o.id = i; if (SS.save.got[`obj_${id}_${o.id}`]) { o.done = true; for (const r of o.opens || []) { lv.fill(r[0], r[1], r[2], r[3], ".", "base"); lv.fill(r[0], r[1], r[2], r[3], ".", "over"); } for (const r of o.makes || []) lv.fill(r[0], r[1], r[2], r[3], r[4] || "=", "base"); } });
      lv.items.forEach((it, i) => { if (!it.id) it.id = `${it.kind}_${id}_${i}`; it.px = (it.x + 0.5) * T; it.py = (it.y + 0.5) * T; });
      const run = SS.save.run;
      const cp = !this.free && run && run.id === id && run.cp ? run.cp : null;
      const sx = cp ? cp.x : (def.start ? def.start[0] * T : 2 * T), sy = cp ? cp.y : (def.start ? def.start[1] * T - 22 : (lv.h - 3) * T - 22);
      this.startPos = { x: sx, y: sy };
      this.addPlayer(sx, sy, 0);
      if (lv.boss && this.free) lv.boss.skip = true;
      for (const o of lv.objects) if (o.kind === "save" && cp && Math.abs(o.x - cp.x) < 4) o.lit = true;
      this.enemies = lv.spawns.map(s => new SS.Enemy(s[0], s[1] * T + 3, s[2] !== undefined ? s[2] * T : (lv.h - 3) * T, s[3] || {}));
      this.cam.x = SS.clamp(sx - W / 2, 0, lv.w * T - W);
      this.cam.y = SS.clamp(sy - H / 2, 0, Math.max(0, lv.h * T - H));
      this.bossDone = false;
      this.firstVisit = !this.free && !(run && run.id === id && run.seen);
    }
    enter() {
      SS.ui.showHud(true); SS.ui.resetHud();
      SS.audio.music(this.def.music || "culiacan");
      SS.save.run = Object.assign(SS.save.run && SS.save.run.id === this.levelId ? SS.save.run : { id: this.levelId }, { free: this.free });
      SS.ui.card(this.def.title, this.def.dim, 2.4);
      const self = this;
      if (this.firstVisit && this.def.intro) this.run(function* () { yield wait(2.2); yield say(self.def.intro); SS.save.run.seen = true; SS.writeSave(); }());
      else SS.save.run.seen = true;
      if (this.free) this.freeHintT = 5;
      this.def.enter && this.def.enter(this);
    }
    checkpointPos() { const r = SS.save.run; return r && r.id === this.levelId && r.cp ? r.cp : this.startPos; }
    gkLabel() { const all = this.level.items.filter(i => i.kind === "gk"); return all.length ? all.filter(i => SS.save.got[i.id]).length + "/" + all.length : null; }
    todoLabel() { const all = this.level.items.filter(i => i.kind === "todo"); return all.length ? "TODO " + SS.countGot("todo_") + "/30" : null; }
    extraPause() { return this.free ? [{ label: "Regresar a la Kazoovan", action: () => { SS.writeSave(); SS.go(() => SS.scenes.van({})); } }] : [{ label: "Reiniciar desde el checkpoint", action: () => { const p = this.player; p.hearts = 0; this.playerDie(p); } }]; }
    onPlayerDied() { return this.def.onPlayerDied ? this.def.onPlayerDied(this) : false; }
    onRespawn() {
      if (this.def.respawnEnemies !== false) this.enemies = this.level.spawns.map(s => new SS.Enemy(s[0], s[1] * T + 3, s[2] !== undefined ? s[2] * T : (this.level.h - 3) * T, s[3] || {}));
      if (this.arenaLock && this.arenaLock.arena) { const a = this.arenaLock.arena; a.active = false; a.wave = 0; this.arenaLock = null; }
      if (this.bossActive && !this.bossDone) { this.bosses = []; this.bossActive = false; this.arenaLock = null; this.level.boss.started = false; SS.ui.bossBar(null); SS.audio.music(this.def.music); }
      this.def.onRespawn && this.def.onRespawn(this);
    }
    onEnemyDead() {}
    startBoss() {
      const lv = this.level, B = lv.boss, self = this;
      B.started = true; this.bossActive = true;
      this.arenaLock = { x0: B.x0 * T, x1: B.x1 * T };
      this.def.onBossStart && this.def.onBossStart(this);
      this.run(function* () {
        yield wait(0.5);
        if (self.def.bossIntro && !SS.save.run.bossSeen) yield say(self.def.bossIntro);
        SS.save.run.bossSeen = true;
        SS.audio.music(self.def.bossMusic || "boss");
        self.bosses = SS.makeBosses(B.type, self, B);
        SS.ui.card(self.bosses[0].title || self.bosses[0].name, "JEFE", 1.6);
      }());
    }
    finishBoss() {
      const self = this;
      this.bossDone = true; this.bossActive = false;
      SS.ui.bossBar(null);
      SS.audio.music(this.def.music);
      this.arenaLock = null;
      this.run(function* () {
        yield wait(1.2);
        if (self.def.bossOutro) yield say(typeof self.def.bossOutro === "function" ? self.def.bossOutro() : self.def.bossOutro);
        self.def.afterBoss && self.def.afterBoss(self);
        if (self.def.endAtBoss !== false) self.complete();
      }());
    }
    complete() {
      if (this.completed) return;
      this.completed = true;
      SS.completeLevel(this.levelId, this.free, this);
    }
    interactables() {
      const list = [];
      for (const o of this.level.objects) {
        if (o.kind === "npc" || o.kind === "dog") list.push({ x: o.x + 8, y: o.y - 12, r: 18, label: o.label || "Hablar", act: () => this.talkTo(o) });
        if (o.kind === "pc" && !o.done) list.push({ x: o.x + 10, y: o.y - 12, r: 18, label: "Hackear la compu", act: () => this.hackPc(o, this.player) });
        if (o.kind === "exit" && (this.free || !this.level.boss || this.bossDone || this.level.boss.skip)) list.push({ x: o.x + 12, y: o.y - 20, r: 18, label: this.free ? "Regresar a la Kazoovan" : "Seguir", act: () => this.complete() });
      }
      return list.concat(this.def.interactables ? this.def.interactables(this) : []);
    }
    talkTo(o) {
      const p = this.player, self = this;
      if (o.mission && p.char === o.mission && !SS.save.missions[o.mission]) {
        this.run(function* () {
          yield say(SS.TEXT.missions[o.mission]);
          SS.save.missions[o.mission] = true; SS.addBond(o.mission, 1); SS.writeSave();
          SS.audio.sfx("gold"); SS.ui.toast("Misión de recuerdo completada · +1 Recuerdo");
        }());
        return;
      }
      const lines = o.mission && SS.save.missions[o.mission] ? (o.after || o.lines) : (o.mission && p.char !== o.mission ? (o.needLines || o.lines) : o.lines);
      this.run(function* () { yield say(lines); }());
    }
    update(dt) {
      this.updateCommon(dt);
      const lv = this.level, p = this.player;
      SS.save.time += dt;
      this.freeHintT = Math.max(0, (this.freeHintT || 0) - dt);
      if (lv.zones) { const cx = this.cam.x + W / 2; for (const z of lv.zones) if (cx >= z[0] * T) lv.theme = z[1]; }
      // objetos
      for (const it of lv.items) {
        if (SS.save.got[it.id]) continue;
        for (const pl of this.players) {
          if (!pl || pl.dead) continue;
          if (Math.abs(pl.cx - it.px) < 10 && Math.abs(pl.cy - it.py) < 16) { this.collect(it, pl); break; }
        }
      }
      // checkpoints
      for (const o of lv.objects) if (o.kind === "save" && !o.lit && Math.abs(p.cx - (o.x + 8)) < 14 && Math.abs(p.y + p.h - o.y) < 30) {
        for (const q of lv.objects) if (q.kind === "save") q.lit = false;
        o.lit = true;
        SS.save.run = Object.assign(SS.save.run || { id: this.levelId }, { id: this.levelId, cp: { x: o.x, y: o.y - 22 } });
        SS.writeSave(); SS.audio.sfx("confirm"); SS.ui.toast("Checkpoint guardado");
      }
      // arenas con oleadas
      for (const a of lv.arenas) {
        if (a.done || this.blocking()) continue;
        if (!a.active && p.cx > a.x0 * T + 40 && p.cx < a.x1 * T) {
          if (this.free && a.optional) continue;
          a.active = true; a.wave = 0; this.arenaLock = { x0: a.x0 * T, x1: a.x1 * T, arena: a };
          SS.audio.sfx("glitch"); SS.ui.toast(a.msg || "¡Pelea! Acaba con todos para seguir");
          this.spawnWave(a);
        } else if (a.active && this.enemies.filter(e => e.arena === a).length === 0) {
          a.wave++;
          if (a.wave >= a.waves.length) { a.done = true; a.active = false; this.arenaLock = null; SS.audio.sfx("jingle"); SS.ui.toast("¡Listo! Sigue adelante"); }
          else this.spawnWave(a);
        }
      }
      // jefe
      const B = lv.boss;
      if (B && !B.skip && !B.started && !this.bossDone && (B.atY !== undefined ? p.y + p.h < B.atY * T : p.cx > B.at * T) && !this.blocking()) this.startBoss();
      if (this.bossActive && this.bosses.length && this.bosses.every(b => b.dead && !(b.deathT > 0))) {
        if (this.bossQueue && this.bossQueue.length) { this.bosses = [this.bossQueue.shift()()]; SS.ui.card(this.bosses[0].title || this.bosses[0].name, "JEFE", 1.6); }
        else this.finishBoss();
      }
      if (this.bossActive && this.bosses.length) { const alive = this.bosses.filter(b => !b.dead); const hp = alive.reduce((s, b) => s + Math.max(0, b.hp), 0), max = this.bosses.reduce((s, b) => s + b.maxHp, 0); SS.ui.bossBar(this.bosses[0].barName || this.bosses[0].name, hp / max); }
      this.def.update && this.def.update(this, dt);
      this.interact(this.interactables());
      if (this.blocking()) SS.ui.hint(null);
      else SS.ui.hint((this.def.hints && this.def.hints(this)) || this.gateHint() || (this.freeHintT > 0 ? "Juego libre: usa a todo el equipo para encontrar lo que te faltó" : null));
    }
    spawnWave(a) {
      const lv = this.level;
      for (const [type, side, air] of a.waves[a.wave]) {
        const x = side === "L" ? a.x0 * T + 20 : side === "R" ? a.x1 * T - 30 : (a.x0 * T + a.x1 * T) / 2 + SS.rand(-60, 60);
        const e = new SS.Enemy(type, x, a.y !== undefined ? a.y * T : (lv.h - 3) * T, { air: air || 40 });
        e.arena = a; e.dir = side === "L" ? 1 : -1;
        this.enemies.push(e);
        this.fx.burst(e.cx, e.y + e.h / 2, 10, ["#ff2bd6", "#ffffff"], 60, 0, 0.4);
      }
    }
    collect(it, p) {
      SS.save.got[it.id] = true;
      const fx = (cols) => this.fx.burst(it.px, it.py, 18, cols, 90, 100, 0.7);
      switch (it.kind) {
        case "coin": SS.save.feria++; SS.audio.sfx("coin"); break;
        case "roll": p.hearts = Math.min(SS.save.maxHearts, p.hearts + 1); SS.audio.sfx("buy"); SS.ui.toast("Rollo de papel: +1 vida"); break;
        case "gk": SS.audio.sfx("gold"); fx(["#ffd23f", "#fff3b0"]); SS.ui.toast(`Kazoo Dorado ${this.gkLabel()}`); break;
        case "photo": SS.audio.sfx("gold"); fx(["#ffffff", "#6fb7ff"]); SS.ui.toast(`Foto del grupo ${SS.countGot("photo")}/20: ${it.name || "una foto"}`, 2.6); break;
        case "todo": SS.audio.sfx("glitch"); fx(["#ff2bd6", "#fff3b0"]); SS.ui.toast(`Nota ${SS.countGot("todo_")}/30: "TODO: ${it.text || "arreglar esto"}"`, 2.6); break;
        case "cart": SS.audio.sfx("gold"); fx(["#ffd23f", "#ff2bd6"]); SS.save.games[it.game] = true; SS.ui.toast(`¡Cartucho secreto! Minijuego: ${SS.MINIGAMES[it.game].name}. Juégalo en la consola`, 3); break;
        case "chancla": SS.audio.sfx("gold"); fx(["#2ee6d6", "#ff4fa3"]); SS.save.unlocked.lupe = true; if (!SS.save.party.includes("lupe")) SS.save.party.push("lupe"); SS.ui.toast("¡La Chancla de Dios! Doña Lupe se une al equipo", 3); break;
      }
    }
    draw(ctx) {
      const lv = this.level, cam = this.cam, t = this.t;
      SS.gfx.drawBg(ctx, lv.theme, cam.x, cam.y, lv.glitch ? 1 : 0, t);
      for (const d of lv.decor) SS.drawDecor(ctx, d, cam, t);
      this.def.drawBack && this.def.drawBack(this, ctx);
      for (const [tx, ty, text] of lv.todos) { const x = Math.round(tx * T - cam.x); if (x > -160 && x < W) SS.gfx.todo(ctx, x, ty * T - cam.y, text, t); }
      this.drawObjects(ctx);
      SS.drawTiles(ctx, lv, cam, t);
      for (const it of lv.items) {
        if (SS.save.got[it.id]) continue;
        const x = Math.round(it.px - cam.x), y = Math.round(it.py - cam.y + Math.sin(t * 4 + it.px) * 1.5);
        if (x < -16 || x > W + 16 || y < -16 || y > H + 16) continue;
        drawItem(ctx, it, x, y, t);
      }
      this.drawCommon(ctx);
      this.def.drawFront && this.def.drawFront(this, ctx);
    }
  }
  function drawItem(ctx, it, x, y, t) {
    if (it.kind === "coin") { const f = Math.floor(t * 8 + it.px) % 4; const w = [8, 6, 2, 6][f]; ctx.drawImage(SS.gfx.icon("coin"), x - w / 2, y - 4, w, 8); }
    else if (it.kind === "gk") { ctx.globalAlpha = 0.35; ctx.fillStyle = "#ffd23f"; ctx.fillRect(x - 9, y - 7, 18, 14); ctx.globalAlpha = 1; ctx.drawImage(SS.gfx.icon("gk"), x - 6, y - 4); }
    else if (it.kind === "photo") { ctx.globalAlpha = 0.3; ctx.fillStyle = "#6fb7ff"; ctx.fillRect(x - 8, y - 8, 16, 16); ctx.globalAlpha = 1; ctx.drawImage(SS.gfx.icon("photo"), x - 5, y - 5); }
    else if (it.kind === "roll") ctx.drawImage(SS.gfx.icon("roll"), x - 5, y - 5);
    else if (it.kind === "todo") ctx.drawImage(SS.gfx.icon("todo"), x - 6, y - 6);
    else if (it.kind === "cart") { ctx.globalAlpha = 0.35; ctx.fillStyle = "#ff2bd6"; ctx.fillRect(x - 9, y - 9, 18, 18); ctx.globalAlpha = 1; ctx.drawImage(SS.gfx.icon("cart"), x - 6, y - 6); }
    else if (it.kind === "chancla") { ctx.globalAlpha = 0.35; ctx.fillStyle = "#2ee6d6"; ctx.fillRect(x - 9, y - 9, 18, 18); ctx.globalAlpha = 1; ctx.drawImage(SS.gfx.icon("chancla"), x - 6, y - 6); }
  }
  SS.drawItem = drawItem;
  SS.GameLevel = GameLevel;

  SS.addBond = (who, n) => { if (!SS.save.bonds[who] && SS.save.bonds[who] !== 0) return; SS.save.bonds[who] = Math.min(5, SS.save.bonds[who] + n); };
})();
