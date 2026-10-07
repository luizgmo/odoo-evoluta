/**
 * Som discreto de carimbo (opcional, desligado de fábrica): um baque curto,
 * feito na hora pelo navegador, sem arquivo de áudio.
 */
import { lerPreferencias } from "./preferencias";

let contexto: AudioContext | null = null;

export function tocarBatida(): void {
  if (!lerPreferencias().somAoCarimbar) return;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    contexto ??= new Ctor();
    const ctx = contexto;
    const agora = ctx.currentTime;
    // Grave curto (a madeira do carimbo) …
    const osc = ctx.createOscillator();
    const volume = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, agora);
    osc.frequency.exponentialRampToValueAtTime(55, agora + 0.12);
    volume.gain.setValueAtTime(0.35, agora);
    volume.gain.exponentialRampToValueAtTime(0.001, agora + 0.16);
    osc.connect(volume).connect(ctx.destination);
    osc.start(agora);
    osc.stop(agora + 0.17);
    // … e um estalo de papel
    const ruido = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    const dados = ruido.getChannelData(0);
    for (let i = 0; i < dados.length; i++) dados[i] = (Math.random() * 2 - 1) * (1 - i / dados.length);
    const fonte = ctx.createBufferSource();
    const filtro = ctx.createBiquadFilter();
    const volRuido = ctx.createGain();
    fonte.buffer = ruido;
    filtro.type = "lowpass";
    filtro.frequency.value = 1800;
    volRuido.gain.value = 0.12;
    fonte.connect(filtro).connect(volRuido).connect(ctx.destination);
    fonte.start(agora);
  } catch {
    // sem áudio: segue em silêncio
  }
}
