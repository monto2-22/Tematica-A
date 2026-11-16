//comprueba cómo la lógica del juego usa la cola de prioridad, la matriz dispersa y el grafo. Volví a ejecutar las pruebas y pasaron los 11 casos.
const {run,begin}=require('./entorno.cjs');
run('test_estructuras_en_juego',`{
 ${begin}
 const seenEvents=[],queue=new ColaPrioridad();
 queue.add(5,()=>seenEvents.push('tarde'));queue.add(2,()=>seenEvents.push('primero'));queue.add(2,()=>seenEvents.push('segundo'));
 queue.runDue(2);assert.equal(seenEvents.join(','),'primero,segundo');queue.runDue(5);assert.equal(seenEvents.at(-1),'tarde');
 const [x,y]=ROCKS[1][0];assert.ok(matrizDispersa.has(positionKey(x,y)));assert.ok(solid(x,y));
 const enemy={x:x-100,y,r:15},target={x:x+100,y};
 assert.equal(clearPath(enemy,target,10),false);
 const path=findEnemyPath(enemy,target);assert.ok(path.length>2);
 for(let i=1;i<path.length;i++)assert.ok(path[i-1].neighbors.includes(path[i]));
 prepareEnemyAttack(enemies[0],0);events.runDue(time+1);assert.equal(shots.length,1);
 draw();
}`);
