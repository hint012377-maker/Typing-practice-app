export type RankingEntry = {
  id: string; nickname: string; game: string; score: number; accuracy: number;
  created_at: string; duration_ms?: number | null;
};

export function formatDuration(milliseconds: number) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor(milliseconds / 1000) % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds % 1000).padStart(3, "0")}`;
}

export function topRankings(rows: RankingEntry[], game: string) {
  return rows.filter(row => row.game === game && (game === "climate" || (
    row.score === 197 && Number.isInteger(row.duration_ms) && row.duration_ms! > 0
  ))).sort((a, b) => (
    game === "climate" ? b.score - a.score : a.duration_ms! - b.duration_ms!
  ) || b.accuracy - a.accuracy || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id)).slice(0, 100);
}
