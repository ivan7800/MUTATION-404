const VERSION='685dfaea1d5fb978';
const ASSETS=["./","./assets/CanvasPool-BO0L1puS.js","./assets/CanvasRenderer-CARCOBXq.js","./assets/RenderTargetSystem-DzG08qzj.js","./assets/WebGLRenderer-CaFfUmHi.js","./assets/WebGPURenderer-CLKfVS_S.js","./assets/browserAll-Cr25dxC3.js","./assets/canvasUtils-CIVgvmde.js","./assets/getTexelRangeRects-AKlNkbCx.js","./assets/index-B-P4dGdm.js","./assets/index-CsVJ3U8H.css","./assets/pixi-renderer-hZeHpQs6.js","./assets/webworkerAll-BTs1kO4d.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
