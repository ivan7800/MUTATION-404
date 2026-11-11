# MUTATION-404 — Rescate artístico

## Vertical slice

La rama `codex/mutation-404-art-rescue` contiene una primera vertical slice jugable sobre el motor existente. La lógica de combate, campaña, guardados y navegación no se modifica. La transformación se concentra en el catálogo ASCII compartido y en la duración de la coreografía visual.

La slice conserva el exterior de Faro Ciego y las ruinas del motor como escenarios jugables. Ahora comparten composiciones densas para:

- protagonista con capa, postura, ataque, daño, mutación, interacción y muerte;
- carroñero, vigía y larva con anatomías distintas, además de polilla, dron y pastor;
- muros monumentales, arcos de ruina, cavernas, sal, vegetación, árboles, agua y formaciones elevadas;
- ataques, recuperación, heridas, muerte y efectos ASCII con el mismo lenguaje visual;
- variaciones deterministas seleccionadas por semilla, sin añadir estado al guardado.

La pintura de cinco líneas reduce su escala tipográfica de forma controlada para conservar el detalle dentro de cada celda. Canvas y Pixi llaman a `paintComposition` con el mismo catálogo; Pixi sigue generando un atlas de texturas a partir de esas composiciones.

## Evidencia reproducible

`node scripts/qa-browser.mjs` pasa en Chromium con Canvas fallback y Pixi/WebGL. Genera capturas reales en `qa-evidence/canvas-fallback.png`, `qa-evidence/webgl.png`, `qa-evidence/faro-ascii-unified.png`, `qa-evidence/ojo-ascii-unified.png` y las escenas de ataque de las seis especies. También verifica móvil de 390 y 768 píxeles.

La suite de regresión conserva toda la cobertura anterior y pasa con 193 pruebas; añade una comprobación de densidad de la slice. El build offline se regenera con `npm run build:offline`.

## Diferencias que persisten

La referencia Cyclopean no está disponible como archivo dentro del entorno, así que no se puede hacer una comparación píxel a píxel ni medir su densidad exacta. Frente al objetivo descrito persisten estas diferencias:

1. La escena sigue usando una cuadrícula isométrica de celdas; la referencia tiene composiciones monumentales más continuas y menos repetitivas.
2. Canvas y WebGL comparten arte y geometría, pero su luminancia final difiere por el tratamiento de filtro, composición y GPU.
3. La ruina y la caverna todavía proceden del vocabulario de terreno existente; falta una escena arquitectónica compuesta a mano con cámara y encuadre propios.
4. El HUD ocupa mucho espacio vertical y deja una zona negra alrededor del mapa en escritorio; aún no tiene la jerarquía visual de una pantalla ilustrada.

Por esas diferencias, esta entrega es una vertical slice artística verificable, no una aprobación final ni una fusión en `main`. No se amplían otros biomas hasta revisar esta slice con la referencia visual disponible y aprobar su dirección.
