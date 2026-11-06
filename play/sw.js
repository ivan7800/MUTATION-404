const VERSION='1902ef8904a34099';
const ASSETS=["./","./assets/CanvasPool-DU0ddA2q.js","./assets/CanvasRenderer-D3pNbKgc.js","./assets/RenderTargetSystem-u3WDmInh.js","./assets/WebGLRenderer-Chco8xsC.js","./assets/WebGPURenderer-DLkMLkah.js","./assets/browserAll-C4Thr7s7.js","./assets/canvasUtils-Cq8ePfBU.js","./assets/getTexelRangeRects-DRJ3G64D.js","./assets/index-CZgMdvNJ.css","./assets/index-m5xGTdWp.js","./assets/pixi-renderer-COJreYmq.js","./assets/webworkerAll-Dap_as0N.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
