const VERSION='6c1a3cefe0b028af';
const ASSETS=["./","./assets/CanvasPool-NpgoSKvT.js","./assets/CanvasRenderer-Cl6Zwz3C.js","./assets/RenderTargetSystem-Cef-cM91.js","./assets/WebGLRenderer-XgjgBWz6.js","./assets/WebGPURenderer-ePnf5Swd.js","./assets/browserAll-Dr8xJUHC.js","./assets/canvasUtils-ipJANtjb.js","./assets/getTexelRangeRects-D6yqlft_.js","./assets/index-CVHrkeK-.css","./assets/index-kAcfwyrE.js","./assets/pixi-renderer-C8dpqfYi.js","./assets/webworkerAll-CJcV4QZ-.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
