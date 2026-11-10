import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root='qa-evidence/isometric';await mkdir(root,{recursive:true});
const server=spawn(process.execPath,['scripts/server.mjs','--no-open'],{env:{...process.env,PORT:'8881'},stdio:'ignore'});
let browser;const results=[];
try{
 for(let n=0;n<100;n++){try{if((await fetch('http://127.0.0.1:8881')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const backend of ['webgl','canvas']){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  if(backend==='canvas')await context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.includes('webgl'))return null;return original.call(this,type,...args);};});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8881/?profile=1');await page.waitForFunction(()=>document.querySelector('#viewport')?.dataset.artMode==='pixel');
  await page.screenshot({path:`${root}/menu-${backend}.png`});await page.locator('#start-new').click();
  assert.equal(await page.locator('#viewport').getAttribute('data-renderer'),backend==='canvas'?'canvas2d':'pixi-webgl');
  await page.screenshot({path:`${root}/world-${backend}.png`,fullPage:true});
  const before=await page.locator('#coords').textContent();await page.keyboard.press('ArrowRight');assert.notEqual(await page.locator('#coords').textContent(),before);
  await page.locator('.secondary-actions summary').click();
  for(const id of ['inventory-btn','journal-btn','atlas-btn','travel-btn','craft-btn','ecology-btn','mutations-btn']){
   await page.locator('#'+id).click();assert.ok(await page.locator('#modal').isVisible(),id);
   if(id==='inventory-btn')await page.screenshot({path:`${root}/inventory-${backend}.png`});
   await page.locator('#modal-close').click();
  }
  await page.locator('#save-btn').click();const raw=await page.evaluate(()=>localStorage.getItem('mutation404.v10.save'));
  await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>localStorage.getItem('mutation404.v10.save')),raw,'visual frames must not modify stored simulation');
  await page.locator('#zoom-in').click();await page.locator('#zoom-out').click();
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:`${root}/mobile-${backend}.png`,fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile must not overflow horizontally');
  assert.deepEqual(errors,[]);results.push({backend,errors,profile:await page.evaluate(()=>window.__mutation404RenderProfile)});await context.close();
 }
 await writeFile(`${root}/report.json`,JSON.stringify({status:'passed',results},null,2));console.log('PASS isometric WebGL/Canvas UI, mobile and save checks');
}finally{await browser?.close();server.kill();}
