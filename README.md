# MUTATION 404 — Pixel Rebirth

RPG isométrico de pixel art oscuro con horror cósmico, combate por turnos, exploración, mutaciones y campaña offline.

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Dirección isométrica de Nácar

La rama `codex/mutation-404-isometric-integral` introduce proyección explícita, sprites verticales, profundidad global y un atlas original de 200 recursos. Canvas 2D y la presentación WebGL comparten el mismo pintor y la misma imagen; la falta de GPU ya no obliga a cambiar de estilo.

El rediseño conserva la simulación en `packages/core`, la campaña y los guardados de esquema 11. La interfaz agrupa las acciones secundarias en un panel desplegable manteniendo sus atajos de teclado. ASCII sigue disponible como modo de recuperación.

El inventario y las decisiones de arte están en [ISOMETRIC-ART-GUIDE](docs/ISOMETRIC-ART-GUIDE.md). El estado, resultados de QA y limitaciones se registran en [ISOMETRIC-INTEGRAL](docs/ISOMETRIC-INTEGRAL.md). Las imágenes conceptuales no son capturas del juego.

## Verificación

Comandos reproducibles:

```sh
npm ci
npm run typecheck
npm run lint
npm run build:offline
npm run test:core
node --test tests/server.test.mjs
node scripts/qa-browser.mjs
node scripts/qa-pixel-biomes.mjs
```

La validación Chromium cubre WebGL, Canvas 2D, móvil, guardados, campaña, combate, seis especies, jefe y los seis biomas. Las capturas y los informes se generan en `qa-evidence/` y se publican como artefactos de GitHub Actions.

El inventario de atlas y las coordenadas verificadas están en [docs/PIXEL-REBIRTH-ASSET-INVENTORY.md](docs/PIXEL-REBIRTH-ASSET-INVENTORY.md). La documentación de la vertical slice está en [docs/PIXEL-REBIRTH.md](docs/PIXEL-REBIRTH.md).

## Desarrollo local

Requiere Node.js 22 o superior. Para servir la build estática:

```sh
npm run build:offline
node scripts/server.mjs --no-open
```

Para desarrollo con Vite:

```sh
npm run dev
```

No se necesitan CDN, backend ni conexión externa durante la partida.

## Arquitectura y compatibilidad

- `packages/core`: simulación determinista y reglas RPG puras.
- `apps/web/src/pixel-renderer.ts`: pintor isométrico Canvas con presentación WebGL opcional.
- `apps/web/src/isometric.ts`: proyección, inversión y profundidad compartidas.
- `apps/web/src/pixi-renderer.ts`: renderer ASCII PixiJS.
- `apps/web/public/isometric/nacar.png` y `nacar.json`: atlas original y metadatos; generador en `scripts/art/`.
- `apps/web/public/pixel/atlas.svg`: atlas histórico conservado para documentación y regresiones.
- `play/`: salida estática para GitHub Pages y uso offline.

Los guardados existentes mantienen el esquema 11. El botón `ISOMÉTRICO` permite alternar al renderer ASCII durante la partida sin cambiar el estado de juego. La accesibilidad conserva reducción de movimiento, controles legibles y fallback Canvas.

## Historial técnico

Los informes históricos de campañas y auditorías se conservan en `docs/`. Describen sus respectivas versiones y no sustituyen el estado actual de este README.
