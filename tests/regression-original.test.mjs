import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BIOMES, ENEMY_DEFS, LANDMARKS, MUTATIONS, RECIPES, SECTORS, createGame, serialize } from '../dist/core/core/src/game.js';

test('original gameplay catalog remains present after the ASCII presentation upgrade', () => {
  assert.deepEqual(Object.keys(ENEMY_DEFS).sort(), ['crawler','drone','larva','moth','sentinel','spore']);
  assert.equal(Object.keys(BIOMES).length, 6);
  assert.equal(Object.keys(MUTATIONS).length, 9);
  assert.equal(Object.keys(RECIPES).length, 3);
  assert.equal(LANDMARKS.length, 10);
  assert.equal(SECTORS.length, 9);
});

test('original controls remain wired while the visual selector is intentionally unified', () => {
  const main = readFileSync('apps/web/src/main.ts', 'utf8');
  for (const id of ['mutations-btn','pulse-btn','neural-btn','fire-btn-gene','phase-btn','scan-btn','travel-btn','atlas-btn','market-btn','house-btn','down-btn','up-btn','interact-btn','target-btn','attack-btn','fire-btn','pickup-btn','heal-btn','harvest-btn','craft-btn','ecology-btn','inventory-btn','swap-btn','journal-btn','wait-btn']) {
    assert.match(main, new RegExp(`id="${id}"`), `missing control ${id}`);
  }
  for (const key of ["key==='c'", "key==='l'", "key==='n'", "key==='p'", "key==='k'", "key==='o'", "key==='y'", "key==='j'", "key==='u'", "key==='b'", "key==='v'", "key==='m'"]) {
    assert.match(main, new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `missing keyboard action ${key}`);
  }
  assert.doesNotMatch(main, /art-mode-btn|toggleArt|PÍXEL/);
});

test('save serialization still preserves game state while excluding transient view fields', () => {
  const state = createGame(404);
  state.tick = 700;
  state.log.push('regression marker');
  const saved = JSON.parse(serialize(state));
  assert.equal(saved.seed, 404);
  assert.equal(saved.tick, 700);
  assert.ok(saved.log.includes('regression marker'));
  assert.equal('visible' in saved, false);
  assert.equal('dialogue' in saved, false);
});
