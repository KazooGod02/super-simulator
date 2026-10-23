// SUPER SIMULATOR · interfaz: diálogos, menús, HUD, avisos
(() => {
  "use strict";
  const ui = (SS.ui = {});
  const $ = id => document.getElementById(id);
  const el = {
    hud: $("hud"), party: $("party"), hearts: $("hearts"), feria: $("feria"), kaz: $("kaz"), fotos: $("fotos"),
    glitchBar: $("glitchBar"), glitchBox: $("glitchBox"), abil: $("abil"), kazBox: $("kazBox"), todoBox: $("todoBox"), todos: $("todos"),
    dialog: $("dialog"), dlgFace: $("dlgFace"), dlgName: $("dlgName"), dlgText: $("dlgText"),
    menu: $("menu"), card: $("card"), cardTitle: $("cardTitle"), cardSub: $("cardSub"),
    toast: $("toast"), prompt: $("prompt"), hint: $("hint"), panel: $("panel"), title: $("titleLogo"),
    boss: $("bossbar"), bossName: $("bossName"), bossFill: $("bossFill"),
  };
  ui.el = el;
  document.querySelectorAll("canvas[data-icon]").forEach(c => SS.gfx.paintIcon(c, c.dataset.icon));

  // ---------- etiquetas de teclas según el dispositivo ----------
  const LABELS = {
    kb: { left: "←", right: "→", up: "↑", down: "↓", jump: "ESPACIO", attack: "J", special: "K", ability: "L", run: "SHIFT", swap: "Q/E", confirm: "ENTER", pause: "ESC" },
    pad: { left: "◀", right: "▶", up: "▲", down: "▼", jump: "A", attack: "X", special: "Y", ability: "B", run: "RT", swap: "LB/RB", confirm: "A", pause: "START" },
    touch: { left: "◀", right: "▶", up: "▲", down: "▼", jump: "A", attack: "B", special: "Y", ability: "X", run: "auto", swap: "⇄", confirm: "A", pause: "II" },
  };
  ui.k = a => `<kbd>${LABELS[SS.input.lastDevice][a]}</kbd>`;
  ui.fmt = s => s.replace(/\{(\w+)\}/g, (_, a) => ui.k(a));

  // ---------- diálogo ----------
  let dlg = null;
  ui.dialog = lines => { dlg = { lines: lines.map(l => (Array.isArray(l) ? { who: l[0], text: l[1] } : l)), i: 0, chars: 0, blip: 0 }; showLine(); };
  ui.dialogOpen = () => !!dlg;
  function showLine() {
    const L = dlg.lines[dlg.i];
    const who = SS.WHO[L.who] || { name: L.who || "", face: null, color: "#b0a7dc" };
    el.dialog.hidden = false;
    el.dialog.classList.toggle("narr", !who.face);
    el.dialog.classList.toggle("glitchy", !!who.glitch);
    el.dlgName.textContent = SS.caps(who.name);
    el.dlgName.style.color = who.color;
    if (who.face) SS.gfx.drawFace(el.dlgFace, who.face);
    dlg.full = L.text;
    dlg.chars = 0;
    el.dlgText.textContent = "";
  }
  let tapAdvance = false;
  el.dialog.addEventListener("pointerdown", e => { e.preventDefault(); tapAdvance = true; });
  function advanceHit() {
    const t = tapAdvance; tapAdvance = false;
    return t || SS.input.hit("confirm") || SS.input.hit("attack") || SS.input.p2.hit("confirm");
  }

  // ---------- menú ----------
  let menu = null;
  ui.menu = (title, items, opts = {}) => {
    menu = { title, items, opts, sel: 0 };
    menu.sel = Math.max(0, items.findIndex(i => !i.off));
    if (opts.sel !== undefined) menu.sel = opts.sel;
    renderMenu();
  };
  ui.menuOpen = () => !!menu;
  ui.closeMenu = () => { menu = null; el.menu.hidden = true; el.menu.className = ""; };
  ui.refreshMenu = () => { if (menu) renderMenu(); };
  function renderMenu() {
    el.menu.hidden = false;
    el.menu.className = (menu.opts.low ? "low " : "") + (menu.opts.wide ? "wide" : "");
    const label = it => (typeof it.label === "function" ? it.label() : it.label);
    el.menu.innerHTML = (menu.title ? `<h3>${SS.caps(menu.title)}</h3>` : "") + "<ul>" +
      menu.items.map((it, i) => `<li data-i="${i}" class="${i === menu.sel ? "sel" : ""} ${it.off ? "off" : ""}">${label(it)}${it.sub ? `<small>${typeof it.sub === "function" ? it.sub() : it.sub}</small>` : ""}</li>`).join("") +
      "</ul>" + (menu.opts.note ? `<div class="note">${menu.opts.note}</div>` : "");
    el.menu.querySelectorAll("li").forEach(li => li.addEventListener("pointerdown", e => {
      e.preventDefault();
      if (!menu) return;
      menu.sel = +li.dataset.i; renderMenu(); choose();
    }));
    const selEl = el.menu.querySelector("li.sel");
    if (selEl && selEl.scrollIntoView) selEl.scrollIntoView({ block: "nearest" });
  }
  function choose() {
    const it = menu.items[menu.sel];
    if (!it || it.off) { SS.audio.sfx("bonk"); return; }
    SS.audio.sfx("confirm");
    it.action && it.action();
  }
  function menuUpdate() {
    const n = menu.items.length;
    const move = d => { let s = menu.sel; for (let k = 0; k < n; k++) { s = (s + d + n) % n; if (!menu.items[s].off || menu.opts.allowOff) break; } menu.sel = s; SS.audio.sfx("select"); renderMenu(); };
    if (SS.input.hit("up")) move(-1);
    else if (SS.input.hit("down")) move(1);
    else if (SS.input.hit("confirm") || SS.input.hit("attack")) choose();
    else if (SS.input.hit("back") && menu.opts.onBack) { SS.audio.sfx("select"); menu.opts.onBack(); }
  }

  // ---------- pausa ----------
  ui.openPause = () => {
    SS.paused = true;
    SS.audio.sfx("pause");
    const extra = (SS.scene && SS.scene.pauseItems) ? SS.scene.pauseItems() : [];
    const resume = () => { ui.closeMenu(); SS.paused = false; };
    const b = SS.save && SS.save.bonds;
    const note = b ? `Recuerdos: César ${b.cesar}/5 · Jesús ${b.jesus}/5 · Carlos ${b.carlos}/5 · Daniel ${b.daniel}/5<br>Glitchómetro ${Math.round(SS.save.glitch)}% · Feria ${SS.save.feria}` : "";
    ui.menu("PAUSA", [
      { label: "Continuar", action: resume },
      ...extra.map(e => ({ label: e.label, action: () => { resume(); e.action(); } })),
      { label: () => "Música: " + (SS.settings.music ? "sí" : "no"), action: () => { SS.settings.music = !SS.settings.music; SS.writeSettings(); SS.audio.applySettings(); ui.refreshMenu(); } },
      { label: () => "Efectos: " + (SS.settings.sfx ? "sí" : "no"), action: () => { SS.settings.sfx = !SS.settings.sfx; SS.writeSettings(); SS.audio.applySettings(); ui.refreshMenu(); } },
      { label: "Salir al título", sub: "Tu avance se guarda en cada checkpoint", action: () => { resume(); SS.go(() => SS.scenes.title()); } },
    ], { onBack: resume, note });
  };

  // ---------- avisos ----------
  let toastT = 0, cardT = 0;
  ui.toast = (text, dur = 2.2) => { el.toast.innerHTML = ui.fmt(text); el.toast.hidden = false; toastT = dur; };
  ui.prompt = text => { if (!text) { el.prompt.hidden = true; el.prompt._t = null; return; } const key = text + SS.input.lastDevice; if (el.prompt._t !== key) { el.prompt.innerHTML = ui.fmt(text); el.prompt._t = key; } el.prompt.hidden = false; };
  ui.hint = text => { if (!text) { el.hint.hidden = true; el.hint._t = null; return; } const key = text + SS.input.lastDevice; if (el.hint._t !== key) { el.hint.innerHTML = ui.fmt(text); el.hint._t = key; } el.hint.hidden = false; };
  ui.card = (title, sub, dur = 2.5) => { el.cardTitle.textContent = SS.caps(title); el.cardSub.textContent = sub || ""; el.card.hidden = false; el.card.style.animation = "none"; void el.card.offsetWidth; el.card.style.animation = ""; cardT = dur; };
  ui.panel = html => { if (!html) { el.panel.hidden = true; return; } el.panel.innerHTML = html.replace(/<h2>([\s\S]*?)<\/h2>/, (_, t) => "<h2>" + SS.caps(t) + "</h2>"); el.panel.hidden = false; };
  ui.title = on => { el.title.hidden = !on; };
  ui.blocking = () => !!dlg || !!menu;
  ui.bossBar = (name, frac) => {
    if (name === null) { el.boss.hidden = true; return; }
    el.boss.hidden = false;
    if (el.bossName.textContent !== SS.caps(name)) el.bossName.textContent = SS.caps(name);
    el.bossFill.style.width = Math.max(0, Math.min(1, frac)) * 100 + "%";
  };

  ui.clearScene = () => {
    dlg = null; el.dialog.hidden = true;
    ui.closeMenu(); ui.prompt(null); ui.hint(null); ui.panel(null); ui.title(false); ui.bossBar(null);
    el.toast.hidden = true; el.card.hidden = true; toastT = cardT = 0;
    ui.showHud(false);
  };

  // ---------- HUD ----------
  const MAIN = ["kazoo", "cesar", "jesus", "carlos", "daniel"];
  const faceOf = id => (SS.CHARS[id] ? SS.CHARS[id].face : id);
  let slots = [];
  function buildParty() {
    el.party.innerHTML = ""; slots = [];
    const list = MAIN.concat(SS.PARTY_ORDER.filter(c => !MAIN.includes(c) && SS.save.party.includes(c)));
    for (const id of list) {
      const d = document.createElement("div"); d.className = "slot";
      const c = document.createElement("canvas"); c.width = 16; c.height = 16;
      d.append(c); el.party.append(d);
      SS.gfx.drawFace(c, faceOf(id));
      slots.push({ id, d });
    }
  }
  const hearts = [], hearts2 = [];
  for (let i = 0; i < 6; i++) { const c = document.createElement("canvas"); c.width = 10; c.height = 10; SS.gfx.paintIcon(c, "roll"); el.hearts.append(c); hearts.push(c); }
  const sep = document.createElement("span"); sep.className = "p2tag"; sep.textContent = "P2"; el.hearts.append(sep);
  for (let i = 0; i < 6; i++) { const c = document.createElement("canvas"); c.width = 10; c.height = 10; SS.gfx.paintIcon(c, "roll"); c.className = "h2"; el.hearts.append(c); hearts2.push(c); }
  const abil = {};
  ["attack", "special", "ability"].forEach(a => {
    const d = document.createElement("div"); d.className = "ab";
    const c = document.createElement("canvas"); c.width = 12; c.height = 12;
    const cd = document.createElement("div"); cd.className = "cd";
    const k = document.createElement("span"); k.className = "k";
    d.append(c, cd, k); el.abil.append(d);
    abil[a] = { d, cd, k, c };
  });
  ui.showHud = on => { el.hud.hidden = !on; };
  let last = {};
  ui.setHud = h => {
    const s = SS.save;
    const key = (k, v, fn) => { if (last[k] !== v) { last[k] = v; fn(v); } };
    key("partyList", s.party.join(","), () => buildParty());
    key("party", s.party.join(",") + "|" + (h.char || s.active), () => slots.forEach(sl => {
      sl.d.classList.toggle("locked", !s.party.includes(sl.id));
      sl.d.classList.toggle("on", (h.char || s.active) === sl.id);
    }));
    key("hearts", h.hearts + "/" + s.maxHearts, () => hearts.forEach((c, i) => { c.hidden = i >= s.maxHearts; c.classList.toggle("empty", i >= h.hearts); }));
    key("hearts2", h.hearts2 === null || h.hearts2 === undefined ? "x" : h.hearts2 + "/" + s.maxHearts, v => { sep.hidden = v === "x"; hearts2.forEach((c, i) => { c.hidden = v === "x" || i >= s.maxHearts; c.classList.toggle("empty", i >= h.hearts2); }); });
    key("feria", s.feria, v => (el.feria.textContent = v));
    key("kaz", h.gk || "total", v => { el.kaz.textContent = v === "total" ? SS.countGot("gk") : v; });
    key("fotos", SS.countGot("photo"), v => (el.fotos.textContent = v + "/20"));
    key("todos", h.todos || "", v => { el.todoBox.hidden = !v; el.todos.textContent = v; });
    key("glitch", Math.round(s.glitch), v => (el.glitchBar.style.width = Math.min(100, v) + "%"));
    const ch = h.char || s.active;
    key("abilIcons", ch + SS.input.lastDevice, () => {
      const D = SS.CHARS[ch] || SS.CHARS.kazoo;
      ["attack", "special", "ability"].forEach((a, i) => { SS.gfx.paintIcon(abil[a].c, D.icons[i]); abil[a].k.textContent = LABELS[SS.input.lastDevice][a]; abil[a].d.title = D.labels[i]; });
    });
    for (const a of ["attack", "special", "ability"]) {
      const v = h.cd ? h.cd[a] : 0;
      abil[a].cd.style.height = Math.round(SS.clamp(v || 0, 0, 1) * 100) + "%";
    }
    key("stone", ch + !!s.flags.stone, () => abil.ability.d.classList.toggle("locked", ch === "kazoo" && !s.flags.stone));
  };
  ui.resetHud = () => { last = {}; };

  // ---------- actualización por cuadro ----------
  ui.update = dt => {
    if (toastT > 0 && (toastT -= dt) <= 0) el.toast.hidden = true;
    if (cardT > 0 && (cardT -= dt) <= 0) el.card.hidden = true;
    if (menu) { menuUpdate(); return; }
    if (dlg) {
      if (dlg.chars < dlg.full.length) {
        const before = Math.floor(dlg.chars);
        dlg.chars = Math.min(dlg.full.length, dlg.chars + dt * 48);
        const now = Math.floor(dlg.chars);
        if (now !== before) { el.dlgText.textContent = dlg.full.slice(0, now); if ((dlg.blip += now - before) >= 3) { dlg.blip = 0; SS.audio.sfx("blip"); } }
      }
      if (advanceHit()) {
        if (dlg.chars < dlg.full.length) { dlg.chars = dlg.full.length; el.dlgText.textContent = dlg.full; }
        else { dlg.i++; if (dlg.i >= dlg.lines.length) { dlg = null; el.dialog.hidden = true; } else showLine(); }
      }
      return;
    }
    tapAdvance = false;
    if ((SS.input.hit("pause") || SS.input.p2.hit("pause")) && !SS.trans && SS.scene && SS.scene.pausable && !SS.paused) ui.openPause();
  };
})();
