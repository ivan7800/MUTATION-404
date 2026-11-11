# MUTATION 404 — Biblia de sistemas RPG v0.2

**Estado:** propuesta de diseño para revisión; ninguna mecánica está implementada ni probada.  
**Universo:** Nácar, ciencia ficción posapocalíptica + horror cósmico.  
**Propósito:** especificación suficientemente concreta para construir una vertical slice determinista en TypeScript.

## 1. Principios del sistema

1. Los sistemas se comunican mediante acciones y eventos, no mediante dependencias del renderizador.
2. Toda decisión aleatoria usa un RNG sembrado, con flujos separados para mundo, combate y botín.
3. Cada acción produce un registro legible: intención, validación, coste, resultado y efectos secundarios.
4. Las mecánicas extrañas se anuncian con pistas suficientes; el horror no justifica castigos indescifrables.
5. Diseñar para decisiones significativas antes que acumulación de bonificaciones.
6. Toda cifra de este documento es **un valor inicial para pruebas**, no equilibrio confirmado.

## 2. Atributos y estadísticas

Seis atributos base entre **4 y 20** al crear personaje, valor humano de referencia **10**: Fuerza (FUE), Agilidad (AGI), Resistencia (RES), Intelecto (INT), Voluntad (VOL), Percepción (PER).

**Modificador:** `mod(A) = floor((A - 10) / 2)`. Rango inicial: -3 a +5.

**Creación:** todos empiezan en 10, se reparten 12 puntos adicionales; subir un atributo de 15 a 16 o más cuesta 2 puntos por incremento. Ningún atributo supera 18 antes de aplicar origen y mutaciones. Un origen proporciona +2 a un atributo, -1 a otro, una ventaja no numérica y una relación de facción. Valores finales dentro de 4–20.

**Estadísticas derivadas provisionales:**

- PV máximos: `20 + 4×mod(RES) + 3×(nivel−1)`; mínimo 8.
- Energía máxima: `10 + 2×mod(VOL) + nivel`; mínimo 5.
- Capacidad de carga (kg): `30 + 5×mod(FUE)`; mínimo 15.
- Defensa de evasión: `10 + mod(AGI) + cobertura + estados`.
- Defensa mental: `10 + mod(VOL) + resistencias`.
- Percepción pasiva: `10 + mod(PER) + sensores − penalizaciones`.
- Iniciativa inicial para desempates: `mod(AGI) + modificador de equipo`; el orden posterior depende de los costes de tiempo.

Los límites y fórmulas se documentan en datos versionados para facilitar ajustes.

## 3. Turnos, tiempo y acciones

Cada entidad dispone de un `nextActTick`. El planificador elige el menor tick (empates: índice estable de creación). La acción válida incrementa el tick según su coste ajustado por velocidad: `coste_final = max(25, ceil(coste_base × 100 / velocidad))`; velocidad por defecto 100 y limitada inicialmente a 50–200.

Costes base: caminar 100; atacar cuerpo a cuerpo 100; disparar 120; recargar 150; objeto 100; mutación 100–200; esperar 100. Inspeccionar o navegar por menús no avanza el tiempo. Las acciones inválidas **no consumen turno**, salvo intentos físicos explícitos fallidos (p. ej. forzar una puerta).

**Orden de resolución:** validar → pagar recursos y tiempo → ejecutar efecto primario → aplicar eventos secundarios con tope por cadena → actualizar visibilidad/estados → registrar diffs → solicitar render. Prohibido resolver cadenas infinitas; límite de 64 eventos derivados por acción y cola pendiente para turnos siguientes.

## 4. Combate

**Ataque físico:** `tirada = 1d20 + mod(atributo) + competencia + precisión_del_arma + modificadores_situacionales`. Impacta si `tirada >= defensa_objetivo`. Un 20 natural impacta y añade efecto crítico; un 1 natural falla. Competencia: +0 a +4. La defensa inicial típica es 10–16.

