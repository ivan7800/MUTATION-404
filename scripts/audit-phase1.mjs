// Regression checks for the persistence defects found in ASCENSION phase 1.
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
assert.deepEqual(deserialize(serialize(events)).events, events.events);
console.log('PASS P1-01: all 51 events survive relic interaction and reload.');

const legacy = JSON.parse(serialize(createGame(404)));
legacy.version = 10;
legacy.log = Array.from({length:70}, (_, i) => `Mensaje ${i}`);
const migrated = deserialize(JSON.stringify(legacy));
assert.equal(migrated.version, 11);
assert.equal(migrated.log.length, 70);
assert.deepEqual(deserialize(serialize(migrated)).log, migrated.log);
console.log('PASS P1-02: migrated full log remains reloadable.');
