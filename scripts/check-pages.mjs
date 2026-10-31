import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const base='play';
const expected=['index.html'];
for(const relative of expected){if(!existsSync(join(base,relative)))throw new Error(`Missing: ${relative}`);}
const html=readFileSync(join(base,'index.html'),'utf8');
if(/(?:src|href)="\/(?!\/)/.test(html))throw new Error('Root-absolute asset path is incompatible with project Pages');
const assets=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match=>match[1]).filter(path=>path.startsWith('./'));
if(!assets.length)throw new Error('Portable entrypoint missing');
for(const asset of assets){if(!existsSync(join(base,asset.slice(2))))throw new Error(`Missing referenced asset: ${asset}`);}
console.log('PASS GitHub Pages portable artifact:',expected.length+assets.length,'files checked');
