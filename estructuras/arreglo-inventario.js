'use strict';

function crearInventario() {
 return {weapons:[0], armors:[]};
}
function agregarEquipo(arreglo, elemento) {
 if (!arreglo.includes(elemento)) arreglo.push(elemento);
}
