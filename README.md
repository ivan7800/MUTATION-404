# MUTATION 404 v2.9 — PREMIUM EXPERIENCE (VERTICAL SLICE)

**Jugar:** https://ivan7800.github.io/MUTATION-404/

La v2.9 inicia la ampliación visual premium: el atlas de losetas de píxel se aplica a **todos los biomas regionales**, no solo al poblado y una ruina. Hay paletas específicas para Salinas, Ceniza, Hierro, Vidrio, Médula y Umbral, detalles propios por región y caché de texturas con separación de biomas. El modo ASCII permanece intacto, al igual que combate, generación y esquema de guardado 11.

**Cinemática ligera del jefe v2.9:** despertar, entrada en fases II y III y derrota ahora tienen señales sonoras sintetizadas originales y ondas radiales con ocho fragmentos en PixiJS. Los efectos de audio respetan el interruptor y volumen existentes y no se reproducen por sí solos; las animaciones respetan movimiento reducido. El disparo de eventos se realiza solo tras acciones aceptadas y no altera RNG ni guardado. Se mantiene el fallback Canvas 2D sin los nuevos efectos GPU.

**Anticipación de ataques v2.9:** en el turno anterior al pulso de Nácar, las dos diagonales amenazadas se marcan sobre el mapa y aparece «IMPACTO PRÓXIMO» junto a su barra de vida. La vista reutiliza la misma función determinista que el motor para evitar avisos engañosos. El aviso permanece legible sin animaciones y en modo ASCII. QA con capturas de las tres fases y del modo ASCII.

**Pulido del enfrentamiento v2.9:** el jefe dispone de un panel de vida propio, identificación permanente de fase I/II/III y una aureola cromática acorde con el peligro ambiental. La fase se calcula con una única función compartida por el motor y la interfaz; la reducción de movimiento mantiene un halo estático y un indicador textual. Pruebas de umbrales y regresiones de presentación añadidas.

**Combate final v2.9:** Nácar libera ataques de área deterministas en tres fases según sus PV: descargas, esporas y fuego. Las áreas se colocan en diagonal, se anuncian mediante la bitácora y pueden esquivarse antes del siguiente pulso ambiental. No hay nuevos campos de guardado ni cambios al RNG.

**Jefe final — mejora gráfica:** Nácar tiene ahora una silueta original con ocho espinas y corazón de cristal, glifo ASCII diferenciado y barra de salud proporcional a sus PV reforzados. Las mecánicas del combate final siguen pendientes de una revisión específica.

**QA añadido:** Chromium captura una región exterior en los modos píxel y ASCII y comprueba errores JavaScript; las pruebas, compilación y despliegue siguen bloqueados por GitHub Actions si falla la validación.

**Alcance honesto:** es una primera vertical slice artística del **terreno regional**, no arte final de todas las criaturas ni un rediseño integral de interfaz. No se certifica aún 9,5/10 ni una prueba humana completa. [Auditoría y próximos riesgos](./AUDITORIA_V2.9.md).

---

# MUTATION 404 v2.8 — LA CAMPAÑA DE NÁCAR

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Campaña de cinco actos
1. **Eco bajo la sal.** Conserva la misión de Mara Venn en Faro Ciego, la investigación de la Torre del Nudo y la decisión inicial de difundir o aislar la señal.
2. **Los ocho testigos.** Recoge la reliquia del segundo estrato de cada una de las ocho ruinas regionales. El diario (J) muestra todos los nombres, ubicaciones e hitos.
3. **Los custodios.** Derrota al guardián de cada segunda planta y recupera su archivo (26,12); el progreso permanece guardado.
4. **Bajo la sal.** Entra en CERO-7 por (62,44) en la superficie y alcanza la tercera planta, tras visitar el corazón del laboratorio.
5. **La última decisión.** Activa el terminal (14,10) de CERO-7 / Cámara del eco. Si has recuperado los archivos, se despierta el custodio final (enemigo real). Tras derrotarlo, decide entre **encadenar, liberar o borrar** la memoria de Nácar. Cada elección presenta un epílogo exclusivo influido por tu decisión anterior.

