import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dispatch,serialize,deserialize,MUTATIONS} from '../dist/core/core/src/game.js';
import {index} from '../dist/core/core/src/world.js';
import {stepEnvironment,placeField} from '../dist/core/core/src/environment.js';
import {initialGenome,unlock} from '../dist/core/core/src/mutations.js';

function game(){const s=createGame(404);s.tiles.fill('.');s.enemies=[];s.fields=[];s.player={x:52,y:30};s.stats.focus=100;s.stats.maxFocus=100;return s;}
function foe(s,x=54,y=30,kind='crawler'){const e={id:'mutation-target',kind,x,y,hp:9,mode:'idle',searchTurns:0};s.enemies.push(e);s.visible[index(x,y)]=1;return e;}

test('genome starts with two mutations and one development point',()=>{
 const s=createGame(404);assert.deepEqual(s.genome.unlocked,['regeneration','kinetic-pulse']);
 assert.equal(s.genome.genePoints,1);assert.equal(Object.keys(MUTATIONS).length,9);
});
test('gene choices spend points once; cannot learn another power for free',()=>{
 const s=game();const tick=s.tick;
 assert.equal(dispatch(s,{type:'unlock',mutation:'dermal-plates'}).accepted,true);
 assert.equal(s.genome.genePoints,0);assert.equal(s.tick,tick);
 assert.equal(dispatch(s,{type:'unlock',mutation:'dermal-plates'}).accepted,false);
 assert.equal(dispatch(s,{type:'unlock',mutation:'phase-step'}).accepted,false);
});
test('kinetic pulse damages, pushes and stuns a visible nearby enemy',()=>{
 const s=game(),e=foe(s);const hp=e.hp,focus=s.stats.focus;
 const outcome=dispatch(s,{type:'cast',mutation:'kinetic-pulse'});
 assert.equal(outcome.accepted,true);assert.ok(e.hp<hp);assert.equal(e.x,55);
 assert.equal(s.stats.focus,focus-5);assert.ok((s.genome.cooldowns['kinetic-pulse']??0)>0);
 assert.equal(dispatch(s,{type:'cast',mutation:'kinetic-pulse'}).accepted,false);
});
test('invalid mutation cast does not consume turns, focus or cooldown',()=>{
 const s=game(),t=s.tick,f=s.stats.focus;
 assert.equal(dispatch(s,{type:'cast',mutation:'pyrokinesis'}).accepted,false);
 assert.equal(dispatch(s,{type:'cast',mutation:'kinetic-pulse'}).accepted,false);
 assert.equal(s.tick,t);assert.equal(s.stats.focus,f);
});
test('neural shock stuns nearby enemies and costs a turn',()=>{
 const s=game();assert.equal(dispatch(s,{type:'unlock',mutation:'neural-shock'}).accepted,true);
 const e=foe(s,53,30);const t=s.tick;
 assert.equal(dispatch(s,{type:'cast',mutation:'neural-shock'}).accepted,true);
 assert.equal(s.tick,t+100);assert.ok((e.stunned??0)>=1);
});
test('ignition creates a persisted fire field that damages enemies',()=>{
 const s=game();assert.equal(dispatch(s,{type:'unlock',mutation:'pyrokinesis'}).accepted,true);
 const e=foe(s,54,30);const hp=e.hp;
 assert.equal(dispatch(s,{type:'cast',mutation:'pyrokinesis'}).accepted,true);
 assert.ok(s.fields.some(f=>f.kind==='fire'&&f.x===54));assert.ok(e.hp<hp);
 assert.ok(deserialize(serialize(s)).fields.some(f=>f.kind==='fire'));
});
test('phase step follows facing and cannot phase through a wall',()=>{
 const s=game();assert.equal(dispatch(s,{type:'unlock',mutation:'phase-step'}).accepted,true);
 s.genome.facing={dx:1,dy:0};s.tiles[index(54,30)]='#';
 assert.equal(dispatch(s,{type:'cast',mutation:'phase-step'}).accepted,true);
 assert.deepEqual(s.player,{x:53,y:30});
 const f=s.stats.focus;s.genome.cooldowns['phase-step']=0;
 s.tiles[index(54,30)]='#';assert.equal(dispatch(s,{type:'cast',mutation:'phase-step'}).accepted,false);
 assert.equal(s.stats.focus,f);
});
test('regeneration heals over turns but not at critical exposure',()=>{
 const s=game();s.stats.hp=15;
 for(let i=0;i<4;i++)dispatch(s,{type:'wait'});
 assert.equal(s.stats.hp,16);
 s.exposure=80;for(let i=0;i<4;i++)dispatch(s,{type:'wait'});
 // Exposure crosses the periodic contamination pulse; regeneration is disabled.
 assert.equal(s.stats.hp,15);
});
test('level gain awards gene points and health upgrades',()=>{
 const s=game();const e=foe(s,53,30);s.stats.xp=11;e.hp=1;
 // A killing hit grants at least five xp and a level, even if enemy was wounded.
 dispatch(s,{type:'attack'});
 assert.equal(s.stats.level,2);assert.equal(s.genome.genePoints,2);
});
test('electricity conducts through brine, hazards decay and stay capped',()=>{
 const s=game();s.tiles[index(53,30)]='~';placeField(s.fields,{x:53,y:30,kind:'electric',ttl:8});
 s.tick=100;stepEnvironment(s,()=>{});
 assert.ok(s.fields.length>1);assert.ok(s.fields.length<=96);
 for(let i=0;i<30;i++){s.tick+=100;stepEnvironment(s,()=>{});}
 assert.ok(s.fields.length<=96);
});
test('copper nerves resist electric fields but are vulnerable to fire',()=>{
 const a=game(),b=game(),c=game();
 a.player=b.player=c.player={x:52,y:30};
 a.fields=[{x:52,y:30,kind:'electric',ttl:4}];b.fields=[{x:52,y:30,kind:'electric',ttl:4}];
 assert.equal(unlock(b.genome,'copper-nerves'),true);
 const before=a.stats.hp;stepEnvironment(a,()=>{});stepEnvironment(b,()=>{});
 assert.ok(b.stats.hp>a.stats.hp);assert.ok(a.stats.hp<before);
 c.fields=[{x:52,y:30,kind:'fire',ttl:4}];c.genome=structuredClone(b.genome);
 stepEnvironment(c,()=>{});assert.equal(c.stats.maxHp-c.stats.hp,4);
});
test('v0.3 save migrates without changing mission, inventory or progress',()=>{
 const s=createGame(404);s.quest.status='active';s.stats.hp=17;s.stats.xp=6;s.player={x:31,y:32};
 const old=JSON.parse(serialize(s));old.version=4;delete old.genome;delete old.fields;
 const migrated=deserialize(JSON.stringify(old));
 assert.equal(migrated.version,11);assert.deepEqual(migrated.quest,s.quest);
 assert.deepEqual(migrated.tiles,s.tiles);assert.deepEqual(migrated.inventory,s.inventory);
 assert.equal(migrated.stats.hp,17);assert.equal(migrated.stats.xp,6);
 assert.ok(migrated.fields.length>0);assert.deepEqual(migrated.genome.unlocked,['regeneration','kinetic-pulse']);
});
test('corrupt v0.4 genome and environmental fields are rejected',()=>{
 const s=game();const save=JSON.parse(serialize(s));
 save.genome.unlocked.push('no-such-power');assert.throws(()=>deserialize(JSON.stringify(save)),/Genoma/);
 save.genome=initialGenome();save.fields=[{x:9999,y:30,kind:'fire',ttl:1}];assert.throws(()=>deserialize(JSON.stringify(save)),/Campos/);
});
test('deterministic mutation and environment replay with equal seeds and actions',()=>{
 const a=game(),b=game();
 for(const s of [a,b]){foe(s);s.genome.unlocked.push('neural-shock');}
 for(const command of [{type:'cast',mutation:'kinetic-pulse'},{type:'wait'},{type:'cast',mutation:'neural-shock'},{type:'wait'},{type:'scan'}]){
   dispatch(a,command);dispatch(b,command);
 }
 assert.deepEqual(JSON.parse(serialize(a)),JSON.parse(serialize(b)));
});
