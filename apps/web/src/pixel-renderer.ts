import {ACTORS,ENEMY_DEFS,biomeAt,BIOMES,HEIGHT,WIDTH,settlementCitizens,type GameState} from '../../../packages/core/src/game.js';
import {index} from '../../../packages/core/src/world.js';
import {terrainHash} from '../../../packages/core/src/biomes.js';
import type {AsciiRenderer} from './renderer.js';
import type {HeroAction} from './ascii-art.js';
import {parseRuin,themeForRuin} from '../../../packages/core/src/depths.js';
import {coordsForZone} from '../../../packages/core/src/frontier.js';
import {project,unproject,depth,direction} from './isometric.js';
type Asset={rect:[number,number,number,number];pivot:[number,number]};
type Entry={asset:string;x:number;y:number;alpha:number;order:number;id?:string};
type Cue={x:number;y:number;kind:string;until:number};
/** Canvas painter is shared verbatim by the WebGL presenter and Canvas fallback. */
export class PixelRenderer{
 readonly mode='pixel' as const;
 private canvas=document.createElement('canvas');
 private floor=document.createElement('canvas');
 private ctx:CanvasRenderingContext2D;
 private floorCtx:CanvasRenderingContext2D;
 private state:GameState|null=null;
 private entries:Entry[]=[];
 private scale=1.15;private origin={x:0,y:0};
 private reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 private raf=0;private running=false;private lastFrame=0;
 private heroAction:HeroAction|null=null;private heroUntil=0;
 private cues:Cue[]=[];private enemyActions=new Map<string,number>();private hits=new Map<string,number>();
 private frames=0;private builds=0;private totalMs=0;private lastMs=0;
 private present:(()=>void)|null=null;private dispose:(()=>void)|null=null;
 private backend='canvas2d';
 private constructor(private mount:HTMLElement,private old:AsciiRenderer,private atlas:HTMLImageElement,private assets:Record<string,Asset>){
  this.canvas.width=this.floor.width=1175;this.canvas.height=this.floor.height=560;
  this.ctx=this.canvas.getContext('2d')!;this.floorCtx=this.floor.getContext('2d')!;
 }
 static async create(mount:HTMLElement,old:AsciiRenderer):Promise<PixelRenderer>{
  const image=new Image();image.src='./isometric/nacar.png';
  const [assets]=await Promise.all([fetch('./isometric/nacar.json').then(r=>{if(!r.ok)throw new Error('Atlas metadata unavailable');return r.json() as Promise<Record<string,Asset>>;}),image.decode()]);
  const r=new PixelRenderer(mount,old,image,assets);
  // Canvas remains the rendering source, so lack of GPU never changes the artwork.
  try{
   const {Application,Texture,Sprite,CanvasSource}=await import('pixi.js');
   const probe=document.createElement('canvas');const gl=probe.getContext('webgl2')??probe.getContext('webgl');
   if(!gl)throw new Error('WebGL unavailable');gl.getExtension('WEBGL_lose_context')?.loseContext();
   const app=new Application();await app.init({preference:'webgl',width:1175,height:560,antialias:false,background:0x10151b});
   const texture=new Texture({source:new CanvasSource({resource:r.canvas})});texture.source.scaleMode='nearest';app.stage.addChild(new Sprite(texture));
   r.present=()=>{texture.source.update();};r.dispose=()=>app.destroy(true,{children:true,texture:true});
   app.canvas.className='world-canvas pixel-canvas';app.canvas.tabIndex=0;app.canvas.setAttribute('aria-label','Mapa isométrico de Nácar. WASD para moverse.');
   mount.append(app.canvas);r.backend='pixi-webgl';
  }catch(error){console.warn('Isometric WebGL presenter unavailable:',error);r.canvas.className='world-canvas pixel-canvas';r.canvas.tabIndex=0;r.canvas.setAttribute('aria-label','Mapa isométrico de Nácar. WASD para moverse.');mount.append(r.canvas);}
  mount.dataset.renderer=r.backend;
  const active=mount.querySelector<HTMLCanvasElement>('.pixel-canvas')!;
  active.addEventListener('pointermove',event=>{
   if(!r.state)return;const rect=active.getBoundingClientRect();
   const fit=Math.min(rect.width/1175,rect.height/560);
   const px=(event.clientX-rect.left-(rect.width-1175*fit)/2)/fit;
   const py=(event.clientY-rect.top-(rect.height-560*fit)/2)/fit;
   const p=unproject((px-r.origin.x)/r.scale,(py-r.origin.y)/r.scale);
   const x=Math.round(p.x),y=Math.round(p.y);
   const valid=x>=0&&y>=0&&x<WIDTH&&y<HEIGHT&&r.state.visible[index(x,y)]===1;
   active.title=valid?`Casilla ${x}, ${y} · ${BIOMES[biomeAt(r.state.seed,x,y)].name}`:'Territorio desconocido';
  });
  if(new URLSearchParams(location.search).has('profile'))Object.defineProperty(window,'__mutation404RenderProfile',{configurable:true,get:()=>r.profile});
  return r;
 }
 get profile(){return {backend:this.backend,builds:this.builds,frames:this.frames,meanBuildMs:this.builds?this.totalMs/this.builds:0,lastBuildMs:this.lastMs,floorDraws:this.builds,cachedCells:this.entries.length,textures:Object.keys(this.assets).length,allocatedSprites:this.entries.length,activeSprites:this.entries.length,peakActiveSprites:this.entries.length};}
 private paint(ctx:CanvasRenderingContext2D,name:string,x:number,y:number,alpha=1){
  const a=this.assets[name];if(!a)return;
  const p=project(x,y);ctx.globalAlpha=alpha;ctx.drawImage(this.atlas,...a.rect,Math.round(p.x-a.pivot[0]),Math.round(p.y-a.pivot[1]),a.rect[2],a.rect[3]);ctx.globalAlpha=1;
 }
 private camera(ctx:CanvasRenderingContext2D){ctx.setTransform(this.scale,0,0,this.scale,this.origin.x,this.origin.y);ctx.imageSmoothingEnabled=false;}
 private biome(s:GameState,x:number,y:number){
  if(s.zone==='surface'||coordsForZone(s.zone))return biomeAt(s.seed,x,y);
  const ruin=parseRuin(s.zone);
  if(ruin){const symbol=themeForRuin(ruin.x,ruin.y).symbol;return symbol==='v'?'vidrio':symbol==='&'?'medula':symbol==='?'?'umbral':'hierro';}
  return s.zone==='zero-3'?'umbral':'hierro';
 }
 draw(state:GameState):void{
  const began=performance.now();this.state=state;this.entries=[];
  const center=project(state.player.x,state.player.y);this.origin={x:1175/2-center.x*this.scale,y:315-center.y*this.scale};
  const ctx=this.floorCtx;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#10151b';ctx.fillRect(0,0,1175,560);this.camera(ctx);
  for(let y=Math.max(0,state.player.y-18);y<Math.min(HEIGHT,state.player.y+19);y++)for(let x=Math.max(0,state.player.x-18);x<Math.min(WIDTH,state.player.x+19);x++){
   const at=index(x,y);if(!state.seen[at])continue;
   const p=project(x,y);if(Math.abs((p.x-center.x)*this.scale)>700||Math.abs((p.y-center.y)*this.scale)>540)continue;
   const v=Math.floor(terrainHash(state.seed+917,x,y)*6),b=this.biome(state,x,y),tile=state.tiles[at];
   const alpha=state.visible[at]===1?1:.24;
   this.paint(ctx,`floor-${b}-${v}`,x,y,alpha);
   let prop:string|null=null;
   if(tile==='#')prop=`wall-${b}-${v%3}`;
   else if(tile==='^'||tile==='%')prop=`rock-${b}-${v%3}`;
   else if(['*','&',';',',','v','?'].includes(tile)&&v<3)prop=`flora-${b}-${v%3}`;
   else if(tile==='~')prop='water';else if(tile==='+')prop='door';else if(tile==='o')prop='down';else if(tile==='x')prop='up';else if(tile==='T'||tile==='=')prop='terminal';else if(tile==='!')prop=`rock-${b}-2`;
   if(prop)this.entries.push({asset:prop,x,y,alpha,order:depth(x,y)});
  }
  const add=(asset:string,x:number,y:number,id?:string)=>{if(x>=0&&y>=0&&x<WIDTH&&y<HEIGHT&&state.visible[index(x,y)]===1)this.entries.push({asset,x,y,alpha:1,order:depth(x,y,2),id});};
  for(const item of state.ground)add('item' in item&&item.item==='medkit'?'heal':'loot',item.x,item.y);
  for(const node of state.ecology.nodes)if(node.zone===state.zone&&node.quantity>0)add('resource',node.x,node.y);
  for(const npc of [...(state.zone==='surface'?ACTORS:[]),...settlementCitizens(state.zone,state.tick)]){
   const id=String(npc.id)+' '+npc.role;
   const kind=/mara/i.test(id)?'mara':/iria/i.test(id)?'iria':/ferral|tamo|oren/i.test(id)?'ferral':/mercader|merchant|sira|kala/i.test(id)?'merchant':/guard|keral|keth/i.test(id)?'guard':'citizen';
   add('npc-'+kind,npc.x,npc.y);
  }
  for(const e of state.enemies)if(e.hp>0)add(e.id.includes('heart')||e.id.includes('final-guardian')?'boss':e.id.includes('elite')||e.id.includes('resonance-guardian')?'elite':e.kind,e.x,e.y,e.id);
  add('hero',state.player.x,state.player.y,'hero');
  this.entries.sort((a,b)=>a.order-b.order);
  this.builds++;this.lastMs=performance.now()-began;this.totalMs+=this.lastMs;this.render(performance.now());
 }
 private render(now:number){
  if(!this.state)return;const ctx=this.ctx,state=this.state;this.frames++;
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.drawImage(this.floor,0,0);this.camera(ctx);
  const phase=this.reducedMotion?0:Math.floor(now/180)%4;
  for(const e of this.entries){
   let asset=e.asset;const p=project(e.x,e.y),hero=project(state.player.x,state.player.y);
   if(e.id){ctx.fillStyle='#060c16';ctx.globalAlpha=.6;ctx.beginPath();ctx.ellipse(p.x,p.y+1,15,6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
   if(asset==='hero'){
    const pose=state.stats.hp<=0?'death':!this.reducedMotion&&this.heroUntil>now?this.heroAction==='walk'?'walk':this.heroAction==='attack'?'attack':this.heroAction==='damage'?'hurt':'idle':'idle';
    const f=pose==='walk'||pose==='attack'?phase:pose==='idle'?phase%2:0;
    asset=`hero-${direction(state.genome.facing.dx,state.genome.facing.dy)}-${pose}-${f}`;
   }else if(e.id)asset=`${e.asset}-${(this.hits.get(e.id)??0)>now?'hurt':(this.enemyActions.get(e.id)??0)>now?'attack':'idle'}-${phase%2}`;
   // Tall foreground structures become transparent only when actually overlapping the hero.
   const alpha=e.asset.startsWith('wall-')&&e.order>depth(state.player.x,state.player.y)&&Math.abs(p.x-hero.x)<63&&p.y-hero.y<115?e.alpha*.35:e.alpha;
   this.paint(ctx,asset,e.x,e.y,alpha);
   if(e.id&&e.id!=='hero'&&e.id===state.targetId){ctx.strokeStyle='#d5aa65';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,24,10,0,0,Math.PI*2);ctx.stroke();const enemy=state.enemies.find(n=>n.id===e.id);ctx.fillStyle='#c65362';ctx.fillRect(p.x-17,p.y-57,34*Math.min(1,(enemy?.hp??0)/(enemy?ENEMY_DEFS[enemy.kind].hp*(e.asset==='boss'?3:1):1)),3);}
  }
  for(const field of state.fields)if(state.visible[index(field.x,field.y)]===1){const p=project(field.x,field.y);ctx.strokeStyle=field.kind==='fire'?'#e69a5c':field.kind==='electric'?'#58cabf':'#ac8ebc';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(p.x,p.y,24,10,0,0,Math.PI*2);ctx.stroke();}
  for(const cue of this.cues)if(cue.until>now&&!this.reducedMotion){
   const p=project(cue.x,cue.y),t=this.reducedMotion ? .35 :1-(cue.until-now)/650;
   ctx.globalAlpha=1-t;ctx.strokeStyle=cue.kind==='damage'?'#e56b75':cue.kind==='pyrokinesis'?'#f2aa67':cue.kind==='neural-shock'?'#b69bdd':'#83f3e2';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=3;
   if(cue.kind==='pyrokinesis')for(let i=0;i<5;i++){const x=p.x-15+i*8;ctx.beginPath();ctx.moveTo(x-4,p.y);ctx.lineTo(x+3,p.y-24-22*t);ctx.lineTo(x+8,p.y);ctx.fill();}
   else if(cue.kind==='damage'||cue.kind==='attack'){for(let i=0;i<5;i++){const a=i*1.26;ctx.fillRect(p.x+Math.cos(a)*(9+22*t),p.y-20+Math.sin(a)*20*t,3,6);}}
   else if(cue.kind==='phase-step'){ctx.strokeRect(p.x-12-20*t,p.y-52,24,48);ctx.strokeRect(p.x+6+20*t,p.y-48,24,48);}
   else if(cue.kind==='neural-shock'){for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(p.x,p.y-30,10+28*t+i*8,0,Math.PI*2);ctx.stroke();}}
   else if(cue.kind==='kinetic-pulse'){ctx.beginPath();ctx.moveTo(p.x-24,p.y-20);ctx.lineTo(p.x,p.y-42-18*t);ctx.lineTo(p.x+24,p.y-20);ctx.lineTo(p.x,p.y);ctx.closePath();ctx.stroke();}
   else{ctx.beginPath();ctx.ellipse(p.x,p.y-8,12+65*t,6+32*t,0,0,Math.PI*2);ctx.stroke();}
   ctx.globalAlpha=1;
  }
  this.cues=this.cues.filter(c=>c.until>now);ctx.setTransform(1,0,0,1,0,0);this.present?.();
 }
 renderMinimap(s:GameState,c:HTMLCanvasElement){this.old.renderMinimap(s,c);}
 focus(){this.mount.querySelector<HTMLCanvasElement>('.pixel-canvas')?.focus({preventScroll:true});}
 zoom(dir:number){this.scale=Math.max(.65,Math.min(1.6,this.scale+dir*.05));if(this.state)this.draw(this.state);}
 setReducedMotion(value:boolean){this.reducedMotion=value;if(this.state)this.render(performance.now());}
 startAmbience(){if(this.running)return;this.running=true;const loop=(now:number)=>{if(!this.running)return;if(now-this.lastFrame>100&&!this.reducedMotion){this.lastFrame=now;this.render(now);}this.raf=requestAnimationFrame(loop);};this.raf=requestAnimationFrame(loop);}
 pauseAmbience(){this.running=false;cancelAnimationFrame(this.raf);}
 destroy(){this.pauseAmbience();this.dispose?.();this.canvas.remove();}
 heroFeedback(s:GameState,a:HeroAction){this.heroAction=a;this.heroUntil=performance.now()+650;this.draw(s);}
 enemyFeedback(s:GameState,events:readonly import('../../../packages/core/src/game.js').EnemyVisualAction[]=[]){for(const e of events)if(e.zone===s.zone&&s.visible[index(e.x,e.y)]===1)this.enemyActions.set(e.id,performance.now()+650);}
 combatFeedback(previous:ReadonlyMap<string,{hp:number;x:number;y:number;zone:string;glyph:string}>,s:GameState){for(const e of s.enemies)if(e.hp<(previous.get(e.id)?.hp??e.hp)){this.hits.set(e.id,performance.now()+600);this.cues.push({x:e.x,y:e.y,kind:'damage',until:performance.now()+650});}}
 environmentFeedback(_previous:unknown,_s:GameState){void _previous;void _s;}
 bossFeedback(s:GameState,_event?:unknown){void _event;this.effect(s,'mutation');}
 mutationFeedback(s:GameState,mutation?:string){const e=s.enemies.find(e=>e.id===s.targetId&&s.visible[index(e.x,e.y)]===1);this.cues.push({x:e?.x??s.player.x,y:e?.y??s.player.y,kind:mutation??'mutation',until:performance.now()+650});}
 effect(s:GameState,kind:'attack'|'mutation'|'scan'|'damage'){const target=kind==='attack'?s.enemies.find(e=>e.id===s.targetId&&s.visible[index(e.x,e.y)]===1):null;this.cues.push({x:target?.x??s.player.x,y:target?.y??s.player.y,kind,until:performance.now()+650});}
}
