# MUTATION 404 — Biblia del mundo v0.3

**Documento:** Diseño de mundo y contenido de la primera región: Las Salinas de Vértice  
**Estado:** PREPRODUCCIÓN / propuesta, sin implementación ni pruebas  
**Continuidad:** Biblia narrativa v0.1 y Biblia de sistemas v0.2  
**Motor previsto:** TypeScript estricto + PixiJS/WebGL2, renderizador separado de la simulación  
**Principio rector:** Ciencia ficción posapocalíptica + horror cósmico; exploración abierta y reglas aprendibles. Universo original, sin reproducir recursos ni contenidos de Caves of Qud.

---

## 1. Fantasía del jugador y tono

Eres un Errante en Nácar, un planeta transformado tras **la Interrupción**. El mundo no espera tu llegada: caravanas recorren rutas, las instalaciones antiguas continúan funcionando y las anomalías alteran lugares conocidos. La primera región debe sostener tres fantasías de juego: **viajar sin rumbo y descubrir**, **sobrevivir mediante ingenio y sistemas**, **desentrañar un misterio que aumenta de escala**.

Tono: aislamiento, curiosidad, decadencia tecnológica, maravilla biológica y un terror cósmico **infrecuente pero persistente**. Cada aparición importante debe anticiparse con huellas, ruido, geometría, testimonios o alteraciones físicas. No depender del sobresalto ni del castigo arbitrario.

### Promesa jugable de la primera hora

1. Elegir origen, capacidades y equipo; llegar a un lugar habitado.
2. Hablar con al menos tres personajes cuya información se contradice por motivos comprensibles.
3. Salir del asentamiento y tomar dos rutas viables hacia el mismo objetivo.
4. Resolver un encuentro mediante combate, evasión, distracción o aprovechamiento ambiental.
5. Descubrir que el artefacto buscado anuncia sucesos aún no ocurridos.
6. Regresar con información que modifica relaciones o el estado local.

**No prometer:** campaña planetaria completa, todas las mutaciones, simulación fuera de pantalla exacta o un mundo ilimitado durante la vertical slice.

## 2. Geografía de Nácar

Cinco macrorregiones forman la visión a largo plazo: **Salinas de Vértice**, **Bosque de Médula**, **Criptas de Hierro**, **Mar Inmóvil** y **Geometría Hundida**. En v0.1 solo será jugable un subconjunto de las Salinas. Los nombres y encuentros de las otras regiones podrán aparecer en relatos, mercancías o rumores, pero no como destinos falsamente accesibles.

### Las Salinas de Vértice

Altiplano de sal fosilizada, dunas negras y capas de antiguas antenas. Las placas blancas resuenan al caminar: a veces por estructuras huecas, a veces por señales sin emisor. La electricidad se propaga por canales salobres; los asentamientos construyen aislantes con cerámica, caucho recuperado y fibra viva.

**Subzonas de la región completa (plan futuro):**

- **Cuenca del Último Relé:** rutas comerciales y torres rotas.
- **Planicie de las Costras:** terreno abierto; caravanas y depredadores de vibración.
- **El Salar Negro:** charcas conductoras, tormentas y restos industriales.
- **Los Dientes del Horizonte:** escarpes salinos, cuevas y observatorios.
- **La Cicatriz de Radio:** anomalía de alto riesgo; inicialmente inaccesible o anunciada.

### Mapa conceptual de campaña (no escala de juego)

```text
                 N
                 ^
         [Dientes del Horizonte]
                   |
  [Planicie]--[FARO CIEGO]----[Torre del Nudo]
       |           |                 |
 [Caravana]----[Cruce 7]------[Estación CERO-7]
                   |                 |
              [Salar Negro]---[Galerías de Vidrio]
                   |
           [Cicatriz de Radio]
```

Este esquema expresa **conexiones y riesgos**, no coordenadas definitivas. El generador conservará rutas transitables, puntos de refugio y zonas de peligro legibles.

## 3. Sector jugable de la vertical slice v0.1

