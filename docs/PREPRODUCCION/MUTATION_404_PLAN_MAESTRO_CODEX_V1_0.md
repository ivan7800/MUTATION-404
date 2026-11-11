# MUTATION 404 — Plan maestro de producción para Codex v1.0

**Fecha:** 29 de octubre de 2026  
**Estado:** documento de preproducción, listo para revisar y utilizar como contrato de desarrollo. No se ha creado ni probado código del juego.  
**Fuentes internas:** Biblia de diseño v0.1; Biblia de sistemas v0.2; Biblia del mundo v0.3.

## 1. Objetivo de producto

Crear un RPG original ASCII a color de ciencia ficción posapocalíptica y horror cósmico, con motor sistémico determinista, exploración libre y un primer corte jugable en Las Salinas de Vértice. Inspiración en profundidad y libertad de Caves of Qud, sin copiar sus recursos, código, mapas, personajes, textos ni identidad distintiva.

**Primera entrega jugable (vertical slice 0.1):** Faro Ciego, Cruce 7, Torre del Nudo, Estación CERO-7 (3 niveles) y accesos a Galerías de Vidrio; 3 arquetipos enemigos, 3 mutaciones, combate melee/a distancia, inventario, equipo, una interacción eléctrica, misión «La frecuencia enterrada» con 3 vías y 3 resoluciones, reputación y guardado.

**Fuera de 0.1:** mundo planetario completo, 30 mutaciones implementadas, campaña entera, líquidos/gases/fuego plenamente simulados, fabricación extensa, traducción múltiple, multiplayer, integración C++/WASM, WebGPU. Lo diseñado no equivale a desarrollado.

## 2. Stack y compatibilidad

- **Lenguaje:** TypeScript estricto, ES modules.
- **Interfaz web:** Vite, DOM/CSS para paneles e inputs accesibles.
- **Render:** PixiJS con preferencia WebGL2 y un contrato `RendererAdapter` desacoplado del motor. Confirmar soporte real y fallback en la versión elegida; no prometer que todo PixiJS usa WebGL2 automáticamente.
- **Motor:** paquetes TypeScript sin dependencia de DOM, PixiJS ni Electron.
- **Escritorio:** Electron, un único código de juego, empaquetado `.exe` para Windows y AppImage o `.deb` para Linux tras verificar el pipeline.
- **Persistencia:** adaptador IndexedDB web; adaptador ficheros con operaciones atómicas en escritorio a través de IPC seguro.
- **Pruebas:** Vitest para unitarias/propiedad/integración; Playwright para E2E; `tsc --noEmit`, ESLint.
- **Automatización:** GitHub Actions: typecheck, lint, tests, build web; empaquetado de escritorio en workflows separados y verificables.
- **Datos:** JSON con esquemas versionados y validación de runtime (Zod u opción equivalente si se justifica).
- **Dependencias:** versiones fijadas mediante `package-lock.json`; nunca inventar comandos ni compatibilidades sin comprobar `package.json` y documentación de paquetes instalados.

## 3. Estructura de monorepositorio

```text
MUTATION-404/
├── AGENTS.md
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.base.json
├── apps/
│   ├── web/                 # interfaz, DOM, PixiJS, Vite
│   └── desktop/             # Electron main / preload / empaquetado
├── packages/
│   ├── core/                # RNG, scheduler, comandos, eventos, tipos
│   ├── world/               # sectores, terrenos, biomas y generadores
│   ├── entities/            # componentes, identidad, inventario
│   ├── combat/              # hit/damage, armas, estados
│   ├── mutations/           # habilidades y recargas
│   ├── ai/                  # percepción, planificación, A*
│   ├── simulation/          # electricidad, luego líquidos/gases
│   ├── content/             # catálogos y localizaciones por ID
│   ├── narrative/           # diálogos, flags, misiones, reputación
│   └── persistence/         # snapshots, deltas y migraciones
├── content/                 # datos originales: JSON, texto y audio
├── tests/
│   ├── fixtures/            # semillas y secuencias de acciones
│   ├── integration/
│   ├── procedural/
│   └── e2e/
├── docs/
│   ├── GDD.md
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── QA.md
│   └── ADR/                  # decisiones de arquitectura
└── .github/workflows/
```

