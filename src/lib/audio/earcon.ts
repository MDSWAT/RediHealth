/**
 * RediHealth Web Audio Earcon Synthesizer
 * Synthesizes subtle, accessible, zero-asset auditory feedback (Web Audio API oscillator).
 * Used for sound toggle start/stop actions and audio player state changes.
 */

export type EarconType = "start" | "stop" | "error" | "click";

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtx) return null;

    if (!sharedAudioContext || sharedAudioContext.state === "closed") {
      sharedAudioContext = new AudioCtx();
    }

    if (sharedAudioContext.state === "suspended") {
      sharedAudioContext.resume().catch(() => {
        // Ignored if browser blocks resume outside user gesture
      });
    }

    return sharedAudioContext;
  } catch {
    return null;
  }
}

/**
 * Play a synthesized earcon chime without downloading any external audio files.
 * Safe to call in any environment (SSR, browsers without Web Audio, or locked contexts).
 */
export function playEarcon(type: EarconType = "click"): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    switch (type) {
      case "start": {
        // Ascending medical chime: D5 (587.33Hz) -> A5 (880.00Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.18);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.23);
        break;
      }

      case "stop": {
        // Soft descending tone: A5 (880.00Hz) -> D5 (587.33Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(880.0, now);
        osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.14);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.17);
        break;
      }

      case "error": {
        // Gentle low double-pulse: E4 (329.63Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();

        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(329.63, now);

        gain1.gain.setValueAtTime(0.0001, now);
        gain1.gain.linearRampToValueAtTime(0.1, now + 0.01);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.09);

        // Second pulse 100ms later
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();

        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(329.63, now + 0.1);

        gain2.gain.setValueAtTime(0.0001, now + 0.1);
        gain2.gain.linearRampToValueAtTime(0.1, now + 0.11);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.start(now + 0.1);
        osc2.stop(now + 0.19);
        break;
      }

      case "click":
      default: {
        // Subtle neutral feedback click: 650Hz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(650.0, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
    }
  } catch {
    // Graceful degradation: never crash or interfere if audio hardware is occupied
  }
}
