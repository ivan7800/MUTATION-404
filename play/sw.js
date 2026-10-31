const VERSION='88cfc83146d8ebea';
const ASSETS=["./","./assets/CanvasPool-CyUdwdNy.js","./assets/CanvasRenderer-CMFzvbxD.js","./assets/RenderTargetSystem-BPosILjg.js","./assets/WebGLRenderer-DozL570M.js","./assets/WebGPURenderer-Bo5Wrh1F.js","./assets/browserAll-Bcjluamf.js","./assets/canvasUtils-fWoEfR9g.js","./assets/getTexelRangeRects-U2P7-nIx.js","./assets/index-CZgMdvNJ.css","./assets/index-O69N4d7s.js","./assets/pixi-renderer-CUQ71p9F.js","./assets/webworkerAll-DVgFdaMe.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
