# SUPER SIMULATOR

El último Simulator de **Kazoo Studios**. Kazoo encuentra la Kazoonita, una piedra que abre portales entre dimensiones, y tiene que juntar a César, Jesús, Carlos y Daniel antes de que Simulator Cero les borre la partida.

**+18:** humor adulto, igual que toda la franquicia.

**Jugar:** https://kazoogod02.github.io/super-simulator/

## Qué trae

- **Prólogo:** flashback en la Dimensión 01 (oozaK contra KazooGod01), la ruta de reparto en Culiacán, el paquete, la Kazoovan y la carretera a casa de César.
- **Acto I (cualquier orden):** El Cuarto Limpio (César), Guamúchil sin Librito + carrera a Mocorito + pelea en el tren (Jesús), La Escuela del Silencio (Carlos) y La Primavera Feliz (Daniel). Cada uno termina con su versión genérica como jefe.
- **Acto II:** Telenovela, Anime, Lucha Libre, Prehistoria e Internet. Hay caminos que solo abre cierto compa.
- **Acto III:** persecución de la Kazoovan Oscura, Proyectos Abandonados, la Papelera, Simulator Cero (4 fases) y Guardar Partida.
- **5 finales**, 20 fotos del grupo, Kazoos Dorados, 30 notas TODO, pláticas en la van, misiones de recuerdo, taller, 5 minijuegos secretos y personajes secretos.
- **Cooperativo:** conecta un segundo control y entra desde la pausa.

## Controles

| Acción | Teclado | Control | Celular |
|---|---|---|---|
| Moverse | ← → / A D | Stick / cruceta | ◀ ▶ |
| Saltar (mantén para más alto) | Espacio | A | A |
| Correr | Shift | RT | automático |
| Ataque | J / Z | X | B |
| Especial | K / X | Y | Y |
| Habilidad de mundo | L / C | B | X |
| Revisar / hablar | ↑ / W | ▲ | ▲ |
| Esconderse | ↓ / S | ▼ | ▼ |
| Cambiar de compa | Q / E o 1-5 | LB / RB | ⇄ |
| Pausa | Esc / P | Start | II |

## Cómo está hecho

Todo se dibuja y suena con código, sin imágenes ni archivos de audio.

| Archivo | Qué tiene |
|---|---|
| `js/core.js` | Pantalla, controles, guardado, escenas |
| `js/audio.js` | Efectos y música chiptune |
| `js/gfx.js` | Personajes, caras, tiles, fondos de cada dimensión |
| `js/ui.js` | Diálogos, menús, HUD |
| `js/story.js` | Todos los textos |
| `js/world.js` | Física, jugador, enemigos |
| `js/chars.js` | Habilidades de cada compa |
| `js/play.js` | La escena de niveles (equipo, checkpoints, jefes, sigilo) |
| `js/bosses.js` | Los jefes |
| `js/level0.js` | Culiacán (prólogo) |
| `js/levels.js` | Todas las demás dimensiones y el orden entre niveles |
| `js/scenes.js` | Título, flashback, prólogo, Kazoovan |
| `js/drive.js` | La carretera (prólogo, carrera y persecución) |
| `js/minigames.js` | Los cartuchos secretos |
| `js/finale.js` | Decisión, créditos y finales |

La partida se guarda en el navegador en cada checkpoint.

Si cambias un archivo y el navegador sigue usando el viejo, sube el número `?v=` en las líneas de `index.html`.

## Jugar en local

Sirve la carpeta con `python -m http.server` y abre `http://localhost:8000`.
