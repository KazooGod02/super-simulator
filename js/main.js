// SUPER SIMULATOR · arranque
(() => {
  "use strict";
  const start = () => { SS.startScene(() => SS.scenes.title()); SS.run(); };
  const fonts = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('8px "Press Start 2P"'), document.fonts.load('12px "VT323"')]).catch(() => {})
    : Promise.resolve();
  // si las fuentes tardan (o no hay internet), arrancamos de todos modos
  Promise.race([fonts, new Promise(r => setTimeout(r, 1500))]).then(start);
})();
