import { ChangeEvent, lazy, memo, PointerEvent, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createHashRouter, Link, RouterProvider } from "react-router";
import Matter from "matter-js";
import Rankings from "./Rankings";
import { additionalCountries, countryDataAttribution } from "./countries";

const RhythmGame = lazy(() => import("./RhythmGame"));
const rhythmLoading = <div role="status" className="grid min-h-screen place-items-center bg-[#17342f] text-white">리듬게임 준비 중…</div>;

type Country = { code: string; korean: string; english: string; lat: number; lng: number; zoom: number };

const lesson: Country[] = [
  { code: "JPN", korean: "일본", english: "Japan", lat: 36.2, lng: 138.25, zoom: 4 },
  { code: "VNM", korean: "베트남", english: "Vietnam", lat: 16.05, lng: 108.2, zoom: 5 },
  { code: "EGY", korean: "이집트", english: "Egypt", lat: 26.82, lng: 30.8, zoom: 5 },
  { code: "BRA", korean: "브라질", english: "Brazil", lat: -10.33, lng: -53.2, zoom: 4 },
  { code: "AUS", korean: "오스트레일리아", english: "Australia", lat: -25.27, lng: 133.78, zoom: 4 },
  { code: "CAN", korean: "캐나다", english: "Canada", lat: 56.13, lng: -106.35, zoom: 3 },
  { code: "GHA", korean: "가나", english: "Ghana", lat: 7.95, lng: -1.02, zoom: 6 },
  { code: "NGA", korean: "나이지리아", english: "Nigeria", lat: 9.08, lng: 8.67, zoom: 5 },
  { code: "ZAF", korean: "남아프리카 공화국", english: "South Africa", lat: -30.56, lng: 22.94, zoom: 5 },
  { code: "NLD", korean: "네덜란드", english: "Netherlands", lat: 52.13, lng: 5.29, zoom: 6 },
  { code: "NOR", korean: "노르웨이", english: "Norway", lat: 60.47, lng: 8.47, zoom: 5 },
  { code: "NZL", korean: "뉴질랜드", english: "New Zealand", lat: -40.9, lng: 174.89, zoom: 5 },
  { code: "TWN", korean: "대만", english: "Taiwan", lat: 23.7, lng: 121, zoom: 6 },
  { code: "DEU", korean: "독일", english: "Germany", lat: 51.17, lng: 10.45, zoom: 5 },
  { code: "TLS", korean: "동티모르", english: "Timor-Leste", lat: -8.87, lng: 125.73, zoom: 7 },
  { code: "RUS", korean: "러시아", english: "Russia", lat: 61.52, lng: 105.32, zoom: 3 },
  { code: "LBN", korean: "레바논", english: "Lebanon", lat: 33.85, lng: 35.86, zoom: 7 },
  { code: "MEX", korean: "멕시코", english: "Mexico", lat: 23.63, lng: -102.55, zoom: 5 },
  { code: "MNG", korean: "몽골", english: "Mongolia", lat: 46.86, lng: 103.85, zoom: 4 },
  { code: "USA", korean: "미국", english: "United States", lat: 37.09, lng: -95.71, zoom: 4 },
  { code: "BGD", korean: "방글라데시", english: "Bangladesh", lat: 23.68, lng: 90.36, zoom: 7 },
  { code: "BEL", korean: "벨기에", english: "Belgium", lat: 50.5, lng: 4.47, zoom: 7 },
  { code: "SAU", korean: "사우디아라비아", english: "Saudi Arabia", lat: 23.89, lng: 45.08, zoom: 5 },
  { code: "SDN", korean: "수단", english: "Sudan", lat: 12.86, lng: 30.22, zoom: 5 },
  { code: "CHE", korean: "스위스", english: "Switzerland", lat: 46.82, lng: 8.23, zoom: 7 },
  { code: "SWE", korean: "스웨덴", english: "Sweden", lat: 60.13, lng: 18.64, zoom: 5 },
  { code: "ESP", korean: "스페인", english: "Spain", lat: 40.46, lng: -3.75, zoom: 6 },
  { code: "SGP", korean: "싱가포르", english: "Singapore", lat: 1.35, lng: 103.82, zoom: 10 },
  { code: "ARE", korean: "아랍에미리트", english: "United Arab Emirates", lat: 23.42, lng: 53.85, zoom: 6 },
  { code: "ARG", korean: "아르헨티나", english: "Argentina", lat: -38.42, lng: -63.62, zoom: 4 },
  { code: "ISL", korean: "아이슬란드", english: "Iceland", lat: 64.96, lng: -19.02, zoom: 5 },
  { code: "IRL", korean: "아일랜드", english: "Ireland", lat: 53.41, lng: -8.24, zoom: 6 },
  { code: "DZA", korean: "알제리", english: "Algeria", lat: 28.03, lng: 1.66, zoom: 4 },
  { code: "ETH", korean: "에티오피아", english: "Ethiopia", lat: 9.15, lng: 40.49, zoom: 5 },
  { code: "GBR", korean: "영국", english: "United Kingdom", lat: 55.38, lng: -3.44, zoom: 5 },
  { code: "UKR", korean: "우크라이나", english: "Ukraine", lat: 48.38, lng: 31.17, zoom: 5 },
  { code: "ITA", korean: "이탈리아", english: "Italy", lat: 41.87, lng: 12.57, zoom: 6 },
  { code: "IND", korean: "인도", english: "India", lat: 20.59, lng: 78.96, zoom: 4 },
  { code: "IDN", korean: "인도네시아", english: "Indonesia", lat: -0.79, lng: 113.92, zoom: 4 },
  { code: "CHN", korean: "중국", english: "China", lat: 35.86, lng: 104.2, zoom: 4 },
  { code: "CHL", korean: "칠레", english: "Chile", lat: -35.68, lng: -71.54, zoom: 4 },
  { code: "KAZ", korean: "카자흐스탄", english: "Kazakhstan", lat: 48.02, lng: 66.92, zoom: 4 },
  { code: "QAT", korean: "카타르", english: "Qatar", lat: 25.35, lng: 51.18, zoom: 8 },
  { code: "KHM", korean: "캄보디아", english: "Cambodia", lat: 12.57, lng: 104.99, zoom: 6 },
  { code: "KEN", korean: "케냐", english: "Kenya", lat: -0.02, lng: 37.91, zoom: 5 },
  { code: "CRI", korean: "코스타리카", english: "Costa Rica", lat: 9.75, lng: -83.75, zoom: 7 },
  { code: "TUV", korean: "투발루", english: "Tuvalu", lat: -7.11, lng: 177.65, zoom: 8 },
  { code: "TUR", korean: "튀르키예", english: "Türkiye", lat: 38.96, lng: 35.24, zoom: 5 },
  { code: "PAK", korean: "파키스탄", english: "Pakistan", lat: 30.38, lng: 69.35, zoom: 5 },
  { code: "PER", korean: "페루", english: "Peru", lat: -9.19, lng: -75.02, zoom: 5 },
  { code: "FRA", korean: "프랑스", english: "France", lat: 46.23, lng: 2.21, zoom: 6 },
  { code: "FIN", korean: "핀란드", english: "Finland", lat: 61.92, lng: 25.75, zoom: 5 },
  { code: "PHL", korean: "필리핀", english: "Philippines", lat: 12.88, lng: 121.77, zoom: 5 },
];

const typingLesson: Country[] = [...lesson, ...additionalCountries];

