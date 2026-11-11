import type { EnemyKind } from './combat.js';
import type { FieldKind } from './environment.js';

/** Authored combat identities for the eight regional custodians.
 * Profiles are derived from the existing ruin id, so old saves need no migration.
 */
export type GuardianPattern='broadcast'|'sweep'|'prism-cross'|'lane'|'seal'|'bloom'|'echo'|'chorus';
export type GuardianBonus={kind:'ammo'|'medkit'|'focus'|'credits'|'heal'|'exposure'|'gene'|'capacitor';amount:number;label:string};
export interface GuardianProfile {
  x:number;y:number;name:string;kind:EnemyKind;pattern:GuardianPattern;
  field:FieldKind;period:number;range:number;warning:string;bonus:GuardianBonus;
}

export const GUARDIAN_PROFILES:readonly GuardianProfile[]=[
  {x:-1,y:-1,name:'El Repetidor',kind:'sentinel',pattern:'broadcast',field:'spores',period:3,range:6,warning:'EL REPETIDOR // Repite tu última señal: la nube aparecerá donde estás. Cambia de casilla.',bonus:{kind:'ammo',amount:3,label:'3 púas de munición'}},
  {x:0,y:-1,name:'La Maestra de Escoria',kind:'crawler',pattern:'sweep',field:'fire',period:3,range:5,warning:'LA MAESTRA // Abre una línea de escoria incandescente. Sal del corredor marcado.',bonus:{kind:'medkit',amount:1,label:'1 ampolla reconstituyente'}},
  {x:1,y:-1,name:'El Astrónomo Ciego',kind:'moth',pattern:'prism-cross',field:'electric',period:3,range:6,warning:'EL ASTRÓNOMO // Los prismas dibujan una cruz eléctrica; queda una salida sin marcar. Muévete por ella.',bonus:{kind:'focus',amount:6,label:'6 puntos de concentración'}},
  {x:-1,y:0,name:'El Capataz de Hierro',kind:'drone',pattern:'lane',field:'electric',period:4,range:7,warning:'EL CAPATAZ // Alinea los motores para descargar un corredor recto.',bonus:{kind:'credits',amount:15,label:'15 créditos de ferrita'}},
  {x:1,y:0,name:'La Notaria Cero',kind:'sentinel',pattern:'seal',field:'electric',period:4,range:5,warning:'LA NOTARIA // Marca tres salidas con arcos eléctricos y deja una ruta de fuga.',bonus:{kind:'heal',amount:8,label:'8 puntos de vitalidad'}},
  {x:-1,y:1,name:'El Jardinero de Médula',kind:'spore',pattern:'bloom',field:'spores',period:3,range:5,warning:'EL JARDINERO // Hace brotar dos nubes a ambos lados de tu posición.',bonus:{kind:'exposure',amount:12,label:'12 puntos menos de exposición'}},
  {x:0,y:1,name:'Tu Reflejo Tardío',kind:'larva',pattern:'echo',field:'spores',period:3,range:6,warning:'EL REFLEJO // La nube sigue tu trayectoria en vez de tu cuerpo. Cambia de dirección.',bonus:{kind:'gene',amount:1,label:'1 punto genético'}},
  {x:1,y:1,name:'El Coro Hueco',kind:'moth',pattern:'chorus',field:'fire',period:3,range:6,warning:'EL CORO // Un anillo de brasas cierra las diagonales a tu alrededor.',bonus:{kind:'capacitor',amount:1,label:'1 condensador de cobre'}}
];

const byCoordinates=new Map(GUARDIAN_PROFILES.map(profile=>[`${profile.x},${profile.y}`,profile]));

export function guardianProfileAt(x:number,y:number):GuardianProfile|undefined{
  return byCoordinates.get(`${x},${y}`);
}

export function guardianProfileFromId(id:string):GuardianProfile|undefined{
  const match=/^elite-(-?\d+)-(-?\d+)-2$/.exec(id);
  return match?guardianProfileAt(Number(match[1]),Number(match[2])):undefined;
}

/** A boss should live long enough to reveal its authored move at least once. */
export function guardianVitality(baseHp:number):number{
  return Math.ceil(baseHp*1.6)+4;
}
