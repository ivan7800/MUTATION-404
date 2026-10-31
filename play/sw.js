const VERSION='750cfb6bbc7db1b1';
const ASSETS=["./","./assets/CanvasPool-CXvaaGFk.js","./assets/CanvasRenderer-Bxvk1LvO.js","./assets/RenderTargetSystem-D4YJGhC0.js","./assets/WebGLRenderer-DuMQTwCh.js","./assets/WebGPURenderer-Dz4PNNup.js","./assets/browserAll-DI175_6K.js","./assets/canvasUtils-BSK_rvPQ.js","./assets/getTexelRangeRects-DF1ckQx_.js","./assets/index-CZgMdvNJ.css","./assets/index-D8axtTSM.js","./assets/pixi-renderer-D5xRMg1Z.js","./assets/webworkerAll-D2xrOIb8.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