function shuffleCountries(previousLast?: string): Country[] {
  const shuffled = [...typingLesson];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  if (shuffled.length > 1 && shuffled[0].code === previousLast) {
    const swapIndex = 1 + Math.floor(Math.random() * (shuffled.length - 1));
    [shuffled[0], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[0]];
  }
  return shuffled;
}

function storedSetting(key: string, fallback: string) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function evaluateTyping(previous: string, value: string, target: string) {
  let prefix = 0;
  while (prefix < previous.length && prefix < value.length && previous[prefix] === value[prefix]) prefix += 1;
  let matched = 0;
  let wrong = 0;
  for (let position = prefix; position < value.length; position += 1) {
    if (value[position] === target[position]) matched += 1;
    else wrong += 1;
  }
  return { matched, wrong };
}

const mapUrl = (country: Country, isFixed: boolean, mapMode: "map" | "satellite") => {
  const zoom = isFixed ? 2 : Math.min(country.zoom + 1, 10);
  return `https://maps.google.com/maps?q=${country.lat},${country.lng}&z=${zoom}&t=${mapMode === "satellite" ? "k" : "m"}&output=embed&hl=ko`;
};

const CountryMapFrame = memo(function CountryMapFrame({ country, active, isFixedMap, mapMode }: {
  country: Country;
  active: boolean;
  isFixedMap: boolean;
  mapMode: "map" | "satellite";
}) {
  const [loaded, setLoaded] = useState(false);
  return <>
    <iframe src={mapUrl(country, isFixedMap, mapMode)} title={`${country.korean} 위치 지도`} onLoad={() => setLoaded(true)} aria-hidden={!active} tabIndex={active ? 0 : -1} className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ease-out ${active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"}`} loading="eager" />
    {active && !loaded && <div className="pointer-events-none absolute left-1/2 top-5 z-20 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#5d6e5f] shadow-sm">지도 불러오는 중</div>}
  </>;
});

const MapFrames = memo(function MapFrames({
  current,
  next,
  isFixedMap,
  mapMode,
}: {
  current: Country;
  next: Country;
  isFixedMap: boolean;
  mapMode: "map" | "satellite";
}) {
  const visibleCountries = [current, next];
  return (
    <>
      {visibleCountries.map((country) => (
        <CountryMapFrame
          key={`${country.code}-${isFixedMap}-${mapMode}`}
          country={country}
          active={country.code === current.code}
          isFixedMap={isFixedMap}
          mapMode={mapMode}
        />
      ))}
    </>
  );
});

function CountryTyping() {
  const [rankOpen, setRankOpen] = useState(false);
  const [challenge, setChallenge] = useState(false);
  const startedAt = useRef(0);
  const [completionMs, setCompletionMs] = useState<number>();
  const [typingRunId, setTypingRunId] = useState(() => crypto.randomUUID());
  const [rankLanguage, setRankLanguage] = useState<"ko" | "en">("ko");

  const [session, setSession] = useState(() => {
    const order = shuffleCountries();
    return { order, upcoming: shuffleCountries(order.at(-1)!.code), index: 0 };
  });
  const index = session.index;
  const [isFixedMap, setIsFixedMap] = useState(true);
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [displayInput, setDisplayInput] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [matchedCharacters, setMatchedCharacters] = useState(0);
  const [theme, setTheme] = useState(() => storedSetting("geo-typing-theme", "dark") === "dark" ? "dark" : "light");
  const [mapMode, setMapMode] = useState<"map" | "satellite">(() => storedSetting("geo-typing-map", "map") === "satellite" ? "satellite" : "map");
  const [inputEpoch, setInputEpoch] = useState(0);
  const finished = challenge && completionMs !== undefined;
  const composing = useRef(false);
  const committedInput = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);
  const advancing = useRef(false);
  const audioContext = useRef<AudioContext | null>(null);
  const current = session.order[index];
  const next = index + 1 < session.order.length ? session.order[index + 1] : session.upcoming[0];
  const target = language === "ko" ? current.korean : current.english;
  useEffect(() => {
    try { localStorage.setItem("geo-typing-theme", theme); localStorage.setItem("geo-typing-map", mapMode); } catch {}
  }, [theme, mapMode]);
  useEffect(() => () => { void audioContext.current?.close(); }, []);

  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => setElapsed(value => challenge ? Math.floor((performance.now() - startedAt.current) / 1000) : value + 1), challenge ? 100 : 1000);
    return () => window.clearInterval(timer);
  }, [challenge, finished]);

  const resetInput = useCallback(() => {
    advancing.current = false;
    composing.current = false;
    committedInput.current = "";
    setDisplayInput("");
    setInputEpoch(value => value + 1);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  useEffect(() => { inputRef.current?.focus(); }, [inputEpoch]);

  useEffect(() => {
    resetInput();
  }, [current.code, language, resetInput]);

  const getAudio = () => {
    if (!audioContext.current) audioContext.current = new AudioContext();
    return audioContext.current;
  };

  const playKeySound = () => {
    try {
      const context = getAudio();
      const strike = () => {
        const now = context.currentTime;
        const oscillator = context.createOscillator();
        const body = context.createGain();
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(180, now);
        oscillator.frequency.exponentialRampToValueAtTime(90, now + 0.045);
        body.gain.setValueAtTime(0.048, now);
        body.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
        oscillator.connect(body).connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.06);
      };
      if (context.state === "suspended") void context.resume().then(strike);
      else strike();
    } catch (e) {}
  };

  const playSuccessSound = () => {
    try {
      const context = getAudio();
      const chime = () =>
        [523.25, 659.25].forEach((frequency, note) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const start = context.currentTime + note * 0.075;
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(frequency, start);
          gain.gain.setValueAtTime(0.028, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
          oscillator.connect(gain).connect(context.destination);
          oscillator.start(start);
          oscillator.stop(start + 0.24);
        });
      if (context.state === "suspended") void context.resume().then(chime);
      else chime();
    } catch (e) {}
  };

  const advance = () => {
    if (advancing.current) return;
    advancing.current = true;
    playSuccessSound();
    setCorrect((value) => value + 1);
    if (challenge && index === session.order.length - 1) {
      const duration = Math.max(1, Math.round(performance.now() - startedAt.current));
      setCompletionMs(duration);
      setElapsed(duration / 1000);
      return;
    }
    setSession(value => value.index + 1 < value.order.length
      ? { ...value, index: value.index + 1 }
      : { order: value.upcoming, upcoming: shuffleCountries(value.upcoming.at(-1)!.code), index: 0 });
  };

  const commitInput = (value: string) => {
    if (finished || advancing.current || value === committedInput.current) return;
    const result = evaluateTyping(committedInput.current, value, target);
    committedInput.current = value;
    setMatchedCharacters(total => total + result.matched);
    setErrors(total => total + result.wrong);
    if (result.matched + result.wrong > 0) playKeySound();
    if (value === target) advance();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget !== inputRef.current || advancing.current) return;
    const value = event.currentTarget.value;
    setDisplayInput(value);
    if (!composing.current && !(event.nativeEvent as InputEvent).isComposing) commitInput(value);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const accuracy = matchedCharacters + errors === 0 ? 100 : Math.round((matchedCharacters / (matchedCharacters + errors)) * 100);
  const typedPerMinute = useMemo(
    () => (elapsed ? Math.round((matchedCharacters / elapsed) * 60) : 0),
    [matchedCharacters, elapsed]
  );
  const time = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(Math.floor(elapsed % 60)).padStart(2, "0")}`;

  return (
    <main data-theme={theme} className="typing-room flex min-h-screen flex-col overflow-hidden">
      {rankOpen && <Rankings recordId={typingRunId} game={`typing-${challenge ? rankLanguage : language}`} score={finished ? correct : undefined} durationMs={finished ? completionMs : undefined} accuracy={accuracy} onClose={() => setRankOpen(false)} />}
      <header className="typing-header flex min-h-16 shrink-0 items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#3b9d44] text-sm font-black text-white">
            T
          </Link>
          <div>
            <p className="text-sm font-bold">Country Typing</p>
            <p className="text-[10px] font-medium text-[#809080]">세계시민과 지리 · 나라 이름 연습</p>
          </div>
        </div>
        <div className="typing-rank-controls"><button type="button" onClick={() => setRankOpen(true)}>랭킹</button><button type="button" onClick={() => {
          if (challenge && !finished && !window.confirm("진행 중인 도전을 다시 시작할까요?")) return;
          startedAt.current = performance.now(); setCompletionMs(undefined); setTypingRunId(crypto.randomUUID());
          setRankLanguage(language); setChallenge(true); setElapsed(0); setCorrect(0); setErrors(0); setMatchedCharacters(0); resetInput();
          const order = shuffleCountries(); setSession({ order, upcoming: shuffleCountries(order.at(-1)!.code), index: 0 });
        }}>197개국 완주 도전</button></div>
        <div className="typing-theme" role="group" aria-label="화면 테마"><button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>☀ 화이트</button><button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>☾ 다크</button></div>
        <p className="hidden font-mono text-[11px] text-[#778778] sm:block">LESSON 01 / WORLD MAP</p>
      </header>
      <section className="relative flex min-h-0 flex-1 flex-col">
        <div className="typing-progress flex items-center justify-between px-5 py-3 sm:px-10">
          <p className="text-sm font-semibold text-[#3b9d44]">
            {String(index + 1).padStart(2, "0")}{" "}
            <span className="font-normal text-[#95a295]">/ {typingLesson.length} 국가·지역 · 무작위</span>
          </p>
          <p className="text-xs text-[#748174]">입력창을 터치하여 키보드를 여세요.</p>
        </div>
        <div className="typing-map relative z-0 h-[35vh] min-h-[220px] shrink-0 overflow-hidden sm:h-[48vh] sm:min-h-[340px]">
          <MapFrames current={current} next={next} isFixedMap={isFixedMap} mapMode={mapMode} />
          <div className="map-mode" role="group" aria-label="지도 보기 방식"><button type="button" aria-pressed={mapMode === "map"} onClick={() => setMapMode("map")}>◎ 지도</button><button type="button" aria-pressed={mapMode === "satellite"} onClick={() => setMapMode("satellite")}>◈ 위성</button><span>{current.code} · {current.lat.toFixed(1)}° / {current.lng.toFixed(1)}°</span></div>
          <div className="pointer-events-none absolute bottom-5 left-1/2 z-30 hidden -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-[11px] font-semibold text-[#5d6e5f] shadow-lg sm:block">
            지도에서 나라의 윤곽과 주변 지역을 살펴보세요
          </div>
          <div className="absolute right-3 top-3 z-30 flex max-w-[calc(100%-24px)] flex-wrap justify-end gap-2 sm:right-10 sm:top-5">
            <button
              onClick={() => setIsFixedMap((value) => !value)}
              className="rounded-full bg-[#17231a] px-3 py-1.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-[#2c3e2e]"
            >
              {isFixedMap ? "🔍 상세 확대" : "🗺️ 넓은 지도"}
            </button>
            <div className="flex rounded-full bg-white p-0.5 shadow-md">
              <button
                disabled={challenge && !finished} onClick={() => { setChallenge(false); setLanguage("ko"); }}
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${language === "ko" ? "bg-[#3b9d44] text-white" : "text-[#607160]"}`}
              >
                한국어
              </button>
              <button
                disabled={challenge && !finished} onClick={() => { setChallenge(false); setLanguage("en"); }}
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${language === "en" ? "bg-[#3b9d44] text-white" : "text-[#607160]"}`}
              >
                English
              </button>
            </div>
            <button
              onClick={resetInput}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#4a5b4c] shadow-sm transition hover:bg-gray-50"
            >
              다시 입력
            </button>
          </div>
        </div>
        <div className="typing-deck relative z-50 shrink-0 px-4 pb-6 pt-0 sm:px-8">
          <div className="typing-stats mx-auto -mt-6 grid max-w-2xl grid-cols-4 overflow-hidden rounded-2xl">
            {[
              { label: "시간", value: time },
              { label: "분당 타수", value: typedPerMinute },
              { label: "정확도", value: `${accuracy}%` },
              { label: "정답", value: correct },
            ].map((stat) => (
              <div key={stat.label} className="border-r border-[#d8e3d7] px-1 py-2.5 text-center last:border-r-0 sm:py-3.5">
                <p className="text-[10px] font-bold tracking-tight text-[#526c55] sm:text-xs">{stat.label}</p>
                <p className="mt-0.5 text-sm font-extrabold tabular-nums text-[#19351d] sm:text-lg">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-4 max-w-3xl text-center sm:mt-5">
            <div className="typing-prompt py-2 sm:py-3" onClick={focusInput}>
              <p className="typing-eyebrow">EXPLORE THE WORLD · {current.code}</p>
              <p className="typing-target text-2xl font-bold tracking-[.1em] sm:text-5xl sm:tracking-[.15em]">{target}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5 text-xl font-bold sm:mt-3 sm:gap-2 sm:text-3xl">
                {Array.from(target).map((char, charIndex) => (
                  <span
                    key={`${char}-${charIndex}`}
                    className={`typing-character grid h-8 min-w-8 place-items-center rounded-lg sm:h-10 sm:min-w-10 ${
                      displayInput[charIndex] === char
                        ? "is-correct"
                        : displayInput[charIndex]
                        ? "is-pending"
                        : "is-empty"
                    }`}
                  >
                    {displayInput[charIndex] || char}
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] font-medium tracking-wide text-[#829082] sm:mt-2 sm:text-xs">{current.english}</p>
            </div>
            <div className="mt-4 flex justify-center">
              <input
                key={`${index}-${language}-${inputEpoch}`}
                ref={inputRef}
                disabled={finished}
                type="text"
                onChange={handleChange}
                aria-label={`${target} 나라 이름 입력`}
                onCompositionStart={() => { composing.current = true; }}
                onCompositionEnd={event => {
                  if (event.currentTarget !== inputRef.current || advancing.current) return;
                  composing.current = false;
                  const value = event.currentTarget.value;
                  setDisplayInput(value);
                  commitInput(value);
                }}
                placeholder="여기를 터치하여 타자 입력"
                className="typing-input w-full max-w-md rounded-xl px-4 py-3 text-center text-base font-bold focus:outline-none"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>
            {challenge && <p className="typing-caption" role="status">{finished ? `197개국 완주 · ${(completionMs! / 1000).toFixed(3)}초 · 정확도 ${accuracy}%` : `197개국 완주 도전 · ${correct} / 197 완료 · 도전 중 언어 변경 불가`}{finished && <button type="button" className="rank-action" onClick={() => setRankOpen(true)}>완주 기록 등록</button>}</p>}
            <p className="typing-caption">{typingLesson.length}개 국가·지역을 한 바퀴 동안 중복 없이 무작위로 연습해요 · 지도 모드는 유지돼요<br />한글은 조합이 끝난 글자만 채점해요 · <a href={countryDataAttribution.source} target="_blank" rel="noreferrer">국가 데이터: mledoze/countries</a> · <a href={countryDataAttribution.license} target="_blank" rel="noreferrer">ODbL</a></p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Launcher() {
  return (
    <main className="playroom-home">
      <div className="home-container">
        <header className="home-header">
          <a href="#" className="home-wordmark" aria-label="Geo Playroom 홈">Geo<span>Playroom</span><sup>↗</sup></a>
          <nav className="home-nav" aria-label="홈 탐색">
            <a href="#games">게임 둘러보기</a>
            <a href="#learn">학습 가이드</a>
          </nav>
          <span className="home-edition">2022 개정 교육과정</span>
        </header>
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <p className="home-eyebrow"><span /> A SMALL PLAYROOM. A BIG WORLD.</p>
            <h1 id="home-title">세계 여행,<br /><span>플레이로 시작.</span></h1>
            <p className="home-intro">외우는 세계에서, 경험하는 세계로.<br />나라를 입력하고, 기후를 합치고, 리듬을 타며<br className="home-desktop-break" /> 나만의 지리 감각을 키워보세요.</p>
            <div className="home-hero-actions"><a href="#games" className="home-primary-link">나의 첫 게임 고르기 <span aria-hidden="true">↘</span></a><span className="home-quick-note">설치 없이, 바로 플레이</span></div>
          </div>
          <aside className="home-pass" aria-label="세 가지 세계 여행">
            <div className="home-pass-top"><span>GEO / LEARNING PASS</span><span>OPEN TO EVERYONE ↗</span></div>
            <div className="home-pass-heading"><p>호기심만 챙겨 오세요.</p><strong>WORLD<br />PLAY PASS<span>03</span></strong></div>
            <div className="home-pass-routes">
              <Link to="/typing" className="home-pass-route home-pass-type"><span>01</span><div><b>TYPE THE WORLD</b><small>지도에서 나라를 만나다</small></div><span aria-hidden="true">↗</span></Link>
              <Link to="/climate" className="home-pass-route home-pass-climate"><span>02</span><div><b>MERGE THE CLIMATE</b><small>기후가 모여 지구가 되다</small></div><span aria-hidden="true">↗</span></Link>
              <Link to="/rhythm" className="home-pass-route home-pass-rhythm"><span>03</span><div><b>FEEL THE RHYTHM</b><small>나라 이름에 박자를 더하다</small></div><span aria-hidden="true">↗</span></Link>
            </div>
            <div className="home-pass-bottom"><span>DESTINATION: YOUR WORLD</span><span>✦</span></div>
          </aside>
        </section>
        <section id="games" className="home-games-heading" aria-labelledby="games-title">
          <div><p className="home-eyebrow">CHOOSE YOUR NEXT DESTINATION</p><h2 id="games-title">오늘은 어떤 세계로 떠날까요?</h2></div><span className="home-section-count">01 — 03 / GAMES</span>
        </section>
        <section className="game-selection home-game-grid grid gap-5 lg:grid-cols-3" aria-label="게임 선택">
          <Link
            to="/typing"
            className="game-card game-card--typing"
          >
            <p className="game-card-label">01 · COUNTRY TYPING</p>
            <h2 className="game-card-title">
              나라 이름
              <br />
              타자연습
            </h2>
            <p className="game-card-description">지도를 따라 세계 여행. 한글과 영어로 나라 이름을 손끝에 익혀요.</p>
            <span className="game-card-arrow" aria-hidden="true">⌨︎ →</span>
          </Link>
          <Link
            to="/climate"
            className="game-card game-card--climate"
          >
            <p className="game-card-label">02 · CLIMATE MERGE</p>
            <h2 className="game-card-title">기후 수박게임</h2>
            <p className="game-card-description">작은 기후에서 하나의 지구로. 같은 기후를 합치며 세계를 배워요.</p>
            <span className="game-card-arrow" aria-hidden="true">☀︎ →</span>
          </Link>
          <Link to="/rhythm" className="game-card">
            <p className="game-card-label">03 · COUNTRY RHYTHM</p>
            <h2 className="game-card-title">나라 리듬게임</h2>
            <p className="game-card-description">비트를 따라 세계 여행. 롱노트와 함께 손끝으로 연주해요.</p>
            <span className="game-card-arrow" aria-hidden="true">♫ →</span>
          </Link>
        </section>
        <section id="learn" className="home-learning" aria-labelledby="learn-title">
          <div className="home-learning-title"><p className="home-eyebrow">PLAY A LITTLE. LEARN A LOT.</p><h2 id="learn-title">게임 한 판이,<br />세계와 가까워지는 시간.</h2><p>2022 개정 「세계시민과 지리」 학습을<br />손끝으로 가볍게 시작해보세요.</p></div>
          <div className="home-learning-steps">
            <article><span>01 / OBSERVE</span><h3>보고, 위치를 익히고</h3><p>지도에서 나라의 위치를 확인하고 이름을 입력하며 세계의 공간을 익혀요.</p></article>
            <article><span>02 / CONNECT</span><h3>합치고, 관계를 찾고</h3><p>기후 조각의 변화를 살펴보며 쾨펜 기후 분류를 놀이로 접해요.</p></article>
            <article><span>03 / REPEAT</span><h3>반복하며, 친숙해지고</h3><p>나라 이름이 담긴 노트를 리듬에 맞춰 누르며 즐겁게 반복해요.</p></article>
          </div>
        </section>
        <footer className="home-footer"><div className="home-footer-brand">Geo Playroom<span>세계를 배우는 작은 놀이방.</span></div><p>WORLD · WEATHER · WORDS</p><a href="#home-title">위로 돌아가기 ↑</a></footer>
      </div>
    </main>
  );
}

type Primary = "A" | "B" | "C" | "D" | "E";
type ClimatePiece = { id: number; key: string; parts: Primary[]; x: number; y: number; angle: number };
type ClimateBody = Matter.Body & { climateKey?: string; climateParts?: Primary[]; popped?: boolean; bornAt?: number; spilled?: boolean };
type ClimateNode = { code: string; name: string; icon: string; color: string; size: number; next?: string };

const climateChain = ["Aw", "Am", "Af", "BS", "BW", "Cfb", "Cfa", "Df", "Dw", "Ds", "ET", "EF", "Earth"];
const randomClimateKey = () => climateChain[Math.floor(Math.random() * 3)];
const createClimateQueue = () => Array.from({ length: 4 }, randomClimateKey);
const climateNames = ["열대 사바나", "열대 몬순", "열대 우림", "스텝", "사막", "서안 해양성", "온난 습윤", "냉대 습윤", "냉대 겨울 건조", "냉대 여름 건조", "툰드라", "빙설", "지구"];
const climateColors = ["#e7b94e", "#ee8960", "#61ad71", "#d6a85d", "#dfb53e", "#66a879", "#499861", "#789cc7", "#5d82b3", "#6c8cb8", "#a9d5dc", "#d1ebee", "#4e92c6"];
const climateNodes: Record<string, ClimateNode> = Object.fromEntries(climateChain.map((code, index) => [code, {
  code, name: climateNames[index], icon: "", color: climateColors[index], size: 62 + index * 13,
  next: climateChain[index + 1],
}]));
function nodeFor(key: string): ClimateNode { return climateNodes[key]; }

function comboReward(count: number) {
  const labels = ["Good!", "Great!", "Perfect!", "Excellent!", "Marvelous!!"];
  const multiplier = Math.max(1, count - 4);
  return { label: `${labels[Math.min(count, 5) - 1]}${count > 5 ? ` ×${multiplier}` : ""}`, points: count <= 5 ? count * 10 : 50 * multiplier };
}

function ClimateAtlas({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialogRef.current?.showModal(); }, []);
  return <dialog ref={dialogRef} onCancel={onClose} className="climate-atlas" aria-labelledby="atlas-title">
    <header><div><p>CLIMATE EVOLUTION</p><h2 id="atlas-title">13단계 기후 합성 지도</h2></div><button autoFocus onClick={onClose}>닫기 ×</button></header>
    <p className="atlas-intro">같은 공 두 개만 합쳐집니다. 다른 기후 공은 합쳐지지 않으며, Earth는 마지막 단계입니다.</p>
    <ol className="climate-evolution">{climateChain.map((key, index) => <li key={key}><b>{String(index + 1).padStart(2, "0")} · {key}</b><span>{nodeFor(key).name}</span><small>{index < 12 ? `${key} + ${key} → ${climateChain[index + 1]}` : "지구 완성 · +10,000점"}</small></li>)}</ol>
    <p className="atlas-note">이 순서는 게임용 합성 규칙이며 실제 기후의 변화 순서를 뜻하지 않습니다.</p>
  </dialog>;
}

function ClimateHelp({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialogRef.current?.showModal(); }, []);
  return <dialog ref={dialogRef} onCancel={onClose} className="climate-atlas climate-help" aria-labelledby="help-title">
    <header><div><p>HOW TO PLAY</p><h2 id="help-title">작은 기후에서, 지구까지.</h2></div><button autoFocus type="button" onClick={onClose}>닫기 ×</button></header>
    <div className="help-steps">
      <section><span>01</span><div><h3>위치를 고르고 톡!</h3><p>바구니 안을 누르면 기후 공이 떨어져요. 처음 세 단계인 Aw·Am·Af 중 하나가 무작위로 나와요.</p></div></section>
      <section><span>02</span><div><h3>같은 공을 만나게 해주세요</h3><p>같은 세부 기후 공 2개가 만나면 다음 단계로 진화해요. Aw부터 EF까지 순서대로 합쳐 마지막 Earth를 만드세요. 서로 다른 공은 합쳐지지 않아요. 전체 경로는 ‘합성 지도’에서 확인하세요.</p></div></section>
      <section><span>03</span><div><h3>연쇄 합성으로 콤보!</h3><p>방금 만들어진 공이 <b>1.75초 안에 다시 합성</b>되면 콤보가 이어져요. 새 공을 떨어뜨리거나, 다른 공끼리 합성되거나, 시간이 지나면 콤보가 끊겨요.</p><p className="help-score">Good! 10점 → Great! 20점 → Perfect! 30점 → Excellent! 40점 → Marvelous!! 50점</p><p>그 다음은 Marvelous!! ×2 = 100점, ×3 = 150점… 지구 완성은 <b>10,000점</b>이에요.</p></div></section>
      <section><span>04</span><div><h3>넘치기 전에 공간을 만들어요</h3><p>공이 바구니 위로 넘쳐 바깥 바닥에 떨어지면 게임 오버! 옆벽에 닿는 것만으로 끝나지는 않아요. ‘♪ 소리’ 버튼으로 효과음을 켜거나 끌 수 있어요.</p></div></section>
    </div><p className="atlas-note">설명을 읽는 동안 게임은 일시정지돼요. 합성 순서는 학습 게임용이며 실제 기후 변화 과정이 아니에요.</p>
  </dialog>;
}

function ClimateMerge() {
  const [pieces, setPieces] = useState<ClimatePiece[]>([]);
  const [climateRunId, setClimateRunId] = useState(() => crypto.randomUUID());
  const [dropQueue, setDropQueue] = useState(createClimateQueue);
  const nextKey = dropQueue[0];
  const [rankOpen, setRankOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [ready, setReady] = useState(true);
  const [previewX, setPreviewX] = useState(320);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [combo, setCombo] = useState(0);
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; color: string; count: number; earth: boolean; earned: number }[]>([]);
  const soundRef = useRef(true);
  const comboRef = useRef<{ count: number; time: number; bodyId: number | null }>({ count: 0, time: 0, bodyId: null });
  const burstTimers = useRef<number[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const wallsRef = useRef<Matter.Body[]>([]);
  const readyRef = useRef(true);
  const endedRef = useRef(false);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const enteredBasketRef = useRef(new Set<number>());
  const lastSyncRef = useRef(0);
  const lastSafetyCheckRef = useRef(0);
  const dropDelayRef = useRef<number | null>(null);
  const previewPositionRef = useRef(320);
  const previewFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gameOverTimer = useRef<number | null>(null);
  const gameWidth = 640;
  const gameHeight = 800;
  const basketRim = 92;
  const basketInset = 30;
  const basketBottom = 765;
  useEffect(() => {
    const runner = runnerRef.current;
    const engine = engineRef.current;
    if (!runner || !engine || endedRef.current) return;
    if (atlasOpen || helpOpen || rankOpen) Matter.Runner.stop(runner);
    else { comboRef.current = { count: 0, time: 0, bodyId: null }; setCombo(0); Matter.Runner.run(runner, engine); }
  }, [atlasOpen, helpOpen, rankOpen]);

  const playMergeSound = (kind: "step" | "region" | "earth" | "drop" | "over") => {
    if (!soundRef.current) return;
    try {
      const context = audioContextRef.current ?? new AudioContext();
      audioContextRef.current = context;
      const tier = Math.min(8, Math.max(1, comboRef.current.count));
      const festive = kind === "step" || kind === "region" || kind === "earth";
      const melody = [392, 493.88, 587.33, 783.99, 987.77, 1174.66, 1567.98, 1975.53];
      const notes = kind === "over" ? [220, 164.8, 110] : kind === "drop" ? [180] : kind === "earth" ? melody : melody.slice(0, Math.min(8, tier + 1));
      const play = () => notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator(); const gain = context.createGain(); const start = context.currentTime + index * (kind === "earth" ? 0.1 : 0.055);
        oscillator.type = kind === "earth" ? "sine" : "triangle"; oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.001, start); gain.gain.linearRampToValueAtTime(kind === "earth" ? 0.055 : 0.04, start + 0.008); gain.gain.exponentialRampToValueAtTime(0.001, start + (kind === "earth" ? 0.65 : 0.22));
        oscillator.connect(gain).connect(context.destination); oscillator.start(start); oscillator.stop(start + (kind === "earth" ? 0.7 : 0.25));
        if (festive) {
          const harmonics = kind === "earth" || tier >= 5 ? [0.5, 1.25, 1.5, 2] : tier >= 3 ? [1.5, 2] : [2];
          harmonics.forEach((ratio, layer) => {
          const harmony = context.createOscillator();
          const envelope = context.createGain();
          const shimmerStart = start + (ratio === 2 ? 0.07 : layer * 0.012);
          harmony.type = "sine";
          harmony.frequency.setValueAtTime(frequency * ratio, shimmerStart);
          envelope.gain.setValueAtTime(0.001, shimmerStart);
          envelope.gain.linearRampToValueAtTime(0.014 / Math.sqrt(harmonics.length), shimmerStart + 0.012);
          envelope.gain.exponentialRampToValueAtTime(0.001, shimmerStart + (tier >= 5 ? 0.6 : 0.35));
          harmony.connect(envelope).connect(context.destination);
          harmony.start(shimmerStart); harmony.stop(shimmerStart + 0.65);
          });
        }
      });
      if (context.state === "suspended") void context.resume().then(play); else play();
    } catch { /* audio is optional */ }
  };

  const syncPieces = useCallback((force = false) => {
    const engine = engineRef.current;
    if (!engine) return;
    const now = performance.now();
    if (!force && now - lastSyncRef.current < 1000 / 60) return;
    lastSyncRef.current = now;
    const nextPieces = Matter.Composite.allBodies(engine.world)
        .filter((body): body is ClimateBody => !body.isStatic && Boolean((body as ClimateBody).climateKey))
        .map((body) => ({ id: body.id, key: body.climateKey!, parts: body.climateParts ?? [], x: body.position.x, y: body.position.y, angle: body.angle }));
    setPieces(previous => !force && previous.length === nextPieces.length && previous.every((piece, index) => {
      const next = nextPieces[index];
      return piece.id === next.id && piece.key === next.key && Math.abs(piece.x - next.x) < 0.03 && Math.abs(piece.y - next.y) < 0.03 && Math.abs(piece.angle - next.angle) < 0.002;
    }) ? previous : nextPieces);
  }, []);

  const makeClimateBody = useCallback((x: number, y: number, key: string, parts: Primary[] = []) => {
    const node = nodeFor(key);
    const body = Matter.Bodies.circle(x, y, node.size / 2, {
      friction: 0.035,
      frictionStatic: 0.08,
      frictionAir: 0.004,
      restitution: 0.08,
      slop: 0.02,
      label: "climate-piece",
    }) as ClimateBody;
    body.climateKey = key;
    body.climateParts = parts.length ? parts : key.length === 1 ? [key as Primary] : [];
    body.bornAt = performance.now();
    body.popped = false;
    body.sleepThreshold = 30;
    return body;
  }, []);

  useEffect(() => {
    try { highScoreRef.current = Number(localStorage.getItem("geo-climate-best")) || 0; } catch {}
    const engine = Matter.Engine.create({
      enableSleeping: false,
      gravity: { x: 0, y: 1, scale: 0.001 },
      positionIterations: 12,
      velocityIterations: 8,
    });
    const runner = Matter.Runner.create({ delta: 1000 / 120, maxFrameTime: 1000 / 30, maxUpdates: 8 });
    const wallOptions = { isStatic: true, friction: 0.03, restitution: 0.04, label: "wall" };
    const walls = [
      Matter.Bodies.rectangle(basketInset - 6, (basketRim + basketBottom) / 2, 12, basketBottom - basketRim, wallOptions),
      Matter.Bodies.rectangle(gameWidth - basketInset + 6, (basketRim + basketBottom) / 2, 12, basketBottom - basketRim, wallOptions),
      Matter.Bodies.rectangle(gameWidth / 2, basketBottom + 6, gameWidth - basketInset * 2 + 24, 12, wallOptions),
      Matter.Bodies.rectangle(gameWidth / 2, basketBottom + 38, 10000, 40, { ...wallOptions, label: "outside-ground" }),
    ];
    engineRef.current = engine;
    runnerRef.current = runner;
    wallsRef.current = walls;
    Matter.Composite.add(engine.world, walls);
    Matter.Runner.run(runner, engine);
    const endGame = () => {
      if (endedRef.current) return;
      endedRef.current = true;
      readyRef.current = false;
      setReady(false);
      gameOverTimer.current = window.setTimeout(() => setGameOver(true), 650);
      playMergeSound("over");
      highScoreRef.current = Math.max(highScoreRef.current, scoreRef.current);
      try { localStorage.setItem("geo-climate-best", String(highScoreRef.current)); } catch {}
      syncPieces(true);
      Matter.Runner.stop(runner);
    };

    const onAfterUpdate = () => {
      const now = performance.now();
      const climateBodies = Matter.Composite.allBodies(engine.world).filter(
        (body): body is ClimateBody => !body.isStatic && Boolean((body as ClimateBody).climateKey)
      );

      for (const body of climateBodies) {
        const radius = body.circleRadius ?? 0;
        if (body.popped) continue;
        const outside = body.position.x < basketInset || body.position.x > gameWidth - basketInset;
        if (body.position.y + radius <= basketRim && outside) body.spilled = true;
        if (!body.spilled && body.position.y + radius > basketRim) {
          const x = Math.max(basketInset + radius, Math.min(gameWidth - basketInset - radius, body.position.x));
          const y = Math.min(body.position.y, basketBottom - radius);
          if (x !== body.position.x || y !== body.position.y) {
            const hitSide = x !== body.position.x;
            const hitFloor = y !== body.position.y;
            const horizontalVelocity = hitSide ? x > body.position.x ? Math.max(0, body.velocity.x) : Math.min(0, body.velocity.x) : body.velocity.x;
            Matter.Body.setPosition(body, { x, y });
            Matter.Body.setVelocity(body, { x: horizontalVelocity, y: hitFloor ? Math.min(0, body.velocity.y) : body.velocity.y });
          }
        }
      }
      if (comboRef.current.count > 0 && now - comboRef.current.time >= 1750) {
        comboRef.current = { count: 0, time: 0, bodyId: null };
        setCombo(0);
      }
      if (now - lastSafetyCheckRef.current >= 80) lastSafetyCheckRef.current = now;
      for (let index = 0; index < climateBodies.length; index += 1) {
        for (let other = index + 1; other < climateBodies.length; other += 1) {
          const a = climateBodies[index];
          const b = climateBodies[other];
          if (a.popped || b.popped) continue;
          const horizontal = a.position.x - b.position.x;
          const vertical = a.position.y - b.position.y;
          const contactDistance = (a.circleRadius ?? 0) + (b.circleRadius ?? 0) + 0.6;
          if (horizontal * horizontal + vertical * vertical <= contactDistance * contactDistance) {
            onCollision({ pairs: [{ bodyA: a, bodyB: b }] } as unknown as Matter.IEventCollision<Matter.Engine>);
          }
        }
      }
      syncPieces();
    };

    const onCollision = (event: Matter.IEventCollision<Matter.Engine>) => {
      if (endedRef.current) return;
      for (const { bodyA, bodyB } of event.pairs) {
        const a = bodyA as ClimateBody;
        const b = bodyB as ClimateBody;
        if ((a.label === "outside-ground" && b.spilled && !b.popped) || (b.label === "outside-ground" && a.spilled && !a.popped)) { endGame(); return; }
        if (a.isStatic || b.isStatic) continue;
        if (!a.climateKey || !b.climateKey || a.popped || b.popped || a.spilled || b.spilled) continue;
        const nextKey = a.climateKey === b.climateKey ? climateNodes[a.climateKey]?.next : undefined;
        const nextParts: Primary[] = [];
        if (!nextKey) continue;
        a.popped = true;
        b.popped = true;
        const radius = nodeFor(nextKey).size / 2;
        const merged = makeClimateBody(Math.max(basketInset + radius, Math.min(gameWidth - basketInset - radius, (a.position.x + b.position.x) / 2)), Math.min(basketBottom - radius, (a.position.y + b.position.y) / 2), nextKey, nextParts);
        if (enteredBasketRef.current.has(a.id) || enteredBasketRef.current.has(b.id)) enteredBasketRef.current.add(merged.id);
        enteredBasketRef.current.delete(a.id);
        enteredBasketRef.current.delete(b.id);
        const totalMass = a.mass + b.mass;
        Matter.Body.setVelocity(merged, { x: (a.velocity.x * a.mass + b.velocity.x * b.mass) / totalMass, y: (a.velocity.y * a.mass + b.velocity.y * b.mass) / totalMass });
        Matter.Body.setAngularVelocity(merged, (a.angularVelocity + b.angularVelocity) * 0.35);
        Matter.Composite.remove(engine.world, [a, b]);
        Matter.Composite.add(engine.world, merged);
        const now = performance.now();
        const continuesChain = comboRef.current.count > 0 && now - comboRef.current.time < 1750 && (a.id === comboRef.current.bodyId || b.id === comboRef.current.bodyId);
        const count = continuesChain ? comboRef.current.count + 1 : 1;
        const earned = nextKey === "Earth" ? 10000 : comboReward(count).points;
        comboRef.current = { count, time: now, bodyId: merged.id };
        setCombo(count);
        const id = merged.id;
        setBursts(previous => [...previous.slice(-8), { id, x: merged.position.x, y: merged.position.y, color: nodeFor(nextKey).color, count, earth: nextKey === "Earth", earned }]);
        burstTimers.current.push(window.setTimeout(() => setBursts(previous => previous.filter(burst => burst.id !== id)), 1000));
        playMergeSound(nextKey === "Earth" ? "earth" : climateChain.indexOf(nextKey) >= 3 ? "region" : "step");
        scoreRef.current += earned;
        setScore(scoreRef.current);
      }
    };
    Matter.Events.on(engine, "collisionStart", onCollision);
    Matter.Events.on(engine, "collisionActive", onCollision);
    Matter.Events.on(engine, "afterUpdate", onAfterUpdate);
    return () => {
      Matter.Events.off(engine, "collisionStart", onCollision);
      Matter.Events.off(engine, "collisionActive", onCollision);
      Matter.Events.off(engine, "afterUpdate", onAfterUpdate);
      if (dropDelayRef.current) window.clearTimeout(dropDelayRef.current);
      if (previewFrameRef.current) window.cancelAnimationFrame(previewFrameRef.current);
      burstTimers.current.forEach(window.clearTimeout);
      if (gameOverTimer.current) window.clearTimeout(gameOverTimer.current);
      void audioContextRef.current?.close();
      audioContextRef.current = null;
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, [makeClimateBody, syncPieces]);

  const queuePreview = (event: PointerEvent<HTMLDivElement>) => {
    const rect = boardRef.current?.getBoundingClientRect();
    const radius = nodeFor(nextKey).size / 2;
    if (!rect || !ready) return;
    previewPositionRef.current = Math.max(basketInset + radius, Math.min(gameWidth - basketInset - radius, ((event.clientX - rect.left) / rect.width) * gameWidth));
    if (previewFrameRef.current) return;
    previewFrameRef.current = window.requestAnimationFrame(() => {
      previewFrameRef.current = null;
      setPreviewX(previewPositionRef.current);
    });
  };

  const drop = (event: PointerEvent<HTMLDivElement>) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (!readyRef.current || endedRef.current || atlasOpen || helpOpen || rankOpen || !engineRef.current) return;
    comboRef.current = { count: 0, time: 0, bodyId: null };
    setCombo(0);
    const radius = nodeFor(nextKey).size / 2;
    const x = Math.max(basketInset + radius, Math.min(gameWidth - basketInset - radius, ((event.clientX - rect.left) / rect.width) * gameWidth));
    Matter.Composite.add(engineRef.current.world, makeClimateBody(x, 42, nextKey));
    playMergeSound("drop");
    const appendedKey = randomClimateKey();
    setDropQueue(queue => [...queue.slice(1), appendedKey]);
    readyRef.current = false;
    setReady(false);
    if (dropDelayRef.current) window.clearTimeout(dropDelayRef.current);
    dropDelayRef.current = window.setTimeout(() => {
      if (!endedRef.current) { readyRef.current = true; setReady(true); }
    }, 420);
  };

  const resetGame = () => {
    const engine = engineRef.current;
    const runner = runnerRef.current;
    if (!engine || !runner) return;
    Matter.Runner.stop(runner);
    Matter.Composite.clear(engine.world, false, true);
    Matter.Engine.clear(engine);
    Matter.Composite.add(engine.world, wallsRef.current);
    enteredBasketRef.current.clear();
    if (gameOverTimer.current) window.clearTimeout(gameOverTimer.current);
    burstTimers.current.forEach(window.clearTimeout);
    burstTimers.current = [];
    comboRef.current = { count: 0, time: 0, bodyId: null };
    setCombo(0); setBursts([]); setDropQueue(createClimateQueue());
    if (dropDelayRef.current) window.clearTimeout(dropDelayRef.current);
    setClimateRunId(crypto.randomUUID());
    scoreRef.current = 0;
    endedRef.current = false;
    readyRef.current = true;
    lastSyncRef.current = 0;
    lastSafetyCheckRef.current = 0;
    setPieces([]); setScore(0); setGameOver(false); setReady(true);
    if (!atlasOpen && !helpOpen && !rankOpen) Matter.Runner.run(runner, engine);
  };

  return (
    <main className="climate-arcade h-[100dvh] overflow-hidden text-[#17342f]">
      <div className="relative h-full">
        <p className="climate-disclaimer">여기에는 없는 기후도 있기에 전부다 믿지는 마세요</p>
        <header className="arcade-header absolute inset-x-4 top-4 z-50 flex items-center justify-between gap-4 sm:inset-x-7 sm:top-6">
          <Link to="/" className="rounded-full border border-[#c6b58e] bg-[#fffaf0] px-4 py-2 text-xs font-bold transition hover:bg-white">
            ← 게임 선택
          </Link>
          <div className="text-right leading-tight">
            <p className="font-mono text-[10px] tracking-[.16em] text-[#5b7d58]">KÖPPEN CLIMATE MERGE</p>
            <p className="mt-1 text-xl font-black tabular-nums">점수 <span className="text-[#cf6349]">{score}</span></p>
          </div>
          <div className="arcade-controls">
            <button type="button" onClick={() => setRankOpen(true)}>랭킹</button>
            <button type="button" aria-pressed={soundEnabled} onClick={() => { soundRef.current = !soundEnabled; setSoundEnabled(!soundEnabled); if (!soundEnabled) playMergeSound("step"); }}>{soundEnabled ? "♪ 소리 켜짐" : "♪ 소리 꺼짐"}</button>
            <button type="button" onClick={() => { if (score === 0 || window.confirm("현재 게임을 지우고 다시 시작할까요?")) resetGame(); }}>↻ 다시하기</button>
          </div>
        </header>

        <button type="button" className="climate-chain-launch" onClick={() => setAtlasOpen(true)}>합성 순서 · 13단계</button>
        <aside className="climate-next" aria-label="다음에 나올 기후 3개">
          <p>NEXT <span>다음 기후</span></p>
          <ol>{dropQueue.slice(1).map((key, index) => <li key={index}><small>{index + 1}</small><b>{key}</b><span>{nodeFor(key).name}</span></li>)}</ol>
        </aside>

        <div className="h-full">
          <div className="climate-scene">
          <div className="outside-floor" aria-hidden="true"><span>바구니 밖 바닥 · 여기에 떨어지면 게임 오버</span></div>
          <section
            ref={boardRef}
            onPointerMove={queuePreview}
            onPointerDown={drop}
            className="climate-board relative mx-auto aspect-[4/5] touch-none overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,.4),transparent)]" />
            <div className="pointer-events-none absolute inset-x-[3%] bottom-[3%] top-[11.5%] z-10 overflow-hidden rounded-b-[34px] border-x-[11px] border-b-[11px] border-[#e5b865]/85 bg-[linear-gradient(110deg,rgba(255,255,255,.32),rgba(255,242,186,.14)_35%,rgba(255,255,255,.06)_62%,rgba(181,126,57,.12))] shadow-[inset_12px_0_18px_rgba(255,255,255,.36),inset_-11px_0_18px_rgba(129,83,31,.2),inset_0_-8px_12px_rgba(132,81,28,.2),0_5px_0_rgba(111,74,36,.18)]">
              <span className="absolute inset-x-5 bottom-2 h-10 rounded-full border-t border-white/50 bg-white/10 blur-[1px]" />
              <span className="absolute -left-8 top-12 h-[72%] w-10 -skew-x-12 rounded-full bg-white/35 blur-sm" />
              <span className="absolute right-4 top-16 h-1/2 w-3 rounded-full bg-[#9f682a]/15 blur-sm" />
            </div>
            <div className="pointer-events-none absolute inset-x-[2.4%] top-[11.1%] z-30 h-5 rounded-full border border-[#fff5c9] bg-[linear-gradient(180deg,#fff5ce_0%,#efc573_48%,#c88d40_100%)] shadow-[inset_0_3px_2px_rgba(255,255,255,.75),0_4px_0_rgba(121,77,31,.22),0_10px_12px_rgba(123,80,31,.16)]" />
            <div className="pointer-events-none absolute inset-x-[5%] top-[12%] z-30 h-1 rounded-full bg-white/75" />
            <p className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/70 bg-[#fffdf5]/85 px-4 py-2 text-xs font-bold text-[#315c4f] shadow-sm">
              {ready ? "위치를 고르고 눌러 조각을 떨어뜨리세요" : "조각이 착지하는 중…"}
            </p>
            <p className="pointer-events-none absolute left-6 top-[11.5%] z-40 -translate-y-1/2 rounded-full bg-[#8d5626]/80 px-2 py-0.5 font-mono text-[8px] font-bold tracking-[.16em] text-white/90">BASKET RIM</p>
            <p className="pointer-events-none absolute bottom-[5%] left-7 z-20 font-mono text-[9px] tracking-[.22em] text-[#315c4f]/60">MERGE BASKET · CLIMATE BELTS</p>
            {ready && !gameOver && <div className="pointer-events-none absolute top-[38px] z-40 -translate-x-1/2" style={{ left: `${(previewX / gameWidth) * 100}%` }}><div className="h-10 border-l-2 border-dashed border-[#315c4f]/55" /><div className="relative grid h-12 w-12 -translate-x-[23px] place-items-center overflow-hidden rounded-full border-2 border-white/90 text-xs font-black text-[#17342f] shadow-[0_4px_0_rgba(35,78,64,.2)]" style={{ backgroundColor: nodeFor(nextKey).color }}><span className="absolute left-2 top-1 h-3 w-5 rotate-[-28deg] rounded-full bg-white/70" />{nodeFor(nextKey).code}</div></div>}
            {pieces.map((piece) => {
              const climate = nodeFor(piece.key);
              return (
                <div
                  key={piece.id}
                  className="climate-ball pointer-events-none absolute z-20 grid place-items-center rounded-full border-[2px] border-white/85 shadow-[inset_6px_6px_8px_rgba(255,255,255,.3),inset_-7px_-8px_9px_rgba(35,75,61,.2)] will-change-transform"
                  style={{
                    left: `${(piece.x / gameWidth) * 100}%`,
                    top: `${(piece.y / gameHeight) * 100}%`,
                    width: `${(climate.size / gameWidth) * 100}%`, aspectRatio: "1 / 1",
                    backgroundColor: climate.color,
                    fontSize: `${climate.size / gameWidth * 48}cqw`,
                    transform: `translate(-50%, -50%) rotate(${piece.angle}rad)`,
                  }}
                >
                  <span className="absolute inset-[8%] rounded-full border border-white/35" />
                  <span className="absolute left-[16%] top-[11%] h-[18%] w-[32%] rotate-[-28deg] rounded-full bg-white/60" />
                  <span className="absolute bottom-[11%] right-[13%] h-[13%] w-[13%] rounded-full bg-white/30" />
                  <span className="relative font-black tracking-[-.04em] text-[#17342f] drop-shadow-[0_1px_0_rgba(255,255,255,.45)]" style={{ fontSize: `${climate.size / gameWidth * (climate.code.length > 3 ? 18 : 27)}cqw` }}>{climate.code}</span>
                  <span className="absolute bottom-[15%] text-[.55em] opacity-70">{climate.icon}</span>
                </div>
              );
            })}
            {bursts.map(burst => <div key={burst.id} className="merge-burst" style={{ left: `${burst.x / gameWidth * 100}%`, top: `${burst.y / gameHeight * 100}%`, color: burst.color }}>
              <span className="burst-ring" />
              {Array.from({ length: 10 }, (_, index) => <i key={index} style={{ '--angle': `${index * 36}deg` } as React.CSSProperties} />)}
              <b>{burst.earth ? "🌍 지구 완성! +10,000" : `${comboReward(burst.count).label} +${burst.earned.toLocaleString()}`}</b>
            </div>)}
          </section>
          </div>
          <footer className="arcade-footer"><span>Aw → Am → Af → BS → BW → Cfb → Cfa → Df → Dw → Ds → ET → EF → Earth</span><span>{combo > 0 ? comboReward(combo).label : "같은 공을 합쳐 지구를 만드세요"}</span></footer>

        </div>
        {rankOpen && <Rankings recordId={climateRunId} game="climate" score={gameOver ? score : undefined} onClose={() => setRankOpen(false)} />}
        {atlasOpen && <ClimateAtlas onClose={() => setAtlasOpen(false)} />}
        <button type="button" className="help-launch" onClick={() => setHelpOpen(true)}>ⓘ 게임 설명</button>
        {helpOpen && <ClimateHelp onClose={() => setHelpOpen(false)} />}
        {gameOver && (
          <div role="dialog" aria-modal="true" aria-label="게임 오버" className="fixed inset-0 z-[100] grid place-items-center bg-[#17342f]/80 p-5 backdrop-blur-sm">
            <section className="w-full max-w-sm rounded-[28px] border border-white/30 bg-[#fffaf0] p-8 text-center shadow-2xl">
              <p className="font-mono text-[10px] font-bold tracking-[.2em] text-[#bd4f49]">BASKET OVERFLOW</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">게임 오버</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#647565]">넘친 기후 공이 바구니 밖 바닥에 떨어졌어요.<br />같은 조각을 합쳐 공간을 만들어 보세요.</p>
              <p className="mt-6 font-mono text-sm font-bold">FINAL SCORE · {score}</p>
              <p className="mt-1 text-[11px] text-[#6e806d]">BEST · {highScoreRef.current}</p>
              <button type="button" className="rank-action" onClick={() => setRankOpen(true)}>기록 등록 · 랭킹 보기</button>
              <button onClick={resetGame} className="mt-6 w-full rounded-xl bg-[#17342f] py-3 text-sm font-bold text-white transition hover:bg-[#285346]">다시 시작하기</button>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

const router = createHashRouter([
  { path: "/", element: <Launcher /> },
  { path: "/typing", element: <CountryTyping /> },
  { path: "/climate", element: <ClimateMerge /> },
  { path: "/rhythm", element: <Suspense fallback={rhythmLoading}><RhythmGame countries={typingLesson} /></Suspense> },
  { path: "/explore", element: <Suspense fallback={rhythmLoading}><RhythmGame countries={lesson} /></Suspense> },
  { path: "*", element: <Launcher /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
