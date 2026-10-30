import {Application, Container, Graphics, Sprite, Texture} from 'pixi.js';
import {ACTORS, FIELD_VISUALS, biomeAt, BIOMES, ENEMY_DEFS, HEIGHT, LANDMARKS, weatherAt, WEATHER, WIDTH, settlementCitizens, type GameState, type Tile} from '../../../packages/core/src/game.js';
import {index} from '../../../packages/core/src/world.js';
import {coordsForZone} from '../../../packages/core/src/frontier.js';
import {terrainHash} from '../../../packages/core/src/biomes.js';
import type {AsciiRenderer} from './renderer.js';

/**
 * Real PixiJS v8 sprite renderer. Tiles are GPU sprites based on a reusable glyph
 * atlas generated from canvas, not one DOM/canvas text draw call per game frame.
 * All simulation, visibility and save data belong to core GameState.
 */
export class PixiAsciiRenderer {
  private readonly app=new Application();
  private readonly view= new Container();
  private readonly backdrop=new Graphics();
  private readonly layers=new Container();
  private readonly sprites:Sprite[]=[];
  private readonly glyphs=new Map<string,Texture>();
  private state:GameState|null=null;
  private cellW=15;
  private cellH=23;
  private fontSize=18;
  private ambientFrame=0;
  private lastAmbient=0;
  private ambience=0;
  private effectUntil=0;
  private effectKind:'attack'|'mutation'|'scan'|'damage'='scan';
  private reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly viewW=47;
  private readonly viewH=27;
  private constructor(private readonly mount:HTMLElement,private readonly old:AsciiRenderer){}

  static async create(mount:HTMLElement,old:AsciiRenderer):Promise<PixiAsciiRenderer>{
    const probe=document.createElement('canvas');
    const gl=probe.getContext('webgl2')||probe.getContext('webgl');
    if(!gl)throw new Error('El navegador no ofrece WebGL; se mantiene Canvas 2D.');
    const result=new PixiAsciiRenderer(mount,old);
    await result.app.init({preference:'webgl',background:0x080c16,antialias:false,width:705,height:621,resolution:Math.min(devicePixelRatio||1,2),autoDensity:true});
    result.app.canvas.className='world-canvas pixi-canvas';
    result.app.canvas.tabIndex=0;
    result.app.canvas.setAttribute('aria-label','Mapa WebGL ASCII interactivo. Flechas/WASD para moverse; E para interactuar; X para atacar.');
    result.app.canvas.dataset.renderer='pixi-webgl';
    result.view.addChild(result.backdrop,result.layers);
    result.app.stage.addChild(result.view);
    result.mount.appendChild(result.app.canvas);
    // Hide, but never destroy, the fallback before the WebGL view is ready.
    const fallback=result.mount.querySelector('canvas:not(.pixi-canvas)');
    if(fallback instanceof HTMLCanvasElement)fallback.style.display='none';
    result.allocateSprites();
    return result;
  }