**Nombre:** Cuenca del Último Relé.  
**Alcance recomendado:** mapa estratégico de 5 × 5 sectores, cada sector local con una cuadrícula configurable de 64 × 48 celdas. Es un parámetro de prototipo, no un compromiso definitivo de tamaño. Los bordes conectados comparten puntos de acceso coherentes.

**Localizaciones diseñadas a mano en el primer corte:**

1. **Faro Ciego** — asentamiento inicial y refugio; servicios y misión.
2. **Cruce 7** — punto de caravanas y decisiones sociales.
3. **Torre del Nudo** — repetidor parcialmente funcional, ruta alternativa.
4. **Estación CERO-7** — ruina de tres niveles con el objetivo central.
5. **Galerías de Vidrio** — salida secundaria y peligro ambiental.

**Terrenos procedurales:** dunas de costra, lechos secos, depósitos de chatarra, charcas salobres, grietas, refugios menores. El diseño de cada sector se basa en semilla y restricciones de navegabilidad. Las cinco localizaciones anteriores conservan coordenadas estables dentro de la semilla de campaña; su interior combina habitaciones autorales con detalles procedurales.

### Reglas de densidad

- En los sectores cercanos al asentamiento, máximo dos turnos de exploración significativa sin un estímulo: pista, recurso, amenaza, decisión o señal ambiental (objetivo de diseño, sujeto a pruebas de ritmo).
- Una ruta segura más larga y otra ruta peligrosa más corta al objetivo principal.
- Ningún enemigo letal obligatorio junto al punto de aparición.
- El jugador puede retirarse al asentamiento sin quedar bloqueado por una sola llave.
- La primera ruina permite al menos una solución sin mutación específica.

## 4. Faro Ciego — asentamiento inicial

Faro Ciego se construyó alrededor de una antena que, según sus habitantes, dejó de emitir hace generaciones. Sus paredes son placas de cerámica aislante. Hay campanillas de cristal colgadas en todas las puertas. Cuando suenan sin viento, la gente cierra las ventanas.

**Zonas internas:** Plaza de las Costras (centro social), Taller Ferral (reparación), Enfermería del Pozo (curación), Posada del Aislante (descanso), Archivo de Ondas (investigación), Baluarte del Viento (vigilancia) y Pozo Sellado (secreto posterior).

**Servicios jugables v0.1:** descanso y recuperación limitada, vendedor con existencias simples, reparación básica, conversación, panel de rumores, guardado seguro en modo Explorador. Evitar menús decorativos: si una tienda aparece debe vender realmente y registrar inventario.

### Personajes principales

| ID | Nombre | Papel y voz | Objetivo | Información / conflicto | Mecánica |
|---|---|---|---|---|---|
| NPC-01 | **Iria Seln** | Técnica del Archivo de Ondas; precisa, cansada | Comprobar el origen de una transmisión | Ha oído una voz describir un accidente futuro | Encarga misión, interpreta señal |
| NPC-02 | **Tamo Vez** | Reparador del Taller Ferral; práctico | Conservar suministro de aislantes | Puede reparar el repetidor sin entrar en la ruina | Comercio, reparación, ruta técnica |
| NPC-03 | **Yara del Pozo** | Sanadora y antigua exploradora; reservada | Mantener el Pozo Sellado intacto | Reconoce una secuencia de pulsos que finge desconocer | Curación, advertencias, secreto |
| NPC-04 | **Brask Neral** | Jefe de una cuadrilla de recuperadores; negociador | Extraer un núcleo valioso de CERO-7 | Controla un paso mediante pago o favor | Negociación, reputación Ferral |
| NPC-05 | **Nema Tres-Voces** | Peregrina del Eco; habla con pausas irregulares | Seguir señales hasta la Cicatriz | Recuerda tres versiones incompatibles del mismo viaje | Pistas no obligatorias, foreshadowing |
| NPC-06 | **Keral Soot** | Vigilante local; escéptico | Impedir que entren depredadores | Considera sabotaje lo que Iria llama anomalía | Tutorial de ruido, patrullas |

**Regla de escritura:** los NPC deben expresar carácter, interés y límites de conocimiento. No convertirlos en terminales de explicación enciclopédica.

### Cambio de estado del asentamiento

