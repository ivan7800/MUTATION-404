import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dispatch,serialize,deserialize,stackCount} from '../dist/core/core/src/game.js';
import {generateDepth} from '../dist/core/core/src/depths.js';
import {index,passable,WIDTH,HEIGHT} from '../dist/core/core/src/world.js';

const setup=()=>{const s=createGame(404);s.enemies=[];s.player={x:62,y:44};return s;};
test('three procedural underground levels are deterministic and traversable',()=>{
  for(let seed=1;seed<=100;seed++)for(const depth of [1,2,3]){
    const a=generateDepth(seed,depth),b=generateDepth(seed,depth);
    assert.deepEqual(a,b);assert.equal(a.tiles.length,WIDTH*HEIGHT);
    assert.equal(passable(a.tiles[index(10,10)]),true);
    assert.equal(passable(a.tiles[index(14,10)]),true);
    assert.ok(a.tiles.filter(t=>t!== '#').length>450);
  }
});
test('descend and return preserves the surface and original position',()=>{
  const s=setup(),tiles=s.tiles,oldPlayer={...s.player};
  assert.equal(dispatch(s,{type:'descend'}).accepted,true);
  assert.equal(s.zone,'zero-1');assert.equal(s.player.x,10);
  s.enemies=[];
  assert.equal(dispatch(s,{type:'ascend'}).accepted,true);
  assert.equal(s.zone,'surface');assert.deepEqual(s.player,oldPlayer);assert.equal(s.tiles,tiles);
});
test('all underground floors persist their enemy and exploration state when revisiting',()=>{
  const s=setup();dispatch(s,{type:'descend'});s.enemies=[];
  s.tiles[index(17,12)]='!';
  s.player={x:14,y:10};assert.equal(dispatch(s,{type:'descend'}).accepted,true);assert.equal(s.zone,'zero-2');
  s.enemies=[];s.player={x:14,y:10};assert.equal(dispatch(s,{type:'descend'}).accepted,true);assert.equal(s.zone,'zero-3');
  assert.ok(s.events.includes('heart'));
  s.enemies=[];s.player={x:10,y:10};assert.equal(dispatch(s,{type:'ascend'}).accepted,true);
  s.player={x:10,y:10};assert.equal(dispatch(s,{type:'ascend'}).accepted,true);
  assert.equal(s.tiles[index(17,12)],'!');assert.equal(s.enemies.length,0);
});
test('purchase and sale require merchant adjacency and change actual credits and items',()=>{
  const s=createGame(404);s.enemies=[];
  const credits=s.stats.credits,meds=stackCount(s.inventory,'medkit');
  assert.equal(dispatch(s,{type:'trade',side:'buy',item:'medkit'}).accepted,false);
  s.player={x:10,y:35};
  assert.equal(dispatch(s,{type:'trade',side:'buy',item:'medkit'}).accepted,true);
  assert.equal(s.stats.credits,credits-12);assert.equal(stackCount(s.inventory,'medkit'),meds+1);
  assert.equal(dispatch(s,{type:'trade',side:'sell',item:'medkit'}).accepted,true);
  assert.equal(s.stats.credits,credits-7);assert.equal(stackCount(s.inventory,'medkit'),meds);
  assert.ok(s.reputation.ferral>=2);
});
test('v0.5 saves retain underground state and can revisit past floors',()=>{
  const s=setup();dispatch(s,{type:'descend'});s.enemies=[];s.tiles[index(11,11)]='o';
  const restored=deserialize(serialize(s));assert.equal(restored.zone,'zero-1');assert.equal(restored.version,11);
  assert.equal(restored.tiles[index(11,11)],'o');assert.equal(dispatch(restored,{type:'ascend'}).accepted,true);
  restored.player={x:62,y:44};assert.equal(dispatch(restored,{type:'descend'}).accepted,true);
  assert.equal(restored.tiles[index(11,11)],'o');
});
test('v0.4 save migrates to v0.5 without loss of progress',()=>{
  const s=createGame(404);s.quest.status='active';s.stats.credits=123;s.player={x:32,y:32};
  const old=JSON.parse(serialize(s));old.version=5;delete old.zone;delete old.zones;delete old.reputation;delete old.events;
  const restored=deserialize(JSON.stringify(old));
  assert.equal(restored.version,11);assert.equal(restored.quest.status,'active');assert.equal(restored.stats.credits,123);
  assert.equal(restored.zone,'surface');assert.deepEqual(restored.events,[]);
});
test('emergent caravan event fires once, adds pickup and reputation',()=>{
  const s=createGame(404);s.enemies=[];s.player={x:10,y:35};s.tick=2200;
  assert.equal(dispatch(s,{type:'wait'}).accepted,true);
  assert.ok(s.events.includes('caravan'));assert.equal(s.ground.filter(x=>x.id==='caravan-gift').length,1);
  dispatch(s,{type:'wait'});assert.equal(s.ground.filter(x=>x.id==='caravan-gift').length,1);
});
