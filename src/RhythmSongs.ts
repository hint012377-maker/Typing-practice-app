export const rhythmSongs = [
  { id: "twinkle", title: "작은 별", subtitle: "가볍게 시작하는 익숙한 멜로디", bpm: 100, tag: "EASY", melody: [60, 60, 67, 67, 69, 69, 67, 0, 65, 65, 64, 64, 62, 62, 60, 0, 67, 67, 65, 65, 64, 64, 62, 0, 67, 67, 65, 65, 64, 64, 62, 0, 60, 60, 67, 67, 69, 69, 67, 0, 65, 65, 64, 64, 62, 62, 60, 0] },
  { id: "joy", title: "환희의 송가", subtitle: "클래식 멜로디에 경쾌한 비트", bpm: 120, tag: "NORMAL", melody: [64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62, 0, 64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 62, 60, 60, 0] },
  { id: "world", title: "World Groove", subtitle: "나라 리듬게임을 위한 오리지널", bpm: 140, tag: "FAST", melody: [64, 67, 71, 74, 71, 67, 64, 62, 60, 64, 67, 72, 67, 64, 60, 62, 62, 66, 69, 74, 69, 66, 62, 64, 59, 62, 67, 71, 74, 71, 67, 62] },
] as const;

export type RhythmSong = (typeof rhythmSongs)[number];

export function createRhythmSong(track: RhythmSong): File {
  const sampleRate = 22050;
  const beat = 60 / track.bpm;
  const duration = beat * 72;
  const samples = new Float32Array(Math.ceil(sampleRate * duration));
  const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
  const addTone = (start: number, length: number, midi: number, volume: number, bright = false) => {
    const startSample = Math.floor(start * sampleRate);
    const count = Math.floor(length * sampleRate);
    const pitch = frequency(midi);
    for (let index = 0; index < count && startSample + index < samples.length; index += 1) {
      const time = index / sampleRate;
      const envelope = Math.min(1, time / 0.008) * Math.exp(-time * (bright ? 6 : 3)) * Math.min(1, (length - time) / 0.04);
      const phase = time * pitch * Math.PI * 2;
      const wave = Math.sin(phase) + (bright ? 0.3 : 0.15) * Math.sin(phase * 2) + 0.07 * Math.sin(phase * 3);
      samples[startSample + index] += wave * envelope * volume;
    }
  };
  const roots = [48, 45, 53, 55];
  let noiseSeed = 271;
  for (let step = 0; step < 68; step += 1) {
    const start = step * beat;
    const root = roots[Math.floor(step / 8) % roots.length];
    const startSample = Math.floor(start * sampleRate);
    for (let index = 0; index < Math.floor(sampleRate * 0.16) && startSample + index < samples.length; index += 1) {
      const time = index / sampleRate;
      noiseSeed = (Math.imul(noiseSeed, 1664525) + 1013904223) | 0;
      const noise = noiseSeed / 2147483648;
      const kick = step % 2 === 0 ? Math.sin(Math.PI * 2 * (48 * time + 1.9 * (1 - Math.exp(-time * 40)))) * Math.exp(-time * 28) * 0.25 : 0;
      const snare = step % 4 === 2 ? noise * Math.exp(-time * 38) * 0.12 : 0;
      samples[startSample + index] += kick + snare + noise * Math.exp(-time * 120) * 0.025;
    }
    if (step < 4) continue;
    addTone(start, beat * 0.75, root - 12, 0.13);
    if (step % 4 === 0) {
      for (const interval of [0, 4, 7]) addTone(start, beat * 3.6, root + interval, 0.032);
    }
    const note = track.melody[(step - 4) % track.melody.length];
    if (note) addTone(start, beat * 0.95, note, 0.2, true);
    if (track.id === "world") addTone(start + beat * 0.5, beat * 0.4, root + 19, 0.035, true);
  }
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  const gain = peak > 0 ? 0.85 / peak : 1;
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeText = (position: number, text: string) => {
    for (let index = 0; index < text.length; index += 1) view.setUint8(position + index, text.charCodeAt(index));
  };
  writeText(0, "RIFF"); view.setUint32(4, buffer.byteLength - 8, true);
  writeText(8, "WAVE"); writeText(12, "fmt "); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  writeText(36, "data"); view.setUint32(40, samples.length * 2, true);
  for (let index = 0; index < samples.length; index += 1) {
    const fade = Math.min(1, (samples.length - index) / sampleRate);
    view.setInt16(44 + index * 2, Math.round(Math.max(-1, Math.min(1, samples[index] * gain * fade)) * 32767), true);
  }
  return new File([buffer], `${track.title}.wav`, { type: "audio/wav" });
}