Al completar «La frecuencia enterrada», Faro Ciego puede entrar en uno de tres estados iniciales: **Tranquilidad aparente** (baliza aislada), **Alerta comercial** (baliza entregada al Sindicato) o **Vigilia de señal** (se activa una transmisión pública). Cambian dos o más diálogos, un precio o servicio, y un evento ambiental. Los cambios se guardan.

## 5. Lugares de aventura

### Cruce 7

Puesto comercial levantado sobre raíles que sobresalen de la sal. La gente marca en el suelo las zonas seguras para no despertar a las larvas que perciben vibraciones. Aquí se encuentra Brask y puede negociarse un acceso a CERO-7. Conocimiento útil: algunas criaturas detectan ruido, no visión.

**Elecciones:** pagar con fragmentos de señal, intercambiar un componente, hacer un favor o buscar un paso alternativo. El coste de cada opción se informa antes de confirmar.

### Torre del Nudo

Antena corroída con una consola antigua. Ofrece una vía técnica para cumplir la misión sin sustraer físicamente la baliza: reparar un transmisor remoto y registrar un fragmento válido de señal. **No requiere Puerto de médula**; este acelera el procedimiento pero existen herramientas y talentos tecnológicos equivalentes.

**Obstáculo sistémico:** agua salobre alrededor de un circuito energizado. Pistas: olor a ozono, luz intermitente y lectura del detector. Se puede cortar alimentación, aislar la zona con un componente o asumir riesgo informado.

### Estación CERO-7 — mazmorra inicial

Antiguo complejo de mantenimiento y transmisión, parcialmente inundado, bajo una cubierta de hormigón blanco. Tres pisos conectados:

| Planta | Identidad | Enemigos/amenazas | Objetivo y salidas |
|---|---|---|---|
| 0 — Acceso | Aduana y depósitos secos | Carroñeros, puertas y ruido | Entrada principal, escalera, documentos |
| -1 — Conductores | Laboratorio y charcas conductoras | Vigía de cobre, electricidad | Interruptor, ruta técnica, ascensor averiado |
| -2 — Sala de Eco | Cámaras revestidas de material orgánico | Larva de médula, perturbación | Baliza, consola, salida por Galerías |

**Pieza central de horror:** en Sala de Eco existe un registro con la fecha de mañana y una transcripción de una conversación que el jugador todavía no ha tenido. No se fuerza a pronunciarla: su aparición es una pista, no una escena que arrebata el control.

**Garantías:** ruta a pie desde entrada a objetivo; alternativa sin combate obligatorio mediante sigilo, interrupción eléctrica o negociación previa; al menos dos accesos/salidas; regeneración procedural no debe clausurar conexiones esenciales.

### Galerías de Vidrio

Túneles con paredes formadas por una sustancia vitrificada. Constituyen salida lateral de CERO-7, atajo peligroso y una zona donde los sonidos aparecen con retraso. El efecto sonoro tiene una explicación mecánica sencilla: engaña la localización inicial de ciertos ruidos, pero las señales visuales y la inspección permiten reconocerlo.

## 6. Criaturas y comportamiento ecológico

Las tres criaturas jugables de la vertical slice son las definidas por la Biblia v0.2. Sus valores numéricos se calibrarán con el motor de combate, no se presentarán como balance final.

| ID | Criatura | Glifo/paleta | Hábitat | Conducta | Contrajuego |
|---|---|---|---|---|---|
| CR-01 | **Carroñero de sal** | `c`, ocre | Planicies y depósitos | Busca restos, se agrupa, huye herido | Alimento/señuelo, retirada, aislar individuos |
| CR-02 | **Vigía de cobre** | `V`, ámbar | CERO-7 y Torre | Patrulla por visión, transmite alertas | Romper línea de visión, cortar energía, cobertura |
| CR-03 | **Larva de médula** | `l`, verde pálido | Ruinas profundas y grietas | Sigue ruido y vibración, ignora ilusiones solo visuales | Moverse con cuidado, distraer mediante ruido, evitar superficies resonantes |

