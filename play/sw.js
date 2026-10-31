const VERSION='65f09032cc247016';
const ASSETS=["./","./assets/CanvasPool-CMoJ96hW.js","./assets/CanvasRenderer-CKcWhuxa.js","./assets/RenderTargetSystem-BrnjCa25.js","./assets/WebGLRenderer-DWc2kpZh.js","./assets/WebGPURenderer-HKlDNR5c.js","./assets/browserAll-CscsTb4K.js","./assets/canvasUtils-C7YgVsYk.js","./assets/getTexelRangeRects-BmgWEZcJ.js","./assets/index-CZgMdvNJ.css","./assets/index-DaWwXKiH.js","./assets/pixi-renderer-BTiPcYJ0.js","./assets/webworkerAll-D9kwO58I.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
