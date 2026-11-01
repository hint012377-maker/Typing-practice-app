export const climateScaleStages = [
  { score: 0, id: "surface", name: "지표면의 작은 바구니", earth: 420 },
  { score: 20000, id: "meadow", name: "풀밭 너머", earth: 420 },
  { score: 60000, id: "city", name: "도시 위", earth: 420 },
  { score: 150000, id: "clouds", name: "구름 위", earth: 220 },
  { score: 300000, id: "stratosphere", name: "성층권을 넘어", earth: 110 },
  { score: 500000, id: "space", name: "우주로 진출", earth: 50 },
  { score: 700000, id: "planet", name: "지구보다 큰 바구니", earth: 10 },
  { score: 850000, id: "solar", name: "태양계를 넘어", earth: 8 },
  { score: 1000000, id: "galaxy", name: "은하 너머까지", earth: 3 },
] as const;

export function climateScale(score: number) {
  const points = Number.isFinite(score) ? Math.max(0, score) : 0;
  let index = 0;
  while (index + 1 < climateScaleStages.length && points >= climateScaleStages[index + 1].score) index++;
  const stage = climateScaleStages[index];
  const next = climateScaleStages[index + 1];
  const progress = next ? (points - stage.score) / (next.score - stage.score) : 1;
  const growth = Math.min(1, points / climateScaleStages.at(-1)!.score);
  return {
    stage, next, index, progress,
    earthSize: stage.earth + ((next?.earth ?? stage.earth) - stage.earth) * progress,
    basketScale: 0.9 + growth * 0.1,
    stars: Math.min(1, Math.max(0, (growth - 0.25) * 2)),
    grassOpacity: Math.max(0, 1 - points / 60000),
    cityOpacity: Math.min(1, Math.max(0, (points - 20000) / 40000)) * Math.max(0, 1 - Math.max(0, points - 100000) / 50000),
    cityScale: 1 - Math.min(1, Math.max(0, (points - 60000) / 90000)) * 0.55,
    earthOpacity: Math.min(1, Math.max(0, (points - 100000) / 50000)),
  };
}