**Criaturas futuras solo referenciadas en rumores:** ballenas de polvo, cartógrafos ciegos, enjambres de sílice y custodios de la costra. No incluirlas como enemigos hasta especificar sus mecánicas.

### Tablas de aparición

La frecuencia depende de bioma, hora local, ruido, eventos y reputación cuando proceda. La generación se limita por presupuesto de amenaza y distancia al jugador. No aparecerán enemigos directamente en campo visual sin un evento justificado y avisado.

## 7. Facciones locales y consecuencias

Facciones globales establecidas: Concordia de Ceniza, Culto del Ojo Vacío, Sindicato Ferral, Jardineros de Médula, Custodios del Cero y Peregrinos del Eco.

En Cuenca del Último Relé intervienen principalmente:

- **Concordia de Ceniza:** garante formal de Faro Ciego. Prefiere aislamiento y orden; recompensa pruebas y protección de habitantes.
- **Sindicato Ferral:** cuadrilla de Brask; busca materiales y exclusividad sobre hallazgos. No es malvado por definición.
- **Peregrinos del Eco:** investigan frecuencias extrañas; defienden la difusión, pero subestiman riesgos.
- **Custodios del Cero:** representados indirectamente por vigías, terminales y directivas incompatibles con las actuales.

**Reputación:** escala -100 a +100 de v0.2. Para la primera misión, cambios modestos y explícitos (ejemplo provisional: Concordia +10 al aislar la señal; Ferral +10 al entregarla; Peregrinos +10 al difundirla). Registrar las variaciones, evitar bloqueos irreversibles de contenido principal por reputación.

## 8. Misión principal de la vertical slice — «La frecuencia enterrada»

**Disparador:** Iria pide investigar una transmisión antigua que contiene una predicción verificable de un incidente en Faro Ciego.

**Máquina de estados:**

```text
NO_INICIADA
    |
    v
SEÑAL_RECIBIDA
    |
    v
PISTAS_REUNIDAS ----------> TORRE_REPARADA -----------+
    |                                                  |
    +---------> ACCESO_NEGOCIADO ----------------------+---> EVIDENCIA_OBTENIDA
    |                                                  |            |
    +---------> INFILTRACION_CERO7 ---> BALIZA_RECUPERADA           v
                                                          DECISION_DESTINO
                                                              /   |   \
                                                        AISLAR ENTREGAR DIFUNDIR
                                                              \   |   /
                                                               CERRADA
```

**Nota importante:** los caminos pueden solaparse: negociar un pase no impide infiltrarse después. La misión almacena *hechos* (`hasSignalEvidence`, `relayRepaired`, `beaconRecovered`) y derivará su estado, en lugar de un único booleano por ruta.

### Vías para obtener evidencia

**A. Infiltración:** acceder a CERO-7, llegar a la Sala de Eco y copiar/recuperar la baliza. Posibles métodos: combate, evasión, desactivación de maquinaria o aprovechamiento eléctrico.

**B. Ingeniería:** llegar a Torre del Nudo, reunir una bobina aislante y reparar la ruta de transmisión. Requiere herramienta o prueba de Tecnología; Puerto de médula (TEC-01) será una ventaja futura, no requisito de la vertical slice.

**C. Negociación:** convencer a Brask de permitir un acceso seguro o entregar un registro obtenido por la cuadrilla. Requiere precio, favor o relación adecuada; no exige puntuación social que el protagonista no pueda alcanzar.

### Decisión final: qué hacer con la evidencia

| Decisión | Efecto inmediato | Consecuencia visible | Coste narrativo |
|---|---|---|---|
| Aislar la señal | Iria y Yara sellan el circuito | Faro Ciego calma su actividad | Parte del conocimiento queda oculto |
| Entregar al Sindicato | Brask obtiene el material | Se amplía el comercio y aumenta vigilancia | Intereses externos controlan el descubrimiento |
| Difundirla | Nema y Peregrinos reproducen la frecuencia | Aparecen curiosos y señales extrañas | La anomalía atrae atención desconocida |

**Condición de justicia:** las tres decisiones deben describir claramente sus consecuencias inmediatas previsibles. Las consecuencias cósmicas lejanas pueden permanecer ambiguas, pero no convertirse en trampas sin señales.