## Continuidad y calidad
- El seguimiento de la campaña se calcula a partir de eventos persistentes ya existentes; **no se cambia el formato de guardado 11**. Las partidas anteriores conservan sus objetivos completados.
- El diario ofrece la lista de ocho ruinas y marca reliquia y custodio individualmente.
- El panel principal cambia de objetivo según el acto, y al finalizar aparece una pantalla de epílogo con créditos.
- Puedes continuar explorando tras terminar la campaña.
- Pruebas automatizadas de cinco actos, barrera previa a final, aparición del guardián, bloqueo de decisión mientras vive, tres epílogos y persistencia después de guardar/cargar.
- Chromium ejecuta el final a través de la interfaz, verifica el diálogo, los créditos y que la finalización persiste tras recargar la página.

## Limitaciones
Esta versión cierra **un arco principal estructurado** con tres desenlaces, pero no acredita una campaña equilibrada en todos los estilos de juego ni una duración de decenas de horas. El combate final reutiliza el tipo dron con vida reforzada, pendiente de un diseño artístico y mecánico exclusivo. También faltan escenas cinematográficas, más ramificación de decisiones y prueba humana de principio a fin. No se certifica una nota 9,5/10.

---

# MUTATION 404 v2.7 — EL DESPERTAR DE NÁCAR

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Menú principal nuevo
- Pantalla de inicio obligatoria: **Continuar partida**, **Nueva partida**, **Cargar guardado local**, **Importar archivo .json** y **Opciones**.
- No se inicia automáticamente una partida ni se sobrescribe una existente al abrir el navegador. La opción Continuar aparece inactiva si no hay un guardado local.
- Botón **☰ MENÚ** y tecla **Esc** para pausar y volver al título, guardando antes la partida. El archivo importado solo sustituye el estado después de que su estructura haya sido validada correctamente. Límite de importación: 4 MB.
- Compatibilidad con las claves de partidas guardadas de versiones anteriores y esquema de juego 11.

## Sonido audible y controles
- WebAudio sintetizado **sin archivos externos ni CDN**: nuevo ambiente armónico con tres voces, sonidos para ataque, daño, exploración y cuatro mutaciones.
- En **Opciones** hay un deslizador de volumen (0–100 %) y un botón **Activar sonido y probar**; el tono de diagnóstico confirma la activación.
- El volumen predeterminado es 55 %, no 0 %. Los ajustes se guardan localmente. La reproducción únicamente empieza mediante una interacción voluntaria, respetando las normas del navegador.

## Progresión y economía
- Corregido un posible ciclo de créditos infinitos: los descuentos por reputación nunca permiten recomprar/vender en el mismo mercado con beneficio.
- Nuevas pruebas para precios en todos los mercados regionales y reputaciones, además de simulaciones deterministas de progresión y guardados.

## Comprobaciones
El pipeline GitHub Actions ejecuta TypeScript, pruebas del motor, simulación de balance, compilación PixiJS y Chromium con WebGL y respaldo Canvas, comprobando también el menú, control de volumen, guardar, pausar y continuar.

**Pendiente:** mezcla musical compuesta (en lugar de sonido procedural), revisión estética humana de la pantalla de título, batería real de dispositivos físicos y validación jugable prolongada. No se presenta todavía como 9,5/10.

---

# MUTATION 404 v2.6 — EQUILIBRIO Y SUPERVIVENCIA

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Mejoras verificables
- Los carroñeros heridos que huyen descansan un turno de cada dos; los pastores de esporas conservan su retirada propia. Antes, algunos carroñeros podían mantener una huida a la misma velocidad que el jugador, impidiendo terminar un combate cuerpo a cuerpo.
- Los drones y vigías tecnológicos ofrecen ahora una probabilidad de recuperar **munición**, no medicina. La probabilidad de botín adicional continúa siendo 35 %; los enemigos biológicos mantienen la posibilidad de dejar ampollas.
- Nuevo indicador persistente de supervivencia: PV, ampollas, munición y concentración, con advertencias de salud baja y crítica en colores legibles.
- Auditoría reproducible de 24 semillas y cuatro escenarios: carroñeros cuerpo a cuerpo, vigías a distancia, drones a distancia y recuperación en el refugio. El resultado es un JSON descargable desde GitHub Actions.
- Pruebas de regresión de huida y avisos de supervivencia, y pruebas Chromium para el HUD en WebGL y Canvas.

