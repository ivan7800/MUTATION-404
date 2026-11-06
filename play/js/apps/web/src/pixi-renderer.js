import { Application, Container, Graphics, Matrix, Sprite, Texture } from 'pixi.js';
import { nacarPhase, nacarMark } from '../../../packages/core/src/campaign.js';
import { ACTORS, FIELD_VISUALS, biomeAt, BIOMES, ENEMY_DEFS, HEIGHT, weatherAt, WIDTH, settlementCitizens } from '../../../packages/core/src/game.js';
import { index, passable, within } from '../../../packages/core/src/world.js';
import { coordsForZone } from '../../../packages/core/src/frontier.js';
import { terrainHash } from '../../../packages/core/src/biomes.js';
import { terrainHeight, CAMERA_SCALE, isOccludingTerrain, paintComposition, terrainComposition } from './ascii-art.js';
/**
 * Real PixiJS v8 sprite renderer. Tiles are GPU sprites based on a reusable glyph
 * atlas generated from canvas, not one DOM/canvas text draw call per game frame.
 * All simulation, visibility and save data belong to core GameState.
 */
export class PixiAsciiRenderer {
    mount;
    old;
    app = new Application();
    view = new Container();
    terrainFloor = new Graphics();
    backdrop = new Graphics();
    layers = new Container();
    sprites = [];
    activeSprites = 0;
    peakActiveSprites = 0;
    glyphs = new Map();
    // Immutable terrain identities; compute biome/variant once per world cell and seed.
    terrainSeed = null;
    terrainCache = new Map();
    floorKey = '';
    floorDraws = 0;
    lastBuildMs = 0;
    totalBuildMs = 0;
    buildCount = 0;
    /** JS build timings, not GPU frame time or FPS. */
    get profile() {
        return { builds: this.buildCount, meanBuildMs: this.buildCount ? this.totalBuildMs / this.buildCount : 0,
            lastBuildMs: this.lastBuildMs, floorDraws: this.floorDraws, cachedCells: this.terrainCache.size, textures: this.glyphs.size,
            allocatedSprites: this.sprites.length, activeSprites: this.activeSprites, peakActiveSprites: this.peakActiveSprites };
    }
    terrain(seed, x, y) {
        if (this.terrainSeed !== seed) {
            this.terrainCache.clear();
            this.terrainSeed = seed;
            this.floorKey = '';
        }
        const at = index(x, y);
        let cached = this.terrainCache.get(at);
        if (!cached) {
            cached = { biome: biomeAt(seed, x, y), variant: Math.floor(terrainHash(seed + 917, x, y) * 3) };
            this.terrainCache.set(at, cached);
        }
        return cached;
    }
    // The game has one visual language: atmospheric isometric ASCII. WebGL only
    // accelerates the glyph layers; it never swaps the characters for sprites.
    get mode() { return 'ascii'; }
    state = null;
    cellW = 15;
    cellH = 23;
    fontSize = 18;
    ambientFrame = 0;
    lastAmbient = 0;
    ambience = 0;
    effectUntil = 0;
    flashes = new Map();
    echoes = [];
    fieldBursts = [];
    bossBursts = [];
    effectKind = 'scan';
    heroAction = null;
    heroUntil = 0;
    heroTimer = 0;
    mutationEffect = null;
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    viewW = 47;
    viewH = 27;
    constructor(mount, old) {
        this.mount = mount;
        this.old = old;
    }
    static async create(mount, old) {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2') || probe.getContext('webgl');
        if (!gl)
            throw new Error('El navegador no ofrece WebGL; se mantiene Canvas 2D.');
        const result = new PixiAsciiRenderer(mount, old);
        await result.app.init({ preference: 'webgl', background: 0x080c16, antialias: false, width: 705, height: 621, resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true });
        result.app.canvas.className = 'world-canvas pixi-canvas';
        result.app.canvas.tabIndex = 0;
        result.app.canvas.setAttribute('aria-label', 'Mapa WebGL ASCII interactivo. Flechas/WASD para moverse; E para interactuar; X para atacar.');
        result.app.canvas.dataset.renderer = 'pixi-webgl';
        result.view.addChild(result.terrainFloor, result.backdrop, result.layers);
        result.layers.sortableChildren = true;
        // A true affine isometric basis for every glyph, floor tile and effect.
        // Game coordinates stay Cartesian so pathfinding and saves remain stable.
        result.view.setFromMatrix(new Matrix(CAMERA_SCALE, CAMERA_SCALE * .5, -CAMERA_SCALE, CAMERA_SCALE * .5, 352, 310));
        result.app.stage.addChild(result.view);
        result.mount.appendChild(result.app.canvas);
        // Hide, but never destroy, the fallback before the WebGL view is ready.
        const fallback = result.mount.querySelector('canvas:not(.pixi-canvas)');
        if (fallback instanceof HTMLCanvasElement)
            fallback.style.display = 'none';
        result.allocateSprites();
        // Opt-in browser diagnostics only. Never leak game state or add telemetry.
        if (new URLSearchParams(location.search).has('profile')) {
            Object.defineProperty(window, '__mutation404RenderProfile', {
                configurable: true, get: () => result.profile
            });
        }
        return result;
    }
    /** Diff environmental fields only after accepted turns; no simulation mutations. */
    environmentFeedback(previous, state) {
        if (this.reducedMotion)
            return;
        const old = new Set(previous.map(f => `${f.x}:${f.y}:${f.kind}`));
        const now = performance.now();
        for (const field of state.fields) {
            const key = `${field.x}:${field.y}:${field.kind}`;
            if (!old.has(key) && state.visible[index(field.x, field.y)] === 1) {
                this.fieldBursts.push({ x: field.x, y: field.y, kind: field.kind, until: now + 520 });
            }
        }
        if (this.fieldBursts.length > 24)
            this.fieldBursts.splice(0, this.fieldBursts.length - 24);
    }
    combatFeedback(previous, state) {
        if (this.reducedMotion)
            return;
        const now = performance.now(), current = new Set(state.enemies.map(e => e.id));
        for (const enemy of state.enemies) {
            const before = previous.get(enemy.id);
            if (before && enemy.hp < before.hp)
                this.flashes.set(enemy.id, { until: now + 320, heavy: before.hp - enemy.hp >= 5 });
        }
        for (const [id, old] of previous)
            if (old.zone === state.zone && (!current.has(id) || state.enemies.some(e => e.id === id && e.hp <= 0))) {
                this.echoes.push({ x: old.x, y: old.y, glyph: old.glyph, until: now + 450 });
                this.flashes.delete(id);
            }
        if (this.echoes.length > 20)
            this.echoes.splice(0, this.echoes.length - 20);
        this.draw(state);
    }
    /** Ephemeral transition choreography: never stored in saves or game state. */
    bossFeedback(state, event) {
        if (this.reducedMotion)
            return;
        const boss = state.enemies.find(e => e.id === 'campaign-heart-custodian');
        if (!boss)
            return;
        const color = event === 'awaken' ? 0xbbe8fb : event === 'phase2' ? 0xb9e78c : event === 'phase3' ? 0xff9b71 : 0xe5c99d;
        this.bossBursts.push({ x: boss.x, y: boss.y, until: performance.now() + 900, color });
        if (this.bossBursts.length > 4)
            this.bossBursts.shift();
        this.draw(state);
    }
    texture(character, frame = 0) {
        const key = character + ':' + frame;
        let texture = this.glyphs.get(key);
        if (texture)
            return texture;
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 52;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            throw new Error('No se pudo crear el atlas de caracteres.');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 37px monospace';
        ctx.fillStyle = '#fff';
        paintComposition(ctx, character, 40, 26, 37, frame);
        texture = Texture.from(canvas);
        this.glyphs.set(key, texture);
        return texture;
    }
    // Pixi stage now grows only as needed. Old implementation eagerly created
    // 1,519 Sprite objects and traversed them all on each render.
    allocateSprites() { this.growSprites(64); }
    growSprites(count) {
        const cap = this.viewW * this.viewH + 250;
        for (let n = 0; n < count && this.sprites.length < cap; n++) {
            const sprite = new Sprite(this.texture('.'));
            sprite.anchor.set(.5);
            sprite.visible = false;
            this.layers.addChild(sprite);
            this.sprites.push(sprite);
        }
    }
    spriteAt(i) {
        if (i >= this.viewW * this.viewH + 250)
            throw new Error('Sprite pool exhausted');
        while (i >= this.sprites.length)
            this.growSprites(64);
        const sprite = this.sprites[i];
        if (!sprite)
            throw new Error('Sprite pool exhausted');
        return sprite;
    }
    drawGlyph(i, glyph, x, y, color, opacity = 1, lift = 0) {
        const sprite = this.spriteAt(i);
        sprite.texture = this.texture(glyph, this.reducedMotion ? 0 : Math.floor(this.ambience / 5) % 2);
        sprite.tint = color;
        sprite.alpha = opacity;
        // Counter-project glyphs while their anchors follow the diamond lattice.
        // Letters stay upright; terrain surfaces and lighting retain isometric depth.
        const scale = glyph === '✺' ? 1.7 : 1;
        const width = this.cellW * scale, height = this.cellH * scale;
        sprite.setFromMatrix(new Matrix(width / 80, -width / 80, height / 52, height / 52, x * this.cellW + this.cellW / 2, y * this.cellH + this.cellH / 2 - lift));
        sprite.zIndex = x + y + lift * .02;
        sprite.visible = true;
        return i + 1;
    }
    color(hex) { return Number.parseInt(hex.replace('#', ''), 16); }
    draw(state) {
        const started = performance.now();
        this.state = state;
        const ox = Math.max(0, Math.min(WIDTH - this.viewW, state.player.x - Math.floor(this.viewW / 2)));
        const oy = Math.max(0, Math.min(HEIGHT - this.viewH, state.player.y - Math.floor(this.viewH / 2)));
        const anchorX = (state.player.x - ox + .5) * this.cellW, anchorY = (state.player.y - oy + .5) * this.cellH;
        this.view.setFromMatrix(new Matrix(CAMERA_SCALE, CAMERA_SCALE * .5, -CAMERA_SCALE, CAMERA_SCALE * .5, this.viewW * this.cellW / 2 - CAMERA_SCALE * anchorX + CAMERA_SCALE * anchorY, this.viewH * this.cellH / 2 - CAMERA_SCALE * (anchorX + anchorY) / 2));
        const night = Math.floor(state.tick / 6000) % 4 >= 2;
        this.backdrop.clear();
        if (this.terrainSeed !== state.seed) {
            this.terrainSeed = state.seed;
            this.terrainCache.clear();
            this.floorKey = '';
        }
        const surfaceZone = coordsForZone(state.zone) !== null;
        const floorKey = `${state.seed}:${state.zone}:${state.tick}:${state.player.x},${state.player.y}:${this.cellW},${this.cellH}:${surfaceZone}:${night}`;
        const floorDirty = this.floorKey !== floorKey;
        if (floorDirty) {
            this.floorKey = floorKey;
            this.floorDraws++;
            this.terrainFloor.clear();
            this.terrainFloor.rect(0, 0, this.viewW * this.cellW, this.viewH * this.cellH).fill(0x080e17);
        }
        let used = 0;
        for (let cy = 0; cy < this.viewH; cy++)
            for (let cx = 0; cx < this.viewW; cx++) {
                const x = ox + cx, y = oy + cy, at = index(x, y);
                if (!state.seen[at])
                    continue;
                const glyph = state.tiles[at];
                const visible = state.visible[at] === 1;
                const terrain = this.terrain(state.seed, x, y), biomeKey = terrain.biome, biome = BIOMES[biomeKey];
                const dist = Math.hypot(x - state.player.x, y - state.player.y);
                const radius = night ? 7 : 12;
                const dim = visible ? Math.min(night ? .62 : .28, Math.max(0, (dist - radius * .35) / radius) * (night ? .55 : .28)) : 0;
                const alpha = visible ? Math.max(.32, (night ? .80 : 1) - dim) : .22;
                if (floorDirty) {
                    const groundColor = visible ? (surfaceZone ? biome.shadow : '#101722') : '#06090d';
                    this.terrainFloor.rect(cx * this.cellW, cy * this.cellH, this.cellW, this.cellH).fill({ color: this.color(groundColor), alpha: visible ? 1 : .55 });
                }
                const palette = visible && surfaceZone && ['.', ',', '*'].includes(glyph) ? biome.palette :
                    glyph === '#' ? '#697a75' : glyph === 'T' ? '#ffd085' : glyph === 'o' ? '#d5b1f2' : glyph === '?' ? '#f0a6db' : glyph === '!' ? '#fd7892' : glyph === '~' ? '#75d3e3' : glyph === '+' ? '#f5ce8b' : glyph === '&' ? '#a3e0a3' : glyph === '%' ? '#8ac8d3' : glyph === '=' ? '#b9d4cf' : '#c5bbaa';
                used = this.drawGlyph(used, terrainComposition(glyph, terrain.variant), cx, cy, this.color(palette), alpha, terrainHeight(glyph, terrainHash(state.seed + 119, x, y)));
                if (visible && (glyph === 'o' || glyph === 'T' || glyph === '?')) {
                    const shimmer = this.reducedMotion ? 0.13 : 0.12 + 0.06 * Math.sin(this.ambience * .3 + x);
                    this.backdrop.rect(cx * this.cellW + 2, cy * this.cellH + 2, this.cellW - 4, 2).fill({ color: 0xffd8a4, alpha: shimmer });
                }
            }
        // Nácar's cathedral: eight archive plinths surrounding the heart.
        // Decoration only; never change collision, visibility, navigation or saves.
        if (state.zone === 'zero-3') {
            const heartX = 14, heartY = 10;
            const plinths = [
                [10, 7], [14, 6], [18, 7], [20, 10], [18, 13], [14, 14], [10, 13], [8, 10]
            ];
            const heartSeen = state.seen[index(heartX, heartY)] === 1;
            if (heartSeen) {
                const cx = (heartX - ox + .5) * this.cellW, cy = (heartY - oy + .5) * this.cellH;
                const pulse = this.reducedMotion ? 0.22 : 0.16 + 0.055 * Math.sin(this.ambience * .18);
                for (const ring of [2.1, 3.7, 5.2]) {
                    this.backdrop.ellipse(cx, cy, ring * this.cellW, ring * this.cellH)
                        .stroke({ color: 0xb5d4c9, width: 1, alpha: pulse });
                }
            }
            for (let p = 0; p < plinths.length; p++) {
                const [wx, wy] = plinths[p];
                if (!within(wx, wy) || state.seen[index(wx, wy)] !== 1)
                    continue;
                const vx = wx - ox, vy = wy - oy;
                if (vx < 0 || vy < 0 || vx >= this.viewW || vy >= this.viewH)
                    continue;
                const lit = state.visible[index(wx, wy)] === 1;
                const x = (vx + .5) * this.cellW, y = (vy + .5) * this.cellH;
                const iconColor = p % 2 === 0 ? 0x91d2db : 0xd8b5a8;
                this.backdrop.circle(x, y, Math.max(3, this.cellW * .33))
                    .stroke({ color: iconColor, width: 1.25, alpha: lit ? .82 : .27 });
                this.backdrop.moveTo(x - 3, y).lineTo(x + 3, y).moveTo(x, y - 4).lineTo(x, y + 4)
                    .stroke({ color: iconColor, width: 1.2, alpha: lit ? .78 : .22 });
            }
        }
        // Gameplay warning one turn before the deterministic 400-tick strike.
        // Uses the SAME offsets as pulseNacar; does not mutate world state or RNG.
        const guardian = state.zone === 'zero-3' ? state.enemies.find(e => e.id === 'campaign-heart-custodian' && e.hp > 0) : null;
        if (guardian && state.tick % 400 === 300) {
            for (const mark of nacarMark(state.events, state.tick + 100)) {
                const warningColor = mark.phase === 1 ? 0x8fe8f2 : mark.phase === 2 ? 0xb9e78c : 0xff9b71;
                const tx = mark.x, ty = mark.y;
                if (!within(tx, ty) || !passable(state.tiles[index(tx, ty)]) || state.visible[index(tx, ty)] !== 1)
                    continue;
                const cx = tx - ox, cy = ty - oy;
                if (cx < 0 || cy < 0 || cx >= this.viewW || cy >= this.viewH)
                    continue;
                const alpha = this.reducedMotion ? .85 : .58 + .25 * Math.sin(this.ambience * .55);
                this.backdrop.rect(cx * this.cellW + 1, cy * this.cellH + 1, this.cellW - 2, this.cellH - 2).fill({ color: warningColor, alpha: .18 });
                this.backdrop.rect(cx * this.cellW + 2, cy * this.cellH + 2, this.cellW - 4, this.cellH - 4).stroke({ color: warningColor, width: 2, alpha });
                this.backdrop.moveTo(cx * this.cellW + 3, cy * this.cellH + 3).lineTo((cx + 1) * this.cellW - 3, (cy + 1) * this.cellH - 3).stroke({ color: warningColor, width: 1, alpha });
            }
        }
        for (const field of state.fields) {
            if (state.visible[index(field.x, field.y)] !== 1)
                continue;
            const x = field.x - ox, y = field.y - oy;
            if (x < 0 || y < 0 || x >= this.viewW || y >= this.viewH)
                continue;
            const def = FIELD_VISUALS[field.kind], color = this.color(def.color);
            this.backdrop.rect(x * this.cellW, y * this.cellH, this.cellW, this.cellH).fill({ color, alpha: this.reducedMotion ? .18 : .19 + .07 * Math.sin(this.ambience * .4 + x) });
            used = this.drawGlyph(used, `field:${field.kind}`, x, y, color, 1, terrainHeight(field.kind, terrainHash(state.seed + 119, field.x, field.y)) * .35);
        }
        for (const node of state.ecology.nodes) {
            if (node.zone !== state.zone || node.quantity <= 0 || state.visible[index(node.x, node.y)] !== 1)
                continue;
            const x = node.x - ox, y = node.y - oy;
            if (x < 0 || y < 0 || x >= this.viewW || y >= this.viewH)
                continue;
            used = this.drawGlyph(used, `resource:${node.kind}`, x, y, node.kind === 'crystal' ? 0xd6b5ff : 0x9fe9b4, 1, terrainHeight(state.tiles[index(node.x, node.y)], terrainHash(state.seed + 119, node.x, node.y)) * .35);
        }
        for (const item of state.ground) {
            if (state.visible[index(item.x, item.y)] !== 1)
                continue;
            const x = item.x - ox, y = item.y - oy;
            if (x < 0 || y < 0 || x >= this.viewW || y >= this.viewH)
                continue;
            used = this.drawGlyph(used, 'loot', x, y, 0xf6d48d, 1, terrainHeight(state.tiles[index(item.x, item.y)], terrainHash(state.seed + 119, item.x, item.y)) * .35);
        }
        for (const npc of [...(state.zone === 'surface' ? ACTORS : []), ...settlementCitizens(state.zone, state.tick)]) {
            if (state.visible[index(npc.x, npc.y)] !== 1)
                continue;
            const x = npc.x - ox, y = npc.y - oy;
            if (x < 0 || y < 0 || x >= this.viewW || y >= this.viewH)
                continue;
            this.backdrop.ellipse((x + .5) * this.cellW, (y + .76) * this.cellH, this.cellW * .48, this.cellH * .12).fill({ color: 0x020608, alpha: .28 });
            const npcLift = terrainHeight(state.tiles[index(npc.x, npc.y)], terrainHash(state.seed + 119, npc.x, npc.y)) * .35;
            used = this.drawGlyph(used, `npc:${npc.glyph}`, x, y, this.color(npc.color), 1, npcLift);
        }
        for (const enemy of state.enemies) {
            if (enemy.hp <= 0 || state.visible[index(enemy.x, enemy.y)] !== 1)
                continue;
            const x = enemy.x - ox, y = enemy.y - oy;
            if (x < 0 || y < 0 || x >= this.viewW || y >= this.viewH)
                continue;
            const def = ENEMY_DEFS[enemy.kind], nacar = enemy.id === 'campaign-heart-custodian', elite = enemy.id.startsWith('elite-') || nacar;
            this.backdrop.ellipse((x + .5) * this.cellW, (y + .78) * this.cellH, this.cellW * .5, this.cellH * .13).fill({ color: 0x020608, alpha: .34 });
            if (nacar) {
                // Persistent nonessential FX; stable in reduced-motion and ASCII modes.
                const phase = nacarPhase(enemy.hp, def.hp * 3);
                const haloColor = phase === 1 ? 0x8fe8f2 : phase === 2 ? 0xb9e78c : 0xff9b71;
                const alpha = this.reducedMotion ? .58 : .43 + .15 * Math.sin(this.ambience * .25);
                const centerX = (x + .5) * this.cellW, centerY = (y + .5) * this.cellH;
                this.backdrop.circle(centerX, centerY, Math.max(this.cellW, this.cellH) * .66).stroke({ color: haloColor, width: 2, alpha });
                for (let j = 0; j < 4; j++) {
                    const angle = j * Math.PI / 2 + Math.PI / 4;
                    this.backdrop.circle(centerX + Math.cos(angle) * this.cellW * .57, centerY + Math.sin(angle) * this.cellH * .49, 1.8).fill({ color: haloColor, alpha: .8 });
                }
            }
            if (state.targetId === enemy.id || elite)
                this.backdrop.rect(x * this.cellW, y * this.cellH, this.cellW, this.cellH).stroke({ width: 1.5, color: elite ? 0xef92fc : 0xffcb72, alpha: .9 });
            const flash = this.flashes.get(enemy.id);
            if (flash && flash.until > performance.now()) {
                const progress = 1 - (flash.until - performance.now()) / 320;
                this.backdrop.rect(x * this.cellW, y * this.cellH, this.cellW, this.cellH).fill({ color: flash.heavy ? 0xffc477 : 0xff6474, alpha: Math.max(0, (1 - progress) * .68) });
                this.backdrop.circle((x + .5) * this.cellW, (y + .5) * this.cellH, 3 + progress * 16).stroke({ color: flash.heavy ? 0xffdd99 : 0xff8999, width: 2, alpha: 1 - progress });
            }
            else if (flash)
                this.flashes.delete(enemy.id);
            const creatureGlyph = nacar ? '✺' : elite ? '◆' : def.glyph;
            const enemyLift = terrainHeight(state.tiles[index(enemy.x, enemy.y)], terrainHash(state.seed + 119, enemy.x, enemy.y)) * .35;
            used = this.drawGlyph(used, flash && flash.until > performance.now() ? `enemy:hurt:${creatureGlyph}` : creatureGlyph, x, y, flash && flash.until > performance.now() ? 0xff9d91 : nacar ? 0x92f9ef : elite ? 0xecb9ff : this.color(def.color), 1, enemyLift);
            const health = Math.max(0, Math.min(1, enemy.hp / (nacar ? def.hp * 3 : def.hp)));
            if (health < 1) {
                this.backdrop.rect(x * this.cellW + 1, y * this.cellH - 3, this.cellW - 2, 2).fill(0x492c33);
                this.backdrop.rect(x * this.cellW + 1, y * this.cellH - 3, (this.cellW - 2) * health, 2).fill(health > .45 ? 0xdcbf83 : 0xee7373);
            }
        }
        for (let depth = 0; depth < this.viewW + this.viewH - 1; depth++)
            for (let cx = 0; cx < this.viewW; cx++) {
                const cy = depth - cx;
                if (cy < 0 || cy >= this.viewH)
                    continue;
                const at = index(ox + cx, oy + cy), tile = state.tiles[at];
                if (!isOccludingTerrain(tile) || state.visible[at] !== 1)
                    continue;
                this.backdrop.rect(cx * this.cellW, cy * this.cellH + this.cellH * .72, this.cellW, this.cellH * .2).fill({ color: 0x020608, alpha: .18 });
            }
        const px = state.player.x - ox, py = state.player.y - oy;
        this.backdrop.ellipse((px + .5) * this.cellW, (py + .8) * this.cellH, this.cellW * .55, this.cellH * .14).fill({ color: 0x020608, alpha: .42 });
        this.backdrop.rect(px * this.cellW, py * this.cellH, this.cellW, this.cellH).fill(0x644829);
        this.backdrop.rect(px * this.cellW + .5, py * this.cellH + .5, this.cellW - 1, this.cellH - 1).stroke({ color: 0xffdd9d, width: 1.5 });
        const heroLift = terrainHeight(state.tiles[index(state.player.x, state.player.y)], terrainHash(state.seed + 119, state.player.x, state.player.y)) * .35;
        used = this.drawGlyph(used, state.stats.hp <= 0 ? 'hero:death' : this.heroAction && performance.now() < this.heroUntil ? `hero:${this.heroAction}` : '@', px, py, state.stats.hp > 0 ? 0xffe1a0 : 0xc78487, 1, heroLift);
        const timeLeft = this.effectUntil - performance.now();
        if (timeLeft > 0 && this.mutationEffect && !this.reducedMotion) {
            const progress = Math.min(1, Math.max(0, 1 - timeLeft / 420));
            const x = (px + .5) * this.cellW, y = (py + .5) * this.cellH;
            const colors = { 'kinetic-pulse': 0xe5b985, 'neural-shock': 0x9be9ff, 'pyrokinesis': 0xff875f, 'phase-step': 0xc19df7 };
            const color = colors[this.mutationEffect];
            if (this.mutationEffect === 'kinetic-pulse') {
                for (let i = 0; i < 3; i++)
                    this.backdrop.circle(x, y, 9 + progress * 72 + i * 11).stroke({ color, width: Math.max(.5, 2 - progress * 1.4), alpha: (1 - progress) * .5 });
            }
            else if (this.mutationEffect === 'pyrokinesis') {
                for (let i = 0; i < 11; i++) {
                    const a = i * 2.399 + progress, dist = 4 + progress * (17 + i % 4 * 4);
                    this.backdrop.circle(x + Math.cos(a) * dist, y - Math.abs(Math.sin(a) * dist), 2 + (i % 3)).fill({ color, alpha: 1 - progress });
                }
            }
            else if (this.mutationEffect === 'neural-shock') {
                for (let i = 0; i < 8; i++) {
                    const a = i * Math.PI / 4, d = 7 + progress * 62;
                    this.backdrop.moveTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7).lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d).stroke({ color, width: 1.7, alpha: 1 - progress });
                }
            }
            else {
                for (let i = 0; i < 4; i++) {
                    const offset = (i - 1.5) * (5 + progress * 14);
                    this.backdrop.rect(x + offset - 4, y - 18 - progress * 12, 8, 36 + progress * 24).stroke({ color, width: 1.6, alpha: (1 - progress) * .7 });
                }
            }
        }
        if (timeLeft <= 0)
            this.mutationEffect = null;
        if (timeLeft > 0 && !this.reducedMotion) {
            const phase = 1 - timeLeft / 300, color = this.effectKind === 'mutation' ? 0xbda5ff : this.effectKind === 'damage' ? 0xff6b74 : this.effectKind === 'attack' ? 0xffcb81 : 0x8de3dc;
            this.backdrop.circle(px * this.cellW + this.cellW / 2, py * this.cellH + this.cellH / 2, 7 + phase * 80).stroke({ color, width: 2, alpha: 1 - phase });
        }
        // Distinct non-animated field outlines remain readable in reduced-motion mode.
        for (const field of state.fields) {
            if (state.visible[index(field.x, field.y)] !== 1)
                continue;
            const x = field.x - ox, y = field.y - oy;
            if (x < 0 || y < 0 || x >= this.viewW || y >= this.viewH)
                continue;
            const color = field.kind === 'electric' ? 0x8df8e8 : field.kind === 'fire' ? 0xff9a68 : 0xb8e98c;
            const alpha = this.reducedMotion ? .9 : .55 + .25 * Math.sin(performance.now() / 95 + x);
            this.backdrop.rect(x * this.cellW + 1, y * this.cellH + 1, this.cellW - 2, this.cellH - 2).stroke({ color, width: 2, alpha });
            if (field.x === state.player.x && field.y === state.player.y) {
                this.backdrop.rect(x * this.cellW + 2, y * this.cellH + 2, this.cellW - 4, this.cellH - 4).stroke({ color: 0xffeff0, width: 2, alpha: .95 });
            }
        }
        for (let i = this.fieldBursts.length - 1; i >= 0; i--) {
            const burst = this.fieldBursts[i], left = burst.until - performance.now();
            if (left <= 0) {
                this.fieldBursts.splice(i, 1);
                continue;
            }
            if (state.visible[index(burst.x, burst.y)] !== 1)
                continue;
            const x = burst.x - ox, y = burst.y - oy, progress = 1 - left / 520;
            const color = burst.kind === 'electric' ? 0xa2f9f2 : burst.kind === 'fire' ? 0xffae78 : 0xb3ef9e;
            this.backdrop.circle((x + .5) * this.cellW, (y + .5) * this.cellH, 4 + progress * 26).stroke({ color, width: 2, alpha: 1 - progress });
        }
        const burstTime = performance.now();
        for (let i = this.bossBursts.length - 1; i >= 0; i--) {
            const burst = this.bossBursts[i], left = burst.until - burstTime;
            if (left <= 0) {
                this.bossBursts.splice(i, 1);
                continue;
            }
            const cx = (burst.x - ox + .5) * this.cellW, cy = (burst.y - oy + .5) * this.cellH;
            if (cx < 0 || cy < 0 || cx >= this.viewW * this.cellW || cy >= this.viewH * this.cellH)
                continue;
            const progress = 1 - left / 900;
            for (let ring = 0; ring < 3; ring++) {
                const radius = 6 + progress * 55 + ring * 10;
                this.backdrop.circle(cx, cy, radius).stroke({ color: burst.color, width: Math.max(.6, 2.5 - progress * 1.8), alpha: (1 - progress) * .7 });
            }
            for (let shard = 0; shard < 8; shard++) {
                const angle = shard * Math.PI / 4 + progress * .35, dist = 9 + progress * (18 + shard % 3 * 9);
                this.backdrop.circle(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, Math.max(.5, 3 * (1 - progress))).fill({ color: burst.color, alpha: 1 - progress });
            }
        }
        const currentTime = performance.now();
        for (let i = this.echoes.length - 1; i >= 0; i--) {
            const e = this.echoes[i], remaining = e.until - currentTime;
            if (remaining <= 0) {
                this.echoes.splice(i, 1);
                continue;
            }
            const phase = 1 - remaining / 450, cx = (e.x - ox + .5) * this.cellW, cy = (e.y - oy + .5) * this.cellH;
            const vx = e.x - ox, vy = e.y - oy;
            if (vx >= 0 && vy >= 0 && vx < this.viewW && vy < this.viewH && state.visible[index(e.x, e.y)] === 1)
                used = this.drawGlyph(used, `enemy:death:${e.glyph}`, vx, vy, 0xe8a0a0, 1 - phase);
            for (let n = 0; n < 8; n++) {
                const a = n * Math.PI / 4 + phase * .5, r = 3 + phase * 20;
                this.backdrop.circle(cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.max(.5, 2.5 * (1 - phase))).fill({ color: n % 2 ? 0xf5d29c : 0xb6a5ec, alpha: 1 - phase });
            }
        }
        // Hide only objects used in the previous scene (not the entire pool).
        for (let i = used; i < this.activeSprites; i++)
            this.sprites[i].visible = false;
        this.activeSprites = used;
        this.peakActiveSprites = Math.max(this.peakActiveSprites, used);
        this.ambience++;
        this.lastBuildMs = performance.now() - started;
        this.totalBuildMs += this.lastBuildMs;
        this.buildCount++;
    }
    zoom(dir) {
        this.fontSize = Math.max(13, Math.min(25, this.fontSize + dir));
        this.cellW = Math.round(this.fontSize * .83);
        this.cellH = this.fontSize + 5;
        this.floorKey = '';
        this.app.renderer.resize(this.viewW * this.cellW, this.viewH * this.cellH);
        this.view.setFromMatrix(new Matrix(CAMERA_SCALE, CAMERA_SCALE * .5, -CAMERA_SCALE, CAMERA_SCALE * .5, this.viewW * this.cellW / 2, this.viewH * this.cellH / 2));
        if (this.state)
            this.draw(this.state);
    }
    focus() {
        this.app.canvas.focus({ preventScroll: true });
        this.mount.scrollLeft = Math.max(0, (this.app.canvas.clientWidth - this.mount.clientWidth) / 2);
    }
    effect(state, kind) {
        if (this.reducedMotion)
            return;
        this.effectKind = kind;
        this.effectUntil = performance.now() + 300;
        this.draw(state);
    }
    mutationFeedback(state, mutation) {
        if (this.reducedMotion)
            return;
        this.mutationEffect = mutation;
        this.effectKind = 'mutation';
        this.effectUntil = performance.now() + 420;
        this.draw(state);
    }
    startAmbience() {
        if (this.reducedMotion || this.ambientFrame)
            return;
        const loop = (now) => {
            this.ambientFrame = 0;
            if (document.visibilityState === 'hidden' || !this.state)
                return;
            if (now - this.lastAmbient >= 125) {
                this.lastAmbient = now;
                const biome = biomeAt(this.state.seed, this.state.player.x, this.state.player.y);
                if (this.flashes.size > 0 || this.echoes.length > 0 || this.fieldBursts.length > 0 || this.bossBursts.length > 0 || this.state.fields.length > 0 || weatherAt(this.state.seed, this.state.tick, biome) !== 'calma' || this.effectUntil > now)
                    this.draw(this.state);
            }
            this.ambientFrame = requestAnimationFrame(loop);
        };
        this.ambientFrame = requestAnimationFrame(loop);
    }
    pauseAmbience() { if (this.ambientFrame)
        cancelAnimationFrame(this.ambientFrame); this.ambientFrame = 0; }
    setReducedMotion(value) {
        this.reducedMotion = value;
        if (value) {
            this.pauseAmbience();
            this.effectUntil = 0;
            this.heroUntil = 0;
            if (this.heroTimer)
                clearTimeout(this.heroTimer);
            this.heroTimer = 0;
            this.flashes.clear();
            this.echoes.length = 0;
            this.fieldBursts.length = 0;
            this.bossBursts.length = 0;
        }
        if (this.state)
            this.draw(this.state);
    }
    heroFeedback(state, action) {
        if (this.reducedMotion)
            return;
        this.heroAction = action;
        this.heroUntil = performance.now() + 320;
        if (this.heroTimer)
            clearTimeout(this.heroTimer);
        this.heroTimer = window.setTimeout(() => { this.heroTimer = 0; if (this.state)
            this.draw(this.state); }, 340);
        this.draw(state);
    }
    renderMinimap(state, canvas) { this.old.renderMinimap(state, canvas); }
}
