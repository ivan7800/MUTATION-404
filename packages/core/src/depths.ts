import { SeededRng } from './rng.js';
import { HEIGHT, WIDTH, index, type Tile } from './world.js';
import { ENEMY_DEFS, type Enemy } from './combat.js';
import type { Field } from './environment.js';
import type { GroundItem } from './combat.js';

import type { FrontierId } from './frontier.js';
import type { InteriorId } from './civilizations.js';
export type RuinId = `ruin-${number}-${number}-${1|2}`;
export type ZoneId = 'surface' | 'zero-1' | 'zero-2' | 'zero-3' | FrontierId | InteriorId | RuinId;
export function parseRuin(id:string):{x:number;y:number;depth:1|2}|null {
 const m=/^ruin-(-?\d+)-(-?\d+)-(1|2)$/.exec(id); if(!m)return null;
 const x=Number(m[1]),y=Number(m[2]);if(Math.abs(x)>1||Math.abs(y)>1||(x===0&&y===0))return null;
 return {x,y,depth:Number(m[3]) as 1|2};
}
export function ruinId(x:number,y:number,depth:1|2):RuinId{return `ruin-${x}-${y}-${depth}`;}
export function ruinName(id:string):string {const r=parseRuin(id);return r?`${themeForRuin(r.x,r.y).name} / Estrato ${r.depth}`:ZONE_NAMES[id]??id;}
/** Eight authored identities layered on deterministic procedural floorplans. */
export const RUIN_THEMES = [
 {name:'Ojo del Silencio',symbol:'?',hazard:'spores',lore:'Las paredes repiten pensamientos que todavía no has tenido.',reward:'Archivo de pensamientos anticipados'},
 {name:'Fundición de Ceniza',symbol:'%',hazard:'fire',lore:'La escoria respira; el horno no tiene combustible.',reward:'Núcleo de la última fragua'},
 {name:'Catedral Refractada',symbol:'v',hazard:'electric',lore:'Los vitrales muestran un cielo imposible bajo la tierra.',reward:'Prisma de los dos amaneceres'},
 {name:'Osario de Motores',symbol:'%',hazard:'electric',lore:'Una cadena de engranajes late como un corazón.',reward:'Memoria ferruginosa'},
 {name:'Mausoleo de Cobre',symbol:'=',hazard:'electric',lore:'Las máquinas han construido lápidas para sus operadores.',reward:'Sello del custodio cero'},
 {name:'Invernadero de la Médula',symbol:'&',hazard:'spores',lore:'Hay raíces dentro de los conductos de ventilación.',reward:'Semilla de la quinta estación'},
 {name:'Archivo del Espejo',symbol:'v',hazard:'spores',lore:'Un espejo registra las fechas en las que desaparecerás.',reward:'Lente de la ausencia'},
 {name:'Santuario de la Última Voz',symbol:'?',hazard:'fire',lore:'La radio reproduce el silencio de una multitud.',reward:'Transmisor sin emisor'}
] as const;
export function themeForRuin(x:number,y:number){
 const positions=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
 const i=positions.findIndex(p=>p[0]===x&&p[1]===y);
 if(i<0)throw new Error('Ruina exterior inexistente.');
 return RUIN_THEMES[i];
}
export function generateRuin(seed:number,x:number,y:number,depth:1|2):ZoneMemory {
 const theme=themeForRuin(x,y);
 const mixed=(seed^Math.imul(x+7,0x9e3779b9)^Math.imul(y+13,0x85ebca6b))>>>0;
 const generated=generateDepth(mixed,depth);
 const rng=new SeededRng(mixed^Math.imul(depth,0x27d4eb2d));
 // Different architectural signatures, preserving the connected base floorplan.
 for(let n=0;n<250;n++){
   const xx=rng.int(4,WIDTH-5), yy=rng.int(4,HEIGHT-5);
   if((xx<24&&yy<20)||generated.tiles[index(xx,yy)]!=='.')continue;
   if((xx+y*3)% (depth===1?7:5)===0 || (yy+x*2)%11===0)
     generated.tiles[index(xx,yy)]=theme.symbol;
 }
 // Place a reachable relic along a guaranteed corridor in both floors.
 for(let xx=10;xx<=20;xx++)generated.tiles[index(xx,12)]=':';
 for(let yy=10;yy<=12;yy++)generated.tiles[index(10,yy)]=':';
 generated.tiles[index(10,10)]='+';
 generated.tiles[index(14,10)]=depth===1?'T':'o';
 generated.tiles[index(20,12)]='o';
 // A second, optional chamber contains one persistent world-changing choice.
 generated.tiles[index(21,12)]=':';
 generated.tiles[index(22,12)]='?';
 // Distinct hazards are persistent per zone, not reset when revisited.
 generated.tiles[index(25,12)]=':';
 generated.fields.push({x:25,y:12,kind:theme.hazard,ttl:35});
 for(let i=0;i<4+depth*2;i++){
   const xx=rng.int(28,WIDTH-8), yy=rng.int(20,HEIGHT-8);
   if(generated.tiles[index(xx,yy)]==='#')continue;
   generated.fields.push({x:xx,y:yy,kind:theme.hazard,ttl:20+i*5});
 }
 // Distinctive connected encounter chamber, one elite per deep regional ruin.
 if(depth===2){
   for(let xx=22;xx<=32;xx++)generated.tiles[index(xx,12)]=':';
   for(let yy=9;yy<=16;yy++)for(let xx=27;xx<=33;xx++)generated.tiles[index(xx,yy)]='.';
   generated.tiles[index(22,12)]='?'; // preserve existing resonance after corridor carving
   generated.tiles[index(26,12)]='o';
   generated.enemies=generated.enemies.filter(e=>!(e.x>=25&&e.x<=34&&e.y>=8&&e.y<=17));
   generated.enemies.push({id:`elite-${x}-${y}-${depth}`,kind:'drone',x:30,y:12,hp:ENEMY_DEFS.drone.hp,mode:'idle',searchTurns:0});
 }
 for(const e of generated.enemies)if(!e.id.startsWith('elite-'))e.id=`ruin-${x}-${y}-${depth}-${e.id}`;
 return generated;
}

