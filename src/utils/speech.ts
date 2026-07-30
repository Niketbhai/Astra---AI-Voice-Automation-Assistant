// Web Speech API wrapper and Web Audio Chime fallback for Astra Voice Assistant

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  voiceName?: string;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

// Web Audio Chime Synthesizer for immediate audio feedback
export class AudioChime {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playChime(type: 'wake' | 'complete' | 'error'): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'wake') {
        // High double-beep for Astra wake
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'complete') {
        // Success completion chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        // Soft error tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(220, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      // Ignore audio context autoplay restriction
    }
  }
}

export const chime = new AudioChime();

export class TextToSpeech {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    try {
      return this.synth.getVoices() || [];
    } catch {
      return [];
    }
  }

  public speak(text: string, options: SpeechOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        options.onEnd?.();
        resolve();
        return;
      }

      try {
        if (this.synth.speaking || this.synth.pending) {
          this.synth.cancel();
        }
      } catch (e) {
        // ignore
      }

      // Small delay to allow synthesis cancel to clear cleanly
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = options.rate ?? 1.0;
          utterance.pitch = options.pitch ?? 1.0;

          const voices = this.getVoices();
          if (options.voiceName) {
            const found = voices.find(v => v.name === options.voiceName || v.name.includes(options.voiceName!));
            if (found) utterance.voice = found;
          } else {
            const preferred = voices.find(
              v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Alex'))
            ) || voices.find(v => v.lang.startsWith('en'));
            if (preferred) utterance.voice = preferred;
          }

          utterance.onend = () => {
            options.onEnd?.();
            resolve();
          };

          utterance.onerror = (e: any) => {
            // Interrupted or canceled events are normal when user triggers new speech
            const errType = e?.error || e;
            if (errType !== 'interrupted' && errType !== 'canceled') {
              console.warn("Speech synthesis notice:", errType);
            }
            options.onError?.(e);
            resolve();
          };

          this.synth!.speak(utterance);
        } catch (e) {
          console.warn("Speech synthesis unavailable:", e);
          options.onEnd?.();
          resolve();
        }
      }, 50);
    });
  }

  public stop(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // ignore
      }
    }
  }
}

// Speech Recognition Wrapper
export class VoiceListener {
  private recognition: any = null;
  public isSupported: boolean = false;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isSupported = true;
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-US';
        } catch (e) {
          console.warn("Speech recognition instantiation error:", e);
        }
      }
    }
  }

  public start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (err: any) => void,
    onEnd?: () => void
  ) {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const currentText = final || interim;
      if (currentText.trim()) {
        onResult(currentText.trim(), !!final);
      }
    };

    this.recognition.onerror = (event: any) => {
      const errType = event?.error;
      if (errType !== 'no-speech' && errType !== 'aborted') {
        console.warn("Voice recognition notice:", errType);
        onError?.(errType);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd?.();
    };

    try {
      this.isListening = true;
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition start notice:", e);
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
  }
}

export const tts = new TextToSpeech();

