import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createGame,serialize,refreshVisibility} from '../dist/core/core/src/game.js';
import {generateRuin,generateDepth} from '../dist/core/core/src/depths.js';
import {CAMPAIGN_SITES} from '../dist/core/core/src/campaign.js';
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
    await page.screenshot({path:`qa-evidence/menu-${mode}.png`,fullPage:true,animations:'disabled'});
    assert.equal(await page.locator('#start-continue').isDisabled(),true,'continue must be disabled without a save');
    await page.locator('#start-options').click();
    assert.ok(await page.locator('#start-settings').isVisible(),'audio options panel missing');
    await page.screenshot({path:`qa-evidence/opciones-${mode}.png`,fullPage:true,animations:'disabled'});
    await page.locator('#start-volume').evaluate(el=>{
      el.value='75';
      el.dispatchEvent(new Event('input',{bubbles:true}));
    });
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
    await page.locator('#menu-btn').click();
    assert.ok(await page.locator('#start-menu').isVisible(),'menu button must pause into title screen');
    assert.equal(await page.locator('#start-continue').isEnabled(),true,'save must enable continue');
    await page.locator('#start-continue').click();
    assert.equal(await page.locator('#start-menu').isVisible(),false,'continue must resume gameplay');
    assert.equal(await page.locator('#coords').textContent(),after,'continue must restore last saved player coordinates');
    await page.locator('#load-btn').click();
    const png=`qa-evidence/${mode}.png`;
    await page.screenshot({path:png,fullPage:true,animations:'disabled'});
    assert.deepEqual(errors,[],'unhandled browser exceptions');
    const info={mode,renderer:expected,before,after,errors,canvasCount:await page.locator('#viewport canvas').count(),screenshot:png};
    results.push(info);
    await context.close();
  }
  // Production audit: exercise the on-screen D-pad at phone and tablet sizes.
  // Record actual viewport overflow instead of assuming the desktop checks cover it.
  for(const [width,height] of [[390,844],[768,1024]]){
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:width===390,hasTouch:width===390});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base,{waitUntil:'networkidle',timeout:45000});
    await page.locator('#start-new').click();
    await page.waitForFunction(()=>document.querySelector('#viewport')?.getAttribute('data-renderer')==='pixi-webgl',{timeout:25000});
    const before=await page.locator('#coords').textContent();
    if(width===390){
      assert.ok(await page.locator('.touch-controls').isVisible(),'mobile D-pad must be visible');
      await page.locator('[data-move="right"]').click();
      assert.notEqual(await page.locator('#coords').textContent(),before,'touch D-pad did not move character');
    }else{
      await page.keyboard.press('ArrowRight');
      assert.notEqual(await page.locator('#coords').textContent(),before,'tablet keyboard movement failed');
    }
    await page.locator('#help-btn').click();
    assert.ok(await page.locator('#modal').isVisible(),'help modal failed at responsive viewport');
    await page.locator('#modal-close').click();
    const layout=await page.evaluate(()=>({
      viewport:document.documentElement.clientWidth,
      scrollWidth:document.documentElement.scrollWidth,
      dpadVisible:window.getComputedStyle(document.querySelector('.touch-controls')).display!=='none'
    }));
    const overflow=Math.max(0,layout.scrollWidth-layout.viewport);
    assert.ok(overflow<=2,`responsive layout overflows viewport by ${overflow}px at ${width}px`);
    const screenshot=`qa-evidence/responsive-${width}.png`;
    await page.screenshot({path:screenshot,fullPage:true,animations:'disabled'});
    assert.deepEqual(errors,[],'responsive scene caused browser errors');
    results.push({scene:`responsive-${width}`,width,height,layout,screenshot,errors});
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
  // v2.9: exercise a previously glyph-only overworld biome in both art modes.
  // Capture evidence without changing gameplay state, save schema or seed.
  const regionState=createGame(404);
  regionState.player={x:6,y:8};
  refreshVisibility(regionState);
  const regionContext=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  await regionContext.addInitScript(save=>localStorage.setItem('mutation404.v10.save',save),serialize(regionState));
  const regionPage=await regionContext.newPage(),regionErrors=[];
  regionPage.on('pageerror',err=>regionErrors.push(err.message));
  await regionPage.goto(base,{waitUntil:'networkidle',timeout:45000});
  await regionPage.locator('#start-continue').click();
  await regionPage.waitForFunction(()=>document.querySelector('#viewport')?.getAttribute('data-renderer')==='pixi-webgl',{timeout:25000});
  assert.equal(await regionPage.locator('#viewport').getAttribute('data-art-mode'),'pixel');
  await regionPage.screenshot({path:'qa-evidence/region-v29-pixel.png',fullPage:true,animations:'disabled'});
  await regionPage.locator('#art-mode-btn').click();
  assert.equal(await regionPage.locator('#viewport').getAttribute('data-art-mode'),'ascii');
  await regionPage.screenshot({path:'qa-evidence/region-v29-ascii.png',fullPage:true,animations:'disabled'});
  assert.deepEqual(regionErrors,[],'regional art mode caused a browser exception');
  results.push({scene:'regional-v29',pixel:'qa-evidence/region-v29-pixel.png',ascii:'qa-evidence/region-v29-ascii.png',errors:regionErrors});
  await regionContext.close();
  // v2.9: an actual living boss at every phase, plus a pre-impact tell.
  // Each save is real and loaded via the normal Continue button.
  for(const [phase,hp] of [[1,45],[2,25],[3,5]]){
    const bossState=createGame(404),room=generateDepth(404,3);
    bossState.zone='zero-3';
    bossState.tiles=room.tiles;bossState.seen=room.seen;bossState.player={x:14,y:10};
    bossState.enemies=[{id:'campaign-heart-custodian',kind:'drone',x:19,y:12,hp,mode:'hunting',lastKnown:{x:14,y:10},searchTurns:6}];
    bossState.fields=[];bossState.ground=[];bossState.tick=300;
    bossState.quest={status:'completed',outcome:'broadcast',fuseFound:true};
    bossState.events.push('heart','campaign:awakened');
    // Preserved telegraph fixture: the warning must already be committed to save data.
    bossState.events.push(`nacar:mark:400:13:11:${phase}`,`nacar:mark:400:15:9:${phase}`);
    for(const site of CAMPAIGN_SITES){
      bossState.events.push(`relic:${site.x}:${site.y}:2`);
      bossState.events.push(`elite-cache:ruin-${site.x}-${site.y}-2`);
    }
    refreshVisibility(bossState);
    const ctx=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
    await ctx.addInitScript(save=>localStorage.setItem('mutation404.v10.save',save),serialize(bossState));
    const pg=await ctx.newPage(),pageErrors=[];
    pg.on('pageerror',err=>pageErrors.push(err.message));
    await pg.goto(base,{waitUntil:'networkidle',timeout:45000});
    await pg.locator('#start-continue').click();
    assert.equal(await pg.locator('#nacar-boss').getAttribute('data-phase'),String(phase));
    assert.ok(await pg.locator('#nacar-boss').isVisible());
    assert.match(await pg.locator('#nacar-boss-warning').textContent(),/IMPACTO PRÓXIMO/);
    const screenshot=`qa-evidence/nacar-v29-phase-${phase}.png`;
    await pg.screenshot({path:screenshot,fullPage:true,animations:'disabled'});
    if(phase===3){
      await pg.locator('#art-mode-btn').click();
      assert.equal(await pg.locator('#viewport').getAttribute('data-art-mode'),'ascii');
      await pg.screenshot({path:'qa-evidence/nacar-v29-ascii.png',fullPage:true,animations:'disabled'});
    }
    assert.deepEqual(pageErrors,[],'Nácar phase screen caused browser errors');
    results.push({scene:`nacar-phase-${phase}`,screenshot,errors:pageErrors});
    await ctx.close();
  }
  // v2.8: verify an actual end-to-end finale UI using a valid pre-finale save.
  // Combat is verified separately by the core campaign tests; this fixture
  // represents the point after the final guardian has been defeated.
  const endState=createGame(404),heartRoom=generateDepth(404,3);
  endState.zone='zero-3';endState.tiles=heartRoom.tiles;endState.seen=heartRoom.seen;
  endState.enemies=[];endState.fields=[];endState.ground=[];endState.player={x:14,y:10};
  endState.quest={status:'completed',outcome:'broadcast',fuseFound:true};
  endState.events.push('heart','campaign:awakened');
  for(const site of CAMPAIGN_SITES){
    endState.events.push(`relic:${site.x}:${site.y}:2`);
    endState.events.push(`elite-cache:ruin-${site.x}-${site.y}-2`);
  }
  refreshVisibility(endState);
  const endingContext=await browser.newContext({viewport:{width:1440,height:900}});
  await endingContext.addInitScript(save=>{if(!localStorage.getItem('mutation404.v10.save'))localStorage.setItem('mutation404.v10.save',save);},serialize(endState));
  const endingPage=await endingContext.newPage(),endingErrors=[];
  endingPage.on('pageerror',err=>endingErrors.push(err.message));
  await endingPage.goto(base,{waitUntil:'networkidle',timeout:45000});
  assert.ok(await endingPage.locator('#start-continue').isEnabled());
  await endingPage.locator('#start-continue').click();
  await endingPage.keyboard.press('e');
  assert.match(await endingPage.locator('#modal-title').textContent(),/CORAZÓN DE NÁCAR/);
  await endingPage.getByRole('button',{name:/ENCADENAR/}).click();
  assert.match(await endingPage.locator('#modal-title').textContent(),/FINAL — EL JURAMENTO DEL FARO/);
  assert.match(await endingPage.locator('#modal-content').textContent(),/FIN DE LA CAMPAÑA/);
  await endingPage.screenshot({path:'qa-evidence/final-campana-v28.png',fullPage:true,animations:'disabled'});
  const persisted=await endingPage.evaluate(()=>JSON.parse(localStorage.getItem('mutation404.v10.save')||'{}'));
  assert.ok(persisted.events?.includes('campaign:ending:bind'),'ending must be saved before reload');
  await endingPage.locator('#modal-close').click();
  assert.match(await endingPage.locator('#quest-state').textContent(),/CAMPAÑA COMPLETA/);
  await endingPage.reload({waitUntil:'networkidle'});
  await endingPage.locator('#start-continue').click();
  assert.match(await endingPage.locator('#quest-state').textContent(),/CAMPAÑA COMPLETA/);
  assert.deepEqual(endingErrors,[]);
  results.push({scene:'final-campana',status:'passed',savedEnding:'bind',screenshot:'qa-evidence/final-campana-v28.png'});
  await endingContext.close();
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
