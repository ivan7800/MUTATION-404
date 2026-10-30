import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dispatch,serialize,deserialize} from '../dist/core/core/src/game.js';
import {generateRuin} from '../dist/core/core/src/depths.js';
import {takeEnemyTurn} from '../dist/core/core/src/combat.js';
import {index,passable} from '../dist/core/core/src/world.js';

const sectors=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
function deep(x=1,y=0){
 const s=createGame(404),z=generateRuin(404,x,y,2);
 s.zone=`ruin-${x}-${y}-2`;s.tiles=z.tiles;s.seen=z.seen;s.fields=z.fields;s.ground=z.ground;s.enemies=z.enemies;s.player={x:26,y:12};
 return s;
}
test('eight deterministic elite chambers and traversable archive',()=>{
 for(const [x,y] of sectors){
  const a=generateRuin(404,x,y,2),b=generateRuin(404,x,y,2);
  assert.deepEqual(a,b);
  assert.equal(a.enemies.filter(e=>e.id.startsWith('elite-')).length,1);
  assert.equal(a.tiles[index(26,12)],'o');
  for(let xx=22;xx<=30;xx++)assert.ok(passable(a.tiles[index(xx,12)]));
 }
});
test('elite archive inaccessible until guardian defeated, then available only once',()=>{
 const s=deep(),guardian=s.enemies.find(e=>e.id==='elite-1-0-2');
 assert.ok(guardian);
 assert.equal(dispatch(s,{type:'interact'}).accepted,false);
 guardian.hp=0;
 const credits=s.stats.credits;
 assert.equal(dispatch(s,{type:'interact'}).accepted,true);
 assert.equal(s.stats.credits,credits+15);
 assert.ok(s.events.includes('elite-cache:ruin-1-0-2'));
 const saved=deserialize(serialize(s));
 assert.ok(saved.events.includes('elite-cache:ruin-1-0-2'));
 assert.equal(dispatch(s,{type:'interact'}).accepted,true);
 assert.equal(s.stats.credits,credits+15);
});
test('elite drone creates telegraphed electric hazards without immediate damage',()=>{
 const s=createGame(404);
 s.tiles.fill('.');s.player={x:60,y:30};s.fields=[];s.enemies=[{id:'elite-1-0-2',kind:'drone',x:64,y:30,hp:15,mode:'idle',searchTurns:0}];s.tick=400;
 const hp=s.stats.hp,log=[];
 takeEnemyTurn(s,t=>log.push(t));
 assert.ok(log.some(t=>t.includes('ÉLITE')));
 assert.ok(s.fields.some(f=>f.kind==='electric'&&f.x===60&&f.y===30));
 assert.equal(s.stats.hp,hp);
});
