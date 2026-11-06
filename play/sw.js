const VERSION='980d2b737b089e22';
const ASSETS=["./","./assets/CanvasPool-DeeSMZrM.js","./assets/CanvasRenderer-BmN-QWSR.js","./assets/RenderTargetSystem-NikafRoT.js","./assets/WebGLRenderer-Cd5KpvgN.js","./assets/WebGPURenderer-DOZdGYs1.js","./assets/browserAll-0V9hftrf.js","./assets/canvasUtils-CTSP6pKI.js","./assets/getTexelRangeRects-D6h1YPT2.js","./assets/index-1KbLU7vq.js","./assets/index-CsVJ3U8H.css","./assets/pixi-renderer-H6QJ4XUI.js","./assets/webworkerAll-K33gudyC.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
