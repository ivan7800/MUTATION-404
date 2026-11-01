# Laboratorio de regresión visual

## Escenas de referencia

`qa-browser.mjs` captura menú, Faro Ciego, Ojo del Silencio, regiones, las tres fases de Nácar y el final de campaña en WebGL; también ejecuta Canvas fallback y resoluciones móvil/tableta.

Estado: **VERIFICADO** como presencia funcional y ausencia de excepciones.

No se declara comparación píxel a píxel histórica: no existe un conjunto de capturas base versionado con el mismo navegador, DPR y build. Las diferencias artísticas intencionadas se inspeccionan manualmente cuando se genera una captura nueva.

Pendiente: versionar capturas de referencia aprobadas, generar diff perceptual y añadir una matriz de cambios aceptados por escena.
