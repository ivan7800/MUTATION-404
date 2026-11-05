## Problema y resultado

La documentación principal describía esquema 4 y Canvas exclusivo aunque main ya incluye esquema 11 y Canvas/PixiJS isométricos. Esta Fase 1 actualiza el inventario técnico y registra dos defectos P1 de persistencia reproducibles que la suite existente no detecta: una reliquia puede elevar events de 50 a 51 y bloquear carga; una migración v10 con 70 mensajes genera 71 y bloquea recarga.

Se limita a auditoría, documentación y un script diagnóstico. Sin cambios de jugabilidad, renderizado, RNG, guardados, dependencias o assets. Fases 2–8 no iniciadas; sin incremento de versión.

## Archivos

- docs/AUDITORIA_ASCENSION_3_FASE_1.md: hallazgos P0–P3, evidencia, reproducción y limitaciones.
- scripts/audit-phase1.mjs: fixtures que confirman los dos P1 abiertos; salida cero no certifica calidad del juego.
- README.md, AGENTS.md, CHANGELOG.md: estado vigente y referencias históricas.
- docs/ARCHITECTURE.md, ROADMAP.md, PROJECT_STATE.md: arquitectura real, decisiones y pendientes.
- docs/QA.md, ASCENSION-CONTINUIDAD.md, TEST_REPORT.md: contexto histórico y resultados actuales.

## Validación

Base c5fb6e7, Node 24.22.1 / npm 11.9.0, Chromium 155 / Playwright Core 1.64.1, Linux.

- npm ci: 134 paquetes. Typecheck, lint, build y build:offline: PASS.
- test:core y npm test: 158/158 cada ejecución, cero fallidas/omitidas.
- qa:campaign: 158 tests más 3 finales y 12 checkpoints con fixtures.
- qa-conservation: 2.500 transiciones y siete catálogos iguales a e0a9094.
- balance-audit: 24 semillas/cuatro escenarios; drones 20/24 supervivientes, no certificado de equilibrio.
- qa-browser: 13 resultados PASS, WebGL/Canvas, controles, recuperación y responsive.
- qa-offline: PASS bajo /MUTATION-404/, guardados y actualización en espera.
- check-pages: cuatro archivos locales verificados. git diff --check: PASS.
- audit-phase1: dos P1 reproducidos, NO corregidos.

## Capturas, riesgos y pendientes

Capturas generadas e inspeccionadas localmente: qa-evidence/webgl.png y canvas-fallback.png. El directorio está ignorado; no se adjuntan imágenes remotas a este PR. Ambos muestran proyección isométrica con diferencias de fondo/color. Son regenerables con qa-browser; CI conserva el artefacto mutation-404-browser-qa.

Priorizar correcciones de límites de guardado con regresiones y recuperación sin descartar hitos. Permanecen rutas píxel inactivas ligadas a tests textuales, duplicación de alturas/paletas, oclusión incompleta y cobertura de campaña basada en fixtures. No se acredita campaña humana, GPU física, Windows, lector de pantalla ni actualización entre dos builds completos. No fusionar ni desplegar automáticamente.
