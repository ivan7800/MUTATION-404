# Estado persistente de MUTATION-404 ASCENSION
Actualizado: 2026-11-05.

## Orden y base
Entrega de persistencia validada: 170/170 pruebas (12 nuevas), typecheck, lint, builds normal/offline, diagnóstico P1, contratos de campaña (3 finales), balance, Pages local, QA Chromium WebGL/Canvas, offline y conservación (2500 transiciones/7 catálogos). Los bundles versionados se regeneran con el cambio. No se modificó RNG, daño, turnos o coordenadas. Resta implementar arte/oclusión/combate visual, recorrido real de campaña y UX; no se consideran completados por estas pruebas. La API del PR seguía bloqueada en la última comprobación.

Actualización posterior: el usuario autoriza completar las fases restantes. Primer bloque en curso: correcciones de persistencia. El límite de eventos aceptados pasa a 4096 sin truncar hitos; el límite de 50 era incompatible con los productores existentes. La bitácora se acota a 70 al serializar y al migrar; el cargador recupera bitácoras antiguas de hasta 1000 entradas validando su contenido. Esquema 11 conservado. Typecheck, lint y 169 pruebas pasan (11 regresiones nuevas); build y navegador pendientes de revalidación. El registro de Fase 1 debajo describe el estado anterior.

Solo Fase 1 de ASCENSION 3.0. Rama codex/mutation-404-ascension-3, base c5fb6e7e8bb2f648ea0b57910c6749d70174ba65, coincidente con main remoto al iniciar. Paquete 2.9.0; siguientes fases no iniciadas.

## Decisiones y evidencia
- Auditoría y documentación; simulación, renderizado, dependencias y assets conservados.
- Informe vigente: [AUDITORIA_ASCENSION_3_FASE_1.md](AUDITORIA_ASCENSION_3_FASE_1.md).
- npm ci, typecheck, lint, build, build:offline, test:core y npm test pasan; 158/158 por ejecución.
- Campaña: 3 finales / 12 checkpoints con fixtures. Conservación: 2.500 transiciones y 7 catálogos contra e0a9094. Balance: 24 semillas y cuatro escenarios.
- Chromium WebGL/Canvas y offline en subruta pasan. Sin campaña humana completa, Windows físico, GPU física o lector de pantalla.
- scripts/audit-phase1.mjs reproduce dos P1 abiertos: acción aceptada genera 51 eventos y migración v10 genera 71 mensajes; ambos impiden recargar.
- Git HTTPS lectura disponible; API GitHub devuelve Forbidden en esta sesión. No demuestra token inválido.
- Rama subida con commits 00c99b4 (auditoría/reproducciones) y 54fe4eb (documentación). `gh pr create` falló con `Post https://api.github.com/graphql: Forbidden`; no hay PR confirmado. [Descripción preparada](PR_ASCENSION_3_FASE_1.md). Se requiere habilitar acceso API en el entorno para completar la creación.

## Pendientes
1. Corregir los P1 en una entrega con pruebas de persistencia sin descartar progreso.
2. Completar PR cuando la API lo permita. No fusionar ni publicar main.
3. Migrar guardas textuales antes de retirar rutas píxel; consolidar altura/paletas/oclusiones en las fases posteriores.
4. Recorrer campaña con comandos reales; ampliar QA de updates, accesibilidad y hardware.

Los resultados históricos de ASCENSION-CONTINUIDAD no sustituyen esta evidencia ni certifican el juego terminado.
