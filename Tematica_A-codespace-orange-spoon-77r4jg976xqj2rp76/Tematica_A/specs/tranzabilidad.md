## criterios -> prueba 
| ID | Criterio | 
| CA-01 | Derrota de Enemigo Menor y Suma de Puntos |
## codigo
derrota de enemigo
function damage(e,d){if(e.hp<=0)return;e.hp=Math.max(0,e.hp-d);e.flash=.12;sparks(e.x,e.y,COL[level],e.hp?5:17);if(!e.hp)award(e)}
suma de puntos
 if(!p.earned.has(id)){p.earned.add(id);p.score+=e.boss?250:50;p.xp+=e.boss?100:30}
![alt text](<derrotar_enemigo_ganar_puntos.png>)

| CA-02 | Victoria sobre jefe Elemental y Desbloqueo de Nivel |
Derrotar al jefe elementa
function enterNextLevel(){
 if(level===0&&!opened)throw new NivelBloqueadoError('Busca primero el cofre de la superficie');
 if(level>0&&bossAlive())throw new NivelBloqueadoError('Derrota al guardián de '+Z[level][0]);
 desbloquear nivel
 if(nivelActual+1>=niveles.length)throw new RangeError('No hay más cuevas');
 load(level+1);
}
![alt text](<derrotar_jefe.png>) 
![alt text](<nivel_desbloqueado.png>) 

| CA-03 | Restricción de Acceso a Niveles Bloqueados | 
 if(level>0&&bossAlive())throw new NivelBloqueadoError('Derrota al guardián de '+Z[level][0]);
 try{enterNextLevel()}catch(error){if(!(error instanceof NivelBloqueadoError))throw error;tell(error.message)}
 ![alt text](<nivel_desbloqueado.png>) 

| CA-04 | Subida de Nivel por Experiencia de Combate | 
 if(!p.earned.has(id)){p.earned.add(id);p.score+=e.boss?250:50;p.xp+=e.boss?100:30}
 const heroLevel=()=>1+Math.floor(p.xp/80);

| CA-05 | Equipamiento de Arma y Armadura Elemental |
desbloquear armadura
function equip(slot,value){
 const items=slot==='weapon'?p.weapons:p.armors;
 if(!items.includes(value)||p[slot]===value)return;
 pilaDeshacer.push({slot,before:p[slot],after:value});
 pilaRehacer.length=0;p[slot]=value;
}
calcular el daño
const attackPower=el=>(el===0?19:el===WEAK[level]?24:13)+Math.floor(p.xp/160)*2;
comprueba la proteccion elemental de la armadura
const protectedFrom=element=>p.armor===element;
![alt text](<calcular_daño.png>) 

| CA-06 | Manejo de Muerte del Héroe | test_game_over |
function hit(){if(p.inv>0||mode!=='play')return;p.hp--;p.inv=.72;sparks(p.x,p.y,'#ff7891',10);if(!p.hp){p.lives--;if(p.lives)show('retry');else finish(false)}}


| CA-07 |El cuarto jefe suelta la llave, Al usarla para rescatar a la princesa, se completa la aventura. | 
deja caer la llave
 if(level===4){drop={x:e.x,y:e.y};tell('¡Guardián vencido! Recoge la llave dorada')}
 se recoge al acercar
  players=Array.from({length:n},fresh);Object.seal(players);
completar la aventura al pulsar e se abrira la jaula
   if(p.key)finish(true);else tell('Recoge la llave que dejó el guardián');
![alt text](<soltar_llave.png>)
![alt text](<rescate.png>)  
![alt text](<final.png>) 

| CA-08 | El menú ofrece uno o dos jugadores, con tres vidas por jugador. |
ofrece ambos modos 
 menu:['Aventura 2D','WorldCave','Los cuatro elementos','Desciende por cuatro cuevas, domina sus elementos y libera a la princesa.',[['1 jugador',()=>start(1)],['2 por turnos',()=>start(2)]]],
crear los jugadores
  players=Array.from({length:n},fresh);Object.seal(players);
const fresh=()=>({x:spawn.x,y:spawn.y,hp:16,lives:3,score:0,xp:0,weapons:[0],armors:[],weapon:0,armor:0,earned:new Set(),dir:{x:1,y:0},cd:0,inv:0,key:false});
   players=Array.from({length:n},fresh);Object.seal(players);
   ![alt text](inicio.png)

| CA-09 |El Jugador 2 empieza cuando el Jugador 1 pierde su tercera vida o rescata a la princesa.| 
function finish(win){results[turn]={win,score:p.score};show(count===2&&turn===0?'handoff':'end')}
inicio del jugador 2
 handoff:['Fin del primer turno','Jugador 2','','Jugador 1: '+(results[0]?.score??0)+' puntos. Ahora empieza tu aventura desde la superficie.',[['Iniciar turno',()=>{turn=1;p=players[turn];load(0);show('play')}]]],
![alt text](<cambio_jugador.png>) 