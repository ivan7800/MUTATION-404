# ASCENSION — informe y continuidad

Estado: desarrollo experimental; no RC ni release final. Referencia inicial comprobada `4eb9180`. Base de conservación `e0a9094`. PR existente solicitada: https://github.com/ivan7800/MUTATION-404/pull/4. La versión estable y main no se despliegan desde esta rama.

## Resumen y arquitectura

El núcleo TypeScript conserva las reglas y esquema 11. Se añade ascii-art.ts, compartido por Canvas y el atlas Pixi, con siluetas de varios caracteres para héroe, seis especies, élite, Nácar y materiales. La cámara centra al jugador en una base isométrica; los glifos contrarrestan la proyección para seguir verticales. Pixi ordena los glifos por profundidad y cachea dos poses por carácter. No se ha eliminado aún el atlas píxel inactivo: su eliminación requiere sustituir tests antiguos que todavía verifican su texto.

La fase técnica añade lockfile, npm ci, lanzador compartido, instalación bajo subruta, manifiesto e icono originales y worker con digest de assets. Instalación atómica, actualización en espera hasta cerrar pestañas, limpieza sólo del mismo scope y sin tocar localStorage. Los builds normal y offline generan workers versionados. Cada build reemplaza sólo play/assets generado; las versiones anteriores siguen recuperables en Git.

## Conservación y pruebas

Matriz detallada: ASCENSION.md. qa-conservation.mjs compila el núcleo de e0a9094 en un directorio temporal y compara siete catálogos y 2.500 transiciones de cinco semillas con sus respuestas y guardados exactos. No prueba todas las combinaciones de toda la campaña.

Suites completas: 151 tests; pruebas anteriores que buscan texto se mantienen identificadas como guardas, no acreditan funciones. Las pruebas nuevas del worker ejecutan activación, fallo de descarga e aislamiento de requests en VM. qa-offline.mjs usa Chromium real: instala en /MUTATION-404/, corta la red, recarga, continúa guardado y mueve con WebGL y chunks dinámicos disponibles. qa-browser.mjs comprueba WebGL/Canvas, móvil/tableta, menús, guardado, jefe y final; añade pulsaciones rápidas, backup de guardado, foco de modales y centrado del visor móvil. Evidencias regenerables en qa-evidence, ignoradas en Git.

Comandos: npm ci, npm run typecheck, npm run lint, npm run build, npm run build:offline, npm run test:core, npm test, node scripts/check-pages.mjs, node scripts/balance-audit.mjs, node scripts/qa-conservation.mjs, node scripts/qa-browser.mjs, node scripts/qa-offline.mjs. CHROME_PATH permite elegir navegador. En el sandbox actual algunas pruebas de procesos/HTTP requieren escalado autorizado. Linux: bash -n INICIAR-LINUX.sh y node scripts/launch.mjs --prepare-only. Windows no ejecutado.

## Cambios por área

- Gráficos: siluetas compartidas, poses de reposo, agua y vegetación animadas, muros con volumen, jefe mayor, cámara centrada y letras verticales. Capturas inspeccionadas: la versión anterior dejaba el mapa demasiado pequeño; se amplió la base proyectada. Sigue habiendo mucho espacio negro por el campo de visión, sin aumentar visión ni revelar mapas.
- Jugabilidad: las pulsaciones independientes rápidas ya no se pierden; el límite se aplica sólo a repetición sostenida. El resto de reglas se conserva.
- Narrativa: sin alteraciones de historia ni contenido. Queda mejorar su puesta en escena.
- Audio: procedural existente conservado. No se añade música ni se certifica escucha humana.
- UX/accesibilidad: Tab queda contenido en menús/modales; textarea, select y edición de texto no accionan el juego. Guardado conserva la revisión local anterior en .backup antes de sobrescribir. Falta UI de recuperación de ese backup.
- Rendimiento: atlas de dos poses y pooling retenidos. Se eliminan bundles obsoletos automáticamente. Mediciones de QA describen construcción JS/RAF bajo SwiftShader, no FPS garantizados en GPU física.
- Entrega: CI ahora valida push experimental y PR, usa npm ci y añade offline. Sólo main puede ejecutar deploy. No se configura una falsa URL de preview.

## Bloqueos y validación que falta

API GitHub: tanto lectura como edición de PR devuelven `Post "https://api.github.com/graphql": Forbidden`. Diagnóstico posterior: curl falla antes de autenticación con `CONNECT tunnel failed, response 403`; el proxy bloquea api.github.com. No demuestra que el token actual sea inválido. Se guardó api.github.com en el borrador de red del entorno; requiere guardar/aplicar y publicar la configuración. Git HTTPS permite leer/push en la rama. Sin acceso API no se puede confirmar configuración Pages, modificar PR ni publicar una preview independiente con garantías. No usar credenciales alternativas no autorizadas ni pedir tokens en chat.

