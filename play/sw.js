const VERSION='1a60878688e1d72e';
const ASSETS=["./","./assets/CanvasPool-C092uxkj.js","./assets/CanvasRenderer-D66JTyUh.js","./assets/RenderTargetSystem-BZ4Vpt_w.js","./assets/WebGLRenderer-BGYW0oUz.js","./assets/WebGPURenderer-CLpOJKHj.js","./assets/browserAll-DbCKTBms.js","./assets/canvasUtils-BgHZi3Tn.js","./assets/getTexelRangeRects-Q0InPuht.js","./assets/index-BwJBe8S1.js","./assets/index-CZgMdvNJ.css","./assets/pixi-renderer-BQp1cz2p.js","./assets/webworkerAll-BeRBNRXg.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