**Daño:** arma `dados + mod(FUE)` en cuerpo a cuerpo; armas a distancia `dados + bonificación específica`; después armadura resta reducción plana `RD` y resistencias porcentuales reducen el daño restante. Fórmula: `daño_final = max(0, floor(max(0, daño_bruto−RD) × (1−resistencia)))`. Resistencias entre -0.5 y 0.75. Daño mínimo 1 solo si el ataque penetró armadura y la regla del arma lo indica; evita trivializar defensas.

**Crítico:** 20 natural aplica daño adicional igual a un dado del arma (no duplica todos los modificadores); otros efectos según arma. **Cobertura:** +2 defensa parcial, +4 total (la cobertura total puede bloquear línea de tiro). **Distancia:** penalizaciones por alcance, nunca invisibles al jugador.

**Estados:** sangrado (daño periódico), quemadura (daño + propagación), corrosión (daña equipo), aturdimiento (pierde siguiente acción si no resiste), irradiación (acumulación), perturbación (interfiere percepción), inmovilización (impide desplazamiento). Cada estado tiene duración explícita, origen y forma de eliminación.

**Ejemplo verificable:** AGI 14 (+2), competencia +1, arma +1, contra defensa 14: impacta con d20 >= 10 (55% sin reglas de 1/20 que alteren ese umbral). Arma 1d6, FUE 12 (+1), RD 2: con tirada de daño 4, daño bruto 5 y final 3 si resistencia 0%.

## 5. Progresión

Niveles iniciales 1–20, ampliables. XP necesaria para llegar al nivel `n+1`: `100 × n` (coste incremental). Al subir nivel: +3 PV base, 1 punto de talento, y cada tres niveles 1 punto de atributo. Las mutaciones mejoran mediante **catalizadores** encontrados, decisiones narrativas o inversión de puntos de mutación; no todas mejoran automáticamente con el nivel. Máximo cinco mutaciones activas equipables en la primera vertical slice, pero pueden existir mutaciones pasivas y cambios anatómicos persistentes.

**Ramas de talento iniciales:** Supervivencia, Armas, Tecnología, Adaptación y Psique. Cada una comienza con tres talentos diseñados y validados, en vez de un árbol enorme con efectos repetidos.

## 6. Catálogo de 30 mutaciones iniciales

Convenciones: `E` = coste de energía; `CD` = enfriamiento en turnos personales; `P` = pasiva. Valores a nivel 1, sujetos a equilibrado.

