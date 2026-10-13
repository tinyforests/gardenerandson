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
    if (!['brand','statement','image','website'].includes(s.type) || !Number.isFinite(s.duration) || s.duration < 8 || s.duration > 120) throw Error('Invalid slide');
    if (s.type !== 'brand' && (typeof s.title !== 'string' || s.title.length > 110)) throw Error('Title too long');
    if (s.label && (typeof s.label !== 'string' || s.label.length > 90)) throw Error('Label too long');
    if (s.imageSide !== undefined && !['left','right'].includes(s.imageSide)) throw Error('Invalid image side');
    if (s.type === 'website') validateWebsiteSlide(s);
    if (s.source !== undefined || s.excerpt !== undefined) throw Error('Journal slides are disabled');
    if (s.type === 'image' || s.image !== undefined) {
      if (s.type !== 'image' && s.type !== 'website') throw Error('Invalid slide image');
      const url = new URL(s.image, location.href);
      if (url.origin !== location.origin || !/\.(webp|jpe?g|png)$/i.test(url.pathname) || typeof s.alt !== 'string' || !s.alt) throw Error('Use a local image with alt text');
    }
  }
  return data;
}
function withoutJournal(data) {
  if (!data || !Array.isArray(data.slides)) throw Error('Invalid playlist');
  return validate({...data, slides:data.slides.filter(slide => !slide?.source && !slide?.excerpt)});
}
function compose(base, photos) {
  return validate({version:['display-4',base.version,photos.version].join('|'),slides:[...base.slides,...photos.slides]});
}
async function prepare(data) {
  await Promise.all(data.slides.filter(s=>s.image).map(s=>new Promise((resolve,reject)=>{
    const img = new Image(); const timeout = setTimeout(()=>reject(Error('Image timeout')),15000);
    img.onload=()=>{clearTimeout(timeout);resolve();}; img.onerror=()=>{clearTimeout(timeout);reject(Error('Image unavailable'));}; img.src=s.image;
  })));
}
function render() {
  const s = playlist.slides[position];
  document.querySelector('main').style.background = s.dark || s.type === 'image' ? 'var(--green)' : 'var(--beige)';
  const section = document.createElement('section'); section.className='slide'+(s.dark?' dark':'')+(s.type==='image'?' image':'');
  if (s.type === 'website') renderWebsite(s, section);
  else if (s.type==='image') {
    section.classList.add('side-image','image-' + (s.imageSide || 'left'));

    const img=document.createElement('img'); img.src=s.image;img.alt=s.alt;section.append(img);
    const caption=document.createElement('div');caption.className='caption';caption.append(text('p',s.label||'Gardener & Son','label'),text('h2',s.title));section.append(caption);
  } else {

    if(s.type==='brand'){
      const h=document.createElement('h1');h.append(text('span','Ecological gardens.'));
      const middle=document.createElement('span');middle.append(text('em','Heirloom objects.'));h.append(middle,text('span','Living systems.'));section.append(h);
    }else {
      section.append(text('p',s.label||'Gardener & Son','label'),text('h2',s.title));
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
    const base=withoutJournal(await response.json());
    const photoResponse=await fetch('photos.json',{cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!photoResponse.ok)throw Error('Photos unavailable');
    const photos=validate(await photoResponse.json(), true);
    const data=compose(base, photos);
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
  try{const saved=localStorage.getItem('studio-playlist');if(saved){const data=withoutJournal(JSON.parse(saved));await prepare(data);playlist=data;position=0;render();}}catch{}
  await refresh();if(pending){playlist=pending;pending=null;position=0;render();}
  setInterval(refresh,300000);addEventListener('online',refresh);
})();
