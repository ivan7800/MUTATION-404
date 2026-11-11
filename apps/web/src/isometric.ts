/** One projection contract for terrain, upright sprites, camera and picking. */
export function project(x:number,y:number,w=64,h=32){return {x:(x-y)*w/2,y:(x+y)*h/2};}
export function unproject(x:number,y:number,w=64,h=32){return {x:x/w+y/h,y:y/h-x/w};}
export function depth(x:number,y:number,layer=0){return (x+y)*10000+x*10+layer;}
export function direction(dx:number,dy:number):string{return dx>0?'east':dx<0?'west':dy>0?'south':'north';}
/** Large wall landmarks are deliberately sparse; most cells stay low debris. */
export function wallVariant(x:number,y:number,variant:number):0|1|2{
 if(variant===4&&(x+y)%4===0)return 1;
 if(variant===5&&(x-y)%7===0)return 2;
 return 0;
}
