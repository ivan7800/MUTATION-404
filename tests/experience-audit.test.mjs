import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dispatch,serialize,deserialize} from '../dist/core/core/src/game.js';
import {takeEnemyTurn,nextStep} from '../dist/core/core/src/combat.js';
import {generateRuin} from '../dist/core/core/src/depths.js';
import {index,passable,WIDTH,HEIGHT} from '../dist/core/core/src/world.js';

function arena(zone){
 const s=createGame(808);
 s.zone=zone;s.tiles.fill('.');s.fields=[];s.enemies=[];
 s.player={x:32,y:32};return s;
}

test('surface sanctuary blocks enemy turns, but same coordinates in a ruin do not',()=>{
 const surface=arena('surface'),ruin=arena('ruin-1-0-2');
 const enemy={id:'test-sentinel',kind:'sentinel',x:33,y:32,hp:16,mode:'hunting',searchTurns:0};
 surface.enemies=[{...enemy}];ruin.enemies=[{...enemy}];
 const outdoor=[],underground=[];
 takeEnemyTurn(surface,line=>outdoor.push(line));
 takeEnemyTurn(ruin,line=>underground.push(line));
 assert.equal(outdoor.length,0,'surface sanctuary must remain safe');
 assert.ok(underground.some(line=>line.includes('COMBATE')),'enemy must attack player inside dungeon, even at Faro coordinates');
});

test('underground pathfinding is allowed through map cells that coincide with Faro Ciego',()=>{
 const tiles=Array(WIDTH*HEIGHT).fill('.');
 const start={x:17,y:30},goal={x:21,y:30};
 assert.equal(nextStep(tiles,start,goal,new Set()),undefined,'surface gate must protect Faro');
 assert.deepEqual(nextStep(tiles,start,goal,new Set(),240,new Set(),false),{x:18,y:30});
});

test('safe-zone exposure reduction only occurs on the surface',()=>{
 const surface=arena('surface'),ruin=arena('zero-1');
 for(const s of [surface,ruin]){s.exposure=20;s.environmentalTurns=1;}
 assert.equal(dispatch(surface,{type:'wait'}).accepted,true);
 assert.equal(dispatch(ruin,{type:'wait'}).accepted,true);
 assert.equal(surface.exposure,16,'sanctuary reduces contamination');
 assert.ok(ruin.exposure>=19,'coordinates alone must not activate safe-zone healing');
});

test('save/load keeps underground danger and elite encounters',()=>{
 const ruin=arena('ruin-1-0-2');
 ruin.enemies=[{id:'elite-1-0-2',kind:'drone',x:33,y:32,hp:15,mode:'hunting',searchTurns:0}];
 const loaded=deserialize(serialize(ruin));loaded.tiles.fill('.');loaded.fields=[];
 const logs=[];takeEnemyTurn(loaded,line=>logs.push(line));
 assert.equal(loaded.zone,'ruin-1-0-2');
 assert.ok(logs.length>0,'guardian should react after a saved game is loaded');
});

test('every elite room has a contiguous approach for diverse seeds',()=>{
 const sectors=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
 for(const seed of [1,14,404,808,9999])for(const [sx,sy] of sectors){
   const room=generateRuin(seed,sx,sy,2);
   for(let x=22;x<=30;x++)assert.ok(passable(room.tiles[index(x,12)]),`blocked corridor at seed ${seed} ruin ${sx},${sy} x=${x}`);
   assert.equal(room.enemies.filter(e=>e.id.startsWith('elite-')&&e.hp>0).length,1);
 }
});
