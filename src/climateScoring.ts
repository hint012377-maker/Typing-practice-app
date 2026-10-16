export const climatePoints: Record<string, number> = {
  Aw: 10, Am: 20, Af: 40, BS: 80, BW: 150, Cfb: 300, Cfa: 600,
  Df: 1000, Dw: 1800, Ds: 3000, ET: 4500, EF: 6500, Earth: 10000,
};

export function comboReward(count: number) {
  const labels = ["Good!", "Great!", "Perfect!", "Excellent!", "Marvelous!!"];
  const bonuses = [25, 50, 100, 175, 250];
  if (count < 1) return { label: "", points: 0 };
  return {
    label: `${labels[Math.min(count, 5) - 1]}${count > 5 ? ` +${count - 5}` : ""}`,
    points: count <= 5 ? bonuses[count - 1] : 250 + (count - 5) * 75,
  };
}
