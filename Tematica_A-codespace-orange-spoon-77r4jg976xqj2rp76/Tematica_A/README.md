# Tematica_A
escogí la temática A del video juego
# worldCave — Los cuatro elementos

Aventura 2D para navegador, sin instalación, servidor ni Internet. Abre index.html y pulsa Comenzar aventura.

## Controles
- Flechas o WASD: moverse.
- E: abrir cofre, entrar/descender y abrir la jaula con la llave.
- Espacio: arma equipada; J: espada.
- 1–5: cambiar arma; R: cambiar armadura.
- M: minimapa; P: pausa.
- En móvil: botones táctiles e inventario pulsable.

## Aventura
Busca el cofre de la superficie para conseguir la varita de Agua y la armadura de Fuego. Entra en la cueva del noreste. Explora las cuatro cuevas naturales con cámara móvil, caminos amplios y cámaras laterales. Cada una tiene enemigos humanoides del elemento de su jefe.

Fuego: roca volcánica y lava. Agua: cascadas y pozas. Tierra: raíces, minerales y cristales. Viento: roca erosionada y corrientes de aire.

Los niveles aumentan la dificultad: tienen 4, 5, 6 y 7 enemigos menores, además de un jefe. Sus vidas, velocidad de movimiento y de proyectiles aumentan; el tiempo entre ataques y su preparación se reduce.

Derrota al jefe de cada nivel para recibir su arma y una armadura contra el elemento siguiente y desbloquear el descenso. En el nivel 4 hay una princesa encerrada: derrota al jefe final, recoge la llave que deja en el suelo y pulsa E junto a la jaula para rescatarla. La partida solo termina en victoria al abrir la jaula.

## Vida y pociones
- Siempre tienes un máximo de 8 corazones.
- Cada impacto de una bolita enemiga o un golpe físico quita medio corazón, incluso si llevas armadura del mismo elemento.
- La armadura mantiene inmunidad frente al daño ambiental de su elemento, como lava y fuego.
- Vencer enemigos, jefes o subir de nivel NO recupera vida. Bajar al siguiente nivel tampoco cura.
- Desde el nivel 2, si falta vida, pueden aparecer pociones en lugares cercanos, accesibles y alejados de enemigos. Nunca aparecen con la vida llena ni en el nivel 1.
- Las pociones se recogen al acercarse y recuperan 2 corazones, hasta un máximo de 8. Solo hay una poción activa a la vez; si sigues herido, aparecen otras con intervalos de unos 16–23 segundos.
- Al llegar a cero se detiene la partida y puedes reintentar desde el inicio del nivel con ocho corazones. Los enemigos reaparecen pero no dan puntos duplicados.

## Progresión
Menor: 50 puntos y 30 XP. Jefe: 250 puntos y 100 XP. Cada 80 XP sube el nivel del héroe y periódicamente su ataque, sin aumentar la vida máxima.

Debilidades: Agua > Fuego; Tierra > Agua; Viento > Tierra; Fuego > Viento. Armaduras entregadas: jefe Fuego → Agua; Agua → Tierra; Tierra → Viento; Viento → Fuego.

## Código y pruebas
src/engine.js contiene reglas y estado; visuals.js, el personaje; ui.js, entradas y dibujo; shell.html, interfaz y estilos. index.html incluye todo y puede copiarse solo.

Con Node instalado:
    node tests/engine.test.cjs
    node tests/ui.test.cjs
    node build.cjs

20 pruebas de motor y una prueba de ejecución Canvas simulada. La prueba de interfaz no sustituye una revisión visual real. No hay guardado persistente: recargar empieza de nuevo.

Los documentos originales están preservados en docs/referencia/. Los cambios solicitados posteriormente por el usuario, incluido el rescate de la princesa, tienen prioridad sobre aquella referencia. Consulta docs/spec.md y BITACORA.md.

