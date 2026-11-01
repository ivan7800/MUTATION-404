const VERSION='1ddfd0d40c0361dd';
const ASSETS=["./","./assets/CanvasPool-D7cRqxNC.js","./assets/CanvasRenderer-CDCOgZ3q.js","./assets/RenderTargetSystem-CoGzjvgL.js","./assets/WebGLRenderer-B0Zlp5aP.js","./assets/WebGPURenderer-Dyxmh9nx.js","./assets/browserAll-BbTmPb-L.js","./assets/canvasUtils-DyOk3SGp.js","./assets/getTexelRangeRects--VyWGy4E.js","./assets/index-CZgMdvNJ.css","./assets/index-DrNaGZEJ.js","./assets/pixi-renderer-CJBsUTfc.js","./assets/webworkerAll-Ct3daaVt.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
