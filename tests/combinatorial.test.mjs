import test from 'node:test';
import assert from 'node:assert/strict';
import {campaignProgress,CAMPAIGN_SITES} from '../dist/core/core/src/campaign.js';
import {projectedDepth,terrainColor,terrainHeight,terrainComposition,composition} from '../play/js/apps/web/src/ascii-art.js';

test('exhaustive campaign readiness across 262144 bounded milestone combinations',()=>{
  // 8 relics + 8 guardian archives + prologue + heart = 18 independent flags.
  // This checks the gate, not combat, navigation, resource balance or playthroughs.
  let checked=0;
  for(let mask=0;mask<65536;mask++){
    const events=[];
    for(let i=0;i<8;i++){
      const {x,y}=CAMPAIGN_SITES[i];
      if(mask&(1<<i))events.push(`relic:${x}:${y}:2`);
      if(mask&(1<<(i+8)))events.push(`elite-cache:ruin-${x}-${y}-2`);
    }
    for(const prologue of [false,true])for(const heart of [false,true]){
      const p=campaignProgress({events:heart?[...events,'heart']:events,
        quest:{status:prologue?'completed':'active'},zone:'surface'});
      assert.equal(p.ready,mask===65535&&prologue&&heart,`mask=${mask},prologue=${prologue},heart=${heart}`);
      checked++;
    }
  }
  assert.equal(checked,262144);
});

test('all viewport cells and 13 zoom sizes preserve neighbour depth and same-cell layer order',()=>{
  let checked=0;
  for(let zoom=13;zoom<=25;zoom++){
    const w=Math.round(zoom*.83),h=zoom+5;
    for(let x=0;x<47;x++)for(let y=0;y<27;y++){
      const ground=projectedDepth(x,y,w,h,0),actor=projectedDepth(x,y,w,h,1);
      assert.ok(ground<actor);
      assert.ok(actor<projectedDepth(x+1,y,w,h,0));
      assert.ok(actor<projectedDepth(x,y+1,w,h,0));
      assert.ok(projectedDepth(x+1,y,w,h,0)<projectedDepth(x,y+1,w,h,0));
      checked++;
    }
  }
  assert.equal(checked,16497);
});

test('all 648 material/variant/surface/biome combinations retain printable art and valid elevation',()=>{
  const tiles=['#','.',':','~','^','*','+','=','o','T','x',',',';','v','&','%','?','!'];
  const palettes=['#d3b783','#80514b','#47747a','#74608c','#567651','#744363'];
  let checked=0;
  for(const tile of tiles)for(const variant of [0,1,2])for(const surface of [false,true])for(const palette of palettes){
    const rows=composition(terrainComposition(tile,variant));
    assert.ok(rows.length>=2);
    assert.ok(rows.every(row=>/^[\x20-\x7e]+$/.test(row)));
    assert.match(terrainColor(tile,surface,palette),/^#[0-9a-f]{6}$/);
    for(const seed of [0,.5,.999])assert.ok(terrainHeight(tile,seed)>=0&&terrainHeight(tile,seed)<14);
    checked++;
  }
  assert.equal(checked,648);
});
