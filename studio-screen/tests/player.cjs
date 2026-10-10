const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = __dirname + '/../';
const base = JSON.parse(fs.readFileSync(root+'playlist.json'));
const photos = JSON.parse(fs.readFileSync(root+'photos.json'));
const journal = JSON.parse(fs.readFileSync(root+'journal.json'));
const features = JSON.parse(fs.readFileSync(root+'journal-features.json'));
class Element {
  constructor(tag) { this.tag=tag; this.children=[]; this.style={}; this.classList={add(){},remove(){}}; this.clientWidth=1920; this.clientHeight=1080; }
  append(...children) { this.children.push(...children); }
  get lastElementChild(){return this.children.at(-1);}
  setAttribute(){} remove(){} 
}
async function scenario(register, qrAvailable = true) {
 const elements = Object.fromEntries(['#stage','#status','#previous','#next','#pause','#fullscreen','main'].map(s=>[s,new Element(s)]));
 let photoData = photos; let featureData = features; let fetches=0; let brokenImages=false;
 const context=vm.createContext({
  document:{querySelector:s=>elements[s],createElement:t=>new Element(t),createElementNS:(ns,t)=>new Element(t),createTextNode:t=>t,addEventListener(){},body:new Element('body')},
  navigator:{serviceWorker:{register,ready:new Promise(()=>{})}}, location:{href:'http://localhost:8087/studio-screen/',origin:'http://localhost:8087'},
  localStorage:{getItem:()=>null,setItem(){}},URL,AbortSignal,Promise,console,
  setTimeout:()=>1,clearTimeout(){},setInterval(){},addEventListener(){},requestAnimationFrame:f=>f(),
  Image:class {set src(v){queueMicrotask(()=>brokenImages && v.startsWith('journal-images/') ? this.onerror() : this.onload());}},
  qrcode:qrAvailable ? require(root+'vendor/qrcode.js') : undefined,
  fetch:async url=>{fetches++;return {ok:true,json:async()=>url==='playlist.json'?base:url==='photos.json'?photoData:url==='journal-features.json'?featureData:journal};}
 });
 vm.runInContext(fs.readFileSync(root+'player.js','utf8'),context);
 for(let i=0;i<30;i++)await Promise.resolve();
 assert.equal(vm.runInContext('playlist.slides.length',context),11,'startup must load without serviceWorker.ready');
 assert.ok(fetches>=4);
 const order=JSON.parse(vm.runInContext('JSON.stringify(playlist.slides)',context));
 for(let i=0;i<order.length;i++)if(order[i].source){assert.equal(order[i-1].type,'image');assert.ok(order[i].image);assert.ok(order[i].excerpt);}
 photoData={version:'no-photos',slides:[]};
 await vm.runInContext('refresh()',context);
 assert.equal(vm.runInContext('pending.slides.length',context),10,'empty photo source removes selected photograph');
 vm.runInContext('position=playlist.slides.length-1; advance(1)',context);
 assert.equal(vm.runInContext('playlist.slides.length',context),10);
 assert.equal(vm.runInContext('position',context),0);
 photoData={version:'bad',slides:[{type:'image',duration:18,image:'https://other.example/photo.jpg',alt:'Invalid',title:'Bad'}]};
 await vm.runInContext('refresh()',context);
 assert.equal(vm.runInContext('pending',context),null,'malformed photos must not replace rotation');
 assert.equal(vm.runInContext(`enrichJournal({version:'new',slides:[{type:'statement',duration:20,title:'New article',source:'https://gardenerandson.substack.com/p/new-article'}]}, ${JSON.stringify(features)}).slides[0].image`,context),undefined);
 assert.throws(()=>vm.runInContext(`validate({version:'x',slides:[]})`,context));
 assert.throws(()=>vm.runInContext(`validate({version:'x',slides:[{type:'statement',duration:20,title:'X',source:'https://evil.example/p/x'}]})`,context));
 brokenImages=true;
 photoData={version:'retry-images',slides:[]};
 await vm.runInContext('refresh()',context);
 assert.equal(vm.runInContext('pending',context),null,'unavailable post image must retain saved rotation');
 brokenImages=false;
 featureData={version:'bad-feature',articles:[{...features.articles[0],excerpt:'x'.repeat(181)}]};
 await vm.runInContext('refresh()',context);
 assert.equal(vm.runInContext('pending',context),null,'oversized quote must retain saved rotation');
 const slide=vm.runInContext('playlist.slides.findIndex(s=>s.source)',context);
 vm.runInContext(`position=${slide};render()`,context);
 assert.ok(elements['#stage'].lastElementChild.children.some(e=>e.className==='journal-link'),'article link renders');
}
(async()=>{
 await scenario(()=>Promise.resolve({}));
 await scenario(()=>Promise.reject(Error('offline cache failed')));
 await scenario(()=>new Promise(()=>{}));
 await scenario(()=>Promise.resolve({}),false);
 console.log('PASS: cache startup, empty photos, featured quotes/images, interleaving, boundary updates, invalid content and missing-image retention, link fallback');
})().catch(e=>{console.error(e);process.exitCode=1});
