"""Build handcrafted, biome-specific low-resolution 16-bit sprite families."""
from pathlib import Path
import json
import math
from PIL import Image, ImageDraw

ROOT = Path('apps/web/public/isometric')
SOURCE = Image.open(ROOT / 'nacar.png').convert('RGBA')
SOURCE_META = json.loads((ROOT / 'nacar.json').read_text())
SCALE = Image.Resampling.NEAREST
COLS = 8
W, H = 96, 128
LOW_W, LOW_H = 48, 64

PALETTES = {
 'salinas': {
    'void': '#111923', 'outline': '#30383a', 'shadow': '#4b5354',
    'stone': '#777a72', 'mid': '#a5a38f', 'light': '#d2cbb5',
    'bright': '#eee5ce', 'warm': '#c2b499', 'gold': '#927f65',
    'teal': '#49c2ba', 'glow': '#a4f5e5', 'deep_teal': '#267c7b',
    'crimson': '#87394d', 'dark_red': '#512d3c', 'dust': '#8c8a7b',
 },
 'ceniza': {'void':'#171615','outline':'#332b27','shadow':'#51403a','stone':'#69564d','mid':'#8d7060','light':'#bd9270','bright':'#e7bb87','warm':'#a67a5d','gold':'#805d49','teal':'#e27643','glow':'#ffd08a','deep_teal':'#a64d35','crimson':'#a33d32','dark_red':'#542b2c','dust':'#716057'},
 'hierro': {'void':'#10191c','outline':'#27383b','shadow':'#3d5558','stone':'#5e7778','mid':'#82999a','light':'#afc0b7','bright':'#e2e0c9','warm':'#a68c6b','gold':'#79674f','teal':'#56c9bd','glow':'#b8fff0','deep_teal':'#287e83','crimson':'#9e4e4c','dark_red':'#542f38','dust':'#66787a'},
 'vidrio': {'void':'#111a26','outline':'#2d4152','shadow':'#526b80','stone':'#718ca0','mid':'#a3bdca','light':'#c9e2e6','bright':'#f0ffff','warm':'#9ab7c5','gold':'#66889c','teal':'#60d9ed','glow':'#c9ffff','deep_teal':'#348da9','crimson':'#a54d71','dark_red':'#57344d','dust':'#8298a3'},
 'medula': {'void':'#1c151a','outline':'#45333a','shadow':'#694a51','stone':'#89646a','mid':'#b08382','light':'#d2a9a0','bright':'#f0d5bb','warm':'#c0907b','gold':'#906b5b','teal':'#66b9aa','glow':'#c8ffe0','deep_teal':'#397d78','crimson':'#bd5268','dark_red':'#633344','dust':'#987c75'},
 'umbral': {'void':'#151321','outline':'#332d48','shadow':'#51496c','stone':'#6b6484','mid':'#9489ab','light':'#b8afca','bright':'#e2ddf0','warm':'#a18d9a','gold':'#75677f','teal':'#8e80d4','glow':'#d5c8ff','deep_teal':'#5147a0','crimson':'#b65378','dark_red':'#582e57','dust':'#777187'},
}
P = PALETTES['salinas']


def polygon(draw, points, color):
    draw.polygon(points, fill=P[color])


def line(draw, points, color, width=1):
    draw.line(points, fill=P[color], width=width, joint='curve')


