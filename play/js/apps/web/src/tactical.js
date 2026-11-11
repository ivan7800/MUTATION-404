import { index } from '../../../packages/core/src/world.js';
/** Read-only threat awareness; only visible enemy positions and visible fields count. */
export function tacticalSignal(state) {
    let imminent = 0, near = 0, enemyCount = 0;
    for (const field of state.fields) {
        if (state.visible[index(field.x, field.y)] !== 1)
            continue;
        const dist = Math.abs(field.x - state.player.x) + Math.abs(field.y - state.player.y);
        if (dist === 0)
            imminent++;
        else if (dist <= 2)
            near++;
    }
    for (const enemy of state.enemies) {
        if (enemy.hp <= 0 || state.visible[index(enemy.x, enemy.y)] !== 1)
            continue;
        if (Math.abs(enemy.x - state.player.x) + Math.abs(enemy.y - state.player.y) <= 6)
            enemyCount++;
    }
    if (imminent)
        return { level: 'contact', label: `PELIGRO INMEDIATO // ${imminent} ANOMALÍA(S) EN TU POSICIÓN`, count: imminent };
    if (near)
        return { level: 'near', label: `RIESGO CERCANO // ${near} CAMPO(S) A DOS PASOS O MENOS`, count: near };
    if (enemyCount)
        return { level: 'enemy', label: `CONTACTO HOSTIL // ${enemyCount} CRIATURA(S) VISIBLES`, count: enemyCount };
    return { level: 'clear', label: 'SIN AMENAZAS INMEDIATAS VISIBLES', count: 0 };
}
