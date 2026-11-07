const VERSION='f292f48d82eefebb';
const ASSETS=["./","./assets/CanvasPool-DwVuRDZ4.js","./assets/CanvasRenderer-BiNlqroo.js","./assets/RenderTargetSystem-dPVXzJAb.js","./assets/WebGLRenderer-CJTLvJZg.js","./assets/WebGPURenderer--eu2GjZA.js","./assets/browserAll-BiIUDJxv.js","./assets/canvasUtils-D5ToQnfN.js","./assets/getTexelRangeRects-BsmGoGIW.js","./assets/index-BFWxNDlT.css","./assets/index-W8Y8GPnq.js","./assets/pixi-renderer-DReQa33s.js","./assets/webworkerAll-DNOvLf5p.js","./icon.svg","./index.html","./manifest.webmanifest"];
const PREFIX=`mutation404:${new URL(self.registration.scope).pathname}:`;
const CACHE=PREFIX+VERSION;
self.addEventListener('install',event=>{
  // Atomic install; updates wait until old tabs close to avoid mixing builds.
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url),scope=new URL(self.registration.scope);
  if(request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(request);
    if(cached)return cached;
    if(request.mode==='navigate')return (await cache.match('./index.html'))||fetch(request);
    return fetch(request);
  }));
});
