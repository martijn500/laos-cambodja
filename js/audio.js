import { restartAnimationClass } from "./utils/dom.js";

export let soundEnabled = true;

// Browsers only allow audio after a user gesture: create the context on the
// first beep (always triggered by a click or key press), not at page load.
let audioCtx = null;

function audioContext() {
  audioCtx ??= new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

export function playBeep(freq = 440, type = "sine", duration = 0.1) {
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

export function toggleAudio() {
  soundEnabled = !soundEnabled;
  const btn = document.querySelector(".sound-btn");
  btn.textContent = soundEnabled ? "SFX: ON 🔊" : "SFX: OFF 🔇";
  btn.setAttribute("aria-pressed", String(soundEnabled));
  restartAnimationClass(btn, "is-toggled");
  if (soundEnabled) playBeep(880, "square", 0.15);
}
