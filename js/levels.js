// SUPER SIMULATOR · todas las dimensiones (Actos I, II y III) y el flujo entre niveles
(() => {
  "use strict";
  const T = SS.T, W = SS.W, H = SS.H;

  // ---------- herramientas para armar niveles (coordenadas en tiles) ----------
  const mk = (w, h, theme) => new SS.Level(w, h, theme);
  const G = (L, x0, x1, row = 11) => L.fill(x0, row, x1, L.h - 1, "#");
  const hole = (L, x0, x1, spikes) => { L.fill(x0, 0, x1, L.h - 1, "."); if (spikes) L.fill(x0, L.h - 1, x1, L.h - 1, "^"); };
  const P = (L, x0, x1, row, ch = "=") => L.fill(x0, row, x1, row, ch);
  const C = (L, x0, x1, row, step = 1) => { for (let x = x0; x <= x1; x += step) L.items.push({ kind: "coin", x, y: row }); };
  const I = (L, kind, x, y, o) => L.items.push(Object.assign({ kind, x, y }, o));
  const O = (L, kind, x, row, o) => { const ob = Object.assign({ kind, x: x * T, y: row * T }, o); L.objects.push(ob); return ob; };
  const E = (L, type, x, row = 11, o) => L.spawns.push([type, x, row, o]);
  const S = (L, x, row = 11) => O(L, "save", x, row);
  const D = (L, k, x, o) => L.decor.push(Object.assign({ k, x }, o));
  // pared de un tile con puerta/obstáculo abajo (bloquea el paso por completo)
  const gate = (L, x, ch, rows = [7, 10]) => { L.fill(x, 0, x, rows[0] - 1, "W"); L.fill(x, rows[0], x, rows[1], ch); };
  // cuartito secreto: [x0..x1] filas 9-10 con techo en la 8; la entrada es el tile x0
  const nook = (L, x0, x1, ch) => { L.fill(x0, 8, x1, 8, "W"); L.fill(x1, 9, x1, 10, "W"); L.fill(x0, 9, x0, 10, ch); };

  // ---------- decorado genérico ----------
  SS.drawDecor = (ctx, d, cam, t) => {
    const x = Math.round(d.x * T - cam.x), gy = Math.round((d.row || 11) * T - cam.y);
    if (x < -200 || x > W + 60) return;
    const O_ = SS.gfx.OUT;
    switch (d.k) {
      case "house": SS.gfx.house(ctx, x, gy, d.w || 6, d.color, d.trim || "#3a1d44", d.num || "", { door: d.door !== undefined ? Math.round(d.door * T - cam.x) : undefined, lit: true }); break;
      case "store": SS.gfx.store(ctx, x, gy, d.w || 8, d.label); break;
      case "palm": SS.gfx.palm(ctx, x, gy, t); break;
      case "lamp": SS.gfx.lamp(ctx, x, gy, true, t); break;
      case "sign": SS.gfx.sign(ctx, x, gy, d.text, d.col); break;
      case "statue": {
        ctx.fillStyle = O_; ctx.fillRect(x - 1, gy - 20, 34, 20); ctx.fillStyle = "#9aa3b5"; ctx.fillRect(x, gy - 19, 32, 19);
        SS.gfx.drawPerson(ctx, { id: "idolo", skin: "#c9a35a", skinS: "#a07a3a", hair: "#a07a3a", hairStyle: "neat", shirt: "#c9a35a", shirtS: "#a07a3a", pants: "#c9a35a", pantsS: "#a07a3a", shoes: "#a07a3a", mustache: true }, "idle", 0, x, gy - 68, 1, undefined, 2);
        ctx.fillStyle = O_; ctx.font = '5px "Press Start 2P"'; ctx.textBaseline = "top"; ctx.fillText("EL IDOLO", x + 2, gy - 12);
        break;
      }
      case "poster": {
        ctx.fillStyle = O_; ctx.fillRect(x - 1, gy - 1 - (d.h || 40), (d.w || 30) + 2, (d.h || 40) + 2);
        ctx.fillStyle = d.col || "#ff4fa3"; ctx.fillRect(x, gy - (d.h || 40), d.w || 30, d.h || 40);
        if (d.face) { const c = SS.decorFace(d.face); ctx.drawImage(c, x + ((d.w || 30) - 16) / 2, gy - (d.h || 40) + 4); }
        if (d.text) { ctx.fillStyle = "#f4f4f4"; ctx.font = '5px "Press Start 2P"'; ctx.textBaseline = "top"; ctx.fillText(d.text, x + 2, gy - 10); }
        break;
      }
      case "sketch": {
        ctx.fillStyle = "#e8e4dc"; ctx.fillRect(x, gy - 64, 48, 60); ctx.fillStyle = "#c4c0b8"; ctx.fillRect(x, gy - 64, 48, 2);
        ctx.globalAlpha = 0.7; const c = SS.decorFace(d.face); ctx.drawImage(c, x + 8, gy - 56, 32, 32); ctx.globalAlpha = 1;
        ctx.fillStyle = "#77737c"; ctx.font = '5px "Press Start 2P"'; ctx.textBaseline = "top"; ctx.fillText(d.text || "", x + 3, gy - 18);
        ctx.strokeStyle = "#77737c"; ctx.strokeRect(x + 4.5, gy - 60.5, 39, 40);
        break;
      }
      case "sun": {
        const a = 0.25 + Math.sin(t * 2) * 0.08;
        ctx.globalAlpha = a; ctx.fillStyle = "#ffe27a"; ctx.beginPath(); ctx.moveTo(x - 6, 0); ctx.lineTo(x + 22, 0); ctx.lineTo(x + 34, gy); ctx.lineTo(x - 18, gy); ctx.fill(); ctx.globalAlpha = 1;
        break;
      }
      case "booth": {
        ctx.fillStyle = O_; ctx.fillRect(x - 1, gy - 49, 30, 49); ctx.fillStyle = "#3b5bdb"; ctx.fillRect(x, gy - 48, 28, 48);
        ctx.fillStyle = "#16224a"; ctx.fillRect(x + 4, gy - 42, 20, 16); const c = SS.decorFace("yesenia"); ctx.drawImage(c, x + 6, gy - 42);
        ctx.fillStyle = "#f4f4f4"; ctx.font = '5px "Press Start 2P"'; ctx.textBaseline = "top"; ctx.fillText("VIDEO", x + 3, gy - 20);
        break;
      }
      case "big": { ctx.font = '24px "Press Start 2P"'; ctx.textBaseline = "top"; ctx.fillStyle = d.col || "rgba(255,43,214,.15)"; ctx.fillText(d.text, x, gy - (d.h || 120)); break; }
    }
  };
  const faceCache = {};
  SS.decorFace = id => { if (!faceCache[id]) { const [c] = SS.gfx.mk(16, 16); SS.gfx.drawFace(c, id); faceCache[id] = c; } return faceCache[id]; };

  const LV = (SS.LEVELS = {});

  // =====================================================================
  // ACTO I
  // =====================================================================
  LV.cesar = {
    title: "EL CUARTO LIMPIO", dim: "NIVEL 1 · DIMENSIÓN CÉSAR", music: "cesar", start: [2, 11], act: 1, recruit: "cesar",
    build() {
      const L = mk(162, 14, "room");
      L.zones = [[0, "room"], [134, "office"]];
      G(L, 0, 161);
      S(L, 3); C(L, 5, 12, 10);
      P(L, 10, 12, 8); L.fill(16, 10, 17, 10, "Q"); L.fill(18, 9, 18, 10, "Q"); P(L, 20, 24, 8); C(L, 20, 24, 7); I(L, "gk", 24, 4);
      nook(L, 27, 30, "V"); I(L, "chancla", 29, 10);
      // la mamá patrulla: escóndete en los clósets, súbete a las repisas o atúrdela con el kazoo
      E(L, "mama", 46, 11, { x0: 34 * T, x1: 58 * T });
      O(L, "hide", 40, 11, { look: "closet" }); O(L, "hide", 52, 11, { look: "closet" });
      P(L, 33, 37, 8); P(L, 40, 44, 7); P(L, 47, 51, 8); P(L, 54, 58, 7); C(L, 40, 44, 6); I(L, "photo", 49, 7, { name: "César con la compu, 2012" });
      S(L, 62);
      E(L, "testigo", 70); E(L, "testigo", 80); E(L, "correo", 76, 11); E(L, "correo", 90, 11);
      C(L, 66, 74, 10, 2);
      O(L, "terminal", 85, 11, { opens: [[88, 9, 88, 10]], msg: "César abrió el clóset" }); nook(L, 88, 90, "G"); I(L, "gk", 89, 10);
      nook(L, 94, 97, "B"); I(L, "photo", 96, 10, { name: "Jesús y César en el gym (César no hizo nada)" });
      O(L, "pc", 100, 11, { opens: [[104, 6, 104, 10]], msg: "¡Se abrió la puerta del pasillo!" }); gate(L, 104, "G", [6, 10]);
      E(L, "blob", 108);
      O(L, "hook", 110, 4); P(L, 111, 113, 3); I(L, "gk", 112, 2);
      E(L, "mama", 122, 11, { x0: 114 * T, x1: 130 * T });
      O(L, "hide", 118, 11, { look: "closet" }); O(L, "hide", 126, 11, { look: "closet" });
      P(L, 113, 117, 8); P(L, 120, 124, 7); P(L, 127, 131, 8);
      S(L, 132);
      L.fill(161, 0, 161, 10, "W");
      D(L, "big", 140, { text: "Q4", h: 150, col: "rgba(31,122,52,.18)" });
      L.boss = { type: "cesarPro", x0: 136, x1: 160, at: 139, floor: 11 };
      return L;
    },
    hints(sc) {
      const x = sc.player.cx / T;
      if (x > 30 && x < 36 && !SS.save.run.hintMama) return "La mamá de César: si te ve, regresas. Escóndete con {down} en un clóset, súbete a las repisas o atúrdela con {special}";
      if (x > 96 && x < 103 && !sc.level.objects.find(o => o.kind === "pc").done) return "Hackea la compu con {up} y luego machaca {attack}";
      return null;
    },
  };

  LV.jesus = { title: "GUAMÚCHIL SIN LIBRITO", dim: "NIVEL 2 · DIMENSIÓN JESÚS", act: 1, recruit: "jesus", parts: ["jesus_calle", "race_mocorito", "jesus_tren"] };
  LV.jesus_calle = {
    title: "GUAMÚCHIL SIN LIBRITO", dim: "NIVEL 2 · DIMENSIÓN JESÚS", music: "jesus", start: [2, 11], parent: "jesus",
    build() {
      const L = mk(150, 14, "guamuchil");
      G(L, 0, 149);
      D(L, "house", 4, { w: 6, color: "#f2b35a", num: "12" }); D(L, "palm", 12); D(L, "house", 26, { w: 7, color: "#ff8fb1", num: "88" }); D(L, "lamp", 50); D(L, "store", 52, { w: 8, label: "GYM EL MAMADO" }); D(L, "palm", 76); D(L, "house", 84, { w: 6, color: "#7fd3c4", num: "31" }); D(L, "palm", 124); D(L, "sign", 130, { text: "MOCORITO 18 KM" });
      S(L, 2); C(L, 4, 10, 10);
      E(L, "poli", 18); E(L, "tlacuache", 24);
      P(L, 14, 16, 8); P(L, 19, 21, 6); I(L, "gk", 20, 4);
      // el río Évora: piedras para cruzar
      L.fill(36, 11, 47, 13, "~"); L.fill(38, 10, 39, 10, "Q"); L.fill(41, 10, 42, 10, "Q"); L.fill(44, 10, 45, 10, "Q");
      I(L, "photo", 42, 8, { name: "Jesús y Yesenia (captura de pantalla)" });
      // segundo canal: puente arriba; abajo solo camina Jesús
      L.fill(60, 11, 70, 13, "~"); P(L, 57, 72, 8); I(L, "gk", 65, 10); C(L, 59, 71, 7, 2);
      S(L, 75);
      E(L, "poli", 80); E(L, "poli", 90); E(L, "tlacuache", 86); E(L, "blob", 100);
      nook(L, 104, 107, "B"); I(L, "photo", 106, 10, { name: "Jesús en la báscula del gym" });
      O(L, "hook", 112, 4); P(L, 113, 115, 3); I(L, "gk", 114, 2);
      nook(L, 118, 121, "V"); I(L, "roll", 120, 10);
      S(L, 125);
      E(L, "poli", 130); E(L, "poli", 136);
      D(L, "statue", 140);
      O(L, "exit", 146, 11);
      return L;
    },
    hints(sc) { return sc.player.cx / T > 140 ? "Usa la salida con {up}: los Senpais de Mocorito te retan a una carrera" : null; },
  };
  LV.jesus_tren = {
    title: "ARRIBA DEL TREN", dim: "CALLE FERROCARRIL", music: "jesus", start: [3, 11], parent: "jesus",
    build() { const L = mk(26, 14, "train"); G(L, 0, 25); L.fill(0, 0, 0, 10, "W"); L.fill(25, 0, 25, 10, "W"); L.boss = { type: "jesusPelon", x0: 1, x1: 25, at: 4, floor: 11 }; return L; },
  };

  LV.carlos = {
    title: "LA ESCUELA DEL SILENCIO", dim: "NIVEL 3 · DIMENSIÓN CARLOS", music: "carlos", start: [2, 11], act: 1, recruit: "carlos",
    build() {
      const L = mk(154, 14, "school");
      L.zones = [[0, "school"], [128, "library"]];
      G(L, 0, 153);
      S(L, 2); C(L, 4, 9, 10);
      E(L, "prefecto", 22, 11, { x0: 14 * T, x1: 34 * T });
      O(L, "hide", 18, 11, { look: "locker" }); O(L, "hide", 28, 11, { look: "locker" });
      P(L, 13, 16, 8); P(L, 19, 22, 7); P(L, 25, 28, 8); P(L, 31, 34, 7); I(L, "gk", 26, 5);
      S(L, 37);
      E(L, "papel", 44); E(L, "papel", 52); E(L, "correo", 48);
      O(L, "npc", 58, 11, { spec: "karina", mission: "carlos", label: "Hablar con Karina", lines: [["karina", "¿Conoces a Carlos? Antes gritaba en clase. Ahora ni habla. Qué aburridos están los lunes."]], needLines: [["karina", "Si ves a Carlos, dile que extraño cuando gritaba. Era lo único divertido de la escuela."]], after: [["karina", "Grita con propósito, Carlos. Así me gustas."]] });
      E(L, "profe", 72, 11, { x0: 62 * T, x1: 84 * T, view: 140 });
      O(L, "hide", 66, 11, { look: "locker" }); O(L, "hide", 74, 11, { look: "locker" }); O(L, "hide", 81, 11, { look: "locker" });
      P(L, 61, 64, 8); P(L, 67, 70, 7); P(L, 73, 76, 8); P(L, 79, 82, 7); P(L, 85, 87, 8);
      I(L, "photo", 69, 6, { name: "Carlos con su corona de larp" });
      S(L, 89);
      O(L, "terminal", 93, 11, { opens: [[96, 9, 96, 10]], msg: "César abrió el locker" }); nook(L, 96, 98, "G"); I(L, "gk", 97, 10);
      nook(L, 106, 108, "G"); O(L, "switch", 103, 6, { opens: [[106, 9, 106, 10]], msg: "Pancho picó el botón" }); I(L, "photo", 107, 10, { name: "Carlos y Daniel en la cafetería" });
      E(L, "papel", 112); E(L, "correo", 116); E(L, "papel", 120);
      O(L, "hook", 115, 4); P(L, 116, 118, 3); I(L, "gk", 117, 2);
      S(L, 124);
      L.fill(153, 0, 153, 10, "W");
      L.boss = { type: "carlosCallado", x0: 129, x1: 153, at: 132, floor: 11 };
      return L;
    },
    hints(sc) {
      const x = sc.player.cx / T;
      if (x > 10 && x < 15) return "El prefecto ve lejos. Escóndete en un locker con {down} o ve por arriba";
      if (sc.bossActive) return "Carlos Callado no siente nada… hasta que hay ruido: ¡usa {special}!";
      return null;
    },
  };

  LV.daniel = {
    title: "LA PRIMAVERA FELIZ", dim: "NIVEL 4 · DIMENSIÓN DANIEL", music: "daniel", start: [2, 11], act: 1, recruit: "daniel",
    build() {
      const L = mk(151, 14, "primavera");
      G(L, 0, 150);
      D(L, "house", 4, { w: 6, color: "#3a3458", num: "7" }); D(L, "lamp", 14); D(L, "house", 44, { w: 7, color: "#2e3a5a", num: "15" }); D(L, "lamp", 60); D(L, "house", 98, { w: 6, color: "#3a2e50", num: "23" });
      S(L, 2); C(L, 4, 10, 10);
      L.arenas.push({ x0: 16, x1: 40, waves: [[["tlacuache", "L"], ["tlacuache", "R"]], [["tlacuache", "L"], ["extra", "R"], ["tlacuache", "R"]]], msg: "¡Los vecinos están raros! Pelea" });
      S(L, 42);
      P(L, 46, 48, 8); P(L, 51, 53, 6); I(L, "gk", 52, 4);
      E(L, "tlacuache", 55); E(L, "blob", 62);
      O(L, "dog", 66, 11, { mission: "daniel", label: "Acariciar a Nieve", lines: [["narr", "Nieve te ve, mueve la cola y se voltea. Está confundida: su dueño sonríe todo el día."]], needLines: [["narr", "Nieve te ve, mueve la cola y se voltea. Está confundida: su dueño sonríe todo el día."]], after: [["narr", "Nieve hace el truco nuevo y luego pide premio. Lo pide aullando, como buen husky."]] });
      L.arenas.push({ x0: 70, x1: 94, waves: [[["tlacuache", "L"], ["tlacuache", "R"], ["extra", "R"]], [["extra", "L"], ["extra", "R"]], [["tlacuache", "L"], ["tlacuache", "L"], ["tlacuache", "R"], ["tlacuache", "R"]]], msg: "¡Pelea callejera!" });
      S(L, 96);
      nook(L, 100, 103, "B"); I(L, "photo", 102, 10, { name: "Daniel y Nieve de cachorro" });
      nook(L, 107, 110, "V"); I(L, "gk", 109, 10);
      O(L, "lever", 113, 11, { opens: [[116, 9, 116, 10]], msg: "La Mano Derecha de César jaló la palanca" }); nook(L, 116, 118, "G"); I(L, "photo", 117, 10, { name: "Daniel con cara de nada en su cumpleaños" });
      O(L, "hook", 122, 4); P(L, 123, 125, 3); I(L, "gk", 124, 2);
      S(L, 127);
      L.fill(150, 0, 150, 10, "W");
      L.boss = { type: "danielSonriente", x0: 126, x1: 150, at: 130, floor: 11 };
      return L;
    },
  };

  // =====================================================================
  // ACTO II (todo el equipo)
  // =====================================================================
  LV.telenovela = {
    title: "AMORES DE GUAMÚCHIL", dim: "NIVEL 5 · DIMENSIÓN TELENOVELA", music: "telenovela", start: [2, 11], act: 2, lead: "jesus",
    build() {
      const L = mk(161, 14, "telenovela");
      G(L, 0, 160);
      S(L, 2); C(L, 4, 10, 10);
      E(L, "extra", 16); E(L, "extra", 24);
      L.fill(28, 11, 36, 13, "~"); I(L, "gk", 32, 8);
      S(L, 38);
      gate(L, 44, "B");
      E(L, "extra", 50); P(L, 50, 53, 8); I(L, "gk", 52, 5);
      gate(L, 58, "V");
      hole(L, 64, 72, true); O(L, "hook", 66, 6); O(L, "hook", 70, 6);
      S(L, 75);
      O(L, "terminal", 78, 11, { opens: [[82, 6, 82, 10]], msg: "César hackeó la puerta del set" }); gate(L, 82, "G", [6, 10]);
      E(L, "extra", 86); E(L, "extra", 92); C(L, 85, 95, 10, 2);
      gate(L, 98, "F");
      hole(L, 104, 110, true); O(L, "switch", 102, 5, { makes: [[104, 10, 110, 10, "="]], msg: "¡Pancho bajó el puente!" });
      I(L, "photo", 107, 6, { name: "Jesús llorando en la telenovela" });
      S(L, 112);
      O(L, "sensor", 116, 11, { opens: [[120, 6, 120, 10]], msg: "¡El grito abrió el telón!" }); gate(L, 120, "G", [6, 10]);
      P(L, 124, 126, 8); I(L, "cart", 125, 6, { game: "gym" });
      O(L, "lever", 128, 11, { opens: [[131, 9, 131, 10]], msg: "César jaló la palanca del escenario" }); nook(L, 131, 133, "G"); I(L, "photo", 132, 10, { name: "El elenco de \"Amores de Guamúchil\"" });
      I(L, "gk", 129, 6);
      S(L, 134);
      L.fill(160, 0, 160, 10, "W");
      L.boss = { type: "villana", x0: 136, x1: 160, at: 139, floor: 11 };
      return L;
    },
    update(sc, dt) {
      // candelabros que caen
      sc.chT = (sc.chT || 3) - dt;
      if (sc.chT <= 0 && !sc.bossActive && !sc.blocking()) {
        sc.chT = 3.5 + Math.random() * 2;
        const p = sc.player, x = p.cx + p.vx * 0.6;
        sc.fx.add({ x, y: sc.cam.y + 4, life: 0.9, max: 0.9, c: "#ffd23f", s: 4 });
        (sc.warnL = sc.warnL || []).push({ x, t: 0.9 });
      }
      for (const w of sc.warnL || []) { w.t -= dt; if (w.t <= 0 && !w.done) { w.done = true; sc.enemyShot({ x: w.x, y: sc.cam.y, vx: 0, vy: 260, g: 300, look: "box", w: 14, h: 10, ghost: true, life: 1.4 }); } }
      if (sc.warnL) sc.warnL = sc.warnL.filter(w => w.t > -0.1);
      if (sc.zoomFx) sc.zoomFx = Math.max(0, sc.zoomFx - dt);
    },
    drawFront(sc, ctx) {
      for (const w of sc.warnL || []) if (w.t > 0 && Math.floor(w.t * 10) % 2) { ctx.fillStyle = "rgba(255,210,63,.4)"; ctx.fillRect(Math.round(w.x - sc.cam.x - 7), 0, 14, H); }
      if (sc.zoomFx > 0) { ctx.strokeStyle = "rgba(232,59,59,.6)"; ctx.lineWidth = 12; ctx.strokeRect(6, 6, W - 12, H - 12); }
    },
  };

  LV.anime = {
    title: "DIMENSIÓN ANIME", dim: "NIVEL 6 · CARLOS AL MANDO", music: "anime", start: [2, 11], act: 2, lead: "carlos",
    build() {
      const L = mk(161, 14, "anime");
      G(L, 0, 160);
      S(L, 2); C(L, 4, 10, 10);
      E(L, "ninja", 16); E(L, "petalo", 22); E(L, "ninja", 28);
      hole(L, 32, 40, true); O(L, "sensor", 29, 11, { makes: [[32, 10, 40, 10, "="]], msg: "¡El grito hizo aparecer un puente de sakura!" });
      I(L, "gk", 36, 6);
      S(L, 43);
      gate(L, 48, "F");
      E(L, "ninja", 54); P(L, 52, 55, 8); P(L, 57, 60, 6); I(L, "photo", 59, 4, { name: "Carlos y Jesús haciendo pose de anime" });
      gate(L, 64, "B");
      L.fill(68, 11, 76, 13, "~"); I(L, "gk", 72, 9);
      S(L, 78);
      O(L, "sensor", 82, 11, { opens: [[86, 6, 86, 10]], msg: "¡El poder del grito abrió el templo!" }); gate(L, 86, "G", [6, 10]);
      E(L, "petalo", 90); E(L, "ninja", 94); E(L, "petalo", 98);
      hole(L, 102, 110, true); O(L, "hook", 104, 6); O(L, "hook", 108, 6);
      S(L, 113);
      O(L, "terminal", 116, 11, { opens: [[119, 6, 119, 10]], msg: "César apagó el campo de fuerza" }); gate(L, 119, "G", [6, 10]);
      gate(L, 124, "V");
      O(L, "switch", 128, 5, { opens: [[131, 9, 131, 10]], msg: "Pancho picó el gong" }); nook(L, 131, 133, "G"); I(L, "photo", 132, 10, { name: "Las 31 figuras de Jesús, vivas" });
      P(L, 126, 128, 8); I(L, "cart", 127, 6, { game: "grito" }); I(L, "gk", 120, 4); P(L, 120, 122, 7);
      S(L, 134);
      L.fill(160, 0, 160, 10, "W");
      L.boss = { type: "senpai", x0: 136, x1: 160, at: 139, floor: 11 };
      return L;
    },
  };

  LV.lucha = {
    title: "ARENA CULIACÁN", dim: "NIVEL 7 · DANIEL AL MANDO", music: "lucha", start: [2, 11], act: 2, lead: "daniel",
    build() {
      const L = mk(161, 14, "lucha");
      G(L, 0, 160);
      S(L, 2); C(L, 4, 10, 10);
      L.arenas.push({ x0: 12, x1: 36, waves: [[["luchador", "L"], ["luchador", "R"]], [["luchador", "R"], ["extra", "L"], ["luchador", "L"]]], msg: "¡Primera caída!" });
      S(L, 38);
      L.fill(42, 10, 42, 10, "R"); P(L, 44, 47, 5); I(L, "gk", 46, 3); C(L, 44, 47, 4);
      gate(L, 50, "F");
      O(L, "switch", 53, 4, { opens: [[57, 6, 57, 10]], msg: "¡Pancho tocó la campana!" }); gate(L, 57, "G", [6, 10]);
      hole(L, 61, 69, true); O(L, "hook", 63, 6); O(L, "hook", 67, 6);
      S(L, 72);
      L.arenas.push({ x0: 74, x1: 98, waves: [[["luchador", "L"], ["luchador", "R"], ["luchador", "R"]], [["extra", "L"], ["luchador", "R"], ["extra", "R"], ["luchador", "L"]]], msg: "¡Segunda caída! Pelea en parejas" });
      S(L, 100);
      gate(L, 104, "B"); gate(L, 108, "V");
      L.fill(111, 10, 111, 10, "R"); P(L, 113, 116, 5); I(L, "photo", 115, 4, { name: "Daniel con máscara de luchador" });
      O(L, "terminal", 118, 11, { opens: [[121, 6, 121, 10]], msg: "César puso la música de entrada" }); gate(L, 121, "G", [6, 10]);
      L.fill(124, 11, 128, 13, "~"); I(L, "gk", 126, 9);
      O(L, "lever", 130, 11, { opens: [[132, 9, 132, 10]], msg: "César jaló la palanca del ring" }); nook(L, 132, 134, "G"); I(L, "cart", 133, 10, { game: "peleas" });
      P(L, 127, 129, 6); I(L, "photo", 128, 4, { name: "Los cinco en la esquina del ring" }); I(L, "gk", 122, 4); P(L, 121, 123, 7);
      S(L, 135);
      L.fill(160, 0, 160, 10, "W");
      L.boss = { type: "luchadores", x0: 136, x1: 160, at: 139, floor: 11 };
      return L;
    },
  };

  LV.prehistoria = {
    title: "CULIACÁN, UN MILLÓN A.C.", dim: "NIVEL 8 · KAZOO AL MANDO", music: "prehistoria", start: [2, 11], act: 2, lead: null,
    build() {
      const L = mk(161, 14, "prehistoria");
      G(L, 0, 160);
      S(L, 2); C(L, 4, 10, 10);
      E(L, "raptor", 16); E(L, "raptor", 26);
      L.fill(30, 11, 38, 13, "L"); L.fill(32, 10, 32, 10, "Q"); L.fill(35, 10, 35, 10, "Q"); I(L, "gk", 34, 6);
      gate(L, 42, "F");
      D(L, "sun", 47); O(L, "npc", 47, 11, { spec: "temp", hideSprite: true, mission: "cesar", label: "Asomarse al sol", lines: [["kazoo", "Aquí pega el sol bien bonito. A ver si algún compa que nunca sale quiere verlo."]], needLines: [["kazoo", "Aquí pega el sol bien bonito. A ver si algún compa que nunca sale quiere verlo."]], after: [["cesar", "Sigue quemando. Pero está bonito."]] });
      S(L, 50);
      gate(L, 54, "B"); gate(L, 58, "V");
      E(L, "raptor", 62); E(L, "raptor", 68);
      hole(L, 72, 80, true); O(L, "hook", 74, 6); O(L, "hook", 78, 6);
      S(L, 83);
      O(L, "terminal", 86, 11, { opens: [[89, 6, 89, 10]], msg: "César hackeó… ¿una piedra?" }); gate(L, 89, "G", [6, 10]);
      O(L, "switch", 92, 5, { makes: [[95, 10, 101, 10, "="]], msg: "Pancho tumbó un tronco: ¡puente!" }); L.fill(95, 11, 101, 13, "L");
      I(L, "photo", 98, 6, { name: "César sin Wi-Fi, en crisis" });
      L.fill(104, 11, 109, 13, "~"); I(L, "gk", 106, 9);
      O(L, "sensor", 112, 11, { opens: [[115, 6, 115, 10]], msg: "¡El grito espantó a los dinos!" }); gate(L, 115, "G", [6, 10]);
      E(L, "raptor", 120);
      P(L, 122, 124, 8); I(L, "cart", 123, 6, { game: "tacos" });
      O(L, "lever", 127, 11, { opens: [[130, 9, 130, 10]], msg: "César movió la roca" }); nook(L, 130, 132, "G"); I(L, "photo", 131, 10, { name: "Kazoo inventando el kazoo con un hueso" });
      I(L, "gk", 126, 4); P(L, 125, 127, 7);
      S(L, 134);
      L.fill(160, 0, 160, 10, "W");
      L.boss = { type: "tacosaurio", x0: 136, x1: 160, at: 139, floor: 11 };
      return L;
    },
  };

  LV.internet = {
    title: "ADENTRO DEL NAVEGADOR", dim: "NIVEL 9 · CÉSAR AL MANDO", music: "internet", start: [2, 11], act: 2, lead: "cesar",
    build() {
      const L = mk(161, 14, "internet");
      G(L, 0, 160);
      S(L, 2); C(L, 4, 10, 10);
      E(L, "popup", 14); E(L, "bot", 20);
      hole(L, 24, 34, true); P(L, 25, 27, 9, "!"); P(L, 29, 30, 8, "!"); P(L, 32, 34, 9, "!"); I(L, "gk", 30, 5);
      O(L, "terminal", 37, 11, { opens: [[40, 6, 40, 10]], msg: "César cerró 400 pestañas" }); gate(L, 40, "G", [6, 10]);
      S(L, 42);
      D(L, "booth", 46); O(L, "npc", 47, 11, { spec: "yesenia", hideSprite: true, mission: "jesus", label: "Contestar la videollamada", lines: [["narr", "\"Videollamada entrante: Yesenia\". Solo contesta si eres quien ella busca."]], needLines: [["narr", "\"Videollamada entrante: Yesenia\". Solo contesta si eres quien ella busca."]], after: [["yesenia", "Ya te vi, Jesús. Sí existes. Y tu pelo sí es de librito."]] });
      E(L, "bot", 52); E(L, "popup", 56);
      gate(L, 60, "V"); gate(L, 64, "B");
      L.fill(67, 11, 73, 13, "~"); I(L, "photo", 70, 9, { name: "El grupo en una videollamada que se trabó" });
      S(L, 76);
      gate(L, 80, "F");
      hole(L, 84, 92, true); O(L, "hook", 86, 6); O(L, "hook", 90, 6);
      O(L, "pc", 95, 11, { opens: [[99, 6, 99, 10]], msg: "¡Captcha resuelto! (no eras un robot)" }); gate(L, 99, "G", [6, 10]);
      E(L, "popup", 104); E(L, "bot", 108); E(L, "popup", 112);
      O(L, "switch", 115, 5, { opens: [[118, 6, 118, 10]], msg: "Pancho le dio clic a \"Saltar anuncio\"" }); gate(L, 118, "G", [6, 10]);
      O(L, "sensor", 121, 11, { opens: [[124, 9, 124, 10]], msg: "El grito subió el volumen al 100" }); nook(L, 124, 126, "G"); I(L, "cart", 125, 10, { game: "clicker" });
      hole(L, 128, 132, true); P(L, 129, 131, 9, "!"); I(L, "gk", 130, 5);
      P(L, 112, 114, 7, "!"); I(L, "photo", 113, 5, { name: "Los cinco como foto de perfil" }); I(L, "gk", 101, 6); P(L, 100, 102, 8);
      S(L, 134);
      L.fill(160, 0, 160, 10, "W");
      L.boss = { type: "algoritmo", x0: 136, x1: 160, at: 139, floor: 11 };
      return L;
    },
  };

  // =====================================================================
  // ACTO III
  // =====================================================================
  LV.chase = { title: "LA KAZOOVAN ROBADA", dim: "NIVEL 10 · ACTO III", act: 3, parts: ["race_chase"], next: "abandonados" };

  LV.abandonados = {
    title: "PROYECTOS ABANDONADOS", dim: "NIVEL 11 · LA PAPELERA", music: "abandonados", start: [2, 11], act: 3, next: "papelera",
    build() {
      const L = mk(170, 14, "abandonados");
      G(L, 0, 169);
      S(L, 2);
      const todos = ["textura del piso", "arreglar esto", "¿y el cielo?", "final", "música", "nombre del jefe", "quitar esto antes de publicar", "hacer que salte", "colisiones", "diálogo de César", "pelo de Jesús", "corona de Carlos", "cara de Daniel", "créditos", "guardar partida", "balancear dificultad", "Kazoo 2", "poner sonido", "que se vea bonito", "terminar este juego"];
      const xs = [6, 14, 22, 28, 36, 44, 50, 58, 66, 72, 80, 88, 96, 104, 112, 120, 128, 136, 146, 156];
      xs.forEach((x, i) => I(L, "todo", x, i % 3 === 0 ? 7 : 10, { text: todos[i], id: "todo_ab_" + i }));
      [8, 30, 70, 110, 150].forEach((x, i) => L.todos.push([x, 2 + (i % 2), "TODO: " + todos[i * 3]]));
      D(L, "sketch", 10, { face: "kazoo", text: "KAZOO v0.1" }); D(L, "sketch", 40, { face: "cesar", text: "CESAR v0.1" }); D(L, "sketch", 76, { face: "jesus", text: "JESUS v0.1" }); D(L, "sketch", 108, { face: "carlos", text: "CARLOS v0.1" }); D(L, "sketch", 140, { face: "daniel", text: "DANIEL v0.1" });
      O(L, "npc", 26, 11, { spec: "temp", label: "Leer la nota", lines: SS.TEXT.ab1 });
      E(L, "temp", 18); E(L, "blob", 32); E(L, "temp", 46);
      gate(L, 54, "F"); P(L, 56, 58, 8); P(L, 60, 62, 6);
      E(L, "fly", 64); E(L, "temp", 68);
      S(L, 74);
      O(L, "npc", 84, 11, { spec: "kazoo01", label: "Ver el recuerdo", lines: SS.TEXT.ab2 });
      gate(L, 90, "B"); gate(L, 94, "V");
      hole(L, 98, 106, true); O(L, "hook", 100, 6); O(L, "hook", 104, 6);
      S(L, 109);
      E(L, "blob", 114); E(L, "temp", 118); E(L, "fly", 122);
      O(L, "terminal", 125, 11, { opens: [[128, 6, 128, 10]], msg: "César abrió la carpeta \"cero_final_FINAL\"" }); gate(L, 128, "G", [6, 10]);
      O(L, "switch", 131, 5, { opens: [[134, 6, 134, 10]], msg: "Pancho picó \"Restaurar\"" }); gate(L, 134, "G", [6, 10]);
      O(L, "sensor", 137, 11, { opens: [[140, 6, 140, 10]], msg: "El grito despertó un archivo dormido" }); gate(L, 140, "G", [6, 10]);
      I(L, "photo", 144, 8, { name: "El grupo, en boceto (antes de existir)" }); P(L, 143, 145, 9);
      O(L, "npc", 152, 11, { spec: "oozak", label: "Leer el diario de oozaK", lines: SS.TEXT.ab3 });
      O(L, "exit", 164, 11);
      return L;
    },
  };

  LV.papelera = {
    title: "LA PAPELERA DE RECICLAJE", dim: "NIVEL 12 · ACTO III", music: "papelera", start: [3, 61], act: 3, next: "cero",
    build() {
      const L = mk(26, 64, "papelera");
      L.fill(0, 0, 0, 63, "W"); L.fill(25, 0, 25, 63, "W");
      G(L, 1, 24, 61);
      for (const r of [52, 43, 34, 25, 16, 10]) L.fill(1, r, 24, r, "#");
      S(L, 3, 61);
      // A: calentamiento
      P(L, 6, 10, 58); P(L, 13, 18, 55); L.fill(15, 52, 17, 52, "."); I(L, "todo", 21, 59, { text: "papel arrugado", id: "todo_pa_0" }); E(L, "papel", 20, 61);
      // B: Kazoo atraviesa la reja
      S(L, 20, 52); E(L, "papel", 15, 52); L.fill(8, 44, 8, 51, "F"); P(L, 3, 6, 49); P(L, 2, 6, 46); L.fill(3, 43, 5, 43, "."); I(L, "todo", 4, 44, { text: "pared de la izquierda", id: "todo_pa_1" });
      // C: Jesús rompe la pared
      S(L, 3, 43); L.fill(12, 35, 12, 42, "B"); P(L, 14, 17, 40); P(L, 19, 23, 37); L.fill(20, 34, 22, 34, "."); I(L, "todo", 16, 38, { text: "pared que se rompa", id: "todo_pa_2" });
      // D: Carlos rompe el vidrio
      S(L, 20, 34); L.fill(9, 26, 9, 33, "V"); P(L, 3, 7, 31); P(L, 2, 6, 28); L.fill(3, 25, 5, 25, "."); I(L, "todo", 4, 26, { text: "vidrio irrompible", id: "todo_pa_3" }); E(L, "papel", 15, 34);
      // E: Daniel se cuelga
      S(L, 3, 25); O(L, "hook", 21, 20); O(L, "hook", 21, 14); L.fill(20, 16, 22, 16, "."); I(L, "todo", 12, 23, { text: "gancho", id: "todo_pa_4" });
      // F: César hackea el piso y Pancho abre la tapa
      S(L, 20, 16); O(L, "terminal", 4, 16, { makes: [[10, 13, 15, 13, "="]], msg: "César restauró un piso" }); O(L, "switch", 7, 12, { opens: [[11, 10, 14, 10]], msg: "Pancho abrió la tapa de la Papelera" });
      L.fill(11, 10, 14, 10, "G"); I(L, "todo", 17, 14, { text: "piso", id: "todo_pa_5" });
      // arena de arriba (la tapa se cierra al empezar)
      I(L, "todo", 4, 8, { text: "jefe final", id: "todo_pa_6" }); I(L, "todo", 22, 8, { text: "otro jefe final", id: "todo_pa_7" }); I(L, "todo", 13, 4, { text: "la tapa", id: "todo_pa_8" }); I(L, "todo", 2, 59, { text: "esquina", id: "todo_pa_9" });
      L.boss = { type: "genericos", x0: 1, x1: 25, atY: 10.2, floor: 10 };
      return L;
    },
    onBossStart(sc) { sc.level.fill(11, 10, 14, 10, "#"); },
    hints(sc) { return sc.player.y > 60 * T ? "Sube hasta la tapa de la Papelera. Cada piso necesita a un compa distinto" : null; },
  };

  LV.cero = {
    title: "SIMULATOR CERO", dim: "NIVEL 13 · JEFE FINAL", music: "cero", start: [4, 11], act: 3, bossMusic: "cero",
    build() { const L = mk(24, 14, "void"); G(L, 0, 23); L.fill(0, 0, 0, 10, "W"); L.fill(23, 0, 23, 10, "W"); L.boss = { type: "cero", x0: 0, x1: 24, at: 5, floor: 11 }; return L; },
    respawnEnemies: false,
    endAtBoss: false,
    afterBoss(sc) { SS.finale.decision(sc); },
    onPlayerDied(sc) {
      const b = sc.bosses[0];
      if (b && !b.dead && b.phase === 4) { SS.go(() => SS.scenes.ending("C")); return true; }
      return false;
    },
    enter(sc) {
      sc.invertControls = () => { const b = sc.bosses[0]; return b && !b.dead && b.phase === 3 && Math.floor(sc.t / 3) % 2 === 1; };
      sc.ceroPhase = (n, boss) => {
        sc.run(function* () {
          SS.ui.bossBar(null);
          yield SS.wait(0.6);
          yield SS.say(SS.TEXT["cero" + n]);
          if (n === 3) { SS.ui.showHud(false); SS.audio.music("glitch"); }
          if (n === 4) { SS.ui.showHud(true); SS.audio.music("cero"); }
          boss.enterPhase(n);
        }());
      };
    },
    hints(sc) { const b = sc.bosses[0]; if (b && b.phase === 3 && sc.invertControls()) return "¡Los controles están al revés!"; return null; },
    drawFront(sc, ctx) {
      const b = sc.bosses[0];
      if (b && b.phase === 3 && !b.dead) { if (Math.random() < 0.15) SS.tear(ctx, 8, 10); ctx.fillStyle = "rgba(31,63,191,.12)"; ctx.fillRect(0, 0, W, H); }
    },
  };

  LV.guardar = {
    title: "GUARDAR PARTIDA", dim: "NIVEL 14 · EPÍLOGO", music: "title", start: [3, 11], act: 3,
    build() {
      const L = mk(240, 14, "culiacan");
      const zones = [[0, "culiacan"], [24, "room"], [48, "guamuchil"], [72, "school"], [96, "primavera"], [120, "telenovela"], [144, "anime"], [168, "lucha"], [192, "prehistoria"], [216, "internet"]];
      L.zones = zones;
      G(L, 0, 239);
      for (let x = 10; x < 225; x += 9) { const k = (x / 9) % 3 | 0; if (k === 0) L.fill(x, 10, x, 10, "Q"); else if (k === 1) L.fill(x, 9, x + 1, 10, "Q"); else P(L, x, x + 2, 8); }
      for (let x = 12; x < 230; x += 18) C(L, x, x + 3, 7);
      zones.forEach(([x, th], i) => D(L, "sign", x + 2, { text: ["CULIACAN", "EL CUARTO", "GUAMUCHIL", "LA ESCUELA", "LA PRIMAVERA", "TELENOVELA", "ANIME", "LUCHA LIBRE", "PREHISTORIA", "INTERNET"][i], col: "#7b4dff" }));
      O(L, "save", 234, 11);
      L.fill(239, 0, 239, 10, "W");
      return L;
    },
    respawnEnemies: false,
    enter(sc) { sc.auto = 0; SS.ui.toast("¡Corre al punto de guardado antes de que todo se reinicie!", 3); },
    update(sc, dt) {
      if (sc.blocking()) return;
      sc.auto = Math.min((sc.auto || 0) + 78 * dt, sc.level.w * T - W);
      sc.arenaLock = { x0: sc.auto, x1: sc.auto + W };
      for (const p of sc.players) if (p && p.x < sc.auto + 2) { p.x = sc.auto + 2; if (SS.tilesUnder(sc.level, p.x, p.y, p.w + 2, p.h, c => SS.SOLID.has(c))) { p.y -= 18; p.inv = 0.5; } }
      const p = sc.player;
      if (!sc.savedRun && p.cx > 234 * T) { sc.savedRun = true; SS.audio.sfx("jingle"); SS.ui.toast("¡PARTIDA GUARDADA!", 2); sc.run(function* () { yield SS.wait(1.5); SS.go(() => SS.scenes.credits()); }()); }
    },
    drawFront(sc, ctx) {
      // los compas corren junto a ti
      const list = ["cesar", "jesus", "carlos", "daniel"].filter(c => c !== sc.player.char);
      list.forEach((c, i) => {
        const x = Math.round(sc.player.x - sc.cam.x - 30 - i * 18 + Math.sin(sc.t * 3 + i) * 4), y = Math.round(176 - 24 - sc.cam.y);
        SS.gfx.drawPerson(ctx, SS.gfx.SPECS[c], "run", Math.floor(sc.t * 10 + i) % 4, x, y, 1, 0.9);
      });
    },
  };

  // los textos de cada nivel viven en story.js
  for (const id in LV) Object.assign(LV[id], SS.TEXT.lv[id] || {});

  // =====================================================================
  // FLUJO ENTRE NIVELES
  // =====================================================================
  SS.ACT1 = ["cesar", "jesus", "carlos", "daniel"];
  SS.ACT2 = ["telenovela", "anime", "lucha", "prehistoria", "internet"];
  SS.ACT3 = ["chase", "abandonados", "papelera", "cero", "guardar"];
  SS.parentOf = pid => (LV[pid] && LV[pid].parent) || (pid.startsWith("race_") ? Object.keys(LV).find(k => LV[k].parts && LV[k].parts.includes(pid)) : pid);
  SS.sceneForPart = (pid, free) => {
    if (pid.startsWith("race_")) return () => SS.scenes.drive({ track: pid.slice(5), free });
    return () => new SS.GameLevel(pid, { free });
  };
  SS.startLevel = (id, free) => {
    const L = LV[id];
    let pid = id;
    if (L.parts) {
      const run = SS.save.run;
      const part = !free && run && run.id === id ? run.part || 0 : 0;
      pid = L.parts[part];
      if (!free) SS.save.run = Object.assign({}, run && run.id === id ? run : {}, { id, part });
    } else if (!free && !(SS.save.run && SS.save.run.id === id)) SS.save.run = { id };
    SS.writeSave();
    SS.go(SS.sceneForPart(pid, free));
  };
  SS.completeLevel = (pid, free) => {
    const parentId = SS.parentOf(pid);
    const L = LV[parentId];
    if (L.parts) {
      const idx = L.parts.indexOf(pid);
      if (idx < L.parts.length - 1) {
        if (!free) { SS.save.run = { id: parentId, part: idx + 1 }; SS.writeSave(); }
        SS.go(SS.sceneForPart(L.parts[idx + 1], free));
        return;
      }
    }
    SS.finishLevel(parentId, free);
  };
  SS.finishLevel = (id, free) => {
    const L = LV[id];
    const first = !SS.save.done[id];
    if (!free) {
      SS.save.done[id] = true;
      SS.save.run = null;
      if (L.recruit && !SS.save.party.includes(L.recruit)) { SS.save.party.push(L.recruit); SS.addBond(L.recruit, 1); }
      if (L.lead && first) SS.addBond(L.lead, 1);
    }
    SS.writeSave();
    if (L.next && !free) { SS.save.run = { id: L.next }; SS.writeSave(); SS.startLevel(L.next); return; }
    SS.go(() => SS.scenes.levelDone(id, free, first && !free));
  };
  SS.levelItems = id => {
    const L = LV[id];
    const parts = L.parts ? L.parts.filter(p => LV[p]) : [id];
    let gk = 0, gkGot = 0, ph = 0, phGot = 0;
    for (const pid of parts) {
      const lv = LV[pid].build();
      lv.items.forEach((it, i) => { const iid = it.id || `${it.kind}_${pid}_${i}`; if (it.kind === "gk") { gk++; if (SS.save.got[iid]) gkGot++; } if (it.kind === "photo") { ph++; if (SS.save.got[iid]) phGot++; } });
    }
    return { gk, gkGot, ph, phGot };
  };
})();
