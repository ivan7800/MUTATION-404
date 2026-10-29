import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, dispatch, serialize, deserialize } from '../dist/core/core/src/game.js';
import { generateSector, SECTORS, coordsForZone } from '../dist/core/core/src/frontier.js';
import { index, WIDTH, HEIGHT, passable } from '../dist/core/core/src/world.js';

test('the 8 frontier sectors are deterministic, traversable and connected by roads',()=>{
  assert.equal(SECTORS.length,9);
  for(let seed=0;seed<30;seed++)for(const region of SECTORS.filter(v=>v.x||v.y)){
    const a=generateSector(seed,region.x,region.y),b=generateSector(seed,region.x,region.y);
    assert.deepEqual(a,b);assert.equal(a.tiles.length,WIDTH*HEIGHT);
    for(const [x,y] of [[1,32],[94,32],[48,1],[48,62],[48,32]])assert.ok(passable(a.tiles[index(x,y)]));
  }
});
test('cross west and east preserves loot, enemy state and exploration on returning',()=>{
  const s=createGame(404);s.enemies=[];s.player={x:1,y:32};
  const prevTile=s.tiles[index(20,20)];
  assert.equal(dispatch(s,{type:'move',dx:-1,dy:0}).accepted,true);
  assert.equal(s.zone,'sector--1-0');assert.deepEqual(coordsForZone(s.zone),{x:-1,y:0});
  s.enemies=[];s.tiles[index(21,21)]='!';s.ground.push({id:'kept',x:30,y:30,item:'scrap',count:2});s.player={x:94,y:32};
  assert.equal(dispatch(s,{type:'move',dx:1,dy:0}).accepted,true);
  assert.equal(s.zone,'surface');assert.equal(s.tiles[index(20,20)],prevTile);
  s.player={x:1,y:32};dispatch(s,{type:'move',dx:-1,dy:0});
  assert.equal(s.zone,'sector--1-0');assert.equal(s.tiles[index(21,21)],'!');
  assert.equal(s.ground.some(g=>g.id==='kept'),true);
  assert.equal(s.enemies.length,0);
  const loaded=deserialize(serialize(s));assert.equal(loaded.zone,s.zone);
  assert.equal(loaded.tiles[index(21,21)],'!');
});
test('enclave interaction gives one-time faction reputation and credits',()=>{
  const s=createGame(404);s.enemies=[];s.player={x:94,y:32};
  dispatch(s,{type:'move',dx:1,dy:0});assert.equal(s.zone,'sector-1-0');
  s.enemies=[];s.player={x:48,y:32};
  const credits=s.stats.credits;
  assert.equal(dispatch(s,{type:'interact'}).accepted,true);
  assert.equal(s.stats.credits,credits+8);
  assert.equal(s.events.includes('enclave:sector-1-0'),true);
  dispatch(s,{type:'close-dialog'});dispatch(s,{type:'interact'});
  assert.equal(s.stats.credits,credits+8);
});
test('old v0.5 zone and quest migrate without loss',()=>{
  const s=createGame(404);s.player={x:62,y:44};dispatch(s,{type:'descend'});
  const raw=JSON.parse(serialize(s));raw.version=6;
  const loaded=deserialize(JSON.stringify(raw));
  assert.equal(loaded.version,11);assert.equal(loaded.zone,'zero-1');
  assert.equal(loaded.quest.status,s.quest.status);
});
test('travel outside the world is blocked without moving or consuming time',()=>{
  const s=createGame(404);s.player={x:94,y:32};dispatch(s,{type:'move',dx:1,dy:0});s.enemies=[];
  s.player={x:94,y:32};const tick=s.tick;
  assert.equal(dispatch(s,{type:'move',dx:1,dy:0}).accepted,false);
  assert.equal(s.tick,tick);assert.equal(s.zone,'sector-1-0');
});
