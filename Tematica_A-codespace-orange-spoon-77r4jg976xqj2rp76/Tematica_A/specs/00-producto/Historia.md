# Historias de usuario — Temática A: WorldCave

Generado con el Constructor de historias de usuario. Fecha: 15/10/2026.

## Resumen del backlog

| ID | Historia | Prioridad | Horas | Estructura candidata |
|---|---|---|---|---|
| HU-01 | Derrotar al enemigo y se pasa de nivel | Must | 3 | Arreglo|
| HU-02 | recibir daño de los ataques enemigos y visualizar mi salud restante | Must | 4 | Arreglo / arreglo dinámico |
| HU-03 | Quiero mover a mi personaje en las 4 direcciones dentro del mapa | Must | 4 | Matriz dispersa |
| HU-04 | Elegir al inicio entre jugar solo o con otra persona. En el modo de dos, el Jugador 2 empieza cuando el Jugador 1 pierde sus tres vidas o completa la aventura.| Must | 4 |Arreglo fijo |
| HU-05 | Quiero consultar un mapa de la cueva explorada hasta el momento | Should | 3 | Matriz dispersa |
| HU-06 | Quiero deshacer mi último acción errónea dentro de la cueva | Could | 2 | Pila |
| HU-07 | conectarme a internet e invitar a un amigo a mi partida dentro de la cueva | Won't |  | |
| HU-08 | guardar mi progreso del juego en un servidor remoto en la nube | Won't | — | — |

## HU-01 · Must

**Como** jugador, **quiero** Derrotar al enemigo y se pasa de nivel **para** llegar al jefe Elemental.

- **Estimación:** 3 h
- **Estructura candidata:** Arreglo / arreglo dinámico 

**Criterios de aceptación**

- **CA-01:** Al reducir la vida del enemigo a 0, el nivelActual aumenta en 1 y carga el siguiente mapa.
- **CA-02:** Intentar pasar de nivel con el enemigo vivo lanza un error de acceso denegado.
- **CA-03:** El cambio de nivel valida que 1 ≤ nivelActual ≤
- **CA-04:** Al cambiar de nivel, el héroe mantiene sus stats, XP y equipamiento

## HU-02 · Must

**Como** jugador, **quiero** mover a mi personaje en las 4 direcciones dentro del mapa **para** explorar las salas de la cueva, evitar obstáculos y encontrar la salida o enemigos..

- **Estimación:** 4 h
- **Estructura candidata:** Matriz dispersa 

**Criterios de aceptación**

- **CA-01:**  Presionar una tecla de dirección válida actualiza las coordenadas (x, y) del personaje dentro de la matriz del mapa.
- **CA-02:** Intentar caminar hacia una pared o bloque impenetrable impide el movimiento y mantiene al personaje en su posición.

## HU-03 · Must

**Como** jugador, **quiero** recibir daño de los ataques enemigos y visualizar mi salud restante **para** saber el estado de mi héroe y reiniciar o finalizar la partida si mi vida llega a cero.

- **Estimación:** 4 h
- **Estructura candidata:** Arreglo / arreglo dinámico 

**Criterios de aceptación**

- **CA-01:** Cuando el enemigo ataca, la salud actual del personaje decrece proporcionalmente según el daño recibido
- **CA-02:** Si el HP del héroe llega a 0, la partida finaliza inmediatamente y muestra la pantalla de derrota.

## HU-04 · Must

**Como** jugador, **quiero** elegir al inicio si juego solo o con otra persona por turnos, para que cada participante pueda jugar su propia aventura con tres vidas usando el mismo dispositivo.

- **Estimación:** 4 h
- **Estructura candidata:** Arreglo fijo

**Criterios de aceptación**

- **CA-06:** Al quedarse sin corazones, el jugador pierde una vida. Si le quedan vidas, puede reintentar desde el punto de control.
- **CA-07:**Cuando los corazones del jugador activo llegan a cero, pierde una vida. Si le quedan vidas, puede reintentar desde el punto de control.
- **CA-08:**En el modo de dos jugadores, el Jugador 1 conserva su turno durante los reintentos. El Jugador 2 empieza desde la superficie cuando el Jugador 1 pierde su tercera vida o rescata a la princesa.
- **CA-09:**En el modo individual, la partida termina al perder la tercera vida o rescatar a la princesa. En el modo de dos, al terminar el turno del Jugador 2 se muestran ambos puntajes.

## HU-05 · Should

**Como** jugador, **quiero** Quiero consultar un mapa de la cueva explorada hasta el momento **para** orientarme dentro del laberinto de túneles, ubicar salas pendientes de explorar y no perderme.

- **Estimación:** 3 h
- **Estructura candidata:** Matriz dispersa _(se justifica en el plan.md del componente)_

**Criterios de aceptación**

- **CA-05:** El minimapa actualiza y dibuja únicamente las celdas o salas que el jugador ya ha pisado.
- **CA-06:** Las áreas no descubiertas se mantienen ocultas ("niebla de guerra") mapa.
- **CA-07:**  El mapa resalta con un marcador la posición actual del héroe dentro de la cueva.

## HU-06 · Could

**Como** jugador, **quiero** Quiero deshacer mi último acción errónea dentro de la cueva **para** corregir una decisión táctica, sin perder la partida.

- **Estimación:** 2 h
- **Estructura candidata:** Por decidir _(se justifica en el plan.md del componente)_

**Criterios de aceptación**

- **CA-08:** Al presionar un botón(retroceder), la posición del jugador y el estado del mapa regresan exactamente al turno anterior.
- **CA-09:** Intentar deshacer cuando la pila de acciones está vacía no altera el juego y muestra un mensaje de aviso.
- **CA-10:** La acción de deshacer se deshabilita durante el enfrentamiento directo contra un jefe Elemental.

## HU-07 · Won't

**Como** jugador, **quiero** conectarme a internet e invitar a un amigo a mi partida dentro de la cueva **para** explorar los túneles y combatir juntos en tiempo real a los jefes Elementales.

**Razón de la exclusión:** WorldCave está planteado como un juego de exploración y combate individual por niveles

## HU-08 · Won't

**Como** jugador, **quiero** guardar mi progreso del juego en un servidor remoto en la nube **para** poder retomar mi partida desde cualquier otra computadora o terminal sin perder mis niveles ni mi inventario.

**Razón de la exclusión:** No requiere infraestructura de nube ni servidores web porque el curso evalúa estructuras de datos locales en consola, y para un juego de terminal de 4 niveles basta con un archivo local simple

