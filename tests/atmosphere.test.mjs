import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const renderer=readFileSync('apps/web/src/renderer.ts','utf8');
const main=readFileSync('apps/web/src/main.ts','utf8');
const css=readFileSync('apps/web/src/style.css','utf8');

test('atmospheric lighting uses player distance and respects visibility',()=>{
 assert.match(renderer,/if\(visible\)\{\s*const distance=Math\.hypot/);
 assert.match(renderer,/const radius=timeNight\?7:12/);
 assert.match(renderer,/ctx\.createRadialGradient/);
});
test('ambient animation pauses in hidden tabs and honors reduced motion',()=>{
 assert.match(renderer,/startAmbience\(\):void/);
 assert.match(renderer,/if\(this\.reducedMotion\|\|this\.ambientFrame\)return/);
 assert.match(renderer,/document\.visibilityState==='hidden'/);
 assert.match(renderer,/time-this\.ambientLast>=125/);
 assert.match(renderer,/pauseAmbience\(\):void/);
 assert.match(main,/renderer\.pauseAmbience\(\)/);
 assert.match(main,/renderer\.startAmbience\(\)/);
});
test('ASCII interface retains focus, touch affordances and contrast',()=>{
 assert.match(css,/\/\* v1\.8 — Nácar atmosférico/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/\.action\{min-height:42px/);
 assert.match(main,/data-move/);
});
