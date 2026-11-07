const VERSION='722e88528afea5e0';
const ASSETS=["./","./assets/BitmapFont-y4ms5rym.js","./assets/CanvasPool-Bf7Q8S1m.js","./assets/CanvasRenderer-DwcTayu5.js","./assets/Filter-D8qwqj6J.js","./assets/RenderTargetSystem-C1vv_OdY.js","./assets/WebGLRenderer-CquWQm9m.js","./assets/WebGPURenderer-DVPK54mC.js","./assets/browserAll-Bd_U0TeC.js","./assets/canvasUtils-BdLV8XSt.js","./assets/getTexelRangeRects-D9unyl4N.js","./assets/index-DMnGsZPr.js","./assets/index-Dnvsysx1.css","./assets/index-Dq_aX-yc.js","./assets/pixel-renderer-BUs9fKht.js","./assets/pixi-renderer-DLLzTXDK.js","./assets/webworkerAll-BqQIRVo4.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
