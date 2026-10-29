# MUTATION 404 v0.9 — Resultados de QA

- `npm run test:core`: **86/86** pruebas correctas (82 heredadas + 4 nuevas).
- `npm run build:offline`: compilación TypeScript y cliente portable correctos.
- Las nuevas pruebas cubren la generación determinista de 8 ruinas, acceso por caminos, tránsito de 2 estratos, persistencia de cambios, serialización y migración desde formato de guardado 9 (v0.8).
- Animación de brillo en `@`, marco visual y contraste mejorado implementados; revisión visual manual **pendiente**.
- La ecología incluye un primer desplazamiento de carroñeros por grupos de máquinas en zonas cargadas: no equivale a una simulación de cadena alimentaria completa.
- Compatibilidad con partidas anteriores mediante `deserialize` y guardados versionados.
- PixiJS y Electron todavía no integrados: cliente portable en Canvas 2D, servidores Node.js en Linux y Windows.
- No se ha publicado en GitHub ni compilado ejecutables nativos.