def floor_tile(v):
    im = Image.new('RGBA', (LOW_W, LOW_H))
    d = ImageDraw.Draw(im)
    # Layered diamond slab with a dark edge, bevel and a broad quiet surface.
    polygon(d, [(24, 47), (42, 55), (24, 64), (6, 56)], 'outline')
    polygon(d, [(24, 48), (40, 55), (24, 61), (8, 55)], 'stone')
    polygon(d, [(24, 49), (39, 55), (24, 60), (9, 55)], 'mid')
    line(d, [(9, 55), (24, 49), (38, 55)], 'bright')
    line(d, [(24, 60), (39, 55)], 'shadow')
    # The repeat is broken by different authored slab seams and salt deposits.
    if v in (0, 3):
        line(d, [(14, 55), (19, 53), (22, 54)], 'light')
        line(d, [(27, 52), (31, 54), (35, 54)], 'stone')
        line(d, [(20, 57), (24, 56), (27, 57)], 'bright')
    elif v == 1:
        line(d, [(17, 52), (20, 54), (18, 56), (22, 58)], 'gold')
        line(d, [(30, 52), (28, 55), (32, 57)], 'light')
    elif v == 2:
        line(d, [(11, 55), (16, 54), (19, 56)], 'warm')
        line(d, [(28, 52), (30, 53), (33, 53)], 'teal')
        d.point((34, 54), fill=P['glow'])
    elif v == 4:
        polygon(d, [(14, 55), (17, 53), (19, 54), (16, 56)], 'bright')
        polygon(d, [(27, 57), (30, 55), (32, 56), (29, 58)], 'warm')
        d.point((18, 53), fill=P['glow'])
    else:
        line(d, [(19, 53), (22, 51), (25, 53), (22, 55), (19, 53)], 'deep_teal')
        d.point((22, 53), fill=P['glow'])
        line(d, [(29, 57), (33, 55)], 'gold')
    # Small clustered grain, not random one-pixel noise.
    for x, y, tone in [(12,55,'bright'), (16,57,'dust'), (25,52,'light'),
                       (34,56,'bright'), (21,59,'stone')]:
        if (x + y + v) % 3 != 0:
            d.point((x, y), fill=P[tone])
    return im


def salt_rock(v):
    im = Image.new('RGBA', (LOW_W, LOW_H))
    d = ImageDraw.Draw(im)
    polygon(d, [(13, 59), (34, 59), (40, 62), (10, 62)], 'outline')
    shapes = [
        [(15,56),(16,39),(21,34),(25,42),(27,57)],
        [(12,57),(17,43),(21,40),(25,50),(25,59)],
        [(10,58),(15,48),(18,34),(22,42),(27,38),(33,52),(34,59)],
    ]
    polygon(d, shapes[v], 'stone')
    if v == 0:
        polygon(d, [(16,55),(17,40),(21,35),(22,49),(20,57)], 'light')
        line(d, [(21,38),(23,45),(26,47)], 'bright')
        line(d, [(17,51),(20,48),(22,50)], 'warm')
    elif v == 1:
        polygon(d, [(13,55),(18,44),(20,42),(19,54)], 'light')
        polygon(d, [(20,54),(22,46),(24,51),(24,58)], 'shadow')
        d.point((18,43), fill=P['bright'])
    else:
        polygon(d, [(11,56),(16,49),(18,36),(20,48),(24,40),(25,56)], 'mid')
        polygon(d, [(25,56),(28,44),(32,52),(33,58)], 'light')
        line(d, [(18,41),(20,45),(23,45)], 'bright')
    if v == 1:
        line(d, [(20,48),(19,52),(22,55)], 'teal')
        d.point((19,47), fill=P['glow'])
    return im


def bone_coral(v):
    im = Image.new('RGBA', (LOW_W, LOW_H))
    d = ImageDraw.Draw(im)
    polygon(d, [(13,60),(34,60),(39,63),(10,63)], 'outline')
    line(d, [(23,60),(22,46),(25,38),(23,27)], 'warm', 3)
    if v == 0:
        line(d, [(23,47),(16,42),(13,33)], 'light', 2)
        line(d, [(24,44),(31,39),(34,30)], 'bright', 2)
        line(d, [(22,38),(18,33),(18,27)], 'warm')
        tips=[(13,31),(18,25),(34,28),(23,25)]
    elif v == 1:
        line(d, [(22,48),(15,45),(11,37)], 'light', 2)
        line(d, [(24,43),(31,44),(37,37)], 'bright', 2)
        line(d, [(23,36),(27,32),(27,25)], 'warm')
        tips=[(11,35),(18,42),(37,35),(27,23)]
    else:
        line(d, [(22,49),(16,44),(15,37)], 'bright', 2)
        line(d, [(24,43),(31,36),(32,27)], 'light', 2)
        line(d, [(23,37),(19,32),(20,26)], 'warm')
        tips=[(15,34),(20,24),(32,25),(36,35)]
    for i,(x,y) in enumerate(tips):
        polygon(d, [(x-2,y+2),(x-1,y-2),(x+1,y-3),(x+2,y+1)], 'teal' if i%2==0 else 'deep_teal')
        d.point((x,y-1), fill=P['glow'])
    line(d, [(18,53),(22,51),(26,53),(29,52)], 'light')
    return im


