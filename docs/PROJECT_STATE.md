# Estado persistente de MUTATION-404 ASCENSION
Actualizado: 2026-11-05.

## Orden y base
Solo Fase 1 de ASCENSION 3.0. Rama codex/mutation-404-ascension-3, base c5fb6e7e8bb2f648ea0b57910c6749d70174ba65, coincidente con main remoto al iniciar. Paquete 2.9.0; siguientes fases no iniciadas.

## Decisiones y evidencia
- Auditoría y documentación; simulación, renderizado, dependencias y assets conservados.
- Informe vigente: [AUDITORIA_ASCENSION_3_FASE_1.md](AUDITORIA_ASCENSION_3_FASE_1.md).
- npm ci, typecheck, lint, build, build:offline, test:core y npm test pasan; 158/158 por ejecución.
- Campaña: 3 finales / 12 checkpoints con fixtures. Conservación: 2.500 transiciones y 7 catálogos contra e0a9094. Balance: 24 semillas y cuatro escenarios.
- Chromium WebGL/Canvas y offline en subruta pasan. Sin campaña humana completa, Windows físico, GPU física o lector de pantalla.
- scripts/audit-phase1.mjs reproduce dos P1 abiertos: acción aceptada genera 51 eventos y migración v10 genera 71 mensajes; ambos impiden recargar.
- Git HTTPS lectura disponible; API GitHub devuelve Forbidden en esta sesión. No demuestra token inválido.

## Pendientes
1. Corregir los P1 en una entrega con pruebas de persistencia sin descartar progreso.
2. Completar PR cuando la API lo permita. No fusionar ni publicar main.
3. Migrar guardas textuales antes de retirar rutas píxel; consolidar altura/paletas/oclusiones en las fases posteriores.
4. Recorrer campaña con comandos reales; ampliar QA de updates, accesibilidad y hardware.

Los resultados históricos de ASCENSION-CONTINUIDAD no sustituyen esta evidencia ni certifican el juego terminado.
