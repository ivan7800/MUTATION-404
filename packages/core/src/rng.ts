/** Mulberry32-like RNG with explicit serializable state. Never use Math.random in simulation. */
export class SeededRng {
  private value: number;
  constructor(seed: number) { this.value = seed >>> 0; }
  next(): number {
    this.value = (this.value + 0x6D2B79F5) >>> 0;
    let t = this.value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(min: number, max: number): number {
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) throw new RangeError('Invalid RNG interval');
    return min + Math.floor(this.next() * (max - min + 1));
  }
  get state(): number { return this.value; }
  restore(state: number): void { if (!Number.isInteger(state)) throw new Error('Invalid RNG state'); this.value = state >>> 0; }
}
