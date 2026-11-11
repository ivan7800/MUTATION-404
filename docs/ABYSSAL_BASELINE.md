# ABYSSAL TERMINAL — Línea base

Fecha de auditoría: 2026-11-07  
Rama experimental: `codex/mutation-404-abyssal-terminal`  
Base: `5019c91` (`main`)

## Alcance comprobado

- 189 pruebas automáticas pasan, sin fallos, cancelaciones ni omisiones.
- `npm run lint` pasa.
- `npm run typecheck` pasa.
- `npm run build` pasa.
- `npm test` pasa con el servidor local habilitado.
- Canvas 2D y Pixi/WebGL comparten el catálogo de composiciones ASCII.
- El paquete offline existente se mantiene versionado en `play/`.
- Las rutas superficiales mantienen un corredor protegido frente a la aparición y movimiento normal de enemigos.

## Estado visual observado

La versión base ya ofrece una interfaz gótica monocroma, CRT, modo ASCII único, profundidad isométrica, oclusión frontal, telemetría de combate y animaciones reducidas. La nueva dirección ABYSSAL TERMINAL debe concentrar la paleta en cian/turquesa sobre negro, aumentar la densidad determinista del terreno y aplicar el mismo tema a todos los paneles.

La imagen de referencia Cyclopean mencionada en el prompt maestro no está disponible en el entorno. Esta auditoría usa únicamente la especificación textual y no afirma una comparación visual directa.

## Riesgos abiertos

- La campaña tiene contratos y finales probados con fixtures; el recorrido humano completo desde una partida nueva sigue pendiente.
- La oclusión de estructuras está mejorada, pero sombras, barras y efectos todavía no forman una única cola volumétrica compartida.
- El CRT actual tiene animaciones y movimiento reducido, pero aún no expone controles independientes para scanlines, brillo, ruido y viñeta.
- La validación visual humana con hardware y lector de pantalla no está certificada.

