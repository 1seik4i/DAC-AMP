/**
 * Interactive DAC Studio Synthesizer & Web Audio Simulator
 * Safe, lazy-initialized, and strictly runs on client-side user actions.
 */
class DacAudioEngine {
  private ctx: AudioContext | null = null;
  private primaryGain: GainNode | null = null;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private currentVolume: number = 80; // 80% default

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();
    
    this.primaryGain = this.ctx.createGain();
    this.setVolume(this.currentVolume);
    this.primaryGain.connect(this.ctx.destination);
  }

  public setVolume(percent: number) {
    this.currentVolume = percent;
    if (!this.primaryGain) return;
    // Map 0-100% to -64 to 0 dB, then to linear gain
    const db = -64 + (percent / 100) * 64;
    const linearGain = Math.pow(10, db / 20);
    this.primaryGain.gain.setValueAtTime(linearGain, this.ctx?.currentTime || 0);
  }

  public playTest(category: string, eqGains: number[]) {
    try {
      this.init();
      if (!this.ctx || !this.primaryGain) return;

      // Ensure audio context is carrying on
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      // Stop previous sounds
      this.stopAll();

      // We'll create a nice complex ambient additive synthesizer sound 
      // tuned by the EQ gains so it *truly* sounds different based on the EQ profile!
      const time = this.ctx.currentTime;
      const baseFreqs = [110, 220, 330, 440, 550, 660, 880, 1200, 2500, 5000];
      
      // Calculate multiplier based on EQ gains
      // eqGains maps to [32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz]
      baseFreqs.forEach((freq, idx) => {
        if (!this.ctx || !this.primaryGain) return;
        
        const gainValue = eqGains[idx] !== undefined ? eqGains[idx] : 0;
        // Map EQ gain -12 to +12 dB to a scaling multiplier [0.05 to 1.5]
        const scalingFactor = Math.pow(10, gainValue / 20) * 0.15;

        // Build additive oscillators
        const osc = this.ctx.createOscillator();
        const oGain = this.ctx.createGain();

        // Waveform selection based on theme
        if (category.toLowerCase().includes('bass')) {
          osc.type = 'triangle';
        } else if (category.toLowerCase().includes('vocal')) {
          osc.type = 'sine';
        } else if (category.toLowerCase().includes('gaming')) {
          osc.type = idx % 2 === 0 ? 'sine' : 'sawtooth';
        } else {
          osc.type = 'sine';
        }

        osc.frequency.setValueAtTime(freq, time);
        
        // Slightly detune to make it rich/wide
        osc.detune.setValueAtTime((Math.random() - 0.5) * 15, time);

        // Amplitude swell with attack, decay, release
        oGain.gain.setValueAtTime(0, time);
        oGain.gain.linearRampToValueAtTime(scalingFactor * 0.3, time + 0.15);
        oGain.gain.exponentialRampToValueAtTime(scalingFactor * 0.15, time + 0.6);
        oGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.8);

        // Connect
        osc.connect(oGain);
        oGain.connect(this.primaryGain);

        osc.start(time);
        osc.stop(time + 2.0);

        this.activeOscillators.push({ osc, gain: oGain });
      });

      // Also create a subtle audio filter sweep sweep to signify Hi-Fi tuning
      const sweepOsc = this.ctx.createOscillator();
      const sweepFilter = this.ctx.createBiquadFilter();
      const sweepGain = this.ctx.createGain();

      sweepOsc.type = 'sine';
      sweepOsc.frequency.setValueAtTime(55, time);
      sweepOsc.frequency.exponentialRampToValueAtTime(880, time + 1.2);

      sweepFilter.type = 'lowpass';
      sweepFilter.Q.setValueAtTime(8, time);
      sweepFilter.frequency.setValueAtTime(200, time);
      sweepFilter.frequency.exponentialRampToValueAtTime(5000, time + 1.0);

      sweepGain.gain.setValueAtTime(0, time);
      sweepGain.gain.linearRampToValueAtTime(0.12, time + 0.2);
      sweepGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.5);

      sweepOsc.connect(sweepFilter);
      sweepFilter.connect(sweepGain);
      sweepGain.connect(this.primaryGain);

      sweepOsc.start(time);
      sweepOsc.stop(time + 1.6);

    } catch (e) {
      console.warn("Web Audio engine initialization failed:", e);
    }
  }

  public stopAll() {
    this.activeOscillators.forEach(item => {
      try {
        item.osc.stop();
      } catch (err) {}
    });
    this.activeOscillators = [];
  }
}

export const audioEngine = new DacAudioEngine();
