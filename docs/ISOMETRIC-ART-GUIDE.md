# Guía de arte de Nácar

## Inventario de producción

| Familia | Cantidad | Contrato |
|---|---:|---|
| Suelo | 36 | 6 variantes por bioma, rombo 64×32 |
| Roca | 18 | 3 por bioma, agrietadas, anclaje al pie |
| Flora y residuos | 18 | 3 por bioma; cristales, tuberías, raíces y ramas |
| Arquitectura | 18 | 3 por bioma; módulo bajo, torre y arco; construcción diferenciada |
| Errante | 48 | 4 orientaciones × (idle 2, marcha 4, ataque 4, daño 1, muerte 1) |
| Habitantes | 6 | Cartógrafa, mecánico, investigadora, mercader, custodio y civil |
| Criaturas | 48 | 8 familias × 3 estados × 2 frames; seis especies, élite y jefe |
| Objetos | 8 | Puerta, escaleras, terminal, agua, botín, recurso y ampolla |
| Total | 200 | PNG + JSON generados desde código original |

`nacar.json` conserva rectángulo y pivote de cada recurso. El renderer selecciona los frames con reloj visual de 180 ms; las acciones mantienen su pose 650 ms. La simulación conserva sus turnos independientes.

## Materiales

Salinas: hueso y costra, depósitos y grietas. Ceniza: hollín, linteles fracturados y brasas. Hierro: conductos, respiraderos y paneles. Vidrio: prismas verticales y reflejos localizados. Médula: arcos de raíces y nervaduras. Umbral: pináculos rotos y signos geométricos.

La textura de desgaste usa un patrón estable de píxeles sin tocar el RNG del juego. No se requiere red para cargar los recursos durante una partida instalada offline. Los artefactos generados no necesitan Pillow en tiempo de ejecución; solo la regeneración del atlas lo necesita.

## Uso

No sesgar los sprites de personajes con una matriz isométrica. Proyectar su pie y pintar en vertical. Ordenar arquitectura y personajes en una lista de profundidad común. Atenuar una construcción que solape al Errante; no revelar casillas desconocidas. La dirección de teclado usa coordenadas del mundo.

Los iconos de interacción deben comunicar su función también mediante texto. Turquesa señala energía y exploración; ámbar, selección e interacción; carmesí, daño. Los estados importantes no dependen solo del color. Las opciones CRT son complementarias; no sirven para ocultar falta de detalle.

## Límites del lenguaje elegido

Es pixel art geométrico original, con atlas y siluetas reproducibles. La imagen conceptual elegida por el usuario tiene más densidad pictórica. La equivalencia estética solo puede aceptarse mirando las capturas reales; la existencia de 200 entradas o de tests aprobados no acredita esa fidelidad. No utilizar imágenes conceptuales como capturas del juego.
