export const SOUND_STORAGE_KEY = "scoreboard-sound-on";

export type SfxName = "click" | "select" | "reward" | "deduct" | "toggle";

/** UI 合成音效总音量（相对各音色 gain），约 3 倍于原先默认。 */
const MASTER_VOLUME = 3;

type WindowWithAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
  __scoreBoardAudio?: AudioContext;
};

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as WindowWithAudio;
  const Ctor = window.AudioContext || w.webkitAudioContext;
  if (!Ctor) return null;
  if (!w.__scoreBoardAudio) {
    w.__scoreBoardAudio = new Ctor();
  }
  return w.__scoreBoardAudio;
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SOUND_STORAGE_KEY) === "1";
}

export function setSoundEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOUND_STORAGE_KEY, on ? "1" : "0");
  window.dispatchEvent(new CustomEvent("scoreboard-sound-change", { detail: on }));
}

function tone(
  ctx: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType,
  gain: number,
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  const peak = Math.min(gain * MASTER_VOLUME, 0.85);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

export function playSfx(name: SfxName): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  void ctx.resume();
  const t = ctx.currentTime;

  if (name === "click" || name === "toggle") {
    tone(ctx, 720, t, 0.08, "triangle", 0.08);
    return;
  }
  if (name === "select") {
    tone(ctx, 620, t, 0.07, "sine", 0.07);
    tone(ctx, 880, t + 0.05, 0.08, "sine", 0.06);
    return;
  }
  if (name === "reward") {
    tone(ctx, 523, t, 0.12, "triangle", 0.1);
    tone(ctx, 659, t + 0.1, 0.12, "triangle", 0.1);
    tone(ctx, 784, t + 0.2, 0.16, "triangle", 0.12);
    return;
  }
  tone(ctx, 392, t, 0.12, "sine", 0.08);
  tone(ctx, 330, t + 0.1, 0.16, "sine", 0.07);
}
