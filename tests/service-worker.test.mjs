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
test('a new build serves its own offline assets and retires only its previous scoped cache',async()=>{
  const scope='https://game.test/preview/',storage=new Map([
    ['other-app',new Map()],['mutation404:/stable/:old',new Map()]
  ]);
  const caches={
    keys:async()=>[...storage.keys()],
    delete:async key=>storage.delete(key),
    open:async key=>{
      if(!storage.has(key))storage.set(key,new Map());
      const entries=storage.get(key);
      return {
        addAll:async assets=>{for(const asset of assets)entries.set(new URL(asset,scope).href,`${key}:${asset}`);},
        match:async request=>entries.get(new URL(typeof request==='string'?request:request.url,scope).href)
      };
    }
  };
  const script=readFileSync('apps/web/public/sw.js','utf8');
  const run=version=>{
    const handlers={};
    runInNewContext(script.replace('__BUILD_VERSION__',version),{URL,caches,fetch:()=>assert.fail('cached navigation went online'),self:{registration:{scope},clients:{claim:async()=>{}},addEventListener:(name,fn)=>{handlers[name]=fn;}}});
    return handlers;
  };
  const eventFor=handlers=>new Promise((resolve,reject)=>handlers({waitUntil:work=>Promise.resolve(work).then(resolve,reject)}));
  const old=run('v1');
  await eventFor(old.install);
  await eventFor(old.activate);
  const current=run('v2');
  await eventFor(current.install);
  assert.ok(storage.has('mutation404:/preview/:v1'),'old offline build must survive until activation');
  await eventFor(current.activate);
  assert.equal(storage.has('mutation404:/preview/:v1'),false);
  assert.ok(storage.has('mutation404:/preview/:v2'));
  assert.ok(storage.has('mutation404:/stable/:old'));
  assert.ok(storage.has('other-app'));
  const response=await new Promise(resolve=>current.fetch({request:{url:scope+'missing-route',method:'GET',mode:'navigate'},respondWith:resolve}));
  assert.equal(await response,'mutation404:/preview/:v2:./index.html');
});
