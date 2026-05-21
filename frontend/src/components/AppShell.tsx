import { Trophy, UserCircle2, LogOut, Sparkles } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function AppShell() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const role = useAuthStore((state) => state.role)

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-fuchsia-600/25 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link className="group flex items-center gap-2" to="/app">
            <div className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 p-2 text-fuchsia-300">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Quiz Platform</p>
              <p className="font-display text-xl font-bold tracking-wide text-white">Questly</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <NavLink
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'text-slate-300' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
              to="/"
            >
              На главную
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-fuchsia-500/20 text-fuchsia-200'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
              to="/app"
            >
              Dashboard
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-fuchsia-500/20 text-fuchsia-200'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
              to="/profile"
            >
              <UserCircle2 size={16} />
              Profile
            </NavLink>
            {role === 'CREATOR' ? (
              <NavLink
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-100'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
                to="/creator"
              >
                Creator Studio
              </NavLink>
            ) : null}
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-fuchsia-400/50 hover:bg-fuchsia-500/10"
              onClick={handleLogout}
              type="button"
            >
              <LogOut size={16} />
              Выйти
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="mx-auto mb-6 mt-8 flex w-full max-w-6xl items-center justify-center gap-2 px-4 text-xs text-slate-500 sm:px-6">
        <Trophy size={14} className="text-fuchsia-300" />
        Играй, прокачивайся, собирай трофеи
      </footer>
    </div>
  )
}