  private texture(character:string):Texture{
    let texture=this.glyphs.get(character);
    if(texture)return texture;
    const canvas=document.createElement('canvas');canvas.width=40;canvas.height=52;
    const ctx=canvas.getContext('2d');
    if(!ctx)throw new Error('No se pudo crear el atlas de caracteres.');
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 37px monospace';
    ctx.fillStyle='#fff';ctx.fillText(character,20,26);
    texture=Texture.from(canvas);
    this.glyphs.set(character,texture);
    return texture;
  }
  private allocateSprites():void{
    for(let i=0;i<this.viewW*this.viewH+250;i++){
      const sprite=new Sprite(this.texture('.'));
      sprite.anchor.set(.5);sprite.visible=false;this.layers.addChild(sprite);
      this.sprites.push(sprite);
    }
  }
  private drawGlyph(i:number,glyph:string,x:number,y:number,color:number,opacity=1):number{
    if(i>=this.sprites.length)return i;
    const sprite=this.sprites[i];
    sprite.texture=this.texture(glyph);sprite.tint=color;sprite.alpha=opacity;
    sprite.x=x*this.cellW+this.cellW/2;sprite.y=y*this.cellH+this.cellH/2;
    sprite.width=this.cellW;sprite.height=this.cellH;
    sprite.visible=true;
    return i+1;
  }
  private color(hex:string):number{return Number.parseInt(hex.replace('#',''),16);}
  draw(state:GameState):void{
    this.state=state;
    const ox=Math.max(0,Math.min(WIDTH-this.viewW,state.player.x-Math.floor(this.viewW/2)));
    const oy=Math.max(0,Math.min(HEIGHT-this.viewH,state.player.y-Math.floor(this.viewH/2)));
    const night=Math.floor(state.tick/6000)%4>=2;
    this.backdrop.clear();
    this.backdrop.rect(0,0,this.viewW*this.cellW,this.viewH*this.cellH).fill(0x080e17);
    let used=0;
    for(let cy=0;cy<this.viewH;cy++)for(let cx=0;cx<this.viewW;cx++){
      const x=ox+cx,y=oy+cy,at=index(x,y);
      if(!state.seen[at])continue;
      const glyph=state.tiles[at] as Tile;
      const visible=state.visible[at]===1;
      const biome=BIOMES[biomeAt(state.seed,x,y)];
      const dist=Math.hypot(x-state.player.x,y-state.player.y);
      const radius=night?7:12;
      const dim=visible?Math.min(night?.62:.28,Math.max(0,(dist-radius*.35)/radius)*(night?.55:.28)):0;
      const alpha=visible?Math.max(.32,(night?.80:1)-dim):.22;
      const groundColor=visible?(coordsForZone(state.zone)?biome.shadow:'#101722'):'#06090d';
      this.backdrop.rect(cx*this.cellW,cy*this.cellH,this.cellW,this.cellH).fill({color:this.color(groundColor),alpha:visible?1:.55});
      const palette=visible&&coordsForZone(state.zone)&&['.',',','*'].includes(glyph)?biome.palette:
        glyph==='#'?'#697a75':glyph==='T'?'#ffd085':glyph==='o'?'#d5b1f2':glyph==='?'?'#f0a6db':glyph==='!'?'#fd7892':glyph==='~'?'#75d3e3':glyph==='+'?'#f5ce8b':glyph==='&'?'#a3e0a3':glyph==='%'?'#8ac8d3':glyph==='='?'#b9d4cf':'#c5bbaa';
      used=this.drawGlyph(used,glyph,cx,cy,this.color(palette),alpha);
      if(visible&&(glyph==='o'||glyph==='T'||glyph==='?')){
        const shimmer=this.reducedMotion?0.13:0.12+0.06*Math.sin(this.ambience*.3+x);
        this.backdrop.rect(cx*this.cellW+2,cy*this.cellH+2,this.cellW-4,2).fill({color:0xffd8a4,alpha:shimmer});
      }
    }
    for(const field of state.fields){
      if(state.visible[index(field.x,field.y)]!==1)continue;
      const x=field.x-ox,y=field.y-oy;
      if(x<0||y<0||x>=this.viewW||y>=this.viewH)continue;
      const def=FIELD_VISUALS[field.kind],color=this.color(def.color);
      this.backdrop.rect(x*this.cellW,y*this.cellH,this.cellW,this.cellH).fill({color,alpha:this.reducedMotion?.18:.19+.07*Math.sin(this.ambience*.4+x)});
      used=this.drawGlyph(used,def.glyph,x,y,color);
    }
    for(const node of state.ecology.nodes){
      if(node.zone!==state.zone||node.quantity<=0||state.visible[index(node.x,node.y)]!==1)continue;
      const x=node.x-ox,y=node.y-oy;if(x<0||y<0||x>=this.viewW||y>=this.viewH)continue;
      used=this.drawGlyph(used,node.kind==='mineral'?'¤':node.kind==='fiber'?'♣':node.kind==='spores'?'*':'◇',x,y,node.kind==='crystal'?0xd6b5ff:0x9fe9b4);
    }
    for(const item of state.ground){
      if(state.visible[index(item.x,item.y)]!==1)continue;
      const x=item.x-ox,y=item.y-oy;if(x<0||y<0||x>=this.viewW||y>=this.viewH)continue;
      used=this.drawGlyph(used,'$',x,y,0xf6d48d);
    }
    for(const npc of [...(state.zone==='surface'?ACTORS:[]),...settlementCitizens(state.zone,state.tick)]){
      if(state.visible[index(npc.x,npc.y)]!==1)continue;
      const x=npc.x-ox,y=npc.y-oy;if(x<0||y<0||x>=this.viewW||y>=this.viewH)continue;
      used=this.drawGlyph(used,npc.glyph,x,y,this.color(npc.color));
    }
    for(const enemy of state.enemies){
      if(enemy.hp<=0||state.visible[index(enemy.x,enemy.y)]!==1)continue;
      const x=enemy.x-ox,y=enemy.y-oy;if(x<0||y<0||x>=this.viewW||y>=this.viewH)continue;
      const def=ENEMY_DEFS[enemy.kind],elite=enemy.id.startsWith('elite-');
      if(state.targetId===enemy.id||elite)this.backdrop.rect(x*this.cellW,y*this.cellH,this.cellW,this.cellH).stroke({width:1.5,color:elite?0xef92fc:0xffcb72,alpha:.9});
      used=this.drawGlyph(used,elite?'◆':def.glyph,x,y,elite?0xecb9ff:this.color(def.color));
      const health=Math.max(0,Math.min(1,enemy.hp/def.hp));
      if(health<1){this.backdrop.rect(x*this.cellW+1,y*this.cellH-3,this.cellW-2,2).fill(0x492c33);this.backdrop.rect(x*this.cellW+1,y*this.cellH-3,(this.cellW-2)*health,2).fill(health>.45?0xdcbf83:0xee7373);}
    }
    const px=state.player.x-ox,py=state.player.y-oy;
    this.backdrop.rect(px*this.cellW,py*this.cellH,this.cellW,this.cellH).fill(0x644829);
    this.backdrop.rect(px*this.cellW+.5,py*this.cellH+.5,this.cellW-1,this.cellH-1).stroke({color:0xffdd9d,width:1.5});
    used=this.drawGlyph(used,'@',px,py,state.stats.hp>0?0xffe1a0:0xc78487);
    const timeLeft=this.effectUntil-performance.now();
    if(timeLeft>0&&!this.reducedMotion){
      const phase=1-timeLeft/300,color=this.effectKind==='mutation'?0xbda5ff:this.effectKind==='damage'?0xff6b74:this.effectKind==='attack'?0xffcb81:0x8de3dc;
      this.backdrop.circle(px*this.cellW+this.cellW/2,py*this.cellH+this.cellH/2,7+phase*80).stroke({color,width:2,alpha:1-phase});
    }
    for(let i=used;i<this.sprites.length;i++)this.sprites[i].visible=false;
    this.ambience++;
  }
  zoom(dir:number):void{
    this.fontSize=Math.max(13,Math.min(25,this.fontSize+dir));
    this.cellW=Math.round(this.fontSize*.83);this.cellH=this.fontSize+5;
    this.app.renderer.resize(this.viewW*this.cellW,this.viewH*this.cellH);
    if(this.state)this.draw(this.state);
  }
  focus():void{this.app.canvas.focus();}
  effect(state:GameState,kind:'attack'|'mutation'|'scan'|'damage'):void{
    if(this.reducedMotion)return;
    this.effectKind=kind;this.effectUntil=performance.now()+300;
    this.draw(state);
  }
  startAmbience():void{
    if(this.reducedMotion||this.ambientFrame)return;
    const loop=(now:number):void=>{
      this.ambientFrame=0;
      if(document.visibilityState==='hidden'||!this.state)return;
      if(now-this.lastAmbient>=125){
        this.lastAmbient=now;
        const biome=biomeAt(this.state.seed,this.state.player.x,this.state.player.y);
        if(this.state.fields.length>0||weatherAt(this.state.seed,this.state.tick,biome)!=='calma'||this.effectUntil>now)this.draw(this.state);
      }
      this.ambientFrame=requestAnimationFrame(loop);
    };
    this.ambientFrame=requestAnimationFrame(loop);
  }
  pauseAmbience():void{if(this.ambientFrame)cancelAnimationFrame(this.ambientFrame);this.ambientFrame=0;}
  renderMinimap(state:GameState,canvas:HTMLCanvasElement):void{this.old.renderMinimap(state,canvas);}
}
