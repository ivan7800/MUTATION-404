import {execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import * as current from '../dist/core/core/src/game.js';
const baseline='e0a9094';
const directory=mkdtempSync(resolve(tmpdir(),'mutation-original-'));
const archive=execFileSync('git',['archive',baseline,'package.json','packages/core/src','tsconfig.core.json']);
execFileSync('tar',['-x','-C',directory],{input:archive});
execFileSync(resolve('node_modules/.bin/tsc'),['-p',resolve(directory,'tsconfig.core.json')]);
const original=await import(pathToFileURL(resolve(directory,'dist/core/core/src/game.js')));
const commands=[{type:'move',dx:1,dy:0},{type:'move',dx:0,dy:-1},{type:'wait'},{type:'scan'},{type:'move',dx:-1,dy:0},{type:'inspect'},{type:'target'},{type:'attack'},{type:'fire'},{type:'harvest'},{type:'interact'},{type:'close-dialog'},{type:'move',dx:0,dy:1}];
for(const name of ['ENEMY_DEFS','MUTATIONS','BIOMES','RECIPES','LANDMARKS','SECTORS','ITEM_DEFS'])assert.deepEqual(current[name],original[name],name+' catalogue differs');
let transitions=0;
for(const seed of [1,17,404,2026,9999]){
  const before=original.createGame(seed),after=current.createGame(seed);
  for(let step=0;step<500;step++){
    const command=commands[step%commands.length];
    assert.deepEqual(current.dispatch(after,command),original.dispatch(before,command),`response seed ${seed} step ${step}`);
    assert.equal(current.serialize(after),original.serialize(before),`save seed ${seed} step ${step}`);
    transitions++;
  }
}
mkdirSync('qa-evidence',{recursive:true});
writeFileSync('qa-evidence/conservation-report.json',JSON.stringify({status:'passed',baseline,seeds:5,transitions,catalogues:7,note:'Deterministic sampled traces, not a human campaign.'},null,2));
console.log(`PASS ${transitions} transitions and 7 catalogues match ${baseline}`);
