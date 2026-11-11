"""Build handcrafted, biome-specific low-resolution 16-bit sprite families."""
from pathlib import Path
import json
import math
from PIL import Image, ImageDraw, ImageOps

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


def floor_salinas(v):
    original_v = v
    im = Image.new('RGBA', (LOW_W, LOW_H))
    d = ImageDraw.Draw(im)
    # Layered diamond slab with a dark edge, bevel and a broad quiet surface.
    polygon(d, [(24, 47), (42, 55), (24, 64), (6, 56)], 'outline')
    polygon(d, [(24, 48), (40, 55), (24, 61), (8, 55)], 'stone')
    polygon(d, [(24, 49), (39, 55), (24, 60), (9, 55)], 'mid')
    line(d, [(9, 55), (24, 49), (38, 55)], 'bright')
    line(d, [(24, 60), (39, 55)], 'shadow')
    # The repeat is broken by different authored slab seams and salt deposits.
    original_v = v
    v %= 3
    if v == 0:
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
    if original_v >= 3:
        marks=[[(13,54),(19,52),(23,54)],[(31,53),(26,52),(23,55)],[(15,57),(20,54),(24,56)]][original_v-3]
        line(d,marks,'teal' if original_v != 4 else 'gold',2)
        d.point([(20,53),(29,54),(18,55)][original_v-3],fill=P['glow'])
    if original_v >= 3:
        v = original_v
        profiles=[[(9,55),(24,48),(39,55),(24,62)],[(8,56),(22,48),(40,54),(25,61)],[(10,54),(25,49),(40,56),(23,62)]]
        polygon(d,profiles[(v-3)%3],'shadow')
        polygon(d,[(11,55),(24,50),(37,55),(24,59)],'mid')
        line(d,[(11,55),(24,50),(37,55)],'bright')
        line(d,[(24,59),(37,55)],'shadow')
        if v == 3: line(d,[(15,55),(19,53),(22,55),(27,52)],'teal')
        elif v == 4: polygon(d,[(18,54),(22,51),(25,54),(21,57)],'bright')
        else: line(d,[(29,52),(26,55),(30,57),(34,54)],'gold')
    # Small clustered grain, not random one-pixel noise.
    for x, y, tone in [(12,55,'bright'), (16,57,'dust'), (25,52,'light'),
                       (34,56,'bright'), (21,59,'stone')]:
        if (x + y + v) % 3 != 0:
            d.point((x, y), fill=P[tone])
    return im


def rock_salinas(v):
    im = Image.new('RGBA', (LOW_W, LOW_H))
    d = ImageDraw.Draw(im)
    original_v = v
    v %= 3
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
    if v >= 3:
        profiles=[[(11,58),(14,48),(18,40),(20,45),(25,29),(28,43),(34,37),(39,56),(34,60)],[(10,58),(17,45),(20,35),(24,42),(28,31),(31,49),(38,43),(40,58),(34,60)],[(12,58),(17,51),(20,38),(23,44),(27,33),(31,41),(36,34),(40,57),(34,60)]]
        polygon(d,profiles[v-3],'stone')
        line(d,[(18,49),(22,43),(25,35)],'light',2)
        line(d,[(27,49),(31,45),(35,43)],'warm')
        d.point((24+(v-3)*2,37),fill=P['bright'])
    if v == 1:
        line(d, [(20,48),(19,52),(22,55)], 'teal')
        d.point((19,47), fill=P['glow'])
    if original_v >= 3:
        profiles=[[(12,58),(15,47),(21,39),(25,45),(29,36),(36,46),(39,58),(34,60)],[(11,58),(16,51),(20,34),(25,43),(30,31),(36,49),(39,58)],[(12,58),(17,45),(20,49),(26,35),(30,43),(35,34),(39,58)]][original_v-3]
        polygon(d,profiles,'light' if original_v==4 else 'mid')
        line(d,[(18,51),(22,45),(26,40)],'bright',2)
    return im


def flora_salinas(v):
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
    if v >= 3:
        # Alternate salt shrubs with forked, wind-bent and crown silhouettes.
        if v == 3:
            line(d,[(23,60),(25,49),(19,42),(18,31)],'warm',3);line(d,[(24,50),(31,46),(35,39)],'light',2)
            tips=[(18,29),(35,37),(21,39),(29,43)]
        elif v == 4:
            line(d,[(23,60),(22,48),(27,40),(30,29)],'warm',3);line(d,[(23,50),(16,45),(13,36)],'bright',2)
            tips=[(30,27),(13,34),(20,42),(26,37)]
        else:
            line(d,[(24,60),(24,48),(20,42),(22,32)],'warm',3);line(d,[(24,49),(32,43),(33,32)],'light',2)
            tips=[(22,29),(33,29),(16,40),(29,39)]
    for i,(x,y) in enumerate(tips):
        polygon(d, [(x-2,y+2),(x-1,y-2),(x+1,y-3),(x+2,y+1)], 'teal' if i%2==0 else 'deep_teal')
        d.point((x,y-1), fill=P['glow'])
    line(d, [(18,53),(22,51),(26,53),(29,52)], 'light')
    return im


