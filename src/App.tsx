import { ChangeEvent, CompositionEvent, memo, PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";

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

const mapUrl = (country: Country, isFixed: boolean) => {
  const zoom = isFixed ? 2 : Math.min(country.zoom + 1, 10);
  return `https://maps.google.com/maps?q=${country.lat},${country.lng}&z=${zoom}&output=embed&hl=ko`;
};

const MapFrames = memo(function MapFrames({ index, loaded, onLoaded, isFixedMap }: { index: number; loaded: Record<string, boolean>; onLoaded: (code: string) => void; isFixedMap: boolean }) {
  const visibleCountries = [lesson[index], lesson[(index + 1) % lesson.length]];
  const current = lesson[index];
  return (
    <>
      {visibleCountries.map((country) => (
        <iframe
          key={`${country.code}-${isFixedMap ? "fixed" : "zoomed"}`}
          src={mapUrl(country, isFixedMap)}
          title={`${country.korean} 위치 지도`}
          onLoad={() => onLoaded(country.code)}
          aria-hidden={country.code !== current.code}
          tabIndex={country.code === current.code ? 0 : -1}
          className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-300 ease-out ${
            country.code === current.code ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
          }`}
          loading="eager"
        />
      ))}
      {!loaded[current.code] && (
        <div className="pointer-events-none absolute left-1/2 top-5 z-20 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#5d6e5f] shadow-sm">
          지도 불러오는 중
        </div>
      )}
    </>
  );
});

function CountryTyping() {
  const [index, setIndex] = useState(0);
  const [isFixedMap, setIsFixedMap] = useState(true);
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [typed, setTyped] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const advancing = useRef(false);
  const audioContext = useRef<AudioContext | null>(null);
  const current = lesson[index];
  const target = language === "ko" ? current.korean : current.english;

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    advancing.current = false;
    setTyped("");
    setInputValue("");
    inputRef.current?.focus();
  }, [index, language]);

  const markLoaded = useCallback((code: string) => setLoaded((value) => (value[code] ? value : { ...value, [code]: true })), []);

  const getAudio = () => {
    if (!audioContext.current) audioContext.current = new AudioContext();
    return audioContext.current;
  };

  const playKeySound = () => {
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

      const noise = context.createBuffer(1, Math.floor(context.sampleRate * 0.028), context.sampleRate);
      const samples = noise.getChannelData(0);
      samples.forEach((_, sample) => {
        samples[sample] = (Math.random() * 2 - 1) * Math.pow(1 - sample / samples.length, 4);
      });
      const click = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const clickGain = context.createGain();
      click.buffer = noise;
      filter.type = "bandpass";
      filter.frequency.value = 1550;
      filter.Q.value = 0.8;
      clickGain.gain.setValueAtTime(0.04, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      click.connect(filter).connect(clickGain).connect(context.destination);
      click.start(now);
    };
    if (context.state === "suspended") void context.resume().then(strike);
    else strike();
  };

  const playSuccessSound = () => {
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
  };

  const advance = () => {
    if (advancing.current) return;
    advancing.current = true;
    playSuccessSound();
    setCorrect((value) => value + 1);
    setTyped("");
    setInputValue("");
    setIndex((value) => (value + 1) % lesson.length);
  };

  const processInput = (next: string) => {
    if (next === target) {
      advance();
      return;
    }

    if (target.startsWith(next)) {
      setTyped(next);
      setInputValue(next);
    } else {
      if (next.length > typed.length) {
        setErrors((value) => value + 1);
      }
      setInputValue(typed);
    }
  };

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    if (next.length > inputValue.length) {
      playKeySound();
    }
    processInput(next);
  };

  const onCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    processInput(event.currentTarget.value);
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const accuracy = correct + errors === 0 ? 100 : Math.round((correct / (correct + errors)) * 100);
  const typedPerMinute = useMemo(() => (elapsed ? Math.round(((correct * 4 + typed.length) / elapsed) * 60) : 0), [correct, elapsed, typed.length]);
  const time = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <main className="flex min-h-screen flex-col overflow-hidden bg-[#edf3ec] text-[#17231a]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#d7e2d5] bg-white px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#3b9d44] text-sm font-black text-white">
            T
          </Link>
          <div>
            <p className="text-sm font-bold">Country Typing</p>
            <p className="text-[10px] font-medium text-[#809080]">세계시민과 지리 · 나라 이름 연습</p>
          </div>
        </div>
        <p className="hidden font-mono text-[11px] text-[#778778] sm:block">LESSON 01 / WORLD MAP</p>
      </header>
      <section className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between bg-white/90 px-5 py-3 sm:px-10">
          <p className="text-sm font-semibold text-[#3b9d44]">
            {String(index + 1).padStart(2, "0")} <span className="font-normal text-[#95a295]">/ {String(lesson.length).padStart(2, "0")} 국가</span>
          </p>
          <p className="text-xs text-[#748174]">입력창을 누르면 키보드가 열립니다.</p>
        </div>
        <div className="relative z-0 h-[40vh] min-h-[250px] shrink-0 overflow-hidden bg-[#dce8db] sm:h-[58vh] sm:min-h-[440px]">
          <MapFrames index={index} loaded={loaded} onLoaded={markLoaded} isFixedMap={isFixedMap} />
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
                onClick={() => setLanguage("ko")}
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${language === "ko" ? "bg-[#3b9d44] text-white" : "text-[#607160]"}`}
              >
                한국어
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${language === "en" ? "bg-[#3b9d44] text-white" : "text-[#607160]"}`}
              >
                English
              </button>
            </div>
            <button
              onClick={() => {
                setTyped("");
                setInputValue("");
                focusInput();
              }}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#4a5b4c] shadow-sm transition hover:bg-gray-50"
            >
              다시 입력
            </button>
          </div>
        </div>
        <div className="relative z-50 shrink-0 border-t border-[#cfe0cf] bg-white px-4 pb-6 pt-0 shadow-[0_-10px_28px_rgba(24,52,28,.10)] sm:px-8">
          <div className="mx-auto -mt-6 grid max-w-2xl grid-cols-4 overflow-hidden rounded-2xl border border-[#cbd9ca] bg-white shadow-[0_8px_24px_rgba(32,67,35,.18)]">
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
            <p className="text-xs font-semibold text-[#7b897b]">아래 입력창을 터치하여 키보드로 나라 이름을 입력하세요</p>
            <div className="mt-2 border-y-2 border-[#3b9d44] py-2 sm:border-y-4 sm:py-3">
              <p className="text-2xl font-bold tracking-[.1em] text-[#273b29] sm:text-5xl sm:tracking-[.15em]">{target}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5 text-xl font-bold sm:mt-3 sm:gap-2 sm:text-3xl">
                {Array.from(target).map((char, charIndex) => (
                  <span
                    key={`${char}-${charIndex}`}
                    className={`grid h-8 min-w-8 place-items-center rounded-lg sm:h-10 sm:min-w-10 ${
                      inputValue[charIndex] === char
                        ? "bg-[#e5f5e6] text-[#2b9138]"
                        : inputValue[charIndex]
                        ? "bg-[#fff0ee] text-[#df5145]"
                        : "bg-[#f2f5f1] text-[#bbc5bb]"
                    }`}
                  >
                    {inputValue[charIndex] || char}
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] font-medium tracking-wide text-[#829082] sm:mt-2 sm:text-xs">{current.english}</p>
            </div>

            {/* 모바일 호환성을 위한 안심 직관적 입력창 */}
            <div className="mt-4 flex justify-center">
              <input
                ref={inputRef}
                value={inputValue}
                onChange={onInput}
                onCompositionEnd={onCompositionEnd}
                placeholder="여기를 터치하여 타자 입력"
                className="w-full max-w-md rounded-xl border-2 border-[#3b9d44] bg-[#f7faf7] px-4 py-3 text-center text-base font-bold text-[#17231a] shadow-inner focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b9d44]"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Launcher() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#17342f] px-5 py-7 text-white sm:px-10 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e4f252] text-lg font-black text-[#17342f]">G</span>
            <p className="text-lg font-bold tracking-tight">Geo Playroom</p>
          </div>
          <p className="font-mono text-[10px] tracking-[.18em] text-[#b6d3be]">LEARN BY PLAYING</p>
        </header>
        <section className="mt-12 max-w-3xl sm:mt-24">
          <p className="font-mono text-xs tracking-[.18em] text-[#e4f252]">WORLD · WEATHER · WORDS</p>
          <h1 className="mt-4 text-4xl font-bold leading-[.95] tracking-[-.06em] sm:text-7xl">
            지도를 읽고,<br />기후를 놀다.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-[#bfd5c3] sm:text-base">
            나라 이름을 손끝으로 익히고, 작은 기후 요소를 합쳐 거대한 날씨 현상을 만들어 보세요.
          </p>
        </section>
        <section className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <Link
            to="/typing"
            className="group relative min-h-[260px] overflow-hidden rounded-[28px] bg-[#dff3e3] p-7 text-[#17342f] transition hover:-translate-y-1 sm:min-h-[310px]"
          >
            <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#9ad5b0] opacity-70 transition group-hover:scale-110" />
            <p className="relative font-mono text-xs font-bold tracking-widest text-[#3b9d44]">01 · COUNTRY TYPING</p>
            <h2 className="relative mt-8 text-3xl font-bold tracking-[-.05em] sm:mt-10 sm:text-4xl">
              나라 이름<br />타자연습
            </h2>
            <p className="relative mt-3 max-w-xs text-xs text-[#52725a] sm:text-sm">한글 또는 영어로, 지도 위 나라를 빠르게 익히는 연습.</p>
            <span className="absolute bottom-7 right-7 grid h-12 w-12 place-items-center rounded-full bg-[#17342f] text-xl text-white transition group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            to="/climate"
            className="group relative min-h-[260px] overflow-hidden rounded-[28px] bg-[#f39b66] p-7 text-[#442116] transition hover:-translate-y-1 sm:min-h-[310px]"
          >
            <div className="absolute -bottom-20 -right-12 h-64 w-64 rounded-full bg-[#e9534b] opacity-80 transition group-hover:scale-110" />
            <p className="relative font-mono text-xs font-bold tracking-widest text-[#793120]">02 · CLIMATE MERGE</p>
            <h2 className="relative mt-8 text-3xl font-bold tracking-[-.05em] sm:mt-10 sm:text-4xl">기후 수박게임</h2>
            <p className="relative mt-3 max-w-xs text-xs text-[#6f3527] sm:text-sm">작은 기후 요소를 떨어뜨리고, 같은 요소끼리 합쳐 보세요.</p>
            <span className="absolute bottom-7 right-7 grid h-12 w-12 place-items-center rounded-full bg-[#442116] text-xl text-white transition group-hover:translate-x-1">
              ↓
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}

type ClimatePiece = { id: number; level: number; x: number; y: number; velocity: number };
const climates = [
  { name: "이슬", icon: "💧", color: "#91d5f0", size: 36 },
  { name: "구름", icon: "☁️", color: "#d9e0e7", size: 50 },
  { name: "바람", icon: "〰", color: "#9fd5ba", size: 62 },
  { name: "비", icon: "🌧️", color: "#78a8e8", size: 76 },
  { name: "폭풍", icon: "🌀", color: "#a28ce4", size: 94 },
  { name: "태풍", icon: "🌪️", color: "#6d5a91", size: 112 },
];

function ClimateMerge() {
  const [pieces, setPieces] = useState<ClimatePiece[]>([]);
  const [nextLevel, setNextLevel] = useState(0);
  const [score, setScore] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const pieceId = useRef(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPieces((current) => {
        const fallen = current.map((piece) => ({
          ...piece,
          velocity: Math.min(piece.velocity + 0.16, 2.8),
          y: Math.min(88, piece.y + piece.velocity),
        }));
        const merged = new Set<number>();
        const next: ClimatePiece[] = [];
        for (let i = 0; i < fallen.length; i += 1) {
          if (merged.has(fallen[i].id)) continue;
          const match = fallen.find(
            (other, otherIndex) =>
              otherIndex > i &&
              !merged.has(other.id) &&
              other.level === fallen[i].level &&
              other.level < climates.length - 1 &&
              Math.hypot(other.x - fallen[i].x, other.y - fallen[i].y) < 9 + fallen[i].level * 2
          );
          if (match) {
            merged.add(match.id);
            merged.add(fallen[i].id);
            next.push({
              id: ++pieceId.current,
              level: fallen[i].level + 1,
              x: (fallen[i].x + match.x) / 2,
              y: Math.max(8, (fallen[i].y + match.y) / 2),
              velocity: 0.2,
            });
            setScore((value) => value + (fallen[i].level + 1) * 10);
          } else {
            next.push(fallen[i]);
          }
        }
        return next;
      });
    }, 16);
    return () => window.clearInterval(timer);
  }, []);

  const drop = (event: PointerEvent<HTMLDivElement>) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(8, Math.min(92, ((event.clientX - rect.left) / rect.width) * 100));
    setPieces((current) => [...current.slice(-26), { id: ++pieceId.current, level: nextLevel, x, y: 8, velocity: 0.4 }]);
    setNextLevel(Math.floor(Math.random() * 3));
  };

  return (
    <main className="min-h-screen bg-[#ffe7ca] px-4 py-5 text-[#3b241c] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <Link to="/" className="rounded-full border border-[#d5a77e] px-4 py-2 text-xs font-bold">
            ← 게임 선택
          </Link>
          <div className="text-right">
            <p className="font-mono text-[10px] tracking-widest text-[#9a5a3e]">CLIMATE MERGE</p>
            <p className="text-xl font-black">점수 {score}</p>
          </div>
        </header>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px]">
          <section
            ref={boardRef}
            onPointerDown={drop}
            className="relative h-[60vh] min-h-[400px] touch-none overflow-hidden rounded-[30px] border-[6px] border-[#8e543b] bg-[linear-gradient(160deg,#78c6e6_0%,#b8e3ee_55%,#e3f0d7_56%,#d1e8b8_100%)] shadow-[inset_0_0_0_5px_rgba(255,255,255,.4)] sm:h-[68vh] sm:min-h-[500px]"
          >
            <div className="absolute inset-x-0 top-0 h-20 bg-white/20" />
            <p className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-[#7b4b39]">
              빈 곳을 눌러 기후 요소를 떨어뜨리세요
            </p>
            {pieces.map((piece) => {
              const climate = climates[piece.level];
              return (
                <div
                  key={piece.id}
                  className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white/70 shadow-lg transition-transform"
                  style={{
                    left: `${piece.x}%`,
                    top: `${piece.y}%`,
                    width: climate.size,
                    height: climate.size,
                    backgroundColor: climate.color,
                    fontSize: climate.size * 0.48,
                  }}
                >
                  <span>{climate.icon}</span>
                  <span className="absolute -bottom-5 whitespace-nowrap text-[10px] font-bold text-[#4b3329]">{climate.name}</span>
                </div>
              );
            })}
          </section>
          <aside className="rounded-[28px] bg-[#fff9ef] p-6">
            <p className="font-mono text-[11px] tracking-widest text-[#b96542]">NEXT DROP</p>
            <div
              className="mx-auto mt-6 grid h-28 w-28 place-items-center rounded-full border-4 border-white shadow-[0_6px_16px_rgba(125,64,40,.18)]"
              style={{ backgroundColor: climates[nextLevel].color, fontSize: 48 }}
            >
              {climates[nextLevel].icon}
            </div>
            <p className="mt-3 text-center font-bold">{climates[nextLevel].name}</p>
            <div className="mt-8 border-t border-[#f0d6be] pt-5">
              <p className="text-sm font-bold">같은 기후끼리 합치세요</p>
              <p className="mt-2 text-xs leading-relaxed text-[#926a58]">이슬 → 구름 → 바람 → 비 → 폭풍 → 태풍 순으로 더 큰 기후가 됩니다.</p>
            </div>
            <button
              onClick={() => {
                setPieces([]);
                setScore(0);
              }}
              className="mt-8 w-full rounded-xl bg-[#3b241c] py-3 text-sm font-bold text-white"
            >
              새로 시작
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <Launcher /> },
  { path: "/typing", element: <CountryTyping /> },
  { path: "/climate", element: <ClimateMerge /> },
  { path: "*", element: <Launcher /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
