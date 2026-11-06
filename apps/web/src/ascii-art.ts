/** Shared original ASCII compositions. Pure data: no world state, DOM or RNG. */
export const CAMERA_SCALE=1.45;
/** Painter order at the feet: elevation changes appearance, not depth. */
export function projectedDepth(x:number,y:number,cellW:number,cellH:number,layer=1):number{
  return x*cellW+y*cellH+layer*.001;
}
const TERRAIN_COLORS:Record<string,string>={
  '#':'#63796e','.':'#9a9580',':':'#d3b783','~':'#63afc3','^':'#c0dbec',
  '*':'#7ca67d','+':'#f3c17a','=':'#b9d4cf','o':'#cba3e9','T':'#ffd085','x':'#f0bc91',
  ',':'#bdb092',';':'#cd8c74','v':'#ceafe9','&':'#a3e0a3','%':'#8ac8d3','?':'#eda4d8','!':'#ff6f86'
};
/** Fog opacity belongs to the renderer, not to the material palette. */
export function terrainColor(tile:string,surface:boolean,biomePalette:string):string{
  if(surface&&['.','*',','].includes(tile))return biomePalette;
  if(!surface&&tile==='#')return '#506070';
  if(!surface&&tile==='.')return '#839aab';
  return TERRAIN_COLORS[tile]??'#c5bbaa';
}
/** Visual elevation only; never used for collision or field of view. */
export function terrainHeight(tile:string,seed:number):number{
  if(tile==='#')return 7+Math.floor(seed*7);
  if(tile==='%'||tile==='=')return 5+Math.floor(seed*5);
  if(tile==='^'||tile==='T')return 2+Math.floor(seed*3);
  return 0;
}
export type HeroAction='walk'|'attack'|'damage'|'mutation'|'interact';
const ACTORS:Record<string,readonly string[][]>={
  '@':[[' o ','/|\\','/ \\'],[' o ','/|>',' /\\']],
  'hero:walk':[[' o ','/|\\',' /\\'],[' o ','/|\\','/ \\']],
  'hero:attack':[[' o ','/|==','/ \\'],[' o ','==|\\','/ \\']],
  'hero:damage':[[' x ','\\|/',' /\\']],
  'hero:mutation':[['\\o/','{#}','/ \\'],['/o\\','{#}','/ \\']],
  'hero:interact':[[' o/','/| ','/ \\']],
  'hero:death':[['___','x_x','/ \\']],
  'enemy:attack:s':[[' __','/oo>','/==>']],
  'enemy:attack:V':[['[o]','/V==','| |']],
  'enemy:attack:l':[[' _ ','(oo==','~~/']],
  'enemy:attack:p':[['\\ /','(o)==','/ \\']],
  'enemy:attack:D':[['/o\\','[=]==','/ \\']],
  'enemy:attack:f':[['.*.','(o)::','/|\\']],
  'enemy:attack:✺':[['\\ | /','==O==','/|X|\\','/ | \\']],
  'enemy:attack:◆':[['/O\\','[X]==','/|\\']],
  s:[[' __','/oo\\','/\\/\\'],[' __','/oo\\','\\/\\/']],
  V:[['[o]','/V\\','| |'],['[o]','<V>','/ \\']],
  l:[[' _ ','(oo','/==~'],[' _ ','(oo','~==\\']],
  p:[['\\ /','(o)','/ \\'],['/ \\','(o)','\\ /']],
  D:[['/o\\','[=]','/ \\'],['\\o/','[=]','| |']],
  f:[['.*.','(o)','/|\\'],[':*:','(o)','\\|/']],
  '✺':[['\\ | /','--O--','/|X|\\','/ | \\'],['/ | \\','==O==','\\|X|/','\\ | /']],
  '◆':[['/O\\','[X]','/|\\']],
  'enemy:hurt:s':[[' __','/XX\\','/\\/\\']],
  'enemy:hurt:V':[['[X]','<V>','| |']],
  'enemy:hurt:l':[[' _ ','(XX','/==~']],
  'enemy:hurt:p':[['\\ /','(X)','/ \\']],
  'enemy:hurt:D':[['/X\\','[!]','/ \\']],
  'enemy:hurt:f':[['.*.','(X)','/|\\']],
  'enemy:hurt:✺':[['\\ | /','==X==','/|X|\\','/ | \\']],
  'enemy:hurt:◆':[['/X\\','[!]','/|\\']],
  'enemy:death:s':[[' __','/xx\\','\\_/_']],
  'enemy:death:V':[['[x]','-V-','_ _']],
  'enemy:death:l':[['___','(xx','~~~~']],
  'enemy:death:p':[['\\x/','---','/ \\']],
  'enemy:death:D':[['[x]','[~]','_ _']],
  'enemy:death:f':[['.*.','(x)','_/_']],
  'enemy:death:✺':[['\\ | /','--X--','_/_\\_','/   \\']],
  'enemy:death:◆':[['/x\\','[~]','_/_']],
  '#':[[' /_\\','|##|','|__|']],
  '.':[[' . ','...','___']],
  '.:1':[[' . ','.._','__\u005c']],
  '.:2':[[' . ','._.','_/_']],
  ':':[[' : ',':::','___']],
  ':1':[[' : ','::_','__\u005c']],
  ':2':[[' : ','_::','_/_']],
  ',':[[' , ',',,,','___']],
  ';':[[' ; ',';;;','___']],
  '^':[[' /\\','/^^\\','\\__/']],
  '%':[[' /%\\','|%%|','|__|']],
  '%:1':[[' /%\\','|%_ |','|__\\']],
  '%:2':[[' /%\\','|_%|','|/_|']],
  '=':[['/==\\','|==|']],
  '*':[[' .*.','/|\\',' | '],[' :*:','\\|/',' | ']],
  '&':[['{*}','/|\\','/ \\'],['{*}','\\|/','/ \\']],
  '~':[['~ ~',' ~~'],[' ~~','~ ~']],
  '!':[['!*!','/!\\'],['*!*','\\!/']],
  T:[[' /\\ ','/T\\','[=]',' | ']],
  '+':[[' /\\ ','/ +\\','|__|']],
  '?':[[' /?\\','[ : ]',' /_\\']],
  x:[['\\ /',' X ','/_\\']],
  v:[['\\v/',' v ','/_\\']],
  o:[[' /\\ ','/o\\','|o|','\\_/']],
  'npc:M':[[' .M.','/|\\','/ \\']],
  'npc:O':[[' [O]','/|\\','/ \\']],
  'npc:S':[[' .S.','/|\\','/ \\']],
  'npc:C':[[' .C.','/|\\','/ \\']],
  'npc:I':[[' [I]','/|\\','/ \\']],
  'npc:K':[[' [K]','/|\\','/ \\']],
  'npc:$':[[' {$}','/|\\','/ \\']],
  'npc:?':[[' {?}','/|\\','/ \\']],
  'npc:!':[[' [!]','/|\\','/ \\']],
  'resource:mineral':[[' /\\','<##>',' \\/']],
  'resource:fiber':[[' \\|/','--+',' /|\\']],
  'resource:spores':[['.*.','{o}','***']],
  'resource:crystal':[[' /\\','<><>',' \\/']],
  loot:[[' .-.','|$|',' `-`']],
  'field:fire':[[' ^ ^','/!\\','^^^'],[' ^^','/!\\','^ ^']],
  'field:electric':[['\\|/','-Z-','/|\\'],['/|\\','-Z-','\\|/']],
  'field:spores':[['. .','(o)','* *'],['* *','(o)','. .']],
  'weather:polvo':[['·'],[':']],
  'weather:esporas':[['✦'],['·']],
  'weather:estatica':[['ϟ'],['⋮']],
  'weather:distorsion':[['≈'],['∿']],
  'weather:calma':[['·']],
  'effect:attack':[['·','/\\','·'],['✦','·','✦']],
  'effect:damage':[['x','/\\','x'],['✧','x','✧']],
  'effect:mutation':[['*','{#}','*'],['✺','·','✺']],
  'effect:scan':[['+','·','+'],['◇','·','◇']],
};
export function composition(glyph:string,frame=0):readonly string[]{
  const poses=ACTORS[glyph];
  if(poses)return poses[Math.abs(frame)%poses.length];
  return [glyph];
}
export function terrainComposition(tile:string,variant=0):string{
  const key=`${tile}:${Math.abs(variant)%3}`;
  return variant%3&&ACTORS[key]?key:tile;
}
export function isOccludingTerrain(tile:string):boolean{return tile==='#'||tile==='%'||tile==='=';}
export function paintComposition(ctx:CanvasRenderingContext2D,glyph:string,x:number,y:number,size:number,frame=0):void{
  const rows=composition(glyph,frame),multi=rows.length>1;
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=`bold ${multi?size*.48:size}px "DejaVu Sans Mono",monospace`;
  for(let row=0;row<rows.length;row++)ctx.fillText(rows[row],x,y+(row-(rows.length-1)/2)*size*.46);
  ctx.restore();
}