def arch_salinas(v):
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
    if v >= 3:
        # Three new shrine profiles: collapsed ring, split pillars and altar gate.
        d=ImageDraw.Draw(im)
        if v == 3:
            line(d,[(11,62),(13,43),(19,34),(25,31),(33,38),(36,60)],'shadow',5)
            line(d,[(15,59),(17,44),(22,38),(27,38),(32,45)],'bright',2)
            polygon(d,[(19,63),(21,49),(25,45),(29,50),(29,63)],'outline')
            d.rectangle((23,34,26,38),fill=P['glow'])
        elif v == 4:
            polygon(d,[(10,63),(12,31),(17,23),(21,32),(19,63)],'stone')
            polygon(d,[(29,63),(31,29),(36,19),(40,34),(38,63)],'shadow')
            line(d,[(14,30),(18,34),(24,31),(34,28)],'light',3)
            polygon(d,[(20,63),(20,44),(24,39),(28,44),(29,63)],'outline')
            d.point((24,33),fill=P['teal']);d.point((25,33),fill=P['glow'])
        else:
            polygon(d,[(9,63),(12,42),(17,37),(20,45),(20,63)],'shadow')
            polygon(d,[(29,63),(29,43),(34,36),(39,42),(40,63)],'stone')
            polygon(d,[(14,40),(18,31),(24,28),(30,32),(35,40),(30,43),(18,43)],'light')
            line(d,[(17,52),(22,47),(27,52),(33,47)],'bright',2)
            d.ellipse((22,30,26,34),fill=P['glow'])
    return im


def floor_for_biome(biome, v):
    if biome == 'salinas': return floor_salinas(v)
    im=Image.new('RGBA',(LOW_W,LOW_H));d=ImageDraw.Draw(im)
    polygon(d,[(24,47),(42,55),(24,64),(6,56)],'outline')
    polygon(d,[(24,48),(40,55),(24,61),(8,55)],'stone')
    polygon(d,[(24,49),(39,55),(24,60),(9,55)],'mid')
    line(d,[(9,55),(24,49),(38,55)],'light');line(d,[(24,60),(39,55)],'shadow')
    if biome == 'ceniza':
        cracks=[[(14,55),(18,53),(21,54),(23,52)],[(31,54),(27,53),(25,55),(22,53)],[(16,57),(20,55),(22,56),(25,53)],[(32,55),(29,57),(26,55),(23,58)],[(13,54),(17,56),(21,54),(24,56)],[(34,55),(30,53),(27,55),(24,52)]][v]
        line(d,cracks,'gold' if v%2==0 else 'light');d.point([(18,53),(28,53),(21,56),(30,56),(16,55),(27,54)][v],fill=P['glow'] if v in (0,3,5) else P['teal'])
    elif biome == 'hierro':
        # Plate seams and rivet rows move with each slab construction.
        line(d,[(11+v%3,53),(18,51+v%3),(23,54),(29,51+v%3),(37-v%2,54)],'outline',2)
        line(d,[(13,57+v%2),(20,54),(24,57),(33,54+v%2)],'teal' if v%2 else 'shadow')
        for x,y in [(14+v%3,54),(20,52+v%2),(29,55),(35-v%2,53)]:d.point((x,y),fill=P['bright'])
    elif biome == 'vidrio':
        facets=[[(13,55),(19,52),(23,54),(18,57)],[(27,53),(32,50),(36,53),(31,56)],[(15,54),(20,51),(24,53),(19,56)],[(25,55),(30,51),(35,54),(29,58)],[(11,55),(17,52),(21,54),(16,58)],[(29,54),(34,51),(38,54),(33,57)]][v]
        polygon(d,facets,'bright');line(d,[(14+v%3,55),(19,52),(22,54)],'glow');d.point((29+v%4,53),fill=P['teal'])
    elif biome == 'medula':
        line(d,[(11,55),(16,52+v%3),(21,54),(24,50+v%4),(29,54),(36,52+v%3)],'warm',2)
        line(d,[(14,57),(20,55),(24,57),(30,55),(35,57)],'light')
        d.point((24,51+v%4),fill=P['crimson']);d.point((17+v%4,54),fill=P['glow'])
    else:
        # Broken plates around a shifting star-shaped fracture.
        polygon(d,[(11,55),(17,51+v%3),(22,54),(17,58)],'shadow')
        polygon(d,[(26,54),(32,50+v%3),(38,55),(30,58)],'stone')
        stars=[[(22,51),(24,54),(21,56),(24,58),(26,54)],[(20,52),(23,54),(21,57),(25,58),(27,54)],[(23,50),(24,53),(21,55),(23,58),(27,55)],[(21,51),(24,53),(22,56),(25,59),(27,54)],[(22,52),(25,53),(22,55),(24,58),(27,56)],[(20,54),(23,52),(24,55),(27,53),(25,58)]][v]
        line(d,stars,'deep_teal');d.point(stars[1],fill=P['glow'])
    return im


