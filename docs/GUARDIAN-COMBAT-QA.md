# Custodios regionales: combate y comprobaciones

## Cambios de esta entrega

Los ocho custodios regionales conservan sus familias de enemigo y ahora usan un patrón telegráfico propio. El patrón se deriva del identificador de enemigo ya guardado, por lo que no añade campos ni requiere migrar partidas.

| Custodio | Patrón | Recompensa adicional |
|---|---|---|
| El Repetidor | Nube en la posición actual | 3 municiones |
| La Maestra de Escoria | Barrido lineal de fuego | 1 botiquín |
| El Astrónomo Ciego | Cruz eléctrica con salida abierta | 6 de concentración |
| El Capataz de Hierro | Descarga por corredor | 15 créditos |
| La Notaria Cero | Sello eléctrico con ruta de fuga | 8 de salud |
| El Jardinero de Médula | Brote de esporas a ambos lados | Reduce 12 de exposición |
| Tu Reflejo Tardío | Nube que anticipa el desplazamiento | 1 punto genético |
| El Coro Hueco | Anillo diagonal de fuego | 1 condensador |

Las cámaras aumentan la vida de estos ocho enemigos para que haya tiempo de percibir al menos una acción propia. La descarga a distancia del Capataz se ha moderado: 45 % de acierto y 1–4 de daño, frente al disparo estándar de 60 % y 2–6.

## Evidencia automatizada

Verificaciones ejecutadas en esta entrega:

- `npm run typecheck`: correcto.
- `npm run build:offline`: correcto; Vite genera aviso por un bloque de 901,64 kB (259,80 kB comprimido).
- `npm test`: 212 pruebas correctas, 0 fallidas.
- `npm run lint`: correcto.
- `node scripts/guardian-balance-audit.mjs`: 96/96 encuentros simulados ganados, 0 muertes; las ocho habilidades aparecen en sus encuentros y los guardados se vuelven a cargar correctamente.

La auditoría de combate usa semillas fijas y una política de prueba que esquiva avisos, se cura por debajo de 21 PV y dispara a distancia. Es una línea base repetible, no una medida de dificultad humana ni una partida completa de campaña.

## Pendiente de validar fuera del motor

- La prueba interactiva del navegador no pudo conectar con el servidor local en este entorno; no se certifica el flujo completo de menús ni la representación visual.
- No se dispone de teléfono o tableta física para medir FPS, memoria, temperatura, controles táctiles ni legibilidad a tamaño real.
- Las pruebas automáticas confirman los controles de audio y sus ajustes, pero no sustituyen escuchar la mezcla en altavoces y auriculares reales.
- El aviso del bloque de 901,64 kB requiere perfilar una carga real y valorar división/diferimiento de Pixi antes de afirmar que el rendimiento móvil es adecuado.
