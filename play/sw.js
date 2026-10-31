const VERSION='f6736f4c596aa303';
const ASSETS=["./","./assets/CanvasPool-D0XBdXuI.js","./assets/CanvasRenderer-BHYuKKtT.js","./assets/RenderTargetSystem-CaHCoZPM.js","./assets/WebGLRenderer-vYFW0P_3.js","./assets/WebGPURenderer-C5kF_xkN.js","./assets/browserAll-DwP0Opoy.js","./assets/canvasUtils-R5nzx0Ir.js","./assets/getTexelRangeRects-CX9A3_-9.js","./assets/index-CZgMdvNJ.css","./assets/index-D_UbrWnQ.js","./assets/pixi-renderer-BkOcrtN4.js","./assets/webworkerAll-DK9qy1Dt.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