def rock_for_biome(biome, v):
    if biome == 'salinas': return rock_salinas(v)
    im=Image.new('RGBA',(LOW_W,LOW_H));d=ImageDraw.Draw(im)
    polygon(d,[(11,59),(34,59),(40,62),(9,63)],'outline')
    # Six authored profiles per region; silhouette, facet direction and accent
    # placement change together so the variants remain distinct at game scale.
    profiles={
      'ceniza': [
        [(13,58),(16,43),(21,38),(23,30),(28,40),(31,35),(36,53),(34,60)],
        [(12,58),(17,48),(19,34),(23,42),(28,29),(30,46),(37,54),(34,60)],
        [(10,58),(15,44),(18,47),(22,32),(25,43),(31,38),(36,55),(34,60)],
        [(13,58),(17,50),(19,39),(24,28),(27,45),(32,34),(37,56),(34,60)],
        [(11,58),(15,47),(21,40),(22,33),(27,41),(34,39),(38,56),(33,60)],
        [(12,58),(18,43),(20,48),(25,31),(29,42),(34,33),(38,57),(33,60)],
      ],
      'hierro': [
        [(13,59),(15,47),(18,46),(19,33),(23,36),(25,46),(29,43),(32,52),(37,57)],
        [(11,59),(15,50),(17,37),(21,42),(25,30),(27,49),(31,39),(38,56)],
        [(12,59),(17,45),(20,48),(22,34),(26,40),(30,32),(33,52),(38,57)],
        [(10,59),(14,48),(19,43),(20,31),(24,39),(29,36),(34,46),(39,57)],
        [(12,59),(16,52),(18,40),(23,45),(27,33),(29,49),(35,42),(38,57)],
        [(11,59),(16,45),(19,49),(22,35),(26,44),(32,30),(35,51),(39,58)],
      ],
      'vidrio': [
        [(12,58),(16,46),(19,47),(20,28),(24,42),(28,31),(31,47),(35,43),(38,58)],
        [(10,58),(15,42),(18,45),(23,25),(25,46),(30,34),(33,48),(39,58)],
        [(12,58),(17,50),(20,33),(23,43),(27,27),(30,46),(36,38),(39,57)],
        [(10,58),(14,49),(19,35),(21,47),(26,29),(29,42),(35,31),(39,58)],
        [(11,58),(16,44),(20,46),(24,31),(27,47),(32,26),(36,43),(39,58)],
        [(10,58),(15,48),(18,30),(23,42),(28,35),(31,48),(35,33),(39,58)],
      ],
      'medula': [
        [(12,59),(14,48),(18,45),(19,37),(23,42),(25,32),(29,42),(34,45),(37,57)],
        [(11,59),(15,47),(17,39),(22,44),(24,29),(28,43),(33,38),(38,58)],
        [(12,59),(16,51),(19,42),(22,47),(27,31),(29,45),(35,41),(38,58)],
        [(10,59),(14,49),(20,43),(21,34),(26,40),(31,32),(35,48),(39,58)],
        [(12,59),(17,46),(20,49),(24,35),(28,42),(32,37),(37,52),(39,58)],
        [(10,59),(14,46),(19,40),(23,45),(27,30),(31,44),(36,39),(39,58)],
      ],
      'umbral': [
        [(10,57),(15,47),(20,49),(23,35),(27,43),(32,40),(38,55),(33,60),(17,60)],
        [(10,57),(14,43),(19,48),(21,32),(26,40),(30,47),(37,51),(36,59)],
        [(11,58),(16,50),(19,37),(24,45),(28,33),(31,45),(39,56),(34,60)],
        [(9,58),(15,46),(20,42),(22,34),(26,47),(32,36),(38,53),(35,59)],
        [(11,58),(16,44),(20,49),(25,31),(29,44),(34,40),(39,57),(34,60)],
        [(10,58),(14,48),(19,45),(23,36),(27,42),(32,31),(38,52),(36,60)],
      ],
    }
    polygon(d,profiles[biome][v],'shadow')
    if biome == 'ceniza':
        for pts in [[(22,48),(23,39),(25,36)],[(18,51),(21,43),(22,38)],[(26,51),(25,44),(28,39)],[(20,48),(24,42),(24,35)],[(29,51),(27,45),(31,42)],[(18,52),(23,44),(24,38)]][v]:
            line(d,pts,'teal',2)
        d.point([(24,42),(28,36),(22,39),(25,34),(31,44),(24,40)][v],fill=P['glow'])
    elif biome == 'hierro':
        line(d,[(15+v%3,47),(22,43+v%4),(29,49)],'teal',2)
        for x,y in [(18+v%4,49),(27,43+v%5),(22+v%3,36+v%5)]:d.point((x,y),fill=P['bright'])
        polygon(d,[(14,55),(20+v%4,50),(24,55),(18,58)],'light')
    elif biome == 'vidrio':
        facets=[[(20,51),(21,32),(24,43),(24,56)],[(16,50),(18,39),(21,46)],[(25,52),(27,34),(29,45)],[(18,52),(20,37),(23,45)],[(28,53),(30,32),(32,45)],[(21,54),(23,36),(26,45)] ]
        polygon(d,facets[v],'bright')
        line(d,[(18+v%3,37),(21+v%2,46)],'glow')
    elif biome == 'medula':
        line(d,[(24,58),(23,47),(26-v%3,41),(25,34+v%5)],'bright',3)
        line(d,[(23,48),(17,45-v%3),(15,40)],'light',2)
        line(d,[(26,47),(32,43),(35-v%3,38)],'warm',2)
        d.point((25,35+v%5),fill=P['crimson'])
    else:
        polygon(d,[(18,53),(23,39+v%4),(25,50),(22,58)],'stone')
        polygon(d,[(29,49),(33,43+v%4),(35,55),(31,57)],'deep_teal')
        d.point((24+v%3,39+v%5),fill=P['glow'])
    return im


