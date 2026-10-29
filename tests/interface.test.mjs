import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main=readFileSync('apps/web/src/main.ts','utf8');
const style=readFileSync('apps/web/src/style.css','utf8');
const markup=main.match(/root\.innerHTML=`([\s\S]*?)`;\s*const \$/)?.[1];

test('initial HTML declares every field referenced by the new biome HUD',()=>{
  assert.ok(markup,'root HTML template exists');
  for(const id of ['biome-strip','biome-subtitle','biome-description','biome-name','biome-lore','weather-badge','weather-info','climate-note','threat-note','research-count','exposure-text','exposure-bar','scan-btn','atlas-btn','audio-btn']){
    assert.ok(markup.includes(`id="${id}"`),`missing ${id}`);
    assert.ok(main.includes(`#${id}`),`unused UI id ${id}`);
  }
});
test('critical UI controls route to actions and show keyboard alternatives',()=>{
  assert.match(main,/r:\{type:'scan'\}/);
  assert.match(main,/key==='m'/);
  assert.match(main,/#audio-btn'\)\.addEventListener/);
  assert.match(style,/\.biome-story/);
  assert.match(style,/\.atlas-grid/);
});
test('offline entrypoint includes the audio and biome modules',()=>{
  const entry=readFileSync('play/js/apps/web/src/main.js','utf8');
  const audio=readFileSync('play/js/apps/web/src/audio.js','utf8');
  const biomes=readFileSync('play/js/packages/core/src/biomes.js','utf8');
  assert.match(entry,/\.\/audio\.js/);
  assert.match(audio,/AudioContext/);
  assert.match(biomes,/Páramos de Ceniza/);
});

test('W4 mutation UI controls are present, wired and included in offline build',()=>{
  for(const id of ['mutations-btn','mutations-side-btn','pulse-btn','neural-btn','fire-btn-gene','phase-btn','genes','gene-count','field-count','gene-summary','mutant-skills']){
    assert.ok(markup.includes(`id="${id}"`),`missing mutation UI #${id}`);
    assert.ok(main.includes(`#${id}`),`mutation UI not used #${id}`);
  }
  assert.match(main,/key==='u'/);
  assert.match(main,/type:'cast'/);
  assert.match(main,/mutation404\.v04\.save/);
  assert.match(style,/\.action\.gene/);
  const offline=readFileSync('play/js/apps/web/src/main.js','utf8');
  assert.match(offline,/mutations-side-btn/);
  assert.match(offline,/\.\/mutations\.js|mutations/);
});

test('v0.8 ecology buttons have event listeners and new save slot',()=>{
  for(const id of ['harvest-btn','craft-btn','ecology-btn','ecology-pressure']){
    assert.ok(markup.includes(`id="${id}"`),`missing #${id}`);
    assert.ok(main.includes(`#${id}`),`unused #${id}`);
  }
  assert.match(main,/mutation404\.v08\.save/);
  assert.match(main,/mutation404\.v07\.save/);
  for(const key of ['k','o','y'])assert.ok(main.includes(`key==='${key}'`));
});
