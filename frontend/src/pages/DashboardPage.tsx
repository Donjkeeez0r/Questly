import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CircleX, Eye, ShieldCheck, Swords, Timer, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LoadingScreen } from '../components/LoadingScreen'
import { getQuizLeaderboard, getQuizzes } from '../lib/quizApi'
import type { QuizForPlay } from '../types/api'
import type { Difficulty, LeaderboardEntry, QuizSummary } from '../types/api'

const difficultyStyles: Record<Difficulty, string> = {
  EASY: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40',
  MEDIUM: 'bg-amber-500/20 text-amber-200 border border-amber-400/40',
  HARD: 'bg-rose-500/20 text-rose-200 border border-rose-400/40',
}

export function DashboardPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [previewQuiz, setPreviewQuiz] = useState<QuizForPlay | null>(null)
  const [previewBoard, setPreviewBoard] = useState<LeaderboardEntry[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    async function fetchQuizzes() {
      try {
        const data = await getQuizzes()

        if (mounted) {
          setQuizzes(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void fetchQuizzes()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function fetchLeaderboard() {
      if (!previewQuiz) {
        setPreviewBoard([])
        return
      }

      setPreviewLoading(true)

      try {
        const data = await getQuizLeaderboard(previewQuiz.id)

        if (mounted) {
          setPreviewBoard(data.slice(0, 10))
        }
      } catch (error) {
        console.error(error)
        if (mounted) {
          setPreviewBoard([])
        }
      } finally {
        if (mounted) {
          setPreviewLoading(false)
        }
      }
    }

    void fetchLeaderboard()

    return () => {
      mounted = false
    }
  }, [previewQuiz])

  if (loading) {
    return <LoadingScreen title="Подгружаем арену квизов..." />
  }

  return (
    <section>
      <div className="mb-7 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-300">Dashboard</p>
        <h1 className="font-display mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl">Выбери квиз и начинай прокачку</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Переходи по карточкам, улучшай процент точности и собирай уникальные достижения.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz, index) => (
          <motion.article
            key={quiz.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            whileHover={{ y: -6 }}
            className="group rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-white">{quiz.title}</h2>
                <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-slate-400">
                  {quiz.description ?? 'Краткое описание отсутствует'}
                </p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${difficultyStyles[quiz.difficulty]}`}>
                {quiz.difficulty}
              </span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <User size={14} className="text-cyan-300" />
                Автор: {quiz.creatorId.slice(0, 6)}...
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <Timer size={14} className="text-fuchsia-300" />
                {quiz.timeLimit ? `${quiz.timeLimit} мин` : 'Без таймера'}
              </div>
            </div>

            <div className="mb-5 flex items-center gap-2 text-xs text-slate-400">
              {quiz.difficulty === 'HARD' ? <Swords size={14} /> : <ShieldCheck size={14} />}
              Игровой режим
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                onClick={() => {
                  // Open preview immediately with available summary data.
                  // Full quiz (with correct answers) requires auth; avoid protected call here.
                  setPreviewQuiz({
                    ...quiz,
                    questions: [],
                    attemptsCount: previewQuiz?.attemptsCount ?? 0,
                    achievements: [],
                  })
                }}
                type="button"
              >
                <Eye size={15} />
                Предпросмотр
              </button>

              <Link
                className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white transition group-hover:shadow-lg group-hover:shadow-fuchsia-800/40"
                to={`/quiz/${quiz.id}`}
              >
                Играть
                <ArrowRight size={15} />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>

      {quizzes.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-300 backdrop-blur-xl">
          Квизы пока не найдены.
        </div>
      ) : null}

      <AnimatePresence>
        {previewQuiz ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setPreviewQuiz(null)}
          >
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f172a] shadow-2xl shadow-black/50"
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.15),transparent_30%)]" />

              <div className="relative z-10 p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Предпросмотр квиза</p>
                    <h2 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">{previewQuiz.title}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                      {previewQuiz.description ?? 'Описание для этого квиза пока не добавлено.'}
                    </p>
                  </div>

                  <button
                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"
                    onClick={() => setPreviewQuiz(null)}
                    type="button"
                    aria-label="Закрыть предпросмотр"
                  >
                    <CircleX size={20} />
                  </button>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <article className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-xl font-bold text-white">Информация</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyStyles[previewQuiz.difficulty]}`}>
                        {previewQuiz.difficulty}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-300">
                      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <Timer size={15} className="text-cyan-300" />
                        {previewQuiz.timeLimit ? `${previewQuiz.timeLimit} минут` : 'Без таймера'}
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <User size={15} className="text-fuchsia-300" />
                        Автор: {previewQuiz.creatorId.slice(0, 8)}...
                      </div>
                    </div>

                    {previewQuiz?.achievements && previewQuiz.achievements.length > 0 ? (
                      <div className="mt-5">
                        <h4 className="font-display mb-2 text-sm font-semibold text-white">Достижения</h4>
                        <div className="flex flex-wrap gap-2">
                          {previewQuiz.achievements.map((a) => (
                            <div key={a.id} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200">
                              <span className="mr-2">{a.Icon ?? '🏆'}</span>
                              <span className="font-semibold">{a.name}</span>
                              <div className="text-xs text-slate-400">{a.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-5 flex gap-3">
                      <Link
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white"
                        to={`/quiz/${previewQuiz.id}`}
                        onClick={() => setPreviewQuiz(null)}
                      >
                        Играть
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </article>

                  <article className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-xl font-bold text-white">Лидерборд</h3>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        Топ 10
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {previewLoading ? <p className="text-sm text-slate-400">Загружаем результаты...</p> : null}

                      {!previewLoading && previewBoard.length === 0 ? (
                        <p className="text-sm text-slate-400">Пока нет прохождений для этого квиза.</p>
                      ) : null}

                      {!previewLoading
                        ? previewBoard.map((entry, index) => (
                            <div
                              key={entry.id}
                              className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                            >
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {index + 1}. {entry.user?.email ?? entry.userId}
                                </p>
                                <p className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString('ru-RU')}</p>
                              </div>
                              <div className="text-2xl font-bold text-emerald-300">{entry.score}</div>
                            </div>
                          ))
                        : null}
                    </div>
                  </article>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}