import test from 'node:test';
import assert from 'node:assert/strict';
import {AsciiRenderer} from '../play/js/apps/web/src/renderer.js';
import {terrainColor,terrainHeight,projectedDepth,composition} from '../play/js/apps/web/src/ascii-art.js';

test('depth follows projected feet and gives actors precedence on the same cell',()=>{
  assert.ok(projectedDepth(1,0,15,23)<projectedDepth(0,1,15,23));
  assert.ok(projectedDepth(2,0,15,23)>projectedDepth(0,1,15,23));
  assert.ok(projectedDepth(1,1,15,23,0)<projectedDepth(1,1,15,23,1));
  assert.ok(projectedDepth(1,0,21,30)<projectedDepth(0,1,21,30));
});
import {createGame,ACTORS,ENEMY_DEFS,serialize} from '../dist/core/core/src/game.js';
import {terrainHash} from '../dist/core/core/src/biomes.js';

test('shared materials distinguish surface biome palettes and interiors',()=>{
  for(const tile of ['.','*',','])assert.equal(terrainColor(tile,true,'#abcdef'),'#abcdef');
  assert.equal(terrainColor('.',false,'#abcdef'),'#839aab');
  assert.equal(terrainColor('#',false,'#abcdef'),'#506070');
  assert.equal(terrainColor('~',true,'#abcdef'),terrainColor('~',false,'#123456'));
});

test('Canvas draw restores actor opacity, lifts walls and scales boss health',t=>{
  const previous=globalThis.window;
  globalThis.window={devicePixelRatio:1};
  t.after(()=>{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;});
  const glyphs=[],rects=[],stack=[];
  const ctx=new Proxy({globalAlpha:1,fillStyle:'',
    save(){stack.push({globalAlpha:this.globalAlpha,fillStyle:this.fillStyle});},
    restore(){Object.assign(this,stack.pop());},
    fillRect(x,y,w,h){rects.push({x,y,w,h,color:this.fillStyle,alpha:this.globalAlpha});},
    createRadialGradient(){return {addColorStop(){}};}
  },{get(target,key){return key in target?target[key]:()=>{};}});
  const renderer=Object.create(AsciiRenderer.prototype);
  Object.assign(renderer,{ctx,fontSize:18,cellW:15,cellH:23,ambience:0,reducedMotion:true,
    enemyHits:new Map(),enemyActions:new Map(),enemyDeaths:[],effectUntil:0,heroUntil:0});
  renderer.glyph=(glyph,x,y)=>glyphs.push({glyph,x,y,alpha:ctx.globalAlpha});
  const state=createGame(404);
  state.tiles.fill('.');state.visible.fill(1);state.seen.fill(1);state.fields=[];state.ground=[];
  state.enemies=[{id:'campaign-heart-custodian',kind:'drone',x:33,y:32,hp:ENEMY_DEFS.drone.hp*1.5,mode:'idle',searchTurns:0}];
  state.tiles[32*96+34]='#';
  const before=serialize(state);
  renderer.draw(state);
  assert.equal(serialize(state),before,'drawing must not mutate the logical state');
  assert.equal(glyphs.find(g=>g.glyph==='✺').alpha,1);
  const npc=ACTORS.find(n=>glyphs.some(g=>g.glyph===`npc:${n.glyph}`));
  assert.ok(npc,'test must draw a real NPC');
  assert.equal(glyphs.find(g=>g.glyph===`npc:${npc.glyph}`).alpha,1);
  const wall=glyphs.find(g=>g.glyph==='#');
  assert.ok(wall);
  assert.equal(wall.y,13*23+23/2-terrainHeight('#',terrainHash(523,34,32)));
  const health=rects.find(r=>r.color==='#ddb878'&&r.h===2);
  assert.ok(health,'boss at half health must show its bar');
  assert.equal(health.w,(15-2)*.5);
  state.visible.fill(0);glyphs.length=0;
  renderer.draw(state);
  assert.equal(glyphs.some(g=>g.glyph==='✺'||g.glyph.startsWith('npc:')),false,'hidden actors must not be drawn');
  // Exercise the actual deferred painter, not the glyph spy above.
  delete renderer.glyph;
  const text=[];
  ctx.getTransform=()=>({a:1,b:0,c:0,d:1,e:0,f:0});
  ctx.fillText=row=>text.push(row);
  state.tiles.fill('.');state.seen.fill(0);state.visible.fill(0);
  state.seen[32*96+32]=1;state.visible[32*96+32]=1;
  const heroRow=composition('@')[0],wallRow=composition('#')[0];
  for(const [wallX,front] of [[33,true],[31,false]]){
    state.seen.fill(0);state.seen[32*96+32]=1;state.seen[32*96+wallX]=1;
    state.tiles.fill('.');state.tiles[32*96+wallX]='#';text.length=0;
    renderer.draw(state);
    assert.ok(text.includes(heroRow)&&text.includes(wallRow));
    assert.equal(text.indexOf(wallRow)>text.indexOf(heroRow),front,'wall/actor order must follow feet, not category');
  }
});