export interface ZoneMemory { tiles:Tile[]; seen:number[]; enemies:Enemy[]; ground:GroundItem[]; fields:Field[]; player:{x:number;y:number} }
export const DEPTHS:ZoneId[]=['surface','zero-1','zero-2','zero-3'];
export const ZONE_NAMES:Record<string,string>={surface:'Superficie de Nácar','zero-1':'CERO-7 / Vestíbulo oxidado','zero-2':'CERO-7 / Laboratorio de la carne','zero-3':'CERO-7 / Cámara del eco'};
export function generateDepth(seed:number,depth:1|2|3):ZoneMemory {
  const rng=new SeededRng((seed^((depth*0x9e3779b9)>>>0))>>>0);
  const tiles=new Array<Tile>(WIDTH*HEIGHT).fill('#');
  const put=(x:number,y:number,t:Tile)=>{if(x>0&&y>0&&x<WIDTH-1&&y<HEIGHT-1)tiles[index(x,y)]=t;};
  const rooms:{x:number;y:number;w:number;h:number}[]=[{x:7,y:7,w:12,h:10}];
  for(let n=0;n<14;n++)rooms.push({x:rng.int(3,WIDTH-18),y:rng.int(3,HEIGHT-16),w:rng.int(7,14),h:rng.int(6,12)});
  const center=(r:typeof rooms[number])=>({x:r.x+Math.floor(r.w/2),y:r.y+Math.floor(r.h/2)});
  for(const r of rooms)for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)put(x,y,'.');
  for(let n=1;n<rooms.length;n++){
    const a=center(rooms[n-1]),b=center(rooms[n]);let x=a.x,y=a.y;
    while(x!==b.x){put(x,y,':');x+=Math.sign(b.x-x);}while(y!==b.y){put(x,y,':');y+=Math.sign(b.y-y);}put(x,y,':');
  }
  const spawn={x:10,y:10};
  for(let y=7;y<=14;y++)for(let x=7;x<=17;x++)put(x,y,'.');
  for(let i=0;i<95;i++){
    const r=rooms[rng.int(1,rooms.length-1)],x=rng.int(r.x+1,r.x+r.w-2),y=rng.int(r.y+1,r.y+r.h-2);
    if(x<18&&y<18)continue;
    put(x,y,(depth===1?'%':depth===2?'&':'?') as Tile);
  }
  put(10,10,'+');put(14,10,depth===3?'o':'T');
  const enemies:Enemy[]=[];
  const kinds=(depth===1?['sentinel','drone']:depth===2?['larva','spore']:['drone','larva']) as ('sentinel'|'drone'|'larva'|'spore')[];
  const occupied=new Set<string>(['10,10','14,10']);
  for(let i=0;i<8+depth*2;i++){
    const r=rooms[rng.int(1,rooms.length-1)];const x=rng.int(r.x+1,r.x+r.w-2),y=rng.int(r.y+1,r.y+r.h-2);
    if(Math.abs(x-10)+Math.abs(y-10)<15||tiles[index(x,y)]==='#'||occupied.has(`${x},${y}`))continue;
    occupied.add(`${x},${y}`);const kind=kinds[i%kinds.length];enemies.push({id:`depth-${depth}-${i}`,x,y,kind,hp:ENEMY_DEFS[kind].hp,mode:'idle',searchTurns:0});
  }
  return {tiles,seen:new Array<number>(WIDTH*HEIGHT).fill(0),enemies,ground:[],fields:[],player:spawn};
}
