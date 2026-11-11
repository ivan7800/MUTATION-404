import type {BiomeId,WeatherId} from '../../../packages/core/src/biomes.js';

/** Opt-in WebAudio ambience with audible harmonic layers, controlled volume and test tone.
 * No downloads, auto-play or unsafe cross-origin audio. */
export class AtmosphereAudio {
  private context:AudioContext|null=null;
  private master:GainNode|null=null;
  private ambience:GainNode|null=null;
  private voices:OscillatorNode[]=[];
  private enabled=false;
  private volume=.55;
  get active():boolean{return this.enabled&&this.context?.state==='running';}
  get level():number{return this.volume;}
  setVolume(level:number):void{
    this.volume=Math.min(1,Math.max(0,Number.isFinite(level)?level:.55));
    if(this.master&&this.context)this.master.gain.setTargetAtTime(this.volume,this.context.currentTime,.06);
  }
  private prepare():AudioContext{
    if(this.context)return this.context;
    const c=new AudioContext();
    const master=c.createGain();master.gain.value=this.volume;master.connect(c.destination);
    const ambience=c.createGain();ambience.gain.value=0;ambience.connect(master);
    this.context=c;this.master=master;this.ambience=ambience;
    // An audible harmonic bed: several octaves, all low-pass filtered.
    const frequencies=[72,108,144];
    frequencies.forEach((hz,i)=>{
      const osc=c.createOscillator();
      osc.type=i===1?'triangle':'sine';osc.frequency.value=hz;
      const voice=c.createGain();voice.gain.value=[.13,.055,.025][i];
      const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=370;
      osc.connect(filter);filter.connect(voice);voice.connect(ambience);
      osc.start();this.voices.push(osc);
    });
    return c;
  }
  async toggle():Promise<boolean>{
    if(this.enabled){this.enabled=false;this.ambience?.gain.setTargetAtTime(0,this.context!.currentTime,.1);return false;}
    try{
      const c=this.prepare();
      await c.resume();
      if(c.state!=='running')return false;
      this.enabled=true;
      this.ambience?.gain.setTargetAtTime(.3,c.currentTime,.2);
      this.testTone();
      return true;
    }catch(error){console.warn('Audio no disponible:',error);return false;}
  }
  /** Audible diagnostic tone under user gesture. Never sounds when muted. */
  testTone():void{
    if(!this.enabled||!this.context||!this.master)return;
    const c=this.context,t=c.currentTime,osc=c.createOscillator(),gain=c.createGain();
    osc.type='triangle';osc.frequency.setValueAtTime(440,t);
    osc.frequency.linearRampToValueAtTime(660,t+.2);
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(.2,t+.025);
    gain.gain.exponentialRampToValueAtTime(.0001,t+.34);
    osc.connect(gain);gain.connect(this.master);osc.start(t);osc.stop(t+.36);
  }
  private beep(start:number,end:number,duration:number,wave:OscillatorType,level:number):void{
    if(!this.enabled||!this.context||!this.master)return;
    const c=this.context,now=c.currentTime,osc=c.createOscillator(),gain=c.createGain();
    osc.type=wave;
    osc.frequency.setValueAtTime(Math.max(30,start),now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30,end),now+duration);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(level,now+.015);
    gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    osc.connect(gain);gain.connect(this.master);
    osc.start(now);osc.stop(now+duration+.02);
  }
  cue(kind:'attack'|'mutation'|'scan'|'damage'):void{
    const voices={attack:[210,80,.17,'sawtooth',.12],mutation:[510,220,.23,'triangle',.10],scan:[700,320,.3,'sine',.11],damage:[150,55,.29,'sawtooth',.14]} as const;
    const [a,b,d,w,v]=voices[kind];this.beep(a,b,d,w,v);
  }
  /** Original non-autoplay boss stingers, respecting mute and master volume. */
  bossCue(event:'awaken'|'phase2'|'phase3'|'defeat'):void{
    if(!this.enabled||!this.context||!this.master)return;
    const voices={
      awaken:[88,176,.45,'sawtooth',.11],
      phase2:[190,62,.55,'triangle',.15],
      phase3:[370,49,.68,'sawtooth',.15],
      defeat:[250,38,1.05,'sine',.17]
    } as const;
    const [start,end,duration,wave,level]=voices[event];
    this.beep(start,end,duration,wave,level);
  }
  mutationCue(id:'kinetic-pulse'|'neural-shock'|'pyrokinesis'|'phase-step'):void{
    const voices={'kinetic-pulse':[140,46,.32,'sawtooth',.16],'neural-shock':[840,170,.25,'square',.09],pyrokinesis:[370,75,.34,'triangle',.14],'phase-step':[90,560,.36,'sine',.14]} as const;
    const [a,b,d,w,v]=voices[id];this.beep(a,b,d,w,v);
  }
  update(biome:BiomeId,weather:WeatherId):void{
    if(!this.context||this.voices.length!==3)return;
    const pitches:Record<BiomeId,number>={salinas:78,ceniza:61,hierro:93,vidrio:123,medula:70,umbral:52};
    const hz=pitches[biome]+(weather==='calma'?0:5),now=this.context.currentTime;
    this.voices.forEach((osc,i)=>osc.frequency.setTargetAtTime(hz*[1,1.5,2][i],now,1.2));
  }
}
