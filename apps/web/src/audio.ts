import type { BiomeId, WeatherId } from '../../../packages/core/src/biomes.js';
/** No external audio files; browser audio starts only after user clicks the sound button. */
export class AtmosphereAudio {
  private context:AudioContext|null=null;
  private oscillator:OscillatorNode|null=null;
  private overtone:OscillatorNode|null=null;
  private gain:GainNode|null=null;
  private enabled=false;
  get active():boolean{return this.enabled;}
  async toggle():Promise<boolean>{
    if(this.enabled){this.enabled=false;if(this.gain&&this.context)this.gain.gain.setTargetAtTime(0,this.context.currentTime,.12);return false;}
    if(!this.context){
      const context=new AudioContext();this.context=context;
      const gain=context.createGain();gain.gain.value=0;gain.connect(context.destination);this.gain=gain;
      const oscillator=context.createOscillator();oscillator.type='sine';oscillator.frequency.value=65;oscillator.connect(gain);oscillator.start();this.oscillator=oscillator;
      const overtone=context.createOscillator();overtone.type='triangle';overtone.frequency.value=90;
      const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=220;
      const quieter=context.createGain();quieter.gain.value=.12;overtone.connect(filter);filter.connect(quieter);quieter.connect(gain);overtone.start();this.overtone=overtone;
    }
    try{await this.context.resume();}catch{return false;}
    this.enabled=true;this.gain?.gain.setTargetAtTime(.04,this.context.currentTime,.3);return true;
  }
  /** Subtle synthesized cues; opt-in through existing audio toggle. */
  cue(kind:'attack'|'mutation'|'scan'|'damage'):void{
    if(!this.enabled||!this.context)return;
    const context=this.context,now=context.currentTime;
    const osc=context.createOscillator(),env=context.createGain();
    const freq={attack:180,mutation:510,scan:650,damage:100}[kind];
    osc.type=kind==='mutation'?'triangle':'sine';
    osc.frequency.setValueAtTime(freq,now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(45,freq*.56),now+.16);
    env.gain.setValueAtTime(.0001,now);
    env.gain.exponentialRampToValueAtTime(.035,now+.015);
    env.gain.exponentialRampToValueAtTime(.0001,now+.18);
    osc.connect(env);env.connect(context.destination);
    osc.start(now);osc.stop(now+.19);
  }
  /** Distinct procedural tones per mutation; sound remains strictly opt-in. */
  mutationCue(id:'kinetic-pulse'|'neural-shock'|'pyrokinesis'|'phase-step'):void{
    if(!this.enabled||!this.context)return;
    const now=this.context.currentTime;
    const voices={
      'kinetic-pulse':{start:130,end:54,wave:'sawtooth',length:.24},
      'neural-shock':{start:770,end:210,wave:'square',length:.19},
      'pyrokinesis':{start:330,end:92,wave:'triangle',length:.31},
      'phase-step':{start:95,end:510,wave:'sine',length:.28}
    } as const;
    const voice=voices[id],osc=this.context.createOscillator(),env=this.context.createGain();
    osc.type=voice.wave;
    osc.frequency.setValueAtTime(voice.start,now);
    osc.frequency.exponentialRampToValueAtTime(voice.end,now+voice.length);
    env.gain.setValueAtTime(.0001,now);
    env.gain.exponentialRampToValueAtTime(.027,now+.018);
    env.gain.exponentialRampToValueAtTime(.0001,now+voice.length);
    osc.connect(env);env.connect(this.context.destination);
    osc.start(now);osc.stop(now+voice.length+.01);
  }
  update(biome:BiomeId,weather:WeatherId):void{
    if(!this.context||!this.oscillator||!this.overtone)return;
    const pitch:Record<BiomeId,number>={salinas:68,ceniza:53,hierro:82,vidrio:111,medula:61,umbral:43};
    const frequency=pitch[biome]+(weather==='calma'?0:3);
    this.oscillator.frequency.setTargetAtTime(frequency,this.context.currentTime,1);
    this.overtone.frequency.setTargetAtTime(frequency*1.51,this.context.currentTime,1.1);
  }
}
