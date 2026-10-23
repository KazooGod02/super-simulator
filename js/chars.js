// SUPER SIMULATOR · el equipo: ataque, especial y habilidad de mundo de cada compa
(() => {
  "use strict";
  const T = SS.T;
  const toast = t => SS.ui.toast(t, 1.6);
  const front = (p, w, h) => ({ x: p.facing > 0 ? p.x + p.w : p.x - w, y: p.cy - h / 2, w, h });

  SS.CHARS = {
    kazoo: {
      name: "KAZOO", face: "kazoo", spec: "kazoo", icons: ["box", "horn", "stone"],
      labels: ["Paquetazo", "Kazoo", "Kazoonita"],
      cd: { attack: 0.3, special: 2.4, ability: 0.65 },
      attack(p, sc) { sc.spawnShot(p, { kind: "box", x: p.cx + p.facing * 6 - 3, y: p.y + 7, vx: p.facing * 260 + p.vx * 0.3, vy: -40, g: 380, life: 0.9, dmg: 1 }); p.doAct("throw"); SS.audio.sfx("throw"); },
      special(p, sc) { p.doAct("kazoo", 0.45); if (SS.save.upgrades.turbo) p.cd.special = 1.5; sc.kazooBlast(p, 64, 2.2); },
      ability(p, sc) {
        if (!SS.save.flags.stone) { toast("Todavía no tienes nada que use ese botón"); SS.audio.sfx("bonk"); return; }
        p.blink(sc, ["F"], SS.save.upgrades.stone2 ? 64 : 48);
      },
    },
    cesar: {
      name: "CÉSAR", face: "cesar", spec: "cesar", icons: ["cursor", "eye", "fist"],
      labels: ["Clic-clic", "¡Disimula!", "Hackear / Mano Derecha"],
      cd: { attack: 0.14, special: 7, ability: 0.4 },
      attack(p, sc) { sc.spawnShot(p, { kind: "cursor", x: p.cx + p.facing * 6 - 3, y: p.y + 8, vx: p.facing * 330, vy: 0, g: 0, life: 0.38, dmg: 0.6 }); p.doAct("throw", 0.1); SS.audio.sfx("blip"); },
      special(p, sc) { p.invis = 3; SS.audio.sfx("blink"); toast("¡DISIMULA!"); sc.fx.burst(p.cx, p.cy, 12, ["#ff7a1a", "#ffffff"], 60, 0, 0.5); },
      ability(p, sc) {
        const o = sc.findObj(p, ["terminal", "lever", "pc"], 30);
        if (o && !o.done) { p.doAct(o.kind === "lever" ? "throw" : "knock", 0.4); if (o.kind === "pc") sc.hackPc(o, p); else sc.activate(o, p); }
        else { toast("Aquí no hay nada que hackear ni jalar"); SS.audio.sfx("bonk"); }
      },
    },
    jesus: {
      name: "JESÚS", face: "jesus", spec: "jesus", icons: ["fist", "taco", "fist"], walkWater: true,
      labels: ["Combo de gym", "Multiplicar Tacos", "Fuerza (rompe paredes)"],
      cd: { attack: 0.36, special: 12, ability: 0.6 },
      attack(p, sc) { p.doAct("punch", 0.16); sc.melee(p, front(p, 20, 18), 2, 170); SS.audio.sfx("hit"); },
      special(p, sc) { sc.healParty(1); SS.audio.sfx("buy"); toast("¡Multiplicar Tacos! +1 vida"); for (let i = 0; i < 6; i++) sc.fx.add({ x: p.cx + SS.rand(-20, 20), y: p.y - 10, vy: -40, life: 0.9, max: 0.9, c: "#ffd23f", s: 3 }); },
      ability(p, sc) {
        p.doAct("punch", 0.3); SS.shake = 4; SS.audio.sfx("break");
        const box = front(p, 26, p.h + 6);
        let broke = false;
        SS.tilesUnder(sc.level, box.x, box.y - 4, box.w, box.h + 8, (c, tx, ty) => { if (c === "B") { sc.level.set(tx, ty, "."); broke = true; sc.fx.burst(tx * T + 8, ty * T + 8, 12, ["#9a8a7a", "#6a5a4a", "#2ee6d6"], 120, 300, 0.7, 3); } return false; });
        sc.melee(p, box, 4, 260);
        if (!broke) sc.fx.burst(box.x + box.w / 2, p.cy, 6, ["#ffffff"], 60, 0, 0.3);
      },
    },
    carlos: {
      name: "CARLOS", face: "carlos", spec: "carlos", icons: ["mega", "mask", "mega"],
      labels: ["Grito", "Larpear", "EL GRITO (rompe vidrios)"],
      cd: { attack: 0.5, special: 9, ability: 1.2 },
      attack(p, sc) {
        p.doAct("shout", 0.3); SS.audio.sfx("hurt");
        sc.scream(p, 70, 1, 0.7);
      },
      special(p, sc) { p.disguise = 4.5; SS.audio.sfx("swap"); toast("Larpeando… nadie te reconoce"); },
      ability(p, sc) {
        p.doAct("shout", 0.6); SS.shake = 6; SS.audio.sfx("zap");
        const lv = sc.level;
        SS.tilesUnder(lv, p.cx - 90, p.cy - 90, 180, 180, (c, tx, ty) => { if (c === "V") { lv.set(tx, ty, "."); sc.fx.burst(tx * T + 8, ty * T + 8, 14, ["#9ad0ff", "#e8f6ff", "#ff4fa3"], 130, 300, 0.7, 2); SS.audio.sfx("break"); } return false; });
        for (const o of sc.level.objects) if (o.kind === "sensor" && !o.done && Math.hypot(o.x + 8 - p.cx, o.y - 12 - p.cy) < 110) sc.activate(o, p);
        sc.scream(p, 100, 2, 1.2, true);
      },
    },
    daniel: {
      name: "DANIEL", face: "daniel", spec: "daniel", icons: ["fist", "bird", "hook"],
      labels: ["Combo", "Pancho", "Greñas-gancho"],
      cd: { attack: 0.2, special: 3, ability: 0.5 },
      attack(p, sc) {
        p.combo = (p.combo % 3) + 1; p.comboT = 0.5;
        p.doAct(p.combo === 2 ? "kazoo" : "punch", 0.15);
        sc.melee(p, front(p, 18, 18), p.combo === 3 ? 2 : 1, p.combo === 3 ? 220 : 80);
        SS.audio.sfx(p.combo === 3 ? "break" : "hit");
      },
      special(p, sc) { sc.spawnShot(p, { kind: "pancho", x: p.cx, y: p.y, vx: p.facing * 200, vy: -150, g: 120, life: 1.4, dmg: 1, pierce: true }); SS.audio.sfx("swap"); toast("¡Pancho, ve!"); },
      ability(p, sc) {
        let best = null, bd = 1e9;
        for (const o of sc.level.objects) if (o.kind === "hook") { const dx = o.x + 8 - p.cx, dy = o.y - p.cy; const d = Math.hypot(dx, dy); if (d < 130 && dy < 10 && d < bd) { bd = d; best = o; } }
        if (!best) { toast("No hay de dónde colgarse"); SS.audio.sfx("bonk"); return; }
        p.zip = { x: best.x + 8 - p.w / 2, y: best.y + 4, t: 0.8 }; p.facing = best.x + 8 > p.cx ? 1 : -1;
        SS.audio.sfx("blink");
      },
    },
    lupe: {
      name: "DOÑA LUPE", face: "lupe", spec: "lupe", icons: ["chancla", "mega", "chancla"],
      labels: ["Chancla", "¡En la casa hablamos!", "Chancla de Dios"],
      cd: { attack: 0.45, special: 10, ability: 4 },
      attack(p, sc) { sc.spawnShot(p, { kind: "chancla", x: p.cx, y: p.y + 6, vx: p.facing * 280, vy: 0, g: 0, life: 1.1, dmg: 3, back: true, pierce: true }); p.doAct("throw"); SS.audio.sfx("throw"); },
      special(p, sc) { SS.audio.sfx("zap"); SS.shake = 6; toast("¡EN LA CASA HABLAMOS!"); for (const e of sc.enemies) if (Math.abs(e.cx - p.cx) < 220) e.stun = 3.5; sc.damageBosses(p, 4, p.cx, 220); },
      ability(p, sc) { for (let i = -2; i <= 2; i++) sc.spawnShot(p, { kind: "chancla", x: p.cx, y: p.y + 4, vx: p.facing * 240, vy: i * 60, g: 0, life: 1, dmg: 3, pierce: true }); SS.audio.sfx("throw"); },
    },
    cero: {
      name: "CERO", face: "cero", spec: "temp", icons: ["cube", "cube", "stone"],
      labels: ["Cubo", "Copia", "Glitch"],
      cd: { attack: 0.3, special: 5, ability: 0.6 },
      attack(p, sc) { sc.spawnShot(p, { kind: "cube", x: p.cx, y: p.y + 6, vx: p.facing * 240, vy: -60, g: 300, life: 1, dmg: 2 }); SS.audio.sfx("glitch"); },
      special(p, sc) { sc.kazooBlast(p, 90, 2.5); },
      ability(p, sc) { p.blink(sc, ["F", "X", "V", "B", "G"], 64); },
    },
    futuro: {
      name: "KAZOO DEL FUTURO", face: "futuro", spec: "futuro", icons: ["box", "horn", "stone"],
      labels: ["Paquetazo doble", "Kazoo turbo", "Kazoonita+"],
      cd: { attack: 0.22, special: 1.4, ability: 0.45 },
      attack(p, sc) { for (const vy of [-80, -20]) sc.spawnShot(p, { kind: "box", x: p.cx, y: p.y + 7, vx: p.facing * 280, vy, g: 380, life: 0.9, dmg: 1 }); p.doAct("throw"); SS.audio.sfx("throw"); },
      special(p, sc) { p.doAct("kazoo", 0.45); sc.kazooBlast(p, 90, 2.5); },
      ability(p, sc) { p.blink(sc, ["F"], 80); },
    },
    pancho: {
      name: "PANCHO", face: "pancho", draw: "parrot", size: [10, 12], flaps: 6, gravity: 0.7, fall: 200, icons: ["bird", "mega", "bird"],
      labels: ["Picotazo", "Grosería", "Vuelo"],
      cd: { attack: 0.25, special: 4, ability: 1 },
      attack(p, sc) { sc.melee(p, front(p, 14, 12), 1, 100); SS.audio.sfx("hit"); },
      special(p, sc) { SS.audio.sfx("glitch"); toast("¡PIIIIIIP! (censurado)"); for (const e of sc.enemies) if (Math.abs(e.cx - p.cx) < 120) e.stun = 2; },
      ability(p) { p.flaps = 0; p.vy = -260; SS.audio.sfx("jump"); },
    },
    nieve: {
      name: "NIEVE", face: "nieve", draw: "husky", size: [16, 12], speed: 1.35, icons: ["fist", "horn", "fist"],
      labels: ["Mordida", "Aullido", "Salto de husky"],
      cd: { attack: 0.3, special: 5, ability: 1 },
      attack(p, sc) { sc.melee(p, front(p, 16, 12), 2, 120); SS.audio.sfx("hit"); },
      special(p, sc) { SS.audio.sfx("kazoo"); toast("¡AUUUUUU!"); sc.kazooBlast(p, 100, 2.5); },
      ability(p) { if (p.onGround) { p.vy = -420; p.vx = p.facing * 200; SS.audio.sfx("jump"); } },
    },
  };
  SS.PARTY_ORDER = ["kazoo", "cesar", "jesus", "carlos", "daniel", "lupe", "cero", "futuro", "pancho", "nieve"];
})();
