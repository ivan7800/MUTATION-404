const VERSION='3ed13d93a6792a32';
const ASSETS=["./","./assets/CanvasPool-DjlpYpo1.js","./assets/CanvasRenderer-B8-TOUd0.js","./assets/RenderTargetSystem-CArf_Qsy.js","./assets/WebGLRenderer-C2vGpmnb.js","./assets/WebGPURenderer-DKUhXQP-.js","./assets/browserAll-BsVUMssR.js","./assets/canvasUtils-BIL4lhZT.js","./assets/getTexelRangeRects-DbpXyity.js","./assets/index-BJ18Alpl.js","./assets/index-CZgMdvNJ.css","./assets/pixi-renderer-BmJPtr7d.js","./assets/webworkerAll-I8s3YBq2.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
