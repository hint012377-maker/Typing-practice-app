import { ChangeEvent, memo, PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import Matter from "matter-js";

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

const MapFrames = memo(function MapFrames({
  index,
  loaded,
  onLoaded,
  isFixedMap,
}: {
  index: number;
  loaded: Record<string, boolean>;
  onLoaded: (code: string) => void;
  isFixedMap: boolean;
}) {
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
  const [displayInput, setDisplayInput] = useState("");
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

  const resetInput = useCallback(() => {
    advancing.current = false;
    setDisplayInput("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    resetInput();
  }, [index, language, resetInput]);

  const markLoaded = useCallback(
    (code: string) => setLoaded((value) => (value[code] ? value : { ...value, [code]: true })),
    []
  );

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
    setIndex((value) => (value + 1) % lesson.length);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayInput(val);
    playKeySound();

    if (val === target) {
      advance();
      return;
    }

    if (!target.startsWith(val) && val.length > displayInput.length) {
      setErrors((v) => v + 1);
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const accuracy = correct + errors === 0 ? 100 : Math.round((correct / (correct + errors)) * 100);
  const typedPerMinute = useMemo(
    () => (elapsed ? Math.round(((correct * 4 + displayInput.length) / elapsed) * 60) : 0),
    [correct, elapsed, displayInput.length]
  );
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
            {String(index + 1).padStart(2, "0")}{" "}
            <span className="font-normal text-[#95a295]">/ {String(lesson.length).padStart(2, "0")} 국가</span>
          </p>
          <p className="text-xs text-[#748174]">입력창을 터치하여 키보드를 여세요.</p>
        </div>
        <div className="relative z-0 h-[35vh] min-h-[220px] shrink-0 overflow-hidden bg-[#dce8db] sm:h-[58vh] sm:min-h-[440px]">
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
              onClick={resetInput}
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
            <div className="border-y-2 border-[#3b9d44] py-2 sm:border-y-4 sm:py-3" onClick={focusInput}>
              <p className="text-2xl font-bold tracking-[.1em] text-[#273b29] sm:text-5xl sm:tracking-[.15em]">{target}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5 text-xl font-bold sm:mt-3 sm:gap-2 sm:text-3xl">
                {Array.from(target).map((char, charIndex) => (
                  <span
                    key={`${char}-${charIndex}`}
                    className={`grid h-8 min-w-8 place-items-center rounded-lg sm:h-10 sm:min-w-10 ${
                      displayInput[charIndex] === char
                        ? "bg-[#e5f5e6] text-[#2b9138]"
                        : displayInput[charIndex]
                        ? "bg-[#fff0ee] text-[#df5145]"
                        : "bg-[#f2f5f1] text-[#bbc5bb]"
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
                ref={inputRef}
                type="text"
                onChange={handleChange}
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
            지도를 읽고,
            <br />
            기후를 놀다.
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
              나라 이름
              <br />
              타자연습
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
            <p className="relative mt-3 max-w-xs text-xs text-[#6f3527] sm:text-sm">쾨펜 기후대를 합치며, 지구의 다섯 기후 권역을 익혀 보세요.</p>
            <span className="absolute bottom-7 right-7 grid h-12 w-12 place-items-center rounded-full bg-[#442116] text-xl text-white transition group-hover:translate-x-1">
              ↓
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}

type Primary = "A" | "B" | "C" | "D" | "E";
type ClimatePiece = { id: number; key: string; parts: Primary[]; x: number; y: number; angle: number };
type ClimateBody = Matter.Body & { climateKey?: string; climateParts?: Primary[]; popped?: boolean };
type ClimateNode = { code: string; name: string; icon: string; color: string; size: number; next?: string };

const climateGroups: { id: Primary; title: string; chain: string[]; color: string }[] = [
  { id: "A", title: "열대", chain: ["Am", "Aw", "As", "Af", "A"], color: "#ed7555" },
  { id: "B", title: "건조", chain: ["BS", "BW", "B"], color: "#d7a84a" },
  { id: "C", title: "온대", chain: ["Cfb", "Cfa", "Csb", "Csa", "C"], color: "#5da873" },
  { id: "D", title: "냉대", chain: ["Df", "Dw", "Ds", "D"], color: "#668fc0" },
  { id: "E", title: "한대", chain: ["ET", "EF", "E"], color: "#a9d0dc" },
];
const climateNodes: Record<string, ClimateNode> = {
  Am: { code: "Am", name: "열대몬순", icon: "🌦️", color: "#ee8960", size: 104, next: "Aw" }, Aw: { code: "Aw", name: "열대사바나", icon: "🦒", color: "#e7b94e", size: 124, next: "As" }, As: { code: "As", name: "열대 하계건조", icon: "🌞", color: "#e99d55", size: 144, next: "Af" }, Af: { code: "Af", name: "열대우림", icon: "🌴", color: "#61ad71", size: 166, next: "A" }, A: { code: "A", name: "열대기후", icon: "🌴", color: "#df6f4f", size: 194 },
  BS: { code: "BS", name: "스텝", icon: "🌾", color: "#d6a85d", size: 108, next: "BW" }, BW: { code: "BW", name: "사막", icon: "☀️", color: "#dfb53e", size: 142, next: "B" }, B: { code: "B", name: "건조기후", icon: "🏜️", color: "#c89339", size: 194 },
  Cfb: { code: "Cfb", name: "서안 해양성", icon: "🌱", color: "#66a879", size: 108, next: "Cfa" }, Cfa: { code: "Cfa", name: "온난 습윤", icon: "🌿", color: "#499861", size: 132, next: "Csb" }, Csb: { code: "Csb", name: "지중해성", icon: "🍋", color: "#72ae6a", size: 154, next: "Csa" }, Csa: { code: "Csa", name: "고온 지중해성", icon: "🌻", color: "#78a954", size: 172, next: "C" }, C: { code: "C", name: "온대기후", icon: "🌳", color: "#4e9e72", size: 194 },
  Df: { code: "Df", name: "냉대 습윤", icon: "🌲", color: "#789cc7", size: 110, next: "Dw" }, Dw: { code: "Dw", name: "냉대 겨울건조", icon: "🏔️", color: "#5d82b3", size: 140, next: "Ds" }, Ds: { code: "Ds", name: "냉대 하계건조", icon: "🍂", color: "#6c8cb8", size: 166, next: "D" }, D: { code: "D", name: "냉대기후", icon: "🌲", color: "#5b78aa", size: 194 },
  ET: { code: "ET", name: "툰드라", icon: "❄️", color: "#a9d5dc", size: 112, next: "EF" }, EF: { code: "EF", name: "빙설", icon: "🧊", color: "#d1ebee", size: 148, next: "E" }, E: { code: "E", name: "한대기후", icon: "🧊", color: "#9fc4d6", size: 194 },
};
const fusionEntries = [
  ["AB", "🏜️", "열대사막"], ["AC", "🏝️", "온대정글"], ["AD", "⚡", "빙하화산"], ["AE", "🌋", "초열동토"], ["BC", "🌾", "온대초원"], ["BD", "❄️", "빙황무지"], ["BE", "🧊", "하얀사막"], ["CD", "🍁", "온냉대림"], ["CE", "🏔️", "빙하의봄"], ["DE", "🌌", "극한겨울"],
  ["ABC", "🏺", "열대오아"], ["ABD", "🌋", "화산황무"], ["ABE", "☄️", "열사빙하"], ["ACD", "🌿", "사계정글"], ["ACE", "🌊", "간헐천섬"], ["ADE", "🧊", "녹는빙하"], ["BCD", "🐎", "유라시아"], ["BCE", "🏜️", "대륙빙하"], ["BDE", "🌬️", "시베리아"], ["CDE", "🌲", "북유럽숲"],
  ["ABCD", "⛰️", "거대대륙"], ["ABCE", "🗺️", "사막빙도"], ["ABDE", "🌋", "극지화산"], ["ACDE", "❄️", "녹색빙해"], ["BCDE", "🌬️", "북반구대"], ["ABCDE", "🌍", "지구"],
] as const;
const fusions = Object.fromEntries(fusionEntries.map(([key, icon, name]) => [key, { icon, name, color: key.length === 5 ? "#4e92c6" : "#886d98" }]));
function nodeFor(key: string): ClimateNode {
  const node = climateNodes[key] ?? { code: key, ...fusions[key], size: key === "ABCDE" ? 183 : 207 };
  return { ...node, size: Math.round(node.size * 0.96) };
}

function ClimateMerge() {
  const [pieces, setPieces] = useState<ClimatePiece[]>([]);
  const [activePrimary, setActivePrimary] = useState<Primary>("A");
  const [nextKey, setNextKey] = useState("Am");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [ready, setReady] = useState(true);
  const [previewX, setPreviewX] = useState(320);
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
  const gameWidth = 640;
  const gameHeight = 800;
  const basketRim = 92;
  const basketInset = 18;
  const basketBottom = 778;
  const activeGroup = climateGroups.find((group) => group.id === activePrimary)!;
  const randomDropKey = useCallback((group: (typeof climateGroups)[number]) => {
    const candidates = group.chain.slice(0, Math.min(3, group.chain.length - 1));
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, []);

  useEffect(() => {
    setNextKey(randomDropKey(activeGroup));
  }, [activePrimary, activeGroup, randomDropKey]);

  const playMergeSound = (kind: "step" | "region" | "earth") => {
    try {
      const context = audioContextRef.current ?? new AudioContext();
      audioContextRef.current = context;
      const notes = kind === "earth" ? [261.6, 329.6, 392, 523.2, 659.2] : kind === "region" ? [392, 523.2, 659.2] : [440, 554.4];
      const play = () => notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator(); const gain = context.createGain(); const start = context.currentTime + index * (kind === "earth" ? 0.1 : 0.055);
        oscillator.type = kind === "earth" ? "sine" : "triangle"; oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(kind === "earth" ? 0.07 : 0.045, start); gain.gain.exponentialRampToValueAtTime(0.001, start + (kind === "earth" ? 0.65 : 0.22));
        oscillator.connect(gain).connect(context.destination); oscillator.start(start); oscillator.stop(start + (kind === "earth" ? 0.7 : 0.25));
      });
      if (context.state === "suspended") void context.resume().then(play); else play();
    } catch { /* audio is optional */ }
  };

  const syncPieces = useCallback((force = false) => {
    const engine = engineRef.current;
    if (!engine) return;
    const now = performance.now();
    if (!force && now - lastSyncRef.current < 34) return;
    lastSyncRef.current = now;
    setPieces(
      Matter.Composite.allBodies(engine.world)
        .filter((body): body is ClimateBody => !body.isStatic && Boolean((body as ClimateBody).climateKey))
        .map((body) => ({ id: body.id, key: body.climateKey!, parts: body.climateParts ?? [], x: body.position.x, y: body.position.y, angle: body.angle }))
    );
  }, []);

  const makeClimateBody = useCallback((x: number, y: number, key: string, parts: Primary[] = []) => {
    const node = nodeFor(key);
    const body = Matter.Bodies.circle(x, y, node.size / 2, {
      friction: 0.12,
      frictionStatic: 0.46,
      frictionAir: 0.02,
      restitution: 0.008,
      slop: 0.02,
      label: "climate-piece",
    }) as ClimateBody;
    body.climateKey = key;
    body.climateParts = parts;
    body.popped = false;
    body.sleepThreshold = 30;
    return body;
  }, []);

  useEffect(() => {
    const engine = Matter.Engine.create({
      enableSleeping: true,
      gravity: { x: 0, y: 0.78, scale: 0.001 },
      positionIterations: 8,
      velocityIterations: 6,
    });
    const runner = Matter.Runner.create({ maxFrameTime: 1000 / 30, maxUpdates: 2 });
    const wallOptions = { isStatic: true, friction: 0.3, restitution: 0.015, label: "wall" };
    const walls = [
      Matter.Bodies.rectangle(basketInset - 40, (basketRim + basketBottom) / 2, 80, basketBottom - basketRim + 80, wallOptions),
      Matter.Bodies.rectangle(gameWidth - basketInset + 40, (basketRim + basketBottom) / 2, 80, basketBottom - basketRim + 80, wallOptions),
      Matter.Bodies.rectangle(gameWidth / 2, basketBottom + 48, gameWidth + 160, 96, wallOptions),
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
      setGameOver(true);
      highScoreRef.current = Math.max(highScoreRef.current, scoreRef.current);
      Matter.Runner.stop(runner);
    };

    const onAfterUpdate = () => {
      const now = performance.now();
      const climateBodies = Matter.Composite.allBodies(engine.world).filter(
        (body): body is ClimateBody => !body.isStatic && Boolean((body as ClimateBody).climateKey)
      );

      for (const body of climateBodies) {
        const radius = body.circleRadius ?? 0;
        // This hard guard runs every physics tick: no piece can tunnel below or through the basket walls.
        if (body.position.y + radius > basketBottom) {
          Matter.Body.setPosition(body, { x: body.position.x, y: basketBottom - radius });
          Matter.Body.setVelocity(body, { x: body.velocity.x * 0.2, y: 0 });
        }
        if (body.position.x - radius < basketInset) Matter.Body.setPosition(body, { x: basketInset + radius, y: body.position.y });
        if (body.position.x + radius > gameWidth - basketInset) Matter.Body.setPosition(body, { x: gameWidth - basketInset - radius, y: body.position.y });
        if (now - lastSafetyCheckRef.current < 80) continue;
        if (body.position.y - radius > basketRim) enteredBasketRef.current.add(body.id);
        // Newly dropped pieces may pass the rim; only pieces pushed back out of the basket end the game.
        if (enteredBasketRef.current.has(body.id) && body.position.y - radius < basketRim) {
          endGame();
          break;
        }
      }
      if (now - lastSafetyCheckRef.current >= 80) lastSafetyCheckRef.current = now;
      // Fallback merge sweep: catches equal pieces that came to rest while already overlapping.
      for (let index = 0; index < climateBodies.length; index += 1) {
        for (let other = index + 1; other < climateBodies.length; other += 1) {
          const a = climateBodies[index];
          const b = climateBodies[other];
          if (a.climateKey !== b.climateKey || a.popped || b.popped) continue;
          const distance = Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y);
          if (distance <= ((a.circleRadius ?? 0) + (b.circleRadius ?? 0)) * 0.98) {
            onCollision({ pairs: [{ bodyA: a, bodyB: b }] } as unknown as Matter.IEventCollision<Matter.Engine>);
          }
        }
      }
      syncPieces();
    };

    const onCollision = (event: Matter.IEventCollision<Matter.Engine>) => {
      for (const { bodyA, bodyB } of event.pairs) {
        const a = bodyA as ClimateBody;
        const b = bodyB as ClimateBody;
        if (a.isStatic || b.isStatic) continue;
        if (!a.climateKey || !b.climateKey || a.popped || b.popped) continue;
        const aParts = a.climateParts ?? [];
        const bParts = b.climateParts ?? [];
        const sharesClimate = aParts.some((part) => bParts.includes(part));
        const mergedParts = [...new Set([...aParts, ...bParts])].sort() as Primary[];
        const fusionKey = mergedParts.join("");
        const nextKey = a.climateKey === b.climateKey
          ? climateNodes[a.climateKey]?.next
          : !sharesClimate && aParts.length > 0 && bParts.length > 0 && fusions[fusionKey]
            ? fusionKey
            : undefined;
        const nextParts = a.climateKey === b.climateKey ? (nextKey?.length === 1 ? [nextKey as Primary] : aParts) : mergedParts;
        if (!nextKey) continue;
        a.popped = true;
        b.popped = true;
        const merged = makeClimateBody((a.position.x + b.position.x) / 2, (a.position.y + b.position.y) / 2, nextKey, nextParts);
        Matter.Body.setVelocity(merged, { x: (a.velocity.x + b.velocity.x) * 0.12, y: Math.max(0.05, (a.velocity.y + b.velocity.y) * 0.12) });
        Matter.Body.setAngularVelocity(merged, (a.angularVelocity + b.angularVelocity) * 0.12);
        Matter.Composite.remove(engine.world, [a, b]);
        Matter.Composite.add(engine.world, merged);
        const earned = nextKey === "ABCDE" ? 100000 : fusions[nextKey] ? nextParts.length * 500 : nextKey.length === 1 ? 1000 : 100;
        playMergeSound(nextKey === "ABCDE" ? "earth" : nextKey.length === 1 || Boolean(fusions[nextKey]) ? "region" : "step");
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
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, [makeClimateBody, syncPieces]);

  const queuePreview = (event: PointerEvent<HTMLDivElement>) => {
    const rect = boardRef.current?.getBoundingClientRect();
    const radius = climateNodes[nextKey].size / 2;
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
    if (!readyRef.current || endedRef.current || !engineRef.current) return;
    const radius = climateNodes[nextKey].size / 2;
    const x = Math.max(basketInset + radius, Math.min(gameWidth - basketInset - radius, ((event.clientX - rect.left) / rect.width) * gameWidth));
    Matter.Composite.add(engineRef.current.world, makeClimateBody(x, 42, nextKey));
    setNextKey(randomDropKey(activeGroup));
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
    Matter.Composite.clear(engine.world, false, true);
    Matter.Composite.add(engine.world, wallsRef.current);
    enteredBasketRef.current.clear();
    if (dropDelayRef.current) window.clearTimeout(dropDelayRef.current);
    scoreRef.current = 0;
    endedRef.current = false;
    readyRef.current = true;
    lastSyncRef.current = 0;
    lastSafetyCheckRef.current = 0;
    setPieces([]); setScore(0); setGameOver(false); setReady(true);
    Matter.Runner.run(runner, engine);
  };

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#d8ece5] text-[#17342f]">
      <div className="relative h-full">
        <header className="absolute inset-x-4 top-4 z-50 flex items-center justify-between gap-4 sm:inset-x-7 sm:top-6">
          <Link to="/" className="rounded-full border border-[#c6b58e] bg-[#fffaf0] px-4 py-2 text-xs font-bold transition hover:bg-white">
            ← 게임 선택
          </Link>
          <div className="text-right leading-tight">
            <p className="font-mono text-[10px] tracking-[.16em] text-[#5b7d58]">KÖPPEN CLIMATE MERGE</p>
            <p className="mt-1 text-xl font-black tabular-nums">점수 <span className="text-[#cf6349]">{score}</span></p>
          </div>
        </header>
        <section className="hidden">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-[.18em] text-[#668861]">WORLD CLIMATE ATLAS · 01</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.055em] sm:text-4xl">쾨펜 기후 합치기</h1>
          </div>
          <p className="max-w-sm text-xs leading-relaxed text-[#637565] sm:text-sm">기후 조각을 합쳐 보세요. 원하는 학습 단계 버튼을 눌러 조각에 표시되는 구분 정보를 바꿀 수 있어요.</p>
        </section>
        <nav aria-label="만들 기후 권역" className="absolute right-3 top-1/2 z-[60] w-[76px] -translate-y-1/2 rounded-[20px] border border-white/60 bg-[#fffaf0]/95 p-1.5 shadow-[0_8px_24px_rgba(31,61,51,.22)] backdrop-blur sm:right-6 sm:w-[88px]">
          <div className="grid grid-cols-1 gap-1.5">
            {climateGroups.map((group) => (
              <button key={group.id} type="button" onClick={() => setActivePrimary(group.id)} aria-pressed={activePrimary === group.id} className={`rounded-[16px] px-2 py-3 text-center transition ${activePrimary === group.id ? "bg-[#17342f] text-white shadow-[0_4px_0_#0e241e]" : "bg-[#f4f0e5] text-[#5d705c] hover:bg-[#e8efdF]"}`}>
                <span className="block text-lg font-black leading-none">{group.id}</span>
                <span className={`mt-1 block text-[9px] font-bold ${activePrimary === group.id ? "text-[#dff0d7]" : "text-[#7b8978]"}`}>{group.title}</span>
              </button>
            ))}
          </div>
          <details className="mt-2 border-t border-[#d8d1bb] pt-2 text-[9px] text-[#526650]">
            <summary className="cursor-pointer text-center font-bold">합성 도감</summary>
            <div className="mt-2 max-h-40 space-y-1 overflow-y-auto text-[8px]">
              {fusionEntries.map(([key, icon, name]) => <p key={key}>{key.split("").join("+")} · {icon} {name}</p>)}
            </div>
          </details>
        </nav>
        <div className="h-full">
          <section
            ref={boardRef}
            onPointerMove={queuePreview}
            onPointerDown={drop}
            className="relative mx-auto aspect-[4/5] h-[100dvh] w-auto max-w-full touch-none overflow-hidden rounded-none bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,.64),transparent_24%),linear-gradient(162deg,#b7deeb_0%,#d8ece5_46%,#d9e8b5_47%,#bdd89a_100%)] shadow-[inset_0_0_0_4px_rgba(255,255,255,.48),0_13px_0_#24463c]"
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
            <p className="pointer-events-none absolute left-1/2 top-[74px] z-10 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium tracking-wide text-[#315c4f]/45">
              여기에는 없는 기후도 있기에 전부다 믿지는 마세요
            </p>
            <p className="pointer-events-none absolute left-6 top-[11.5%] z-40 -translate-y-1/2 rounded-full bg-[#8d5626]/80 px-2 py-0.5 font-mono text-[8px] font-bold tracking-[.16em] text-white/90">BASKET RIM</p>
            <p className="pointer-events-none absolute bottom-[5%] left-7 z-20 font-mono text-[9px] tracking-[.22em] text-[#315c4f]/60">MERGE BASKET · CLIMATE BELTS</p>
            {ready && !gameOver && <div className="pointer-events-none absolute top-[38px] z-40 -translate-x-1/2" style={{ left: `${(previewX / gameWidth) * 100}%` }}><div className="h-10 border-l-2 border-dashed border-[#315c4f]/55" /><div className="relative grid h-12 w-12 -translate-x-[23px] place-items-center overflow-hidden rounded-full border-2 border-white/90 text-xs font-black text-[#17342f] shadow-[0_4px_0_rgba(35,78,64,.2)]" style={{ backgroundColor: nodeFor(nextKey).color }}><span className="absolute left-2 top-1 h-3 w-5 rotate-[-28deg] rounded-full bg-white/70" />{nodeFor(nextKey).code}</div></div>}
            {pieces.map((piece) => {
              const climate = nodeFor(piece.key);
              return (
                <div
                  key={piece.id}
                  className="absolute z-20 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-white/85 shadow-[inset_6px_6px_8px_rgba(255,255,255,.3),inset_-7px_-8px_9px_rgba(35,75,61,.2),0_5px_0_rgba(28,72,62,.18),0_7px_13px_rgba(28,72,62,.14)] will-change-transform"
                  style={{
                    left: `${(piece.x / gameWidth) * 100}%`,
                    top: `${(piece.y / gameHeight) * 100}%`,
                    width: `${(climate.size / gameWidth) * 100}%`, aspectRatio: "1 / 1",
                    backgroundColor: climate.color,
                    fontSize: `${climate.size * 0.48}px`,
                    transform: `translate(-50%, -50%) rotate(${piece.angle}rad)`,
                  }}
                >
                  <span className="absolute inset-[8%] rounded-full border border-white/35" />
                  <span className="absolute left-[16%] top-[11%] h-[18%] w-[32%] rotate-[-28deg] rounded-full bg-white/60" />
                  <span className="absolute bottom-[11%] right-[13%] h-[13%] w-[13%] rounded-full bg-white/30" />
                  <span className="relative font-black tracking-[-.1em] text-[#17342f] drop-shadow-[0_1px_0_rgba(255,255,255,.45)]" style={{ fontSize: `${Math.max(10, climate.size * 0.27)}px` }}>{climate.code}</span>
                  <span className="absolute bottom-[15%] text-[.55em] opacity-70">{climate.icon}</span>
                  <span className="absolute -bottom-5 whitespace-nowrap rounded-full border border-white/70 bg-[#fffdf5]/92 px-2 py-0.5 text-[9px] font-bold text-[#274b42]">{climate.name}</span>
                </div>
              );
            })}
          </section>
          <aside className="hidden">
            <p className="font-mono text-[10px] font-bold tracking-[.16em] text-[#668861]">NEXT CLIMATE</p>
            <div className="mx-auto mt-5 grid h-28 w-28 place-items-center rounded-full border-4 border-white text-4xl shadow-[0_7px_0_rgba(28,72,62,.16),0_12px_18px_rgba(28,72,62,.12)]" style={{ backgroundColor: nodeFor(nextKey).color }}>{nodeFor(nextKey).icon}</div>
            <p className="mt-3 text-center font-black">{nodeFor(nextKey).code} · {nodeFor(nextKey).name}</p>
            <p className="mt-1 text-center text-[11px] text-[#6e806d]">같은 조각 2개를 합쳐 다음 단계로 진화</p>
            <div className="mt-6 border-t border-[#e2d7ba] pt-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold">만들 기후 권역</p>
                <span className="rounded-full bg-[#eaf1e3] px-2 py-1 font-mono text-[9px] font-bold text-[#51734f]">{activePrimary} ROUTE</span>
              </div>
              <div className="mt-3 rounded-xl bg-[#f1f5e9] px-3 py-2 text-[10px] leading-relaxed text-[#5f725c]">
                <b>{activeGroup.title}</b> · {activeGroup.chain.join(" → ")} 순서로 합쳐 {activePrimary}를 만드세요. 만든 A–E는 서로 합쳐 새로운 지형이 됩니다.
              </div>
              <div className="mt-5 rounded-2xl border border-[#dce6d7] bg-[#f7faef] p-3 text-center">
                <p className="text-xl">🌍</p>
                <p className="mt-1 text-xs font-bold">A + B + C + D + E</p>
                <p className="mt-1 text-[10px] text-[#657764]">지구 완성 보너스 · 100,000점</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetGame();
              }}
              className="mt-6 w-full rounded-xl bg-[#17342f] py-3 text-sm font-bold text-white transition hover:bg-[#285346]"
            >
              {gameOver ? "다시 도전" : "새로 시작"}
            </button>
          </aside>
        </div>
        {gameOver && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-[#17342f]/60 p-5 backdrop-blur-sm">
            <section className="w-full max-w-sm rounded-[28px] border border-white/30 bg-[#fffaf0] p-8 text-center shadow-2xl">
              <p className="font-mono text-[10px] font-bold tracking-[.2em] text-[#bd4f49]">BASKET OVERFLOW</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.05em]">게임 오버</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#647565]">기후 조각이 3D 바구니 상단을 넘었어요.<br />같은 조각을 합쳐 공간을 만들어 보세요.</p>
              <p className="mt-6 font-mono text-sm font-bold">FINAL SCORE · {score}</p>
              <p className="mt-1 text-[11px] text-[#6e806d]">BEST · {highScoreRef.current}</p>
              <button onClick={resetGame} className="mt-6 w-full rounded-xl bg-[#17342f] py-3 text-sm font-bold text-white transition hover:bg-[#285346]">다시 시작하기</button>
            </section>
          </div>
        )}
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
