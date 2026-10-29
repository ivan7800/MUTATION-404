import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const base='play';
const expected=['index.html','style.css','js/apps/web/src/main.js','js/apps/web/src/renderer.js','js/packages/core/src/game.js'];
for(const relative of expected){if(!existsSync(join(base,relative)))throw new Error(`Missing: ${relative}`);}
const html=readFileSync(join(base,'index.html'),'utf8');
if(/(?:src|href)="\/(?!\/)/.test(html))throw new Error('Root-absolute asset path is incompatible with project Pages');
if(!html.includes('./js/apps/web/src/main.js'))throw new Error('Portable entrypoint missing');
console.log('PASS GitHub Pages portable artifact:',expected.length,'files checked');
