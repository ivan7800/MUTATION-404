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
