import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const root=resolve('play'),prefix='/MUTATION-404/';
let revision=1;
const server=createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(!path.startsWith(prefix)){res.writeHead(404);res.end();return;}
  const file=resolve(root,path.slice(prefix.length)||'index.html');
  if(!file.startsWith(root+'/')){res.writeHead(403);res.end();return;}
  try{
    let body=await readFile(file);
    if(revision===2&&path===prefix+'sw.js')body=Buffer.from(body.toString().replace(/const VERSION='[^']+'/,"const VERSION='browser-upgrade-2'"));
    if(revision===2&&(path===prefix||path===prefix+'index.html'))body=Buffer.from(body.toString().replace('</head>','<meta name="build-probe" content="browser-upgrade-2"></head>'));
    res.writeHead(200,{'Content-Type':({'.js':'text/javascript','.css':'text/css','.html':'text/html'})[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
  }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const context=await browser.newContext();
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const url=`http://127.0.0.1:${server.address().port}${prefix}`;
  await page.goto(url);
  await page.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));
  await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
  await page.locator('#start-new').click();
  await page.keyboard.press('ArrowRight');
  await page.locator('#save-btn').click();
  const coords=await page.locator('#coords').textContent();
  await context.setOffline(true);
  await page.reload();
  await page.locator('#start-continue').click();
  await page.waitForFunction(()=>document.querySelector('#viewport')?.dataset.renderer==='pixi-webgl');
  assert.equal(await page.locator('#coords').textContent(),coords);
  assert.deepEqual(errors,[]);
  await page.keyboard.press('ArrowLeft');
  assert.notEqual(await page.locator('#coords').textContent(),coords);
  await page.evaluate(()=>{window.__oldController=navigator.serviceWorker.controller;});
  await context.setOffline(false);
  const oldCaches=await page.evaluate(()=>caches.keys());
  revision=2;
  await page.evaluate(async()=>{const registration=await navigator.serviceWorker.ready;await registration.update();});
  await page.waitForFunction(async()=>{
    const registration=await navigator.serviceWorker.ready;
    return registration.waiting?.state==='installed';
  });
  await page.waitForTimeout(500);
  const waiting=await page.evaluate(async()=>Boolean((await navigator.serviceWorker.ready).waiting)&&window.__oldController===navigator.serviceWorker.controller);
  assert.equal(waiting,true,'updated worker must wait while the old game tab is open');
  assert.ok((await page.evaluate(()=>caches.keys())).some(key=>oldCaches.includes(key)),'old build must remain cached while in use');
  await page.close();
  const updated=await context.newPage();
  updated.on('pageerror',error=>errors.push(error.message));
  await updated.goto(url);
  await updated.waitForFunction(()=>caches.keys().then(keys=>keys.some(key=>key.endsWith('browser-upgrade-2'))&&keys.every(key=>!key.startsWith('mutation404:/MUTATION-404/:')||key.endsWith('browser-upgrade-2'))));
  await context.setOffline(true);
  await updated.reload();
  assert.equal(await updated.locator('meta[name="build-probe"]').getAttribute('content'),'browser-upgrade-2','offline reload must use the new cached build');
  assert.equal(await updated.locator('#start-continue').isEnabled(),true,'worker update must preserve local saves');
  assert.deepEqual(errors,[]);
  await mkdir('qa-evidence',{recursive:true});
  await updated.screenshot({path:'qa-evidence/offline-subpath.png',fullPage:true});
  await writeFile('qa-evidence/offline-report.json',JSON.stringify({status:'passed',subpath:prefix,installed:true,offlineReload:true,savePreserved:true,webglOffline:true,waitingUpdate:waiting,newBuildOffline:true,errors},null,2));
  console.log('PASS offline installation, subpath reload, saved game, WebGL chunks and waiting build upgrade');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
