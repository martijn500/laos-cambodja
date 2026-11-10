import { requireElement, restartAnimationClass } from "./utils/dom.ts";

export let soundEnabled = true;

// Browsers only allow audio after a user gesture: create the context on the
// first beep (always triggered by a click or key press), not at page load.
let audioCtx: AudioContext | null = null;

function audioContext(): AudioContext {
  audioCtx ??= new AudioContext();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

export function playBeep(
  freq = 440,
  type: OscillatorType = "sine",
  duration = 0.1,
): void {
  if (!soundEnabled) return;
  try {
    const audioCtx = audioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + duration,
    );
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // No audio available: the app works fine silently
  }
}

export function toggleAudio(): void {
  soundEnabled = !soundEnabled;
  const btn = requireElement(".sound-btn");
  btn.textContent = soundEnabled ? "SFX: ON 🔊" : "SFX: OFF 🔇";
  btn.setAttribute("aria-pressed", String(soundEnabled));
  restartAnimationClass(btn, "is-toggled");
  if (soundEnabled) playBeep(880, "square", 0.15);
}
