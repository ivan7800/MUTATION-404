# Cobertura combinatoria ASCENSION

Ejecutar desde raíz, tras compilar: `node --test tests/combinatorial.test.mjs`.

| Dominio | Producto cartesiano | Casos | Propiedad comprobada |
|---|---|---|---|
| Hitos de campaña | 2^18 | 262144 | El acceso al final requiere 8 reliquias, 8 archivos, prólogo y corazón |
| Profundidad del visor | 47 × 27 × 13 | 16497 | Vecinos y capas de una celda conservan el orden proyectado en cada zoom |
| Materiales | 18 × 3 × 2 × 6 | 648 | ASCII imprimible, paleta válida, composición y alturas válidas |
| Observación de combate | 6 × 8 × 3 × 2 × 2 | 576 | Misma respuesta y partida con/sin eventos; sin eventos de enemigos ocultos o aturdidos |

Son **279865 combinaciones** en dominios finitos explícitos. Los casos de materiales comprueban además tres muestras de altura. La matriz de combate, en tests/enemy-feedback.test.mjs, cruza seis especies, ocho semillas, distancias 1/2/5, aturdimiento 0/2 y visibilidad booleana; usa fixtures explícitos y comandos wait reales. La suite prueba funciones reales; el test de profundidad Canvas ejecuta también el pintor con contexto instrumentado y verifica el orden de paredes antes/después del personaje.

Esta cobertura no incluye todas las semillas de 32 bits, secuencias arbitrarias de comandos, recorridos de campaña, decisiones temporales, plataformas ni interacciones de más factores. Tampoco certifica legibilidad humana o calidad artística. Los hitos se construyen como estados de entrada para comprobar la condición de acceso, sin presentarlos como partidas completas.

La QA de Chromium y offline se ejecuta por separado; combina backends y tamaños de pantalla documentados en su informe. No se declara cobertura por pares de todos los factores del videojuego: esa matriz aún debe definirse y verificarse, incluidas sus restricciones de alcanzabilidad.
