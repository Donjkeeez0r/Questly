import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Lightbulb } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoadingScreen } from '../components/LoadingScreen'
import { getQuizById, submitQuizAnswers } from '../lib/quizApi'
import { useQuizSessionStore } from '../store/quizSessionStore'
import type { QuizForPlay } from '../types/api'

export function QuizPlayerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const setLatestResult = useQuizSessionStore((state) => state.setLatestResult)

  const [quiz, setQuiz] = useState<QuizForPlay | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [timerNotice, setTimerNotice] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null)
  const [selectedByQuestion, setSelectedByQuestion] = useState<Record<string, string>>({})
  const hasSubmittedRef = useRef(false)

  useEffect(() => {
    let mounted = true

    async function fetchQuiz() {
      if (!id) {
        setError('Квиз не найден')
        setLoading(false)
        return
      }

      hasSubmittedRef.current = false

      try {
        const data = await getQuizById(id)

        if (mounted) {
          setQuiz(data)
          setTimeLeftSeconds(data.timeLimit && data.timeLimit > 0 ? data.timeLimit * 60 : null)
        }
      } catch (err) {
        if (mounted) {
          setError('Не удалось загрузить квиз')
        }
        console.error(err)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void fetchQuiz()

    return () => {
      mounted = false
    }
  }, [id])

  const currentQuestion = quiz?.questions[activeIndex] ?? null

  const progressPercent = !quiz?.questions.length
    ? 0
    : Math.round(((activeIndex + 1) / quiz.questions.length) * 100)

  useEffect(() => {
    if (timeLeftSeconds === null || submitting) {
      return
    }

    if (timeLeftSeconds <= 0) {
      return
    }

    const timerId = window.setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev === null || prev <= 0) {
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [timeLeftSeconds, submitting])

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedByQuestion((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const goNext = () => {
    if (!quiz) {
      return
    }

    setActiveIndex((prev) => Math.min(prev + 1, quiz.questions.length - 1))
  }

  const goPrev = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0))
  }

  const finishQuiz = useCallback(async (byTimer = false) => {
    if (!quiz || !id) {
      return
    }

    if (hasSubmittedRef.current) {
      return
    }

    try {
      hasSubmittedRef.current = true
      setSubmitting(true)

      if (byTimer) {
        setTimerNotice('Время вышло. Отправляем ответы автоматически...')
      }

      const answers = quiz.questions.map((question) => ({
        questionId: question.id,
        selectedOptionId: selectedByQuestion[question.id],
      }))

      const result = await submitQuizAnswers(id, answers)
      setLatestResult(result)
      sessionStorage.setItem(`result_${id}`, JSON.stringify(result))
      navigate(`/quiz/${id}/result`, { state: { result, quizTitle: quiz.title } })
    } catch (err) {
      hasSubmittedRef.current = false
      setError('Ошибка отправки. Попробуйте еще раз.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }, [id, navigate, quiz, selectedByQuestion, setLatestResult])

  useEffect(() => {
    if (timeLeftSeconds === null || timeLeftSeconds > 0) {
      return
    }

    if (submitting || hasSubmittedRef.current) {
      return
    }

    void finishQuiz(true)
  }, [finishQuiz, submitting, timeLeftSeconds])

  const formattedTime =
    timeLeftSeconds === null
      ? null
      : `${Math.floor(timeLeftSeconds / 60)
          .toString()
          .padStart(2, '0')}:${(timeLeftSeconds % 60).toString().padStart(2, '0')}`

  if (loading) {
    return <LoadingScreen title="Подгружаем вопросы..." />
  }

  if (!quiz || !currentQuestion) {
    return (
      <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-100">
        {error || 'Квиз не найден'}
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between gap-3 text-sm text-slate-300">
          <h1 className="font-display text-2xl font-bold text-white">{quiz.title}</h1>
          <div className="flex items-center gap-3">
            {formattedTime ? (
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-semibold ${
                  timeLeftSeconds !== null && timeLeftSeconds <= 60
                    ? 'border-rose-400/45 bg-rose-500/15 text-rose-100'
                    : 'border-cyan-400/45 bg-cyan-500/10 text-cyan-100'
                }`}
              >
                <Clock3 size={14} />
                {formattedTime}
              </span>
            ) : null}

            <span>
              Вопрос {activeIndex + 1} / {quiz.questions.length}
            </span>
          </div>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-800">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-rose-100">
          <AlertCircle size={16} />
          {error}
        </div>
      ) : null}

      {timerNotice ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-300/35 bg-amber-400/10 px-4 py-3 text-amber-100">
          <Clock3 size={16} />
          {timerNotice}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.article
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-7"
        >
          <div className="mb-5">
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-cyan-300">Question #{activeIndex + 1}</p>
            <h2 className="font-display text-2xl font-bold text-white">{currentQuestion.text}</h2>
          </div>

          {currentQuestion.hint ? (
            <div className="mb-5 flex items-start gap-2 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-3 text-sm text-fuchsia-100">
              <Lightbulb size={16} className="mt-0.5" />
              <span>{currentQuestion.hint}</span>
            </div>
          ) : null}

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedByQuestion[currentQuestion.id] === option.id

              return (
                <motion.button
                  key={option.id}
                  whileTap={{ scale: 0.99 }}
                  whileHover={{ scale: 1.01 }}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100'
                      : 'border-white/15 bg-black/25 text-slate-200 hover:border-fuchsia-400/45 hover:bg-fuchsia-500/10'
                  }`}
                  onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                  type="button"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>{option.text}</span>
                    {isSelected ? <CheckCircle2 size={16} className="text-emerald-300" /> : null}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.article>
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={activeIndex === 0}
          onClick={goPrev}
          type="button"
        >
          <ChevronLeft size={16} />
          Назад
        </button>

        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-100 transition hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={activeIndex === quiz.questions.length - 1}
            onClick={goNext}
            type="button"
          >
            Далее
            <ChevronRight size={16} />
          </button>

          <button
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={submitting}
            onClick={() => {
              void finishQuiz()
            }}
            type="button"
          >
            {submitting ? 'Отправка...' : 'Завершить квиз'}
          </button>
        </div>
      </div>
    </section>
  )
}
