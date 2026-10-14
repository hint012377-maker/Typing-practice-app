import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { lesson } from "./countries";
import RhythmLibrary from "./RhythmLibrary";
import { difficulties, type Difficulty, type Song } from "./songLibrary";

const initials = [..."ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"];
const vowels = [..."ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"];
const finals = ["", ..."ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"];
const compounds: Record<string, string> = { ㄳ: "ㄱㅅ", ㄵ: "ㄴㅈ", ㄶ: "ㄴㅎ", ㄺ: "ㄹㄱ", ㄻ: "ㄹㅁ", ㄼ: "ㄹㅂ", ㄽ: "ㄹㅅ", ㄾ: "ㄹㅌ", ㄿ: "ㄹㅍ", ㅀ: "ㄹㅎ", ㅄ: "ㅂㅅ", ㅘ: "ㅗㅏ", ㅙ: "ㅗㅐ", ㅚ: "ㅗㅣ", ㅝ: "ㅜㅓ", ㅞ: "ㅜㅔ", ㅟ: "ㅜㅣ", ㅢ: "ㅡㅣ" };
const keys: Record<string, string> = Object.fromEntries([..."ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔㅁㄴㅇㄹㅎㅗㅓㅏㅣㅋㅌㅊㅍㅠㅜㅡ"].map((letter, index) => [letter, "qwertyuiopasdfghjklzxcvbnm"[index]]));
Object.assign(keys, { ㅃ: "Q", ㅉ: "W", ㄸ: "E", ㄲ: "R", ㅆ: "T", ㅒ: "O", ㅖ: "P" });
type Note = { id: number; letter: string; key: string; lane: number; time: number; duration: number; country: string };
type Results = { score: number; combo: number; best: number; perfect: number; good: number; miss: number; wrong: number };
const emptyResults: Results = { score: 0, combo: 0, best: 0, perfect: 0, good: 0, miss: 0, wrong: 0 };
const travelMs = 2200;
const hitWindow = 180;

function decompose(name: string) {
  return [...name].flatMap(character => {
    const code = character.charCodeAt(0) - 0xac00;
    if (code < 0 || code >= 11172) return [];
    return [initials[Math.floor(code / 588)], vowels[Math.floor(code / 28) % 21], finals[code % 28]].flatMap(letter => [...(compounds[letter] ?? letter)]);
  });
}

function makeChart(spacing: number, song?: Song | null, difficulty: Difficulty = "easy") {
  const countries = [...lesson];
  for (let index = countries.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [countries[index], countries[other]] = [countries[other], countries[index]];
  }
  const notes: Note[] = [];
  const beatMs = song ? 60000 / song.bpm : spacing;
  const firstBeat = (song?.offset ?? 0) * 1000;
  let time = song ? firstBeat + Math.ceil(Math.max(0, 3000 - firstBeat) / beatMs) * beatMs : 3000;
  const end = song ? song.duration * 1000 - 800 : Infinity;
  const countryCount = song ? Math.ceil(song.duration * 1000 / spacing) : 5;
  for (let countryIndex = 0; countryIndex < countryCount && time < end; countryIndex += 1) {
    const country = countries[countryIndex % countries.length];
    decompose(country.korean).forEach(letter => {
      const longInterval = difficulty === "hard" ? 5 : difficulty === "normal" ? 7 : 10;
      const duration = notes.length % (song ? longInterval : 6) === 3 ? beatMs * 2 : 0;
      if (time + duration >= end) { time = end; return; }
      notes.push({ id: notes.length, letter, key: keys[letter], lane: notes.length % 4, time, duration, country: country.korean });
      time += spacing + duration;
    });
    time += song ? beatMs : spacing * 3;
  }
  return notes;
}

