import { memo, useId, type CSSProperties } from "react";

export default memo(function ClimateWind({ speed }: { speed: number }) {
  const id = useId().replace(/:/g, "");
  const ink = `wind-ink-${id}`;
  const haze = `wind-haze-${id}`;

  return (
    <svg className="climate-weather-fx" data-force={speed === 0 ? "calm" : speed < 30 ? "light" : speed < 65 ? "steady" : "strong"} viewBox="0 0 960 900" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={ink} x1="0" y1="0" x2="660" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--cosmic-wind)" stopOpacity="0" />
          <stop offset=".14" stopColor="var(--cosmic-wind)" stopOpacity=".5" />
          <stop offset=".44" stopColor="var(--cosmic-wind)" stopOpacity="1" />
          <stop offset=".76" stopColor="var(--cosmic-wind)" stopOpacity=".7" />
          <stop offset="1" stopColor="var(--cosmic-wind)" stopOpacity="0" />
        </linearGradient>
        <filter id={haze} x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      {Array.from({ length: 8 }, (_, index) => {
        const bend = (26 + (index % 3) * 16) * (index % 2 ? -1 : 1);
        const curve = `M0 0 C100 ${-bend} 190 ${-bend} 310 0 S520 ${bend} 660 -8`;
        return (
          <g key={index} transform={`translate(0 ${80 + ((index * 233) % 750)})`}>
            <g className="climate-wind-gust" style={{
              "--gust-duration": `${(11.5 - speed * 0.075) * (0.85 + (index % 4) * 0.16)}s`,
              "--gust-delay": `${-index * 2.73 - 1.8}s`,
              "--gust-drift": `${index % 2 ? -22 : 30}px`,
              "--gust-opacity": 0.86 + (index % 3) * 0.07,
            } as CSSProperties}>
              <g transform={`scale(${0.72 + (index % 4) * 0.15} ${0.8 + (index % 3) * 0.2})`} stroke={`url(#${ink})`} fill="none" strokeLinecap="round">
                <path d={curve} strokeWidth="20" opacity=".24" filter={`url(#${haze})`} />
                <path d={curve} strokeWidth="4" opacity="1" />
                <path d={`M12 1 C105 ${-bend - 12} 196 ${-bend - 15} 312 -6 S516 ${bend + 8} 654 -8`} strokeWidth="2.2" opacity=".8" />
                <path d={`M28 2 C118 ${-bend + 14} 200 ${-bend + 19} 306 9 S510 ${bend - 7} 644 -7`} strokeWidth="2.6" opacity=".7" />
                <path d={`M70 0 C153 ${-bend + 25} 226 ${-bend + 22} 326 12 S525 ${bend - 15} 628 -6`} strokeWidth="1.4" opacity=".55" />
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
});
