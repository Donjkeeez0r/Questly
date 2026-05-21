import { motion } from 'framer-motion'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteQuiz, getQuizzes } from '../lib/quizApi'
import { useAuthStore } from '../store/authStore'
import type { Difficulty, QuizSummary } from '../types/api'

const difficultyStyles: Record<Difficulty, string> = {
  EASY: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40',
  MEDIUM: 'bg-amber-500/20 text-amber-200 border border-amber-400/40',
  HARD: 'bg-rose-500/20 text-rose-200 border border-rose-400/40',
}

export function CreatorQuizzesPanel() {
  const userId = useAuthStore((state) => state.userId)
  const role = useAuthStore((state) => state.role)

  const [quizzes, setQuizzes] = useState<QuizSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionQuizId, setActionQuizId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      if (role !== 'CREATOR' || !userId) {
        if (mounted) setLoading(false)
        return
      }

      try {
        const data = await getQuizzes()
        if (mounted) setQuizzes(data.filter((quiz) => quiz.creatorId === userId))
      } catch (err) {
        console.error(err)
        if (mounted) setError('Не удалось загрузить ваши квизы')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [role, userId])

  const refresh = async () => {
    if (role !== 'CREATOR' || !userId) return
    const data = await getQuizzes()
    setQuizzes(data.filter((quiz) => quiz.creatorId === userId))
  }

  const handleDelete = async (quizId: string) => {
    if (!window.confirm('Удалить квиз? Это действие нельзя отменить.')) return

    try {
      setActionQuizId(quizId)
      setError('')
      await deleteQuiz(quizId)
      await refresh()
    } catch (err) {
      console.error(err)
      setError('Не удалось удалить квиз')
    } finally {
      setActionQuizId(null)
    }
  }

  if (role !== 'CREATOR') {
    return null
  }

  return (
    <motion.section
      className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Creator tools</p>
          <h2 className="font-display mt-2 text-2xl font-bold text-white">Мои квизы</h2>
          <p className="mt-1 text-sm text-slate-300">Здесь видны ваши квизы, и прямо отсюда можно редактировать или удалять их.</p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white"
          to="/quiz/create"
        >
          <Plus size={16} />
          Создать квиз
        </Link>
      </div>

      {error ? <p className="mb-3 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-100">{error}</p> : null}
      {loading ? <p className="text-slate-300">Загружаем ваши квизы...</p> : null}
      {!loading && quizzes.length === 0 ? <p className="text-slate-300">У вас пока нет своих квизов.</p> : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {quizzes.map((quiz) => {
          const isBusy = actionQuizId === quiz.id

          return (
            <article key={quiz.id} className="flex h-full flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-black/20 p-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{quiz.title}</h3>
                    <p className="mt-1 text-sm text-slate-300">{quiz.description ?? 'Без описания'}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${difficultyStyles[quiz.difficulty]}`}>
                    {quiz.difficulty}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1">
                    {quiz.timeLimit ? `${quiz.timeLimit} мин` : 'Без таймера'}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1">ID: {quiz.id.slice(0, 8)}...</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100"
                  to={`/quiz/${quiz.id}/edit`}
                >
                  <Pencil size={14} />
                  Редактировать
                </Link>
                <button
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-100 disabled:opacity-60"
                  disabled={isBusy}
                  onClick={() => void handleDelete(quiz.id)}
                  type="button"
                >
                  <Trash2 size={14} />
                  {isBusy ? 'Удаляем...' : 'Удалить'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </motion.section>
  )
}
