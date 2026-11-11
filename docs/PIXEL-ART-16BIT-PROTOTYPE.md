# MUTATION-404 — Prototipo de pixel art de 16 bits

## Alcance

Esta rama prueba el lenguaje visual en **Salinas** únicamente. No cambia reglas,
campaña, controles, progresión ni formato de guardado; los otros cinco biomas
siguen renderizándose igual que en `main`.

## Tratamiento visual

- La escena de Salinas se compone en una superficie lógica de 392×187 píxeles.
- Se amplía al viewport con nearest-neighbour para conservar bloques nítidos.
- El tratamiento se limita al canvas del mapa; texto, HUD y controles HTML
  conservan su resolución normal.
- Canvas y la presentación PixiJS/WebGL reutilizan la misma imagen final.

## Criterio de revisión

La prueba debe verse como una decisión artística deliberada y seguir siendo
legible durante movimiento, selección, exploración y combate. Esta pasada es un
prototipo de resolución: no pretende afirmar todavía que el atlas actual tenga
la densidad de ilustración de la referencia. La siguiente iteración, si la
dirección funciona, sustituirá los sprites geométricos de Salinas por sprites
pixelados dibujados a mano y conservará los contratos de pivote, profundidad y
animación.

## Comprobación

El contrato de escala se prueba para los seis biomas y la prueba del pintor
comprueba que la escena de Salinas atraviesa el buffer de baja resolución.
