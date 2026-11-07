const VERSION='2ab6b5e858586eba';
const ASSETS=["./","./assets/CanvasPool-CLpBsMU9.js","./assets/CanvasRenderer-CuTp-3h2.js","./assets/RenderTargetSystem-CgZgDlRJ.js","./assets/WebGLRenderer-BCNVGPHi.js","./assets/WebGPURenderer-CXL5Rd6W.js","./assets/browserAll-BpTT-sbJ.js","./assets/canvasUtils-BkfKMurW.js","./assets/getTexelRangeRects-C6K-2XU8.js","./assets/index-CVHrkeK-.css","./assets/index-D-dPKZKc.js","./assets/pixi-renderer-1Qytrqoj.js","./assets/webworkerAll-BHu_ddw8.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
