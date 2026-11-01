export const ICE_SCALE = 1.3

const seasons = [
  {
    id: "spring",
    name: "봄",
    description: "봄바람 · 얼음은 여름까지 유지돼요",
  },
  {
    id: "summer",
    name: "여름",
    description: "해빙 · 놓을 때마다 무작위 얼음 공 최대 2개가 녹아요",
  },
  {
    id: "autumn",
    name: "가을",
    description: "가을바람 · 놓을 때마다 풍향과 풍속이 바뀌어요",
  },
  {
    id: "winter",
    name: "겨울",
    description: "놓을 때마다 무작위 공 하나 결빙 · 개수 제한 없음",
  },
] as const

const randomSeasonLength = (random: () => number) =>
  3 + Math.floor(random() * 8)

function wind(random: () => number) {
  return {
    direction: random() < 0.5 ? -1 : 1,
    speed: Math.floor(random() * 101),
  }
}

export type ClimateWeather = Omit<typeof seasons[number], "name" | "description"> & {
  name: string
  description: string
  isDeepWinter: boolean
  seasonIndex: number
  remainingDrops: number
  direction: number
  speed: number
}

export function createClimateWeather(random = Math.random): ClimateWeather {
  return {
    ...seasons[0],
    isDeepWinter: false,
    seasonIndex: 0,
    remainingDrops: randomSeasonLength(random),
    ...wind(random),
  }
}

// Only an accepted drop advances the season; wall time and physics frames do not.
export function weatherAfterDrop(
  previous: ClimateWeather,
  random = Math.random,
): ClimateWeather {
  const changesSeason = previous.remainingDrops <= 1
  const seasonIndex = changesSeason
    ? (previous.seasonIndex + 1) % seasons.length
    : previous.seasonIndex
  const nextWind = wind(random)
  // A cold snap can begin on any winter drop and lasts until spring.
  const isDeepWinter = seasons[seasonIndex].id === "winter" &&
    ((!changesSeason && previous.isDeepWinter) || random() < 0.1)
  return {
    ...seasons[seasonIndex],
    ...(isDeepWinter ? {
      name: "한겨울",
      description: "강추위 · 놓을 때마다 무작위 공 3개 결빙 · 여름에 해빙",
    } : {}),
    isDeepWinter,
    seasonIndex,
    remainingDrops: changesSeason
      ? randomSeasonLength(random)
      : previous.remainingDrops - 1,
    ...nextWind,
  }
}

// 0 means calm; 1–100 is game intensity, not a real-world wind-speed unit.
export function climateWindForce(
  weather: Pick<ClimateWeather, "direction" | "speed">,
) {
  return weather.speed === 0 ? 0 : weather.direction * weather.speed * 0.000006
}
