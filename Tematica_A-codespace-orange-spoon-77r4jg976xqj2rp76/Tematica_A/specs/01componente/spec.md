# Especificación — WorldCave
**Versión:** 1.0 · **Fecha:** 2026-10-16 · **Autor:** Maite

## 1. Propósito
que el jugador pueda explorar y combatir en aventura subterráneos. Controlas a un héroe que desciende por 4 niveles de cuevas para derrotar a 4 jefes elementales (Fuego, Agua, Tierra y Viento), enfrentando enemigos menores en el camino para sumar puntos, subir de nivel y obtener sus armas y armaduras, salvar a la princesa y si escoges jugar para dos si el jugador 1 pierde o termina el juego sigue el jugador 2 y a finalizar se mostrara el punatje de los dos.

## 2. Fuera de alcance
No tiene una progresión infinita de niveles ni infinidad de jefes, son solo 4 niveles en si por pasar 
No se rescatará ni una princesa ni nada de eso, es un juego que se centra en derroten a 4 jefes elementos y salvar a la princesa

## 3. Operaciones
### `iniciarNivel(numeroNivel)`
- **Precondiciones:** numeroNivel está entre 1 y 4; el héroe está vivo salud > 0; si numeroNivel > 1, el jefe del nivel anterior fue derrotado.
- **Postcondiciones:** El nivel actual del juego cambia a numeroNivel; se cargan los enemigos menores y el jefe elemental correspondiente
- **Errores:** NivelBloqueadoError si intenta acceder a un nivel sin haber derrotado al jefe previo; NivelInvalidoError si numeroNivel no está entre 1 y 4

### `iniciarPartida(cantidadJugadores)`
- **Precondiciones:** Se elige 1 jugador o 2 jugadores por turnos en el menú..
- **Postcondiciones:** Se crean uno o dos jugadores, cada uno con tres vidas. El Jugador 1 queda activo.
- **Errores:** Se intenta iniciar la partida con una cantidad distinta de 1 o 2.

### `iniciarPartida(cantidadJugadores)`
- **Precondiciones:** Se elige 1 jugador o 2 jugadores por turnos en el menú..
- **Postcondiciones:** Se crean uno o dos jugadores, cada uno con tres vidas. El Jugador 1 queda activo.
- **Errores:** Se intenta iniciar la partida con una cantidad distinta de 1 o 2.


### `equiparRecompensa(item)`
- **Precondiciones:** item no es nulo; item es un arma o armadura obtenida tras derrotar a un enemigo o jefe elemental del nivel actual.
- **Postcondiciones:** El héroe equipa item; se actualizan las estadísticas de ataque o defensa del héroe según el elemento del ítem.
- **Errores:** ItemInvalidoError si item es nulo o no pertenece a las recompensas válidas del juego.

### `descontarVida()`
- **Precondiciones:**Los corazones del jugador activo llegan a cero.
- **Postcondiciones:**El contador del jugador activo disminuye en una vida. Si le quedan vidas, puede reintentar el nivel desde el punto de control. Si llega a cero, su turno termina.
- **Errores:** Se intenta descontar una vida cuando el jugador activo todavía tiene corazones o ya agotó sus vidas.

### `pasarAlSiguienteJugador()`
- **Precondiciones:**Los corazones del jugador activo llegan a cero.
- **Postcondiciones:**El índice activo cambia de 0 a 1. El Jugador 2 queda listo para empezar desde la superficie con tres vidas y ocho corazones.
- **Errores:**Se intenta pasar al Jugador 2 en modo individual o antes de que el Jugador 1 pierda sus tres vidas o complete la aventura.


### `derrotarJefeElemental(jefe)`
- **Precondiciones:**  jefe no es nulo; jefe es uno de los 4 jefes elementales (Fuego, Agua, Tierra, Viento) del nivel actual; la salud del jefe es ≤ 0
- **Postcondiciones:** El jefe queda marcado como derrotado; se otorga el equipamiento elemental único al héroe; se desbloquea el acceso al siguiente nivel de la cueva
- **Errores:** JefeNoValidoError si jefe es nulo o no es el jefe correspondiente al nivel actual.

