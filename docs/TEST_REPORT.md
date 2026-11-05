# Informe de pruebas

## Revalidación de Fase 1 — 2026-11-05

Base c5fb6e7, Node 24.22.1, npm 11.9.0, Chromium 155.0.8059.79, Playwright Core 1.64.1, Linux. `npm ci` instaló 134 paquetes. Typecheck, lint, builds normal/offline, test:core y npm test: PASS; 158 pruebas por suite, cero fallidas/omitidas. `qa:campaign`: la misma suite más 3 finales y 12 checkpoints con fixtures. Conservación: 2.500 transiciones y 7 catálogos; balance: 24 semillas / cuatro escenarios (20/24 supervivientes contra drones, no certificado de equilibrio). `check-pages`: 4 archivos comprobados localmente, no despliegue público.

Chromium: 13 resultados de QA, WebGL/Canvas y responsive; offline en `/MUTATION-404/`, guardado y actualización en espera: PASS. Capturas webgl.png y canvas-fallback.png inspeccionadas: ambas muestran proyección isométrica, con diferencias visibles en fondo, iluminación y color. Evidencias regenerables en `qa-evidence/`; no son una campaña humana ni una comparación pixel-perfect.

`node scripts/audit-phase1.mjs`: reproduce **dos defectos P1 abiertos**. Salida cero significa que confirmó los fallos esperados, no que estén corregidos. Véase [auditoría](AUDITORIA_ASCENSION_3_FASE_1.md). La validación anterior del sandbox fallaba por permisos; las operaciones afectadas pasaron al ejecutarse con permisos autorizados. La API GitHub sigue devolviendo Forbidden.

## Registro anterior

## Estado

Última suite: **158/158 PASS**.

Regresión específica de campaña: **11/11 PASS**. Comprueba acto inicial, ocho archivos, ocho custodios, bloqueo de activación, aparición real del guardián, fases de Nácar, los tres desenlaces y persistencia tras guardar/cargar. Esto verifica contratos deterministas; no sustituye una partida humana completa.

- TypeScript y lint: PASS.
- Build normal y offline: PASS.
- Conservación contra `e0a9094`: PASS, 2.500 transiciones y 7 catálogos.
- Balance determinista: PASS, 24 semillas.
- Chromium WebGL y Canvas: PASS.
- Chromium móvil/tableta: PASS.
- Guardado corrupto, copia de rescate y exportación JSON: PASS funcional.
- Service worker: PASS en instalación, aislamiento, actualización y recarga offline.
- Windows físico, GPU física, lector de pantalla y partida humana prolongada: NO COMPROBADO.

Las capturas regenerables se almacenan en `qa-evidence/` y no forman parte del producto publicado.

La auditoría reproducible también está disponible con `npm run qa:campaign`. Recorre los hitos persistentes y los tres desenlaces tras serialización; es cobertura de contratos deterministas y mantiene `humanPlaythrough: false`, por lo que no sustituye una partida humana prolongada.
