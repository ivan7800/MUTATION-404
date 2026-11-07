import {Assets,Rectangle,Texture} from 'pixi.js';

export type PixelAsset='hero-idle'|'hero-walk'|'hero-attack'|'hero-hurt'|'hero-death'|'hero-idle-a'|'hero-idle-b'|'hero-walk-a'|'hero-walk-b'|'hero-attack-a'|'hero-attack-b'|'hero-hurt-a'|'hero-death-a'|'crawler'|'sentinel'|'larva'|'moth'|'drone'|'spore'|'floor'|'rock'|'ruin'|'plant'|'tree'|'mutation'|'shadow'|'attack'|'damage'|'mutation-fx'|'floor-salinas'|'floor-ceniza'|'floor-hierro'|'floor-vidrio'|'floor-medula'|'floor-umbral'|'prop-salinas'|'prop-ceniza'|'prop-hierro'|'prop-vidrio'|'prop-medula'|'prop-umbral'|'flora-salinas'|'flora-ceniza'|'flora-hierro'|'flora-vidrio'|'flora-medula'|'flora-umbral'|'crawler-a'|'crawler-b'|'sentinel-a'|'sentinel-b'|'larva-a'|'larva-b'|'moth-a'|'moth-b'|'drone-a'|'drone-b'|'spore-a'|'spore-b'|'elite-drone-a'|'elite-drone-b'|'boss-heart-a'|'boss-heart-b';
const ATLAS_URL='./pixel/atlas.svg';
const CELL=32;
const POS:Record<PixelAsset,[number,number]>={
  'hero-idle':[0,0],'hero-walk':[1,0],'hero-attack':[2,0],'hero-hurt':[3,0],'hero-death':[4,0],
  crawler:[5,0],sentinel:[6,0],larva:[7,0],moth:[2,6],drone:[4,6],spore:[6,6],floor:[0,1],rock:[1,1],ruin:[2,1],plant:[3,1],tree:[4,1],mutation:[5,1],shadow:[6,1],attack:[7,1],damage:[0,2],'mutation-fx':[1,2]
  ,'floor-salinas':[0,4],'floor-ceniza':[1,4],'floor-hierro':[2,4],'floor-vidrio':[3,4],'floor-medula':[4,4],'floor-umbral':[5,4]
  ,'prop-salinas':[6,4],'prop-ceniza':[7,4],'prop-hierro':[8,4],'prop-vidrio':[9,4],'prop-medula':[10,4],'prop-umbral':[11,4]
  ,'crawler-a':[12,4],'crawler-b':[13,4],'sentinel-a':[14,4],'sentinel-b':[15,4]
  ,'larva-a':[0,6],'larva-b':[1,6],'moth-a':[2,6],'moth-b':[3,6],'drone-a':[4,6],'drone-b':[5,6],'spore-a':[6,6],'spore-b':[7,6]
  ,'hero-idle-a':[8,7],'hero-idle-b':[9,7],'hero-walk-a':[10,7],'hero-walk-b':[11,7],'hero-attack-a':[12,7],'hero-attack-b':[13,7],'hero-hurt-a':[14,7],'hero-death-a':[15,7]
  ,'elite-drone-a':[0,8],'elite-drone-b':[1,8],'boss-heart-a':[2,8],'boss-heart-b':[3,8]
  ,'flora-salinas':[0,9],'flora-ceniza':[1,9],'flora-hierro':[2,9],'flora-vidrio':[3,9],'flora-medula':[4,9],'flora-umbral':[5,9]
};
export async function loadPixelAtlas():Promise<Map<PixelAsset,Texture>>{
  const atlas=await Assets.load(ATLAS_URL) as Texture;
  const textures=new Map<PixelAsset,Texture>();
  for(const [name,[cx,cy]] of Object.entries(POS) as [PixelAsset,[number,number]][]){
    textures.set(name,new Texture({source:atlas.source,frame:new Rectangle(cx*CELL,cy*CELL,CELL,CELL)}));
  }
  return textures;
}
