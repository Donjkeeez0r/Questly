import { Link } from 'react-router-dom'
import { CreatorQuizzesPanel } from '../components/CreatorQuizzesPanel'

export function CreatorStudioPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Creator Studio</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-white">Управление квизами</h1>
        <p className="mt-2 max-w-3xl text-slate-300">
          Здесь собраны твои квизы, их можно редактировать, удалять и сразу переходить к созданию нового.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white"
            to="/quiz/create"
          >
            Создать квиз
          </Link>
          <Link className="inline-flex items-center rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200" to="/app">
            В кабинет
          </Link>
        </div>
      </div>

      <CreatorQuizzesPanel />
    </section>
  )
}

export default CreatorStudioPage