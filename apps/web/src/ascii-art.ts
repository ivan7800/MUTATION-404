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
  '@':[['  .-.  ',' /|\\  ','/ | \\ ','  / \\  ',' _/___\\_ '],['  .-.  ',' /|>  ','/ |==>','  / \\  ',' _/___\\_ ']],
  'hero:walk':[['  .-.  ',' /|\\  ','/ | \\ ',' _/ \\_ ','/_______\\'],['  .-.  ',' /|\\  ','/ | \\ ','  /_ \\ ','/_______\\']],
  'hero:attack':[['  .-.  ',' /|\\  ','/ |==>','  / \\  ',' _/___\\_ '],['  .-.  ',' /|>  ','/ |==>',' _/ \\  ','/_______\\']],
  'hero:damage':[['  x_x  ',' \\|/  ','  /|\\  ','  / \\  ',' _/___\\_ ']],
  'hero:mutation':[[' \\o/  ','--{#}--',' /|\\  ','  / \\  ',' _/___\\_ '],['  /o\\ ',' <#>  ',' /|\\  ',' _/ \\_ ','/_______\\']],
  'hero:interact':[['  .-.  ',' /|>  ','/ |   ','  / \\  ',' _/___\\_ ']],
  'hero:death':[['  ___  ',' x_x  ',' \\|/  ',' _/ \\_ ','/_______\\']],
  'enemy:attack:s':[['  __    ',' /oo>  ','<||||>==',' \\__/  ',' _/  \\_']],
  'enemy:attack:V':[['  /\\   ',' [o]=> ','/ V==> ','| | |  ','/___\\_']],
  'enemy:attack:l':[['  ___   ','(oo==> ',' \\__/  ','~~/  \\_',' _/\\_ ']],
  'enemy:attack:p':[[' \\ | / ','--o==> ',' / | \\ ','  / \\  ',' \\___/ ']],
  'enemy:attack:D':[['  /\\   ',' /o\\   ','[=|==> ',' /|\\   ','/___\\  ']],
  'enemy:attack:f':[['  .*.   ',' /  ::\\','( o ):: ',' \\ | / ','  / \\  ']],
  'enemy:attack:✺':[['\\ | /','==O==','/|X|\\','/ | \\']],
  'enemy:attack:◆':[['/O\\','[X]==','/|\\']],
  s:[['  __    ',' /oo\\  ','<||||>  ',' \\__/  ',' _/  \\_'],['  __    ',' /oo\\  ','<||||>  ',' _\\__/  ','/  /\\  \\']],
  V:[['  /\\   ',' [o]   ','/ V \\  ','|===|  ','/___\\_'],['  /\\   ',' <V>   ','/ V \\  ','|/|\\|  ','/___\\_']],
  l:[['  ___   ',' /oo\\  ','( oo )  ',' \\__/  ','~~/  \\_'],['  ___   ','( oo )  ',' \\__/  ','~==~  ',' _/\\_ ']],
  p:[[' \\ | / ','  \\|/  ',' --o--  ',' / | \\ ','/  |  \\'],[' / | \\ ','  /|\\  ',' --o--  ',' \\ | / ',' \\___/ ']],
  D:[['  /\\   ',' /o\\   ','[=|=]  ',' /|\\   ','/___\\  '],[' \\|/   ',' [o]   ','==|==  ',' / \\   ','/___\\  ']],
  f:[['  .*.   ',' /   \\ ','(  o  ) ',' \\ | / ','  / \\  '],['  :*:   ',' \\ | / ','(  o  ) ',' / | \\ ','  / \\  ']],
  '✺':[[' \\ | / ','-- O --',' /|X|\\ ','/  |  \\','  / \\  '],[' /  |  \\','== O ==','\\|X|/ ',' \\ | / ','  / \\  ']],
  '◆':[['  /O\\  ',' /[X]\\ ','<  |  >','  /|\\  ',' /___\\ ']],
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
  '#':[['  /\\   ',' /##\\  ','|####| ','|####| ','|____|_']],
  '#:1':[['  /\\   ',' /##\\  ','|#  #| ','|####| ','|__  |_']],
  '#:2':[[' /####\\','|#  #| ','|####| ','|#  #| ','|____|_']],
  '.':[['  .  .  ',' . . . ','..___..','._.___.','___.___']],
  '.:1':[['  . .  ',' .._.. ','._.___.','__\u005c__']],
  '.:2':[['  . .  ',' ._._. ','..___..','_/_/_/_']],
  ':':[['  :  :  ',' ::::: ','::___::','__:_::_','._._._.']],
  ':1':[['  : :  ',' ::_:: ','::_.___','__\u005c__']],
  ':2':[['  : :  ',' _::_ ','.___::','_/_/_/_']],
  ',':[['  , ,  ',' ,,,,  ','.____.','__,,__']],
  ';':[['  ; ;  ',' ;;;;  ',';.__.;','__;;__']],
  '^':[['   /\\   ','  /^^\\  ',' /^^^^\\ ','/^^^^^^\\','\\______ /']],
  '%':[['  /%%\\  ',' /%%%%\\ ','|%%##%%|','|%%%%%%|','|______|']],
  '%:1':[['  /%%\\  ',' /%%_\\ ','|%%__%%|','|____\\_|']],
  '%:2':[['  /%%\\  ',' /_%%\\ ','|__%%__|','|/____\\|']],
  '=':[[' /====\\ ','|==##==|','|======|','|==__==|','|__||__|']],
  '=:1':[[' /====\\ ','|=  ==| ','|======|','|==__==|','|__||__|']],
  '*':[['  .*.   ',' .*|*.  ','/|***|\\ ',' |***|  ',' |___|  '],['  :*:   ',' :*|*:  ','\\|***|/ ',' |***|  ',' |___|  ']],
  '&':[['  {*.*} ',' {***} ','  /|\\  ',' / | \\ ','/___|__\\'],['  {*.*} ',' {***} ','  \\|/  ',' \\ | / ','/___|__\\']],
  '~':[[' ~ ~ ~ ','  ~~~  ',' ~~~~~ ','__~_~__','~__~__~'],['  ~~~  ',' ~ ~ ~ ','~~~~~~ ','_~___~_','~_~_~_~']],
  '!':[[' !*!*! ','/!!!\\ ',' !*!*! ','__!_!__'],[' *!*!* ','\\!!!/ ',' *!*!* ','_!___!_']],
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
  'enemy:telegraph':[[' . ','/|\\',' /\\'],[' ! ','/|\\','/ \\']],
  'enemy:recover:s':[[' __','/oo\\','/\\/\\']],
  'enemy:recover:V':[['[o]','/V\\','| |']],
  'enemy:recover:l':[[' _ ','(oo','/==~']],
  'enemy:recover:p':[['\\ /','(o)','/ \\']],
  'enemy:recover:D':[['/o\\','[=]','/ \\']],
  'enemy:recover:f':[['.*.','(o)','/|\\']],
  'enemy:recover:✺':[['\\ | /','--O--','/|X|\\','/ | \\']],
  'enemy:recover:◆':[['/O\\','[X]','/|\\']],
};
export function composition(glyph:string,frame=0):readonly string[]{
  const poses=ACTORS[glyph];
  if(poses)return poses[Math.abs(frame)%poses.length];
  return [glyph];
}
export function terrainComposition(tile:string,variant=0):string{
  // Walls keep the stable '#' identity for depth/occlusion probes; their
  // monumental detail lives in the shared base composition. Other materials
  // may select deterministic architectural or organic variants.
  if(tile==='#')return '#';
  const key=`${tile}:${Math.abs(variant)%3}`;
  return variant%3&&ACTORS[key]?key:tile;
}
export function isOccludingTerrain(tile:string):boolean{return tile==='#'||tile==='%'||tile==='=';}
export function paintComposition(ctx:CanvasRenderingContext2D,glyph:string,x:number,y:number,size:number,frame=0):void{
  const rows=composition(glyph,frame),multi=rows.length>1,dense=rows.length>=5;
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=`bold ${multi?(dense?size*.34:size*.48):size}px "DejaVu Sans Mono",monospace`;
  const rowGap=dense?size*.36:size*.46;
  for(let row=0;row<rows.length;row++)ctx.fillText(rows[row],x,y+(row-(rows.length-1)/2)*rowGap);
  ctx.restore();
}
