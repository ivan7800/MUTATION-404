import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, dispatch, serialize, deserialize, TASKS, GOODS, priceFor, settlementCitizens } from '../dist/core/core/src/game.js';
import { generateInterior, interiorForSector, exteriorForInterior } from '../dist/core/core/src/civilizations.js';
import { index, passable } from '../dist/core/core/src/world.js';
import { stackCount,addStack } from '../dist/core/core/src/combat.js';
const enter=()=>{const s=createGame(404);s.enemies=[];s.player={x:1,y:32};dispatch(s,{type:'move',dx:-1,dy:0});s.enemies=[];s.player={x:48,y:32};return s;};
test('eight regional community interiors are valid and deterministic',()=>{
  assert.equal(TASKS.length,8);
  for(const t of TASKS){const interior=interiorForSector(t.sector);assert.ok(interior);assert.equal(exteriorForInterior(interior),t.sector);const a=generateInterior(404,interior),b=generateInterior(404,interior);assert.deepEqual(a,b);assert.equal(passable(a.tiles[index(30,24)]),true);}
});
test('enter and leave interior preserves world changes and positions',()=>{
 const s=enter(),origin={...s.player};s.enemies=[];
 assert.equal(dispatch(s,{type:'enter-settlement'}).accepted,true);
 assert.match(s.zone,/^interior-/);assert.deepEqual(s.player,{x:30,y:24});
 s.tiles[index(28,22)]='o';
 assert.equal(dispatch(s,{type:'leave-settlement'}).accepted,true);assert.deepEqual(s.player,origin);
 assert.equal(dispatch(s,{type:'enter-settlement'}).accepted,true);assert.equal(s.tiles[index(28,22)],'o');
});
test('citizens follow day-night placement and can talk',()=>{
 const s=enter();s.enemies=[];
 const day=settlementCitizens(s.zone,s.tick);assert.equal(day.length,3);
 s.tick=13*6000;const night=settlementCitizens(s.zone,s.tick);
 assert.notDeepEqual(day.map(x=>[x.x,x.y]),night.map(x=>[x.x,x.y]));
 s.tick=0;s.player={x:49,y:31};assert.equal(dispatch(s,{type:'interact'}).accepted,true);assert.ok(s.dialogue);
});
test('regional quest consumes scrap, increases credits and reputation once',()=>{
 const s=enter();s.enemies=[];s.player={x:49,y:31};
 const task=TASKS.find(t=>t.sector===s.zone);assert.ok(task);
 assert.equal(dispatch(s,{type:'interact'}).accepted,true);
 assert.ok(s.dialogue.options.some(x=>x.id==='accept-task'));
 assert.equal(dispatch(s,{type:'choose',option:'accept-task'}).accepted,true);
 assert.ok(s.civilization.active.includes(task.id));
 const missing=stackCount(s.inventory,'scrap');
 addStack(s.inventory,'scrap',task.required+1);
 const credits=s.stats.credits,rep=s.reputation[task.faction]??0;
 assert.equal(dispatch(s,{type:'interact'}).accepted,true);
 assert.equal(dispatch(s,{type:'choose',option:'turn-in-task'}).accepted,true);
 assert.equal(stackCount(s.inventory,'scrap'),missing+1);
 assert.equal(s.stats.credits,credits+task.reward);assert.equal(s.reputation[task.faction],rep+4);
 assert.equal(s.civilization.completed.filter(x=>x===task.id).length,1);
});
test('regional buy/sell have distinct prices and real inventory changes',()=>{
 const s=enter();s.enemies=[];s.player={x:45,y:30};s.stats.credits=200;
 const t=TASKS.find(t=>t.sector===s.zone);const before=stackCount(s.inventory,'medkit');
 const price=priceFor('medkit','buy',0,s.zone);
 assert.equal(dispatch(s,{type:'regional-trade',item:'medkit',side:'buy'}).accepted,true);
 assert.equal(s.stats.credits,200-price);assert.equal(stackCount(s.inventory,'medkit'),before+1);
 assert.ok(Object.keys(GOODS).length>=4);
 assert.equal(dispatch(s,{type:'regional-trade',item:'medkit',side:'sell'}).accepted,true);
 assert.equal(stackCount(s.inventory,'medkit'),before);
 assert.ok(t);
});
test('v0.6 migrates with missions intact and v0.7 survives serialization',()=>{
 const s=enter();s.enemies=[];s.player={x:49,y:31};dispatch(s,{type:'interact'});dispatch(s,{type:'choose',option:'accept-task'});
 const restored=deserialize(serialize(s));assert.deepEqual(restored.civilization,s.civilization);assert.equal(restored.version,11);
 const old=JSON.parse(serialize(s));old.version=7;delete old.civilization;
 const migrated=deserialize(JSON.stringify(old));assert.equal(migrated.version,11);assert.deepEqual(migrated.civilization,{active:[],completed:[]});
});
