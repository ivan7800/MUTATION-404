# QA MUTATION 404 v0.8

- TypeScript `tsc -p tsconfig.play.json --noEmit`: verificado.
- `npm run test:core`: 82/82 pruebas superadas (incluye 8 específicas de v0.8).
- `npm run build:offline`: compila el cliente portable en `play/`.
- HTTP: el servidor devuelve 200 para index y módulos (en el entorno había servidores previos usando puertos consecutivos).
- Chromium headless: ejecución no completada, no es una prueba visual aprobada.
- Guardados nuevos versión 9; migración desde versión 8 y anteriores cubierta por pruebas.
- No se ha publicado en GitHub.
- Deuda técnica: presión ecológica simplificada; sin IA alimentaria ni migración real cruzando mapas; UI aún Canvas2D; falta QA manual en escritorio.
