import test from 'node:test';
import assert from 'node:assert/strict';
import { biomeAt, BIOMES, terrainHash, weatherAt, WEATHER, hazardAt } from '../dist/core/core/src/biomes.js';
import { createGame, dispatch, deserialize, serialize, WIDTH, HEIGHT } from '../dist/core/core/src/game.js';
import { index, passable, LANDMARKS } from '../dist/core/core/src/world.js';

test('six biomes cover the generated world and retain the safe settlement',()=>{
  const names = new Set();
  for(let y=1;y<HEIGHT-1;y++)for(let x=1;x<WIDTH-1;x++)names.add(biomeAt(404,x,y));
  assert.deepEqual([...names].sort(),Object.keys(BIOMES).sort());
  assert.equal(biomeAt(404,32,32),'salinas');
  assert.equal(biomeAt(404,18,32),'salinas');
});
test('terrain features are deterministic for every seed, with biome differences',()=>{
  for(let seed=0;seed<50;seed++){
    const a=createGame(seed),b=createGame(seed);
    assert.deepEqual(a.tiles,b.tiles);
    assert.deepEqual(a.enemies,b.enemies);
    assert.equal(a.tiles[index(32,32)],'.');
  }
  assert.equal(terrainHash(404,70,20),terrainHash(404,70,20));
  assert.notEqual(terrainHash(404,70,20),terrainHash(405,70,20));
});
test('all nine points of interest remain connected on 100 independent seeds',()=>{
  for(let seed=0;seed<100;seed++){
    const s=createGame(seed),seen=new Uint8Array(WIDTH*HEIGHT),queue=[index(32,32)];seen[queue[0]]=1;
    for(let p=0;p<queue.length;p++){
      const i=queue[p],x=i%WIDTH,y=Math.floor(i/WIDTH);
      for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]){
        const xx=x+dx,yy=y+dy,at=index(xx,yy);
        if(xx<0||yy<0||xx>=WIDTH||yy>=HEIGHT||seen[at]||!passable(s.tiles[at]))continue;
        seen[at]=1;queue.push(at);
      }
    }
    for(const p of LANDMARKS)assert.equal(seen[index(p.x,p.y)],1,`${p.id} in seed ${seed}`);
  }
});
test('weather is deterministic and visibility radius changes with the atmosphere',()=>{
  for(let period=0;period<80;period++)for(const b of Object.keys(BIOMES)){
    const tick=period*1800;
    assert.equal(weatherAt(404,tick,b),weatherAt(404,tick,b));
    assert.ok(WEATHER[weatherAt(404,tick,b)].radius>=6);
  }
  const s=createGame(404);
  s.player={x:60,y:55}; // outside the safe settlement
  s.tiles.fill('.');
  const b=biomeAt(s.seed,s.player.x,s.player.y);
  let t=0;while(t<200000&&weatherAt(404,t,b)==='calma')t+=1800;
  assert.ok(t<200000);
  s.tick=t;
  // A wait recomputes visibility and takes the local climate into account.
  dispatch(s,{type:'wait'});
  const dist=WEATHER[weatherAt(404,s.tick,b)].radius;
  assert.equal(s.visible[index(s.player.x+dist+1,s.player.y)],0);
});
test('first survey yields one lore fragment, consumes focus and is not farmable',()=>{
  const s=createGame(404),focus=s.stats.focus;
  const result=dispatch(s,{type:'scan'});
  assert.equal(result.accepted,true);assert.equal(result.timeCost,100);
  assert.equal(s.stats.focus,focus-4);assert.deepEqual(s.biomeNotes,['salinas']);
  const experience=s.stats.xp;
  dispatch(s,{type:'scan'});assert.equal(s.stats.xp,experience);
  assert.equal(s.biomeNotes.length,1);
  assert.deepEqual(deserialize(serialize(s)).biomeNotes,['salinas']);
});
test('surveys reject insufficient focus without advancing time',()=>{
  const s=createGame(404);s.stats.focus=3;
  const t=s.tick;assert.equal(dispatch(s,{type:'scan'}).accepted,false);
  assert.equal(s.tick,t);
});
test('biome border crossings are logged once and remain deterministic',()=>{
  const s=createGame(404);
  s.player={x:6,y:6};
  const dest=biomeAt(s.seed,6,6);assert.notEqual(dest,'salinas');
  dispatch(s,{type:'wait'});
  assert.equal(s.lastBiome,dest);
  const amount=s.log.filter(x=>x.startsWith('FRONTERA //')).length;
  dispatch(s,{type:'wait'});
  assert.equal(s.log.filter(x=>x.startsWith('FRONTERA //')).length,amount);
});
test('environment exposure rises at marked hazards and falls at shelter',()=>{
  const s=createGame(404);
  const x=55,y=55;s.player={x,y};s.tiles[index(x,y)]='!';
  const before=s.exposure;
  dispatch(s,{type:'wait'});assert.ok(s.exposure>before);
  const exposed=s.exposure;s.player={x:32,y:32};dispatch(s,{type:'wait'});
  assert.ok(s.exposure<exposed);
  assert.equal(hazardAt('vidrio','!','calma'),3);
});
test('v0.2 save migration preserves combat, map, story and player and adds atmosphere',()=>{
  const original=createGame(404);
  original.quest.status='active';original.stats.hp=21;
  original.enemies[0].hp=3;original.player={x:31,y:32};
  const old=JSON.parse(serialize(original));old.version=3;
  for(const field of ['exposure','biomeNotes','lastBiome','lastWeather','environmentalTurns'])delete old[field];
  const migrated=deserialize(JSON.stringify(old));
  assert.equal(migrated.version,11);assert.deepEqual(migrated.tiles,original.tiles);
  assert.deepEqual(migrated.player,original.player);assert.deepEqual(migrated.quest,original.quest);
  assert.equal(migrated.enemies[0].hp,3);assert.equal(migrated.stats.hp,21);
  assert.equal(migrated.exposure,0);assert.deepEqual(migrated.biomeNotes,[]);
});
test('v0.3 save validator rejects corrupt exposure and forged biome notes',()=>{
  const s=createGame(404);
  const invalid=JSON.parse(serialize(s));invalid.exposure=201;
  assert.throws(()=>deserialize(JSON.stringify(invalid)),/ambiental/);
  invalid.exposure=0;invalid.biomeNotes=['salinas','salinas'];
  assert.throws(()=>deserialize(JSON.stringify(invalid)),/biomas/);
});

test('new creatures inhabit distinct regional ecosystems',()=>{
  const s=createGame(404),counts={};
  for(const e of s.enemies)counts[e.kind]=(counts[e.kind]??0)+1;
  for(const id of ['moth','drone','spore'])assert.ok(counts[id]>=2,`missing ${id}`);
  for(const e of s.enemies.filter(e=>e.kind==='moth'))assert.equal(biomeAt(s.seed,e.x,e.y),'ceniza');
  for(const e of s.enemies.filter(e=>e.kind==='drone'))assert.equal(biomeAt(s.seed,e.x,e.y),'hierro');
  for(const e of s.enemies.filter(e=>e.kind==='spore'))assert.equal(biomeAt(s.seed,e.x,e.y),'medula');
});