### Hitos de seguimiento

- Al menos tres entradas diferenciadas en el registro de misión (indicio, ruta, resultado).
- El diario nombra el lugar donde se obtuvo cada prueba.
- Se puede abandonar y retomar la misión sin perder progreso.
- Al cerrar misión, recompensa de XP, objeto o reputación y dos cambios de mundo persistentes.

## 9. Misiones secundarias

**«Las campanas sin viento»** — Keral quiere descubrir por qué suenan los cristales de la muralla. Ruta científica: estudiar vibraciones; ruta práctica: reforzar un soporte; ruta social: hablar con Nema. Recompensa: conocimiento del comportamiento de las larvas y acceso a un paso más seguro.

**«Una bobina por un nombre»** — Tamo necesita componentes para aislar el repetidor. El jugador puede recuperarlos, comprarlos o reparar una bobina dañada. Introduce inventario, comercio, fabricación básica y opción técnica en la misión principal.

**«El precio de la costra»** — Brask solicita recuperar un cargamento sin matar a los carroñeros que anidan allí; el jugador decide preservar o expulsar la fauna. Consecuencias pequeñas y locales. Para v0.1 puede quedar como misión **opcional de ampliación**, no requisito de aceptación.

## 10. Secretos y descubrimientos

Los secretos se clasifican en **ambientales**, **sistémicos** y **narrativos**. Un secreto no puede basarse exclusivamente en pulsar una pared aleatoria.

1. **La campana muda:** una campana jamás suena con viento, solo ante una variación electromagnética. Enseña a identificar peligros.
2. **La cuarta huella:** en una ruta aparecen tres pares de pisadas y una huella única que empieza en mitad de la sal. Es un misterio ambiental, no una trampa.
3. **El inventario de mañana:** registro de CERO-7 enumera un objeto que el jugador puede obtener más tarde. Tiene explicación en la campaña, no debe bloquear el progreso.
4. **El Pozo Sellado:** Yara niega que tenga fondo; una inspección revela su estructura de ventilación. Hilo de la campaña futura.
5. **La ruta del eco:** retraso acústico en las Galerías permite anticipar una anomalía, si el jugador presta atención.
6. **El testigo imposible:** un terminal registra al personaje con una descripción parcialmente incorrecta, dependiente de origen, sin falsear mecánicas observables.

**Control anti-frustración:** cada secreto sustancial tiene al menos dos fuentes de pistas y puede registrarse en el diario.

## 11. Experiencia de terror cósmico

La primera región tendrá un arco de descubrimiento:

- **Extrañeza cotidiana:** campanas que suenan sin viento, interferencias y supersticiones locales.
- **Contradicción física:** la señal anuncia algo que todavía no sucede.
- **Prueba personal:** CERO-7 contiene una conversación futura que parece implicar al jugador.
- **Ausencia deliberada:** nadie explica por completo la Interrupción. La región entrega evidencia, no una exposición final.

La perturbación usa los umbrales 25/50/75 de la Biblia v0.2. Las manifestaciones visuales no impedirán leer los datos esenciales ni ocultarán información de riesgo inmediato. Se podrán reducir efectos de parpadeo y audio invasivo.

## 12. Diseño ASCII: vocabulario visual

**Primer conjunto de símbolos orientativo:**

| Glifo | Elemento | Regla de presentación |
|---|---|---|
| `@` | Personaje | Máxima legibilidad, nunca confundible con NPC |
| `.` | Sal firme | Color neutro según bioma |
| `,` | Arena suelta | Señal de textura, no obstáculo |
| `#` | Muro | Contraste alto; distingue sólido de decoración |
| `+` | Puerta | Estado abierto/cerrado identificable |
| `~` | Líquido | Color según composición; inspección revela conductividad |
| `^` | Grieta | Advertencia visible antes del daño |
| `=` | Metal/circuito | Propiedades eléctricas inspeccionables |
| `c` | Carroñero | Ocre; identificable por inspección |
| `V` | Vigía | Ámbar; visión/persecución |
| `l` | Larva | Verde pálido; sonido/vibración |
| `!` | Consumible | Diferenciación por panel y color |
| `?` | Artefacto desconocido | No equivale automáticamente a peligro |
| `>` / `<` | Escaleras | Conexiones verticales persistentes |