def flora_for_biome(biome, v):
    if biome == 'salinas': return flora_salinas(v)
    im=Image.new('RGBA',(LOW_W,LOW_H));d=ImageDraw.Draw(im)
    polygon(d,[(13,60),(34,60),(39,63),(10,63)],'outline')
    if biome == 'ceniza':
        silhouettes=[[(24,61),(24,47),(21,40),(24,34)],[(22,61),(24,49),(19,43),(20,35)],[(26,61),(24,48),(28,42),(26,32)],[(22,61),(23,48),(20,42),(25,34)],[(25,61),(24,47),(29,43),(30,35)],[(23,61),(25,49),(21,44),(19,34)]][v]
        line(d,silhouettes,'shadow',3)
        trunks=[[(24,61),(24,47),(21,40),(24,34)],[(22,61),(24,49),(19,43),(20,35)],[(26,61),(24,48),(28,42),(26,32)],[(22,61),(23,48),(20,42),(25,34)],[(25,61),(24,47),(29,43),(30,35)],[(23,61),(25,49),(21,44),(19,34)]][v]
        line(d,trunks,'shadow',3);line(d,[(22,50),(15+v%3,44),(13,38)],'warm',2);line(d,[(25,47),(31,42),(35-v%3,33)],'gold',2)
        for x,y in [(13,37),(19+v%4,34),(34-v%3,32),(24+v%3,31)]:d.rectangle((x-1,y-1,x+1,y+1),fill=P['glow'] if v%2==0 else P['teal'])
    elif biome == 'hierro':
        line(d,[(24,61),(24,28+v%4)],'shadow',3)
        line(d,[(24,51),(14+v%3,43),(12,36+v%4)],'stone',2);line(d,[(24,46),(34-v%3,39),(37,30+v%4)],'light',2)
        if v%2: line(d,[(24,39),(18,34+v%3),(17,28)],'warm',2)
        else: line(d,[(24,36),(30,32+v%3),(31,25)],'warm',2)
        d.arc((13+v%3,30,34,49),150+v*13,475+v*9,fill=P['teal'],width=2)
        for x,y in [(15+v%4,47),(24,53-v%3),(33-v%2,41),(24,30+v%4)]:d.rectangle((x-1,y-1,x+1,y+1),fill=P['bright'])
    elif biome == 'vidrio':
        blades=[([(13,59),(16,42),(20,31+v%5),(22,59)],[(22,59),(25,24+v%4),(29,41),(27,60)],[(29,60),(33,36),(37,28+v%5),(36,60)]),
          ([(12,60),(17,45),(20,34),(22,60)],[(22,60),(27,30),(31,43),(28,60)],[(29,60),(32,40),(38,32),(36,60)]),
          ([(14,60),(17,37),(22,29),(23,60)],[(23,60),(25,35),(28,26),(29,60)],[(30,60),(34,44),(38,35),(36,60)]),
          ([(11,60),(15,47),(19,28),(22,60)],[(21,60),(24,27),(30,38),(27,60)],[(28,60),(34,32),(39,40),(36,60)]),
          ([(13,60),(18,33),(21,42),(23,60)],[(22,60),(26,26),(29,34),(28,60)],[(30,60),(34,38),(38,27),(36,60)]),
          ([(12,60),(16,39),(21,27),(23,60)],[(23,60),(28,34),(31,26),(30,60)],[(30,60),(34,29),(39,43),(36,60)])][v]
        for pts,tone in zip(blades,['light','bright','stone']):polygon(d,pts,tone)
        if v%2: polygon(d,[(19,60),(25+v%3,23),(30,39),(27,60)],'teal')
        line(d,[(18+v%3,38),(20,49)],'glow');line(d,[(27,31+v%4),(28,46)],'teal')
    elif biome == 'medula':
        stalks=[[(24,61),(23,48),(26,38),(23,27)],[(24,61),(22,49),(19,40),(21,29)],[(24,61),(26,48),(23,39),(27,26)],[(23,61),(25,48),(29,40),(27,30)],[(25,61),(23,48),(20,39),(18,28)],[(23,61),(26,50),(24,41),(21,27)]][v]
        line(d,stalks,'warm',3);line(d,[(23,49),(15,44),(12+v%3,34)],'light',2);line(d,[(25,45),(33,39),(36-v%2,29)],'bright',2)
        for x,y in [(13+v%3,33),(23,25+v%4),(35-v%2,27),(17+v%3,41),(32-v%3,37)]:d.ellipse((x-2,y-2,x+2,y+2),fill=P['crimson'],outline=P['light'])
        if v%2: line(d,[(22,45),(17,39),(18,32)],'warm',2)
        else: line(d,[(26,43),(31,37),(29,29)],'warm',2)
    else:
        stems=[[(24,61),(24,47),(20,41),(23,34)],[(23,61),(22,48),(17,42),(15,34)],[(25,61),(26,48),(30,42),(33,32)],[(22,61),(24,48),(21,40),(26,32)],[(25,61),(23,47),(27,39),(24,30)],[(24,61),(26,48),(21,42),(19,33)]][v]
        line(d,stems,'shadow',3);line(d,[(23,49),(15,45),(12+v%3,37)],'deep_teal',2);line(d,[(25,45),(32,41),(37-v%3,33)],'stone',2)
        for x,y in [(12+v%3,37),(17,43+v%3),(23+v%2,32),(31,39-v%2),(35-v%3,32)]:polygon(d,[(x,y-3),(x+2,y),(x,y+3),(x-2,y)],'teal')
        d.point((23+v%2,33),fill=P['glow'])
        if v%2: line(d,[(24,48),(30,45),(37,39)],'teal',2)
        else: line(d,[(23,47),(17,44),(11,40)],'light',2)
    return im


