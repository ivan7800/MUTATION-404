# Informe de pruebas

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
