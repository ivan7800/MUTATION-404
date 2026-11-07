import { Application, Container, Graphics, Matrix, Sprite, Texture } from 'pixi.js';
import { ACTORS, biomeAt, BIOMES, HEIGHT, WIDTH, settlementCitizens } from '../../../packages/core/src/game.js';
import { index } from '../../../packages/core/src/world.js';
import { coordsForZone } from '../../../packages/core/src/frontier.js';
import { terrainHash } from '../../../packages/core/src/biomes.js';
import { CAMERA_SCALE } from './ascii-art.js';
import { loadPixelAtlas } from './pixel-assets.js';
/**
 * Pixel rebirth renderer. Assets are original 32px cells from the checked-in
 * atlas, enlarged with nearest-neighbour sampling. The simulation remains in
 * packages/core and the ASCII renderer remains available as a fallback.
 */
export class PixelRenderer {
    mount;
    mode = 'pixel';
    app = new Application();
    scene = new Container();
    terrain = new Container();
    shadows = new Container();
    actors = new Container();
    effects = new Container();
    fog = new Graphics();
    sprites = [];
    terrainPool = new Map();
    textures;
    old;
    state = null;
    builds = 0;
    lastBuildMs = 0;
    totalBuildMs = 0;
    peakActiveSprites = 0;
    cachedCells = 0;
    reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    cellW = 25;
    cellH = 29;
    ambience = 0;
    ambientFrame = 0;
    lastAmbient = 0;
    heroAction = null;
    heroUntil = 0;
    heroTimer = 0;
    effectUntil = 0;
    effectKind = 'scan';
    constructor(mount, old, textures) {
        this.mount = mount;
        this.old = old;
        this.textures = textures;
    }
    static async create(mount, old) {
        const probe = document.createElement('canvas');
        if (!(probe.getContext('webgl2') || probe.getContext('webgl')))
            throw new Error('Pixel art necesita WebGL.');
        const textures = await loadPixelAtlas();
        const result = new PixelRenderer(mount, old, textures);
        await result.app.init({ preference: 'webgl', background: 0x02080d, antialias: false, width: 1175, height: 783, resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true });
        result.app.canvas.className = 'world-canvas pixel-canvas';
        result.app.canvas.tabIndex = 0;
        result.app.canvas.dataset.renderer = 'pixi-pixel';
        result.app.canvas.setAttribute('aria-label', 'Mapa isométrico pixel art interactivo. Flechas/WASD para moverse; E interactuar; X atacar.');
        result.scene.addChild(result.terrain, result.shadows, result.actors, result.effects, result.fog);
        result.scene.sortableChildren = true;
        result.app.stage.addChild(result.scene);
        mount.appendChild(result.app.canvas);
        for (const fallback of Array.from(mount.querySelectorAll('canvas:not(.pixel-canvas)')))
            fallback.style.display = 'none';
        if (new URLSearchParams(location.search).has('profile'))
            Object.defineProperty(window, '__mutation404RenderProfile', { configurable: true, get: () => result.profile });
        return result;
    }
    get profile() { return { builds: this.builds, meanBuildMs: this.builds ? this.totalBuildMs / this.builds : 0, lastBuildMs: this.lastBuildMs, floorDraws: 1, cachedCells: this.cachedCells, textures: this.textures.size, allocatedSprites: this.sprites.length, activeSprites: this.sprites.length, peakActiveSprites: this.peakActiveSprites }; }
    tex(name) { return this.textures.get(name) ?? Texture.EMPTY; }
    clearLayer(layer) {
        for (const child of layer.removeChildren())
            child.destroy();
    }
    sprite(name, x, y, alpha = 1, scale = 1, layer = 1) {
        const sprite = new Sprite(this.tex(name));
        sprite.anchor.set(.5, .86);
        sprite.position.set((x + .5) * this.cellW, (y + .5) * this.cellH);
        sprite.scale.set(scale);
        sprite.alpha = alpha;
        sprite.zIndex = x * this.cellW + y * this.cellH + layer * .01;
        this.actors.addChild(sprite);
        this.sprites.push(sprite);
    }
    terrainSprite(name, x, y, alpha = 1, key = `${x}:${y}`) {
        const texture = this.tex(name);
        let sprite = this.terrainPool.get(key);
        if (!sprite) {
            sprite = new Sprite(texture);
            sprite.anchor.set(.5, .72);
            sprite.scale.set(.9);
            this.terrainPool.set(key, sprite);
            this.terrain.addChild(sprite);
        }
        else if (sprite.texture !== texture)
            sprite.texture = texture;
        sprite.visible = true;
        sprite.position.set((x + .5) * this.cellW, (y + .5) * this.cellH);
        sprite.alpha = alpha;
        sprite.zIndex = x * this.cellW + y * this.cellH;
        sprite.tint = 0xffffff;
        this.sprites.push(sprite);
    }
    floorAsset(biome) { return `floor-${biome}`; }
    propAsset(biome) { return `prop-${biome}`; }
    tileAsset(tile, variant, biome) {
        if (tile === '#' || tile === '%' || tile === '=')
            return variant === 2 ? this.propAsset(biome) : 'rock';
        if (tile === '*' || tile === '&')
            return tile === '&' ? 'tree' : 'plant';
        if (tile === '^')
            return this.propAsset(biome);
        if (tile === '!')
            return 'mutation';
        return this.floorAsset(biome);
    }
    actorAsset(kind, id, frame) {
        if (id.includes('campaign-heart') || id.includes('final-guardian'))
            return `boss-heart-${frame ? 'b' : 'a'}`;
        if (id.includes('elite-') || id.includes('resonance-guardian'))
            return `elite-drone-${frame ? 'b' : 'a'}`;
        const species = kind === 'crawler' ? 'crawler' : kind === 'sentinel' ? 'sentinel' : kind === 'larva' ? 'larva' : kind === 'moth' ? 'moth' : kind === 'drone' ? 'drone' : 'spore';
        return `${species}-${frame ? 'b' : 'a'}`;
    }
    heroAsset(action, dead, frame) {
        if (dead)
            return 'hero-death-a';
        if (action === 'damage')
            return 'hero-hurt-a';
        const pose = action === 'attack' ? 'attack' : action === 'walk' ? 'walk' : 'idle';
        return `hero-${pose}-${frame ? 'b' : 'a'}`;
    }
    draw(state) {
        const started = performance.now();
        this.state = state;
        for (const sprite of this.terrainPool.values())
            sprite.visible = false;
        this.clearLayer(this.shadows);
        this.clearLayer(this.actors);
        this.clearLayer(this.effects);
        this.fog.clear();
        this.sprites.length = 0;
        const ox = Math.max(0, Math.min(WIDTH - 47, state.player.x - 23)), oy = Math.max(0, Math.min(HEIGHT - 27, state.player.y - 13));
        // Keep the player at the centre of the viewport while the visible window
        // moves through the larger simulation map. This is the same projection
        // contract used by the legacy renderer, with crisp pixel-art scaling.
        const anchorX = (state.player.x - ox + .5) * this.cellW;
        const anchorY = (state.player.y - oy + .5) * this.cellH;
        this.scene.setFromMatrix(new Matrix(CAMERA_SCALE, CAMERA_SCALE * .5, -CAMERA_SCALE, CAMERA_SCALE * .5, 47 * this.cellW / 2 - CAMERA_SCALE * anchorX + CAMERA_SCALE * anchorY, 27 * this.cellH / 2 - CAMERA_SCALE * (anchorX + anchorY) / 2));
        const surface = coordsForZone(state.zone) !== null;
        let cells = 0;
        for (let cy = 0; cy < 27; cy++)
            for (let cx = 0; cx < 47; cx++) {
                const x = ox + cx, y = oy + cy, at = index(x, y);
                if (!state.seen[at])
                    continue;
                cells++;
                const visible = state.visible[at] === 1, dist = Math.hypot(x - state.player.x, y - state.player.y), radius = 12;
                const alpha = visible ? Math.max(.28, 1 - Math.max(0, dist - radius * .3) / radius * .68) : .14;
                const biome = biomeAt(state.seed, x, y), tile = state.tiles[at], variant = Math.floor(terrainHash(state.seed + 917, x, y) * 3);
                this.terrainSprite(this.tileAsset(tile, variant, biome), cx, cy, alpha, `${x}:${y}`);
                if (visible && surface && dist < 9) {
                    const light = new Graphics();
                    light.circle((cx + .5) * this.cellW, (cy + .48) * this.cellH, Math.max(1, (9 - dist) * 2)).fill({ color: BIOMES[biome].palette, alpha: .025 });
                    this.effects.addChild(light);
                }
            }
        for (const field of state.fields)
            if (state.visible[index(field.x, field.y)] === 1) {
                const x = field.x - ox, y = field.y - oy;
                if (x >= 0 && y >= 0 && x < 47 && y < 27)
                    this.sprite(field.kind === 'fire' ? 'attack' : field.kind === 'electric' ? 'mutation-fx' : 'plant', x, y, .82, 1.05, 2);
            }
        for (const node of state.ecology.nodes)
            if (node.zone === state.zone && node.quantity > 0 && state.visible[index(node.x, node.y)] === 1) {
                const x = node.x - ox, y = node.y - oy;
                if (x >= 0 && y >= 0 && x < 47 && y < 27)
                    this.sprite(node.kind === 'spores' ? 'mutation' : node.kind === 'crystal' ? 'mutation-fx' : 'rock', x, y, .96, 1.02, 2);
            }
        for (const item of state.ground)
            if (state.visible[index(item.x, item.y)] === 1) {
                const x = item.x - ox, y = item.y - oy;
                if (x >= 0 && y >= 0 && x < 47 && y < 27)
                    this.sprite('mutation-fx', x, y, .75, .7, 2);
            }
        for (const npc of [...(state.zone === 'surface' ? ACTORS : []), ...settlementCitizens(state.zone, state.tick)])
            if (state.visible[index(npc.x, npc.y)] === 1) {
                const x = npc.x - ox, y = npc.y - oy;
                if (x >= 0 && y >= 0 && x < 47 && y < 27)
                    this.sprite('sentinel', x, y, .8, .75, 3);
            }
        const enemyFrame = Math.floor(this.ambience / 2) % 2;
        for (const enemy of state.enemies)
            if (enemy.hp > 0 && state.visible[index(enemy.x, enemy.y)] === 1) {
                const x = enemy.x - ox, y = enemy.y - oy;
                if (x >= 0 && y >= 0 && x < 47 && y < 27)
                    this.sprite(this.actorAsset(enemy.kind, enemy.id, enemyFrame), x, y, 1, 1.03, 4);
            }
        const hero = this.heroAction && performance.now() < this.heroUntil ? this.heroAction : null;
        this.sprite(this.heroAsset(hero, state.stats.hp <= 0, Math.floor(this.ambience / 2) % 2), state.player.x - ox, state.player.y - oy, 1, 1.08, 5);
        if (this.effectUntil > performance.now() && !this.reducedMotion)
            this.sprite(this.effectKind === 'damage' ? 'damage' : this.effectKind === 'mutation' ? 'mutation-fx' : 'attack', state.player.x - ox, state.player.y - oy, .85, 1.3, 6);
        this.ambience++;
        this.cachedCells = cells;
        this.builds++;
        this.lastBuildMs = performance.now() - started;
        this.totalBuildMs += this.lastBuildMs;
        this.peakActiveSprites = Math.max(this.peakActiveSprites, this.sprites.length);
    }
    renderMinimap(state, canvas) { this.old.renderMinimap(state, canvas); }
    focus() { this.app.canvas.focus({ preventScroll: true }); this.mount.scrollLeft = Math.max(0, (this.app.canvas.clientWidth - this.mount.clientWidth) / 2); }
    zoom(dir) { this.cellW = Math.max(19, Math.min(31, this.cellW + dir * 2)); this.cellH = Math.round(this.cellW * 1.16); this.app.renderer.resize(47 * this.cellW, 27 * this.cellH); if (this.state)
        this.draw(this.state); }
    setReducedMotion(value) { this.reducedMotion = value; if (value)
        this.pauseAmbience(); if (this.state)
        this.draw(this.state); }
    startAmbience() { if (this.reducedMotion || this.ambientFrame)
        return; const loop = (now) => { this.ambientFrame = 0; if (document.visibilityState === 'hidden' || !this.state)
        return; if (now - this.lastAmbient >= 125) {
        this.lastAmbient = now;
        this.draw(this.state);
    } this.ambientFrame = requestAnimationFrame(loop); }; this.ambientFrame = requestAnimationFrame(loop); }
    pauseAmbience() { if (this.ambientFrame)
        cancelAnimationFrame(this.ambientFrame); this.ambientFrame = 0; }
    destroy() { this.pauseAmbience(); if (this.heroTimer)
        clearTimeout(this.heroTimer); this.app.destroy(true, { children: true }); }
    heroFeedback(state, action) { if (this.reducedMotion)
        return; this.heroAction = action; this.heroUntil = performance.now() + 420; if (this.heroTimer)
        clearTimeout(this.heroTimer); this.heroTimer = window.setTimeout(() => { this.heroAction = null; if (this.state)
        this.draw(this.state); }, 440); this.draw(state); }
    enemyFeedback(state) { this.draw(state); }
    combatFeedback(_previous, state) { this.draw(state); }
    environmentFeedback(_previous, state) { this.draw(state); }
    bossFeedback(state) { this.effect(state, 'mutation'); }
    mutationFeedback(state) { this.effect(state, 'mutation'); }
    effect(state, kind) { if (this.reducedMotion)
        return; this.effectKind = kind; this.effectUntil = performance.now() + 420; this.draw(state); }
}
