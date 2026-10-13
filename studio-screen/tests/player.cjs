const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=__dirname+'/../';
const base=JSON.parse(fs.readFileSync(root+'playlist.json'));
const photos=JSON.parse(fs.readFileSync(root+'photos.json'));
const journal=JSON.parse(fs.readFileSync(root+'journal.json'));
class Element {
 constructor(tag){this.tag=tag;this.children=[];this.style={};this.classList={add(){},remove(){}};this.clientWidth=1920;this.clientHeight=1080;}
 append(...children){this.children.push(...children);}get lastElementChild(){return this.children.at(-1);}setAttribute(){}remove(){}
}
const hasSvg=el=>el?.tag==='svg'||(el?.children||[]).some(hasSvg);
async function scenario(register,saved=null,online=true){
 const elements=Object.fromEntries(['#stage','#status','#previous','#next','#pause','#fullscreen','main'].map(s=>[s,new Element(s)]));
 let photoData=photos,brokenImages=false;const requested=[];
 const context=vm.createContext({document:{querySelector:s=>elements[s],createElement:t=>new Element(t),createTextNode:t=>t,addEventListener(){},body:new Element('body')},navigator:{serviceWorker:{register,ready:new Promise(()=>{})}},location:{href:'http://localhost:8087/studio-screen/',origin:'http://localhost:8087'},localStorage:{getItem:()=>saved,setItem(){}},URL,AbortSignal,Promise,console,setTimeout:()=>1,clearTimeout(){},setInterval(){},addEventListener(){},requestAnimationFrame:f=>f(),Image:class{set src(v){queueMicrotask(()=>brokenImages&&v==='../images/natasha-tyson.webp'?this.onerror():this.onload());}},fetch:async url=>{requested.push(url);if(!online)throw Error('Offline');return{ok:true,json:async()=>url==='playlist.json'?base:photoData};}});
 vm.runInContext(fs.readFileSync(root+'website-slides.js','utf8'),context);
 vm.runInContext(fs.readFileSync(root+'player.js','utf8'),context);
 for(let i=0;i<40;i++)await Promise.resolve();
 assert.equal(vm.runInContext('playlist.slides.length',context),base.slides.length+photos.slides.length);
 assert.equal(vm.runInContext('playlist.slides.some(s=>s.source||s.excerpt)',context),false);
 assert.ok(requested.every(url=>['playlist.json','photos.json'].includes(url)),'journal content must never be requested');
 if(!online)return;
 photoData={version:'no-photos',slides:[]};await vm.runInContext('refresh()',context);
 assert.equal(vm.runInContext('pending.slides.length',context),base.slides.length);
 vm.runInContext('position=playlist.slides.length-1;advance(1)',context);
 assert.equal(vm.runInContext('playlist.slides.length',context),base.slides.length);
 assert.equal(vm.runInContext('position',context),0);
 photoData={version:'bad',slides:[{type:'image',duration:18,image:'https://other.example/photo.jpg',alt:'Invalid',title:'Bad'}]};await vm.runInContext('refresh()',context);
 assert.equal(vm.runInContext('pending',context),null);
 photoData={version:'missing-image',slides:[]};brokenImages=true;await vm.runInContext('refresh()',context);
 assert.equal(vm.runInContext('pending',context),null,'missing website image retains rotation');
 for(let i=0;i<base.slides.length;i++){
  vm.runInContext(`position=${i};render()`,context);const rendered=elements['#stage'].lastElementChild;
  assert.ok(rendered.children.length>=(base.slides[i].layout==='care'?2:3));assert.equal(hasSvg(rendered),false,'slides contain no QR SVG');
 }
 assert.throws(()=>vm.runInContext(`validate(${JSON.stringify(journal)})`,context),'journal source must be rejected');
 const posters=base.slides.filter(s=>s.layout==='poster');assert.deepEqual(posters.map(s=>s.phase),['discover','plant','measure']);
 for(const phase of ['invalid',null]) {const badPoster={...posters[0],phase};assert.throws(()=>vm.runInContext(`validate({version:'bad',slides:[${JSON.stringify(badPoster)}]})`,context));}
 const badEmphasis={...posters[0],bodyEmphasis:'Missing phrase'};assert.throws(()=>vm.runInContext(`validate({version:'bad',slides:[${JSON.stringify(badEmphasis)}]})`,context));
 const badSide={...base.slides.find(s=>s.image),imageSide:'top'};assert.throws(()=>vm.runInContext(`validate({version:'bad',slides:[${JSON.stringify(badSide)}]})`,context));
 const badLink={...base.slides[0],links:[{label:'Bad',url:'https://evil.example/'}]};assert.throws(()=>vm.runInContext(`validate({version:'bad',slides:[${JSON.stringify(badLink)}]})`,context));
 const longBody={...base.slides[0],body:'x'.repeat(241)};assert.throws(()=>vm.runInContext(`validate({version:'bad',slides:[${JSON.stringify(longBody)}]})`,context));
}
(async()=>{
 await scenario(()=>Promise.resolve({}));await scenario(()=>Promise.reject(Error('Cache failed')));await scenario(()=>new Promise(()=>{}));
 const legacy=JSON.stringify({version:'legacy',slides:[...base.slides,...photos.slides,...journal.slides]});
 await scenario(()=>Promise.resolve({}),legacy,false);
 console.log('PASS: twelve slides with three wall posters, no journal requests or QR codes, legacy cache removal, offline restore, content bounds, boundary updates and missing-image retention');
})().catch(e=>{console.error(e);process.exitCode=1});
