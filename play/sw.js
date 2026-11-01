const VERSION='fdfc27d43416720a';
const ASSETS=["./","./assets/CanvasPool-CHQzAQNb.js","./assets/CanvasRenderer-DE6iQK0x.js","./assets/RenderTargetSystem-e6uPuWMl.js","./assets/WebGLRenderer-DBxLdQAg.js","./assets/WebGPURenderer-DDmiGamF.js","./assets/browserAll-DWCRxd6Q.js","./assets/canvasUtils-CSHJTWJX.js","./assets/getTexelRangeRects-DIsZNVEW.js","./assets/index-CZgMdvNJ.css","./assets/index-vMMz5m7H.js","./assets/pixi-renderer-TpdjrbzY.js","./assets/webworkerAll-Ct-pfONA.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
