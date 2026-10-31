# ASCENSION — informe y continuidad

Estado: desarrollo experimental; no RC ni release final. Referencia inicial comprobada `4eb9180`. Base de conservación `e0a9094`. PR existente solicitada: https://github.com/ivan7800/MUTATION-404/pull/4. La versión estable y main no se despliegan desde esta rama.

## Resumen y arquitectura

El núcleo TypeScript conserva las reglas y esquema 11. Se añade ascii-art.ts, compartido por Canvas y el atlas Pixi, con siluetas de varios caracteres para héroe, seis especies, élite, Nácar y materiales. La cámara centra al jugador en una base isométrica; los glifos contrarrestan la proyección para seguir verticales. Pixi ordena los glifos por profundidad y cachea dos poses por carácter. No se ha eliminado aún el atlas píxel inactivo: su eliminación requiere sustituir tests antiguos que todavía verifican su texto.

La fase técnica añade lockfile, npm ci, lanzador compartido, instalación bajo subruta, manifiesto e icono originales y worker con digest de assets. Instalación atómica, actualización en espera hasta cerrar pestañas, limpieza sólo del mismo scope y sin tocar localStorage. Los builds normal y offline generan workers versionados. Cada build reemplaza sólo play/assets generado; las versiones anteriores siguen recuperables en Git.

## Conservación y pruebas

Matriz detallada: ASCENSION.md. qa-conservation.mjs compila el núcleo de e0a9094 en un directorio temporal y compara siete catálogos y 2.500 transiciones de cinco semillas con sus respuestas y guardados exactos. No prueba todas las combinaciones de toda la campaña.

Suites completas: 153 tests tras la prueba de dos versiones del worker; pruebas anteriores que buscan texto se mantienen identificadas como guardas, no acreditan funciones. Las pruebas del worker ejecutan instalación, activación, fallo de descarga, aislamiento de requests y cambio de versión en VM. qa-offline.mjs usa Chromium real: instala en /MUTATION-404/, corta la red, recarga, continúa guardado y mueve con WebGL y chunks dinámicos disponibles. qa-browser.mjs comprueba WebGL/Canvas, móvil/tableta, menús, guardado, jefe y final; añade pulsaciones rápidas, backup de guardado, foco de modales y centrado del visor móvil. Evidencias regenerables en qa-evidence, ignoradas en Git.

Comandos: npm ci, npm run typecheck, npm run lint, npm run build, npm run build:offline, npm run test:core, npm test, node scripts/check-pages.mjs, node scripts/balance-audit.mjs, node scripts/qa-conservation.mjs, node scripts/qa-browser.mjs, node scripts/qa-offline.mjs. CHROME_PATH permite elegir navegador. En el sandbox actual algunas pruebas de procesos/HTTP requieren escalado autorizado. Linux: bash -n INICIAR-LINUX.sh y node scripts/launch.mjs --prepare-only. Windows no ejecutado.

## Cambios por área

- Gráficos: siluetas compartidas, poses de reposo, agua y vegetación animadas, muros con volumen, jefe mayor, cámara centrada y letras verticales. Capturas inspeccionadas: la versión anterior dejaba el mapa demasiado pequeño; se amplió la base proyectada. Sigue habiendo mucho espacio negro por el campo de visión, sin aumentar visión ni revelar mapas.
- Jugabilidad: las pulsaciones independientes rápidas ya no se pierden; el límite se aplica sólo a repetición sostenida. El resto de reglas se conserva.
- Narrativa: sin alteraciones de historia ni contenido. Queda mejorar su puesta en escena.
- Audio: procedural existente conservado. No se añade música ni se certifica escucha humana.
- UX/accesibilidad: Tab queda contenido en menús/modales; textarea, select y edición de texto no accionan el juego. Guardado conserva la revisión local anterior en .backup y el menú permite continuar desde ella si el principal está corrupto. Falta exportación explícita de la copia.
- Rendimiento: atlas de dos poses y pooling retenidos. Se eliminan bundles obsoletos automáticamente. Mediciones de QA describen construcción JS/RAF bajo SwiftShader, no FPS garantizados en GPU física.
- Entrega: CI ahora valida push experimental y PR, usa npm ci y añade offline. Sólo main puede ejecutar deploy. No se configura una falsa URL de preview.

