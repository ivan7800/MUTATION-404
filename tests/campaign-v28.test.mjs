import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dispatch,serialize,deserialize,campaignObjective,campaignProgress,campaignArchiveList} from '../dist/core/core/src/game.js';
import {CAMPAIGN_SITES,FINAL_GUARDIAN_ID} from '../dist/core/core/src/campaign.js';

function finale(seed=404,choice='broadcast'){
 const s=createGame(seed);
 s.zone='zero-3';s.tiles.fill('.');s.fields=[];s.enemies=[];s.player={x:14,y:10};
 s.quest={status:'completed',outcome:choice,fuseFound:true};
 s.events.push('heart');
 for(const {x,y} of CAMPAIGN_SITES){
  s.events.push(`relic:${x}:${y}:2`);
  s.events.push(`elite-cache:ruin-${x}-${y}-2`);
 }
 return s;
}
test('campaign requires the original prologue plus eight distinct archives and custodian records',()=>{
 const s=createGame(404);
 assert.match(campaignObjective(s).title,/ACTO I/);
 assert.equal(campaignProgress(s).ready,false);
 s.quest.status='completed';
 assert.match(campaignObjective(s).title,/ACTO II/);
 for(const {x,y} of CAMPAIGN_SITES)s.events.push(`relic:${x}:${y}:2`);
 assert.equal(campaignProgress(s).archives,8);
 assert.match(campaignObjective(s).title,/ACTO III/);
 for(const {x,y} of CAMPAIGN_SITES)s.events.push(`elite-cache:ruin-${x}-${y}-2`);
 assert.match(campaignObjective(s).title,/ACTO IV/);
 s.events.push('heart');assert.equal(campaignProgress(s).ready,true);
 assert.match(campaignObjective(s).title,/ACTO V/);
 assert.equal(campaignArchiveList(s).length,8);
});
test('heart console refuses to awaken until mission and archives are completed',()=>{
 const s=finale();
 s.events=s.events.filter(e=>!e.startsWith('relic:'));
 const result=dispatch(s,{type:'interact'});
 assert.equal(result.accepted,false);
 assert.equal(s.enemies.some(e=>e.id===FINAL_GUARDIAN_ID),false);
});
for(const choice of ['bind','release','erase']){
 test(`campaign ending ${choice} requires defeating guardian and persists after loading`,()=>{
  const s=finale(404,'broadcast');
  const activation=dispatch(s,{type:'interact'});
  assert.equal(activation.accepted,true);
  const guardian=s.enemies.find(e=>e.id===FINAL_GUARDIAN_ID);
  assert.ok(guardian&&guardian.hp>0,'final boss must be real and alive');
  assert.equal(campaignProgress(s).finaleAwakened,true);
  assert.equal(dispatch(s,{type:'interact'}).accepted,false,'cannot skip boss encounter');
  // Test fixture simulates a boss defeated by the normal combat engine.
  guardian.hp=0;
  assert.equal(dispatch(s,{type:'interact'}).accepted,true);
  assert.ok(s.dialogue?.options.some(x=>x.id==='finale-'+choice));
  assert.equal(dispatch(s,{type:'choose',option:'finale-'+choice}).accepted,true);
  assert.equal(campaignProgress(s).ending,choice);
  const loaded=deserialize(serialize(s));
  assert.equal(campaignProgress(loaded).ending,choice);
  assert.match(campaignObjective(loaded).title,/EPÍLOGO COMPLETADO/);
  assert.equal(dispatch(loaded,{type:'choose',option:'finale-'+choice}).accepted,false);
 });
}
test('the initial signal decision influences epilogue tone',async()=>{
 const {endingStory}=await import('../dist/core/core/src/campaign.js');
 for(const c of ['bind','release','erase']){
  const on=endingStory(c,'broadcast'),off=endingStory(c,'isolate');
  assert.notEqual(on.description,off.description);
  assert.ok(on.description.length>120);
  assert.notEqual(on.title,'');
 }
});
