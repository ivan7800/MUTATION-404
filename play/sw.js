const VERSION='d3d9c0fa945b9d99';
const ASSETS=["./","./assets/BitmapFont-B-E844rp.js","./assets/CanvasPool-C14WWNr-.js","./assets/CanvasRenderer-DGUfcTtk.js","./assets/Filter-EOo9-nGa.js","./assets/RenderTargetSystem-AzaRw9SR.js","./assets/WebGLRenderer-BXg6Wg87.js","./assets/WebGPURenderer-XtcTq-4-.js","./assets/browserAll-a9_yUzK7.js","./assets/canvasUtils-BbQNNfr7.js","./assets/getTexelRangeRects-BwwQ-8LO.js","./assets/index-CJxfOxRe.js","./assets/index-DYh-iW3y.js","./assets/index-Dnvsysx1.css","./assets/pixel-renderer-zkC3OKGq.js","./assets/pixi-renderer-DjkIPtnJ.js","./assets/webworkerAll--PsPFyto.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
