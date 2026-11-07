const VERSION='79c3aba75fd08394';
const ASSETS=["./","./assets/BitmapFont-D_Tflemd.js","./assets/CanvasPool-DoSjzauJ.js","./assets/CanvasRenderer-dP6brM3q.js","./assets/Filter-BNk1Z2SD.js","./assets/RenderTargetSystem-60Dth4zx.js","./assets/WebGLRenderer-CiEJiqzr.js","./assets/WebGPURenderer-yZG5xAwD.js","./assets/browserAll-CQmAD-hD.js","./assets/canvasUtils-CesysYQv.js","./assets/getTexelRangeRects-chLNpU0Y.js","./assets/index-DlsMUuTU.js","./assets/index-Dnvsysx1.css","./assets/index-ZCUKEXxK.js","./assets/pixel-renderer-D6Rr3lCJ.js","./assets/pixi-renderer-b16tdpsu.js","./assets/webworkerAll-B1uwojOa.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
