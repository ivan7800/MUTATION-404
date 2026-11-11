import { WIDTH, HEIGHT, index, type Tile } from './world.js';
import { SECTORS, coordsForZone, type FrontierId } from './frontier.js';
import type { ZoneMemory } from './depths.js';
import type { ItemId } from './combat.js';
export type InteriorId = `interior-${number}-${number}`;
export interface Citizen {id:string;name:string;glyph:string;color:string;role:'mercader'|'cronista'|'vigia';x:number;y:number;sector:string;}
export interface RegionalTask {id:string;title:string;description:string;sector:string;required:number;reward:number;faction:string;}
export const TASKS:RegionalTask[]=SECTORS.filter(s=>s.x!==0||s.y!==0).map((s,i)=>({id:`task:${s.x}:${s.y}`,title:['La lámpara de guardia','Las actas perdidas','El eco de los caminos','El inventario ausente','Los dientes de la máquina','Un juramento de esporas','El reflejo fiel','La última vigilia'][i],description:`Ayuda a los habitantes de ${s.name} a recuperar materiales para sostener el enclave.`,sector:`sector-${s.x}-${s.y}`,required:2+i%2,reward:13+i*3,faction:s.faction}));
export function interiorForSector(zone:string):InteriorId|null {const pos=coordsForZone(zone);return pos&&zone!=='surface'?`interior-${pos.x}-${pos.y}`:null;}
export function exteriorForInterior(zone:string):FrontierId|null {const m=/^interior-(-?\d+)-(-?\d+)$/.exec(zone);if(!m)return null;const x=Number(m[1]),y=Number(m[2]);return SECTORS.some(s=>s.x===x&&s.y===y&&(x!==0||y!==0))?`sector-${x}-${y}`:null;}
export function settlementCitizens(zone:string,tick:number):Citizen[] {
 const exterior=exteriorForInterior(zone)??zone;
 if(!coordsForZone(exterior)||exterior==='surface')return [];
 const hour=(7+Math.floor(tick/6000))%24;
 const atHome=hour>=20||hour<6;
 const sector=SECTORS.find(s=>`sector-${s.x}-${s.y}`===exterior)!;
 const root=`${sector.x}:${sector.y}`;
 if(exteriorForInterior(zone))return [
  {id:`${root}:mercader`,name:`${sector.name} · intendente`,glyph:'$',color:'#f8d59b',role:'mercader',x:atHome?17:23,y:15,sector:exterior},
  {id:`${root}:cronista`,name:`${sector.name} · cronista`,glyph:'?',color:'#cba7ed',role:'cronista',x:atHome?31:27,y:17,sector:exterior},
  {id:`${root}:vigia`,name:`${sector.name} · vigía`,glyph:'!',color:'#8fdfd1',role:'vigia',x:atHome?36:41,y:14,sector:exterior}
 ];
 return [
  {id:`${root}:mercader`,name:`${sector.name} · intendente`,glyph:'$',color:'#f8d59b',role:'mercader',x:atHome?50:46,y:atHome?35:30,sector:exterior},
  {id:`${root}:cronista`,name:`${sector.name} · cronista`,glyph:'?',color:'#cba7ed',role:'cronista',x:atHome?52:50,y:atHome?35:31,sector:exterior},
  {id:`${root}:vigia`,name:`${sector.name} · vigía`,glyph:'!',color:'#8fdfd1',role:'vigia',x:atHome?44:53,y:atHome?35:30,sector:exterior}
 ];
}
export const GOODS:Partial<Record<ItemId,{buy:number;sell:number}>>={medkit:{buy:14,sell:6},ammo:{buy:3,sell:1},scrap:{buy:7,sell:3},carapace:{buy:10,sell:4},capacitor:{buy:18,sell:9}};
export function priceFor(item:ItemId,side:'buy'|'sell',reputation:number,sector:string):number|null {
 const base=GOODS[item];if(!base)return null;
 const indexOf=SECTORS.findIndex(s=>`sector-${s.x}-${s.y}`===sector);
 if(indexOf<0)return null;
 const scarcity=(indexOf%3)-1;
 if(side==='buy'){
   // A high reputation discount must not create infinite buy/sell credit loops.
   const sellPrice=Math.max(1,base.sell+Math.min(2,Math.floor(Math.max(0,reputation)/6)));
   return Math.max(sellPrice+1,base.buy+scarcity-Math.min(5,Math.floor(Math.max(0,reputation)/3)));
 }
 return Math.max(1,base.sell+Math.min(2,Math.floor(Math.max(0,reputation)/6)));
}
export function generateInterior(seed:number,zone:InteriorId):ZoneMemory {
 if(!exteriorForInterior(zone))throw new Error('Interior desconocido.');
 const tiles=new Array<Tile>(WIDTH*HEIGHT).fill('#');
 const put=(x:number,y:number,t:Tile)=>{if(x>0&&y>0&&x<WIDTH-1&&y<HEIGHT-1)tiles[index(x,y)]=t;};
 for(let y=8;y<=25;y++)for(let x=12;x<=48;x++)put(x,y,'.');
 for(let x=12;x<=48;x++){put(x,8,'#');put(x,25,'#');}
 for(let y=8;y<=25;y++){put(12,y,'#');put(48,y,'#');}
 for(let y=9;y<=24;y++)put(32,y,y===16?'+':'#');
 for(let x=16;x<31;x+=4){put(x,11,'o');put(x,22,'o');}
 put(30,25,'+');put(23,12,'T');put(40,12,'T');put(20,20,'=');put(42,20,'=');
 const decor=(seed+zone.length)%2;put(26,20,decor?'*':'o');
 return {tiles,seen:new Array(WIDTH*HEIGHT).fill(0),enemies:[],ground:[],fields:[],player:{x:30,y:24}};
}
