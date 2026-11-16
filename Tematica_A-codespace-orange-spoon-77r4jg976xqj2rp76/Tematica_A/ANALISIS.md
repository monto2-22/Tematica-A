
# Tabla de complejidad
estructura | operacion | tiempo | espacio 
cola de prioridad|organiza los ataques para ejecutar primero el que corresponde antes | O(log Q) |O(Q)
arreglo/ arreglo dinamico|índice activo	Consulta al jugador activo y pasa al Jugador 2 cuando el Jugador 1 pierde sus tres vidas o rescata a la princesa.|O(1)|O(1)
grafos|permite que los enemigos encuentren camino hacia el jugador|O((V+E)·K)|O(V)
matriz dispersa | guarda las posiciones de las paredes para controlar el movimiento|O(K)|O(K)
arreglo dinamico| almacena armas, armaduras | O(1)|O(I)
arreglo dinamico| Controlar cuándo se mueve o ataca cada enemigo |O(N)|O(N)
pila | permite deshacer el ultimo movimiento y restaurar la exploracion anterior |O(1)|O(H·P)

Q: ataques pendientes
V y E: posiciones y conexiones del grafo
K: paredes almacenadas
I: objetos del inventario
N: enemigos
H: movimientos guardados, hasta 100
P: celdas exploradas por registro

# aunque no son unas estrctura hace parte del proyecto
contador numerico|Almacena y acumula los puntos del jugador|O(1)|O(1)
Contador de vidas por jugador|Guarda la posición de la llave al caer el cuarto jefe y registra cuándo el jugador la recoge.|O(1)|O(1)
Indicador de rescate|Comprueba que el jugador tenga la llave al abrir la jaula y registra el rescate de la princesa.|O(1)|O(1)

# Justificación de las decisiones
# cola de prioridad
es una estructura de datos similar a una cola tradicional (FIFO), pero con una diferencia clave: cada elemento tiene una prioridad asignada y los elementos se atienden según su importancia y no por el orden en que llegaron 
en el juego permite 
# grafos
un grafo permite modelar redes complejas de relaciones donde cualquier elemento puede conectarse con cualquier otro. 
en el juego permite que los enemigos encuentren camino hacia el jugador o sea cuando el jugado vaya acercandose al enemigo, como por decirlo sienta la precensia del jugador y empiece a cercarse.
# matriz dispersa
es una matriz bidimensional (una cuadrícula de filas y columnas) en la que la gran mayoría de sus elementos tienen el mismo valor, por lo general el cero , o un valor por defecto que no representa información útil.
guarda las posiciones de las paredes para controlar el movimiento
# arreglo dinamico
es una colección que guarda elementos en orden y puede aumentar su capacidad cuando agregas más.
en el juego se utiliza el arreglo para dos cosas:
el inventario: para guarda las armas y armaduras que consigues al derrotar un jefe
enemigos: guarda sus datos, como cuándo se mueve o ataca tambien su vida
# arreglo fijo
sirve para guardar por separado las vidas, el puntaje, el equipo y el progreso de cada jugador. Si eliges jugar solo, se usa una posición. Si eliges jugar de a dos, jugadores[0] guarda al Jugador 1 y jugadores[1] al Jugador 2.
# pila
que funciona bajo el principio LIFO (Last In, First Out), lo que significa que el último elemento en entrar es el primero en salir
en el juego Guarda el historial de movimientos para recuperar la posición y el ultimo movimiento realizado por el jugador.