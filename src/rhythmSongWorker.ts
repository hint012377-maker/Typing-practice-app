import { createRhythmSong, rhythmSongs } from "./rhythmSongs";

self.onmessage = (event: MessageEvent<{ request: number; trackId: string }>) => {
  const { request, trackId } = event.data;
  const track = rhythmSongs.find(song => song.id === trackId);
  if (!track) { self.postMessage({ request, error: "Unknown track" }); return; }
  try { self.postMessage({ request, file: createRhythmSong(track) }); }
  catch { self.postMessage({ request, error: "Audio generation failed" }); }
};
