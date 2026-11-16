# Especificación del sistema — WorldCave
**Temática:** A · **Autor:** Maite · **Fecha:** 2026-10-16

## 1. Descripción del sistema
WorldCave es un juego de exploración y combate desde la consola. El jugador empieza en la superficie (montañas) y luego desciende a una aventura subterránea de 4 niveles. Su objetivo es derrotar a 4 monstruos elementales (Fuego, Agua, Tierra, Viento), conseguir su equipamiento y acumular puntos hasta completar el juego.
Inicio:Al iniciar la partida, el menú permite elegir entre 1 jugador y 2 jugadores por turnos. ya lo que escoge se empiea el juego en tierra.
Descenso a las cuevas: Accede a la cueva subterránea (niveles 1 al 4).
Exploración y equipamiento: Navega por los mapas, elige y cambia entre sus armas según el elemento del enemigo.
Combate: Enfrenta al enemigo y al jefe de cada nivel aprovechando las debilidades elementales.
Progreso: Cada jugador tiene tres vidas y si pierden todas sus vida(total 3) seguiria el siguiente jugador y si los derrotan pues muentra los puntos.
Victoria: Tras derrotar a el ultimo jefe soltara una llave y se rescatara princesa, si finaliza del todo el juego muestre el puntaje de los dos jugadores.

## 2. Componentes
| Carpeta | Componente | Capacidad que resuelve |
| docs | Evidencias del proyecto |	Guarda capturas del juego y documenta las mediciones y las rutas obtenidas con A* y Dijkstra. |
| dominio | Lógica del juego |	Gestiona el combate, los puntos, la dificultad de las cuatro cuevas, las vidas, el cambio del Jugador 1 al Jugador 2 y el rescate de la princesa. |
| specs | Especificaciones y plan técnico |Documenta los requisitos, los criterios de aceptación y las decisiones sobre las estructuras de datos. |
|test |	Pruebas automatizadase | Comprueban los criterios de aceptación CA-01 a CA-09, el aumento de dificultad y el uso de las estructuras durante la partida. |
|estructura| Módulos de estructuras de datos | Permiten programar ataques, calcular rutas con A*, detectar obstáculos, organizar el inventario y deshacer o rehacer cambios de equipo. |

## 3. Cómo encajan los contratos
Componente 01 (Consola/Interfaz): Captura las acciones del usuario (moverse, atacar, cambiar arma) y muestra la interfaz visual.
Componente 02 (Niveles y Mapa): Controla la posición del jugador en la superficie y los 4 niveles subterráneos.
Componente 03 (Combate y Elementos): Calcula el daño del ataque según el arma elegida y la fortaleza del elemento (Fuego, Agua, Tierra, Viento).
Componente 04 (Inventario y Héroe): Administra las armas y armaduras equipadas, actualiza las estadísticas del personaje y suma los puntos ganados.
Componente 05 (Progreso y Datos): Guarda el estado de la partida, los jefes derrotados y gestiona el cambio de nivel.
El Componente 01 recibe el comando del jugador y llama al Componente 02 para moverlo por el mapa. Al encontrar un enemigo, el Componente 02 inicia la batalla llamando al Componente 03. El Componente 03 consulta al Componente 04 para saber qué arma tiene equipada el Héroe y calcula el daño elemental. Al ganar la batalla, el Componente 03 avisa al Componente 04 para entregar el botín (armas/armaduras) y sumar puntos. Finalmente, el Componente 04 notifica al Componente 05 para registrar el jefe derrotado y desbloquear el siguiente nivel.