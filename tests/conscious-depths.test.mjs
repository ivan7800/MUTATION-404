import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dispatch,deserialize,serialize} from '../dist/core/core/src/game.js';
import {generateRuin} from '../dist/core/core/src/depths.js';
import {takeEnemyTurn} from '../dist/core/core/src/combat.js';
import {index} from '../dist/core/core/src/world.js';

function ruin(){
  const s=createGame(404), z=generateRuin(s.seed,1,0,2);
  s.zone='ruin-1-0-2';s.tiles=z.tiles;s.seen=z.seen;s.enemies=[];s.ground=[];
  s.fields=z.fields;s.player={x:22,y:12};return s;
}
test('stabilizing clears hazards near the chamber but not distant ones',()=>{
 const s=ruin();s.fields=[{x:23,y:12,kind:'fire',ttl:8},{x:55,y:50,kind:'electric',ttl:8}];
 s.inventory.push({id:'capacitor',count:1});assert.ok(dispatch(s,{type:'interact'}).accepted);
 assert.ok(dispatch(s,{type:'choose',option:'resonance-stabilize'}).accepted);
 assert.equal(s.fields.some(f=>f.x===23&&f.y===12),false);
 assert.equal(s.fields.some(f=>f.x===55&&f.y===50),true);
 const saved=deserialize(serialize(s));assert.deepEqual(saved.fields,s.fields);
});
test('absorbing awakens one persistent guardian, never duplicates it',()=>{
 const s=ruin();
 dispatch(s,{type:'interact'});assert.ok(dispatch(s,{type:'choose',option:'resonance-harvest'}).accepted);
 assert.equal(s.enemies.filter(e=>e.id==='resonance-guardian-ruin-1-0-2').length,1);
 const after=deserialize(serialize(s));assert.equal(after.enemies.filter(e=>e.id==='resonance-guardian-ruin-1-0-2').length,1);
 dispatch(s,{type:'interact'});assert.equal(s.enemies.filter(e=>e.id==='resonance-guardian-ruin-1-0-2').length,1);
});
test('sentinel telegraphs a field and next turn can be evaded',()=>{
 const s=createGame(404);s.tiles.fill('.');s.enemies=[{id:'sentinel-test',kind:'sentinel',x:63,y:30,hp:16,mode:'idle',searchTurns:0}];
 s.player={x:60,y:30};s.fields=[];s.tick=600;const log=[];
 takeEnemyTurn(s,message=>log.push(message));
 assert.ok(log.some(m=>m.includes('marca el suelo')));
 assert.ok(s.fields.some(f=>f.kind==='electric'&&f.x===60&&f.y===30));
 assert.equal(s.stats.hp,32);
});
test('wounded spore shepherd prefers retreat',()=>{
 const s=createGame(404);s.tiles.fill('.');s.enemies=[{id:'shepherd-test',kind:'spore',x:63,y:30,hp:4,mode:'idle',searchTurns:0}];
 s.player={x:60,y:30};s.fields=[];s.tick=100;takeEnemyTurn(s,()=>{});
 assert.equal(s.enemies[0].mode,'fleeing');
 assert.ok(Math.abs(s.enemies[0].x-60)+Math.abs(s.enemies[0].y-30)>3);
});