## 4. Invariantes
- INV-01: Límite de niveles. Dentro de las cuevas, el nivel va del 1 al 4. Su índice en el arreglo niveles va del 0 al 3.
- INV-02: Puntaje. El puntaje de cada jugador es mayor o igual a cero y nunca disminuye durante la partida
- INV-03: Jefes derrotados. Cada jugador puede registrar hasta cuatro jefes elementales derrotados.
- INV-04: Acceso a niveles. Para entrar en la cueva N, el jugador debe haber derrotado al menos N − 1 jefes.
- INV-05: Jugador activo. La partida tiene uno o dos jugadores. Solo uno puede jugar a la vez y el Jugador 1 siempre empieza.
- INV-06: Vidas. Cada jugador empieza con tres vidas. El contador se mantiene entre 0 y 3 y disminuye en una por cada caída. Solo puede reintentar si le quedan vidas.
- INV-07: Cambio de turno. En el modo de dos, el Jugador 2 empieza desde la superficie con sus propias tres vidas cuando el Jugador 1 pierde su tercera vida o rescata a la princesa. El turno cambia una sola vez
- INV-08: Llave y rescate. La llave aparece al derrotar al cuarto jefe. La princesa solo puede ser rescatada cuando el jugador recoge la llave y abre la jaula. Ese rescate completa su aventura.
- INV-09: Fin de la partida. En solitario, la partida termina al perder la tercera vida o rescatar a la princesa. En el modo de dos, termina cuando el Jugador 2 cumple una de esas condiciones y se muestran ambos puntajes.

## 5. Criterios de aceptación
| ID | Criterio | Verificable mediante |
|---|---|---|
| CA-01 | Derrota de Enemigo Menor y Suma de Puntos | test_derrotar_enemigo_suma_puntos |
| CA-02 | Victoria sobre jefe Elemental y Desbloqueo de Nivel | test_derrotar_jefe_siguiente_nivel |
| CA-03 | Restricción de Acceso a Niveles Bloqueados | test_nivel_bloqueado_lanza_error |
| CA-04 | Subida de Nivel por Experiencia de Combate | test_acumular_experiencia_sube_nivel |
| CA-05 | Equipamiento de Arma y Armadura Elemental | test_equipar_armadura_elemental_actualiza_stats |
| CA-06 | Manejo de Muerte del Héroe | test_game_over |
| CA-07 |El cuarto jefe suelta la llave, Al usarla para rescatar a la princesa, se completa la aventura. | test_completa_juego_al_rescatar_princesa |
| CA-08 | El menú ofrece uno o dos jugadores, con tres vidas por jugador. | test_elegir_modo_y_asignar_vidas |
| CA-09 |El Jugador 2 empieza cuando el Jugador 1 pierde su tercera vida o rescata a la princesa.| test_cambiar_turno|

## 6. Casos extremos considerados
- Nivel fuera de rango
- Desapilar historial vacío
- Lista de enemigos vacía
- Muerte simultánea héroe/jefe
- Avanzar sin derrotar al jefe
- Intentar iniciar con una cantidad inválida de jugadores.
- Recibir varios golpes al caer y perder solo una vida.
- Recibir varios golpes al caer y perder solo una vida.
- Intentar abrir la jaula sin llave o caer antes de recogerla.
- Rescatar a la princesa con el Jugador 1 y pasar al Jugador 2.
- Agotar las vidas del Jugador 2 y mostrar ambos puntajes

## 7. Historial de cambios
| Versión | Fecha | Cambio | Motivo |
|---|---|---|---|
| 1.0 | 2026-10-12 | Versión inicial | inicio |
| 1.5 | 2026-11-01 | segunda versión | le agregue una el rescate de un princesa |
| 2.0 | 2026-11-13 | version final | final |