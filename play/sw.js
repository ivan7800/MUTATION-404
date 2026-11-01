const VERSION='56e0f2e2bbf22d74';
const ASSETS=["./","./assets/CanvasPool-DcV0sb69.js","./assets/CanvasRenderer-M8dHM-3V.js","./assets/RenderTargetSystem-Dn2Ja2YD.js","./assets/WebGLRenderer-DflEi9uf.js","./assets/WebGPURenderer-Bbt0bq0f.js","./assets/browserAll-CbbEDb9_.js","./assets/canvasUtils-r7h7s67Y.js","./assets/getTexelRangeRects-BV2duG61.js","./assets/index-Bk_8Bk8w.js","./assets/index-CZgMdvNJ.css","./assets/pixi-renderer-DYaS4pkR.js","./assets/webworkerAll-Q-f5yUJ8.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
