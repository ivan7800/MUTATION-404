import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, deserialize, dispatch, refreshVisibility, serialize, ENEMY_DEFS, stackCount } from '../dist/core/core/src/game.js';
import { addStack, inFaro, nextStep, removeStack, xpNeeded } from '../dist/core/core/src/combat.js';
import { index, passable } from '../dist/core/core/src/world.js';

const setup=(seed=404)=>{
  const s=createGame(seed);s.enemies=[];s.player={x:60,y:30};
  for(let y=25;y<=35;y++)for(let x=55;x<=69;x++)s.tiles[index(x,y)]='.';
  refreshVisibility(s);
  return s;
};
const addEnemy=(s,kind='crawler',x=63,y=30,hp=9)=>{
  const e={id:'test-enemy',kind,x,y,hp,mode:'idle',searchTurns:0};s.enemies.push(e);return e;
};
test('enemy spawn in 1000 procedural worlds is collision-free and outside safe town',()=>{
  for(let seed=0;seed<1000;seed++){
    const s=createGame(seed),positions=new Set();
    assert.equal(s.enemies.length,17);
    for(const e of s.enemies){
      assert.equal(inFaro(e),false,`seed ${seed}`);
      assert.equal(passable(s.tiles[index(e.x,e.y)]),true);
      assert.equal(positions.has(`${e.x},${e.y}`),false);
      positions.add(`${e.x},${e.y}`);
    }
  }
});
test('the safe town does not trigger enemy attack turns',()=>{
  const s=createGame(404);s.enemies=[{id:'test',kind:'sentinel',x:48,y:32,hp:16,mode:'hunting',searchTurns:2,lastKnown:{...s.player}}];
  const before=s.stats.hp;
  for(let n=0;n<50;n++)dispatch(s,{type:'wait'});
  assert.equal(s.stats.hp,before);
  assert.equal(s.enemies[0].x,48);
});
test('target selection costs no turns and requires visibility',()=>{
  const s=setup();addEnemy(s);
  const a=dispatch(s,{type:'target'});
  assert.equal(a.accepted,true);assert.equal(a.timeCost,0);assert.equal(s.tick,0);
  assert.equal(s.targetId,'test-enemy');
  s.enemies[0].x=90;s.enemies[0].y=50;refreshVisibility(s);
  assert.equal(dispatch(s,{type:'target'}).accepted,false);
});
test('shooting consumes ammo and time, cannot shoot through wall or beyond range',()=>{
  const s=setup();const e=addEnemy(s);
  const before=stackCount(s.inventory,'ammo');
  assert.equal(dispatch(s,{type:'fire'}).accepted,true);
  assert.equal(s.tick,100);assert.equal(stackCount(s.inventory,'ammo'),before-1);
  s.enemies=[e];e.x=67;e.y=30;refreshVisibility(s);
  assert.equal(dispatch(s,{type:'fire'}).accepted,false);
  assert.equal(stackCount(s.inventory,'ammo'),before-1);
  e.x=63;e.y=30;s.tiles[index(62,30)]='#';refreshVisibility(s);
  assert.equal(dispatch(s,{type:'fire'}).accepted,false);
  assert.equal(s.tick,100);
});
test('bumping an enemy attacks instead of moving into an occupied tile',()=>{
  const s=setup(),e=addEnemy(s,'crawler',61,30,10);
  const result=dispatch(s,{type:'move',dx:1,dy:0});
  assert.equal(result.accepted,true);assert.equal(result.timeCost,100);
  assert.deepEqual(s.player,{x:60,y:30});assert.ok(e.hp<=10);
});
test('combat awards XP, leaves loot, and pickups consume time',()=>{
  const s=setup();const e=addEnemy(s,'crawler',61,30,1);
  for(let i=0;i<30&&e.hp>0;i++)dispatch(s,{type:'attack'});
  assert.equal(e.hp,0);assert.equal(s.kills,1);assert.equal(s.stats.xp,ENEMY_DEFS.crawler.xp);
  const loot=s.ground.find(g=>g.item==='carapace');assert.ok(loot);
  s.enemies=[];s.player={x:61,y:30};refreshVisibility(s);
  const result=dispatch(s,{type:'pickup'});
  assert.equal(result.accepted,true);assert.equal(stackCount(s.inventory,'carapace'),1);
  assert.equal(s.ground.length,0);
});
test('medkits cannot be wasted and restore up to max health',()=>{
  const s=setup(),before=stackCount(s.inventory,'medkit');
  assert.equal(dispatch(s,{type:'heal'}).accepted,false);
  assert.equal(stackCount(s.inventory,'medkit'),before);
  s.stats.hp=25;assert.equal(dispatch(s,{type:'heal'}).accepted,true);
  assert.equal(s.stats.hp,32);assert.equal(stackCount(s.inventory,'medkit'),before-1);
});
test('equipment requires ownership, has a turn cost, and alters armor',()=>{
  const s=setup();assert.equal(dispatch(s,{type:'equip',item:'shell-armor'}).accepted,false);
  addStack(s.inventory,'shell-armor',1);
  assert.equal(dispatch(s,{type:'equip',item:'shell-armor'}).accepted,true);
  assert.equal(s.equipment.armor,'shell-armor');assert.equal(s.tick,100);
  assert.equal(dispatch(s,{type:'equip',item:'ammo'}).accepted,false);
});
test('enemy hunt and movement is deterministic from seed and actions',()=>{
  const a=setup(7),b=setup(7);addEnemy(a);addEnemy(b);
  for(let i=0;i<8;i++){
    dispatch(a,{type:'wait'});dispatch(b,{type:'wait'});
    assert.deepEqual(a.enemies,b.enemies);assert.deepEqual(a.stats,b.stats);assert.equal(a.rngState,b.rngState);
  }
});
test('AI cannot path through walls and avoids the settlement',()=>{
  const s=setup();for(let y=25;y<=35;y++)s.tiles[index(62,y)]='#';
  assert.equal(nextStep(s.tiles,{x:61,y:30},{x:64,y:30},new Set(),100),undefined);
  assert.equal(inFaro({x:33,y:33}),true);
});
test('version 0.1 saves are migrated without losing quest, terrain or position',()=>{
  const s=createGame(999);s.quest.status='active';s.quest.fuseFound=true;s.player={x:26,y:31};
  const old=JSON.parse(serialize(s));old.version=2;
  for(const field of ['enemies','ground','inventory','stats','equipment','targetId','kills'])delete old[field];
  const migrated=deserialize(JSON.stringify(old));
  assert.equal(migrated.version,11);assert.deepEqual(migrated.quest,s.quest);
  assert.deepEqual(migrated.tiles,s.tiles);assert.deepEqual(migrated.player,s.player);
  assert.equal(migrated.enemies.length,17);
  assert.equal(deserialize(serialize(migrated)).version,11);
});
test('version 0.2 saves retain enemies, loot, inventory, progression and RNG',()=>{
  const s=setup();s.kills=4;s.stats.xp=8;s.stats.level=3;
  s.ground=[{id:'drop',x:60,y:30,item:'ammo',count:4}];addEnemy(s);
  const restored=deserialize(serialize(s));
  for(const key of ['inventory','equipment','stats','enemies','ground','kills','rngState','quest'])assert.deepEqual(restored[key],s[key]);
});
test('invalid combat payloads are rejected on load',()=>{
  const baseline=JSON.parse(serialize(createGame(22)));
  for(const [field,value] of [['inventory',[{id:'missing',count:1}]],['enemies',[{id:'bad',kind:'sentinel',x:-1,y:30,hp:100,mode:'idle',searchTurns:0}]],['ground',[{id:'bad',x:9,y:9,item:'medkit',count:-1}]],['kills',-2],['stats',{...baseline.stats,hp:400}]]){
    const bad={...baseline,[field]:value};assert.throws(()=>deserialize(JSON.stringify(bad)),field);
  }
});
test('inventory removal and XP thresholds are consistent',()=>{
  const inventory=[{id:'ammo',count:2}];
  assert.equal(removeStack(inventory,'ammo',3),false);
  assert.equal(removeStack(inventory,'ammo',2),true);
  assert.equal(stackCount(inventory,'ammo'),0);
  assert.equal(xpNeeded(2),24);
});