## Bloqueos y validación que falta

API GitHub: tanto lectura como edición de PR devuelven `Post "https://api.github.com/graphql": Forbidden`. Diagnóstico posterior: curl falla antes de autenticación con `CONNECT tunnel failed, response 403`; el proxy bloquea api.github.com. No demuestra que el token actual sea inválido. Se guardó api.github.com en el borrador de red del entorno; requiere guardar/aplicar y publicar la configuración. Git HTTPS permite leer/push en la rama. Sin acceso API no se puede confirmar configuración Pages, modificar PR ni publicar una preview independiente con garantías. No usar credenciales alternativas no autorizadas ni pedir tokens en chat.

Commits de esta orden: 3933b8d prepara entrega, worker, lanzadores y conservación; 2f86369 incorpora composiciones/cámara, artefacto generado y QA. Consultar git log para el commit documental. Validaciones finales ejecutadas: npm ci (134 paquetes), typecheck, lint, build normal/offline, test:core y npm test; suite final 151/151. Balance 24 semillas, conservación 2.500 transiciones, QA navegador (12 escenas) y offline funcional completados. El lanzador se preparó en Linux sin arrancar navegador físico. La instalación multiversión y la campaña humana siguen pendientes.

Archivos fuente modificados: apps/web/src/{ascii-art,main,pixi-renderer,renderer}.ts; apps/web/index.html; apps/web/public/{sw.js,manifest.webmanifest,icon.svg}; scripts/{build-offline,cache-manifest,launch,qa-browser,qa-offline,qa-conservation,server}.mjs; tests/{server,service-worker}.test.mjs; package.json y package-lock.json; INICIAR-LINUX.sh, INICIAR-WINDOWS.bat; .gitignore; .github/workflows/pages.yml. Se regeneró play/ completo. README, CHANGELOG y documentos ASCENSION recogen estado e instrucciones. No se alteraron los archivos de simulación en esta orden.

No hay Windows ni GPU/dispositivos físicos, revisión externa ni jugador humano prolongado. La licencia del proyecto no está declarada: debe elegirla su titular antes de release. No actualizar versión ni declarar RC por completar sólo comprobaciones automáticas.

## Fase de recuperación de guardados posterior

El menú valida cada archivo antes de ofrecer «Continuar». Si el slot principal está corrupto, busca una copia de rescate y luego los slots históricos; muestra el origen recuperable sin modificar el archivo averiado. El siguiente guardado repara el principal y nunca sustituye una copia válida por datos inválidos. La importación también conserva la versión anterior válida. QA de Chromium comprobó la recuperación, las coordenadas y la integridad de la copia en WebGL y Canvas. Un contexto que deniega todas las llamadas a localStorage pudo iniciar partida y mostró error al guardar sin excepciones. No hay aún interfaz para exportar la copia.

## Fase de composición ambiental posterior

Ciudadanos de Faro Ciego y asentamientos, depósitos de los cuatro recursos, botín y campos de fuego/electricidad/esporas usan ahora claves visuales semánticas y composiciones de varios caracteres en Canvas y WebGL. Esto evita que el glifo `$` de un mercader se confunda visualmente con el botín o que `!` de un vigía comparta silueta con terreno peligroso. El atlas WebGL se amplió a 80 píxeles y se centra en 40, de acuerdo con su matriz de escala, para no recortar los dibujos nuevos. Typecheck, lint, build offline, 151 tests, comprobación Pages y QA de Chromium de 13 escenas pasaron. La captura de WebGL se inspeccionó: el mapa visible continúa ocupando una porción reducida del visor y el lenguaje volumétrico todavía es básico. No afirmar calidad premium final ni FPS físicos.

La siguiente iteración amplía la escala de cámara compartida a 1,45 en ambas matrices isométricas, sin modificar visión, colisiones ni coordenadas guardadas. Las capturas de WebGL, Canvas y móvil se inspeccionaron: el área explorada ocupa más espacio y permanece centrada. Typecheck, lint, build offline, 151 tests, QA de navegador y prueba offline en subruta pasaron. La composición sigue siendo una proyección de la cuadrícula y falta volumen/oclusión de nivel premium; el rendimiento físico no está medido.

