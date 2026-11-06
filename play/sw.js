const VERSION='c82a196c3a79fcc6';
const ASSETS=["./","./assets/CanvasPool-9cvu2GL-.js","./assets/CanvasRenderer-Bck0-Pqr.js","./assets/RenderTargetSystem-DGmSiSXG.js","./assets/WebGLRenderer-94NqLcBL.js","./assets/WebGPURenderer-CB5cCx4e.js","./assets/browserAll-CHIoXWj5.js","./assets/canvasUtils-CKzb9zGu.js","./assets/getTexelRangeRects-BTuTQWYM.js","./assets/index-CsVJ3U8H.css","./assets/index-MEa41ZAj.js","./assets/pixi-renderer-iWfVc4My.js","./assets/webworkerAll-D-TT88v7.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
