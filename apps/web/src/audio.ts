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
  update(biome:BiomeId,weather:WeatherId):void{
    if(!this.context||!this.oscillator||!this.overtone)return;
    const pitch:Record<BiomeId,number>={salinas:68,ceniza:53,hierro:82,vidrio:111,medula:61,umbral:43};
    const frequency=pitch[biome]+(weather==='calma'?0:3);
    this.oscillator.frequency.setTargetAtTime(frequency,this.context.currentTime,1);
    this.overtone.frequency.setTargetAtTime(frequency*1.51,this.context.currentTime,1.1);
  }
}
