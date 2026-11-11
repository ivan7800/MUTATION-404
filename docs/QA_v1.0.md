# QA — MUTATION 404 v1.0

## Cobertura nueva

- Un tema propio por cada una de las 8 ruinas exteriores.
- Acceso navegable a reliquias de planta y extracción única.
- Simulación persistente de peligros.
- Guardado y recuperación de reputación, recompensas, mapas y eventos.
- Regresión automática de v0.9.

La validación manual del navegador real y de los dos sistemas operativos debe anotarse como pendiente salvo prueba efectiva.

## Resultados ejecutados en esta entrega

- `npm run test:core`: 88/88 superadas.
- `npm run typecheck`: correcto.
- `npm run build:offline`: correcto.
- Arranque portátil desde ZIP extraído: comprobar de forma independiente.
- Navegador real Linux/Windows: pendiente.

## Limitaciones conocidas

- Renderizador Canvas 2D (no se ha migrado a PixiJS/WebGL2).
- Las salas temáticas modifican decoración, ambiente y recompensas, pero reutilizan la topología procedural de v0.9.
- No existe todavía una campaña narrativa completa, ni ecosistemas comparables a Caves of Qud.
- No se han creado ejecutables nativos Electron.
