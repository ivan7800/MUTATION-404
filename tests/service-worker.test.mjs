import test from 'node:test';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {readFileSync} from 'node:fs';
test('worker retires only its own scoped build caches and waits safely for upgrade',async()=>{
  const handlers={},deleted=[];
  const code=readFileSync('apps/web/public/sw.js','utf8');
  runInNewContext(code,{URL,fetch:()=>{},self:{registration:{scope:'https://game.test/preview/'},clients:{claim:async()=>{}},addEventListener:(name,fn)=>{handlers[name]=fn;}},caches:{keys:async()=>['other-app','mutation404:/stable/:old','mutation404:/preview/:old','mutation404:/preview/:__BUILD_VERSION__'],delete:async key=>deleted.push(key)}});
  let work;handlers.activate({waitUntil:promise=>{work=promise;}});await work;
  assert.deepEqual(deleted,['mutation404:/preview/:old']);
});
test('failed precache rejects installation instead of activating a partial game',async()=>{
  const handlers={},failure=Error('missing asset');
  runInNewContext(readFileSync('apps/web/public/sw.js','utf8'),{URL,fetch:()=>{},self:{registration:{scope:'https://game.test/game/'},addEventListener:(name,fn)=>{handlers[name]=fn;}},caches:{open:async()=>({addAll:async()=>{throw failure;}})}});
  let work;handlers.install({waitUntil:promise=>{work=promise;}});
  await assert.rejects(work,/missing asset/);
});
test('worker leaves requests outside its project scope and non-GET traffic alone',()=>{
  const handlers={};
  runInNewContext(readFileSync('apps/web/public/sw.js','utf8'),{URL,self:{registration:{scope:'https://game.test/preview/'},addEventListener:(name,fn)=>{handlers[name]=fn;}}});
  for(const [url,method] of [['https://game.test/stable/','GET'],['https://external.test/preview/','GET'],['https://game.test/preview/','POST']]){
    handlers.fetch({request:{url,method},respondWith:()=>assert.fail('out-of-scope fetch intercepted')});
  }
});
