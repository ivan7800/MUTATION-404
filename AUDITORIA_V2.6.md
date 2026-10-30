# MUTATION 404 v2.6 — Auditoría de equilibrio y supervivencia

**Fecha:** 30 de octubre de 2026. **Estado:** actualización de código del motor, telemetría automatizada y regresiones añadidas.

## Metodología

La auditoría utiliza `scripts/balance-audit.mjs`: 24 semillas deterministas, seis enfrentamientos consecutivos por escenario, y espera de 80 turnos en Faro Ciego. Se usan órdenes reales del motor (`attack`, `fire`, `move`, `pickup`, `heal`, `wait`) y se comprueba que el estado resultante conserva valores al guardar y recuperar. Las arenas son controladas, sin obstáculos, para aislar el combate y la economía de recursos; **no representan la aventura completa**.

Los valores detallados se recogen en `qa-evidence/balance-report.json`, artefacto **mutation-404-balance-audit** de cada GitHub Action. Se comprueba además la aplicación en Chromium con WebGL y respaldo Canvas 2D.

## Defecto de equilibrio reproducido

La telemetría de referencia previa a los ajustes de huida detectó que los carroñeros heridos podían avanzar en modo `fleeing` a la misma velocidad que un perseguidor sin ataques a distancia. En 24 simulaciones de combate cuerpo a cuerpo, el promedio de seis posibles enemigos abatidos fue **0,08**, con el escenario bloqueado en **24 de 24 semillas**. Esta es una medición de escenario artificial y no una tasa de abandono de jugadores reales.

En contraste, el escenario contra vigías usando armas de distancia y cambio a cuerpo a cuerpo alcanzó **6 de 6 enfrentamientos por simulación**, con **24/24 supervivientes**, una media de **20,2 PV** y consumo medio de **11,4 púas**. Este contraste motivó priorizar el problema de persecución antes de modificar estadísticas generales.

Referencia de la medición anterior al ajuste: [GitHub Actions, ejecución 41111227099](https://github.com/ivan7800/MUTATION-404/actions/runs/41111227099).

## Resultados posteriores a la corrección

Tras restringir la pausa de agotamiento a los carroñeros y mantener la retirada normal de los pastores de esporas, el escenario corregido produjo estos resultados sobre las mismas **24 semillas**:

| Simulación: seis encuentros | Enemigos derrotados (media) | Supervivientes | PV restantes (media) | Recursos restantes (media) | Bloqueos |
|---|---:|---:|---:|---|---:|
| Carroñeros, cuerpo a cuerpo | 6,00 | 24/24 | 31,6 | 4,4 ampollas | 0 |
| Vigías, distancia y cuerpo a cuerpo | 6,00 | 24/24 | 20,2 | 0,6 púas; 1,0 ampollas | 0 |
| Drones, distancia y cuerpo a cuerpo | 5,75 | 20/24 | 15,8 | 0,8 púas; 0,8 ampollas | 0 |
| Faro Ciego, 80 turnos de refugio | No aplica | 24/24 | 32 | 0 % de exposición | No aplica |

Las medias de PV incluyen los resultados de supervivencia y la progresión de nivel que tenga lugar durante la simulación; **no son barras de vida iniciales ni una tasa de éxito de jugadores reales**. En el escenario de carroñeros las 24 semillas completan los seis encuentros frente a un promedio anterior de 0,08; es una mejora reproducible del problema de persecución. Los drones muestran una dificultad superior sin que la prueba suponga un bloqueo inevitable.

Referencia de la ejecución de referencia posajuste: [GitHub Actions 41112771119](https://github.com/ivan7800/MUTATION-404/actions/runs/41112771119). La versión final incluye guardarraíles flexibles que detectan retornos de la huida imposible o caídas excesivas de supervivencia en estas arenas.

## Cambios de v2.6

1. **Huida con agotamiento.** Los carroñeros heridos con comportamiento `fleeing` descansan cada segundo turno (los pastores de esporas conservan su conducta anterior); el jugador puede alcanzarlos cuerpo a cuerpo. La pausa depende del turno simulado, sin temporizadores reales ni modificación del esquema de guardado.
2. **Recuperación de munición coherente.** Los drones mecánicos, igual que los vigías, pueden ofrecer proyectiles en un 35 % de botín adicional; para drones son dos púas y para vigías tres. Los enemigos biológicos conservan sus posibles ampollas. No se ha aumentado la probabilidad general de botín.
3. **Indicador de recursos.** PV, ampollas, munición y concentración están visibles constantemente; la interfaz distingue salud baja y crítica.
4. **Telemetría reproducible ampliada.** Se miden encuentros con carroñeros, vigías y drones, además de la recuperación del refugio, incluyendo supervivencia, vida, botín recuperado, munición y ampollas restantes, y acciones no aceptadas.
5. **Regresiones nuevas.** Pruebas para ritmo de huida, señales del HUD, pruebas de navegador y compatibilidad de guardados.

## Riesgos y límites

- El benchmark mide una estrategia concreta en arenas vacías; no estima dificultad de mundo abierto, rutas de misión, uso de mutaciones, navegación compleja ni el equilibrio de una partida humana.
- La recuperación de botín depende de llegar al cadáver, y la estrategia de prueba no incluye todas las compras ni recetas.
- Sin pruebas físicas de GPU, no deben extrapolarse los intervalos `requestAnimationFrame` de Chromium a hardware real.
- No se atribuye al juego un 9,5/10: falta aún auditoría de arte, ritmo, interfaz accesible y recorrido completo de campaña.

## Comprobación y reproducción

Ejecuta, en una copia del repositorio:

```bash
npm install
npm run typecheck
npm run test:core
node scripts/balance-audit.mjs
npm run build:offline
```

El informe reproducible queda en `qa-evidence/balance-report.json`. En GitHub Actions se ejecuta también Chromium antes de publicar GitHub Pages. Las cifras posajuste aparecen arriba, y los valores de cada semilla quedan disponibles en el artefacto JSON de Actions.
