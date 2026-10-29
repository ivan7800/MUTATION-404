# QA v0.7 — Civilizaciones de Nácar

- TypeScript estricto: verificado mediante `tsc -p tsconfig.play.json --noEmit`.
- `npm run test:core`: 74 pruebas, incluye pruebas sobre 1.000 semillas heredadas, diálogos, combate, mutaciones, 8 interiores, NPC diurnos/nocturnos, encargos y migración de v0.6.
- `npm run build:offline`: emitido `play/` con servidor local sin dependencias npm en ejecución.
- Guardado: esquema v8, migración v2..v7. Persistencia de mapas de interiores por zona.
- Pendientes: prueba de navegador manual completa, revisión de ergonomía en Linux/Windows, binarios nativos, PixiJS.
