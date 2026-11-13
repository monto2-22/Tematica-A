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
function solid(x,y,r=12){return x<50+r||x>MW-50-r||y<47+r||y>MH-47-r||ROCKS[level].some(([a,b,k])=>Math.hypot(x-a,y-b)<k+r)}
function move(o,dx,dy,r){if(!solid(o.x+dx,o.y,r))o.x+=dx;if(!solid(o.x,o.y+dy,r))o.y+=dy}
function discover(){const x=Math.floor(p.x/70),y=Math.floor(p.y/70);seen.add(x+','+y)}
function tick(dt){
 time+=dt;p.cd=Math.max(0,p.cd-dt);p.inv=Math.max(0,p.inv-dt);
 let x=+(keys.has('d')||keys.has('arrowright'))- +(keys.has('a')||keys.has('arrowleft')),
 y=+(keys.has('s')||keys.has('arrowdown'))- +(keys.has('w')||keys.has('arrowup'));
 if(x||y){let n=Math.hypot(x,y);p.dir={x:x/n,y:y/n};move(p,p.dir.x*220*dt,p.dir.y*220*dt,12);discover()}
}
