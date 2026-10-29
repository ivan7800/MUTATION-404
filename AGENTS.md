# MUTATION 404 — Normas para asistentes de desarrollo

1. Leer `README.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/QA.md` y las biblias de `docs/PREPRODUCCION/`.
2. Mantener `packages/core` puro (sin APIs de DOM, PixiJS ni Electron).
3. Toda aleatoriedad del motor debe usar RNG de semillas; no usar `Math.random()` para resultados de simulación.
4. Los comandos no aceptados no deben consumir turnos. Los estados narrativos deben ser guardables y deterministas.
5. No copiar código, personajes, arte, nombres ni diálogos protegidos de Caves of Qud.
6. No llamar «completada» a una funcionalidad sin pruebas reproducibles.
7. Antes de una nueva versión: `npm run typecheck`, `npm run test:core`, `npm run build:offline`, `npm test` y prueba interactiva en navegador cuando sea posible.
8. Nunca sobrescribir ni migrar una partida sin mecanismo de recuperación y prueba de migración.
9. La implementación actual usa Canvas2D. No afirmar que PixiJS esté integrado hasta instalarlo, ejecutarlo y verificarlo.
10. No publicar en GitHub ni alterar repositorios remotos sin autorización.