## Compatibilidad
Sigue vigente el esquema de guardado **11** y el selector Píxel/ASCII (Z). La simulación sigue siendo por turnos y determinista.

## Alcance del análisis
La telemetría evalúa **arenas controladas**, no una campaña completa. No mide la dificultad del mundo abierto, exploración, rutas de misiones, diversión subjetiva, ni FPS sobre GPU física. No se atribuye una puntuación 9,5/10 sin esas pruebas.

[Informe y resultados de v2.6](./AUDITORIA_V2.6.md).

---

# MUTATION 404 v2.5 — AUDITORÍA DE LA EXPERIENCIA

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Correcciones reales
- **P0 combat:** la inmunidad de Faro Ciego solo funciona en la superficie. Las criaturas de una mazmorra ya no se paralizan por coincidir con las coordenadas geográficas del refugio. La búsqueda de caminos usa el contexto de zona correcto.
- **P1 ambiental:** el refugio ya no reduce exposición ni otorga recuperación gratuita dentro de CERO-7 o las ocho ruinas. El empuje cinético tampoco confunde las zonas subterráneas con la superficie.
- **P2 exploración:** las ocho ruinas muestran su propio nombre, estrato, anomalía y texto narrativo en el HUD.
- Tests de regresión del combate y las zonas de protección, 400 acciones deterministas, cinco semillas y ocho cámaras de élite.
- QA Chromium WebGL y respaldo Canvas con comprobación del texto específico de El Ojo del Silencio.

## Informe de auditoría
[Ver auditoría técnica, defectos corregidos y riesgos pendientes](./AUDITORIA_V2.5.md).

## Compatibilidad
Se mantiene el formato de guardado 11 y el modo Píxel/ASCII (Z). No cambia la configuración del jugador ni se requiere reiniciar la campaña.

La puntuación 9,5/10 sigue **sin acreditarse**: faltan hardware real, jugabilidad prolongada, arte final y balance cuantitativo.

---

# MUTATION 404 v2.4 — EL MUNDO QUE RESPONDE

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Qué cambia
- El panel de riesgo da prioridad a **contacto con anomalía**, campos cercanos y enemigos visibles. El análisis no revela criaturas ni peligros fuera de la visión del jugador.
- **Fuego, electricidad y esporas** usan contornos cromáticos diferentes, incluso con reducción de movimiento activa; los peligros directamente bajo el jugador reciben un segundo marco.
- Cuando aparece un campo nuevo tras una acción aceptada, el motor PixiJS muestra una onda breve sobre esa posición visible. Se compara el estado ambiental antes y después del turno sin modificar la simulación, la persistencia o los resultados de combate.
- Se preserva el modo Píxel/ASCII (Z), los efectos de mutaciones y el respaldo Canvas 2D.

## QA adicional
- Prueba de regresión del análisis de amenaza limitado a zonas visibles.
- Una partida real de El Ojo del Silencio incorpora fuego y esporas cercanos durante la matriz Chromium; se comprueba que la advertencia cambie a **PELIGRO INMEDIATO** en ambos modos visuales.
- Capturas de Faro Ciego y El Ojo del Silencio, monitorización de errores JavaScript, comandos básicos, guardado/carga y muestras orientativas del intervalo entre frames.
- GitHub Actions bloquea la publicación ante errores de tipos, pruebas, compilación o navegador.

