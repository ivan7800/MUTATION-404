/** Shared original ASCII compositions. Pure data: no world state, DOM or RNG. */
export const CAMERA_SCALE = 1.45;
const ACTORS = {
    '@': [[' o ', '/|\\', '/ \\'], [' o ', '/|>', ' /\\']],
    'hero:walk': [[' o ', '/|\\', ' /\\'], [' o ', '/|\\', '/ \\']],
    'hero:attack': [[' o ', '/|==', '/ \\'], [' o ', '==|\\', '/ \\']],
    'hero:damage': [[' x ', '\\|/', ' /\\']],
    'hero:mutation': [['\\o/', '{#}', '/ \\'], ['/o\\', '{#}', '/ \\']],
    'hero:interact': [[' o/', '/| ', '/ \\']],
    'hero:death': [['___', 'x_x', '/ \\']],
    s: [[' __', '/oo\\', '/\\/\\'], [' __', '/oo\\', '\\/\\/']],
    V: [['[o]', '/V\\', '| |'], ['[o]', '<V>', '/ \\']],
    l: [[' _ ', '(oo', '/==~'], [' _ ', '(oo', '~==\\']],
    p: [['\\ /', '(o)', '/ \\'], ['/ \\', '(o)', '\\ /']],
    D: [['/o\\', '[=]', '/ \\'], ['\\o/', '[=]', '| |']],
    f: [['.*.', '(o)', '/|\\'], [':*:', '(o)', '\\|/']],
    '✺': [['\\ | /', '--O--', '/|X|\\', '/ | \\'], ['/ | \\', '==O==', '\\|X|/', '\\ | /']],
    '◆': [['/O\\', '[X]', '/|\\']],
    'enemy:hurt:s': [[' __', '/XX\\', '/\\/\\']],
    'enemy:hurt:V': [['[X]', '<V>', '| |']],
    'enemy:hurt:l': [[' _ ', '(XX', '/==~']],
    'enemy:hurt:p': [['\\ /', '(X)', '/ \\']],
    'enemy:hurt:D': [['/X\\', '[!]', '/ \\']],
    'enemy:hurt:f': [['.*.', '(X)', '/|\\']],
    'enemy:hurt:✺': [['\\ | /', '==X==', '/|X|\\', '/ | \\']],
    'enemy:hurt:◆': [['/X\\', '[!]', '/|\\']],
    'enemy:death:s': [[' __', '/xx\\', '\\_/_']],
    'enemy:death:V': [['[x]', '-V-', '_ _']],
    'enemy:death:l': [['___', '(xx', '~~~~']],
    'enemy:death:p': [['\\x/', '---', '/ \\']],
    'enemy:death:D': [['[x]', '[~]', '_ _']],
    'enemy:death:f': [['.*.', '(x)', '_/_']],
    'enemy:death:✺': [['\\ | /', '--X--', '_/_\\_', '/   \\']],
    'enemy:death:◆': [['/x\\', '[~]', '_/_']],
    '#': [[' /_\\', '|##|', '|__|']],
    '.': [[' . ', '...', '___']],
    '.:1': [[' . ', '.._', '__\u005c']],
    '.:2': [[' . ', '._.', '_/_']],
    ':': [[' : ', ':::', '___']],
    ':1': [[' : ', '::_', '__\u005c']],
    ':2': [[' : ', '_::', '_/_']],
    ',': [[' , ', ',,,', '___']],
    ';': [[' ; ', ';;;', '___']],
    '^': [[' /\\', '/^^\\', '\\__/']],
    '%': [[' /%\\', '|%%|', '|__|']],
    '%:1': [[' /%\\', '|%_ |', '|__\\']],
    '%:2': [[' /%\\', '|_%|', '|/_|']],
    '=': [['/==\\', '|==|']],
    '*': [[' .*.', '/|\\', ' | '], [' :*:', '\\|/', ' | ']],
    '&': [['{*}', '/|\\', '/ \\'], ['{*}', '\\|/', '/ \\']],
    '~': [['~ ~', ' ~~'], [' ~~', '~ ~']],
    '!': [['!*!', '/!\\'], ['*!*', '\\!/']],
    T: [['/T\\', '[=]', ' | ']],
    o: [['/o\\', '|o|', '\\_/']],
    'npc:M': [[' .M.', '/|\\', '/ \\']],
    'npc:O': [[' [O]', '/|\\', '/ \\']],
    'npc:S': [[' .S.', '/|\\', '/ \\']],
    'npc:C': [[' .C.', '/|\\', '/ \\']],
    'npc:I': [[' [I]', '/|\\', '/ \\']],
    'npc:K': [[' [K]', '/|\\', '/ \\']],
    'npc:$': [[' {$}', '/|\\', '/ \\']],
    'npc:?': [[' {?}', '/|\\', '/ \\']],
    'npc:!': [[' [!]', '/|\\', '/ \\']],
    'resource:mineral': [[' /\\', '<##>', ' \\/']],
    'resource:fiber': [[' \\|/', '--+', ' /|\\']],
    'resource:spores': [['.*.', '{o}', '***']],
    'resource:crystal': [[' /\\', '<><>', ' \\/']],
    loot: [[' .-.', '|$|', ' `-`']],
    'field:fire': [[' ^ ^', '/!\\', '^^^'], [' ^^', '/!\\', '^ ^']],
    'field:electric': [['\\|/', '-Z-', '/|\\'], ['/|\\', '-Z-', '\\|/']],
    'field:spores': [['. .', '(o)', '* *'], ['* *', '(o)', '. .']],
};
export function composition(glyph, frame = 0) {
    const poses = ACTORS[glyph];
    if (poses)
        return poses[Math.abs(frame) % poses.length];
    return [glyph];
}
export function terrainComposition(tile, variant = 0) {
    const key = `${tile}:${Math.abs(variant) % 3}`;
    return variant % 3 && ACTORS[key] ? key : tile;
}
export function paintComposition(ctx, glyph, x, y, size, frame = 0) {
    const rows = composition(glyph, frame), multi = rows.length > 1;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${multi ? size * .48 : size}px "DejaVu Sans Mono",monospace`;
    for (let row = 0; row < rows.length; row++)
        ctx.fillText(rows[row], x, y + (row - (rows.length - 1) / 2) * size * .46);
    ctx.restore();
}
