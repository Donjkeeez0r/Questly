import { Link } from 'react-router-dom'
import { Trophy, Sparkles, Lightbulb, Star, Bolt, Clock3, ArrowRight, Zap, PenTool } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getQuizzes } from '../lib/quizApi'
import { useAuthStore } from '../store/authStore'
import type { QuizSummary } from '../types/api'

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export function LandingPage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([])
  const [isQuizLoading, setIsQuizLoading] = useState(true)

  const token = useAuthStore((state) => state.token)
  const isAuthenticated = Boolean(token)

  useEffect(() => {
    let mounted = true
    setIsQuizLoading(true)

    void getQuizzes()
      .then((data) => {
        if (mounted) {
          const popular = data.slice(0, 6)
          setQuizzes(popular)
        }
      })
      .catch(() => {
        if (mounted) {
          setQuizzes([])
        }
      })
      .finally(() => {
        if (mounted) setIsQuizLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const heroQuiz = quizzes[0]

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_20%_0%,var(--questly-accent-soft),transparent_38%),radial-gradient(circle_at_80%_25%,var(--questly-accent-soft-2),transparent_38%),var(--questly-bg)] text-[var(--questly-text)]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[color:var(--questly-glass)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link className="inline-flex items-center gap-2" to="/">
            <span className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/15 p-2 text-fuchsia-300">
              <Sparkles size={18} />
            </span>
            <span className="font-display text-2xl font-bold tracking-wide">Questly</span>
          </Link>

          <nav className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/app" className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white">Кабинет</Link>
                <Link to="/profile" className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200">Профиль</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200">Войти</Link>
                <Link to="/register" className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white">Регистрация</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <motion.section
          className="grid gap-8 lg:grid-cols-2"
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="space-y-6">
            <p className="inline-flex items-center gap-3 rounded-full bg-fuchsia-500/10 px-3 py-1 text-sm font-semibold text-fuchsia-300">
              <Sparkles size={16} /> Главная платформа для квизов
            </p>
            <h1 className="font-display mt-2 text-4xl font-extrabold leading-tight text-white md:text-5xl">Questly — Создавай, проходи, побеждай</h1>
            <p className="text-lg text-slate-300">Платформа для интерактивного обучения с квизами, AI-разборами и соревновательной системой.</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/app" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-3 font-semibold text-white">
                    Перейти в кабинет
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/profile" className="rounded-lg border border-white/10 px-4 py-3 text-sm text-slate-200">Мой профиль</Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-3 font-semibold text-white">
                    Зарегистрироваться
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/login" className="rounded-lg border border-white/10 px-4 py-3 text-sm text-slate-200">Войти</Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <motion.div
              className="questly-surface w-full max-w-md p-4"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.35 }}
            >
              <div className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 p-4 text-white">
                <h3 className="text-lg font-bold">Популярный квиз</h3>
                <p className="text-sm opacity-90">{heroQuiz?.title ?? 'Скоро будет доступно'}</p>
              </div>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="inline-flex items-center gap-1"><Clock3 size={14} /> Лимит</span>
                  <span>{heroQuiz?.timeLimit ? `${heroQuiz.timeLimit} мин` : 'Без лимита'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Сложность</span>
                  <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300">{heroQuiz?.difficulty ?? 'EASY'}</span>
                </div>
                <Link to={heroQuiz ? `/quiz/${heroQuiz.id}` : '/'} className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-fuchsia-500/80 px-4 py-2 font-semibold text-white">
                  Играть
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={reveal}
          transition={{ duration: 0.35 }}
        >
          <h2 className="font-display text-2xl font-bold text-white">Возможности</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="questly-surface p-4">
              <div className="flex items-center gap-3">
                <Bolt size={20} className="text-fuchsia-300" />
                <div>
                  <h3 className="font-semibold text-white">Прохождение квизов</h3>
                  <p className="text-sm text-slate-300">Интерактивные карточки и таймеры для вызова адреналина.</p>
                </div>
              </div>
            </div>

            <div className="questly-surface p-4">
              <div className="flex items-center gap-3">
                <Star size={20} className="text-amber-300" />
                <div>
                  <h3 className="font-semibold text-white">Создание квизов</h3>
                  <p className="text-sm text-slate-300">Простой конструктор для авторов и команд.</p>
                </div>
              </div>
            </div>

            <div className="questly-surface p-4">
              <div className="flex items-center gap-3">
                <Lightbulb size={20} className="text-cyan-300" />
                <div>
                  <h3 className="font-semibold text-white">Разбор от ИИ</h3>
                  <p className="text-sm text-slate-300">Персонализированный фидбек после каждой попытки.</p>
                </div>
              </div>
            </div>

            <div className="questly-surface p-4">
              <div className="flex items-center gap-3">
                <Trophy size={20} className="text-emerald-300" />
                <div>
                  <h3 className="font-semibold text-white">Лидерборд</h3>
                  <p className="text-sm text-slate-300">Сравнивай результаты и поднимайся в топ.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="mt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={reveal}
          transition={{ duration: 0.35 }}
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-white">Популярные квизы</h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isQuizLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="questly-surface p-4 animate-pulse">
                    <div className="h-5 w-3/4 rounded bg-white/10" />
                    <div className="mt-3 h-4 w-full rounded bg-white/10" />
                    <div className="mt-2 h-4 w-2/3 rounded bg-white/10" />
                    <div className="mt-4 h-9 w-full rounded bg-white/10" />
                  </div>
                ))
              : quizzes.map((q) => (
                  <motion.div key={q.id} className="questly-surface p-4" whileHover={{ y: -4 }} transition={{ duration: 0.15 }}>
                    <h3 className="font-semibold text-white">{q.title}</h3>
                    <p className="mt-1 text-sm text-slate-300">{q.description ?? 'Описание скоро появится.'}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300">{q.difficulty}</span>
                      <span className="rounded-full border border-cyan-400/30 bg-cyan-500/15 px-2 py-1 text-xs text-cyan-200">{q.timeLimit ? `${q.timeLimit} мин` : 'Без лимита'}</span>
                      <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-200">{new Date(q.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link to={`/quiz/${q.id}/leaderboard`} className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-200/90">Лидерборд</Link>
                      <Link to={`/quiz/${q.id}`} className="ml-auto rounded-lg bg-fuchsia-500/80 px-4 py-2 text-sm font-semibold text-white">Играть</Link>
                    </div>
                  </motion.div>
                ))}
          </div>

          {!isQuizLoading && quizzes.length === 0 ? (
            <div className="questly-surface mt-4 p-4 text-sm text-slate-300">Пока нет доступных квизов. Создайте первый в кабинете автора.</div>
          ) : null}
        </motion.section>

        <motion.section
          className="mt-12 grid gap-6 lg:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={reveal}
          transition={{ duration: 0.35 }}
        >
          <div className="questly-surface relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_50%)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/15 p-3">
                  <PenTool size={20} className="text-fuchsia-300" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-300">Для создателей</p>
                  <h3 className="font-display text-2xl font-bold text-white">Создавайте учебные квизы</h3>
                </div>
              </div>
              <p className="mt-4 text-slate-300">Создавайте интерактивные квизы для своих учеников, студентов или команды. Простой конструктор, мощные возможности.</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><span className="text-fuchsia-300">•</span> Добавляйте вопросы и варианты за секунды</li>
                <li className="flex items-center gap-2"><span className="text-fuchsia-300">•</span> Смотрите прогресс каждого ученика</li>
                <li className="flex items-center gap-2"><span className="text-fuchsia-300">•</span> Получайте статистику и аналитику</li>
              </ul>
              {!isAuthenticated ? (
                <Link to="/register" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white">
                  Начать создавать
                  <ArrowRight size={14} />
                </Link>
              ) : null}
            </div>
          </div>

          <div className="questly-surface relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.15),transparent_50%)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/15 p-3">
                  <Zap size={20} className="text-emerald-300" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Для игроков</p>
                  <h3 className="font-display text-2xl font-bold text-white">Тестируйте знания</h3>
                </div>
              </div>
              <p className="mt-4 text-slate-300">Проходите квизы, получайте мгновенную обратную связь от ИИ и соревнуйтесь в лидерборде.</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><span className="text-emerald-300">•</span> Выбирайте из сотен квизов</li>
                <li className="flex items-center gap-2"><span className="text-emerald-300">•</span> Получайте AI-разбор ошибок</li>
                <li className="flex items-center gap-2"><span className="text-emerald-300">•</span> Зарабатывайте достижения</li>
              </ul>
              {!isAuthenticated ? (
                <Link to="/register" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white">
                  Начать играть
                  <ArrowRight size={14} />
                </Link>
              ) : null}
            </div>
          </div>
        </motion.section>

        <motion.section
          className="mt-12 grid gap-6 lg:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={reveal}
          transition={{ duration: 0.35 }}
        >
          <div className="questly-surface p-5">
            <h2 className="font-display text-2xl font-bold text-white">Как это работает</h2>
            <ol className="mt-4 list-decimal list-inside space-y-2 text-slate-300">
              <li>Выбери квиз под текущую цель</li>
              <li>Пройди карточки и уложись во время</li>
              <li>Получи разбор ошибок от ИИ</li>
              <li>Сравни результат в лидерборде</li>
            </ol>
          </div>

          <div className="questly-surface p-5">
            <h2 className="font-display text-2xl font-bold text-white">AI-разбор после попытки</h2>
            <p className="mt-4 text-slate-300">После каждого прохождения система показывает, где вы ошиблись, почему это важно и что повторить. Это превращает обычный квиз в персональный тренажер знаний.</p>
          </div>
        </motion.section>

        <motion.section
          className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-500/15 via-cyan-500/10 to-emerald-500/15 p-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={reveal}
          transition={{ duration: 0.35 }}
        >
          <h2 className="font-display text-3xl font-bold text-white">Готов проверить себя?</h2>
          {isAuthenticated ? (
            <Link to="/app" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-3 font-semibold text-white">
              Перейти в кабинет
              <ArrowRight size={16} />
            </Link>
          ) : (
            <Link to="/register" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-3 font-semibold text-white">
              Зарегистрироваться и начать
              <ArrowRight size={16} />
            </Link>
          )}
        </motion.section>
      </main>

      <footer className="border-t border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/15 p-2 text-fuchsia-300">
                  <Sparkles size={18} />
                </span>
                <span className="font-display text-xl font-bold">Questly</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">Платформа для интерактивного обучения с квизами и ИИ-разборами.</p>
            </div>

            <div>
              <p className="font-semibold text-white">Продукт</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><Link to="/" className="hover:text-white">О платформе</Link></li>
                <li><Link to="/app" className="hover:text-white">Квизы</Link></li>
                <li><Link to="/creator" className="hover:text-white">Creator Studio</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-white">Поддержка</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><a href="mailto:support@questly.local" className="hover:text-white">support@questly.local</a></li>
                <li><a href="#" className="hover:text-white">Помощь</a></li>
                <li><a href="#" className="hover:text-white">Контакты</a></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-white">Аккаунт</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><Link to={isAuthenticated ? "/profile" : "/login"} className="hover:text-white">{isAuthenticated ? "Мой профиль" : "Вход"}</Link></li>
                <li><Link to="/register" className="hover:text-white">Регистрация</Link></li>
                <li><a href="#" className="hover:text-white">Условия использования</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-8 text-center">
            <p className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <Trophy size={14} className="text-fuchsia-300" />
              © 2026 Questly. Все права защищены. Создавай, проходи, побеждай.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
