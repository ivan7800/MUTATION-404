import { createGame, deserialize, dispatch, RECIPES, RESOURCE_INFO, MUTATIONS, biomeAt, BIOMES, weatherAt, WEATHER, ENEMY_DEFS, formatClock, HEIGHT, ITEM_DEFS, LANDMARKS, MARKET, ZONE_NAMES, ruinName, SECTORS, coordsForZone, sectorName, serialize, stackCount, WIDTH, xpNeeded, TASKS, GOODS, priceFor, settlementCitizens, exteriorForInterior, type Command, type GameState, type ItemId, type MutationId } from '../../../packages/core/src/game.js';
import { index } from '../../../packages/core/src/world.js';
import { AsciiRenderer } from './renderer.js';
import type { PixiAsciiRenderer } from './pixi-renderer.js';
import { AtmosphereAudio } from './audio.js';

const SAVE_KEY='mutation404.v10.save',V09_KEY='mutation404.v09.save',V08_KEY='mutation404.v08.save',V07_KEY='mutation404.v07.save',LAST_KEY='mutation404.v06.save',OLDER_KEY='mutation404.v05.save',OLD_KEY='mutation404.v04.save',PREVIOUS_KEY='mutation404.v03.save',LEGACY_KEY='mutation404.v02.save',FIRST_KEY='mutation404.v01.save';
const root=document.querySelector<HTMLElement>('#app');if(!root)throw new Error('Falta #app');
root.innerHTML=`
<div class="shell">
<header class="topbar"><div class="brand"><span class="brand-mark">◈</span><div><div class="brand-title">MUTATION <em>404</em></div><div class="brand-sub">NÁCAR // ARCHIVO 11 — ECOS DE NÁCAR</div></div></div><div class="top-controls"><span class="live"><span class="live-dot"></span>SEÑAL INESTABLE</span><button class="icon-btn" id="audio-btn" aria-pressed="false">♫ ACTIVAR SONIDO</button><button class="icon-btn" id="help-btn">? AYUDA</button></div></header>
<div class="hero-strip"><span><span id="biome-strip">REGIÓN / SALINAS DE VÉRTICE</span></span><span id="clock">07:00</span><span id="coords">X:32 Y:32</span><span class="strip-accent" id="exploration">EXPLORACIÓN 0%</span></div>
<main class="layout">
<section class="game-column" aria-label="Área de juego">
<div class="panel-heading"><div><span class="tiny-label">VISTA DE EXPLORACIÓN / COMBATE TÁCTICO</span><h1 id="location">Faro Ciego</h1></div><div class="zoom"><button id="zoom-out" aria-label="Reducir mapa">−</button><button id="art-mode-btn" type="button" aria-label="Alternar entre modo píxel y ASCII" aria-pressed="true">PÍXEL / ASCII</button><button id="zoom-in" aria-label="Ampliar mapa">+</button></div></div>
<div class="biome-story" aria-live="polite">
  <div class="biome-emblem">◈</div>
  <div class="biome-story-text"><span class="tiny-label" id="biome-subtitle">EL DESIERTO QUE ESCUCHA</span><p id="biome-description">La sal conserva ecos de quienes desaparecieron.</p></div>
  <span id="weather-badge" class="weather-badge">◉ CALMA</span>
</div>
<div id="viewport" class="viewport"></div>
<div class="field-notice"><span id="climate-note">ATMÓSFERA // CALMA</span><span id="threat-note">RIESGO // BAJO</span></div>
<div class="toolbar"><span><kbd>@</kbd> ERRANTE <b>·</b> <kbd>s</kbd> CARROÑERO <b>·</b> <kbd>V</kbd> VIGÍA <b>·</b> <kbd>l</kbd> LARVA <b>·</b> <kbd>p</kbd> POLILLA <b>·</b> <kbd>D</kbd> CAZADOR <b>·</b> <kbd>f</kbd> PASTOR <b>·</b> <kbd>$</kbd> BOTÍN</span><span>MAPA <span id="map-pos">32,32</span></span></div>
<div class="combatbar"><div><span class="tiny-label">OBJETIVO ACTUAL</span><strong id="target-info">SIN OBJETIVO</strong></div><div><span class="tiny-label">ARMA ACTIVA</span><strong id="weapon-info">HOJA DE DESGUACE</strong></div><div><span class="tiny-label">MUNICIÓN</span><strong id="ammo-info">12 PÚAS</strong></div></div>
<div class="actionbar"><button id="mutations-btn" class="action gene">[U] MUTACIONES</button><button id="pulse-btn" class="action gene">[1] PULSO</button><button id="neural-btn" class="action gene">[2] GRITO NEURAL</button><button id="fire-btn-gene" class="action gene">[3] IGNICIÓN</button><button id="phase-btn" class="action gene">[4] PASO DE FASE</button><button id="scan-btn" class="action discovery">[R] SONDEAR</button><button id="travel-btn" class="action discovery">[V] REGIONES</button><button id="atlas-btn" class="action discovery">[M] ATLAS</button><button id="market-btn" class="action discovery">[C] COMERCIAR</button><button id="house-btn" class="action discovery">[L] EDIFICIO / SALIR</button><button id="down-btn" class="action">[N] DESCENDER</button><button id="up-btn" class="action">[P] ASCENDER</button><button id="interact-btn" class="action primary">[E] INTERACTUAR</button><button id="target-btn" class="action">[T] OBJETIVO</button><button id="attack-btn" class="action attack">[X] GOLPEAR</button><button id="fire-btn" class="action attack">[F] DISPARAR</button><button id="pickup-btn" class="action">[G] RECOGER</button><button id="heal-btn" class="action">[H] CURAR</button><button id="harvest-btn" class="action discovery">[K] RECOLECTAR</button><button id="craft-btn" class="action discovery">[O] FABRICAR</button><button id="ecology-btn" class="action discovery">[Y] ECOLOGÍA</button><button id="inventory-btn" class="action">[B] EQUIPO</button><button id="swap-btn" class="action">[Q] CAMBIAR ARMA</button><button id="journal-btn" class="action">[J] DIARIO</button><button id="wait-btn" class="action">[ESPACIO] ESPERAR</button></div>
<div class="touch-controls"><div class="dpad"><span></span><button data-move="up" aria-label="Ir al norte">▲</button><span></span><button data-move="left" aria-label="Ir al oeste">◀</button><button data-move="down" aria-label="Ir al sur">▼</button><button data-move="right" aria-label="Ir al este">▶</button></div><p>Controles táctiles / alternativa al teclado</p></div>
<div id="death-banner" class="death-banner hidden" role="alert">SEÑAL VITAL PERDIDA · CARGA UNA PARTIDA O INICIA UNA NUEVA</div>
<div class="eventpanel"><div class="section-title">BITÁCORA DE CAMPO <span>REGISTRO ACTIVO</span></div><div id="log" aria-live="polite" role="status"></div></div>
</section>
<aside class="sidebar"><div class="side-card"><div class="section-title">SUJETO // 404 <span>ERRANTE</span></div><div class="portrait"><span>@</span><div><strong>SIN NOMBRE</strong><small>Origen: Nacido del Polvo</small><small id="actor-state">Estado: Estable</small></div></div><div class="stat"><span>VITALIDAD</span><span id="hp-text">32 / 32</span></div><div class="meter"><i id="hp-bar" style="width:100%"></i></div><div class="stat"><span>CONCENTRACIÓN</span><span id="focus-text">18 / 18</span></div><div class="meter focus"><i id="focus-bar" style="width:100%"></i></div><div class="stat"><span>EXPERIENCIA · <span id="level">NV 1</span></span><span id="xp-text">0/12</span></div><div class="meter xp"><i id="xp-bar" style="width:0%"></i></div><div class="stat"><span>EXPOSICIÓN BIOLÓGICA</span><span id="exposure-text">0%</span></div><div class="meter exposure"><i id="exposure-bar" style="width:0%"></i></div><div class="pairs"><span>GENES DISPONIBLES</span><b id="genes">1</b><span>MUTACIONES</span><b id="gene-count">2 / 9</b><span>EFECTOS ACTIVOS</span><b id="field-count">0</b><span>TURNO</span><b id="turn">0</b><span>SEMILLA</span><b id="seed">404</b><span>BAJAS</span><b id="kills">0</b><span>ARMADURA</span><b id="armor">1</b><span>REGIÓN</span><b id="region">FARO CIEGO</b></div></div>
<div class="side-card mutation-card"><div class="section-title">GENOMA / 404 <span>W4</span></div><p id="gene-summary">Tu cuerpo no recuerda su forma original.</p><div id="mutant-skills"></div><button id="mutations-side-btn" class="action gene">[U] ABRIR GENOMA</button></div><div class="side-card discovery-card"><div class="section-title">ECOSISTEMA <span>EXPLORACIÓN</span></div><h3 id="biome-name">Salinas de Vértice</h3><p id="biome-lore">La sal cruje bajo tus pies.</p><div class="weather-line"><span>CLIMA</span><b id="weather-info">Calma</b></div><div class="weather-line"><span>ARCHIVOS RECUPERADOS</span><b id="research-count">0 / 6</b><span>PRESIÓN TERRITORIAL</span><b id="ecology-pressure">0 / 5</b></div><p class="hint">Pulsa <kbd>R</kbd> para sondear el bioma. Consume 4 puntos de concentración.</p></div>
<div class="side-card"><div class="section-title">CARTOGRAFÍA <span>SECTOR 01</span></div><canvas id="minimap" class="minimap" aria-label="Minimapa y amenazas visibles"></canvas><div class="map-caption">Los enemigos se muestran al entrar en tu campo de visión.</div></div>
<div class="side-card mission-card"><div class="section-title">MISIÓN EN CURSO <span>PRINCIPAL</span></div><h3 id="quest-name">Eco bajo la sal</h3><p id="quest-text">Habla con Mara Venn, en la plaza.</p><div class="quest-state" id="quest-state">● SIN INICIAR</div></div>
<div class="side-card"><div class="section-title">EQUIPO Y SUMINISTROS <span>W3</span></div><div id="equipment-summary" class="equipment-summary"></div></div>
<div class="side-card"><div class="section-title">SISTEMA <span>v1.0</span></div><div class="system-actions"><button id="save-btn">GUARDAR</button><button id="load-btn">CARGAR</button><button id="new-btn">NUEVA PARTIDA</button></div><div class="save-status" id="save-status">Autoguardado local activado.</div></div></aside></main>
<footer><span>FARO CIEGO / NACAR_404</span><span>W13 — ECOS DE NÁCAR</span><span>JUGABLE SIN CONEXIÓN EXTERNA</span></footer>
</div>
<div id="modal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-card"><div class="modal-header"><span id="modal-caption">TRANSMISIÓN LOCAL</span><button id="modal-close" aria-label="Cerrar diálogo">✕</button></div><h2 id="modal-title">Registro</h2><div id="modal-content"></div><div id="modal-options"></div></div></div>`;
const $=<T extends HTMLElement>(selector:string):T=>{const el=document.querySelector<T>(selector);if(!el)throw new Error(`Elemento ${selector} ausente`);return el;};
let renderer:AsciiRenderer|PixiAsciiRenderer=new AsciiRenderer($<HTMLDivElement>('#viewport'));
$<HTMLElement>('#viewport').dataset.renderer='canvas2d';
const audio=new AtmosphereAudio();
let state:GameState=createGame(404);
let modalMode:'dialogue'|'journal'|'help'|'inventory'|'atlas'|'mutations'|'market'|'regional-market'|'craft'|'ecology'|null=null;
let stepCount=0;
const write=(selector:string,text:string)=>{$<HTMLElement>(selector).textContent=text;};
const escapeHtml=(s:string):string=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const percent=(a:number,b:number):string=>`${Math.round(100*a/b)}%`;
function currentLocation():string{
  if(state.zone.startsWith('ruin-')||state.zone.startsWith('zero-'))return ruinName(state.zone);
  if(exteriorForInterior(state.zone))return `CASA COMUNAL · ${exteriorForInterior(state.zone)}`;
  if(state.zone.startsWith('sector-')){const at=coordsForZone(state.zone)!;return sectorName(at.x,at.y);}
  if(state.player.x>=18&&state.player.x<=47&&state.player.y>=21&&state.player.y<=43)return 'Faro Ciego';
  const close=LANDMARKS.slice(1).find(p=>Math.abs(p.x-state.player.x)+Math.abs(p.y-state.player.y)<5);
  return close?.name||BIOMES[biomeAt(state.seed,state.player.x,state.player.y)].name;
}
function save(silent=false):void{
  try{
    localStorage.setItem(SAVE_KEY,serialize(state));
    if(!silent)state.log.push('SISTEMA // Partida guardada en este navegador.');
    write('#save-status',`Guardado v1.0 · ${formatClock(state.tick)}`);
  }catch{
    state.log.push('ERROR // El navegador ha bloqueado el guardado.');write('#save-status','Error de guardado');
  }
}
function draw():void{
  const biome=biomeAt(state.seed,state.player.x,state.player.y);
  const weather=weatherAt(state.seed,state.tick,biome);
  const biomeDef=BIOMES[biome],weatherDef=WEATHER[weather];
  document.documentElement.dataset.biome=biome;
  audio.update(biome,weather);
  write('#biome-strip',`REGIÓN / ${(state.zone==='surface'?biomeDef.name:(coordsForZone(state.zone)||exteriorForInterior(state.zone)?currentLocation():ruinName(state.zone))).toUpperCase()}`);
  write('#biome-subtitle',exteriorForInterior(state.zone)?'INTERIOR / VIDA DE ASENTAMIENTO':coordsForZone(state.zone)?biomeDef.subtitle:'SUBSUELO / CERO-7 · ESCUCHA LAS PAREDES');
  write('#biome-description',exteriorForInterior(state.zone)?'Los residentes siguen horarios. Habla con el cronista (?), el mercader ($) y el vigía (!). Sal por la puerta sur (30,25).':coordsForZone(state.zone)?biomeDef.description:'Cada ruina conserva sus huellas y peligros. Examina la reliquia o (20,12) con E; salida + (10,10), descenso T (14,10).');
  write('#biome-name',biomeDef.name);
  write('#biome-lore',biomeDef.sound);
  write('#weather-badge',coordsForZone(state.zone)?`◉ ${weatherDef.name.toUpperCase()}`:'◉ ATMÓSFERA ESTANCADA');
  write('#weather-info',weatherDef.name);
  write('#climate-note',coordsForZone(state.zone)?`ATMÓSFERA // ${weatherDef.description}`:'ATMÓSFERA // SIN SOL, SIN VIENTO · SEÑALES ANÓMALAS');
  write('#threat-note',coordsForZone(state.zone)?`PELIGRO // ${biomeDef.threat}`:'PELIGRO // INSTALACIÓN HOSTIL');
  write('#research-count',`${state.biomeNotes.length} / 6`);
  write('#ecology-pressure',`${state.ecology.pressure[state.zone]??0} / 5`);
  write('#exposure-text',`${state.exposure}%`);
  $<HTMLElement>('#exposure-bar').style.width=`${state.exposure}%`;
  $<HTMLElement>('#exposure-bar').classList.toggle('critical',state.exposure>=65);
  renderer.draw(state);renderer.renderMinimap(state,$<HTMLCanvasElement>('#minimap'));
  write('#clock',formatClock(state.tick));write('#coords',`X:${state.player.x} Y:${state.player.y}`);
  write('#map-pos',`${state.player.x},${state.player.y}`);write('#turn',String(state.tick/100));write('#seed',String(state.seed));
  write('#region',(state.zone==='surface'?currentLocation():(coordsForZone(state.zone)||exteriorForInterior(state.zone)?currentLocation():ruinName(state.zone))).toUpperCase());write('#location',state.zone==='surface'?currentLocation():(coordsForZone(state.zone)||exteriorForInterior(state.zone)?currentLocation():ruinName(state.zone)));
  write('#exploration',`EXPLORADO ${Math.round(100*state.seen.reduce((a,b)=>a+b,0)/(WIDTH*HEIGHT))}%`);
  const log=$<HTMLElement>('#log');log.replaceChildren();
  state.log.slice(-9).reverse().forEach((line,i)=>{const p=document.createElement('p');p.className=i===0?'latest':'';p.textContent=line;log.appendChild(p);});
  const q=state.quest;
  write('#quest-name',q.status==='completed'?'Eco bajo la sal — COMPLETADA':'Eco bajo la sal');
  const summary=q.status==='undiscovered'?'Habla con Mara Venn (M), en la plaza.':q.status==='active'?'Investiga la Torre del Nudo (79,13). El fusible está en la caravana (12,10).':q.status==='signal-found'?'Regresa a Faro Ciego e informa a Mara Venn.':`La señal fue ${q.outcome==='broadcast'?'difundida':'aislada'}. Tus actos han dejado una huella.`;
  write('#quest-text',summary);write('#quest-state',q.status==='undiscovered'?'● SIN INICIAR':q.status==='active'?'● ACTIVA':q.status==='signal-found'?'● INFORMAR A MARA':'✓ COMPLETADA');
  const stats=state.stats;
  write('#hp-text',`${stats.hp} / ${stats.maxHp}`);write('#focus-text',`${stats.focus} / ${stats.maxFocus}`);
  write('#level',`NV ${stats.level}`);write('#xp-text',`${stats.xp}/${xpNeeded(stats.level)}`);
  $<HTMLElement>('#hp-bar').style.width=percent(stats.hp,stats.maxHp);
  $<HTMLElement>('#focus-bar').style.width=percent(stats.focus,stats.maxFocus);
  $<HTMLElement>('#xp-bar').style.width=percent(stats.xp,xpNeeded(stats.level));
  write('#actor-state',stats.hp<=0?'Estado: Señal vital perdida':stats.hp<stats.maxHp*.3?'Estado: Crítico':'Estado: Estable');
  write('#kills',String(state.kills));write('#armor',String((ITEM_DEFS[state.equipment.armor].armor??0)+(state.genome.unlocked.includes('dermal-plates')?1:0)));
  write('#genes',String(state.genome.genePoints));write('#gene-count',`${state.genome.unlocked.length} / 9`);write('#field-count',String(state.fields.length));
  write('#gene-summary',state.genome.genePoints>0?`Tienes ${state.genome.genePoints} punto(s) genético(s) para evolucionar. Pulsa U.`:'Desbloquea genes al subir de nivel; los poderes gastan concentración.');
  const abilities=$<HTMLElement>('#mutant-skills');abilities.replaceChildren();
  for(const id of state.genome.unlocked){const p=document.createElement('p');p.className='gene-list-entry';p.textContent=`${MUTATIONS[id].shortcut?'['+MUTATIONS[id].shortcut+'] ':''}${MUTATIONS[id].name}${MUTATIONS[id].passive?' · PASIVA':` · CD ${state.genome.cooldowns[id]??0}`}`;abilities.appendChild(p);}
  for(const [button,id] of [['#pulse-btn','kinetic-pulse'],['#neural-btn','neural-shock'],['#fire-btn-gene','pyrokinesis'],['#phase-btn','phase-step']] as const){const b=$<HTMLButtonElement>(button);b.disabled=!state.genome.unlocked.includes(id)||state.stats.hp<=0;b.title=MUTATIONS[id].description+` · coste ${MUTATIONS[id].focus} · recuperación ${state.genome.cooldowns[id]??0}`;}
  const selected=state.enemies.find(e=>e.id===state.targetId&&e.hp>0&&state.visible[index(e.x,e.y)]===1);
  write('#target-info',selected?`${ENEMY_DEFS[selected.kind].name.toUpperCase()} · ${selected.hp} PV`:'SIN OBJETIVO');
  write('#weapon-info',ITEM_DEFS[state.equipment[state.equipment.active]].name.toUpperCase());
  write('#ammo-info',`${stackCount(state.inventory,'ammo')} PÚAS`);
  const equip=$<HTMLElement>('#equipment-summary');equip.replaceChildren();
  for(const value of [ITEM_DEFS[state.equipment.melee].name,ITEM_DEFS[state.equipment.ranged].name,ITEM_DEFS[state.equipment.armor].name,`Ampollas: ${stackCount(state.inventory,'medkit')}`]){
    const p=document.createElement('p');p.textContent=value;equip.appendChild(p);
  }
  $<HTMLElement>('#death-banner').classList.toggle('hidden',stats.hp>0);
}
function showModal(title:string,body:string,options:{id:string;label:string}[],mode:NonNullable<typeof modalMode>):void{
  modalMode=mode;write('#modal-title',title);
  $<HTMLElement>('#modal-content').innerHTML=body;
  write('#modal-caption',mode==='dialogue'?'FRECUENCIA LOCAL / DIÁLOGO':mode==='inventory'?'INVENTARIO Y EQUIPAMIENTO':mode==='mutations'?'EVOLUCIÓN GENÉTICA':mode==='journal'?'ARCHIVO DEL ERRANTE':'MANUAL DE OPERACIONES');
  const container=$<HTMLElement>('#modal-options');container.replaceChildren();
  options.forEach((o,i)=>{
    const btn=document.createElement('button');btn.className='modal-option';btn.textContent=`${i+1}. ${o.label}`;
    btn.addEventListener('click',()=>{
      if(mode==='dialogue'){
        const result=dispatch(state,{type:'choose',option:o.id});closeModal();if(result.accepted)save(true);draw();if(o.id==='shop')market();if(o.id==='regional-market')regionalMarket();
      }else if(mode==='mutations'&&o.id!=='close'){
        actFromModal({type:'unlock',mutation:o.id as MutationId});
      }else if(mode==='regional-market'&&o.id!=='close'){
        const [side,item]=o.id.split(':');actFromModal({type:'regional-trade',side:side as 'buy'|'sell',item:item as ItemId});
      }else if(mode==='craft'&&o.id!=='close'){
        actFromModal({type:'craft',recipe:o.id});
      }else if(mode==='market'&&o.id!=='close'){
        const [side,item]=o.id.split(':');actFromModal({type:'trade',side:side as 'buy'|'sell',item:item as ItemId});
      }else if(mode==='inventory'&&o.id!=='close'){
        if(o.id==='heal')actFromModal({type:'heal'});
        else actFromModal({type:'equip',item:o.id as ItemId});
      }else closeModal();
    });container.appendChild(btn);
  });
  $<HTMLElement>('#modal').classList.remove('hidden');container.querySelector('button')?.focus();
}
function closeModal():void{
  if(modalMode==='dialogue')dispatch(state,{type:'close-dialog'});
  modalMode=null;$<HTMLElement>('#modal').classList.add('hidden');renderer.focus();
}
function actFromModal(command:Command):void{closeModal();act(command);}
function handleDialogue():void{const d=state.dialogue;if(d)showModal(d.speaker,`<p>${escapeHtml(d.text)}</p>`,d.options,'dialogue');}
function act(command:Command):void{
  if(modalMode)return;
  const beforeHp=state.stats.hp;
  const beforeEnemies=new Map(state.enemies.filter(e=>e.hp>0).map(e=>[e.id,{hp:e.hp,x:e.x,y:e.y}]));
  const result=dispatch(state,command);
  if(result.accepted&&'combatFeedback' in renderer)renderer.combatFeedback(beforeEnemies,state);
  if(result.accepted){
    const kind=state.stats.hp<beforeHp?'damage':command.type==='cast'?'mutation':command.type==='scan'?'scan':(['attack','fire'].includes(command.type)?'attack':null);
    if(kind){renderer.effect(state,kind);audio.cue(kind);}
  }
  if(command.type==='interact'&&state.dialogue)handleDialogue();
  if(!result.accepted&&!['inspect','target'].includes(command.type))write('#save-status',result.message);
  if(result.accepted&&result.timeCost>0){stepCount++;if(stepCount%8===0&&state.stats.hp>0)save(true);}
  draw();
}
function market():void{
  if(modalMode)return;
  if(state.zone!=='surface'||![{x:10,y:36},{x:71,y:37}].some(p=>Math.abs(p.x-state.player.x)+Math.abs(p.y-state.player.y)<=1)){
    state.log.push('MERCADO // Acércate a Kala (10,36) o Ida (71,37).');draw();return;
  }
  const body=`<p class="modal-lead">CRÉDITOS: ${state.stats.credits} · REPUTACIÓN FERRAL: ${state.reputation.ferral}</p><p>Comercia con suministros. Los precios de compra mejoran ligeramente con tu reputación.</p><ul>${Object.entries(MARKET).map(([id,price])=>`<li><strong>${escapeHtml(ITEM_DEFS[id as ItemId].name)}</strong> · Compra ${Math.max(1,price.buy-Math.min(3,Math.max(0,state.reputation.ferral)))} cr · Venta ${price.sell} cr · Tienes ${stackCount(state.inventory,id as ItemId)}</li>`).join('')}</ul>`;
  const options=[...Object.keys(MARKET).map(id=>({id:`buy:${id}`,label:`Comprar ${ITEM_DEFS[id as ItemId].name}`})),...Object.keys(MARKET).filter(id=>stackCount(state.inventory,id as ItemId)>0).map(id=>({id:`sell:${id}`,label:`Vender ${ITEM_DEFS[id as ItemId].name}`})),{id:'close',label:'Cerrar mercado'}];
  showModal('MERCADO FERRAL',body,options,'market');
}
function regionalMarket():void{
  if(modalMode)return;
  const merchant=settlementCitizens(state.zone,state.tick).find(c=>c.role==='mercader'&&Math.abs(c.x-state.player.x)+Math.abs(c.y-state.player.y)<=1);
  const task=TASKS.find(t=>t.sector===merchant?.sector);
  if(!merchant||!task){state.log.push('MERCADO // Acércate al intendente ($) de cualquier enclave.');draw();return;}
  const rep=state.reputation[task.faction]??0;
  const rows=Object.keys(GOODS).map(id=>`<li>${escapeHtml(ITEM_DEFS[id as ItemId].name)} · comprar ${priceFor(id as ItemId,'buy',rep,task.sector)} · vender ${priceFor(id as ItemId,'sell',rep,task.sector)} · tienes ${stackCount(state.inventory,id as ItemId)}</li>`).join('');
  const options=[...Object.keys(GOODS).map(id=>({id:`buy:${id}`,label:`Comprar ${ITEM_DEFS[id as ItemId].name}`})),...Object.keys(GOODS).filter(id=>stackCount(state.inventory,id as ItemId)>0).map(id=>({id:`sell:${id}`,label:`Vender ${ITEM_DEFS[id as ItemId].name}`})),{id:'close',label:'Cerrar'}];
  showModal(`PUESTO // ${merchant.name}`,`<p class="modal-lead">CRÉDITOS ${state.stats.credits} · ${escapeHtml(task.faction)} ${rep}</p><p>La escasez local y tu reputación alteran precios reales.</p><ul>${rows}</ul>`,options,'regional-market');
}
function journal():void{
  if(modalMode)return;
  const status=state.quest.status;
  const body=`<p class="modal-lead">REGISTRO DE LA FRECUENCIA</p><p>${escapeHtml(status==='undiscovered'?'Mara Venn parece querer hablar contigo.':status==='active'?'Viaja a la torre del noreste. La caravana del noroeste puede ayudarte.':status==='signal-found'?'La transmisión ha sido procesada. Tienes que informar a Mara.':`Misión finalizada: ${state.quest.outcome==='broadcast'?'la señal se difundió':'la señal fue aislada'}.`)}</p><h3>Botín y combate</h3><p>Enemigos derrotados: ${state.kills}. Nivel ${state.stats.level}. Enemigos visibles: ${state.enemies.filter(e=>e.hp>0&&state.visible[index(e.x,e.y)]).length}.</p><h3>Archivo de ecosistemas (${state.biomeNotes.length}/6)</h3><ul>${state.biomeNotes.map(id=>`<li><strong>${escapeHtml(BIOMES[id].name)}</strong> — ${escapeHtml(BIOMES[id].lore)}</li>`).join('')||'<li>Sin lecturas. Sondea con R en el exterior.</li>'}</ul><h3>Profundidades y facciones</h3><p>Localización: ${escapeHtml((coordsForZone(state.zone)||exteriorForInterior(state.zone)?currentLocation():ruinName(state.zone)))}. Reputación Ferral: ${state.reputation.ferral}; Concordia: ${state.reputation.concordia}. Acontecimientos: ${state.events.map(escapeHtml).join(', ')||'ninguno'}.</p><h3>Encargos regionales</h3><ul>${TASKS.filter(t=>state.civilization.active.includes(t.id)||state.civilization.completed.includes(t.id)).map(t=>`<li>${escapeHtml(t.title)} · ${state.civilization.completed.includes(t.id)?'COMPLETADO':'ACTIVO · entrega '+t.required+' chatarra'}</li>`).join('')||'<li>Habla con los cronistas (?) de las casas comunales para conseguir encargos.</li>'}</ul><h3>Mutaciones</h3><p>Genoma ${state.genome.unlocked.length}/9 · Puntos genéticos ${state.genome.genePoints}. Pulsa U para evolucionar.</p><h3>Inventario de misión</h3><p>${state.quest.fuseFound?'◈ Fusible cerámico de Caravana Quietud':'Ningún objeto de misión.'}</p><h3>Lugares descubiertos</h3><ul>${LANDMARKS.filter(p=>state.discoveries.includes(p.id)).map(p=>`<li><strong>${escapeHtml(p.name)}</strong> — ${escapeHtml(p.description)}</li>`).join('')}</ul>`;
  showModal('DIARIO DE CAMPO',body,[{id:'close',label:'Cerrar el diario'}],'journal');
}
function atlas():void{
  if(modalMode)return;
  const current=biomeAt(state.seed,state.player.x,state.player.y);
  const body=`<p class="modal-lead">CARTOGRAFÍA CLIMÁTICA DE NÁCAR</p><p>Seis zonas ecológicas distintas conviven en las salinas. El atlas registra tus investigaciones; los biomas no descubiertos mantienen sus secretos.</p>
  <div class="atlas-grid">${(Object.entries(BIOMES) as [keyof typeof BIOMES,typeof BIOMES[keyof typeof BIOMES]][]).map(([id,def])=>`<div class="atlas-entry ${id===current?'current':''}"><span class="atlas-dot" style="background:${def.palette}"></span><div><strong>${escapeHtml(def.name)}</strong><small>${state.biomeNotes.includes(id)?escapeHtml(def.lore):'Archivo sin completar · pulsa R para sondear.'}</small></div></div>`).join('')}</div>
  <p class="muted">Faro Ciego es seguro. Las condiciones meteorológicas afectan la visión; las zonas inestables se indican con ! en el mapa.</p>`;
  showModal('ATLAS DE NÁCAR',body,[{id:'close',label:'Volver a las salinas'}],'atlas');
}
function regions():void{
  if(modalMode)return;
  const here=coordsForZone(state.zone);
  const rows=SECTORS.map(v=>`<li><strong>${v.x===here?.x&&v.y===here?.y?'◈ ':''}${escapeHtml(v.name)}</strong> (${v.x},${v.y}) · ${escapeHtml(v.faction)} · riesgo ${v.danger}/3<span class="item-description">${escapeHtml(v.description)}</span></li>`).join('');
  showModal('CARTA DE REGIONES',`<p class="modal-lead">9 SECTORES · ${here?escapeHtml(sectorName(here.x,here.y)):'SUBSUELO'}</p><p>Cruza los bordes del mapa siguiendo las carreteras horizontales o verticales. Los sectores recordarán enemigos, objetos y exploración. Interactúa con el centro de los enclaves para registrar alianzas.</p><ul>${rows}</ul>`,[{id:'close',label:'Volver a explorar'}],'atlas');
}
function mutations():void{
  if(modalMode)return;
  const cards=(Object.entries(MUTATIONS) as [MutationId,typeof MUTATIONS[MutationId]][]).map(([id,def])=>{
    const learned=state.genome.unlocked.includes(id),cd=state.genome.cooldowns[id]??0;
    return `<li><strong>${escapeHtml(def.name)}</strong> · ${escapeHtml(def.family)} · ${learned?'ADQUIRIDA':`COSTE ${def.cost} GEN`}<span class="item-description">${escapeHtml(def.description)}${def.passive?' · Permanente':` · ${def.focus} concentración · CD ${def.cooldown} · Tecla ${def.shortcut}`}${cd?' · Recuperación restante '+cd:''}</span></li>`;
  }).join('');
  const options:{id:string;label:string}[]=(Object.keys(MUTATIONS) as MutationId[]).filter(id=>!state.genome.unlocked.includes(id)&&MUTATIONS[id].cost<=state.genome.genePoints).map(id=>({id,label:`Desarrollar ${MUTATIONS[id].name} (${MUTATIONS[id].cost} gen)`}));
  options.push({id:'close',label:'Volver al mundo'});
  showModal('MUTAGÉNESIS',`<p class="modal-lead">PUNTOS GENÉTICOS: ${state.genome.genePoints} · MUTACIONES: ${state.genome.unlocked.length}/9</p><p>El genoma cambia tu cuerpo y las reglas del combate. Cada nivel otorga un punto; elige con cuidado. Los poderes activos utilizan las teclas 1–4 y requieren concentración.</p><ul>${cards}</ul>`,options,'mutations');
}
function crafting():void{
 if(modalMode)return;
 const rows=RECIPES.map(r=>`<li><strong>${escapeHtml(r.name)}</strong>: ${escapeHtml(r.description)}</li>`).join('');
 const options=RECIPES.map(r=>({id:r.id,label:`Fabricar ${r.name}`}));options.push({id:'close',label:'Cerrar taller'});
 showModal('TALLER DEL ERRANTE',`<p class="modal-lead">ARTESANÍA PORTÁTIL</p><ul>${rows}</ul><p>Las recetas consumen recursos reales. Cada fabricación avanza un turno.</p>`,options,'craft');
}
function ecologyPanel():void{
 if(modalMode)return;
 const zone=state.zone,pressure=state.ecology.pressure[zone]??0;
 const resources=state.ecology.nodes.filter(n=>n.zone===zone&&n.quantity>0);
 const rows=resources.filter(n=>Math.abs(n.x-state.player.x)+Math.abs(n.y-state.player.y)<=12).slice(0,12).map(n=>`<li>${escapeHtml(RESOURCE_INFO[n.kind].name)} · ${n.x},${n.y} · ${n.quantity} extracción(es)</li>`).join('');
 showModal('ECOSISTEMA DE NÁCAR',`<p class="modal-lead">PRESIÓN ECOLÓGICA ${pressure}/5 · CICLO ${state.ecology.lastPulse}</p><p>En cada ciclo largo, las criaturas pueden migrar hacia sectores que ya has explorado. Los depósitos naturales se agotan al recolectarlos.</p><ul>${rows||'<li>Inspecciona o explora para detectar recursos próximos.</li>'}</ul><p>${escapeHtml(state.ecology.history.slice(-2).join(' / '))}</p>`,[{id:'close',label:'Volver'}],'ecology');
}
function inventory():void{
  if(modalMode)return;
  const rows=state.inventory.map(item=>`<li><strong>${escapeHtml(ITEM_DEFS[item.id].name)}</strong> ×${item.count}<span class="item-description">${escapeHtml(ITEM_DEFS[item.id].description)}</span></li>`).join('');
  const equip=[state.equipment.melee,state.equipment.ranged,state.equipment.armor].map(x=>ITEM_DEFS[x].name).join(' / ');
  const options:{id:string;label:string}[]=state.inventory.filter(item=>['blade','pistol','rifle','coat','shell-armor'].includes(item.id)).map(item=>({id:item.id,label:`Equipar ${ITEM_DEFS[item.id].name}`}));
  if(stackCount(state.inventory,'medkit')>0)options.push({id:'heal',label:'Usar ampolla reconstituyente'});
  options.push({id:'close',label:'Cerrar inventario'});
  showModal('INVENTARIO',`<p class="modal-lead">EQUIPO ACTUAL: ${escapeHtml(equip)}</p><p>Selecciona una pieza para equiparla (consume un turno). El botín se recoge con G cuando estás sobre su casilla.</p><ul>${rows}</ul>`,options,'inventory');
}
function help():void{
  if(modalMode)return;
  showModal('CONTROLES Y COMBATE',`<p>Explora Nácar. Faro Ciego es una zona segura: los enemigos permanecen fuera de sus murallas. Tu mapa conserva la niebla explorada.</p><ul><li><strong>W A S D / FLECHAS:</strong> moverse; caminar contra enemigo adyacente = golpe cuerpo a cuerpo</li><li><strong>E:</strong> interactuar y conversar</li><li><strong>T:</strong> alternar objetivos visibles</li><li><strong>F:</strong> disparar al objetivo (usa 1 púa)</li><li><strong>X:</strong> atacar al objetivo adyacente</li><li><strong>G:</strong> recoger botín ($) bajo tus pies; <strong>K:</strong> recolectar recursos naturales adyacentes; <strong>O:</strong> fabricar; <strong>Y:</strong> consultar ecosistema</li><li><strong>H:</strong> usar ampolla de curación (12 PV)</li><li><strong>B:</strong> inventario y equipamiento</li><li><strong>Q:</strong> alternar arma representada en el panel</li><li><strong>U:</strong> abrir genoma y desarrollar mutaciones; <strong>1–4:</strong> poderes aprendidos (consumen concentración, tienen recuperación)</li><li><strong>C:</strong> comerciar junto a Kala (10,36) o Ida (71,37); <strong>N:</strong> bajar de planta junto al terminal T; <strong>P:</strong> subir junto a la compuerta +</li><li><strong>L:</strong> entrar en casa comunal desde enclave central (48,32) y salir por su puerta (30,25). Residentes $ ? ! con horarios, encargos y comercio.</li><li><strong>V:</strong> mapa de nueve regiones conectadas; cruza un borde por las carreteras y examina los enclaves con E; ruinas regionales en (72,47) con N y retorno con P</li><li><strong>R:</strong> sondear bioma (4 concentración); <strong>M:</strong> atlas de regiones</li><li><strong>I:</strong> inspeccionar posición; <strong>J:</strong> diario; <strong>ESPACIO:</strong> esperar</li><li><strong>1–9:</strong> elegir respuesta o artículo; <strong>ESC:</strong> cerrar ventana</li></ul><p>Armas a distancia requieren línea de visión y munición. El combate avanza la IA enemiga. Al derrotar criaturas obtienes experiencia y botín. Los enemigos próximos pueden perseguirte, mientras los carroñeros malheridos intentan huir.</p><p>La exploración incluye seis biomas; las tormentas reducen tu campo visual. Evita las casillas ! y controla la exposición. En Faro Ciego, los turnos reducen exposición y recuperan concentración lentamente. Activa el sonido ambiental con el botón superior.</p><p class="muted">La campaña inicial sigue comenzando al hablar con Mara Venn (M), al norte de la plaza.</p>`,[{id:'close',label:'Entendido'}],'help');
}
const keymap:Record<string,Command>={arrowup:{type:'move',dx:0,dy:-1},w:{type:'move',dx:0,dy:-1},arrowdown:{type:'move',dx:0,dy:1},s:{type:'move',dx:0,dy:1},arrowleft:{type:'move',dx:-1,dy:0},a:{type:'move',dx:-1,dy:0},arrowright:{type:'move',dx:1,dy:0},d:{type:'move',dx:1,dy:0},' ':{type:'wait'},e:{type:'interact'},i:{type:'inspect'},t:{type:'target'},x:{type:'attack'},f:{type:'fire'},g:{type:'pickup'},h:{type:'heal'},q:{type:'swap'},r:{type:'scan'}};
let lastMove=0;
window.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey||e.target instanceof HTMLInputElement)return;
  const key=e.key.toLowerCase();
  if(modalMode){
    if(key==='escape'){e.preventDefault();closeModal();return;}
    if(/^[1-9]$/.test(key)){
      const options=Array.from($<HTMLElement>('#modal-options').querySelectorAll<HTMLButtonElement>('button'));
      const choice=options[Number(key)-1];if(choice){e.preventDefault();choice.click();}
    }
    return;
  }
  if(key==='c'){e.preventDefault();if(settlementCitizens(state.zone,state.tick).some(c=>c.role==='mercader'&&Math.abs(c.x-state.player.x)+Math.abs(c.y-state.player.y)<=1))regionalMarket();else market();return;}
  if(key==='l'){e.preventDefault();act({type:exteriorForInterior(state.zone)?'leave-settlement':'enter-settlement'});return;}
  if(key==='n'){e.preventDefault();act({type:'descend'});return;}
  if(key==='p'){e.preventDefault();act({type:'ascend'});return;}
  if(key==='k'){e.preventDefault();act({type:'harvest'});return;}
  if(key==='o'){e.preventDefault();crafting();return;}
  if(key==='y'){e.preventDefault();ecologyPanel();return;}
  if(key==='j'){e.preventDefault();journal();return;}
  if(key==='u'){e.preventDefault();mutations();return;}
  if(['1','2','3','4'].includes(key)){e.preventDefault();const powers:MutationId[]=['kinetic-pulse','neural-shock','pyrokinesis','phase-step'];act({type:'cast',mutation:powers[Number(key)-1]});return;}
  if(key==='b'){e.preventDefault();inventory();return;}
  if(key==='v'){e.preventDefault();regions();return;}
  if(key==='z'){e.preventDefault();$('#art-mode-btn').click();return;}
  if(key==='m'){e.preventDefault();atlas();return;}
  if(key==='?' ){e.preventDefault();help();return;}
  const command=keymap[key];if(!command)return;
  e.preventDefault();
  const now=performance.now();if(command.type==='move'&&now-lastMove<65)return;
  if(command.type==='move')lastMove=now;
  act(command);
});
for(const [id,command] of Object.entries({
  '#scan-btn':{type:'scan'},'#interact-btn':{type:'interact'},'#target-btn':{type:'target'},'#attack-btn':{type:'attack'},'#fire-btn':{type:'fire'},'#pickup-btn':{type:'pickup'},'#heal-btn':{type:'heal'},'#swap-btn':{type:'swap'},'#wait-btn':{type:'wait'}
} as Record<string,Command>))$(id).addEventListener('click',()=>act(command));
$('#atlas-btn').addEventListener('click',atlas);$('#travel-btn').addEventListener('click',regions);
$('#market-btn').addEventListener('click',()=>{if(settlementCitizens(state.zone,state.tick).some(c=>c.role==='mercader'&&Math.abs(c.x-state.player.x)+Math.abs(c.y-state.player.y)<=1))regionalMarket();else market();});
$('#house-btn').addEventListener('click',()=>act({type:exteriorForInterior(state.zone)?'leave-settlement':'enter-settlement'}));
$('#down-btn').addEventListener('click',()=>act({type:'descend'}));$('#up-btn').addEventListener('click',()=>act({type:'ascend'}));
$('#mutations-btn').addEventListener('click',mutations);$('#mutations-side-btn').addEventListener('click',mutations);
for(const [selector,mutation] of [['#pulse-btn','kinetic-pulse'],['#neural-btn','neural-shock'],['#fire-btn-gene','pyrokinesis'],['#phase-btn','phase-step']] as const)$(selector).addEventListener('click',()=>act({type:'cast',mutation}));
$('#audio-btn').addEventListener('click',async()=>{const active=await audio.toggle();write('#audio-btn',active?'♫ SILENCIAR':'♫ ACTIVAR SONIDO');$('#audio-btn').setAttribute('aria-pressed',String(active));const biome=biomeAt(state.seed,state.player.x,state.player.y);audio.update(biome,weatherAt(state.seed,state.tick,biome));});
$('#harvest-btn').addEventListener('click',()=>act({type:'harvest'}));$('#craft-btn').addEventListener('click',crafting);$('#ecology-btn').addEventListener('click',ecologyPanel);
$('#inventory-btn').addEventListener('click',inventory);$('#journal-btn').addEventListener('click',journal);$('#help-btn').addEventListener('click',help);
$('#modal-close').addEventListener('click',closeModal);
$('#modal').addEventListener('click',ev=>{if(ev.target===$('#modal'))closeModal();});
$('#art-mode-btn').addEventListener('click',()=>{
  if(renderer instanceof AsciiRenderer){
    state.log.push('GRÁFICOS // Modo pixel art disponible con WebGL.');
    draw();return;
  }
  const mode=renderer.toggleArt();
  $('#art-mode-btn').setAttribute('aria-pressed',String(mode==='pixel'));
  $('#viewport').dataset.artMode=mode;
  state.log.push(mode==='pixel'?'GRÁFICOS // Atlas pixel art original activado.':'GRÁFICOS // Vista ASCII clásica activada.');
  draw();
});
$('#zoom-in').addEventListener('click',()=>{renderer.zoom(2);draw();});$('#zoom-out').addEventListener('click',()=>{renderer.zoom(-2);draw();});
$('#save-btn').addEventListener('click',()=>{save();draw();});
$('#load-btn').addEventListener('click',()=>{
  try{const raw=localStorage.getItem(SAVE_KEY)??localStorage.getItem(V09_KEY)??localStorage.getItem(V08_KEY)??localStorage.getItem(V07_KEY)??localStorage.getItem(LAST_KEY)??localStorage.getItem(OLDER_KEY)??localStorage.getItem(OLD_KEY)??localStorage.getItem(PREVIOUS_KEY)??localStorage.getItem(LEGACY_KEY)??localStorage.getItem(FIRST_KEY);if(!raw)throw new Error('Todavía no hay ninguna partida guardada.');state=deserialize(raw);state.log.push('SISTEMA // Partida restaurada.');draw();}
  catch(err){state.log.push(`ERROR // ${err instanceof Error?err.message:'No se pudo cargar.'}`);draw();}
});
$('#new-btn').addEventListener('click',()=>{
  if(!confirm('¿Crear una nueva partida? Guarda antes si quieres conservar tu progreso.'))return;
  state=createGame((state.seed+1)>>>0);stepCount=0;draw();
});
for(const btn of Array.from(document.querySelectorAll<HTMLButtonElement>('[data-move]'))){
  btn.addEventListener('click',()=>{
    const cmds:Record<string,Command>={up:{type:'move',dx:0,dy:-1},down:{type:'move',dx:0,dy:1},left:{type:'move',dx:-1,dy:0},right:{type:'move',dx:1,dy:0}};
    act(cmds[btn.dataset.move??'up']);
  });
}
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){
    renderer.pauseAmbience();
    if(state.stats.hp>0)save(true);
  }else{
    renderer.startAmbience();
    draw();
  }
});
window.addEventListener('pagehide',()=>{if(state.stats.hp>0)save(true);});
try{
  const saved=localStorage.getItem(SAVE_KEY)??localStorage.getItem(V09_KEY)??localStorage.getItem(V08_KEY)??localStorage.getItem(V07_KEY)??localStorage.getItem(LAST_KEY)??localStorage.getItem(OLDER_KEY)??localStorage.getItem(OLD_KEY)??localStorage.getItem(PREVIOUS_KEY)??localStorage.getItem(LEGACY_KEY)??localStorage.getItem(FIRST_KEY);
  if(saved){const old=JSON.parse(saved) as {version?:number};state=deserialize(saved);
    state.log.push((old.version??0)<9?'SISTEMA // Partida anterior migrada: mundo, misión y progreso conservados.':'SISTEMA // Sesión recuperada.');
    if((old.version??0)<10)save(true);
  }
}catch{state.log.push('ADVERTENCIA // Guardado previo incompatible o dañado.');}
draw();renderer.startAmbience();renderer.focus();
// WebGL upgrade is asynchronous: controls and Canvas 2D work immediately.
// A WebGL failure never blocks input, saves or the offline release.
void import('./pixi-renderer.js').then(async ({PixiAsciiRenderer})=>{
  const candidate=await PixiAsciiRenderer.create($<HTMLDivElement>('#viewport'),renderer as AsciiRenderer);
  renderer.pauseAmbience();
  renderer=candidate;
  $('#viewport').dataset.renderer='pixi-webgl';
  $('#viewport').dataset.artMode='pixel';
  $('#art-mode-btn').setAttribute('aria-pressed','true');
  state.log.push('GRÁFICOS // Renderizado PixiJS WebGL activado.');
  draw();renderer.startAmbience();renderer.focus();
}).catch(error=>{
  $('#viewport').dataset.renderer='canvas2d';
  $('#viewport').dataset.artMode='ascii';
  $('#art-mode-btn').setAttribute('aria-pressed','false');
  state.log.push('GRÁFICOS // WebGL no disponible; motor Canvas 2D operativo.');
  console.warn('PixiJS WebGL fallback:',error);
  draw();
});
