import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {composition} from '../play/js/apps/web/src/ascii-art.js';

const renderer=readFileSync('apps/web/src/pixi-renderer.ts','utf8');
const main=readFileSync('apps/web/src/main.ts','utf8');
const qa=readFileSync('scripts/qa-browser.mjs','utf8');
const pixel=readFileSync('apps/web/src/pixel-renderer.ts','utf8');
const atlas=readFileSync('apps/web/public/pixel/atlas.svg','utf8');
const assets=readFileSync('apps/web/src/pixel-assets.ts','utf8');

test('static map floor is drawn in a dedicated cached Graphics layer',()=>{
 assert.match(renderer,/terrainFloor=new Graphics\(\)/);
 assert.match(renderer,/terrainCache=new Map/);
 assert.match(renderer,/const floorDirty=this\.floorKey!==floorKey/);
 assert.match(renderer,/if\(floorDirty\)\{/);
 assert.match(renderer,/this\.terrainFloor\.rect\(/);
 assert.match(renderer,/result\.view\.addChild\(result\.terrainFloor,result\.backdrop,result\.layers,result\.foreground\)/);
 assert.match(renderer,/new URLSearchParams\(location\.search\)\.has\('profile'\)/);
});
test('shared catalogue covers volumetric terrain and boss',()=>{
 for(const tile of ['.','#','%','=','~','*','&','!'])assert.ok(composition(tile).length>=2);
 assert.ok(composition('✺').length>=4);
 assert.notDeepEqual(composition('✺'),composition('D'));
 assert.ok(renderer.includes('enemy.hp/(nacar?def.hp*3:def.hp)'));
 assert.doesNotMatch(renderer,/tileTexture|creatureTexture|drawCreature/);
});
test('v2.9 death banner is hidden for living characters',()=>{
 const css=readFileSync('apps/web/src/style.css','utf8');
 assert.match(main,/classList\.toggle\('hidden',stats\.hp>0\)/);
 assert.match(css,/\.death-banner\.hidden\s*\{\s*display:\s*none\s*\}/);
});
test('Pixel and ASCII renderers share the same game controls',()=>{
 assert.match(main,/art-mode-btn/);
 assert.match(main,/setArtMode/);
 assert.ok(renderer.includes("get mode(): 'ascii'"));
 assert.match(pixel,/get mode|readonly mode='pixel'/);
 assert.match(pixel,/loadPixelAtlas/);
 assert.match(atlas,/id="hero-idle"/);
 assert.match(atlas,/id="crawler"/);
 assert.match(atlas,/id="ruin"/);
});
test('Pixel Rebirth inventory covers every biome, species, elite and boss',()=>{
 for(const id of ['salinas','ceniza','hierro','vidrio','medula','umbral']){
  assert.match(atlas,new RegExp(`id="floor-${id}"`));
  assert.match(atlas,new RegExp(`id="prop-${id}"`));
  assert.ok(assets.includes(`floor-${id}`));
 }
 for(const id of ['crawler','sentinel','larva','moth','drone','spore']){
  assert.match(atlas,new RegExp(`id="${id}-a"`));
  assert.match(atlas,new RegExp(`id="${id}-b"`));
 }
 assert.match(atlas,/id="elite-drone-a"/);
 assert.match(atlas,/id="boss-heart-a"/);
 assert.match(pixel,/campaign-heart/);
 assert.match(pixel,/elite-/);
 assert.match(pixel,/Math\.floor\(this\.ambience\/2\)%2/);
 assert.match(readFileSync('scripts/qa-pixel-biomes.mjs','utf8'),/Object\.entries\(points\)/);
});
test('Pixel renderer reuses world terrain sprites between animation frames',()=>{
 assert.match(pixel,/terrainPool=new Map<string,Sprite>\(\)/);
 assert.match(pixel,/for\(const sprite of this\.terrainPool\.values\(\)\)sprite\.visible=false/);
 assert.match(pixel,/this\.terrainPool\.get\(key\)/);
 assert.match(pixel,/else if\(sprite\.texture!==texture\)sprite\.texture=texture/);
});
test('browser QA exercises both artistic scenes in the unified ASCII mode',()=>{
 assert.ok(qa.includes('faro-ascii-unified'));
 assert.ok(qa.includes('ojo-ascii-unified'));
 assert.match(qa,/generateRuin\(404,-1,-1,2\)/);
 assert.match(qa,/eyeSave=serialize\(state\)/);
});

test('shared actors retain printable silhouettes in both poses',()=>{
 for(const glyph of ['@','s','V','l','p','D','f','✺','◆','npc:$'])for(const frame of [0,1]){
  const rows=composition(glyph,frame);
  assert.ok(rows.length>=3);
  for(const row of rows)assert.ok([...row].every(c=>c.charCodeAt(0)>=32&&c.charCodeAt(0)<=126));
 }
 assert.notDeepEqual(composition('@',0),composition('@',1));
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
 assert.match(renderer,/nacarMark\(state\.events,state\.tick\+100\)/);
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

test('v2.9 Pixi sprite pool is lazy and only hides previously active elements',()=>{
 assert.match(renderer,/private allocateSprites\(\):void\{this\.growSprites\(64\);\}/);
 assert.match(renderer,/private spriteAt\(i:number\):Sprite/);
 assert.match(renderer,/if\(i>=this\.viewW\*this\.viewH\+250\)throw/);
 assert.match(renderer,/for\(let i=used;i<this\.activeSprites;i\+\+\)this\.sprites\[i\]\.visible=false/);
 assert.match(renderer,/this\.peakActiveSprites=Math\.max/);
 assert.match(qa,/allocatedSprites<47\*27\+250/);
});
