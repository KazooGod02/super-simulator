// SUPER SIMULATOR · cartuchos secretos: los minijuegos de la franquicia
(() => {
  "use strict";
  const W = SS.W, H = SS.H;
  const OUT = "#120f1c";

  SS.MINIGAMES = {
    gym: { name: "Día de Pierna (Jesús)", how: "Presiona {attack} cuando la barra esté en lo verde. 20 segundos." },
    grito: { name: "Grito en Clase (Carlos)", how: "Mantén {attack} para gritar y juntar AURA. Si el profe voltea, suéltalo. Tres reportes y se acaba." },
    peleas: { name: "Peleas Clandestinas (Daniel)", how: "Presiona la flecha que salga antes de que se acabe el tiempo. 20 golpes." },
    tacos: { name: "Repartidor de Tacos (Kazoo)", how: "Muévete con {left}{right}. Agarra tacos, esquiva los chiles. 30 segundos." },
    clicker: { name: "Clicker Tycoon (César)", how: "Machaca {attack} durante 10 segundos. Las rachas dan críticos." },
  };

  SS.scenes.minigame = id => {
    const G = SS.MINIGAMES[id];
    let t = 0, state = "intro", score = 0, time = 0, st = {};
    const I = SS.input;
    const end = () => {
      state = "over";
      const best = SS.save.games[id + "_best"] || 0;
      if (score > best) SS.save.games[id + "_best"] = score;
      SS.save.feria += Math.floor(score / 4);
      SS.writeSave();
      SS.audio.sfx("jingle");
      SS.ui.menu(`${G.name.toUpperCase()} · ${score} PUNTOS`, [
        { label: "Otra vez", action: () => { SS.ui.closeMenu(); SS.go(() => SS.scenes.minigame(id), true); } },
        { label: "Regresar a la Kazoovan", action: () => { SS.ui.closeMenu(); SS.go(() => SS.scenes.van({})); } },
      ], { note: `Récord: ${Math.max(best, score)} · Ganaste ${Math.floor(score / 4)} de feria` });
    };
    const init = {
      gym() { time = 20; st = { pos: 0, dir: 1, zone: [0.62, 0.8], flash: 0, reps: 0 }; },
      grito() { time = 99; st = { facing: false, turnT: 2.5, strikes: 0, warn: 0 }; },
      peleas() { time = 99; st = { n: 0, cur: null, left: 0, hitT: 0 }; },
      tacos() { time = 30; st = { x: W / 2, items: [], spawnT: 0 }; },
      clicker() { time = 10; st = { combo: 0, lastT: 0, pops: [] }; },
    };
    const upd = {
      gym(dt) {
        st.pos += st.dir * dt * (1.1 + st.reps * 0.06); if (st.pos > 1) { st.pos = 1; st.dir = -1; } if (st.pos < 0) { st.pos = 0; st.dir = 1; }
        st.flash = Math.max(0, st.flash - dt);
        if (I.hit("attack") || I.hit("confirm")) {
          if (st.pos > st.zone[0] && st.pos < st.zone[1]) { score += 10; st.reps++; SS.audio.sfx("coin"); st.flash = 0.2; const c = 0.2 + Math.random() * 0.6; st.zone = [c, c + Math.max(0.08, 0.18 - st.reps * 0.005)]; }
          else { score = Math.max(0, score - 5); SS.audio.sfx("bonk"); }
        }
      },
      grito(dt) {
        st.turnT -= dt; st.warn = Math.max(0, st.warn - dt);
        if (st.turnT <= 0) { st.facing = !st.facing; st.turnT = st.facing ? 1 + Math.random() * 1.2 : 1.5 + Math.random() * 2; if (!st.facing) SS.audio.sfx("select"); }
        if (st.facing && st.turnT > 0.9 && st.turnT < 1) st.warn = 0.2;
        if (I.held("attack") || I.held("confirm")) {
          if (st.facing) { st.strikes++; st.facing = false; st.turnT = 2; SS.audio.sfx("hurt"); SS.ui.toast(`¡REPORTE! (${st.strikes}/3)`, 1); if (st.strikes >= 3) end(); }
          else { score += 1; if (Math.random() < 0.3) SS.audio.sfx("blip"); }
        }
      },
      peleas(dt) {
        st.hitT = Math.max(0, st.hitT - dt);
        if (!st.cur) { st.cur = SS.pick(["left", "right", "up", "down"]); st.left = Math.max(0.5, 1.4 - st.n * 0.04); }
        st.left -= dt;
        const dirs = ["left", "right", "up", "down"].filter(d => I.hit(d));
        if (dirs.length) {
          if (dirs[0] === st.cur) { score += 10; st.hitT = 0.15; SS.audio.sfx("hit"); }
          else { SS.audio.sfx("bonk"); }
          st.cur = null; st.n++;
        } else if (st.left <= 0) { SS.audio.sfx("hurt"); st.cur = null; st.n++; }
        if (st.n >= 20) end();
      },
      tacos(dt) {
        const dir = (I.held("right") ? 1 : 0) - (I.held("left") ? 1 : 0);
        st.x = SS.clamp(st.x + dir * 180 * dt, 20, W - 20);
        st.spawnT -= dt;
        if (st.spawnT <= 0) { st.spawnT = 0.45; st.items.push({ x: SS.rand(20, W - 20), y: -10, chile: Math.random() < 0.3, v: SS.rand(70, 130) }); }
        for (const it of st.items) {
          it.y += it.v * dt;
          if (!it.done && it.y > H - 46 && it.y < H - 24 && Math.abs(it.x - st.x) < 16) { it.done = true; if (it.chile) { score = Math.max(0, score - 15); SS.audio.sfx("hurt"); SS.shake = 3; } else { score += 5; SS.audio.sfx("coin"); } }
        }
        st.items = st.items.filter(i => i.y < H + 10 && !i.done);
      },
      clicker(dt) {
        if (I.hit("attack") || I.hit("confirm")) {
          const fast = t - st.lastT < 0.25; st.lastT = t;
          st.combo = fast ? st.combo + 1 : 0;
          const crit = st.combo > 6 && Math.random() < 0.25;
          const v = crit ? 10 : st.combo > 3 ? 2 : 1;
          score += v; SS.audio.sfx(crit ? "gold" : "blip");
          st.pops.push({ x: W / 2 + SS.rand(-40, 40), y: 110, v, t: 0.8, crit });
        }
        for (const p of st.pops) { p.t -= dt; p.y -= 30 * dt; }
        st.pops = st.pops.filter(p => p.t > 0);
      },
    };
    const drw = {
      gym(ctx) {
        SS.gfx.drawBg(ctx, "guamuchil", 0, 8, 0, t);
        ctx.fillStyle = "rgba(7,5,26,.6)"; ctx.fillRect(0, 0, W, H);
        SS.gfx.drawPerson(ctx, SS.gfx.SPECS.jesus, st.flash > 0 ? "jump" : "idle", Math.floor(t * 2) % 2, W / 2 - 16, 100 + (st.flash > 0 ? -8 : 0), 1, undefined, 2);
        ctx.fillStyle = "#9aa3b5"; ctx.fillRect(W / 2 - 40, 108 + (st.flash > 0 ? -8 : 0), 80, 4); ctx.fillStyle = OUT; ctx.fillRect(W / 2 - 48, 102 + (st.flash > 0 ? -8 : 0), 10, 16); ctx.fillRect(W / 2 + 38, 102 + (st.flash > 0 ? -8 : 0), 10, 16);
        const bx = 60, bw = W - 120;
        ctx.fillStyle = OUT; ctx.fillRect(bx - 2, 178, bw + 4, 14); ctx.fillStyle = "#3d3478"; ctx.fillRect(bx, 180, bw, 10);
        ctx.fillStyle = "#2ee6a0"; ctx.fillRect(bx + st.zone[0] * bw, 180, (st.zone[1] - st.zone[0]) * bw, 10);
        ctx.fillStyle = "#ffd23f"; ctx.fillRect(bx + st.pos * bw - 2, 176, 4, 18);
      },
      grito(ctx) {
        SS.gfx.drawBg(ctx, "school", 0, 8, 0, t);
        ctx.fillStyle = "#2a6a50"; ctx.fillRect(60, 40, 180, 70); ctx.fillStyle = "#f4f4f4"; ctx.font = '6px "Press Start 2P"'; ctx.textBaseline = "top"; ctx.fillText("2x + 3 = ?", 100, 70);
        SS.gfx.drawPerson(ctx, SS.gfx.SPECS.profe, "idle", 0, 250, 82, st.facing ? -1 : 1, undefined, 2);
        if (st.warn > 0) { ctx.fillStyle = "#e83b3b"; ctx.fillText("!", 270, 70); }
        const screaming = I.held("attack") || I.held("confirm");
        SS.gfx.drawPerson(ctx, SS.gfx.SPECS.carlos, screaming ? "shout" : "idle", 0, 80, 150, 1, undefined, 2);
        if (screaming) { ctx.strokeStyle = "#ff4fa3"; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(116, 170, 14 + i * 8 + (t * 40) % 8, -0.6, 0.6); ctx.stroke(); } }
        ctx.fillStyle = OUT; ctx.fillRect(20, 20, 104, 10); ctx.fillStyle = "#ff4fa3"; ctx.fillRect(22, 22, Math.min(100, score / 5), 6);
        ctx.fillStyle = "#f4f4f4"; ctx.fillText("AURA", 22, 32); ctx.fillText("REPORTES " + st.strikes + "/3", 230, 20);
      },
      peleas(ctx) {
        SS.gfx.drawBg(ctx, "primavera", 0, 8, 0, t);
        SS.gfx.drawPerson(ctx, SS.gfx.SPECS.daniel, st.hitT > 0 ? "punch" : "idle", 0, 110, 120, 1, undefined, 2);
        SS.gfx.drawPerson(ctx, SS.gfx.SPECS.luchador, st.hitT > 0 ? "hurt" : "idle", 0, 220, 120, -1, undefined, 2);
        ctx.fillStyle = "#5b4a3c"; ctx.fillRect(0, 168, W, 48);
        if (st.cur) {
          const arrows = { left: "◀", right: "▶", up: "▲", down: "▼" };
          ctx.fillStyle = OUT; ctx.fillRect(W / 2 - 22, 30, 44, 44); ctx.fillStyle = "#ffd23f"; ctx.fillRect(W / 2 - 20, 32, 40, 40);
          ctx.fillStyle = OUT; ctx.font = '20px "Press Start 2P"'; ctx.textBaseline = "top"; ctx.fillText(arrows[st.cur], W / 2 - 10, 42);
          ctx.fillStyle = "#e83b3b"; ctx.fillRect(W / 2 - 20, 76, 40 * Math.max(0, st.left / 1.4), 3);
        }
        ctx.fillStyle = "#f4f4f4"; ctx.font = '6px "Press Start 2P"'; ctx.fillText(st.n + "/20", 10, 10);
      },
      tacos(ctx) {
        SS.gfx.drawBg(ctx, "culiacan", t * 30, 8, 0, t);
        ctx.fillStyle = "#5b4a3c"; ctx.fillRect(0, H - 24, W, 24);
        for (const it of st.items) { if (it.chile) { ctx.fillStyle = OUT; ctx.fillRect(Math.round(it.x) - 5, Math.round(it.y) - 3, 10, 7); ctx.fillStyle = "#e83b3b"; ctx.fillRect(Math.round(it.x) - 4, Math.round(it.y) - 2, 8, 5); ctx.fillStyle = "#2ea84a"; ctx.fillRect(Math.round(it.x) + 3, Math.round(it.y) - 4, 3, 2); } else ctx.drawImage(SS.gfx.icon("taco"), Math.round(it.x) - 6, Math.round(it.y) - 6); }
        SS.gfx.drawPerson(ctx, SS.gfx.SPECS.kazoo, "idle", Math.floor(t * 4) % 2, st.x - 8, H - 48, 1);
      },
      clicker(ctx) {
        SS.gfx.drawBg(ctx, "room", 0, 8, 0, t);
        ctx.fillStyle = OUT; ctx.fillRect(W / 2 - 60, 50, 120, 80); ctx.fillStyle = "#16224a"; ctx.fillRect(W / 2 - 56, 54, 112, 72);
        ctx.fillStyle = "#ff7a1a"; ctx.fillRect(W / 2 - 30, 76, 60, 24); ctx.fillStyle = "#f4f4f4"; ctx.font = '6px "Press Start 2P"'; ctx.textBaseline = "top"; ctx.fillText("CLIC", W / 2 - 12, 85);
        SS.gfx.drawPerson(ctx, SS.gfx.SPECS.cesar, "throw", 0, W / 2 - 16, 140, 1, undefined, 2);
        for (const p of st.pops) { ctx.fillStyle = p.crit ? "#ffd23f" : "#f4f4f4"; ctx.fillText("+" + p.v, Math.round(p.x), Math.round(p.y)); }
        ctx.fillStyle = "#ff2bd6"; ctx.fillText("RACHA x" + st.combo, 20, 20);
      },
    };
    return {
      pausable: false,
      enter() { SS.audio.music({ gym: "jesus", grito: "carlos", peleas: "daniel", tacos: "culiacan", clicker: "cesar" }[id]); init[id](); SS.ui.card(G.name.toUpperCase(), "", 2); SS.ui.hint(G.how); },
      update(dt) {
        t += dt;
        if (state === "intro") { if (t > 2.2) { state = "play"; SS.ui.hint(null); SS.audio.sfx("confirm"); } return; }
        if (state !== "play") return;
        upd[id](dt);
        if (time < 99) { time -= dt; if (time <= 0 && state === "play") end(); }
      },
      draw(ctx) {
        drw[id](ctx);
        ctx.fillStyle = "rgba(7,5,26,.75)"; ctx.fillRect(W - 120, 6, 114, 16);
        ctx.fillStyle = "#ffd23f"; ctx.font = '6px "Press Start 2P"'; ctx.textBaseline = "top";
        ctx.fillText("PUNTOS " + score + (time < 99 ? "  " + Math.max(0, Math.ceil(time)) + "s" : ""), W - 114, 11);
      },
    };
  };
})();
