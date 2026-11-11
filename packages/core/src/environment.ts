import { terrainHash } from './biomes.js';
import { index, passable, within, type Point, type Tile } from './world.js';
export type FieldKind = 'fire'|'electric'|'spores';
export interface Field extends Point { kind:FieldKind; ttl:number }
export const FIELD_VISUALS:Record<FieldKind,{glyph:string;color:string;label:string}>={
  fire:{glyph:'♨',color:'#ff9869',label:'Llamas vivas'},electric:{glyph:'ϟ',color:'#80e9f2',label:'Arco eléctrico'},spores:{glyph:'¤',color:'#b9eb90',label:'Nube de esporas'}
};
export interface FieldWorld { seed:number;tick:number;tiles:Tile[];fields:Field[];player:Point;stats:{hp:number};exposure:number;enemies:{x:number;y:number;hp:number;stunned?:number;kind?:string}[];genome?:{unlocked:string[]} }
export function placeField(fields:Field[],field:Field):void{
  const existing=fields.find(f=>f.x===field.x&&f.y===field.y&&f.kind===field.kind);
  if(existing){existing.ttl=Math.max(existing.ttl,field.ttl);return;}
  if(fields.length>=96)return;
  fields.push({...field});
}
export function initialFields(seed:number,tiles:readonly Tile[]):Field[]{
  const result:Field[]=[];
  const zones:{x:number;y:number;kind:FieldKind}[]=[{x:76,y:9,kind:'electric'},{x:84,y:34,kind:'electric'},{x:85,y:54,kind:'spores'},{x:72,y:57,kind:'spores'},{x:13,y:51,kind:'fire'},{x:7,y:56,kind:'fire'}];
  for(const zone of zones){
    let found=false;
    for(let radius=0;radius<=5&&!found;radius++){
      let done=false;
      for(let dy=-radius;dy<=radius&&!done;dy++)for(let dx=-radius;dx<=radius&&!done;dx++){
        const x=zone.x+dx,y=zone.y+dy;if(!within(x,y)||!passable(tiles[index(x,y)]))continue;
        if(x>=17&&x<=48&&y>=20&&y<=44)continue;
        if(terrainHash(seed,x,y)>.94)continue;
        placeField(result,{x,y,kind:zone.kind,ttl:20+Math.floor(terrainHash(seed+44,x,y)*35)});done=true;found=true;
      }
      if(done)break;
    }
  }
  return result;
}
/** One simulation quantum: deterministic, caps spreading, no hidden realtime timers. */
export function stepEnvironment(world:FieldWorld, report:(line:string)=>void):void {
  const fresh:Field[]=[];
  const contact=new Set<string>();
  for(const field of world.fields){
    if(field.ttl<=0)continue;
    const key=`${field.x}:${field.y}:${field.kind}`;
    if(field.x===world.player.x&&field.y===world.player.y&&!contact.has(key)){
      contact.add(key);
      if(field.kind==='spores'){
        const plus=world.genome?.unlocked.includes('spore-symbiosis')?1:5;
        world.exposure=Math.min(100,world.exposure+plus);report(`NUBE FÚNGICA // Exposición +${plus}%.`);
      } else {
        const resist=field.kind==='electric'&&world.genome?.unlocked.includes('copper-nerves')?2:0;
        const vulnerability=field.kind==='fire'&&world.genome?.unlocked.includes('copper-nerves')?1:0;
        const damage=Math.max(0,(field.kind==='fire'?3:3)-resist+vulnerability);
        world.stats.hp=Math.max(0,world.stats.hp-damage);
        if(damage)report(`${field.kind==='fire'?'INCENDIO':'DESCARGA'} // -${damage} PV.`);
      }
    }
    for(const enemy of world.enemies){if(enemy.hp>0&&enemy.x===field.x&&enemy.y===field.y){
      if(field.kind==='spores'&&enemy.kind!=='spore'){enemy.stunned=Math.max(enemy.stunned??0,1);}
      else {enemy.hp=Math.max(0,enemy.hp-(field.kind==='fire'?3:2));if(field.kind==='electric')enemy.stunned=Math.max(enemy.stunned??0,1);}
    }}
    if(field.ttl>1)fresh.push({...field,ttl:field.ttl-1});
    if(fresh.length>=96)break;
    const tile=world.tiles[index(field.x,field.y)];
    // Electrical arcs jump through nearby brine; fire crawls across organic matter.
    if(field.ttl>2&&field.kind!=='spores'){
      for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){
        const x=field.x+dx,y=field.y+dy;
        if(!within(x,y)||!passable(world.tiles[index(x,y)]))continue;
        const other=world.tiles[index(x,y)];
        const spread=field.kind==='electric'&&(tile==='~'||other==='~')? .82:
          field.kind==='fire'&&(other==='*'||other==='&')?.55:0;
        if(spread>0&&terrainHash(world.seed+world.tick/100|0,x,y)<spread&&!fresh.some(f=>f.kind===field.kind&&f.x===x&&f.y===y)){
          fresh.push({x,y,kind:field.kind,ttl:field.kind==='fire'?3:2});
        }
        if(fresh.length>=96)break;
      }
    }
  }
  // Oldest first, avoid unbounded cascading fields.
  world.fields=fresh.slice(0,96);
}
export function fieldAt(fields:readonly Field[],x:number,y:number):Field|undefined{return fields.find(f=>f.x===x&&f.y===y);}
