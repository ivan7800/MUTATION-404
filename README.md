# MUTATION 404 — Pixel Rebirth

RPG isométrico de pixel art oscuro con horror cósmico, combate por turnos, exploración, mutaciones y campaña offline.

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Estado de la versión final

La rama `main` contiene la entrega Pixel Rebirth validada en una rama experimental antes de fusionarse. Conserva íntegramente `packages/core`, la campaña, el combate, los guardados de esquema 11, fabricación, mutaciones, mapas, modo offline y el fallback ASCII/Canvas.

La dirección pixel art incluye:

- Seis biomas con suelo, roca, flora, arquitectura y paleta propia: Salinas, Ceniza, Hierro, Vidrio, Médula y Umbral.
- Protagonista con frames de idle, desplazamiento, ataque, daño y muerte.
- Seis especies diferenciadas con frames alternos: crawler, sentinel, larva, moth, drone y spore.
- Identidades separadas para élites y jefe de campaña.
- Proyección isométrica PixiJS/WebGL, oclusión por capas, niebla, sombras, efectos pixelados y fallback ASCII.
- HUD retro gótico, menú, inventario, mutaciones, mapa, diario, fabricación, sistema, controles móviles y ajustes CRT accesibles.
- Pool de sprites de terreno reutilizable y atlas SVG original de celdas 32×32.

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
- `apps/web/src/pixel-renderer.ts`: renderer pixel PixiJS.
- `apps/web/src/pixi-renderer.ts`: renderer ASCII PixiJS.
- `apps/web/public/pixel/atlas.svg`: atlas original.
- `play/`: salida estática para GitHub Pages y uso offline.

Los guardados existentes mantienen el esquema 11. El botón `PIXEL ART` permite alternar al renderer ASCII durante la partida sin cambiar el estado de juego. La accesibilidad conserva reducción de movimiento, controles legibles y fallback Canvas.

## Historial técnico

Los informes históricos de campañas y auditorías se conservan en `docs/`. Describen sus respectivas versiones y no sustituyen el estado actual de este README.
