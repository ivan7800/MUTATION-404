const VERSION='7dbc13126d570d12';
const ASSETS=["./","./assets/BitmapFont-C4ISkHbn.js","./assets/CanvasPool-C18fJT-0.js","./assets/CanvasRenderer-OtSnx09i.js","./assets/Filter-CZTU0jNw.js","./assets/RenderTargetSystem-kGkocT3U.js","./assets/WebGLRenderer-DJswmUWL.js","./assets/WebGPURenderer-HZWigqk6.js","./assets/browserAll-CwX-L9v-.js","./assets/canvasUtils-BzJtzRV1.js","./assets/getTexelRangeRects-DNVJ6Wo3.js","./assets/index-C6jba_4T.js","./assets/index-CFLQZs7y.js","./assets/index-Dnvsysx1.css","./assets/pixel-renderer-sEIDyhyS.js","./assets/pixi-renderer-CSe4CPJm.js","./assets/webworkerAll-B7xSktvi.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
