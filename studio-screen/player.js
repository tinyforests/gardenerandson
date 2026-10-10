'use strict';
const stage = document.querySelector('#stage');
const status = document.querySelector('#status');
let playlist = {version:'fallback',slides:[{type:'brand',duration:20}]};
let pending = null, position = 0, timer, paused = false, refreshing = false;
const text = (tag, value, className) => {
  const el = document.createElement(tag);
  el.textContent = value; if (className) el.className = className; return el;
};
function validate(data, allowEmpty = false) {
  if (!data || typeof data.version !== 'string' || !Array.isArray(data.slides) || (!allowEmpty && !data.slides.length) || data.slides.length > 100) throw Error('Invalid playlist');
  for (const s of data.slides) {
    if (!['brand','statement','image'].includes(s.type) || !Number.isFinite(s.duration) || s.duration < 8 || s.duration > 120) throw Error('Invalid slide');
    if (s.type !== 'brand' && (typeof s.title !== 'string' || s.title.length > 110)) throw Error('Title too long');
    if (s.label && (typeof s.label !== 'string' || s.label.length > 90)) throw Error('Label too long');
    if (s.source !== undefined) {
      if (typeof s.source !== 'string' || s.source.length > 300) throw Error('Invalid journal link');
      const url = new URL(s.source);
      if (s.type !== 'statement' || url.origin !== 'https://gardenerandson.substack.com' || !url.pathname.startsWith('/p/') || url.username || url.password) throw Error('Invalid journal link');
    }
    if (s.excerpt !== undefined && (s.type !== 'statement' || !s.source || typeof s.excerpt !== 'string' || !s.excerpt.trim() || s.excerpt.length > 180)) throw Error('Invalid journal excerpt');
    if (s.type === 'image' || s.image !== undefined) {
      if (s.type !== 'image' && (!s.source || !s.excerpt)) throw Error('Journal image needs a source and excerpt');
      const url = new URL(s.image, location.href);
      if (url.origin !== location.origin || !/\.(webp|jpe?g|png)$/i.test(url.pathname) || typeof s.alt !== 'string' || !s.alt) throw Error('Use a local image with alt text');
    }
  }
  return data;
}
function enrichJournal(journal, features) {
  if (!features || typeof features.version !== 'string' || !Array.isArray(features.articles) || features.articles.length > 100) throw Error('Invalid journal features');
  const selected = new Map();
  for (const feature of features.articles) {
    validate({version:'feature',slides:[{type:'statement',duration:20,title:'Journal feature',source:feature.source,image:feature.image,alt:feature.alt,excerpt:feature.excerpt}]});
    if (!feature.image || !feature.excerpt || selected.has(feature.source)) throw Error('Invalid journal feature');
    selected.set(feature.source, feature);
  }
  return validate({version:journal.version+'|'+features.version, slides:journal.slides.map(slide=>{
    const feature = selected.get(slide.source);
    return feature ? {...slide,image:feature.image,alt:feature.alt,excerpt:feature.excerpt} : slide;
  })});
}
function compose(base, photos, journal) {
  const slides = [...base.slides, ...photos.slides];
  const imageCount = slides.filter(s => s.type === 'image').length;
  const combined = [];
  let article = 0;
  for (const slide of slides) {
    combined.push(slide);
    if (article < journal.slides.length && (slide.type === 'image' || imageCount === 0)) combined.push(journal.slides[article++]);
  }
  // Preserve every article even when there are fewer photographs than headlines.
  combined.push(...journal.slides.slice(article));
  return validate({version:['rotation-2', base.version, photos.version, journal.version].join('|'), slides:combined});
}
function journalLink(source) {
  const url = new URL(source);
  const link = text('a', '', 'journal-link');
  link.href = url.href;
  // The readable link remains usable if the QR asset cannot load.
  if (typeof qrcode !== 'function') {
    link.append(text('span', 'Read more', 'journal-prompt'), text('span', url.hostname + url.pathname, 'journal-url'));
    return link;
  }
  const code = qrcode(0, 'M');
  code.addData(url.href); code.make();
  const size = code.getModuleCount();
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${size + 8} ${size + 8}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('shape-rendering', 'crispEdges');
  let path = '';
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (code.isDark(y, x)) path += `M${x+4},${y+4}h1v1h-1z`;
  }
  const modules = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  modules.setAttribute('d', path); modules.setAttribute('fill', 'currentColor'); svg.append(modules);
  const copy = text('span', '', 'journal-link-copy');
  copy.append(text('span', 'Read more', 'journal-prompt'), text('span', url.hostname + url.pathname, 'journal-url'));
  link.append(svg, copy);
  return link;
}
async function prepare(data) {
  await Promise.all(data.slides.filter(s=>s.image).map(s=>new Promise((resolve,reject)=>{
    const img = new Image(); const timeout = setTimeout(()=>reject(Error('Image timeout')),15000);
    img.onload=()=>{clearTimeout(timeout);resolve();}; img.onerror=()=>{clearTimeout(timeout);reject(Error('Image unavailable'));}; img.src=s.image;
  })));
}
function render() {
  const s = playlist.slides[position];
  const section = document.createElement('section'); section.className='slide'+(s.dark?' dark':'')+(s.type==='image'?' image':'');
  if (s.source && s.image && s.excerpt) {
    section.classList.add('journal', 'feature');
    const img=document.createElement('img');img.src=s.image;img.alt=s.alt;img.className='journal-image';section.append(img);
    const story=text('div','','journal-story');
    story.append(text('p',s.label||'From the journal · Gardener & Son','label'),text('h2',s.title));
    const quote=text('blockquote',s.excerpt,'journal-excerpt');quote.cite=s.source;story.append(quote);section.append(story);
    section.append(journalLink(s.source));
    const wordmark=text('div','Gardener ','wordmark');wordmark.append(text('em','&'),document.createTextNode(' Son'));section.append(wordmark);
  } else if (s.type==='image') {
    const img=document.createElement('img'); img.src=s.image;img.alt=s.alt;section.append(img);
    const caption=document.createElement('div');caption.className='caption';caption.append(text('p',s.label||'Gardener & Son','label'),text('h2',s.title));section.append(caption);
  } else {
    const wordmark=text('div','Gardener ','wordmark');wordmark.append(text('em','&'),document.createTextNode(' Son'));section.append(wordmark);
    if(s.type==='brand'){
      const h=document.createElement('h1');h.append(text('span','Ecological gardens.'));
      const middle=document.createElement('span');middle.append(text('em','Heirloom objects.'));h.append(middle,text('span','Living systems.'));section.append(h);
    }else {
      section.append(text('p',s.label||'Gardener & Son','label'),text('h2',s.title));
      if (s.source) {section.classList.add('journal');section.append(journalLink(s.source));}
    }
    section.append(text('p','Ecological design studio · Melbourne','footer'));
  }
  const old=stage.lastElementChild;stage.append(section);requestAnimationFrame(()=>requestAnimationFrame(()=>section.classList.add('active')));
  if(old){old.classList.remove('active');old.setAttribute('aria-hidden','true');setTimeout(()=>old.remove(),1500);}
  schedule();
}
function schedule(){clearTimeout(timer);if(!paused)timer=setTimeout(()=>advance(1),playlist.slides[position].duration*1000);}
function advance(direction){
  if(direction===1 && position===playlist.slides.length-1 && pending){playlist=pending;pending=null;position=0;}
  else position=(position+direction+playlist.slides.length)%playlist.slides.length;
  render();
}
async function refresh(){
  if(refreshing)return;refreshing=true;
  try{
    const response=await fetch('playlist.json',{cache:'no-store',signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw Error('Playlist unavailable');
    const base=validate(await response.json());
    const photoResponse=await fetch('photos.json',{cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!photoResponse.ok)throw Error('Photos unavailable');
    const photos=validate(await photoResponse.json(), true);
    let journal;
    try{
      const live=await fetch('https://raw.githubusercontent.com/tinyforests/gardenerandson/main/studio-screen/journal.json',{cache:'no-store',signal:AbortSignal.timeout(10000)});
      if(!live.ok)throw Error('Journal not published');journal=validate(await live.json());
    }catch{
      const local=await fetch('journal.json',{cache:'no-store',signal:AbortSignal.timeout(10000)});
      if(!local.ok)throw Error('Journal unavailable');journal=validate(await local.json());
    }
    const featureResponse=await fetch('journal-features.json',{cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!featureResponse.ok)throw Error('Journal features unavailable');
    journal=enrichJournal(journal, await featureResponse.json());
    const data=compose(base, photos, journal);
    await prepare(data);
    if(data.version!==playlist.version){pending=data;try{localStorage.setItem('studio-playlist',JSON.stringify(data));}catch{}}
    status.textContent='Playlist ready · checks every 5 minutes';
  }catch{status.textContent='Keeping saved rotation · retrying automatically';}
  finally{refreshing=false;}
}
document.querySelector('#previous').onclick=()=>advance(-1);
document.querySelector('#next').onclick=()=>advance(1);
document.querySelector('#pause').onclick=()=>{paused=!paused;document.querySelector('#pause').textContent=paused?'Play':'Pause';schedule();};
document.querySelector('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{status.textContent='Use your browser’s fullscreen command';}};
document.addEventListener('keydown',e=>{if(e.target.closest('button'))return;if(e.key==='ArrowRight')advance(1);if(e.key==='ArrowLeft')advance(-1);if(e.code==='Space'){e.preventDefault();document.querySelector('#pause').click();}if(e.key.toLowerCase()==='f')document.querySelector('#fullscreen').click();});
let hide;function controls(){document.body.classList.add('controls');clearTimeout(hide);hide=setTimeout(()=>document.body.classList.remove('controls'),4000);}document.addEventListener('pointermove',controls);document.addEventListener('keydown',controls);controls();
function resize(){stage.style.transform=`scale(${Math.min(document.querySelector("main").clientWidth/1920,document.querySelector("main").clientHeight/1080)})`;}addEventListener('resize',resize);resize();
(async()=>{
  render();
  // Cache installation is optional: a missing cached asset must never block playback or refresh.
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
  try{const saved=localStorage.getItem('studio-playlist');if(saved){const data=validate(JSON.parse(saved));await prepare(data);playlist=data;position=0;render();}}catch{}
  await refresh();if(pending){playlist=pending;pending=null;position=0;render();}
  setInterval(refresh,300000);addEventListener('online',refresh);
})();
