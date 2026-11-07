const VERSION='aca4c9f943adf1f2';
const ASSETS=["./","./assets/CanvasPool-CenCh7Ry.js","./assets/CanvasRenderer-Cee23iN7.js","./assets/RenderTargetSystem-BECyMzFa.js","./assets/WebGLRenderer-Ucs3BgRX.js","./assets/WebGPURenderer-CJ8sVM6D.js","./assets/browserAll-DNMH9min.js","./assets/canvasUtils-DXtChuyg.js","./assets/getTexelRangeRects-DjLFDY1V.js","./assets/index-BD0nrNeb.css","./assets/index-CBA0GY-w.js","./assets/pixi-renderer-CZEJX9r0.js","./assets/webworkerAll-C--8jMFL.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
