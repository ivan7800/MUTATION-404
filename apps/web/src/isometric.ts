/** One projection contract for terrain, upright sprites, camera and picking. */
export function project(x:number,y:number,w=64,h=32){return {x:(x-y)*w/2,y:(x+y)*h/2};}
export function unproject(x:number,y:number,w=64,h=32){return {x:x/w+y/h,y:y/h-x/w};}
export function depth(x:number,y:number,layer=0){return (x+y)*10000+x*10+layer;}
export function direction(dx:number,dy:number):string{return dx>0?'east':dx<0?'west':dy>0?'south':'north';}
/** All outdoor biomes share the same authored 16-bit pixel grid. */
export function pixelArtScaleForBiome(biome:string):1|3{return ['salinas','ceniza','hierro','vidrio','medula','umbral'].includes(biome)?3:1;}
/** Large wall landmarks are deliberately sparse; most cells stay low debris. */
export function wallVariant(x:number,y:number,variant:number):0|1|2{
 if(variant===4&&(x+y)%4===0)return 1;
 if(variant===5&&(x-y)%7===0)return 2;
 return 0;
}
/** Stable ambient particle cells; rendering never consumes the simulation RNG. */
export function ambientCells(seed:number,cx:number,cy:number,count=14){
 const base=(seed^Math.imul(cx+17,0x9e3779b1)^Math.imul(cy+29,0x85ebca6b))>>>0;
 return Array.from({length:count},(_,i)=>{
  const h=(Math.imul(base^Math.imul(i+1,0x27d4eb2d),0x165667b1)^(base>>>13))>>>0;
  return {x:cx+(h%25)-12,y:cy+((h>>>8)%25)-12,phase:(h>>>16)&255};
 });
}
