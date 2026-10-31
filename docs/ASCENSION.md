# ASCENSION — conservación y producción

Base original: `e0a9094`. Inicio de esta orden: `4eb9180`. Rama: `codex/mutation-404-premium`; PR solicitada: #4. No se autoriza integrar main sin validación y autorización posterior.

## Matriz de conservación

| Sistema | Estado frente a la base | Evidencia funcional existente |
| --- | --- | --- |
| Exploración y visibilidad | Conservado | core, biomes: generación, conectividad, colisiones, niebla |
| Biomas y regiones | 6 biomas, 9 sectores conservados | biomes, frontier: rutas y retorno persistente |
| Enemigos y combate | 6 especies, botín, munición conservados | combat, experience-audit |
| IA | Persecución, huida, preparación de ataques conservadas | conscious-depths, combat |
| Mutaciones | 9 conservadas | mutations, resonance: costes, recuperación, sinergias |
| Ecología | Recursos y presión conservados | ecology |
| Economía y comercio | Precios, reputación, asentamientos conservados | civilizations, economy-progression-v27 |
| Fabricación e inventario | 3 recetas, equipamiento y consumibles conservados | ecology, combat |
| Progresión | XP, niveles, genes conservados | economy-progression-v27, mutations |
| Ruinas | 8 ruinas, estratos y CERO-7 conservados | relics, elite-chambers, deepworld |
| Campaña y jefes | 5 actos, archivos, fases y 3 finales conservados | campaign-v28, QA navegador |
| Guardados | Esquema 11 conservado; campos efímeros excluidos | core, biomes, frontier, campaign-v28 |
| Controles e interacciones | Acciones conservadas; Z retirado por dirección artística | QA navegador: movimiento, diálogos, menú, guardar/continuar |
| Sonido | Audio procedural opcional y volumen conservados | QA navegador verifica activación y volumen; audición humana pendiente |

Los conteos y tests que buscan texto en archivos no demuestran por sí solos conservación funcional. Los casos de simulación y navegación proporcionan evidencia adicional; falta una campaña humana completa. Los cambios anteriores del núcleo son limpieza de imports y serialización equivalente, sin cambios de reglas.

## Revisión de commits previos

- da020b4: unifica modo ASCII, corrige rutas Vite y npm test; conserva ramas de atlas píxel inactivas. No implementa composiciones complejas.
- 770c615: limpia bundles generados sin eliminar contenido fuente.
- eccb9c4: añade comprobaciones de catálogo; son guardas, no equivalencia exhaustiva.
- 4eb9180: transforma el plano completo; también aplasta letras. El worker cache-first de versión fija puede retener HTML antiguo y borra cachés ajenas. Requiere corrección antes de RC.

## Validación y límites

Se exige typecheck, lint, suites completas, build normal y offline, rutas Pages, QA WebGL/Canvas, instalación y recarga offline en subruta. Las capturas deben inspeccionarse, no sólo generarse. FPS con SwiftShader no certifican rendimiento físico. Windows, altavoces, sesión humana prolongada y revisión externa siguen sin validar.

No hay licencia de proyecto declarada: no se debe inventar. PixiJS y dependencias conservan sus licencias; queda por confirmar la licencia del contenido original con su titular.

## Arranque

Node.js 22+ y npm. Los lanzadores llaman a scripts/launch.mjs, instalan con npm ci sólo si faltan herramientas, recompilan si las fuentes son posteriores al build, y abren el navegador. Los errores dejan launch.log. `--prepare-only` prepara sin servidor y `--no-open` evita abrir navegador. Sin instalaciones globales ni administrador.
