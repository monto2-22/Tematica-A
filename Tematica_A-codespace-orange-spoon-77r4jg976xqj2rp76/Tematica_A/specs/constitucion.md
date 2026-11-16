# Constitución del proyecto — WorldCave
**Autor:** Maite · **Temática:** A · **Repositorio:** https://github.com/miatemiate4-sketch/Tematica_A

## Principios
1. Respuesta rápida de los controles. Los botones responden de inmediato para mantener un combate fluido.
2. Carga asíncrona de mapas. Los niveles subterráneos se preparan en segundo plano para mantener la exploración fluida.
3. Claridad visual. Los efectos de los ataques elementales se moderan para evitar que la pantalla se sature.
4. Turnos locales claros. El menú inicial permite elegir entre uno o dos jugadores. En el modo de dos, la pantalla indica quién juega y cuántas vidas le quedan.
5. Progreso independiente. Cada jugador tiene sus propias vidas, equipo, puntaje y avance en la aventura.

## Restricciones
- Bloqueo en combate. El jugador no puede cambiar de arma mientras ataca, está en el aire o está aturdido.
- Acceso a niveles. Para bajar a la siguiente cueva, el jugador debe derrotar al jefe de la cueva actual.
- Tres vidas por jugador. Cada vez que los corazones llegan a cero, se pierde una vida. Si quedan vidas, el jugador puede volver al punto de control con ocho corazones y conserva su puntaje, experiencia y equipo.
- Condición de victoria. El jugador debe derrotar al cuarto jefe, recoger la llave y abrir la jaula para rescatar a la princesa.
- Fin de la partida. La partida termina cuando el último jugador pierde su tercera vida o rescata a la princesa. En el modo de dos se muestran ambos puntajes.

## Definición de terminado
Una funcionalidad está terminada cuando:
- [ ] Todos sus criterios de aceptación tienen prueba y pasan
- [ ] La complejidad real coincide con la declarada en el plan
- [ ] Revisé el código contra la spec antes de integrarlo
- [ ] spec.md, plan.md y tasks.md reflejan el estado real

## Uso de asistentes de IA
Permitido para: Entender conceptos, depurar errores y revisar mi código contra la spec.
No permitido para: Entregar código que no pueda explicar línea por línea.
Todo aporte de IA se revisa contra la especificación antes de integrarse y se declara en BITACORA.md.