def arch_for_biome(biome, v):
    if biome == 'salinas': return arch_salinas(v)
    im=Image.new('RGBA',(LOW_W,LOW_H));d=ImageDraw.Draw(im)
    if biome == 'ceniza':
        # Furnace mouth profile changes: collapsed lintel, chimney, twin vents.
        variants=[
          [(9,63),(12,43),(18,37),(19,26),(24,33),(30,27),(36,43),(40,63),(31,63),(30,49),(25,43),(19,49),(18,63)],
          [(8,63),(11,39),(17,34),(17,18),(23,30),(28,32),(34,42),(40,63),(32,63),(30,48),(25,44),(20,50),(18,63)],
          [(10,63),(13,46),(18,40),(22,24),(26,39),(32,35),(38,46),(40,63),(32,63),(30,51),(25,46),(20,51),(18,63)],
          [(8,63),(12,42),(17,37),(18,30),(22,36),(26,22),(31,37),(36,43),(40,63),(31,63),(29,51),(24,47),(18,53),(17,63)],
          [(9,63),(12,49),(17,41),(18,25),(24,38),(29,34),(34,24),(38,43),(40,63),(31,63),(29,50),(23,45),(18,51),(17,63)],
          [(8,63),(11,43),(16,39),(21,28),(25,40),(30,25),(35,42),(40,63),(32,63),(29,48),(25,45),(19,51),(17,63)]][v]
        polygon(d,variants,'shadow');line(d,[(14,49),(18,42+v%4),(20,34)],'warm',2);line(d,[(30,35),(35,44),(37,53)],'gold',2)
        polygon(d,[(21,61),(22,50),(26,46),(29,52),(29,63)],'teal' if v%2==0 else 'deep_teal');d.point((25,50+v%4),fill=P['glow'])
    elif biome == 'hierro':
        # Six gate assemblies with different lintels, bars and industrial braces.
        left=[(10,63),(11+v%3,28+v%4),(16,23),(20,28),(20,63)]
        right=[(29,63),(29,28),(34+v%2,22+v%4),(39,29),(40,63)]
        polygon(d,left,'shadow');polygon(d,right,'stone')
        headers=[[(14,34),(17,26),(33,26),(36,34),(34,39),(15,39)],[(13,31),(19,23),(31,27),(37,33),(34,38),(15,38)],[(14,35),(17,28),(21,24),(34,27),(36,36),(16,39)],[(12,32),(16,25),(34,23),(38,32),(34,38),(14,38)],[(14,30),(19,24),(27,28),(35,23),(37,34),(15,39)],[(12,35),(18,25),(24,28),(32,22),(38,34),(35,39),(14,39)]][v]
        polygon(d,headers,'light');polygon(d,[(18,63),(19,44),(24,39),(29,44),(29,63)],'outline')
        line(d,[(12,41+v%4),(38,41+v%4)],'teal',2)
        if v%2:line(d,[(15,45),(34,57)],'gold',2)
        else:line(d,[(35,45),(15,57)],'gold',2)
        for x,y in [(15,31),(35,32),(14,56),(36,56),(24,29+v%5)]:d.ellipse((x-1,y-1,x+1,y+1),fill=P['bright'])
    elif biome == 'vidrio':
        blades=[[(9,63),(12,37),(17,19),(23,43),(20,63)],[(9,63),(13,44),(19,24),(23,39),(19,63)],[(8,63),(14,34),(18,29),(24,46),(20,63)],[(10,63),(13,40),(20,16),(24,44),(20,63)],[(8,63),(12,48),(18,28),(22,43),(19,63)],[(10,63),(15,35),(21,22),(25,46),(21,63)]][v]
        polygon(d,blades,'shadow')
        polygon(d,[(21+v%2,63),(24,15+v%5),(29,41),(28,63)],'bright')
        polygon(d,[(29,63),(34,29+v%4),(39,21+v%5),(38,63)],'light')
        polygon(d,[(19,63),(20,48),(24,43),(29,49),(30,63)],'outline')
        line(d,[(16,27),(20,43)],'glow');line(d,[(34,28+v%3),(31,43)],'teal')
    elif biome == 'medula':
        # Rib cage doors grow asymmetrically around a distinct central organ.
        line(d,[(10+v%3,63),(13,42),(17,33),(23,32),(27,36),(34,37),(39-v%3,63)],'shadow',5)
        line(d,[(14,60),(17,44),(22,39),(28,42),(33,43),(35,60)],'bright',2)
        for j,y in enumerate([45,50,55,59]):
            offset=(v+j)%4-1
            line(d,[(15,y),(19+offset,y-2),(24,y),(29-offset,y-2),(34,y)],'warm',2)
        d.ellipse((21+v%3,33+v%4,27+v%3,39+v%4),fill=P['crimson'],outline=P['glow'])
        if v%2:line(d,[(12,45),(18,48),(14,56)],'light',2)
    else:
        # Floating obsidian blocks form six portal crowns around an eye.
        polygon(d,[(10,63),(13,32+v%4),(18,26),(21,63)],'shadow')
        polygon(d,[(29,63),(30,28),(35,22+v%4),(40,35),(38,63)],'stone')
        crowns=[[(15,28),(20,22),(25,27),(30,21),(36,27),(33,33),(18,34)],[(14,30),(18,23),(24,25),(28,19),(36,25),(35,32),(17,35)],[(13,27),(20,20),(25,29),(31,19),(38,29),(33,35),(17,33)],[(15,31),(21,22),(26,25),(33,20),(37,30),(32,36),(18,35)],[(12,29),(19,21),(23,26),(30,18),(37,26),(35,34),(16,35)],[(14,26),(20,19),(27,25),(32,22),(39,31),(34,36),(17,33)]][v]
        polygon(d,crowns,'light');polygon(d,[(20,63),(20,43),(24,38),(29,43),(29,63)],'void')
        d.ellipse((22+v%2,29+v%4,27+v%2,34+v%4),fill=P['glow']);d.ellipse((24+v%2,30+v%4,26+v%2,33+v%4),fill=P['deep_teal'])
    return im


