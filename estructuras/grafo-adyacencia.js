'use strict';

function rutaMinima(start,goal,costoPaso){
 // Dijkstra: los pasos cerca de obstáculos cuestan más que los pasos despejados.
 const frontier=new ColaPrioridad(),previous=new Map([[start,null]]);
 const costs=new Map([[start,0]]);
 frontier.add(0,start);
 while(frontier.heap.length){
  const {at:cost,run:node}=frontier.take();
  if(cost!==costs.get(node))continue;
  if(node===goal){
   const path=[];
   for(let step=goal;step;step=previous.get(step))path.push(step);
   return path.reverse();
  }
  for(const neighbor of node.neighbors){
   const nextCost=cost+costoPaso(node,neighbor);
   if(nextCost>=(costs.get(neighbor)??Infinity))continue;
   costs.set(neighbor,nextCost);
   previous.set(neighbor,node);
   frontier.add(nextCost,neighbor);
  }
 }
 return [];
}
