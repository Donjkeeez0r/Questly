import { CalendarDays, Hash, Mail, Medal, ShieldCheck, Trophy, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getCurrentUser } from '../lib/authApi'
import { LoadingScreen } from '../components/LoadingScreen'
import { getMyAchievements } from '../lib/quizApi'
import type { CurrentUser, UserAchievement } from '../types/api'

export function ProfilePage() {
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [profile, setProfile] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchAchievements() {
      try {
        const [me, data] = await Promise.all([getCurrentUser(), getMyAchievements()])

        if (mounted) {
          setProfile(me)
          setAchievements(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void fetchAchievements()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return <LoadingScreen title="Загружаем твои достижения..." />
  }

  return (
    <section>
      <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-fuchsia-300">Profile</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-white">Профиль игрока</h1>
        <p className="mt-2 text-slate-300">Твои основные данные, роль в платформе и заработанные награды.</p>
      </div>

      {profile ? (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-fuchsia-200">
              <Mail size={16} />
              <p className="text-xs uppercase tracking-[0.22em]">Почта</p>
            </div>
            <p className="mt-2 font-display text-lg font-semibold text-white">{profile.email}</p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-cyan-200">
              <ShieldCheck size={16} />
              <p className="text-xs uppercase tracking-[0.22em]">Роль</p>
            </div>
            <p className="mt-2 font-display text-lg font-semibold text-white">{profile.role}</p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-emerald-200">
              <CalendarDays size={16} />
              <p className="text-xs uppercase tracking-[0.22em]">Аккаунт создан</p>
            </div>
            <p className="mt-2 font-display text-lg font-semibold text-white">{new Date(profile.createdAt).toLocaleDateString('ru-RU')}</p>
          </article>
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-amber-200">
            <Trophy size={16} />
            <p className="text-xs uppercase tracking-[0.22em]">Достижения</p>
          </div>
          <p className="mt-2 font-display text-lg font-semibold text-white">{achievements.length}</p>
          <p className="mt-1 text-sm text-slate-400">Уже получено</p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-cyan-200">
            <Hash size={16} />
            <p className="text-xs uppercase tracking-[0.22em]">ID профиля</p>
          </div>
          <p className="mt-2 font-display text-lg font-semibold text-white">{profile?.id.slice(0, 8)}...</p>
          <p className="mt-1 text-sm text-slate-400">Внутренний идентификатор</p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-fuchsia-200">
            <Medal size={16} />
            <p className="text-xs uppercase tracking-[0.22em]">Статус</p>
          </div>
          <p className="mt-2 font-display text-lg font-semibold text-white">Активный игрок</p>
          <p className="mt-1 text-sm text-slate-400">Продолжай проходить квизы и собирать трофеи</p>
        </article>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((entry) => (
          <motion.article
            className="relative cursor-pointer rounded-3xl border border-white/10 bg-gradient-to-br from-amber-400/15 via-white/5 to-fuchsia-400/10 p-5 backdrop-blur-xl transition hover:border-amber-400/40 hover:bg-gradient-to-br hover:from-amber-400/25 hover:to-fuchsia-400/15"
            key={entry.id}
            onMouseEnter={() => setHoveredId(entry.id)}
            onMouseLeave={() => setHoveredId(null)}
            whileHover={{ y: -4 }}
          >
            <div className="mb-3 flex items-center gap-2 text-amber-200">
              <Trophy size={18} />
              <p className="font-display text-lg font-bold">{entry.achievement.name}</p>
            </div>
            <p className="text-sm text-slate-200">{entry.achievement.description}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Medal size={14} className="text-fuchsia-300" />
              Получено: {new Date(entry.createdAt).toLocaleDateString('ru-RU')}
            </div>

            {hoveredId === entry.id && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center rounded-3xl border border-emerald-400/50 bg-gradient-to-r from-emerald-500/20 to-cyan-500/15"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-1 text-center">
                  <p className="flex items-center justify-center gap-1 font-semibold text-emerald-200">
                    <Sparkles size={14} />
                    Награда разблокирована!
                  </p>
                  <p className="text-xs text-slate-300">Отличный результат!</p>
                </div>
              </motion.div>
            )}
          </motion.article>
        ))}
      </div>

      {achievements.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-300 backdrop-blur-xl">
          Пока нет достижений. Сыграй несколько квизов и возвращайся за трофеями.
        </div>
      ) : null}
    </section>
  )
}
