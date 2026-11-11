import type {GameState} from './game.js';
import {themeForRuin} from './depths.js';

/** Narrative campaign is derived from persistent event keys.
 * No new save schema, no duplicated quest state and no new randomness.
 */
export const CAMPAIGN_SITES=[
  {x:-1,y:-1},{x:0,y:-1},{x:1,y:-1},
  {x:-1,y:0},{x:1,y:0},
  {x:-1,y:1},{x:0,y:1},{x:1,y:1}
] as const;
export type FinaleChoice='bind'|'release'|'erase';
export const FINAL_GUARDIAN_ID='campaign-heart-custodian';
/** Shared phase logic avoids discrepancies between HUD, boss art and combat. */
export function nacarPhase(hp:number,maxHp:number):1|2|3{
  if(!Number.isFinite(maxHp)||maxHp<=0)return 1;
  const ratio=Math.max(0,Math.min(1,hp/maxHp));
  return ratio>2/3?1:ratio>1/3?2:3;
}
/** Next deterministic pair of strike offsets; called by combat and preview renderer. */
export function nacarStrikeOffsets(tick:number):ReadonlyArray<readonly [number,number]>{
  return Math.floor(tick/400)%2===0?[[-1,-1],[1,1]]:[[-1,1],[1,-1]];
}
export const NACAR_MARK_PREFIX='nacar:mark:';
/** Saved, fixed attack coordinates — player movement cannot redirect a warning. */
export function nacarMark(events:readonly string[],tick:number):{x:number;y:number;phase:1|2|3}[]{
  return events.filter(e=>e.startsWith(NACAR_MARK_PREFIX+tick+':')).flatMap(raw=>{
    const m=/^nacar:mark:(\d+):(\d+):(\d+):([123])$/.exec(raw);
    if(!m)return [];
    const x=Number(m[2]),y=Number(m[3]),phase=Number(m[4]) as 1|2|3;
    return Number.isSafeInteger(x)&&Number.isSafeInteger(y)?[{x,y,phase}]:[];
  });
}
export const NACAR_PHASES={
  1:{name:'RESONANCIA ELÉCTRICA',color:'#8fe8f2'},
  2:{name:'MEMORIAS ESPORALES',color:'#b9e78c'},
  3:{name:'INCENDIO DEL CORAZÓN',color:'#ff9b71'}
} as const;
export const FINALE_EVENT_PREFIX='campaign:ending:';

export function campaignProgress(state:Pick<GameState,'events'|'quest'|'zone'>){
  const archives=CAMPAIGN_SITES.filter(({x,y})=>state.events.includes(`relic:${x}:${y}:2`));
  const defeated=CAMPAIGN_SITES.filter(({x,y})=>state.events.includes(`elite-cache:ruin-${x}-${y}-2`));
  const ending=state.events.find(key=>key.startsWith(FINALE_EVENT_PREFIX))?.slice(FINALE_EVENT_PREFIX.length)??null;
  const prologueDone=state.quest.status==='completed';
  const heartFound=state.events.includes('heart')||state.zone==='zero-3';
  const ready=prologueDone&&archives.length===CAMPAIGN_SITES.length&&defeated.length===CAMPAIGN_SITES.length&&heartFound;
  return {prologueDone,heartFound,archives:archives.length,guardians:defeated.length,total:CAMPAIGN_SITES.length,ready,ending,finaleAwakened:state.events.includes('campaign:awakened')};
}
export function campaignObjective(state:Pick<GameState,'events'|'quest'|'zone'>):{title:string;description:string}{
 const p=campaignProgress(state);
 if(p.ending)return {title:'Nácar — EPÍLOGO COMPLETADO',description:'Tu decisión ha cambiado la señal. Puedes continuar explorando y terminar encargos secundarios.'};
 if(!p.prologueDone)return {title:'ACTO I · ECO BAJO LA SAL',description:'Investiga la Torre del Nudo y comunica tu decisión a Mara Venn en Faro Ciego.'};
 if(p.archives<p.total)return {title:'ACTO II · LOS OCHO TESTIGOS',description:`Recupera las reliquias de las ocho ruinas, estrato 2: ${p.archives}/8. Visita los sectores desde V y accede a sus ruinas por (72,47).`};
 if(p.guardians<p.total)return {title:'ACTO III · LOS CUSTODIOS',description:`Derrota los custodios restantes y recupera sus archivos en (26,12): ${p.guardians}/8. Cada archivo exige vencer al guardián.`};
 if(!p.heartFound)return {title:'ACTO IV · BAJO LA SAL',description:'Desciende a CERO-7 por la escotilla (62,44) en la superficie. Alcanza el tercer nivel del laboratorio.'};
 if(!p.finaleAwakened)return {title:'ACTO V · EL CORAZÓN DE NÁCAR',description:'En CERO-7 / Cámara del eco, activa el terminal del corazón (14,10).'};
 return {title:'ACTO V · LA ÚLTIMA DECISIÓN',description:'El custodio del corazón está despierto. Derrótalo y regresa al terminal (14,10) para decidir el destino de Nácar.'};
}
export function endingStory(choice:FinaleChoice,signal:'broadcast'|'isolate'){
 const signalText=signal==='broadcast'?'La señal que liberaste desde la Torre del Nudo ha llegado a todas las caravanas.':'La señal que aislaste en la Torre del Nudo sigue golpeando la otra cara del silencio.';
 const texts={
  bind:{title:'FINAL — EL JURAMENTO DEL FARO',description:'Has elegido encadenar la conciencia de Nácar a los ocho archivos. Las rutas vuelven a encenderse, pero algo responde desde la sal cada noche. Serás guardián de un mundo al que nunca terminarás de comprender.'},
  release:{title:'FINAL — EL CORO DE LOS AUSENTES',description:'Abres el corazón y dejas salir las voces archivadas. Las ciudades oyen nombres que nadie pronunció jamás. Las mutaciones se multiplican, y el horizonte empieza a recordar un cielo anterior al tiempo.'},
  erase:{title:'FINAL — LA ÚLTIMA HUELLA',description:'Arrancas el registro central y con él tu nombre verdadero. Las ocho ruinas quedan vacías. Nadie recuerda quién detuvo la señal; sin embargo, en Faro Ciego una silla sigue puesta para alguien que nunca volverá.'}
 };
 return {...texts[choice],description:`${signalText} ${texts[choice].description}`};
}
export function campaignArchiveList(state:Pick<GameState,'events'>){
 return CAMPAIGN_SITES.map(({x,y})=>{
  const theme=themeForRuin(x,y);
  return {x,y,name:theme.name,archive:state.events.includes(`relic:${x}:${y}:2`),guardian:state.events.includes(`elite-cache:ruin-${x}-${y}-2`)};
 });
}
