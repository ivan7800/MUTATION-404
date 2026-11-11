import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createGame, refreshVisibility, serialize } from '../dist/core/core/src/game.js';
import { BIOMES, biomeAt } from '../dist/core/core/src/biomes.js';
import { index, passable, within } from '../dist/core/core/src/world.js';

const port=8878;
const base=`http://127.0.0.1:${port}/`;
const server=spawn(process.execPath,['scripts/server.mjs','--no-open'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
const points={salinas:[34,32],ceniza:[4,3],hierro:[91,4],vidrio:[3,61],medula:[92,61],umbral:[53,64]};
const executable=process.env.CHROME_PATH||process.env.CHROMIUM_PATH||'/usr/bin/chromium';
const results=[];
await mkdir('qa-evidence/pixel-biomes',{recursive:true});
try{
  for(let attempt=0;attempt<100;attempt++){
    try{if((await fetch(base)).ok)break;}catch{/* server is still starting */}
    await new Promise(resolve=>setTimeout(resolve,100));
    if(attempt===99)throw new Error('QA server did not start');
  }
  for(const [id,[x,y]] of Object.entries(points)){
    const browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    const state=createGame(404);
    let point=[x,y];
    for(let radius=0;radius<10;radius++){
      let found;
      for(let dy=-radius;dy<=radius&&!found;dy++)for(let dx=-radius;dx<=radius;dx++){
        const nx=x+dx,ny=y+dy;
        if(within(nx,ny)&&passable(state.tiles[index(nx,ny)])&&biomeAt(404,nx,ny)===id){found=[nx,ny];break;}
      }
      if(found){point=found;break;}
    }
    state.player={x:point[0],y:point[1]};refreshVisibility(state);
    const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
    await context.addInitScript(raw=>localStorage.setItem('mutation404.v10.save',raw),serialize(state));
    const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base,{waitUntil:'networkidle',timeout:45000});
    await page.locator('#start-continue').click();
    await page.waitForFunction(()=>document.querySelector('#viewport')?.dataset.renderer==='pixi-webgl',{timeout:25000});
    await page.waitForFunction(()=>document.querySelector('#viewport')?.dataset.artMode==='pixel',{timeout:25000});
    assert.equal(biomeAt(404,point[0],point[1]),id);
    assert.equal(await page.locator('#viewport').getAttribute('data-art-mode'),'pixel');
    assert.deepEqual(errors,[]);
    const screenshot=`qa-evidence/pixel-biomes/${id}.png`;
    await page.screenshot({path:screenshot,fullPage:true,animations:'disabled'});
    results.push({biome:id,name:BIOMES[id].name,coordinate:point,screenshot});
    await context.close();await browser.close();
  }
  await writeFile('qa-evidence/pixel-biomes/report.json',JSON.stringify({status:'passed',results},null,2));
  console.log('PASS pixel biome QA',results);
}catch(error){
  await writeFile('qa-evidence/pixel-biomes/report.json',JSON.stringify({status:'failed',results,error:String(error)},null,2));
  console.error(error);process.exitCode=1;
}finally{server.kill();}
