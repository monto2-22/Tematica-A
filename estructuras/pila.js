'use strict';

class Pila {
 #elementos = [];
 push(valor) { this.#elementos.push(valor); }
 pop() { return this.#elementos.pop(); }
 clear() { this.#elementos.length = 0; }
}
