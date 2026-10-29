# MUTATION 404 — Informe de QA, v0.4 (W4)

**Fecha:** 29 de octubre de 2026.

## Ejecutado y comprobado en este entorno

- `tsc -p tsconfig.core.json` — **correcto**.
- `tsc -p tsconfig.play.json --noEmit` — **correcto**.
- `tsc -p tsconfig.play.json` + `node scripts/build-offline.mjs` — **correcto**. JS, CSS y HTML portables en `play/`.
- `node --test tests/*.test.mjs` — **56 pruebas superadas, 0 fallidas**, incluidos los casos heredados de las versiones anteriores.
- Cobertura nueva: nueve mutaciones definidas, gasto de puntos genéticos sin duplicación, habilidades con coste/recuperación, empuje y aturdimiento, grito neural, ignición con campo persistente, paso de fase bloqueado por muros, regeneración condicionada por exposición, progresión con genes, difusión eléctrica en salmuera, resistencia/vulnerabilidad elemental, guardados corruptos rechazados, migración del esquema anterior, repetición determinista y conexión de controles en el cliente compilado.
- Los tests heredados incluyen 1.000 semillas y cobertura de alcanzabilidad de puntos de interés. **No son 1.000 partidas completas jugadas**.

## No verificado todavía

- **La navegación gráfica con Chromium ha fallado por restricciones del contenedor**; no se pudo completar un test automatizado E2E real ni capturar una imagen fiable del juego. La compilación y los tests del cliente no sustituyen esa prueba.
- No se han medido FPS ni latencias de respuesta en tu Linux Mint.
- No se ha verificado personalmente el audio con altavoces.
- Los lanzadores son scripts de Node y requieren probarse en el equipo del usuario; no hay `.exe` ni AppImage.
- No se ha probado publicación en GitHub ni integración de PixiJS.

## Ruta de pruebas manual de v0.4

1. Abrir v0.4 en la misma URL que v0.3 (deteniendo el servidor anterior). Confirmar que posición, misión, enemigos, biomas y equipo se conservan. Guardar una vez y recargar.
2. Empezar partida nueva; abrir el menú **U**. Ver que hay dos mutaciones iniciales y un gen disponible. Desbloquear una y confirmar que no puede volver a comprarse ni gastar puntos de más.
3. Salir de Faro Ciego, seleccionar con T a un enemigo visible y pulsar **1**. Confirmar que pierde PV y queda aturdido. Volver a pulsar 1: el sistema debe indicar recuperación.
4. Tras obtener genes subiendo niveles, aprender **Grito neural**, **Ignición** y **Paso de fase**. Probar alcance, bloqueo, falta de concentración y recuperación.
5. Verificar que `ϟ` se muestra sobre salmuera y puede propagarse, que `♨` inflige daño y que `¤` provoca exposición. Probar sinergias y resistencia de mutaciones pasivas.
6. Comprobar que algunos enemigos generan nubes, descargas o campos ambientales y que estas advertencias se registran en la bitácora.
7. Guardar, recargar, observar persistencia de mutaciones, puntos y campos ambientales; repetir con partida v0.1 y v0.2 si están disponibles.
8. Verificar funcionalidad táctil, controles de teclado, botones, modales e interfaz con diferentes zooms y tamaños de pantalla.
9. Registar pasos y evidencias de cualquier fallo; no declarar la versión lista para publicación definitiva sin estas comprobaciones.

## Alcance

Alfa jugable, **no** clon completo de Caves of Qud ni simulación ecológica global. El motor sigue utilizando Canvas 2D. En v0.5 se abordarán sectores mayores conectados, mazmorras de varias alturas, asentamientos, economía y eventos emergentes; cada subsistema requerirá sus propias pruebas.
