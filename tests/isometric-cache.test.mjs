import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {generateWorker} from '../scripts/cache-manifest.mjs';

test('offline install includes artwork and a changed atlas invalidates the build cache',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'mutation-atlas-cache-'));
 try{
  await mkdir(join(dir,'assets'));await mkdir(join(dir,'isometric'));
  for(const [name,body] of Object.entries({'index.html':'<html></html>','manifest.webmanifest':'{}','icon.svg':'<svg/>','assets/app.js':'export {};','isometric/nacar.json':'{}','isometric/nacar.png':'first-atlas'}))await writeFile(join(dir,name),body);
  await generateWorker(dir);const first=await readFile(join(dir,'sw.js'),'utf8');
  const assets=JSON.parse(first.match(/const ASSETS=(\[.*\]);/)[1]);
  assert.ok(assets.includes('./isometric/nacar.png'));assert.ok(assets.includes('./isometric/nacar.json'));
  await writeFile(join(dir,'isometric/nacar.png'),'second-atlas');await generateWorker(dir);
  const second=await readFile(join(dir,'sw.js'),'utf8');
  assert.notEqual(first.match(/const VERSION='([^']+)'/)[1],second.match(/const VERSION='([^']+)'/)[1]);
 }finally{await rm(dir,{recursive:true,force:true});}
});
