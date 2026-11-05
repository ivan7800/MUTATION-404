# ASCENSION 3.0 — Auditoría Fase 1

Fecha: 2026-11-05. Base: `c5fb6e7e8bb2f648ea0b57910c6749d70174ba65`; rama `codex/mutation-404-ascension-3`. Alcance: inspección, pruebas, reproducciones y corrección documental. No se implementan las fases 2–8 ni se certifica release 3.0.

## Método y alcance

Revisados README, AGENTS, CHANGELOG, arquitectura, roadmap, QA, estado/continuidad y biblias históricas; módulos de apps/web/src y packages/core/src, tests, scripts y workflow Pages. Revisión dirigida de límites de persistencia, renderizadores, arte, campaña, build/worker y cobertura. No es una prueba exhaustiva de todos los estados ni auditoría formal de seguridad.

La base local coincidía con main remoto al iniciar. Checkout inicialmente limpio. No se infiere sincronización permanente con otras ramas ni estado del sitio publicado.

## Hallazgos priorizados

P0: bloqueo general/pérdida masiva confirmada. P1: riesgo alto de pérdida de progreso o carga fallida. P2: deuda y cobertura relevantes. P3: mantenimiento y presentación. **No se confirmó P0**; esto no prueba ausencia de defectos críticos.

| ID | Prioridad / estado | Evidencia e impacto | Siguiente acción |
|---|---|---|---|
| P1-01 | P1 abierto, reproducido | game.ts, rama interact/relic añade eventos sin límite; deserialize rechaza más de 50. Guardado aceptado con 50 eventos pasa a 51 tras una interacción aceptada y ya no carga | Definir persistencia de hitos e incidentes sin truncar progreso; regresión con campaña larga y backup |
| P1-02 | P1 abierto, reproducido | game.ts, deserialize valida log <=70 y luego usa game.log.push para mensajes de migración. Un v10 válido con 70 entradas migra a 71 y falla al recargar | Usar política acotada de mensajes; probar migraciones/recarga antes de sobrescribir |
| P2-01 | P2 corregido en documentación | ARCHITECTURE describía esquema 4, clave v03, solo Canvas y sin fabricación; ROADMAP dejaba sectores como futuros; AGENTS negaba Pixi | Documentos contrastados con esquema 11, módulos y backends actuales |
| P2-02 | P2 deuda confirmada | pixi-renderer.ts: artMode readonly = ascii, pero conserva tileTexture, creatureTexture y ramas pixel. vertical-slice.test.mjs exige su presencia textual | Migrar pruebas a comportamiento antes de retirar código en Fase 2 |
| P2-03 | P2 duplicación confirmada | renderer.ts terrainHeight y pixi-renderer.ts terrainLift duplican reglas; paletas, capas, FX y minimapas se implementan por separado | Contrato de presentación compartido y pruebas comparables en Fase 3 |
| P2-04 | P2 cobertura incompleta | qa-campaign.mjs asigna quest/events/zone y guardian.hp=0; pruebas campaign-v28 también usan fixtures | Conservar contratos, añadir recorrido real sin saltos en Fase 5 |
| P2-05 | P2 cobertura incompleta | interface, atmosphere, startup-audio y vertical-slice leen texto fuente. Pueden pasar con rutas inactivas; no prueban semántica visual | Sustituir gradualmente por pruebas de comportamiento sin eliminar cobertura |
| P2-06 | P2 deuda arquitectónica | game.ts 816 líneas y main.ts 566, muchas sentencias compactadas: mezclan comandos/persistencia y DOM/almacenamiento/efectos respectivamente | Separaciones pequeñas con conservación y regresiones, no reescritura global |
| P2-07 | P2 brecha con objetivo | Composiciones ASCII compartidas, pero siguen Graphics/Canvas geométricos para FX y superficies; orden Canvas por pases frente a zIndex Pixi | Revisar oclusión/FX posteriormente; no declarar paridad completa |
| P2-08 | P2 validación pendiente | deserialize valida arrays de snapshots de zona por tamaño sin validar cada enemigo/campo como en la zona activa | Añadir casos de importación corrupta y transición; riesgo estático, no fallo reproducido en esta entrega |
| P3-01 | P3 mantenimiento | build:offline emite play/js y bundles; tests leen ambos. Workflow compila offline dos veces y no ejecuta qa-conservation | Documentar artefactos, revisar redundancia y conservación CI por separado |
| P3-02 | P3 presentación | main.ts muestra VERSIÓN 2.7 / SISTEMA v1.0 mientras package.json es 2.9.0 | Unificar etiqueta visible en una entrega UX, sin cambiar esquema de guardado |
| P3-03 | P3 corregido en documentación | README mezcla etapas píxel/ASCII y continuidad contiene estados históricos contradictorios | Cabeceras identifican historial y enlazan evidencia actual |

