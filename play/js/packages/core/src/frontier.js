import { SeededRng } from './rng.js';
import { HEIGHT, WIDTH, index } from './world.js';
import { ENEMY_DEFS } from './combat.js';
export const SECTORS = [
    { x: -1, y: -1, name: 'Cráteres del Silencio', faction: 'Peregrinos del Eco', description: 'Aros de antenas brotan de la ceniza; las radios responden con voces futuras.', danger: 2 },
    { x: 0, y: -1, name: 'Páramos de Ceniza', faction: 'Concordia', description: 'Dunas negruzcas y un campamento que nunca apaga sus lámparas.', danger: 1 },
    { x: 1, y: -1, name: 'Costas de Cristal', faction: 'Sindicato Ferral', description: 'La arena se parte en láminas afiladas y los espejos observan.', danger: 2 },
    { x: -1, y: 0, name: 'Ruta de los Desguaces', faction: 'Sindicato Ferral', description: 'Restos de transportes colosales forman un bazar protegido por centinelas.', danger: 1 },
    { x: 0, y: 0, name: 'Salinas de Vértice', faction: 'Concordia', description: 'Faro Ciego y la Estación CERO-7: la primera señal.', danger: 1 },
    { x: 1, y: 0, name: 'Cinturón Ferral', faction: 'Custodios del Cero', description: 'Arrecifes de máquinas todavía operativas y pequeñas colonias de recuperadores.', danger: 2 },
    { x: -1, y: 1, name: 'Jardín de Médula', faction: 'Jardineros de Médula', description: 'Hongos conscientes y tejados que respiran como animales.', danger: 2 },
    { x: 0, y: 1, name: 'Hundimiento de Vidrio', faction: 'Peregrinos del Eco', description: 'Las ruinas cambian de posición cuando se las deja de mirar.', danger: 2 },
    { x: 1, y: 1, name: 'Umbral de los Ausentes', faction: 'Culto del Ojo Vacío', description: 'Una herida geográfica emite una frecuencia que nadie transmite.', danger: 3 }
];
export const sectorName = (x, y) => SECTORS.find(s => s.x === x && s.y === y)?.name ?? 'Territorio inaccesible';
export function zoneForSector(x, y) { return x === 0 && y === 0 ? 'surface' : `sector-${x}-${y}`; }
export function coordsForZone(zone) {
    if (zone === 'surface')
        return { x: 0, y: 0 };
    const m = /^sector-(-?\d+)-(-?\d+)$/.exec(zone);
    if (!m)
        return null;
    const x = Number(m[1]), y = Number(m[2]);
    return SECTORS.some(s => s.x === x && s.y === y) ? { x, y } : null;
}
export function generateSector(seed, sx, sy) {
    const meta = SECTORS.find(s => s.x === sx && s.y === sy);
    if (!meta || (sx === 0 && sy === 0))
        throw new Error('Sector no procedural.');
    const rng = new SeededRng((seed ^ Math.imul(sx + 17, 0x9e3779b9) ^ Math.imul(sy + 19, 0x85ebca6b)) >>> 0);
    const tiles = new Array(WIDTH * HEIGHT).fill('.');
    for (let y = 0; y < HEIGHT; y++)
        for (let x = 0; x < WIDTH; x++) {
            const n = rng.next();
            tiles[index(x, y)] = n < .045 ? '#' : n < .075 ? '^' : n < .11 ? '~' : n < .2 ? '*' : n < .29 ? (meta.danger >= 3 ? '?' : meta.danger === 2 ? '%' : ',') : '.';
        }
    // Connecting cardinal roads reach each edge and the central landmark.
    for (let x = 0; x < WIDTH; x++)
        for (let dy = -1; dy <= 1; dy++)
            tiles[index(x, Math.floor(HEIGHT / 2) + dy)] = ':';
    for (let y = 0; y < HEIGHT; y++)
        for (let dx = -1; dx <= 1; dx++)
            tiles[index(Math.floor(WIDTH / 2) + dx, y)] = ':';
    // Ruin, small settlement and a safe central approach are visible destinations.
    for (let y = 25; y < 40; y++)
        for (let x = 42; x < 56; x++)
            tiles[index(x, y)] = '.';
    for (let x = 42; x <= 55; x++) {
        tiles[index(x, 25)] = '#';
        tiles[index(x, 39)] = '#';
    }
    for (let y = 25; y <= 39; y++) {
        tiles[index(42, y)] = '#';
        tiles[index(55, y)] = '#';
    }
    tiles[index(48, 25)] = '+';
    tiles[index(48, 39)] = '+';
    tiles[index(42, 32)] = '+';
    tiles[index(55, 32)] = '+';
    tiles[index(48, 32)] = 'o';
    for (let y = 45; y <= 49; y++)
        for (let x = 70; x <= 74; x++)
            tiles[index(x, y)] = '.';
    tiles[index(72, 47)] = 'T';
    for (let x = 48; x <= 72; x++)
        tiles[index(x, 47)] = ':';
    for (let y = 32; y <= 47; y++)
        tiles[index(48, y)] = ':';
    tiles[index(72, 47)] = 'T';
    for (let i = 0; i < 28; i++) {
        const x = rng.int(4, WIDTH - 5), y = rng.int(4, HEIGHT - 5);
        if (Math.abs(x - 48) + Math.abs(y - 32) > 12 && tiles[index(x, y)] === '.')
            tiles[index(x, y)] = rng.next() < .55 ? '%' : '&';
    }
    const enemies = [];
    const kinds = (meta.danger === 1 ? ['crawler', 'moth'] : meta.danger === 2 ? ['sentinel', 'drone', 'spore'] : ['spore', 'larva', 'drone']);
    for (let i = 0; i < 9 + meta.danger * 3; i++) {
        const x = rng.int(3, WIDTH - 4), y = rng.int(3, HEIGHT - 4), kind = kinds[i % kinds.length];
        if (Math.abs(x - 48) + Math.abs(y - 32) < 13 || tiles[index(x, y)] === '#' || tiles[index(x, y)] === '^' || tiles[index(x, y)] === '~' || enemies.some(e => e.x === x && e.y === y))
            continue;
        enemies.push({ id: `front-${sx}-${sy}-${i}`, x, y, kind, hp: ENEMY_DEFS[kind].hp, mode: 'idle', searchTurns: 0 });
    }
    return { tiles, seen: Array(WIDTH * HEIGHT).fill(0), enemies, ground: [], fields: [], player: { x: 48, y: 32 } };
}
