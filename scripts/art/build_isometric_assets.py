from PIL import Image, ImageDraw, ImageOps
from pathlib import Path
import json, math
out=Path('apps/web/public/isometric');out.mkdir(parents=True,exist_ok=True)
assets=[]
palettes={'salinas':['#777c76','#aaa58e','#d7d0b8','#58cabf'],'ceniza':['#35363d','#65606a','#9c8a82','#ed9560'],'hierro':['#353f46','#735b4c','#bd9568','#72c9c4'],'vidrio':['#354a60','#6485a4','#b1d2e0','#88edd5'],'medula':['#343d3d','#647b65','#b2b48b','#c8969f'],'umbral':['#292a43','#5c5379','#9a85b6','#72dfd3']}
def add(name,paint):
 im=Image.new('RGBA',(96,128));d=ImageDraw.Draw(im);paint(d)
 # Restrained stippling and material wear, deterministic and authored in source.
 pix=im.load()
 for y in range(128):
  for x in range(96):
   r,g,b,a=pix[x,y]
   h=(x*371+y*619+x*y*17)%101
   if a and h<14:
    v=-13 if h<7 else 10
    pix[x,y]=(max(0,min(255,r+v)),max(0,min(255,g+v)),max(0,min(255,b+v)),a)
 if name.startswith('hero-west'):im=ImageOps.mirror(im)
 assets.append((name,im))
def poly(d,p,c):d.polygon(p,fill=c)
def floor(d,p,v):
 a,b,c,g=p;poly(d,[(16,112),(48,96),(80,112),(48,128)],a);poly(d,[(18,111),(48,97),(78,111),(48,125)],b)
 for i in range(7):
  x=26+(i*13+v*7)%40;y=106+(i*7+v*3)%10
  d.line([(x,y),(x+4,y-2),(x+8,y)],fill=c,width=1)
 if v%3==0:d.line([(40,101),(43,110),(38,115),(48,122)],fill=a,width=2)
 if v==4:d.line([(29,110),(47,108),(56,114)],fill=g,width=1)
 # Salinas use layered evaporite plates and hairline mineral seams, not a
 # flat repeating diamond. Keep all marks inside the walkable tile silhouette.
 if p[0]=='#777c76':
  seams=[[(25,111),(34,108),(40,110)],[(50,101),(58,104),(67,109)],
         [(29,117),(37,114),(44,117)],[(51,115),(59,112),(69,114)]]
  for i,line in enumerate(seams):
   d.line(line,fill='#d9d2bd' if (i+v)%2 else '#696f6d',width=1)
  if v in (1,4):
   d.line([(35,104),(39,102),(42,103)],fill='#e6dfcc',width=1)
   d.line([(55,119),(61,116),(64,117)],fill='#545d61',width=1)
  if v==5:
   d.ellipse((43,106,49,110),fill='#58cabf');d.point((46,108),fill='#e0f1d8')
