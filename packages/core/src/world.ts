import { SeededRng } from './rng.js';
import { biomeAt, terrainHash } from './biomes.js';

export const WIDTH = 96;
export const HEIGHT = 64;
export type Tile = '#' | '.' | ':' | '~' | '^' | '*' | '+' | '=' | 'o' | 'T' | 'x' | ',' | ';' | 'v' | '&' | '%' | '?' | '!';
export interface Point { x: number; y: number }
export interface Landmark extends Point { id: string; name: string; description: string }
export interface Actor extends Point { id: string; name: string; glyph: string; color: string; role: string }
export const LANDMARKS: Landmark[] = [
  { id: 'faro', x: 32, y: 32, name: 'Faro Ciego', description: 'Un refugio de paredes corroídas que sigue respirando.' },
  { id: 'relay', x: 79, y: 13, name: 'Torre del Nudo', description: 'La antena escucha una frecuencia que precede a la Interrupción.' },
  { id: 'convoy', x: 12, y: 10, name: 'Caravana Quietud', description: 'Los restos de una caravana atrapada en cristal.' },
  { id: 'mirror', x: 77, y: 50, name: 'Campo de Espejos', description: 'La sal refleja un cielo ligeramente equivocado.' },
  { id: 'well', x: 16, y: 52, name: 'Pozo de los Nombres', description: 'La piedra parece guardar voces en su interior.' },
  { id: 'ashes', x: 8, y: 18, name: 'Observatorio Quemado', description: 'Un telescopio apunta hacia el suelo. Sus lentes todavía brillan.' },
  { id: 'furnace', x: 88, y: 26, name: 'Horno de las Nueve', description: 'Un complejo industrial emite calor sin combustible.' },
  { id: 'garden', x: 88, y: 56, name: 'Jardín Sin Raíces', description: 'Los tallos forman letras cuando nadie los mira.' },
  { id: 'vault', x: 62, y: 44, name: 'Descenso CERO-7', description: 'Una escotilla conduce a los laboratorios de las profundidades.' },
  { id: 'rift', x: 55, y: 57, name: 'Costura de Nácar', description: 'Un corte vertical en el paisaje deja ver un segundo cielo.' }
];
export const ACTORS: Actor[] = [
  { id: 'mara', name: 'Mara Venn', role: 'Cartógrafa y guardiana de la señal', x: 33, y: 30, glyph: 'M', color: '#f1c77e' },
  { id: 'oren', name: 'Oren Silt', role: 'Mecánico de antenas', x: 25, y: 32, glyph: 'O', color: '#b7d2db' },
  { id: 'sira', name: 'Sira Kael', role: 'Vendedora de mapas y rumores', x: 40, y: 32, glyph: 'S', color: '#c8b6ed' },
  { id: 'kala', name: 'Kala de Cruce 7', role: 'Mercader del puesto occidental', x: 10, y: 36, glyph: 'C', color: '#ffd17d' },
  { id: 'ida', name: 'Ida Ferral', role: 'Mercader del refugio oriental', x: 71, y: 37, glyph: 'I', color: '#b7f0ca' },
  { id: 'keth', name: 'Keth-9', role: 'Custodio sintético', x: 32, y: 39, glyph: 'K', color: '#7ad5cb' }
];
export const index = (x: number, y: number): number => y * WIDTH + x;
export function within(x: number, y: number): boolean { return x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT; }
export function blocksSight(tile: Tile): boolean { return tile === '#' || tile === '^'; }
export function passable(tile: Tile): boolean { return tile !== '#' && tile !== '^' && tile !== '~'; }

