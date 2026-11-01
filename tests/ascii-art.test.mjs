import test from 'node:test';
import assert from 'node:assert/strict';
import {composition,terrainComposition} from '../play/js/apps/web/src/ascii-art.js';

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
test('all original enemy types and boss have a visible ASCII wound pose',()=>{
  for(const glyph of ['s','V','l','p','D','f','✺','◆']){
    const idle=composition(glyph),hurt=composition(`enemy:hurt:${glyph}`);
    assert.ok(hurt.length>=3,`${glyph} wound pose missing`);
    assert.notDeepEqual(hurt,idle,`${glyph} wound pose must differ from idle`);
    for(const row of hurt)assert.match(row,/^[\x20-\x7e]+$/);
  }
});
test('all original enemy types and boss leave distinct printable ASCII death marks',()=>{
  for(const glyph of ['s','V','l','p','D','f','✺','◆']){
    const rows=composition(`enemy:death:${glyph}`);
    assert.ok(rows.length>=3,`${glyph} death mark missing`);
    assert.notDeepEqual(rows,composition(`enemy:hurt:${glyph}`));
    for(const row of rows)assert.match(row,/^[\x20-\x7e]+$/);
  }
});
test('terrain keeps volumetric compositions for the original tile vocabulary',()=>{
  for(const tile of ['.',';',':',',','^','#','%','=','~','*','&','!']){
    const rows=composition(terrainComposition(tile));
    assert.ok(rows.length>=2,`${tile} terrain should have a visible top and side`);
  }
});
test('terrain variants are deterministic and visibly distinct where variants exist',()=>{
  assert.deepEqual(composition(terrainComposition('.',1)),composition(terrainComposition('.',1)));
  assert.notDeepEqual(composition(terrainComposition('.',0)),composition(terrainComposition('.',1)));
  assert.notDeepEqual(composition(terrainComposition('%',0)),composition(terrainComposition('%',2)));
});
