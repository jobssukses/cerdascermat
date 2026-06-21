let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!audioCtx && typeof window !== 'undefined') {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.12) {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch { /* silent */ }
}

export const sfx = {
  correct() { tone(523, 0.1); setTimeout(() => tone(659, 0.1), 100); setTimeout(() => tone(784, 0.2), 200); },
  wrong() { tone(200, 0.3, 'sawtooth', 0.07); },
  tick() { tone(800, 0.05, 'sine', 0.04); },
  start() { tone(440, 0.12); setTimeout(() => tone(554, 0.12), 120); setTimeout(() => tone(659, 0.25, 'sine', 0.14), 240); },
  finish() { [523,494,440,523,659,784].forEach((f, i) => setTimeout(() => tone(f, 0.2 + i * 0.05, 'sine', 0.1 + i * 0.01), i * 180)); },
  combo(n: number) { const b = 400 + n * 50; tone(b, 0.08); setTimeout(() => tone(b * 1.25, 0.08), 70); setTimeout(() => tone(b * 1.5, 0.12, 'sine', 0.14), 140); },
  click() { tone(600, 0.04, 'sine', 0.06); },
  countdown() { tone(600, 0.08, 'sine', 0.07); },
};
