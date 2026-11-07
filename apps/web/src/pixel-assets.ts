import {Assets,Rectangle,Texture} from 'pixi.js';

export type PixelAsset='hero-idle'|'hero-walk'|'hero-attack'|'hero-hurt'|'hero-death'|'crawler'|'sentinel'|'larva'|'floor'|'rock'|'ruin'|'plant'|'tree'|'mutation'|'shadow'|'attack'|'damage'|'mutation-fx';
const ATLAS_URL='./pixel/atlas.svg';
const CELL=32;
const POS:Record<PixelAsset,[number,number]>={
  'hero-idle':[0,0],'hero-walk':[1,0],'hero-attack':[2,0],'hero-hurt':[3,0],'hero-death':[4,0],
  crawler:[5,0],sentinel:[6,0],larva:[7,0],floor:[0,1],rock:[1,1],ruin:[2,1],plant:[3,1],tree:[4,1],mutation:[5,1],shadow:[6,1],attack:[7,1],damage:[0,2],'mutation-fx':[1,2]
};
export async function loadPixelAtlas():Promise<Map<PixelAsset,Texture>>{
  const atlas=await Assets.load(ATLAS_URL) as Texture;
  const textures=new Map<PixelAsset,Texture>();
  for(const [name,[cx,cy]] of Object.entries(POS) as [PixelAsset,[number,number]][]){
    textures.set(name,new Texture({source:atlas.source,frame:new Rectangle(cx*CELL,cy*CELL,CELL,CELL)}));
  }
  return textures;
}
