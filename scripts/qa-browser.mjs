import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createGame,serialize,refreshVisibility} from '../dist/core/core/src/game.js';
import {generateRuin} from '../dist/core/core/src/depths.js';
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
    assert.ok(await page.locator('#start-menu').isVisible(),'startup menu must open before gameplay');
    assert.equal(await page.locator('#start-continue').isDisabled(),true,'continue must be disabled without a save');
    await page.locator('#start-options').click();
    assert.ok(await page.locator('#start-settings').isVisible(),'audio options panel missing');
    await page.locator('#start-volume').fill('75');
    assert.equal(await page.locator('#start-volume-value').textContent(),'75%');
    await page.locator('#start-audio').click();
    await page.waitForFunction(()=>document.querySelector('#start-audio')?.getAttribute('aria-pressed')==='true',{timeout:10000});
    await page.locator('#start-audio').click();
    await page.locator('#start-new').click();
    assert.equal(await page.locator('#start-menu').isVisible(),false);

    const expected=mode==='webgl'?'pixi-webgl':'canvas2d';
    await page.waitForFunction(value=>document.querySelector('#viewport')?.getAttribute('data-renderer')===value,expected,{timeout:25000});
    assert.equal(await page.locator('#viewport').getAttribute('data-renderer'),expected);
    assert.ok(await page.locator('#viewport canvas:visible').count()>0,'visible world canvas missing');
    assert.match(await page.locator('#survival-strip').textContent(),/PV .*AMPOLLAS .*PÚAS/);
    assert.equal(await page.locator('#survival-strip').getAttribute('data-risk'),'stable');
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
  // v2.0: actual images from both art modes and a genuine saved Ojo del Silencio.
  const state=createGame(404),room=generateRuin(404,-1,-1,2);
  state.zone='ruin--1--1-2';state.tiles=room.tiles;state.seen=room.seen;
  state.fields=room.fields;state.ground=room.ground;state.enemies=room.enemies;
  state.player={x:19,y:12};
  state.fields.push({x:19,y:12,kind:'spores',ttl:10},{x:20,y:12,kind:'fire',ttl:10});
  refreshVisibility(state);
  const eyeSave=serialize(state);
  for(const scene of ['faro-pixel','faro-ascii','ojo-pixel','ojo-ascii']){
    const eye=scene.startsWith('ojo'),ascii=scene.endsWith('ascii');
    const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
    if(eye)await context.addInitScript(save=>localStorage.setItem('mutation404.v10.save',save),eyeSave);
    const page=await context.newPage(),errors=[];
    page.on('pageerror',err=>errors.push(err.message));
    await page.goto(base,{waitUntil:'networkidle',timeout:45000});
    assert.ok(await page.locator('#start-menu').isVisible());
    if(eye){
      assert.equal(await page.locator('#start-continue').isEnabled(),true);
      await page.locator('#start-continue').click();
    }else await page.locator('#start-new').click();
    assert.equal(await page.locator('#start-menu').isVisible(),false);
    await page.waitForFunction(()=>document.querySelector('#viewport')?.getAttribute('data-renderer')==='pixi-webgl',{timeout:25000});
    if(ascii)await page.locator('#art-mode-btn').click();
    const mode=await page.locator('#viewport').getAttribute('data-art-mode');
    assert.equal(mode,ascii?'ascii':'pixel');
    assert.equal(await page.locator('#art-mode-btn').getAttribute('aria-pressed'),String(!ascii));
    if(eye){
      assert.match(await page.locator('#location').textContent(),/Ojo del Silencio/i);
      assert.match(await page.locator('#biome-description').textContent(),/Las paredes repiten pensamientos/i);
      assert.equal(await page.locator('#threat-note').getAttribute('data-level'),'contact');
      assert.match(await page.locator('#threat-note').textContent(),/PELIGRO INMEDIATO/);
    }
    // Browser-side frame cadence sample; diagnostic only, not a GPU benchmark.
    const frameStats=await page.evaluate(()=>new Promise(resolve=>{
      const samples=[];let prev=0;
      const step=(t)=>{if(prev)samples.push(t-prev);prev=t;
        if(samples.length>=24){
          const sorted=samples.slice().sort((a,b)=>a-b);
          resolve({sampleCount:samples.length,meanFrameMs:Math.round(samples.reduce((a,b)=>a+b,0)/samples.length*10)/10,p95FrameMs:Math.round(sorted[Math.floor(sorted.length*.95)]*10)/10});
        }else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }));
    const screenshot=`qa-evidence/${scene}.png`;
    await page.screenshot({path:screenshot,fullPage:true,animations:'disabled'});
    assert.deepEqual(errors,[],'scene caused a browser exception');
    results.push({scene,mode,zone:eye?'Ojo del Silencio':'Faro Ciego',screenshot,frameStats,errors});
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
