import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const PORT=8877;
const base=`http://127.0.0.1:${PORT}/`;
const server=spawn(process.execPath,['scripts/server.mjs','--no-open'],{env:{...process.env,PORT:String(PORT)},stdio:'pipe'});
const failures=[],results=[];
const browserExecutable=process.env.CHROME_PATH||process.env.CHROMIUM_PATH||'/usr/bin/chromium';
await mkdir('qa-evidence',{recursive:true});
let browser;
try{
  for(let n=0;n<70;n++){try{const r=await fetch(base);if(r.ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({headless:true,executablePath:browserExecutable,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const mode of ['webgl','canvas-fallback']){
    const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
    if(mode==='canvas-fallback'){
      await context.addInitScript(()=>{
        const original=HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext=function(type,...args){
          if(type==='webgl'||type==='webgl2'||type==='experimental-webgl')return null;
          return original.call(this,type,...args);
        };
      });
    }
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base,{waitUntil:'networkidle',timeout:45000});
    const expected=mode==='webgl'?'pixi-webgl':'canvas2d';
    await page.waitForFunction(value=>document.querySelector('#viewport')?.getAttribute('data-renderer')===value,expected,{timeout:25000});
    assert.equal(await page.locator('#viewport').getAttribute('data-renderer'),expected);
    assert.ok(await page.locator('#viewport canvas:visible').count()>0,'visible world canvas missing');
    const before=await page.locator('#coords').textContent();
    await page.keyboard.press('ArrowRight');
    const after=await page.locator('#coords').textContent();
    assert.notEqual(after,before,'movement input did not update player position');
    await page.locator('#zoom-in').click();
    await page.locator('#zoom-out').click();
    await page.locator('#help-btn').click();
    assert.ok(await page.locator('#modal').isVisible(),'help modal did not open');
    await page.locator('#modal-close').click();
    await page.locator('#save-btn').click();
    await page.locator('#load-btn').click();
    const png=`qa-evidence/${mode}.png`;
    await page.screenshot({path:png,fullPage:true,animations:'disabled'});
    assert.deepEqual(errors,[],'unhandled browser exceptions');
    const info={mode,renderer:expected,before,after,errors,canvasCount:await page.locator('#viewport canvas').count(),screenshot:png};
    results.push(info);
    await context.close();
  }
  await writeFile('qa-evidence/report.json',JSON.stringify({status:'passed',browser:browserExecutable,results},null,2));
  console.log('PASS real browser QA',results);
}catch(error){
  failures.push(error instanceof Error?error.stack:String(error));
  await writeFile('qa-evidence/report.json',JSON.stringify({status:'failed',failures,results},null,2));
  console.error('FAIL browser QA',failures);
  process.exitCode=1;
}finally{
  await browser?.close();
  server.kill();
}
