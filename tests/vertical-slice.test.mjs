import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const renderer=readFileSync('apps/web/src/pixi-renderer.ts','utf8');
const main=readFileSync('apps/web/src/main.ts','utf8');
const qa=readFileSync('scripts/qa-browser.mjs','utf8');

test('original GPU tile atlas has Faro and Ojo separate palettes and cached sprites',()=>{
 assert.match(renderer,/tileTexture\(tile:Tile,eye:boolean,faro:boolean,variant:number\)/);
 assert.match(renderer,/this\.tiles\.get\(key\)/);
 assert.match(renderer,/this\.tiles\.set\(key,texture\)/);
 assert.match(renderer,/state\.zone\.startsWith\('ruin--1--1-'\)/);
 assert.match(renderer,/state\.zone==='surface'/);
 assert.match(renderer,/this\.artMode==='pixel'/);
});
test('pixel mode toggle is interactive without touching the core game state',()=>{
 assert.match(main,/id="art-mode-btn"/);
 assert.match(main,/#art-mode-btn'\)\.addEventListener\('click'/);
 assert.match(main,/renderer\.toggleArt\(\)/);
 assert.match(main,/key==='z'/);
});
test('browser QA exercises both artistic scenes in both modes',()=>{
 for(const scene of ['faro-pixel','faro-ascii','ojo-pixel','ojo-ascii'])assert.ok(qa.includes(scene));
 assert.match(qa,/generateRuin\(404,-1,-1,2\)/);
 assert.match(qa,/eyeSave=serialize\(state\)/);
});

test('v2.1 reusable character sprites cover all original species and reduced motion',()=>{
 assert.match(renderer,/creatureTexture\(kind:string,frame:0\|1\)/);
 assert.match(renderer,/this\.tiles\.get\(key\)/);
 assert.match(renderer,/this\.tiles\.set\(key,texture\)/);
 for(const kind of ['hero','crawler','sentinel','drone','spore','moth','larva','elite','npc']){
  assert.ok(renderer.includes(kind+":"),'missing texture palette '+kind);
 }
 assert.match(renderer,/this\.artMode==='pixel'\?this\.drawCreature/);
 assert.match(renderer,/this\.reducedMotion\?0/);
});

test('v2.2 combat effects use real before/after HP, without mutating the game core',()=>{
 assert.match(renderer,/combatFeedback\(previous:ReadonlyMap/);
 assert.match(renderer,/enemy\.hp<before\.hp/);
 assert.match(renderer,/this\.flashes\.set\(enemy\.id/);
 assert.match(renderer,/this\.echoes\.push/);
 assert.match(renderer,/field\.kind!=='electric'/);
 assert.match(main,/beforeEnemies=new Map\(state\.enemies/);
 assert.match(main,/renderer\.combatFeedback\(beforeEnemies,state\)/);
});

test('v2.3 distinct audiovisual mutation feedback is tied to accepted cast commands',()=>{
 const audio=readFileSync('apps/web/src/audio.ts','utf8');
 for(const id of ['kinetic-pulse','neural-shock','pyrokinesis','phase-step']){
  assert.ok(audio.includes("'"+id+"'"),'no synthesized voice for '+id);
  assert.ok(renderer.includes("'"+id+"'"),'no GPU effect for '+id);
 }
 assert.match(audio,/if\(!this\.enabled\|\|!this\.context\)return/);
 assert.match(renderer,/mutationFeedback\(state:GameState/);
 assert.match(main,/audio\.mutationCue\(command\.mutation\)/);
 assert.match(main,/renderer\.mutationFeedback\(state,command\.mutation\)/);
 assert.match(renderer,/this\.reducedMotion\)return/);
});
