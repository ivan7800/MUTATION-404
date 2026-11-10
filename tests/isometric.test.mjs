import test from 'node:test';
import assert from 'node:assert/strict';
import {project,unproject,depth,direction} from '../play/js/apps/web/src/isometric.js';
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
test('production atlas includes complete directional poses and six biomes',()=>{
 for(const d of ['north','south','east','west'])for(const [pose,n] of [['idle',2],['walk',4],['attack',4],['hurt',1],['death',1]])for(let i=0;i<n;i++)assert.ok(meta[`hero-${d}-${pose}-${i}`]);
 for(const biome of ['salinas','ceniza','hierro','vidrio','medula','umbral']){
  for(let i=0;i<6;i++)assert.ok(meta[`floor-${biome}-${i}`]);
  for(const prop of ['rock','flora','wall'])for(let i=0;i<3;i++)assert.ok(meta[`${prop}-${biome}-${i}`]);
 }
 for(const [name,a] of Object.entries(meta)){assert.deepEqual(a.pivot,[48,112],name);assert.equal(a.rect[2],96);assert.equal(a.rect[3],128);}
});
