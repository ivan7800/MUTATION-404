import {mkdir,writeFile} from 'node:fs/promises';
import {createGame,dispatch,deserialize,serialize,refreshVisibility,stackCount,ENEMY_DEFS} from '../dist/core/core/src/game.js';
import {generateRuin} from '../dist/core/core/src/depths.js';
import {GUARDIAN_PROFILES,guardianVitality} from '../dist/core/core/src/guardian-profiles.js';
import {manhattan} from '../dist/core/core/src/combat.js';
import {index,passable,within} from '../dist/core/core/src/world.js';

const SEEDS=[1,7,17,42,77,101,404,808,2026,9999,13579,24680];
const steps=[[0,-1],[1,0],[0,1],[-1,0],[1,-1],[1,1],[-1,1],[-1,-1]];
const entries=[];

for(const profile of GUARDIAN_PROFILES)for(const seed of SEEDS){
 const state=createGame(seed),room=generateRuin(seed,profile.x,profile.y,2);
 state.zone=`ruin-${profile.x}-${profile.y}-2`;state.tiles=room.tiles;state.seen=room.seen;
 state.tiles.fill('.');state.fields=[];state.ground=[];state.player={x:26,y:12};
 const guardian={id:`elite-${profile.x}-${profile.y}-2`,kind:profile.kind,x:30,y:12,
  hp:guardianVitality(ENEMY_DEFS[profile.kind].hp),mode:'idle',searchTurns:0};
 state.enemies=[guardian];state.targetId=guardian.id;refreshVisibility(state);
 const startHp=state.stats.hp,startKits=stackCount(state.inventory,'medkit'),startAmmo=stackCount(state.inventory,'ammo');
 let actions=0,abilities=0,turns=0;
 while(guardian.hp>0&&state.stats.hp>0&&turns<100){
  turns++;
  const hazards=new Set(state.fields.map(f=>`${f.x},${f.y}`));
  let command;
  // A warning has appeared; respect it and move to a neighboring safe tile.
  const dodge=steps.map(([dx,dy])=>({dx,dy,x:state.player.x+dx,y:state.player.y+dy}))
   .find(p=>within(p.x,p.y)&&passable(state.tiles[index(p.x,p.y)])&&!hazards.has(`${p.x},${p.y}`));
  if(hazards.has(`${state.player.x},${state.player.y}`)&&dodge)command={type:'move',dx:dodge.dx,dy:dodge.dy};
  else if(state.stats.hp<=21&&stackCount(state.inventory,'medkit')>0)command={type:'heal'};
  else if(manhattan(state.player,guardian)<=6&&stackCount(state.inventory,'ammo')>0)command={type:'fire'};
  else if(manhattan(state.player,guardian)===1)command={type:'attack'};
  else {const dx=Math.sign(guardian.x-state.player.x),dy=Math.sign(guardian.y-state.player.y);command={type:'move',dx:dx!==0?dx:0,dy:dx===0?dy:0};}
  const before=state.log.length,result=dispatch(state,command);
  if(!result.accepted)throw new Error(`${profile.name}: policy command rejected: ${result.message}`);
  actions++;
  abilities+=state.log.slice(Math.max(0,before)).filter(line=>line===profile.warning).length;
 }
 const loaded=deserialize(serialize(state));
 if(loaded.stats.hp!==state.stats.hp||loaded.enemies.find(e=>e.id===guardian.id)?.hp!==guardian.hp)throw new Error(`${profile.name}: save/load mismatch`);
 entries.push({guardian:profile.name,pattern:profile.pattern,seed,won:guardian.hp===0,alive:state.stats.hp>0,
  startHp,hp:state.stats.hp,damageTaken:startHp-state.stats.hp,actions,turns,abilities,
  medkitsUsed:startKits-stackCount(state.inventory,'medkit'),ammoUsed:startAmmo-stackCount(state.inventory,'ammo'),
  reward:profile.bonus.label,saveLoad:'passed'});
}

const summary=Object.fromEntries(GUARDIAN_PROFILES.map(profile=>{
 const rows=entries.filter(e=>e.guardian===profile.name),mean=key=>Math.round(rows.reduce((n,r)=>n+r[key],0)/rows.length*10)/10;
 return [profile.pattern,{runs:rows.length,wins:rows.filter(r=>r.won).length,playerDeaths:rows.filter(r=>!r.alive).length,
  meanDamage:mean('damageTaken'),meanActions:mean('actions'),meanAbilities:mean('abilities'),meanMedkits:mean('medkitsUsed'),meanAmmo:mean('ammoUsed')}];
}));
await mkdir('qa-evidence',{recursive:true});
await writeFile('qa-evidence/guardian-balance-report.json',JSON.stringify({description:'Seeded core-engine encounter simulations with a simple dodge/heal/fire policy; this is a regression baseline, not human playtest data.',seeds:SEEDS,runs:entries.length,summary,entries},null,2));
console.log(JSON.stringify(summary,null,2));
const deaths=entries.filter(e=>!e.alive).length,incomplete=entries.filter(e=>!e.won).length;
if(deaths>entries.length*0.1)throw new Error(`Guardian survival floor missed: ${deaths}/${entries.length} deaths`);
if(incomplete>0)throw new Error(`Guardian runs exceeded the turn limit or failed to win: ${incomplete}/${entries.length}`);
for(const profile of GUARDIAN_PROFILES){
 const meanAbilities=summary[profile.pattern].meanAbilities;
 if(meanAbilities<0.5)throw new Error(`${profile.name}'s authored attack rarely appears in the encounter policy (${meanAbilities} mean triggers)`);
}
