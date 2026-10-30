import {createGame,dispatch,deserialize,serialize,refreshVisibility,stackCount} from '../dist/core/core/src/game.js';
import {ENEMY_DEFS} from '../dist/core/core/src/combat.js';
import {mkdir,writeFile} from 'node:fs/promises';

const SEEDS=[1,7,17,42,77,101,404,808,2026,9999,13579,24680,31,53,79,97,113,127,151,173,191,211,223,251];

function arena(seed,kind){
 const s=createGame(seed);
 s.zone='ruin-1-0-1';s.tiles.fill('.');s.player={x:60,y:30};
 s.fields=[];s.enemies=[];s.ground=[];s.seen.fill(1);s.visible.fill(1);
 s.tick=100;return s;
}
function battle(seed,kind,weapon){
 const s=arena(seed,kind),startHp=s.stats.hp;
 let attacks=0,attempted=0,kills=0,heals=0,failures=0,damageTaken=0;
 const startingAmmo=stackCount(s.inventory,'ammo'),startingKits=stackCount(s.inventory,'medkit');
 for(let wave=0;wave<6;wave++){
   if(s.stats.hp<=0)break;
   const enemy={id:`balance-${wave}`,kind,x:weapon==='fire'?63:61,y:30,hp:ENEMY_DEFS[kind].hp,mode:'idle',searchTurns:0};
   s.enemies.push(enemy);refreshVisibility(s);
   for(let turn=0;turn<18&&enemy.hp>0&&s.stats.hp>0;turn++){
     if(s.stats.hp<=12&&stackCount(s.inventory,'medkit')>0){
       const response=dispatch(s,{type:'heal'});if(response.accepted)heals++;
     }
     if(s.stats.hp<=0)break;
     const prior=s.stats.hp,response=dispatch(s,{type:weapon});
     if(response.accepted){attacks++;damageTaken+=Math.max(0,prior-s.stats.hp);}
     else {failures++;break;}
   }
   if(enemy.hp<=0)kills++;
   else break;
 }
 const saved=deserialize(serialize(s));
 if(saved.kills!==s.kills||saved.stats.hp!==s.stats.hp)throw Error('Save/load lost balance state');
 return {seed,kind,weapon,waves:kills,alive:s.stats.hp>0,hp:s.stats.hp,startHp,attacks,heals,failures,
  level:s.stats.level,xp:s.stats.xp,credits:s.stats.credits,
  ammoUsed:startingAmmo-stackCount(s.inventory,'ammo'),kitsUsed:startingKits-stackCount(s.inventory,'medkit'),
  lootOnGround:s.ground.length,damageTaken};
}
function shelter(seed){
 const s=createGame(seed);s.enemies=[];s.fields=[];s.exposure=30;s.stats.hp=21;
 for(let i=0;i<80;i++)dispatch(s,{type:'wait'});
 return {seed,kind:'shelter',alive:s.stats.hp>0,hp:s.stats.hp,exposure:s.exposure,focus:s.stats.focus,
  logCount:s.log.length,tick:s.tick};
}
const entries=[];
for(const seed of SEEDS){
 entries.push(battle(seed,'crawler','attack'));
 entries.push(battle(seed,'sentinel','fire'));
 entries.push(shelter(seed));
}
const mean=(a)=>a.reduce((x,y)=>x+y,0)/a.length;
const summary={seeds:SEEDS.length, scenarios:{}};
for(const kind of ['crawler','sentinel','shelter']){
 const rows=entries.filter(e=>e.kind===kind),r={count:rows.length,alive:rows.filter(e=>e.alive).length,
  meanHp:Math.round(mean(rows.map(e=>e.hp))*10)/10};
 if(kind!=='shelter')Object.assign(r,{meanWaves:Math.round(mean(rows.map(e=>e.waves))*100)/100,
  meanAttacks:Math.round(mean(rows.map(e=>e.attacks))*10)/10,meanHeals:Math.round(mean(rows.map(e=>e.heals))*100)/100,
  meanAmmoUsed:Math.round(mean(rows.map(e=>e.ammoUsed))*10)/10,meanLootLeft:Math.round(mean(rows.map(e=>e.lootOnGround))*10)/10,
  blocked:rows.filter(e=>e.failures>0).length});
 else Object.assign(r,{meanExposure:mean(rows.map(e=>e.exposure)),meanFocus:mean(rows.map(e=>e.focus))});
 summary.scenarios[kind]=r;
}
await mkdir('qa-evidence',{recursive:true});
await writeFile('qa-evidence/balance-report.json',JSON.stringify({description:'Deterministic isolated combat scenarios; not a full-game playtest',summary,entries},null,2));
console.log('BALANCE METRICS',JSON.stringify(summary,null,2));
if(summary.scenarios.shelter.meanExposure!==0||summary.scenarios.shelter.alive!==SEEDS.length)throw Error('Sanctuary recovery regression');
if(entries.some(r=>!Number.isFinite(r.hp)||r.hp<0))throw Error('Invalid HP in balance simulation');
