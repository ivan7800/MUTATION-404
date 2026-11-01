const VERSION='3b38fe943323e97f';
const ASSETS=["./","./assets/CanvasPool-BfsALTqg.js","./assets/CanvasRenderer-B3pAOtsX.js","./assets/RenderTargetSystem-DWiuEZY-.js","./assets/WebGLRenderer-7Zb5F3zi.js","./assets/WebGPURenderer-BVqUSxRp.js","./assets/browserAll-Chlz1bFm.js","./assets/canvasUtils-BtTXR9vG.js","./assets/getTexelRangeRects-Ds6y8iUn.js","./assets/index-CZgMdvNJ.css","./assets/index-DMkXQMHf.js","./assets/pixi-renderer-ScDmS1fQ.js","./assets/webworkerAll-Cu011h2T.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
