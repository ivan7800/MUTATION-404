import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createGame,serialize,refreshVisibility,ENEMY_DEFS} from '../dist/core/core/src/game.js';
import {composition} from '../play/js/apps/web/src/ascii-art.js';
import {generateRuin,generateDepth} from '../dist/core/core/src/depths.js';
import {CAMPAIGN_SITES} from '../dist/core/core/src/campaign.js';
const PORT=8877;
const base=`http://127.0.0.1:${PORT}/`;
const server=spawn(process.execPath,['scripts/server.mjs','--no-open'],{env:{...process.env,PORT:String(PORT)},stdio:'pipe'});
const failures=[],results=[];
const browserExecutable=process.env.CHROME_PATH||process.env.CHROMIUM_PATH||'/usr/bin/chromium';
await mkdir('qa-evidence',{recursive:true});
let browser;
const launchBrowser=()=>chromium.launch({headless:true,executablePath:browserExecutable,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const resetBrowser=async()=>{await browser?.close();browser=await launchBrowser();};
try{
  let ready=false;
  for(let n=0;n<120;n++){
    try{const r=await fetch(base);if(r.ok){ready=true;break;}}
    catch{/* server is still starting */}
    await new Promise(r=>setTimeout(r,100));
  }
  assert.ok(ready,`QA server did not become ready at ${base}`);
  browser=await launchBrowser();
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
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning')console.log('BROWSER',m.text());});
    await page.goto(base,{waitUntil:'networkidle',timeout:45000});
    assert.ok(await page.locator('#start-menu').isVisible(),'startup menu must open before gameplay');
    assert.equal(await page.locator('#start-file').isVisible(),false,'native file picker stays hidden until import is requested');
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
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForTimeout(200);
    const stillA=await page.locator('#viewport canvas:visible').screenshot({animations:'disabled'});
    await page.waitForTimeout(400);
    const stillB=await page.locator('#viewport canvas:visible').screenshot({animations:'disabled'});
    assert.deepEqual(stillB,stillA,'reduced motion must freeze ambient canvas frames after a live preference change');
    await page.emulateMedia({reducedMotion:'no-preference'});
    assert.match(await page.locator('#survival-strip').textContent(),/PV .*AMPOLLAS .*PÚAS/);
    assert.equal(await page.locator('#survival-strip').getAttribute('data-risk'),'stable');
    const before=await page.locator('#coords').textContent();
    await page.keyboard.press('ArrowRight');
    const after=await page.locator('#coords').textContent();
    assert.notEqual(after,before,'movement input did not update player position');
    // Distinct fast presses must not be dropped by the repeat-key throttle.
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('#coords').textContent(),after,'fast opposite key presses must both execute');
    await page.locator('#zoom-in').click();
    await page.locator('#zoom-out').click();
    await page.locator('#help-btn').click();
    assert.ok(await page.locator('#modal').isVisible(),'help modal did not open');
    for(let tab=0;tab<5;tab++){
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(()=>!!document.activeElement?.closest('#modal')),true,'modal focus escaped into gameplay');
    }
    await page.locator('#modal-close').click();
    await page.locator('#save-btn').click();
    await page.evaluate(()=>{
      const original=URL.createObjectURL;
      URL.createObjectURL=blob=>{window.__mutation404ExportType=blob.type;return original.call(URL,blob);};
    });
    await page.locator('#export-btn').click();
    assert.equal(await page.evaluate(()=>window.__mutation404ExportType),'application/json','save export must create a JSON blob');
    assert.match(await page.locator('#log').textContent(),/Copia .*exportada/,'save export must record the action');
    await page.locator('#menu-btn').click();
    assert.ok(await page.locator('#start-menu').isVisible(),'menu button must pause into title screen');
    assert.ok(await page.evaluate(()=>localStorage.getItem('mutation404.v10.save.backup')),'saving twice must preserve a previous save');
    assert.equal(await page.locator('#start-continue').isEnabled(),true,'save must enable continue');
    await page.locator('#start-continue').click();
    assert.equal(await page.locator('#start-menu').isVisible(),false,'continue must resume gameplay');
    assert.equal(await page.locator('#coords').textContent(),after,'continue must restore last saved player coordinates');
    await page.locator('#load-btn').click();
    // Simulate a truncated current slot while keeping the previous valid save.
    // beforeunload autosaves the active game; corrupt only after the next document starts.
    await page.addInitScript(()=>localStorage.setItem('mutation404.v10.save','{"version":'));
    await page.reload({waitUntil:'networkidle'});
    assert.match(await page.locator('#start-save-info').textContent(),/COPIA DE RESCATE DISPONIBLE/);
    const rescue=await page.evaluate(()=>localStorage.getItem('mutation404.v10.save.backup'));
    await page.locator('#start-continue').click();
    assert.equal(await page.locator('#coords').textContent(),after,'backup must restore the saved position');
    await page.locator('#save-btn').click();
    assert.ok(await page.evaluate(raw=>localStorage.getItem('mutation404.v10.save.backup')===raw,rescue),'corrupt primary must not replace valid backup');
    const repaired=await page.evaluate(()=>localStorage.getItem('mutation404.v10.save'));
    assert.doesNotThrow(()=>JSON.parse(repaired),'saving the recovered session must repair the current slot');
    const png=`qa-evidence/${mode}.png`;
    await page.screenshot({path:png,fullPage:true,animations:'disabled'});
    assert.deepEqual(errors,[],'unhandled browser exceptions');
    const info={mode,renderer:expected,before,after,errors,canvasCount:await page.locator('#viewport canvas').count(),screenshot:png};
    results.push(info);
    await context.close();
  }
  // Private or restricted browsers may deny every storage call. A session must
  // still start, and saving must report the failure instead of crashing.
  {
    const context=await browser.newContext({viewport:{width:1000,height:740}});
    await context.addInitScript(()=>{
      for(const name of ['getItem','setItem'])Object.defineProperty(Storage.prototype,name,{value(){throw new DOMException('Storage denied','SecurityError');}});
    });
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base,{waitUntil:'networkidle',timeout:45000});
    assert.equal(await page.locator('#start-continue').isDisabled(),true);
    await page.locator('#start-new').click();
    await page.locator('#save-btn').click();
    assert.equal(await page.locator('#save-status').textContent(),'Error de guardado');
    assert.deepEqual(errors,[],'storage denial must not crash the game');
    results.push({scene:'storage-denied',status:'passed',errors});
    await context.close();
  }
  // Production audit: exercise the on-screen D-pad at phone and tablet sizes.
  // Record actual viewport overflow instead of assuming the desktop checks cover it.
  await resetBrowser();
  for(const [width,height] of [[390,844],[768,1024]]){
    const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:width===390,hasTouch:width===390});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning')console.log('BROWSER',m.text());});
    await page.goto(base,{waitUntil:'networkidle',timeout:45000});
    await page.locator('#start-new').click();
    await page.waitForFunction(()=>document.querySelector('#viewport')?.getAttribute('data-renderer')==='pixi-webgl',{timeout:25000});
    const before=await page.locator('#coords').textContent();
    if(width===390){
      assert.ok(await page.locator('#viewport').evaluate(el=>{const a=el.getBoundingClientRect(),b=el.querySelector('canvas.pixel-canvas').getBoundingClientRect();return Math.abs((a.left+a.right-b.left-b.right)/2)<2;}),'mobile camera canvas must remain centered in the viewport');
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
  // Unified ASCII isometric presentation in the overworld and Ojo del Silencio.
  await resetBrowser();
  const state=createGame(404),room=generateRuin(404,-1,-1,2);
  state.zone='ruin--1--1-2';state.tiles=room.tiles;state.seen=room.seen;
  state.fields=room.fields;state.ground=room.ground;state.enemies=room.enemies;
  state.player={x:19,y:12};
  state.fields.push({x:19,y:12,kind:'spores',ttl:10},{x:20,y:12,kind:'fire',ttl:10});
  refreshVisibility(state);
  const eyeSave=serialize(state);
  for(const scene of ['faro-ascii-unified','ojo-ascii-unified']){
    const eye=scene.startsWith('ojo');
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
    const mode=await page.locator('#viewport').getAttribute('data-art-mode');
    assert.equal(mode,'pixel',`${scene} debe arrancar en pixel; errores: ${errors.join(' | ')}`);
    await page.locator('#art-mode-btn').click();
    await page.waitForFunction(()=>document.querySelector('#viewport')?.getAttribute('data-art-mode')==='ascii');
    await page.locator('#art-mode-btn').click();
    await page.waitForFunction(()=>document.querySelector('#viewport')?.getAttribute('data-art-mode')==='pixel');
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
  // v2.9: exercise a previously glyph-only overworld biome in the unified mode.
  // Capture evidence without changing gameplay state, save schema or seed.
  await resetBrowser();
  const regionState=createGame(404);
  regionState.player={x:6,y:8};
  refreshVisibility(regionState);
  const regionContext=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  await regionContext.addInitScript(save=>localStorage.setItem('mutation404.v10.save',save),serialize(regionState));
  const regionPage=await regionContext.newPage(),regionErrors=[];
  regionPage.on('pageerror',err=>regionErrors.push(err.message));
  await regionPage.goto(base+'?profile=1',{waitUntil:'networkidle',timeout:45000});
  await regionPage.locator('#start-continue').click();
  await regionPage.waitForFunction(()=>document.querySelector('#viewport')?.getAttribute('data-renderer')==='pixi-webgl',{timeout:25000});
  await regionPage.waitForFunction(()=>document.querySelector('#viewport')?.getAttribute('data-art-mode')==='pixel',{timeout:25000});
  assert.equal(await regionPage.locator('#viewport').getAttribute('data-art-mode'),'pixel');
  // Performance diagnostics are scoped to the scene builder, NOT GPU time/FPS.
  await regionPage.waitForFunction(()=>window.__mutation404RenderProfile?.builds>=2,{timeout:10000});
  const firstProfile=await regionPage.evaluate(()=>window.__mutation404RenderProfile);
  await regionPage.waitForTimeout(700);
  const latestProfile=await regionPage.evaluate(()=>window.__mutation404RenderProfile);
  assert.ok(latestProfile.frames>firstProfile.frames,'pixel ambience must redraw when active');
  assert.ok(latestProfile.floorDraws<latestProfile.frames,'static floor must be reused across ambience draws');
  assert.ok(latestProfile.cachedCells>0,'region cache must contain world cells');
  assert.ok(latestProfile.allocatedSprites>=latestProfile.activeSprites,'sprite pool must cover visible cells');
  assert.ok(latestProfile.allocatedSprites<47*27+250,'regional view should not eagerly allocate the entire pool');
  assert.ok(latestProfile.peakActiveSprites>=latestProfile.activeSprites,'pool peak should never trail current count');
  assert.ok(Number.isFinite(latestProfile.meanBuildMs),'scene build time is not finite');
  results.push({scene:'render-profile-v29',baseline:firstProfile,after:latestProfile,
    note:'JavaScript scene construction only; browser GPU timing not measured'});
  await regionPage.screenshot({path:'qa-evidence/region-v29-ascii-unified.png',fullPage:true,animations:'disabled'});
  assert.deepEqual(regionErrors,[],'regional ASCII scene caused a browser exception');
  results.push({scene:'regional-v29-ascii-unified',screenshot:'qa-evidence/region-v29-ascii-unified.png',errors:regionErrors});
  await regionContext.close();
  // v2.9: an actual living boss at every phase, plus a pre-impact tell.
  // Each save is real and loaded via the normal Continue button.
  await resetBrowser();
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
    assert.equal(await pg.locator('#viewport').getAttribute('data-art-mode'),'pixel');
    assert.deepEqual(pageErrors,[],'Nácar phase screen caused browser errors');
    results.push({scene:`nacar-phase-${phase}`,screenshot,errors:pageErrors});
    await ctx.close();
  }
  // v2.8: verify an actual end-to-end finale UI using a valid pre-finale save.
  // Combat is verified separately by the core campaign tests; this fixture
  // represents the point after the final guardian has been defeated.
  await resetBrowser();
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
  // Isolated combat scenes verify the real UI dispatch and both glyph painters.
  // Fixtures position a living enemy; attacks themselves use the normal wait command.
  await resetBrowser();
  for(const mode of ['webgl','canvas-fallback'])for(const kind of Object.keys(ENEMY_DEFS)){
    if(mode==='webgl')await resetBrowser();
    const fixture=createGame(404);
    fixture.zone='zero-1';fixture.tiles.fill('.');fixture.fields=[];fixture.player={x:20,y:20};
    fixture.enemies=[{id:'visual-'+kind,kind,x:21,y:20,hp:ENEMY_DEFS[kind].hp,mode:'hunting',lastKnown:{x:20,y:20},searchTurns:3}];
    refreshVisibility(fixture);
    const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
    try{
      await context.addInitScript(({raw,fallback})=>{
        localStorage.setItem('mutation404.v10.save',raw);
        const get=HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext=function(type,...args){
          if(fallback&&['webgl','webgl2','experimental-webgl'].includes(type))return null;
          return get.call(this,type,...args);
        };
        window.__attackRows=[];window.__glyphClips=[];
        const text=CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText=function(row,...args){
          if(this.canvas.width===80&&this.canvas.height===80){
            const [x,y]=args,m=this.measureText(row);
            if(x-m.actualBoundingBoxLeft<-.5||x+m.actualBoundingBoxRight>80.5||y-m.actualBoundingBoxAscent<-.5||y+m.actualBoundingBoxDescent>80.5)window.__glyphClips.push(String(row));
          }
          window.__attackRows.push(String(row));
          if(window.__attackRows.length>10000)window.__attackRows.splice(0,5000);
          return text.call(this,row,...args);
        };
      },{raw:serialize(fixture),fallback:mode==='canvas-fallback'});
      const page=await context.newPage(),errors=[];
      page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning')console.log('BROWSER',m.text());});
      await page.goto(base,{waitUntil:'networkidle'});
      await page.locator('#start-continue').click();
      const expected=mode==='webgl'?'pixi-webgl':'canvas2d';
      await page.waitForFunction(value=>document.querySelector('#viewport')?.dataset.renderer===value,expected);
      if(mode==='webgl'){
        await page.waitForFunction(()=>document.querySelector('#viewport')?.dataset.artMode==='pixel',{timeout:25000});
        await page.screenshot({path:`qa-evidence/enemy-pixel-${kind}.png`,fullPage:true,animations:'disabled'});
        await page.locator('#art-mode-btn').click();
        await page.waitForFunction(()=>document.querySelector('#viewport')?.dataset.artMode==='ascii');
      }
      await page.evaluate(()=>{window.__attackRows=[];});
      await page.locator('.secondary-actions').evaluate(el=>el.open=true);await page.locator('#wait-btn').click();
      const rows=composition('enemy:attack:'+ENEMY_DEFS[kind].glyph);
      let poseSeen=false;
      for(let attempt=0;attempt<8&&!poseSeen;attempt++){
        try{
          await page.waitForFunction(expectedRows=>expectedRows.every(row=>window.__attackRows.includes(row)),rows,{timeout:3000});
          poseSeen=true;
        }catch{
          if(attempt<7)await page.locator('.secondary-actions').evaluate(el=>el.open=true);await page.locator('#wait-btn').click();
        }
      }
      if(!poseSeen)throw new Error(`attack pose timeout for ${kind}/${mode}; expected=${JSON.stringify(rows)} observed=${JSON.stringify(await page.evaluate(()=>window.__attackRows.slice(-40)))}`);
      assert.deepEqual(await page.evaluate(()=>window.__glyphClips),[],'glyph atlas must fit the painted text');
      assert.deepEqual(errors,[]);
      results.push({scene:`enemy-attack-${kind}-${mode}`,status:'passed',glyphRowsObserved:rows,fixture:true});
    }finally{await context.close();}
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
