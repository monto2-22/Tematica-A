'use strict';

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
