'use strict';
const W=900,H=540,MW=1260,MH=760;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const ELEM=['Espada','Fuego','Agua','Tierra','Viento'],COL=['#f5dfad','#ff714c','#61dcff','#aade72','#d4b1ff'],WEAK=[0,2,3,4,1];
const Z=[
 ['La superficie','Pinos del alba','#243a34','#344c3b','#81b897'],
 ['Fuego','Forja de ceniza','#311d25','#4b2b32','#ff734f'],
 ['Agua','Grutas del eco','#142d3d','#214456','#61d7f7'],
 ['Tierra','Raíces de cristal','#242d24','#354334','#b7dc80'],
 ['Viento','Santuario del cielo','#25243c','#3c3754','#cbb4ff']
];
const ROCKS=[
 [[282,205,72],[527,398,72],[800,180,66],[930,590,82],[410,655,55],[186,474,36],[679,572,41]],
 [[288,270,55],[531,483,64],[731,245,54],[933,594,57],[405,617,41],[980,112,40]],
 [[327,480,66],[496,208,57],[680,560,71],[797,119,38],[925,339,50],[216,260,40]],
 [[258,392,54],[494,546,60],[637,235,76],[799,585,48],[962,152,45],[1000,460,37]],
 [[313,205,67],[450,505,58],[624,360,57],[763,163,43],[825,605,68],[1008,548,45]]
];
const HAZ=[[],[[505,289,64,45],[809,527,77,50]],[[382,277,56,43],[716,380,75,53]],[[402,231,57,45],[799,418,63,48]],[[485,284,57,47],[886,397,61,51]]];
// plan.md: la superficie es independiente y las cuevas ocupan los índices 0–3.
// Cada fila aumenta la presión: más enemigos, más resistencia y ataques más rápidos.
const dificultad=[
 {minions:4,enemyHP:33,bossHP:109,speed:52,shotSpeed:173,wind:.56,recovery:1.49,spread:[-.24,0,.24]},
 {minions:5,enemyHP:43,bossHP:140,speed:63,shotSpeed:208,wind:.47,recovery:1.30,spread:[-.34,-.11,.11,.34]},
 {minions:6,enemyHP:55,bossHP:176,speed:75,shotSpeed:244,wind:.39,recovery:1.11,spread:[-.44,-.22,0,.22,.44]},
 {minions:7,enemyHP:69,bossHP:219,speed:88,shotSpeed:282,wind:.32,recovery:.94,spread:[-.55,-.33,-.11,.11,.33,.55]}
];
const niveles=Object.freeze(crearArregloFijo(4,(_,index)=>Object.freeze({
 theme:Z[index+1], rocks:ROCKS[index+1], hazards:HAZ[index+1], difficulty:Object.freeze(dificultad[index])
})));
const superficie={theme:Z[0],rocks:ROCKS[0],hazards:HAZ[0]};
let nivelActual=-1;
const zonaActual=()=>nivelActual===-1?superficie:niveles[nivelActual];
const spawn={x:120,y:621},chest={x:334,y:544},door={x:1124,y:130},cage={x:1124,y:130};
const spots=[[387,398],[575,324],[786,452],[892,252],[538,122],[672,651],[945,452]];
const keys=new Set();let mode='menu',count=1,turn=0,results=[],p,level,enemies,shots,fx,seen,opened,drop,potion,potionAt,time=0,toast='',toastAt=0,mission='',near='',mapOn=true,cx=0,cy=0;
let seed=1;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const fresh=()=>({x:spawn.x,y:spawn.y,hp:16,lives:3,score:0,xp:0,...crearInventario(),weapon:0,armor:0,earned:new Set(),dir:{x:1,y:0},cd:0,inv:0,key:false});
// Turnos locales: el arreglo tiene exactamente una o dos posiciones por partida.
let players=[fresh()];
// Montículo mínimo: fecha de ejecución y orden de llegada para los empates.
let events;
// Pilas LIFO de cambios manuales de equipamiento. No rebobinan el combate.
let pilaDeshacer=new Pila(),pilaRehacer=new Pila();
function equip(slot,value){
 const items=slot==='weapon'?p.weapons:p.armors;
 if(!items.includes(value)||p[slot]===value)return;
 pilaDeshacer.push({slot,before:p[slot],after:value});
 pilaRehacer.clear();p[slot]=value;
}
function replayEquipment(redo){
 const from=redo?pilaRehacer:pilaDeshacer,to=redo?pilaDeshacer:pilaRehacer;
 const change=from.pop();
 if(!change){tell(redo?'No hay cambios para rehacer':'No hay cambios para deshacer');return}
 p[change.slot]=redo?change.after:change.before;
 to.push(change);
 tell((redo?'Rehecho: ':'Deshecho: ')+ELEM[p[change.slot]]);
}
const CELL=32, MAX_RADIUS=32;
let matrizDispersa, grafoAdyacencia;
const cellKey=(col,row)=>row*Math.ceil(MW/CELL)+col;
const positionKey=(x,y)=>cellKey(Math.floor(x/CELL),Math.floor(y/CELL));
// Matriz dispersa: solo se crean entradas en las celdas próximas a una roca.
function buildObstacleGrid(){
 matrizDispersa=new MatrizDispersa();
 for(const rock of zonaActual().rocks){
  const [x,y,r]=rock,reach=r+MAX_RADIUS;
  for(let row=Math.floor((y-reach)/CELL);row<=Math.floor((y+reach)/CELL);row++){
   for(let col=Math.max(0,Math.floor((x-reach)/CELL));col<=Math.min(Math.ceil(MW/CELL)-1,Math.floor((x+reach)/CELL));col++){
    const key=cellKey(col,row);
    matrizDispersa.agregar(key,rock);
   }
  }
 }
}
// Grafo disperso: cada nodo guarda solo sus vecinos transitables.
function buildRoutes(){
 grafoAdyacencia=new Map();
 for(let y=CELL/2;y<MH;y+=CELL){
  for(let x=CELL/2;x<MW;x+=CELL){
   if(!solid(x,y,20))grafoAdyacencia.set(positionKey(x,y),{x,y,neighbors:[]});
  }
 }
 for(const node of grafoAdyacencia.values()){
  for(const [dx,dy] of [[CELL,0],[-CELL,0],[0,CELL],[0,-CELL]]){
   const neighbor=grafoAdyacencia.get(positionKey(node.x+dx,node.y+dy));
   if(neighbor&&dist(node,neighbor)===CELL&&!solid(node.x+dx/2,node.y+dy/2,20))node.neighbors.push(neighbor);
  }
 }
}
function clearPath(from,to,radius){
 const steps=Math.max(1,Math.ceil(dist(from,to)/10));
 for(let i=1;i<=steps;i++){
  if(solid(from.x+(to.x-from.x)*i/steps,from.y+(to.y-from.y)*i/steps,radius))return false;
 }
 return true;
}
function nearbyNode(point,radius,reverse=false){
 const col=Math.floor(point.x/CELL),row=Math.floor(point.y/CELL);
 let closest=null,distance=Infinity;
 for(let y=row-2;y<=row+2;y++){
  for(let x=col-2;x<=col+2;x++){
   if(x<0||x>=Math.ceil(MW/CELL))continue;
   const node=grafoAdyacencia.get(cellKey(x,y));
   if(!node||dist(node,point)>=distance)continue;
   if(!(reverse?clearPath(node,point,radius):clearPath(point,node,radius)))continue;
   closest=node;distance=dist(node,point);
  }
 }
 return closest;
}
function findEnemyPath(enemy,target){
 const radius=enemy.r*.65;
 const start=nearbyNode(enemy,radius),goal=nearbyNode(target,radius,true);
 if(!start||!goal)return [];
 return rutaMinima(start,goal,costoRutaEnemiga);
}
const costoRutaEnemiga=(_,neighbor)=>CELL+(solid(neighbor.x,neighbor.y,30)?CELL*.5:0);

