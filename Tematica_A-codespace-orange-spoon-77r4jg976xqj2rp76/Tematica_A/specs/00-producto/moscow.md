# Priorización MoSCoW — <worldCave>
**Fecha:** <11/10/2026> · **Versión:** 1.0

## Capacidad
03 de octubre a 15 de octubre
 4 por semana × 3 semanas = 12 h
− 10 % de imprevistos = (1 y media h) 11 y media reales**
Motivo del porcentaje: Porque me dedicaba a repasar para parcailes mientras realizaba el proyecto

## Must (suman <x> h de <capacidad> h)
| Historia | Horas | Por qué es Must | Componente |

| Derrotar al enemigo y se pasa de nivel|3|porque define la condición de victoria y progresión indispensable para avanzar a través de los niveles de la cueva hasta el jefe final|Controlador de Progresión|

| recibir daño de los ataques enemigos y visualizar mi salud restante|4|porque establece el reto del juego y el mecanismo de derrota (Game Over) cuando la salud del héroe llega a cero|Gestor de Estado del Jugador|

| Elegir al inicio entre jugar solo o con otra persona. En el modo de dos, el Jugador 2 empieza cuando el Jugador 1 pierde sus tres vidas o completa la aventura|4|porque el modo por turnos es un requisito de esta versión. Para darlo por cumplido, el menú debe permitir elegir entre uno o dos jugadores, cada jugador debe tener tres vidas y el Jugador 2 debe poder empezar cuando el Jugador 1 agote sus vidas o complete la aventura.|Gestor de partida. Controla el modo de juego, las vidas y el cambio de turno|


| Quiero mover a mi personaje en las 4 direcciones dentro del mapa|4|porque es la acción base de jugabilidad; sin el movimiento dentro del mapa, el jugador no puede explorar ni interactuar con el entorno.|Gestor de Mapa|

## Should
| Historia | Horas | Condición para entrar |
|Quiero consultar un mapa de la cueva explorada hasta el momento|3|debe programar previamente el movimiento del personaje en el mapa para que el sistema pueda registrar y mostrar las coordenadas visitadas|

## Could
| Historia | Horas |
| Quiero deshacer mi último acción errónea dentro de la cueva |2|

## Won't (esta versión no)
| Historia | Razón |
|conectarme a internet e invitar a un amigo a mi partida dentro de la cueva|WorldCave está planteado como un juego de exploración y combate individual por niveles|

|guardar mi progreso del juego en un servidor remoto en la nube|No requiere infraestructura de nube ni servidores web porque el curso evalúa estructuras de datos locales en consola, y para un juego de terminal de 4 niveles basta con un archivo local simple|

## Orden de construcción
1. **Quiero mover a mi personaje en las 4 direcciones dentro del mapa**
2. **Recibir daño de los ataques enemigos y visualizar mi salud restante**
3. **Derrotar al enemigo y se pasa de nivel**
s
## Historial de cambios
| Versión | Fecha | Qué cambió de prioridad | Por qué |
| 1.0| 16/10/2026 |Creación inicial del MoSCoW |es la primera version, no eh hecho cambios|
| 1.5 | 2026-11-01 | segunda versión | le agregue una el rescate de un princesa |
| 2.0 | 2026-11-13 | version final | final |