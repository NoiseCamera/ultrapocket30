
class SoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  private playTone(freq: number, duration: number, type: string = 'square', volume: number = 0.1, decay: boolean = true) {
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type as OscillatorType;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    if (decay) {
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    } else {
      setTimeout(() => {
        if (this.ctx) gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      }, (duration - 0.05) * 1000);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playMelody(notes: {f: number, d: number, t?: string}[], tempoMultiplier: number = 1.0) {
    let elapsed = 0;
    notes.forEach(note => {
      setTimeout(() => {
        this.playTone(note.f, note.d, note.t || 'square', 0.08);
      }, elapsed * 1000);
      elapsed += note.d * tempoMultiplier;
    });
  }

  playSelect() { this.playTone(1046, 0.08, 'square', 0.1); }
  playMove() { this.playTone(659, 0.04, 'square', 0.08); }
  playBack() { this.playTone(440, 0.15, 'sine', 0.1); }
  playStart() { this.playMelody([{f: 523, d: 0.1}, {f: 659, d: 0.1}, {f: 783, d: 0.1}, {f: 1046, d: 0.2}]); }

  playEat() { 
    for(let i=0; i<3; i++) {
      setTimeout(() => this.playTone(150 + Math.random()*50, 0.1, 'triangle', 0.2), i * 200);
      setTimeout(() => this.playTone(400 + Math.random()*100, 0.05, 'square', 0.05), i * 200 + 100);
    }
  }
  
  playClean() {
    for(let i=0; i<4; i++) {
      setTimeout(() => this.playTone(2000, 0.05, 'sine', 0.05), i * 150);
      setTimeout(() => this.playTone(1000, 0.05, 'sine', 0.05), i * 150 + 70);
    }
  }

  playHeal() {
    this.playMelody([
      {f: 523, d: 0.1, t: 'sine'}, {f: 659, d: 0.1, t: 'sine'}, 
      {f: 783, d: 0.1, t: 'sine'}, {f: 1046, d: 0.3, t: 'sine'}
    ], 0.8);
  }

  playPoop() { this.playTone(110, 0.3, 'sawtooth', 0.1); }
  
  playDiscovery() {
    this.playMelody([
      {f: 880, d: 0.1, t: 'sine'}, {f: 1174, d: 0.1, t: 'sine'}, {f: 1318, d: 0.2, t: 'sine'}
    ]);
  }

  playEvolutionReady() {
    this.playTone(60, 0.1, 'sine', 0.3);
    setTimeout(() => this.playTone(50, 0.15, 'sine', 0.3), 150);
  }

  playEvolution() {
    const notes = [];
    for(let i=0; i<12; i++) {
      notes.push({f: 220 * Math.pow(1.059, i*2), d: 0.05});
    }
    notes.push({f: 880, d: 0.4});
    this.playMelody(notes, 0.7);
  }

  playDead() {
    this.playMelody([
      {f: 440, d: 0.2}, {f: 415, d: 0.2}, {f: 392, d: 0.2}, 
      {f: 349, d: 0.3}, {f: 311, d: 0.3}, {f: 293, d: 0.6}
    ]);
  }

  playCatch() { this.playTone(1318, 0.05, 'square', 0.1); }
  playMiss() { this.playTone(220, 0.2, 'sawtooth', 0.15); }
  playTimerLow() { this.playTone(880, 0.05, 'sine', 0.1); }
  
  playWin() {
    this.playMelody([
      {f: 523, d: 0.1}, {f: 523, d: 0.1}, {f: 523, d: 0.1}, 
      {f: 523, d: 0.3}, {f: 415, d: 0.3}, {f: 466, d: 0.3}, {f: 523, d: 0.5}
    ]);
  }

  playJanken() { this.playTone(880, 0.05, 'square', 0.1); }
  playHoi() { this.playTone(1760, 0.1, 'sine', 0.2); }
  
  playAlert() {
    this.playMelody([{f: 880, d: 0.1, t:'sawtooth'}, {f: 440, d: 0.1, t:'sawtooth'}], 1.5);
  }

  playCall() {
    // 育成ゲーム特有の「ピピッ、ピピッ」という呼び出し音
    this.playMelody([
      {f: 2093, d: 0.1}, {f: 2093, d: 0.1},
      {f: 0, d: 0.1},
      {f: 2093, d: 0.1}, {f: 2093, d: 0.1}
    ], 1.0);
  }

  playFootstep() {
    this.playTone(100, 0.03, 'sine', 0.05);
  }
}

export const sound = new SoundEngine();