## Alcance real
Es una actualización de feedback audiovisual y legibilidad táctica. No añade nuevos biomas ni IA y **no equivale a una partida completa auditada**. Las muestras RAF no sustituyen una evaluación de latencia de entrada, GPU real, temperaturas y jugabilidad prolongada. Los datos guardados mantienen el esquema existente.

---

# MUTATION 404 v2.3 — NÁCAR INMERSIVO

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Cambios implementados
- Cuatro manifestaciones distintas de mutación con PixiJS/WebGL: ondas concéntricas para pulso cinético, rayos neurales, partículas de ignición y distorsiones de fase.
- Cuatro voces sonoras sintetizadas mediante WebAudio, con tonos y curvas de frecuencia propias, siempre desactivadas hasta que el jugador active el audio.
- Efectos vinculados exclusivamente a comandos `cast` aceptados por el motor; sin alterar resultados, coste, orden de turnos ni guardados.
- Se mantienen la visualización de golpes, muertes, señales eléctricas, la reducción de movimiento y la alternancia Píxel/ASCII (tecla Z).
- Pruebas de regresión para el vínculo entre mutaciones reales, gráficos, audio opcional y preferencias de accesibilidad.

## Validación
Workflow GitHub Actions: TypeScript estricto, pruebas de núcleo, compilación Vite/PixiJS, Chromium (WebGL y Canvas 2D), controles, guardado, capturas y muestras orientativas de fluidez.

## Límites
Los nuevos efectos se concentran en las cuatro mutaciones existentes. Todavía faltan animaciones completas por criatura, localización sonora espacial, revisión humana detallada de capturas, pruebas de campaña larga y métricas en hardware físico. No se certifica 9,5/10 con pruebas automatizadas.

---

# MUTATION 404 v2.2 — Combate visceral

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Cambios de combate y claridad táctica
- Destellos temporales en los enemigos cuya salud realmente disminuye, con distinción entre golpes normales y fuertes (daño de 5+).
- Partículas de disipación cuando muere una criatura; no se alteran recompensas ni resultados.
- Perímetros de advertencia en las casillas electrificadas para identificar mejor ataques enemigos.
- El feedback se calcula a partir de la diferencia de HP y posiciones antes/después de cada comando aceptado, sin tocar el motor de simulación.
- Los efectos adicionales se desactivan cuando se solicita movimiento reducido; los avisos tácticos permanecen visibles.
- Modo Píxel PixiJS/WebGL y modo ASCII con tecla Z, respaldo Canvas 2D y esquema de guardado intactos.

## Validación
GitHub Actions: TypeScript estricto, pruebas de motor, build Vite, QA Chromium WebGL/Canvas, capturas de Faro Ciego y El Ojo del Silencio en ambos modos y telemetría orientativa de fotogramas.

**Pendiente:** animaciones extensas de ataques específicos por especie, sonido individual para cada mutación, análisis visual profesional de las capturas y perfil de rendimiento en GPU reales. Esta versión es una mejora concreta de feedback, no una garantía de 9,5/10.

---

# MUTATION 404 v2.1 — Criaturas y mundo vivo

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Implementado
- Sprites **originales** de dos poses, en texturas GPU PixiJS reutilizables, para protagonista, habitantes y seis tipos de criaturas (crawler, sentinel, drone, spore, moth y larva), además de custodios de élite.
- Siluetas diferenciadas, colores propios por especie, movimiento visual sencillo y detalles para reconocerlas mejor.
- El botón **PÍXEL / ASCII** (atajo **Z**) conserva la representación por caracteres, sin cambiar el estado del juego.
- Los sprites se almacenan en la caché del atlas. El sistema de movimiento reducido utiliza una pose fija.
- La matriz visual Chromium captura Faro Ciego y El Ojo del Silencio en ambos modos y añade muestras del tiempo entre fotogramas (media y percentil 95) al informe de QA.

## Límites
Esta actualización es un **primer atlas de sprites programados**, no animaciones de ataque, daño y muerte fotograma a fotograma ni una producción artística 9,5/10. El muestreo RAF es una medida orientativa del navegador, no una comparación de GPU físicas ni FPS reales de cada dispositivo. El código del motor y el esquema de guardados no cambian.

