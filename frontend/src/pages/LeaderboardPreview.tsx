import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getQuizLeaderboard, getQuizById } from '../lib/quizApi'
import type { LeaderboardEntry } from '../types/api'

export function LeaderboardPreview() {
  const { id } = useParams()
  const [board, setBoard] = useState<LeaderboardEntry[]>([])
  const [quizTitle, setQuizTitle] = useState<string>('')

  useEffect(() => {
    if (!id) return

    void getQuizLeaderboard(id)
      .then((data) => setBoard(data.slice(0, 10)))
      .catch(() => setBoard([]))

    void getQuizById(id)
      .then((q) => setQuizTitle(q.title))
      .catch(() => {})
  }, [id])

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Лидерборд — {quizTitle || 'квиза'}</h1>
          <p className="text-slate-300">Топ игроков по этому квизу</p>
        </div>
        <Link to="/" className="text-sm text-slate-300">Назад</Link>
      </div>

      <div className="mt-6 grid gap-3">
        {board.length === 0 && <div className="text-slate-400">Нет результатов</div>}
        {board.map((b, i) => (
          <div key={b.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-white">{i + 1}. {b.user?.email ?? b.userId}</div>
              <div className="text-sm text-slate-400">{new Date(b.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-2xl font-bold text-emerald-300">{b.score}</div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default LeaderboardPreview
