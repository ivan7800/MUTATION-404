const VERSION='533c1bb0a43d3ab0';
const ASSETS=["./","./assets/CanvasPool-BmYyEBCF.js","./assets/CanvasRenderer--bIPMrdi.js","./assets/RenderTargetSystem-BRnGnevn.js","./assets/WebGLRenderer-RRY2E_1B.js","./assets/WebGPURenderer-B1PSTZ_u.js","./assets/browserAll-5MTQG3hX.js","./assets/canvasUtils-DY4MKH7g.js","./assets/getTexelRangeRects-BWYJWThS.js","./assets/index-CZgMdvNJ.css","./assets/index-D3TY9zE-.js","./assets/pixi-renderer-CoJ5UmWI.js","./assets/webworkerAll-BgnGucsE.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
