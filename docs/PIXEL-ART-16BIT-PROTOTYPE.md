# MUTATION-404 — Prototipo de pixel art de 16 bits

## Alcance

Esta rama prueba el lenguaje visual en **Salinas** únicamente. No cambia reglas,
campaña, controles, progresión ni formato de guardado; los otros cinco biomas
siguen renderizándose igual que en `main`.

## Tratamiento visual

- La escena de Salinas se compone en una superficie lógica de 392×187 píxeles.
- Se amplía al viewport con nearest-neighbour para conservar bloques nítidos.
- Suelo, afloramientos, coral óseo y arquitectura tienen sprites propios,
  dibujados en una cuadrícula de 48×64 y exportados como atlas alternativo.
- Personajes, habitantes y criaturas conservan sus poses y animaciones, con
  frames reducidos a la misma cuadrícula de producción.
- El tratamiento se limita al canvas del mapa; texto, HUD y controles HTML
  conservan su resolución normal.
- Canvas y la presentación PixiJS/WebGL reutilizan la misma imagen final.

## Criterio de revisión

La prueba debe verse como una decisión artística deliberada y seguir siendo
legible durante movimiento, selección, exploración y combate. Esta pasada es un
prototipo: la revisión visual debe decidir si el atlas alternativo y la
composición mejoran la lectura. Se conservan los contratos de pivote,
profundidad y animación.

## Comprobación

El contrato de escala se prueba para los seis biomas; las pruebas comprueban la
integridad del atlas, el uso de sprites de Salinas y el buffer de baja
resolución.
