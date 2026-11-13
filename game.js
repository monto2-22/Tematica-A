'use strict';
const $=id=>document.getElementById(id),cv=$('game'),W=900,H=540,MW=1260,MH=760;
let c=cv.getContext('2d');
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
const niveles=Object.freeze(Z.slice(1).map((theme,index)=>Object.freeze({
 theme, rocks:ROCKS[index+1], hazards:HAZ[index+1], difficulty:Object.freeze(dificultad[index])
})));
const superficie={theme:Z[0],rocks:ROCKS[0],hazards:HAZ[0]};
let nivelActual=-1;
const zonaActual=()=>nivelActual===-1?superficie:niveles[nivelActual];
const spawn={x:120,y:621},chest={x:334,y:544},door={x:1124,y:130},cage={x:1124,y:130};
const spots=[[387,398],[575,324],[786,452],[892,252],[538,122],[672,651],[945,452]];
const keys=new Set();let mode='menu',count=1,turn=0,results=[],p,level,enemies,shots,fx,seen,opened,drop,potion,potionAt,time=0,toast='',toastAt=0,mission='',near='',mapOn=true,cx=0,cy=0;
let seed=1;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const fresh=()=>({x:spawn.x,y:spawn.y,hp:16,lives:3,score:0,xp:0,weapons:[0],armors:[],weapon:0,armor:0,earned:new Set(),dir:{x:1,y:0},cd:0,inv:0,key:false});
// Turnos locales: el arreglo tiene exactamente una o dos posiciones por partida.
let players=[fresh()];
// Montículo mínimo: fecha de ejecución y orden de llegada para los empates.
class ColaPrioridad {
 constructor(){this.heap=[];this.sequence=0}
 static before(a,b){return a.at<b.at||(a.at===b.at&&a.order<b.order)}
 add(at,run){
  const event={at,run,order:this.sequence++},h=this.heap;
  let i=h.length;h.push(event);
  while(i>0){
   const parent=(i-1)>>1;
   if(!ColaPrioridad.before(event,h[parent]))break;
   h[i]=h[parent];i=parent;
  }
  h[i]=event;
 }
 take(){
  const h=this.heap,first=h[0],last=h.pop();
  if(!h.length)return first;
  let i=0;
  while(i*2+1<h.length){
   let child=i*2+1;
   if(child+1<h.length&&ColaPrioridad.before(h[child+1],h[child]))child++;
   if(!ColaPrioridad.before(h[child],last))break;
   h[i]=h[child];i=child;
  }
  h[i]=last;return first;
 }
 runDue(now){while(this.heap.length&&this.heap[0].at<=now)this.take().run()}
}
let events;
// Pilas LIFO de cambios manuales de equipamiento. No rebobinan el combate.
let pilaDeshacer=[],pilaRehacer=[];
function equip(slot,value){
 const items=slot==='weapon'?p.weapons:p.armors;
 if(!items.includes(value)||p[slot]===value)return;
 pilaDeshacer.push({slot,before:p[slot],after:value});
 pilaRehacer.length=0;p[slot]=value;
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
 matrizDispersa=new Map();
 for(const rock of zonaActual().rocks){
  const [x,y,r]=rock,reach=r+MAX_RADIUS;
  for(let row=Math.floor((y-reach)/CELL);row<=Math.floor((y+reach)/CELL);row++){
   for(let col=Math.max(0,Math.floor((x-reach)/CELL));col<=Math.min(Math.ceil(MW/CELL)-1,Math.floor((x+reach)/CELL));col++){
    const key=cellKey(col,row);
    if(!matrizDispersa.has(key))matrizDispersa.set(key,[]);
    matrizDispersa.get(key).push(rock);
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
   const nextCost=cost+CELL+(solid(neighbor.x,neighbor.y,30)?CELL*.5:0);
   if(nextCost>=(costs.get(neighbor)??Infinity))continue;
   costs.set(neighbor,nextCost);
   previous.set(neighbor,node);
   frontier.add(nextCost,neighbor);
  }
 }
 return [];
}
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
 enemies=n?spots.slice(0,zonaActual().difficulty.minions).map(([x,y],i)=>foe(x,y,i,false)).concat(foe(1082,266,99,true)):[];
 events=new ColaPrioridad();
 pilaDeshacer=[];pilaRehacer=[];
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
 players=Array.from({length:n},fresh);Object.seal(players);
 count=players.length;turn=0;results=new Array(count);p=players[turn];load(0);show('play');
}
function tell(s){toast=s;toastAt=time+3.3}
function show(s){
 mode=s;keys.clear();$('overlay').hidden=s==='play';
 const entries={
 menu:['Aventura 2D','WorldCave','Los cuatro elementos','Desciende por cuatro cuevas, domina sus elementos y libera a la princesa.',[['1 jugador',()=>start(1)],['2 por turnos',()=>start(2)]]],
 pause:['Expedición en pausa','Pausa','','Agua vence a Fuego, Tierra a Agua, Viento a Tierra y Fuego a Viento.',[['Continuar',()=>show('play')],['Volver al menú',menu]]],
 retry:['Punto de control','Has caído','','Te quedan '+p.lives+' '+(p.lives===1?'vida':'vidas')+'. Reintenta esta zona con ocho corazones.',[['Reintentar',()=>{p.hp=16;load(level);show('play')}]]],
 handoff:['Fin del primer turno','Jugador 2','','Jugador 1: '+(results[0]?.score??0)+' puntos. Ahora empieza tu aventura desde la superficie.',[['Iniciar turno',()=>{turn=1;p=players[turn];load(0);show('play')}]]],
 end:[count===2?'Resultados finales':'Fin de la aventura',results.some(r=>r.win)?'¡Princesa rescatada!':'Expedición terminada','',results.map((r,i)=>'Jugador '+(i+1)+': '+r.score+' puntos · '+(r.win?'rescate completado':'sin vidas')).join('\n'),[['Volver al menú',menu]]]
 };
 if(s!=='play'){
  const [label,title,sub,body,actions]=entries[s],d=$('dialog');
  d.innerHTML='<div class="eyebrow"></div><h1></h1><div class="subtitle"></div><p style="white-space:pre-line"></p><div class="actions"></div>';
  [label,title,sub,body].forEach((v,i)=>d.children[i].textContent=v);
  actions.forEach(([name,fn],i)=>{const b=document.createElement('button');b.textContent=name;if(!i)b.className='primary';b.onclick=fn;d.lastChild.append(b)});
  d.lastChild.firstChild.focus({preventScroll:true});
 }else document.activeElement?.blur();
 hud();
}
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
 if(!level&&!opened&&dist(p,chest)<67){opened=true;p.weapons.push(2);p.armors.push(1);p.weapon=2;p.armor=1;pilaDeshacer=[];pilaRehacer=[];tell('Varita de Agua y armadura de Fuego equipadas');return}
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
 if(!p.earned.has(id)){p.earned.add(id);p.score+=e.boss?250:50;p.xp+=e.boss?100:30}
 if(!e.boss)return;
 if(!p.weapons.includes(level))p.weapons.push(level);
 const next=level%4+1;if(!p.armors.includes(next))p.armors.push(next);
 if(level===4){drop={x:e.x,y:e.y};tell('¡Guardián vencido! Recoge la llave dorada')}
 else {p.armor=next;pilaDeshacer=[];pilaRehacer=[];tell('Arma de '+ELEM[level]+' obtenida · Descenso abierto')}
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
const bound=['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright',' ','j','e','r','m','p','z','y','1','2','3','4','5'];
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(!bound.includes(k)||(!['play','pause'].includes(mode)))return;e.preventDefault();keys.add(k);if(!e.repeat)input(k)});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();if(mode==='play')show('pause')});
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(mode==='play'){keys.add(k);input(k)}};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(k)});
$('map').onclick=()=>input('m');$('pause').onclick=()=>input('p');
$('undo').onclick=()=>input('z');$('redo').onclick=()=>input('y');
function hud(){
 $('area').textContent=level?'Cueva 0'+level+' · '+Z[level][0]:'Capítulo 00 · Superficie';$('name').textContent=Z[level][1];
 $('player').textContent=count===2?'Jugador '+(turn+1)+' de 2':'Expedición individual';
 $('hearts').setAttribute('aria-label',p.hp/2+' de 8 corazones');
 $('hearts').innerHTML=Array.from({length:8},(_,i)=>'<span class="heart" aria-hidden="true">♥<i style="width:'+clamp((p.hp-i*2)*50,0,100)+'%">♥</i></span>').join('');
 $('lives').textContent='Vidas: '+p.lives+' / 3';$('score').textContent=p.score+' puntos';$('rank').textContent='Héroe nivel '+heroLevel()+' · '+p.xp+' XP';$('xp').style.width=(p.xp%80/80*100)+'%';
 $('armor').textContent='Armadura: '+(p.armor?ELEM[p.armor]:'ninguna')+(p.key?' · Llave obtenida':'');
 const stamp=p.weapons.join()+':'+p.weapon+'|'+p.armors.join()+':'+p.armor;
 if($('weapons').dataset.stamp!==stamp){
  $('weapons').dataset.stamp=stamp;
  for(const [id,list,equipped,kind] of [['weapons',p.weapons,p.weapon,'weapon'],['armorList',p.armors,p.armor,'armor']]){
   const box=$(id);box.replaceChildren();[...list].sort().forEach(el=>{const b=document.createElement('button');b.textContent=ELEM[el];b.className=el===equipped?'on':'';b.setAttribute('aria-pressed',el===equipped);b.onclick=()=>{if(mode==='play')equip(kind,el)};box.append(b)});
  }
 }
 mission=!level?(!opened?'Busca el cofre al este del campamento.':'Ve a la entrada de la cueva, al noreste.'):bossAlive()?'Derrota al guardián de '+Z[level][0]+'.':level<4?'Entra por el portal del noreste.':p.key?'Abre la jaula al noreste.':'Recoge la llave dorada.';
 near=!level&&!opened&&dist(p,chest)<67?'E · Abrir cofre':dist(p,door)<68?'E · '+(!level?'Entrar a la cueva':level===4?'Abrir jaula':'Descender'):'';
 $('mission').textContent=mission;$('hint').textContent=(time<toastAt&&toast?toast:near)||(level&&bossAlive()?'Debilidad: '+ELEM[WEAK[level]]:'');
}
function ellipse(x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill()}
function line(points,color,w=2){c.strokeStyle=color;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()}
function poly(points,color,stroke){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke()}}
function label(s,x,y,color='#fff1d5',size=13){c.font='bold '+size+'px system-ui';c.textAlign='center';c.fillStyle='#12111c';c.fillText(s,x+1,y+2);c.fillStyle=color;c.fillText(s,x,y)}
const terrain=document.createElement('canvas');terrain.width=MW;terrain.height=MH;let rendered=-1;
function paintTerrain(){
 const z=zonaActual().theme;c.fillStyle=z[2];c.fillRect(0,0,MW,MH);
 const hash=i=>{const a=Math.sin(i*127.1+level*311.7)*43758.5453;return a-Math.floor(a)};
 for(let j=0;j<28;j++)for(let i=0;i<45;i++){
  let k=j*45+i,x=i*29+hash(k)*13,y=j*29+hash(k+70)*12;
  ellipse(x,y,4+hash(k+9)*16,2+hash(k+10)*6,k%3===0?z[3]:k%2?'#ffffff08':'#00000012');
  if(k%5===0)line([[x-3,y+3],[x,y],[x+5,y-1]],'#ffffff14',1);
 }
 const path=[[93,652],[255,546],[435,544],[630,429],[800,365],[1010,300],[1140,150]];
 line(path,'#08081026',84);line(path,z[3],62);line(path,'#ffffff09',44);
 for(let x=0;x<=MW;x+=32)for(const y of [15,MH-15])rock(x,y,26+hash(x+y)*18,true);
 for(let y=20;y<MH;y+=32)for(const x of [16,MW-16])rock(x,y,24+hash(x+y)*17,true);
 for(const [x,y,r] of zonaActual().rocks)rock(x,y,r,false);
 for(let i=0;i<44;i++){
  let x=65+hash(i+2400)*(MW-130),y=63+hash(i+900)*(MH-126);
  if(solid(x,y,15)||zonaActual().hazards.some(([a,b,rx,ry])=>Math.hypot((x-a)/rx,(y-b)/ry)<1.3))continue;
  if(level===0){line([[x,y+3],[x-4,y-5],[x,y],[x+5,y-6]],'#8bb47d88',2);if(i%3===0)ellipse(x+5,y-6,2,2,'#ffc479')}
  else{line([[x-7,y+5],[x,y],[x+9,y+3]],z[3],3);if(i%3===0)ellipse(x,y,2,2,z[4])}
 }
}
function rock(x,y,r,edge){
 const z=Z[level];ellipse(x,y+r*.39,r*1.05,r*.72,'#08081259');
 const p=[[x-r,y+r*.28],[x-r*.84,y-r*.55],[x-r*.34,y-r*.98],[x+r*.38,y-r*.88],[x+r*.86,y-r*.41],[x+r,y+r*.19],[x+r*.61,y+r*.75],[x-r*.38,y+r*.82]];
 if(level===0&&!edge){
  ellipse(x,y+r*.35,r,r*.66,'#182b27');for(let i=0;i<3;i++){const dx=(i-1)*r*.47,dy=i===1?-r*.28:r*.15;
   c.fillStyle='#372b27';c.fillRect(x+dx-5,y+dy,10,r*.63);
   for(let j=0;j<3;j++){let t=y+dy-r*.72+j*r*.26;poly([[x+dx,t-r*.25],[x+dx-r*(.32+j*.085),t+r*.33],[x+dx+r*(.32+j*.085),t+r*.32]],['#51806a','#3e6958','#305a4b'][j],'#1b4036')}
  }return;
 }
 poly(p,edge?'#171722':z[3],'#161622');poly([p[1],p[2],p[3],p[4],[x+r*.36,y-r*.34],[x-r*.48,y-r*.25]],edge?z[2]:z[3]);
 poly([p[0],p[1],[x-r*.48,y-r*.25],[x-r*.28,y+r*.23],p[7]],'#0908174d');
 poly([p[5],p[6],p[7],[x-r*.28,y+r*.23],[x+r*.36,y+r*.17]],'#09081763');
 line([[x-r*.48,y-r*.25],[x-r*.11,y-r*.52],[x+r*.36,y-r*.34]],'#ffffff19',3);
 if(!edge)for(let i=0;i<3;i++){let a=x+(i-1)*r*.2,b=y-r*.18+i*r*.07;poly([[a-6,b+8],[a-4,b-8-i*2],[a+1,b-15-i*2],[a+7,b-2],[a+5,b+8]],z[4]+'a0');line([[a,b-8],[a,b+4]],'#ffffff87',1)}
}
// El escenario estático se guarda en una segunda capa; solo se redibuja al cambiar de zona.
function cacheTerrain(){
 if(rendered===level)return;
 const screen=c;c=terrain.getContext('2d');paintTerrain();c=screen;rendered=level;
}
function hazard(x,y,rx,ry){
 const tint=COL[level];ellipse(x,y,rx+6,ry+5,'#100e1c86');ellipse(x,y,rx,ry,tint+'78');ellipse(x,y,rx*.88,ry*.85,tint+'25');
 for(let i=0;i<6;i++){const a=i*1.07+time*.65;let px=x+Math.cos(a)*rx*.67,py=y+Math.sin(a*1.7)*ry*.58;line([[px-10,py+2],[px,py],[px+12,py-2]],tint+'b0',level===1?3:2)}
}
function gate(){
 const {x,y}=door,locked=level&&bossAlive();
 if(level===4){
  ellipse(x,y+19,41,23,'#120e21aa');
  actor({x,y:y+1,dir:-1},false,'#ff98c5',false,1);
  c.strokeStyle=locked?'#c5b4d5':'#f3cb86';c.lineWidth=4;c.beginPath();c.moveTo(x-29,y+20);c.lineTo(x-29,y-21);c.quadraticCurveTo(x,y-61,x+29,y-21);c.lineTo(x+29,y+20);c.closePath();c.stroke();
  for(let i=-20;i<=20;i+=10)line([[x+i,y-33+Math.abs(i)*.35],[x+i,y+19]],'#d6b4dc',2);
  label('JAULA',x,y-52);return;
 }
 ellipse(x,y+17,51,23,'#100e19ab');
 for(let i=5;i>=0;i--){let w=34+i*3,h=48+i*2;c.beginPath();c.moveTo(x-w,y+19);c.lineTo(x-w,y-5);c.quadraticCurveTo(x-w,y-h,x,y-h);c.quadraticCurveTo(x+w,y-h,x+w,y-5);c.lineTo(x+w,y+19);c.closePath();c.fillStyle=i===0?(locked?'#241f2a':'#141427'):i%2?'#423d4a':'#615164';c.fill()}
 if(!locked){for(let i=0;i<5;i++){let a=time*1.3+i*2.4;ellipse(x+Math.sin(a)*23,y-12+Math.cos(a*1.17)*25,2,2,Z[level][4])}}
 else line([[x-25,y-7],[x+24,y+11],[x+24,y-7],[x-25,y+11]],'#b5959b',3);
 label(level?(locked?'SELLADO':'DESCENSO'):'ENTRADA',x,y-68,locked?'#d9bac1':'#fff0b4');
}
function box(){
 const {x,y}=chest;ellipse(x,y+8,25,12,'#16121d88');c.fillStyle='#794631';c.fillRect(x-19,y-8,38,24);
 c.fillStyle='#c98248';c.fillRect(x-19,y-(opened?20:14),38,10);c.fillStyle='#eec879';c.fillRect(x-13,y-14,4,29);c.fillRect(x+9,y-14,4,29);c.fillRect(x-3,y-4,6,7);
 if(!opened){ellipse(x,y-24+Math.sin(time*4)*3,3,3,'#ffe0a0');label('COFRE',x,y-37)}
}
function actor(e,hero,tint,boss,scale){
 const x=e.x,y=e.y,d=hero?(e.dir.x<0?-1:1):e.dir,walk=hero&&[...keys].some(k=>k.startsWith('arrow')||'wasd'.includes(k));
 c.save();c.translate(x,y);c.scale(d*scale,scale);
 ellipse(0,12,hero?15:17,7,'#0d0d1799');if(hero&&p.inv>0)c.globalAlpha=.5+.5*Math.abs(Math.sin(time*25));
 const stride=walk?Math.sin(time*18)*4:0;
 line([[-6,4],[-7-stride,11]],'#1a1729',6);line([[6,4],[7+stride,11]],'#1a1729',6);
 poly([[-9,-10],[-16,8],[-6,10],[6,5],[8,-10]],hero?'#b66050':tint+'85','#191526');
 poly([[-9,-13],[8,-13],[13,-4],[8,6],[-9,6],[-12,-4]],hero?'#46627a':'#342b42','#191526');
 line([[-7,3],[7,3]],tint,3);
 ellipse(0,-16,10,11,hero?'#eed5b6':tint);poly([[-11,-15],[-10,-24],[-1,-29],[8,-25],[11,-16],[2,-19],[-5,-15]],hero?'#607b91':'#242034','#161524');
 if(boss){poly([[-9,-21],[-15,-36],[-4,-27]],tint);poly([[7,-21],[14,-36],[3,-27]],tint);ellipse(0,-23,3,3,'#fff1ba')}
 ellipse(4,-16,2,1.6,hero?'#332337':'#fff2b4');
 if(hero){line([[11,0],[20,-13]],'#f9e9c6',3);ellipse(20,-13,3,3,COL[p.weapon])}
 c.restore();
}
function item(q,type){
 const yy=q.y+Math.sin(time*5)*4;ellipse(q.x,q.y+9,12,5,'#15122188');
 if(type==='key'){c.strokeStyle='#ffd66c';c.lineWidth=3;c.beginPath();c.arc(q.x-6,yy,5,0,7);c.stroke();line([[q.x-1,yy],[q.x+11,yy],[q.x+11,yy+4]],'#ffd66c',3);label('LLAVE',q.x,yy-14)}
 else{ellipse(q.x,yy+2,8,9,'#f76c95');ellipse(q.x-2,yy,2,4,'#ffc2d1');line([[q.x-3,yy-8],[q.x+3,yy-8]],'#ffdfa0',4);label('POCIÓN',q.x,yy-14)}
}
function mini(){
 const x=W-169,y=15,s=.12;
 c.fillStyle='#151522eb';c.fillRect(x-7,y-6,164,111);c.strokeStyle='#8c789688';c.lineWidth=1;c.strokeRect(x-7,y-6,164,111);
 for(const q of seen){const [a,b]=q.split(',').map(Number);c.fillStyle='#857894';c.fillRect(x+a*70*s,y+b*70*s,70*s-1,70*s-1)}
 ellipse(x+p.x*s,y+p.y*s,3.5,3.5,'#ffda93');
}
function draw(){
 cacheTerrain();
 c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.save();c.translate(-cx,-cy);c.drawImage(terrain,0,0);
 for(const h of zonaActual().hazards)hazard(...h);
 if(!level){box();ellipse(spawn.x,spawn.y+40,19,10,'#211c26');ellipse(spawn.x,spawn.y+34,8,10,'#ffb06b');ellipse(spawn.x,spawn.y+38,4,6,'#ffeb8a')}
 gate();
 for(const e of enemies)if(!e.hp)ellipse(e.x,e.y,10,5,COL[level]+'45');
 if(drop)item(drop,'key');if(potion)item(potion,'potion');
 for(const e of [...enemies.filter(e=>e.hp),p].sort((a,b)=>a.y-b.y)){
  if(e===p){actor(e,true,p.armor?COL[p.armor]:'#f5dfad',false,1);continue}
  if(e.wind>0){ellipse(e.x,e.y+11,e.r+10,e.r*.59,COL[level]+'75');line([[e.x,e.y],[e.x+Math.cos(e.aim)*103,e.y+Math.sin(e.aim)*103]],COL[level]+'77',2)}
  actor(e,false,e.flash?'#fff1dc':COL[level],e.boss,e.boss?1.65:.91);
  if(e.boss||e.hp<e.max){const w=e.boss?83:31,y=e.y-(e.boss?68:33);c.fillStyle='#111018';c.fillRect(e.x-w/2,y,w,5);c.fillStyle=COL[level];c.fillRect(e.x-w/2,y,w*e.hp/e.max,5);if(e.boss)label('GUARDIÁN DE '+Z[level][0].toUpperCase(),e.x,y-7,COL[level],11)}
 }
 for(const b of shots){const tint=COL[b.el];line([[b.x-b.vx*.034,b.y-b.vy*.034],[b.x,b.y]],tint+'77',b.friendly?6:4);ellipse(b.x,b.y,b.friendly?6:5,b.friendly?6:5,tint);ellipse(b.x,b.y,2,2,'#fff1dc')}
 for(const f of fx){c.globalAlpha=Math.min(1,f.life/f.max*2);if(f.arc!==undefined){c.beginPath();c.arc(f.x,f.y,39,f.arc-1,f.arc+1);c.strokeStyle='#ffebbf';c.lineWidth=5;c.stroke()}else ellipse(f.x,f.y,2.5,2.5,f.color)}c.globalAlpha=1;
 if(mode==='play'&&near)label(near,p.x,p.y-42);
 c.restore();
 const shade=c.createRadialGradient(W/2,H/2,135,W/2,H/2,W*.66);shade.addColorStop(0,'#100b1a00');shade.addColorStop(1,'#08071388');c.fillStyle=shade;c.fillRect(0,0,W,H);
 if(mapOn&&mode!=='menu')mini();
}
let last=0,lastHud=-1;
function frame(ms){const dt=Math.min(.034,(ms-last)/1000);last=ms;if(mode==='play')tick(dt);if(ms-lastHud>100){hud();lastHud=ms}draw();requestAnimationFrame(frame)}
menu();requestAnimationFrame(frame);
