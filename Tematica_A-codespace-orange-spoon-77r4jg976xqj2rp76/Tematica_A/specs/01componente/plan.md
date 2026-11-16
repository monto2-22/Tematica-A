# Plan técnico — WorldCave
**Especificación de referencia:** `spec.md` v1.0

## 1. Estructura de datos elegida
Arreglo. es ideal porque los niveles son fijos (1 a 4) y te permite cargar el siguiente nivel de forma inmediata por su número de índice.

## 2. Alternativas consideradas
| Alternativa | Ventaja | Por qué se descartó |
|---|---|---|
| Lista Enlazada | Permite insertar o eliminar nodos dinámicamente en tiempo de ejecución sin definir un tamaño límite inicial. | El acceso a un nivel específico no es directo requiere recorrido secuencial O(n) y consume memoria adicional guardando punteros. |
| Arreglo dinamico | Se expande automáticamente si se agregan más elementos durante la ejecución. | Innecesario para este caso de uso, ya que la cantidad total de niveles (4) es constante y conocida desde el diseño; la redimensión dinámica generaría sobrecosto en memoria sin aportar beneficio |

## 3. Complejidad esperada
| Operación | Tiempo | Espacio | Justificación |
|---|---|---|---|
| obtenerNivelActualnto | O(1) | O(1) | Acceso directo al mapa del nivel actual mediante la posición niveles[nivelActual] |
| obtenerJugadorActivo | O(1) | O(1) | 	Accede directamente al jugador mediante jugadores[indiceActivo]. |
|consultarVidasRestantes | O(1) | O(1) | Lee el contador de vidas del jugador activo. |
|descontarVida| O(1) | O(1) |	Resta una vida al jugador activo cuando sus corazones llegan a cero|
|consultarVidasRestantes | O(1) | O(1) | Lee el contador de vidas del jugador activo. |
| pasarAlSiguienteJugador | O(1) | O(1) | En el modo de dos jugadores, cambia el índice de 0 a 1 cuando el Jugador 1 pierde sus tres vidas o completa la aventura. |
| desbloquearSiguienteNivel | O(1) | O(1) | Incrementa el índice (nivelActual++) tras derrotar al enemigo y accede al siguiente mapa al instante. |
| consultarNivelPorIndice | O(1) | O(1) | Retorna los datos de cualquiera de los 4 niveles en tiempo constante gracias al direccionamiento por índice |
| registrarDerrotaEnemigoMenor | O(1) | O(1) | Con el enemigo ya identificado, registra su derrota y suma puntos y experiencia.|
| reiniciarProgreso | O(1) | O(1) | Restringir las asignaciones del índice mediante un método encapsulado con validación de rango estricto. |
| soltarLlaveJefeFinal | O(1) | O(1) | Al derrotar al cuarto jefe, deja la llave en la posición donde cayó.|
| recogerLlave | O(1) | O(1) |Comprueba si el héroe está cerca de la llave y registra que la recogió.|
| rescatarPrincesa | O(1) | O(1) |	Al pulsar E junto a la jaula, verifica que el héroe tenga la llave, abre la jaula y completa la aventura.|


## 4. Diseño interno
En el modo de dos jugadores, cuando el Jugador 1 agota sus tres vidas o completa la aventura, indiceActivo cambia a 1. El Jugador 2 empieza desde la superficie con sus propias tres vidas. Al terminar su turno, el juego muestra los puntajes de ambos.
Al iniciar la partida, el menú permite elegir entre 1 jugador y 2 jugadores por turnos. El arreglo jugadores guarda el progreso, el puntaje y el contador de vidas de cada participante. La variable indiceActivo empieza en 0, que corresponde al Jugador 1. Cada jugador tiene tres vidas y pierde una cuando sus corazones llegan a cero. Si aún tiene vidas, puede reintentar el nivel desde el punto de control.
El arreglo niveles tiene cuatro posiciones, con índices del 0 al 3. La variable nivelActual indica la cueva activa y cumple la condición 0 ≤ nivelActual < 4. En la cuarta cueva (nivelActual == 3), el jefe elemental deja caer una llave al ser derrotado. La victoria se alcanza al recogerla y abrir la jaula de la princesa.


## 5. Riesgos técnicos
| Riesgo | Impacto | Mitigación |
|---|---|---|
| Acceso fuera de los límites del arreglo | Alto | Validar antes de cada cambio de nivel que nivelActual + 1 < niveles.Length |
| Intento de cargar un nivel inexistente (<0 o >3) | Medio | Validar que tamanio > 0 o que tope != null antes de realizar la operación de desapilar. |