Dividir paquetes solo cuando exista un límite claro de responsabilidad; no crear abstracciones que no tengan consumidores reales.

## 4. Contratos fundamentales (interfaces conceptuales)

**Comandos**: `Move`, `Wait`, `Attack`, `Shoot`, `UseMutation`, `UseItem`, `Interact`, `ChooseDialogue`, `SaveRequest`. El juego recibe un comando y devuelve `ActionResult` (`accepted`, `timeCost`, eventos tipados, errores y lista de celdas sucias). No aceptar comandos de juego durante una resolución de turno.

**Scheduler**: cada actor tiene `nextActTick`; se elige menor tick; empates por ID/orden de creación estable. `finalCost = max(25, ceil(baseCost * 100 / speed))`. Acción inválida sin turno salvo intento físico fallido definido explícitamente. Inspeccionar no consume tiempo; impedir acciones informativas gratuitas que alteren el estado.

**RNG**: semillas separadas para generación, combate, botín y ambientación; algoritmos, estados y versiones persistidos. Prohibir `Math.random()` en código de simulación. Misma semilla + versión + secuencia de comandos => mismo hash del estado lógico.

**Eventos**: `EntityMoved`, `AttackResolved`, `DamageApplied`, `StatusApplied`, `MutationUsed`, `TileChanged`, `FactionReputationChanged`, `QuestAdvanced`. Un solo escritor lógico por estado; limitar cadenas reactivas a 64 eventos derivados por acción y encolar el resto.

**Mundo**: `WorldSeed`, `GeneratorVersion`, coordenadas de región/sector/z y datos base generados; snapshots/deltas para cambios, NPC persistentes, exploración y localizaciones únicas. Sector activo/inactivo explícito.

**Contenido**: IDs estables, no nombres localizados. Ejemplos obligatorios `region.vertex_salt`, `location.blind_beacon`, `dungeon.zero7`, `quest.buried_frequency`, `creature.copper_sentinel`.

**Render**: consumir snapshots inmutables/diffs, nunca mutar estado del motor. Atlas de glifos, colores, cámara, zoom, niebla de guerra, modo clásico/atmosférico; toda información crítica visible sin filtros.

**Persistencia**: snapshot versionado, checksum/integridad, metadatos, RNG completo, mundo, jugador, quests, facciones y cambios ambientales. Cargar → validar → migrar si necesario → hidratar; no descartar campos silenciosamente. Probar fallos de escritura y partidas truncadas.

**Seguridad Electron**: `contextIsolation: true`, `nodeIntegration: false`, IPC mínimo y validado, rutas de guardado controladas, CSP, no cargar contenido remoto arbitrario ni ejecutar comandos externos desde render.

## 5. Plan por hitos y entregables comprobables

> W1–W6 son **cortes de trabajo**, no semanas ni promesas de plazo. No avanzar de hito por simple existencia de archivos; cada hito exige pruebas.

### H0 — Preparar repositorio y herramientas
- Crear estructura mínima, scripts `dev`, `build`, `typecheck`, `lint`, `test` y `test:e2e` cuando corresponda.
- Registrar versiones reales de Node/npm/PixiJS/Vite/Electron, sin inventarlas.
- Crear `AGENTS.md`, ADR-001 (renderer desacoplado), ADR-002 (simulación determinista), README e instrucciones para Windows/Linux.
- **Aceptación:** instalar con `npm ci`, ejecutar typecheck/lint/tests/build desde clon limpio; CI verde. Si aún no hay tests de juego, test de humo explícito.

### W1 — Llegada a Faro Ciego
- Scheduler, RNG y comandos; mapa ASCII visible y cámara; FOV y niebla; movimiento, bloqueos, inspección, log; mapa fijo inicial + transición entre sectores; diálogo básico con Iria y Keral.
- **Aceptación:** teclado puede recorrer el asentamiento, colisiones son correctas, no hay doble acción por tecla mantenida, guardar/cargar conserva posición y RNG; turnos idénticos tras replay.

### W2 — Rutas y relaciones
- Sectores procedurales deterministas, rutas hacia Cruce 7, comercio limitado, inventario con peso, equipo y reputación; ruta para obtener una bobina por compra o exploración.
- **Aceptación:** localizaciones reservadas alcanzables en semillas de prueba; dos rutas para conseguir bobina; inventario y stock sobreviven a guardado.