## Reproducción de los P1

Desde raíz, ejecutar `npm ci`, `npm run build:offline`, `npm run test:core` y `node scripts/audit-phase1.mjs`.

1. P1-01 prepara una partida de semilla 404, una ruina sin hostiles y 50 incidentes. Comprueba que carga, interactúa con la reliquia usando dispatch, confirma acción aceptada y 51 eventos, y observa `Estado de regiones o facciones corrupto` al recargar.
2. P1-02 prepara JSON v10 con 70 mensajes. deserialize lo acepta y produce v11 con 71 mensajes; serialize seguido de deserialize falla con `Bitácora inválida`.

Son fixtures de límites explícitos, no evidencia de una partida humana que haya alcanzado esos estados. El primer fallo es relevante porque las escrituras de reliquias, archivos, resonancias y visitas comparten events, y no todas respetan el límite que sí aplica el cargador. El script usa aserciones para confirmar los fallos, sale cero si se reproducen y no se añade como gate verde de calidad. No escribe partidas ni modifica el núcleo.

## Validaciones ejecutadas

Linux, Node 24.22.1, npm 11.9.0; lockfile existente. Chromium 155.0.8059.79 y Playwright Core 1.64.1, WebGL software SwiftShader.

| Comando | Resultado real |
|---|---|
| npm ci --no-audit --no-fund | 134 paquetes instalados |
| npm run typecheck / npm run lint | PASS ambos |
| npm run build / npm run build:offline | PASS ambos; sin diferencias de assets versionados |
| npm run test:core / npm test | 158/158 cada ejecución, 0 fallidas/canceladas/omitidas |
| npm run qa:campaign | 158 pruebas y contratos 3/3 finales, 12 checkpoints |
| node scripts/qa-conservation.mjs | 2.500 transiciones y 7 catálogos iguales a e0a9094 |
| node scripts/balance-audit.mjs | 24 semillas en cuatro escenarios; drones 20/24 supervivientes; telemetría, no balance certificado |
| node scripts/check-pages.mjs | 4 archivos locales; no valida URL pública |
| node scripts/qa-browser.mjs | PASS, 13 resultados: WebGL, Canvas, responsive, controles, recuperación y final preparado |
| node scripts/qa-offline.mjs | PASS instalación/subruta, recarga sin red, guardado, chunks WebGL y actualización en espera |
| node scripts/audit-phase1.mjs | Dos defectos P1 confirmados, abiertos |

La instalación/red, subprocesos y servidor local requieren permisos fuera del sandbox en esta máquina. Con esos permisos se ejecutaron; no atribuir aquellos EPERM al juego. Git HTTPS funciona; API GitHub devuelve Forbidden incluso fuera del sandbox. No se ha comprobado el despliegue público ni la configuración Pages por API.

## Evidencia visual y límites

Capturas e informes generados en qa-evidence (ignorado por Git). Se inspeccionaron webgl.png y canvas-fallback.png: ambos muestran mundo isométrico y controles; diferencias visibles en fondo, iluminación y color. No es comparación pixel-perfect: hay animación y capturas en momentos diferentes. No se cambió la apariencia en esta entrega.

QA offline usa dos revisiones HTTP del mismo build; no cubre dos builds completos con assets diferentes y múltiples pestañas. No se probaron GPU física, Windows, sesiones largas, lector de pantalla, escucha humana o campaña completa. Las métricas JS/RAF no certifican FPS físicos.

## Correcciones y entrega

Actualizados README, AGENTS, CHANGELOG, ARCHITECTURE, ROADMAP, PROJECT_STATE y cabeceras QA/ASCENSION-CONTINUIDAD/TEST_REPORT. Se añade este informe y el script diagnóstico. La consolidación de arquitectura de Fase 1 es documental: inventario de fuentes, contratos y deuda; no se refactorizan reglas ni backends antes de decidir sus regresiones.

Los P1 permanecen abiertos y deben atenderse antes de certificar persistencia. Se prepara la entrega en commits pequeños y una descripción de PR. No se fusiona ni publica main; la creación remota del PR requiere acceso API operativo.