| ID | Familia | Mutación | Efecto inicial | Coste/límite o contrapartida |
|---|---|---|---|---|
| BIO-01 | Biológica | Brazo vestigial | Puede portar una herramienta ligera extra | P; -1 precisión si se empuña arma pesada |
| BIO-02 | Biológica | Placas dérmicas | +2 RD física | P; +10 coste de movimiento |
| BIO-03 | Biológica | Regeneración febril | Cura 1d4 PV durante 3 turnos | 4 E, CD 8; genera calor |
| BIO-04 | Biológica | Sangre ácida | Daña a atacante cuerpo a cuerpo por contacto | P; riesgo al interactuar con aliados |
| BIO-05 | Biológica | Ojos prismáticos | Revela huellas térmicas cercanas | 2 E, CD 3; perturbación ante destellos |
| BIO-06 | Biológica | Branquias de limo | Respira bajo líquidos compatibles | P; requiere humedad periódica |
| BIO-07 | Biológica | Tendones elásticos | Salta dos celdas ignorando obstáculo bajo | 3 E, CD 4; no atraviesa muros |
| BIO-08 | Biológica | Espinas retráctiles | Contraataque próximo de 1d4 | 2 E, CD 3; rompe ropa frágil |
| PSI-01 | Psíquica | Eco neural | Detecta mentes no protegidas en radio 6 | 3 E, CD 5; alertas falsas en anomalías |
| PSI-02 | Psíquica | Empuje mental | Desplaza objetivo una celda | 4 E, CD 4; resistencia VOL |
| PSI-03 | Psíquica | Velo empático | Reduce agresión de criatura neutral | 3 E, CD 6; no afecta máquinas |
| PSI-04 | Psíquica | Memoria prestada | Identifica una propiedad oculta de objeto | 2 E, CD 5; puede dar información incompleta |
| PSI-05 | Psíquica | Dolor reflejado | Devuelve parte del daño mental | P; +1 perturbación al activarse |
| PSI-06 | Psíquica | Sueño impuesto | Duerme objetivo biológico 1 turno | 5 E, CD 8; salvación mental |
| PSI-07 | Psíquica | Ancla de voluntad | +3 defensa mental durante 3 turnos | 3 E, CD 6; -1 percepción mientras dure |
| PSI-08 | Psíquica | Mirada remota | Observa zona a 5 celdas | 4 E, CD 7; cuerpo inmóvil mientras observa |
| TEC-01 | Tecnoorgánica | Puerto de médula | Accede a terminales compatibles | P; exposición a malware diegético |
| TEC-02 | Tecnoorgánica | Piel de cobre | +30% resistencia eléctrica | P; conducción elevada si está mojado |
| TEC-03 | Tecnoorgánica | Glándula de batería | Recupera 4 E junto a fuente eléctrica | CD 6; riesgo de sobrecarga |
| TEC-04 | Tecnoorgánica | Cartografía interna | Marca celdas exploradas sin mapas físicos | P; interferencia en zonas anómalas |
| TEC-05 | Tecnoorgánica | Enjambre de sondas | Explora radio 4 durante 3 turnos | 4 E, CD 8; sondas destruibles |
| TEC-06 | Tecnoorgánica | Herramienta osteomecánica | Bonificación +2 al reparar o abrir tecnología | P; necesita mantenimiento |
| TEC-07 | Tecnoorgánica | Pulso inhibidor | Desactiva máquina menor 1 turno | 5 E, CD 8; puede alertar otras máquinas |
| ANO-01 | Anómala | Paso desfasado | Cruza una celda ocupada/obstáculo permisible | 5 E, CD 8; +2 perturbación |
| ANO-02 | Anómala | Segunda sombra | Crea señuelo durante 2 turnos | 4 E, CD 6; señuelo no causa daño |
| ANO-03 | Anómala | Tiempo prestado | Reduce coste de próxima acción un 50% | 5 E, CD 10; cansancio posterior |
| ANO-04 | Anómala | Geometría inversa | Intercambia posición con entidad visible | 6 E, CD 10; salvación mental y línea de visión |
| ANO-05 | Anómala | Boca del vacío | Absorbe proyectil físico seleccionado | 6 E, CD 12; no protege de explosiones |
| ANO-06 | Anómala | Recuerdo futuro | Revela una posible amenaza próxima | 3 E, CD 9; visión probabilística, no certeza |
| ANO-07 | Anómala | Frecuencia imposible | Desorienta criaturas en radio 3 | 6 E, CD 12; afecta aliados vulnerables |

**Contrapartidas:** nunca ocultar costes mecánicos relevantes en la ficha de creación. Efectos secundarios narrativos pueden descubrirse jugando, con advertencias diegéticas.

**Vertical slice:** implementar primero BIO-02, PSI-01 y TEC-02 con interacciones realmente verificadas; las 27 restantes forman el catálogo de diseño, no funcionalidades terminadas.

## 7. Recursos y supervivencia

Recursos iniciales: PV, energía, carga y perturbación (0–100). Hambre, hidratación, temperatura y radiación se introducirán **después** de validar que generan decisiones interesantes y no microgestión repetitiva.

