'use strict';

function crearArregloFijo(longitud, crearElemento) {
 return Object.seal(Array.from({length:longitud}, crearElemento));
}
