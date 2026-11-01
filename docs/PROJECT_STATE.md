# Estado persistente de MUTATION-404 ASCENSION

Actualizado: 2026-11-01. Rama publicada: `codex/mutation-404-premium`. `main` y esta rama apuntan al mismo commit validado de la entrega actual.

## Puertas de calidad

| Puerta | Estado | Evidencia o bloqueo |
|---|---|---|
| GATE 1 · arquitectura | VERIFICADO | Núcleo puro, Canvas/WebGL compartidos, matriz de conservación |
| GATE 2 · núcleo jugable | VERIFICADO | 158 tests, controles y guardados en Chromium |
| GATE 3 · mecánicas y progresión | PENDIENTE | Falta ruta humana completa de campaña |
| GATE 4 · experiencia visual | PENDIENTE | ASCII volumétrico en progreso; faltan ataques y oclusión por altura |
| GATE 5 · regresión y rendimiento | PENDIENTE | QA software verificada; GPU física, memoria y sesión larga no comprobadas |
| GATE 6 · distribución | BLOQUEADO | API y Pages devuelven 403 desde el proxy del entorno |

## Próximo objetivo

Completar ataques visuales específicos por especie y una ruta automatizada de campaña que no salte progresión. Después se hará la auditoría de accesibilidad y rendimiento.
