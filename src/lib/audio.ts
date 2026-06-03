// Web Audio API synthesized stadium engine — §6 del brief
// Sin assets externos. Rugido = noise filtrado; thud = tap; horn = sawtooth duo.

let ctx: AudioContext | null = null;
let roarNode: AudioBufferSourceNode | null = null;
let roarGain: GainNode | null = null;
let masterGain: GainNode | null = null;

function ensureCtx(): AudioContext {
  if (!ctx) {
    const W = window as unknown as { webkitAudioContext?: typeof AudioContext };
    const Ctor = window.AudioContext ?? W.webkitAudioContext;
    if (!Ctor) throw new Error("Web Audio API no soportada");
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

function noiseBuffer(c: AudioContext, seconds = 2): AudioBuffer {
  const len = c.sampleRate * seconds;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

export function unlockAudio(): void {
  // Debe llamarse desde un gesto del usuario
  const c = ensureCtx();
  if (c.state === "suspended") void c.resume();
}

export function startStadiumRoar(): void {
  const c = ensureCtx();
  if (!masterGain) return;
  stopStadiumRoar();
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 4);
  src.loop = true;
  // Filtro pasa-bajos + un poco de bandpass para que suene tribuna
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1100;
  lp.Q.value = 0.6;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 400;
  bp.Q.value = 0.8;
  const g = c.createGain();
  g.gain.value = 0;
  src.connect(lp);
  lp.connect(bp);
  bp.connect(g);
  g.connect(masterGain);
  src.start();
  roarNode = src;
  roarGain = g;
}

export function setRoarLevel(hype01: number): void {
  if (!ctx || !roarGain) return;
  const clamped = Math.max(0, Math.min(1, hype01));
  roarGain.gain.setTargetAtTime(clamped * 0.35, ctx.currentTime, 0.12);
}

export function stopStadiumRoar(): void {
  try {
    roarNode?.stop();
  } catch {
    /* noop */
  }
  roarNode?.disconnect();
  roarGain?.disconnect();
  roarNode = null;
  roarGain = null;
}

export function playThud(): void {
  const c = ensureCtx();
  if (!masterGain) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
  const g = c.createGain();
  g.gain.setValueAtTime(0.45, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.22);
}

export function playGoalHorn(): void {
  const c = ensureCtx();
  const out = masterGain;
  if (!out) return;
  const now = c.currentTime;
  const freqs = [233.08, 293.66]; // Bb3, D4 (acorde abierto)
  freqs.forEach((f, i) => {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = f;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0, now);
    g.gain.linearRampToValueAtTime(0.22, now + 0.05);
    g.gain.setValueAtTime(0.22, now + 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1800;
    osc.connect(filter);
    filter.connect(g);
    g.connect(out);
    osc.start(now + i * 0.04);
    osc.stop(now + 1.5);
  });
}

export function vibrate(pattern: number | number[]): void {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}
