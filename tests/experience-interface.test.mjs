import test from 'node:test';
import assert from 'node:assert/strict';
import {RUIN_THEMES,themeForRuin} from '../dist/core/core/src/depths.js';
import {readFileSync} from 'node:fs';

const ui=readFileSync('apps/web/src/main.ts','utf8');
test('all eight regional dungeons retain unique thematic storylines and hazards',()=>{
 assert.equal(RUIN_THEMES.length,8);
 assert.equal(new Set(RUIN_THEMES.map(t=>t.name)).size,8);
 assert.equal(new Set(RUIN_THEMES.map(t=>t.lore)).size,8);
 assert.equal(new Set(RUIN_THEMES.map(t=>t.reward)).size,8);
 for(const [i,[x,y]] of [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]].entries()){
   assert.equal(themeForRuin(x,y).name,RUIN_THEMES[i].name);
 }
});
test('exploration panel presents current ruin identity instead of generic subterranean text',()=>{
 assert.match(ui,/const activeRuin=parseRuin\(state\.zone\)/);
 assert.match(ui,/const ruinTheme=activeRuin\?themeForRuin/);
 assert.match(ui,/ruinTheme\?\x60\$\{ruinTheme\.lore\}/);
 assert.match(ui,/ruinTheme\?\.name\?\?biomeDef\.name/);
 assert.match(ui,/ruinTheme\?\.lore\?\?biomeDef\.sound/);
});

test('v2.6 HUD conveys medicine, ammunition and critical-health warnings',()=>{
 assert.match(ui,/id="survival-strip"/);
 assert.match(ui,/criticalHp=state\.stats\.hp/);
 assert.match(ui,/kits=stackCount\(state\.inventory,'medkit'\)/);
 assert.match(ui,/ammo=stackCount\(state\.inventory,'ammo'\)/);
 assert.match(ui,/data-risk="stable"/);
});
