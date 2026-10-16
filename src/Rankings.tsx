import { useEffect, useRef, useState } from "react"
import {
  formatDuration,
  topRankings,
  type RankingEntry as Entry,
} from "./rankingRules"

// 외부 파일 참조 없이 코드 내에서 직접 연결 정보를 처리하여 경로 에러 원천 차단
const projectId = "suzzioegsbykdnplddlx"
const publicAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1enppb2Vnc2J5a2RucGxkZGx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDI5MzEsImV4cCI6MjEwNDgxODkzMX0.V_zWT6jxFdd0xWP_hqTo2hNlIyTibmuxv9HRyMcj4PU"

const url = `https://${projectId}.supabase.co`
const apiKey = publicAnonKey
const shared = Boolean(projectId && apiKey)
const storageKey = "geo-rankings-v1"

function localEntries(): Entry[] {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || "[]")
    return Array.isArray(data)
      ? data.filter(
          (row) =>
            typeof row.nickname === "string" && Number.isFinite(row.score),
        )
      : []
  } catch {
    return []
  }
}

async function request(path: string, options?: RequestInit) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) {
    const errText = await response.text().catch(() => "")
    throw new Error(
      `공유 랭킹 통신 실패 (${response.status}): ${errText || "네트워크 상태를 확인해주세요."}`,
    )
  }
  return response.status === 201 || response.status === 204
    ? null
    : response.json()
}

