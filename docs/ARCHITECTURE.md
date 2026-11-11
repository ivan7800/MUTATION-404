# Arquitectura técnica — MUTATION 404 / ASCENSION
Actualizado: 2026-11-05 sobre c5fb6e7; paquete 2.9.0, sin release 3.0.

## Capas
- packages/core/src: TypeScript sin DOM, Canvas, PixiJS ni Electron. game.ts concentra comandos, diálogos, transiciones, persistencia y migración.
- world.ts, frontier.ts, depths.ts: mapas de 96×64, sectores, interiores, CERO-7 y ruinas. fov.ts calcula visibilidad; rng.ts mantiene RNG explícito.
- combat.ts, mutations.ts, environment.ts, ecology.ts, civilizations.ts: combate, genoma, campos, recursos y asentamientos. campaign.ts deriva cinco actos y finales desde misión/eventos.
- apps/web/src/main.ts: DOM, comandos, audio y almacenamiento. Inicia Canvas y carga PixiJS asíncronamente; fallo de inicialización mantiene Canvas.
- renderer.ts y pixi-renderer.ts: backends isométricos con composiciones, alturas visuales y escala 1,45 compartidas en ascii-art.ts. No hay selector píxel/ASCII; atlas y ramas píxel retirados, pruebas migradas al catálogo compartido.
- ascii-art.ts contiene datos y pintado Canvas; es independiente de simulación, pero no exclusivamente datos. tactical.ts filtra amenazas visibles; audio.ts usa Web Audio tras activación del usuario.

## Persistencia y turnos
Esquema **11**, admite versiones **2–11**. Clave principal: mutation404.v10.save, copia .backup y búsqueda histórica v09–v01. Se valida antes de cargar/importar; la copia anterior válida se conserva. visible y dialogue no se serializan; visibilidad se recalcula.

Incluye zona activa, snapshots, RNG, misión, eventos, genoma y ecología. dispatch valida comandos; advance procesa tiempo/sistemas. No hay scheduler ECS general como el propuesto en preproducción.

El cargador admite hasta 4096 eventos válidos sin truncar hitos. Las bitácoras antiguas de hasta 1000 mensajes válidos se recuperan conservando los últimos 70; migración y serialización respetan ese límite operativo. Los dos P1 de [la auditoría](AUDITORIA_ASCENSION_3_FASE_1.md) disponen de regresiones; no se certifica recuperación universal de contenido corrupto.

## Build y distribución
- npm run dev: Vite; base relativa ./ para subdirectorios.
- npm run build: TypeScript sin emisión, Vite a dist/web y worker con digest.
- npm run build:offline: TypeScript a play/js, copias HTML/CSS y bundle Vite a play/assets; genera play/sw.js. Los módulos legacy se conservan para pruebas; no editarlos como fuente.
- node scripts/server.mjs --no-open: sirve play/ en loopback, puerto 8787 por defecto, sin depender de npm para servir el build existente.
- Lanzadores: scripts/launch.mjs exige Node 22+ y puede instalar/compilar. No hay Electron ni empaquetado nativo.
- Worker por versión/scope, precarga bundles y espera cierre de clientes para actualizar. Guardados en localStorage, no IndexedDB.
- CI valida PR a main; deploy exige main y evento distinto de PR.

## Deuda
Alturas, paletas, FX y orden de capas difieren entre backends. Compartir composiciones no acredita equivalencia visual exacta ni oclusión completa. game.ts y main.ts concentran responsabilidades. Las biblias de preproducción son propuestas históricas, no inventario de implementación.
