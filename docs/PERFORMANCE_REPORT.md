# Informe de rendimiento

La prueba disponible mide construcción JavaScript y comportamiento bajo Chromium con SwiftShader. No mide tiempo de GPU física ni garantiza FPS en dispositivos concretos.

Estado: **PENDIENTE** para el gate de release.

Comprobado:

- Pool de sprites Pixi reutilizable.
- Caché de terreno y texturas.
- Redibujado ambiental limitado.
- Bundles obsoletos eliminados en builds reproducibles.
- Escenas WebGL y Canvas sin excepciones en Chromium.

Falta medir memoria, sesiones largas, GPU real, resize repetido, pérdida de contexto WebGL y hardware móvil.
