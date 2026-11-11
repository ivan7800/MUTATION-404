import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dispatch,serialize,deserialize} from '../dist/core/core/src/game.js';
import {generateRuin,themeForRuin,ruinId,parseRuin} from '../dist/core/core/src/depths.js';
import {index,passable} from '../dist/core/core/src/world.js';
const coords=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
test('eight distinct sites with thematic hazards and repeatable maps',()=>{
 const themes=new Set();
 for(const [x,y] of coords){
  const theme=themeForRuin(x,y);themes.add(theme.name);
  const a=generateRuin(404,x,y,2),b=generateRuin(404,x,y,2);
  assert.deepEqual(a,b);
  assert.equal(a.tiles[index(20,12)],'o');
  assert.equal(a.tiles[index(10,10)],'+');
  for(let xx=10;xx<=20;xx++)assert.ok(passable(a.tiles[index(xx,12)]));
  assert.ok(a.fields.length>=1);
  assert.ok(a.fields.every(f=>f.kind===theme.hazard));
  assert.equal(parseRuin(ruinId(x,y,2)).depth,2);
 }
 assert.equal(themes.size,8);
});
test('regional relic grants once, persists and honors earlier saves',()=>{
 const s=createGame(404);const x=1,y=0;
 const region='ruin-1-0-2', zone=generateRuin(s.seed,x,y,2);
 s.zone=region;s.tiles=zone.tiles;s.seen=zone.seen;s.fields=zone.fields;s.ground=zone.ground;s.enemies=[];s.player={x:19,y:12};
 const credits=s.stats.credits,genes=s.genome.genePoints;
 const a=dispatch(s,{type:'interact'});
 assert.equal(a.accepted,true);assert.equal(s.stats.credits,credits+24);assert.equal(s.genome.genePoints,genes+1);
 const b=dispatch(s,{type:'interact'});assert.equal(b.accepted,true);assert.equal(s.stats.credits,credits+24);
 const saved=deserialize(serialize(s));assert.equal(saved.version,11);assert.ok(saved.events.includes('relic:1:0:2'));
 const old=JSON.parse(serialize(s));old.version=10;
 const migrated=deserialize(JSON.stringify(old));assert.equal(migrated.version,11);assert.equal(migrated.stats.credits,s.stats.credits);
});
