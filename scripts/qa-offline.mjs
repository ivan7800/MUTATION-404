import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const root=resolve('play'),prefix='/MUTATION-404/';
const server=createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(!path.startsWith(prefix)){res.writeHead(404);res.end();return;}
  const file=resolve(root,path.slice(prefix.length)||'index.html');
  if(!file.startsWith(root+'/')){res.writeHead(403);res.end();return;}
  try{
    const body=await readFile(file);
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
  await mkdir('qa-evidence',{recursive:true});
  await page.screenshot({path:'qa-evidence/offline-subpath.png',fullPage:true});
  await writeFile('qa-evidence/offline-report.json',JSON.stringify({status:'passed',subpath:prefix,installed:true,offlineReload:true,savePreserved:true,webglOffline:true,errors},null,2));
  console.log('PASS offline installation, subpath reload, saved game, movement and lazy WebGL chunks');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
