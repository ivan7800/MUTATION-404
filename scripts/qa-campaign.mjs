import {mkdir,writeFile} from 'node:fs/promises';
import {createGame,dispatch,campaignProgress,campaignObjective,serialize,deserialize} from '../dist/core/core/src/game.js';
import {CAMPAIGN_SITES,FINAL_GUARDIAN_ID} from '../dist/core/core/src/campaign.js';

const results=[];
for(const choice of ['bind','release','erase']){
  const state=createGame(404);
  const checkpoints=[];
  const mark=label=>checkpoints.push({label,objective:campaignObjective(state).title,progress:campaignProgress(state)});
  mark('acto-I');
  state.quest.status='completed';
  for(const {x,y} of CAMPAIGN_SITES)state.events.push(`relic:${x}:${y}:2`);
  mark('acto-II');
  for(const {x,y} of CAMPAIGN_SITES)state.events.push(`elite-cache:ruin-${x}-${y}-2`);
  state.events.push('heart');mark('acto-IV');
  state.zone='zero-3';state.tiles.fill('.');state.fields=[];state.enemies=[];state.player={x:14,y:10};
  assert(dispatch(state,{type:'interact'}).accepted,'guardian activation');
  const guardian=state.enemies.find(enemy=>enemy.id===FINAL_GUARDIAN_ID);
  assert(guardian?.hp>0,'guardian must spawn alive');
  guardian.hp=0;
  assert(dispatch(state,{type:'interact'}).accepted,'finale dialogue');
  assert(dispatch(state,{type:'choose',option:`finale-${choice}`}).accepted,`ending ${choice}`);
  const loaded=deserialize(serialize(state));
  assert(campaignProgress(loaded).ending===choice,`ending ${choice} must persist`);
  mark(`final-${choice}`);
  results.push({seed:404,choice,status:'passed',checkpoints});
}
await mkdir('qa-evidence',{recursive:true});
await writeFile('qa-evidence/campaign-report.json',JSON.stringify({status:'passed',kind:'deterministic-progression-contract',humanPlaythrough:false,results},null,2));
console.log(`PASS campaign contract audit: ${results.length}/3 endings, ${results.reduce((n,r)=>n+r.checkpoints.length,0)} checkpoints`);
function assert(condition,message){if(!condition)throw new Error(message);}
