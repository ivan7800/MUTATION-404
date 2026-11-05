import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dispatch,serialize,deserialize} from '../dist/core/core/src/game.js';

test('relic collected after 50 events preserves all history on reload',()=>{
  const s=createGame(404);
  s.zone='ruin--1--1-1';s.tiles.fill('.');s.player={x:20,y:12};s.enemies=[];s.fields=[];
  s.events=Array.from({length:50},(_,i)=>`incident:sector-1-0:${i+1}`);
  const before=deserialize(serialize(s));
  assert.equal(dispatch(before,{type:'interact'}).accepted,true);
  assert.equal(before.events.length,51);
  const restored=deserialize(serialize(before));
  assert.deepEqual(restored.events,before.events);
  assert.equal(restored.rngState,before.rngState);
  const credits=restored.stats.credits;
  dispatch(restored,{type:'interact'});
  assert.equal(restored.stats.credits,credits,'reloading must not grant the relic twice');
});
for(let version=2;version<=10;version++)test(`v${version} full log migration remains reloadable`,()=>{
  const old=JSON.parse(serialize(createGame(404)));
  old.version=version;old.log=Array.from({length:70},(_,i)=>`message ${i}`);
  const restored=deserialize(JSON.stringify(old));
  assert.equal(restored.version,11);
  assert.equal(restored.log.length,70);
  assert.match(restored.log.at(-1),/MIGRACIÓN/);
  assert.deepEqual(deserialize(serialize(restored)).log,restored.log);
});
test('legacy overflowing UI logs recover and serialization does not mutate state',()=>{
  const s=createGame(404);s.log=Array.from({length:71},(_,i)=>`message ${i}`);
  const raw=JSON.stringify(s);
  assert.equal(deserialize(raw).log[0],'message 1');
  assert.equal(deserialize(serialize(s)).log.length,70);
  assert.equal(s.log.length,71);
  s.log=['x'.repeat(2000)];
  assert.throws(()=>deserialize(JSON.stringify(s)),/Bitácora/);
});
test('relaxed history validation still rejects oversized or malformed payloads',()=>{
  const s=createGame(404);
  s.events=['x'.repeat(80)];
  assert.throws(()=>deserialize(serialize(s)),/regiones/);
  s.events=Array(4097).fill('heart');
  assert.throws(()=>deserialize(serialize(s)),/regiones/);
  s.events=[];s.log=Array(1001).fill('message');
  assert.throws(()=>deserialize(JSON.stringify(s)),/Bitácora/);
});
