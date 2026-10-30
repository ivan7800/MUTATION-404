# MUTATION 404 v2.9 — Auditoría reproducible y vertical slice artística

Fecha: 30-10-2026. Base: v2.8, commit ec02388a1fdcf2775fe7019119f2ef6b969add27.

## Hallazgo P1: discontinuidad visual regional

En `apps/web/src/pixi-renderer.ts`, la condición `this.artMode==='pixel'&&(eye||faro)` limitaba el atlas ilustrado a Faro Ciego y El Ojo del Silencio. Las demás regiones continuaban dibujando glifos incluso en modo píxel. Esto producía un salto de estilo entre la región de inicio y los biomas explorables. El fallback Canvas y el modo ASCII eran sistemas distintos y no se modifican.

## Corrección y alcance

- El modo píxel utiliza texturas rasterizadas y cacheadas para las losetas de todas las regiones visibles, con paletas propias para seis biomas. Se mantienen los detalles exclusivos de Faro Ciego y El Ojo del Silencio.
- La caché incluye el bioma para evitar reutilizar texturas equivocadas entre regiones.
- Las texturas son deterministas; no hay peticiones externas, dependencias nuevas ni cambios en las reglas del núcleo, persistencia o RNG.
- Se incorporan capturas automatizadas para una región exterior en ambos modos visuales.

## Reproducción

```bash
npm install --no-audit --no-fund
npm run typecheck
npm run test:core
node scripts/balance-audit.mjs
npm run build:offline
# Con Chromium disponible: CHROME_PATH=/ruta/a/chrome node scripts/qa-browser.mjs
```

Comprobar el artefacto `mutation-404-browser-qa` del workflow de Pages: `region-v29-pixel.png`, `region-v29-ascii.png` y `report.json`. Comparar con `faro-pixel.png` y `ojo-pixel.png`.

## Pendientes y criterios de aceptación

1. Auditoría visual humana de las capturas en monitor físico, resolución móvil y varias densidades de pantalla. El test de Chromium detecta errores y cambios de modo, pero no verifica calidad estética.
2. Jefe final específico: dejar de reutilizar el dron reforzado; exigir fases y feedback exclusivos.
3. Animaciones detalladas de ataques, daño y muerte por especie, sonido espacial y nueva mezcla musical.
4. Recorrido manual completo de los cinco actos, balance con builds diferentes, accesibilidad y evaluación de navegación.
5. Actualizar `docs/ROADMAP.md` y `docs/ARCHITECTURE.md`, aún referidos a versiones antiguas.

No confundir compilación, pruebas deterministas o capturas de navegador con aprobación de una campaña completa por jugadores reales.