MONSTERS = {
 'crawler': {'shell':'#89785f','edge':'#3b3532','light':'#c3a978','accent':'#cf5e52','glow':'#ffe2a0'},
 'sentinel': {'shell':'#9c7750','edge':'#393b40','light':'#d9b875','accent':'#638ca1','glow':'#a8fff0'},
 'larva': {'shell':'#765474','edge':'#34283f','light':'#c69abd','accent':'#ef8c8c','glow':'#ffe0be'},
 'moth': {'shell':'#705c70','edge':'#312a3a','light':'#c9a4c5','accent':'#e39b58','glow':'#ffe9a3'},
 'drone': {'shell':'#536f7b','edge':'#26343e','light':'#a5c5ca','accent':'#4ed1d0','glow':'#c8ffff'},
 'spore': {'shell':'#567658','edge':'#2b423a','light':'#a5c789','accent':'#dfa76a','glow':'#d8ffc2'},
 'elite': {'shell':'#504366','edge':'#211f32','light':'#a68dc8','accent':'#e5a553','glow':'#f8d98a'},
 'boss': {'shell':'#3e344f','edge':'#201d31','light':'#a69aba','accent':'#ce5579','glow':'#ffd0e0'},
}


def monster_sprite(name):
    parts=name.split('-')
    if len(parts)!=3 or parts[0] not in MONSTERS or parts[1] not in ('idle','attack','hurt'):
        return None
    kind,pose,frame=parts[0],parts[1],int(parts[2])
    C=MONSTERS[kind]
    im=Image.new('RGBA',(LOW_W,LOW_H));d=ImageDraw.Draw(im)
    def poly(points,tone):d.polygon(points,fill=C[tone])
    def ln(points,tone,width=1):d.line(points,fill=C[tone],width=width,joint='curve')
    # Species-specific silhouettes; animation frames alter limbs, wings and cores.
    if kind=='crawler':
        poly([(8,51),(10,39),(16,32),(31,31),(39,38),(40,48),(35,54),(15,55)],'edge')
        for x in [15,21,27,33]:
            offset=(frame%2)*(1 if x%2 else -1)
            poly([(x-3,37),(x-2,31),(x+1,29),(x+4,34),(x+4,45),(x,48)],'shell')
            ln([(x,46),(x-4+offset,51),(x-6+offset,56)],'edge',2)
        poly([(35,37),(42,39),(47,44),(42,46),(37,44)],'light')
        poly([(42,40),(48,42),(44,45)],'accent')
        for x in [13,20,27,34]:d.point((x,37),fill=C['light'])
        if pose=='attack':ln([(40,41),(46,37),(48,32)],'accent',2);d.point((47,31),fill=C['glow'])
        if pose=='hurt':ln([(22,34),(25,39),(21,43)],'glow',2)
    elif kind=='sentinel':
        poly([(17,52),(18,34),(20,23),(25,18),(31,22),(33,34),(34,52),(29,57),(21,57)],'edge')
        poly([(20,48),(21,31),(23,24),(29,24),(31,33),(31,49),(27,53),(23,52)],'shell')
        poly([(19,31),(21,22),(26,17),(32,22),(34,31),(30,29),(24,29)],'light')
        d.rectangle((23,24,30,27),fill=C['accent']);d.rectangle((25,24,28,25),fill=C['glow'])
        for side,dx in [('L',-1),('R',1)]:
            arm=frame%2 if pose=='idle' else (1 if pose=='attack' else 0)
            ln([(20 if dx<0 else 32,34),(15+arm*dx,40),(13+arm*dx,47)],'shell',3)
            d.rectangle((11+arm*dx if dx<0 else 12+arm*dx,46,15+arm*dx if dx<0 else 16+arm*dx,50),fill=C['light'])
        poly([(21,51),(18,59),(24,59),(26,52)],'light');poly([(28,52),(30,59),(36,58),(32,50)],'shell')
        if pose=='attack':ln([(14,43),(10,39),(8,35)],'accent',2)
        if pose=='hurt':ln([(21,28),(26,31),(29,27)],'glow',2)
    elif kind=='larva':
        # Curled, tapering soft-bodied mutant; no plated centipede silhouette.
        poly([(10,50),(11,43),(16,37),(21,34),(27,35),(30,41),(28,47),(24,50),(20,49),(19,44),(22,41),(25,43),(24,46),(21,45),(21,49),(26,51),(33,48),(37,42),(42,39),(46,42),(44,48),(38,52),(31,56),(22,57),(15,55)],'edge')
        poly([(13,49),(14,43),(19,38),(25,38),(28,42),(25,47),(22,46),(24,42),(20,41),(17,45),(18,50),(25,53),(32,51),(37,47),(41,42),(44,43),(42,47),(36,51),(29,54),(21,54)],'shell')
        poly([(42,41),(48,39),(46,45),(42,47)],'light');d.point((46,41),fill=C['accent'])
        for x,y in [(16,48),(20,51),(27,52),(34,49)]:d.point((x,y),fill=C['light'])
        if pose=='attack':poly([(40,41),(48,34),(46,42),(49,45),(44,46)],'accent')
        if pose=='hurt':ln([(25,38),(28,43),(25,48)],'glow',2)
    elif kind=='moth':
        spread=frame%2
        # Four broad wings and a narrow body, unlike any ground creature.
        poly([(23,42),(18,33-spread*3),(9,27),(5,31),(9,43),(20,49)],'edge')
        poly([(25,40),(31,31-spread*4),(41,26),(46,31),(42,43),(29,49)],'edge')
        poly([(22,46),(15,45),(9,49),(12,55),(23,53)],'shell')
        poly([(27,46),(34,44),(41,48),(39,54),(28,53)],'shell')
        poly([(22,37),(26,31),(29,38),(30,51),(27,56),(23,51)],'light')
        d.ellipse((23,30,29,36),fill=C['accent']);ln([(24,31),(18,25)],'light');ln([(28,31),(34,24)],'light')
        for x,y in [(11,33),(40,31),(16,49),(35,49)]:d.ellipse((x-1,y-1,x+1,y+1),fill=C['glow'])
        if pose=='attack':ln([(10,30),(5,21),(12,25)],'glow',2);ln([(40,29),(46,20),(40,24)],'accent',2)
        if pose=='hurt':ln([(16,32),(21,40),(17,45)],'glow',2)
    elif kind=='drone':
        # Ring-shaped flying hunter with three independent stabilizer prongs.
        for a in [(24,24,34,34),(12,37,23,48),(35,37,46,48)]:d.ellipse(a,outline=C['edge'],width=4)
        d.ellipse((19,29,40,49),fill=C['edge']);d.ellipse((22,32,37,46),fill=C['shell'])
        d.ellipse((26,36,34,44),fill=C['accent']);d.ellipse((28,38,32,42),fill=C['glow'])
        ln([(28,34),(23,22),(19,18)],'light',2);ln([(33,34),(39,23),(43,20)],'light',2)
        ln([(29,45),(24,56),(21,59)],'accent',2)
        if pose=='attack':
            ln([(30,42),(30,54)],'glow',3);ln([(26,50),(30,57),(34,50)],'accent',2)
        if pose=='hurt':ln([(22,34),(27,39),(24,44)],'glow',2)
    elif kind=='spore':
        # A squat fungal shepherd with a wide cap, gills and dangling tendrils.
        poly([(20,58),(20,46),(17,41),(18,35),(22,30),(27,32),(31,39),(30,47),(29,58)],'edge')
        poly([(23,56),(23,43),(21,38),(24,34),(27,39),(27,56)],'shell')
        poly([(9,36),(13,27),(20,23),(28,22),(36,25),(42,32),(39,38),(32,35),(25,34),(17,37)],'edge')
        poly([(13,33),(18,27),(26,25),(35,28),(39,33),(31,32),(24,30),(18,34)],'light')
        ln([(16,35),(13,44),(10,48)],'accent',2);ln([(34,35),(38,43),(42,45)],'accent',2)
        d.ellipse((24,34,27,37),fill=C['glow'])
        for x,y in [(15,27),(20,24),(34,26),(39,30)]:d.point((x,y),fill=C['glow'])
        if pose=='attack':
            for x,y in [(8,20),(16,16),(33,17),(43,23)]:d.ellipse((x-1,y-1,x+1,y+1),fill=C['accent'])
        if pose=='hurt':ln([(20,27),(25,31),(29,25)],'glow',2)
    elif kind=='elite':
        # Tall plated reaper: hooked horns, narrow waist, long scythe arms.
        poly([(19,53),(19,34),(21,25),(26,20),(31,25),(34,37),(31,53),(27,58),(22,57)],'edge')
        poly([(22,49),(22,33),(25,27),(29,29),(31,39),(29,50),(26,54)],'shell')
        poly([(21,29),(18,20),(23,24),(26,17),(29,24),(35,19),(32,31)],'light')
        d.ellipse((25,29,29,34),fill=C['glow'])
        ln([(21,36),(15,42),(10,51)],'light',3);ln([(32,36),(38,42),(44,51)],'light',3)
        ln([(10,51),(6,47),(9,47)],'accent',2);ln([(44,51),(48,47),(45,47)],'accent',2)
        poly([(22,51),(18,61),(25,59),(27,52)],'shell');poly([(29,52),(32,60),(38,60),(32,50)],'light')
        if pose=='attack':ln([(10,50),(7,38),(3,33)],'glow',3);ln([(44,50),(48,38),(46,32)],'accent',3)
        if pose=='hurt':ln([(21,27),(27,35),(31,28)],'glow',2)
    else:  # boss
        # A massive many-ringed heart with six radial limbs and a red pupil.
        d.ellipse((12,20,40,50),fill=C['edge']);d.ellipse((16,24,36,46),fill=C['shell'])
        d.ellipse((20,28,32,42),fill=C['light']);d.ellipse((23,31,29,39),fill=C['accent']);d.ellipse((25,33,27,37),fill=C['glow'])
        for x,sign in [(14,-1),(38,1)]:
            ln([(x,31),(x+sign*7,24),(x+sign*9,17)],'light',2)
            ln([(x,39),(x+sign*9,43),(x+sign*11,51)],'shell',3)
            ln([(x+2*sign,27),(x+sign*10,31),(x+sign*11,37)],'accent',2)
        d.arc((8,15,44,55),195,345,fill=C['glow'],width=1)
        if pose=='attack':
            for x,y in [(7,18),(18,12),(34,12),(45,18)]:ln([(26,33),(x,y)],'accent',2)
        if pose=='hurt':ln([(17,24),(25,31),(33,24)],'glow',2)
    # Pose-specific impact silhouette; distinct from idle even at tiny scale.
    if pose=='hurt':
        d.rectangle((5,58,8,60),fill=C['accent']);d.point((44,57),fill=C['glow'])
    if pose=='attack' and frame%2==1:
        d.point((3,27),fill=C['glow']);d.point((46,19),fill=C['accent'])
    if pose=='idle' and frame%2==1:
        marks={'crawler':(13,34),'sentinel':(29,25),'larva':(18,39),'moth':(11,33),
               'drone':(39,34),'spore':(37,27),'elite':(27,30),'boss':(25,33)}
        d.point(marks[kind],fill=C['glow'])
        if kind=='elite':
            d.line([(6,45),(10,43),(13,47)],fill=C['accent'],width=2)
    if pose=='hurt' and frame%2==1:
        d.line([(39,29),(43,33),(40,37)],fill=C['accent'],width=2)
    return im


