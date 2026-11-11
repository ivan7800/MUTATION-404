import test from 'node:test';
import assert from 'node:assert/strict';
import {project,unproject,depth,direction,wallVariant,ambientCells,pixelArtScaleForBiome} from '../play/js/apps/web/src/isometric.js';
import {readFileSync} from 'node:fs';
const meta=JSON.parse(readFileSync('apps/web/public/isometric/nacar.json'));
test('projection round trips world positions across zoom and camera offsets',()=>{
 for(const zoom of [.65,1,1.6])for(const [x,y] of [[0,0],[32,32],[95,63],[12.4,18.8]]){
  const p=project(x,y),px=p.x*zoom+137,py=p.y*zoom-84;
  const back=unproject((px-137)/zoom,(py+84)/zoom);
  assert.ok(Math.abs(back.x-x)<1e-10);assert.ok(Math.abs(back.y-y)<1e-10);
 }
});
test('sorting feet puts foreground architecture after hero regardless of category',()=>{
 const entries=[{type:'wall',x:33,y:32},{type:'hero',x:32,y:32},{type:'wall',x:31,y:32}];
 entries.sort((a,b)=>depth(a.x,a.y)-depth(b.x,b.y));
 assert.deepEqual(entries.map(e=>e.type),['wall','hero','wall']);
 assert.ok(depth(32,32)<depth(32,32,2));
 assert.equal(direction(1,0),'east');assert.equal(direction(0,-1),'north');
});
test('biome landmarks stay sparse so walls read as terrain, not repeated buildings',()=>{
 for(let v=0;v<4;v++)assert.equal(wallVariant(8,8,v),0);
 assert.equal(wallVariant(0,0,4),1);assert.equal(wallVariant(1,0,4),0);
 assert.equal(wallVariant(7,0,5),2);assert.equal(wallVariant(6,0,5),0);
 const tall=[];for(let y=0;y<64;y++)for(let x=0;x<96;x++)if(wallVariant(x,y,(x*17+y*31)%6)===2)tall.push([x,y]);
 assert.ok(tall.length<96*64/10,'landmark towers should stay rare across a large map');
});
test('ambient particle placement is deterministic and independent of game simulation',()=>{
 const a=ambientCells(404,32,32),b=ambientCells(404,32,32),other=ambientCells(405,32,32);
 assert.deepEqual(a,b);assert.notDeepEqual(a,other);assert.equal(a.length,14);
 for(const p of a){assert.ok(p.x>=20&&p.x<=44);assert.ok(p.y>=20&&p.y<=44);assert.ok(p.phase>=0&&p.phase<=255);}
});
test('the 16-bit resolution prototype is isolated to Salinas',()=>{
 assert.equal(pixelArtScaleForBiome('salinas'),3);
 for(const biome of ['ceniza','hierro','vidrio','medula','umbral'])assert.equal(pixelArtScaleForBiome(biome),1);
});
test('production atlas includes complete directional poses and six biomes',()=>{
 for(const d of ['north','south','east','west'])for(const [pose,n] of [['idle',2],['walk',4],['attack',4],['hurt',1],['death',1]])for(let i=0;i<n;i++)assert.ok(meta[`hero-${d}-${pose}-${i}`]);
 for(const biome of ['salinas','ceniza','hierro','vidrio','medula','umbral']){
  for(let i=0;i<6;i++)assert.ok(meta[`floor-${biome}-${i}`]);
  for(const prop of ['rock','flora','wall'])for(let i=0;i<3;i++)assert.ok(meta[`${prop}-${biome}-${i}`]);
 }
 for(const [name,a] of Object.entries(meta)){assert.deepEqual(a.pivot,[48,112],name);assert.equal(a.rect[2],96);assert.equal(a.rect[3],128);}
});

import {PixelRenderer} from '../play/js/apps/web/src/pixel-renderer.js';
import {createGame,serialize} from '../dist/core/core/src/game.js';
test('production painter keeps the save immutable, actors upright and cached floor out of animation',()=>{
 const calls=[],floorCalls=[],pixelCalls=[];
 const context=list=>new Proxy({globalAlpha:1,drawImage(...args){list.push({alpha:this.globalAlpha,args});}}, {get:(obj,key)=>key in obj?obj[key]:()=>{}});
 const renderer=Object.create(PixelRenderer.prototype);
 Object.assign(renderer,{ctx:context(calls),floorCtx:context(floorCalls),pixelCtx:context(pixelCalls),canvas:{},pixelBuffer:{width:392,height:187},floor:{},atlas:{},assets:meta,scale:1,entries:[],origin:{x:0,y:0},frames:0,builds:0,totalMs:0,lastMs:0,reducedMotion:true,heroAction:null,heroUntil:0,cues:[],hits:new Map(),enemyActions:new Map(),present:null});
 const s=createGame(404);s.tiles.fill('.');s.visible.fill(1);s.seen.fill(1);s.enemies=[];
 s.tiles[32*96+31]='#';s.tiles[32*96+33]='#';
 const before=serialize(s);renderer.draw(s);assert.equal(serialize(s),before);
 const back=renderer.entries.findIndex(e=>e.x===31&&e.y===32);
 const hero=renderer.entries.findIndex(e=>e.id==='hero');
 const front=renderer.entries.findIndex(e=>e.x===33&&e.y===32);
 assert.ok(back<hero&&hero<front);
 assert.ok(calls.some(c=>c.alpha===.35),'foreground obstruction must fade when overlapping the hero');
 for(const c of calls.filter(c=>c.args.length===9)){assert.equal(c.args[7],96);assert.equal(c.args[8],128,'upright sprite height must stay intact');}
 const built=floorCalls.length;renderer.render(180);assert.equal(floorCalls.length,built,'ambient presentation must reuse the built floor');assert.equal(pixelCalls.length,2,'each Salinas presentation must pass through the low-resolution pixel buffer');assert.equal(pixelCalls[0].args[3],392);assert.equal(pixelCalls[0].args[4],187);assert.equal(serialize(s),before);
});