Commits de esta orden: 3933b8d prepara entrega, worker, lanzadores y conservación; 2f86369 incorpora composiciones/cámara, artefacto generado y QA. Consultar git log para el commit documental. Validaciones finales ejecutadas: npm ci (134 paquetes), typecheck, lint, build normal/offline, test:core y npm test; suite final 151/151. Balance 24 semillas, conservación 2.500 transiciones, QA navegador (12 escenas) y offline funcional completados. El lanzador se preparó en Linux sin arrancar navegador físico. La instalación multiversión y la campaña humana siguen pendientes.

Archivos fuente modificados: apps/web/src/{ascii-art,main,pixi-renderer,renderer}.ts; apps/web/index.html; apps/web/public/{sw.js,manifest.webmanifest,icon.svg}; scripts/{build-offline,cache-manifest,launch,qa-browser,qa-offline,qa-conservation,server}.mjs; tests/{server,service-worker}.test.mjs; package.json y package-lock.json; INICIAR-LINUX.sh, INICIAR-WINDOWS.bat; .gitignore; .github/workflows/pages.yml. Se regeneró play/ completo. README, CHANGELOG y documentos ASCENSION recogen estado e instrucciones. No se alteraron los archivos de simulación en esta orden.

No hay Windows ni GPU/dispositivos físicos, revisión externa ni jugador humano prolongado. La licencia del proyecto no está declarada: debe elegirla su titular antes de release. No actualizar versión ni declarar RC por completar sólo comprobaciones automáticas.

## Fase de recuperación de guardados posterior

El menú valida cada archivo antes de ofrecer «Continuar». Si el slot principal está corrupto, busca una copia de rescate y luego los slots históricos; muestra el origen recuperable sin modificar el archivo averiado. El siguiente guardado repara el principal y nunca sustituye una copia válida por datos inválidos. La importación también conserva la versión anterior válida. QA de Chromium comprobó la recuperación, las coordenadas y la integridad de la copia en WebGL y Canvas. Un contexto que deniega todas las llamadas a localStorage pudo iniciar partida y mostró error al guardar sin excepciones. No hay aún interfaz para exportar la copia.

## Fases siguientes concretas

1. Completar estados visuales de caminar/ataque/daño/muerte/mutación/interacción del héroe y ataques específicos de cada enemigo; hoy hay poses cíclicas y efectos existentes, no toda esa matriz de animaciones.
2. Completar composición de ciudadanos, recursos, objetos y FX exclusivamente con ASCII; algunos glifos siguen individuales y permanecen formas Graphics de efectos. Homogeneizar oclusión y tamaño Canvas/Pixi, probar restauración de contexto WebGL y quitar atlas inactivo sin perder regresiones funcionales.
3. Auditar campaña de principio a fin con rutas y perfiles de combate, sin fixtures que salten progresión. Revisar objetivos, narrativa, audio, ritmo y economía con evidencias; conservar contenido original.
4. Ampliar tests de actualización del SW con dos builds, descarga fallida y recursos ausentes; implementar exportación manual de la copia. La prueba offline actual no certifica todo el ciclo de actualización real.
5. Hacer auditoría automatizada WCAG y manual con lector, navegación teclado y movimiento reducido. Completar ajustes persistentes y reducción dinámica de movimiento.
6. Validar Windows, sesión larga, memoria y GPU física. Publicar preview aislada sólo tras restablecer permisos y confirmar configuración estable. Validar la URL antes de pedir autorización final de integración.

## Valoración provisional, no certificación

| Área | Nota | Límite de evidencia |
| --- | --- | --- |
| Conservación funcional | 8/10 | Diferencial y suites; campaña humana pendiente |
| Arte y animación | 5/10 | Siluetas iniciales; estados y oclusión incompletos |
| UX/accesibilidad | 6/10 | Interacción automatizada; sin auditoría externa |
| Audio/narrativa | 6/10 | Contenido conservado, pulido nuevo pendiente |
| Rendimiento | Sin nota física | Sólo Chromium software |
| Entrega/PWA | 7/10 | Offline real; update multiversión pendiente |
| Publicación | Bloqueada | Sin preview pública validada |

Global provisional: 6/10 para el objetivo premium integral, no 9,5. La nota anterior 8,2 no estaba sustentada como valoración global profesional. Para 9,5 hacen falta cerrar las fases anteriores y obtener revisión humana, externa y de hardware con resultados reproducibles.
