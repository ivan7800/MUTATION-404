import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, dispatch, serialize, deserialize, RESOURCE_INFO, stackCount } from '../dist/core/core/src/game.js';

test('ecological resource generation is reproducible by seed',()=>{
  const s=createGame(404), t=createGame(404);
  assert.deepEqual(s.ecology.nodes,t.ecology.nodes);
  assert.ok(s.ecology.nodes.length>15);
  assert.equal(new Set(s.ecology.nodes.map(n=>n.id)).size,s.ecology.nodes.length);
});
test('resource deposits can be harvested, deplete, and persist on reload',()=>{
  const s=createGame(404), node=s.ecology.nodes.find(n=>n.quantity>0);
  assert.ok(node);
  s.player={x:node.x,y:node.y};
  const item=RESOURCE_INFO[node.kind].product;
  const before=stackCount(s.inventory,item);
  const remaining=node.quantity;
  const result=dispatch(s,{type:'harvest'});
  assert.equal(result.accepted,true);
  assert.equal(stackCount(s.inventory,item),before+RESOURCE_INFO[node.kind].amount);
  assert.equal(node.quantity,remaining-1);
  const loaded=deserialize(serialize(s));
  assert.equal(loaded.ecology.nodes.find(n=>n.id===node.id).quantity,remaining-1);
  assert.equal(loaded.version,11);
  loaded.player={x:node.x,y:node.y};
  for(let i=0;i<remaining-1;i++) assert.equal(dispatch(loaded,{type:'harvest'}).accepted,true);
  assert.equal(loaded.ecology.nodes.find(n=>n.id===node.id).quantity,0);
  // No regeneration merely by loading a save.
  assert.equal(deserialize(serialize(loaded)).ecology.nodes.find(n=>n.id===node.id).quantity,0);
});
test('crafting consumes exact resources and grants tangible items',()=>{
  const s=createGame(404);
  const before=stackCount(s.inventory,'ammo');
  const scrap=stackCount(s.inventory,'scrap');
  assert.equal(dispatch(s,{type:'craft',recipe:'ammunition'}).accepted,scrap>=2);
  if(scrap>=2){assert.equal(stackCount(s.inventory,'ammo'),before+5);assert.equal(stackCount(s.inventory,'scrap'),scrap-2);}
});
test('crafting cannot grant resources without the required ingredients',()=>{
  const s=createGame(404);
  s.inventory=[];
  const before=s.tick;
  assert.equal(dispatch(s,{type:'craft',recipe:'medicine'}).accepted,false);
  assert.deepEqual(s.inventory,[]);
  assert.equal(s.tick,before);
  assert.equal(dispatch(s,{type:'craft',recipe:'nonexistent'}).accepted,false);
});
test('distant ecological cycles are deterministic and do not create infinite migration',()=>{
  const a=createGame(404),b=createGame(404);
  for(let i=0;i<31;i++){dispatch(a,{type:'wait'});dispatch(b,{type:'wait'});}
  assert.deepEqual(a.ecology,b.ecology);
  assert.equal(a.ecology.lastPulse,1);
  assert.deepEqual(a.enemies,b.enemies);
  assert.ok(Object.values(a.ecology.pressure).every(v=>v>=0&&v<=5));
});
test('v0.7 saves migrate to v0.8 without losing character or civilization progress',()=>{
  const s=createGame(404);
  s.stats.credits+=123;s.civilization.active.push('task:-1:-1');
  const old=JSON.parse(serialize(s));old.version=8;delete old.ecology;
  const load=deserialize(JSON.stringify(old));
  assert.equal(load.version,11);assert.equal(load.stats.credits,s.stats.credits);
  assert.equal(load.ecology.lastPulse,0);
  assert.deepEqual(load.civilization,s.civilization);
});
test('corrupt ecology saves are rejected',()=>{
  const s=createGame(404);const j=JSON.parse(serialize(s));
  j.ecology.nodes[0].quantity=9999;
  assert.throws(()=>deserialize(JSON.stringify(j)),/ecológic/i);
});
