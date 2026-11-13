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
const spawn={x:120,y:621},chest={x:334,y:544},door={x:1124,y:130},cage={x:1124,y:130};
const spots=[[387,398],[575,324],[786,452],[892,252],[538,122],[672,651],[945,452]];
const keys=new Set();let mode='menu',count=1,turn=0,results=[],p,level,enemies,shots,fx,seen,opened,drop,potion,potionAt,time=0,toast='',toastAt=0,mission='',near='',mapOn=true,cx=0,cy=0;
let seed=1;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const fresh=()=>({x:spawn.x,y:spawn.y,hp:16,lives:3,score:0,xp:0,weapons:[0],armors:[],weapon:0,armor:0,earned:new Set(),dir:{x:1,y:0},cd:0,inv:0,key:false});
function load(n){
 level=n;Object.assign(p,spawn,{dir:{x:1,y:0},key:false,cd:0,inv:0});opened=n>0;drop=null;potion=null;potionAt=time+8;shots=[];fx=[];seen=new Set();toast='';near='';
 enemies=n?spots.slice(0,n+3).map(([x,y],i)=>foe(x,y,i,false)).concat(foe(1082,266,99,true)):[];
 cx=0;cy=MH-H;discover();
}
function foe(x,y,id,boss){const max=boss?85+level*24:25+level*8;return{x,y,id,boss,max,hp:max,r:boss?30:15,cd:.9+id%4*.32,wind:0,dir:1,flash:0};}
function start(n){count=n;turn=0;results=[];p=fresh();load(0);show('play');}
function tell(s){toast=s;toastAt=time+3.3}
function show(s){
 mode=s;keys.clear();$('overlay').hidden=s==='play';
 const entries={
 menu:['Aventura 2D','WorldCave','Los cuatro elementos','Desciende por cuatro cuevas, domina sus elementos y libera a la princesa.',[['1 jugador',()=>start(1)],['2 por turnos',()=>start(2)]]],
 pause:['Expedición en pausa','Pausa','','Agua vence a Fuego, Tierra a Agua, Viento a Tierra y Fuego a Viento.',[['Continuar',()=>show('play')],['Volver al menú',menu]]],
 retry:['Punto de control','Has caído','','Te quedan '+p.lives+' '+(p.lives===1?'vida':'vidas')+'. Reintenta esta zona con ocho corazones.',[['Reintentar',()=>{p.hp=16;load(level);show('play')}]]],
 handoff:['Fin del primer turno','Jugador 2','','Jugador 1: '+(results[0]?.score??0)+' puntos. Ahora empieza tu aventura desde la superficie.',[['Iniciar turno',()=>{turn=1;p=fresh();load(0);show('play')}]]],
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
function menu(){p=fresh();load(0);show('menu')}
function finish(win){results.push({win,score:p.score});show(count===2&&turn===0?'handoff':'end')}
function hit(){if(p.inv>0||mode!=='play')return;p.hp--;p.inv=.72;sparks(p.x,p.y,'#ff7891',10);if(!p.hp){p.lives--;if(p.lives)show('retry');else finish(false)}}
const bossAlive=()=>enemies.some(e=>e.boss&&e.hp>0);
function interact(){
 if(!level&&!opened&&dist(p,chest)<67){opened=true;p.weapons.push(2);p.armors.push(1);p.weapon=2;p.armor=1;tell('Varita de Agua y armadura de Fuego equipadas');return}
 if(dist(p,door)>68)return;
 if(!level){if(!opened){tell('Busca primero el cofre de la superficie');return}load(1);return}
 if(bossAlive()){tell('Derrota al guardián de '+Z[level][0]);return}
 if(level<4){load(level+1);return}
 if(p.key)finish(true);else tell('Recoge la llave que dejó el guardián');
}
function award(e){
 const id=level+':'+e.id;
 if(!p.earned.has(id)){p.earned.add(id);p.score+=e.boss?250:50;p.xp+=e.boss?100:30}
 if(!e.boss)return;
 if(!p.weapons.includes(level))p.weapons.push(level);
 const next=level%4+1;if(!p.armors.includes(next))p.armors.push(next);
 if(level===4){drop={x:e.x,y:e.y};tell('¡Guardián vencido! Recoge la llave dorada')}
 else {p.armor=next;tell('Arma de '+ELEM[level]+' obtenida · Descenso abierto')}
}
function damage(e,d){if(e.hp<=0)return;e.hp=Math.max(0,e.hp-d);e.flash=.12;sparks(e.x,e.y,COL[level],e.hp?5:17);if(!e.hp)award(e)}
function attack(sword=false){
 if(!level||p.cd>0)return;
 const el=sword?0:p.weapon,boost=Math.floor(p.xp/160)*2;
 p.cd=el?.36:.31;
 let target=null,best=el?300:77;
 for(const e of enemies){if(e.hp<=0)continue;const d=dist(p,e),facing=((e.x-p.x)*p.dir.x+(e.y-p.y)*p.dir.y)/(d||1);if(d<best&&(facing>-.23||d<45)){target=e;best=d}}
 const dx=target?target.x-p.x:p.dir.x,dy=target?target.y-p.y:p.dir.y,l=Math.hypot(dx,dy)||1;
 if(el){shots.push({x:p.x+dx/l*18,y:p.y+dy/l*18,vx:dx/l*480,vy:dy/l*480,life:.78,el,friendly:true,dmg:(el===WEAK[level]?24:13)+boost})}
 else {fx.push({x:p.x,y:p.y,life:.16,max:.16,el:0,arc:Math.atan2(dy,dx)});if(target)damage(target,19+boost)}
}
function solid(x,y,r=12){return x<50+r||x>MW-50-r||y<47+r||y>MH-47-r||ROCKS[level].some(([a,b,k])=>Math.hypot(x-a,y-b)<k+r)}
function move(o,dx,dy,r){if(!solid(o.x+dx,o.y,r))o.x+=dx;if(!solid(o.x,o.y+dy,r))o.y+=dy}
function discover(){const x=Math.floor(p.x/70),y=Math.floor(p.y/70);seen.add(x+','+y)}
function spawnPotion(){
 for(let i=0;i<38;i++){let a=rand()*6.283,r=65+rand()*120,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;
 if(!solid(x,y,15)&&!HAZ[level].some(([a,b,w,h])=>((x-a)/w)**2+((y-b)/h)**2<1.2)&&!enemies.some(e=>e.hp&&dist(e,{x,y})<100)){
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
 for(const e of enemies){
  if(!e.hp)continue;let d=dist(p,e),a=Math.atan2(p.y-e.y,p.x-e.x);
  e.flash=Math.max(0,e.flash-dt);e.dir=p.x<e.x?-1:1;
  if(e.wind>0){e.wind-=dt;if(e.wind<=0){const spread=e.boss?[-.24,0,.24]:[0],v=145+level*28;
   spread.forEach(offset=>shots.push({x:e.x,y:e.y,vx:Math.cos(e.aim+offset)*v,vy:Math.sin(e.aim+offset)*v,life:2.7,el:level}));e.cd=(e.boss?1.65:2.12)-level*.16;}}
  else if(d<(e.boss?440:250)){
   e.cd-=dt;if(e.cd<=0){e.wind=.63-level*.075;e.aim=a}
   else if(d>(e.boss?113:49))move(e,Math.cos(a)*(43+level*9)*dt,Math.sin(a)*(43+level*9)*dt,e.r*.65);
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
 if(p.armor!==level&&HAZ[level].some(([x,y,rx,ry])=>((p.x-x)/rx)**2+((p.y-y)/ry)**2<1))hit();
 if(mode!=='play')return;
 if(drop&&dist(p,drop)<27){drop=null;p.key=true;tell('Llave recogida · Abre la jaula con E')}
 if(level>1&&p.hp<16&&!potion&&time>=potionAt)spawnPotion();
 if(potion&&dist(p,potion)<28){p.hp=Math.min(16,p.hp+4);potion=null;potionAt=time+16+rand()*7;tell('Poción: +2 corazones')}
}
function input(k){
 if(k==='p'){if(mode==='play')show('pause');else if(mode==='pause')show('play');return}
 if(k==='m'){mapOn=!mapOn;return}
 if(mode!=='play')return;
 if(k==='e')interact();
 if(k==='r'&&p.armors.length)p.armor=p.armors[(p.armors.indexOf(p.armor)+1)%p.armors.length];
 if(/^[1-5]$/.test(k)&&p.weapons.includes(+k-1))p.weapon=+k-1;
}
const bound=['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright',' ','j','e','r','m','p','1','2','3','4','5'];
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(!bound.includes(k)||(!['play','pause'].includes(mode)))return;e.preventDefault();keys.add(k);if(!e.repeat)input(k)});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();if(mode==='play')show('pause')});
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(mode==='play'){keys.add(k);input(k)}};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(k)});
$('map').onclick=()=>input('m');$('pause').onclick=()=>input('p');