export default function CountryRhythm() {
  const [status, setStatus] = useState<"ready" | "playing" | "paused" | "finished">("ready");
  const [spacing, setSpacing] = useState(600);
  const [notes, setNotes] = useState<Note[]>([]);
  const [clock, setClock] = useState(0);
  const [results, setResults] = useState<Results>(emptyResults);
  const [feedback, setFeedback] = useState("READY?");
  const [sound, setSound] = useState(true);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [starting, setStarting] = useState(false);
  const [playbackError, setPlaybackError] = useState("");
  const [pulse, setPulse] = useState<{ id: number; lane: number; perfect: boolean } | null>(null);
  const pulseId = useRef(0);
  const stageRef = useRef<HTMLElement>(null);
  const player = useRef<HTMLAudioElement | null>(null);
  const elapsed = useRef(0);
  const origin = useRef(0);
  const judged = useRef(new Set<number>());
  const holding = useRef(new Map<number, { perfect: boolean; source: string }>());
  const audio = useRef<AudioContext | null>(null);
  const beat = useRef(-1);
  const approachMs = Math.max(1000, Math.min(travelMs, spacing * 18));
  const selectSong = useCallback((song: Song, level: Difficulty) => { void start(song, level); }, [starting, sound, selectedSong, difficulty, spacing]);

  function tone(frequency: number, volume = 0.035) {
    if (!sound || !audio.current || audio.current.state !== "running") return;
    const context = audio.current;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.07);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(); oscillator.stop(context.currentTime + 0.08);
  }

  function gameTime() {
    return player.current ? player.current.currentTime * 1000 : performance.now() - origin.current;
  }

  async function start(song: Song | null = selectedSong, level: Difficulty = difficulty) {
    if (starting) return;
    setStarting(true); setPlaybackError("");
    player.current?.pause(); player.current = null;
    try { audio.current ??= new AudioContext(); void audio.current.resume().catch(() => {}); } catch {}
    const nextSpacing = song ? (60000 / song.bpm) / difficulties.find(option => option.id === level)!.division : spacing;
    if (song) {
      const nextPlayer = new Audio(song.url);
      nextPlayer.volume = 0.7; nextPlayer.muted = !sound;
      try { await nextPlayer.play(); }
      catch { setPlaybackError("이 음원을 재생하지 못했어요. 파일 형식과 브라우저 재생 권한을 확인해주세요."); setStarting(false); return; }
      player.current = nextPlayer;
      nextPlayer.onerror = () => { nextPlayer.pause(); setPlaybackError("음원 재생이 중단됐어요. 다른 음원을 선택해주세요."); setStatus("paused"); };
      nextPlayer.onended = () => setStatus("finished");
    }
    setSelectedSong(song); setDifficulty(level); setSpacing(nextSpacing);
    judged.current.clear(); holding.current.clear(); elapsed.current = 0; beat.current = -1;
    setClock(0); setPulse(null); setResults({ ...emptyResults }); setFeedback("3 · 2 · 1");
    setNotes(makeChart(nextSpacing, song, level)); setStatus("playing"); setStarting(false);
    requestAnimationFrame(() => stageRef.current?.scrollIntoView({ block: "start", behavior: "auto" }));
  }

  async function resume() {
    setPlaybackError("");
    try { await player.current?.play(); void audio.current?.resume(); setStatus("playing"); }
    catch { setPlaybackError("재생을 이어가지 못했어요. 다시 시도해주세요."); }
  }

  function hit(key?: string, lane?: number) {
    if (status !== "playing") return;
    const now = gameTime();
    const candidate = notes.filter(note => !judged.current.has(note.id) && !holding.current.has(note.id) && Math.abs(note.time - now) <= hitWindow && (key !== undefined ? note.key === key : note.lane === lane)).sort((first, second) => Math.abs(first.time - now) - Math.abs(second.time - now))[0];
    if (!candidate) {
      setFeedback("MISS · 타이밍 또는 키가 맞지 않아요");
      setResults(previous => ({ ...previous, combo: 0, wrong: previous.wrong + 1 }));
      return;
    }
    const perfect = Math.abs(candidate.time - now) <= 80;
    if (candidate.duration) {
      holding.current.set(candidate.id, { perfect, source: key !== undefined ? `key:${key.toLowerCase()}` : `lane:${lane}` });
      setFeedback("HOLD · 끝까지 눌러주세요");
    } else reward(candidate, perfect);
    tone(440 + candidate.lane * 110);
  }

  function reward(note: Note, perfect: boolean) {
    if (judged.current.has(note.id)) return;
    judged.current.add(note.id); holding.current.delete(note.id);
    const points = (perfect ? 100 : 60) * (note.duration ? 2 : 1);
    setFeedback(`${note.duration ? "LONG " : ""}${perfect ? "PERFECT" : "GOOD"} +${points}`);
    setPulse({ id: ++pulseId.current, lane: note.lane, perfect });
    setResults(previous => ({ ...previous, score: previous.score + points, combo: previous.combo + 1, best: Math.max(previous.best, previous.combo + 1), perfect: previous.perfect + Number(perfect), good: previous.good + Number(!perfect) }));
  }

  function release(source: string, cancelled = false) {
    const now = status === "playing" ? gameTime() : elapsed.current;
    for (const [id, hold] of holding.current) {
      if (hold.source !== source) continue;
      const note = notes[id];
      if (!cancelled && now >= note.time + note.duration - 100) reward(note, hold.perfect);
      else {
        holding.current.delete(id); judged.current.add(id);
        setFeedback("LONG MISS · 너무 일찍 뗐어요");
        setResults(previous => ({ ...previous, combo: 0, miss: previous.miss + 1 }));
      }
    }
  }

  function pause() {
    for (const hold of holding.current.values()) release(hold.source, true);
    player.current?.pause();
    elapsed.current = gameTime();
    setStatus("paused");
  }

  useEffect(() => {
    if (status !== "playing") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (!/^Key[A-Z]$/.test(event.code)) return;
      event.preventDefault();
      const letter = event.code.slice(3);
      hit(event.shiftKey ? letter : letter.toLowerCase());
    };
    window.addEventListener("keydown", onKey);
    const onRelease = (event: KeyboardEvent) => {
      if (/^Key[A-Z]$/.test(event.code)) release(`key:${event.code.slice(3).toLowerCase()}`);
    };
    const onBlur = () => pause();
    window.addEventListener("keyup", onRelease);
    window.addEventListener("blur", onBlur);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onRelease); window.removeEventListener("blur", onBlur); };
  }, [status, notes, sound]);

  useEffect(() => {
    if (status !== "playing") { player.current?.pause(); return; }
    origin.current = performance.now() - elapsed.current;
    let frame = 0;
    const animate = () => {
      const now = gameTime();
      elapsed.current = now; setClock(now);
      for (const [id, hold] of holding.current) {
        const note = notes[id];
        if (now >= note.time + note.duration) reward(note, hold.perfect);
      }
      const missed = notes.filter(note => !judged.current.has(note.id) && !holding.current.has(note.id) && now > note.time + hitWindow);
      if (missed.length) {
        missed.forEach(note => judged.current.add(note.id));
        setResults(previous => ({ ...previous, combo: 0, miss: previous.miss + missed.length }));
        setFeedback("MISS");
      }
      const nextBeat = Math.floor(now / spacing);
      if (nextBeat !== beat.current) { beat.current = nextBeat; if (!selectedSong) tone(nextBeat % 4 === 0 ? 220 : 150, 0.012); }
      const finishTime = selectedSong ? selectedSong.duration * 1000 - 50 : notes.length ? notes[notes.length - 1].time + notes[notes.length - 1].duration + 600 : 0;
      if (notes.length && now >= finishTime) { setStatus("finished"); return; }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    const hide = () => { if (document.hidden) pause(); };
    document.addEventListener("visibilitychange", hide);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", hide); };
  }, [status, notes, spacing, sound, selectedSong]);

  useEffect(() => { if (player.current) player.current.muted = !sound; }, [sound]);
  useEffect(() => () => { player.current?.pause(); player.current?.removeAttribute("src"); void audio.current?.close(); }, []);

  const active = notes.find(note => note.time + note.duration + hitWindow >= clock) ?? notes[notes.length - 1];
  const notePosition = (time: number) => direction === "down" ? 82 - (time - clock) / approachMs * 82 : 18 + (time - clock) / approachMs * 82;
  const resolved = results.perfect + results.good + results.miss;
  const accuracy = resolved + results.wrong ? Math.round((results.perfect + results.good) / (resolved + results.wrong) * 100) : 100;

  return <main className="rhythm-room min-h-screen px-4 py-6 sm:px-8"><div className="mx-auto max-w-5xl">
    <header className="flex items-center justify-between gap-3"><Link to="/" className="rounded-full border border-white/25 px-4 py-2 text-sm">← 게임 선택</Link><button onClick={() => setSound(value => !value)} className="rounded-full border border-white/25 px-4 py-2 text-xs" aria-pressed={sound}>♪ 소리 {sound ? "ON" : "OFF"}</button></header>
    <div className="mt-7 flex flex-wrap items-end justify-between gap-4"><div><p className="rhythm-accent font-mono text-xs tracking-widest">COUNTRY RHYTHM / 두벌식 리듬 연습</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">나라를 한 음씩 연주하다.</h1></div><p className="font-mono text-xl">{results.score.toLocaleString()} <span className="text-xs opacity-60">POINTS</span></p></div>
    <div hidden={status === "playing" || status === "paused"}>
      <RhythmLibrary disabled={starting} onPlay={selectSong} />
    </div>
    {selectedSong && <div className="song-now-playing mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"><div className="min-w-0"><p className="break-words text-sm font-bold">♪ {selectedSong.title}</p><p className="mt-1 text-xs opacity-65">{selectedSong.artist || "내 음원"} · {selectedSong.bpm} BPM · {difficulties.find(option => option.id === difficulty)?.label}</p></div><span className="font-mono text-xs">{Math.floor(clock / 60000)}:{String(Math.floor(clock / 1000) % 60).padStart(2, "0")} / {Math.floor(selectedSong.duration / 60)}:{String(Math.floor(selectedSong.duration % 60)).padStart(2, "0")}</span></div>}
    {playbackError && <p role="alert" className="mt-3 rounded-xl border border-red-300/40 p-3 text-sm text-red-200">{playbackError}</p>}
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="flex flex-wrap items-center gap-3 lg:col-span-2"><span className="text-xs opacity-70">노트 진행 방향</span><div className="flex gap-2">{(["down", "up"] as const).map(mode => <button key={mode} className="rhythm-direction rounded-full border border-white/25 px-4 py-2 text-xs" aria-pressed={direction === mode} onClick={() => setDirection(mode)}>{mode === "down" ? "↓ 위에서 아래로" : "↑ 아래에서 위로"}</button>)}</div><span className="text-xs opacity-60">연주 중에도 변경 가능 · 꼬리 노트는 길게 누르기</span></div>
      <section ref={stageRef} className="rhythm-play-area"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="text-lg font-bold">{active?.country ?? "다섯 나라, 하나의 리듬"}</p><span className="rhythm-accent font-mono text-sm">{results.combo} COMBO · {results.score.toLocaleString()}점</span></div>
        <div className="rhythm-stage relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 grid grid-cols-4">{[0, 1, 2, 3].map(lane => <div key={lane} className="rhythm-lane" />)}</div>
          {status === "playing" && notes.filter(note => !judged.current.has(note.id) && note.time - clock < approachMs && (holding.current.has(note.id) || note.time - clock > -hitWindow)).map(note => {
            const held = holding.current.has(note.id);
            const head = notePosition(held ? clock : note.time);
            const tail = notePosition(note.time + note.duration);
            return <div key={note.id}>
              {note.duration > 0 && <div className="rhythm-longtail" data-held={held} style={{ left: `${note.lane * 25 + 8}%`, top: `${Math.min(head, tail)}%`, height: `${Math.abs(head - tail)}%` }} />}
              <div className="rhythm-note" data-held={held} data-kind={vowels.includes(note.letter) ? "vowel" : "consonant"} style={{ left: `${note.lane * 25 + 2}%`, top: `${head}%` }}><b>{note.letter}</b><span>{note.key === note.key.toUpperCase() ? `⇧ ${note.key}` : note.key.toUpperCase()}{note.duration > 0 && <small className="block text-[8px]">HOLD</small>}</span></div>
            </div>;
          })}
          <div className="rhythm-hitline" style={{ top: direction === "down" ? "82%" : "18%" }}><span>HIT HERE</span></div>
          {pulse && status === "playing" && <div key={pulse.id} className="rhythm-hit-effect" data-perfect={pulse.perfect} style={{ left: `${pulse.lane * 25 + 2}%`, top: direction === "down" ? "82%" : "18%" }}><span>{pulse.perfect ? "PERFECT" : "GOOD"}</span></div>}
          <p className="rhythm-judgement absolute inset-x-0 bottom-3 text-center font-mono text-sm" aria-live="polite">{clock < 2000 && status === "playing" ? `${Math.max(1, Math.ceil((3000 - clock) / 1000))} · 준비` : feedback}</p>
          {status !== "playing" && <div className="rhythm-overlay absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center">
            <p className="font-mono text-xs tracking-widest">{status === "finished" ? "STAGE COMPLETE" : status === "paused" ? "PAUSED" : "READY TO PLAY"}</p>
            <h2 className="text-3xl font-bold">{status === "finished" ? "연주 완료!" : status === "paused" ? "잠깐 쉬어가기" : "나라 이름이 리듬이 됩니다"}</h2>
            {status === "ready" && !selectedSong && <label className="text-sm">기본 박자 연습 <select className="ml-3 rounded-lg bg-white/10 px-4 py-2" value={spacing} onChange={event => setSpacing(Number(event.target.value))}><option value={750}>천천히 · 80 BPM</option><option value={600}>보통 · 100 BPM</option><option value={400}>빠르게 · 150 BPM</option></select></label>}
            {status === "finished" && <p className="text-sm leading-8">{results.score.toLocaleString()}점 · 정확도 {accuracy}%<br />최고 콤보 {results.best} · PERFECT {results.perfect}<br />GOOD {results.good} · MISS {results.miss} · 잘못 누름 {results.wrong}</p>}
            <button disabled={starting} className="rhythm-start rounded-full px-8 py-3 font-bold" onClick={() => { if (status === "paused") void resume(); else void start(); }}>{starting ? "음원 준비 중…" : status === "paused" ? "이어 연주하기" : status === "finished" ? "다시 연주하기" : "기본 박자 연습 시작 →"}</button>
            {(status === "paused" || status === "finished") && <button className="text-sm underline underline-offset-4" onClick={() => { player.current?.pause(); player.current = null; holding.current.clear(); setStatus("ready"); setSelectedSong(null); setSpacing(600); setNotes([]); setClock(0); setFeedback("READY?"); setPulse(null); }}>노래 보관함으로 돌아가기</button>}
          </div>}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">{[0, 1, 2, 3].map(lane => { const upcoming = notes.find(note => note.lane === lane && !judged.current.has(note.id) && note.time + note.duration + hitWindow >= clock); return <button key={lane} className="rhythm-pad touch-none rounded-xl py-3" disabled={status !== "playing"} data-held={notes.some(note => note.lane === lane && holding.current.has(note.id))} onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); hit(undefined, lane); }} onPointerUp={() => release(`lane:${lane}`)} onPointerCancel={() => release(`lane:${lane}`, true)} onLostPointerCapture={() => release(`lane:${lane}`, true)} onKeyDown={event => { if ((event.key === " " || event.key === "Enter") && !event.repeat) { event.preventDefault(); hit(undefined, lane); } }} onKeyUp={event => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); release(`lane:${lane}`); } }} aria-label={`${lane + 1}번 레인 ${upcoming?.letter ?? ""} 연주`}><b className="block text-xl">{upcoming?.letter ?? "·"}</b><span className="font-mono text-[10px] opacity-60">TAP {lane + 1}</span></button>; })}</div>
      </section>
      <aside className="rhythm-guide rounded-2xl p-6"><p className="rhythm-accent font-mono text-xs tracking-widest">HOW TO PLAY</p><h2 className="mt-4 text-xl font-bold">자음과 모음이<br />판정선에 닿을 때!</h2><div className="mt-5 space-y-4 text-sm leading-7 opacity-80"><p>타자연습의 전체 국가 목록에서 매번 5개 나라를 골라요. ‘일본’은 ㅇ → ㅣ → ㄹ → ㅂ → ㅗ → ㄴ 순서로 떨어져요.</p><p><b>PC</b> · 노트 아래 영문 키를 누르세요. ㅇ은 D, ㅣ는 L이에요. 한·영 입력 모드와 관계없이 작동해요. 쌍자음은 Shift와 함께 누르세요.</p><p><b>모바일</b> · 노트가 닿는 레인 아래의 TAP 버튼을 누르세요. 화면 키보드는 필요 없어요.</p><p><b>롱노트</b> · 꼬리가 달린 노트는 시작점에서 누른 뒤 꼬리 끝까지 유지하세요. 끝에 도달하면 자동 성공! 일반 노트의 두 배 점수예요. 일찍 떼거나 일시정지하면 진행 중인 롱노트는 MISS 처리돼요.</p><p>겹받침과 복합 모음은 실제 두벌식 입력 순서로 나눠요. ㅘ는 ㅗ → ㅏ, ㄺ은 ㄹ → ㄱ이에요.</p><p>PERFECT ±80ms · 100점<br />GOOD ±180ms · 60점<br />놓치거나 잘못 누르면 콤보가 끊겨요.</p></div><div className="mt-6 border-t border-white/15 pt-4 text-sm">정확도 <b>{accuracy}%</b> · 최고 콤보 <b>{results.best}</b></div>{status === "playing" && <button className="mt-5 w-full rounded-xl border border-white/25 py-3 text-sm" onClick={pause}>일시정지</button>}</aside>
    </div>
  </div></main>;
}
