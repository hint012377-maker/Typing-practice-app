import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { createRhythmSong, rhythmSongs, type RhythmSong } from "./rhythmSongs";

type RhythmCountry = { code: string; korean: string; english: string };
type Note = { id: number; lane: number; time: number; duration: number; country: RhythmCountry; state: "waiting" | "holding" | "done" };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type Phase = "ready" | "playing" | "paused" | "finished";
const colors = ["#dcf86e", "#60ebd4", "#ffb68f", "#baacff"];
const keys = ["D", "F", "J", "K"];
const defaultBindings = ["KeyD", "KeyF", "KeyJ", "KeyK"];
const timing = { perfect: 0.11, good: 0.23, holdRelease: 0.16 };
const validBinding = (code: string) => /^(Key[A-Z]|Digit[0-9]|Arrow(Left|Right|Up|Down)|Semicolon|Quote|Comma|Period|Slash|BracketLeft|BracketRight|Backslash|Minus|Equal)$/.test(code);
const keyLabel = (code: string) => ({ ArrowLeft: "←", ArrowRight: "→", ArrowUp: "↑", ArrowDown: "↓", Semicolon: ";", Quote: "'", Comma: ",", Period: ".", Slash: "/", BracketLeft: "[", BracketRight: "]", Backslash: "\\", Minus: "−", Equal: "=" }[code] ?? code.replace(/^(Key|Digit)/, ""));

function loadBindings(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem("geo-rhythm-keys") ?? "null");
    if (Array.isArray(saved) && saved.length === 4 && saved.every(code => typeof code === "string" && validBinding(code)) && new Set(saved).size === 4) return saved;
  } catch {}
  return [...defaultBindings];
}

function makeChart(countries: RhythmCountry[], bpm = 100, offset = 0, songDuration?: number): Note[] {
  const beat = 60 / bpm;
  const first = songDuration ? offset + Math.ceil(Math.max(0, 3 - offset) / beat) * beat : 3;
  const available = [0, 0, 0, 0];
  const count = songDuration ? Math.min(1000, Math.max(0, Math.floor((songDuration - first - beat * 2 - 0.5) / beat) + 1)) : 64;
  return Array.from({ length: count }, (_, id) => {
    const time = first + id * beat;
    let lane = (id * 7 + Math.floor(id / 4)) % 4;
    while (available[lane] > time) lane = (lane + 1) % 4;
    const duration = id % 7 === 4 ? beat * 2 : 0;
    available[lane] = time + duration + beat * 0.5;
    return { id, lane, time, duration, country: countries[id % countries.length], state: "waiting" };
  });
}

