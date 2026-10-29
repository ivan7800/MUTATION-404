# MUTATION 404 v1.1 — Renacimiento visual

## Alcance implementado
- Refuerzo de lectura del mapa: glifos más contrastados, material granular por semilla, halo del objetivo, retícula sutil del jugador.
- Presentación de interfaz: paneles, atmósfera del bioma, barras y feedback de botones.
- `prefers-reduced-motion` suprime partículas meteorológicas cosméticas.
- GitHub Actions: comprobación de tipos, regresión, compilación portable, verificación de rutas y despliegue a Pages **solo** para `main` tras pasar CI.
- Se mantiene el formato de guardado de v1.0: clave `mutation404.v10.save` para continuidad de partidas.

## Limitaciones honestas
- Renderizado todavía Canvas 2D, **no** PixiJS/WebGL.
- No se incluyen ejecutables nativos ni material de terceros.
- El workflow usa `npm install` porque la entrega no contiene `package-lock.json`; es recomendable generar y fijar uno en un entorno con acceso a npm antes de usar `npm ci`. Configura GitHub Pages con **Source: GitHub Actions**.
- Validación visual real en el equipo del usuario y navegador pendiente.