No depender únicamente del color para distinguir entidades. Ofrecer modo ASCII puro y atmosférico, ambos con la misma información jugable.

### Maqueta conceptual — Faro Ciego

```text
    LAS SALINAS DE VÉRTICE · FARO CIEGO
#################################################
#...TALLER....#...PLAZA......#..ARCHIVO........#
#.....T.......+......@.......+.....I...........#
#.............#....,...,...,.#.................#
######+############....################+########
#....POSADA....#...POZO SELLADO...#..BALUARTE...#
#......P.......+.................+......K.......#
#################################################
PV 24/24  E 11/11  Perturbación 0 | Día 1
«La campana del archivo suena. No hay viento.»
```

La maqueta no es una captura de ejecución y no fija dimensiones finales de los mapas.

## 13. Economía y recompensas iniciales

Unidad monetaria: **fragmentos de señal**. El vendedor de Faro Ciego comienza con tres categorías realmente útiles: consumibles de curación, aislamiento eléctrico y herramienta de reparación. Los precios siguen la fórmula de v0.2 y los stocks persisten.

**Objetos mínimos de vertical slice:** cuchillo de chatarra, pistola de inducción defectuosa (armamento a distancia de corto alcance), placa cerámica, bobina aislante, vendaje, batería, sonda manual, llave industrial, registro de señales y baliza de CERO-7. Cada objeto debe tener uso, peso y descripción inspeccionable.

**Mutaciones disponibles v0.1:** Placas dérmicas (BIO-02), Eco neural (PSI-01), Piel de cobre (TEC-02). La primera zona incluye situaciones donde cada una resulta útil y otras donde no resuelve la dificultad por sí sola. El resto del catálogo permanece como diseño.

## 14. Reglas técnicas para Codex: datos y persistencia

Objetos narrativos deben identificarse por IDs inmutables: `region.vertex_salt`, `location.blind_beacon`, `dungeon.zero7`, `quest.buried_frequency`, `npc.iria_seln`, `creature.copper_sentinel`. Los nombres visibles pueden cambiar sin romper guardados.

**Estructura sugerida de datos (orientativa):**

```ts
type WorldLocation = {
  id: string;
  regionId: string;
  tags: string[];
  entryPoints: { sectorX: number; sectorY: number; x: number; y: number }[];
  narrativeFlags: string[];
};

type QuestFact =
  | 'signalReceived'
  | 'relayRepaired'
  | 'beaconRecovered'
  | 'evidenceObtained'
  | 'signalIsolated'
  | 'signalSold'
  | 'signalBroadcast';

interface QuestProgress {
  id: 'quest.buried_frequency';
  facts: Partial<Record<QuestFact, boolean>>;
  completedAtTick?: number;
}
```

**Persistencia mínima:** identidad de semilla, versión de generador, coordenadas y nivel del jugador, estado del mapa explorado, cambios ambientales persistentes, objetos, NPC persistentes, estado de misiones, relaciones con facciones y RNG. No acoplar el texto de misión a la lógica de juego.

**Garantía procedural:** las cinco localizaciones clave y los accesos de la misión deben estar disponibles en cada semilla aceptada. Procedimiento recomendado: reservar hitos, generar topología de caminos, crear sectores, comprobar conectividad, poblar biomas y finalmente validar accesibilidad.

## 15. Plan de contenido por implementación

| Corte | Contenido autoral | Sistemas necesarios | Condición de aceptación |
|---|---|---|---|
| W1 — Llegada | Faro Ciego, Iria, Keral, senderos | Turnos, mapa, diálogo, diario | Entrar/salir, hablar, guardar |
| W2 — Ruta exterior | Cruce 7, Tamo, Brask | Inventario, comercio, IA y reputación | Conseguir bobina de 2 formas |
| W3 — Ruina | CERO-7, tres pisos, 3 criaturas | Combate, navegación, electricidad | Llegar y escapar por 2 rutas |
| W4 — Mutaciones | 3 mutaciones, efectos ambientales | Recursos, CD, resistencias | Pruebas por habilidad y contrapartida |
| W5 — Historia | Tres resoluciones de misión | Hechos, consecuencias, persistencia | Tres finales reproducibles de la misión |
| W6 — Pulido | UI, sonido, tutorial contextual | Accesibilidad, métricas, E2E | Flujo completo sin bloqueos críticos |

