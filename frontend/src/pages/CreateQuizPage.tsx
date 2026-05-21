import { ArrowRight, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createQuiz, createAchievement } from '../lib/quizApi'
import type { Difficulty } from '../types/api'

interface DraftOption {
  id: string
  text: string
  isCorrect: boolean
}

interface DraftQuestion {
  id: string
  text: string
  hint: string
  options: DraftOption[]
}

interface DraftAchievement {
  id: string
  name: string
  description: string
  scoreRequired: number
  icon?: string
}

const newOption = (): DraftOption => ({
  id: crypto.randomUUID(),
  text: '',
  isCorrect: false,
})

const newQuestion = (): DraftQuestion => ({
  id: crypto.randomUUID(),
  text: '',
  hint: '',
  options: [newOption(), newOption()],
})

const newAchievement = (): DraftAchievement => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  scoreRequired: 70,
})

export function CreateQuizPage() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY')
  const [timeLimit, setTimeLimit] = useState<number>(10)
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion()])
  const [achievements, setAchievements] = useState<DraftAchievement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const hasCorrectAnswer = questions.every((question) => question.options.some((option) => option.isCorrect))
  const totalOptions = questions.reduce((sum, question) => sum + question.options.length, 0)
  const filledQuestions = questions.filter((question) => question.text.trim().length > 0).length

  const updateQuestion = (questionId: string, patch: Partial<DraftQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, ...patch } : q)))
  }

  const updateOption = (questionId: string, optionId: string, patch: Partial<DraftOption>) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) {
          return q
        }

        return {
          ...q,
          options: q.options.map((option) => (option.id === optionId ? { ...option, ...patch } : option)),
        }
      }),
    )
  }

  const markCorrectOption = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) {
          return q
        }

        return {
          ...q,
          options: q.options.map((option) => ({ ...option, isCorrect: option.id === optionId })),
        }
      }),
    )
  }

  const addOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, options: [...q.options, newOption()] } : q)),
    )
  }

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || q.options.length <= 2) {
          return q
        }

        return {
          ...q,
          options: q.options.filter((option) => option.id !== optionId),
        }
      }),
    )
  }

  const addQuestion = () => {
    setQuestions((prev) => [...prev, newQuestion()])
  }

  const removeQuestion = (questionId: string) => {
    setQuestions((prev) => (prev.length > 1 ? prev.filter((q) => q.id !== questionId) : prev))
  }

  const addAchievement = () => {
    setAchievements((prev) => [...prev, newAchievement()])
  }

  const removeAchievement = (achievementId: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== achievementId))
  }

  const updateAchievement = (achievementId: string, patch: Partial<DraftAchievement>) => {
    setAchievements((prev) => prev.map((a) => (a.id === achievementId ? { ...a, ...patch } : a)))
  }

  const validate = () => {
    if (!title.trim()) {
      setError('Введите название квиза')
      return false
    }

    for (const question of questions) {
      if (!question.text.trim()) {
        setError('Каждый вопрос должен содержать текст')
        return false
      }

      const hasCorrect = question.options.some((option) => option.isCorrect)

      if (!hasCorrect) {
        setError('Для каждого вопроса нужно выбрать правильный вариант')
        return false
      }

      const hasEmptyOption = question.options.some((option) => !option.text.trim())

      if (hasEmptyOption) {
        setError('У каждого варианта должен быть текст')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!validate()) {
      return
    }

    try {
      setLoading(true)

      const quiz = await createQuiz({
        title: title.trim(),
        description: description.trim() || undefined,
        difficulty,
        timeLimit,
        questions: questions.map((question) => ({
          text: question.text.trim(),
          hint: question.hint.trim() || undefined,
          options: question.options.map((option) => ({
            text: option.text.trim(),
            isCorrect: option.isCorrect,
          })),
        })),
      })

      // Создаём достижения для квиза
      for (const achievement of achievements) {
        if (achievement.name.trim() && achievement.description.trim()) {
          await createAchievement(quiz.id, {
            name: achievement.name.trim(),
            description: achievement.description.trim(),
            scoreRequired: achievement.scoreRequired,
            icon: achievement.icon,
          })
        }
      }

      setSuccess('Квиз и достижения успешно созданы!')
      setTitle('')
      setDescription('')
      setDifficulty('EASY')
      setTimeLimit(10)
      setQuestions([newQuestion()])
      setAchievements([])
    } catch (err) {
      setError('Не удалось создать квиз. Проверь данные и попробуй снова.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-6 pb-6">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(217,70,239,0.16),transparent_30%)]" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Creator Studio</p>
            <h1 className="font-display mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">Создание квиза</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Собери квиз в том же визуальном языке, что и новый creator‑раздел: стеклянные панели, яркие акценты и
              аккуратная структура без лишнего шума.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-slate-200">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">Новый вопрос за пару кликов</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">Таймер и сложность сразу в форме</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">Правильный ответ отмечается на месте</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white"
                to="/creator"
              >
                В Creator Studio
                <ArrowRight size={16} />
              </Link>
              <button
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200"
                onClick={() => navigate('/app')}
                type="button"
              >
                В кабинет
              </button>
            </div>
          </div>
        </article>

        <aside className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <article className="questly-surface p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-fuchsia-300">Вопросы</p>
            <p className="font-display mt-2 text-3xl font-bold text-white">{questions.length}</p>
            <p className="mt-1 text-sm text-slate-300">Сколько карточек попадёт в квиз</p>
          </article>
          <article className="questly-surface p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Варианты</p>
            <p className="font-display mt-2 text-3xl font-bold text-white">{totalOptions}</p>
            <p className="mt-1 text-sm text-slate-300">Общее число ответов</p>
          </article>
          <article className="questly-surface p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Готовность</p>
            <p className="font-display mt-2 text-3xl font-bold text-white">{hasCorrectAnswer ? '100%' : '0%'}</p>
            <p className="mt-1 text-sm text-slate-300">Правильные ответы отмечены</p>
          </article>
          <article className="questly-surface p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-300">Награды</p>
            <p className="font-display mt-2 text-3xl font-bold text-white">{achievements.length}</p>
            <p className="mt-1 text-sm text-slate-300">Достижений добавлено</p>
          </article>
        </aside>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-fuchsia-300">Шаг 1</p>
                  <h2 className="font-display mt-2 text-2xl font-bold text-white">Общая информация</h2>
                  <p className="mt-2 text-sm text-slate-300">Название, описание, сложность и лимит времени.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-right">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Готово вопросов</p>
                  <p className="font-display text-2xl font-bold text-white">{filledQuestions}/{questions.length}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <input
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500"
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Название квиза"
                  value={title}
                />
                <select
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-slate-100 outline-none"
                  onChange={(event) => setDifficulty(event.target.value as Difficulty)}
                  value={difficulty}
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
                <textarea
                  className="min-h-28 sm:col-span-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500"
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Описание"
                  value={description}
                />
                <input
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500"
                  min={1}
                  onChange={(event) => setTimeLimit(Number(event.target.value))}
                  type="number"
                  value={timeLimit}
                />
              </div>
            </article>

            {questions.map((question, index) => (
              <article key={question.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Шаг 2</p>
                    <h3 className="font-display mt-2 text-xl font-bold text-white">Вопрос #{index + 1}</h3>
                    <p className="mt-1 text-sm text-slate-300">Добавь текст, подсказку и отметь правильный вариант.</p>
                  </div>
                  <button
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100 disabled:opacity-60"
                    disabled={questions.length <= 1}
                    onClick={() => removeQuestion(question.id)}
                    type="button"
                  >
                    <Trash2 size={14} />
                    Удалить вопрос
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500"
                    onChange={(event) => updateQuestion(question.id, { text: event.target.value })}
                    placeholder="Текст вопроса"
                    value={question.text}
                  />

                  <input
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500"
                    onChange={(event) => updateQuestion(question.id, { hint: event.target.value })}
                    placeholder="Подсказка (опционально)"
                    value={question.hint}
                  />
                </div>

                <div className="mt-5 space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <div key={option.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                      <button
                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                          option.isCorrect
                            ? 'border border-emerald-400/50 bg-emerald-500/20 text-emerald-100'
                            : 'border border-slate-400/20 bg-slate-500/10 text-slate-300 hover:border-emerald-400/40 hover:bg-emerald-500/15'
                        }`}
                        onClick={() => markCorrectOption(question.id, option.id)}
                        type="button"
                      >
                        {option.isCorrect ? '✓ Правильный' : 'Отметить'}
                      </button>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
                        Вариант {optionIndex + 1}
                      </span>
                      <input
                        className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-slate-100 outline-none placeholder:text-slate-500"
                        onChange={(event) => updateOption(question.id, option.id, { text: event.target.value })}
                        placeholder="Вариант ответа"
                        value={option.text}
                      />
                      <button
                        className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-2 text-rose-100 disabled:opacity-60"
                        disabled={question.options.length <= 2}
                        onClick={() => removeOption(question.id, option.id)}
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm text-cyan-100"
                  onClick={() => addOption(question.id)}
                  type="button"
                >
                  <Plus size={14} />
                  Добавить вариант
                </button>
              </article>
            ))}

            <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-amber-300">Шаг 3</p>
                  <h2 className="font-display mt-2 text-2xl font-bold text-white">Достижения</h2>
                  <p className="mt-2 text-sm text-slate-300">Добавь награды за высокие баллы (опционально)</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={achievement.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-[0.22em] text-amber-300">Награда #{index + 1}</p>
                        <input
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-slate-100 outline-none placeholder:text-slate-500"
                          onChange={(event) => updateAchievement(achievement.id, { name: event.target.value })}
                          placeholder="Название награды (напр. Отличник)"
                          value={achievement.name}
                        />
                        <input
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-slate-100 outline-none placeholder:text-slate-500"
                          onChange={(event) => updateAchievement(achievement.id, { description: event.target.value })}
                          placeholder="Описание (напр. Набрал 80+ баллов)"
                          value={achievement.description}
                        />
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <input
                            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-slate-100 outline-none placeholder:text-slate-500"
                            min="0"
                            max="100"
                            onChange={(event) => updateAchievement(achievement.id, { scoreRequired: Number(event.target.value) })}
                            placeholder="Баллы (0-100)"
                            type="number"
                            value={achievement.scoreRequired}
                          />
                          <input
                            className="rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-slate-100 outline-none placeholder:text-slate-500"
                            onChange={(event) => updateAchievement(achievement.id, { icon: event.target.value })}
                            placeholder="Иконка (опционально)"
                            value={achievement.icon || ''}
                          />
                        </div>
                      </div>
                      <button
                        className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-2 text-rose-100"
                        onClick={() => removeAchievement(achievement.id)}
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100"
                onClick={addAchievement}
                type="button"
              >
                <Plus size={14} />
                Добавить достижение
              </button>
            </article>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <article className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/15 p-5 backdrop-blur-xl">
              <h3 className="font-display text-lg font-bold text-white">Готово к публикации?</h3>
              <p className="mt-2 text-sm text-slate-300">Проверь все вопросы и добавь новые перед сохранением.</p>

              <div className="mt-5 flex flex-col gap-3">
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-fuchsia-400/50 bg-fuchsia-500/20 px-4 py-3 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/30"
                  onClick={addQuestion}
                  type="button"
                >
                  <Plus size={16} />
                  Добавить вопрос
                </button>
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-60"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? 'Сохраняем...' : 'Создать квиз'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Подсказка</p>
              <h3 className="font-display mt-2 text-xl font-bold text-white">Как сделать квиз сильнее</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li>Делай названия короткими, а описание - конкретным.</li>
                <li>На каждый вопрос ставь один понятный правильный ответ.</li>
                <li>Если вопрос сложный, добавь подсказку, чтобы не потерять игроков.</li>
                <li>Сначала собери основу, потом проверяй таймер и баланс сложности.</li>
              </ul>
            </article>

            <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Публикация</p>
              <h3 className="font-display mt-2 text-xl font-bold text-white">Перед сохранением</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p>• Название заполнено</p>
                <p>• У каждого вопроса есть хотя бы 2 варианта</p>
                <p>• Отмечен правильный ответ</p>
                <p>• Таймер соответствует типу квиза</p>
              </div>
            </article>

            {error ? <p className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-100">{error}</p> : null}
            {success ? <p className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-emerald-100">{success}</p> : null}

            <button
              className="w-full rounded-2xl border border-white/15 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/5"
              onClick={() => navigate('/creator')}
              type="button"
            >
              Вернуться в Creator Studio
            </button>
          </aside>
        </div>
      </form>
    </section>
  )
}
