//verifica qué ocurre cuando se aplican las reglas del juego.
const {run,begin}=require('./entorno.cjs');
const killBoss="const boss=enemies.find(e=>e.boss); damage(boss,boss.hp);";
const rescue=`
 Object.assign(p,chest); interact(); Object.assign(p,door); interact();
 while(level<4){const boss=enemies.find(e=>e.boss);damage(boss,boss.hp);Object.assign(p,door);interact()}
 ${killBoss}
 assert.ok(drop); Object.assign(p,cage);interact();assert.equal(mode,'play');
 Object.assign(p,drop);tick(.01);assert.ok(p.key);assert.equal(drop,null);
 Object.assign(p,cage);interact();
`;
const die=`
 for(let attempt=0;attempt<3;attempt++){
  p.hp=1;p.inv=0;hit();assert.equal(p.lives,2-attempt);
  hit();assert.equal(p.lives,2-attempt);
  if(attempt<2){assert.equal(mode,'retry');$('dialog').lastChild.firstChild.onclick();assert.equal(p.hp,16)}
 }
`;
run('test_derrotar_enemigo_suma_puntos',`{${begin}const e=enemies[0];damage(e,e.hp);assert.equal(p.score,50);damage(e,50);assert.equal(p.score,50)}`);
run('test_derrotar_jefe_siguiente_nivel',`{${begin}${killBoss}Object.assign(p,door);interact();assert.equal(level,2);assert.equal(p.score,250)}`);
run('test_nivel_bloqueado_lanza_error',`{${begin}assert.throws(enterNextLevel,NivelBloqueadoError);Object.assign(p,door);interact();assert.equal(level,1);assert.match(toast,/Derrota/)}`);
run('test_acumular_experiencia_sube_nivel',`{${begin}for(const e of enemies.slice(0,3))damage(e,e.hp);assert.equal(p.xp,90);assert.equal(heroLevel(),2);hud();assert.match($('rank').textContent,/nivel 2/)}`);
run('test_equipar_armadura_elemental_actualiza_stats',`{
 ${begin}input('1');assert.equal(attackPower(p.weapon),19);
 input('3');attack();assert.equal(shots.at(-1).dmg,24);
 ${killBoss}assert.equal(p.armor,2);input('r');assert.equal(p.armor,1);
 const [x,y]=HAZ[1][0];Object.assign(p,{x,y});tick(.01);assert.equal(p.hp,16);
 input('z');assert.equal(p.armor,2);tick(.01);assert.equal(p.hp,15);
 input('y');assert.equal(p.armor,1);
}`);
run('test_game_over',`{start(1);${die}assert.equal(mode,'end');assert.equal(results[0].win,false)}`);
run('test_completa_juego_al_rescatar_princesa',`{start(1);${rescue}assert.equal(mode,'end');assert.equal(results[0].win,true)}`);
run('test_elegir_modo_y_asignar_vidas',`{
 for(const count of [1,2]){menu();const buttons=$('dialog').lastChild.children;assert.equal(buttons.length,2);buttons[count-1].onclick();assert.equal(players.length,count);assert.ok(Object.isSealed(players));assert.ok(players.every(player=>player.lives===3))}
}`);
run('test_cambiar_turno',`{
 for(const win of [false,true]){
  start(2);
  if(win){${rescue}}else{${die}}
  assert.equal(mode,'handoff');assert.equal(turn,0);
  $('dialog').lastChild.firstChild.onclick();
  assert.equal(turn,1);assert.equal(p,players[1]);assert.equal(level,0);
  assert.equal(p.lives,3);assert.equal(p.score,0);
  ${die}assert.equal(mode,'end');assert.equal(results.length,2);assert.equal(results[0].win,win);
 }
}`);
run('test_dificultad_crece_en_cada_cueva',`{
 ${begin}
 assert.equal(niveles.length,4);
 assert.ok(Object.isFrozen(niveles));
 assert.throws(()=>load(5),{name:'RangeError'});
 assert.throws(()=>load(-1),{name:'RangeError'});
 let previous;
 for(let i=0;i<niveles.length;i++){
  assert.equal(nivelActual,i);
  const difficulty=zonaActual().difficulty,boss=enemies.find(e=>e.boss);
  assert.equal(enemies.length,i+5);
  assert.equal(boss.hp,difficulty.bossHP);
  if(previous){
   for(const key of ['minions','enemyHP','bossHP','speed','shotSpeed'])assert.ok(difficulty[key]>previous[key]);
   for(const key of ['wind','recovery'])assert.ok(difficulty[key]<previous[key]);
  }
  prepareEnemyAttack(boss,0);
  events.runDue(time+difficulty.wind);
  assert.equal(shots.length,i+3);
  assert.ok(Math.abs(Math.hypot(shots[0].vx,shots[0].vy)-difficulty.shotSpeed)<1e-8);
  previous=difficulty;
  damage(boss,boss.hp);
  if(i<3)enterNextLevel();
 }
 assert.throws(enterNextLevel,{name:'RangeError'});
}`);
