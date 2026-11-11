# MUTATION 404 — Biblia de diseño v0.1

**Estado:** Preproducción. Sin código implementado ni pruebas ejecutadas.

## Identidad
RPG sistémico / roguelike de ciencia ficción posapocalíptica y horror cósmico, con estética ASCII a color, exploración cenital y combate táctico por turnos. Idioma inicial español. Plataformas objetivo: web, Windows y Linux. Inspiración de profundidad: Caves of Qud, con universo y contenidos originales.

## Premisa
Miles de años después de la Interrupción, las comunicaciones cesaron, la materia viva mutó y ciertas regiones dejaron de obedecer la física conocida. El jugador es un Errante, no un elegido, que explora el planeta Nácar y descubre una transmisión que parece conocer el futuro.

## Pilares
1. Mundo autónomo: migraciones, facciones, comercio y asentamientos cambiantes.
2. Sistemas emergentes: líquidos, electricidad, fuego, gases, corrosión, temperatura y materiales.
3. Mutación como identidad mecánica, social y narrativa.
4. Horror mediante descubrimiento, anticipación e incertidumbre.
5. Libertad y consecuencias persistentes.

## Mundo: Nácar
- **Salinas de Vértice:** desiertos minerales, antenas enterradas, caravanas; región inicial.
- **Bosque de Médula:** vegetación consciente, hongos gigantes y memoria colectiva.
- **Criptas de Hierro:** fábricas autónomas y ciudades industriales subterráneas.
- **Mar Inmóvil:** océano negro de olas discontinuas y costas cambiantes.
- **Geometría Hundida:** espacio anómalo y estructuras sensibles al observador.

Exploración a escala global (regiones y rutas), local (mapas ASCII) y vertical (superficie y profundidades). Combinar lugares diseñados a mano con generación por semillas.

## Personajes
Atributos: Fuerza, Agilidad, Resistencia, Intelecto, Voluntad y Percepción.
Orígenes: Nacido del Polvo, Heredero de Máquina, Simbionte, Exiliado del Umbral, Vástago de Colmena y Archivista Errante. Cada origen modifica capacidades, equipo, relaciones y posibilidades narrativas.

## Mutaciones
- **Biológicas:** brazos adicionales, placas óseas, regeneración, sentidos y secreciones.
- **Psíquicas:** telepatía, telequinesis, sugestión, proyección y lectura de recuerdos.
- **Tecnoorgánicas:** interfaces neuronales, piel conductora, control de máquinas y órganos artificiales.
- **Anómalas:** duplicación temporal, distorsión espacial, visión alternativa y alteración de causalidad.

Cada mutación requiere niveles, costes, límites, interacciones y efectos secundarios. Ejemplo: la conductividad corporal puede cambiar el resultado de una descarga según el agua y el aislamiento.

## Combate y simulación
Acciones por turnos con costes temporales: movimiento, ataques, recargas, poderes y manipulación del entorno. Enemigos con percepción, objetivos, estado y equipamiento. Materiales con conductividad, inflamabilidad, resistencia, toxicidad y permeabilidad. Actualización de simulación por zonas activas. El jugador puede evitar encuentros por sigilo, diálogo, rutas alternativas o manipulación ambiental.

## Facciones
- Concordia de Ceniza: asentamientos humanos.
- Culto del Ojo Vacío: religión anómala.
- Sindicato Ferral: comerciantes y recuperadores.
- Jardineros de Médula: comunidad simbiótica.
- Custodios del Cero: inteligencias artificiales antiguas.
- Peregrinos del Eco: exploradores y estudiosos.

Reputación granular, alianzas, conflictos internos y consecuencias persistentes.

## Campaña: La última frecuencia
El Errante recibe una transmisión aparentemente anterior a la Interrupción que predice hechos aún no ocurridos.
1. La señal enterrada.
2. Los nombres de la carne.
3. La máquina que recuerda.
4. El mundo equivocado.
5. La última frecuencia.

Campaña no obligatoria para disfrutar del mundo, decisiones con consecuencias y finales alternativos.

## Dirección audiovisual
ASCII a color legible, paletas minerales y bioluminiscentes, animaciones breves, iluminación discreta, interfaz accesible, registro de eventos, escalado de fuente, controles remapeables y reducción de destellos. Audio ambiental reactivo: drones industriales, radio, resonancias y silencio.

## Modos
- Explorador: guardado libre y dificultad configurable.
- Superviviente: gestión exigente con guardado normal.
- Errante: permadeath roguelike.

## Bucle de juego
Explorar → Investigar → Sobrevivir → Transformarse → Cambiar el mundo → Explorar.

## Reglas de diseño
Información útil, amenazas anticipables, persistencia, generación procedural significativa, alternativas al combate, mutaciones con costes, muertes justas y horror sin depender de sobresaltos constantes.

## Arquitectura propuesta
TypeScript con motor de reglas desacoplado del renderizador Canvas 2D. Módulos: core, world, entities, systems, mutations, factions, narrative, rendering, ui, audio y persistence. Contenido basado en datos, RNG con semillas, turnos deterministas y guardados versionados. Electron para empaquetado posterior. Pruebas automatizadas con Vitest y CI.

## Producción
1. Prototipo técnico: turnos, mapa, movimiento, cámara, pruebas.
2. Vertical slice: región inicial, combate, mutaciones, inventario, guardado.
3. Alfa: mundo conectado, facciones, simulación ambiental.
4. Beta: campaña, equilibrio, interfaz y optimización.
5. Versión 1.0: cierre de contenido, pruebas, documentación y lanzadores.

## Criterios de la primera vertical slice
Una región explorable, un asentamiento, ruina de varios niveles, tres enemigos diferenciados, tres mutaciones funcionales, inventario, combate, una misión multisolución y guardado persistente. Pruebas del motor, controles responsivos y ejecución en navegador.

## Riesgos
Complejidad excesiva, mundo vacío, mutaciones desequilibradas, IA lenta, guardados incompatibles, interfaz confusa y pérdida de impacto del horror. Mitigaciones: alcance controlado, contenido artesanal, pruebas de combinaciones, actualización por proximidad, migraciones, pruebas de usabilidad y variación narrativa.

## Pendientes antes de programar
Detallar fórmulas de combate, progresión, economía, catálogo inicial de mutaciones, IA, reglas de generación, diseño de la región inicial y criterios de aceptación por módulo. La biblia v0.1 establece visión y principios, no especificaciones técnicas definitivas.
