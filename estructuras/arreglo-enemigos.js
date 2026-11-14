'use strict';

function crearArregloEnemigos(posiciones, cantidad, crearEnemigo) {
 const enemigos = posiciones.slice(0,cantidad).map(([x,y],id)=>crearEnemigo(x,y,id,false));
 enemigos.push(crearEnemigo(1082,266,99,true));
 return enemigos;
}
