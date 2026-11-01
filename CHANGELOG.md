# Cambios

## ASCENSION — en desarrollo (sin release)

- Composiciones ASCII compartidas y cámara isométrica centrada.
- Siluetas ASCII compartidas para ciudadanos, recursos, botín y campos; atlas WebGL ampliado para evitar recortes.
- Cámara isométrica ampliada y centrada con la misma escala en Canvas y WebGL.
- Movimiento reducido actualizado durante la partida en ambos renderizadores.
- Siluetas transitorias del protagonista para movimiento, combate, daño, mutación, interacción y muerte.
- Siluetas de daño para seis enemigos, élites y Nácar en Canvas y WebGL.
- Marcas ASCII de muerte por enemigo, sin mostrar muertes falsas al cambiar de zona.
- QA real en Chromium del worker en espera, activación de una revisión nueva y recarga offline con guardado.
- Exportación manual de la copia de rescate en JSON desde el menú inicial y el panel de sistema.
- Pulsaciones rápidas independientes, foco contenido en modales y recuperación desde una copia de guardado válida si el archivo principal está dañado.
- Instalación reproducible mediante lockfile y npm ci; lanzadores incrementales.
- Caché versionada por build y scope, assets precargados, manifiesto y prueba offline en subruta.
- Comparación funcional con e0a9094 y validación experimental en CI sin desplegar estable.

Estado y límites: docs/ASCENSION-CONTINUIDAD.md. La versión permanece 2.9.0 hasta validar una RC completa.
