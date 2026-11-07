const VERSION='e54bcab25a856d0d';
const ASSETS=["./","./assets/CanvasPool-BjE2bLh0.js","./assets/CanvasRenderer-BfV5wnhZ.js","./assets/RenderTargetSystem-BTnPT7_J.js","./assets/WebGLRenderer-D9VpdNxp.js","./assets/WebGPURenderer-COLhZ8H5.js","./assets/browserAll-CqpsmWiN.js","./assets/canvasUtils-DNV3kZ6H.js","./assets/getTexelRangeRects-B5uauuqs.js","./assets/index-BD0nrNeb.css","./assets/index-C62A5Q89.js","./assets/pixi-renderer-BlQRdy7L.js","./assets/webworkerAll-Ce1BNSzd.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
