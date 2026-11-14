# Evidencias de WorldCave

- capturas/menu.png muestra el menú de inicio.
- capturas/cueva-fuego.png muestra el combate en la primera cueva. Para capturar esa escena se colocó al héroe cerca del guardián.
- mediciones.txt registra costo, pasos, nodos visitados y tiempo medio de 300 búsquedas por algoritmo en cada cueva.
- salidas-astar.txt registra las coordenadas de las rutas encontradas por A* y Dijkstra en Fuego, Agua, Tierra y Viento.

Para repetir las mediciones desde la raíz del proyecto, ejecuta:

    node tests/mediciones-astar.cjs

Los tiempos se midieron en Windows con Node.js. Pueden variar entre ejecuciones.
