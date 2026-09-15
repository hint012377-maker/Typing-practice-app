import {
  ChangeEvent,
  CompositionEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Country = {
  code: string;
  korean: string;
  english: string;
  lat: number;
  lng: number;
  zoom: number;
};

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

const mapUrl = (country: Country) =>
  `https://maps.google.com/maps?q=${country.lat},${country.lng}&z=${Math.min(
    country.zoom + 1,
    10,
  )}&output=embed&hl=ko`;

const MapFrames = memo(function MapFrames({
  index,
  loaded,
  onLoaded,
}: {
  index: number;
  loaded: Record<string, boolean>;
  onLoaded: (code: string) => void;
}) {
  const visibleCountries = [
    lesson[index],
    lesson[(index + 1) % lesson.length],
  ];
  const current = lesson[index];

  return (
    <>
      {visibleCountries.map((country) => (
        <iframe
          key={country.code}
          src={mapUrl(country)}
          title={`${country.korean} 위치 지도`}
          onLoad={() => onLoaded(country.code)}
          aria-hidden={country.code !== current.code}
          tabIndex={country.code === current.code ? 0 : -1}
          className={`absolute inset-0 h-full w-full border-0 transition-[opacity,transform] duration-500 ease-out ${
            country.code === current.code
              ? "z-10 scale-100 opacity-100"
              : "pointer-events-none z-0 scale-105 opacity-0"
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

export default function App() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const advancing = useRef(false);
  const audioContext = useRef<AudioContext | null>(null);

  const current = lesson[index];
  const target = current.korean;

  useEffect(() => {
    const timer = window.setInterval(
      () => setElapsed((value) => value + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    advancing.current = false;
    inputRef.current?.focus();
  }, [index]);

  const markLoaded = useCallback(
    (code: string) =>
      setLoaded((value) =>
        value[code] ? value : { ...value, [code]: true },
      ),
    [],
  );

  const getAudio = () => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }
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
    };

    if (context.state === "suspended") {
      void context.resume().then(strike);
    } else {
      strike();
    }
  };

  const advance = () => {
    if (advancing.current) return;
    advancing.current = true;

    setCorrect((value) => value + 1);
    setTyped("");
    setInputValue("");
    setIndex((value) => (value + 1) % lesson.length);
  };

  const commit = (next: string) => {
    if (next === target) {
      advance();
      return;
    }

    if (target.startsWith(next)) {
      setTyped(next);
      setInputValue(next);
      return;
    }

    if (next.length > typed.length) {
      setErrors((value) => value + 1);
    }

    setInputValue(typed);
  };

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;

    if (composing.current) {
      setInputValue(next);
      return;
    }

    if (next.length > inputValue.length) {
      playKeySound();
    }

    commit(next);
  };

  const onCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    composing.current = false;

    if (event.currentTarget.value.length > typed.length) {
      playKeySound();
    }

    commit(event.currentTarget.value);
  };

  const accuracy =
    correct + errors === 0
      ? 100
      : Math.round((correct / (correct + errors)) * 100);

  const typedPerMinute = useMemo(
    () =>
      elapsed ? Math.round(((correct * 4 + typed.length) / elapsed) * 60) : 0,
    [correct, elapsed, typed.length],
  );

  const time = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(
    elapsed % 60,
  ).padStart(2, "0")}`;

  return (
    <main className="flex min-h-screen flex-col overflow-hidden bg-[#edf3ec] text-[#17231a]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#d7e2d5] bg-white px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-[#3b9d44] text-sm font-black text-white">
            T
          </span>
          <div>
            <p className="text-sm font-bold">Country Typing</p>
            <p className="text-[10px] font-medium text-[#809080]">
              세계시민과 지리 · 나라 이름 연습
            </p>
          </div>
        </div>
        <p className="hidden font-mono text-[11px] text-[#778778] sm:block">
          LESSON 01 / WORLD MAP
        </p>
      </header>

      <section className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between bg-white/90 px-5 py-3 sm:px-10">
          <p className="text-sm font-semibold text-[#3b9d44]">
            {String(index + 1).padStart(2, "0")}
            <span className="font-normal text-[#95a295]">
              {" "}
              / {String(lesson.length).padStart(2, "0")} 국가
            </span>
          </p>
          <p className="text-xs text-[#748174]">
            나라의 위치를 보고 이름을 입력하세요.
          </p>
        </div>

        <div className="relative z-0 h-[58vh] min-h-[440px] shrink-0 overflow-hidden bg-[#dce8db]">
          <MapFrames index={index} loaded={loaded} onLoaded={markLoaded} />

          <div className="absolute right-5 top-5 z-30 sm:right-10">
            <button
              onClick={() => {
                setTyped("");
                setInputValue("");
                inputRef.current?.focus();
              }}
              className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#4a5b4c] shadow-sm"
            >
              다시 입력
            </button>
          </div>
        </div>

        <div className="relative z-50 shrink-0 border-t border-[#cfe0cf] bg-white px-4 pb-5 pt-0 shadow-[0_-10px_28px_rgba(24,52,28,.10)] sm:px-8">
          <div className="mx-auto -mt-6 grid max-w-2xl grid-cols-4 overflow-hidden rounded-2xl border border-[#cbd9ca] bg-white shadow-[0_8px_24px_rgba(32,67,35,.18)]">
            {[
              { label: "시간", value: time },
              { label: "분당 타수", value: typedPerMinute },
              { label: "정확도", value: `${accuracy}%` },
              { label: "정답", value: correct },
            ].map((stat) => (
              <div
                key={stat.label}
                className="border-r border-[#d8e3d7] px-1 py-3 text-center last:border-r-0"
              >
                <p className="text-[11px] font-bold text-[#526c55]">
                  {stat.label}
                </p>
                <p className="mt-1 text-base font-extrabold tabular-nums text-[#19351d]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div
            onClick={() => inputRef.current?.focus()}
            className="mx-auto mt-5 max-w-3xl cursor-text text-center"
            role="button"
            tabIndex={0}
          >
            <p className="text-xs font-semibold text-[#7b897b]">
              아래 나라 이름을 보고 그대로 타이핑하세요
            </p>

            <div className="mt-2 border-y-4 border-[#3b9d44] py-3">
              <p className="text-3xl font-bold tracking-[.15em] text-[#273b29] sm:text-5xl">
                {target}
              </p>

              <div className="mt-3 flex justify-center gap-2 text-2xl font-bold sm:text-3xl">
                {Array.from(target).map((char, charIndex) => (
                  <span
                    key={`${char}-${charIndex}`}
                    className={`grid h-10 min-w-10 place-items-center rounded-lg ${
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

              <p className="mt-2 text-xs font-medium text-[#829082]">
                {current.english}
              </p>
            </div>
          </div>

          <input
            ref={inputRef}
            value={inputValue}
            onChange={onInput}
            onCompositionStart={() => {
              composing.current = true;
            }}
            onCompositionEnd={onCompositionEnd}
            className="sr-only"
            aria-label="나라 이름 입력"
            autoComplete="off"
          />

          <p className="mt-4 text-center text-[11px] text-[#8a968a]">
            글자 단위로 입력 진행을 확인할 수 있어요
          </p>
        </div>
      </section>
    </main>
  );
}