## Verificación
GitHub Actions: TypeScript, pruebas de núcleo, compilación estática, Chromium con WebGL y respaldo Canvas, captura de escenas y guardado/carga. Los artefactos se consultan en la pestaña Actions.

---

# MUTATION 404 v2.0 — EL RENACIMIENTO DE NÁCAR

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Vertical slice artística funcional
- **Faro Ciego:** nuevas losetas originales de estilo 16 bits con piedra, caminos, suelo salino, plantas, terminales y detalles minerales.
- **El Ojo del Silencio:** atlas propio de tonos azul-violáceos con muros, corredores, símbolos de memoria, compuertas y artefactos.
- **Dos modos:** botón **PÍXEL / ASCII** (atajo **Z**) para alternar sin reiniciar partida.
- **PixiJS WebGL real:** texturas de losetas generadas una sola vez y reutilizadas como sprites GPU. Continúa el respaldo Canvas para navegadores sin WebGL.
- Los mapas, colisiones, inventario, enemigos, misiones, progresión y guardados mantienen su lógica original; se ha cambiado la representación gráfica, no el mundo.

## Auditoría verificable
El workflow compila, verifica TypeScript y pruebas de motor, y ejecuta Chromium real tanto en WebGL como en Canvas de respaldo. La matriz v2.0 captura cuatro vistas adicionales: Faro Ciego y El Ojo del Silencio en ambos modos. Se publican capturas e informe JSON en el artefacto `mutation-404-browser-qa` de Actions.

**Limitaciones:** es una **vertical slice**, no una sustitución de todo el atlas del juego. Hay escenarios fuera de estas dos zonas que siguen en ASCII; falta revisar las capturas editorialmente, medir FPS en GPU físicas y probar una campaña completa antes de afirmar 9,5/10.

## Desarrollo
`npm run typecheck && npm run test:core && npm run build:offline`.
La carpeta `play/` es la aplicación lista para GitHub Pages y para el lanzador local.

---

# MUTATION 404 v1.9 — Nácar WebGL

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Renderizador PixiJS real
- **PixiJS 8 con WebGL**: motor GPU para el mapa ASCII y las entidades, con atlas de glifos reutilizables, sprites agrupados, colores por bioma, enemigos, campos ambientales, objetivos y minimapa.
- **Respaldo Canvas 2D**: si WebGL no está disponible o falla la inicialización, el juego conserva el renderizador anterior y sus controles.
- **Compilación portable mediante Vite**: dependencias PixiJS empaquetadas en `play/assets/`. No se requiere CDN ni backend para cargar el juego desde GitHub Pages.
- **Sin migración de guardados**: la lógica de turnos, las zonas y la serialización no cambian.

## Validación automatizada de navegador
GitHub Actions ejecuta comprobación estricta TypeScript, pruebas del motor y compilación web; después lanza Chromium en modo WebGL y en modo de respaldo forzado. Comprueba mapa visible, movimiento, ayuda, zoom, guardar/cargar y errores del navegador. Las capturas completas y el informe JSON se adjuntan a cada ejecución como artefacto `mutation-404-browser-qa`.

## Limitaciones pendientes
La comprobación automatizada no reemplaza el juicio de una revisión artística humana, una partida completa de varias horas ni pruebas en tarjetas gráficas de diferentes fabricantes. Seguimos midiendo rendimiento y accesibilidad antes de afirmar una puntuación de 9,5/10.

---

# MUTATION 404 v1.8 — Nácar atmosférico

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Novedades visuales
- Atenuación graduada de las celdas **ya visibles** según distancia al personaje y ciclo nocturno; las casillas no descubiertas nunca se iluminan.
- Luz cálida alrededor del errante y brillos sutiles en terminales, agua y estructuras anómalas.
- Animación ambiental del mapa limitada a unos 8 FPS cuando existen efectos o clima activo; se suspende al ocultar la pestaña y no se inicia cuando está solicitada la reducción de movimiento.
- Paneles, contraste, botones y navegación táctil más legibles.
- Nuevas pruebas automatizadas del renderizador y del ciclo de animación.