def salt_arch(v):
    im = Image.new('RGBA', (LOW_W, LOW_H))
    d = ImageDraw.Draw(im)
    if v == 0:
        polygon(d, [(9,60),(12,50),(18,45),(22,52),(27,48),(35,56),(39,62),(24,64)], 'shadow')
        polygon(d, [(12,52),(18,46),(21,53),(16,56)], 'light')
        polygon(d, [(23,53),(28,49),(34,57),(27,58)], 'stone')
        d.point((31,57), fill=P['teal'])
    elif v == 1:
        # Ribbed bone arch, with broken feet and a cyan relic at the keystone.
        line(d, [(11,62),(13,43),(18,35),(24,32),(30,36),(35,45),(37,62)], 'shadow', 5)
        line(d, [(14,59),(16,44),(20,38),(24,36),(28,39),(33,46),(34,60)], 'bright', 2)
        polygon(d, [(19,62),(20,46),(24,41),(28,46),(29,63)], 'outline')
        line(d, [(12,45),(17,46)], 'warm', 2)
        d.rectangle((23,34,25,37), fill=P['glow'])
    else:
        # A landmark shrine: two carved piers, lintel and hanging signal stone.
        polygon(d, [(9,63),(10,25),(15,19),(19,26),(19,62)], 'stone')
        polygon(d, [(30,62),(30,27),(34,19),(39,25),(40,62)], 'shadow')
        polygon(d, [(11,28),(15,15),(19,26),(31,26),(35,15),(39,27)], 'light')
        polygon(d, [(19,62),(20,35),(24,30),(29,35),(30,63)], 'outline')
        line(d, [(13,31),(14,55)], 'bright', 2)
        line(d, [(34,31),(35,55)], 'mid', 2)
        d.rectangle((23,29,25,32), fill=P['teal'])
        d.point((24,30), fill=P['glow'])
    return im


def hand_painted(name, biome):
    kind, _, suffix = name.rpartition('-')
    if name.startswith(f'floor-{biome}-'):
        return floor_tile(int(suffix))
    if name.startswith(f'rock-{biome}-'):
        return salt_rock(int(suffix))
    if name.startswith(f'flora-{biome}-'):
        return bone_coral(int(suffix))
    if name.startswith(f'wall-{biome}-'):
        return salt_arch(int(suffix))
    return None


biomes = tuple(PALETTES)
environment = [name for name in SOURCE_META if name.startswith(tuple(f'{kind}-{biome}-' for biome in biomes for kind in ('floor','rock','flora','wall')))]
actors = [name for name in SOURCE_META if name.startswith(('hero-', 'npc-', 'crawler-', 'sentinel-', 'larva-', 'moth-', 'drone-', 'spore-', 'elite-', 'boss-'))]
names = environment + actors
cols = COLS
rows = math.ceil(len(names) / cols)
sheet = Image.new('RGBA', (cols * W, rows * H))
meta = {}
for index, name in enumerate(names):
    source_meta = SOURCE_META[name]
    sx, sy, sw, sh = source_meta['rect']
    src = SOURCE.crop((sx, sy, sx + sw, sy + sh))
    biome = next((b for b in biomes if name.startswith(('floor-','rock-','flora-','wall-')) and name.startswith(tuple(f'{kind}-{b}-' for kind in ('floor','rock','flora','wall')))), None)
    if biome:
        P = PALETTES[biome]
    sprite = hand_painted(name, biome) if biome else None
    if sprite is None:
        # Actors keep their anatomy and animation, but are redrawn onto a true
        # 48×64 pixel grid rather than filtered after the whole scene is painted.
        sprite = src.resize((LOW_W, LOW_H), SCALE)
    sprite = sprite.resize((W, H), SCALE)
    x, y = (index % cols) * W, (index // cols) * H
    sheet.alpha_composite(sprite, (x, y))
    meta[name] = {'rect': [x, y, W, H], 'pivot': source_meta['pivot']}

sheet.save(ROOT / 'nacar-salinas-16bit.png', optimize=True)
(ROOT / 'nacar-salinas-16bit.json').write_text(json.dumps(meta, indent=2) + '\n')
print(f'Generated {len(meta)} low-resolution 16-bit sprites in {ROOT}')
