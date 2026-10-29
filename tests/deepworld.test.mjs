import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, dispatch, serialize, deserialize } from '../dist/core/core/src/game.js';
import { SECTORS, generateSector } from '../dist/core/core/src/frontier.js';
import { parseRuin, generateRuin, ruinName } from '../dist/core/core/src/depths.js';
import { index,passable } from '../dist/core/core/src/world.js';

test('eight regional entrances are deterministic, reachable and distinct',()=>{
  for(const region of SECTORS.filter(x=>x.x||x.y)){
    const a=generateSector(808,region.x,region.y),b=generateSector(808,region.x,region.y);
    assert.deepEqual(a.tiles,b.tiles);
    assert.equal(a.tiles[index(72,47)],'T');
    for(let x=48;x<=72;x++)assert.equal(passable(a.tiles[index(x,47)]),true);
    for(let y=32;y<=47;y++)assert.equal(passable(a.tiles[index(48,y)]),true);
    const first=generateRuin(808,region.x,region.y,1);
    assert.deepEqual(first,generateRuin(808,region.x,region.y,1));
    assert.ok(first.enemies.every(e=>e.id.startsWith(`ruin-${region.x}-${region.y}-1-`)));
  }
});
test('descend both levels and retain modified terrain, fog and items when returning',()=>{
  const s=createGame(808);s.enemies=[];s.player={x:94,y:32};
  assert.equal(dispatch(s,{type:'move',dx:1,dy:0}).accepted,true);
  assert.equal(s.zone,'sector-1-0');s.enemies=[];s.player={x:72,y:47};
  assert.equal(dispatch(s,{type:'descend'}).accepted,true);
  assert.equal(s.zone,'ruin-1-0-1');s.enemies=[];
  s.tiles[index(26,25)]='!';s.ground.push({id:'ruin-loot',x:26,y:25,item:'scrap',count:1});
  s.player={x:14,y:10};assert.equal(dispatch(s,{type:'descend'}).accepted,true);
  assert.equal(s.zone,'ruin-1-0-2');s.enemies=[];s.player={x:10,y:10};
  assert.equal(dispatch(s,{type:'ascend'}).accepted,true);
  assert.equal(s.zone,'ruin-1-0-1');assert.equal(s.tiles[index(26,25)],'!');
  assert.equal(s.ground.some(g=>g.id==='ruin-loot'),true);
  s.player={x:10,y:10};assert.equal(dispatch(s,{type:'ascend'}).accepted,true);
  assert.equal(s.zone,'sector-1-0');
  const loaded=deserialize(serialize(s));assert.equal(loaded.version,11);
  loaded.enemies=[];loaded.player={x:72,y:47};assert.equal(dispatch(loaded,{type:'descend'}).accepted,true);
  assert.equal(loaded.tiles[index(26,25)],'!');
});
test('v0.8 save migrates to v0.9 without losing inventory or progress',()=>{
 const s=createGame(42);s.stats.credits=99;s.quest.status='active';
 const data=JSON.parse(serialize(s));data.version=9;
 const loaded=deserialize(JSON.stringify(data));
 assert.equal(loaded.version,11);assert.equal(loaded.stats.credits,99);assert.equal(loaded.quest.status,'active');
});
test('invalid ruin identifiers are rejected by parser',()=>{
 assert.equal(parseRuin('ruin-9-9-1'),null);
 assert.equal(parseRuin('ruin-0-0-1'),null);
 assert.equal(parseRuin('ruin-1-0-3'),null);
 assert.match(ruinName('ruin-1-1-2'),/Estrato 2/);
});
