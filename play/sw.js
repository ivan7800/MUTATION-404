const VERSION='3edb8f748af82b62';
const ASSETS=["./","./assets/CanvasPool-Dw0xmztp.js","./assets/CanvasRenderer-nD-bihdv.js","./assets/RenderTargetSystem-D0Ky6rqN.js","./assets/WebGLRenderer-CTi3kJ95.js","./assets/WebGPURenderer-Cqsbqta1.js","./assets/browserAll-BsTWiKNR.js","./assets/canvasUtils-DEkiP6HL.js","./assets/getTexelRangeRects-BBRv1i-s.js","./assets/index-BsU7vvWM.js","./assets/index-CZgMdvNJ.css","./assets/pixi-renderer-Cg3jq1xD.js","./assets/webworkerAll-DiFHno6n.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
