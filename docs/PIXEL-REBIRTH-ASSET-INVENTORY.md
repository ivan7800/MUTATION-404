# Pixel Rebirth — inventario de recursos

La rama `codex/mutation-404-pixel-rebirth-complete` mantiene el atlas en
`apps/web/public/pixel/atlas.svg`. Todos los recursos son SVG pixelados
originales, con celdas de 32×32 px, muestreo nearest-neighbour y anclaje
centrado en el pie de la entidad.

## Terreno y arquitectura

| Bioma | Suelo | Landmark | Captura |
|---|---|---|---|
| Salinas de Vértice | `floor-salinas` | `prop-salinas` | `qa-evidence/pixel-biomes/salinas.png` |
| Páramos de Ceniza | `floor-ceniza` | `prop-ceniza` | `qa-evidence/pixel-biomes/ceniza.png` |
| Cinturón de Hierro | `floor-hierro` | `prop-hierro` | `qa-evidence/pixel-biomes/hierro.png` |
| Galerías de Vidrio | `floor-vidrio` | `prop-vidrio` | `qa-evidence/pixel-biomes/vidrio.png` |
| Bosque de Médula | `floor-medula` | `prop-medula` | `qa-evidence/pixel-biomes/medula.png` |
| Margen del Umbral | `floor-umbral` | `prop-umbral` | `qa-evidence/pixel-biomes/umbral.png` |

Los props se seleccionan desde la biomeología determinista del core. El suelo
ya no depende de un único tile genérico; roca, vegetación, anomalía, ruina y
efectos conservan capas de oclusión independientes.

## Entidades y frames

- Protagonista: idle, desplazamiento, ataque, daño y muerte; dos frames para
  idle, desplazamiento y ataque.
- Especies: crawler, sentinel, larva, moth, drone y spore; dos frames únicos
  por especie.
- Élites: `elite-drone-a/b`.
- Jefe de campaña: `boss-heart-a/b`.
- Efectos: ataque, daño, mutación y campos ambientales pixelados.

Los frames se alternan desde el reloj visual del renderer; la simulación no
se modifica y los guardados siguen usando el mismo esquema.

## Evidencia de fase

`node scripts/qa-pixel-biomes.mjs` genera seis capturas y un `report.json`.
La batería existente `node scripts/qa-browser.mjs` cubre Canvas, WebGL,
combate, móvil, campaña y fallback ASCII. Esta rama sigue siendo experimental
hasta completar la revisión visual y de rendimiento del renderer.
