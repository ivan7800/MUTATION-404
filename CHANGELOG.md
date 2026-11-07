# Cambios

## ABYSSAL TERMINAL 4.0 — rama experimental

- Paleta monocromática cian/turquesa y presentación CRT unificada para menús, HUD, diálogos, paneles y mapa.

## ASCENSION — santuario gótico (sin release)

- Dirección de interfaz con piedra violeta, bronce, vino, luz de vidriera y títulos serif locales. Menú de arco apuntado y paneles coherentes; sin fuentes, imágenes o CDN externos.
- Foco de teclado de tres píxeles, controles de al menos 44 px, cierre de diálogo amplio y ajustes móviles/movimiento reducido/colores forzados.
- Puertas, terminales y santuarios ASCII con arcos. Atlas WebGL ampliado a 80×80 para no recortar composiciones de cuatro filas; escala visual conservada.
- QA Chromium comprueba límites reales de texto en el atlas además de las doce escenas de ataque.

## ASCENSION — QA de ataques por backend

- Doce escenas Chromium verifican las poses de seis especies desde la interfaz normal en Canvas y WebGL; el informe pasa de 13 a 25 resultados.
- Matriz de 576 combinaciones de combate (especie, semilla, distancia, aturdimiento, visibilidad) compara respuesta y partida con y sin captura de eventos.
- Suite actual: 187 pruebas aprobadas. Los fixtures no acreditan una campaña completa ni sustituyen una revisión humana del arte.

## ASCENSION — acciones enemigas visibles (sin release)

- Eventos transitorios de ataques cuerpo a cuerpo, disparos y habilidades, capturados donde el motor los resuelve. No se incorporan al estado ni al esquema de guardado.
- Poses de ataque ASCII propias de las seis especies, élites y Nácar, compartidas por Canvas/WebGL. Las heridas tienen prioridad; movimiento reducido suprime la pose transitoria.
- Captura filtrada por visibilidad y zona, con expiración. Pruebas de equivalencia de resultados/RNG/guardados, acciones inválidas, aturdimiento y habilidades especiales.
- Preparación anticipada por especie, coreografía completa y recorrido real de campaña siguen pendientes.

## ASCENSION — profundidad y cobertura combinatoria (2026-11-06)

- Canvas encola glifos con su estilo y los pinta por profundidad; Pixi comparte el criterio basado en pies y dimensiones de celda. La altura visual no altera la prioridad de profundidad.
- Regresión de pared delante/detrás del héroe y orden en distintas escalas.
- Cobertura exhaustiva de dominios finitos: 262144 combinaciones de hitos de acceso al final, 16497 combinaciones celda/zoom y 648 combinaciones de materiales/paletas. No equivale a probar todas las partidas ni todos los recorridos de campaña.

## ASCENSION — coherencia de presentación (2026-11-06)

- Paleta del terreno compartida por Canvas y WebGL, diferenciando superficie e interiores.
- Canvas eleva los glifos del terreno con la altura compartida y restaura opacidad completa tras dibujar sombras de NPC/enemigos.
- Barra de Nácar en Canvas calculada con su vida máxima real; campos WebGL elevados según el terreno, no según el nombre del efecto.
- Regresión de dibujo Canvas y pruebas de paleta. Oclusión completa y equivalencia de iluminación siguen pendientes.

## ASCENSION — consolidación ASCII (2026-11-06, sin release)

- Eliminados atlas píxel y ramas inaccesibles del backend Pixi; el perfil cuenta texturas del atlas ASCII activo.
- Guardas del atlas histórico migradas a pruebas del catálogo compartido de actores, terreno y jefe.
- Composiciones volumétricas para puertas, señales y símbolos x/v; altura visual de terreno compartida por Canvas y Pixi.
- Oclusión completa, FX exclusivamente ASCII y ataques por especie continúan pendientes; esta entrega no completa todas las fases.

## ASCENSION — recuperación de persistencia (sin release)

- Guardados con más de 50 hitos/eventos vuelven a cargar sin descartar progreso; límite defensivo de 4096 entradas y validación de contenido conservada.
- Migraciones v2–v10 mantienen la bitácora acotada. La serialización conserva los últimos 70 mensajes sin mutar la partida; se recuperan bitácoras antiguas desbordadas de hasta 1000 entradas válidas.
- Doce regresiones de persistencia: reliquia sin doble recompensa, migraciones, recuperación y rechazo de contenido inválido. Esquema 11 conservado.

## ASCENSION 3.0 — Fase 1, auditoría (2026-11-05; sin release)

- Auditoría P0–P3 y reproducción de dos fallos P1 de carga: límite de eventos y bitácora tras migración.
- Arquitectura, roadmap, instrucciones de asistentes y estado persistente contrastados con código y validaciones actuales.
- Evidencia renovada: 158 pruebas, builds, conservación, contratos de campaña, Chromium y offline. Sin cambios de jugabilidad o arte; fases posteriores no iniciadas.

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
- Terreno ASCII volumétrico compartido para suelos, rocas, agua, vegetación y contaminación.
- Variantes deterministas de desgaste y altura visual por coordenada y semilla.
- Orden de profundidad diagonal en Canvas para alinear la oclusión con WebGL.
- Sombras proyectadas para héroe, enemigos y ciudadanos en ambos renderizadores.
- Bordes frontales de oclusión para estructuras sólidas en Canvas y WebGL.
- Pulsaciones rápidas independientes, foco contenido en modales y recuperación desde una copia de guardado válida si el archivo principal está dañado.
- Instalación reproducible mediante lockfile y npm ci; lanzadores incrementales.
- Caché versionada por build y scope, assets precargados, manifiesto y prueba offline en subruta.
- Comparación funcional con e0a9094 y validación experimental en CI sin desplegar estable.

Estado y límites: docs/ASCENSION-CONTINUIDAD.md. La versión permanece 2.9.0 hasta validar una RC completa.
