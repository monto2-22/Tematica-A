'use strict';

class MatrizDispersa {
 #celdas = new Map();
 agregar(coordenada, valor) {
  if (!this.#celdas.has(coordenada)) this.#celdas.set(coordenada, []);
  this.#celdas.get(coordenada).push(valor);
 }
 has(coordenada) { return this.#celdas.has(coordenada); }
 get(coordenada) { return this.#celdas.get(coordenada); }
}
