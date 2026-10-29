/** Deterministic ecological systems: harvest sites, recipes, and distant-world pulses. */
import { terrainHash } from './biomes.js';
import { SECTORS } from './frontier.js';
import { index, passable, WIDTH, HEIGHT } from './world.js';
import { ENEMY_DEFS } from './combat.js';
export const RESOURCE_INFO = {
    mineral: { name: 'Veta ferruginosa', product: 'scrap', amount: 2 },
    fiber: { name: 'Filamento de médula', product: 'carapace', amount: 1 },
    spores: { name: 'Nido de esporas', product: 'medkit', amount: 1 },
    crystal: { name: 'Cristal conductor', product: 'capacitor', amount: 1 }
};
export const RECIPES = [
    { id: 'ammunition', name: 'Púas recicladas', ingredients: { scrap: 2 }, product: 'ammo', amount: 5, description: 'Fabrica 5 púas con 2 unidades de chatarra.' },
    { id: 'medicine', name: 'Ampolla de campo', ingredients: { carapace: 1, scrap: 1 }, product: 'medkit', amount: 1, description: 'Sintetiza medicina con restos biológicos y chatarra.' },
    { id: 'conductor', name: 'Condensador portátil', ingredients: { scrap: 3 }, product: 'capacitor', amount: 1, description: 'Reorganiza metal en un condensador utilizable.' }
];
export function nodeId(zone, x, y) { return `${zone}:${x}:${y}`; }
export function resourceKind(zone, biome, seed, x, y) {
    const n = terrainHash(seed ^ 0x40408, x + Math.imul(zone.length, 37), y + zone.charCodeAt(0));
    if (n > .022)
        return null;
    if (biome === 'medula')
        return n < .01 ? 'spores' : 'fiber';
    if (biome === 'vidrio' || biome === 'umbral')
        return 'crystal';
    return 'mineral';
}
export function seedResources(seed, zone, tiles, biomeAtCell) {
    const nodes = [];
    for (let y = 2; y < HEIGHT - 2; y++)
        for (let x = 2; x < WIDTH - 2; x++) {
            if (!passable(tiles[index(x, y)]) || Math.abs(x - 48) + Math.abs(y - 32) < 9)
                continue;
            const kind = resourceKind(zone, biomeAtCell(x, y), seed, x, y);
            if (kind)
                nodes.push({ id: nodeId(zone, x, y), zone, x, y, kind, quantity: kind === 'mineral' ? 2 : 1 });
        }
    return nodes;
}
export function initialEcology() { return { nodes: [], seededZones: [], lastPulse: 0, pressure: {}, history: [] }; }
/** Modifies only already-loaded sector snapshots, not unexplored terrain. */
export function ecologicalPulse(seed, pulse, zone, loaded, active, eco) {
    const notices = [];
    for (const def of SECTORS) {
        const key = def.x === 0 && def.y === 0 ? 'surface' : `sector-${def.x}-${def.y}`;
        const delta = terrainHash(seed, pulse * 37 + def.x * 13, def.y * 31 + 17) < .5 ? -1 : 1;
        eco.pressure[key] = Math.max(0, Math.min(5, (eco.pressure[key] ?? def.danger) + delta));
        const snapshot = key === zone ? active : loaded[key];
        if (!snapshot)
            continue;
        const creatures = snapshot.enemies;
        const count = creatures.filter(e => e.hp > 0).length;
        // Ecological interaction: large machine packs displace a scavenger. This is deterministic,
        // persists in loaded snapshots and does not claim to simulate a full food chain.
        const hunters = creatures.filter(e => e.hp > 0 && (e.kind === 'drone' || e.kind === 'sentinel'));
        const scavengers = creatures.filter(e => e.hp > 0 && (e.kind === 'crawler' || e.kind === 'moth'));
        if (hunters.length >= 3 && scavengers.length > 0 && terrainHash(seed ^ 0x909, pulse, def.x * 13 + def.y * 17) < .40) {
            const displaced = scavengers[0];
            displaced.hp = 0;
            eco.pressure[key] = Math.min(5, eco.pressure[key] + 1);
            if (key === zone)
                notices.push('ECOLOGÍA // Un grupo de cazadores desplaza a los carroñeros de la región.');
        }
        if (eco.pressure[key] >= 3 && count < 27) {
            const x = 3 + Math.floor(terrainHash(seed, pulse, def.x + 21) * (WIDTH - 6));
            const y = 3 + Math.floor(terrainHash(seed, pulse, def.y + 51) * (HEIGHT - 6));
            const occupied = creatures.some(e => e.hp > 0 && e.x === x && e.y === y);
            if (passable(snapshot.tiles[index(x, y)]) && !occupied && !(key === zone && Math.abs(x - 48) + Math.abs(y - 32) < 12)) {
                const kind = def.danger >= 3 ? 'spore' : def.danger >= 2 ? 'drone' : 'crawler';
                creatures.push({ id: `migration-${key}-${pulse}`, x, y, kind, hp: ENEMY_DEFS[kind].hp, mode: 'idle', searchTurns: 0 });
                if (key === zone)
                    notices.push('ECOLOGÍA // Una criatura migratoria entra en este territorio.');
            }
        }
    }
    eco.lastPulse = pulse;
    const line = `CICLO ${pulse}: los ecosistemas redistribuyen su presión territorial.`;
    eco.history.push(line);
    if (eco.history.length > 30)
        eco.history.shift();
    return notices;
}