La preferencia del sistema de movimiento reducido se escucha ahora durante la partida. Canvas y Pixi cancelan la animación ambiental y los efectos temporales al activarla, redibujan una imagen estática y pueden reanudarla si se desactiva. El retorno a una pestaña visible sólo inicia animación si hay partida activa. Chromium comprobó el cambio en WebGL y Canvas mediante capturas estables en dos momentos; typecheck, lint, build offline, 151 tests y QA offline pasaron en esa fase. La prueba automática no sustituye revisión humana de accesibilidad.

El protagonista dispone ahora de estados visuales ASCII de caminar, atacar, daño, mutación, interacción y muerte en ambos renderizadores. Son transitorios y se activan sólo tras acciones aceptadas; la muerte se deriva de los puntos de vida. La lógica y los guardados no cambian. Build offline, 152 tests y QA de navegador pasaron. La prueba nueva comprueba las composiciones ASCII empaquetadas; la QA de navegador comprueba acciones y renderizadores, pero no certifica aún la lectura humana de cada fotograma.

Una prueba funcional de dos versiones del service worker instala v1 y v2 sobre el mismo scope, comprueba que v1 permanece hasta la activación de v2, que v2 sirve su propio index offline y que cachés de otra ruta y aplicación sobreviven. Aún falta reproducir el cambio de build con dos pestañas reales en Chromium.

qa-offline.mjs ahora comprueba también el ciclo de actualización en Chromium: sirve una segunda revisión del HTML y del worker desde el servidor local, llama a update(), comprueba que la nueva instalación espera mientras la pestaña vieja está abierta, cierra esa pestaña, verifica la retirada de la caché vieja y recarga la revisión nueva sin red con el guardado disponible. Esta prueba usa dos revisiones HTTP del mismo build de juego; aún falta una matriz de dos builds completos con assets diferentes, recurso ausente y varias pestañas simultáneas.

Canvas y WebGL comparten ahora siluetas de herida para las seis especies originales, élites y Nácar. Canvas recibe la comparación de PV tras cada turno aceptado y borra los impactos expirados; Pixi usa su registro de impactos existente para elegir la misma composición. No se alteraron daño, IA, turnos ni guardados. La prueba del catálogo ASCII verifica las ocho heridas; build y 154 tests pasaron tras el ajuste final de limpieza. QA de Chromium y prueba offline pasaron antes de ese ajuste menor. Quedan ataques, muerte y coreografía específica de enemigos y revisión humana de legibilidad.

La iteración siguiente añade marcas de muerte ASCII distintas para las mismas ocho clases visuales. Canvas dibuja la marca efímera al desaparecer un enemigo y WebGL la superpone a sus ecos existentes. Ambos verifican que el enemigo pertenecía a la misma zona antes de mostrar muerte, evitando falsos cadáveres al viajar. Las marcas son sólo presentación: 155 tests, typecheck, lint, build, QA de Chromium y prueba offline pasaron. Los ataques específicos de enemigos siguen pendientes.

## Fases siguientes concretas

1. Afinar la legibilidad y duración de los estados visuales del héroe, heridas y muertes de enemigos con revisión humana; completar ataques específicos de cada enemigo, incluido Nácar.
2. Completar composición de objetos y FX exclusivamente con ASCII; permanecen formas Graphics de efectos. Perfeccionar oclusión y escala Canvas/Pixi, probar restauración de contexto WebGL y quitar atlas inactivo sin perder regresiones funcionales.
3. Auditar campaña de principio a fin con rutas y perfiles de combate, sin fixtures que salten progresión. Revisar objetivos, narrativa, audio, ritmo y economía con evidencias; conservar contenido original.
4. Probar actualización del SW con dos builds completos y assets diferentes, varias pestañas reales, recursos ausentes y recuperación tras red intermitente; implementar exportación manual de la copia.
5. Hacer auditoría automatizada WCAG y manual con lector, navegación teclado y movimiento reducido. Completar ajustes persistentes y revisar todos los efectos CSS y sonoros bajo la preferencia dinámica.
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
