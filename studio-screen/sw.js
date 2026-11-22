'use strict';
const CACHE='gardener-studio-screen-v31';
const core=['./','index.html','player.js','player.js?v=30','website-slides.js?v=30','website-slides.css','website-slides.css?v=30','playlist.json','photos.json',
  '../images/indigenous-forest-garden.webp',
  '../images/maylands-meadow.webp',
  '../images/victoria-grove-elevation.webp',
  '../images/natasha-tyson.webp',
  '../images/heirloom/heirloom-mont-albert-1.jpeg',
  '../presentation/maylands/fonts/AbrilFatface-Regular.ttf',
  '../presentation/maylands/fonts/Literata-Regular.woff2',
  '../presentation/maylands/fonts/Literata-Italic.woff2',
  '../presentation/maylands/fonts/IBMPlexSans-Regular.ttf',
  '../presentation/maylands/fonts/IBMPlexMono-Regular.ttf',
  '../presentation/maylands/images/hero.webp',
  '../presentation/maylands/images/texture.webp',
  '../presentation/maylands/images/habitat.webp'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(core))));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{const response=await fetch(event.request,{signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('Fetch failed');await cache.put(event.request,response.clone());return response;}
    catch(error){const saved=await cache.match(event.request);if(saved)return saved;throw error;}
  })());
});
