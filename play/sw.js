const VERSION='6a6440ee60f661e3';
const ASSETS=["./","./assets/CanvasPool-DqHWAWxU.js","./assets/CanvasRenderer-BazSeAHX.js","./assets/RenderTargetSystem-Dr_bhGdu.js","./assets/WebGLRenderer-CDE6qkX4.js","./assets/WebGPURenderer-o-k8KqkO.js","./assets/browserAll-BsOX_m0K.js","./assets/canvasUtils-C-jSOAPk.js","./assets/getTexelRangeRects-jGz6uG5T.js","./assets/index-AYI6NTfo.js","./assets/index-DOm_3IMS.css","./assets/pixi-renderer-YFCqY6VP.js","./assets/webworkerAll-BgT4T1Gr.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