export default function RhythmGame({ countries }: { countries: RhythmCountry[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const musicUrlRef = useRef<string | null>(null);
  const [song, setSong] = useState<{ name: string; duration: number } | null>(null);
  const [bpm, setBpm] = useState(100);
  const [offset, setOffset] = useState(0);
  const [musicLoading, setMusicLoading] = useState(false);
  const [musicError, setMusicError] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const songCache = useRef(new Map<string, File>());
  const musicConfig = useRef({ bpm, offset, song, loading: musicLoading });
  musicConfig.current = { bpm, offset, song, loading: musicLoading };
  const [phase, setPhase] = useState<Phase>("ready");
  const [direction, setDirection] = useState<"down" | "up">("down");
  const [speed, setSpeed] = useState(10);
  const [sound, setSound] = useState(true);
  const [bindings, setBindings] = useState(loadBindings);
  const [rebinding, setRebinding] = useState<number | null>(null);
  const [bindingHint, setBindingHint] = useState("버튼을 누른 뒤 원하는 키를 눌러주세요.");
  const rebindingRef = useRef<number | null>(null);
  useEffect(() => { try { localStorage.setItem("geo-rhythm-keys", JSON.stringify(bindings)); } catch {} }, [bindings]);
  const [hud, setHud] = useState({ score: 0, combo: 0, best: 0, perfect: 0, good: 0, miss: 0, progress: 0 });
  const [pressed, setPressed] = useState<boolean[]>([false, false, false, false]);
  const settings = useRef({ direction, speed: speed / 10, sound, bindings });
  settings.current = { direction, speed: speed / 10, sound, bindings };
  useEffect(() => {
    if (musicRef.current) { musicRef.current.playbackRate = speed / 10; musicRef.current.muted = !sound; }
  }, [speed, sound]);
  const frameTimeRef = useRef(performance.now());
  const game = useRef({ phase: "ready" as Phase, notes: makeChart(countries), time: 0, score: 0, combo: 0, best: 0, perfect: 0, good: 0, miss: 0, pressed: new Set<number>(), sources: new Map<string, number>(), sparks: [] as Spark[], flashes: [0, 0, 0, 0], judgment: "", judgmentAt: -10, lastBeat: -1, width: 640, height: 720 });
  const sessionDuration = () => game.current.notes.at(-1) ? game.current.notes.at(-1)!.time + Math.max(3, game.current.notes.at(-1)!.duration + 0.5) : 1;
  const inputTime = () => game.current.phase === "playing" && musicRef.current && musicConfig.current.song ? musicRef.current.currentTime : game.current.time + (game.current.phase === "playing" ? Math.max(0, Math.min(0.08, (performance.now() - frameTimeRef.current) / 1000)) * settings.current.speed : 0);

  const tone = (frequency: number, length = 0.12, volume = 0.04, type: OscillatorType = "sine") => {
    const context = audioRef.current;
    if (!context || context.state !== "running" || !settings.current.sound) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + length);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + length);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  };

  const publish = () => {
    const state = game.current;
    setHud({ score: state.score, combo: state.combo, best: state.best, perfect: state.perfect, good: state.good, miss: state.miss, progress: Math.min(1, state.time / sessionDuration()) });
  };

  const judge = (lane: number, rating: "PERFECT" | "GOOD" | "MISS", hold = false) => {
    const state = game.current;
    state.judgment = hold ? "LONG PERFECT" : rating;
    state.judgmentAt = performance.now();
    if (rating === "MISS") { state.combo = 0; state.miss += 1; return; }
    state.combo += 1;
    state.best = Math.max(state.best, state.combo);
    state.score += (rating === "PERFECT" ? 1000 : 500) + Math.min(state.combo, 100) * 10 + (hold ? 500 : 0);
    if (rating === "PERFECT") state.perfect += 1; else state.good += 1;
    state.flashes[lane] = 1;
    const x = (lane + 0.5) * state.width / 4;
    const y = state.height * (settings.current.direction === "down" ? 0.83 : 0.17);
    for (let index = 0; index < (hold ? 38 : 24); index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 60 + Math.random() * 220;
      state.sparks.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, life: 1, color: colors[lane] });
    }
    state.sparks = state.sparks.slice(-240);
    tone([523.25, 659.25, 783.99, 987.77][lane], hold ? 0.35 : 0.16, 0.055, "triangle");
    if (hold) tone(1567.98, 0.4, 0.025);
  };

  const press = (lane: number, source: string) => {
    const state = game.current;
    if (state.phase !== "playing" || state.sources.has(source)) return;
    state.sources.set(source, lane);
    if (state.pressed.has(lane)) return;
    state.pressed.add(lane);
    setPressed(keys.map((_, index) => state.pressed.has(index)));
    const now = inputTime();
    const candidate = state.notes.filter(note => note.lane === lane && note.state === "waiting" && Math.abs(note.time - now) <= timing.good * settings.current.speed).reduce<Note | undefined>((nearest, note) => !nearest || Math.abs(note.time - now) < Math.abs(nearest.time - now) ? note : nearest, undefined);
    if (!candidate) return;
    const perfect = Math.abs(candidate.time - now) <= timing.perfect * settings.current.speed;
    candidate.state = candidate.duration ? "holding" : "done";
    judge(lane, perfect ? "PERFECT" : "GOOD");
    publish();
  };

  const release = (source: string) => {
    const state = game.current;
    const lane = state.sources.get(source);
    if (lane === undefined) return;
    state.sources.delete(source);
    if ([...state.sources.values()].includes(lane)) return;
    state.pressed.delete(lane);
    setPressed(keys.map((_, index) => state.pressed.has(index)));
    for (const note of state.notes) {
      if (note.lane !== lane || note.state !== "holding") continue;
      note.state = "done";
      const completed = inputTime() >= note.time + note.duration - timing.holdRelease * settings.current.speed;
      judge(lane, completed ? "PERFECT" : "MISS", completed);
    }
    publish();
  };

  const start = () => {
    if (musicConfig.current.loading) return;
    rebindingRef.current = null;
    setRebinding(null);
    if (!audioRef.current) {
      try { audioRef.current = new AudioContext(); } catch {}
    }
    void audioRef.current?.resume();
    const state = game.current;
    if (state.phase !== "paused") {
      const config = musicConfig.current;
      const notes = makeChart(countries, config.bpm, config.offset, config.song?.duration);
      if (!notes.length) { setMusicError("곡이 너무 짧거나 첫 박자 위치가 너무 늦어요. 다른 곡 또는 시작 위치를 선택하세요."); return; }
      Object.assign(state, { notes, time: 0, score: 0, combo: 0, best: 0, perfect: 0, good: 0, miss: 0, lastBeat: -1, judgment: "", sparks: [], flashes: [0, 0, 0, 0] });
      if (musicRef.current) musicRef.current.currentTime = 0;
      state.sources.clear();
      state.pressed.clear();
      setPressed([false, false, false, false]);
    }
    state.phase = "playing";
    frameTimeRef.current = performance.now();
    setPhase("playing");
    const music = musicRef.current;
    if (music && musicConfig.current.song) {
      music.playbackRate = settings.current.speed;
      music.muted = !settings.current.sound;
      void music.play().catch(() => { if (musicRef.current !== music || game.current.phase !== "playing") return; game.current.phase = "paused"; setPhase("paused"); setMusicError("음악을 재생하지 못했어요. 이어하기를 눌러 다시 시도하세요."); });
    }
    publish();
  };

  const pause = () => {
    if (game.current.phase !== "playing") return;
    game.current.phase = "paused";
    musicRef.current?.pause();
    setPhase("paused");
  };

  const resetSongSession = () => {
    pause();
    musicRef.current?.pause();
    game.current.phase = "ready";
    Object.assign(game.current, { time: 0, score: 0, combo: 0, best: 0, perfect: 0, good: 0, miss: 0, judgment: "", sparks: [], flashes: [0, 0, 0, 0] });
    game.current.sources.clear(); game.current.pressed.clear();
    setPressed([false, false, false, false]);
    setPhase("ready");
    publish();
  };

  const clearMusic = () => {
    resetSongSession();
    const music = musicRef.current;
    if (music) { music.onloadedmetadata = null; music.onerror = null; music.removeAttribute("src"); music.load(); }
    musicRef.current = null;
    if (musicUrlRef.current) URL.revokeObjectURL(musicUrlRef.current);
    musicUrlRef.current = null;
    setSong(null); setMusicLoading(false); setMusicError("");
    setSelectedTrack(null);
  };

  const selectMusic = (file?: File, trackId?: string) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setMusicError("50MB 이하의 음악 파일을 선택하세요."); return; }
    if (!file.type.startsWith("audio/") && !/\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i.test(file.name)) { setMusicError("MP3, WAV 등 음악 파일을 선택하세요."); return; }
    clearMusic();
    setSelectedTrack(trackId ?? null);
    setMusicLoading(true);
    const url = URL.createObjectURL(file);
    const music = new Audio();
    musicUrlRef.current = url; musicRef.current = music;
    music.preload = "auto";
    music.onloadedmetadata = () => {
      if (musicRef.current !== music) return;
      if (!Number.isFinite(music.duration) || music.duration < 6) { clearMusic(); setMusicError("6초 이상의 음악 파일을 선택하세요."); return; }
      setSong({ name: file.name, duration: music.duration }); setMusicLoading(false);
    };
    music.onerror = () => { if (musicRef.current !== music) return; clearMusic(); setMusicError("이 브라우저에서 읽을 수 없는 음악입니다. MP3 또는 WAV로 다시 시도하세요."); };
    music.src = url;
  };

  const selectBuiltin = (track: RhythmSong) => {
    try {
      const file = songCache.current.get(track.id) ?? createRhythmSong(track);
      songCache.current.set(track.id, file);
      setBpm(track.bpm);
      setOffset(0);
      selectMusic(file, track.id);
    } catch { setMusicError("기본곡을 준비하지 못했어요. 다시 선택하거나 음악 파일을 사용해 주세요."); }
  };

  const actions = useRef({ press, release, pause, start });
  actions.current = { press, release, pause, start };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      game.current.width = rect.width;
      game.current.height = rect.height;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    let frame = 0;
    let previous = performance.now();
    let published = previous;
    const draw = (now: number) => {
      const elapsed = Math.min((now - previous) / 1000, 0.08);
      previous = now;
      frameTimeRef.current = now;
      const state = game.current;
      const { width, height } = state;
      const laneWidth = width / 4;
      const down = settings.current.direction === "down";
      const target = height * (down ? 0.83 : 0.17);
      const travel = height * 0.7 / 2.4;
      const beat = 60 / musicConfig.current.bpm;
      if (state.phase === "playing") {
        if (musicRef.current && musicConfig.current.song) state.time = musicRef.current.currentTime;
        else state.time += elapsed * settings.current.speed;
        const currentBeat = Math.floor(state.time / beat);
        if (currentBeat !== state.lastBeat && !musicConfig.current.song) {
          state.lastBeat = currentBeat;
          tone(currentBeat % 4 === 0 ? 110 : 220, 0.09, currentBeat % 4 === 0 ? 0.065 : 0.025, "triangle");
          if (currentBeat % 2 === 0) tone([261.63, 329.63, 392, 293.66][Math.floor(currentBeat / 8) % 4], 0.27, 0.025);
        }
        for (const note of state.notes) {
          if (note.state === "waiting" && state.time > note.time + timing.good * settings.current.speed) { note.state = "done"; judge(note.lane, "MISS"); }
          if (note.state === "holding") {
            if (!state.pressed.has(note.lane)) { note.state = "done"; judge(note.lane, "MISS"); }
            else if (state.time >= note.time + note.duration) { note.state = "done"; judge(note.lane, "PERFECT", true); }
          }
        }
        if (state.time >= sessionDuration() || musicRef.current?.ended) { state.phase = "finished"; musicRef.current?.pause(); setPhase("finished"); publish(); }
      }
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#0d231f";
      context.fillRect(0, 0, width, height);
      for (let lane = 0; lane < 4; lane += 1) {
        const x = lane * laneWidth;
        const glow = context.createLinearGradient(0, down ? height : 0, 0, down ? 0 : height);
        glow.addColorStop(0, colors[lane] + (state.pressed.has(lane) ? "40" : "0c"));
        glow.addColorStop(1, colors[lane] + "00");
        context.fillStyle = glow;
        context.fillRect(x, 0, laneWidth, height);
        context.strokeStyle = "#ffffff12";
        context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke();
        state.flashes[lane] = Math.max(0, state.flashes[lane] - elapsed * 2.8);
        if (state.flashes[lane] > 0) {
          context.save(); context.globalAlpha = state.flashes[lane] * 0.5;
          context.fillStyle = colors[lane]; context.fillRect(x, target - 5, laneWidth, 10);
          context.strokeStyle = colors[lane]; context.lineWidth = 3;
          context.beginPath(); context.arc(x + laneWidth / 2, target, (1 - state.flashes[lane]) * laneWidth * 0.8 + 10, 0, Math.PI * 2); context.stroke(); context.restore();
        }
      }
      context.strokeStyle = "#ffffff09"; context.lineWidth = 1;
      for (let offset = -2; offset < 8; offset += 1) {
        const y = target + (down ? -1 : 1) * (offset * beat - state.time % beat) * travel;
        context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
      }
      context.strokeStyle = "#ebf7d5"; context.lineWidth = 2;
      context.beginPath(); context.moveTo(0, target); context.lineTo(width, target); context.stroke();
      for (const note of state.notes) {
        if (note.state === "done") continue;
        const y = note.state === "holding" ? target : target + (down ? -1 : 1) * (note.time - state.time) * travel;
        const tail = target + (down ? -1 : 1) * (note.time + note.duration - state.time) * travel;
        if (Math.max(y, tail) < -35 || Math.min(y, tail) > height + 35) continue;
        const radius = Math.min(38, (laneWidth - 14) / 2);
        const noteWidth = radius * 2;
        const x = (note.lane + 0.5) * laneWidth - radius;
        if (note.duration) {
          context.fillStyle = colors[note.lane] + (note.state === "holding" ? "88" : "35");
          context.fillRect(x + noteWidth * 0.2, Math.min(y, tail), noteWidth * 0.6, Math.max(0, Math.abs(tail - y)));
          context.strokeStyle = colors[note.lane]; context.lineWidth = 2;
          context.strokeRect(x + noteWidth * 0.2, Math.min(y, tail), noteWidth * 0.6, Math.max(0, Math.abs(tail - y)));
        }
        context.save(); context.shadowColor = colors[note.lane]; context.shadowBlur = note.state === "holding" ? 24 : 10;
        context.fillStyle = colors[note.lane]; context.beginPath(); context.arc(x + radius, y, radius, 0, Math.PI * 2); context.fill();
        context.strokeStyle = "#ffffffa0"; context.lineWidth = 2; context.stroke();
        context.fillStyle = "#ffffff45"; context.beginPath(); context.ellipse(x + radius * 0.65, y - radius * 0.48, radius * 0.32, radius * 0.16, -0.5, 0, Math.PI * 2); context.fill(); context.restore();
        context.fillStyle = "#122d25"; context.textAlign = "center";
        context.font = `700 ${Math.max(9, Math.min(14, (noteWidth - 8) / note.country.korean.length))}px "IBM Plex Sans KR", sans-serif`;
        context.fillText(note.country.korean, x + noteWidth / 2, y - 1, noteWidth - 8);
        context.font = '9px "JetBrains Mono", monospace';
        context.fillText(note.duration ? `${note.country.code} · HOLD` : note.country.code, x + noteWidth / 2, y + 13);
      }
      state.sparks = state.sparks.filter(spark => spark.life > 0);
      for (const spark of state.sparks) {
        spark.x += spark.vx * elapsed; spark.y += spark.vy * elapsed; spark.vy += elapsed * 160; spark.life -= elapsed * 1.8;
        if (reducedMotion) continue;
        context.globalAlpha = Math.max(0, spark.life); context.fillStyle = spark.color;
        context.fillRect(spark.x, spark.y, 3 + spark.life * 3, 3 + spark.life * 3);
      }
      context.globalAlpha = 1;
      if (state.judgment && now - state.judgmentAt < 750) {
        context.save(); context.textAlign = "center"; context.fillStyle = state.judgment === "MISS" ? "#ff9e9e" : "#efffaa";
        context.shadowColor = context.fillStyle; context.shadowBlur = reducedMotion ? 0 : 18;
        context.font = `800 ${Math.min(28, width / 15)}px "JetBrains Mono", monospace`;
        context.fillText(state.judgment, width / 2, height * 0.46);
        if (state.combo > 1) { context.font = '14px "JetBrains Mono", monospace'; context.fillText(`${state.combo} COMBO`, width / 2, height * 0.46 + 30); }
        context.restore();
      }
      if (now - published > 100 && state.phase === "playing") { publish(); published = now; }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    const keyDown = (event: KeyboardEvent) => {
      if (rebindingRef.current !== null) {
        event.preventDefault();
        if (event.repeat || event.isComposing) return;
        if (event.code === "Escape") { rebindingRef.current = null; setRebinding(null); setBindingHint("키 변경을 취소했어요."); return; }
        if (event.ctrlKey || event.metaKey || event.altKey || !validBinding(event.code)) { setBindingHint("문자·숫자·방향키·기호를 선택하세요. SPACE는 일시정지 전용이에요."); return; }
        const lane = rebindingRef.current;
        const next = [...settings.current.bindings];
        const duplicate = next.indexOf(event.code);
        if (duplicate >= 0 && duplicate !== lane) next[duplicate] = next[lane];
        next[lane] = event.code;
        settings.current.bindings = next;
        setBindings(next);
        rebindingRef.current = null; setRebinding(null);
        setBindingHint(duplicate >= 0 && duplicate !== lane ? "이미 사용 중인 키는 서로 교환했어요." : "키 설정을 저장했어요. 다음에도 유지됩니다.");
        return;
      }
      if ((event.target as HTMLElement)?.closest("button, input, select, textarea, a") || event.ctrlKey || event.metaKey || event.altKey) return;
      const lane = settings.current.bindings.indexOf(event.code);
      if (lane >= 0) { event.preventDefault(); if (!event.repeat) actions.current.press(lane, `key:${event.code}`); }
      if (event.code === "Space") { event.preventDefault(); if (!event.repeat) { if (game.current.phase === "playing") actions.current.pause(); else actions.current.start(); } }
    };
    const keyUp = (event: KeyboardEvent) => { actions.current.release(`key:${event.code}`); };
    const blur = () => { actions.current.pause(); game.current.sources.clear(); game.current.pressed.clear(); setPressed([false, false, false, false]); };
    const visibility = () => { if (document.hidden) blur(); };
    window.addEventListener("keydown", keyDown); window.addEventListener("keyup", keyUp); window.addEventListener("blur", blur); document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("keydown", keyDown); window.removeEventListener("keyup", keyUp); window.removeEventListener("blur", blur); document.removeEventListener("visibilitychange", visibility); if (musicRef.current) { musicRef.current.pause(); musicRef.current.onloadedmetadata = null; musicRef.current.onerror = null; musicRef.current.removeAttribute("src"); musicRef.current.load(); } if (musicUrlRef.current) URL.revokeObjectURL(musicUrlRef.current); void audioRef.current?.close(); audioRef.current = null; };
  }, []);

  const accuracy = hud.perfect + hud.good + hud.miss ? Math.round((hud.perfect + hud.good * 0.5) / (hud.perfect + hud.good + hud.miss) * 100) : 100;
  return (
    <main className="rhythm-room">
      <header className="rhythm-header"><Link to="/">← 게임 선택</Link><span>GEO PLAYROOM <i>/</i> 03</span><button onClick={() => setSound(!sound)} aria-pressed={sound}>♪ {sound ? "소리 켜짐" : "소리 꺼짐"}</button></header>
      <div className="rhythm-layout">
        <aside className="rhythm-settings">
          <p className="rhythm-eyebrow">COUNTRY RHYTHM · {bpm} BPM</p><h1>세계를<br />리듬으로.</h1><p className="rhythm-description">익숙한 나라 이름, 새로운 비트.<br />판정선에 닿는 순간을 잡아보세요.</p>
          <section className="rhythm-setting"><h2>01 <span>노트 방향</span></h2><div className="rhythm-toggle"><button aria-pressed={direction === "down"} onClick={() => setDirection("down")}>↓ 위에서 아래</button><button aria-pressed={direction === "up"} onClick={() => setDirection("up")}>↑ 아래에서 위</button></div></section>
          <section className="rhythm-setting"><h2>02 <span>플레이 속도</span></h2><div className="rhythm-speed"><button aria-label="속도 0.1배 감소" disabled={speed === 5} onClick={() => setSpeed(value => Math.max(5, value - 1))}>−</button><strong>{(speed / 10).toFixed(1)}<small>×</small></strong><button aria-label="속도 0.1배 증가" disabled={speed === 20} onClick={() => setSpeed(value => Math.min(20, value + 1))}>+</button></div><input aria-label="플레이 속도" type="range" min={5} max={20} step={1} value={speed} onChange={event => setSpeed(Number(event.target.value))} /><div className="rhythm-range-label"><span>0.5× SLOW</span><span>2.0× FAST</span></div></section>
          <section className="rhythm-setting rhythm-key-settings"><h2>03 <span>내 키 설정</span><button className="rhythm-key-reset" onClick={() => { pause(); game.current.sources.clear(); game.current.pressed.clear(); setPressed([false, false, false, false]); setBindings([...defaultBindings]); rebindingRef.current = null; setRebinding(null); setBindingHint("기본 키 D · F · J · K로 복원했어요."); }}>초기화</button></h2><div className="rhythm-key-buttons">{bindings.map((code, lane) => <button key={lane} className={rebinding === lane ? "is-listening" : ""} aria-label={`레인 ${lane + 1} 키 변경, 현재 ${keyLabel(code)}`} aria-pressed={rebinding === lane} onClick={() => { pause(); rebindingRef.current = lane; setRebinding(lane); setBindingHint(`${lane + 1}번 레인에 사용할 키를 누르세요. ESC로 취소.`); }}><small>{lane + 1}번</small><strong>{rebinding === lane ? "…" : keyLabel(code)}</strong></button>)}</div><p className="rhythm-key-hint" aria-live="polite">{bindingHint}</p><p className="rhythm-timing-hint">PERFECT ±110ms · GOOD ±230ms<br />롱노트 끝은 160ms 여유 있게!</p></section>
          <section className="rhythm-setting rhythm-song-settings"><h2>04 <span>음악 선택</span></h2><div className="rhythm-builtin-tracks">{rhythmSongs.map(track => <button key={track.id} type="button" aria-pressed={selectedTrack === track.id} disabled={musicLoading} onClick={() => selectBuiltin(track)}><span className="rhythm-track-icon">{selectedTrack === track.id ? "♫" : "▷"}</span><span><strong>{track.title}</strong><small>{track.subtitle}</small></span><span className="rhythm-track-meta">{track.bpm} BPM<small>{track.tag}</small></span></button>)}</div><p className="rhythm-song-caption">기본곡은 바로 선택! BPM과 박자 위치가 자동 설정됩니다.<br />클래식 2곡은 직접 만든 편곡, World Groove는 오리지널입니다.</p><label className="rhythm-song-upload">♫ {musicLoading ? "음악 불러오는 중…" : "음악 파일 선택"}<input type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.opus" disabled={musicLoading} onChange={event => { selectMusic(event.target.files?.[0]); event.target.value = ""; }} /></label><p className="rhythm-song-name">{song ? `${song.name} · ${Math.floor(song.duration / 60)}:${Math.floor(song.duration % 60).toString().padStart(2, "0")}` : "기본 아케이드 비트"}</p><div className="rhythm-song-fields"><label>BPM<input type="number" min={40} max={240} step={1} value={bpm} onChange={event => { resetSongSession(); setBpm(Math.max(40, Math.min(240, Number(event.target.value) || 100))); }} /></label><label>첫 박자 위치 (초)<input type="number" min={0} max={10} step={0.1} value={offset} disabled={!song} onChange={event => { resetSongSession(); setOffset(Math.max(0, Math.min(10, Number(event.target.value) || 0))); }} /></label></div>{song && <button className="rhythm-song-clear" onClick={clearMusic}>간단한 기본 비트로 돌아가기</button>}<p className="rhythm-key-hint">내 파일도 계속 사용할 수 있어요. 파일 선택 시 BPM과 첫 박자를 직접 맞춰 주세요. 자동 비트 분석이나 곡 공유는 지원하지 않습니다.</p>{musicError && <p className="rhythm-song-error" role="alert">{musicError}</p>}</section>
          <p className="rhythm-live-note"><span /> 방향과 속도는 플레이 중에도 변경 가능</p>
        </aside>
        <section className="rhythm-machine" aria-label="나라 리듬게임 플레이 영역">
          <div className="rhythm-machine-top"><span><i /> {phase === "playing" ? "ON AIR" : "READY TO PLAY"}</span><span>{game.current.notes.length} NOTES / 4 LANES</span></div>
          <div className="rhythm-track"><canvas ref={canvasRef} aria-label={`나라 이름 노트. ${bindings.map(keyLabel).join(", ")} 또는 아래 터치 버튼으로 연주하세요.`} />
            {phase !== "playing" && <div className="rhythm-overlay"><p>{phase === "finished" ? "SESSION COMPLETE" : phase === "paused" ? "TAKE A BREATH" : "YOUR WORLD, YOUR BEAT"}</p><h2>{phase === "finished" ? "멋진 여행이었어요!" : phase === "paused" ? "잠시 쉬어가기" : "준비됐나요?"}</h2><span>{phase === "finished" ? `${hud.score.toLocaleString()}점 · 정확도 ${accuracy}% · 최대 ${hud.best}콤보` : `${bindings.map(keyLabel).join(" · ")}로 비트를 맞춰요. 긴 노트는 꾹!`}</span><button onClick={start} disabled={musicLoading}>{phase === "finished" ? "↻ 다시 플레이" : phase === "paused" ? "▶ 이어서 플레이" : "▶ 리듬 시작"}</button><small>SPACE로 시작 / 일시정지</small></div>}
          </div>
          <div className="rhythm-pads">{bindings.map((code, lane) => <button key={lane} className={`rhythm-pad rhythm-lane-${lane} ${pressed[lane] ? "is-pressed" : ""}`} aria-label={`${keyLabel(code)} 레인 누르기. 롱노트는 길게 누르세요.`} onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); press(lane, `pointer:${event.pointerId}`); }} onPointerUp={event => release(`pointer:${event.pointerId}`)} onPointerCancel={event => release(`pointer:${event.pointerId}`)} onLostPointerCapture={event => release(`pointer:${event.pointerId}`)}><span>{keyLabel(code)}</span><small>TAP / HOLD</small></button>)}</div>
          <div className="rhythm-transport"><span>{Math.round(hud.progress * 100)}% <i>WORLD TOUR</i></span><button onClick={phase === "playing" ? pause : start}>{phase === "playing" ? "Ⅱ 일시정지" : phase === "paused" ? "▶ 이어하기" : "▶ 시작"}</button></div><div className="rhythm-progress"><span style={{ width: `${hud.progress * 100}%` }} /></div>
        </section>
        <aside className="rhythm-results"><section className="rhythm-score"><p className="rhythm-eyebrow">LIVE SCORE</p><strong>{hud.score.toLocaleString().padStart(6, "0")}</strong><div><span>정확도 <b>{accuracy}%</b></span><span>최대 콤보 <b>{hud.best}</b></span></div></section><section className="rhythm-combo"><span>CURRENT COMBO</span><strong>{hud.combo.toString().padStart(2, "0")}</strong><p>한 박자씩, 더 멀리.</p></section><div className="rhythm-judgments"><p><span>✦ PERFECT</span><b>{hud.perfect}</b></p><p><span>◆ GOOD</span><b>{hud.good}</b></p><p><span>· MISS</span><b>{hud.miss}</b></p></div><section className="rhythm-how"><h2>손끝으로 떠나는 여행</h2><p><b>짧은 노트</b> 판정선에 닿으면 톡!</p><p><b>롱노트</b> 끝까지 누르고 있어요.</p><p><b>모바일</b> 아래 네 패드를 터치해요.</p><span>♪ 비트와 타격음이 함께 재생됩니다.</span></section></aside>
      </div><footer className="rhythm-footer"><span>COUNTRIES FROM COUNTRY TYPING</span><span>작은 타이밍이 만드는 큰 즐거움.</span></footer>
    </main>
  );
}
