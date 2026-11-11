# ABYSSAL TERMINAL — QA

## Línea base

| Comprobación | Resultado |
|---|---|
| Suite Node | 193/193 |
| ESLint | Pasa |
| TypeScript | Pasa |
| Build web | Pasa |
| Servidor offline | Pasa |
| Imagen Cyclopean disponible | No |
| Campaña humana completa | Pendiente; los runners actuales usan fixtures explícitos |
| Lector de pantalla | Pendiente de sesión manual |
| Sesión larga en hardware real | Pendiente |

Tras la Fase 2, la suite pasó con 190/190 pruebas. Tras la primera entrega de Fase 3, pasó con 191/191. La entrega ABYSSAL CRT pasó con 192/192. El rescate artístico pasa con 193/193 e incorpora una regresión de densidad para la vertical slice.

La QA Chromium actual pasa 25 comprobaciones sobre Canvas/Pixi, atlas, ataques, escritorio y móvil. La QA offline pasa con recarga sin red, guardado persistente, WebGL y actualización pendiente. Las capturas quedan en `qa-evidence/`.

## Regla de las siguientes entregas

Cada fase debe indicar fuentes modificadas, pruebas ejecutadas, capturas reales cuando proceda y limitaciones. Los fixtures de campaña y las matrices combinatorias no se presentarán como una partida humana completa.

