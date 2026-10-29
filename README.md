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
