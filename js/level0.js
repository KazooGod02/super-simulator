// SUPER SIMULATOR · Nivel 0: Culiacán (la ruta de reparto)
// Coordenadas en tiles de 16 px. El piso está en la fila 11.
(() => {
  "use strict";
  SS.buildLevel0 = () => {
    const L = new SS.Level(160, 14);
    const O = (x0, y0, x1, y1, c) => L.fill(x0, y0, x1, y1, c, "over");

    // ----- base -----
    L.fill(0, 11, 159, 13, "#");
    L.fill(13, 10, 13, 10, "Q");
    L.fill(17, 9, 18, 10, "Q");
    L.fill(20, 8, 22, 8, "=");
    L.fill(25, 6, 31, 6, "-");            // azotea de la casa 1
    L.fill(38, 8, 40, 8, "=");
    L.fill(49, 11, 51, 13, ".");          // hoyo en la calle
    // cochera con bocina: 3 tiles de alto para que Kazoo la pueda brincar
    L.fill(66, 8, 70, 8, "W");
    L.fill(70, 9, 70, 10, "W");
    L.fill(66, 9, 66, 10, "G");
    L.fill(72, 7, 78, 7, "=");            // toldo de la tienda
    L.fill(82, 10, 82, 10, "Q");
    L.fill(83, 9, 83, 10, "Q");
    L.fill(84, 8, 84, 10, "Q");
    L.fill(87, 6, 89, 6, "=");
    L.fill(91, 3, 93, 3, "=");
    L.fill(99, 6, 105, 6, "-");           // azotea de la casa 3
    L.fill(155, 2, 159, 10, "W");         // fin de la ruta

    // ----- lo que aparece cuando empieza el glitch -----
    O(20, 10, 20, 10, "X");
    O(21, 9, 21, 10, "X");
    O(56, 6, 56, 10, "F");                // reja alta junto a la casa 2
    O(88, 8, 88, 10, "X");
    O(89, 9, 89, 10, "X");
    O(112, 11, 115, 13, "_");             // la calle se borra
    O(112, 13, 115, 13, "^");
    O(120, 7, 120, 10, "F");              // la primera reja
    O(124, 7, 128, 7, "X");               // jaula con un kazoo dorado
    O(124, 8, 124, 10, "F");
    O(128, 8, 128, 10, "F");

    // ----- decorado -----
    L.houses = [
      { x: 25, w: 7, color: "#f2b35a", trim: "#c47a3a", door: 28, num: "214", npc: "cuquita" },
      { x: 57, w: 7, color: "#7fd3c4", trim: "#3a9a8a", door: 60, num: "309", npc: "beto" },
      { x: 99, w: 7, color: "#c9a3ff", trim: "#8a5ad0", door: 102, num: "7", npc: "kevin" },
    ];
    L.store = { x: 71, w: 9, label: "ABARROTES DOÑA LUPE" };
    L.palms = [11, 36, 47, 80, 95, 118, 133, 146];
    L.lamps = [6, 34, 70, 110, 140];
    L.speaker = { x: 63 };
    L.garage = { x: 66, y0: 9, y1: 10 };
    L.pinata = { x: 44 * 16, y: 150 };
    L.van = { x: 32, y: 144 };
    L.endSign = 149;
    L.mystery = { x: 147 * 16 };
    L.todos = [[128, 2, "TODO: arreglar esto"], [97, 1, "TODO: textura"], [60, 2, "ENEMIGO_TEMP"], [28, 1, "TODO: ¿y el cielo?"], [8, 2, "TODO: final"]];

    // ----- objetos -----
    const items = [];
    const coin = (x, y) => items.push({ kind: "coin", x, y });
    const row = (x0, x1, y, step = 1) => { for (let x = x0; x <= x1; x += step) coin(x, y); };
    row(3, 8, 10);
    coin(13, 9); coin(17, 8); coin(18, 8);
    row(20, 22, 7);
    coin(26, 5); coin(27, 5);
    items.push({ kind: "photo", x: 30, y: 5, id: "photo_van" });
    row(33, 37, 10);
    coin(48, 9); coin(49, 8); coin(50, 7); coin(51, 8); coin(52, 9);
    row(55, 58, 10);
    row(73, 77, 6);
    coin(82, 9); coin(83, 8); coin(84, 7);
    row(87, 89, 5);
    items.push({ kind: "gk", x: 92, y: 2, id: "gk_toldo" });
    row(100, 104, 5);
    row(108, 118, 10, 2);
    row(130, 146, 10, 2);
    items.push({ kind: "gk", x: 68, y: 10, id: "gk_cochera" });
    items.push({ kind: "gk", x: 126, y: 10, id: "gk_jaula", glitchOnly: true });
    items.push({ kind: "roll", x: 78, y: 6, id: "roll_tienda" });
    items.forEach((it, i) => { if (!it.id) it.id = "coin_" + i; it.px = (it.x + 0.5) * 16; it.py = (it.y + 0.5) * 16; });
    L.items = items;

    // ----- enemigos (solo con glitch) -----
    L.spawns = [
      ["blob", 142], ["blob", 136], ["temp", 131], ["temp", 117], ["blob", 104], ["fly", 100], ["temp", 93],
      ["blob", 86], ["temp", 79], ["blob", 62], ["fly", 50], ["temp", 45], ["blob", 38], ["fly", 30], ["blob", 24], ["temp", 15],
    ];
    return L;
  };
})();