**Perturbación:** aumenta al exponerse a anomalías, determinadas mutaciones y encuentros; en umbrales 25/50/75 introduce pistas, interferencias o modificadores anunciados. Nunca sustituye indiscriminadamente controles del jugador. Recuperación por refugio, sustancias y equipo especializado. Evitar usar "locura" como etiqueta genérica.

## 8. Equipamiento, fabricación y economía

Ranuras: cabeza, torso, brazos, piernas, dos manos principales, accesorio x2, implante x2. Anatomía mutada puede añadir o bloquear ranuras. Peso limitado por carga; exceder umbral impone penalización gradual, no imposibilidad inmediata.

**Clases de objeto:** consumibles, armas, armaduras, componentes, artefactos, herramientas, documentos y objetos de misión. Cada objeto posee ID estable, definición, estado, peso, rareza y modificadores serializables.

**Economía:** moneda inicial llamada *fragmentos de señal* (unidad abstracta intercambiable); precios base definidos por datos. Precio compra = `precio_base × oferta_local × reputación × condición`; venta = `precio_base × 0.45 × oferta_local × reputación × condición` con límites visibles. Prohibida ganancia infinita por comprar y revender al mismo comerciante. Los comerciantes tienen existencias y demanda persistentes con reposición acotada por tiempo.

**Fabricación:** receta = ingredientes + herramienta + competencia + coste temporal + resultado previsible. Primera versión: reparar una pieza, fabricar vendaje y aislar un componente eléctrico. El riesgo de fallo se mostrará antes de confirmar.

## 9. IA de criaturas

Estados base: patrullar, explorar, investigar ruido, perseguir, atacar, huir, proteger aliado, alimentarse, dormir y negociar. No todas las criaturas usan todos los estados.

**Percepción:** visión con línea de visión, sonido por propagación de coste, detección especializada y memoria del último lugar conocido. No leer la posición del jugador sin una fuente válida.

**Selección de acción:** necesidades/amenazas → utilidad de opciones → validación → plan local (A* si requiere ruta) → acción. Empates resueltos con RNG sembrado. Reevaluación limitada por presupuesto de CPU.

**Tres arquetipos para vertical slice:**

1. **Carroñero de sal:** atraído por restos; se acerca en grupo y huye herido.
2. **Vigía de cobre:** patrulla, detecta por línea visual y emite alerta a aliados próximos.
3. **Larva de médula:** rastrea vibraciones/ruidos; puede ignorar señuelos puramente visuales.

## 10. Simulación ambiental

Cada celda tiene terreno, materiales, líquidos, gases, temperatura, carga eléctrica y condiciones. No todos los sistemas se calculan cada turno: se procesan celdas activas y eventos de propagación con presupuestos.

**Interacciones de referencia:** líquido conductor + fuente de electricidad = expansión limitada según conectividad; fuego + material inflamable = temperatura/combustión; gas inflamable + chispa = explosión localizada; ácido + armadura vulnerable = desgaste. Estados y efectos se comunican mediante eventos registrados.

**Regla de seguridad del diseño:** una combinación debe ser reproducible con semilla y secuencia de acciones, mostrar pistas perceptibles y no encadenar propagaciones infinitas.

## 11. Generación procedural

Tres escalas: macrorregión → sector local → niveles verticales. Selección de bioma por ruido/condiciones y restricciones de continuidad; colocación de asentamientos y lugares únicos a partir de hitos narrativos; mazmorras por gramáticas de habitaciones, conexiones verificadas y población ecológica contextual.

**Garantías del generador:**

- Entrada/salida alcanzables por camino normal o alternativa explicitada.
- Posición inicial segura respecto a amenazas letales inmediatas.
- Objetivos de misión accesibles en modos previstos.
- Cofres/objetos no aparecen en muros.
- Mismos `worldSeed`, versión de contenido y coordenadas → mismo sector base.
- Deltas persistentes separados del sector generado.

