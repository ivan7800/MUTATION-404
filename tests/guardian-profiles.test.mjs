import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dispatch,deserialize,serialize,stackCount} from '../dist/core/core/src/game.js';
import {takeEnemyTurn,ENEMY_DEFS} from '../dist/core/core/src/combat.js';
import {stepEnvironment} from '../dist/core/core/src/environment.js';
import {GUARDIAN_PROFILES,guardianProfileFromId,guardianVitality} from '../dist/core/core/src/guardian-profiles.js';
import {RUIN_THEMES,generateRuin} from '../dist/core/core/src/depths.js';

const SITES=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];

test('eight custodians have authored, distinct combat patterns and backward-compatible ids',()=>{
 assert.equal(GUARDIAN_PROFILES.length,8);
 assert.equal(new Set(GUARDIAN_PROFILES.map(p=>p.pattern)).size,8);
 assert.equal(new Set(GUARDIAN_PROFILES.map(p=>p.bonus.kind)).size,8);
 assert.equal(new Set(GUARDIAN_PROFILES.map(p=>p.warning)).size,8);
 for(const [i,[x,y]] of SITES.entries()){
  const profile=GUARDIAN_PROFILES[i],theme=RUIN_THEMES[i];
  assert.equal(guardianProfileFromId(`elite-${x}-${y}-2`),profile);
  assert.equal(theme.guardianPattern,profile.pattern);
  assert.equal(theme.guardian,profile.name);
  assert.equal(theme.guardianKind,profile.kind);
  const guardian=generateRuin(404,x,y,2).enemies.find(e=>e.id===`elite-${x}-${y}-2`);
  assert.equal(guardian.kind,profile.kind);
  assert.equal(guardian.hp,guardianVitality(ENEMY_DEFS[profile.kind].hp));
  assert.equal('guardianPattern' in guardian,false,'profile must not add save data');
 }
 assert.equal(guardianProfileFromId('elite-0-0-2'),undefined);
 assert.equal(guardianProfileFromId('elite-1-0-1'),undefined);
});

test('each custodian telegraphs its own avoidable attack without immediate damage',()=>{
 for(const profile of GUARDIAN_PROFILES){
  const state=createGame(404);state.zone=`ruin-${profile.x}-${profile.y}-2`;
  state.tiles.fill('.');state.player={x:40,y:30};state.fields=[];
  state.enemies=[{id:`elite-${profile.x}-${profile.y}-2`,kind:profile.kind,x:43,y:30,hp:guardianVitality(ENEMY_DEFS[profile.kind].hp),mode:'idle',searchTurns:0}];
  state.tick=profile.period*100;
  const hp=state.stats.hp,log=[],actions=[];
  takeEnemyTurn(state,line=>log.push(line),event=>actions.push(event));
  assert.ok(log.includes(profile.warning),`${profile.name} should show its authored warning`);
  assert.ok(actions.some(a=>a.id===state.enemies[0].id&&a.action==='ability'));
  assert.ok(state.fields.some(f=>f.kind===profile.field),`${profile.name} should create its own field`);
  assert.equal(state.stats.hp,hp,'warning turn should not damage the player');
  const hazards=new Set(state.fields.map(f=>`${f.x},${f.y}`));
  const dodge=[[0,-1],[1,0],[0,1],[-1,0]]
   .map(([dx,dy])=>({x:40+dx,y:30+dy})).find(p=>!hazards.has(`${p.x},${p.y}`));
  assert.ok(dodge,`${profile.name} should leave a one-step escape`);
  state.player=dodge;
  stepEnvironment(state,text=>log.push(text));
  assert.equal(state.stats.hp,hp,`${profile.name} should be avoidable by moving after its warning`);
 }
});

test('guardian archives grant distinct bonuses once and retain them after save/load',()=>{
 for(const profile of GUARDIAN_PROFILES){
  const state=createGame(808);state.zone=`ruin-${profile.x}-${profile.y}-2`;state.tiles.fill('.');
  state.player={x:25,y:12};state.enemies=[];state.fields=[];state.stats.focus=0;state.stats.hp=20;state.exposure=40;
  const before={credits:state.stats.credits,ammo:stackCount(state.inventory,'ammo'),medkit:stackCount(state.inventory,'medkit'),capacitor:stackCount(state.inventory,'capacitor'),gene:state.genome.genePoints};
  assert.equal(dispatch(state,{type:'interact'}).accepted,true,`${profile.name} archive should be claimable after its guardian is down`);
  const bonus=profile.bonus;
  if(bonus.kind==='ammo'||bonus.kind==='medkit'||bonus.kind==='capacitor')assert.equal(stackCount(state.inventory,bonus.kind),before[bonus.kind]+bonus.amount+(bonus.kind==='capacitor'?1:0));
  else if(bonus.kind==='credits')assert.equal(state.stats.credits,before.credits+15+bonus.amount);
  else if(bonus.kind==='focus')assert.equal(state.stats.focus,bonus.amount);
  else if(bonus.kind==='heal')assert.equal(state.stats.hp,20+bonus.amount);
  else if(bonus.kind==='exposure')assert.equal(state.exposure,40-bonus.amount);
  else assert.equal(state.genome.genePoints,before.gene+bonus.amount);
  const loaded=deserialize(serialize(state));
  assert.equal(dispatch(loaded,{type:'interact'}).accepted,true);
  assert.deepEqual(loaded.inventory,state.inventory,`${profile.name} must not duplicate inventory rewards`);
  assert.equal(loaded.stats.credits,state.stats.credits);
  assert.equal(loaded.stats.hp,state.stats.hp);
  assert.equal(loaded.stats.focus,state.stats.focus);
  assert.equal(loaded.exposure,state.exposure);
  assert.equal(loaded.genome.genePoints,state.genome.genePoints);
 }
});
