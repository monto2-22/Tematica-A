'use strict';

// Las aristas conectan vecinos ortogonales y cuestan al menos su distancia.
const distanciaManhattan=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);

function buscarRuta(start,goal,costoPaso,heuristica=distanciaManhattan){
 const frontier=new ColaPrioridad(),previous=new Map([[start,null]]);
 const costs=new Map([[start,0]]);
 let visitados=0;
 frontier.add(heuristica(start,goal),{node:start,cost:0});
 while(frontier.heap.length){
  const {node,cost}=frontier.take().run;
  if(cost!==costs.get(node))continue;
  visitados++;
  if(node===goal){
   const path=[];
   for(let step=goal;step;step=previous.get(step))path.push(step);
   return {ruta:path.reverse(),costo:cost,visitados};
  }
  for(const neighbor of node.neighbors){
   const nextCost=cost+costoPaso(node,neighbor);
   if(nextCost>=(costs.get(neighbor)??Infinity))continue;
   costs.set(neighbor,nextCost);
   previous.set(neighbor,node);
   frontier.add(nextCost+heuristica(neighbor,goal),{node:neighbor,cost:nextCost});
  }
 }
 return {ruta:[],costo:Infinity,visitados};
}

function rutaMinima(origen,destino,costoPaso){
 return buscarRuta(origen,destino,costoPaso).ruta;
}
