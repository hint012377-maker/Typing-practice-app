import { memo } from "react";

function ClimateLandscape() {
  return (
    <div className="climate-cosmos" aria-hidden="true">
      <svg className="climate-daylight" viewBox="0 0 960 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="climate-day-glow">
            <stop stopColor="#fff7da" stopOpacity=".55" />
            <stop offset="1" stopColor="#fff7da" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="climate-cloud-light" x2="0" y2="1">
            <stop stopColor="#fffff4" stopOpacity=".65" />
            <stop offset="1" stopColor="#eff9f4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="760" cy="125" rx="330" ry="310" fill="url(#climate-day-glow)" />
        <g fill="url(#climate-cloud-light)">
          <path d="M-80 190q35-40 80-22 10-42 56-36 27-52 77-25 40-28 73 17 42-8 65 28 50-10 75 38Z" />
          <path d="M610 350q34-36 71-19 26-46 74-23 44-40 80 8 56-20 88 34 48-15 90 31H590Z" />
        </g>
      </svg>
      <svg className="climate-starfield" viewBox="0 0 960 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="climate-nebula">
            <stop stopColor="currentColor" stopOpacity=".35" />
            <stop offset=".45" stopColor="currentColor" stopOpacity=".12" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="climate-galaxy-glow">
            <stop stopColor="#fff0cf" stopOpacity=".8" />
            <stop offset=".18" stopColor="#d4bce9" stopOpacity=".45" />
            <stop offset="1" stopColor="#9596d0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="cosmic-nebula" fill="url(#climate-nebula)">
          <ellipse cx="710" cy="300" rx="460" ry="210" transform="rotate(-32 710 300)" />
          <ellipse cx="100" cy="670" rx="300" ry="180" />
        </g>
        {Array.from({ length: 90 }, (_, index) => (
          <circle key={index} cx={(index * 137.51 + 43) % 960} cy={(index * 83.37 + 29) % 890} r={index % 7 === 0 ? 1.6 : 0.7} opacity={0.3 + (index % 5) * 0.13} className="cosmic-star" />
        ))}
        <g className="cosmic-solar-system" fill="none">
          <ellipse cx="480" cy="817" rx="285" ry="32" />
          <ellipse cx="480" cy="817" rx="405" ry="58" />
          <circle className="cosmic-sun-halo" cx="296" cy="815" r="44" fill="url(#climate-galaxy-glow)" />
          <circle className="cosmic-sun" cx="296" cy="815" r="15" />
          <circle className="cosmic-planet" cx="728" cy="803" r="9" />
          <ellipse cx="728" cy="803" rx="20" ry="5" transform="rotate(-25 728 803)" />
        </g>
        <g className="cosmic-galaxy" transform="translate(480 830) rotate(-18)">
          <ellipse rx="190" ry="55" fill="url(#climate-galaxy-glow)" stroke="none" />
          <g fill="none">
            <path d="M-157 9C-104-38 60-47 110-14S34 36-24 16-14-13 19-4" />
            <path d="M142-7C91 33-73 43-115 10S-32-31 24-13 15 11-16 3" />
          </g>
          <ellipse rx="13" ry="3" className="cosmic-galaxy-core" />
        </g>
      </svg>
      <div className="climate-earth">
        <svg viewBox="0 0 400 400">
          <defs>
            <radialGradient id="climate-earth-ocean" cx="32%" cy="22%" r="85%">
              <stop stopColor="#8cd6d6" />
              <stop offset=".5" stopColor="#3a8ba8" />
              <stop offset="1" stopColor="#102e4c" />
            </radialGradient>
            <linearGradient id="climate-earth-land" x2=".7" y2="1">
              <stop className="earth-land-light" />
              <stop offset="1" className="earth-land-shadow" />
            </linearGradient>
            <radialGradient id="climate-earth-shade" cx="28%" cy="24%" r="80%">
              <stop offset=".35" stopColor="#071d35" stopOpacity="0" />
              <stop offset="1" stopColor="#071d35" stopOpacity=".75" />
            </radialGradient>
            <clipPath id="climate-earth-clip"><circle cx="200" cy="200" r="198" /></clipPath>
          </defs>
          <g clipPath="url(#climate-earth-clip)">
            <circle cx="200" cy="200" r="200" fill="url(#climate-earth-ocean)" />
            <g className="earth-continents" fill="url(#climate-earth-land)">
              <path d="M29 83Q41 56 79 44t52 18q23 9 7 26t2 26q6 11-15 20t-12 22q-3 19-16 11t-14-24q-7-15-24-9T42 110Z" />
              <path d="M113 186q25-16 46 9t10 42l-19 29q6 28-18 55-9-32-14-44t-13-31q-10-15 3-32Z" />
              <path d="M178 65q20-30 51-24t40 8q32-3 61 30t21 29q-5 23-29 15t-33 13q-12 17-29 3t-14 12q-9 8-23-3t-23-23q-27-3-15-23t-7-20Z" />
              <path d="M202 151q18-15 38-8t30 23q15 24-4 52t-28 25q-14-1-20-23t-14-38q-26-19-2-31Z" />
              <path d="M307 267q29-19 51 0t14 30q-16 18-44 3t-21-33ZM168 15q23-12 33-3t-10 20q-29 14-23-17Z" />
            </g>
            <g className="earth-clouds" fill="none">
              <path d="M28 89q57-37 109-5m36-25q66-18 122 22M58 193q48-28 91-5m115-10q57-23 100 0M169 299q72 27 131-8M61 330q67 33 132 21" />
              <path d="M82 99q32-14 65-2m72 75q43-15 78 2M91 293q39 15 71 6" />
            </g>
            <circle cx="200" cy="200" r="200" fill="url(#climate-earth-shade)" />
          </g>
          <circle className="earth-atmosphere" cx="200" cy="200" r="198" />
        </svg>
      </div>
      <svg className="climate-city" viewBox="0 0 960 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="climate-city-light" x2="0" y2="1">
            <stop stopColor="#9eb9ba" />
            <stop offset="1" stopColor="#567e80" />
          </linearGradient>
        </defs>
        <g className="city-distant">
          {Array.from({ length: 22 }, (_, index) => {
            const height = 26 + (index * 37) % 74;
            return <rect key={index} x={index * 47 - 20} y={238 - height} width={28 + (index % 3) * 8} height={height} rx="2" />;
          })}
        </g>
        <path className="city-park" d="M0 252q160-45 320-15t320 0 320 9v54H0Z" />
        <g className="city-buildings" fill="url(#climate-city-light)">
          {Array.from({ length: 15 }, (_, index) => {
            const height = 42 + ((index * 47) % 113);
            const width = 29 + (index % 4) * 7;
            const x = index * 73 - 42;
            const windows = Array.from({ length: Math.floor(height / 18) - 1 }, (_, row) =>
              `M${x + 8} ${281 - height + row * 17}h4m8 0h4`
            ).join(" ");
            return <g key={index}>
              <rect x={x} y={263 - height} width={width} height={height} rx="2" />
              <path className="city-building-side" d={`M${x + width - 7} ${263 - height}h7v${height}h-7Z`} />
              <path className="city-rooftop" d={`M${x + 7} ${263 - height}v-6h${width - 14}v6Z`} />
              {index % 4 === 2 && <path className="city-antenna" d={`M${x + width / 2} ${257 - height}v-18`} />}
              <path className="city-windows" d={windows} />
            </g>;
          })}
        </g>
        <path className="city-road" d="M0 278q300-8 480 0t480 0" />
        <path className="city-road-markings" d="M0 278q300-8 480 0t480 0" />
        <g className="city-trees">
          {Array.from({ length: 11 }, (_, index) => <g key={index} transform={`translate(${index * 97 + 14} 261)`}>
            <path d="M0 8V-8" /><ellipse cy="-12" rx={8 + index % 3} ry={12 + index % 4} />
          </g>)}
        </g>
      </svg>
      <svg className="climate-grass" viewBox="0 0 960 280" preserveAspectRatio="none">
        <defs>
          <linearGradient id="climate-meadow" x2="0" y2="1">
            <stop className="meadow-light" />
            <stop offset="1" className="meadow-shadow" />
          </linearGradient>
        </defs>
        <path className="meadow-distant" d="M0 190q130-47 300-12t310-8 350 8v102H0Z" />
        <path fill="url(#climate-meadow)" d="M0 218q180-41 390-7t570-18v87H0Z" />
        <g className="meadow-fine-grass" fill="none">
          {Array.from({ length: 42 }, (_, index) => {
            const x = (index * 83) % 980;
            const y = 237 + (index % 4) * 9;
            return <path key={index} d={`M${x} ${y}q-7-16-4-28m4 28q3-17 11-22`} />;
          })}
        </g>
        {Array.from({ length: 36 }, (_, index) => {
          const x = (index * 137) % 980;
          const height = 30 + (index * 31) % 81;
          const lean = (index % 2 ? 1 : -1) * (9 + index % 17);
          return <g key={index} className="grass-blade">
            <path d={`M${x} 280q${lean - 15} -${height * .6} ${lean} -${height}q-4 ${height * .55} ${-lean + 5} ${height}Z`} />
            {index % 3 === 0 && <path d={`M${x} 280q15 -${height * .6} 34 -${height * .7}q-19 ${height * .2}-29 ${height * .7}Z`} />}
          </g>;
        })}
        <g className="grass-flowers">
          {[104, 249, 617, 822].map((x, index) => <g key={x} transform={`translate(${x} ${245 + index % 2 * 10})`}>
            <path d="M0 10q-3-17 2-30m-2 22q-8-8-12-5" />
            <circle cx="2" cy="-21" r="3" /><circle cx="6" cy="-18" r="3" /><circle cx="1" cy="-15" r="3" /><circle cx="-2" cy="-19" r="3" />
            <circle className="grass-flower-center" cx="2" cy="-18" r="2" />
          </g>)}
        </g>
      </svg>
      <svg className="climate-low-clouds" viewBox="0 0 960 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id="climate-low-mist" x2="0" y2="1">
            <stop stopColor="#f2f8ee" stopOpacity=".45" />
            <stop offset="1" stopColor="#f2f8ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path fill="url(#climate-low-mist)" d="M-40 85q36-35 80-17 15-42 58-25 36-32 72 7 55-20 92 27 49-10 76 20h145q46-39 89-17 27-43 74-24 41-31 79 12 55-22 91 26 50-16 84 16v50H-40Z" />
      </svg>
      <div className="climate-ground-mist" />
    </div>
  );
}

export default memo(ClimateLandscape);