export default function Rankings({
  recordId,
  game,
  score,
  durationMs,
  accuracy = 100,
  onClose,
}: {
  recordId: string
  game: string
  score?: number
  durationMs?: number
  accuracy?: number
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [nickname, setNickname] = useState(() => {
    try {
      return localStorage.getItem("geo-nickname") || ""
    } catch {
      return ""
    }
  })
  const [entries, setEntries] = useState<Entry[]>([])
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [board, setBoard] = useState(game)
  const requestVersion = useRef(0)

  const load = async () => {
    const version = ++requestVersion.current
    setLoading(true)
    setEntries([])
    try {
      const order = board === "climate" ? "score.desc" : "duration_ms.asc"
      const filter =
        board === "climate" ? "" : "&duration_ms=not.is.null&score=eq.197"
      const rows: Entry[] = shared
        ? await request(
            `geo_rankings?game=eq.${board}${filter}&select=*&order=${order},accuracy.desc,created_at.asc,id.asc&limit=100`,
          )
        : localEntries()
      if (version !== requestVersion.current) return
      setEntries(topRankings(rows, board))
      if (rows && rows.some((row) => row.id === recordId && row.game === game))
        setSubmitted(true)
    } finally {
      if (version === requestVersion.current) setLoading(false)
    }
  }

  useEffect(() => {
    dialog.current?.showModal()
    void load().catch((error) => setMessage(error.message))
    return () => {
      requestVersion.current++
    }
  }, [board])

  const submit = async () => {
    if (busy || submitted || score === undefined || score <= 0) return
    if (
      game !== "climate" &&
      (score !== 197 || !Number.isInteger(durationMs) || durationMs! <= 0)
    ) {
      setMessage("197개국을 모두 완주한 기록만 등록할 수 있어요.")
      return
    }
    const name = nickname.trim()
    if (!name || Array.from(name).length > 16) {
      setMessage("닉네임을 1~16자로 입력해주세요.")
      return
    }
    setBusy(true)
    setMessage("")

    const entry: Entry = {
      id: recordId || crypto.randomUUID(),
      nickname: name,
      game,
      score,
      accuracy,
      duration_ms: game === "climate" ? null : durationMs,
      created_at: new Date().toISOString(),
    }

    try {
      if (shared) {
        await request("geo_rankings", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify(entry),
        })
      } else {
        localStorage.setItem(
          storageKey,
          JSON.stringify(
            [
              ...localEntries().filter((row) => row.id !== recordId),
              entry,
            ].slice(-500),
          ),
        )
      }
      try {
        localStorage.setItem("geo-nickname", name)
      } catch {}
      setSubmitted(true)
      try {
        await load()
        setMessage(
          shared
            ? "공유 랭킹에 기록을 저장했어요. 다른 학생들도 확인할 수 있어요."
            : "이 브라우저에만 저장했어요.",
        )
      } catch {
        setMessage(
          "기록은 저장됐지만 목록을 불러오지 못했어요. 랭킹 새로고침을 눌러주세요.",
        )
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "기록을 저장하지 못했어요.",
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      className="ranking-dialog"
      aria-labelledby="ranking-title"
    >
      <header>
        <div>
          <p>GEO PLAYROOM · RANKINGS</p>
          <h2 id="ranking-title">
            {game === "climate"
              ? "기후게임"
              : `타자연습 · ${
                  game.startsWith("typing-ko") ? "한국어" : "English"
                } · ${board.endsWith("-hard") ? "하드모드" : "일반모드"}`}{" "}
            랭킹
          </h2>
        </div>
        <button type="button" onClick={onClose}>
          닫기 ×
        </button>
      </header>
      {game !== "climate" && (
        <div className="ranking-modes" role="group" aria-label="랭킹 난이도">
          {[false, true].map((hard) => {
            const key = `${game.replace(/-hard$/, "")}${hard ? "-hard" : ""}`
            return (
              <button
                key={key}
                type="button"
                disabled={busy}
                aria-pressed={board === key}
                onClick={() => {
                  setMessage("")
                  setBoard(key)
                }}
              >
                {hard ? "하드모드" : "일반모드"}
              </button>
            )
          })}
        </div>
      )}
      <p className="rank-description">
        {shared
          ? "전체 사용자 공유 랭킹 · 같은 배포 링크로 접속한 학생들의 기록을 함께 표시해요."
          : "공유 랭킹 설정 전 · 현재는 이 브라우저에만 저장돼요."}
      </p>
      <p className="rank-description">
        {game === "climate"
          ? "게임 오버 후 최종 점수로 상위 100개 기록을 표시해요."
          : "197개국 완주 시간이 짧은 순서로 TOP 100을 표시해요. 동점은 정확도 순, 언어와 일반·하드모드는 각각 별도 랭킹이에요."}
      </p>
      <button
        type="button"
        disabled={loading || busy}
        onClick={() => {
          setMessage("")
          void load().catch((error) => setMessage(error.message))
        }}
      >
        랭킹 새로고침
      </button>
      {score !== undefined && board === game && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
          className="rank-register"
        >
          <label htmlFor="rank-nickname">
            닉네임 <span>실명 대신 별명을 사용하세요</span>
          </label>
          <input
            id="rank-nickname"
            value={nickname}
            maxLength={16}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="여행자 이름"
            autoComplete="nickname"
            disabled={busy || submitted}
          />
          <button type="submit" disabled={busy || submitted || score <= 0}>
            {submitted
              ? "등록 완료"
              : busy
                ? "등록 중…"
                : `${
                    game === "climate"
                      ? `${score.toLocaleString()}점`
                      : formatDuration(durationMs!)
                  } 기록 등록`}
          </button>
        </form>
      )}
      <p role="status" className="rank-message">
        {message}
      </p>
      <div className="rank-table-scroll" aria-busy={loading}>
        <table>
          <thead>
            <tr>
              <th>순위</th>
              <th>닉네임</th>
              <th>{game === "climate" ? "점수" : "완주 시간"}</th>
              {game !== "climate" && <th>정확도</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id}>
                <td>{index + 1}</td>
                <td>{entry.nickname}</td>
                <td>
                  {game === "climate"
                    ? entry.score.toLocaleString()
                    : formatDuration(entry.duration_ms!)}
                </td>
                {game !== "climate" && <td>{entry.accuracy}%</td>}
              </tr>
            ))}
          </tbody>
        </table>
        {loading ? (
          <p className="rank-empty">랭킹을 불러오는 중…</p>
        ) : (
          !entries.length &&
          !message && (
            <p className="rank-empty">
              아직 등록된 기록이 없어요. 첫 번째 여행자가 되어보세요.
            </p>
          )
        )}
      </div>
      <p className="rank-description">
        닉네임은 계정이 아니며 중복될 수 있어요. 이 랭킹은 학습용으로, 공식
        경쟁용 점수 검증은 제공하지 않습니다.
      </p>
    </dialog>
  )
}
