const VERSION='35da66ce1b9b4bca';
const ASSETS=["./","./assets/CanvasPool-DBDk3bwE.js","./assets/CanvasRenderer-C18R-Ewg.js","./assets/RenderTargetSystem-BeF6F88D.js","./assets/WebGLRenderer-CftQ1exu.js","./assets/WebGPURenderer-DZ1MhXFD.js","./assets/browserAll-D5txOeb6.js","./assets/canvasUtils-D618ijQp.js","./assets/getTexelRangeRects-DrjsGHKt.js","./assets/index-BQ9CrBLP.js","./assets/index-CZgMdvNJ.css","./assets/pixi-renderer-CK34XK6v.js","./assets/webworkerAll-B-BvWsl0.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
