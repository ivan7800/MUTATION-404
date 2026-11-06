import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dispatch,dispatchWithFeedback,serialize,refreshVisibility,ENEMY_DEFS} from '../dist/core/core/src/game.js';
import {composition} from '../play/js/apps/web/src/ascii-art.js';

for(const kind of Object.keys(ENEMY_DEFS))test(`${kind} resolved attacks emit feedback without changing simulation`,()=>{
  const state=createGame(404);state.zone='zero-1';state.tiles.fill('.');state.fields=[];state.player={x:20,y:20};
  state.enemies=[{id:'test-'+kind,kind,x:21,y:20,hp:ENEMY_DEFS[kind].hp,mode:'idle',searchTurns:0}];
  refreshVisibility(state);
  const plain=structuredClone(state),observed=structuredClone(state);
  const expected=dispatch(plain,{type:'wait'}),actual=dispatchWithFeedback(observed,{type:'wait'});
  assert.deepEqual(actual.result,expected);
  assert.equal(serialize(observed),serialize(plain));
  assert.equal(actual.events.length,1);
  assert.equal(actual.events[0].id,'test-'+kind);
  assert.equal(actual.events[0].action,'attack');
  const rows=composition('enemy:attack:'+ENEMY_DEFS[kind].glyph);
  assert.ok(rows.length>=3);assert.notDeepEqual(rows,composition(ENEMY_DEFS[kind].glyph));
  for(const row of rows)assert.match(row,/^[\x20-\x7e]+$/);
  const invalid=dispatchWithFeedback(observed,{type:'move',dx:9,dy:9});
  assert.equal(invalid.result.accepted,false);assert.deepEqual(invalid.events,[]);
});
test('unseen attacks and stunned turns never expose enemy events',()=>{
  const s=createGame(404);s.zone='zero-1';s.tiles.fill('.');s.fields=[];s.player={x:20,y:20};
  s.enemies=[{id:'hidden',kind:'crawler',x:21,y:20,hp:9,mode:'idle',searchTurns:0}];
  s.visible.fill(0);
  assert.deepEqual(dispatchWithFeedback(s,{type:'wait'}).events,[]);
  s.enemies[0].stunned=2;refreshVisibility(s);
  assert.deepEqual(dispatchWithFeedback(s,{type:'wait'}).events,[]);
});
for(const [kind,tick] of [['sentinel',500],['spore',300],['drone',400],['moth',500]])test(`${kind} special emits its actual ability event`,()=>{
  const s=createGame(404);s.zone='zero-1';s.tiles.fill('.');s.fields=[];s.player={x:20,y:20};s.tick=tick;
  s.enemies=[{id:'special-'+kind,kind,x:22,y:20,hp:ENEMY_DEFS[kind].hp,mode:'idle',searchTurns:0}];
  refreshVisibility(s);
  const plain=structuredClone(s),expected=dispatch(plain,{type:'wait'});
  const actual=dispatchWithFeedback(s,{type:'wait'});
  assert.deepEqual(actual.result,expected);assert.equal(serialize(s),serialize(plain));
  assert.equal(actual.events.length,1);assert.equal(actual.events[0].action,'ability');
});
