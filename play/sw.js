const VERSION='f04faf8233ff630e';
const ASSETS=["./","./assets/CanvasPool-EQ7DufAS.js","./assets/CanvasRenderer-CybbOIRe.js","./assets/RenderTargetSystem-5W5wyIir.js","./assets/WebGLRenderer-Q4yE3OmY.js","./assets/WebGPURenderer-DvBzFRq5.js","./assets/browserAll-DMNrRuxE.js","./assets/canvasUtils-C2byRFPS.js","./assets/getTexelRangeRects-CgvCiYDS.js","./assets/index-BFWxNDlT.css","./assets/index-D7yVxqu_.js","./assets/pixi-renderer-onQie2f0.js","./assets/webworkerAll-DvYGJemW.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
