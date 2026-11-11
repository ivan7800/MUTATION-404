import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,dispatch,serialize,deserialize} from '../dist/core/core/src/game.js';
import {generateRuin} from '../dist/core/core/src/depths.js';
import {index,passable} from '../dist/core/core/src/world.js';

const coords=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
function inRuin(x=1,y=0){
 const s=createGame(404),z=generateRuin(s.seed,x,y,2);
 s.zone=`ruin-${x}-${y}-2`;
 s.tiles=z.tiles;s.seen=z.seen;s.fields=z.fields;s.ground=z.ground;s.enemies=[];
 s.player={x:22,y:12};
 return s;
}
test('every deep ruin has an accessible resonance chamber',()=>{
 for(const [x,y] of coords){
   const z=generateRuin(404,x,y,2);
   assert.equal(z.tiles[index(22,12)],'?');
   for(let cx=20;cx<=22;cx++)assert.ok(passable(z.tiles[index(cx,12)]));
 }
});
test('absorbing resonance grants exactly one gene and persists',()=>{
 const s=inRuin(),before=s.genome.genePoints;
 assert.equal(dispatch(s,{type:'interact'}).accepted,true);
 assert.ok(s.dialogue?.options.some(o=>o.id==='resonance-harvest'));
 assert.equal(dispatch(s,{type:'choose',option:'resonance-harvest'}).accepted,true);
 assert.equal(s.genome.genePoints,before+1);
 assert.ok(s.events.includes('resonance:ruin-1-0-2'));
 const saved=deserialize(serialize(s));
 assert.ok(saved.events.includes('resonance:ruin-1-0-2'));
 assert.equal(dispatch(s,{type:'interact'}).accepted,true);
 assert.equal(s.genome.genePoints,before+1);
});
test('stabilizing resonance uses capacitor and reduces exposure',()=>{
 const s=inRuin();s.exposure=37;s.inventory.push({id:'capacitor',count:1});
 const before=s.genome.genePoints;
 dispatch(s,{type:'interact'});
 assert.equal(dispatch(s,{type:'choose',option:'resonance-stabilize'}).accepted,true);
 assert.equal(s.genome.genePoints,before);
 assert.ok(s.exposure<37);
 assert.ok(s.events.includes('resonance:ruin-1-0-2'));
});
test('pyrokinesis turns spores into a combustible flash',()=>{
 const s=createGame(404);s.tiles.fill('.');s.fields=[];s.enemies=[];s.player={x:52,y:30};
 s.stats.focus=100;s.stats.maxFocus=100;s.genome.unlocked.push('pyrokinesis');
 const target={id:'flash-target',kind:'sentinel',x:54,y:30,hp:16,mode:'idle',searchTurns:0};
 s.enemies.push(target);s.visible[index(54,30)]=1;
 s.fields.push({x:54,y:30,kind:'spores',ttl:5});
 const out=dispatch(s,{type:'cast',mutation:'pyrokinesis'});
 assert.equal(out.accepted,true);
 assert.ok(!s.fields.some(f=>f.kind==='spores'&&f.x===54&&f.y===30));
 assert.ok(s.log.some(line=>line.includes('Ignición de esporas')));
 assert.ok(target.hp<13);
});
