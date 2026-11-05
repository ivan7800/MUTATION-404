// Diagnostic reproductions for ASCENSION 3.0 phase 1; not a passing quality gate.
// Run after npm run test:core. Fixtures isolate boundaries, not a played campaign.
import assert from 'node:assert/strict';
import {createGame, dispatch, serialize, deserialize} from '../dist/core/core/src/game.js';

const events = createGame(404);
events.zone = 'ruin--1--1-1';
events.tiles.fill('.');
events.player = {x:20,y:12};
events.enemies = [];
events.fields = [];
events.events = Array.from({length:50}, (_, i) => `incident:sector-1-0:${i+1}`);
assert.doesNotThrow(() => deserialize(serialize(events)), 'fixture must load before interaction');
assert.equal(dispatch(events, {type:'interact'}).accepted, true);
assert.equal(events.events.length, 51);
assert.throws(() => deserialize(serialize(events)), /Estado de regiones o facciones corrupto/);
console.log('REPRODUCED P1-01: accepted relic interaction makes a loadable 50-event save unloadable (51 events).');

const legacy = JSON.parse(serialize(createGame(404)));
legacy.version = 10;
legacy.log = Array.from({length:70}, (_, i) => `Mensaje ${i}`);
const migrated = deserialize(JSON.stringify(legacy));
assert.equal(migrated.version, 11);
assert.equal(migrated.log.length, 71);
assert.throws(() => deserialize(serialize(migrated)), /Bitácora inválida/);
console.log('REPRODUCED P1-02: accepted v10 migration grows log 70 -> 71; immediate save cannot load.');
console.log('These assertions confirm OPEN defects; they do not certify save safety.');
