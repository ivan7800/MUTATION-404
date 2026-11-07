const VERSION='4ca23018ed8c6706';
const ASSETS=["./","./assets/CanvasPool-BiUenWGX.js","./assets/CanvasRenderer-DfE71plR.js","./assets/RenderTargetSystem-BGm-QpUp.js","./assets/WebGLRenderer-DYgWYTEA.js","./assets/WebGPURenderer-BOkevO-2.js","./assets/browserAll-BeFmNMyf.js","./assets/canvasUtils-CWKDGrUO.js","./assets/getTexelRangeRects-DjoFSN-f.js","./assets/index-BD0nrNeb.css","./assets/index-Ckua-BgL.js","./assets/pixi-renderer-CefV6OvR.js","./assets/webworkerAll-NBy4Pn20.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
