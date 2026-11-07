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
servidor pasa fuera del sandbox de red. Chromium genera capturas de escritorio
y la captura WebGL exterior (`qa-evidence/webgl.png`) confirma la composición
pixel e isométrica; la batería completa de escenas aún necesita dividirse en
lotes porque el proceso Chromium pierde estabilidad al acumular muchos
contextos WebGL consecutivos. Esa revisión queda pendiente antes de fusionar
esta rama en `main`.

## Criterio de salida de la rama

1. Repetir QA en lotes separados para exterior, ruina, combate y móvil.
2. Revisar capturas de cada lote y corregir cualquier sprite ausente, escala o
   encuadre inconsistente.
3. Fusionar en `main` sólo cuando esos lotes terminen sin errores de página.