def hand_painted(name, biome):
    kind, _, suffix = name.rpartition('-')
    variant = int(suffix)
    shape_variant = variant
    if name.startswith(f'floor-{biome}-'):
        sprite = floor_for_biome(biome,shape_variant)
    elif name.startswith(f'rock-{biome}-'):
        sprite = rock_for_biome(biome,shape_variant)
    elif name.startswith(f'flora-{biome}-'):
        sprite = flora_for_biome(biome,shape_variant)
    elif name.startswith(f'wall-{biome}-'):
        sprite = arch_for_biome(biome,shape_variant)
    else:
        return None
    # Each numbered variant is authored independently per biome.
    return sprite


biomes = tuple(PALETTES)
environment = [f'{kind}-{biome}-{v}' for biome in biomes for kind,count in [('floor',6),('rock',6),('flora',6),('wall',6)] for v in range(count)]
actors = [name for name in SOURCE_META if name.startswith(('hero-', 'npc-', 'crawler-', 'sentinel-', 'larva-', 'moth-', 'drone-', 'spore-', 'elite-', 'boss-'))]
names = environment + actors
cols = COLS
rows = math.ceil(len(names) / cols)
sheet = Image.new('RGBA', (cols * W, rows * H))
meta = {}
for index, name in enumerate(names):
    biome = next((b for b in biomes if name.startswith(('floor-','rock-','flora-','wall-')) and name.startswith(tuple(f'{kind}-{b}-' for kind in ('floor','rock','flora','wall')))), None)
    if biome:
        P = PALETTES[biome]
    sprite = hand_painted(name, biome) if biome else monster_sprite(name)
    source_meta = SOURCE_META.get(name)
    if sprite is None:
        source_meta = source_meta or SOURCE_META[next(n for n in SOURCE_META if n.startswith(name.rsplit('-',1)[0]+'-'))]
        sx, sy, sw, sh = source_meta['rect']
        src = SOURCE.crop((sx, sy, sx + sw, sy + sh))
        # Actors keep their anatomy and animation, but are redrawn onto a true
        # 48×64 pixel grid rather than filtered after the whole scene is painted.
        sprite = src.resize((LOW_W, LOW_H), SCALE)
    source_meta = source_meta or {'pivot':[48,112]}
    sprite = sprite.resize((W, H), SCALE)
    x, y = (index % cols) * W, (index // cols) * H
    sheet.alpha_composite(sprite, (x, y))
    meta[name] = {'rect': [x, y, W, H], 'pivot': source_meta['pivot']}

sheet.save(ROOT / 'nacar-salinas-16bit.png', optimize=True)
(ROOT / 'nacar-salinas-16bit.json').write_text(json.dumps(meta, indent=2) + '\n')
print(f'Generated {len(meta)} low-resolution 16-bit sprites in {ROOT}')
