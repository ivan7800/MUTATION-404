import { RECIPES, RESOURCE_INFO, seedResources, initialEcology, ecologicalPulse, type EcologyState } from './ecology.js';
import {campaignProgress, campaignObjective, endingStory, FINAL_GUARDIAN_ID, nacarPhase, FINALE_EVENT_PREFIX, type FinaleChoice} from './campaign.js';
import { TASKS, GOODS, priceFor, settlementCitizens, interiorForSector, exteriorForInterior, generateInterior, type Citizen } from './civilizations.js';
import { SECTORS, coordsForZone, generateSector, sectorName, zoneForSector } from './frontier.js';
import { generateDepth, generateRuin, ruinId, ruinName, parseRuin, themeForRuin, ZONE_NAMES, type ZoneId, type ZoneMemory } from './depths.js';
import { MUTATIONS, initialGenome, knows, tickCooldowns, unlock, type Genome, type MutationId } from './mutations.js';
import { initialFields, placeField, stepEnvironment, type Field } from './environment.js';
import { AMBIENT_ECHOES, biomeAt, BIOMES, hazardAt, terrainHash, WEATHER, weatherAt, type BiomeId, type WeatherId } from './biomes.js';
import { ACTORS, generateWorld, HEIGHT, index, LANDMARKS, passable, WIDTH, within, type Actor, type Tile } from './world.js';
import { computeVisibility } from './fov.js';
import { SeededRng } from './rng.js';
import { addStack, ENEMY_DEFS, eqArmor, INITIAL_EQUIPMENT, INITIAL_INVENTORY, INITIAL_STATS, ITEM_DEFS, inFaro, manhattan, removeStack, spawnEnemies, stackCount, takeEnemyTurn, xpNeeded, type Enemy, type Equipment, type GroundItem, type ItemId, type ItemStack, type PlayerStats } from './combat.js';
import { hasLineOfSight } from './fov.js';
export { ENEMY_DEFS, ITEM_DEFS, stackCount, xpNeeded } from './combat.js';
export { MUTATIONS, knows } from './mutations.js';
export type { Genome, MutationId } from './mutations.js';
export { FIELD_VISUALS } from './environment.js';
export type { Enemy, EnemyKind, ItemId, ItemStack, PlayerStats, GroundItem, Equipment } from './combat.js';
export { parseRuin, ruinName } from './depths.js';
export { HEIGHT, WIDTH, LANDMARKS, ACTORS } from './world.js';
export { SECTORS, coordsForZone, sectorName } from './frontier.js';
export { TASKS, GOODS, priceFor, settlementCitizens, interiorForSector, exteriorForInterior } from './civilizations.js';
export { RECIPES, RESOURCE_INFO } from './ecology.js';
export { BIOMES, WEATHER, biomeAt, weatherAt } from './biomes.js';
export {campaignProgress,campaignObjective,campaignArchiveList,endingStory,CAMPAIGN_SITES} from './campaign.js';
export type { Tile, Actor, Landmark } from './world.js';
export interface Position { x: number; y: number }
export type QuestStatus = 'undiscovered' | 'active' | 'signal-found' | 'completed';
export interface Quest { status: QuestStatus; outcome: 'none' | 'broadcast' | 'isolate'; fuseFound: boolean }
export type Dialog = { speaker: string; text: string; options: { id: string; label: string }[] } | null;
export interface GameState {
  version: 11; ecology:EcologyState; civilization: { active:string[]; completed:string[] }; zone:ZoneId; zones:Partial<Record<ZoneId,ZoneMemory>>; reputation:Record<string,number>; events:string[]; seed: number; rngState: number; tick: number; player: Position;
  tiles: Tile[]; seen: number[]; visible: number[]; log: string[];
  quest: Quest; discoveries: string[]; dialogue: Dialog;
  stats:PlayerStats; equipment:Equipment; inventory:ItemStack[]; enemies:Enemy[]; ground:GroundItem[]; targetId:string|null; kills:number;
  genome:Genome;fields:Field[]; exposure:number; biomeNotes:BiomeId[]; lastBiome:BiomeId; lastWeather:WeatherId; environmentalTurns:number;
}
export type Command = {type:'move';dx:number;dy:number} | {type:'wait'} | {type:'inspect'} | {type:'interact'} | {type:'choose';option:string} | {type:'close-dialog'} | {type:'target'} | {type:'fire'} | {type:'attack'} | {type:'pickup'} | {type:'heal'} | {type:'swap'} | {type:'equip';item:ItemId} | {type:'scan'} | {type:'unlock';mutation:MutationId} | {type:'cast';mutation:MutationId} | {type:'trade';item:ItemId;side:'buy'|'sell'} | {type:'descend'} | {type:'ascend'} | {type:'explore'} | {type:'enter-settlement'} | {type:'leave-settlement'} | {type:'regional-trade';item:ItemId;side:'buy'|'sell'} | {type:'harvest'} | {type:'craft';recipe:string};
export interface ActionResult { accepted:boolean; timeCost:number; message:string }
const MSG_LIMIT = 70;
function message(state: GameState, text: string): void { state.log.push(text); if (state.log.length > MSG_LIMIT) state.log.splice(0, state.log.length - MSG_LIMIT); }
export function createGame(seed: number): GameState {
  if (!Number.isSafeInteger(seed)) throw new Error('La semilla debe ser un entero seguro.');
  const rng = new SeededRng(seed);
  const tiles = generateWorld(seed);
  const state: GameState = {version:11,ecology:initialEcology(),civilization:{active:[],completed:[]},zone:'surface',zones:{},reputation:{ferral:0,concordia:0},events:[],seed,rngState:rng.state,tick:0,player:{x:32,y:32},tiles,
    seen: new Array<number>(WIDTH*HEIGHT).fill(0), visible:[], log:[],
    quest:{status:'undiscovered',outcome:'none',fuseFound:false},discoveries:['faro'],dialogue:null,
    stats:{...INITIAL_STATS},equipment:{...INITIAL_EQUIPMENT},inventory:INITIAL_INVENTORY.map(x=>({...x})),
    enemies:spawnEnemies(tiles),ground:[],targetId:null,kills:0,
    genome:initialGenome(),fields:initialFields(seed,tiles),exposure:0,biomeNotes:[],lastBiome:'salinas',lastWeather:weatherAt(seed,0,'salinas'),environmentalTurns:0};
  message(state,'DESPERTAR // La sal cruje bajo tus botas.');
  message(state,'Una voz llega desde la plaza: «Errante, ¿me escuchas?»');
  refreshVisibility(state);
  return state;
}
function ensureResources(s:GameState):void{
  if(coordsForZone(s.zone)&&!s.ecology.seededZones.includes(s.zone)){
    s.ecology.nodes.push(...seedResources(s.seed,s.zone,s.tiles,(x,y)=>biomeAt(s.seed,x,y)));
    s.ecology.seededZones.push(s.zone);
  }
}
export function refreshVisibility(state: GameState): void {
  ensureResources(state);
  const biome=biomeAt(state.seed,state.player.x,state.player.y);
  const radius=WEATHER[weatherAt(state.seed,state.tick,biome)].radius;
  state.visible = computeVisibility(state.tiles,state.player.x,state.player.y,radius);
  for (let i=0;i<state.visible.length;i++) if(state.visible[i])state.seen[i]=1;
}
export function tileAt(state: GameState,x:number,y:number): Tile | undefined { return within(x,y) ? state.tiles[index(x,y)] : undefined; }
function nearby(a: Position,b: Position): boolean { return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)<=1; }
function nearbyActor(s: GameState): Actor | undefined { return s.zone==='surface'?ACTORS.find(a=>nearby(s.player,a)):undefined; }
function revealLandmark(s: GameState): void {
  if(s.zone!=='surface')return;
  for(const p of LANDMARKS) if(!s.discoveries.includes(p.id) && Math.abs(s.player.x-p.x)+Math.abs(s.player.y-p.y)<=3) {
    s.discoveries.push(p.id); message(s,`LUGAR DESCUBIERTO // ${p.name}. ${p.description}`);
  }
}
function nearbyCitizen(s:GameState): Citizen|undefined {
  return settlementCitizens(s.zone,s.tick).find(c=>nearby(s.player,c));
}
function talkToCitizen(s:GameState,c:Citizen):void {
  const task=TASKS.find(t=>t.sector===c.sector)!;
  const done=s.civilization.completed.includes(task.id);
  const active=s.civilization.active.includes(task.id);
  if(c.role==='mercader')s.dialogue={speaker:c.name,text:`«Las mercancías cambian de valor con la reputación. Tu confianza local: ${s.reputation[task.faction]??0}.»`,options:[{id:'regional-market',label:'Ver el puesto de suministros.'},{id:'leave',label:'Marcharme.'}]};
  if(c.role==='cronista')s.dialogue={speaker:c.name,text:done?'«Recordaremos que acudiste cuando la comunidad lo necesitaba.»':active?`«${task.title}: necesitamos ${task.required} unidades de chatarra. ¿Has reunido suficiente?»`:`«${task.description} Sin tu ayuda no repararemos el refugio antes de la próxima tormenta.»`,options:done?[{id:'leave',label:'Despedirme.'}]:active?[{id:'turn-in-task',label:'Entregar los materiales.'},{id:'leave',label:'Todavía no.'}]:[{id:'accept-task',label:'Acepto el encargo.'},{id:'leave',label:'No ahora.'}]};
  if(c.role==='vigia')s.dialogue={speaker:c.name,text:'«Vigilamos rutas, no fronteras. Los caminos cambian cuando nadie los mira. De noche regresamos a la casa comunal.»',options:[{id:'leave',label:'Continuar.'}]};
}
function localTask(s:GameState){const zone=exteriorForInterior(s.zone)??s.zone;return TASKS.find(t=>t.sector===zone);}
function openActor(s: GameState,actor:Actor): void {
  if(actor.id==='kala'||actor.id==='ida'){
    const shop=actor.id==='kala'?'Cruce 7':'Refugio Ferral';
    s.dialogue={speaker:actor.name,text:`«Bienvenido al ${shop}. Podemos intercambiar suministros. Tu reputación Ferral es ${s.reputation.ferral}. ¿Qué buscas?»`,options:[{id:'shop',label:'Ver mercancías y precios.'},{id:'leave',label:'Hasta pronto.'}]};
  }else if(actor.id==='mara') {
    if(s.quest.status==='undiscovered') s.dialogue={speaker:actor.name,text:'«La Torre del Nudo repite una señal anterior a la Interrupción. Nadie que ha intentado descifrarla ha vuelto igual. ¿Investigarás su origen?»',options:[{id:'accept',label:'Acepto investigar la señal.'},{id:'ask',label:'¿Qué debería buscar?'},{id:'leave',label:'Ahora no.'}]};
    else if(s.quest.status==='active') s.dialogue={speaker:actor.name,text:'«La torre está al noreste, cerca de las coordenadas 79,13. Oren cree que la caravana del noroeste guardaba un fusible de repuesto.»',options:[{id:'hint',label:'Entendido.'},{id:'leave',label:'Me marcho.'}]};
    else if(s.quest.status==='signal-found') s.dialogue={speaker:actor.name,text:s.quest.outcome==='broadcast'?'«La frecuencia ya ha alcanzado las caravanas. El mundo ha oído lo que no debería.»':'«Has silenciado la frecuencia. Tal vez solo hayas retrasado lo inevitable.»',options:[{id:'finish',label:'Informar de lo ocurrido.'},{id:'leave',label:'Me marcho.'}]};
    else s.dialogue={speaker:actor.name,text:'«Puede que la señal haya callado, pero las salinas siguen escuchando. No olvides lo que decidiste.»',options:[{id:'leave',label:'Hasta luego.'}]};
  } else if(actor.id==='oren') s.dialogue={speaker:actor.name,text:s.quest.fuseFound?'«¡Ese fusible aún funciona! Acércalo al terminal de la torre: las viejas máquinas lo reconocerán.»':'«Las ondas comen metal. Encontrarás un fusible en la caravana varada al noroeste, en 12,10. Puede servirte para activar la torre sin forzarla.»',options:[{id:'leave',label:'Gracias, Oren.'}]};
  else if(actor.id==='sira') s.dialogue={speaker:actor.name,text:'«He visto sombras en el Campo de Espejos, al sureste. Si ves tu reflejo sonreír antes que tú, no respondas.»',options:[{id:'rumor',label:'¿Qué se esconde bajo la sal?'},{id:'leave',label:'Adiós.'}]};
  else s.dialogue={speaker:actor.name,text:'«KETH-9: custodia activa. Registro 404. La Torre del Nudo emite antes de recibir. Inconsistencia causal no resuelta.»',options:[{id:'echo',label:'¿Antes de recibir?'},{id:'leave',label:'Retirarme.'}]};
}
function openLandmark(s: GameState, id: string): void {
  if(id==='vault'){s.dialogue={speaker:'Escotilla CERO-7',text:'Un ascensor sin energía desciende hacia una instalación de tres niveles. A pesar de ello, el indicador señala que alguien te espera abajo.',options:[{id:'go-down',label:'Descender a CERO-7.'},{id:'leave',label:'Volver a la superficie.'}]};}
  else if(id==='relay') {
    if(s.quest.status==='undiscovered') s.dialogue={speaker:'Terminal del Nudo',text:'Una señal dibuja tu nombre en una pantalla apagada. No sabes qué hacer con ella. Mara Venn, en Faro Ciego, podría entenderla.',options:[{id:'leave',label:'Regresar.'}]};
    else if(s.quest.status==='active') s.dialogue={speaker:'Terminal del Nudo',text:s.quest.fuseFound?'El fusible encaja. La frecuencia se vuelve nítida: «NO REPRODUZCAS ESTA TRANSMISIÓN».':'El terminal está dañado. Puedes forzarlo, pero la señal podría propagarse sin control. Un fusible de la caravana permitiría aislarla.',options:[{id:'broadcast',label:'Transmitir la señal a todo Nácar.'},{id:'isolate',label:s.quest.fuseFound?'Aislar la señal usando el fusible.':'Forzar el aislamiento (riesgo desconocido).'},{id:'leave',label:'Alejarme del terminal.'}]};
    else s.dialogue={speaker:'Terminal del Nudo',text:'La frecuencia ha sido procesada. En la pantalla queda una última palabra: «TODAVÍA».',options:[{id:'leave',label:'Cerrar terminal.'}]};
  } else if(id==='ashes') s.dialogue={speaker:'Observatorio Quemado',text:'El telescopio no muestra estrellas: muestra un mapa de las salinas como eran mañana. El ocular está frío por dentro.',options:[{id:'leave',label:'Guardar silencio.'}]};
  else if(id==='furnace') s.dialogue={speaker:'Horno de las Nueve',text:'Nueve hornos trabajan sin fuego. En el noveno, un martillo golpea a intervalos que imitan tu pulso.',options:[{id:'leave',label:'Abandonar las instalaciones.'}]};
  else if(id==='garden') s.dialogue={speaker:'Jardín Sin Raíces',text:'Una flor de cristal gira hacia ti. En el interior de sus pétalos reconoces una frase que dijiste de niño.',options:[{id:'leave',label:'No tocar los pétalos.'}]};
  else if(id==='rift') s.dialogue={speaker:'Costura de Nácar',text:'La abertura muestra una costa donde dos soles negros iluminan el mar. Algo imita tu respiración al otro lado.',options:[{id:'leave',label:'Retroceder.'}]};
  else if(id==='convoy') s.dialogue={speaker:'Caravana Quietud',text:s.quest.fuseFound?'Solo quedan cascos vacíos, sal y la marca circular donde descansaba un fusible.':'Dentro de una caja blindada encuentras un fusible cerámico, intacto bajo varias capas de sal.',options:s.quest.fuseFound?[{id:'leave',label:'Continuar.'}]:[{id:'fuse',label:'Recoger fusible cerámico.'},{id:'leave',label:'Dejarlo por ahora.'}]};
  else if(id==='mirror') s.dialogue={speaker:'Campo de Espejos',text:'Tu reflejo no imita tus movimientos. Mueve los labios y forma tres palabras: «YA ESTÁS AQUÍ».',options:[{id:'leave',label:'Apartar la mirada.'}]};
  else s.dialogue={speaker:'Pozo de los Nombres',text:'Desde el fondo surge una voz idéntica a la tuya. Enumera recuerdos que todavía no tienes.',options:[{id:'leave',label:'Cerrar el brocal.'}]};
}
function storeZone(s:GameState):void{
  s.zones[s.zone]={tiles:s.tiles,seen:s.seen,enemies:s.enemies,ground:s.ground,fields:s.fields,player:{...s.player}};
}
function changeZone(s:GameState,to:ZoneId):void{
  const old=s.zone;storeZone(s);
  const sector=coordsForZone(to);
  const snapshot=s.zones[to]??(exteriorForInterior(to)?generateInterior(s.seed,to as `interior-${number}-${number}`):sector&&to!=='surface'?generateSector(s.seed,sector.x,sector.y):to==='surface'?undefined:parseRuin(to)?generateRuin(s.seed,parseRuin(to)!.x,parseRuin(to)!.y,parseRuin(to)!.depth):generateDepth(s.seed,(Number(to.split('-')[1])||1) as 1|2|3));
  if(!snapshot)throw new Error('Zona no disponible.');
  s.zone=to;s.tiles=snapshot.tiles;s.seen=snapshot.seen;s.enemies=snapshot.enemies;s.ground=snapshot.ground;s.fields=snapshot.fields;
  s.player={...snapshot.player};s.targetId=null;s.dialogue=null;
  refreshVisibility(s);message(s,`TRÁNSITO // ${coordsForZone(to)?sectorName(coordsForZone(to)!.x,coordsForZone(to)!.y):ruinName(to)}. La estructura se reorganiza a tu alrededor.`);
  if(old!==to&&to==='zero-3'&&!s.events.includes('heart')){s.events.push('heart');s.reputation.concordia++;message(s,'DESCUBRIMIENTO // Has oído el corazón del laboratorio. Concordia recuerda tu hallazgo.');}
}
const MARKET:Partial<Record<ItemId,{buy:number;sell:number}>>={medkit:{buy:12,sell:5},ammo:{buy:2,sell:1},scrap:{buy:6,sell:3},carapace:{buy:8,sell:4},capacitor:{buy:15,sell:8}};
export { ZONE_NAMES, MARKET };
/** Three deterministic guardian phases, without timers, RNG draws or save fields.
 * Each pulse leaves a visible, avoidable tile hazard for the following turn.
 * The same seed, turn, player position and guardian HP always produce the same result.
 */
