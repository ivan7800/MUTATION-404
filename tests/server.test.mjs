import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as pause } from 'node:timers/promises';

// Requires a prebuilt play/ directory (npm run build:offline).
test('standalone server serves playable files without npm dependencies', async t => {
  const port=8792;
  const child=spawn(process.execPath,['scripts/server.mjs','--no-open'], {env:{...process.env,PORT:String(port)},stdio:'ignore'});
  t.after(()=>child.kill());
  let response;
  for(let tries=0;tries<30;tries++) {
    try {response=await fetch(`http://127.0.0.1:${port}/`);break;}catch{await pause(60);}
  }
  assert.ok(response,'server did not start');
  assert.equal(response.status,200);
  assert.match(response.headers.get('content-type')||'',/text\/html/);
  const html=await response.text();
  assert.match(html,/mutation/i);
  assert.match(html,/\.\/js\/apps\/web\/src\/main\.js/);
  const js=await fetch(`http://127.0.0.1:${port}/js/apps/web/src/main.js`);
  assert.equal(js.status,200);
  assert.match(js.headers.get('content-type')||'',/javascript/);
  const css=await fetch(`http://127.0.0.1:${port}/style.css`);
  assert.equal(css.status,200);
  assert.match(css.headers.get('content-type')||'',/text\/css/);
  const notFound=await fetch(`http://127.0.0.1:${port}/secret.txt`);
  assert.equal(notFound.status,404);
});
