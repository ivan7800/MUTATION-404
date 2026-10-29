# Arquitectura técnica — MUTATION 404 v0.3

## Separación de capas

- **Motor** (`packages/core/src`): TypeScript puro, sin DOM, Canvas, Electron o PixiJS.
- **Presentación** (`apps/web/src`): interfaz HTML/CSS, renderizador Canvas 2D y traducción de eventos de teclado/botones a comandos del motor.
- **Entrega portable** (`play/`): módulos JavaScript ES2022 compilados, HTML/CSS sin dependencias de runtime externas.
- **Servidor local** (`scripts/server.mjs`): servidor HTTP de loopback que sirve `play/` sin paquetes npm.

## Archivos y responsabilidades

| Archivo | Responsabilidad |
|---|---|
| `biomes.ts` | Identidad regional, seis biomas, clima determinista, peligros y ecos narrativos |
| `world.ts` | Generación de mapa 96×64 y características fijas por semilla; límites y colisión de terreno |
| `fov.ts` | Línea de visión, campo visible y memoria de celdas |
| `rng.ts` | Aleatoriedad determinista y estado explícito de RNG |
| `combat.ts` | Catálogo de armas/armaduras/enemigos, pilas de inventario, spawn, búsqueda de caminos local, IA de combate |
| `game.ts` | Estado de partida, acciones, reglas de ataque, progresión, botín, misiones, persistencia y migración |
| `audio.ts` | Sonido ambiental opcional generado con Web Audio API, activado por usuario |
| `renderer.ts` | Glifos, colores, amenazas, botín, minimapa, cámara, zoom, memoria visual |
| `main.ts` | HUD, diálogos, menú de inventario, acciones de teclado y botones, almacenamiento navegador |

## Estado serializado

- **Esquema v4**, incorporado en v0.3: mantiene `stats`, `equipment`, `inventory`, `enemies`, `ground`, `targetId`, `kills` y añade `exposure`, `biomeNotes`, `lastBiome`, `lastWeather`, `environmentalTurns`.
- **Migración desde v2** (v0.1): mantiene mapa, misión, niebla de guerra, posición, reloj y RNG; inicializa enemigos/estadísticas/inventario.
- **Migración desde v3** (v0.2): conserva mapa, misión, combate, enemigo, botín, equipo, inventario, experiencia y posición; inicializa campos ambientales de v4.
- En el navegador, v0.3 escribe en `mutation404.v03.save` y busca `mutation404.v02.save` o `mutation404.v01.save` como claves heredadas. Las claves antiguas no se sobrescriben ni borran.
- `visible` y `dialogue` no se serializan; la visibilidad se recompone al cargar para evitar inconsistencias y el diálogo es interfaz transitoria.
- El motor valida tipos y límites del esquema antes de aceptar un guardado.

## Semántica de turnos

- Cada movimiento, ataque, disparo, uso de cura, sondeo, equipamiento y recogida de botín consume 100 unidades temporales. Examinar, apuntar, elegir en ciertos diálogos y alternar arma son gratis.
- Se avanza la IA solo después de acciones con coste. Las criaturas actúan con información limitada por detección/visión, recuerdan una última posición y pueden investigar o huir.
- Faro Ciego es una zona segura: se prohíbe el spawn enemigo en su recinto y la IA no realiza ataques mientras el jugador esté dentro.
- Todas las tiradas se realizan mediante `SeededRng` con estado persistente. No se utiliza `Math.random` para simulación.
- Los ataques de distancia requieren línea de visión, munición y alcance; los ataques cuerpo a cuerpo requieren adyacencia.
- IA y BFS local están acotados para evitar búsqueda ilimitada por criatura. El rendimiento aún requiere medición real.

## Limitaciones conocidas

El motor actual es una **vertical slice**, no un ECS completo ni una simulación masiva: el mapa es un único plano, con clima regional simplificado pero sin fluidos simulados ni fabricación. La infraestructura está pensada para evolucionar, pero no se deben prometer sistemas futuros como implementados. El renderizador **es Canvas 2D** y no PixiJS/WebGL2. El cliente portable requiere un servidor HTTP local; no es un ejecutable nativo.