### W3 — Estación CERO-7
- Tres niveles conectados, combate con atributos y fórmulas v0.2; Carroñero de sal, Vigía de cobre y Larva de médula; IA con visión, ruido, búsqueda y retirada; acceso y salida por rutas distintas.
- **Aceptación:** IA no conoce ubicación oculta; combate resoluble con RNG fijado; jugador puede entrar y escapar; sin bloqueo por generación imposible.

### W4 — Mutaciones y electricidad
- Implementar únicamente BIO-02 Placas dérmicas, PSI-01 Eco neural y TEC-02 Piel de cobre; recursos, recargas, descripciones y costes; agua conductora, fuentes eléctricas, interrupción de alimentación y avisos visuales/sonoros.
- **Aceptación:** cada mutación tiene efecto útil verificable y contrapartida; electricidad se propaga de forma limitada y reproducible; desactivar fuente elimina peligro.

### W5 — «La frecuencia enterrada»
- Tres vías documentadas de obtención de evidencia: infiltración, ingeniería y negociación. Tres destinos: aislar, entregar, difundir. Persiste resultado en Faro Ciego, facciones y diario. Mecanismo de recuperación si NPC clave muere.
- **Aceptación:** seis recorridos de prueba representativos (3 vías × al menos 2 desenlaces), más tres desenlaces tras recarga; ninguna vía depende exclusivamente de una mutación no implementada.

### W6 — Pulido, escritorio y corte vertical
- Tutorial contextual, audio atmosférico original, remapeo, fuente escalable, contrastes, paneles accesibles, mediciones, empaquetado y pruebas de instalación.
- **Aceptación:** E2E completo con solo teclado y guardado/carga; `npm ci`, pruebas y build reproducibles; GitHub Pages funciona con base path de repositorio; lanzadores de escritorio se producen y prueban en sus OS objetivos antes de etiquetarlos como terminados.

## 6. Criterios de calidad cuantificables

| ID | Objetivo | Prueba / evidencia requerida |
|---|---|---|
| DET-001 | Mismo resultado lógico | 100 replays de acciones y hash tras guardado/carga |
| MAP-001 | Sin bloqueos topológicos | 1.000 semillas de generación y BFS de accesos críticos |
| COM-001 | Fórmulas exactas | Unit tests deterministas y límites de daño/resistencia |
| AI-001 | Sin omnisciencia | Tests de oclusión visual, sonido y última posición |
| MUT-001 | Tres mutaciones completas | Coste, CD, efecto, resistencia, contrapartida y save/load |
| SIM-001 | Electricidad consistente | 10 escenarios de conectividad, aislamiento y apagado |
| QST-001 | Rutas y desenlaces | Casos de infiltración/ingeniería/negociación; finales persistentes |
| SAVE-001 | Persistencia robusta | Guardado interrumpido, corrupto, migración y cambios de sector |
| UI-001 | Manejo con teclado | Flujos E2E de creación, exploración, combate y negociación |
| WEB-001 | Build desplegable | Verificar rutas en GitHub Pages en subruta `/MUTATION-404/` |
| PERF-001 | Turno p95 <16 ms | Benchmark con carga declarada y hardware registrado |
| PERF-002 | Entrada a imagen p95 <50 ms | Instrumentación real y condiciones documentadas |
| PERF-003 | 60 FPS objetivo | Medición en mapa y equipo de referencia, no inferencia |
| SEC-001 | Electron aislado | Comprobación de aislamiento, IPC, CSP y permisos |

Los umbrales de rendimiento son **objetivos**, no resultados garantizados. Los CI no sustituyen jugar ni probar manualmente la interfaz.

## 7. Método de colaboración con Codex

