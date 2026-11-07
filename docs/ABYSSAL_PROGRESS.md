# ABYSSAL TERMINAL — Progreso

## Fase 0 · Auditoría reproducible

Estado: completada en la rama experimental.

Base auditada: `5019c91`.

Evidencia: 189/189 pruebas, lint, typecheck y build normal pasan. La referencia visual externa no estaba disponible y queda documentado como limitación.

## Fase 1 · Sistema visual cian CRT

Estado: implementada y revisada en esta rama.

Resultado: sustituida la mezcla actual por una paleta coherente de fondo negro, turquesa oscuro, cian, cian iluminado y resalte pálido. La capa CRT conserva scanlines, viñeta y movimiento reducido sin tocar el núcleo.

Se añadieron controles independientes y persistentes para scanlines, brillo, ruido, viñeta, resplandor y modo accesible. El modo accesible desactiva animaciones/transiciones y respeta movimiento reducido.

## Fases siguientes

2. Tramas densas y volumétricas del terreno — implementada; 190 pruebas pasan.
3. Siluetas y coreografía completa de criaturas — primera entrega implementada; 191 pruebas pasan. Falta QA visual de duración en navegador y revisión humana.
4. HUD y menús ABYSSAL TERMINAL — implementados; los paneles de personaje, inventario, mutaciones, atlas/mapa, diario, fabricación y sistema están disponibles desde la interfaz normal.
5. Paridad, rendimiento, offline y accesibilidad — QA automatizado de Canvas/Pixi, escritorio/móvil y offline pasa; queda revisión con lector de pantalla y perfilado prolongado en hardware real.
6. Recorrido real de campaña y QA de release — pendiente de una sesión humana desde partida nueva sin fixtures.

La rama está publicada como candidata experimental. No se fusiona en `main` mientras falten la campaña humana completa, la revisión con lector de pantalla y las sesiones largas en hardware objetivo.

