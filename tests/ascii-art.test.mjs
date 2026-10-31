import test from 'node:test';
import assert from 'node:assert/strict';
import {composition} from '../play/js/apps/web/src/ascii-art.js';

test('hero actions retain distinct printable ASCII silhouettes in the shipped renderer data',()=>{
  const idle=composition('@').join('\n');
  for(const action of ['walk','attack','damage','mutation','interact','death']){
    const rows=composition(`hero:${action}`);
    assert.ok(rows.length>=3,`${action} must have a full silhouette`);
    assert.notEqual(rows.join('\n'),idle,`${action} must read differently from idle`);
    for(const row of rows)assert.match(row,/^[\x20-\x7e]+$/,`${action} contains a non-ASCII drawing character`);
  }
  assert.notDeepEqual(composition('hero:attack',0),composition('hero:attack',1));
});