1. **Una tarea por vez** con identificación, archivos afectados, entradas, salidas, dependencias, pruebas y evidencia esperada.
2. Codex inspecciona primero el repositorio; no supone la presencia de archivos, paquetes ni herramientas.
3. Antes de cambios grandes, redacta diseño y riesgos en `docs/ADR/` y explica compatibilidad.
4. Tras modificar código: typecheck, lint, tests relevantes, build; adjuntar comandos y salidas concisas, señalar los no ejecutados.
5. No modificar simultáneamente lógica de guardado, generación y UI sin contratos estabilizados.
6. Crear commits focalizados por hito (si está autorizado y Git está configurado); no subir ni publicar sin orden explícita.
7. Mantener `docs/STATUS.md` con Implementado / Probado / Pendiente / Bloqueado; ninguna capacidad se califica terminada sin pruebas.
8. Auditoría adversarial al cerrar cada corte: exploits de turnos gratuitos, estados imposibles, softlocks, corrupción de partidas, controles lentos, mapas inalcanzables, fugas de memoria y UI engañosa.

## 8. AGENTS.md — instrucciones propuestas para Codex

```md
# MUTATION 404 — Reglas de contribución

- Respeta docs/GDD.md, docs/ARCHITECTURE.md y docs/ROADMAP.md. Si detectas contradicción, señálala antes de implementarla.
- TypeScript strict. Simulación sin imports de DOM, PixiJS ni Electron.
- Todo azar de simulación debe utilizar RNG sembrado y serializable.
- Cambios de estado únicamente por comandos/eventos validados; renders sin efectos secundarios.
- Contenido original con IDs estables y datos validados.
- Mantén partidas versionadas y migraciones explícitas.
- Cada nueva mecánica requiere pruebas unitarias o de integración y al menos un criterio verificable.
- Ejecuta typecheck/lint/tests/build según existan; no inventes éxito si un comando falla o no está disponible.
- No elimines código, historial o partidas sin autorización. No ejecutes git push ni despliegues sin petición expresa.
- Antes de cerrar una tarea, informa: cambios, comandos realizados, resultados reales, limitaciones y siguiente paso.
- Prioriza jugabilidad y controles responsivos sobre complejidad decorativa.
```

## 9. Primera orden que se dará a Codex (solo cuando decidamos iniciar)

```text
Proyecto: MUTATION 404. Estamos iniciando H0 exclusivamente.

Lee las biblias v0.1, v0.2, v0.3 y el Plan maestro v1.0 incluidos en docs/. No programes todavía combate, narrativa, simulación o mutaciones. Inspecciona las versiones del entorno real. Crea un monorepositorio mínimo TypeScript strict + Vite con PixiJS y motor TypeScript desacoplado. Implementa un test determinista de RNG y un test del planificador con un ejemplo mínimo sin interfaz. Añade scripts operativos, README, AGENTS.md, ADR y CI inicial.

Debes ejecutar y documentar npm ci (una vez creado lockfile), typecheck, lint, tests y build. Si el acceso a npm falla, informa del bloqueo y no afirmes que las dependencias están instaladas ni que PixiJS está integrado. No hagas push ni despliegue. Entrega resumen de archivos, resultados y próximos pasos.
```

## 10. Riesgos y decisiones aún abiertas

- Confirmar versiones reales, disponibilidad de PixiJS y el renderer WebGL2 del entorno.
- Confirmar UX de inventario y diálogo exclusivamente con teclado.
- Afinar tamaño de sectores, densidad de encuentros y coste de tránsito.
- Equilibrar perturbación, mutaciones y economía en partidas instrumentadas.
- Planificar cómo mantener la web activa si falla WebGL2 (fallback o aviso explícito, nunca pantalla negra).
- Definir hardware de referencia antes de comprometer FPS/latencia.
- Autorizar por separado publicación GitHub y paquetes ejecutables.

## 11. Definition of Done de la vertical slice

Se considerará **jugable** si un jugador nuevo puede crear personaje, entrar en Faro Ciego, inspeccionar/negociar, salir a explorar, sobrevivir a una ruina, usar las tres mutaciones, obtener evidencia por rutas alternativas, tomar una decisión final, guardar, salir y recuperar la partida; todo sin comandos de desarrollo y únicamente con controles del juego.

Se considerará **verificada** si supera la matriz QA, los tests automatizados y la revisión manual documentada; los fallos abiertos se categorizan por severidad. El objetivo aspiracional 9,5/10 se evaluará cuando exista producto medible, nunca como nota anticipada.

---

**Punto de control:** documentación de preproducción terminada a nivel de contrato inicial. Inicio de programación: **todavía no autorizado**; siguiente acción prevista es revisión de los cuatro documentos y, al recibir orden, ejecutar H0 mediante Codex.
