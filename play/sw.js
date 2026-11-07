const VERSION='2be2c3ffbadfccfd';
const ASSETS=["./","./assets/CanvasPool-Hy63n0_i.js","./assets/CanvasRenderer-BxzPs1xA.js","./assets/RenderTargetSystem-B0GGMloJ.js","./assets/WebGLRenderer-1clLvyv2.js","./assets/WebGPURenderer-BGOI9_-v.js","./assets/browserAll-CxrJP0aG.js","./assets/canvasUtils-DCJQEn8U.js","./assets/getTexelRangeRects-fwJ6f061.js","./assets/index-B5TNwBLO.js","./assets/index-Bfan8Prw.css","./assets/pixi-renderer-DPfUMJce.js","./assets/webworkerAll-C-GObHp9.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
