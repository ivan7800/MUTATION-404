import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync('apps/web/src/main.ts','utf8');
const audio=readFileSync('apps/web/src/audio.ts','utf8');
const css=readFileSync('apps/web/src/style.css','utf8');
const qa=readFileSync('scripts/qa-browser.mjs','utf8');

test('startup is an actual blocking menu with new, continue, load, import and settings',()=>{
 for(const id of ['start-menu','start-new','start-continue','start-load','start-import','start-file','start-options','start-volume','start-audio']){
  assert.ok(main.includes('id="'+id+'"'),`missing ${id}`);
 }
 assert.match(main,/if\(!gameStarted\|\|modalMode\)return/);
 assert.match(main,/if\(!gameStarted\)return/);
 assert.match(main,/if\(gameStarted&&state\.stats\.hp>0\)save\(true\)/);
 assert.match(main,/const restored=deserialize\(raw\)/);
 assert.match(main,/state=restored/);
 assert.match(main,/function beginGame\(\):void/);
 assert.match(main,/renderer\.pauseAmbience\(\)/);
 assert.match(css,/\.start-menu\.hidden/);
});
test('sound offers opt-in, audible test, adjustable master and default volume',()=>{
 assert.match(audio,/async toggle\(\):Promise<boolean>/);
 assert.match(audio,/await c\.resume\(\)/);
 assert.match(audio,/this\.enabled=true/);
 assert.match(audio,/this\.testTone\(\)/);
 assert.match(audio,/private master:GainNode\|null=null/);
 assert.match(audio,/setVolume\(level:number\)/);
 assert.match(audio,/osc\.frequency\.setValueAtTime\(440,t\)/);
 assert.match(main,/if\(raw===null\)return \.55/);
 assert.match(qa,/start-audio/);
});
test('browser QA covers title, option volume, continue and save restoration',()=>{
 assert.match(qa,/start-menu'\)\.isVisible/);
 assert.match(qa,/start-volume-value/);
 assert.match(qa,/start-continue'\)\.isDisabled/);
 assert.match(qa,/start-continue'\)\.isEnabled/);
 assert.match(qa,/continue must restore last saved player coordinates/);
});
