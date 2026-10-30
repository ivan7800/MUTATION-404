import test from 'node:test';
import assert from 'node:assert/strict';
import {GOODS,priceFor,SECTORS,createGame,dispatch,serialize,deserialize,stackCount} from '../dist/core/core/src/game.js';

test('v2.7 no infinite credits from a buy/sell loop at any regional market',()=>{
 for(const sector of SECTORS){
   const key=`sector-${sector.x}-${sector.y}`;
   for(const item of Object.keys(GOODS)){
     for(const reputation of [0,1,3,6,12,18,30,60,100]){
       const buy=priceFor(item,'buy',reputation,key);
       const sell=priceFor(item,'sell',reputation,key);
       assert.ok(buy!==null&&sell!==null);
       assert.ok(buy>sell,`${item} in ${key} reputation ${reputation}: buy ${buy} <= sell ${sell}`);
     }
   }
 }
});
test('v2.7 repeated actions preserve deterministic progression and a valid save',()=>{
 for(const seed of [7,404,808]){
   const a=createGame(seed),b=createGame(seed);
   // All turns use the actual dispatch API; no fabricated experience or credits.
   const actions=[{type:'inspect'},{type:'wait'},{type:'scan'},{type:'move',dx:1,dy:0},{type:'move',dx:-1,dy:0}];
   for(let i=0;i<120;i++){
     const command=actions[i%actions.length];
     assert.deepEqual(dispatch(a,command),dispatch(b,command));
     assert.equal(a.stats.credits,b.stats.credits);
     assert.equal(a.stats.level,b.stats.level);
     assert.equal(a.stats.xp,b.stats.xp);
     assert.ok(a.stats.credits>=0,'negative credits');
   }
   const restored=deserialize(serialize(a));
   assert.equal(restored.stats.credits,a.stats.credits);
   assert.equal(restored.stats.level,a.stats.level);
   assert.equal(restored.stats.xp,a.stats.xp);
   assert.equal(stackCount(restored.inventory,'medkit'),stackCount(a.inventory,'medkit'));
 }
});
