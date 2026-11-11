import test from 'node:test';
import assert from 'node:assert/strict';
import { SeededRng } from '../dist/core/core/src/rng.js';
import { createGame, dispatch, deserialize, serialize, tileAt, WIDTH, HEIGHT } from '../dist/core/core/src/game.js';
import { ACTORS, LANDMARKS, passable, index } from '../dist/core/core/src/world.js';
import { computeVisibility, hasLineOfSight } from '../dist/core/core/src/fov.js';

test('identical seeds produce identical maps and state',()=>{
  assert.deepEqual(createGame(404),createGame(404));
  assert.notDeepEqual(createGame(404).tiles,createGame(405).tiles);
});
test('RNG state can be restored',()=>{
  const r=new SeededRng(7);r.next();const saved=r.state,expected=r.next();r.restore(saved);assert.equal(r.next(),expected);
});
test('world dimensions, borders and spawn are valid in 1000 seeds',()=>{
  for(let seed=0;seed<1000;seed++){
    const s=createGame(seed);
    assert.equal(s.tiles.length,WIDTH*HEIGHT);
    assert.equal(s.seen.length,WIDTH*HEIGHT);
    assert.equal(tileAt(s,32,32),'.');
    assert.equal(tileAt(s,0,0),'#');
  }
});
test('all four remote landmarks reachable from village gates across 100 seeds',()=>{
  for(let seed=0;seed<100;seed++){
    const state=createGame(seed);
    const visited=new Uint8Array(WIDTH*HEIGHT),queue=[[32,32]];
    visited[index(32,32)]=1;
    for(let at=0;at<queue.length;at++){
      const [x,y]=queue[at];
      for(const [dx,dy] of [[0,-1],[1,0],[-1,0],[0,1]]){
        const nx=x+dx,ny=y+dy;
        if(nx<0||ny<0||nx>=WIDTH||ny>=HEIGHT||visited[index(nx,ny)]||!passable(state.tiles[index(nx,ny)]))continue;
        visited[index(nx,ny)]=1;queue.push([nx,ny]);
      }
    }
    for(const p of LANDMARKS)assert.equal(visited[index(p.x,p.y)],1,`${p.id} unreachable on seed ${seed}`);
  }
});
test('invalid moves and blocked walls consume no time',()=>{
  const s=createGame(2);
  assert.equal(dispatch(s,{type:'move',dx:4,dy:0}).accepted,false);
  assert.equal(s.tick,0);
  s.player={x:19,y:22};assert.equal(dispatch(s,{type:'move',dx:-1,dy:0}).accepted,false);
  assert.equal(s.tick,0);
});
test('wait costs 100 and inspect costs zero',()=>{
  const s=createGame(2);dispatch(s,{type:'inspect'});assert.equal(s.tick,0);dispatch(s,{type:'wait'});assert.equal(s.tick,100);
});
test('visibility respects blocking obstacles and exploration memory',()=>{
  const s=createGame(42);const n=s.seen.reduce((a,b)=>a+b,0);assert.ok(n>0&&n<WIDTH*HEIGHT);
  const tiles=s.tiles.slice();for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++)tiles[index(x,y)]='.';
  tiles[index(11,10)]='#';
  assert.equal(hasLineOfSight(tiles,10,10,12,10),false);
  const vis=computeVisibility(tiles,10,10,5);
  assert.equal(vis[index(11,10)],1);assert.equal(vis[index(12,10)],0);
});
test('player can speak with Mara and accept mission',()=>{
  const s=createGame(404);dispatch(s,{type:'move',dx:0,dy:-1});dispatch(s,{type:'move',dx:0,dy:-1});
  assert.equal(dispatch(s,{type:'interact'}).accepted,true);
  assert.equal(s.dialogue?.speaker,'Mara Venn');
  dispatch(s,{type:'choose',option:'accept'});
  assert.equal(s.quest.status,'active');assert.equal(s.dialogue,null);
});
test('complete full alternate quest route, preserve outcome and inventory',()=>{
  const s=createGame(404);s.player={x:32,y:30};dispatch(s,{type:'interact'});dispatch(s,{type:'choose',option:'accept'});
  s.player={x:12,y:11};dispatch(s,{type:'interact'});dispatch(s,{type:'choose',option:'fuse'});
  assert.equal(s.quest.fuseFound,true);
  s.player={x:79,y:14};dispatch(s,{type:'interact'});dispatch(s,{type:'choose',option:'isolate'});
  assert.equal(s.quest.outcome,'isolate');assert.equal(s.quest.status,'signal-found');
  s.player={x:32,y:30};dispatch(s,{type:'interact'});dispatch(s,{type:'choose',option:'finish'});
  assert.equal(s.quest.status,'completed');
  assert.deepEqual(deserialize(serialize(s)).quest,s.quest);
});
test('broadcast quest ending is distinct',()=>{
  const s=createGame(404);s.quest.status='active';s.player={x:79,y:14};
  dispatch(s,{type:'interact'});dispatch(s,{type:'choose',option:'broadcast'});
  assert.equal(s.quest.outcome,'broadcast');
});
test('saving strips UI dialogue, roundtrip preserves world and rejects bad data',()=>{
  const s=createGame(7);dispatch(s,{type:'wait'});const loaded=deserialize(serialize(s));
  assert.equal(loaded.tick,s.tick);assert.deepEqual(loaded.tiles,s.tiles);
  assert.deepEqual(loaded.seen,s.seen);
  assert.deepEqual(loaded.quest,s.quest);
  assert.equal(loaded.visible.length,WIDTH*HEIGHT);
  assert.throws(()=>deserialize('not-json'));
  assert.throws(()=>deserialize('{"version":1}'));
  const corrupt=JSON.parse(serialize(s));corrupt.player.x=-1;
  assert.throws(()=>deserialize(JSON.stringify(corrupt)));
});
test('NPCs and locations are in-bounds and have unique identifiers',()=>{
  assert.equal(new Set(ACTORS.map(a=>a.id)).size,ACTORS.length);
  assert.equal(new Set(LANDMARKS.map(a=>a.id)).size,LANDMARKS.length);
  for(const a of [...ACTORS,...LANDMARKS])assert.ok(a.x>0&&a.y>0&&a.x<WIDTH-1&&a.y<HEIGHT-1);
});
