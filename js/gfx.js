// SUPER SIMULATOR · gráficos: todo se dibuja con código, pixel por pixel
(() => {
  "use strict";
  const G = (SS.gfx = {});
  const OUT = "#120f1c";
  G.OUT = OUT;
  const cache = {};
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); x.imageSmoothingEnabled = false; return [c, x]; };
  G.mk = mk;

  // ================= PERSONAS (16x24, mirando a la derecha) =================
  const SPECS = (G.SPECS = {
    kazoo: { skin: "#e0a97e", skinS: "#b57d58", hair: "#1d1712", hairStyle: "short", cap: "#7b4dff", capS: "#4a2aa8", shirt: "#3b5bdb", shirtS: "#2a3f9e", pants: "#2b2b3d", pantsS: "#1c1c29", shoes: "#6b3f22", logo: "#ffd23f", kazoo: true },
    futuro: { skin: "#e0a97e", skinS: "#b57d58", hair: "#f4f4f4", hairStyle: "short", cap: "#2ee6d6", capS: "#159c92", shirt: "#9aa3b5", shirtS: "#6a7286", pants: "#2b2b3d", pantsS: "#1c1c29", shoes: "#2ee6d6", logo: "#ff2bd6", kazoo: true, kazooC: "#2ee6d6", kazooS: "#159c92" },
    kazoo01: { skin: "#f0c9a4", skinS: "#c99a78", hair: "#3a2a1a", hairStyle: "short", cap: "#f4f4f4", capS: "#c9c3dc", shirt: "#ffd23f", shirtS: "#c79a12", pants: "#f4f4f4", pantsS: "#c9c3dc", shoes: "#c79a12", logo: "#ffffff", kazoo: true },
    oozak: { skin: "#b9b1cf", skinS: "#8a82a6", hair: "#f4f4f4", hairStyle: "short", cap: "#2b0b1a", capS: "#14050c", shirt: "#1a1a24", shirtS: "#0c0c14", pants: "#e83b3b", pantsS: "#a4222a", shoes: "#f4f4f4", logo: "#ff2bd6", eye: "#ff2bd6", kazoo: true, kazooC: "#ff2bd6", kazooS: "#a01a88" },
    cesar: { skin: "#e9c3a0", skinS: "#c99a78", hair: "#3b2a20", hairStyle: "messy", headset: true, shirt: "#ff7a1a", shirtS: "#c4550a", pants: "#3a3a4a", pantsS: "#2a2a36", shoes: "#6b3f22" },
    jesus: { skin: "#c98b5e", skinS: "#a46c45", hair: "#2a1a10", hairStyle: "librito", tank: true, shirt: "#2ee6d6", shirtS: "#159c92", pants: "#2b2b3d", pantsS: "#1c1c29", shoes: "#f4f4f4" },
    carlos: { skin: "#e0b08a", skinS: "#bb8a66", hair: "#141018", hairStyle: "short", crown: true, backpack: "#4a2a18", shirt: "#ff4fa3", shirtS: "#b8306f", pants: "#3b5bdb", pantsS: "#2a3f9e", shoes: "#2b2b3d" },
    daniel: { skin: "#d49a6a", skinS: "#ad7548", hair: "#1a1210", hairStyle: "curly", headband: "#e83b3b", shirt: "#6fb7ff", shirtS: "#3d7fc4", pants: "#2b2b3d", pantsS: "#1c1c29", shoes: "#f4f4f4" },
    cesarPro: { skin: "#e9c3a0", skinS: "#c99a78", hair: "#3b2a20", hairStyle: "neat", hairH: "#5a4030", shirt: "#f4f4f4", shirtS: "#c9c5d6", tie: "#e83b3b", pants: "#2b2b3d", pantsS: "#1c1c29", shoes: "#120f1c" },
    jesusPelon: { skin: "#c98b5e", skinS: "#a46c45", hair: "#2a1a10", hairStyle: "bald", tank: true, shirt: "#9a97a6", shirtS: "#77737c", pants: "#4a4659", pantsS: "#3a3846", shoes: "#d8d4e0" },
    carlosCallado: { skin: "#e0b08a", skinS: "#bb8a66", hair: "#141018", hairStyle: "neat", glasses: true, shirt: "#8a8a9a", shirtS: "#6a6a7a", pants: "#4a4659", pantsS: "#3a3846", shoes: "#2b2b3d" },
    danielSonriente: { skin: "#d49a6a", skinS: "#ad7548", hair: "#1a1210", hairStyle: "curly", bigSmile: true, shirt: "#fff3b0", shirtS: "#e8d88a", pants: "#c9a3ff", pantsS: "#a080d8", shoes: "#f4f4f4" },
    lupe: { skin: "#d8a07a", skinS: "#b07d5a", hair: "#4a3a3a", hairStyle: "bun", apron: true, shirt: "#7b4dff", shirtS: "#5532c4", pants: "#7b4dff", pantsS: "#5532c4", shoes: "#c9c3dc" },
    karina: { skin: "#e8b890", skinS: "#c4946c", hair: "#2a1a10", hairStyle: "long", shirt: "#ffd23f", shirtS: "#c79a12", pants: "#3b5bdb", pantsS: "#2a3f9e", shoes: "#f4f4f4" },
    yesenia: { skin: "#e8b890", skinS: "#c4946c", hair: "#8a2a2a", hairStyle: "long", shirt: "#ff8fb1", shirtS: "#d0607f", pants: "#2b2b3d", pantsS: "#1c1c29", shoes: "#ff4fa3" },
    villana: { skin: "#e8c0a0", skinS: "#c49a7a", hair: "#120f1c", hairStyle: "big", shirt: "#e83b3b", shirtS: "#a4222a", pants: "#e83b3b", pantsS: "#a4222a", shoes: "#120f1c", lips: true },
    senpai: { skin: "#f0d0b0", skinS: "#c8a888", hair: "#e8e8ff", hairStyle: "spiky", shirt: "#1a1a24", shirtS: "#0c0c14", pants: "#1a1a24", pantsS: "#0c0c14", shoes: "#e83b3b", eye: "#2ee6d6" },
    hijo: { skin: "#c98b5e", skinS: "#a46c45", hair: "#2a1a10", hairStyle: "none", mask: "#ffd23f", maskS: "#e83b3b", tank: true, shirt: "#c98b5e", shirtS: "#a46c45", pants: "#e83b3b", pantsS: "#a4222a", shoes: "#ffd23f" },
    casero: { skin: "#c98b5e", skinS: "#a46c45", hair: "#3a2a20", hairStyle: "bald", mustache: true, mask: "#2ee6d6", maskS: "#3b5bdb", shirt: "#3b5bdb", shirtS: "#2a3f9e", pants: "#3b5bdb", pantsS: "#2a3f9e", shoes: "#2b2b3d" },
    profe: { skin: "#d8a07a", skinS: "#b07d5a", hair: "#5a4a3a", hairStyle: "bald", glasses: true, mustache: true, shirt: "#8a5a2e", shirtS: "#6b3f22", pants: "#4a4659", pantsS: "#3a3846", shoes: "#2b2b3d" },
    prefecto: { skin: "#c98b5e", skinS: "#a46c45", hair: "#1d1712", hairStyle: "neat", cap: "#3b5bdb", capS: "#2a3f9e", shirt: "#e8e4dc", shirtS: "#bdb7aa", pants: "#2b2b3d", pantsS: "#1c1c29", shoes: "#120f1c" },
    testigo: { skin: "#e0b08a", skinS: "#bb8a66", hair: "#3a2a20", hairStyle: "neat", shirt: "#f4f4f4", shirtS: "#c9c5d6", tie: "#2b2b3d", pants: "#2b2b3d", pantsS: "#1c1c29", shoes: "#120f1c" },
    extra: { skin: "#e8c0a0", skinS: "#c49a7a", hair: "#120f1c", hairStyle: "neat", shirt: "#2b2b3d", shirtS: "#1c1c29", tie: "#e83b3b", pants: "#2b2b3d", pantsS: "#1c1c29", shoes: "#120f1c", mustache: true },
    ninja: { skin: "#f0d0b0", skinS: "#c8a888", hair: "#1a1a24", hairStyle: "none", mask: "#1a1a24", maskS: "#e83b3b", shirt: "#1a1a24", shirtS: "#0c0c14", pants: "#1a1a24", pantsS: "#0c0c14", shoes: "#1a1a24" },
    luchador: { skin: "#c98b5e", skinS: "#a46c45", hair: "#2a1a10", hairStyle: "none", mask: "#ff4fa3", maskS: "#7b4dff", tank: true, shirt: "#c98b5e", shirtS: "#a46c45", pants: "#7b4dff", pantsS: "#5532c4", shoes: "#ff4fa3" },
    poli: { skin: "#c98b5e", skinS: "#a46c45", hair: "#1d1712", hairStyle: "short", cap: "#2a3f9e", capS: "#1c2a6e", shirt: "#3b5bdb", shirtS: "#2a3f9e", pants: "#1c1c29", pantsS: "#120f1c", shoes: "#120f1c" },
    cuquita: { skin: "#d8a07a", skinS: "#b07d5a", hair: "#5a3a2a", hairStyle: "rollers", rollers: "#ff9ec7", shirt: "#ff8fb1", shirtS: "#d0607f", pants: "#ff8fb1", pantsS: "#d0607f", shoes: "#f4f4f4" },
    beto: { skin: "#c98b5e", skinS: "#a46c45", hair: "#3a2a20", hairStyle: "bald", mustache: true, shirt: "#e8e4dc", shirtS: "#bdb7aa", pants: "#4a5a7a", pantsS: "#36435c", shoes: "#3a2a20" },
    kevin: { skin: "#e0b08a", skinS: "#bb8a66", hair: "#2a1a10", hairStyle: "messy", shirt: "#2ee6a0", shirtS: "#1fa874", pants: "#3b5bdb", pantsS: "#2a3f9e", shoes: "#f4f4f4" },
    temp: { skin: "#a29eb3", skinS: "#85819a", hair: "#85819a", hairStyle: "none", shirt: "#7c788c", shirtS: "#615d74", pants: "#5e5a6e", pantsS: "#4a4659", shoes: "#3d3a4a", eye: "#120f1c", noMouth: true },
  });
  for (const k in SPECS) SPECS[k].id = k;

  function personParts(s, pose, f) {
    const P = [];
    const add = (x, y, w, h, c, detail) => P.push([x, y, w, h, c, detail]);
    let bob = 0, bl = [0, 0], fl = [0, 0], armF = "down", sw = 0;
    if (pose === "idle") bob = f % 2;
    else if (pose === "run" || pose === "walk") {
      const R = [[-2, 1, 2, 0, 0], [0, 0, 0, 1, -1], [2, 0, -2, 1, 0], [0, 1, 0, 0, -1]][f % 4];
      bl = [R[0], R[1]]; fl = [R[2], R[3]]; bob = R[4]; sw = f % 4 < 2 ? 1 : -1;
    } else if (pose === "jump") { bl = [-1, 2]; fl = [2, 1]; armF = "up"; }
    else if (pose === "fall") { bl = [-1, 0]; fl = [1, 1]; armF = "out"; }
    else if (pose === "throw" || pose === "punch") { armF = "throw"; fl = [1, 0]; }
    else if (pose === "kazoo" || pose === "shout") { armF = "mouth"; }
    else if (pose === "hurt") { bob = -1; armF = "up"; bl = [-1, 1]; fl = [1, 1]; }
    else if (pose === "knock") { armF = f % 2 ? "out" : "throw"; }
    else if (pose === "hang") { armF = "up"; bl = [0, 2]; fl = [0, 2]; }
    const y = bob;
    const armB = s.tank ? s.skinS : s.shirtS, armFc = s.tank ? s.skin : s.shirt;
    if (s.backpack) { add(2, 10 + y, 3, 7, s.backpack); }
    add(5 - sw, 11 + y, 2, 5, armB);
    add(5 - sw, 16 + y, 2, 1, s.skinS, 1);
    const leg = (bx, d, col) => { add(bx + d[0], 17, 3, 5 - d[1], col); add(bx + d[0], 22 - d[1], 4, 2, s.shoes); };
    leg(5, bl, s.pantsS);
    leg(8, fl, s.pants);
    add(4, 10 + y, 8, 8, s.shirt);
    add(4, 10 + y, 1, 8, s.shirtS, 1);
    if (s.tank) { add(5, 10 + y, 2, 2, s.skin, 1); add(10, 10 + y, 2, 2, s.skin, 1); }
    if (s.backpack) add(6, 10 + y, 1, 7, s.backpack, 1);
    if (s.apron) add(7, 11 + y, 5, 7, "#f4f4f4", 1);
    if (s.logo) add(9, 12 + y, 2, 2, s.logo, 1);
    if (s.tie) { add(8, 10 + y, 3, 1, "#ffffff", 1); add(9, 11 + y, 1, 6, s.tie, 1); }
    add(5, 2 + y, 7, 8, s.skin);
    add(12, 6 + y, 1, 1, s.skin);
    add(5, 2 + y, 1, 8, s.skinS, 1);
    add(7, 6 + y, 1, 2, s.skinS, 1);
    add(10, 5 + y, 1, 2, s.eye || OUT, 1);
    if (s.bigSmile) { add(9, 8 + y, 4, 1, "#6a2a2a", 1); add(10, 8 + y, 2, 1, "#ffffff", 1); add(9, 7 + y, 1, 1, "#6a2a2a", 1); }
    else if (s.lips) add(10, 8 + y, 2, 1, "#e83b3b", 1);
    else if (!s.kazoo && !s.noMouth) add(10, 8 + y, 2, 1, "#6a2a2a", 1);
    const H = s.hair;
    switch (s.hairStyle) {
      case "short": add(5, 1 + y, 6, 2, H); add(5, 3 + y, 2, 4, H, 1); break;
      case "neat": add(5, 1 + y, 7, 2, H); add(5, 3 + y, 2, 3, H, 1); add(9, 1 + y, 2, 1, s.hairH || H, 1); break;
      case "messy": add(5, 1 + y, 7, 2, H); add(6, 0 + y, 1, 1, H); add(9, 0 + y, 1, 1, H); add(4, 3 + y, 2, 5, H); break;
      case "rollers": add(5, 1 + y, 7, 3, H); add(4, 3 + y, 2, 5, H); add(5, 0 + y, 2, 1, s.rollers, 1); add(8, 0 + y, 2, 1, s.rollers, 1); add(11, 1 + y, 1, 2, s.rollers, 1); break;
      case "bald": add(7, 3 + y, 2, 1, "#f6d2b0", 1); add(5, 5 + y, 1, 3, H, 1); break;
      case "librito": add(4, 0 + y, 9, 3, H); add(3, 2 + y, 3, 6, H); add(11, 3 + y, 2, 2, H); add(8, 0 + y, 1, 2, "#5b3a22", 1); break;
      case "curly": add(4, 1 + y, 8, 3, H); add(5, 0 + y, 1, 1, H); add(7, 0 + y, 1, 1, H); add(9, 0 + y, 1, 1, H); add(3, 3 + y, 3, 5, H); add(6, 1 + y, 1, 1, "#3d2a20", 1); add(9, 2 + y, 1, 1, "#3d2a20", 1); break;
      case "spiky": add(4, 1 + y, 9, 3, H); add(5, 0 + y, 1, 1, H); add(8, 0 + y, 2, 1, H); add(12, 0 + y, 2, 2, H); add(3, 2 + y, 3, 5, H); add(12, 3 + y, 2, 2, H); break;
      case "bun": add(5, 1 + y, 7, 2, H); add(2, 1 + y, 4, 4, H); add(5, 3 + y, 2, 3, H, 1); break;
      case "long": add(5, 1 + y, 7, 2, H); add(3, 2 + y, 3, 11, H); add(11, 2 + y, 1, 3, H, 1); break;
      case "big": add(4, 0 + y, 9, 3, H); add(2, 1 + y, 4, 13, H); add(11, 2 + y, 2, 4, H); break;
      default: break;
    }
    if (s.mask) { add(5, 1 + y, 7, 7, s.mask); add(9, 4 + y, 3, 2, "#ffffff", 1); add(10, 5 + y, 1, 1, s.eye || OUT, 1); add(6, 2 + y, 1, 5, s.maskS, 1); add(5, 1 + y, 7, 1, s.maskS, 1); }
    if (s.cap) {
      add(6, 0 + y, 5, 1, s.cap); add(5, 1 + y, 7, 2, s.cap); add(10, 3 + y, 5, 1, s.capS);
      add(8, 1 + y, 2, 1, "#ffffff", 1); add(5, 3 + y, 2, 3, H, 1);
    }
    if (s.crown) { add(5, 0 + y, 7, 2, "#ffcf3a"); add(8, 0 + y, 1, 1, "#e83b3b", 1); add(10, 1 + y, 1, 1, "#5cc8ff", 1); }
    if (s.headband) { add(5, 3 + y, 7, 1, s.headband, 1); add(3, 3 + y, 2, 1, s.headband); add(2, 4 + y, 2, 1, s.headband); }
    if (s.headset) { add(5, 0 + y, 7, 1, "#9aa3b5"); add(4, 5 + y, 2, 3, "#e83b3b"); add(11, 8 + y, 2, 1, "#9aa3b5", 1); }
    if (s.glasses) { add(9, 4 + y, 4, 3, OUT, 1); add(10, 5 + y, 2, 1, "#bfe3ff", 1); }
    if (s.mustache) add(10, 7 + y, 3, 1, H, 1);
    if (s.kazoo) {
      const kc = s.kazooC || "#ffd23f", ks = s.kazooS || "#c79a12";
      add(11, 7 + y, 4, 2, kc); add(11, 8 + y, 4, 1, ks, 1); add(15, 6 + y, 1, 4, kc);
    }
    const a = armFc, hand = s.skin;
    if (armF === "down") { add(8 + sw, 11 + y, 2, 5, a); add(8 + sw, 16 + y, 2, 1, hand); }
    else if (armF === "up") { add(9, 6 + y, 2, 5, a); add(9, 5 + y, 2, 1, hand); }
    else if (armF === "out") { add(9, 11 + y, 4, 2, a); add(13, 11 + y, 1, 2, hand); }
    else if (armF === "throw") { add(9, 11 + y, 5, 2, a); add(14, 11 + y, 2, 2, hand); }
    else if (armF === "mouth") { add(9, 10 + y, 2, 3, a); add(10, 9 + y, 2, 1, hand); }
    if (pose === "shout") add(12, 8 + y, 2, 2, "#6a2a2a", 1);
    return P;
  }

  G.person = (spec, pose, f) => {
    const key = "p:" + spec.id + ":" + pose + ":" + f;
    if (cache[key]) return cache[key];
    const [c, x] = mk(16, 24);
    const parts = personParts(spec, pose, f);
    x.fillStyle = OUT;
    for (const p of parts) if (!p[5]) x.fillRect(p[0] - 1, p[1] - 1, p[2] + 2, p[3] + 2);
    for (const p of parts) { x.fillStyle = p[4]; x.fillRect(p[0], p[1], p[2], p[3]); }
    cache[key] = c;
    return c;
  };
  G.drawPerson = (ctx, spec, pose, f, x, y, facing, alpha, scale = 1) => {
    if (typeof spec === "string") spec = SPECS[spec];
    const img = G.person(spec, pose, f);
    x = Math.round(x); y = Math.round(y);
    if (alpha !== undefined) ctx.globalAlpha = alpha;
    const w = 16 * scale, h = 24 * scale;
    if (facing < 0) { ctx.save(); ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, w, h); ctx.restore(); }
    else ctx.drawImage(img, x, y, w, h);
    ctx.globalAlpha = 1;
  };

  // Pancho (loro) y Nieve (husky): personajes que no son personas
  G.parrot = (ctx, x, y, f, facing, scale = 1) => {
    const [c, X] = cacheDraw("parrot" + (f % 2), 16, 16, X => {
      const up = f % 2;
      X.fillStyle = OUT; X.fillRect(4, 3, 9, 10); X.fillRect(11, 5, 4, 4); X.fillRect(2, 11, 5, 4);
      X.fillStyle = "#2ea84a"; X.fillRect(5, 4, 7, 8); X.fillStyle = "#1f7a34"; X.fillRect(3, 12, 3, 2);
      X.fillStyle = "#ffd23f"; X.fillRect(12, 6, 2, 2); X.fillStyle = "#e83b3b"; X.fillRect(9, 4, 3, 2);
      X.fillStyle = "#ffffff"; X.fillRect(9, 6, 2, 2); X.fillStyle = OUT; X.fillRect(10, 6, 1, 1);
      X.fillStyle = "#5cc8ff"; X.fillRect(5, up ? 4 : 8, 4, 3);
      X.fillStyle = "#ff7a1a"; X.fillRect(7, 12, 1, 3); X.fillRect(9, 12, 1, 3);
    });
    flipDraw(ctx, c, x, y, facing, scale);
  };
  G.husky = (ctx, x, y, f, facing, scale = 1) => {
    const [c] = cacheDraw("husky" + (f % 4), 20, 16, X => {
      const l = [[0, 2], [1, 1], [2, 0], [1, 1]][f % 4];
      X.fillStyle = OUT; X.fillRect(2, 5, 14, 7); X.fillRect(12, 1, 7, 8); X.fillRect(0, 3, 4, 3);
      X.fillStyle = "#f4f4f4"; X.fillRect(3, 6, 12, 5); X.fillRect(13, 2, 5, 6);
      X.fillStyle = "#9aa3b5"; X.fillRect(3, 6, 10, 2); X.fillRect(13, 2, 5, 2); X.fillRect(1, 4, 2, 1);
      X.fillStyle = "#9aa3b5"; X.fillRect(13, 0, 2, 2); X.fillRect(16, 0, 2, 2);
      X.fillStyle = "#5cc8ff"; X.fillRect(15, 4, 1, 1); X.fillStyle = OUT; X.fillRect(18, 5, 1, 1);
      X.fillStyle = OUT; X.fillRect(4 + l[0], 11, 2, 4); X.fillRect(12 - l[1], 11, 2, 4);
      X.fillStyle = "#f4f4f4"; X.fillRect(4 + l[0], 11, 1, 3); X.fillRect(12 - l[1], 11, 1, 3);
    });
    flipDraw(ctx, c, x, y, facing, scale);
  };
  function cacheDraw(key, w, h, fn) { if (!cache[key]) { const [c, x] = mk(w, h); fn(x); cache[key] = [c, x]; } return cache[key]; }
  function flipDraw(ctx, c, x, y, facing, scale = 1) {
    x = Math.round(x); y = Math.round(y);
    const w = c.width * scale, h = c.height * scale;
    if (facing < 0) { ctx.save(); ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(c, 0, 0, w, h); ctx.restore(); }
    else ctx.drawImage(c, x, y, w, h);
  }
  G.flipDraw = flipDraw;
  G.cacheDraw = cacheDraw;

  // ================= CARAS 16x16 (mismo motor que el hub de Kazoo Studios) =================
  const SH = { k: OUT, e: "#120f1c", g: "#9aa3b5", r: "#e83b3b", y: "#ffd23f", w: "#f4f4f4", b: "#5cc8ff", p: "#8a5a9e", d: "#6b3f22", c: "#7b4dff", t: "#2b2f3a" };
  const KAZOO_ART = { 2: ".....cccccc.....", 3: "....cccwwccc....", 4: "....cccccccc....", 5: "...cccccccccc...", 6: "....hh....hh....", 7: "....h......h....", 11: ".......yyyyyy...", 14: "..........ww....", 15: "..........ww...." };
  const LONG = { 2: ".....hhhhhh.....", 3: "....hhhhhhhh....", 4: "...hhhhhhhhhh...", 5: "...hh......hh...", 6: "...h........h...", 7: "...h........h...", 8: "...h........h...", 9: "...h........h...", 10: "...h........h...", 11: "...h........h...", 12: "...h........h..." };
  const FACES = {
    kazoo: { art: KAZOO_ART, pal: { s: "#d9a27a", S: "#b07d5a", h: "#1d1712", m: "#6a2a2a", a: "#3b5bdb", A: "#2a3f9e" } },
    futuro: { art: KAZOO_ART, pal: { s: "#d9a27a", S: "#b07d5a", h: "#f4f4f4", m: "#6a2a2a", a: "#9aa3b5", A: "#6a7286", c: "#2ee6d6", y: "#2ee6d6", w: "#ff2bd6" } },
    kazoo01: { art: KAZOO_ART, pal: { s: "#f0c9a4", S: "#c99a78", h: "#3a2a1a", m: "#6a2a2a", a: "#ffd23f", A: "#c79a12", c: "#f4f4f4", w: "#ffd23f" } },
    oozak: { art: KAZOO_ART, pal: { s: "#b9b1cf", S: "#8a82a6", h: "#f4f4f4", m: "#3a1030", a: "#1a1a24", A: "#0c0c14", c: "#2b0b1a", y: "#ff2bd6", w: "#ff2bd6", e: "#ff2bd6" } },
    cesar: { art: { 1: "....gggggggg....", 2: "...gh.hhh.hhg...", 3: "...ghhhhhhhhg...", 4: "...ghhhhhhhhg...", 5: "...ghhhhhhhhg...", 6: "..rrhh.hh..hrr..", 7: "..rr........rr..", 8: "..rr........rr..", 9: "..rr..p..p..rr..", 10: "..g.............", 11: "..ggggw........." }, pal: { s: "#e9c3a0", S: "#c99a78", h: "#3b2a20", m: "#7a2e2e", a: "#ff7a1a", A: "#c4550a" } },
    cesarPro: { art: { 2: ".....hhhhhh.....", 3: "....hhhhhhhh....", 4: "....hhhhhhhH....", 5: "....hhhhhh......", 13: "...www....www...", 14: ".wwwwwwrrwwwwww.", 15: ".wwwwwwrrwwwwww." }, pal: { s: "#e9c3a0", S: "#c99a78", h: "#3b2a20", H: "#5a4030", m: "#7a2e2e", a: "#f4f4f4", A: "#c9c5d6" } },
    jesus: { art: { 1: "...hhhhhhhhhh...", 2: "..hhhhhhhhhhhh..", 3: "..hhhhhHHhhhhh..", 4: "..hhhhh..hhhhh..", 5: "..hhhh....hhhh..", 6: "..hhh......hhh..", 7: "..hh........hh..", 8: "..hh........hh..", 13: "...sss....sss...", 14: "..sss......sss..", 15: ".sss........sss." }, pal: { s: "#c98b5e", S: "#a46c45", h: "#2a1a10", H: "#5b3a22", m: "#5a2418", a: "#2ee6d6", A: "#159c92" } },
    jesusPelon: { art: { 4: "....swssssss....", 13: "...sss....sss...", 14: "..sss......sss..", 15: ".sss........sss." }, pal: { s: "#c98b5e", S: "#a46c45", h: "#2a1a10", m: "#5a2418", a: "#9a97a6", A: "#77737c", w: "#f6d2b0" } },
    carlos: { art: { 1: "....y.y..y.y....", 2: "....yyyyyyyy....", 3: "....yyryybyy....", 4: "....hhhhhhhh....", 5: "....hhhhhhhh....", 6: "....h......h....", 11: "......mmmm......", 12: ".......mm.......", 14: "....d......d....", 15: "....d......d...." }, pal: { s: "#e0b08a", S: "#bb8a66", h: "#141018", m: "#5a1020", a: "#ff4fa3", A: "#b8306f", y: "#ffcf3a", d: "#4a2a18" } },
    carlosCallado: { art: { 3: ".....hhhhhh.....", 4: "....hhhhhhhh....", 5: "....hhhhhhhh....", 6: "....h......h....", 8: ".....ggg.ggg....", 14: "....d......d....", 15: "....d......d...." }, pal: { s: "#e0b08a", S: "#bb8a66", h: "#141018", m: "#5a1020", a: "#8a8a9a", A: "#6a6a7a", g: "#120f1c", d: "#4a4659" } },
    daniel: { art: { 0: "....h.hh.hh.h...", 1: "...hhHhhHhhHh...", 2: "..hHhhHhhHhhHh..", 3: "..hhHhhHhhHhhh..", 4: "..rrrrrrrrrrrrr.", 5: "..hhhhhhhhhhh.rr", 6: "..hh......hh.rr.", 7: "..h..........r..", 10: "..........w....." }, pal: { s: "#d49a6a", S: "#ad7548", h: "#1a1210", H: "#3d2a20", m: "#5a2418", a: "#6fb7ff", A: "#3d7fc4" } },
    danielSonriente: { art: { 0: "....h.hh.hh.h...", 1: "...hhHhhHhhHh...", 2: "..hHhhHhhHhhHh..", 3: "..hhHhhHhhHhhh..", 4: "..hhhhhhhhhhhh..", 5: "..hhhhhhhhhhhh..", 6: "..hh......hh....", 7: "..h..e....e.....", 8: "......S..S......", 10: ".....m....m.....", 11: "......mmmm......" }, pal: { s: "#d49a6a", S: "#ad7548", h: "#1a1210", H: "#3d2a20", m: "#5a2418", a: "#fff3b0", A: "#e8d88a" } },
    lupe: { art: { 0: "......hhhh......", 1: ".....hhhhhh.....", 2: "....hhhhhhhh....", 3: "...hhhhhhhhhh...", 4: "...hh......hh...", 14: "....wwwwwwww....", 15: "....wwwwwwww...." }, pal: { s: "#d8a07a", S: "#b07d5a", h: "#4a3a3a", m: "#8a2a3a", a: "#7b4dff", A: "#5532c4" } },
    karina: { art: LONG, pal: { s: "#e8b890", S: "#c4946c", h: "#2a1a10", m: "#c0392b", a: "#ffd23f", A: "#c79a12" } },
    yesenia: { art: LONG, pal: { s: "#e8b890", S: "#c4946c", h: "#8a2a2a", m: "#e83b3b", a: "#ff8fb1", A: "#d0607f" } },
    villana: { art: Object.assign({}, LONG, { 1: "....hhhhhhhh....", 2: "...hhhhhhhhhh...", 3: "..hhhhhhhhhhhh..", 4: "..hhhhhhhhhhhh..", 5: "..hh........hh..", 11: ".......rr......." }), pal: { s: "#e8c0a0", S: "#c49a7a", h: "#120f1c", m: "#e83b3b", a: "#e83b3b", A: "#a4222a" } },
    senpai: { art: { 0: "...h..h..h..h...", 1: "...hh.hh.hh.hh..", 2: "..hhhhhhhhhhhh..", 3: "..hhhhhhhhhhhh..", 4: "...hhhhhhhhh....", 5: "....h.....h....." }, pal: { s: "#f0d0b0", S: "#c8a888", h: "#e8e8ff", m: "#6a2a2a", a: "#1a1a24", A: "#0c0c14", e: "#2ee6d6" } },
    hijo: { art: { 3: ".....rrrrrr.....", 4: "....yyyyyyyy....", 5: "...yyrryyrryy...", 6: "...yyyyyyyyyy...", 7: "...yyyyyyyyyy...", 8: "...yyw.yw.yyy...", 9: "...yyyyyyyyyy...", 10: "....yyyyyyyy....", 13: "...sss....sss...", 14: "..sss......sss..", 15: ".sss........sss." }, pal: { s: "#c98b5e", S: "#a46c45", h: "#2a1a10", m: "#5a2418", a: "#e83b3b", A: "#a4222a" } },
    casero: { art: { 5: "......w.........", 10: "......hhhh......", 11: ".......mm......." }, pal: { s: "#c98b5e", S: "#a46c45", h: "#3a2a20", m: "#5a2418", a: "#3b5bdb", A: "#2a3f9e", w: "#f6d2b0" } },
    profe: { art: { 5: "......w.........", 8: ".....kgkkgk.....", 10: "......hhhh......" }, pal: { s: "#d8a07a", S: "#b07d5a", h: "#5a4a3a", m: "#5a2418", a: "#8a5a2e", A: "#6b3f22", g: "#bfe3ff", w: "#f6d2b0" } },
    cuquita: { art: { 1: "....p.p..p.p....", 2: "....hhhhhhhh....", 3: "...hhhhhhhhhh...", 4: "...hh......hh...", 5: "...h........h...", 14: "..a.a.a..a.a.a..", 15: ".a.a.a.aa.a.a.a." }, pal: { s: "#d8a07a", S: "#b07d5a", h: "#5a3a2a", m: "#8a2a3a", a: "#ff8fb1", A: "#d0607f", p: "#ff9ec7" } },
    beto: { art: { 5: "......w.........", 10: "......hhhh......", 11: ".......mm......." }, pal: { s: "#c98b5e", S: "#a46c45", h: "#3a2a20", m: "#5a2418", a: "#e8e4dc", A: "#bdb7aa", w: "#f6d2b0" } },
    kevin: { art: { 2: ".....cccccc.....", 3: "....cccccccc....", 4: "....cccccccccc..", 5: "....hhhhhhhh....", 6: "....h......h...." }, pal: { s: "#e0b08a", S: "#bb8a66", h: "#2a1a10", m: "#6a2a2a", a: "#2ee6a0", A: "#1fa874", c: "#2b2b3d" } },
  };
  function buildFace(art, blink) {
    const g = Array.from({ length: 16 }, () => Array(16).fill(null));
    const set = (c, r, v) => { if (r >= 0 && r < 16 && c >= 0 && c < 16) g[r][c] = v; };
    for (let r = 4; r <= 12; r++) for (let c = 4; c <= 11; c++) { if ((r === 4 || r === 12) && (c === 4 || c === 11)) continue; set(c, r, "s"); }
    set(3, 7, "s"); set(3, 8, "s"); set(12, 7, "s"); set(12, 8, "s");
    set(5, 7, "h"); set(6, 7, "h"); set(9, 7, "h"); set(10, 7, "h");
    set(6, 8, blink ? "S" : "e"); set(9, 8, blink ? "S" : "e");
    set(7, 10, "S"); set(7, 11, "m"); set(8, 11, "m");
    for (let c = 6; c <= 9; c++) set(c, 13, "S");
    for (let c = 3; c <= 5; c++) set(c, 13, "a");
    for (let c = 10; c <= 12; c++) set(c, 13, "a");
    for (let r = 14; r <= 15; r++) for (let c = 1; c <= 14; c++) set(c, r, "a");
    set(7, 14, "S"); set(8, 14, "S"); set(1, 15, "A"); set(14, 15, "A");
    for (const [row, line] of Object.entries(art)) for (let c = 0; c < 16; c++) { const ch = line[c]; if (ch && ch !== ".") set(c, +row, ch); }
    const out = g.map(r => r.slice());
    for (let r = 0; r < 16; r++) for (let c = 0; c < 16; c++) {
      if (g[r][c]) continue;
      if ([[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dc, dr]) => g[r + dr] && g[r + dr][c + dc])) out[r][c] = "k";
    }
    return out;
  }
  G.drawFace = (cv, id, blink) => {
    const x = cv.getContext("2d");
    x.imageSmoothingEnabled = false;
    x.clearRect(0, 0, 16, 16);
    if (id === "cero") {
      const grid = buildFace({ 2: ".....hhhhhh.....", 3: "....hhhhhhhh...." }, false);
      for (let r = 0; r < 16; r++) for (let c = 0; c < 16; c++) {
        const v = grid[r][c]; if (!v) continue;
        x.fillStyle = v === "k" ? OUT : ((r >> 1) + (c >> 1)) % 2 ? "#ff2bd6" : "#1a0f2a";
        x.fillRect(c, r, 1, 1);
      }
      x.fillStyle = "#fff"; x.fillRect(6, 8, 1, 1); x.fillRect(9, 8, 1, 1);
      return;
    }
    if (id === "pancho") { x.fillStyle = "#2a2254"; x.fillRect(0, 0, 16, 16); G.parrot(x, 0, 0, 0, 1); return; }
    if (id === "nieve") { x.fillStyle = "#2a2254"; x.fillRect(0, 0, 16, 16); G.husky(x, -4, 2, 0, 1); return; }
    const F = FACES[id];
    if (!F) return;
    const grid = buildFace(F.art, blink);
    const pal = Object.assign({}, SH, F.pal);
    for (let r = 0; r < 16; r++) for (let c = 0; c < 16; c++) { const v = grid[r][c]; if (!v) continue; x.fillStyle = pal[v] || "#ff00ff"; x.fillRect(c, r, 1, 1); }
  };

  // ================= ÍCONOS =================
  const ICONS = {
    coin(x) { x.fillStyle = OUT; x.fillRect(1, 0, 6, 8); x.fillRect(0, 1, 8, 6); x.fillStyle = "#ffd23f"; x.fillRect(1, 1, 6, 6); x.fillStyle = "#c79a12"; x.fillRect(2, 2, 4, 4); x.fillStyle = "#ffe98a"; x.fillRect(3, 2, 2, 4); },
    gk(x) { x.fillStyle = OUT; x.fillRect(0, 2, 9, 5); x.fillRect(8, 0, 4, 8); x.fillStyle = "#ffd23f"; x.fillRect(1, 3, 8, 3); x.fillRect(9, 1, 2, 6); x.fillStyle = "#fff3b0"; x.fillRect(2, 3, 6, 1); x.fillStyle = "#c79a12"; x.fillRect(1, 5, 8, 1); },
    photo(x) { x.fillStyle = OUT; x.fillRect(0, 0, 10, 10); x.fillStyle = "#f4f4f4"; x.fillRect(1, 1, 8, 8); x.fillStyle = "#6fb7ff"; x.fillRect(2, 2, 6, 4); x.fillStyle = "#ffd23f"; x.fillRect(3, 3, 2, 2); x.fillStyle = "#2ee6a0"; x.fillRect(2, 5, 6, 1); },
    roll(x) { x.fillStyle = OUT; x.fillRect(1, 0, 8, 10); x.fillRect(0, 1, 10, 8); x.fillStyle = "#f4f4f4"; x.fillRect(1, 1, 8, 8); x.fillStyle = "#c9c3dc"; x.fillRect(1, 7, 8, 2); x.fillStyle = "#b0a7dc"; x.fillRect(4, 3, 2, 2); x.fillStyle = OUT; x.fillRect(4, 3, 1, 1); },
    box(x) { x.fillStyle = OUT; x.fillRect(0, 1, 12, 10); x.fillStyle = "#c79a6a"; x.fillRect(1, 2, 10, 8); x.fillStyle = "#e8d7a8"; x.fillRect(5, 2, 2, 8); x.fillStyle = "#a47a4c"; x.fillRect(1, 2, 10, 2); },
    horn(x) { x.fillStyle = OUT; x.fillRect(0, 3, 8, 6); x.fillRect(7, 1, 5, 10); x.fillStyle = "#ffd23f"; x.fillRect(1, 4, 7, 4); x.fillRect(8, 2, 3, 8); x.fillStyle = "#fff3b0"; x.fillRect(2, 4, 5, 1); },
    stone(x) { x.fillStyle = OUT; x.fillRect(2, 0, 8, 12); x.fillRect(0, 2, 12, 8); x.fillStyle = "#ff2bd6"; x.fillRect(2, 1, 8, 10); x.fillRect(1, 2, 10, 8); x.fillStyle = "#ffd23f"; x.fillRect(3, 3, 3, 3); x.fillStyle = "#ffffff"; x.fillRect(3, 3, 1, 1); x.fillStyle = "#a01a88"; x.fillRect(6, 7, 4, 3); },
    cursor(x) { x.fillStyle = OUT; for (let i = 0; i < 9; i++) x.fillRect(1, 1 + i, Math.min(i + 2, 7), 1); x.fillStyle = "#ffffff"; for (let i = 1; i < 8; i++) x.fillRect(2, 1 + i, Math.min(i, 5), 1); },
    eye(x) { x.fillStyle = OUT; x.fillRect(0, 3, 12, 6); x.fillRect(2, 2, 8, 8); x.fillStyle = "#f4f4f4"; x.fillRect(1, 4, 10, 4); x.fillRect(3, 3, 6, 6); x.fillStyle = "#3b5bdb"; x.fillRect(4, 4, 4, 4); x.fillStyle = OUT; x.fillRect(5, 5, 2, 2); },
    fist(x) { x.fillStyle = OUT; x.fillRect(1, 2, 10, 9); x.fillStyle = "#c98b5e"; x.fillRect(2, 3, 8, 7); x.fillStyle = "#a46c45"; x.fillRect(2, 5, 8, 1); x.fillRect(2, 7, 8, 1); x.fillStyle = "#2ee6d6"; x.fillRect(2, 9, 8, 1); },
    taco(x) { x.fillStyle = OUT; x.fillRect(0, 4, 12, 7); x.fillStyle = "#ffd23f"; x.fillRect(1, 5, 10, 5); x.fillStyle = "#2ea84a"; x.fillRect(2, 4, 3, 2); x.fillStyle = "#e83b3b"; x.fillRect(6, 4, 3, 2); x.fillStyle = "#8a5a2e"; x.fillRect(3, 6, 6, 2); },
    mega(x) { x.fillStyle = OUT; x.fillRect(0, 3, 5, 6); x.fillRect(4, 1, 8, 10); x.fillStyle = "#ff4fa3"; x.fillRect(1, 4, 4, 4); x.fillRect(5, 2, 6, 8); x.fillStyle = "#ffffff"; x.fillRect(6, 4, 1, 4); },
    mask(x) { x.fillStyle = OUT; x.fillRect(1, 1, 10, 10); x.fillStyle = "#ff4fa3"; x.fillRect(2, 2, 8, 8); x.fillStyle = "#ffffff"; x.fillRect(3, 4, 2, 2); x.fillRect(7, 4, 2, 2); x.fillStyle = "#7b4dff"; x.fillRect(5, 2, 2, 8); },
    bird(x) { x.fillStyle = OUT; x.fillRect(2, 2, 8, 8); x.fillStyle = "#2ea84a"; x.fillRect(3, 3, 6, 6); x.fillStyle = "#ffd23f"; x.fillRect(9, 5, 2, 2); x.fillStyle = "#e83b3b"; x.fillRect(5, 3, 3, 2); },
    hook(x) { x.fillStyle = OUT; x.fillRect(1, 1, 10, 10); x.fillStyle = "#1a1210"; x.fillRect(2, 2, 8, 8); x.fillStyle = "#3d2a20"; x.fillRect(3, 3, 2, 2); x.fillRect(7, 5, 2, 2); x.fillRect(4, 7, 2, 2); },
    heart(x) { x.fillStyle = OUT; x.fillRect(0, 1, 12, 7); x.fillRect(2, 0, 3, 10); x.fillRect(7, 0, 3, 10); x.fillRect(4, 8, 4, 3); x.fillStyle = "#ffd23f"; x.fillRect(1, 2, 10, 4); x.fillRect(3, 1, 2, 7); x.fillRect(7, 1, 2, 7); x.fillRect(5, 6, 2, 3); },
    chancla(x) { x.fillStyle = OUT; x.fillRect(1, 0, 10, 12); x.fillStyle = "#2ee6d6"; x.fillRect(2, 1, 8, 10); x.fillStyle = "#ff4fa3"; x.fillRect(3, 3, 6, 2); },
    cube(x) { for (let r = 0; r < 12; r += 3) for (let c = 0; c < 12; c += 3) { x.fillStyle = ((r + c) / 3) % 2 ? "#ff2bd6" : "#1a0f2a"; x.fillRect(c, r, 3, 3); } },
    cart(x) { x.fillStyle = OUT; x.fillRect(0, 0, 12, 12); x.fillStyle = "#4a4659"; x.fillRect(1, 1, 10, 10); x.fillStyle = "#ffd23f"; x.fillRect(2, 3, 8, 5); x.fillStyle = "#ff2bd6"; x.fillRect(3, 4, 3, 3); x.fillStyle = "#9aa3b5"; for (let i = 2; i < 10; i += 2) x.fillRect(i, 10, 1, 1); },
    todo(x) { x.fillStyle = OUT; x.fillRect(0, 0, 12, 12); x.fillStyle = "#fff3b0"; x.fillRect(1, 1, 10, 10); x.fillStyle = "#ff2bd6"; x.fillRect(1, 1, 10, 2); x.fillStyle = "#77737c"; x.fillRect(3, 5, 6, 1); x.fillRect(3, 7, 5, 1); },
  };
  const ISIZE = { coin: [8, 8], gk: [12, 8], photo: [10, 10], roll: [10, 10] };
  G.icon = name => {
    const key = "i:" + name;
    if (cache[key]) return cache[key];
    const [w, h] = ISIZE[name] || [12, 12];
    const [c, x] = mk(w, h);
    ICONS[name](x);
    cache[key] = c;
    return c;
  };
  G.paintIcon = (cv, name) => { const x = cv.getContext("2d"); x.imageSmoothingEnabled = false; x.clearRect(0, 0, cv.width, cv.height); x.drawImage(G.icon(name), 0, 0); };

  // ================= ENEMIGOS PEQUEÑOS =================
  G.blob = (ctx, x, y, t, stun, flash) => {
    x = Math.round(x); y = Math.round(y);
    const j = Math.sin(t * 23) > 0.85 ? 1 : 0;
    ctx.fillStyle = OUT; ctx.fillRect(x - 1, y - 1, 16, 14);
    for (let r = 0; r < 12; r += 3) for (let c = 0; c < 14; c += 3) {
      ctx.fillStyle = flash ? "#ffffff" : ((r + c) / 3) % 2 ? "#ff2bd6" : "#2a0f3a";
      ctx.fillRect(x + c + (r === 3 ? j : 0), y + r, Math.min(3, 14 - c), 3);
    }
    ctx.fillStyle = "#ffffff"; ctx.fillRect(x + 3, y + 3, 3, 3); ctx.fillRect(x + 8, y + 3, 3, 3);
    ctx.fillStyle = OUT;
    if (stun) { ctx.fillRect(x + 3, y + 3, 1, 1); ctx.fillRect(x + 5, y + 5, 1, 1); ctx.fillRect(x + 8, y + 3, 1, 1); ctx.fillRect(x + 10, y + 5, 1, 1); ctx.fillRect(x + 4, y + 4, 1, 1); ctx.fillRect(x + 9, y + 4, 1, 1); }
    else { ctx.fillRect(x + 4, y + 4, 1, 2); ctx.fillRect(x + 9, y + 4, 1, 2); }
  };
  G.fly = (ctx, x, y, t, flash) => {
    x = Math.round(x); y = Math.round(y);
    const cols = ["#2ee6d6", "#ff2bd6", "#ffd23f"];
    const wing = Math.floor(t * 14) % 2;
    ctx.fillStyle = "#9aa3b5";
    ctx.fillRect(x - 3, y + (wing ? 0 : 2), 3, 2); ctx.fillRect(x + 8, y + (wing ? 0 : 2), 3, 2);
    ctx.fillStyle = OUT; ctx.fillRect(x - 1, y - 1, 10, 10);
    ctx.fillStyle = flash ? "#fff" : cols[Math.floor(t * 6) % 3]; ctx.fillRect(x, y, 8, 8);
    ctx.fillStyle = OUT; ctx.fillRect(x + 2, y + 3, 1, 2); ctx.fillRect(x + 5, y + 3, 1, 2);
  };
  G.critter = (ctx, look, x, y, t, dir, flash) => {
    x = Math.round(x); y = Math.round(y);
    const f = Math.floor(t * 8) % 2;
    const fl = c => (flash ? "#ffffff" : c);
    ctx.save();
    if (dir > 0) { ctx.translate(x * 2 + 16, 0); ctx.scale(-1, 1); }
    if (look === "tlacuache") {
      ctx.fillStyle = OUT; ctx.fillRect(x, y + 2, 15, 8); ctx.fillRect(x - 3, y + 4, 4, 3); ctx.fillRect(x + 13, y + 4, 4, 2);
      ctx.fillStyle = fl("#9a97a6"); ctx.fillRect(x + 1, y + 3, 13, 6); ctx.fillStyle = fl("#f4f4f4"); ctx.fillRect(x - 2, y + 4, 4, 2);
      ctx.fillStyle = "#ff8fb1"; ctx.fillRect(x - 3, y + 5, 1, 1); ctx.fillRect(x + 14, y + 5, 3, 1);
      ctx.fillStyle = OUT; ctx.fillRect(x + 1, y + 4, 1, 1); ctx.fillRect(x + 2 + f, y + 9, 2, 2); ctx.fillRect(x + 10 - f, y + 9, 2, 2);
    } else if (look === "raptor") {
      ctx.fillStyle = OUT; ctx.fillRect(x, y + 4, 16, 8); ctx.fillRect(x - 4, y, 8, 7); ctx.fillRect(x + 14, y + 6, 5, 3);
      ctx.fillStyle = fl("#5aa84a"); ctx.fillRect(x + 1, y + 5, 14, 6); ctx.fillRect(x - 3, y + 1, 6, 5);
      ctx.fillStyle = "#ffd23f"; ctx.fillRect(x - 2, y + 2, 1, 1);
      ctx.fillStyle = "#f4f4f4"; ctx.fillRect(x - 3, y + 5, 4, 1);
      ctx.fillStyle = OUT; ctx.fillRect(x + 3 + f * 2, y + 11, 2, 5); ctx.fillRect(x + 10 - f * 2, y + 11, 2, 5);
    } else if (look === "popup") {
      ctx.fillStyle = OUT; ctx.fillRect(x - 1, y - 1, 18, 14);
      ctx.fillStyle = fl("#f4f4f4"); ctx.fillRect(x, y, 16, 12); ctx.fillStyle = "#3b5bdb"; ctx.fillRect(x, y, 16, 3);
      ctx.fillStyle = "#e83b3b"; ctx.fillRect(x + 12, y, 4, 3); ctx.fillStyle = "#ffd23f"; ctx.fillRect(x + 2, y + 5, 12, 2); ctx.fillStyle = "#ff4fa3"; ctx.fillRect(x + 2, y + 8, 7, 2);
    } else if (look === "bot") {
      ctx.fillStyle = OUT; ctx.fillRect(x, y, 12, 16); ctx.fillStyle = fl("#9aa3b5"); ctx.fillRect(x + 1, y + 1, 10, 9); ctx.fillStyle = "#2ee6d6"; ctx.fillRect(x + 2, y + 3, 3, 2); ctx.fillRect(x + 7, y + 3, 3, 2);
      ctx.fillStyle = fl("#6a7286"); ctx.fillRect(x + 2, y + 11, 8, 3); ctx.fillStyle = OUT; ctx.fillRect(x + 2 + f, y + 14, 2, 2); ctx.fillRect(x + 8 - f, y + 14, 2, 2); ctx.fillRect(x + 5, y - 3, 1, 3);
    } else if (look === "correo") {
      ctx.fillStyle = OUT; ctx.fillRect(x - 1, y - 1, 12, 9); ctx.fillStyle = fl("#f4f4f4"); ctx.fillRect(x, y, 10, 7);
      ctx.fillStyle = "#9aa3b5"; for (let i = 0; i < 5; i++) { ctx.fillRect(x + i, y + i, 1, 1); ctx.fillRect(x + 9 - i, y + i, 1, 1); }
      ctx.fillStyle = "#e83b3b"; ctx.fillRect(x + 4, y + 3, 2, 2);
    } else if (look === "petalo") {
      ctx.fillStyle = OUT; ctx.fillRect(x - 1, y - 1, 10, 10); ctx.fillStyle = fl("#ff8fb1"); ctx.fillRect(x, y, 8, 8); ctx.fillStyle = "#ffffff"; ctx.fillRect(x + 2, y + 3, 1, 2); ctx.fillRect(x + 5, y + 3, 1, 2);
    } else if (look === "papel") {
      ctx.fillStyle = OUT; ctx.fillRect(x - 1, y - 1, 14, 12); ctx.fillStyle = fl("#e8e4dc"); ctx.fillRect(x, y, 12, 10); ctx.fillStyle = "#a8a49c"; ctx.fillRect(x + 2, y + 2, 4, 3); ctx.fillRect(x + 7, y + 5, 3, 3);
      ctx.fillStyle = OUT; ctx.fillRect(x + 3, y + 4, 1, 1); ctx.fillRect(x + 8, y + 4, 1, 1);
    }
    ctx.restore();
  };
  G.stars = (ctx, x, y, t) => {
    for (let i = 0; i < 3; i++) {
      const a = t * 5 + i * 2.09;
      ctx.fillStyle = i % 2 ? "#ffd23f" : "#ffffff";
      ctx.fillRect(Math.round(x + Math.cos(a) * 7), Math.round(y + Math.sin(a) * 2.5), 2, 2);
    }
  };

  // ================= TEMAS: tiles y fondos =================
  const THEMES = (G.THEMES = {
    culiacan: { g: ["#d8cfb8", "#f0e8d2", "#a89f88", "#6d5a4a", "#5b4a3c", "#4a3b30", "#7d6a58"], plat: "toldo", wall: ["#c4a27a", "#a8865f", "#d8b88e"], bg: "city" },
    guamuchil: { g: ["#d8cfb8", "#f0e8d2", "#a89f88", "#7a6450", "#6a5440", "#4a3b30", "#8a7460"], plat: "toldo", wall: ["#e8b880", "#c49060", "#f0c890"], bg: "cityday" },
    primavera: { g: ["#8a86a0", "#a8a4bc", "#6a6680", "#3a3448", "#2e2a3a", "#221e2c", "#4a4458"], plat: "toldo", wall: ["#5a5470", "#4a4460", "#6a6480"], bg: "night" },
    room: { g: ["#b07a4a", "#d39a5c", "#7a4a2a", "#5a3418", "#4a2a14", "#3a2010", "#6a4020"], plat: "shelf", wall: ["#6a7ab0", "#5a6aa0", "#7a8ac0"], bg: "room" },
    office: { g: ["#7c86a0", "#9aa3b5", "#5a6280", "#3e4460", "#343a54", "#2a2e44", "#4a5068"], plat: "desk", wall: ["#c9c5d6", "#a8a4bc", "#e0dcec"], bg: "excel" },
    train: { g: ["#9aa3b5", "#c9c3dc", "#6a7286", "#4a5068", "#3e4460", "#2a2e44", "#5a6280"], plat: "steel", wall: ["#9aa3b5", "#6a7286", "#c9c3dc"], bg: "train" },
    school: { g: ["#c9c3dc", "#e8e4f4", "#9a93b0", "#6a6480", "#5a5470", "#4a4460", "#7a7490"], plat: "locker", wall: ["#3b8a6a", "#2a6a50", "#4aa880"], bg: "school" },
    library: { g: ["#9a6a3a", "#b88a5a", "#6a4a2a", "#4a3018", "#3a2410", "#2a1a08", "#5a3a20"], plat: "shelf", wall: ["#6a2a2a", "#4a1a1a", "#8a3a3a"], bg: "library" },
    telenovela: { g: ["#f4e8f0", "#ffffff", "#c9a3c0", "#a87a9a", "#8a5a7a", "#6a3a5a", "#c090b0"], plat: "curtain", wall: ["#f4e8f0", "#d8c0d0", "#ffffff"], bg: "mansion" },
    anime: { g: ["#e8d0d8", "#fff0f4", "#b898a8", "#8a6a7a", "#6a4a5a", "#4a2a3a", "#a08090"], plat: "sakura", wall: ["#c84a4a", "#a03030", "#e06060"], bg: "sakura" },
    lucha: { g: ["#f4f4f4", "#ffffff", "#c9c3dc", "#3b5bdb", "#2a3f9e", "#1c2a6e", "#4a6ae0"], plat: "ropes", wall: ["#2b2b3d", "#1c1c29", "#3a3a4a"], bg: "arena" },
    prehistoria: { g: ["#5aa84a", "#8ad46a", "#3a7a2a", "#6b4a2a", "#5a3a1a", "#4a2a10", "#7a5a3a"], plat: "stone", wall: ["#8a7a6a", "#6a5a4a", "#a89888"], bg: "jungle" },
    internet: { g: ["#2ee6d6", "#a8fff6", "#159c92", "#16224a", "#101a3a", "#0a1028", "#1e2e5a"], plat: "tab", wall: ["#3b5bdb", "#2a3f9e", "#6a8af0"], bg: "web" },
    abandonados: { g: ["#77737c", "#9a97a6", "#55525f", "#2a2834", "#221f2c", "#1a1822", "#3a3846"], plat: "wire", wall: ["#4a4659", "#3a3846", "#5a5670"], bg: "wire" },
    papelera: { g: ["#e8e4dc", "#ffffff", "#bdb7aa", "#a8a49c", "#8a867e", "#6a665e", "#c4c0b8"], plat: "trash", wall: ["#6a7286", "#4a5068", "#8a93a6"], bg: "trash" },
    void: { g: ["#ff2bd6", "#ffb0f0", "#a01a88", "#1a0f2a", "#120a22", "#0a0618", "#2a1440"], plat: "wire", wall: ["#2a1440", "#1a0f2a", "#3a1a50"], bg: "void" },
  });

  function tileCanvas(key, draw) {
    if (cache[key]) return cache[key];
    const [c, x] = mk(16, 16);
    draw(x);
    cache[key] = c;
    return c;
  }
  const speck = (x, seed, cols, n) => { for (let i = 0; i < n; i++) { x.fillStyle = cols[i % cols.length]; x.fillRect((SS.hash(seed + i) * 16) | 0, (SS.hash(seed + i * 7.7) * 16) | 0, 1, 1); } };
  const PLAT = {
    toldo(x, v) {
      const pairs = [["#e83b3b", "#f4f4f4"], ["#2ee6a0", "#f4f4f4"], ["#ffd23f", "#3b5bdb"], ["#ff8fb1", "#f4f4f4"]][v % 4];
      x.fillStyle = OUT; x.fillRect(0, 0, 16, 7);
      for (let i = 0; i < 4; i++) { x.fillStyle = pairs[i % 2]; x.fillRect(i * 4, 1, 4, 4); x.fillRect(i * 4 + 1, 5, 2, 1); }
      x.fillStyle = "rgba(255,255,255,.35)"; x.fillRect(0, 1, 16, 1);
    },
    shelf(x) { x.fillStyle = OUT; x.fillRect(0, 0, 16, 6); x.fillStyle = "#b27a45"; x.fillRect(0, 1, 16, 4); x.fillStyle = "#d39a5c"; x.fillRect(0, 1, 16, 1); x.fillStyle = "#8a5a2e"; x.fillRect(2, 5, 2, 4); x.fillRect(12, 5, 2, 4); },
    desk(x) { x.fillStyle = OUT; x.fillRect(0, 0, 16, 7); x.fillStyle = "#e8e4dc"; x.fillRect(0, 1, 16, 4); x.fillStyle = "#9aa3b5"; x.fillRect(0, 5, 16, 1); x.fillStyle = "#4a4659"; x.fillRect(3, 6, 2, 6); x.fillRect(11, 6, 2, 6); },
    steel(x) { x.fillStyle = OUT; x.fillRect(0, 0, 16, 6); x.fillStyle = "#9aa3b5"; x.fillRect(0, 1, 16, 4); x.fillStyle = "#6a7286"; for (let i = 1; i < 16; i += 4) x.fillRect(i, 2, 2, 2); },
    locker(x) { x.fillStyle = OUT; x.fillRect(0, 0, 16, 6); x.fillStyle = "#3b8a6a"; x.fillRect(0, 1, 16, 4); x.fillStyle = "#4aa880"; x.fillRect(0, 1, 16, 1); x.fillStyle = OUT; x.fillRect(7, 2, 2, 2); },
    curtain(x) { x.fillStyle = OUT; x.fillRect(0, 0, 16, 8); x.fillStyle = "#c0203a"; x.fillRect(0, 1, 16, 6); x.fillStyle = "#e83b3b"; for (let i = 0; i < 16; i += 4) x.fillRect(i, 1, 2, 6); x.fillStyle = "#ffd23f"; x.fillRect(0, 6, 16, 1); },
    sakura(x) { x.fillStyle = OUT; x.fillRect(0, 0, 16, 6); x.fillStyle = "#8a5a3a"; x.fillRect(0, 2, 16, 3); x.fillStyle = "#ff8fb1"; x.fillRect(1, 0, 5, 3); x.fillRect(9, 0, 6, 2); x.fillStyle = "#ffd0e0"; x.fillRect(2, 0, 2, 1); x.fillRect(10, 0, 2, 1); },
    ropes(x) { x.fillStyle = OUT; x.fillRect(0, 0, 16, 7); x.fillStyle = "#e83b3b"; x.fillRect(0, 1, 16, 2); x.fillStyle = "#f4f4f4"; x.fillRect(0, 4, 16, 2); },
    stone(x) { x.fillStyle = OUT; x.fillRect(0, 0, 16, 8); x.fillStyle = "#8a7a6a"; x.fillRect(1, 1, 14, 6); x.fillStyle = "#a89888"; x.fillRect(2, 1, 6, 2); x.fillStyle = "#5aa84a"; x.fillRect(0, 0, 16, 1); },
    tab(x) { x.fillStyle = OUT; x.fillRect(0, 0, 16, 7); x.fillStyle = "#f4f4f4"; x.fillRect(0, 1, 16, 5); x.fillStyle = "#3b5bdb"; x.fillRect(0, 1, 16, 2); x.fillStyle = "#e83b3b"; x.fillRect(12, 1, 3, 2); },
    wire(x) { x.fillStyle = "#77737c"; for (let i = 0; i < 16; i += 4) x.fillRect(i, 0, 2, 1); x.fillRect(0, 5, 16, 1); x.fillRect(0, 0, 1, 6); x.fillRect(15, 0, 1, 6); x.fillStyle = "#ff2bd6"; x.fillRect(7, 2, 2, 2); },
    trash(x) { x.fillStyle = OUT; x.fillRect(0, 0, 16, 7); x.fillStyle = "#e8e4dc"; x.fillRect(1, 1, 14, 5); x.fillStyle = "#a8a49c"; x.fillRect(3, 2, 4, 2); x.fillRect(9, 3, 4, 2); x.fillStyle = "#6fb7ff"; x.fillRect(2, 4, 3, 1); },
  };
  const TILES = (G.TILES = {
    groundTop: (th, v) => tileCanvas("gt" + th + v, x => {
      const g = THEMES[th].g;
      x.fillStyle = g[3]; x.fillRect(0, 0, 16, 16);
      x.fillStyle = g[0]; x.fillRect(0, 0, 16, 4);
      x.fillStyle = g[1]; x.fillRect(0, 0, 16, 1);
      x.fillStyle = g[2]; x.fillRect(0, 4, 16, 1); x.fillRect(v % 2 ? 7 : 15, 0, 1, 4);
      x.fillStyle = g[5]; x.fillRect(0, 5, 16, 1);
      if (th === "internet") { x.fillStyle = g[2]; x.fillRect(0, 8, 16, 1); x.fillRect(v * 4, 5, 1, 11); }
      else speck(x, v * 3.1 + th.length, [g[4], g[6]], 10);
    }),
    ground: (th, v) => tileCanvas("g" + th + v, x => {
      const g = THEMES[th].g;
      x.fillStyle = g[4]; x.fillRect(0, 0, 16, 16);
      if (th === "internet") { x.fillStyle = g[2]; x.fillRect(0, 15, 16, 1); x.fillRect(15, 0, 1, 16); }
      else speck(x, v * 5.3 + 1 + th.length, [g[5], g[3]], 9);
    }),
    plat: (th, v) => tileCanvas("pl" + th + v, x => PLAT[THEMES[th].plat](x, v)),
    crate: () => tileCanvas("crate", x => {
      x.fillStyle = OUT; x.fillRect(0, 0, 16, 16);
      x.fillStyle = "#b27a45"; x.fillRect(1, 1, 14, 14);
      x.fillStyle = "#8a5a2e"; x.fillRect(1, 1, 14, 2); x.fillRect(1, 13, 14, 2); x.fillRect(1, 1, 2, 14); x.fillRect(13, 1, 2, 14);
      x.fillStyle = "#d39a5c"; for (let i = 3; i < 13; i++) { x.fillRect(i, i, 1, 1); x.fillRect(15 - i, i, 1, 1); }
    }),
    fence: g => tileCanvas("f" + (g ? 1 : 0), x => {
      const bar = g ? "#4a1a52" : "#2b2840", hi = g ? "#ff2bd6" : "#5a5580";
      x.fillStyle = OUT; x.fillRect(0, 0, 16, 2); x.fillRect(0, 13, 16, 2);
      x.fillStyle = hi; x.fillRect(0, 0, 16, 1); x.fillRect(0, 13, 16, 1);
      for (let i = 1; i < 16; i += 4) { x.fillStyle = OUT; x.fillRect(i - 1, 0, 3, 16); x.fillStyle = bar; x.fillRect(i, 0, 1, 16); x.fillStyle = hi; x.fillRect(i, 1, 1, 1); }
    }),
    glitch: f => tileCanvas("x" + f, x => {
      for (let r = 0; r < 16; r += 4) for (let c = 0; c < 16; c += 4) { x.fillStyle = ((r + c) / 4 + f) % 2 ? "#ff2bd6" : "#1a0f2a"; x.fillRect(c, r, 4, 4); }
      x.fillStyle = OUT; x.fillRect(0, 0, 16, 1); x.fillRect(0, 0, 1, 16);
    }),
    spikes: () => tileCanvas("spk", x => {
      for (let i = 0; i < 4; i++) { const bx = i * 4; x.fillStyle = OUT; x.fillRect(bx, 8, 4, 8); x.fillRect(bx + 1, 4, 2, 4); x.fillStyle = "#ff2bd6"; x.fillRect(bx + 1, 9, 2, 7); x.fillRect(bx + 1, 5, 1, 4); x.fillStyle = "#ffffff"; x.fillRect(bx + 1, 5, 1, 1); }
    }),
    lava: f => tileCanvas("lava" + f, x => {
      x.fillStyle = "#c0301a"; x.fillRect(0, 0, 16, 16); x.fillStyle = "#ff7a1a"; x.fillRect(0, 2, 16, 4);
      x.fillStyle = "#ffd23f"; for (let i = 0; i < 16; i += 5) x.fillRect((i + f * 2) % 16, 2 + (i % 3), 3, 1);
    }),
    water: f => tileCanvas("wat" + f, x => {
      x.fillStyle = "#2a5ab0"; x.fillRect(0, 0, 16, 16); x.fillStyle = "#4a8ae0"; x.fillRect(0, 3, 16, 3);
      x.fillStyle = "#bfe3ff"; for (let i = 0; i < 16; i += 6) x.fillRect((i + f * 3) % 16, 3, 3, 1);
    }),
    wall: (th, v) => tileCanvas("w" + th + v, x => {
      const w = THEMES[th].wall;
      x.fillStyle = w[0]; x.fillRect(0, 0, 16, 16);
      x.fillStyle = w[1]; for (let r = 0; r < 16; r += 4) { x.fillRect(0, r, 16, 1); x.fillRect(((r / 4) % 2) * 8, r, 1, 4); x.fillRect(((r / 4) % 2) * 8 + 8, r, 1, 4); }
      speck(x, v + 9, [w[2]], 6);
    }),
    garage: () => tileCanvas("gar", x => {
      x.fillStyle = "#8a93a6"; x.fillRect(0, 0, 16, 16);
      x.fillStyle = "#6a7286"; for (let r = 1; r < 16; r += 3) x.fillRect(0, r, 16, 1);
      x.fillStyle = OUT; x.fillRect(0, 0, 1, 16); x.fillRect(15, 0, 1, 16);
      x.fillStyle = "#ffd23f"; x.fillRect(6, 7, 4, 2);
    }),
    cracked: () => tileCanvas("crk", x => {
      x.fillStyle = OUT; x.fillRect(0, 0, 16, 16); x.fillStyle = "#9a8a7a"; x.fillRect(1, 1, 14, 14);
      x.fillStyle = "#6a5a4a"; x.fillRect(3, 2, 1, 5); x.fillRect(4, 6, 3, 1); x.fillRect(7, 6, 1, 5); x.fillRect(8, 10, 4, 1); x.fillRect(11, 3, 1, 7);
      x.fillStyle = "#2ee6d6"; x.fillRect(1, 1, 2, 2);
    }),
    glass: () => tileCanvas("gls", x => {
      x.fillStyle = OUT; x.fillRect(0, 0, 16, 16); x.fillStyle = "#9ad0ff"; x.fillRect(1, 1, 14, 14);
      x.fillStyle = "#e8f6ff"; x.fillRect(3, 3, 2, 6); x.fillRect(5, 3, 1, 3); x.fillStyle = "#6aa0d8"; x.fillRect(1, 13, 14, 2);
      x.fillStyle = "#ff4fa3"; x.fillRect(13, 1, 2, 2);
    }),
    spring: f => tileCanvas("spr" + f, x => {
      x.fillStyle = OUT; x.fillRect(0, f ? 6 : 2, 16, 4); x.fillRect(2, f ? 9 : 5, 12, 7);
      x.fillStyle = "#e83b3b"; x.fillRect(1, f ? 7 : 3, 14, 2);
      x.fillStyle = "#9aa3b5"; for (let i = (f ? 10 : 6); i < 16; i += 2) x.fillRect(3, i, 10, 1);
    }),
    blink: on => tileCanvas("blk" + on, x => {
      if (on) { x.fillStyle = OUT; x.fillRect(0, 0, 16, 7); x.fillStyle = "#ffd23f"; x.fillRect(0, 1, 16, 5); x.fillStyle = "#3b5bdb"; x.fillRect(0, 1, 16, 2); x.fillStyle = "#ffffff"; x.fillRect(2, 4, 8, 1); }
      else { x.fillStyle = "rgba(255,210,63,.35)"; for (let i = 0; i < 16; i += 3) x.fillRect(i, 3, 2, 1); }
    }),
  });

  // ---------- capas de fondo ----------
  const mixHex = (a, b, t) => {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(((pa >> 16) & 255) + ((((pb >> 16) & 255) - ((pa >> 16) & 255)) * t));
    const g = Math.round(((pa >> 8) & 255) + ((((pb >> 8) & 255) - ((pa >> 8) & 255)) * t));
    const b2 = Math.round((pa & 255) + (((pb & 255) - (pa & 255)) * t));
    return `rgb(${r},${g},${b2})`;
  };
  G.mixHex = mixHex;
  const GRAY_SKY = ["#1d1b26", "#25222f", "#2e2b38", "#383542", "#43404d", "#4f4b58", "#5c5864", "#6a6670", "#77737c"];

  function layer(key, w, h, fn) { if (!cache["L" + key]) { const [c, x] = mk(w, h); fn(x, w, h); cache["L" + key] = c; } return cache["L" + key]; }
  function skyline(x, W, H, col, minH, maxH, extras) {
    x.fillStyle = col; let px = 0;
    while (px < W) {
      const w = 14 + (SS.hash(px + minH) * 30) | 0, h = minH + (SS.hash(px + 3 + maxH) * (maxH - minH)) | 0;
      x.fillRect(px, H - h, w, h);
      if (extras && SS.hash(px + 9) > 0.6) x.fillRect(px + (w >> 1), H - h - 8, 1, 8);
      px += w + ((SS.hash(px + 5) * 4) | 0);
    }
  }
  function houses(x, W, H, cols, lit, roofCol) {
    let px = 0, i = 0;
    while (px < W) {
      const w = 40 + (SS.hash(px * 1.3) * 40) | 0, h = 34 + (SS.hash(px + 11) * 40) | 0;
      x.fillStyle = cols[i++ % cols.length]; x.fillRect(px, H - h, w, h);
      x.fillStyle = roofCol; x.fillRect(px, H - h, w, 2);
      if (SS.hash(px + 2) > 0.35) { x.fillStyle = "#1d1b26"; x.fillRect(px + 6, H - h - 9, 10, 9); x.fillRect(px + 7, H - h - 10, 8, 1); }
      if (SS.hash(px + 4) > 0.5) { x.fillStyle = roofCol; x.fillRect(px + w - 10, H - h - 14, 1, 14); x.fillRect(px + w - 14, H - h - 12, 9, 1); }
      for (let wy = H - h + 8; wy < H - 10; wy += 12) for (let wx = px + 6; wx < px + w - 8; wx += 12) { x.fillStyle = SS.hash(wx * 3 + wy) > 0.55 ? lit : roofCol; x.fillRect(wx, wy, 5, 6); }
      px += w + 2;
    }
  }
  const FAR = {
    city: () => layer("farcity", 768, 120, (x, W, H) => {
      skyline(x, W, H, "#4a2052", 18, 64, true);
      const cx = 300; x.fillRect(cx, H - 70, 46, 70); x.fillRect(cx - 10, H - 92, 12, 92); x.fillRect(cx + 44, H - 92, 12, 92);
      x.fillRect(cx - 8, H - 100, 8, 8); x.fillRect(cx + 46, H - 100, 8, 8); x.fillRect(cx + 13, H - 84, 20, 14); x.fillRect(cx + 17, H - 90, 12, 6); x.fillRect(cx + 22, H - 96, 2, 6);
      for (const p of [90, 210, 470, 600, 700]) { x.fillRect(p, H - 50, 2, 50); x.fillRect(p - 8, H - 52, 18, 2); x.fillRect(p - 6, H - 54, 14, 2); x.fillRect(p - 10, H - 50, 4, 2); x.fillRect(p + 8, H - 50, 4, 2); }
    }),
    cityday: () => layer("farday", 768, 120, (x, W, H) => { skyline(x, W, H, "#8a9ac8", 18, 60, true); x.fillStyle = "#8a9ac8"; x.fillRect(380, H - 96, 12, 96); x.fillRect(372, H - 104, 28, 8); }),
    night: () => layer("farnight", 768, 120, (x, W, H) => skyline(x, W, H, "#1a1838", 16, 58, true)),
    hills: () => layer("farhills", 768, 120, (x, W, H) => { x.fillStyle = "#5a8a5a"; for (let i = 0; i < W; i++) { const h = 30 + Math.sin(i / 60) * 14 + Math.sin(i / 23) * 6; x.fillRect(i, H - h, 1, h); } }),
    fuji: () => layer("farfuji", 768, 130, (x, W, H) => {
      x.fillStyle = "#a888c8"; for (let i = 0; i < W; i++) { const d = Math.abs(i - 380); const h = Math.max(20, 110 - d * 0.55); x.fillRect(i, H - h, 1, h); }
      x.fillStyle = "#ffffff"; for (let i = 340; i < 420; i++) { const d = Math.abs(i - 380); const h = 110 - d * 0.55; x.fillRect(i, H - h, 1, Math.max(0, 18 - d * 0.2)); }
    }),
    volcano: () => layer("farvol", 768, 130, (x, W, H) => {
      x.fillStyle = "#5a3a3a"; for (let i = 0; i < W; i++) { const d = Math.abs(i - 300); const h = Math.max(24, 120 - d * 0.6); const top = d < 20 ? 108 : h; x.fillRect(i, H - top, 1, top); }
      x.fillStyle = "#ff7a1a"; x.fillRect(282, H - 110, 36, 4);
      x.fillStyle = "#3a6a3a"; for (let i = 0; i < W; i += 3) { const h = 18 + Math.sin(i / 17) * 8; x.fillRect(i, H - h, 3, h); }
    }),
  };
  const MID = {
    houses: (cols, key) => layer("mid" + key, 1024, 110, (x, W, H) => houses(x, W, H, cols, "#ffcf6a", "#3a1d44")),
    roomwall: () => layer("room", 1024, 216, (x, W, H) => {
      x.fillStyle = "#4a5a8a"; x.fillRect(0, 0, W, H);
      x.fillStyle = "#5a6aa0"; for (let i = 0; i < W; i += 12) x.fillRect(i, 0, 6, H);
      for (let i = 30; i < W; i += 170) {
        x.fillStyle = OUT; x.fillRect(i - 1, 40, 36, 46); x.fillStyle = ["#ff7a1a", "#ff4fa3", "#2ee6d6", "#ffd23f"][(i / 170 | 0) % 4]; x.fillRect(i, 41, 34, 44);
        x.fillStyle = OUT; x.fillRect(i + 6, 50, 22, 4); x.fillRect(i + 10, 60, 14, 14);
        x.fillStyle = OUT; x.fillRect(i + 80, 30, 60, 50); x.fillStyle = "#16122e"; x.fillRect(i + 82, 32, 56, 46); x.fillStyle = "#ffe27a"; x.fillRect(i + 120, 40, 8, 8);
        x.fillStyle = "#f4f4f4"; for (let k = 0; k < 8; k++) x.fillRect(i + 86 + ((SS.hash(i + k) * 50) | 0), 36 + ((SS.hash(i * 2 + k) * 36) | 0), 1, 1);
      }
      x.fillStyle = "#3a4870"; x.fillRect(0, 150, W, 66);
    }),
    excel: () => layer("excel", 1024, 216, (x, W, H) => {
      x.fillStyle = "#f4f4f4"; x.fillRect(0, 0, W, H);
      x.fillStyle = "#c9e8c9"; for (let i = 0; i < W; i += 40) x.fillRect(i, 0, 1, H); for (let j = 0; j < H; j += 12) x.fillRect(0, j, W, 1);
      x.fillStyle = "#1f7a34"; x.fillRect(0, 0, W, 10); x.fillStyle = "#e0f0e0"; for (let i = 0; i < W; i += 40) x.fillRect(i + 16, 2, 6, 6);
      x.fillStyle = "#9aa3b5"; for (let i = 20; i < W; i += 90) { x.fillRect(i, 110, 60, 40); x.fillStyle = "#6a7286"; x.fillRect(i, 110, 60, 3); x.fillStyle = "#9aa3b5"; }
    }),
    lockers: () => layer("lockers", 1024, 216, (x, W, H) => {
      x.fillStyle = "#e8e0c8"; x.fillRect(0, 0, W, H); x.fillStyle = "#c8c0a8"; x.fillRect(0, 0, W, 30);
      for (let i = 0; i < W; i += 160) { x.fillStyle = OUT; x.fillRect(i + 10, 34, 70, 40); x.fillStyle = "#9ad0ff"; x.fillRect(i + 12, 36, 66, 36); x.fillStyle = "#e8f6ff"; x.fillRect(i + 16, 40, 8, 20); }
      for (let i = 0; i < W; i += 18) { x.fillStyle = OUT; x.fillRect(i, 90, 17, 86); x.fillStyle = "#3b8a6a"; x.fillRect(i + 1, 91, 15, 84); x.fillStyle = "#2a6a50"; for (let k = 96; k < 120; k += 4) x.fillRect(i + 4, k, 9, 1); x.fillStyle = "#c9c3dc"; x.fillRect(i + 12, 130, 2, 6); }
      x.fillStyle = "#ffd23f"; x.fillRect(0, 84, W, 4);
    }),
    shelves: () => layer("shelves", 1024, 216, (x, W, H) => {
      x.fillStyle = "#4a1a1a"; x.fillRect(0, 0, W, H);
      const books = ["#e83b3b", "#3b5bdb", "#2ea84a", "#ffd23f", "#7b4dff", "#ff7a1a", "#f4f4f4"];
      for (let i = 0; i < W; i += 100) {
        x.fillStyle = "#6a3a1a"; x.fillRect(i + 4, 20, 92, 160);
        for (let s = 0; s < 6; s++) { const sy = 26 + s * 26; x.fillStyle = "#3a1a08"; x.fillRect(i + 8, sy + 20, 84, 3); for (let b = 0; b < 84; b += 5) { x.fillStyle = books[((b + s * 7 + i) / 5 | 0) % books.length]; const bh = 14 + ((SS.hash(i + b + s) * 6) | 0); x.fillRect(i + 8 + b, sy + 20 - bh, 4, bh); } }
      }
    }),
    columns: () => layer("columns", 1024, 216, (x, W, H) => {
      x.fillStyle = "#ffd0e0"; x.fillRect(0, 0, W, H); x.fillStyle = "#ffb8d0"; for (let i = 0; i < W; i += 20) x.fillRect(i, 0, 10, H);
      for (let i = 30; i < W; i += 128) { x.fillStyle = "#f4f4f4"; x.fillRect(i, 30, 18, 160); x.fillStyle = "#d8c0d0"; x.fillRect(i + 13, 30, 5, 160); x.fillStyle = "#ffd23f"; x.fillRect(i - 4, 26, 26, 6); x.fillRect(i - 4, 186, 26, 6); }
      for (let i = 90; i < W; i += 256) { x.fillStyle = "#c0203a"; x.fillRect(i, 0, 50, 120); x.fillStyle = "#e83b3b"; for (let k = 0; k < 50; k += 8) x.fillRect(i + k, 0, 4, 120); x.fillStyle = "#ffd23f"; x.fillRect(i, 116, 50, 4); }
      for (let i = 60; i < W; i += 300) { x.fillStyle = "#ffd23f"; x.fillRect(i + 20, 0, 2, 20); x.fillRect(i, 20, 42, 4); for (let k = 0; k < 42; k += 6) { x.fillStyle = "#fff3b0"; x.fillRect(i + k, 24, 3, 8); } }
    }),
    temple: () => layer("temple", 1024, 110, (x, W, H) => {
      for (let i = 40; i < W; i += 260) {
        x.fillStyle = "#a03030"; x.fillRect(i, H - 70, 60, 70); x.fillStyle = "#2a1a2a"; x.fillRect(i - 14, H - 78, 88, 8); x.fillRect(i - 6, H - 96, 72, 8);
        x.fillStyle = "#a03030"; x.fillRect(i + 8, H - 92, 44, 16); x.fillStyle = "#ffd23f"; x.fillRect(i + 24, H - 50, 12, 20);
        x.fillStyle = "#c84a4a"; x.fillRect(i + 120, H - 60, 6, 60); x.fillRect(i + 160, H - 60, 6, 60); x.fillRect(i + 110, H - 64, 66, 6);
      }
      for (let i = 0; i < W; i += 70) { x.fillStyle = "#6a3a3a"; x.fillRect(i + 30, H - 40, 4, 40); x.fillStyle = "#ffa0c0"; x.fillRect(i + 14, H - 58, 36, 22); x.fillStyle = "#ff8fb1"; x.fillRect(i + 20, H - 62, 24, 8); }
    }),
    crowd: () => layer("crowd", 1024, 216, (x, W, H) => {
      x.fillStyle = "#120a22"; x.fillRect(0, 0, W, H);
      const shirts = ["#e83b3b", "#3b5bdb", "#ffd23f", "#2ee6a0", "#ff4fa3", "#f4f4f4"];
      for (let r = 0; r < 6; r++) for (let i = 0; i < W; i += 10) {
        const y = 60 + r * 16 + ((SS.hash(i + r) * 3) | 0);
        x.fillStyle = shirts[((i / 10) + r * 3 | 0) % shirts.length]; x.fillRect(i + 1, y + 6, 8, 10);
        x.fillStyle = ["#e0a97e", "#c98b5e", "#8a5a3a"][(i + r) % 3]; x.fillRect(i + 2, y, 6, 6);
      }
      x.fillStyle = "#2b2b3d"; x.fillRect(0, 150, W, 66);
      for (let i = 50; i < W; i += 200) { x.fillStyle = "#ffe27a"; x.fillRect(i, 6, 20, 8); x.globalAlpha = 0.12; x.beginPath(); x.moveTo(i, 14); x.lineTo(i - 60, 160); x.lineTo(i + 80, 160); x.lineTo(i + 20, 14); x.fill(); x.globalAlpha = 1; }
    }),
    ferns: () => layer("ferns", 1024, 110, (x, W, H) => {
      for (let i = 0; i < W; i += 46) {
        x.fillStyle = "#2a6a2a"; x.fillRect(i + 20, H - 70, 6, 70);
        for (let k = 0; k < 5; k++) { x.fillStyle = k % 2 ? "#3a8a3a" : "#4aa84a"; x.fillRect(i + 22 - 26 + k * 3, H - 74 + k * 4, 52 - k * 6, 4); }
        x.fillStyle = "#1f5a1f"; x.fillRect(i, H - 20, 40, 20);
      }
    }),
    windows: () => layer("windows", 1024, 216, (x, W, H) => {
      x.fillStyle = "#101a3a"; x.fillRect(0, 0, W, H);
      x.fillStyle = "#1e2e5a"; for (let i = 0; i < W; i += 16) x.fillRect(i, 0, 1, H); for (let j = 0; j < H; j += 16) x.fillRect(0, j, W, 1);
      for (let i = 0; i < 14; i++) {
        const wx = (SS.hash(i * 3) * (W - 90)) | 0, wy = 20 + ((SS.hash(i * 7) * 120) | 0), ww = 50 + ((SS.hash(i) * 50) | 0), wh = 30 + ((SS.hash(i + 2) * 30) | 0);
        x.fillStyle = OUT; x.fillRect(wx - 1, wy - 1, ww + 2, wh + 2); x.fillStyle = "#2a3f9e"; x.fillRect(wx, wy, ww, wh); x.fillStyle = "#3b5bdb"; x.fillRect(wx, wy, ww, 6);
        x.fillStyle = "#e83b3b"; x.fillRect(wx + ww - 6, wy + 1, 5, 4); x.fillStyle = "#6a8af0"; for (let k = wy + 10; k < wy + wh - 4; k += 5) x.fillRect(wx + 4, k, ww - 10, 2);
      }
    }),
    wire: () => layer("wire", 1024, 216, (x, W, H) => {
      x.fillStyle = "#14121c"; x.fillRect(0, 0, W, H);
      x.strokeStyle = "#3a3846"; x.lineWidth = 1;
      for (let i = 0; i < 18; i++) {
        const bx = (SS.hash(i * 5) * W) | 0, by = 30 + ((SS.hash(i * 9) * 120) | 0), s = 20 + ((SS.hash(i) * 50) | 0);
        x.strokeRect(bx + 0.5, by + 0.5, s, s); x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + 10, by - 10); x.lineTo(bx + s + 10, by - 10); x.lineTo(bx + s, by); x.moveTo(bx + s + 10, by - 10); x.lineTo(bx + s + 10, by + s - 10); x.lineTo(bx + s, by + s); x.stroke();
      }
      x.fillStyle = "#2a2834"; for (let i = 0; i < W; i += 32) x.fillRect(i, 0, 1, H);
    }),
    trash: () => layer("trash", 1024, 216, (x, W, H) => {
      x.fillStyle = "#3a4058"; x.fillRect(0, 0, W, H);
      x.fillStyle = "#4a5068"; for (let i = 0; i < W; i += 24) x.fillRect(i, 0, 12, H);
      for (let i = 0; i < 70; i++) {
        const px = (SS.hash(i * 3.3) * W) | 0, py = (SS.hash(i * 1.7) * H) | 0, s = 6 + ((SS.hash(i) * 14) | 0);
        x.fillStyle = OUT; x.fillRect(px - 1, py - 1, s + 2, s + 2); x.fillStyle = ["#e8e4dc", "#c4c0b8", "#a8a49c", "#9ad0ff"][i % 4]; x.fillRect(px, py, s, s);
        x.fillStyle = "#77737c"; x.fillRect(px + 2, py + 2, s - 4, 1);
      }
    }),
    poles: () => layer("poles", 1024, 110, (x, W, H) => { for (let i = 0; i < W; i += 128) { x.fillStyle = "#4a4659"; x.fillRect(i, H - 90, 4, 90); x.fillRect(i - 10, H - 86, 24, 3); } x.fillStyle = "#3a3846"; x.fillRect(0, H - 82, W, 1); }),
  };
  const BG = {
    city: { sky: ["#2a1648", "#3d1a5a", "#5a1f66", "#7a2468", "#a02f62", "#c94a52", "#e8703e", "#f59a3c", "#ffc24a"], sun: "#ffe27a", far: "city", mid: () => MID.houses(["#7a3f6a", "#6a3a70", "#844a62", "#5e3a6e", "#8a5068"], "c"), cables: true },
    cityday: { sky: ["#3a7ad0", "#4a8ae0", "#5a9aec", "#6aaaf4", "#7ab8f8", "#8ac4fa", "#9ad0fc", "#aadcfe", "#bae6ff"], sun: "#fff3b0", far: "cityday", mid: () => MID.houses(["#f2b35a", "#7fd3c4", "#ff8fb1", "#c9a3ff", "#e8d8b0"], "d"), cables: true },
    night: { sky: ["#05040c", "#0a0818", "#0e0c22", "#14112c", "#1a1636", "#201a40", "#28204a", "#302654", "#3a2c5e"], moon: true, stars: true, far: "night", mid: () => MID.houses(["#2a2440", "#322a4a", "#2a2a48", "#3a2e50"], "n"), cables: true },
    room: { full: () => MID.roomwall() },
    excel: { full: () => MID.excel() },
    train: { sky: ["#3a7ad0", "#4a8ae0", "#5a9aec", "#6aaaf4", "#7ab8f8", "#8ac4fa", "#9ad0fc", "#aadcfe", "#bae6ff"], sun: "#fff3b0", far: "hills", mid: () => MID.poles(), autoscroll: 260 },
    school: { full: () => MID.lockers() },
    library: { full: () => MID.shelves() },
    mansion: { full: () => MID.columns() },
    sakura: { sky: ["#ffd0e0", "#ffc8dc", "#ffc0d8", "#ffb8d4", "#ffb0d0", "#ffa8cc", "#ffa0c8", "#ff98c4", "#ff90c0"], sun: "#ffffff", far: "fuji", mid: () => MID.temple(), petals: true },
    arena: { full: () => MID.crowd() },
    jungle: { sky: ["#3a1a2a", "#5a2a2a", "#7a3a2a", "#9a4a2a", "#b85a2a", "#d06a2a", "#e07a3a", "#ea8a4a", "#f09a5a"], sun: "#ffd23f", far: "volcano", mid: () => MID.ferns(), embers: true },
    web: { full: () => MID.windows(), bits: true },
    wire: { full: () => MID.wire() },
    trash: { full: () => MID.trash() },
    void: { void: true },
  };
  G.drawBg = (ctx, theme, camX, camY, glitch, t) => {
    const cfg = BG[THEMES[theme] ? THEMES[theme].bg : theme] || BG.city;
    const W = SS.W, H = SS.H;
    if (cfg.void) return drawVoid(ctx, camX, t);
    if (cfg.full) {
      const img = cfg.full();
      const ox = -((camX * 0.5) % img.width), oy = -Math.min(0, 0) - ((camY - 8) * 0.25 % img.height);
      for (let k = -1; k < 2; k++) { ctx.drawImage(img, Math.round(ox + k * img.width), Math.round(oy)); if (oy > 0) ctx.drawImage(img, Math.round(ox + k * img.width), Math.round(oy - img.height)); }
      if (camY > 8) for (let k = -1; k < 2; k++) ctx.drawImage(img, Math.round(ox + k * img.width), Math.round(oy + img.height));
    } else {
      const bands = cfg.sky.length;
      for (let i = 0; i < bands; i++) { ctx.fillStyle = glitch > 0 ? mixHex(cfg.sky[i], GRAY_SKY[i], glitch) : cfg.sky[i]; ctx.fillRect(0, Math.floor((i * 150) / bands), W, Math.ceil(150 / bands) + 1); }
      ctx.fillStyle = cfg.sky[bands - 1]; ctx.fillRect(0, 150, W, H - 150);
      if (cfg.stars) for (let i = 0; i < 70; i++) if (Math.sin(t * 2 + i) > -0.3) { ctx.fillStyle = "#c9c3dc"; ctx.fillRect((SS.hash(i) * W) | 0, (SS.hash(i + 50) * 120) | 0, 1, 1); }
      if (cfg.moon) { ctx.fillStyle = "#f4f0d8"; ctx.beginPath(); ctx.arc(300, 40, 14, 0, 7); ctx.fill(); ctx.fillStyle = "#d8d4bc"; ctx.fillRect(294, 36, 4, 3); ctx.fillRect(303, 44, 3, 3); }
      if (cfg.sun) {
        const sx = 270 - camX * 0.02, sy = 112, r = 34;
        for (let yy = -r; yy <= 0; yy++) { const hw = Math.round(Math.sqrt(r * r - yy * yy)); if (yy > -16 && (yy + 40) % 5 < 2) continue; ctx.fillStyle = glitch > 0 ? mixHex(cfg.sun, "#9a97a6", glitch) : cfg.sun; ctx.fillRect(Math.round(sx - hw), sy + yy, hw * 2, 1); }
      }
      const auto = cfg.autoscroll ? t * cfg.autoscroll : 0;
      if (cfg.far) { const far = FAR[cfg.far](); const fx = -(((camX + auto * 0.4) * 0.15) % far.width); for (let k = -1; k < 2; k++) ctx.drawImage(far, Math.round(fx + k * far.width), 152 - far.height); }
      if (cfg.mid) { const mid = cfg.mid(); const mx = -(((camX + auto) * 0.4) % mid.width); for (let k = -1; k < 2; k++) ctx.drawImage(mid, Math.round(mx + k * mid.width), 176 - mid.height); }
      if (cfg.cables) { ctx.fillStyle = "#1d1220"; const off = -((camX * 0.7) % 128); for (let k = -1; k < 5; k++) { const x0 = off + k * 128; for (let i = 0; i < 128; i += 2) { const sag = Math.round(Math.sin((i / 128) * Math.PI) * 8); ctx.fillRect(Math.round(x0 + i), 60 + sag, 2, 1); } } }
    }
    if (cfg.petals) for (let i = 0; i < 26; i++) { const px = ((SS.hash(i) * 500 + t * 30 * (1 + i % 3)) % 420) - 20, py = ((SS.hash(i + 9) * 260 + t * 22) % 240) - 20; ctx.fillStyle = i % 2 ? "#ffb8d0" : "#ffffff"; ctx.fillRect(Math.round(px), Math.round(py), 2, 2); }
    if (cfg.embers) for (let i = 0; i < 20; i++) { const px = (SS.hash(i) * W + Math.sin(t + i) * 10) | 0, py = (H - ((SS.hash(i + 4) * 300 + t * 30) % 260)) | 0; ctx.fillStyle = i % 2 ? "#ff7a1a" : "#ffd23f"; ctx.fillRect(px, py, 1, 2); }
    if (cfg.bits) for (let i = 0; i < 24; i++) { const px = (SS.hash(i * 2) * W) | 0, py = ((SS.hash(i + 3) * 300 + t * 40 * (1 + i % 2)) % 240) | 0; ctx.fillStyle = "#2ee6d6"; ctx.globalAlpha = 0.5; ctx.fillRect(px, py, 1, 4); ctx.globalAlpha = 1; }
    if (glitch > 0) {
      ctx.globalAlpha = 0.45 * glitch; ctx.fillStyle = "#77737c"; ctx.fillRect(0, 0, W, 176); ctx.globalAlpha = 1;
      for (let i = 0; i < 14; i++) {
        const bx = (SS.hash(i * 3.3 + Math.floor(t * 2)) * W) | 0, by = (SS.hash(i * 9.1 + Math.floor(t * 2)) * 140) | 0;
        const s = 8 + ((SS.hash(i) * 3) | 0) * 8;
        ctx.fillStyle = (i + Math.floor(t * 3)) % 3 ? "#2a2834" : "#ff2bd6"; ctx.globalAlpha = glitch * 0.8; ctx.fillRect(bx, by, s, s);
      }
      ctx.globalAlpha = 1;
    }
  };
  function drawVoid(ctx, camX, t) {
    const W = SS.W, H = SS.H;
    for (let i = 0; i < 10; i++) { ctx.fillStyle = ["#07051a", "#0b0722", "#10092a", "#160b33", "#1d0d3c", "#250f45", "#2d114e", "#361356", "#3f155f", "#481768"][i]; ctx.fillRect(0, i * 18, W, 18); }
    for (let i = 0; i < 60; i++) if (Math.sin(t * 2 + i) > 0.2) { ctx.fillStyle = "#b0a7dc"; ctx.fillRect((SS.hash(i) * W) | 0, (SS.hash(i + 50) * 150) | 0, 1, 1); }
    ctx.strokeStyle = "rgba(255,43,214,.3)"; ctx.beginPath();
    for (let j = -12; j <= 12; j++) { ctx.moveTo(W / 2 + j * 4 + 0.5, 150); ctx.lineTo(W / 2 + j * 50 + 0.5 - (camX * 0.3) % 50, H); }
    ctx.stroke();
    for (let i = 1; i < 8; i++) { const y = 150 + Math.round((H - 150) * Math.pow((i + (t * 0.5) % 1) / 8, 2)); ctx.fillStyle = "rgba(255,43,214,.3)"; ctx.fillRect(0, y, W, 1); }
  }
  // compatibilidad con el prólogo
  G.drawCityBg = (ctx, camX, glitch, t) => G.drawBg(ctx, "culiacan", camX, 8, glitch, t);

  // ================= DECORADO =================
  G.house = (ctx, x, y, w, color, trim, num, opts = {}) => {
    const W = w * 16, Hh = 80, top = y - Hh;
    ctx.fillStyle = OUT; ctx.fillRect(x - 1, top - 1, W + 2, Hh + 1);
    ctx.fillStyle = color; ctx.fillRect(x, top, W, Hh);
    ctx.fillStyle = trim; ctx.fillRect(x, top, W, 4); ctx.fillRect(x, y - 6, W, 6);
    ctx.fillStyle = "rgba(255,255,255,.12)"; for (let i = 0; i < 18; i++) ctx.fillRect(x + ((SS.hash(x + i) * W) | 0), top + 6 + ((SS.hash(x * 2 + i) * 66) | 0), 2, 1);
    ctx.fillStyle = OUT; ctx.fillRect(x + W - 26, top - 15, 16, 15);
    ctx.fillStyle = "#24222c"; ctx.fillRect(x + W - 25, top - 13, 14, 13); ctx.fillRect(x + W - 23, top - 15, 10, 2);
    ctx.fillStyle = "#3d3a4a"; ctx.fillRect(x + W - 22, top - 11, 3, 9);
    ctx.fillStyle = OUT; ctx.fillRect(x + 10, top - 20, 1, 20); ctx.fillRect(x + 4, top - 16, 13, 1); ctx.fillRect(x + 6, top - 12, 9, 1);
    const wx = x + 10, wy = top + 22;
    ctx.fillStyle = OUT; ctx.fillRect(wx - 2, wy - 2, 28, 24);
    ctx.fillStyle = opts.lit ? "#ffcf6a" : "#3b4a7a"; ctx.fillRect(wx, wy, 24, 20);
    ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(wx + 2, wy + 2, 6, 2);
    ctx.fillStyle = OUT; for (let i = 3; i < 24; i += 5) ctx.fillRect(wx + i, wy, 1, 20); ctx.fillRect(wx, wy + 9, 24, 1);
    ctx.fillStyle = OUT; ctx.fillRect(wx + 30, wy - 12, 22, 9);
    ctx.fillStyle = "#e8e8ee"; ctx.fillRect(wx + 31, wy - 11, 20, 7); ctx.fillStyle = "#b0b0be"; ctx.fillRect(wx + 33, wy - 6, 16, 1);
    if (opts.door !== undefined) {
      const dx = opts.door, dy = y - 32;
      ctx.fillStyle = OUT; ctx.fillRect(dx - 1, dy - 1, 18, 33);
      ctx.fillStyle = opts.doorOpen ? "#120f1c" : "#7a4a2a"; ctx.fillRect(dx, dy, 16, 32);
      if (!opts.doorOpen) { ctx.fillStyle = "#5a3418"; ctx.fillRect(dx + 2, dy + 3, 12, 11); ctx.fillRect(dx + 2, dy + 17, 12, 11); ctx.fillStyle = "#ffd23f"; ctx.fillRect(dx + 12, dy + 16, 2, 2); }
      ctx.fillStyle = "#f4f4f4"; ctx.fillRect(dx + 20, dy + 2, 16 + (num.length > 3 ? 6 : 0), 8);
      ctx.fillStyle = OUT; ctx.font = '6px "Press Start 2P"'; ctx.textBaseline = "top"; ctx.fillText(num, dx + 21, dy + 3);
      if (opts.delivered) { ctx.fillStyle = "#2ee6a0"; ctx.fillRect(dx + 4, dy - 8, 8, 6); ctx.fillStyle = OUT; ctx.fillRect(dx + 5, dy - 5, 2, 1); ctx.fillRect(dx + 7, dy - 6, 1, 1); ctx.fillRect(dx + 8, dy - 7, 2, 1); }
    }
    ctx.fillStyle = OUT; ctx.fillRect(x + W - 18, y - 12, 10, 12);
    ctx.fillStyle = "#c4553a"; ctx.fillRect(x + W - 17, y - 8, 8, 8);
    ctx.fillStyle = "#2ea84a"; ctx.fillRect(x + W - 19, y - 14, 12, 6); ctx.fillStyle = "#ff4fa3"; ctx.fillRect(x + W - 14, y - 15, 2, 2);
  };
  G.store = (ctx, x, y, w, label) => {
    const W = w * 16, top = y - 80;
    ctx.fillStyle = OUT; ctx.fillRect(x - 1, top - 1, W + 2, 81);
    ctx.fillStyle = "#f4f4f4"; ctx.fillRect(x, top, W, 80);
    ctx.fillStyle = "#e83b3b"; ctx.fillRect(x, top, W, 22);
    ctx.fillStyle = "#ffd23f"; ctx.font = '6px "Press Start 2P"'; ctx.textBaseline = "top";
    const tw = ctx.measureText(label).width; ctx.fillText(label, Math.round(x + (W - tw) / 2), top + 8);
    ctx.fillStyle = "#2ee6a0"; ctx.fillRect(x, top + 22, W, 3);
    ctx.fillStyle = OUT; ctx.fillRect(x + 8, y - 44, W - 16, 38);
    ctx.fillStyle = "#3b4a7a"; ctx.fillRect(x + 9, y - 43, W - 18, 36);
    const goods = ["#ffd23f", "#e83b3b", "#2ee6d6", "#ff8fb1", "#f4f4f4", "#2ea84a"];
    for (let i = 0; i < (W - 24) / 7; i++) { ctx.fillStyle = goods[i % goods.length]; ctx.fillRect(x + 12 + i * 7, y - 38 + (i % 2) * 2, 5, 9); ctx.fillRect(x + 12 + i * 7, y - 22, 5, 9); }
    ctx.fillStyle = "#c79a6a"; ctx.fillRect(x + 9, y - 27, W - 18, 2);
  };
  G.palm = (ctx, x, y, t) => {
    ctx.fillStyle = OUT; ctx.fillRect(x + 6, y - 62, 6, 62);
    ctx.fillStyle = "#8a6a4a";
    for (let i = 0; i < 60; i += 6) { ctx.fillRect(x + 7 + (i % 12 ? 0 : 1), y - 61 + i, 4, 5); }
    const sway = Math.round(Math.sin(t * 1.5 + x) * 1.5);
    const fr = (dx, dy, w) => { ctx.fillStyle = OUT; ctx.fillRect(x + dx - 1, y - 66 + dy - 1, w + 2, 4); ctx.fillStyle = "#2ea84a"; ctx.fillRect(x + dx, y - 66 + dy, w, 2); };
    fr(-12 + sway, 2, 14); fr(10 + sway, 2, 14); fr(-16 + sway, 6, 8); fr(18 + sway, 6, 8); fr(-4 + sway, -2, 26); fr(-8 + sway, 0, 10); fr(14 + sway, 0, 10);
    ctx.fillStyle = "#6b3f22"; ctx.fillRect(x + 6, y - 64, 3, 3); ctx.fillRect(x + 9, y - 63, 3, 3);
  };
  G.lamp = (ctx, x, y, lit, t) => {
    ctx.fillStyle = OUT; ctx.fillRect(x + 6, y - 64, 4, 64); ctx.fillRect(x + 6, y - 64, 16, 3); ctx.fillRect(x + 16, y - 62, 8, 4);
    ctx.fillStyle = "#4a4659"; ctx.fillRect(x + 7, y - 63, 2, 63);
    ctx.fillStyle = lit ? "#ffe27a" : "#6a6670"; ctx.fillRect(x + 17, y - 59, 6, 2);
    if (lit) { ctx.globalAlpha = 0.18 + Math.sin(t * 4) * 0.04; ctx.fillStyle = "#ffe27a"; ctx.beginPath(); ctx.moveTo(x + 17, y - 57); ctx.lineTo(x + 6, y); ctx.lineTo(x + 34, y); ctx.lineTo(x + 23, y - 57); ctx.fill(); ctx.globalAlpha = 1; }
  };
  // punto de guardado genérico para las otras dimensiones: un mini cartucho que brilla
  G.savepoint = (ctx, x, y, lit, t) => {
    const b = lit ? Math.round(Math.sin(t * 4) * 1.5) : 0;
    ctx.fillStyle = OUT; ctx.fillRect(x + 4, y - 4, 8, 4); ctx.fillStyle = "#4a4659"; ctx.fillRect(x + 5, y - 3, 6, 3);
    ctx.drawImage(G.icon("cart"), x + 2, y - 18 + b);
    if (lit) { ctx.globalAlpha = 0.3; ctx.fillStyle = "#ffd23f"; ctx.fillRect(x, y - 22 + b, 16, 20); ctx.globalAlpha = 1; }
  };
  G.speaker = (ctx, x, y, active, t) => {
    const j = active ? Math.round(Math.sin(t * 40)) : 0;
    ctx.fillStyle = OUT; ctx.fillRect(x + 1 + j, y - 26, 16, 26);
    ctx.fillStyle = "#2b2840"; ctx.fillRect(x + 2 + j, y - 25, 14, 24);
    ctx.fillStyle = "#5a5580"; ctx.beginPath(); ctx.arc(x + 9 + j, y - 9, 5, 0, 6.29); ctx.fill(); ctx.beginPath(); ctx.arc(x + 9 + j, y - 20, 3, 0, 6.29); ctx.fill();
    ctx.fillStyle = OUT; ctx.fillRect(x + 8 + j, y - 10, 2, 2);
    ctx.fillStyle = "#ffd23f"; ctx.fillRect(x + 4 + j, y - 4, 2, 1);
  };
  G.pinata = (ctx, x, y, ang, hp) => {
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(ang);
    ctx.fillStyle = OUT; ctx.fillRect(0, -40, 1, 30);
    const cols = ["#ffd23f", "#ff4fa3", "#2ee6d6", "#ff7a1a", "#7b4dff"];
    ctx.fillStyle = OUT; ctx.fillRect(-9, -11, 19, 19);
    ctx.fillStyle = hp < 2 ? "#c9a3ff" : "#ff4fa3"; ctx.fillRect(-8, -10, 17, 17);
    ctx.fillStyle = "#ffd23f"; ctx.fillRect(-4, -6, 9, 9);
    for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283; ctx.fillStyle = OUT; ctx.fillRect(Math.round(Math.cos(a) * 14) - 3, Math.round(Math.sin(a) * 14) - 3, 7, 7); ctx.fillStyle = cols[i]; ctx.fillRect(Math.round(Math.cos(a) * 14) - 2, Math.round(Math.sin(a) * 14) - 2, 5, 5); }
    ctx.restore();
  };
  G.mystery = (ctx, x, y, t) => {
    const b = Math.round(Math.sin(t * 3) * 1.5);
    ctx.globalAlpha = 0.3 + Math.sin(t * 5) * 0.15; ctx.fillStyle = "#ff2bd6"; ctx.fillRect(x - 6, y - 22 + b, 28, 24); ctx.globalAlpha = 1;
    ctx.drawImage(G.icon("box"), x + 2, y - 13 + b);
    ctx.fillStyle = "#ff2bd6"; ctx.fillRect(x + 6, y - 13 + b, 4, 12);
    for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.57; ctx.fillStyle = i % 2 ? "#ffd23f" : "#ff2bd6"; ctx.fillRect(Math.round(x + 8 + Math.cos(a) * 14), Math.round(y - 8 + Math.sin(a) * 8), 2, 2); }
  };
  G.sign = (ctx, x, y, text, col = "#2ea84a") => {
    ctx.font = '6px "Press Start 2P"'; ctx.textBaseline = "top";
    const w = Math.ceil(ctx.measureText(text).width) + 10;
    ctx.fillStyle = OUT; ctx.fillRect(x + w / 2 - 2, y - 30, 4, 30); ctx.fillRect(x - 1, y - 46, w + 2, 18);
    ctx.fillStyle = col; ctx.fillRect(x, y - 45, w, 16);
    ctx.fillStyle = "#f4f4f4"; ctx.fillRect(x + 1, y - 44, w - 2, 1); ctx.fillText(text, x + 5, y - 40);
  };
  G.todo = (ctx, x, y, text, t) => {
    ctx.font = '6px "Press Start 2P"'; ctx.textBaseline = "top";
    const w = Math.ceil(ctx.measureText(text).width) + 8;
    const j = Math.sin(t * 17 + x) > 0.9 ? 2 : 0;
    ctx.fillStyle = "rgba(26,15,42,.85)"; ctx.fillRect(x + j, y, w, 12);
    ctx.fillStyle = "#ff2bd6"; ctx.fillRect(x + j, y, 2, 12); ctx.fillText(text, x + 5 + j, y + 3);
  };
  G.van = (ctx, x, y, t, lights, dark) => {
    x = Math.round(x); y = Math.round(y);
    const body = dark ? "#2a2834" : "#f4f4f4", low = dark ? "#1a1822" : "#c9c3dc", stripe = dark ? "#ff2bd6" : "#7b4dff";
    ctx.fillStyle = OUT; ctx.fillRect(x - 1, y + 3, 66, 24); ctx.fillRect(x + 43, y - 1, 21, 6);
    ctx.fillStyle = body; ctx.fillRect(x, y + 4, 64, 22); ctx.fillRect(x + 44, y, 19, 6);
    ctx.fillStyle = low; ctx.fillRect(x, y + 22, 64, 4);
    ctx.fillStyle = stripe; ctx.fillRect(x, y + 14, 64, 4);
    ctx.fillStyle = "#ffd23f"; ctx.fillRect(x, y + 18, 64, 1);
    ctx.fillStyle = "#3b4a7a"; ctx.fillRect(x + 46, y + 1, 14, 10); ctx.fillStyle = "rgba(255,255,255,.4)"; ctx.fillRect(x + 48, y + 2, 4, 2);
    ctx.fillStyle = OUT; ctx.fillRect(x + 42, y + 4, 1, 18);
    ctx.fillStyle = dark ? "#ff2bd6" : "#ffd23f"; ctx.fillRect(x + 12, y + 7, 14, 4); ctx.fillRect(x + 26, y + 6, 3, 6); ctx.fillStyle = "#c79a12"; ctx.fillRect(x + 12, y + 10, 14, 1);
    ctx.fillStyle = lights ? "#ffe27a" : "#e8e4dc"; ctx.fillRect(x + 62, y + 18, 2, 3);
    ctx.fillStyle = "#e83b3b"; ctx.fillRect(x, y + 18, 2, 3);
    for (const wx of [10, 48]) { ctx.fillStyle = OUT; ctx.fillRect(x + wx - 1, y + 21, 12, 12); ctx.fillStyle = "#2b2b3d"; ctx.fillRect(x + wx, y + 22, 10, 10); ctx.fillStyle = "#9aa3b5"; ctx.fillRect(x + wx + 3, y + 25, 4, 4); }
  };

  // objetos interactivos de los niveles
  G.object = (ctx, o, x, y, t) => {
    x = Math.round(x); y = Math.round(y);
    switch (o.kind) {
      case "terminal": case "pc": {
        ctx.fillStyle = OUT; ctx.fillRect(x, y - 26, 20, 26); ctx.fillStyle = "#4a4659"; ctx.fillRect(x + 1, y - 25, 18, 16);
        ctx.fillStyle = o.done ? "#2ee6a0" : (Math.floor(t * 3) % 2 ? "#ff7a1a" : "#ffd23f"); ctx.fillRect(x + 3, y - 23, 14, 12);
        ctx.fillStyle = OUT; ctx.fillRect(x + 5, y - 20, 10, 1); ctx.fillRect(x + 5, y - 17, 7, 1);
        ctx.fillStyle = "#6a7286"; ctx.fillRect(x + 7, y - 9, 6, 4); ctx.fillRect(x + 2, y - 5, 16, 5);
        if (o.kind === "terminal") { ctx.drawImage(G.icon("cursor"), x + 12, y - 36); }
        break;
      }
      case "lever": {
        ctx.fillStyle = OUT; ctx.fillRect(x, y - 8, 18, 8); ctx.fillStyle = "#6a7286"; ctx.fillRect(x + 1, y - 7, 16, 6);
        const a = o.done ? 0.7 : -0.7;
        ctx.save(); ctx.translate(x + 9, y - 6); ctx.rotate(a); ctx.fillStyle = OUT; ctx.fillRect(-2, -24, 4, 24); ctx.fillStyle = "#9aa3b5"; ctx.fillRect(-1, -23, 2, 22); ctx.fillStyle = "#ff7a1a"; ctx.fillRect(-4, -28, 8, 6); ctx.restore();
        ctx.fillStyle = "#ff7a1a"; ctx.font = '5px "Press Start 2P"'; ctx.textBaseline = "top";
        break;
      }
      case "sensor": {
        ctx.fillStyle = OUT; ctx.fillRect(x + 2, y - 22, 14, 22); ctx.fillStyle = "#2b2840"; ctx.fillRect(x + 3, y - 21, 12, 20);
        ctx.fillStyle = o.done ? "#2ee6a0" : "#ff4fa3"; for (let i = 0; i < 4; i++) ctx.fillRect(x + 5 + i * 2, y - 12 - ((Math.sin(t * 8 + i) + 1) * 3 | 0) * (o.done ? 0 : 1), 1, 8);
        ctx.drawImage(G.icon("mega"), x + 3, y - 36);
        break;
      }
      case "switch": {
        ctx.fillStyle = OUT; ctx.fillRect(x + 2, y - 2, 12, 14); ctx.fillStyle = o.done ? "#2ee6a0" : "#e83b3b"; ctx.fillRect(x + 3, y - 1, 10, 12);
        ctx.fillStyle = "#ffffff"; ctx.fillRect(x + 6, y + 2, 4, 4); ctx.drawImage(G.icon("bird"), x + 2, y - 16);
        break;
      }
      case "hook": {
        const p = Math.sin(t * 4) * 1.5;
        ctx.fillStyle = OUT; ctx.fillRect(x + 6, y - 14, 4, 10); ctx.beginPath(); ctx.arc(x + 8, y, 6 + p * 0.3, 0, 7); ctx.fill();
        ctx.fillStyle = "#ffd23f"; ctx.beginPath(); ctx.arc(x + 8, y, 4, 0, 7); ctx.fill(); ctx.fillStyle = OUT; ctx.fillRect(x + 7, y - 1, 2, 2);
        break;
      }
      case "hide": {
        if (o.look === "plant") { ctx.fillStyle = OUT; ctx.fillRect(x + 3, y - 12, 14, 12); ctx.fillStyle = "#c4553a"; ctx.fillRect(x + 4, y - 11, 12, 11); ctx.fillStyle = "#2ea84a"; for (let i = 0; i < 5; i++) ctx.fillRect(x + i * 4 - 2, y - 30 + (i % 2) * 4, 6, 20); }
        else { ctx.fillStyle = OUT; ctx.fillRect(x, y - 32, 20, 32); ctx.fillStyle = o.look === "curtain" ? "#c0203a" : "#3b8a6a"; ctx.fillRect(x + 1, y - 31, 18, 31); ctx.fillStyle = "rgba(0,0,0,.25)"; for (let k = y - 28; k < y - 18; k += 3) ctx.fillRect(x + 4, k, 12, 1); }
        break;
      }
      case "npc": if (!o.hideSprite) G.drawPerson(ctx, o.spec, "idle", Math.floor(t * 2) % 2, x, y - 24, o.facing || -1); else { ctx.globalAlpha = 0.5 + Math.sin(t * 4) * 0.3; ctx.fillStyle = "#ffd23f"; ctx.fillRect(x + 6, y - 30, 4, 4); ctx.globalAlpha = 1; } break;
      case "dog": G.husky(ctx, x - 2, y - 16, Math.floor(t * 4) % 2 ? 0 : 2, o.facing || -1); break;
      case "save": G.savepoint(ctx, x, y, o.lit, t); break;
      case "exit": {
        ctx.fillStyle = OUT; ctx.fillRect(x - 1, y - 49, 26, 49); ctx.fillStyle = "#2a2254"; ctx.fillRect(x, y - 48, 24, 48);
        for (let i = 0; i < 6; i++) { ctx.fillStyle = ["#ff7a1a", "#ffd23f", "#2ee6d6", "#ff4fa3", "#6fb7ff", "#7b4dff"][(i + Math.floor(t * 8)) % 6]; ctx.fillRect(x + 2 + i, y - 46 + i * 2, 20 - i * 2, 44 - i * 4); }
        break;
      }
    }
  };
})();
