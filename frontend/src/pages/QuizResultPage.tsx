import { Trophy, Bot, LoaderCircle, Crown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { ResultRing } from '../components/ResultRing'
import { TypewriterText } from '../components/TypewriterText'
import { getAiFeedback, getQuizLeaderboard } from '../lib/quizApi'
import type { LeaderboardEntry, SubmitResult } from '../types/api'

interface ResultLocationState {
  result?: SubmitResult
  quizTitle?: string
}

export function QuizResultPage() {
  const location = useLocation()
  const { id } = useParams()

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [feedback, setFeedback] = useState('')
  const [loadingAi, setLoadingAi] = useState(false)

  const state = location.state as ResultLocationState | null

  let result: SubmitResult | null = null

  if (state?.result) {
    result = state.result
  } else if (id) {
    const raw = sessionStorage.getItem(`result_${id}`)

    if (raw) {
      try {
        result = JSON.parse(raw) as SubmitResult
      } catch {
        result = null
      }
    }
  }

  if (!result) {
    result = null
  }

  useEffect(() => {
    if (!id) {
      return
    }

    const quizId = id

    async function fetchLeaderboard() {
      try {
        const data = await getQuizLeaderboard(quizId)
        setLeaderboard(data)
      } catch (error) {
        console.error(error)
      }
    }

    void fetchLeaderboard()
  }, [id])

  const loadAiFeedback = async () => {
    if (!result?.attemptId) {
      return
    }

    try {
      setLoadingAi(true)
      const data = await getAiFeedback(result.attemptId)
      setFeedback(data.feedback)
    } catch (error) {
      setFeedback('ИИ временно недоступен. Попробуй немного позже.')
      console.error(error)
    } finally {
      setLoadingAi(false)
    }
  }

  if (!result) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-200 backdrop-blur-xl">
        Данные результата не найдены. Пройди квиз заново.
      </div>
    )
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-7">
          <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-300">Результат</p>
          <h1 className="font-display mt-3 text-3xl font-extrabold text-white">
            {state?.quizTitle ? `Итоги: ${state.quizTitle}` : 'Итоги прохождения'}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <ResultRing value={result.score} />
            <div className="space-y-2 text-slate-300">
              <p>
                Правильных ответов: <span className="font-semibold text-emerald-300">{result.correctCount}</span> /{' '}
                {result.totalQuestions}
              </p>
              <p>
                Попытка: <span className="text-cyan-300">{result.attemptId.slice(0, 8)}...</span>
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
          <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold text-white">
            <Trophy size={20} className="text-amber-300" />
            Твои новые достижения!
          </h2>

          {result.newAchievements.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {result.newAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="rounded-2xl border border-amber-400/35 bg-amber-400/10 p-4 text-amber-100"
                >
                  <p className="text-xl">🏆 {achievement.name}</p>
                  <p className="mt-1 text-sm text-amber-200/90">{achievement.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-300">Пока нет новых достижений. Следующая попытка может всё изменить!</p>
          )}
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
          <h2 className="font-display mb-4 text-xl font-bold text-white">Разбор от ИИ</h2>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loadingAi}
            onClick={loadAiFeedback}
            type="button"
          >
            {loadingAi ? <LoaderCircle size={16} className="animate-spin" /> : <Bot size={16} />}
            {loadingAi ? 'Генерируем...' : 'Разбор от ИИ'}
          </button>

          <div className="mt-4 min-h-[90px] rounded-2xl border border-white/10 bg-black/20 p-4">
            {feedback ? (
              <TypewriterText key={feedback} text={feedback} />
            ) : (
              <p className="text-sm text-slate-400">Нажми кнопку, чтобы получить персональный фидбек.</p>
            )}
          </div>
        </article>
      </div>

      <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
        <h2 className="font-display mb-4 flex items-center gap-2 text-xl font-bold text-white">
          <Crown size={20} className="text-fuchsia-300" />
          Лидерборд Top-10
        </h2>

        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-100">
                  #{index + 1} {entry.user.email}
                </p>
                <p className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
              <p className="font-semibold text-emerald-300">{entry.score}%</p>
            </div>
          ))}
        </div>

        {leaderboard.length === 0 ? <p className="text-sm text-slate-400">Данные лидерборда пока отсутствуют.</p> : null}
      </aside>
    </section>
  )
}