## Compatibilidad y límites
Se mantiene Canvas 2D y el formato de guardado **11**, sin cambios de reglas ni alteración de partidas. No se afirma haber integrado PixiJS/WebGL ni realizado auditoría visual completa en navegador.

El workflow GitHub Actions ejecuta `npm run typecheck`, `npm run test:core` y `npm run build:offline` antes de publicar `play/` a Pages.

---

# MUTATION 404 v1.7 — Los guardianes del eco

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Novedades
- Ocho salas de élite conectadas al segundo nivel de las ruinas regionales, con un custodio de Nácar por instalación.
- Custodios: ataques eléctricos de dos casillas, señalizados en la bitácora antes de causar daños ambientales.
- Un archivo custodiado en cada ruina, junto a (26,12): elimínalo, pulsa **E**, obtén 15 créditos y un condensador una sola vez.
- El botín y el estado del guardián persisten en el guardado actual (versión de esquema 11).
- Pruebas nuevas de mapas reproducibles, desbloqueo del archivo, persistencia y aviso de ataques.
- Pendientes de QA: validación visual en navegador real, balance de élites y análisis exhaustivo de accesibilidad.

## Desarrollo
`npm run typecheck`, `npm run test:core`, `npm run build:offline`. Los tres pasos forman parte de GitHub Actions antes de desplegar a Pages.

El motor continúa usando Canvas 2D; PixiJS/WebGL2 sigue pendiente de integración.

---

# MUTATION 404 v1.6 — Las profundidades conscientes

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Cambios
- Vigías de cobre: preparan una descarga eléctrica señalizada en la casilla del jugador. El daño se aplica en el siguiente turno ambiental, así que es posible esquivarlo.
- Pastores de esporas heridos: intentan huir cuando ven al jugador.
- Segundo estrato de las ocho ruinas: estabilizar una resonancia neutraliza campos peligrosos cercanos; absorberla despierta un guardián de ferrita persistente y modifica los caminos adyacentes.
- Guardados: se conserva el esquema 11; los guardianes, campos y modificaciones se guardan en la memoria de zona. Se añaden pruebas de regresión.
- Renderizado: sigue siendo Canvas 2D. No se ha integrado PixiJS ni se ha realizado QA visual interactiva completa.

Para compilar y probar: `npm run typecheck && npm run test:core && npm run build:offline`.

---

# MUTATION 404 v1.5 — El despertar de Nácar

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Nuevas interacciones sistémicas

- **Ocho cámaras de resonancia:** en el segundo estrato de cada ruina regional, encuentra la señal `?` en (22,12), junto a la reliquia. Pulsa **E** para elegir entre estabilizar con un condensador (reduce exposición y recupera concentración) o absorber (otorga un punto genético, aumenta la exposición y provoca un peligro ambiental). La elección se recuerda en la partida y no se puede repetir para acumular recompensas.
- **Combustión de esporas:** Ignición aplicada a una criatura situada en una nube fúngica consume esa nube y provoca daño adicional. La acción sigue consumiendo concentración y un turno.
- **Compatibilidad:** las decisiones se guardan mediante el registro de eventos actual. Las partidas anteriores no requieren borrarse.

## Verificación

Ejecutar `npm run test:core`, `npm run typecheck`, `npm run build:offline`. GitHub Actions ejecuta estas comprobaciones antes del despliegue. La evaluación visual y de balance en una partida real continúa pendiente.

**Renderizado:** Canvas 2D. No se ha integrado PixiJS/WebGL2.

---

# MUTATION 404 v1.4 — Nácar Vivo

**Jugar:** https://ivan7800.github.io/MUTATION-404/

