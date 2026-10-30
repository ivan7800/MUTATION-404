import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const renderer=readFileSync('apps/web/src/pixi-renderer.ts','utf8');
const main=readFileSync('apps/web/src/main.ts','utf8');
const qa=readFileSync('scripts/qa-browser.mjs','utf8');

test('original GPU tile atlas has Faro and Ojo separate palettes and cached sprites',()=>{
 assert.match(renderer,/tileTexture\(tile:Tile,eye:boolean,faro:boolean,variant:number,region:string\)/);
 assert.match(renderer,/this\.tiles\.get\(key\)/);
 assert.match(renderer,/this\.tiles\.set\(key,texture\)/);
 assert.match(renderer,/state\.zone\.startsWith\('ruin--1--1-'\)/);
 assert.match(renderer,/state\.zone==='surface'/);
 assert.match(renderer,/this\.artMode==='pixel'/);
});
test('v2.9 regional tile atlas covers six biomes while preserving ASCII mode',()=>{
 for(const biome of ['salinas','ceniza','hierro','vidrio','medula','umbral'])assert.ok(renderer.includes(biome+':{stone:'),'missing region palette '+biome);
 assert.match(renderer,/if\(this\.artMode==='pixel'\)\{/);
 assert.match(renderer,/this\.tileTexture\(glyph,eye,faro,Math\.floor\(terrainHash/);
 assert.match(renderer,/const key=\x60\$\{eye\?'eye':faro\?'faro':region\}/);
 assert.ok(qa.includes('region-v29-pixel.png'));
 assert.ok(qa.includes('region-v29-ascii.png'));
});
test('v2.9 final custodian has its own texture, ASCII glyph, and correct HP denominator',()=>{
 assert.match(renderer,/nacar:\['#f3d9a8'/);
 assert.match(renderer,/enemy\.id==='campaign-heart-custodian'/);
 assert.match(renderer,/nacar\?'nacar':elite\?'elite'/);
 assert.match(renderer,/nacar\?'✺'/);
 assert.match(renderer,/enemy\.hp\/\(nacar\?def\.hp\*3:def\.hp\)/);
});
test('v2.9 death banner is hidden for living characters',()=>{
 const css=readFileSync('apps/web/src/style.css','utf8');
 assert.match(main,/classList\.toggle\('hidden',stats\.hp>0\)/);
 assert.match(css,/\.death-banner\.hidden\s*\{\s*display:\s*none\s*\}/);
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
 assert.match(renderer,/field\.kind==='electric'/);
 assert.match(renderer,/field\.kind==='fire'/);
 assert.match(main,/beforeEnemies=new Map\(state\.enemies/);
 assert.match(main,/renderer\.combatFeedback\(beforeEnemies,state\)/);
});

test('v2.3 distinct audiovisual mutation feedback is tied to accepted cast commands',()=>{
 const audio=readFileSync('apps/web/src/audio.ts','utf8');
 for(const id of ['kinetic-pulse','neural-shock','pyrokinesis','phase-step']){
  assert.ok(audio.includes("'"+id+"'"),'no synthesized voice for '+id);
  assert.ok(renderer.includes("'"+id+"'"),'no GPU effect for '+id);
 }
 assert.match(audio,/if\(!this\.enabled\|\|!this\.context\|\|!this\.master\)return/);
 assert.match(renderer,/mutationFeedback\(state:GameState/);
 assert.match(main,/audio\.mutationCue\(m\)/);
 assert.match(main,/renderer\.mutationFeedback\(state,m\)/);
 assert.match(renderer,/this\.reducedMotion\)return/);
});

test('v2.4 tactical warnings only consider visible enemies and fields',()=>{
 const tactical=readFileSync('apps/web/src/tactical.ts','utf8');
 assert.match(tactical,/state\.visible\[index\(field\.x,field\.y\)\]!==1/);
 assert.match(tactical,/state\.visible\[index\(enemy\.x,enemy\.y\)\]!==1/);
 assert.match(tactical,/level:'contact'/);
 assert.match(tactical,/level:'near'/);
 assert.match(tactical,/level:'enemy'/);
 assert.match(tactical,/level:'clear'/);
 assert.match(main,/tacticalSignal\(state\)/);
 assert.match(main,/dataset\.level=tactical\.level/);
 assert.match(renderer,/environmentFeedback\(previous:ReadonlyArray/);
 assert.match(renderer,/this\.fieldBursts\.push/);
 assert.match(renderer,/field\.kind==='fire'/);
 assert.match(renderer,/field\.kind==='electric'/);
 assert.match(renderer,/0xb3ef9e/);
 assert.ok(qa.includes("getAttribute('data-level'),'contact'"));
});

test('Nácar shows distinct phase text and persistent accessible boss HUD',()=>{
 const campaign=readFileSync('packages/core/src/campaign.ts','utf8');
 const css=readFileSync('apps/web/src/style.css','utf8');
 assert.match(campaign,/export function nacarPhase/);
 assert.match(renderer,/nacarPhase\(enemy\.hp,def\.hp\*3\)/);
 assert.match(renderer,/this\.reducedMotion\?\.58/);
 assert.match(main,/id="nacar-boss"/);
 assert.match(main,/bossPanel\.classList\.toggle\('hidden',!guardian\)/);
 assert.match(css,/\.nacar-boss\.hidden\{display:none\}/);
});

test('v2.9 boss danger telegraph uses shared strike positions and supports reduced motion',()=>{
 const campaign=readFileSync('packages/core/src/campaign.ts','utf8');
 assert.match(campaign,/export function nacarStrikeOffsets/);
 assert.match(renderer,/nacarStrikeOffsets\(state\.tick\+100\)/);
 assert.match(renderer,/state\.tick%400===300/);
 assert.match(renderer,/this\.reducedMotion\?\.85/);
 assert.match(main,/id="nacar-boss-warning"/);
 assert.match(main,/IMPACTO PRÓXIMO/);
 assert.match(qa,/nacar-v29-phase-/);
});

test('v2.9 boss transitions are handled once by accepted turns and respect audio settings',()=>{
 const audio=readFileSync('apps/web/src/audio.ts','utf8');
 assert.match(main,/if\(result\.accepted&&state\.zone==='zero-3'\)/);
 assert.match(main,/newPhase>oldPhase/);
 assert.match(main,/audio\.bossCue\(event\)/);
 assert.match(main,/renderer\.bossFeedback\(state,event\)/);
 for(const event of ['awaken','phase2','phase3','defeat'])assert.ok(audio.includes(event+':'));
 assert.match(audio,/if\(!this\.enabled\|\|!this\.context\|\|!this\.master\)return/);
 assert.match(renderer,/private readonly bossBursts/);
 assert.match(renderer,/bossFeedback\(state:GameState,event:/);
 assert.match(renderer,/if\(this\.reducedMotion\)return/);
});

test('v2.9 final chamber art is localized to zero-3 and preserves fog-of-war',()=>{
 const css=readFileSync('apps/web/src/style.css','utf8');
 assert.match(renderer,/if\(state\.zone==='zero-3'\)\{/);
 assert.match(renderer,/state\.seen\[index\(wx,wy\)\]!==1/);
 assert.match(renderer,/const plinths:/);
 assert.match(renderer,/this\.reducedMotion\?0\.22/);
 assert.match(main,/class="epilogue-stage"/);
 assert.match(main,/data-ending="\$\{choice\}"/);
 assert.match(css,/\.epilogue-stage\[data-ending=erase\]/);
 assert.match(css,/@media\(prefers-reduced-motion:no-preference\)/);
});
