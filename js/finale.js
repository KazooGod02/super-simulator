// SUPER SIMULATOR · la decisión, los créditos y los 5 finales
(() => {
  "use strict";
  const W = SS.W, H = SS.H;
  const S = SS.scenes;

  SS.finale = {
    decision(sc) {
      sc.run(function* () {
        yield SS.say(SS.TEXT.decision);
        let choice = null;
        const pick = c => () => { choice = c; SS.ui.closeMenu(); };
        const items = [
          { label: "Terminar a Cero", sub: "Ponerle color, música y créditos", action: pick("terminar") },
          { label: "Borrar a Cero (Supr)", sub: "Que se acabe aquí", action: pick("borrar") },
        ];
        if (SS.countGot("todo_") >= 30) items.push({ label: "Abrir el código", sub: "Tienes las 30 notas TODO", action: pick("codigo") });
        SS.ui.menu("¿QUÉ HACES CON CERO?", items, { wide: true });
        yield SS.until(() => choice);
        SS.save.decision = choice;
        yield SS.say(SS.TEXT[{ terminar: "choseTerminar", borrar: "choseBorrar", codigo: "choseCodigo" }[choice]]);
        SS.save.done.cero = true;
        SS.save.run = { id: "guardar" };
        SS.writeSave();
        SS.startLevel("guardar");
      }());
    },
    endingLetter() {
      const s = SS.save;
      if (s.decision === "codigo") return "E";
      if (s.decision === "borrar") return "B";
      const bondsOk = ["cesar", "jesus", "carlos", "daniel"].every(k => s.bonds[k] >= 4);
      return bondsOk && SS.countGot("photo") >= 15 ? "A" : "B";
    },
  };

  // ---------------- créditos ----------------
  S.credits = () => {
    let t = 0, y = H + 10;
    const list = SS.TEXT.credits;
    return {
      pausable: false,
      enter() { SS.audio.music("credits"); SS.save.done.guardar = true; SS.writeSave(); },
      update(dt) {
        t += dt; y -= dt * 22;
        const end = y + list.length * 40 < -20;
        if (end || (t > 3 && (SS.input.hit("confirm") || SS.input.hit("attack")) && y < 40)) SS.go(() => S.ending(SS.finale.endingLetter()));
      },
      draw(ctx) {
        SS.starfield(ctx, t);
        ctx.textBaseline = "top";
        list.forEach(([a0, b0], i) => {
          const a = SS.caps(a0), b = SS.caps(b0);
          const yy = Math.round(y + i * 40);
          if (yy < -30 || yy > H) return;
          ctx.font = '7px "Press Start 2P"'; ctx.fillStyle = "#ffd23f"; ctx.fillText(a, Math.round(W / 2 - ctx.measureText(a).width / 2), yy);
          ctx.font = '6px "Press Start 2P"'; ctx.fillStyle = "#f3efff";
          const words = b.split(" "); let line = "", ly = yy + 12;
          for (const w of words) { const test = line ? line + " " + w : w; if (ctx.measureText(test).width > W - 40) { ctx.fillText(line, Math.round(W / 2 - ctx.measureText(line).width / 2), ly); line = w; ly += 10; } else line = test; }
          if (line) ctx.fillText(line, Math.round(W / 2 - ctx.measureText(line).width / 2), ly);
        });
        ctx.fillStyle = "#120a22"; ctx.fillRect(0, H - 28, W, 28); ctx.fillStyle = "#3d3478"; for (let x = -((t * 60) % 32); x < W; x += 32) ctx.fillRect(Math.round(x), H - 14, 16, 2);
        ["kazoo", "cesar", "jesus", "carlos", "daniel"].forEach((c, i) => SS.gfx.drawPerson(ctx, SS.gfx.SPECS[c], "run", Math.floor(t * 10 + i) % 4, 90 + i * 40, H - 50, 1));
      },
    };
  };

  // ---------------- finales ----------------
  S.ending = letter => {
    let t = 0, phase = "talk", script = null, ready = 0;
    const E = SS.TEXT.endings[letter];
    const unlocks = [];
    function grant() {
      const s = SS.save;
      s.endings[letter] = true;
      if (letter !== "C") {
        s.stage = "post"; s.run = null;
        const add = (k, name) => { if (!s.unlocked[k]) { s.unlocked[k] = true; unlocks.push(name); } if (!s.party.includes(k)) s.party.push(k); };
        add("cero", "Simulator Cero (jugable)");
        add("pancho", "Pancho (jugable)");
        add("nieve", "Nieve (jugable)");
        if (letter === "A") add("futuro", "Kazoo del Futuro (jugable)");
      }
      SS.writeSave();
    }
    return {
      pausable: false,
      enter() {
        SS.audio.music(letter === "C" ? "flash" : letter === "B" ? "van" : "title");
        script = new SS.Script(function* () {
          yield SS.wait(1);
          yield SS.say(E.lines);
          yield SS.wait(0.6);
          SS.ui.card(E.title, letter === "A" ? "Gracias por jugar" : "", 3);
          yield SS.wait(3);
          grant();
          phase = "panel";
          if (letter === "C") {
            SS.ui.menu("FINAL C · SIN DATOS GUARDADOS", [
              { label: "Reintentar la pelea", action: () => { SS.ui.closeMenu(); SS.save.run = { id: "cero" }; SS.writeSave(); SS.startLevel("cero"); } },
              { label: "Salir al título", action: () => { SS.ui.closeMenu(); SS.go(() => S.title()); } },
            ], { wide: true });
            return;
          }
          const s = SS.save;
          SS.ui.panel(`<h2>${E.title}</h2>
            <div class="row"><span>Fotos del grupo</span><b>${SS.countGot("photo")}/20</b></div>
            <div class="row"><span>Kazoos Dorados</span><b>${SS.countGot("gk")}</b></div>
            <div class="row"><span>Notas TODO</span><b>${SS.countGot("todo_")}/30</b></div>
            <div class="row"><span>Recuerdos</span><b>${["cesar", "jesus", "carlos", "daniel"].map(k => s.bonds[k]).join(" · ")}</b></div>
            <div class="row"><span>Finales vistos</span><b>${Object.keys(s.endings).sort().join(" ")}</b></div>
            <div class="row"><span>Tiempo</span><b>${SS.fmtTime(s.time)}</b></div>
            ${unlocks.length ? `<p>Desbloqueaste: ${unlocks.join(", ")}.</p>` : ""}
            <p>La Kazoovan sigue abierta: regresa a cualquier dimensión y busca lo que te faltó.<br>${SS.ui.fmt("Presiona {confirm}")}</p>`);
        }());
      },
      update(dt) {
        t += dt;
        if (script) script.update(dt);
        if (phase === "panel" && letter !== "C") { ready += dt; if (ready > 1 && (SS.input.hit("confirm") || SS.input.hit("attack"))) SS.go(() => S.van({ fromDrive: true })); }
      },
      draw(ctx) {
        if (letter === "A") {
          SS.gfx.drawBg(ctx, "culiacan", 200, 8, 0, t);
          ctx.fillStyle = "#5b4a3c"; ctx.fillRect(0, 176, W, 40); ctx.fillStyle = "#d8cfb8"; ctx.fillRect(0, 172, W, 4);
          ctx.fillStyle = "#2a5ab0"; ctx.fillRect(0, 190, W, 26); ctx.fillStyle = "#4a8ae0"; for (let x = (t * 20) % 24; x < W; x += 24) ctx.fillRect(Math.round(x), 194, 10, 1);
          SS.gfx.van(ctx, W / 2 - 32, 140, t, true);
          ["kazoo", "cesar", "jesus", "carlos", "daniel"].forEach((c, i) => SS.gfx.drawPerson(ctx, SS.gfx.SPECS[c], "idle", Math.floor(t * 2 + i) % 2, W / 2 - 40 + i * 16, 116, 1));
          SS.gfx.drawPerson(ctx, SS.gfx.SPECS.oozak, "idle", Math.floor(t * 2) % 2, W / 2 + 46, 148, -1);
        } else if (letter === "B") {
          ctx.fillStyle = "#0e0c1a"; ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = "#3a2010"; ctx.fillRect(80, 100, 224, 8);
          ["#ff7a1a", "#ffd23f", "#2ee6d6", "#ff4fa3", "#6fb7ff", "#77737c", "#7b4dff"].forEach((c, i) => { ctx.fillStyle = "#120f1c"; ctx.fillRect(92 + i * 30, 66, 22, 34); ctx.fillStyle = c; ctx.fillRect(93 + i * 30, 67, 20, 32); if (i === 5) { ctx.fillStyle = "#0e0c1a"; ctx.fillRect(93 + i * 30, 67, 20, 32); ctx.strokeStyle = "#77737c"; ctx.strokeRect(93.5 + i * 30, 67.5, 19, 31); } });
          SS.gfx.drawPerson(ctx, SS.gfx.SPECS.kazoo, "idle", 0, W / 2 - 8, 150, 1);
          ctx.fillStyle = "#3a3448"; ctx.fillRect(0, 174, W, 42);
        } else if (letter === "C") {
          SS.gfx.drawBg(ctx, "culiacan", 600, 8, 0.6, t);
          SS.gfx.house(ctx, 9 * 16, 168, 9, "#e8d8b0", "#b8a070", "2012", { door: 14 * 16, doorOpen: true, lit: true });
          SS.gfx.drawPerson(ctx, SS.gfx.SPECS.cesarPro, "idle", Math.floor(t * 2) % 2, 14 * 16, 144, -1);
          SS.gfx.drawPerson(ctx, SS.gfx.SPECS.kazoo, "idle", 0, 14 * 16 - 22, 144, 1);
          ctx.fillStyle = "#5b4a3c"; ctx.fillRect(0, 168, W, 48);
        } else if (letter === "E") {
          ctx.fillStyle = "#14121c"; ctx.fillRect(0, 0, W, H);
          ctx.font = '6px "Press Start 2P"'; ctx.textBaseline = "top";
          const code = ["// js/finale.js", "SS.finale = {", "  oozaK: {", "    color: true,", "    musica: true,", "    final: \"el que se merece\",", "    creditos: [\"oozaK\"],", "  },", "};", "// TODO: nada. ya quedó."];
          code.forEach((l, i) => { ctx.fillStyle = ["#77737c", "#ff2bd6", "#2ee6d6", "#ffd23f", "#ffd23f", "#a8fff6", "#ff7a1a", "#2ee6d6", "#ff2bd6", "#2ee6a0"][i]; ctx.fillText(l.slice(0, Math.floor(t * 18 - i * 6)), 20, 20 + i * 12); });
          SS.gfx.drawPerson(ctx, SS.gfx.SPECS.kazoo, "throw", 0, 300, 150, -1);
          SS.gfx.drawPerson(ctx, SS.gfx.SPECS.oozak, "idle", Math.floor(t * 2) % 2, 330, 150, -1);
        } else {
          ctx.fillStyle = "#1f3fbf"; ctx.fillRect(0, 0, W, H);
        }
      },
    };
  };
})();
