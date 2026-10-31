/** Shared original ASCII compositions. Pure data: no world state, DOM or RNG. */
export const CAMERA_SCALE=1.45;
const ACTORS:Record<string,readonly string[][]>={
  '@':[[' o ','/|\\','/ \\'],[' o ','/|>',' /\\']],
  s:[[' __','/oo\\','/\\/\\'],[' __','/oo\\','\\/\\/']],
  V:[['[o]','/V\\','| |'],['[o]','<V>','/ \\']],
  l:[[' _ ','(oo','/==~'],[' _ ','(oo','~==\\']],
  p:[['\\ /','(o)','/ \\'],['/ \\','(o)','\\ /']],
  D:[['/o\\','[=]','/ \\'],['\\o/','[=]','| |']],
  f:[['.*.','(o)','/|\\'],[':*:','(o)','\\|/']],
  '✺':[['\\ | /','--O--','/|X|\\','/ | \\'],['/ | \\','==O==','\\|X|/','\\ | /']],
  '◆':[['/O\\','[X]','/|\\']],
  '#':[[' /_\\','|##|','|__|']],
  '%':[[' /%\\','|%%|','|__|']],
  '=':[['/==\\','|==|']],
  '*':[[' .*.','/|\\',' | '],[' :*:','\\|/',' | ']],
  '&':[['{*}','/|\\','/ \\'],['{*}','\\|/','/ \\']],
  '~':[['~ ~',' ~~'],[' ~~','~ ~']],
  '!':[['!*!','/!\\'],['*!*','\\!/']],
  T:[['/T\\','[=]',' | ']],
  o:[['/o\\','|o|','\\_/']],
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
};
export function composition(glyph:string,frame=0):readonly string[]{
  const poses=ACTORS[glyph];
  if(poses)return poses[Math.abs(frame)%poses.length];
  return [glyph];
}
export function paintComposition(ctx:CanvasRenderingContext2D,glyph:string,x:number,y:number,size:number,frame=0):void{
  const rows=composition(glyph,frame),multi=rows.length>1;
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=`bold ${multi?size*.48:size}px "DejaVu Sans Mono",monospace`;
  for(let row=0;row<rows.length;row++)ctx.fillText(rows[row],x,y+(row-(rows.length-1)/2)*size*.46);
  ctx.restore();
}
