const VERSION='a15c97edb22d05fb';
const ASSETS=["./","./assets/CanvasPool-kdHfBgu-.js","./assets/CanvasRenderer-C5j8SZq_.js","./assets/RenderTargetSystem-MfZjrA8d.js","./assets/WebGLRenderer-kqKDuw9U.js","./assets/WebGPURenderer-Cc2wkznQ.js","./assets/browserAll-CUcFcbXk.js","./assets/canvasUtils-BTRhIFJZ.js","./assets/getTexelRangeRects-fuHH0Rj1.js","./assets/index-CZgMdvNJ.css","./assets/index-tJVB0SKL.js","./assets/pixi-renderer-uHhI9Pxw.js","./assets/webworkerAll-CWt1Cdoo.js","./icon.svg","./index.html","./manifest.webmanifest"];
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
