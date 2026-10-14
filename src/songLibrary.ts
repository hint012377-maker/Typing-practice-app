export type Difficulty = "easy" | "normal" | "hard";
export type Song = { id: string; title: string; artist: string; bpm: number; offset: number; duration: number; addedAt: number; url: string };
export type StoredSong = Omit<Song, "url"> & { file: Blob };
export const difficulties: { id: Difficulty; label: string; division: number }[] = [
  { id: "easy", label: "쉬움", division: 1 },
  { id: "normal", label: "보통", division: 2 },
  { id: "hard", label: "어려움", division: 4 },
];

async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("geo-rhythm-songs", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("songs", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("이 브라우저에서 음원 보관함을 열 수 없어요."));
  });
}

export async function storedSongs(): Promise<StoredSong[]> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("songs", "readonly");
    const request = transaction.objectStore("songs").getAll();
    transaction.oncomplete = () => { db.close(); resolve(request.result); };
    transaction.onerror = () => { db.close(); reject(new Error("보관함을 읽지 못했어요.")); };
  });
}

export async function saveSong(song: StoredSong) {
  const db = await database();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction("songs", "readwrite");
    transaction.objectStore("songs").put(song);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onabort = () => { db.close(); reject(new Error("저장 공간이 부족하거나 음원 저장이 제한되어 있어요.")); };
    transaction.onerror = () => { db.close(); reject(new Error("음원을 저장하지 못했어요.")); };
  });
}

export function audioDuration(url: string) {
  return new Promise<number>((resolve, reject) => {
    const player = new Audio();
    const timer = window.setTimeout(() => finish(new Error("음원을 읽는 데 너무 오래 걸려요.")), 15000);
    function finish(error?: Error) {
      clearTimeout(timer);
      const duration = player.duration;
      player.onloadedmetadata = null; player.onerror = null;
      player.removeAttribute("src"); player.load();
      if (error) reject(error); else resolve(duration);
    }
    player.preload = "metadata";
    player.onloadedmetadata = () => finish();
    player.onerror = () => finish(new Error("재생할 수 없는 음원이에요. MP3, WAV, OGG 파일을 확인해주세요."));
    player.src = url;
  });
}
