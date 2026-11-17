import { ChapterNumber, ResonanceState, SurfaceMaterial } from './types';

class VerticeAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private oscHarmonic: OscillatorNode | null = null;
  private started = false;
  private volume = 0.85;
  private muted = false;
  private baseFreq = 55;

  public init(): void {
    if (this.started) {
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : this.volume;
    this.masterGain.connect(this.ctx.destination);

    // Ambient existential drone
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.value = 180;
    this.droneFilter.Q.value = 1.4;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.13;

    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sine';
    this.osc1.frequency.value = this.baseFreq;

    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'triangle';
    this.osc2.frequency.value = this.baseFreq * 1.498; // fifth

    this.oscHarmonic = this.ctx.createOscillator();
    this.oscHarmonic.type = 'sine';
    this.oscHarmonic.frequency.value = this.baseFreq * 3.0;

    const harmGain = this.ctx.createGain();
    harmGain.gain.value = 0.16;

    this.osc1.connect(this.droneFilter);
    this.osc2.connect(this.droneFilter);
    this.oscHarmonic.connect(harmGain);
    harmGain.connect(this.droneFilter);

    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.osc1.start();
    this.osc2.start();
    this.oscHarmonic.start();
    this.started = true;
  }

  public setSettings(volume: number, muted: boolean): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public setChapterMood(chapter: ChapterNumber): void {
    const roots: Record<ChapterNumber, number> = {
      1: 55.0,   // A1
      2: 51.91,  // G#1
      3: 49.0,   // G1
      4: 46.25,  // F#1
      5: 58.27,  // Bb1
      6: 65.41,  // C2 luminous fifth
    };
    this.baseFreq = roots[chapter] || 55.0;
    if (!this.ctx || !this.osc1 || !this.osc2) return;
    const now = this.ctx.currentTime;
    this.osc1.frequency.setTargetAtTime(this.baseFreq, now, 0.45);
    this.osc2.frequency.setTargetAtTime(this.baseFreq * 1.498, now, 0.45);
  }

  public setResonanceMood(state: ResonanceState): void {
    if (!this.ctx || !this.droneFilter || !this.oscHarmonic) return;
    const now = this.ctx.currentTime;
    if (state === 'PRESENTE') {
      this.droneFilter.frequency.setTargetAtTime(175, now, 0.25);
      this.oscHarmonic.frequency.setTargetAtTime(this.baseFreq * 3.0, now, 0.25);
    } else if (state === 'ECO') {
      this.droneFilter.frequency.setTargetAtTime(360, now, 0.22);
      this.oscHarmonic.frequency.setTargetAtTime(this.baseFreq * 4.0, now, 0.22);
    } else {
      this.droneFilter.frequency.setTargetAtTime(490, now, 0.15);
      this.oscHarmonic.frequency.setTargetAtTime(this.baseFreq * 2.828, now, 0.15);
    }
  }

  public playStateShift(state: ResonanceState): void {
    this.init();
    this.setResonanceMood(state);
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;

    if (state === 'ECO') {
      this.tone(440, 'sine', 0.12, 0.45, now, 440, 0);
      this.tone(659.25, 'sine', 0.08, 0.55, now + 0.04, 659.25, 0);
    } else if (state === 'RUPTURA') {
      this.tone(140, 'sawtooth', 0.13, 0.42, now, 68, 0);
      this.tone(277.18, 'triangle', 0.08, 0.35, now + 0.02, 196, 0);
    } else {
      this.tone(246.94, 'sine', 0.08, 0.25, now, 164.81, 0);
    }
  }

  public playResonanceReject(): void {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    this.tone(155, 'triangle', 0.1, 0.16, now, 118, 0);
    this.tone(146, 'sine', 0.07, 0.18, now + 0.06, 110, 0);
  }

  public playJump(): void {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    this.tone(110, 'sine', 0.08, 0.14, now, 230, 0);
  }

  public playLand(heavy = false, material?: SurfaceMaterial): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    if (material === 'wet') {
      this.playWaterSplash(heavy ? 1.15 : 0.65);
    } else if (material === 'metal') {
      this.tone(heavy ? 120 : 145, 'triangle', heavy ? 0.14 : 0.08, 0.16, now, 58, 0);
    } else {
      this.tone(heavy ? 75 : 95, 'triangle', heavy ? 0.16 : 0.09, 0.13, now, 42, 0);
    }
  }

  public playStep(material?: SurfaceMaterial, crouching = false): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const gainScale = crouching ? 0.45 : 1.0;
    if (material === 'wet') {
      this.tone(220 + Math.random() * 60, 'sine', 0.032 * gainScale, 0.06, now, 120, 0);
    } else if (material === 'metal') {
      this.tone(165 + Math.random() * 24, 'triangle', 0.038 * gainScale, 0.065, now, 95, 0);
    } else {
      this.tone(82 + Math.random() * 14, 'sine', 0.035 * gainScale, 0.05, now, 55, 0);
    }
  }

  public playWaterSplash(intensity = 0.7): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const dur = 0.16 * intensity;
    const bufferSize = Math.max(256, Math.floor(this.ctx.sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(680, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + dur);
    filter.Q.value = 1.6;

    const gain = this.ctx.createGain();
    gain.gain.value = Math.min(0.16, 0.08 * intensity);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
  }

  public playCreatureCue(kind: 'alert' | 'calm' | 'pulse', pan = 0): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const clampedPan = Math.max(-0.85, Math.min(0.85, pan));
    if (kind === 'alert') {
      this.tone(185, 'sawtooth', 0.075, 0.28, now, 92, clampedPan);
      this.tone(262, 'triangle', 0.055, 0.24, now + 0.04, 148, clampedPan);
    } else if (kind === 'calm') {
      this.tone(330, 'sine', 0.06, 0.42, now, 440, clampedPan);
    } else {
      this.tone(128, 'sine', 0.045, 0.22, now, 96, clampedPan);
    }
  }

  public playDeathRecover(): void {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    this.tone(160, 'sawtooth', 0.11, 0.42, now, 54, 0);
    this.tone(220, 'sine', 0.09, 0.55, now + 0.35, 329.63, 0);
  }

  public playInteract(kind: 'unlock' | 'anchor' | 'checkpoint' | 'threshold' | 'memory'): void {
    this.init();
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    if (kind === 'checkpoint') {
      this.tone(329.63, 'sine', 0.11, 0.5, now, 329.63, 0);
      this.tone(493.88, 'sine', 0.08, 0.65, now + 0.07, 493.88, 0);
    } else if (kind === 'memory') {
      this.tone(392.0, 'sine', 0.09, 0.65, now, 392.0, 0);
      this.tone(587.33, 'sine', 0.07, 0.85, now + 0.09, 587.33, 0);
    } else if (kind === 'anchor') {
      this.tone(293.66, 'triangle', 0.12, 0.45, now, 293.66, 0);
      this.tone(440.0, 'sine', 0.11, 0.55, now + 0.06, 440.0, 0);
    } else if (kind === 'unlock') {
      this.tone(220, 'sine', 0.13, 0.7, now, 220, 0);
      this.tone(329.63, 'sine', 0.12, 0.75, now + 0.08, 329.63, 0);
      this.tone(523.25, 'sine', 0.1, 0.9, now + 0.16, 523.25, 0);
    } else {
      this.tone(110, 'sine', 0.14, 1.4, now, 110, 0);
      this.tone(220, 'sine', 0.12, 1.5, now + 0.12, 220, 0);
      this.tone(329.63, 'sine', 0.11, 1.6, now + 0.24, 329.63, 0);
      this.tone(659.25, 'sine', 0.09, 1.8, now + 0.36, 659.25, 0);
    }
  }

  private tone(
    startFreq: number,
    type: OscillatorType,
    peakGain: number,
    duration: number,
    startTime: number,
    endFreq: number,
    pan = 0
  ): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, startTime);
    if (endFreq !== startFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), startTime + duration);
    }
    g.gain.setValueAtTime(0.0001, startTime);
    g.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(g);
    if (typeof this.ctx.createStereoPanner === 'function' && Math.abs(pan) > 0.02) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(pan, startTime);
      g.connect(panner);
      panner.connect(this.masterGain);
    } else {
      g.connect(this.masterGain);
    }
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }
}

export const audioEngine = new VerticeAudioEngine();