function pulseNacar(s:GameState):void{
  if(s.zone!=='zero-3'||s.stats.hp<=0||s.tick%400!==0)return;
  const guardian=s.enemies.find(e=>e.id===FINAL_GUARDIAN_ID&&e.hp>0);
  if(!guardian)return;
  const phase=nacarPhase(guardian.hp,ENEMY_DEFS.drone.hp*3);
  const kind:Field['kind']=phase===1?'electric':phase===2?'spores':'fire';
  // One of two diagonal pairs alternates predictably, allowing dodging.
  const diagonal=(Math.floor(s.tick/400)%2)===0;
  const offsets=diagonal?[[-1,-1],[1,1]]:[[-1,1],[1,-1]];
  let placed=0;
  for(const [dx,dy] of offsets){
    const x=s.player.x+dx,y=s.player.y+dy;
    if(within(x,y)&&passable(s.tiles[index(x,y)])){
      placeField(s.fields,{x,y,kind,ttl:3});
      placed++;
    }
  }
  if(placed)message(s,`NÁCAR · FASE ${phase} // ${phase===1?'Arcos eléctricos':phase===2?'Memorias esporales':'Incendio del corazón'}: el suelo diagonal se activa. Busca una ruta libre.`);
}
/** Every world-changing action uses this entry point; no hidden UI-side combat. */
function advance(s:GameState,cost:number):void {
  s.tick+=cost;
  const pulse=Math.floor(s.tick/3000);
  if(pulse>s.ecology.lastPulse){
    // Cap replay on loading old saves; current tick always progresses incrementally.
    for(let p=s.ecology.lastPulse+1;p<=pulse;p++)for(const note of ecologicalPulse(s.seed,p,s.zone,s.zones,{enemies:s.enemies,tiles:s.tiles},s.ecology))message(s,note);
    message(s,'MUNDO VIVO // Los territorios muestran nuevas señales de migración.');
  }
  for(let n=0;n<Math.ceil(cost/100);n++){
    tickCooldowns(s.genome);
    // Environmental hazards can kill enemies; reward those kills exactly once.
    const alive=new Set(s.enemies.filter(e=>e.hp>0).map(e=>e.id));
    stepEnvironment(s,text=>message(s,text));
    for(const foe of s.enemies)if(foe.hp===0&&alive.has(foe.id))killEnemy(s,foe);
    if(s.stats.hp>0)takeEnemyTurn(s,text=>message(s,text));
    pulseNacar(s);
    if(knows(s.genome,'regeneration')&&s.environmentalTurns%4===3&&s.exposure<65&&s.stats.hp>0){
      const healed=Math.min(1,s.stats.maxHp-s.stats.hp);s.stats.hp+=healed;
      if(healed)message(s,'MUTACIÓN // Tus tejidos se recomponen (+1 PV).');
    }
    if(knows(s.genome,'spore-symbiosis')&&biomeAt(s.seed,s.player.x,s.player.y)==='medula'&&s.environmentalTurns%4===3){
      s.stats.focus=Math.min(s.stats.maxFocus,s.stats.focus+1);
    }
  }
  if(s.zone.startsWith('sector-')&&s.tick>0&&Math.floor(s.tick/100)%19===0){
    const key=`incident:${s.zone}:${Math.floor(s.tick/1900)}`;
    if(!s.events.includes(key)&&s.events.length<45){
      s.events.push(key);const here=coordsForZone(s.zone)!;
      const chances=['Una descarga de radio pronuncia el nombre de una ciudad que aún no existe.','Los símbolos del camino se ordenan para señalar una ruina próxima.','Un convoy distante deja tras de sí un olor a ozono y cobre.'];
      const line=chances[Math.abs(Math.floor(terrainHash(s.seed,here.x+here.y,s.tick)*3))%chances.length];
      message(s,`ACONTECIMIENTO // ${line}`);
    }
  }
  if(s.zone==='surface'&&s.tick>=2300&&!s.events.includes('caravan')&&Math.abs(s.player.x-10)+Math.abs(s.player.y-36)<15){
    s.events.push('caravan');s.reputation.ferral++;s.ground.push({id:'caravan-gift',x:s.player.x,y:s.player.y,item:'scrap',count:2});
    message(s,'SUCESO EMERGENTE // Una caravana abandona un alijo de chatarra. Pulsa G para recogerlo.');
  }
  const biome=biomeAt(s.seed,s.player.x,s.player.y);
  const weather=weatherAt(s.seed,s.tick,biome);
  if(biome!==s.lastBiome){
    const def=BIOMES[biome];message(s,`FRONTERA // ${def.name.toUpperCase()} — ${def.subtitle}.`);
    message(s,`ENTORNO // ${def.description}`);s.lastBiome=biome;
  }
  if(weather!==s.lastWeather){
    message(s,`ATMÓSFERA // ${WEATHER[weather].name}: ${WEATHER[weather].description}`);
    s.lastWeather=weather;
  }
  if(s.tick>0&&Math.floor(s.tick/100)%13===0&&!(s.zone==='surface'&&inFaro(s.player))){
    const samples=AMBIENT_ECHOES[biome];
    const selected=Math.floor(terrainHash(s.seed,Math.floor(s.tick/1300),s.player.x+s.player.y)*samples.length);
    message(s,`ECO // ${samples[selected]}`);
  }
  const sheltered=s.zone==='surface'&&inFaro(s.player);
  s.environmentalTurns++;
  if(sheltered){
    s.exposure=Math.max(0,s.exposure-4);
    if(s.environmentalTurns%3===0)s.stats.focus=Math.min(s.stats.maxFocus,s.stats.focus+1);
  }else{
    const tile=tileAt(s,s.player.x,s.player.y)??'.';
    const baseIntensity=hazardAt(biome,tile,weather);
    const intensity=knows(s.genome,'salt-gills')?Math.max(0,baseIntensity-2):knows(s.genome,'spore-symbiosis')&&weather==='esporas'?Math.max(0,baseIntensity-1):baseIntensity;
    if(intensity){
      s.exposure=Math.min(100,s.exposure+intensity);
      if(tile==='!'&&s.environmentalTurns%2===0&&!(knows(s.genome,'salt-gills')&&biome==='salinas')){
        s.stats.hp=Math.max(0,s.stats.hp-1);
        message(s,`RIESGO AMBIENTAL // Zona inestable: -1 PV, exposición ${s.exposure}%.`);
      }else if(s.environmentalTurns%7===0){message(s,`DOSÍMETRO // La exposición asciende al ${s.exposure}%.`);}
    }else if(s.environmentalTurns%4===0)s.exposure=Math.max(0,s.exposure-1);
    if(s.exposure>=65&&s.environmentalTurns%5===0){
      s.stats.hp=Math.max(0,s.stats.hp-1);
      message(s,'CONTAMINACIÓN // La exposición elevada erosiona tu vitalidad (-1 PV). Regresa a Faro Ciego.');
    }
  }
  refreshVisibility(s);
}
function enemyAt(s:GameState,x:number,y:number):Enemy|undefined{return s.enemies.find(e=>e.hp>0&&e.x===x&&e.y===y);}
function rngRoll(s:GameState,minimum:number,maximum:number):number{
  const rng=new SeededRng(s.rngState);const result=rng.int(minimum,maximum);s.rngState=rng.state;return result;
}
function awardExperience(s:GameState,value:number):void{
  s.stats.xp+=value;
  while(s.stats.xp>=xpNeeded(s.stats.level)){
    s.stats.xp-=xpNeeded(s.stats.level);s.stats.level++;
    s.stats.maxHp+=5;s.stats.hp=Math.min(s.stats.maxHp,s.stats.hp+8);
    s.stats.maxFocus+=2;s.stats.focus=Math.min(s.stats.maxFocus,s.stats.focus+2);
    s.genome.genePoints++;message(s,'EVOLUCIÓN // +1 punto genético. Pulsa U para aprender una mutación.');
    message(s,`ASCENSO // Nivel ${s.stats.level}: +5 PV máximos, +2 concentración.`);
  }
}
function killEnemy(s:GameState,e:Enemy):void{
  const def=ENEMY_DEFS[e.kind];e.hp=0;s.kills++;
  message(s,`ELIMINADO // ${def.name}. +${def.xp} experiencia.`);
  awardExperience(s,def.xp);
  const drop:ItemId=(e.kind==='crawler'||e.kind==='moth')?'carapace':(e.kind==='sentinel'||e.kind==='drone')?'capacitor':'scrap';
  s.ground.push({id:`loot-${e.id}`,x:e.x,y:e.y,item:drop,count:1});
  // Mechanical hostiles may yield spare projectiles; organic foes can leave medicine.
  // Keep the original 35% bonus chance, but prevent drones from being medicine factories.
  const mechanical=e.kind==='sentinel'||e.kind==='drone';
  if(rngRoll(s,1,100)<=35)s.ground.push({id:`bonus-${e.id}`,x:e.x,y:e.y,item:mechanical?'ammo':'medkit',count:mechanical?(e.kind==='sentinel'?3:2):1});
  if(s.kills===3){s.ground.push({id:'upgrade-rifle',x:e.x,y:e.y,item:'rifle',count:1});message(s,'HALLAZGO // Un arma de bobina aparece entre los restos.');}
  if(s.kills===6){s.ground.push({id:'upgrade-armor',x:e.x,y:e.y,item:'shell-armor',count:1});message(s,'HALLAZGO // Una coraza de médula permanece intacta.');}
  if(s.targetId===e.id)s.targetId=null;
}
function attackEnemy(s:GameState,e:Enemy,ranged:boolean):ActionResult{
  const reply=(accepted:boolean,timeCost:number,text:string):ActionResult=>({accepted,timeCost,message:text});
  const def=ENEMY_DEFS[e.kind],distance=manhattan(e,s.player);
  const weapon=ranged?s.equipment.ranged:s.equipment.melee;
  const info=ITEM_DEFS[weapon],range=info.range??1;
  if(distance>range||(!ranged&&distance!==1))return reply(false,0,'Enemigo fuera de alcance.');
  if(ranged&&(s.visible[index(e.x,e.y)]!==1||!hasLineOfSight(s.tiles,s.player.x,s.player.y,e.x,e.y)))return reply(false,0,'No tienes línea de tiro.');
  if(ranged&&!removeStack(s.inventory,'ammo',1)){message(s,'ARMA VACÍA // No quedan púas de munición.');return reply(false,0,'Sin munición.');}
  const climate=weatherAt(s.seed,s.tick,biomeAt(s.seed,s.player.x,s.player.y));
  const obscured=ranged&&WEATHER[climate].radius<=7?10:0;
  const probability=Math.max(15,Math.min(95,(ranged?79:84)-def.evade-(ranged?Math.max(0,distance-3)*7:0)-obscured+s.stats.level*2));
  const roll=rngRoll(s,1,100);
  if(roll<=probability){
    const damage=Math.max(1,rngRoll(s,1,4)+(info.damage??0)+Math.floor((s.stats.level-1)/2)-def.armor);
    e.hp=Math.max(0,e.hp-damage);
    message(s,`COMBATE // Impactas a ${def.name}: -${damage} PV (${e.hp} restantes).`);
    if(e.hp===0)killEnemy(s,e);
    else{e.mode='hunting';e.lastKnown={...s.player};e.searchTurns=4;}
  }else{
    message(s,`COMBATE // Fallas contra ${def.name}. (${probability}% de acierto).`);
    e.mode='hunting';e.lastKnown={...s.player};e.searchTurns=4;
  }
  advance(s,100);
  return reply(true,100,ranged?'Disparo realizado.':'Ataque realizado.');
}
function visibleTargets(s:GameState):Enemy[]{
  return s.enemies.filter(e=>e.hp>0&&s.visible[index(e.x,e.y)]===1&&hasLineOfSight(s.tiles,s.player.x,s.player.y,e.x,e.y)).sort((a,b)=>manhattan(a,s.player)-manhattan(b,s.player)||a.id.localeCompare(b.id));
}
export function dispatch(s:GameState, command:Command):ActionResult {
  const reply=(accepted:boolean,timeCost:number,text:string):ActionResult=>({accepted,timeCost,message:text});
  if(command.type==='close-dialog'){s.dialogue=null;return reply(true,0,'Conversación cerrada.');}
  if(command.type==='choose'){
    if(!s.dialogue||!s.dialogue.options.some(o=>o.id===command.option))return reply(false,0,'Elección no disponible.');
    const option=command.option;s.dialogue=null;
    const task=localTask(s);
    if(option==='resonance-stabilize'||option==='resonance-harvest'){
      const r=parseRuin(s.zone),site=r&&r.depth===2&&manhattan(s.player,{x:22,y:12})<=1;
      if(!site)return reply(false,0,'La resonancia se ha perdido.');
      const key=`resonance:${s.zone}`;
      if(s.events.includes(key))return reply(false,0,'Resonancia ya resuelta.');
      if(option==='resonance-stabilize'){
        if(!removeStack(s.inventory,'capacitor',1))return reply(false,0,'Necesitas un condensador.');
        s.exposure=Math.max(0,s.exposure-25);s.stats.focus=Math.min(s.stats.maxFocus,s.stats.focus+8);
        // Neutralization changes this physical floor and survives zone snapshots.
        s.fields=s.fields.filter(field=>manhattan(field,{x:22,y:12})>6);
        message(s,'RESONANCIA // El condensador absorbe la frecuencia. Exposición -25, concentración +8.');
      }else{
        s.exposure=Math.min(100,s.exposure+18);s.genome.genePoints++;
        placeField(s.fields,{x:22,y:12,kind:themeForRuin(r!.x,r!.y).hazard,ttl:5});
        // The absorbed signal wakes a real guardian, retained by the zone save.
        for(const x of [24,25,26]){
          const y=12,cell=index(x,y);
          if(!passable(s.tiles[cell]))s.tiles[cell]=':';
          if(!enemyAt(s,x,y)&&!(s.player.x===x&&s.player.y===y)){
            s.enemies.push({id:`resonance-guardian-${s.zone}`,kind:'drone',x,y,hp:ENEMY_DEFS.drone.hp,mode:'hunting',lastKnown:{...s.player},searchTurns:3});
            message(s,'GUARDIÁN DESPERTADO // Un cazador de ferrita responde a la señal.');
            break;
          }
        }
        message(s,'RESONANCIA // La frecuencia entra en tu carne. +1 gen, exposición +18; el suelo despierta.');
      }
      s.events.push(key);advance(s,100);return reply(true,100,'Decisión de resonancia registrada.');
    }
    if(option==='finale-bind'||option==='finale-release'||option==='finale-erase'){
      const choice=option.slice(7) as FinaleChoice;
      const p=campaignProgress(s);
      if(s.zone!=='zero-3'||!p.ready||!p.finaleAwakened||p.ending||s.enemies.some(e=>e.id===FINAL_GUARDIAN_ID&&e.hp>0))
        return reply(false,0,'El corazón todavía no acepta esa decisión.');
      const ending=endingStory(choice,s.quest.outcome==='broadcast'?'broadcast':'isolate');
      s.events.push(FINALE_EVENT_PREFIX+choice);
      if(choice==='bind'){s.reputation.concordia+=8;s.exposure=Math.max(0,s.exposure-30);}
      if(choice==='release'){s.genome.genePoints+=2;s.reputation.ferral+=4;}
      if(choice==='erase'){s.exposure=0;s.reputation.concordia+=3;s.reputation.ferral+=3;}
      message(s,'CAMPAÑA COMPLETADA // '+ending.title);
      message(s,ending.description);
      return reply(true,0,'Epílogo desbloqueado: '+ending.title);
    }
    if(option==='accept-task'&&task){
      if(!s.civilization.active.includes(task.id)&&!s.civilization.completed.includes(task.id))s.civilization.active.push(task.id);
      message(s,`ENCARGO REGIONAL // ${task.title}: reúne ${task.required} unidades de chatarra.`);
      return reply(true,0,'Encargo aceptado.');
    }
    if(option==='turn-in-task'&&task){
      if(!s.civilization.active.includes(task.id)||s.civilization.completed.includes(task.id)||!removeStack(s.inventory,'scrap',task.required))return reply(false,0,'Todavía necesitas los materiales del encargo.');
      s.civilization.active=s.civilization.active.filter(x=>x!==task.id);
      s.civilization.completed.push(task.id);
      s.stats.credits+=task.reward;
      s.reputation[task.faction]=(s.reputation[task.faction]??0)+4;
      message(s,`ENCARGO COMPLETADO // ${task.title}. ${task.reward} créditos y reputación +4 con ${task.faction}.`);
      advance(s,100);return reply(true,100,'Encargo completado.');
    }
    if(option==='regional-market')return reply(true,0,'Mercancías regionales disponibles.');
    if(option==='shop'){s.dialogue={speaker:'Mercado Ferral',text:`Créditos: ${s.stats.credits}. Cada compra y venta altera inventario y caja.`,options:[{id:'market-done',label:'Cerrar el mercado.'}]};return reply(true,0,'Mercancías disponibles.');}
    if(option==='enter-building')return dispatch(s,{type:'enter-settlement'});
    if(option==='go-down'){changeZone(s,'zero-1');advance(s,100);return reply(true,100,'Has descendido a CERO-7.');}
    if(option==='accept'){s.quest.status='active';message(s,'MISIÓN INICIADA // Eco bajo la sal. Encuentra la Torre del Nudo (79,13).');}
    else if(option==='ask')message(s,'Mara: «Busca una antena al noreste. Oren conoce las piezas antiguas».');
    else if(option==='fuse'){s.quest.fuseFound=true;message(s,'OBJETO CLAVE // Fusible cerámico recuperado.');}
    else if(option==='broadcast'||option==='isolate'){
      s.quest.outcome=option;s.quest.status='signal-found';
      message(s,option==='broadcast'?'La señal se libera. A lo lejos, una radio contesta con tu propia voz.':'La torre enmudece. Por un instante, todas tus sombras apuntan hacia arriba.');
      message(s,'MISIÓN // Vuelve a informar a Mara Venn en Faro Ciego.');
      advance(s,100);return reply(true,100,'Decisión registrada.');
    }else if(option==='finish'){s.quest.status='completed';message(s,`MISIÓN COMPLETADA // Eco bajo la sal (${s.quest.outcome==='broadcast'?'transmisión':'aislamiento'}).`);message(s,'ACTO II // La torre era un aviso: ocho ruinas contienen archivos de la conciencia de Nácar. Abre el diario (J).');}
    else if(option==='rumor')message(s,'Sira: «Hay una máquina que fabrica recuerdos. Nadie sabe para quién».');
    else if(option==='echo')message(s,'Keth-9: «El mensaje llegó 17 años antes de ser emitido».');
    return reply(true,0,'Elección registrada.');
  }
  if(s.dialogue)return reply(false,0,'Cierra la conversación para continuar.');
  if(s.stats.hp<=0){return reply(false,0,'Has caído. Carga tu partida o inicia una nueva.');}
  if(command.type==='enter-settlement'){
    const destination=interiorForSector(s.zone);
    if(!destination||manhattan(s.player,{x:48,y:32})>3)return reply(false,0,'Acércate al edificio principal del enclave (48,32).');
    changeZone(s,destination);advance(s,100);return reply(true,100,'Has entrado en la casa comunal.');
  }
  if(command.type==='leave-settlement'){
    const exterior=exteriorForInterior(s.zone);
    if(!exterior||manhattan(s.player,{x:30,y:25})>2)return reply(false,0,'Acércate a la puerta sur (30,25).');
    changeZone(s,exterior);advance(s,100);return reply(true,100,'Has regresado a las calles del enclave.');
  }
  if(command.type==='harvest'){
    if(!coordsForZone(s.zone))return reply(false,0,'Solo puedes recolectar en la superficie.');
    if(!s.ecology.seededZones.includes(s.zone)){
      const coords=coordsForZone(s.zone)!;
      const nodes=seedResources(s.seed,s.zone,s.tiles,(x,y)=>biomeAt(s.seed,x,y));
      s.ecology.nodes.push(...nodes);s.ecology.seededZones.push(s.zone);
    }
    const node=s.ecology.nodes.find(n=>n.zone===s.zone&&n.quantity>0&&manhattan(n,s.player)<=1);
    if(!node)return reply(false,0,'No detectas un depósito recolectable cerca. Explora o utiliza I para inspeccionar.');
    node.quantity--;
    const info=RESOURCE_INFO[node.kind];addStack(s.inventory,info.product,info.amount);
    message(s,`RECOLECCIÓN // ${info.name}: ${ITEM_DEFS[info.product].name} ×${info.amount}.`);
    advance(s,100);return reply(true,100,'Recurso recolectado.');
  }
  if(command.type==='craft'){
    const recipe=RECIPES.find(r=>r.id===command.recipe);
    if(!recipe)return reply(false,0,'Receta desconocida.');
    if(!Object.entries(recipe.ingredients).every(([id,n])=>stackCount(s.inventory,id as ItemId)>=(n??0)))return reply(false,0,'No dispones de los materiales de esta receta.');
    for(const [id,n] of Object.entries(recipe.ingredients))removeStack(s.inventory,id as ItemId,n??0);
    addStack(s.inventory,recipe.product,recipe.amount);
    message(s,`FABRICACIÓN // ${recipe.name}: ${ITEM_DEFS[recipe.product].name} ×${recipe.amount}.`);
    advance(s,100);return reply(true,100,'Objeto fabricado.');
  }
  if(command.type==='regional-trade'){
    const merchant=nearbyCitizen(s),task=localTask(s);
    if(!merchant||merchant.role!=='mercader'||!task)return reply(false,0,'Acércate al intendente ($).');
    const cost=priceFor(command.item,command.side,s.reputation[task.faction]??0,task.sector);
    if(cost===null)return reply(false,0,'El puesto no comercia ese recurso.');
    if(command.side==='buy'){
      if(s.stats.credits<cost)return reply(false,0,`Necesitas ${cost} créditos.`);
      s.stats.credits-=cost;addStack(s.inventory,command.item,1);
    }else{
      if(!removeStack(s.inventory,command.item,1))return reply(false,0,'No tienes ese recurso.');
      s.stats.credits+=cost;
    }
    message(s,`MERCADO REGIONAL // ${command.side==='buy'?'Compra':'Venta'} de ${ITEM_DEFS[command.item].name}: ${cost} créditos.`);
    advance(s,100);return reply(true,100,'Transacción registrada.');
  }
  if(command.type==='explore'){
    const coords=coordsForZone(s.zone);
    if(!coords)return reply(false,0,'No puedes viajar directamente desde el subsuelo.');
    const story=SECTORS.find(v=>v.x===coords.x&&v.y===coords.y)!;
    const text=`CARTA DE RUTA // ${story.name}: ${story.description} Facción: ${story.faction}. Riesgo ${story.danger}/3. ${s.zone!=='surface'?'Ruina regional en (72,47): pulsa N para descender. ':''}Para cruzar de sector, alcanza un borde del mapa por el camino principal.`;
    message(s,text);return reply(true,0,text);
  }
  if(command.type==='descend'||command.type==='ascend'){
    if(command.type==='descend'){
      if(s.zone==='surface'){
        if(manhattan(s.player,{x:62,y:44})>1)return reply(false,0,'Busca la escotilla CERO-7, coordenadas 62,44.');
        changeZone(s,'zero-1');
      }else if(coordsForZone(s.zone)){
        if(manhattan(s.player,{x:72,y:47})>1)return reply(false,0,'Busca la entrada a la ruina regional en (72,47).');
        const coords=coordsForZone(s.zone)!;changeZone(s,ruinId(coords.x,coords.y,1));
      }else if(parseRuin(s.zone)){
        const r=parseRuin(s.zone)!;
        if(r.depth===2||manhattan(s.player,{x:14,y:10})>1)return reply(false,0,'El terminal de descenso está en (14,10) en el primer estrato.');
        changeZone(s,ruinId(r.x,r.y,2));
      }
      else if(s.zone!=='zero-3'&&manhattan(s.player,{x:14,y:10})<=1)changeZone(s,s.zone==='zero-1'?'zero-2':'zero-3');
      else return reply(false,0,'Acércate al terminal T de la planta actual.');
    }else{
      if(coordsForZone(s.zone)||manhattan(s.player,{x:10,y:10})>1)return reply(false,0,'La salida está junto a la compuerta + (10,10).');
      const ruin=parseRuin(s.zone);
      if(ruin)changeZone(s,ruin.depth===2?ruinId(ruin.x,ruin.y,1):zoneForSector(ruin.x,ruin.y));
      else changeZone(s,s.zone==='zero-1'?'surface':s.zone==='zero-2'?'zero-1':'zero-2');
    }
    advance(s,100);return reply(true,100,'Tránsito completado.');
  }
  if(command.type==='trade'){
    if(s.zone!=='surface'||![{x:10,y:36},{x:71,y:37}].some(p=>nearby(s.player,p)))return reply(false,0,'Solo puedes comerciar junto a Kala o Ida.');
    const price=MARKET[command.item];if(!price)return reply(false,0,'Este artículo no se negocia.');
    if(command.side==='buy'){
      const cost=Math.max(1,price.buy-Math.min(3,Math.max(0,s.reputation.ferral)));
      if(s.stats.credits<cost)return reply(false,0,`Necesitas ${cost} créditos.`);
      s.stats.credits-=cost;addStack(s.inventory,command.item,1);message(s,`COMERCIO // Compras ${ITEM_DEFS[command.item].name} por ${cost} créditos.`);
    }else{
      if(!removeStack(s.inventory,command.item,1))return reply(false,0,'No tienes ese artículo.');
      s.stats.credits+=price.sell;message(s,`COMERCIO // Vendes ${ITEM_DEFS[command.item].name} por ${price.sell} créditos.`);
    }
    s.reputation.ferral=Math.min(20,s.reputation.ferral+1);
    advance(s,100);return reply(true,100,'Intercambio efectuado.');
  }
  if(command.type==='unlock'){
    if(!Object.hasOwn(MUTATIONS,command.mutation))return reply(false,0,'Mutación desconocida.');
    if(!unlock(s.genome,command.mutation))return reply(false,0,'Mutación ya aprendida o puntos genéticos insuficientes.');
    const def=MUTATIONS[command.mutation];message(s,`EVOLUCIÓN // Has desarrollado ${def.name}.`);
    return reply(true,0,`Mutación desbloqueada: ${def.name}.`);
  }
  if(command.type==='cast'){
    const id=command.mutation;
    if(!Object.hasOwn(MUTATIONS,id)||!knows(s.genome,id)||MUTATIONS[id].passive)return reply(false,0,'Poder no aprendido.');
    const def=MUTATIONS[id],cooldown=s.genome.cooldowns[id]??0;
    if(cooldown>0)return reply(false,0,`Poder en recuperación: ${cooldown} turnos.`);
    const cost=def.focus+(id==='kinetic-pulse'&&knows(s.genome,'dermal-plates')?1:0);
    if(s.stats.focus<cost)return reply(false,0,`Concentración insuficiente (${cost} requerida).`);
    if(id==='kinetic-pulse'||id==='pyrokinesis'){
      const range=id==='kinetic-pulse'?4:6;
      const candidates=visibleTargets(s).filter(e=>manhattan(e,s.player)<=range);
      const enemy=candidates.find(e=>e.id===s.targetId)??candidates[0];
      if(!enemy)return reply(false,0,`Necesitas un enemigo visible a ${range} casillas o menos.`);
      if(id==='kinetic-pulse'){
        const damage=Math.max(1,3+Math.floor(s.stats.level/2)-ENEMY_DEFS[enemy.kind].armor);
        enemy.hp=Math.max(0,enemy.hp-damage);enemy.stunned=Math.max(enemy.stunned??0,1);
        const dx=Math.sign(enemy.x-s.player.x),dy=Math.sign(enemy.y-s.player.y);
        const push=(Math.abs(dx)>Math.abs(dy))?{x:enemy.x+dx,y:enemy.y}:{x:enemy.x,y:enemy.y+dy};
        if(enemy.hp>0&&within(push.x,push.y)&&passable(s.tiles[index(push.x,push.y)])&&!enemyAt(s,push.x,push.y)&&!ACTORS.some(a=>a.x===push.x&&a.y===push.y)&&!(s.zone==='surface'&&inFaro(push))){
          enemy.x=push.x;enemy.y=push.y;
        }
        message(s,`PULSO CINÉTICO // ${ENEMY_DEFS[enemy.kind].name} sufre ${damage} PV, retrocede y queda aturdido.`);
      }else{
        enemy.hp=Math.max(0,enemy.hp-2);enemy.stunned=Math.max(enemy.stunned??0,1);
        // Burning an active spore cloud causes a short-lived flash and consumes its fuel.
        const volatile=s.fields.some(f=>f.x===enemy.x&&f.y===enemy.y&&f.kind==='spores');
        if(volatile){
          s.fields=s.fields.filter(f=>!(f.x===enemy.x&&f.y===enemy.y&&f.kind==='spores'));
          const bonus=3;enemy.hp=Math.max(0,enemy.hp-bonus);
          message(s,'REACCIÓN // Ignición de esporas: explosión biológica (+3 daño).');
        }
        placeField(s.fields,{x:enemy.x,y:enemy.y,kind:'fire',ttl:4});
        message(s,'IGNICIÓN // Una memoria incendiada prende bajo la criatura. El fuego persistirá.');
      }
      if(enemy.hp===0)killEnemy(s,enemy);
    }else if(id==='neural-shock'){
      const enemies=s.enemies.filter(e=>e.hp>0&&manhattan(e,s.player)<=3&&s.visible[index(e.x,e.y)]===1);
      if(!enemies.length)return reply(false,0,'No hay criaturas próximas que perciban el grito.');
      for(const e of enemies)e.stunned=Math.max(e.stunned??0,2);
      message(s,`GRITO NEURAL // ${enemies.length} criatura(s) quedan paralizadas durante 2 turnos.`);
    }else if(id==='phase-step'){
      const {dx,dy}=s.genome.facing;let nx=s.player.x,ny=s.player.y,moved=0;
      for(let n=0;n<2;n++){
        const x=nx+dx,y=ny+dy;
        if(!within(x,y)||!passable(s.tiles[index(x,y)])||enemyAt(s,x,y)||ACTORS.some(a=>a.x===x&&a.y===y))break;
        nx=x;ny=y;moved++;
      }
      if(!moved)return reply(false,0,'El espacio está bloqueado en la dirección elegida.');
      s.player={x:nx,y:ny};revealLandmark(s);
      message(s,`PASO DE FASE // La realidad se pliega: avanzas ${moved} casillas.`);
    }
    s.stats.focus-=cost;s.genome.cooldowns[id]=def.cooldown+1;
    advance(s,100);return reply(true,100,`Has utilizado ${def.name}.`);
  }
  if(command.type==='scan'){
    const biome=biomeAt(s.seed,s.player.x,s.player.y);
    if(s.stats.focus<4){message(s,'ESCÁNER // Concentración insuficiente: necesitas 4.');return reply(false,0,'Concentración insuficiente.');}
    s.stats.focus-=4;
    const first=!s.biomeNotes.includes(biome);
    if(first){
      s.biomeNotes.push(biome);awardExperience(s,3);
      message(s,`ARCHIVO RECUPERADO // ${BIOMES[biome].name}: ${BIOMES[biome].lore}`);
      message(s,'SONDEO // Primer registro del bioma. +3 experiencia.');
    }else message(s,`SONDEO // ${BIOMES[biome].sound} No hay registros nuevos.`);
    advance(s,100);return reply(true,100,'Sondeo completado.');
  }
  if(command.type==='inspect'){
    if(coordsForZone(s.zone)&&!s.ecology.seededZones.includes(s.zone)){
      s.ecology.nodes.push(...seedResources(s.seed,s.zone,s.tiles,(x,y)=>biomeAt(s.seed,x,y)));
      s.ecology.seededZones.push(s.zone);
    }
    const tile=tileAt(s,s.player.x,s.player.y);
    const foe=visibleTargets(s)[0];
    const biome=biomeAt(s.seed,s.player.x,s.player.y);
    const text=`POS ${s.player.x},${s.player.y} · ${BIOMES[biome].name} · TERRENO ${tile==='!'?'ANOMALÍA PELIGROSA':tile===':'?'sendero':tile==='.'?'sal petrificada':tile==='~'?'salmuera':tile==='+'?'compuerta':tile==='*'?'matorral':tile??'desconocido'} · ${WEATHER[weatherAt(s.seed,s.tick,biome)].name} · exposición ${s.exposure}%.${foe?' AMENAZA: '+ENEMY_DEFS[foe.kind].name+' ('+foe.hp+' PV).':''}`;
    const near=s.ecology.nodes.find(n=>n.zone===s.zone&&n.quantity>0&&manhattan(n,s.player)<=1);
    const decorated=text+(near?` · DEPÓSITO: ${RESOURCE_INFO[near.kind].name}. Pulsa K para recolectar.`:'');
    message(s,decorated);return reply(true,0,decorated);
  }
  if(command.type==='target'){
    const targets=visibleTargets(s);
    if(targets.length===0){s.targetId=null;return reply(false,0,'No hay enemigos visibles.');}
    const i=targets.findIndex(e=>e.id===s.targetId);const next=targets[(i+1)%targets.length];s.targetId=next.id;
    const text=`OBJETIVO // ${ENEMY_DEFS[next.kind].name} · ${next.hp} PV · distancia ${manhattan(s.player,next)}.`;
    message(s,text);return reply(true,0,text);
  }
  if(command.type==='fire'||command.type==='attack'){
    const ranged=command.type==='fire';
    const targets=visibleTargets(s).filter(e=>manhattan(s.player,e)<= (ranged?(ITEM_DEFS[s.equipment.ranged].range??1):1));
    const selected=targets.find(e=>e.id===s.targetId)??targets[0];
    if(!selected){message(s,ranged?'No hay objetivo a tiro.':'No hay enemigo adyacente.');return reply(false,0,'Sin objetivo.');}
    s.targetId=selected.id;
    return attackEnemy(s,selected,ranged);
  }
  if(command.type==='swap'){
    s.equipment.active=s.equipment.active==='melee'?'ranged':'melee';
    const text=`ARMA ACTIVA // ${ITEM_DEFS[s.equipment[s.equipment.active]].name}.`;
    message(s,text);return reply(true,0,text);
  }
  if(command.type==='equip'){
    const item=command.item,def=ITEM_DEFS[item];
    if(!def||stackCount(s.inventory,item)===0)return reply(false,0,'No posees este equipo.');
    if(item==='blade')s.equipment.melee=item;
    else if(item==='pistol'||item==='rifle')s.equipment.ranged=item;
    else if(item==='coat'||item==='shell-armor')s.equipment.armor=item;
    else return reply(false,0,'Este objeto no puede equiparse.');
    message(s,`EQUIPADO // ${def.name}.`);advance(s,100);return reply(true,100,'Equipo actualizado.');
  }
  if(command.type==='heal'){
    if(s.stats.hp>=s.stats.maxHp)return reply(false,0,'Ya tienes la salud completa.');
    if(!removeStack(s.inventory,'medkit',1))return reply(false,0,'No tienes ampollas reconstituyentes.');
    const healed=Math.min(12,s.stats.maxHp-s.stats.hp);s.stats.hp+=healed;
    message(s,`MEDICINA // Recuperas ${healed} puntos de vitalidad.`);advance(s,100);return reply(true,100,'Ampolla consumida.');
  }
  if(command.type==='pickup'){
    const loot=s.ground.filter(g=>g.x===s.player.x&&g.y===s.player.y);
    if(!loot.length){message(s,'No hay objetos en esta posición.');return reply(false,0,'No hay botín.');}
    for(const drop of loot){addStack(s.inventory,drop.item,drop.count);message(s,`BOTÍN // ${ITEM_DEFS[drop.item].name} ×${drop.count}.`);}
    s.ground=s.ground.filter(g=>!loot.includes(g));advance(s,100);return reply(true,100,'Objetos recogidos.');
  }
  if(command.type==='interact'){
    // The late-game heart console is part of the original third level.
    // Event flags keep the entire finale backwards compatible with v11 save files.
    if(s.zone==='zero-3'&&manhattan(s.player,{x:14,y:10})<=1){
      const p=campaignProgress(s);
      if(p.ending){
        const choice=p.ending as FinaleChoice;
        const ending=endingStory(choice,s.quest.outcome==='broadcast'?'broadcast':'isolate');
        s.dialogue={speaker:'ARCHIVO DE EPÍLOGO',text:ending.description,options:[{id:'leave',label:'Continuar explorando Nácar'}]};
        return reply(true,0,'El epílogo permanece en la memoria de Nácar.');
      }
      if(!p.ready){
        message(s,`EL CORAZÓN // Bloqueo: ${p.archives}/8 reliquias, ${p.guardians}/8 custodios; ${p.prologueDone?'prólogo completado':'regresa primero con Mara'}.`);
        return reply(false,0,'Faltan archivos para acceder al corazón.');
      }
      if(!p.finaleAwakened){
        s.events.push('campaign:awakened');
        // The guardian uses the normal turn-based AI and is persisted in zone snapshots.
        const spawn={x:19,y:12};s.tiles[index(spawn.x,spawn.y)]='.';
        if(!s.enemies.some(e=>e.id===FINAL_GUARDIAN_ID))
          s.enemies.push({id:FINAL_GUARDIAN_ID,kind:'drone',x:spawn.x,y:spawn.y,hp:ENEMY_DEFS.drone.hp*3,mode:'hunting',lastKnown:{...s.player},searchTurns:6});
        message(s,'ACTO V // El custodio de las ocho memorias emerge de la cámara. Ninguna decisión será posible mientras permanezca en pie.');
        refreshVisibility(s);
        return reply(true,0,'El custodio del corazón ha despertado.');
      }
      if(s.enemies.some(e=>e.id===FINAL_GUARDIAN_ID&&e.hp>0))
        return reply(false,0,'El custodio del corazón todavía vive. Derrota al guardián.');
      const signal=s.quest.outcome==='broadcast'?'La frecuencia liberada continúa creciendo.':'La frecuencia aislada está intentando escapar.';
      s.dialogue={speaker:'EL CORAZÓN DE NÁCAR',text:`${signal} Los ocho testigos ocupan sus lugares. El corazón te pregunta qué clase de mundo merece sobrevivir.`,options:[
        {id:'finale-bind',label:'ENCADENAR: proteger el mundo y permanecer como guardián.'},
        {id:'finale-release',label:'LIBERAR: devolver las voces a la humanidad, aunque todo mute.'},
        {id:'finale-erase',label:'BORRAR: destruir el registro y sacrificar tu propio recuerdo.'},
        {id:'leave',label:'Todavía no estoy preparado.'}
      ]};
      return reply(true,0,'La última decisión de Nácar está en tus manos.');
    }
    const r=parseRuin(s.zone);
    if(r&&manhattan(s.player,{x:20,y:12})<=1){
      const theme=themeForRuin(r.x,r.y);
      const key=`relic:${r.x}:${r.y}:${r.depth}`;
      if(!s.events.includes(key)){
        s.events.push(key);
        const credits=r.depth===2?24:8;
        s.stats.credits+=credits;
        if(r.depth===2){s.genome.genePoints+=1;addStack(s.inventory,'capacitor',1);}
        message(s,`RELIQUIA // ${theme.reward}. ${theme.lore}`);
        message(s,`RECUPERACIÓN // +${credits} créditos${r.depth===2?', +1 punto genético y condensador':''}.`);
        advance(s,100);
        return reply(true,100,`Artefacto recuperado: ${theme.reward}.`);
      }
      message(s,`ARCHIVO DEL SITIO // ${theme.lore} Ya has recuperado la reliquia.`);
      return reply(true,0,'Este archivo ya está documentado.');
    }
    if(r&&r.depth===2&&manhattan(s.player,{x:22,y:12})<=1){
      const key=`resonance:${s.zone}`;
      if(!s.events.includes(key)){
        const theme=themeForRuin(r.x,r.y);
        s.dialogue={speaker:'Resonancia de Nácar',text:`${theme.lore} La frecuencia te ofrece dos opciones: estabilizarla con un condensador o absorberla a costa de tu cuerpo.`,options:[
          {id:'resonance-stabilize',label:'Estabilizar: gastar 1 condensador, sanar exposición y recuperar concentración.'},
          {id:'resonance-harvest',label:'Absorber: +1 gen, +18 exposición y peligro ambiental.'},
          {id:'leave',label:'Alejarse de la resonancia.'}
        ]};
        return reply(true,0,'Resonancia descubierta.');
      }
      return reply(true,0,'La resonancia ya ha sido resuelta.');
    }
    if(r&&r.depth===2&&manhattan(s.player,{x:26,y:12})<=1){
      const key=`elite-cache:${s.zone}`;
      if(s.events.includes(key)){
        message(s,'ARCHIVO // El registro del custodio ya está recuperado.');
        return reply(true,0,'Registro ya recuperado.');
      }
      if(s.enemies.some(e=>e.id===`elite-${r.x}-${r.y}-2`&&e.hp>0)){
        message(s,'SEGURIDAD // El custodio de Nácar protege el archivo. Elimina al guardián para recuperarlo.');
        return reply(false,0,'El custodio todavía vigila el archivo.');
      }
      s.events.push(key);
      s.stats.credits+=15;
      addStack(s.inventory,'capacitor',1);
      message(s,`ARCHIVO ÚNICO // ${themeForRuin(r.x,r.y).reward}: +15 créditos y 1 condensador.`);
      advance(s,100);
      return reply(true,100,'Archivo del custodio recuperado.');
    }
    const citizen=nearbyCitizen(s);
    if(citizen){talkToCitizen(s,citizen);return reply(true,0,`Conversando con ${citizen.name}.`);}
    if(exteriorForInterior(s.zone))return dispatch(s,{type:'leave-settlement'});
    if(!coordsForZone(s.zone)){
      if(manhattan(s.player,{x:14,y:10})<=1&&s.zone!=='zero-3')return dispatch(s,{type:'descend'});
      if(manhattan(s.player,{x:10,y:10})<=1)return dispatch(s,{type:'ascend'});
      return reply(false,0,'Señales ilegibles. Usa N para descender en el terminal o P para ascender en la compuerta.');
    }
    const sector=coordsForZone(s.zone);
    if(sector&&s.zone!=='surface'&&manhattan(s.player,{x:48,y:32})<=1){
      const info=SECTORS.find(v=>v.x===sector.x&&v.y===sector.y)!;
      const key=`enclave:${s.zone}`;
      if(!s.events.includes(key)){s.events.push(key);s.reputation[info.faction]=(s.reputation[info.faction]??0)+2;s.stats.credits+=8;message(s,`DESCUBRIMIENTO // Enclave de ${info.faction}. Reputación +2 y 8 créditos recuperados.`);}
      s.dialogue={speaker:`Enclave de ${info.name}`,text:`${info.description} Los moradores desconfían de la frecuencia antigua. ${s.events.includes(key)?'Tu hallazgo está registrado en su memoria.':''}`,options:[{id:'enter-building',label:'Entrar en la casa comunal.'},{id:'leave',label:'Seguir explorando.'}]};
      return reply(true,0,'Enclave descubierto.');
    }
    const actor=nearbyActor(s);
    if(actor){openActor(s,actor);return reply(true,0,`Conversando con ${actor.name}.`);}
    const feature=s.zone==='surface'?LANDMARKS.slice(1).find(p=>nearby(s.player,p)):undefined;
    if(feature){openLandmark(s,feature.id);return reply(true,0,`Examinando ${feature.name}.`);}
    const text='Nada con lo que interactuar. Acércate a un personaje o a una estructura.';
    message(s,text);return reply(false,0,text);
  }
  if(command.type==='wait'){
    advance(s,100);const text='Esperas un turno. Algo se mueve más allá de la sal.';message(s,text);return reply(true,100,text);
  }
  if(command.type!=='move')return reply(false,0,'Comando desconocido.');
  const {dx,dy}=command;
  if(!Number.isInteger(dx)||!Number.isInteger(dy)||Math.abs(dx)+Math.abs(dy)!==1)return reply(false,0,'Desplazamiento no válido.');
  const nx=s.player.x+dx,ny=s.player.y+dy;
  const coords=coordsForZone(s.zone);
  if(coords&&(nx<=0||ny<=0||nx>=WIDTH-1||ny>=HEIGHT-1)){
    const wx=coords.x+(nx<=0?-1:nx>=WIDTH-1?1:0),wy=coords.y+(ny<=0?-1:ny>=HEIGHT-1?1:0);
    if(!SECTORS.some(v=>v.x===wx&&v.y===wy))return reply(false,0,'Más allá solo hay regiones todavía inaccesibles.');
    const to=zoneForSector(wx,wy);changeZone(s,to);
    const arrival={x:nx<=0?WIDTH-2:nx>=WIDTH-1?1:s.player.x,y:ny<=0?HEIGHT-2:ny>=HEIGHT-1?1:s.player.y};
    const position={x:Math.max(1,Math.min(WIDTH-2,arrival.x)),y:Math.max(1,Math.min(HEIGHT-2,arrival.y))};
    // Keep the matching connecting road passable even after a previously saved sector was modified.
    if(!passable(s.tiles[index(position.x,position.y)]))s.tiles[index(position.x,position.y)]=':';
    s.player=position;refreshVisibility(s);
    const info=SECTORS.find(v=>v.x===wx&&v.y===wy)!;
    const key=`visited:${to}`;
    if(!s.events.includes(key)){s.events.push(key);message(s,`NUEVA REGIÓN // ${info.name}. ${info.description}`);}
    advance(s,100);return reply(true,100,`Llegada a ${info.name}.`);
  }
  const tile=tileAt(s,nx,ny);
  if(!tile||!passable(tile)){const text='El terreno te impide avanzar.';message(s,text);return reply(false,0,text);}
  const citizenAt=settlementCitizens(s.zone,s.tick).find(c=>c.x===nx&&c.y===ny);
  if(citizenAt){talkToCitizen(s,citizenAt);return reply(true,0,`Conversando con ${citizenAt.name}.`);}
  const actor=s.zone==='surface'?ACTORS.find(a=>a.x===nx&&a.y===ny):undefined;
  if(actor){openActor(s,actor);return reply(true,0,`Conversando con ${actor.name}.`);}
  const foe=enemyAt(s,nx,ny);
  if(foe){s.targetId=foe.id;return attackEnemy(s,foe,s.equipment.active==='ranged');}
  s.player={x:nx,y:ny};s.genome.facing={dx,dy};advance(s,100);revealLandmark(s);
  if(s.ground.some(g=>g.x===nx&&g.y===ny))message(s,'BOTÍN EN EL SUELO // Pulsa G para recoger.');
  if(s.zone==='surface'&&tile==='+'&&s.tick%300===0)message(s,'Una compuerta oxidada vibra al paso.');
  if(s.zone==='surface'&&tile==='o'&&s.tick%600===0)message(s,'La piedra registra una vibración que no has producido.');
  return reply(true,100,'Movimiento realizado.');
}
export function formatClock(tick:number):string { const mins=Math.floor(tick/100);return `${String((7+Math.floor(mins/60))%24).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`; }
export function serialize(s:GameState):string{
  const {visible: _visible,dialogue: _dialogue,...stored}=s;
  return JSON.stringify(stored);
}
/** Migration keeps all v0.1 terrain, discovery, quest state and world clock. */
export function deserialize(raw:string):GameState{
  let data:unknown;
  try{data=JSON.parse(raw);}catch{throw new Error('Guardado ilegible o corrupto.');}
  if(!data||typeof data!=='object')throw new Error('Guardado inválido.');
  const s=data as Omit<Partial<GameState>,"version"> & {version?:number};
  if(s.version!==2&&s.version!==3&&s.version!==4&&s.version!==5&&s.version!==6&&s.version!==7&&s.version!==8&&s.version!==9&&s.version!==10&&s.version!==11)throw new Error('Versión de guardado incompatible (admite formatos de v0.1 a v1.0).');
  if(!Number.isSafeInteger(s.seed)||!Number.isInteger(s.rngState)||!Number.isSafeInteger(s.tick)||s.tick!<0)throw new Error('Metadatos de guardado dañados.');
  if(!s.player||!Number.isInteger(s.player.x)||!Number.isInteger(s.player.y)||!within(s.player.x,s.player.y))throw new Error('Posición inválida.');
  const validTile=(t:unknown):t is Tile=>typeof t==='string'&&['#','.',':','~','^','*','+','=','o','T','x',',',';','v','&','%','?','!'].includes(t);
  if(!Array.isArray(s.tiles)||s.tiles.length!==WIDTH*HEIGHT||!s.tiles.every(validTile)||!passable(s.tiles[index(s.player.x,s.player.y)]))throw new Error('Mapa corrupto.');
  if(!Array.isArray(s.seen)||s.seen.length!==WIDTH*HEIGHT||!s.seen.every(v=>v===0||v===1))throw new Error('Memoria del mapa corrupta.');
  if(!Array.isArray(s.log)||s.log.length>MSG_LIMIT||!s.log.every(v=>typeof v==='string'&&v.length<2000))throw new Error('Bitácora inválida.');
  if(!s.quest||!['undiscovered','active','signal-found','completed'].includes(s.quest.status)||!['none','broadcast','isolate'].includes(s.quest.outcome)||typeof s.quest.fuseFound!=='boolean')throw new Error('Misión inválida.');
  if(!Array.isArray(s.discoveries)||!s.discoveries.every(v=>typeof v==='string'&&LANDMARKS.some(p=>p.id===v)))throw new Error('Descubrimientos inválidos.');
  // Version 2 is the legitimate v0.1 schema; add only new fields, never reset quest/map.
  if(s.version===2){
    const game:GameState={...s,version:11,ecology:initialEcology(),civilization:{active:[],completed:[]},zone:'surface',zones:{},reputation:{ferral:0,concordia:0},events:[],stats:{...INITIAL_STATS},inventory:INITIAL_INVENTORY.map(x=>({...x})),equipment:{...INITIAL_EQUIPMENT},enemies:spawnEnemies(s.tiles),ground:[],targetId:null,kills:0,visible:[],dialogue:null,
      genome:initialGenome(),fields:initialFields(s.seed!,s.tiles!),exposure:0,biomeNotes:[],lastBiome:biomeAt(s.seed!,s.player!.x,s.player!.y),
      lastWeather:weatherAt(s.seed!,s.tick!,biomeAt(s.seed!,s.player!.x,s.player!.y)),environmentalTurns:0} as GameState;
    if(game.zone==='surface'&&inFaro(game.player))game.log.push('MIGRACIÓN // Partida v0.1 conservada. Nuevos peligros detectados fuera de Faro Ciego.');
    refreshVisibility(game);return game;
  }
  const validItem=(v:unknown):v is ItemId=>typeof v==='string'&&Object.hasOwn(ITEM_DEFS,v);
  if(!s.stats||!['hp','maxHp','focus','maxFocus','xp','level','credits'].every(k=>Number.isSafeInteger(s.stats?.[k as keyof PlayerStats]))||s.stats.hp<0||s.stats.maxHp<1||s.stats.hp>s.stats.maxHp||s.stats.level<1||s.stats.level>200||s.stats.xp<0)throw new Error('Estadísticas inválidas.');
  if(!s.equipment||!['blade'].includes(s.equipment.melee)||!['pistol','rifle'].includes(s.equipment.ranged)||!['coat','shell-armor'].includes(s.equipment.armor)||!['melee','ranged'].includes(s.equipment.active))throw new Error('Equipo inválido.');
  if(!Array.isArray(s.inventory)||s.inventory.length>100||!s.inventory.every(v=>v&&validItem(v.id)&&Number.isSafeInteger(v.count)&&v.count>0&&v.count<=999))throw new Error('Inventario inválido.');
  if(!Array.isArray(s.enemies)||s.enemies.length>1000||!s.enemies.every(e=>e&&typeof e.id==='string'&&e.id.length<100&&Object.hasOwn(ENEMY_DEFS,e.kind)&&within(e.x,e.y)&&Number.isSafeInteger(e.hp)&&e.hp>=0&&e.hp<=1000&&['idle','hunting','searching','fleeing'].includes(e.mode)&&Number.isSafeInteger(e.searchTurns)&&e.searchTurns>=0&&e.searchTurns<=100&&(!e.lastKnown||within(e.lastKnown.x,e.lastKnown.y))))throw new Error('Enemigos inválidos.');
  if(!Array.isArray(s.ground)||s.ground.length>5000||!s.ground.every(g=>g&&typeof g.id==='string'&&g.id.length<100&&within(g.x,g.y)&&validItem(g.item)&&Number.isSafeInteger(g.count)&&g.count>0&&g.count<=999))throw new Error('Objetos de suelo inválidos.');
  if((s.targetId!==null&&typeof s.targetId!=='string')||!Number.isSafeInteger(s.kills)||s.kills!<0)throw new Error('Estado de combate inválido.');
  const bi=biomeAt(s.seed!,s.player!.x,s.player!.y);
  if(s.version===4||s.version===5||s.version===6||s.version===7||s.version>=8){
    if(!Number.isInteger(s.exposure)||s.exposure!<0||s.exposure!>100||!Number.isSafeInteger(s.environmentalTurns)||s.environmentalTurns!<0)throw new Error('Estado ambiental inválido.');
    if(!Array.isArray(s.biomeNotes)||s.biomeNotes.length>6||new Set(s.biomeNotes).size!==s.biomeNotes.length||!s.biomeNotes.every(v=>Object.hasOwn(BIOMES,v)))throw new Error('Archivo de biomas inválido.');
    if(!s.lastBiome||!Object.hasOwn(BIOMES,s.lastBiome)||!s.lastWeather||!Object.hasOwn(WEATHER,s.lastWeather))throw new Error('Atmósfera inválida.');
  }
  if(s.version===5||s.version===6||s.version===7||s.version>=8){
    const g=s.genome;
    if(!g||!Array.isArray(g.unlocked)||g.unlocked.length>9||new Set(g.unlocked).size!==g.unlocked.length||!g.unlocked.every(id=>Object.hasOwn(MUTATIONS,id))||!Number.isSafeInteger(g.genePoints)||g.genePoints<0||g.genePoints>200||!g.facing||!Number.isInteger(g.facing.dx)||!Number.isInteger(g.facing.dy)||Math.abs(g.facing.dx)+Math.abs(g.facing.dy)!==1||!g.cooldowns||typeof g.cooldowns!=='object'||Object.entries(g.cooldowns).some(([id,v])=>!Object.hasOwn(MUTATIONS,id)||!Number.isSafeInteger(v)||v<0||v>100))throw new Error('Genoma corrupto.');
    if(!Array.isArray(s.fields)||s.fields.length>96||!s.fields.every(f=>f&&within(f.x,f.y)&&['fire','electric','spores'].includes(f.kind)&&Number.isInteger(f.ttl)&&f.ttl>0&&f.ttl<=100))throw new Error('Campos ambientales corruptos.');
    if(!s.enemies!.every(e=>(e.stunned===undefined||Number.isInteger(e.stunned)&&e.stunned>=0&&e.stunned<=10)))throw new Error('Estados de criaturas corruptos.');
  }
  if(s.version===6||s.version===7||s.version>=8){
    if(!(['surface','zero-1','zero-2','zero-3'].includes(s.zone!)||coordsForZone(s.zone!)!==null||exteriorForInterior(s.zone!)!==null||parseRuin(s.zone!)!==null)||!s.zones||typeof s.zones!=='object'||!s.reputation||!Number.isInteger(s.reputation.ferral)||!Number.isInteger(s.reputation.concordia)||!Array.isArray(s.events)||s.events.length>50||!s.events.every(v=>typeof v==='string'&&v.length<80))throw new Error('Estado de regiones o facciones corrupto.');
    for(const snapshot of Object.values(s.zones)){
      if(!snapshot||!Array.isArray(snapshot.tiles)||snapshot.tiles.length!==WIDTH*HEIGHT||!snapshot.tiles.every(validTile)||!Array.isArray(snapshot.seen)||snapshot.seen.length!==WIDTH*HEIGHT||!snapshot.seen.every(v=>v===0||v===1)||!snapshot.player||!within(snapshot.player.x,snapshot.player.y)||!passable(snapshot.tiles[index(snapshot.player.x,snapshot.player.y)])||!Array.isArray(snapshot.enemies)||snapshot.enemies.length>1000||!Array.isArray(snapshot.ground)||snapshot.ground.length>5000||!Array.isArray(snapshot.fields)||snapshot.fields.length>96)throw new Error('Estado de planta corrupto.');
    }
  }
  if(s.version>=8){
    const valid=new Set(TASKS.map(t=>t.id));
    if(!s.civilization||!Array.isArray(s.civilization.active)||!Array.isArray(s.civilization.completed)||!s.civilization.active.every(k=>valid.has(k))||!s.civilization.completed.every(k=>valid.has(k))||new Set([...s.civilization.active,...s.civilization.completed]).size!==s.civilization.active.length+s.civilization.completed.length)throw new Error('Estado de civilizaciones corrupto.');
  }
  if(s.version>=9){
    const eco=s.ecology;
    if(!eco||!Array.isArray(eco.seededZones)||eco.seededZones.length>9||!eco.seededZones.every(v=>typeof v==='string'&&(v==='surface'||coordsForZone(v)!==null))||!Array.isArray(eco.nodes)||eco.nodes.length>2500||!eco.nodes.every(n=>n&&typeof n.id==='string'&&n.id.length<120&&typeof n.zone==='string'&&n.zone.length<50&&within(n.x,n.y)&&['mineral','fiber','spores','crystal'].includes(n.kind)&&Number.isInteger(n.quantity)&&n.quantity>=0&&n.quantity<=10)||!Number.isSafeInteger(eco.lastPulse)||eco.lastPulse<0||!eco.pressure||typeof eco.pressure!=='object'||Object.values(eco.pressure).some(n=>!Number.isInteger(n)||n<0||n>5)||!Array.isArray(eco.history)||eco.history.length>30||!eco.history.every(v=>typeof v==='string'&&v.length<200))throw new Error('Estado ecológico inválido.');
  }
  const game={...s,version:11,ecology:s.version>=9?s.ecology:{...initialEcology(),lastPulse:Math.floor(s.tick!/3000)},civilization:s.version>=8?s.civilization:{active:[],completed:[]},zone:s.version>=6?s.zone:'surface',zones:s.version>=6?s.zones:{},reputation:s.version>=6?s.reputation:{ferral:0,concordia:0},events:s.version>=6?s.events:[],visible:[],dialogue:null,
    genome:s.version>=5?s.genome:initialGenome(),fields:s.version>=5?s.fields:initialFields(s.seed!,s.tiles!),
    exposure:s.version>=4?s.exposure:0,
    biomeNotes:s.version>=4?s.biomeNotes:[],lastBiome:s.version>=4?s.lastBiome:bi,
    lastWeather:s.version>=4?s.lastWeather:weatherAt(s.seed!,s.tick!,bi),
    environmentalTurns:s.version>=4?s.environmentalTurns:0} as GameState;
  if(s.version===10)game.log.push('MIGRACIÓN // Ruinas temáticas desbloqueadas. Las zonas ya visitadas conservan sus mapas originales.');
  if(s.version===9)game.log.push('MIGRACIÓN // Nuevas ruinas regionales abiertas; el atlas subterráneo se ha ampliado.');
  if(s.version===8)game.log.push('MIGRACIÓN // La red ecológica comienza a reaccionar a tu presencia.');
  if(s.version===7)game.log.push('MIGRACIÓN // Los enclaves de Nácar reciben habitantes, mercados y encargos.');
  if(s.version===6)game.log.push('MIGRACIÓN // Los ocho nuevos sectores de Nácar están disponibles en los bordes del mapa.');
  if(s.version===5)game.log.push('MIGRACIÓN // Partida v0.4 conservada: las regiones CERO-7 están disponibles.');
  if(s.version===4)game.log.push('MIGRACIÓN // Partida v0.3 conservada: la mutagénesis y los campos activos están preparados.');
  if(s.version===3)game.log.push('MIGRACIÓN // Partida v0.2 conservada: el dosímetro y los biomas están activos.');
  refreshVisibility(game);return game;
}
