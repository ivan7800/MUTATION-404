const VERSION='8ca06b3885ec256e';
const ASSETS=["./","./assets/CanvasPool-DeKVMlMq.js","./assets/CanvasRenderer-CXdED89M.js","./assets/RenderTargetSystem-BLIAvMww.js","./assets/WebGLRenderer-CjGOSCxn.js","./assets/WebGPURenderer-C0zJSt7Z.js","./assets/browserAll-BjsxeAZp.js","./assets/canvasUtils-CdsBSDJu.js","./assets/getTexelRangeRects-DtHRty-C.js","./assets/index-BcXD6VEj.js","./assets/index-CZgMdvNJ.css","./assets/pixi-renderer-Bju3BcEj.js","./assets/webworkerAll-BENJYQAg.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