export function generateWorld(seed: number): Tile[] {
  const rng = new SeededRng(seed);
  const tiles = new Array<Tile>(WIDTH * HEIGHT);
  for (let y = 0; y < HEIGHT; y++) for (let x = 0; x < WIDTH; x++) {
    const n = rng.next();
    const edge = x === 0 || y === 0 || x === WIDTH - 1 || y === HEIGHT - 1;
    tiles[index(x, y)] = edge ? '#' : n < 0.042 ? '#' : n < 0.075 ? '^' : n < 0.099 ? '~' : n < 0.15 ? '*' : '.';
  }
  const put = (x: number, y: number, tile: Tile) => { if (within(x, y) && x > 0 && y > 0 && x < WIDTH - 1 && y < HEIGHT - 1) tiles[index(x, y)] = tile; };
  const plaza = (x1: number, y1: number, x2: number, y2: number, tile: Tile = '.') => {
    for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) put(x, y, tile);
  };
  const path = (a: Point, b: Point) => {
    let {x, y} = a;
    while (x !== b.x) { put(x, y, ':'); x += x < b.x ? 1 : -1; }
    while (y !== b.y) { put(x, y, ':'); y += y < b.y ? 1 : -1; }
    put(x, y, ':');
  };
  path({x:32,y:32}, {x:79,y:13});
  path({x:32,y:32}, {x:12,y:10});
  path({x:32,y:32}, {x:77,y:50});
  path({x:32,y:32}, {x:16,y:52});
  // Every location has clear terrain around it, and its event glyph is reachable.
  for (const p of LANDMARKS.slice(1)) plaza(p.x - 2, p.y - 2, p.x + 2, p.y + 2);
  // Settlement palisade and gatehouses.
  plaza(18, 21, 47, 43);
  for (let x = 18; x <= 47; x++) { put(x, 21, '#'); put(x, 43, '#'); }
  for (let y = 21; y <= 43; y++) { put(18, y, '#'); put(47, y, '#'); }
  put(32, 21, '+'); put(32, 43, '+'); put(18, 32, '+'); put(47, 32, '+');
  for (let x = 19; x < 47; x++) put(x, 32, ':');
  for (let y = 22; y < 43; y++) put(32, y, ':');
  const house = (x1: number, y1: number, x2: number, y2: number, doorX: number, doorY: number) => {
    plaza(x1, y1, x2, y2);
    for (let x = x1; x <= x2; x++) { put(x, y1, '#'); put(x, y2, '#'); }
    for (let y = y1; y <= y2; y++) { put(x1, y, '#'); put(x2, y, '#'); }
    put(doorX, doorY, '+');
  };
  house(22, 24, 29, 29, 26, 29);
  house(36, 24, 44, 29, 40, 29);
  house(22, 35, 29, 40, 26, 35);
  house(36, 35, 44, 40, 40, 35);
  put(26, 27, 'o'); put(40, 27, '='); put(26, 37, 'o'); put(40, 37, '=');
  put(79, 13, 'T'); put(12, 10, 'x'); put(77, 50, 'o'); put(16, 52, 'o');
  put(32, 32, '.');
  for (const npc of ACTORS) { plaza(npc.x-2,npc.y-2,npc.x+2,npc.y+2);put(npc.x, npc.y, '.'); }
  // Features added after architecture: old quests, roads, doors and village stay intact.
  const landmarkPositions = new Set(LANDMARKS.map(p => `${p.x},${p.y}`));
  for(const landmark of LANDMARKS.slice(5)) {
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++) {
      const xx=landmark.x+dx,yy=landmark.y+dy;
      if(within(xx,yy)&&tiles[index(xx,yy)]!==':'&&tiles[index(xx,yy)]!=='#')put(xx,yy,'.');
    }
    put(landmark.x,landmark.y,'o');
  }
  const flourish:Record<string,Tile>={salinas:',',ceniza:';',hierro:'%',vidrio:'v',medula:'&',umbral:'?'};
  for(let y=1;y<HEIGHT-1;y++)for(let x=1;x<WIDTH-1;x++){
    if(x>=18&&x<=47&&y>=21&&y<=43)continue;
    if(landmarkPositions.has(`${x},${y}`))continue;
    const i=index(x,y),tile=tiles[i];
    if(tile!=='.'&&tile!=='*')continue;
    const biome=biomeAt(seed,x,y),n=terrainHash(seed+491,x,y);
    if(n>.992&&tile==='.' && LANDMARKS.every(p=>Math.abs(p.x-x)+Math.abs(p.y-y)>3))tiles[i]='!';
    else if(n < (tile==='*' ? .94 : .53))tiles[i]=flourish[biome];
  }
  // Route exits to adjacent world sectors (center crossroads and outer border).
  for(let x=1;x<WIDTH-1;x++)if(x<18||x>47)tiles[index(x,32)]=':';
  for(let y=1;y<HEIGHT-1;y++)if(y<21||y>43)tiles[index(48,y)]=':';
  return tiles;
}
