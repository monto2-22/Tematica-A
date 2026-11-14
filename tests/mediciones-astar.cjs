const assert = require('node:assert/strict');
const { evaluar } = require('./entorno.cjs');
const crearCaso = evaluar(`(nivel) => {
 start(1);
 load(nivel);
 const [x,y] = ROCKS[nivel][0];
 const origen = nearbyNode({x:x-100,y}, 10);
 const destino = nearbyNode({x:x+100,y}, 10, true);
 return {
  nombre: Z[nivel][0],
  nodos:grafoAdyacencia.size,
  buscar: (astar) => buscarRuta(origen,destino,costoRutaEnemiga,
    astar ? distanciaManhattan : () => 0)
 };
}`);
const repeticiones = 300;
function medir(buscar, astar) {
 const inicio = process.hrtime.bigint();
 for (let i=0;i<repeticiones;i++) buscar(astar);
 return Number(process.hrtime.bigint()-inicio)/1e6/repeticiones;
}
console.log('WorldCave | A* frente a Dijkstra');
console.log('Node '+process.version+' | '+process.platform+' '+process.arch);
console.log('Tiempo medio de '+repeticiones+' búsquedas por algoritmo, sin dibujar ni generar el mapa.');
console.log('Ruta entre lados opuestos de la primera roca de cada cueva; coordenadas en píxeles.');
for (let nivel=1;nivel<=4;nivel++) {
 const { nombre,nodos,buscar } = crearCaso(nivel);
 for (let i=0;i<100;i++) { buscar(true); buscar(false); }
 const a=buscar(true),d=buscar(false);
 assert.ok(a.ruta.length>1);
 assert.equal(a.costo,d.costo);
 for (let i=1;i<a.ruta.length;i++) assert.ok(a.ruta[i-1].neighbors.includes(a.ruta[i]));
 const tiempos={};
 for(const modo of nivel%2?[true,false]:[false,true]) tiempos[modo]=medir(buscar,modo);
 console.log('\n'+nombre+' | '+nodos+' nodos en el grafo');
 console.log('A*       | costo '+a.costo+' | '+(a.ruta.length-1)+' pasos | '+a.visitados+' visitados | '+tiempos.true.toFixed(3)+' ms');
 console.log('Dijkstra | costo '+d.costo+' | '+(d.ruta.length-1)+' pasos | '+d.visitados+' visitados | '+tiempos.false.toFixed(3)+' ms');
 console.log('Ruta A*       '+a.ruta.map(({x,y})=>'('+x+','+y+')').join(' -> '));
 console.log('Ruta Dijkstra '+d.ruta.map(({x,y})=>'('+x+','+y+')').join(' -> '));
}
