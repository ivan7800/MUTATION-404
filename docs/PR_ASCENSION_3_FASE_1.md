## Resultado

ASCENSION conserva esquema 11 y su núcleo determinista. Esta rama acumula auditoría, correcciones de persistencia y consolidación del renderizado ASCII isométrico. Se corrigieron guardados de más de 50 eventos y migraciones con bitácora llena; se retiró el atlas píxel inactivo y se compartieron alturas y paletas. Canvas restaura opacidad de actores, eleva el terreno y usa la vida máxima correcta de Nácar. Los campos WebGL usan la altura de su casilla.

La entrega más reciente ordena los glifos de Canvas y Pixi por profundidad proyectada, con regresión de paredes delante/detrás. Sombras, fondos, barras y FX mantienen capas separadas: no se declara oclusión volumétrica completa.

## Validación

175 pruebas aprobadas. TypeScript, lint y build normal/offline pasan. La cobertura combinatoria enumera 279289 entradas en tres dominios explícitos: hitos de campaña, celda/zoom y materiales/paletas. Ver docs/QA_COMBINATORIA.md. No son partidas completas ni cobertura de todas las secuencias posibles.

QA final Chromium/offline y conservación: consultar docs/PROJECT_STATE.md para el estado actual. Las capturas se generan en qa-evidence y no se incluyen como archivos versionados.

## Pendientes y límites

No se han completado todas las fases del plan. Faltan FX exclusivamente ASCII, oclusión completa, ataques por especie con eventos aceptados, recorrido de campaña sin saltos, revisión integral de UX/accesibilidad, pruebas humanas y hardware. No declarar RC ni calidad 9,5/10. No fusionar ni desplegar automáticamente en main.
