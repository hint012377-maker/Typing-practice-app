import { memo, useEffect, useRef, useState, type FormEvent } from "react";
import { audioDuration, difficulties, saveSong, storedSongs, type Difficulty, type Song } from "./songLibrary";

function RhythmLibrary({ disabled, onPlay }: { disabled: boolean; onPlay: (song: Song, difficulty: Difficulty) => void }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<Difficulty>("easy");
  const urls = useRef<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void storedSongs().then(records => {
      if (cancelled) return;
      setSongs(records.sort((first, second) => second.addedAt - first.addedAt).map(record => {
        const url = URL.createObjectURL(record.file); urls.current.push(url);
        const { file, ...metadata } = record;
        return { ...metadata, url };
      }));
    }).catch(error => { if (!cancelled) setMessage(error.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; urls.current.forEach(url => URL.revokeObjectURL(url)); urls.current = []; };
  }, []);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("audio") as File;
    if (!file?.size || file.size > 40 * 1024 * 1024) { setMessage("40MB 이하의 음원 파일을 선택해주세요."); return; }
    const bpm = Number(data.get("bpm")); const offset = Number(data.get("offset"));
    if (!Number.isFinite(bpm) || bpm < 40 || bpm > 240 || !Number.isFinite(offset) || offset < 0 || offset > 10) { setMessage("BPM과 첫 박자 시간을 확인해주세요."); return; }
    setBusy(true); setMessage("");
    const url = URL.createObjectURL(file);
    try {
      const duration = await audioDuration(url);
      if (!Number.isFinite(duration) || duration < 10 || duration > 600) throw new Error("10초부터 10분까지의 음원을 추가할 수 있어요.");
      if (offset > duration - 4) throw new Error("첫 박자는 음원 종료 시점보다 최소 4초 앞에 있어야 해요.");
      const record = { id: crypto.randomUUID(), title: String(data.get("title")).trim(), artist: String(data.get("artist")).trim(), bpm, offset, duration, addedAt: Date.now(), file };
      if (!record.title) throw new Error("노래 제목을 입력해주세요.");
      await saveSong(record);
      urls.current.push(url);
      const { file: storedFile, ...metadata } = record;
      setSongs(previous => [{ ...metadata, url }, ...previous]);
      form.reset(); setOpen(false); setMessage("노래를 보관함에 추가했어요. 난이도를 골라 연주하세요.");
    } catch (error) { URL.revokeObjectURL(url); setMessage(error instanceof Error ? error.message : "음원 추가에 실패했어요."); }
    finally { setBusy(false); }
  }

  return <section className="rhythm-library mt-6 rounded-2xl p-5 sm:p-6" aria-labelledby="library-title">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="rhythm-accent font-mono text-[10px] tracking-widest">YOUR MUSIC / RECENTLY ADDED</p><h2 id="library-title" className="mt-2 text-xl font-bold">최신 노래 보관함</h2></div><button disabled={disabled || busy} onClick={() => setOpen(value => !value)} className="rhythm-start rounded-full px-5 py-2.5 text-sm font-bold" aria-expanded={open}>{open ? "닫기" : "+ 음원 추가"}</button></div>
    <p className="mt-3 text-xs leading-6 opacity-65">등록한 최신 순으로 표시돼요. 이용 권한이 있는 음원만 추가해주세요. 음원은 이 기기·브라우저에만 저장되며, 다른 플레이어에게 공유되지 않아요.</p>
    {open && <form className="song-upload mt-4 grid gap-3 sm:grid-cols-2" onSubmit={add}>
      <label>노래 제목<input name="title" maxLength={100} required placeholder="노래 제목" /></label>
      <label>아티스트<input name="artist" maxLength={100} placeholder="아티스트 이름" /></label>
      <label>BPM · 일정한 템포<input name="bpm" type="number" min={40} max={240} step="0.1" defaultValue={120} required /></label>
      <label>첫 박자 위치 · 초<input name="offset" type="number" min={0} max={10} step="0.01" defaultValue={0} required /></label>
      <label className="sm:col-span-2">음원 파일 · 40MB 이하<input name="audio" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a" required /></label>
      <p className="text-xs leading-6 opacity-65 sm:col-span-2">BPM과 첫 박자 위치를 기준으로 자동 생성하는 연습 채보예요. 멜로디를 분석하는 방식은 아니므로 박자가 다르면 이 값을 조정해 다시 등록해주세요.</p>
      <button disabled={busy} className="rhythm-start rounded-xl py-3 text-sm font-bold sm:col-span-2">{busy ? "음원 확인·저장 중…" : "보관함에 저장"}</button>
    </form>}
    <div className="mt-5 flex gap-2" role="group" aria-label="노래 난이도">{difficulties.map(difficulty => <button key={difficulty.id} disabled={disabled} className="rhythm-direction rounded-full border border-white/20 px-5 py-2 text-sm" aria-pressed={filter === difficulty.id} onClick={() => setFilter(difficulty.id)}>{difficulty.label}</button>)}</div>
    <div className="mt-4 space-y-3">{songs.map((song, index) => <article key={song.id} className="song-row flex flex-wrap items-center gap-4 rounded-xl p-4"><span className="song-cover grid h-12 w-12 shrink-0 place-items-center rounded-lg font-mono text-xl">♪</span><div className="min-w-0 flex-1"><p className="break-words text-sm font-bold">{song.title}{index === 0 && <span className="rhythm-accent ml-2 font-mono text-[9px]">NEW</span>}</p><p className="mt-1 text-xs opacity-60">{song.artist || "아티스트 미입력"} · {song.bpm} BPM · {Math.floor(song.duration / 60)}:{String(Math.floor(song.duration % 60)).padStart(2, "0")}</p></div><button disabled={disabled || loading} onClick={() => onPlay(song, filter)} className="rhythm-start rounded-full px-5 py-2.5 text-sm font-bold">{difficulties.find(difficulty => difficulty.id === filter)?.label} 연주 ▶</button></article>)}</div>
    {!songs.length && <div className="mt-4 rounded-xl border border-dashed border-white/20 p-6 text-center"><p className="text-sm">{loading ? "보관함을 불러오는 중…" : "아직 등록된 노래가 없어요."}</p><p className="mt-2 text-xs leading-6 opacity-60">음원을 추가하거나 아래 기본 박자 연습으로 먼저 시작해보세요.<br />상용 최신곡은 자동 제공되지 않아요.</p></div>}
    <p className="mt-3 text-xs leading-6" role="status">{message}</p>
  </section>;
}

export default memo(RhythmLibrary);