def rock(d,p,v):
 a,b,c,g=p;x=48;h=22+v*7
 poly(d,[(25,108),(28,100-h),(43,88-h),(64,96-h),(72,107),(48,119)],a)
 poly(d,[(28,100-h),(43,88-h),(59,96-h),(46,108),(25,108)],b)
 poly(d,[(43,88-h),(64,96-h),(72,107),(46,113),(46,99-h)],c)
 d.line([(46,99-h),(54,103-h),(50,111)],fill=a,width=2)
 for i in range(4):d.line([(32+i*6,104-h//2+i),(37+i*6,102-h//2+i)],fill=a)
 if v==2:d.line([(55,98-h),(57,108-h),(51,116)],fill=g,width=2)
 if p[0]=='#777c76':
  # Salt-buried bone and stone strata give each outcrop a readable lit face.
  poly(d,[(28,103-h),(43,91-h),(55,95-h),(45,101-h)],'#d7d0b8')
  poly(d,[(47,103-h),(61,99-h),(68,106),(50,110)],'#85877e')
  d.line([(30,105-h),(38,102-h),(42,104-h)],fill='#eee5cf',width=2)
  d.line([(51,105-h),(58,103-h),(64,106-h)],fill='#c1bba8',width=1)
  if v==1:
   d.arc((34,86-h,61,111-h),200,335,fill='#58cabf',width=2)
   d.point((51,96-h),fill='#d9ffff')
def flora(d,p,v,biome):
 a,b,c,g=p
 if biome=='vidrio':
  for x,h in [(31+v*3,22+v*4),(49,42+v*7),(65-v*2,17+v*5)]:
   poly(d,[(x-6,111),(x-4,111-h),(x,103-h),(x+7,109-h),(x+5,113)],b);d.line([(x,104-h),(x,110)],fill=g,width=2)
 elif biome=='hierro':
  for x,h in [(30+v*4,17+v*5),(49,36-v*4),(65-v*3,24+v*3)]:
   d.rectangle((x-4,110-h,x+4,112),fill=b);d.rectangle((x-2,110-h,x,109),fill=c);d.rectangle((x-7,106-h,x+7,112-h),fill=a)
 elif biome=='medula':
  d.line([(45,113),(49,65-v*6),(43,44-v*4)],fill=c,width=5)
  for dx,dy in [(-20,65),(17,57),(-12,80),(21,86)]:d.line([(48,dy+15),(48+dx,dy),(48+dx+3,dy-14)],fill=b,width=4);d.ellipse((45+dx,dy-16,53+dx,dy-8),fill=g)
 else:
  d.line([(48,113),(46,73-v*8),(51,58-v*5)],fill=b,width=4)
  for x,y in [(28,80),(65,67),(33,97)]:d.line([(47,103),(x,y),(x+2,y-12)],fill=c,width=2)
  if biome!='ceniza':
   for x,y in [(28,68),(65,55),(51,58-v*5)]:d.ellipse((x-3,y-3,x+4,y+3),fill=g)
 if biome=='salinas':
  # Bleached branching salt-bone with layered crust and translucent cyan tips.
  d.ellipse((31,102,67,114),fill='#77776d')
  if v==0:
   d.line([(48,110),(45,92),(49,78),(45,65)],fill='#e0d7c0',width=5)
   d.line([(46,91),(35,81),(29,68)],fill='#c8c1ad',width=4)
   d.line([(48,86),(60,77),(66,64)],fill='#eee5d2',width=4)
   d.line([(45,75),(38,69),(36,59)],fill='#d3ccb8',width=3)
   tips=[(29,65),(35,56),(65,61),(47,62)]
  elif v==1:
   d.line([(47,111),(51,92),(45,79),(50,66)],fill='#e0d7c0',width=6)
   d.line([(48,93),(35,87),(27,76)],fill='#c8c1ad',width=4)
   d.line([(49,87),(63,78),(68,66)],fill='#eee5d2',width=4)
   d.line([(46,80),(37,74),(37,65)],fill='#d3ccb8',width=3)
   tips=[(27,73),(37,62),(68,63),(51,62)]
  else:
   d.line([(46,111),(43,94),(50,82),(47,72)],fill='#e0d7c0',width=6)
   d.line([(45,95),(33,90),(25,83)],fill='#c8c1ad',width=4)
   d.line([(48,85),(59,87),(70,80)],fill='#eee5d2',width=4)
   d.line([(47,78),(39,70),(42,61)],fill='#d3ccb8',width=3)
   tips=[(25,80),(42,58),(70,77),(48,68)]
  for x,y in tips:
   d.ellipse((x-4,y-4,x+4,y+3),fill='#58cabf');d.ellipse((x-1,y-2,x+1,y),fill='#d9fff5')
  for x,y in [(38,97),(54,100),(35,105)]:d.line([(x,y),(x+5,y-2)],fill='#f2ead6',width=2)
def architecture(d,p,v,biome):
 a,b,c,g=p
 if biome=='salinas':
  # Walls are often adjacent cells: mix low debris, ribs and rare landmarks so
  # the map reads as terrain instead of a repeated row of full-sized buildings.
  if v==0:
   poly(d,[(18,111),(22,96),(33,88),(39,101),(48,94),(55,105),(67,91),(77,108),(49,122)],'#85877e')
   poly(d,[(22,96),(33,88),(39,101),(31,104)],'#e0d7c0')
   poly(d,[(48,94),(55,105),(47,110),(42,104)],'#d3ccb8')
   d.line([(28,105),(34,102),(39,105)],fill='#eee5d2',width=2)
   d.ellipse((56,105,62,109),fill='#58cabf')
  elif v==1:
   # Single broken rib arch, lower and narrower than the landmark tower.
   d.ellipse((27,54,69,111),outline='#88897f',width=8)
   d.arc((30,56,66,106),180,360,fill='#eee5d2',width=4)
   d.line([(30,81),(25,109),(39,115)],fill='#d7d0b8',width=5)
   d.line([(66,82),(72,109),(59,116)],fill='#c8c1ad',width=5)
   d.line([(38,114),(48,119),(59,114)],fill='#555b5b',width=2)
   d.ellipse((45,74,51,80),fill='#58cabf')
  else:
   # A landmark structure appears only on the tallest of the three variants.
   poly(d,[(28,113),(29,49),(39,36),(44,53),(44,114)],'#777c76')
   poly(d,[(55,114),(55,53),(64,36),(70,51),(70,109)],'#8e9184')
   d.line([(34,106),(35,56),(39,45),(40,106)],fill='#eee5d2',width=4)
   d.line([(61,106),(61,57),(64,45),(67,58),(67,106)],fill='#d7d0b8',width=4)
   d.arc((37,39,62,91),180,360,fill='#e8dfcc',width=5)
   d.arc((41,47,58,85),180,360,fill='#c9c1ad',width=3)
   d.rectangle((44,72,54,116),fill='#101820')
   d.line([(42,73),(49,64),(56,73)],fill='#eee5d2',width=3)
   d.ellipse((46,48,52,54),fill='#58cabf')
   if v==2:d.line([(49,42),(49,25)],fill='#e5ddc9',width=4);poly(d,[(45,27),(49,15),(54,27)],'#d7d0b8')
  return
 # buttressed structure, separately occluded by its ground anchor
 poly(d,[(19,109),(19,49),(49,32),(78,47),(78,109),(49,123)],a)
 poly(d,[(19,49),(49,32),(78,47),(48,63)],c);poly(d,[(19,49),(48,63),(48,123),(19,109)],b)
 for y in range(64,111,10):d.line([(20,y),(47,y+14)],fill=a);d.line([(49,y+14),(77,y)],fill=b)
 for x,y in [(25,57),(65,60)]:
  d.rectangle((x-3,y,x+4,y+39),fill=a);poly(d,[(x-3,y),(x,y-6),(x+4,y)],a);d.rectangle((x-1,y+5,x+1,y+24),fill=g)
 poly(d,[(40,116),(40,86),(47,77),(55,85),(55,119)],'#111b24');d.line([(41,116),(41,86),(47,79)],fill=c,width=2)
 for x in [20,72]:d.rectangle((x-3,47,x+3,111),fill=c);poly(d,[(x-6,47),(x,33),(x+6,47)],b)
 if v==1:
  d.rectangle((42,20,54,49),fill=b);poly(d,[(37,20),(48,4),(59,20)],c);d.ellipse((44,25,51,34),fill=g)
 if v==2:
  d.line([(26,40),(48,21),(70,40)],fill=g,width=2);d.ellipse((42,24,54,36),outline=c,width=2)
 # Each biome has different construction, beyond the shared masonry base.
 if biome=='hierro':
  d.rectangle((22,44,74,57),fill=b)
  for x in [25,69]:
   d.line([(x,103),(x,65),(x+5,61)],fill=c,width=5)
   for y in [68,84,100]:d.rectangle((x-3,y,x+3,y+2),fill=a)
  d.rectangle((40,38,56,53),fill=a);d.rectangle((43,41,53,46),fill=g)
  for y in range(68,100,5):d.line([(57,y),(69,y-5)],fill=a,width=2)
 elif biome=='vidrio':
  for x,h in [(24,44),(68,60),(56,26)]:
   poly(d,[(x-7,109),(x-5,109-h),(x,98-h),(x+8,108-h),(x+7,112)],b)
   d.line([(x,99-h),(x,108)],fill=g,width=2)
   d.line([(x+2,104-h),(x+6,108-h),(x+5,108)],fill=c)
 elif biome=='medula':
  for x,sgn in [(25,1),(70,-1)]:
   d.line([(x,114),(x+sgn*5,85),(x+sgn*2,59)],fill=c,width=5)
   for y in [66,76,86,96]:d.arc((x-10,y,x+10,y+13),180 if sgn==1 else 0,360 if sgn==1 else 180,fill=g,width=2)
  d.ellipse((40,40,57,53),fill=a);d.ellipse((45,44,52,49),fill=g)
 elif biome=='umbral':
  poly(d,[(22,47),(28,18),(33,43)],c);poly(d,[(66,43),(74,9),(78,48)],b)
  d.line([(29,58),(34,69),(29,82),(37,98),(34,112)],fill=g,width=2)
  d.line([(58,40),(64,34),(68,39),(65,45)],fill=g,width=2)
 elif biome=='ceniza':
  poly(d,[(20,47),(26,38),(34,45),(38,34),(44,50)],a)
  for x,y in [(25,93),(61,101),(53,67)]:d.line([(x,y),(x+4,y-2)],fill=g,width=2)
 else:
  for x,y in [(21,102),(65,106),(31,67)]:poly(d,[(x,y),(x+2,y-10),(x+7,y-4),(x+10,y)],c)
 if biome=='salinas':
  # A ribbed salt ossuary replaces the generic masonry silhouette.
  poly(d,[(18,108),(20,54),(30,39),(35,55),(34,111)],'#777c76')
  poly(d,[(62,113),(61,54),(69,37),(77,54),(78,109)],'#8e9184')
  d.line([(24,104),(25,61),(30,49),(31,104)],fill='#e5ddc9',width=4)
  d.line([(67,107),(67,61),(70,48),(73,62),(73,108)],fill='#d7d0b8',width=4)
  # Interlocked ribs frame a deep, readable central opening.
  d.arc((27,31,70,91),180,360,fill='#e8dfcc',width=5)
  d.arc((32,40,65,85),180,360,fill='#c9c1ad',width=3)
  d.rectangle((42,70,55,116),fill='#101820')
  d.line([(40,70),(48,60),(57,70)],fill='#eee5d2',width=3)
  for x,y in [(28,43),(69,41),(33,57),(64,55)]:
   d.ellipse((x-3,y-3,x+3,y+3),fill='#58cabf')
  d.line([(21,111),(34,115),(48,121),(63,116),(77,111)],fill='#514f4b',width=2)
  if v==1:
   d.line([(48,36),(48,18)],fill='#e5ddc9',width=4)
   poly(d,[(44,20),(48,7),(53,20)],'#d7d0b8')
   d.ellipse((45,28,51,34),fill='#58cabf')
  elif v==2:
   d.line([(29,51),(48,43),(68,50)],fill='#e8dfcc',width=3)
   d.arc((38,31,58,53),190,350,fill='#58cabf',width=2)
 # Broken lintels and tiny masonry joints create scale without obscuring paths.
 for y in range(69,108,10):
  d.line([(30,y-4),(30,y)],fill=a);d.line([(61,y+1),(61,y+5)],fill=a)

def human(d,color,pose,frame,direction,npc=False):
 # hand posed legs, cloak, face, equipment; no affine deformation
 sway=[0,2,0,-2][frame%4] if pose=='walk' else 0
 if pose=='death':
  d.ellipse((29,105,68,118),fill='#1b2430');d.rectangle((35,103,62,111),fill=color);d.rectangle((60,99,70,108),fill='#c0af8f');return
 d.ellipse((33,107,64,117),fill='#14212a')
 for x,step in [(42,sway),(53,-sway)]:d.rectangle((x-3,96,x+3,111+step),fill='#26323e');d.rectangle((x-4,109+step,x+5,113+step),fill='#111b24')
 poly(d,[(36,67),(59,67),(65,103),(50,109),(31,101)],'#17232d');poly(d,[(38,67),(55,67),(58,99),(47,104),(34,97)],color)
 d.line([(41,73),(38,95),(47,101)],fill='#9b9f8d',width=2)
 d.rectangle((40,54,55,69),fill='#19252e');poly(d,[(38,59),(43,49),(54,51),(59,60)],color)
 if direction=='north':d.line([(40,57),(45,51)],fill='#b0c1b1',width=2)
 if direction in ['south','east']:d.rectangle((47,59,55,65),fill='#baa88b');d.line([(48,60),(54,60)],fill='#64e6da',width=2)
 else:d.line([(41,57),(50,54)],fill='#a1b1a5',width=2)
 d.rectangle((42,84,59,89),fill='#634c3e');d.rectangle((51,84,54,89),fill='#d5aa65')
 if pose=='attack':
  x=61+frame*3;d.line([(57,74),(x,69),(x+7,58-frame*3)],fill='#c9cbbc',width=3);d.line([(x+7,58-frame*3),(x+12,47-frame*3)],fill='#77e7db',width=2)
 else:d.line([(59,75),(64,93),(66,106)],fill='#b8b6a1',width=3)
 if npc:d.rectangle((30,79,36,90),fill='#d5aa65')
 if pose=='hurt':d.line([(32,62),(23,57)],fill='#e56b75',width=2)
def enemy(d,kind,pose,f):
 bone='#c9c6a6';dark='#273441';red='#d6717c';cyan='#64ded0';y=0 if f%2==0 else 2
 if kind in ['crawler','larva']:
  for i in range(5):
   x=29+i*7;h=12+int(math.sin(i)*5);d.ellipse((x-8,96-h+y,x+9,112+y),fill=bone if kind=='larva' else '#897a65');d.line([(x,99+y),(x-7,116+(f+i)%2*2)],fill=dark,width=3)
  d.rectangle((57,96+y,65,100+y),fill=red)
 elif kind=='moth':
  poly(d,[(45,85),(16,64+y),(20,99),(42,106)],'#8a78aa');poly(d,[(51,85),(80,64-y),(76,99),(54,106)],'#b7a5ba');d.line([(48,80),(48,112)],fill=bone,width=6)
  for x in [27,65]:d.ellipse((x-4,84,x+4,92),fill=cyan)
 elif kind=='spore':
  d.rectangle((44,86,52,113),fill=bone);d.ellipse((25,63+y,71,93+y),fill='#6b8a77');d.line([(29,83+y),(67,83+y)],fill=cyan,width=2)
  for x in [33,45,57]:d.ellipse((x,72+y,x+3,75+y),fill=bone)
 elif kind in ['drone','elite','boss']:
  size=26 if kind=='boss' else 17
  for dx in [-size,size]:d.line([(48,80+y),(48+dx,94+y),(48+dx+9,108)],fill='#8e7893',width=4)
  poly(d,[(48,54+y-size//2),(48+size,78+y),(48,101+y),(48-size,78+y)],dark);d.ellipse((40,71+y,56,87+y),fill=red if kind=='boss' else cyan)
  for i in range(3):d.arc((30-i*5,55-i*4,66+i*5,99+i*4),195,345,fill=bone,width=2)
 else:
  d.rectangle((35,67,61,98),fill='#92735b');poly(d,[(32,70),(47,58),(64,69),(48,79)],bone)
  for x in [38,56]:d.line([(x,96),(x-4+f%2*4,114)],fill=dark,width=5)
  d.rectangle((44,65,53,68),fill=cyan)
 if pose=='attack':d.line([(60,92),(75+f*2,82)],fill=red,width=3)
 if pose=='hurt':d.line([(28,62),(20,53)],fill=red,width=3)
for b,p in palettes.items():
 for v in range(6):add(f'floor-{b}-{v}',lambda d,p=p,v=v:floor(d,p,v))
 for v in range(3):
  add(f'rock-{b}-{v}',lambda d,p=p,v=v:rock(d,p,v))
  add(f'flora-{b}-{v}',lambda d,p=p,v=v,b=b:flora(d,p,v,b))
  add(f'wall-{b}-{v}',lambda d,p=p,v=v,b=b:architecture(d,p,v,b))
for direction in ['north','south','east','west']:
 for pose,frames in [('idle',2),('walk',4),('attack',4),('hurt',1),('death',1)]:
  for f in range(frames):add(f'hero-{direction}-{pose}-{f}',lambda d,pose=pose,f=f,direction=direction:human(d,'#687f7e',pose,f,direction))
for n,c in [('mara','#8c706d'),('ferral','#a88456'),('iria','#727ba0'),('merchant','#8d8164'),('guard','#677b8e'),('citizen','#768367')]:add('npc-'+n,lambda d,c=c:human(d,c,'idle',0,'south',True))
for k in ['crawler','sentinel','larva','moth','drone','spore','elite','boss']:
 for pose in ['idle','attack','hurt']:
  for f in range(2):add(f'{k}-{pose}-{f}',lambda d,k=k,pose=pose,f=f:enemy(d,k,pose,f))
def item(d,kind):
 if kind=='door':
  poly(d,[(32,115),(32,80),(48,63),(64,80),(64,115)],'#16232b');d.line([(34,112),(34,80),(48,66),(62,80),(62,112)],fill='#b5a889',width=3);d.rectangle((57,93,60,96),fill='#58cabf')
 elif kind in ['down','up']:
  for i in range(6):d.rectangle((29+i*3,106-i*4,64-i*2,110-i*4),fill=['#58666b','#b3b7a7'][i%2])
  d.line([(43,65),(43,80),(38 if kind=='down' else 48,75)],fill='#58cabf',width=3)
 elif kind=='terminal':
  d.rectangle((35,84,60,112),fill='#566469');d.rectangle((32,65,64,88),fill='#23343a');d.rectangle((36,69,60,83),fill='#58cabf');d.line([(39,73),(55,73)],fill='#162329',width=2)
 elif kind=='heal':
  d.rectangle((42,89,54,110),fill='#8ea9a1');d.rectangle((44,84,52,91),fill='#d7d0b8');d.rectangle((44,96,52,106),fill='#c65362');d.line([(45,100),(51,100)],fill='#eddcc6',width=2)
 elif kind=='resource':
  for x,h in [(38,15),(47,25),(56,13)]:poly(d,[(x-4,111),(x-3,111-h),(x,106-h),(x+5,111-h),(x+4,112)],'#58cabf')
 elif kind=='water':
  poly(d,[(16,112),(48,96),(80,112),(48,128)],'#173f50');d.line([(30,110),(45,105),(61,109)],fill='#71a5ac',width=2)
 else:
  d.rectangle((36,96,61,111),fill='#8e7757');d.rectangle((37,93,60,100),fill='#d5aa65');d.rectangle((46,98,51,107),fill='#28373f');d.line([(40,91),(46,84),(54,91)],fill='#58cabf',width=2)
for k in ['door','down','up','terminal','water','loot','resource','heal']:add(k,lambda d,k=k:item(d,k))
cols=16;sheet=Image.new('RGBA',(cols*96,math.ceil(len(assets)/cols)*128));meta={}
for i,(n,im) in enumerate(assets):
 x=i%cols*96;y=i//cols*128;sheet.paste(im,(x,y));meta[n]={'rect':[x,y,96,128],'pivot':[48,112]}
sheet.save(out/'nacar.png');(out/'nacar.json').write_text(json.dumps(meta,indent=2))
print(len(assets),'original sprites',sheet.size)
