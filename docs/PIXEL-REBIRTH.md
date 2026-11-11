# MUTATION-404 — Pixel Rebirth

Esta rama contiene la primera vertical slice jugable de la migración visual.
El motor de juego, combate, campaña, guardados y renderizador ASCII siguen
siendo compatibles; el modo nuevo se activa por defecto en WebGL y se puede
cambiar desde `PIXEL ART` a ASCII durante la partida.

## Entrega actual

- Atlas SVG original de 32 px con protagonista animado, crawler, sentinel,
  larva, terreno, ruina, roca, vegetación, mutación y efectos de combate.
- Proyección isométrica centrada en el protagonista, con oclusión por capas,
  niebla, iluminación por caracteres/sprites y escalado nearest-neighbour.
- Exterior y ruina explorables, enemigos diferenciados, combate, HUD premium,
  CRT configurable y fallback Canvas 2D/ASCII.
- Limpieza de sprites y destrucción de contextos al salir de la página para
  evitar degradación en sesiones largas.

## Verificación

Comandos reproducibles:

```sh
npm run typecheck
npm run lint
npm run build:offline
npm test
node --test tests/server.test.mjs
node scripts/qa-browser.mjs
```

TypeScript, lint, build y las 28 suites de lógica pasan. La prueba del
servidor pasa fuera del sandbox de red. Chromium valida en lotes aislados
WebGL, Canvas 2D, escritorio, móvil, exterior, ruina, jefe, final de campaña y
los seis enemigos. Las capturas se conservan en `qa-evidence/`; la referencia
principal es `qa-evidence/webgl.png`.

## Criterio de salida de la rama

1. Mantener el fallback ASCII como ruta de compatibilidad.
2. Añadir nuevos biomas sólo después de conservar la misma escala y densidad
   visual de esta vertical slice.
3. Tratar la expansión de contenido como una fase posterior; la slice actual
   ya está lista para publicación.
