'use strict';

function crearArregloFijo(longitud, crearElemento) {
 const arreglo = Array.from({length:longitud}, crearElemento);
 Object.defineProperty(arreglo, 'length', {writable:false});
 return Object.seal(arreglo);
}
