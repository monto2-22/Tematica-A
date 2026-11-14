# WorldCave — Los cuatro elementos

Abre index.html en el navegador. No necesitas conexión ni instalación.

- Juega solo o con otra persona por turnos en el mismo dispositivo.
- Muévete con WASD o las flechas. Pulsa E para interactuar y Espacio para atacar.
- Usa 1–5 para elegir arma, R para cambiar armadura, M para el mapa y P para pausar.
- Explora la superficie, abre el cofre y derrota a los cuatro guardianes. El último deja la llave para rescatar a la princesa.

## 5. Criterios de aceptación

Ejecuta `node criterios.test.cjs` desde la carpeta del juego. Las pruebas usan el mismo JavaScript que ejecuta el navegador.

| ID | Criterio | Verificable mediante |
|---|---|---|
| CA-01 | Derrotar a un enemigo menor suma puntos | test_derrotar_enemigo_suma_puntos |
| CA-02 | Derrotar al guardián elemental desbloquea el descenso | test_derrotar_jefe_siguiente_nivel |
| CA-03 | Intentar avanzar con el nivel bloqueado produce un error controlado | test_nivel_bloqueado_lanza_error |
| CA-04 | La experiencia de combate aumenta el nivel del héroe | test_acumular_experiencia_sube_nivel |
| CA-05 | Equipar un arma o armadura modifica el ataque o la protección elemental | test_equipar_armadura_elemental_actualiza_stats |
| CA-06 | Agotar las tres vidas termina el turno o la partida | test_game_over |
| CA-07 | La llave del cuarto jefe abre la jaula y completa la aventura | test_completa_juego_al_rescatar_princesa |
| CA-08 | El menú ofrece uno o dos jugadores con tres vidas cada uno | test_elegir_modo_y_asignar_vidas |
| CA-09 | El Jugador 2 comienza cuando el primero agota sus vidas o rescata a la princesa | test_cambiar_turno |

## Estructuras de datos

| Capacidad del dominio | Estructura elegida | Por qué esta | Alternativa descartada y motivo | Complejidad clave |
|---|---|---|---|---|
| Eventos del juego | Cola de prioridad / montículo | Ejecuta ataques según su hora y conserva el orden de llegada en los empates | FIFO no ordena fechas distintas | O(log N) por inserción o extracción |
| Puntajes del jugador | Contador numérico por jugador | Actualiza el total directamente | AVL serviría para un ranking ordenado | O(1) |
| Ruta de enemigos | Grafo (lista de adyacencia) | Dijkstra busca la ruta de menor costo y penaliza los pasos muy cercanos a obstáculos | Matriz de adyacencia necesita O(V²) de espacio | O(E log V) por búsqueda |
| Representación del mapa | Matriz dispersa | Usa Map como soporte para guardar solo las celdas con obstáculos cercanos | Matriz densa reservaría espacio para todas las celdas | Acceso a la celda O(1) esperado, más sus candidatos |
| Inventario del jugador | Arreglo / arreglo dinámico | Permiten acceder por índice y añadir equipo al final | Lista enlazada requiere recorrer nodos para acceder por índice | O(1) por índice; O(N) para comprobar pertenencia |
| Turnos locales y vidas | Arreglo fijo | Guarda la partida de cada jugador y accede a ella por índice | Lista circular volvería al primer jugador | O(1) |
| Acciones de los enemigos | Arreglo / arreglo dinámico | El ciclo revisa el estado de cada enemigo y decide si debe moverse o preparar un ataque | Lista circular modelaría turnos | O(N) para recorrerlos, más las búsquedas y eventos |
| Deshacer y rehacer | Pila | Dos pilas LIFO revierten o restauran el último cambio manual de equipamiento | Lista doble exige mantener un cursor | O(1) amortizado por operación de pila |

Usa **Z** y **Y**, o los botones del inventario, para deshacer y rehacer cambios manuales de equipo. El historial se reinicia al cargar una zona, reintentar o recibir equipo automático. Estas acciones no restauran vida ni revierten el combate.

## Plan técnico y dificultad

La superficie es el punto de partida. El arreglo fijo niveles contiene solo las cuatro cuevas, con índices del 0 al 3. Los enemigos menores suman puntos y experiencia. Derrotar al jefe abre el descenso y el cuarto jefe deja la llave de la jaula.

| Cueva | Enemigos menores | Salud del jefe | Proyectiles por ataque del jefe |
|---|---:|---:|---:|
| Fuego | 4 | 109 | 3 |
| Agua | 5 | 140 | 4 |
| Tierra | 6 | 176 | 5 |
| Viento | 7 | 219 | 6 |

En cada descenso también aumentan la salud y la velocidad de los enemigos menores, los proyectiles viajan más rápido y el tiempo para esquivarlos se reduce. El código usa el plan técnico de plan.md y las ocho estructuras de estructura.md.

## Carpeta estructuras/

Cada archivo contiene la implementación que usa el juego. Abre index.html después de extraer todos los archivos del ZIP.

- cola-prioridad.js — montículo para eventos y búsqueda de rutas.
- contador-puntaje.js — suma de puntos del jugador.
- grafo-adyacencia.js — búsqueda de rutas por los vecinos transitables.
- matriz-dispersa.js — celdas del mapa con obstáculos.
- arreglo-inventario.js — armas y armaduras.
- arreglo-fijo.js — jugadores y niveles.
- arreglo-enemigos.js — enemigos de cada cueva.
- pila.js — deshacer y rehacer cambios de equipo.
