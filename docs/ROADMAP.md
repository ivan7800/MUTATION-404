# MUTATION 404 — Hoja de ruta

| Hito | Estado real |
|---|---|
| H0 | Base TypeScript, pruebas y servidor portátil implementados |
| W1 / v0.1 | Faro Ciego, movimiento, niebla, NPC, primera misión y guardado |
| W2 / v0.2 | Combate, equipo, seis criaturas acumuladas, IA, experiencia y botín |
| W3 / v0.3 | Seis biomas regionales, clima, exposición, escáner y atmósfera |
| **W4 / v0.4** | **Nueve mutaciones jugables, puntos genéticos, poderes activos/pasivos, campos ambientales y habilidades enemigas. 56 tests; QA visual pendiente.** |
| **W5 / v0.5** | **Pendiente:** mundo regional extensible, transiciones entre sectores, subsuelo multicapa, varios asentamientos, comercio, reputación y sucesos persistentes |
| W6 / v0.6 | Pendiente: mejoras narrativas, facciones complejas, equipo/crafting, balance e IA |
| W7 / v0.7 | Pendiente: efectos audiovisuales, optimización de renderizado, pruebas E2E, PixiJS solo si justificado |
| 1.0 | Pendiente: campaña completa, contenido validado, empaquetado de escritorio y publicación |

## Orden obligatorio para W5

1. Diseñar formato de coordenadas globales `(región, sectorX, sectorY, nivelZ, x, y)` y transiciones sin perder entidades.
2. Congelar guardado v5 y crear migración reversible hacia el siguiente esquema; guardar cambios del mundo, no solo semillas.
3. Construir dos sectores nuevos procedurales con biomas distintivos y una transición segura hacia/desde Faro Ciego.
4. Implementar Estación CERO-7 con tres niveles conectados y retorno viable.
5. Añadir segundo asentamiento, un comerciante funcional y relaciones con al menos dos facciones.
6. Añadir sucesos emergentes deterministas que dejen huella persistente.
7. Probar 1.000 semillas, entradas/salidas entre sectores, guardado en varios niveles y rendimiento en navegador.

No ampliar todos los sistemas a la vez: completar una vertical slice de mundo multi-sector antes de añadir más localizaciones.
