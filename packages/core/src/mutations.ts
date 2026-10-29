/** MUTATION 404: original gene system. Data definitions are independent of rendering. */
export type MutationId = 'regeneration'|'dermal-plates'|'salt-gills'|'copper-nerves'|'spore-symbiosis'|'kinetic-pulse'|'neural-shock'|'pyrokinesis'|'phase-step';
export type MutationClass = 'biológica'|'psíquica'|'tecnoorgánica'|'anómala';
export interface MutationDefinition { name:string; family:MutationClass; description:string; passive:boolean; focus:number; cooldown:number; cost:number; shortcut?:string }
export const MUTATIONS:Record<MutationId,MutationDefinition>={
  regeneration:{name:'Regeneración salina',family:'biológica',description:'Recuperas 1 PV cada 4 turnos, salvo si estás expuesto a contaminación crítica.',passive:true,focus:0,cooldown:0,cost:1},
  'dermal-plates':{name:'Placas dérmicas',family:'biológica',description:'+1 armadura, pero el Pulso cinético cuesta 1 concentración adicional.',passive:true,focus:0,cooldown:0,cost:1},
  'salt-gills':{name:'Branquias de salmuera',family:'biológica',description:'El agua y la exposición ambiental natural afectan menos a tu organismo.',passive:true,focus:0,cooldown:0,cost:1},
  'copper-nerves':{name:'Nervios de cobre',family:'tecnoorgánica',description:'Las descargas ambientales infligen menos daño, pero el fuego te quema más.',passive:true,focus:0,cooldown:0,cost:1},
  'spore-symbiosis':{name:'Simbiosis de médula',family:'biológica',description:'Recuperas concentración en el bosque de médula; resistirás mejor las esporas.',passive:true,focus:0,cooldown:0,cost:1},
  'kinetic-pulse':{name:'Pulso cinético',family:'psíquica',description:'Proyecta fuerza contra un enemigo visible (4 casillas), le hiere, empuja y aturde.',passive:false,focus:5,cooldown:4,cost:1,shortcut:'1'},
  'neural-shock':{name:'Grito neural',family:'psíquica',description:'Aturde durante 2 turnos a criaturas próximas (radio 3).',passive:false,focus:7,cooldown:6,cost:1,shortcut:'2'},
  pyrokinesis:{name:'Ignición memorística',family:'psíquica',description:'Prende una casilla ocupada por un enemigo visible (6 casillas) durante 4 turnos.',passive:false,focus:6,cooldown:5,cost:1,shortcut:'3'},
  'phase-step':{name:'Paso de fase',family:'anómala',description:'Salta hasta 2 casillas siguiendo la última dirección de movimiento; no atraviesa muros.',passive:false,focus:6,cooldown:5,cost:1,shortcut:'4'}
};
export interface Genome { unlocked:MutationId[]; genePoints:number; cooldowns:Partial<Record<MutationId,number>>; facing:{dx:number;dy:number} }
export const initialGenome=():Genome=>({unlocked:['regeneration','kinetic-pulse'],genePoints:1,cooldowns:{},facing:{dx:0,dy:-1}});
export function knows(genome:Genome,id:MutationId):boolean{return genome.unlocked.includes(id);}
export function unlock(genome:Genome,id:MutationId):boolean{
  if(!Object.hasOwn(MUTATIONS,id)||knows(genome,id)||genome.genePoints<MUTATIONS[id].cost)return false;
  genome.genePoints-=MUTATIONS[id].cost;genome.unlocked.push(id);return true;
}
export function tickCooldowns(genome:Genome):void{
  for(const id of Object.keys(genome.cooldowns) as MutationId[])genome.cooldowns[id]=Math.max(0,(genome.cooldowns[id]??0)-1);
}
