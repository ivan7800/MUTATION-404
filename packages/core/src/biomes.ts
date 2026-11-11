/** Biome simulation: deterministic, renderer-independent and safe for migrated games. */
export type BiomeId = 'salinas'|'ceniza'|'hierro'|'vidrio'|'medula'|'umbral';
export type WeatherId = 'calma'|'polvo'|'estatica'|'esporas'|'distorsion';
export interface BiomeDef {
  name:string; subtitle:string; description:string; palette:string; shadow:string;
  sign:string; sound:string; lore:string; threat:string;
}
export const BIOMES:Record<BiomeId,BiomeDef>={
  salinas:{name:'Salinas de Vértice',subtitle:'EL DESIERTO QUE ESCUCHA',description:'La sal blanquea el suelo. Cada pisada devuelve un eco demasiado lento.',palette:'#c2af83',shadow:'#1c2421',sign:'.',sound:'Un crujido bajo la costra mineral.',lore:'En la sal aparecen huellas que terminan antes de empezar. Los archivos las llaman «marchas de retorno».',threat:'Las tormentas de polvo reducen la visibilidad.'},
  ceniza:{name:'Páramos de Ceniza',subtitle:'CIELO DE ÓXIDO',description:'Polvo oscuro, huesos de antenas y hogares convertidos en vidrio quemado.',palette:'#d28e74',shadow:'#2a1b21',sign:';',sound:'El viento silba a través de una antena vacía.',lore:'Los transmisores del norte siguen enumerando habitantes de ciudades que jamás existieron.',threat:'Las ventiscas de polvo cargan el organismo de residuos.'},
  hierro:{name:'Cinturón de Hierro',subtitle:'MÁQUINAS SIN DUEÑO',description:'Cables petrificados atraviesan dunas de ferrita y maquinaria que nunca se detuvo.',palette:'#8ec7cd',shadow:'#13272e',sign:'%',sound:'Un motor enterrado intenta arrancar una y otra vez.',lore:'Los autómatas mantienen una fábrica que lleva siglos entregando productos a un destinatario desconocido.',threat:'Las descargas estáticas interfieren con las lecturas ópticas.'},
  vidrio:{name:'Galerías de Vidrio',subtitle:'LOS REFLEJOS NO OBEDECEN',description:'La arena está fundida en láminas irregulares. Tus reflejos tardan en seguirte.',palette:'#caa9e3',shadow:'#241b32',sign:'v',sound:'El cristal vibra como una garganta.',lore:'Bajo el espejo mineral existe una sala donde cada observador ve un cielo distinto.',threat:'El vidrio fracturado y las resonancias pueden lastimarte.'},
  medula:{name:'Bosque de Médula',subtitle:'RAÍCES CON MEMORIA',description:'Columnas fúngicas, filamentos húmedos y cuerpos que se mueven al ritmo de una sola respiración.',palette:'#9dd2a1',shadow:'#14291f',sign:'&',sound:'Una multitud parece respirar bajo tierra.',lore:'Los filamentos de médula recuerdan las palabras de quienes alguna vez caminaron sobre ellos.',threat:'Las esporas elevan la exposición biológica.'},
  umbral:{name:'Margen del Umbral',subtitle:'LA REALIDAD PARPADEA',description:'El horizonte se pliega. Un mismo objeto aparece en dos lugares durante un instante.',palette:'#e6a3c9',shadow:'#2c1730',sign:'?',sound:'Alguien dice tu nombre dentro de tu cabeza.',lore:'El Umbral no es un lugar: es la costura visible entre dos versiones incompatibles de Nácar.',threat:'Las distorsiones provocan exposición y ocultan detalles del entorno.'}
};
const ANCHORS:{id:BiomeId;x:number;y:number;weight:number}[]=[
  {id:'salinas',x:34,y:32,weight:1.30},
  {id:'ceniza',x:4,y:3,weight:1},
  {id:'hierro',x:91,y:4,weight:1},
  {id:'vidrio',x:3,y:61,weight:1},
  {id:'medula',x:92,y:61,weight:1},
  {id:'umbral',x:53,y:64,weight:1.12}
];
/** Coordinate hash, no RNG mutation and no reliance on JavaScript Math.random. */
export function terrainHash(seed:number,x:number,y:number):number {
  let n=(Math.imul(x+13,374761393)^Math.imul(y+71,668265263)^Math.imul(seed|0,1442695041))|0;
  n=Math.imul(n^(n>>>13),1274126177);n^=n>>>16;
  return (n>>>0)/4294967296;
}
/** Smooth regional noise: small clusters, not single-pixel biome confetti. */
export function biomeAt(seed:number,x:number,y:number):BiomeId {
  // Preserves the safe village and its immediate approach.
  if(x>=17&&x<=48&&y>=20&&y<=44)return 'salinas';
  const gridX=Math.floor(x/9),gridY=Math.floor(y/9);
  const tx=x/9-gridX,ty=y/9-gridY;
  const smooth=(t:number)=>t*t*(3-2*t);
  const a=terrainHash(seed,gridX,gridY)-.5,b=terrainHash(seed,gridX+1,gridY)-.5;
  const c=terrainHash(seed,gridX,gridY+1)-.5,d=terrainHash(seed,gridX+1,gridY+1)-.5;
  const top=a+(b-a)*smooth(tx),bottom=c+(d-c)*smooth(tx);
  const wobble=(top+(bottom-top)*smooth(ty))*23;
  let nearest:BiomeId='salinas',score=Infinity;
  for(const anchor of ANCHORS){const dx=x-anchor.x,dy=y-anchor.y;const distance=Math.hypot(dx,dy)*anchor.weight;
    const value=distance+(anchor.id==='salinas'?0:(wobble*terrainHash(seed,anchor.x,anchor.y)));
    if(value<score){score=value;nearest=anchor.id;}
  }
  return nearest;
}
export function weatherAt(seed:number,tick:number,biome:BiomeId):WeatherId {
  const period=Math.floor(tick/1800); // 18 normal turns per atmospheric interval.
  const intensity=terrainHash(seed,period+100,period*3+19);
  if(intensity<.45)return 'calma';
  if(biome==='ceniza'||biome==='salinas')return 'polvo';
  if(biome==='hierro')return 'estatica';
  if(biome==='medula')return 'esporas';
  return 'distorsion';
}
export const WEATHER:Record<WeatherId,{name:string;description:string;radius:number}>={
  calma:{name:'Calma',description:'El aire permanece inmóvil.',radius:10},
  polvo:{name:'Viento de sal',description:'Los granos secos borran el horizonte.',radius:7},
  estatica:{name:'Tormenta iónica',description:'Los conductores chisporrotean en la distancia.',radius:8},
  esporas:{name:'Lluvia de esporas',description:'Partículas luminosas caen desde el dosel.',radius:7},
  distorsion:{name:'Interferencia',description:'Las formas se desplazan en el rabillo del ojo.',radius:6}
};
export const AMBIENT_ECHOES:Record<BiomeId,readonly string[]>={
  salinas:['Una vibración se prolonga después de que dejes de caminar.','A lo lejos, una radio transmite el ruido del viento al revés.','La costra mineral se hunde bajo una huella que no es tuya.'],
  ceniza:['Un poste de señales proyecta dos sombras opuestas.','Un olor a cables quemados sale de un refugio vacío.','Una estática seca imita una carcajada lejana.'],
  hierro:['Un martillo golpea dentro de un silo sellado.','La arena metálica se alinea hacia algo bajo tus pies.','Una luz roja se enciende en una máquina sin energía.'],
  vidrio:['Un reflejo permanece quieto cuando te detienes.','Las láminas de vidrio vibran como voces sumergidas.','Una grieta se abre en la superficie y se cierra antes de llegar a ella.'],
  medula:['Los tallos inclinan sus puntas en tu dirección.','Miles de esporas ascienden simultáneamente, como respondiendo a una orden.','Una respiración profunda mueve el suelo bajo tus botas.'],
  umbral:['La distancia al horizonte cambia durante un parpadeo.','Oyes una respuesta a una pregunta que todavía no has formulado.','Una constelación aparece bajo tus pies durante un segundo.']
};
export function hazardAt(biome:BiomeId,tile:string,weather:WeatherId):number {
  if(tile==='!')return biome==='vidrio'?3:biome==='umbral'?4:2;
  if(weather==='esporas'&&biome==='medula')return 2;
  if(weather==='distorsion'&&biome==='umbral')return 2;
  if(weather==='polvo'&&biome==='ceniza')return 1;
  return 0;
}
