import { placeField } from './environment.js';
import { hasLineOfSight } from './fov.js';
import { biomeAt, WEATHER, weatherAt } from './biomes.js';
import { SeededRng } from './rng.js';
import { ACTORS, index, passable, WIDTH, within } from './world.js';
export const ENEMY_DEFS = {
    crawler: { name: 'Carroñero de sal', glyph: 's', color: '#f0a66c', hp: 9, attack: 4, armor: 0, evade: 12, xp: 5, sight: 6 },
    sentinel: { name: 'Vigía de cobre', glyph: 'V', color: '#e6be79', hp: 16, attack: 5, armor: 2, evade: 3, xp: 9, sight: 7 },
    larva: { name: 'Larva de médula', glyph: 'l', color: '#ba89d9', hp: 12, attack: 6, armor: 1, evade: 7, xp: 7, sight: 5 },
    moth: { name: 'Polilla de ceniza', glyph: 'p', color: '#e5a28c', hp: 7, attack: 3, armor: 0, evade: 15, xp: 6, sight: 6 },
    drone: { name: 'Cazador de ferrita', glyph: 'D', color: '#9ac6d6', hp: 15, attack: 5, armor: 2, evade: 7, xp: 10, sight: 7 },
    spore: { name: 'Pastor de esporas', glyph: 'f', color: '#9be3a9', hp: 11, attack: 4, armor: 1, evade: 11, xp: 8, sight: 5 }
};
export const ITEM_DEFS = {
    blade: { name: 'Hoja de desguace', description: 'Acero recocido para corta distancia.', kind: 'melee', damage: 2, range: 1 },
    pistol: { name: 'Lanzapúas', description: 'Arma de proyectiles de corto alcance; usa munición.', kind: 'ranged', damage: 4, range: 6 },
    coat: { name: 'Abrigo salino', description: 'Protección ligera para errantes.', kind: 'armor', armor: 1 },
    medkit: { name: 'Ampolla reconstituyente', description: 'Restaura 12 puntos de vitalidad.', kind: 'consumable' },
    ammo: { name: 'Púas de munición', description: 'Munición para lanzapúas y rifle.', kind: 'resource' },
    scrap: { name: 'Chatarra conductora', description: 'Material de artesanía futuro.', kind: 'resource' },
    carapace: { name: 'Caparazón petrificado', description: 'Restos de fauna mutada.', kind: 'resource' },
    capacitor: { name: 'Condensador de cobre', description: 'Componente de máquinas antiguas.', kind: 'resource' },
    rifle: { name: 'Carabina de bobina', description: 'Alcance elevado y daño superior.', kind: 'ranged', damage: 7, range: 8 },
    'shell-armor': { name: 'Coraza de médula', description: 'Protección pesada de tejido mineral.', kind: 'armor', armor: 3 }
};
export const INITIAL_INVENTORY = [
    { id: 'blade', count: 1 }, { id: 'pistol', count: 1 }, { id: 'coat', count: 1 }, { id: 'medkit', count: 2 }, { id: 'ammo', count: 12 }
];
export const INITIAL_STATS = { hp: 32, maxHp: 32, focus: 18, maxFocus: 18, xp: 0, level: 1, credits: 20 };
export const INITIAL_EQUIPMENT = { melee: 'blade', ranged: 'pistol', armor: 'coat', active: 'melee' };
const PRESETS = [
    { x: 13, y: 13, kind: 'crawler' }, { x: 16, y: 11, kind: 'crawler' },
    { x: 73, y: 14, kind: 'sentinel' }, { x: 81, y: 16, kind: 'sentinel' },
    { x: 73, y: 49, kind: 'larva' }, { x: 78, y: 54, kind: 'larva' },
    { x: 19, y: 51, kind: 'crawler' }, { x: 18, y: 55, kind: 'larva' },
    { x: 54, y: 17, kind: 'crawler' }, { x: 63, y: 32, kind: 'sentinel' }, { x: 57, y: 45, kind: 'larva' },
    { x: 8, y: 18, kind: 'moth' }, { x: 10, y: 16, kind: 'moth' },
    { x: 85, y: 22, kind: 'drone' }, { x: 84, y: 29, kind: 'drone' },
    { x: 86, y: 53, kind: 'spore' }, { x: 89, y: 57, kind: 'spore' }
];
export const inFaro = (p) => p.x >= 18 && p.x <= 47 && p.y >= 21 && p.y <= 43;
export const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
export function spawnEnemies(tiles) {
    const occupied = new Set(ACTORS.map(a => `${a.x},${a.y}`));
    return PRESETS.map((s, i) => {
        let pos;
        // Fixed deterministic fallback, independent of RNG and pre-existing NPCs.
        for (let radius = 0; radius <= 6 && !pos; radius++) {
            for (let dy = -radius; dy <= radius && !pos; dy++)
                for (let dx = -radius; dx <= radius; dx++) {
                    const x = s.x + dx, y = s.y + dy;
                    if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius || !within(x, y) || inFaro({ x, y }) || !passable(tiles[index(x, y)]) || occupied.has(`${x},${y}`))
                        continue;
                    pos = { x, y };
                    break;
                }
        }
        if (!pos)
            throw new Error(`No se puede colocar criatura ${i}`);
        occupied.add(`${pos.x},${pos.y}`);
        return { id: `hostile-${i}`, kind: s.kind, x: pos.x, y: pos.y, hp: ENEMY_DEFS[s.kind].hp, mode: 'idle', searchTurns: 0 };
    });
}
export function stackCount(inventory, id) { return inventory.find(x => x.id === id)?.count ?? 0; }
export function addStack(inventory, id, count) {
    if (!Number.isInteger(count) || count <= 0)
        throw new Error('Cantidad de objetos inválida.');
    const found = inventory.find(x => x.id === id);
    if (found)
        found.count += count;
    else
        inventory.push({ id, count });
}
export function removeStack(inventory, id, count) {
    if (!Number.isInteger(count) || count <= 0)
        return false;
    const found = inventory.find(x => x.id === id);
    if (!found || found.count < count)
        return false;
    found.count -= count;
    if (found.count === 0)
        inventory.splice(inventory.indexOf(found), 1);
    return true;
}
export function xpNeeded(level) { return level * 12; }
export function nextRandom(s) {
    const rng = new SeededRng(s.rngState);
    return rng;
}
/** Pathfind a single move; BFS is bounded to a local search envelope (performance). */
export function nextStep(tiles, from, to, occupied, maxSearch = 240, hazards = new Set(), protectFaro = true) {
    const start = index(from.x, from.y), dest = index(to.x, to.y);
    if (start === dest)
        return undefined;
    const q = [start], parents = new Map([[start, -1]]);
    for (let at = 0; at < q.length && at < maxSearch; at++) {
        const v = q[at];
        if (v === dest)
            break;
        const x = v % WIDTH, y = Math.floor(v / WIDTH);
        for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
            const nx = x + dx, ny = y + dy, ni = index(nx, ny);
            if (!within(nx, ny) || parents.has(ni) || !passable(tiles[ni]) || (protectFaro && inFaro({ x: nx, y: ny })) || occupied.has(`${nx},${ny}`) || (hazards.has(`${nx},${ny}`) && ni !== dest))
                continue;
            parents.set(ni, v);
            q.push(ni);
        }
    }
    if (!parents.has(dest))
        return undefined;
    let cursor = dest;
    while (parents.get(cursor) !== start && parents.get(cursor) !== -1)
        cursor = parents.get(cursor);
    return { x: cursor % WIDTH, y: Math.floor(cursor / WIDTH) };
}
export function takeEnemyTurn(s, report) {
    const protectFaro = s.zone === undefined || s.zone === 'surface';
    if (s.stats.hp <= 0 || (protectFaro && inFaro(s.player)))
        return;
    const rng = nextRandom(s);
    const blocked = new Set(protectFaro ? ACTORS.map(a => `${a.x},${a.y}`) : []);
    // Avoid hazardous ground unless no safe route exists; spores remain safe for their own species.
    const hazards = new Set((s.fields ?? []).filter(f => f.ttl > 0 && f.kind !== 'spores').map(f => `${f.x},${f.y}`));
    for (const enemy of s.enemies)
        if (enemy.hp > 0)
            blocked.add(`${enemy.x},${enemy.y}`);
    for (const e of s.enemies) {
        if (e.hp <= 0)
            continue;
        if ((e.stunned ?? 0) > 0) {
            e.stunned--;
            report(`ATURDIMIENTO // ${ENEMY_DEFS[e.kind].name} pierde su turno.`);
            continue;
        }
        const def = ENEMY_DEFS[e.kind], dist = manhattan(e, s.player);
        const sight = s.seed === undefined || s.tick === undefined ? def.sight : Math.min(def.sight, WEATHER[weatherAt(s.seed, s.tick, biomeAt(s.seed, e.x, e.y))].radius);
        const canSee = dist <= sight && (e.kind === 'larva' ? dist <= 3 || hasLineOfSight(s.tiles, e.x, e.y, s.player.x, s.player.y) : hasLineOfSight(s.tiles, e.x, e.y, s.player.x, s.player.y));
        if (canSee) {
            e.mode = 'hunting';
            e.lastKnown = { ...s.player };
            e.searchTurns = 3;
        }
        // Unique elite drones issue a visible two-cell electrical warning.
        // No save-schema extension: elite identity comes from its persistent id.
        if (e.id.startsWith('elite-') && canSee && dist >= 2 && dist <= 6 && s.fields && s.tick !== undefined && Math.floor(s.tick / 100) % 4 === 0) {
            const dx = Math.sign(s.player.x - e.x), dy = Math.sign(s.player.y - e.y);
            placeField(s.fields, { x: s.player.x, y: s.player.y, kind: 'electric', ttl: 3 });
            const tx = s.player.x + dx, ty = s.player.y + dy;
            if (within(tx, ty) && passable(s.tiles[index(tx, ty)]))
                placeField(s.fields, { x: tx, y: ty, kind: 'electric', ttl: 3 });
            report('ÉLITE // El custodio de Nácar sobrecarga dos casillas: sal del área antes del siguiente turno.');
            continue;
        }
        // Warden sentinels force movement with a delayed electrical trap; the
        // environmental phase processes it on the player's next turn.
        if (e.kind === 'sentinel' && canSee && dist >= 2 && dist <= 4 && s.fields && s.tick !== undefined && Math.floor(s.tick / 100) % 6 === 0) {
            placeField(s.fields, { x: s.player.x, y: s.player.y, kind: 'electric', ttl: 3 });
            report('AVISO // El vigía de cobre marca el suelo con un arco eléctrico. Muévete antes del próximo turno.');
            continue;
        }
        // Wounded shepherds retreat to scatter spores instead of fighting to death.
        if (e.kind === 'spore' && e.hp <= 4 && canSee && dist > 1)
            e.mode = 'fleeing';
        if (e.kind === 'crawler' && e.hp <= 3 && canSee)
            e.mode = 'fleeing';
        if (e.mode === 'hunting' && !canSee)
            e.mode = 'searching';
        if (e.mode === 'searching') {
            if (e.searchTurns <= 0) {
                e.mode = 'idle';
                delete e.lastKnown;
            }
            else
                e.searchTurns--;
        }
        // Attack using true position only when target currently sensed.
        if (e.mode === 'hunting' && canSee && dist === 1) {
            const hit = rng.int(1, 100) <= Math.min(95, 67 + e.kind.length - (eqArmor(s.equipment) + (s.genome?.unlocked.includes('dermal-plates') ? 1 : 0)) * 5);
            if (hit) {
                const damage = Math.max(1, rng.int(1, def.attack + 2) - eqArmor(s.equipment) - (s.genome?.unlocked.includes('dermal-plates') ? 1 : 0));
                s.stats.hp = Math.max(0, s.stats.hp - damage);
                report(`COMBATE // ${def.name} te hiere: -${damage} PV.`);
                if (e.kind === 'spore' && s.exposure !== undefined) {
                    const amount = s.genome?.unlocked.includes('spore-symbiosis') ? 1 : 3;
                    s.exposure = Math.min(100, s.exposure + amount);
                    report(`ESPORAS // El contacto aumenta tu exposición biológica (+${amount}).`);
                }
            }
            else
                report(`COMBATE // Esquivas el ataque de ${def.name}.`);
            if (s.stats.hp <= 0) {
                report('ESTADO CRÍTICO // Has caído en las salinas.');
                break;
            }
            continue;
        }
        // Species-specific terrain-changing abilities; telegraphed and subject to sight.
        if (s.fields && canSee && dist >= 2 && dist <= 4 && s.tick !== undefined) {
            const turn = Math.floor(s.tick / 100);
            if (e.kind === 'spore' && turn % 4 === 0) {
                placeField(s.fields, { x: s.player.x, y: s.player.y, kind: 'spores', ttl: 3 });
                report('AVISO // El pastor libera una nube de esporas bajo tus pies.');
                continue;
            }
            if (e.kind === 'drone' && turn % 5 === 0) {
                placeField(s.fields, { x: s.player.x, y: s.player.y, kind: 'electric', ttl: 3 });
                report('AVISO // El cazador polariza el suelo: aléjate del arco eléctrico.');
                continue;
            }
            if (e.kind === 'moth' && turn % 6 === 0) {
                placeField(s.fields, { x: e.x, y: e.y, kind: 'spores', ttl: 3 });
                report('AVISO // Una polilla exhala polvo vivo sobre su posición.');
                continue;
            }
        }
        // Sentinels have low-frequency ranged attacks; require real LoS.
        if ((e.kind === 'sentinel' || e.kind === 'drone') && e.mode === 'hunting' && canSee && dist >= 2 && dist <= 4 && rng.int(0, 2) === 0) {
            const hit = rng.int(1, 100) <= 60;
            if (hit) {
                const damage = Math.max(1, rng.int(2, 6) - eqArmor(s.equipment));
                s.stats.hp = Math.max(0, s.stats.hp - damage);
                report(`DISPARO // Un vigía te alcanza: -${damage} PV.`);
            }
            else
                report('DISPARO // Una descarga de cobre pasa a tu lado.');
            if (s.stats.hp <= 0) {
                report('ESTADO CRÍTICO // Has caído en las salinas.');
                break;
            }
            continue;
        }
        let to;
        if (e.mode === 'fleeing') {
            // Exhausted wounded enemies pause every other turn: melee pursuit remains possible.
            if (e.kind === 'crawler' && s.tick !== undefined && Math.floor(s.tick / 100) % 2 === 1)
                continue;
            const candidates = [[0, -1], [1, 0], [0, 1], [-1, 0]];
            to = candidates.map(([dx, dy]) => ({ x: e.x + dx, y: e.y + dy })).filter(p => within(p.x, p.y) && passable(s.tiles[index(p.x, p.y)]) && !(protectFaro && inFaro(p)) && !blocked.has(`${p.x},${p.y}`) && !hazards.has(`${p.x},${p.y}`)).sort((a, b) => manhattan(b, s.player) - manhattan(a, s.player))[0];
        }
        else if ((e.mode === 'hunting' || e.mode === 'searching') && e.lastKnown) {
            to = nextStep(s.tiles, e, e.lastKnown, blocked, 240, hazards, protectFaro) ?? nextStep(s.tiles, e, e.lastKnown, blocked, 240, new Set(), protectFaro);
            if (e.mode === 'searching' && manhattan(e, e.lastKnown) === 0) {
                e.mode = 'idle';
                delete e.lastKnown;
            }
        }
        else if (rng.int(0, 4) === 0 && dist <= 14) {
            const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
            const [dx, dy] = dirs[rng.int(0, 3)];
            const p = { x: e.x + dx, y: e.y + dy };
            if (within(p.x, p.y) && passable(s.tiles[index(p.x, p.y)]) && !(protectFaro && inFaro(p)) && !blocked.has(`${p.x},${p.y}`) && !hazards.has(`${p.x},${p.y}`))
                to = p;
        }
        if (to && !(to.x === s.player.x && to.y === s.player.y)) {
            blocked.delete(`${e.x},${e.y}`);
            e.x = to.x;
            e.y = to.y;
            blocked.add(`${e.x},${e.y}`);
        }
    }
    s.rngState = rng.state;
}
export function eqArmor(equipment) { return ITEM_DEFS[equipment.armor].armor ?? 0; }