Las etiquetas W1–W6 son cortes de trabajo, **no estimaciones de semanas ni calendario**.

## 16. Matriz de QA narrativa y sistémica

| ID | Prueba | Resultado esperado |
|---|---|---|
| MAP-001 | 1.000 semillas de Cuenca | Faro Ciego, Torre y CERO-7 accesibles |
| MAP-002 | Cambiar de sector y volver | Entidades persistentes y cambios conservados |
| QST-001 | Terminar por infiltración | `evidenceObtained` y cierre coherente |
| QST-002 | Terminar por ingeniería | No requiere la mutación TEC-01 |
| QST-003 | Terminar por negociación | No requiere combatir ni credenciales imposibles |
| QST-004 | Guardar a mitad y cargar | Misma máquina de estados y hechos |
| QST-005 | Aislar, entregar y difundir en partidas distintas | Tres consecuencias persistentes diferentes |
| AI-001 | Vigía pierde línea visual | Busca última posición conocida, no conoce ubicación real |
| AI-002 | Larva oye un señuelo | Investiga el sonido si lo percibe |
| SIM-001 | Circuito junto a charca | La descarga afecta celdas conectadas con advertencias |
| SIM-002 | Cortar alimentación | Desaparece peligro eléctrico tras actualización |
| UX-001 | Solo teclado | Crear personaje, negociar, luchar y completar misión |
| UX-002 | Escala de letra y modo accesible | Información esencial sigue siendo legible |
| SAVE-001 | Guardar/cargar tras la decisión final | Faro Ciego conserva estado y reputación |

Resultados: **pendientes**; esta matriz define lo que deberá comprobarse. No se han ejecutado pruebas.

## 17. Riesgos de diseño y soluciones

**Mundo vacío:** introducir puntos de interés autorales y eventos contextualizados antes de aumentar tamaño.  
**Ruta de ingeniería dominante:** materiales limitados y decisiones de coste, sin convertirla en trampa.  
**Negociación como botón gratuito:** requerir información, recursos o reputación obtenibles.  
**Terror narrativo desconectado del motor:** cada anomalía significativa deja huellas inspeccionables o consecuencias de simulación.  
**Procedural rompe misiones:** reservar rutas/hitos y validar todas las semillas de test.  
**Exceso de diálogo:** entradas cortas, personajes con motivaciones y descubrimientos visuales.  
**Bloqueo por muertes de NPC:** definir sucesión de pistas y recuperación de misión mediante documentos/terminales.

## 18. Decisiones cerradas y pendientes

### Aprobadas como propuestas para Codex

- El universo es Nácar y la primera región es Las Salinas de Vértice.
- La vertical slice se centra en Faro Ciego y Estación CERO-7.
- «La frecuencia enterrada» admite infiltración, ingeniería y negociación.
- La resolución tiene tres destinos persistentes: aislar, entregar o difundir.
- Tres enemigos y tres mutaciones prueban los pilares sistémicos.
- El contenido narrativo se almacena por ID estable y hechos versionables.

### Pendientes de validación en prototipo

- Tamaño real de sectores y densidad de encuentros.
- Economía exacta y curva de dificultad.
- Ritmo de perturbación y frecuencia de eventos anómalos.
- Calidad de la navegación A* en mapas grandes.
- Coste de la simulación eléctrica y memoria de sectores.
- Localización, legibilidad y accesibilidad del mapa.

## 19. Siguiente documento

**Plan de producción y especificación para Codex v1.0:** contratos entre módulos, orden de tareas, esquema de datos definitivo, criterios de aceptación por fase, configuración de proyecto y pruebas automatizadas. Solo después debe iniciarse la programación.