function pursue(enemy,dt){
 const radius=enemy.r*.65;
 let target=p;
 if(!clearPath(enemy,p,radius)){
  if(time>=(enemy.routeAt??0)){
   enemy.path=findEnemyPath(enemy,p);enemy.pathIndex=0;enemy.routeAt=time+.4;
  }
  while(enemy.path[enemy.pathIndex]&&dist(enemy,enemy.path[enemy.pathIndex])<3)enemy.pathIndex++;
  target=enemy.path[enemy.pathIndex]??p;
 }
 const distance=dist(enemy,target);
 if(!distance)return;
 const step=Math.min(distance,zonaActual().difficulty.speed*dt);
 move(enemy,(target.x-enemy.x)*step/distance,(target.y-enemy.y)*step/distance,radius);
}
function load(n){
 if(!Number.isInteger(n)||n<0||n>niveles.length)throw new RangeError('Zona inexistente');
 nivelActual=n-1;
 level=n;Object.assign(p,spawn,{dir:{x:1,y:0},key:false,cd:0,inv:0});opened=n>0;drop=null;potion=null;potionAt=time+8;shots=[];fx=[];seen=new Set();toast='';near='';
 enemies=n?crearArregloEnemigos(spots,zonaActual().difficulty.minions,foe):[];
 events=new ColaPrioridad();
 pilaDeshacer=new Pila();pilaRehacer=new Pila();
 buildObstacleGrid();buildRoutes();
 cx=0;cy=MH-H;discover();
}
function foe(x,y,id,boss){
 const difficulty=zonaActual().difficulty;
 const max=boss?difficulty.bossHP:difficulty.enemyHP;
 return{x,y,id,boss,max,hp:max,r:boss?30:15,cd:difficulty.recovery*.6+id%4*.32,wind:0,dir:1,flash:0};
}
function start(n){
 if(n!==1&&n!==2)throw new RangeError('Se requiere uno o dos jugadores');
 players=crearArregloFijo(n,fresh);
 count=players.length;turn=0;results=new Array(count);p=players[turn];load(0);show('play');
}
function tell(s){toast=s;toastAt=time+3.3}
function menu(){count=1;turn=0;results=[];p=fresh();load(0);show('menu')}
function finish(win){results[turn]={win,score:p.score};show(count===2&&turn===0?'handoff':'end')}
function hit(){if(p.inv>0||mode!=='play')return;p.hp--;p.inv=.72;sparks(p.x,p.y,'#ff7891',10);if(!p.hp){p.lives--;if(p.lives)show('retry');else finish(false)}}
const bossAlive=()=>enemies.some(e=>e.boss&&e.hp>0);
class NivelBloqueadoError extends Error {}
function enterNextLevel(){
 if(level===0&&!opened)throw new NivelBloqueadoError('Busca primero el cofre de la superficie');
 if(level>0&&bossAlive())throw new NivelBloqueadoError('Derrota al guardián de '+Z[level][0]);
 if(nivelActual+1>=niveles.length)throw new RangeError('No hay más cuevas');
 load(level+1);
}
function interact(){
 if(!level&&!opened&&dist(p,chest)<67){opened=true;agregarEquipo(p.weapons,2);agregarEquipo(p.armors,1);p.weapon=2;p.armor=1;pilaDeshacer=new Pila();pilaRehacer=new Pila();tell('Varita de Agua y armadura de Fuego equipadas');return}
 if(dist(p,door)>68)return;
 if(level<4){
  try{enterNextLevel()}catch(error){if(!(error instanceof NivelBloqueadoError))throw error;tell(error.message)}
  return;
 }
 if(bossAlive()){tell('Derrota al guardián de '+Z[level][0]);return}
 if(p.key)finish(true);else tell('Recoge la llave que dejó el guardián');
}
function award(e){
 const id=level+':'+e.id;
 if(!p.earned.has(id)){p.earned.add(id);p.score=sumarPuntos(p.score,e.boss?250:50);p.xp+=e.boss?100:30}
 if(!e.boss)return;
 agregarEquipo(p.weapons,level);
 const next=level%4+1;agregarEquipo(p.armors,next);
 if(level===4){drop={x:e.x,y:e.y};tell('¡Guardián vencido! Recoge la llave dorada')}
 else {p.armor=next;pilaDeshacer=new Pila();pilaRehacer=new Pila();tell('Arma de '+ELEM[level]+' obtenida · Descenso abierto')}
}
function damage(e,d){if(e.hp<=0)return;e.hp=Math.max(0,e.hp-d);e.flash=.12;sparks(e.x,e.y,COL[level],e.hp?5:17);if(!e.hp)award(e)}
const heroLevel=()=>1+Math.floor(p.xp/80);
const attackPower=el=>(el===0?19:el===WEAK[level]?24:13)+Math.floor(p.xp/160)*2;
const protectedFrom=element=>p.armor===element;
function attack(sword=false){
 if(!level||p.cd>0)return;
 const el=sword?0:p.weapon;
 p.cd=el?.36:.31;
 let target=null,best=el?300:77;
 for(const e of enemies){if(e.hp<=0)continue;const d=dist(p,e),facing=((e.x-p.x)*p.dir.x+(e.y-p.y)*p.dir.y)/(d||1);if(d<best&&(facing>-.23||d<45)){target=e;best=d}}
 const dx=target?target.x-p.x:p.dir.x,dy=target?target.y-p.y:p.dir.y,l=Math.hypot(dx,dy)||1;
 if(el){shots.push({x:p.x+dx/l*18,y:p.y+dy/l*18,vx:dx/l*480,vy:dy/l*480,life:.78,el,friendly:true,dmg:attackPower(el)})}
 else {fx.push({x:p.x,y:p.y,life:.16,max:.16,el:0,arc:Math.atan2(dy,dx)});if(target)damage(target,attackPower(el))}
}
function solid(x,y,r=12){
 if(x<50+r||x>MW-50-r||y<47+r||y>MH-47-r)return true;
 return (matrizDispersa.get(positionKey(x,y))??[]).some(([a,b,k])=>Math.hypot(x-a,y-b)<k+r);
}
function move(o,dx,dy,r){if(!solid(o.x+dx,o.y,r))o.x+=dx;if(!solid(o.x,o.y+dy,r))o.y+=dy}
function discover(){const x=Math.floor(p.x/70),y=Math.floor(p.y/70);seen.add(x+','+y)}
function sparks(x,y,color,n){for(let i=0;i<n;i++){let a=rand()*Math.PI*2,v=35+rand()*96,life=.2+rand()*.27;fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life,max:life,color})}}
function spawnPotion(){
 for(let i=0;i<38;i++){let a=rand()*6.283,r=65+rand()*120,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;
 if(!solid(x,y,15)&&!zonaActual().hazards.some(([a,b,w,h])=>((x-a)/w)**2+((y-b)/h)**2<1.2)&&!enemies.some(e=>e.hp&&dist(e,{x,y})<100)){
  let clear=true;for(let j=1;j<6;j++)if(solid(p.x+(x-p.x)*j/6,p.y+(y-p.y)*j/6)){clear=false;break}
  if(clear){potion={x,y};tell('Una poción apareció cerca');return}
 }}
 potionAt=time+2;
}
function tick(dt){
 time+=dt;p.cd=Math.max(0,p.cd-dt);p.inv=Math.max(0,p.inv-dt);
 let x=+(keys.has('d')||keys.has('arrowright'))- +(keys.has('a')||keys.has('arrowleft')),
 y=+(keys.has('s')||keys.has('arrowdown'))- +(keys.has('w')||keys.has('arrowup'));
 if(x||y){let n=Math.hypot(x,y);p.dir={x:x/n,y:y/n};move(p,p.dir.x*220*dt,p.dir.y*220*dt,12);discover()}
 if(keys.has('j'))attack(true);else if(keys.has(' '))attack();
 events.runDue(time);
 for(const e of enemies){
  if(!e.hp)continue;let d=dist(p,e),a=Math.atan2(p.y-e.y,p.x-e.x);
  e.flash=Math.max(0,e.flash-dt);e.dir=p.x<e.x?-1:1;
  if(!e.wind&&d<(e.boss?440:250)){
   if(clearPath(e,p,0))e.cd-=dt;
   if(e.cd<=0&&clearPath(e,p,0))prepareEnemyAttack(e,a);
   else if(d>(e.boss?113:49)||!clearPath(e,p,e.r*.65))pursue(e,dt);
  }
  if(d<e.r+14)hit();if(mode!=='play')return;
 }
 for(const b of shots){
  b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
  if(b.life<=0||solid(b.x,b.y,0)){b.life=0;continue}
  if(b.friendly){const e=enemies.find(e=>e.hp>0&&dist(b,e)<e.r+8);if(e){damage(e,b.dmg);b.life=0}}
  else if(dist(b,p)<18){hit();b.life=0}
  if(mode!=='play')return;
 }
 shots=shots.filter(b=>b.life>0);
 if(!protectedFrom(level)&&zonaActual().hazards.some(([x,y,rx,ry])=>((p.x-x)/rx)**2+((p.y-y)/ry)**2<1))hit();
 if(mode!=='play')return;
 if(drop&&dist(p,drop)<27){drop=null;p.key=true;tell('Llave recogida · Abre la jaula con E')}
 if(level>1&&p.hp<16&&!potion&&time>=potionAt)spawnPotion();
 if(potion&&dist(p,potion)<28){p.hp=Math.min(16,p.hp+4);potion=null;potionAt=time+16+rand()*7;tell('Poción: +2 corazones')}
 for(const f of fx){f.life-=dt;f.x+=(f.vx||0)*dt;f.y+=(f.vy||0)*dt}fx=fx.filter(f=>f.life>0);
 cx+=(clamp(p.x-W/2,0,MW-W)-cx)*Math.min(1,dt*7);cy+=(clamp(p.y-H/2,0,MH-H)-cy)*Math.min(1,dt*7);
}
function prepareEnemyAttack(enemy,angle){
 const {wind,spread,shotSpeed,recovery}=zonaActual().difficulty;
 enemy.wind=wind;enemy.aim=angle;
 events.add(time+enemy.wind,()=>{
  enemy.wind=0;
  if(!enemy.hp)return;
  for(const offset of enemy.boss?spread:[0]){
   const direction=angle+offset;
   shots.push({x:enemy.x,y:enemy.y,vx:Math.cos(direction)*shotSpeed,vy:Math.sin(direction)*shotSpeed,life:2.7,el:level});
  }
  enemy.cd=recovery+(enemy.boss?0:.47);
 });
}
function input(k){
 if(k==='p'){if(mode==='play')show('pause');else if(mode==='pause')show('play');return}
 if(k==='m'){mapOn=!mapOn;return}
 if(mode!=='play')return;
 if(k==='e')interact();
 if(k==='r'&&p.armors.length)equip('armor',p.armors[(p.armors.indexOf(p.armor)+1)%p.armors.length]);
 if(/^[1-5]$/.test(k))equip('weapon',+k-1);
 if(k==='z'||k==='y')replayEquipment(k==='y');
}

