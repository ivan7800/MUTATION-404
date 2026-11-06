# Estado persistente de MUTATION-404 ASCENSION
Actualizado: 2026-11-06. Rama: codex/mutation-404-ascension-3. Paquete 2.9.0; esquema 11.

## Orden vigente
Completar las fases pendientes por entregas verificables. El usuario autorizó continuar todas las fases; no fusionar ni desplegar automáticamente main.

## Entregas
- Cobertura de ataques ampliada: QA Chromium pasa 25 resultados, incluidas doce escenas de seis especies × Canvas/WebGL. Cada escena carga un enemigo vivo, usa el botón normal de esperar y comprueba las filas de la pose en el pintado real; son fixtures de combate, no partidas completas. Suite 187/187; matriz de 576 combinaciones confirma equivalencia exacta con/sin captura de eventos. Total de dominios combinatorios documentados: 279865. Lint, contratos de campaña y Pages local pasan. La revisión visual humana de duración/legibilidad y el recorrido completo de campaña siguen pendientes.
- Combate visual validado a nivel de eventos: dispatchWithFeedback captura eventos opcionales de takeEnemyTurn en un WeakMap transitorio, sin ampliar GameState/ActionResult ni consumir RNG. Solo expone eventos visibles de acciones aceptadas; la interfaz revalida zona y visibilidad. Ambas vistas comparten ocho poses ASCII de ataque con expiración de 280 ms y heridas prioritarias. Once regresiones de especies, habilidades, aturdimiento, comandos inválidos y equivalencia exacta de resultado/partida pasan; total 186 pruebas. TypeScript, lint, builds normal/offline, QA Chromium general (13 resultados), offline, Pages, contratos y conservación pasan. La QA general no verifica visualmente cada pose transitoria; esa legibilidad individual, preparación anticipada y coreografía completa siguen pendientes.
- Profundidad compartida validada: Canvas ordena glifos conservando sus estilos; Pixi usa profundidad por pies y dimensiones de celda. Paredes delante/detrás comprobadas mediante el pintor real instrumentado. 175 pruebas pasan; typecheck, lint, builds normal/offline, Chromium WebGL/Canvas, offline, Pages local, contratos de campaña y conservación pasan. Capturas de ambos backends inspeccionadas. Cobertura combinatoria: 279289 combinaciones finitas descritas en QA_COMBINATORIA.md. Esto no completa la oclusión de sombras/barras/FX ni certifica todas las partidas. El bloqueo de ejecución por límite de uso se resolvió; API GitHub sigue Forbidden.
- Coherencia de presentación validada: paleta de terreno compartida, opacidad de actores Canvas restaurada, glifos de terreno elevados, barra de Nácar corregida y altura de campos WebGL basada en su casilla. 171 pruebas, typecheck, lint, builds normal/offline, contratos de campaña, QA Chromium/offline, Pages local y conservación pasan. Capturas Canvas/WebGL inspeccionadas. Las pruebas nuevas ejecutan el dibujo Canvas con contexto instrumentado, comprueban opacidad/altura/salud, ausencia de mutaciones lógicas y ocultación de actores fuera de visión. No cierra la oclusión completa ni unifica iluminación.
- Fase 1: auditoría y corrección documental subidas. Informe histórico: AUDITORIA_ASCENSION_3_FASE_1.md.
- Persistencia: P1-01 y P1-02 corregidos en 7d804a8, artefactos en 583ab46. Doce regresiones de eventos, migraciones y bitácoras; validación anterior 170/170, navegador/offline/conservación.
- Arte ASCII, entrega actual: retirados atlas y ramas píxel inactivos. Migradas las guardas de texto a pruebas del catálogo compartido; se mantienen verificaciones de HP del jefe y pruebas de navegador. Nuevas composiciones para +, ?, x, v completan el vocabulario de terreno. Los glifos desconocidos conservan fallback de un carácter.
- Arquitectura visual: altura de terreno centralizada en ascii-art.ts y usada por Canvas/Pixi. Perfil de texturas cuenta el atlas ASCII realmente usado.
- TypeScript, lint, builds normal/offline y 169 pruebas pasan. El descenso desde 170 se debe a consolidar pruebas del atlas obsoleto, con una regresión de alturas añadida. Chromium WebGL/Canvas, offline, Pages local, contratos de campaña y balance pasan en el build final. Conservación: 2500 transiciones y siete catálogos pasan tras retirar las rutas píxel. Capturas finales webgl.png y canvas-fallback.png inspeccionadas; se mantienen diferencias de iluminación/color, pendientes de unificar.

## Pendientes explícitos
1. Entrega de consolidación ASCII validada; no equivale al cierre integral de la dirección artística.
2. Completar efectos exclusivamente ASCII, oclusión por altura y equivalencia de paletas/capas. No considerar terminadas las fases 2–3 por retirar el atlas.
3. Fase 4: ataques por especie y estados ligados a eventos aceptados, sin inferir ataques únicamente por cercanía.
4. Fase 5: recorrido completo mediante comandos reales, sin asignar quest/events/HP para saltar progresión; contratos actuales no sustituyen ese recorrido.
5. Fase 6: tutorial, accesibilidad y revisión integral de teclado/táctil y recuperación.
6. Fase 7: updates entre builds distintos, sesión larga, dispositivos, GPU física, lector de pantalla y prueba humana.
7. Fase 8: PR pendiente; API GitHub bloqueada en la última comprobación. Rama subida, sin merge ni publicación.

No se certifica juego completo, RC ni nota de calidad.
