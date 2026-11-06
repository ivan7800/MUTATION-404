const VERSION='24a447f3c6d2a07c';
const ASSETS=["./","./assets/CanvasPool-BkV4dSmf.js","./assets/CanvasRenderer-SgoHkbjB.js","./assets/RenderTargetSystem-DD5NnCiq.js","./assets/WebGLRenderer-JcZPDF48.js","./assets/WebGPURenderer-BBDtGsEJ.js","./assets/browserAll-BIcPhhvE.js","./assets/canvasUtils-V9uHR2zv.js","./assets/getTexelRangeRects-C2BXN1rt.js","./assets/index-CAc4F4E7.js","./assets/index-CsVJ3U8H.css","./assets/pixi-renderer-Ci2U1J34.js","./assets/webworkerAll-De3Jgu7S.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