**Pruebas:** 1.000 semillas de sectores con validación automática de conectividad, accesibilidad y ausencia de superposición inválida; registrar cualquier semilla fallida para reproducirla.

## 12. Facciones, diálogo y misiones

Reputación por facción de -100 a +100. Rangos: hostil (-100 a -50), desconfiado (-49 a -10), neutral (-9 a +29), favorable (+30 a +69), aliado (+70 a +100). Los límites son provisionales y algunas facciones pueden rechazar alianzas por motivos narrativos.

Los diálogos consultan estado del mundo, reputación, origen, talentos y mutaciones. Las misiones se representan como máquinas de estados con objetivos opcionales y alternativas de solución; no dependen de una secuencia rígida de escenas.

**Misión inicial — «La frecuencia enterrada»:** recuperar una baliza en una ruina. Caminos posibles: negociar con chatarreros; reparar un transmisor alternativo; acceder con una mutación tecnorgánica; atravesar las zonas vigiladas. Cada ruta tiene consecuencias registrables.

## 13. Persistencia y eventos

Formato de partida versionado con: metadatos, semilla, estado de RNG, turnos, jugador, entidades persistentes, reputación, misiones, sectores modificados y registro resumido. Escritura atómica en escritorio; IndexedDB con transacciones en web. Validación de esquema al cargar y migraciones explícitas. Autoguardado configurable que no interrumpa el turno.

Sistema de eventos tipados: `EntityMoved`, `AttackResolved`, `DamageApplied`, `StatusApplied`, `MutationUsed`, `TileChanged`, `FactionReputationChanged`, `QuestAdvanced`. Los consumidores no pueden modificar en secreto el estado sin comandos autorizados.

## 14. Vertical slice 0.1 — alcance y exclusiones

**Incluye:** movimiento y turnos, generación determinista de una región y una ruina de varios niveles, una población sencilla, tres enemigos, combate cuerpo a cuerpo y a distancia, tres mutaciones (BIO-02, PSI-01, TEC-02), inventario, equipo, una misión con rutas alternativas, reputación simple, guardado/carga y controles de teclado. Una interacción ambiental eléctrica verificable.

**No incluye todavía:** las 30 mutaciones jugables, una economía planetaria completa, simulación de todos los sectores inactivos, campaña completa, elaboración compleja, WebGPU o componentes C++.

## 15. Plan de pruebas verificables

- **Aritmética de combate:** propiedad del daño, límites de resistencia y críticos con RNG controlado.
- **Planificador:** orden estable y costes de acciones reproducibles; acciones gratuitas sin explotación.
- **IA:** sin conocimiento omnisciente, reacción a sonido y pérdida de visión.
- **Mutaciones:** costes, enfriamientos, bloqueo por recursos, efectos secundarios.
- **Procedural:** 1.000 semillas; conectividad y ausencia de ubicaciones inválidas.
- **Persistencia:** guardar/cargar/generar mismos hashes lógicos en pruebas deterministas.
- **E2E:** crear personaje, caminar, combatir, usar mutación, completar misión, guardar, salir y cargar.
- **Rendimiento:** medir turno p95 <16 ms, entrada visual p95 <50 ms y 60 FPS en hardware de referencia; son **objetivos por confirmar**, nunca resultados asumidos.
- **Usabilidad:** teclado completo, contraste, escalado, remapeo y latencia de botones.

## 16. Preguntas de diseño pendientes

1. Nivel de complejidad de supervivencia (ligera o exigente).
2. Dimensión social: ¿diálogos ramificados simples o simulación profunda de relaciones?
3. Frecuencia de anomalías cósmicas (ocasionales e inolvidables o presencia constante).
4. Peso relativo de combate frente a exploración.
5. Tamaño objetivo de la primera región y criterios de densidad de contenido.

**Siguiente documento:** Biblia del mundo v0.3 con mapa de las Salinas de Vértice, asentamiento inicial, criaturas, misión completa y secretos.
