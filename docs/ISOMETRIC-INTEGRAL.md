# Nácar — transformación isométrica

Trabajo en rama desde `66eac19591e79a5f1cd80259c791994e59056dc1`.

## Implementado

- Proyección explícita e inversa en isometric.ts, sprites verticales con pie común y orden global por profundidad.
- Un pintor Canvas con presentación opcional WebGL; el fallback conserva atlas y proyección. ASCII permanece seleccionable para recuperación.
- Atlas original reproducible de 200 sprites con metadatos: 6 suelos y 3 rocas, flora y módulos de arquitectura por bioma; protagonista en cuatro orientaciones y estados, seis especies, élite, jefe, seis arquetipos NPC y objetos.
- Fondo de terreno retenido durante animación; animaciones usan reloj visual sin modificar el core.
- CSS consolidado, navegación secundaria plegable, menús y paneles con tokens compartidos y CRT menos invasivo por defecto.

## Recursos y autoría

`python3 scripts/art/build_isometric_assets.py` requiere Pillow y genera `apps/web/public/isometric/nacar.png` y `nacar.json`. Recursos originales escritos para este proyecto; pueden usarse y modificarse con el código del proyecto. No incorporan sprites de terceros. Los PNG de play/ son salida del build.

Cada celda del atlas mide 96×128 con pivote (48,112); el suelo es un rombo 64×32. Los elementos verticales se colocan por su pie sin sesgo afín. El generador documenta paletas y siluetas. La dirección de referencia es conceptual; estos recursos tienen un acabado geométrico propio, no equivalen a la ilustración generada.

## Evidencia inicial

- `npm ci --no-audit --no-fund`: realizado.
- `npm run typecheck`, `npm run lint`, `npm run build:offline`: correctos.
- `npm test`: 201 pruebas, 0 fallos.
- `node scripts/qa-campaign.mjs`: 3/3 finales, 12 checkpoints.
- Chromium local bloqueado por sockets AF_UNIX (`Operation not permitted`); ejecución con permisos ampliados rechazada por política. La CI realiza los recorridos en navegador y guarda qa-evidence como artefacto.

## Revisión visual y continuidad

Se han generado y revisado capturas reales de los seis biomas, mundo inicial, inventario y móvil en Chromium. Esa revisión llevó a compactar el encuadre y la cabecera móvil, adelantar la misión y separar las descripciones del inventario.

Las pruebas de navegador detectaron y motivaron correcciones de preservación del elemento de coordenadas, selección de Canvas sin WebGL y precarga offline de PNG/JSON. Los efectos de mutación tienen geometría propia y los ataques de enemigos usan sus eventos aceptados. Los interiores seleccionan materiales por identidad de zona; el core no cambia.

La guía completa está en ISOMETRIC-ART-GUIDE.md. El run 42928209791 verificó los seis biomas, el recorrido isométrico WebGL/Canvas y el modo offline con actualización de caché. Su batería legacy falló al intentar buscar glifos ASCII sobre el modo pixel Canvas; el recorrido ya selecciona ASCII explícitamente para esa comprobación. Está pendiente cerrar esa batería en el último commit y adjuntar la evidencia. No hay certificación en GPU física, revisión humana de toda la campaña ni equivalencia pictórica con la imagen conceptual. El arte nuevo tiene un acabado geométrico reproducible. La rama no se publica en main por esta PR.

## Reproducir

Ejecutar los comandos de AGENTS.md. Para navegador: `CHROME_PATH=/ruta/chrome node scripts/qa-browser.mjs`, `qa-pixel-biomes.mjs`, `qa-isometric.mjs` y `qa-offline.mjs`. Las escenas de biomas usan guardados de prueba, no demuestran una campaña jugada de principio a fin. WebGL SwiftShader no acredita GPU física.
