# MUTATION-404 — Auditoría de producción v2.9
**Fecha:** 30 de octubre de 2026  
**Repositorio:** https://github.com/ivan7800/MUTATION-404  
**Objetivo:** fiabilidad, estabilidad y experiencia real, sin atribuir resultados no medidos.

## Alcance y evidencia
Se han revisado las rutas de partida guardada, combate final, avisos ambientales, interfaz y pruebas automatizadas existentes. El pipeline ejecuta TypeScript, pruebas del motor, simulación determinista de balance, compilación estática, Chromium con WebGL y fallback Canvas y despliegue de Pages. La ampliación de esta iteración incorpora pruebas de interfaz a 390 × 844 y 768 × 1024, control táctil, teclado, modales y ausencia de desbordamiento horizontal.

La auditoría está basada en código y automatización verificable. **No equivale a un playthrough humano completo** ni acredita satisfacción, jugabilidad o una puntuación de 9,5/10.

## Matriz de hallazgos
| ID | Severidad | Hallazgo | Acción / evidencia |
|---|---|---|---|
| P0-01 | Alta | Antes, la previsualización del área de Nácar se calculaba sobre la posición actual del jugador y el ataque la recalculaba tras el movimiento: el indicador podía ser engañoso. | **Corregido.** Las coordenadas se fijan el turno anterior en eventos temporales persistidos; se consumen al impacto. Las partidas antiguas no reciben un ataque no anunciado. Se añade prueba de movimiento y guardado/carga. |
| P1-02 | Media | Faltaba cobertura automatizada del mando táctil y desbordamiento en smartphone/tablet. | **Prueba incorporada:** Chromium a 390 y 768 px, interacción de movimiento, ayuda, capturas y consola sin errores. |
| P1-03 | Media | La simulación de balance abarca 24 semillas × 4 escenarios, pero no la campaña completa ni las tres elecciones recorridas por un agente. | **Pendiente** una batería adversarial que recorra progresión, economía, obtención de archivos, jefe y finales con recursos reales. |
| P1-04 | Media | La frecuencia de fotogramas medida con requestAnimationFrame no equivale a medir tiempo GPU ni estabilidad en una máquina real. | **Pendiente** perf en móvil físico, PC de gama baja y sesiones prolongadas; no proclamar 60 FPS garantizados. |
| P2-05 | Media-baja | La presentación de la arena y finales automatizada confirma que renderiza sin errores, no su calidad artística o lectura humana. | **Pendiente** análisis visual manual de capturas y sesiones de usuarios. |
| P2-06 | Media-baja | Guardado y reanudación cuentan con regresiones, pero no se ha ensayado recuperación de un cierre de navegador durante todos los actos. | **Pendiente** prueba de resistencia de múltiples cargas y migraciones entre versiones. |

## Criterios de salida para release 9,5/10
1. Cero errores P0, cero P1 funcionales sin resolver.
2. Cumplimiento de TypeScript, tests, compilación, Chromium y Pages con el commit exacto.
3. Comprobar todos los finales tras una partida completa con progresión y equipo plausibles, sin manipular el estado de la prueba.
4. Medir input-to-photon, latencia de controles, percentiles de frame time y uso de memoria en equipos reales.
5. Revisión humana de pantalla completa, smartphone, controles, dirección artística, tutorial y combate.

## Dictamen
Esta iteración **corrige el defecto del aviso anticipado y mejora la cobertura responsive**, pero el objetivo de 9,5/10 **no está demostrado**. El cierre de esta auditoría exige comprobar el resultado final del nuevo pipeline en GitHub Actions.
