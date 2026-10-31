import { ACTORS, FIELD_VISUALS, biomeAt, BIOMES, ENEMY_DEFS, HEIGHT, LANDMARKS, weatherAt, WIDTH, settlementCitizens, type GameState, type Tile } from '../../../packages/core/src/game.js';
import { index } from '../../../packages/core/src/world.js';
import { terrainHash } from '../../../packages/core/src/biomes.js';
import { coordsForZone } from '../../../packages/core/src/frontier.js';

const VIEW_W=47, VIEW_H=27;
const COLORS:Record<Tile,string>={
  '#':'#63796e','.':'#9a9580',':':'#d3b783','~':'#63afc3','^':'#c0dbec',
  '*':'#7ca67d','+':'#f3c17a','=':'#b9d4cf','o':'#cba3e9','T':'#ffd085','x':'#f0bc91',
  ',':'#bdb092',';':'#cd8c74','v':'#ceafe9','&':'#a3e0a3','%':'#8ac8d3','?':'#eda4d8','!':'#ff6f86'
};
export class AsciiRenderer {
  private canvas:HTMLCanvasElement;
  private ctx:CanvasRenderingContext2D;
  private fontSize=18;
  private cellW=15;
  private cellH=23;
  private ambience=0;
  private lastState:GameState|null=null;
  private effectUntil=0;
  private effectKind:'attack'|'mutation'|'scan'|'damage'='scan';
  private effectFrame=0;
  private ambientFrame=0;
  private ambientLast=0;
  /** Animated climate redraws are throttled and suspended when the tab is hidden. */
  startAmbience():void{
    if(this.reducedMotion||this.ambientFrame)return;
    const loop=(time:number):void=>{
      this.ambientFrame=0;
      if(document.visibilityState==='hidden'||!this.lastState)return;
      if(time-this.ambientLast>=125){
        this.ambientLast=time;
        const state=this.lastState;
        if(state.fields.length>0||weatherAt(state.seed,state.tick,biomeAt(state.seed,state.player.x,state.player.y))!=='calma')this.draw(state);
      }
      this.ambientFrame=requestAnimationFrame(loop);
    };
    this.ambientFrame=requestAnimationFrame(loop);
  }
  pauseAmbience():void{
    if(this.ambientFrame)cancelAnimationFrame(this.ambientFrame);
    this.ambientFrame=0;
  }
  /** Cosmetic-only bursts: never advance simulation time or consume RNG. */
  effect(state:GameState,kind:'attack'|'mutation'|'scan'|'damage'):void{
    if(this.reducedMotion)return;
    this.lastState=state;this.effectKind=kind;this.effectUntil=performance.now()+300;
    if(this.effectFrame)return;
    const animate=():void=>{
      this.effectFrame=0;
      if(!this.lastState||performance.now()>=this.effectUntil)return;
      this.draw(this.lastState);
      this.effectFrame=requestAnimationFrame(animate);
    };
    this.effectFrame=requestAnimationFrame(animate);
  }
  private reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
  constructor(element:HTMLElement){
    this.canvas=document.createElement('canvas');
    this.canvas.setAttribute('role','img');
    this.canvas.setAttribute('aria-label','Mapa ASCII: @ jugador; s V l enemigos; ! terreno peligroso; ♨ fuego; ϟ electricidad; ¤ esporas; $ botín. Flechas/WASD mover, R sondear.');
    this.canvas.tabIndex=0;
    this.canvas.className='world-canvas';
    const ctx=this.canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('El navegador no admite Canvas 2D.');
    this.ctx=ctx;element.appendChild(this.canvas);this.resize();
  }
  private resize():void{
    const dpr=Math.min(window.devicePixelRatio||1,2);
    this.canvas.width=Math.round(VIEW_W*this.cellW*dpr);this.canvas.height=Math.round(VIEW_H*this.cellH*dpr);
    this.canvas.style.width=`${VIEW_W*this.cellW}px`;this.canvas.style.height=`${VIEW_H*this.cellH}px`;
    this.ctx.setTransform(dpr,0,0,dpr,0,0);this.ctx.textAlign='center';this.ctx.textBaseline='middle';
  }
  zoom(dir:number):void{this.fontSize=Math.max(13,Math.min(25,this.fontSize+dir));this.cellW=Math.round(this.fontSize*.83);this.cellH=this.fontSize+5;this.resize();}
  focus():void{this.canvas.focus();}
  draw(state:GameState):void{
    this.lastState=state;
    const ctx=this.ctx,w=VIEW_W*this.cellW,h=VIEW_H*this.cellH;
    const currentBiome=biomeAt(state.seed,state.player.x,state.player.y);
    ctx.globalAlpha=1;ctx.fillStyle=coordsForZone(state.zone)?BIOMES[currentBiome].shadow:'#080c16';ctx.fillRect(0,0,w,h);
    const ox=Math.max(0,Math.min(WIDTH-VIEW_W,state.player.x-Math.floor(VIEW_W/2)));
    const oy=Math.max(0,Math.min(HEIGHT-VIEW_H,state.player.y-Math.floor(VIEW_H/2)));
    const timeNight=Math.floor(state.tick/6000)%4>=2;
    ctx.font=`${this.fontSize}px "DejaVu Sans Mono","Liberation Mono",monospace`;
    ctx.shadowBlur=0;
    for(let cy=0;cy<VIEW_H;cy++)for(let cx=0;cx<VIEW_W;cx++){
      const x=ox+cx,y=oy+cy,i=index(x,y),tile=state.tiles[i];
      if(!state.seen[i])continue;
      const px=cx*this.cellW+this.cellW/2,py=cy*this.cellH+this.cellH/2;
      const visible=state.visible[i]===1;
      const biome=biomeAt(state.seed,x,y),def=BIOMES[biome];
      ctx.globalAlpha=visible?(timeNight?.62:1):.28;
      ctx.fillStyle=coordsForZone(state.zone)?def.shadow:'#101722';
      ctx.fillRect(cx*this.cellW,cy*this.cellH,this.cellW,this.cellH);
      if(visible){
        const grain=terrainHash(state.seed+801,x,y);
        ctx.globalAlpha=grain>.7?.11:.045;
        ctx.fillStyle=def.palette;
        ctx.fillRect(cx*this.cellW,cy*this.cellH,this.cellW,this.cellH);
      }
      ctx.globalAlpha=visible?1:.28;
      // Material highlights: seeded, deterministic and independent of game state.
      if(visible && tile!=='#' && tile!=='.'){
        const shimmer=terrainHash(state.seed+217,x*13,y*17);
        if(shimmer>.73){
          ctx.globalAlpha=.10;
          ctx.fillStyle=tile==='~'?'#7de7eb':tile==='^'?'#e9edff':def.palette;
          ctx.fillRect(cx*this.cellW+2,cy*this.cellH+2,Math.max(2,this.cellW-5),2);
        }
      }
      ctx.globalAlpha=visible?1:.28;
      if(tile==='!'&&visible){
        ctx.fillStyle=this.ambience%2?'#622738':'#43212a';ctx.fillRect(cx*this.cellW,cy*this.cellH,this.cellW,this.cellH);
      }
      ctx.fillStyle=coordsForZone(state.zone)?(tile==='.'||tile==='*'||tile===','?def.palette:COLORS[tile]):(tile==='#'?'#506070':tile==='.'?'#839aab':COLORS[tile]);
      ctx.fillText(tile,px,py);
      // Lighting never reveals fog-of-war tiles or changes the core simulation.
      if(visible){
        const distance=Math.hypot(x-state.player.x,y-state.player.y);
        const radius=timeNight?7:12;
        const dim=Math.min(timeNight?.64:.30,Math.max(0,(distance-radius*.35)/radius)*(timeNight?.58:.30));
        if(dim>0){ctx.globalAlpha=dim;ctx.fillStyle='#020811';ctx.fillRect(cx*this.cellW,cy*this.cellH,this.cellW,this.cellH);}
        if(tile==='T'||tile==='o'||tile==='?'||tile==='+'||tile==='~'){
          const shimmer=this.reducedMotion?.45:.45+.2*Math.sin(this.ambience*.14+x*.3+y);
          ctx.globalAlpha=(tile==='~'?.12:.25)*shimmer;ctx.fillStyle=tile==='~'?'#8fe8ef':'#e4c89f';
          ctx.fillRect(cx*this.cellW+1,cy*this.cellH-2,this.cellW-2,2);
        }
      }
    }
    ctx.globalAlpha=1;
    for(const field of state.fields){
      if(state.visible[index(field.x,field.y)]!==1)continue;
      const cx=field.x-ox,cy=field.y-oy;
      if(cx<0||cy<0||cx>=VIEW_W||cy>=VIEW_H)continue;
      const def=FIELD_VISUALS[field.kind],px=cx*this.cellW,py=cy*this.cellH;
      ctx.fillStyle=field.kind==='fire'?'#70352b':field.kind==='electric'?'#173e4c':'#244830';
      ctx.globalAlpha=.72;ctx.fillRect(px,py,this.cellW,this.cellH);
      if(!this.reducedMotion){
        const flicker=.18+.13*Math.sin(this.ambience*.8+field.x*2.3+field.y);
        ctx.fillStyle=def.color;ctx.globalAlpha=flicker;
        ctx.fillRect(px+1,py+1,this.cellW-2,this.cellH-2);
      }
      ctx.globalAlpha=1;ctx.fillStyle=def.color;ctx.fillText(def.glyph,px+this.cellW/2,py+this.cellH/2);
    }
    // Naturally occurring materials are visible once their sector has been surveyed.
    for(const node of state.ecology.nodes){
      if(node.zone!==state.zone||node.quantity<=0||state.visible[index(node.x,node.y)]!==1)continue;
      const cx=node.x-ox,cy=node.y-oy;
      if(cx<0||cy<0||cx>=VIEW_W||cy>=VIEW_H)continue;
      const glyph=node.kind==='mineral'?'¤':node.kind==='fiber'?'♣':node.kind==='spores'?'*':'◇';
      ctx.globalAlpha=1;ctx.fillStyle=node.kind==='mineral'?'#e2ba83':node.kind==='crystal'?'#deb9fa':'#8be6b3';
      ctx.fillText(glyph,cx*this.cellW+this.cellW/2,cy*this.cellH+this.cellH/2);
    }
    for(const drop of state.ground){
      if(state.visible[index(drop.x,drop.y)]!==1)continue;
      const cx=drop.x-ox,cy=drop.y-oy;if(cx<0||cy<0||cx>=VIEW_W||cy>=VIEW_H)continue;
      ctx.fillStyle='#f7d991';ctx.fillText('$',cx*this.cellW+this.cellW/2,cy*this.cellH+this.cellH/2);
    }
    for(const npc of [...(state.zone==='surface'?ACTORS:[]),...settlementCitizens(state.zone,state.tick)]){
      if(state.visible[index(npc.x,npc.y)]!==1)continue;
      const cx=npc.x-ox,cy=npc.y-oy;if(cx<0||cy<0||cx>=VIEW_W||cy>=VIEW_H)continue;
      ctx.fillStyle='#0c1b1c';ctx.fillRect(cx*this.cellW,cy*this.cellH,this.cellW,this.cellH);
      ctx.fillStyle=npc.color;ctx.fillText(npc.glyph,cx*this.cellW+this.cellW/2,cy*this.cellH+this.cellH/2);
    }
    for(const enemy of state.enemies){
      if(enemy.hp<=0||state.visible[index(enemy.x,enemy.y)]!==1)continue;
      const cx=enemy.x-ox,cy=enemy.y-oy;if(cx<0||cy<0||cx>=VIEW_W||cy>=VIEW_H)continue;
      const def=ENEMY_DEFS[enemy.kind],px=cx*this.cellW,py=cy*this.cellH;
      ctx.fillStyle=state.targetId===enemy.id?'#6b2f2d':'#261a1b';ctx.fillRect(px,py,this.cellW,this.cellH);
      if(state.targetId===enemy.id){ctx.shadowBlur=11;ctx.shadowColor='#f6b76e';}
      if(state.targetId===enemy.id){ctx.strokeStyle='#ffcb72';ctx.lineWidth=1.5;ctx.strokeRect(px+1,py+1,this.cellW-2,this.cellH-2);}
      ctx.fillStyle=(enemy.stunned??0)>0?'#e3aaf5':def.color;ctx.fillText(def.glyph,px+this.cellW/2,py+this.cellH/2);ctx.shadowBlur=0;
      // Miniature health bar provides threat feedback without a separate modal.
      const health=Math.max(0,Math.min(1,enemy.hp/def.hp));
      if(health<1){ctx.fillStyle='#361c20';ctx.fillRect(px+1,py+this.cellH-3,this.cellW-2,2);ctx.fillStyle=health>.45?'#ddb878':'#ee7373';ctx.fillRect(px+1,py+this.cellH-3,(this.cellW-2)*health,2);}

    }
    const px=(state.player.x-ox)*this.cellW,py=(state.player.y-oy)*this.cellH;
    // Orientation glow emphasizes the errant without making hidden tiles visible.
    const glow=ctx.createRadialGradient(px+this.cellW/2,py+this.cellH/2,2,px+this.cellW/2,py+this.cellH/2,this.cellW*3.5);
    glow.addColorStop(0,'#f8b85a30');glow.addColorStop(1,'#f8b85a00');
    ctx.globalAlpha=1;ctx.fillStyle=glow;ctx.fillRect(px-this.cellW*3,py-this.cellH*2,this.cellW*7,this.cellH*5);
    ctx.shadowColor=state.stats.hp>0?'#ffe29a':'#c78487';ctx.shadowBlur=this.reducedMotion?5:9;
    ctx.fillStyle=state.stats.hp>0?'#4c3825':'#3e1b22';ctx.fillRect(px,py,this.cellW,this.cellH);
    ctx.fillStyle=state.stats.hp>0?'#ffe29a':'#c78487';ctx.fillText('@',px+this.cellW/2,py+this.cellH/2);
    ctx.shadowBlur=0;
    // The unexplored world stays dark; the near-field gets a subtle readable frame.
    ctx.strokeStyle='rgba(175,210,197,.45)';ctx.lineWidth=1;ctx.strokeRect(px+.5,py+.5,this.cellW-1,this.cellH-1);
    // Player-centered navigational crosshair, distinct from terrain and creatures.
    ctx.strokeStyle='rgba(255,219,144,.36)';
    ctx.beginPath();ctx.moveTo(px-5,py+this.cellH/2);ctx.lineTo(px-1,py+this.cellH/2);
    ctx.moveTo(px+this.cellW+1,py+this.cellH/2);ctx.lineTo(px+this.cellW+5,py+this.cellH/2);ctx.stroke();
    const weather=weatherAt(state.seed,state.tick,currentBiome);
    if(weather!=='calma'&&!this.reducedMotion){
      // Screen-space dust/spores/ion sparks are cosmetic, deterministic for a given frame.
      ctx.globalAlpha=.34;
      for(let i=0;i<30;i++){
        const x=Math.floor(terrainHash(state.seed+i,this.ambience+i,31)*w),y=Math.floor(terrainHash(state.seed+i,37,this.ambience+i)*h);
        ctx.fillStyle=weather==='esporas'?'#9fdca7':weather==='estatica'?'#b5f5ec':weather==='distorsion'?'#da8acc':'#d9c49d';
        ctx.fillRect(x,y,weather==='polvo'?3:2,weather==='polvo'?1:2);
      }
    }
    // Short-lived frame-driven feedback never changes simulation rules.
    const remaining=this.effectUntil-performance.now();
    if(remaining>0&&!this.reducedMotion){
      const progress=1-remaining/300;
      const cx=px+this.cellW/2,cy=py+this.cellH/2;
      const tint=this.effectKind==='mutation'?'#bda5ff':this.effectKind==='damage'?'#ff6b74':this.effectKind==='attack'?'#ffcb81':'#8de3dc';
      ctx.beginPath();ctx.arc(cx,cy,7+progress*90,0,Math.PI*2);
      ctx.strokeStyle=tint;ctx.lineWidth=Math.max(.5,2*(1-progress));ctx.globalAlpha=Math.max(0,.8*(1-progress));ctx.stroke();
      for(let i=0;i<10;i++){
        const a=i*Math.PI/5+progress*.9,d=11+progress*48;
        ctx.fillStyle=tint;ctx.fillRect(cx+Math.cos(a)*d,cy+Math.sin(a)*d,2,2);
      }
      ctx.globalAlpha=1;
    }
    ctx.globalAlpha=1;
    const shade=ctx.createRadialGradient(w/2,h/2,h*.18,w/2,h/2,w*.68);
    shade.addColorStop(0,'#00000000');shade.addColorStop(1,'#01090988');
    ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#54796b';ctx.lineWidth=1;ctx.strokeRect(.5,.5,w-1,h-1);
    this.ambience++;
    ctx.shadowBlur=0;ctx.globalAlpha=1;
  }
  renderMinimap(state:GameState,element:HTMLCanvasElement):void{
    const ctx=element.getContext('2d');if(!ctx)return;
    const sx=2,sy=2;element.width=WIDTH*sx;element.height=HEIGHT*sy;
    ctx.fillStyle='#0a1314';ctx.fillRect(0,0,element.width,element.height);
    for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++){
      const i=index(x,y);if(!state.seen[i])continue;
      const biome=biomeAt(state.seed,x,y);
      ctx.fillStyle=state.visible[i]?(state.tiles[i]==='#'?'#49665e':BIOMES[biome].palette):'#25302f';
      ctx.fillRect(x*sx,y*sy,sx,sy);
    }
    for(const p of LANDMARKS)if(state.discoveries.includes(p.id)){ctx.fillStyle=p.id==='faro'?'#e0c184':'#d7a9ed';ctx.fillRect(p.x*sx-1,p.y*sy-1,4,4);}
    for(const enemy of state.enemies)if(enemy.hp>0&&state.visible[index(enemy.x,enemy.y)]){ctx.fillStyle=ENEMY_DEFS[enemy.kind].color;ctx.fillRect(enemy.x*sx,enemy.y*sy,3,3);}
    ctx.fillStyle='#fff1a8';ctx.fillRect(state.player.x*sx-2,state.player.y*sy-2,5,5);
  }
}
