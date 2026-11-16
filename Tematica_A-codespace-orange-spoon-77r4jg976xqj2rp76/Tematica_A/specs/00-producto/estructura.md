# Decisión de estructuras — WorldCave

**Contexto:** Imagínate un tipo Genshin Impact, pero más simple y la verdadera gracia del juego es que está debajo de la tierra. Por arriba caminas por montañas y campos, pero el juego de verdad empieza cuando te metes a las cuevas. Ahí abajo hay una aventura gigante lleno de ruinas y enemigos. Tu meta es bajar, y pelear contra 4 monstruos de los elementos (Fuego, Agua, Tierra y Viento) y conseguir sus armas y armaduras, cada que derrotes a uno de los enemigos se van sumando puntos y pasando de nivel hasta llegar hasta los jefes, cada nivel que serían 4 en total seria un enemigo y un jefe y el “Héroe” cada que derrote a un enemigo le sumara puntos al derrotar el ultimo jefe slvaras a una princesa, este juego se podria jugar de dos turno, al perder e pprimer jugador seguiria el segundo y al ser derrotado el segundo jugador o haber ganado, se mostrara el puntaje de los dos jugadores. 

| Capacidad del dominio | Estructura elegida | Por qué esta | Alternativa descartada y motivo | Complejidad clave |
|---|---|---|---|---|
|Eventos del juego | Cola de prioridad / montículo | La Cola de prioridad ordena los eventos según el tiempo de ejecución o importancia. | Cola (FIFO): Los eventos (daño, efectos de sonido, animaciones) suceden en el orden exacto en que son generados. Procesar una Cola asegura que el primer evento que ocurre sea el primero en resolverse (First In, First Out). | O(log N) |

|puntajes del jugador| contador numerico | almacena un número y cuyo valor se incrementa o decrementa de forma controladas |Árbol AVL: serviría para mantener un ranking de puntajes ordenado | O(1) |

|Ruta de los enemigos hacia el jugador | Grafo (lista de adyacencia) | El mapa se representa como nodos y aristas (caminos). Una lista de adyacencia es eficiente en memoria para grafos dispersos (mapas de juegos) y permite ejecutar algoritmos de búsqueda de caminos | Grafo (Matriz de adyacencia): Solo se justifica si casi todos los nodos están conectados con todos los demás (grafos muy densos), ya que verificar si dos nodos están conectados toma O(1), pero consume memoria O(V2) | O( E log V) |

|Representación del mapa (mayoría de celdas vacías) | Matriz dispersa | Un mapa grande con pocas entidades o celdas ocupadas desperdiciaría mucha memoria con una matriz convencional. La matriz dispersa guarda únicamente las coordenadas de las celdas con contenido. | Tabla hash: Permite almacenar las celdas ocupadas usando una clave compuesta como "x, y". Si la clave no existe en la tabla, el juego asume de inmediato que la celda está | O(1) |

|Inventario del jugador | Arreglo / arreglo dinámico |  Permite acceso rápido por índice u ordenación fija de ítems. | Lista enlazada : Útil solo si el inventario no tiene casillas fijas y los ítems se agregan/eliminan constantemente en medio del inventario sin dejar espacios vacíos, pues insertar o eliminar no requiere reordenar todo el arreglo. | O(1) |

|Turnos locales y vidas | Arreglo fijo | Cada jugador empieza con tres vidas. El índice avanza del Jugador 1 al Jugador 2 cuando el primero agota sus vidas o completa la aventura. | Lista circular: volvería al Jugador 1 al finalizar el Jugador 2. Cada participante juega una sola vez por partida. |O(1)|

|acciones del enemigos | Arreglo / arreglo dinámico |Almacena los enemigos y permite recorrerlos para comprobar cuándo deben moverse o atacar según sus temporizadores|Lista circular: permitiría alternar turnos entre el héroe y los enemigos, pero se descarta porque el juego funciona en tiempo real mediante temporizadores. | O(N) |

| Deshacer y rehacer | Pila | Funciona mediante el principio LIFO (Último en entrar, primero en salir).  | Lista doble: Se utiliza si se prefiere mantener un único historial con un puntero o índice que se desplaza hacia atrás o hacia adelante a lo largo del registro de acciones. | O(1) |