## Novedades
- Las criaturas evitan fuego y electricidad al perseguir al jugador cuando hay un camino alternativo, conservando una ruta de emergencia si no pueden rodear el obstáculo.
- Campos de fuego, electricidad y esporas con pulsos visuales (desactivados cuando el sistema solicita menos movimiento).
- Barras de salud compactas directamente bajo enemigos heridos en el mapa ASCII.
- Compatibilidad con guardados anteriores: los cambios son de lógica de IA y presentación.

## Validación

El workflow `.github/workflows/pages.yml` realiza comprobación TypeScript, pruebas del motor, construcción web y despliegue en GitHub Pages. Verifica su resultado en Actions. La validación manual en navegador real y el balance de los nuevos comportamientos siguen siendo tareas de QA.

**Motor gráfico:** Canvas 2D; PixiJS/WebGL2 todavía no está integrado.

---

# MUTATION 404 v1.3 — Ecos de Nácar

La versión 1.3 suma retroalimentación visual animada de ataques, mutaciones, escaneo y daño; señales sonoras sintetizadas opcionales (solo después de activar el audio) y conserva el motor y los guardados.

**Jugar:** https://ivan7800.github.io/MUTATION-404/

**Estado:** 88 pruebas de núcleo superadas en la comprobación local; la compilación web ha pasado. La validación visual manual en navegador real sigue pendiente. El renderizador todavía es Canvas 2D.

---

# MUTATION 404 v1.2 — Consola de Nácar

Actualización incremental: mayor contraste del mapa ASCII, navegación y foco más visibles, adaptación móvil y pipeline de publicación de GitHub Pages.

**Jugar:** https://ivan7800.github.io/MUTATION-404/

**Publicación:** el workflow `.github/workflows/pages.yml` ejecuta comprobación de tipos, pruebas y compilación estática; publica el contenido de `play/` como raíz del sitio.

**Limitaciones:** Canvas 2D sigue siendo el renderizador; PixiJS, simulación avanzada y pruebas visuales de extremo a extremo continúan pendientes. Este hito no certifica un 9,5/10.

---

# MUTATION 404 v1.1 — Renacimiento visual

Versión candidata del RPG ASCII para web, Linux y Windows mediante navegador local.

## Inicio rápido
- Linux: `chmod +x INICIAR-LINUX.sh && ./INICIAR-LINUX.sh`
- Windows: `INICIAR-WINDOWS.bat`
- GitHub Pages: ver `docs/RELEASE_v1.1.md` y activar Pages → GitHub Actions.

**Incluye `play/` listo para publicar en GitHub Pages; no se requiere npm para jugar localmente si Node.js 20+ está instalado.**

# MUTATION 404 v1.0 — LOS ARCHIVOS DEL ABISMO (candidato de versión)

Evolución directa de v0.9. Conserva sectores, biomas, mutaciones, combate, comercio, fabricación, CERO-7, misiones y guardados anteriores.

## Novedades verificables

- Ocho identidades de ruinas: arquitectura decorativa original, denominación y textos diferentes.
- Campos ambientales temáticos de fuego, electricidad y esporas, guardados por zona.
- Reliquia interactiva en **(20,12)** dentro de cada estrato regional; pulsa **E** junto a ella.
- Recompensas únicas por planta, registradas en eventos: créditos y, en el segundo estrato, punto genético y condensador.
- Guardado esquema **11** y nueva clave `mutation404.v10.save` (con lectura de la clave anterior `mutation404.v09.save`), compatible con migraciones anteriores. Las plantas ya exploradas permanecen intactas; la ambientación nueva se aplica a las plantas que se generen por primera vez.
- Señales visuales de foco y opción de reducir animaciones.

## Ejecutar

En Linux Mint: `chmod +x INICIAR-LINUX.sh && ./INICIAR-LINUX.sh`. En Windows, ejecuta `INICIAR-WINDOWS.bat`.
Requiere Node.js 20+; los clientes compilados se incluyen en `play/`. No es un ejecutable nativo.

## Calidad

`npm run test:core` y `npm run build:offline`. Consulta `docs/QA_v1.0.md`. **Esta entrega es un candidato de versión 1.0, no la certificación de un RPG terminado o 9,5/10.**
