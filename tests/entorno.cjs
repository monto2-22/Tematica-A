const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{})});
const make=()=>({children:[],dataset:{},style:{},setAttribute(){},replaceChildren(){this.children=[]},append(e){this.children.push(e)},focus(){},get firstChild(){return this.children[0]},get lastChild(){return this.children.at(-1)},set innerHTML(v){this.children=Array.from({length:5},make)},getContext(){return ctx}});
const elements=new Map();const sandbox={assert,document:{getElementById(id){if(!elements.has(id))elements.set(id,make());return elements.get(id)},createElement:make,querySelectorAll:()=>[]},window:{addEventListener(){}},requestAnimationFrame(){}};
vm.createContext(sandbox);
const scripts=[...fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8').matchAll(/<script src="([^"]+)"><\/script>/g)];
for(const path of scripts.map(match=>match[1])){
 vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'..',path),'utf8'),sandbox,{filename:path});
}
function run(name,code){
 vm.runInContext(code,sandbox,{filename:name});
 console.log('OK '+name);
}
const begin="start(1); Object.assign(p,chest); interact(); Object.assign(p,door); interact();";
module.exports={run,begin};
