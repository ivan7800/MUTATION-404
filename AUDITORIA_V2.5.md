# MUTATION 404 — Auditoría técnica y jugable v2.5

**Fecha:** 30 de octubre de 2026  
**Alcance:** lectura del motor, revisión focalizada de navegación, amenazas, seguridad, progresión, guardados, 8 ruinas y pruebas automatizadas de navegador.  
**No es una certificación de una partida humana de varias horas.** La evaluación visual humana, medidas en GPU físicas y equilibrio completo siguen pendientes.

## Defectos reales encontrados y corregidos

| Prioridad | Defecto | Evidencia técnica | Corrección |
|---|---|---|---|
| P0 — Jugabilidad | La zona segura de Faro Ciego se aplicaba solo por coordenadas; dentro de las ruinas y de CERO-7 podía impedir que los enemigos actuaran, persiguieran o se movieran, aun cuando la zona no fuese la superficie. | `inFaro(player)`, `nextStep` y filtros de movimientos en `packages/core/src/combat.ts`. | Seguridad condicionada a `zone==='surface'`, con compatibilidad para los tests aislados sin zona. La búsqueda de caminos acepta el contexto. |
| P1 — Equilibrio | En zonas subterráneas con coordenadas coincidentes con Faro Ciego podían activarse recuperación de exposición, concentración y límites al empuje cinético. | `sheltered=inFaro(s.player)` y reglas relacionadas en `packages/core/src/game.ts`. | El descanso protegido, los ecos y el empuje solo reconocen Faro Ciego en la superficie. |
| P2 — Experiencia | Las ocho ruinas tenían ficción y amenazas específicas en sus definiciones, pero la interfaz reutilizaba descripciones subterráneas genéricas. | `RUIN_THEMES` en `depths.ts` frente a `#biome-description`, `#biome-lore` y `#climate-note` en `main.ts`. | El HUD presenta nombre, estrato, anomalía y texto exclusivo de cada ruina. |

## Verificaciones añadidas

- Prueba de combate en las mismas coordenadas en la superficie y dentro de una ruina: el refugio sigue protegido, pero los enemigos de la ruina actúan.
- Prueba de pathfinding que comprueba el uso correcto del perímetro de Faro Ciego únicamente en la superficie.
- Contaminación y protección ambiental con coordenadas repetidas en distintas zonas.
- Guardado/carga de enemigo de élite en el segundo nivel de una ruina.
- Acceso al corredor y al custodio en las ocho ruinas regionales y cinco semillas.
- Repetición determinista de 400 acciones y comprobación del guardado final en cinco semillas.
- Diversidad narrativa verificable de las ocho ruinas.
- Chromium: pantalla de El Ojo del Silencio, advertencias de peligro y texto narrativo propio, WebGL y Canvas alternativo; capturas e informe JSON guardados como artefactos.

## Riesgos conocidos y trabajo pendiente

1. **Rendimiento real:** el intervalo de `requestAnimationFrame` en Chromium automatizado es diagnóstico, no una prueba de FPS, consumo de memoria o latencia en Windows/Linux/iPhone y tarjetas gráficas físicas.
2. **Juego completo:** no se ha simulado con verificación narrativa una campaña humana de 10–20 horas ni todos los árboles de decisiones, diálogos y economía. Una puntuación final de 9,5/10 no está justificada.
3. **Arte:** el atlas de sprites pixel art se genera por código y la mayoría de regiones siguen representándose mediante glifos. Se necesita revisión visual comparada y trabajo de arte adicional.
4. **Interfaz y accesibilidad:** pendientes pruebas de teclado completas en diálogos, lectores de pantalla y táctil real, especialmente iPhone.
5. **Balance:** faltan telemetrías de supervivencia, recursos, ritmo de progresión, equipamiento óptimo y dificultad por zona.
6. **Persistencia:** se mantienen formatos antiguos, pero aún es aconsejable ensayar un conjunto amplio de archivos de guardado de versiones históricas reales.

## Reglas de publicación

`npm run typecheck`, `npm run test:core`, `npm run build:offline` y `node scripts/qa-browser.mjs` deben finalizar correctamente en GitHub Actions **antes** de declarar publicada la versión. Si una falla, se documenta y se corrige; no se desactiva el control.

## Próximo hito recomendado

v2.6: pruebas de 60–90 minutos con escenarios de supervivencia reproducibles, telemetría cuantitativa de dificultad y revisión humana de capturas, seguida de correcciones identificadas por evidencia. La prioridad es evitar más mecánicas hasta tener estabilidad del núcleo y un ciclo de juego equilibrado.
